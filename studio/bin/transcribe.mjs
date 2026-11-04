#!/usr/bin/env node
// video/audio -> Whisper word timestamps -> Remotion Caption[] JSON.
// Usage: node bin/transcribe.mjs <media> [out.json] [--model base] [--prompt "script text to bias spelling"]
import { execFileSync } from "node:child_process";
import { slotted } from "./lib/slot.mjs";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Transcribe several files with ONE whisper model load. Returns Caption[] per file (ms relative to each file). */
export function transcribeMany(medias, { model = "base", prompt = "", language = "en" } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "gv-whisper-"));
  const wavs = medias.map((m, i) => {
    const wav = path.join(dir, `a${i}.wav`);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", m, "-vn", "-ac", "1", "-ar", "16000", wav]);
    return wav;
  });
  const args = [...wavs, "--model", model, "--language", language, "--word_timestamps", "True", "--output_format", "json", "--output_dir", dir, "--fp16", "False", "--condition_on_previous_text", "False"];
  if (prompt) args.push("--initial_prompt", prompt);
  execFileSync(...slotted("whisper", args), { stdio: ["ignore", "ignore", "inherit"] });
  return wavs.map((w) => toCaptions(JSON.parse(readFileSync(w.replace(/\.wav$/, ".json"), "utf8"))));
}

export const transcribe = (media, o) => transcribeMany([media], o)[0];

function toCaptions(j) {
  const captions = [];
  for (const seg of j.segments) for (const w of seg.words ?? []) {
    const text = w.word.trim();
    if (!text) continue;
    captions.push({ text, startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), timestampMs: Math.round(((w.start + w.end) / 2) * 1000), confidence: w.probability ?? null });
  }
  // whisper sometimes gives zero/overlapping ends; make them monotonic
  for (let i = 0; i < captions.length; i++) {
    const nxt = captions[i + 1];
    if (captions[i].endMs <= captions[i].startMs) captions[i].endMs = captions[i].startMs + 120;
    if (nxt && captions[i].endMs > nxt.startMs) captions[i].endMs = Math.max(captions[i].startMs + 60, nxt.startMs);
  }
  return captions;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [media, out = "captions.json"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const opt = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
  const caps = transcribe(media, { model: opt("model"), prompt: opt("prompt") });
  writeFileSync(out, JSON.stringify(caps, null, 1));
  console.log(`${caps.length} words -> ${out}`);
}
