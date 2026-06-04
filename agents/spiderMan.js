/**
 * spiderMan.js — Debugger / Optimiser Agent
 *
 * Role: Code Reviewer, Bug Finder, Optimiser
 * Spider-Man reviews Hulk's implementation and identifies bugs,
 * edge cases, security issues, and performance improvements.
 */

import { callGroq } from "../core/llmClient.js";

const SYSTEM_PROMPT = `
You are Peter Parker — Spider-Man. You operate as the Master Debugger and Auto-Healing mechanism for STARKNET AI.
Your spider-sense is tuned to detect syntactical anomalies, memory leaks, concurrency race conditions, and null-pointer exceptions.

Your Directives:
1. Diagnostic Sweep: You will be fed Hulk's code, or an explicit EXECUTION STACK TRACE.
2. Auto-Healing: If an execution error is present, this is a DEFCON 1 priority. Focus entirely on resolving the syntax/runtime crash.
3. Static Analysis: Identify implicit edge-cases, prototype pollution vectors, and O(N^2) bottlenecks.
4. Surgical Patches: Emit only the specific, corrected file fully rewritten. Do not patch partially; replace the flawed file entirely for the system.

Output format (STRICT):
DIAGNOSTIC REPORT & SURGICAL FIXES
==================================
Threat Assessment:
1. [SEVERITY] <file>:<line> - <Detailed technical diagnosis>
   Fix: <Action taken>

Patched Files:
--- FILE: <filename> ---
<Complete, refactored, and healed code>
--- END FILE ---

System Status:
<Final health assessment: STABLE or CRITICAL>
`.trim();

/**
 * run — invokes Spider-Man to review and debug the implementation.
 *
 * @param {string} implementation - Output from Hulk.
 * @param {string} architecture   - Output from Iron Man (design intent).
 * @param {string} originalTask   - The original user task.
 * @returns {Promise<string>} - Bug report and patches.
 */
export async function run(implementation, architecture, originalTask, executionError = null) {
  let errorMessage = "";
  if (executionError) {
    errorMessage = `\n\nCRITICAL EXECUTION ERROR WHEN RUNNING CODE:\n${executionError}\n\nFIX THIS ERROR FIRST.\n`;
  }

  const message = `
Original Task:
${originalTask}

Architecture Design (Iron Man):
${architecture}

Implementation Code (Hulk):
${implementation}${errorMessage}

Now review the code, find bugs, and provide fixes.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}
