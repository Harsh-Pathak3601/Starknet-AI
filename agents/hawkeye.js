/**
 * hawkeye.js — Web Scout Agent
 *
 * Role: Web Researcher
 * Hawkeye uses Playwright to browse the web, scrape the latest documentation,
 * and provide an intelligence report to Nick Fury and the team.
 */

import { callGroq } from "../core/llmClient.js";
import { chromium } from "playwright";

const SYSTEM_PROMPT = `
You are Clint Barton — Hawkeye. As the Web Scout and Intelligence Gatherer, you never miss your mark.
Your purpose is to parse massive, noisy HTML scraped payloads and extract pristine, highly relevant, and up-to-date technical context.

Your Directives:
1. Noise Filtering: Ignore ads, navigation menus, and SEO filler. Lock onto code snippets, API references, configuration flags, and migration guides.
2. Context Synthesis: The data you provide feeds directly into Iron Man's blueprints and Hulk's code. Accuracy is life or death.
3. Token Economy: Compress your findings to absolute maximal information density.

Output Format (STRICT):
TACTICAL INTEL PACKAGE
======================
Target Acquired:
<1-2 sentences summarizing the core finding>

Critical API Surface / Syntax Extracts:
<Exact code blocks, endpoint structures, or JSON shapes>

Operational Hazards:
<Gotchas, deprecated methods, or version-specific quirks that the team MUST avoid>
`.trim();

/**
 * run — invokes Hawkeye to scout the web.
 *
 * @param {string} userTask - The raw task string from the user.
 * @param {Function} updateSpinner - Optional callback to update CLI UI.
 * @returns {Promise<string>} - The summarized research.
 */
export async function run(userTask, updateSpinner = () => {}) {
  // 1. Generate search query using Groq
  const queryGenPrompt = `Generate a SINGLE short Google search query (max 4-5 words) to find the most up-to-date coding documentation needed for this task. ONLY respond with the exact search query text, absolutely nothing else. Task: ${userTask}`;
  
  updateSpinner("Generating search query...");
  let searchQuery = await callGroq("You are an expert search engine operator.", queryGenPrompt);
  // Clean up any quotes the LLM might have added
  searchQuery = searchQuery.replace(/['"]/g, "").trim();
  
  updateSpinner(`Searching web for: "${searchQuery}"`);
  
  let browser;
  let rawScrapedText = "";

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    // Using DuckDuckGo HTML Lite for easy scraping
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Get the first search result link (a.result__url is in duckduckgo html)
    const firstLink = await page.evaluate(() => {
      const anchor = document.querySelector('a.result__url');
      return anchor ? anchor.href : null;
    });
    
    if (firstLink) {
      updateSpinner(`Reading docs at: ${new URL(firstLink).hostname}`);
      await page.goto(firstLink, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Extract visible text (strip scripts and styles)
      rawScrapedText = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        return main ? main.innerText : "";
      });
    } else {
      rawScrapedText = "No direct documentation links found. Rely on base training data.";
    }
  } catch (error) {
    rawScrapedText = `Web search failed. Proceed using existing LLaMA knowledge. Error: ${error.message}`;
  } finally {
    if (browser) await browser.close();
  }

  // Cap the scraped text to avoid token limits (keep first 15,000 chars)
  const safeScrapedText = rawScrapedText.substring(0, 15000);

  updateSpinner("Synthesizing intel report...");
  // 2. Synthesize with Groq
  const message = `USER TASK:\n${userTask}\n\nRAW SCRAPED DATA:\n${safeScrapedText}`;
  return await callGroq(SYSTEM_PROMPT, message);
}
