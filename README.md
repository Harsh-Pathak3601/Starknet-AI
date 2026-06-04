# STARKNET AI — Multi-Agent AI System (Advanced Edition)

> A production-grade CLI-based multi-agent AI system where the Elite 7 Avengers collaborate to build, test, and deploy full-stack projects — powered by Groq API + LLaMA 3.3 70B.

---

## 🧠 The Evolution: "The Jarvis Era"

Starknet AI has evolved from a linear pipeline into an autonomous engineering engine. It now features **Stateful Chunking**, **Smart Context Mastery**, and **Auto-Deployment** to the cloud.

### 🛡️ The Elite 7 Pipeline

```
User Task
    │
    ▼
🏹  Hawkeye          → Web Research & Intel Gathering
    │
    ▼
🕶️  Nick Fury        → Mission Planning & Memory Condensation
    │
    ▼
🦾  Iron Man         → Full-Stack Architecture & Scaffolding
    │
    ▼
💪  Hulk             → Stateful Implementation (Chunked Mode) ◄──┐
    │                                                           │
    ▼                                                           │ (Auto-Healing)
🕷️  Spider-Man       → Master Debugger & Security Auditor ──────┘
    │
    ▼
🛡️  Captain America  → E2E Testing & QA Validation
    │
    ▼
🤖  Vision           → Git Push, Vercel Deploy & Visual Audit
    │
    ▼
📄  Final Mission Report & Live Production URL
```

---

## 🚀 Key Advanced Features

### 1. 🏗️ Stateful Chunking (Hulk v2)
Building a 20-file project? No problem. Hulk now operates in **Chunked Mode**, writing one file at a time. This prevents output token cutoffs and ensures every line of code is production-ready.

### 2. 🧠 Context Mastery (Nick Fury v2)
Never hit a "Token Limit Exceeded" error again.
- **Sliding Window**: Automatically drops the least relevant old context.
- **Memory Condensation**: Nick Fury "garbage collects" and summarizes mission logs when the context window fills up, keeping the "intelligence" focused.

### 3. 🌐 Autonomous Infrastructure (Vision v1)
Vision handles the "Last Mile" of development:
- **Git Integration**: Automatically commits and pushes your code to GitHub.
- **Auto-Deploy**: Deploys the generated workspace to **Vercel** production.
- **Visual Audit**: Uses Playwright to screenshot the live site and perform a UX/Visual quality audit.

---

## 📁 Project Structure

```
starknet-ai/
│
├── agents/
│   ├── hawkeye.js         ← Research + Intel (Playwright)
│   ├── nickFury.js        ← Orchestrator + Memory Condenser
│   ├── ironMan.js         ← Architect & System Design
│   ├── hulk.js            ← Engineer (Stateful Chunking)
│   ├── spiderMan.js       ← Debugger & Auto-Healing
│   ├── captainAmerica.js  ← Tester & QA Specialist
│   └── vision.js          ← CI/CD, Deploy & Visual Auditor
│
├── core/
│   ├── orchestrator.js    ← The "Brain" (Wires all 7 agents)
│   ├── memory.js          ← Token-safe shared store
│   ├── contextManager.js  ← Sliding window & summarization logic
│   └── llmClient.js       ← Groq API client (with auto-retry)
│
├── tools/
│   ├── gitTool.js         ← Git operations (init, add, commit, push)
│   ├── deployTool.js      ← Vercel deployment wrapper
│   ├── runCommand.js      ← Shell executor (child_process)
│   └── fileSystem.js      ← File read/write utilities
│
└── .env                   ← Your mission secrets
```

---

## ⚙️ Setup

### 1. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required keys:

```env
GROQ_API_KEY=your_key
VERCEL_TOKEN=your_token_for_auto_deploy
CHUNKED_MODE=true           # Recommended for full-stack projects
CONTEXT_TOKEN_LIMIT=30000   # Optimized for Free Tier
```

### 2. Run Mission

```bash
npm start
```

---

## 🔧 Advanced Configurations

| Variable | Recommended | Description |
| :--- | :--- | :--- |
| `CHUNKED_MODE` | `true` | Writes files one-by-one (safer for big projects). |
| `CONTEXT_TOKEN_LIMIT` | `30000` | Triggers Nick Fury to condense context earlier. |
| `MAX_TOKENS` | `4096` | Max tokens per file chunk. |
| `VERCEL_TOKEN` | — | Required for Vision's deployment step. |

---

## 🛡️ Architecture Decisions

- **ReAct-Lite Engine** — Orchestrator manages state dynamically using a centralized context manager.
- **Stateful Persistence** — All agent outputs are tracked; Nick Fury summarizes them to preserve "Strategic Intent" over long sessions.
- **Model Context Protocol (MCP) Ready** — Tools are modularized to eventually support full MCP integration.
- **Headless UI Audits** — Vision "sees" the web using Playwright + LLM vision proxies.

---

## 📜 License

MIT — Built by STARKNET AI Multi-Agent System.

> *"The future isn't something we wait for, it's something we build." — Tony Stark*
etween sessions (memory is reset each run)

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
