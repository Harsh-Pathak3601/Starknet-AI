/**
 * memory.js
 * Shared in-memory store for the entire multi-agent pipeline.
 * Each agent writes its output here; subsequent agents read from it.
 *
 * v2: Integrates with contextManager for sliding-window token safety.
 */

import { buildSmartContext, getTokenStats } from "./contextManager.js";

// The memory store is a simple array of { agent, output, timestamp } records
const _store = [];

// Holds a reference to Nick Fury's condense() — injected at runtime to avoid
// circular imports (nickFury → memory → nickFury).
let _condenser = null;

/**
 * setCondenser — registers Nick Fury's condense function so memory can
 * trigger summarisation when the context window fills up.
 *
 * Call this once in orchestrator.js after importing both modules.
 *
 * @param {Function} fn  - Async function (store) => string.
 */
export function setCondenser(fn) {
  _condenser = fn;
}

/**
 * append — records an agent's output into shared memory.
 *
 * @param {string} agent  - Human-readable agent name (e.g., "Nick Fury").
 * @param {string} output - The raw text output produced by the agent.
 */
export function append(agent, output) {
  _store.push({ agent, output, timestamp: new Date().toISOString() });
}

/**
 * getAll — returns every memory record in insertion order.
 *
 * @returns {Array<{agent: string, output: string, timestamp: string}>}
 */
export function getAll() {
  return [..._store];
}

/**
 * getLast — returns the most recent memory record.
 *
 * @returns {{agent: string, output: string, timestamp: string} | undefined}
 */
export function getLast() {
  return _store[_store.length - 1];
}

/**
 * getByAgent — returns all records produced by a specific agent.
 *
 * @param {string} agent
 * @returns {Array}
 */
export function getByAgent(agent) {
  return _store.filter((r) => r.agent === agent);
}

/**
 * buildContext — smart context builder.
 * Applies sliding window + optional Nick Fury condensation to stay
 * within the LLM's token budget.
 *
 * @returns {Promise<string>}
 */
export async function buildContext() {
  return await buildSmartContext(_store, _condenser);
}

/**
 * buildContextSync — lightweight sync version that skips condensation.
 * Use only when you cannot await (e.g., inside a synchronous callback).
 *
 * @returns {string}
 */
export function buildContextSync() {
  if (_store.length === 0) return "No prior context.";
  return _store
    .map((r) => `[${r.agent}]:\n${r.output}`)
    .join("\n\n---\n\n");
}

/**
 * getStats — returns token usage stats for the current memory store.
 *
 * @returns {{ used: number, limit: number, percent: number }}
 */
export function getStats() {
  return getTokenStats(buildContextSync());
}

/**
 * clear — wipes the memory store (useful between sessions).
 */
export function clear() {
  _store.length = 0;
  _condenser    = null;
}
