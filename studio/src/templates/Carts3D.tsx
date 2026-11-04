import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, leakSfx, Vignette, HookBar, LowPolyWorld, NumPlate, Palette, V3, clamp, loopSin, popK, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Cart, Person, Receipt, ShopFront } from "../kit3d/Props";

// Business Leaks #1 (Store Leaks): "7 in 10 online carts never check out" (Baymard). Seamless loop: the carts roll back in.
export type CartsStation = "shop" | "studies" | "question" | "receipt" | "account" | "payoff";
/** `ticks`: a drawn checklist (BF tone test) whose items tick on their anchor words */
export type CartsScene = Timed & { state: CartsStation; num?: string; label?: string; at?: string; ticks?: { text: string; at: string }[]; /** number plate height (px from top) when the default would cover the station */ plateTop?: number };
export type CartsProps = BaseResolved<CartsScene> & { topHook?: string };

const PAL: Palette = { skyTop: "#7FC6F0", skyBot: "#FFE2B6", ground: "#F0D3A2", accent: "#2EC4B6", ink: "#2A1A12" };
const POS: Record<CartsStation, V3> = { shop: [0, 0.6, -4.6], studies: [11, 1.4, 0], question: [19, 1.0, 0], receipt: [19.2, 1.9, 0], account: [28, 1.8, 0], payoff: [0, 0.6, -4.6] };
const CAM: Record<CartsStation, V3> = { shop: [0, 7.6, 12], studies: [0, 0.8, 12.5], question: [1.6, 1.8, 6.2], receipt: [0, 0.3, 8.6], account: [0.6, 0.6, 9.5], payoff: [0, 7.6, 12] };

// 2 columns x 5 rows of shoppers; 7 of 10 leave
const SLOTS = Array.from({ length: 10 }).map((_, i) => ({ x: i % 2 ? 0.9 : -0.9, z: -Math.floor(i / 2) * 1.7 }));
const LEAVES = new Set([0, 1, 3, 4, 6, 7, 9]);
const SHIRTS = ["#4F7CAC", "#E07A5F", "#81B29A", "#F2CC8F", "#9B5DE5", "#3D405B", "#F28482", "#84A59D", "#6D597A", "#F6BD60"];

const StudyBoard: React.FC<{ pct: number }> = ({ pct }) => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[1.5, 1.1, 0.08]} />
      <meshStandardMaterial color="#FFFFFF" flatShading />
    </mesh>
    <mesh position={[-0.35, -0.42 + pct * 0.35, 0.05]}>
      <boxGeometry args={[0.38, pct * 0.7, 0.04]} />
      <meshStandardMaterial color="#C8372D" flatShading />
    </mesh>
    <mesh position={[0.25, -0.42 + 0.3 * 0.35, 0.05]}>
      <boxGeometry args={[0.38, 0.3 * 0.7, 0.04]} />
      <meshStandardMaterial color="#81B29A" flatShading />
    </mesh>
  </group>
);

export const Carts3D: React.FC<CartsProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  // a raised number plate needs the account form framed smaller and lower, so the two never overlap
  const cam = p.scenes.some((q) => q.state === "account" && q.plateTop !== undefined) ? { ...CAM, account: [0.6, 2.2, 13.5] as V3 } : CAM;
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM: cam, loopFrames: durationInFrames, punches: p.scenes.flatMap((s) => (s.num ? [Math.round(((s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200) / 1000) * fps)] : [])) });
  const { sc, t, at, phase } = S;
  const startF = (st: CartsStation) => (at(st) >= 0 ? Math.round((p.scenes[at(st)].startMs / 1000) * fps) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - Math.round((numAt / 1000) * fps), fps);
  const msF = (ms: number) => Math.round((ms / 1000) * fps);

  // the 7 leave right after the number lands, and come back over the payoff so the last frame matches the first
  const s0 = p.scenes[0];
  const leaveAt = s0 ? msF(wordMs(p.captions, /^abandon/i, s0.startMs, s0.startMs + 1400)) : 0;
  const leave = spring({ frame: f - leaveAt, fps, config: { damping: 18, stiffness: 60 } });
  const back = interpolate(f, [startF("payoff") + 4, durationInFrames - 10], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const gone = leave * (1 - back);
  const walking = gone > 0.02 && gone < 0.98;

  const boardsK = (i: number) => spring({ frame: f - startF("studies") - 4 - i * 3, fps, config: { damping: 12, stiffness: 140 } });

  // receipt lines appear on their words
  const rs = p.scenes[at("receipt")];
  const lineAt = (re: RegExp, d: number) => (rs ? msF(wordMs(p.captions, re, rs.startMs, rs.startMs + d)) : 1e9);
  const shipF = lineAt(/^shipping/i, 1800), taxF = lineAt(/^tax/i, 2300), feeF = lineAt(/^fees/i, 2800);
  const nLines = f < startF("receipt") ? 0 : 1 + (f >= shipF ? 1 : 0) + (f >= taxF ? 1 : 0) + (f >= feeF ? 1 : 0);
  const walkOff = interpolate(f, [feeF + 8, feeF + 40], [0, 1], clamp);
  const counterVisible = f >= Math.min(startF("question"), startF("receipt")) - 30 && f < startF("account") + 30;
  const formK = spring({ frame: f - startF("account") - 2, fps, config: { damping: 12, stiffness: 120 } });
  const quit = interpolate(f, [startF("account") + 30, startF("account") + 70], [0, 1], clamp);

  const sfx: SfxCue[] = [
    ...leakSfx(p.captions),
    ...p.scenes.flatMap((q) => (q.ticks ?? []).map((it, i) => ({ atMs: wordMs(p.captions, new RegExp(it.at, "i"), q.startMs, q.startMs + 1200 * (i + 1)), src: "pop-pluck", volume: 0.26 }))),
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.2 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    { atMs: (leaveAt / fps) * 1000, src: "pixabay-whoosh-cinematic", volume: 0.14 },
    ...[shipF, taxF, feeF].filter((x) => x < 1e8).map((x) => ({ atMs: (x / fps) * 1000, src: "pixabay-ping", volume: 0.22 })),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the shop and its queue of shoppers */}
        <group position={[0, -0.2, -10.4]}>
          <ShopFront sign="SHOP" lit={0.8} w={4.2} />
        </group>
        {SLOTS.map((s, i) => {
          const out = LEAVES.has(i) ? gone : 0;
          const side = s.x > 0 ? 1 : -1;
          const sway = loopSin(phase, 2 + (i % 3), t, 1.1) * 0.04;
          return (
            <group key={i} position={[s.x + side * out * 4.5, -0.2, s.z + out * 1.2]} rotation={[0, side * out * 1.4 + sway, 0]}>
              <group position={[0, 0, -0.75]}>
                <Cart full color={i % 3 ? "#E05A47" : "#2EC4B6"} />
              </group>
              <group position={[0, 0, 0.1]} rotation={[0, Math.PI, 0]}>
                <Person color={SHIRTS[i]} walk={walking && LEAVES.has(i) ? (f / fps) * 1.8 : 0} />
              </group>
            </group>
          );
        })}
        {/* nine studies, each landing on ~70% */}
        {f >= startF("studies") - 2 &&
          Array.from({ length: 9 }).map((_, i) => {
            const k = boardsK(i);
            return (
              <group key={i} position={[POS.studies[0] - 1.7 + (i % 3) * 1.7, 0.5 + Math.floor(i / 3) * 1.3 + (1 - k) * 4, 0]} scale={k}>
                <StudyBoard pct={0.66 + ((i * 37) % 9) / 100} />
              </group>
            );
          })}
        {/* the checkout: counter, one shopper, a receipt that keeps growing */}
        {counterVisible ? (
          <group position={[19, -0.2, 0]}>
            <mesh position={[1.1, 0.55, -0.4]} castShadow receiveShadow>
              <boxGeometry args={[2.4, 1.1, 1.0]} />
              <meshStandardMaterial color="#B98A5E" flatShading />
            </mesh>
            <group position={[-1.0 - walkOff * 3.5, 0, 0.4 + walkOff * 1.5]} rotation={[0, walkOff > 0 ? -2.2 : Math.PI / 2, 0]}>
              <Person color="#E07A5F" walk={walkOff > 0 && walkOff < 1 ? (f / fps) * 1.8 : 0} />
            </group>
            <group position={[-0.1, 0, 0.4]} rotation={[0, Math.PI / 2, 0]}>
              <Cart full />
            </group>
            <group position={[0.2, 3.1, 0.3]} rotation={[0, -0.06, loopSin(phase, 3, t, 0.8) * 0.03]} scale={0.9}>
              <Receipt lines={["ITEMS     $48.00", "+ SHIPPING $9.99", "+ TAX      $4.10", "+ FEES     $2.50"]} n={nLines} total="TOTAL    $64.59" />
            </group>
          </group>
        ) : null}
        {/* number two: the forced sign-up wall */}
        {f >= startF("account") - 30 && f < startF("payoff") + 30 ? (
          <group position={[28, -0.2, 0]}>
            <group position={[0, 2.2 + (1 - formK) * 5, 0]} rotation={[0, -0.08, loopSin(phase, 2, t, 0.7) * 0.02]}>
              <mesh castShadow>
                <boxGeometry args={[3.0, 3.4, 0.14]} />
                <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} flatShading />
              </mesh>
              <mesh position={[0, 0.9, 0.08]}>
                <planeGeometry args={[2.7, 1.1]} />
                <meshStandardMaterial map={textTex("CREATE AN\nACCOUNT", "#2A1A12", 110, 512, 208, undefined, "#FFFFFF")} />
              </mesh>
              {[-0.15, -0.75].map((y, i) => (
                <mesh key={i} position={[0, y, 0.08]}>
                  <planeGeometry args={[2.4, 0.42]} />
                  <meshStandardMaterial map={textTex(i ? "PASSWORD ••••" : "EMAIL", "#8A8F99", 60, 512, 90, undefined, "#EEF1F5")} />
                </mesh>
              ))}
              <mesh position={[0, -1.3, 0.08]}>
                <planeGeometry args={[2.4, 0.36]} />
                <meshStandardMaterial color="#2EC4B6" />
              </mesh>
            </group>
            <group position={[-1.6 - quit * 3, 0, 1.4 + quit * 1.2]} rotation={[0, quit > 0 ? -2.2 : 0.4, 0]}>
              <Person color="#81B29A" walk={quit > 0 && quit < 1 ? (f / fps) * 1.8 : 0} />
            </group>
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} top={sc.plateTop} /> : null}
      {sc.state === "studies" ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 520, textAlign: "center", opacity: interpolate(f - startF("studies"), [10, 18], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15 }}>AVERAGE OF 50 STUDIES{"\n"}≈ 70% OF CARTS ABANDONED</span>
          <div style={{ marginTop: 14, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 30, color: "rgba(42,26,18,.75)" }}>Source: Baymard Institute, 2025</div>
        </div>
      ) : null}
      {(() => {
        // checklist: the first scene that carries ticks keeps it on screen until the payoff ends
        const ti = p.scenes.findIndex((q) => q.ticks?.length);
        if (ti < 0 || f < msF(p.scenes[ti].startMs)) return null;
        const q = p.scenes[ti];
        const out = interpolate(f, [durationInFrames - 30, durationInFrames - 18], [1, 0], clamp);
        const inK = popK(f - msF(q.startMs), fps);
        return (
          <div style={{ position: "absolute", left: 110, right: 110, top: 960, opacity: out, transform: `scale(${0.8 + 0.2 * inK})`, background: "rgba(255,247,232,.95)", borderRadius: 28, padding: "26px 34px", boxShadow: "0 10px 0 rgba(42,26,18,.2)" }}>
            {q.ticks!.map((it, i) => {
              const tf = msF(wordMs(p.captions, new RegExp(it.at, "i"), q.startMs, q.startMs + 1200 * (i + 1)));
              const tk = interpolate(f, [tf, tf + 8], [0, 1], clamp);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, marginTop: i ? 18 : 0 }}>
                  <svg width="70" height="70" viewBox="0 0 70 70" style={{ flex: "none" }}>
                    <rect x="4" y="4" width="62" height="62" rx="14" fill="none" stroke="#2A1A12" strokeWidth="6" />
                    <path d="M16 36 L30 50 L56 20" fill="none" stroke="#1FA89C" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - tk)} />
                  </svg>
                  <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.1, color: "#2A1A12" }}>{it.text}</div>
                </div>
              );
            })}
          </div>
        );
      })()}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta captions={p.captions} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
