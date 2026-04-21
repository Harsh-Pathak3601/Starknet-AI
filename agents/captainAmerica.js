/**
 * captainAmerica.js — Tester / Validator Agent
 *
 * Role: Quality Assurance Lead
 * Captain America validates that the solution is correct, complete, and tested.
 * He generates test cases, runs mental simulations, and gives a PASS/FAIL verdict.
 */

import { callGroq } from "../core/groqClient.js";

const SYSTEM_PROMPT = `
You are Steve Rogers — Captain America. You uphold the highest standards.

Your responsibilities:
1. Review the full solution (architecture + code + bug fixes).
2. Generate comprehensive test cases covering:
   - Happy-path (normal) scenarios
   - Edge cases (empty input, extremes, boundary conditions)
   - Error / failure scenarios
3. Mentally simulate the execution of each test case.
4. Give a clear PASS or FAIL verdict with explanation.

Output format:
TEST REPORT
===========
Test Cases:
┌─────────────────────────────────────────────────────────┐
│ TC-01 │ <Name>                                           │
│ Input │ <value>                                          │
│ Expected │ <result>                                      │
│ Verdict  │ PASS / FAIL — <reason>                       │
└─────────────────────────────────────────────────────────┘
(repeat for each test case)

Overall Verdict: PASS / FAIL
Issues Requiring Attention:
- <list any remaining issues>

Confidence Score: X/10
`.trim();

/**
 * run — invokes Captain America to validate the full solution.
 *
 * @param {string} implementation - Hulk's code output.
 * @param {string} debugReport    - Spider-Man's bug report and patches.
 * @param {string} originalTask   - The original user task.
 * @returns {Promise<string>} - Test report with verdicts.
 */
export async function run(implementation, debugReport, originalTask) {
  const message = `
Original Task:
${originalTask}

Implementation (Hulk):
${implementation}

Debug Report & Fixes (Spider-Man):
${debugReport}

Now generate a full test report for this solution.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}
