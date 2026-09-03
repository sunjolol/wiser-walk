# Theology Compass v1 — build blueprint

Stack: **Astro + Vercel**. Quiz: **36 statements, re-audited**. Surfaces: **result pages + axis/tradition pages, famous figures, OG images, compare with a friend**.

Every stage below is independently shippable and ends at a stopping point: a state where the work on disk is coherent, committed, and a new session can pick it up from this file alone. Nothing later depends on a stage being finished in the same session as it was started.

## Usage budget

The fairness audit cost roughly 22M subagent tokens across three runs (~300 verifier agents each). That was the expensive part and it is done. v1 needs far less fan-out, because most of it is code I write directly rather than agents deliberating.

| Stage | Agents | Rough share of the audit |
|---|---|---|
| 0. Scaffold | 0 | — |
| 1. Quiz to 36, re-audited | ~45 | ~1/7 |
| 2. Core site | 0 | — |
| 3. Famous figures | ~24 | ~1/12 |
| 4. Share surfaces | 0 | — |
| 5. Launch prep | ~6 | tiny |

Stages 0, 2 and 4 are effectively free in agent terms. If usage is tight, do those and defer 1 and 3.

---

## Stage 0 — Scaffold

**Goal.** An Astro project that builds and deploys, with the audited data as its single source of truth.

- `npm create astro` in `site/`, TypeScript strict, no UI framework (islands only where needed).
- `site/src/data/compass.json` generated from `audit/compass-data.revised.json` by a script, so the audit stays upstream of the site. Never hand-edit the copy.
- Route skeleton with placeholder content: `/`, `/quiz`, `/r/[code]`, `/axis/[key]`, `/tradition/[slug]`, `/compare/[a]/[b]`, `/about`, `/method`.
- `astro.config.mjs` with `site:` set, `@astrojs/sitemap`, and Vercel adapter.
- Deploy once to confirm the pipeline works.

**Stopping point.** A live URL serving placeholder pages with real routes and a sitemap. Nothing is indexable yet (`noindex` until Stage 2 copy lands).

## Stage 1 — Quiz to 36 statements, re-audited

**Goal.** Six statements per axis, balanced keying, with the new 18 held to the same standard as the audited 18.

- Promote the 18 drafted `candidate_statements` into the working set; re-derive every direction sign from the poles.
- Adversarial pass **scoped to the new items only**: one reviewer per tradition (~14) reading only the 18 new statements and the axis they sit on, plus a survey methodologist. Two verification lenses (accuracy, fairness) rather than three.
- Re-derive all 18 tradition coordinates against the 36-item instrument, and re-publish the answer sheets.
- Recalibrate: the match denominator, the 45-unit hedge, and the permalink encoder all change when the item count doubles (raw range becomes −12..+12, so 25 reachable scores per axis, and base-13 becomes base-25).
- Extend `audit/selftest.js` to cover the new counts.

**Stopping point.** `audit/compass-data.v1.json` + a short delta report, `node audit/selftest.js` green. The demo page still runs the 18-item set until Stage 2 switches over.

## Stage 2 — Core site

**Goal.** The real product: the quiz, permanent result pages, and the pages Google indexes.

- Quiz as one Astro island; no result is computed on the server, so no answers leave the browser.
- `/r/[code]`: server-rendered from the code alone — headline, compass, per-axis breakdown, nearest traditions, and the "where your view came from" sections. Statically generated for common codes, rendered on demand for the rest.
- `/axis/[key]`: the full fair summary, the dated history, key passages, and reading lists — the long-form pages that earn search traffic.
- `/tradition/[slug]`: what this family holds on each axis, with its coordinates shown honestly as a sketch.
- `/method`: the audit, in public. How the statements were written, who reviewed them, what was changed. This page is the credibility moat.
- Real `<title>`/meta per route, canonical URLs, JSON-LD, sitemap, robots. Remove `noindex`.

**Stopping point.** The site does everything the demo did, plus indexable pages. This is the point at which it could launch.

## Stage 3 — Famous figures on the map

**Goal.** Ten to fifteen figures placed on the compass, each defensible from their own writings.

- Candidates: Augustine, Aquinas, Luther, Calvin, Menno Simons, Cranmer, Arminius, Owen, Wesley, Whitefield, Edwards, Spurgeon, Newman, Schleiermacher (as a foil), Barth, Lewis, Bonhoeffer, Schaeffer.
- One researcher per figure: place them on all six axes, each coordinate justified by a citation to a primary text, with an explicit note where a figure predates the question or falls off the axis.
- Verification pass: a second agent tries to refute each placement from the same primary sources.
- Anything that cannot be sourced gets omitted, not guessed. Figures who genuinely do not fit an axis are shown with that axis blank rather than a made-up number.
- Surface: figures overlaid on your own compass, plus `/figure/[slug]` pages (more indexable content, and a strong share hook — "you are closest to Owen").

**Stopping point.** `data/figures.json` with citations, and the overlay working.

## Stage 4 — Share surfaces

**Goal.** A pasted link looks like the product, and two people can compare.

- OG images: generated at build/request time from the same compass renderer, 1200×630, with the headline, the compass, and the nearest traditions. One per result code.
- Twitter/X card tags, Facebook, iMessage preview checked for real.
- `/compare/[a]/[b]`: both compasses overlaid, the axes where you differ most named in plain language, and a shareable summary. Entry point is a "Compare with a friend" button on any result page that copies an invite link.

**Stopping point.** Links unfurl correctly on at least X and iMessage; compare works from two real codes.

## Stage 5 — Launch prep

**Goal.** Ready to post, with a way to tell whether it worked.

- Privacy-respecting analytics (Plausible or Vercel Analytics): track completions, shares, and result-page visits from outside.
- The five posts written for their venues: r/Reformed, r/TrueChristian, r/Catholicism or r/OrthodoxChristianity, two Facebook groups; each following that venue's self-promotion rules.
- A `/method` link in every post, because this audience checks.
- Success test, decided in advance: unprompted shares by strangers within three weeks. If fewer than ten, stop and rethink before building further.

**Stopping point.** Launch.

---

## Resuming in a new session

Open this folder and read `CLAUDE.md`, then this file. Each stage says what it produces; check which artifacts exist on disk to find where you are. The audit is finished and must not be re-run.

Non-negotiables carried forward from the audit: real data only with citations; both poles of every axis in their holders' vocabulary; no band adjective naming a rival tradition; statements under 22 words with one claim each; both keyings present on every axis; direction signs re-derived whenever a statement changes; `node audit/selftest.js` green before any publish or deploy.
