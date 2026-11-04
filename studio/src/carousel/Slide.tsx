import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../lib/fonts";

// Carousel slide (1080×1350, Instagram 4:5). Art is a full-bleed background; every word and figure is
// code-rendered on top, so numbers are exact. Text stays inside SAFE px of every edge (and inside the
// 3:4 grid crop, which trims ~34 px off each side).
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
const SAFE = 76;

export const C = { cream: "#F4E9D8", ink: "#2A1A12", teal: "#1F7F78", tealBright: "#2BB3A3", orange: "#E8572A", yellow: "#F2B33D" };

export type SlideData = {
  kind: "hook" | "beat" | "fix" | "cta";
  num?: string;
  kicker?: string;
  head?: string;
  quote?: string; // character line, shown in italics above the head (villain format)
  body?: string;
  source?: string; // shown as "Source: …"
  note?: string; // small print shown verbatim (e.g. "Advice, not study findings")
  ctaHead?: string; // inline CTA under the body on a non-cta slide: ctaHead, then [cta] button + ctaTail
  cta?: string;
  ctaTail?: string;
  handle?: string;
};

// Locked copy may mark emphasis: **figure** → bold orange, *word* → italic.
const rich = (t: string) =>
  t.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("**") ? <span key={i} style={{ color: C.orange, fontWeight: 900, whiteSpace: "nowrap" }}>{part.slice(2, -2)}</span>
    : part.startsWith("*") && part.length > 2 ? <em key={i} style={{ fontWeight: 900, color: C.orange }}>{part.slice(1, -1)}</em>
    : part);

export type SlideProps = {
  slide: SlideData;
  index: number; // 1-based
  total: number;
  image?: string; // path under public/
  // Animation hooks for the reel (all 0/1 for stills).
  zoom?: number; // background scale
  textIn?: number; // 0..1 entrance of the text panel
  footer?: boolean; // brand tag + counter/swipe cue (off in the reel, which has its own)
};

const Pill: React.FC<{ children: React.ReactNode; bg: string; color?: string; size?: number }> = ({ children, bg, color = "#fff", size = 30 }) => (
  <span style={{ display: "inline-block", background: bg, color, borderRadius: 999, padding: `${size * 0.28}px ${size * 0.8}px`, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: size, letterSpacing: 2, textTransform: "uppercase" }}>{children}</span>
);

export const Slide: React.FC<SlideProps> = ({ slide: s, index, total, image, zoom = 1, textIn = 1, footer = true }) => {
  const rise = (d: number) => ({ opacity: Math.min(1, Math.max(0, textIn * 1.6 - d)), transform: `translateY(${(1 - Math.min(1, Math.max(0, textIn * 1.6 - d))) * 40}px)` });
  const isCta = s.kind === "cta";
  return (
    <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
      {image ? (
        <Img src={staticFile(image)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: "50% 70%" }} />
      ) : null}
      {/* Soft cream lift at the top so the panel edge never fights busy art. */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream}cc 0%, ${C.cream}00 38%)` }} />

      {!isCta ? (
        <div style={{ position: "absolute", top: SAFE, left: SAFE, right: SAFE, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
          {s.kicker ? <div style={rise(0)}><Pill bg={C.teal}>{s.kicker}</Pill></div> : null}
          <div style={{ ...rise(0.1), background: `${C.cream}f2`, borderRadius: 34, padding: s.num ? "26px 44px 34px" : "34px 44px", boxShadow: "0 14px 0 rgba(42,26,18,.12)", maxWidth: SLIDE_W - SAFE * 2 }}>
            {s.num ? (
              <div style={{ fontFamily: FONT.anton, fontSize: s.num.length > 8 ? 132 : 176, lineHeight: 1.04, color: C.orange, letterSpacing: 1 }}>{s.num}</div>
            ) : null}
            {s.quote ? <div style={{ marginBottom: 14, fontFamily: FONT.montserrat, fontWeight: 700, fontStyle: "italic", fontSize: 40, lineHeight: 1.2, color: C.teal }}>“{rich(s.quote)}”</div> : null}
            {s.head ? <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: s.num ? 52 : s.head.length > 60 ? 54 : 64, lineHeight: 1.1, color: C.ink, letterSpacing: -0.5, textWrap: "balance" } as React.CSSProperties}>{rich(s.head)}</div> : null}
            {s.body ? <div style={{ marginTop: s.head ? 16 : 0, fontFamily: FONT.montserrat, fontWeight: 600, fontSize: s.body.length > 130 ? 35 : 40, lineHeight: 1.22, color: s.head ? C.teal : C.ink }}>{rich(s.body)}</div> : null}
            {s.ctaHead ? (
              <div style={{ marginTop: 24, paddingTop: 22, borderTop: `3px dashed ${C.ink}33` }}>
                <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 42, lineHeight: 1.12, color: C.ink }}>{s.ctaHead}</div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
                  <span style={{ background: C.orange, color: "#fff", borderRadius: 20, padding: "8px 30px", fontFamily: FONT.anton, fontSize: 64, lineHeight: 1.1, letterSpacing: 1, boxShadow: `0 7px 0 ${C.ink}` }}>{s.cta}</span>
                  {s.ctaTail ? <span style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 36, color: C.teal }}>{s.ctaTail}</span> : null}
                </div>
              </div>
            ) : null}
            {s.source ? <div style={{ marginTop: 18, fontFamily: FONT.inter, fontWeight: 600, fontSize: 22, color: `${C.ink}99` }}>Source: {s.source}</div> : null}
            {s.note ? <div style={{ marginTop: 18, fontFamily: FONT.inter, fontWeight: 600, fontSize: 22, color: `${C.ink}99` }}>{s.note}</div> : null}
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: SAFE, left: SAFE, right: SAFE, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: `${C.cream}f2`, borderRadius: 40, padding: "40px 40px 46px", boxShadow: "0 14px 0 rgba(42,26,18,.12)", ...rise(0) }}>
          <Img src={staticFile("carousel/brand/avatar.png")} style={{ width: 150, height: 150, borderRadius: 999 }} />
          <div style={{ marginTop: 18, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 60, lineHeight: 1.1, color: C.ink, textWrap: "balance" } as React.CSSProperties}>{s.head ? rich(s.head) : null}</div>
          <div style={{ marginTop: 28, background: C.orange, color: "#fff", borderRadius: 26, padding: "18px 52px", fontFamily: FONT.anton, fontSize: s.cta && s.cta.length > 8 ? 84 : 104, lineHeight: 1.05, letterSpacing: 2, boxShadow: `0 10px 0 ${C.ink}` }}>{s.cta}</div>
          {s.body ? <div style={{ marginTop: 26, fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 44, color: C.teal }}>{s.body}</div> : null}
          {s.handle ? <div style={{ marginTop: 10, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 32, color: `${C.ink}aa` }}>{s.handle}</div> : null}
        </div>
      )}

      {/* Footer: brand tag left, counter (and swipe cue on the hook) right. */}
      {footer ? <div style={{ position: "absolute", left: SAFE, right: SAFE, bottom: SAFE - 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Pill bg={C.ink} color={C.cream} size={22}>Business Leaks</Pill>
        {index === 1 ? <Pill bg={C.orange} size={26}>Swipe →</Pill> : <Pill bg={`${C.cream}e6`} color={C.ink} size={22}>{`${index} / ${total}`}</Pill>}
      </div> : null}
    </AbsoluteFill>
  );
};
