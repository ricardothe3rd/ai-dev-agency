import { Text } from "@react-three/drei";
import { useAgentStore } from "../hooks/useAgentState";

const STATUS_COLORS: Record<string, string> = {
  pending: "#555",
  in_progress: "#3b82f6",
  review: "#eab308",
  done: "#22c55e",
  blocked: "#ef4444",
};

export function TaskBoard3D() {
  const tasks = useAgentStore((s) => s.tasks);
  const visibleTasks = tasks.slice(0, 8);

  return (
    <group position={[0, 2, -7.55]}>
      {visibleTasks.map((task, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col === 0 ? -0.9 : 0.9;
        const y = 0.4 - row * 0.5;
        const statusColor = STATUS_COLORS[task.status] || "#555";

        return (
          <group key={task.id} position={[x, y, 0]}>
            {/* Card background */}
            <mesh>
              <planeGeometry args={[1.6, 0.4]} />
              <meshBasicMaterial color="#1e1e3a" />
            </mesh>
            {/* Card border */}
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[1.62, 0.42]} />
              <meshBasicMaterial color="#333355" />
            </mesh>
            {/* Status bar */}
            <mesh position={[-0.75, 0, 0.01]}>
              <planeGeometry args={[0.06, 0.35]} />
              <meshBasicMaterial color={statusColor} />
            </mesh>
            {/* Status dot */}
            <mesh position={[0.7, 0.13, 0.01]}>
              <circleGeometry args={[0.04, 16]} />
              <meshBasicMaterial color={statusColor} />
            </mesh>
            {/* Task text */}
            <Text
              position={[0.02, 0.06, 0.01]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              maxWidth={1.2}
              font={undefined}
            >
              {(task.title || task.id).slice(0, 28)}
            </Text>
            <Text
              position={[0.02, -0.1, 0.01]}
              fontSize={0.055}
              color="#666"
              anchorX="center"
              font={undefined}
            >
              {task.assignee || "unassigned"} | {task.status.replace("_", " ")}
            </Text>
          </group>
        );
      })}

      {/* Empty state */}
      {visibleTasks.length === 0 && (
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="#444"
          anchorX="center"
          font={undefined}
        >
          No tasks yet
        </Text>
      )}
    </group>
  );
}
