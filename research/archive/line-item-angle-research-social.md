# Line Item: new-angle research (social / short-form)

Date: 2026-10-26. Researcher: research agent. Nothing in /Users/a1/Projects/GoViral was modified.

## 0. Read this first: how good is the evidence?

- **The Opus 5.5 "code-video wave" is mostly a developer-Twitter phenomenon, not a Reels/TikTok one.** I pulled public view counts via fxtwitter for 664 of the 703 posts in yihui-dev/awesome-opus5-5-videos (39 failed to load). Median post = ~600-1,000 X views. Only 4 of 664 passed 1M. 83% of the videos are 16:9; vertical posts had a LOWER median (426) than horizontal (837). Posters are mostly showing off "AI made this", to AI/dev followers. Treat it as a map of which SUBJECTS delight a general audience, not as proof of Reels performance.
- **Reels/TikTok-specific evidence is thin.** Reddit and X search were blocked/unauthenticated (opencli/twitter CLIs need cookies; Reddit returns "Blocked"). No IG/TikTok signed-in browsing was done, per instructions. Web search mostly returned vendor SEO blogs. Where a number comes from one of those, I mark it "vendor claim". I found no verifiable 90-day case study of a new faceless account breaking out with a code-rendered finance/explainer format. I did not invent one.
- Dataset reproducibility: stats at `/private/tmp/claude-501/-Users-a1-Projects-GoViral/ae507e69-6e91-441f-8779-db078e674f5c/scratchpad/stats.json` (views, likes, bookmarks per slug).

## 1. What the Opus 5.5 wave actually shows

Counts from the 703-entry videos.json (categories: motion 369, 3d 117, explainer 116, interactive 101; tech: canvas 267, svg 183, threejs 131, shader 92, gsap 86). Views are X views, pulled 2026-10-26.

**Breakouts (>1M):**

| Views | Likes / Bookmarks | Post | What it is |
|---|---|---|---|
| 20.2M | 16.5k / 13.9k | https://x.com/anabology/status/2103534482930491441 | Pop-song music video ("Claude Pop"), 5 min, 92k followers. Music-driven; not usable for us (no music). |
| 3.79M | 20.5k / 5.3k | https://x.com/milos_gis/status/2103751211040317580 | "Every French passenger train, on an ordinary Tuesday, from first departure to last." 48 s, 1200x1500 (4:5), light-theme map, animated vehicle dots from timetable data. 39k followers. The dataset lists a Portland-bus prompt for it; the tweet text is the French-trains version, so it is a repeatable series ("every X on an ordinary day"). |
| 1.18M | 8.4k / 5.2k | https://x.com/konstantinsaifo/status/2104094723887501736 | "How a rocket engine works": a Three.js Raptor 3 you can cut open, follow propellant through turbopumps, throttle. 35 s. Only 4.4k followers, so a true outsider breakout. Same author's fusion-reactor take-apart: 43k; warehouse-docks sim: 74k. |
| 1.18M | 12.7k / 21.1k | https://x.com/twoclipping/status/2103273003555402193 | A UI-morph loop: one shape becomes 8-12 UI states, last frame = first frame, 120 BPM. Loop + very high save rate (1.8% bookmarks/views). Needs a music track, so not usable as-is. |

**Next tier (50k-460k):** pixel-art wizard (460k, majidmanzarpour), deedydas "slick startup video" (352k), UX-decisions animation (209k), Transformer explainer in Chinese (193k), 1906 San Francisco Market Street 3D (165k), "sand animation: 250 years of US history" (78k, https://x.com/Michaelzsguo/status/2102592355165782312), Ror_Fly cocktail recipe step-by-step (80k, 1.8% save rate), "construction process of a house, X-ray view" (68k), "smartphone to atom" zoom (73k, VictorTaelin), evolution-of-the-eye explainer (53k).

**Median views by subject (regex over prompts; X views):**

| Subject | n | Median | p90 | >100k |
|---|---|---|---|---|
| map / transit / geo | 70 | 1,805 | 53.8k | 6 |
| physics sim / satisfying | 61 | 1,713 | 53.8k | 5 |
| scale / zoom / atoms / size | 68 | 1,685 | 98k | 6 |
| history / timeline | 42 | 1,272 | 53k | 3 |
| how-it-works / take-apart | 103 | 1,235 | 53.8k | 8 |
| money / stocks / data | 56 | 1,220 | 33k | 4 |
| game / interactive | 53 | 980 | 30k | 0 |
| product launch / showreel | 153 | 865 | 33k | 5 |

Takeaways:
1. The most saturated subtype, "motion-designer showreel / product launch film" (153 of 664 = 23%), is the WORST performer (median 865, none above 1M). Anything that looks like a generic AI motion-design reel is a commodity.
2. What beats the baseline: maps with moving real-world data, physical/scale/zoom stuff, and "take it apart" mechanics. They are visual, wordless, true, and self-explanatory in the first frame.
3. Length: <15 s median 939; 15-30 s 803; 30-60 s 594; 60-120 s 951; the two biggest hits are 35-48 s. No clean signal; the winners hold because every second shows a NEW fact, not because of duration.
4. Save signal: top bookmark-to-view ratios (1.5-2.7%) are on reusable templates/prompts, but among pure content the "step-by-step process" (cocktail recipe, Ror_Fly) and "map of everything" posts save well. Bookmarks/views on the Portland/French train post: 0.14%, likes 0.54%; on Raptor: 0.44% / 0.71%.
5. Counter-evidence for our own pick: "Drop every country's population as marbles, 1 marble = 1M people" (https://x.com/rneayan/status/2103400657856417829) got 51 views from a 23-follower account. Idea alone is not enough; execution and distribution matter. "Point Nemo data animation" got 83 views. Many small-account posts flat-lined; breakouts came from accounts that already had an audience, except Raptor.

## 2. Platform-level evidence (Reels/TikTok), with quality grades

- **Originality enforcement (medium-quality, blogs citing Meta):** Reported that Instagram's originality enforcement extends to photos/carousels since 2026-04-30 and that accounts posting mostly unoriginal content are dropped from recommendation surfaces; Mosseri talks of account-level trust signals. Source: https://www.socialpilot.co/?p=563048 and https://www.famouscampaigns.com/2026/01/10-hard-truths-about-instagram-in-2026/. One guide claims AI voiceover over recycled footage is suppressed (https://www.argil.ai/blog/faceless-reels-7-methods-to-create-viral-content-without-showing-your-face, vendor). Hypothesis worth considering: Line Item's templated "AI VO over motion graphics, same layout every post" may look like low-originality mass output to ranking. Not proven.
- **Highviz Reels report (Aug 2026, 346 Reels from 108 accounts, frame-by-frame, small sample):** <15 s Reels keep 66.0% of their length vs 22.1% for 30-60 s and 16.4% for >60 s. Faceless vs face: no real difference (7.8% vs 6.9% engagement per view; 38.3% vs 38.4% watch ratio). Silent/music-only had lowest engagement per view (3.3%) but highest watch ratio (48.4%). Top 10% of Reels had LOWER human presence. https://www.highviz.io/instagram-reels-report/
- **Socialinsider (about 6M Reels, Jan-Jun 2026, secondary write-ups):** 30-60 s has best reach rate (5.6%) and 45-60 s the best median views. Disagrees with Highviz on length; interpretation: short for completion/replays, 30-60 s for reach when content truly holds. https://www.socialinsider.io/blog/instagram-reels-statistics/
- **Lightreel weekly report, Oct 17-24 2026 (vendor, unclear methods):** "Proof Reels" (6-18 s; one claim resolved visually in the same breath) is its #1 format; a faceless/no-VO meal-prep account (@nicks.ev0) is cited as working on a time-cost hook ("2 hours out of your week"). @biancawakesup went from 456 followers to ~1.4M views on one video (43-48 s beat 35-37 s). @ecoamyb 138 to ~520K views after an environmental hook. Report itself warns some high reach had weak interaction (boosting). https://lightreel.ai/blogs/whats-trending-on-instagram
- **Drawly faceless network (vendor/self-reported, Oct-Nov 2025, so older than 90 days):** 55 faceless accounts, ~122M views since July 2025 with a single screen-recorded visual (tablet + pen). Hooks that worked were drama-with-a-stranger, wordless. Shows "one visual idea, repeated across 55 accounts and 3 platforms" scales, and that instantly legible, language-free visuals travel. https://www.socialgrowthengineers.com/141-million-views-one-faceless-format
- **TikTok single-visual example (Aug 2026, newsletter):** An AI-visual TikTok account with no face hit 5.8M views on one post ("body scan" visual), and a "foods you should never put in the fridge" post 5.1M. Utility/health curiosity beats polish. https://weekly.joebuildsai.com/p/an-ai-account-with-no-camera-just-hit-5-8-million-views
- **Scale comparison on TikTok:** discovery pages show "Scale of the Universe" clips at 218.7K likes (@space35254) and "Universe Size Comparison in 8 Minutes" 337.2K likes (@plot.spills). Evidence that scale content has deep demand, but also that it is a mature, saturated category. https://www.tiktok.com/discover/scale-of-the-universe (fetching the page itself returned nothing; the likes came from search snippets).
- **Money-visualization precedent:** Humphrey Yang's 2020 rice-grain "what $1 billion looks like" TikTok (1 grain = $100k, then Bezos' wealth weighed out; 500k+ views, big comment fight). https://www.buzzfeednews.com/article/tanyachen/tiktok-jeff-bezos-wealth-rice-grains-video . "$1 per second" is a recurring TikTok topic; mature.
- **Satisfying physics sims:** Blender accounts such as @renderx20 (one soft-body clip 182.4K likes) and @mr.render23 (a compilation 326.7K likes). Also several off-the-shelf "ball physics TikTok" generators exist (viralballs.com, balltok.app), so the pure bouncing-ball variant is a commodity. https://www.tiktok.com/discover/physics-simulation-satisfying-video
- **Trial Reels:** reach goes to non-followers; a Kapwing test saw 2.4x views on a trend-based reel as Trial vs regular, but no extra engagement. Useful as a free distribution test for new angles. https://kapwing.com/resources/instagram-trial-reels-study-what-we-learned-after-a-trial-reel-hit-1-million-views
- **Finance on Reels (vendor):** specific math, receipts and named numbers in the first ~1.5 s; animated pie breakdowns with dollar amounts reportedly saved at ~3x talking-head finance (unverified). https://creatorhouse.app/blog/instagram-reel-hooks-money-finance-2026 , https://flowshorts.app/instagram-reels-ideas/finance
- **YouTube Shorts 3D "what happens when" (third-party blogs):** Zack D. Films has 23 Shorts above 100M views per one tracker (trackers disagree). Narrated, unsettling 3D. Format is saturated by one giant. https://vidiq.com/youtube-stats/channel/@zackdfilms/

## 3. Candidate angles

Fit = 1-5 for Line Item (money / prices / costs / how things work) and for our production stack (no on-camera, AI/no voice, code-rendered, stock, PD archive, no music, true).

### A. "Money made physical" (unit-scale visualisation with physics)
- **Evidence:** Rice-grain-billion TikTok (2020, 500k+ views); TikTok "$1 per second" pages; scale-of-universe clips at 219k-337k likes on TikTok; dataset subject "scale/zoom" median 1,685, p90 98k, 3 of 4 >1M-ish adjacent posts (zoom/scale). Counterweight: the marbles-population post got 51 views from a nobody; format is mature, so the DIFFERENTIATOR must be the data and polish.
- **Pattern:** Hook (0-2 s): a single object and a unit label, e.g. "1 marble = $1 billion" with first marble dropping, no title card. 15-30 s. Marbles/coins/bricks fall into labelled bins, physics sim (Rapier/Matter) with SFX per impact (clink density tied to value), counter ticks. Final beat: biggest bin overflows the frame (scale reveal). Loop by cutting to the empty jar. VO optional; big kinetic numbers carry it. 9:16 or 4:5.
- **Why shared/saved:** Instant "wait, what" comparisons, argument-starting (comments), cheap to send to a friend ("look how small X is vs Y"), saves as a reference.
- **Saturation:** medium-high for generic billionaire/$1-per-second. Low for specific, newsy budget/price comparisons.
- **Fit: 5.** Native to "Line Item". All code (Three.js/Matter), no footage, SFX allowed, no music needed.

### B. "Every X on an ordinary day" (real-data movement maps)
- **Evidence:** milos_gis French trains 3.79M views / 20.5k likes / 5.3k saves; map/geo subject median 1,805 (highest). Same posting account series style; transit data is public (GTFS), so it is cheap to repeat. Other promising: Gofy "live map of everything" (31k).
- **Pattern:** Hook: blank light map, then dots appear at first departure ("04:30") and the whole country fills; clock in the corner; 45-50 s; no VO; ends on the last service going dark ("00:50"). Light theme, 4:5. Rewatch via a "peak hour" moment people want to see again.
- **Why shared/saved:** People send it for THEIR region ("that's my train"), geo pride, "how many!"; the saves are for maps people want to look at again.
- **Saturation:** low on Reels. Big on X for a week. Needs real data work.
- **Fit: 4 for money framing** (flows of goods/cash/shipping, "what ships when"), 3 for strict "Line Item". Data sources: GTFS feeds, NOAA/BOEM MarineCadastre AIS, OpenSky ADS-B.

### C. Take-apart / cutaway "how it works"
- **Evidence:** Raptor 1.18M on a 4.4k-follower account; fusion 43k; mechanical keyboard 2.2k; heart/turbofan/camera-lens variants 5k-50k; 103 posts in category, 8 over 100k. YouTube Shorts: Zack D. (saturated, narrated). Cocktail recipe step-by-step 80k, with 1.8% save rate.
- **Pattern:** Hook: a familiar object (card, ATM, vending machine) in clean 3D; "cut" along a plane within 1 s; labelled flow line (current, cash, data) animated through components; 30-40 s; SFX; rewatch via "I missed which step" overlay numbering.
- **Why shared/saved:** "Now I understand X"; the numbered step overlay invites saving.
- **Saturation:** medium (Kurzgesagt-like and Zack D.), but fewer "how money moves" versions.
- **Fit: 4.** Extremely on-brand for "how things work"; heavier build (Three.js models).

### D. Proof Reel / one claim, resolved visually (6-18 s)
- **Evidence:** Lightreel Oct 2026 #1 format; @nicks.ev0 (faceless, no VO, time-cost hook); Highviz: <15 s watch ratio 66%; faceless = same engagement.
- **Pattern:** Text claim ("This subscription costs $X over 10 years") then a 5-10 s animation computing it (stack of bills / receipts building), end on the total, hard loop to the claim. No VO.
- **Why:** Short enough to rewatch, one number to quote; sends per reach good for numbers people argue about.
- **Saturation:** high in general, low for rigorously sourced cost math.
- **Fit: 5** (it is the current brand, tightened). Cheap to test, since it only changes format, not production stack.

### E. Dated timeline "years that changed X" (kinetic type + SVG line draw)
- **Evidence:** US-history sand animation 78k; Google 1996-2015 timeline (Remotion, JP post); AI-history videos are everywhere (saturated); money history "Can't print the proof" 18.5k (Bitcoin block data) on X.
- **Pattern:** Years slam in with a counter; line draws; 15-30 s.
- **Saturation:** high (AI-history especially). **Fit: 3.**

### F. Public-domain 1950s archive film + modern number overlay
- **Evidence:** weak. Only blog-level claims that human-edited PD collage with original research survives while "recycled clips with quote overlays" is saturated (https://www.viibeo.com/blog/best-faceless-video-ideas-for-tiktok-and-reels-in-2026 , Argil). Prelinger licensing is mixed: roughly 65% PD per Public Domain Review; check each item (https://publicdomainreview.org/collections/source/prelinger-archives/). TikTok 1950 tags exist but no numbers.
- **Pattern:** 1950s ad ("a car for $1,800") then real price data overlay, "in 2026 dollars". Fits tone, cheap. **Fit: 3-4**, but unproven and high copyright diligence. Good as a texture/B-roll layer for A or D rather than a standalone angle.

### G. "Satisfying" generic physics sims (sand, marbles, balls)
- **Evidence:** dataset subject median 1,713; Blender TikTok clips with 180k-330k likes; generators exist. **Saturation: very high** (tooling for it is sold). **Fit: 2** on its own; useful only as the engine of A.

### H. AI motion-designer showreel / product launch film (what NOT to do)
- Evidence: 153 posts, median 865, 0 above 1M; the viral ones were on big developer accounts with an audience. Not a Reels format, no reason to share. **Fit: 1.**

## 4. Ranking

1. **A + D combined: "Money made physical" in short proof-style Reels.** Best fit with brand, zero new tooling beyond physics, tests well against the baseline because the first frame is a single object and a number. Honest probability caveat: no verifiable new-account Reels breakout in the last 90 days found for this exact format; the evidence is precedent (2020 rice video), mature TikTok demand, and Opus-wave subject medians.
2. **B. "Every X on an ordinary day" data-flow maps.** Highest actual outlier in the whole wave (3.79M, general-interest, wordless). Works only if the data is real and the subject is local/relatable. For Line Item, choose flows of goods/money.
3. **C. Take-apart "how money things work".** Strong dataset breakouts (Raptor 1.18M from a 4.4k account); heavier build. Do after A/B validate.

Recommended test plan (suggestion, not a mandate): post 6 videos of A/D and 3 of B as Trial Reels on IG first, compare watch time and sends against the ~140-view baseline, keep only the format that clears 1k-3k views on a non-follower basis. Drop AI VO on these; use on-screen numbers and SFX. Vary layout between posts so the account does not read as templated.

## 5. Concrete video ideas (factually checkable)

### Angle A: Money made physical

**A1. "$1 per second" clock, with the federal budget as the measuring stick**
- Premise (pure arithmetic): at $1/second, $1,000,000 takes 11.57 days (1,000,000 / 86,400), $1 billion takes 31.7 years (1e9 / 31,536,000), $1 trillion takes 31,709 years. Visual: a jar filling with marbles, 1 marble = $1M, calendar flipping; the counter reaches $1B at 31.7 years on the calendar and $1T at 31,709 years. Hook line (text only): "$1 every second. When are you a billionaire?" Answer in the final second: "31.7 years."
- Checks: arithmetic only; add the line "ignores interest and leap years" in small text. Differentiator against the saturated version: optional closer: take the latest full-year federal deficit from the Treasury Monthly Treasury Statement (fiscal.treasury.gov) and show how many years of $1/second it equals (deficit / 31,536,000). Compute at build time; do not use a remembered number. Pull the FY2026 or FY2025 number from Treasury and double-check against CBO. Format: 20-25 s, 4:5, SFX clinks, no VO, loop to empty jar.

**A2. "1 marble = $1 billion: where $X trillion of federal spending lands"**
- Premise: use the latest Treasury Monthly Treasury Statement for a closed fiscal year (FY2025 closed 2025-09-30; total outlays about $7T per press reports; VERIFY exact figures and category splits at https://fiscal.treasury.gov/reports-statements/mts/ before scripting). Marbles pour into 5 bins by function (Social Security, Medicare/health, defense, net interest, everything else). Bins' relative heights are the reveal; net interest bin vs defense bin comparison is the "wait, what" beat if the data supports it (check it, do not assume). 25-30 s.
- Checks: every bin total must equal the MTS figure within rounding; show source line at the end ("Treasury MTS, FY2025"); round to nearest $10B.

### Angle B: Every X on an ordinary day

**B1. "Every container ship in the Ports of Los Angeles and Long Beach, on an ordinary Tuesday"**
- Data: NOAA/BOEM MarineCadastre AIS, public-domain US vessel tracks (https://marinecadastre.gov/ais/). Pick one ordinary Tuesday from the latest full year (avoid holidays and strike days). Dots move across a light coastal map; clock in the corner; each arrival adds the vessel's declared TEU capacity (from vessel registry) to a running counter; end card shows total arrivals and the ports' published annual TEU volume divided by 365 for context (ports publish annual stats; confirm figure at portoflosangeles.org / polb.com). 40-48 s, 4:5, no VO, SFX only for a soft tick per arrival.
- Checks: count arrivals directly from the AIS file (vessel type code 70-79, cargo, within port geofence); state the date on screen; if data cannot be verified to be a "random" day say "a Tuesday in March 2025".

Not suggested: any "day of payments" map; no public per-transaction data exists, so it would be invented.

### Angle C (one line each, not required)
- "What happens inside when you tap a card": a 3D cutaway following an authorisation through acquirer, network, issuer; every step timed to published latencies only if sourced (Visa/Mastercard documentation); otherwise omit numbers.

## 6. Open risks and what I could not verify
- No Reels/TikTok view counts for any Opus-5.5-style code-rendered video were found; all wave counts are X views among AI-interested audiences.
- Vendor blogs (Lightreel, Argil, SocialPilot, Highviz, Flowshorts) have commercial interests; Highviz is the most methodologically transparent but is a small sample.
- Sub-90-day breakout accounts on Reels/TikTok in money/explainer niches could not be confirmed because IG/TikTok were off-limits and X/Reddit search required login.
- Treasury and port numbers in the ideas are placeholders to be pulled and double-checked at build time; arithmetic in A1 is exact.
