# Design — sacredscaling.com

The locked design system for this site. Read it before changing or adding a page. Extend this file when the system needs to grow; don't improvise per page.

## Genre
Editorial, utilitarian-warm. Facts first, like the Business Leaks videos: big sourced numbers, plain words, no hype.

## Macrostructure family
- **Marketing pages (home):** Stat-Led. The hero pairs a worded headline and the inline link form with a figure panel: pick a business type, see its sourced number and its Short.
- **Conversion page (/leak-check/):** a two-step form beside its reassurances. On phones the form comes straight after the heading.
- **Content pages (fixes, proof, about):** ledger rows (hairline rules, figure or name left, detail right). No card grids.
- **Legal pages:** plain prose, 44rem measure.

## Theme (tokens in `public/css/tokens.css`)
- Paper `oklch(93.8% 0.026 79)` (cream #F4E9D8), paper-2 for alternating bands.
- Ink `oklch(26.5% 0.037 189)` (deep teal-black). Never pure black or white.
- Brand teal `oklch(38.8% 0.062 190)` (#0E4F4C, from the logo): the hero panel and the footer.
- Accent `oklch(55% 0.18 33)`: buttons and figures only. A darker step of the logo's orange (#E2553B) so white button text passes contrast.

## Typography
- Display: **Bricolage Grotesque** 700–800, roman only, tight tracking (-0.025em). Figures use tabular numerals.
- Body: **Geist** 400/500/600.
- Two families, self-hosted in `public/fonts/` (OFL licences beside them). No italic headings, no eyebrow labels above section heads.

## Components
- Nav: N9 edge-aligned. Logo left; three quiet links (hidden on phones) and one orange button right.
- Footer: Ft6 letter close. A short note signed by Nathan, the main button, WhatsApp, then one line of links.
- Phones: a sticky bottom bar (button + WhatsApp) once the hero has scrolled away. Off on /leak-check/, /thanks/, legal pages and 404 (`dock: no` in page front matter).
- Shorts: bare 9:16 figures, no fake phone frame. They load and play only when on screen, and respect reduced motion.
- Buttons: pill, accent fill, 1px press. Labels never wrap.

## Copy rules
- One action per page: the free leak check. WhatsApp is the only secondary action.
- Every number links to its source, with its limits (vendor data, sponsor, age). New figure → add it to /proof/ too.
- No invented testimonials, logos or results. No city- or country-specific claims except "based in the UAE".

## Motion
Only the panel swap (180 ms opacity), button press and the FAQ chevron. No scroll reveals.
