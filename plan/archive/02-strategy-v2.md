# 02 · Revenue strategy v2 (Revenue Strategist, round 3, 2026-10-29)
This version answers every point in `03-redteam.md` using `01-research.md` (**R1**), `01-research-addendum.md` (**R2**) and three Strategist helper reports in the shared notes folder: `strategist-uae-rails.md` (**H-UAE**), `strategist-B-demand.md` (**H-B**) and `factcheck-competitors.md` (**FC**). The Model A pricing/buyer helper reported late; see §3.1 (`strategist-A-pricing-buyers.md`, **H-A**). Nathan's unknowns are in `NATHAN-INPUTS.md` (all four still pending). Model D therefore uses a **sensitivity table**: Nathan's answers pick a row.
Tags: [A] my assumption · [P]/[S]/[W]/[M] grades carried over from the source.

## 0. What changed from v1
| | v1 | v2 |
|---|---|---|
| Recommendation | A (B2B studio) | **D + A-warm**: the low-poly content sells Nathan's own offers (AI receptionist, websites, Cobundle). A becomes a $300–450 add-on sold to the same buyers. |
| B | $2.18 per 1k views | **$0.006–0.06 per 1k views**: dead as an engine; killed. |
| C | 30 launch sales | No forecast: cut to a $0 passive listing behind a pre-sale gate. |
| A | 200 cold emails a month with custom mocks, 1-in-4 retainers | Warm and upsell only. Cold A was ~0.1–0.3 deals per 100 emails on R2 rates; retainers dropped from the base case. |
| Fits Nathan's ask? | Not stated | Stated plainly in §5. |

## 0.5 Nathan's update (2026-10-29): rank by what we can execute and sell in 30–90 days
Nathan: "Let's be realistic about what we can do and make money on." He has a business licence, so rails and permits are solved. The ranking below uses only real assets: the kit (~1 h/video), Nathan's 2–3 h/week and a tiny audience. Audience-scale upside is ignored.

| Rank | Revenue line | Named first buyer type | Concrete first-sale path | Earliest first $ | Realistic $ in 90 days |
|---|---|---|---|---|---|
| **1** | **D: receptionist/website sold through tracked low-poly videos** | Owner of a local service business with a phone-led front desk (clinic, salon, trade), from Nathan's own prospect list | We make the "missed call" + "lead in 5 minutes" videos (week 1) → Nathan sends them with a tracked link to 20–30 warm prospects and past enquiries (week 2–3) → call → close with his normal contract | Dec 2026 | 1–3 closes ≈ **$1.5–5k** at the §2.4 middle rows [A, prices pending] |
| **2** | **A-warm: a $300–450 low-poly clip of the client's own process/product** | Nathan's existing agency clients, starting with the ones whose sites he built | Week 2: make 1 spec clip for 1 real client (free, with Nathan's OK) → Nathan shows it and offers the same at $400 to the other clients in one message → invoice via his licence | Dec 2026 | 1–4 clips ≈ **$400–1,600** |
| **3** | **D for Cobundle: cart-abandonment / bundle Shorts → app install** | Shopify store owner with physical products and a low order value | Videos 2–3 (§2.2) carry the Cobundle link, also sent by Nathan to stores he works with (e.g. his ad-work client) | Jan 2027 | **$30–150/month** recurring: small |
| 4 | Whop UGC campaign (side test) | A brand running a $1–3 per 1k UGC campaign that accepts faceless 3D | Nathan browses the board once; if a fit exists, we make 1 entry from the kit | Unknown | $0–300; not counted |
| — | B (product), C (kit), YPP | — | No realistic first sale in 90 days at today's views | — | $0 |

**90-day realistic total: ~$2–7k**, almost all from D and A-warm, and all through Nathan's existing relationships. The $10k cumulative date is then the §2.4 row his real prices pick, roughly **Apr–Sep 2027** for a $1,000+ deal at about 1 close a month.
**What makes or breaks the 90 days:** that Nathan actually sends the videos (~1 h/week of his 2–3 h). If he can't, rank 1 drops to the public-content route and the 90-day total falls to ~$0–1k.

---

## 1. Point-by-point answers to the Red Team

### RT-1 · B's click rate is 10–100× too high → **ACCEPT. B is killed.**
Redone with R1 §3 and R2 §4: link clicks = views × views→profile (0.5–2% [M]) × profile→link (0.5–5% [W]), giving **0.0025–0.1% of views**. I also cut the other v1 numbers to the research ranges:
- opt-in 20% (R1: 6.6% median, 34% cheat-sheet pages; cold social traffic sits low);
- purchase 1% of subscribers (R1: cold 0.5–1% [M]);
- affiliates $0 (R2 §1: affiliate links for others' products need the Advertiser Permit, so they are off the table until Nathan has it).
`$ per 1k views = 1,000 × click share × 0.20 × (0.01 × $29)`
| Case | Click share | $ per 1k views | Views/month for $1k/month |
|---|---|---|---|
| Low | 0.01% | $0.006 | ~170M |
| High | 0.1% | $0.058 | ~17M |
Even the Red Team's gentler recompute (1.8–18M views/month) is 100–1,000× today's ~18k views/month.
H-B adds that the niche gets real attention (vending/soda cash Shorts at 29M, 2.1M and 1.1M; laundromat 509k). But typical channel medians are ~4.7–11k and the outliers are face plus cash on camera. Spreadsheet demand is unproven: $3–30 on marketplaces, free gated calculators exist, and no sales counts were found. Creators in the niche monetise with **courses and coaching, not $29 sheets**. **Verdict: kill B as a revenue model.** Its useful idea, that small-business owners watch money-in-a-business stories, moves into Model D, where the deal size is 50–100× larger.

### RT-2 · Low-poly doesn't show a SaaS/Shopify-app UI → **ACCEPT. A is retargeted.**
FC agrees: the only verified low-poly business buyers are energy/utilities (Stormy Studio for Western Power Distribution [P]) and productised physical-product demos (Ministudio's "3D demonstration", $449.99 for 1 low-poly model and 1 minute [P]). Low-poly carries **processes, places and physical things**, not dashboards.
New A targets:
1. Nathan's existing clients (local businesses he already serves);
2. businesses with a physical process: clinics ("what happens to your sample"), solar/HVAC installers, logistics, property;
3. Shopify stores with **physical products** (a low-poly product demo, the Ministudio pattern), not app developers.
UI-led software buyers are dropped.

### RT-3 · 200 custom mocks is ~200 h a month; what does one cost? → **ACCEPT. Volume cut to ~20 a month, using vertical templates.**
- New method: build **one master mock per vertical** (e.g. "missed calls at a dental clinic"), about 2–3 h on the kit. Then personalise per prospect: swap the business name, the colours and one sourced local number, and re-render. That should take ~10–15 min of agent time plus a ~5 min render [A].
- 20 personalised mocks a month ≈ 5–8 h a month.
- Token cost per mock is **not measured yet**. Week-1 action: meter one master mock and one personalisation (tokens and $) and log them in `plan/`. If a personalisation costs more than ~5% of the deal price, stop personalising and send the vertical master instead.
- Outreach itself is Nathan's call, through his existing agency process, not this team's.

### RT-4 · Without retainers, April cumulative is ~$5–6k; where is the 1-in-4 evidence? → **ACCEPT. No evidence; retainers removed from the base case.**
- I have no source for 1 in 4.
- On R2 rates cold A is worse than v1 said: reply 2–6%, 1 in 5–10 replies books a call, 1 in 3–5 calls closes. That is 100 emails × 4% × 15% × 25% ≈ **0.15 deals per 100 emails** (~$70 a month at $450).
- **Cold A is not a model.** A survives only as a warm upsell (§3).

### RT-5 · Where do C's 30 launch sales come from? → **ACCEPT. Cut.**
- No source, no audience, no list.
- C becomes: list the kit on Lemon Squeezy only after a free pre-sale page collects **5 pre-orders or 20 sign-ups**. Forecast **$0**; any sales are upside.
- Licence audit of `studio/src/kit3d` and `assets/` (fonts, SFX) comes before any listing.
- Also: it arms competitors in the format we use for D. Low priority.

### RT-6 · Write up Model D → **DONE (§2).** Nathan's prices are pending, so §2.4 is a sensitivity table.

### RT-7 · Is A revenue from this content? → **ANSWERED PLAINLY (§5).** No. A is a separate service line that uses the style. D is the model that turns the content into sales through a bio link or DM, as Nathan asked.

### Red Team research-audit items, carried forward
| Item | Status in v2 |
|---|---|
| Vendor-biased explainer prices | Replaced with R2's marketplace floor ($50–200 per short 3D explainer on Fiverr [W snippets]) and Ministudio's $449.99 productised low-poly demo [P]. A is priced at **$300–450**, sold to warm buyers only. |
| Views→profile unsourced | Kept as a range [M]. Killed B. D does not depend on it (§2.3). |
| Advertiser Permit brand-account exemption | Unconfirmed (R2 §1). D promotes a company Nathan owns, which law-firm and news wording exempts. For the cleanest route, **post D videos on an account of the company itself**. Nathan says the licence covers it (2026-10-29), so this is treated as solved. |
| Lemon Squeezy 2026 onboarding | Unconfirmed (R2 §7). It only matters for C, which is now deferred. |
| Entity / licence | **Solved (Nathan, 2026-10-29: "I have a business licence, don't worry about it").** Invoicing, payout rails and the permit are treated as handled; the licence-cost branches are dropped. |
| Our own IG Insights | Pending NATHAN-INPUTS #4. They do not decide D (§2.3); they decide how much public reach adds. |
| Whop UGC | Side test only: R2 found a $1–3 per 1k range and a $3/1k example (Fanatics UGC [P]). Nathan browses the board; it is not modelled. |

---

## 2. Model D · "The Leak": low-poly stories about where local businesses lose money, which sell Nathan's own fixes

### 2.1 Niche, audience, why they pay
- **Audience:** owners of the local service businesses Nathan's agency already sells to (assumed clinics, trades, restaurants and salons, pending NATHAN-INPUTS #3), plus Shopify store owners for Cobundle.
- **Angle:** the proven penny format (number hook, twist, loop) applied to *their* money. Examples: a missed call, a slow website, an abandoned cart.
- **Why they pay:** each video names a loss they recognise. The fix is an offer Nathan already sells and fulfils: the AI receptionist answers the missed call, a fast site cuts drop-off, bundles raise the cart value. The deal is worth hundreds to thousands of dollars, so **one close a month matters**. B needed thousands of $29 buyers.
- **Brand:** rename the faceless account (e.g. "The Leak" [V handle/trademark]), owned and run as a channel of Nathan's company so the own-company Advertiser Permit exemption applies. The low-poly style stays; money stories stay, re-aimed at business owners.

### 2.2 Five videos: number in line 1, twist, loop
Facts-only rule: every figure needs a source. Several stats in this space are vendor studies, so we cite them as such ("a 2019 study by X found") or drop them. All [V] at build time.
1. **"Answer a new lead in 5 minutes and you're about 100× likelier to reach them than at 30."** (Oldroyd/MIT–InsideSales lead-response study.) Twist: most businesses take hours, so the fastest one wins, not the best one. Loop: the phone rings again.
2. **"About 7 in 10 online carts are abandoned."** (Baymard Institute, ~70% average across 49 studies.) Twist: the #1 reason isn't price; it's surprise costs at checkout. Loop: the cart rolls back to the shelf. (Sells Cobundle and sites.)
3. **"A site that loads in 1 second can convert about 3× better than one that takes 5."** (Portent 2019, B2B sites.) Twist: the customer never sees the slow page; they're already on a rival's. Loop: the spinner returns to frame one.
4. **"1 missed call at a clinic can be a lost patient worth hundreds."** (Needs a primary or clearly labelled source; build only if one exists.) Twist: most callers don't leave a voicemail; they call the next clinic. Loop: the phone rings in the empty reception.
5. **"Most customers who can't book online on the first try don't try again."** (Find a sourced figure, or drop.) Twist: the booking form, not the price, lost them. Loop.
Production: our existing ~1 h kit videos; 3–4 a week; same scene kit (phone, shop, cart, clock).

### 2.3 Funnel: three routes, ranked by how little they depend on views
1. **Sales asset (no views needed):** Nathan, or his agency's process, sends the relevant video to prospects and existing clients with a tracked link to the offer page. This is the main route. A specific, loopable 35 s story about *their* loss is a better opener than text.
2. **Public content → DM keyword / bio link → offer page → call:** posted on IG, YouTube and TikTok. At ~20k views/month × 0.0025–0.1% that is ~0.5–20 clicks a month; useful but thin. DM-keyword automation is unproven (R2 §8); test it, but don't count on it.
3. **Upsell to A:** every client who sees the video is offered "one like this, about your business" for $300–450 (§3).
**Attribution:** a unique link (UTM) or offer code per video and per route. Only deals with a tracked touch count as Lowpoly revenue. The lead and Nathan agree this rule up front.

### 2.4 Arithmetic: sensitivity table (Nathan's answers pick the row)
Formula: `month m revenue = setup × closes/month + monthly fee × (closes/month × m)`. Cumulative is summed from **January 2027** (Nov–Dec 2026 = building videos, the offer page and tracking). No churn assumed; real churn pushes the dates right. Offer prices are [A] until NATHAN-INPUTS #1.

| Offer (Nathan's real price → pick a row) | 0.5 closes/mo | 1 close/mo | 2 closes/mo |
|---|---|---|---|
| AI receptionist: $500 setup + $150/mo | $1k/mo Oct 2027 · $10k Jan 2028 | $1k/mo Apr 2027 · $10k Sep 2027 | $1k/mo Jan 2027 · $10k Jun 2027 |
| AI receptionist: $1,000 setup + $250/mo | $1k/mo Apr 2027 · $10k Sep 2027 | $1k/mo Jan 2027 · **$10k Jun 2027** | $1k/mo Jan 2027 · $10k Apr 2027 |
| Website: $1,500 one-off | never $1k/mo · $10k Feb 2028 | $1.5k/mo from Jan 2027 · $10k Jul 2027 | $3k/mo · $10k Apr 2027 |
| Website: $3,000 one-off | $1.5k/mo · $10k Jul 2027 | $3k/mo · $10k Apr 2027 | $6k/mo · $10k Feb 2027 |
| Cobundle: $30/mo per store | $1k/mo never in 3 yrs | $1k/mo ~2029 | $1k/mo ~mid-2028 |
**Reading it:** if Nathan's typical deal is about $1,000+ up front, or $250/month recurring, then about **1 tracked close a month reaches $10k between April and July 2027**. Cobundle alone can't get there at app-subscription prices; it stays a secondary call to action for the Shopify videos.
**How many touches make 1 close a month?** Using R2's cold rates on the sales-asset route (reply 2–6%, a fifth to a tenth of replies book calls, a third to a fifth of calls close): ~0.15 closes per 100 cold touches. **1 close a month needs ~650 cold touches, or a much better warm rate.** That is why D leans on warm contacts, existing clients and inbound replies. Nathan's real baseline reply rate (pending) replaces this. The test question is: **do videos lift his reply rate over plain text?**
**Capacity:** 1–2 new clients a month must fit Nathan's delivery capacity (NATHAN-INPUTS #1, pending).

### 2.5 Time, cost, risks, kill criteria
- **Nathan:** ~1–2 h/week (sending videos and calls, which he would do anyway for the agency). **Us:** 3–4 kit videos a week (~1 h each), one offer page per offer, UTM links, and a weekly tracked-results line.
- **Cost:** ≈ $0 new fixed cost (Nathan's licence covers it).
- **Risks:**
  - D1 attribution: agency revenue is only counted when tracked.
  - D2 owners may not be on Shorts in buying mode, so route 1 carries the model.
  - D3 vendor-sourced stats can break the facts-only rule, so only labelled or primary figures are used.
  - D4 capacity: Nathan can't take more clients.
  -
- **Kill criteria:**
  1. By **2027-01-31**: ≥100 tracked video sends. If the reply rate is **not higher than Nathan's plain-text baseline**, the video adds nothing; keep posting as content only.
  2. By **2027-02-28**: if there are **0 tracked closes**, stop D as a revenue model.
  3. By **2027-01-15**: if public content has **<5 qualified inbound DMs or leads** after 30 posts, drop route 2 and keep route 1.
- **Scores (my own estimate, for the Red Team to check):** P1 4–5, P2 5. Same order as the Red Team's provisional 4/5. It rests on one unknown, Nathan's deal size and baseline close rate.

---

## 3. Model A v2 · "Lowpoly for your business": a warm add-on, not a cold studio
- **Offer:** one 30–45 s low-poly explainer of the client's process or physical product, 9:16 + 16:9, one revision. **$300–450** [R2 marketplace floor $50–200 for short 3D; Ministudio $449.99 productised P]. A 3-pack is $1,000. Invoiced via the agency.
- **Buyers:** Nathan's existing and new D clients, and process or physical-product businesses. Not SaaS or app UIs.
- **Arithmetic:** if Nathan has ~20 active clients [A] and 10% buy a $400 clip, that is ~$800 once. Then ~30% of D's new clients take a clip [A]: at 1 D close a month, ≈ $120/month. **A adds ~$1–2k across 12 months.** It is an add-on, not a $10k engine.
- **Time:** ~3–6 agent-hours per custom piece; meter the first one.
- **Kill:** if 0 of the first 10 clients offered buy by 2027-02-28, stop offering it.
- **Scores:** P1 2, P2 3 standalone. It lifts D's P2 by about 1.

### 3.1 Late evidence from the A pricing helper (`strategist-A-pricing-buyers.md`)
- **Price:** Contra 30–60 s 3D listings have a median of ~$2,250 (six listings, $1,500–4,000). Fiverr 20–30 s 3D gigs run $35–211, from search snippets only. One Dribbble low-poly isometric seller lists $750. **Implication:** $300–450 is cheap for warm direct clients; test **$600–750** on the first spec clip.
- **Shopify-app buyers, a partial correction to RT-2:**
  - 30 of 50 sampled listings (60%) have **no promo video**. The sample is skewed toward wishlist/upsell apps.
  - Shopify recommends (does not require) a **promotional** listing video with **screencasts under 25%**. Those rules favour metaphor/story visuals over UI, so low-poly fits better than RT-2 assumed.
  - No evidence that video lifts installs.
  - Kept as a possible later A segment (Nathan builds Shopify apps, so it is warm-ish), not a 90-day line.
- **Reply rate:** the closest match is one self-reported freelance designer who offered a free mockup, with 6.2% replies on ~600 emails a month [W]. This is consistent with R2's 2–6% planning range; no change to the arithmetic.

## 4. B and C: closed
- **B:** killed (RT-1). Its topic insight is reused in D.
- **C:** pre-sale gate only (RT-5); $0 forecast; licence audit first.
- **Side tests that cost only Nathan's browsing:** the Whop UGC board ($1–3 per 1k), YPP application by 2027-01-31 if eligible. Neither is modelled.

## 5. Plain answer on fit with Nathan's ask (RT-7)
- **D is revenue from this content.** Low-poly videos → bio link, DM or a sent link → an offer page → a sale. It only counts when tracked. The product is Nathan's existing offer, not a new $29 product, because at our view levels a cheap product can't reach $10k and a $1k+ deal can.
- **A is not revenue from this content.** It is a separate service line that sells the style. It is kept only as a warm add-on.
- **What Nathan must decide:** does tracked agency revenue from Lowpoly content count toward "Lowpoly's $10k"? If he wants revenue that is independent of his agency, the honest answer from the evidence is that **nothing independent reaches $10k within 12 months at today's views**. The closest is a long-shot views bet (B-style), scored 1/1.

## 6. Recommendation
**Run D, with A as an add-on.** Re-aim the channel at "where local businesses leak money". Each video ends on one of Nathan's own fixes. Nathan uses the videos in his own sales, and every send is tracked.
**Weeks 1–2 (us):**
1. 5 D videos (§2.2) with sourced or labelled figures.
2. One offer page per offer (receptionist, site, Cobundle), each with UTM links.
3. A tracking sheet: sends, clicks, replies, calls, closes.
4. Meter the token cost of one master mock and one personalisation.
5. Licence audit of the kit (for C later).
**Weeks 1–2 (Nathan):**
1. Answer NATHAN-INPUTS #1–4.
2. (Licence and permit: solved per Nathan.)
3. Choose the account name and owner.
4. Tell us his plain-text reply rate and close rate, so the "does video lift it?" test has a baseline.
5. Optional: 10 min browsing the Whop board and Fiverr prices (closes R2's gaps).
**Milestones (row "receptionist $1,000 + $250/mo, 1 close/month"):** first tracked $ in Jan 2027 · $1k/month in Jan 2027 · $10k cumulative in Jun 2027. Pessimistic (0.5 closes/month, $500 + $150): $10k in Jan 2028. If the kill tests fail by Feb 2027, D falls back to "content that supports Nathan's sales" and $10k from Lowpoly content alone is not reachable in 12 months.
