import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { MONO } from "../lib/fonts";
import type { WorldProps, WorldScene } from "../lib/types";
import { PaperBg } from "../kit/devices";
import { P, useLayout } from "../kit/theme";
import { LedgerBg, ReceiptRollBg, WarehouseBackdrop, CoinTagAccents, TearWipe as LibTear, RedactWipe, StampCutWipe } from "../kit/library";
import { Decor, TabEntry } from "./Decor";
import { LayoutGuard } from "./LayoutGuard";
import { SceneView, sceneCues } from "./WorldScenes";

const TAIL_MS = 250; // edit rule 25: cut within 0.3 s of the last word
const toks = (t: string) => t.toLowerCase().replace(/[^a-z0-9$%\s]/g, " ").split(/\s+/).filter(Boolean);
const headline = (s: WorldScene) => (s.type === "montage" ? s.cuts.map((c) => c.text).join(" ") : "text" in s && typeof s.text === "string" ? s.text : "");

/** The figure a scene reveals, for the running-tab receipt at the bottom of the frame (null = nothing new). */
/** Zoom-punch frames (scene-relative), one about every 2 s, snapped to the nearest spoken word start (edit rule 1, 3). */
const punchFrames = (s: WorldScene, words: { startMs: number }[], fps: number) => {
  const out: number[] = [];
  for (let t = s.startMs + 2000; t < s.startMs + s.durationMs - 700; t += 2000) {
    const near = words.filter((w) => Math.abs(w.startMs - t) <= 600).sort((a, b) => Math.abs(a.startMs - t) - Math.abs(b.startMs - t))[0];
    out.push(Math.round((((near?.startMs ?? t) - s.startMs) / 1000) * fps));
  }
  return out;
};

const AUTO_BG = new Set(["title", "object", "bignum", "stat", "stamp", "act", "lib", "ring", "redact"]);
const autoBg = (s: WorldScene, i: number) => s.bg ?? (AUTO_BG.has(s.type) && !(s.type === "title" && s.clip) ? "ledger" : "none");
const Bg: React.FC<{ s: WorldScene; i: number }> = ({ s, i }) => {
  switch (autoBg(s, i)) {
    case "ledger": return <LedgerBg dark={s.dark} seed={s.startMs % 11} calm={[0.1, 0.72]} />; // figures fade to ~6% from y192 to y1382 (hero + captions on calm paper); the bottom band stays alive
    case "roll": return <ReceiptRollBg dark={s.dark} seed={s.startMs % 7} />;
    case "warehouse": return <WarehouseBackdrop dark={s.dark} />;
    case "coins": return <CoinTagAccents dark={s.dark} seed={s.startMs % 9} />;
    default: return null;
  }
};

const Wipe: React.FC<{ s: WorldScene }> = ({ s }) =>
  s.cut === "redact" ? <RedactWipe durationFrames={16} /> : s.cut === "stamp" ? <StampCutWipe durationFrames={16} text={s.cutText ?? "PAID"} /> : <LibTear durationFrames={16} dark={s.dark} />;

const tabEntry = (s: WorldScene): TabEntry | null => {
  const cut = (t: string) => { const u = t.toUpperCase(); if (u.length <= 22) return u; const c = u.slice(0, 22); return c.slice(0, Math.max(8, c.lastIndexOf(" "))); };
  switch (s.type) {
    case "stat": return { label: cut(s.label.replace(/^of /i, "")), value: `${s.prefix ?? ""}${s.value}${s.suffix ?? ""}`, delay: 38 };
    case "redact": return { label: cut(s.label), value: s.value, delay: 38 };
    case "receipt": { const k = Math.max(0, s.lines.findIndex((x) => x.hl)); const idx = s.lines.some((x) => x.hl) ? k : s.lines.length - 1; const l = s.lines[idx]; return l?.value ? { label: cut(l.label), value: l.value, delay: idx * 9 + 18 } : null; }
    case "bars": { const i = s.items[0]; return i ? { label: cut(i.label), value: `${s.prefix ?? ""}${i.value.toFixed(s.decimals ?? 1)}${s.unit ?? ""}`, delay: 26 } : null; }
    case "dots": return { label: "FRANCHISED", value: `${Math.round(s.share * 100)}%`, delay: 40 };
    default: return null;
  }
};

/** Captions that merely repeat the on-screen headline are dropped for that scene (edit rule). `captions:false` forces it. */
const suppressWindows = (scenes: WorldScene[]) =>
  scenes.filter((s) => {
    if (s.captions === false) return true;
    const h = toks(headline(s));
    if (h.length < 3 || !s.vo) return false;
    const v = new Set(toks(s.vo));
    return h.filter((w) => v.has(w)).length / h.length >= 0.8;
  });

/** "Line Item" receipt world. Same component renders 1080x1920 (Receipt) and 1920x1080 (LongForm). */
export const ReceiptWorld: React.FC<WorldProps> = (p) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const tabs: TabEntry[][] = [];
  p.scenes.reduce<TabEntry[]>((acc, s) => { const e = tabEntry(s); const next = e ? [...acc, e] : acc; tabs.push(next); return next; }, []);
  const printCues = !p.runningTab ? [] : p.scenes.flatMap((s) => { const e = tabEntry(s); return e && portrait ? [{ atMs: s.startMs + ((e.delay ?? 8) / fps) * 1000, src: "printer-chirp", volume: 0.16 }] : []; });
  const punches = p.scenes.map((s) => punchFrames(s, p.captions, fps));
  const punchCues = p.scenes.flatMap((s, i) => punches[i].map((f) => ({ atMs: s.startMs + (f / fps) * 1000, src: "pop-tick", volume: 0.12 })));
  const cues = [...p.scenes.flatMap((s) => sceneCues(s, fps)), ...printCues, ...punchCues, ...(p.sfx ?? [])];
  const style = p.captionStyle;
  const sup = suppressWindows(p.scenes);
  const captions = p.captions.filter((c) => !sup.some((s) => c.startMs >= s.startMs - 40 && c.startMs < s.startMs + s.durationMs));
  const tagOpacity = portrait ? interpolate(frame, [36, 48], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill data-gv-probe="1" style={{ backgroundColor: P.paper }}>
      {p.scenes.map((s, i) => {
        const last = i === p.scenes.length - 1;
        const dur = Math.max(1, Math.round(((s.durationMs + (last ? TAIL_MS : 0)) / 1000) * fps));
        const from = Math.round((s.startMs / 1000) * fps);
        return (
          <React.Fragment key={i}>
            <Sequence from={from} durationInFrames={dur}>
              <PaperBg dark={s.dark} />
              <Bg s={s} i={i} />
              <Decor dark={s.dark} tab={p.runningTab && !s.dark ? tabs[i] : []} />
              <SceneView s={s} durationFrames={dur} punches={punches[i]} first={i === 0} showSources={p.showSources} words={p.captions.filter((c) => c.startMs >= s.startMs && c.startMs < s.startMs + s.durationMs)} />
            </Sequence>
            {i > 0 && (s.cut || s.dark || s.type === "act") ? (
              <Sequence from={Math.max(0, from - 8)} durationInFrames={16}>
                <Wipe s={s} />
              </Sequence>
            ) : null}
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: (portrait ? 60 : 70) * u, top: (portrait ? 276 : 62) * u, opacity: tagOpacity, fontFamily: MONO, fontWeight: 700, fontSize: 30 * u, letterSpacing: 8, color: P.ink, background: P.receipt, border: `3px solid ${P.ink}`, padding: `${6 * u}px ${18 * u}px` }}>
        {p.brand ?? "LINE ITEM"}
      </div>
      {style !== "none" ? (
        <div data-gv="captions" style={{ position: "absolute", inset: 0 }}><Captions captions={captions} style={style} accent={P.highlight} positionPct={portrait ? 60 : 91.5} fontScale={portrait ? (style === "karaoke" ? 1.05 : 0.95) : 0.72} /></div>
      ) : null}
      <LayoutGuard scenes={p.scenes} />
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={cues} roomTone />
    </AbsoluteFill>
  );
};
