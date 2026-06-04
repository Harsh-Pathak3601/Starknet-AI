/**
 * gitTool.js
 * Tool: Git operations via child_process.
 * Used by Vision to commit generated files and push to a remote repo.
 */

import { execSync, exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * runGit — executes a git command in a given directory.
 *
 * @param {string}  cmd  - The git sub-command (e.g., "status", "add .")
 * @param {string}  cwd  - Working directory to run the command in.
 * @returns {Promise<{ success: boolean, stdout: string, stderr: string }>}
 */
async function runGit(cmd, cwd) {
  try {
    const { stdout, stderr } = await execAsync(`git ${cmd}`, {
      cwd: path.resolve(cwd),
      timeout: 30000,
    });
    return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err) {
    return {
      success: false,
      stdout: err.stdout?.trim() ?? "",
      stderr: err.stderr?.trim() ?? err.message,
    };
  }
}

/**
 * isGitRepo — checks if the target directory is already a git repo.
 *
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
export async function isGitRepo(dir) {
  const result = await runGit("rev-parse --is-inside-work-tree", dir);
  return result.success && result.stdout === "true";
}

/**
 * initRepo — initialises a new git repo if one doesn't exist.
 *
 * @param {string} dir
 */
export async function initRepo(dir) {
  const exists = await isGitRepo(dir);
  if (exists) return { success: true, stdout: "Already a git repo.", stderr: "" };
  return await runGit("init", dir);
}

/**
 * addAll — stages all changes.
 *
 * @param {string} dir
 */
export async function addAll(dir) {
  return await runGit("add -A", dir);
}

/**
 * commit — commits staged changes with a message.
 *
 * @param {string} dir
 * @param {string} message
 */
export async function commit(dir, message) {
  // Sanitise the message to avoid shell injection
  const safeMsg = message.replace(/"/g, "'").substring(0, 200);
  return await runGit(`commit -m "${safeMsg}"`, dir);
}

/**
 * push — pushes to a remote branch.
 *
 * @param {string} dir
 * @param {string} remote  - e.g., "origin"
 * @param {string} branch  - e.g., "main"
 */
export async function push(dir, remote = "origin", branch = "main") {
  return await runGit(`push ${remote} ${branch}`, dir);
}

/**
 * getStatus — returns the current git status summary.
 *
 * @param {string} dir
 */
export async function getStatus(dir) {
  return await runGit("status --short", dir);
}

/**
 * setRemote — sets or updates the remote origin URL.
 *
 * @param {string} dir
 * @param {string} url  - HTTPS or SSH remote URL.
 */
export async function setRemote(dir, url) {
  // Remove existing remote if present, then add
  await runGit("remote remove origin", dir); // Ignore error if not set
  return await runGit(`remote add origin ${url}`, dir);
}

/**
 * commitAndPush — convenience wrapper: stages, commits, and pushes in one call.
 *
 * @param {string} dir
 * @param {string} message
 * @param {string} remote
 * @param {string} branch
 * @returns {Promise<{ success: boolean, log: string[] }>}
 */
export async function commitAndPush(dir, message, remote = "origin", branch = "main") {
  const log = [];

  const init   = await initRepo(dir);
  log.push(`[git init]   ${init.success ? "✅" : "❌"} ${init.stdout || init.stderr}`);

  const add    = await addAll(dir);
  log.push(`[git add]    ${add.success ? "✅" : "❌"} ${add.stdout || add.stderr}`);

  const c      = await commit(dir, message);
  log.push(`[git commit] ${c.success ? "✅" : "❌"} ${c.stdout || c.stderr}`);

  const pushR  = await push(dir, remote, branch);
  log.push(`[git push]   ${pushR.success ? "✅" : "❌"} ${pushR.stdout || pushR.stderr}`);

  const allOk = [add, c, pushR].every((r) => r.success);
  return { success: allOk, log };
}
