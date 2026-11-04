# Lowpoly / Business Leaks: project overview (read this first)
*Last updated 2026-10-30 by the Lowpoly lead. Every agent working in this folder should read this file, then `agents/PIPELINE.md`.*

## What we're doing, in one paragraph
Nathan (UAE-based, builds websites, AI automations, integrations and custom software with AI) is building a **$10,000 revenue** business. The engine is **"Business Leaks"**: faceless 30–40 s low-poly 3D Shorts and Instagram carousels. Each one shows, with a real sourced number, where small businesses quietly lose money: unanswered inquiries, missed calls, no-shows, abandoned carts, slow sites. Every piece ends on a fix Nathan sells. **The content is a funnel:** viewer → comments or DMs "LEAK" (or visits the website) → gets a free 1-page "leak check" → a conversation → a paid fix.

## The funnel
```
Short / carousel (IG @fixtheleak_, YouTube)
   └─ CTA: Comment "LEAK" / DM "LEAK" / website link in bio
        ├─ ManyChat (IG): auto-reply + DM asking for business name + website/Maps link
        └─ Website (TO BUILD): free leak-check form, offers, proof, WhatsApp/booking
              └─ Free Lite Leak report (agents make it, Nathan sends it, ≤48 h)
                    └─ Call / WhatsApp → paid offer → monthly fee
```
Honest expectation (plan/PLAN.md): the first 1–3 clients will most likely come from Nathan's own network in the UAE, with the videos and reports as sales samples. Inbound from content builds over 6–18 months.

## What we sell (plan/PLAN.md has detail; intro → standard prices)
| Offer | What it fixes | Price |
|---|---|---|
| **First Reply** (lead offer) | Instant WhatsApp/email reply to every inquiry → CRM → automatic chase | $400 + $150/mo → $1,200 + $150/mo |
| **Show Up** | No-shows: one-tap confirm/cancel/rebook, refill the slot | $400 + $75/mo |
| **One Pipe** | One integration (trigger → destination) | $400–600 |
| **Fast Site** | 5-page fast website | $900 → $1,800 |
| **Shopify sprint** | Fix a store's top 3 leaks | $900–1,200 |
| Custom tool | After a paid build only | $2,500+ |
| **Free Lite Leak report** | The free hook: what their public reviews and site show they're losing | $0 |

Audiences: real-estate agencies, clinics, trades/home services, and online stores, **worldwide** (Nathan 2026-10-31: content must not read as Dubai/UAE-only; Nathan himself is UAE-based).

## Brand
- **Name:** Business Leaks. **Instagram:** @fixtheleak_ (with underscore). **YouTube:** being renamed from "Line item FYI" (@lineitemfyi). **TikTok:** paused.
- **Look:**
  - Shorts are low-poly 3D, "v2" brighter look (Remotion + Three.js, code-rendered). Every Short **loops**: the last line runs into the first, and the last frame equals the first.
  - Carousels are an isometric "toy 3D" style (AI art via fal + code-rendered text), 1080×1350.
- **Colours:** cream #F4E9D8, teal, warm orange-red. **Avatar:** `brand/avatar-final-1080.png`. Bios and handles: `brand/PROFILE.md`.
- **Voice:** facts first, dry wit allowed (villain monologues, POV). Never hype, never invented numbers.

## Schedule (posting/posting.py via Postiz; only the lead schedules)
- **09:00 UTC** Instagram carousel; **16:00 UTC** Short on Instagram + YouTube. Keep ≥2 days queued.
- A/B/C testing of hooks, scripts, visuals and formats, one change at a time: `plan/TESTS.md`, tracked in `posting/experiments.csv`. Weekly audit every Sunday (first: 8 Nov).

## Who's who (Claude sessions; message by session id)
| Role | Session id | Owns | Folder |
|---|---|---|---|
| **Lowpoly lead** | local_a8ef99c0-8958-441e-9f9d-6384dc334e59 | Plan, topics, fact-check sign-off, captions, **all posting**, testing audit, talks to Nathan | `agents/line-item/` (historic name) |
| Creative Editor (Shorts) | local_0f55c7e4-def7-4d65-a404-cb6e90e83227 | Short visuals, render, QA | `agents/creative-editor/`, `studio/` |
| Script & hook writer | local_8af9ac00-9cf0-4a6d-9696-323936bf8883 | Hooks, scripts, carousel text, caption drafts | `agents/script-writer/`, `plan/scripts/` |
| Carousels | local_60e4001b-34f5-49ed-a9f7-7c02d12d5e86 | Carousel design and render | `agents/carousel/`, `qa/carousel-tests/` |
| Red Team | local_0fa1dc26-02cf-4467-9665-aa24cdeeb06d | Fact-checks every figure; stress-tests plans | `plan/*factcheck*.md` |
| Researcher | local_0cd58760-9460-4e75-90de-81aa40c7aad7 | Market and source research | `plan/01-research-v5.md` |
| Strategist | local_6b594874-d4c7-4ebd-b79c-ad4a1820df2b | Offers, pricing, terms | `plan/02-strategy-v5.md`, `plan/offers/` |
| Website (Nathan is creating it) | — | The site and funnel pages | `website/` (start with `website/BRIEF.md`) |

## Folder map
| Folder | What's in it |
|---|---|
| `PROJECT.md` | This overview |
| `agents/` | `PIPELINE.md` (who hands what to whom) + each session's own STATE/NOTES. `agents/line-item/` = the lead (historic name) |
| `plan/` | `PLAN.md` (the business plan), `NATHAN-INPUTS.md` (every decision Nathan made), `TESTS.md` (testing plan), v5 research/strategy/red team, fact-checks, `offers/` (terms, First Reply spec), `lite/` (free report template), `scripts/` (scripts in progress; `*.approved.md` = final), `archive/` (older rounds) |
| `website/` | Website and funnel brief (to build) |
| `brand/` | Avatar, handles, bios; `rejected/` = old avatar tries |
| `studio/` | The video renderer (Remotion + Three.js). Final Short scripts: `studio/samples/v3/*-leaks.json` |
| `qa/` | `inbox/` = finished videos and carousels waiting for approval/posting; `carousel-tests/`, `RUBRIC.md`, `archive/` |
| `posting/` | Postiz tool `posting.py`, `captions/`, `log.csv` (every post), `experiments.csv` (test tags + results), `REPLIES-SETUP.md` (ManyChat) |
| `research/` | Older revenue research; `archive/` |
| `assets/` | Fonts, sound effects |
| `ops/` | `render_slot.py` (max 3 heavy renders at once on this Mac) |

## Rules every agent follows (Nathan's standing rules)
- **Facts:** every figure has a source and a Red Team check; max 4 figures per post; no promoting credit, investing or crypto.
- **Approval:** Nathan sees every piece before it's scheduled. New styles or formats need his OK.
- **Security:** keys live only in `.env` and are never printed. Nathan does all logins, payments, account settings and deletions. No agent contacts third parties, buys anything or creates accounts.
- **Files:** cleanup goes to `~/.Trash`, never `rm`. Commit nothing unless asked. Don't touch `/Users/a1/Projects/GoViral` (Cut Desk, a separate business).
- **Budget:** work in batches, don't poll, message other sessions only for handoffs or real blockers.
- **Honesty:** say plainly what's done, what isn't and what's unverified.

## Current status (2026-10-30)
- Scheduled: Shorts #1–#3 (31 Oct–2 Nov, IG + YT), carts carousel (1 Nov). Shorts #4–#9 fact-checked and being built. 2 more carousels being built.
- ManyChat live on IG (comment or DM "LEAK" on any post).
- **Not done:** website, link in bio, Lite report test run, First Reply demo (gate 22 Nov), Nathan's 20-name list (gate 8 Nov), stats connection (vidIQ) for testing.
