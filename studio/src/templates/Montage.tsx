import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { DEFAULT_THEME, MontageProps, MontageShot, SfxCue, Theme } from "../lib/types";

const CARD_GRADIENTS = [
  ["#FF3D00", "#7A0A00"], ["#00C2FF", "#003A66"], ["#7C4DFF", "#1A0A55"], ["#00E676", "#003D1F"], ["#FFD600", "#6B4E00"], ["#FF4081", "#5A0030"],
];
const STINGS = ["pixabay-pop", "impact-light", "pop-pluck", "pixabay-ping", "pop-select"];

const Shot: React.FC<{ shot: MontageShot; idx: number; theme: Theme }> = ({ shot, idx, theme }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(f, [0, durationInFrames], [1, 1.14], { easing: Easing.out(Easing.quad) });
  const g = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  const media = shot.media;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {media ? (
          /\.(mp4|mov|webm)$/i.test(media) ? (
            <OffthreadVideo src={staticFile(media)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Img src={staticFile(media)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${g[0]}, ${g[1]} 75%)`, justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: 460, lineHeight: 1, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45))", marginTop: 80 }}>{shot.emoji ?? "💥"}</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.5) 100%)" }} />
      {shot.text ? (
        <div
          style={{
            position: "absolute",
            top: 190,
            left: 50,
            right: 50,
            padding: "26px 34px",
            background: "rgba(0,0,0,.72)",
            borderRadius: 28,
            fontFamily: FONT.montserrat,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.12,
            textAlign: "center",
            color: theme.text,
            textTransform: "uppercase",
            transform: `scale(${interpolate(f, [0, 5], [0.9, 1], { extrapolateRight: "clamp" })})`,
          }}
        >
          {shot.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Each scene's shots split its duration evenly (author ~0.6-1.2 s per shot; bin/make.mjs warns outside that range). */
const planShots = (scenes: MontageProps["scenes"]) =>
  scenes.flatMap((s) =>
    s.shots.map((shot, i) => ({ shot, startMs: s.startMs + (i * s.durationMs) / s.shots.length, durationMs: s.durationMs / s.shots.length })),
  );

export const FastCutMontage: React.FC<MontageProps> = (p) => {
  const { fps } = useVideoConfig();
  const theme = { ...DEFAULT_THEME, ...p.theme };
  const plan = planShots(p.scenes);
  const sfx: SfxCue[] = plan.flatMap((c, i) => (c.shot.sfx === null ? [] : [{ atMs: c.startMs, src: c.shot.sfx ?? (i === 0 ? "boom-meme" : STINGS[i % STINGS.length]), volume: i === 0 ? 0.5 : 0.3 }]));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plan.map((c, i) => (
        <Sequence key={i} from={Math.round((c.startMs / 1000) * fps)} durationInFrames={Math.max(1, Math.round((c.durationMs / 1000) * fps))}>
          <Shot shot={c.shot} idx={i} theme={theme} />
        </Sequence>
      ))}
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent={theme.accent} positionPct={p.captionStyle === "karaoke" ? 80 : 66} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
