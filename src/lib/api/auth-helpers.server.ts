// Server-only helper: validates a Supabase bearer token from the request
// Authorization header and returns { userId } or a 401 Response.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuthOk = { ok: true; userId: string };
export type AuthErr = { ok: false; response: Response };

/**
 * Validate the request's bearer token. Use at the top of every /api/* handler
 * that must be authenticated. Returns { ok: false, response } to short-circuit.
 *
 * Usage:
 *   const auth = await requireBearer(request);
 *   if (!auth.ok) return auth.response;
 *   const userId = auth.userId;
 */
export async function requireBearer(request: Request): Promise<AuthOk | AuthErr> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    };
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    };
  }
  return { ok: true, userId: data.user.id };
}
