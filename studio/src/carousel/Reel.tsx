import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../lib/fonts";
import { C, SLIDE_H, Slide, SlideData } from "./Slide";

// 9:16 slideshow of the same 4:5 slides: the slide sits in the Reels safe band (y 285–1635),
// with slow Ken Burns on the art, a text rise on each cut and the existing voiceover underneath.
export type ReelProps = {
  slides: SlideData[];
  images: (string | undefined)[];
  timings: { startMs: number; durationMs: number }[]; // one per slide
  voSrc?: string;
};

export const reelDuration = (p: ReelProps, fps: number) => {
  const last = p.timings[p.timings.length - 1];
  return Math.ceil(((last.startMs + last.durationMs) / 1000) * fps);
};

const TOP = 285;
const XF = 8; // crossfade frames

const One: React.FC<{ p: ReelProps; i: number; frames: number }> = ({ p, i, frames }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, XF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(f, [0, frames + XF], [1.0, 1.07], { extrapolateRight: "clamp" });
  const textIn = interpolate(f, [2, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: i === 0 ? 1 : fade }}>
      <div style={{ position: "absolute", top: TOP, left: 0, width: 1080, height: SLIDE_H, overflow: "hidden" }}>
        <Slide slide={p.slides[i]} index={i + 1} total={p.slides.length} image={p.images[i]} footer={false} zoom={zoom} textIn={i === 0 && f < 2 ? 1 : textIn} />
      </div>
    </AbsoluteFill>
  );
};

export const CarouselReel: React.FC<ReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const total = reelDuration(p, fps);
  const cur = p.timings.findIndex((t) => f < Math.round(((t.startMs + t.durationMs) / 1000) * fps));
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {p.timings.map((t, i) => {
        const from = Math.round((t.startMs / 1000) * fps);
        const dur = (i === p.timings.length - 1 ? total : Math.round(((t.startMs + t.durationMs) / 1000) * fps)) - from + XF;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <One p={p} i={i} frames={dur} />
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 34, letterSpacing: 6, color: C.ink }}>BUSINESS LEAKS</div>
      <div style={{ position: "absolute", top: TOP + SLIDE_H + 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14 }}>
        {p.slides.map((_, i) => (
          <div key={i} style={{ width: i === cur ? 44 : 14, height: 14, borderRadius: 7, background: i === cur ? C.orange : `${C.ink}33` }} />
        ))}
      </div>
      {p.voSrc ? <Audio src={staticFile(p.voSrc)} /> : null}
    </AbsoluteFill>
  );
};
