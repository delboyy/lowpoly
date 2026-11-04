import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, leakSfx, HookBar, LowPolyWorld, NumPlate, Palette, V3, Vignette, clamp, loopSin, popK, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Bubble, Person, Phone } from "../kit3d/Props";

// Business Leaks #6 (trades): "POV: your pipe burst. Their phone rings." (Invoca: 27% of home-services calls unanswered).
// A cutaway living room with a dripping ceiling; across town an empty van with a ringing phone; four phones, one dark;
// the plumber under someone else's sink; the text-back that would have helped pops. Seamless loop: back to the drip.
export type TradesStation = "ceiling" | "dial" | "van" | "voicemail" | "bucket" | "phones" | "sink" | "text" | "payoff";
export type TradesScene = Timed & { state: TradesStation; num?: string; label?: string; at?: string };
export type TradesProps = BaseResolved<TradesScene> & { topHook?: string; /** format test: orthographic "toy" camera */ iso?: boolean };

const PAL: Palette = { skyTop: "#7FC6F0", skyBot: "#FFE6C9", ground: "#BFDC98", accent: "#2EC4B6", ink: "#2A1A12" };
const WATER = "#4FB3F0";
const DRIP_X = 0.7, DRIP_Z = 0.25, CEIL = 4.1;
const POS: Record<TradesStation, V3> = {
  ceiling: [0.3, 2.2, -0.4], dial: [0.25, 1.3, 0.75], van: [12.7, 1.5, 0], voicemail: [12.7, 1.5, 0],
  bucket: [0.6, 1.5, 0.1], phones: [6.2, 1.4, 0], sink: [20.2, 0.9, 0], text: [20.2, 1.5, 0.3], payoff: [0.3, 2.2, -0.4],
};
const CAM: Record<TradesStation, V3> = {
  ceiling: [0, 0.3, 8.0], dial: [0.1, 0.05, 2.0], van: [0.6, 1.2, 8.2], voicemail: [0.6, 1.2, 8.2],
  bucket: [0.3, 0.7, 6.8], phones: [0, 0.5, 9.6], sink: [0.8, 1.5, 6.6], text: [0.3, 0.5, 7.0], payoff: [0, 0.3, 8.0],
};

const Box: React.FC<{ pos: V3; size: V3; color: string; rot?: V3 }> = ({ pos, size, color, rot = [0, 0, 0] }) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} flatShading />
  </mesh>
);

/** expanding rings around a ringing phone */
const RingWaves: React.FC<{ phase: number; on: boolean }> = ({ phase, on }) =>
  on ? (
    <group>
      {[0, 1, 2].map((i) => {
        const k = (phase * 30 + i / 3) % 1;
        return (
          <mesh key={i} scale={0.4 + k * 1.4}>
            <torusGeometry args={[1, 0.04, 4, 24]} />
            <meshStandardMaterial color="#FFD21F" emissive="#FFD21F" emissiveIntensity={0.6} transparent opacity={1 - k} />
          </mesh>
        );
      })}
    </group>
  ) : null;

export const Trades3D: React.FC<TradesProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numFrames = p.scenes.flatMap((s) => (s.num ? [msF(s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200)] : []));
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: numFrames });
  const { sc, t, at, phase } = S;
  const startF = (st: TradesStation) => (at(st) >= 0 ? msF(p.scenes[at(st)].startMs) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);

  // the homeowner's phone: at the chest (dial, voicemail), at the ear while holding the bucket
  const bk = startF("bucket"), ph = startF("phones");
  const bucketK = spring({ frame: f - bk + 4, fps, config: { damping: 14, stiffness: 120 } }) * (1 - interpolate(f, [ph, ph + 12], [0, 1], clamp));
  const atEar = interpolate(f, [bk - 2, bk + 10, ph, ph + 12], [0, 1, 1, 0], clamp);
  const fill = interpolate(f, [bk, ph], [0.1, 0.75], clamp);
  const voicemail = f >= startF("voicemail") && f < startF("payoff");
  const ringing = f >= startF("van") - 10 && f < startF("voicemail") + 4;
  const ringShake = ringing ? Math.sin(f * 2.4) * 0.08 : 0;
  // four phones: three light up (answered), one stays dark
  const litK = (i: number) => spring({ frame: f - ph - 8 - i * 6, fps, config: { damping: 12, stiffness: 150 } });
  // the sink phone buzzes; the text-back bubble appears, then pops (it never happened)
  const tx = startF("text");
  const bubbleIn = spring({ frame: f - tx - 6, fps, config: { damping: 11, stiffness: 140 } });
  const popAt = startF("payoff") - 18;
  const popped = interpolate(f, [popAt, popAt + 5], [0, 1], clamp);
  const sinkBuzz = f >= startF("sink") && f < tx ? Math.sin(f * 2.2) * 0.06 : 0;

  const sfx: SfxCue[] = [
    ...leakSfx(p.captions),
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.16 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(startF("voicemail") < 1e8 ? [{ atMs: p.scenes[at("voicemail")].startMs, src: "sting-bong", volume: 0.22 }] : []),
    ...[0, 1, 2].map((i) => ({ atMs: ((ph + 8 + i * 6) / fps) * 1000, src: "pop-select", volume: 0.2 })),
    ...(tx < 1e8 ? [{ atMs: ((tx + 6) / fps) * 1000, src: "pixabay-pop", volume: 0.25 }, { atMs: (popAt / fps) * 1000, src: "pop-drop", volume: 0.3 }] : []),
  ];

  // drips: periodic over the loop; they land in the bucket when it is there, else on the floor
  const landY = bucketK > 0.5 ? 0.85 + fill * 0.5 : 0.05;
  const drops = [0, 1, 2].map((i) => {
    const k = (phase * 24 + i / 3) % 1;
    return CEIL - 0.1 - k * (CEIL - 0.1 - landY);
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} orthographic={!!p.iso} camera={p.iso ? { zoom: 60, position: [10, 10, 10], near: 0.1, far: 400 } : { fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />

        {/* the living room, cut away: back wall, side wall, ceiling with the leak */}
        <group position={[0, -0.2, 0]}>
          <Box pos={[0, 2.2, -2.5]} size={[6.4, 4.4, 0.2]} color="#F6D7A7" />
          <Box pos={[-3.1, 2.2, -0.9]} size={[0.2, 4.4, 3.4]} color="#EBC48C" />
          <mesh position={[0, 4.45, -0.9]}>
            <boxGeometry args={[6.4, 0.3, 3.4]} />
            <meshStandardMaterial color="#FFF4E2" emissive="#FFF4E2" emissiveIntensity={0.45} flatShading />
          </mesh>
          <mesh position={[DRIP_X, 4.29, DRIP_Z - 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55, 9]} />
            <meshStandardMaterial color="#B9C6CC" flatShading />
          </mesh>
          <Box pos={[0, 0.03, -0.9]} size={[6.4, 0.06, 3.4]} color="#C98F5E" />
          {/* sofa + lamp + picture */}
          <Box pos={[-1.7, 0.45, -1.8]} size={[2.2, 0.6, 0.9]} color="#5FA8C8" />
          <Box pos={[-1.7, 0.95, -2.2]} size={[2.2, 0.8, 0.3]} color="#4E93B2" />
          <Box pos={[2.4, 0.8, -2.0]} size={[0.08, 1.6, 0.08]} color="#3A3F48" />
          <mesh position={[2.4, 1.75, -2.0]} castShadow>
            <coneGeometry args={[0.4, 0.5, 6]} />
            <meshStandardMaterial color="#FFE38A" emissive="#FFE38A" emissiveIntensity={0.5} flatShading />
          </mesh>
          <Box pos={[-1.7, 2.6, -2.38]} size={[1.2, 0.8, 0.05]} color="#E86A3A" />
          {/* the puddle */}
          <mesh position={[DRIP_X, 0.07, DRIP_Z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.6, 10]} />
            <meshStandardMaterial color={WATER} emissive={WATER} emissiveIntensity={0.15} transparent opacity={0.7} />
          </mesh>
          {drops.map((y, i) => (
            <mesh key={i} position={[DRIP_X, y, DRIP_Z]} scale={[0.09, 0.14, 0.09]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={WATER} emissive={WATER} emissiveIntensity={0.3} flatShading />
            </mesh>
          ))}
          {/* the homeowner, phone in hand */}
          <group position={[0.2, 0, -0.1]} rotation={[0, loopSin(phase, 2, t, 0.5) * 0.08, 0]}>
            <Person color="#E07A5F" mood={-0.5} walk={0} />
          </group>
          <group position={[0.2 + atEar * 0.3, 1.25 + atEar * 0.35, 0.35 - atEar * 0.3]} rotation={[-0.25 + atEar * 0.25, atEar * -1.2, 0]} scale={0.32}>
            <Phone screen={voicemail ? "#8A8F99" : "#2EC4B6"} glow={0.6} lines={voicemail ? ["Voicemail", "Leave a msg..."] : ["Calling...", "Plumber"]} />
          </group>
          {/* the bucket */}
          {bucketK > 0.01 ? (
            <group position={[DRIP_X, 0.55 + (1 - bucketK) * -0.6, DRIP_Z]} scale={Math.max(0.001, bucketK)}>
              <mesh castShadow>
                <cylinderGeometry args={[0.42, 0.33, 0.7, 9, 1, true]} />
                <meshStandardMaterial color="#9AA3AD" flatShading side={2} />
              </mesh>
              <mesh position={[0, -0.34 + fill * 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.33 + fill * 0.08, 9]} />
                <meshStandardMaterial color={WATER} emissive={WATER} emissiveIntensity={0.2} />
              </mesh>
            </group>
          ) : null}
        </group>

        {/* four phones on a stand: three answered, one stays dark */}
        <group position={[6.2, -0.2, 0]}>
          <Box pos={[0, 0.45, -0.2]} size={[4.0, 0.9, 1.0]} color="#F4D9B0" />
          {[0, 1, 2, 3].map((i) => {
            const dark = i === 2;
            const k = dark ? 0 : Math.min(1, litK(i));
            return (
              <group key={i} position={[-1.5 + i, 1.55 + k * 0.08, 0]} rotation={[-0.1, 0, 0]} scale={0.55}>
                <Phone screen={dark ? "#1E2230" : "#2EC4B6"} glow={dark ? 0.05 : 0.15 + k * 0.6} lines={["Hello?", "Yes, today!"]} off={dark} />
              </group>
            );
          })}
        </group>

        {/* the plumber's van across town, phone ringing on the seat */}
        <group position={[12, -0.2, -0.4]}>
          <Box pos={[-0.5, 1.0, 0]} size={[2.6, 1.6, 1.6]} color="#FFFFFF" />
          <Box pos={[1.2, 0.8, 0]} size={[1.1, 1.2, 1.6]} color="#FFFFFF" />
          <Box pos={[1.45, 1.15, 0.0]} size={[0.6, 0.5, 1.62]} color="#8EC9F0" />
          <Box pos={[-0.5, 1.1, 0.81]} size={[2.0, 0.5, 0.02]} color="#2EC4B6" />
          <mesh position={[-0.5, 1.1, 0.83]}>
            <planeGeometry args={[1.9, 0.45]} />
            <meshStandardMaterial map={textTex("PLUMBING", "#FFFFFF", 90, 512, 128, undefined, "#2EC4B6")} />
          </mesh>
          {[[-1.2, 0.85], [-1.2, -0.85], [1.2, 0.85], [1.2, -0.85]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshStandardMaterial color="#2A2D33" flatShading />
            </mesh>
          ))}
          <group position={[1.2, 2.15, 0.7]} rotation={[0, -0.2, ringShake]} scale={0.5}>
            <Phone screen="#E86A3A" glow={ringing ? 0.8 : 0.1} lines={voicemail ? ["Missed call", "Voicemail"] : ["Incoming call", "New customer"]} />
            <group position={[0, 0, 0.2]}>
              <RingWaves phase={phase} on={ringing} />
            </group>
          </group>
        </group>

        {/* someone else's kitchen: the plumber under the sink, phone buzzing on the floor */}
        <group position={[20, -0.2, -0.4]}>
          <Box pos={[0, 2.2, -1.2]} size={[5.0, 4.4, 0.2]} color="#9FD8E8" />
          <Box pos={[0, 0.5, -0.6]} size={[2.4, 1.0, 1.0]} color="#B98A5E" />
          <Box pos={[0, 1.05, -0.6]} size={[2.6, 0.1, 1.1]} color="#E9DCC8" />
          <Box pos={[0.4, 1.12, -0.6]} size={[0.8, 0.06, 0.6]} color="#9AA3AD" />
          <Box pos={[0.4, 1.45, -0.95]} size={[0.08, 0.6, 0.08]} color="#9AA3AD" />
          <Box pos={[-0.6, 0.5, -0.05]} size={[0.6, 0.9, 0.05]} color="#A27852" rot={[0, -1.1, 0]} />
          {/* the plumber's legs and boots */}
          {[-0.14, 0.14].map((x, i) => (
            <group key={i} position={[x + 0.1, 0.13, 0.2]}>
              <Box pos={[0, 0, 0]} size={[0.2, 0.2, 0.9]} color="#2F5D8C" />
              <Box pos={[0, 0.05, 0.5]} size={[0.24, 0.26, 0.24]} color="#3A2A20" />
            </group>
          ))}
          <group position={[0.1, 0.15, 0.0]} rotation={[0, 0, loopSin(phase, 6, t, 3) * 0.05]}>
            <Box pos={[0, 0, -0.2]} size={[0.5, 0.26, 0.3]} color="#2F5D8C" />
          </group>
          <group position={[1.1, 0.06, 0.5]} rotation={[-Math.PI / 2, 0, 0.4 + sinkBuzz]} scale={0.4}>
            <Phone screen="#E86A3A" glow={f >= startF("sink") - 10 && f < popAt ? 0.8 : 0.1} lines={["Incoming call", "New customer"]} />
          </group>
          {f >= tx && popped < 1 ? (
            <group position={[0.3, 2.35, 0.6]} scale={Math.max(0.001, Math.min(1.1, bubbleIn) * 0.55 * (1 + popped * 0.4))}>
              <Bubble text={"SAW YOUR CALL!\nRINGING YOU BACK"} bg="#BDF2D5" ink="#1E2A44" w={2.8} />
            </group>
          ) : null}
          {popped > 0 && popped < 1
            ? Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return (
                  <mesh key={i} position={[0.3 + Math.cos(a) * popped * 1.4, 2.35 + Math.sin(a) * popped * 1.0, 0.6]} scale={0.08 * (1 - popped)}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#BDF2D5" flatShading />
                  </mesh>
                );
              })
            : null}
        </group>
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta captions={p.captions} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
