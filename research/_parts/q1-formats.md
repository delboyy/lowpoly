# Q1: Winning faceless B2B / small-business Reel + Short formats (as of 2026-10-31)

## Evidence method and limits (read first)
- Discovery: vidIQ IG/TikTok outlier search (3 queries, window 2026-07-01 to 2026-10-31). vidIQ credits ran out after 3 queries, so no YouTube Shorts outlier data and no further IG/TikTok searches.
- Verification: `yt-dlp` fetch on 2026-10-31. TikTok: views, comments, date verified (tags: **V**). Instagram: date and comment count verified, but **view counts NOT retrievable** without login, so IG views are "vidIQ-reported, unverified by fetch" (tag: **vQ**). Two links failed to fetch (tagged "fetch failed").
- An outlier multiple (e.g. 193x) is views vs that creator's own median, as reported by vidIQ. Many winners are on-camera people. I list the *format mechanic* and say how it translates to faceless; only some examples are actually faceless.
- Nothing here is Shorts-verified. YouTube Shorts evidence = none collected. Treat as a gap.
- Evidence is thin or absent for: website roast, ASMR/satisfying fix, talking-object, green-screen news reaction, before/after build, fake-ad parody, mystery-shopper reel. See the "Not evidenced" section; do not treat those as proven.

---

## Formats with evidence

### 1. Comment-keyword text-only loop (the "Comment X and I'll send it" faceless card)
- https://www.tiktok.com/@melyysoft/video/7687632297771666696 : 2.6M views, 43,100 comments, 2026-09-20 (**V**). Rhythmic looping "PROMOTE YOUR BUSINESS" text, no voice.
- https://www.instagram.com/reel/DchTyTRSWiD : @thedomino_effect_, 143.1K views (**vQ**, 68.7x median), 36 comments verified, 2026-08-26. Faceless text-on-screen, "Comment START for the funding checklist".
- https://www.tiktok.com/@toriza8/video/7675207756881726733 : 199.6K views, 2026-08-18, "Comment 'ME'... free guide" 5s black-screen loop. **Unverified** (fetch failed, IP blocked).
- Why it works: 5s loop inflates replays; comment ask is the whole video; massive comment counts. Caveat: melyysoft's 43K comments is engagement-bait on a generic "promote your business" prompt, likely low-intent.
- For us: 6-10s Remotion loop: "Your last 5 DMs. How many got a reply in 5 min? Comment LEAK". Hard-cut kinetic text, beat music, no TTS needed.
- Faceless tools: Remotion text/timeline only; Three.js optional for a low-poly pulse behind the text.
- Drives: comments (high volume, lower quality). DM follows via the keyword automation.

### 2. POV owner-pain skit with voiceover ("POV: your client...")
- https://www.tiktok.com/@prettyspecialmedspa/video/7684510755747646734 : 4.1M views, 3,642 comments, 2026-09-12 (**V**). Med spa owner, clinic niche. Voiceover over a parking-lot POV, text hook "POV: Your friend is also your client...".
- https://www.tiktok.com/@angels_wash/video/7673686669723241741 : 983K views, 174 comments, 2026-08-14 (**V**). POV hands cleaning a tire + phone call, "Customer swears she already paid me".
- https://www.tiktok.com/@kimseamanhomes/video/7676498804937411853 : 1.1M views, 198 comments, 2026-08-21 (**V**). 8s real-estate agent "can't turn it off" skit.
- Why: hook is a one-line relatable grievance; payoff is a recognisable owner behaviour; short; owners tag colleagues (shares are likely but share counts not collected).
- For us: AI-image POV frames (fal) of an empty clinic reception, ringing phone, WhatsApp pile-up; Fish TTS owner-voice monologue; text hook in first frame.
- Faceless: POV camera = hands/objects only, no face. Already faceless in the angels_wash example.
- Drives: comments (relatable tagging). Weak for DMs unless a keyword CTA is bolted on.

### 3. Phone-call / customer-objection roleplay (audio drives it)
- https://www.tiktok.com/@dopemindsett/video/7669458827330227478 : 9.5M views, 2,617 comments, 2026-08-02 (**V**). Real-estate agent, staged call "One sentence killed a $9M deal".
- https://www.instagram.com/reel/DcgdeTdN89i : @mikecesaroni, 2.1M views (**vQ**, 193.7x median), 538 comments verified, 2026-08-26. "The job only took 4 hours, why are you charging $4,500". Trades/service pricing objection.
- https://www.tiktok.com/@sarayahhernandez/video/7697276201307573535 : 1.1M views, 177s, 2026-10-16. **Unverified** (not fetched). Cancellation-policy call.
- Why: dialogue gives an instant stake (money lost); viewer takes a side in comments; story arc fits 30-60s.
- For us: two Fish TTS voices (owner + angry customer), phone-call UI with live waveform, then a "where the leak was" stinger. Missed-call variant: the call rings out, a counter shows AED lost.
- Faceless: audio plus UI only. No actors.
- Drives: comments (opinion split). Strong for our "missed calls" angle.

### 4. Client-message reaction skit (WhatsApp/DM absurdity) - UAE-native
- https://www.instagram.com/reel/DcBjNqqs5r_ : @arsany.re, 171.5K views (**vQ**, 130x median), 127 comments verified, 2026-08-14. Dubai agent reacting to "2 bed in Burj Khalifa with sea view, budget 500k AED". Text overlay + sting SFX.
- https://www.instagram.com/reel/Dbx_yb5qrC5 : @anastasiia_gurskaya, 380.5K views (**vQ**), 2026-08-08. "POV: if the agent talked the way the client talks", Dubai. Not fetched.
- Why: the message *is* the hook (readable in frame 1); the sting SFX gives the laugh; local specifics (Burj, AED) signal "made for UAE".
- For us: Remotion WhatsApp chat mockup, messages type in, red "Seen 14:02 / No reply 19 hours" timestamps, mascot-less. Reverse the joke: the AGENT's slow reply is the punchline.
- Faceless: 100% UI.
- Drives: comments ("this is every Monday"). Good bridge into "LEAK" CTA ("reply-time check").

### 5. AI-workflow screen-recording walkthrough
- https://www.instagram.com/reel/DcMZvo5x_Sq : @arturrioni, 505.9K views (**vQ**), **17,897 comments verified**, 2026-08-18 by fetch (vidIQ said 08-20; 2-day discrepancy). "Comment CLAUDE for the step-by-step guide".
- https://www.instagram.com/reel/DcFoz5ch63i : @b2bwithdanielle, 237K views (**vQ**, 823x median), 2026-08-16. Fetch failed, unverified. AI + CRM lead-gen tutorial.
- https://www.instagram.com/reel/DcJW1_5OCmB : @cashflow.automations, 61.5K views (**vQ**), 2026-08-17. Hook "POV: you started an agency but have no clients", music only. Not fetched.
- Why: concrete outcome + keyword gate = huge comment volume (17.9K proves the mechanic).
- For us: Remotion-rendered fake dashboard "Lead came in 02:13 -> auto-reply in 11s -> booked". Show before (manual) and after (automated) fix.
- Faceless: screen/UI only, Fish TTS narration.
- Drives: comments AND DMs (this is the strongest DM mechanic in the data).

### 6. Satirical "3 things that will ALWAYS attract customers" (reverse-advice listicle)
- https://www.instagram.com/reel/DcUakeFzg62 : @mollyandme21, 115.5K views (**vQ**, 25x median), 65 comments verified, 2026-08-21. Shop owner deadpan-lists counterproductive habits (closing early etc.) over music.
- Why: listicle skeleton (3 beats) + irony; the viewer finishes the joke; no talking required.
- For us: "3 things that will always lose you a lead": reply tomorrow / send a PDF no one opens / turn off WhatsApp at 6pm. Each beat = a short low-poly or image vignette with static text.
- Faceless: yes (original was footage + text, no talking).
- Drives: comments/shares modestly (65 comments is low); weak for DMs. Single example; thin.

### 7. Ranked reveal / guess-the-number quiz
- https://www.tiktok.com/@investwithgiorgio/video/7695808700820376850 : 689.5K views, 52s, 2026-10-12 (vidIQ; **not fetched**). "Guess #1 correctly and win a prize", top-10 nationalities buying Dubai property.
- Why: a comment-bait prompt ("guess") + a countdown keeps people to the end; local-market data.
- For us: "Top 5 places UAE agencies lose leads, guess #1" with a Remotion countdown; end card: "Comment LEAK for your own ranking".
- Faceless: Remotion list + TTS. The example itself is on-camera.
- Drives: comments (guesses). One example only. Thin.

### 8. Man-on-street "Salary -> What you can afford" (Dubai) adapted as synthetic Q&A
- https://www.tiktok.com/@mozamil.miraj/video/7670094392736206087 : 3.8M views, 31s, 2026-08-04 (vidIQ; **not fetched**). Dubai agent asks strangers their salary, answers with the home they can afford.
- Why: the viewer self-places in the bracket; repeatable template.
- For us (adaptation, untested): "Monthly leads 100 / reply in 1 hr -> you keep ~X" template; AI-image stand-in characters, Fish voices for question/answer pairs.
- Faceless: stand-ins only; the original is on-camera. Higher risk of looking fake. Drives comments ("what about me?") and DMs.

### 9. Skit-into-software demo (hook comedy, then screen)
- https://www.tiktok.com/@ad.deum.tende/video/7649526421899037983 : 8.9M views, 96 comments, 2026-08-06 (**V**). 18s ManyChat promo; "your audience is dying off and the saxophones are getting louder".
- https://www.tiktok.com/@nanadelbiz/video/7682898316950097183 : 1.6M views, 68s, 2026-09-07 (vidIQ, not fetched). Composited fake desktop UI, ManyChat tutorial.
- Why: the joke gets 3s of retention, then the demo delivers value; very short. Note 96 comments on 8.9M views: a views play, not a comments play.
- For us: fake-OS "Business OS" desktop window (Remotion) with absurd error dialogs ("Lead.exe stopped responding") then the fix. Dialog boxes as jokes.
- Faceless: yes if the on-camera sad-face is replaced by a UI/object reaction.
- Drives: views and brand; weaker for DMs.

### 10. Motion-graphics agency promo loop
- https://www.tiktok.com/@cadimaragency/video/7689683408003484948 : 543.1K views, 18s, 2026-09-26 (vidIQ, not fetched). Logo + value statement, looped. Offer-led ("FREE AGENCY AD ACCOUNTS").
- Why: pure offer + loop. Likely low-intent/spammy reach; I have no conversion evidence.
- For us: a "Free Leak Check" 8s loop as a pinned/profile-fillers asset only.
- Faceless: yes. Drives: DMs maybe; weak organic reach evidence, one example. Low priority.

---

## Not evidenced (hypotheses, NOT proven; no qualifying examples found with my 3 queries)
11. **Mystery-shopper "I messaged 10 agencies"**: no viral Reel found. The *data* is strong: DelPrete study, 47% of online inquiries never answered, typical reply 8+ hours (https://inman.com/2024/07/30/delprete-secret-shopper-sting-reveals-agents-lose-hosts-of-leads, 2024-07-30); Homeflow UK: 39% of agents not responding promptly (https://www.homeflow.co.uk/posts/39-of-home-sellers-wait-for-an-estate-agents-response, 2023-09-19). Use as a reveal template with real own-run tests (UAE mystery shop), WhatsApp-screen format. Caution: do not name real businesses without consent; anonymise.
12. **Website/reply-time roast and rate-it**: nothing found yet; needs a dedicated search (my IG/TikTok query was blocked by credits).
13. **ASMR / satisfying fix**: none found for B2B. Plausible via Three.js (low-poly gears click into place); test, don't assume.
14. **Talking-object / character**: none found for B2B in this window. Matches current low-poly IP; test as a variation.
15. **Green-screen news reaction / fake-ad parody / before-after build**: not found in B2B small-business. Treat as untested.

## Cross-format patterns (evidence-backed)
- Money-loss or social-tension hook in the on-screen text in frame 1 (nearly every outlier above).
- Real-estate Dubai content works locally (arsany.re, mozamil.miraj, anastasiia_gurskaya), so UAE-specific details (AED, WhatsApp, Burj) are a hook.
- The comment-keyword gate (arturrioni: 17,897 comments) is the only mechanic with verified DM-scale volume.
- Outliers are mostly 8-60s.
- Several outliers are on very small accounts (mikecesaroni 59K followers, kimseamanhomes 1.1K), so format beats follower count.

## Gaps for follow-up
- No YouTube Shorts data. No Shorts outlier query was possible (vidIQ credits exhausted).
- IG view counts unverified. Retry with a logged-in session or after credits reset.
- Re-verify the fetch-failed links (toriza8, b2bwithdanielle) and the unfetched vidIQ-only ones.
