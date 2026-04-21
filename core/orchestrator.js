/**
 * orchestrator.js
 * The mission control center — chains all Avenger agents in sequence,
 * manages shared memory, and returns the final structured result.
 */

import * as memory     from "./memory.js";
import * as nickFury   from "../agents/nickFury.js";
import * as ironMan    from "../agents/ironMan.js";
import * as hulk       from "../agents/hulk.js";
import * as spiderMan  from "../agents/spiderMan.js";
import * as captainAmerica from "../agents/captainAmerica.js";
import * as blackWidow from "../agents/blackWidow.js";
import { writeFile }   from "../tools/fileSystem.js";
import path            from "path";
import { ICONS }       from "./icons.js";

/**
 * Utility to extract files formatted as --- FILE: <name> --- and save them to disk.
 */
async function extractAndSaveFiles(output, baseDir = "generated-workspace") {
  const fileRegex = /--- FILE: (.*?) ---\n([\s\S]*?)--- END FILE ---/g;
  let match;
  let filesWritten = 0;
  while ((match = fileRegex.exec(output)) !== null) {
    const filename = match[1].trim();
    const content = match[2].trim();
    if (filename && content) {
      const filePath = path.join(baseDir, filename);
      await writeFile(filePath, content);
      filesWritten++;
    }
  }
  return filesWritten;
}

/**
 * PipelineStep — represents one agent's execution step.
 * @typedef {{ agent: string, emoji: string, run: Function }} PipelineStep
 */

/**
 * runMission — executes the full multi-agent pipeline for a given task.
 *
 * Steps:
 *  1. Nick Fury     → mission briefing / breakdown
 *  2. Iron Man      → architecture blueprint
 *  3. Hulk          → implementation code
 *  4. Spider-Man    → debug report & patches
 *  5. Captain America → test report
 *  6. Black Widow   → final documentation
 *
 * @param {string}   userTask    - The task string entered by the user.
 * @param {Function} onStep      - Callback fired at the start of each step.
 *                                 Signature: (stepIndex, agentName, emoji) => void
 * @returns {Promise<Object>}    - Map of agent name → output string.
 */
export async function runMission(userTask, onStep = () => {}) {
  // Clear memory for a fresh mission
  memory.clear();

  const results = {};
  const slug = userTask.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40) || 'workspace';
  const workspaceFolder = `output/${slug}-code`;

  // ─────────────────────────────────────────────────────────
  // STEP 1 — Nick Fury: Mission Briefing
  // ─────────────────────────────────────────────────────────
  onStep(1, "Nick Fury", ICONS.NICK_FURY);
  const missionPlan = await nickFury.run(userTask);
  memory.append("Nick Fury", missionPlan);
  results["Nick Fury"] = missionPlan;

  // ─────────────────────────────────────────────────────────
  // STEP 2 — Iron Man: Architecture Blueprint
  // ─────────────────────────────────────────────────────────
  onStep(2, "Iron Man", ICONS.IRON_MAN);
  const architecture = await ironMan.run(missionPlan, userTask);
  memory.append("Iron Man", architecture);
  results["Iron Man"] = architecture;

  // ─────────────────────────────────────────────────────────
  // STEP 3 — Hulk: Implementation Code
  // ─────────────────────────────────────────────────────────
  onStep(3, "Hulk", ICONS.HULK);
  const implementation = await hulk.run(architecture, missionPlan, userTask);
  const filesCreated = await extractAndSaveFiles(implementation, workspaceFolder);
  const hulkOutput = implementation + `\n\n[SYSTEM: Wrote ${filesCreated} files to ${workspaceFolder}]`;
  memory.append("Hulk", hulkOutput);
  results["Hulk"] = hulkOutput;

  // ─────────────────────────────────────────────────────────
  // STEP 4 — Spider-Man: Debug & Optimise
  // ─────────────────────────────────────────────────────────
  onStep(4, "Spider-Man", ICONS.SPIDER_MAN);
  const debugReport = await spiderMan.run(implementation, architecture, userTask);
  const patchesApplied = await extractAndSaveFiles(debugReport, workspaceFolder);
  const spiderOutput = debugReport + `\n\n[SYSTEM: Applied fixes to ${patchesApplied} files in ${workspaceFolder}]`;
  memory.append("Spider-Man", spiderOutput);
  results["Spider-Man"] = spiderOutput;

  // ─────────────────────────────────────────────────────────
  // STEP 5 — Captain America: Testing & Validation
  // ─────────────────────────────────────────────────────────
  onStep(5, "Captain America", ICONS.CAPTAIN_AMERICA);
  const testReport = await captainAmerica.run(implementation, debugReport, userTask);
  memory.append("Captain America", testReport);
  results["Captain America"] = testReport;

  // ─────────────────────────────────────────────────────────
  // STEP 6 — Black Widow: Documentation
  // ─────────────────────────────────────────────────────────
  onStep(6, "Black Widow", ICONS.BLACK_WIDOW);
  const documentation = await blackWidow.run(
    missionPlan,
    architecture,
    implementation,
    debugReport,
    testReport,
    userTask
  );
  memory.append("Black Widow", documentation);
  results["Black Widow"] = documentation;

  return results;
}
