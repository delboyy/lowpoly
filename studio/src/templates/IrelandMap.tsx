import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import irelandData from "../data/ireland.json";
import { P } from "../kit/theme";
import { FONT } from "../lib/fonts";

/**
 * Ireland in the paper map style: 26 counties (Natural Earth admin-1, public domain; local file src/data/ireland.json, coordinates rounded to 3 dp),
 * Northern Ireland districts in muted paper, thin ink borders, one yellow highlight. `highlight: ["Dublin"]` lights the four Dublin councils
 * (Dublin, Dún Laoghaire–Rathdown, Fingal, South Dublin) and pulses a ring on Dublin city. mode "zoom" eases (frames 8-44) from the whole island to
 * Greater Dublin by re-fitting the SAME geometry (scale + translate). The 10 m admin-1 shapes are coarse at street level: the zoom stays schematic
 * (county outlines only, no streets, no site data); the "illustrative" caption is the caller's job.
 */
type F = GeoJSON.Feature<GeoJSON.Geometry, { name: string; side: "ie" | "ni" }>;
const feats = (irelandData as unknown as GeoJSON.FeatureCollection).features as F[];
const DUBLIN = new Set(["Dublin", "Dún Laoghaire–Rathdown", "Fingal", "South Dublin"]);
const GREATER = new Set([...DUBLIN, "Meath", "Kildare", "Wicklow"]);
const DUBLIN_CITY: [number, number] = [-6.26, 53.35];

const fit = (width: number, height: number, set?: Set<string>, pad = 20) => {
  const proj = geoMercator();
  const target = { type: "FeatureCollection", features: set ? feats.filter((f) => set.has(f.properties.name)) : feats } as GeoJSON.FeatureCollection;
  proj.fitExtent([[pad, pad], [width - pad, height - pad]], target);
  return { s: proj.scale(), t: proj.translate() as [number, number], center: proj.center(), rotate: proj.rotate() };
};

export const IrelandMap: React.FC<{ width: number; height: number; highlight?: string[]; mode?: "region" | "zoom"; startFrame?: number; label?: string }> = ({ width, height, highlight = ["Dublin"], mode = "region", startFrame = 0, label }) => {
  const f = useCurrentFrame() - startFrame;
  const full = React.useMemo(() => fit(width, height), [width, height]);
  const zoom = React.useMemo(() => fit(width, height, GREATER, 60), [width, height]);
  const k = mode === "zoom" ? interpolate(f, [8, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) : 0;
  const proj = geoMercator().center(full.center).scale(full.s + (zoom.s - full.s) * k).translate([full.t[0] + (zoom.t[0] - full.t[0]) * k, full.t[1] + (zoom.t[1] - full.t[1]) * k]);
  const path = geoPath(proj);
  const hl = new Set(highlight.flatMap((h) => (h === "Dublin" ? [...DUBLIN] : [h])));
  const [cx, cy] = proj(DUBLIN_CITY) ?? [0, 0];
  const ring = (f % 54) / 54;
  const showCity = hl.has("Dublin");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {feats.map((ft, i) => {
        const on = hl.has(ft.properties.name);
        return <path key={i} d={path(ft) ?? ""} fill={on ? P.highlight : ft.properties.side === "ni" ? "#E4DDCB" : P.receipt} stroke={P.ink} strokeWidth={on ? 2.4 : 1.3} strokeLinejoin="round" />;
      })}
      {showCity ? (
        <g>
          {[0, 0.5].map((o, i) => { const r = (ring + o) % 1; return <circle key={i} cx={cx} cy={cy} r={14 + r * 70} fill="none" stroke={P.ink} strokeWidth={3} opacity={1 - r} />; })}
          <circle cx={cx} cy={cy} r={13} fill={P.loss} stroke={P.ink} strokeWidth={4} />
          <text x={cx + 26} y={cy - 22} fontFamily={FONT.anton} fontSize={Math.max(34, width * 0.045)} fill={P.ink} stroke={P.paper} strokeWidth={8} paintOrder="stroke" style={{ textTransform: "uppercase" }}>{label ?? "Dublin"}</text>
        </g>
      ) : null}
    </svg>
  );
};
