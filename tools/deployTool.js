/**
 * deployTool.js
 * Tool: Vercel deployment via CLI.
 * Used by Vision to push the generated workspace to a live URL.
 */

import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { fileExists } from "./fileSystem.js";

const execAsync = promisify(exec);

/**
 * extractVercelUrl — parses the Vercel CLI output to find the deployment URL.
 *
 * @param {string} output  - Raw stdout from the vercel command.
 * @returns {string|null}  - Extracted URL or null.
 */
function extractVercelUrl(output) {
  const match = output.match(/https:\/\/[a-zA-Z0-9\-\.]+\.vercel\.app/);
  return match ? match[0] : null;
}

/**
 * deploy — runs `npx vercel --prod` on the target directory and returns the live URL.
 *
 * @param {string}  dir         - The generated workspace directory to deploy.
 * @param {boolean} production  - If true, deploys to production alias.
 * @returns {Promise<{ success: boolean, url: string|null, stdout: string, stderr: string }>}
 */
export async function deploy(dir, production = true) {
  const resolved = path.resolve(dir);

  const exists = await fileExists(resolved);
  if (!exists) {
    return {
      success: false,
      url: null,
      stdout: "",
      stderr: `[deployTool] Directory not found: ${resolved}`,
    };
  }

  const flag = production ? "--prod" : "";
  const cmd  = `npx vercel ${flag} --yes --no-clipboard`;

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: resolved,
      timeout: 120_000, // 2 minutes max
    });

    const url = extractVercelUrl(stdout) ?? extractVercelUrl(stderr);
    return {
      success: true,
      url,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (err) {
    return {
      success: false,
      url: null,
      stdout: err.stdout?.trim() ?? "",
      stderr: err.stderr?.trim() ?? err.message,
    };
  }
}

/**
 * deployGraceful — attempts deployment and falls back gracefully if Vercel is
 * not configured (e.g., no token). Returns a human-readable status message.
 *
 * @param {string} dir
 * @returns {Promise<string>}  - Status message for Vision's report.
 */
export async function deployGraceful(dir) {
  const result = await deploy(dir);

  if (result.success && result.url) {
    return `✅ DEPLOYED — Live URL: ${result.url}`;
  }

  if (result.stderr.includes("token") || result.stderr.includes("not logged in")) {
    return (
      `⚠️  VERCEL_NOT_CONFIGURED — Deployment skipped.\n` +
      `To enable: run 'npx vercel login' and set VERCEL_TOKEN in .env.\n` +
      `Generated workspace is ready at: ${path.resolve(dir)}`
    );
  }

  return (
    `❌  DEPLOYMENT_FAILED\n` +
    `Error: ${result.stderr.substring(0, 300)}\n` +
    `Workspace is still available at: ${path.resolve(dir)}`
  );
}
