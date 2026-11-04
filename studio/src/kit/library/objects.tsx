import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { S, Wrap, type IllusProps } from "../illustrations";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const D = { stroke: P.ink, strokeWidth: STROKE.detail, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/**
 * Bank vault: ink body, muted steel-free door (palette: ink / muted / receipt + one yellow accent).
 * `open` 0..1: wheel spins first, then the door swings on its left hinge (holds at ~30% width, inner edge drops with a
 * visible thickness face), revealing two layers of outlined bars. Once open, a glint sweeps the bars every 2s.
 */
export const BankVault: React.FC<IllusProps & { open?: number }> = (p) => {
  const { color = P.muted, accent = P.highlight, open = 0 } = p;
  const f = useCurrentFrame();
  const spin = Easing.inOut(Easing.cubic)(interpolate(open, [0, 0.4], [0, 1], clamp));
  const swing = Easing.inOut(Easing.cubic)(interpolate(open, [0.4, 1], [0, 1], clamp));
  const wheelDeg = open > 0 ? spin * 270 : Math.sin(f / 14) * 4;
  const sx = 1 - swing * 0.7;
  const cx = 38 + 62 * sx;
  const glint = open >= 0.99 ? ((f % 60) / 60) * 150 - 20 : -999;
  const bar = (x: number, y: number) => <rect key={`${x}-${y}`} x={x} y={y} width="24" height="13" rx="2" fill={accent} {...D} />;
  return (
    <Wrap {...p}>
      <rect x="14" y="16" width="172" height="164" rx="10" fill={P.ink} {...S} />
      <circle cx="100" cy="98" r="64" fill="#2A2822" {...D} />
      <clipPath id="bv-in"><circle cx="100" cy="98" r="60" /></clipPath>
      <g clipPath="url(#bv-in)">
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => bar(58 + c * 26 + (r % 2) * 13, 124 - r * 15)))}
        {[0, 1].map((r) => [0, 1].map((c) => bar(71 + c * 26 + r * 0, 94 - r * 15 + 0)))}
        <rect x={glint} y="40" width="14" height="120" fill={P.receipt} opacity=".55" transform="skewX(-20)" />
      </g>
      <g transform={`translate(${cx} 98) skewY(${-7 * swing}) scale(${sx} 1) translate(-100 -98)`}>
        {open > 0.4 ? <circle cx="108" cy="98" r="62" fill={P.ink} {...D} /> : null}
        <circle cx="100" cy="98" r="62" fill={color} {...S} />
        <circle cx="100" cy="98" r="48" fill="none" stroke={P.ink} strokeWidth="4" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 55} cy={98 + Math.sin(a) * 55} r="3.5" fill={P.receipt} stroke={P.ink} strokeWidth="1.5" />;
        })}
        <g transform={`rotate(${wheelDeg} 100 98)`}>
          {[0, 60, 120].map((d) => <rect key={d} x="94" y="58" width="12" height="80" rx="6" fill={accent} {...D} transform={`rotate(${d} 100 98)`} />)}
          <circle cx="100" cy="98" r="13" fill={accent} {...S} />
        </g>
      </g>
      <rect x="8" y="46" width="12" height="22" rx="3" fill={color} {...D} />
      <rect x="8" y="128" width="12" height="22" rx="3" fill={color} {...D} />
    </Wrap>
  );
};

/**
 * Delivery van, side view, generic livery (receipt body, ink cab, loss-red stripe: no brand colours).
 * `drive` (default true): wheels spin (3-spoke hub, 12 deg/frame, no aliasing), body bobs and sways, ground dashes run
 * right-to-left and three ink speed lines trail. `open` 0..1 pops three parcels out of the back. `label` is set in our type.
 */
export const DeliveryVan: React.FC<IllusProps & { label?: string; drive?: boolean; open?: number }> = (p) => {
  const { color = P.receipt, accent = P.loss, label = "ROUTE", drive = true, open = 0 } = p;
  const f = useCurrentFrame();
  const bob = drive ? Math.sin(f / 2.2) * 1.4 : 0;
  const sway = drive ? Math.sin(f / 18) * 6 : 0;
  const rot = drive ? f * 12 : 0;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 150)`}>
      <circle r="18" fill={P.ink} />
      <circle r="10" fill={P.receipt} />
      <g transform={`rotate(${rot})`}>{[0, 120, 240].map((d) => <rect key={d} x="-1.8" y="-9" width="3.6" height="9" rx="1.8" fill={P.ink} transform={`rotate(${d})`} />)}</g>
      <circle r="2.5" fill={P.ink} />
    </g>
  );
  const lines = [60, 110, 160];
  return (
    <Wrap {...p}>
      <path d="M0 168 H200" stroke={P.ink} strokeWidth="3" opacity=".5" />
      {drive ? Array.from({ length: 6 }, (_, i) => {
        const x = (((i * 40 - f * 4) % 240) + 240) % 240 - 20;
        return <rect key={`g${i}`} x={x} y="176" width="18" height="3" rx="1.5" fill={P.ink} opacity=".35" />;
      }) : null}
      {drive ? lines.map((len, i) => {
        const t = ((f + i * 4) % 12) / 12;
        const a = (1 - t) * 0.55;
        return <rect key={i} x={22 - len * (0.4 + t)} y={74 + i * 24} width={len * 0.5} height="3" rx="1.5" fill={P.ink} opacity={a} />;
      }) : null}
      {open > 0 ? [0, 1, 2].map((i) => {
        const o = Easing.out(Easing.back(2))(Math.max(0, Math.min(1, open * 1.4 - i * 0.2)));
        return <rect key={i} x={-4 - i * 4} y={146 - o * (22 + i * 14)} width={22} height={18} fill={P.highlight} {...D} strokeWidth={3} opacity={o > 0 ? 1 : 0} />;
      }) : null}
      <g transform={`translate(${sway} ${bob})`}>
        <path d="M22 54 H128 V146 H22 Z" fill={color} {...S} />
        <path d="M128 76 H156 Q168 76 176 98 L184 114 V146 H128 Z" fill={P.ink} {...S} />
        <path d="M138 86 H156 Q162 86 168 100 H138 Z" fill={P.receipt} {...D} />
        <rect x="22" y="122" width="106" height="9" fill={accent} stroke={P.ink} strokeWidth="4" />
        <text x="75" y="98" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize={label.length > 9 ? 17 : 22} letterSpacing="1" fill={P.ink}>{label.toUpperCase()}</text>
        <rect x="178" y="128" width="8" height="10" rx="2" fill={P.highlight} {...D} strokeWidth={3} />
        {wheel(56)}{wheel(152)}
      </g>
    </Wrap>
  );
};

/**
 * Membership card. `label`/`tier`/`number` set in our type. Text on the red face is receipt-white (>=4.5:1);
 * yellow is only the chip. `flip` 0..1 turns to the back (ink magstripe with a bevel line); `stamp` 0..1 slams a
 * "RENEWED" stamp on the back (6-8 frame slam: drive it with a frame range).
 */
export const MembershipCard: React.FC<IllusProps & { label?: string; tier?: string; number?: string; flip?: number; stamp?: number; stampText?: string }> = (p) => {
  const { color = P.loss, accent = P.highlight, label = "MEMBER", tier = "ANNUAL MEMBER", number = "0042 8817 3306", flip = 0, stamp = 0, stampText = "RENEWED" } = p;
  const f = useCurrentFrame();
  const t = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, flip)));
  const sx = Math.abs(Math.cos(t * Math.PI));
  const back = t > 0.5;
  const sweep = ((f % 90) / 90) * 260 - 60;
  const sp = Easing.out(Easing.back(2.2))(Math.max(0, Math.min(1, stamp)));
  return (
    <Wrap {...p}>
      <g transform={`translate(0 ${Math.sin(f / 16) * 3}) rotate(${-6 + Math.sin(f / 24) * 2 + Math.sin(t * Math.PI) * -4} 100 100) translate(100 100) scale(${sx} 1) translate(-100 -100)`}>
        <rect x="18" y="46" width="164" height="108" rx="12" fill={back ? "#2B2A26" : color} {...S} />
        {back ? (
          <>
            <rect x="18" y="64" width="164" height="22" fill={P.ink} />
            <rect x="18" y="66" width="164" height="2.5" fill={P.muted} opacity=".7" />
            <rect x="32" y="104" width="100" height="16" rx="3" fill={P.receipt} {...D} strokeWidth={3} />
            <text x="40" y="116" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="11" fill={P.ink}>SIGN HERE</text>
            {sp > 0 ? (
              <g transform={`translate(148 138) rotate(-12) scale(${1 + (1 - sp) * 0.6})`} opacity={Math.min(1, sp * 2)}>
                <rect x="-38" y="-14" width="76" height="28" rx="4" fill="none" stroke={P.receipt} strokeWidth="4" />
                <text x="0" y="8" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="21" letterSpacing="1" fill={P.receipt}>{stampText}</text>
              </g>
            ) : null}
          </>
        ) : (
          <>
            <clipPath id="mc-clip"><rect x="18" y="46" width="164" height="108" rx="12" /></clipPath>
            <text x="34" y="78" fontFamily={`'${FONT.anton}'`} fontSize="26" letterSpacing="1.5" fill={P.receipt}>{label.toUpperCase()}</text>
            <text x="34" y="94" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="9" letterSpacing="2" fill={P.receipt}>{tier}</text>
            <rect x="34" y="106" width="30" height="22" rx="4" fill={accent} {...D} strokeWidth={3} />
            <path d="M34 117 H64 M49 106 V128" stroke={P.ink} strokeWidth="2" />
            <text x="34" y="144" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="12" letterSpacing="2" fill={P.receipt}>{number}</text>
            <g clipPath="url(#mc-clip)"><rect x={sweep} y="30" width="26" height="140" fill="#fff" opacity=".28" transform="skewX(-20)" /></g>
          </>
        )}
      </g>
    </Wrap>
  );
};
