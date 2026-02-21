import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { AgentInfo } from "../hooks/useAgentState";
import { useAgentStore } from "../hooks/useAgentState";

const ROLE_POSITIONS: Record<string, [number, number, number]> = {
  pm: [-6, 0, -2.5],
  "frontend-dev": [-2, 0, -2.5],
  "backend-dev": [2, 0, -2.5],
  designer: [-4, 0, 2.5],
  "qa-tester": [0, 0, 2.5],
};

const ROLE_COLORS: Record<string, string> = {
  pm: "#eab308",
  "frontend-dev": "#3b82f6",
  "backend-dev": "#22c55e",
  designer: "#ec4899",
  "qa-tester": "#f97316",
};

const STATUS_EMOJI: Record<string, string> = {
  idle: "zzz",
  thinking: "...",
  working: ">>>",
  talking: "<->",
  reviewing: "?!",
};

/** Particle ring that orbits when the agent is working */
function WorkingParticles({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 24;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * 0.5;
      pos[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * 0.5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * 2;
      const radius = 0.45 + Math.sin(t * 3 + i) * 0.08;
      posArr[i * 3] = Math.cos(angle) * radius;
      posArr[i * 3 + 1] = 0.8 + Math.sin(t * 4 + i * 0.5) * 0.15;
      posArr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

interface Agent3DProps {
  agent: AgentInfo;
}

export function Agent3D({ agent }: Agent3DProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const headBob = useRef(0);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);

  const pos = ROLE_POSITIONS[agent.role] || [0, 0, 0];
  const color = ROLE_COLORS[agent.role] || "#888";
  const isSelected = selectedAgent === agent.role;
  const isWorking = agent.status === "working" || agent.status === "thinking";

  useFrame((_, delta) => {
    if (!bodyRef.current) return;

    if (isWorking) {
      headBob.current += delta * 3;
      bodyRef.current.position.y = Math.sin(headBob.current) * 0.05;
    } else {
      // Gentle idle breathing
      headBob.current += delta * 0.8;
      bodyRef.current.position.y = Math.sin(headBob.current) * 0.01;
    }
  });

  return (
    <group position={pos} onClick={() => selectAgent(agent.role)}>
      <group ref={bodyRef}>
        {/* Body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={isWorking ? color : "#000"}
            emissiveIntensity={isWorking ? 0.4 : 0}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#f0d0b0" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.07, 1.18, 0.17]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[0.07, 1.18, 0.17]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#222" />
        </mesh>

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        )}

        {/* Working particles */}
        <WorkingParticles color={color} active={isWorking} />

        {/* Status indicator */}
        <Text
          position={[0, 1.55, 0]}
          fontSize={0.12}
          color={isWorking ? color : "#666"}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {STATUS_EMOJI[agent.status] || "zzz"}
        </Text>

        {/* Name label */}
        <Text
          position={[0, 1.75, 0]}
          fontSize={0.14}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
          font={undefined}
        >
          {agent.name}
        </Text>

        {/* Role tag */}
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.08}
          color={color}
          anchorX="center"
          font={undefined}
        >
          {agent.role.replace("-", " ").toUpperCase()}
        </Text>

        {/* Task label when working */}
        {agent.currentTask && (
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.08}
            color="#777"
            anchorX="center"
            maxWidth={2}
            font={undefined}
          >
            {agent.currentTask.slice(0, 40)}
          </Text>
        )}
      </group>
    </group>
  );
}

export function AgentGroup() {
  const agents = useAgentStore((s) => s.agents);

  return (
    <group>
      {agents.map((agent) => (
        <Agent3D key={agent.role} agent={agent} />
      ))}
    </group>
  );
}
