#!/usr/bin/env node
// QA contact sheet: one frame per scene (at 70% through each scene). node bin/sheet.mjs <props.json|script id> <video.mp4> <out.png> [cols]
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const [propsPath, video, out, cols = "6"] = process.argv.slice(2);
const props = JSON.parse(readFileSync(propsPath, "utf8"));
const dir = mkdtempSync(path.join(tmpdir(), "gv-sheet-"));
const files = props.scenes.map((s, i) => {
  const f = path.join(dir, `s${String(i).padStart(2, "0")}.png`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String((s.startMs + s.durationMs * 0.7) / 1000), "-i", video, "-frames:v", "1", "-vf", "scale=360:-2", f]);
  return f;
});
const rows = Math.ceil(files.length / Number(cols));
// simple tile via ffmpeg tile filter
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-pattern_type", "glob", "-i", path.join(dir, "s*.png"), "-filter_complex", `tile=${cols}x${rows}:padding=6:color=gray`, "-frames:v", "1", out]);
console.log(out);
