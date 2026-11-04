import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import w50 from "world-atlas/countries-50m.json";
import ireland from "./geo/ireland-adm1.json";
import { FONT, MONO } from "../../lib/fonts";
import { P } from "../theme";
import { placePills } from "./maps2";

/**
 * RegionMap (LF-006): the places-lens workhorse. Any admin-region FeatureCollection (GeoJSON) + a highlight list + zoom-to-region + pins, paper style:
 * cream regions with ink 2.4px borders, pale-water paper, neighbouring land as muted context, ONE yellow highlight that pulses. Reusable for UK ITL
 * regions (ONS, OGL), EU NUTS (Eurostat GISCO) or any other admin-1 file: pass `features` and `nameKey`.
 * Bundled: IRELAND_ADM1 = Natural Earth 10m admin-1 (public domain): 26 Republic counties (Dublin split into its 4 local authorities: Dublin city,
 * Dun Laoghaire-Rathdown, Fingal, South Dublin) + Northern Ireland districts, coordinates rounded to 3 decimals (~160 KB).
 * Region sets: GREATER_DUBLIN, PRESETS for bounds. `from` -> `to` fly (ease-in-out `frames`), then a slow 4% push; highlight pulses after the camera lands.
 * NOTE: Cork, Limerick, Galway, Waterford (city + county) and Tipperary (North + South) appear as two features each: a name in highlight/tint/labelRegions selects BOTH. Northern Ireland geometry is the pre-2015 26-district layout (context only, never label it; use ONS/OSNI boundaries with OGL attribution if an episode needs NI). Wrap in SafeBox (width <= 860). Boundaries are illustrative (MapDisclaimer in maps2). NI districts are context only: no labels unless asked.
 */
export type RegionFC = GeoJSON.FeatureCollection<GeoJSON.Geometry, { name: string; country?: string }>;
export const IRELAND_ADM1 = ireland as unknown as RegionFC;
export const GREATER_DUBLIN = ["Dublin", "Dún Laoghaire–Rathdown", "Fingal", "South Dublin"];
export const GREATER_DUBLIN_AREA = [...GREATER_DUBLIN, "Kildare", "Meath", "Wicklow"];
export const REGION_BOUNDS = { ireland: [[-10.8, 51.3], [-5.3, 55.5]], "greater dublin": [[-7.1, 52.85], [-5.85, 53.75]], "dublin": [[-6.5, 53.2], [-6.0, 53.65]] } as Record<string, [[number, number], [number, number]]>;

type View = { regions?: string[]; bounds?: [[number, number], [number, number]]; pad?: number };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const norm = (s: string) => s.trim().toLowerCase();
const world = w50 as unknown as Topology;
const worldFeats = (feature(world, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features;

const fitOf = (fc: RegionFC, v: View | undefined, W: number, H: number) => {
  const pad = v?.pad ?? 50;
  const p = geoMercator();
  let target: GeoJSON.GeoJSON;
  if (v?.bounds) {
    const [[a, b], [c, d]] = v.bounds;
    target = { type: "MultiPoint", coordinates: [[a, b], [c, b], [a, d], [c, d]] };
  } else if (v?.regions?.length) {
    const names = v.regions.map(norm);
    const hit = fc.features.filter((f) => names.includes(norm(f.properties.name)));
    if (!hit.length) throw new Error(`RegionMap: no region matched ${JSON.stringify(v.regions)}`);
    target = { type: "FeatureCollection", features: hit };
  } else target = fc;
  p.fitExtent([[pad, pad], [W - pad, H - pad]], target as never);
  const s = p.scale(), [tx, ty] = p.translate();
  return { s, ux: (W / 2 - tx) / s, uy: (H / 2 - ty) / s };
};

export type RegionPin = { lon: number; lat: number; label?: string; side?: "ar" | "al" | "br" | "bl" };
export const RegionMap: React.FC<{
  width: number; height: number; features?: RegionFC; from?: View; to?: View; startFrame?: number; frames?: number;
  highlight?: string[]; tint?: string[]; labelRegions?: string[]; pins?: RegionPin[]; context?: boolean; pulse?: boolean; pinStart?: number;
}> = ({ width: W, height: H, features = IRELAND_ADM1, from, to, startFrame = 0, frames = 40, highlight = [], tint = [], labelRegions = [], pins = [], context = true, pulse = true, pinStart }) => {
  const f = useCurrentFrame() - startFrame;
  const a = React.useMemo(() => fitOf(features, from ?? to, W, H), [features, from, to, W, H]);
  const b = React.useMemo(() => fitOf(features, to ?? from, W, H), [features, from, to, W, H]);
  const z = from && to ? pr(f, 0, frames, Easing.inOut(Easing.cubic)) : 1;
  const push = 1 + 0.04 * pr(f, frames, frames + 150, (x) => x);
  const s = Math.exp((1 - z) * Math.log(a.s) + z * Math.log(b.s)) * push;
  const ux = a.ux + (b.ux - a.ux) * z, uy = a.uy + (b.uy - a.uy) * z;
  const proj = geoMercator().scale(s).translate([W / 2 - s * ux, H / 2 - s * uy]);
  const path = geoPath(proj);
  const hl = new Set(highlight.map(norm)), tn = new Set(tint.map(norm)), lb = new Set(labelRegions.map(norm));
  const reveal = pr(f, 0, 14);
  const landed = frames + 2;
  const pls = pulse ? Math.max(0, 1 - Math.abs(f - (landed + 14)) / 10) : 0;
  const ps = pinStart ?? landed + 6;
  const ctx = React.useMemo(() => (context ? worldFeats.filter((c) => !["Ireland"].includes(String((c.properties as { name?: string }).name))) : []), [context]);
  const pts = pins.map((p) => (proj([p.lon, p.lat]) ?? [-999, -999]) as [number, number]);
  const labelled = pins.map((p, i) => (p.label ? i : -1)).filter((i) => i >= 0);
  const pills = placePills(labelled.map((i) => pts[i]), labelled.map((i) => pins[i].label as string), W, H, labelled.map((i) => pins[i].side ?? (undefined as never)), { off: 54 });
  const centroids = features.features.filter((ft) => lb.has(norm(ft.properties.name))).map((ft) => ({ name: ft.properties.name, c: path.centroid(ft) }));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "hidden" }}>
      <clipPath id="rm-clip"><rect width={W} height={H} /></clipPath>
      <rect width={W} height={H} fill="#EAE4D2" />
      <g clipPath="url(#rm-clip)" opacity={reveal}>
        {ctx.map((c, i) => <path key={i} d={path(c) ?? ""} fill="#D8D1BC" stroke={P.ink} strokeWidth={2} opacity=".9" />)}
        {features.features.map((ft, i) => {
          const n = norm(ft.properties.name);
          const isHl = hl.has(n), isTn = tn.has(n), ni = ft.properties.country === "Northern Ireland";
          const fill = isHl ? P.highlight : isTn ? "#E2DAC2" : ni ? "#EFE9D9" : P.receipt;
          return <path key={i} d={path(ft) ?? ""} fill={fill} stroke={P.ink} strokeWidth={isHl ? 3.5 + 3 * pls : ni ? 1.6 : 2.4} strokeLinejoin="round" />;
        })}
        {centroids.map((c, i) => <text key={i} x={c.c[0]} y={c.c[1] + 12} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="36" fill={P.ink} stroke={P.receipt} strokeWidth="7" paintOrder="stroke" opacity={pr(f, landed, landed + 10)}>{c.name}</text>)}
      </g>
      {pins.map((p, i) => {
        const k = Easing.out(Easing.back(2.5))(pr(f, ps + i * 6, ps + i * 6 + 8, (x) => x));
        const ring = f > ps + pins.length * 6 + 14 ? ((f - ps - pins.length * 6 - 14 + i * 12) % 50) / 50 : 2;
        return (
          <g key={i}>
            {ring < 1 ? <circle cx={pts[i][0]} cy={pts[i][1]} r={16 + ring * 40} fill="none" stroke={P.loss} strokeWidth="5" opacity={1 - ring} /> : null}
            <g transform={`translate(${pts[i][0]} ${pts[i][1]}) scale(${k})`}><circle r="16" fill={P.loss} stroke={P.ink} strokeWidth="6" /></g>
          </g>
        );
      })}
      {labelled.map((i, j) => {
        const pl = pills[j]; const q = pr(f, ps + i * 6 + 4, ps + i * 6 + 12);
        const lx = Math.max(pl.x, Math.min(pl.x + pl.w, pts[i][0])), ly = Math.max(pl.y, Math.min(pl.y + pl.h, pts[i][1]));
        return (
          <g key={i} opacity={q}>
            <line x1={lx} y1={ly} x2={pts[i][0]} y2={pts[i][1]} stroke={P.ink} strokeWidth="4" strokeLinecap="round" />
            <rect x={pl.x} y={pl.y} width={pl.w} height={pl.h} rx="10" fill={P.receipt} stroke={P.ink} strokeWidth={4} />
            <text x={pl.x + pl.w / 2} y={pl.y + 40} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="38" fill={P.ink}>{pins[i].label}</text>
          </g>
        );
      })}
      <text x="22" y={H - 20} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={P.muted} opacity=".0">.</text>
    </svg>
  );
};
