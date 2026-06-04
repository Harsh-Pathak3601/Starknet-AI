/**
 * vision.js — CI/CD & Infrastructure Agent
 *
 * Role: The Synthezoid — Vision operates across all digital networks.
 * He handles everything after code is written:
 *   1. Git — commits all generated files to a repository branch.
 *   2. Deploy — pushes the workspace to Vercel and retrieves the live URL.
 *   3. Visual Audit — analyzes the deployed UI via Playwright screenshot + LLM.
 *   4. Documentation — compiles the final README from all agent outputs (merged
 *      from Black Widow's former role alongside CI/CD duties).
 *
 * Avenger Theme: Vision is not bound by the physical. He exists everywhere —
 *   in the code, in the network, in the deployed cloud.
 */

import { callGroq }         from "../core/llmClient.js";
import { commitAndPush }    from "../tools/gitTool.js";
import { deployGraceful }   from "../tools/deployTool.js";
import { chromium }         from "playwright";

// ─── Prompts ──────────────────────────────────────────────────────────────────

const DOC_SYSTEM_PROMPT = `
You are Vision — the Synthezoid. You are the final intelligence in the STARKNET AI pipeline.
You synthesize the raw chaos of the Avengers' outputs into a seamless, enterprise-grade technical document.

Your Directives:
1. Comprehensive Ledger: Read the complete pipeline history. Extract the signal.
2. README Generation: Produce a developer-friendly, aesthetically polished, and highly instructional Markdown document.
3. Include: badges, table of contents, logical headings, setup commands, usage examples, architecture summary.
4. CI/CD Section: Include the deployment URL (if available) and Git commit info.
5. Professionalism: Technical, authoritative, copy-paste-ready.

Output format (Markdown):
# <Project Name>

> <High-impact sub-header — core value proposition>

## 📖 Mission Overview
## 🏗️ Architecture
## 🚀 Setup & Deployment
## 🧪 Testing
## 🔐 Security
## 🌐 Live URL
## 📝 Vision's CI/CD Report

> Document compiled by STARKNET AI Multi-Agent Operations.
`.trim();

const VISUAL_AUDIT_PROMPT = `
You are Vision. You have received a screenshot description of a deployed web application.
Your role: perform a rapid UX and visual quality audit.

Evaluate:
1. Visual Hierarchy — Are headings, CTAs, and content well-structured?
2. Colour & Contrast — Is the palette accessible (WCAG AA)?
3. Layout — Is the layout responsive and balanced?
4. Completeness — Are there placeholder texts, broken images, or empty sections?

Output as:
VISUAL AUDIT REPORT
===================
Score: <X/10>
Strengths: <bullet list>
Issues: <bullet list with severity: LOW/MED/HIGH>
Recommendation: <1-2 sentences>
`.trim();

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * screenshotAndAudit — launches a headless browser, takes a screenshot of the
 * deployed URL, and asks the LLM to audit the page structure.
 *
 * @param {string} url
 * @returns {Promise<string>} - Visual audit report text.
 */
async function screenshotAndAudit(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Extract visible text content as a proxy for the visual audit
    const pageText = await page.evaluate(() => {
      const el = document.querySelector("main") ?? document.body;
      return el ? el.innerText.substring(0, 3000) : "Could not extract page content.";
    });

    const auditMessage =
      `Deployed URL: ${url}\n\nVisible page content (first 3000 chars):\n${pageText}`;
    return await callGroq(VISUAL_AUDIT_PROMPT, auditMessage);
  } catch (err) {
    return `Visual audit skipped — could not access URL: ${err.message}`;
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * generateDocs — Vision produces the final project README.
 *
 * @param {string} missionPlan    - Nick Fury's plan.
 * @param {string} architecture   - Iron Man's blueprint.
 * @param {string} implementation - Hulk's code.
 * @param {string} debugReport    - Spider-Man's fixes.
 * @param {string} testReport     - Captain America's test results.
 * @param {string} originalTask   - The original user task.
 * @param {string} ciReport       - CI/CD status (git + deploy).
 * @returns {Promise<string>} - Full Markdown documentation.
 */
export async function generateDocs(
  missionPlan,
  architecture,
  implementation,
  debugReport,
  testReport,
  originalTask,
  ciReport = ""
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

--- Vision (CI/CD Report) ---
${ciReport}

Now write the full technical documentation in Markdown.
`.trim();

  return await callGroq(DOC_SYSTEM_PROMPT, message);
}

/**
 * run — full Vision CI/CD pipeline:
 *   1. Commits generated files to Git.
 *   2. Deploys to Vercel.
 *   3. Runs visual audit on the live URL.
 *   4. Generates the final README.
 *
 * @param {string}  workspaceDir  - The generated code directory.
 * @param {string}  taskSlug      - Short task name for commit message.
 * @param {string}  missionPlan
 * @param {string}  architecture
 * @param {string}  implementation
 * @param {string}  debugReport
 * @param {string}  testReport
 * @param {string}  originalTask
 * @returns {Promise<string>}  - Full Vision report (CI/CD + docs).
 */
export async function run(
  workspaceDir,
  taskSlug,
  missionPlan,
  architecture,
  implementation,
  debugReport,
  testReport,
  originalTask
) {
  const sections = [];

  // ── Step 1: Git ────────────────────────────────────────────────────────────
  sections.push("## 🔗 Git Operations");
  const commitMsg = `feat(${taskSlug}): STARKNET AI auto-generated implementation`;
  const gitResult = await commitAndPush(workspaceDir, commitMsg);
  sections.push(gitResult.log.join("\n"));

  // ── Step 2: Deploy ─────────────────────────────────────────────────────────
  sections.push("\n## 🚀 Vercel Deployment");
  const deployStatus = await deployGraceful(workspaceDir);
  sections.push(deployStatus);

  // Extract URL from deploy status (if present)
  const urlMatch  = deployStatus.match(/https:\/\/[^\s]+\.vercel\.app/);
  const liveUrl   = urlMatch ? urlMatch[0] : null;

  // ── Step 3: Visual Audit ───────────────────────────────────────────────────
  sections.push("\n## 👁️ Visual UI Audit");
  if (liveUrl) {
    const auditReport = await screenshotAndAudit(liveUrl);
    sections.push(auditReport);
  } else {
    sections.push("Visual audit skipped — no live URL available.");
  }

  const ciReport = sections.join("\n");

  // ── Step 4: Documentation ──────────────────────────────────────────────────
  const readme = await generateDocs(
    missionPlan,
    architecture,
    implementation,
    debugReport,
    testReport,
    originalTask,
    ciReport
  );

  return `${ciReport}\n\n---\n\n## 📄 Generated README\n\n${readme}`;
}
