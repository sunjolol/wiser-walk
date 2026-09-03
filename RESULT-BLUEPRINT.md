# The result system

One result system, two result shapes. This is the document that has to make the next quiz a
data file rather than a redesign.

Everything marked **BUILT** is in the tree and covered by tests. Everything marked
**DECIDED** is settled but unwritten. Everything marked **OPEN** still needs a decision.

---

## 1. The central distinction

**The Theology Compass is BIPOLAR.** Six axes, each running between two *named* poles, with
a middle band in which the instrument deliberately names neither. A score is a POSITION on a
line whose two ends both mean something.

**Everything else planned is UNIPOLAR.** Spiritual gifts, the seven deadly sins,
who-you-are-like-in-the-Bible: categories ranked by strength. A score is a MAGNITUDE. There
are no poles, no centre, and no no-claim band, because there is no line with two ends.

Almost every Compass design decision is meaningless for a unipolar quiz. The failure to
guard against is a **bipolar chassis leak**: a pole, a centre, a spine, or a "names no
position" band appearing in unipolar output, or a ranking idiom imposed on the Compass.
It is the same class of error as labelling one pole of two, and it is easy to make by
accident, because both strategies happen to produce a 0..100 number per group.

> **The trap, stated once.** `category.score()` maps the answer sum onto 0..100 exactly as
> `bipolar.score()` does. So **50 means "you agreed as much as you disagreed"**, not "half".
> Any code that treats a unipolar 0..100 as a magnitude from zero will tell a reader who
> answered neutrally that they are halfway to every vice on the list. This bit us twice
> (the bars, and the share card) and would have bitten a third time in the OG image.

---

## 2. The contract — BUILT

`site/src/lib/engine/types.ts`. A discriminated union, tagged at the top level.

```ts
type ResultView = BipolarView | UnipolarView;
```

Shape is **declared**, never inferred. The previous shape had `left?`/`right?` as optional
fields and the page branched on whether `left` happened to be truthy — a presence check
standing in for a shape declaration, which is exactly how unipolar data ends up wearing a
bipolar chassis.

| | `BipolarView` | `UnipolarView` |
|---|---|---|
| `shape` | `'bipolar'` | `'unipolar'` |
| `state` | `near` / `tie` / `loose` / `central` | `clear` / `tie` / `flat` |
| rows | `BipolarRow[]`, in **quiz order** | `UnipolarRow[]`, in quiz order, carrying `rank` |
| row fields | `left`, `right` (**required**), `band`, `lean`, `noClaim`, `step`, `steps` | `rank`, `below`, `strength` |
| band range | `noClaimRange` (prose), `noClaimSpan` (geometry) | *absent* |

Three invariants, all enforced by `registry.ts` at module load — so a violation fails the
build rather than shipping:

1. A bipolar group must have **both** pole names and exactly five band adjectives.
2. A unipolar group must have **none** of `left`, `right`, `bands`.
3. Group slugs must exist, be URL-safe, and be unique; outcome slugs must not be claimed by
   two quizzes (they share one site-wide `/tradition/<slug>/` namespace).

`ScoringStrategy.shape` declares which side a strategy is on, and validation checks the data
against that declaration rather than against a comment.

### `state` is what the renderer switches on

Never re-derive an edge condition in the display layer. `state` is computed where the
audited thresholds live, and the page reads it. Re-deriving it "happens to agree today" and
silently stops agreeing the moment a threshold moves.

### Adding a third shape

Similarity-to-a-figure (who-in-the-Bible) and right/wrong (Bible knowledge) each add one
member to the union and one branch in the renderer. **No existing branch changes.** That is
the test of whether the union is right. Note that neither can reuse `Match.match`, whose
denominator is the largest distance between two *Compass traditions*.

---

## 3. Hero — BUILT

### Bipolar: `RailStack.astro`

There is **no separate compass wheel**. The hero visual and the axis rows are ONE component:
six full-width diverging rails on a shared centre spine. A circle cannot fit twelve pole
labels, so something always gets dropped — which is how the previous version shipped a named
pole facing an anonymous blank sector. Stacked rails make that structurally impossible.

- **Both pole names print on every rail, unconditionally**, from required type fields.
- Both pole names render at the **same weight and the same colour**. Asymmetric contrast
  between two poles encodes a pole by weight, which is the same failure as encoding one by
  omission. (`--ink-mute` on `--panel` measures 3.35:1 and fails AA at this size; both spans
  use `--ink-soft` at 5.49:1.)
- Pole names are **real text**, not an `aria-label`. Text in an aria-label cannot be
  selected, translated, searched, or found by a reader who zooms.
- Sentence case on a phone; uppercase from `48rem`. The data already stores
  "Bible & tradition" in sentence case, and 11px uppercase at wide tracking is the least
  legible combination on the page.
- **Layered opacity, never a flat saturated fill**: a `--tint-op: .35` tint diverging from
  the centre spine, under a 100% solid knob with a card-coloured ring. This is the treatment
  already shipped in `theology-compass.html` (`.fill{opacity:.35}` + solid `.marker`).
- **The no-claim band is a visible hatched zone**, so a centrist sees *why* nothing was
  named instead of getting an empty state.
- A rail inside the zone draws **no directional tint**. "You lean this way" and "this names
  no position" cannot both be true on one row.
- Inside the zone the reading is the audited **band adjective** ("balanced on grace"),
  substituted for the lean — not prefixed to it. A prefix still prints a named pole beside
  "no position named", which relocates the contradiction rather than removing it.

**Geometry is derived, never typed.** The zone comes from the reachable steps `band()`
actually puts in the middle band, snapped half a step outward:

| radix | items/axis | reachable scores | middle-band steps | zone drawn |
|---|---|---|---|---|
| 13 | 3 | 0 8 17 25 33 42 50 58 67 75 83 92 100 | 5, 6, 7 | 37.5% – 62.5% |
| 25 | 6 | 25 values | derived | derived |

Drawing the zone at the *score* bounds (41–59) put a score-42 knob a pixel inside the edge
of the zone it belongs to, which reads as "just outside". The position scale is also inset by
half a knob at each end, so a score of 0 or 100 puts the knob's edge on the rail's edge
rather than hanging half of it into the card padding.

*Verified in the browser: the set of knobs drawn inside the zone is exactly the set the
scoring rule flags, with 23px symmetric clearance.*

### Unipolar: `CategoryStack.astro`

Deliberately **not** the rail component with the poles hidden.

- No spine, no zone, no knob. A knob is a position mark between two ends; a ranking has no
  two ends.
- Rows render in **rank order** (the ranking is the result), where rails render in **quiz
  order** (the axis order is fixed and sorting them would make them read as a ranking).
- Bars fill from zero to the **pull above no-net-agreement**, not to the raw score — the
  same number the words say, so the two cannot disagree.
- **Nothing is drawn at 50.** Seven hairlines at one x-position stack into a shared centre
  spine, which is the bipolar hero in disguise.
- A `below` state marks active disagreement, which is a different answer from "neither
  pulled you" and used to be collapsed into it.
- **No percentage and no 0..100 number** appears in unipolar prose or aria-labels. At radix
  9 the values are 12.5 points apart, so "63%" claims precision the instrument cannot
  express and invites "I am 63% Wrath". Strength is words cut on reachable steps.

**OPEN:** a valence flag. Seven deadly sins is a quiz where leading is bad news, spiritual
gifts one where it is good news, who-in-the-Bible neither. One hero currently serves all
three by staying descriptive. If that proves too flat, the flag goes on the quiz, not the
strategy — two quizzes share `category` and would want different values.

**OPEN:** what happens past ~10 categories. Spiritual-gift lists run to 20+. Seven fits on a
phone; twenty will need a top-N with the rest behind a disclosure, and the rule for N.

---

## 4. Per-item detail — BUILT

Axis prose is **truncated on the result page**; the full text lives on the indexable
`/axis/[quiz]/[slug]/` page. That fixes the wall-of-text and the SEO funnel in one move.

- The truncation rule is **the first sentence, whole, never mid-sentence**. It is
  deterministic, symmetric between the two poles, needs no viewport knowledge, and —
  decisively — the splitter's anchor *is* the thesis sentence, so the first sentence is the
  pole's own claim rather than an arbitrary prefix. A clipped claim about someone else's
  belief is worse than a short one.
- Disclosures are `<details>`, one per axis, ordered by how hard the reader leaned, with the
  strongest open on load. An axis in the no-claim band still gets a panel; it sorts last.
  Suppressing it would leave a centrist with nothing, which is what the visible zone exists
  to prevent.
- Links are built with `groupHref(quiz, group)` from the registry. **Never build one by
  hand.** Axis `key` and `slug` differ on two of six (`spirit`→`gifts`,
  `tradition`→`authority`), so a URL built from `key` 404s.

---

## 5. Deep content

### Bipolar: two mirrored pole panels — BUILT

Fed by `design/tools/split-summaries.mjs`, which splits each audited summary on an explicit
per-axis anchor and then **verifies every sentence is used exactly once**, refusing rather
than guessing. `site/scripts/build-data.mjs` runs it at data-build time and bakes
`summaryParts` into the committed `compass.json`, so nothing in the request path or the
Vercel build reaches outside `site/`.

Four buckets, and what each one may be used for:

| bucket | rule |
|---|---|
| `left` / `right` | each pole's case, in its own holders' words |
| `between` | genuine middle ground — **only where the prose itself identifies it** |
| `caution` | methodology. Styled as an aside; must never read as one pole's argument |

**A `between` block that opens with a bare pronoun now fails the split.** Its subject is the
previous sentence, and that sentence belongs to a pole. This was not hypothetical: Gifts'
"*They* affirm that God still heals and answers prayer…" is the cessationists' own
qualification of their own position, and filing it as neutral took the most sympathetic
sentence in the cessationist case out of the cessationist case. Kingdom's block is kept,
because progressive dispensationalism genuinely mediates — it holds "the kingdom has already
begun" together with the Israel/church distinction — and folding that into the right pole
would attribute a mediating qualification to the pole it mediates between.

**Scripture passages are NOT assigned to a pole.** Romans 9 and 1 Timothy 2:3–4 are claimed
by both camps; splitting them would be invented editorial content and an audit violation.
They sit under a heading that says so: *"Passages both sides argue from"* — worded
identically on the result page and the axis page.

**Further reading IS pole-split**, because the data is: `readMore` is `{left, right}` and
*The Bondage of the Will* argues one side while Arminius argues the other. Flattening the
lists would file a book under the position its author wrote against.

`history` is a **shared chronology**, unannotated. Deciding which pole each entry belongs to
would be inference, and inference is invention.

Splits are lopsided (Grace 99w/81w) and that is fine. Audited prose is never padded or
trimmed to make two columns match.

### Unipolar deep content — DECIDED, unbuilt

A category has no opposite, so **every device that encodes opposition must be absent rather
than degraded** — not one pole panel, not a single-column version of a two-column layout.

Optional fields a unipolar quiz may supply, each of which must degrade to nothing:

| field | for | note |
|---|---|---|
| `summary` | what this is | already on `QuizGroup` |
| `practice` | what it looks like day to day | |
| `remedy` | the classical contrary virtue | **requires sourcing before build** |
| `passages` | rendered under "Passages", not "both sides" | |
| `readMore` | flat `string[]`, not pole-split | |

The fairness rule binds here too: a deadly-sins quiz that invents a remedy is the same
violation as inventing a theological position. The seven contrary virtues have a real
textual history, but nothing goes in the data until it is traced to a source.

Tone: a deadly-sins reader is being told something unflattering. It has to land as
self-knowledge rather than condemnation, without being softened into meaninglessness.

---

## 6. Share and OG

### Text card — BUILT

Two formats, and the difference is the point:

- **Bipolar** prints an eleven-slot bar with **one filled slot**: a POSITION between the two
  named poles. Eleven slots is an audited decision (changelog item 29).
- **Unipolar** prints a bar filled from the left: a MAGNITUDE. It fills from the *pull*, not
  the raw score — reusing the Compass's `round(v/10)` filled six of eleven cells for a
  neutral answer and told the reader they were somewhat envious for answering neither way.

Tests assert both directions so nobody "unifies" them later.

The card is **displayed split and copied whole**: only the bar block refuses to wrap, because
its columns line up and that alignment is the point. As one `<pre>` it showed about 42
characters on a 360px phone against a 164-character hedge line, so the fairness caveat was
the part you had to scroll sideways to find.

**Known limitation, not fixed:** at eleven slots, scores 25 and 33 both land on slot 3, and
75 and 83 both on slot 8 — two different results render identically. Thirteen slots would be
lossless. The audit specified eleven for a stated reason, and amending an audited artefact
through a design pass is exactly the unilateral edit the audit exists to prevent. **This is
the owner's call.**

### Context-aware CTA — BUILT

The same URL is both "my result" and "a friend's result". The **server renders the visitor's
copy**, and the page upgrades itself only when it can prove otherwise, from a tab-scoped
`sessionStorage` note the quiz runner leaves on the way through. Getting it wrong for a
visitor is the costlier error, and the person who just took the quiz necessarily had
JavaScript on, so the upgrade reaches them.

### OG image — OPEN

1200×630, on a route that is already `prerender = false`. `design/tools/gen-textures.mjs` is
a reseedable procedural generator kept for exactly this. Requirements, in order:

1. Legible as a ~200px chat thumbnail. Six rails at 630px is plausible; twenty categories is
   not — needs a stated rule.
2. Must not reuse the bipolar row geometry for unipolar rows.
3. `noindex, follow` does not affect OG previews: a crawler that is allowed to fetch the page
   reads the OG tags regardless. (This is also why `Disallow: /r/` had to come out of
   robots.txt.)
4. A fallback image when generation fails, rather than a broken preview.

---

## 7. Edge cases — BUILT, with tests

### Bipolar

| state | trigger | headline | outcome list |
|---|---|---|---|
| `near` | nearest within `hedgeUnits` (45) | band adjectives of the three strongest | "Closest on the map" + scope note |
| `tie` | top two within `tieUnits` (10) | as above | both named jointly |
| `loose` | nearest beyond 45 units | as above | "Loose neighbours, not matches" |
| `central` | every axis within `centerUnits` (10) of 50 | "Near the center on every axis" | **behind a disclosure** |

The `central` treatment is the one worth explaining. The page says no tradition is named; it
used to then name five with percentages, at exactly the moment a discernment-minded reader
is deciding whether the instrument is honest — with the nearest 67 units away against a
threshold of 45. The numbers are still reachable, labelled as distances rather than findings.
The audit suppressed the *claim*, not the arithmetic.

Verified not reachable, do not "fix": `band()` and `nearestState()` cannot contradict each
other, because at both radix 13 and radix 25 the reachable scores skip 40 and 60.

### Unipolar

| state | trigger |
|---|---|
| `clear` | one category above the naming floor and ahead of the rest |
| `tie` | top two within `tieSteps` reachable steps (0 = exact equality) |
| `flat` | **nothing cleared the naming floor above no-net-agreement** |

`flat`, not `central`. A ranking has no centre to sit in the middle of.

The `flat` test must ask whether anything rose *above* the floor, never how far each score
sits from 50 in either direction. Asking the bipolar question produced a real failure: a
sheet disowning all seven vices scored 0 across the board and was headlined "Envy and
gluttony" — the alphabetically first two of seven tied at the bottom. The most emphatic
denial the instrument accepts came back as an accusation.

Config keys carry their unit, because the same word meant two things: bipolar `tieUnits` is
Euclidean distance out of 198.1; unipolar is now `tieSteps` (integer steps) and
`namingFloor` (points above neutral).

### Both shapes

| case | behaviour |
|---|---|
| garbage code | 404 page explaining that codes are exact and nothing is stored |
| a code valid for quiz A under quiz B's slug | 404. Codes carry a per-quiz prefix — see below |
| draft quiz | `noindex`, draft note above the result |
| JavaScript off | page renders fully (server-side); copy button and CTA upgrade degrade; the email form falls back to a real form POST with a redirect |

**Codes are bound to their quiz by a prefix.** Without one, two quizzes whose
`radix^slots` ranges overlap accept each other's codes: the Compass is 13^6 = 4,826,809 and
the seven deadly sins 9^7 = 4,782,969, both six base-36 characters, so a Compass code pasted
under the sins slug decoded to a complete, plausible, entirely fabricated result. A wrong
URL must 404, not invent an answer.

The **Compass takes no prefix**, because its permalinks are already live and a result link
is the only copy of a result that exists — its codes are byte-identical to before. Every
other quiz takes one (`S02OTJ4`), and the registry enforces that **at most one quiz may go
without**, so the ambiguity cannot come back when the third quiz is added.

---

## 8. The platform, in outline

### Routes

| route | status | notes |
|---|---|---|
| `/` | built | hub: quizzes then articles |
| `/quizzes/` | built | one card contract for both shapes |
| `/q/[quiz]/` | built | the runner |
| `/r/[quiz]/[code]/` | built | on-demand, `noindex, follow` |
| `/axis/[quiz]/[slug]/` | built | the indexable long-form page |
| `/tradition/[slug]/` | built | site-wide namespace; validated against collision |
| `/articles/`, `/articles/[slug]/` | built | |
| `/method/`, `/about/` | built | |
| `/api/subscribe` | built | the only route that talks outside the browser |
| OG image route | OPEN | |

**OPEN — the route noun.** `/axis/seven-deadly-sins/pride/` calls a sin an axis. The word is
bipolar. Renaming costs the Compass's live indexed axis pages, so it is a decision to take
deliberately or not at all — but it gets more expensive with every quiz added.

### Reader journey

| hop | what the reader wants | the one thing the page must do |
|---|---|---|
| hub → quiz | "is this worth three minutes" | say how long, and that nothing is collected |
| quiz → result | "what am I" | answer it in the headline, above the fold |
| result → axis page | "why is this even a question" | one link per axis, from truncated prose |
| axis page → article | "what do I do with this" | cross-link, both directions |
| article → quiz | "where do I stand on this" | the article names the quiz |
| result → another quiz | "that was fun" | the hub, not a dead end |

The result page is where every reader lands and is the page most at risk of being a dead
end. It currently offers: six axis links, five tradition links, up to three articles, a
share card and the follow-up series.

### Articles — partly built

Frontmatter already carries `quizzes: string[]`, and the result page surfaces up to three
matching articles. **OPEN:** the reverse index. Choosing which articles a result surfaces by
*axis* or by *outcome* rather than by quiz would be much better targeting, but it must not
hard-wire the recommendation layer to one strategy — importing `band()` from `bipolar` into
a shared recommender is the same bespoke-one-off the platform exists to avoid.

### Bible study tools — OPEN, outline only

Compatible with "nothing leaves your browser" and no backend: reading plans, a memorisation
drill, passage-comparison side-by-sides, a cross-reference explorer over a bundled dataset.
Needing a backend: anything with saved progress across devices.

**Flag before building any of it:** Bible text licensing. Public-domain translations (KJV,
ASV, WEB) can be bundled outright; most modern translations cannot, and several have quota
limits even via API. Nothing here should assert specific licence terms until they are read.

---

## 9. Adding a quiz

1. Write `site/src/lib/quizzes/<slug>.ts` — items, groups, outcomes, config, copy.
2. Pick a strategy: `bipolar` (two named poles per group) or `category` (ranked). The
   strategy declares the shape; the registry checks your data against it.
3. Add one import and one array entry in `registry.ts`.
4. `npm run test` in `site/`.

Every route, the codec, the result page and the share card pick it up from the registry.
If you find yourself writing a new component, stop: either the quiz is a third shape (add a
union member and a branch), or something that should be data has been hard-coded.

### Rules that outrank the design

- Real data only. Never invent a quotation, date, position, or connection.
- Both poles described in words their holders would accept. No band adjective may name a
  rival tradition, flatter, or belittle.
- Statements under 22 words, one claim each; every group needs both `+1` and `-1` items.
- `node audit/selftest.js` **and** `npm run test` must pass before anything ships.
