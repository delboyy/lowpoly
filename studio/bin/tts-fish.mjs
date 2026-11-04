#!/usr/bin/env node
// Drop-in for tts.py using Fish Audio. Same request file, same outputs (out wav + out.timings.json).
// Usage: FISH_API_KEY=... node bin/tts-fish.mjs request.json
// request: { lines:[str with optional directions], out, gapMs, fish:{ voice, model, speed, temperature },
//           voices?:[reference_id|null per line], fx?:["phone"|null per line], padMs?:[extra trailing silence per line] }
// Also: node bin/tts-fish.mjs --estimate "text or @file"  -> bytes + cost at the documented rate (no API call)
// Docs: https://docs.fish.audio/features/text-to-speech/drama-3  (POST https://api.fish.audio/v1/tts, header `model: drama-3`)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import "./lib/env.mjs";
import { utf8Bytes } from "./lib/tags.mjs";

export const DEFAULT_VOICE = "55046bd7267d4a618380d1e8f93a056a"; // Nathan's chosen voice (reference_id; the model stays drama-3)
export const DEFAULT_MODEL = "drama-3";
const PRICE_PER_M_BYTES = Number(process.env.FISH_PRICE_PER_M ?? 15); // documented s2.1-pro / s2-pro rate; drama-3 rate is not in the docs

if (process.argv[2] === "--estimate") {
  const a = process.argv[3] ?? "";
  const text = a.startsWith("@") ? readFileSync(a.slice(1), "utf8") : a;
  const b = utf8Bytes(text);
  console.log(JSON.stringify({ chars: text.length, bytes: b, usdAtDocumentedRate: +((b / 1e6) * PRICE_PER_M_BYTES).toFixed(4), rate: `$${PRICE_PER_M_BYTES}/M UTF-8 bytes` }));
  process.exit(0);
}

const key = process.env.FISH_API_KEY;
if (!key) { console.error("FISH_API_KEY is not set"); process.exit(2); }
const req = JSON.parse(readFileSync(process.argv[2], "utf8"));
const fish = req.fish ?? {};
const model = fish.model ?? process.env.FISH_MODEL ?? DEFAULT_MODEL;
const voice = fish.voice ?? process.env.FISH_VOICE_ID ?? DEFAULT_VOICE; // FISH_VOICE_ID in the project .env = house voice
const dir = path.dirname(req.out);
mkdirSync(dir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function synth(text, i, ref = voice) {
  const body = { text, reference_id: ref, format: "mp3", mp3_bitrate: 192, sample_rate: 44100, normalize: true, temperature: fish.temperature ?? 0.7, prosody: { speed: fish.speed ?? Number(process.env.FISH_SPEED ?? 1.2), volume: 0, normalize_loudness: true }, latency: "normal" };
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch("https://api.fish.audio/v1/tts", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", model }, body: JSON.stringify(body) });
    if (r.ok) { const f = path.join(dir, `fish-${i}.mp3`); writeFileSync(f, Buffer.from(await r.arrayBuffer())); return f; }
    if (r.status === 429 || r.status >= 500) { await sleep(1500 * 2 ** attempt); continue; }
    throw new Error(`Fish TTS ${r.status}: ${(await r.text()).slice(0, 300)}`); // never echo the key
  }
  throw new Error("Fish TTS: retries exhausted");
}

let bytes = 0; const wavs = []; const timings = []; let t = 0;
for (let i = 0; i < req.lines.length; i++) {
  // req.keep: reuse fish-<i>.mp3 when the line, voice, model, speed and temperature are unchanged (an edit re-voices only the lines it touched)
  const v = req.voices?.[i] ?? voice; // per-line voice: two-voice roleplays
  const key1 = createHash("sha1").update(JSON.stringify([req.lines[i], v, model, fish.speed, fish.temperature ?? 0.7])).digest("hex");
  const mp3k = path.join(dir, `fish-${i}.mp3`), keyf = path.join(dir, `fish-${i}.key`);
  let mp3;
  if (req.keep && existsSync(mp3k) && existsSync(keyf) && readFileSync(keyf, "utf8") === key1) mp3 = mp3k;
  else { bytes += utf8Bytes(req.lines[i]); mp3 = await synth(req.lines[i], i, v); writeFileSync(keyf, key1); }
  const wav = path.join(dir, `fish-${i}.wav`);
  // mono 44.1k wav, trailing gap so scene boundaries are exact
  // fx "phone": band-limited like a phone line (voicemail greetings); padMs: extra silence after the line (ring beats)
  const fx = req.fx?.[i] === "phone" ? "highpass=f=320,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4," : "";
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", "44100", "-af", `${fx}silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,apad=pad_dur=${((req.gapMs ?? 180) + (req.padMs?.[i] ?? 0)) / 1000}`, wav]);
  const dur = Math.round(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString()) * 1000);
  timings.push({ startMs: t, durationMs: dur }); t += dur; wavs.push(wav);
}
const list = path.join(dir, "fish-concat.txt");
writeFileSync(list, wavs.map((w) => `file '${w.replace(/'/g, "'\\''")}'`).join("\n"));
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", req.out]);
writeFileSync(req.out + ".timings.json", JSON.stringify(timings));
const usage = { engine: "fish", model, voice, lines: req.lines.length, bytes, usdAtDocumentedRate: +((bytes / 1e6) * PRICE_PER_M_BYTES).toFixed(5), rate: `$${PRICE_PER_M_BYTES}/M bytes (s2.1-pro list price; drama-3 not published)`, audioSeconds: +(t / 1000).toFixed(1) };
writeFileSync(req.out + ".usage.json", JSON.stringify(usage, null, 1));
console.log(`tts ok (fish ${model}) ${t / 1000}s, ${bytes} bytes`);
