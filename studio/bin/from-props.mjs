#!/usr/bin/env node
// Script Writer story file (scripts/props/*.json) -> studio script (input for bin/make.mjs).
// Usage: node bin/from-props.mjs ../scripts/props/x.json --template world|longform [--cut short|tiktok] [--out samples/v2/x.json]
// Two cuts per story: props.cuts = [{id:"short",targetSec:[38,50],lines:[...]},{id:"tiktok",targetSec:[62,75],lines:[...]}]
// (legacy `lines` with no `cuts` = the short cut). Each line: {text, scene?, take?}.
//   text  -> `vo` (may contain Fish direction tags)
//   scene -> a scene object from studio/README.md (type, fields, bg?, cut?, source?/sourceRef?)
//   take  -> consecutive lines with the same take are voiced as one continuous read and split by word timing
// `scene.sourceRef: n` builds the source chip from numbers[n]. Lines without `scene` render as plain title cards.
// `analysis.scene` (+ analysis.vo) is inserted after line analysis.afterLine (number, or {short:n,tiktok:n}); default: before the last line.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : d; };
const p = JSON.parse(readFileSync(args[0], "utf8"));
const cutId = opt("cut", "short");
// accepts cuts as an array [{id,lines,targetSec}] or an object {short:{lines}, tiktok:{lines,targetSec}}; legacy top-level `lines` = short
const cut = Array.isArray(p.cuts) ? p.cuts.find((c) => c.id === cutId) : p.cuts?.[cutId] ? { id: cutId, ...p.cuts[cutId] } : cutId === "short" ? { id: "short", lines: p.lines } : undefined;
if (!cut) throw new Error(`no cut "${cutId}" in ${args[0]} (have: ${Array.isArray(p.cuts) ? p.cuts.map((c) => c.id).join(", ") : Object.keys(p.cuts ?? {}).join(", ") || "legacy lines only"})`);
const chip = (n) => { const x = p.numbers?.[n]; return x ? `${x.source.replace(/^same /, "").replace(/ \(.*/, "")} · ${x.label}` : undefined; };
const toScene = (vo, sc, fallbackText, take) => {
  const s = sc ?? { type: "title", text: fallbackText };
  const { sourceRef, ...rest } = s;
  return { vo, ...(take ? { take } : {}), ...rest, ...(sourceRef !== undefined ? { source: chip(sourceRef) } : {}) };
};
const short = (t) => t.split(/\s+/).slice(0, 7).join(" ").replace(/[.,;:]$/, "");
const scenes = cut.lines.map((l, i) => toScene(l.text, l.scene, i === 0 && p.hook?.onScreen ? p.hook.onScreen : short(l.text), l.take ?? l.beat));
const a = p.analysis;
if (a?.scene) {
  const after = typeof a.afterLine === "object" ? a.afterLine[cutId] : a.afterLine;
  scenes.splice(after ?? scenes.length - 1, 0, toScene(a.vo ?? a.finding, a.scene));
}
const template = opt("template", "world");
// auto-tune Fish speed so the cut lands about 3 s under the top of targetSec (slower, more natural read) (Fish drama reads ~2.4 words/s at speed 1.0)
const strip = (t) => t.replace(/<\|[^|>]*\|>/g, "").replace(/\[[^\]]*\]/g, "").replace(/<\/?[a-z]+>/gi, " ");
const nWords = scenes.reduce((n, sc) => n + strip(sc.vo).split(/\s+/).filter(Boolean).length, 0);
const target = cut.targetSec ?? (cutId === "tiktok" ? [62, 75] : [38, 50]);
const speed = Math.max(0.95, Math.min(1.25, +(nWords / (2.4 * (target[1] - 3))).toFixed(2)));
// stock b-roll (assets/stock/manifest.json, Pixabay): attach clips to up to 3 plain title scenes per cut with --stock
let stockN = 0;
if (args.includes("--stock")) {
  const man = JSON.parse(readFileSync(new URL("../../assets/stock/manifest.json", import.meta.url), "utf8"));
  const words = (t) => t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !["really", "makes", "money", "that", "with", "from"].includes(w));
  const mine = new Set(words(p.slug));
  const byStory = {};
  for (const m of man) (byStory[m.story] ??= []).push(m);
  const best = Object.keys(byStory).map((k) => [k, words(k).filter((w) => mine.has(w)).length]).sort((a, b) => b[1] - a[1])[0];
  // skip clips that are mostly black (they render as a solid box); mean luma of the first 3 s, cached in assets/stock/luma.json
  const lumaFile = new URL("../../assets/stock/luma.json", import.meta.url);
  const luma = existsSync(lumaFile) ? JSON.parse(readFileSync(lumaFile, "utf8")) : {};
  const bright = (m) => {
    const id = m.file.split("/").pop().replace(/\.(mp4|jpg|jpeg|png|webp)$/i, "");
    if (luma[id] === undefined) {
      try {
        const o = execFileSync("ffmpeg", ["-v", "error", "-t", "3", "-i", new URL(`../../assets/${m.file}`, import.meta.url).pathname, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], { encoding: "utf8" });
        const v = [...o.matchAll(/YAVG=([\d.]+)/g)].map((x) => +x[1]);
        luma[id] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 128;
      } catch { luma[id] = 128; }
      writeFileSync(lumaFile, JSON.stringify(luma, null, 1));
    }
    return luma[id] >= 70;
  };
  const clips = best && best[1] > 0 ? byStory[best[0]].filter(bright).map((m) => m.file.split("/").pop().replace(/\.(mp4|jpg|jpeg|png|webp)$/i, "")) : [];
  scenes.forEach((sc, i) => { if (i > 0 && i < scenes.length - 1 && sc.type === "title" && !sc.illus && !sc.clip && stockN < Math.min(3, clips.length) && i % 2 === 1) { sc.clip = clips[stockN++]; sc.clipTreatment = luma[sc.clip] < 100 ? "thermal" : "ink"; } }); // dim clips need the thermal lift; bright ones stay greyscale ink (thermal tints skin/meat olive)
}
const out = { title: p.title, hook: p.hook, numbers: p.numbers, analysis: p.analysis ? { title: p.analysis.title, finding: p.analysis.finding } : undefined, template, id: `${p.slug}-${cutId}`, voice: "am_michael", speed: 1.05, captionStyle: template === "longform" ? "karaoke" : "hormozi", bgm: "none", cut: cutId, targetSec: target, disclaimer: p.disclaimer ?? (/cash-is-protected|borrow|ponzi/.test(p.slug) ? "Not financial advice." : undefined), fish: { model: "drama-3", speed }, scenes };
const dest = opt("out", `samples/v2/${out.id}.json`);
writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(`${nWords} words, fish speed ${speed} (${(nWords / 2.4 / speed).toFixed(0)} s est., target ${target.join("-")}), ${scenes.length} scenes -> ${dest} ${stockN ? `, ${stockN} stock clips` : ""} (${cut.lines.filter((l) => !l.scene).length} plain title cards; add "scene" objects for real visuals)`);
