import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P } from "../kit/theme";
import { prog } from "../kit/devices";

export type SignedBarItem = { label: string; value: number; kind?: "ink" | "loss" | "gain" | "ghost" | "hl"; note?: string; neg?: boolean };
const fill = (k?: SignedBarItem["kind"], dark?: boolean) => (k === "loss" ? P.loss : k === "gain" ? P.gain : k === "hl" ? P.highlight : k === "ghost" ? "transparent" : dark ? P.paper : P.ink);

/** Bars that may be negative: zero axis moves right so losses draw leftwards in loss red; labels carry the sign (-$0.07, -7¢). */
export const SignedBars: React.FC<{ dark?: boolean; items: SignedBarItem[]; width: number; unit?: string; prefix?: string; decimals?: number; startFrame?: number; fontPx?: number }> = ({ dark, items, width, unit = "", prefix = "", decimals = 1, startFrame = 4, fontPx = 40 }) => {
  const fg = dark ? P.paper : P.ink;
  const f = useCurrentFrame();
  const vals = items.map((i) => (i.neg ? -Math.abs(i.value) : i.value));
  const maxPos = Math.max(0, ...vals), maxNeg = Math.max(0, ...vals.map((v) => -v));
  const span = maxPos + maxNeg || 1;
  const zero = (maxNeg / span) * 100; // % from left
  const fmt = (v: number) => `${v < 0 ? "-" : ""}${prefix}${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${unit}`;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: fontPx * 0.6 }}>
      {items.map((it, i) => {
        const v = vals[i];
        const p = prog(f, startFrame + i * 6, startFrame + i * 6 + 18);
        const w = (Math.abs(v) / span) * 100 * p;
        const left = v < 0 ? zero - w : zero;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: FONT.inter, fontWeight: 800, fontSize: fontPx * 0.85, color: fg, marginBottom: 6, gap: 20 }}>
              <span>{it.label}</span>
              <span style={{ fontFamily: MONO, fontWeight: 700, color: v < 0 ? (dark ? P.loss : P.lossText) : fg, whiteSpace: "nowrap" }}>{fmt(v * p)}</span>
            </div>
            <div style={{ position: "relative", height: fontPx * 1.3, background: dark ? "rgba(244,239,228,.12)" : "rgba(20,19,15,.07)", border: `3px solid ${fg}`, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: `${left}%`, width: `${w}%`, top: 0, bottom: 0, background: fill(it.kind, dark), backgroundImage: it.kind === "ghost" ? "repeating-linear-gradient(45deg, transparent 0 14px, rgba(20,19,15,.25) 14px 18px)" : undefined }} />
              {maxNeg > 0 ? <div style={{ position: "absolute", left: `${zero}%`, top: 0, bottom: 0, width: 4, background: fg }} /> : null}
            </div>
            {it.note ? <div style={{ fontFamily: FONT.inter, fontWeight: 600, fontSize: fontPx * 0.6, color: v < 0 ? (dark ? P.loss : P.lossText) : dark ? "rgba(244,239,228,.7)" : P.muted, marginTop: 4 }}>{it.note}</div> : null}
          </div>
        );
      })}
    </div>
  );
};
