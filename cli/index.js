/**
 * cli/index.js
 * STARKNET AI — Command Line Interface
 *
 * Entry point for the multi-agent system.
 * Handles user input, drives the orchestrator, and renders structured output.
 */

import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import "dotenv/config";

import { runMission } from "../core/orchestrator.js";
import { writeFile } from "../tools/fileSystem.js";

// ─── Banner ───────────────────────────────────────────────────────────────────

function printBanner() {
  const banner = chalk.bold.cyan(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   ██████╗████████╗ █████╗ ██████╗ ██╗  ██╗   ║
  ║  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║ ██╔╝   ║
  ║  ███████╗   ██║   ███████║██████╔╝█████╔╝    ║
  ║  ╚════██║   ██║   ██╔══██║██╔══██╗██╔═██╗    ║
  ║  ██████╔╝   ██║   ██║  ██║██║  ██║██║  ██╗   ║
  ║  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ║
  ║                                               ║
  ║          N E T   A I  •  v1.0.0               ║
  ╚═══════════════════════════════════════════════╝
  `);
  console.log(banner);
  console.log(
    chalk.dim("  Multi-Agent AI System  •  Powered by Groq LLaMA 3 70B\n")
  );
}

// ─── Agent label helper ───────────────────────────────────────────────────────

const AGENT_STYLES = {
  "Nick Fury": { emoji: "🕶️", color: chalk.bold.red },
  "Iron Man": { emoji: "🦾", color: chalk.bold.yellow },
  "Hulk": { emoji: "💪", color: chalk.bold.green },
  "Spider-Man": { emoji: "🕷️", color: chalk.bold.hex("#FF4500") },
  "Captain America": { emoji: "🛡️", color: chalk.bold.blueBright },
  "Black Widow": { emoji: "🕸️", color: chalk.bold.magenta },
};

function agentHeader(name) {
  const style = AGENT_STYLES[name] ?? { emoji: "🤖", color: chalk.white };
  const label = style.color(`${style.emoji}  ${name.toUpperCase()}`);
  const border = chalk.dim("─".repeat(58));
  return `\n${border}\n${label}\n${border}`;
}

// ─── Output renderer ──────────────────────────────────────────────────────────

function renderResults(results) {
  console.log("\n");
  console.log(
    chalk.bold.cyan("MISSION COMPLETE — Full Agent Output Below\n")
  );

  for (const [agent, output] of Object.entries(results)) {
    console.log(agentHeader(agent));
    console.log(chalk.white(output));
  }
}

// ─── Save to file helper ──────────────────────────────────────────────────────

async function saveResults(task, results) {
  const slug = task.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40) || 'mission';
  const fileName = `output/${slug}.md`;

  const sections = Object.entries(results)
    .map(([agent, output]) => `## ${agent}\n\n${output}`)
    .join("\n\n---\n\n");

  const content = `# STARKNET AI — Mission Report\n\n**Task:** ${task}\n\n**Generated:** ${new Date().toLocaleString()}\n\n---\n\n${sections}`;

  await writeFile(fileName, content);
  return fileName;
}

// ─── Main CLI loop ────────────────────────────────────────────────────────────

async function main() {
  printBanner();

  // Ensure API key is present
  if (!process.env.GROQ_API_KEY) {
    console.error(
      boxen(
        chalk.red.bold("⚠  GROQ_API_KEY not found!\n\n") +
        chalk.white("1. Copy .env.example → .env\n2. Add your Groq API key\n3. Run again."),
        { padding: 1, borderColor: "red", borderStyle: "round" }
      )
    );
    process.exit(1);
  }

  let continueLoop = true;

  while (continueLoop) {
    // ── Task input ─────────────────────────────────────────────────────────
    const { task } = await inquirer.prompt([
      {
        type: "input",
        name: "task",
        message: chalk.cyan("🎯  Enter your task for the Avengers:"),
        validate: (v) => v.trim().length > 5 || "Task must be at least 6 characters.",
      },
    ]);

    console.log(
      "\n" +
      boxen(chalk.bold.white(`📋  Task received:\n\n`) + chalk.dim(task.trim()), {
        padding: 1, borderColor: "cyan", borderStyle: "round",
      })
    );

    // ── Run pipeline ───────────────────────────────────────────────────────
    const spinner = ora({ text: "", spinner: "dots2" });
    let startTime;

    try {
      startTime = Date.now();

      const results = await runMission(task.trim(), (stepIndex, agentName, emoji) => {
        spinner.stop();
        spinner.start(
          chalk.dim(`  [${stepIndex}/6] `) +
          chalk.bold(`${emoji}  ${agentName} is working...`)
        );
      });

      spinner.succeed(chalk.green.bold("All agents completed successfully."));
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(chalk.dim(`  ⏱  Total time: ${elapsed}s\n`));

      renderResults(results);

      // ── Offer to save ────────────────────────────────────────────────────
      const { save } = await inquirer.prompt([
        {
          type: "confirm",
          name: "save",
          message: chalk.cyan("💾  Save full report to file?"),
          default: true,
        },
      ]);

      if (save) {
        const filePath = await saveResults(task.trim(), results);
        console.log(chalk.green(`  ✅  Report saved → ${filePath}\n`));
      }
    } catch (error) {
      spinner.fail(chalk.red("Pipeline failed."));
      console.error(chalk.red("\n  Error:"), error.message);
      if (process.env.DEBUG === "true") console.error(error.stack);
    }

    // ── Continue or exit ───────────────────────────────────────────────────
    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: chalk.cyan("🔄  Run another mission?"),
        default: false,
      },
    ]);

    continueLoop = again;
  }

  console.log(
    "\n" +
    chalk.bold.cyan("  🛡️  STARKNET AI — Mission Control signing off. Stay heroic.\n")
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red("\n  Fatal Error:"), err.message);
  process.exit(1);
});
