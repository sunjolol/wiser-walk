# Handoff: where work stopped on 2026-09-21 (weekly usage ran out)

Everything below is committed on the branch `build/three-new` and pushed. `main` and production
are untouched since the Riche design pass. The site builds and all tests pass in this state.
**Nothing on this branch has been shown to the owner yet. Do not merge without his say.**

## Status on 2026-09-22: waiting on the owner

Calibration, the audit and the search fixes are done and committed; the branch is pushed and the
preview is https://wiser-walk-7ureyjkaq-sunjo.vercel.app (may need his Vercel login). He has been
given the preview, the two one-page instruments and the six decisions at the top of
`audit/new-quizzes/AUDIT-LOG.md`. **Ask what he thought before doing anything else.** Still open:
the citation pass (step 3 below; about sixteen Fable agents, so only with his go), four small engine
items listed in the audit log, and merging, which is his call.

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

1. **Figure quiz calibration: DONE 2026-09-20, not yet shown to the owner.** It was: an axis with no
   evidence stored as 50, so thinly evidenced figures sat at the centre and won — Mary of Nazareth
   closest for 20% of simulated sheets, Jesus 14%, and half of all sheets tied. Now: an axis counts
   only where BOTH sides name a position (the figure, because the text places them there; the reader,
   because the score is outside the 41-59 no-position band), a figure needs four of six placed axes
   to be a possible result, and the thresholds were measured rather than copied — tie 10 to 1, plus
   a floor of two axes in common before a figure is named. Mary is now 8.6% and Jesus 3.3%, ties are
   7.1%. Roster: Priscilla replaced by Barnabas, Thomas by Gideon, both for want of evidence; still
   23 people, nine women, Jesus. The Compass is byte-identical (24 built pages and three rendered
   result pages, and 4,091 engine results). Kept: `site/scripts/sim-figures.mjs` — RUN IT after any
   change to a coordinate or a statement. Record: the "Calibration pass" section at the end of
   `audit/new-quizzes/figures-verification.md`. **Left undone: Martha is closest for 1.1% of sheets
   against a 1.5% floor** — she is crowded by Moses, Paul, David and Deborah and there is little more
   of her in the text; and the evidence for moving Jesus's Lead coordinate from 50 to 40 is the one
   judgement in the pass to question first.
2. **Apply the audit: DONE 2026-09-20, not committed, not yet shown to the owner.** 106 findings:
   81 applied, 7 moot after calibration, 3 rejected, 4 left for the owner or engineer, 11 minor and
   left. Read `audit/new-quizzes/AUDIT-LOG.md`: six owner decisions are at its top (the gifts quiz's
   1 Corinthians 12:8-10 split first). Six figure statements and ten gifts statements were reworded.
   Jesus is no longer placed on Reasons (three reviewers), which leaves him, Mary the mother of Jesus
   (renamed from "Mary of Nazareth"; slug unchanged) and Deborah placed on three axes, so
   `minShownAxes` went from 4 to 3: owner decision 2. Simulator after: top figure 7.9%, ties 8.1%,
   all four targets met, Martha 1.6%. The one-page instruments (`figure-final.md`, `gifts-final.md`)
   show both quizzes as they now stand.
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
