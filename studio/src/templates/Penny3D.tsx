import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Caption } from "@remotion/captions";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";

// Line Item "low-poly story" pilot (2026-10-26): research showed low-poly 3D one-story Shorts (Low Poly Shorts etc.)
// with medians in the millions. Flat-shaded pastel world, one camera path, calm read, every frame a pure function of time.
export type PennyStation = "hero" | "layers" | "heap" | "loss" | "years" | "press" | "saved" | "roll";
export type PennyScene = Timed & { state: PennyStation; num?: string; label?: string; at?: string };
export type PennyProps = BaseResolved<PennyScene> & { topHook?: string };

const COPPER = "#D9824B";
const ZINC = "#B9C0C8";
const SKY_TOP = "#FFD9C2";
const SKY_BOT = "#C9B8FF";
const GROUND = "#F2C9A0";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const POS: Record<PennyStation, [number, number, number]> = {
  hero: [0, 1.2, 0], layers: [0, 1.2, 0], heap: [8, 0.8, 0], loss: [8, 0.8, 0], years: [16, 1.5, -2], press: [16, 1.2, 0], saved: [24, 1.0, 0], roll: [0, 0.3, 4],
};
const CAM: Record<PennyStation, [number, number, number]> = {
  hero: [0, 0.9, 6.8], layers: [1.8, 1.3, 6.4], heap: [0, 3.2, 7.5], loss: [1.0, 2.2, 6.0], years: [0, 1.2, 9.5], press: [1.6, 2.2, 9.0], saved: [0, 2.4, 7.5], roll: [0, 1.0, 5.2],
};
const wordMs = (caps: Caption[], re: RegExp, fromMs: number, fallback: number) => caps.find((c) => c.startMs >= fromMs - 50 && re.test(c.text))?.startMs ?? fallback;

const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(80, 40, 40, 20);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, (rnd(i) - 0.5) * 0.35);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.2, -4]} receiveShadow>
      <meshStandardMaterial color={GROUND} flatShading roughness={0.95} />
    </mesh>
  );
};

/** low-poly coin: 16 facets, flat shading, raised rim */
const faceTex = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d")!;
    c.fillStyle = "rgba(0,0,0,0)";
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#7A3E1C";
    c.font = "900 120px Impact, Helvetica Neue, Arial";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("1¢", 128, 136);
    tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

const Coin: React.FC<{ split?: number; tint?: number; face?: boolean }> = ({ split = 0, tint = 0, face = false }) => {
  const c = new THREE.Color(COPPER).lerp(new THREE.Color("#8A2B2B"), tint);
  return (
    <group>
      {face ? (
        <mesh position={[0, 0.082 + split * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial map={faceTex()} transparent />
        </mesh>
      ) : null}
      <mesh position={[0, split * 0.45, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.03, 16]} />
        <meshStandardMaterial color={c} flatShading metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.985, 0.985, 0.13, 16]} />
        <meshStandardMaterial color={split > 0.05 ? ZINC : c} flatShading metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, -split * 0.45, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.03, 16]} />
        <meshStandardMaterial color={c} flatShading metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.075 + split * 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.04, 4, 16]} />
        <meshStandardMaterial color={c} flatShading metalness={0.35} roughness={0.4} />
      </mesh>
    </group>
  );
};

const Heap: React.FC<{ k: number; tint: number }> = ({ k, tint }) => {
  const n = 260;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 99)) * 2.6;
        const restY = Math.max(0, (2.6 - r) * 0.55) + rnd(i + 7) * 0.15;
        const born = (i / n) * 0.75;
        const tt = Math.max(0, Math.min(1, (k - born) / 0.25));
        const y = restY + (1 - tt * tt) * 6;
        if (k < born) return null;
        return (
          <group key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[rnd(i + 3) * 1.2 - 0.6, rnd(i + 5) * 3, rnd(i + 9) * 1.2 - 0.6]} scale={0.32}>
            <Coin tint={tint} />
          </group>
        );
      })}
    </>
  );
};

const Press: React.FC<{ strike: number }> = ({ strike }) => {
  const mat = <meshStandardMaterial color="#5B6B8C" flatShading metalness={0.3} roughness={0.6} />;
  const ramY = 2.6 - strike * 1.25;
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[3, 0.5, 2]} />
        {mat}
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 2, 0]} castShadow>
          <boxGeometry args={[0.3, 3.5, 0.3]} />
          {mat}
        </mesh>
      ))}
      <mesh position={[0, 3.75, 0]} castShadow>
        <boxGeometry args={[3, 0.5, 1.2]} />
        {mat}
      </mesh>
      <mesh position={[0, ramY, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.6, 8]} />
        <meshStandardMaterial color="#8E9BB5" flatShading metalness={0.5} roughness={0.4} />
      </mesh>
      <group position={[0, 0.58, 0]} scale={0.42}>
        <Coin />
      </group>
    </group>
  );
};

const Rig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3 }> = ({ pos, look }) => {
  const { camera } = useThree();
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

export const Penny3D: React.FC<PennyProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const t = f / fps;
  const idx = Math.max(0, p.scenes.findIndex((s, i) => ms >= s.startMs && (i === p.scenes.length - 1 || ms < p.scenes[i + 1].startMs)));
  const sc = p.scenes[idx];
  const prev = p.scenes[Math.max(0, idx - 1)];
  const local = f - Math.round((sc.startMs / 1000) * fps);
  const sceneFrames = Math.max(1, Math.round((sc.durationMs / 1000) * fps));
  const move = idx === 0 ? 1 : ease(interpolate(local, [0, 22], [0, 1], clamp));
  const v = (a: [number, number, number]) => new THREE.Vector3(...a);
  const look = v(POS[prev.state]).lerp(v(POS[sc.state]), move);
  const push = interpolate(local, [0, sceneFrames], [0, 1], clamp);
  const cam = v(POS[prev.state]).add(v(CAM[prev.state])).lerp(v(POS[sc.state]).add(v(CAM[sc.state])), move).add(new THREE.Vector3(Math.sin(t * 0.45) * 0.3 + push * 0.4, Math.sin(t * 0.6) * 0.1, -push * 0.8));
  cam.z += interpolate(f, [0, 26], [3, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

  const sp = (d: number, cfg = { damping: 14, stiffness: 120 }) => spring({ frame: local - d, fps, config: cfg });
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = spring({ frame: f - Math.round((numAt / 1000) * fps), fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
  const at = (st: PennyStation) => p.scenes.findIndex((s) => s.state === st);
  const reached = (st: PennyStation) => idx >= at(st) && at(st) >= 0;

  const split = sc.state === "layers" ? sp(10) : 0;
  const heapK = sc.state === "heap" ? interpolate(local, [0, sceneFrames * 0.9], [0, 1], clamp) : reached("heap") ? 1 : 0;
  const tint = sc.state === "loss" ? interpolate(local, [4, 24], [0, 0.6], clamp) : 0;
  const strikeT = sc.state === "press" ? local / fps : -1;
  const strike = strikeT < 0 ? 0 : strikeT < 0.9 ? 0 : strikeT < 1.1 ? (strikeT - 0.9) / 0.2 : strikeT < 1.6 ? 1 : Math.max(0, 1 - (strikeT - 1.6) / 0.5);
  const stacks = sc.state === "saved" ? sp(6, { damping: 16, stiffness: 90 }) : reached("saved") ? 1 : 0;
  const rollT = sc.state === "roll" ? interpolate(local, [0, sceneFrames], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) }) : 0;

  const sfx: SfxCue[] = [
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.22 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.28 }] : [])),
    ...(at("press") >= 0 ? [{ atMs: p.scenes[at("press")].startMs + 1000, src: "impact-metal-heavy", volume: 0.35 }] : []),
    ...(at("heap") >= 0 ? [{ atMs: p.scenes[at("heap")].startMs + 300, src: "pixabay-riser", volume: 0.15 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: SKY_BOT }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <color attach="background" args={[SKY_TOP]} />
        <fog attach="fog" args={[SKY_BOT, 14, 34]} />
        <Rig pos={cam} look={look} />
        <hemisphereLight args={[SKY_TOP, SKY_BOT, 1.1]} />
        <directionalLight position={[look.x + 5, 9, 6]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
        <Ground />

        {/* hero / layers coin */}
        {idx <= at("layers") || idx === 0 ? (
          <group position={POS.hero} rotation={[1.25 - split * 0.5, t * 0.6, 0.15]}>
            <Coin split={split} face />
          </group>
        ) : null}
        {/* heap of 3 billion */}
        <group position={[POS.heap[0], -0.15, 0]}>{heapK > 0 ? <Heap k={heapK} tint={tint} /> : null}</group>
        {sc.state === "loss" ? (
          <group position={[POS.heap[0] + 2.6, 2.6 - sp(4) * 0.9, 0.5]} rotation={[0, 0, Math.PI]}>
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.5, 0.8, 4]} />
              <meshStandardMaterial color="#E5484D" flatShading />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.32, 1, 0.32]} />
              <meshStandardMaterial color="#E5484D" flatShading />
            </mesh>
          </group>
        ) : null}
        {/* press */}
        <group position={[POS.press[0], -0.15, 0]}>
          <Press strike={strike} />
        </group>
        {/* savings: coin stacks */}
        <group position={[POS.saved[0], -0.15, 0]}>
          {Array.from({ length: 7 }).map((_, i) => {
            const h = (0.6 + rnd(i + 40) * 1.6) * stacks;
            const n = Math.max(1, Math.round(h / 0.14));
            return (
              <group key={i} position={[(i - 3) * 0.75, 0, (rnd(i + 41) - 0.5) * 0.8]}>
                {Array.from({ length: n }).map((__, j) => (
                  <group key={j} position={[0, 0.07 + j * 0.14, 0]} rotation={[0, rnd(i * 31 + j) * 3, 0]} scale={0.3}>
                    <Coin />
                  </group>
                ))}
              </group>
            );
          })}
        </group>
        {/* final roll back to the start */}
        {sc.state === "roll" ? (
          <group position={[POS.roll[0] - 3 + rollT * 3, 0.42, POS.roll[2]]} rotation={[Math.PI / 2, 0, -rollT * 7]} scale={0.42}>
            <Coin face />
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.num ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: sc.state === "years" ? 760 : 500, textAlign: "center", transform: `scale(${0.4 + 0.6 * numK})`, opacity: numK }}>
          <div style={{ display: "inline-block", background: "#fff", borderRadius: 30, padding: "14px 44px 6px", boxShadow: "0 18px 40px rgba(80,40,20,.25)" }}>
            <div style={{ fontFamily: FONT.anton, fontSize: 180, lineHeight: 1.02, color: "#2A1A12" }}>{sc.num}</div>
            {sc.label ? <div style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 38, color: "#7A4A2E", paddingBottom: 12 }}>{sc.label}</div> : null}
          </div>
        </div>
      ) : null}

      {p.topHook ? (
        <div style={{ position: "absolute", top: 290, left: 60, right: 160, padding: "16px 24px", background: "#2A1A12", borderLeft: `10px solid ${COPPER}`, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: "#fff", textTransform: "uppercase" }}>{p.topHook}</div>
      ) : null}
      <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(42,26,18,.6)" }}>LINE ITEM</div>
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={74} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
