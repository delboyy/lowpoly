# Lite Leak report: HOWTO (agent steps, Nathan's time ≤10 min)
Zero contact with the business: no calls, no enquiry forms, no WhatsApp messages, no mystery shopping (Red Team §1b). Fetch public pages only; no logins, no CAPTCHA bypass.

## Inputs from Nathan (1 min)
Business name, website URL, city, and the portal it lists on (Bayut / Property Finder / Trustpilot) if known.

## Agent steps (read-only web research)
1. **Reviews (main evidence).** Find Google Maps reviews, Trustpilot and the portal profile. Collect 1–2 star and recent reviews mentioning: no answer, no reply, called N times, slow, ignored, no follow-up. Record verbatim quote (<25 words), platform, stars, month/year, URL.
   - Google Maps is often JS-only and blocked. If it can't be fetched, say so in the log and mark `Nathan: screenshot Google reviews (2 min)`. Do not bypass.
2. **Reply behaviour.** Note whether the owner replies to negative reviews (Trustpilot shows "Hasn't replied to negative reviews") and the review recency.
3. **Website.** Fetch home and /contact. Record: WhatsApp button or number, phone, office hours or after-hours info, promised reply time (exact quote), live chat, booking. Note "not visible / may be JS-rendered" honestly.
4. **Pick 3 findings** from the strongest evidence. Prefer: (a) a review quote, (b) a site gap, (c) a second quote or gap. If fewer than 3 are supportable, write fewer, never pad.
5. **Choose the fix.** Real estate and clinics: First Reply (instant WhatsApp/email reply + CRM + chase). Don't promise voice.
6. **Fill TEMPLATE.md** into `plan/lite/out/<business-slug>.md` with a source log table at the end: finding, URL, date fetched, verbatim text.
7. **Self-check:** every quote matches the source; no money figures about this business; no staff names; no fraud or quality claims; date stamped.

## Nathan's ≤10 min
- 3 min: read the draft, check each quote against the linked page.
- 2 min: delete any finding you'd be uncomfortable defending.
- 2 min: add one personal line to the CTA.
- 3 min: send it yourself (agents never send). Only to businesses on your own list.

## Do not
Contact the business; infer a leak from a rating alone; use fraud or deposit complaints (not a response leak); send a SAMPLE file.
