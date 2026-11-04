import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P } from "../kit/theme";
import { prog } from "../kit/devices";

/**
 * Line chart with an actual (solid) segment and a projected (dashed) segment, plus an optional range band at the last x
 * (a range is not a point: `band: [lo, hi]` draws a hatched yellow bar from lo to hi with the range label).
 * points[0..projectedFrom] are actual; points[projectedFrom..] are projected.
 */
export const ProjLine: React.FC<{ points: number[]; projectedFrom: number; band?: [number, number]; width: number; height: number; xLabels?: string[]; ySuffix?: string; endLabel?: string; fontPx?: number }> = ({ points, projectedFrom, band, width, height, xLabels, ySuffix = "", endLabel, fontPx = 36 }) => {
  const f = useCurrentFrame();
  const padL = 14, padR = fontPx * 4.6, padT = 30, padB = xLabels ? fontPx * 2 : 20;
  const min = 0, max = Math.max(...points, band?.[1] ?? 0) * 1.05;
  const X = (i: number) => padL + (i / (points.length - 1)) * (width - padL - padR);
  const Y = (v: number) => padT + (1 - (v - min) / (max - min)) * (height - padT - padB);
  const pts = points.map((v, i) => [X(i), Y(v)] as const);
  const d = (a: number, b: number) => pts.slice(a, b + 1).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const pa = prog(f, 0, 30); // actual draws first (from frame 0)
  const pp = prog(f, 20, 20 + 24); // the dashed projection follows almost immediately
  const pb = prog(f, 40, 40 + 12);
  const pf = Math.min(projectedFrom, points.length - 1);
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((t) => <line key={t} x1={padL} x2={width - padR} y1={padT + t * (height - padT - padB)} y2={padT + t * (height - padT - padB)} stroke={P.ink} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="8 8" />)}
      <path d={d(0, pf)} fill="none" stroke={P.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pa} />
      {pf < points.length - 1 ? <path d={d(pf, points.length - 1)} fill="none" stroke={P.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="0.12 0.08" strokeDashoffset={-(1 - pp) * 0.4} opacity={pp > 0 ? 1 : 0} /> : null}
      {band ? (
        <g opacity={pb}>
          <defs><pattern id="bandhatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill={P.highlight} /><rect width="5" height="14" fill={P.ink} opacity="0.55" /></pattern></defs>
          <rect x={X(points.length - 1) - 40} y={(Y(band[0]) + Y(band[1])) / 2 - Math.max(45, (Y(band[0]) - Y(band[1])) / 2)} width={80} height={Math.max(90, Y(band[0]) - Y(band[1]))} fill="url(#bandhatch)" stroke={P.ink} strokeWidth={6} />
          <text x={X(points.length - 1) + 54} y={(Y(band[0]) + Y(band[1])) / 2 + fontPx * 0.36} fontFamily={MONO} fontWeight={700} fontSize={fontPx * 1.1} fill={P.ink}>{endLabel ?? `${band[0]}-${band[1]}${ySuffix}`}</text>
        </g>
      ) : null}
      <g opacity={pa}>
        <text x={X(0)} y={Y(points[0]) - 18} fontFamily={MONO} fontWeight={700} fontSize={fontPx} fill={P.ink}>{points[0]}{ySuffix}</text>
        <circle cx={pts[pf][0]} cy={pts[pf][1]} r={11} fill={P.receipt} stroke={P.ink} strokeWidth={4} />
        <text x={pts[pf][0] - 18} y={pts[pf][1] + fontPx * 1.5} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={fontPx} fill={P.ink}>{points[pf]}{ySuffix}</text>
      </g>
      <text x={pts[Math.ceil((pf + points.length - 1) / 2)][0] - fontPx * 2.2} y={pts[Math.ceil((pf + points.length - 1) / 2)][1] - fontPx * 1.1} textAnchor="middle" fontFamily={FONT.inter} fontWeight={800} fontSize={Math.max(34, fontPx * 0.95)} fill={P.muted} opacity={pp}>{pf < points.length - 1 ? "expected" : ""}</text>
      {xLabels ? <><text x={padL} y={height - 6} fontFamily={FONT.inter} fontWeight={700} fontSize={fontPx} fill={P.muted}>{xLabels[0]}</text><text x={width - padR} y={height - 6} textAnchor="end" fontFamily={FONT.inter} fontWeight={700} fontSize={fontPx} fill={P.muted}>{xLabels[xLabels.length - 1]}</text></> : null}
    </svg>
  );
};
