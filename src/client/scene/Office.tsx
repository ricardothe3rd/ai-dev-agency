import { useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 16]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2, -8]}>
        <boxGeometry args={[20, 4, 0.2]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 2, 0]}>
        <boxGeometry args={[0.2, 4, 16]} />
        <meshStandardMaterial color="#1a1a3e" />
      </mesh>
      {/* Window frames on back wall */}
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, 2.5, -7.85]}>
          <boxGeometry args={[2.5, 2, 0.1]} />
          <meshStandardMaterial color="#0f3460" opacity={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
}

interface DeskProps {
  position: [number, number, number];
  label: string;
  color: string;
}

function Desk({ position, label, color }: DeskProps) {
  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>
      {/* Legs */}
      {[
        [-0.9, 0.375, -0.5],
        [0.9, 0.375, -0.5],
        [-0.9, 0.375, 0.5],
        [0.9, 0.375, 0.5],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.06, 0.75, 0.06]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.3, -0.3]}>
        <boxGeometry args={[1.0, 0.7, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.95, -0.3]}>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>
      {/* Chair */}
      <mesh position={[0, 0.45, 0.9]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshStandardMaterial color="#333355" />
      </mesh>
      <mesh position={[0, 0.75, 1.15]}>
        <boxGeometry args={[0.6, 0.6, 0.08]} />
        <meshStandardMaterial color="#333355" />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 2.0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

function Whiteboard() {
  return (
    <group position={[0, 2, -7.7]}>
      {/* Board */}
      <mesh>
        <boxGeometry args={[4, 2.5, 0.1]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[4.2, 2.7, 0.02]} />
        <meshStandardMaterial color="#333355" />
      </mesh>
      <Text
        position={[0, 0.8, 0.1]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        font={undefined}
      >
        TASK BOARD
      </Text>
    </group>
  );
}

function BreakArea() {
  return (
    <group position={[7, 0, 4]}>
      {/* Coffee table */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
        <meshStandardMaterial color="#3d3d5c" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>
      {/* Coffee cup */}
      <mesh position={[0.2, 0.6, 0.1]}>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#666"
        anchorX="center"
        font={undefined}
      >
        Break Room
      </Text>
    </group>
  );
}

export function Office() {
  const DESKS: DeskProps[] = [
    { position: [-6, 0, -4], label: "Alex (PM)", color: "#eab308" },
    { position: [-2, 0, -4], label: "Sam (Frontend)", color: "#3b82f6" },
    { position: [2, 0, -4], label: "Jordan (Backend)", color: "#22c55e" },
    { position: [-4, 0, 1], label: "Riley (Designer)", color: "#ec4899" },
    { position: [0, 0, 1], label: "Casey (QA)", color: "#f97316" },
  ];

  return (
    <group>
      <Floor />
      <Walls />
      <Whiteboard />
      <BreakArea />
      {DESKS.map((desk) => (
        <Desk key={desk.label} {...desk} />
      ))}

      {/* Ambient + directional light */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#4466ff" />

      {/* Grid for reference */}
      <gridHelper args={[20, 20, "#222244", "#222244"]} position={[0, 0, 0]} />
    </group>
  );
}
