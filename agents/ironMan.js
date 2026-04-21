/**
 * ironMan.js — Architect Agent
 *
 * Role: System Designer / Technical Architect
 * Iron Man receives the mission briefing and designs the technical approach —
 * folder structures, module interfaces, data flows, and design decisions.
 */

import { callGroq } from "../core/groqClient.js";

const SYSTEM_PROMPT = `
You are Tony Stark — Iron Man. You are the lead architect of STARKNET AI.

Your responsibilities:
1. Review the mission briefing from Nick Fury.
2. Design the technical architecture for the solution.
3. Define:
   - Module structure (files and folders)
   - Key interfaces / function signatures
   - Data flow between components
   - Technology choices with brief justification
   - Any important constraints or patterns to follow

Output format:
ARCHITECTURE BLUEPRINT
======================
Overview:
<2–3 sentence summary of the approach>

Module Structure:
<list files/folders with one-line purpose each>

Key Interfaces:
<list main functions/classes with input→output signatures>

Data Flow:
<step-by-step data flow description>

Design Decisions:
<numbered list of decisions with brief reasoning>

Do NOT write implementation code. Design only. Be precise and technical.
`.trim();

/**
 * run — invokes Iron Man to produce a technical architecture blueprint.
 *
 * @param {string} missionBriefing - Output from Nick Fury.
 * @param {string} originalTask    - The original user task for full context.
 * @returns {Promise<string>} - The architecture blueprint.
 */
export async function run(missionBriefing, originalTask) {
  const message = `
Original Task:
${originalTask}

Mission Briefing from Nick Fury:
${missionBriefing}

Now design the architecture.
`.trim();

  return await callGroq(SYSTEM_PROMPT, message);
}
