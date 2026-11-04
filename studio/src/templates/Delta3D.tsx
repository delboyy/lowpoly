import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Caption } from "@remotion/captions";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { Airliner, StudioEnv } from "../kit3d/Airliner";
import { BaseResolved, SfxCue, Timed } from "../lib/types";

// Line Item "3D" pilot (2026-10-23): Three.js via @remotion/three. One camera, never cuts, glides station to station
// (awesome-opus5-5-videos: "don't stop zooming"; seeconvm: every frame a pure function of time, springs, sound on beats).
export type Station = "card" | "bars" | "question" | "miles" | "ring" | "target" | "pass" | "cardEnd";
export type D3Scene = Timed & { state: Station; num?: string; label?: string; numB?: string; labelB?: string; at?: string };
export type D3Props = BaseResolved<D3Scene> & { topHook?: string; between?: React.ReactNode };

const YELLOW = "#FFD21F";
const BG = "#070B18";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const U = 0.32; // world units per $1B

// station positions along the track; camera offset per station
const POS: Record<Station, [number, number, number]> = {
  card: [0, 0, 0],
  bars: [9, 0, 0],
  question: [18, 0.6, 0],
  miles: [18, 0.6, 0],
  ring: [27, 0, 0],
  target: [36, 0, 0],
  pass: [45, 0, 0],
  cardEnd: [45, 0, 0],
};
const CAM: Record<Station, [number, number, number]> = {
  card: [0, 0.3, 10.5],
  bars: [0.5, 1.6, 11.5],
  question: [0, 0.4, 13.5],
  miles: [1.0, 0.6, 12.5],
  ring: [0, 0.3, 11.5],
  target: [-0.8, 1.6, 11.5],
  pass: [0, 0.3, 10.5],
  cardEnd: [0, 0.3, 10.5],
};

const wordMs = (caps: Caption[], re: RegExp, fromMs: number, fallback: number) => caps.find((c) => c.startMs >= fromMs - 50 && re.test(c.text))?.startMs ?? fallback;

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
};

const useCanvasTexture = (draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, w = 1024, h = 640) =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    draw(cv.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const Card: React.FC<{ rotY: number; tilt: number; dim: number }> = ({ rotY, tilt, dim }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(3.4, 2.14, 0.18), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 4, curveSegments: 16 }), []);
  const face = useCanvasTexture((c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#7A8399");
    g.addColorStop(0.55, "#353C4F");
    g.addColorStop(1, "#1A1E29");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const cg = c.createLinearGradient(80, 170, 220, 300);
    cg.addColorStop(0, "#F1D58C");
    cg.addColorStop(1, "#9C7A35");
    c.fillStyle = cg;
    c.beginPath();
    c.roundRect(80, 180, 150, 115, 16);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.75)";
    c.font = "600 46px Helvetica Neue, Arial";
    c.fillText("••••  ••••  ••••  2025", 80, 540);
    c.font = "800 34px Helvetica Neue, Arial";
    c.fillStyle = "rgba(255,255,255,.55)";
    c.fillText("C O - B R A N D", 700, 90);
  });
  return (
    <group rotation={[tilt, rotY, 0]}>
      <mesh geometry={geo} position={[0, 0, -0.025]}>
        <meshStandardMaterial color="#4A5266" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[3.36, 2.1]} />
        <meshStandardMaterial map={face} metalness={0.6} roughness={0.32} transparent opacity={1 - dim * 0.75} />
      </mesh>
    </group>
  );
};

const Pass: React.FC = () => {
  const tex = useCanvasTexture((c, w, h) => {
    c.fillStyle = "#F4EFE4";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#0B0B0B";
    c.font = "800 44px Helvetica Neue, Arial";
    c.fillText("B O A R D I N G   P A S S", 70, 100);
    c.font = "900 190px Impact, Helvetica Neue, Arial";
    c.fillText("SEAT 22B", 70, 330);
    c.setLineDash([22, 16]);
    c.lineWidth = 6;
    c.strokeStyle = "rgba(0,0,0,.3)";
    c.beginPath();
    c.moveTo(0, 470);
    c.lineTo(w, 470);
    c.stroke();
    c.font = "700 40px Helvetica Neue, Arial";
    c.fillText("ZONE 3   ·   GATE A12", 70, 560);
  });
  return (
    <mesh>
      <boxGeometry args={[3.6, 2.25, 0.03]} />
      <meshStandardMaterial attach="material-0" color="#E9E3D6" />
      <meshStandardMaterial attach="material-1" color="#E9E3D6" />
      <meshStandardMaterial attach="material-2" color="#E9E3D6" />
      <meshStandardMaterial attach="material-3" color="#E9E3D6" />
      <meshStandardMaterial attach="material-4" map={tex} roughness={0.8} />
      <meshStandardMaterial attach="material-5" color="#E9E3D6" />
    </mesh>
  );
};

const Plane: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0.38, -0.75 + Math.sin(t * 0.6) * 0.06, 0.08 + Math.sin(t * 1.1) * 0.03]} scale={0.78}>
    <Airliner accent={YELLOW} />
  </group>
);

const Miles: React.FC<{ local: number; from: THREE.Vector3; to: THREE.Vector3 }> = ({ local, from, to }) => {
  const n = 48;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const born = 4 + i * 2.2;
        if (local < born) return null;
        const t = ((local - born) / 34) % 1;
        const mid = new THREE.Vector3((from.x + to.x) / 2 + Math.sin(i * 1.7) * 1.4, (from.y + to.y) / 2 + 1.2 + Math.cos(i * 2.1) * 0.6, Math.sin(i * 0.9) * 1.2);
        const p = new THREE.Vector3().copy(from).multiplyScalar((1 - t) * (1 - t)).add(mid.clone().multiplyScalar(2 * (1 - t) * t)).add(to.clone().multiplyScalar(t * t));
        const s = Math.sin(Math.PI * t) * 0.09 + 0.02;
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[s, 12, 12]} />
            <meshBasicMaterial color={YELLOW} />
          </mesh>
        );
      })}
    </>
  );
};

const Column: React.FC<{ h: number; color: string; x: number; emissive?: number }> = ({ h, color, x, emissive = 0 }) => (
  <mesh position={[x, h / 2 - 1.4, 0]}>
    <boxGeometry args={[1.1, Math.max(0.001, h), 1.1]} />
    <meshStandardMaterial color={color} metalness={0.3} roughness={0.35} emissive={color} emissiveIntensity={emissive} />
  </mesh>
);

const Rig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3 }> = ({ pos, look }) => {
  const { camera } = useThree();
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

export const Delta3D: React.FC<D3Props> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const t = f / fps;
  const idx = Math.max(0, p.scenes.findIndex((s, i) => ms >= s.startMs && (i === p.scenes.length - 1 || ms < p.scenes[i + 1].startMs)));
  const sc = p.scenes[idx];
  const prev = p.scenes[Math.max(0, idx - 1)];
  const local = f - Math.round((sc.startMs / 1000) * fps);
  const move = idx === 0 ? 1 : ease(interpolate(local, [0, 20], [0, 1], clamp));
  const v = (a: [number, number, number]) => new THREE.Vector3(...a);
  const look = v(POS[prev.state]).lerp(v(POS[sc.state]), move);
  const camA = v(POS[prev.state]).add(v(CAM[prev.state]));
  const camB = v(POS[sc.state]).add(v(CAM[sc.state]));
  const LOOKY: Partial<Record<Station, number>> = { target: 0.9, bars: 0.3 };
  const ly = (LOOKY[prev.state] ?? 0) * (1 - move) + (LOOKY[sc.state] ?? 0) * move;
  look.y += ly;
  const sceneFrames = Math.max(1, Math.round((sc.durationMs / 1000) * fps));
  const push = interpolate(local, [0, sceneFrames], [0, 1], clamp); // slow dolly-in inside every station: no static holds
  const cam = camA.lerp(camB, move).add(new THREE.Vector3(Math.sin(t * 0.5) * 0.35 + push * 0.6, Math.sin(t * 0.7) * 0.15 + ly, -push * 1.4));
  // intro: camera pushes in from far on frame 0..24
  const intro = interpolate(f, [0, 24], [1, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  cam.z += intro * 5;

  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs) : sc.startMs + 150;
  const numK = spring({ frame: f - Math.round((numAt / 1000) * fps), fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
  const grow = (d: number) => spring({ frame: local - d, fps, config: { damping: 16, stiffness: 110 } });
  const barsK = sc.state === "bars" ? grow(4) : idx > 1 ? 1 : 0;
  const barsK2 = sc.state === "bars" ? grow(12) : idx > 1 ? 1 : 0;
  const ringArc = sc.state === "ring" ? interpolate(local, [6, 34], [0, 0.13], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }) : idx > 4 ? 0.13 : 0;
  const targetK = sc.state === "target" ? grow(10) : idx > 5 ? 1 : 0;
  const passFlip = sc.state === "cardEnd" ? interpolate(local, [0, 18], [0, Math.PI], { ...clamp, easing: ease }) : 0;
  const cardDim = idx === 0 ? numK : 0;

  const sfx: SfxCue[] = p.scenes.flatMap((s, i) =>
    s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs) : s.startMs + 150, src: "impact-punch-heavy", volume: 0.3 }] : i > 0 ? [{ atMs: s.startMs, src: "pixabay-whoosh-short", volume: 0.22 }] : [{ atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.25 }],
  );

  const ringGeo = useMemo(() => new THREE.TorusGeometry(1.6, 0.16, 24, 160, Math.PI * 2 * Math.max(0.001, ringArc)), [ringArc]);

  const overlay = (txt: string | undefined, label: string | undefined, top: number, color = YELLOW, size = 220) =>
    txt ? (
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${0.4 + 0.6 * numK})`, opacity: numK }}>
        <div style={{ fontFamily: FONT.anton, fontSize: size, color, lineHeight: 1, textShadow: "0 14px 50px rgba(0,0,0,.7)" }}>{txt}</div>
        {label ? <div style={{ marginTop: 18, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 42, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,.8)" }}>{label}</div> : null}
      </div>
    ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, position: [0, 0, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} style={{ background: `radial-gradient(circle at 50% 42%, #16203E 0%, ${BG} 62%)` }}>
        <Rig pos={cam} look={look} />
        <StudioEnv intensity={0.8} />
        <fog attach="fog" args={[BG, 9, 26]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={["#AFC3FF", "#0A0F1F", 0.6]} />
        <directionalLight position={[4, 6, 6]} intensity={2.2} />
        <directionalLight position={[-3, 1, 8]} intensity={1.4} color="#DDE6FF" />
        <pointLight position={[look.x - 3, 2, 3]} intensity={18} color={YELLOW} distance={12} />
        <pointLight position={[look.x + 3, -1, 4]} intensity={10} color="#6E8BFF" distance={12} />
        {/* floor grid for depth */}
        <gridHelper args={[120, 120, "#1E2A4A", "#121A33"]} position={[22, -1.45, 0]} />

        {/* A: card */}
        <group position={POS.card}>
          <Card rotY={Math.sin(t * 0.9) * 0.18 + (idx === 0 ? (1 - intro) * 0 : 0)} tilt={-0.08 + Math.sin(t * 0.6) * 0.04} dim={cardDim} />
        </group>
        {/* B: bars */}
        <group position={POS.bars}>
          <Column x={-0.9} h={8.2 * U * barsK} color={YELLOW} emissive={0.15} />
          <Column x={0.9} h={6.2 * U * barsK2} color="#4A5470" />
        </group>
        {/* C: plane + card + miles */}
        <group position={POS.miles}>
          <group position={[0, 1.6, -0.5]}>
            <Plane t={t} />
          </group>
          <group position={[0, -1.1, 0.6]} scale={0.6}>
            <Card rotY={Math.sin(t * 1.2) * 0.25} tilt={-0.25} dim={0} />
          </group>
          {sc.state === "miles" ? <Miles local={local} from={new THREE.Vector3(0, -1.0, 0.8)} to={new THREE.Vector3(0, 1.6, -0.3)} /> : null}
        </group>
        {/* D: ring */}
        <group position={POS.ring} rotation={[0, 0, Math.PI / 2]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[1.6, 0.16, 24, 160]} />
            <meshStandardMaterial color="#1E2742" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh geometry={ringGeo} rotation={[0, 0, 0]}>
            <meshStandardMaterial color={YELLOW} emissive={YELLOW} emissiveIntensity={0.35} metalness={0.3} roughness={0.35} />
          </mesh>
        </group>
        {/* E: target column */}
        <group position={POS.target}>
          <Column x={0} h={8.2 * U} color={YELLOW} emissive={0.15} />
          <lineSegments position={[0, (10 * U * Math.max(0.001, targetK)) / 2 - 1.4, 0]} scale={[1, Math.max(0.001, targetK), 1]}>
            <edgesGeometry args={[new THREE.BoxGeometry(1.3, 10 * U, 1.3)]} />
            <lineBasicMaterial color={YELLOW} />
          </lineSegments>
          <mesh position={[0, (10 * U * Math.max(0.001, targetK)) / 2 - 1.4, 0]} scale={[1, Math.max(0.001, targetK), 1]}>
            <boxGeometry args={[1.3, 10 * U, 1.3]} />
            <meshBasicMaterial color={YELLOW} transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position={[0, 10 * U - 1.4, 0]} visible={targetK > 0.3}>
            <boxGeometry args={[1.5, 0.04, 1.5]} />
            <meshBasicMaterial color={YELLOW} />
          </mesh>
        </group>
        {/* F: boarding pass that flips into the card */}
        <group position={POS.pass}>
          <group rotation={[-0.06, passFlip + Math.sin(t * 0.9) * 0.12, 0]}>
            <group visible={passFlip < Math.PI / 2}>
              <Pass />
            </group>
            <group visible={passFlip >= Math.PI / 2} rotation={[0, Math.PI, 0]}>
              <Card rotY={0} tilt={0} dim={0} />
            </group>
          </group>
        </group>
      </ThreeCanvas>
      {p.between}

      {/* number overlays */}
      {sc.state === "card" ? overlay(sc.num, sc.label, 1010) : null}
      {sc.state === "bars" ? (
        <>
          <div style={{ position: "absolute", left: 120, width: 420, top: 470, textAlign: "center", opacity: barsK }}>
            <div style={{ fontFamily: FONT.anton, fontSize: 150, color: YELLOW, lineHeight: 1 }}>{sc.num}</div>
            <div style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 38, color: "#fff" }}>{sc.label}</div>
          </div>
          <div style={{ position: "absolute", right: 120, width: 420, top: 610, textAlign: "center", opacity: barsK2 }}>
            <div style={{ fontFamily: FONT.anton, fontSize: 150, color: "#C9CFDD", lineHeight: 1 }}>{sc.numB}</div>
            <div style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 38, color: "#C9CFDD" }}>{sc.labelB}</div>
          </div>
        </>
      ) : null}
      {sc.state === "question" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: FONT.anton, fontSize: 420, color: YELLOW, opacity: interpolate(local, [4, 12], [0, 1], clamp), transform: `scale(${0.85 + 0.15 * interpolate(local, [4, 14], [0, 1], clamp)})`, textShadow: "0 20px 60px rgba(0,0,0,.7)" }}>?</div>
      ) : null}
      {sc.state === "miles" && sc.label ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 48, letterSpacing: 4, color: YELLOW, opacity: interpolate(local, [10, 18], [0, 1], clamp) }}>{sc.label}</div>
      ) : null}
      {sc.state === "ring" ? overlay(sc.num, sc.label, 650) : null}
      {sc.state === "target" ? overlay(sc.num, sc.label, 440, YELLOW, 190) : null}

      {p.topHook ? (
        <div style={{ position: "absolute", top: 290, left: 60, right: 60, padding: "16px 24px", background: "#000", borderLeft: `10px solid ${YELLOW}`, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: "#fff", textTransform: "uppercase" }}>{p.topHook}</div>
      ) : null}
      <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,.6)" }}>LINE ITEM</div>
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent={YELLOW} positionPct={74} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
