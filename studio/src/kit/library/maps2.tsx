import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { geoAlbersUsa, geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import type { GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import w110 from "world-atlas/countries-110m.json";
import w50 from "world-atlas/countries-50m.json";
import usTopo from "us-atlas/states-10m.json";
import { FONT, MONO } from "../../lib/fonts";
import { PaperBg } from "../devices";
import { P, STROKE } from "../theme";

/**
 * Map-first kit ("Money x Places"). Public-domain geometry only: Natural Earth (world-atlas 110m/50m) and US Census states (us-atlas).
 * Everything is parametric (place, bounds, data) and shares ONE camera: MapCanvas fits the `from` view, flies (zoom-to-place) to the `to`
 * view over `frames`, and hands the live projection to its children so routes, pins, choropleths and receipts stay locked to the geography.
 * Boundaries: Natural Earth (public domain, https://www.naturalearthdata.com/about/terms-of-use/) shows de-facto lines incl. disputed areas; see MapDisclaimer for the rule.
 * Rules (QA): charts live in x60-920 (use SafeBox, width <= 860), labels >= 36px on paper pills, yellow only on the single key element.
 */
export type Bounds = [[number, number], [number, number]]; // [[lonMin, latMin], [lonMax, latMax]]
export type MapView = { places?: string[]; bounds?: Bounds; pad?: number };
export type Place = { name?: string; lon: number; lat: number };
type Src = "world" | "us";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

const worldCache: Record<string, GeoJSON.Feature[]> = {};
const worldFeatures = (detail: "110m" | "50m") => (worldCache[detail] ??= ((): GeoJSON.Feature[] => {
  const t = (detail === "50m" ? w50 : w110) as unknown as Topology;
  return (feature(t, t.objects.countries as never) as unknown as GeoJSON.FeatureCollection).features;
})());
const us = usTopo as unknown as Topology;
const usFeatures = (feature(us, us.objects.states as never) as unknown as GeoJSON.FeatureCollection).features;

const ALIAS: Record<string, string> = { usa: "united states of america", us: "united states of america", "united states": "united states of america", uk: "united kingdom", britain: "united kingdom", "south korea": "south korea", korea: "south korea", uae: "united arab emirates", russia: "russia", czechia: "czechia" };
/** Named bounds for places whose country outline crosses the antimeridian or is too big for a useful fit. */
export const PLACE_BOUNDS: Record<string, Bounds> = {
  "contiguous us": [[-125, 24], [-66, 50]], europe: [[-12, 35], [32, 60]], "east asia": [[95, 5], [150, 48]], "gulf of mexico": [[-98, 17], [-80, 31]],
  "panama canal": [[-80.2, 8.4], [-79.3, 9.6]], "suez canal": [[31.5, 29.5], [33.2, 31.5]], "strait of malacca": [[98, -1], [106, 7]], "english channel": [[-6, 48], [4, 53]],
  "us gulf coast": [[-98, 25], [-82, 32]], "us east coast": [[-82, 24], [-66, 46]], "california": [[-124.6, 32.4], [-114, 42.1]], "great lakes": [[-93, 40], [-75, 49]],
};
const norm = (s: string) => s.trim().toLowerCase();

const resolve = (src: Src, v: MapView | undefined, detail: "110m" | "50m"): GeoJSON.GeometryObject | GeoJSON.FeatureCollection => {
  if (!v || (!v.places && !v.bounds)) return src === "us" ? ({ type: "FeatureCollection", features: usFeatures } as GeoJSON.FeatureCollection) : ({ type: "Sphere" } as never);
  if (v.bounds) {
    const [[a, b], [c, d]] = v.bounds;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) pts.push([a + ((c - a) * i) / 4, b + ((d - b) * j) / 4]);
    return { type: "MultiPoint", coordinates: pts };
  }
  const names = (v.places ?? []).map((p) => ALIAS[norm(p)] ?? norm(p));
  if (names.length === 1 && PLACE_BOUNDS[names[0]]) return resolve(src, { bounds: PLACE_BOUNDS[names[0]], pad: v.pad }, detail);
  const pool = src === "us" ? usFeatures : worldFeatures(detail);
  const hit = pool.filter((f) => names.includes(norm(String((f.properties as { name?: string })?.name ?? ""))));
  if (!hit.length) throw new Error(`MapView: no place matched ${JSON.stringify(v.places)} in ${src}`);
  return { type: "FeatureCollection", features: hit } as GeoJSON.FeatureCollection;
};

const baseProj = (src: Src, centerLon = 0): GeoProjection => (src === "us" ? geoAlbersUsa() : geoNaturalEarth1().rotate([-centerLon, 0]));
/** Fit a view, return its scale and the view centre in unit-projection coordinates (screen = scale * unit + translate, exact for these projections). */
const fitView = (src: Src, v: MapView | undefined, W: number, H: number, detail: "110m" | "50m", centerLon = 0) => {
  const pad = v?.pad ?? 40;
  const p = baseProj(src, centerLon);
  p.fitExtent([[pad, pad], [W - pad, H - pad]], resolve(src, v, detail) as never);
  const s = p.scale(), [tx, ty] = p.translate();
  return { s, ux: (W / 2 - tx) / s, uy: (H / 2 - ty) / s };
};

export type MapCtx = { proj: GeoProjection; path: ReturnType<typeof geoPath>; f: number; W: number; H: number; reveal: number; zoom: number; src: Src };

/**
 * MapCanvas: the shared camera. `from` (default whole world / all states) -> `to` over `frames` starting at `startFrame` (ease-in-out, exact
 * centre/scale interpolation = zoom-to-place). `fillFor(name)` / `strokeFor(name)` style the regions; children render on top with the live projection.
 */
export const MapCanvas: React.FC<{
  width: number; height: number; src?: Src; from?: MapView; to?: MapView; startFrame?: number; frames?: number; detail?: "110m" | "50m";
  fillFor?: (name: string, reveal: number) => string | undefined; graticule?: boolean; sphere?: boolean; children?: (c: MapCtx) => React.ReactNode; revealFrames?: number; centerLon?: number; push?: number;
}> = ({ width: W, height: H, src = "world", from, to, startFrame = 0, frames = 40, detail = "110m", fillFor, graticule = true, sphere = true, children, revealFrames = 18, centerLon = 0, push = 0 }) => {
  const f = useCurrentFrame() - startFrame;
  const a = React.useMemo(() => fitView(src, from ?? to, W, H, detail, centerLon), [src, from, to, W, H, detail, centerLon]);
  const b = React.useMemo(() => fitView(src, to ?? from, W, H, detail, centerLon), [src, from, to, W, H, detail, centerLon]);
  const zoom = from && to ? pr(f, 0, frames, Easing.inOut(Easing.cubic)) : 1;
  const s = Math.exp((1 - zoom) * Math.log(a.s) + zoom * Math.log(b.s)) * (1 + push * pr(f, frames, frames + 150, (x) => x));
  const ux = a.ux + (b.ux - a.ux) * zoom, uy = a.uy + (b.uy - a.uy) * zoom;
  const proj = baseProj(src, centerLon).scale(s).translate([W / 2 - s * ux, H / 2 - s * uy]);
  const path = geoPath(proj);
  const reveal = pr(f, 0, revealFrames);
  const feats = src === "us" ? usFeatures : worldFeatures(detail);
  const grat = React.useMemo(() => geoGraticule10(), []);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "hidden" }}>
      <clipPath id="mc-clip"><rect width={W} height={H} /></clipPath>
      <g clipPath="url(#mc-clip)" opacity={reveal}>
        {sphere && src === "world" ? <><path d={path({ type: "Sphere" } as never) ?? ""} fill="none" stroke={P.ink} strokeWidth={10} opacity=".18" transform="translate(8 8)" /><path d={path({ type: "Sphere" } as never) ?? ""} fill={P.paper} stroke={P.ink} strokeWidth={5} /></> : null}
        {graticule && src === "world" ? <path d={path(grat) ?? ""} fill="none" stroke={P.ink} strokeWidth={1.6} opacity=".12" /> : null}
        {feats.map((ft, i) => {
          const name = String((ft.properties as { name?: string })?.name ?? "");
          return <path key={i} d={path(ft) ?? ""} fill={fillFor?.(name, reveal) ?? P.receipt} stroke={P.ink} strokeWidth={2.2} strokeLinejoin="round" />;
        })}
      </g>
      {children?.({ proj, path, f, W, H, reveal, zoom, src })}
    </svg>
  );
};

/* ------------------------------------------------------------------ label placement (pill-intersection, as RouteMap) */
type Pill = { x: number; y: number; w: number; h: number };
const PILL_H = 56;
const pillW = (t: string) => t.length * 23 + 30;
export const placePills = (pts: [number, number][], labels: string[], W: number, H: number, prefer: ("ar" | "al" | "br" | "bl")[] = [], opt: { avoid?: [number, number][]; off?: number; clear?: number } = {}): Pill[] => {
  const SIDES = ["ar", "al", "br", "bl", "bc", "ac"] as const;
  type Side = (typeof SIDES)[number];
  const off0 = opt.off ?? 30, clear = opt.clear ?? 0;
  const placed: Pill[] = [];
  labels.forEach((t, i) => {
    const w = pillW(t);
    const [px, py] = pts[i];
    const rect = (sd: Side, off: number): Pill => ({ x: sd[1] === "r" ? px + off : sd[1] === "l" ? px - w - off : px - w / 2, y: sd[0] === "a" ? py - PILL_H - off : py + off, w, h: PILL_H });
    const apart = (r: Pill) => placed.every((o) => !(r.x < o.x + o.w + 24 && r.x + r.w + 24 > o.x && r.y < o.y + o.h + 24 && r.y + r.h + 24 > o.y));
    const inside = (r: Pill) => r.x >= 6 && r.x + r.w <= W - 6 && r.y >= 6 && r.y + r.h <= H - 6;
    const clearOf = (r: Pill) => !clear || !(opt.avoid ?? []).some(([ax, ay]) => ax > r.x - clear && ax < r.x + r.w + clear && ay > r.y - clear && ay < r.y + r.h + clear);
    const pref = (prefer[i] ?? (i % 2 ? "br" : "ar")) as Side;
    const order = [pref, ...SIDES.filter((s) => s !== pref)];
    const mults = [1, 1.6, 2.3, 3];
    const tries = mults.flatMap((m) => order.map((sd) => rect(sd, off0 * m)));
    placed.push(tries.find((r) => apart(r) && inside(r) && clearOf(r)) ?? tries.find((r) => apart(r) && inside(r)) ?? tries.find(inside) ?? rect(pref, off0));
  });
  return placed;
};
const nearest = (pill: Pill, p: [number, number]): [number, number] => [Math.max(pill.x, Math.min(pill.x + pill.w, p[0])), Math.max(pill.y, Math.min(pill.y + pill.h, p[1]))];
const PillEl: React.FC<{ pill: Pill; text: string; op?: number; tone?: "ink" | "loss"; leaderTo?: [number, number] }> = ({ pill, text, op = 1, tone = "ink", leaderTo }) => (
  <g opacity={op}>
    {leaderTo ? <line x1={nearest(pill, leaderTo)[0]} y1={nearest(pill, leaderTo)[1]} x2={leaderTo[0]} y2={leaderTo[1]} stroke={P.ink} strokeWidth="4" strokeLinecap="round" /> : null}
    <rect x={pill.x} y={pill.y} width={pill.w} height={pill.h} rx="10" fill={P.receipt} stroke={tone === "loss" ? P.loss : P.ink} strokeWidth={4} />
    <text x={pill.x + pill.w / 2} y={pill.y + 40} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="38" fill={P.ink}>{text}</text>
  </g>
);

const Pin: React.FC<{ x: number; y: number; k: number; tone?: "loss" | "ink" | "gain"; port?: boolean }> = ({ x, y, k, tone = "loss", port }) => {
  const c = tone === "gain" ? P.gain : tone === "ink" ? P.ink : P.loss;
  const q = Easing.out(Easing.back(2.5))(Math.max(0, Math.min(1, k)));
  return (
    <g transform={`translate(${x} ${y}) scale(${q})`}>
      {port ? (
        <>
          <circle r="20" fill={P.receipt} stroke={P.ink} strokeWidth="6" />
          <path d="M0 -12 V10 M-9 -2 H9 M-11 6 Q0 16 11 6" fill="none" stroke={P.ink} strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M0 0 C-22 -26 -22 -44 0 -44 C22 -44 22 -26 0 0 Z" transform="translate(0 -4)" fill={c} stroke={P.ink} strokeWidth="5" strokeLinejoin="round" />
          <circle cy="-36" r="7" fill={P.receipt} stroke={P.ink} strokeWidth="3" />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ PlaceMap */
export type MapPin = Place & { label?: string; tone?: "loss" | "ink" | "gain"; kind?: "pin" | "port"; side?: "ar" | "al" | "br" | "bl" };
/**
 * PlaceMap: animated country / region / city map with zoom-to-place. `from` -> `to` (names like "Panama", "Europe", "Contiguous US", or `bounds`),
 * `highlight` fills regions with the ONE yellow (the key place), `tint` shades supporting regions in ink tints, `pins` pop in staggered with auto-placed
 * 38px paper-pill labels. src="us" draws US states (`places` = state names). detail="50m" for country-level zooms.
 */
export const PlaceMap: React.FC<{ width: number; height: number; src?: Src; from?: MapView; to?: MapView; startFrame?: number; frames?: number; detail?: "110m" | "50m"; highlight?: string[]; tint?: string[]; pins?: MapPin[]; graticule?: boolean; pinStart?: number; centerLon?: number }> = ({ width, height, src = "world", from, to, startFrame = 0, frames = 40, detail, highlight = [], tint = [], pins = [], graticule, pinStart, centerLon }) => {
  const hl = new Set(highlight.map((h) => ALIAS[norm(h)] ?? norm(h)));
  const tn = new Set(tint.map((h) => ALIAS[norm(h)] ?? norm(h)));
  const ps = pinStart ?? frames + 4;
  return (
    <MapCanvas width={width} height={height} src={src} from={from} to={to} startFrame={startFrame} frames={frames} detail={detail ?? (to?.places || to?.bounds ? "50m" : "110m")} graticule={graticule} centerLon={centerLon} push={0.04}
      fillFor={(name) => (hl.has(norm(name)) ? P.highlight : tn.has(norm(name)) ? "#D4CDB9" : undefined)}>
      {({ proj, f, W, H }) => {
        const pts = pins.map((p) => (proj([p.lon, p.lat]) ?? [-999, -999]) as [number, number]);
        const labelled = pins.map((p, i) => (p.label ? i : -1)).filter((i) => i >= 0);
        const pills = placePills(labelled.map((i) => pts[i]), labelled.map((i) => pins[i].label as string), W, H, labelled.map((i) => pins[i].side ?? (undefined as never)), { off: 54 });
        const landed = ps + pins.length * 6 + 14;
        return (
          <g>
            {pins.map((p, i) => {
              const ring = f > landed ? ((f - landed + i * 10) % 50) / 50 : 2;
              return ring < 1 ? <circle key={`r${i}`} cx={pts[i][0]} cy={pts[i][1]} r={18 + ring * 44} fill="none" stroke={P.loss} strokeWidth="5" opacity={1 - ring} /> : null;
            })}
            {pins.map((p, i) => <Pin key={i} x={pts[i][0]} y={pts[i][1]} k={pr(f, ps + i * 6, ps + i * 6 + 8, (x) => x)} tone={p.tone} port={p.kind === "port"} />)}
            {labelled.map((i, j) => <PillEl key={i} pill={pills[j]} text={pins[i].label as string} op={pr(f, ps + i * 6 + 4, ps + i * 6 + 12)} leaderTo={pts[i]} />)}
          </g>
        );
      }}
    </MapCanvas>
  );
};

/* ------------------------------------------------------------------ SeaRoute */
export type RouteDef = { from: Place; to: Place; via?: Place[]; tone?: "ink" | "loss" | "gain"; markers?: number };
/**
 * SeaRoute: trade / shipping routes drawn as great-circle dashed ink lines with ships (or coins) riding them on a loop, ports as pins with
 * auto-placed pills on leaders that keep >= 44px clear of every route line (red is only for the ONE featured route: `tone: "loss"`; others ink). `routes[].via` bends a route through waypoints (e.g. Suez, Panama). `marker` = "ship" (default) | "coin" | "truck".
 * Ride loops every `ride` frames (default 90) after the routes have drawn; markers keep ink halos so they stay readable over borders.
 */
export const SeaRoute: React.FC<{ width: number; height: number; src?: Src; from?: MapView; to?: MapView; startFrame?: number; frames?: number; detail?: "110m" | "50m"; routes: RouteDef[]; marker?: "ship" | "coin" | "truck"; ride?: number; labelPorts?: boolean; centerLon?: number }> = ({ width, height, src = "world", from, to, startFrame = 0, frames = 40, detail, routes, marker = "ship", ride = 90, labelPorts = true, centerLon }) => (
  <MapCanvas width={width} height={height} src={src} from={from} to={to} startFrame={startFrame} frames={frames} detail={detail ?? (to?.places || to?.bounds ? "50m" : "110m")} centerLon={centerLon}>
    {({ proj, f, W, H, path }) => {
      const t0 = frames + 2;
      const portPts: [number, number][] = [], portNames: string[] = [];
      const seen = new Set<string>();
      routes.forEach((r) => [r.from, ...(r.via ?? []).slice(0, 0), r.to].forEach((pl) => { const k = `${pl.lon},${pl.lat}`; if (!seen.has(k)) { seen.add(k); portPts.push((proj([pl.lon, pl.lat]) ?? [-999, -999]) as [number, number]); portNames.push(pl.name ?? ""); } }));
      const named = portNames.map((n, i) => (n ? i : -1)).filter((i) => i >= 0);
      const routeScreen = routes.flatMap((r) => { const wp = [r.from, ...(r.via ?? []), r.to]; const out: [number, number][] = []; for (let k = 0; k < wp.length - 1; k++) { const itp = geoInterpolate([wp[k].lon, wp[k].lat], [wp[k + 1].lon, wp[k + 1].lat]); for (let i = 0; i <= 40; i++) { const q = proj(itp(i / 40)); if (q) out.push(q as [number, number]); } } return out; });
      const pills = placePills(named.map((i) => portPts[i]), named.map((i) => portNames[i]), W, H, [], { off: 54, avoid: routeScreen, clear: 44 });
      return (
        <g>
          {routes.map((r, ri) => {
            const wp = [r.from, ...(r.via ?? []), r.to];
            const samples: [number, number][] = [];
            for (let k = 0; k < wp.length - 1; k++) {
              const itp = geoInterpolate([wp[k].lon, wp[k].lat], [wp[k + 1].lon, wp[k + 1].lat]);
              for (let i = k ? 1 : 0; i <= 40; i++) samples.push(itp(i / 40));
            }
            const line = { type: "LineString", coordinates: samples } as GeoJSON.LineString;
            const d = path(line) ?? "";
            const c = r.tone === "loss" ? P.loss : P.ink;
            const draw = pr(f, t0 + ri * 6, t0 + ri * 6 + 26, Easing.inOut(Easing.cubic));
            const scr = samples.map((s) => proj(s) as [number, number]);
            const n = r.markers ?? 2;
            return (
              <g key={ri}>
                <path d={d} fill="none" stroke={P.receipt} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity=".9" />
                <path d={d} fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray={`0.02 0.012`} strokeDashoffset={-((f * 0.0006) % 0.032)} opacity={draw >= 1 ? 1 : 0} />
                <path d={d} fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={draw >= 1 ? 0 : 1} />
                {draw >= 1 ? Array.from({ length: n }, (_, k) => {
                  const u = ((((f - t0 - 32) / ride + k / n) % 1) + 1) % 1;
                  const idx = u * (scr.length - 1), i0 = Math.floor(idx), i1 = Math.min(scr.length - 1, i0 + 1), fr = idx - i0;
                  const [x0, y0] = scr[i0], [x1, y1] = scr[i1];
                  const x = x0 + (x1 - x0) * fr, y = y0 + (y1 - y0) * fr;
                  let ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
                  const flip = Math.abs(ang) > 90;
                  if (flip) ang += 180;
                  return (
                    <g key={k} transform={`translate(${x} ${y}) rotate(${ang}) scale(${flip ? -1 : 1} 1)`} opacity={Math.min(1, u * 8, (1 - u) * 8)}>
                      {marker === "coin" ? (
                        <><circle r="22" fill={P.highlight} stroke={P.ink} strokeWidth="6" /><text y="9" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="26" fill={P.ink}>$</text></>
                      ) : marker === "truck" ? (
                        <g transform="scale(1.4)"><g stroke={P.receipt} strokeWidth="9" strokeLinejoin="round" fill={P.receipt}><rect x="-22" y="-14" width="26" height="22" /><path d="M4 -6 H14 L20 2 V8 H4 Z" /></g><rect x="-22" y="-14" width="26" height="22" fill={P.receipt} stroke={P.ink} strokeWidth="4" /><path d="M4 -6 H14 L20 2 V8 H4 Z" fill={P.ink} stroke={P.ink} strokeWidth="3" strokeLinejoin="round" /><circle cx="-12" cy="9" r="5" fill={P.ink} stroke={P.receipt} strokeWidth="2" /><circle cx="12" cy="9" r="5" fill={P.ink} stroke={P.receipt} strokeWidth="2" /></g>
                      ) : (
                        <g transform="scale(2.2)">
                          <path d="M-26 0 H26 L18 14 H-18 Z" fill={P.receipt} stroke={P.receipt} strokeWidth="10" strokeLinejoin="round" />
                          <rect x="-14" y="-14" width="8" height="14" fill={P.loss} stroke={P.ink} strokeWidth="3" /><rect x="-4" y="-14" width="8" height="14" fill={P.ink} stroke={P.ink} strokeWidth="3" /><rect x="6" y="-14" width="8" height="14" fill={P.highlight} stroke={P.ink} strokeWidth="3" />
                          <path d="M-26 0 H26 L18 14 H-18 Z" fill={P.ink} stroke={P.ink} strokeWidth="3" strokeLinejoin="round" />
                        </g>
                      )}
                    </g>
                  );
                }) : null}
              </g>
            );
          })}
          {portPts.map((p, i) => <Pin key={i} x={p[0]} y={p[1]} k={pr(f, t0 + i * 4, t0 + i * 4 + 8, (x) => x)} port />)}
          {labelPorts ? named.map((i, j) => <PillEl key={i} pill={pills[j]} text={portNames[i]} op={pr(f, t0 + i * 4 + 4, t0 + i * 4 + 12)} leaderTo={portPts[i]} />) : null}
        </g>
      );
    }}
  </MapCanvas>
);

/* ------------------------------------------------------------------ Choropleth */
const RAMP = ["#EFE9D9", "#D2CAB4", "#A59C86", "#6B665A"]; // paper -> muted ink: no new hues; the single top region is yellow
/**
 * Choropleth: money by region. `data` = [{name, value}] (country names for src="world", state names for src="us"). Regions reveal from low to high
 * value (the build), the TOP region turns the one yellow with a pulse (the post-build beat) and gets a value pill; a bare legend (low/high labels,
 * 36px mono) sits at the bottom. `fmt` formats the values (units live there, e.g. v => `$${v}B`: pass sourced numbers only).
 */
export const Choropleth: React.FC<{ width: number; height: number; src?: Src; from?: MapView; to?: MapView; startFrame?: number; frames?: number; detail?: "110m" | "50m"; data: { name: string; value: number }[]; fmt?: (v: number) => string; topN?: number; legend?: [string, string]; centerLon?: number }> = ({ width, height, src = "world", from, to, startFrame = 0, frames = 40, detail, data, fmt = (v) => String(v), topN = 1, legend, centerLon }) => {
  const sorted = [...data].sort((a, b) => a.value - b.value);
  const lo = sorted[0]?.value ?? 0, hi = sorted[sorted.length - 1]?.value ?? 1;
  const rank = new Map(sorted.map((d, i) => [norm(ALIAS[norm(d.name)] ?? d.name), i]));
  const val = new Map(sorted.map((d) => [norm(ALIAS[norm(d.name)] ?? d.name), d.value]));
  const top = new Set(sorted.slice(-topN).map((d) => norm(ALIAS[norm(d.name)] ?? d.name)));
  return (
    <MapCanvas width={width} height={height} src={src} from={from} to={to} startFrame={startFrame} frames={frames} detail={detail ?? (to?.places || to?.bounds ? "50m" : "110m")} centerLon={centerLon}
      fillFor={(name) => {
        const k = norm(name);
        if (!val.has(k)) return undefined;
        return undefined;
      }}>
      {({ proj, path, f, W, H }) => {
        const feats = src === "us" ? usFeatures : worldFeatures(detail ?? (to?.places || to?.bounds ? "50m" : "110m"));
        const t0 = frames + 2;
        const n = sorted.length;
        const topPulse = f > t0 + n * 3 + 14 ? Math.max(0, 1 - Math.abs(f - (t0 + n * 3 + 22)) / 8) : 0;
        const labelled = feats.filter((ft) => top.has(norm(String((ft.properties as { name?: string })?.name ?? ""))));
        const pts = labelled.map((ft) => path.centroid(ft) as [number, number]);
        const texts = labelled.map((ft) => `${String((ft.properties as { name?: string })?.name)} ${fmt(val.get(norm(String((ft.properties as { name?: string })?.name))) ?? 0)}`);
        const pills = placePills(pts, texts, W, H, ["al"], { off: 90 });
        return (
          <g>
            {feats.map((ft, i) => {
              const name = norm(String((ft.properties as { name?: string })?.name ?? ""));
              if (!rank.has(name)) return null;
              const r = rank.get(name) as number;
              const on = pr(f, t0 + r * 3, t0 + r * 3 + 10);
              if (on <= 0) return null;
              const v = val.get(name) as number;
              const lvl = hi === lo ? 3 : Math.min(3, Math.floor(((v - lo) / (hi - lo)) * 3.999));
              const isTop = top.has(name) && f > t0 + n * 3 + 10;
              return <path key={i} d={path(ft) ?? ""} fill={isTop ? P.highlight : RAMP[lvl]} stroke={P.ink} strokeWidth={isTop ? 4 + 3 * topPulse : 2.4} strokeLinejoin="round" opacity={on} />;
            })}
            {labelled.map((ft, j) => <PillEl key={j} pill={pills[j]} text={texts[j]} op={pr(f, t0 + n * 3 + 12, t0 + n * 3 + 22)} leaderTo={pts[j]} />)}
            <g opacity={pr(f, t0, t0 + 12)}>
              {RAMP.map((c, i) => <rect key={i} x={40 + i * 64} y={H - 110} width="64" height="32" fill={c} stroke={P.ink} strokeWidth="3" />)}
              <rect x={40 + 4 * 64 + 20} y={H - 110} width="64" height="32" fill={P.highlight} stroke={P.ink} strokeWidth="3" />
              <text x="40" y={H - 38} fontFamily={`'${MONO}'`} fontWeight="700" fontSize="34" fill={P.ink}>{legend?.[0] ?? "LOW"}</text>
              <text x={40 + 256} y={H - 38} textAnchor="end" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="34" fill={P.ink}>{legend?.[1] ?? "HIGH"}</text>
              <text x={40 + 4 * 64 + 52} y={H - 38} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="34" fill={P.ink}>TOP</text>
            </g>
          </g>
        );
      }}
    </MapCanvas>
  );
};

/* ------------------------------------------------------------------ ReceiptPin */
/**
 * ReceiptPin: "receipt pinned to a map" callout for the hero number. A receipt (torn bottom, mono lines, the hero on the one yellow plate)
 * hangs from a pin at `anchor` (lon/lat) with a taped leader line; it pops with a settle wobble after the camera lands and the hero plate pulses.
 * `side` = preferred place of the receipt relative to the pin ("right" | "left" | "above" | "below"): it tries the other sides if the preferred one would not fit inside the canvas, so the pin is never covered. lines: [{label, value}].
 */
export const ReceiptPin: React.FC<{ width: number; height: number; src?: Src; from?: MapView; to?: MapView; startFrame?: number; frames?: number; detail?: "110m" | "50m"; highlight?: string[]; anchor: Place; title?: string; lines: { label: string; value: string }[]; hero: string; heroLabel?: string; side?: "right" | "left" | "above" | "below"; centerLon?: number }> = ({ width, height, src = "world", from, to, startFrame = 0, frames = 40, detail, highlight = [], anchor, title = "LINE ITEM", lines, hero, heroLabel, side = "right", centerLon }) => {
  const hl = new Set(highlight.map((h) => ALIAS[norm(h)] ?? norm(h)));
  return (
    <MapCanvas width={width} height={height} src={src} from={from} to={to} startFrame={startFrame} frames={frames} detail={detail ?? (to?.places || to?.bounds ? "50m" : "110m")} centerLon={centerLon} fillFor={(n) => (hl.has(norm(n)) ? "#E4DCC6" : undefined)}>
      {({ proj, f, W, H }) => {
        const [ax, ay] = (proj([anchor.lon, anchor.lat]) ?? [W / 2, H / 2]) as [number, number];
        const t0 = frames + 4;
        const k = Easing.out(Easing.back(2))(pr(f, t0, t0 + 10, (x) => x));
        const wob = f > t0 + 10 ? 2.5 * Math.exp(-(f - t0 - 10) / 7) * Math.cos((f - t0) / 2.2) : 0;
        const pulse = f > t0 + 24 ? Math.max(0, 1 - Math.abs(f - (t0 + 32)) / 8) : 0;
        const rw = 440, lh = 54, rh = 150 + lines.length * lh + (heroLabel ? 160 : 110);
        const cand = (sd: "right" | "left" | "above" | "below") => ({ x: sd === "right" ? ax + 90 : sd === "left" ? ax - 90 - rw : ax - rw / 2, y: sd === "above" ? ay - 90 - rh : sd === "below" ? ay + 90 : ay - rh / 2 });
        const fits = (c: { x: number; y: number }) => c.x >= 16 && c.x + rw <= W - 16 && c.y >= 16 && c.y + rh <= H - 16;
        const order = [side, ...(["right", "left", "above", "below"] as const).filter((x) => x !== side)];
        const pick = order.map(cand).find(fits) ?? cand(side);
        const rx = Math.max(16, Math.min(W - rw - 16, pick.x)), ry = Math.max(16, Math.min(H - rh - 16, pick.y));
        const cx = rx + rw / 2, cy = ry + 22;
        const zz = Array.from({ length: 17 }, (_, i) => `${rx + (i * rw) / 16},${ry + rh + (i % 2 ? 0 : 18)}`).join(" ");
        return (
          <g>
            <circle cx={ax} cy={ay} r={14 + 26 * pr(f, t0 - 6, t0 + 12)} fill="none" stroke={P.loss} strokeWidth="6" opacity={1 - pr(f, t0, t0 + 14)} />
            <path d={`M${ax} ${ay} L${cx} ${cy}`} stroke={P.ink} strokeWidth="6" strokeLinecap="round" strokeDasharray="1 16" opacity={k} />
            <circle cx={ax} cy={ay} r={16 * k} fill={P.loss} stroke={P.ink} strokeWidth="6" />
            <g transform={`translate(${rx + rw / 2} ${ry}) rotate(${(1 - k) * -8 + wob}) scale(${0.6 + 0.4 * k}) translate(${-(rx + rw / 2)} ${-ry})`} opacity={Math.min(1, k * 3)}>
              <polygon points={`${rx + 10},${ry + 12} ${rx + rw + 10},${ry + 12} ${rx + rw + 10},${ry + rh + 12} ${zz.split(" ").map((p) => { const [x, y] = p.split(","); return `${Number(x) + 10},${Number(y) + 12}`; }).reverse().join(" ")} ${rx + 10},${ry + rh + 12}`} fill={P.ink} opacity=".2" />
              <polygon points={`${rx},${ry} ${rx + rw},${ry} ${rx + rw},${ry + rh} ${zz.split(" ").reverse().join(" ")} ${rx},${ry + rh}`} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" />
              <circle cx={cx} cy={cy} r="13" fill={P.loss} stroke={P.ink} strokeWidth="5" />
              <text x={cx} y={ry + 84} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" letterSpacing="8" fill={P.muted}>{title}</text>
              {lines.map((l, i) => (
                <g key={i}>
                  <text x={rx + 28} y={ry + 148 + i * lh} fontFamily={`'${MONO}'`} fontWeight="500" fontSize="36" fill={P.ink}>{l.label}</text>
                  <text x={rx + rw - 28} y={ry + 148 + i * lh} textAnchor="end" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" fill={P.ink}>{l.value}</text>
                </g>
              ))}
              <g transform={`translate(${cx} ${ry + 160 + lines.length * lh}) scale(${1 + 0.05 * pulse})`}>
                <rect x={-196} y={-6} width="392" height="96" fill={P.highlight} />
                <text x="0" y="74" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="86" fill={P.ink}>{hero}</text>
              </g>
              {heroLabel ? <text x={cx} y={ry + rh - 4} textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="36" fill={P.ink}>{heroLabel}</text> : null}
            </g>
          </g>
        );
      }}
    </MapCanvas>
  );
};

/* ------------------------------------------------------------------ PaperMapBg */
/**
 * PaperMapBg: a flat paper-map texture for scenes without a data map: cream paper, faint country outlines (~7% ink) and a graticule drifting
 * slowly (12 px/s), soft fold creases, a corner scale bar. No labels, no yellow: safe behind captions and plates. `view` frames the geography
 * (default whole world), `dark` for night interludes. Full-bleed: mount it as the scene background (it draws PaperBg itself).
 */
export const PaperMapBg: React.FC<{ width: number; height: number; view?: MapView; dark?: boolean; seed?: number }> = ({ width: W, height: H, view, dark, seed = 1 }) => {
  const f = useCurrentFrame();
  const a = React.useMemo(() => fitView("world", view ?? { bounds: [[-170, -55], [170, 78]], pad: -W * 0.35 }, W, H, "110m"), [view, W, H]);
  const s = a.s * 1.25;
  const drift = f * 0.4;
  const proj = geoNaturalEarth1().scale(s).translate([W / 2 - s * a.ux - drift, H / 2 - s * a.uy + 120]);
  const path = geoPath(proj);
  const ink = dark ? "244,239,228" : "20,19,15";
  const grat = React.useMemo(() => geoGraticule10(), []);
  const feats = worldFeatures("110m");
  const folds = [0.33, 0.66].map((y, i) => ({ y: y * H + (seed + i) * 7 }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <PaperBg dark={dark} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={path(grat) ?? ""} fill="none" stroke={`rgba(${ink},.10)`} strokeWidth="2" />
        {feats.map((ft, i) => <path key={i} d={path(ft) ?? ""} fill={`rgba(${ink},.045)`} stroke={`rgba(${ink},.16)`} strokeWidth="2" strokeLinejoin="round" />)}
        {folds.map((fd, i) => <g key={i}><rect x="0" y={fd.y} width={W} height="46" fill={`rgba(${ink},.04)`} /><line x1="0" x2={W} y1={fd.y} y2={fd.y} stroke={`rgba(${ink},.12)`} strokeWidth="2" /></g>)}
        <g transform={`translate(60 ${H - 90})`} opacity=".6">
          <rect width="200" height="14" fill="none" stroke={`rgb(${ink})`} strokeWidth="3" /><rect width="100" height="14" fill={`rgb(${ink})`} />
          <text y="-10" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="28" fill={`rgb(${ink})`}>0   500   1000 KM</text>
        </g>
      </svg>
    </div>
  );
};

/**
 * MapDisclaimer: "BOUNDARIES ARE ILLUSTRATIVE" line (>=30px mono, muted ink). Natural Earth draws de-facto boundaries incl. disputed areas
 * (Kashmir, Crimea, Western Sahara, Taiwan, Cyprus, Israel/Palestine). RULE: never label, highlight or route through a disputed territory unless the
 * script is about it, and show this line on every map scene that shows borders. Place it inside the hard box (x60-920), e.g. bottom of the map.
 */
export const MapDisclaimer: React.FC<{ width?: number; dark?: boolean }> = ({ width = 860, dark }) => (
  <div style={{ width, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: dark ? "rgba(244,239,228,.7)" : P.muted }}>BOUNDARIES ARE ILLUSTRATIVE</div>
);
