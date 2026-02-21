import { useAgentStore } from "../hooks/useAgentState";

const ROLE_COLORS: Record<string, string> = {
  pm: "border-yellow-500",
  "frontend-dev": "border-blue-500",
  "backend-dev": "border-green-500",
  designer: "border-pink-500",
  "qa-tester": "border-orange-500",
};

const ROLE_BG: Record<string, string> = {
  pm: "from-yellow-500/10",
  "frontend-dev": "from-blue-500/10",
  "backend-dev": "from-green-500/10",
  designer: "from-pink-500/10",
  "qa-tester": "from-orange-500/10",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  idle: { label: "Idle", color: "text-gray-400 bg-gray-800" },
  thinking: { label: "Thinking", color: "text-purple-300 bg-purple-900/40" },
  working: { label: "Working", color: "text-blue-300 bg-blue-900/40" },
  talking: { label: "Communicating", color: "text-cyan-300 bg-cyan-900/40" },
  reviewing: { label: "Reviewing", color: "text-amber-300 bg-amber-900/40" },
};

export function AgentDetail() {
  const { agents, selectedAgent, selectAgent, events, messages } = useAgentStore();

  if (!selectedAgent) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl mb-2 text-gray-600">{"{ }"}</div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Agent Detail</h3>
          <p className="text-gray-600 text-xs">Click an agent in the scene to inspect</p>
        </div>
      </div>
    );
  }

  const agent = agents.find((a) => a.role === selectedAgent);
  if (!agent) return null;

  const statusInfo = STATUS_LABELS[agent.status] || STATUS_LABELS.idle;

  const agentMessages = messages
    .filter((m) => m.from === selectedAgent || m.to === selectedAgent)
    .slice(-8);

  const agentEvents = events
    .filter((e) => (e.agent as string) === selectedAgent || (e.from as string) === selectedAgent)
    .slice(-12);

  return (
    <div className="flex flex-col h-full">
      <div className={`p-4 bg-gradient-to-b ${ROLE_BG[agent.role] || ""} to-transparent`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-base font-bold text-white border-l-3 pl-2 ${ROLE_COLORS[agent.role]}`}>
            {agent.name}
          </h3>
          <button
            onClick={() => selectAgent(null)}
            className="text-gray-500 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
          >
            x
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-xs text-gray-500">{agent.role}</span>
        </div>
        {agent.currentTask && (
          <p className="text-xs text-gray-400 mt-2 bg-gray-800/50 rounded px-2 py-1">
            Working on: {agent.currentTask}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs">
        <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
          Recent Activity
        </h4>
        {agentEvents.length === 0 && (
          <p className="text-gray-600 italic">No activity yet</p>
        )}
        {agentEvents.map((e, i) => (
          <div key={i} className="text-gray-400 leading-snug">
            <span className="text-gray-600 font-mono">[{e.type}]</span>{" "}
            {e.type === "file_write" && (
              <span>
                Wrote <span className="text-blue-400 font-mono">{e.path as string}</span>
              </span>
            )}
            {e.type === "agent_thinking" && (
              <span className="text-purple-300">{(e.thought as string).slice(0, 80)}</span>
            )}
            {e.type === "command_run" && (
              <span className="text-green-400 font-mono">$ {(e.command as string).slice(0, 60)}</span>
            )}
            {e.type === "message" && (
              <span>
                -{">"} {e.to as string}: {(e.text as string).slice(0, 80)}
              </span>
            )}
          </div>
        ))}

        {agentMessages.length > 0 && (
          <>
            <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mt-3 mb-1">
              Messages
            </h4>
            {agentMessages.map((m, i) => (
              <div key={i} className="text-gray-300 bg-gray-800/30 rounded px-2 py-1">
                <span className="text-gray-500">{m.from}</span>{" "}
                <span className="text-gray-600">-{">"}</span> {m.to}:{" "}
                {m.text.slice(0, 120)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
