import { Canvas } from "@react-three/fiber";
import { Office } from "./scene/Office";
import { AgentGroup } from "./scene/Agent3D";
import { TaskBoard3D } from "./scene/TaskBoard3D";
import { Camera } from "./scene/Camera";
import { Atmosphere } from "./scene/Atmosphere";
import { BriefInput } from "./panels/BriefInput";
import { AgentDetail } from "./panels/AgentDetail";
import { TaskList } from "./panels/TaskList";
import { ChatLog } from "./panels/ChatLog";
import { FileExplorer } from "./panels/FileExplorer";
import { useWebSocket } from "./hooks/useWebSocket";
import { useAgentStore } from "./hooks/useAgentState";

function ConnectionStatus() {
  const connected = useAgentStore((s) => s.connected);
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
        connected
          ? "bg-green-500/15 text-green-400 border border-green-500/20"
          : "bg-red-500/15 text-red-400 border border-red-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? "bg-green-400 animate-pulse" : "bg-red-400"
        }`}
      />
      {connected ? "Live" : "Reconnecting..."}
    </div>
  );
}

function Header() {
  const projectActive = useAgentStore((s) => s.projectActive);
  const tasks = useAgentStore((s) => s.tasks);
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">
              Dev Agency
            </h1>
            <p className="text-[10px] text-gray-500">Powered by Claude</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        {projectActive && tasks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/60 backdrop-blur-sm border border-gray-700/40 text-xs">
            <span className="text-gray-400">Progress</span>
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-gray-300 font-mono">
              {doneTasks}/{tasks.length}
            </span>
          </div>
        )}
        <ConnectionStatus />
      </div>
    </div>
  );
}

function SidebarSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-gray-800/80 first:border-t-0 ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  useWebSocket();

  return (
    <div className="w-full h-full bg-[#060612] flex text-white overflow-hidden">
      {/* Main 3D viewport */}
      <div className="flex-1 relative">
        <Canvas shadows>
          <Camera />
          <Atmosphere />
          <Office />
          <AgentGroup />
          <TaskBoard3D />
        </Canvas>

        <Header />

        {/* Brief input overlay at bottom of viewport */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-xl mx-auto">
            <BriefInput />
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-80 flex flex-col bg-[#0a0a18]/95 backdrop-blur-sm border-l border-gray-800/60">
        <SidebarSection className="flex-[2] overflow-hidden flex flex-col min-h-0">
          <AgentDetail />
        </SidebarSection>

        <SidebarSection className="flex-[1.5] overflow-y-auto min-h-0">
          <TaskList />
        </SidebarSection>

        <SidebarSection className="flex-[1.5] overflow-hidden min-h-0">
          <ChatLog />
        </SidebarSection>

        <SidebarSection className="flex-1 overflow-y-auto min-h-0">
          <FileExplorer />
        </SidebarSection>
      </div>
    </div>
  );
}
