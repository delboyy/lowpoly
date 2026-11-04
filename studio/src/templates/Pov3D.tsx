import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, HookBar, LowPolyWorld, NumPlate, Palette, V3, Vignette, clamp, ease, popK, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Person } from "../kit3d/Props";

// Pilot A3 (2026-10-31): "POV: agency owner" — a low-poly office after hours. The owner plays detective with a
// lamp and a magnifier: a shared inbox whose badge just says "yes", a web form emailing a long-gone desk (cactus, dust),
// a muted group chat, a floor map of three dead ends, then every arrow bends into one glowing inbox. No spoken CTA
// (reach arm); the pill stays. The joke is always the process, never the people. Loop: the lamp clicks back on.
export type PovStation = "desk" | "inbox" | "form" | "group" | "mute" | "map" | "fix" | "payoff";
export type PovScene = Timed & { state: PovStation; num?: string; label?: string; at?: string };
export type PovProps = BaseResolved<PovScene> & { topHook?: string };

const PAL: Palette = { skyTop: "#41507F", skyBot: "#C7A9C9", ground: "#B79B86", accent: "#FFD21F", ink: "#2A1A12" };
const POS: Record<PovStation, V3> = { desk: [0, 1.3, 0], inbox: [8.2, 1.6, 0], form: [17.0, 1.2, 0], group: [26, 1.4, 0.4], mute: [26, 1.5, 0.4], map: [36.2, 0.0, 0.9], fix: [36.2, 0.0, 0.9], payoff: [0, 1.3, 0] };
const CAM: Record<PovStation, V3> = { desk: [0.4, 1.0, 7.4], inbox: [0.3, 0.6, 8.6], form: [0.2, 1.6, 10.5], group: [0, 0.4, 7.8], mute: [0, 0.3, 6.0], map: [0, 15, 7.5], fix: [0, 15, 7.5], payoff: [0.4, 1.0, 7.4] };
const OWNER: Record<PovStation, V3> = { desk: [-0.9, -0.2, 0.6], inbox: [6.9, -0.2, 1.0], form: [16.2, -0.2, 1.4], group: [24.9, -0.2, 1.2], mute: [24.9, -0.2, 1.2], map: [33.3, -0.2, 2.6], fix: [33.3, -0.2, 2.6], payoff: [-0.9, -0.2, 0.6] };

const Box: React.FC<{ pos: V3; size: V3; color: string; rot?: V3; emissive?: string; ei?: number }> = ({ pos, size, color, rot = [0, 0, 0], emissive, ei = 0 }) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} flatShading emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
  </mesh>
);

/** flat text card in the scene */
const Label: React.FC<{ pos: V3; text: string; w?: number; h?: number; color?: string; bg?: string; size?: number; rot?: V3 }> = ({ pos, text, w = 2, h = 0.5, color = "#2A1A12", bg = "rgba(255,247,232,1)", size = 90, rot = [0, 0, 0] }) => (
  <mesh position={pos} rotation={rot}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={textTex(text, color, size, Math.round(256 * w), Math.round(256 * h), "Montserrat, Arial Black, Arial", bg)} transparent toneMapped={false} />
  </mesh>
);

const Desk: React.FC<{ x: number; color?: string }> = ({ x, color = "#8A5A3C" }) => (
  <group position={[x, 0, 0]}>
    <Box pos={[0, 0.75, 0]} size={[2.6, 0.12, 1.2]} color={color} />
    <Box pos={[-1.15, 0.27, 0]} size={[0.12, 0.95, 1.0]} color="#6E4630" />
    <Box pos={[1.15, 0.27, 0]} size={[0.12, 0.95, 1.0]} color="#6E4630" />
  </group>
);

/** a flat arrow on the floor from a to b */
const Arrow: React.FC<{ a: V3; b: V3; color: string; glow?: number }> = ({ a, b, color, glow = 0 }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B), mid = A.clone().lerp(B, 0.5), ang = Math.atan2(B.x - A.x, B.z - A.z);
  return (
    <group position={[mid.x, mid.y, mid.z]} rotation={[0, ang, 0]}>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[0.16, 0.06, Math.max(0.01, len - 0.4)]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} flatShading />
      </mesh>
      <mesh position={[0, 0, len / 2 - 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.26, 0.5, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} flatShading />
      </mesh>
    </group>
  );
};

export const Pov3D: React.FC<PovProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numFrames = p.scenes.flatMap((s) => (s.num ? [msF(s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200)] : []));
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: numFrames });
  const { sc } = S;
  const idx = p.scenes.indexOf(sc);
  const startF = (st: PovStation) => { const i = p.scenes.findIndex((q) => q.state === st); return i < 0 ? 1e9 : msF(p.scenes[i].startMs); };
  const word = (st: PovStation, re: RegExp, fb = 0) => { const i = p.scenes.findIndex((q) => q.state === st); return i < 0 ? 1e9 : msF(wordMs(p.captions, re, p.scenes[i].startMs, p.scenes[i].startMs + fb)); };
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);

  // the owner walks station to station with the camera
  const prev = p.scenes[Math.max(0, idx - 1)];
  const local = f - msF(sc.startMs);
  const move = idx === 0 ? 1 : ease(interpolate(local, [0, 22], [0, 1], clamp));
  const o = new THREE.Vector3(...OWNER[prev.state]).lerp(new THREE.Vector3(...OWNER[sc.state]), move);
  const walking = move > 0.02 && move < 0.98 && prev.state !== sc.state;

  // beats
  const yesK = spring({ frame: f - word("inbox", /^yes/i, 2500), fps, config: { damping: 7, stiffness: 160 } });
  const wobble = Math.sin(f * 0.5) * 0.12 * Math.min(1, Math.max(0, (f - word("inbox", /^yes/i, 2500)) / 6));
  const flyF = word("form", /^emailing/i, 900);
  const fly = ease(interpolate(f, [flyF, flyF + 30], [0, 1], clamp));
  const groupK = popK(f - startF("group") - 4, fps);
  const muteK = spring({ frame: f - startF("mute"), fps, config: { damping: 9, stiffness: 220 } });
  const muteOn = f >= startF("mute") && f < startF("map");
  const groupOn = f >= startF("group") && f < startF("map");
  const bend = ease(interpolate(f, [startF("fix") + 6, startF("fix") + 36], [0, 1], clamp));
  const glow = interpolate(f, [startF("fix") + 30, startF("fix") + 44], [0, 1], clamp) * (f < startF("payoff") ? 1 : 0);
  // lamp: on, clicks off at the payoff's sigh, back on just before the loop
  const lampOff = f >= word("payoff", /^back/i, 900) - 4 && f < durationInFrames - 16;
  const lamp = lampOff ? 0.15 : 1;

  const sfx: SfxCue[] = [
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.24 }] : [])),
    ...p.scenes.slice(1).map((s) => ({ atMs: s.startMs, src: "pixabay-whoosh-short", volume: 0.14 })),
    { atMs: (word("inbox", /^yes/i, 2500) / fps) * 1000, src: "pop-pluck", volume: 0.3 },
    { atMs: (flyF / fps) * 1000, src: "pixabay-whoosh", volume: 0.22 },
    { atMs: (startF("mute") / fps) * 1000, src: "impact-soft-heavy", volume: 0.32 },
    { atMs: ((startF("fix") + 30) / fps) * 1000, src: "pixabay-sparkle", volume: 0.26 },
    { atMs: ((word("payoff", /^back/i, 900) - 4) / fps) * 1000, src: "pop-drop", volume: 0.22 },
    { atMs: ((durationInFrames - 16) / fps) * 1000, src: "pop-drop", volume: 0.22 },
  ].filter((c) => c.atMs < 1e8);

  // map: LEADS node and three dead ends; on "fix" every arrow bends into one inbox
  const M = 36;
  const src: V3 = [M - 1.5, 0.0, 1.1];
  const ends: V3[] = [[M - 1.5, 0.0, -1.5], [M + 0.5, 0.0, -2.0], [M + 1.9, 0.0, -0.6]];
  const hub: V3 = [M + 0.5, 0.0, -0.3];
  return (
    <AbsoluteFill style={{ background: PAL.skyTop }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} scenery={false} />
        {/* back wall of the office, running the whole length */}
        <Box pos={[18, 2.2, -3.4]} size={[52, 5, 0.2]} color="#D9C7AE" />

        {/* desk station: lamp + magnifier */}
        <Desk x={0} />
        <group position={[0.7, 0.81, -0.1]}>
          <Box pos={[0, 0.02, 0]} size={[0.36, 0.05, 0.36]} color="#2A2A2E" />
          <Box pos={[0, 0.4, 0]} size={[0.05, 0.8, 0.05]} color="#2A2A2E" />
          <mesh position={[-0.12, 0.82, 0]} rotation={[0, 0, 0.6]}>
            <coneGeometry args={[0.24, 0.32, 6, 1, true]} />
            <meshStandardMaterial color="#2E7D6E" emissive="#FFD87A" emissiveIntensity={0.4 * lamp} side={THREE.DoubleSide} flatShading />
          </mesh>
          <pointLight position={[-0.25, 0.6, 0.1]} intensity={3.2 * lamp} distance={4} color="#FFD87A" />
        </group>
        <Box pos={[-0.3, 0.86, 0.1]} size={[0.6, 0.06, 0.45]} color="#F4EFE4" />
        <Label pos={[-0.3, 0.9, 0.1]} rot={[-Math.PI / 2, 0, 0]} text={"CASE\nFILE"} w={0.5} h={0.38} size={46} bg="rgba(244,239,228,1)" />

        {/* inbox: monitor, unread badge reads "yes" */}
        <Desk x={8} color="#7A6A5A" />
        <Box pos={[8, 1.55, -0.2]} size={[1.9, 1.2, 0.1]} color="#22252B" />
        <Label pos={[8, 1.55, -0.14]} text={"SHARED INBOX\n\n▬▬▬▬▬▬\n▬▬▬▬▬▬\n▬▬▬▬▬▬"} w={1.7} h={1.05} size={40} color="#2A1A12" bg="rgba(236,242,250,1)" />
        <group position={[8.85, 2.1, 0.0]} rotation={[0, 0, wobble]} scale={Math.max(0.001, yesK)}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.08, 16]} />
            <meshStandardMaterial color="#E5484D" flatShading />
          </mesh>
          <Label pos={[0, 0, 0.05]} text="yes" w={0.6} h={0.4} size={84} color="#FFFFFF" bg="rgba(0,0,0,0)" />
        </group>

        {/* form: the contact form posts an envelope to an empty desk (cactus, dust) */}
        <Box pos={[15.2, 1.5, -0.6]} size={[1.4, 1.7, 0.08]} color="#FFFFFF" />
        <Label pos={[15.2, 1.5, -0.55]} text={"CONTACT US\n\nName ▭▭▭\nEmail ▭▭▭\n[ SEND ]"} w={1.3} h={1.6} size={36} bg="rgba(255,255,255,1)" />
        <Desk x={18.6} color="#9C8A76" />
        <Box pos={[18.4, 0.84, 0.1]} size={[0.9, 0.05, 0.35]} color="#3A3D44" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} pos={[18.05 + i * 0.13, 0.875, 0.05 + (i % 2) * 0.12]} size={[0.06, 0.02, 0.06]} color="#B8B0A2" />)}
        <group position={[19.5, 0.81, -0.2]}>
          <Box pos={[0, 0.1, 0]} size={[0.26, 0.2, 0.26]} color="#C0623B" />
          <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.08, 0.1, 0.5, 6]} /><meshStandardMaterial color="#5E9E5A" flatShading /></mesh>
          <mesh position={[0.12, 0.5, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.04, 0.05, 0.2, 5]} /><meshStandardMaterial color="#5E9E5A" flatShading /></mesh>
        </group>
        {fly > 0 && fly < 1 ? (
          <group position={[15.2 + fly * 3.2, 1.6 + Math.sin(Math.PI * fly) * 1.2 - fly * 0.6, -0.4 + fly * 0.4]} rotation={[0, 0, fly * 6]}>
            <Box pos={[0, 0, 0]} size={[0.5, 0.32, 0.04]} color="#FFF7E8" />
            <mesh position={[0, 0.04, 0.025]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.26, 0.26, 0.01]} /><meshStandardMaterial color="#F2CC8F" flatShading /></mesh>
          </group>
        ) : null}
        {fly >= 1 ? <Box pos={[18.9, 0.86, 0.25]} size={[0.5, 0.04, 0.32]} color="#FFF7E8" rot={[0, 0.3, 0]} /> : null}

        {/* group chat phone on a stand */}
        <group position={[26, 1.5, 0]} scale={1.0}>
          <Box pos={[0, 0, 0]} size={[0.96, 1.8, 0.1]} color="#22252B" />
          <Label pos={[0, 0, 0.06]} text={"\n\nPortal lead\n\nPortal lead\n\nPortal lead"} w={0.84} h={1.6} size={30} color="#1E2A44" bg="rgba(243,246,250,1)" />
        </group>
        <Box pos={[26, 0.25, 0]} size={[0.6, 0.9, 0.5]} color="#7A6A5A" />

        {/* floor map: three dead ends, then one inbox */}
        <Box pos={[M, -0.15, -0.2]} size={[5.6, 0.06, 5.2]} color="#EFE6D6" />
        <Label pos={[src[0], 0.01, src[2] + 0.6]} rot={[-Math.PI / 2, 0, 0]} text="LEADS" w={1.3} h={0.42} size={96} bg="rgba(255,210,31,1)" />
        {ends.map((e, i) => {
          const tgt = new THREE.Vector3(...e).lerp(new THREE.Vector3(...hub), bend);
          return <Arrow key={i} a={src} b={[tgt.x, 0.0, tgt.z]} color={bend > 0.5 ? "#1FA89C" : "#C8553D"} glow={glow * 0.5} />;
        })}
        {ends.map((e, i) => (
          <group key={i} position={[e[0], 0.01, e[2] - 0.5]} scale={1 - bend}>
            <Label pos={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} text={["OLD INBOX", "EX-DESK", "MUTED GROUP"][i]} w={1.6} h={0.36} size={44} color="#FFF7E8" bg="rgba(42,26,18,1)" />
          </group>
        ))}
        <group position={[hub[0], 0.25, hub[2] - 0.2]} scale={Math.max(0.001, bend)}>
          <Box pos={[0, 0, 0]} size={[1.5, 0.4, 0.9]} color="#1FA89C" emissive="#7EE0D4" ei={0.2 + glow * 0.8} />
          <Label pos={[0, 0.27, 0]} rot={[-Math.PI / 2, 0, 0]} text="ONE INBOX" w={1.4} h={0.4} size={54} color="#FFFFFF" bg="rgba(0,0,0,0)" />
        </group>

        {/* the owner, with a magnifier */}
        <group position={[o.x, o.y, o.z]} rotation={[0, sc.state === "map" || sc.state === "fix" ? 0.6 : 0.5, 0]}>
          <Person color="#3D405B" mood={sc.state === "mute" ? -0.6 : sc.state === "fix" ? 0.6 : 0} walk={walking ? (f / fps) * 2 : 0} />
          <group position={[0.42, 1.25, 0.32]} rotation={[0.3, 0, -0.5]}>
            <mesh><torusGeometry args={[0.16, 0.035, 6, 14]} /><meshStandardMaterial color="#2A2A2E" flatShading /></mesh>
            <mesh><circleGeometry args={[0.15, 14]} /><meshStandardMaterial color="#BFE6FF" transparent opacity={0.45} /></mesh>
            <Box pos={[0, -0.28, 0]} size={[0.05, 0.26, 0.05]} color="#6E4630" />
          </group>
        </group>
      </ThreeCanvas>

      {/* group chat header (generic UI) + the mute slam */}
      {groupOn ? (
        <div style={{ position: "absolute", left: 120, right: 120, top: 520, transform: `scale(${0.8 + 0.2 * groupK})`, opacity: Math.min(1, groupK * 2) }}>
          <div style={{ background: "#2A1A12", borderRadius: 28, padding: "20px 28px", display: "flex", alignItems: "center", gap: 22, boxShadow: "0 10px 0 rgba(0,0,0,.25)" }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: "#9C9790", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 34, color: "#FFF7E8" }}>LF</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 44, color: "#FFF7E8" }}>Leads FINAL final</div>
              <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 28, color: "rgba(255,247,232,.7)" }}>group</div>
            </div>
            {muteOn ? (
              <svg width="70" height="70" viewBox="0 0 24 24" style={{ transform: `scale(${muteK})` }}>
                <path d="M3 9v6h4l5 4V5L7 9H3z" fill="#FFF7E8" />
                <path d="M16 9l5 6M21 9l-5 6" stroke="#E5484D" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            ) : null}
          </div>
        </div>
      ) : null}
      {muteOn ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", transform: `scale(${0.5 + 0.5 * muteK}) rotate(-6deg)` }}>
          <span style={{ display: "inline-block", border: "12px solid #E5484D", color: "#E5484D", background: "rgba(255,247,232,.92)", borderRadius: 18, padding: "4px 40px", fontFamily: FONT.anton, fontSize: 150, letterSpacing: 6 }}>MUTED</span>
        </div>
      ) : null}
      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      <Vignette strength={0.3} />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
