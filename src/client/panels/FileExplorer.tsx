import { useAgentStore } from "../hooks/useAgentState";

const ROLE_COLORS: Record<string, string> = {
  pm: "text-yellow-400",
  "frontend-dev": "text-blue-400",
  "backend-dev": "text-green-400",
  designer: "text-pink-400",
  "qa-tester": "text-orange-400",
};

const EXT_ICONS: Record<string, string> = {
  ts: "TS",
  tsx: "TX",
  js: "JS",
  json: "{}",
  css: "#",
  md: "M",
  html: "<>",
};

function getIcon(path: string): string {
  const ext = path.split(".").pop() || "";
  return EXT_ICONS[ext] || "--";
}

export function FileExplorer() {
  const { files } = useAgentStore();

  const uniqueFiles = Array.from(
    new Map(files.map((f) => [f.path, f])).values()
  ).sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 shrink-0">
        Project Files ({uniqueFiles.length})
      </h3>
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
        {uniqueFiles.length === 0 && (
          <p className="text-gray-600 italic text-xs">No files generated yet</p>
        )}
        {uniqueFiles.map((file) => (
          <div
            key={file.path}
            className="flex items-center gap-2 text-xs py-0.5 hover:bg-gray-800/30 rounded px-1 -mx-1"
          >
            <span className="text-[9px] font-mono text-gray-600 w-4 text-center shrink-0">
              {getIcon(file.path)}
            </span>
            <span className="text-gray-300 font-mono text-[11px] truncate flex-1">
              {file.path}
            </span>
            <span className={`text-[10px] shrink-0 ${ROLE_COLORS[file.agent] || "text-gray-500"}`}>
              {file.agent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
