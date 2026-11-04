import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { PaperBg } from "../devices";
import { P } from "../theme";

/**
 * Brand marks (code-first, SVG/React). Every profile picture is 1080x1080 with ALL important content inside the inscribed
 * circle (radius 400 from the centre) so the circular crop on YouTube/TikTok/Instagram never cuts it, and it must read at 110px.
 * Banners are 2560x1440 (YouTube) with the 1546x423 "all devices" safe area centred (x507..2053, y508..931): wordmark + tagline live there.
 * Line Item = receipt world (cream, ink, one yellow highlight, red stamp). Cut Desk = unrelated on purpose: near-black, white, signal lime.
 */
export const CD = { bg: "#0E1116", bg2: "#171C24", fg: "#FFFFFF", mute: "#8A94A6", acc: "#C6FF3D", acc2: "#2F6BFF" } as const;

/* ------------------------------------------------------------------------------------------ Line Item profile pictures */

/** A. "LI" stub: a torn receipt stub on ink; LI in Anton, the I highlighted yellow (the one highlighted line item). */
export const LineItemPfpA: React.FC = () => (
  <AbsoluteFill style={{ background: P.ink }}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080">
      <g transform="translate(540 540) rotate(-4) translate(-540 -540)">
        <rect x="258" y="150" width="564" height="780" fill={P.ink} opacity=".35" transform="translate(16 18)" />
        <path d="M258 150 H822 V930 L788 905 L754 930 L720 905 L686 930 L652 905 L618 930 L584 905 L550 930 L516 905 L482 930 L448 905 L414 930 L380 905 L346 930 L292 905 L258 930 Z" fill={P.receipt} stroke={P.paper} strokeWidth="0" />
        <rect x="300" y="210" width="480" height="26" rx="6" fill={P.muted} opacity=".45" />
        <rect x="300" y="262" width="330" height="26" rx="6" fill={P.muted} opacity=".45" />
        <rect x="525" y="392" width="150" height="368" fill={P.highlight} />
        <text x="300" y="735" fontFamily={`'${FONT.anton}'`} fontSize="430" fill={P.ink}>L</text>
        <text x="548" y="735" fontFamily={`'${FONT.anton}'`} fontSize="430" fill={P.ink}>I</text>
        <rect x="300" y="800" width="480" height="24" rx="6" fill={P.muted} opacity=".45" />
      </g>
    </svg>
  </AbsoluteFill>
);

/** B. Highlighted line: three receipt lines on cream, the middle one marked in thick yellow with an ink "$"; reads as "the hidden line". */
export const LineItemPfpB: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    <PaperBg />
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }}>
      <rect x="190" y="290" width="700" height="62" rx="12" fill={P.ink} opacity=".85" />
      <rect x="150" y="440" width="780" height="230" rx="10" fill={P.highlight} transform="rotate(-2 540 555)" />
      <text x="540" y="636" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="250" fill={P.ink} transform="rotate(-2 540 555)">$ ———</text>
      <rect x="190" y="760" width="520" height="62" rx="12" fill={P.ink} opacity=".85" />
    </svg>
  </AbsoluteFill>
);

/** C. Stamp: red ring stamp with LI in the middle on cream, tilted, with a small yellow dot (the highlighted number). */
export const LineItemPfpC: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    <PaperBg />
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }}>
      <g transform="rotate(-10 540 540)">
        <circle cx="540" cy="540" r="365" fill="none" stroke={P.loss} strokeWidth="34" />
        <circle cx="540" cy="540" r="300" fill="none" stroke={P.loss} strokeWidth="12" />
        <text x="540" y="665" textAnchor="middle" fontFamily={`'${FONT.anton}'`} fontSize="430" fill={P.loss} letterSpacing="6">LI</text>
        <rect x="360" y="690" width="360" height="16" fill={P.loss} opacity="0" />
      </g>
      <circle cx="800" cy="270" r="62" fill={P.highlight} stroke={P.ink} strokeWidth="14" />
    </svg>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------------------------------ Cut Desk profile pictures */

/**
 * A (Nathan's final pick, "the CD with a line through it"): monogram CD, the lime cut slashes through the letters and the right half
 * slides 34px down the cut. Polish (QA, 2026-10-17): a thin lime ring and a lifted ground (#141922) so the circle does not vanish on
 * dark-mode feeds (#121212), and a shorter cut (it stops 210px inside the circle edge) so it still reads as one slash at 48px.
 */
export const CutDeskPfpA: React.FC = () => (
  <AbsoluteFill style={{ background: "#141922" }}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <clipPath id="cdA1"><polygon points="0,0 1080,0 1080,330 0,830" /></clipPath>
        <clipPath id="cdA2"><polygon points="0,830 1080,330 1080,1080 0,1080" /></clipPath>
      </defs>
      <circle cx="540" cy="540" r="512" fill="none" stroke={CD.acc} strokeWidth="14" opacity=".55" />
      <g clipPath="url(#cdA1)"><text x="540" y="700" textAnchor="middle" fontFamily={`'${FONT.montserrat}'`} fontWeight="900" fontSize="520" fill={CD.fg} letterSpacing="-20">CD</text></g>
      <g clipPath="url(#cdA2)" transform="translate(34 34)"><text x="540" y="700" textAnchor="middle" fontFamily={`'${FONT.montserrat}'`} fontWeight="900" fontSize="520" fill={CD.fg} letterSpacing="-20">CD</text></g>
      <line x1="215" y1="760" x2="865" y2="345" stroke={CD.acc} strokeWidth="30" strokeLinecap="round" />
    </svg>
  </AbsoluteFill>
);

/** B. Play triangle sliced by a slash: clip = highlight from a longer video. */
export const CutDeskPfpB: React.FC = () => (
  <AbsoluteFill style={{ background: CD.acc2 }}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <clipPath id="cdB1"><polygon points="0,0 560,0 460,1080 0,1080" /></clipPath>
        <clipPath id="cdB2"><polygon points="580,0 1080,0 1080,1080 480,1080" /></clipPath>
      </defs>
      <g clipPath="url(#cdB1)"><polygon points="330,250 330,830 830,540" fill={CD.fg} /></g>
      <g clipPath="url(#cdB2)" transform="translate(30 0)"><polygon points="330,250 330,830 830,540" fill={CD.fg} /></g>
      <polygon points="560,0 580,0 480,1080 460,1080" fill={CD.acc} />
    </svg>
  </AbsoluteFill>
);

/** C. Waveform with a playhead: bold bars on near-black, one lime bar being "cut" (playhead + scissors gap). */
export const CutDeskPfpC: React.FC = () => {
  const hs = [160, 300, 200, 420, 260, 520, 330, 600, 380, 480, 240, 340, 180];
  return (
    <AbsoluteFill style={{ background: CD.bg }}>
      <svg width="1080" height="1080" viewBox="0 0 1080 1080">
        {hs.map((h, i) => <rect key={i} x={150 + i * 62} y={540 - h / 2} width="38" height={h} rx="19" fill={i === 7 ? CD.acc : CD.fg} opacity={i === 7 ? 1 : 0.92} />)}
        <rect x={150 + 7 * 62 + 11} y="150" width="16" height="780" fill={CD.acc} />
        <rect x={150 + 7 * 62 - 6} y="170" width="50" height="50" fill={CD.acc} />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------------------------ banners 2560x1440 */

const SAFE = { x: 507, y: 508, w: 1546, h: 423 } as const;

export const BannerLineItem: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    <PaperBg />
    <svg width="2560" height="1440" viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
      {[0, 1].map((k) => {
        const x = k ? 2140 : 60;
        return (
          <g key={k} transform={`translate(${x} 0)`}>
            <rect x="0" y="0" width="360" height="1440" fill={P.receipt} stroke={P.ink} strokeWidth="6" />
            {Array.from({ length: 14 }, (_, i) => <g key={i}><rect x="30" y={60 + i * 100} width={i % 3 ? 190 : 250} height="16" rx="5" fill={P.muted} opacity=".35" /><rect x="260" y={60 + i * 100} width="70" height="16" rx="5" fill={P.muted} opacity=".35" /></g>)}
            <rect x="26" y={k ? 560 : 860} width="308" height="52" fill={P.highlight} opacity=".9" />
          </g>
        );
      })}
    </svg>
    <div style={{ position: "absolute", left: SAFE.x, top: SAFE.y, width: SAFE.w, height: SAFE.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT.anton, fontSize: 250, lineHeight: 1, color: P.ink, background: P.highlight, padding: "0 36px", letterSpacing: 6, transform: "rotate(-1deg)" }}>LINE ITEM</div>
      <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 700, fontSize: 50, letterSpacing: 4, color: P.ink }}>the hidden business behind everyday things</div>
    </div>
  </AbsoluteFill>
);

export const BannerCutDesk: React.FC = () => {
  const hs = Array.from({ length: 64 }, (_, i) => 90 + Math.abs(Math.sin(i * 1.7) * 260) + (i % 5) * 20);
  return (
    <AbsoluteFill style={{ background: CD.bg }}>
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
        {hs.map((h, i) => {
          const x = 40 + i * 40;
          const inSafe = x > SAFE.x - 30 && x < SAFE.x + SAFE.w + 30;
          return <rect key={i} x={x} y={720 - h / 2} width="22" height={h} rx="11" fill={i === 31 ? CD.acc : CD.fg} opacity={inSafe ? 0.05 : i === 31 ? 1 : 0.35} />;
        })}
        <rect x="1275" y="60" width="12" height="400" fill={CD.acc} opacity=".5" /><rect x="1275" y="980" width="12" height="400" fill={CD.acc} opacity=".5" />
      </svg>
      <div style={{ position: "absolute", left: SAFE.x, top: SAFE.y, width: SAFE.w, height: SAFE.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 230, lineHeight: 1, color: CD.fg, letterSpacing: -6 }}>CUT <span style={{ color: CD.acc }}>DESK</span></div>
        <div style={{ marginTop: 22, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 56, color: CD.mute, letterSpacing: 2 }}>podcast and stream highlights</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------------------------ 1080 square brand cards (TikTok/IG-ready) */

export const CardLineItem: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    <PaperBg />
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <div style={{ fontFamily: FONT.anton, fontSize: 250, lineHeight: 1, background: P.highlight, color: P.ink, padding: "0 30px" }}>LINE ITEM</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: P.ink, textAlign: "center", width: 860, lineHeight: 1.25 }}>the hidden business behind everyday things</div>
    </div>
  </AbsoluteFill>
);
export const CardCutDesk: React.FC = () => (
  <AbsoluteFill style={{ background: CD.bg }}>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <div style={{ fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 168, lineHeight: 1, color: CD.fg, letterSpacing: -5 }}>CUT <span style={{ color: CD.acc }}>DESK</span></div>
      <div style={{ fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 46, color: CD.mute }}>podcast and stream highlights</div>
    </div>
  </AbsoluteFill>
);
