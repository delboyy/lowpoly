# Creative Editor notes

## 2026-10-30 — First review of BL #1–#3 (honest critique)

Method: 1 fps contact sheets, full-size stills at t=0 / last frame / mid-beats, first-vs-last SSIM, ebur128.
Files: `qa/inbox/bl-01-carts/bl-carts-7in10.mp4`, `bl-02-reply/bl-reply-1hour.mp4`, `bl-03-inquiry/bl-property-inquiries.mp4`.

### Measured
| | Duration | Loudness | Loop (first vs last frame SSIM) |
|---|---|---|---|
| #1 carts | **27.4 s** (rule: 30–40) | −14.1 LUFS ✅ | 0.970 — 3D world matches; only the caption word differs ✅ |
| #2 reply | 31.4 s ✅ | **−18.7 LUFS** (≈5 dB quiet) | 0.980 ✅ |
| #3 inquiry | **27.0 s** (rule: 30–40) | **−19.4 LUFS** | 0.971 ✅ |

The loop works: the camera returns to the opening shot. Two of three are under 30 s, and #2 and #3 are quieter than #1. On a feed they will sound noticeably softer next to other Reels. These are already scheduled, so I'll flag them to the lead rather than touch them. The loudness fix is a cheap audio-only re-encode if Nathan wants it.

### What works
- The core idea is good: one continuous world with one camera and no cuts, and the loop closes on the opening shot.
- Some station metaphors are strong. The pigeon-hole wall that fills with REPLIED / LATER / NO REPLY (#2), the 384-tile grid turning red (#3) and the crowd of shoppers with carts (#1) all explain the number without words.
- Captions are punchy (Anton, 2–3 words, yellow key word) and readable at phone size.
- Each video has one featured number, and it lands on the spoken word.

### What looks weak (in order of how much it costs us)
1. **Amateur-looking lighting and materials. This is the main thing that reads as "made by code".** We use one hemisphere light plus one directional light, so everything is lit flat from the same side. There's no rim light to separate characters from the ground and no colour contrast between key and fill. Materials are flat matte pastels at similar values, so beige ground, beige crates and beige buildings merge (#1 receipt beat, #2 city of leads). Fog washes the far ground to the sky colour, so the horizon is a grey band. Good low-poly (Monument Valley, Townscaper, Mini Motorways) depends on strong value separation and warm-key/cool-shadow lighting.
2. **Blank faces and unfinished props.** The #1 receipt and account screens show as large flat grey slabs for 1–2 s before any content appears. At ~9 s the receipt is a ~60%-of-frame grey wall with nothing on it. The #2 phone is a plain green rectangle. "…" bubbles are grey chips. These read as placeholders. The people are block bodies with faceted heads and no faces, and they mostly stand still. After Nathan's "awful" reaction to the code avatar, I'd treat the characters as the biggest appeal risk.
3. **Camera: long holds, then dead travel.** The opening shot of #2 (phone + clock) is essentially the same framing for ~9 s, and #3 opens the same way for ~6 s. Travel between stations sometimes passes over empty ground (#1 ~4 s, a near-empty frame with a tiny prop; #2 ~27–28 s, empty ground under "SO IF A"; #3 ends on a tiny figure in a big empty street). Moves are mostly straight dollies on one ease. There's no push-in on the number and no parallax foreground. Shots are either static or travelling, never alive.
4. **The overlay stack crowds the top third of the world.** The HookBar is on screen the whole time (2 lines of ~30 px text) and covers the shop signs and roofs we built (#1 opening: the store sign is hidden behind it). The NumPlate (a white card with a 26 px brown sub-label) sits right under it and covers more of the world (#1's "#1 reason" plate hides the receipt's first line). That leaves the 3D world only the band between y≈500 and y≈1350. The plate itself looks like a generic UI card, not part of the world.
5. **Pacing and story shape.** Every station gets roughly equal time and the same energy. There's no single biggest moment where the hidden leak is revealed (RUBRIC B8). The endings fade back into the opener rather than paying off, so "the loop" is mechanically correct but has no "aha" that makes people rewatch. With SFX only and no music, the long holds feel slower than they are.
6. **Captions sit low.** The word line is at y≈1420, the very bottom of our hard box (y≤1436) and below the agreed caption band (y1056–1248). On Reels, the username and caption overlay starts around there.

### The 5 upgrades that would raise quality most (all within the fixed low-poly style)
1. **A lighting and colour pass in the kit (`LowPoly.tsx` World), applied to every video at once.**
   - Warm key (≈#FFD9A8, intensity ~3) from a high 3/4 angle, a cool fill (sky blue, low), and a **rim/back light** to outline characters and props.
   - Shadow colour pushed toward cool violet with a slightly harder shadow edge.
   - Explicit ACES tone mapping plus a small exposure lift.
   - A value plan per scene: ground darker and less saturated, hero prop the brightest and most saturated thing in frame, background desaturated. One accent colour (the brand orange) reserved for the "leak".
   - Optional and cheap: a subtle vignette and a light SSAO/contact-shadow blob under props so they sit on the ground. I'll test render cost.
2. **Make the props and characters charming instead of placeholder.**
   - No blank faces: every screen and receipt has content from its first visible frame, with a bevelled edge or frame.
   - Phones get a real bezel, a notch and a lit UI.
   - People get simple readable faces (two dot eyes, a tiny nose, maybe a hair cap), an idle bob and a head turn, and a reaction pose on the leak moment (shrug, walk away). Still low-poly, flat-shaded and faceted, just with personality.
3. **Rewrite the camera language in `storyCamera`.**
   - A slow push-in (~5–8%) during every hold, so no shot is ever static.
   - A punch-in or quick dolly on the number word.
   - Arcs instead of straight lines when travelling, with motion blur–like speed ramps (ease-in-out with a faster middle).
   - Foreground parallax objects (a lamp post, a parcel) passing close to the lens.
   - Travel paths that never cross empty ground: either cut the travel time or dress the path.
   - Rule: a new visual event at least every ~2 s.
4. **Integrate the overlays with the world and free the top third.**
   - Show the HookBar for the first ~2.5 s, then collapse it to a small tag. Its claim is already in the post caption.
   - Restyle the NumPlate as an in-world object, like a 3D sign or price tag that springs up from the station, or a bold Anton number with a thick outline, rather than a white UI card.
   - Move captions up into the agreed band (~y1150).
5. **Give each video one reveal beat and a payoff loop.**
   - The leak moment gets the biggest motion: a camera snap, the brand-orange accent and a bass SFX.
   - The final 2 s visually rewinds into the opener so the loop reads as intentional.
   - Pace stations by importance, not evenly. Target 32–36 s by adding a "cost" or "fix" beat rather than slowing down.
   - Ask Nathan about a quiet music bed (currently none); it would help the low-energy stretches.

Also: normalise every render to −14 LUFS with true peak ≤ −1 dBTP as a final make.mjs step, so #2 and #3 don't repeat.

### Next actions
- Build upgrades 1–3 into the kit as a "v2 look" and prove them on BL #4 (no-shows) when the script arrives. Send Nathan a still sheet before the full render.
- Do not touch the scheduled 31 Oct–2 Nov files without Nathan and the lead.

## Nathan's feedback log
- 2026-10-30: "Yes, build v2." Then: the videos are "very bleak and bland". Use the skills to improve the colours, backgrounds and the assets we build. Wants wittier scripts and hooks (split to the script-writer session) and carousels/slideshows with fal AI art tests (split to the carousel session). Both sessions now report to the lead.

## 2026-10-30 — v2 look built (kit-wide; stills only, no full render yet)
Before/after sheet: `qa/v2-before-after.png` (top: live renders, bottom: v2 at the same frames).
- **Lighting:** the key light now targets the subject. The v1 key aimed at the world origin, so far stations were lit edge-on, panels looked grey and shadows fell off the shadow map. Added a cool rim from behind and a hemisphere fill. Neutral tone mapping (ACES was greying the pastels).
- **World:**
  - gradient sky dome
  - rolling low-poly hills, ~46 trees (cone and round) and clouds behind every station (`Scenery`, z ≤ −14)
  - faceted two-tone ground (per-triangle colour jitter)
  - fog pushed back to 30–70
  - soft vignette
  - more saturated per-video palettes (sand plaza for carts, green fields for reply and inquiry)
- **Assets:**
  - People now have faces (eyes, nose, cheeks), hair in 6 colours, arms that swing and a bob when walking.
  - The phone has a bezel, a notch and a lit chat UI ("Hi! Still open?").
  - Paper, bubbles and forms are slightly self-lit, so white reads as white.
- **Overlays:**
  - The number is now the hero: Anton with a cream outline, a hard drop shadow and a dark label chip. The white card is gone.
  - The HookBar slides out at ~2.7 s and back in over the last 0.8 s, so the loop frame still matches frame 0.
  - Captions moved from 74% to 68% (y≈1305). 62% covered the props.
- **Camera:** a ~10% punch-in on every number word and an arc over long travel moves.
- **Escape hatches:** `LowPolyWorld v1` / `scenery={false}`, `NumPlate v1`, `HookBar pinned`.
- **New tool:** `node bin/stills.mjs <Comp> <props.json> <outDir> 0,45,330 [--scale 1]` bundles once and renders many stills.

Known v2 issues still open:
- On #2 the "~7×" number covers the NEW INQUIRY bubble. Per-scene plate `top` or a bubble move fixes it.
- Captions sit over some pigeon-hole signs (#2).
- The 1.25M-leads "city" boxes are still pale pastels.
- Faces are small at phone size, so they work mainly in close shots.
- A full render (cost, loop check, flicker) is not done yet.

## 2026-10-30 — First full v2 renders + format test #1 (Nathan: "try different formats and styles and we will see what's working")
Same story (#2 reply), same voice and timings, so only the look changes:
- **A. v2 perspective:** `qa/inbox/bl-02-reply/v2/bl-reply-1hour-v2.mp4`. 31.5 s, −14.1 LUFS, no freezes over 1.5 s, loop SSIM 0.972 (only the caption word differs, same as v1).
- **B. Isometric toy:** `qa/inbox/bl-02-reply/v2/bl-reply-1hour-iso.mp4`. An orthographic camera at 30° yaw and 35° elevation, matching the carousel style Nathan picked (C, isometric toy). Same world, no sky, a floating-diorama feel. −14.1 LUFS, loop SSIM 0.975. Turn it on with `iso: true` in the props; only Reply3D supports it so far (the kit's `Rig` handles any orthographic canvas).
- **Fixes in this pass:**
  - NEW INQUIRY bubble shrinks away while the "~7×" number is up.
  - The leads "city" uses saturated blocks.
  - Fog scales for the iso camera.
- **Still weak in both:**
  - ~27–28 s ("SO IF A…") is a ~1 s shot of empty field between the buyer leaving and the return to the phone.
  - The 0–9 s opener holds on the phone and clock with only the punch-in and clock motion.
- **Format ideas queued (not built):**
  - kinetic-type-only (2D, fast cuts)
  - 3D + real-footage hybrid (Hybrid template)
  - character-led POV ("you are the customer")
  - one continuous dolly shot with no stations
  - split-screen fast vs slow business

  Each would be tested on the same story/voice first.

## 2026-10-30 — BL #4 "The Empty Chair" (`studio/src/templates/NoShows3D.tsx`)
- One clinic diorama with an open front and three rooms (waiting room → reception → exam room). The villain narrator is an orange waiting-room chair with a face: `Chair` in `Props.tsx` with lid, brow, smile and look controls, plus a mouth that flaps while the captions are spoken. Moods per beat: smug, delighted at the money, nervous at the fix, then smug again.
- New kit props: `Person sit`, `Chair`, `WallClock`, `Mug` (looping steam).
- Beats:
  - The chair hops on "Hi".
  - 4 of 20 calendar slots flip to orange chairs (rnd-sorted).
  - 12 record boxes stack up.
  - A receipt prints "TOTAL ~$196".
  - The lamp switches on and steam rises on "room/coffee".
  - On "seat", a patient walks in and takes the chair. They leave again in the payoff, which restores the loop.
- QA: 38.3 s, −14.1 LUFS, no freezes over 1.5 s, layout lint clean, loop SSIM 0.971 (only the caption word differs). Whisper check: the voice says 18.8% and $196 as scripted.
- Lessons:
  - A spring that returns 0 before its start frame broke the loop: the chair was stretched at frame 0. Rest pose before the trigger must be the end pose.
  - The number plate (y500–790) covered the villain's face until I raised the framing. Check plate vs hero for every number beat.

## 2026-10-30 — BL #5 and #6
- **#5 `PageSpeed3D`:** a villain loading spinner (dark track, 8 teal dots, orange hub with `Face`) hovers over a giant phone that is a shop.
  - The spin speed profile is integrated and rescaled to a whole number of turns, so the loop is exact. It freezes on "stop" and goes faster while growing.
  - It grows over the shopper. A capsule thumb drifts to "< BACK". IMG, APPS and `</>` blocks hit it on "smaller/fewer/less" and it shrinks ×0.78 each time.
  - Kit: `Face` is now its own component (used by `Chair`).
- **#6 `Trades3D`:** cutaway living room with periodic drips that land in the bucket or on the floor. The phone is at the chest, then at the ear. An empty van's phone rings, then shows "Missed call / Voicemail". 4 phones, 1 off (`Phone off`). Plumber's legs under a sink. The "SAW YOUR CALL!" bubble pops.
- **Lessons:**
  - A ceiling slab casting shadows darkened the whole room; interior ceilings must not cast shadows.
  - Bubble text clipped, so `Bubble` now auto-sizes its font to the longest line.
  - A short scene (1 s "Voicemail") must not trigger a cross-world camera move, so keep it at the current station.

## 2026-10-30 — Funnel CTA (Nathan via the lead: "Nathan likes v2", add an on-screen CTA from #4 onward)
- `Cta` in `kit3d/LowPoly.tsx` (`CTA_TEXT = "Comment LEAK for a free check"`): an ink pill with LEAK in yellow, Montserrat 800 at 34 px, top 1376 (inside the hard box, just under the captions). It's on screen for the whole video, so the loop is unaffected.
- Added to `NoShows3D`, `PageSpeed3D`, `Trades3D` and `Reply3D`. Use it in every new template.
- Re-rendered #2 v2, #4, #5 and #6 with it. All pass: layout lint clean, −14 LUFS, no freezes, loops OK. Sent to Nathan. The lead has the paths for when Nathan approves.
- Later: a URL version once the website exists.

## 2026-10-30 — BL #7–#9
- **#7 `AgentReply3D`:**
  - The buyer's "STILL FOR SALE?" bubble flies to a REALTY shop while a clock on a post spins faster on "five point three".
  - 384 tiles, of which 184 turn red (48%), as in #3.
  - A cork board with the study and pins.
  - A city of 30 shops; one lights up with "REPLIED < 1 HOUR".
- **#8 and #9 live in `NoShows3D`.** The mode comes from the station names: `desk` means calls, `chair` means reminders.
  - Calls: OUT TO LUNCH card, sandwich, 3 desk phones (the middle one rings with waves, the right one goes dark), MISSED CALL chips pile up, a receptionist with a patient, one diary slot flips to an empty chair, and a "SORRY WE MISSED YOU! TAP TO REBOOK" bubble pops.
  - Reminders: the chair spins 360° on "Hi again", an envelope lands on the seat and slides off during the yawn, BEFORE/AFTER boards (bars 18.2 vs 17.0), a patient waits at a door then walks round to the chair on "slot", and the chair panics.
  - #4 checked unchanged with stills afterwards.
- **Fixes in the kit:**
  - `NumPlate` drops to 150 px and no-wrap for long numbers (over 8 characters).
  - `HookBar` draws "→" in Arial: Montserrat has no arrow glyph, and the fallback looked like "+", which changed the meaning.
- **Lessons:**
  - Remotion `interpolate` throws when a missing station (1e9) makes the range non-monotonic. Guard every multi-mode interpolate with the mode flag.
  - A 47 s script at a 40 s cap means a 1.28× voice. Ask the lead for a shorter script rather than speeding up again.
