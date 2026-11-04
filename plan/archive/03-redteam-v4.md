# 03 · Red Team v4: "Store Leaks" (2026-10-29)
Reviews `02-strategy-v4.md` and its evidence files (`strategist-v4-shopify.md`, `strategist-v4-ai-automation.md`). Independent check: `factcheck-v4-shopify-rules.md` (Sonnet; see §5). Scores weight 30–90-day realism from ground zero. **P1** = $1k in any single month by 2027-04-30; **P2** = $10k cumulative by 2027-10-31.

## 0. Bottom line
- **The niche pick is right.** N1 beats N2 on every test, and N2's rejection is well evidenced (AI-automation packs sell for $7–30, templates are given away free, and the space is face-led). N1 is also the first plan in four rounds that matches Nathan's real brief *and* his real assets.
- **The numbers are still ~2× optimistic.** A realistic 90 days is **~$300–1,300**, not $2.3k. I estimate **~$2–5k in 12 months**, and put $10k by Oct 2027 at **~15–20%** after the §5 rules check. **P1 3 · P2 2.**
- **The fatal-if-true risk is the 10 free Leak Reports:** they cost about a month of Nathan's hours and ~30 agent-hours before anyone pays. Fix it with a "lite" free report (§2).

## 1. Attacks
### 1a. Niche: does the audience buy?
- **Two different audiences are being treated as one.** People who *watch* Shopify Shorts are mostly would-be and new store owners: even big creators' Shorts medians are only ~1–2k (Chase Chappell 1.95k, Ecom King 1.1k, Nick Theriot 934 [P]), and the Ecom King sells mentorship to beginners. People who *pay for audits* are merchants with traffic and sales to fix. **The content reaches the first group; the money is in the second, and that second group arrives through Route A (clients, Cobundle merchants), not Shorts.** That's fine, but then the content's KPI is "samples and credibility", not list growth. Kill test #3 (<50 sign-ups) tests the wrong thing for the services rungs.
- **No 3D creator in the lane** [P]: this is a real gap, but an empty lane can also mean low demand for that look. Our one hit (penny) was general-audience curiosity, not merchant content. Expect lower views than money stories, not higher.

### 1b. Digital-product demand (the $39–49 Playbook)
- **The proof is one outlier.** The $49 checklist with 129 ratings belongs to a named CRO specialist with his own audience; every other checklist in the table (6 of the 7 info products) shows **0 ratings** [P]. The evidence says "a known expert's checklist sells", not "a faceless one does".
- **The base case has 10 Playbooks in 90 days; the plan's own funnel gives 1–7**, from 50–150 sign-ups at 2–5%. At R2 rates (0.5–20 sign-ups/month from content) plus a few community posts, I'd expect **20–60 sign-ups by month 3**, so **0–3 Playbooks**. The pre-sale gate (20 sign-ups or 3 paid reports before building) is correct; keep it.

### 1c. Service pricing vs Nathan's time
| Rung | Price | Nathan h | Agent h [A] | $/Nathan-hour | Verdict |
|---|---|---|---|---|---|
| Leak Report | $195 → $295 | ~1 | 2–3 (audit) + 1–3 (custom 30 s video) | $195–295 | **Good**, if agent time is metered and capped |
| Free Leak Report (×10) | $0 | ~1 each = **~10 h** | ~30–60 total | $0 | **Too expensive:** ~1 month of his whole budget |
| Leak Fix sprint | $750–995 | 6–10 | some | $75–165 | Fine vs his $40–55/h, but **one sprint ≈ 3–4 weeks of his 2–3 h/week**. Capacity is max ~1/month, and that crowds out everything else |
| Hourly store work | $40–55/h | — | — | $40–55 | His floor; below the Western market ($80–127/h [W]) |
- **The low-poly video inside the report is the only differentiator, and also the main cost.** It is unproven that buyers value it. Template it hard: one store-world scene and 3 leak plates, with only name and numbers swapped (~30 min target). If metered above 1.5 agent-hours, drop it to stills.
- **Audit quality from public pages only:** speed (PageSpeed), theme/apps detected, PDP/cart UX, shipping-cost surprises. That's credible at $195. "Checkout friction" without placing an order is partly guesswork: label it as such, or the first buyer's experience is the brand.

### 1d. Funnel maths
- **Route A's size is unknown and may be tiny.** 2 clients plus Cobundle merchants (installs pending; I could not confirm a public listing, see §5). If Cobundle has ~10–30 merchants, "10 free reports" exhausts Route A on day one.
- **Free→paid assumption:** 10 free reports → 2–3 paid sprints or referrals [A]. No source; free audits as a lead magnet typically convert low [M]. Plan on **1 paid outcome per 10 free**.
- **Community route:** r/shopify and the Shopify Community forum restrict self-promotion (§5). A case study gets maybe one post a month, not a channel.
- **Realistic 90 days:** 1–3 paid reports ($195–585) + 0–1 sprint (~$0–900, ~35% chance) + 0–3 Playbooks if built (~$0–150) → **~$300–1,300**.


## 1e. Verifications the lead asked for
**The $49 checklist (verified by me, Gumroad page fetched 2026-10-29) [P]:**
- "The Ultimate Shopify CRO Checklist" by Hans-Christian Pedersen: $49 (`price_cents` 4900), **129 ratings, 4.9 average**, 30-day money-back guarantee.
- **The sales count is hidden** (`sales_count: null`), and there is no launch date.
- Ratings are usually a small share of buyers, so it plausibly has ~1–3k sales over its life [M]. That's real. But it is sold by a **named CRO person** under his own name, with 129 checkpoints, 189 real examples and app recommendations: an expert-brand product.
- **What it proves:** Shopify owners pay $49 for a CRO checklist from someone they trust. **What it doesn't prove:** that a faceless brand with ~0 followers can sell one. Treat it as the price ceiling and the template for the product's contents, not as a demand forecast.

**Leak Report: demand and real effort**
- **Demand:** posted prices exist ($200 Goyal, $495 Evolve, $999 Gumroad, Fiverr $25 / $125 / $695 [P/S]), but **no source shows how many sell**. Fiverr sells a 15-min video audit for $125, so a $195 faceless report is not cheap. Its edge must be the low-poly leak video plus Nathan's Shopify-dev credibility. Cold demand is unproven; warm demand is what kill test #1 measures.
- **Effort, broken down [A, meter it]:**

  | Step | Time |
  |---|---|
  | PageSpeed / Core Web Vitals run | ~5 min |
  | Crawl and screenshot home, PDP, cart and shipping pages; detect theme and apps | 20–40 min agent |
  | Write the findings and fix order | 30–60 min agent |
  | Custom 30 s low-poly video: script, plates, render, QA | **1–3 h agent** |
  | **Nathan's review** | 30–60 min |
  | **Total** | **~2.5–5 agent-hours + ~1 Nathan-hour**, mostly the video |

  At 2 reports a month that's ~5–10 agent-hours, about the same as 5–10 Shorts against the token budget. The video template is the lever: aim for ≤45 min.

**Comment-keyword funnel ("comment LEAKS") at our views**
- **Mechanics:** it needs a Meta-approved DM tool (e.g. ManyChat, which has a free tier) connected to an IG professional account, set up by Nathan. YouTube Shorts and TikTok have no equivalent auto-DM, so it's IG only.
- **No independent conversion data exists** (R2 §8: vendor case studies only; reports of automations firing for only a fraction of comments).
- **At our numbers:** ~4 IG posts a week × ~200 views ≈ 800 views. A comment rate of ~0.2–0.5% [M] gives **~2–4 comments a week**. If most of them open the DM and opt in, that's **~5–15 sign-ups a month**. That beats the bio link (~0.5–20 a month), but by month 3 it means **~15–45 list members**, so **0–2 Playbook sales**.
- **Verdict:** set it up (free, 15 min of Nathan's time), but it supports the plan; it doesn't carry it.

## 2. Fixes before go
1. **Free "Lite Leak" instead of 10 full free reports:** agent-only, a 1-page leak score + 3 findings + one 10 s generic leak clip with their store name. Nathan spends ≤10 min checking it. The full $195 report becomes the paid next step. Offer 10 Lites, and give **one full free report** only to his client #1 as the case study.
2. **Keep v3's Cobundle listing video** (v4 dropped it). It is our own app, it's the best portfolio piece, and installs are the only recurring line.
3. **Re-aim kill test #3** at "content produces ≥3 report or Lite requests", not list size.
4. **Sprint price floor $900**, and at most 1 open sprint at a time, so his hours don't capsize everything else.
5. **Meter report #1** (agent-hours, tokens/$, Nathan minutes) and publish it in `plan/` before offering any paid report.

## 3. Scores
| Route | P1 | P2 | 30–90-day realism |
|---|---|---|---|
| **N1 Store Leaks, with the fixes above** (after §5) | **3** | **2** | High: warm buyers, an agent-made offer, priced at market |
| N1 as written | 3 | 2 | Medium: the free-report cost and Playbook optimism drag it |
| N2 AI automations | 1 | 1 | Low: saturated, $0 price expectation |
| v3 app-promo videos (as a side line inside N1) | 2 | 2 | Medium; keep only as an occasional add-on |

## 4. The bet and its kill criteria
**Bet: N1 Store Leaks, warm-first.** Order: Cobundle listing video and report #1 (free, client #1, metered), then Lite Leaks for the 2nd client and for Cobundle merchants who **request one through an in-app opt-in card** (no emailing merchants: Shopify Partner terms, §5), then paid $195 reports, then a $900+ sprint. Content runs at 3–4 Shorts/week, made as report samples. The Playbook waits for its gate.
| Date | Gate | If missed |
|---|---|---|
| **2026-11-15** | Report #1 delivered and metered; Cobundle video live | Agent time per report >5 h or Nathan >1.5 h → simplify the report before offering it |
| **2026-12-15** | ≥10 Lites offered; **≥3 accepted** | <3 → wrong offer; switch to a single-issue report (speed only, or AOV only) |
| **2027-01-31** | **≥1 paid report**; content brought ≥3 Lite/report requests | 0 paid → stop the service rungs; Lowpoly = Cobundle marketing only |
| **2027-03-31** | **≥$1,000 total** | Below → $10k in 12 months is off; fall back to his hourly work + Cobundle, with content at ≤2/week |
| **2027-04-30** | ≥$1k in a month, or ≥2 sprints sold | Hold effort flat; don't add rungs |
**Honest expectation:** the first paid dollar in Dec 2026–Jan 2027, ~$300–1,300 by the end of January, ~$2–5k by Oct 2027. $10k is the upside.

## 5. Independent fact-check (Sonnet, `factcheck-v4-shopify-rules.md`): this changes Route A
1. **Emailing Cobundle merchants about audits is very likely non-compliant [P].**
   - Shopify's API Terms bar using Merchant Data (emails included) "except as necessary to provide the Application services".
   - Partner Program Agreement §2.1.2: a partner "will not email any Merchant… whose email address they have received via Shopify" without the merchant's consent (also §9.14.2).
   - Breaking this risks Cobundle's listing, so it is not worth a $195 report.
   - **Compliant route:** an opt-in card *inside the Cobundle admin* ("Want a free Lite Leak of your store? Request it"), where the merchant starts the contact. No clause found against in-app upsells of non-app services; the only ban found is on storefront branding. Nathan confirms that with the Partner terms before shipping it.
2. **Community posting is mostly closed [P/S].**
   - Shopify Community: service and app promotion only in "Ask and Offer", with disclosure and no contact details.
   - r/shopify bans promoting an app, offer or service "even if free".
   - r/ecommerce bans case studies and self-promotion.
   - So that route is about one compliant Ask-and-Offer post a month, not a channel.
3. **Cobundle's public listing was not found** (search, slugs, web). It may be unlisted, renamed or very small. **Route A's size is unknown and may be close to 0** until Nathan reads his Partner Dashboard (installs, active merchants, plan, reviews).
4. **Free audit → paid: no credible Shopify data** (vendor claims only). That keeps my 1-in-10 planning rate.

**Effect on the plan:**
- Warm reach = **2 clients + in-app opt-in requests from Cobundle merchants + IG comment-keyword requests + one Ask-and-Offer post a month.**
- The 10 Lites by 2026-12-15 now depend on the in-app card plus content, not outbound email.
- **Revised scores: N1 with the fixes = P1 3, P2 2.** Expect ~$2–5k in 12 months; $10k by Oct 2027 ~15–20%.
- New gate: **if Cobundle has <20 active merchants, the in-app card can't fill the Lite pipeline.** Then the requests have to come from content plus the 2 clients' referrals, so lower the 2026-12-15 target to **≥5 Lites requested**.
