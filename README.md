# Business Leaks Studio

A small team of AI agents that makes faceless, low-poly 3D explainer videos and Instagram carousels about where small businesses quietly lose money: unanswered inquiries, missed calls, no-shows, abandoned carts and slow websites.

Each piece is built around one real, sourced number, gets fact-checked before it ships, and loops seamlessly (the last frame matches the first). The content feeds a simple funnel: viewers comment or DM "LEAK", get a free one-page leak check, and can then buy a fix.

**Channels:** Instagram [@fixtheleak_](https://www.instagram.com/fixtheleak_/) · YouTube Shorts · Website: [sacredscaling.com](https://sacredscaling.com)

## How it works

```
research → script & hook → fact-check (Red Team) → render → QA → human approval → scheduled post
```

Each step is owned by a separate Claude Code session with its own folder and state file:

| Agent | Job |
|---|---|
| Lead | Picks topics, signs off facts and captions, schedules every post, runs the A/B tests |
| Researcher | Finds market data and primary sources |
| Script writer | Hooks, 30–40 s scripts, carousel copy |
| Red Team | Checks every figure against its source and stress-tests plans |
| Creative editor | Builds and renders the Shorts |
| Carousel designer | Builds and renders 1080×1350 carousels |
| Strategist | Offers, pricing and terms |

Hand-offs are described in [`agents/PIPELINE.md`](agents/PIPELINE.md). A human approves every piece before it's scheduled.

## What's in the repo

| Folder | Contents |
|---|---|
| [`studio/`](studio/) | The video renderer: Remotion + Three.js (React Three Fiber), local Kokoro TTS or Fish Audio, Whisper word timings, animated captions |
| [`posting/`](posting/) | `posting.py`, a Postiz CLI that drafts, schedules, swaps and logs posts across Instagram and YouTube. Dry-run by default |
| [`plan/`](plan/) | Business plan, research, strategy, fact-checks, testing plan and scripts |
| [`agents/`](agents/) | Each agent's state, notes and playbooks |
| [`website/`](website/) | Static website (`node build.mjs`, deployed on Netlify) |
| [`brand/`](brand/) | Logos, avatar and profile copy |
| [`assets/`](assets/) | Fonts and CC0 sound effects |
| [`qa/`](qa/) | Review rubric (rendered videos aren't committed) |

## Quick start

```bash
cd studio
npm i
python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile numpy
npm run dev                                          # Remotion Studio preview
node bin/make.mjs samples/v3/carts-leaks.json        # script → voice → timings → MP4
```

Posting (does nothing until you pass `--go`):

```bash
cd posting
python3 posting.py check
python3 posting.py post <render-dir> --brand lineitem --mode schedule --at 2026-11-10T16:00 --platforms instagram,youtube
```

API keys go in a `.env` file at the repo root and are never committed: `POSTIZ_API_KEY`, `FISH_API_KEY`, `FAL_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`.

## Rules the agents follow

- Every figure needs a source and a Red Team check, and a post uses at most four.
- No invented numbers and no hype. Nothing that promotes credit, investing or crypto.
- A human approves every post. Agents never log in, pay for anything or contact third parties.

Not included in the repo: rendered videos, carousel exports, dependencies and private outreach data.
