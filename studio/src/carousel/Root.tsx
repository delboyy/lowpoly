import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { Slide, SLIDE_H, SLIDE_W, SlideProps } from "./Slide";
import { CarouselReel, ReelProps, reelDuration } from "./Reel";
import { CarouselSheet, SheetProps, sheetSize } from "./Sheet";

const FPS = 30;
const reelMeta: CalculateMetadataFunction<ReelProps> = ({ props }) => ({ durationInFrames: Math.max(1, reelDuration(props, FPS)) });

export const CarouselRoot: React.FC = () => (
  <>
    <Composition id="CarouselSlide" component={Slide} width={SLIDE_W} height={SLIDE_H} fps={FPS} durationInFrames={1} defaultProps={{ slide: { kind: "hook", num: "7 in 10", head: "online carts never check out" }, index: 1, total: 7 } as SlideProps} />
    <Composition id="CarouselSheet" component={CarouselSheet} width={1000} height={1000} fps={FPS} durationInFrames={1} defaultProps={{ title: "", slides: [], rows: [] } as SheetProps} calculateMetadata={({ props }: { props: SheetProps }) => sheetSize(props)} />
    <Composition id="CarouselReel" component={CarouselReel} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={{ slides: [], images: [], timings: [{ startMs: 0, durationMs: 3000 }] } as ReelProps} calculateMetadata={reelMeta} />
  </>
);
