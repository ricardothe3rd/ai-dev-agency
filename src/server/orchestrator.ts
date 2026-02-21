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
  readonly store: MemoryStore;
  private emit: EventEmitter;
  private outputBase: string;
  private currentProject: string | null = null;

  constructor(emit: EventEmitter) {
    this.emit = emit;
    this.outputBase = path.join(process.cwd(), "output");
    this.store = new MemoryStore();
    this.messageBus = new MessageBus(emit);

    // Create all agents with shared MessageBus and MemoryStore
    const roles: AgentRole[] = ["pm", "frontend-dev", "backend-dev", "designer", "qa-tester"];
    for (const role of roles) {
      const agent = new BaseAgent(
        {
          role,
          name: AGENT_PROMPTS[role].name,
          systemPrompt: AGENT_PROMPTS[role].prompt,
        },
        emit,
        this.messageBus,
        this.store
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

    // ── Step 1: PM creates the plan and tasks ──
    const pm = this.agents.get("pm")!;
    this.emit({ type: "agent_move", agent: "pm", destination: "whiteboard" });

    await pm.handleMessage(
      `New project brief from the boss:\n\n"${brief.description}"\n\nProject name: ${brief.projectName}\n\nCreate a detailed project plan. Break it into specific tasks and create each one using the update_task tool. For EVERY task:\n- Use a clear task ID (task-1, task-2, etc.)\n- Include a descriptive title\n- Include a detailed description of what needs to be done\n- Assign it to the right team member using the assignee field:\n  - "frontend-dev" for UI components, pages, styling\n  - "backend-dev" for APIs, database, server logic\n  - "designer" for UI/UX specs, component hierarchy, design decisions\n  - "qa-tester" for testing and quality assurance\n- Set status to "pending"\n\nAfter creating all tasks, send a summary message to each team member about their assignments.`
    );

    // ── Step 2: Read tasks from DB ──
    const allTasks = this.store.getAllTasks();
    const tasksByRole = new Map<AgentRole, Task[]>();
    for (const task of allTasks) {
      if (task.assignee) {
        const existing = tasksByRole.get(task.assignee) || [];
        existing.push(task);
        tasksByRole.set(task.assignee, existing);
      }
    }

    // ── Step 3: Designer works first (design informs frontend) ──
    const designerTasks = tasksByRole.get("designer") || [];
    if (designerTasks.length > 0) {
      const designer = this.agents.get("designer")!;
      this.emit({ type: "agent_move", agent: "designer", destination: "designer-desk" });
      for (const task of designerTasks) {
        await designer.assignTask(task);
      }
    }

    // ── Step 4: Backend + Frontend in parallel ──
    const backendTasks = tasksByRole.get("backend-dev") || [];
    const frontendTasks = tasksByRole.get("frontend-dev") || [];

    const backendWork = (async () => {
      if (backendTasks.length === 0) return;
      const backend = this.agents.get("backend-dev")!;
      this.emit({ type: "agent_move", agent: "backend-dev", destination: "backend-dev-desk" });
      for (const task of backendTasks) {
        await backend.assignTask(task);
      }
    })();

    const frontendWork = (async () => {
      if (frontendTasks.length === 0) return;
      const frontend = this.agents.get("frontend-dev")!;
      this.emit({ type: "agent_move", agent: "frontend-dev", destination: "frontend-dev-desk" });
      // Give frontend the design context if available
      const designSpec = this.tryReadFile(projectDir, "design-spec.md");
      if (designSpec) {
        await frontend.handleMessage(
          `The designer has created a design specification:\n\n${designSpec.slice(0, 2000)}\n\nKeep this in mind as you work on your tasks.`
        );
      }
      for (const task of frontendTasks) {
        await frontend.assignTask(task);
      }
    })();

    await Promise.all([backendWork, frontendWork]);

    // ── Step 5: QA review ──
    const qa = this.agents.get("qa-tester")!;
    this.emit({ type: "agent_move", agent: "qa-tester", destination: "qa-tester-desk" });

    const qaTasks = tasksByRole.get("qa-tester") || [];
    if (qaTasks.length > 0) {
      for (const task of qaTasks) {
        await qa.assignTask(task);
      }
    } else {
      // No explicit QA tasks — tell QA to do a general review
      await qa.handleMessage(
        `The team has finished building "${brief.projectName}". Do a full review:\n1. Use list_files to see all project files\n2. Read key files to check for issues\n3. If there's a package.json, check dependencies are correct\n4. Report any bugs by sending messages to the responsible developer\n5. Write a review-notes.md with your findings\n6. Update any relevant task statuses`
      );
    }

    // ── Step 6: Feedback loop (one iteration) ──
    const tasksAfterQA = this.store.getAllTasks();
    const blockedTasks = tasksAfterQA.filter((t) => t.status === "blocked");

    if (blockedTasks.length > 0) {
      // Re-assign blocked tasks to the responsible devs
      for (const task of blockedTasks) {
        if (task.assignee && this.agents.has(task.assignee)) {
          const agent = this.agents.get(task.assignee)!;
          this.emit({ type: "agent_move", agent: task.assignee, destination: `${task.assignee}-desk` });
          await agent.handleMessage(
            `QA has found issues with your task "${task.title}" (${task.id}). Please review your work, fix the issues, and update the task status when done.`
          );
        }
      }

      // QA re-reviews
      await qa.handleMessage(
        `The developers have addressed the blocked tasks. Please re-review the fixes and update task statuses accordingly.`
      );
    }

    this.emit({
      type: "project_complete",
      projectName: brief.projectName,
      outputPath: projectDir,
    });

    return projectDir;
  }

  async bossCommand(text: string) {
    this.emit({ type: "boss_command", text });
    const pm = this.agents.get("pm")!;
    return pm.handleMessage(
      `[BOSS COMMAND]: ${text}\n\nThe boss has given a new directive. Coordinate with the team to handle this. Create new tasks if needed and send messages to the appropriate agents.`
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

  private tryReadFile(projectDir: string, filename: string): string | null {
    const filePath = path.join(projectDir, filename);
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }
}
