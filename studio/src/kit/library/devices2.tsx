import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { PaperBg } from "../devices";
import { P, STROKE, useLayout } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/**
 * RedactWipe: scene transition. Five ink redaction bars slide across (staggered, 2-frame offsets) until the frame is fully
 * covered at the midpoint (swap scenes there), then peel off the way they came. Use inside a `<Sequence>` over the cut.
 * Bars carry a thin paper hairline and tiny "REDACTED" slug on the middle bar. `reverse` peels from the opposite side.
 */
export const RedactWipe: React.FC<{ durationFrames?: number; reverse?: boolean; bars?: number }> = ({ durationFrames = 18, reverse, bars = 6 }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = Math.max(0, Math.min(1, f / durationFrames));
  const h = H / bars;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: bars }, (_, i) => {
        const st = (i / bars) * 0.18;
        const c = Easing.in(Easing.quad)(Math.max(0, Math.min(1, (p * 2 - st) / (1 - 0.18))));
        const u = Easing.out(Easing.quad)(Math.max(0, Math.min(1, ((p - 0.5) * 2 - st) / (1 - 0.18))));
        const dir = reverse ? -1 : 1;
        const x = (-1 + c) * W * dir + (p > 0.5 ? u * W * dir : 0);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: i * h, width: W, height: h + 1, background: P.ink, borderTop: `3px solid rgba(244,239,228,.35)`, boxSizing: "border-box" }}>
            {i === Math.floor(bars / 2) ? <span style={{ position: "absolute", right: 70, top: h / 2 - 22, fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: "rgba(244,239,228,.45)" }}>REDACTED</span> : null}
          </div>
        );
      })}
    </div>
  );
};

/**
 * StampCutWipe: transition. A red stamp slams in the middle (scale 2.2 to 1, 3 degree settle); only after it lands does red
 * flood the frame (stamp drawn above the fill, never covered); swap scenes at the midpoint. It then clears with a hard six-band
 * stair-step (no fades), total 0.6s at the default 18 frames (`speed` scales it), covered hold ~0.1s. `text` default "PAID".
 */
export const StampCutWipe: React.FC<{ durationFrames?: number; text?: string; speed?: number }> = ({ durationFrames = 18, text = "PAID", speed = 1 }) => {
  const f = useCurrentFrame() * speed;
  const { width: W, height: H } = useVideoConfig();
  const p = Math.max(0, Math.min(1, f / durationFrames));
  const slam = Easing.in(Easing.quad)(Math.min(1, p / 0.28));
  const bands = 6;
  const flood = Easing.inOut(Easing.cubic)(pr(p, 0.3, 0.45, (x) => x));
  const sc = 2.2 - 1.2 * slam;
  const fs = Math.min(W, H) * 0.24;
  const settle = p > 0.28 ? 3 * (1 - Math.min(1, (p - 0.28) / 0.12)) : 0;
  const covered = flood > 0.6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: bands }, (_, i) => {
        const hold = 0.58 + (i / bands) * 0.3;
        const gone = p >= hold + 0.07;
        return gone ? null : <div key={i} style={{ position: "absolute", left: "50%", top: (i * H) / bands, height: H / bands + 1, width: W * flood, transform: "translateX(-50%)", background: P.loss }} />;
      })}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) rotate(${-8 + settle}deg) scale(${sc})`, opacity: Math.min(1, slam * 2) * (p > 0.62 ? 0 : 1), border: `${fs * 0.08}px solid ${covered ? P.receipt : P.loss}`, padding: `0 ${fs * 0.3}px`, borderRadius: fs * 0.12, fontFamily: FONT.anton, fontSize: fs, letterSpacing: fs * 0.06, lineHeight: 1.15, color: covered ? P.receipt : P.loss }}>{text.toUpperCase()}</div>
    </div>
  );
};

/**
 * TornEdgeDivider: a strip of thermal paper with a torn zig-zag top and bottom edge, ink outline, perforation dots. Use as
 * a section break or to separate a caption lane from content. It tears open left to right over 14 frames, then the dots
 * march slowly (idle). Width in px (<=860 inside SafeBox); `label` optional mono text on the strip (>=36px).
 */
export const TornEdgeDivider: React.FC<{ width: number; height?: number; label?: string; startFrame?: number }> = ({ width, height = 130, label, startFrame = 0 }) => {
  const f = useCurrentFrame() - startFrame;
  const reveal = pr(f, 0, 14);
  const tooth = 40;
  const n = Math.round(width / tooth);
  const top = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * width) / (n * 2)},${i % 2 ? 2 : 24}`).join(" ");
  const bot = Array.from({ length: n * 2 + 1 }, (_, i) => `${width - (i * width) / (n * 2)},${height - (i % 2 ? 2 : 24)}`).join(" ");
  const poly = `${top} ${bot}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <clipPath id="ted"><rect x="0" y="0" width={width * reveal} height={height} /></clipPath>
      <g clipPath="url(#ted)">
        <polygon points={poly} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" transform="translate(5 6)" opacity=".25" />
        <polygon points={poly} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" />
        {Array.from({ length: Math.floor(width / 34) }, (_, i) => <circle key={i} cx={20 + ((i * 34 + f * 0.8) % (width - 40))} cy={height / 2} r="5" fill={label ? "none" : P.muted} />)}
        {label ? <text x={width / 2} y={height / 2 + 13} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="38" letterSpacing="8" fill={P.ink}>{label.toUpperCase()}</text> : null}
      </g>
    </svg>
  );
};

/**
 * DottedConnector: the "follow the receipt" line. A dotted ink path through `points` (px, rounded corners) draws on, then the
 * dots march toward the arrowhead (60px head) forever. Stroke 12px, dots 2.2:1 gap. Use between two objects or receipt lines.
 */
export const DottedConnector: React.FC<{ width: number; height: number; points: [number, number][]; startFrame?: number; color?: string; stroke?: number; radius?: number }> = ({ width, height, points, startFrame = 0, color = P.ink, stroke = 12, radius = 60 }) => {
  const f = useCurrentFrame() - startFrame;
  const d = points.map((pt, i) => {
    if (i === 0) return `M${pt[0]} ${pt[1]}`;
    if (i === points.length - 1) return `L${pt[0]} ${pt[1]}`;
    const [a, b, c] = [points[i - 1], pt, points[i + 1]];
    const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const p1 = [b[0] - ((b[0] - a[0]) / l1) * r, b[1] - ((b[1] - a[1]) / l1) * r];
    const p2 = [b[0] + ((c[0] - b[0]) / l2) * r, b[1] + ((c[1] - b[1]) / l2) * r];
    return `L${p1[0]} ${p1[1]} Q${b[0]} ${b[1]} ${p2[0]} ${p2[1]}`;
  }).join(" ");
  const draw = pr(f, 0, 26, Easing.inOut(Easing.cubic));
  const head = Easing.out(Easing.back(3))(pr(f, 24, 32, (x) => x));
  const last = points[points.length - 1], prev = points[points.length - 2];
  const ang = (Math.atan2(last[1] - prev[1], last[0] - prev[0]) * 180) / Math.PI;
  const hl = 64;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <clipPath id="dc-clip"><rect x="-50" y="-50" width={width + 100} height={height + 100} /></clipPath>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`0.1 ${stroke * 2.2}`} strokeDashoffset={-(f * 1.6)} opacity={draw >= 1 ? 1 : 0} />
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={draw >= 1 ? 0 : 1} />
      <g transform={`translate(${last[0]} ${last[1]}) rotate(${ang}) scale(${head})`}>
        <path d={`M${-hl * 0.9} ${-hl * 0.55} L0 0 L${-hl * 0.9} ${hl * 0.55}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const Coin: React.FC<{ r: number }> = ({ r }) => (
  <g>
    <circle r={r} fill={P.receipt} stroke={P.ink} strokeWidth={Math.max(4, r * 0.16)} />
    <circle r={r * 0.66} fill="none" stroke={P.ink} strokeWidth={r * 0.07} strokeDasharray={`${r * 0.2} ${r * 0.16}`} />
    <text y={r * 0.34} textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize={r * 0.95} fill={P.ink}>$</text>
  </g>
);
const Tag: React.FC<{ s: number }> = ({ s }) => (
  <g>
    <path d={`M${-s * 0.5} ${-s * 0.3} H${s * 0.3} L${s * 0.55} 0 L${s * 0.3} ${s * 0.3} H${-s * 0.5} Z`} fill={P.receipt} stroke={P.ink} strokeWidth={Math.max(4, s * 0.08)} strokeLinejoin="round" />
    <circle cx={s * 0.28} cy="0" r={s * 0.06} fill={P.ink} />
    <rect x={-s * 0.38} y={-s * 0.05} width={s * 0.45} height={s * 0.08} fill={P.muted} />
  </g>
);

/**
 * CoinTagAccents: a background of slowly drifting coins and price tags hugging the top band and the left/right margins
 * (never the centre column), ink outlines on receipt fill at ~45% opacity: no yellow. `dark` for night scenes. seed varies it.
 * Sits on PaperBg itself, so use it as the scene background; foreground stays untouched.
 */
export const CoinTagAccents: React.FC<{ dark?: boolean; seed?: number; count?: number }> = ({ dark, seed = 5, count = 12 }) => {
  const f = useCurrentFrame();
  const { u, width, height } = useLayout();
  const items = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 3;
      const x = side === 0 ? r() * 150 : side === 1 ? width - 150 + r() * 130 : r() * width;
      const y0 = side === 2 ? r() * 260 : r() * height;
      return { x, y0, size: (60 + r() * 60) * u, kind: r() < 0.55 ? "coin" : "tag", rot: r() * 60 - 30, sp: 0.35 + r() * 0.5, ph: r() * 6 };
    });
  }, [seed, count, width, height, u]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <PaperBg dark={dark} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} opacity={dark ? 0.5 : 0.45}>
        {items.map((it, i) => {
          const y = it.y0 > 0 && i % 3 !== 2 ? (((it.y0 - f * it.sp) % (height + 200)) + height + 200) % (height + 200) - 100 : it.y0 + Math.sin(f / 30 + it.ph) * 12;
          const x = it.x + Math.sin(f / 40 + it.ph) * 8;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${it.rot + Math.sin(f / 24 + it.ph) * 6})`}>
              {it.kind === "coin" ? <Coin r={it.size / 2} /> : <Tag s={it.size} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
