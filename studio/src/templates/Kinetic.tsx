import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { GradientBg } from "../components/Backgrounds";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { DEFAULT_THEME, KineticProps, KineticScene, SfxCue, Theme } from "../lib/types";

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%]/g, "");

const Scene: React.FC<{ scene: KineticScene; theme: Theme }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = scene.text.split(/\s+/).filter(Boolean);
  const emph = new Set((scene.emphasis ?? []).map(norm));
  const chars = scene.text.length;
  const base = Math.max(76, Math.min(138, 190 - chars * 1.7));

  // exit: scale up + fade + slide up over the last 6 frames
  const exitP = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          gap: `0 ${base * 0.28}px`,
          transform: `translateY(${-exitP * 70 - 120}px) scale(${1 + exitP * 0.18})`,
          opacity: 1 - exitP,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        {words.map((w, i) => {
          const isE = emph.has(norm(w));
          const p = interpolate(frame - i * 3, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: isE ? FONT.anton : FONT.montserrat,
                fontWeight: 900,
                fontSize: isE ? base * 1.6 : base,
                color: isE ? theme.accent : theme.text,
                textTransform: "uppercase",
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
                letterSpacing: isE ? 2 : -1,
                textShadow: isE ? `0 0 40px ${theme.accent}55` : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {/* accent rule that draws on */}
      <div
        style={{
          position: "absolute",
          top: "17%",
          width: interpolate(frame, [0, 18], [0, 220], { extrapolateRight: "clamp", easing: Easing.out(Easing.exp) }),
          height: 8,
          background: theme.accent,
          borderRadius: 4,
        }}
      />
      <div style={{ display: "none" }}>{fps}</div>
    </AbsoluteFill>
  );
};

export const KineticExplainer: React.FC<KineticProps> = (p) => {
  const { fps } = useVideoConfig();
  const theme = { ...DEFAULT_THEME, ...p.theme };
  const auto: SfxCue[] = p.scenes.flatMap((s, i) => {
    if (s.sfx === null) return [];
    return [{ atMs: s.startMs, src: s.sfx ?? (i === 0 ? "pixabay-impact-bass-1" : "pixabay-whoosh-short"), volume: i === 0 ? 0.5 : 0.28 }];
  });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <GradientBg theme={theme} />
      {p.scenes.map((s, i) => (
        <Sequence key={i} from={Math.round((s.startMs / 1000) * fps)} durationInFrames={Math.max(1, Math.round((s.durationMs / 1000) * fps))}>
          <Scene scene={s} theme={theme} />
        </Sequence>
      ))}
      {p.captionStyle !== "none" ? (
        <Captions captions={p.captions} style={p.captionStyle} accent={theme.accent} positionPct={p.captionStyle === "karaoke" ? 78 : 70} />
      ) : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...auto, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
