# 03 · Red Team, round 2 (2026-10-29)
Reviewed: `01-research.md` (round 1) and `02-strategy.md` (round 1, written before research landed). Tags: **[M]** = my own knowledge, not sourced this session. Scores: **P1** = probability (1–10) of $1k/month within 6 months (by 2027-04-30); **P2** = $10k cumulative within 12 months (by 2027-10-31).

## 0. Verdict in five lines
1. The Strategist's base diagnosis is right and the research confirms it: **at ~200 views/post nothing view-based pays.** Every model that waits for views is a bet on hits we have had once.
2. **Model B's funnel is off by 10–100×.** It assumes 0.4% of *views* click the bio link; the research chain is views→profile 0.5–2% × profile→link 0.5–5% = **0.0025–0.1% of views**. Redone below: B needs **~1.8M–18M views/month** for $1k, not 460k.
3. **Model A is the only model with a real P1, but it is a services business that uses the style, not revenue from this content.** On Nathan's literal ask (affiliate / product / bio link from these videos) it scores ~1. That must be put to Nathan as a choice, not hidden inside "the channel is the portfolio".
4. A's biggest unexamined risk is **fit, not sales**: SaaS and Shopify-app buyers mostly want their UI shown; a pastel low-poly world shows metaphors and physical mechanisms. Retarget A to buyers whose product is a process or a physical thing, starting with Nathan's own clients.
5. Everyone missed the strongest bridge between the two readings: **Model D, use the low-poly content to sell Nathan's own existing offers** (AI receptionist, websites, Shopify app). The content → bio link → sale funnel he asked for, with an exemption from the Advertiser Permit (own products), payout rails and fulfilment that already exist, and a deal size big enough that tiny view counts can work.

---

## 1. Model A · Lowpoly Studio (B2B service; channel = portfolio)

### Five weakest assumptions
| # | Assumption | Why it's weak | Evidence needed |
|---|---|---|---|
| A1 | **Buyers (Shopify apps, SaaS) want a low-poly explainer** | App-listing and SaaS explainers are mostly UI walkthroughs and screen recordings with motion graphics. Low-poly carries metaphors (coins, machines, maps), not dashboards. The 5 proposed samples (QR code, lift, barcode, card tap, vending) are generic "how things work" pieces, not "how *your app* works". A buyer can't picture their product from them. | 10 real explainer videos from the target segment (e.g. top Shopify app listings): count how many are UI-led vs metaphor-led. 3 spec mocks for *real categories* (invoicing app, AI receptionist, a logistics or property service), and show them to 3–5 warm contacts before building anything else. |
| A2 | **Cold funnel 4% reply × 40% call × 35% close = 0.56% of emails** | No source. 35% close from a call is a warm-referral rate, not cold. Generic cold-email reply rates are usually quoted at 1–5% [M]; a free personalised mock can lift that, but 200 emails/month with a custom mock each is ~200 h of mock-making at "~1 h per mock". **That breaks both the token budget and the arithmetic.** Outreach is also outside this team's remit and needs Nathan's infrastructure and approval. | A non-vendor reply rate for creative services sent with a sample. A mock cost in tokens and $ per piece. A decision from Nathan on who sends and how many per week. Rework with ~20 mocks/month, not 200. |
| A3 | **$450 starter / $1,200 pack / $1,600 retainer** | The research has Fiverr 3D from ~$80 per 20 s and freelancers at $500–3k per 60 s, but **every price source is a vendor SEO page selling explainers** (anchoring high). Small app developers, the stated buyer, are the most price-sensitive segment, and in 2026 AI video tools (Veo/Kling/Sora-class) sell "product video in minutes" [M]. | Real listings with review counts as a demand proxy: Fiverr/Upwork "3D explainer", "low poly animation", "app promo video" at 30–60 s, prices and orders. Upwork job-post volume per week for those terms. |
| A4 | **Nathan: 2–3 h/week; agents: 6–16 h per deal** | Nathan runs an agency and Shopify app work, so sales, briefs, revisions and invoicing all land on him. Client scenes are custom (their product, their brand colours), not the 1 h kit video. The stated "tight weekly token budget" is never priced. One retainer client at 16 agent-hours a month may eat a meaningful slice of it. | Nathan's real weekly hours for this. Token cost of one real custom 30 s piece (build one spec mock and meter it). Revision cap in the contract. |
| A5 | **Payout rail = "the existing agency entity"** | Unverified. The research says Stripe UAE needs a UAE trade licence or freelancer permit. Nobody has confirmed what entity the agency is, or where it's registered (UAE? UK?). VAT status is also unknown. If there is no licence, a freelancer permit is a real cost (often quoted in the AED thousands a year [M], unsourced) and should be in every model's P&L. | One fact from Nathan: the agency's legal form and jurisdiction, and whether it can invoice for video production under its licence activity. |

Also: retainer conversion of 1 in 4 at $1,600/month is unsupported, and the retainers carry most of the March–April revenue. Without them, April cumulative is about $5–6k, not $12.2k.

### Fit test (the lead asked for this)
- **Reading 1, "revenue from THIS low-poly content" (affiliate, product, bio link):** A doesn't do this. Its revenue comes from client work. The channel's views barely matter, and the Strategist says so ("Views needed: none"). It is a new service line, with a different buyer, workload and risk.
- **Reading 2, "revenue from the low-poly asset in any form":** fits. The brief lists "the production skill (service)" as a sellable asset, and Nathan said nothing but the style is sacred.
- **My read:** Nathan's words ("affiliate links, selling something, the bio link", "beyond views") picture a media funnel. A is a legitimate answer, but only if he is told plainly that it is an agency service. **The lead must ask Nathan this question directly; do not settle it in the plan.**

### Scores
| Reading | P1 ($1k/mo by Apr 2027) | P2 ($10k by Oct 2027) | Why |
|---|---|---|---|
| A as a business (reading 2), retargeted to warm clients + process/physical products | **4** | **4** | $1k/month = ~2 starters a month. Plausible from Nathan's warm book if A1 is true. Weak on cold. |
| A as written (cold Shopify apps, 200 emails/month) | 2 | 3 | Mock volume and fit problems |
| A under reading 1 (revenue from the content itself) | 1 | 1 | Not what it does |

---

## 2. Model B · Side-Business Numbers (B2C audience + $29 pack + affiliates)

### Five weakest assumptions
| # | Assumption | Why it's weak | Evidence needed |
|---|---|---|---|
| B1 | **0.4% of views click the bio link** | Inconsistent with 01-research §3: views→profile 0.5–2% [M], profile→link 0.5–1.5% low / 1–5% mid. So link clicks run **0.0025–0.1% of views**. Recomputed with the Strategist's other numbers (35% opt-in, $1.56/subscriber): $ per 1k views = 546 × click share → **$0.055 at the research low case (1% × 1% = 0.01%), ~$0.33 mid (2% × 3%), $0.55 at the top (0.1%)**, vs $2.18 at its 0.4%. **$1k/month needs ~1.8M (best case) to ~18M (low case) views/month**; today ≈ 18k. | **Our own data, which is free:** IG Insights on the penny post (profile visits, link taps if a link existed). Nathan or the lead can read it; do not model before this. |
| B2 | **Views grow 25× in ~3 months** | n=1: a single 1,690 post, with everything else at 100–220 and TikTok suppressed. The "winners' first 50k at upload #7–17" stat describes survivors (selection bias). | 20 posts in the new niche with median views measured, before any product build (the kill criterion is right; move it earlier). |
| B3 | **4% of email subscribers buy $29 within 60 days** | No source. The research's cold-traffic purchase rate is 0.5–1% [M], and the Gumroad median creator makes ~$72/month [W]. Business calculator sheets are a commodity on Etsy and Gumroad (often under $10 [M]). | Count and price of Etsy/Gumroad listings for "vending machine / laundromat business calculator", with review counts. |
| B4 | **Affiliate income in the emails (Shopify, Canva, Square)** | The UAE Advertiser Permit (mandatory since 2026-02-01) appears to cover promoting *other firms'* products, paid or not [S]. Square is not in the UAE [M]. Each programme's UAE payout is unverified. | The permit's scope for a brand account. UAE-eligible programmes with payout rails. |
| B5 | **"Facts only, ≤4 figures" survives unit-economics content** | Vending, car-wash and food-truck economics are mostly blog estimates and course-seller numbers, not primary sources. The house rule (every figure sourced) will either kill half the topics or get bent. Side-hustle content is also a crowded, "get-rich"-adjacent niche dominated by course sellers [M]. | For the 5 proposed videos: one primary source per figure, now, before choosing the niche. |

**Credit where due:** B is the closest to the format that actually produced our one hit (a money story with a number hook), and its kill criteria are sensible.

### Scores
| | P1 | P2 | Why |
|---|---|---|---|
| B | **1** | **1** | Needs 100×+ today's views at research funnel rates |

---

## 3. Model C · Lowpoly Kit ($79/$179 code kit for devs/creators)

### Five weakest assumptions
| # | Assumption | Why it's weak | Evidence needed |
|---|---|---|---|
| C1 | **30 sales in launch month (Dec 2026)** | We have no X account, no dev audience and no email list. A Product Hunt or Reddit launch from a zero account typically gets 0–5 sales [M]. This one number carries $3k of the $10k. | Comparable launches: Remotion template sellers (Remotion's own marketplace/showcase, Gumroad Remotion kits) and their review/sales counts. |
| C2 | **People pay $79–179 for code an agent can write** | Nathan's own inspiration repo (`awesome-opus5-5-videos`) is free examples of exactly this, and the selling point "made with Claude in an hour" undercuts the price: the buyer has Claude too. | Price and sales of existing paid Remotion/Three.js templates. |
| C3 | **1% CTR, 3% buy, $100 AOV** | Unsourced, and 6× the research's cold purchase rate. | Same as C1/C2 |
| C4 | **Redistribution is clean** | Fonts, SFX and any third-party models need redistribution rights. Remotion needs a company licence above a size threshold (the buyer's obligation, but a support and refund risk) [M]. It also arms competitors in the format the channel uses. | A licence audit of `studio/src/kit3d` and `assets/` |
| C5 | **Nathan ~1 h/week** | A dev-product launch is usually founder-face-led (X threads, replies, demos). Support and updates are ongoing. | — |

### Scores
| | P1 | P2 | Why |
|---|---|---|---|
| C | **2** | **1** | A one-month launch spike might touch $1k; the tail doesn't reach $10k. Fine as a cheap by-product listing later. |

---

## 4. Research audit
**Good:** honest evidence grades; the "no verified low-poly monetisation example" admission; the UAE gates (Stripe licence, Advertiser Permit, SCA finfluencer rules) were exactly the missing pieces; and the funnel chain that exposes the bio-link fantasy.

**Weak or vendor-sourced, and load-bearing:**
1. **Explainer prices** (videoexplainers.com, pixune) are SEO pages from companies selling explainers, biased high. Model A's price rests on them. Replace with Fiverr/Upwork listings plus order or review counts.
2. **Funnel benchmarks** come from link-in-bio and landing-page vendors. **Views→profile visits is unsourced** [M], and it is the most important number in B. Our own IG Insights beat any blog.
3. **Kurzgesagt mix** comes via a "videohighlight" summary page, at 20M subs and 2D. Interesting, but irrelevant to planning at our size; don't let it imply "shop wins".
4. **Gumroad median $72/month** ("insightraider", ±15–20%, method unknown). Use it as a ceiling-sanity check only.
5. **Advertiser Permit** comes from one news article (Gulf News). The exemption wording ("own products on personal accounts") decides whether Model D and any store need a permit. A brand account may not count as "personal". Needs the UAE Media Council's own page.
6. **Lemon Squeezy** shows UAE listed for payouts [P], but it was acquired by Stripe in 2024 [M]; check that it still onboards new sellers in 2026 and what its review asks for.

**Missing data that would change the plan:**
- **Nathan's agency entity and licence** (jurisdiction, activity, Stripe status). This one fact settles A's rail, D's rail and the store rail.
- **Freelancer/trade permit cost and time**, if needed. That is a fixed cost against a $10k goal and is missing from every P&L.
- **Our own platform analytics:** IG Insights for penny, Coke and pizza (reach, profile visits, follows, shares), plus any YouTube Shorts uploaded by hand. Without these every funnel number is borrowed.
- **The token and $ cost of one video** (kit video and custom client piece), against the weekly budget.
- **Demand proof for the service:** Upwork/Fiverr volume, and the share of target listings with no or poor video.
- **Whop original-content (UGC) board:** still unmodelled. It is the only per-view cash that works for a UAE account; a browse costs little.

---

## 5. Stronger alternative the others missed · Model D: "the low-poly content sells Nathan's own offers"
**Idea:** point the channel at the buyers of something Nathan *already sells* (AI receptionist, websites for local businesses, his Shopify app or apps), and make the bio link / DM keyword lead to that offer. Low-poly story Shorts about the money in *their* business: "A dentist misses 1 in 4 calls, and each one is worth $X", "A garage loses $Y a week to voicemail", "Your Shopify store loses Z% of carts at this one step". Number hook, twist, loop: the exact proven format.

**Why it's stronger than A or B:**
- **It fits Nathan's literal ask** (content → bio link → sale), unlike A.
- **The unit economics survive tiny views:** if one AI-receptionist client is worth, say, $100–300/month or a site $1–3k (Nathan's real prices needed), then **one or two closed leads a month is $1k/month**, at view levels B can never reach. Funnel at the research *low* rates: 20k views/month × 0.01% link click ≈ 2 clicks; that's thin, so it also uses DM-keyword CTAs (12–18% [W]) and Nathan's direct use of the videos in his own sales (send the clip to prospects). That second use alone justifies the content.
- **Regulatory:** promoting your own products/services appears **exempt from the Advertiser Permit** [S, verify for brand accounts]. There are no finance/crypto issues and no third-party affiliate.
- **Rails and fulfilment already exist:** the agency invoices and delivers today, and the agents only make content (our 1 h kit videos, not custom client scenes).
- **It compounds into A:** every video is also a sample of "we can make this for your business", so A becomes an upsell rather than a cold-email machine.

**Weakest assumptions (pre-empting myself):** (D1) is the agency revenue "Lowpoly revenue"? Nathan decides, but it's honest attribution only if the lead came from the content (track with a unique link or code). (D2) Local-business owners may not be on Shorts in buying mode. (D3) The niche is narrower; views may be lower than for curiosity money stories. (D4) It needs Nathan's real prices and capacity for more clients.
**Scores (provisional, pending Nathan's prices):** P1 **4**, P2 **5**. Same order as A, but it fits the brief and needs no new business.
**Kill criterion:** 30 posts plus a DM-keyword CTA by 2027-01-15. If there are **<5 qualified inbound leads**, the content isn't a lead source; keep it as a sales asset Nathan sends by hand, and decide on A.

Also worth a cheap side test in any model: **Whop original-content campaigns** (browse only; count rates and geo rules), and a **pre-sale page before building any product** (B or C): no build until 20 sign-ups or 5 pre-orders.

## 6. Scoreboard (round 2)
| Model | P1 $1k/mo ≤6 mo | P2 $10k ≤12 mo | Fits Nathan's literal ask? |
|---|---|---|---|
| A Studio, as written | 2 | 3 | No (separate service) |
| A retargeted to warm clients/process products | 4 | 4 | No (separate service) |
| B Side-Business Numbers | 1 | 1 | Yes |
| C Kit | 2 | 1 | Partly |
| **D Content → Nathan's own offers** | **4** | **5** | **Yes** |

## 7. What round 3 must deliver
- **Strategist (v2):** redo B with the research funnel rates. Retarget A away from UI-led software buyers, or prove the fit. Cost tokens per deal. Write up D properly with Nathan's real offer prices (ask the lead). Cut C's launch number or source it. State A's brief-fit plainly.
- **Researcher (addendum):** the agency's licence/entity (via the lead), freelancer permit cost, Advertiser Permit wording from the regulator (own-product exemption, brand accounts, affiliate), real Fiverr/Upwork listings plus volume, our own IG Insights (via the lead/Nathan), cold-email reply rates with a sample (non-vendor), Whop UGC board, and Lemon Squeezy's 2026 onboarding status.
