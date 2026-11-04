# GoViral studio (Remotion 4.0.536, 30 fps; 1080×1920 and 1920×1080)

Shared render engine for every lane. Owner: Video Editor. **Do not change the `<Captions>` API without telling the PM.**
Assets live in `../assets/` (symlinked at `public/assets`); licences in `../assets/LICENSES.md`.

```bash
npm i                                  # once (studio/)
# python venv for local TTS (already created at studio/.venv-tts; recreate with:)
python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile numpy
bash ../assets/fetch-assets.sh         # only if assets/ is missing (PYTHON=.venv-tts/bin/python for the synth step)
npm run dev                            # Remotion Studio preview
```

## 1. `<Captions>` (for the Clipper)

```tsx
import { Captions } from "../studio/src/components/Captions";   // fonts are auto-registered on import
<Captions captions={captions} style="hormozi" />                 // or style="karaoke"
```

| prop | type | default | note |
|---|---|---|---|
| `captions` | `Caption[]` from `@remotion/captions` | required | `{text,startMs,endMs,timestampMs,confidence}`, one **word** each. ms are relative to the enclosing `<Sequence>` (use `<Sequence from={…}>` to shift). |
| `style` | `"hormozi" \| "karaoke"` | `"hormozi"` | recipe 1 (word-pop) / recipe 2 (sentence pill) from `research/visual-scout.md` |
| `accent` | CSS colour | `#FFE600` | active word colour |
| `positionPct` | number | 64 hormozi / 70 karaoke | vertical centre as % of frame height |
| `fontScale` | number | 1 | |

- hormozi: Anton 104 px uppercase, white, 14 px stroke (7 px visible) + shadow, 1–3 words/page, active word = accent + spring pop 1→1.15→1 over 8 frames, hard page snaps.
- karaoke: Montserrat 800 64 px, black 55 % pill r=24, ~32 chars/page, upcoming grey → active accent → spoken white, no scaling.
- Also exported: `createPages`, `msToFrame` (`src/lib/captions.ts`), `FONT` (`src/lib/fonts.ts`).

**Easiest path for the Clipper** (CLI, no React): `video.mp4 → whisper → captions JSON → 9:16 render`

```bash
node bin/caption-video.mjs /path/clip.mp4 --style hormozi --out /path/clip.captioned.mp4
#   --captions existing.json   skip whisper     --fit contain|cover (default cover = crop to 9:16)    --model base|small|medium
node bin/transcribe.mjs /path/clip.mp4 captions.json      # just the Caption[] JSON
```
Or render the composition yourself: composition id `CaptionedVideo`, props
`{ videoSrc: string /*path under studio/public*/, captions: Caption[], style: "hormozi"|"karaoke", durationMs: number, fit?: "cover"|"contain", accent?: string }`.
Transcription uses the installed `whisper` CLI (openai-whisper, model `base`; `small` is more accurate but downloads once).

## 2. Brand templates (for the Script Writer): JSON in → MP4 out

```bash
node bin/make.mjs samples/mcdonalds-kinetic.json --out ../clips/samples/mcdonalds-kinetic.mp4
#   optional: --voice am_michael --speed 1.05 --model base
```
Pipeline: each scene's `vo` text → local Kokoro TTS (one wav, exact scene boundaries) → whisper word timestamps per scene → props → `remotion render`. Captions and SFX are automatic.
The three templates share one script file shape; only `scenes[]` differ:

```jsonc
{
  "template": "kinetic" | "stat" | "montage",
  "id": "slug",                       // output/work folder name
  "voice": "am_michael", "speed": 1.05, "gapMs": 180,   // Kokoro voice ids, e.g. af_heart, am_adam
  "captionStyle": "hormozi" | "karaoke" | "none",
  "bgm": "bgm-tension-92bpm" | "bgm-drive-108bpm" | null, "bgmVolume": 0.10,
  "theme": { "bg": "#0B0B12", "bg2": "#1B1033", "accent": "#FFE600", "text": "#fff", "muted": "#8A8AA3" },   // all optional
  "sfx": [ { "atMs": 1200, "src": "boom-meme", "volume": 0.4 } ],   // optional extra cues (names = files in assets/sfx without .mp3)
  "scenes": [ /* below; every scene needs "vo": the spoken sentence(s) for that scene */ ]
}
```
**kinetic** (recipe 5) scene: `{ "vo", "text": "on-screen phrase", "emphasis": ["words","to","enlarge"], "sfx": "name" | null }`. Words stagger in (3 frames, ease-out-expo); emphasis words = Anton ×1.6 accent. Keep `text` ≤ ~40 chars. Default SFX: bass hit on scene 1, whoosh on the rest.
**stat** (recipe 7) scene, by `type`:
- `number`: `{ value, prefix?, suffix?, decimals?, group?: false (for years), label, sub? }` counts up over 1 s, thump on landing
- `bars`: `{ items:[{label,value}], unit?, title?, highlight?: index }` draws on in 0.6 s
- `line`: `{ points:number[], xLabels?:[a,b], title?, endLabel? }`
- `text`: `{ text, emphasis? }`
**montage** (recipe 10) scene: `{ "vo", "shots": [ { "media"?: "assets/…|renders/…" (image/video under studio/public), "emoji"?: "🍔" (fallback visual), "text"?: "top caption bar", "sfx"?: "name"|null } ] }`. A scene's duration is split evenly across its shots, so give **~1 shot per second of VO** (make.mjs warns outside 0.45–1.7 s). Sting on every cut (rotating pop/impact, boom on the first shot).

Compositions: `Kinetic`, `Stat`, `Montage`, `CaptionedVideo` (all 1080×1920@30). Resolved props types are in `src/lib/types.ts` if you'd rather render with your own VO: build the props yourself (`durationMs`, `voSrc`, `captions`, `scenes[].startMs/durationMs`) and run
`npx remotion render src/index.ts Kinetic out.mp4 --props=props.json`.

## Known limits (v1)
- **TTS is local Kokoro** (robotic-ish). HeyGen voices need `heygen auth login --oauth` by Nathan; then swap `bin/tts.py` for `media-use`'s `heygen-tts.mjs` (also returns word timestamps).
- Montage has no stock footage source yet: it falls back to emoji cards. Drop images/videos in `public/` and reference with `media`. Sourcing b-roll (Pexels/Pixabay API keys) is a to-do for Nathan.
- If whisper's word count disagrees with the script, make.mjs spreads script words proportionally inside the span whisper heard (caption timing a bit looser, logged as a warning).
- BGM loops are simple in-house synths; replace with real music when a Pixabay download is possible (their site blocks scripted fetches).
- Sample numbers in `samples/` ($10B rent, 95 % franchised) are approximate: the Script Writer's sourced story files should replace them before posting.
- No analytics hooks here: analytics decide which template/caption style wins.


---

# v2: the "Line Item" receipt world (current brand look)

Compositions `Receipt` (1080×1920) and `LongForm` (1920×1080) share one renderer, `src/templates/ReceiptWorld.tsx`.
The v1 templates (`Kinetic`, `Stat`, `Montage`) still work unchanged. No emoji, no real logos (company names are set in our type).
Palette tokens and layout rules are in `src/kit/theme.ts` (paper `#F4EFE4`, ink, highlight `#FFD21F` for **one** number per scene, loss/gain, night for interludes).

```bash
node bin/make.mjs samples/v2/mcdonalds-short.json --out ../clips/samples/v2/mcdonalds-short.mp4          # template "world"
node bin/make.mjs samples/v2/costco-longform-proof.json --out ../clips/samples/v2/costco-longform-proof.mp4  # template "longform"
node bin/sheet.mjs public/renders/<id>/props.json out.mp4 sheet.png 6     # one frame per scene for QA
```

## Script file for `world` / `longform` (same shape as v1: `scenes[].vo` + scene fields)
Top level: `{ template: "world"|"longform", id, voice, speed, gapMs, captionStyle: "hormozi"|"karaoke"|"none", bgm, bgmVolume, brand?, scenes[] }`
(defaults: hormozi on 9:16, karaoke on 16:9; `sfx: [{atMs,src,volume}]` for extra cues).
Every scene: `{ vo, type, source?, sfx?, dark? }`. `source` draws the **source chip** (bottom-left; also plays a soft ping). `sfx: "name"` swaps the scene's signature cue, `sfx: null` mutes it. `dark: true` = night interlude background.

| `type` | fields | signature device / SFX |
|---|---|---|
| `title` | `text, emphasis?[], kicker?` | words rise in; emphasised words get a **marker swipe**; whoosh |
| `act` | `kicker, text` | yellow tab + headline; paper tear |
| `receipt` | `title?, subtitle?, lines:[{label,value?,hl?,loss?,gain?,bold?}], total?, illus?, stamp?` | prints line by line, **printer chirp per line**, optional **stamp slam** |
| `redact` | `label, value, sub?, illus?` | black **redaction bar peels** off the number; peel + thud |
| `stat` | `value, prefix?, suffix?, decimals?, group?:false, label, sub?` | count-up 1 s, highlighter on the number, thump on landing |
| `bars` | `items:[{label,value,kind:"ink"|"hl"|"loss"|"gain"|"ghost",note?}], unit?, prefix?, decimals?, title?` | bars draw on; `ghost` = hatched "if it had kept pace" |
| `dots` | `share (0-1), label, fillLabel?, restLabel?, cols?, rows?` | dot grid sweep ("95% of 45k") |
| `map` | `region:"us"|"world", title?, dots?:[{lon,lat,label?,color?,size?}], highlight?:["Washington"], scatter?:{count,seed?}, caption?` | real geometry (us-atlas, Natural Earth); borders draw on, dots pop with rings |
| `chart` | `kind:"line", points[], xLabels?, yPrefix?, ySuffix?, endLabel?, title?` or `kind:"waterfall", steps:[{label,total}|{label,delta}], prefix?, suffix?` | |
| `sensitivity` | `title, series:[{label,points[],tone:"hl"|"ink"|"loss"|"gain",endLabel?}], xLabels?, yFloor?, takeaway` | multi-line scenario chart: **where the original analysis lives** |
| `object` | `illus, text?, emphasis?[], tag?:{from,to,label?}, color?` | illustration pops in; `tag` = **price tag that flips** |
| `montage` | `cuts:[{illus?|icon?, text}]` | hard cuts (~1 s each) with pop stings |
| `stamp` | `text, tone?:"loss"|"gain", sub?` | stamp slam + thud |
| `doc` | `title, lines[], highlight (index), footer?` | filing page with highlighted line |

`illus` names: `burger fries coffee pump cart store hotdog phone contract building truck card` (flat code-drawn SVG, `src/kit/illustrations.tsx`; props `size, color, accent, progress, wobble`).
Icons: Lucide (ISC) restyled, `src/kit/icons.tsx` (`<Icon name="key" />`). Charts/maps/devices are plain React components in `src/kit/` and can be used outside the scene vocabulary. Visual QA sheets: `npx remotion still KitSheet|KitSheetDevices|MapDemo out.png`.

## Reconciling with `scripts/props/*.json` (Script Writer)
The Script Writer's story file (`{slug,title,hook,lines:[{text,visual,template}],numbers[],analysis}`) stays the source of truth.
`bin/from-props.mjs story.json --template world|longform` converts it to a studio script: each `lines[i].text` becomes `vo`.
**New optional field:** `lines[i].scene` = one scene object from the table above (without `vo`/timing), and `analysis.scene` (+`analysis.vo`, `analysis.afterLine`) for the original-calculation scene.
`scene.sourceRef: n` points at `numbers[n]` and builds the chip text. Lines without a `scene` render as plain title cards, so old files still work but look plain.
`visual`/`template` remain free-text notes for humans; the studio ignores them.

Directed examples (hand-written from the props files): `samples/v2/mcdonalds-short.json`, `samples/v2/costco-short.json`, `samples/v2/costco-longform-proof.json`.

## v2 known limits
- No stock b-roll or Lottie yet: Pexels/Pixabay block scripted downloads (403) and there is no API key. Mixkit is reachable but its licence differs per clip (free vs restricted). Nathan: send a Pexels API key (free) and the pipeline can fetch b-roll with per-clip licence logging.
- No AI images (no fal/other key configured). Not needed for the receipt world; kept for hero moments later.
- No 3D (Three.js): didn't earn its render cost.
- Long-form is rendered like Shorts: 66 s of 1080p took ~30 s. Heavy blur/shadows were avoided deliberately; keep it that way.
- Captions in `LongForm` karaoke: 4–7 words, scaled to ≥44 px at 1080p. Sensitivity/doc scenes need the Research agent's figures; `doc` is a code-drawn mock, not a screenshot of the real filing.
- Per-scene `sfx` cues are synthesised/CC0; printer chirp is ours (`assets/synth.py`).


---

# Voice: Fish Audio (default when `FISH_API_KEY` is set) or Kokoro

`bin/make.mjs` picks the engine: `--tts fish|kokoro` > script `"ttsEngine"` > Fish if `FISH_API_KEY` is in the environment, else Kokoro.
If Fish fails (bad key, no credit, network) it falls back to Kokoro with a warning; `--tts fish` makes that an error instead.
Keys live in the **project-root `.env`** (`/Users/a1/Projects/GoViral/.env`, mode 600, git-ignored): `FISH_API_KEY=...`, later `PEXELS_API_KEY=...`, etc. `bin/lib/env.mjs` loads it for every script (real environment variables win). Keys are never printed, logged, or written to usage/props files. Set `FISH_VOICE_ID=<reference_id>` in the same file to change the house voice for everything (otherwise Adrian).

```jsonc
// in the script file (all optional)
"ttsEngine": "fish",
"fish": { "model": "drama-3", "voice": "bf322df2096a46f18c579d0baa36f41d", "speed": 1.0, "temperature": 0.7 }
```
`--fish-voice <reference_id>` overrides the voice per run. Default voice = `FISH_VOICE_ID` from `.env` if set, else **Nathan's chosen voice `55046bd7267d4a618380d1e8f93a056a`** (a voice reference_id, not the model; the model stays `drama-3`). Adrian/Delia ids below are for comparison (EN-US male, public). Other public voices from Fish's drama-3 page: **Delia** `c70cfb98867a4bfb9ae20d2401257b92` (EN-US female), **Sheila** `f3a2b90078d54a65af4b95f63bc7798e` (EN-US female). Any voice id from fish.audio (or Nathan's own clone) works. Model `drama-3` (header `model: drama-3` on `POST https://api.fish.audio/v1/tts`; if the header is wrong Fish silently serves `s2.1-pro`). Output is mp3 44.1 kHz, converted to wav per scene so scene boundaries stay exact. Whisper still produces the caption word timings.

## Writing tagged VO lines (for the Script Writer)
Put directions **inside the `vo` string** (in `scripts/props` that is `lines[i].text`). The studio strips every tag before captions and before Kokoro, so on-screen text never shows them. Source: https://docs.fish.audio/features/text-to-speech/drama-3

| Syntax | Meaning | Example |
|---|---|---|
| `[plain-language direction]` before the words | how to perform what follows: emotion, intent, pacing, who they're talking to | `[calm, matter-of-fact, a little amused] The hot dog isn't a product.` |
| `[sound]` or `[pause]` where it happens | sigh, small laugh, breath, pause | `It cost one fifty. [pause] Still does.` |
| `<whisper>..</whisper>`, `<emphasis>`, `<soft>`, `<fast>`, `<slow>`, `<stress>`, `<forceful>` | delivery change for **those words only** | `about <emphasis>half</emphasis> of its operating profit` |
| `<french>..</french>` etc. | switch language for a phrase (experimental) | |
| `<|phoneme_start|>EH1 N JH AH0 N IH0 R<|phoneme_end|>` | pin pronunciation (CMU Arpabet) of a name | stripped from captions; spell the word normally in the caption by also writing it in plain text if needed |
| `<|speaker:0|>` ... `<|speaker:1|>` | multi-speaker (needs `reference_id` array; not wired into make.mjs yet) | |

Older S2 emotion markers (`[excited]`, `[whispering]`, `[sighing]`, ...) also work and are stripped the same way. Rules of thumb: one direction per sentence, 2-5 words, direction before the line it governs; numbers should be written as words (the pipeline already assumes that); don't stack more than ~2 tags in a sentence; test one scene before rendering all.
Tags count toward billing (they are sent as text), so keep them short.

## Cost
Fish bills per **UTF-8 byte of input text** (https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits). Documented list price: **$15 / million bytes** for `s2.1-pro` / `s2-pro`; `s2.1-pro-free` is $0. **`drama-3` has no price on the docs page**; Fish's pricing page currently advertises "80% off through API" for Drama 3 (an offer with a countdown), so the real rate is unconfirmed. `bin/tts-fish.mjs` writes `vo.wav.usage.json` with the bytes sent every run, and `node bin/tts-fish.mjs --estimate "text"` prices any text at the documented rate (override with `FISH_PRICE_PER_M`).
- 45 s Short (Costco, with tags): 843 bytes = **$0.013** at $15/M (about $0.003 if the 80% promo applies).
- 10-min long-form (1,400-1,700 words, about 8,500-10,500 bytes plus tags, call it 9-12 KB): **$0.14-0.18** at $15/M (about $0.03 with the promo).
These are estimates from list prices, not invoices. Real cost per render is measured from the account balance after the first run (see TODO).

## Measured on the first real runs (2026-10-17, `drama-3`)
Costco Short, 9 tagged lines, 835 UTF-8 bytes each run: **Adrian 52.6 s of audio, Delia 46.4 s** (Kokoro was 41 s). Bytes x $15/M = $0.0125 per Short at the documented rate; the account's real charge for `drama-3` is not visible through the API (check the Fish billing page before/after). Drama voices read slower than Kokoro, so budget about 10-25% more runtime and trim the script (or set `fish.speed` ~1.1) to stay under 45-60 s.

## Asset Builder library (`src/kit/library/`, QA-approved only; owner: Asset Builder)
Import from `../kit/library`. Previews: `npx remotion still src/kit/preview-entry.tsx <Id> out.png` (own entry, never in Root). Outline weights: `STROKE` in `kit/theme.ts`.
- `<BankVault open={0..1} />` closed vault; wheel spins then the door swings on its hinge; glint when open. Props as `IllusProps` (size, progress, color, accent).
- `<DeliveryVan label="ROUTE" drive open={0..1} />` generic van, wheels/lines/ground in motion; `open` pops parcels. Name set in our type, never a logo.
- `<MembershipCard label tier number flip={0..1} stamp={0..1} stampText />` card with shine; `flip` shows the back, `stamp` slams "RENEWED".
- `<LedgerBg calm seed />` / `<ReceiptRollBg seed words />` hero backgrounds: no yellow, centre calm for the key number and captions. `<HotDogCombo />` + `<SodaCup />`: hero food combo (mustard draws on, steam, bob).

## Layout lint (every render)
`src/templates/LayoutGuard.tsx` measures all text boxes inside the render (4 settled frames per scene) and `bin/make.mjs` prints `LAYOUT LINT: clean` or the list (also saved to `public/renders/<id>/lint.txt`). It flags caption x content, caption x source chip, chip x content, caption x running tab, content outside the safe lane (9:16: x60-920), and chips running off-frame. Portrait lanes: hero/content y260-1150 inside x100-880 (so the template's max zoom stays inside the safe box), caption baseline y~1280, source stub y~1370-1430. Landscape: content ends y740, caption lane y>=960. Mark transient elements with `data-gv-ignore`.
Render with existing voice/captions (no TTS credit): `node bin/make.mjs script.json --id <work-id> --reuse --out file.mp4`. Audio is mastered two-pass to -14 LUFS, true peak <= -1.5 dBTP.
- Objects: `<FuelPumpLive />` (ticking total), `<PhoneAppLive balance balanceTo />`, `<StampMark text tone start />` (stamp family, slams inside x60-920), `<MoneyFlow back={{label}} />` (self-drawing arrow, coins, return arrow).
- Charts (wrap in `<SafeBox>` = x60-920; Shorts only): `<ShareRing share sub />`, `<RouteMap stops />` (US route, van rides; labels auto-avoid other pills and the route line, per-stop `side`, give it top padding), `<DollarSplit parts hl />`, `<RankLadder items best />`. Transition: `<TearWipe />` inside a `<Sequence>` over the cut (swap scenes at its midpoint; `reverse` flips direction).
- Transitions/devices (place a wipe in a `<Sequence>` over the cut, swap scenes at its midpoint): `<RedactWipe />`, `<TearWipe />`; `<TornEdgeDivider width label />` torn strip; `<DottedConnector points />` follow-the-receipt line; `<CoinTagAccents seed />` background that fills empty scenes (no yellow).
- Set 5: `<WarehouseBackdrop />` (or `WarehouseFar/Mid/Near` layers to parallax; no logos), `<BigNumberCard value sub prefix suffix kicker />` (0.9s count, required sub-label), `<PrintingReceipt lines total subtitle />` (tall receipt, tear-away tail; `lines` come from the sourced script, never defaults; `printingReceiptCuesMs` for chirps), `<GlyphIcon name="soda|cash|calendar|percent|magnifier|tag|lock|pump|coffee" />`, paper pack `<TapePiece />`, `<PaperCrumple />`, `<TornPaper />`.

---

# v3: edit rules, kit library scenes, two cuts per script

## Edit rules built into the template (`playbooks/edit-rules.md`)
- **Visual event at least every 2.5 s**: every scene start is an event, plus an automatic **zoom-punch** (8% in 3 frames, decays over 10) about every 2 s, snapped to the nearest spoken word, with a soft tick (-18 dB). Combined scale stays <= ~1.10 so content stays inside the safe lane. **Write scenes of <= 2.5 s** (about 8 words) to hit >= 4 hard cuts per 10 s; use `take` (below) so short lines still sound like one read.
- **Frame 0 shows the story**: the first scene's hero and headline are visible on frame 0 (no fade-in); first phoneme at t=0 (Fish leading silence is trimmed per line). Cut within 0.25 s of the last word. Loudness -14 LUFS two-pass.
- Fish voice speed defaults to **1.2** (`FISH_SPEED` in `.env`, or `fish.speed` in the script) to land near 3.2-3.8 words/s.
- Keep at most 4 numbers on screen per Short; one highlighted keyword per caption chunk is automatic.
- Check every render: `python3 -I research/retention-lab/cuts.py out.mp4 0.25` (target >= 4 hard cuts/10 s) plus the built-in `LAYOUT LINT`.

## `take`: write short lines, voice them as one read
`{"vo": "Half of Costco's profit isn't groceries.", "take": "a", ...}` followed by more scenes with `"take": "a"`: consecutive scenes with the same `take` are sent to TTS as one continuous line and split into scenes at the word where each fragment starts. Scenes without `take` are voiced separately.

## New scene types (all from `src/kit/library`, QA-approved)
| `type` | fields |
|---|---|
| `bignum` | `value, sub (required), prefix?, suffix?, decimals?, group?, kicker?`: 0.9 s count-up, hold, post-count beat (use for every big number) |
| `ring` | `share (0-1), sub, tone?, title?`: donut draws to the share, slice pulls out |
| `split` | `parts:[{label,cents,tone?}] (sum ~100), hl?, title?`: where $1 of sales goes |
| `rank` | `items:[{label,value,sub?}], best?, unit?, prefix?, decimals?, title?`: ranked rows |
| `route` | `stops:[{lon,lat,label?,tone?}], title?`: US route with a van riding it |
| `flow` | `label, back?, title?`: self-drawing money arrow with coins (+ optional return arrow) |
| `lib` | `object: hotdogcombo\|membership\|vault\|van\|soda\|pumplive\|phonelive, text?, emphasis?, props?` (props e.g. `{label:"COSTCO",tier:"GOLD STAR"}` for membership, `{price:"3.19"}` for pumplive) |
| any scene | `bg: "ledger"\|"roll"\|"warehouse"\|"coins"` (animated background), `cut: "tear"\|"redact"\|"stamp"` (+ `cutText:"PAID"`) = wipe into this scene (dark and `act` scenes get a tear by default) |
| `montage` cuts | add `glyph: "soda"\|"cash"\|"calendar"\|"percent"\|"magnifier"\|"tag"\|"lock"\|"pump"\|"coffee"` |
Kit pieces not exposed as scene types yet (use as components): TapePiece, TornPaper, PaperCrumple, TornEdgeDivider, DottedConnector, PrintingReceipt.

## Two cuts per story (Shorts/Reels 38-50 s, TikTok 62-75 s)
`bin/from-props.mjs <story.json> --template world --cut short|tiktok` builds a script from `props.cuts[id].lines` (`{text, scene?, take?}`; legacy `lines` = the short cut). Then `node bin/make.mjs samples/v2/<slug>-<cut>.json`. Fish costs about $0.003-0.013 per Short; the TikTok cut about 1.5x.

## Background music = one-line swap
Every render uses `assets/bgm/default.mp3` unless the script sets `"bgm": "<name>"` (file `assets/bgm/<name>.mp3`) or `BGM_TRACK=<name>` is set in the project `.env`. **To change the music for everything: replace `assets/bgm/default.mp3`** (or set `BGM_TRACK`). `"bgm": null` = no music. Currently a synth placeholder.
- Stock layer: `node ../assets/stock.mjs search video|image "q" [--source pixabay|pexels|unsplash] --sheet out.png` then `fetch ... --name --story --trim 0-4` (all three sources, cached, licence-logged, `credits` writes post-description credit lines, Unsplash download endpoint called; `pack` regenerates `kit/library/stock-packs.ts`). Use `<StockShot id="mcd-patty-grill-01" frame="receipt|polaroid|torn|stub|full" treatment="ink|red|halftone|thermal" caption width height />` (never raw clips); `stockForStory(slug)` lists a story's shots. Music shortlist: `assets/bgm/PIXABAY-SHORTLIST.md` (manual download).

---

# v4: SFX-only default, safe zones, post files

- **No music by default.** `"bgm": "none"` (default; `BGM_TRACK` in `.env` or `"bgm": "<name>"` in a script adds `assets/bgm/<name>.mp3`, and a missing file falls back to SFX-only with a warning). The synth placeholders were deleted. SFX-only mixes carry a quiet `room-tone` bed (`assets/sfx/room-tone.mp3`, ours) so silence is not dead, plus printer chirps, stamp thuds, whooshes on punches/cuts, and a riser into reveals (stat/bignum/redact/stamp/ring scenes). VO stays at -14 LUFS integrated. A/B variants: name outputs `<id>-sfx.mp4` and `<id>-bgm.mp4` (render the same script twice; the second with `"bgm": "<name>"` set in the script or `BGM_TRACK=<name>` in the environment).
- **Safe zones (1080x1920, QA RUBRIC §D, working values):** hard box for text/numbers/key detail x60-920, y270-1436. Hero lane y310-1040 (so the 10% max punch stays >= y270), caption band y1056-1248 on **one** baseline (60% of frame height), `LINE ITEM` tag y276 for the first 1.5 s. Landscape: top 54 px and bottom 108 px clear. `LayoutGuard` checks all of it on every render.
- **No on-video source boxes.** Sources go to the post: every render writes next to the MP4 `<id>.sources.txt` (per-number sources with URLs/dates + a one-line "Short form: Sources: ..." for captions), `<id>.caption.txt` (hook + short sources) and the MP4. Posting Ops reads those three files (`<id>.mp4`, `<id>.sources.txt`, `<id>.caption.txt`).
- **Stock video** (Pixabay, via `assets/stock`): `{type:"clip", clip:"<id>", text?}` or `clip:"<id>"` on a title scene; always shown through the kit's treated frames (polaroid/receipt/torn, thermal treatment), never raw. `from-props --stock` attaches up to 3 per cut and skips clips whose first 3 s are mostly black (mean luma < 70, cached in `assets/stock/luma.json`).
- Secondary visuals: plain title scenes in 9:16 get an auto glyph icon by keyword (percent, cash, tag, lock, calendar, magnifier, soda, pump, coffee).
- Map kit (Money x Places; `kit/library/maps2.tsx`, public-domain Natural Earth + US Census, d3-geo): `<PlaceMap from to highlight pins />` (zoom-to-place), `<SeaRoute routes marker centerLon />` (great-circle trade routes with moving ships/coins/trucks), `<Choropleth data src="world|us" fmt />` (top region yellow), `<ReceiptPin anchor lines hero />` (receipt pinned to a map), `<PaperMapBg />`. Wrap in SafeBox (width <= 860), show `<MapDisclaimer />` on border scenes, never label/highlight a disputed territory unless the script covers it. All preview data is dummy.
- Long-form pieces: `<RegionMap features from to highlight tint labelRegions pins />` (admin-region maps; Ireland counties bundled as `IRELAND_ADM1`, duplicates highlight both, NI context only), `<DataCentre size=1000 label />` + `<RackGlyph hl />` (no logos, one yellow key rack), `<CardReaderFeeBite total />`. `<ProjectionChart actual projection band />` (solid actual, dashed projection, range band; 0-based axis only: a non-zero floor needs a visible axis break and a QA still first).
- Map kit II: `<RegionChoropleth features data fmt label />` (UK ITL1/ITL2 bundled from ONS: both OGL credit lines from LICENSES.md in the description; zoom on London for the key scene), `<NodeMap nodes flows />` (ports/airports/cities + flow arrows with a number; `UK_PORTS`, `UK_AIRPORTS` coordinates are approximate: verify). Known polish for a key scene: the NodeMap flow arrow head can look slightly lopsided (QA note): send a still first.

---

# v5: unique work dirs, patch tool, guards (2026-10-17 evening)
- **Work dir per output**: `make.mjs` now renders into `public/renders/<script id>--<output file name>/` (override `--work <name>`), so test renders of the same story by other sessions can no longer overwrite the props/voice under a finished video (this happened to the v14 Shorts: their work dirs were overwritten by test renders, which would have made a scene patch splice the wrong scenes). Every render also writes **`<out>.props.json`** next to the MP4 (the props that video was rendered from).
- **`bin/patch-scenes.mjs --video <mp4> --scenes 2,49 --comp LongForm|Receipt --out <mp4>`** re-renders only those scenes and splices them in (video re-encoded once, audio copied). It reads `<video>.props.json`; if that does not exist it refuses unless you pass `--props` or the legacy `--id <work-dir>` (unsafe when the story was re-rendered since). It prints LayoutGuard lint for the patched frames. Not usable when the VOICE changed (timeline shift): re-run make.mjs then.
- **Guards in make.mjs**: stops if scene text contains confirm/TODO/TBD/dossier/flag:/not verified (`--allow-notes`), warns for figure scenes without `source`, copies hand-written `<script dir>/publish/sources.txt` + `description.txt` over the generated files, `--sources-only` rewrites only the sources/caption files. `disclaimer` is only printed when the script sets it.
- **LayoutGuard** also checks contrast (approximate: skips large numbers on yellow plates), text covered by another layer, clipped text, safe bands (9:16: x60-920, y270-1436; 16:9: top 54 px) and the brand tag.

## Render limiter (standing rule)
`bin/make.mjs`, `bin/patch-scenes.mjs`, `bin/lint-film.mjs` and whisper (`bin/transcribe.mjs`) run through `ops/render_slot.py` (3 Mac-wide slots, nice 10) via `bin/lib/slot.mjs`; Remotion renders use `--concurrency=3`. `GV_HWACCEL=1` adds `--hardware-acceleration=if-possible` (videotoolbox H.264). It is off by default because finals use CRF quality and the hardware encoder is bitrate-controlled. `--keep-voice` on make.mjs reuses unchanged Fish lines (an edit re-voices only the lines it touched).
