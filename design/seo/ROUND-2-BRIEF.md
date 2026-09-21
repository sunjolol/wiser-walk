# Discoverability, round 2: the content that has to be worth finding (2026-09-21)

Read `TASKS.md` first: it holds the owner's answers and his steer, which bind everything here. In
short: **discoverable, engaging, fun and easy to read "at all costs"; unique, interesting, true things
on every page; no jargon without a plain explanation; stop hedging every line to avoid offending a
tradition; SEO and ranking first, with the substance visible on the page; keep it designed; do not
over-audit.** Real data only still binds:
nothing invented, no made-up quotation, date, statistic or citation.

## The voice (every writer)

- Write the way the site's ARTICLES read (open two of them in `site/src/content/articles/` before you
  write a word): a person talking plainly to a curious adult. Short sentences. Concrete nouns. A real
  example beats an abstraction. British spelling. No em dashes. No emoji. Never "faith" as a noun for
  the site. No process talk ("audited", "reviewers", "our method").
- **Every term of art is explained the first time it appears, in a phrase, in the same sentence**:
  "monergism (the view that God alone brings a person to believe)". Then use the everyday words people
  actually search beside the holders' own: "predestination", "free will", "speaking in tongues",
  "infant baptism", "real presence", "the rapture", "Bible alone". Both belong; neither replaces the other.
- **Fair, not timid.** Say what each side believes and WHY it finds that convincing, in words its own
  people would nod at, then move on. No "some would say", no caveat on every line, no winner picked.
  An interesting true detail (who first argued it, the verse both sides claim, what it changes on a
  Sunday morning) is worth more than a paragraph of balance.
- **Reverent capitals**: God, Jesus, the Holy Spirit and every pronoun for Them (He, His, Him, Himself,
  They, Their; You, Your when addressed) in all the site's own words. Quotations are printed exactly as
  their translation prints them. A pronoun for a person stays lower-case.
- **Answer first.** A page that answers a question opens with the answer in 40 to 50 words under a
  heading phrased as the question a person types. Search engines quote that block; readers get what
  they came for.
- **Headings are questions or plain labels a searcher would recognise**, not the site's private
  vocabulary ("Where the traditions sit" -> "Which churches believe this?").
- Facts you add must be true and checkable: a confession, a council, a date, a named work, a verse.
  Use WebSearch/WebFetch to confirm anything you are not certain of, and keep a one-line source note in
  the data beside the fact. If you cannot confirm it, leave it out.
- **SEO and ranking come first** (the owner's correction: content that genuinely fits on the page "is not
  bloat, but optimal"). Everything a searcher came for is VISIBLE, crawlable text on the page, in plain
  HTML, under clear headings: visible text gets full weight from a search engine; text behind a pop-out,
  a hover or a closed panel gets little or none, and text injected by JavaScript may not be read at all.
  Do not hide substance. The only things that shrink or move out of the way are true bloat: the same
  explainer repeated word for word across a family of pages, long legal or process detail, a definition
  already given once. Keep the first screen clean by ORDER (answer first, depth below), not by hiding.
  The visual design is settled: reuse the kit (`site/src/styles/kit.css`), never an undesigned box,
  capture at 390 and 1360.

## A. The six Compass axis pages (TASKS 2 + 9). Source: `audit/compass-data.revised.json` -> `axes[]`

For each axis (grace, table, spirit/gifts, kingdom, tradition/authority, worship): add a `question`
(the searcher's question), a `short_answer` (40 to 50 words, both views named), and rewrite
`fair_summary` so it keeps every claim it makes today, explains each term, brings in the everyday
search words, and reads with life. Add `why_it_matters` (two or three sentences: what changes in a
real church depending on the answer) and up to three `did_you_know` items (true, sourced, interesting).
Do not change `key`, `name`, poles, `bands`, statements, scoring or positions. After editing: `node
site/scripts/build-data.mjs`, `node audit/apply.js audit/compass-data.revised.json`, `node
audit/selftest.js`, `npm run test` in `site/` must all pass. Then render the new fields in
`site/src/pages/axis/[quiz]/[axis].astro` (answer block at the top under the H1; H2s re-headed as
questions) and pass them through `build-data.mjs`.

## B. The 18 tradition pages (TASKS 1). New file: `site/src/data/tradition-profiles.json`

Today each page is about half identical to its siblings and says nothing in words about the tradition.
For each of the 18 (slugs as built), write a profile: `in_a_sentence` (what this tradition is, 25 to 35
words), `what_marks_it_out` (three or four short paragraphs or bullets in plain words: how it answers
the six questions and why, tied to the page's own positions), `did_you_know` (two true, specific,
interesting details), `family` (where it came from and who its near relatives are), and `read` (the
audit's own `simulations[].sources` string for that tradition, presented as "what we read to place it",
plus at most two well-known primary documents a reader could open). Accuracy matters more than length:
250 to 350 words each. Then in `site/src/pages/tradition/[slug].astro`: cut the repeated explainer down
to one or two lines (it is the same words on all 18 pages, which is what makes them near-duplicates;
say each honest caveat once, briefly), put the profile high on the page as visible text, keep the compass and rails exactly as they are. The page must still say honestly that positions
are a sketch of typical adherents.

## C. The thin gift pages (TASKS 3). Source: `site/src/lib/quizzes/spiritual-gifts.ts`

Measure every gift page's word count; bring each one under ~450 words up to the standard of the long
ones (prophecy, tongues): what the gift is in plain words, where the New Testament names it, what it
looks like in an ordinary church on an ordinary week, how people tend to notice it in themselves, a
common mix-up with a neighbouring gift. From the bundled New Testament text; add `question` and
`short_answer` fields as in A. Statements and scoring untouched.

## D. Reformation Day (TASKS 7): `site/src/content/articles/what-was-the-reformation-about.md`

An article in the existing collection (so it needs no new surface), aimed at "what was the Reformation
about", "why did Luther ...", "Reformation Day 31 October": the five or six questions it actually
fought over, each mapped to the Compass axis that still carries it, both sides in plain words, linking
to the axis pages and the quiz. 1,200 to 1,600 words, a public-domain colour painting in the front
matter (credit in `site/public/img/CREDITS.md`), a `seo.ts` entry, a social card entry if the pipeline
needs one. Dates and events confirmed from sources.

## E. Small things (TASKS 10 and 5)

`/about/`: a contact line with **info@wiserwalk.com** (a real `mailto:` link, written for a reader who
spots something unfair or wrong). One line saying what people may do with the site: "Use it. Print
anything here for a class, a small group or a church, or quote it, as long as you say where it came from
and link back." with the detail (CC BY 4.0 for the words and the data; not the Bible text, not the
paintings) one click away on `/about/`, and a short footer line linking there. No block of legal text.

## The shared contract (so writers can work at the same time)

A quiz is data, so the new reader-facing fields are GENERIC, optional fields on any group (an axis or a
gift), typed once in `site/src/lib/engine/types.ts` and rendered once in
`site/src/pages/axis/[quiz]/[axis].astro`:

```ts
question?: string;        // the searcher's question, used as the H2 over the answer block
shortAnswer?: string;     // 40 to 50 words, visible text directly under the H1 band
whyItMatters?: string;    // two or three sentences
didYouKnow?: { text: string; source: string }[];   // up to three; `source` is printed small
```

The AXIS writer owns `types.ts`, the axis template and `build-data.mjs` (the Compass's source is
snake_case in `audit/compass-data.revised.json`: `question`, `short_answer`, `why_it_matters`,
`did_you_know`, mapped to the camelCase above). The GIFTS writer only writes data using the camelCase
names on each gift's group object. Tradition profiles are a separate JSON keyed by the built slug.

## Reverent capitals are part of every writer's job on the files they own

Each writer also re-reads EVERY existing sentence in the files they own and capitalises the Names of
God, Jesus and the Holy Spirit and the pronouns referring to Them, judging the referent sentence by
sentence (Paul, Moses, a reader stay lower-case), never inside a quotation. The REVERENCE editor covers
every file no writer owns. List each change as before -> after in your report.

## Working together

Several agents work in ONE tree at the same time. Touch only the files you own. **NEVER run `git
stash`, `git reset`, `git checkout`, `git clean` or `git restore`**: earlier today one agent's stash
silently destroyed another's work. Do not commit or push. No `npm install`. Do not run `astro build` or
`npm run build` while others are writing (the integrator builds); `node scripts/build-data.mjs` and the
unit tests are fine. Dev servers only on the port you are given, stopped when you finish.
