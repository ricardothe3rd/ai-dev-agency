# AI Dev Agency

A 3D visual AI development agency where you give a project brief and watch a team of Claude-powered agents collaborate to build real software in an interactive office environment.

You're the boss. Type in what you want built, and watch the PM plan it out, the designer spec the UI, the devs write actual code, and QA review everything — all visible in a 3D isometric office with real-time updates.

## What Makes This Different

- **AgentCraft** = dashboard only, no visual world
- **ChatDev / MetaGPT** = terminal-only, no visual presence
- **AI Town / Smallville** = visual agents but no real coding
- **This** = visual agents that write real code to your filesystem

## How It Works

```
1. You type: "Build a fitness tracking app with React"
                          |
2. PM receives brief --> breaks into tasks --> posts on task board
                          |
3. Designer creates UI/UX spec --> writes design-spec.md
                          |
4. Frontend Dev + Backend Dev start coding in parallel (real files)
                          |
5. Agents message each other ("Hey Backend, I need an auth API")
                          |
6. QA reviews everything, sends bug reports back to devs
                          |
7. You watch all of this in the 3D office:
   - Click any agent --> see their work, code changes, thoughts
   - Task board updates in real time
   - Intervene anytime with boss commands
                          |
8. Output: working project in output/<project-name>/
```

## Tech Stack

| Layer | Tech |
|-------|------|
| 3D Scene | React Three Fiber + Drei |
| Frontend | React 19, Zustand, Tailwind CSS 4 |
| Server | Node.js, Express, WebSocket |
| AI | Claude API (`@anthropic-ai/sdk`) with tool use |
| Database | SQLite (better-sqlite3) |
| Desktop | Electron (optional) |
| Build | Vite, TypeScript |

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/ai-dev-agency.git
cd ai-dev-agency

# Install dependencies
npm install

# Set your Anthropic API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run in dev mode (server + client with hot reload)
npm run dev
```

Open http://localhost:5173 — the 3D office loads with all 5 agents at their desks.

Type a project brief in the input at the bottom, click "Start Project", and watch the team go.

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Alex (PM) | Project Manager | Receives your brief, creates plan, breaks into tasks, assigns work |
| Sam (Frontend) | Frontend Dev | Builds UI components, pages, styling with React |
| Jordan (Backend) | Backend Dev | APIs, database schemas, server logic |
| Riley (Designer) | Designer | UI/UX specs, component hierarchy, color schemes |
| Casey (QA) | QA Tester | Reviews code, finds bugs, reports issues back to devs |

## Architecture

```
Browser (React + R3F)                     Node.js Server
+-----------------------+                 +---------------------------+
| 3D Office Scene       |                 | Orchestrator              |
| Agent Characters      |  <-- WebSocket  | PM -> Designer -> Devs -> QA
| Task Board            |      (events)   |                           |
| Side Panels           |                 | MessageBus (agent comms)  |
| Brief Input           |                 | MemoryStore (SQLite)      |
+-----------------------+                 +---------------------------+
                                                    |
                                          Claude API (tool use loop)
                                                    |
                                          output/<project>/ (real files)
```

Each agent is a Claude SDK instance with:
- A role-specific system prompt
- 6 shared tools: `write_file`, `read_file`, `run_command`, `send_message`, `update_task`, `list_files`
- A tool-use loop that keeps calling Claude until no more tools are needed
- Persistent conversation history within a project session

Agent communication flows through a MessageBus — when one agent calls `send_message`, the message is actually delivered to the receiving agent's conversation.

## Boss Commands

While a project is running, you can type commands that get routed to the PM:

- "Add dark mode to the app"
- "Change the color scheme to purple"
- "Add a user profile page"
- "Prioritize the backend API"

The PM coordinates with the team to handle your directive.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server + client in dev mode |
| `npm run dev:server` | Server only (port 3001) |
| `npm run dev:client` | Vite client only (port 5173) |
| `npm run build` | Production build (client + server) |
| `npm start` | Run production server |
| `npm run electron` | Build and run as desktop app |
| `npm run package:mac` | Package as macOS .dmg |
| `npm run package:win` | Package as Windows installer |
| `npm run package:linux` | Package as Linux AppImage |

## Project Structure

```
ai-dev-agency/
├── src/
│   ├── server/
│   │   ├── index.ts              # Express + WebSocket server
│   │   ├── orchestrator.ts       # Project workflow: PM -> Design -> Dev -> QA
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── agents/
│   │   │   ├── base-agent.ts     # Claude SDK wrapper with tool loop
│   │   │   └── prompts.ts        # Role-specific system prompts
│   │   ├── comms/
│   │   │   └── channel.ts        # MessageBus for inter-agent messaging
│   │   └── memory/
│   │       └── store.ts          # SQLite persistence (tasks, messages, memory)
│   │
│   └── client/
│       ├── App.tsx               # Main layout (3D viewport + sidebar)
│       ├── main.tsx              # React entry point
│       ├── index.css             # Tailwind + global styles
│       ├── hooks/
│       │   ├── useWebSocket.ts   # WebSocket connection with auto-reconnect
│       │   └── useAgentState.ts  # Zustand store for agents, tasks, events
│       ├── scene/
│       │   ├── Office.tsx        # 3D office (walls, desks, whiteboard)
│       │   ├── Agent3D.tsx       # 3D agent characters with animations
│       │   ├── TaskBoard3D.tsx   # 3D task board on the whiteboard
│       │   ├── Camera.tsx        # Isometric orthographic camera
│       │   └── Atmosphere.tsx    # Particles, glow orbs, fog
│       └── panels/
│           ├── BriefInput.tsx    # Project brief / boss command input
│           ├── AgentDetail.tsx   # Selected agent detail panel
│           ├── TaskList.tsx      # Task board with status indicators
│           ├── ChatLog.tsx       # Agent activity feed
│           └── FileExplorer.tsx  # Real-time generated file tree
│
├── electron/
│   ├── main.ts                   # Electron main process
│   └── tsconfig.json
│
├── output/                       # Generated projects land here
├── package.json
├── tsconfig.json
├── tsconfig.server.json
└── vite.config.ts
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `PORT` | Server port | 3001 |

The default model is `claude-sonnet-4-20250514`. To change it, modify the `model` field in `src/server/agents/base-agent.ts`.

## API Cost Estimate

Each agent action is a Claude API call (~500-2000 tokens). A simple project brief might require 50-200 agent actions across all 5 agents.

| Project Complexity | Estimated Cost |
|-------------------|---------------|
| Simple (todo app) | ~$1-5 |
| Medium (blog, dashboard) | ~$5-15 |
| Complex (full-stack app) | ~$15-30 |

## Known Limitations

- **Experimental** — this is a proof of concept, not production software
- **No git integration** — generated projects are plain files, not git repos
- **Sequential within agents** — each agent processes one task at a time
- **No file conflict resolution** — if two agents write to the same file, last write wins
- **Context window limits** — very large projects may exceed Claude's context window
- **No streaming** — agent responses arrive after full completion, not streamed token-by-token
- **Cost** — running 5 Claude instances in parallel adds up; monitor your API usage

## License

MIT
