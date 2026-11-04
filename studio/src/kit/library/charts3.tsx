import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

/**
 * ProjectionChart (LF-008): line chart with ACTUAL data (solid ink line, drawn left to right) and a PROJECTION (dashed line that continues from the last
 * actual point, drawn after a beat) ending in a RANGE BAND (e.g. a 2035 low-high span) shown as a shaded paper band with ink edge lines and a bracket label.
 * The projection is visibly not data: dashed, muted, with a "PROJECTION" tag; the band's value pill carries the range text. The one yellow = the last actual
 * point's number plate (or set `keyIs="projection"` to put it on the projected end). Width <= 860 (SafeBox), labels >= 34px.
 * RANGES: when the end is a band (a range), do NOT pass an `endLabel` with a midpoint ("14" for 13-15 is a number nobody stated): pass the range text as `band.label` and omit `endLabel`. In very short plots (< ~150px) the end pill can still touch the x label: use `minPlotHeight`. TAG RULE: the "PROJECTION" tag is dropped (not overprinted) when no spot clears the line, dots, band, band label, end pill, last-actual plate and plot box; `minPlotHeight` grows the svg so the plot is never squashed (parent needs room). LANDSCAPE: for frames shorter than 600px (e.g. 1100x450 on 1920x1080) the layout turns `compact` automatically (36px text, plot >= 75% of the height, ticks >= 70px apart); the band body is hatched and at least 70px tall (its bracket edges stay at the true lo/hi). Y axis: when the axis starts at 0 the baseline itself is zero and its tick label is omitted (a stray "0%" beside a projection reads as the series ending at 0); a non-zero floor draws a zigzag AXIS BREAK at the baseline start and keeps its lowest label at the right end of the baseline (above it). Layout: plot area is ~800px of the 860 box (y labels sit inside the plot above their gridline). The lower ~35% of a 760-high chart is intentionally calm: pair it with a caption lane or a BigNumberCard/RackGlyph row below (do not stack another chart in it).
 * Props: actual [{x,y}], projection [{x,y}] (first point should equal the last actual), band {x, lo, hi} optional, xTicks [{x,label}], yPrefix/ySuffix/decimals,
 * actualLabel/endLabel (pill texts: pass sourced figures only), height. Post-build beat: the band pulses and the dashed line marches.
 */
export type XY = { x: number; y: number };
export const ProjectionChart: React.FC<{
  width: number; height: number; actual: XY[]; projection: XY[]; band?: { x: number; lo: number; hi: number; label?: string };
  xTicks?: { x: number; label: string }[]; yMin?: number; yMax?: number; yPrefix?: string; ySuffix?: string; decimals?: number;
  actualLabel?: string; endLabel?: string; keyIs?: "actual" | "projection"; startFrame?: number; title?: string; compact?: boolean; minPlotHeight?: number;
}> = ({ width: W, height: H0, actual, projection, band, xTicks = [], yMin, yMax, yPrefix = "", ySuffix = "", decimals = 0, actualLabel, endLabel, keyIs = "actual", startFrame = 0, title, compact: compactIn, minPlotHeight }) => {
  const f = useCurrentFrame() - startFrame;
  // landscape / short frames (H < 600, e.g. 1100x450 on 1920x1080): compact layout so the plot band is >= 60% of the height and ticks stay >= 70px apart; portrait layout unchanged.
  const lo0 = yMin ?? Math.min(...[...actual, ...projection].map((p) => p.y));
  const compact = compactIn ?? H0 < 600;
  const fs = compact ? 36 : 40;
  const floorBreak = lo0 !== 0;
  const padL = 24 + (floorBreak ? Math.round(fs * 0.62 * Math.max(...[yMin ?? 0, yMax ?? 0].map((v) => `${yPrefix}${v.toFixed(decimals)}${ySuffix}`.length)) + 26) : 0), padR = 40, padT = compact ? (title ? 84 : 36) : title ? 140 : 80, padB = compact ? 74 : 130;
  const H = minPlotHeight ? Math.max(H0, padT + padB + minPlotHeight) : H0; // `minPlotHeight` makes the svg grow (the parent must have room) so the plot never gets squashed
  const plotH = H - padT - padB;
  const all = [...actual, ...projection, ...(band ? [{ x: band.x, y: band.lo }, { x: band.x, y: band.hi }] : [])];
  const x0 = Math.min(...all.map((p) => p.x)), x1 = Math.max(...all.map((p) => p.x));
  const lo = yMin ?? Math.min(...all.map((p) => p.y)), hi = yMax ?? Math.max(...all.map((p) => p.y));
  const sx = (x: number) => padL + 30 + ((x - x0) / (x1 - x0 || 1)) * (W - padL - padR - 60);
  const sy = (y: number) => padT + (1 - (y - lo) / (hi - lo || 1)) * (H - padT - padB);
  const fmt = (v: number) => `${yPrefix}${v.toFixed(decimals)}${ySuffix}`;
  const line = (pts: XY[]) => pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x)} ${sy(p.y)}`).join(" ");
  const dA = pr(f, 4, 40, Easing.inOut(Easing.cubic));
  const dP = pr(f, 46, 74, Easing.inOut(Easing.cubic));
  const bandK = pr(f, 72, 90);
  const beat = f > 92 ? Math.max(0, 1 - Math.abs(f - 100) / 8) : 0;
  const march = f > 76 ? (f - 76) * 0.5 : 0;
  const la = actual[actual.length - 1], lp = projection[projection.length - 1];
  const bwO = compact ? 78 : 26;
  const bandBottom = band ? Math.max(sy(band.lo), (sy(band.hi) + sy(band.lo)) / 2 + 35) : 0;
  const nT = compact ? Math.max(2, Math.min(4, Math.floor(plotH / 70) + 1)) : 4;
  const ticks = Array.from({ length: nT }, (_, i) => lo + ((hi - lo) * i) / (nT - 1));
  const plate = (x: number, y: number, text: string, anchor: "end" | "start", k: number) => {
    const w = text.length * 22 + 34;
    const px = anchor === "end" ? Math.max(6, x - w - 18) : Math.min(W - w - 6, x + 18);
    const py = Math.max(6, y - 74);
    return (
      <g opacity={k}>
        <rect x={px} y={py} width={w} height="62" fill={P.highlight} />
        <text x={px + w / 2} y={py + 46} textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="48" fill={P.ink}>{text}</text>
      </g>
    );
  };
  const pillPlain = (x: number, y: number, text: string, k: number) => {
    const w = text.length * 22 + 30;
    const px = Math.min(W - w - 6, Math.max(6, x - w - 22));
    return (
      <g opacity={k}>
        <rect x={px} y={y} width={w} height="58" rx="10" fill={P.receipt} stroke={P.ink} strokeWidth={4} />
        <text x={px + w / 2} y={y + 42} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="38" fill={P.ink}>{text}</text>
      </g>
    );
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {title ? <text x={padL + 4} y={compact ? 44 : 60} fontFamily={`'${MONO}'`} fontWeight="700" fontSize={fs} letterSpacing="4" fill={P.muted}>{title.toUpperCase()}</text> : null}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke={P.ink} strokeWidth="2" opacity=".14" />
          {i === 0 && lo === 0 ? null : <text x={floorBreak ? padL - 14 : padL + 4} y={floorBreak ? sy(t) + fs * 0.35 : sy(t) - 10} textAnchor={floorBreak ? "end" : "start"} fontFamily={`'${MONO}'`} fontWeight="700" fontSize={fs} fill={P.muted} stroke={P.paper} strokeWidth="6" paintOrder="stroke">{fmt(t)}</text>}
        </g>
      ))}
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={P.ink} strokeWidth={STROKE.detail} />
      {lo !== 0 ? <g><line x1={padL} x2={padL} y1={padT - 6} y2={H - padB - 34} stroke={P.ink} strokeWidth="4" /><line x1={padL} x2={padL} y1={H - padB - 8} y2={H - padB} stroke={P.ink} strokeWidth="4" /><path d={`M${padL - 14} ${H - padB - 34} l28 8 l-28 10 l28 8`} fill="none" stroke={P.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></g> : null}
      {xTicks.map((t, i) => <text key={i} x={sx(t.x)} y={H - padB + (compact ? 48 : 58)} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize={fs} fill={P.ink}>{t.label}</text>)}
      {band ? (() => {
        const bw = compact ? 78 : 26; const yH = sy(band.hi), yL = sy(band.lo), trueH = Math.max(8, yL - yH), bodyH = Math.max(70, trueH), bodyY = (yH + yL) / 2 - bodyH / 2;
        return (
          <g opacity={bandK}>
            <defs><pattern id="pc-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill={P.ink} opacity={0.12 + 0.16 * beat} /><line x1="0" y1="0" x2="0" y2="14" stroke={P.ink} strokeWidth="3" opacity=".45" /></pattern></defs>
            <rect x={sx(band.x) - bw - 30 * (1 - bandK)} y={bodyY} width={bw * 2} height={bodyH} fill="url(#pc-hatch)" />
            <path d={`M${sx(band.x) - bw} ${yH} H${sx(band.x) + bw} M${sx(band.x) - bw} ${yL} H${sx(band.x) + bw}`} stroke={P.ink} strokeWidth={4 + 3 * beat} strokeLinecap="round" />
          </g>
        );
      })() : null}
      <path d={line(actual)} fill="none" stroke={P.ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${dA} 1`} />
      <clipPath id="pc-proj"><rect x={sx(la.x) - 6} y="0" width={(sx(lp.x) - sx(la.x) + 20) * dP} height={H} /></clipPath>
      <path d={line(projection)} clipPath="url(#pc-proj)" fill="none" stroke={P.muted} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 16" strokeDashoffset={-march * 0.8} />
      {dA > 0.99 ? <circle cx={sx(la.x)} cy={sy(la.y)} r="14" fill={keyIs === "actual" ? P.highlight : P.receipt} stroke={P.ink} strokeWidth="6" /> : null}
      {dP > 0.99 ? <circle cx={sx(lp.x)} cy={sy(lp.y)} r="14" fill={keyIs === "projection" ? P.highlight : P.receipt} stroke={P.ink} strokeWidth="6" strokeDasharray="6 5" /> : null}
      {projection.length ? (() => {
        // Slope-aware PROJECTION tag with a HARD collision test: candidate spots along the projection line (both sides, 4 offsets x 11 positions) must clear
        // the line samples (30px), both end dots (34px), the plot box, the band body, the band LABEL, the end pill and the last-actual plate. If nothing clears,
        // try the left end of the dashed segment; if that collides too the tag is DROPPED (a missing tag beats an overprinted one: the dashes already read as a projection).
        const tw = 10 * (fs * 0.62 + 5), th = fs + 8;
        type R = { x: number; y: number; w: number; h: number };
        const samples: [number, number][] = [];
        [actual, projection].forEach((arr) => { for (let i = 0; i < arr.length - 1; i++) for (let k = 0; k <= 12; k++) { const t = k / 12; samples.push([sx(arr[i].x + (arr[i + 1].x - arr[i].x) * t), sy(arr[i].y + (arr[i + 1].y - arr[i].y) * t)]); } });
        const dots: [number, number][] = [[sx(la.x), sy(la.y)], [sx(lp.x), sy(lp.y)]];
        const boxes: R[] = [];
        if (band) {
          const yH0 = sy(band.hi), yL0 = sy(band.lo), bh = Math.max(70, yL0 - yH0), by = (yH0 + yL0) / 2 - bh / 2;
          boxes.push({ x: sx(band.x) - bwO - 10, y: by - 10, w: bwO * 2 + 20, h: bh + 20 });
          const lt = (band.label ?? (compact ? "RANGE" : "")), lw = lt.length * (fs * 0.6) + 20;
          if (lt) boxes.push(compact ? { x: sx(band.x) - bwO - 24 - lw, y: (yH0 + yL0) / 2 - 34 - fs, w: lw, h: fs + 14 } : { x: sx(band.x) - lw / 2, y: yH0 - 20 - fs, w: lw, h: fs + 14 });
        }
        if (endLabel && keyIs !== "projection") { const w = endLabel.length * 22 + 30, px = Math.min(W - w - 6, Math.max(6, sx(lp.x) + (compact ? bwO : 0) - w - 22)); boxes.push({ x: px, y: band && compact ? bandBottom + 22 : sy(lp.y) - 80, w, h: 58 }); }
        if (actualLabel) { const w = actualLabel.length * 22 + 34; boxes.push({ x: Math.max(6, sx(la.x) - w - 18), y: Math.max(6, sy(la.y) - 74), w, h: 62 }); }
        const hit = (r: R, pts: [number, number][], m: number) => pts.some(([x, y]) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m);
        const overlap = (r: R, o: R) => r.x < o.x + o.w + 10 && r.x + r.w + 10 > o.x && r.y < o.y + o.h + 10 && r.y + r.h + 10 > o.y;
        const ok = (r: R) => r.x >= padL + 6 && r.x + r.w <= W - 6 && r.y >= padT - 6 && r.y + r.h <= H - padB - 10 && !hit(r, samples, 30) && !hit(r, dots, 34) && !boxes.some((o) => overlap(r, o));
        const cands: R[] = [];
        for (const side of [1, -1]) for (const off of [46, 70, 100, 140]) for (let t = 0.12; t <= 0.9; t += 0.065) {
          const px = sx(lp.x) * t + sx(la.x) * (1 - t), py = sy(lp.y) * t + sy(la.y) * (1 - t);
          const dx = sx(lp.x) - sx(la.x), dy = sy(lp.y) - sy(la.y), L = Math.hypot(dx, dy) || 1;
          const ny = (dx / L) * side * -1;
          const cx = px + (side === 1 ? tw * 0.35 : -tw * 0.35), cy = py + Math.abs(ny) * off * (side === 1 ? 1 : -1);
          cands.push({ x: cx - tw / 2, y: cy - th / 2, w: tw, h: th });
        }
        // left-end fallback: just right of the last actual dot, hugging the baseline side
        for (const off of [60, 90, 130]) cands.push({ x: sx(la.x) + 40, y: sy(la.y) + off - th / 2, w: tw, h: th }, { x: sx(la.x) + 40, y: sy(la.y) - off - th / 2, w: tw, h: th });
        const pick = cands.find(ok);
        if (!pick) return null;
        return <g opacity={pr(f, 52, 62)} transform={`translate(${pick.x + pick.w / 2} ${pick.y + pick.h / 2 + fs * 0.35})`}><text textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize={fs} letterSpacing="5" fill={P.muted}>PROJECTION</text></g>;
      })() : null}
      {actualLabel ? plate(sx(la.x), sy(la.y), actualLabel, "end", keyIs === "actual" ? pr(f, 40, 50) : 0) : null}
      {actualLabel && keyIs !== "actual" ? pillPlain(sx(la.x), sy(la.y) - 80, actualLabel, pr(f, 40, 50)) : null}
      {endLabel ? (keyIs === "projection" ? plate(sx(lp.x), sy(lp.y), endLabel, "end", pr(f, 74, 84)) : pillPlain(sx(lp.x) + (compact ? bwO : 0), band && compact ? bandBottom + 22 : sy(lp.y) - 80, endLabel, pr(f, 74, 84))) : null}
      {(band?.label || (band && compact)) ? (
        <g opacity={bandK}>
          <text x={compact ? sx(band.x) - bwO - 24 : sx(band.x)} y={compact ? (sy(band.hi) + sy(band.lo)) / 2 - 34 : sy(band.hi) - 20} textAnchor={compact ? "end" : "middle"} fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize={fs} fill={P.ink} stroke={P.paper} strokeWidth="7" paintOrder="stroke">{band.label ?? "RANGE"}</text>
        </g>
      ) : null}
    </svg>
  );
};
