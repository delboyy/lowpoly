# Business Leaks pipeline (owner: Lowpoly lead, 2026-10-30)

Nathan put the lead in charge of all Business Leaks sessions. Every session follows this file.

## Daily schedule (2 posts a day on Instagram, hours apart)
| Slot (UTC) | UAE / UK | What | Where |
|---|---|---|---|
| **09:00** | 13:00 / 09:00 | Carousel (slideshow) | Instagram @fixtheleak_ |
| **16:00** | 20:00 / 16:00 | Short (low-poly 3D video) | Instagram + YouTube |

- TikTok is paused. YouTube takes the Short only.
- Keep each lane **≥2 days ahead**.
- Carousels start once Nathan has approved one carousel style.

## Who does what
| Session | Owns | Hands to |
|---|---|---|
| **Script & hook writer** ([session](#local_8af9ac00-9cf0-4a6d-9696-323936bf8883)) | Ideas, hooks, scripts and captions for Shorts **and** carousels, in several styles (wittier too) | Lead, via `plan/scripts/` |
| **Lowpoly lead** (this session) | Picks topics, Red Team fact-check, final captions and sources, **all scheduling** | Editor or carousel session |
| **Creative Editor** ([session](#local_0f55c7e4-def7-4d65-a404-cb6e90e83227)) | Short visuals, render and QA | Nathan, then the lead |
| **Carousels** ([session](#local_60e4001b-34f5-49ed-a9f7-7c02d12d5e86)) | Carousel design and slides, fal art-style tests | Nathan, then the lead |
| Red Team / Researcher / Strategist | Fact-check, research and offers on request from the lead | Lead |

## Flow
1. **Writer** drafts in `plan/scripts/<YYYY-MM-DD>-<slug>.md`:
   - hook options, the script (or slide text), a caption draft, and every figure with a source link.
   - The writer then messages the lead.
2. **Lead** gets the facts checked by the Red Team, fixes any wording, and writes the approved version:
   - Shorts: `studio/samples/v3/<slug>.json`.
   - Carousels: `plan/scripts/<slug>.approved.md`.
   - The lead then tells the editor or the carousel session.
3. **Editor or carousel session** builds it and sends it to Nathan. Once Nathan approves it, they message the lead with the path.
4. **Lead** schedules it and logs it in `posting/log.csv`.

## Handoff formats
- **Short:** `qa/inbox/bl-NN-<slug>/<id>.mp4`.
- **Carousel:** `qa/inbox/carousels/<slug>/` containing:
  - `01.png` … `NN.png` (2–10 slides, **1080×1350**, all the same size);
  - `caption.txt` (the Instagram caption ending with the "DM LEAK" CTA);
  - `sources.txt`.
- The lead posts carousels with `posting/posting.py carousel <dir> --brand lineitem --at <UTC> --go`.

## Rules for every session
- **Facts:**
  - No figure goes out without a source and a fact-check by the lead or the Red Team.
  - Max 4 figures in a post.
  - No promoting credit, investing or crypto.
- **Style:**
  - Shorts stay low-poly 3D.
  - Any new look (including fal AI art styles for carousels) needs Nathan's approval before posting.
  - Every Short loops.
- **Approvals:** Nathan sees every piece before it's scheduled.
- **Posting:** only the lead posts or schedules. No logins, purchases or outreach.
- **Housekeeping:**
  - Keys only in `.env`, never printed.
  - Cleanup goes to ~/.Trash.
  - Commit nothing unless asked.
  - Don't touch GoViral / Cut Desk.
- **Audience:** worldwide. No city- or country-specific wording unless the lead asks.
- **CTA:** Instagram uses "Comment LEAK" or "DM LEAK" (ManyChat auto-replies on any post). YouTube uses "DM LEAK to @fixtheleak_ on Instagram".
- **Token budget:** work in batches, don't poll, and message only for handoffs or real blockers.

## Testing (plan/TESTS.md)
Every script, Short and carousel carries test tags: topic, hook_style (A number / B question / C witty), script_style, visual, slides and the one variable_tested. The writer puts them at the top of the script file, and the lead copies them into `posting/experiments.csv` when scheduling. Change one thing at a time against the control.
