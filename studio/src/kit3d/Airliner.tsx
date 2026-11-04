import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Shared 3D kit for Line Item (2026-10-23). Nathan: "the plane looks so janky", so this is a proper procedural airliner
// (lathe fuselage, swept extruded wings, engine pods, fin, window line) plus studio reflections for every metal surface.

/** Image-based lighting from three's built-in RoomEnvironment: real reflections on metal, no downloads. */
export const StudioEnv: React.FC<{ intensity?: number }> = ({ intensity = 0.9 }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = intensity;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    pmrem.dispose();
  }, [gl, scene, intensity]);
  return null;
};

const planform = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  s.closePath();
  return s;
};
const extrude = (shape: THREE.Shape, depth: number) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: depth * 0.4, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  return g;
};

/** Nose points to +x. About 4.7 units long. */
export const Airliner: React.FC<{ accent?: string }> = ({ accent = "#FFD21F" }) => {
  const geo = useMemo(() => {
    // fuselage profile (radius, y) turned around y, then laid along x
    const prof: [number, number][] = [
      [0.0, -2.35], [0.06, -2.3], [0.14, -2.15], [0.24, -1.85], [0.32, -1.45], [0.35, -1.0], [0.35, 1.3], [0.34, 1.55], [0.31, 1.8], [0.26, 2.0], [0.18, 2.17], [0.09, 2.28], [0.0, 2.33],
    ];
    const fus = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48);
    fus.rotateZ(-Math.PI / 2);
    // swept wing (top view in x/z), one side; mirrored by scale
    const wing = extrude(planform([[0.55, 0.2], [-0.25, 0.2], [-1.05, 2.45], [-0.72, 2.45]]), 0.05);
    wing.rotateX(Math.PI / 2);
    const tailplane = extrude(planform([[-1.75, 0.1], [-2.2, 0.1], [-2.45, 0.95], [-2.25, 0.95]]), 0.035);
    tailplane.rotateX(Math.PI / 2);
    const fin = extrude(planform([[-1.55, 0.25], [-2.3, 0.25], [-2.5, 1.25], [-2.2, 1.25]]), 0.045);
    const engine = new THREE.CylinderGeometry(0.15, 0.13, 0.62, 32, 1, true);
    engine.rotateZ(Math.PI / 2);
    const intake = new THREE.CircleGeometry(0.135, 32);
    intake.rotateY(Math.PI / 2);
    return { fus, wing, tailplane, fin, engine, intake };
  }, []);
  const body = <meshPhysicalMaterial color="#F3F5FA" metalness={0.15} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.15} />;
  const metal = <meshStandardMaterial color="#C8CFDC" metalness={0.75} roughness={0.3} />;
  return (
    <group>
      <mesh geometry={geo.fus}>{body}</mesh>
      {/* window line + cockpit */}
      {[-1, 1].map((side) =>
        Array.from({ length: 22 }).map((_, i) => (
          <mesh key={`${side}-${i}`} position={[-1.25 + i * 0.12, 0.1, side * 0.343]}>
            <boxGeometry args={[0.055, 0.07, 0.01]} />
            <meshStandardMaterial color="#1A2236" metalness={0.2} roughness={0.15} />
          </mesh>
        )),
      )}
      <mesh position={[2.02, 0.12, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.16, 0.08, 0.42]} />
        <meshStandardMaterial color="#1A2236" metalness={0.3} roughness={0.1} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} scale={[1, 1, side]}>
          <mesh geometry={geo.wing} position={[0, -0.12, 0]}>{metal}</mesh>
          <mesh geometry={geo.tailplane} position={[0, 0.05, 0]}>{metal}</mesh>
          <group position={[0.15, -0.36, 0.95]}>
            <mesh geometry={geo.engine}>{body}</mesh>
            <mesh geometry={geo.intake} position={[0.31, 0, 0]}>
              <meshStandardMaterial color="#0C1020" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-0.05, 0.16, 0]}>
              <boxGeometry args={[0.35, 0.12, 0.03]} />
              {metal}
            </mesh>
          </group>
        </group>
      ))}
      <mesh geometry={geo.fin} position={[0, 0.05, 0]}>
        <meshPhysicalMaterial color={accent} metalness={0.2} roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
  );
};
