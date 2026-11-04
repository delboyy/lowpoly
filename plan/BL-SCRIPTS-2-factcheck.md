# Fact-check: BL #4–#6, version A (Red Team, 2026-10-30)
**Method:** web-research skill (Jina Reader). I read all three primary pages in full:
- VA study: PMC4714455 (full text).
- Deloitte for Google: the web.dev case study "Milliseconds make millions", published 2020-06-24.
- Invoca: its blog post (republished 2026-07-07).

No subagents were needed.

**Update, final files.** The lead asked for the final files in `plan/scripts/` to be checked:
- `2026-11-03-bl04-noshows.md`, `2026-11-04-bl05-pagespeed.md` and `2026-11-05-bl06-trades-calls.md` match the drafts word for word, so the line verdicts below apply unchanged. Final-only additions are noted in each section.
- The two carousels are at the end of this file.
- **Handle:** @fixtheleak_ is correct. The lead confirmed Nathan rebranded to "Business Leaks" on 2026-10-30; see `NATHAN-INPUTS.md` and `brand/PROFILE.md`.

**Verdict.** All three can be rendered once the lines below are fixed. **#4 is the only one with a real problem:** its fix line ("a reminder the day before") is the one thing *its own source* tested and found barely works. Re-word that line before rendering. The visuals stand as written, except the line-6 prop in #4 (see below).

---

## #4 No-shows, A "The Empty Chair". Needed by ~1 Nov
**What the source actually says (PMC4714455, Hamid et al., VA Houston):**
- **18.8%** is the mean no-show rate (SD 2.4%) across **10 main outpatient clinics at one VA medical center**: the Michael E. DeBakey VA Medical Center in Houston, FY1997–2008.
  - It is **not** a figure for the whole VA system.
  - The 10 clinics are audiology, cardiology, dermatology, eye, GI, mental health, orthopaedics, podiatry, primary care and urology. **There's no dental clinic.**
- A **no-show** includes **late same-day cancellations** too short-notice to refill the slot. **Nothing in the study says the appointments were "confirmed".**
- **$196** is the average cost per no-show **in 2008**: $28.66M across 146,358 no-shows.
  - It is the **hospital's** cost, mostly the staff who are paid whether or not the slot is used.
  - VA care costs patients little or nothing and has no no-show penalty. The authors say so, so private clinics may differ.
- **Reminders:**
  - Reminder *letters*, started in 2004: the rate fell from 18.17% to 16.96% on average, but a month-matched test found **no significant change (p = 0.70)**.
  - A centralised phone system: the rate fell from **16.3% to 15.2%**, a significant but modest drop. The abstract calls reminders "only modestly" effective.

| # | Line (as drafted) | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `I'm the empty chair. 18.8%.` | OK | — |
| 1 VO | "In one US health system, the average no-show rate was eighteen point eight percent. Hi. I'm the empty chair." | **FIX** (it's one hospital, not a system) | "**At one big US veterans' hospital, the average no-show rate was eighteen point eight percent.** Hi. I'm the empty chair." |
| 1 on screen | "18.8% average no-show rate (one US health system)" | **FIX** | "**18.8%** average no-show rate (one US VA hospital, 10 clinics)" |
| 2 | "That's nearly one in five appointments. Booked, confirmed, and then… me." | **FIX** ("confirmed" is unsupported; the gloss is fine) | "That's nearly one in five appointments. **Booked, and then…** me." |
| 3 | "The numbers come from the VA, the US veterans' health system." | **FIX** (a small precision fix) | "The numbers come from **a VA hospital in Houston, twelve years of records.**" |
| 4 VO | "…it costs about a hundred and ninety-six dollars. In 2008 money." | **FIX** (say who pays; "2008 money" is fine but "dollars" is cleaner) | "And every time I sit in for a patient, **it costs the hospital** about a hundred and ninety-six dollars. **In 2008 dollars.**" |
| 4 on screen | "~$196 per no-show (2008 $)" | OK | — |
| 5 | "The doctor's ready. The room's ready. The coffee's ready. Nobody comes. Delicious." | OK (dramatization; it matches the study's cost logic: staff paid, slot empty) | — |
| 6 | "Do you know what I hate? A reminder the day before. And an easy way to rebook." | **FIX** (this source found reminders barely moved the rate; lead with what makes the cost: an unfilled slot) | "[nervous] Do you know what I hate? **A one-tap way to cancel or rebook, so someone else gets my seat.**" |
| 6 visual | "Phone buzzes; chair flinches" | OK; optional: a second figure sits down in the chair | — |
| 7 | "But hey, it's a busy week. Pull up a seat. Because" | OK | — |
| Description | "In one US health system, the average no-show rate was 18.8%, and each no-show cost about $196 (in 2008 dollars)." | **FIX** | "**At one US veterans' hospital, the average no-show rate was 18.8%, and each no-show cost the hospital about $196 (2008 dollars).**" |
| Hashtags | #dentist | **CUT** (the study has no dental clinic; don't imply it) | #clinic #doctor #appointments #smallbusiness #businesstips |

**Final-file additions (#4):**
- Hook option 3, `Booked. Confirmed. Empty.`, is **CUT** ("confirmed" is unsupported). It wasn't picked anyway.
- The final file suggests "the health system" as the payer. The source costs it at **the medical center** (MEDVAMC cost per encounter), so "the hospital" is accurate. "The health system" isn't false, but it's looser.
- The final's figures table says "one US health system (VA, FY1997–2008)". FIX: "**10 clinics at one VA medical center (Houston), FY1997–2008**".

**The writer's questions:**
- **"Nearly one in five":** OK.
- **Who bears the cost:** the hospital. Say so (line 4).
- **"2008 money":** acceptable, but use "2008 dollars".
- **Dramatized lines:** OK.
- **The fix line:** keep it as advice, but don't make the reminder the hero, because the cited study undercuts it.
  - If you want reminders anyway, use: "A text the day before, with one tap to cancel or rebook."
  - Never imply the VA study showed reminders work.
  - Better evidence exists in the Cochrane review of mobile text reminders (Gurol-Urganci 2013), which found attendance up modestly vs no reminder. I haven't re-read that review this round. **Verify it before quoting any number from it.**

---

## #5 Page speed, A "The Loading Spinner"
**What the source actually says (web.dev case study of "Milliseconds Make Millions"):**
- Commissioned by Google and run by 55 and Deloitte.
- **37 leading European and American brand sites**, across retail, luxury, travel and lead-gen; 30M+ sessions.
- Mobile load times were **monitored hour by hour for 30 days at the end of 2019**. It is **observational**: speed was tracked, not deliberately changed.
- "A 0.1 s improvement" means 0.1 s on **four** metrics, on every page of the journey.
- **Retail conversion rate +8.4%** (relative uplift, not percentage points); retail spend +9.2%. Travel +10.1% is correctly left out.

| # | Line (as drafted) | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `The loading spinner fears 0.1 seconds` | OK | — |
| 1 VO | "Make a mobile site a tenth of a second faster, and retail conversions went up eight point four percent…" | **FIX** (the study tracked speed rather than changing it, and it's the conversion *rate*) | "**When mobile sites got a tenth of a second faster, retail conversion rates rose eight point four percent.** I'm the loading spinner, and I find that deeply upsetting." |
| 1 on screen | "0.1 s faster → +8.4% retail conversions" | **FIX** (small) | "**0.1 s faster → +8.4% retail conversion rate**" |
| 2 | "A tenth of a second. That's not even one full spin." | OK (a joke, not a claim) | — |
| 3 | "That's from Deloitte, for Google. Thirty-seven brands, studied for four weeks." | **FIX** (the source says 30 days, and the brands aren't all retail) | "That's from Deloitte, for Google. **Thirty-seven big brands, tracked for thirty days.**" |
| 3 visual | "37 tiny shop fronts on a shelf" | OK (a stylised count) | — |
| 4 | "But give me a slow page, and I get to stay. And spin. And spin." | OK | — |
| 5 | "The shopper's thumb drifts toward the back button. My favourite moment." | OK (dramatized; no figure claimed) | — |
| 6 | "Things I hate: smaller images. Fewer apps. Fast hosting." | **FIX, minor** (Shopify hosting is fixed, so "fast hosting" isn't something a Shopify merchant can buy, and our audience is Shopify) | "Things I hate: **smaller images. Fewer apps. Less code on the page.**" |
| 7 | "But you're busy. I'll just keep spinning. And remember:" | OK | — |
| Description | "Making a mobile site 0.1 s faster lifted retail conversions by 8.4% (Deloitte for Google, 2020, 37 brands)." | **FIX** | "**When mobile sites were 0.1 s faster, retail conversion rates were 8.4% higher (Deloitte for Google, 2020, 37 brands).**" |

**Final-file additions (#5):**
- The line 3 on-screen text "Deloitte study for Google, 2020" is OK.
- Hook option 2 (not picked), `0.1 s faster: +8.4% retail conversions`, is OK as a hook bar. If space allows, use "+8.4% retail conversion rate".
- Figures table: change "37 brands, 4 weeks" to "**37 brands, 30 days (late 2019), observational**".

**The writer's questions:**
- **"A tenth of a second":** OK.
- **Dramatized behaviour:** OK.
- **Tips:** OK as advice, with the Shopify-hosting swap above.

---

## #6 Trades' missed calls, A "POV: burst pipe"
**What the source actually says (Invoca blog):**
- "Our research found that **27% of calls to home services businesses are not answered**." The page links to another Invoca post and gives no year or sample.
- Invoca's platform serves **large, multi-location** home-services firms ("thousands of sales calls per day to their locations, franchises and service partners"). It's **not** one-van plumbers.
- Grade C+: label it as Invoca's data, as the script already does.
- A useful figure from the same page: "**less than 3% of callers who get pushed to voicemail leave a message**" (Invoca platform data).

| # | Line (as drafted) | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `POV: your pipe burst. Their phone rings.` | OK | — |
| 1 VO | "…by Invoca's data, twenty-seven percent of calls to home-services businesses go unanswered." | OK | — |
| 1 on screen | "27% of home-services calls unanswered (Invoca)" | OK | — |
| 2 | "So you grab your phone and call the first plumber you can find." | OK (a plumber is a fair example of home services) | — |
| 3 / 4 | "Ring. Ring. Ring." / "Voicemail." | OK | — |
| 5 | "You stand there, holding a bucket, listening to a recording." | OK; optional upgrade, using the same source: "**And like ninety-seven percent of callers, you don't leave a message.**" (Invoca platform data, "less than 3% leave a message.") Only use it if the figure count allows, since it adds a figure. | — |
| 6 | "That's more than one in four calls." | OK (27% > 25%) | — |
| 6 visual | "4 phones, 1 stays dark" | OK (1 in 4 is the floor of "more than one in four") | — |
| 7 | "And they weren't ignoring you. They were under someone else's sink." | **FIX** (it states a cause, and Invoca's data comes from large firms where the causes are staffing, IVRs and after-hours, not one person's hands) | "And **maybe** they weren't ignoring you. **Maybe** they were under someone else's sink." |
| 8 | "A text back, right away, would have told you they'd seen your call and would ring you back." | OK (advice, worded as a hypothetical) | — |
| 9 | "Instead? The water's still coming. So:" | OK | — |
| Description | "By Invoca's data, 27% of calls to home-services businesses go unanswered." | OK | — |
| Hashtags | #hvac etc. | OK | — |

**The writer's questions:**
- **"More than one in four":** OK.
- **Plumber or electrician as the example:** OK.
- **"They were on a job":** make it "maybe" (line 7).
- **Text-back:** OK as advice.

---

## Carousel: "5 leaks costing your agency leads" (`2026-11-02-carousel-agency-leaks.md`)
Sources: the WAV PDF (read directly for BL-SCRIPTS-1) and HBR 2011 (via the PDF copy in `factcheck-v5-receptionist.md`).

| # | Line | Verdict | Exact replacement |
|---|---|---|---|
| Hook 1 | "5 leaks quietly costing your agency leads" / "Leak #1 is in your inbox right now." | OK | — |
| Hook 3 (not picked) | "Almost half of buyer inquiries never got a reply from an agent" | OK | — |
| 2 body | "…**48%** of home-buyer inquiries never got a reply from an agent. They asked. Nobody answered. Awkward." | **FIX** (portals auto-replied, so it's not literally "nobody") | "…48% of home-buyer inquiries never got a reply from an agent. They asked. **No agent answered.** Awkward." |
| 2 small print | "WAV Group for Weichert, 2013–14, 384 inquiries; auto-replies not counted" | OK. Optionally add "11 US states". | — |
| 3 body | "Reply within an hour and you're ~7× likelier to qualify the lead than if you wait even an hour longer…" | OK | — |
| 3 small print | "HBR 2011, 1.25M web leads at 42 US companies (all industries)" | OK. "(all industries)" plus the generic "you" in the body is enough; the body doesn't claim agencies. | — |
| 4 body | "In a test of US companies, **23%** never replied to a web lead at all. Not late. Never." | OK | — |
| 4 small print | "HBR 2011, audit of 2,241 US firms (all industries)" | OK | — |
| 5 | Contact form / "Send yourself an inquiry tonight and time the reply." | OK (a self-check prompt; no claim) | — |
| 6 | "The 11 pm message… If the answer is 'nothing', that's the leak." | OK | — |
| 7 | "…Your agents still close; the leak just stops." | **FIX** (an absolute promise) | "Your agents still close; **no inquiry waits for a first reply.**" |
| Caption | "…48% of home-buyer inquiries never got a reply from an agent (WAV Group, 2013–14)." | OK (it already says "one US study"; keep that, since the hashtags include #dubairealestate) | — |
| Figures table | Lead to add the PDF link | **FIX** | 48% source: https://www.wavgroup.com/wp-content/uploads/2014/01/AgentResponsivenessStudy2013Final.pdf (384 inquiries, 11 US states, broker sites + Zillow/Trulia/Realtor.com, auto-responders excluded, done for Weichert) |

**Red Team questions:**
- **Is "(all industries)" enough?** Yes.
- **Slides 5–6:** OK as prompts.
- **US-only and old data:** the small print carries it.
  - Don't put a year-free "48%" on the hook slide without "one US study".

## Carousel: "Meet the 4 villains hiding in your checkout" (`2026-11-03-carousel-checkout-villains.md`)
Baymard's live page was read on 2026-10-30 (70.22%, 50 studies; reasons among non-browsers: extra costs 40%, account creation 18%). Deloitte: same notes as #5.

| # | Line | Verdict | Exact replacement |
|---|---|---|---|
| Hook 1 + sub | "Meet the 4 villains…" / "Number 4 is faster than you think. That's the problem." | OK | — |
| Hook 3 (not picked) | "7 in 10 online carts never check out. Here's who's responsible." | **FIX if used** (42% of abandoners were "just browsing", so the villains aren't responsible for all of it) | "7 in 10 online carts never check out. **Meet some of the culprits.**" |
| 1 | "Don't mind us. We just work here." | OK | — |
| 2 | "**7 in 10** online carts are abandoned before checkout." / Baymard, 50 studies, 70.22% | OK | — |
| 3 | "For shoppers ready to buy, the top reason they left: extra costs at checkout…" | OK | — |
| 3 small print | "Baymard checkout survey (excluding 'just browsing')" | OK. Optionally add "US shoppers". | — |
| 4 fact | "**Nearly 1 in 5** left because the site made them create an account." | **FIX** (18% is of shoppers who weren't just browsing, not of all shoppers) | "**Nearly 1 in 5 shoppers ready to buy have left a cart because the site made them create an account.**" |
| 4 small print | "Baymard, 18%" | **FIX** | "Baymard, 18% of US shoppers who weren't just browsing" |
| 4 quote | "Twelve characters. One symbol…" | OK (character voice) | — |
| 5 fact | "Making a mobile site **0.1 s** faster lifted retail conversions **+8.4%**." | **FIX** (as in #5: the study was observational, and the figure is a rate) | "**When mobile sites were 0.1 s faster, retail conversion rates were 8.4% higher.**" |
| 5 small print | "Deloitte study for Google, 2020, 37 brands" | OK. Optionally add ", 30 days". | — |
| 6 | "Show the full price early. Let people check out as a guest. Make pages lighter: smaller images, fewer apps." / "Advice, not study findings" | OK | — |
| 7 | CTA | OK | — |
| Caption | "…a 0.1 s faster mobile site lifted retail conversions by 8.4%…" | **FIX** | "…**when mobile sites were 0.1 s faster, retail conversion rates were 8.4% higher** (Deloitte study for Google, 2020)." |
| Figures table | "Retail conversions, 37 brands, 4 weeks" | **FIX** | "Retail conversion rate, 37 brands, 30 days (late 2019), observational" |

**Red Team questions:**
- **Quotes:** OK as character voice.
- **Slide 6:** OK.
- **"Nearly 1 in 5" for 18%:** the gloss is fine, but the base must be "shoppers ready to buy" (slide 4 fix).

## All three
- **Caption CTA:** "DM LEAK" only auto-triggers on Instagram. On YouTube and TikTok use "comment LEAK" with Nathan replying by hand, or "link in bio" (same note as BL-SCRIPTS-1).
- **No new figures** may be added beyond those listed above.

---

# BL #7–#9 (Red Team, 2026-10-30)
**Method:** web-research skill (Jina Reader). Sources read directly this round:
- Peerlogic's case-study post (published 2026-10-26).
- Quo's callback-statistics post (published 2026-08-20).
- WAV PDF and VA paper PMC4714455: the copies read for BL #3 and #4, re-checked for the exact lines.

**Verdict:**
- **#7:** fine after small fixes.
- **#8:** fine after small fixes. The Quo line survives with exact wording, but I'd cut it.
- **#9 needs a rebuild of the hook and line 1** before rendering. Its headline figure is the weakest number in the paper:
  - The "phone system" was a **central booking line**, not clearly a reminder system.
  - Its data falls **after** the 12-year window.
  - The paper gives **two different "after" figures**: 15.8% in the abstract, 15.2% in the body.

## BL #7: "How long do agents take to reply?" (`2026-11-06-bl07-agent-reply-time.md`)
**What the source says:**
- The WAV results block lists: "52% – percent that responded to initial contact*", "5.3 hours – average response time", and "*… we did not count the auto-responder". So **5.3 h is the agents' average among the inquiries that got a human response; auto-replies were excluded.** "The agents who replied took 5.3 hours on average" is right.
- **Heads-up:** the same PDF's narrative later says "the national average is 52% of leads responded to in **15 hours**". That contradicts its own results table. Use 5.3 h (the results block) and don't quote 15 h.

| # | Line | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `How long do agents take to reply?` | OK | — |
| Bank A | `Agents who replied took 5.3 hours on average` | OK | — |
| Bank C | `A buyer asks at breakfast. The agent replies after lunch.` | OK as story (5.3 h from ~8 am lands ~1 pm), but only if 5.3 h is on screen in the same post; it's an average, not a typical case | — |
| 1 VO | "…In one US study, the agents who replied took five point three hours on average." | OK | — |
| 1 on screen | "5.3 h average reply time (agents who replied)" | OK | — |
| 2 | "And forty-eight percent of buyer inquiries never got a reply from an agent." | OK | — |
| 2 on screen | "48% no reply from an agent" | OK | — |
| 3 | "That's from a study done for the brokerage Weichert." / "US study, 2013–14 (WAV Group for Weichert)" | OK. The map of 11 US states is accurate. | — |
| 4 | "Now compare that with research on sales leads in general." | OK. It's a clear enough bridge to the separate, cross-industry study. | — |
| 5 | "Reply within an hour, and you're nearly seven times likelier to qualify the lead than if you wait even an hour longer." / "~7× likelier to qualify the lead (HBR 2011)" | OK | — |
| 6 | "An instant first reply means no buyer waits in silence…" | **FIX, minor** (absolute promise) | "[quiet] An instant first reply means **buyers don't wait in silence.** So next time someone asks you:" |
| Caption | "…Reply within an hour and you're ~7× likelier to qualify a lead (HBR, 2011)." | **FIX** (add the comparison) | "…Reply within an hour and you're ~7× likelier to qualify a lead **than an hour later** (HBR, 2011, all industries)." |

**Red Team questions:**
- **5.3 h:** human replies only (auto-replies excluded); among the 52% that got a reply.
- **The bridge:** enough.
- **Fix line:** advice, OK.

## BL #8: "The clinic phone at lunchtime" (`2026-11-07-bl08-clinic-missed-calls.md`)
**What Peerlogic says:**
- It "tracked every inbound call across a 26-practice dental group in **February 2026**", "**4,280** patient calls over a single month".
- "**38%** went unanswered" and "a 62% answer rate". That is **share of inbound calls**, i.e. call volume.
- **Peerlogic is the seller of the AI follow-up product it is reporting on (grade C).** Its own page then generalises: "the average dental practice answers 62%… 38% of patients who call a dental office get no response." **Don't repeat that generalisation**: it's one group, one month.

**What Quo says:**
- "We analyzed **16.7M missed calls** logged in Quo from real Quo customers, across **three months**."
- "A 'callback' was identified as any **outbound call** from the business to the caller's number **within 48 hours**."
- "Average callback rate for healthcare: **41%**." Quo doesn't define "healthcare" or give its sample size; only professional services is sized, at 3.96M.
- Texts don't count as callbacks.
- These are Quo customers (people who bought a business phone app), not a random sample. Grade C.

| # | Line | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `The front desk is at lunch. The phone isn't.` | OK (story; line 6 hedges the cause). Use the fallback `The phone rings. The front desk is busy.` only if you want zero implied timing. | — |
| 1 VO | "…In one dental group of twenty-six practices, thirty-eight percent of calls went unanswered." | **FIX** (add the period and "incoming") | "…In one dental group of twenty-six practices, thirty-eight percent of **incoming calls in one month** went unanswered." |
| 1 on screen | "38% of calls unanswered (one 26-practice dental group)" | **FIX** | "**38%** of incoming calls unanswered (one 26-practice dental group, Feb 2026)" |
| 2 | "That's vendor data, from a case study by Peerlogic." / "Vendor case study (Peerlogic)" | OK | — |
| 3 | "More than one in three calls." / "3 phones; 1 goes dark" | OK (38% > 33.3%) | — |
| 4 | "And a missed call doesn't always get a call back." | OK | — |
| 5 (optional) | "One call-data report found healthcare businesses returned forty-one percent of their missed calls." | **Holds up as vendor data, but I'd CUT it.** If kept, it must say who, what counts and the window. | "One phone company's data found healthcare businesses **called back forty-one percent of missed calls within two days.**" On screen: "**41%** of missed calls called back within 48 h (healthcare, Quo customer data)" |
| 6 | "Maybe nobody was ignoring the phone. Maybe the front desk was checking someone in." | OK (hedged) | — |
| 7 | "But a caller who never gets through never gets booked." | **FIX** (they may call back; not sourced) | "But a caller who can't get through **might book somewhere else.**" |
| 8 | "An instant text back to every missed call means nobody's left hanging. Because" | **FIX, minor** | "[quiet] An instant text back to every missed call means **every caller hears back.** Because" |
| Caption | "…In one 26-practice dental group, 38% of calls went unanswered (Peerlogic case study, vendor data)." | **FIX** | "…In one 26-practice dental group, 38% of incoming calls went unanswered **in February 2026** (Peerlogic case study, vendor data)." |
| Hashtags | #dentalpractice | OK (the source is dental) | — |

**Why cut line 5:**
- It's a second vendor stat from a different sample, with an undefined "healthcare".
- Its 48-hour, phone-only callback rule excludes texts, which is exactly the fix being sold. That muddles the message.
- Without it, the script runs ~32 s.

**Red Team questions:**
- **Peerlogic:** inbound call volume, one group of 26 practices, February 2026, 4,280 calls.
- **"More than one in three":** OK.
- **The lunchtime hook:** OK.
- **Line 6:** OK as hedged.

## BL #9: "The Empty Chair returns" (`2026-11-08-bl09-reminders-chair.md`)
**What the VA paper says (re-checked):**
- **Phone system:** "the MEDVAMC applied a new centralized phone system in **October 2008**. Using the centralized phone system, only one toll free number is used to **handle scheduling of appointments** for all clinics."
  - That is a **central booking line**. Only the abstract calls it "a centralized phone reminder".
  - Data: Oct 2008–Mar 2009 vs the same months a year earlier (6 months).
  - Body: "decreased from 16.3% in 2008 to **15.2%** in 2009". **Abstract:** "from 16.3% down to **15.8%**". The paper contradicts itself.
  - October 2008 is FY2009, **outside** the FY1997–2008 window.
- **Letters:** "A reminder-letter system is used … since 2004."
  - "The average of no-show rates for 4 years before applying the reminder system was **18.17%** while the mean decreased to **16.96%** for 4 consecutive years after."
  - Month-matched test, 2004 vs 2005: "the no-show rate **did not change** after implementing the reminder system (p = 0.70)".
- **Exact abstract wording:** "implementation of a reminder system **only modestly reduced** the no-show rate."
  - Not "only modestly effective".

| # | Line | Verdict | Exact replacement |
|---|---|---|---|
| Hook bar | `Phone reminders: no-shows 16.3% → 15.2%` | **CUT** (a booking line, not clearly reminders; the paper gives two "after" figures) | `Reminder letters: no-shows 18.2% → 17.0%` |
| Bank B | `Do appointment reminders actually work?` | OK | — |
| Bank C | `The empty chair is back. Reminders didn't stop it.` | **FIX** (they did nudge the raw rate down) | `The empty chair is back. Reminder letters barely moved it.` |
| 1 VO | "…when a central phone reminder system came in, the no-show rate went from sixteen point three percent to fifteen point two…" | **FIX** (rebuild on the letters) | "[smug, theatrical] At one big US veterans' hospital, **the no-show rate averaged eighteen point two percent in the four years before reminder letters. In the four years after: seventeen.** Hi again. Empty chair. Barely noticed." |
| 1 on screen | "16.3% → 15.2% no-show rate after phone reminders (one US VA hospital)" | **FIX** | "**18.2% → 17.0%** no-show rate, 4 years before vs after reminder letters (one US VA hospital)" |
| 2 | "Same hospital in Houston. Twelve years of records." | OK (the letters fall inside FY1997–2008) | — |
| 3 | "Reminder letters? Tried those too. In a month-by-month comparison: no real change." | **FIX** (the letters are now line 1; "no real change" → "no significant change") | "[delighted] **And when researchers matched it month by month, the change wasn't even statistically significant.**" |
| 4 | "The researchers called reminders only modestly effective. I call them a nice try." | **FIX** (exact wording) | "The researchers said reminders **only modestly reduced** no-shows. I call them a nice try." |
| 4b (optional, new) | (none) | Optional: "A new central booking line later shaved off a little more." Use **no figure**. | — |
| 5 | "Because a reminder doesn't fill my seat. Somebody else does." | OK (the logic of the fix) | — |
| 6 | "What actually scares me? A one-tap way to cancel or rebook, so someone else gets the slot." | OK (advice) | — |
| 7 | "Anyway. I'll save you a seat. And remember:" | OK | — |
| Caption | "…not worried about your reminder **texts**. At one US VA hospital, a phone reminder system took no-shows from 16.3% to 15.2%. Reminder letters showed no real change in a month-matched test (Hamid et al.)." | **FIX** (texts were never tested; drop the phone figure) | "The empty chair is back, and it's not worried about your reminder **letters**. At one US VA hospital, no-shows averaged 18.2% in the 4 years before reminder letters and 17.0% after, and a month-matched test found no significant change (Hamid et al., VA Houston)." |
| Hashtags | no #dentist | OK | — |

**The generalisation to watch:** this study tested **mailed letters** at a hospital where care is free and no-shows carry no penalty, in the 2000s. It says nothing about **text** reminders.
- Keep every line scoped to "this hospital" or "reminder letters", and never "reminders don't work" in general.
- Text-reminder trials (e.g. Cochrane, Gurol-Urganci 2013, not re-read this round) are more positive. A viewer who knows that will call it out.

**Strategy note for the lead:** this doesn't undercut "Show Up" as long as Show Up's pitch is "**one-tap cancel/rebook + a waitlist that refills the slot**". Text reminders can stay in the package as a bonus. Don't promise a no-show reduction from the reminders alone.

**Red Team questions:**
- **Reminder system or booking line?** A booking line. Don't call it a reminder system.
- **Within FY1997–2008?** No (Oct 2008).
- **"No real change":** use "not statistically significant".
- **"Only modestly effective":** not the exact words. The quote is "only modestly reduced the no-show rate".
- **Lines 5–6:** OK.
- **No #dentist:** correct.

## BL #9 re-check, rebuilt version (2026-10-30)
**Verdict: OK to render.** All figures match the paper:
- 18.17% → 18.2%.
- 16.96% → 17.0%, spoken "seventeen".
- p = 0.70 → "not significant".

| Item | Verdict | Note |
|---|---|---|
| Hook bar `Reminder letters: no-shows 18.2% → 17.0%` | OK | — |
| Bank B / C | OK | — |
| 1 VO + on screen | OK | "Seventeen" for 17.0% is fine. |
| 2 | OK | — |
| 3 "…when researchers matched it month by month, the change wasn't even statistically significant." | OK | The test compared 2004 with 2005 month by month, not the two 4-year blocks. "It" is loose but not false. Optional, more precise: "And when researchers compared the year before and after, month by month, the change wasn't even statistically significant." |
| 4 "The researchers said reminders only modestly reduced no-shows." | OK | The abstract applies this phrase to its reminder system as a whole, and the script says "reminders", not "letters". |
| 5–7 | OK | Unchanged. |
| Caption, paragraph 1 | OK | — |
| Caption, new sentence "What it does worry about: a one-tap way to cancel or rebook, so someone else gets the slot." | OK | Advice, matching line 6; no figure. |
| Figures table | OK | — |
| Skip line 4b | OK | — |
