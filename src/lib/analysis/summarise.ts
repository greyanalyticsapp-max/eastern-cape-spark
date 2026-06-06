// Lightweight, dependency-free local summariser for Transmit Assessment.
//
// Why this exists:
//   Groq's free-tier TPM limits (6k–8k) are smaller than the request size
//   when we send the full extracted text. We pre-process the text BEFORE
//   sending so each agent stays inside its model's TPM ceiling without
//   altering the agent prompts or the analysis flow.
//
// Strategy:
//   1. Always keep the head of the document (table headers, intro context).
//   2. Always keep the tail (totals, signatures, summaries).
//   3. Pull "signal" lines from the middle: anything containing ZAR/USD
//      amounts, dates, IDs (invoice/EFT/VAT numbers), and key financial
//      keywords. These are the lines an auditor would re-read first.
//   4. De-duplicate and reassemble within a character budget.
//
// We use a conservative ~4 chars/token heuristic. Real tokenisers vary
// per model; staying well below the limit is more important than
// perfectly maximising it.

const APPROX_CHARS_PER_TOKEN = 4;

/** Convert a desired token budget into a char budget. */
export function tokensToChars(tokens: number): number {
  return tokens * APPROX_CHARS_PER_TOKEN;
}

/** Crude token estimate — purely for client-side gating. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

const SIGNAL_PATTERNS: RegExp[] = [
  /\bR\s?[\d.,]+/i,                       // ZAR amounts: R12,480 / R 12 480.00
  /\b(USD|ZAR|EUR|GBP)\s?[\d.,]+/i,       // currency-prefixed amounts
  /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/,      // ISO-ish dates
  /\b\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/ ]?\d{0,4}\b/i,
  /\b(invoice|inv|eft|ref|po|vat|paye|uif|sdl|emp201|emp501|vat201|coida)\b/i,
  /\b(total|subtotal|balance|due|paid|overdue|discount|refund|debit|credit)\b/i,
  /\b\d+\s*(hours|hrs|units|kg|litres?)\b/i,
];

function isSignalLine(line: string): boolean {
  return SIGNAL_PATTERNS.some((rx) => rx.test(line));
}

/**
 * Reduce `text` so that its character count fits inside `maxChars`.
 * Returns the original text unchanged when it already fits.
 *
 * Reserve ~25% of the budget for the head, ~15% for the tail, and use the
 * rest for the most informative middle lines.
 */
export function summariseForAgent(text: string, maxChars: number): { text: string; reduced: boolean } {
  if (text.length <= maxChars) return { text, reduced: false };

  const headBudget = Math.floor(maxChars * 0.25);
  const tailBudget = Math.floor(maxChars * 0.15);
  const middleBudget = maxChars - headBudget - tailBudget - 200; // 200 chars for separators/notes

  const head = text.slice(0, headBudget);
  const tail = text.slice(-tailBudget);

  // Pull signal lines strictly from the middle slice so we don't double-count
  // content already preserved in head/tail.
  const middleRaw = text.slice(headBudget, text.length - tailBudget);
  const lines = middleRaw.split(/\r?\n/);

  const picked: string[] = [];
  const seen = new Set<string>();
  let used = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.length < 3) continue;
    if (!isSignalLine(line)) continue;
    if (seen.has(line)) continue;
    if (used + line.length + 1 > middleBudget) break;
    seen.add(line);
    picked.push(line);
    used += line.length + 1;
  }

  const condensed = [
    head.trim(),
    "\n\n[... document condensed by Grey Analytics local summariser to fit model TPM. Key signal lines below ...]\n",
    picked.join("\n"),
    "\n\n[... end of condensed middle ...]\n\n",
    tail.trim(),
  ].join("");

  return { text: condensed, reduced: true };
}
