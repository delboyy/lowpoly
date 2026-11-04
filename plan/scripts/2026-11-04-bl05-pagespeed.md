---
topic: stores / page speed
hook_style: A | B | C   (all three written below; the lead rotates them)
script_style: straight (control, S) | witty villain (W, Nathan's pick)
variable_tested: one per post. Hook test = B or C on script S. Script test = hook A on script W.
---
> **SUPERSEDED (2026-10-30):** the Red-Team-approved final is `studio/samples/v3/pagespeed-leaks.json` (fixes in plan/BL-SCRIPTS-2-factcheck.md). Don't build from the wording below.

# BL #5 Short: Page speed
Slot: Short 16:00 UTC, tentatively 2026-11-04. Series: Store Leaks → sells "Fast Site" / Shopify sprint.
Other styles (POV, myth vs reality) are in `agents/script-writer/drafts/bl-05-pagespeed.md`.

## How to build a test post
Pick **one hook** and **one script**. The hook replaces line 1, and its loop ending replaces the end of the last line.
Clean combinations against the control **A + S**: `B + S`, `C + S`, `A + W`.

## Hooks
| Style | Hook bar | Spoken line 1 | Loop ending on S | Loop ending on W |
|---|---|---|---|---|
| **A: number shock** (control) | `0.1 s faster: +8.4% retail conversions` | [calm, curious] Make a mobile site a tenth of a second faster, and retail conversions went up eight point four percent. | "…Speed it up, even a little. And remember:" | "…I'll just keep spinning. And remember:" |
| **B: question** | `Does 0.1 seconds really matter?` | [curious] Does a tenth of a second really matter? Make a mobile site that much faster, and retail conversions went up eight point four percent. | "…Speed it up, even a little. Because if you're still wondering:" | "…I'll just keep spinning. And you'll keep wondering:" |
| **C: witty / story** | `The loading spinner has one weakness` | [playful] Every loading spinner has one weakness: a tenth of a second. Make a mobile site that much faster, and retail conversions went up eight point four percent. | "…Speed it up, even a little. After all," | "…I'll just keep spinning. After all," |

On screen with every hook: **0.1 s** faster → **+8.4%** retail conversions.

## Script S: straight (control), ~31 s with hook A
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | *(hook line 1)* | **0.1 s** faster → **+8.4%** retail conversions | Phone-shaped shop; stopwatch |
| 2 | That's from a Deloitte study for Google: thirty-seven brands, over four weeks. | Deloitte study for Google, 2020 | 37 shop fronts on a shelf |
| 3 | A tenth of a second. Faster than you can say "loading". | | Stopwatch ticks once |
| 4 | And on a phone, your page is the whole shop. | | Shop folds into a phone |
| 5 | [lowered] Start with the heavy stuff: big images, extra apps, slow hosting. | | Heavy crates on the shop roof |
| 6 | Every tenth of a second you shave off is one less reason to wait. | | Crates lift off one by one |
| 7 | [quiet] Speed it up, even a little. *(loop ending)* | → line 1 | Back to the first frame |

## Script W: witty villain, "The Loading Spinner" (Nathan's pick), ~34 s with hook A
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | *(hook line 1)* [smug, theatrical] I'm the loading spinner, and I find that deeply upsetting. | **0.1 s** faster → **+8.4%** retail conversions | Giant spinner over a phone-shaped shop |
| 2 | A tenth of a second. That's not even one full spin. | | Spinner stops mid-turn, offended |
| 3 | That's from Deloitte, for Google. Thirty-seven brands, studied for four weeks. | Deloitte study for Google, 2020 | 37 tiny shop fronts |
| 4 | [delighted] But give me a slow page, and I get to stay. And spin. And spin. | | Spinner grows and casts a shadow over the cart |
| 5 | The shopper's thumb drifts toward the back button. My favourite moment. | | Thumb hovers; cart wobbles |
| 6 | [nervous] Things I hate: smaller images. Fewer apps. Fast hosting. | | Props knock the spinner smaller |
| 7 | [smug] But you're busy. *(loop ending)* | → line 1 | |

## Caption drafts
**W:**
> Our villain this week is round, grey and never in a hurry. Making a mobile site 0.1 s faster lifted retail conversions by 8.4% (Deloitte study for Google, 2020, 37 brands).
>
> Want to know how long your store keeps shoppers waiting? DM "LEAK" for a free check.
>
> #shopify #ecommerce #pagespeed #onlinestore #smallbusiness

**S:**
> A 0.1 s faster mobile site lifted retail conversions by 8.4% (Deloitte study for Google, 2020, 37 brands).
>
> Want to know how fast your store really is? DM "LEAK" for a free check.
>
> #shopify #ecommerce #pagespeed #onlinestore #smallbusiness

**YouTube (either):** the same first paragraph, then: Want a free leak check? DM "LEAK" to @fixtheleak_ on Instagram.

## Figures and sources
| Figure | Claim as written | Source |
|---|---|---|
| 0.1 s → +8.4% | A 0.1 s faster mobile site went with +8.4% retail conversions (37 brands, 4 weeks) | Deloitte Digital for Google, "Milliseconds Make Millions" (2020), [web.dev case study](https://web.dev/case-studies/milliseconds-make-millions) (grade B: Google-commissioned) |

Travel +10.1% is left out on purpose. Say "conversions", never "sales".

## For the Red Team
- Is "a tenth of a second" OK as the spoken form of 0.1 s?
- "Faster than you can say 'loading'" (S) and "not even one full spin" (W) are figures of speech, not measurements.
- "Thumb drifts toward the back button" (W) is a dramatized scene, not a claim.
- Fix tips are advice, not study findings.
