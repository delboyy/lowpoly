import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { P } from "./theme";

/**
 * Flat, code-drawn illustrations. One style: 6px ink outlines, flat fills from the palette, no gradients.
 * Props: size (px), color (main fill), accent (secondary), progress (0..1 pop-in; omit = fully drawn), wobble (idle bob).
 * All sit on a 200x200 viewBox.
 */
export type IllusProps = { size?: number; color?: string; accent?: string; progress?: number; wobble?: boolean; style?: React.CSSProperties };
export const S = { stroke: P.ink, strokeWidth: 6, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export const Wrap: React.FC<IllusProps & { children: React.ReactNode }> = ({ size = 400, progress = 1, wobble, style, children }) => {
  const f = useCurrentFrame();
  const p = Easing.out(Easing.back(1.8))(Math.max(0, Math.min(1, progress)));
  const bob = wobble ? Math.sin(f / 10) * 3 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", transform: `translateY(${bob}px) scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * -8}deg)`, opacity: Math.min(1, progress * 3), ...style }}>
      <ellipse cx="100" cy="186" rx="64" ry="7" fill={P.ink} opacity=".12" />
      {children}
    </svg>
  );
};

export const Burger: React.FC<IllusProps> = (p) => {
  const { color = "#E0A04A", accent = P.loss } = p;
  return (
    <Wrap {...p}>
      <path d="M32 92 C32 44 168 44 168 92 Z" fill={color} {...S} />
      <circle cx="70" cy="68" r="3.5" fill={P.paper} /><circle cx="100" cy="58" r="3.5" fill={P.paper} /><circle cx="130" cy="68" r="3.5" fill={P.paper} /><circle cx="86" cy="78" r="3.5" fill={P.paper} /><circle cx="116" cy="78" r="3.5" fill={P.paper} />
      <path d="M26 98 Q44 112 62 98 Q80 112 98 98 Q116 112 134 98 Q152 112 174 98 L174 106 L26 106 Z" fill={P.gain} {...S} />
      <rect x="30" y="108" width="140" height="16" rx="8" fill="#6B3A1E" {...S} />
      <path d="M34 124 L166 124 L150 138 L132 126 L112 140 L94 126 L74 140 L52 128 Z" fill={P.highlight} {...S} />
      <path d="M32 140 L168 140 Q168 168 140 168 L60 168 Q32 168 32 140 Z" fill={color} {...S} />
      <circle cx="152" cy="150" r="0" fill={accent} />
    </Wrap>
  );
};

export const Fries: React.FC<IllusProps> = (p) => {
  const { color = P.loss, accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      {[44, 66, 88, 110, 132].map((x, i) => (
        <rect key={i} x={x} y={36 + (i % 2) * 10 - (i === 2 ? 8 : 0)} width="16" height="90" rx="4" fill={accent} {...S} transform={`rotate(${(i - 2) * 5} ${x + 8} 130)`} />
      ))}
      <path d="M44 100 L156 100 L146 176 L54 176 Z" fill={color} {...S} />
      <path d="M100 116 q-18 -2 -18 14 q0 12 18 12 q18 0 18 -12 q0 -16 -18 -14" fill="none" stroke={P.highlight} strokeWidth="6" strokeLinecap="round" />
    </Wrap>
  );
};

export const CoffeeCup: React.FC<IllusProps> = (p) => {
  const { color = P.receipt, accent = P.gain } = p;
  const f = useCurrentFrame();
  return (
    <Wrap {...p}>
      {[78, 100, 122].map((x, i) => (
        <path key={i} d={`M${x} 56 q-10 -12 0 -24 q10 -12 0 -24`} fill="none" stroke={P.muted} strokeWidth="5" strokeLinecap="round" opacity={0.5 + 0.4 * Math.sin(f / 8 + i)} transform={`translate(0 ${Math.sin(f / 12 + i) * -3})`} />
      ))}
      <path d="M150 90 q34 0 30 26 q-4 26 -34 22" fill="none" {...S} />
      <path d="M46 70 L154 70 L142 172 L58 172 Z" fill={color} {...S} />
      <path d="M38 62 H162 V78 H38 Z" fill={P.ink} {...S} />
      <path d="M50 104 L150 104 L146 140 L54 140 Z" fill={accent} stroke={P.ink} strokeWidth="6" strokeLinejoin="round" />
      <circle cx="100" cy="122" r="12" fill={P.receipt} {...S} strokeWidth={4} />
    </Wrap>
  );
};

export const FuelPump: React.FC<IllusProps> = (p) => {
  const { color = P.loss, accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <rect x="44" y="26" width="90" height="148" rx="10" fill={color} {...S} />
      <rect x="58" y="42" width="62" height="40" rx="6" fill={P.receipt} {...S} />
      <text x="89" y="73" textAnchor="middle" fontFamily="'GV Plex Mono'" fontWeight="700" fontSize="22" fill={P.ink}>3.19</text>
      <rect x="58" y="98" width="62" height="14" rx="4" fill={accent} {...S} strokeWidth={4} />
      <rect x="34" y="170" width="110" height="14" rx="4" fill={P.ink} />
      <path d="M134 60 h14 q14 0 14 14 v52 q0 12 10 12 q10 0 10 -12 v-36" fill="none" {...S} />
      <path d="M168 90 l14 -10 v22 z" fill={P.ink} {...S} strokeWidth={4} />
    </Wrap>
  );
};

export const Cart: React.FC<IllusProps> = (p) => {
  const { color = P.loss, accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <path d="M14 40 H44 L62 128 H156" fill="none" {...S} />
      <path d="M50 62 H178 L162 118 H64 Z" fill={color} {...S} />
      {[84, 108, 132, 156].map((x) => <path key={x} d={`M${x} 62 L${x - 6} 118`} stroke={P.ink} strokeWidth="4" />)}
      <rect x="82" y="30" width="34" height="32" rx="6" fill={accent} {...S} strokeWidth={5} />
      <circle cx="72" cy="150" r="13" fill={P.receipt} {...S} /><circle cx="146" cy="150" r="13" fill={P.receipt} {...S} />
    </Wrap>
  );
};

export const Storefront: React.FC<IllusProps> = (p) => {
  const { color = P.loss, accent = P.receipt } = p;
  return (
    <Wrap {...p}>
      <rect x="28" y="84" width="144" height="92" fill={accent} {...S} />
      <path d="M20 84 L32 38 H168 L180 84 Z" fill={P.ink} {...S} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${20 + i * 32} 84 L${32 + i * 27.2} 38 H${59.2 + i * 27.2} L${52 + i * 32} 84 Z`} fill={i % 2 ? accent : color} {...S} strokeWidth={4} />
      ))}
      <path d="M20 84 q16 18 32 0 q16 18 32 0 q16 18 32 0 q16 18 32 0 q16 18 32 0" fill={P.receipt} {...S} />
      <rect x="40" y="110" width="52" height="40" rx="3" fill="#BFE3F2" {...S} />
      <rect x="112" y="108" width="40" height="68" fill={color} {...S} />
      <circle cx="120" cy="144" r="3.5" fill={P.ink} />
      <rect x="28" y="172" width="144" height="8" fill={P.ink} />
    </Wrap>
  );
};

export const HotDog: React.FC<IllusProps> = (p) => {
  const { color = "#E0A04A", accent = P.loss } = p;
  return (
    <Wrap {...p}>
      <rect x="22" y="98" width="156" height="46" rx="23" fill={color} {...S} transform="rotate(-14 100 120)" />
      <rect x="16" y="84" width="168" height="34" rx="17" fill="#C3472B" {...S} transform="rotate(-14 100 100)" />
      <path d="M44 96 q10 -12 20 0 q10 12 20 0 q10 -12 20 0 q10 12 20 0 q10 -12 20 0" fill="none" stroke={P.highlight} strokeWidth="7" strokeLinecap="round" transform="rotate(-14 100 100)" />
      <rect x="22" y="104" width="156" height="42" rx="21" fill={color} {...S} transform="rotate(-14 100 125)" opacity="0" />
      <path d="M26 118 Q100 150 176 100 L182 124 Q100 176 28 148 Z" fill={color} {...S} />
      <circle cx="152" cy="62" r="0" fill={accent} />
    </Wrap>
  );
};

export const Phone: React.FC<IllusProps> = (p) => {
  const { color = P.ink, accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <rect x="56" y="18" width="88" height="164" rx="16" fill={color} {...S} />
      <rect x="64" y="34" width="72" height="124" rx="6" fill={P.receipt} stroke={P.ink} strokeWidth="3" />
      <rect x="72" y="44" width="56" height="30" rx="5" fill={accent} {...S} strokeWidth={3} />
      <rect x="72" y="84" width="56" height="8" rx="4" fill={P.muted} /><rect x="72" y="100" width="40" height="8" rx="4" fill={P.muted} /><rect x="72" y="116" width="48" height="8" rx="4" fill={P.muted} />
      <circle cx="100" cy="170" r="5" fill={P.receipt} />
    </Wrap>
  );
};

export const Contract: React.FC<IllusProps> = (p) => {
  const { color = P.receipt, accent = P.loss } = p;
  return (
    <Wrap {...p}>
      <path d="M52 20 H134 L156 42 V176 H52 Z" fill={color} {...S} />
      <path d="M134 20 V42 H156" fill="none" {...S} />
      {[62, 80, 98, 116].map((y, i) => <path key={y} d={`M68 ${y} H${i === 3 ? 110 : 138}`} stroke={P.ink} strokeWidth="5" strokeLinecap="round" />)}
      <path d="M68 150 q10 -22 18 -4 q8 16 14 -6 q6 -14 12 0" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <circle cx="134" cy="146" r="14" fill={P.highlight} {...S} strokeWidth={4} />
    </Wrap>
  );
};

export const Building: React.FC<IllusProps> = (p) => {
  const { color = "#C9C2B0", accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <rect x="54" y="30" width="92" height="146" fill={color} {...S} />
      <rect x="30" y="86" width="40" height="90" fill={color} {...S} /><rect x="130" y="70" width="42" height="106" fill={color} {...S} />
      {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={64 + c * 26} y={44 + r * 28} width="14" height="16" fill={(r + c) % 3 === 0 ? accent : P.receipt} stroke={P.ink} strokeWidth="3" />))}
      <rect x="86" y="140" width="28" height="36" fill={P.ink} />
      <rect x="22" y="174" width="156" height="8" fill={P.ink} />
    </Wrap>
  );
};

export const Truck: React.FC<IllusProps> = (p) => {
  const { color = "#7A4B2A", accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <rect x="14" y="64" width="110" height="82" fill={color} {...S} />
      <path d="M124 90 H158 L182 114 V146 H124 Z" fill={accent} {...S} />
      <rect x="140" y="98" width="22" height="18" fill="#BFE3F2" {...S} strokeWidth={4} />
      <circle cx="54" cy="150" r="17" fill={P.ink} /><circle cx="54" cy="150" r="6" fill={P.receipt} /><circle cx="150" cy="150" r="17" fill={P.ink} /><circle cx="150" cy="150" r="6" fill={P.receipt} />
    </Wrap>
  );
};

export const Card: React.FC<IllusProps> = (p) => {
  const { color = P.loss, accent = P.highlight } = p;
  return (
    <Wrap {...p}>
      <rect x="22" y="48" width="156" height="104" rx="12" fill={color} {...S} transform="rotate(-6 100 100)" />
      <rect x="22" y="70" width="156" height="20" fill={P.ink} transform="rotate(-6 100 100)" />
      <rect x="40" y="112" width="44" height="14" rx="3" fill={accent} {...S} strokeWidth={3} transform="rotate(-6 100 100)" />
    </Wrap>
  );
};

export const ILLUSTRATIONS = { burger: Burger, fries: Fries, coffee: CoffeeCup, pump: FuelPump, cart: Cart, store: Storefront, hotdog: HotDog, phone: Phone, contract: Contract, building: Building, truck: Truck, card: Card } as const;
export type IllusName = keyof typeof ILLUSTRATIONS;

/** Pop-in helper for scenes: progress of an illustration entering at `start` frame. */
export const useIllusProgress = (start = 0, dur = 14) => {
  const f = useCurrentFrame();
  return interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};
