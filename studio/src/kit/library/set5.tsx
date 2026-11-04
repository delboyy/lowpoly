import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { PaperBg } from "../devices";
import { P, STROKE, useLayout } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.out(Easing.cubic);
const pr = (f: number, a: number, b: number, e = eo) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/* ------------------------------------------------------------------ VE-001 warehouse backdrop (3 parallax layers) */

const Racks: React.FC<{ w: number; y: number; h: number; seed: number; tiers: number }> = ({ w, y, h, seed, tiers }) => {
  const r = rng(seed);
  const bays = Math.ceil(w / 250) + 1;
  const tierH = h / tiers;
  return (
    <g>
      {Array.from({ length: bays }, (_, b) => (
        <g key={b} transform={`translate(${b * 250} ${y})`}>
          {Array.from({ length: tiers }, (_, t) => {
            const bw = [70, 90, 110];
            let x = 18;
            const boxes: React.ReactNode[] = [];
            while (x < 205) {
              const wd = bw[Math.floor(r() * 3)], ht = tierH * (0.5 + r() * 0.35);
              if (x + wd > 232) break;
              boxes.push(<g key={x}><rect x={x} y={(t + 1) * tierH - 10 - ht} width={wd} height={ht} fill={r() < 0.3 ? P.muted : P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} /><path d={`M${x} ${(t + 1) * tierH - 10 - ht * 0.7} H${x + wd}`} stroke={P.ink} strokeWidth={STROKE.hairline + 1} opacity=".5" /></g>);
              x += wd + 8;
            }
            return <g key={t}>{boxes}<rect x="0" y={(t + 1) * tierH - 10} width="250" height="10" fill={P.loss} stroke={P.ink} strokeWidth={STROKE.detail} /></g>;
          })}
          <rect x="-6" y="0" width="12" height={h} fill={P.ink} /><rect x="244" y="0" width="12" height={h} fill={P.ink} />
        </g>
      ))}
    </g>
  );
};

/** Far layer: ceiling beams and swinging hanging lamps. Drifts 0.15px/frame. */
export const WarehouseFar: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, u } = useLayout();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} opacity={0.55}>
      <g transform={`translate(${-(f * 0.15) % 250} 0)`}>
        {Array.from({ length: Math.ceil(width / 250) + 2 }, (_, i) => <path key={i} d={`M${i * 250} 0 V${70 * u}`} stroke={P.ink} strokeWidth="6" />)}
        {Array.from({ length: Math.ceil(width / 250) + 2 }, (_, i) => (
          <g key={`l${i}`} transform={`translate(${i * 250 + 125} ${70 * u}) rotate(${Math.sin(f / 30 + i) * 3} 0 0)`}>
            <path d="M0 0 V50" stroke={P.ink} strokeWidth="4" />
            <path d="M-34 90 L-16 50 H16 L34 90 Z" fill={P.receipt} stroke={P.ink} strokeWidth="4" strokeLinejoin="round" />
          </g>
        ))}
      </g>
    </svg>
  );
};
/** Mid layer: three-tier racks stacked with boxes in the top band (y 12-40% of height). Drifts 0.4px/frame (12px/s). */
export const WarehouseMid: React.FC<{ seed?: number }> = ({ seed = 4 }) => {
  const f = useCurrentFrame();
  const { width, height } = useLayout();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} opacity={0.6}>
      <g transform={`translate(${-(f * 0.4) % 250} 0)`}><Racks w={width + 500} y={height * 0.12} h={height * 0.28} seed={seed} tiers={3} /></g>
    </svg>
  );
};
/** Near layer: floor line, pallets with stacked boxes and a hand truck along the bottom 22%. Drifts 0.8px/frame (24px/s). */
export const WarehouseNear: React.FC<{ seed?: number }> = ({ seed = 9 }) => {
  const f = useCurrentFrame();
  const { width, height } = useLayout();
  const r = rng(seed);
  const fy = height * 0.8;
  const pal = Array.from({ length: Math.ceil(width / 360) + 2 }, (_, i) => ({ x: i * 360 + 30, rows: 1 + Math.floor(r() * 3) }));
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} opacity={0.65}>
      <path d={`M0 ${fy} H${width}`} stroke={P.ink} strokeWidth="6" />
      <g transform={`translate(${-(f * 0.8) % 360} 0)`}>
        {pal.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${fy})`}>
            <rect x="0" y="-20" width="300" height="20" fill={P.muted} stroke={P.ink} strokeWidth={STROKE.detail} />
            {Array.from({ length: p.rows }, (_, k) => <g key={k}><rect x="12" y={-20 - (k + 1) * 80} width="276" height="80" fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} /><path d={`M150 ${-20 - (k + 1) * 80} V${-20 - k * 80}`} stroke={P.ink} strokeWidth={STROKE.detail} /><rect x="120" y={-20 - (k + 1) * 80 + 26} width="60" height="22" fill={P.loss} stroke={P.ink} strokeWidth="3" /></g>)}
          </g>
        ))}
      </g>
    </svg>
  );
};
/** Full backdrop on paper (all three layers). VE can also mount the layers separately to parallax with their own offsets. */
export const WarehouseBackdrop: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <PaperBg dark={dark} />
    <WarehouseFar /><WarehouseMid /><WarehouseNear />
  </div>
);

/* ------------------------------------------------------------------ VE-004 paper pack */

/** Masking tape strip: sticks on with a pop, ink outline, torn jagged ends, faint ribbing. Use to pin receipts/cards. */
export const TapePiece: React.FC<{ width?: number; height?: number; rotate?: number; startFrame?: number }> = ({ width = 260, height = 78, rotate = -6, startFrame = 0 }) => {
  const f = useCurrentFrame() - startFrame;
  const k = Easing.out(Easing.back(2.5))(pr(f, 0, 8, (x) => x));
  const zz = (x0: number, dir: number) => Array.from({ length: 6 }, (_, i) => `${x0 + (i % 2 ? 8 : 0) * dir},${(i * height) / 5}`).join(" ");
  return (
    <svg width={width + 40} height={height + 40} style={{ overflow: "visible", transform: `rotate(${rotate}deg) scale(${k})`, opacity: k > 0 ? 1 : 0 }}>
      <g transform="translate(20 20)">
        <polygon points={`${zz(0, 1)} ${zz(width, -1).split(" ").reverse().join(" ")}`} fill="#E8DFC4" stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" opacity=".92" />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M14 ${(i + 1) * (height / 8)} H${width - 14}`} stroke={P.muted} strokeWidth="2.5" opacity=".35" />)}
      </g>
    </svg>
  );
};

/**
 * Crumple overlay: 3 seeded fold creases, each with a light and a dark facet (paper 40% / ink 8%) plus 2px crease lines at 25%
 * ink, laid over a paper object. Static, cheap (no blur). `strength` scales opacity.
 */
export const PaperCrumple: React.FC<{ width: number; height: number; seed?: number; strength?: number }> = ({ width, height, seed = 3, strength = 1 }) => {
  const r = rng(seed);
  const folds = Array.from({ length: 3 }, (_, i) => {
    const y1 = (0.2 + i * 0.28 + r() * 0.1) * height, y2 = y1 + (r() - 0.5) * height * 0.28;
    return { y1, y2, k: 40 + r() * 60 };
  });
  const small = Array.from({ length: 8 }, () => {
    const x = r() * width, y = r() * height, a = r() * Math.PI, l = 60 + r() * 160;
    return `M${x} ${y} l${Math.cos(a) * l} ${Math.sin(a) * l}`;
  });
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} opacity={strength}>
      {folds.map((fd, i) => (
        <g key={i}>
          <polygon points={`0,${fd.y1} ${width},${fd.y2} ${width},${fd.y2 + fd.k} 0,${fd.y1 + fd.k}`} fill="rgba(20,19,15,.06)" />
          <polygon points={`0,${fd.y1 - fd.k * 0.7} ${width},${fd.y2 - fd.k * 0.7} ${width},${fd.y2} 0,${fd.y1}`} fill="rgba(255,253,246,.25)" />
          <path d={`M0 ${fd.y1} L${width} ${fd.y2}`} stroke="rgba(20,19,15,.25)" strokeWidth="2" />
        </g>
      ))}
      {small.map((d, i) => <path key={i} d={d} stroke="rgba(20,19,15,.25)" strokeWidth="2" strokeLinecap="round" fill="none" />)}
    </svg>
  );
};

/** TornPaper: a sheet with an irregular torn top and bottom, ink outline and a flat offset shadow; children sit inside. */
export const TornPaper: React.FC<{ width: number; height: number; children?: React.ReactNode; seed?: number; tilt?: number; crumple?: boolean; startFrame?: number }> = ({ width, height, children, seed = 2, tilt = -1.2, crumple = true, startFrame = 0 }) => {
  const f = useCurrentFrame() - startFrame;
  const r = rng(seed);
  const n = Math.round(width / 22);
  const m = Math.round(height / 30);
  const top = Array.from({ length: n + 1 }, (_, i) => `${(i * width) / n},${6 + r() * 14}`).join(" ");
  const right = Array.from({ length: m + 1 }, (_, i) => `${width - (i === 0 || i === m ? 0 : 4 + r() * 10)},${(i * height) / m}`).join(" ");
  const bot = Array.from({ length: n + 1 }, (_, i) => `${width - (i * width) / n},${height - 6 - r() * 14}`).join(" ");
  const left = Array.from({ length: m + 1 }, (_, i) => `${i === 0 || i === m ? 0 : 4 + r() * 10},${height - (i * height) / m}`).join(" ");
  const poly = `${top} ${right} ${bot} ${left}`;
  const wob = f < 0 ? 0 : 3 * Math.exp(-f / 7) * Math.cos(f / 2.2);
  return (
    <div style={{ position: "relative", width, height, transform: `rotate(${tilt + wob}deg)` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon points={poly} transform="translate(8 10)" fill={P.ink} opacity=".22" />
        <polygon points={poly} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" />
      </svg>
      {crumple ? <PaperCrumple width={width} height={height} seed={seed} strength={0.9} /> : null}
      <div style={{ position: "absolute", inset: 0, padding: "40px 36px" }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ printing receipt (QA ask 2) */

export type PRLine = { label: string; value?: string; hl?: boolean; loss?: boolean; gain?: boolean };
/**
 * PrintingReceipt: tall thermal receipt. `lines` is REQUIRED real content ({label, value, hl?, loss?, gain?}); there are no
 * built-in sample figures (an invented number on an official-looking receipt is a sourcing risk), so supply sourced lines.
 * Sits best from y>=240. Tall thermal receipt (default 840 x >=1100 at 1080w). Header, 8-12 mono lines at 44px print one by one
 * (`lineFrames` apart, the paper feeds up as it prints), a yellow marker swipes behind the single `hl` line, the total
 * prints in Anton, and the perforated tear-away tail tears loose at the end. `printingReceiptCuesMs` gives chirp times.
 */
export const printingReceiptCuesMs = (n: number, lineFrames = 9, startFrame = 6, fps = 30) => Array.from({ length: n }, (_, i) => ((startFrame + i * lineFrames) / fps) * 1000);
export const PrintingReceipt: React.FC<{ title?: string; subtitle?: string; lines: PRLine[]; total?: { label: string; value: string }; width?: number; startFrame?: number; lineFrames?: number }> = ({ title = "LINE ITEM", subtitle, lines, total, width = 840, startFrame = 0, lineFrames = 9 }) => {
  const f = useCurrentFrame() - startFrame;
  const lh = 78;
  const headH = subtitle ? 200 : 150;
  const bodyH = lines.length * lh + (total ? 170 : 40);
  const tailH = 120;
  const height = headH + bodyH + tailH;
  const shown = Math.min(lines.length, Math.max(0, Math.floor((f - 6) / lineFrames) + 1));
  const done = 6 + lines.length * lineFrames;
  const hlIdx = lines.findIndex((l) => l.hl);
  const swipe = hlIdx >= 0 ? pr(f, 6 + (hlIdx + 1) * lineFrames, 6 + (hlIdx + 1) * lineFrames + 10) : 0;
  const tot = pr(f, done, done + 8, Easing.out(Easing.back(2)));
  const tear = pr(f, done + 22, done + 34, Easing.in(Easing.quad));
  const feed = (1 - pr(f, 0, done)) * 120;
  const zig = Array.from({ length: Math.round(width / 26) * 2 + 1 }, (_, i) => `${(i * width) / (Math.round(width / 26) * 2)},${i % 2 ? 0 : 18}`).join(" ");
  const bodyOf = (
    <>
      <div style={{ height: headH, textAlign: "center", paddingTop: 36, borderBottom: `4px dashed ${P.ink}44`, boxSizing: "border-box" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, letterSpacing: 12, color: P.ink }}>{title}</div>
        {subtitle ? <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, color: P.muted, marginTop: 10, letterSpacing: 3 }}>{subtitle}</div> : null}
      </div>
      <div style={{ padding: "12px 40px 0", position: "relative" }}>
        {hlIdx >= 0 ? <div style={{ position: "absolute", left: 28, top: 12 + hlIdx * lh + 8, width: (width - 56) * swipe, height: lh - 14, background: P.highlight }} /> : null}
        {lines.map((l, i) => (
          <div key={i} style={{ position: "relative", height: lh, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontWeight: l.hl ? 700 : 500, fontSize: 44, color: l.loss ? P.lossText : l.gain ? P.gainText : P.ink, opacity: i < shown ? 1 : 0, transform: `translateY(${i < shown ? 0 : 14}px)` }}>
            <span>{l.label}</span><span>{l.value}</span>
          </div>
        ))}
        {total ? (
          <div style={{ marginTop: 22, borderTop: `5px solid ${P.ink}`, paddingTop: 18, display: "flex", justifyContent: "space-between", fontFamily: FONT.anton, fontSize: 72, color: P.ink, opacity: tot, transform: `scale(${0.9 + 0.1 * tot})`, transformOrigin: "left center" }}>
            <span>{total.label}</span><span>{total.value}</span>
          </div>
        ) : null}
      </div>
    </>
  );
  return (
    <div style={{ position: "relative", width, height: height + 20, transform: `translateY(${feed}px)` }}>
      <div style={{ position: "absolute", left: 8, top: 10, width, height: headH + bodyH, background: P.ink, opacity: 0.22 }} />
      <div style={{ position: "relative", width, height: headH + bodyH, background: P.receipt, border: `${STROKE.detail}px solid ${P.ink}`, borderBottom: "none", boxSizing: "border-box", overflow: "hidden" }}>{bodyOf}</div>
      <div style={{ position: "absolute", left: 0, top: headH + bodyH, width, transformOrigin: "10% 0%", transform: `rotate(${tear * 14}deg) translateY(${tear * 120}px)`, opacity: 1 - tear * 0.6 }}>
        <svg width={width} height={tailH} style={{ display: "block", overflow: "visible" }}>
          <polygon points={`0,0 ${width},0 ${zig.split(" ").reverse().map((s) => { const [x, y] = s.split(","); return `${x},${tailH - 30 + Number(y)}`; }).join(" ")}`} fill={P.receipt} stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" />
          <line x1="20" x2={width - 20} y1="2" y2="2" stroke={P.loss} strokeWidth="5" strokeDasharray="16 12" />
          <text x={width / 2} y="62" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="36" letterSpacing="6" fill={P.muted}>TEAR HERE</text>
        </svg>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ icon set A (QA ask 6) */

export type GlyphName = "soda" | "cash" | "calendar" | "percent" | "magnifier" | "tag" | "lock" | "pump" | "coffee";
/**
 * GlyphIcon: 9 icons on a 64-unit box, 3-unit ink outline, two-tone (receipt fill + `accent`, default loss red; yellow is
 * reserved for the key number). `calendar` is BLANK by default (no day number: a stray "28" reads as a stated figure); pass `date` only for a sourced date. Each has an idle beat: soda bubbles, cash flutter, calendar page flip, percent needle,
 * magnifier sweep, tag swing, lock shackle pops open, pump drip, coffee steam. `progress` = pop-in (omit = drawn).
 */
export const GlyphIcon: React.FC<{ name: GlyphName; size?: number; accent?: string; progress?: number; date?: string }> = ({ name, size = 260, accent = P.loss, progress = 1, date }) => {
  const f = useCurrentFrame();
  const pop = Easing.out(Easing.back(2))(Math.max(0, Math.min(1, progress)));
  const bob = Math.sin(f / 14) * 1.2;
  const S3 = { stroke: P.ink, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  const body: Record<GlyphName, React.ReactNode> = {
    soda: (<g>
      <path d={`M32 6 L${34 + Math.sin(f / 18) * 2} 20`} {...S3} fill="none" />
      <path d="M14 20 H50 L45 58 H19 Z" fill={P.receipt} {...S3} />
      <path d="M16 30 H48 L47 40 H17 Z" fill={accent} {...S3} />
      <rect x="11" y="15" width="42" height="7" rx="2" fill={P.ink} {...S3} />
      {[22, 32, 41].map((x, i) => <circle key={i} cx={x} cy={52 - ((f * 0.5 + i * 5) % 10)} r="1.8" fill={P.ink} opacity=".6" />)}
    </g>),
    cash: (<g>
      {[0, 1, 2].map((i) => <rect key={i} x={8 + i * 3} y={40 - i * 9 + Math.sin(f / 10 + i) * (i ? 1.5 : 0)} width="44" height="18" rx="2" fill={i === 2 ? accent : P.receipt} {...S3} />)}
      <circle cx="30" cy="20" r="5" fill={P.receipt} {...S3} strokeWidth={2.5} />
      <text x="30" y="23.5" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="8" fill={P.ink}>$</text>
    </g>),
    calendar: (<g>
      <rect x="6" y="10" width="52" height="50" rx="5" fill={P.receipt} {...S3} />
      <rect x="6" y="10" width="52" height="11" rx="5" fill={accent} {...S3} />
      <path d="M20 5 V15 M44 5 V15" {...S3} />
      {(() => {
        const ph = ((f % 60) - 45) / 15;
        const sy = ph < 0 ? 1 : Math.max(0.12, Math.abs(Math.cos(Math.PI * ph)));
        // DEFAULT = blank page (three ink grid bars flip): no digits, so the icon never states a date. Pass `date` (e.g. "RENEW" or "01") only for a real, sourced date.
        if (date === undefined) return <g transform={`translate(32 40) scale(1 ${sy}) translate(-32 -40)`}>{[0, 1, 2].map((r) => <rect key={r} x="14" y={30 + r * 9} width="36" height="4" rx="2" fill={P.muted} opacity=".7" />)}</g>;
        return <g transform={`translate(32 40) scale(1 ${sy}) translate(-32 -40)`}><text x="32" y="53" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="26" fill={P.ink}>{date}</text></g>;
      })()}
    </g>),
    percent: (<g>
      <circle cx="32" cy="34" r="24" fill={P.receipt} {...S3} />
      <path d="M32 34 L32 10 A24 24 0 0 1 56 34 Z" fill={accent} {...S3} />
      <g transform={`rotate(${Math.sin(f / 16) * 14} 32 34)`}><path d="M32 34 L32 14" {...S3} strokeWidth={4} /></g>
      <circle cx="32" cy="34" r="3" fill={P.ink} />
    </g>),
    magnifier: (<g transform={`translate(${Math.sin(f / 18) * 3} ${Math.cos(f / 18) * 2})`}>
      <circle cx="26" cy="26" r="16" fill={P.receipt} {...S3} />
      <path d="M17 24 A10 10 0 0 1 26 16" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <path d="M38 38 L56 56" {...S3} strokeWidth={7} />
    </g>),
    tag: (<g transform={`rotate(${Math.sin(f / 16) * 6} 32 6)`}>
      <path d="M32 2 V12" {...S3} />
      <path d="M14 14 H42 L56 32 L42 52 H14 Z" fill={P.receipt} {...S3} transform="rotate(90 32 33) translate(0 0)" />
      <circle cx="32" cy="22" r="3.5" fill={accent} {...S3} strokeWidth={2.5} />
      <path d="M23 36 H41 M25 46 H39" stroke={P.ink} strokeWidth={4} strokeLinecap="round" />
    </g>),
    lock: (<g>
      <g transform={`rotate(${-Math.max(0, Math.sin(f / 20)) * 22} 20 36)`}><path d="M20 36 V20 A12 12 0 0 1 44 20 V36" fill="none" {...S3} strokeWidth={5} /></g>
      <rect x="12" y="28" width="40" height="30" rx="5" fill={accent} {...S3} />
      <circle cx="32" cy="41" r="4" fill={P.receipt} {...S3} strokeWidth={2.5} /><path d="M32 43 V50" {...S3} />
    </g>),
    pump: (<g>
      <rect x="12" y="8" width="30" height="48" rx="4" fill={accent} {...S3} />
      <rect x="17" y="13" width="20" height="12" rx="2" fill={P.receipt} {...S3} strokeWidth={2.5} />
      <path d="M42 22 h6 q6 0 6 6 v18 q0 5 -4 5" fill="none" {...S3} />
      <circle cx="50" cy={52 + ((f % 40) / 40) * 6} r="2" fill={P.ink} opacity={1 - (f % 40) / 40} />
      <rect x="8" y="56" width="38" height="5" rx="2" fill={P.ink} />
    </g>),
    coffee: (<g>
      {[24, 32, 40].map((x, i) => <path key={i} d={`M${x} 16 q-4 -5 0 -10`} fill="none" stroke={P.muted} strokeWidth="2.5" strokeLinecap="round" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i * 1.6))} transform={`translate(0 ${Math.sin(f / 12 + i) * -2})`} />)}
      <path d="M12 22 H46 L43 54 H15 Z" fill={P.receipt} {...S3} />
      <path d="M46 28 q10 0 8 9 q-2 7 -10 6" fill="none" {...S3} />
      <path d="M14 32 H44 L43 40 H15 Z" fill={accent} {...S3} />
    </g>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", transform: `translateY(${bob}px) scale(${0.3 + 0.7 * pop})`, opacity: Math.min(1, progress * 3) }}>
      {body[name]}
    </svg>
  );
};

/* ------------------------------------------------------------------ big-number card (QA ask 8) */

/**
 * BigNumberCard: count-up over 0.9s (27 frames, ease-out) then hold, the number sits on the one yellow plate, a sub-label
 * is REQUIRED (>=40px), and a post-count beat: the plate pops 4% and an ink underline swipes under the sub-label. Width <=860.
 */
export const BigNumberCard: React.FC<{ value: number; sub: string; prefix?: string; suffix?: string; decimals?: number; group?: boolean; width?: number; startFrame?: number; kicker?: string }> = ({ value, sub, prefix = "", suffix = "", decimals = 0, group = true, width = 860, startFrame = 0, kicker }) => {
  const f = useCurrentFrame() - startFrame;
  const k = f >= 31 ? 1 : pr(f, 4, 31, Easing.out(Easing.exp)); // Remotion out(exp)(1) = 0.99902: clamp so the held number is EXACTLY `value`
  const n = value * k;
  const txt = group ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals);
  const beat = Math.max(0, 1 - Math.abs(f - 33) / 6);
  const fs = Math.min(300, (width * 1.7) / Math.max(4, (prefix + txt + suffix).length));
  return (
    <div style={{ width, textAlign: "center" }}>
      {kicker ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: P.muted, marginBottom: 44, opacity: pr(f, 0, 8) }}>{kicker.toUpperCase()}</div> : null}
      <div style={{ display: "inline-block", fontFamily: FONT.anton, fontSize: fs, lineHeight: 1.12, background: P.highlight, color: P.ink, padding: "0 28px", transform: `scale(${1 + 0.04 * beat})`, opacity: pr(f, 0, 4) }}>{prefix}{txt}{suffix}</div>
      <div style={{ display: "block" }} />
      <div style={{ position: "relative", display: "inline-block", marginTop: 28, fontFamily: FONT.inter, fontWeight: 800, fontSize: 48, lineHeight: 1.15, color: P.ink, maxWidth: width, opacity: pr(f, 20, 30) }}>
        {sub}
        <div style={{ position: "absolute", left: 0, bottom: -8, height: 6, width: `${pr(f, 34, 44) * 100}%`, background: P.ink }} />
      </div>
    </div>
  );
};
