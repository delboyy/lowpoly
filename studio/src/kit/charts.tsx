import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P } from "./theme";
import { prog } from "./devices";

export type BarItem = { label: string; value: number; kind?: "ink" | "loss" | "gain" | "ghost" | "hl"; note?: string };
const fill = (k?: BarItem["kind"]) => (k === "loss" ? P.loss : k === "gain" ? P.gain : k === "hl" ? P.highlight : k === "ghost" ? "transparent" : P.ink);

/** Horizontal bars that draw on (0.6 s each, staggered). `ghost` bars are dashed outlines ("if it had kept pace"). */
export const Bars: React.FC<{ items: BarItem[]; width: number; unit?: string; prefix?: string; decimals?: number; startFrame?: number; fontPx?: number }> = ({ items, width, unit = "", prefix = "", decimals = 1, startFrame = 4, fontPx = 40 }) => {
  const f = useCurrentFrame();
  const max = Math.max(...items.map((i) => i.value));
  const barH = fontPx * 1.5;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: fontPx * 0.7 }}>
      {items.map((it, i) => {
        const p = prog(f, startFrame + i * 6, startFrame + i * 6 + 18);
        const w = (it.value / max) * p * 100;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.inter, fontWeight: 800, fontSize: fontPx * 0.85, color: P.ink, marginBottom: 6 }}>
              <span>{it.label}</span>
              <span style={{ fontFamily: MONO, fontWeight: 700 }}>
                {prefix}{(it.value * p).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{unit}
              </span>
            </div>
            <div style={{ height: barH, background: "rgba(20,19,15,.07)", borderRadius: 6, overflow: "hidden", border: `3px solid ${P.ink}` }}>
              <div style={{ width: `${w}%`, height: "100%", background: fill(it.kind), borderRight: it.kind === "ghost" ? `4px dashed ${P.ink}` : undefined, backgroundImage: it.kind === "ghost" ? `repeating-linear-gradient(45deg, transparent 0 14px, rgba(20,19,15,.25) 14px 18px)` : undefined }} />
            </div>
            {it.note ? <div style={{ fontFamily: FONT.inter, fontWeight: 600, fontSize: fontPx * 0.6, color: P.muted, marginTop: 4 }}>{it.note}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

/** Line chart: draws on, highlights a final point + optional marker at x index. `sensitivity` mode = a slider dot sliding along the line with a delta label. */
export const LineChart: React.FC<{
  points: number[]; width: number; height: number; xLabels?: [string, string]; yPrefix?: string; ySuffix?: string; startFrame?: number;
  marker?: { index: number; label: string }; color?: string;
}> = ({ points, width, height, xLabels, yPrefix = "", ySuffix = "", startFrame = 4, marker, color = P.ink }) => {
  const f = useCurrentFrame();
  const padL = 10, padR = 30, padT = 40, padB = xLabels ? 56 : 20;
  const min = Math.min(...points), max = Math.max(...points);
  const xy = points.map((v, i) => [padL + (i / (points.length - 1)) * (width - padL - padR), padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB)] as const);
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const p = prog(f, startFrame, startFrame + 36);
  const last = xy[xy.length - 1];
  const m = marker ? xy[marker.index] : null;
  return (
    <svg width={width} height={height}>
      {[0, 0.5, 1].map((t) => <line key={t} x1={padL} x2={width - padR} y1={padT + t * (height - padT - padB)} y2={padT + t * (height - padT - padB)} stroke={P.ink} strokeOpacity={0.15} strokeWidth={2} strokeDasharray="8 8" />)}
      <path d={`${d} L${last[0]},${height - padB} L${xy[0][0]},${height - padB} Z`} fill={P.highlight} opacity={0.35 * p} />
      <path d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {m ? (() => { const mp = prog(f, startFrame + 36, startFrame + 48); return (<g opacity={mp}><line x1={m[0]} x2={m[0]} y1={m[1]} y2={height - padB} stroke={P.loss} strokeWidth={4} strokeDasharray="6 6" /><circle cx={m[0]} cy={m[1]} r={16} fill={P.loss} stroke={P.ink} strokeWidth={4} /><text x={m[0]} y={m[1] - 28} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={P.loss}>{marker!.label}</text></g>); })() : (
        <circle cx={last[0]} cy={last[1]} r={16 * prog(f, startFrame + 34, startFrame + 44)} fill={P.highlight} stroke={P.ink} strokeWidth={4} />
      )}
      {xLabels ? <><text x={padL} y={height - 14} fontFamily={FONT.inter} fontWeight={700} fontSize={30} fill={P.muted}>{xLabels[0]}</text><text x={width - padR} y={height - 14} textAnchor="end" fontFamily={FONT.inter} fontWeight={700} fontSize={30} fill={P.muted}>{xLabels[1]}</text></> : null}
      <text x={width - padR} y={22} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={30} fill={P.ink} opacity={p}>{yPrefix}{max.toLocaleString("en-US")}{ySuffix}</text>
    </svg>
  );
};

export type WaterfallStep = { label: string; delta?: number; total?: number; kind?: "gain" | "loss" };
/** Waterfall: first step is a start total; deltas float; last `total` is the result. */
export const Waterfall: React.FC<{ steps: WaterfallStep[]; width: number; height: number; prefix?: string; suffix?: string; startFrame?: number }> = ({ steps, width, height, prefix = "", suffix = "", startFrame = 4 }) => {
  const f = useCurrentFrame();
  let run = 0;
  const bars = steps.map((s) => {
    if (s.total !== undefined) { run = s.total; return { ...s, from: 0, to: s.total, val: s.total }; }
    const from = run; run += s.delta ?? 0; return { ...s, from, to: run, val: s.delta ?? 0 };
  });
  const max = Math.max(...bars.map((b) => Math.max(b.from, b.to)));
  const padB = 90, padT = 50, bw = (width / bars.length) * 0.7;
  const y = (v: number) => padT + (1 - v / max) * (height - padT - padB);
  return (
    <svg width={width} height={height}>
      {bars.map((b, i) => {
        const p = prog(f, startFrame + i * 8, startFrame + i * 8 + 14);
        const x = (i + 0.15) * (width / bars.length);
        const top = y(Math.max(b.from, b.to)), bot = y(Math.min(b.from, b.to));
        const h = (bot - top) * p;
        const col = b.total !== undefined ? P.ink : b.val >= 0 ? P.gain : P.loss;
        return (
          <g key={i}>
            <rect x={x} y={bot - h} width={bw} height={Math.max(2, h)} fill={col} stroke={P.ink} strokeWidth={4} />
            <text x={x + bw / 2} y={bot - h - 12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={P.ink} opacity={p}>{b.total === undefined && b.val > 0 ? "+" : ""}{prefix}{b.val}{suffix}</text>
            <text x={x + bw / 2} y={height - 46} textAnchor="middle" fontFamily={FONT.inter} fontWeight={800} fontSize={28} fill={P.ink}>{b.label}</text>
          </g>
        );
      })}
      <line x1={0} x2={width} y1={y(0)} y2={y(0)} stroke={P.ink} strokeWidth={4} />
    </svg>
  );
};

/** Grid of dots, `share` (0..1) filled; fills in a sweep. Great for "95% of 45k restaurants". */
export const DotGrid: React.FC<{ cols: number; rows: number; share: number; width: number; height: number; fillColor?: string; restColor?: string; startFrame?: number }> = ({ cols, rows, share, width, height, fillColor = P.highlight, restColor = P.loss, startFrame = 4 }) => {
  const f = useCurrentFrame();
  const n = cols * rows, cut = Math.round(n * share);
  const cw = width / cols, ch = height / rows, r = Math.min(cw, ch) * 0.36;
  const sweep = interpolate(f, [startFrame, startFrame + 30], [0, n], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <svg width={width} height={height}>
      {Array.from({ length: n }, (_, i) => {
        const c = i % cols, rr = Math.floor(i / cols);
        const shown = i < sweep;
        const filled = i < cut;
        return <circle key={i} cx={c * cw + cw / 2} cy={rr * ch + ch / 2} r={r * (shown ? 1 : 0.2)} fill={shown ? (filled ? fillColor : restColor) : "transparent"} stroke={P.ink} strokeWidth={shown ? 2.5 : 0} />;
      })}
    </svg>
  );
};

export type Series = { label: string; points: number[]; tone?: "ink" | "hl" | "loss" | "gain"; endLabel?: string };
const toneColor = (t?: Series["tone"]) => (t === "loss" ? P.loss : t === "hl" ? P.highlight : t === "gain" ? P.gain : P.ink);
/** Several lines on one scale (sensitivity scenarios). Lines draw on staggered; right-hand labels show endLabel (or label). */
export const MultiLine: React.FC<{ series: Series[]; width: number; height: number; xLabels?: [string, string]; startFrame?: number; fontPx?: number; yFloor?: number }> = ({ series, width, height, xLabels, startFrame = 4, fontPx = 30, yFloor }) => {
  const f = useCurrentFrame();
  const padL = 10, padR = fontPx * 9.5, padT = 30, padB = xLabels ? 60 : 24;
  const all = series.flatMap((s) => s.points);
  const min = yFloor ?? Math.min(...all), max = Math.max(...all);
  const X = (i: number, n: number) => padL + (i / (n - 1)) * (width - padL - padR);
  const Y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB);
  return (
    <svg width={width} height={height}>
      {[0, 0.5, 1].map((t) => <line key={t} x1={padL} x2={width - padR} y1={padT + t * (height - padT - padB)} y2={padT + t * (height - padT - padB)} stroke={P.ink} strokeOpacity={0.15} strokeWidth={2} strokeDasharray="8 8" />)}
      {series.map((s, k) => {
        const p = prog(f, startFrame + k * 10, startFrame + k * 10 + 30);
        const d = s.points.map((v, i) => `${i ? "L" : "M"}${X(i, s.points.length).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
        const lx = X(s.points.length - 1, s.points.length), ly = Y(s.points[s.points.length - 1]);
        return (
          <g key={k}>
            <path d={d} fill="none" stroke={toneColor(s.tone)} strokeWidth={s.tone === "hl" ? 14 : 9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
            <g opacity={prog(f, startFrame + k * 10 + 26, startFrame + k * 10 + 36)}>
              <circle cx={lx} cy={ly} r={11} fill={toneColor(s.tone)} stroke={P.ink} strokeWidth={3} />
              <text x={lx + 22} y={ly + fontPx * 0.36} fontFamily={MONO} fontWeight={700} fontSize={fontPx} fill={s.tone === "hl" ? P.ink : s.tone === "loss" ? P.lossText : s.tone === "gain" ? P.gainText : toneColor(s.tone)}>{s.endLabel ?? s.label}</text>
            </g>
          </g>
        );
      })}
      {xLabels ? <><text x={padL} y={height - 16} fontFamily={FONT.inter} fontWeight={700} fontSize={fontPx} fill={P.muted}>{xLabels[0]}</text><text x={width - padR} y={height - 16} textAnchor="end" fontFamily={FONT.inter} fontWeight={700} fontSize={fontPx} fill={P.muted}>{xLabels[1]}</text></> : null}
    </svg>
  );
};
