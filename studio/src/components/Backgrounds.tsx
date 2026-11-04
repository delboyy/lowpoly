import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Theme } from "../lib/types";

/** Dark gradient with a slow drift. `grid` adds the data-reveal grid. */
export const GradientBg: React.FC<{ theme: Theme; grid?: boolean }> = ({ theme, grid }) => {
  const f = useCurrentFrame();
  const a = 160 + Math.sin(f / 90) * 25;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% ${30 + Math.sin(f / 120) * 6}%, ${theme.bg2} 0%, ${theme.bg} 62%)`,
      }}
    >
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.05) 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0 ${f * 0.4}px`,
            opacity: 0.9,
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 85%)",
          }}
        />
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 100%, ${theme.accent}22, transparent ${a}%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};
