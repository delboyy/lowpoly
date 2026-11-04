import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { GradientBg } from "../components/Backgrounds";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { DEFAULT_THEME, SfxCue, StatProps, StatScene, Theme } from "../lib/types";

const ease = Easing.out(Easing.cubic);
const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

const Label: React.FC<{ children: React.ReactNode; theme: Theme; size?: number }> = ({ children, theme, size = 56 }) => (
  <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: size, color: theme.text, textAlign: "center", lineHeight: 1.15, maxWidth: 900 }}>
    {children}
  </div>
);

const NumberScene: React.FC<{ s: Extract<StatScene, { type: "number" }>; theme: Theme }> = ({ s, theme }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = prog(f, 4, 4 + fps); // 1 s count-up
  const v = s.value * count;
  const txt = v.toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0, useGrouping: s.group ?? true });
  const pop = 1 + 0.06 * Math.sin(Math.min(1, prog(f, 4 + fps, 4 + fps + 8)) * Math.PI);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 36, paddingBottom: 260 }}>
      <div
        style={{
          fontFamily: FONT.anton,
          fontSize: 280,
          lineHeight: 1,
          color: theme.accent,
          fontVariantNumeric: "tabular-nums",
          transform: `scale(${pop})`,
          textShadow: `0 0 80px ${theme.accent}44`,
        }}
      >
        {s.prefix}
        {txt}
        {s.suffix}
      </div>
      <div style={{ opacity: prog(f, 10, 22), transform: `translateY(${(1 - prog(f, 10, 22)) * 24}px)` }}>
        <Label theme={theme}>{s.label}</Label>
        {s.sub ? <div style={{ marginTop: 14, fontFamily: FONT.inter, fontWeight: 600, fontSize: 38, color: theme.muted, textAlign: "center" }}>{s.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const BarsScene: React.FC<{ s: Extract<StatScene, { type: "bars" }>; theme: Theme }> = ({ s, theme }) => {
  const f = useCurrentFrame();
  const max = Math.max(...s.items.map((i) => i.value));
  const barH = Math.min(110, 700 / s.items.length);
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px 260px" }}>
      {s.title ? <div style={{ marginBottom: 50 }}><Label theme={theme} size={52}>{s.title}</Label></div> : null}
      {s.items.map((it, i) => {
        const p = prog(f, 4 + i * 5, 4 + i * 5 + 18); // 0.6 s draw-on
        const hi = s.highlight === undefined || s.highlight === i;
        return (
          <div key={i} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.inter, fontWeight: 800, fontSize: 40, color: theme.text, marginBottom: 8 }}>
              <span>{it.label}</span>
              <span style={{ color: hi ? theme.accent : theme.muted, fontVariantNumeric: "tabular-nums" }}>
                {(it.value * p).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                {s.unit ?? ""}
              </span>
            </div>
            <div style={{ height: barH * 0.5, background: "rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ width: `${(it.value / max) * 100 * p}%`, height: "100%", background: hi ? theme.accent : theme.muted, borderRadius: 14 }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const LineScene: React.FC<{ s: Extract<StatScene, { type: "line" }>; theme: Theme }> = ({ s, theme }) => {
  const f = useCurrentFrame();
  const W = 920, H = 640, pad = 20;
  const min = Math.min(...s.points), max = Math.max(...s.points);
  const pts = s.points.map((v, i) => [pad + (i / (s.points.length - 1)) * (W - pad * 2), H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const p = prog(f, 4, 4 + 36); // draw over ~1.2 s
  const last = pts[pts.length - 1];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 260 }}>
      {s.title ? <div style={{ marginBottom: 30 }}><Label theme={theme} size={52}>{s.title}</Label></div> : null}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={`${d} L${last[0]},${H} L${pts[0][0]},${H} Z`} fill={theme.accent} opacity={0.12 * p} />
        <path d={d} fill="none" stroke={theme.accent} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <circle cx={last[0]} cy={last[1]} r={18} fill={theme.accent} opacity={prog(f, 38, 46)} />
      </svg>
      {s.endLabel ? <div style={{ opacity: prog(f, 40, 52), marginTop: 20 }}><Label theme={theme} size={64}><span style={{ color: theme.accent }}>{s.endLabel}</span></Label></div> : null}
      {s.xLabels ? (
        <div style={{ display: "flex", justifyContent: "space-between", width: W, fontFamily: FONT.inter, fontWeight: 700, fontSize: 34, color: theme.muted, marginTop: 8 }}>
          <span>{s.xLabels[0]}</span><span>{s.xLabels[1]}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const TextScene: React.FC<{ s: Extract<StatScene, { type: "text" }>; theme: Theme }> = ({ s, theme }) => {
  const f = useCurrentFrame();
  const emph = new Set((s.emphasis ?? []).map((w) => w.toLowerCase()));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px 260px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 24px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 108, textTransform: "uppercase", textAlign: "center", lineHeight: 1.08 }}>
        {s.text.split(/\s+/).map((w, i) => {
          const q = prog(f, i * 3, i * 3 + 12);
          const e = emph.has(w.toLowerCase().replace(/[^a-z0-9]/g, ""));
          return <span key={i} style={{ opacity: q, transform: `translateY(${(1 - q) * 36}px)`, color: e ? theme.accent : theme.text }}>{w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const SceneSwitch: React.FC<{ s: StatScene; theme: Theme }> = ({ s, theme }) => {
  switch (s.type) {
    case "number": return <NumberScene s={s} theme={theme} />;
    case "bars": return <BarsScene s={s} theme={theme} />;
    case "line": return <LineScene s={s} theme={theme} />;
    default: return <TextScene s={s} theme={theme} />;
  }
};

export const StatReveal: React.FC<StatProps> = (p) => {
  const { fps } = useVideoConfig();
  const theme = { ...DEFAULT_THEME, ...p.theme };
  const auto: SfxCue[] = p.scenes.flatMap((s) => {
    if (s.sfx === null) return [];
    const defaults: Record<string, string> = { number: "pixabay-impact-bass-2", bars: "pixabay-whoosh-short", line: "pixabay-riser", text: "pixabay-whoosh-short" };
    const at = s.type === "number" && !s.sfx ? s.startMs + 1130 : s.startMs; // thump when the count lands
    return [{ atMs: at, src: s.sfx ?? defaults[s.type], volume: s.type === "number" ? 0.45 : 0.28 }];
  });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <GradientBg theme={theme} grid />
      {p.scenes.map((s, i) => (
        <Sequence key={i} from={Math.round((s.startMs / 1000) * fps)} durationInFrames={Math.max(1, Math.round((s.durationMs / 1000) * fps))}>
          <SceneSwitch s={s} theme={theme} />
        </Sequence>
      ))}
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent={p.captionStyle === "hormozi" ? "#FFE600" : theme.accent} positionPct={p.captionStyle === "karaoke" ? 80 : 74} fontScale={p.captionStyle === "hormozi" ? 0.92 : 1} /> : null}
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...auto, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};
