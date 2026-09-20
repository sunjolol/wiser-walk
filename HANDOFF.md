# Handoff: where work stopped on 2026-09-21 (weekly usage ran out)

Everything below is committed on the branch `build/three-new` and pushed. `main` and production
are untouched since the Riche design pass. The site builds and all tests pass in this state.
**Nothing on this branch has been shown to the owner yet. Do not merge without his say.**

## Done and safe on the branch

- **Who Said It?** (second game): finished, verified, tested. `demos/who-said-it/` (read its SPEC.md),
  site route `/play/who-said-it/`, entry in `site/src/lib/games.ts`. 1,261 lines, 111 speakers.
  Every run carries one line from Jesus, at least three New Testament lines, at most two per book.
- **Two draft quizzes** wired as `status: 'draft'`: `site/src/lib/quizzes/bible-figure.ts` (with
  `site/src/data/bible-figures.json`, figure pages at `/figure/<slug>/`) and
  `site/src/lib/quizzes/spiritual-gifts.ts`. The instruments on one page each:
  `audit/new-quizzes/figure-final.md` and `gifts-final.md`. Blueprint: `QUIZ-BLUEPRINTS.md`.
  Owner decisions already taken: **Jesus IS on the figure list**; never print a percentage against a person.
- **Research brief**: `research/BRIEF.md` (read this one; the other files are its evidence).
- **Eight checked article drafts**: `audit/article-drafts/*.md` (each has a `.check.md`). Not published.
- **The three live articles repaired** (BSB quotations, Ephesians 5:20 fairness fix, draft-quiz links
  removed): changes listed in `audit/article-drafts/LIVE-ARTICLE-REPAIR.md`. On the branch only.
- **Five fairness-audit reviews of the two quizzes, finished, NOT yet applied**:
  `audit/new-quizzes/audit-{cessationist,pentecostal,catholic-orthodox,psychometric,evidence}.md`.

## Stopped part-way (pick up here, in this order)

1. **Figure quiz calibration: NOT started in code.** The problem, measured: an axis with no evidence is
   stored as 50, so thinly evidenced figures sit at the centre and win. Over 6,000 simulated sheets
   Mary of Nazareth was closest for about 20%, Jesus 14%, and half of all sheets tied. The fix is
   specified in full in the "Calibrate" prompt of the workflow script named below: evidence-masked
   distance (axes with no evidence, or with evidence at BOTH ends, are left out of the distance),
   at least four shown axes per figure (repair or replace Priscilla), thresholds tuned by a kept
   simulation script until no figure is closest for more than 9% of realistic sheets. The Compass
   must stay byte-identical.
2. **Apply the audit.** An editor verifies each blocker and major finding in the five audit files,
   applies what holds, and writes `audit/new-quizzes/AUDIT-LOG.md` with the owner's decisions at the
   top (above all: whether and how the gifts quiz includes prophecy, healing, miracles, tongues and
   interpretation). Do this AFTER calibration, because both touch `bible-figure.ts`.
3. **Citation pass: 13 of 18 tradition files written, only 2 verified.** Files in `audit/citations/`.
   A file is finished only if it contains `"verified_on"`. Re-run the researcher for the five missing
   traditions and the verifier for every file without `verified_on`. Nothing here is on the site yet;
   tradition pages still get NO sources block until the owner has seen verified citations.
4. **Search fixes from the brief (section 3): not started.** Exact titles and descriptions are in
   `research/BRIEF.md`. Also remove the noindex draft pages from the sitemap.
5. Then: build once, capture the new pages with `design/tools/shot.sh`, push the branch, give the
   owner the preview link plus the two one-page instruments, and ask what he thinks.

## Workflow scripts (prompts are reusable even in a new session)

Resume by run id only works inside the same session. In a new session, re-invoke the script path and
let it run fresh, or lift the prompts out of it.

- Calibrate, audit, apply: `C:\Users\Light\.claude\projects\C--Users-Light-Desktop-claude-theology-compass\d165a187-242d-400e-8992-aa2b0adf1fa0\workflows\scripts\quizzes-calibrate-and-audit-wf_0b423514-d5d.js` (run id `wf_0b423514-d5d`; the five audits completed and are cached, calibrate and apply did not).
- Citation pass and article repair: `C:\Users\Light\.claude\projects\C--Users-Light-Desktop-claude-theology-compass-research\d165a187-242d-400e-8992-aa2b0adf1fa0\workflows\scripts\citation-pass-and-article-repair-wf_4d8ab5ad-d3b.js` (run id `wf_4d8ab5ad-d3b`; the repair completed).

## Usage note

This week's build cost roughly 2M Opus subagent tokens for Who Said It? and the quiz drafts, about 2M
Fable for the research and articles, and an unfinished share of the citation pass and audits. The
owner was at 98% when work stopped. Start the new week with the calibration (one Opus agent), not
with a large fan-out.
