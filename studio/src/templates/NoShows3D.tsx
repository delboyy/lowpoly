import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue, Timed } from "../lib/types";
import { Brand, CAPTION_PCT, Cta, leakMs, leakSfx, HookBar, LowPolyWorld, NumPlate, Palette, V3, Vignette, clamp, loopSin, popK, rnd, storyCamera, textTex, wordMs } from "../kit3d/LowPoly";
import { Bubble, Chair, Mug, Person, Phone, Receipt, WallClock } from "../kit3d/Props";

// The clinic world, three scripts (template "noshows3d"; the mode follows the station names in the script):
// - BL #4 "I'm the empty chair. 18.8%." (waiting/calendar/ledger/receipt/clock/phone/payoff): the villain narrator is an empty
//   waiting-room chair with a face. Waiting room -> reception (calendar, records) -> exam room.
// - BL #8 "The front desk is at lunch" (desk/clipboard/phones/missed/busy/diary/payoff): straight narrator, no face on the chair;
//   the action is at reception: ringing phones, missed-call chips, a text-back bubble.
// - BL #9 "The Empty Chair returns" (chair/ledger/calendars/yawn/door/rebook/payoff): the #4 chair again, with a reminder envelope,
//   before/after boards, a yawn, and a patient waiting at the door.
// Seamless loop in every mode: whatever changed (guest, envelope, dark phone, flipped slot) is undone before the last frame.
export type NoShowsStation =
  | "waiting" | "calendar" | "ledger" | "receipt" | "clock" | "phone" | "payoff"
  | "chair" | "calendars" | "yawn" | "door" | "rebook"
  | "desk" | "clipboard" | "phones" | "missed" | "busy" | "diary";
export type NoShowsScene = Timed & { state: NoShowsStation; num?: string; label?: string; at?: string };
export type NoShowsProps = BaseResolved<NoShowsScene> & { topHook?: string; /** format test: orthographic "toy" camera */ iso?: boolean };

const PAL: Palette = { skyTop: "#7FC6F0", skyBot: "#FFE9CF", ground: "#E8D3B0", accent: "#2EC4B6", ink: "#2A1A12" };
const WALL = "#86DCCB", WALL2 = "#5EC4B2", VILLAIN = "#E86A3A";
const CHAIR_X = [-2.1, -1.05, 0, 1.05, 2.1];
const SEATED = [0, 1, 3, 4];
const SHIRTS = ["#4F7CAC", "#F2CC8F", "#9B5DE5", "#81B29A"];
const POS: Record<NoShowsStation, V3> = {
  waiting: [0, 1.2, -0.6], calendar: [10.5, 2.6, -2.4], ledger: [12.4, 1.3, -1.0], receipt: [0.45, 1.5, -0.4],
  clock: [20.6, 1.6, -1.0], phone: [0.9, 1.0, -0.4], payoff: [0, 1.2, -0.6],
  chair: [0, 1.2, -0.6], calendars: [13.5, 2.7, -2.4], yawn: [0.1, 1.2, -0.5], door: [-1.8, 1.3, -0.8], rebook: [0.9, 1.0, -0.4],
  desk: [10.4, 1.4, -0.3], clipboard: [11.2, 1.3, -0.3], phones: [10.6, 1.5, -0.3], missed: [10.9, 1.9, -0.3], busy: [10.1, 1.4, 0.1], diary: [10.5, 2.6, -2.4],
};
const CAM: Record<NoShowsStation, V3> = {
  waiting: [0, 2.5, 9.6], calendar: [0, 0.2, 7.0], ledger: [0.6, 1.8, 6.2], receipt: [0.2, 0.5, 7.5],
  clock: [0.2, 0.9, 8.2], phone: [0.3, 1.2, 8.2], payoff: [0, 2.5, 9.6],
  chair: [0, 2.5, 9.6], calendars: [0, 0.2, 8.0], yawn: [0.2, 0.4, 5.0], door: [0.4, 0.9, 8.4], rebook: [0.3, 1.2, 8.2],
  desk: [0, 0.6, 5.8], clipboard: [0.4, 1.6, 4.6], phones: [0, 0.5, 5.4], missed: [0, 0.5, 6.4], busy: [1.0, 0.8, 7.0], diary: [0, 0.2, 7.0],
};
// calendar: 20 slots, the 4 that turn into no-shows are rnd-sorted so they read as random, not a stripe
const SLOTS = Array.from({ length: 20 }).map((_, i) => i);
const NOSHOW = new Set([...SLOTS].sort((a, b) => rnd(a + 11) - rnd(b + 11)).slice(0, 4));

const Wall: React.FC<{ pos: V3; size: V3; color: string }> = ({ pos, size, color }) => (
  <mesh position={pos} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} flatShading />
  </mesh>
);

const Sign: React.FC<{ text: string; w: number; pos: V3 }> = ({ text, w, pos }) => (
  <mesh position={pos}>
    <planeGeometry args={[w, w / 4]} />
    <meshStandardMaterial map={textTex(text, "#FFFFFF", 90, 512, 128, undefined, "#2A6F68")} />
  </mesh>
);

export const NoShows3D: React.FC<NoShowsProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const msF = (ms: number) => Math.round((ms / 1000) * fps);
  const numFrames = p.scenes.flatMap((s) => (s.num ? [msF(s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200)] : []));
  const calls = p.scenes.some((s) => s.state === "desk"); // BL #8
  const reminders = p.scenes.some((s) => s.state === "chair"); // BL #9
  const villain = !calls;
  const pos = calls ? { ...POS, payoff: POS.desk } : POS;
  const cam = calls ? { ...CAM, payoff: CAM.desk } : CAM;
  const S = storyCamera({ f, fps, scenes: p.scenes, POS: pos, CAM: cam, loopFrames: durationInFrames, punches: numFrames });
  const { sc, t, at, phase } = S;
  const startF = (st: NoShowsStation) => (at(st) >= 0 ? msF(p.scenes[at(st)].startMs) : 1e9);
  const numAt = sc.at ? wordMs(p.captions, new RegExp(sc.at, "i"), sc.startMs, sc.startMs + 200) : sc.startMs + 200;
  const numK = popK(f - msF(numAt), fps);
  const word = (re: RegExp, st: NoShowsStation, d = 1000) => (at(st) >= 0 ? msF(wordMs(p.captions, re, p.scenes[at(st)].startMs, p.scenes[at(st)].startMs + d)) : 1e9);
  /** first existing station among the names (stations differ per script) */
  const A = (...sts: NoShowsStation[]) => Math.min(...sts.map(startF));
  /** start of the scene after `st` */
  const nextF = (st: NoShowsStation) => (at(st) >= 0 && at(st) + 1 < p.scenes.length ? msF(p.scenes[at(st) + 1].startMs) : 1e9);

  // the chair talks: mouth flaps while a caption word is being spoken
  const ms = (f / fps) * 1000;
  const talking = p.captions.some((c) => ms >= c.startMs && ms < c.endMs);
  const flap = talking && villain ? 0.5 + 0.5 * Math.abs(Math.sin(f * 0.9)) : 0;

  // villain mood per beat: smug -> delighted (the money) -> nervous (the fix) -> smug again
  const hiF = villain ? word(/^hi/i, reminders ? "chair" : "waiting", 12000) : 1e9;
  const hop = f < hiF ? 1 : spring({ frame: f - hiF, fps, config: { damping: 9, stiffness: 180 } }); // 1 = rest pose (frame 0 must equal the last frame)
  const hopY = f >= hiF ? Math.sin(Math.min(1, (f - hiF) / 10) * Math.PI) * 0.35 : 0;
  const delight = villain ? interpolate(f, [A("receipt", "calendars"), A("receipt", "calendars") + 8, A("clock", "door") + 10, A("clock", "door") + 30], [0, 1, 1, 0.4], clamp) : 0;
  const nervous = villain ? interpolate(f, [A("phone", "rebook"), A("phone", "rebook") + 6, startF("payoff"), startF("payoff") + 12], [0, 1, 1, 0], clamp) : 0;
  // BL #9: the chair turns a full circle on "Hi again" (unbothered), yawns, and an envelope lands on its seat then slides off
  const spinY = reminders && f >= hiF ? interpolate(f, [hiF, hiF + 24], [0, Math.PI * 2], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }) : 0;
  const yawn = reminders ? interpolate(f, [startF("yawn") + 4, startF("yawn") + 14, nextF("yawn") - 10, nextF("yawn")], [0, 1, 1, 0], clamp) : 0;
  const envF = reminders ? word(/^reminder/i, "chair", 4000) : 1e9;
  const envK = spring({ frame: f - envF, fps, config: { damping: 12, stiffness: 140 } });
  const envSlide = interpolate(f, [startF("yawn") + 30, startF("yawn") + 50], [0, 1], { ...clamp, easing: (x) => x * x });
  const envOut = interpolate(f, [startF("payoff"), startF("payoff") + 20], [1, 0], clamp);
  const boardK = (i: number) => spring({ frame: f - startF("calendars") - 10 - i * 8, fps, config: { damping: 12, stiffness: 120 } });
  const lid = 0.45 + delight * 0.25 - nervous * 0.45 + yawn * 0.55;
  const brow = 0.6 - delight * 0.4 - nervous * 1.4;
  const smile = 0.8 + delight * 0.2 - nervous * 1.6;
  const shake = nervous * Math.sin(f * 2.1) * 0.06;

  // calendar flips and the records pile up
  const flipK = (k: number) => spring({ frame: f - startF("calendar") - 14 - k * 7, fps, config: { damping: 11, stiffness: 140 } });
  const boxK = (i: number) => spring({ frame: f - startF("ledger") - 4 - i * 3, fps, config: { damping: 12, stiffness: 170 } });
  // the receipt prints out from under the chair
  const rs = startF("receipt");
  const printK = interpolate(f, [rs + 4, rs + 40], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const nLines = f < rs + 6 ? 0 : f < rs + 22 ? 1 : 2;
  // exam room beats: doctor, room, coffee
  const roomF = word(/^room/i, "clock", 1500), coffeeF = word(/^coffee/i, "clock", 2500), nobodyF = word(/^nobody/i, "clock", 3500);
  const lamp = interpolate(f, [roomF, roomF + 6], [0, 1], clamp);
  const steam = f >= coffeeF - 2;
  const slump = interpolate(f, [nobodyF, nobodyF + 15], [0, 1], clamp);
  // the fix: phone buzzes, a new patient walks in and takes the seat; in the payoff they leave again (loop)
  const ph = A("phone", "rebook");
  const seatF = reminders ? word(/^slot/i, "rebook", 6000) : calls ? 1e9 : word(/^seat/i, "phone", 5000);
  const walkIn = interpolate(f, [seatF - 34, seatF - 4], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const sitting = f >= seatF - 4;
  const walkOut = interpolate(f, [startF("payoff") + 14, startF("payoff") + 44], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const atDoor = reminders && f >= startF("door") - 10 && f < seatF - 34;
  const guestOn = (f >= seatF - 36 || atDoor) && walkOut < 1;
  const guestSit = sitting && walkOut === 0;
  // #9 path: from the door (-3.5, -2.0) forward to the aisle, then along it to the chair
  const doorLeg = interpolate(walkIn, [0, 0.4], [0, 1], clamp), aisleLeg = interpolate(walkIn, [0.4, 1], [0, 1], clamp);
  const guestX = guestSit ? 0 : walkOut > 0 ? walkOut * 5.5 : reminders ? -3.5 + aisleLeg * 3.5 : 4.8 - walkIn * 4.8;
  const guestZ = guestSit ? -0.55 : walkOut > 0 ? 0.9 : reminders ? -2.0 + doorLeg * 2.9 : 0.9;
  const guestRot = guestSit ? 0 : walkOut > 0 ? Math.PI / 2 : reminders ? (atDoor ? 0 : walkIn < 0.4 ? 0 : Math.PI / 2) : -Math.PI / 2;
  const buzz = f >= ph && f < ph + 40 ? Math.sin(f * 2.6) * 0.08 * (1 - (f - ph) / 40) : 0;
  // BL #8: desk phones ring while the desk is at lunch; one goes dark; missed-call chips pile up; the desk is busy with a patient;
  // one diary slot empties; a text-back bubble pops up and the desk is back to lunch for the loop
  const pay = startF("payoff");
  const deskRing = calls && (f < startF("clipboard") || f >= pay);
  const darkPhone = calls && f >= startF("phones") + 12 && f < pay;
  const chipK = (i: number) => spring({ frame: f - startF("missed") - 6 - i * 7, fps, config: { damping: 11, stiffness: 160 } });
  const chipsOut = interpolate(f, [startF("diary") + 10, startF("diary") + 24], [1, 0], clamp);
  const busyK = calls && at("busy") >= 0 ? spring({ frame: f - startF("busy") + 4, fps, config: { damping: 14, stiffness: 120 } }) * interpolate(f, [nextF("busy"), nextF("busy") + 10], [1, 0], clamp) : 0;
  const diaryK = calls ? spring({ frame: f - startF("diary") - 10, fps, config: { damping: 11, stiffness: 140 } }) * interpolate(f, [pay + 20, pay + 34], [1, 0], clamp) : 0;
  const textK = calls ? spring({ frame: f - pay - 6, fps, config: { damping: 11, stiffness: 140 } }) : 0;
  // the text-back bubble pops before the spoken CTA's LEAK stamp so the two never overlap
  const leakAt = leakMs(p.captions);
  const popF = leakAt === undefined ? durationInFrames - 40 : Math.min(durationInFrames - 40, Math.round((leakAt / 1000) * fps) - 10);
  const textPop = interpolate(f, [popF, popF + 6], [0, 1], clamp);

  const sfx: SfxCue[] = [
    ...leakSfx(p.captions),
    { atMs: 0, src: "pixabay-whoosh-cinematic", volume: 0.18 },
    ...p.scenes.flatMap((s) => (s.num ? [{ atMs: s.at ? wordMs(p.captions, new RegExp(s.at, "i"), s.startMs, s.startMs + 200) : s.startMs + 200, src: "impact-punch-heavy", volume: 0.26 }] : [])),
    ...(hiF < 1e8 ? [{ atMs: (hiF / fps) * 1000, src: "pop-pluck", volume: 0.3 }] : []),
    ...(at("calendar") >= 0 ? [0, 1, 2, 3].map((k) => ({ atMs: ((startF("calendar") + 14 + k * 7) / fps) * 1000, src: "tag-flip", volume: 0.2 })) : []),
    ...(rs < 1e8 ? [{ atMs: ((rs + 4) / fps) * 1000, src: "printer-chirp", volume: 0.25 }] : []),
    ...(ph < 1e8 ? [{ atMs: (ph / fps) * 1000, src: "pop-toggle", volume: 0.3 }] : []),
    ...(seatF < 1e8 ? [{ atMs: ((seatF - 4) / fps) * 1000, src: "impact-soft-heavy", volume: 0.25 }] : []),
    ...(envF < 1e8 ? [{ atMs: (envF / fps) * 1000, src: "paper-tear", volume: 0.18 }] : []),
    ...(calls ? [0, 1, 2, 3, 4, 5].map((i) => ({ atMs: ((startF("missed") + 6 + i * 7) / fps) * 1000, src: "pop-tick", volume: 0.2 })) : []),
    ...(calls ? [{ atMs: ((startF("phones") + 12) / fps) * 1000, src: "ui-minimize", volume: 0.25 }, { atMs: ((pay + 6) / fps) * 1000, src: "pixabay-pop", volume: 0.25 }, { atMs: ((durationInFrames - 40) / fps) * 1000, src: "pop-drop", volume: 0.25 }] : []),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyBot }}>
      <ThreeCanvas width={width} height={height} orthographic={!!p.iso} camera={p.iso ? { zoom: 60, position: [10, 10, 10], near: 0.1, far: 400 } : { fov: 40, position: [0, 2, 8] }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} shadows>
        <LowPolyWorld pal={PAL} cam={S.cam} look={S.look} />
        {/* the clinic: an open-front diorama, back wall + two partitions */}
        <Wall pos={[10, 1.9, -2.7]} size={[29, 4.2, 0.2]} color={WALL} />
        <Wall pos={[10, 0.12, -2.55]} size={[29, 0.24, 0.12]} color={WALL2} />
        <Wall pos={[6.2, 1.9, -1.2]} size={[0.2, 4.2, 3.0]} color={WALL2} />
        <Wall pos={[15.2, 1.9, -1.2]} size={[0.2, 4.2, 3.0]} color={WALL2} />
        <Sign text="WAITING ROOM" w={2.4} pos={[-1.5, 2.75, -2.58]} />
        <Sign text="RECEPTION" w={2.2} pos={[8.0, 3.55, -2.58]} />
        <Sign text="EXAM ROOM" w={2.2} pos={[18.0, 3.55, -2.58]} />

        {/* waiting room: five chairs, four patients, one villain */}
        {CHAIR_X.map((x, i) =>
          i === 2 ? (
            <group key={i} position={[x + shake, -0.2 + hopY, -0.6]} rotation={[0, spinY, 0]} scale={[1 + (hop - 1) * -0.08, 1 + (1 - hop) * 0.12, 1]}>
              <Chair color={VILLAIN} face={villain} lid={Math.max(0, Math.min(1, lid))} brow={brow} smile={smile} look={nervous ? Math.sin(f * 0.35) : loopSin(phase, 3, t, 0.5) * 0.4} />
              {villain ? (
                <mesh position={[0.02, 0.83, -0.29]} scale={[1 + yawn * 0.4, 0.6 + flap * 2.2 + yawn * 5, 1]}>
                  <boxGeometry args={[0.2, 0.04, 0.02]} />
                  <meshStandardMaterial color="#5A1E14" />
                </mesh>
              ) : null}
              {reminders && f >= envF - 12 && envOut > 0 ? (
                <group position={[0.1 + envSlide * 0.2, 0.62 + (1 - Math.min(1, envK)) * 2.2 - envSlide * 0.58, 0.05 + envSlide * 0.6]} rotation={[-Math.PI / 2 + envSlide * 0.3, 0, 0.25 + envSlide * 0.6]} scale={Math.max(0.001, envOut)}>
                  <mesh castShadow>
                    <boxGeometry args={[0.62, 0.42, 0.03]} />
                    <meshStandardMaterial color="#FFFDF6" emissive="#FFFDF6" emissiveIntensity={0.25} flatShading />
                  </mesh>
                  <mesh position={[0, 0.08, 0.02]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1]}>
                    <boxGeometry args={[0.3, 0.3, 0.01]} />
                    <meshStandardMaterial color="#E9DCC8" />
                  </mesh>
                  <mesh position={[0.2, 0.12, 0.025]}>
                    <boxGeometry args={[0.1, 0.12, 0.01]} />
                    <meshStandardMaterial color="#C8372D" />
                  </mesh>
                </group>
              ) : null}
            </group>
          ) : (
            <group key={i} position={[x, -0.2, -0.6]}>
              <Chair color="#5FA8C8" />
              {SEATED.includes(i) ? (
                <group position={[0, 0, 0.05]} rotation={[0, loopSin(phase, 2 + i, t, 0.6) * 0.08, 0]}>
                  <Person sit color={SHIRTS[SEATED.indexOf(i)]} mood={i === 1 ? -0.4 : loopSin(phase, 3 + i, t, 0.7) * 0.3} />
                </group>
              ) : null}
            </group>
          ),
        )}
        {/* plant + side table with the phone */}
        <group position={reminders ? [4.9, -0.2, -1.8] : [-3.4, -0.2, -1.6]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.24, 0.6, 7]} />
            <meshStandardMaterial color="#C8553D" flatShading />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#4E9A5E" flatShading />
          </mesh>
        </group>
        <group position={[2.2, -0.2, 0.2]}>
          <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.64, 0.8]} />
            <meshStandardMaterial color="#B98A5E" flatShading />
          </mesh>
          <group position={[0, 1.15, 0.05]} rotation={[-0.15, -0.25, buzz]} scale={0.7}>
            <Phone screen="#2EC4B6" glow={0.55} lines={["Can't make it?", "Tap: REBOOK"]} />
          </group>
        </group>
        {reminders ? (
          <group position={[-3.5, -0.2, -2.6]}>
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[1.3, 2.5, 0.1]} />
              <meshStandardMaterial color="#2A6F68" flatShading />
            </mesh>
            <mesh position={[0, 1.2, 0.06]}>
              <boxGeometry args={[1.05, 2.3, 0.06]} />
              <meshStandardMaterial color="#F4D9B0" flatShading />
            </mesh>
            <mesh position={[0.38, 1.15, 0.12]}>
              <sphereGeometry args={[0.06, 6, 4]} />
              <meshStandardMaterial color="#C8A24A" />
            </mesh>
          </group>
        ) : null}
        {/* the patient who takes the seat once rebooking is one tap */}
        {guestOn ? (
          <group position={[guestX, -0.2, guestZ]} rotation={[0, guestRot, 0]}>
            <Person sit={guestSit} color="#F28482" walk={!guestSit && !atDoor ? (f / fps) * 1.8 : 0} mood={0.4} />
          </group>
        ) : null}

        {/* the villain's receipt: prints up out of the seat, to the chair's right */}
        {f >= rs - 2 && f < startF("clock") + 20 ? (
          <group position={[1.07, 0.6 + printK * 1.4, 0.5]} rotation={[0, -0.12, loopSin(phase, 3, t, 0.8) * 0.03]} scale={0.4}>
            <Receipt lines={["NO-SHOW", "EMPTY CHAIR"]} n={nLines} total="TOTAL  ~$196" />
          </group>
        ) : null}

        {/* reception: desk, receptionist, wall calendar, and the records */}
        <group position={[10.5, -0.2, -0.4]}>
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.1, 1.0]} />
            <meshStandardMaterial color="#F4D9B0" flatShading />
          </mesh>
          <mesh position={[0, 1.12, 0]}>
            <boxGeometry args={[3.3, 0.06, 1.1]} />
            <meshStandardMaterial color="#C8553D" flatShading />
          </mesh>
          {calls ? (
            <>
              {busyK > 0.01 ? (
                <>
                  <group position={[0.1, 0, -1.0]} scale={Math.max(0.001, Math.min(1, busyK))}>
                    <Person color="#2EC4B6" hair="#1E1A18" mood={loopSin(phase, 4, t, 1) * 0.4} />
                  </group>
                  <group position={[-1.1, 0, 1.0]} rotation={[0, Math.PI - 0.6, 0]} scale={Math.max(0.001, Math.min(1, busyK))}>
                    <Person color="#9B5DE5" hair="#C98B4B" />
                  </group>
                </>
              ) : null}
              {/* lunch: sandwich + tent card */}
              <group position={[-1.35, 1.15, 0.05]}>
                <mesh position={[0, 0.04, 0]}>
                  <boxGeometry args={[0.5, 0.06, 0.4]} />
                  <meshStandardMaterial color="#E9C46A" flatShading />
                </mesh>
                <mesh position={[0, 0.09, 0]}>
                  <boxGeometry args={[0.52, 0.04, 0.42]} />
                  <meshStandardMaterial color="#7CC6A4" flatShading />
                </mesh>
                <mesh position={[0, 0.14, 0]}>
                  <boxGeometry args={[0.5, 0.06, 0.4]} />
                  <meshStandardMaterial color="#E9C46A" flatShading />
                </mesh>
              </group>
              <group position={[-0.95, 1.15, 0.4]} rotation={[-0.25, 0.15, 0]}>
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.9, 0.4, 0.04]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
                </mesh>
                <mesh position={[0, 0.2, 0.025]}>
                  <planeGeometry args={[0.86, 0.36]} />
                  <meshStandardMaterial map={textTex("OUT TO LUNCH", "#C8372D", 64, 512, 200, "Arial Black, Arial", "#FFFFFF")} />
                </mesh>
              </group>
              {/* three desk phones: the middle rings at lunch, the right one goes dark */}
              {[0, 1, 2].map((i) => {
                const ring = deskRing && i === 1;
                const off = darkPhone && i === 2;
                return (
                  <group key={i} position={[-0.45 + i * 0.6, 1.5, 0.05]} rotation={[-0.15, -0.1, ring ? Math.sin(f * 2.4) * 0.07 : 0]} scale={0.36}>
                    <Phone screen={ring ? "#E86A3A" : "#2EC4B6"} glow={ring ? 0.85 : 0.45} lines={ring ? ["Incoming call", "New patient"] : ["Clinic line", "Ready"]} off={off} />
                    {ring ? (
                      <group position={[0, 0, 0.2]}>
                        {[0, 1, 2].map((k) => {
                          const q = (phase * 30 + k / 3) % 1;
                          return (
                            <mesh key={k} scale={0.6 + q * 1.6}>
                              <torusGeometry args={[1, 0.05, 4, 24]} />
                              <meshStandardMaterial color="#FFD21F" emissive="#FFD21F" emissiveIntensity={0.6} transparent opacity={1 - q} />
                            </mesh>
                          );
                        })}
                      </group>
                    ) : null}
                  </group>
                );
              })}
              {/* missed-call chips pile up over the dark phone */}
              {f >= startF("missed") && chipsOut > 0
                ? Array.from({ length: 6 }).map((_, i) => {
                    const k = Math.min(1, chipK(i));
                    return k > 0.01 ? (
                      <group key={i} position={[0.75 + (rnd(i + 2) - 0.5) * 0.5, 2.0 + i * 0.32, 0.25]} rotation={[0, 0, (rnd(i) - 0.5) * 0.3]} scale={Math.max(0.001, k * chipsOut) * 0.42}>
                        <Bubble text={"MISSED\nCALL"} bg="#F7C8C0" ink="#C8372D" w={1.6} />
                      </group>
                    ) : null;
                  })
                : null}
              {/* payoff: the instant text-back */}
              {textK > 0.01 && textPop < 1 ? (
                <group position={[0.15, 2.3, 0.4]} scale={Math.max(0.001, Math.min(1.1, textK) * 0.5 * (1 + textPop * 0.4))}>
                  <Bubble text={"SORRY WE MISSED YOU!\nTAP TO REBOOK"} bg="#BDF2D5" ink="#1E2A44" w={3.0} />
                </group>
              ) : null}
            </>
          ) : (
            <group position={[2.1, 0, -0.9]} scale={reminders && f >= startF("calendars") - 10 && f < nextF("calendars") ? 0.001 : 1}>
              <Person color="#2EC4B6" hair="#1E1A18" mood={loopSin(phase, 2, t, 0.5) * 0.3} />
            </group>
          )}
          {/* clipboard */}
          <group position={[1.0, 1.17, 0.1]} rotation={[-Math.PI / 2 + 0.25, 0, 0.2]}>
            <mesh>
              <boxGeometry args={[0.8, 1.05, 0.04]} />
              <meshStandardMaterial color="#B98A5E" flatShading />
            </mesh>
            <mesh position={[0, -0.04, 0.025]}>
              <planeGeometry args={[0.7, 0.88]} />
              <meshStandardMaterial map={textTex("VISIT LOG\n— — — —\n— — — —\n— — — —\n— — — —", "#2A1A12", 50, 256, 320, "Courier New, monospace", "#FFFDF6")} emissive="#FFFFFF" emissiveIntensity={0.15} />
            </mesh>
          </group>
        </group>
        <group position={[10.5, 2.55, -2.55]}>
          <mesh>
            <boxGeometry args={[3.2, 2.6, 0.08]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} flatShading />
          </mesh>
          <mesh position={[0, 1.12, 0.05]}>
            <planeGeometry args={[3.2, 0.36]} />
            <meshStandardMaterial color={VILLAIN} />
          </mesh>
          {SLOTS.map((i) => {
            const k = calls ? (i === 7 ? diaryK : 0) : NOSHOW.has(i) ? flipK([...NOSHOW].indexOf(i)) : 0;
            return (
              <group key={i} position={[-1.2 + (i % 5) * 0.6, 0.62 - Math.floor(i / 5) * 0.55, 0.06]} rotation={[0, Math.min(1, k) * Math.PI, 0]}>
                <mesh position={[0, 0, 0.005]}>
                  <boxGeometry args={[0.5, 0.45, 0.02]} />
                  <meshStandardMaterial color="#EAF4F2" />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[0.36, 0.1, 0.01]} />
                  <meshStandardMaterial color="#2EC4B6" />
                </mesh>
                {/* back face: the no-show */}
                <mesh position={[0, 0, -0.01]}>
                  <boxGeometry args={[0.5, 0.45, 0.01]} />
                  <meshStandardMaterial color={VILLAIN} emissive={VILLAIN} emissiveIntensity={0.2} />
                </mesh>
                <group position={[0, -0.16, -0.15]} rotation={[0, Math.PI, 0]} scale={0.26}>
                  <Chair color="#FFF1E6" />
                </group>
              </group>
            );
          })}
        </group>
        {reminders
          ? [
              { x: 13.1, h: 18.2, label: "BEFORE" },
              { x: 14.4, h: 17.0, label: "AFTER" },
            ].map((b, i) => {
              const k = Math.min(1, boardK(i));
              return (
                <group key={i} position={[b.x, 2.6, -2.56]}>
                  <mesh>
                    <boxGeometry args={[1.1, 2.4, 0.06]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} flatShading />
                  </mesh>
                  <mesh position={[0, -0.85 + (b.h * 0.085 * k) / 2, 0.05]} scale={[1, Math.max(0.001, k), 1]}>
                    <boxGeometry args={[0.6, b.h * 0.085, 0.05]} />
                    <meshStandardMaterial color={i ? "#2EC4B6" : VILLAIN} flatShading />
                  </mesh>
                  <mesh position={[0, 1.0, 0.05]}>
                    <planeGeometry args={[1.0, 0.26]} />
                    <meshStandardMaterial map={textTex(b.label, "#2A1A12", 70, 384, 100, "Arial Black, Arial", "#FFFFFF")} />
                  </mesh>
                </group>
              );
            })
          : null}
        {/* twelve years of records, stacked boxes behind the desk */}
        {f >= startF("ledger") - 10 && f < nextF("ledger") + 20
          ? Array.from({ length: 12 }).map((_, i) => {
              const k = boxK(i);
              return (
                <mesh key={i} position={[13.2 + (i % 3) * 0.62, 0.05 + Math.floor(i / 3) * 0.46 + (1 - Math.min(1, k)) * 2.5, -1.9]} rotation={[0, (rnd(i) - 0.5) * 0.2, 0]} scale={Math.max(0.001, k)} castShadow>
                  <boxGeometry args={[0.58, 0.42, 0.5]} />
                  <meshStandardMaterial color={["#E9C46A", "#F4A261", "#D4A373"][i % 3]} flatShading />
                </mesh>
              );
            })
          : null}

        {/* exam room: doctor ready, lamp on, coffee steaming, clock running */}
        <group position={[19.4, -0.2, -1.3]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.9, 1.0]} />
            <meshStandardMaterial color="#D6E0F5" flatShading />
          </mesh>
          <mesh position={[-0.55, 0.98, 0]}>
            <boxGeometry args={[0.7, 0.16, 0.9]} />
            <meshStandardMaterial color="#FFFFFF" flatShading />
          </mesh>
          <group position={[-0.5, 2.2, -0.9]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.2, 4]} />
              <meshStandardMaterial color="#3A3F48" />
            </mesh>
            <mesh>
              <coneGeometry args={[0.35, 0.4, 6]} />
              <meshStandardMaterial color="#FFE38A" emissive="#FFE38A" emissiveIntensity={lamp * 0.9} flatShading />
            </mesh>
          </group>
        </group>
        <group position={[20.9, -0.2, -0.2]} rotation={[0, -0.3, 0]}>
          <Person color="#F4F6F8" hair="#6B4226" mood={0.4 - slump * 1.0} />
        </group>
        <group position={[22.0, -0.2, -1.6]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.9, 0.7]} />
            <meshStandardMaterial color="#B98A5E" flatShading />
          </mesh>
          <group position={[0, 0.9, 0]}>
            <Mug phase={steam ? phase * 4 : 0} color={VILLAIN} />
          </group>
        </group>
        <mesh position={[22.6, 2.6, -2.56]}>
          <boxGeometry args={[1.0, 0.75, 0.05]} />
          <meshStandardMaterial color="#B98A5E" flatShading />
        </mesh>
        <mesh position={[22.6, 2.6, -2.52]}>
          <planeGeometry args={[0.8, 0.55]} />
          <meshStandardMaterial map={textTex("DIPLOMA\n~~~~", "#2A1A12", 70, 256, 176, undefined, "#FFF6DD")} emissive="#FFFFFF" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[18.0, 2.4, -2.56]}>
          <planeGeometry args={[0.8, 1.1]} />
          <meshStandardMaterial map={textTex("E\nF P\nT O Z", "#2A1A12", 60, 192, 264, "Arial", "#FFFFFF")} emissive="#FFFFFF" emissiveIntensity={0.15} />
        </mesh>
        <group position={[20.4, 3.0, -2.55]} scale={0.7}>
          <WallClock a={-2 * Math.PI * 10 * phase} />
        </group>
      </ThreeCanvas>

      {sc.num ? <NumPlate k={numK} num={sc.num} label={sc.label} /> : null}
      {!sc.num && sc.label && sc.state !== "ledger" ? (
        <div style={{ position: "absolute", left: 80, right: 160, top: 470, textAlign: "center", opacity: interpolate(f - msF(sc.startMs), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15, textTransform: "uppercase" }}>{sc.label}</span>
        </div>
      ) : null}
      {sc.state === "ledger" ? (
        <div style={{ position: "absolute", left: 80, right: 160, top: 470, textAlign: "center", opacity: interpolate(f - startF("ledger"), [8, 16], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: "#2A1A12", color: "#FFD21F", borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 46, lineHeight: 1.15 }}>VA HOSPITAL, HOUSTON<br />12 YEARS OF RECORDS</span>
        </div>
      ) : null}
      <Vignette />
      <HookBar text={p.topHook} accent={PAL.accent} />
      <Brand />
      <Cta captions={p.captions} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={CAPTION_PCT} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
