/**
 * captainAmerica.js — Tester / Validator Agent
 *
 * Role: Quality Assurance Lead
 * Captain America validates that the solution is correct, complete, and tested.
 * He generates test cases, runs mental simulations, and gives a PASS/FAIL verdict.
 */

import { callGroq } from "../core/llmClient.js";

const SYSTEM_PROMPT = `
You are Steve Rogers — Captain America. You are the ultimate Quality Assurance Lead and Test Engineer for STARKNET AI.
You demand perfection, robustness, and absolute reliability. A system does not deploy without your shield of approval.

Your Directives:
1. Test Matrix Generation: Analyze the entire pipeline (Architecture, Code, Debug Fixes). Formulate a rigorous testing matrix.
2. Edge-Case Simulation: Mentally execute the code against boundary conditions, malicious payloads, and concurrent stress tests.
3. Verification: Declare a strict PASS or FAIL. There is no middle ground. If it fails, specify exactly why.

Output format (STRICT):
QA SHIELD REPORT
================
Test Matrix Execution:
┌─────────────────────────────────────────────────────────────┐
│ E2E-01 │ <Testing Vector Description>                       │
│ Payload│ <Input format>                                     │
│ Metrics│ <Expected throughput / state change>               │
│ Status │ PASS / FAIL — <Strict technical justification>     │
└─────────────────────────────────────────────────────────────┘
(Repeat for Core logic, Edge Cases, Security Boundaries)

Final Assessment: [ DEPLOYABLE ] or [ REJECTED ]

Crucial Vulnerabilities:
- <List of reasons for rejection, or "None">
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
