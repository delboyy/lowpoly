import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MONO } from "../../lib/fonts";
import { PaperBg } from "../devices";
import { P, useLayout } from "../theme";

/** Deterministic pseudo-random (never Math.random in a render: frames must be repeatable). */
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const fig = (r: () => number, bare = true) => {
  const k = r();
  if (bare) return String(Math.floor(r() * (k < 0.5 ? 9000 : 900000) + (k < 0.5 ? 1000 : 10000))); // bare digits only: nothing can read as a claim in a freeze-frame
  return k < 0.4 ? (r() * 9900).toFixed(2) : k < 0.75 ? `$${Math.floor(r() * 90000 + 100).toLocaleString("en-US")}` : `${(r() * 40).toFixed(1)}%`;
};

/**
 * LedgerBg: accounting-ledger paper. Green row lines, red margin rule, figure columns at ~20% ink that scroll in opposite
 * directions (~50 px/s), plus a yellow marker over one row and a red circle on a 2.5s cycle (bare digits by default: `bare={false}` brings back $/% figures; `calmPad` (default 60px) widens the calm band on both sides so the figures never sit beside a key-number plate; ink tint + red underline; yellow stays reserved for the foreground number). The mid band (`calm`, default 40-76% of height) drops figures to ~6% so captions and the key number sit on calm paper.
 * Props: dark (night variant), speed (px per frame, default 1.7 = 50px/s), seed (varies the figures per scene).
 * Keep key text out of nothing: figures are light enough that a 7:1 foreground still wins.
 */
export const LedgerBg: React.FC<{ dark?: boolean; speed?: number; seed?: number; calm?: [number, number]; bare?: boolean; calmPad?: number }> = ({ dark, speed = 1.7, seed = 7, calm: calmIn = [0.4, 0.76], bare = true, calmPad = 60 }) => {
  const f = useCurrentFrame();
  const { u, width, height } = useLayout();
  const calm: [number, number] = [Math.max(0, calmIn[0] - (calmPad * u) / height), Math.min(1, calmIn[1] + (calmPad * u) / height)];
  const row = 64 * u;
  const cols = Math.max(2, Math.floor((width - 190 * u) / (330 * u)));
  const rows = Math.ceil(height / row) + 4;
  const ink = dark ? "rgba(244,239,228," : "rgba(20,19,15,";
  const cycle = 75;
  const ph = (f % cycle) / cycle;
  const rowIdx = (Math.floor(f / cycle) * 5 + 3) % (rows - 6);
  const markA = interpolate(ph, [0, 0.12, 0.8, 1], [0, 1, 1, 0]);
  const markW = interpolate(ph, [0.05, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <PaperBg dark={dark} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, ${dark ? "rgba(244,239,228,.14)" : "rgba(107,102,90,.14)"} 0 2px, transparent 2px ${row}px)`, backgroundPosition: `0 ${-((f * speed * u) % row)}px` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 120 * u, width: 3 * u, background: P.loss, opacity: 0.4 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 130 * u, width: 2 * u, background: P.loss, opacity: 0.28 }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `linear-gradient(to bottom, #000 ${calm[0] * 100 - 4}%, rgba(0,0,0,.15) ${calm[0] * 100}%, rgba(0,0,0,.15) ${calm[1] * 100}%, #000 ${calm[1] * 100 + 4}%)` }}>
      {Array.from({ length: cols }, (_, c) => {
        const r = rng(seed * 31 + c);
        const dir = c % 2 ? -1 : 1;
        const off = (f * speed * u) % row;
        return (
          <div key={c} style={{ position: "absolute", top: dir > 0 ? -row * 2 - off : -row * 3 + off, left: (190 + c * 330) * u, width: 280 * u }}>
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} style={{ height: row, lineHeight: `${row}px`, textAlign: "right", fontFamily: MONO, fontWeight: 500, fontSize: 32 * u, color: `${ink}.20)` }}>{fig(r, bare)}</div>
            ))}
          </div>
        );
      })}
      </div>
      <div style={{ position: "absolute", left: 150 * u, top: (rowIdx + 2) * row + 8 * u, width: (width - 190 * u) * markW, height: row - 16 * u, background: P.ink, opacity: 0.1 * markA }} />
      <div style={{ position: "absolute", left: (190 + 330) * u + 20 * u, top: (rowIdx + 3) * row - 10 * u, width: 250 * u * markW, height: 4 * u, background: P.loss, opacity: 0.8 * markA }} />
    </div>
  );
};

const SEG_LINES = 14;
const RollSegment: React.FC<{ w: number; lineH: number; u: number; seed: number; dark?: boolean; words: string[]; pulse: number; quiet?: boolean }> = ({ w, lineH, u, seed, dark, words, pulse, quiet }) => {
  const r = rng(seed);
  const txt = dark ? "rgba(244,239,228,.42)" : "rgba(20,19,15,.35)";
  const hlRow = 5;
  const rows = Array.from({ length: SEG_LINES }, (_, i) => {
    const gap = i === 3 || i === 9;
    return { gap, word: words[Math.floor(r() * words.length)], val: (r() * 90 + 10).toFixed(2), i };
  });
  const zig = 18 * u;
  const n = Math.round(w / (26 * u));
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * w) / (n * 2)},${i % 2 ? 0 : zig}`).join(" ");
  return (
    <div style={{ width: w, background: dark ? "#2A2740" : P.receipt }}>
      {rows.map((l) => (
        <div key={l.i} style={{ height: lineH, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${20 * u}px`, fontFamily: MONO, fontWeight: 700, fontSize: 28 * u, color: txt, background: l.i === hlRow && pulse > 0 ? `rgba(20,19,15,${0.04 + 0.08 * pulse})` : undefined }}>
          {l.gap ? <div style={{ width: "100%", borderTop: `${3 * u}px dashed ${txt}` }} /> : quiet ? <div style={{ height: 8 * u, width: `${40 + (l.i * 37) % 50}%`, borderRadius: 4, background: txt }} /> : <><span>{l.word}</span><span>{l.val}</span></>}
        </div>
      ))}
      <svg width={w} height={zig} style={{ display: "block", marginBottom: 10 * u }}><polygon points={`0,0 ${pts} ${w},0`} fill={dark ? "#2A2740" : P.receipt} /></svg>
    </div>
  );
};

/**
 * ReceiptRollBg: the hero environment. Two ~240px thermal-paper strips frame the edges and scroll at different speeds
 * (100 and 50 px/s, parallax); each is a stack of torn-edge receipts with real lines (28px mono at 35% ink) and one
 * pulsing ink-tint row (left strip only, never yellow). A third wide strip runs diagonally behind everything at ~12% so the centre isn't flat paper.
 * Props: dark, speed (px/frame, default 3.3), seed, words (line labels, our mono type). Keep key content inside x 260..820 (portrait).
 */
export const ReceiptRollBg: React.FC<{ dark?: boolean; speed?: number; seed?: number; words?: string[] }> = ({ dark, speed = 3.3, seed = 3, words = ["FEES", "TAX", "TOTAL", "QTY", "RENT", "CARD", "ITEM", "FEE"] }) => {
  const f = useCurrentFrame();
  const { u, height, portrait } = useLayout();
  const stripW = (portrait ? 240 : 320) * u;
  const lineH = 44 * u;
  const segH = SEG_LINES * lineH + 28 * u;
  const pulse = 0.5 + 0.5 * Math.sin(f / 6);
  const strip = (side: "l" | "r", s: number, sp: number, rot: number, extra?: React.CSSProperties) => {
    const off = (f * sp * u) % segH;
    return (
      <div key={side + s} style={{ position: "absolute", top: -segH, [side === "l" ? "left" : "right"]: -stripW * 0.08, width: stripW, height: height + segH * 2, transform: `translateY(${off}px) rotate(${rot}deg)`, borderLeft: `3px solid rgba(20,19,15,.18)`, borderRight: `3px solid rgba(20,19,15,.18)`, filter: "drop-shadow(0 0 0 transparent)", ...extra }}>
        {Array.from({ length: Math.ceil((height + segH * 2) / segH) }, (_, i) => <RollSegment key={i} w={stripW} lineH={lineH} u={u} seed={s} dark={dark} words={words} pulse={side === "l" ? pulse : 0} />)}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <PaperBg dark={dark} />
      <div style={{ position: "absolute", left: "50%", top: 0, width: 0, height: 0 }}>
        <div style={{ position: "absolute", left: -stripW * 0.7, top: -height, opacity: 0.12, border: "3px solid rgba(20,19,15,.5)", transform: "rotate(20deg)", transformOrigin: "50% 50%", width: stripW * 1.4, height: height * 2, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${((f * speed * 0.3 * u) % segH) - segH}px)` }}>
            {Array.from({ length: Math.ceil((height * 2) / segH) + 2 }, (_, i) => <RollSegment key={i} w={stripW * 1.4} lineH={lineH} u={u} seed={seed + 5} dark={dark} words={words} pulse={0} quiet />)}
          </div>
        </div>
      </div>
      {strip("l", seed, speed, -1.5)}
      {strip("r", seed + 11, speed * 0.5, 1.8)}
    </div>
  );
};
