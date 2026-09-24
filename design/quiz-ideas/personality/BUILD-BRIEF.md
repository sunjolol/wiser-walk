# Build brief: the Christian Personality Test goes live (2026-09-24)

The owner took the tap-through preview (`preview/personality.html`, published at
https://claude.ai/artifact/WQ8CjTEjwAfk52yLutWsBG) and said: "it's ready, push it live - make sure that if someone stops
midway it saves their progress though ... it will be a pleasant surprise if they come back and it picks right up with
the next question."

**The preview is the spec.** `preview/app.js` + `preview/style.css` show exactly what the quiz and the report look like
and say; `items.mjs`, `results.mjs` and `score.mjs` in this folder are the source of truth for every question, every
line of text and the scoring. Port them faithfully. Do not rewrite copy; do not "improve" wording; do not drop
sections. Where the site's standards (below) require something the preview lacks, add it in the preview's visual
language. The site's design rules (CLAUDE.md "THE RICHE PASS", memories on design) still hold: light default, dark via
the bulb, phone first, no one-word last lines, plain short sentences, capitals for every pronoun for God.

Read first: `README.md` in this folder (especially "The tap-through preview" and the draft 3 notes), CLAUDE.md, and
the maps in `C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/8320fd9e-53fe-4117-91cb-ee92de243e5b/scratchpad/map-engine.md`,
`map-pages.md`, `map-build.md` (how quizzes plug into the site; file paths and gotchas).

Builders never commit or push. Every builder runs `npm run test` in `site/` before reporting, and says what it
changed, file by file. Write build and test output to the scratchpad, never into the repo.

## Fixed decisions (do not revisit)

- **Name: "Christian Personality Test"** (the owner's ruling, 2026-09-24). It replaces "Personality Quiz" everywhere a
  reader sees the name: page titles and h1, the hero label, both share cards, link previews, the rail card, menus,
  /me/. The address does NOT change (his ruling: "keep the url we have, it's simple and works"): slug `personality`,
  routes `/q/personality/` and `/r/personality/<code>/`, the card footer link `wiserwalk.com/q/personality`.
  `codePrefix: 'PQ'`, `shortLinks: true`, `comparable: false`, `status: 'live'`, `hideOutcomeScore: true`,
  `icon: 'sparkle'`, `minutes: 12`, `shareTitle: 'Christian Personality Test'`. A new result shape: `'personality'`.
  In copy this brief quotes, "the quiz" meaning this one becomes "the test" (e.g. "We'll show it once 50 people have
  taken the test.", "Take the test"); the rest of the site's words for quizzes in general stay as they are.
- **Privacy by construction.** The twelve private statements (y1..y12, `block: 'private'`) NEVER enter a result code,
  a URL, the account database, analytics or the server. `score.mjs` now exports `derive(answers)`, which reduces them
  to six facts (`lowCheer, lowSer, lowConf, angerCell, angerMiddle, hardToCorrect`), and `score(answers, pub)`, which
  scores the public report from the public answers plus those facts (with `pub`, `thoughts` is null). Proven equal to
  full scoring on all 24 simulated people. The private page (page 8) is drawn only in the browser that took the quiz,
  from the private answers kept in that browser's localStorage.
- **The code.** `'PQ' + '1' + body`: `'1'` is the format version (bump it if the questions ever change). The body is one
  mixed-radix number, written in base 36 upper case, left-padded to a fixed width (the width of the largest value),
  built from, in this order: every `kind: 'two'` item in `ITEMS` order (58 of them, including b3), each as `v + 3`
  (radix 7); then `b1` and `b2`, each as a pick index (radix 29: 0 = none, 1..7 = one line by its index in `LINES`,
  8..28 = the 21 pairs i<j in lexicographic order); then the derived facts as one digit of radix 128
  (`lowCheer + 2*lowSer + 4*lowConf + 8*angerCellIndex(reeds,brief,worst,wood) + 32*angerMiddle + 64*hardToCorrect`).
  Use BigInt, no BigInt literals and no `**` (see `codec.ts` makeWideCodec for the house style). About 37 characters,
  within the 96-character limit of `resolveCodeSync`, `/api/short` and the Supabase checks. Decode is strict:
  prefix, version, length, character set, every digit in range; anything else is null.
- **Scoring parity.** The site scores with the SAME code as the design: `build-personality-data.mjs` writes a generated
  copy of `score.mjs` whose imports are rewritten to read one small JSON. Never hand-port it.
- **Progress saving** (the owner's request). The runner saves after every answer to localStorage
  `ww.progress.personality` = `{ v: 1, at, i, answers, seenPrivate }` (`answers` in the same shape `score()` takes,
  private answers included: this never leaves the browser). Coming back to `/q/personality/` with progress saved and
  unfinished: the start button reads **"Pick up at question N of 72"** and opens the runner straight on question N (the
  first unanswered one), with a quiet "Start over" text button beside it (asks nothing; clears and starts at 1). A small
  line in the runner on resume: "Welcome back. Your answers so far are saved on this device." Progress is cleared on
  finish. If `v` does not match, ignore and remove it. Every read and write in try/catch; the quiz must work when
  storage is blocked.
- **The private answers after finishing** go to localStorage `ww.private.personality` =
  `{ v: 1, entries: [{ code, answers: { y1..y12 }, at }] }` (newest first, at most 10). The result page shows page 8's
  content only when an entry's `code` equals the page's canonical code. Otherwise page 8 says, for the taker on another
  device: "Your private page stays on the device where you took the quiz."; for a visitor: "This page is private. Only
  the person who took the quiz can open it." No "Show it" button in either case.
- **"How common is your type?"** A server route `GET /api/tally?quiz=personality` (prerender false) counts finished
  results from Supabase `short_links` rows with `quiz = 'personality'` (every finished quiz mints one; the table is
  unique on `(quiz, long_code)`, so a retake with identical answers counts once). It pages through with PostgREST
  `Range` headers (1000 rows a page, stop at 200 pages), decodes each `long_code` with the strategy, and returns
  `{ total, types: { hearth: n, ... } }` with `cache-control: public, s-maxage=600, stale-while-revalidate=3600`.
  It excludes the example result's code (below). On any failure it answers `{ total: null }` with status 200. The
  result page fetches it after load: total null -> "We'll show it once 50 people have taken the quiz."; total < 50 ->
  "We'll show it once 50 people have taken the quiz. So far: N." (N = total); total >= 50 -> "About 1 in K people who
  have taken the quiz are The Still Water." (K = round(total / count), at least 1; if the type has 0, "Fewer than 1 in
  <total> people ... so far."). Population statistics are allowed (his ruling); no percentage between people.
- **The example.** The start page keeps the preview's "See an example" button, linking to the result page of simulated
  person p12 (`sim/answers-3.json`, id p12), encoded with that person's derived facts. Its code is exported from the
  data build as `EXAMPLE_CODE` so the tally can skip it.
- **Two share cards** exactly as the preview draws them (`drawCard` in `preview/app.js`: 1080x1350 canvas, the type
  card with the type painting; the role card with the line's picture, "Spiritual gift: X", the person's "How I got
  here" reasons and their type), with the owner's logo: his white W (`/img/logo-w-large-white.png`, copied from
  `design/graphics/logo-larger-white.png`) plus the wordmark (`/img/wordmark.svg`, fetched as text with
  `currentColor` set to white), and the footer line with the link. The top-right label reads **"CHRISTIAN
  PERSONALITY TEST"** (where the preview says "PERSONALITY QUIZ"; check it fits beside the logo). The footer prints **"What's your type?"** /
  **"Find yours"** and `wiserwalk.com/q/personality` (the owner approved these words on the preview). "Save image"
  downloads `wiser-walk-personality-<type>.png` / `...-<line>.png`; "Share" only where `navigator.canShare({files})`
  is true AND `(hover: none) and (pointer: coarse)` matches (the site standard); long-press hint as in the preview.
- **Taker and visitor.** The server renders the visitor's version; an inline script before first paint switches to
  the taker's version when `sessionStorage['ww:took:personality'] === view.code` OR a `ww.private.personality` entry
  has this code (the taker coming back later). Visitor differences: a slim note under the hero, "This is someone's
  Christian Personality Test result. Take it yourself to get yours." with a "Take the quiz" button; no "Save image" / "Save this
  card" buttons (the link box and "Copy link" stay); page 8 as above. Everything else is the same report.
- **Other quizzes on pages 8 and 10** open in a NEW TAB (his ruling) and are shown as cards with their Doré
  engravings (`/img/dore-eden.jpg`, `/img/dore-paul.jpg`), as in the preview. If this browser already has a result for
  that quiz (the shelf, `ww.shelf.v1`, read the way `lib/mine.ts` reads it, never by importing the registry into the
  browser), show it as added context above the card instead of the "Take it" lead: sins -> "From your seven deadly
  sins quiz: you are weakest to <name>." (the top category); gifts -> "From your spiritual gifts test: <top three
  gifts>." with a link to that result, and the card still offered for a retake. It never changes this report.
- **Result link standard** (design/share-standard/PHASE-A/B briefs): one labelled link box under the report,
  "Your result link" for the taker / "This result's link" for a visitor, with Copy; the short link swapped in after
  load when the page was opened by a long code (as `ShareBlock.astro` does with `mint`); `SaveResult` below it; then
  "Keep going" (NextUp) and "Worth reading" as on other result pages. The hero's "Copy link" copies the same result
  link. `comparable: false`, so no "Compare with a friend" box.
- **Link previews.** `r-personality-<type>.jpg` for each of the 8 types (1200x630, the type's painting, the kicker
  "Christian Personality Test", "My type:", the type's name; never answers), plus `quiz-personality.jpg`. `resultCardFor` picks
  the type's card.
- **Pictures on the site** (all public domain, credits in `preview/img/credits.json`): the 8 type paintings
  (`/img/personality/art/<type>.jpg`, 1100 px long side, JPEG ~78), the round faces
  (`/img/personality/faces/<key>.jpg`, 240 px square, from `preview/faces/` which `faces.py` makes), the page-10 role
  pictures (`/img/personality/lines/l-<key>.jpg` as in `preview/lines/`), and a mosaic of the eight paintings for the
  rail and the quiz band (`/img/personality/mosaic.jpg`, 2 across x 4 down, about 640x1024). A new section in
  `site/public/img/CREDITS.md` lists every file.
- **Everything the site needs is committed under `site/`.** `design/quiz-ideas/personality/` gets committed too
  (source of truth), but its heavy, rebuildable folders are gitignored (`preview/img/*.jpg`, `preview/small/`,
  `preview/alt/`, `preview/arts/`, `preview/faces/`, `preview/lines/`, `preview/personality.html`,
  `preview/contact-preview.jpg`). The data build must work on Vercel, where those are absent: it falls back to the
  committed site copies and generated files (the d53370a lesson). Test it with the inputs moved away.

## Builder 1: data and engine (runs first; the others build on it)

Owns: `site/scripts/build-personality-data.mjs` (new; one `await import` line in `site/scripts/build-data.mjs`),
`site/src/data/personality-scoring.json` and `site/src/data/personality.json` (generated),
`site/src/lib/strategies/personality-score.mjs` (generated), `site/src/lib/strategies/personality.ts` (new),
`site/src/lib/quizzes/personality.ts` (new), `site/src/lib/engine/types.ts`, `registry.ts`, `compare.ts`,
`site/scripts/engine-test.mjs`, `site/src/pages/api/tally.ts` (new), `site/public/img/personality/**` (new),
`site/public/img/logo-w-large-white.png` (new), the new section of `site/public/img/CREDITS.md`,
`design/quiz-ideas/personality/preview/.gitignore` (new).

1. `build-personality-data.mjs`, in the style of `build-early-christian-data.mjs` (guard, `generatedFrom`, fail()):
   - Imports `items.mjs`, `results.mjs`, `score.mjs` from the design folder when present.
   - Writes `personality-scoring.json` (small; goes to the browser through the registry): `SCALES`, `ITEMS` (all
     fields, texts included: the runner needs them), `THOUGHTS`, `LINES`, `PRIVATE_NOTE`, `TYPES` reduced to
     `{name, tagline, disposition, makeup, opposite, ink, art}`, and ONLY the structural parts scoring reads from
     `LEANINGS` (the keys), `LINKS` (`id, when, strongOnly`), `HELP` (keys and its `left/right/note`, which scoring
     returns), `VIRTUES` (the keys). Minified. Also `EXAMPLE` answers? No: export `EXAMPLE_CODE` (a string) only.
   - Writes `personality.json` (SERVER ONLY, like `which-early-christian.json`: never imported by anything the
     registry imports): every export of `results.mjs` (Q objects are plain `{q, cite}`), plus `LINE_SIGNALS`,
     `TRAP_*`, and `CREDITS` (reader-facing credit lines built from `preview/img/credits.json` the way
     `creditLine` does for quiz #4).
   - Writes `personality-score.mjs`: `score.mjs` verbatim except its two import lines, replaced by one import of
     `../../data/personality-scoring.json` and a destructure of the same names. Header comment: generated, never edit,
     from where. Then VERIFY: run both the design `score()` and the generated one on all 24 people in
     `sim/answers-3.json` and on 500 random full answer sets, and fail the build on any difference (JSON compare).
   - Copies pictures into `site/public/img/personality/` (sharp, lazy-loaded as quiz #4 does, only when the source
     is newer) from `preview/arts/`, `preview/faces/`, `preview/lines/` (run `python preview/faces.py` yourself first
     so they exist), builds `mosaic.jpg`, and checks that every picture the text references (`TYPES[k].art`,
     kindred `img`, `OPPOSITES` people `img`, `LINE_TEXT[k].img`) exists in the site folder. When the design folder
     is absent: use the committed copies, and fail only if a referenced picture is missing.
2. `personality.ts` strategy: `shape: 'personality'`; `score()` throws (own runner, as `reading.ts` does);
   `encode`/`decode` as specified; `result(quiz, values)` rebuilds the public answers and the derived facts, calls
   `score(answers, pub)`, and returns `PersonalityView { shape: 'personality', quizSlug, code, named: [typeName],
   headline: typeName, headlineParts: [{ text: typeName, side: 'centre' }], summary: tagline, ranked: [], rows: [],
   type, answers (public), pub, report (the score result) }`; `shareText` = `[shareTitle, 'My type: ' + name, tagline,
   origin + '/r/personality/' + code].join('\n')`. Export helpers the runner and the result page need:
   `encodeAnswers(fullAnswers) -> code` (derives the facts itself), `decodeAnswers(code) -> { answers, pub } | null`,
   `EXAMPLE_CODE`, and re-export `score`, `derive`.
3. `quizzes/personality.ts`: the Quiz object (`items: []`, `groups: []`, `outcomes`: the 8 types as
   `{ name, slug: <type key>, who: tagline }`, `outcomePathBase: 'personality-type'` (no pages are built there yet),
   `outcomeNoun: 'type'`, description <= 160 characters, e.g. "A free Christian personality test: 72 quick choices,
   then a ten-page portrait of who you are, built on St Gregory the Great and the desert fathers."). Register it
   (newest first after the existing order is fine; see the NextUp note in map-pages.md), add the `validate()` branch
   (`items`/`groups` empty, 8 outcomes, prefix PQ), the `ResultView` union member, and `compare()`'s throw.
4. `engine-test.mjs`: section 20 modelled on 19: config assertions; 2,000 random full answer sets encode -> decode ->
   same public answers and same derived facts -> same public report as full scoring minus `thoughts`; **privacy**:
   two answer sets that differ only in private answers but share derived facts give the SAME code, and no decoded
   object carries any `y*` key; junk and cross-quiz codes refused; parity with the design `score.mjs` via `import()`
   on the 24 simulated people when the design folder exists (skip with "ok" when absent); the share text; every
   picture referenced exists under `site/public`; no server-only text in the registry bundle (a sentence from
   `personality.json`, e.g. a `LEANINGS` "unseen" line, must not appear in the bundled registry). Add `personality`
   to the `want` maps of 1b and 18b (kind `short`).
5. `api/tally.ts` as specified, with a unit check in engine-test using a fake PostgREST fetch (paging, bad codes
   skipped, example skipped, Supabase down -> `{ total: null }`).

## Builder 2: the runner and the start page (after builder 1)

Owns: `site/src/components/PersonalityRunner.astro` (new), `site/src/styles/pages/personality-run.css` (new, every
rule prefixed `.pqr-` because dynamic-route sheets reach every quiz page), the `personality` branch in
`site/src/pages/q/[quiz].astro`, and ONE change in `site/src/layouts/Base.astro`: the `ww:finished` account listener
must also attach on this runner (today it checks `#runner` only, which the Psalm runner also misses: make it
`document.querySelector('#runner, [data-quiz-runner]')` and give both this runner and ReadingRunner's root
`data-quiz-runner`; Base may hold only ONE processed script, so edit inside it, never add another).

- The runner is `preview/app.js`'s question flow, ported: two-sided items with the A/B cards and the seven labelled
  points (tapping A or B records -3 or +3; the whole column is the target; the labels as in the preview), the private
  note screen and the private block on the site's starry ground, the two pick questions with Next, Back, the
  progress bar, "N of 72". Items come from the registry's scoring JSON (via the strategy exports). Keyboard: 1-7
  answer a two-sided or private item; Backspace goes back. A 250 ms settle guard against double taps (as
  ReadingRunner). While playing, hide the page band and the rest of the page as `reading.css` does.
- Progress saving and resume exactly as in "Fixed decisions".
- Finish: full answers -> `encodeAnswers` -> store the private answers (`ww.private.personality`) -> set
  `sessionStorage['ww:took:personality'] = code` -> `addResult('personality', code, at)` -> dispatch `ww:finished`
  -> clear progress -> `requestShortCode` (as `linkFor` in `q/[quiz].astro`) -> go to `/r/personality/<link>/`.
- The start page (the `personality` branch): the band with the mosaic plate (`artFor`; builder 4 adds the entry),
  title, the preview's lede ("Seventy-two quick choices. Then a ten-page portrait of who you are, what trips you up,
  and where you fit."), tiles About 12 min / 72 questions / 8 types, the start button (or "Pick up at question N of
  72" + "Start over"), "See an example" -> `/r/personality/<EXAMPLE_CODE>/`. The band's h1 is "Christian
  Personality Test".
- **Deep dives under the band** (the owner, 2026-09-24: "make sure that the quiz page itself has fun deep dives and
  extra info like the other quiz pages have (but obviously relevant to this quiz, not padding but playing to the
  strengths of the quiz with whatever presents best)"). Look at how the other quiz pages present theirs
  (`q/[quiz].astro`: the Compass's preview, quiz #4's portrait strip, the Psalm quiz's sections, `QuizPreview.astro`,
  `OutcomeIndex.astro`) and match that quality and rhythm with the site's section heads (`SectionHead.astro`) and kit.
  Every word and quotation comes from `personality.json` (results.mjs), never new claims; plain short sentences. In
  this order:
  1. **The eight types**: the preview's grid of eight painting cards, each opening the preview's type sheet (painting,
     name, tagline, portrait, trap, kindred), so people can browse the results from the quiz page (his standing ask).
     One line above it on where they come from: Gregory the Great sorted people twice, by temper (cheerful, serious,
     careful, confident) and by mind (quiet or restless), and the eight types are the two together.
  2. **A trap for every temper**: `TRAP_LEAD` (the tempter studies each person first, then sets the trap right next
     door), then four cards, one per disposition: the temper, its trap (pleasure, a quarrel, fear, praise) and
     Gregory's own line for it (`DISPOSITIONS[k].trap.quote`). Close with "The test tells you which one is set for
     you."
  3. **Four kinds of anger**: Gregory's 2 x 2 (catches quickly or slowly; lets go quickly or slowly) drawn as the
     preview's page-5 grid, with his images (kindled reeds, hard wood) from `ANGER`. No reader is placed on it here.
  4. **What your report covers**: the ten pages as a compact, good-looking list or strip (not a wall of text): each
     page's title and one short line on what it gives you. Mark page 8 as private (a lock, "only you see it"), and
     say there are two cards to save and share: your type, and your role in the Body.
  5. **The saints behind it**: a strip of round faces (from `/img/personality/faces/`) with one line each: St Gregory
     the Great (the Pastoral Rule and the Moralia, around 590), St Gregory the Theologian (how to help each kind of
     person), St John Cassian (the eight thoughts and the lines in the Body; he has no portrait in the set, so use a
     plain monogram circle or leave him out of the faces and name him in the line), the desert fathers (Abba
     Arsenius). Only what the report itself already says about them.
  Then the page's usual "Read next". No section numbers, no process talk, no "our method" paragraphs.

## Builder 3: the result page (after builder 1, in parallel with 2 and 4)

Owns: `site/src/components/PersonalityResult.astro` (new; may be split into a few `Personality*.astro` components),
`site/src/styles/pages/personality.css` (new, every rule prefixed `.pq-`), and the `personality` branches in
`site/src/pages/r/[quiz]/[code].astro`.

- The report is `preview/app.js` `result()` ported to Astro: the hero (painting, white logo, the label "Christian
  Personality Test" where the preview says "Personality Quiz", "Your type", name,
  tagline, badges, strongest leanings, the rarity box, "Save image" + "Copy link"), the sticky pager (previous /
  "N of 10 · page" opening the list of all ten / next / progress line; no "Page N" labels on the pages), pages 2-10
  with everything they show in the preview, the type sheets, "How this quiz works", "Picture credits". Server-render
  everything public from `personality.json` (front matter import only) and `view.report`; client scripts only for the
  pager, sheets, rails (native details), the canvas cards, "Copy", the rarity fetch, page 8, and the other-quiz
  context. Use the site's tokens and components where they match (`.btn`, starry `.dark` ground, fonts, `.brand`
  markup for the logo) and the preview's styles for the rest, so it looks like the preview inside the site's frame.
- The result route: for `shape === 'personality'`, render `PersonalityResult` in place of the band AND the body
  (the hero replaces the band), keep noindex, title `${typeName} — Christian Personality Test`, description the tagline, and put
  the standard pieces after the report: the result link box (see "Result link standard"), `SaveResult`, NextUp, Worth
  reading. Do not render the generic `ShareBlock` for this shape.
- Page 8 for the taker on this device: the lock box with "Show it"; revealing it scores the thoughts in the browser
  (`score(fullAnswers)` from the strategy, public answers from the code + private from `ww.private.personality`) and
  draws the preview's cards from a JSON island of `THOUGHT_TEXT` and `FIGHT` rendered into the page.
- Everything in "Fixed decisions" about taker/visitor, the tally box, the two cards, and the other-quiz context.

## Builder 4: integration, pictures and link previews (after builder 1, in parallel with 2 and 3)

Owns: `design/og/cards.mjs` (+ running `node design/og/render.mjs site personality` to make the 9 JPEGs in
`site/public/og/` and refresh `site/src/data/og-cards.json`), `site/src/lib/seo.ts` (`resultCardFor` branch ->
`r-personality-<type>`, and an `SEO['/q/personality/']` entry: title <= 65 and led by the words "Christian
Personality Test", description 50-160 ending in a full stop, written for people searching for a Christian personality
test), `site/src/lib/art.ts` (`ART.personality`: the mosaic, alt text naming the eight painters' scenes briefly),
`site/src/pages/index.astro` + `site/src/styles/pages/home.css` (a rail card for the quiz, LEADING the rail right after
the Compass card as the newest quiz; the mosaic in colour, not sepia; title only, no line under it; its facts
"12 min" and "72 questions"; its own room ink, a hue none of the five taken ones is near), `site/src/pages/quizzes.astro`
(INK, `countFact`), `site/src/components/NextUp.astro` (QUIZ_INK, `countFact`), `site/src/pages/me.astro` +
`site/src/styles/pages/me.css` (`.mroom--personality`; the shelf card prints the type and tagline), `MineNote.astro`
(skip this shape), and `method.astro`/`about.astro` only if they list the quizzes. Every `shape` switch listed in
map-engine.md "Current branches on shape" that is not owned by builders 1-3 gets a `personality` case (usually "treat
like kindred": no outcome pages, no compare).

## After the builders (the main session)

`npm run test` and `npm run build`; the Vercel fallback test (move the design inputs away, run the data build, restore);
screenshots at 390 and 1360, light and dark, as taker, visitor and fresh visitor (start page, a question, the private
block, resume after reload, the report, both cards, the home rail, /quizzes/, /me/); fix; commit; push.
