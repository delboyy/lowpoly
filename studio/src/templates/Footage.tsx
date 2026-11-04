import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { MontageProps, MontageShot, SfxCue } from "../lib/types";

// Line Item v3 "Footage" (pilot 2026-10-23): full-bleed real footage, hard cuts, a slim hook bar for the whole clip,
// spring-loaded number punches on the beat. SFX only on number punches and the first frame (Nathan rule 5: few SFX, real beats).
export type FootageShot = MontageShot & {
  start?: number; // seconds into the source clip
  archival?: boolean; // 1950s film: slight grain + warm vignette, never zoomed past 1.08
  num?: string; // number punch, e.g. "$8.2B"
  numLabel?: string; // one line under the number
};
export type FootageProps = MontageProps & { topHook?: string };

const YELLOW = "#FFD21F";

export const Shot: React.FC<{ shot: FootageShot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const zoom = interpolate(f, [0, durationInFrames], [1.02, shot.archival ? 1.08 : 1.12], { easing: Easing.out(Easing.quad) });
  const pop = spring({ frame: f, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  const media = shot.media;
  const start = Math.round((shot.start ?? 0) * fps);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: shot.archival ? "saturate(1.15) contrast(1.05)" : "saturate(1.05)" }}>
        {media && /\.(mp4|mov|webm)$/i.test(media) ? (
          <OffthreadVideo src={staticFile(media)} startFrom={start} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : media ? (
          <Img src={staticFile(media)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
      {shot.archival ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(40,20,0,.45) 100%)" }} /> : null}
      {shot.num ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", paddingBottom: 260 }}>
          <div
            style={{
              background: YELLOW,
              color: "#0B0B0B",
              fontFamily: FONT.anton,
              fontSize: 230,
              lineHeight: 1,
              padding: "18px 44px 8px",
              transform: `scale(${0.6 + 0.4 * pop}) rotate(${(1 - pop) * -4}deg)`,
              boxShadow: "0 24px 60px rgba(0,0,0,.5)",
            }}
          >
            {shot.num}
          </div>
          {shot.numLabel ? (
            <div
              style={{
                marginTop: 26,
                background: "rgba(0,0,0,.78)",
                color: "#fff",
                fontFamily: FONT.montserrat,
                fontWeight: 800,
                fontSize: 44,
                padding: "12px 26px",
                maxWidth: 900,
                textAlign: "center",
                opacity: interpolate(f, [4, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              {shot.numLabel}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const planShots = (scenes: MontageProps["scenes"]) => {
  const plan = scenes.flatMap((s) => s.shots.map((shot, i) => ({ shot: shot as FootageShot, startMs: s.startMs + (i * s.durationMs) / s.shots.length, durationMs: s.durationMs / s.shots.length })));
  if (plan.length) plan[plan.length - 1].durationMs += 1000; // run through the render tail: no black end frames (QA ve-v30)
  return plan;
};

export const Footage: React.FC<FootageProps> = (p) => {
  const { fps } = useVideoConfig();
  const plan = planShots(p.scenes);
  const sfx: SfxCue[] = plan.flatMap((c, i) =>
    c.shot.sfx === null ? [] : c.shot.sfx ? [{ atMs: c.startMs, src: c.shot.sfx, volume: 0.35 }] : c.shot.num ? [{ atMs: c.startMs, src: "impact-punch-heavy", volume: 0.32 }] : i === 0 ? [{ atMs: 0, src: "pixabay-whoosh-short", volume: 0.3 }] : [],
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plan.map((c, i) => (
        <Sequence key={i} from={Math.round((c.startMs / 1000) * fps)} durationInFrames={Math.max(1, Math.round((c.durationMs / 1000) * fps))}>
          <Shot shot={c.shot} />
        </Sequence>
      ))}
      {p.topHook ? (
        <div
          style={{
            position: "absolute",
            top: 290,
            left: 60,
            right: 160,
            padding: "16px 24px",
            background: "#0B0B0B",
            borderLeft: `10px solid ${YELLOW}`,
            fontFamily: FONT.montserrat,
            fontWeight: 900,
            fontSize: 46,
            lineHeight: 1.15,
            color: "#fff",
            textTransform: "uppercase",
          }}
        >
          {p.topHook}
        </div>
      ) : null}
      <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,.75)" }}>LINE ITEM</div>
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent={YELLOW} positionPct={70} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
