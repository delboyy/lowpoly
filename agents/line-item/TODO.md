# Line Item: TODO for Nathan

Line Item's to-dos, moved from the root TODO.md on 2026-10-22. Owner: the Line Item chat (agents/line-item/).
Format: `- [ ] <what> — <why> — <cost/effort> (added YYYY-MM-DD)`. Nathan ticks items off.

## Listening and brand checks (from Nathan / PM)
- [ ] **Listen before posting (agents can't hear):** Ireland ep at `longform/ep01-ireland-data-centres/render/` around 3:15, 5:06, 7:26 and 7:42; the cash-protection Short (how 'SIPC' is said) and the UPS Short's fuel line, in `qa/inbox/ve-v17/` and `ve-v18/`. Note anything off in `qa/LISTEN-NOTES.md`. About 5 min (added 2026-10-17)
- [ ] **Listen test (agents can't hear audio):** play `assets/sfx-candidates/` (16 Kenney SFX, then the Freesound ones when they land) and the room-tone loops in `assets/sfx/`. Note any that sound wrong, too loud or fake in `assets/sfx-candidates/LISTEN.md`. — 5 min (added 2026-10-17)
- [ ] Run a trademark search for "Line Item" (USPTO, UK IPO, EUIPO) — before we brand anything — 15 min (added 2026-10-17)
- [ ] Check @lineitemfyi in Instagram's own sign-up or username box — the agent's check was done logged out — 2 min (added 2026-10-17)
- [ ] Create the accounts only once the system works: IG, TikTok and YouTube as Line Item, plus clipping accounts — Nathan's call on timing (added 2026-10-17)

## Video and audio (from Video Editor)
- [ ] Audition the real SFX candidates: open `assets/sfx-candidates/AUDITION.html` in a browser, play each against the synth, pick one per cue, press "Make picks.json", save it as `assets/sfx-candidates/picks.json`, then run `node assets/sfx-candidates/promote.mjs` (backs up the synths) — neither I nor the Asset Builder can listen, and the SFX are the only audio besides the voice now that there is no music — about 10 min, free (CC0) (added 2026-10-17)
- [x] Fish key saved to project `.env` (2026-10-17). Keys for every agent go in `/Users/a1/Projects/GoViral/.env`, never in chat. Send the Video Editor your chosen voice reference_id.
- [x] (done 2026-10-17, key in .env) Get a free Pexels API key (pexels.com/api, needs a login) and add `PEXELS_API_KEY=...` to the project `.env` — Pexels blocks scripted downloads (403) so without a key I can't fetch stock b-roll; the licence is free for commercial use and I'll log each clip — free, 5 min (added 2026-10-17)
- [ ] Download 2 background-music loops by hand from pixabay.com/music (instrumental, 90-110 BPM, "Content Licence" shown on the page) into `assets/bgm/` and tell me the track URLs — our BGM loops are basic synths and Pixabay blocks scripted downloads; real music matters before episode 1 — free, 10 min (added 2026-10-17)
- [ ] Sign in to HeyGen (`heygen auth login --oauth`) or give an ElevenLabs key — better voices than local Kokoro; HeyGen also returns word timestamps — free allowance / paid beyond it (added 2026-10-17)
- [ ] Optional: a paid music subscription (Epidemic Sound or Artlist, about $10-20/month) — one safe, monetisable library for BGM across all lanes; only if the free Pixabay tracks aren't good enough; needs Nathan's purchase and his licence read — $10-20/month (added 2026-10-17)

## Long-form
- [ ] Optional: YouTube Studio screenshots for the Hermes channels (impressions, CTR, AVD, retention) — only if you want the audit finished; the new channel doesn't depend on it (added 2026-10-17)

## Money and accounts (from Revenue Analyst)
- [ ] **When the Line Item TikTok account exists: keep it a Personal account (never switch to Business)**, and after sign-up open Creator tools to see whether Creator Rewards is listed for the UK. TikTok's own help pages would not load for me — free, 2 min (added 2026-10-17)
- [ ] YouTube Studio → Earn → **"Get notified"** for the Line Item channel, and set up AdSense when prompted (Google may post a PIN to your UK address, so allow ~2 weeks) — free, 10 min (added 2026-10-17)
- [ ] Instagram: set the account to Creator/Professional on day 1; add a payout account when Gifts appears at 500 followers — free, 5 min (added 2026-10-17)
- [ ] **Decide the store and newsletter tools:** beehiiv free plan for the newsletter, and Payhip or Gumroad (merchant of record handles UK/EU VAT; Gumroad ~10% + $0.50 per sale). Signing up needs your login — free (added 2026-10-17)
- [ ] **Decide: no affiliate links on credit, loans, investing or crypto products** (FCA financial-promotion risk, FG24/1). Recommended yes; applies to the two ranking scripts — 1 min (added 2026-10-17)
- [ ] Ask an accountant (or read gov.uk) about HMRC: sole-trader registration and the £1,000 trading allowance, before the first payout — free to 1 hour (added 2026-10-17)
- [ ] Optional: Amazon Associates UK for book links (UK terms unverified; needs qualifying sales within 180 days) — free, 15 min (added 2026-10-17)

## Assets (from Asset Builder)
- [ ] **Download 6 music tracks by hand (5 min)** — Pixabay has no music API and blocks scripted music pages, so these must be clicked. For each link: open it (free Pixabay login if asked), press **Free download**, save into `/Users/a1/Projects/GoViral/assets/bgm/` with the exact name shown. I excluded Pixabay's "AI generated" tracks but have **not heard any**; the Video Editor picks by ear, so tell it when done. (added 2026-10-17)
  1. https://pixabay.com/music/ambient-documentary-calm-603945/ → `pixabay-documentary-calm.mp3`
  2. https://pixabay.com/music/modern-classical-science-documentary-594955/ → `pixabay-science-documentary.mp3`
  3. https://pixabay.com/music/corporate-explainer-explainer-music-576633/ → `pixabay-explainer-atlas.mp3`
  4. https://pixabay.com/music/beats-chill-hip-hop-298922/ → `pixabay-chill-hip-hop.mp3`
  5. https://pixabay.com/music/lofi-lofi-instrumental-586096/ → `pixabay-lofi-instrumental.mp3`
  6. https://pixabay.com/music/corporate-corporate-explainer-616325/ → `pixabay-corporate-explainer.mp3`
  (backups in `assets/bgm/PIXABAY-SHORTLIST.md`; add a licence row there after each download)
- [ ] **Credit lines in post descriptions**: Unsplash requires crediting the photographer (Pexels asks courteously). Paste the lines from `assets/stock/credits/<story>.txt` into each video's description — 1 min per post (added 2026-10-17)
- [ ] Decision on Unsplash: its API guidelines say to hotlink image URLs and apply for production status; we download once for offline rendering and call the download endpoint. Fine for a few photos (2 used); if Unsplash becomes a main source, apply for production status or drop it (added 2026-10-17)
- [x] ~~Real SFX, Freesound key~~ — added by Nathan; `assets/stock.mjs sfx-search|sfx-fetch` is live (CC0 filter) and 22 Freesound candidates are in `assets/sfx-candidates/` (see its README); the Video Editor/QA audition them against the synth versions (done 2026-10-17)
- [ ] **Real SFX, Pixabay hand-download (10 min)** — no API. Open each page (free Pixabay login if asked), press **Free download**, save into `/Users/a1/Projects/GoViral/assets/sfx-candidates/` with the exact name; then tell the Asset Builder and it will log licences and normalise. Many of these are Freesound uploads relicensed by Pixabay; I checked that none are tagged "AI generated", but have not heard them (added 2026-10-17):
  1. Receipt printer: https://pixabay.com/sound-effects/technology-receipt-printer-01-43872/ → `pixabay-receipt-printer-01.mp3`
  2. Epson receipt printer: https://pixabay.com/sound-effects/technology-057941-epson-receipt-printer5-82477/ → `pixabay-receipt-printer-epson.mp3`
  3. Stamp: https://pixabay.com/sound-effects/film-special-effects-stamp-81635/ → `pixabay-stamp.mp3`
  4. Traditional stamp: https://pixabay.com/sound-effects/film-special-effects-traditional-stamp-44189/ → `pixabay-stamp-traditional.mp3`
  5. Tear paper: https://pixabay.com/sound-effects/film-special-effects-tear-paper-103161/ → `pixabay-tear-paper.mp3`
  6. Tear a paper: https://pixabay.com/sound-effects/film-special-effects-tear-a-paper-328149/ → `pixabay-tear-a-paper.mp3`
  7. Hand lettering with marker pen: https://pixabay.com/sound-effects/film-special-effects-hand-lettering-with-marker-pen-345733/ → `pixabay-marker-pen.mp3`
  8. Marker lines: https://pixabay.com/sound-effects/household-marker-lineswav-14823/ → `pixabay-marker-lines.mp3`
  9. Cash register (kaching): https://pixabay.com/sound-effects/film-special-effects-cash-register-kaching-sound-effect-125042/ → `pixabay-cash-register-kaching.mp3`
  10. Cash register open ding: https://pixabay.com/sound-effects/film-special-effects-cash-register-open-ding-559401/ → `pixabay-cash-register-ding.mp3`
  11. Coin drop: https://pixabay.com/sound-effects/film-special-effects-coin-drop-229314/ → `pixabay-coin-drop.mp3`
  12. Thin swoosh: https://pixabay.com/sound-effects/film-special-effects-thin-swoosh-352756/ → `pixabay-swoosh-thin.mp3`
  13. Slow swoosh: https://pixabay.com/sound-effects/film-special-effects-slow-swoosh-567191/ → `pixabay-swoosh-slow.mp3`
  14. Paper slide (short): https://pixabay.com/sound-effects/film-special-effects-paper-slide-short-478835/ → `pixabay-paper-slide-short.mp3`
- [ ] **Decision: Sonniss GDC game-audio bundle** (royalty-free, very large: several GB per year's bundle; I could not verify the current size, so check the download page before starting). I will not download anything big without your OK; the Kenney + Pixabay + Freesound sources above likely cover our needs, so recommendation: skip unless they fall short (added 2026-10-17)
- [ ] Optional: Storyblocks or Envato Elements subscription (about $15-30/month; check current price) — one licensed library of real footage and music if Pexels/Pixabay prove too generic or Content ID claims appear; needs your licence read and purchase — $15-30/month (added 2026-10-17)
- [ ] Optional: Mixkit (free, no key; licence differs per clip, so each needs a check) as another source for footage and SFX — free (added 2026-10-17)
- [ ] Before the London-divide episode ships: confirm the "Contains OS data © Crown copyright and database right <year>" year on the ONS dataset page for ITL1/ITL2 (January 2025) boundaries (I used 2025) and put both ONS credit lines (in assets/LICENSES.md) in the video description — 5 min (added 2026-10-17)

## Posting (from Posting Ops)
- [ ] In Postiz, connect **Line Item** YouTube, Instagram and TikTok (Add channel). Keep the display names containing "Line Item" so the tool finds them. Instagram: Postiz offers "Instagram standalone" (no Facebook Page needed) or the Facebook-linked one; either works. TikTok can stay Personal — 10 min (added 2026-10-17)
- [ ] **Line Item YouTube is not connected to Postiz (5-channel cap on Standard).** Cheapest: upgrade to **Team, $39/mo (+$10)** (10 channels, also covers Cut Desk IG for the new campaigns) and connect Line Item YouTube; or upload by hand in Studio ($0, your time). Needed for the 10 Shorts' YouTube versions. The Ireland episode (182 MB) should be uploaded in Studio by you either way: it needs title option, thumbnail A/B test and the "altered or synthetic content" box, all in `longform/ep01-ireland-data-centres/packaging.md` (added 2026-10-17)

## Revenue setup (from research/line-item-revenue-plan.md, 2026-10-27)
- [ ] YouTube Studio → Earn → "Get notified" on the Line Item channel; turn on 2-Step Verification. Apply to YPP before 2027-01-31 23:59 UTC if eligible (1,000 subs + 10M Shorts views in 90 days); from 2027-02-01 the bar doubles — 10 min (added 2026-10-27)
- [ ] Decide tax residency for payouts (UAE vs UK address) BEFORE the YouTube US tax form; no US–UAE treaty may mean up to 30% withholding on US-viewer ad revenue (unconfirmed) — talk to an accountant — 1 h (added 2026-10-27)
- [ ] AdSense account when prompted (Google may post a PIN, allow ~2 weeks) — 10 min (added 2026-10-27)
- [ ] Bio: add a business-inquiry email on IG, YouTube and TikTok so sponsors can reach us — 5 min (added 2026-10-27)
- [ ] Confirm a UAE bank payout route for a digital product/store (Gumroad/Payhip/Stripe availability) — 15 min (added 2026-10-27)
