import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import "../lib/fonts";
import { FONT } from "../lib/fonts";
import { CaptionStyle, createPages } from "../lib/captions";

export type CaptionsProps = {
  /** Word-level captions (Remotion `Caption` type; startMs/endMs relative to the start of the enclosing Sequence). */
  captions: Caption[];
  /** "hormozi" = word-pop (recipe 1), "karaoke" = sentence pill (recipe 2). */
  style?: CaptionStyle;
  /** Active-word colour. hormozi default #FFE600, karaoke default #FFE600. */
  accent?: string;
  /** Vertical centre of the caption block as % of frame height. hormozi default 64, karaoke default 70. */
  positionPct?: number;
  /** Multiplier on the default font size. */
  fontScale?: number;
};

const HOLD_AFTER_MS = 350; // keep last page briefly during pauses, then hide

/**
 * Renders captions from word timestamps. Time is the local frame of the enclosing <Sequence>
 * (or the composition), so wrap it in a <Sequence from={...}> to shift it.
 */
export const Captions: React.FC<CaptionsProps> = ({
  captions,
  style = "hormozi",
  accent = "#FFE600",
  positionPct,
  fontScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = React.useMemo(() => createPages(captions, style), [captions, style]);
  const nowMs = (frame / fps) * 1000;

  // current page: latest page that has started; hide if we're well past its end and the next hasn't started
  let idx = -1;
  for (let i = 0; i < pages.length; i++) if (pages[i].startMs <= nowMs) idx = i;
  if (idx < 0) return null;
  const page = pages[idx];
  if (nowMs > page.endMs + HOLD_AFTER_MS) return null;

  const top = positionPct ?? (style === "hormozi" ? 64 : 70);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: `${top}%`,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {style === "hormozi" ? (
          <HormoziPage page={page} nowMs={nowMs} accent={accent} fontScale={fontScale} />
        ) : (
          <KaraokePage page={page} nowMs={nowMs} accent={accent} fontScale={fontScale} />
        )}
      </div>
    </AbsoluteFill>
  );
};

type PageProps = { page: ReturnType<typeof createPages>[number]; nowMs: number; accent: string; fontScale: number };

const HormoziPage: React.FC<PageProps> = ({ page, nowMs, accent, fontScale }) => {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 28px",
        fontFamily: FONT.anton,
        fontSize: 104 * fontScale,
        lineHeight: 1.12,
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      {page.words.map((w, i) => {
        const active = nowMs >= w.startMs && nowMs < (page.words[i + 1]?.startMs ?? w.endMs + HOLD_AFTER_MS);
        // pop: 1 -> 1.15 -> 1 over ~8 frames, driven by a spring
        const sinceFrames = ((nowMs - w.startMs) / 1000) * fps;
        const p = active ? spring({ frame: sinceFrames, fps, durationInFrames: 8, config: { damping: 12, stiffness: 220, mass: 0.6 } }) : 0;
        const scale = active ? 1 + 0.15 * Math.sin(Math.min(1, Math.max(0, p)) * Math.PI) : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active ? accent : "#fff",
              transform: `scale(${scale})`,
              WebkitTextStroke: "14px #000", // 7px visible outside after paint-order
              paintOrder: "stroke fill",
              textShadow: "0 6px 14px rgba(0,0,0,.55)",
              strokeLinejoin: "round",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

const KaraokePage: React.FC<PageProps> = ({ page, nowMs, accent, fontScale }) => (
  <div
    style={{
      background: "rgba(0,0,0,0.55)",
      borderRadius: 24,
      padding: "26px 40px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "0 18px",
      fontFamily: FONT.montserrat,
      fontWeight: 800,
      fontSize: 64 * fontScale,
      lineHeight: 1.25,
      textAlign: "center",
      maxWidth: 960,
    }}
  >
    {page.words.map((w, i) => {
      const spoken = nowMs >= w.endMs;
      const active = nowMs >= w.startMs && !spoken;
      return (
        <span key={i} style={{ color: active ? accent : spoken ? "#fff" : "rgba(255,255,255,0.55)" }}>
          {w.text}
        </span>
      );
    })}
  </div>
);
