# Comparison pages (TASKS.md item 8): the binding brief

Twelve hand-built pages at `/compare/<slug>/`, a hub at `/compare/`, reached from the Articles menu, the
Compass page and each tradition page involved. NOT the 153 generated pairs. `/c/` (two people's results) is
a different thing and is not touched.

Why: people search "Lutheran vs Reformed", "difference between Baptist and Methodist" and the like, and
what ranks is thin or partisan. Each page answers the question in its first screen, then shows the two
traditions on the site's own audited rails, then tells the story. Read `design/seo/TASKS.md` "His steer":
engaging, fun, easy to read; every piece of jargon explained in a phrase; say interesting true things
plainly, no hedge-everything prose; substance VISIBLE on the page; reverent capitals (God, Jesus, the Holy
Spirit and every pronoun for Them, in the site's own words, never inside a quotation); no one-word last
lines; no process talk.

## The pairs and the facts (positions are the audited data; never contradict them)

`design/seo/compare-pairs.generated.md` lists all twelve: slug, the two tradition slugs, the short labels,
and both positions on all six axes with the band each lands in. "SAME BAND" axes are common ground; the
biggest gaps are the differences. Where a famous difference lies OUTSIDE the six axes (the papacy and the
filioque for Catholic vs Orthodox; bishops; infant baptism, which the Table axis does not measure), say it
plainly in `beyond_the_compass`: the Compass measures six things, not everything.

Other material to draw on (real, already on the site): `site/src/data/tradition-profiles-a.json` and `-b.json`
(a profile per tradition), `site/src/data/compass.json` (`axes[]`: question, shortAnswer, whyItMatters, poles,
history), `site/src/data/compass-audit.json` (`simulations[].sources`: what was read for each tradition).

## Hard rules for the words

- Real data only. Never invent a quotation, a date, a number or a position. A date or a document goes in
  only if you are CERTAIN of it (Augsburg Confession 1530, Westminster Confession 1646, Synod of Dort
  1618-19, the Great Schism 1054, Council of Trent 1545-63, the Remonstrance 1610, Azusa Street 1906, and
  so on). If unsure, leave it out. No direct quotations at all unless from a confession you can cite by
  name and article and are sure of the wording; prefer paraphrase.
- Each side described in words its own people would accept. No side wins. No "merely", "just a symbol",
  "clings to", no flattering either.
- Never say two traditions "agree"; say they "land in the same band" or "stand close". Never a percentage.
- A label such as "Baptist" is broader than the one tradition drawn. Say once, early and briefly, which
  family the rails draw (for example "the rails below draw Southern Baptists of the non-Calvinist kind")
  and where other Baptists would differ, if it matters.

## The content contract: one JSON file per pair, `site/src/data/comparisons/<slug>.json`

```json
{
  "slug": "lutheran-vs-reformed",
  "a": "lutheran-confessional",
  "b": "presbyterian-reformed-confessional",
  "labelA": "Lutheran",
  "labelB": "Reformed",
  "h1": "Lutheran vs Reformed: what is the difference?",
  "searchTitle": "Lutheran vs Reformed: The Real Differences, Plainly",
  "description": "150 characters at most, inviting, says what the page gives.",
  "answer": "40 to 50 words. The direct answer to the h1, quotable on its own, naming the one or two differences that matter most and the main thing shared.",
  "drawn": "One or two sentences: which family each marker draws, and who else wears the label.",
  "common": ["Three to five short paragraphs or sentences: what they share, concretely."],
  "differences": [
    {
      "axis": "table",
      "heading": "The Lord's Supper",
      "a": "60 to 110 words: what side A holds, in its own vocabulary with each term explained.",
      "b": "60 to 110 words: the same for side B.",
      "plain": "One sentence a twelve-year-old could follow: the difference in everyday words."
    }
  ],
  "beyond_the_compass": [
    { "heading": "The pope", "text": "60 to 120 words on a real difference the six axes do not measure." }
  ],
  "story": ["Two to four paragraphs, 150 to 260 words in all: how the two came apart or grew up apart, with only certain dates."],
  "on_a_sunday": "70 to 130 words: what a visitor would actually notice in each church.",
  "did_you_know": "One genuinely interesting true detail, 30 to 60 words.",
  "sources": [
    { "title": "The Augsburg Confession (1530)", "side": "a", "note": "Articles on the Supper and on free will." }
  ]
}
```

- `differences`: three to five items, each `axis` one of `grace`, `table`, `gifts`, `kingdom`, `authority`,
  `worship`, chosen from the pair's largest gaps, largest first. `beyond_the_compass`: zero to three items.
- `sources`: three to six real documents (confessions, catechisms, council decrees, a denomination's own
  statement of faith), `side` is `a`, `b` or `both`. Only documents you are certain exist under that name.
- Whole page 800 to 1,200 words of written content. Plain strings only: no HTML, no Markdown.

## The template (the builder's job)

`/compare/[pair]/`: Base layout, the kit (`Hero`, `SectionHead`, `Card`, `.spec`, `.dark`, `.feature`), phone
first. Order: band (h1, a chip "Compare") -> "In short" answer block as on articles -> the two traditions on
one set of six rails, REAL positions, both pole names on every rail, the 41-59 zone drawn (reuse
`RailOverlay.astro`; `compare(quiz, positionA, positionB)` from `lib/engine/compare.ts` accepts the two
traditions' `position` vectors exactly as the tradition page passes one to `resultFor`; A and B named by
`labelA` / `labelB`, each linking to its
tradition page; a line under it from `drawn`) -> common ground -> the differences as mirrored two-column
panels (stacked on a phone), each heading linking to its `/axis/theology-compass/<slug>/` page -> beyond the
compass -> the story -> on a Sunday -> did you know -> sources, shown as "What we read" -> a CTA room: "Where
do you stand? Take the Theology Compass" -> other comparisons (those sharing a tradition first).
`/compare/` hub: a band, one line of introduction, the twelve as designed cards, grouped sensibly.
JSON-LD: BreadcrumbList (Home > Compare > page) and Article or WebPage as the other templates do. Indexable,
in the sitemap, titles and descriptions through `site/src/lib/seo.ts` conventions, passes
`site/scripts/seo-test.mjs` (extend the guard: every comparison has a 40 to 50 word answer, its two slugs
exist, its axes are valid). A social card per page and for the hub through `design/og/cards.mjs`
(`node design/og/render.mjs site compare`), engraving or painting tone from pictures already in
`site/public/img/`; no new downloads.

Homes (all three are required): an "Articles" dropdown in the header nav in `Base.astro` (items: All
articles, Compare traditions), built exactly like the Quizzes and Games dropdowns; a designed link block on
the Compass page (`/q/theology-compass/`, near `OutcomeIndex`); on each tradition page involved, a "Compare"
block listing that tradition's comparison pages. Footer: add "Compare traditions" under the Articles column.
A loader `site/src/lib/comparisons.ts` reads the JSON files with `import.meta.glob`, validates at build time
and FAILS the build on a bad file. It must build with whatever subset of the twelve files exists.

Do not touch: the result page instruments, `RailStack`, scoring, the quiz data, `/c/`, accounts.
Never run `git stash`, `git reset`, `git checkout`, `git commit` or `git push`. Do not start a dev server.
Check your work with `npm run build` in `site/`, then run `npx astro preview --port 4329` in `site/` in the
background for captures only (stop it after) and capture with
`sh design/tools/shot.sh http://localhost:4329/compare/<slug>/ <abs-out.png> 1360 2400` and with `-m` for a
390 phone (`sh design/tools/shot.sh -m <url> <abs-out.png> 2400`); add `?theme=dark` for dark. Judge every
new page at 390 and 1360, light and dark. Captures go in `design/seo/captures/` (gitignored).
