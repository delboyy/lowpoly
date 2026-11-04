import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import w50 from "world-atlas/countries-50m.json";
import ukItl from "./geo/uk-itl.json";
import { FONT, MONO } from "../../lib/fonts";
import { P } from "../theme";
import { placePills } from "./maps2";
import type { RegionFC } from "./maps3";

/**
 * RegionChoropleth (LF-010): money/data by admin region on any FeatureCollection (default: UK ITL regions). Regions reveal low -> high, the TOP region turns the one
 * yellow with a pulse and a value pill (leader line), a legend shows LOW..HIGH plus a yellow TOP swatch (36px), optional extra pills for the BOTTOM / chosen regions
 * (`pillFor`; `label` shortens long region names for pills (default: after " - ", else 15 chars + ellipsis); pills for regions outside the visible map are skipped), neighbouring land (Ireland, France...) muted as context. Camera = fit of `to` bounds or region names (`from` -> `to` fly like RegionMap).
 * Bundled: UK_ITL1 (12 regions) and UK_ITL2 (46) = ONS Open Geography ITL Jan 2025 BUC boundaries, simplified (RDP 0.004 deg ~ 400m) and rounded to 3 decimals (~440KB).
 * CREDIT (both lines, in the video description whenever these shapes are shown; ONS licences page, checked 2026-10-17): "Source: Office for National Statistics licensed under the
 * Open Government Licence v.3.0" and "Contains OS data © Crown copyright and database right 2025" (year: confirm on the dataset page). Values come from the script (sourced): `data` = [{name, value}] with names as in the file
 * (e.g. "London", "Inner London - West"); `fmt` formats pill values. Width <= 860 (SafeBox); show MapDisclaimer on border scenes.
 */
export const UK_ITL1 = (ukItl as unknown as { itl1: RegionFC }).itl1;
export const UK_ITL2 = (ukItl as unknown as { itl2: RegionFC }).itl2;
export const UK_BOUNDS: [[number, number], [number, number]] = [[-8.3, 49.8], [1.9, 60.9]];
export const UK_ENGLAND_BOUNDS: [[number, number], [number, number]] = [[-5.9, 49.9], [1.8, 55.9]];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const norm = (s: string) => s.trim().toLowerCase();
const RAMP = ["#EFE9D9", "#D2CAB4", "#A59C86", "#6B665A"];
const world = w50 as unknown as Topology;
const worldFeats = (feature(world, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features;
type View = { regions?: string[]; bounds?: [[number, number], [number, number]]; pad?: number };
const fitOf = (fc: RegionFC, v: View | undefined, W: number, H: number) => {
  const pad = v?.pad ?? 50;
  const p = geoMercator();
  let target: GeoJSON.GeoJSON;
  if (v?.bounds) { const [[a, b], [c, d]] = v.bounds; target = { type: "MultiPoint", coordinates: [[a, b], [c, b], [a, d], [c, d]] }; }
  else if (v?.regions?.length) { const names = v.regions.map(norm); const hit = fc.features.filter((f) => names.includes(norm(f.properties.name))); if (!hit.length) throw new Error(`RegionChoropleth: no region matched ${JSON.stringify(v.regions)}`); target = { type: "FeatureCollection", features: hit }; }
  else target = fc;
  p.fitExtent([[pad, pad], [W - pad, H - pad]], target as never);
  const s = p.scale(), [tx, ty] = p.translate();
  return { s, ux: (W / 2 - tx) / s, uy: (H / 2 - ty) / s };
};

export const RegionChoropleth: React.FC<{
  width: number; height: number; features?: RegionFC; data: { name: string; value: number }[]; fmt?: (v: number) => string;
  from?: View; to?: View; startFrame?: number; frames?: number; topN?: number; pillFor?: string[]; legend?: [string, string]; context?: boolean; label?: (name: string) => string;
}> = ({ width: W, height: Htot, features = UK_ITL1, data, fmt = (v) => String(v), from, to, startFrame = 0, frames = 0, topN = 1, pillFor = [], legend, context = true, label = (n) => { const x = n.replace(/ \(England\)/, ""); return x.length > 16 ? (x.includes(" - ") ? x.split(" - ").pop() as string : x.slice(0, 15) + "…") : x; } }) => {
  const H = Htot - 150; // map area; the legend lives in the strip below it so pills and the map never sit under it
  const f = useCurrentFrame() - startFrame;
  const a = React.useMemo(() => fitOf(features, from ?? to, W, H), [features, from, to, W, H]);
  const b = React.useMemo(() => fitOf(features, to ?? from, W, H), [features, from, to, W, H]);
  const z = from && to && frames ? pr(f, 0, frames, Easing.inOut(Easing.cubic)) : 1;
  const s = Math.exp((1 - z) * Math.log(a.s) + z * Math.log(b.s));
  const ux = a.ux + (b.ux - a.ux) * z, uy = a.uy + (b.uy - a.uy) * z;
  const proj = geoMercator().scale(s).translate([W / 2 - s * ux, H / 2 - s * uy]);
  const path = geoPath(proj);
  const sorted = [...data].sort((x, y) => x.value - y.value);
  const lo = sorted[0]?.value ?? 0, hi = sorted[sorted.length - 1]?.value ?? 1;
  const rank = new Map(sorted.map((d, i) => [norm(d.name), i]));
  const val = new Map(sorted.map((d) => [norm(d.name), d.value]));
  const top = new Set(sorted.slice(-topN).map((d) => norm(d.name)));
  const t0 = frames + 6, n = sorted.length;
  const done = t0 + n * 2 + 12;
  const pulse = f > done ? Math.max(0, 1 - Math.abs(f - (done + 8)) / 8) : 0;
  const ctx = React.useMemo(() => (context ? worldFeats.filter((c) => !["United Kingdom"].includes(String((c.properties as { name?: string }).name))) : []), [context]);
  const topVisible = features.features.some((ft) => top.has(norm(ft.properties.name)) && (() => { const c = path.centroid(ft) as [number, number]; return c[0] > 20 && c[0] < W - 20 && c[1] > 20 && c[1] < H - 20; })());
  const wanted = [...top, ...pillFor.map(norm)];
  const inMap = (c: [number, number]) => c[0] > 20 && c[0] < W - 20 && c[1] > 20 && c[1] < H - 20;
  const labelled = features.features.filter((ft) => wanted.includes(norm(ft.properties.name)) && inMap(path.centroid(ft) as [number, number]));
  const pts = labelled.map((ft) => path.centroid(ft) as [number, number]);
  const texts = labelled.map((ft) => `${label(ft.properties.name)} ${fmt(val.get(norm(ft.properties.name)) ?? 0)}`);
  const pills = placePills(pts, texts, W, H, labelled.map((ft) => (top.has(norm(ft.properties.name)) ? "al" : "bl")), { off: 90 });
  return (
    <svg width={W} height={Htot} viewBox={`0 0 ${W} ${Htot}`} style={{ overflow: "hidden" }}>
      <clipPath id="rc-clip"><rect width={W} height={H} /></clipPath>
      <rect width={W} height={H} fill="#EAE4D2" stroke={P.ink} strokeWidth="3" />
      <g clipPath="url(#rc-clip)">
        {ctx.map((c, i) => <path key={i} d={path(c) ?? ""} fill="#D8D1BC" stroke={P.ink} strokeWidth={2} />)}
        {features.features.map((ft, i) => {
          const name = norm(ft.properties.name);
          if (!rank.has(name)) return <path key={i} d={path(ft) ?? ""} fill={P.receipt} stroke={P.ink} strokeWidth={2.2} />;
          const r = rank.get(name) as number, on = pr(f, t0 + r * 2, t0 + r * 2 + 10), v = val.get(name) as number;
          const lvl = hi === lo ? 3 : Math.min(3, Math.floor(((v - lo) / (hi - lo)) * 3.999));
          const isTop = top.has(name) && f > done - 2;
          return <path key={i} d={path(ft) ?? ""} fill={on < 1 ? P.receipt : isTop ? P.highlight : RAMP[lvl]} stroke={P.ink} strokeWidth={isTop ? 4 + 3 * pulse : 2.4} strokeLinejoin="round" style={{ opacity: Math.max(0.0001, on) }} />;
        })}
      </g>
      {labelled.map((ft, j) => {
        const pl = pills[j], q = pr(f, done, done + 10);
        const lx = Math.max(pl.x, Math.min(pl.x + pl.w, pts[j][0])), ly = Math.max(pl.y, Math.min(pl.y + pl.h, pts[j][1]));
        return (
          <g key={j} opacity={q}>
            <line x1={lx} y1={ly} x2={pts[j][0]} y2={pts[j][1]} stroke={P.ink} strokeWidth="4" strokeLinecap="round" />
            <circle cx={pts[j][0]} cy={pts[j][1]} r="8" fill={P.ink} />
            <rect x={pl.x} y={pl.y} width={pl.w} height={pl.h} rx="10" fill={P.receipt} stroke={P.ink} strokeWidth={4} />
            <text x={pl.x + pl.w / 2} y={pl.y + 40} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="38" fill={P.ink}>{texts[j]}</text>
          </g>
        );
      })}
      <g opacity={pr(f, t0, t0 + 12)}>
        {RAMP.map((c, i) => <rect key={i} x={20 + i * 56} y={H + 40} width="56" height="32" fill={c} stroke={P.ink} strokeWidth="3" />)}
        {topVisible ? <rect x={20 + 4 * 56 + 16} y={H + 40} width="56" height="32" fill={P.highlight} stroke={P.ink} strokeWidth="3" /> : null}
        <text x="20" y={H + 114} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" fill={P.ink}>{legend?.[0] ?? "LOW"}</text>
        <text x={20 + 224} y={H + 114} textAnchor="end" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" fill={P.ink}>{legend?.[1] ?? "HIGH"}</text>
        {topVisible ? <text x={20 + 4 * 56 + 44} y={H + 114} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" fill={P.ink}>TOP</text> : null}
      </g>
    </svg>
  );
};
