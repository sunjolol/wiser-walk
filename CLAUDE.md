# Theology Compass

A tradition-neutral quiz that places a Christian on six axes of belief (Grace, Table, Gifts, Kingdom, Authority, Worship), names the nearest traditions, and shows where each view came from. Chosen on 2026-09-02 as the next app to build after nutrientcodex.com, out of three demos (the other two are kept under `demos/`). The product promise is fairness: every position described in words its holders would accept, and nothing invented. A discernment-minded audience will screenshot anything unfair, so rigor is the moat.

## State of the project (updated 2026-09-03)

- `theology-compass.html` is the working demo, with the fairness audit applied (single self-contained page, published as a private artifact at https://claude.ai/code/artifact/66ae7e10-200a-45a6-a1d0-acca94886428 ; republish the same file to keep the link).
- `demos/` holds all three demos as first built: Scripture Web (https://claude.ai/code/artifact/a291298f-9530-405d-a9a5-af721aa2404b), Structure Cards (https://claude.ai/code/artifact/ff361b6e-5023-4a26-a3f1-d76ac8119dd8), and the pre-audit Compass.
- `audit/compass-data.json` is the original quiz data extracted by `node audit/extract.js`; `audit/compass-data.revised.json` is the audited data now live in the page.
- `node audit/apply.js <data.json>` regenerates the page's data block from a JSON file (add `in.html out.html` to write elsewhere). Round-trip tested.
- `node audit/selftest.js` re-checks the page's own scoring code. **Run it after any change to the data or the scoring.**

## The fairness audit (finished 2026-09-03)

Twenty adversarial reviewers (one per tradition, plus a church historian, a biblical scholar, a survey methodologist, a mockery critic, and a copy editor) raised 522 findings. A three-lens verification (accuracy / fairness / necessity, majority vote) kept 424 of them, including all 42 blockers. Two Workflow runs were needed (`wf_2bfa24ac-bd3` for the reviews, `wf_aa487a3d-654` for verification onward) because of usage limits; both are complete.

Outputs:

- `audit/fairness-report.md` — the editor's report. Read section 1 first.
- `audit/compass-data.revised.json` — the revised data, applied. Also holds `candidate_statements` (18 extra items drafted for v1), `simulations` (18 published answer sheets, one per tradition), `changelog` (89 entries), `disputed` (11 kept findings deliberately not applied, with reasons), and `scoring_v1_proposed`.
- `audit/review-results.json` and `audit/findings/*.json` — the raw reviews, by target.
- `audit/theology-compass.pre-audit.html` — the page as it was before.
- `audit/workflow.js`, `audit/workflow-v2.js` (+ template and builders), `audit/recover-reviews.js`, `audit/split-findings.js` — the audit machinery, reusable.

What changed: every band on every axis is now built from that axis's own pole words (the Grace bands used to call a confessional Lutheran "Reformed-leaning"); all 18 statements were rewritten with direction signs re-derived; all 12 tradition coordinates were re-derived and 6 families added (18 total); two axis histories were rebalanced; the "Spirit" axis is now "Gifts" and the "Tradition" axis is now "Authority" (keys unchanged). All 18 published answer sheets land on their own tradition at 87–95%.

All nine code and page-copy items the report listed as "specified, not yet in code" are now implemented: base-13 permalink (every reachable score round-trips), 198-unit match denominator, 10-unit tie rule, 45-unit poor-fit hedge, all-central suppression, middle-band exclusion in `headline()`, `lean()` as a share of the half-axis, the eleven-slot share bar with a position marker, "Unsure / neither" plus the scale hint, the closest-traditions scope note, and the footer.

Known honest limit, stated on the page: these six axes are the Reformation's questions, so they do not measure church government, the papacy, or the peace-church convictions, and Rome and Constantinople sit close together.

## Agreed plan

1. ~~Fairness audit, applied and republished.~~ Done.
2. **v1 build — see `V1-BLUEPRINT.md`**, which is the working plan: Astro + Vercel, 36 re-audited statements, result/axis/tradition pages, famous figures, OG images, compare-with-a-friend. Six stages, each with a stopping point, so work survives a session limit. Blueprint also published at https://claude.ai/code/artifact/f37302b7-cdd8-4be9-8529-0e9713caf579
3. Three-week launch test: post in five places, measure unprompted shares before building further.

**Pace deliberately.** The audit consumed ~60% of a weekly usage allowance in one session. Stages 0, 2 and 4 use no agents; only stages 1, 3 and 5 fan out, and they are scoped small on purpose. Prefer writing code directly over spawning reviewers.

## Rules that must not be broken

- Real data only. Never invent a quotation, date, position, or connection; cite the confession, council, or standard work.
- Both poles of every axis described fairly, in the holders' own vocabulary. No band adjective may name a rival tradition, flatter, or belittle.
- Keep statements under 22 words, one claim each; every axis needs both +1 and -1 keyed items; re-derive direction signs whenever a statement is rewritten.
- The page assumes 6 axes and 18 statements; `apply.js` warns if the counts differ.
- Run `node audit/selftest.js` before republishing.

## Local testing

`sh _test/wrap.sh` wraps the pages in the artifact host skeleton into `_test/` (the root page as `theology-compass.html`, the demo copies prefixed `demo-` so they cannot clobber it); the `compass` launch config (`.claude/launch.json`) serves `_test/` on port 8766. The embedded browser pane never fires requestAnimationFrame, so animations must be checked by state, not by watching.

## Stage 0 done (2026-09-03)

The Astro site is scaffolded in `site/` and builds clean: 46 pages, sitemap, Vercel output.

- `site/scripts/build-data.mjs` regenerates `site/src/data/compass.json` from `audit/compass-data.revised.json` and **derives the permalink radix from the item count** (13 at 3 statements per axis, 25 at 6). It also recomputes the max tradition distance, so the match denominator stays honest when the data changes. Runs automatically on `npm run dev` and `npm run build`; never hand-edit the generated file.
- `site/src/lib/compass.ts` is the shared scoring core ported from the audited page: `computeScores`, `band`, `lean`, `headline` (middle-band exclusion), `nearest` / `nearestState` / `nearestLine` (tie, hedge, all-central suppression), `encode` / `decode`, `shareText`.
- Routes, all placeholder content and `noindex` until Stage 2: `/`, `/quiz`, `/r/[code]` (the 18 published answer sheets are pre-rendered), `/axis/[slug]`, `/tradition/[slug]`, `/compare/[a]/[b]`, `/method`, `/about`.
- Not deployed. That needs the user's Vercel account: `npx vercel` then `npx vercel --prod` from `site/`.

**Shell note:** never put backticks inside a double-quoted bash string — they run as command substitution. Use the Write tool or single-quoted heredocs for prose containing backticks.
