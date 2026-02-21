import { useState } from "react";
import { useAgentStore } from "../hooks/useAgentState";

export function BriefInput() {
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [sending, setSending] = useState(false);
  const { projectActive, setProjectActive } = useAgentStore();

  const submit = async () => {
    if (!description.trim() || !projectName.trim()) return;
    setSending(true);
    setProjectActive(true);

    await fetch("/api/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, projectName }),
    });

    setSending(false);
  };

  const sendCommand = async () => {
    if (!description.trim()) return;
    setSending(true);
    await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });
    setDescription("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      projectActive ? sendCommand() : submit();
    }
  };

  return (
    <div className="bg-[#0d0d20]/80 backdrop-blur-md rounded-xl border border-gray-700/50 p-4 shadow-2xl">
      {!projectActive ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              New Project Brief
            </h2>
          </div>

          <input
            type="text"
            placeholder="Project name (e.g., fitness-app)"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mb-2 px-3 py-2 bg-gray-900/60 text-white rounded-lg border border-gray-700/50 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 outline-none text-sm placeholder-gray-500 transition-all"
          />

          <textarea
            placeholder='Describe what you want built (e.g., "Build a fitness tracking app with React Native")'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full mb-2 px-3 py-2 bg-gray-900/60 text-white rounded-lg border border-gray-700/50 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 outline-none resize-none text-sm placeholder-gray-500 transition-all"
          />

          <button
            onClick={submit}
            disabled={sending || !description.trim() || !projectName.trim()}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Briefing the team...
              </span>
            ) : (
              "Start Project"
            )}
          </button>
          <p className="text-[10px] text-gray-600 mt-1.5 text-center">
            Cmd+Enter to submit
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Boss Command
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder='Give a directive (e.g., "Add dark mode" or "Change the color scheme to purple")'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendCommand();
              }}
              className="flex-1 px-3 py-2 bg-gray-900/60 text-white rounded-lg border border-gray-700/50 focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30 outline-none text-sm placeholder-gray-500 transition-all"
            />
            <button
              onClick={sendCommand}
              disabled={sending || !description.trim()}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium text-sm transition-all whitespace-nowrap"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
