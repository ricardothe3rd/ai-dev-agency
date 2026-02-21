import Anthropic from "@anthropic-ai/sdk";
import type {
  AgentRole,
  AgentStatus,
  Task,
  WSEvent,
  ToolResult,
} from "../types.js";
import type { MessageBus } from "../comms/channel.js";
import type { MemoryStore } from "../memory/store.js";

export interface AgentConfig {
  role: AgentRole;
  name: string;
  systemPrompt: string;
  model?: string;
}

export type EventEmitter = (event: WSEvent) => void;

export class BaseAgent {
  readonly role: AgentRole;
  readonly name: string;
  private systemPrompt: string;
  private client: Anthropic;
  private model: string;
  private conversationHistory: Anthropic.MessageParam[] = [];
  private emit: EventEmitter;
  private messageBus: MessageBus;
  private store: MemoryStore;
  private outputDir: string = "";
  status: AgentStatus = "idle";
  currentTask: Task | null = null;
  location: string;

  constructor(
    config: AgentConfig,
    emit: EventEmitter,
    messageBus: MessageBus,
    store: MemoryStore
  ) {
    this.role = config.role;
    this.name = config.name;
    this.systemPrompt = config.systemPrompt;
    this.model = config.model || "claude-sonnet-4-20250514";
    this.client = new Anthropic();
    this.emit = emit;
    this.messageBus = messageBus;
    this.store = store;
    this.location = `${config.role}-desk`;
  }

  setOutputDir(dir: string) {
    this.outputDir = dir;
  }

  private getTools(): Anthropic.Tool[] {
    return [
      {
        name: "write_file",
        description:
          "Write content to a file in the project. Creates directories as needed.",
        input_schema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description: "File path relative to project root",
            },
            content: { type: "string", description: "File content to write" },
          },
          required: ["path", "content"],
        },
      },
      {
        name: "read_file",
        description: "Read the contents of a file in the project.",
        input_schema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description: "File path relative to project root",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "run_command",
        description:
          "Run a shell command in the project directory. Use for npm install, running tests, etc.",
        input_schema: {
          type: "object" as const,
          properties: {
            command: { type: "string", description: "Shell command to run" },
          },
          required: ["command"],
        },
      },
      {
        name: "send_message",
        description:
          "Send a message to another agent on the team. The message will be delivered to them and they will process it.",
        input_schema: {
          type: "object" as const,
          properties: {
            to: {
              type: "string",
              enum: [
                "pm",
                "frontend-dev",
                "backend-dev",
                "designer",
                "qa-tester",
              ],
              description: "The agent role to send the message to",
            },
            message: { type: "string", description: "The message content" },
          },
          required: ["to", "message"],
        },
      },
      {
        name: "update_task",
        description:
          "Create or update a task on the board. Include title and description when creating new tasks.",
        input_schema: {
          type: "object" as const,
          properties: {
            taskId: { type: "string", description: "The task ID (e.g. task-1)" },
            status: {
              type: "string",
              enum: ["pending", "in_progress", "review", "done", "blocked"],
              description: "Task status",
            },
            title: {
              type: "string",
              description: "Task title (required when creating a new task)",
            },
            description: {
              type: "string",
              description: "Detailed description of what needs to be done",
            },
            assignee: {
              type: "string",
              enum: [
                "pm",
                "frontend-dev",
                "backend-dev",
                "designer",
                "qa-tester",
              ],
              description: "Which agent role this task is assigned to",
            },
          },
          required: ["taskId", "status"],
        },
      },
      {
        name: "list_files",
        description:
          "List all files in the project directory or a subdirectory.",
        input_schema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description:
                "Directory path relative to project root. Defaults to root.",
            },
          },
          required: [],
        },
      },
    ];
  }

  private async executeTool(
    name: string,
    input: Record<string, string>
  ): Promise<ToolResult> {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { execSync } = await import("node:child_process");

    switch (name) {
      case "write_file": {
        const filePath = path.join(this.outputDir, input.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, input.content);
        this.emit({
          type: "file_write",
          agent: this.role,
          path: input.path,
          content: input.content,
        });
        return { success: true, data: `Wrote ${input.path}` };
      }
      case "read_file": {
        const filePath = path.join(this.outputDir, input.path);
        if (!fs.existsSync(filePath))
          return { success: false, error: `File not found: ${input.path}` };
        const content = fs.readFileSync(filePath, "utf-8");
        this.emit({
          type: "file_read",
          agent: this.role,
          path: input.path,
        });
        return { success: true, data: content };
      }
      case "run_command": {
        try {
          const output = execSync(input.command, {
            cwd: this.outputDir,
            timeout: 30000,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
          });
          this.emit({
            type: "command_run",
            agent: this.role,
            command: input.command,
            output: output.slice(0, 2000),
          });
          return { success: true, data: output.slice(0, 2000) };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          this.emit({
            type: "command_run",
            agent: this.role,
            command: input.command,
            output: `Error: ${msg.slice(0, 1000)}`,
          });
          return { success: false, error: msg.slice(0, 1000) };
        }
      }
      case "send_message": {
        // Emit to UI
        this.emit({
          type: "message",
          from: this.role,
          to: input.to as AgentRole,
          text: input.message,
        });
        // Persist to database
        this.store.saveMessage(this.role, input.to, input.message);
        // Actually deliver to the receiving agent via MessageBus
        this.messageBus.send(this.role, input.to as AgentRole, input.message);
        return { success: true, data: `Message sent to ${input.to}` };
      }
      case "update_task": {
        const now = new Date().toISOString();
        const assignee = (input.assignee as AgentRole) || this.role;
        const existing = this.store.getTask(input.taskId);

        let task: Task;
        if (existing) {
          // Update existing task
          const updates: Partial<Task> = { status: input.status as Task["status"] };
          if (input.title) updates.title = input.title;
          if (input.description) updates.description = input.description;
          if (input.assignee) updates.assignee = input.assignee as AgentRole;
          task = this.store.updateTask(input.taskId, updates)!;
        } else {
          // Create new task
          task = this.store.createTask({
            id: input.taskId,
            title: input.title || input.taskId,
            description: input.description || "",
            assignee,
            status: input.status as Task["status"],
            priority: 0,
            createdAt: now,
            updatedAt: now,
            dependencies: [],
            files: [],
          });
        }

        this.emit({ type: "task_update", task });
        return { success: true, data: `Task ${input.taskId} → ${input.status}` };
      }
      case "list_files": {
        const dir = path.join(this.outputDir, input.path || "");
        if (!fs.existsSync(dir))
          return { success: false, error: `Directory not found: ${input.path || "/"}` };
        const listDir = (d: string, prefix = ""): string[] => {
          const entries = fs.readdirSync(d, { withFileTypes: true });
          const files: string[] = [];
          for (const e of entries) {
            if (e.name === "node_modules" || e.name === ".git") continue;
            const full = path.join(prefix, e.name);
            if (e.isDirectory()) {
              files.push(full + "/");
              files.push(...listDir(path.join(d, e.name), full));
            } else {
              files.push(full);
            }
          }
          return files;
        };
        return { success: true, data: listDir(dir) };
      }
      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  }

  async handleMessage(userMessage: string): Promise<string> {
    this.setStatus("thinking");
    this.emit({
      type: "agent_thinking",
      agent: this.role,
      thought: userMessage.slice(0, 200),
    });

    this.conversationHistory.push({ role: "user", content: userMessage });

    let response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt,
      tools: this.getTools(),
      messages: this.conversationHistory,
    });

    // Tool use loop
    while (response.stop_reason === "tool_use") {
      this.setStatus("working");

      const toolBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolBlocks) {
        const result = await this.executeTool(
          block.name,
          block.input as Record<string, string>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      this.conversationHistory.push({ role: "assistant", content: response.content });
      this.conversationHistory.push({ role: "user", content: toolResults });

      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        tools: this.getTools(),
        messages: this.conversationHistory,
      });
    }

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    const text = textBlocks.map((b) => b.text).join("\n");

    this.conversationHistory.push({ role: "assistant", content: response.content });
    this.setStatus("idle");
    return text;
  }

  receiveMessage(from: AgentRole, message: string) {
    const formatted = `[Message from ${from}]: ${message}`;
    return this.handleMessage(formatted);
  }

  assignTask(task: Task) {
    this.currentTask = task;
    this.setStatus("working");
    return this.handleMessage(
      `You have been assigned a new task:\n\nTask ID: ${task.id}\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\n\nPlease complete this task. Use the available tools to write code, communicate with other agents, and update the task status when you're done.`
    );
  }

  private setStatus(status: AgentStatus) {
    this.status = status;
    this.emit({
      type: "agent_status",
      agent: this.role,
      status,
      task: this.currentTask?.title || null,
    });
  }

  resetConversation() {
    this.conversationHistory = [];
  }
}
