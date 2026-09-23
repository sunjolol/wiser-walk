# How "Which Psalm are you living right now?" would fit into the site's code

The short answer is that the engine can't take this quiz as it stands. Every piece of it assumes five-point agree/disagree statements, and every result must be one of two shapes: poles (the Compass, the figure quiz) or a ranking (gifts, sins). This quiz needs multiple-choice questions and a new shape whose result is one of Athanasius's own pairings. The engine was built to allow a third shape; `types.ts` says so in a comment. It is a real piece of work, though, not a new data file.

## 1. How a quiz is defined today

**`site/src/lib/engine/types.ts`**
- A question is `QuizItem { n, text, group, direction: 1 | -1 }`. An answer is `Answer = -2|-1|0|1|2`, and a set of answers is `Sheet = Array<Answer | null>`. Only agree/disagree answers exist.
- `QuizGroup` is either an axis with two poles or a single category.
- `Outcome { name, slug, position?, mask?, who?, note? }`.
- `ResultView = BipolarView | UnipolarView`, told apart by `shape`. Both views carry `quizSlug, code, named[], headline, headlineParts[], summary, ranked[]`.
- `ScoringStrategy { id, shape, score(quiz, sheet) → number[], result(quiz, values) → ResultView, encode, decode, shareText }`.
- `Quiz` has `slug, title, tagline, description, intro?, icon, minutes, status, items, groups, outcomes, strategy, config, shareTitle, codePrefix?`, plus optional words and notes: `outcomeNoun*`, `outcomePathBase`, `hideOutcomeScore`, `groupNoun*`, `notes: QuizNotes`, `groupNote`, `unipolarCopy`, `uniformSheet`.
- Helpers: `notesFor`, `resultNotes`, `groupNoteFor`, `isUniformSheet`, `outcomePathBase`, `rankWord`.

**`site/src/lib/engine/registry.ts`**
- `QUIZZES = [theologyCompass, sevenDeadlySins, bibleFigure, spiritualGifts]`. Adding a quiz means one import and one entry in this list.
- Wrappers: `scoreQuiz`, `resultFor`, `encodeFor`, `decodeFor`, `shareTextFor`. URLs are re-exported from `urls.ts` and `compare.ts`.
- Checks that run when the file loads:
  - `validate()` requires every group to have questions keyed both ways, and checks `config.radix === itemsPerGroup*4+1`. **A multiple-choice quiz fails this at load time.**
  - `validateOutcomeSlugs()` stops two quizzes sharing a page address.
  - `validateCodePrefixes()` requires unique prefixes, and only the Compass may go without one.
  - `validateOutcomePositions()` and `validateOutcomeMasks()` apply to pole quizzes only.

**`site/src/lib/engine/codec.ts`**
- `makeCodec(radix, slots, prefix)` stores one 0..100 value per group, with a body of at least 6 base-36 characters. It switches to `makeWideCodec` (BigInt) when the numbers get too large.
- A value is stored as `round(v*steps/100)`. That loses information once there are more than 101 steps, so **it cannot safely hold an item number above about 100.** It is also clumsy for a single number.

**`site/src/lib/engine/urls.ts`**
- `quizHref` → `/q/<slug>/`, `groupHref` → `/axis/…`, `resultHref` → `/r/<slug>/<code>/`, and `outcomeHref` → `/${outcomePathBase}/<slug>/`.

**`site/src/lib/engine/compare.ts`**
- `compare()` handles the pole shape and otherwise **assumes** a ranking (`va as UnipolarView`). `parseCodes`, `compareHref` and `inviteHref` (`/q/<slug>/?with=<code>`) serve the two-person page.

**The strategies**
- `strategies/bipolar.ts` (`bipolar`): each axis gets a 0..100 score. Results are named by nearest distance, using `nearest()` and `nearestState()` with the states near/tie/loose/central, plus bands and `lean()`.
- `strategies/category.ts` (`category`): each category gets a 0..100 score and they are ranked. It has `pull()`, `tieMargin()` (via `config.tieSteps`), `namingFloor()`, up to four level categories named, and the states clear/tie/flat.

**The quiz files**
- `quizzes/theology-compass.ts` maps `data/compass.json` (no code prefix).
- `quizzes/bible-figure.ts` is a pole quiz. It uses `outcomePathBase: 'figure'`, `hideOutcomeScore`, masks, and its own `FigureOutcome` with `evidence`. Prefix `BF`.
- `quizzes/spiritual-gifts.ts` is a ranking with 19 categories and uses the wide codec. Prefix `SG`.
- `quizzes/seven-deadly-sins.ts` is a ranking. Prefix `S`.

**Important: quiz files end up in the browser.** The quiz runner's script imports the registry (`q/[quiz].astro`), and so does the script on `/me/`. That pulls every quiz file into the page's JavaScript. Psalm text and long explanations must therefore **not** live in the quiz file.

## 2. Does it fit an existing strategy?

No. I compared four designs.

| Design | How it works | Verdict |
|---|---|---|
| **A. Ranking** (`category`) | Each Athanasius situation is a category, with at least two statements each keyed both ways | Rejected. 30–60 situations would need 60–120 statements. The result page would rank every feeling (`CategoryStack` shows all rows), and ties are settled by the spelling of the names. |
| **B. Poles** (`bipolar`) | Invent 5–6 dimensions (source, duration, what the person wants…), give each psalm coordinates, pick the nearest | Rejected. The coordinates would be made up: Athanasius describes situations, not points in a space. The distance between "repenting" and "slandered before a king" means nothing, and a nearby psalm can be handed out even though the thing that defines it was never said. The figure quiz's mask machinery shows how hard it is to keep this honest. |
| **C. Weighted votes** | Each answer adds points to situations; highest total wins | Rejected. The weights are our own judgement. It can hand out Psalm 51 (repentance) to someone who never said anything about their own wrongdoing, which in effect invents a pairing. It also produces many ties. |
| **D. Sieve** (recommended) | Below | Every result is a situation Athanasius named, and every part of it was matched by the person's own answer. |

### D. The sieve: a new `strategies/reading.ts` with shape `'reading'`

**The data**
- One entry per situation Athanasius wrote about: `{ id, psalm, lxx, section, also?: number[], facets: {feel?, source?, who?, howLong?, want?}, line, why }`.
  - `id` is permanent and never reused.
  - `psalm` is the English number; `lxx` is his number.
  - `also` holds the other psalms he names for the same situation. When he lists several ("17, 86, 88 and 140"), his first is the result and the rest are listed after it.
  - `facets` holds **only the parts his own sentence states**, each traceable to the section it came from.
- The five questions (what it feels like, where it comes from, who is involved, how long it has lasted, what the person most wants to say) are multiple choice. Each option sets one value of one facet, in everyday words that don't point to Scripture.

**Scoring**
1. A situation is **eligible** only if every facet it states matches the person's answer. Facets it doesn't state match anything.
2. Among eligible situations, the **most specific wins**: the one where the most stated facets matched, meaning the fullest description of this person that Athanasius gave.
3. **Ties are settled by the person, never by the arithmetic.** If two or three situations are still level, the last screen shows each one as a single plain-language line (no psalm numbers) and asks which is closer. This is the same kind of screen as the existing `#uniform` box in the runner.
4. **The questions adapt.** A question is skipped when every remaining candidate either agrees on that facet or doesn't state it. Most people answer four or five questions, not all of them.
5. **No path may end with no answer.** The test file enumerates every possible set of answers (5 questions × 4–6 options is a few thousand paths). It asserts that every path gives at least one and at most three candidates, and that every situation can be reached. That makes the set of situations complete by construction and removes any need for a fallback reading nobody wrote.

**Result code**
- Write a dedicated codec with prefix `PS` plus the situation `id` in base 36, padded to 2 characters (for example `/r/<slug>/PS1F/`). It is exact-length, uppercase, and anything else is refused.
- **Store the situation, not the psalm.** Athanasius pairs some psalms with more than one situation, so the psalm number alone would lose the reason.
- An unknown id gets a 404. A situation that is later retired keeps its id so old links still resolve.
- The code checks `^[0-9A-Z.]{1,96}$` in `account/schema.sql` and the shelf both accept this.
- The code should **not** carry the person's answers, because the link is what gets shared and it would reveal their feelings. The finisher's "because you said…" lines can come from the tab-scoped `sessionStorage` the runner already writes (`ww:took:<slug>`), so only the finisher's own tab would see them.

**Changes the engine needs** (all additions; nothing existing changes behaviour)
- `types.ts`:
  - `QuizItem` gains `kind?: 'scale' | 'choice'`, `options?: {key, text}[]`, `facet?`.
  - `Sheet` widens to `Array<number | null>`. Today it is only used in `registry.ts` and the strategies.
  - Add `ReadingView { shape: 'reading'; state: 'clear'; reading; psalm; rows: []; ranked: [] }` to `ResultView`.
  - `ScoringStrategy` gains optional `validate?(quiz)`, `next?(quiz, sheet)` (which question comes next) and `candidates?(quiz, sheet)` (the tie screen).
- `registry.ts`: `validate()` must hand off to `strategy.validate` for choice quizzes (skip the both-ways and radix checks).
- `compare.ts`: refuse this shape so `/c/` gives a 404. The share block and runner need a flag (for example `Quiz.comparable?: false`) to hide "See where you land next to them" and ignore `?with=`. Comparing two people's psalms makes no sense and would expose feelings.

**Numbering: put a check in code, not just in data.** Add `lxxToHebrew(n)`, which maps his numbering to English Bibles: 1–8 stay the same, 9 becomes 9–10, 10–112 become 11–113, 113 becomes 114–115, 114 and 115 both become 116, 116–145 become 117–146, 146 and 147 both become 147, and 148–150 stay the same. A test asserts that every situation's `psalm` is inside `lxxToHebrew(lxx)`. That catches the online copy's mistakes (its 27 for his 12, which is English 13; the Gradual Psalms as 120–134; the "cried unto the Lord in their trouble" refrain as English 107). Wherever one of his numbers covers two English psalms, the data must say which one is meant.

## 3. Pages for each psalm

**What exists now**
- `pages/figure/[slug].astro` is written for one quiz only: it imports `bibleFigure` directly, builds its pages from `outcomes` in `getStaticPaths`, and uses the figure's plate from `artForOutcome()`, `Hero`, `CompassWheel` and `RailStack`, `TraditionNeighbours`, `CorrectionNote`, and the quiz card at the foot.
- `pages/tradition/[slug].astro` does the same for the Compass.
- Gift and sin pages come from the generic `pages/axis/[quiz]/[axis].astro`, one page per group that has a `summary`.

**What a psalm needs**
- A new `pages/psalm/[slug].astro`, with `outcomePathBase: 'psalm'` and outcomes `{ name: 'Psalm 42', slug: '42' }`. The slug check accepts plain digits, and `validateOutcomeSlugs` will guard collisions.
- Each page is built once (not on request) and can be indexed. It would show:
  - every situation Athanasius paired with that psalm, reworded in our own words and cited by section of the Letter to Marcellinus;
  - the psalm in full from the Berean Standard Bible, with its superscription marked as Scripture and the BSB's own section headings marked as the translators' (or left out);
  - the other psalms he named alongside it;
  - a way into the quiz.
- `lib/seo.ts`: `ogImageFor()` needs a `/psalm/<n>/` branch. Without it these pages fall back to the home page's social card. Page titles and descriptions must pass `seo-test.mjs`: title 65 characters or fewer, description 50–160 characters and not cut mid-word, exactly one `<h1>`, a canonical link, `og:image`, and alt text on every image.
- On the quiz's intro page, `OutcomeIndex.astro` lists the outcomes automatically (e.g. "N psalms, one page each").

## 4. Bible text: how it is fetched now, and what whole psalms would cost

**How it works now**
- `scripts/fetch-passages.mjs` is run by hand and needs the network. It reads `data/compass.json`, fetches `https://bible.helloao.org/api/BSB/<BOOK>/<ch>.json`, keeps only the **first 5 verses** of each reference, and writes `data/passages.json` with a licence block (BSB, public domain since 30 April 2023). The file is generated but committed.
- Right now: 50 references, 34.7 KB.
- It is read only by `components/PassagePills.astro`, which runs on the server, so the text sits in the HTML and never in a script.

**Whole psalms, measured from `psalms-bsb.json` in the scratchpad**
- All 150 psalms: about 265 KB as compact JSON, 39,479 words.
- A typical psalm: about 1.4 KB (Psalm 32, 11 verses). The largest are 119 (15.6 KB, 176 verses), 78 (7.4 KB), 18 (5.4 KB) and 89 (5.3 KB).
- 116 psalms have a superscription.
- Only the psalms the situations use would ship: **roughly 70–120 KB for 40–60 psalms**, more if 119 or 78 are among them.

**Build steps**
- Add a new `scripts/fetch-psalms.mjs` modelled on `fetch-passages.mjs`. It reads the situation list and writes `src/data/psalms.json`, also committed.
- Unlike the scratch fetcher, it should **keep the order of headings and verses** and tell the superscription apart from the BSB's editorial headings. The scratch version collapses all headings into one list and loses where they sat, including in Psalm 119.
- Where the text is read:
  - The per-psalm pages are built once, so there is no runtime cost.
  - The result page is rendered on request (`export const prerender = false`), so importing `psalms.json` there adds about 100–265 KB to the server function. That is negligible.
- **Never import it from the quiz file**, or it lands in every quiz page's JavaScript.

## 5. The surfaces a new quiz touches

**Quiz page, `pages/q/[quiz].astro`**
- The runner is built for agree/disagree only:
  - the `SCALE` array and its five buttons;
  - "Statement N of M" and the progress pips;
  - keys 1–5;
  - `finish()` → `isUniformSheet` → `goToResult(scoreQuiz(...))`.
- It needs a choice renderer that follows `strategy.next()`, a Back button that steps back along the adaptive path, and the tie screen.
- Intro text assumes statements: the stat tiles ("Statements" and the Axes label), the scale icon in the how-to list, and the heading "`{n} statements, about {m} minutes`". `QuizPreview.astro` only has pole and ranking versions, so it needs a third version or must be hidden for this quiz.
- `goToResult` already saves to the shelf (`addResult`), fires the `ww:finished` event for accounts, and redirects. Both work as they are.

**Result page, `pages/r/[quiz]/[code].astro`**
- It branches on `bipolar` versus everything else, and everything else gets `CategoryStack`. It needs a `'reading'` branch with a new component (for example `PsalmReading.astro`) showing:
  - Athanasius's situation in our words, with its section;
  - the full psalm;
  - the other psalms he named;
  - a link to `/psalm/<n>/`.
- With `ranked: []` the outcomes section doesn't render, and the depth panels only render for pole quizzes. The title comes from `view.headline`; the description comes from `view.summary`. The page is not indexed.
- `EmailCapture.astro` assumes the ranking rows (`r.rank`). It needs a branch, and there is a privacy question: the form sends `quiz` and `code` to the mail provider, and that code would name the person's emotional situation.

**Share block, `components/ShareBlock.astro`**
- The share card is drawn on a 1080×1350 canvas, and only pole results get a picture (`drawWheel`). A ranking draws the headline, summary and notes only. A reading could draw the headline plus one exact verse.
- Fixed wording that needs changing:
  - `data-mine="Share your compass"` (wrong for every quiz except the Compass);
  - "`N statements, about M minutes`";
  - the compare-invite row, which must be hidden when the quiz can't be compared.
- `shareText` must be written by the new strategy. Test 7 expects its first line to be `shareTitle` and the text to contain `/r/<slug>/`.

**Social cards**
- `design/og/cards.mjs` lists them and `design/og/render.mjs site` draws them. It needs headless Chrome at `C:/Program Files/…` and Python with PIL, so it runs **locally, not on Vercel**.
- The output goes to `site/public/og/*.jpg` (about 140 KB each; 56 cards is 7.8 MB now) and the list to `site/src/data/og-cards.json`, which `seo.ts` reads.
- Add `quiz-<slug>`, and optionally `psalm-<n>` for each psalm. 40–60 more cards is about 6–8 MB committed.

**The `/me/` shelf and accounts**
- `lib/shelf.ts` stores `{quiz, code, at}` in `ww.shelf.v1` and treats every quiz the same. It only keeps a result if its code decodes.
- `/me/` draws one room per quiz from `QUIZZES`, using `resultFor(...).headline` and `.summary`, so it works as long as the new view provides those. It needs a room colour in `me.css` (`.mroom--<slug>`).
- Accounts: `lib/account/schema.sql` keeps `(quiz, code, taken_at)` in Supabase, so for signed-in users **the psalm situation is stored on the server**. `/method/` should say so.

**Quiz lists**
- `pages/index.astro` codes each quiz's panel by hand (`getQuiz('bible-figure')` and so on, with `.room--figures` style classes). It needs a new panel plus CSS in `styles/pages/home.css`.
- `pages/quizzes.astro` lists from the registry, but needs a colour entry and a `.qcard--<slug>` rule in `styles/pages/reference.css`.
- `components/NextUp.astro` needs a colour entry.
- `lib/art.ts` needs the quiz's picture via `ART[slug]`. There is no psalm or harp plate in `public/img/`, so a new public-domain image and a line in `CREDITS.md` would be needed.
- `layouts/Base.astro` has `FOOT_SHORT` for long footer titles, which this title needs.
- `lib/seo.ts` needs a `SEO['/q/<slug>/']` entry.
- Articles cross-link through the `quizzes: [...]` field in their front matter (`content.config.ts`).

**Tests**
- `scripts/engine-test.mjs` runs before every build and in `npm run test`. Several sections loop over every quiz and make up answer values per group:
  - §2 codec round-trips (uses the radix and `groups.length`);
  - §7 share text;
  - §10 both-ways keying (**would fail** a choice quiz);
  - the §12c loop that checks no foreign code decodes (`encodeFor(q, q.groups.map(()=>50))`);
  - the §14 notes loop.

  These must learn about the third shape.
- New sections to add:
  - add the quiz to the §1b publication-status list;
  - every situation reachable, every answer path giving 1–3 candidates;
  - `lxxToHebrew` consistency;
  - every psalm present in `psalms.json` with the right verse count;
  - ids unique, with a frozen id → psalm map so a live code never changes meaning;
  - junk and foreign codes refused.
- Other test scripts:
  - `seo-test.mjs` runs after the build and checks the built pages and sitemap, so the new `/q/` and `/psalm/` pages must pass it.
  - `seo-plumbing-test.mjs`, `account-test.mjs`, `auth-test.mjs` and `email-test.mjs` are not affected.
  - `switch-test.mjs` does 4 full builds, so it gets slower but needs no changes.
- There is no `astro check` in the scripts, so type mismatches in `.astro` files will **not** fail the build. The new shape's branches have to be found by reading, using the list above.
- `astro.config.mjs` imports the registry when it loads, to leave draft quizzes out of the sitemap. If the quiz ships as `draft`, its `/q/` and `/psalm/` addresses are left out of the sitemap automatically.

## 6. Files a build would touch or add, in order

1. `site/scripts/fetch-psalms.mjs` (new) → `site/src/data/psalms.json` (new, generated, committed).
2. The situation data: `site/src/lib/quizzes/psalm-readings.ts`, or a JSON file under `site/src/data/`. It holds `id, psalm, lxx, section, also, facets` and short copy only; the longer explanations go in a file the browser never loads.
3. `site/src/lib/engine/types.ts`: choice questions, the wider `Sheet`, `ReadingView`, the optional `validate/next/candidates` hooks, and `comparable?`.
4. `site/src/lib/engine/codec.ts`: the id codec (or put it in the strategy).
5. `site/src/lib/strategies/reading.ts` (new): the sieve, specificity, candidates, `lxxToHebrew`, encode/decode, and share text.
6. `site/src/lib/quizzes/<slug>.ts` (new) with `codePrefix: 'PS'`, `outcomePathBase: 'psalm'`, and `status: 'draft'` until the owner has seen it.
7. `site/src/lib/engine/registry.ts`: register it and hand validation to the strategy. `site/src/lib/engine/compare.ts`: refuse the new shape.
8. `site/scripts/engine-test.mjs`: make the generic loops aware of the shape and add the new sections.
9. `site/src/pages/q/[quiz].astro`: the choice runner, adaptive Back, the tie screen, and intro wording and stats. `site/src/components/QuizPreview.astro`: a third version or hidden.
10. `site/src/components/PsalmReading.astro` (new). `site/src/pages/r/[quiz]/[code].astro`: the new branch. `site/src/components/EmailCapture.astro`: branch, or off for this quiz.
11. `site/src/components/ShareBlock.astro`: fix "Share your compass" and the statements count, hide the compare row, and add the card branch.
12. `site/src/pages/psalm/[slug].astro` (new).
13. `site/src/lib/seo.ts`: `SEO` entries and the `/psalm/` branch in `ogImageFor`.
14. `site/src/lib/art.ts`, `site/public/img/<plate>.jpg`, and `site/public/img/CREDITS.md`.
15. `site/src/pages/index.astro` and `styles/pages/home.css`; `pages/quizzes.astro` and `styles/pages/reference.css`; `components/NextUp.astro`; `styles/pages/me.css`; `layouts/Base.astro` (`FOOT_SHORT`).
16. `design/og/cards.mjs`, then run `node design/og/render.mjs site` locally. This writes `site/public/og/*.jpg` and `site/src/data/og-cards.json`.
17. `site/src/pages/method.astro`: one line saying the psalm result is kept on the shelf and, for signed-in users, in the account.
18. The `quizzes:` front matter in related articles (worry, joy, forgiveness).
19. Run `npm run test` in `site/`, then a full build so `seo-test` runs.

## Decisions for the owner

- **Does the result page carry a safety line?** Some of Athanasius's situations are about despair or feeling abandoned by God. A plain line for someone in danger (for example 988 in the US) is his call, not a code choice.
- **Does the shared link carry only the situation, not the answers?** I recommend only the situation, since sharing is voluntary and the answers are personal.