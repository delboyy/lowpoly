import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import worldTopo from "world-atlas/countries-50m.json";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { StudioEnv } from "../kit3d/Airliner";

// Line Item "3D map comparison" (2026-10-26). Research: country-vs-country 3D map Shorts (Shivang Verse: median 143k).
// Real Natural Earth geometry (world-atlas 50m, public domain). Camera flies stop to stop; each stop's country rises
// as a block sized to its value and stays up; the last scene pulls back to show every block.
export type MapStop = { id: string; name: string; value: number; text: string; color?: string };
export type MapScene = Timed & { stop?: number; wide?: boolean };
export type MapProps = BaseResolved<MapScene> & { topHook?: string; stops: MapStop[]; unitNote?: string; hookVs?: [number, number] };

const BG = "#9FD3F5"; // sky/sea
const SEA = "#4FA3DE";
const LAND = "#EADFC4";
const PALETTE = ["#FF6B6B", "#FFB84D", "#4CD07D", "#4DA3FF", "#B57BFF", "#FF5FA2", "#2EC4B6"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const SCALE = 0.012; // projected px -> world units
const proj = geoNaturalEarth1().scale(250).translate([0, 0]);

type CountryGeo = { id: string; shapes: THREE.Shape[]; centroid: THREE.Vector2; area: number };

const useCountries = () =>
  useMemo(() => {
    const fc = feature(worldTopo as unknown as Topology, (worldTopo as any).objects.countries) as any;
    const out: CountryGeo[] = [];
    for (const f of fc.features) {
      const polys: number[][][][] = f.geometry?.type === "Polygon" ? [f.geometry.coordinates] : f.geometry?.type === "MultiPolygon" ? f.geometry.coordinates : [];
      const shapes: THREE.Shape[] = [];
      let cx = 0, cy = 0, n = 0, area = 0;
      for (const poly of polys) {
        const ring = poly[0].map(([lon, lat]) => proj([lon, lat])!).filter(Boolean);
        if (ring.length < 4) continue;
        const pts = ring.map(([x, y]) => new THREE.Vector2(x * SCALE, -y * SCALE));
        const s = new THREE.Shape(pts);
        for (const hole of poly.slice(1)) {
          const h = hole.map(([lon, lat]) => proj([lon, lat])!).map(([x, y]) => new THREE.Vector2(x * SCALE, -y * SCALE));
          if (h.length > 3) s.holes.push(new THREE.Path(h));
        }
        const a = Math.abs(THREE.ShapeUtils.area(pts));
        shapes.push(s);
        area += a;
        pts.forEach((p) => { cx += p.x * a; cy += p.y * a; n += a; });
      }
      if (!shapes.length) continue;
      out.push({ id: String(f.id), shapes, centroid: new THREE.Vector2(cx / n, cy / n), area });
    }
    return out;
  }, []);

const Country: React.FC<{ g: CountryGeo; h: number; color: string; top?: boolean }> = ({ g, h, color, top }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(g.shapes, { depth: 1, bevelEnabled: false, curveSegments: 1 }), [g]);
  return (
    // extrude along +z in shape space; rotate so z points up (y) and the map lies on the ground
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, Math.max(0.02, h)]} position={[0, 0, 0]} castShadow={!!top}>
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} flatShading />
    </mesh>
  );
};

const Rig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3 }> = ({ pos, look }) => {
  const { camera } = useThree();
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

export const MapCompare3D: React.FC<MapProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const t = f / fps;
  const countries = useCountries();
  const byId = useMemo(() => new Map(countries.map((c) => [c.id, c])), [countries]);
  const maxV = Math.max(...p.stops.map((s) => s.value));
  const H = 0.95; // world height of the tallest block

  const idx = Math.max(0, p.scenes.findIndex((s, i) => ms >= s.startMs && (i === p.scenes.length - 1 || ms < p.scenes[i + 1].startMs)));
  const sc = p.scenes[idx];
  const prev = p.scenes[Math.max(0, idx - 1)];
  const local = f - Math.round((sc.startMs / 1000) * fps);
  const move = idx === 0 ? 1 : ease(interpolate(local, [0, 22], [0, 1], clamp));

  // camera targets: wide = whole-world view centred on the stops; stop = close tilted view over the country
  const stopCentroid = (i: number) => {
    const c = byId.get(p.stops[i].id);
    return c ? new THREE.Vector3(c.centroid.x, 0, -c.centroid.y) : new THREE.Vector3();
  };
  const all = p.stops.map((_, i) => stopCentroid(i));
  const mid = all.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, all.length));
  const target = (s: MapScene) => (s.wide || s.stop === undefined ? { look: mid.clone(), cam: mid.clone().add(new THREE.Vector3(0, 9.5, 8.5)) } : { look: stopCentroid(s.stop).add(new THREE.Vector3(0, 0.2, -0.6)), cam: stopCentroid(s.stop).add(new THREE.Vector3(0.5, 5.2, 5.4)) });
  const A = target(prev);
  const B = target(sc);
  const look = A.look.lerp(B.look, move);
  const cam = A.cam.lerp(B.cam, move);
  // arc the camera up mid-flight and drift slowly while parked
  cam.y += Math.sin(Math.PI * move) * (idx === 0 ? 0 : 2.2);
  // parked: slow orbit + dolly so no hold reads as static (QA ve-v32: >2 s static = fail)
  const sceneFrames = Math.max(1, Math.round((sc.durationMs / 1000) * fps));
  const park = interpolate(local, [0, sceneFrames], [0, 1], clamp);
  const orbit = (park - 0.5) * 0.5 + Math.sin(t * 0.7) * 0.08;
  const off = cam.clone().sub(look);
  off.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit);
  off.multiplyScalar(1 - park * 0.12);
  cam.copy(look.clone().add(off));
  const intro = interpolate(f, [0, 30], [1, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  cam.y += intro * 6;

  // rise per stop: starts when its scene starts; stays up afterwards
  const rise = (i: number) => {
    const s = p.scenes.find((x) => x.stop === i);
    if (!s) return 0;
    return spring({ frame: f - Math.round((s.startMs / 1000) * fps) - 8, fps, config: { damping: 12, stiffness: 120, mass: 0.8 } });
  };
  const stopIds = new Set(p.stops.map((s) => s.id));
  const cur = sc.stop !== undefined ? p.stops[sc.stop] : undefined;
  const tagK = cur ? spring({ frame: local - 14, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } }) : 0;

  const sfx: SfxCue[] = p.scenes.flatMap((s) => (s.stop !== undefined ? [{ atMs: s.startMs + 280, src: "impact-punch-heavy", volume: 0.28 }, { atMs: s.startMs, src: "pixabay-whoosh-short", volume: 0.2 }] : s.wide ? [{ atMs: s.startMs, src: "pixabay-whoosh-cinematic", volume: 0.22 }] : []));

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 10, 10] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}>
        <color attach="background" args={[BG]} />
        <Rig pos={cam} look={look} />
        <StudioEnv intensity={0.6} />
        <hemisphereLight args={["#FFFFFF", "#7FB0D8", 0.9]} />
        <directionalLight position={[6, 12, 8]} intensity={2.4} />
        <directionalLight position={[-8, 6, -4]} intensity={0.6} color="#FFE7C2" />
        <fog attach="fog" args={[SEA, 18, 42]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={SEA} roughness={0.9} />
        </mesh>
        {countries.map((c) =>
          stopIds.has(c.id) ? null : <Country key={c.id} g={c} h={0.04} color={LAND} />,
        )}
        {p.stops.map((s, i) => {
          const c = byId.get(s.id);
          if (!c) return null;
          const h = 0.04 + (s.value / maxV) * H * rise(i);
          return <Country key={s.id} g={c} h={h} color={s.color ?? PALETTE[i % PALETTE.length]} top />;
        })}
      </ThreeCanvas>

      {/* opening face-off: cheapest vs dearest, lands in the first second */}
      {(idx === 0 || (sc.wide && idx === p.scenes.length - 1)) && p.hookVs ? (
        <div style={{ position: "absolute", left: 70, right: 160, top: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {p.hookVs.map((si, k) => {
            const s = p.stops[si];
            const kk = spring({ frame: (idx === 0 ? f : local) - 4 - k * 7, fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
            return (
              <div key={si} style={{ width: 370, background: "#fff", borderRadius: 26, padding: "16px 10px 8px", textAlign: "center", boxShadow: "0 18px 40px rgba(0,0,0,.25)", borderBottom: `10px solid ${s.color ?? PALETTE[si % PALETTE.length]}`, transform: `translateX(${(1 - kk) * (k ? 40 : -40)}px) scale(${0.85 + 0.15 * kk}) translateY(${Math.sin(t * 2.2 + k * 1.7) * 10}px) rotate(${(1 - kk) * (k ? 6 : -6) + Math.sin(t * 1.6 + k) * 1.2}deg)`, opacity: Math.max(0, Math.min(1, (kk - 0.25) / 0.5)) }}>
                <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 40, color: "#1B2236" }}>{s.name.toUpperCase()}</div>
                <div style={{ fontFamily: FONT.anton, fontSize: 150, lineHeight: 1.02, color: "#111" }}>{s.text}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 95, textAlign: "center", fontFamily: FONT.anton, fontSize: 90, color: "#FFD21F", textShadow: "0 6px 0 #111, 0 10px 30px rgba(0,0,0,.4)", transform: `scale(${spring({ frame: (idx === 0 ? f : local) - 16, fps, config: { damping: 9, stiffness: 220 } })})` }}>VS</div>
        </div>
      ) : null}

      {/* price tag for the current stop */}
      {cur ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", transform: `scale(${0.5 + 0.5 * tagK})`, opacity: tagK }}>
          <div style={{ display: "inline-block", background: "#fff", borderRadius: 26, padding: "18px 40px 10px", boxShadow: "0 18px 40px rgba(0,0,0,.25)", borderBottom: `10px solid ${cur.color ?? PALETTE[(sc.stop ?? 0) % PALETTE.length]}` }}>
            <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 52, color: "#1B2236", letterSpacing: 2 }}>{cur.name.toUpperCase()}</div>
            <div style={{ fontFamily: FONT.anton, fontSize: 190, lineHeight: 1.02, color: "#111" }}>{cur.text}</div>
          </div>
        </div>
      ) : null}

      {p.topHook ? (
        <div style={{ position: "absolute", top: 290, left: 60, right: 160, padding: "16px 24px", background: "#111", borderLeft: "10px solid #FFD21F", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: "#fff", textTransform: "uppercase" }}>{p.topHook}</div>
      ) : null}
      {p.unitNote ? <div style={{ position: "absolute", bottom: 110, left: 60, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 26, color: "rgba(17,17,17,.7)" }}>{p.unitNote}</div> : null}
      <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(17,17,17,.6)" }}>LINE ITEM</div>
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={74} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
