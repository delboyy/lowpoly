#!/usr/bin/env node
// Render a carousel story in one or more art styles.
// node bin/carousel-render.mjs <story> <style>[,<style>...] [--reel] [--sheet] [--out ../qa/inbox/carousel-tests]
//   slides → <out>/<style>/<story>-NN.png (1080×1350)
//   --reel  → <out>/<style>/<story>-reel.mp4 (1080×1920, slide timings + VO from the story's video props, plus a CTA tail)
//   --sheet → <out>/<story>-styles-sheet.png (one row per style)
//   --handoff <slug> → ../qa/inbox/carousels/<slug>/ with 01..NN.png of the FIRST style + caption.txt + sources.txt
//     + variant.txt (default <style>/<N>slide, or --variant <tag>); agents/PIPELINE.md format, only after Nathan approves
// Art comes from public/carousel/<story>/<style>/<n>.png (bin/carousel-gen.mjs), or for styles with
// "source": "render" it is rendered from the story's low-poly composition and cropped to 4:5.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [storyId, stylesArg] = process.argv.slice(2);
const flag = (n) => process.argv.includes(n);
const OUT = path.resolve(flag("--out") ? process.argv[process.argv.indexOf("--out") + 1] : "../qa/inbox/carousel-tests");
const CTA_MS = 3000;
const { styles } = JSON.parse(readFileSync("carousel/styles.json", "utf8"));
const story = JSON.parse(readFileSync(`carousel/stories/${storyId}.json`, "utf8"));
const styleIds = stylesArg.split(",");
const chromiumOptions = { gl: "angle" };

mkdirSync("public/carousel/brand", { recursive: true });
if (!existsSync("public/carousel/brand/avatar.png")) copyFileSync("../brand/avatar-final-1080.png", "public/carousel/brand/avatar.png");

// Low-poly art: render stills from the existing 3D world (same bundle as the videos) and crop to 4:5.
for (const id of styleIds.filter((s) => styles[s]?.source === "render")) {
  const dir = `public/carousel/${storyId}/${id}`;
  const todo = story.slides.map((s, i) => [s, i + 1]).filter(([, n]) => !existsSync(`${dir}/${n}.png`));
  if (!todo.length) continue;
  mkdirSync(dir, { recursive: true });
  const lp = story.lowpoly;
  const inputProps = JSON.parse(readFileSync(lp.props, "utf8"));
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const composition = await selectComposition({ serveUrl, id: lp.comp, inputProps, chromiumOptions });
  for (const [s, n] of todo) {
    const raw = `${dir}/raw-${n}.png`;
    await renderStill({ serveUrl, composition, inputProps, frame: s.lowpolyFrame, output: path.resolve(raw), chromiumOptions });
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-vf", `crop=1080:1350:0:${lp.cropY}`, `${dir}/${n}.png`]);
    console.log(`lowpoly art ${n}`);
  }
}

const serveUrl = await bundle({ entryPoint: path.resolve("src/carousel/index.ts") });
const total = story.slides.length;
const art = (style, n) => {
  const rel = `carousel/${storyId}/${style}/${n}.png`;
  return existsSync(`public/${rel}`) ? rel : undefined;
};

for (const style of styleIds) {
  const dir = path.join(OUT, style);
  mkdirSync(dir, { recursive: true });
  for (const [i, slide] of story.slides.entries()) {
    const inputProps = { slide, index: i + 1, total, image: art(style, i + 1) };
    const composition = await selectComposition({ serveUrl, id: "CarouselSlide", inputProps });
    const output = path.join(dir, `${storyId}-${String(i + 1).padStart(2, "0")}.png`);
    await renderStill({ serveUrl, composition, inputProps, output });
  }
  console.log(`slides ${style} → ${dir}`);

  if (flag("--reel") && story.videoProps) {
    const vp = JSON.parse(readFileSync(story.videoProps, "utf8"));
    const timings = vp.scenes.map((s) => ({ startMs: s.startMs, durationMs: s.durationMs }));
    const end = timings.at(-1).startMs + timings.at(-1).durationMs;
    timings.push({ startMs: end, durationMs: CTA_MS });
    if (timings.length !== total) throw new Error(`story has ${total} slides but video has ${timings.length - 1} scenes + CTA`);
    const inputProps = { slides: story.slides, images: story.slides.map((_, i) => art(style, i + 1)), timings, voSrc: existsSync(`public/${vp.voSrc}`) ? vp.voSrc : undefined };
    const composition = await selectComposition({ serveUrl, id: "CarouselReel", inputProps });
    const outputLocation = path.join(dir, `${storyId}-reel.mp4`);
    await renderMedia({ serveUrl, composition, inputProps, codec: "h264", outputLocation, crf: 18 });
    console.log(`reel ${style} → ${outputLocation}`);
  }
}

if (flag("--sheet")) {
  const inputProps = {
    title: `Business Leaks carousel test: ${storyId}. Pick a row (A–${String.fromCharCode(64 + styleIds.length)})`,
    slides: story.slides,
    rows: styleIds.map((s) => ({ label: styles[s]?.label ?? s, images: story.slides.map((_, i) => art(s, i + 1)) })),
  };
  const composition = await selectComposition({ serveUrl, id: "CarouselSheet", inputProps });
  const output = path.join(OUT, `${storyId}-styles-sheet.png`);
  await renderStill({ serveUrl, composition, inputProps, output });
  console.log(`sheet → ${output}`);
}

if (flag("--handoff")) {
  const slug = process.argv[process.argv.indexOf("--handoff") + 1];
  const dir = path.resolve("../qa/inbox/carousels", slug);
  mkdirSync(dir, { recursive: true });
  story.slides.forEach((_, i) => {
    const nn = String(i + 1).padStart(2, "0");
    copyFileSync(path.join(OUT, styleIds[0], `${storyId}-${nn}.png`), path.join(dir, `${nn}.png`));
  });
  // An approved script (plan/scripts/<slug>.approved.md) carries the final caption/sources under "## caption.txt" / "## sources.txt"; copy them verbatim.
  const section = (name) => {
    const md = readFileSync(story.approved, "utf8");
    const m = md.match(new RegExp(`^## ${name.replace(".", "\\.")}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
    if (!m) throw new Error(`no "## ${name}" in ${story.approved}`);
    return m[1].trim();
  };
  writeFileSync(path.join(dir, "caption.txt"), (story.approved ? section("caption.txt") : story.caption) + "\n");
  writeFileSync(path.join(dir, "sources.txt"), (story.approved ? section("sources.txt") : story.sources) + "\n");
  // Experiment tag read by the lead (plan/TESTS.md): <style>/<N>slide unless --variant overrides.
  const variant = flag("--variant") ? process.argv[process.argv.indexOf("--variant") + 1] : `${styleIds[0]}/${story.slides.length}slide`;
  writeFileSync(path.join(dir, "variant.txt"), variant + "\n");
  console.log(`handoff → ${dir}`);
}
