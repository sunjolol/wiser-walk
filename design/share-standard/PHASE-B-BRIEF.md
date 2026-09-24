# Phase B: every quiz reaches the standard, then quiz #4 goes live

The owner verified Phase A on the live site ("Everything looks great") and asked for the rest of the standard
(memory: quiz-standard-bar): short result links, a personal link preview for every result, the reader's answers on
outcome pages, and quiz #4 "Which early Christian thinks like you?" built into the site. Copy rules from CLAUDE.md:
plain short sentences, one idea each, no comma stacks, no section marks, capitals for every pronoun for God, never a
percentage against a person. Phone first; check your pages at 390 and 1360, light and dark. Do not commit or push.
Run `npm run test` in `site/` at the end; it must pass. Report what you changed, file by file, and anything you
noticed outside your files.

Wave 1 runs four builders at once (L, O, Y, V). Wave 2 (K) builds quiz #4 on top of wave 1.

---

## Wave 1, Builder L: short result links (≤ 6 characters) for every quiz

Owns: `site/src/lib/engine/links.ts` (new), `site/src/pages/api/short.ts` (new), the `shortLinks?: boolean` field in
`site/src/lib/engine/types.ts` (that field only), `shortLinks: true` in `site/src/lib/quizzes/spiritual-gifts.ts`
(that line only), `site/src/pages/r/[quiz]/[code].astro`, `site/src/pages/c/[quiz]/[codes].astro` (code handling
only), the runner hand-off and `?with=` handling in `site/src/pages/q/[quiz].astro`, the result link lines in
`site/src/components/ShareBlock.astro` (the URL field and the card's URL line only), the /r/ link builder in
`site/src/pages/me.astro` (that only), a `short_links` section in `site/src/lib/account/schema.sql`, a line for it
in the account setup checks (`site/src/lib/account/checks.ts` and whatever renders `/account/setup/`), the SQL step
in `site/src/lib/account/README.md`, and a new section in `site/scripts/engine-test.mjs`.

Today's codes: Compass 6 (no prefix), sins 7 (`S`+6), figures 8 (`BF`+6), gifts 16 (`SG`+14), Psalm 3-6 (`PS`...).
The canonical code (what the shelf, the accounts table, `encodeFor` and `decodeFor` use) does NOT change. What
changes is the PUBLIC code, the one in every URL a person sees or shares:

1. **Prefix quizzes whose body is 6** (sins, figures): the public code is the canonical code without its prefix.
2. **Quizzes flagged `shortLinks`** (gifts now; quiz #4 in wave 2): the public code is a 6-character code stored in
   Supabase. Table `public.short_links (code text primary key check (code ~ '^[0-9A-Z]{6}$'), quiz text not null,
   full text not null, created_at timestamptz default now(), unique (quiz, full))`, row-level security on with NO
   public policies (only the server's secret key reads or writes it). The code is deterministic: the first 6 base-36
   characters of a hash of `quiz + ':' + full`; on the rare collision with a different row, hash again with a salt.
   `POST /api/short {quiz, code}`: 400 unless the code decodes for that quiz; upsert; return `{ short }`.
   `GET /api/short?quiz=&code=` resolves a short code to the canonical one (used by the runner for `?with=`).
   Uses `SUPABASE_SECRET_KEY` through PostgREST, as `checks.ts` already does. With no table or no key, every call
   fails soft and the long code is used, so nothing breaks before the owner runs the SQL.
3. **Everything else** (Compass, Psalm): the public code is the canonical code.

`links.ts` exports `publicCodeSync(quiz, code)` (cases 1 and 3, and the canonical code for case 2), and server-side
`resolveCode(quiz, raw, env)` which accepts the canonical code, the prefix-stripped code, or (for `shortLinks`
quizzes) a 6-character code looked up in the table. `/r/` and `/c/` resolve through it (a comparison URL may mix
forms). Old links keep working forever.

The runner, on finishing: for case 1, go to the stripped code; for case 2, POST to `/api/short` with a 1.5 second
timeout and go to the short URL, falling back to the long code. The invite link (`/q/<slug>/?with=<code>`) uses the
public code, and the runner resolves a short `?with=` through `GET /api/short`. ShareBlock shows the page's own
public code; if a `shortLinks` result page was opened by its long code (from /me/, say), it mints the short code on
load and swaps the field and the card's URL line to it. /me/ links use `publicCodeSync`.

`schema.sql` stays safe to re-run (create if not exists, drop policy if exists). Add the owner's one step to the
README in plain words: open Supabase, SQL editor, paste the file, Run. Add a line to `/account/setup/` that turns
green when the table answers. Engine test: round trips of all three forms for every quiz, junk refused, a stripped
code never accepted by another quiz, and the fail-soft path.

---

## Wave 1, Builder O: a personal link preview for every result, and the logo on every card

Owns: `design/og/*` (card.html, cards.mjs, render.mjs), the generated `site/public/og/*.jpg` and
`site/src/data/og-cards.json`, `site/src/lib/seo.ts` (a new `resultCardFor` only), and `site/src/layouts/Base.astro`
(a new optional `ogImage` prop that overrides `ogImageFor`; the og and twitter image lines only).

1. **The logo on every existing card.** The owner wants his brush W on everything he shares (memory:
   quiz-standard-bar). Add the W (`site/public/img/logo-w-large.png`, scaled down only) beside the "Wiser Walk"
   wordmark on `card.html`, and re-render all 57 existing cards (`node design/og/render.mjs site`).
2. **One preview per result outcome**, 1200x630 JPEG, file names `r-<quiz>-<outcome-slug>.jpg`, in the card kit's
   look: the quiz's question as the kicker, a short "my result" line, the outcome's name large, its picture, the
   logo and wordmark, `wiserwalk.com`. Never a percentage, never the reader's answers.
   - theology-compass, one per tradition (18): "Nearest tradition on my map:" + the tradition's name, the quiz plate.
   - bible-figure, one per figure (25): "Who in the Bible I'm most like:" + name, the figure's own plate where
     `art.ts` has one.
   - which-psalm, one per psalm a result can print: "The psalm I'm living right now:" + "Psalm 23", the quiz plate.
     Never the situation or its verse (a reading's situation does not travel; see ShareBlock's reading card).
   - seven-deadly-sins (7): "The deadly sin I'm weakest to:" + name. spiritual-gifts (19): "My strongest gift:".
   - which-early-christian (22, for wave 2): "My kindred spirit in the early Church:" + name + dates, the colour
     portrait from `design/quiz-ideas/fathers/preview/img/<key>.jpg` (keys and slugs in
     `design/quiz-ideas/fathers/people.json`; file name by slug).
3. `resultCardFor(quiz, view): string | null` in `seo.ts` returns the card's path when one exists in
   `og-cards.json`: bipolar quizzes when the state is `near` or `tie` (named[0]); the Psalm quiz by psalm number;
   unipolar quizzes only when the state is `clear` (named[0]); `which-early-christian` by `named[0]` (wave 2 puts
   the kindred spirit's slug there). Otherwise null, and the page keeps the quiz's own card. Builder L wires it into
   the /r/ page as `<Base ogImage={resultCardFor(quiz, view) ?? undefined} ...>`: export exactly that name.

The images are committed because Vercel has no Chrome. Report the total size added.

---

## Wave 1, Builder Y: the reader's own answers on outcome pages

Owns: `site/src/lib/mine.ts` (new, browser-only), `site/src/pages/tradition/[slug].astro`,
`site/src/pages/figure/[slug].astro`, `site/src/pages/axis/[quiz]/[axis].astro`, `site/src/pages/psalm/[slug].astro`,
`site/src/components/RailStack.astro` (hooks only), and a new stylesheet or component styles for what you add.

The owner: when someone comes from a result, the in-depth pages should show "my answer against theirs, just like
the main results"; someone browsing without a result sees the pages exactly as now.

- `mine.ts` finds the reader's result for a quiz: `sessionStorage['ww:took:<slug>']` first (just finished), else
  the newest entry for that quiz on the device shelf (`lib/shelf.ts`). It decodes it in the browser with the quiz's
  codec parameters (radix, slots, prefix) printed into the page, using `engine/codec.ts` (small, no data). Never
  import the registry or quiz data into the browser.
- **Tradition and figure pages:** a "You" marker on each rail the page draws, in a colour and shape that cannot be
  mistaken for the outcome's own knob, plus one line above the rails: "Your answers are marked. From your result on
  23 September. See your result" (the link uses the public code: `publicCodeSync` from builder L's `links.ts`; if it
  is not there yet, build the /r/ URL with the canonical code and say so in your report). On figure pages, only on
  the axes the figure is placed on.
- **Axis pages** (all quizzes that have them): the reader's position on that axis (bipolar: a marker on the rail
  and the band words; unipolar: the strength words the result page uses for that category), with the same one line.
- **Psalm pages:** if the reader's latest Psalm result is this psalm, one line: "Your answers pointed to this psalm."
  with a link to the result. Nothing else (the answers are not in the code).
- RailStack also draws the result page: nothing about its look may change there (a binding rule). Add hooks (data
  attributes, a hidden marker element), never restyle.

---

## Wave 1, Builder V: one checker for quiz #4's lines and facts

Owns: `design/quiz-ideas/fathers/excerpts.json`, `people.json` (the who, hook, status and pairs text only; never
the slugs), `table.mjs` (OVERRIDE only), and a new `design/quiz-ideas/fathers/VERIFY.md`. The owner has approved the
quiz, so this is the one check before it goes live (his rule: verify only what survives his review, with one agent).

For every line quiz #4 SHOWS (`design/quiz-ideas/fathers/quiz.json`, cells without `hide`): fetch its source (the
`url` in the research file the cell came from: `research/topics/*.json`, or `research/figures/*.json` for the few
`use` swaps) with curl, strip the tags, and confirm (1) the words are there verbatim, allowing only the documented
edits (a capital first letter, a closing full stop, capitals on pronouns for God, an OCR space); (2) it is the
person's own words or is labelled with who recorded them (`by`); (3) read in its context, it really shows the side
the cell says (agree or disagree with the statement's current wording in `model.mjs`); (4) the work's name is
right. Also check every `hook`, `who`, `status` and `pairs` sentence in people.json against the research files or a
reliable source. Fix what fails: correct the stretch, pick a better stretch from the same source, hide the line
(`'-'`), or recode the cell through OVERRIDE when the side is wrong. Then run `node model.mjs` and
`node preview/build.mjs` in that folder. VERIFY.md lists every change with its reason, and any line you could not
load.

---

## Wave 2, Builder K: quiz #4 in the site (after wave 1)

Split across two builders in sequence (K1, then K2 and K3 together). Source of truth:
`design/quiz-ideas/fathers/` (README, quiz.json from model.mjs, people.json, score.js, the draft-4 preview in
`preview/app.js`, which the owner approved: follow it for the result's content and order). Slug
`which-early-christian`; title "Which early Christian thinks like you?"; "And which would argue with you?" printed
directly under it on its card and start page (his ruling). Code prefix `EC`; canonical code = the 23 answers, one
base-5 digit each (`makeCodec`/the wide codec, radix 5, 23 slots); `shortLinks: true`; `comparable: false` for now
(a two-person page for this quiz is a later idea); `hideOutcomeScore`.

- **K1: data and engine.** `site/scripts/build-early-christian-data.mjs` (hooked into build-data, falling back to
  the committed output when the design folder is absent, like the Psalm script) writes
  `site/src/data/which-early-christian.json` and copies the portraits to
  `site/public/img/early-christians/<slug>.jpg` (from `preview/img/`, resized to 600px wide, progressive JPEG),
  with a credit line each in `site/public/img/CREDITS.md`. A new result shape `kindred` (`KindredView` in types.ts:
  kindred, sparring, ranked, the lines exactly as score.js chooses them; `named[0]` is the kindred spirit's slug),
  `site/src/lib/strategies/kindred.ts` (a port of score.js, same numbers: K 3, MIN_SHARED 6, SHRINK 0.5), the quiz
  file, registry and validation branches, compare refusing it, engine-test section 19 (codec, junk, cross-quiz,
  parity with design score.js on all 30 people in people-test-1, every shown line present, every person at least
  7 positions, 20,000 random sheets end with a kindred spirit or the honest "not enough to go on").
- **K2: quiz page, runner and result.** The standard statement runner in `q/[quiz].astro` (its 5-point scale) with
  a `kindred` branch where it assumes bipolar or ranked; the start page with the subtitle, the portrait strip and
  "Meet all 22" (to /early-christian/). A `KindredResult.astro` (band + body, like `PsalmReading`) following the
  preview: kindred spirit (portrait, dates, where, who, hook, status), where you think alike (your answer vs their
  line), where he would push back, the pair link, the sparring partner, the face-off, where he would argue, where
  you would agree, also close (with the topic), everyone nearest to farthest (each a link to their page). A visitor
  sees "They" and "Their". A `kindred` card shape in ShareBlock (the preview's card: portrait, name, dates, who,
  the line, "We agree on" chips, the sparring partner, logo and wordmark). SaveResult as every quiz has it.
- **K3: the in-depth pages and the listings.** `/early-christian/` (all 22, oldest first, CollectionPage JSON-LD)
  and `/early-christian/<slug>/` (portrait and credit, dates, where, who, hook, status; "Where he stood" on every
  statement with the line or "On record in <work>"; when the reader has a result for this quiz (as builder Y's
  `mine.ts` finds it), the preview's grouped view instead: where you agree, where you differ, where you were not
  sure; a quiz card; Person JSON-LD; breadcrumbs). `/early-church-on/` and `/early-church-on/<topic>/` for the 23
  questions (slugs in people.json `topicSlugs`): a plain question as the title (e.g. "What did the early
  Christians say about war?"), both sides with each person's line, "You said" when the reader has a result, a
  link to the quiz. SEO entries, social card, home page rail room, /quizzes/ ink, NextUp, /me/ colours, the footer
  short title, art, CREDITS, and a line on /method/.

Wave 2 closes with the main session checking every new page at 390 and 1360, light and dark, as a taker, a visitor
and a browser.

---

## Wave 2 addendum (after wave 1 shipped as 4238c9f)

What wave 1 built that K uses:
- `site/src/lib/engine/links.ts`: set `shortLinks: true` on the quiz; the runner's `linkFor` does the minting; add
  `'which-early-christian': 'short'` to the `want` table in engine-test 18b. `resultCardFor` (seo.ts) already knows
  this quiz: put the kindred spirit's SLUG (people.json `slug`, e.g. `gregory-of-nyssa`) in `view.named[0]`; the 22
  cards `r-which-early-christian-<slug>.jpg` exist.
- `site/src/lib/mine.ts`: `mineFor('which-early-christian', { radix: 5, slots: 23, prefix: 'EC' })` finds the
  reader's result in the browser for the person and question pages. `MineNote.astro` shows how the dev-only
  `?mine=<code>` works.
- Quiz #4's lines were checked against their sources (`design/quiz-ideas/fathers/VERIFY.md`); `quiz.json` is final.
  Augustine is now the kindred spirit of 8 of the 30 test people (the "pure" statement was recoded to its wording);
  that is accepted.

Ownership in wave 2:
- **K1** owns: `site/scripts/build-early-christian-data.mjs` (new) and its hook in `build-data.mjs`;
  `site/src/data/which-early-christian.json`; `site/public/img/early-christians/`; the new lines in
  `site/public/img/CREDITS.md`; `types.ts` (KindredView and the union); `strategies/kindred.ts`;
  `quizzes/which-early-christian.ts`; `registry.ts` and `compare.ts` (branches for the shape); engine-test section 19
  and the 18b entry; and a WORKS map in `design/quiz-ideas/fathers/model.mjs` (then rerun it and
  `node preview/build.mjs`). The map gives every work ONE plain English name a reader would search for, with no
  chapter, book or treatise numbers and no Latin tails (VERIFY.md lists them): e.g. "City of God", "Stromata",
  "Divine Institutes", "Homilies on Matthew", "Morals on the Book of Job", "Rule of St Benedict", "Life of Antony",
  "Life of St Martin", "On the Soul and the Resurrection", "Ascetical Homilies" (Isaac), and a letter always names
  its reader ("Letter to the Emperor Valentinian II"). Where the work already names who recorded it, drop the
  duplicate `by`. Status `live`.
- **K2** owns: `site/src/pages/q/[quiz].astro` (the kindred branch and the start page), a new
  `site/src/components/KindredResult.astro`, `site/src/pages/r/[quiz]/[code].astro` (kindred branches only),
  `site/src/components/ShareBlock.astro` (the kindred card shape only), and a new `site/src/styles/pages/kindred.css`.
  Use the site's kit (band, sheet, cards, kicker, pills), not the preview's one-off styles, but keep the preview's
  content and order exactly.
- **K3** owns: `site/src/pages/early-christian/` (index and `[slug]`), `site/src/pages/early-church-on/` (index and
  `[topic]`), any new components and a stylesheet for them, the new route entries in `site/src/lib/seo.ts` (entries
  only), the home page rail room (`pages/index.astro`, `styles/pages/home.css`), `/quizzes/` ink, `NextUp.astro`
  ink, `/me/` colours (`me.astro` class list only, `me.css`), `FOOT_SHORT` in `Base.astro`, `lib/art.ts`, a line on
  `method.astro` saying plainly that this quiz's short link keeps the answers on our server (its code is the 23
  answers), the quiz's own social card in `design/og/cards.mjs` (render it with `node design/og/render.mjs site
  quiz-which-early-christian`), and `quizzes:` front matter on articles that fit.
- Person and question pages must read well to someone who has never taken the quiz: they are the search pages.
  Plain titles people search for; a lede that answers the title; both sides fairly; every line with its work.
