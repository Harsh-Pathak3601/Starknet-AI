/**
 * runCommand.js
 * Tool: Execute shell commands safely via child_process.
 * Used by agents or CLI to run scripts and capture output.
 */

import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * runCommand — executes a shell command and returns stdout/stderr.
 *
 * @param {string} command       - The shell command to execute.
 * @param {Object} [options]     - Optional child_process exec options.
 * @param {string} [options.cwd] - Working directory for the command.
 * @param {number} [options.timeout] - Timeout in milliseconds (default: 30000).
 * @returns {Promise<{ stdout: string, stderr: string, success: boolean }>}
 */
export async function runCommand(command, options = {}) {
  const { cwd = process.cwd(), timeout = 30_000 } = options;

  try {
    const { stdout, stderr } = await execAsync(command, { cwd, timeout });
    return {
      success: true,
      stdout:  stdout.trim(),
      stderr:  stderr.trim(),
      command,
    };
  } catch (error) {
    return {
      success: false,
      stdout:  error.stdout?.trim() ?? "",
      stderr:  error.stderr?.trim() ?? error.message,
      command,
    };
  }
}

/**
 * runCommandInteractive — streams a command's output line-by-line.
 * Useful for long-running processes.
 *
 * @param {string}   command   - Shell command to run.
 * @param {Function} onData    - Callback for each line of stdout.
 * @param {Function} onError   - Callback for each line of stderr.
 * @returns {Promise<number>}  - Exit code.
 */
export function runCommandInteractive(command, onData = console.log, onError = console.error) {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, { shell: true });

    child.stdout.on("data", (chunk) =>
      chunk.toString().split("\n").filter(Boolean).forEach(onData)
    );
    child.stderr.on("data", (chunk) =>
      chunk.toString().split("\n").filter(Boolean).forEach(onError)
    );
    child.on("close", resolve);
  });
}
