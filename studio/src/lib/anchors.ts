import type { Caption } from "@remotion/captions";

// Time anchors for VO-driven UI formats (chat, call). A time is either seconds (number) or a string tied to the voice:
//   "S3"  start of scene 3 (1-based)      "E3"  end of scene 3
//   "W3:seen"  first word starting with "seen" at/after scene 3's start
//   any of these + an offset: "S3+0.4", "W3:seen-0.2"
export type When = number | string;
type Sc = { startMs: number; durationMs: number };

export const anchor = (a: When, scenes: Sc[], caps: Caption[]): number => {
  if (typeof a === "number") return a;
  const m = /^([SEW])(\d+)(?::([^+\-]+))?([+-][\d.]+)?$/.exec(a.trim());
  if (!m) throw new Error(`bad time anchor "${a}"`);
  const sc = scenes[Number(m[2]) - 1];
  if (!sc) throw new Error(`time anchor "${a}": no scene ${m[2]}`);
  const off = m[4] ? Number(m[4]) : 0;
  if (m[1] === "S") return sc.startMs / 1000 + off;
  if (m[1] === "E") return (sc.startMs + sc.durationMs) / 1000 + off;
  const re = new RegExp(`^\\W*${m[3]}`, "i");
  const w = caps.find((c) => c.startMs >= sc.startMs - 50 && re.test(c.text));
  return (w ? w.startMs : sc.startMs) / 1000 + off;
};

/** resolves every `at` / `seenAt` / `until` field and `typing` pair in a format's data block */
export const resolveTimes = <T,>(x: T, scenes: Sc[], caps: Caption[]): T => {
  const walk = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return key === "typing" ? v.map((pair) => (pair as When[]).map((p) => anchor(p, scenes, caps))) : v.map((e) => walk(e));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, e]) => [k, walk(e, k)]));
    if ((key === "at" || key === "seenAt" || key === "until") && (typeof v === "string" || typeof v === "number")) return anchor(v, scenes, caps);
    return v;
  };
  return walk(x) as T;
};
