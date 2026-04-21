/**
 * memory.js
 * Shared in-memory store for the entire multi-agent pipeline.
 * Each agent writes its output here; subsequent agents read from it.
 */

// The memory store is a simple array of { agent, output } records
const _store = [];

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
 * buildContext — serialises the full memory into a readable string
 * that can be injected into subsequent agent prompts.
 *
 * @returns {string}
 */
export function buildContext() {
  if (_store.length === 0) return "No prior context.";
  return _store
    .map((r) => `[${r.agent}]:\n${r.output}`)
    .join("\n\n---\n\n");
}

/**
 * clear — wipes the memory store (useful between sessions).
 */
export function clear() {
  _store.length = 0;
}
