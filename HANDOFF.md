# Handoff (updated 2026-09-22): start the next session here

Branch `build/three-new` holds everything below, committed and pushed. `main` and production are
unchanged since the Riche design pass. The site builds and every test passes.
Preview of the branch: https://wiser-walk-7ureyjkaq-sunjo.vercel.app (a newer one is built on every
push; find it through the GitHub deployments API as in earlier sessions).

**The owner has played the preview and said "Looks good".** He has NOT yet said to merge. Ask
before merging to `main`: every push to `main` deploys to production.

## What the owner decided on 2026-09-22 (binding)

1. **The spiritual gifts quiz includes ALL the gifts.** His words: "We include all gifts, just
   because cessationists disagree doesn't mean we leave them out." So prophecy, healing, miracles,
   tongues and interpretation of tongues go in, with wisdom, discernment (distinguishing between
   spirits) and faith kept. Fairness is kept by DESCRIBING the disagreement in words both sides
   accept (the Compass's Gifts axis page already does), not by leaving gifts out. The draft note and
   the "deliberately not in this draft" copy must be rewritten to match.
2. Figure quiz: three placed axes is enough for a figure to be a possible result. **Approved.**
3. Mary the mother of Jesus keeps her Lead placement. **Approved.**
4. and 6. **He did not understand these two questions** ("What? No idea what this means"). That is
   on us: they were asked in jargon. Do not ask again in the same words. Decide them sensibly, then
   tell him what you did in one plain sentence each, with the actual statement in front of him:
   - (4) One discernment statement could be read as "having a hunch about people" or as "checking
     things out carefully". Now that all gifts are in, settle it against the passage itself
     (1 Corinthians 12:10, distinguishing between spirits) when the new statements are written.
   - (6) Eight gifts have a statement of the form "people come to me for X" and five do not, so the
     gifts are not all measured the same way. Write the missing ones so every gift has one.
5. **Add Judith and Tobit to the figure roster.** His words: "Include them both." Their books are in
   Catholic and Orthodox Bibles and not in Protestant ones, so each of their pages and result cards
   says so in one plain sentence (the game already words this fairly: "In Catholic and Orthodox
   Bibles. Protestant Bibles leave it out or print it as Apocrypha."). Evidence from the World English
   Bible British Edition deuterocanon on disk (`demos/sounds-like-scripture/raw/eng-webbe_vpl.txt`,
   book codes TOB and JDT), every verse opened, same rule as everyone else.
6. **The other quizzes must be easy to find.** Done for the home page and footer on this branch
   (every quiz is listed, drafts carry a "Draft" tab). Still to do: the `/quizzes/` page and the nav
   should make them just as easy to reach, and once a quiz stops being a draft it should be as
   prominent as the Compass.

## To do next, in this order

1. **Gifts quiz, all gifts in.** Draft statements for prophecy, healing, miracles, tongues and
   interpretation, plus the five missing "people come to me" statements (decision 6) and the
   discernment fix (decision 4). Use the method that worked: two independent drafts, two adversarial
   critics (loaded wording; plain language), one editor, the blueprint's six statement rules.
   One real difficulty to solve honestly: rule 6 forbids counting devotion, and the obvious
   statements for healing or tongues are about praying. Write about what has HAPPENED and what others
   have said, not about how much someone prays. Pentecostal and cessationist reviewers must both
   pass the result. Each new gift's page quotes its passage word for word and cites acts from Acts
   and the letters. Keep the quiz under about fifty statements.
2. **Figure quiz: add Judith and Tobit** (decision 5), then run `node site/scripts/sim-figures.mjs`
   and keep the targets (no figure closest for more than 9% of realistic sheets, ties under 15%).
3. **Four small engine items** from `audit/new-quizzes/AUDIT-LOG.md`: Jesus's note should travel with
   the share text and share card; name no figure when all eighteen answers are identical; gifts ties
   of three or more are cut to two alphabetically; consider narrower band words for the figure quiz.
4. **Findability, the rest:** `/quizzes/` and the nav (decision 6 above).
5. **Show him, then ask:** may the two quizzes leave draft status, and may the branch merge to `main`?
   Who Said It? is finished and can ship with that merge.
6. **Only with his go (it costs about sixteen Fable agents):** finish the citation pass
   (`audit/citations/`: 13 of 18 tradition files written, only 2 contain `"verified_on"`).
7. Parked, from `research/BRIEF.md`: daily set and share grid for Sounds Like Scripture, "who is
   speaking in [chapter]" pages from the Glyssen data, canon pages, the eight article drafts in
   `audit/article-drafts/` (none published), Finish the Verse.

## What is on the branch

- **Who Said It?** finished: `demos/who-said-it/` (SPEC.md), `/play/who-said-it/`, 1,261 lines, 111 speakers.
- **Two draft quizzes**, calibrated and audit-closed: `site/src/lib/quizzes/bible-figure.ts` with
  `site/src/data/bible-figures.json` and figure pages at `/figure/<slug>/`;
  `site/src/lib/quizzes/spiritual-gifts.ts`. Read `audit/new-quizzes/figure-final.md`,
  `gifts-final.md` and `AUDIT-LOG.md`. Blueprint: `QUIZ-BLUEPRINTS.md` (its "deliberately not in this
  draft" section is now overruled by decision 1).
- Standing owner rules for the figure quiz: **Jesus is on the list**; never a percentage against a person.
- Search titles and descriptions (`site/src/lib/seo.ts`), drafts kept out of the sitemap.
- The three live articles repaired (`audit/article-drafts/LIVE-ARTICLE-REPAIR.md`).
- `research/BRIEF.md` and its evidence files.

## Checks to run before any push

`npm run build` in `site/` (runs the engine tests), `node audit/selftest.js`,
`node site/scripts/sim-figures.mjs`, and for the games `scripts/test-game.mjs` and `scripts/verify.mjs`
in each of `demos/sounds-like-scripture/` and `demos/who-said-it/`.
Pages are judged from captures: `sh design/tools/shot.sh` (see CLAUDE.md, "THE RICHE PASS").

## Pace

One agent at a time where one will do; Opus for building, Fable for wording and judgement. The owner
watches his weekly usage closely.
