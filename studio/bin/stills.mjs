#!/usr/bin/env node
// Framing check before a full render: bundle once, render several stills.
// node bin/stills.mjs <Comp> <props.json> <outDir> <frame,frame,...> [--scale 0.5]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
const [comp, propsPath, outDir, framesArg] = process.argv.slice(2);
const scale = Number(process.argv.includes("--scale") ? process.argv[process.argv.indexOf("--scale") + 1] : 0.5);
const inputProps = JSON.parse(readFileSync(propsPath, "utf8"));
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: comp, inputProps, chromiumOptions });
for (const frame of framesArg.split(",").map(Number)) {
  const output = path.join(outDir, `${comp}-${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, inputProps, frame, output, scale, chromiumOptions });
  console.log(output);
}
