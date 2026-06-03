"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 250 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  // Create random position coordinates and colors (mix of gold, rose, and white)
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const szs = new Float32Array(count);

    const themeColors = [
      new THREE.Color("#d4af37"), // Gold
      new THREE.Color("#ff2a5f"), // Rose
      new THREE.Color("#ffffff"), // White
      new THREE.Color("#ff8da1"), // Light Pink
    ];

    for (let i = 0; i < count; i++) {
      // Position
      pos[i * 3] = (Math.random() - 0.5) * 15; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z

      // Color
      const color = themeColors[Math.floor(Math.random() * themeColors.length)];
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // Size
      szs[i] = Math.random() * 0.08 + 0.02;
    }

    return [pos, cols, szs];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotate points slowly
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = time * 0.01;

    // Gentle floating motion based on mouse coordinates
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.5;
    pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.05;
    pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-[#030303]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,42,95,0.06),transparent_45%)]" />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <Particles count={350} />
      </Canvas>
    </div>
  );
}
