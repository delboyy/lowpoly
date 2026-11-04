import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../lib/fonts";
import { C, SLIDE_H, SLIDE_W, Slide, SlideData } from "./Slide";

// Style comparison sheet: one row per art style, every slide at 1/4 size.
export type SheetProps = { title: string; slides: SlideData[]; rows: { label: string; images: (string | undefined)[] }[] };

export const SHEET = { scale: 0.25, gap: 14, label: 300, head: 90 };
export const sheetSize = (p: SheetProps) => ({
  width: Math.ceil(SHEET.label + p.slides.length * (SLIDE_W * SHEET.scale + SHEET.gap) + SHEET.gap),
  height: Math.ceil(SHEET.head + p.rows.length * (SLIDE_H * SHEET.scale + SHEET.gap) + SHEET.gap),
});

export const CarouselSheet: React.FC<SheetProps> = ({ title, slides, rows }) => {
  const w = SLIDE_W * SHEET.scale, h = SLIDE_H * SHEET.scale;
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <div style={{ position: "absolute", left: 28, top: 26, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 38, color: C.ink }}>{title}</div>
      {rows.map((r, ri) => (
        <React.Fragment key={ri}>
          <div style={{ position: "absolute", left: 28, width: SHEET.label - 50, top: SHEET.head + ri * (h + SHEET.gap) + h / 2 - 50, fontFamily: FONT.montserrat, color: C.ink }}>
            <div style={{ fontFamily: FONT.anton, fontSize: 64, color: C.orange, lineHeight: 1 }}>{String.fromCharCode(65 + ri)}</div>
            <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.15 }}>{r.label}</div>
          </div>
          {slides.map((s, i) => (
            <div key={i} style={{ position: "absolute", left: SHEET.label + i * (w + SHEET.gap), top: SHEET.head + ri * (h + SHEET.gap), width: w, height: h, overflow: "hidden", borderRadius: 10 }}>
              <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${SHEET.scale})`, transformOrigin: "0 0", position: "relative" }}>
                <Slide slide={s} index={i + 1} total={slides.length} image={r.images[i]} />
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
