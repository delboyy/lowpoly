import type { Caption } from "@remotion/captions";

export type CaptionStyle = "hormozi" | "karaoke";
export type CaptionPage = { startMs: number; endMs: number; words: Caption[] };

const SENTENCE_END = /[.!?…]["')\]]?$/;
const CLAUSE_END = /[,;:—–-]["')\]]?$/;

/**
 * Group word captions into pages.
 * hormozi: 1-3 words per page (breaks on sentence end, long pause, or > maxChars)
 * karaoke: a full line, up to ~32 characters (breaks on sentence end / pause)
 */
export const createPages = (captions: Caption[], style: CaptionStyle): CaptionPage[] => {
  const maxWords = style === "hormozi" ? 3 : 8;
  const maxChars = style === "hormozi" ? 20 : 32;
  const pages: CaptionPage[] = [];
  let cur: Caption[] = [];
  const flush = () => {
    if (cur.length) {
      pages.push({ startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, words: cur });
      cur = [];
    }
  };
  captions.forEach((w, i) => {
    const text = w.text.trim();
    const chars = cur.reduce((n, c) => n + c.text.trim().length + 1, 0) + text.length;
    if (cur.length && (cur.length >= maxWords || chars > maxChars)) flush();
    cur.push({ ...w, text });
    const next = captions[i + 1];
    const gap = next ? next.startMs - w.endMs : Infinity;
    if (SENTENCE_END.test(text) || gap > 450 || (style === "karaoke" && CLAUSE_END.test(text) && chars > 18)) flush();
  });
  flush();
  return pages;
};

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
