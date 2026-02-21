import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * 6 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const speeds = useMemo(() => {
    return Array.from({ length: count }, () => ({
      y: Math.random() * 0.3 + 0.1,
      drift: Math.random() * 0.2 - 0.1,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posArr = meshRef.current.geometry.attributes.position
      .array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const speed = speeds[i];
      posArr[i * 3] += Math.sin(t * 0.5 + speed.phase) * 0.002;
      posArr[i * 3 + 1] += speed.y * 0.003;
      posArr[i * 3 + 2] += speed.drift * 0.002;

      // Reset particles that go too high
      if (posArr[i * 3 + 1] > 7) {
        posArr[i * 3 + 1] = 0.5;
        posArr[i * 3] = (Math.random() - 0.5) * 24;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4466ff"
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function GlowOrbs() {
  const group = useRef<THREE.Group>(null);

  const orbs = useMemo(
    () => [
      { pos: [-6, 2.8, -4] as const, color: "#eab308", intensity: 0.2 },
      { pos: [-2, 2.8, -4] as const, color: "#3b82f6", intensity: 0.2 },
      { pos: [2, 2.8, -4] as const, color: "#22c55e", intensity: 0.2 },
      { pos: [-4, 2.8, 1] as const, color: "#ec4899", intensity: 0.2 },
      { pos: [0, 2.8, 1] as const, color: "#f97316", intensity: 0.2 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      child.position.y = orbs[i].pos[1] + Math.sin(t * 0.8 + i) * 0.1;
    });
  });

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <pointLight
          key={i}
          position={[orb.pos[0], orb.pos[1], orb.pos[2]]}
          color={orb.color}
          intensity={orb.intensity}
          distance={4}
        />
      ))}
    </group>
  );
}

export function Atmosphere() {
  return (
    <group>
      <FloatingParticles />
      <GlowOrbs />
      <fog attach="fog" args={["#0a0a1a", 15, 45]} />
    </group>
  );
}
