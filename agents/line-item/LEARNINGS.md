# line-item: LEARNINGS (dated; newest first)

- **2026-10-28, Nathan:** "audit the scripts; make the end of the video connect to the start so it looks like it loops; do this for the next ones; send me the ones you make." Every video loops in both voice and picture, and every render is sent to him.

- **2026-10-28, FIRST WIN:** the low-poly penny story got 1,685 IG views in ~14 h (the old format's floor was 109–161). Nathan: "its done the best so far". Same format next: hook-first true money story, low-poly, a loop ending.

- **2026-10-27, Revenue Analyst:** Nathan is in the UAE, so IG Gifts/bonuses and TikTok Creator Rewards are NOT available: IG and TikTok are traffic only. Money = YouTube (YPP: apply before 2027-01-31) + sponsors + a digital product/affiliate (no credit/investing/crypto sponsors). Keep Shorts at 30-40 s; weekly long-form compilations only after 3 Shorts pass 500k. Plan: research/line-item-revenue-plan.md.

- **2026-10-27, Nathan:** "The penny idea is way better. I like the low-poly play and format, and the script is actually engaging and hooks the user; that's what I mean: good hooks and scripts." The Big Mac map was less liked, so it's on hold. Every new video is a low-poly story with a strong hook and an engaging story arc.

- **2026-10-26, map format:** the PM caps it at ≤6 stops and ≤2 figures on screen at once (no leaderboards). QA fails any hold over 2 s, so a parked 3D camera must orbit or dolly. make.mjs overwrites sources.txt and caption.txt on every render, so rewrite them after each render.

- **2026-10-26, Nathan:** "change our angle: the video ideas aren't working or getting views." ~13 IG posts all landed 109-161 views whatever the topic or style, so the angle and format are the problem, not the topic choice. Research a new angle with data before building.

- **2026-10-26, Nathan:** "why none today?" Never leave a day without a Line Item post on IG when one is ready; keep IG scheduled at least 2 days ahead so a session gap can't empty a day.

- **2026-10-26, QA ve-v30:** food stock carries brand print (a "HOT CHICK'N" wrapper), clothing marks ("92°") and partial chain signs. Sweep every food, uniform and signage shot at full res. Comparisons on different bases must say "more than twice" and label the bases on the plates. Every spoken number counts toward the cap of 4.

- **2026-10-23, Asset QA ve-v26:** stock card close-ups carry network logos (Mastercard) and archival film has airline signs (Western Air Lines), so do a logo sweep on every footage shot. The hook bar must sit at y ≥ 280 (top UI zone). A hook must be literally true: "biggest payer" was false (passenger revenue $51.8B > Amex $8.2B).

- **2026-10-23, Nathan:** liked the code-built version, then asked for Three.js and then for a hybrid that blends every effect (real and archival footage, 3D camera journey, number punches, 2D morph). Inspiration repo: github.com/yihui-dev/awesome-opus5-5-videos.

- **2026-10-23, Nathan:** the receipt-world videos "are not working at all": improve the editing and style. Use his X posts (Ernesto 6,000 videos a month: copy proven viral formats and amplify; seeconvm Opus motion design: a long brief, a reference style, springs, critic loop; Elliot: archive.org Prelinger footage). The pilot style is in STYLE-V3.md. We need new scripts, either my own or from a researched Script Writer.

- **2026-10-22, Asset QA (RUBRIC K/B1/B8):** **max 4 featured figures per Short** (every number shown on screen counts, bars too). Open on a hero plate (one big number), never a small chart. Never let a new spoken number play over the previous number's stamp. Say units out loud ("eleven cents", not "eleven"). Avoid loose comparisons like "similar" for 36 vs 42.

- **2026-10-22, making:** `batch-shorts.sh` always adds `--stock` b-roll, which can attach off-topic clips (a gas station on Apple). For non-retail topics run from-props without `--stock`, then make.mjs. The `dots` scene breaks the caption safe zone, so use bignum. Bars take `unit`, not `suffix`. Check the whisper transcript against the facts: "ticket sales grew 2%" was really passenger revenue.

- **2026-10-22, Nathan:** restart Line Item TikTok at **max 1 post a day** (in RULES.md rule 14). Never repost a video on an account where it has already run.

- **2026-10-22, Nathan:** he uploads YouTube by hand (no Postiz for Line Item YT). The Ireland long-form ep01 was already uploaded and had a poor start; get its CTR/AVD before planning ep02.

- **2026-10-22, inherited data:** IG Shorts sit flat at 109-161 views each (7 of 8; first post Costco got 3). No likes beyond 0-2. Looks like a non-follower floor: topic doesn't move it, so the hook/format or account trust is the bottleneck, not topic choice.
- **2026-10-22, TikTok:** suppressed from post 1 (median 2 views, 8 posts). Likely new account + API posting + AI label + TTS faceless. Stopped.
- **2026-10-22, YouTube:** nothing ever posted (Line Item YT not connected to Postiz, 5-channel cap). Zero data on our best-fit platform.
- **2026-10-17 (Retention Researcher):** our Shorts state the point at 44-52% of runtime vs 0-4 s for winners; 1.7-2.3 words/s vs 3.6; 0.5-0.8 hard cuts/10 s vs ~4.3; static holds 6-12 s. Targets are starting points until our own data.
- **2026-10-17 (Niche red team):** generic "How X makes money" long-form is the most-cloned format (53% of new uploads <1k views). Money x Places lens (Geography Effect model) is open. Winners' first 50k video came at upload #7-17.
- **2026-10-17 (thumbnails):** small-channel outliers use ~2 words of text, one hero object/map, thumbnail doesn't repeat the title.
