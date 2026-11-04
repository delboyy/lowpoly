import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import w50 from "world-atlas/countries-50m.json";
import { FONT, MONO } from "../../lib/fonts";
import { P } from "../theme";
import type { RegionFC } from "./maps3";
import { UK_ITL1 } from "./maps4";

/**
 * NodeMap (LF-011 + LF-007 + LF-012 base): a muted region map with typed NODES (port / airport / city) and FLOW ARROWS carrying a number on the path.
 * `features` (default UK ITL1; pass NUTS3 / any FeatureCollection) drawn as quiet paper land, neighbouring countries as context; nodes pop with 38px pills on leaders
 * (kept >=40px clear of every arrow); one node may be `hl` (the ONE yellow); flows draw as curved ink arrows (18px stroke, 64px head, `bend` -1..1) with the value
 * on a paper pill BESIDE the mid-path (offset 96px from the arrow body, 40px mono, `value` text must be a SOURCED figure) and small ink dots riding the arrow after the build (the post-build beat).
 * `from` -> `to` fly like RegionMap. For lone region fills, pass `fillRegions` ({name: "hl"|"tint"}) so the one yellow stays the single key element.
 * Dense clusters (Tilbury and London Gateway are ~12 km apart, so their icons touch at UK scale): pass `side` per node (ar/al/br/bl/ac/bc) and/or zoom `to` the cluster; the placer keeps pills off arrows and icons where it can. Arrow heads land on the node centre minus 30px so the pin stays visible. Width <= 860 (SafeBox); MapDisclaimer on border scenes.
 */

type Pill = { x: number; y: number; w: number; h: number };
/** Pill placer with HARD constraints: no pill may cover any node icon (30px radius) or another pill; arrows are avoided (40px) unless nothing else fits. */
const placeNodePills = (pts: [number, number][], labels: string[], sides: (string | undefined)[], W: number, H: number, icons: [number, number][], arrows: [number, number][]): Pill[] => {
  const ALL = ["ar", "al", "br", "bl", "bc", "ac"];
  const placed: Pill[] = [];
  labels.forEach((t, i) => {
    const w = t.length * 23 + 30, h = 56, [px, py] = pts[i];
    const rect = (sd: string, off: number): Pill => ({ x: sd[1] === "r" ? px + off : sd[1] === "l" ? px - w - off : px - w / 2, y: sd[0] === "a" ? py - h - off : py + off, w, h });
    const inside = (r: Pill) => r.x >= 6 && r.x + r.w <= W - 6 && r.y >= 6 && r.y + r.h <= H - 6;
    const apart = (r: Pill) => placed.every((o) => !(r.x < o.x + o.w + 20 && r.x + r.w + 20 > o.x && r.y < o.y + o.h + 20 && r.y + r.h + 20 > o.y));
    const hit = (r: Pill, list: [number, number][], m: number) => list.some(([x, y]) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m);
    const others = icons.filter((_, k) => k !== i);
    const order = [sides[i] ?? (i % 2 ? "br" : "ar"), ...ALL];
    const tries = [1, 1.5, 2.2, 3, 4].flatMap((m) => order.map((sd) => rect(sd, 52 * m)));
    placed.push(tries.find((r) => inside(r) && apart(r) && !hit(r, others, 30) && !hit(r, arrows, 40)) ?? tries.find((r) => inside(r) && apart(r) && !hit(r, others, 30)) ?? tries.find((r) => inside(r) && !hit(r, others, 30)) ?? tries.find(inside) ?? rect("ar", 52));
  });
  return placed;
};

export type NodeKind = "port" | "airport" | "city";
export type MapNode = { name: string; lon: number; lat: number; kind?: NodeKind; hl?: boolean; side?: "ar" | "al" | "br" | "bl" | "ac" | "bc"; noLabel?: boolean };
export type FlowDef = { from: { lon: number; lat: number }; to: { lon: number; lat: number }; value?: string; bend?: number; tone?: "ink" | "loss" };
type View = { bounds?: [[number, number], [number, number]]; pad?: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const world = w50 as unknown as Topology;
const worldFeats = (feature(world, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features;
const fitOf = (v: View, W: number, H: number) => {
  const p = geoMercator(); const pad = v.pad ?? 40;
  const [[a, b], [c, d]] = v.bounds as [[number, number], [number, number]];
  p.fitExtent([[pad, pad], [W - pad, H - pad]], { type: "MultiPoint", coordinates: [[a, b], [c, b], [a, d], [c, d]] } as never);
  const s = p.scale(), [tx, ty] = p.translate();
  return { s, ux: (W / 2 - tx) / s, uy: (H / 2 - ty) / s };
};

const Icon: React.FC<{ kind: NodeKind; hl?: boolean; k: number }> = ({ kind, hl, k }) => {
  const q = Easing.out(Easing.back(2.5))(Math.max(0, Math.min(1, k)));
  const fill = hl ? P.highlight : P.receipt;
  return (
    <g transform={`scale(${q})`}>
      <circle r="22" fill={fill} stroke={P.ink} strokeWidth="6" />
      {kind === "port" ? <path d="M0 -12 V10 M-9 -2 H9 M-11 6 Q0 16 11 6" fill="none" stroke={P.ink} strokeWidth="3.5" strokeLinecap="round" /> : null}
      {kind === "airport" ? <path d="M0 -13 L3 -3 L13 3 V6 L3 3 L2 10 L6 13 V15 L0 13 L-6 15 V13 L-2 10 L-3 3 L-13 6 V3 L-3 -3 Z" fill={P.ink} /> : null}
      {kind === "city" ? <circle r="7" fill={P.ink} /> : null}
    </g>
  );
};

export const NodeMap: React.FC<{
  width: number; height: number; features?: RegionFC; from?: View; to: View; startFrame?: number; frames?: number; nodes: MapNode[]; flows?: FlowDef[];
  fillRegions?: Record<string, "hl" | "tint">; context?: boolean; flowStart?: number;
}> = ({ width: W, height: H, features = UK_ITL1, from, to, startFrame = 0, frames = 0, nodes, flows = [], fillRegions = {}, context = true, flowStart }) => {
  const f = useCurrentFrame() - startFrame;
  const a = React.useMemo(() => fitOf(from ?? to, W, H), [from, to, W, H]);
  const b = React.useMemo(() => fitOf(to, W, H), [to, W, H]);
  const z = from && frames ? pr(f, 0, frames, Easing.inOut(Easing.cubic)) : 1;
  const s = Math.exp((1 - z) * Math.log(a.s) + z * Math.log(b.s));
  const ux = a.ux + (b.ux - a.ux) * z, uy = a.uy + (b.uy - a.uy) * z;
  const proj = geoMercator().scale(s).translate([W / 2 - s * ux, H / 2 - s * uy]);
  const path = geoPath(proj);
  const ctx = React.useMemo(() => (context ? worldFeats : []), [context]);
  const fr = Object.fromEntries(Object.entries(fillRegions).map(([k, v]) => [k.toLowerCase(), v]));
  const t0 = frames + 6;
  const pts = nodes.map((n) => proj([n.lon, n.lat]) as [number, number]);
  // flows as quadratic curves in screen space
  const geo = flows.map((fl) => {
    const p0 = proj([fl.from.lon, fl.from.lat]) as [number, number], p1 = proj([fl.to.lon, fl.to.lat]) as [number, number];
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy) || 1;
    const bend = fl.bend ?? 0.25;
    const c: [number, number] = [(p0[0] + p1[0]) / 2 - dy * bend, (p0[1] + p1[1]) / 2 + dx * bend];
    const end: [number, number] = [p1[0] - (dx / len) * 34, p1[1] - (dy / len) * 34];
    const at = (t: number): [number, number] => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * end[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * end[1]];
    return { p0, c, end, at };
  });
  const avoid: [number, number][] = geo.flatMap((g) => Array.from({ length: 24 }, (_, i) => g.at(i / 23)));
  const labelled = nodes.map((n, i) => (n.noLabel ? -1 : i)).filter((i) => i >= 0);
  const pills = placeNodePills(labelled.map((i) => pts[i]), labelled.map((i) => nodes[i].name), labelled.map((i) => nodes[i].side), W, H, labelled.map((i) => pts[i]), avoid);
  const fs0 = flowStart ?? t0 + nodes.length * 4 + 8;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "hidden" }}>
      <clipPath id="nm-clip"><rect width={W} height={H} /></clipPath>
      <rect width={W} height={H} fill="#EAE4D2" stroke={P.ink} strokeWidth="3" />
      <g clipPath="url(#nm-clip)">
        {ctx.map((c, i) => <path key={i} d={path(c) ?? ""} fill="#D8D1BC" stroke={P.ink} strokeWidth={2} />)}
        {features.features.map((ft, i) => {
          const m = fr[ft.properties.name.toLowerCase()];
          return <path key={i} d={path(ft) ?? ""} fill={m === "hl" ? P.highlight : m === "tint" ? "#E2DAC2" : P.receipt} stroke={P.ink} strokeWidth={2.4} strokeLinejoin="round" />;
        })}
      </g>
      {geo.map((g, i) => {
        const draw = pr(f, fs0 + i * 10, fs0 + i * 10 + 28, Easing.inOut(Easing.cubic));
        const c = flows[i].tone === "loss" ? P.loss : P.ink;
        const d = `M${g.p0[0]} ${g.p0[1]} Q${g.c[0]} ${g.c[1]} ${g.end[0]} ${g.end[1]}`;
        const ang = (Math.atan2(g.end[1] - g.c[1], g.end[0] - g.c[0]) * 180) / Math.PI;
        const hs = 1;
        const head = Easing.out(Easing.back(3))(pr(f, fs0 + i * 10 + 24, fs0 + i * 10 + 32, (x) => x));
        const m0 = g.at(0.5), m1 = g.at(0.52), tx = m1[0] - m0[0], ty = m1[1] - m0[1], tl = Math.hypot(tx, ty) || 1;
        const sgn = (flows[i].bend ?? 0.25) >= 0 ? 1 : -1;
        const mid: [number, number] = [m0[0] + (ty / tl) * 96 * sgn, m0[1] - (tx / tl) * 96 * sgn];
        const val = flows[i].value;
        const w = val ? val.length * 24 + 34 : 0;
        const landed = fs0 + i * 10 + 40;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={P.receipt} strokeWidth="26" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity=".9" />
            <path d={d} fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
            <g transform={`translate(${g.end[0]} ${g.end[1]}) rotate(${ang}) scale(${head * hs})`}><path d="M-60 -36 L0 0 L-60 36" fill="none" stroke={P.receipt} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" /><path d="M-60 -36 L0 0 L-60 36" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" /></g>
            {f > landed ? [0, 1, 2].map((k) => { const u = (((f - landed) / 70 + k / 3) % 1); const q = g.at(u); return <circle key={k} cx={q[0]} cy={q[1]} r="11" fill={P.receipt} stroke={c} strokeWidth="5" opacity={Math.min(1, u * 6, (1 - u) * 6)} />; }) : null}
            {val ? <g opacity={pr(f, fs0 + i * 10 + 16, fs0 + i * 10 + 26)}><rect x={mid[0] - w / 2} y={mid[1] - 32} width={w} height="64" rx="10" fill={P.receipt} stroke={P.ink} strokeWidth="4" /><text x={mid[0]} y={mid[1] + 14} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="40" fill={P.ink}>{val}</text></g> : null}
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <g key={i} transform={`translate(${pts[i][0]} ${pts[i][1]})`}><Icon kind={n.kind ?? "city"} hl={n.hl} k={pr(f, t0 + i * 4, t0 + i * 4 + 8, (x) => x)} /></g>
      ))}
      {labelled.map((i, j) => {
        const pl = pills[j], q = pr(f, t0 + i * 4 + 4, t0 + i * 4 + 12);
        const lx = Math.max(pl.x, Math.min(pl.x + pl.w, pts[i][0])), ly = Math.max(pl.y, Math.min(pl.y + pl.h, pts[i][1]));
        return (
          <g key={i} opacity={q}>
            <line x1={lx} y1={ly} x2={pts[i][0]} y2={pts[i][1]} stroke={P.ink} strokeWidth="4" strokeLinecap="round" />
            <rect x={pl.x} y={pl.y} width={pl.w} height={pl.h} rx="10" fill={P.receipt} stroke={P.ink} strokeWidth={4} />
            <text x={pl.x + pl.w / 2} y={pl.y + 40} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="38" fill={P.ink}>{nodes[i].name}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** UK logistics nodes (verify before use in a script): ports and airports with lon/lat. */
export const UK_PORTS: MapNode[] = [
  { name: "Felixstowe", lon: 1.35, lat: 51.96, kind: "port" }, { name: "Southampton", lon: -1.4, lat: 50.9, kind: "port" }, { name: "London Gateway", lon: 0.49, lat: 51.5, kind: "port" },
  { name: "Tilbury", lon: 0.36, lat: 51.46, kind: "port" }, { name: "Liverpool", lon: -3.0, lat: 53.41, kind: "port" }, { name: "Immingham", lon: -0.19, lat: 53.63, kind: "port" }, { name: "Dover", lon: 1.31, lat: 51.13, kind: "port" },
];
export const UK_AIRPORTS: MapNode[] = [
  { name: "Heathrow", lon: -0.45, lat: 51.47, kind: "airport" }, { name: "Gatwick", lon: -0.19, lat: 51.15, kind: "airport" }, { name: "Manchester", lon: -2.27, lat: 53.35, kind: "airport" }, { name: "Stansted", lon: 0.26, lat: 51.89, kind: "airport" },
];
