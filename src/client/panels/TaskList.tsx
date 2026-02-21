import { useAgentStore } from "../hooks/useAgentState";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-gray-800/60", text: "text-gray-400", dot: "bg-gray-500" },
  in_progress: { bg: "bg-blue-900/20", text: "text-blue-300", dot: "bg-blue-500" },
  review: { bg: "bg-yellow-900/20", text: "text-yellow-300", dot: "bg-yellow-500" },
  done: { bg: "bg-green-900/20", text: "text-green-300", dot: "bg-green-500" },
  blocked: { bg: "bg-red-900/20", text: "text-red-300", dot: "bg-red-500" },
};

export function TaskList() {
  const { tasks } = useAgentStore();

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 shrink-0">
        Tasks ({tasks.length})
      </h3>
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5">
        {tasks.length === 0 && (
          <p className="text-gray-600 italic text-xs">No tasks yet</p>
        )}
        {tasks.map((task) => {
          const style = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
          return (
            <div
              key={task.id}
              className={`${style.bg} rounded-lg p-2.5 border border-gray-800/50`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-white text-xs font-medium leading-snug">
                  {task.title || task.id}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-[10px] font-medium ${style.text}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </span>
              </div>
              {task.assignee && (
                <span className="text-[10px] text-gray-500">
                  Assigned to {task.assignee}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
