import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import type { Caption } from "@remotion/captions";
import { BaseResolved, SfxCue, Timed } from "../lib/types";

// Line Item "Morph" (pilot 2026-10-23, code-only). One container morphs through a state list for the whole story
// (seeconvm: state lists, closed-form springs, sound on the same clock, last frame = first frame so it loops).
// Every value is a pure function of the frame.
export type MorphState = "card" | "bars" | "question" | "miles" | "ring" | "target" | "pass" | "cardEnd";
export type MorphScene = Timed & { state: MorphState; num?: string; label?: string; numB?: string; labelB?: string; pct?: number; at?: string };
export type MorphProps = BaseResolved<MorphScene> & { topHook?: string };

const W = 1080;
const BG = "#0A0F1F";
const YELLOW = "#FFD21F";
const INK = "#0B0B0B";
const GREY = "#3A4258";
type Geo = { cx: number; cy: number; w: number; h: number; r: number; fill: string };
const UNIT = 62; // px per $1B
const BASE = 1130; // bar baseline y
const CARD_FILL = "linear-gradient(135deg, #3B4152 0%, #1A1E29 55%, #0D0F15 100%)";
const GEO: Record<MorphState, Geo> = {
  card: { cx: 540, cy: 780, w: 780, h: 492, r: 40, fill: CARD_FILL },
  bars: { cx: 370, cy: BASE - (8.2 * UNIT) / 2, w: 230, h: 8.2 * UNIT, r: 18, fill: YELLOW },
  question: { cx: 540, cy: 780, w: 440, h: 440, r: 220, fill: YELLOW },
  miles: { cx: 540, cy: 1000, w: 560, h: 354, r: 30, fill: CARD_FILL },
  ring: { cx: 540, cy: 780, w: 560, h: 560, r: 280, fill: "#141A2E" },
  target: { cx: 540, cy: BASE - (8.2 * UNIT) / 2, w: 300, h: 8.2 * UNIT, r: 18, fill: YELLOW },
  pass: { cx: 540, cy: 780, w: 800, h: 360, r: 28, fill: "#F4EFE4" },
  cardEnd: { cx: 540, cy: 780, w: 780, h: 492, r: 40, fill: CARD_FILL },
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** first caption word matching re, at or after fromMs */
const wordMs = (caps: Caption[], re: RegExp, fromMs: number, fallback: number) => caps.find((c) => c.startMs >= fromMs - 50 && re.test(c.text))?.startMs ?? fallback;

const Plane: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);

const Background: React.FC<{ f: number }> = ({ f }) => {
  const drift = (f * 0.6) % 120;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.035) 2px, transparent 2px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${40 + Math.sin(f / 60) * 3}%, rgba(255,210,31,.10), transparent 55%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Morph: React.FC<MorphProps> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const idx = Math.max(0, p.scenes.findIndex((s, i) => ms >= s.startMs && (i === p.scenes.length - 1 || ms < p.scenes[i + 1].startMs)));
  const sc = p.scenes[idx];
  const prev = p.scenes[Math.max(0, idx - 1)];
  const local = f - Math.round((sc.startMs / 1000) * fps); // frames into this state
  const k = idx === 0 ? spring({ frame: f, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } }) : spring({ frame: local, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const a = idx === 0 ? { ...GEO.card, cy: 1500, w: 300, h: 190, r: 18 } : GEO[prev.state];
  const b = GEO[sc.state];
  const g = { cx: mix(a.cx, b.cx, k), cy: mix(a.cy, b.cy, k), w: mix(a.w, b.w, k), h: mix(a.h, b.h, k), r: mix(a.r, b.r, k) };
  const contentIn = interpolate(local, [6, 14], [0, 1], clamp);
  const cam = Math.sin(f / 45) * 6;
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs) : sc.startMs;
  const numK = spring({ frame: f - Math.round((numAt / 1000) * fps), fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
  const flip = sc.state === "cardEnd" ? interpolate(local, [0, 16], [180, 360], clamp) : sc.state === "card" ? 0 : 0;
  const tilt = sc.state === "card" || sc.state === "cardEnd" ? Math.sin(f / 30) * 4 : 0;

  // second bar (bars state), ring arc, target extension, miles particles
  const barB = sc.state === "bars" ? spring({ frame: local - 8, fps, config: { damping: 15, stiffness: 120 } }) : 0;
  const arc = sc.state === "ring" ? interpolate(local, [6, 30], [0, sc.pct ?? 0.13], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }) : 0;
  const targetK = sc.state === "target" ? spring({ frame: local - 10, fps, config: { damping: 16, stiffness: 110 } }) : 0;

  const sfx: SfxCue[] = p.scenes.flatMap((s, i) =>
    s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs) : s.startMs, src: "impact-punch-heavy", volume: 0.3 }] : i > 0 ? [{ atMs: s.startMs, src: "pixabay-whoosh-short", volume: 0.22 }] : [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Background f={f} />
      <AbsoluteFill style={{ transform: `translateY(${cam}px)` }}>
        {/* the one container */}
        <div
          style={{
            position: "absolute",
            left: g.cx - g.w / 2,
            top: g.cy - g.h / 2,
            width: g.w,
            height: g.h,
            borderRadius: g.r,
            overflow: "hidden",
            transform: `perspective(1600px) rotateY(${flip + tilt}deg)`,
            boxShadow: "0 40px 90px rgba(0,0,0,.55)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: a.fill, opacity: 1 - k }} />
          <div style={{ position: "absolute", inset: 0, background: b.fill, opacity: k }} />
          {(sc.state === "card" || sc.state === "miles" || sc.state === "cardEnd") && (
            <div style={{ position: "absolute", inset: 0, opacity: idx === 0 ? 1 : contentIn }}>
              <div style={{ position: "absolute", left: "-30%", top: 0, width: "40%", height: "100%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,.18), transparent)", transform: `translateX(${((f * 9) % 2600) - 300}px) skewX(-15deg)` }} />
              <div style={{ position: "absolute", inset: 0, opacity: sc.num ? 1 - 0.92 * numK : 1 }}>
              <div style={{ position: "absolute", left: "8%", top: "26%", width: "15%", height: "22%", borderRadius: 10, background: "linear-gradient(135deg,#E8C979,#9C7A35)" }} />
              <div style={{ position: "absolute", left: "8%", bottom: "12%", fontFamily: FONT.montserrat, fontWeight: 700, fontSize: g.w * 0.042, letterSpacing: 6, color: "rgba(255,255,255,.7)" }}>•••• •••• •••• 2025</div>
              <div style={{ position: "absolute", right: "7%", top: "10%", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: g.w * 0.04, letterSpacing: 5, color: "rgba(255,255,255,.55)" }}>CO-BRAND</div>
              </div>
            </div>
          )}
          {sc.state === "pass" && (
            <div style={{ position: "absolute", inset: 0, opacity: contentIn, color: INK, fontFamily: FONT.montserrat }}>
              <div style={{ position: "absolute", left: 50, top: 40, fontWeight: 800, fontSize: 30, letterSpacing: 6 }}>BOARDING PASS</div>
              <div style={{ position: "absolute", left: 50, top: 110, fontFamily: FONT.anton, fontSize: 120 }}>SEAT 22B</div>
              <div style={{ position: "absolute", right: 60, top: 60 }}>
                <Plane size={120} color={INK} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, borderTop: "4px dashed rgba(0,0,0,.25)" }} />
            </div>
          )}
          {sc.state === "question" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT.anton, fontSize: 300, color: INK, opacity: contentIn, transform: `scale(${0.8 + 0.2 * contentIn + Math.sin(local / 6) * 0.02})` }}>?</div>
          )}
        </div>

        {/* numbers on the card / plates */}
        {sc.num && sc.state !== "bars" && sc.state !== "target" && sc.state !== "ring" && (
          <div style={{ position: "absolute", left: 0, right: 0, top: g.cy - 125, textAlign: "center", fontFamily: FONT.anton, fontSize: 230, color: YELLOW, textShadow: "0 12px 40px rgba(0,0,0,.6)", transform: `scale(${0.4 + 0.6 * numK})`, opacity: numK }}>{sc.num}</div>
        )}
        {sc.num && sc.state === "card" && sc.label && (
          <div style={{ position: "absolute", left: 0, right: 0, top: g.cy + g.h / 2 + 40, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 42, color: "#fff", opacity: numK }}>{sc.label}</div>
        )}

        {sc.state === "bars" && (
          <>
            <div style={{ position: "absolute", left: 370 - 115, width: 230, top: BASE - 8.2 * UNIT - 150, textAlign: "center", fontFamily: FONT.anton, fontSize: 110, color: YELLOW, opacity: contentIn }}>{sc.num}</div>
            <div style={{ position: "absolute", left: 370 - 160, width: 320, top: BASE + 24, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 36, color: "#fff", opacity: contentIn }}>{sc.label}</div>
            <div style={{ position: "absolute", left: 710 - 115, width: 230, top: BASE - 6.2 * UNIT * barB, height: 6.2 * UNIT * barB, borderRadius: 18, background: GREY }} />
            <div style={{ position: "absolute", left: 710 - 115, width: 230, top: BASE - 6.2 * UNIT - 150, textAlign: "center", fontFamily: FONT.anton, fontSize: 110, color: "#C9CFDD", opacity: barB }}>{sc.numB}</div>
            <div style={{ position: "absolute", left: 710 - 170, width: 340, top: BASE + 24, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 36, color: "#C9CFDD", opacity: barB }}>{sc.labelB}</div>
          </>
        )}

        {sc.state === "ring" && (
          <>
            <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              <circle cx={540} cy={780} r={250} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={44} />
              <circle cx={540} cy={780} r={250} fill="none" stroke={YELLOW} strokeWidth={44} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 250 * arc} ${2 * Math.PI * 250}`} transform="rotate(-90 540 780)" />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 780 - 105, textAlign: "center", fontFamily: FONT.anton, fontSize: 190, color: YELLOW, opacity: contentIn }}>{sc.num}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 42, color: "#fff", opacity: contentIn }}>{sc.label}</div>
          </>
        )}

        {sc.state === "target" && (
          <>
            <div style={{ position: "absolute", left: 540 - 150, width: 300, top: BASE - 10 * UNIT, height: 10 * UNIT, borderRadius: 18, border: `6px dashed ${YELLOW}`, opacity: targetK }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: BASE - 10 * UNIT - 170, textAlign: "center", fontFamily: FONT.anton, fontSize: 140, color: YELLOW, transform: `scale(${0.5 + 0.5 * numK})`, opacity: numK }}>{sc.num}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: BASE + 24, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 40, color: "#fff", opacity: contentIn }}>{sc.label}</div>
          </>
        )}

        {sc.state === "miles" && (
          <>
            <div style={{ position: "absolute", left: 540 - 90, top: 330, opacity: contentIn, transform: `translateY(${Math.sin(f / 20) * 8}px)` }}>
              <Plane size={180} color="#fff" />
            </div>
            {Array.from({ length: 34 }).map((_, i) => {
              const t = ((local - 10 - i * 3) / 26) % 1;
              if (local - 10 - i * 3 < 0) return null;
              const x = 540 + Math.sin(i * 2.3) * 160 * (1 - t);
              const y = mix(860, 470, t);
              return <div key={i} style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: 9, background: YELLOW, opacity: Math.sin(Math.PI * t), boxShadow: `0 0 18px ${YELLOW}` }} />;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, color: YELLOW, letterSpacing: 4, opacity: contentIn }}>{sc.label}</div>
          </>
        )}
      </AbsoluteFill>

      {p.topHook ? (
        <div style={{ position: "absolute", top: 120, left: 60, right: 60, padding: "16px 24px", background: "#000", borderLeft: `10px solid ${YELLOW}`, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: "#fff", textTransform: "uppercase" }}>{p.topHook}</div>
      ) : null}
      <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,.6)" }}>LINE ITEM</div>
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent={YELLOW} positionPct={73} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
