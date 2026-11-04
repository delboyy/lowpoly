# Carousel / slideshow — state

Owner: carousel side session (started by the Creative Editor, 2026-10-30). Posting is the Lowpoly lead's; never post or schedule from here.

## What exists
- **Builder (reusable):**
  - `studio/carousel/styles.json` — one fixed prompt template per art direction (+ a shared "no text, top 40% clear" suffix).
  - `studio/carousel/stories/<id>.json` — slide copy. Words/figures copied verbatim from `studio/samples/v3/*.json` + the `.sources.txt`; change only via the lead.
  - `studio/bin/carousel-gen.mjs <story> <style,...> [--slides 1,3] [--force] [--dry]` — fal art → `studio/public/carousel/<story>/<style>/<n>.png`; logs to `fal-log.jsonl`. Key: `FAL_KEY` in `/Users/a1/Projects/Lowpoly/.env`.
  - `studio/bin/carousel-render.mjs <story> <style,...> [--reel] [--sheet]` — slides (1080×1350) + optional 9:16 reel with the video's VO and scene timings + a 3 s CTA tail + a style sheet → `qa/inbox/carousel-tests/`.
  - Remotion: separate entry `studio/src/carousel/index.ts` (`CarouselSlide`, `CarouselReel`); main `Root.tsx` untouched.
- New story = copy `stories/carts.json`, fill slides from a lead-approved script, one `scene` per slide (what to draw, no words), then gen + render.

## Decisions
- 2026-10-30: Nathan asked for "ChatGPT image 2.5" → **`openai/gpt-image-2.5/flare/text-to-image`** on fal, quality `high`, 1088×1360. ≈ **$0.042/image** (fal table: 1024×1536 high = $0.041). Same price as Gemini 2.5 Flash Image ($0.04); Nano Banana Pro is $0.15. "Sunburst" variant = same price, slower, more detail — reserve.
- All text/numbers are code overlays (Montserrat 900/600, Anton for the figure, brand cream/ink/teal/orange). Prompts forbid text; check every image for stray lettering anyway.
- Carts story = 7 slides: hook (7 in 10) → studies → question → #1 reason → nearly 1 in 5 → the fix → CTA "DM LEAK for a free check" @fixtheleak_.
- Low-poly stills render from `Carts3D` and therefore pick up whatever the Creative Editor's kit3d currently looks like (v2 look in progress on 30 Oct).

## Spend
- 30 Oct: 3 hero tests + 18 slides on gpt-image-2.5 flare ≈ $0.90.

## Pipeline (from the lead, 30 Oct; see agents/PIPELINE.md)
- Carousels post daily 09:00 UTC on IG once Nathan approves a style. Slide text arrives as `plan/scripts/<slug>.approved.md` from the lead.
- Handoff: `node bin/carousel-render.mjs <story> <style> --handoff <slug>` → `qa/inbox/carousels/<slug>/01..NN.png + caption.txt + sources.txt`, then message the lead (local_247dc4fc-0a3d-4b39-8bf9-a5b6767251db) with the path. Only after Nathan approves.
- Max 4 figures per post: slide 2's "Average of 50 studies ≈ 70%" line was removed (kept in the source credit). Shown figures: 7 in 10, #1, nearly 1 in 5.

## Outputs (30 Oct)
- Sheet: `qa/inbox/carousel-tests/carts-styles-sheet.png` (rows A clay, B flat editorial, C isometric toy, D low-poly stills).
- Slides: `qa/inbox/carousel-tests/<style>/carts-01..07.png`.
- Demo reel (toy style, existing VO, 30.1 s): `qa/inbox/carousel-tests/toy/carts-reel.mp4`. Others: `node bin/carousel-render.mjs carts <style> --reel` (~20 s each).

## Known issues / next tweaks
- The text panel sometimes covers a face (clay 2 researcher, flat 4 cashier, clay 7 plumber). Fix: per-slide `panel: "bottom"` option or a stronger "top 45% empty" prompt + regen of those slides (~$0.04 each).
- Low-poly stills are a weak 4:5 crop of a 9:16 world (shop sign cut, in-world text under the panel); they would need purpose-framed cameras to compete.
- The reel ends on a 3 s silent CTA after the VO's "Because right now,", so the loop line dangles. For a reel-first version, record a CTA line or cut the last VO phrase.

## Nathan's pick
- **30 Oct: style C, isometric 3D toy** ("i like c"). Carousels = **still swipe slides only**; the 9:16 slideshow video is dropped (don't build reels unless he asks).
- Handoff: `qa/inbox/carousels/carts-7in10/` (toy, 7 slides) sent to the lead to schedule.
- He also wants to keep **testing different styles, formats and art** to see what works.

## Scheduled
- carts-7in10 (toy/7slide): IG 1 Nov 09:00 UTC, Postiz cmvvat22k0e15pa1crhxgxou8. Lead changed the caption CTA to "Comment "LEAK" (or DM us)"; slide 7 still says "DM LEAK".
- Every handoff writes `variant.txt` (default `<style>/<N>slide`, override `--variant`). Lead's plan: plan/TESTS.md, round 1 = 5 vs 7 slides, myth-vs-fact layout, then another art style.

## In progress (30 Oct, from the lead)
- agency-leaks (IG 2 Nov 09:00, hook A control, variant toy/7slide). Due to Nathan by ~1 Nov midday.
- checkout-villains (IG 3 Nov 09:00, hook test: variant `toy/7slide/hookC`).
- Stories: `studio/carousel/stories/<slug>.json` with `"approved"` → caption/sources copied verbatim at handoff. Slide text checked word-for-word against the approved md (script in this session; re-run the check for any new story).
- Slide component gained: `quote` (villain line), `note` (verbatim small print), inline CTA on a fix slide (`ctaHead` + `cta` + `ctaTail`), `**figure**` = orange bold, `*word*` = italic.

- 30 Oct: both built and sent to Nathan for approval. Handoffs ready: `qa/inbox/carousels/agency-leaks/` (toy/7slide), `qa/inbox/carousels/checkout-villains/` (toy/7slide/hookC). Working renders + review sheets: `qa/carousel-tests/<slug>/`. Spend ≈ $0.71 (14 images + 3 regenerations).
- Lessons: put "characters small, in the bottom 45%" in the scene for text-heavy slides (fix/CTA/long-fact), or the panel covers heads. Bold figures never wrap mid-figure (nowrap). On a 1-row sheet the height must be an integer (fixed).
- Waiting on Nathan's approval → then message the lead with both paths.

## Test plan (rotate one variable at a time, toy stays the control)
- Every carousel: tag style + layout in the lead's posting log so we can compare saves/shares/reach after ~2 weeks.
- Style rotation (one new style per ~3 posts, same prompt template per style): toy (control) → flat editorial → clay → something new (e.g. paper-cut collage, risograph poster, 3D claymorphism UI).
- Layout/format ideas to build next (same builder, new `layout` per slide or per story):
  1. **Story** (current): panel over full-bleed art, 6–8 slides.
  2. **Big-number poster**: one giant figure per slide, art small below; 3–5 slides.
  3. **Myth vs fact / before → after** split slides.
  4. **Checklist / "3 fixes"** save-bait format ending in the CTA.
  5. **Single-scene panorama** that continues across slides (swipe = walk along the street).
