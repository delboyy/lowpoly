import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { loopSin, Brand, HookBar, LPCoin, LowPolyWorld, NumPlate, Palette, Stamp, V3, clamp, popK, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";

// Low-poly story: "Coke cost a nickel for 73 years" (2026-10-27). Generic bottle/machine, no Coca-Cola logo or script.
export type CokeStation = "hero" | "shelf" | "machine" | "question" | "coin" | "rejected" | "empty" | "payoff";
export type CokeScene = Timed & { state: CokeStation; num?: string; label?: string; at?: string };
export type CokeProps = BaseResolved<CokeScene> & { topHook?: string };

const PAL: Palette = { skyTop: "#FFE3D1", skyBot: "#FFB8B0", ground: "#F4C7A8", accent: "#D7263D", ink: "#2A1A12" };
const RED = "#D7263D";
const NICKEL = "#C9CED6";
const POS: Record<CokeStation, V3> = {
  hero: [0, 1.2, 0], shelf: [8, 0.9, 0], machine: [16, 1.6, 0], question: [16, 1.3, 0.6], coin: [20, 1.8, 0], rejected: [20, 1.8, 0], empty: [16, 0.7, 2.2], payoff: [0, 1.2, 0],
};
const CAM: Record<CokeStation, V3> = {
  hero: [0, 0.6, 8.0], shelf: [-1.5, 1.6, 7.5], machine: [1.6, 0.8, 7.6], question: [1.0, 0.4, 5.6], coin: [0, 0.6, 7.0], rejected: [0.8, 0.4, 7.4], empty: [0.3, 1.2, 5.6], payoff: [0.6, 0.7, 8.2],
};

const Bottle: React.FC<{ empty?: boolean; glow?: number }> = ({ empty, glow = 0 }) => {
  const { glass, liquid } = useMemo(() => {
    const prof: [number, number][] = [[0, 0], [0.32, 0], [0.36, 0.08], [0.34, 0.5], [0.4, 0.95], [0.36, 1.35], [0.24, 1.75], [0.15, 2.15], [0.14, 2.45], [0.17, 2.5], [0, 2.5]];
    const glass = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 10);
    const liquid = new THREE.LatheGeometry(prof.filter(([, y]) => y <= 1.9).map(([r, y]) => new THREE.Vector2(Math.max(0, r - 0.03), y + 0.02)), 10);
    return { glass, liquid };
  }, []);
  return (
    <group>
      <mesh geometry={glass} castShadow>
        <meshPhysicalMaterial color="#8FC4A2" flatShading transparent opacity={0.55} roughness={0.15} metalness={0.05} emissive={glow > 0 ? "#FFD21F" : "#000"} emissiveIntensity={glow * 0.6} />
      </mesh>
      {!empty ? (
        <mesh geometry={liquid}>
          <meshStandardMaterial color="#4A1A10" flatShading roughness={0.4} />
        </mesh>
      ) : null}
      <mesh position={[0, 2.52, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 10]} />
        <meshStandardMaterial color={RED} flatShading metalness={0.4} />
      </mesh>
    </group>
  );
};

const PriceTag: React.FC<{ text: string }> = ({ text }) => (
  <mesh rotation={[-0.25, 0, 0]}>
    <planeGeometry args={[0.7, 0.42]} />
    <meshStandardMaterial map={textTex(text, "#2A1A12", 150, 256, 154, undefined, "#FFFFFF")} />
  </mesh>
);

const Machine: React.FC<{ coinT: number; dropT: number }> = ({ coinT, dropT }) => (
  <group>
    <mesh position={[0, 1.6, 0]} castShadow>
      <boxGeometry args={[2.0, 3.2, 1.3]} />
      <meshStandardMaterial color={RED} flatShading roughness={0.5} />
    </mesh>
    <mesh position={[-0.25, 2.0, 0.66]}>
      <boxGeometry args={[1.1, 1.6, 0.04]} />
      <meshStandardMaterial color="#FFE9E2" flatShading emissive="#FFD8C8" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0.62, 2.1, 0.67]}>
      <boxGeometry args={[0.36, 0.5, 0.04]} />
      <meshStandardMaterial color="#2A1A12" flatShading />
    </mesh>
    <mesh position={[0.62, 2.22, 0.7]}>
      <boxGeometry args={[0.2, 0.04, 0.04]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh position={[0, 0.45, 0.62]}>
      <boxGeometry args={[1.4, 0.45, 0.2]} />
      <meshStandardMaterial color="#5A1018" flatShading />
    </mesh>
    {/* nickel sliding into the slot */}
    {coinT > 0 && coinT < 1 ? (
      <group position={[0.62 + (1 - coinT) * 1.2, 2.22 + (1 - coinT) * 0.6, 0.85]} rotation={[0, 0, Math.PI / 2]} scale={0.14}>
        <LPCoin color={NICKEL} face="5¢" />
      </group>
    ) : null}
    {/* bottle dropping into the tray */}
    {dropT > 0 ? (
      <group position={[0, 0.3 + (1 - Math.min(1, dropT)) * 1.0, 0.75]} rotation={[0, 0, Math.PI / 2]} scale={0.32}>
        <Bottle />
      </group>
    ) : null}
  </group>
);

export const Coke3D: React.FC<CokeProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames });
  const { sc, local, sceneFrames, t, at, phase } = S;
  const startF = (st: CokeStation) => (at(st) >= 0 ? Math.round((p.scenes[at(st)].startMs / 1000) * fps) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - Math.round((numAt / 1000) * fps), fps);

  const year = Math.round(interpolate(local, [0, sceneFrames * 0.9], [1886, 1959], clamp));
  const coinT = interpolate(f - startF("machine"), [12, 30], [0, 1], clamp) * (f >= startF("machine") ? 1 : 0);
  const dropT = interpolate(f - startF("machine"), [34, 46], [0, 1], clamp) * (f >= startF("machine") ? 1 : 0);
  const bigCoin = spring({ frame: f - startF("coin") - 4, fps, config: { damping: 13, stiffness: 110 } });
  const stampK = interpolate(f - startF("rejected") - 6, [0, 7], [0, 1], clamp);
  const rowK = (i: number) => spring({ frame: f - startF("empty") - 6 - i * 3, fps, config: { damping: 12, stiffness: 160 } });

  const sfx: SfxCue[] = [
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.22 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(at("machine") >= 0 ? [{ atMs: p.scenes[at("machine")].startMs + 1000, src: "pop-drop", volume: 0.3 }, { atMs: p.scenes[at("machine")].startMs + 1500, src: "impact-light", volume: 0.25 }] : []),
    ...(at("rejected") >= 0 ? [{ atMs: p.scenes[at("rejected")].startMs + 200, src: "impact-plate-heavy", volume: 0.35 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* hero: bottle + nickel */}
        <group position={[POS.hero[0] - 0.6, -0.2, 0]} rotation={[0, loopSin(phase, 1, t, 0.5) * 0.4, 0]}>
          <Bottle />
        </group>
        <group position={[POS.hero[0] + 0.9, 0.55, 0.3]} rotation={[1.25, loopSin(phase, 1, t, 0.9) * 0.35, 0.15]} scale={0.55}>
          <LPCoin color={NICKEL} face="5¢" />
        </group>
        {/* shelf: identical bottles, identical price */}
        <group position={[POS.shelf[0] - 4, -0.2, -0.4]}>
          <mesh position={[4, 0.05, 0]} receiveShadow castShadow>
            <boxGeometry args={[10, 0.1, 1.2]} />
            <meshStandardMaterial color="#B97A52" flatShading />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => (
            <group key={i} position={[i * 0.75, 0.1, 0]}>
              <group scale={0.5}>
                <Bottle />
              </group>
              <group position={[0, 0.05, 0.62]}>
                <PriceTag text="5¢" />
              </group>
            </group>
          ))}
        </group>
        {/* machine */}
        <group position={[POS.machine[0], -0.2, 0]}>
          <Machine coinT={coinT} dropT={dropT} />
        </group>
        {/* the 7.5 cent coin the Treasury refused */}
        <group position={[POS.coin[0], 0.2 + bigCoin * 1.6, 0]} rotation={[1.35 - bigCoin * 0.25, loopSin(phase, 1, t, 0.8) * 0.3, 0]} scale={0.2 + bigCoin * 1.15}>
          <LPCoin color={NICKEL} face={"7½¢"} />
        </group>
        {/* one in nine bottles empty */}
        {f >= startF("empty") && f < startF("payoff") + 30 ? (
          <group position={[POS.empty[0] - 3.6, -0.05, POS.empty[2]]}>
            {Array.from({ length: 9 }).map((_, i) => (
              <group key={i} position={[i * 0.6, (1 - rowK(i)) * 2.5 + (i === 6 ? 0.15 + loopSin(phase, 6, t, 4) * 0.05 : 0), 0]}>
                <group scale={0.42}>
                  <Bottle empty={i === 6} glow={0} />
                </group>
                {i === 6 ? (
                  <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.28, 0.4, 16]} />
                    <meshBasicMaterial color="#FFD21F" />
                  </mesh>
                ) : null}
              </group>
            ))}
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.state === "shelf" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: FONT.anton, fontSize: 200, color: "#fff", textShadow: "0 8px 0 #2A1A12, 0 14px 40px rgba(0,0,0,.3)" }}>{year}</div>
      ) : null}
      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {sc.state === "rejected" ? <Stamp k={stampK} text="REJECTED" /> : null}
      <HookBar text={p.topHook} accent={RED} />
      <Brand />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={74} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
