import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { P, useLayout } from "../kit/theme";

/** 8-frame paper tear: a sheet with a zig-zag bottom edge sweeps down over the cut. Place in a Sequence of 8 frames before the scene starts. */
export const TearWipe: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  const { width, height } = useLayout();
  const p = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const n = 24, z = 28;
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * width) / (n * 2)},${i % 2 ? 0 : z}`).join(" ");
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height: height + z, transform: `translateY(${-(1 - p) * (height + z)}px)` }}>
      <div style={{ position: "absolute", inset: `0 0 ${z}px 0`, background: dark ? P.night : "#E4DECF" }} />
      <svg width={width} height={z} style={{ position: "absolute", left: 0, top: height }}>
        <polygon points={`0,0 ${pts} ${width},0`} fill={dark ? P.night : "#E4DECF"} />
      </svg>
    </div>
  );
};
