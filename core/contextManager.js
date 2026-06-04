/**
 * contextManager.js
 * Smart context builder for the multi-agent pipeline.
 *
 * Solves the #1 failure mode of large projects: token limit exceeded.
 *
 * Strategy:
 *  1. Estimate token count (heuristic: 1 token ≈ 4 characters).
 *  2. Apply a sliding window — drop the oldest memory entries first.
 *  3. If still over budget, trigger Nick Fury's condense() to summarise.
 *  4. Always preserve the most recent entry (the immediately prior agent).
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * CONTEXT_TOKEN_LIMIT — max tokens we allow in the context string passed to
 * any single agent call. Groq LLaMA 3 70B has a 128k context window, but we
 * leave headroom for the system prompt + new output (8k tokens each).
 * Default: 90,000 tokens → ~360,000 chars.
 */
const CONTEXT_TOKEN_LIMIT = parseInt(process.env.CONTEXT_TOKEN_LIMIT ?? "90000", 10);

/**
 * SUMMARISE_THRESHOLD — fraction of the limit at which we trigger summarisation.
 * When total context hits 60% of the limit we ask Nick Fury to condense it.
 */
const SUMMARISE_THRESHOLD = 0.60;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * estimateTokens — rough token count for a string.
 * Rule of thumb: 1 token ≈ 4 English characters.
 *
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  return Math.ceil((text ?? "").length / 4);
}

/**
 * formatEntry — converts a memory record into the standard context block.
 *
 * @param {{ agent: string, output: string }} record
 * @returns {string}
 */
function formatEntry({ agent, output }) {
  return `[${agent}]:\n${output}`;
}

// ─── Core export ──────────────────────────────────────────────────────────────

/**
 * buildSmartContext — constructs the context string for an agent call.
 *
 * @param {Array<{ agent: string, output: string, timestamp: string }>} store
 *   All memory records in insertion order.
 * @param {Function|null} condenser
 *   Optional async function (store) => string that summarises the records.
 *   Typically Nick Fury's condense() export.
 * @returns {Promise<string>}
 */
export async function buildSmartContext(store, condenser = null) {
  if (store.length === 0) return "No prior context.";

  // ── 1. Check if we're under the limit (happy path) ──────────────────────
  const fullContext = store.map(formatEntry).join("\n\n---\n\n");
  const totalTokens = estimateTokens(fullContext);

  if (totalTokens <= CONTEXT_TOKEN_LIMIT) {
    return fullContext;
  }

  // ── 2. Over limit — apply sliding window ────────────────────────────────
  // Always keep the last entry (most recent agent output) — never drop it.
  console.warn(
    `\n  [contextManager] ⚠ Context (${totalTokens} tokens) exceeds limit ` +
    `(${CONTEXT_TOKEN_LIMIT}). Applying sliding window...`
  );

  let windowedStore = [...store];

  // Drop from the front (oldest entries) until we're under budget
  while (windowedStore.length > 1) {
    const candidate = windowedStore.map(formatEntry).join("\n\n---\n\n");
    if (estimateTokens(candidate) <= CONTEXT_TOKEN_LIMIT) break;
    windowedStore.shift(); // Drop the oldest record
  }

  // ── 3. Still over limit AND we have a condenser? Summarise ─────────────
  const windowedContext = windowedStore.map(formatEntry).join("\n\n---\n\n");

  if (
    estimateTokens(windowedContext) > CONTEXT_TOKEN_LIMIT * SUMMARISE_THRESHOLD &&
    condenser
  ) {
    console.warn(
      `  [contextManager] 🧠 Triggering Nick Fury memory condensation...`
    );
    try {
      const summary = await condenser(windowedStore);
      const summarisedBlock =
        `[MEMORY CONDENSED BY NICK FURY — ${new Date().toISOString()}]:\n${summary}`;

      const lastEntry = formatEntry(store[store.length - 1]);
      return `${summarisedBlock}\n\n---\n\n${lastEntry}`;
    } catch (err) {
      console.error(`  [contextManager] Condensation failed: ${err.message}`);
      // Fall through — return windowed context as-is
    }
  }

  return windowedContext;
}

/**
 * isApproachingLimit — returns true when the given context is close to
 * triggering the sliding window. Use this to warn agents proactively.
 *
 * @param {string} contextString
 * @returns {boolean}
 */
export function isApproachingLimit(contextString) {
  return estimateTokens(contextString) > CONTEXT_TOKEN_LIMIT * SUMMARISE_THRESHOLD;
}

/**
 * getTokenStats — returns token usage info for logging / CLI display.
 *
 * @param {string} contextString
 * @returns {{ used: number, limit: number, percent: number }}
 */
export function getTokenStats(contextString) {
  const used    = estimateTokens(contextString);
  const limit   = CONTEXT_TOKEN_LIMIT;
  const percent = Math.round((used / limit) * 100);
  return { used, limit, percent };
}
