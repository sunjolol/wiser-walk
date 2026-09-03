# v1 build blueprint

Stack: **Astro + Vercel**, `.com` domain to be chosen by the owner. Quiz: **36 statements, re-audited**. Surfaces: **result pages + axis/tradition pages, famous figures, OG images, compare with a friend**.

**Read `CLAUDE.md` first.** The site is a Christian hub for understanding yourself — a platform of many quizzes plus formation articles — and the Theology Compass is only its first module. That reframing rewrote Stage 2 below.

Every stage is independently shippable and ends at a stopping point: a state where the work on disk is coherent, committed, and a new session can resume from this file alone. Nothing later depends on a stage finishing in the session that started it.

## Usage budget

The fairness audit cost roughly 22M subagent tokens across three runs. That was the expensive part and it is done. v1 needs far less fan-out, because most of it is code written directly rather than agents deliberating.

| Stage | Agents | Rough share of the audit |
|---|---|---|
| 0. Scaffold | 0 | — |
| 1. Quiz to 36, re-audited | ~45 | ~1/7 |
| 2. Platform core | 0 | — |
| 3. Famous figures | ~24 | ~1/12 |
| 4. Share surfaces | 0 | — |
| 5. Launch prep | ~6 | tiny |

Stages 0, 2 and 4 are effectively free in agent terms. If usage is tight, do those and defer 1 and 3 — the site works fine with the audited 18-statement quiz.

---

## Stage 0 — Scaffold — DONE

Astro project in `site/`, TypeScript strict, no UI framework. Builds clean: 46 pages, sitemap, Vercel output. Data pipeline (`site/scripts/build-data.mjs`) sits downstream of the audit and derives the permalink radix from the item count. Shared scoring core in `site/src/lib/compass.ts`. Routes exist as placeholders, all `noindex`.

**Not deployed** — needs the owner's Vercel account: `npx vercel` then `npx vercel --prod` from `site/`.

**Carried debt:** the routes are single-quiz shaped (`/quiz`, `/r/[code]`). Stage 2 must namespace them per quiz.

## Stage 1 — Quiz to 36 statements, re-audited

**Goal.** Six statements per axis, balanced keying, with the new 18 held to the same standard as the audited 18.

- Promote the 18 drafted `candidate_statements`; re-derive every direction sign from the poles.
- Adversarial pass **scoped to the new items only**: one reviewer per tradition (~14) reading only the new statements and the axis they sit on, plus a survey methodologist. Two verification lenses (accuracy, fairness) rather than three.
- Re-derive all 18 tradition coordinates against the 36-item instrument; republish the answer sheets.
- Recalibrate what the item count changes: raw range becomes −12..+12, so 25 reachable scores per axis and the permalink radix becomes 25. The match denominator and the 45-unit hedge both need re-deriving.
- Extend `audit/selftest.js` to the new counts.

**Stopping point.** `audit/compass-data.v1.json` plus a short delta report, `node audit/selftest.js` green. The demo keeps running the 18-item set until Stage 2 switches over.

## Stage 2 — Platform core — DONE (2026-09-03)

**Built.** `src/lib/engine/` holds the contracts, the generic base-N codec and the registry; `src/lib/strategies/` holds two pluggable strategies (`bipolar-nearest` for the Compass, `category-highest` for gifts/sins); `src/lib/quizzes/` holds the quizzes as data. Routes are namespaced (`/q/[quiz]`, `/r/[quiz]/[code]`, `/axis/[quiz]/[axis]`). Articles are a content collection with two-way quiz cross-linking. 41 static pages, result pages render on demand, `noindex` removed from content pages and kept on results and drafts. `npm run test` re-scores all 18 audited answer sheets through the engine and is wired into `prebuild`, so a scoring regression fails the build.

**Proof the seams are real:** `seven-deadly-sins` runs the same routes, codec, result page and share card with a different strategy, 7 groups instead of 6, 2 items per group instead of 3, and radix 9 instead of 13 — with no engine changes. It ships as an unaudited draft (noindex, banner) because its statements have not been through the audit.

**Carried debt:** the local folder is still `theology compass`; the demo page and the site implement the scoring twice (which the two test suites currently exploit as a cross-check, but which will drift).

**Goal (original).** The real site: a quiz *engine* that hosts many assessments, an article system, and the indexable pages that earn search traffic. The Compass is the first quiz to run on it, not the thing itself.

**2a. The quiz engine.** A quiz is data, not code.

- Define a quiz schema: id, slug, title, description, items, a scoring strategy, result copy, and share/OG configuration.
- Make the **scoring strategy pluggable**. The Compass uses bipolar axes with Euclidean nearest-neighbour matching. Others will need: highest-category-wins (spiritual gifts, seven deadly sins), similarity-to-a-figure (who in the Bible are you most like), and simple scored right/wrong (Bible knowledge). Build the seams now; implement only the Compass strategy in this stage.
- Generic permalink codec parameterised by item count and axis count, not hard-coded to six and thirteen.
- One quiz-runner island reused by every quiz. Nothing is scored on the server, so no answers ever leave the browser.

**2b. Routes, namespaced from the start.**

- `/` — the hub: what the site is, the quizzes on offer, recent articles.
- `/q/[quiz]` — take any quiz.
- `/r/[quiz]/[code]` — a permanent, server-rendered result page per quiz.
- `/axis/[quiz]/[axis]` — long-form axis pages (Compass-specific content, generic route).
- `/tradition/[slug]` — Compass tradition pages.
- `/articles` and `/articles/[slug]` — the formation articles. Content collections, MDX.
- `/method` — the audit in public: how statements were written, who reviewed them, what changed. **This page is the credibility moat.**
- `/about`.

**2c. Cross-linking.** Articles link to relevant quizzes; result pages link to relevant articles ("you leaned toward X — here's how to grow in Y"). This is the engine of both retention and internal SEO.

**2d. SEO plumbing.** Real per-route `<title>`/meta, canonical URLs, JSON-LD, sitemap, robots. Remove `noindex`. Server-rendered pages are non-negotiable — nutrientcodex.com was a SPA and got zero search traffic, which is the single lesson driving this whole architecture.

**Stopping point.** The site does everything the demo did, plus indexable pages, plus a second quiz stubbed on the engine to prove the seams are real. This is the point at which it could launch.

## Stage 3 — Famous figures on the map

**Goal.** Ten to fifteen figures placed on the Compass, each placement defensible from their own writings.

- Candidates: Augustine, Aquinas, Luther, Calvin, Menno Simons, Cranmer, Arminius, Owen, Wesley, Whitefield, Edwards, Spurgeon, Newman, Barth, Lewis, Bonhoeffer.
- One researcher per figure: all six axes, every coordinate justified by a citation to a primary text, with an explicit note where a figure predates the question.
- A verification pass then tries to refute each placement from the same primary sources.
- Anything unsourceable is omitted, not guessed. A figure who genuinely falls off an axis gets it left blank rather than a fabricated number.
- Surface: figures overlaid on your own result, plus `/figure/[slug]` pages — more indexable content and a strong share hook ("you're closest to Owen").

**Stopping point.** A figures data file with citations, and the overlay working.

## Stage 4 — Share surfaces

**Goal.** A pasted link looks like the product, and two people can compare.

- OG images generated from the same renderer, 1200×630, one per result code — **built generically so every future quiz gets them free**.
- Card tags verified for real on X and iMessage, not merely written.
- `/compare/[quiz]/[a]/[b]` — both results overlaid, the axes of largest difference named in plain language, reachable by an invite link from any result page.

**Stopping point.** Links unfurl correctly, and compare works from two real codes.

## Stage 5 — Launch prep

**Goal.** Ready to post, with a way to tell whether it worked.

- Privacy-respecting analytics: completions, shares, and result visits arriving from outside.
- Five posts written for their venues (r/Reformed, r/TrueChristian, one of r/Catholicism or r/OrthodoxChristianity, two Facebook groups), each following that venue's self-promotion rules and each linking `/method`, because this audience checks.
- The success test, fixed in advance: **unprompted shares by strangers within three weeks.** Under ten, stop and rethink rather than build further. The Codex's real failure was learning the market's answer at month three instead of week three.

**Stopping point.** Launch.

---

## Resuming in a new session

Read `CLAUDE.md`, then this file. Each stage says what it produces; check which artifacts exist on disk to locate yourself. The fairness audit is finished and must not be re-run. The naming search is finished and must not be re-run.

Non-negotiables carried forward: real data only with citations; both poles of every axis in their holders' vocabulary; no band adjective naming a rival tradition; statements under 22 words with one claim each; both keyings present on every axis; direction signs re-derived whenever a statement changes; `node audit/selftest.js` green before any publish or deploy.
