import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { MONO } from "../../lib/fonts";
import { S, Wrap, type IllusProps } from "../illustrations";
import { P, STROKE } from "../theme";

const D = { stroke: P.ink, strokeWidth: STROKE.detail, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/**
 * DataCentre (LF-009): a windowless warehouse box in cutaway. The front wall is cut away to show 3 rows of server racks (blinking
 * ink/yellow/red status lights, one yellow rack = the key one), power lines come in from a pylon on the left (an electric pulse travels
 * along them: the "load"), and two rooftop cooling units spin their fans and breathe steam. Generic: no logos, no brand colours.
 * Props as IllusProps plus `load` 0..1 (how many racks are lit, default all), `label` (small mono plate on the door, our type; default none).
 * Hero use: `size={1000}` puts the facility (pylon to building) at ~720px wide inside x60-920 when centred with SafeBox. Yellow is ONLY the key rack; LEDs are ink/red/paper. Companion for tallies: RackGlyph row; for place: a PlaceMap/RegionMap pin.
 */
export const DataCentre: React.FC<IllusProps & { load?: number; label?: string }> = (p) => {
  const { color = P.receipt, load = 1, label } = p;
  const f = useCurrentFrame();
  const pulseX = ((f * 3) % 120) / 120;
  const fan = (cx: number, cy: number, dir: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="11" fill={P.receipt} {...D} strokeWidth={3} />
      <g transform={`rotate(${f * 14 * dir})`}>{[0, 120, 240].map((d) => <path key={d} d="M0 0 Q5 -4 0 -10 Q-5 -4 0 0" fill={P.ink} transform={`rotate(${d})`} />)}</g>
    </g>
  );
  return (
    <Wrap {...p}>
      <g transform="translate(4 12) scale(0.88) translate(11 0)">
      {/* power: pylon + lines with a travelling pulse */}
      <g>
        <path d="M14 168 L22 70 L30 168 M17 100 H27 M16 120 H28 M15 145 H29" fill="none" {...D} strokeWidth={3} />
        <path d="M6 70 H38" {...D} strokeWidth={3} />
        <path d="M38 72 Q60 90 78 118" fill="none" stroke={P.ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M38 78 Q56 102 78 126" fill="none" stroke={P.ink} strokeWidth="3" strokeLinecap="round" opacity=".5" />
        {[0, 1].map((k) => {
          const t = (pulseX + k * 0.5) % 1;
          const x = 38 + 40 * t, y = 72 + 46 * Math.pow(t, 1.1);
          return <circle key={k} cx={x} cy={y} r="3.4" fill={P.receipt} stroke={P.ink} strokeWidth="1.8" opacity={Math.sin(t * Math.PI)} />;
        })}
      </g>
      {/* building shell (windowless) */}
      <path d="M72 68 H190 V168 H72 Z" fill={color} {...S} />
      <path d="M72 68 L190 68 L190 60 L72 60 Z" fill={P.muted} {...D} />
      {/* rooftop cooling units */}
      {[96, 150].map((x, i) => (
        <g key={i}>
          <rect x={x - 16} y={44} width="32" height="16" rx="3" fill={P.receipt} {...D} />
          {fan(x, 52, i ? -1 : 1)}
          {[0, 1].map((k) => <path key={k} d={`M${x - 6 + k * 12} 40 q-4 -6 0 -12 q4 -6 0 -12`} fill="none" stroke={P.muted} strokeWidth="2.5" strokeLinecap="round" opacity={0.45 + 0.4 * Math.abs(Math.sin(f / 10 + i * 2 + k))} transform={`translate(0 ${Math.sin(f / 12 + i + k) * -2})`} />)}
        </g>
      ))}
      {/* cutaway window: 3 rows x 4 racks */}
      <rect x="80" y="76" width="102" height="84" fill={P.ink} {...D} />
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
        const idx = r * 4 + c;
        const on = idx / 12 < load;
        const key = idx === 6;
        return (
          <g key={idx} transform={`translate(${86 + c * 24} ${81 + r * 26})`}>
            <rect width="20" height="22" rx="2" fill={key ? P.highlight : "#2A2822"} stroke={P.receipt} strokeWidth="1.6" />
            {[0, 1, 2].map((k) => <rect key={k} x="3" y={3 + k * 6} width="9" height="3.5" fill={key ? P.ink : P.muted} />)}
            {[0, 1, 2].map((k) => {
              const blink = on && Math.sin(f / (5 + ((idx + k) % 4)) + idx * 1.7 + k) > (k === 2 ? 0.6 : -0.2);
              const col = k === 2 ? P.loss : key ? P.ink : P.receipt;
              return <circle key={k} cx="16" cy={5 + k * 6} r="1.9" fill={blink ? col : "#3A372F"} />;
            })}
          </g>
        );
      }))}
      {/* door plate + vent */}
      <rect x="150" y="162" width="28" height="6" fill={P.ink} />
      {label ? <g><rect x="72" y="170" width="118" height="14" rx="3" fill={P.receipt} {...D} strokeWidth={3} /><text x="131" y="181" textAnchor="middle" fontFamily={`'${MONO}'`} fontWeight="700" fontSize="9.5" letterSpacing="1.5" fill={P.ink}>{label.toUpperCase()}</text></g> : null}
      </g>
    </Wrap>
  );
};

/**
 * RackGlyph: one server rack as a 3-unit-outline icon (4 units tall, blinking lights; `hl` makes it the one yellow rack). Square 64 box, size px.
 * For tallies and icon rows (e.g. 12 racks = 12 glyphs); `progress` pop-in.
 */
export const RackGlyph: React.FC<{ size?: number; hl?: boolean; progress?: number; delay?: number }> = ({ size = 200, hl, progress = 1, delay = 0 }) => {
  const f = useCurrentFrame();
  const pop = Easing.out(Easing.back(2))(Math.max(0, Math.min(1, progress)));
  const S3 = { stroke: P.ink, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", transform: `scale(${0.3 + 0.7 * pop})`, opacity: Math.min(1, progress * 3) }}>
      <rect x="14" y="6" width="36" height="52" rx="4" fill={hl ? P.highlight : P.receipt} {...S3} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="19" y={11 + i * 11.5} width="26" height="8" rx="1.5" fill={P.receipt} stroke={P.ink} strokeWidth="2" />
          <circle cx="41" cy={15 + i * 11.5} r="2" fill={Math.sin((f + delay) / 6 + i * 2.1) > 0 ? P.loss : P.ink} />
          <path d={`M22 ${15 + i * 11.5} H33`} stroke={P.muted} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ))}
      <path d="M20 58 V62 M44 58 V62" {...S3} />
    </svg>
  );
};
