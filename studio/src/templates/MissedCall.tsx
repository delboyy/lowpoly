import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue } from "../lib/types";
import { When, anchor, resolveTimes } from "../lib/anchors";
import { Brand, CAPTION_PCT, HookBar, LeakStamp, LowPolyWorld, NumPlate, Palette, clamp, ease, leakSfx, popK } from "../kit3d/LowPoly";

// Missed-call roleplay format (pilot A2, 2026-10-31). Two voices (narrator + caller, plus a phone-filtered voicemail
// greeting). The caller's phone is a generic call card over a low-poly kitchen where a water heater leaks. Scene
// `state` picks the card mode; every time in `x` is an anchor on the voice (lib/anchors.ts). An "Illustrative call"
// label is on screen from frame 1. The 27% plate shows over the kitchen, the card pops on "Here's one" and leaves
// again in the last 0.5 s, so the loop point is the bare kitchen.

/** `chip`: a small source/context line shown for the scene (e.g. "Vendor case study (Peerlogic)") */
type McScene = { state: string; num?: string; label?: string; at?: string; chip?: string; startMs: number; durationMs: number };
export type McX = {
  contact: { name: string; initials: string };
  /** "leak": the caller's kitchen with a dripping water heater (A2); "home": a plain room with a window and a plant */
  backdrop?: "leak" | "home";
  rewindText?: string;
  clock: string; // status-bar time on the call card
  ended: string; // "Call ended · 0:21"
  missed: { at: When; title: string; body: string; time: string }[];
  counts: { at: When; n: number }[];
  after: { at: When; lines: [string, string] };
  sms: { at: When; text: string; time: string; missed: string };
  reply: { at: When; text: string; time: string };
};
type McR = Omit<McX, "missed" | "counts" | "after" | "sms" | "reply"> & {
  missed: { at: number; title: string; body: string; time: string }[];
  counts: { at: number; n: number }[];
  after: { at: number; lines: [string, string] };
  sms: { at: number; text: string; time: string; missed: string };
  reply: { at: number; text: string; time: string };
};
export type MissedCallProps = BaseResolved<McScene> & { topHook?: string; label?: string; x: McX };

const INK = "#2A1A12";
const RED = "#E5484D";
const HOME: Palette = { skyTop: "#6E7FB8", skyBot: "#E9C9A8", ground: "#C9A27E", accent: "#FFD21F", ink: INK };
const PHONE_PATH = "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z";

/** the caller's kitchen: a water heater drips into a growing puddle */
const Kitchen: React.FC<{ t: number; leak: number; push: number; home?: boolean }> = ({ t, leak, push, home }) => {
  const { width, height } = useVideoConfig();
  const drops = [0, 1, 2].map((i) => (t * 1.3 + i / 3) % 1);
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 3, 7] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
      <LowPolyWorld pal={HOME} cam={new THREE.Vector3(1.2 - push * 0.6, 2.6 - push * 0.4, 6.6 - push * 1.6)} look={new THREE.Vector3(0, 1.3, 0)} scenery={false} />
      <mesh position={[0, 2.4, -1.6]} receiveShadow>
        <boxGeometry args={[14, 6, 0.2]} />
        <meshStandardMaterial color="#E8D9C0" flatShading />
      </mesh>
      {home ? (
        <group position={[-0.8, 0, -1.45]}>
          <mesh position={[0, 2.2, 0]}><boxGeometry args={[1.8, 1.5, 0.08]} /><meshStandardMaterial color="#9FC9E8" emissive="#CFE6F5" emissiveIntensity={0.35} flatShading /></mesh>
          <mesh position={[0, 2.2, 0.05]}><boxGeometry args={[0.08, 1.5, 0.06]} /><meshStandardMaterial color="#F4F1EA" flatShading /></mesh>
          <mesh position={[0, 1.42, 0.12]}><boxGeometry args={[2.0, 0.08, 0.3]} /><meshStandardMaterial color="#F4F1EA" flatShading /></mesh>
          <group position={[1.6, 0, 0.6]}>
            <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.28, 0.22, 0.6, 7]} /><meshStandardMaterial color="#C0623B" flatShading /></mesh>
            <mesh position={[0, 0.95, 0]}><icosahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color="#5E9E5A" flatShading /></mesh>
          </group>
        </group>
      ) : null}
      {/* water heater */}
      {home ? null : <group position={[-0.6, 0, -0.6]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.62, 2.3, 10]} />
          <meshStandardMaterial color="#F4F1EA" flatShading roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.62, 0.18, 10]} />
          <meshStandardMaterial color="#D9D4CA" flatShading />
        </mesh>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 3.4, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 1.8, 6]} />
            <meshStandardMaterial color="#B87333" flatShading metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[0.45, 0.35, 0.42]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 6]} />
          <meshStandardMaterial color="#B87333" flatShading />
        </mesh>
        {leak > 0
          ? drops.map((q, i) => (
              <mesh key={i} position={[0.62, 0.3 - q * 0.45, 0.42]} scale={[1, 1.4, 1]}>
                <icosahedronGeometry args={[0.05, 0]} />
                <meshStandardMaterial color="#4FB3F0" emissive="#4FB3F0" emissiveIntensity={0.3} flatShading />
              </mesh>
            ))
          : null}
        <mesh position={[0.7, -0.17, 0.6]} rotation={[-Math.PI / 2, 0, 0]} scale={0.2 + leak * 1.4}>
          <circleGeometry args={[0.6, 9]} />
          <meshStandardMaterial color="#6CC4F5" roughness={0.15} flatShading transparent opacity={0.85} />
        </mesh>
      </group>}
      {/* counter + cupboards for scale */}
      <mesh position={[2.0, 0.55, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.3, 1.2]} />
        <meshStandardMaterial color="#7FA7A1" flatShading />
      </mesh>
      <mesh position={[2.0, 1.24, -0.9]} castShadow>
        <boxGeometry args={[2.5, 0.1, 1.3]} />
        <meshStandardMaterial color="#EFE6D6" flatShading />
      </mesh>
    </ThreeCanvas>
  );
};

type Mode = "calling" | "ringing" | "voicemail" | "ended" | "sms";

const Bars: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", height: 120 }}>
    {Array.from({ length: 15 }, (_, i) => (
      <div key={i} style={{ width: 14, borderRadius: 7, background: "#FFD21F", height: 20 + 90 * Math.abs(Math.sin(t * 7 + i * 0.8)) * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.7))) }} />
    ))}
  </div>
);

const Card: React.FC<{ x: McR; mode: Mode; t: number; k: number; fps: number }> = ({ x, mode, t, k, fps }) => {
  const pulse = (t * 1.1) % 1;
  const sk = (at: number) => spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 14, stiffness: 170 } });
  const status = { calling: "Calling…", ringing: "Ringing…", voicemail: "Voicemail", ended: x.ended, sms: "" }[mode];
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 490, height: 760, borderRadius: 60, background: mode === "sms" ? "#F2E7D5" : "linear-gradient(180deg, rgba(28,35,71,.95), rgba(42,26,18,.95))", transform: `scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 2), overflow: "hidden", boxShadow: "0 20px 0 rgba(0,0,0,.22)" }}>
      {mode === "sms" ? (
        <>
          <div style={{ height: 130, background: INK, display: "flex", alignItems: "center", gap: 22, padding: "0 36px" }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: "#9C9790", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 34, color: "#FFF7E8" }}>{x.contact.initials}</div>
            <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 40, color: "#FFF7E8" }}>{x.contact.name}</div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ alignSelf: "center", background: "rgba(229,72,77,.14)", color: RED, borderRadius: 14, padding: "8px 20px", fontFamily: FONT.inter, fontWeight: 700, fontSize: 28 }}>{x.sms.missed}</div>
            {t >= x.sms.at ? (
              <div style={{ alignSelf: "flex-start", maxWidth: 640, background: "#FFFFFF", borderRadius: 28, borderBottomLeftRadius: 8, padding: "16px 24px 10px", transform: `scale(${0.6 + 0.4 * sk(x.sms.at)})`, transformOrigin: "0% 100%", boxShadow: "0 3px 0 rgba(42,26,18,.12)" }}>
                <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 36, lineHeight: 1.28, color: INK }}>{x.sms.text}</div>
                <div style={{ textAlign: "right", fontFamily: FONT.inter, fontSize: 24, color: "#8F8474" }}>{x.sms.time}</div>
              </div>
            ) : null}
            {t >= x.reply.at ? (
              <div style={{ alignSelf: "flex-end", maxWidth: 600, background: "#FFE6A6", borderRadius: 28, borderBottomRightRadius: 8, padding: "16px 24px 10px", transform: `scale(${0.6 + 0.4 * sk(x.reply.at)})`, transformOrigin: "100% 100%", boxShadow: "0 3px 0 rgba(42,26,18,.12)" }}>
                <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 36, lineHeight: 1.28, color: INK }}>{x.reply.text}</div>
                <div style={{ textAlign: "right", fontFamily: FONT.inter, fontSize: 24, color: "#8F8474" }}>{x.reply.time}</div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 44 }}>
          <div style={{ fontFamily: FONT.inter, fontWeight: 600, fontSize: 30, color: "rgba(255,247,232,.6)" }}>{x.clock}</div>
          <div style={{ position: "relative", width: 210, height: 210, marginTop: 34 }}>
            {mode === "calling" || mode === "ringing"
              ? [0, 0.5].map((o) => {
                  const q = (pulse + o) % 1;
                  return <div key={o} style={{ position: "absolute", inset: -q * 80, borderRadius: "50%", border: `6px solid rgba(255,210,31,${0.7 * (1 - q)})` }} />;
                })
              : null}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#9C9790", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 84, color: "#FFF7E8" }}>{x.contact.initials}</div>
          </div>
          <div style={{ marginTop: 36, fontFamily: FONT.inter, fontWeight: 700, fontSize: 60, color: "#FFF7E8" }}>{x.contact.name}</div>
          <div style={{ marginTop: 6, fontFamily: FONT.inter, fontWeight: 600, fontSize: 36, color: mode === "ended" ? RED : "rgba(255,247,232,.75)" }}>{status}</div>
          <div style={{ marginTop: 24, height: 120 }}>{mode === "voicemail" ? <Bars t={t} /> : null}</div>
          {mode !== "ended" ? (
            <div style={{ marginTop: 20, width: 130, height: 130, borderRadius: 65, background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="62" height="62" viewBox="0 0 24 24" style={{ transform: "rotate(135deg)" }}><path d={PHONE_PATH} fill="#fff" /></svg>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const MissedCall: React.FC<MissedCallProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;
  const x = useMemo(() => resolveTimes(p.x, p.scenes, p.captions) as unknown as McR, [p.x, p.scenes, p.captions]);
  const S = (state: string) => p.scenes.findIndex((s) => s.state === state);
  const st = (state: string) => { const i = S(state); return i < 0 ? 1e9 : p.scenes[i].startMs / 1000; };
  const en = (state: string) => { const i = S(state); return i < 0 ? 1e9 : (p.scenes[i].startMs + p.scenes[i].durationMs) / 1000; };
  const si = p.scenes.reduce((acc, q, i) => (q.startMs / 1000 <= t ? i : acc), 0);
  const sc = p.scenes[si];
  const loopAt = end - 0.5;
  const rewindAt = st("rewind");
  const takeTwoRing = rewindAt + 0.75;
  // card mode on the timeline
  // the call card pops in on "Here's one" (after the 27% plate) and leaves at the loop point, so frame 0 = last frame
  const callAt = anchor("W1:here", p.scenes, p.captions);
  let mode: Mode | null = t < callAt ? null : "calling";
  if (t >= loopAt) mode = "sms";
  else if (t >= x.sms.at - 0.35) mode = "sms";
  else if (t >= takeTwoRing) mode = "ringing";
  else if (t >= st("missed")) mode = null;
  else if (t >= en("hangup") - 0.45) mode = "ended";
  else if (t >= st("voicemail")) mode = "voicemail";
  else if (t >= st("ringing")) mode = "ringing";
  const counterOn = t >= st("missed") && t < rewindAt;
  const afterOn = t >= x.after.at && t < st("payoff");
  const cardK = mode === null ? 0 : t >= loopAt ? 1 - ease(interpolate(t, [loopAt, loopAt + 0.35], [0, 1], clamp)) : t < callAt + 0.4 ? ease(interpolate(t, [callAt, callAt + 0.35], [0, 1], clamp)) : mode === "ringing" && t >= rewindAt ? ease(interpolate(t, [takeTwoRing, takeTwoRing + 0.35], [0, 1], clamp)) : 1;
  const leak = interpolate(t, [0, st("missed") + 2], [0.15, 1], clamp) * (t >= rewindAt && t < loopAt ? 0.35 : 1);
  const numAt = sc?.num ? anchor(sc.at ? `W${si + 1}:${sc.at.replace(/^\^/, "")}` : `S${si + 1}+0.2`, p.scenes, p.captions) : 0;
  const numK = sc?.num ? popK(f - Math.round(numAt * fps), fps) * interpolate(t, [(sc.startMs + sc.durationMs) / 1000 - 0.25, (sc.startMs + sc.durationMs) / 1000], [1, 0], clamp) : 0;
  const n = x.counts.reduce((acc, c) => (t >= c.at ? c.n : acc), 0);
  const lastCount = [...x.counts].reverse().find((c) => t >= c.at);
  const nK = lastCount ? popK(f - Math.round(lastCount.at * fps), fps) : 0;
  const rw = t >= rewindAt && t < takeTwoRing ? (t - rewindAt) / (takeTwoRing - rewindAt) : -1;
  const ms = (s: number) => s * 1000;
  const sfx: SfxCue[] = [
    ...x.missed.map((m) => ({ atMs: ms(m.at), src: "pixabay-ping", volume: 0.2 })),
    ...x.counts.map((c) => ({ atMs: ms(c.at), src: "impact-light", volume: 0.24 })),
    { atMs: ms(en("hangup") - 0.45), src: "pop-drop", volume: 0.3 },
    { atMs: ms(rewindAt), src: "pixabay-glitch-2", volume: 0.26 },
    { atMs: ms(rewindAt + 0.1), src: "pixabay-whoosh-short", volume: 0.24 },
    { atMs: ms(x.sms.at), src: "ding-synth", volume: 0.3 },
    { atMs: ms(x.reply.at), src: "pop-pluck", volume: 0.26 },
    { atMs: ms(x.after.at), src: "impact-light", volume: 0.24 },
    ...leakSfx(p.captions),
  ];
  // ring tone: under lines 1-2, the take-two ring, short bursts behind each extra missed call, and the loop tail
  const rings: [number, number, number][] = [
    [callAt, st("voicemail"), 0.18],
    [takeTwoRing, x.sms.at - 0.35, 0.22],
    ...x.counts.slice(1).map((c) => [c.at - 0.2, c.at + 0.9, 0.12] as [number, number, number]),
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ filter: cardK > 0.5 ? "blur(5px) brightness(.85)" : undefined }}>
        <Kitchen t={t} leak={leak} push={counterOn ? 1 : 0} home={x.backdrop === "home"} />
      </AbsoluteFill>
      {mode && cardK > 0.01 ? <Card x={x} mode={mode} t={t} k={cardK} fps={fps} /> : null}
      {counterOn ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 500 }}>
          {x.missed.filter((m) => t >= m.at).reverse().map((m, i) => {
            const k = popK(f - Math.round(m.at * fps), fps);
            return (
              <div key={m.time} style={{ transform: `translateY(${(1 - k) * -50}px)`, opacity: Math.min(1, k * 2) * (i ? 0.8 : 1), background: "rgba(255,247,232,.96)", borderRadius: 30, padding: "16px 24px", marginBottom: 12, display: "flex", gap: 20, alignItems: "center", boxShadow: "0 6px 0 rgba(0,0,0,.16)" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: RED, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg width="38" height="38" viewBox="0 0 24 24"><path d={PHONE_PATH} fill="#fff" /></svg></div>
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between", fontFamily: FONT.inter, fontSize: 32, color: INK }}>
                  <span><b>{m.title}</b> · {m.body}</span>
                  <span style={{ color: "#7A6F62" }}>{m.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {counterOn && n > 0 ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 950, textAlign: "center", transform: `scale(${0.85 + 0.15 * nK})` }}>
          <span style={{ display: "inline-block", background: INK, color: "#FFF7E8", borderRadius: 24, padding: "14px 36px", fontFamily: FONT.anton, fontSize: 104, letterSpacing: 2 }}>
            MISSED CALLS: <span style={{ color: "#FFD21F" }}>{n}</span>
          </span>
        </div>
      ) : null}
      {afterOn ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1050, textAlign: "center", transform: `scale(${0.85 + 0.15 * popK(f - Math.round(x.after.at * fps), fps)})` }}>
          <div style={{ display: "inline-block", background: INK, borderRadius: 24, padding: "14px 34px", fontFamily: FONT.anton, fontSize: 70, lineHeight: 1.15, color: "#FFF7E8", boxShadow: "0 10px 0 rgba(0,0,0,.25)" }}>
            {x.after.lines[0]}
            <br />
            <span style={{ color: "#7EE0D4" }}>{x.after.lines[1]}</span>
          </div>
        </div>
      ) : null}
      {rw >= 0 ? <Rewind k={rw} text={x.rewindText ?? "TAKE TWO"} /> : null}
      {sc?.num && numK > 0.01 ? <NumPlate k={numK * (mode === null ? 1 : 1 - (cardK > 0.5 ? 1 : cardK * 2))} num={sc.num} label={sc.label} top={640} /> : null}
      {sc?.chip ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center", opacity: interpolate(t, [sc.startMs / 1000 + 0.2, sc.startMs / 1000 + 0.4], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: INK, color: "#FFD21F", borderRadius: 14, padding: "8px 24px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 36 }}>{sc.chip}</span>
        </div>
      ) : null}
      {p.label ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}>
          <span style={{ background: "rgba(42,26,18,.78)", color: "#FFF7E8", borderRadius: 12, padding: "6px 18px", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 1.5 }}>{p.label}</span>
        </div>
      ) : null}
      <HookBar text={p.topHook} accent="#FFD21F" />
      <LeakStamp captions={p.captions} top={520} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <Brand color="rgba(255,247,232,.6)" />
      {rings.filter(([a, b]) => b > a && a < 1e8).map(([a, b, v], i) => (
        <Sequence key={`r${i}`} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((b - a) * fps))} layout="none">
          <Audio src={staticFile("assets/sfx/ring-synth.mp3")} volume={v} loop />
        </Sequence>
      ))}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};

/** "take two": a tape-rewind wipe (tracking bars race upward, TAKE TWO stamp) */
const Rewind: React.FC<{ k: number; text: string }> = ({ k, text }) => (
  <AbsoluteFill style={{ background: `rgba(20,16,30,${0.85 * Math.sin(Math.PI * k)})` }}>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, height: 26, top: `${(((1 - k) * 3 + i / 7) % 1) * 100}%`, background: "rgba(255,247,232,.18)" }} />
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", opacity: Math.sin(Math.PI * k) }}>
      <span style={{ fontFamily: FONT.anton, fontSize: 170, color: "#FFD21F", letterSpacing: 6 }}>{text}</span>
    </div>
  </AbsoluteFill>
);
