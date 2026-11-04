# Revenue Analyst: how GoViral makes money, and how fast

> **Update 2026-10-27:** Nathan is based in the UAE, not the UK. Instagram Gifts and TikTok Creator Rewards are not available there, and the UK-based eligibility below no longer applies. See `research/line-item-revenue-plan.md` for the current plan.

**Author:** Revenue Analyst session · **Date:** 2026-10-17 · **Status:** research complete, one gap (see "Evidence quality")

## Evidence quality (read first)
- **First-hand Reddit/X data added 2026-10-17** (section "First-hand Reddit/X data" below), pulled read-only through agent-reach/OpenCLI. It is a sample of what the search surfaced, not a survey. Later Reddit searches started failing ("Failed to fetch", likely rate limiting), so r/clipping, r/ClippingCommunity and r/TikTokCreators returned nothing. Coverage is mostly r/whop and r/WhopClipping, July–October 2026.
- **Most numbers come from vendor blogs** (OpenClip, ClipSpeed, FindClout, Vues, Sprites, Shopiator) that sell clipping tools or run competing networks. Treat their income ladders as marketing. Hard facts I trust more: Whop's own terms as quoted by several sources, YouTube's own blog, and Instagram's own announcement.
- **Where sources conflict, I say so** and use the more conservative figure in the model.
- **The model's ranges are my assumptions, not measured data.** The first 14 days of real Whop payouts should replace them.

---

## 1. Whop Content Rewards

### How it works end to end
1. A brand or creator funds a campaign (minimum $1,000 budget), sets a rate per 1,000 views, allowed platforms (TikTok, Instagram, YouTube, X), and requirements. Optional: max payout per clip, source-asset links. [Sprites, 2026-09-05]; [ClipSpeed, 2026-09-13]
2. Any Whop user 18+ joins the campaign for free. Some campaigns restrict by country or list creator requirements. [Sprites]; [FindClout/Whop docs, 2026-09-27]
3. You cut and post the clip to **your own** account, then submit the link.
4. Review: a bot score (0–100) plus an AI check, reportedly auto-approving within ~48h. The campaign owner can still reject manually afterwards. A flagged post has its payout paused for human review. [FindClout, 2026-09-27, quoting Vues]; [Shopiator, 2026-10-12]
5. Views are verified through the social platforms' APIs. CPM campaigns pay in rounds: **7-day earning window after approval, then a 3-day hold, so about 10 days from approval to settled.** Withdrawal then takes 3–5 business days, or is instant for a fee. [ClipSpeed]; [Shopiator]
6. Whop reportedly added a 24h payout delay and an anti-botting algorithm. Botting means a permanent ban. [FindClout complaints, 2026-08-26]

### Three campaign types (this matters for week 1)
| Type | Pays | Credited | Fee |
|---|---|---|---|
| CPM | per 1,000 verified views, for 7 days after approval | ~10 days after approval | 10%, always |
| **Per-post** | flat amount per approved clip | **at approval** | 10%, or 0% if the campaign budget is $5k+ |
| Retainer | fixed amount per cycle | end of cycle | 10%, or 0% at $5k+ |

Source: [ClipSpeed, 2026-09-13], which says it worked from Whop's terms. Per-post is the fastest route to a first dollar. One catch: if the clip misses the brand's minimum views inside its monitoring window, the payout returns to campaign funds.

### Rates
- **Across the 100 clipping campaigns on the Discover page on 2026-10-12: $0.20–$5.00 per 1k views, median $1.30, 76 of 100 between $1 and $2.** This is the best-dated snapshot I found. [Shopiator, 2026-10-12]
- Other guides quote a $0.20–$6 range with an average near $1. [OpenClip]; [ClipSpeed]
- Examples: a podcast-clips campaign at $1.75 and a music campaign at $0.30 on 2026-09-05 [Sprites]; Roobet $1.50 with a $250k pool; some gambling-stream campaigns $10+ [OpenClip, 2026]. The $10+ and $6 figures are single anecdotes.
- UGC (original content, not clips) reportedly pays more: roughly $2 for faceless and $3.50 for on-camera, unverified. [Shopiator citing OpenClip]
- **Net of the 10% fee:** $1.00 headline is $0.90; $2.00 is $1.80. [ClipSpeed]
- **Withdrawal fees:** next-day ACH $2.50, instant bank 4% + $1, crypto/Venmo 5% + $1. Batch withdrawals. [Sprites]

### Thresholds, caps, rejections
- **Per-clip minimum earnings:** brands can set a minimum a clip must earn before it pays, and a per-clip maximum. [ClipSpeed]
- **The minimum-threshold trap (primary source):** clipper Caleb Ortega (YouTube, 105k views) says every campaign he worked had a minimum view threshold, that **60–70% of clips never reach it and are unpaid labour**, and that he hit a ceiling of about $4,500/month freelance clipping before moving to a different model. His quoted campaign range is $0.50–$2 per 1k. He is also selling a course/model, so he has a motive to describe the work as a trap. [YouTube wwy3mJPsvIk, accessed 2026-10-17]
- **Rejections:** Whop's terms say a brand may reject only for failing a requirement written in the campaign. You get one appeal per flagged submission. A denial may carry no reason. [ClipSpeed]; [FindClout, 2026-09-27]
- **Why clips actually fail:** wrong platform, ineligible country, brand second-look once the clip gets views (off-tone, wrong audio, claims), bot-score holds, and a budget that runs dry before your views settle. [FindClout, 2026-09-27]
- **Reported complaints:** one Trustpilot one-star (2026-07-26) with $196.63 "upcoming for over a month"; a July 2026 r/whop post (via ForkOff) of a 400k-view clip that paid $2 against a $150 cap. Both unverified second-hand. [FindClout complaints]; [ForkOff]
- **Account requirements:** I found no universal follower or account-age floor for Content Rewards. Sources say none is stated in Whop's docs and that it is campaign by campaign. A brand-side review (Peter Claridge, 2025-09-15) says country-blocking can be bypassed by VPNs, which suggests reviews are patchy. [Shopiator]; [FindClout complaints]
- **Scale:** ~95,000 members [ClipSpeed]; >$40k/day paid per Forbes (via FindClout, 2026-04-29). Figures like "$2.58M paid to 8,466 earners" and "$13M" conflict and are unverified.

### What pays best right now
I could not list live campaigns (needs the logged-in Whop UI, and I did not sign up). Selection rule from the sources: **high-budget, mid-CPM pools beat tiny high-CPM ones** ("a high CPM with a small remaining budget is worth less than a mid CPM with $100k+ left" [OpenClip]). Prefer long-form podcast and streamer sources the brand supplies. Prefer campaigns whose platform list includes TikTok and YouTube Shorts (see Instagram caveat below).

### Competing platforms
| Platform | Rate (claimed) | Notes |
|---|---|---|
| **Whop Content Rewards** | median $1.30, range $0.20–5 | Largest, open, 10% fee, 10-day settle |
| **Vyro** (MrBeast/ViewStats, launched Oct 2025) | OpenClip: flat $3/1k, $1,000 cap per clip, hourly payouts. ClipSpeed: $1.50–2.00 on the live board, $10 minimum weekly withdrawal | **Sources conflict on the rate.** Curated roster, narrower supply. Plan on $1.50–2 until I see the board |
| Clipping.io | ~$1–3, per-clip min/max | Claims >$1.5M paid (unverified) |
| FindClout, Vues, others | varies | Curated or competitor networks; vetted creators, larger-audience requirement (FindClout wants US audience ≥40%) |

Sources: [OpenClip], [ClipSpeed], [OpusClip vs blog], [FindClout], [Growthr]. All are vendor sources.

---

## First-hand Reddit/X data (added 2026-10-17)

**What changed because of it:** (1) the fee is probably not a flat 10%; (2) real beginner results are lower and slower than the blogs say; (3) approval, budget and audience-region rules cause more lost income than CPM does; (4) the fastest first payout is closer to day 21–30 than day 14. The model in section 5 is rebuilt on this.

Reddit permalinks use the post id: `https://www.reddit.com/comments/<id>`. X links are `https://x.com/i/status/<id>`.

### Real earnings reports (newest first)
| Date | Who / where | Report | Link id |
|---|---|---|---|
| 2026-10-17 | @Netokrypto (X) | Second account, 2 weeks old: just over $100 earned, first payout $29. Same person said ~$500 in September from music campaigns on TikTok, ~$100 pending | 2111370231314612599, 2108986384018989231 |
| 2026-10-16 | @dmlxxr (X) | $35 from one video at ~20k views, about $1.75 per 1k views | 2111009052058661144 |
| 2026-10-12 | @remotemondays (X) | "Earned $1000 on Whop" after a clipping course (cumulative, no timeframe) | 2109636279360995449 |
| 2026-10-10 | @JeremiahXplore (X) | $8.06 for September on Content Rewards | 2109011212331839569 |
| 2026-10-10 | @ClipperViralHQ (X) | Complaint: "10 million impressions, $37 in revenue" (not necessarily Whop) | 2109034406870761907 |
| 2026-10-01 | r/WhopClipping | ~$120 in first month making sports clips; **first earnings appeared only in week 4** | 1wv54cj |
| 2026-09-26 | r/WhopClipping | A month+ of hand-made clips: best clip 1.9k views, nothing paid yet | 1wq7dk3 |
| 2026-09-28 | r/whop (clipper AMA) | Full-time clipper says 1k views per clip at $1 CPM and 10–15 posts/day is "$10–15 daily, $300–450 a month" per account; "big clippers don't clip for public campaigns" | 1ws81er |
| 2026-08-05 | r/whop | 247 clips uploaded in one month, **$15 earned** | 1vgfspl |
| 2026-08-28 | r/passive_income | Ex-agency clippers: 5 editors, 6–7 months, "couldn't earn much to continue" | 1w10hso |

Read it with these cautions: X earnings posts are self-selected wins, several come from people selling courses or tools (the platform's own posts and vendor posts excluded above), and screenshots can be edited (one X user said so on 2026-10-10). The sports-clips Reddit post reads like promotional content for a tool, so its "$120" is a low-end anchor, not a verified result. Official @contentrewards post, 2026-10-10: **36,545 people were paid in September, up 103% from August** (2108962349801689358). Spread over the $40k/day figure quoted earlier, the typical payee is earning small amounts.

### Rates and rules seen in the wild
- **Per-clip minimum:** one Call of Duty campaign needed **2,000 views before a clip paid** (r/whop 1wowm3m, 2026-09-24). A forum clipper claims 60–70% of clips miss minimums (Ortega video, above).
- **Rate range from clippers:** $0.30–$2 per 1k on agency networks (X, 2026-10-14, 2110366464108880234); Crayo's competing program $0.75–2 with no follower minimum (X, 2026-10-12, 2109463330821914976); Content Rewards roughly $1 per 1k (X, various).
- **Audience-region gate:** campaigns can require analytics proving the audience is Tier 1 (e.g. "30%+ Tier 3 will be rejected", or 40% Tier 1). A clipper with an 18.2% Tier 1 audience was refused despite 100–150k-view warm-up Reels (r/whop 1wowyof, 2026-09-24). **Where the audience lives matters, not where the clipper lives.** Account location can also block signup/payout: Whop suspended and froze one user holding a Russian passport (1ws3moi, 2026-09-28; lifted after DM).
- **Submit within 30 minutes of posting:** Whop's "V2" reportedly requires the submission within 30 minutes, so you can't submit a clip made earlier (r/whop 1w79f67, 2026-09-04; repeated by X replies on 2026-10-10).
- **Budgets are reserved fast under V2.** Rejected submissions freeing budget later makes old clips useless. "It rewards timing more than quality." Same post, same date.
- **Agency campaigns favour big pages.** "Never work for big agencies if you are not a big page. Big pages eat the budget" (r/whop 1wowm3m, 2026-09-24). Another comment: V2 turned Content Rewards into mostly clipping agencies (1w79f67).
- **Never hand over account logins.** One clipper reports a ClipFarm agency campaign that asked for account username and password (r/whop 1w6bsjt, 2026-09-03). Don't.

### Fee change (unverified, important)
A r/whop post on **2026-09-02** says the CPM fee under "Content Rewards V2" is tiered by lifetime earnings: **25% under $1,000, 20% from $1k, 12.5% from $2.5k, 7% from $5k** (r/whop 1w5xsgm, with a screenshot I couldn't open). This contradicts the flat 10% in the ClipSpeed guide (2026-09-13) and Sprites (2026-09-05). I found no second source, so treat the 25% early-stage fee as **probable, not confirmed**. Check the fee line on the Content Rewards earnings screen before relying on any CPM. The model uses it.

### Payout reliability and approval delays
| Date | Report | Link id |
|---|---|---|
| 2026-09-30 | V2 users still waiting for missing/stuck payouts from late August | 1wu8pmi |
| 2026-09-28 | Submissions past the minimum, not approved on several campaigns; told to send submission id plus analytics screen-recording to campaign support | 1wshdnt |
| 2026-09-24 | Eligible clips pending 2 days; budget ran out; support said wait | 1wowm3m |
| 2026-09-18 | Not approved after 5+ days, campaign under 50% spent | 1wjlhrc |
| 2026-08-13 | Clips with views stuck pending until the campaign was nearly fully paid; submission disappeared | 1vmrtd1 |
| 2026-07-31 | "Four months, no meaningful response" on payout; Whop support replied "that's on us" | 1vbjl31 |
| 2026-07-18 | Approved at 50% budget, flagged, then rejected as "budget exhausted" | 1v00jxg |
| 2026-07 | 400k-view clip paid the $2 minimum instead of up to $150; users say bug, 2–3 weeks to months | 1uxy7ua |
| 2026-08-27 | Video flagged as botted although the clipper bought nothing | 1vz9l4g |

The pattern is consistent: the money lost is rarely from low CPM; it is from clips not approved before the budget ends, and from payout bugs or support delays. Some clippers say they moved to Discord-run campaigns paid by PayPal (1vbjl31). Whop support does answer on Reddit when tagged.

### Bans and platform risk
- **TikTok:** X shows a steady stream of permanent bans and "shadow ban" complaints in the last week (2026-10-12 to 10-17), but I can't tell which were clipping accounts. A separate post says a user made 10 TikTok accounts and the 10th was banned with no strike (2026-10-16, X 2111097541378928957). It matches the general ban risk, not a clipping-specific figure.
- **Ban evasion:** a r/whop post (2026-10-09, 1x1aub4) reports an account that evaded a Whop ban and re-registered. Whop is policing this.
- **X (Twitter):** X's own "Original Content Rewards" program pays on impressions and bans copy-paste posts, so it's not an option for clips (X, 2026-10-11).
- No first-hand report found on Instagram reach for clip accounts, beyond the policy announcement.

### Not found / not collected
Reddit search for r/clipping, r/ClippingCommunity and r/TikTokCreators returned empty or failed. I did not find first-hand IG-specific clipper numbers. No clipper reported how many of their own posts passed the minimum, only the 60–70% claim.

---

## 2. The clipping workflow

- **Volume claims** (vendor numbers, not audited): beginners 3 posts/day, "consistent" clippers 5–15 transformed clips/day across several campaigns, top clippers 4+ accounts and 20+ posts/day. [OpenClip]. Ortega's group ran four campaigns at once.
- **Source footage:** brands supply it. Typical sources are podcasts, livestreams and webinars, with asset links in the campaign. You never need to hunt for footage on a campaign you were approved for.
- **Tools mentioned:** AI clippers (OpenClip, ClipSpeedAI, Opus) that turn one long video into ~10 captioned vertical clips. We already own ffmpeg, whisper and Remotion/HyperFrames, which cover the same job.
- **Licence:** on approval, you grant the brand a perpetual, worldwide, non-exclusive, sublicensable licence to reuse your clip. The **source** licence comes from the campaign owner, who funded the campaign and supplied the assets. Clipping a creator who has NOT run a campaign is a copyright/ToS risk. [Sprites, 2026-09-05]
- **Exclusivity and duplicates:** some campaigns ban posting the same clip to competing pools, and campaigns reject duplicate-looking submissions across clippers. [FindClout requirements, 2026-07-22]
- **Platform risk (most important new finding):**
  - **Instagram (2026-04-30):** accounts that mostly share content they didn't create, or haven't meaningfully transformed, are **no longer recommended to non-followers**. It is judged on a rolling ~30-day window. Credits, crops and watermarks don't count. Commentary, remixing or your own graphics can. Existing followers still see posts. [PetaPixel, 2026-04-30] (Mosseri's announcement; the Tubefilter piece failed to load for me.)
  - **TikTok:** low-originality reposts are demoted. An eMarketer piece says TikTok and Instagram are cracking down on campaigns without paid-promotion disclosure. Bans are usually preceded by silent reach suppression. I could not confirm the "hundreds of accounts banned" claim in Ortega's video. [OpenClip bans guide]; [eMarketer]
  - **Consequence:** an Instagram account built on raw clips will get almost no views, so clip income should lean on **TikTok and YouTube Shorts** first. Instagram works for clips only when the edit is substantially transformed (commentary, graphics) and is better kept for our own original brand.
  - A ban mid-verification forfeits pending payouts. [OpenClip]
- **Disclosure:** label paid clip posts per platform rules (#ad or equivalent) where the campaign or platform requires it.

---

## 3. Own-brand monetisation (IG Reels / Shorts)

No Instagram per-view payout exists (the Reels Play bonus ended in 2023; bonuses are occasional invite-only). Money comes off-platform. [Stack Influence / FlowShorts, 2026]

| Method | What it takes | Realistic numbers | Realistic threshold |
|---|---|---|---|
| **Digital product** (template, prompt pack, mini-guide) | Product + bio link (Stan Store, Gumroad, Whop) | Starter products ~$9–$17 [Gumroad listings]. Stan 5% free tier / 0% at $29/mo; Gumroad 9–10% (sources conflict). An undated single test claims 4.8% vs 3.1% link conversion; ignore it | First sales possible at **<1,000 followers if the audience is in-niche** (anecdotes of 74- and 150-follower accounts are unverified); expect real volume at 5–10k followers |
| **Affiliate** | Link in bio + CTA in video | Commission only on conversion. No reliable per-follower data | Works at any size, pays little below ~5k |
| **Brand deals** | A niche and an engaged audience | $10–$40 per 1k followers per feed post, Reel ~1.3–1.5x [Creaticalc; Hubfluence]. Tiers: ~$100–$500/Reel at 10–50k followers | Practically **10k+ engaged followers**, more often 25k+ |
| **UGC (made for brands)** | Own the video, no audience needed | $150–$500 flat per video; usage rights +25–100% [Rondocin / Stack, 2026] | Portfolio + outreach, no threshold. Whop UGC campaigns are the zero-outreach version |
| **Paid community / subscriptions** | Trust + niche | IG Subscriptions/Gifts commonly cited at 1,000 followers (unverified, Meta not checked) | 1k+ followers; real revenue needs thousands of engaged followers |

Takeaways:
- Per-view ad money is not coming from Instagram. Brand deals are a 90-day-plus goal. **Digital products and affiliate links are the only own-brand revenue that can show up inside 90 days**, and the amounts are small.
- Most "faceless page" income stories (e.g. $5k/month) are sold with a $5–17 PDF. Disregard them.
- Because of the originality rule, the own brand has to be **original or heavily transformed** content, which fits an automated generation pipeline.

---

## 4. YouTube long-form

- **YPP now:** Tier 1 (fan funding) 500 subs + 3 public uploads in 90 days + 3,000 watch hours or 3M Shorts views (90 days). Tier 2 (ads) 1,000 subs + 4,000 watch hours (12 months) or 10M Shorts views (90 days). Watch hours and Shorts views never combine. [AIR, 2026]
- **Change on 2027-02-01 (YouTube's own blog, 2026-08-10):** new applicants need **8,000 watch hours or 20M Shorts views**. Anyone already in YPP is unaffected. Shorts revenue-sharing for everyone requires 10M Shorts views per rolling 90 days from that date. Fan-funding thresholds unchanged. [blog.youtube, 2026-08-10]
- **Implication:** a new channel will not hit YPP inside 90 days (thousands of watch hours or millions of Shorts views). **Check whether Nathan's two Hermes channels are already in YPP.** If so they are exempt from the new thresholds. If not, applying only helps if they are already near the current bar by 2027-01-31.
- **RPM (measured, 300 channels, AIR Media-Tech 2026, medians):** Education $10.22, Lifestyle $2.98, Entertainment $2.43, Tech $2.33, Gaming $2.05, Business/Finance $2.01 (the last is directional, <10 channels). Spread inside a niche exceeds the spread between niches. Advertiser-quoted CPMs ($10–50 for finance) run 1.5–2x or more above real RPM. So **plan on ~$2 per 1,000 long-form views**, about $2,000 per million. [AIR 2026]
- **Shorts RPM:** $0.03–$0.10 per 1k views, so 1M Shorts views is $30–100. Shorts are discovery, not income. [vidIQ, 2026]
- **Time to first $:** AIR gives no timeline. With the thresholds above, from zero it is realistically **6–12+ months** for ads. Fan-funding/Super Thanks need Tier 1. Brand deals via YouTube Creator Partnerships also require YPP.

---

## 5. 90-day revenue model (starts 2026-10-17)

### Assumptions (revised 2026-10-17 after the first-hand data)
- "Posts" are distinct clip posts counted per platform. 30 distinct clips/week cross-posted to TikTok and Shorts is about 8 posts/day. **The PM's target of 30 clips/week sits between the conservative and base scenarios.**
- First posts on day 3. Month 1 has 27 posting days.
- **Net CPM = headline CPM minus Whop fee.** The 25%-under-$1k fee (r/whop, 2026-09-02) is used for conservative; base uses a blended ~22% (crosses $1k lifetime); stretch ~18%. If the fee is really flat 10%, add ~15–20% to lane A.
- **Payable share** now 40% / 60% / 75% (was 60 / 70 / 80). Reasons: a 2,000-view minimum on one campaign, approval waits of 2–5+ days while budgets run out, and 60–70% of clips under minimum in one clipper's account.
- **Average views per post** cut in month 1 (500 / 1,200 / 2,500, was 800 / 1,500 / 3,000). Real reports: 1k–1.5k views per clip after 3 weeks, best clip 1.9k after a month, first payout in week 4.
- Own-brand and YouTube lines are loose estimates and don't scale with the clip assumptions.

| Scenario | Posts/day (M1/M2/M3) | Avg views per post (M1/M2/M3) | Headline CPM → net CPM | Payable share |
|---|---|---|---|---|
| Conservative | 3 / 4 / 4 | 500 / 800 / 1,000 | $1.00 → $0.75 | 40% |
| Base | 5 / 8 / 10 | 1,200 / 2,500 / 3,500 | ~$1.22 → ~$0.95 | 60% |
| Stretch | 8 / 12 / 16 | 2,500 / 4,500 / 6,000 | ~$1.67 → ~$1.37 | 75% |

### Result (USD, calculated from the table above)
| Lane | Conservative | Base | Stretch |
|---|---|---|---|
| A. Whop/clipping, month 1 | $12 | $92 | $555 |
| A. month 2 | $29 | $342 | $1,665 |
| A. month 3 | $36 | $598 | $2,959 |
| **A. total earned** | **$77** | **$1,033** | **$5,179** |
| B. Own brand (products, affiliate, maybe one micro brand deal) | $0 | $150 | $750 |
| C. YouTube (Shorts/long-form ads, only if a channel is already in YPP) | $0 | $50 | $300 |
| **Total earned in 90 days** | **~$80** | **~$1,230** | **~$6,230** |
| Cash actually in the bank by day 90 (last ~2 weeks of CPM earnings still settling) | ~$60 | ~$750 + B/C ≈ $950 | ~$3,790 + B/C ≈ $4,840 |
| Posts needed over 90 days | ~320 | ~675 | ~1,050 |
| Followers on own brand at day 90 (guess) | ~200 | 1.5–3k | 8–10k |

**What changed vs the first version of this report:** conservative $210 → $80, base $1,830 → $1,230, stretch $7,450 → $6,230. The drivers are the likely 25% early fee, lower early views per post, and a lower payable share.

Reading the table:
- Almost all money is lane A. Lanes B and C are small in 90 days. Their purpose is asset-building for months 4+.
- Lane A is capped by **view volume per clip**, not rate. A 1,000-view clip pays under $1 net. The business only works if average views per post grows to the low thousands, which depends on the niche and hook work from the other agents.
- The stretch case needs ~16 posts/day and multiple accounts, assumes accounts survive, and sits above anything first-hand I found for a new clipper. Treat it as the upside, not the plan.
- **First payout timing (revised):** post day 3, approval can take 2–5+ days, then a 7-day earning window plus 3-day hold, then withdrawal. Real beginners report first money in **week 4**. So plan on **day 21–30** for the first CPM payout. The "first payout within 14 days" target works only with a per-post campaign or a lucky early hit, and only for small sums.

---

## Ranked "first dollar" actions for week 1
1. **Open Content Rewards and shortlist 3 campaigns** (do this on day 1; takes Nathan's Whop login). Filters: **budget still under ~50% spent** (clips approved late get "budget exhausted"), headline CPM ≥ $1, **per-clip minimum under ~1,000 views**, TikTok and YouTube Shorts allowed, **audience-region requirement we can meet (Tier 1 share)**, source assets supplied, no personal-watermark ban we can't meet. Skip big-agency campaigns where large pages take the budget. Screenshot every brief. Check the fee shown on the earnings screen.
2. **Prefer one per-post campaign** for the very first approval. It credits at approval instead of ~10 days later, so it proves the payout pipe first. Cheapest way to hit the "first paid payout within 14 days" target.
3. **Create 2 clean TikTok + 2 YouTube Shorts accounts** (one pair per campaign niche; correct region and time zone, no bulk creation). Warm each for ~3 days of normal use. Post 3–5 clips/day each from day 3, and **submit each clip within 30 minutes of posting**. Never give an agency your account login.
4. **Transform every post.** Burned-in captions, a hook, reframing, and per-post caption variation. This protects against TikTok demotion and Instagram's originality rule, and it is also what gets approved.
5. **Set the payout method early** (identity/tax info, one low-fee withdrawal path), and plan batched withdrawals to avoid the $2.50 / 4%+$1 fees.
6. **Check Vyro's live board** (public) for rate, cap and weekly $10 minimum. Apply if the roster allows. Its faster settlement may beat the Whop 10-day cycle.
7. **Check whether the two Hermes YouTube channels are in YPP** and note their watch hours. Costs nothing and changes lane C and the deadline.
8. **Set up the bio-link store only** (Stan or Gumroad free tier, one ~$9–17 product, one affiliate offer) so it exists when the own-brand account exists. Don't spend production time on this until lane A shows views.
9. **Log everything per post** (views at 24h/72h/7d, payout status, submission id, analytics screen recording). That log is the outside judge and the evidence Whop support asks for on stuck approvals.

---

## Risks
| Risk | Why it matters | Mitigation |
|---|---|---|
| **View volume too low per clip** | Avg 1–2k views earns about $1–2 per clip | Niche/hook work; kill campaigns that average <1.5k views after 20 clips |
| **Minimum thresholds and rejected/late clips** | 60–70% of clips unpaid in one clipper's account | Choose campaigns with low or no per-clip minimum; post early in a campaign |
| **Budget exhaustion** | First-come pools; late views may not pay | Track remaining budget daily; spread across 3+ campaigns |
| **Instagram unoriginal-content rule (2026-04-30)** | Raw-clip accounts lose all recommendation | Keep clip posting on TikTok/Shorts; IG only for original content |
| **TikTok/IG account bans** | Pending payouts forfeited | Transform content, limit duplicates, avoid bulk-account patterns |
| **Approval lag and budget exhaustion (first-hand, Jul–Oct 2026)** | Clips pending 2–5+ days while the pool empties; approved clips later "rejected: budget exhausted" | Post to campaigns under 50% spent; submit within 30 min; keep analytics recordings for support |
| **Payout bugs and support delays** | Reports of $2 paid on 400k views, month-long and 4-month waits, V2 stuck balances | Keep balances small; withdraw in batches; keep 2+ platforms |
| **Audience-region gate** | Campaigns reject if Tier 1 audience share is too low, regardless of views | Target UK/US/CA audiences from day 1; check requirement before cutting |
| **Fee uncertainty** | Possible 25% fee under $1k lifetime (unverified) | Read the fee line on the first earnings screen |
| **Rejection after views** | Brand can reject once the clip goes big | Follow written requirements exactly; keep screenshots; use the single appeal |
| **Bot-flag holds / botting ban** | Permanent Whop ban | No view buying, no engagement pods, ever |
| **Vendor-sourced numbers** | Rates and income ladders come from sellers | Re-baseline the model after week 2 with our own data |
| **Platform/term changes** | Whop terms, fees and Vyro rates changed within months | Re-read terms monthly; keep ≥2 platforms |
| **Region/tax** | Country-restricted campaigns; tax docs above thresholds | Confirm Nathan's country against each campaign; keep records |
| **Legal/ToS: unlicensed footage** | Clipping creators with no campaign breaches ToS/copyright | Only clip campaign-supplied or explicitly licensed sources |
| **YouTube threshold change** | 8,000 watch hours / 20M Shorts views from 2027-02-01 for new applicants | Check existing channels' YPP status now |
| **Hours vs $** | At ~$15 per clip manually, ~$15/hour [OpenClip] | Automate; track $/hour weekly |

---

## Sources (accessed 2026-10-17 unless noted)
- First-hand Reddit and X posts: listed with ids in the "First-hand Reddit/X data" section above (r/whop, r/WhopClipping, r/passive_income; X search via OpenCLI, 2026-07 to 2026-10-17).
- ClipSpeed, "Whop Content Rewards: 10% fee, 10-day hold", published 2026-09-13: https://www.clipspeed.ai/blog/whop-content-rewards-clipping-guide.html
- Shopiator, "Whop Clipping: How Content Rewards Pay", updated 2026-10-12 (100-campaign sample): https://shopiator.com/blog/whop-content-reward-campaigns
- Sprites, "Whop Clipping Guide", reviewed 2026-09-05 (fees, withdrawal fees, licence): https://www.sprites.ai/blog/whop-clipping-guide
- FindClout, "Why Whop clips get rejected", 2026-09-27 (cites Whop developer docs): https://findclout.com/blog/why-whop-clips-get-rejected
- FindClout, "Content Rewards complaints", 2026-08-26 (competitor; Trustpilot 2026-07-26, Claridge 2025-09-15): https://findclout.com/blog/content-rewards-complaints
- FindClout, "Content Rewards requirements", 2026-07-22: https://findclout.com/blog/content-rewards-requirements
- OpenClip, "How much do clippers make", 2026 (vendor): https://openclip.app/guides/how-much-do-clippers-make
- OpenClip Whop guide: https://openclip.app/guides/whop-clipping-guide
- OpusClip, Vyro vs Whop: https://www.opus.pro/blog/vyro-vs-whop
- Whop blog, "Content Rewards", 2025-03-04: https://whop.com/blog/content-rewards/
- Caleb Ortega, "The Harsh Truth About Clipping" (YouTube, transcript read): https://www.youtube.com/watch?v=wwy3mJPsvIk
- PetaPixel, "New Instagram Policies Target Reposted Content", 2026-04-30: https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/
- Planoly, Instagram original content policy: https://planoly.com/blog/instagram-updates-its-original-content-policy
- OpenClip clipping account bans: https://openclip.app/clipping/clipping-account-bans.md
- eMarketer, "Clipping's rise tests the limits of social media authenticity": https://www.emarketer.com/content/clipping-tests-limits-social-media-authenticity
- YouTube Official Blog, "New opportunities to earn and changes to YPP", 2026-08-10: https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/
- AIR Media-Tech, YPP requirements 2026: https://air.io/en/monetization/youtube-partner-program-requirements-2026-the-complete-guide
- AIR Media-Tech, "YouTube RPM 2026: real data from 300 channels": https://air.io/en/air-data-findings/how-much-does-youtube-really-pay-in-2026-real-rpm-data-from-300-channels
- vidIQ, YouTube Shorts monetization 2026: https://vidiq.com/blog/post/youtube-shorts-monetization/
- Creaticalc, Hubfluence, Elev8or, Stack Influence (brand-deal and UGC benchmarks, 2026, vendor calculators): https://creaticalc.com/instagram-sponsorship-rate-calculator · https://www.hubfluence.io/instagram-influencer-rates · https://stackinfluence.com/blog/how-much-do-instagram-reel-creators-earn-2026
- Unilink, Gumroad vs Stan Store, 2026: https://www.unilink.us/blog/gumroad-vs-stan-store

---

## Summary (5 lines)
1. Clipping on Whop pays about $1.30/1k views median (range $0.20–5), but first-hand reports show a probable 25% fee under $1k lifetime and a first payout around week 4. Realistic 90-day income is ~$80 / ~$1,230 / ~$6,230 (conservative / base / stretch), almost all from clipping.
2. The binding constraints are views per clip (1k–1.5k for new accounts), per-clip minimums (2,000 views on one campaign), slow approvals and budgets running out, not the CPM rate.
3. Instagram stopped recommending unoriginal accounts (2026-04-30), so clip on TikTok and Shorts and keep IG for original, transformed content. Campaigns can also reject for audience region, so aim for Tier 1 audiences.
4. First dollar: shortlist three campaigns under 50% spent with low minimums on day 1, post 3–5 transformed clips a day from day 3, submit within 30 minutes. The 14-day payout target is tight; plan on day 21–30.
5. Own brand and YouTube make little in 90 days; check now whether the two Hermes channels are already in YPP, since the bar doubles on 2027-02-01.
