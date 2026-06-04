/**
 * hulk.js — Engineer Agent
 *
 * Role: Code Writer / Implementer
 * Hulk receives the architecture blueprint and writes clean,
 * modular, production-ready implementation code.
 *
 * v2: Stateful Chunking mode.
 * For large projects, Hulk writes one file at a time instead of dumping
 * everything in a single LLM call, preventing output token overflow.
 */

import { callGroq } from "../core/llmClient.js";

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are Bruce Banner (The Hulk) — the unstoppable Senior Software Engineer of STARKNET AI. 
You transform Iron Man's blueprints into indestructible, production-ready implementation code.

Your Directives:
1. Ruthless Execution: Write the code. All of it. No abstractions, no placeholders, no "TODOs". 
2. Code Purity: 
   - Use strict ES Modules (import/export).
   - Enforce rigorous typings or JSDoc.
   - Implement impenetrable error boundaries natively (try/catch wraps, graceful degradation).
3. Dependency Awareness: Ensure all third-party libraries invoked are standard and implicitly context-relevant.
4. Auto-Runnable: The emitted code must be directly executable without human intervention.

Output format (STRICT):
IMPLEMENTATION OVERRIDE
=======================
<Generate EVERY required file accurately, separated by the strict markers below.>

--- FILE: <path/filename.ext> ---
<full, raw, unescaped code for this specific file, no markdown backticks>
--- END FILE ---

--- EXECUTION COMMAND ---
<Exact terminal command to bootstrap this code (e.g., node src/index.js)>
--- END COMMAND ---

No apologies. No explanations. Only pure, functional, optimized code.
`.trim();

/**
 * Prompt for chunked mode — Hulk writes ONE specific file per call.
 */
const CHUNK_SYSTEM_PROMPT = `
You are Bruce Banner (The Hulk) — STARKNET AI Senior Engineer.
You are writing ONE specific file from a larger project blueprint.

Rules:
1. Write ONLY the file specified in the request — nothing else.
2. The file must be complete, production-ready, and runnable.
3. No markdown fences, no backticks around the code.
4. Use the exact format below:

--- FILE: <path/filename.ext> ---
<full file content here>
--- END FILE ---
`.trim();

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * run — standard single-call implementation (for smaller projects).
 *
 * @param {string} architecture  - Output from Iron Man.
 * @param {string} missionPlan   - Output from Nick Fury.
 * @param {string} originalTask  - The original user task.
 * @returns {Promise<string>} - Full implementation code.
 */
export async function run(architecture, missionPlan, originalTask) {
  const message = `
Original Task:
${originalTask}

Mission Plan (Nick Fury):
${missionPlan}

Architecture Blueprint (Iron Man):
${architecture}

Now write the complete implementation code.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}

/**
 * runChunked — stateful chunking mode for large projects.
 *
 * Extracts the file list from the architecture blueprint, then calls the LLM
 * once per file. This ensures we never hit the output token limit even when
 * a project has 20+ files.
 *
 * @param {string}   architecture  - Iron Man's blueprint (must include file tree).
 * @param {string}   missionPlan   - Nick Fury's plan.
 * @param {string}   originalTask  - Original user task.
 * @param {Function} onChunk       - Callback: (fileIndex, fileName, total) => void
 * @returns {Promise<string>}      - Combined output of all files concatenated.
 */
export async function runChunked(architecture, missionPlan, originalTask, onChunk = () => {}) {
  // 1. Extract file list from blueprint
  const fileListPrompt = `
From the architecture blueprint below, extract ONLY the list of files that need to be created.
Return ONLY a JSON array of strings with file paths, nothing else.
Example: ["src/index.js", "src/db.js", "package.json"]

Architecture Blueprint:
${architecture}
`.trim();

  let files = [];
  try {
    const rawList = await callGroq(
      "You are a file path extractor. Return ONLY valid JSON arrays of file path strings.",
      fileListPrompt
    );
    // Extract JSON array from response (LLM may add prose)
    const jsonMatch = rawList.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      files = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back to single-call mode
    return await run(architecture, missionPlan, originalTask);
  }

  if (!files.length) {
    return await run(architecture, missionPlan, originalTask);
  }

  // 2. Write each file one at a time
  const outputs = [];
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    onChunk(i, fileName, files.length);

    const chunkMessage = `
Write the file: ${fileName}

Project Context:
Task: ${originalTask}

Mission Plan:
${missionPlan.substring(0, 1500)}

Architecture:
${architecture.substring(0, 2000)}
`.trim();

    try {
      const fileOutput = await callGroq(CHUNK_SYSTEM_PROMPT, chunkMessage);
      outputs.push(fileOutput);
    } catch (err) {
      outputs.push(
        `--- FILE: ${fileName} ---\n// [HULK ERROR] Failed to generate: ${err.message}\n--- END FILE ---`
      );
    }
  }

  return `IMPLEMENTATION OVERRIDE (CHUNKED — ${files.length} files)\n=======================\n\n` +
    outputs.join("\n\n");
}
