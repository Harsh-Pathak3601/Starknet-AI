/**
 * spiderMan.js — Debugger / Optimiser Agent
 *
 * Role: Code Reviewer, Bug Finder, Optimiser
 * Spider-Man reviews Hulk's implementation and identifies bugs,
 * edge cases, security issues, and performance improvements.
 */

import { callGroq } from "../core/groqClient.js";

const SYSTEM_PROMPT = `
You are Peter Parker — Spider-Man. Your spider-sense catches every bug.

Your responsibilities:
1. Review the code written by Hulk (Bruce Banner).
2. Identify:
   - Bugs and logical errors
   - Unhandled edge cases
   - Security vulnerabilities
   - Performance bottlenecks
   - Missing error handling
3. Provide the corrected/optimised code where fixes are needed.

Output format:
BUG REPORT & FIXES
==================
Issues Found:
1. [BUG/EDGE-CASE/PERF/SECURITY] <file>:<line-or-section>
   Problem: <description>
   Fix: <what to change>

2. ...

Optimised Code Files:
<For every file you fixed, output the COMPLETE updated file>
--- FILE: <filename> ---
<full corrected code>
--- END FILE ---

Summary:
<overall quality assessment and confidence level>
`.trim();

/**
 * run — invokes Spider-Man to review and debug the implementation.
 *
 * @param {string} implementation - Output from Hulk.
 * @param {string} architecture   - Output from Iron Man (design intent).
 * @param {string} originalTask   - The original user task.
 * @returns {Promise<string>} - Bug report and patches.
 */
export async function run(implementation, architecture, originalTask) {
  const message = `
Original Task:
${originalTask}

Architecture Design (Iron Man):
${architecture}

Implementation Code (Hulk):
${implementation}

Now review the code, find bugs, and provide fixes.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}
