import type { Caption } from "@remotion/captions";
import type { CaptionStyle } from "./captions";

export type Theme = { bg: string; bg2: string; accent: string; text: string; muted: string };
export const DEFAULT_THEME: Theme = { bg: "#0B0B12", bg2: "#1B1033", accent: "#FFE600", text: "#FFFFFF", muted: "#8A8AA3" };

/** One-shot sound effect. `src` is a path under /assets/sfx without extension, e.g. "pixabay-whoosh". */
export type SfxCue = { atMs: number; src: string; volume?: number };

/** Props shared by all three templates after `bin/make.mjs` has run TTS + whisper (the "resolved" form). */
export type BaseResolved<S> = {
  durationMs: number;
  voSrc: string; // path relative to /public, e.g. "renders/mcd-kinetic/vo.wav"
  captions: Caption[]; // global ms timeline
  captionStyle: CaptionStyle | "none";
  bgm?: string | null; // e.g. "bgm-tension-92bpm"
  bgmVolume?: number; // default 0.10
  theme?: Partial<Theme>;
  scenes: S[]; // each has startMs + durationMs
  sfx?: SfxCue[]; // extra cues on top of the automatic per-scene ones
  watermark?: string;
};

export type Timed = { startMs: number; durationMs: number };

// ---- kinetic-type explainer ----
export type KineticScene = Timed & {
  text: string; // on-screen phrase (short, punchy)
  emphasis?: string[]; // words rendered big + accent colour
  sfx?: string | null;
};
export type KineticProps = BaseResolved<KineticScene>;

// ---- stat / data reveal ----
export type StatScene = Timed &
  (
    | { type: "number"; value: number; prefix?: string; suffix?: string; decimals?: number; group?: boolean; label: string; sub?: string; sfx?: string | null }
    | { type: "bars"; items: { label: string; value: number }[]; unit?: string; title?: string; highlight?: number; sfx?: string | null }
    | { type: "line"; points: number[]; xLabels?: [string, string]; title?: string; endLabel?: string; sfx?: string | null }
    | { type: "text"; text: string; emphasis?: string[]; sfx?: string | null }
  );
export type StatProps = BaseResolved<StatScene>;

// ---- fast-cut montage ----
export type MontageShot = {
  media?: string; // image/video path under /public ("assets/..." or "renders/..."), optional
  emoji?: string; // fallback visual when no media
  text?: string; // top caption bar (setup / punchline)
  sfx?: string | null; // override; default rotates pop/impact stings
};
export type MontageScene = Timed & { shots: MontageShot[] };
export type MontageProps = BaseResolved<MontageScene>;

// ================= receipt world ("Line Item") — used by Receipt (9:16) and LongForm (16:9) =================
import type { ReceiptLine } from "../kit/devices";
import type { BarItem, Series, WaterfallStep } from "../kit/charts";
import type { MapDot } from "../kit/maps";
import type { IllusName } from "../kit/illustrations";
import type { IconName } from "../kit/icons";

export type LibObject = "hotdogcombo" | "membership" | "vault" | "van" | "soda" | "pumplive" | "phonelive";
export type SceneBg = "ledger" | "roll" | "warehouse" | "coins" | "none";
export type CutIn = "tear" | "redact" | "stamp";
type WBase = Timed & { sourced?: boolean; source?: string; sfx?: string | null; dark?: boolean; vo?: string; captions?: boolean; bg?: SceneBg; cut?: CutIn; cutText?: string; stock?: { id: string; frame?: "polaroid" | "receipt" | "torn" | "full"; treatment?: "ink" | "red" | "halftone" | "thermal" } };
export type WorldScene = WBase &
  (
    | { type: "title"; text: string; emphasis?: string[]; kicker?: string; illus?: IllusName; clip?: string; clipTreatment?: "ink" | "thermal" }
    | { type: "clip"; clip: string; text?: string; emphasis?: string[] }
    | { type: "act"; kicker: string; text: string }
    | { type: "receipt"; title?: string; subtitle?: string; prior?: ReceiptLine[]; lines: ReceiptLine[]; total?: { label: string; value?: string }; illus?: IllusName; stamp?: string }
    | { type: "redact"; label: string; value: string; sub?: string; illus?: IllusName }
    | { type: "stat"; tone?: "loss" | "neutral"; value: number; prefix?: string; suffix?: string; decimals?: number; group?: boolean; label: string; sub?: string }
    | { type: "bars"; title?: string; items: (BarItem & { neg?: boolean })[]; unit?: string; prefix?: string; decimals?: number }
    | { type: "dots"; share: number; cols?: number; rows?: number; label: string; fillLabel?: string; restLabel?: string }
    | { type: "map"; region: "us" | "world" | "ireland"; mode?: "region" | "zoom"; title?: string; dots?: MapDot[]; highlight?: string[]; scatter?: { count: number; seed?: number }; caption?: string }
    | { type: "chart"; kind: "line"; projectedFrom?: number; band?: [number, number]; title?: string; points: number[]; xLabels?: [string, string]; yPrefix?: string; ySuffix?: string; endLabel?: string }
    | { type: "chart"; kind: "waterfall"; title?: string; steps: WaterfallStep[]; prefix?: string; suffix?: string }
    | { type: "sensitivity"; sourced?: boolean; title: string; series: Series[]; xLabels?: string[]; yFloor?: number; takeaway: string }
    | { type: "object"; illus: IllusName; size?: number; text?: string; emphasis?: string[]; tag?: { from: string; to: string; label?: string }; color?: string }
    | { type: "montage"; cuts: { illus?: IllusName; icon?: IconName; glyph?: string; text: string }[] }
    | { type: "stamp"; text: string; tone?: "loss" | "gain"; sub?: string }
    | { type: "doc"; title: string; lines: string[]; highlight: number; footer?: string }
    | { type: "bignum"; tone?: "loss" | "neutral"; value: number; sub: string; prefix?: string; suffix?: string; decimals?: number; group?: boolean; kicker?: string }
    | { type: "ring"; share: number; sub: string; tone?: "ink" | "loss" | "gain"; title?: string }
    | { type: "split"; title?: string; parts: { label: string; cents: number; tone?: "ink" | "loss" | "gain" | "muted" }[]; hl?: number }
    | { type: "rank"; title?: string; items: { label: string; value: number; sub?: string }[]; best?: number; unit?: string; prefix?: string; decimals?: number }
    | { type: "route"; title?: string; stops: { lon: number; lat: number; label?: string; tone?: "loss" | "ink" | "gain" }[] }
    | { type: "flow"; label: string; back?: string; title?: string }
    | { type: "lib"; object: LibObject; text?: string; emphasis?: string[]; props?: Record<string, unknown> }
  );

export type WorldProps = {
  durationMs: number;
  voSrc: string;
  captions: Caption[];
  captionStyle: CaptionStyle | "none";
  bgm?: string | null;
  bgmVolume?: number;
  brand?: string; // small mark, default "LINE ITEM"
  /** off by default: the bottom "running tab" receipt and on-video source chips were removed (sources go in sources.txt) */
  runningTab?: boolean;
  showSources?: boolean;
  scenes: WorldScene[];
  sfx?: SfxCue[];
  /** scene-relative punch frames are derived from caption words in the template; no script input needed */
};
