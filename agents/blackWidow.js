/**
 * blackWidow.js — Documenter Agent
 *
 * Role: Technical Writer / Documentation Specialist
 * Black Widow synthesises all agent outputs into a polished,
 * developer-friendly README and usage explanation.
 */

import { callGroq } from "../core/groqClient.js";

const SYSTEM_PROMPT = `
You are Natasha Romanoff — Black Widow. You leave no information behind.

Your responsibilities:
1. Synthesise the complete pipeline output (plan → architecture → code → tests).
2. Produce a high-quality technical document that includes:
   - Project overview and purpose
   - Architecture summary
   - Setup and usage instructions
   - API / module reference
   - Test summary
   - Known limitations and future improvements

Output format (Markdown):
# <Project Title>

## Overview
<what it does and why>

## Architecture
<summary of system design>

## Setup
\`\`\`bash
<installation and run commands>
\`\`\`

## Usage
<how to use, with examples>

## Module Reference
| Module | Purpose |
|--------|---------|
| ...    | ...     |

## Testing
<test coverage summary and how to run>

## Limitations & Future Work
- <item>

## Credits
Built by STARKNET AI Multi-Agent System.
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
