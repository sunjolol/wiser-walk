# Who Said It? — game spec

A line of speech from the Bible appears. Four names. Tap who said it, against a clock. The traps
are the point: Job's friends sound like God, Satan quotes a Psalm, and the Pharisees sometimes
sound like the disciples. The owner's standing demands for games apply: **hard**, **endless
variety**, **timed**, and a result about the player.

Read `demos/sounds-like-scripture/SPEC.md` first. This game is its sibling: same integrity rules,
same shell (start, play, reveal, result, seeded runs, daily run, challenge link, storage in
try/catch, no `requestAnimationFrame`, `window.__wsi` state for tests), same artifact page contract,
same Riche design language as the live `demos/sounds-like-scripture/game.src.html`. Copy that
file's structure and restyle nothing that already works; change the play interaction and the data.

## Integrity rules (binding)

1. **No line is ever typed, trimmed mid-sentence or tidied by a model.** Every line is a verbatim
   excerpt of a public-domain Bible text on disk. Scripts extract; models only choose among
   extracted lines by number.
2. **Who spoke is never decided by a model either.** Speaker labels come from Glyssen's
   `CharacterVerse.txt` (SIL and Faith Comes By Hearing, MIT licence, in `raw/`). A line is used
   only when that file names exactly one speaking character for the verse.
3. The speaker data is credited ("Glyssen character data, published by SIL and Faith Comes By
   Hearing under the MIT licence") with a correction route, because a label can be wrong and we
   did not make them. Since 2026-09-22 that credit lives on /method/#the-game, not in a footer on
   the game (the owner had the footer removed as clutter). Keep it there.
4. Sixty-six book canon only (stated on /method/).
5. No agent commits, pushes, installs packages, or touches files outside `demos/who-said-it/`,
   `demos/who-said-it.html`, and the site files this spec names.

## Texts

Reuse `demos/sounds-like-scripture/work/verses-all.json` (every verse of KJV and WEBBE, already
parsed and verified; `src` is `kjv` or `webbe`). If it is missing, rebuild it with
`node demos/sounds-like-scripture/scripts/extract-bible.mjs`.

Both registers again, so that modern English does not mean anything:

- **WEBBE** has quotation marks. A verse whose `Quote Position` is `EntireVerse`, or which the
  quotation marks show to be wholly inside one speech, gives the whole verse. A verse with exactly
  one top-level quoted span gives that span, verbatim, between the marks.
- **KJV** has no quotation marks. Use only verses the speaker file marks `EntireVerse`.

## Eligibility (extractor)

- Quote types `Normal`, `Dialogue`, `Implicit` only. Never `Indirect`, `Potential`, `Rare`,
  `Quotation`, `Needs Review`, any `narrator-…`, or the pseudo-character `scripture`.
- Exactly one eligible character for the verse. If two characters speak in a verse, skip it.
- 8 to 34 words, ends in `.`, `?` or `!`, whole sentence or sentences, no digits.
- The line must not contain the speaker's own name or alias, or "I, <name>".
- Display only: enclosing quotation marks are dropped, LORD and GOD print as Lord and God, quote
  style is unified, and pronouns for God, Jesus and the Holy Spirit are capitalised (the owner's
  rule, 2026-09-23; `capitals.json`, guarded by `scripts/capitals.mjs`, as in the sibling).
  `verify.mjs` checks the verbatim text against the verse.

## Speakers

- `speakers.json`: every character with at least 6 eligible lines becomes answerable. Each gets a
  display name by a deterministic cleaning rule (drop parentheticals and trailing descriptors:
  "Peter (Simon)" becomes "Peter", "Solomon, king" becomes "Solomon", "Hezekiah, king of Judah"
  becomes "Hezekiah") plus a small override table for the cases the rule gets wrong. Print the
  whole table in the report so the lead can review it. Groups are allowed ("The Pharisees",
  "The disciples", "The crowd") and must read as groups.
- **Fairness conflicts.** Some wrong answers would not be wrong. Build a `conflicts` map and never
  offer a conflicting name beside the right one: the divine family (God, Jesus, the Holy Spirit,
  the angel of the LORD and any other divine voice) against each other; a group against its own
  members (the disciples against Peter, John, James, Thomas, Philip, Andrew, Judas; the apostles
  likewise; Job's friends as a group against Eliphaz, Bildad, Zophar); two ids that are the same
  person at different ages. Job's three friends against each other, and against God and Job, are
  NOT conflicts: that is the best trap in the game.
- Distractors are drawn at run time: three other speakers, distinct display names, none in
  conflict, preferring speakers from the same book, then the same Testament, so the choice is
  between people who could plausibly have been in the room.

## Sampling and blind curation

`assemble.mjs`: seeded (mulberry32, 20260921), 1,500 candidates, half KJV and half WEBBE with no
verse used twice, no speaker above 90 lines, every answerable speaker represented where it has
lines. Five blind batches of 300, `n<TAB>display text`, no speaker and no reference.

Curators write `n q s e` per line and, separately, their guess:
- `q` 1 or 0: stands alone as speech, meaningful, not a fragment, and does not give the speaker
  away by what it says ("I am Joseph your brother", a king naming his own throne).
- `e` 1 or 0: a regular Bible reader would name the speaker in two seconds.
- `guess`: the curator's best guess at the speaker, free text.
Finalize: drop `q=0`; drop `e=1` when the guess was right; tier 3 when the guess was wrong,
tier 2 otherwise. A missing or malformed verdict drops the line.

## The game

- Ten lines a run. The line sits on the card; under it a two-by-two grid of four names as large
  tap targets in thumb reach (one column if a name is long). Keys 1 to 4 on desktop.
- Fuse `clamp(7 + 0.35 * words, 10, 18)` seconds. Scoring as in Sounds Like Scripture.
- Reveal: right or wrong, the speaker, the reference, the translation, and who the player picked.
- Result: score, right out of ten, average time, best; the missed lines with citations; and
  **"who you mix up"**: a lifetime tally of confusion pairs from localStorage ("You took Eliphaz
  for God 3 times"). That is the personal result. Challenge link prefix `#w=`.
- Pool shape mirrors the sibling: `{version, built, speakers:[{id,name,testament,books}],
  conflicts:{id:[ids]}, items:[{id,t,sp,ref,tr,tier,book}]}`.

## The card the site draws

`build-page.mjs` writes `cover` and `coverNames` into the site metadata: one real line and the
four real names under it, chosen by the rules above with the shuffle replaced by speaker id so
nothing moves between builds. The names are sorted alphabetically and the metadata never records
which of them spoke, so neither the file nor the order can hand anyone an answer. It shows the
first screen of the game and nothing the first screen does not. The line is picked from the
hardest tier, from a speaker with a plain personal name, near seventy-eight characters, and only
where three distractors exist; a fixture pool writes neither field, so a placeholder can never
print as a real line.

## Files

```
demos/who-said-it/  SPEC.md  raw/  speakers.json  pool.json  capitals.json  game.src.html
  scripts/ extract.mjs assemble.mjs finalize.mjs verify.mjs build-page.mjs test-game.mjs capitals.mjs
  work/    candidates.json selected.json key.json batch-0N.txt verdict-0N.txt fixture-pool.json
demos/who-said-it.html                       built standalone demo
site/src/games/who-said-it.html + .meta.json generated but committed, written by build-page.mjs
site/src/pages/play/who-said-it.astro        copy the sibling route; same head, same swaps
site/src/lib/games.ts                        one new entry
```
`raw/` is git-ignored except the two Glyssen files and their licence, which are small and are the
evidence for every label.
