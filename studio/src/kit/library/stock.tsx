import React from "react";
import { Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MONO } from "../../lib/fonts";
import { P, STROKE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

export type StockTreatment = "none" | "ink" | "red" | "halftone" | "thermal";
export type StockFrame = "full" | "receipt" | "polaroid" | "torn" | "stub";

/**
 * Receipt-world look for stock footage. Pixabay clips must never look like generic stock: every use goes through a
 * treatment (palette-mapped, no photographic colour) and, unless `frame="full"`, a paper frame.
 *   treatment: "ink"      greyscale with ink shadows and paper highlights (default)
 *              "red"      greyscale multiplied into loss-red (the single accent), for emphasis
 *              "halftone" 4-level poster tones + dot screen, like a newspaper print
 *              "thermal"  3-level warm print, like a photo printed on a thermal receipt
 *   frame:     "receipt"  photo printed on receipt paper: torn zig-zag ends, perforation, mono caption line
 *              "polaroid" tilted instant-photo with a tape piece and a mono caption
 *              "torn"     the media itself cut with a torn paper edge and a flat ink offset shadow
 *              "stub"     ticket stub with side notches and a big label
 * `src` is a path under studio/public (e.g. "assets/stock/video/mcd-grill-01.mp4"); `kind` picks video or image.
 * Clips are trimmed with `from`/`to` seconds (aim for 2-4s beats). `push` = end scale of a slow push-in (default 1.08).
 * Muted always. Width/height are the frame's outer box in px. HARD BOX (QA §D): x60-920, y270-1436 on 1080x1920, and above the
 * caption band y1056-1248 when captions show: sizes are clamped to STOCK_BOX (860 x 1166) and the polaroid/receipt captions count inside the frame.
 * Sources are 1920x1080 video or <=1280px photos: a full-bleed 9:16 crop is a ~1.8x upscale, so frame="full" throws unless upscale <= 1.35
 * (use a frame, or a treated background via `allowUpscale`).
 */
export const STOCK_BOX = { x: 60, y: 270, w: 860, h: 1166 } as const;
export const StockMedia: React.FC<{
  src: string; kind?: "video" | "image"; treatment?: StockTreatment; frame?: StockFrame;
  width: number; height: number; from?: number; to?: number; push?: number; caption?: string; label?: string;
  tilt?: number; startFrame?: number; seed?: number; durationFrames?: number; srcW?: number; srcH?: number; allowUpscale?: boolean;
}> = ({ src, kind = "video", treatment = "ink", frame = "receipt", width: wIn, height: hIn, srcW, srcH, allowUpscale, from = 0, to, push = 1.08, caption, label, tilt = -1.5, startFrame = 0, seed = 3, durationFrames }) => {
  const width = Math.min(wIn, STOCK_BOX.w), height = Math.min(hIn, STOCK_BOX.h);
  if (frame === "full" && srcW && srcH && !allowUpscale && Math.max(width / srcW, height / srcH) > 1.35) throw new Error(`StockMedia: full-bleed ${width}x${height} would upscale a ${srcW}x${srcH} source ${(Math.max(width / srcW, height / srcH)).toFixed(2)}x; use a frame or allowUpscale`);
  const f = useCurrentFrame() - startFrame;
  const { fps, durationInFrames } = useVideoConfig();
  const dur = durationFrames ?? Math.max(30, durationInFrames - startFrame);
  const pop = Easing.out(Easing.back(2))(interpolate(f, [0, 9], [0, 1], clamp));
  const settle = f < 0 ? 0 : 2.5 * Math.exp(-f / 7) * Math.cos(f / 2.2);
  const zoom = 1 + (push - 1) * interpolate(f, [0, dur], [0, 1], clamp);

  // ---- inner media box dimensions per frame style
  const pad = frame === "polaroid" ? 28 : frame === "receipt" ? 34 : frame === "stub" ? 30 : 0;
  const capH = frame === "polaroid" ? 120 : frame === "receipt" ? (caption ? 110 : 56) : frame === "stub" ? 0 : 0;
  const topH = frame === "receipt" ? 56 : 0;
  const stubW = frame === "stub" ? 190 : 0;
  const mw = width - pad * 2 - stubW;
  const mh = height - pad * 2 - capH - topH;

  const filt =
    treatment === "ink" ? "grayscale(1) contrast(1.12) brightness(1.18)" :
    treatment === "red" ? "grayscale(1) contrast(1.2) brightness(1.05)" :
    treatment === "halftone" ? "grayscale(1) url(#stock-lift) contrast(1.05) url(#stock-post4)" :
    treatment === "thermal" ? "grayscale(1) url(#stock-lift) sepia(.35) url(#stock-post3)" : "none";
  const media = (
    <div style={{ position: "relative", width: mw, height: mh, overflow: "hidden", background: P.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
        {kind === "video" ? (
          <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(from * fps)} endAt={to ? Math.round(to * fps) : undefined} style={{ width: "100%", height: "100%", objectFit: "cover", filter: filt }} />
        ) : (
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: filt }} />
        )}
      </div>
      {treatment === "ink" ? <><div style={{ position: "absolute", inset: 0, background: P.paper, mixBlendMode: "darken" }} /><div style={{ position: "absolute", inset: 0, background: P.ink, mixBlendMode: "lighten" }} /></> : null}
      {treatment === "red" ? <div style={{ position: "absolute", inset: 0, background: P.loss, mixBlendMode: "multiply" }} /> : null}
      {treatment === "halftone" ? <><div style={{ position: "absolute", inset: 0, background: P.paper, mixBlendMode: "darken" }} /><div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 50% 50%, ${P.ink} 0 22%, transparent 26%)`, backgroundSize: "9px 9px", mixBlendMode: "multiply", opacity: 0.3 }} /></> : null}
      {treatment === "thermal" ? <><div style={{ position: "absolute", inset: 0, background: "#E9DFC6", mixBlendMode: "multiply" }} /><div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, rgba(20,19,15,.18) 0 2px, transparent 2px 5px)` }} /></> : null}
      <div style={{ position: "absolute", inset: 0, border: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box" }} />
    </div>
  );

  const svgFilters = (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <filter id="stock-lift" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="gamma" amplitude="1" exponent=".45" offset="0" /><feFuncG type="gamma" amplitude="1" exponent=".45" offset="0" /><feFuncB type="gamma" amplitude="1" exponent=".45" offset="0" /></feComponentTransfer></filter>
      <filter id="stock-post4"><feComponentTransfer><feFuncR type="discrete" tableValues=".12 .4 .7 1" /><feFuncG type="discrete" tableValues=".12 .4 .7 1" /><feFuncB type="discrete" tableValues=".12 .4 .7 1" /></feComponentTransfer></filter>
      <filter id="stock-post3"><feComponentTransfer><feFuncR type="discrete" tableValues=".15 .55 1" /><feFuncG type="discrete" tableValues=".15 .55 1" /><feFuncB type="discrete" tableValues=".15 .55 1" /></feComponentTransfer></filter>
    </svg>
  );

  const outer: React.CSSProperties = { position: "relative", width, height, transform: `rotate(${tilt + settle}deg) scale(${0.85 + 0.15 * pop})`, opacity: Math.min(1, pop * 2.5) };

  if (frame === "full") return <div style={{ ...outer, width: mw, height: mh }}>{svgFilters}{media}</div>;

  if (frame === "torn") {
    const r = rng(seed);
    const n = 18;
    const edge = (x0: number, y0: number, x1: number, y1: number, amp: number) => Array.from({ length: n }, (_, i) => { const t = i / n; return `${(x0 + (x1 - x0) * t + (r() - 0.5) * amp).toFixed(1)}px ${(y0 + (y1 - y0) * t + (r() - 0.5) * amp).toFixed(1)}px`; });
    const clip = `polygon(${[...edge(6, 6, width - 6, 6, 12), ...edge(width - 6, 6, width - 6, height - 6, 12), ...edge(width - 6, height - 6, 6, height - 6, 12), ...edge(6, height - 6, 6, 6, 12)].join(",")})`;
    return (
      <div style={outer}>{svgFilters}
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(10px 10px 0 ${P.ink})` }}>
          <div style={{ position: "absolute", inset: 0, clipPath: clip, background: P.receipt }}>
            <div style={{ position: "absolute", left: 0, top: 0, width, height }}><div style={{ position: "absolute", left: 14, top: 14 }}><div style={{ width: width - 28, height: height - 28 - (caption ? 70 : 0), overflow: "hidden", position: "relative", background: P.ink }}>{React.cloneElement(media, { style: { ...(media.props.style as object), width: width - 28, height: height - 28 - (caption ? 70 : 0) } })}</div></div>
              {caption ? <div style={{ position: "absolute", left: 24, right: 24, bottom: 14, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: P.ink, letterSpacing: 3 }}>{caption.toUpperCase()}</div> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (frame === "stub") {
    return (
      <div style={outer}>{svgFilters}
        <div style={{ position: "absolute", inset: 0, background: P.receipt, border: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box", boxShadow: `10px 10px 0 ${P.ink}` }}>
          <div style={{ position: "absolute", left: pad, top: pad }}>{media}</div>
          <div style={{ position: "absolute", right: stubW - 1, top: 0, bottom: 0, borderLeft: `5px dashed ${P.ink}66` }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: stubW, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "rotate(90deg)", whiteSpace: "nowrap", fontFamily: FONT.anton, fontSize: 64, letterSpacing: 6, color: P.loss }}>{(label ?? "ADMIT ONE").toUpperCase()}</div>
          </div>
          {[-1, 1].map((sd) => <div key={sd} style={{ position: "absolute", right: stubW - 20, top: sd < 0 ? -20 : undefined, bottom: sd > 0 ? -20 : undefined, width: 40, height: 40, borderRadius: 20, background: P.paper, border: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box" }} />)}
        </div>
      </div>
    );
  }

  if (frame === "polaroid") {
    return (
      <div style={outer}>{svgFilters}
        <div style={{ position: "absolute", inset: 0, background: P.receipt, border: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box", boxShadow: `10px 10px 0 ${P.ink}` }}>
          <div style={{ position: "absolute", left: pad, top: pad }}>{media}</div>
          <div style={{ position: "absolute", left: pad, right: pad, bottom: 26, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 4, color: P.ink }}>{(caption ?? "").toUpperCase()}</div>
        </div>
        <div style={{ position: "absolute", left: width / 2 - 100, top: -26, width: 200, height: 60, background: "#E8DFC4", border: `${STROKE.detail}px solid ${P.ink}`, transform: "rotate(-4deg)", opacity: 0.95 }} />
      </div>
    );
  }

  // receipt (default)
  const zz = (flip: boolean) => {
    const n = Math.round(width / 26);
    const pts = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i * width) / (n * 2)},${(i % 2 ? 0 : 16)}`).join(" ");
    return (<svg width={width} height={18} style={{ display: "block", transform: flip ? "scaleY(-1)" : undefined }}><polygon points={`0,0 ${pts} ${width},0`} fill={P.receipt} /><polyline points={pts} fill="none" stroke={P.ink} strokeWidth={STROKE.detail} strokeLinejoin="round" /></svg>);
  };
  return (
    <div style={outer}>{svgFilters}
      <div style={{ position: "absolute", left: 10, top: 12, width, height, background: P.ink, opacity: 0.2 }} />
      <div style={{ position: "relative", width, height, background: P.receipt, borderLeft: `${STROKE.detail}px solid ${P.ink}`, borderRight: `${STROKE.detail}px solid ${P.ink}`, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -2 }}>{zz(false)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -2 }}>{zz(true)}</div>
        <div style={{ position: "absolute", left: pad, right: pad, top: 22, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: P.muted }}>LINE ITEM</div>
        <div style={{ position: "absolute", left: pad, top: pad + topH - 10 }}>{media}</div>
        <div style={{ position: "absolute", left: pad, right: pad, top: pad + topH - 10 + mh + 16, borderTop: `4px dashed ${P.ink}55`, paddingTop: 12, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 4, color: P.ink }}>{(caption ?? "").toUpperCase()}</div>
      </div>
    </div>
  );
};

/**
 * StockShot: a named, ready-to-use stock entry from the generated registry (stock-packs.ts), rendered through the receipt-world
 * treatment. `<StockShot id="mcd-patty-grill-01" caption="Grill" />`. Browse `stockForStory(slug)` for a story's pack.
 * Defaults per entry: treatment "ink", frame "receipt". Same props as StockMedia (minus src/kind).
 */
import { STOCK_BY_ID } from "./stock-packs";
export const StockShot: React.FC<Omit<React.ComponentProps<typeof StockMedia>, "src" | "kind"> & { id: string }> = ({ id, treatment, caption, ...rest }) => {
  const e = STOCK_BY_ID[id];
  if (!e) throw new Error(`Unknown stock id: ${id}`);
  // QA rules: blue UI/data clips always go through ink/red; clips showing ticker numbers never get a caption with real figures
  const t = e.forceTreatment && (!treatment || treatment === "none") ? e.forceTreatment : treatment;
  return <StockMedia src={e.src} kind={e.kind} srcW={e.w} srcH={e.h} treatment={t} caption={e.noFigures ? undefined : caption} {...rest} />;
};
