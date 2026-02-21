import { create } from "zustand";

export interface AgentInfo {
  role: string;
  name: string;
  status: string;
  currentTask: string | null;
  location: string;
}

export interface TaskInfo {
  id: string;
  title: string;
  description: string;
  assignee: string | null;
  status: string;
  priority: number;
}

export interface WSEvent {
  type: string;
  [key: string]: unknown;
}

interface AgentStore {
  connected: boolean;
  agents: AgentInfo[];
  tasks: TaskInfo[];
  events: WSEvent[];
  messages: Array<{ from: string; to: string; text: string; time: string }>;
  files: Array<{ path: string; agent: string; time: string }>;
  selectedAgent: string | null;
  projectActive: boolean;

  setConnected: (v: boolean) => void;
  setAgents: (agents: AgentInfo[]) => void;
  setTasks: (tasks: TaskInfo[]) => void;
  addEvent: (event: WSEvent) => void;
  selectAgent: (role: string | null) => void;
  setProjectActive: (v: boolean) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  connected: false,
  agents: [],
  tasks: [],
  events: [],
  messages: [],
  files: [],
  selectedAgent: null,
  projectActive: false,

  setConnected: (connected) => set({ connected }),
  setAgents: (agents) => set({ agents }),
  setTasks: (tasks) => set({ tasks }),
  selectAgent: (role) => set({ selectedAgent: role }),
  setProjectActive: (projectActive) => set({ projectActive }),

  addEvent: (event) => {
    const state = get();
    const events = [...state.events, event].slice(-200); // Keep last 200

    let agents = state.agents;
    let tasks = state.tasks;
    let messages = state.messages;
    let files = state.files;
    let projectActive = state.projectActive;

    switch (event.type) {
      case "agent_status":
        agents = agents.map((a) =>
          a.role === event.agent
            ? { ...a, status: event.status as string, currentTask: event.task as string | null }
            : a
        );
        break;

      case "agent_move":
        agents = agents.map((a) =>
          a.role === event.agent ? { ...a, location: event.destination as string } : a
        );
        break;

      case "message":
        messages = [
          ...messages,
          {
            from: event.from as string,
            to: event.to as string,
            text: event.text as string,
            time: new Date().toLocaleTimeString(),
          },
        ].slice(-100);
        break;

      case "file_write":
        files = [
          ...files,
          {
            path: event.path as string,
            agent: event.agent as string,
            time: new Date().toLocaleTimeString(),
          },
        ].slice(-100);
        break;

      case "task_update": {
        const t = event.task as TaskInfo;
        const exists = tasks.find((x) => x.id === t.id);
        if (exists) {
          tasks = tasks.map((x) => (x.id === t.id ? { ...x, ...t } : x));
        } else {
          tasks = [...tasks, t];
        }
        break;
      }

      case "project_complete":
        projectActive = false;
        break;

      case "boss_command":
        break;
    }

    set({ events, agents, tasks, messages, files, projectActive });
  },
}));
