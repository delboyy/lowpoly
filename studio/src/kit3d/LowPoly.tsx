import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Caption } from "@remotion/captions";
import { FONT } from "../lib/fonts";

// Shared low-poly story kit (2026-10-27). Nathan approved the low-poly penny format; every story reuses this world,
// camera rig, number plates and hook bar so new videos are just a station list + a few props.

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const wordMs = (caps: Caption[], re: RegExp, fromMs: number, fallback: number) => caps.find((c) => c.startMs >= fromMs - 50 && re.test(c.text))?.startMs ?? fallback;

export type Palette = { skyTop: string; skyBot: string; ground: string; accent: string; ink: string };
export type V3 = [number, number, number];

/**
 * pastel sky, faceted ground, lit like a toy diorama.
 * v2 look (Nathan approved 2026-10-30): warm key that follows the camera's subject (the v1 key aimed at the world origin,
 * so far stations were lit edge-on and white panels read as grey slabs, and their shadows fell outside the shadow map),
 * cool sky fill, a cool rim from behind so figures separate from the ground, a darker ground so props pop, fog pushed back.
 * `v1` reproduces the old lighting exactly.
 */
export const LowPolyWorld: React.FC<{ pal: Palette; cam: THREE.Vector3; look: THREE.Vector3; groundAt?: V3; v1?: boolean; scenery?: boolean }> = ({ pal, cam, look, groundAt = [10, -0.2, -4], v1 = false, scenery = true }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 50, 45, 25);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, (rnd(i) - 0.5) * 0.35);
    g.computeVertexNormals();
    return g;
  }, []);
  // v2 ground: every facet gets its own small light/hue shift, so the floor reads as hand-cut low-poly, not flat paint
  const groundV2 = useMemo(() => {
    const g = geo.toNonIndexed();
    const base = new THREE.Color(pal.ground);
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);
    const cols = new Float32Array(g.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let tri = 0; tri < cols.length / 9; tri++) {
      c.setHSL(hsl.h + (rnd(tri + 7) - 0.5) * 0.03, Math.min(1, hsl.s * 1.05), hsl.l * (0.8 + rnd(tri) * 0.1));
      for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], tri * 9 + k * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [geo, pal.ground]);
  const ortho = !!(useThree((st) => st.camera) as THREE.OrthographicCamera).isOrthographicCamera;
  if (v1) {
    return (
      <>
        <color attach="background" args={[pal.skyTop]} />
        <fog attach="fog" args={[pal.skyBot, 14, 36]} />
        <Rig pos={cam} look={look} />
        <hemisphereLight args={[pal.skyTop, pal.skyBot, 1.1]} />
        <directionalLight position={[look.x + 5, 9, 6]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
        <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={groundAt} receiveShadow>
          <meshStandardMaterial color={pal.ground} flatShading roughness={0.95} />
        </mesh>
      </>
    );
  }
  return (
    <>
      <color attach="background" args={[pal.skyBot]} />
      <fog attach="fog" args={ortho ? [pal.skyBot, 80, 130] : [pal.skyBot, 30, 70]} />
      <ToneMap />
      <Rig pos={cam} look={look} />
      <SkyDome top={pal.skyTop} horizon={pal.skyBot} at={cam} />
      <hemisphereLight args={["#DCEBFF", "#8C7A6A", 0.85]} />
      <Sun at={look} pos={[4.5, 9, 7]} color="#FFE1B5" intensity={3.0} shadow />
      <Sun at={look} pos={[-3, 5, -8]} color="#BFD6FF" intensity={1.6} />
      <mesh geometry={groundV2} rotation={[-Math.PI / 2, 0, 0]} position={groundAt} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      {scenery ? <Scenery /> : null}
    </>
  );
};

/** v2: neutral tone mapping keeps the pastels saturated (r3f's default ACES greys them out) */
const ToneMap: React.FC = () => {
  const { gl } = useThree();
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 1.0;
  return null;
};

/** v2 sky: a big gradient dome (horizon colour low, deeper colour overhead) instead of a flat fill */
const SkyDome: React.FC<{ top: string; horizon: string; at: THREE.Vector3 }> = ({ top, horizon, at }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(150, 24, 16);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const a = new THREE.Color(horizon), b = new THREE.Color(top), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 150;
      c.copy(a).lerp(b, Math.pow(Math.max(0, y + 0.05), 0.6));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, [top, horizon]);
  return (
    <mesh geometry={geo} position={[at.x, 0, at.z]}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

/**
 * v2 backdrop: rolling hills, tree clumps and clouds behind the stations (z <= -14), so no shot ends in an empty
 * horizon. Deterministic (rnd), static, and generic so every story can use it. Pass scenery={false} for indoor worlds.
 */
const HILLS = ["#8CC084", "#6FAE7A", "#A9CF8C", "#5E9C78"];
const LEAVES = ["#4E9A5E", "#6DB56A", "#3F8A63", "#8BC46A", "#E59A5B"];
export const Scenery: React.FC<{ x0?: number; x1?: number }> = ({ x0 = -30, x1 = 60 }) => {
  const items = useMemo(() => {
    const hills = Array.from({ length: 14 }).map((_, i) => ({ x: x0 + ((x1 - x0) * (i + rnd(i) * 0.6)) / 14, z: -30 - rnd(i + 3) * 8, s: 7 + rnd(i + 5) * 6, h: 0.35 + rnd(i + 9) * 0.25, c: HILLS[i % HILLS.length] }));
    const trees = Array.from({ length: 46 }).map((_, i) => ({ x: x0 + rnd(i + 40) * (x1 - x0), z: -14 - rnd(i + 80) * 12, s: 0.8 + rnd(i + 120) * 0.9, c: LEAVES[Math.floor(rnd(i + 160) * LEAVES.length)], round: rnd(i + 200) > 0.55 }));
    const clouds = Array.from({ length: 12 }).map((_, i) => ({ x: x0 + ((x1 - x0) * i) / 12 + rnd(i + 300) * 4, y: 11 + rnd(i + 330) * 5, z: -26 - rnd(i + 360) * 10, s: 1.2 + rnd(i + 390) * 1.4 }));
    return { hills, trees, clouds };
  }, [x0, x1]);
  return (
    <group>
      {items.hills.map((h, i) => (
        <mesh key={`h${i}`} position={[h.x, -0.6, h.z]} scale={[h.s, h.s * h.h, h.s * 0.6]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={h.c} flatShading roughness={1} />
        </mesh>
      ))}
      {items.trees.map((t, i) => (
        <group key={`t${i}`} position={[t.x, -0.2, t.z]} scale={t.s}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 0.8, 5]} />
            <meshStandardMaterial color="#8A5A3C" flatShading />
          </mesh>
          <mesh position={[0, t.round ? 1.25 : 1.45, 0]} castShadow>
            {t.round ? <icosahedronGeometry args={[0.65, 0]} /> : <coneGeometry args={[0.6, 1.6, 6]} />}
            <meshStandardMaterial color={t.c} flatShading />
          </mesh>
        </group>
      ))}
      {items.clouds.map((c, i) => (
        <group key={`c${i}`} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[-0.9, 0, 0, 0.8], [0, 0.25, 0, 1.1], [0.95, 0, 0.1, 0.75]].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]}>
              <icosahedronGeometry args={[r, 0]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.35} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

/** directional light whose target follows the subject, so every station gets the same 3/4 light and in-range shadows */
const Sun: React.FC<{ at: THREE.Vector3; pos: V3; color: string; intensity: number; shadow?: boolean }> = ({ at, pos, color, intensity, shadow }) => {
  const light = useMemo(() => new THREE.DirectionalLight(), []);
  light.color.set(color);
  light.intensity = intensity;
  light.position.set(at.x + pos[0], at.y + pos[1], at.z + pos[2]);
  light.target.position.copy(at);
  light.target.updateMatrixWorld();
  if (shadow) {
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.radius = 3;
    light.shadow.bias = -0.0005;
    light.shadow.normalBias = 0.02;
    Object.assign(light.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 0.5, far: 40 });
    light.shadow.camera.updateProjectionMatrix();
  }
  return <primitive object={light} />;
};

/** soft edge darkening over the 3D layer (DOM, cheap); draws the eye to the centre */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.22 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(40,24,16,${strength}) 100%)` }} />
);

/** iso view direction (format test, 2026-10-30): 30° yaw, 35° elevation, a "toy diorama" angle that still shows facades */
const ISO_DIR = new THREE.Vector3(Math.cos(0.61) * Math.sin(0.52), Math.sin(0.61), Math.cos(0.61) * Math.cos(0.52)).normalize();

const Rig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3 }> = ({ pos, look }) => {
  const { camera, size } = useThree();
  if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
    // keep each station's framing: an ortho frame as tall as the fov-40 perspective frame at the same distance
    const cam = camera as THREE.OrthographicCamera;
    const d = pos.distanceTo(look);
    cam.position.copy(look).addScaledVector(ISO_DIR, 60);
    cam.near = 0.1;
    cam.far = 400;
    cam.zoom = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * d);
    cam.lookAt(look);
    cam.updateProjectionMatrix();
    return null;
  }
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

/** camera path: glides station to station, then orbits/dollies while parked (no static holds) */
export const storyCamera = <S extends string, Sc extends { startMs: number; durationMs: number; state: S }>(opts: {
  f: number; fps: number; scenes: Sc[]; POS: Record<S, V3>; CAM: Record<S, V3>;
  /** seamless loop (Nathan 2026-10-28): total frames of the video; the camera ends on the exact first-frame pose */
  loopFrames?: number;
  /** v2: frames where a number lands; the camera punches in ~10% and eases back (no linger at the loop point) */
  punches?: number[];
}) => {
  const { f, fps, scenes, POS, CAM, loopFrames, punches = [] } = opts;
  const T = loopFrames ?? 0;
  // idle drift: periodic over the whole video when looping, so frame T == frame 0
  const wob = (fr: number, k: number, fallbackHz: number) => (T ? Math.sin((2 * Math.PI * k * fr) / T) : Math.sin((fr / fps) * fallbackHz));
  const v = (a: V3) => new THREE.Vector3(...a);
  const sceneAt = (fr: number) => {
    const ms = (fr / fps) * 1000;
    return Math.max(0, scenes.findIndex((s, i) => ms >= s.startMs && (i === scenes.length - 1 || ms < scenes[i + 1].startMs)));
  };
  const poseAt = (fr: number) => {
    const i = sceneAt(fr);
    const sc = scenes[i];
    const prev = scenes[Math.max(0, i - 1)];
    const local = fr - Math.round((sc.startMs / 1000) * fps);
    const sceneFrames = Math.max(1, Math.round((sc.durationMs / 1000) * fps));
    const move = i === 0 ? 1 : ease(interpolate(local, [0, 22], [0, 1], clamp));
    const look = v(POS[prev.state]).lerp(v(POS[sc.state]), move);
    const park = interpolate(local, [0, sceneFrames], [0, 1], clamp);
    const cam = v(POS[prev.state]).add(v(CAM[prev.state])).lerp(v(POS[sc.state]).add(v(CAM[sc.state])), move);
    const off = cam.clone().sub(look);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), (park - 0.5) * 0.35 + wob(fr, 2, 0.6) * 0.05);
    off.multiplyScalar(1 - park * 0.1);
    // v2 punch-in on the number word: fast in (5 f), slow release
    const punch = punches.reduce((a, p) => { const d = fr - p; return a + (d < 0 ? 0 : d < 5 ? ease(d / 5) : Math.exp(-(d - 5) / 20)); }, 0);
    off.multiplyScalar(1 - 0.1 * Math.min(1, punch));
    const camPos = look.clone().add(off);
    camPos.y += wob(fr, 3, 0.7) * 0.06;
    // v2 travel arc: rise over long moves instead of skimming straight across the ground
    const dist = v(POS[prev.state]).distanceTo(v(POS[sc.state]));
    camPos.y += Math.sin(Math.PI * move) * Math.min(2.2, dist * 0.12);
    if (!T) camPos.z += interpolate(fr, [0, 26], [3, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return { i, sc, local, sceneFrames, look, cam: camPos };
  };
  const P = poseAt(f);
  let { look, cam } = P;
  if (T) {
    // last scene: glide back to the first frame's pose over the final ~1.6 s
    const last = scenes[scenes.length - 1];
    const lastStart = Math.round((last.startMs / 1000) * fps);
    const w = ease(interpolate(f, [Math.max(lastStart, T - 48), T - 1], [0, 1], clamp));
    if (w > 0) {
      const p0 = poseAt(0);
      look = look.clone().lerp(p0.look, w);
      cam = cam.clone().lerp(p0.cam, w);
    }
  }
  const phase = T ? f / T : 0;
  return { idx: P.i, sc: P.sc, local: P.local, sceneFrames: P.sceneFrames, t: f / fps, phase, look, cam, at: (st: S) => scenes.findIndex((s) => s.state === st) };
};

/** periodic sway for props in a looping video: sin(2πk·phase) */
export const loopSin = (phase: number, k: number, t: number, hz: number) => (phase || phase === 0 ? Math.sin(2 * Math.PI * k * phase) : Math.sin(t * hz));

/** text drawn once to a canvas texture (coin faces, labels) */
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTex = (text: string, color = "#3A2A1A", size = 120, w = 256, h = 256, font = "Impact, Helvetica Neue, Arial", bg = "rgba(0,0,0,0)") => {
  const key = [text, color, size, w, h, font, bg].join("|");
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  c.fillStyle = color;
  c.font = `900 ${size}px ${font}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  text.split("\n").forEach((line, i, all) => c.fillText(line, w / 2, h / 2 + (i - (all.length - 1) / 2) * size * 1.05));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
};

/** low-poly coin, any metal, with a face label */
export const LPCoin: React.FC<{ color: string; face?: string; faceColor?: string; segs?: number }> = ({ color, face, faceColor = "#3A2A1A", segs = 16 }) => (
  <group>
    <mesh castShadow>
      <cylinderGeometry args={[1, 1, 0.16, segs]} />
      <meshStandardMaterial color={color} flatShading metalness={0.45} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.86, 0.04, 4, segs]} />
      <meshStandardMaterial color={color} flatShading metalness={0.45} roughness={0.35} />
    </mesh>
    {face ? (
      <mesh position={[0, 0.088, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial map={textTex(face, faceColor)} transparent />
      </mesh>
    ) : null}
  </group>
);

/** DOM overlays shared by all low-poly stories */
// v2 plate: the number itself is the hero (ink Anton with a thick cream outline and a hard drop), the label is a dark chip.
// No white UI card: it covered a third of the world and read as an app screenshot. `v1` keeps the old card.
export const NumPlate: React.FC<{ k: number; num: string; label?: string; top?: number; ink?: string; sub?: string; v1?: boolean; /** fixed font size (count-ups) */ size?: number }> = ({ k, num, label, top = 500, size, ink = "#2A1A12", sub = "#7A4A2E", v1 = false }) =>
  v1 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${0.4 + 0.6 * k})`, opacity: k }}>
      <div style={{ display: "inline-block", background: "#fff", borderRadius: 30, padding: "14px 44px 6px", boxShadow: "0 18px 40px rgba(60,30,20,.25)" }}>
        <div style={{ fontFamily: FONT.anton, fontSize: 180, lineHeight: 1.02, color: ink }}>{num}</div>
        {label ? <div style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 38, color: sub, paddingBottom: 12 }}>{label}</div> : null}
      </div>
    </div>
  ) : (
    <div style={{ position: "absolute", left: 60, right: 160, top, textAlign: "center", transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - Math.min(1, k)) * -6 - 2}deg)`, opacity: Math.min(1, k * 1.4) }}>
      <div style={{ fontFamily: FONT.anton, fontSize: size ?? (num.length > 8 ? 150 : 210), lineHeight: 1, color: ink, WebkitTextStroke: "26px #FFF7E8", paintOrder: "stroke fill", filter: "drop-shadow(0 10px 0 rgba(42,26,18,.35))", whiteSpace: "nowrap" }}>{num}</div>
      {label ? (
        <div style={{ display: "inline-block", marginTop: 4, background: ink, color: "#FFD21F", borderRadius: 14, padding: "8px 22px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 40, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      ) : null}
    </div>
  );

export const Stamp: React.FC<{ k: number; text: string; color?: string; top?: number }> = ({ k, text, color = "#D7263D", top = 760 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: Math.min(1, k * 1.5), transform: `scale(${2.2 - 1.2 * Math.min(1, k)}) rotate(-8deg)` }}>
    <span style={{ display: "inline-block", border: `12px solid ${color}`, color, borderRadius: 18, padding: "6px 34px", fontFamily: FONT.anton, fontSize: 150, letterSpacing: 6, background: "rgba(255,255,255,.85)" }}>{text}</span>
  </div>
);

// v2: the hook shows for the first ~2.7 s, slides away to free the top of the world, and slides back in over the last
// 0.8 s so the loop point still matches frame 0. The claim is repeated in the post caption. `pinned` keeps the v1 behaviour.
export const HookBar: React.FC<{ text?: string; bg?: string; accent: string; pinned?: boolean }> = ({ text, bg = "#2A1A12", accent, pinned = false }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (!text) return null;
  const out = pinned ? 0 : interpolate(f, [80, 92], [0, 1], { ...clamp, easing: (x) => x * x }) * (1 - interpolate(f, [durationInFrames - 24, durationInFrames - 4], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <div style={{ position: "absolute", top: 290, left: 60, right: 160, padding: "16px 24px", background: bg, borderLeft: `10px solid ${accent}`, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: "#fff", textTransform: "uppercase", transform: `translateX(${-out * 1150}px)` }}>
      {text.split(/(→)/).map((part, i) => (part === "→" ? <span key={i} style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>→</span> : part))}
    </div>
  );
};

/** v2 caption height (% of frame): y≈1305, up from 74% (1420) and still inside the hard box; 62% covered the props */
export const CAPTION_PCT = 68;

export const Brand: React.FC<{ color?: string }> = ({ color = "rgba(42,26,18,.6)" }) => (
  <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color }}>BUSINESS LEAKS</div>
);

/**
 * funnel CTA (Nathan via the lead, 2026-10-30): a small label that stays on screen the whole video, so the loop frame still
 * matches frame 0. Sits just under the caption band, inside the hard box (bottom edge y≈1430). Wording works on IG and YouTube.
 */
export const CTA_TEXT = "Comment LEAK for a free check";
/** the spoken CTA's "LEAK": the word after "comment", else the last "leak" (2026-10-31, variant B) */
export const leakMs = (caps: Caption[]): number | undefined => {
  const w = (c: Caption) => c.text.trim().replace(/^[^a-z]+/i, "");
  const i = caps.findIndex((c, j) => /^comment/i.test(w(c)) && caps[j + 1] && /^leak/i.test(w(caps[j + 1])));
  return i >= 0 ? caps[i + 1].startMs : [...caps].reverse().find((c) => /^leak/i.test(w(c)))?.startMs;
};
export const leakSfx = (caps: Caption[]) => { const at = leakMs(caps); return at === undefined ? [] : [{ atMs: at, src: "pop-drop", volume: 0.32 }]; };

/** the big COMMENT / LEAK stamp, shown as the VO says "comment LEAK"; `top` moves it clear of a format's own UI */
export const LeakStamp: React.FC<{ captions: Caption[]; accent?: string; top?: number }> = ({ captions, accent = "#FFD21F", top = 470 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = leakMs(captions);
  const lf = at === undefined ? -1e9 : f - Math.round((at / 1000) * fps) + 3;
  if (lf < 0 || lf >= 52) return null;
  const k = spring({ frame: lf, fps, config: { damping: 9, stiffness: 190, mass: 0.7 } });
  const out = interpolate(lf, [40, 52], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", opacity: out, transform: `translateY(${(1 - k) * 60 - (1 - out) * 40}px) scale(${0.4 + 0.6 * k}) rotate(-5deg)` }}>
      <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFF7E8", borderRadius: 999, padding: "8px 34px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 58, letterSpacing: 4 }}>COMMENT</span>
      <div style={{ fontFamily: FONT.anton, fontSize: 300, lineHeight: 1, color: accent, WebkitTextStroke: "28px #2A1A12", paintOrder: "stroke fill", filter: "drop-shadow(0 12px 0 rgba(42,26,18,.35))", letterSpacing: 8 }}>LEAK</div>
    </div>
  );
};

/** persistent pill; pass captions and it also stamps COMMENT / LEAK big on screen as the VO says it */
export const Cta: React.FC<{ text?: string; accent?: string; captions?: Caption[] }> = ({ text = CTA_TEXT, accent = "#FFD21F", captions }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [pre, word, ...rest] = text.split(/(LEAK)/);
  const at = captions ? leakMs(captions) : undefined;
  const lf = at === undefined ? -1e9 : f - Math.round((at / 1000) * fps) + 3;
  const pulse = lf >= 0 && lf < 52 ? 1 + 0.12 * Math.sin(Math.min(1, lf / 14) * Math.PI) : 1;
  return (
    <>
      {captions ? <LeakStamp captions={captions} accent={accent} /> : null}
      <div style={{ position: "absolute", left: 60, right: 160, top: 1376, textAlign: "center", transform: `scale(${pulse})` }}>
        <span style={{ display: "inline-block", background: "rgba(42,26,18,.86)", color: "#FFF7E8", borderRadius: 999, padding: "8px 26px", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 34, letterSpacing: 0.5 }}>
          {pre}
          <span style={{ color: accent, fontWeight: 900 }}>{word}</span>
          {rest.join("")}
        </span>
      </div>
    </>
  );
};

export const popK = (frame: number, fps: number) => spring({ frame, fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
