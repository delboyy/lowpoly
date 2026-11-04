# Business Leaks testing plan (owner: Lowpoly lead, started 2026-10-30)

Nathan: "a/b/c testing different scripts, hooks, styles, carousels… see what gets views, what gets replies, then audit it and double down on what's working."

## What we measure (per post)
| Metric | Why | Source |
|---|---|---|
| **LEAK requests per 1,000 reach** (comments + DMs) | **Main score.** Requests turn into leads, and leads turn into money. | ManyChat contacts, plus Nathan's count of business details received |
| Views / reach | Is the algorithm pushing it? | IG insights / YouTube Studio |
| Avg watched % (Shorts), swipe-through (carousels) | Does the content hold people? | IG insights |
| Shares + saves | Strongest signals for IG reach | IG insights |
| Follows from post | Audience building | IG insights |

We read numbers at **48 h** and again at **7 days**.

## Where the data comes from
- **Best (automatic, free):** Nathan connects Instagram @fixtheleak_ and the YouTube channel in vidIQ (app.vidiq.com → connect accounts; it's his login). I can then pull owner insights per post, including views, watch %, shares, saves and skip rate, with no manual work.
- **Fallback:** Nathan sends a screenshot of IG insights each Sunday, and I log it.
- **LEAK requests:** the ManyChat Contacts list, plus the leak-check requests Nathan forwards.
- **Tracking sheet:** every post's test tags go in `posting/experiments.csv`, keyed by Postiz post id.

## How we test (one change at a time)
Each lane has a **control** (the current best), and every other post changes **one** thing against it.

| Lane | Control | Round 1 variations (1–14 Nov) |
|---|---|---|
| Short hooks | **A: number shock** ("7 in 10 carts never check out") | **B: question** ("Why do 7 in 10 shoppers bail?"), **C: witty / story** ("Your checkout has a bouncer…") |
| Short scripts | Straight fact + fix | Witty voice (from the script writer) |
| Short visuals | v1 low-poly | **v2 brighter low-poly** (once Nathan approves it) |
| Carousels | **Toy 3D, 7 slides** | 5 slides vs 7; myth-vs-fact layout; another art style (one at a time) |
| Topic / vertical | — | Rotate: stores, real estate, clinics, trades. Compare which vertical gets LEAK requests |
| Format | — | Short vs carousel on the same story (carts already has both) |

Rules:
- At least **3 posts per variant** before calling a winner. Our numbers are small, so we compare rankings rather than claim statistics, and say so honestly.
- Never change two things in the same post. Topic rotation is the exception; it's tagged and compared separately.

## Weekly audit (every Sunday, lead)
1. Pull the data and fill in `experiments.csv`.
2. Rank posts by LEAK requests per 1k reach, then views, then shares + saves.
3. Decide for each lane: **keep** the winner as the new control, **drop** the loser, and pick **the next test**.
4. Write a short audit in `plan/audits/<date>.md` and send Nathan a 5-line summary.
5. Brief the writer and the builders on what to make more of.

First audit: **Sun 8 Nov** (only ~1 week of data; directional only). First real decisions: **Sun 15 Nov**.

## Added 2026-10-31 (Nathan)
| Lane | Control | Variant |
|---|---|---|
| CTA | On-screen pill only | Spoken "Comment LEAK" + LEAK flash (#1, #2, #4, #6, #8) |
| Script style | Straight/witty (current) | Overly funny; plain professional |
| Format | Low-poly 3D story | Completely different formats from the research report (each needs Nathan's OK) |
| Idea type | Evergreen leak stat | Trend-jack (topical theme flipped into a leak) |
