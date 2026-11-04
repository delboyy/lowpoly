import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology } from "topojson-specification";
import usTopo from "us-atlas/states-10m.json";
import { FONT, MONO } from "../../lib/fonts";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.out(Easing.cubic);
const pr = (f: number, a: number, b: number, e = eo) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const toneColor = (t?: string) => (t === "loss" ? P.loss : t === "gain" ? P.gain : t === "muted" ? P.muted : t === "hl" ? P.highlight : P.ink);

const us = usTopo as unknown as Topology;
const states = (feature(us, us.objects.states as never) as unknown as GeoJSON.FeatureCollection).features;
const borders = mesh(us, us.objects.states as never, (a: unknown, b: unknown) => a !== b);

/**
 * SafeBox: the platform safe area for 1080x1920 charts, x 60..920 (centre x=490: the right 160px is the like/share rail).
 * Wrap every chart in it (children get a flex-centred 860px column); `top` pads from the frame top (default centred).
 */
export const SafeBox: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top }) => (
  <div style={{ position: "absolute", left: 60, width: 860, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: top === undefined ? "center" : "flex-start", paddingTop: top }}>{children}</div>
);

/**
 * RouteMap: US map with a delivery route. Stops pop as the van reaches them, the dashed ink route draws on and a small
 * van glyph rides it. For route/AI stories (UPS ORION) and "where the stores are". Stops: {lon,lat,label?,tone?}.
 * `loop` repeats the ride after it finishes (default true). Labels are 40px on paper pills. Placement: per-stop `side` (the first stop defaults to "ar",
 * the rest alternate above/below); a pill must clear other pills by 60px AND the route line by 14px. The preferred side may sit above the svg top
 * (svg is overflow-visible: give the chart top padding); fallback sides must stay inside the svg.
 */
export const RouteMap: React.FC<{ width: number; height: number; stops: { lon: number; lat: number; label?: string; tone?: "loss" | "ink" | "gain"; side?: "ar" | "al" | "br" | "bl" }[]; startFrame?: number; rideFrames?: number; loop?: boolean }> = ({ width, height, stops, startFrame = 0, rideFrames = 70, loop = true }) => {
  const f = useCurrentFrame() - startFrame;
  const { proj, path } = React.useMemo(() => {
    const proj = geoAlbersUsa();
    proj.fitExtent([[10, 10], [width - 10, height - 10]], { type: "FeatureCollection", features: states } as never);
    return { proj, path: geoPath(proj) };
  }, [width, height]);
  const pts = stops.map((s) => proj([s.lon, s.lat]) ?? [0, 0]) as [number, number][];
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  const draw = pr(f, 14, 14 + rideFrames, Easing.inOut(Easing.cubic));
  const at = (t: number) => {
    let d = t * total;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
        const [a, b] = [pts[i], pts[i + 1]];
        return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
      }
      d -= seg[i];
    }
    return { x: pts[0][0], y: pts[0][1], ang: 0 };
  };
  const ride = loop && f > 14 + rideFrames + 30 ? ((f - 14 - rideFrames - 30) % (rideFrames + 20)) / rideFrames : draw;
  const t = Math.min(1, ride);
  const v = at(t);
  const cum: number[] = [0];
  seg.forEach((s, i) => cum.push(cum[i] + s / total));
  // Label placement: preferred side (explicit `side`, else alternate above/below), then the others; a candidate is rejected if
  // it leaves the map box or comes within 60px of an earlier pill.
  const SIDES = ["ar", "al", "br", "bl"] as const;
  const placed: { x: number; y: number; w: number; side: (typeof SIDES)[number] }[] = [];
  stops.forEach((st, i) => {
    const w = (st.label?.length ?? 0) * 23 + 30;
    const pref = st.side ?? (i === 0 ? "ar" : i % 2 ? "br" : "ar");
    const order = [pref, ...SIDES.filter((x) => x !== pref)];
    const rect = (sd: (typeof SIDES)[number]) => ({ x: sd[1] === "r" ? pts[i][0] + 34 : pts[i][0] - w - 34, y: sd[0] === "a" ? pts[i][1] - 86 : pts[i][1] + 36, w, side: sd });
    const hitsRoute = (r: { x: number; y: number; w: number }) =>
      pts.slice(1).some((q, k) => {
        const a = pts[k], len = Math.hypot(q[0] - a[0], q[1] - a[1]);
        for (let d = 0; d <= len; d += 8) {
          const px = a[0] + ((q[0] - a[0]) * d) / (len || 1), py = a[1] + ((q[1] - a[1]) * d) / (len || 1);
          if (px > r.x - 14 && px < r.x + r.w + 14 && py > r.y - 14 && py < r.y + 56 + 14) return true;
        }
        return false;
      });
    const apart = (r: { x: number; y: number; w: number }) => placed.every((o) => !(r.x < o.x + o.w + 60 && r.x + r.w + 60 > o.x && r.y < o.y + 56 + 60 && r.y + 56 + 60 > o.y));
    // preferred side wins if it clears other pills and the route (it may poke above the svg: the svg is overflow-visible, give the chart top padding);
    // fallbacks must also stay inside the svg vertically.
    const okPref = (r: { x: number; y: number; w: number }) => r.x >= 0 && r.x + r.w <= width && apart(r) && !hitsRoute(r);
    const okFallback = (r: { x: number; y: number; w: number }) => okPref(r) && r.y >= 0 && r.y + 56 <= height;
    placed.push((okPref(rect(pref)) ? rect(pref) : order.slice(1).map(rect).find(okFallback)) ?? rect(pref));
  });
  const route = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <g transform="translate(6 6)" opacity={pr(f, 0, 18)}>{states.map((st, i) => <path key={i} d={path(st) ?? ""} fill={P.ink} />)}</g>
      {states.map((st, i) => <path key={i} d={path(st) ?? ""} fill={P.receipt} opacity={pr(f, 0, 18)} />)}
      <path d={path(borders as never) ?? ""} fill="none" stroke={P.ink} strokeWidth="2.4" opacity=".4" />
      {states.map((st, i) => <path key={`o${i}`} d={path(st) ?? ""} fill="none" stroke={P.ink} strokeWidth="1.2" opacity={0.5 * pr(f, 0, 18)} />)}
      <path d={route} fill="none" stroke={P.ink} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="0.012 0.012" opacity={0.2} />
      <path d={route} fill="none" stroke={P.ink} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
      <g transform={`translate(${v.x} ${v.y}) rotate(${Math.abs(v.ang) > 90 ? 180 + v.ang : v.ang}) scale(${(Math.abs(v.ang) > 90 ? -1 : 1) * 2.3} 2.3)`} opacity={Math.min(pr(f, 14, 20), t > 0.9 ? Math.max(0, 1 - (t - 0.9) * 10) : 1)}>
        <g stroke={P.receipt} strokeWidth="14" strokeLinejoin="round" fill={P.receipt}>
          <rect x="-26" y="-18" width="38" height="30" rx="3" /><path d="M12 -8 H24 L32 2 V12 H12 Z" /><circle cx="-14" cy="14" r="6" /><circle cx="22" cy="14" r="6" />
        </g>
        <rect x="-26" y="-18" width="38" height="30" rx="3" fill={P.receipt} stroke={P.ink} strokeWidth="4" />
        <rect x="-20" y="-6" width="26" height="5" fill={P.loss} />
        <path d="M12 -8 H24 L32 2 V12 H12 Z" fill={P.ink} stroke={P.ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 -4 H23 L27 2 H16 Z" fill={P.receipt} />
        <circle cx="-14" cy="14" r="7" fill={P.ink} stroke={P.receipt} strokeWidth="2.5" /><circle cx="22" cy="14" r="7" fill={P.ink} stroke={P.receipt} strokeWidth="2.5" />
      </g>
      {stops.map((s, i) => {
        const arrive = 14 + cum[i] * rideFrames;
        const q = Easing.out(Easing.back(2.5))(pr(f, arrive - 4, arrive + 6, (x) => x));
        const c = toneColor(s.tone ?? "loss");
        const ring = (f - arrive - 6) / 22;
        const label = s.label ?? "";
        const w = label.length * 23 + 30;
        const pl = placed[i];
        return (
          <g key={i}>
            {ring > 0 && ring < 1 ? <circle cx={pts[i][0]} cy={pts[i][1]} r={20 + ring * 46} fill="none" stroke={c} strokeWidth="6" opacity={1 - ring} /> : null}
            <g transform={`translate(${pts[i][0]} ${pts[i][1]}) scale(${q})`}>
              <circle r="20" fill={c} stroke={P.ink} strokeWidth="6" />
              {label ? (
                <g transform={`translate(${pl.x - pts[i][0]} ${pl.y - pts[i][1]})`}>
                  <rect width={w} height="56" rx="10" fill={P.receipt} stroke={P.ink} strokeWidth="4" />
                  <text x={w / 2} y="40" textAnchor="middle" fontFamily={`'${FONT.inter}'`} fontWeight="800" fontSize="40" fill={P.ink}>{label}</text>
                </g>
              ) : null}
            </g>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * ShareRing: a donut that draws clockwise from 12 o'clock to `share` (0..1), then the slice pulls out 14px. The centre
 * number counts up and sits on the one yellow plate; `sub` is the sub-label (always show one). tone = slice colour (ink default).
 */
export const ShareRing: React.FC<{ size: number; share: number; sub: string; tone?: "ink" | "loss" | "gain"; startFrame?: number; suffix?: string; decimals?: number }> = ({ size, share, sub, tone = "ink", startFrame = 0, suffix = "%", decimals = 0 }) => {
  const f = useCurrentFrame() - startFrame;
  const r = size * 0.34, w = size * 0.15, c = size / 2;
  const sweep = pr(f, 4, 30, Easing.inOut(Easing.cubic));
  const pull = pr(f, 42, 50, Easing.out(Easing.back(2))) * (1 - pr(f, 54, 62, Easing.inOut(Easing.cubic)));
  const a1 = -Math.PI / 2, a2 = a1 + Math.PI * 2 * share * sweep;
  const mid = (a1 + a1 + Math.PI * 2 * share) / 2;
  const pt = (a: number, rad: number) => [c + Math.cos(a) * rad, c + Math.sin(a) * rad];
  const big = a2 - a1 > Math.PI ? 1 : 0;
  const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r);
  const val = (share * 100 * pr(f, 4, 30)).toFixed(decimals);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", overflow: "visible" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={P.ink} strokeWidth={w + 28} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={P.receipt} strokeWidth={w} />
        <g transform={`translate(${Math.cos(mid) * 24 * pull} ${Math.sin(mid) * 24 * pull})`}>
          {sweep > 0.001 ? <path d={`M${x1} ${y1} A${r} ${r} 0 ${big} 1 ${x2} ${y2}`} fill="none" stroke={P.ink} strokeWidth={w + 28} strokeLinecap="butt" /> : null}
          {sweep > 0.001 ? <path d={`M${x1} ${y1} A${r} ${r} 0 ${big} 1 ${x2} ${y2}`} fill="none" stroke={toneColor(tone)} strokeWidth={w} strokeLinecap="butt" /> : null}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.anton, fontSize: size * 0.155, lineHeight: 1.1, background: P.highlight, color: P.ink, padding: `0 ${size * 0.03}px` }}>{val}{suffix}</div>
        <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: Math.max(40, size * 0.052), color: P.ink, marginTop: size * 0.015, opacity: pr(f, 20, 32), textAlign: "center", maxWidth: size * 0.44, lineHeight: 1.1 }}>{sub}</div>
      </div>
    </div>
  );
};

/**
 * DollarSplit: "where $1 of sales goes". A stacked bar of cents; segments grow left to right in order, labels (>=32px)
 * drop in under each segment, the `hl` segment is the single yellow one. parts: {label,cents,tone?}. Sums should be 100.
 */
export const DollarSplit: React.FC<{ width: number; parts: { label: string; cents: number; tone?: "ink" | "loss" | "gain" | "muted" }[]; hl?: number; startFrame?: number; barHeight?: number }> = ({ width, parts, hl, startFrame = 0, barHeight = 240 }) => {
  const f = useCurrentFrame() - startFrame;
  const total = parts.reduce((a, p) => a + p.cents, 0);
  let x = 0;
  let small = 0;
  const barBottom = 64 + barHeight;
  const pulse = (f - 62) / 14;
  return (
    <div style={{ position: "relative", width, height: barHeight + 560 }}>
      <div style={{ position: "absolute", left: 0, top: 0, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: P.muted, letterSpacing: 4 }}>$1.00 OF SALES</div>
      {parts.map((p, i) => {
        const w = (p.cents / total) * width;
        const left = x; x += w;
        const g = pr(f, 6 + i * 10, 20 + i * 10);
        const lab = pr(f, 18 + i * 10, 28 + i * 10);
        const col = i === hl ? P.highlight : toneColor(p.tone);
        const textOnDark = i !== hl && p.tone !== "muted";
        const isSmall = w < 230 || p.label.length * 23 > w - 16;
        const k = isSmall ? small++ : 0;
        const cx = left + w / 2;
        const rowY = barBottom + (parts.some((q, j) => (q.cents / total) * width >= 230 && q.label.length * 23 <= (q.cents / total) * width - 16 && j !== i) ? 170 : 70) + k * 120;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left, top: 64, width: w, height: barHeight }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: w * g, height: barHeight, background: col, border: `${STROKE.illus}px solid ${P.ink}`, boxSizing: "border-box" }} />
              {!isSmall ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.anton, fontSize: Math.min(130, (w * 0.8) / (`${p.cents}¢`.length * 0.5)), color: textOnDark ? P.receipt : P.ink, opacity: g >= 1 ? 1 : 0, whiteSpace: "nowrap" }}>{p.cents}¢</div> : null}
            </div>
            {i === hl && pulse > 0 && pulse < 1 ? <div style={{ position: "absolute", left: left - 10 * pulse, top: 64 - 10 * pulse, width: w + 20 * pulse, height: barHeight + 20 * pulse, border: `${STROKE.illus}px solid ${P.ink}`, boxSizing: "border-box", opacity: 1 - pulse }} /> : null}
            {i === hl && f > 54 && f < 66 ? <div style={{ position: "absolute", left: cx - 24, top: 64 - 150 + (f - 54) * 12.5 + 0, width: 48, height: 48, borderRadius: 24, background: P.highlight, border: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box", opacity: 0.95, fontFamily: FONT.anton, fontSize: 30, textAlign: "center", lineHeight: "40px" }}>$</div> : null}
            {isSmall ? (
              <>
                <div style={{ position: "absolute", left: cx - 2, top: barBottom, width: 4, height: (rowY - barBottom) * lab, background: P.ink }} />
                <div style={{ position: "absolute", left: cx - 40, top: rowY - 2, width: 40 * lab, height: 4, background: P.ink }} />
                <div style={{ position: "absolute", right: width - cx + 52, top: rowY - 36, whiteSpace: "nowrap", textAlign: "right", fontFamily: FONT.inter, fontWeight: 800, fontSize: 42, lineHeight: "72px", color: P.ink, opacity: lab }}>
                  <span style={{ fontFamily: FONT.anton, fontSize: 64, background: i === hl ? P.highlight : "transparent", padding: "0 10px", marginRight: 14 }}>{p.cents}¢</span>{p.label}
                </div>
              </>
            ) : (
              <div style={{ position: "absolute", left: left + 8, top: barBottom + 22, width: w - 16, fontFamily: FONT.inter, fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: P.ink, opacity: lab, transform: `translateY(${(1 - lab) * 14}px)` }}>{p.label}</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * RankLadder: ranked rows (give them best first). A big Anton rank numeral, label, bar and value; rows rise in 8 frames
 * apart, the bar draws on, and `best` (default 0) gets the yellow plate on its value (the one accent). `unit` suffixes the value.
 */
export const RankLadder: React.FC<{ width: number; items: { label: string; value: number; sub?: string }[]; best?: number; unit?: string; prefix?: string; decimals?: number; startFrame?: number; rowHeight?: number }> = ({ width, items, best = 0, unit = "", prefix = "", decimals = 1, startFrame = 0, rowHeight = 260 }) => {
  const f = useCurrentFrame() - startFrame;
  const max = Math.max(...items.map((i) => i.value));
  const pulseK = Math.max(0, 1 - Math.abs(f - 66) / 8);
  return (
    <div style={{ width, position: "relative", height: items.length * rowHeight }}>
      {items.map((it, i) => {
        const a = 6 + i * 10;
        const rise = pr(f, a, a + 12);
        const bar = pr(f, a + 6, a + 26);
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: i * rowHeight, width, height: rowHeight - 20, opacity: rise, transform: `translateY(${(1 - rise) * 60}px) scale(${i === best ? 1 + 0.04 * pulseK : 1})`, display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ fontFamily: FONT.anton, fontSize: 170, color: P.ink, width: 100, textAlign: "center" }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: FONT.inter, fontWeight: 800, fontSize: 48, color: P.ink }}>
                <span>{it.label}</span>
                <span style={{ fontFamily: FONT.anton, fontSize: 64, background: i === best ? P.highlight : "transparent", padding: "0 10px" }}>{prefix}{(it.value * bar).toFixed(decimals)}{unit}</span>
              </div>
              <div style={{ marginTop: 12, height: 90, border: `${STROKE.detail}px solid ${P.ink}`, background: P.receipt, boxSizing: "border-box" }}>
                <div style={{ width: `${(it.value / max) * 100 * bar}%`, height: "100%", background: i === best ? P.ink : i === items.length - 1 ? P.loss : P.muted }} />
              </div>
              {it.sub ? <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 38, color: P.muted, marginTop: 8 }}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * TearWipe: scene transition. A sheet of thermal paper tears across the frame top to bottom (zig-zag leading edge with a
 * red perforation line), fully covers the old scene at the midpoint, then tears away to reveal the next. Place it over the
 * cut: `<Sequence from={cut - durationFrames/2} durationInFrames={durationFrames}><TearWipe /></Sequence>`; the paper is
 * opaque only at the midpoint frame, so swap scenes there. Uses the frame within its Sequence.
 */
export const TearWipe: React.FC<{ durationFrames?: number; color?: string; dark?: boolean; reverse?: boolean }> = ({ durationFrames = 16, color = P.receipt, dark, reverse }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = Math.max(0, Math.min(1, f / durationFrames));
  const cover = Easing.in(Easing.quad)(Math.min(1, p * 2));
  const reveal = Easing.out(Easing.quad)(Math.max(0, p * 2 - 1));
  const tooth = Math.max(26, W / 36);
  const n = Math.ceil(W / tooth) + 1;
  const zig = (y: number) => Array.from({ length: n + 1 }, (_, i) => `${i * tooth},${y + (i % 2 ? tooth * 0.6 : 0)}`).join(" ");
  const yEdge = (cover * (H + tooth)) - tooth;
  const yTail = (reveal * (H + tooth)) - tooth;
  const paper = dark ? "#2A2740" : color;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: reverse ? "scaleY(-1)" : undefined }}>
      <polyline points={zig(yEdge + 8)} fill="none" stroke={P.ink} strokeWidth="10" opacity=".14" strokeLinejoin="round" />
      <polygon points={`0,${yTail} ${zig(yTail)} ${W},${yTail} ${W},${yEdge} ${[...zig(yEdge).split(" ")].reverse().join(" ")} 0,${yEdge}`} fill={paper} />
      <polyline points={zig(yEdge)} fill="none" stroke={P.ink} strokeWidth="4" strokeLinejoin="round" />
      <line x1="0" x2={W} y1={yEdge - 18} y2={yEdge - 18} stroke={P.loss} strokeWidth="4" strokeDasharray="14 12" opacity={cover < 1 ? 1 : 0} />
      {reveal > 0 ? <polyline points={zig(yTail)} fill="none" stroke={P.ink} strokeWidth="4" strokeLinejoin="round" /> : null}
    </svg>
  );
};
