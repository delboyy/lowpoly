# "First Reply" demo: build spec (dummy Dubai agency; 2026-10-30)
**Goal:** by **22 Nov 2026** (PLAN gate), Nathan can show on his phone, in 2 minutes, how an inquiry gets a WhatsApp reply in under 60 seconds, lands in a CRM, and gets chased until it replies.
**Source:** `strategist-v5-first-reply-stack.md` (shared notes). Grades: A = official page, B = secondary, C = vendor/blog. [V] = verify at build. Terms: `TERMS.md`.

## 1. The dummy agency
- **"Marina Keys Real Estate"** (fictional; check that no real Dubai agency uses the name [V]), with 3 listings, e.g. 1-bed in JVC for AED 85k/yr, 2-bed in Marina for AED 1.9M.
- All data is fake. Phone numbers are Nathan's and up to 4 test phones only.

## 2. Inquiry sources (demo vs a real client)
| Source | Demo | Real client | Grade |
|---|---|---|---|
| **Portal email** (Property Finder / Bayut notification) | A Gmail inbox gets a sample lead email; n8n parses name, phone, listing, message | **Start here.** It works for any agency with no partner approval | C (format [V] from a real agency email) |
| Property Finder API / webhooks | Not in demo | Gated partner programme (PFDN); via a Bitrix24 bridge (PropBridge ~AED 99–499/mo) | A (programme exists) / C |
| Bayut | Not in demo | No self-serve API; email parse, or a partner bridge | C |
| **Website form** | A one-page Marina Keys site with a form → n8n webhook | Same | — |
| **Inbound WhatsApp** (click-to-chat link, Instagram bio) | Test number | Agency's own number | A |
| IG/FB lead ads | Not in demo | Meta Lead Ads trigger in n8n | A |

## 3. The flow
1. **Inquiry arrives** → n8n normalises it (name, phone in E.164 format, source, listing, message, consent flag).
2. **Within 60 s:** WhatsApp template "first_reply": "Hi {name}, thanks for asking about {listing} on {source}. This is Marina Keys' automated assistant. When suits you for a call or viewing? Reply 1 Today · 2 Tomorrow · 3 Send details. Reply STOP to opt out." An email copy goes out if there's no WhatsApp.
3. **Logged in the CRM** with stage "New → Contacted", and the agent is alerted on WhatsApp/email with a lead card.
4. **If the lead replies:**
   - The 24 h service window opens, so the bot answers simple FAQs (price, location, availability) only from the listing sheet, and offers viewing slots.
   - Anything else → **hand-off to the agent** (alert + the CRM stage "Needs human").
   - The chase stops.
5. **If no reply:** chase templates at **+1 h, +1 day, +3 days**, then the stage becomes "Cold". Each chaser must be a template, because outside the 24 h window only templates can be sent (A).
6. **STOP / "not interested"** → the chase halts at once; the CRM is marked opted out (PDPL).
7. **Weekly summary** to the owner: leads, median first-reply time, replies, viewings booked, leads that needed a human. This is the case-study data.

**Chase templates (submit for Meta approval):**
- **+1 h:** "Still keen on {listing}? I can share the floor plan and service charges. Reply 3."
- **+1 day:** "{listing} has had {n} views this week. Want a viewing slot?" Use a *real* figure only; drop the line if there's no data.
- **+3 days:** "Shall I close your request, or send similar homes under {budget}? Reply 1 Similar · 2 Close."

Keep the bot business-specific (booking/FAQ). Meta's Jan 2026 terms ban general-purpose AI assistants (B/C; confirm the policy wording [V]).

## 4. Stack and monthly cost
| Part | Demo pick | Real-client pick | Cost/mo | Grade |
|---|---|---|---|---|
| WhatsApp | **Meta Cloud API direct, free test number** (messages up to 5 registered phones; no business verification) | Cloud API direct on the agency's own +971 number (it needs Meta Business Verification with their trade licence), or 360dialog | $0 · 360dialog EUR 49/number | A |
| Meta message fees (UAE, from 1 Oct 2026) | ~$0 (test) | Marketing AED 0.2115; utility/service AED 0.0576; first 1,000 service messages/month free | ~AED 110–160 at 300 inquiries (worst case: chasers at marketing rate) | A |
| Automation | **n8n self-hosted** on a ~$5–6 VPS (EU region) | Same, or n8n Cloud Starter $20 (2.5k executions) | $6–20 | A |
| CRM | **Google Sheet** (demo) or Zoho CRM free/1 seat | Their CRM; else Zoho $14/user or HubSpot free | $0–14 | A |
| Email parse | Gmail + n8n IMAP node | Their inbox forwarding rule | $0 | — |
| Website form | Static page (Vercel free) | Their site | $0 | — |
| **Total** | **~$6** | **~$40–100 per agency at ~300 inquiries a month** | | |

**Margin warning:** at $150/mo intro, a 300-inquiry agency leaves ~$50–110 before Nathan's time.
- Quote **included volume: 200 new inquiries/month**; above that, billed at cost + 10% (TERMS §7).
- Ask Meta to categorise the +1 h chaser as utility [V]. It's a follow-up to the lead's own request, but Meta decides.

## 5. What Nathan must log into or set up (agents do none of it)
1. **Meta:** a Meta developer account → create an app → add the WhatsApp product → get the test number, register 4 test phones, and get a temporary + then a system-user token. **The token goes into `.env` only.**
2. **WhatsApp templates:** submit the 4 templates in WhatsApp Manager. Approval takes minutes to a day.
3. **VPS** (Hetzner or similar, EU): create it and give us SSH access. We install n8n behind HTTPS.
4. **Gmail:** a demo inbox (e.g. marinakeys.demo@…) with an app password for IMAP, stored in `.env`.
5. **Zoho CRM free** (optional), or a Google Sheet shared with the service account.
6. **Phone:** WhatsApp on his phone as a "lead", plus a second phone or a friend for the agent alerts.
**Agents build:** the n8n workflows, the template texts, the parser, the demo site, the sheet/CRM fields, the weekly summary, and a 10 s low-poly clip ("an inquiry drops into a box → a reply flies back in 0:58").

## 6. Before a real client (not needed for the demo)
- The agency's Meta Business Verification with its trade licence, and its own +971 number (not already on WhatsApp).
- A data processing agreement plus TERMS §6; a consent line on its forms; STOP handling tested.
- 1 real portal email to finalise the parser.
- Check whether Property Finder/Bayut already auto-reply for that agency (unknown, C).
- Positioning vs Sabbaq ($199–799/mo, auto-replies to portal leads): set up in person, wired into **your** WhatsApp and CRM, Arabic templates.

---
## 7. Demo script for Nathan's phone (≤2 min)
**Setup:** your phone shows WhatsApp. Laptop or second phone shows the CRM sheet. The prospect's phone is registered as a test number beforehand, or you use your own as the "buyer".
1. **(10 s) The leak:** "Almost half of property inquiries never get a reply. The ones that do usually wait hours. Let me show you a minute instead." Play the 10 s low-poly clip.
2. **(20 s) Send an inquiry:** have the prospect fill the Marina Keys form on *their* phone ("2-bed Marina, viewing this week"), or forward a sample portal email.
3. **(30 s) Watch the reply:** WhatsApp pings within ~60 s: "Hi Sara, thanks for asking about the 2-bed in Marina…". Point at the automated-assistant line: "It says it's automated. No pretending."
4. **(20 s) The CRM:** refresh the sheet. The lead is there with source, listing, time, and "first reply 0:52". The agent's phone got the alert card.
5. **(20 s) The chase:** "If she says nothing, it follows up at 1 hour, 1 day and 3 days, then stops. If she replies, it offers viewing slots and hands her to your agent. 'STOP' ends it instantly."
6. **(20 s) The close:** "Set up on your WhatsApp number and your CRM, in person, with Arabic templates. Intro price $400 setup and $150 a month for my first 3 agencies, cancel with 30 days' notice. Want me to run it on last week's inquiries and show you how many got no reply?" That last offer is the free Lite report.
**If the demo fails live:** show the screen recording kept on your phone (we record one at the 22 Nov gate).
