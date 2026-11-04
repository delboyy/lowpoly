import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, HookBar, LowPolyWorld, NumPlate, Palette, V3, Vignette, clamp, loopSin, popK, rnd, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Bubble, Person, Phone, ShopFront, WallClock } from "../kit3d/Props";

// Business Leaks #7 (real estate, question hook): "How long do agents take to reply?" (WAV Group for Weichert: 5.3 h average,
// 48% never replied; HBR 2011: ~7x). A buyer's inquiry flies to an agency while a big clock spins; 384 tiles, 48% turn red;
// the study board; a city of shops where only one lights up within the hour. Seamless loop: the bubble flies out again.
export type AgentStation = "ask" | "tiles" | "map" | "city" | "hour" | "payoff";
export type AgentScene = Timed & { state: AgentStation; num?: string; label?: string; at?: string };
export type AgentProps = BaseResolved<AgentScene> & { topHook?: string; /** format test: orthographic "toy" camera */ iso?: boolean };

const PAL: Palette = { skyTop: "#8FAEF0", skyBot: "#FFC9D8", ground: "#BEDD9A", accent: "#2EC4B6", ink: "#2A1A12" };
const BUYER: V3 = [-1.25, -0.2, 1.7];
const DOOR: V3 = [0.8, 1.9, -0.6];
const CITY_X = 32;
const CITY = Array.from({ length: 30 }).map((_, i) => ({ x: CITY_X - 4.5 + (i % 6) * 1.8, z: -6 + Math.floor(i / 6) * 1.6, c: ["#F4D9B0", "#CDE7D8", "#F7C8C0", "#D6E0F5", "#F9E1A8"][i % 5] }));
const FAST = 26; // the one shop that replies within the hour: front row, centre-right
const POS: Record<AgentStation, V3> = { ask: [0.3, 1.7, -0.4], tiles: [10, 4.1, 0], map: [20, 1.9, -1.0], city: [CITY_X, 0.8, -2.5], hour: [CITY[FAST].x, 2.1, CITY[FAST].z], payoff: [0.3, 1.7, -0.4] };
const CAM: Record<AgentStation, V3> = { ask: [0, 1.2, 12.5], tiles: [0, 0, 18.5], map: [0, 0.4, 7.2], city: [0, 4.5, 14], hour: [0.6, 0.5, 8.5], payoff: [0, 1.2, 12.5] };
const REDSET = new Set(Array.from({ length: 384 }, (_, i) => i).sort((a, b) => rnd(a + 7) - rnd(b + 7)).slice(0, 184)); // 184 of 384 = 48%

const House: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.0, 1.6, 1.8]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[1.75, 1.0, 4]} />
      <meshStandardMaterial color="#B5523B" flatShading />
    </mesh>
    <mesh position={[0, 0.5, 0.91]}>
      <planeGeometry args={[0.45, 0.9]} />
      <meshStandardMaterial color="#6B4F3A" />
    </mesh>
  </group>
);

export const AgentReply3D: React.FC<AgentProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numFrames = p.scenes.flatMap((s) => (s.num ? [msF(s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200)] : []));
  const S = storyCamera({ f, fps, scenes: p.scenes, POS, CAM, loopFrames: durationInFrames, punches: numFrames });
  const { sc, t, at, phase } = S;
  const startF = (st: AgentStation) => (at(st) >= 0 ? msF(p.scenes[at(st)].startMs) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);

  // the inquiry flies to the agency and waits; at the payoff it is back with the buyer and flies out again (loop)
  const reset = f >= startF("payoff");
  const flyK = reset ? 0 : interpolate(f, [8, 40], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const bub: V3 = [BUYER[0] + 0.6 + (DOOR[0] - BUYER[0] - 0.6) * flyK, 2.7 + Math.sin(flyK * Math.PI) * 0.9 + (DOOR[1] + 0.6 - 2.7) * flyK, BUYER[2] + (DOOR[2] + 0.9 - BUYER[2]) * flyK];
  const fiveF = msF(numAt);
  const spinFast = interpolate(f, [fiveF - 20, fiveF + 10], [0, 1], clamp) * interpolate(f, [startF("tiles"), startF("tiles") + 10], [1, 0], clamp);
  const ts = p.scenes[at("tiles")];
  const redAt = ts ? msF(wordMs(p.captions, /^forty/i, ts.startMs, ts.startMs + 1500)) : 1e9;
  const pinK = (i: number) => spring({ frame: f - startF("map") - 6 - i * 5, fps, config: { damping: 11, stiffness: 160 } });
  const hs = p.scenes[at("hour")];
  const litAt = hs ? msF(wordMs(p.captions, /^hour/i, hs.startMs, hs.startMs + 800)) : 1e9;
  const lit = spring({ frame: f - litAt, fps, config: { damping: 14, stiffness: 90 } });
  const cityK = (i: number) => spring({ frame: f - startF("city") - 2 - Math.floor(rnd(i + 9) * 16), fps, config: { damping: 12, stiffness: 150 } });
  const inTiles = f >= startF("tiles") - 30 && f < startF("map") + 30;
  const inCity = f >= startF("city") - 30 && f < startF("payoff") + 30;

  const sfx: SfxCue[] = [
    { atMs: 300, src: "pixabay-whoosh-cinematic", volume: 0.16 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(at("map") >= 0 ? [0, 1, 2, 3].map((i) => ({ atMs: ((startF("map") + 6 + i * 5) / fps) * 1000, src: "pop-tick", volume: 0.2 })) : []),
    ...(at("city") >= 0 ? [{ atMs: p.scenes[at("city")].startMs + 150, src: "pixabay-riser", volume: 0.14 }] : []),
    ...(litAt < 1e8 ? [{ atMs: (litAt / fps) * 1000, src: "pixabay-chime", volume: 0.25 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} orthographic={!!p.iso} camera={p.iso ? { zoom: 60, position: [10, 10, 10], near: 0.1, far: 400 } : { fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the street: the agency, a big clock that keeps running, homes for sale behind */}
        <group position={[0.8, -0.2, -1.5]}>
          <ShopFront sign="REALTY" lit={0.3} w={2.8} color="#F4D9B0" />
        </group>
        <group position={[2.15, -0.2, -0.4]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 2.4, 6]} />
            <meshStandardMaterial color="#3A3F48" flatShading />
          </mesh>
          <group position={[0, 2.9, 0.1]} scale={0.75}>
            <WallClock a={-2 * Math.PI * 12 * phase - spinFast * f * 0.5} />
          </group>
        </group>
        {[-4.5, -1.5, 1.6, 4.6].map((x, i) => (
          <group key={i} position={[x, -0.2, -6.5 - (i % 2) * 0.8]} rotation={[0, (rnd(i) - 0.5) * 0.3, 0]}>
            <House color={["#F7C8C0", "#D6E0F5", "#F9E1A8", "#CDE7D8"][i]} />
          </group>
        ))}
        <group position={BUYER} rotation={[0, 0.5, 0]}>
          <Person color="#9B5DE5" mood={-0.3 * flyK + loopSin(phase, 3, t, 0.6) * 0.15} />
          <group position={[0.32, 1.25, 0.32]} rotation={[-0.3, 0, 0]} scale={0.26}>
            <Phone screen="#2EC4B6" glow={0.6} lines={["Is it still", "for sale?"]} />
          </group>
        </group>
        <group position={bub} scale={0.55}>
          <Bubble text={"STILL FOR\nSALE?"} bg="#FFFFFF" ink="#1E2A44" w={2.0} />
        </group>

        {/* 384 buyer inquiries: 48% never got a reply */}
        {inTiles
          ? Array.from({ length: 384 }).map((_, i) => {
              const red = REDSET.has(i) && f >= redAt + Math.floor(rnd(i + 3) * 24);
              return (
                <mesh key={i} position={[POS.tiles[0] - 2.4 + (i % 16) * 0.32, 0.4 + Math.floor(i / 16) * 0.32, 0]}>
                  <boxGeometry args={[0.28, 0.28, 0.06]} />
                  <meshStandardMaterial color={red ? "#C8372D" : "#EDE6DA"} emissive={red ? "#C8372D" : "#EDE6DA"} emissiveIntensity={0.15} flatShading />
                </mesh>
              );
            })
          : null}

        {/* the study: a cork board with the report, pins and string */}
        <group position={[20, -0.2, -1.6]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.12, 1.8, 0.12]} />
            <meshStandardMaterial color="#6B4F3A" flatShading />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[3.4, 2.4, 0.14]} />
            <meshStandardMaterial color="#C99470" flatShading />
          </mesh>
          <mesh position={[-0.6, 2.25, 0.09]} rotation={[0, 0, 0.04]}>
            <planeGeometry args={[1.3, 1.7]} />
            <meshStandardMaterial map={textTex("BUYER\nINQUIRY\nSTUDY\n— — —\n— — —", "#2A1A12", 52, 256, 340, "Courier New, monospace", "#FFFDF6")} emissive="#FFFFFF" emissiveIntensity={0.2} />
          </mesh>
          {[[0.7, 2.9], [1.2, 2.0], [0.5, 1.5], [1.3, 2.7]].map(([x, y], i) => (
            <group key={i} position={[x, y, 0.12]} scale={Math.max(0.001, Math.min(1.2, pinK(i)))}>
              <mesh>
                <sphereGeometry args={[0.1, 6, 4]} />
                <meshStandardMaterial color="#C8372D" flatShading />
              </mesh>
            </group>
          ))}
        </group>

        {/* the city of shops: only one replies within the hour */}
        {inCity
          ? CITY.map((c, i) => {
              const k = Math.min(1.1, cityK(i));
              const isFast = i === FAST;
              return (
                <group key={i} position={[c.x, -0.2, c.z]} scale={Math.max(0.001, k) * 0.5}>
                  <ShopFront color={c.c} lit={isFast ? 0.15 + lit * 0.85 : 0.12} w={2.4} />
                  {isFast && lit > 0.01 ? (
                    <group position={[0, 4.0, 0.6]} scale={Math.min(1, lit) * 1.6}>
                      <Bubble text={"REPLIED\n< 1 HOUR"} bg="#BDF2D5" ink="#1E2A44" w={2.0} />
                    </group>
                  ) : null}
                </group>
              );
            })
          : null}
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
