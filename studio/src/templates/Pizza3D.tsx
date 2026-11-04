import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { loopSin, Brand, HookBar, LPCoin, LowPolyWorld, NumPlate, Palette, V3, clamp, popK, rnd, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";

// Low-poly story: "Two pizzas. Now worth $800 million." (Bitcoin Pizza Day, 22 May 2010). Generic boxes, no chain branding.
export type PizzaStation = "laptop" | "pizzas" | "first" | "question" | "mountain" | "calendar" | "payoff";
export type PizzaScene = Timed & { state: PizzaStation; num?: string; label?: string; at?: string };
export type PizzaProps = BaseResolved<PizzaScene> & { topHook?: string };

const PAL: Palette = { skyTop: "#FFE8C2", skyBot: "#BFD8FF", ground: "#EBD2AE", accent: "#F7931A", ink: "#2A1A12" };
const GOLD = "#F2B33D";
const POS: Record<PizzaStation, V3> = {
  laptop: [0, 1.2, 0], pizzas: [7, 0.8, 0], first: [7, 1.0, 0], question: [7, 0.6, 0.4], mountain: [15, 1.4, 0], calendar: [22, 0.9, 0], payoff: [0, 1.2, 0],
};
const CAM: Record<PizzaStation, V3> = {
  laptop: [0.6, 1.2, 5.8], pizzas: [0, 6.8, 6.6], first: [1.0, 5.6, 6.4], question: [-0.8, 4.4, 6.4], mountain: [0, 2.8, 8.4], calendar: [0.6, 1.4, 8.4], payoff: [0.6, 1.2, 5.8],
};

const Pizza: React.FC = () => (
  <group>
    <mesh castShadow>
      <cylinderGeometry args={[1, 1, 0.12, 12]} />
      <meshStandardMaterial color="#E9B66B" flatShading />
    </mesh>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.86, 0.86, 0.04, 12]} />
      <meshStandardMaterial color="#D8452B" flatShading />
    </mesh>
    <mesh position={[0, 0.095, 0]}>
      <cylinderGeometry args={[0.8, 0.8, 0.02, 12]} />
      <meshStandardMaterial color="#F6D27A" flatShading />
    </mesh>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2 + rnd(i) * 0.4, r = 0.3 + rnd(i + 3) * 0.4;
      return (
        <mesh key={i} position={[Math.cos(a) * r, 0.115, Math.sin(a) * r]}>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 8]} />
          <meshStandardMaterial color="#9E2A1C" flatShading />
        </mesh>
      );
    })}
  </group>
);

const PizzaBox: React.FC<{ open: number }> = ({ open }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.3, 0.24, 2.3]} />
      <meshStandardMaterial color="#E7D2B0" flatShading />
    </mesh>
    <group position={[0, 0.26, 0]} scale={1}>
      <Pizza />
    </group>
    <group position={[0, 0.24, -1.15]} rotation={[-open * 1.25, 0, 0]}>
      <mesh position={[0, 0.02, 1.15]} castShadow>
        <boxGeometry args={[2.3, 0.05, 2.3]} />
        <meshStandardMaterial color="#F0DFC2" flatShading />
      </mesh>
    </group>
  </group>
);

const Laptop: React.FC = () => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[4.2, 0.12, 2.4]} />
      <meshStandardMaterial color="#B98A5E" flatShading />
    </mesh>
    <mesh position={[0, 0.62, 0.2]} castShadow>
      <boxGeometry args={[2.2, 0.08, 1.4]} />
      <meshStandardMaterial color="#9AA3B5" flatShading metalness={0.4} />
    </mesh>
    <group position={[0, 0.66, -0.5]} rotation={[-0.25, 0, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2.2, 1.4, 0.07]} />
        <meshStandardMaterial color="#9AA3B5" flatShading metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0.04]}>
        <planeGeometry args={[2.0, 1.2]} />
        <meshStandardMaterial map={textTex("10,000 BTC\nfor 2 pizzas?", "#FFFFFF", 120, 1024, 614, undefined, "#1E2A44")} emissive="#FFFFFF" emissiveMap={textTex("10,000 BTC\nfor 2 pizzas?", "#FFFFFF", 120, 1024, 614, undefined, "#1E2A44")} emissiveIntensity={0.6} />
      </mesh>
    </group>
  </group>
);

const CoinMountain: React.FC<{ k: number }> = ({ k }) => {
  const n = 220;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 99)) * 2.4;
        const restY = Math.max(0, (2.4 - r) * 0.8) + rnd(i + 7) * 0.15;
        const born = (i / n) * 0.75;
        if (k < born) return null;
        const tt = Math.max(0, Math.min(1, (k - born) / 0.25));
        return (
          <group key={i} position={[Math.cos(a) * r, restY + (1 - tt * tt) * 6, Math.sin(a) * r]} rotation={[rnd(i + 3) * 1.2 - 0.6, rnd(i + 5) * 3, rnd(i + 9) * 1.2 - 0.6]} scale={0.3}>
            <LPCoin color={GOLD} face="₿" faceColor="#8A5A12" />
          </group>
        );
      })}
    </>
  );
};

const Calendar: React.FC<{ flip: number }> = ({ flip }) => (
  <group>
    <mesh position={[0, 1.5, 0]} castShadow>
      <boxGeometry args={[2.4, 3.0, 0.3]} />
      <meshStandardMaterial color="#FFFFFF" flatShading />
    </mesh>
    <mesh position={[0, 2.7, 0.16]}>
      <boxGeometry args={[2.4, 0.6, 0.02]} />
      <meshStandardMaterial color="#D8452B" flatShading />
    </mesh>
    <mesh position={[0, 1.25, 0.16]}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshStandardMaterial map={textTex("MAY\n22", "#2A1A12", 130, 512, 512, undefined, "#FFFFFF")} />
    </mesh>
    {/* the page tearing away */}
    <group position={[0, 2.4, 0.17]} rotation={[-flip * 2.6, 0, 0]}>
      <mesh position={[0, -1.15, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial map={textTex("MAY\n21", "#2A1A12", 130, 512, 512, undefined, "#FFFFFF")} side={THREE.DoubleSide} transparent opacity={1 - Math.max(0, flip - 0.7) / 0.3} />
      </mesh>
    </group>
  </group>
);

export const Pizza3D: React.FC<PizzaProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames });
  const { sc, t, at, phase } = S;
  const startF = (st: PizzaStation) => (at(st) >= 0 ? Math.round((p.scenes[at(st)].startMs / 1000) * fps) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - Math.round((numAt / 1000) * fps), fps);
  const sp = (st: PizzaStation, d: number, cfg = { damping: 13, stiffness: 120 }) => spring({ frame: f - startF(st) - d, fps, config: cfg });

  const boxIn = sp("pizzas", 0);
  const lid = sp("pizzas", 14, { damping: 14, stiffness: 90 });
  const coinDrop = sp("first", 4, { damping: 9, stiffness: 140 });
  const mountainK = interpolate(f - startF("mountain"), [0, Math.round(((p.scenes[at("mountain")]?.durationMs ?? 4000) / 1000) * fps * 0.9)], [0, 1], clamp);
  const flip = interpolate(f - startF("calendar"), [8, 26], [0, 1], clamp);
  const gone = f >= startF("payoff") - 1 ? 0 : 1; // the big coin leaves before the payoff so the loop matches the pizzas
  const firstCoinY = 3.2 - coinDrop * 2.2;

  const sfx: SfxCue[] = [
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.22 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(at("first") >= 0 ? [{ atMs: p.scenes[at("first")].startMs + 350, src: "pixabay-ping", volume: 0.3 }] : []),
    ...(at("mountain") >= 0 ? [{ atMs: p.scenes[at("mountain")].startMs + 200, src: "pixabay-riser", volume: 0.15 }] : []),
    ...(at("calendar") >= 0 ? [{ atMs: p.scenes[at("calendar")].startMs + 400, src: "paper-tear", volume: 0.3 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        <group position={[POS.laptop[0], -0.2, 0]}>
          <Laptop />
        </group>
        {/* two pizza boxes slide in */}
        {f >= startF("pizzas") - 2 && [-1.3, 1.3].map((x, i) => (
          <group key={i} position={[POS.pizzas[0] + x + (1 - boxIn) * (i ? 6 : -6), -0.2, 0]} rotation={[0, (i ? -0.12 : 0.1), 0]} scale={0.95}>
            <PizzaBox open={lid} />
          </group>
        ))}
        {/* first-purchase coin lands on the pizzas */}
        {gone && f >= startF("first") ? (
          <group position={[POS.first[0], firstCoinY, 1.4]} rotation={[0.9, loopSin(phase, 1, t, 0.9) * 0.35, 0]} scale={0.5}>
            <LPCoin color={GOLD} face="₿" faceColor="#8A5A12" />
          </group>
        ) : null}
        <group position={[POS.mountain[0], -0.15, 0]}>{mountainK > 0 ? <CoinMountain k={mountainK} /> : null}</group>
        <group position={[POS.calendar[0], -0.2, 0]} rotation={[0, -0.15, 0]}>
          <Calendar flip={flip} />
        </group>
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {sc.state === "first" ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 500, textAlign: "center", opacity: interpolate(f - startF("first"), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 48, lineHeight: 1.15 }}>FIRST REAL-WORLD{"\n"}BITCOIN PURCHASE</span>
        </div>
      ) : null}
      <HookBar text={p.topHook} accent="#F7931A" />
      <Brand />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={74} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
