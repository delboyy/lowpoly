# Line Item A/B/C style test (Nathan, 2026-10-23: "do some a/b/c testing when you upload")

Styles: **A** = current receipt world · **B** = footage (real + 1950s Prelinger) · **C** = hybrid (footage hooks + Three.js 3D journey + number punches).
Design: a Latin square, so each platform gets each style once and each topic once. A style effect isn't confounded with topic or platform.

| Topic | Instagram | TikTok | YouTube (Nathan uploads) |
|---|---|---|---|
| Apple | A (posted Fri 23, 16:00 UTC) | B, Sun 25 | C |
| Delta | C, Sat 24 | A, Mon 26 | B |
| Disney | B, Sun 25 | C, Tue 27 | A |

Rule: a B/C file replaces the scheduled A only after Asset QA passes; otherwise A stays as the fallback (log it here).
Measure: views at 24h and 72h (IG from analytics/ig-views.csv; TikTok from the Analyst; YouTube from Nathan/Studio), plus likes and shares. Winner = best median index (views ÷ that platform's median) across its 3 slots. n is tiny, so treat it as a signal, not proof. Repeat with the next 3 topics.

## Restart 2026-10-26 (Nathan: "restart but start it right now")
Round 1 (old topics, where still possible): Delta C → YouTube tonight (Nathan uploads) · Disney B → TikTok Tue 27 16:00 UTC (replaced A, post cmvpjsd756bdlpi1cuuv8foo3) · Delta A TikTok Mon 26 (posted).
Round 2 (new topics, Latin square): IG: Chick-fil-A B (Tue 27), Ferrari C, Vegas A · TikTok: Chick-fil-A C, Ferrari A, Vegas B · YouTube: Chick-fil-A A, Ferrari B, Vegas C.

## Results
| Post | Style | 24h views | 72h views | Notes |
|---|---|---|---|---|
| Delta IG Sat 24 | **A (fallback)** | 140 (at ~44h) | | C failed QA ve-v26: Mastercard logo, false hook "biggest payer", hook bar in top UI zone, 1.8 s static |
| Disney IG Sun 25 | **A (fallback)** | 150 (at ~20h) | | B not built in time (session stopped Fri night) |
| Apple TikTok Sun 25 | **A (fallback)** | | | B not built |
| Delta TikTok Mon 26 | A (as designed) | | | |
| Chick-fil-A IG Mon 26 18:25 UTC | B | | | ve-v31 QA pass; moved up to today at Nathan's ask; post cmvpkqs026dqipi1cl3ci5yyn |
| Disney TikTok Tue 27 | B | | | ve-v29 QA pass; post cmvpjsd756bdlpi1cuuv8foo3 |
| Delta YouTube Mon 26 | C | | | Nathan uploads (UPLOAD.md #14) |
| Penny IG Tue 27 (low-poly, new angle) | LP | 1,685 at ~14h | | best ever; ~12× the old floor |
