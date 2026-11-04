import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, leakSfx, Vignette, HookBar, LowPolyWorld, NumPlate, Palette, V3, clamp, loopSin, popK, rnd, storyCamera, wordMs } from "../kit3d/LowPoly";
import * as THREE from "three";
import { Bubble, Person, Phone } from "../kit3d/Props";

// Business Leaks #2 (Front-Desk): "Reply within an hour: ~7x likelier to qualify the lead" (HBR 2011). Loops back to the phone.
export type ReplyStation = "phone" | "data" | "street" | "dark" | "cold" | "payoff";
export type ReplyScene = Timed & { state: ReplyStation; num?: string; label?: string; at?: string };
export type ReplyProps = BaseResolved<ReplyScene> & { topHook?: string; /** format test: orthographic "toy" camera */ iso?: boolean };

const PAL: Palette = { skyTop: "#6FB9EC", skyBot: "#FFF1D6", ground: "#B5D78A", accent: "#2EC4B6", ink: "#1E2A44" };
const SX = 22;
const POS: Record<ReplyStation, V3> = { phone: [0, 1.9, 0], data: [11, 1.0, 0], street: [SX, 4.0, 0], dark: [SX, 4.9, 0], cold: [SX, 1.3, 3.2], payoff: [0, 1.9, 0] };
const CAM: Record<ReplyStation, V3> = { phone: [0.6, 1.2, 10.5], data: [0, 6.5, 10.5], street: [0, 0.6, 15.5], dark: [0, 0.3, 9.5], cold: [0.8, 0.9, 6.4], payoff: [0.6, 1.2, 10.5] };

// 10 shops down a street: 4 reply within the hour, 4 reply late, 2 never reply (HBR audit: 37% / 40% / 23%)
type Kind = "fast" | "late" | "none";
const KINDS: Kind[] = ["fast", "late", "none", "fast", "late", "fast", "late", "none", "fast", "late"];
const SHOPS = KINDS.map((k, i) => ({ k, x: SX + (i % 2 ? 1.2 : -1.2), y: 7.1 - Math.floor(i / 2) * 1.55 }));
const SHOP_COLORS = ["#F4D9B0", "#CDE7D8", "#F7C8C0", "#D6E0F5", "#F9E1A8"];

const Clock: React.FC<{ a: number }> = ({ a }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.14, 12]} />
      <meshStandardMaterial color="#FFFFFF" flatShading />
    </mesh>
    <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.9, 0.9, 0.1, 12]} />
      <meshStandardMaterial color="#C8553D" flatShading />
    </mesh>
    <group rotation={[0, 0, a]} position={[0, 0, 0.09]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.07, 0.6, 0.03]} />
        <meshStandardMaterial color="#1E2A44" />
      </mesh>
    </group>
    <mesh position={[0, 0.18, 0.09]}>
      <boxGeometry args={[0.08, 0.38, 0.03]} />
      <meshStandardMaterial color="#1E2A44" />
    </mesh>
  </group>
);

export const Reply3D: React.FC<ReplyProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: p.scenes.flatMap((s) => (s.num ? [Math.round(((s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200) / 1000) * fps)] : [])) });
  const { sc, t, at, phase } = S;
  const startF = (st: ReplyStation) => (at(st) >= 0 ? Math.round((p.scenes[at(st)].startMs / 1000) * fps) : 1e9);
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);

  const st = p.scenes[at("street")];
  const litAt = st ? msF(wordMs(p.captions, /^third/i, st.startMs, st.startMs + 2500)) : 1e9;
  const lit = spring({ frame: f - litAt, fps, config: { damping: 14, stiffness: 90 } });
  const darkK = interpolate(f, [startF("dark"), startF("dark") + 10], [0, 1], clamp);
  const freeze = interpolate(f, [startF("cold") + 6, startF("cold") + 30], [0, 1], clamp);
  const leave = interpolate(f, [startF("cold") + 34, startF("payoff") + 10], [0, 1], clamp);
  const towersK = (i: number) => spring({ frame: f - startF("data") - 3 - i, fps, config: { damping: 12, stiffness: 150 } });
  const inData = f >= startF("data") - 30 && f < startF("street") + 30;

  const sfx: SfxCue[] = [
    ...leakSfx(p.captions),
    { atMs: 0, src: "pixabay-ping", volume: 0.3 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(at("data") >= 0 ? [{ atMs: p.scenes[at("data")].startMs + 150, src: "pixabay-riser", volume: 0.14 }] : []),
    ...(litAt < 1e8 ? [{ atMs: (litAt / fps) * 1000, src: "pixabay-whoosh-cinematic", volume: 0.16 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} orthographic={!!p.iso} camera={p.iso ? { zoom: 60, position: [10, 10, 10], near: 0.1, far: 400 } : { fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the counter: a new inquiry and a clock that never stops */}
        <group position={[0, -0.2, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 1.0, 1.8]} />
            <meshStandardMaterial color="#B98A5E" flatShading />
          </mesh>
          <group position={[-0.9, 1.9, 0.3]} rotation={[-0.15, 0.25, loopSin(phase, 4, t, 2) * 0.04]}>
            <Phone glow={0.6} screen="#25D366" />
          </group>
          <group position={[-0.2, 3.25, 0.5]} rotation={[0, -0.1, 0]} scale={Math.max(0.001, (0.62 + loopSin(phase, 3, t, 1) * 0.03) * (sc.state === "phone" && sc.num ? 1 - Math.min(1, numK) : 1))}>
            <Bubble text={"NEW\nINQUIRY"} bg="#FFFFFF" ink="#1E2A44" w={2.0} />
          </group>
          <group position={[1.3, 1.75, 0.3]} rotation={[0, -0.3, 0]} scale={0.8}>
            <Clock a={-2 * Math.PI * 8 * phase} />
          </group>
        </group>
        {/* 42 firms, 1.25M leads */}
        {inData &&
          Array.from({ length: 42 }).map((_, i) => {
            const k = towersK(i);
            const h = 0.6 + rnd(i) * 1.4;
            return (
              <mesh key={i} position={[POS.data[0] - 3 + (i % 7), (h * k) / 2 - 0.2, -2.5 + Math.floor(i / 7)]} scale={[1, Math.max(0.01, k), 1]} castShadow>
                <boxGeometry args={[0.7, h, 0.7]} />
                <meshStandardMaterial color={["#7CC6A4", "#7FA8E0", "#F2B66B", "#E98A7A"][i % 4]} flatShading />
              </mesh>
            );
          })}
        {inData &&
          Array.from({ length: 40 }).map((_, i) => {
            const y = 6 - (((f / fps) * 1.6 + rnd(i + 50) * 6) % 6);
            return (
              <mesh key={`e${i}`} position={[POS.data[0] - 3.4 + rnd(i) * 6.8, y, -2.6 + rnd(i + 9) * 6]} rotation={[0.3, rnd(i) * 3, 0.2]}>
                <boxGeometry args={[0.32, 0.04, 0.22]} />
                <meshStandardMaterial color="#FFFFFF" flatShading />
              </mesh>
            );
          })}
        {/* a block of ten businesses, five floors of two */}
        {f >= startF("street") - 30 && f < startF("cold") + 40 ? (
          <group>
            <mesh position={[SX, 3.7, -0.6]} castShadow receiveShadow>
              <boxGeometry args={[5.2, 8.2, 1.0]} />
              <meshStandardMaterial color="#E9DCC8" flatShading />
            </mesh>
            <mesh position={[SX, 7.95, -0.5]} castShadow>
              <boxGeometry args={[5.6, 0.3, 1.3]} />
              <meshStandardMaterial color="#C8553D" flatShading />
            </mesh>
            {SHOPS.map((s, i) => {
              const glow = s.k === "fast" ? lit : s.k === "late" ? lit * 0.3 : 0;
              const label = s.k === "fast" ? "REPLIED\n< 1 HOUR" : s.k === "late" ? "LATER…" : darkK > 0.5 ? "NO\nREPLY" : "…";
              const bg = s.k === "fast" ? "#BDF2D5" : s.k === "late" ? "#FFF1C2" : darkK > 0.5 ? "#F7C8C0" : "#E6E6E6";
              const pop = s.k === "none" ? 1 : lit;
              const win = new THREE.Color("#3A4660").lerp(new THREE.Color("#FFE38A"), glow);
              return (
                <group key={i} position={[s.x, s.y, 0]}>
                  <mesh>
                    <boxGeometry args={[2.1, 1.25, 0.08]} />
                    <meshStandardMaterial color={win} emissive={win} emissiveIntensity={glow * 0.7} flatShading />
                  </mesh>
                  <mesh position={[0, 0.72, 0.12]} rotation={[0.35, 0, 0]}>
                    <boxGeometry args={[2.3, 0.08, 0.4]} />
                    <meshStandardMaterial color={SHOP_COLORS[i % 5]} flatShading />
                  </mesh>
                  <group position={[0, -0.05 + loopSin(phase, 3 + (i % 3), t, 1) * 0.03, 0.35]} scale={Math.max(0.001, pop) * 0.62}>
                    <Bubble text={label} bg={bg} w={2.2} />
                  </group>
                </group>
              );
            })}
          </group>
        ) : null}
        {/* the lead at the end of the street: the message freezes, the buyer moves on */}
        {f >= startF("cold") - 30 && f < startF("payoff") + 40 ? (
          <group position={[SX + 0.6 - leave * 3, -0.2, 3.2 + leave * 1.5]} rotation={[0, leave > 0 ? -2.0 : -0.3, 0]}>
            <Person color="#E07A5F" walk={leave > 0 && leave < 1 ? (f / fps) * 1.8 : 0} />
            <group position={[0.9, 2.3, 0]} scale={0.6} rotation={[0, leave > 0 ? 2.0 : 0.3, 0]}>
              <Bubble text={freeze > 0.5 ? "NEVER\nMIND" : "STILL\nAVAILABLE?"} bg={freeze > 0.5 ? "#CFE8FF" : "#FFFFFF"} ink={freeze > 0.5 ? "#4A7BB7" : "#1E2A44"} w={2.0} />
            </group>
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {sc.state === "data" ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 520, textAlign: "center", opacity: interpolate(f - startF("data"), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#1E2A44", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15 }}>1.25 MILLION LEADS{"\n"}42 US COMPANIES</span>
          <div style={{ marginTop: 14, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 30, color: "rgba(30,42,68,.75)" }}>HBR 2011 · US web leads</div>
        </div>
      ) : null}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta captions={p.captions} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
