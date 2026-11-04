---
topic: clinics / missed calls
hook_style: C (witty / story)
script_style: straight (control)
variable_tested: hook_style (C vs control A of BL #1–#3)
---
# BL #8 Short: The clinic phone at lunchtime
Slot: Short 16:00 UTC, tentatively 2026-11-07. Series: Front-Desk Leaks → sells instant text-back / "Never Miss".
Figures: **2** (38%, 41%). Both are **vendor data (grade C / C+)**, and the Red Team hasn't read either source yet. **Line 5 (41%) is optional:** cut it if the Quo figure doesn't hold up, and the script still runs ~32 s.

## Hook (C: witty / story)
- **Bar:** `The front desk is at lunch. The phone isn't.`
- **Line 1:** see the script.
- Bank (not for this post): A `38% of calls to one dental group: unanswered` · B `How many calls does your clinic miss?`

## Script (straight)
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | [calm] The front desk is at lunch, and the phone is ringing again. In one dental group of twenty-six practices, thirty-eight percent of calls went unanswered. | **38%** of calls unanswered (one 26-practice dental group) | Empty reception desk, ringing phone, sandwich on the counter |
| 2 | That's vendor data, from a case study by Peerlogic. | Vendor case study (Peerlogic) | Clipboard |
| 3 | More than one in three calls. | | 3 phones; 1 goes dark |
| 4 | [lowered] And a missed call doesn't always get a call back. | | Missed-call icon piles up |
| 5 | *(optional)* One call-data report found healthcare businesses returned forty-one percent of their missed calls. | **41%** of missed calls returned (healthcare, Quo) | Only some icons get a green tick |
| 6 | Maybe nobody was ignoring the phone. Maybe the front desk was checking someone in. | | Receptionist busy with a patient |
| 7 | But a caller who never gets through never gets booked. | | Empty diary slot |
| 8 | [quiet] An instant text back to every missed call means nobody's left hanging. Because | → loops to line 1 | Text bubble pops; back to the lunch scene |

Length: ~104 words (~37 s) with line 5, ~89 words (~32 s) without.

## Caption draft (Instagram)
> Front desk: at lunch. Phone: still ringing. In one 26-practice dental group, 38% of calls went unanswered (Peerlogic case study, vendor data).
>
> Want to know how many calls your clinic misses? DM "LEAK" for a free check.
>
> #clinic #dentalpractice #smallbusiness #patients #businesstips

**YouTube:** the same first paragraph, then: Want a free leak check? DM "LEAK" to @fixtheleak_ on Instagram.

## Figures and sources
| Figure | Claim as written | Source |
|---|---|---|
| 38% | 38% of calls unanswered across one 26-practice dental group | [Peerlogic DSO case study](https://www.peerlogic.com/post/peerlogic-dso-case-study) (grade C, vendor) |
| 41% (optional) | Healthcare businesses returned 41% of missed calls | [Quo, small-business callback statistics](https://www.quo.com/blog/small-business-callback-statistics/) (grade C+). **Needs checking:** sample, time window, and whether "healthcare" means clinics |

## For the Red Team
- Peerlogic: is it 38% of calls (call volume) and one group of 26 practices? Over what period?
- Quo 41%: check the exact wording, sample and period. Cut line 5 if it's unclear.
- "More than one in three" for 38% (> 33.3%).
- The lunchtime scene in the hook is story, not a claim that calls were missed at lunch. Is it too suggestive? Fallback bar: `The phone rings. The front desk is busy.`
- Line 6 is hedged per the BL #6 lesson. The fix is advice.
- Hashtags: #dentalpractice fits, because this source is a dental group.
