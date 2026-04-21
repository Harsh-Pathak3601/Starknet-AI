/**
 * orchestrator.js
 * The mission control center — chains all Avenger agents in sequence,
 * manages shared memory, and returns the final structured result.
 */

import * as memory     from "./memory.js";
import * as hawkeye    from "../agents/hawkeye.js";
import * as nickFury   from "../agents/nickFury.js";
import * as ironMan    from "../agents/ironMan.js";
import * as hulk       from "../agents/hulk.js";
import * as spiderMan  from "../agents/spiderMan.js";
import * as captainAmerica from "../agents/captainAmerica.js";
import * as blackWidow from "../agents/blackWidow.js";
import { writeFile }   from "../tools/fileSystem.js";
import { runCommand }  from "../tools/runCommand.js";
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
    let content = match[2].trim();
    
    // Auto-remove markdown code block fences if the LLM wrapped the code in them
    if (content.startsWith("```")) {
      content = content.replace(/^```[a-zA-Z]*\n/, "");
      if (content.endsWith("```")) {
        content = content.substring(0, content.length - 3).trim();
      }
    }

    if (filename && content) {
      const filePath = path.join(baseDir, filename);
      await writeFile(filePath, content);
      filesWritten++;
    }
  }
  return filesWritten;
}

/**
 * Utility to extract execution command formatted as --- EXECUTION COMMAND --- \n <cmd> \n --- END COMMAND ---
 */
function extractExecutionCommand(output) {
  const match = output.match(/--- EXECUTION COMMAND ---\n([\s\S]*?)--- END COMMAND ---/);
  return match ? match[1].trim() : null;
}

/**
 * PipelineStep — represents one agent's execution step.
 * @typedef {{ agent: string, emoji: string, run: Function }} PipelineStep
 */

/**
 * runMission — executes the full multi-agent pipeline for a given task.
 *
 * Steps:
 *  0. Hawkeye       → web research / intel
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
  // STEP 0 — Hawkeye: Web Research
  // ─────────────────────────────────────────────────────────
  onStep(0, "Hawkeye", ICONS.HAWKEYE);
  const intelReport = await hawkeye.run(userTask, (msg) => {
    onStep(0, "Hawkeye", ICONS.HAWKEYE, msg);
  });
  memory.append("Hawkeye", intelReport);
  results["Hawkeye"] = intelReport;

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
  
  let executionError = null;
  const commandToRun = extractExecutionCommand(implementation);
  
  if (commandToRun) {
    onStep(3, "System", ICONS.ROBOT, `Executing: ${commandToRun}`);
    const processResult = await runCommand(commandToRun, { cwd: workspaceFolder });
    if (!processResult.success) {
      executionError = processResult.stderr || processResult.stdout || "Unknown execution error";
    }
  }

  let hulkOutput = implementation + `\n\n[SYSTEM: Wrote ${filesCreated} files to ${workspaceFolder}]`;
  if (commandToRun) {
     hulkOutput += `\n[SYSTEM: Executed '${commandToRun}'. Success: ${!executionError}]`;
  }
  
  memory.append("Hulk", hulkOutput);
  results["Hulk"] = hulkOutput;

  // ─────────────────────────────────────────────────────────
  // STEP 4 — Spider-Man: Debug & Auto-Healing
  // ─────────────────────────────────────────────────────────
  onStep(4, "Spider-Man", ICONS.SPIDER_MAN, executionError ? "Healing execution error..." : "Optimising...");
  const debugReport = await spiderMan.run(implementation, architecture, userTask, executionError);
  const patchesApplied = await extractAndSaveFiles(debugReport, workspaceFolder);
  
  let finalStatus = "No second execution attempted.";
  if (executionError && commandToRun) {
    onStep(4, "System", ICONS.ROBOT, `Re-Executing: ${commandToRun}`);
    const retryResult = await runCommand(commandToRun, { cwd: workspaceFolder });
    if (!retryResult.success) {
      finalStatus = `Second run failed: ${retryResult.stderr.substring(0, 100)}...`;
    } else {
      finalStatus = `Second run SUCCESSFUL. Auto-Healing complete!`;
    }
  }

  const spiderOutput = debugReport + `\n\n[SYSTEM: Applied fixes to ${patchesApplied} files in ${workspaceFolder}]\n[SYSTEM: ${finalStatus}]`;
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
