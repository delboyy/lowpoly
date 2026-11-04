# Line Item style v3: "Footage" (PILOT, not approved; 2026-10-23)

**Why:** the receipt-world style (beige paper, code-drawn cards) gets a flat ~140 IG views whatever the topic. Winners in our research are full-bleed, cut every ~1–2 s, with the claim at t=0. Inputs: Nathan's 3 X posts (Ernesto: copy proven viral formats, volume; seeconvm: a long brief, a visual reference, springs, contact-sheet critic loop; Elliot: free archive.org Prelinger footage).

**Rules**
1. Full-bleed real footage only: Pexels/Pixabay modern stock plus 1940s–60s Prelinger colour film (public domain, logged in assets/LICENSES.md). No beige cards.
2. A hard cut every 0.8–2 s. Never hold one shot over 2 s.
3. A slim hook bar at the top for the whole clip: a curiosity gap that's true.
4. Number punches: a yellow plate that springs in on the spoken number, with a one-line label. Max 4 per Short (RULES K).
5. Hormozi captions at 70% height. Small "LINE ITEM" mark bottom right.
6. SFX only on number punches plus one whoosh at frame 0. No music.
7. No other brands' logos in footage (a Turkish Airlines tail was cut from the Delta pilot).
8. Critic loop: a 1 fps contact sheet after every render; fix blurry or off-topic shots and any hold over 2 s.

**Tooling:** `studio/src/templates/Footage.tsx` (composition `Footage`, `template: "footage"` in make.mjs). Shots: `{media, start, archival, num, numLabel}`. Script: `studio/samples/v3/<slug>.json`.

# Variant C: "Morph" (PILOT, code-only; 2026-10-23)
One container morphs through a state list for the whole story: card → bars → "?" → card + miles particles → 13% ring → $10B target → boarding pass → flips back to the card (the last frame matches the first, so it loops). Dark navy grid, yellow highlight, closed-form springs, SFX on number hits and morphs only. Every frame is a pure function of time (seeconvm). Tooling: `studio/src/templates/Morph.tsx` (`template: "morph"`; scenes `{vo, state, num, label, numB, labelB, pct, at}`). States are Delta-specific for now; each new story needs its own state list.
Critic fixes: the number overlapped the card chip, so the card details now fade when the number lands.

# Variant D: "3D" (PILOT, Three.js; 2026-10-23)
Three.js via @remotion/three (installed in studio: @remotion/three 4.0.536, three 0.170.0, @react-three/fiber 9.1.2). One camera that never cuts glides between stations on a track: metal card → 3D columns ($8.2B vs $6.2B) → plane with gold miles streaming from the card → 13% torus → $10B glass target → boarding pass that flips into the card (loops to the opening). Inspiration: Nathan's repo yihui-dev/awesome-opus5-5-videos (703 prompts; the 3D winners use one continuous camera move with sound on the beat). Tooling: `studio/src/templates/Delta3D.tsx` (`template: "delta3d"`), currently Delta-specific; a generic station engine comes next if this style wins.
Critic fixes: the vertical frame needs the camera ~10.5 units back at fov 42 or objects overflow; brightened the card; turned the plane 3/4 so the wings show; started the ring at 12 o'clock; made the target a glass box.

# HYBRID (Nathan's direction 2026-10-23: "a mix of all effects into one")
`studio/src/templates/Hybrid.tsx` (`template: "hybrid"`). It's the 3D camera journey (Delta3D) as the base layer. Any scene can open with real footage (`footage: [shots]`, `footageFrac` = share of the scene) that cuts into 3D with a 3-frame white flash and a whoosh. Number punches land on the spoken word over either layer; there's a 2D "?" pulse, a slim hook bar and Hormozi captions.
Delta recipe: 1950s couple → real card tap → 3D card + $8.2B | 3D bars | 1950s ticket counter + "?" | real card swipe → 3D plane + miles | 1950s airliner → 3D 13% ring | 1950s businessman → 3D $10B target | real cabin → 3D boarding pass | flip to card (loop).
Critic rule: never more than ~4 s of pure 3D without a cut or footage beat.
