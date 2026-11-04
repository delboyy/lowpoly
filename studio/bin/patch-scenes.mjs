#!/usr/bin/env node
// Re-render only some scenes of a finished render and splice them into the existing MP4 (no full re-render).
// Usage: node bin/patch-scenes.mjs --id <work-id> --video <existing.mp4> --scenes 2,49 --comp LongForm|Receipt --out <patched.mp4> [--pad 12]
// - <work-id> is the folder public/renders/<id> written by make.mjs (props.json with scene timings, voice and captions).
// - Frame range per scene = [start-pad, end+pad) so tear wipes and the next scene's lead-in are covered; ranges that overlap are merged.
// - Audio is copied untouched from the existing file; video is re-encoded once (libx264 crf 18) around the patched ranges.
// Use it after a template-only fix (layout/lint). If the SCRIPT changed (text, scene fields), run make.mjs --reuse for that story instead.
import { execFileSync, spawnSync } from "node:child_process";
import { slotted, remotionFlags } from "./lib/slot.mjs";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const opt = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const id = opt("id", ""), video = path.resolve(opt("video")), out = path.resolve(opt("out")), comp = opt("comp", "LongForm"), pad = Number(opt("pad", 12));
const idx = opt("scenes", "").split(",").filter(Boolean).map(Number);
if (!opt("video") || !opt("out") || !idx.length) throw new Error("usage: --video <mp4> [--props <file>|--id <work-id>] --scenes 2,49 --comp LongForm|Receipt --out <mp4>");
const fps = 30;
// the props must be the ones the VIDEO was rendered from: <video>.props.json (written by make.mjs) wins; --props overrides; --id is the legacy shared work dir (unsafe if anyone re-rendered that story since)
const sidecar = video.replace(/\.mp4$/, ".props.json");
const propsPath = path.resolve(opt("props", existsSync(sidecar) ? sidecar : path.join(studio, "public/renders", id, "props.json")));
if (!existsSync(propsPath)) throw new Error(`no props for this video: ${propsPath} (re-render with make.mjs to get <video>.props.json)`);
console.log(`using props ${propsPath}`);
const props = JSON.parse(readFileSync(propsPath, "utf8"));
const total = Math.round(parseFloat(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", video]).toString()));
// frame ranges
let ranges = idx.map((i) => {
  const s = props.scenes[i];
  const a = Math.round((s.startMs / 1000) * fps), b = Math.round(((s.startMs + s.durationMs) / 1000) * fps);
  return [Math.max(0, a - pad), Math.min(total - 1, b + pad - 1)];
}).sort((x, y) => x[0] - y[0]);
ranges = ranges.reduce((acc, r) => { const l = acc.at(-1); if (l && r[0] <= l[1] + 1) l[1] = Math.max(l[1], r[1]); else acc.push([...r]); return acc; }, []);
const tmp = mkdtempSync(path.join(tmpdir(), "gv-patch-"));
const parts = ranges.map(([a, b], k) => {
  const f = path.join(tmp, `p${k}.mp4`);
  console.log(`render frames ${a}-${b} (${((b - a + 1) / fps).toFixed(1)} s)`);
  const r = spawnSync(...slotted("npx", ["remotion", "render", "src/index.ts", comp, f, `--props=${propsPath}`, `--frames=${a}-${b}`, "--muted", "--log=verbose", ...remotionFlags()]), { cwd: studio, encoding: "utf8", maxBuffer: 1 << 29 });
  if (r.status !== 0) { console.error((r.stdout + r.stderr).split("\n").slice(-20).join("\n")); throw new Error("patch render failed"); }
  // LayoutGuard lint for the patched frames (it samples frames 20/50/80/100 of each scene, so only scenes whose samples fall inside the range report)
  const lint = [...new Set((r.stdout + r.stderr).split("\n").filter((l) => l.includes("GV_LINT")).map((l) => l.slice(l.indexOf("GV_LINT"))))].sort();
  console.log(lint.length ? `LAYOUT LINT (patched frames): ${lint.length} issue(s)\n${lint.join("\n")}` : "LAYOUT LINT (patched frames): clean");
  return f;
});
// concat: original frames outside the ranges + patched ranges, audio from the original
const segs = []; let cur = 0;
ranges.forEach(([a, b], k) => { if (a > cur) segs.push({ orig: [cur, a] }); segs.push({ patch: k }); cur = b + 1; });
if (cur < total) segs.push({ orig: [cur, total] });
const filters = segs.map((s, i) => (s.orig ? `[0:v]trim=start_frame=${s.orig[0]}:end_frame=${s.orig[1]},setpts=PTS-STARTPTS[v${i}]` : `[${s.patch + 1}:v]setpts=PTS-STARTPTS,fps=${fps}[v${i}]`));
const fc = `${filters.join(";")};${segs.map((_, i) => `[v${i}]`).join("")}concat=n=${segs.length}:v=1:a=0[vout]`;
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", video, ...parts.flatMap((p) => ["-i", p]), "-filter_complex", fc, "-map", "[vout]", "-map", "0:a", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", out]);
rmSync(tmp, { recursive: true, force: true });
const d1 = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString()), d2 = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString());
console.log(`patched ${idx.length} scene(s) in ${ranges.length} range(s): ${out} (duration ${d1.toFixed(2)} -> ${d2.toFixed(2)} s)`);
