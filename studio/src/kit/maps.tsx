import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoAlbersUsa, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology } from "topojson-specification";
import usTopo from "us-atlas/states-10m.json";
import worldTopo from "world-atlas/countries-110m.json";
import { P } from "./theme";

/** Public-domain geography: us-atlas (Census cartographic boundaries) and world-atlas (Natural Earth). Both ISC-licensed packages. */
export type MapDot = { lon: number; lat: number; label?: string; color?: string; size?: number };
export type MapProps = {
  region: "us" | "world";
  width: number;
  height: number;
  /** points that pop in staggered */
  dots?: MapDot[];
  /** US: state FIPS-or-name list to fill in `highlightColor` */
  highlight?: string[];
  highlightColor?: string;
  /** frame at which borders/dots start drawing */
  startFrame?: number;
  /** if true, dots are generated en masse (density map), count via `scatter` */
  scatter?: { count: number; seed?: number };
  dotColor?: string;
};

const us = usTopo as unknown as Topology;
const world = worldTopo as unknown as Topology;
const states = (feature(us, us.objects.states as never) as unknown as GeoJSON.FeatureCollection).features;
const stateBorders = mesh(us, us.objects.states as never, (a: unknown, b: unknown) => a !== b);
const countries = (feature(world, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features;

const rand = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

export const GeoMap: React.FC<MapProps> = ({ region, width, height, dots = [], highlight = [], highlightColor = P.highlight, startFrame = 0, scatter, dotColor = P.loss }) => {
  const f = useCurrentFrame() - startFrame;
  const { proj, path } = React.useMemo(() => {
    const proj = region === "us" ? geoAlbersUsa() : geoNaturalEarth1();
    const sphereOrUs = region === "us" ? ({ type: "FeatureCollection", features: states } as never) : ({ type: "Sphere" } as never);
    proj.fitExtent([[10, 10], [width - 10, height - 10]], sphereOrUs);
    return { proj, path: geoPath(proj) };
  }, [region, width, height]);

  const draw = interpolate(f, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const hl = new Set(highlight.map((h) => h.toLowerCase()));

  // scatter dots: random points that land inside a US state polygon (rejection sampling in projected space, deterministic)
  const pts = React.useMemo(() => {
    if (!scatter) return [] as { x: number; y: number }[];
    const r = rand(scatter.seed ?? 7);
    const out: { x: number; y: number }[] = [];
    let guard = 0;
    while (out.length < scatter.count && guard++ < scatter.count * 80) {
      const x = r() * width, y = r() * height;
      const ll = proj.invert?.([x, y]);
      if (!ll) continue;
      if (region === "us") {
        if (states.some((s) => inside(s, ll as [number, number]))) out.push({ x, y });
      } else if (countries.some((s) => inside(s, ll as [number, number]))) out.push({ x, y });
    }
    return out;
  }, [scatter, proj, width, height, region]);

  const base = region === "us" ? states : countries;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {base.map((s, i) => {
        const name = String((s.properties as { name?: string })?.name ?? "").toLowerCase();
        const on = hl.has(name);
        return <path key={i} d={path(s) ?? ""} fill={on ? highlightColor : P.receipt} opacity={draw} stroke={P.ink} strokeWidth={region === "us" ? 1.2 : 0.7} strokeLinejoin="round" />;
      })}
      {region === "us" ? <path d={path(stateBorders as never) ?? ""} fill="none" stroke={P.ink} strokeWidth={1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} /> : null}
      {pts.map((p, i) => {
        const q = interpolate(f, [18 + i * (80 / pts.length), 22 + i * (80 / pts.length)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <circle key={i} cx={p.x} cy={p.y} r={5 * q} fill={dotColor} stroke={P.ink} strokeWidth={1} />;
      })}
      {dots.map((d, i) => {
        const xy = proj([d.lon, d.lat]);
        if (!xy) return null;
        const q = interpolate(f, [20 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
        const r = (d.size ?? 14) * q;
        const ring = (f - 20 - i * 8) / 24;
        return (
          <g key={i}>
            {ring > 0 && ring < 1 ? <circle cx={xy[0]} cy={xy[1]} r={(d.size ?? 14) * (1 + ring * 2.2)} fill="none" stroke={d.color ?? P.loss} strokeWidth={3} opacity={1 - ring} /> : null}
            <circle cx={xy[0]} cy={xy[1]} r={r} fill={d.color ?? P.loss} stroke={P.ink} strokeWidth={3} />
            {d.label ? <text x={xy[0] + r + 8} y={xy[1] + 8} fontFamily="'GV Inter'" fontWeight={800} fontSize={26} fill={P.ink} opacity={q} stroke={P.paper} strokeWidth={5} paintOrder="stroke">{d.label}</text> : null}
          </g>
        );
      })}
    </svg>
  );
};

import { geoContains } from "d3-geo";
const inside = (f: GeoJSON.Feature, ll: [number, number]) => geoContains(f as never, ll);
