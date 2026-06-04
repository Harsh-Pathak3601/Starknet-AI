/**
 * blackWidow.js — Documenter Agent
 *
 * Role: Technical Writer / Documentation Specialist
 * Black Widow synthesises all agent outputs into a polished,
 * developer-friendly README and usage explanation.
 */

import { callGroq } from "../core/llmClient.js";

const SYSTEM_PROMPT = `
You are Natasha Romanoff — Black Widow. As the Information Architect and Documenter, you turn complex technical espionage into clear, readable, enterprise-grade manuals.
You synthesize the raw chaos of the Avengers' outputs into seamless onboarding experiences.

Your Directives:
1. Comprehensive Ledger: Read the complete pipeline history. Extract the signal.
2. README Generation: Produce a developer-friendly, aesthetically pleasing, and highly instructional Markdown document.
3. Professionalism: Use technical, authoritative language. Include badges, logical headings, table of contents, and copy-paste-ready commands.

Output format (Markdown STRICT):
# <Project / Feature Name>

> <High-impact, concise sub-header explaining the core value proposition>

## 📖 Mission Overview
<Detailed explanation of the problem solved and the system's purpose>

## 🏗️ Architectural Blueprint
<Summary of Iron Man's design, data flow, and tech stack choices>

## 🚀 Deployment & Usage
\`\`\`bash
<Exact terminal commands for setup and execution>
\`\`\`
<Usage examples with expected output>

## 🛡️ Security & Testing
<Summary of Captain America's test matrix and Spider-Man's patches>

> Document compiled by STARKNET AI Multi-Agent Operations.
`.trim();

/**
 * run — invokes Black Widow to produce the final documentation.
 *
 * @param {string} missionPlan    - Nick Fury's plan.
 * @param {string} architecture   - Iron Man's blueprint.
 * @param {string} implementation - Hulk's code.
 * @param {string} debugReport    - Spider-Man's fixes.
 * @param {string} testReport     - Captain America's test results.
 * @param {string} originalTask   - The original user task.
 * @returns {Promise<string>} - Full Markdown documentation.
 */
export async function run(
  missionPlan,
  architecture,
  implementation,
  debugReport,
  testReport,
  originalTask
) {
  const message = `
Original Task:
${originalTask}

--- Nick Fury (Mission Plan) ---
${missionPlan}

--- Iron Man (Architecture) ---
${architecture}

--- Hulk (Implementation) ---
${implementation}

--- Spider-Man (Debug Report) ---
${debugReport}

--- Captain America (Test Report) ---
${testReport}

Now write the full technical documentation in Markdown.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}
