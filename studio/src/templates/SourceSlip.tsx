import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import { P, useLayout } from "../kit/theme";

/**
 * Source credit as a small receipt slip (cream paper, dashed edge, mono type, tiny red tick stamp),
 * replacing the old black chip. Shows ~3 s with the number, then slides away.
 */
export const SourceSlip: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const inP = interpolate(f, [6, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(f, [fps * 3.2, fps * 3.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = inP * (1 - outP);
  if (p <= 0) return null;
  const [src, ...rest] = text.split(" · ");
  return (
    <div
      data-gv="chip"
      style={{
        position: "absolute",
        width: "fit-content",
        left: (portrait ? 60 : 70) * u,
        bottom: (portrait ? 490 : 190) * u, // portrait: y1370-1430 (safe box x60-920, y220-1440)
        maxWidth: (portrait ? 880 : 1500) * u,
        background: P.receipt,
        border: `${3 * u}px solid ${P.ink}`,
        padding: `${10 * u}px ${30 * u}px ${10 * u}px ${18 * u}px`,
        transform: `translateX(${(1 - p) * -60 * u}px) rotate(0deg)`,
        opacity: p,
        color: P.ink,
        display: "flex",
        alignItems: "center",
        gap: 14 * u,
      }}
    >
      <div style={{ width: 40 * u, height: 40 * u, borderRadius: "50%", border: `${3 * u}px solid ${P.loss}`, color: P.lossText, fontFamily: FONT.anton, fontSize: 26 * u, lineHeight: `${34 * u}px`, textAlign: "center", flexShrink: 0 }}>✓</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * u, lineHeight: 1.2, whiteSpace: "nowrap" }}>
        <span>{src}</span>
        {rest.length ? <span> · {rest.join(" · ")}</span> : null}
      </div>
    </div>
  );
};
