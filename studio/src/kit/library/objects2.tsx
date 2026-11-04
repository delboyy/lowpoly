import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { S, Wrap, type IllusProps } from "../illustrations";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const D = { stroke: P.ink, strokeWidth: STROKE.detail, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const BUN = "#E0A04A";

/** Idle motion for hero objects: bob 8-12 px (in 200-unit space ~2.5) over ~90 frames, ease-in-out. Returns translateY. */
const useBob = (amp = 2.5, period = 90) => Math.sin((useCurrentFrame() / period) * Math.PI * 2) * amp;

/** Soda cup (separate so it can animate on its own): bubbles rise, straw sways. `fill` 0..1 liquid level. */
export const SodaCup: React.FC<IllusProps & { fill?: number }> = (p) => {
  const { color = P.receipt, accent = P.loss, fill = 0.8 } = p;
  const f = useCurrentFrame();
  const top = 64, bot = 172;
  const lvl = bot - (bot - top - 14) * fill;
  return (
    <Wrap {...p}>
      <path d={`M${100 + Math.sin(f / 20) * 2} 30 L${112 + Math.sin(f / 20) * 4} 64`} stroke={P.ink} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M52 64 L148 64 L136 172 L64 172 Z" fill={color} {...S} />
      <clipPath id="sc-clip"><path d="M52 64 L148 64 L136 172 L64 172 Z" /></clipPath>
      <g clipPath="url(#sc-clip)">
        <rect x="40" y={lvl} width="120" height="120" fill={P.ink} opacity=".82" />
        {[0, 1, 2].map((i) => <circle key={i} cx={78 + i * 22} cy={168 - ((f * 1.2 + i * 37) % 90)} r={3 + (i % 2)} fill={P.receipt} opacity=".7" />)}
      </g>
      <path d="M58 96 L142 96 L138 128 L62 128 Z" fill={accent} {...D} />
      <rect x="44" y="54" width="112" height="14" rx="4" fill={P.ink} {...D} />
    </Wrap>
  );
};

/**
 * Hot dog combo: tray, hot dog and SodaCup. Mustard draws on after the entrance (frames 14-34), steam curls rise, the
 * whole combo bobs. This is the "$1.50 combo" hero. Props: size/progress/color(bun)/accent(mustard).
 */
export const HotDogCombo: React.FC<IllusProps> = (p) => {
  const { color = BUN, accent = P.highlight } = p;
  const f = useCurrentFrame();
  const bob = useBob();
  const must = interpolate(f, [14, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Wrap {...p}>
      <g transform={`translate(0 ${bob})`}>
        <path d="M14 142 H186 L174 176 H26 Z" fill={P.receipt} {...S} />
        <path d="M30 152 H170" stroke={P.loss} strokeWidth="5" strokeLinecap="round" />
        <rect x="20" y="86" width="104" height="44" rx="22" fill={color} {...S} strokeWidth={5} />
        <rect x="26" y="98" width="92" height="22" rx="11" fill={P.loss} {...S} />
        <path d="M34 108 q10 -10 20 0 t20 0 t20 0 t16 0" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - must} fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M20 112 Q72 130 124 112" fill="none" stroke={P.ink} strokeWidth="0" />
        {[48, 72, 96].map((x, i) => <path key={x} d={`M${x} 80 q-8 -10 0 -20 q8 -10 0 -20`} fill="none" stroke={P.muted} strokeWidth="4" strokeLinecap="round" opacity={0.35 + 0.45 * Math.abs(Math.sin(f / 9 + i * 1.7))} transform={`translate(0 ${Math.sin(f / 12 + i) * -4})`} />)}
        <g transform="translate(96 48) scale(.64)"><SodaGlyph /></g>
      </g>
    </Wrap>
  );
};
const SodaGlyph: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      <path d={`M100 30 L${112 + Math.sin(f / 20) * 4} 64`} stroke={P.ink} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M52 64 L148 64 L136 172 L64 172 Z" fill={P.receipt} {...S} />
      <path d="M58 96 L142 96 L138 128 L62 128 Z" fill={P.loss} {...D} />
      <rect x="44" y="54" width="112" height="14" rx="4" fill={P.ink} {...D} />
    </g>
  );
};

/**
 * Fuel pump with a live display, drawn at ~1.3x so it fills >=65% of the canvas width at size 900.
 * The total (yellow plate, the one accent) ticks up `rate` dollars/frame from `start`; a receipt slides out of the lower
 * slot (printing beat), the hose swings >=10px and a drip falls from the nozzle every 1.5s. `price` = small per-gallon line.
 */
export const FuelPumpLive: React.FC<IllusProps & { start?: number; rate?: number; price?: string }> = (p) => {
  const { color = P.loss, start = 0, rate = 0.09, price = "3.19" } = p;
  const f = useCurrentFrame();
  const bob = useBob(1.8);
  const total = (start + Math.max(0, f - 10) * rate).toFixed(2);
  const drip = (f % 45) / 45;
  const slide = interpolate(f, [20, 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Wrap {...p}>
      <g transform={`translate(0 ${bob}) translate(108 100) scale(1.3) translate(-108 -100)`}>
        <path d={`M134 60 h14 q14 0 14 14 v52 q${Math.sin(f / 18) * 12} 14 10 14 q10 0 10 -14 v-36`} fill="none" {...S} />
        <path d="M168 90 l14 -10 v22 z" fill={P.ink} {...D} />
        <ellipse cx="175" cy={108 + drip * 34} rx="3.2" ry="4.4" fill={P.ink} opacity={drip < 0.1 ? drip * 10 : 1 - drip * drip} />
        <rect x="44" y="26" width="90" height="148" rx="10" fill={color} {...S} />
        <rect x="52" y="34" width="74" height="54" rx="6" fill={P.receipt} {...S} />
        <text x="89" y="50" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="8.5" fill={P.ink}>{price}/GAL</text>
        <rect x="56" y="55" width="66" height="26" rx="3" fill={P.highlight} {...D} strokeWidth={3} />
        <text x="89" y="74" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="17" fill={P.ink}>${total}</text>
        <rect x="58" y="98" width="62" height="10" rx="4" fill={P.muted} {...D} strokeWidth={3} />
        <clipPath id="fp-slot"><rect x="60" y="106" width="58" height="62" /></clipPath>
        <rect x="58" y="116" width="62" height="10" rx="3" fill={P.ink} />
        <g clipPath="url(#fp-slot)">
          <g transform={`translate(0 ${-50 + slide * 44})`}>
            <rect x="64" y="118" width="50" height="46" fill={P.receipt} stroke={P.ink} strokeWidth="2.5" />
            <text x="89" y="132" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="7" fill={P.ink}>TOTAL</text>
            <path d="M70 140 H108 M70 147 H100" stroke={P.muted} strokeWidth="2.5" />
          </g>
        </g>
        <rect x="34" y="170" width="110" height="14" rx="4" fill={P.ink} />
      </g>
    </Wrap>
  );
};

/**
 * Phone with a card-balance app screen, drawn at ~1.5x (>=65% of width at size 900). The balance counts down from
 * `balance` to `balanceTo` over frames 10-46 with the bar (red = money leaving), then holds; a 7-unit red dot with a "1"
 * pops at `notifyAt`. Two real lines of mono text. Company text only via `label`.
 */
export const PhoneAppLive: React.FC<IllusProps & { balance?: number; balanceTo?: number; label?: string; notifyAt?: number; lines?: [string, string] }> = (p) => {
  const { color = P.ink, balance = 24.5, balanceTo = 19.8, label = "CARD", notifyAt = 50, lines = ["UNUSED 41 DAYS", "EXPIRES: NEVER"] } = p;
  const f = useCurrentFrame();
  const bob = useBob(2);
  const k = interpolate(f, [10, 46], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bal = balance + (balanceTo - balance) * k;
  const bar = 0.9 * (bal / balance);
  const dot = Easing.out(Easing.back(3))(interpolate(f, [notifyAt, notifyAt + 8], [0, 1], clamp));
  return (
    <Wrap {...p}>
      <g transform={`translate(0 ${bob}) translate(100 100) scale(1.5) translate(-100 -100)`}>
        <rect x="52" y="14" width="96" height="172" rx="16" fill={color} {...S} />
        <rect x="60" y="30" width="80" height="140" rx="6" fill={P.receipt} stroke={P.ink} strokeWidth="3" />
        <rect x="66" y="36" width="68" height="34" rx="5" fill={P.loss} {...D} strokeWidth={3} />
        <text x="72" y="53" fontFamily={`'${FONT.anton}'`} fontSize="13" letterSpacing="1" fill={P.receipt}>{label.toUpperCase()}</text>
        <rect x="72" y="58" width="20" height="7" rx="2" fill={P.highlight} stroke={P.ink} strokeWidth="2" />
        <text x="100" y="96" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="19" fill={P.ink}>${bal.toFixed(2)}</text>
        <rect x="68" y="104" width="64" height="9" rx="4" fill={P.receipt} stroke={P.ink} strokeWidth="3" />
        <rect x="68" y="104" width={64 * bar} height="9" rx="4" fill={P.loss} stroke={P.ink} strokeWidth="3" />
        <text x="68" y="132" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="6.5" fill={P.ink}>{lines[0]}</text>
        <text x="68" y="148" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="6.5" fill={P.muted}>{lines[1]}</text>
        <rect x="88" y="19" width="24" height="5" rx="2.5" fill={P.receipt} opacity=".5" />
        <g transform={`translate(142 24) scale(${dot})`}>
          <circle r="9" fill={P.loss} {...D} strokeWidth={3} />
          <text y="3.5" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="11" fill={P.receipt}>1</text>
        </g>
      </g>
    </Wrap>
  );
};

/**
 * StampMark: the stamp family (SOURCED, OVERCHARGED, LANDLORD, VERIFIED, or any text). Slams in 7 frames from ~1.6x to 1.0
 * with a 3 degree settle after `start`; the slam scale is capped every frame so the rotated width never exceeds `maxWidth`
 * (default 860, i.e. inside x 60..920 at 1080w). Worn look: irregular corners and ~10% paper speckle over the ink.
 * tone: "loss" (default) | "gain" | "ink". Sized in px so it can sit over any scene; leave >=24px between stacked stamps.
 */
export const StampMark: React.FC<{ text: string; tone?: "loss" | "gain" | "ink"; start?: number; rotate?: number; maxWidth?: number; fontPx?: number }> = ({ text, tone = "loss", start = 0, rotate = -8, maxWidth = 860, fontPx = 150 }) => {
  const f = useCurrentFrame();
  const c = tone === "gain" ? P.gain : tone === "ink" ? P.ink : P.loss;
  const k = interpolate(f, [start, start + 7], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const settle = interpolate(f, [start + 7, start + 16], [3, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const upper = text.toUpperCase();
  const est = upper.length * fontPx * 0.5 + fontPx * 0.7;
  const fit = Math.min(1, (maxWidth * 0.95) / est);
  const fs = fontPx * fit;
  const w = est * fit;
  const scale = Math.min(1.6 - 0.6 * k, maxWidth / (w * 1.04));
  if (f < start) return null;
  const rot = rotate + (k >= 1 ? settle : 0);
  const sp = (a: number) => `radial-gradient(circle at ${a}% ${(a * 7) % 100}%, rgba(244,239,228,.55) 0 1.6px, transparent 2.2px)`;
  return (
    <div style={{ position: "relative", display: "inline-block", transform: `rotate(${rot}deg) scale(${scale})`, opacity: Math.min(1, k * 2.5), border: `${fs * 0.07}px solid ${c}`, borderRadius: "9% 13% 8% 12% / 14% 9% 13% 10%", padding: `${fs * 0.04}px ${fs * 0.35}px`, color: c, fontFamily: FONT.anton, fontSize: fs, letterSpacing: fs * 0.06, lineHeight: 1.15, boxShadow: `inset 0 0 0 ${fs * 0.03}px ${c}` }}>
      {upper}
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", backgroundImage: [sp(13), sp(37), sp(61), sp(83)].join(","), backgroundSize: "23px 19px, 31px 27px, 17px 29px, 41px 23px", opacity: 0.55 }} />
    </div>
  );
};

type FlowProps = { from: [number, number]; to: [number, number]; bend: number; label?: string; startFrame: number; coins: number; color: string; stroke: number; stackAtEnd?: boolean };
const FlowLayer: React.FC<FlowProps> = ({ from, to, bend, label, startFrame, coins, color, stroke, stackAtEnd }) => {
  const f = useCurrentFrame();
  const [x0, y0] = from, [x1, y1] = to;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const nx = -(y1 - y0), ny = x1 - x0;
  const cx = mx + nx * bend * 0.6, cy = my + ny * bend * 0.6;
  const d = `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`;
  const draw = interpolate(f, [startFrame, startFrame + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const head = Easing.out(Easing.back(3))(interpolate(f, [startFrame + 20, startFrame + 28], [0, 1], clamp));
  const pt = (t: number) => ({ x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1 });
  const ang = (Math.atan2(2 * (y1 - cy), 2 * (x1 - cx)) * 180) / Math.PI;
  const gap = 60 / Math.max(1, coins);
  const headLen = Math.max(60, stroke * 3.4);
  const lab = pt(0.5);
  const ox = cx - mx, oy = cy - my, ol = Math.hypot(ox, oy) || 1;
  const dirX = bend === 0 ? 0 : ox / ol, dirY = bend === 0 ? -1 : oy / ol;
  let landed = 0;
  const coinEls = Array.from({ length: coins }, (_, i) => {
    const el = f - startFrame - 26 - i * gap;
    if (el < 0) return null;
    landed += Math.floor(el / 60);
    const t = (el % 60) / 60;
    const q = pt(t * 0.93);
    const sink = t > 0.85 ? 1 - (t - 0.85) * 6.6 : 1;
    return (
      <g key={i} transform={`translate(${q.x} ${q.y}) scale(${sink})`} opacity={Math.min(1, t * 6)}>
        <circle r={stroke * 1.5} fill={P.highlight} stroke={P.ink} strokeWidth={stroke * 0.3} />
        <text y={stroke * 0.55} textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize={stroke * 1.6} fill={P.ink}>$</text>
      </g>
    );
  });
  const stack = stackAtEnd ? Math.min(6, landed) : 0;
  return (
    <g>
      <path d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <g transform={`translate(${x1} ${y1}) rotate(${ang}) scale(${head})`}>
        <path d={`M${-headLen * 0.9} ${-headLen * 0.55} L0 0 L${-headLen * 0.9} ${headLen * 0.55}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {coinEls}
      {Array.from({ length: stack }, (_, i) => (
        <ellipse key={i} cx={x1} cy={y1 + stroke * 5 - i * stroke * 0.9} rx={stroke * 2} ry={stroke * 0.8} fill={P.highlight} stroke={P.ink} strokeWidth={stroke * 0.25} />
      ))}
      {label ? <text x={lab.x + dirX * (stroke * 2.5 + 60)} y={lab.y + dirY * (stroke * 2.5 + 60) + (dirY > 0 ? Math.max(40, stroke * 2.4) * 0.8 : 0)} textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize={Math.max(40, stroke * 2.4)} letterSpacing="3" fill={P.ink} opacity={draw}>{label.toUpperCase()}</text> : null}
    </g>
  );
};

/**
 * MoneyFlow: a self-drawing curved arrow (strokeDasharray with pathLength=1), arrowhead pops at the end (>=60px), then
 * coins ride the path on a loop and drop into a growing coin stack at the tip (end-state beat). `bend` (-1..1) curves it;
 * `label` (>=40px mono) sits >=40px clear of the arc. `back={{ label }}` adds the return arrow ("burger out") below,
 * drawn 14 frames later with no coins. Ink strokes only; coins use the single yellow accent.
 */
export const MoneyFlow: React.FC<{ width: number; height: number; from?: [number, number]; to?: [number, number]; bend?: number; label?: string; startFrame?: number; coins?: number; color?: string; stroke?: number; back?: { label?: string } }> = ({ width, height, from = [60, height / 2 - 80], to = [width - 60, height / 2 - 80], bend = 0.4, label, startFrame = 0, coins = 3, color = P.ink, stroke = 18, back }) => (
  <svg width={width} height={height} style={{ overflow: "visible" }}>
    <FlowLayer from={from} to={to} bend={bend} label={label} startFrame={startFrame} coins={coins} color={color} stroke={stroke} stackAtEnd />
    {back ? <FlowLayer from={[to[0], to[1] + 260]} to={[from[0], from[1] + 260]} bend={bend} label={back.label} startFrame={startFrame + 14} coins={0} color={P.muted} stroke={stroke * 0.8} /> : null}
  </svg>
);
