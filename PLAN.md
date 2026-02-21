# AI Dev Agency — 3D Visual Coding Team

## Context

Build a visual AI development agency where you give a project brief (e.g., "Build me a fitness app") and a team of AI agents — visible in an interactive office environment — collaborates to build it. You're the boss/client. You watch over all of them as they work, see real-time progress, and can intervene at any point. The code output is REAL.

**What makes this different from everything else:**
- AgentCraft = dashboard only, no visual world
- ChatDev/MetaGPT = terminal-only, no visual presence
- AI Town/Smallville = visual agents but no real coding
- **This = visual agents that do REAL coding work**

**Inspiration sources:**
- [Smallville / Generative Agents](https://github.com/joonspk-research/generative_agents) — Memory + Reflection + Planning cognitive architecture
- [AgentCraft](https://www.getagentcraft.com/) — RTS-style agent management for Claude Code
- [AI Town](https://github.com/a16z-infra/ai-town) — 2D visual world with agent characters (PixiJS + Convex)
- [ChatDev](https://github.com/OpenBMB/ChatDev) — Multi-agent software company (CEO, CTO, Dev, Tester)
- [MetaGPT](https://github.com/FoundationAgents/MetaGPT) — SOP-based software company simulation
- [Project Sid](https://arxiv.org/html/2411.00114v1) — Emergent roles in AI civilization (Minecraft)
- [AI People](https://www.aipeoplegame.com/) — NPCs with long-term memory and personalities (Unity)

---

## The Team (Agent Roles)

| Role | What They Do | Visual |
|------|-------------|--------|
| **Project Manager** | Receives your brief, creates plan, breaks into tasks, assigns work | Whiteboard/planning desk |
| **Frontend Dev** | Builds UI components, pages, styling | Desk with monitor showing code |
| **Backend Dev** | APIs, database, server logic | Desk with terminal |
| **Designer** | UI/UX decisions, component structure, color schemes | Desk with design tools |
| **QA Tester** | Runs tests, finds bugs, reports issues | Desk with test results |

You (the boss) type in your brief and watch them go.

---

## How It Works

```
1. YOU: "Build a fitness tracking app with React Native"
          ↓
2. PM receives brief → breaks into tasks → posts on task board
          ↓
3. Designer plans the UI structure & component hierarchy
          ↓
4. Frontend Dev + Backend Dev start coding (real files, real code)
          ↓
5. Agents talk to each other ("Hey Backend, I need an API for user auth")
          ↓
6. QA Tester runs the code, finds bugs, sends back to devs
          ↓
7. YOU see all of this happening in the visual office
   - Click any agent → see their current work, code changes, thoughts
   - Click task board → see overall progress
   - Intervene anytime → "Change the color scheme" or "Add a feature"
          ↓
8. Output: Working project in a folder on your machine
```

---

## Tech Stack

### Frontend (The Visual Office)
- **React** — UI framework
- **React Three Fiber** — 3D isometric office rendering
- **Drei** — R3F utility library (cameras, controls, text)
- **Zustand** — State management for agent positions, status, tasks
- **Tailwind CSS** — Side panels, chat, task board UI

### Backend (The Brain)
- **Node.js + TypeScript** — Orchestrator server
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) — Each agent is a Claude instance with a role-specific system prompt
- **WebSocket** — Real-time streaming of agent actions to frontend

### Data
- **File system** — Real project files written to disk
- **SQLite** (via better-sqlite3) — Agent memory, task tracking, conversation history

---

## Project Structure

```
ai-dev-agency/
├── package.json
├── tsconfig.json
├── .env                          ← ANTHROPIC_API_KEY
│
├── src/
│   ├── server/                   ← Backend orchestrator
│   │   ├── index.ts              ← Express + WebSocket server
│   │   ├── orchestrator.ts       ← Receives brief, manages workflow
│   │   ├── agents/
│   │   │   ├── base-agent.ts     ← Base agent class (Claude SDK wrapper)
│   │   │   ├── pm-agent.ts       ← Project Manager (plans, assigns tasks)
│   │   │   ├── frontend-agent.ts ← Frontend Developer
│   │   │   ├── backend-agent.ts  ← Backend Developer
│   │   │   ├── designer-agent.ts ← Designer
│   │   │   └── qa-agent.ts       ← QA Tester
│   │   ├── memory/
│   │   │   └── store.ts          ← SQLite memory (tasks, conversations, agent state)
│   │   └── comms/
│   │       └── channel.ts        ← Inter-agent messaging system
│   │
│   └── client/                   ← Frontend (React + R3F)
│       ├── App.tsx               ← Main app layout
│       ├── scene/
│       │   ├── Office.tsx        ← 3D office environment (walls, desks, objects)
│       │   ├── Agent3D.tsx       ← 3D agent character component
│       │   ├── TaskBoard3D.tsx   ← 3D task board in the office
│       │   └── Camera.tsx        ← Isometric orthographic camera + controls
│       ├── panels/
│       │   ├── BriefInput.tsx    ← Where you type your project brief
│       │   ├── AgentDetail.tsx   ← Side panel: what agent is doing, code diff
│       │   ├── TaskList.tsx      ← All tasks with status
│       │   ├── ChatLog.tsx       ← Agent conversations log
│       │   └── FileExplorer.tsx  ← Real-time file tree of generated project
│       └── hooks/
│           ├── useWebSocket.ts   ← WebSocket connection to server
│           └── useAgentState.ts  ← Zustand store for all agents
│
├── assets/
│   └── models/                   ← 3D models (.glb) for office, characters
│
└── output/                       ← Where generated projects get written
    └── [project-name]/
```

---

## Agent Architecture (The Brain)

Each agent is a Claude SDK instance with:

### 1. Role-specific system prompt
```
PM: "You are a Project Manager. You receive project briefs, break them
    into tasks, assign them to team members, and track progress..."

Frontend Dev: "You are a Senior Frontend Developer. You write React/
    React Native components. You receive tasks from the PM and design
    specs from the Designer..."
```

### 2. Shared tools
- `write_file(path, content)` — Write code to the output project
- `read_file(path)` — Read existing project files
- `run_command(cmd)` — Run terminal commands (npm install, tests)
- `send_message(to_agent, message)` — Talk to another agent
- `update_task(task_id, status, notes)` — Update task on the board
- `request_review(agent, file)` — Ask another agent to review

### 3. Memory (Smallville-inspired)
- Each agent remembers: past tasks, conversations, what files they've touched
- **Memory stream**: Records every observation/action with timestamp + importance score
- **Reflection**: Periodically synthesizes memories into higher-level insights
- **Retrieval**: Uses recency + importance + relevance to surface relevant memories

---

## Communication Flow

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (React + R3F)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 3D Office │  │Agent View│  │Task Board│  │ Brief   │ │
│  │  Scene    │  │  Panel   │  │  Panel   │  │ Input   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┴─────────────┴─────────────┘      │
│                        WebSocket                         │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│                   NODE.JS SERVER                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              ORCHESTRATOR                            │ │
│  │  Receives brief → Creates plan → Manages workflow   │ │
│  └──────────┬──────────────────────────────────────────┘ │
│             │                                             │
│  ┌──────────▼──────────────────────────────────────────┐ │
│  │           MESSAGE BUS (Inter-Agent Comms)           │ │
│  ├──────┬──────┬──────┬──────┬──────┤                  │ │
│  │  PM  │ FE   │ BE   │Design│  QA  │                  │ │
│  │Agent │Agent │Agent │Agent │Agent │                  │ │
│  └──┬───┴──┬───┴──┬───┴──┬───┴──┬───┘                  │ │
│     │      │      │      │      │                        │
│  ┌──▼──────▼──────▼──────▼──────▼───┐                   │
│  │       Claude Agent SDK           │                   │
│  │   (Anthropic API — does the      │                   │
│  │    actual thinking + coding)     │                   │
│  └──────────────────────────────────┘                   │
│                                                           │
│  ┌─────────────┐  ┌──────────────────┐                  │
│  │ SQLite      │  │ File System      │                  │
│  │ (memory,    │  │ (output project  │                  │
│  │  tasks)     │  │  files)          │                  │
│  └─────────────┘  └──────────────────┘                  │
└───────────────────────────────────────────────────────────┘
```

---

## Events Streamed to Frontend (via WebSocket)

Every action an agent takes gets broadcast to the UI:

```typescript
// Agent starts working on a task
{ type: "agent_status", agent: "frontend-dev", status: "working", task: "Build login page" }

// Agent writes a file
{ type: "file_write", agent: "backend-dev", path: "src/api/auth.ts", preview: "..." }

// Agent talks to another agent
{ type: "message", from: "designer", to: "frontend-dev", text: "Use blue for primary buttons" }

// Task status changes
{ type: "task_update", id: "task-3", status: "in_progress", assignee: "frontend-dev" }

// Agent moves to a location (for 3D visualization)
{ type: "agent_move", agent: "qa-tester", destination: "testing-desk" }

// Agent is thinking/reasoning
{ type: "agent_thinking", agent: "pm", thought: "Breaking feature into subtasks..." }
```

The frontend maps these events to:
- Agent character animations (walking, typing, talking)
- Task board updates
- File explorer changes
- Chat log entries
- Code diff views

---

## Phased Build Plan

### Phase 1 — MVP: Server + Basic Web UI (no 3D yet)
**Goal:** Get the multi-agent coding workflow working first.

1. Set up Node.js server with Express + WebSocket
2. Build the orchestrator (receives brief → creates plan)
3. Implement PM agent (Claude SDK with planning system prompt)
4. Implement 1 developer agent (writes real code)
5. Implement inter-agent messaging
6. Basic React frontend: brief input, task list, chat log, file explorer
7. **Test:** Give it a simple brief, watch agents build something real

### Phase 2 — Full Agent Team
1. Add all 5 agents (PM, Frontend Dev, Backend Dev, Designer, QA)
2. Add agent memory (SQLite store)
3. Add task assignment and review workflow
4. Add `run_command` tool (npm install, test running)
5. **Test:** Give it a real project brief, get a working app out

### Phase 3 — 3D Office Visualization
1. Build isometric 3D office with React Three Fiber
2. Low-poly office: desks, monitors, whiteboard, break room
3. Agent characters (simple low-poly or stylized models)
4. Agents walk to their desks, animate typing when coding
5. Agents walk to each other when communicating
6. Click agent → side panel shows their current work
7. Task board visible in the 3D scene

### Phase 4 — Polish & Advanced Features
1. Agent personality (different coding styles, preferences)
2. Progress visualization (percentage bars above desks)
3. Boss commands ("prioritize this", "change approach", "add a feature")
4. Project history (replay past projects)
5. Sound effects & ambient office sounds
6. Dark/light theme

### Phase 5 — Ship It
1. Package as a desktop app (Electron or Tauri)
2. One-command install
3. Documentation & demo video
4. Open source on GitHub

---

## Verification

### Phase 1 Test
- Run `npm run dev` → server starts on localhost
- Open browser → type "Build a todo app with React"
- PM creates task plan → Developer writes code
- `output/todo-app/` folder contains working React app
- `cd output/todo-app && npm install && npm start` → app runs

### Phase 3 Test
- 3D office renders with all agent characters at desks
- Give a brief → agents animate (walk, type, talk to each other)
- Click agent → see their code, thoughts, current task
- Task board updates in real time
- Generated project still works

---

## Key Dependencies

```json
{
  "server": {
    "@anthropic-ai/claude-agent-sdk": "AI brain for each agent",
    "express": "HTTP server",
    "ws": "WebSocket for real-time updates",
    "better-sqlite3": "Agent memory + task tracking"
  },
  "client": {
    "react": "UI framework",
    "@react-three/fiber": "3D rendering",
    "@react-three/drei": "3D utilities",
    "zustand": "State management",
    "tailwindcss": "Panel/UI styling"
  }
}
```

---

## Cost Estimate (Claude API)

- Each agent action ≈ 500-2000 tokens
- A simple project brief might require 50-200 agent actions
- At ~$0.015/1K input + $0.075/1K output tokens (Sonnet)
- **Simple project:** ~$1-5
- **Complex project:** ~$10-30
- Could optimize with caching and smarter prompts

---

## Research & References

| Project | What to Learn From It |
|---------|----------------------|
| [Smallville](https://github.com/joonspk-research/generative_agents) | Memory → Reflection → Planning cognitive architecture |
| [AgentCraft](https://www.getagentcraft.com/) | RTS-style agent management UX |
| [AI Town](https://github.com/a16z-infra/ai-town) | Visual 2D world rendering + Convex real-time backend |
| [ChatDev](https://github.com/OpenBMB/ChatDev) | Multi-agent role specialization for software dev |
| [MetaGPT](https://github.com/FoundationAgents/MetaGPT) | SOP workflow + inter-agent communication |
| [Project Sid](https://arxiv.org/html/2411.00114v1) | Emergent self-organization in agent societies |
| [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) | Streaming hooks, custom tools, system prompts |
