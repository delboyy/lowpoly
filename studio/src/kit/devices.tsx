import React from "react";
import { Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P, useLayout } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.out(Easing.cubic);
export const prog = (f: number, a: number, b: number, easing = easeOut) => interpolate(f, [a, b], [0, 1], { ...clamp, easing });

/** Torn/zig-zag bottom edge for the receipt. */
const ZigZag: React.FC<{ width: number; color: string; flip?: boolean }> = ({ width, color, flip }) => {
  const n = Math.round(width / 28);
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * width) / (n * 2)},${i % 2 ? 0 : 16}`).join(" ");
  return (
    <svg width={width} height={16} style={{ display: "block", transform: flip ? "scaleY(-1)" : undefined }}>
      <polygon points={`0,0 ${pts} ${width},0`} fill={color} />
    </svg>
  );
};

export type ReceiptLine = { label: string; value?: string; hl?: boolean; loss?: boolean; gain?: boolean; bold?: boolean };

/**
 * Thermal-paper receipt. Lines print one at a time (`lineFrames` apart) starting at `startFrame`.
 * `printSfx(i)` is NOT played here; templates add printer-chirp cues from `receiptCueTimesMs`.
 */
export const Receipt: React.FC<{
  title?: string;
  subtitle?: string;
  lines: ReceiptLine[];
  total?: { label: string; value?: string };
  startFrame?: number;
  lineFrames?: number;
  widthPx?: number;
  fontPx?: number;
}> = ({ title = "LINE ITEM", subtitle, lines, total, startFrame = 0, lineFrames = 9, widthPx = 820, fontPx = 40 }) => {
  const f = useCurrentFrame() - startFrame;
  const shown = (i: number) => prog(f, i * lineFrames, i * lineFrames + 5);
  const rowH = fontPx * 1.55;
  const slide = Math.max(0, f / lineFrames - 3.5) * 0; // reserved: receipt scroll when it overflows
  return (
    <div style={{ width: widthPx, transform: `translateY(${-slide}px)` }}>
      <div style={{ background: P.receipt, padding: `${fontPx * 0.9}px ${fontPx * 0.9}px ${fontPx * 0.5}px`, border: `2px solid #E4DECF`, borderBottom: "none", fontFamily: MONO, color: P.ink }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: fontPx * 1.1, letterSpacing: fontPx * 0.18 }}>{title}</div>
        {subtitle ? <div style={{ textAlign: "center", color: P.muted, fontSize: fontPx * 0.62, letterSpacing: 2, marginTop: 4 }}>{subtitle}</div> : null}
        <div style={{ borderTop: `3px dashed ${P.ink}`, margin: `${fontPx * 0.5}px 0` }} />
        {lines.map((l, i) => {
          const p = shown(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: rowH,
                fontSize: fontPx,
                fontWeight: l.bold ? 700 : 500,
                opacity: p,
                transform: `translateY(${(1 - p) * -12}px)`,
                color: l.loss ? P.lossText : l.gain ? P.gainText : P.ink,
              }}
            >
              <span>{l.label}</span>
              {l.value ? (
                <HighlightBox on={!!l.hl} progress={prog(f, i * lineFrames + 6, i * lineFrames + 16)}>
                  {l.value}
                </HighlightBox>
              ) : null}
            </div>
          );
        })}
        {total ? (
          <>
            <div style={{ borderTop: `3px dashed ${P.ink}`, margin: `${fontPx * 0.4}px 0` }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontPx * 1.05, fontWeight: 700, opacity: shown(lines.length), fontFamily: MONO }}>
              <span>{total.label}</span>
              <span>{total.value}</span>
            </div>
          </>
        ) : null}
      </div>
      <ZigZag width={widthPx} color={P.receipt} />
    </div>
  );
};

/** Receipt line print times (ms from receipt start) so a scene can schedule printer-chirp SFX. */
export const receiptCueTimesMs = (n: number, lineFrames = 9, fps = 30) => Array.from({ length: n }, (_, i) => ((i * lineFrames) / fps) * 1000);

/** The yellow highlighter swipe behind text (only when `on`). */
export const HighlightBox: React.FC<{ on: boolean; progress: number; children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ on, progress, children, color = P.highlight, style }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 10px", ...style }}>
    {on ? (
      <span style={{ position: "absolute", left: 0, top: "6%", bottom: "6%", width: `${progress * 100}%`, background: color, transform: "rotate(-0.8deg)", zIndex: 0 }} />
    ) : null}
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </span>
);

/** Marker swipe behind a word (Anton display). */
export const Marker: React.FC<{ progress: number; children: React.ReactNode }> = ({ progress, children }) => (
  <HighlightBox on progress={progress} style={{ padding: "0 0.12em" }}>
    {children}
  </HighlightBox>
);

/** Black redaction bar peels off (slides right) to reveal the number underneath. */
export const Redact: React.FC<{ children: React.ReactNode; startFrame?: number; peelFrames?: number; hl?: boolean }> = ({ children, startFrame = 20, peelFrames = 14, hl = true }) => {
  const f = useCurrentFrame();
  const p = prog(f, startFrame, startFrame + peelFrames, Easing.inOut(Easing.cubic));
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.18em", overflow: "hidden" }}>
      {hl ? <span style={{ position: "absolute", inset: "4% 0", background: P.highlight, opacity: p }} /> : null}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={{ position: "absolute", inset: "2% 0", background: P.ink, transform: `translateX(${p * 104}%) skewX(${-8 * (1 - p)}deg)`, zIndex: 2 }} />
    </span>
  );
};

/** Rubber stamp that slams in (scale 2.2 -> 1, rotation settles), 8 frames. */
export const Stamp: React.FC<{ text: string; color?: string; startFrame?: number; rotate?: number; size?: number }> = ({ text, color = P.loss, startFrame = 0, rotate = -9, size = 120 }) => {
  const f = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();
  const p = prog(f, 0, 8, Easing.in(Easing.cubic));
  const settle = interpolate(f, [8, 14], [0, 1], { ...clamp });
  if (f < 0) return null;
  const scale = interpolate(p, [0, 1], [2.4, 1]) + 0.04 * Math.sin(settle * Math.PI);
  return (
    <div
      style={{
        display: "inline-block",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: p,
        border: `${size * 0.07}px solid ${color}`,
        borderRadius: size * 0.1,
        padding: `${size * 0.04}px ${size * 0.22}px`,
        color,
        fontFamily: FONT.anton,
        fontSize: size,
        letterSpacing: size * 0.04,
        lineHeight: 1.1,
        mixBlendMode: "multiply",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <span style={{ display: "none" }}>{fps}</span>
    </div>
  );
};

/** Price tag that flips (rotateX) from one price to another at `flipFrame`. */
export const PriceTag: React.FC<{ from: string; to: string; label?: string; flipFrame?: number; size?: number }> = ({ from, to, label, flipFrame = 30, size = 120 }) => {
  const f = useCurrentFrame();
  const p = prog(f, flipFrame, flipFrame + 12, Easing.inOut(Easing.cubic));
  const angle = p * 180;
  const showTo = angle > 90;
  const swing = Math.sin(f / 9) * 2.2;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", transform: `rotate(${swing}deg)`, transformOrigin: "50% 0" }}>
      <div style={{ width: 4, height: size * 0.5, background: P.ink }} />
      <div
        style={{
          width: size * 3.1,
          padding: `${size * 0.18}px 0`,
          background: showTo ? P.highlight : P.receipt,
          border: `${size * 0.05}px solid ${P.ink}`,
          borderRadius: size * 0.16,
          textAlign: "center",
          transform: `perspective(900px) rotateX(${showTo ? angle - 180 : angle}deg)`,
          fontFamily: FONT.anton,
          fontSize: size,
          color: P.ink,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: size * 0.14, left: size * 0.22, width: size * 0.2, height: size * 0.2, borderRadius: "50%", background: P.paper, border: `3px solid ${P.ink}` }} />
        {showTo ? to : from}
        {label ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: size * 0.2, color: P.muted, letterSpacing: 2 }}>{label}</div> : null}
      </div>
    </div>
  );
};

/** Source chip, bottom-left. Shows for the scene duration after `startFrame` (fades in). */
export const SourceChip: React.FC<{ text: string; startFrame?: number }> = ({ text, startFrame = 6 }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useLayout();
  const p = prog(f, startFrame, startFrame + 8);
  return (
    <div
      style={{
        position: "absolute",
        left: (portrait ? 40 : 70) * u,
        bottom: (portrait ? 400 : 24) * u,
        background: P.ink,
        color: P.receipt,
        fontFamily: FONT.inter,
        fontWeight: 700,
        fontSize: 28 * u,
        padding: `${12 * u}px ${24 * u}px`,
        borderRadius: 12 * u,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        maxWidth: (portrait ? 1000 : 1400) * u,
      }}
    >
      {text}
    </div>
  );
};

/** Paper background: cream + grain multiply + faint horizontal ruling (thermal-paper feel). */
export const PaperBg: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{ position: "absolute", inset: 0, background: dark ? `radial-gradient(120% 80% at 50% 30%, ${P.night2}, ${P.night} 62%)` : P.paper }}>
    {!dark ? <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,19,15,.035) 0 2px, transparent 2px 7px)" }} /> : null}
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${staticFile("assets/tex/grain-512.png")})`, backgroundSize: "512px", mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.05 : 0.07 }} />
  </div>
);
