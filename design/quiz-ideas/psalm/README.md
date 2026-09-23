# Which Psalm are you living right now? (quiz #2, in design)

The owner's favourite of the ten ideas (2026-09-23). Every result is one situation St Athanasius named in his
Letter to Marcellinus (4th c.), read in the Greek (TLG 2035.059 = Migne PG 27.12-45). Nothing is stretched: where
his letter names no situation (a death, an illness, a decision), the quiz says so and offers the psalm he gave for
what it is doing to you.

- `research.json`: the research run (25 agents). Every pairing in the letter, the English copy's numbering errors
  fixed from the Greek (e.g. its "27" is English 13), the shape of every prescribed psalm (240 quotes machine-checked
  against the BSB), what people look to the Psalms for today, and the engine report.
- `engine-fit.md`: how it fits the site's code (recommended: a new 'reading' strategy, a sieve with ties settled by
  the person, a PS-prefixed result code that stores the situation, never the answers; per-psalm pages).
- `tree.json`: DRAFT 2, the question tree and all 48 results (paraphrase of his advice with section, the verse that
  names it, where it turns, hard lines). Written by the main session from the Greek; revised after `critique-1.json`
  (10 critics: fidelity x4, twelve personas, wording, care, coverage; 35 must-fix, all applied).
- Tap-through preview (draft 2): https://claude.ai/artifact/8EWuYxAX3qfrgtpYXvAxg7 . Rebuild with
  `node design/quiz-ideas/psalm/preview/build.mjs` (template, public-domain BSB psalms and builder in `preview/`),
  then republish that artifact by its URL. `#example` opens the one finished result, Psalm 3.

## Draft 5 (2026-09-23, after the owner's note on draft 2)

He found draft 2's first question funnelled into a negative answer, the answers "scattered and random" rather than
running evenly from negative through neutral to positive, and some options hyper-specific boxes. He wanted generic,
"sneakier" options that apply to more people, even if it takes more questions. Draft 3 changed the whole shape and
drafts 4 and 5 tuned it on simulated people:

- `model.mjs` writes `quiz.json`: seven CORE questions everyone answers, each running hard -> neutral -> good (feel and
  people take up to two picks), then FOLLOW-UPS only when an answer calls for them. Each result keeps its Athanasius
  situation (`need` = his defining condition, alternatives allowed; `like` = supporting answers). `score.js` ranks
  eligible results (need facets weighted, follow-ups and "what you'd say to Him" heaviest); the person confirms at
  "Does this sound like you?" and "Not quite" offers the next; after three, the honest "his letter doesn't name it" page.
- `people-test-1/2/3.json`: agents took it as 48, then 72, then 30 brand-new realistic people (struggling, in between,
  doing well), a fresh judge said whether the line fitted. Draft 5 on the new 30: 20 yes at the first line (22 after the
  last offline fixes), 29 of 30 within three, 5 forced answers in 30 people. In-between people remain the hardest
  to hit first time.
- The preview is built by `preview/build3.mjs` (template parts `style.part` + `script3.part`); `tree.json` is draft 2,
  kept as the source of the result texts.

Open questions for the owner are in CLAUDE.md's "NEXT SESSION" section. The Greek text and the CSMV English copy (copyrighted: never commit it) are not in the repo.
