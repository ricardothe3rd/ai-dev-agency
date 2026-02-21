import { useRef, useEffect } from "react";
import { useAgentStore } from "../hooks/useAgentState";

const ROLE_COLORS: Record<string, string> = {
  pm: "text-yellow-400",
  "frontend-dev": "text-blue-400",
  "backend-dev": "text-green-400",
  designer: "text-pink-400",
  "qa-tester": "text-orange-400",
};

const TYPE_ICONS: Record<string, string> = {
  message: ">>",
  thinking: "..",
  command: "$",
};

export function ChatLog() {
  const { messages, events } = useAgentStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, events]);

  const feed = [
    ...messages.map((m) => ({
      type: "message" as const,
      from: m.from,
      text: `-> ${m.to}: ${m.text}`,
      time: m.time,
    })),
    ...events
      .filter((e) => e.type === "agent_thinking")
      .map((e) => ({
        type: "thinking" as const,
        from: e.agent as string,
        text: (e.thought as string),
        time: new Date().toLocaleTimeString(),
      })),
    ...events
      .filter((e) => e.type === "command_run")
      .map((e) => ({
        type: "command" as const,
        from: e.agent as string,
        text: (e.command as string),
        time: new Date().toLocaleTimeString(),
      })),
  ].slice(-80);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 shrink-0">
        Activity Feed ({feed.length})
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 text-xs">
        {feed.length === 0 && (
          <p className="text-gray-600 italic text-xs">Waiting for project to start...</p>
        )}
        {feed.map((item, i) => (
          <div key={i} className="flex gap-1.5 leading-snug py-0.5">
            <span className="text-gray-700 font-mono text-[10px] shrink-0 w-6 text-right">
              {TYPE_ICONS[item.type] || ""}
            </span>
            <span className={`font-medium shrink-0 ${ROLE_COLORS[item.from] || "text-gray-400"}`}>
              {item.from}
            </span>
            <span className="text-gray-500 break-all">{item.text.slice(0, 150)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
