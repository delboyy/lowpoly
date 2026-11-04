# sacredscaling.com

The website for **Sacred Scaling**, the company behind the **Business Leaks** show (@fixtheleak_).
Decision (Nathan, 2026-10-31): Sacred Scaling is the parent brand; Business Leaks is its content series. The home hero tells visitors from a Short that Business Leaks is our show, so they know they're in the right place.

## What's here
| Path | What it is |
|---|---|
| `src/pages/*.html` | One file per page: home, leak-check, fixes, proof, about, privacy, terms, thanks, 404 |
| `src/layout.html` | Header, footer and `<head>` shared by every page |
| `site.config.json` | **The only file you normally edit**: WhatsApp, email, booking link, analytics token, show prices |
| `public/` | CSS (`tokens.css` = colours/fonts/spacing, `site.css` = layout), JS, fonts, logos (`img/mark.svg`), the Short loops (`media/`), Netlify `_redirects` / `_headers` |
| `design.md` | The design rules: read before adding or changing a page |
| `build.mjs` | Builds everything into `dist/` (`node build.mjs`, no installs needed) |

Preview locally: run `node build.mjs`, then `python3 -m http.server 4321 --directory dist`, and open http://localhost:4321.

## Settings (`site.config.json`)
| Key | What it does | Now |
|---|---|---|
| `whatsapp` | Your WhatsApp number with country code, e.g. `971501234567`. WhatsApp buttons appear only once it's set. | 971585187833 |
| `email` | Shown on contact, privacy and terms. **Create this mailbox** (or change it). | hello@sacredscaling.com |
| `bookingUrl` | A Cal.com / Calendly link. A "Book a call" card appears once it's set. | empty |
| `youtube`, `cobundleUrl` | Footer and proof links, shown once set. | empty |
| `cfAnalyticsToken` | Cloudflare Web Analytics token (free, cookieless). | empty |
| `showPrices` | `true` shows intro prices on /fixes/; `false` says "Price quoted after your free check". | `false` |

## Go live (Nathan does these; agents don't log in or pay)
1. **Hosting: Netlify (free plan).** Sign up, then "Add new site → Deploy manually" and drag the `dist/` folder in, or connect a Git repo with this folder (build command and publish folder are already in `netlify.toml`).
2. **Domain.** Netlify → Domain management → add `sacredscaling.com`. Then at your registrar either switch nameservers to Netlify's, or add the A record / CNAME Netlify shows you. HTTPS turns on by itself.
3. **Form.** Netlify detects the `leak-check` form on first deploy (Forms tab; enable form detection if asked). Then Forms → Notifications → add an email notification to yourself. Every request also includes `utm_source`, `utm_campaign`, `landing_page` and `referrer`, so you can see which post sent it. Export as CSV from the Forms tab for the Lite report queue (`plan/lite/`).
   - Free plan: 100 submissions a month. Plenty to start.
   - Optional later: Zapier/Make "Netlify new form submission → Google Sheets row" so the lead can read requests without logging in.
4. **Analytics.** Cloudflare dashboard → Web Analytics → add site → copy the token into `cfAnalyticsToken`, rebuild, redeploy.
5. **Email.** Create `hello@sacredscaling.com` (e.g. Zoho Mail free, Google Workspace, or iCloud custom domain).

## Links for bios and captions
- Link in bio: `https://sacredscaling.com/leak` (redirects to the leak check).
- Per post: `https://sacredscaling.com/leak?utm_source=instagram&utm_campaign=<slug>`. Use the same slug as `posting/experiments.csv`, so form requests line up with the A/B tests.
- Also: `/check` → leak check, `/fix` → fixes.

## Before launch: your decisions
- [ ] Show prices? Currently hidden.
- [ ] Legal trade name in the privacy policy, and one lawyer read of privacy + terms (both are drafts).
- [ ] Cobundle link, and whether to mention your 2 Shopify clients (currently unnamed).
- [ ] Read every page once.

## Editing rules
- Every number on the site has a source on `/proof/`, matching the Red Team fact-checks in `plan/`. New figure → add it to `/proof/` too.
- Worldwide audience: no city- or country-specific claims except "based in the UAE".
- To swap a Short: put a 360×640 MP4 (no audio, ~1 MB) and a `.webp` poster in `public/media/`, then change the `video` name for that business type in the `leak-data` block of `src/pages/index.html`.
- Message match: if a post's `utm_campaign` contains words like `clinic`, `trades`, `cart` or `agent`, the home page opens on that business type and the form pre-selects it.
