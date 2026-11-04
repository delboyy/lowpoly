import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Vignette, HookBar, LowPolyWorld, NumPlate, Palette, V3, clamp, loopSin, popK, rnd, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Bubble, Person, ShopFront } from "../kit3d/Props";

// Business Leaks #3 (Front-Desk, real estate): "Almost half of home-buyer inquiries never got a reply from an agent" (WAV Group 2013-14).
// Loop: the buyer walks into the rival agency; a new buyer stands at the start with a fresh inquiry.
export type InquiryStation = "street" | "study" | "question" | "rival" | "house" | "payoff";
export type InquiryScene = Timed & { state: InquiryStation; num?: string; label?: string; at?: string };
export type InquiryProps = BaseResolved<InquiryScene> & { topHook?: string };

const PAL: Palette = { skyTop: "#8FAEF0", skyBot: "#FFC9D8", ground: "#BEDD9A", accent: "#2EC4B6", ink: "#2A1A12" };
const POS: Record<InquiryStation, V3> = { street: [0, 1.4, -2.0], study: [10, 4.0, 0], question: [0.1, 1.7, 2.0], rival: [0.4, 1.6, -1.2], house: [20, 1.8, 0.4], payoff: [0, 1.4, -2.0] };
const CAM: Record<InquiryStation, V3> = { street: [0, 4.6, 15.5], study: [0, 0, 18.5], question: [1.0, 0.8, 6.8], rival: [-0.6, 3.2, 12.5], house: [0.8, 1.4, 11.5], payoff: [0, 4.6, 15.5] };

const BUYER: V3 = [0.1, -0.2, 2.2];
const DOOR_B: V3 = [1.4, -0.2, -0.9];
const REDSET = new Set(Array.from({ length: 384 }, (_, i) => i).sort((a, b) => rnd(a + 7) - rnd(b + 7)).slice(0, 184)); // exactly 184 of 384 = 48%
const RED = (i: number) => REDSET.has(i);

const SaleSign: React.FC<{ text: string }> = ({ text }) => (
  <group>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.08, 1.2, 0.08]} />
      <meshStandardMaterial color="#6B4F3A" flatShading />
    </mesh>
    <mesh position={[0, 1.15, 0.05]}>
      <planeGeometry args={[1.1, 0.5]} />
      <meshStandardMaterial map={textTex(text, "#FFFFFF", 80, 512, 232, undefined, "#C8372D")} />
    </mesh>
  </group>
);

const House: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.0, 1.6, 1.8]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[1.75, 1.0, 4]} />
      <meshStandardMaterial color="#B5523B" flatShading />
    </mesh>
    <mesh position={[0, 0.5, 0.91]}>
      <planeGeometry args={[0.45, 0.9]} />
      <meshStandardMaterial color="#6B4F3A" />
    </mesh>
  </group>
);

const Key: React.FC = () => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.1, 6, 10]} />
      <meshStandardMaterial color="#F2B33D" flatShading metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[0.75, 0, 0]}>
      <boxGeometry args={[0.9, 0.12, 0.12]} />
      <meshStandardMaterial color="#F2B33D" flatShading metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[1.05, -0.12, 0]}>
      <boxGeometry args={[0.1, 0.22, 0.12]} />
      <meshStandardMaterial color="#F2B33D" flatShading metalness={0.4} roughness={0.4} />
    </mesh>
  </group>
);

export const Inquiry3D: React.FC<InquiryProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: p.scenes.flatMap((s) => (s.num ? [Math.round(((s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200) / 1000) * fps)] : [])) });
  const { sc, t, at, phase } = S;
  const startF = (st: InquiryStation) => (at(st) >= 0 ? Math.round((p.scenes[at(st)].startMs / 1000) * fps) : 1e9);
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);

  // the first buyer's inquiry flies to agency A and sits there unanswered; from the house scene on, a new buyer waits at the start
  const reset = f >= startF("house");
  const fly = reset ? 0 : interpolate(f, [8, 40], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const bub: V3 = [BUYER[0] + 0.7 + (-1.2 - BUYER[0] - 0.7) * fly, 2.6 + Math.sin(fly * Math.PI) * 0.8 - fly * 0.2, BUYER[2] + (-0.6 - BUYER[2]) * fly];
  const walk = reset ? 0 : interpolate(f, [startF("rival") + 6, startF("rival") + 46], [0, 1], clamp);
  const inside = !reset && f > startF("rival") + 50;
  const buyerPos: V3 = [BUYER[0] + (DOOR_B[0] - BUYER[0]) * walk, -0.2, BUYER[2] + (DOOR_B[2] - BUYER[2]) * walk];
  const waitK = spring({ frame: f - startF("question") - 4, fps, config: { damping: 12, stiffness: 140 } });
  const replyK = spring({ frame: f - startF("rival") - 20, fps, config: { damping: 12, stiffness: 140 } });
  const rs = p.scenes[at("study")];
  const redAt = rs ? msF(wordMs(p.captions, /^forty/i, rs.startMs, rs.startMs + 2500)) : 1e9;
  const keyK = spring({ frame: f - startF("house") - 6, fps, config: { damping: 11, stiffness: 120 } });
  const inStudy = f >= startF("study") - 30 && f < startF("question") + 30;
  const inHouse = f >= startF("house") - 30 && f < startF("payoff") + 30;

  const sfx: SfxCue[] = [
    { atMs: 300, src: "pixabay-whoosh-cinematic", volume: 0.16 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(at("rival") >= 0 ? [{ atMs: p.scenes[at("rival")].startMs + 700, src: "pixabay-ping", volume: 0.3 }] : []),
    ...(at("house") >= 0 ? [{ atMs: p.scenes[at("house")].startMs + 250, src: "pixabay-riser", volume: 0.14 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the street: two agencies, homes for sale behind */}
        <group position={[-1.2, -0.2, -2.0]}>
          <ShopFront sign="HOMES" lit={0} w={2.3} color="#D6E0F5" />
        </group>
        <group position={[1.4, -0.2, -2.0]}>
          <ShopFront sign="REALTY" lit={0.9} w={2.3} color="#F9E1A8" />
        </group>
        {[-4.2, -1.4, 1.4, 4.2].map((x, i) => (
          <group key={i} position={[x, -0.2, -7]} rotation={[0, (rnd(i) - 0.5) * 0.4, 0]}>
            <House color={["#F7C8C0", "#CDE7D8", "#F4D9B0", "#D6E0F5"][i]} />
            <group position={[1.3, 0, 1.2]}>
              <SaleSign text={"FOR\nSALE"} />
            </group>
          </group>
        ))}
        {!inside ? (
          <group position={buyerPos} rotation={[0, walk > 0 && walk < 1 ? Math.PI + 0.55 : Math.PI + 0.2, 0]}>
            <Person color="#9B5DE5" walk={walk > 0 && walk < 1 ? (f / fps) * 1.8 : 0} />
          </group>
        ) : null}
        <group position={bub} rotation={[0, 0.1, loopSin(phase, 3, t, 1) * 0.04]} scale={0.5}>
          <Bubble text={"STILL FOR\nSALE?"} w={2.2} />
        </group>
        {f >= startF("question") && !reset ? (
          <group position={[BUYER[0] - 0.9, 2.3, BUYER[2]]} scale={Math.max(0.001, waitK) * 0.4}>
            <Bubble text={"…"} bg="#E6E6E6" w={1.6} />
          </group>
        ) : null}
        {f >= startF("rival") && !reset ? (
          <group position={[1.3, 2.9, -0.8]} scale={Math.max(0.001, replyK) * 0.5}>
            <Bubble text={"YES! VIEW\nTOMORROW?"} bg="#BDF2D5" w={2.2} />
          </group>
        ) : null}
        {/* the study: 384 inquiries, 184 never answered by a person */}
        {inStudy &&
          Array.from({ length: 384 }).map((_, i) => {
            const red = RED(i) && f >= redAt + (i % 24);
            return (
              <mesh key={i} position={[POS.study[0] - 2.4 + (i % 16) * 0.32, 0.4 + Math.floor(i / 16) * 0.32, 0]}>
                <boxGeometry args={[0.26, 0.26, 0.06]} />
                <meshStandardMaterial color={red ? "#C8372D" : "#FFFFFF"} flatShading />
              </mesh>
            );
          })}
        {/* the sale goes elsewhere */}
        {inHouse ? (
          <group position={[20, -0.2, 0]}>
            <group scale={1.3}>
              <House color="#F9E1A8" />
            </group>
            <group position={[1.9, 0, 1.4]}>
              <SaleSign text="SOLD" />
            </group>
            <group position={[-0.5, 3.3 + (1 - keyK) * 3, 1.6]} rotation={[0.2, loopSin(phase, 2, t, 0.8) * 0.5, 0.1]} scale={0.9}>
              <Key />
            </group>
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {sc.state === "study" ? (
        <div style={{ position: "absolute", left: 80, right: 80, bottom: 560, textAlign: "center", opacity: interpolate(f - startF("study"), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "12px 26px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 40, lineHeight: 1.15 }}>384 BUYER INQUIRIES</span>
          <div style={{ marginTop: 10, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 28, color: "rgba(42,26,18,.8)" }}>US study, 2013–14 (WAV Group for Weichert)</div>
        </div>
      ) : null}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
