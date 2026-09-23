# Sounds Like Scripture — demo spec

Working title only. "Bible or Not" is someone else's registered mark; never use it in copy, code or file names.

## The game in one paragraph

A line of text appears. It is either a verse from the Bible or a line from somewhere else that
sounds like one: the Apocrypha, 1 Enoch, the Apostolic Fathers, Augustine, a Kempis, Bunyan,
Josephus. The player has seconds to call it. Ten lines a run, a fuse on every line, points for
speed, then a reveal with the exact citation. The owner's two demands drive everything below:
**it must be hard** (no famous misquotes, nothing a regular player learns to get right by rote) and
**it must feel endless** (a pool of roughly a thousand lines, never the same run twice).

## Integrity rules (binding on every script and agent)

1. **No line is ever written, paraphrased, trimmed mid-sentence or "tidied" by a model.** Every
   line in the pool is a verbatim, contiguous excerpt of a downloaded public-domain file. Scripts
   extract; models only choose among extracted lines by id.
2. Allowed normalisation, and nothing else: join hard-wrapped lines, collapse runs of whitespace,
   strip Gutenberg italics underscores (`_word_` becomes `word`), strip footnote markers such as
   `[12]` or `[A]`, straighten nothing, respell nothing. `verify.mjs` applies the same
   normalisation to the raw file and asserts every pooled line is a substring of it.
3. Every line carries a citation a reader can check: book chapter:verse and translation for
   Scripture; work, section, author, date, translator and edition for everything else, plus the
   URL of the exact file it came from.
4. Nothing here is committed or pushed by an agent. No agent touches `site/`, `audit/`, `CLAUDE.md`
   or any file outside `demos/sounds-like-scripture/` and `demos/sounds-like-scripture.html`.

## Why there are two registers

If every Bible line were Jacobean and every other line Victorian prose, players would learn
"thee and thou means Bible" in three runs. So both sides exist in both registers:

| Register | In the Bible | Not in the Bible |
|---|---|---|
| Archaic | KJV | KJV Apocrypha, 1 Enoch (Charles), Confessions (Pusey), Imitation of Christ (Benham), Pilgrim's Progress, Julian of Norwich |
| Modern | World English Bible, British Edition (WEBBE) | WEBBE deuterocanon, Apostolic Fathers (Roberts-Donaldson), City of God (Dods), Josephus (Whiston), Pascal, Boethius, Clement of Alexandria |

The same reasoning removes other tells: see "Tells to remove" below.

## Canon (fairness rule)

The player picks the Bible they read, once: Protestant (66 books), Catholic (73 books) or
Orthodox. Truth is computed per canon. The registries mark each deuterocanonical book with the
canons that include it. Book lists, fixed by this spec:

- **Catholic and Orthodox:** Tobit, Judith, Wisdom of Solomon, Sirach, Baruch, Letter of Jeremiah
  (Baruch 6), 1 Maccabees, 2 Maccabees, and the additions to Daniel (Prayer of Azariah and Song
  of the Three, Susanna, Bel and the Dragon).
- **Orthodox only:** 1 Esdras, Prayer of Manasseh, Psalm 151, 3 Maccabees.
- **Left out of the pool entirely** because their standing is an appendix or varies: 2 Esdras
  (4 Ezra), 4 Maccabees. Also left out: Greek Esther as a whole, and all of Greek Daniel except
  the three additions, because most of their text duplicates canonical Esther and Daniel.
- The Orthodox option prints this note wherever the canon is named: "Orthodox canons vary a
  little from church to church; this follows the books printed in the Greek Orthodox Bible."
- 1 Enoch is "not in the Bible" under all three options, and its reveal always carries the note:
  "Counted as Scripture by the Ethiopian and Eritrean Orthodox Tewahedo churches. Jude 14-15
  quotes it."

Reveal wording for a deuterocanonical line never says "fake" or "not Scripture". It says where
the book is printed: "In Catholic and Orthodox Bibles. Protestant Bibles leave it out or print it
as Apocrypha."

## Files

```
demos/sounds-like-scripture/
  SPEC.md                  this file
  sources-bible.json       registry: KJV, KJV Apocrypha, WEBBE          (agent A verifies)
  sources-prose.json       registry: the eleven prose works             (agent B verifies)
  raw/                     downloaded files, git-ignored, never edited
  scripts/extract-bible.mjs   -> work/cand-bible.json
  scripts/extract-prose.mjs   -> work/cand-prose.json
  scripts/assemble.mjs        -> work/selected.json, work/key.json, work/batch-01..06.txt
  scripts/finalize.mjs        verdicts -> pool.json
  scripts/verify.mjs          pool.json vs raw/, exits non-zero on any failure
  scripts/build-page.mjs      game.src.html + pool.json -> ../sounds-like-scripture.html
  scripts/test-game.mjs       node tests for the pure game logic
  game.src.html            the page, with the pool placeholder
  work/                    intermediate files (kept; verdicts cost tokens)
  pool.json                the shipped pool
demos/sounds-like-scripture.html   built single-file demo (artifact page contract)
```

All scripts: Node 24, ESM, **zero npm dependencies**, paths resolved from `import.meta.url`
(the repo path contains a space). Downloads use `fetch`, cache into `raw/`, and skip files
already present. Zip files may be unpacked by spawning `python -m zipfile -e`. Windows, Git Bash.
Never put backticks inside a double-quoted bash string.

## Candidate record (both extractors)

```json
{ "cid": "kjv:PRO.16.18", "src": "kjv", "kind": "bible", "ref": "Proverbs 16:18",
  "text": "Pride goeth before destruction, and an haughty spirit before a fall.", "words": 12 }
```

- `kind`: `bible` (66-book canon), `deutero` (see Canon), `other`.
- For `deutero`, add `"canons": ["catholic","orthodox"]` or `["orthodox"]`.
- For prose, `ref` is work plus the finest section that parses reliably, in the form a reader
  would cite: `1 Clement 7`, `Confessions, Book X, ch. 27`, `1 Enoch 94:1`,
  `The Imitation of Christ, Book I, ch. 3`, `Antiquities of the Jews, Book IV, ch. 8`.
  If no section parses for a work, cite the work alone rather than guess. Multi-work files
  (the Apostolic Fathers) cite the individual work and set `"work"` to it as well.
- `cid` is stable and unique. Prose cids use a short hash of the text.

### Eligibility (applied by the extractors)

- One unit per candidate: **one whole verse** for Scripture and 1 Enoch where verses parse;
  **one whole sentence** for prose. Never a partial sentence.
- 9 to 34 words. Starts with a capital letter or an opening quote. Ends with `.`, `?` or `!`
  (optionally followed by a closing quote). This removes the "verses end in a colon" tell.
- Skip: front matter, introductions, translator prefaces, footnotes, tables of contents, chapter
  headings and argument summaries, Gutenberg licence text, anything in square brackets, verse
  text containing "Selah", psalm titles (WEBBE verse 1 of many psalms carries the title: skip any
  PSA verse containing "Psalm by", "Chief Musician", "A Song", "Maschil" and similar title text).
- Skip lines with digits, URLs, Greek or Hebrew characters, or more than three capitalised
  name-like tokens after the first word (genealogies, itineraries).
- The Apostolic Fathers volume: take only the translated texts themselves. Leave out the
  introductory notices, the spurious Ignatian letters and the longer recension if the file
  distinguishes them; if it does not distinguish them reliably, leave Ignatius out and say so.

## Tells to remove

- **Small capitals.** KJV and WEBBE print `LORD` and `GOD`. The pool keeps the verbatim text;
  the game displays `LORD` as `Lord` and `GOD` as `God`. /method/#the-game says so (the game's own
  footer did until 2026-09-22, when the owner had it removed as clutter). `verify.mjs` checks
  the verbatim text, not the display text.
- **Scripture quoted inside other works.** `assemble.mjs` drops any `other` candidate that shares
  a five-word shingle (lower-cased, punctuation stripped) with any verse of KJV, the KJV
  Apocrypha or WEBBE. It also drops any `deutero` candidate sharing a five-word shingle with a
  `bible` verse. Over-rejection is fine; there is far more text than we need.
- **Giveaway words in prose.** `assemble.mjs` drops `other` candidates matching a blocklist:
  Scripture(s), Testament, Bible, apostle(s), Paul, Peter, bishop, presbyter, deacon, Christians,
  heretic, heresy, philosoph-, Plato, Socrates, Cicero, Virgil, Rome, Roman(s), Greek(s),
  Manich-, Carthage, Catholic, Trinity, sacrament, monk, reader, Christian (as a Bunyan
  character), Hopeful, Faithful, Pilgrim, Mr., chapter, treatise, and first-person scholarly
  asides ("as we have said", "as I said above"). Curators catch what this misses.
- **Length and punctuation** are already matched by the eligibility rules.

## Sampling for curation (`assemble.mjs`)

Seeded PRNG (mulberry32, seed 20260918) so reruns are identical. 1,800 candidates total:

| Group | Count | Split |
|---|---|---|
| bible | 760 | 380 KJV, 380 WEBBE, no verse reference used in both |
| deutero | 280 | 140 KJV Apocrypha, 140 WEBBE, no reference used in both |
| other | 760 | Apostolic Fathers 110, 1 Enoch 90, Confessions 90, Imitation 90, Josephus 80, City of God 60, Pilgrim's Progress 60, Julian 50, Clement of Alexandria 50, Pascal 40, Boethius 40 |

If a source cannot fill its quota after filtering, take what exists and give the shortfall to the
other sources in the same group, and report it.

Weighting inside a source. Scripture: weight books so wisdom, prophets, epistles and Revelation
dominate and narrative still appears: weight 3 for JOB PSA PRO ECC ISA JER LAM EZE HOS-MAL ROM-JUD
REV; weight 2 for DEU and the Gospels and ACT; weight 1 elsewhere. Prose and deutero: weight 3 for
sentences containing at least two words from a devotional vocabulary (God, Lord, soul, heart,
righteous, wicked, mercy, wisdom, sin, heaven, spirit, truth, holy, glory, peace, judgment, love,
fear, evil, light, darkness, faith, grace, life, death), weight 1 otherwise.

Outputs: `work/selected.json` (full records plus a blind number `n` from 0001 to 1800, shuffled),
`work/key.json` (n to cid), and six blind batch files `work/batch-01.txt` to `batch-06.txt`, 300
lines each, format `n<TAB>display text`. Batch files contain **no source information of any kind**.

## Curation verdicts (blind)

Each curator reads only its batch file and writes `work/verdict-NN.txt`, one line per item:
`n q s g r`

- `q` 1 or 0. 1 means the line stands alone as a meaningful thought, is not a fragment or a list,
  has no dangling "this" or "these things" that needs the previous sentence, and carries no
  giveaway that would hand a casual player the answer.
- `s` 1 to 5. How much it sounds like Scripture, judged on style and content alone.
- `g` B or N. The curator's honest best guess: is this line in the 66-book Protestant Bible?
- `r` 0, 1 or 2. 0: I do not specifically recognise it. 1: I recognise it as a specific verse of
  the 66-book Bible. 2: a famous verse most churchgoers would know.

## Finalize rules (`finalize.mjs`)

- Drop `q=0`. Drop `s=1`.
- Drop any `other` or `deutero` line with `r>=1` (a probable Scripture quotation or parallel).
- Drop any `bible` line with `r=2` (too famous; the owner asked for hard).
- Tier, 3 is hardest. `other`/`deutero`: 3 if `g=B`; 2 if `g=N` and `s>=3`; else 1.
  `bible`: 3 if `g=N`; 2 if `g=B` and `r=0`; 1 if `r=1`.
- A missing or malformed verdict line drops the item and is reported, never guessed.

`pool.json`:
```json
{ "version": 1, "built": "<ISO date passed by flag>", 
  "sources": [ { "id","title","author","date","translator","edition","url","note","kind","register" } ],
  "items": [ { "id","t": "verbatim text","s": <source index>,"ref","k": "b|d|o","c": ["catholic","orthodox"],"tier": 1 } ] }
```
`finalize.mjs` prints counts by kind, tier, register and source, and the Bible share of the pool.

## The page (`game.src.html`)

Single file following the artifact page contract: no doctype, html, head or body tags; a
`<title>Sounds Like Scripture</title>` first; one `<style>`; Google Fonts link for DM Serif
Display, Poppins and Inter with real fallbacks; no other external resource; all JS inline; no
framework. The pool is injected at the literal placeholder
`<script type="application/json" id="pool">/*__POOL__*/</script>`. Until the real pool exists, develop against
`work/fixture-pool.json`, whose texts are obvious placeholders such as "Placeholder line 12".
**Never type a real or invented quotation into the fixture or the page.**

Theme: the settled wiserwalk tokens, copied from `site/src/styles/site.css` (light on bare
`:root`, dark under `@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`). Blue means
"In the Bible" and orange means "Not in the Bible" throughout; neither is the good colour.
Right and wrong are shown with a tick or cross and the words, not with blue and orange.
Panels `--panel` on `--shell` on `--page`, radii 15 to 22px, whisper shadow `--lift`, no borders.

Phone first. One screen, no scrolling during play, `height:100%` on html and body, 16px side
gutters, thumb-reach controls at the bottom, 44px minimum tap targets, safe-area insets on the
bottom bar. Then widen: on desktop the play column stays about 30rem wide and centred.

### Screens

1. **Start.** Title, one sentence ("Ten lines. Some are in the Bible. Some only sound like it.
   You have seconds."), the canon picker as three chips (no default on first visit; the choice is
   remembered), then "Play" and "Today's Challenge". If the URL carries a challenge, a banner replaces
   the sentence: "Someone scored 1,420 on these ten lines." with "Take the challenge".
2. **Play.** Ten progress pips, the score, a fuse bar, the line on a card in the display serif
   (size steps down for long lines so nothing scrolls), and two wide buttons: left "Not in the
   Bible" (orange), right "In the Bible" (blue). Dragging the card left or right past a threshold
   answers the same way, with the card tilting and tinting toward the side. Arrow keys answer on
   desktop.
3. **Reveal**, in place of the buttons and on the same card: tick or cross with "Correct",
   "Wrong" or "Out of time"; the truth sentence; the citation; for prose the author, date and
   translator; the source note when there is one; "Read the source" linking to the file URL;
   points for this line; in a challenge, "Them: correct in 3.5s" or "Them: wrong". A "Next"
   button where the right thumb already is. Space or Enter also advances. The fuse is stopped
   during the reveal.
4. **Result.** Score, correct out of ten, average answer time, personal best, a row of ten
   squares (tick or cross, a bolt on answers under three seconds), in a challenge the two scores
   side by side with no names, "The ones that got you" with full citations, and "What fools you":
   a lifetime tally by source from localStorage ("Sirach 4, 1 Clement 3"). Buttons: "Play again",
   "Copy challenge link", "Copy result". The copied result is title, score, the ten squares as
   emoji, and the link; it never includes a line's text.

### Rules

- Fuse per line: `clamp(5 + 0.35 * words, 8, 16)` seconds. Points: correct scores
  `100 + round(100 * remaining / fuse)` plus a streak bonus of `10 * (streak - 1)` capped at 50.
  Wrong or timed out scores 0 and resets the streak.
- **No `requestAnimationFrame` anywhere** (the owner's preview pane never fires it). Time comes
  from `performance.now()`, expiry from `setTimeout`, the fuse bar from a linear CSS width
  transition whose duration is the fuse. Card drag uses pointer events and direct style writes.
  State must be readable for testing: expose `window.__sls` with the current screen, run, index,
  score and answers.
- A run is drawn by a seeded PRNG (mulberry32). "Play" uses a random seed, "Today's Challenge" uses the
  UTC date as `yyyymmdd`, a challenge uses the seed in the link. The number of lines that are
  "In the Bible" under the chosen canon is drawn from 3 to 7 so it cannot be counted. Draw
  weights: tier 3 weight 4, tier 2 weight 2, tier 1 weight 1. Within a run no two lines share a
  source work, except that Scripture lines need only differ by book.
- "Play" skips lines already seen (ids in localStorage, reset when fewer than 30 per cent remain
  unseen). Daily and challenge runs ignore the seen list so that everyone gets the same ten.
- Challenge link: `#d=` + canon letter (p, c, o) + seed in base36 + `.` + score in base36 + `.` +
  ten characters, each `0` for wrong or timed out, otherwise a base36 digit for the answer time in
  half-second buckets (1 to z). Built from `location.origin + location.pathname`. Decode
  defensively: a malformed hash is ignored.
- Every localStorage read and write in try/catch; the game works with storage blocked.
- Visible focus states, `prefers-reduced-motion` removes the tilt and flip but keeps the fuse
  (it is information), buttons are real `<button>`s with stable ids.
- No footer (removed on the owner's word, 2026-09-22: "needless clutter"). The editions and the
  small-capitals rule are stated on /method/#the-game; the Orthodox canon note still prints
  under the canon choice when that canon is chosen.

Pure logic (PRNG, draw, truth-under-canon, fuse, scoring, link encode and decode, display
normalisation) lives in one clearly marked block of `game.src.html` between the comment lines
`/*__LOGIC_START__*/` and `/*__LOGIC_END__*/`, with no DOM access, so `test-game.mjs` can
extract and test it under Node.
