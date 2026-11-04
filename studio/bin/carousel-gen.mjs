#!/usr/bin/env node
// Generate carousel background art with fal: one image per slide, one fixed prompt template per style.
// node bin/carousel-gen.mjs <story> <style>[,<style>...] [--slides 1,3] [--force] [--dry]
// Images land in public/carousel/<story>/<style>/<n>.png (skipped if present unless --force).
// Key: FAL_KEY in ../.env (never printed). Each run appends to public/carousel/<story>/fal-log.jsonl.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [storyId, stylesArg] = process.argv.slice(2);
const flag = (n) => process.argv.includes(n);
const opt = (n) => (flag(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
if (!storyId || !stylesArg) throw new Error("usage: carousel-gen.mjs <story> <style,...> [--slides 1,3] [--force] [--dry]");

const env = readFileSync(path.resolve("../.env"), "utf8");
const KEY = env.match(/^FAL_KEY=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
if (!KEY && !flag("--dry")) throw new Error("FAL_KEY missing in .env");

const { _shared, styles } = JSON.parse(readFileSync("carousel/styles.json", "utf8"));
const story = JSON.parse(readFileSync(`carousel/stories/${storyId}.json`, "utf8"));
const only = opt("--slides")?.split(",").map(Number);
// USD per image at 4:5 (gpt-image-2.5: "high" quality at 1088×1360, from fal's price table, Oct 2026).
const PRICE = { "openai/gpt-image-2.5/flare/text-to-image": 0.042, "openai/gpt-image-2.5/sunburst/text-to-image": 0.042, "fal-ai/gemini-25-flash-image": 0.0398, "fal-ai/nano-banana-pro": 0.15 };
const body = (model, prompt) =>
  model.startsWith("openai/gpt-image")
    ? { prompt, image_size: { width: 1088, height: 1360 }, quality: "high", num_images: 1, output_format: "png" }
    : { prompt, aspect_ratio: "4:5", num_images: 1, output_format: "png" };

const jobs = [];
for (const styleId of stylesArg.split(",")) {
  const st = styles[styleId];
  if (!st?.prompt) throw new Error(`no fal prompt for style ${styleId}`);
  const dir = path.resolve(`public/carousel/${storyId}/${styleId}`);
  mkdirSync(dir, { recursive: true });
  story.slides.forEach((s, i) => {
    const n = i + 1;
    const out = path.join(dir, `${n}.png`);
    if (only && !only.includes(n)) return;
    if (existsSync(out) && !flag("--force")) return;
    jobs.push({ styleId, model: st.model, n, out, prompt: `${st.prompt.replace("{scene}", s.scene)} ${_shared}` });
  });
}
const est = jobs.reduce((a, j) => a + (PRICE[j.model] ?? 0.05), 0);
console.log(`${jobs.length} images, est. $${est.toFixed(2)}`);
if (flag("--dry")) process.exit(0);

const run = async (j) => {
  const res = await fetch(`https://fal.run/${j.model}`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body(j.model, j.prompt)),
  });
  if (!res.ok) throw new Error(`${j.styleId}/${j.n}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const img = await fetch(data.images[0].url);
  writeFileSync(j.out, Buffer.from(await img.arrayBuffer()));
  appendFileSync(path.resolve(`public/carousel/${storyId}/fal-log.jsonl`), JSON.stringify({ t: new Date().toISOString(), style: j.styleId, slide: j.n, model: j.model, usd: PRICE[j.model] ?? null, prompt: j.prompt }) + "\n");
  console.log(`ok ${j.styleId}/${j.n}`);
};
// Small batches keep us polite to the API.
for (let i = 0; i < jobs.length; i += 6) {
  const r = await Promise.allSettled(jobs.slice(i, i + 6).map(run));
  r.filter((x) => x.status === "rejected").forEach((x) => console.error("FAIL", x.reason.message));
}
