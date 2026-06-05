// Transmit Assessment — server route.
//
// One agent per request so the browser can fan out 4 parallel calls and
// stream per-agent status into the UI (instead of waiting for the slowest
// of four to finish on a single response).
//
// Real path: Groq Chat Completions API
//   POST https://api.groq.com/openai/v1/chat/completions
//   Authorization: Bearer <GROQ_xxx_KEY>
// Each agent has its own env var key (per spec) so a missing one degrades
// only that agent — the others still run live.
//
// Fallback path: if the env var for an agent is absent, we return a
// realistic mock AgentResult (see src/lib/analysis/mock.ts). This keeps
// the demo functional before keys are wired.

import { createFileRoute } from "@tanstack/react-router";
import { agentMeta, type AgentId, type AgentResult } from "@/lib/analysis/types";
import { PROMPTS } from "@/lib/analysis/prompts";
import { mockAgentResult } from "@/lib/analysis/mock";

const TIMEOUT_MS = 60_000;
const MAX_INPUT_CHARS = 60_000; // safety cap before token limits

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAgentId(x: unknown): x is AgentId {
  return x === "finance" || x === "operations" || x === "compliance" || x === "strategy";
}

function safeParseJson(raw: string): unknown {
  // Models occasionally wrap JSON in ```json fences despite instructions.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Extract the first balanced {...} block as a last resort.
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new Error("Agent did not return valid JSON");
  }
}

function coerceResult(agent: AgentId, model: string, parsed: unknown): AgentResult {
  const obj = (parsed ?? {}) as Record<string, unknown>;
  const anomaliesRaw = Array.isArray(obj.anomalies) ? obj.anomalies : [];
  const insightsRaw = Array.isArray(obj.insights) ? obj.insights : [];
  const conf = typeof obj.confidence === "number" ? obj.confidence : 0.5;
  return {
    agent,
    model,
    mocked: false,
    confidence: Math.max(0, Math.min(1, conf)),
    insights: insightsRaw.slice(0, 5).map((s) => String(s)),
    anomalies: anomaliesRaw.slice(0, 6).map((a) => {
      const x = (a ?? {}) as Record<string, unknown>;
      const sev = String(x.severity ?? "medium").toLowerCase();
      return {
        type: String(x.type ?? "finding"),
        description: String(x.description ?? ""),
        evidence: String(x.evidence ?? ""),
        severity: sev === "high" || sev === "low" ? (sev as "high" | "low") : "medium",
        fix: String(x.fix ?? x.suggested_fix ?? ""),
      };
    }),
  };
}

async function callGroq(agent: AgentId, text: string): Promise<AgentResult> {
  console.log(`[server.callGroq] Starting for agent: ${agent}`);
  
  const meta = agentMeta(agent);
  console.log(`[server.callGroq] Agent meta:`, { agent, model: meta.model, envKey: meta.envKey });
  
  // Agent-specific key first, then a shared fallback (GROQ_API_KEY) so a
  // single key can power all four agents during early demos.
  const agentSpecificKey = process.env[meta.envKey];
  const fallbackKey = process.env.GROQ_API_KEY;
  const key = agentSpecificKey ?? fallbackKey;
  
  console.log(`[server.callGroq] API key check:`, {
    agent,
    hasAgentSpecificKey: !!agentSpecificKey,
    hasFallbackKey: !!fallbackKey,
    usingKey: !!key,
  });
  
  if (!key) {
    console.log(`[server.callGroq] No API key found, returning mock result for ${agent}`);
    return mockAgentResult(agent, text);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    console.log(`[server.callGroq] Calling Groq API for ${agent}...`);
    
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: meta.model,
        // response_format json_object is supported on Groq for these models
        // and dramatically improves parse reliability.
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: PROMPTS[agent] },
          { role: "user", content: text.slice(0, MAX_INPUT_CHARS) },
        ],
      }),
    });
    
    console.log(`[server.callGroq] Groq API response for ${agent}:`, {
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
    });
    
    if (!res.ok) {
      const body = await res.text();
      const errorMsg = `Groq ${res.status}: ${body.slice(0, 200)}`;
      console.error(`[server.callGroq] Groq API error for ${agent}:`, errorMsg);
      throw new Error(errorMsg);
    }
    
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    
    console.log(`[server.callGroq] Groq response parsed for ${agent}:`, {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length ?? 0,
    });
    
    const content = data.choices?.[0]?.message?.content ?? "";
    console.log(`[server.callGroq] Content length for ${agent}:`, content.length);
    
    const parsed = safeParseJson(content);
    console.log(`[server.callGroq] Successfully parsed JSON for ${agent}`);
    
    const result = coerceResult(agent, meta.model, parsed);
    console.log(`[server.callGroq] Coerced result for ${agent}:`, {
      mocked: result.mocked,
      anomalies: result.anomalies.length,
      insights: result.insights.length,
      confidence: result.confidence,
    });
    
    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[server.callGroq] Exception caught for ${agent}:`, {
      error: errorMsg,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log(`[api.analyze] POST request started`);
        
        let body: { agent?: unknown; text?: unknown };
        try {
          body = (await request.json()) as typeof body;
          console.log(`[api.analyze] Request body parsed:`, {
            agent: body.agent,
            textLength: typeof body.text === "string" ? body.text.length : "not a string",
          });
        } catch (err) {
          console.error(`[api.analyze] Failed to parse request body:`, err);
          return json({ success: false, error: "Invalid JSON body" }, 400);
        }
        
        const { agent, text } = body;
        
        if (!isAgentId(agent)) {
          console.warn(`[api.analyze] Invalid agent ID:`, agent);
          return json({ success: false, error: "Unknown agent" }, 400);
        }
        
        if (typeof text !== "string" || text.trim().length < 10) {
          console.warn(`[api.analyze] Invalid text for agent ${agent}:`, {
            isString: typeof text === "string",
            length: typeof text === "string" ? text.length : 0,
          });
          return json({ success: false, error: "Text input too short to analyse" }, 400);
        }
        
        try {
          console.log(`[api.analyze] Calling Groq for agent: ${agent}`);
          const result = await callGroq(agent, text);
          console.log(`[api.analyze] Successfully got result for ${agent}`);
          return json({ success: true, result });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Agent failed";
          console.error(`[api.analyze] Error calling Groq for ${agent}:`, {
            error: msg,
            stack: err instanceof Error ? err.stack : undefined,
          });
          return json({ success: false, error: msg }, 502);
        }
      },
    },
  },
});
