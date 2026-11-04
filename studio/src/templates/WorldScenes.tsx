import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MONO } from "../lib/fonts";
import type { WorldScene } from "../lib/types";
import { Bars, DotGrid, Waterfall } from "../kit/charts";
import { HighlightBox, Marker, PriceTag, Receipt, Redact, prog } from "../kit/devices";
import { SourceSlip } from "./SourceSlip";
import { StockShot } from "../kit/library/stock";
import { SignedBars } from "./SignedBars";
import { GREATER_DUBLIN, REGION_BOUNDS, RegionMap } from "../kit/library/maps3";
import { MapDisclaimer } from "../kit/library/maps2";
import { ProjLine } from "./ProjLine";
import { ProjectionChart } from "../kit/library/charts3";
import { SyncLines } from "./SyncLines";
import { ILLUSTRATIONS } from "../kit/illustrations";
import { Icon } from "../kit/icons";
import { GeoMap } from "../kit/maps";
import { P, useLayout } from "../kit/theme";
import { BankVault, BigNumberCard, DeliveryVan, DollarSplit, FuelPumpLive, GlyphIcon, StampMark, HotDogCombo, MembershipCard, MoneyFlow, PhoneAppLive, RankLadder, RouteMap, ShareRing, SodaCup } from "../kit/library";

const Instant = React.createContext(false); // first scene of a Short: hero + headline are visible on frame 0 (edit rule 7)

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%.]/g, "");

/** Bottom reserve for captions (+ Shorts UI) so content never sits under them. */
const useFrameBox = () => {
  const { u, portrait, width, height } = useLayout();
  const padBottom = (portrait ? 880 : 340) * u; // portrait: hero lane y310-1040 (text box y>=270 even at max punch), caption band y1056-1248
  const padTop = (portrait ? 310 : 80) * u;
  return { u, portrait, width, height, padBottom, padTop, boxW: width - (portrait ? 300 : 200) * u, boxH: height - padBottom - padTop };
};

const Center: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean }> = ({ children, gap = 30, row }) => {
  const { padBottom, padTop, u, portrait } = useFrameBox();
  return (
    <AbsoluteFill style={{ padding: `${padTop}px ${(portrait ? 200 : 60) * u}px ${padBottom}px ${(portrait ? 100 : 60) * u}px`, display: "flex", flexDirection: row ? "row" : "column", justifyContent: "center", alignItems: "center", gap }}>
      {children}
    </AbsoluteFill>
  );
};

/** Words enter translateY 24->0 + opacity, staggered; emphasised words get the marker swipe. */
const Words: React.FC<{ text: string; emphasis?: string[]; size: number; color?: string; align?: "center" | "left"; font?: string }> = ({ text, emphasis = [], size, color = P.ink, align = "center", font = FONT.anton }) => {
  const f = useCurrentFrame();
  const instant = React.useContext(Instant);
  const em = new Set(emphasis.map(norm));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", gap: `0 ${size * 0.26}px`, fontFamily: font, fontSize: size, lineHeight: 1.12, textTransform: "uppercase", color, textAlign: align }}>
      {text.split(/\s+/).filter(Boolean).map((w, i) => {
        const p = instant ? Math.max(0.7, prog(f, i * 3, i * 3 + 10)) : prog(f, i * 3, i * 3 + 10);
        const e = em.has(norm(w));
        const inner = <span style={{ display: "inline-block" }}>{w}</span>;
        return (
          <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
            {e ? <Marker progress={prog(f, i * 3 + 8, i * 3 + 20)}>{inner}</Marker> : inner}
          </span>
        );
      })}
    </div>
  );
};

/** Largest headline size whose estimated wrapped height fits `maxH` (Anton caps ~0.47 em per char, line height 1.12). Portrait: maxH 640 so a 4-line headline never crosses the y270 band. */
const fitSize = (chars: number, portrait: boolean, u: number, text?: string) => {
  const maxW = (portrait ? 780 : 1500) * u, maxH = (portrait ? 640 : 560) * u;
  const hi = (portrait ? 190 : 170) * u, lo = (portrait ? 70 : 100) * u;
  const words = (text ?? "x".repeat(chars)).split(/\s+/).filter(Boolean);
  for (let sz = hi; sz >= lo; sz -= 4 * u) {
    let lines = 1, w = 0;
    for (const wd of words) { const ww = wd.length * 0.47 * sz; const add = (w ? 0.26 * sz : 0) + ww; if (w && w + add > maxW) { lines++; w = ww; } else w += add; }
    if (lines * sz * 1.12 <= maxH) return sz;
  }
  return lo;
};

type S<T extends WorldScene["type"]> = Extract<WorldScene, { type: T }>;

const GLYPH_KEYS: [RegExp, string][] = [[/margin|percent|%|share|half|cut/i, "percent"], [/fee|cash|money|dollar|\$|rent|profit|billion|million/i, "cash"], [/price|tag|cost|cheap/i, "tag"], [/lock|safe|protect|trap|never|stuck/i, "lock"], [/year|month|day|since|every/i, "calendar"], [/look|where|why|how|really|hidden|secret|question/i, "magnifier"], [/soda|drink|cup/i, "soda"], [/gas|pump|fuel/i, "pump"], [/coffee|starbucks/i, "coffee"]];
const autoGlyph = (t: string) => { const g = (GLYPH_KEYS.find(([r]) => r.test(t)) ?? [null, "magnifier"])[1]; return g === "calendar" ? null : (g as never); }; // calendar glyph shows a day number that reads as a figure
const Title: React.FC<{ s: S<"title"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return (
    <Center gap={30 * u}>
      {s.kicker ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38 * u, letterSpacing: 8, color: P.muted }}>{s.kicker}</div> : null}
      <div style={{ maxWidth: (portrait ? 780 : 1500) * u }}><Words text={s.text} emphasis={s.emphasis} size={fitSize(s.text.length, portrait, u, s.text) * (s.illus || s.clip ? (portrait ? (s.text.length > 22 ? 0.5 : 0.58) : 0.8) : !s.dark && portrait ? 0.62 : 1)} color={s.dark ? P.paper : P.ink} /></div>
      {!s.illus && !s.clip && !s.dark && portrait && autoGlyph(s.text) ? <GlyphIcon name={autoGlyph(s.text)!} size={230 * u} /> : null}
      {s.clip ? <ClipPanel clip={s.clip} treatment={s.clipTreatment} w={(portrait ? 700 : 640) * u} h={(portrait ? (s.text.length > 22 ? 300 : 400) : 360) * u} /> : s.illus ? <IllusBox name={s.illus} size={(portrait ? 520 : 420) * u} start={4} /> : null}
    </Center>
  );
};

const Act: React.FC<{ s: S<"act"> }> = ({ s }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const w = prog(f, 0, 16, Easing.out(Easing.exp));
  return (
    <Center gap={26 * u}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56 * u, letterSpacing: 10, color: P.ink, background: P.highlight, padding: `0 ${26 * u}px`, transform: `scaleX(${w})`, transformOrigin: "left" }}>{s.kicker}</div>
      <div style={{ maxWidth: (portrait ? 780 : 1500) * u }}><Words text={s.text} size={fitSize(s.text.length, portrait, u, s.text) * 0.95} color={s.dark ? P.paper : P.ink} /></div>
    </Center>
  );
};

const IllusBox: React.FC<{ name: keyof typeof ILLUSTRATIONS; size: number; start?: number; color?: string }> = ({ name, size, start = 0, color }) => {
  const f = useCurrentFrame();
  const C = ILLUSTRATIONS[name];
  const instant = React.useContext(Instant);
  return <div style={{ margin: `${-size * 0.1}px 0` }}><C size={size} progress={Math.min(1, prog(f, start, start + 8, Easing.linear) + (instant ? 0.6 : 0))} wobble color={color} /></div>; // art sits inside the middle 80% of the viewBox: trim the empty bands from the layout
};

const ReceiptScene: React.FC<{ s: S<"receipt"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  const f = useCurrentFrame();
  return (
    <Center row={!portrait && !s.stamp} gap={(s.stamp && !portrait ? 30 : 60) * u}>
      <Receipt title={s.title} subtitle={s.subtitle} lines={[...(s.prior ?? []), ...s.lines]} startFrame={-(s.prior?.length ?? 0) * 9} total={s.total} widthPx={(portrait ? 780 : s.lines.some((l) => l.label.length + (l.value?.length ?? 0) >= 28) ? 1160 : 940) * u} fontPx={(portrait ? 44 : s.lines.some((l) => l.label.length + (l.value?.length ?? 0) >= 28) ? 38 : 46) * u} />
      {s.illus && !(s.stamp && !portrait) ? <IllusBox name={s.illus} size={(portrait ? 0 : 560) * u} start={6} /> : null}
      {s.stamp ? <div data-gv-ignore="slam" style={portrait ? { position: "absolute", right: 200 * u, top: 270 * u } : { position: "relative" }}><StampMark text={s.stamp} start={Math.round(s.lines.length * 9 + 14)} maxWidth={(portrait ? 420 : 760) * u} fontPx={90 * u} /></div> : null}
      <div style={{ display: "none" }}>{f}</div>
    </Center>
  );
};

const RedactScene: React.FC<{ s: S<"redact"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return (
    <Center gap={34 * u}>
      {s.illus ? <IllusBox name={s.illus} size={(portrait ? 330 : 150) * u} /> : null}
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: (portrait ? 52 : 44) * u, color: s.dark ? "rgba(244,239,228,.75)" : P.muted, letterSpacing: 4, textAlign: "center", marginBottom: 56 * u }}>{s.label}</div>
      <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 270 : 190) * u, lineHeight: 1.4, margin: `${-0.12 * (portrait ? 270 : 190) * u}px 0`, color: P.ink }} data-gv-ignore="redact">
        <Redact startFrame={22}>{s.value}</Redact>
      </div>
      {s.sub ? <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: (portrait ? 46 : 40) * u, color: s.dark ? P.paper : P.ink, textAlign: "center", maxWidth: (portrait ? 780 : 1300) * u }}>{s.sub}</div> : null}
    </Center>
  );
};

const StatScene: React.FC<{ s: S<"stat"> }> = ({ s }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const neg = s.value < 0;
  const claim = neg || s.tone === "loss" || s.tone === "neutral"; // claims / losses: no yellow plate (yellow = verified number); loss = red, neutral = ink ("reported, not independently checked")
  const claimColor = s.tone === "neutral" ? (s.dark ? P.paper : P.ink) : P.loss;
  const c = neg ? 1 : prog(f, 4, 34);
  const txt = (s.value * c).toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0, useGrouping: s.group ?? true });
  const pop = neg ? 1 + 0.35 * (1 - prog(f, 0, 6)) : 1 + 0.07 * Math.sin(prog(f, 34, 42) * Math.PI);
  return (
    <Center gap={36 * u}>
      <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 280 : 210) * u, lineHeight: 1, color: claim ? claimColor : P.ink, fontVariantNumeric: "tabular-nums", transform: `scale(${pop})` }}>
        <HighlightBox on={!claim} progress={prog(f, 26, 40)} style={{ padding: `0 ${24 * u}px` }}>{s.prefix}{txt}{s.suffix}</HighlightBox>
      </div>
      <div style={{ opacity: prog(f, 0, 6), fontFamily: FONT.inter, fontWeight: 800, fontSize: (portrait ? 72 : 52) * u, color: s.dark ? P.paper : P.ink, textAlign: "center", maxWidth: (portrait ? 780 : 1300) * u, lineHeight: 1.15 }}>{s.label}</div>
      {s.sub ? <div style={{ opacity: prog(f, 2, 8), fontFamily: MONO, fontWeight: 500, fontSize: 34 * u, color: s.dark ? "rgba(244,239,228,.7)" : P.muted }}>{s.sub}</div> : null}
    </Center>
  );
};

const BarsScene: React.FC<{ s: S<"bars"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return (
    <Center gap={50 * u}>
      {s.title ? <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 66 : s.items.length >= 4 ? 48 : 56) * u, textTransform: "uppercase", textAlign: "center", color: s.dark ? P.paper : P.ink, lineHeight: 1.05, maxWidth: (portrait ? 780 : 1500) * u }}>{s.title}</div> : null}
      {true ? <SignedBars dark={s.dark} items={s.items} width={(portrait ? 780 : 1300) * u} unit={s.unit} prefix={s.prefix} decimals={s.decimals ?? 1} fontPx={(portrait ? 68 : s.items.length >= 4 ? 36 : 44) * u} /> : <Bars items={s.items} width={(portrait ? 780 : 1300) * u} unit={s.unit} prefix={s.prefix} decimals={s.decimals ?? 1} fontPx={(portrait ? 68 : s.items.length >= 4 ? 36 : 44) * u} />}
    </Center>
  );
};

const DotsScene: React.FC<{ s: S<"dots"> }> = ({ s }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const cols = s.cols ?? (portrait ? 20 : 36), rows = s.rows ?? (portrait ? 24 : 14);
  const W = (portrait ? 780 : 1500) * u, H = (portrait ? 620 : 480) * u;
  return (
    <Center gap={30 * u}>
      <div style={{ fontFamily: FONT.anton, fontSize: 130 * u, color: P.ink, textTransform: "uppercase", textAlign: "center", opacity: prog(f, 0, 10) }}>
        <HighlightBox on progress={prog(f, 34, 48)} style={{ padding: `0 ${18 * u}px` }}>{s.label}</HighlightBox>
      </div>
      <DotGrid cols={cols} rows={rows} share={s.share} width={W} height={H} />
      <div style={{ display: "flex", gap: 50 * u, fontFamily: FONT.inter, fontWeight: 800, fontSize: 40 * u, color: P.ink }}>
        <span><span style={{ display: "inline-block", width: 28 * u, height: 28 * u, borderRadius: "50%", background: P.highlight, border: `3px solid ${P.ink}`, marginRight: 12 * u }} />{s.fillLabel ?? "Franchised"}</span>
        <span><span style={{ display: "inline-block", width: 28 * u, height: 28 * u, borderRadius: "50%", background: P.loss, border: `3px solid ${P.ink}`, marginRight: 12 * u }} />{s.restLabel ?? "Company-run"}</span>
      </div>
    </Center>
  );
};

/** Ireland via the Asset Builder's RegionMap (LF-006): whole island, or a fly from the island to Greater Dublin; Dublin highlighted + pulsing + pinned. */
const IrelandRegion: React.FC<{ s: S<"map">; w: number; h: number }> = ({ s, w, h }) => (
  <div>
    <RegionMap width={w} height={h} highlight={(s.highlight ?? ["Dublin"]).flatMap((x) => (x === "Dublin" ? GREATER_DUBLIN : [x]))} from={s.mode === "zoom" ? { bounds: REGION_BOUNDS.ireland } : undefined} to={s.mode === "zoom" ? { bounds: REGION_BOUNDS["greater dublin"] } : { bounds: REGION_BOUNDS.ireland }} frames={40} pins={[{ lon: -6.26, lat: 53.35, label: s.mode === "zoom" ? "Greater Dublin" : "Dublin" }]} />
    <MapDisclaimer width={w} />
  </div>
);

const MapScene: React.FC<{ s: S<"map"> }> = ({ s }) => {
  const { u, portrait, boxW, boxH } = useFrameBox();
  const w = Math.min(boxW, portrait ? 780 * u : 1500 * u);
  const h = Math.min(boxH - (s.title ? 150 * u : 0), w * (s.region === "us" ? 0.62 : 0.52));
  if (s.region === "ireland" && !portrait)
    return (
      <Center row gap={80 * u}>
        <IrelandRegion s={s} w={640 * u} h={boxH - 40 * u} />
        <div style={{ maxWidth: 760 * u, display: "flex", flexDirection: "column", gap: 30 * u }}>
          {s.title ? <div style={{ fontFamily: FONT.anton, fontSize: 84 * u, textTransform: "uppercase", lineHeight: 1.05 }}>{s.title}</div> : null}
          {s.caption ? <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: 44 * u, lineHeight: 1.15 }}>{s.caption}</div> : null}
        </div>
      </Center>
    );
  return (
    <Center gap={30 * u}>
      {s.title ? <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 100 : 76) * u, textTransform: "uppercase", textAlign: "center" }}>{s.title}</div> : null}
      {s.region === "ireland" ? <IrelandRegion s={s} w={w} h={Math.min(boxH - (s.title ? 150 * u : 0) - (s.caption ? 90 * u : 0), w * 1.1)} /> : <GeoMap region={s.region} width={w} height={h} dots={s.dots} highlight={s.highlight} scatter={s.scatter} />}
      {s.caption ? <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: 46 * u, textAlign: "center", maxWidth: 780 * u }}>{s.caption}</div> : null}
    </Center>
  );
};

const ChartScene: React.FC<{ s: S<"chart"> }> = ({ s }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const W = (portrait ? 780 : 1400) * u, H = (portrait ? 760 : s.kind === "line" && s.band ? 450 : (s.title ?? "").length > 40 ? 340 : 380) * u;
  return (
    <Center gap={26 * u}>
      {s.title ? <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 64 : (s.title ?? "").length > 40 ? 44 : 56) * u, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, maxWidth: (portrait ? 780 : 1240) * u }}>{s.title}</div> : null}
      {s.kind === "line" && s.band ? <ProjectionChart actual={s.points.slice(0, (s.projectedFrom ?? s.points.length - 1) + 1).map((y, x) => ({ x, y }))} projection={s.points.slice(s.projectedFrom ?? s.points.length - 1).map((y, i) => ({ x: (s.projectedFrom ?? s.points.length - 1) + i, y }))} band={{ x: s.points.length - 1, lo: s.band[0], hi: s.band[1], label: `${s.band[0]}-${s.band[1]}${s.ySuffix ?? ""}` }} xTicks={(s.xLabels ?? []).length >= 2 ? [{ x: 0, label: s.xLabels![0] }, { x: s.points.length - 1, label: s.xLabels![s.xLabels!.length - 1] }] : []} ySuffix={s.ySuffix} decimals={1} yMin={Math.min(...s.points)} yMax={Math.max(...s.points, s.band[1])} width={portrait ? Math.min(W, 860 * u) : 1400 * u} height={portrait ? H : 540 * u} compact={portrait ? undefined : true} minPlotHeight={300} /> : s.kind === "line" ? <ProjLine points={s.points} projectedFrom={s.projectedFrom ?? s.points.length - 1} band={s.band} fontPx={(portrait ? 34 : 34) * u} width={W} height={H} xLabels={s.xLabels} ySuffix={s.ySuffix} endLabel={s.endLabel} /> : <Waterfall steps={s.steps} width={W} height={H} prefix={s.prefix} suffix={s.suffix} />}
      {s.kind === "line" && s.endLabel && !s.band && portrait ? <div style={{ opacity: prog(f, 40, 52), fontFamily: FONT.anton, fontSize: 110 * u }}><HighlightBox on progress={prog(f, 42, 56)}>{s.endLabel}</HighlightBox></div> : null}
    </Center>
  );
};

const SensitivityScene: React.FC<{ s: S<"sensitivity">; words: { text: string; startMs: number }[]; sceneStartMs: number }> = ({ s, words, sceneStartMs }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useFrameBox();
  const W = (portrait ? 780 : 1500) * u, H = (portrait ? 520 : 400) * u;
  // each line starts when the voice first says one of its distinctive words (fallback: evenly spaced), never before frame 4
  const stems = (l: string) => l.toLowerCase().replace(/\(.*\)/g, "").split(/[^a-z]+/).filter((w) => w.length > 3 && !["with", "fees", "gal"].includes(w));
  const n = s.series.length;
  const startFrames = s.series.map((x, k) => {
    const hit = words.find((w) => stems(x.label).some((st) => w.text.toLowerCase().replace(/[^a-z]/g, "").startsWith(st.slice(0, 4))));
    return Math.max(0, Math.min(k * 22, hit ? Math.round(((hit.startMs - sceneStartMs) / 1000) * fps) : k * 20)); // never later than 22 frames per line: the chart must not sit empty waiting for a word
  });
  for (let k = 1; k < n; k++) if (startFrames[k] <= startFrames[k - 1]) startFrames[k] = startFrames[k - 1] + 18; // strictly one at a time
  const last = Math.max(...startFrames) + 24;
  return (
    <Center gap={22 * u}>
      <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 68 : 60) * u, textTransform: "uppercase", textAlign: "center", maxWidth: (portrait ? 780 : 1500) * u }}>{s.title}</div>
      <div style={{ flexShrink: 0, height: H, width: W }}><SyncLines series={s.series} startFrames={startFrames} width={W} height={H} xLabels={s.xLabels} yFloor={s.yFloor} fontPx={(portrait ? 36 : 30) * u} /></div>
      {s.sourced && f >= last + 8 && f < last + 44 ? <div style={{ position: "absolute", right: 90 * u, top: (portrait ? 760 : 560) * u }}><StampMark text="SOURCED" tone="ink" start={last + 8} maxWidth={(portrait ? 420 : 420) * u} fontPx={80 * u} /></div> : null}
      <div style={{ opacity: prog(f, last, last + 10), fontFamily: MONO, fontWeight: 700, fontSize: (portrait ? 46 : 44) * u, color: P.ink, textAlign: "center", maxWidth: (portrait ? 800 : 1500) * u }}>
        <HighlightBox on progress={prog(f, last + 4, last + 18)}>{s.takeaway}</HighlightBox>
      </div>
    </Center>
  );
};

const ObjectScene: React.FC<{ s: S<"object"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return (
    <Center row={!portrait} gap={(portrait ? 20 : 90) * u}>
      <IllusBox name={s.illus} size={(portrait ? (s.tag ? 400 : s.size ?? ((s.text ?? "").length <= 16 ? 720 : (s.text ?? "").length <= 26 ? 540 : 480)) : 640) * u} color={s.color} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 * u, maxWidth: (portrait ? 780 : 760) * u }}>
        {s.tag ? <PriceTag from={s.tag.from} to={s.tag.to} label={s.tag.label} flipFrame={34} size={130 * u} /> : null}
        {s.text ? <Words text={s.text} emphasis={s.emphasis} size={(portrait ? ((s.size ? 92 : 104) * ((s.text ?? "").length > 16 ? 0.9 : 1)) : 110) * u} /> : null}
      </div>
    </Center>
  );
};

const MontageScene: React.FC<{ s: S<"montage">; durationFrames: number }> = ({ s, durationFrames }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const per = durationFrames / s.cuts.length;
  const i = Math.min(s.cuts.length - 1, Math.floor(f / per));
  const c = s.cuts[i];
  const local = f - i * per;
  const pop = 1 + (1 - prog(local, 0, 6)) * 0.12;
  const C = c.illus ? ILLUSTRATIONS[c.illus] : null;
  return (
    <Center gap={26 * u}>
      <div style={{ transform: `scale(${pop})` }}>{c.glyph ? <GlyphIcon name={c.glyph as never} size={(portrait ? 420 : 400) * u} /> : C ? <C size={(portrait ? 470 : 480) * u} progress={1} /> : c.icon ? <Icon name={c.icon} size={340 * u} /> : null}</div>
      <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 104 : 120) * u, textTransform: "uppercase", textAlign: "center", color: P.ink, maxWidth: (portrait ? 780 : 1400) * u }}><HighlightBox on progress={prog(local, 2, 10)}>{c.text}</HighlightBox></div>
    </Center>
  );
};

const StampScene: React.FC<{ s: S<"stamp"> }> = ({ s }) => {
  const { u } = useFrameBox();
  return (
    <Center gap={50 * u}>
      <StampMark text={s.text} tone={s.tone === "gain" ? "gain" : "loss"} start={6} maxWidth={780 * u} fontPx={190 * u} />
      {s.sub ? <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: 52 * u, textAlign: "center", maxWidth: 780 * u }}>{s.sub}</div> : null}
    </Center>
  );
};

const DocScene: React.FC<{ s: S<"doc"> }> = ({ s }) => {
  const f = useCurrentFrame();
  const { u, portrait } = useFrameBox();
  const zoom = 1 + 0.12 * prog(f, 20, 50);
  return (
    <Center>
      <div style={{ width: (portrait ? 740 : 1100) * u, background: P.receipt, border: `4px solid ${P.ink}`, padding: 44 * u, boxShadow: `14px 14px 0 ${P.ink}`, transform: `scale(${zoom}) rotate(-1deg)` }}>
        <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: 34 * u, color: P.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 * u }}>{s.title}</div>
        {s.lines.map((l, i) => {
          const hl = i === s.highlight;
          return (
            <div key={i} style={{ fontFamily: MONO, fontWeight: hl ? 700 : 500, fontSize: 36 * u, color: P.ink, padding: `${8 * u}px 0`, borderBottom: "2px dotted rgba(20,19,15,.25)", opacity: hl ? 1 : 0.8 }}>
              {hl ? <HighlightBox on progress={prog(f, 14, 28)} style={{ padding: 0 }}>{l}</HighlightBox> : l}
            </div>
          );
        })}
        {s.footer ? <div style={{ fontFamily: FONT.inter, fontWeight: 600, fontSize: 28 * u, color: P.muted, marginTop: 16 * u }}>{s.footer}</div> : null}
      </div>
    </Center>
  );
};

/** Stock video through the kit's treated frames (StockShot: never raw clips). Frame/treatment rotate by clip name so cuts differ. */
const FRAMES = ["polaroid", "receipt", "torn"] as const; // no "stub": its ADMIT ONE print reads as a stray box
const TREAT = ["thermal"] as const; // "ink" renders dark clips solid black; thermal lifts them
const ClipPanel: React.FC<{ clip: string; w: number; h: number; treatment?: "ink" | "thermal" }> = ({ clip, w, h, treatment }) => {
  const k = clip.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return <StockShot id={clip} frame={FRAMES[k % 3]} treatment={treatment ?? TREAT[0]} width={w} height={h} to={3} />;
};

const ClipScene: React.FC<{ s: S<"clip"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return (
    <Center row={!portrait} gap={(portrait ? 36 : 70) * u}>
      <ClipPanel clip={s.clip} w={(portrait ? 740 : 820) * u} h={(portrait ? 520 : 560) * u} />
      {s.text ? <div style={{ maxWidth: (portrait ? 780 : 640) * u }}><Words text={s.text} emphasis={s.emphasis} size={(portrait ? 100 : 100) * u} /></div> : null}
    </Center>
  );
};

const StockInset: React.FC<{ stock: NonNullable<WorldScene["stock"]> }> = ({ stock }) => {
  const { u, portrait, width } = useFrameBox();
  const w = (portrait ? 700 : 560) * u, h = (portrait ? 380 : 420) * u;
  return (
    <div style={{ position: "absolute", left: portrait ? (width - w) / 2 : width - 70 * u - w, top: (portrait ? 330 : 190) * u }}>
      <StockShot id={stock.id} frame={(stock.frame as never) ?? "polaroid"} treatment={(stock.treatment as never) ?? "thermal"} width={w} height={h} to={3} />
    </div>
  );
};

const LIB: Record<string, React.FC<any>> = { hotdogcombo: HotDogCombo, membership: MembershipCard, vault: BankVault, van: DeliveryVan, soda: SodaCup, pumplive: FuelPumpLive, phonelive: PhoneAppLive };

const Head: React.FC<{ title?: string; u: number }> = ({ title, u }) =>
  title ? <div style={{ fontFamily: FONT.anton, fontSize: 96 * u, textTransform: "uppercase", textAlign: "center", color: P.ink, lineHeight: 1.05 }}>{title}</div> : null;

const BigNumScene: React.FC<{ s: S<"bignum"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  const f = useCurrentFrame();
  if (s.tone === "loss" || s.tone === "neutral") {
    // a CLAIM, not a verified figure: loss red on paper, no yellow plate, hard slam instead of a count-up
    const n = s.value.toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0, useGrouping: s.group ?? true });
    const pop = 1 + 0.3 * (1 - prog(f, 0, 6));
    return (
      <Center gap={26 * u}>
        {s.kicker ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40 * u, letterSpacing: 8, color: s.dark ? P.paper : P.muted }}>{s.kicker.toUpperCase()}</div> : null}
        <div style={{ fontFamily: FONT.anton, fontSize: (portrait ? 300 : 240) * u, lineHeight: 1.1, color: s.tone === "neutral" ? (s.dark ? P.paper : P.ink) : P.loss, transform: `scale(${pop})` }}>{s.prefix}{n}{s.suffix}</div>
        <div style={{ opacity: prog(f, 4, 12), fontFamily: FONT.inter, fontWeight: 800, fontSize: (portrait ? 48 : 40) * u, color: s.dark ? P.paper : P.ink, textAlign: "center", maxWidth: (portrait ? 780 : 1200) * u, lineHeight: 1.15 }}>{s.sub}</div>
      </Center>
    );
  }
  return <Center><div style={{ transform: `scale(${u})`, transformOrigin: "center" }}><BigNumberCard value={s.value} sub={s.sub} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} group={s.group} kicker={s.kicker} width={(portrait ? 780 : 1100)} /></div></Center>;
};
const RingScene: React.FC<{ s: S<"ring"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return <Center gap={20 * u}><Head title={s.title} u={u} /><ShareRing size={(portrait ? (s.sub.length > 28 ? 520 : 760) : s.sub.length > 28 ? 440 : 560) * u} share={s.share} sub={s.sub.length > 28 ? "" : s.sub} tone={s.tone} decimals={Math.abs(s.share * 100 - Math.round(s.share * 100)) > 0.05 ? 1 : 0} />
      {s.sub.length > 28 ? <div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: (portrait ? 46 : 40) * u, textAlign: "center", color: s.dark ? P.paper : P.ink, maxWidth: (portrait ? 780 : 1200) * u, lineHeight: 1.15 }}>{s.sub}</div> : null}</Center>;
};
const SplitScene: React.FC<{ s: S<"split"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return <Center gap={30 * u}><Head title={s.title} u={u} /><DollarSplit width={(portrait ? 780 : 1300) * u} parts={s.parts} hl={s.hl} /></Center>;
};
const RankScene: React.FC<{ s: S<"rank"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  return <Center gap={30 * u}><Head title={s.title} u={u} /><RankLadder width={(portrait ? 780 : 1300) * u} items={s.items} best={s.best} unit={s.unit} prefix={s.prefix} decimals={s.decimals} /></Center>;
};
const RouteScene: React.FC<{ s: S<"route"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  const w = (portrait ? 780 : 1300) * u;
  return <Center gap={20 * u}><Head title={s.title} u={u} /><div style={{ paddingTop: 60 * u }}><RouteMap width={w} height={w * 0.62} stops={s.stops.map((t, i) => ({ side: i % 2 ? "bl" : "br", ...t })) as never} /></div></Center>;
};
const FlowScene: React.FC<{ s: S<"flow"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  const w = (portrait ? 780 : 1300) * u, h = (portrait ? 560 : 420) * u;
  return <Center gap={10 * u}><Head title={s.title} u={u} /><MoneyFlow width={w} height={h} label={s.label} back={s.back ? { label: s.back } : undefined} /></Center>;
};
const LibScene: React.FC<{ s: S<"lib"> }> = ({ s }) => {
  const { u, portrait } = useFrameBox();
  const C = LIB[s.object];
  return (
    <Center row={!portrait} gap={(portrait ? 20 : 90) * u}>
      <div style={{ margin: `${-(portrait ? 700 : 600) * u * 0.1}px 0` }}><C size={(portrait ? 700 : 600) * u} {...(s.props ?? {})} /></div>
      {s.text ? <div style={{ maxWidth: (portrait ? 780 : 760) * u }}><Words text={s.text} emphasis={s.emphasis} size={(portrait ? 100 : 110) * u} /></div> : null}
    </Center>
  );
};

export const SceneView: React.FC<{ s: WorldScene; durationFrames: number; punches?: number[]; first?: boolean; showSources?: boolean; words?: { text: string; startMs: number }[] }> = ({ s, durationFrames, punches = [], first, showSources, words = [] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const push = 1 + 0.02 * Math.min(1, f / Math.min(durationFrames, fps * 12)); // 100 -> 106 % push-in
  // edit rules (playbooks/edit-rules.md): a visual event at least every 2.5 s. Events = scene start + zoom-punches snapped to spoken words
  // (>= 8% in 3 frames, decays over 10) + the elements' own entrances. Max combined scale stays <= ~1.10 so content stays in the safe lane.
  const lastPunch = punches.filter((p) => p <= f).pop();
  const punch = lastPunch === undefined ? 0 : Math.max(0, 1 - (f - lastPunch) / 10) * Math.min(1, (f - lastPunch + 1) / 3);
  const pulse = 1 + 0.08 * punch;
  const reframe = 1;
  let body: React.ReactNode;
  switch (s.type) {
    case "title": body = <Title s={s} />; break;
    case "act": body = <Act s={s} />; break;
    case "receipt": body = <ReceiptScene s={s} />; break;
    case "redact": body = <RedactScene s={s} />; break;
    case "stat": body = <StatScene s={s} />; break;
    case "bars": body = <BarsScene s={s} />; break;
    case "dots": body = <DotsScene s={s} />; break;
    case "map": body = <MapScene s={s} />; break;
    case "chart": body = <ChartScene s={s} />; break;
    case "sensitivity": body = <SensitivityScene s={s} words={words} sceneStartMs={s.startMs} />; break;
    case "object": body = <ObjectScene s={s} />; break;
    case "montage": body = <MontageScene s={s} durationFrames={durationFrames} />; break;
    case "stamp": body = <StampScene s={s} />; break;
    case "doc": body = <DocScene s={s} />; break;
    case "bignum": body = <BigNumScene s={s} />; break;
    case "ring": body = <RingScene s={s} />; break;
    case "split": body = <SplitScene s={s} />; break;
    case "rank": body = <RankScene s={s} />; break;
    case "route": body = <RouteScene s={s} />; break;
    case "flow": body = <FlowScene s={s} />; break;
    case "lib": body = <LibScene s={s} />; break;
    case "clip": body = <ClipScene s={s} />; break;
  }
  return (
    <Instant.Provider value={!!first}>
    <AbsoluteFill>
      <AbsoluteFill data-gv="content" data-gv-dark={s.dark ? "1" : "0"} style={{ left: s.stock ? -230 : 0, transformOrigin: "45% 35%", transform: `scale(${s.type === "montage" ? 1 : push * reframe * pulse})` }}>{body}</AbsoluteFill>
      {s.stock && !s.dark ? <StockInset stock={s.stock} /> : null}
      {s.sourced && s.type !== "sensitivity" && f >= 30 && f < 66 ? <div style={{ position: "absolute", right: (portrait ? 90 : 110) * u, top: (portrait ? 330 : 130) * u }}><StampMark text="SOURCED" tone={s.dark ? "gain" : "ink"} start={30} maxWidth={(portrait ? 420 : 400) * u} fontPx={80 * u} /></div> : null}
      {showSources && s.source ? <SourceSlip text={s.source} /> : null}
    </AbsoluteFill>
    </Instant.Provider>
  );
};

/** Auto SFX cues for a scene (times in ms, absolute). `sfx: null` disables; `sfx: "name"` replaces the signature cue. */
export const sceneCues = (s: WorldScene, fps = 30): { atMs: number; src: string; volume?: number }[] => {
  if (s.sfx === null) return [];
  const t0 = s.startMs, fr = (n: number) => t0 + (n / fps) * 1000;
  const cues: { atMs: number; src: string; volume?: number }[] = [];
  if (["stat", "bignum", "redact", "stamp", "ring"].includes(s.type) && t0 > 1500) cues.push({ atMs: t0 - 1300, src: "riser-synth", volume: 0.1 });
  if (s.dark && s.sfx !== null) cues.push({ atMs: Math.max(0, fr(-8)), src: "paper-tear", volume: 0.35 });
  const sig = (src: string, atFrame: number, volume = 0.4) => cues.push({ atMs: fr(atFrame), src: s.sfx ?? src, volume });
  switch (s.type) {
    case "title": sig("pixabay-whoosh-short", 0, 0.25); break;
    case "act": cues.push({ atMs: Math.max(0, fr(-8)), src: "paper-tear", volume: 0.4 }); break;
    case "receipt": s.lines.forEach((_, i) => cues.push({ atMs: fr(i * 9), src: "printer-chirp", volume: 0.3 })); if (s.stamp) cues.push({ atMs: fr(s.lines.length * 9 + 14), src: "stamp-thud", volume: 0.5 }); break;
    case "redact": cues.push({ atMs: fr(22), src: "redact-peel", volume: 0.3 }); cues.push({ atMs: fr(34), src: s.sfx ?? "impact-soft-heavy", volume: 0.45 }); break;
    case "stat": sig("impact-soft-heavy", 34, 0.45); cues.push({ atMs: fr(0), src: "marker-swipe", volume: 0.15 }); break;
    case "bars": case "chart": sig("pixabay-whoosh-short", 0, 0.22); break;
    case "dots": sig("pixabay-riser", 4, 0.2); break;
    case "map": sig("pixabay-whoosh-short", 0, 0.2); break;
    case "sensitivity": sig("marker-swipe", 50, 0.3); break;
    case "object": if (s.tag) cues.push({ atMs: fr(34), src: "tag-flip", volume: 0.4 }); else sig("pop-pluck", 2, 0.35); break;
    case "stamp": sig("stamp-thud", 6, 0.55); break;
    case "doc": sig("marker-swipe", 14, 0.3); break;
    case "montage": {
      const per = (s.durationMs / s.cuts.length);
      s.cuts.forEach((_, i) => cues.push({ atMs: t0 + i * per, src: ["pixabay-pop", "pop-pluck", "impact-light"][i % 3], volume: 0.32 }));
      break;
    }
  }
  return cues;
};
