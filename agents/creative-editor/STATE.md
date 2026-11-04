# Creative Editor state

_Last updated: 2026-10-30_

## Role
Visual owner for Business Leaks (low-poly 3D Shorts): animation, camera, lighting, pacing, VO, captions, sound, render, QA. Nathan gives feedback directly.
The Lowpoly lead (`local_a8ef99c0-8958-441e-9f9d-6384dc334e59`) owns scripts, facts and posting. Never post, schedule or change a number. When Nathan approves a video, message the lead with the file path.

## Videos
| # | Slug | File | Status |
|---|---|---|---|
| 1 | carts | `qa/inbox/bl-01-carts/bl-carts-7in10.mp4` | Scheduled 31 Oct 16:00 UTC (lead). 27.4 s (under 30). |
| 2 | reply | `qa/inbox/bl-02-reply/bl-reply-1hour.mp4` | Scheduled 1 Nov. −18.7 LUFS (quiet). Test versions sent to Nathan 30 Oct: `v2/bl-reply-1hour-v2.mp4` and `v2/bl-reply-1hour-iso.mp4` (both −14 LUFS). If he approves one as the 1 Nov file, send the lead the path. |
| 3 | inquiry | `qa/inbox/bl-03-inquiry/bl-property-inquiries.mp4` | Scheduled 2 Nov. 27.0 s, −19.4 LUFS. |
| 4 | no-shows | `qa/inbox/bl-04-noshows/bl-noshows-empty-chair.mp4` | Rendered 30 Oct (v2, `NoShows3D`, a talking villain chair). 38.3 s, −14.1 LUFS, loop SSIM 0.971. Sent to Nathan. Goes out 3 Nov 16:00 UTC once approved: send the lead the path. In the lead's JSON I set `template: noshows3d` and `targetSec: [32,40]` (Fish re-speed 1.0→1.19; the first take was 45 s). Tell the lead about both. |
| 5 | page speed | `qa/inbox/bl-05-pagespeed/bl-pagespeed-spinner.mp4` | Rendered 30 Oct (`PageSpeed3D`, a villain loading spinner over a phone-shop). 36.9 s, −14.2 LUFS, loop OK. Sent to Nathan. 4 Nov. I set `template` and `targetSec` in the JSON. |
| 6 | trades missed calls | `qa/inbox/bl-06-trades/bl-trades-burst-pipe.mp4` | Rendered 30 Oct (`Trades3D`: dripping cutaway room, ringing van, 4 phones with 1 dark, plumber under a sink, text-back bubble pops). 38.3 s, −14.1 LUFS. Sent to Nathan. 5 Nov. Weak spot: 21–26 s under the sink is fairly static. |
| 7 | agent reply (question hook) | `qa/inbox/bl-07-agent-reply/bl-agent-reply-time.mp4` | Rendered 30 Oct (`AgentReply3D`). 35.2 s, −14.0 LUFS. Sent to Nathan; the lead has the path. 6 Nov. |
| 8 | clinic calls (story hook) | `qa/inbox/bl-08-clinic-calls/bl-clinic-missed-calls.mp4` | Rendered 30 Oct (`NoShows3D` calls mode). 35.6 s. Sent to Nathan; the lead has the path. 7 Nov. |
| 9 | reminders (Empty Chair returns) | `qa/inbox/bl-09-reminders/bl-reminders-chair.mp4` | Rendered 30 Oct (`NoShows3D` reminders mode). 38.3 s, but the voice is at 1.28× (47 s at normal speed): flagged to the lead and Nathan. 8 Nov. |

## Open items
- **Look decided: v2** (Nathan, relayed by the lead on 30 Oct). Every new Short gets the `Cta` label. #2 v2 with CTA (`qa/inbox/bl-02-reply/v2/bl-reply-1hour-v2.mp4`) is waiting for Nathan's OK to replace the 1 Nov file. #4–#6 (re-rendered with CTA) are waiting for his approval. The lead already has the paths.
- **v2 look is in the kit** (Nathan said "build v2", 2026-10-30). It's in `LowPoly.tsx`, `Props.tsx` and the `Carts3D` / `Reply3D` / `Inquiry3D` palettes. Stills only so far: `qa/v2-before-after.png`. Waiting for Nathan's verdict on the look before a full render.
  - Re-rendering #1–#3 now would use v2. The scheduled MP4s are unchanged.
- Scripts are now the lead's job, via the script-writer session (`local_8af9ac00…`). Carousels and fal art are the lead's job, via the carousel session (`local_60e4001b…`). See `agents/PIPELINE.md`. BL #4–#6 scripts come from the lead after the fact-check.
- If #2 or #3 is re-rendered (length or loudness), send the lead the path. They go out on Instagram and YouTube at 16:00 UTC on 1 and 2 Nov.
- Ask Nathan:
  - Is a quiet music bed OK?
  - Should I fix the loudness of #2 and #3 before they post (audio-only, needs the lead to swap files)?
- Tell the lead: #1 and #3 are under 30 s, and #2 and #3 are quiet.

## Working notes
- Stills: `npx remotion still src/index.ts <Comp> out.png --frame=N --gl=angle`. Contact sheet: `ffmpeg -i x.mp4 -vf "fps=1,scale=270:-1,tile=8x5" -frames:v 1 sheet.png`.
- Kit lighting lives in `studio/src/kit3d/LowPoly.tsx` (World: hemisphere 1.1 + one directional 2.6, fog 14–36).
- Skills loaded this session: remotion-best-practices, threejs-fundamentals, threejs-animation, video-storytelling, motion-design. Also useful next: threejs-lighting, threejs-materials, threejs-postprocessing, critique, ffmpeg.

## 2026-10-31 — spoken CTA (variant B), lead-approved
- Kit: `Cta captions={...}` stamps COMMENT / LEAK big (top 470) on the word after "comment" + pop-drop sfx (`leakSfx`); pill pulses. NoShows3D pops the #8 text-back bubble 10f before LEAK.
- JSONs: `studio/samples/v3/{carts,reply,noshows,trades,clinic-calls}-leaks-cta.json` (originals untouched; only the last line changed).
- Outputs in `qa/inbox/<slot>/cta/`: #1 33.6 s (voice 0.9×, was 29.7 s raw), #2 34.5 s, #4 39.2 s (1.25×; trimmed "But hey, it's a busy week" → "Anyway."), #6 36.4 s (1.13×), #8 38.8 s.
- Pill-only control: #3, #5, #7, #9 unchanged. All pending Nathan's approval.

## 2026-10-31 — new-format pilots (placeholder copy, sent to Nathan as tests)
- ChatMock (`studio/src/templates/ChatMock.tsx`, sample `studio/samples/pilots/chat-agent-test.json`) → `qa/inbox/pilots/chat-agent-test.mp4` (20 s).
- MissedCall (`studio/src/templates/MissedCall.tsx`, sample `.../missed-call-test.json`) → `qa/inbox/pilots/missed-call-test.mp4` (18 s). Ring tone synthesised: `studio/public/assets/sfx/ring-synth.mp3`.
- Both: no VO yet (render via `npx remotion render ... --gl=angle` + scratchpad master.py). TODO when real scripts land: per-line Fish voices (tts-fish.mjs/make.mjs), VO-timed beats, layout lint.
- POV 2-character skit: feasible with Person + Bubble + storyCamera; needs mouth flap + per-line speaker (~half day).

## 2026-10-31 — pilots from locked scripts (A1, A2, BF a/b/c built; A3 template ready)
- Pipeline: per-line Fish voices (`voices` map + scene `voice`), `fx: "phone"`, `padMs` (tts-fish.mjs, make.mjs); `x` + `label` props pass-through; time anchors `S3/E3/W3:word±s` (studio/src/lib/anchors.ts).
- ChatMock + MissedCall are now VO-driven (BaseResolved). Kit: `LeakStamp` split out of `Cta`; NumPlate `size`. Carts3D: `ticks` checklist, `plateTop` (+ wider account cam), receipt desk without a "question" scene.
- Renders in qa/inbox/pilots/{a1,a2,bf}/ (sent to Nathan, paths to lead). BF c: line 2 cut, voice 1.03×.
- A3 (Pov3D, samples/pilots/a3-pov-owner.json): 51.5 s at 1.0× → asked lead to OK trims ("First stop,", "The fix isn't working harder.", "Right."). Not rendered.
- Voices: caller 57d4a7fa3d944ca5b2407f916ce5f4d5 ("Woman"), recording a1cacb329332495ea3a9f4511587f946.
