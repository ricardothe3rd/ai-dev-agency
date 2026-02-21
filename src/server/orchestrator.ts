import path from "node:path";
import fs from "node:fs";
import { BaseAgent, type EventEmitter } from "./agents/base-agent.js";
import { MessageBus } from "./comms/channel.js";
import { MemoryStore } from "./memory/store.js";
import { AGENT_PROMPTS } from "./agents/prompts.js";
import type { AgentRole, ProjectBrief, Task, WSEvent } from "./types.js";

export class Orchestrator {
  private agents = new Map<AgentRole, BaseAgent>();
  private messageBus: MessageBus;
  private store: MemoryStore;
  private emit: EventEmitter;
  private outputBase: string;
  private currentProject: string | null = null;

  constructor(emit: EventEmitter) {
    this.emit = emit;
    this.outputBase = path.join(process.cwd(), "output");
    this.store = new MemoryStore();
    this.messageBus = new MessageBus(emit);

    // Create all agents
    const roles: AgentRole[] = ["pm", "frontend-dev", "backend-dev", "designer", "qa-tester"];
    for (const role of roles) {
      const agent = new BaseAgent(
        {
          role,
          name: AGENT_PROMPTS[role].name,
          systemPrompt: AGENT_PROMPTS[role].prompt,
        },
        emit
      );
      this.agents.set(role, agent);
      this.messageBus.register(role, (from, msg) => agent.receiveMessage(from, msg));
    }
  }

  async startProject(brief: ProjectBrief) {
    const projectDir = path.join(this.outputBase, brief.projectName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    this.currentProject = brief.projectName;

    // Point all agents at the project directory
    for (const agent of this.agents.values()) {
      agent.setOutputDir(projectDir);
      agent.resetConversation();
    }

    // Clear old tasks
    this.store.clearTasks();
    this.store.createProject(brief.projectName, brief.description, projectDir);

    // Step 1: PM creates the plan
    const pm = this.agents.get("pm")!;
    this.emit({
      type: "agent_move",
      agent: "pm",
      destination: "whiteboard",
    });

    const planResponse = await pm.handleMessage(
      `New project brief from the boss:\n\n"${brief.description}"\n\nProject name: ${brief.projectName}\n\nCreate a detailed project plan. Break it down into specific tasks and assign each to the appropriate team member:\n- frontend-dev: UI components, pages, styling\n- backend-dev: APIs, database, server logic\n- designer: UI/UX structure, component hierarchy, design decisions\n- qa-tester: testing, bug finding\n\nFor each task, use the update_task tool to create it on the board. Use task IDs like "task-1", "task-2", etc.\n\nAfter creating the plan, send a summary message to each team member about what they need to do.`
    );

    // Step 2: Designer creates the design spec
    const designer = this.agents.get("designer")!;
    this.emit({ type: "agent_move", agent: "designer", destination: "designer-desk" });

    await designer.handleMessage(
      `The PM has created a project plan for "${brief.projectName}": ${brief.description}\n\nPlan summary: ${planResponse.slice(0, 1000)}\n\nCreate the UI/UX design specification. Define the component hierarchy, layout structure, color scheme, and key design decisions. Write a design-spec.md file with your recommendations. Then send the key decisions to the frontend-dev.`
    );

    // Step 3: Backend dev sets up the project structure
    const backendDev = this.agents.get("backend-dev")!;
    this.emit({ type: "agent_move", agent: "backend-dev", destination: "backend-dev-desk" });

    const backendWork = backendDev.handleMessage(
      `You're working on "${brief.projectName}": ${brief.description}\n\nSet up the backend/API layer. Create the necessary files for the server, database models, and API routes. Make sure to create a package.json with the right dependencies.`
    );

    // Step 4: Frontend dev builds the UI (can run in parallel with backend)
    const frontendDev = this.agents.get("frontend-dev")!;
    this.emit({ type: "agent_move", agent: "frontend-dev", destination: "frontend-dev-desk" });

    const frontendWork = frontendDev.handleMessage(
      `You're working on "${brief.projectName}": ${brief.description}\n\nBuild the frontend UI. Create React components, pages, and styling. Check if a design-spec.md exists and follow its guidance. Create all necessary source files.`
    );

    // Wait for both to finish
    await Promise.all([backendWork, frontendWork]);

    // Step 5: QA reviews
    const qa = this.agents.get("qa-tester")!;
    this.emit({ type: "agent_move", agent: "qa-tester", destination: "qa-tester-desk" });

    await qa.handleMessage(
      `The team has finished building "${brief.projectName}". Review the project:\n1. Use list_files to see all files\n2. Read key files to check for issues\n3. If there's a package.json, try running the project\n4. Report any bugs or issues by sending messages to the appropriate developer\n5. Write a review-notes.md with your findings`
    );

    this.emit({
      type: "project_complete",
      projectName: brief.projectName,
      outputPath: projectDir,
    });

    return projectDir;
  }

  async bossCommand(text: string) {
    this.emit({ type: "boss_command", text });
    // Route boss commands to PM first
    const pm = this.agents.get("pm")!;
    return pm.handleMessage(
      `[BOSS COMMAND]: ${text}\n\nThe boss has given a new directive. Coordinate with the team to handle this. Send messages to the appropriate agents.`
    );
  }

  getAgentInfos() {
    return Array.from(this.agents.entries()).map(([role, agent]) => ({
      role,
      name: AGENT_PROMPTS[role].name,
      status: agent.status,
      currentTask: agent.currentTask?.title || null,
      location: agent.location,
    }));
  }

  getTasks() {
    return this.store.getAllTasks();
  }

  getMessages(limit = 50) {
    return this.store.getMessages(limit);
  }

  shutdown() {
    this.store.close();
  }
}
