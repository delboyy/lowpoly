import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import type { Caption } from "@remotion/captions";
import { Captions } from "../components/Captions";
import type { CaptionStyle } from "../lib/captions";

export type CaptionedVideoProps = {
  videoSrc: string; // path under /public (bin/caption-video.mjs links your file there)
  captions: Caption[];
  style: CaptionStyle;
  durationMs: number;
  fit?: "cover" | "contain";
  accent?: string;
};

/** Source video (any aspect) -> 1080x1920 with captions. The Clipper can use this directly or import <Captions/>. */
export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({ videoSrc, captions, style, fit = "cover", accent }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo src={staticFile(videoSrc)} style={{ width: "100%", height: "100%", objectFit: fit }} />
    <Captions captions={captions} style={style} accent={accent} />
  </AbsoluteFill>
);
