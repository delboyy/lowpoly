# Website brief: Business Leaks (for the website agent)
*From the Lowpoly lead, 2026-10-30. Read `../PROJECT.md` first. This is the goal and the constraints. Design and build choices are yours, with Nathan's approval.*

## Job of the site
Turn people who watched a Short or swiped a carousel into **leads Nathan can talk to**. The site is the destination for "link in bio" and for the free leak check. One clear action per page.

**Primary conversion:** request a **free leak check**. A short form asks for:
- name;
- business name;
- website or Google Maps link;
- business type (real estate, clinic, trades, store, other);
- WhatsApp number or email.

**Secondary:** a WhatsApp click-to-chat, or booking a 15-min call.

## Pages (minimum)
1. **Home:**
   - The promise: "Find where your business is quietly losing leads and sales, and fix it."
   - 3–4 leak examples taken from the videos (embed or loop the Shorts).
   - The free leak-check CTA.
2. **Free leak check:** the form, what they get (a 1-page report in 48 h, based on public info, no call needed) and a sample report.
3. **Fixes / services:** the offers in `../PROJECT.md` (First Reply, Show Up, Fast Site, Shopify sprint, One Pipe), each tied to the leak it fixes. Showing prices is Nathan's call.
4. **Proof:** case studies once clients agree. Until then, the sourced stats behind each leak, plus Nathan's builds (Cobundle; his 2 Shopify clients only if they agree).
5. **About / contact:** who Nathan is (UAE-based), WhatsApp, email.
6. **Legal:** privacy policy (the form collects personal data) and terms (`../plan/offers/TERMS.md` is a draft, not lawyer-checked).

## Must-haves
- **Fast and mobile-first:** our own Fast Site and page-speed videos sell speed, so the site must be fast.
- **Matches the brand:** Business Leaks; cream #F4E9D8, teal, warm orange-red; low-poly or toy-3D visuals; the avatar in `../brand/`.
- **Tracking for our A/B tests:**
  - UTM tags per post (`?utm_source=instagram&utm_campaign=<slug>`), so we can see which video or carousel sends people.
  - Privacy-friendly analytics.
  - Form submissions logged somewhere the lead can read (e.g. a Google Sheet or a CSV export), so the agents can make the Lite reports.
- **Every number on the site is sourced**, using the same facts as the videos (fact-checks in `../plan/`).
- English first; Arabic later (a selling point in the UAE).

## Decisions only Nathan makes
- Domain name and buying it, hosting account, and any paid tools (agents don't log in or pay).
- Whether to show prices.
- Which client names and logos appear.

## Hand-off with the lead
- **When the site is live:**
  - The lead adds the link to bios and captions (YouTube can link out; Instagram uses link in bio).
  - The lead updates the ManyChat DM so it also offers the form link.
- **Form submissions:** they go to the leak-check queue (`../plan/lite/`); the lead coordinates the reports.
