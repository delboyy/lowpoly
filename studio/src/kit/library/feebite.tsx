import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.out(Easing.cubic);
const pr = (f: number, a: number, b: number, e = eo) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const D = { stroke: P.ink, strokeWidth: STROKE.detail, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/**
 * CardReaderFeeBite (LF-003): a generic card taps a terminal, a receipt prints with the total on the one yellow plate, a coin-shaped
 * BITE is taken out of the receipt corner and slides into a purse labelled FEES (our type; no network logos, no brand marks).
 * Loop-free, ~8s at 30fps (`durationFrames` default 240). Drive it with the current frame (+ `startFrame`) or an explicit
 * `progress` 0..1. Props: `total` ("$31.00" by default; pass the sourced figure), `fee` (text on the bite, default "FEE"), `label` (purse, "FEES").
 * Beats: 0-24 card taps (contactless waves), 28-52 receipt prints, 70-100 bite grows, 100-150 bite slides into the purse, 150-170 purse
 * bounce, then the receipt's remaining total pulses and the purse swings (idle) until the end. Width in px; height is width*0.675. Layout: the artwork occupies the left ~85% of its own 400x270 box (card+reader left, receipt centre-right, purse bottom-right); centre it in the scene yourself, and keep the bite clear of the total plate when it holds a real number (it bites the receipt's bottom-right corner, below the plate).
 */
export const CardReaderFeeBite: React.FC<{ width?: number; total?: string; fee?: string; label?: string; startFrame?: number; progress?: number; durationFrames?: number }> = ({ width = 1500, total = "$31.00", fee = "FEE", label = "FEES", startFrame = 0, progress, durationFrames = 240 }) => {
  const cf = useCurrentFrame() - startFrame;
  const f = progress !== undefined ? progress * durationFrames : cf;
  const W = 400, H = 270;
  const tap = pr(f, 0, 14, Easing.out(Easing.back(1.6)));
  const wave = f > 12 && f < 40 ? (f - 12) / 28 : 0;
  const print = pr(f, 28, 54);
  const biteR = 46 * pr(f, 70, 100, Easing.inOut(Easing.cubic));
  const slide = pr(f, 100, 150, Easing.inOut(Easing.cubic));
  const bounce = f > 150 ? Math.exp(-(f - 150) / 7) * Math.sin((f - 150) / 2.2) * 5 : 0;
  const pulse = f > 160 ? Math.max(0, 1 - Math.abs(f - 172) / 8) : 0;
  const idle = f > 175 ? Math.sin((f - 175) / 10) * 2 : 0;
  // receipt geometry
  const rx = 245, ry = 30, rw = 120, rh = 150;
  const cx = rx + rw - 6, cy = ry + rh - 8; // bite centre near the bottom-right corner
  // purse position
  const px = 296, py = 196;
  const bx = cx + (px + 24 - cx) * slide, by = cy + (py + 12 - cy) * slide - Math.sin(slide * Math.PI) * 30;
  const bs = 1 - 0.55 * slide;
  return (
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <mask id="fb-bite"><rect x="0" y="0" width={W} height={H} fill="#fff" /><circle cx={cx} cy={cy} r={biteR} fill="#000" /></mask>
        <clipPath id="fb-print"><rect x={rx - 4} y={ry + rh * (1 - print)} width={rw + 8} height={rh * print + 2} /></clipPath>
      </defs>
      {/* receipt (prints upward out of the terminal top-right) */}
      <g clipPath="url(#fb-print)">
        <g mask="url(#fb-bite)">
          <rect x={rx + 5} y={ry + 7} width={rw} height={rh} fill={P.ink} opacity=".22" />
          <rect x={rx} y={ry} width={rw} height={rh} fill={P.receipt} {...D} />
          <path d={`M${rx} ${ry + rh} l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6`} fill={P.receipt} {...D} />
          <text x={rx + 12} y={ry + 22} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="10" letterSpacing="2" fill={P.muted}>RECEIPT</text>
          {[0, 1, 2].map((i) => <rect key={i} x={rx + 12} y={ry + 34 + i * 12} width={i === 1 ? 52 : 70} height="5" rx="2.5" fill={P.muted} opacity=".45" />)}
          <g transform={`translate(${rx + 12} ${ry + 76}) scale(${1 + 0.06 * pulse})`} style={{ transformOrigin: "center" }}>
            <rect x="-4" y="-2" width="98" height="28" fill={P.highlight} />
            <text x="0" y="22" fontFamily={`'${FONT.anton}'`} fontSize="28" fill={P.ink}>{total}</text>
          </g>
          <rect x={rx + 12} y={ry + 116} width="64" height="5" rx="2.5" fill={P.muted} opacity=".45" />
        </g>
      </g>
      {/* terminal */}
      <g>
        <rect x="64" y="60" width="130" height="170" rx="16" fill={P.ink} {...D} />
        <rect x="76" y="74" width="106" height="44" rx="6" fill={P.receipt} {...D} strokeWidth={3} />
        <text x="129" y="104" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="18" fill={P.ink}>{total}</text>
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={92 + (i % 3) * 22} cy={142 + Math.floor(i / 3) * 18} r="5" fill={P.muted} />)}
        <g opacity={0.9}>{[0, 1, 2].map((k) => <path key={k} d={`M${106 + k * 8} 58 q${6 + k * 2} -${10 + k * 4} 0 -${20 + k * 8}`} transform={`translate(${24 + k * 6} ${5 - k * 3}) rotate(90 ${106 + k * 8} 58)`} fill="none" stroke={P.receipt} strokeWidth="3" strokeLinecap="round" opacity={wave > 0 ? Math.max(0, 1 - Math.abs(wave - (k + 1) / 4) * 4) : 0} />)}</g>
      </g>
      {/* card taps in from the left, hovers over the reader */}
      <g transform={`translate(${-40 + tap * 80} ${28 + (1 - tap) * 12 + Math.sin(f / 6) * (tap > 0.99 ? 1 : 0)}) rotate(${-10 * (1 - tap) + 4})`} opacity={Math.min(1, tap * 3) * (1 - pr(f, 150, 160))}>
        <rect x="30" y="-20" width="84" height="54" rx="7" fill={P.ink} {...D} strokeWidth={3} />
        <rect x="40" y="-8" width="20" height="15" rx="3" fill={P.highlight} stroke={P.ink} strokeWidth="2" />
        <rect x="40" y="18" width="52" height="5" rx="2.5" fill={P.receipt} opacity=".8" />
      </g>
      {/* purse */}
      <g transform={`translate(${px} ${py + bounce * 0.4 + idle * 0.3}) rotate(${idle * 0.4} 24 30)`}>
        <path d="M0 22 Q0 8 24 8 Q48 8 48 22 L52 58 Q52 66 44 66 L4 66 Q-4 66 -4 58 Z" fill={P.loss} {...D} />
        <path d="M-4 24 H52" stroke={P.ink} strokeWidth="4" />
        <text x="24" y="52" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="17" letterSpacing="1" fill={P.receipt}>{label}</text>
      </g>
      {/* the bite: a coin-shaped piece of receipt travelling to the purse */}
      {biteR > 1 ? (
        <g transform={`translate(${bx} ${by}) scale(${bs})`} opacity={1 - pr(f, 146, 152)}>
          <circle r={biteR} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail / bs} />
          <circle r={biteR - 8} fill="none" stroke={P.loss} strokeWidth="2.5" strokeDasharray="5 4" />
          <text y={7} textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize={biteR > 30 ? 22 : 0} fill={P.loss}>{fee}</text>
        </g>
      ) : null}
    </svg>
  );
};
