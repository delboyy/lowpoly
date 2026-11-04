#!/usr/bin/env bash
# Render the one-cut Shorts for a list of story slugs: bin/batch-shorts.sh <out-dir> slug1 slug2 ...
# Per story: from-props (short cut, stock) -> make.mjs (Fish, measured-duration re-speed, lint, loudness) -> <out>/<slug>-short-sfx.mp4 (+ .sources.txt, .caption.txt)
cd "$(dirname "$0")/.."
out="$1"; shift; mkdir -p "$out"
for slug in "$@"; do
  echo "=== $slug"
  node bin/from-props.mjs ../scripts/props/$slug.json --template world --cut short --stock --out samples/v2/$slug-short.json | cut -c1-120
  node bin/make.mjs samples/v2/$slug-short.json --tts fish --out "$out/$slug-short-sfx.mp4" 2>&1 | grep -E "voice length|fish usage|LINT|GV_LINT|video |rror" | grep -v "Type errors\|Failed renders" | cut -c1-210 | head -12
done
echo "=== batch done"
