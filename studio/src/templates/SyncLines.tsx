import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P } from "../kit/theme";
import { prog } from "../kit/devices";

export type SyncSeries = { label: string; points: number[]; tone?: "ink" | "hl" | "loss" | "gain"; endLabel?: string };
const col = (t?: SyncSeries["tone"]) => (t === "loss" ? P.loss : t === "hl" ? P.highlight : t === "gain" ? P.gain : P.ink);

/**
 * Multi-line chart whose lines draw one at a time at given frames (`startFrames[k]`), so each line lands as the voice names it.
 * Zero baseline is drawn when the data crosses zero. Label sits at the end of each line, in the same colour; the legend is on-chart.
 */
export const SyncLines: React.FC<{ series: SyncSeries[]; startFrames: number[]; width: number; height: number; xLabels?: string[]; yFloor?: number; fontPx?: number; drawFrames?: number }> = ({ series, startFrames, width, height, xLabels, yFloor, fontPx = 30, drawFrames = 24 }) => {
  const f = useCurrentFrame();
  const padL = 12, padR = fontPx * (width < 900 ? 0.8 : 8), padT = (width < 900 ? 24 + fontPx * 2.4 : 24), padB = xLabels ? fontPx * 2 : 20;
  const all = series.flatMap((s) => s.points);
  const min = Math.min(yFloor ?? Infinity, ...all), max = Math.max(...all);
  const X = (i: number, n: number) => padL + (i / (n - 1)) * (width - padL - padR);
  const Y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB);
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((t) => <line key={t} x1={padL} x2={width - padR} y1={padT + t * (height - padT - padB)} y2={padT + t * (height - padT - padB)} stroke={P.ink} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="8 8" />)}
      {min < 0 && max > 0 ? <line x1={padL} x2={width - padR} y1={Y(0)} y2={Y(0)} stroke={P.ink} strokeWidth={4} /> : null}
      {series.map((s, k) => {
        const p = prog(f, startFrames[k], startFrames[k] + drawFrames);
        const d = s.points.map((v, i) => `${i ? "L" : "M"}${X(i, s.points.length).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
        const lx = X(s.points.length - 1, s.points.length), ly = Y(s.points[s.points.length - 1]);
        const lab = prog(f, startFrames[k] + drawFrames - 6, startFrames[k] + drawFrames + 4);
        return (
          <g key={k}>
            <path d={d} fill="none" stroke={P.ink} strokeWidth={s.tone === "hl" ? 18 : 15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
            <path d={d} fill="none" stroke={col(s.tone)} strokeWidth={s.tone === "hl" ? 10 : 8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
            <g opacity={lab}>
              <circle cx={lx} cy={ly} r={12} fill={col(s.tone)} stroke={P.ink} strokeWidth={3} />
              <text x={width < 900 ? lx + 8 : lx + 24} y={width < 900 ? ly - fontPx * 1.5 : ly - 4} textAnchor={width < 900 ? "end" : "start"} fontFamily={MONO} fontWeight={700} fontSize={fontPx} fill={P.ink}>{s.endLabel ?? ""}</text>
              {s.endLabel && s.label.split(/\s+/)[0] && s.endLabel.toLowerCase().startsWith(s.label.split(/\s+/)[0].toLowerCase()) ? null : <text x={width < 900 ? lx + 8 : lx + 24} y={width < 900 ? ly - fontPx * 0.5 : ly + fontPx * 0.9} textAnchor={width < 900 ? "end" : "start"} fontFamily={FONT.inter} fontWeight={800} fontSize={Math.max(30, fontPx * 0.95)} fill={s.tone === "loss" ? P.loss : P.ink}>{s.label.replace(/\s*\(.*\)/, "")}</text>}
            </g>
          </g>
        );
      })}
      {xLabels ? xLabels.map((l, i) => <text key={i} x={X(i, xLabels.length)} y={height - 6} textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"} fontFamily={FONT.inter} fontWeight={700} fontSize={fontPx} fill={P.muted}>{l}</text>) : null}
    </svg>
  );
};
