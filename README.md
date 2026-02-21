<div align="center">

<img src="assets/banner.svg" alt="AI Dev Agency" width="100%">

<br />
<br />

**Give a project brief. Watch a team of AI agents build it — live, in 3D.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Claude](https://img.shields.io/badge/Powered_by-Claude_API-D97757?style=flat-square)](https://anthropic.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

[Quick Start](#-quick-start) &middot; [How It Works](#-how-it-works) &middot; [The Team](#-the-team) &middot; [Architecture](#-architecture) &middot; [Boss Commands](#-boss-commands)

</div>

---

<br />

> [!NOTE]
> This is a proof-of-concept / experimental project. Each project brief will make multiple Claude API calls across 5 agents — monitor your API usage.

<br />

## What Is This?

A **3D isometric office** where 5 Claude-powered AI agents — a PM, Designer, Frontend Dev, Backend Dev, and QA Tester — collaborate to build real software from your project brief. You're the boss. You watch them plan, design, code, and review in real-time, and can intervene at any point.

The code output is **real** — actual project files written to your filesystem.

<br />

### How is this different?

| Project | Visual World | Real Code Output | Agent Communication |
|:--------|:------------:|:----------------:|:-------------------:|
| AgentCraft | :x: Dashboard only | :white_check_mark: | :white_check_mark: |
| ChatDev / MetaGPT | :x: Terminal only | :white_check_mark: | :white_check_mark: |
| AI Town / Smallville | :white_check_mark: | :x: | :white_check_mark: |
| **AI Dev Agency** | :white_check_mark: **3D Office** | :white_check_mark: | :white_check_mark: |

<br />

## :rocket: Quick Start

```bash
# Clone the repo
git clone https://github.com/ricardothe3rd/ai-dev-agency.git
cd ai-dev-agency

# Install dependencies
npm install

# Set your Anthropic API key
cp .env.example .env
# Edit .env → add your ANTHROPIC_API_KEY

# Launch (server + client with hot reload)
npm run dev
```

Open **http://localhost:5173** — the 3D office loads with all 5 agents at their desks.

> [!TIP]
> Type a brief like *"Build a todo app with React and Express"* in the input at the bottom, hit **Start Project**, and watch the team go.

<br />

## :clapper: How It Works

```
  YOU: "Build a fitness tracking app with React"
   │
   ▼
┌─────────────────────────────────────────────────────┐
│  ALEX (PM)                                          │
│  Receives brief → breaks into tasks → assigns work  │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            │            ▼
   ┌─────────────┐    │    ┌──────────────┐
   │ RILEY       │    │    │ JORDAN       │
   │ (Designer)  │    │    │ (Backend)    │
   │ UI/UX spec  │    │    │ APIs + DB    │
   └──────┬──────┘    │    └──────┬───────┘
          │           │           │
          ▼           │           │
   ┌─────────────┐    │           │
   │ SAM         │◄───┘           │
   │ (Frontend)  │ reads design   │
   │ React UI    │ spec           │
   └──────┬──────┘                │
          │                       │
          └───────────┬───────────┘
                      ▼
            ┌──────────────────┐
            │ CASEY (QA)       │
            │ Reviews code     │
            │ Sends bug reports│──── feedback loop ──→ Devs fix
            └──────────────────┘
                      │
                      ▼
            output/your-project/
            (real files on disk)
```

**Everything streams to your browser in real-time:**

- :eyes: **Watch agents** think, code, and talk to each other in the 3D office
- :clipboard: **Task board** updates as work progresses on the 3D whiteboard
- :speech_balloon: **Activity feed** shows inter-agent messages and commands
- :file_folder: **File explorer** shows generated files as they're written
- :point_up: **Click any agent** to inspect their current work and recent activity
- :mega: **Boss commands** let you redirect the team mid-project

<br />

## :busts_in_silhouette: The Team

<table>
  <tr>
    <td align="center" width="20%">
      <br />
      <img src="https://img.shields.io/badge/PM-eab308?style=for-the-badge" alt="PM" /><br />
      <strong>Alex</strong><br />
      <sub>Project Manager</sub><br /><br />
      <sub>Receives your brief, creates the plan, breaks it into tasks, assigns work, coordinates the team</sub>
    </td>
    <td align="center" width="20%">
      <br />
      <img src="https://img.shields.io/badge/Designer-ec4899?style=for-the-badge" alt="Designer" /><br />
      <strong>Riley</strong><br />
      <sub>UI/UX Designer</sub><br /><br />
      <sub>Defines component hierarchy, color schemes, layouts, writes design-spec.md</sub>
    </td>
    <td align="center" width="20%">
      <br />
      <img src="https://img.shields.io/badge/Frontend-3b82f6?style=for-the-badge" alt="Frontend" /><br />
      <strong>Sam</strong><br />
      <sub>Frontend Dev</sub><br /><br />
      <sub>Builds React UI components, pages, styling, follows the design spec</sub>
    </td>
    <td align="center" width="20%">
      <br />
      <img src="https://img.shields.io/badge/Backend-22c55e?style=for-the-badge" alt="Backend" /><br />
      <strong>Jordan</strong><br />
      <sub>Backend Dev</sub><br /><br />
      <sub>APIs, database schemas, server logic, sets up project structure</sub>
    </td>
    <td align="center" width="20%">
      <br />
      <img src="https://img.shields.io/badge/QA-f97316?style=for-the-badge" alt="QA" /><br />
      <strong>Casey</strong><br />
      <sub>QA Tester</sub><br /><br />
      <sub>Reviews all code, finds bugs, reports issues back to devs for fixing</sub>
    </td>
  </tr>
</table>

<br />

## :world_map: The 3D Office

The office is built with **React Three Fiber** and rendered in an isometric orthographic view:

- **5 desks** with monitors, chairs, and role-colored labels
- **Whiteboard** showing the live task board with status indicators
- **Agent characters** — capsule bodies with sphere heads, color-coded by role
- **Working animations** — agents bob and emit orbital particles when active
- **Status indicators** — text labels show thinking, working, or idle state
- **Floating particles** and **glow orbs** for atmosphere
- **Fog** for depth
- **Click-to-select** — click any agent to inspect their work in the sidebar

The camera supports **orbit, pan, and zoom** so you can explore the office from any angle.

<br />

## :building_construction: Architecture

```
Browser (React + R3F)                     Node.js Server
+──────────────────────+                  +──────────────────────────+
│                      │                  │ Orchestrator             │
│  3D Office Scene     │                  │ ┌──┐┌──┐┌──┐┌──┐┌──┐   │
│  Agent Characters    │  ◄── WebSocket   │ │PM││DS││FE││BE││QA│   │
│  Task Board          │     (real-time)  │ └──┘└──┘└──┘└──┘└──┘   │
│  Sidebar Panels      │                  │        │                │
│  Brief Input         │                  │  MessageBus (delivery)  │
│                      │                  │  MemoryStore (SQLite)   │
+──────────────────────+                  +────────────┬────────────+
                                                       │
                                              Claude API (tool use)
                                                       │
                                              output/<project>/
```

Each agent is a **Claude SDK instance** with:

| Component | Description |
|-----------|-------------|
| **System prompt** | Role-specific personality and guidelines |
| **6 tools** | `write_file`, `read_file`, `run_command`, `send_message`, `update_task`, `list_files` |
| **Tool-use loop** | Keeps calling Claude until no more tools are needed |
| **MessageBus** | Messages sent via `send_message` are actually delivered to the receiving agent |
| **MemoryStore** | Tasks and messages persist in SQLite — survive browser refresh |

<br />

## :mega: Boss Commands

While a project is running, type commands that get routed through the PM:

```
"Add dark mode to the app"
"Change the color scheme to purple"
"Add a user profile page"
"Prioritize the backend API first"
"The login page needs a forgot password link"
```

The PM reads your directive, creates new tasks if needed, and sends messages to the appropriate agents.

<br />

## :wrench: Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server + client in dev mode (hot reload) |
| `npm run dev:server` | Server only (port 3001) |
| `npm run dev:client` | Vite client only (port 5173) |
| `npm run build` | Production build (client + server) |
| `npm start` | Run production server |
| `npm run electron` | Build and launch as desktop app |
| `npm run package:mac` | Package as macOS `.dmg` |
| `npm run package:win` | Package as Windows installer |
| `npm run package:linux` | Package as Linux AppImage |

<br />

## :open_file_folder: Project Structure

<details>
<summary><strong>Click to expand full tree</strong></summary>

```
ai-dev-agency/
├── src/
│   ├── server/
│   │   ├── index.ts              # Express + WebSocket server
│   │   ├── orchestrator.ts       # Workflow: PM → Design → Dev → QA
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── agents/
│   │   │   ├── base-agent.ts     # Claude SDK wrapper with tool-use loop
│   │   │   └── prompts.ts        # Role-specific system prompts
│   │   ├── comms/
│   │   │   └── channel.ts        # MessageBus for inter-agent messaging
│   │   └── memory/
│   │       └── store.ts          # SQLite (tasks, messages, agent memory)
│   │
│   └── client/
│       ├── App.tsx               # Main layout (3D viewport + sidebar)
│       ├── main.tsx              # React entry point
│       ├── index.css             # Tailwind + global styles
│       ├── hooks/
│       │   ├── useWebSocket.ts   # Auto-reconnecting WebSocket
│       │   └── useAgentState.ts  # Zustand store (agents, tasks, events)
│       ├── scene/
│       │   ├── Office.tsx        # 3D office (walls, desks, whiteboard)
│       │   ├── Agent3D.tsx       # Agent characters + working animations
│       │   ├── TaskBoard3D.tsx   # Task cards on the whiteboard
│       │   ├── Camera.tsx        # Isometric orthographic camera
│       │   └── Atmosphere.tsx    # Particles, glow orbs, fog
│       └── panels/
│           ├── BriefInput.tsx    # Brief input / boss command overlay
│           ├── AgentDetail.tsx   # Agent inspection panel
│           ├── TaskList.tsx      # Task board with status dots
│           ├── ChatLog.tsx       # Agent activity feed
│           └── FileExplorer.tsx  # Generated file tree
│
├── electron/
│   ├── main.ts                   # Electron main process
│   └── tsconfig.json
│
├── output/                       # Generated projects land here
├── assets/
│   └── banner.svg                # README banner
├── package.json
├── tsconfig.json
├── tsconfig.server.json
└── vite.config.ts
```

</details>

<br />

## :gear: Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | **Required** |
| `PORT` | Server port | `3001` |

> [!IMPORTANT]
> The default model is `claude-sonnet-4-20250514`. To change it, edit the `model` field in `src/server/agents/base-agent.ts`.

<br />

## :moneybag: API Cost Estimate

Each agent action is a Claude API call. A simple project brief triggers 50-200+ calls across all 5 agents.

| Project Complexity | Example | Estimated Cost |
|:-------------------|:--------|:--------------:|
| Simple | Todo app, calculator | ~$1–5 |
| Medium | Blog, dashboard | ~$5–15 |
| Complex | Full-stack app with auth | ~$15–30 |

<br />

## :dart: Tech Stack

<p>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge" alt="Claude API" />
</p>

<br />

## :construction: Known Limitations

- **Experimental** — proof of concept, not production software
- **No git integration** — output projects are plain files, not git repos
- **Sequential per agent** — each agent processes one task at a time
- **No file conflict resolution** — if two agents write the same file, last write wins
- **Context window limits** — very large projects may exceed Claude's context
- **No streaming** — agent responses arrive after full completion
- **Cost** — 5 Claude instances working in parallel adds up fast

<br />

## :handshake: Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-thing`)
3. Commit your changes (`git commit -m 'Add amazing thing'`)
4. Push (`git push origin feature/amazing-thing`)
5. Open a Pull Request

<br />

## :page_facing_up: License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

```
MIT License

Copyright (c) 2025 Ricardo Argana

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

<br />

**[Report Bug](https://github.com/ricardothe3rd/ai-dev-agency/issues)** &middot; **[Request Feature](https://github.com/ricardothe3rd/ai-dev-agency/issues)**

<sub>Built by <a href="https://github.com/ricardothe3rd">Ricardo Argana</a> with Claude</sub>

<br />

<a href="https://github.com/ricardothe3rd/ai-dev-agency">
  <img src="https://img.shields.io/github/stars/ricardothe3rd/ai-dev-agency?style=social" alt="Stars" />
</a>

</div>
