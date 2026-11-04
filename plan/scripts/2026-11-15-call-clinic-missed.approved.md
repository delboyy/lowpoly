---
topic: clinics / missed calls
format: missed-call roleplay (two Fish voices + phone UI, faceless), second run of the A2 format
hook_style: A (number shock)
script_style: plain professional
variable_tested: script_style (plain vs A2's dry-lite in the same roleplay format); the topic also changes (clinic vs trades), so read it as directional
---
# 15 Nov Short: "Take two", clinic missed-call roleplay
Slot: Short 16:00 UTC, **2026-11-15**. Sells **instant text-back / First Reply** (clinics).
**Why a clinic, not an online store:** we have no checked call-answer figure for online stores, while the clinic figure (Peerlogic 38%) is already checked and locked in #8. **Heads-up:** that repeats #8's figure eight days later (7 Nov). Lead: if that's too soon, say so and I'll research a store version (it would need a new source).
**Worldwide:** no city, country or currency.
Voices: **NARRATOR** (calm, clear) and **CALLER** (polite, then relieved). The voicemail greeting is read by the NARRATOR voice in a "recording" tone.
Figures: **1** (38%), wording copied exactly from the locked #8 JSON. Phone times and counters are **illustrative**, with an "Illustrative call" label over the whole call sequence.
Applies the A2 fact-check fixes up front: no money counter (a missed-calls count instead), the caller hangs up **before** the tone, the second counter reads "Callers left waiting: 0" (not "customers lost"), and there's no "next number on the list" claim.
Length: ~102 words, ~36 s (plus ring and tone beats).

## Hook
- **Bar:** `38% of incoming calls went unanswered`
- **Line 1:** see the script.

## Script
| # | Voice | Line | On screen | Visual idea |
|---|---|---|---|---|
| 1 | NARRATOR | [calm, clear] In one dental group of twenty-six practices, thirty-eight percent of incoming calls in one month went unanswered. Here's one. | **38%** of incoming calls unanswered (one 26-practice dental group, Feb 2026) | Phone UI, 12:40, "Calling…", "Illustrative call" label |
| 2 | NARRATOR | That's vendor data, from a case study by Peerlogic. | Vendor case study (Peerlogic) | Ring · Ring · Ring |
| 3 | NARRATOR (as recording) | [polite, slightly tinny] Thanks for calling. We're with patients. Please leave a message. | Voicemail waveform | |
| 4 | CALLER | [polite] Hi, I was hoping to book a… *(hangs up before the tone)* | "Call ended · 0:14" | |
| 5 | NARRATOR | [flat] One missed call. Then the next. Then the next. | Counter: **Missed calls: 1 → 2 → 3** | Extra rings in the background |
| 6 | NARRATOR | Now, the same call, with one change. | Rewind wipe | |
| 7 | — | *(ring, ring)* | Missed call → text arrives 12:41: "Sorry we missed your call. Reply here and we'll find you a time." | |
| 8 | CALLER | [relieved] Oh, great. A check-up, Thursday morning? | Reply bubble | |
| 9 | NARRATOR | The front desk was still busy. But this time, the caller heard back. | Counter: **Missed calls: 1 · Callers left waiting: 0** | |
| 10 | NARRATOR | [quiet] An instant text back for every missed call. Comment LEAK and we'll check how your clinic handles them. Because | → loops to line 1 | Back to 12:40 |

## Caption draft (Instagram)
> One missed call is easy to shrug off. A month of them isn't.
>
> In one 26-practice dental group, 38% of incoming calls went unanswered in February 2026 (Peerlogic case study, vendor data). An instant text back means every caller hears back, even when the front desk is busy.
>
> Comment LEAK and we'll check how your clinic handles missed calls.
>
> #clinic #dentalpractice #healthcare #smallbusiness #businesstips

**YouTube:** the same first two paragraphs, then: Want a free leak check? DM "LEAK" to @fixtheleak_ on Instagram.

## Figures and sources
| Figure | Claim as written | Source |
|---|---|---|
| 38% | 38% of inbound calls unanswered, one 26-practice dental group, February 2026 (4,280 calls) | [Peerlogic DSO case study](https://www.peerlogic.com/post/peerlogic-dso-case-study) (grade C, vendor; the seller of the product it reports on). Wording copied from studio/samples/v3/clinic-calls-leaks.json |
| 12:40 / 0:14 / 12:41 / counters | **Illustrative call, not data** | — |

Do not repeat Peerlogic's generalisation ("the average dental practice answers 62%").

## For the Red Team
- Line 1 and its on-screen label, line 2 and the caption's second paragraph reuse the locked #8 wording.
- The voicemail ("We're with patients") is the scene's recording, not a claim about why calls go unanswered.
- "Callers left waiting: 0" describes the illustrative take two.
- The 12:40 time is a story beat. Peerlogic gives no time-of-day split.

---
## LOCKED by the lead, 2026-10-31: approved WITH the Red Team fixes
Apply every exact fix for this script in `plan/BL-PILOTS-factcheck.md` (13 Nov: a grey "Seen" label, no blue ticks; 15 Nov: hook bar "One dental group missed 38% of its calls"). Those fixes override the lines above. Worldwide wording only. Generic UIs. "Illustrative" label from frame 1.
