import React from "react";
import { useCurrentFrame } from "remotion";
import { P, useLayout } from "../kit/theme";
import { MONO } from "../lib/fonts";

/** Portrait filler for the empty bottom/edges (secondary motion): perforated edges + a receipt roll rising from the bottom. */
export type TabEntry = { label: string; value: string; delay?: number };

/** Portrait filler for the empty bottom/edges: perforated edges + a receipt roll rising from the bottom that
 *  prints the story's REAL figures as they are revealed ("running tab"). The newest entry prints at scene start. */
export const Decor: React.FC<{ dark?: boolean; tab?: TabEntry[] }> = ({ dark, tab = [] }) => {
  const f = useCurrentFrame();
  const { u, portrait, width, height } = useLayout();
  if (!portrait) return null;
  const hole = dark ? "rgba(255,255,255,.10)" : "rgba(20,19,15,.16)";
  const drift = (f * 0.6) % 70;
  const slipTop = 1500 * u - Math.sin(f / 40) * 5;
  const paper = dark ? "#262042" : P.receipt;
  const ink = dark ? "rgba(255,255,255,.75)" : P.ink;
  const n = Math.round((720 * u) / 26);
  const shown = tab.slice(-4);
  return (
    <>
      {[26, width - 26].map((x, k) => (
        <div key={k} style={{ position: "absolute", left: x - 9, top: 0, bottom: 0, overflow: "hidden", width: 18 }}>
          {Array.from({ length: Math.ceil(height / (70 * u)) + 2 }, (_, i) => (
            <div key={i} style={{ position: "absolute", top: i * 70 * u - drift * u, width: 18, height: 18, borderRadius: "50%", background: hole }} />
          ))}
        </div>
      ))}
      {shown.length ? (
        <div data-gv="tab" style={{ position: "absolute", left: (width - 720 * u) / 2, top: slipTop, width: 720 * u }}>
          <svg width={720 * u} height={16 * u} style={{ display: "block" }}>
            <polygon points={`0,${16 * u} ${Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * 720 * u) / (n * 2)},${i % 2 ? 0 : 16 * u}`).join(" ")} ${720 * u},${16 * u}`} fill={paper} />
          </svg>
          <div style={{ background: paper, height: 520 * u, padding: `${22 * u}px ${36 * u}px`, fontFamily: MONO, fontSize: 30 * u, color: ink, fontWeight: 500 }}>
            <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: 6, fontSize: 24 * u, opacity: 0.6, marginBottom: 10 * u }}>RUNNING TAB</div>
            {shown.map((e, i) => {
              const isNew = i === shown.length - 1;
              const p = isNew ? Math.min(1, Math.max(0, (f - (e.delay ?? 8)) / 6)) : 1;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 20 * u, height: 48 * u, alignItems: "center", opacity: p, transform: `translateY(${(1 - p) * -14 * u}px)`, fontWeight: isNew ? 700 : 500 }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}>{e.label}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{e.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
};
