# STARKNET AI — Multi-Agent AI System

> A production-ready CLI-based multi-agent AI system where Avengers collaborate to solve any task — powered by Groq API + LLaMA 3.3 70B.

---

## 🧠 How It Works

```
User Task
    │
    ▼
🏹  Hawkeye          → Scrapes latest docs via Playwright
    │
    ▼
🕶️  Nick Fury        → Breaks task into mission steps
    │
    ▼
🦾  Iron Man         → Designs technical architecture
    │
    ▼
💪  Hulk             → Writes implementation code ◄─────┐
    │                                                 │
    ▼                                                 │ (Auto-Healing)
🤖  System Run       → Executes code & catches errors ──┘
    │
    ▼
🕷️  Spider-Man       → Debugs, fix errors & optimises
    │
    ▼
🛡️  Captain America  → Tests & validates correctness
    │
    ▼
🕸️  Black Widow      → Writes documentation & README
    │
    ▼
📄  Final Report (console + optional .md file)
```

Each agent is a **separate module** that makes its own independent call to the **Groq API** with a unique system prompt reflecting its role.

---

## 📁 Project Structure

```
starknet-ai/
│
├── agents/
│   ├── hawkeye.js         ← Web scout & research agent (Playwright)
│   ├── nickFury.js        ← Mission planner / orchestrator agent
│   ├── ironMan.js         ← Architecture & system design agent
│   ├── hulk.js            ← Code implementation agent
│   ├── spiderMan.js       ← Debugger & optimiser agent
│   ├── captainAmerica.js  ← Tester & validator agent
│   └── blackWidow.js      ← Documenter & README agent
│
├── core/
│   ├── orchestrator.js    ← Chains all agents in sequence
│   ├── memory.js          ← Shared in-memory context store
│   └── groqClient.js      ← Reusable Groq API client
│
├── cli/
│   └── index.js           ← CLI entry point (inquirer + chalk)
│
├── tools/
│   ├── runCommand.js      ← Shell command executor (child_process)
│   └── fileSystem.js      ← File read/write/delete utilities
│
├── output/                ← Auto-created; stores mission reports
├── .env.example           ← Environment variable template
├── .env                   ← Your secrets (never commit this)
├── package.json
└── README.md
```

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/Harsh-Pathak3601/Starknet-AI.git
cd Starknet-AI
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> Get your free API key at **https://console.groq.com**

### 3. Run

```bash
npm start
```

---

## 🚀 Usage

Once running, you'll see the STARKNET AI banner. Enter any task:

```
🎯  Enter your task for the Avengers:
> Build a REST API for a todo app with Node.js and MongoDB
```

The system will:
1. Display real-time spinner for each agent step (now 7 steps!)
2. Print all 7 agent outputs to the console
3. Optionally save a full `.md` report to the `output/` folder

---

## 🔧 Environment Variables

| Variable      | Required | Default          | Description                      |
|---------------|----------|------------------|----------------------------------|
| `GROQ_API_KEY`| ✅ Yes   | —                | Your Groq API key                |
| `GROQ_MODEL`  | No       | `llama-3.3-70b-versatile`| Groq model to use                |
| `MAX_TOKENS`  | No       | `2048`           | Max tokens per agent response    |
| `TEMPERATURE` | No       | `0.7`            | Model creativity (0.0–1.0)       |
| `DEBUG`       | No       | `false`          | Set `true` for full error stacks |

---

## 🧩 Module Reference

| Module                  | Role                                             |
|-------------------------|--------------------------------------------------|
| `core/groqClient.js`    | Single reusable function for all Groq API calls  |
| `core/memory.js`        | Shared memory store (append / read / buildContext) |
| `core/orchestrator.js`  | Chains all agents; manages data flow             |
| `agents/hawkeye.js`     | Web scout, researches latest API docs using Playwright |
| `agents/nickFury.js`    | Mission breakdown & step assignment              |
| `agents/ironMan.js`     | Technical architecture & module design           |
| `agents/hulk.js`        | Implementation + **Execution Command Suggester**  |
| `agents/spiderMan.js`   | **Auto-Healing**: Fixes stack traces from crashes |
| `agents/captainAmerica.js` | Test case generation & PASS/FAIL verdicts     |
| `agents/blackWidow.js`  | Final Markdown documentation                     |
| `tools/runCommand.js`   | Shell command execution via `child_process`      |
| `tools/fileSystem.js`   | File read / write / append / delete / list       |
| `cli/index.js`          | Interactive CLI with prompts and styled output   |

---

## 📤 Output

All mission reports are saved to the `output/` directory as Markdown files:

```
output/
└── mission-2026-04-21T12-00-00-000Z.md
```

Each report contains the structured output of all 7 agents, timestamped and labelled.

---

## 🛡️ Architecture Decisions

- **ES Modules (`"type": "module"`)** — modern, clean import/export syntax
- **Separate modules per agent** — strict separation of concerns; no merged logic
- **Shared memory via `memory.js`** — agents accumulate context without monolithic state
- **Playwright Integration** — allows the scout agent to read up-to-date docs during runs
- **Auto-Healing Execution Loop** — captures runtime errors from `child_process` and feeds them back to agents for self-correction.
- **Groq LLaMA 3.3 70B** — fast inference, high quality, cost-effective
- **`ora` + `chalk`** — production-quality CLI UX with live spinners and colour

---

## 🚫 Limitations

- Agents run **sequentially** (not in parallel) — by design, to ensure each builds on the previous
- Context window: Each agent receives the outputs of prior agents, which may hit token limits on very long tasks
- No persistent storage between sessions (memory is reset each run)

---

## 🔮 Future Improvements

- [ ] Parallel execution for independent agents
- [ ] Vector-based long-term memory (e.g., ChromaDB)
- [ ] Web dashboard for mission visualisation
- [ ] Plugin system for custom agents
- [ ] Output streaming (real-time token display)

---

## 📜 License

MIT — Built by STARKNET AI Multi-Agent System.
