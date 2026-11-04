---
topic: trades / missed calls
hook_style: A | B | C   (all three written below; the lead rotates them)
script_style: straight (control, S) | witty POV (W, Nathan's pick)
variable_tested: one per post. Hook test = B or C on script S. Script test = hook A on script W.
---
> **SUPERSEDED (2026-10-30):** the Red-Team-approved final is `studio/samples/v3/trades-leaks.json` (fixes in plan/BL-SCRIPTS-2-factcheck.md). Don't build from the wording below.

# BL #6 Short: Trades' missed calls
Slot: Short 16:00 UTC, tentatively 2026-11-05. Series: Front-Desk Leaks → sells instant text-back / "Never Miss".
Other styles (villain "Voicemail Beep", deadpan) are in `agents/script-writer/drafts/bl-06-trades-calls.md`.

## How to build a test post
Pick **one hook** and **one script**. The hook replaces line 1, and its loop ending replaces the end of the last line.
Clean combinations against the control **A + S**: `B + S`, `C + S`, `A + W`.
Note: Nathan's pick (POV, burst pipe) was hook C on script W. Under one-change-at-a-time it only runs once each of C and W have been tested on their own.

## Hooks
| Style | Hook bar | Spoken line 1 | Loop ending on S | Loop ending on W |
|---|---|---|---|---|
| **A: number shock** (control) | `27% of home-services calls: unanswered` | [calm, curious] Twenty-seven percent of calls to home-services businesses go unanswered, according to Invoca's call data. | "…Because right now, remember:" | "…The water's still coming. And remember:" |
| **B: question** | `What are the odds they pick up?` | [curious] When you call a home-services business, what are the odds nobody picks up? By Invoca's call data, twenty-seven percent of calls go unanswered. | "…So next time someone asks:" | "…The water's still coming. And you wonder:" |
| **C: witty / story** | `POV: your pipe burst. Their phone rings.` | [urgent, curious] POV: water's coming through your ceiling. And by Invoca's data, twenty-seven percent of calls to home-services businesses go unanswered. | "…So, again:" | "…The water's still coming. So:" |

On screen with every hook: **27%**, "of home-services calls unanswered (Invoca)".

## Script S: straight (control), ~32 s with hook A
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | *(hook line 1)* | **27%** of home-services calls unanswered (Invoca) | A phone ringing on a van seat |
| 2 | That's more than one in four calls. | | 4 phones; 1 stays dark |
| 3 | And the person who'd answer might be up a ladder, or under a sink. | | Ladder and sink vignettes |
| 4 | They're not ignoring anyone. Their hands are full. | | Wrench in one hand, buzzing phone on the floor |
| 5 | Ring. Ring. Ring. [lowered] Voicemail. | | Voicemail icon |
| 6 | And the customer with a real job, maybe a real emergency, is left waiting. | | Caller with a bucket |
| 7 | [quiet] An instant text back when you can't pick up tells them you've seen the call and you'll ring back. *(loop ending)* | → line 1 | Text bubble pops; back to the first frame |

## Script W: witty POV, "burst pipe" (Nathan's pick), ~32 s with hook C
With hook A or B, open line 2 with "POV: water's coming through your ceiling." before "So you grab your phone…".
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | *(hook line 1)* | **27%** of home-services calls unanswered (Invoca) | Drip from the ceiling; phone in hand |
| 2 | So you grab your phone and call the first plumber you can find. | | Dial screen |
| 3 | Ring. Ring. Ring. | | Phone rings in an empty van across town |
| 4 | [lowered] Voicemail. | | Voicemail icon |
| 5 | You stand there, holding a bucket, listening to a recording. | | Bucket fills |
| 6 | That's more than one in four calls. | | 4 phones; 1 stays dark |
| 7 | [quiet] And they weren't ignoring you. They were under someone else's sink. | | Plumber under a sink, phone buzzing |
| 8 | [quiet] A text back, right away, would have told you they'd seen your call and would ring you back. | | Text bubble appears, then pops |
| 9 | [quiet] Instead? *(loop ending)* | → line 1 | Drip again |

## Caption drafts
**W:**
> Somewhere a plumber's phone is ringing under a sink. By Invoca's data, 27% of calls to home-services businesses go unanswered.
>
> Want to know how many of your calls ring out? DM "LEAK" for a free check.
>
> #plumber #electrician #hvac #trades #smallbusiness

**S:**
> By Invoca's call data, 27% of calls to home-services businesses go unanswered.
>
> Want to know how many of your calls ring out? DM "LEAK" for a free check.
>
> #plumber #electrician #hvac #trades #smallbusiness

**YouTube (either):** the same first paragraph, then: Want a free leak check? DM "LEAK" to @fixtheleak_ on Instagram.

## Figures and sources
| Figure | Claim as written | Source |
|---|---|---|
| 27% | 27% of calls to home-services businesses go unanswered (call-volume based, vendor data) | [Invoca blog](https://invoca.com/blog/how-much-missed-sales-calls-cost-home-services-businesses) (grade C+: vendor; credited out loud) |

Do not use "62% of calls unanswered" or any vendor dollar-loss model.

## For the Red Team
- Is the gloss "more than one in four" OK for 27%?
- Hook B, "what are the odds nobody picks up?", is answered with the call-share figure (27% of calls), not a per-business odds. Is that OK?
- Plumbers and electricians illustrate "home-services businesses"; the claim line keeps the exact category.
- "Hands are full" (S) and "under someone else's sink" (W) are sympathetic scenes, not claims about why calls go unanswered.
- The text-back line is advice.
