/**
 * groqClient.js
 * Centralized Groq API client — single source of truth for all agent LLM calls.
 * Features: automatic retry with exponential backoff on transient errors.
 */

import Groq from "groq-sdk";
import "dotenv/config";

// Validate that the API key exists before creating the client
if (!process.env.GROQ_API_KEY) {
  console.error("[groqClient] GROQ_API_KEY is missing. Copy .env.example → .env and fill it in.");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL      = process.env.GROQ_MODEL    || "llama-3.3-70b-versatile";
const TOKENS     = parseInt(process.env.MAX_TOKENS   || "2048", 10);
const TEMP       = parseFloat(process.env.TEMPERATURE || "0.7");
const MAX_RETRIES = 3;

/**
 * sleep — returns a promise that resolves after `ms` milliseconds.
 * @param {number} ms
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * isRetryable — returns true for transient errors that are worth retrying.
 * @param {Error} err
 */
function isRetryable(err) {
  const msg = err.message?.toLowerCase() ?? "";
  return (
    msg.includes("connection")   ||
    msg.includes("econnreset")   ||
    msg.includes("etimedout")    ||
    msg.includes("enotfound")    ||
    msg.includes("socket hang")  ||
    msg.includes("rate_limit")   ||
    err.status === 429           ||
    err.status === 502           ||
    err.status === 503
  );
}

/**
 * callGroq — sends a chat completion request to Groq with automatic retries.
 *
 * @param {string} systemPrompt  - The agent's persona / role instructions.
 * @param {string} userMessage   - The task or context passed to the agent.
 * @param {Array}  history       - Optional prior conversation turns for context.
 * @returns {Promise<string>}    - The model's text response.
 */
export async function callGroq(systemPrompt, userMessage, history = []) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user",   content: userMessage  },
  ];

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model:       MODEL,
        messages,
        max_tokens:  TOKENS,
        temperature: TEMP,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) throw new Error("[groqClient] Empty response from Groq API.");
      return content.trim();

    } catch (err) {
      lastError = err;

      if (!isRetryable(err) || attempt === MAX_RETRIES) break;

      const delay = 1000 * 2 ** (attempt - 1); // 1s, 2s, 4s
      console.error(
        `\n  [groqClient] Attempt ${attempt}/${MAX_RETRIES} failed (${err.message}). Retrying in ${delay / 1000}s...`
      );
      await sleep(delay);
    }
  }

  throw new Error(
    `[groqClient] All ${MAX_RETRIES} attempts failed. Last error: ${lastError?.message}`
  );
}
