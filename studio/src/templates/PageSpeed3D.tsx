import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, HookBar, LowPolyWorld, NumPlate, Palette, V3, Vignette, clamp, loopSin, popK, rnd, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Cart, Face, Person, ShopFront } from "../kit3d/Props";

// Business Leaks #5 (stores): "The loading spinner fears 0.1 seconds" (Deloitte for Google, 2020). The narrator is the villain:
// a loading spinner with a face, hovering over a giant phone that is a shop. It grows over the shopper, then three fixes
// (smaller images, fewer apps, less code) knock it down. Seamless loop: it ends at its opening size, angle and mood.
export type SpeedStation = "spinner" | "stop" | "shelf" | "grow" | "thumb" | "shrink" | "payoff";
export type SpeedScene = Timed & { state: SpeedStation; num?: string; label?: string; at?: string };
export type SpeedProps = BaseResolved<SpeedScene> & { topHook?: string; /** format test: orthographic "toy" camera */ iso?: boolean };

const PAL: Palette = { skyTop: "#79B8F2", skyBot: "#FFE2C8", ground: "#BFDC98", accent: "#2EC4B6", ink: "#2A1A12" };
const SPIN = ["#12A89B", "#1CB5A8", "#2EC4B6", "#45CCBF", "#5ED3C8", "#78DAD0", "#8FE0D7", "#A6E5DE"];
const VILLAIN = "#E86A3A";
const SPIN_Y = 3.4;
const POS: Record<SpeedStation, V3> = {
  spinner: [0, 3.0, 0], stop: [0, SPIN_Y, 0.9], shelf: [12, 2.2, -0.5], grow: [0, 3.0, 1.0],
  thumb: [-0.4, 4.7, 1.0], shrink: [0, 3.4, 1.2], payoff: [0, 3.0, 0],
};
const CAM: Record<SpeedStation, V3> = {
  spinner: [0, 1.2, 13.5], stop: [0.3, 0.2, 5.2], shelf: [0, 0.6, 9.5], grow: [1.6, 1.0, 12],
  thumb: [0.4, 0.3, 9.4], shrink: [0.4, 0.5, 9.8], payoff: [0, 1.2, 13.5],
};

/** the phone's shop screen: header, back button, product tiles, a big buy button; `loading` greys it into skeleton blocks */
const screenCache = new Map<string, THREE.CanvasTexture>();
const shopScreen = (loading: boolean) => {
  const key = String(loading);
  const hit = screenCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 480;
  cv.height = 900;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#FFF8EE";
  c.fillRect(0, 0, 480, 900);
  c.fillStyle = loading ? "#D9D4CC" : "#E86A3A";
  c.fillRect(0, 0, 480, 110);
  c.fillStyle = "#FFFFFF";
  c.font = "900 52px Helvetica Neue, Arial";
  c.textBaseline = "middle";
  if (!loading) c.fillText("SHOP", 170, 58);
  const tiles: [number, number, string][] = [[30, 150, "#F2B66B"], [250, 150, "#7FA8E0"], [30, 400, "#7CC6A4"], [250, 400, "#E98A7A"]];
  tiles.forEach(([x, y, col]) => {
    c.fillStyle = loading ? "#E6E1D9" : "#FFFFFF";
    c.fillRect(x, y, 200, 220);
    c.fillStyle = loading ? "#D9D4CC" : col;
    c.fillRect(x + 20, y + 20, 160, 120);
    c.fillStyle = "#D9D4CC";
    c.fillRect(x + 20, y + 160, loading ? 160 : 110, 22);
  });
  c.fillStyle = loading ? "#D9D4CC" : "#2EC4B6";
  c.fillRect(40, 700, 400, 110);
  if (!loading) {
    c.fillStyle = "#FFFFFF";
    c.font = "900 50px Helvetica Neue, Arial";
    c.fillText("BUY NOW", 140, 757);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  screenCache.set(key, t);
  return t;
};

// classic loading spinner: a dark track, dots shrinking and fading round it, and the villain's face in the hub
const Spinner: React.FC<{ angle: number; lid: number; brow: number; smile: number; look: number }> = ({ angle, lid, brow, smile, look }) => (
  <group>
    <mesh>
      <torusGeometry args={[1.25, 0.09, 6, 24]} />
      <meshStandardMaterial color="#2A1A12" flatShading />
    </mesh>
    <group rotation={[0, 0, angle]}>
      {SPIN.map((col, i) => {
        const a = -(i / SPIN.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 1.25, Math.cos(a) * 1.25, 0.12]} scale={0.3 - i * 0.025} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.25} flatShading />
          </mesh>
        );
      })}
    </group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.72, 0.72, 0.24, 10]} />
      <meshStandardMaterial color={VILLAIN} flatShading />
    </mesh>
    <group position={[0, 0.06, 0.13]} scale={1.2}>
      <Face lid={lid} brow={brow} smile={smile} look={look} lidColor="#B5502C" />
    </group>
  </group>
);

export const PageSpeed3D: React.FC<SpeedProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numFrames = p.scenes.flatMap((s) => (s.num ? [msF(s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200)] : []));
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: numFrames });
  const { sc, t, at, phase } = S;
  const startF = (st: SpeedStation) => (at(st) >= 0 ? msF(p.scenes[at(st)].startMs) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);
  const word = (re: RegExp, st: SpeedStation, d = 1000) => (at(st) >= 0 ? msF(wordMs(p.captions, re, p.scenes[at(st)].startMs, p.scenes[at(st)].startMs + d)) : 1e9);

  // spin speed profile: normal, freezes on "stop", fast while it grows; the angle integrates it and is rescaled so the
  // whole video holds a whole number of turns (frame T == frame 0)
  const stopA = startF("stop"), growA = startF("grow"), growB = startF("shrink");
  const speedAt = (fr: number) => {
    const stop = interpolate(fr, [stopA, stopA + 4, stopA + 40, stopA + 52], [1, 0, 0, 1], clamp);
    const fast = interpolate(fr, [growA, growA + 15, growB, growB + 10], [1, 1.8, 1.8, 1], clamp);
    return stop * fast;
  };
  const cum = useMemo(() => {
    const a = new Float64Array(durationInFrames + 1);
    for (let i = 1; i <= durationInFrames; i++) a[i] = a[i - 1] + speedAt(i - 1);
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationInFrames, stopA, growA, growB]);
  const turns = Math.max(1, Math.round(cum[durationInFrames] / 26));
  const angle = (-2 * Math.PI * turns * cum[Math.min(f, durationInFrames)]) / cum[durationInFrames];

  // size: 1 -> grows over the shopper -> knocked down by three fixes -> back to 1 for the loop
  const fixF = [word(/^smaller/i, "shrink", 1500), word(/^fewer/i, "shrink", 2500), word(/^less/i, "shrink", 3500)];
  const hitK = (i: number) => spring({ frame: f - fixF[i], fps, config: { damping: 10, stiffness: 160 } });
  const grow = interpolate(f, [growA, growA + 30], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const knocked = fixF.reduce((a, F, i) => a + (f >= F ? Math.min(1, hitK(i)) : 0), 0);
  const back = interpolate(f, [startF("payoff") + 6, durationInFrames - 30], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const sizeIn = (1 + grow * 1.1) * Math.pow(0.78, knocked);
  const size = sizeIn + (1 - sizeIn) * back;

  // mood: smug, offended on "stop", delighted while growing, nervous at the fixes, smug at the end
  const offended = interpolate(f, [stopA, stopA + 6, growA, growA + 6], [0, 1, 1, 0], clamp);
  const delight = interpolate(f, [growA, growA + 8, growB, growB + 6], [0, 1, 1, 0], clamp);
  const nervous = interpolate(f, [growB, growB + 6, startF("payoff"), startF("payoff") + 12], [0, 1, 1, 0], clamp);
  const lid = 0.4 + delight * 0.3 - nervous * 0.4 - offended * 0.2;
  const brow = 0.6 + offended * 0.5 - delight * 0.4 - nervous * 1.4;
  const smile = 0.8 - offended * 1.6 + delight * 0.2 - nervous * 1.6;
  const shake = nervous * Math.sin(f * 2.1) * 0.05;
  const loading = f >= growA && f < startF("payoff") + 10;

  // the thumb drifts toward the back button
  const th = startF("thumb");
  const thumbIn = interpolate(f, [th - 4, th + 26, startF("shrink"), startF("shrink") + 16], [0, 1, 1, 0], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const thumbHover = loopSin(phase, 20, t, 6) * 0.06;
  const wobble = f >= th && f < startF("shrink") ? Math.sin(f * 0.8) * 0.05 : 0;

  // the shelf of 37 brands, popping in
  const shelfK = (i: number) => spring({ frame: f - startF("shelf") - 3 - Math.floor(rnd(i + 5) * 20), fps, config: { damping: 12, stiffness: 160 } });

  const sfx: SfxCue[] = [
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.18 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(stopA < 1e8 ? [{ atMs: (stopA / fps) * 1000, src: "scratch", volume: 0.25 }] : []),
    ...(growA < 1e8 ? [{ atMs: (growA / fps) * 1000, src: "riser-synth", volume: 0.16 }] : []),
    ...fixF.filter((x) => x < 1e8).map((x) => ({ atMs: (x / fps) * 1000, src: "impact-soft-heavy", volume: 0.28 })),
    ...(th < 1e8 ? [{ atMs: (th / fps) * 1000, src: "pop-tick", volume: 0.25 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} orthographic={!!p.iso} camera={p.iso ? { zoom: 60, position: [10, 10, 10], near: 0.1, far: 400 } : { fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the shop is a giant phone */}
        <group position={[0, -0.2, -0.6]}>
          <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 6.6, 0.45]} />
            <meshStandardMaterial color="#22252B" flatShading roughness={0.5} />
          </mesh>
          <mesh position={[0, 3.15, 0.23]}>
            <planeGeometry args={[3.2, 6.0]} />
            <meshStandardMaterial map={shopScreen(loading)} emissive="#FFFFFF" emissiveMap={shopScreen(loading)} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 6.25, 0.24]}>
            <boxGeometry args={[0.9, 0.12, 0.04]} />
            <meshStandardMaterial color="#111317" />
          </mesh>
          {/* back button, top-left of the screen */}
          <group position={[-1.05, 5.55 - (thumbIn > 0.95 ? 0.03 : 0), 0.3]}>
            <mesh>
              <boxGeometry args={[0.9, 0.42, 0.1]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} flatShading />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <planeGeometry args={[0.84, 0.36]} />
              <meshStandardMaterial map={textTex("< BACK", "#E86A3A", 80, 320, 136, "Arial Black, Arial", "#FFFFFF")} />
            </mesh>
          </group>
          {/* a kickstand, so it reads as a phone standing in the field */}
          <mesh position={[0, 1.4, -0.6]} rotation={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 3.0, 0.12]} />
            <meshStandardMaterial color="#3A3F48" flatShading />
          </mesh>
        </group>
        {/* the spinner */}
        <group position={[shake + 1.0 * grow * (1 - back) * Math.min(1, Math.max(0, size - 1)), SPIN_Y + (size - 1) * 0.6, 0.9 + (size - 1) * 0.8]} scale={size}>
          <Spinner angle={angle} lid={Math.max(0, Math.min(1, lid))} brow={brow} smile={smile} look={nervous ? Math.sin(f * 0.35) : loopSin(phase, 3, t, 0.5) * 0.4} />
        </group>
        {/* the shopper and the cart, in the spinner's shadow */}
        <group position={[1.6, -0.2, 2.4]} rotation={[0, -2.6, 0]}>
          <Person color="#9B5DE5" mood={-grow * 0.8 * (1 - back)} />
        </group>
        <group position={[0.6, -0.2, 2.6]} rotation={[wobble, -0.4, wobble * 0.6]}>
          <Cart full color="#E05A47" />
        </group>
        {/* the thumb, drifting down toward the back button */}
        <group position={[-1.05 - (1 - thumbIn) * 2.5, 6.0 + (1 - thumbIn) * 2.5 + thumbHover, 2.8]} rotation={[0, 0, -0.5]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.34, 1.1, 3, 8]} />
            <meshStandardMaterial color="#E8B98F" emissive="#E8B98F" emissiveIntensity={0.25} flatShading />
          </mesh>
          <mesh position={[0, -0.55, 0.26]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[0.38, 0.42, 0.06]} />
            <meshStandardMaterial color="#F9DCCB" emissive="#F9DCCB" emissiveIntensity={0.25} flatShading />
          </mesh>
          <mesh position={[0, 0.25, 0.3]}>
            <boxGeometry args={[0.5, 0.06, 0.04]} />
            <meshStandardMaterial color="#C99470" />
          </mesh>
        </group>
        {/* the three fixes fly in from the left, hit the spinner, and drop away */}
        {[
          { label: "IMG", col: "#7FA8E0", w: 1.0 },
          { label: "APPS", col: "#F2B66B", w: 1.1 },
          { label: "</>", col: "#7CC6A4", w: 1.0 },
        ].map((fx, i) => {
          const F = fixF[i];
          if (F > 1e8 || f < F - 14 || f > F + 30) return null;
          const fly = interpolate(f, [F - 14, F], [0, 1], { ...clamp, easing: (x) => x * x });
          const fall = interpolate(f, [F, F + 30], [0, 1], clamp);
          const hitY = SPIN_Y + (sizeIn - 1) * 0.6;
          const y = hitY + (1 - fly) * 2.6 - fall * fall * 5;
          return (
            <group key={i} position={[-3.4 + fly * 3.0 - fall * 1.4, y, 3.0]} rotation={[0, 0.3, fall * 2.4]} scale={1 - fall * 0.5}>
              <mesh castShadow>
                <boxGeometry args={[fx.w, 0.75, 0.25]} />
                <meshStandardMaterial color={fx.col} flatShading />
              </mesh>
              <mesh position={[0, 0, 0.13]}>
                <planeGeometry args={[fx.w * 0.9, 0.6]} />
                <meshStandardMaterial map={textTex(fx.label, "#FFFFFF", 110, 320, 192, "Arial Black, Arial", fx.col)} />
              </mesh>
            </group>
          );
        })}
        {/* the shelf of 37 brands */}
        {f >= startF("shelf") - 20 && f < startF("grow") + 30 ? (
          <group position={[12, -0.2, -0.8]}>
            {[0, 1, 2].map((r) => (
              <mesh key={r} position={[0, 0.9 + r * 1.35, 0]} castShadow receiveShadow>
                <boxGeometry args={[6.4, 0.12, 1.0]} />
                <meshStandardMaterial color="#B98A5E" flatShading />
              </mesh>
            ))}
            {Array.from({ length: 37 }).map((_, i) => {
              const r = Math.floor(i / 13), c = i % 13;
              const k = shelfK(i);
              return (
                <group key={i} position={[-2.9 + c * 0.48, 0.96 + r * 1.35, 0]} scale={Math.max(0.001, Math.min(1.15, k)) * 0.2}>
                  <ShopFront color={["#F4D9B0", "#CDE7D8", "#F7C8C0", "#D6E0F5", "#F9E1A8"][i % 5]} lit={rnd(i + 3) > 0.5 ? 0.8 : 0.2} w={2.0} />
                </group>
              );
            })}
          </group>
        ) : null}
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {!sc.num && sc.label ? (
        <div style={{ position: "absolute", left: 80, right: 160, top: 470, textAlign: "center", opacity: interpolate(f - msF(sc.startMs), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, textTransform: "uppercase" }}>{sc.label}</span>
        </div>
      ) : null}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
