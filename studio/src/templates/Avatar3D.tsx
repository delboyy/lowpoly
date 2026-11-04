import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { LPCoin } from "../kit3d/LowPoly";

// Profile picture for the Business Leaks rebrand (2026-10-30): a gold coin leaking teal drops, low-poly.
// Square still; the subject sits inside the centre ~70% so the circular avatar crop keeps it whole.
export type AvatarProps = { bg: string; drop: string };

const Drop: React.FC<{ color: string }> = ({ color }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8; // 0 = tip, 1 = bottom of the round belly
      const y = 1.4 - t * 2.0;
      const r = t < 0.55 ? Math.pow(t / 0.55, 0.9) * 0.62 : Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.55) / 0.45, 2))) * 0.62;
      pts.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(pts, 7);
  }, []);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} flatShading roughness={0.25} metalness={0.1} />
    </mesh>
  );
};

export const Avatar3D: React.FC<AvatarProps> = ({ bg, drop }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: [0, 0.1, 13.5] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}>
      <color attach="background" args={[bg]} />
      <hemisphereLight args={["#FFF6E6", "#BFD8FF", 1.2]} />
      <directionalLight position={[4, 6, 7]} intensity={2.8} />
      <group position={[0, 1.15, 0]} rotation={[1.25, 0.0, 0.18]} scale={1.55}>
        <LPCoin color="#F2B33D" face="$" faceColor="#8A5A12" segs={12} />
      </group>
      <group position={[0.22, -1.05, 0.6]} scale={0.62}>
        <Drop color={drop} />
      </group>
      <group position={[0.32, -2.05, 0.6]} scale={0.36}>
        <Drop color={drop} />
      </group>
    </ThreeCanvas>
  </AbsoluteFill>
);
