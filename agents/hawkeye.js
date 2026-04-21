/**
 * hawkeye.js — Web Scout Agent
 *
 * Role: Web Researcher
 * Hawkeye uses Playwright to browse the web, scrape the latest documentation,
 * and provide an intelligence report to Nick Fury and the team.
 */

import { callGroq } from "../core/groqClient.js";
import { chromium } from "playwright";

const SYSTEM_PROMPT = `
You are Hawkeye, the lead scout for STARKNET AI.
Your job is to read raw web scraped data and summarize the most critical technical information.

1. You will be given a user task and raw text scraped from the internet.
2. Extract the newest code snippets, API syntax, or documentation details related to the task.
3. Discard all irrelevant noise (ads, navigation menus, etc).
4. Format your output as a clear "Technical Intel Report".

Output Format:
TECHNICAL INTEL REPORT
======================
Summary: <Brief summary of the findings>

Key Syntax / API:
<Code blocks or endpoints discovered>

Notes for Nick Fury & Iron Man:
<Any gotchas or specific things they should know before designing the architecture>
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
