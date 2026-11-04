# Asset QA Rubric (v1, 2026-10-17)

Owner: Asset QA (independent; never builds or edits). Sources: `briefs/longform-channel.md` §1–2 (style bible), `playbooks/edit-rules.md` (Retention Researcher; **not landed yet** — §C marks the items to reconcile when it arrives). Platform analytics are the final judge after posting; this is the pre-publish gate.

## How to score
- Each item 1–5. 1 = broken, 2 = clearly weak, 3 = acceptable but unremarkable, 4 = good, 5 = excellent.
- **Pass bar:** every item ≥ 3, **no hard-fail triggered**, and the section average ≥ 3.8. Any **★ item must be ≥ 4**.
- **Hard fails (auto "changes", regardless of score):** emoji anywhere; real brand logo/trademark artwork; unlogged licence for any third-party file (font, sfx, music, image); text inside a platform UI zone (§D); a static frame > 2.0 s; palette outside the bible with no stated reason; clipped/overflowing text at 1080 wide.
- **Evidence rule:** every score below 4 gets a specific, measurable fix (value, property, timestamp). "Looks off" is not accepted from me or to me.
- **Method:** judge the real motion. Extract frames with ffmpeg (`fps=4` for motion, `fps=1` for contact sheets, plus frames at t=0, 1.0, 2.0, 3.0), view at **phone size (≈ 390 px wide)** and at full size. For static-frame checks run `ffmpeg -vf "freezedetect=n=0.003:d=1.2"` / compare frame diffs. Check audio with `ebur128`.

## A. Single asset (kit component, illustration, icon, chart, scene piece)

| # | Item | What a 5 looks like | Common failure |
|---|---|---|---|
| A1 ★ | Style-bible fit | Only `P` tokens (paper `#F4EFE4`, receipt `#FFFDF6`, ink `#14130F`, muted `#6B665A`, highlight `#FFD21F`, loss `#E5322D`, gain `#1F9D55`, night `#0B0B12`/`#1B1033`); ≤ 3 colours per scene (paper, ink, one accent); yellow only on the single key number | Extra blues/greens/gradients; two accents; yellow used as decoration |
| A2 ★ | Ink outline weight | One consistent outline (spec: ink, set by Asset Builder in `theme.ts`; I verify it is the same across the kit and still ≥ 2 px at 390 px-wide viewing, i.e. ≥ ~6 px at 1080w) | Mixed 2/3/4 px strokes; outline vanishes on phone; outline on some pieces only |
| A3 | Typography | Anton display, IBM Plex Mono for receipt/data, Inter for body/captions; min 40 px receipt lines, 26 px chips, 44 px captions at 1080p; nothing under 26 px | System fallback fonts; mono wrapping mid-number; 20 px labels |
| A4 ★ | Legibility at phone size | At 390 px wide: every word readable, key number identifiable in < 0.5 s, contrast ≥ 4.5:1 (≥ 7:1 for the key number) | Thin strokes, small labels, yellow on cream |
| A5 | Motion quality | Entry: translate Y 24→0 + opacity, 8–10 frames, ease-out (expo/cubic), no linear; counters 0.8–1.2 s then hold ~1 s; hard cuts by default; no overshoot unless intentional; no blur/shadow-heavy layers (render budget) | Linear easing; everything arrives on frame 1; >12 s push-ins; jitter from subpixel rounding |
| A6 | Standalone idle life | Asset has a purposeful second-level motion (<1.5 s between changes) so it never reads as a still when held | Beautiful but dead after its entrance |
| A7 | Visual density / composition | Fills its slot with a clear focal point and layered detail (paper texture, perforation, edge, shadow-free depth via offset ink); no big void inside the asset | Floating small icon in an empty frame; centred and tiny |
| A8 ★ | AI-slop tells (hallmark audit) | Hand-made geometry with deliberate irregularity; specific, domain-correct props (a Costco-style hot dog is a hot dog, not a generic food blob); no generic glow/gradient orbs, no purple-blue gradients, no uniform rounded-card grids, no symmetrical clip-art "business person", no meaningless sparkles/stars | Generic icon-pack look; decorative gradients; arbitrary rotations |
| A9 | Kit consistency | Same corner logic, outline, shading rule, perspective, and palette use as the other kit pieces; could sit next to them on `KitSheet` unnoticed | One asset in a different "hand" |
| A10 | Reusability | Props-driven (colour accent, text, size via `useLayout().u`), works portrait and landscape, no hard-coded 1080 px | Hard-coded pixel offsets |
| A11 ★ | Licence logged | Every external file (font, sfx, image, music) has a line in `assets/LICENSES.md` with source URL + licence; code-made assets state "ours" | Missing line; "Pixabay" with no URL for new files |
| A12 ★ | No emoji, no real logos | Zero emoji glyphs (check codepoints, including in strings and alt text rendered on screen); no real brand marks (McDonald's arches, Costco wordmark, etc.); parodic/generic stand-ins only (Brand names as plain text in receipt font are OK only if the style bible's source chips need them) | Emoji used as icons; traced logos |
| A13 | Performance | No `filter: blur`, large `box-shadow`, > ~40 translucent layers per scene; renders ≥ ~12 fps on the render machine | Blur-heavy glass effects |

**Single-asset verdict:** `approved` iff pass bar met. Otherwise `changes` with numbered fixes.

## B. Finished Short (9:16, 1080×1920, 30 fps)

| # | Item | What a 5 looks like |
|---|---|---|
| B1 ★ | 3-second scroll-stop | Within 0–3 s there is: a specific hook claim in big type (≤ 8 words), a striking visual in motion by frame ~6, and an open loop. Thumbnail test: freeze t=0.5 s — would it stop a thumb? Sound-off test: hook is fully understood without audio |
| B2 ★ | Static-frame discipline | No frame-group identical for > 1.5 s (hard fail > 2.0 s). Verified with freezedetect and frame diffs. Visual change every 2–3 s for Shorts (reconcile with edit-rules) |
| B3 ★ | Visual density | Never an empty or dull frame: background has texture/motion, a focal asset exists at all times, ≥ 60% of frame area carries purposeful content outside caption zone; a frame is "empty" if > 50% is flat paper with only caption text |
| B4 | Asset variety | Within one Short: ≥ 4 distinct visual assets/scene types; no asset repeated within 8 s; no repeated layout > 2× in a row |
| B5 ★ | Captions | Sentence/phrase-level karaoke, 4–7 words max per card, ≥ 44 px (Shorts safe), high contrast, in the safe zone (§D), word-sync within ±100 ms, **no heavy opaque black box**; a pill/box is allowed only if it follows the bible (ink pill at ≤ 80% opacity) *and* sits in the safe zone and does not repeat what a big on-screen number already says |
| B6 | Source chip (**v10 decision: on-video source boxes removed**; B6 now = a `.sources.txt` that lists and links every figure shown, incl. computed ones with method) | Every sourced figure has a chip (≥ 26 px) shown with the number for ≈ 3 s, placed so it avoids platform UI (not hard-pinned to the bottom-left caption/UI corner) |
| B7 | Motion quality & pacing | Easing per A5; hard cuts or 8-frame paper-tear at act breaks; camera push-in 100→106%; no shake/spin; text never appears and cuts before it can be read (≥ 0.3 s per word, min 1.2 s hold for ≤ 6 words) |
| B8 | Narrative / information design | One idea per scene; the reveal of the "hidden line" is visually the biggest moment; the number on screen matches the spoken number at the same time (±0.3 s) |
| B9 | Audio | VO clear; BGM −26 to −28 dB under VO, ducked 6 dB on numbers; SFX on events (printer chirp, stamp, whoosh) not on everything; −14 LUFS integrated (±1), true peak ≤ −1 dBTP; no clipping; ≤ 3–4 cash-register hits |
| B10 | Ending / loop | Last 1–2 s resolves and invites loop/replay or follow (no dead tail > 0.7 s of silence/static) |
| B11 ★ | Style consistency with the world | Reads as "Line Item" in one frame; palette and type per bible; same stamp/receipt vocabulary as the kit |
| B12 ★ | AI-slop tells | See A8 plus: no stock-looking generic b-roll, no random zoom-on-nothing, no repeated identical transitions, no filler graphics unrelated to the line being spoken |
| B13 ★ | No emoji, no real logos | As A12, whole frame |
| B14 | Licence logged | All fonts/music/sfx used in this render are in `assets/LICENSES.md`; BGM is licensed or flagged as placeholder (synth loops are fine for tests, **not** for publish unless Nathan accepts) |
| B15 ★ | Safe zones (§D) | No caption, chip, number or key asset detail within any UI zone for TikTok, Reels, or Shorts |
| B16 | Technical | 1080×1920, 30 fps, H.264, yuv420p, AAC; duration within the planned range (typically 30–55 s); no black frames at ends; no audio/video drift |

**Short verdict:** `approved` iff all ★ ≥ 4, all others ≥ 3, avg ≥ 3.8, no hard fail. "Approved with notes" is not a verdict; either it ships or it's `changes`.

## C. Finished long-form section (16:9, 1920×1080, 30 fps)

Use B1–B16 with these differences:
- **C1 (replaces B1) Section-opening hold:** the first 5 s of the section re-hooks (new question/number), and the previous section ends on an open loop.
- **C2 Cadence (reconcile with edit-rules.md):** visual change every 4–6 s, motion on screen every ≤ 2 s, scene length 6–14 s; no static frame > 2.0 s; no layout repeated more than twice in a row; ≥ 1 "signature" device (redact, stamp, snap-zoom) per act.
- **C3 Original-analysis scene:** each section that carries a claim shows the source (`doc`/`sensitivity`/source chip) legibly for ≥ 3 s. (Channel differentiator; a section with a sourced number but no on-screen evidence scores ≤ 2.)
- **C4 Min text sizes at 1080p:** receipt lines 40 px, chips 26 px, captions 44 px.
- **C5 Safe zones:** YouTube lower ~10% (progress bar/controls) and the top ~5% (title overlay in embeds) clear; no important detail in the bottom-right 15% × 12% (end-screen/timestamps).
- **C6 Render cost:** flat colours; estimated render within budget (15–25 min per 10 min).

## D. Text safe zones (1080×1920 Short; px from the edges) — revised 2026-10-17 after web check

**Source quality:** no official TikTok, Meta or YouTube page with pixel margins turned up (searched 2026-10-17). Every figure below is third-party consensus (ad-spec/safe-zone guides such as sprites.ai, adkit.so, hopperhq, outfy, imagevideofit, creamate), and they conflict by up to 2×. Treat as working numbers; confirm with a **private test upload on each app** (TikTok, Reels, Shorts) with a grid overlay before the first public post.

| Edge | TikTok (reported) | Reels (reported) | Shorts (reported) | Our rule |
|---|---|---|---|---|
| Top | 130 (outliers 240) | ≈270 (14%) | 120–180 (outlier 380) | **keep clear 270** |
| Bottom | ≈484 (outlier 660) | 420–670 (35%) | 300–380 | **keep clear 484** for text, numbers, chips |
| Right | ≈140 (more below y≈840) | ≈65 sides; action rail ≈ bottom 40% | 96–180 | **keep clear 160**; nothing at x>920 |
| Left | ≈44 | ≈65 | 0–60 | **keep clear 60** |

- **Hard box (never place text, numbers, chips, key asset detail outside it):** x 60–920, y 270–1436.
- **Caption band (Reels-safe):** y 1056–1248 (55–65% of height, edit-rules rule 15; stays above Reels' reported 35% bottom block). Caption lines stay on one baseline for the whole video.
- **Source chips:** inside the hard box (y ≤ 1436), left-aligned at x=60, ≥ 28 px text; they may sit just under the caption band (y≈1260–1340) because the TikTok and Shorts figures leave that free; Reels' 35% estimate may overlap them, so keep chips short.
- Decorative art (paper edges, backgrounds, running-tab strip) may bleed everywhere but must not carry the only copy of a figure.
- Landscape long-form: keep the top 54 px (5%) and bottom 10% (108 px) clear; no important detail in the bottom-right 15% × 12% (end screens).
- Previous values (top 220, bottom 480) were a smaller box; the changes are top +50 and an explicit caption band.

## E. Report format (`qa/reports/<id>.md`)
1. Header: id, files reviewed, date, reviewer, frames extracted (timestamps).
2. Score table (every item, 1–5, one-line evidence).
3. Hard-fail list (or "none").
4. Verdict: `approved` / `changes`.
5. Numbered fixes, each: *where (file/timestamp/element) → what → exact target value → why*.
6. 3-line round summary.

## F. Open items
- Reconcile B2, C2, B7, B5 against `playbooks/edit-rules.md` once it lands (currently `playbooks/` is empty).
- Outline weight target needs a number from the Asset Builder (`theme.ts` currently has no stroke token). Until set, A2 is judged on consistency + phone-size visibility.

## G. Reconciliation with `playbooks/edit-rules.md` (2026-10-17)
- **Cadence:** B2/C2 now cite edit-rules rules 1–2 (visual event ≤ 2.5 s, no static frame > 2.5 s; QA keeps the stricter hard fail at > 2.0 s on content region). QA measures events with a content-region frame-diff (10 fps, y<1150) instead of `cuts.py 0.25`, which under-counts cream-to-cream scenes; both numbers are reported.
- **Frame 0 (rules 7–9):** adopted into B1 (hero + hook caption at t=0.0, motion in first 0.5 s).
- **Captions (rule 13–15):** 1–3 words per chunk at 55–65% height; QA keeps the y 1000–1380 band.
- **Chips (rule 18):** bottom-left is allowed only inside the safe box (y ≤ 1440), ≥ 28 px.
- **Duration (24–35 s) and numbers-per-Short (≤ 4):** adopted as spec checks; v9 fails both (see `qa/reports/ve-v9.md`); escalated to PM/Retention.
- **Platform UI margins:** web-checked 2026-10-17 (third-party sources only, see §D); edit-rules rules 15/18 should be aligned to §D (caption band y 1056–1248, hard box y 270–1436).

## H. Cut/cadence measurement (PM-approved 2026-10-17)
Official method: content-region frame-diff (10 fps, y < 1150 on 1080×1920; region x 8–100% scaled), counting (a) **events** = diff > 1.5 with ≥ 0.3 s separation, (b) **hard changes** = diff > 8, (c) static runs = diff < 0.15 for ≥ 1.5 s. Pass: ≥ 4 hard changes per 10 s (or ≥ 5 events/10 s if chart-heavy), no static run ≥ 2.0 s. `cuts.py 0.25` is reported alongside for reference only. Reference implementation: `qa/tools/scan.py` (below).

## I. Source marks after the v10 decision (2026-10-17)
Nathan/PM removed on-video source boxes. QA now checks (1) every figure shown is in the render's `.sources.txt` (primary link, date, `[computed: method]` where derived), (2) long-form analysis scenes carry one brief SOURCED stamp, (3) the description/pinned comment carries the list. Risk noted to the PM: less on-screen provenance for the inauthentic-content review; fallback is a 3 s source line in the analysis scene.

## J. Audio under the SFX-only decision (PM/Nathan, 2026-10-17)
SFX-only mixes (quiet room-tone bed + SFX, no music) are valid. B9: judge VO clarity, SFX on cuts/number slams (edit-rules rule 22), no dead zone > 2.5 s, −14 LUFS, TP ≤ −1 dBTP; no BGM level check. B14: licence log covers fonts, SFX, stock; BGM becomes "n/a unless a track is added" (then it needs a LICENSES.md row and an A/B). Missing BGM is not a finding.

## K. Numbers cap: PM definition (2026-10-17, edit-rules rule 20)
**Max 4 distinct *featured* figures per Short; max 2 featured on screen at once.** A *featured* figure is a claim that is **spoken**, or a number shown as the hero, highlighted (yellow plate), counted up, or stamped. **Not counted:** axis ticks and chart-scale labels, background ledger digits, dates, and the contents of the sources slip. Waived for v12 Costco/McDonald's only (PM, 2026-10-17).
QA method: (1) transcribe the render (Whisper) and list the distinct numeric claims spoken; (2) list the numbers shown as hero/highlight/count-up/stamp from the 1 fps sheet; (3) union by value (e.g. "$1.5 billion" and "$1.5bn" are one figure; a count-up's start and end values are one figure); (4) for "at once", count hero-class numbers visible in any single frame (a bar pair with two values counts as 2). Report the list in the review so the Script Writer can trim.

## L. Clips: dead-air rule (PM, 2026-10-20; from the next batch)
- **Rule:** fail any clip with a silent or non-speech gap over 0.5 s, unless it is flagged as an intentional reaction beat (cap ≈ 0.8 s, with a punch-in). Nathan found a live Demi clip with a 3 s pause.
- **Measure** (no listening needed): `ffmpeg -i clip.mp4 -af silencedetect=n=-35dB:d=0.5 -f null -`. Exclude the lead-in (before the first word) and the final end-beat (0.7–0.8 s is required, §B/edit rule); every other `silence_duration` is an interior gap.
- **QA calibration (applied from the Ep. 344 re-render; PM may overrule):** interior gap **> 0.8 s = fail**; **0.5–0.8 s = list every gap with its timestamp and ask the Clipper to tighten it to ≈ 0.35 s** (natural sentence pauses sit at 0.5–0.65 s in nearly every talking-head clip, so a literal 0.5 s fail would reject almost everything); a flagged reaction beat may stay up to 0.8 s. Lead-in before the first word ≤ 0.3 s (the 140–200 ms pad is the target).
- **Profanity** (campaign rule): the burned-in captions star the word (F*****G); QA cannot confirm a bleep: Whisper still decodes a bleeped-over word only if the speech is intact, and a real bleep shows as a sustained ≈ 1 kHz tone (≥ 80% of the energy in 900–1100 Hz). A human listen is needed to confirm bleeps.

## M. Remix layers: duration and zones (PM 2026-10-23; supersedes the flat 1.5 s rule for own graphics)
Own drawn keyword counters, stacked lists and number badges (cockroach-A / HUMAN ~22,000 / COCKROACH / EARTHWORM style) may stay up to ≈12 s and stack, provided: top box y 270-1150 (F1/F1low: bottom strip y≥1500), x 40-1040; no overlap with faces or the hook bar (≤200 px, barcheck at 2 fps); nothing in the first 3.3 s unless the campaign says otherwise; first-seconds and quiet-passage rules per campaign. Memes/photos keep the per-campaign cap (2 Bears 1.5 s, no watermark). Code gates (clipqa.py --base [--own]) still hard-fail music, added audio, cut words.

## N. Line Item map-comparison Shorts: K exemption (PM ruling 2026-10-26)
Map-comparison Shorts (e.g. the Big Mac Short) are exempt from §K's 4-figure cap: up to 6 stops, one featured figure per stop, max 2 featured on screen at once (RULES, Line Item section). All other §K, §B, §D and logo rules apply unchanged.
