#!/usr/bin/env node
// script.json -> TTS (Kokoro) -> whisper word timestamps -> props -> Remotion render -> MP4
// Usage: node bin/make.mjs <script.json> [--out ../clips/samples/name.mp4] [--voice am_michael] [--speed 1.05] [--vo existing.wav]
// Prints a timing summary (tts / whisper / render seconds).
import { execFileSync, spawnSync } from "node:child_process";
import { slotted, remotionFlags } from "./lib/slot.mjs";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transcribeMany } from "./transcribe.mjs";
import "./lib/env.mjs";
import { stripTags } from "./lib/tags.mjs";

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const opt = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const scriptPath = path.resolve(process.argv[2]);
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const COMP = { kinetic: "Kinetic", stat: "Stat", montage: "Montage", footage: "Footage", morph: "Morph", delta3d: "Delta3D", hybrid: "Hybrid", map3d: "MapCompare3D", penny3d: "Penny3D", coke3d: "Coke3D", pizza3d: "Pizza3D", carts3d: "Carts3D", reply3d: "Reply3D", inquiry3d: "Inquiry3D", noshows3d: "NoShows3D", pagespeed3d: "PageSpeed3D", trades3d: "Trades3D", agentreply3d: "AgentReply3D", chatmock: "ChatMock", missedcall: "MissedCall", pov3d: "Pov3D", world: "Receipt", longform: "LongForm" }[script.template];
if (!COMP) throw new Error(`template must be kinetic|stat|montage|world|longform, got ${script.template}`);
const id = opt("id", script.id ?? path.basename(scriptPath, ".json"));
const reuse = process.argv.includes("--reuse"); // keep existing vo.wav + captions (no TTS credit, no whisper); re-merge scene fields
const out = path.resolve(opt("out", path.join(studio, `../clips/${id}.mp4`)));
// unique work dir per output file: other sessions render the same story ids for tests and used to overwrite this folder (props/voice) under finished renders
const work = path.join(studio, "public/renders", opt("work", `${id}--${path.basename(out).replace(/\.mp4$/, "")}`));
const workId = path.basename(work);
mkdirSync(work, { recursive: true });
mkdirSync(path.dirname(out), { recursive: true });
const T = {}; let t = Date.now(); const lap = (k) => { T[k] = (Date.now() - t) / 1000; t = Date.now(); };

// units: consecutive scenes with the same `take` are voiced as ONE continuous read (natural prosody) and split by word timing
const units = [];
script.scenes.forEach((sc, i) => {
  const last = units.at(-1);
  if (sc.take && last && script.scenes[last.idx.at(-1)].take === sc.take) { last.idx.push(i); last.vo += " " + sc.vo; }
  else units.push({ idx: [i], vo: sc.vo });
});
const tok = (t) => t.split(/\s+/).filter(Boolean);

// 1. TTS: one wav per script, one line per unit
const vo = path.join(work, "vo.wav");
let timings; // per unit
if (reuse) {
  timings = JSON.parse(readFileSync(vo + ".timings.json", "utf8"));
} else if (opt("vo")) {
  throw new Error("--vo (pre-recorded VO) is not implemented");
} else {
  const req = path.join(work, "tts.json");
  const spoken = units.map((u) => stripTags(u.vo)); // what Kokoro / captions see
  const engine = opt("tts", script.ttsEngine ?? (process.env.FISH_API_KEY ? "fish" : "kokoro"));
  const base = { out: vo, gapMs: script.gapMs ?? 180 };
  const py = process.env.GV_PYTHON ?? path.join(studio, ".venv-tts/bin/python");
  const runKokoro = () => {
    writeFileSync(req, JSON.stringify({ ...base, voice: opt("voice", script.voice ?? "am_michael"), speed: Number(opt("speed", script.speed ?? 1.05)), lines: spoken }));
    execFileSync(py, [path.join(studio, "bin/tts.py"), req], { stdio: "inherit" });
  };
  if (engine === "fish") {
    try {
      const fishOpts = { ...(script.fish ?? {}), ...(opt("fish-voice") ? { voice: opt("fish-voice") } : {}) };
      const lo = script.targetSec?.[0], hi = script.targetSec?.[1];
      let speed = fishOpts.speed ?? Number(process.env.FISH_SPEED ?? 1.2);
      for (let attempt = 0; attempt < 3; attempt++) {
        // per-scene voice (a key of script.voices, or a raw reference_id), phone fx and trailing pad come from each unit's first scene
        const first = (u) => script.scenes[u.idx[0]];
        const perLine = { voices: units.map((u) => (first(u).voice ? script.voices?.[first(u).voice] ?? first(u).voice : null)), fx: units.map((u) => first(u).fx ?? null), padMs: units.map((u) => script.scenes[u.idx.at(-1)].padMs ?? 0) };
        writeFileSync(req, JSON.stringify({ ...base, lines: units.map((u) => u.vo), keep: process.argv.includes("--keep-voice"), fish: { ...fishOpts, speed }, ...perLine })); // tags kept for Fish
        execFileSync("node", [path.join(studio, "bin/tts-fish.mjs"), req], { stdio: "inherit", env: process.env });
        // measured-duration tuning: drama-3 reads 10-20% slower than the word-count estimate, so re-speed to land inside targetSec (max 2 retries, ~$0.01 each)
        if (!hi) break;
        const tl = JSON.parse(readFileSync(vo + ".timings.json", "utf8"));
        const sec = (tl.at(-1).startMs + tl.at(-1).durationMs) / 1000;
        const aim = (lo + hi) / 2 + 1.5;
        // the file adds ~0.6 s (last gap + 250 ms tail) to the voice length
        if (sec <= hi - 0.9 && sec >= lo + 1) { console.log(`voice length ${sec.toFixed(1)} s at speed ${speed.toFixed(2)} (target ${lo}-${hi})`); break; }
        const next = Math.max(0.9, Math.min(1.3, +(speed * sec / aim).toFixed(2)));
        if (next === speed || attempt === 2) { console.warn(`voice length ${sec.toFixed(1)} s outside ${lo}-${hi} at speed ${speed} (limit reached)`); break; }
        console.log(`voice length ${sec.toFixed(1)} s outside ${lo}-${hi}: re-speeding ${speed} -> ${next}`);
        speed = next;
      }
      try { console.log("fish usage:", readFileSync(vo + ".usage.json", "utf8").replace(/\s+/g, " ")); } catch {}
    } catch (e) {
      if (opt("tts") === "fish") throw e;
      console.warn("Fish TTS failed, falling back to Kokoro (pass --tts fish to make this an error)");
      runKokoro();
    }
  } else runKokoro();
  timings = JSON.parse(readFileSync(vo + ".timings.json", "utf8"));
}
lap("tts");

// 2. whisper per unit (no prompt: prompting made it loop). Timing from whisper, spelling from the script.
let captions = [];
const sceneT = new Array(script.scenes.length); // {startMs,durationMs}
const sceneTimingsFile = path.join(work, "scene-timings.json");
if (reuse) {
  captions = JSON.parse(readFileSync(path.join(work, "props.json"), "utf8")).captions;
  const saved = JSON.parse(readFileSync(sceneTimingsFile, "utf8"));
  saved.forEach((t, i) => (sceneT[i] = t));
} else {
  const unitWavs = timings.map((tm, i) => {
    const f = path.join(work, `unit${i}.wav`);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(tm.startMs / 1000), "-t", String(tm.durationMs / 1000), "-i", vo, f]);
    return f;
  });
  const perUnit = transcribeMany(unitWavs, { model: opt("model", "base") });
  units.forEach((u, ui) => {
    const { startMs, durationMs } = timings[ui];
    const words = tok(stripTags(u.vo));
    let w = perUnit[ui];
    if (w.length === words.length) w = w.map((c, k) => ({ ...c, text: words[k] }));
    else {
      console.warn(`unit ${ui}: whisper heard ${w.length} words vs ${words.length} in script -> proportional timing`);
      const t0 = w.length ? w[0].startMs : 0, speech = (w.length ? w.at(-1).endMs : durationMs - 200) - t0;
      const total = words.reduce((n, x) => n + x.length + 1, 0);
      let acc = 0;
      w = words.map((x) => { const st = t0 + (acc / total) * speech; acc += x.length + 1; return { text: x, startMs: st, endMs: t0 + (acc / total) * speech, timestampMs: null, confidence: null }; });
    }
    w.forEach((c) => captions.push({ ...c, startMs: c.startMs + startMs, endMs: c.endMs + startMs, timestampMs: c.timestampMs == null ? null : c.timestampMs + startMs }));
    // scene boundaries inside the unit: first word of each fragment (a scene starts 40 ms before its first word)
    let wi = 0;
    u.idx.forEach((si, j) => {
      const n = tok(stripTags(script.scenes[si].vo)).length;
      const st = j === 0 ? startMs : startMs + Math.max(0, (w[wi]?.startMs ?? 0) - 40);
      sceneT[si] = { startMs: st };
      wi += n;
    });
    u.idx.forEach((si, j) => {
      const end = j === u.idx.length - 1 ? startMs + durationMs : sceneT[u.idx[j + 1]].startMs;
      sceneT[si].durationMs = end - sceneT[si].startMs;
    });
  });
  writeFileSync(sceneTimingsFile, JSON.stringify(sceneT));
}
lap("whisper");

// 3. props
const scenes = script.scenes.map(({ vo, take, ...rest }, i) => ({ ...rest, vo: stripTags(vo), startMs: sceneT[i].startMs, durationMs: sceneT[i].durationMs }));
if (script.template === "montage" || script.template === "footage") scenes.forEach((s, i) => { const per = s.durationMs / s.shots.length; if (per < 450 || per > 1700) console.warn(`scene ${i}: ${(per / 1000).toFixed(2)}s per shot (aim 0.6-1.2s)`); });
// preprocessing: continuous receipts across scenes (same title+subtitle) keep earlier lines printed; losses with a "-" note draw below the axis
scenes.forEach((sc, i) => {
  if (sc.type === "receipt" && i > 0 && scenes[i - 1].type === "receipt" && scenes[i - 1].title === sc.title && scenes[i - 1].subtitle === sc.subtitle) sc.prior = [...(scenes[i - 1].prior ?? []), ...scenes[i - 1].lines];
  if (sc.type === "bars") sc.items.forEach((it) => { if (it.kind === "loss" && /^[-−–]/.test(it.note ?? "")) it.neg = true; });
});
const durationMs = sceneT.at(-1).startMs + sceneT.at(-1).durationMs;
const props = {
  durationMs, voSrc: `renders/${workId}/vo.wav`, captions,
  captionStyle: script.captionStyle ?? "hormozi", bgm: (() => { const b = script.bgm ?? process.env.BGM_TRACK ?? "none"; if (!b || b === "none") return null; if (!existsSync(path.join(studio, "../assets/bgm", `${b}.mp3`))) { console.warn(`bgm "${b}" not found in assets/bgm: rendering SFX-only`); return null; } return b; })(), bgmVolume: script.bgmVolume, theme: script.theme, brand: script.brand, runningTab: script.runningTab ?? false, showSources: script.showSources ?? false, topHook: script.topHook, stops: script.stops, unitNote: script.unitNote, hookVs: script.hookVs, sfx: script.sfx, label: script.label, x: script.x, scenes, // x: a UI format's own data block (chat threads, call beats), times as voice anchors
};
const propsPath = path.join(work, "props.json");
writeFileSync(propsPath, JSON.stringify(props, null, 1));

// render-time guards on scene text: internal notes must never reach the screen, and every figure scene needs a source
{
  const strings = (o) => Object.values(o).flatMap((v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap((x) => (typeof x === "string" ? [x] : typeof x === "object" && x ? strings(x) : [])) : v && typeof v === "object" ? strings(v) : []));
  const bad = [];
  script.scenes.forEach((sc, i) => { const { source, ...rest } = sc; for (const t of strings(rest)) if (/\b(confirm|todo|tbd|fixme|dossier|flag:|not verified)\b/i.test(t)) bad.push(`scene ${i + 1}: "${t.slice(0, 70)}"`); });
  if (bad.length && !process.argv.includes("--allow-notes")) { console.error(`INTERNAL NOTE ON SCREEN (confirm/TODO/dossier/flag in scene text):\n${bad.join("\n")}\n(fix the script, or pass --allow-notes)`); process.exit(3); }
  const FIG = new Set(["stat", "bignum", "bars", "ring", "split", "rank", "redact", "chart", "sensitivity", "dots"]);
  const unsourced = script.scenes.map((sc, i) => (FIG.has(sc.type) && !sc.source ? i + 1 : 0)).filter(Boolean);
  if (unsourced.length) console.warn(`WARNING: figure scenes without a source: ${unsourced.join(", ")} (every on-screen figure needs a source line in the sources file)`);
}

// sources for the post (never drawn on the video): <out>.sources.txt
{
  const chips = [...new Set(script.scenes.map((sc) => sc.source).filter(Boolean))];
  const lines = [`SOURCES: ${script.title ?? id}`, "", "Paste into the post caption / YouTube description / pinned comment:", ""];
  let prevSrc = "";
  const dropped = (script.numbers ?? []).filter((n) => /\bFLAG\b|not verified/i.test(String(n.status ?? "")));
  if (dropped.length) console.warn(`sources: dropped ${dropped.length} unverified number(s): ${dropped.map((n) => n.label).join("; ")}`);
  for (const n of (script.numbers ?? []).filter((n) => !dropped.includes(n))) lines.push(`- ${n.label}: ${n.value}. ${/^same /i.test(String(n.source)) ? prevSrc : (prevSrc = String(n.source))}${n.url ? ` ${n.url}` : ""}${n.date ? ` (${n.date})` : ""}${n.status ? ` [${String(n.status).split(/[.(]/)[0].trim()}]` : ""}${n.formula ? ` Formula: ${n.formula}` : ""}`);
  if (!(script.numbers ?? []).length) for (const c of chips) lines.push(`- ${c}`);
  else {
    // every on-screen figure needs a source line: add the scene sources that numbers[] does not already cover
    const covered = (script.numbers ?? []).map((n) => `${n.source} ${n.label}`.toLowerCase()).join(" | ");
    const extra = chips.filter((c) => !covered.includes(c.toLowerCase().replace(/ · .*$/, "").slice(0, 18)));
    if (extra.length) { lines.push("", "Other on-screen figures (source per scene):"); for (const c of extra) lines.push(`- ${c}`); }
  }
  let prev2 = "";
  const names = (script.numbers ?? []).map((n) => { let t = String(n.source); if (/^same /i.test(t)) t = prev2; else t = t.split(/[:(]/)[0].trim(); prev2 = t || prev2; return prev2; });
  // figures the video computes itself (never in the filing): list them with their method
  const comp = script.scenes.filter((sc) => /computed|estimate|our /i.test(sc.source ?? ""));
  if (comp.length) { lines.push("", "Computed on screen (method):"); for (const sc of comp) lines.push(`- [computed] ${sc.title ?? sc.label ?? sc.takeaway ?? sc.text ?? sc.vo.replace(/\[[^\]]*\]/g, "").slice(0, 60)}: ${sc.source}`); }
  if (script.analysis?.finding) lines.push("", `Method (original calculation${script.analysis.title ? `: ${script.analysis.title}` : ""}): ${script.analysis.finding}`);
  lines.push("", `Short form: Sources: ${[...new Set(names)].join("; ") || chips.join("; ")}.`);
  if (script.disclaimer) lines.push(script.disclaimer);
  writeFileSync(out.replace(/\.mp4$/, ".sources.txt"), lines.join("\n") + "\n");
}

// post caption draft (Posting Ops reads <id>.mp4, <id>.sources.txt, <id>.caption.txt)
{
  const short = readFileSync(out.replace(/\.mp4$/, ".sources.txt"), "utf8").split("\n").find((l) => l.startsWith("Short form:")) ?? "";
  const hook = script.hook?.a ?? script.hook?.onScreen ?? script.title ?? id;
  writeFileSync(out.replace(/\.mp4$/, ".caption.txt"), [hook, "", short.replace("Short form: ", ""), script.disclaimer ?? ""].filter((x, i) => x !== "" || i === 1).join("\n") + "\n");
}

// hand-written publishable files win over generated ones: <script dir>/publish/sources.txt and description.txt
{
  const pub = path.join(path.dirname(scriptPath), "publish");
  for (const [src, dst] of [["sources.txt", ".sources.txt"], ["description.txt", ".caption.txt"]]) if (existsSync(path.join(pub, src))) copyFileSync(path.join(pub, src), out.replace(/\.mp4$/, dst));
}
if (process.argv.includes("--sources-only")) process.exit(0);

// 4. render
const raw = out.replace(/\.mp4$/, ".raw.mp4");
{
  // capture render output so the in-render layout lint (GV_LINT lines from LayoutGuard) can be reported
  const r = spawnSync(...slotted("npx", ["remotion", "render", "src/index.ts", COMP, raw, `--props=${propsPath}`, "--log=verbose", ...remotionFlags(), ...(["map3d", "delta3d", "hybrid", "penny3d", "coke3d", "pizza3d", "carts3d", "reply3d", "inquiry3d", "noshows3d", "pagespeed3d", "trades3d", "agentreply3d", "missedcall", "pov3d"].includes(script.template) ? ["--gl=angle"] : [])]), { cwd: studio, encoding: "utf8", maxBuffer: 1 << 29 });
  if (r.status !== 0) { console.error((r.stdout + r.stderr).split("\n").slice(-30).join("\n")); throw new Error("remotion render failed"); }
  const lint = [...new Set((r.stdout + r.stderr).split("\n").filter((l) => l.includes("GV_LINT")).map((l) => l.slice(l.indexOf("GV_LINT"))))].sort();
  writeFileSync(path.join(work, "lint.txt"), lint.join("\n"));
  console.log(lint.length ? `LAYOUT LINT: ${lint.length} issue(s)\n${lint.join("\n")}` : "LAYOUT LINT: clean");
}
// master loudness: two-pass loudnorm to -14 LUFS, true peak <= -1.5 dBTP, video stream copied
{
  const m = spawnSync("ffmpeg", ["-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-2:LRA=9:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  const af = `loudnorm=I=-14:TP=-2:LRA=9:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-c:v", "copy", "-af", `${af},alimiter=limit=0.72:level=disabled`, "-c:a", "aac", "-b:a", "192k", out]); // limiter keeps true peak <= -1.5 dBFS (0.72: aac encode overshot 0.78 by ~1 dB on Starbucks) on long mixes
}
execFileSync("rm", ["-f", raw]);
copyFileSync(propsPath, out.replace(/\.mp4$/, ".props.json")); // the props THIS video was rendered from (bin/patch-scenes.mjs reads it)
lap("render");
const total = Object.values(T).reduce((a, b) => a + b, 0);
console.log(`\nDONE ${out}\nvideo ${(durationMs / 1000 + 0.6).toFixed(1)}s | tts ${T.tts.toFixed(1)}s | whisper ${T.whisper.toFixed(1)}s | render ${T.render.toFixed(1)}s | total ${total.toFixed(1)}s`);
