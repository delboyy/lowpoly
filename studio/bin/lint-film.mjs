#!/usr/bin/env node
// Whole-film LayoutGuard pass without re-encoding a deliverable: renders every frame at a tiny scale (layout is in CSS pixels, so DOM measurements are the same),
// muted, to a throwaway file, and prints the GV_LINT lines.
// Usage: node bin/lint-film.mjs --props <video>.props.json --comp LongForm|Receipt [--scale 0.1]
import { spawnSync } from "node:child_process";
import { slotted, remotionFlags } from "./lib/slot.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const opt = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const props = path.resolve(opt("props")), comp = opt("comp", "LongForm"), scale = opt("scale", "0.1");
const tmp = mkdtempSync(path.join(tmpdir(), "gv-lint-"));
const t0 = Date.now();
const r = spawnSync(...slotted("npx", ["remotion", "render", "src/index.ts", comp, path.join(tmp, "lint.mp4"), `--props=${props}`, `--scale=${scale}`, "--muted", "--log=verbose", "--crf=40", "--concurrency=3"]), { cwd: studio, encoding: "utf8", maxBuffer: 1 << 30 });
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) { console.error((r.stdout + r.stderr).split("\n").slice(-20).join("\n")); process.exit(1); }
const lint = [...new Set((r.stdout + r.stderr).split("\n").filter((l) => l.includes("GV_LINT")).map((l) => l.slice(l.indexOf("GV_LINT"))))].sort();
console.log(lint.length ? `FILM LINT: ${lint.length} issue(s) (${((Date.now() - t0) / 1000).toFixed(0)} s)\n${lint.join("\n")}` : `FILM LINT: clean (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
