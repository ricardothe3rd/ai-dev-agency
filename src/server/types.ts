// --- Agent Types ---

export type AgentRole = "pm" | "frontend-dev" | "backend-dev" | "designer" | "qa-tester";

export type AgentStatus = "idle" | "thinking" | "working" | "talking" | "reviewing";

export interface AgentInfo {
  role: AgentRole;
  name: string;
  status: AgentStatus;
  currentTask: string | null;
  location: string;
}

// --- Task Types ---

export type TaskStatus = "pending" | "in_progress" | "review" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: AgentRole | null;
  status: TaskStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
  dependencies: string[];
  files: string[];
}

export interface ProjectBrief {
  description: string;
  projectName: string;
}

export interface ProjectPlan {
  projectName: string;
  tasks: Task[];
  techStack: string[];
  architecture: string;
}

// --- WebSocket Event Types ---

export type WSEvent =
  | { type: "agent_status"; agent: AgentRole; status: AgentStatus; task: string | null }
  | { type: "agent_thinking"; agent: AgentRole; thought: string }
  | { type: "agent_move"; agent: AgentRole; destination: string }
  | { type: "file_write"; agent: AgentRole; path: string; content: string }
  | { type: "file_read"; agent: AgentRole; path: string }
  | { type: "message"; from: AgentRole; to: AgentRole | "all"; text: string }
  | { type: "task_update"; task: Task }
  | { type: "task_list"; tasks: Task[] }
  | { type: "plan_created"; plan: ProjectPlan }
  | { type: "command_run"; agent: AgentRole; command: string; output: string }
  | { type: "project_complete"; projectName: string; outputPath: string }
  | { type: "error"; agent: AgentRole | null; message: string }
  | { type: "boss_command"; text: string };

// --- Tool Types ---

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// --- Memory Types ---

export interface Memory {
  id: number;
  agent: AgentRole;
  content: string;
  importance: number;
  timestamp: string;
  type: "observation" | "reflection" | "conversation";
}
