#!/usr/bin/env node
// video.mp4 -> whisper -> captions JSON -> 1080x1920 render with captions.
// Usage: node bin/caption-video.mjs <video> [--style hormozi|karaoke] [--out file.mp4] [--captions existing.json] [--fit cover|contain] [--model base]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, linkSync, copyFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transcribe } from "./transcribe.mjs";

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const opt = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const video = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("--")) ?? (() => { throw new Error("video path required"); })());
const style = opt("style", "hormozi");
const out = path.resolve(opt("out", video.replace(/\.[^.]+$/, `.captioned.mp4`)));
const name = path.basename(video).replace(/[^a-zA-Z0-9._-]/g, "_");

const t0 = Date.now();
const durationMs = Math.round(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString()) * 1000);
const capFile = opt("captions");
const captions = capFile ? JSON.parse(readFileSync(capFile, "utf8")) : transcribe(video, { model: opt("model", "base") });
if (!capFile) writeFileSync(out.replace(/\.mp4$/, ".captions.json"), JSON.stringify(captions, null, 1));
const t1 = Date.now();

mkdirSync(path.join(studio, "public/inputs"), { recursive: true });
const link = path.join(studio, "public/inputs", name);
if (existsSync(link)) unlinkSync(link);
try { linkSync(video, link); } catch { copyFileSync(video, link); } // real file (symlinks are not served by the bundler)
const props = path.join(studio, `public/inputs/${name}.props.json`);
writeFileSync(props, JSON.stringify({ videoSrc: `inputs/${name}`, captions, style, durationMs, fit: opt("fit", "cover") }));
execFileSync("npx", ["remotion", "render", "src/index.ts", "CaptionedVideo", out, `--props=${props}`], { cwd: studio, stdio: "inherit" });
console.log(`transcribe ${((t1 - t0) / 1000).toFixed(1)}s, render ${((Date.now() - t1) / 1000).toFixed(1)}s -> ${out}`);
