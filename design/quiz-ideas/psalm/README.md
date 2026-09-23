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

Open questions for the owner are in CLAUDE.md's "NEXT SESSION" section. The Greek text and the CSMV English copy (copyrighted: never commit it) are not in the repo.
