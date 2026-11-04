import React from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import w50 from "world-atlas/countries-50m.json";
import { FONT, MONO } from "../../lib/fonts";

/**
 * Ep.1 (Ireland data centres) thumbnails, spec: longform/ep01-ireland-data-centres/thumbs/concepts.md, rules: playbooks/thumbnail-rules.md.
 * One SVG per concept in a 1280x720 design space (viewBox), rendered natively at 1280x720 AND at 160x90 from the SAME code: `mini` thickens strokes
 * (min ~2px at 160 = 16 design px), enlarges/simplifies small detail (house grid 19x20 -> 12x13, no tag) so line weights and the hero hold at phone size.
 * Palette only: ink, paper, receipt white, loss red, yellow ONCE per thumbnail. Republic of Ireland only (Natural Earth 50m "Ireland"; Northern Ireland not drawn).
 * Boundaries are illustrative. No logos, photos or people.
 */
const C = { ink: "#14130F", paper: "#F4EFE4", white: "#FFFDF6", red: "#E5322D", yellow: "#FFD21F" } as const;
export const THUMB_W = 1280, THUMB_H = 720;
type Props = { width?: number; height?: number; mini?: boolean };

const world = w50 as unknown as Topology;
const IE = (feature(world, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features.find((f) => (f.properties as { name?: string }).name === "Ireland") as GeoJSON.Feature;
/** Republic outline fitted into a box; returns the svg path and the projected Dublin point. */
const ireland = (x: number, y: number, w: number, h: number) => {
  const p = geoMercator();
  p.fitExtent([[x, y], [x + w, y + h]], IE as never);
  return { d: geoPath(p)(IE as never) ?? "", dublin: p([-6.26, 53.35]) as [number, number] };
};

const Svg: React.FC<Props & { bg: string; children: React.ReactNode }> = ({ width = THUMB_W, height = THUMB_H, bg, children }) => (
  <svg width={width} height={height} viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} style={{ display: "block" }}>
    <rect width={THUMB_W} height={THUMB_H} fill={bg} />
    {children}
  </svg>
);

/** Anton metrics measured on a render at 200px (letterSpacing 2): cap height 0.87 em, ink width per em for each string, ink starts 0.035 em right of x. */
const EM = { "BIGGER?": 3.06, "77%": 2.0, "OF NEW DEMAND": 6.155, "OF GROWTH": 4.2, "WORTH IT?": 3.97, "23%": 2.0 } as const;
const CAP = 0.87;
/** Label box: ink box with white Anton text, optional yellow last char (the single yellow). */
const Label: React.FC<{ x: number; y: number; text: keyof typeof EM; yellowLast?: boolean; font?: number; pad?: number }> = ({ x, y, text, yellowLast, font = 143, pad = 24 }) => {
  const w = EM[text] * font + pad * 2, cap = font * CAP;
  const body = yellowLast ? text.slice(0, -1) : text;
  return (
    <g>
      <rect x={x} y={y} width={w} height={cap + pad * 2} fill={C.ink} />
      <text x={x + pad - 0.035 * font} y={y + pad + cap} fontFamily={`'${FONT.anton}'`} fontSize={font} fill={C.white} letterSpacing="2">{body}{yellowLast ? <tspan fill={C.yellow}>{text.slice(-1)}</tspan> : null}</text>
    </g>
  );
};

const House: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path d={`M${x} ${y + s * 0.45} L${x + s * 0.5} ${y} L${x + s} ${y + s * 0.45} V${y + s} H${x} Z`} fill={C.ink} />
);

/* ---------------------------------------------------------------- C1 "BIGGER?" (title B) */
export const ThumbC1: React.FC<Props> = ({ mini, ...p }) => {
  const cols = mini ? 8 : 10, rows = mini ? 9 : 11;
  const x0 = 122, w = 400, w2 = 515, x1 = 642, y0 = 254, h = 346, pad = mini ? 14 : 10;
  const pitchX = (w - pad * 2) / cols, pitchY = (h - pad * 2) / rows;
  const gs = Math.min(pitchX, pitchY) * 0.8;
  const ol = mini ? 12 : 4;
  return (
    <Svg {...p} bg={C.paper}>
      {/* left block: every urban home (400 wide: 400:515 = 357:460 = 5,954:7,663, same height) */}
      <rect x={x0} y={y0} width={w} height={h} fill={C.white} stroke={C.ink} strokeWidth={ol} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => <House key={`${r}-${c}`} x={x0 + pad + c * pitchX + (pitchX - gs) / 2} y={y0 + pad + r * pitchY + (pitchY - gs) / 2} s={gs} />))}
      {/* right block: data centres (460 wide), solid ink, vents at 30/50/70%, one red dot */}
      <rect x={x1} y={y0} width={w2} height={h} fill={C.ink} />
      {[0.3, 0.5, 0.7].map((t) => <rect key={t} x={x1 + 30} y={y0 + h * t - (mini ? 10 : 4)} width={w2 - 60} height={mini ? 20 : 8} fill={C.paper} />)}
      <rect x={64} y={600} width={1152} height={mini ? 18 : 12} fill={C.ink} />
      <Label x={64} y={64} text="BIGGER?" yellowLast />
      {mini ? null : <><text x={x0} y={648} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={C.ink}>URBAN HOMES</text><text x={x1} y={648} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={C.ink}>DATA CENTRES</text></>}
    </Svg>
  );
};

/* ---------------------------------------------------------------- C2 "77% OF NEW POWER" (question title) */
export const ThumbC2: React.FC<Props> = ({ mini, ...p }) => {
  const ie = ireland(1010, 52, 190, 215);
  const bx = 1030, by = 300, bw = 150, bh = 352, top = Math.round(bh * 0.771);
  const ol = mini ? 12 : 6;
  return (
    <Svg {...p} bg={C.yellow}>
      <text x={64 - 0.035 * 410} y={448} fontFamily={`'${FONT.anton}'`} fontSize="410" fill={C.ink} letterSpacing="2">77%</text>
      {mini ? null : <text x={64} y={78} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={C.ink}>IRELAND ELECTRICITY 2015-25</text>}
      <Label x={64} y={486} text="OF GROWTH" font={143} pad={24} />
      {/* PLAIN two-colour rectangle split 77/23 (a share of the GROWTH, not of the total): no vents, no glyphs, no tower/battery reading */}
      <rect x={bx} y={by} width={bw} height={bh} fill={C.white} />
      <rect x={bx} y={by} width={bw} height={top} fill={C.ink} />
      <rect x={bx} y={by} width={bw} height={bh} fill="none" stroke={C.ink} strokeWidth={ol} />
      <path d={ie.d} fill={C.paper} stroke={C.ink} strokeWidth={mini ? 7 : 3} strokeLinejoin="round" />
      <circle cx={ie.dublin[0]} cy={ie.dublin[1]} r={mini ? 14 : 10} fill="none" stroke={C.red} strokeWidth={mini ? 8 : 5} />
    </Svg>
  );
};

/* ---------------------------------------------------------------- C3 "23%" (unit-area split: data centres' slice of ALL metered electricity) */
export const ThumbC3: React.FC<Props> = ({ mini, ...p }) => {
  const sx = 520, sy = 92, sq = 540, slice = Math.round(sq * 0.232);
  const ie = ireland(sx + 150, sy + 36, 240, 275);
  const ol = mini ? 14 : 6;
  return (
    <Svg {...p} bg={C.paper}>
      {/* whole INK square = ALL Ireland's metered electricity (named by the caption); yellow slice = data centres 23.2% (full width, 23.2% of the height, unstretched) */}
      <rect x={sx} y={sy} width={sq} height={sq} fill={C.ink} />
      <rect x={sx} y={sy + sq - slice} width={sq} height={slice} fill={C.yellow} />
      <path d={ie.d} fill={C.paper} stroke={C.paper} strokeWidth={mini ? 4 : 1} strokeLinejoin="round" />
      <circle cx={ie.dublin[0]} cy={ie.dublin[1]} r={mini ? 14 : 10} fill="none" stroke={C.red} strokeWidth={mini ? 8 : 5} />
      <rect x={sx} y={sy} width={sq} height={sq} fill="none" stroke={C.ink} strokeWidth={ol} />
      <line x1={sx} x2={sx + sq} y1={sy + sq - slice} y2={sy + sq - slice} stroke={C.ink} strokeWidth={ol} />
      <rect x={64} y={sy + sq} width={1152} height={mini ? 18 : 10} fill={C.ink} />
      <Label x={64} y={64} text="23%" />
      {mini ? null : <><text x={sx + sq / 2} y={sy + sq - slice / 2 + 10} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={C.ink}>DATA CENTRES</text><text x={sx} y={668} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={C.ink}>IRELAND METERED ELECTRICITY 2025</text></>}
    </Svg>
  );
};
