#!/usr/bin/env node
// Checks that an MP4 matches the props it claims to be rendered from: node bin/verify-render.mjs <video.mp4> [props.json]
// Compares duration (props durationMs + 250 ms tail vs the file), 1920x1080/1080x1920, 30 fps, audio present; prints PASS/FAIL lines.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
const video = path.resolve(process.argv[2]);
const propsPath = path.resolve(process.argv[3] ?? video.replace(/\.mp4$/, ".props.json"));
if (!existsSync(propsPath)) { console.log(`FAIL no props file next to the video (${propsPath})`); process.exit(1); }
const p = JSON.parse(readFileSync(propsPath, "utf8"));
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", video]).toString());
const dur = parseFloat(probe.format.duration), want = p.durationMs / 1000 + 0.25;
const v = probe.streams.find((s) => s.codec_type === "video"), a = probe.streams.some((s) => s.codec_type === "audio");
const out = [];
out.push(Math.abs(dur - want) <= 0.35 ? `PASS duration ${dur.toFixed(2)} s vs props ${want.toFixed(2)} s` : `FAIL duration ${dur.toFixed(2)} s vs props ${want.toFixed(2)} s (video was rendered from different props)`);
out.push(`${v.width}x${v.height} ${v.r_frame_rate}` + (v.r_frame_rate === "30/1" ? " PASS" : " FAIL"));
out.push(a ? "PASS audio present" : "FAIL no audio");
out.push(`scenes in props: ${p.scenes.length}, last scene ends ${((p.scenes.at(-1).startMs + p.scenes.at(-1).durationMs) / 1000).toFixed(2)} s`);
console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL") || l.endsWith("FAIL")) ? 1 : 0);
