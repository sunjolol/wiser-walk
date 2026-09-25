# Small text across wiserwalk.com: the two-size audit

Read-only audit of every font-size under .75rem (or 12px), including `font:` shorthands and clamp() maxima, in
`site/src/styles/*.css`, `site/src/styles/pages/*.css`, every `<style>` block in `site/src/components`, `site/src/pages/**`
and `site/src/layouts`, and inline style attributes (there are none with small sizes). Generated games are listed apart at
the end. Every rule was traced to the markup that uses it; samples are real strings, taken from the live pages
(fetched read-only) or the source data.

**The rule applied** (the owner, 2026-09-24): LABEL = `--fs-label` .7rem at `--fw-label` 600, text read on its own (a field
name, the label heading a box or card, an author or source line, a citation). TAG = `--fs-tag` .6rem, weight unchanged,
text riding on something bigger (a chip or pill, a date beside a heading, the ends of a scale, a sub-label over chips).
Floor .6rem except inside a drawing. (1rem is 16px here, so .6rem = 9.6px and .7rem = 11.2px; body text is 15px.) Buttons keep their sizes. Nothing already above .7rem is shrunk; nothing above ~.74rem
is touched; tags between .6 and .69 come down only where they clearly are tags; when unsure, KEEP.

**Calibration used**, from his hand-set list on the mock-up: labels `.facts dt`, `.read .by`, `.cite`, `.qcard-k`,
`.churches b`, `.lastwords .k`, `.myth-t b`, `.myth-k`, `.feast-col h4`, `.feasts-h p`, `.path-k`, `.answer h2`,
`.portrait figcaption b`, `.st-topic`, `.later b`, `.qf-k`, `.fgroup-t`; tags `.scale-ends`, `.rz-when`, `.mo-when`,
`.stat-chip`, `.gchips-k`, `.tchip`, `.navmenu-tag`; kept `.temper-k`, `.sources h3`. Still open with him: `.pcard-d`,
`.gchips li`, `.stat-src`, `.frow-l`. The mock-up also kept `.band-meta` (.66) and `.foot-bar p` (.62) as they were.

**Work in progress while this ran.** The working tree changed during the audit (the Saints port, uncommitted): `kit.css` now holds the three
tokens and `.navmenu-tag` already uses `var(--fs-tag)` (uncommitted), and `styles/pages/saints.css` plus `pages/saints/*`
are new and uncommitted. Line numbers are as of the moment the JSON was written; kit.css and saints.css may have moved since.

## Counts

| Class | Rules | Meaning |
|---|---|---|
| LABEL | 63 | becomes `var(--fs-label)`/`var(--fw-label)` (59 grow in size; 4 are already .7rem and change weight only) |
| TAG | 41 | becomes `var(--fs-tag)` (28 change visibly; 13 are already .6rem, a token swap, or already done) |
| BUTTON | 34 | keep: a control keeps its own size |
| DRAWING | 18 | keep: text inside an instrument or a drawing (may sit under .6) |
| KEEP | 88 | keep, each with a reason (above .7rem, a sentence, a marker, the mock-up's own value, or a dead rule) |
| UNSURE | 15 | needs his word; 6 plain questions below |
| **Total** | **259** | |

## LABEL changes (63)

Each becomes `font-size: var(--fs-label); font-weight: var(--fw-label)`.

| Where | Selector | Now | Change | Sample | Layout risk at 390 | Check |
|---|---|---|---|---|---|---|
| components/OutcomeIndex.astro:75 | `.oidx-say .oidx-hint` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Open any of them to read more. / Or see all 18 as one table. | low: may wrap one more word at 390 | /q/theology-compass/ |
| components/PsalmIndex.astro:71 | `.pidx-say .pidx-hint` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Open a group, then choose a psalm. / Or read the whole guide. | low | /q/which-psalm/ |
| components/SaveResult.astro:239 | `.save-or` | .64rem / 700 | .64rem/700 -> var(--fs-label)/var(--fw-label) | Or start your free profile now | low: one line at 390 (about 30 characters) | /r/theology-compass/<code> (signed out) |
| pages/data/theology-compass.astro:140 | `.ds-table thead th` | .7rem / 700 (th default) | .7rem/700 (th default) -> var(--fs-label)/var(--fw-label): size unchanged, weight 700 -> 600 | Tradition / Grace / Table | none | /data/theology-compass/ |
| styles/kit.css:473 | `.sect-kicker` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Three kinds of thing, one idea / Argued from by both sides, assigned to neither / Alongside this quiz | medium: long kickers on axis pages wrap to two lines at 390 (e.g. "Argued from by both sides, assigned to neither") | /axis/theology-compass/grace/, /about/, /compare/baptist-vs-catholic/, /q/theology-compass/ (foot) |
| styles/kit.css:591 | `.ccard-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Your turn / The flagship | low | /compare/, /tradition/lutheran-confessional/ |
| styles/kit.css:631 | `.feature-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | The record, drawn / One axis, everybody on it / In the Bible's own words | low | /figure/moses/, /c/theology-compass/<a>.<b> |
| styles/kit.css:661 | `.spec dt` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Quizzes / Traditions on the map / The writing / Each number | low: dt is flex none; a long dt pushes the value, check the /about/ lists at 390 | /about/ |
| styles/pages/account.css:641 | `.ac-count` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | 7 of 9 done / Checking… | none | /account/setup/ |
| styles/pages/compare.css:101 | `.cmpx-axis-name` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Authority / Table / Worship | low: the row already wraps | /compare/baptist-vs-catholic/ |
| styles/pages/compare.css:150 | `.cmpx-plain span` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | In plain words | none | /compare/baptist-vs-catholic/ |
| styles/pages/compare.css:217 | `.cmpx-fact-label` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Did you know? | none | /compare/baptist-vs-catholic/ |
| styles/pages/early-christian.css:107 | `.ecl-on` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | On laughter / On anger / On saying less | low | /early-christian/augustine-of-hippo/, /early-church-on/laughter/ |
| styles/pages/early-christian.css:189 | `.ecq-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | The statement in the quiz | none | /early-church-on/laughter/ |
| styles/pages/kindred.css:40 | `.kr-kicker` | .68rem / 600 | .68rem/600 -> var(--fs-label)/var(--fw-label) | Your kindred spirit / Your sparring partner | none | /r/which-early-christian/<code> |
| styles/pages/kindred.css:90 | `.kr-label` | .66rem / 700 | .66rem/700 -> var(--fs-label)/var(--fw-label) | Also close / Face to face on laughter / Everyone, from nearest to farthest | low | /r/which-early-christian/<code> |
| styles/pages/kindred.css:102 | `.kr-on` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | On philosophy | none | /r/which-early-christian/<code> |
| styles/pages/kindred.css:117 | `.kr-src` | .62rem / 600 | .62rem/600 -> var(--fs-label)/var(--fw-label) | City of God / On record in On the Catechising of the Uninstructed. | low: long sources wrap one more line | /r/which-early-christian/<code> |
| styles/pages/me.css:195 | `.mroom.is-taken h2` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Theology Compass / Which early Christian thinks like you? | medium: long quiz names (uppercase, .16em) go to two lines on a 390 card | /me/ at 390 with several finished quizzes |
| styles/pages/personality-run.css:305 | `.pqr-lockline` | .64rem (font shorthand) / 600 | .64rem/600 -> var(--fs-label)/var(--fw-label) | Private | none | /q/personality/ (a private item) |
| styles/pages/personality-type.css:203 | `.pt-th, .pt-rh` | .64rem (font shorthand) / 700 | split the rule: .pt-th .64rem/700 -> var(--fs-label)/var(--fw-label); .pt-rh keeps 700 and its own size | Quiet mind / Restless mind | none | /personality-type/ |
| styles/pages/personality.css:76 | `.pq-kicker` | .66rem / 600 | .66rem/600 -> var(--fs-label)/var(--fw-label) | Your type / Your opposite, and why you need them / Most like you / Its counterfeit | low | /r/personality/<code> |
| styles/pages/personality.css:120 | `.pq-hero-label` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Christian Personality Test | medium: at .7rem with .14em tracking it is about 190px beside the logo; at 390 it will go to two balanced lines | /r/personality/<code> at 390 |
| styles/pages/personality.css:286 | `.pq-src` | .7rem (font shorthand) / 500 | .7rem/500 -> var(--fs-label)/var(--fw-label): size unchanged, weight 500 -> 600 | Athanasius, Life of Antony / Bede, Life of St Cuthbert | none | /r/personality/<code>, /personality-type/hearth/ |
| styles/pages/personality.css:330 | `.pq-opp p.pq-opp-src` | .7rem (font shorthand) / 500 | .7rem/500 -> var(--fs-label)/var(--fw-label): size unchanged, weight 500 -> 600 | Acts 4:36; 9:27; 15:36-40; 2 Timothy 4:11 | none | /r/personality/<code>, /personality-type/hearth/ |
| styles/pages/personality.css:395 | `.pq-grp-n` | .64rem (font shorthand) / 600 | .64rem/600 -> var(--fs-label)/var(--fw-label) | Your type, in detail / How you speak / When you’re wronged | none | /r/personality/<code> (page 3) |
| styles/pages/personality.css:670 | `.pq-cs-k` | .64rem (font shorthand) / 700 | .64rem/700 -> var(--fs-label)/var(--fw-label) | Your type card | none | /r/personality/<code> (Save image) |
| styles/pages/prose.css:32 | `.pnl-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | The site, in facts / The standard / In short / The other half of the site | low | /about/, /articles/ |
| styles/pages/prose.css:284 | `.doc blockquote cite` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | (no article uses <cite> in a quotation today; it would be e.g. "Athanasius, Letter to Marcellinus") | none | /articles/how-to-pray-the-psalms/ |
| styles/pages/prose.css:381 | `.method .clg-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Group 01 of 6 | none | /method/changelog/ |
| styles/pages/prose.css:957 | `.toc-head` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | In this article · 7 sections | none | /articles/how-to-pray-the-psalms/ |
| styles/pages/prose.css:1041 | `.side-tag` | .58rem / 700 | .58rem/700 -> var(--fs-label)/var(--fw-label) | Article | none | /articles/how-to-pray-the-psalms/ at 1360 |
| styles/pages/prose.css:1197 | `.inshort-head` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | In short | none | /articles/how-to-pray-the-psalms/, /compare/baptist-vs-catholic/ |
| styles/pages/psalm-reading.css:30 | `.pr-kicker` | .68rem / 600 | .68rem/600 -> var(--fs-label)/var(--fw-label) | You're living | none | /r/which-psalm/<code> |
| styles/pages/psalm-reading.css:52 | `.pr-label` | .66rem / 700 | .66rem/700 -> var(--fs-label)/var(--fw-label) | Why this one / The story behind it / Where it turns / For the nights | none | /r/which-psalm/<code> |
| styles/pages/psalm-reading.css:53 | `.pr-cite` | .62rem / 600 | .62rem/600 -> var(--fs-label)/var(--fw-label) | Psalm 91 / Letter to Marcellinus | low: the inline one sits after a quotation on the same line | /r/which-psalm/<code> |
| styles/pages/psalm.css:42 | `.ps-cite, .ps-ref` | .62rem / 600 | .62rem/600 -> var(--fs-label)/var(--fw-label) | Letter to Marcellinus / Psalm 137:9 | low | /psalm/137/ |
| styles/pages/psalm.css:87 | `.ps-sup-label` | .58rem / 700 | .58rem/700 -> var(--fs-label)/var(--fw-label) | Its own heading | none | /psalm/120/ |
| styles/pages/psalm.css:113 | `.ps-note-label` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Hard words / About verse 9 | none | /psalm/137/ |
| styles/pages/reading.css:44 | `.rd-step, .rd-kicker` | .64rem / 600 | .64rem/600 -> var(--fs-label)/var(--fw-label) | Question 3 · pick one or two / None of those | none | /q/which-psalm/ running |
| styles/pages/reading.css:47 | `.rd-kicker` | .68rem / 600 | .68rem/600 -> var(--fs-label)/var(--fw-label) | Does this sound like you? / Is it closer to this? | none | /q/which-psalm/ running |
| styles/pages/reference.css:137 | `.amap-group-head` | .7rem / 700 | .7rem/700 -> var(--fs-label)/var(--fw-label): size unchanged, weight 700 -> 600 | Toward Monergist 5 / Neither pole named 41–59 6 | none | /axis/theology-compass/grace/ |
| styles/pages/reference.css:204 | `.answer-why h3` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Why it matters | none | /axis/theology-compass/grace/ |
| styles/pages/reference.css:283 | `.axis-note-label` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | About this axis / Between the poles | none | /axis/theology-compass/grace/ |
| styles/pages/reference.css:345 | `.ref-panel--tl .tl-head h3, .ref-panel--pg .pg-head h3` | .64rem / 700 (site.css) | .64rem/700 (site.css) -> var(--fs-label)/var(--fw-label) | How the argument unfolded / Passages both sides argue from | medium: the strip is fixed at 2.7rem; check the two lines still fit and the strip is not longer than the panel | /axis/theology-compass/grace/ at 1360 |
| styles/pages/reference.css:446 | `.caveat-label` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Worth knowing / Read this first / What this is / How to read the six rails below | low: the longest ("How to read the six rails below") may take two lines at 390 | /tradition/lutheran-confessional/, /figure/moses/ |
| styles/pages/reference.css:553 | `.quoted-ref` | .64rem / 700 | .64rem/700 -> var(--fs-label)/var(--fw-label) | Proverbs 16:18 / Romans 12:7 | none | /axis/theology-compass/grace/ |
| styles/pages/reference.css:623 | `.moment-side` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Toward Acts first / Toward Weighs first | none | /figure/moses/ (an axis whose record goes both ways) |
| styles/pages/reference.css:713 | `.ref .caveat-label` | .58rem / 700 | .58rem/700 -> var(--fs-label)/var(--fw-label) | Read this first | low | /figure/moses/, /tradition/lutheran-confessional/ |
| styles/pages/reference.css:752 | `.axlist-name` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Pace / Voice / Lead / Conflict (figure); Grace / Table (tradition) | low: stacks on a phone already | /tradition/lutheran-confessional/, /figure/moses/ |
| styles/pages/reference.css:976 | `.qcard-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | Your turn | none | /early-christian/, /early-church-on/, /axis/theology-compass/grace/ |
| styles/pages/reference.css:1073 | `.wayin-kicker` | .6rem / 700 | .6rem/700 -> var(--fs-label)/var(--fw-label) | When you are ready | none | every /q/ page |
| styles/pages/reference.css:1131 | `.tally-name` | .58rem / 700 | .58rem/700 -> var(--fs-label)/var(--fw-label) | Pace / Voice / Lead / Conflict | medium: the dark half is narrow; name and reading share one line at 390 | /figure/jesus/ at 390 (the tally is drawn only for a figure whose record is sparse: Jesus, Mary of Nazareth) |
| styles/pages/tradition.css:33 | `.tlead-label` | .62rem / 700 | .62rem/700 -> var(--fs-label)/var(--fw-label) | Lutheran in a sentence | none | /tradition/lutheran-confessional/ |
| styles/pages/tradition.css:127 | `.tfact-src` | .67rem / 500 | .67rem/500 -> var(--fs-label)/var(--fw-label) | Augsburg Confession presented to Charles V at the Diet of Augsburg, 25 June 1530. | low: wraps one more line | /tradition/lutheran-confessional/ |
| styles/pages/tradition.css:155 | `.tread-label` | .58rem / 700 | .58rem/700 -> var(--fs-label)/var(--fw-label) | Read to place this tradition | none | /tradition/lutheran-confessional/ |
| styles/site.css:940 | `.pole-panel h4` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Monergist / Synergist | none | /r/theology-compass/<code> (open an axis), /c/theology-compass/<a>.<b> |
| styles/site.css:965 | `.passages h4, .read-split--compact h4` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Monergist / Synergist | none | /r/theology-compass/<code> (open an axis) |
| styles/site.css:1041 | `.tl-head h3, .tl-head h4, .pg-head h3, .pg-head h4` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | How the argument unfolded / Passages both sides argue from | low | /axis/theology-compass/grace/ at 390, /r/theology-compass/<code> |
| styles/site.css:1114 | `.pg-ref` | .66rem / 700 | .66rem/700 -> var(--fs-label)/var(--fw-label) | Romans 9 · verses 1–5 of 33 in the passage | none | /axis/theology-compass/grace/ (open a passage), /r/theology-compass/<code> |
| styles/site.css:1125 | `.pg-cite` | .68rem | .68rem/400 -> var(--fs-label)/var(--fw-label) | Berean Standard Bible (BSB) | none | /axis/theology-compass/grace/ (open a passage) |
| styles/site.css:1287 | `.share-label` | .64rem / 700 | .64rem/700 -> var(--fs-label)/var(--fw-label) | Your result link / Compare with a friend | none | /r/theology-compass/<code>, /r/personality/<code>, /c/theology-compass/<a>.<b> |
| styles/site.css:1386 | `.cl-body h4` | .68rem / 700 | .68rem/700 -> var(--fs-label)/var(--fw-label) | Before / After / Why it was not applied | none | /method/changelog/ |

## TAG changes (41)

Each becomes `font-size: var(--fs-tag)`, weight unchanged. Rows marked "no visible change" are already .6rem.

| Where | Selector | Now | Change | Sample | Layout risk at 390 | Check |
|---|---|---|---|---|---|---|
| pages/q/spiritual-gifts/print.astro:145 | `.print-ref sup` | .6rem | .6rem -> var(--fs-tag) (token swap only, no visible change) | 37R | none | /q/spiritual-gifts/print/ |
| styles/kit.css:215 | `.navmenu-tag` | var(--fs-tag) (was .5rem at HEAD) / 700 | ALREADY DONE in the working tree (.5rem -> var(--fs-tag)); on his list of tags | New | low: pill at the right of a two-line menu item | header menus at 390 and 1360 |
| styles/kit.css:263 | `.band-chip` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Article | none | /articles/how-to-pray-the-psalms/ |
| styles/kit.css:300 | `.tile span` | .54rem / 600 | .54rem -> var(--fs-tag) | Quizzes / In draft / Articles (/about/); Axes matched on (figure pages) | medium: four tiles across 390, a slightly longer wrap; from 40rem the label is nowrap and the tile grows a little | /figure/moses/, /early-christian/augustine-of-hippo/, /method/ at 390 and 1360 |
| styles/kit.css:313 | `.tile span` | .58rem / 600 | .58rem -> var(--fs-tag) | Axes matched on | low: tile is flex 0 0 auto from 40rem and widens a few px | /method/ at 1360 |
| styles/kit.css:601 | `.ccard-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 3 min / 18 statements / 18 traditions | none: it shrinks .62 -> .6, which helps the row fit | / (home), /quizzes/ |
| styles/pages/compare.css:238 | `.cmpx-read-side` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Catholic / Baptist | none | /compare/baptist-vs-catholic/ |
| styles/pages/early-christian.css:171 | `.ecp-page-dir` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Earlier / Later | none | /early-christian/augustine-of-hippo/ |
| styles/pages/early-christian.css:259 | `.eci-tag` | .54rem / 700 | .54rem -> var(--fs-tag) | Kindred spirit / Sparring partner | low: "Sparring partner" at .6rem is about 120px on a ~165px picture at 390 | /early-christian/ at 390 with a finished early-Christian result on the device |
| styles/pages/home.css:107 | `.room-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 12 min / 72 questions / 22 early Christians | none: shrinks .62 -> .6 | / |
| styles/pages/home.css:130 | `.room-tab` | .58rem / 700 | .58rem -> var(--fs-tag) | Draft | none | / |
| styles/pages/me.css:163 | `.mroom-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 3 min / 18 statements / 18 traditions | none: shrinks .62 -> .6 | /me/ |
| styles/pages/me.css:173 | `.mroom-tab` | .58rem / 700 | .58rem -> var(--fs-tag) | Draft | none | /me/ |
| styles/pages/me.css:212 | `.mroom-when` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Taken today / Taken 3 days ago | none | /me/ |
| styles/pages/mine.css:28 | `.you-chip, .you-tag` | .56rem / 700 | .56rem -> var(--fs-tag) | You | low: nowrap pill placed over rails and dots; check it does not collide at the rail ends | /axis/theology-compass/grace/, /tradition/lutheran-confessional/, /figure/moses/ (with a Compass result on the device) |
| styles/pages/personality-run.css:167 | `.pqr-tag` | .58rem (font shorthand) / 700 | .58rem -> var(--fs-tag) | Only you see it / A card to save and share | none | /q/personality/ |
| styles/pages/personality-type.css:191 | `.pt-tag` | .58rem (font shorthand) / 700 | .58rem -> var(--fs-tag) | You / This type | none | /personality-type/, /personality-type/hearth/ |
| styles/pages/personality-type.css:227 | `.pt-page-dir` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Previous / Next | none | /personality-type/hearth/ |
| styles/pages/personality.css:371 | `.pq-ty-tag` | .6rem (font shorthand) / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | You / Close second | none | /r/personality/<code> |
| styles/pages/personality.css:463 | `.pq-g2-cell .pq-you` | .6rem (font shorthand) / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | You | none | /r/personality/<code> |
| styles/pages/personality.css:618 | `.pq-qc-facts span` | .6rem (font shorthand) / 600 | .6rem -> var(--fs-tag) (token swap only, no visible change) | 2 min / 14 statements (sins); 8 min / 19 gifts (gifts) | none | /r/personality/<code> |
| styles/pages/play.css:128 | `.gcard-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 2 min a run / 15 editions / 113 speakers | none: shrinks .62 -> .6 | /games/ |
| styles/pages/prose.css:618 | `.nx-facts > span` | .6rem / 600 | .6rem -> var(--fs-tag) (token swap only, no visible change) | 3 min / 53 situations / 2 min a run | none | /articles/how-to-pray-the-psalms/ (foot) |
| styles/pages/prose.css:715 | `.saved-pill` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | Saved to My results | none | /r/theology-compass/<code> |
| styles/pages/prose.css:1074 | `.side-pace-left` | .56rem / 700 | .56rem -> var(--fs-tag) | 4 min left | none | /articles/how-to-pray-the-psalms/ at 1360 |
| styles/pages/prose.css:1256 | `.rbar-left` | .58rem / 700 | .58rem -> var(--fs-tag) | 4 min left | low: +3% on a flex:none item in a one-line bar | /articles/how-to-pray-the-psalms/ at 390 |
| styles/pages/quiz.css:51 | `.axpv-poles` | .58rem / 700 | .58rem -> var(--fs-tag) | Monergist … Synergist / Continuationist … Cessationist | low | /q/theology-compass/ |
| styles/pages/quiz.css:147 | `.ask-quiz` | .55rem / 700 | .55rem -> var(--fs-tag) | Theology Compass / Which early Christian thinks like you? | medium: long titles already ellipsize near 30-40rem and a bigger size cuts more; the comment says a cut title "reads as broken" | /q/which-early-christian/ running, at 480-640px and 1360 |
| styles/pages/quiz.css:538 | `.qroom-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 5 min / 18 statements | none: shrinks .62 -> .6 | /quizzes/ |
| styles/pages/quiz.css:562 | `.qroom-tab` | .58rem / 700 | .58rem -> var(--fs-tag) | Draft | none | /quizzes/ |
| styles/pages/reads.css:21 | `.read-time` | .6rem / 700 | .6rem -> var(--fs-tag) (token swap only, no visible change) | 6 min | none | /articles/ |
| styles/pages/reference.css:70 | `.amap-ends` | .64rem / 700 | .64rem -> var(--fs-tag) | Monergist … Synergist / Acts first … Weighs first | none: shrinks .64 -> .6 | /axis/theology-compass/grace/ |
| styles/pages/reference.css:268 | `.case-tag` | .54rem / 700 | .54rem -> var(--fs-tag) | Left pole / Right pole | none | /axis/theology-compass/grace/ |
| styles/pages/reference.css:393 | `.pager-dir` | .62rem / 700 | .62rem -> var(--fs-tag) | Previous / Next | none: shrinks .62 -> .6 | /axis/theology-compass/grace/ |
| styles/pages/reference.css:405 | `.pager-poles` | .58rem / 700 | .58rem -> var(--fs-tag) | Sacramental ↔ Memorial / Says it ↔ Holds it | low | /axis/theology-compass/grace/ at 390 |
| styles/pages/reference.css:496 | `.nbr-chip` | .56rem / 700 | .56rem -> var(--fs-tag) | Closest | none | /figure/moses/, /tradition/lutheran-confessional/ |
| styles/pages/reference.css:505 | `.nbr-score i` | .58rem / 700 | .58rem -> var(--fs-tag) | match (after "72%") | none | /tradition/lutheran-confessional/, /figure/moses/ |
| styles/pages/reference.css:606 | `.moment-poles` | .58rem / 700 | .58rem -> var(--fs-tag) | Acts first ↔ Weighs first | none | /figure/moses/ |
| styles/pages/reference.css:993 | `.qcard-facts` | .62rem / 600 | .62rem -> var(--fs-tag) | 3 min / 25 figures / 8 min / 19 gifts | none: shrinks .62 -> .6 | /early-christian/ |
| styles/pages/reference.css:1192 | `.tally-poles` | .58rem / 700 | .58rem -> var(--fs-tag) | Acts first … Weighs first | none | /figure/jesus/ |
| styles/site.css:950 | `.pole-panel.is-yours::after` | .62rem / 700 | .62rem -> var(--fs-tag) | your side | none: shrinks .62 -> .6 | /r/theology-compass/<code> |

## UNSURE: six questions for him, in plain words

1. **The small line under a name on a card.** The dates under each person on the people cards (`.pcard-d`, his own open
   case), and the same kind of line elsewhere: dates under a name (`.eci-dates`, `.ecl-dates`), "3 would agree, 8 would
   disagree" (`.ec-row-meta`), "Psalm 91" under a situation (`.pg-meta`), "Same band on 4 of 6" (`.cmpb-same`), "Quiz ·
   18 statements · about 3 minutes" (`.gocard-text > span`). Question: *small tag size, or label size?* `.pcard-d` (.56)
   and `.gocard-text > span` (.56) are under the floor, so they grow to at least .6 either way; the others already meet it.
2. **The type's words as chips.** "Confident", "Tranquil mind" on Martin's page (`.gchips li`, his open case, .54rem), and
   "Cheerful", "Quiet mind" on the type pages (`.pt-words li`, .66) and the result hero (`.pq-badges span`, .66).
   Question: *tag size for all three, or leave the two on the personality pages as they are?* `.gchips li` must reach .6.
3. **The source under a number** on Martin's number tiles (`.stat-src`, "Life of St Martin, chapter 2", .64 italic, his
   open case). A source line is a label by his rule; *label size, or leave it?*
4. **A filter's name over its chips**: "Show articles about" over the topic chips, "Jump to a group" (`.jump-label`,
   .58). His rule calls "a sub-label over a row of chips" a tag, but he made the saints filter names (`.fgroup-t`) labels.
   *Tag or label?* It grows either way.
5. **A Bible reference drawn as a pill** ("Exodus 2:12" on figure pages, "Acts 18:24-26" on gift pages; `.ref .act-ref,
   .ref .moment-cite` at .58 and the base `.act-ref` at .64). A citation is a label by his rule, but here it is a chip.
   *Tag size (.6) or label size (.7)?* It is under the floor now, so at least .6.
6. **The key numbers 1-5 in the corners of the Compass answer buttons** on a wide screen (`#scale button::after`, .55).
   Buttons keep their sizes, but it is under the floor. *Raise it to .6, or leave the button alone?*

| Where | Selector | Now | Sample | Question (why unsure) |
|---|---|---|---|---|
| components/CompareBlock.astro:105 | `.cmpb-same` | .68rem | Same band on 4 of 6 | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). A sentence-case meta line under a link row's name. At .68rem it is above the floor either way. |
| styles/pages/early-christian.css:138 | `.ecl-dates` | .6rem | c. 251 to 356 · The Egyptian desert | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). Dates and place under a person's name at the head of a line card. Already .6rem, so it meets the floor either way: the only question is whether it should grow to the label size. |
| styles/pages/early-christian.css:225 | `.ec-row-meta` | .6rem | 3 would agree, 8 would disagree | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). A meta line under a list row's text. Already .6rem (meets the floor). |
| styles/pages/early-christian.css:250 | `.eci-dates` | .6rem | c. 100 to c. 165 | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). This one is the direct twin of .pcard-d: dates under a name on a people card. Already .6rem (meets the floor). The port replaces this grid with the mock-up's hub. |
| styles/pages/personality-type.css:36 | `.pt-words li` | .66rem | Cheerful / Quiet mind | Same thing as the mock-up's .gchips li ("Confident", "Tranquil mind"), which the owner has NOT ruled on yet (README "Still open"). The type's two words as coloured pills on the band. Tag rule would bring .66 down to .6. |
| styles/pages/personality.css:139 | `.pq-badges span` | .66rem | Cheerful / Quiet mind | Same thing as the mock-up's .gchips li ("Confident", "Tranquil mind"), which the owner has NOT ruled on yet (README "Still open"). The type's two words as coloured pills on the result hero. |
| styles/pages/prose.css:113 | `.jump-label` | .58rem | Show articles about (/articles/) / On this page (/method/) / Jump to a group (changelog) | Under the floor, so it must grow to at least .6rem. The question is which size: the rule's tag example is "a sub-label over a row of chips" (the mock-up's .gchips-k, a tag), but this names a filter, like the mock-up's .fgroup-t (a label) and .frow-l (the hub's filter names, still open). |
| styles/pages/prose.css:331 | `.gocard-text > span` | .56rem | Quiz · 18 statements · about 3 minutes / Game · against the clock | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). A meta line under a card title. Under the floor, so at least .6rem either way. |
| styles/pages/psalm.css:203 | `.pg-meta` | .62rem | Psalm 3 / Psalm 55 / Psalms 120–134 | Same family as the mock-up's .pcard-d (dates on the hub's cards), which the owner has NOT ruled on yet (README "Still open"). The psalm's name as a meta line under the situation, in a list card. At .62 the tag rule would take it to .6, the label rule to .7. |
| styles/pages/quiz.css:308 | `#scale button::after` | .55rem | 1 2 3 4 5 | The key number (1-5) in the corner of each answer button, from 34rem. Buttons keep their own size, but at .55rem it is under the floor ("nothing meant to be read"). It is a keyboard hint inside a control. |
| styles/pages/reference.css:569 | `.act-ref` | .64rem | Acts 18:24-26 / Acts 11:25-26 | A citation (label by his rule: "a citation"), but on reference pages .ref .act-ref draws it as a pill beside the act, which reads like a tag. Base .64rem; on .ref pages it is .58, under the floor. See the .ref .act-ref row. |
| styles/pages/reference.css:788 | `.ref .act-ref, .ref .moment-cite` | .58rem | Exodus 2:12 / Acts 18:24-26 / No record | Under the floor, so at least .6rem. A reference is a citation (a label by his rule), but here it is drawn as a pill, "the shape everything else checkable on this site has", which reads as a tag. Also covers "No record" / "Not placed". |
| styles/pages/saints.css:259 | `.pcard-d` | .56rem | About 316 to 397 | THE open ruling itself (README "Still open": dates on the hub's cards). Under the floor (.56), so at least .6rem. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.) |
| styles/pages/saints.css:373 | `.stat-src` | .64rem | Life of St Martin, chapter 2 | THE open ruling itself (README "Still open"): the source under each number tile, italic. A source line is a label by his rule (.cite), but he has not ruled on this one. .64rem, above the floor. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.) |
| styles/pages/saints.css:450 | `.gchips li` | .54rem | Confident / Tranquil mind | THE open ruling itself (README "Still open": "Confident"). Under the floor (.54), so at least .6rem. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.) |

## Layout risks: pages to check at 390 (and 1360) after the change

**Medium** (look at these first):

- `.tile span` (styles/kit.css:300, .54rem -> .6): medium: four tiles across 390, a slightly longer wrap; from 40rem the label is nowrap and the tile grows a little. Check /figure/moses/, /early-christian/augustine-of-hippo/, /method/ at 390 and 1360.
- `.sect-kicker` (styles/kit.css:473, .62rem -> .7): medium: long kickers on axis pages wrap to two lines at 390 (e.g. "Argued from by both sides, assigned to neither"). Check /axis/theology-compass/grace/, /about/, /compare/baptist-vs-catholic/, /q/theology-compass/ (foot).
- `.mroom.is-taken h2` (styles/pages/me.css:195, .62rem -> .7): medium: long quiz names (uppercase, .16em) go to two lines on a 390 card. Check /me/ at 390 with several finished quizzes.
- `.pq-hero-label` (styles/pages/personality.css:120, .6rem -> .7): medium: at .7rem with .14em tracking it is about 190px beside the logo; at 390 it will go to two balanced lines. Check /r/personality/<code> at 390.
- `.ask-quiz` (styles/pages/quiz.css:147, .55rem -> .6): medium: long titles already ellipsize near 30-40rem and a bigger size cuts more; the comment says a cut title "reads as broken". Check /q/which-early-christian/ running, at 480-640px and 1360.
- `.ref-panel--tl .tl-head h3, .ref-panel--pg .pg-head h3` (styles/pages/reference.css:345, .64rem -> .7): medium: the strip is fixed at 2.7rem; check the two lines still fit and the strip is not longer than the panel. Check /axis/theology-compass/grace/ at 1360.
- `.act-ref` (styles/pages/reference.css:569, .64rem -> .6 or .7, undecided): medium if it goes to .7: a long reference in the 11rem column wraps inside the pill. Check /axis/spiritual-gifts/teaching/ at 1360.
- `.ref .act-ref, .ref .moment-cite` (styles/pages/reference.css:788, .58rem -> .6 or .7, undecided): medium if .7: long references in the 11rem column (axis pages) wrap inside the pill. Check /figure/moses/, /axis/spiritual-gifts/teaching/ at 1360.
- `.tally-name` (styles/pages/reference.css:1131, .58rem -> .7): medium: the dark half is narrow; name and reading share one line at 390. Check /figure/jesus/ at 390 (the tally is drawn only for a figure whose record is sparse: Jesus, Mary of Nazareth).

**Low** (a word more of wrap at most):

- `.oidx-say .oidx-hint` (components/OutcomeIndex.astro:75): may wrap one more word at 390. Check /q/theology-compass/.
- `.pidx-say .pidx-hint` (components/PsalmIndex.astro:71): low. Check /q/which-psalm/.
- `.save-or` (components/SaveResult.astro:239): one line at 390 (about 30 characters). Check /r/theology-compass/<code> (signed out).
- `.navmenu-tag` (styles/kit.css:215): pill at the right of a two-line menu item. Check header menus at 390 and 1360.
- `.tile span` (styles/kit.css:313): tile is flex 0 0 auto from 40rem and widens a few px. Check /method/ at 1360.
- `.ccard-kicker` (styles/kit.css:591): low. Check /compare/, /tradition/lutheran-confessional/.
- `.feature-kicker` (styles/kit.css:631): low. Check /figure/moses/, /c/theology-compass/<a>.<b>.
- `.spec dt` (styles/kit.css:661): dt is flex none; a long dt pushes the value, check the /about/ lists at 390. Check /about/.
- `.cmpx-axis-name` (styles/pages/compare.css:101): the row already wraps. Check /compare/baptist-vs-catholic/.
- `.ecl-on` (styles/pages/early-christian.css:107): low. Check /early-christian/augustine-of-hippo/, /early-church-on/laughter/.
- `.eci-tag` (styles/pages/early-christian.css:259): "Sparring partner" at .6rem is about 120px on a ~165px picture at 390. Check /early-christian/ at 390 with a finished early-Christian result on the device.
- `.kr-label` (styles/pages/kindred.css:90): low. Check /r/which-early-christian/<code>.
- `.kr-src` (styles/pages/kindred.css:117): long sources wrap one more line. Check /r/which-early-christian/<code>.
- `.you-chip, .you-tag` (styles/pages/mine.css:28): nowrap pill placed over rails and dots; check it does not collide at the rail ends. Check /axis/theology-compass/grace/, /tradition/lutheran-confessional/, /figure/moses/ (with a Compass result on the device).
- `.pq-kicker` (styles/pages/personality.css:76): low. Check /r/personality/<code>.
- `.pnl-kicker` (styles/pages/prose.css:32): low. Check /about/, /articles/.
- `.jump-label` (styles/pages/prose.css:113): either way. Check /articles/, /method/changelog/.
- `.gocard-text > span` (styles/pages/prose.css:331): low. Check /articles/.
- `.rbar-left` (styles/pages/prose.css:1256): +3% on a flex:none item in a one-line bar. Check /articles/how-to-pray-the-psalms/ at 390.
- `.pr-cite` (styles/pages/psalm-reading.css:53): the inline one sits after a quotation on the same line. Check /r/which-psalm/<code>.
- `.ps-cite, .ps-ref` (styles/pages/psalm.css:42): low. Check /psalm/137/.
- `.axpv-poles` (styles/pages/quiz.css:51): low. Check /q/theology-compass/.
- `.pager-poles` (styles/pages/reference.css:405): low. Check /axis/theology-compass/grace/ at 390.
- `.caveat-label` (styles/pages/reference.css:446): the longest ("How to read the six rails below") may take two lines at 390. Check /tradition/lutheran-confessional/, /figure/moses/.
- `.ref .caveat-label` (styles/pages/reference.css:713): low. Check /figure/moses/, /tradition/lutheran-confessional/.
- `.axlist-name` (styles/pages/reference.css:752): stacks on a phone already. Check /tradition/lutheran-confessional/, /figure/moses/.
- `.stat-src` (styles/pages/saints.css:373): at .7: tiles are two across at 390. Check /saints/martin-of-tours/ at 390.
- `.tfact-src` (styles/pages/tradition.css:127): wraps one more line. Check /tradition/lutheran-confessional/.
- `.tl-head h3, .tl-head h4, .pg-head h3, .pg-head h4` (styles/site.css:1041): low. Check /axis/theology-compass/grace/ at 390, /r/theology-compass/<code>.

Everything else in the LABEL and TAG lists is a standalone line with room to wrap, or it shrinks (.62 -> .6).
One sweep covers nearly all of it: `/`, `/quizzes/`, `/me/` (with results), `/about/`, `/articles/` and one article,
`/axis/theology-compass/grace/`, `/axis/spiritual-gifts/teaching/`, `/tradition/lutheran-confessional/`, `/figure/moses/`,
`/figure/jesus/`, `/compare/baptist-vs-catholic/`, `/early-church-on/laughter/`, `/psalm/`, `/psalm/137/`,
`/personality-type/`, `/personality-type/hearth/`, every `/q/` page (the start box kicker), and one result of each shape
(`/r/theology-compass/…`, `/r/personality/…`, `/r/which-psalm/…`, `/r/which-early-christian/…`), light and dark.

## The result page is frozen: say so when showing him

CLAUDE.md: "the result page instruments were not edited" and "Do not redesign the result page". These changes are size
tokens only, but they land inside the result page's own instruments, so name them to him:
`.pole-panel h4`, `.pole-panel.is-yours::after`, `.passages h4, .read-split--compact h4`, `.tl-head h3, .tl-head h4, .pg-head h3, .pg-head h4`, `.pg-ref`, `.pg-cite`, `.share-label`.
The wheel's labels (`.wheel-label b`/`i`) are classed DRAWING and left alone; `.rail-poles`, `.rail-read`, `.outcome-meta`,
`.tier-*` and `.depth-poles` are .7rem or larger and left alone.

## Pages the port replaces

`/early-christian/<slug>/` moves to `/saints/<slug>/` (the approved mock-up's template). The rules only those pages use
(`.ecp-meta`, `.ecp-page-dir`, `.eci-*`, the person band credit) may be moot; `EarlyLine` (`.ecl-on`, `.ecl-dates`) is
also used on `/early-church-on/<topic>/`, which stays.

## What stays under .6rem after the changes (the allow-list for a build check)

These stay as they are (drawings, plus two dead rules and one that never renders):

- `.scard-tag` (styles/kit.css:704, .54rem): KEEP. No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule.
- `.scard-tab` (styles/kit.css:714, .54rem): KEEP. No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule.
- `.mock-btns span` (styles/kit.css:756, .54rem): DRAWING. The two answer buttons inside the drawing of a game screen on the game cards: text inside a drawing, allowed under .6rem.
- `.mroom-eg .wheel-label b` (styles/pages/me.css:133, .54rem): DRAWING. Axis names around the small example wheel on a /me/ card: text inside an instrument drawing (label box fixed at 4.2rem).
- `.nx-eg .wheel-label b` (styles/pages/prose.css:672, .54rem): DRAWING. Same mini-wheel labels in the stacked layout (.54rem).
- `.leaf-m` (styles/pages/saints.css:424, .5rem): DRAWING. His named exception: the month on a calendar leaf.
- `.temper-k` (styles/pages/saints.css:445, .56rem): KEEP. His ruling: leave as is.

These are under the floor today and grow to at least .6rem once he answers the questions above:

- `.jump-label` (styles/pages/prose.css:113, .58rem)
- `.gocard-text > span` (styles/pages/prose.css:331, .56rem)
- `#scale button::after` (styles/pages/quiz.css:308, .55rem)
- `.ref .act-ref, .ref .moment-cite` (styles/pages/reference.css:788, .58rem)
- `.pcard-d` (styles/pages/saints.css:259, .56rem)
- `.gchips li` (styles/pages/saints.css:450, .54rem)

## BUTTON (34): controls keep their own size

- `.chip-link` (styles/kit.css:672, .62rem): 1 Peter / 2 Abigail (axis map chips); changelog jump chips. A link chip (axis chips, changelog jump chips): filter/nav chips keep their own size (.62rem, the owner's "filter chips .62rem").
- `.site-foot a.foot-support` (styles/kit.css:920, .66rem): Support Wiser Walk. The footer's one pill: a button.
- `.foot-col li a.foot-all` (styles/kit.css:945, .66rem): All quizzes / All games. A menu link ("All quizzes"): menu items keep their own size.
- `.set-do` (styles/pages/account-settings.css:102, .68rem): Change / Log out. A pill button.
- `.ac-show` (styles/pages/account.css:233, .68rem): Show. The Show toggle inside a password field.
- `.ac-switch-word` (styles/pages/account.css:608, .68rem): On / Off. The state word inside the marketing switch control: part of a form control, which keeps its own size.
- `.hm-btn-glass` (styles/pages/home.css:54, .74rem): Play a game. A pill button (and above .7rem).
- `.kr-credits summary` (styles/pages/kindred.css:166, .64rem): Picture credits. A <summary> toggle that opens the picture credits: a control.
- `.mroom-past > summary` (styles/pages/me.css:233, .64rem): 4 earlier results. A <summary> toggle (earlier runs), 40px target: a control.
- `.me-ask-go` (styles/pages/me.css:522, .68rem): Log in / Your account. A pill link.
- `.me-clear-btn` (styles/pages/me.css:578, .64rem): Clear my results from this device. A pill button.
- `.pqr-over` (styles/pages/personality-run.css:103, .74rem (font shorthand)): Start over. A text button (and above .7rem).
- `.pqr-credits summary` (styles/pages/personality-run.css:221, .64rem (font shorthand)): Picture credits. A <summary> toggle: a control.
- `.pqr-ab` (styles/pages/personality-run.css:325, .7rem (font shorthand)): A / B. The A/B letter inside an answer button.
- `.pqr-pt-l` (styles/pages/personality-run.css:345, .6rem (font shorthand)): Very much A / Mostly A / Both / neither; Never … All the time. The words under each of the seven answer points: part of the answer control (each point is a <button>). Controls keep their own size; seven columns at 390 leave no room to grow.
- `.pqr-textback` (styles/pages/personality-run.css:393, .72rem (font shorthand)): ← Back. A text button (above .7rem).
- `.pqr-pt-l` (styles/pages/personality-run.css:402, .66rem): Very much A / Sometimes. Same answer-point words from 40rem (.66).
- `.pq-pg-n` (styles/pages/personality.css:192, .62rem (font shorthand)): 1 of 10. The page count inside the sticky pager button ("1 of 10" beside the page title): part of a control.
- `.pq-qc-go` (styles/pages/personality.css:622, .7rem (font shorthand)): Start ↗. A go-pill.
- `.jump a` (styles/pages/prose.css:120, .68rem): 01 The promise. Jump chips: nav chips keep their own size.
- `.method .clg-more > summary` (styles/pages/prose.css:427, .66rem): The other 36 in axes. A chip-shaped <summary> toggle, 44px.
- `.pg-toc-n` (styles/pages/psalm.css:168, .66rem): 17. The count inside a contents chip link on the psalm guide: part of a nav chip.
- `.runner-nav .btn` (styles/pages/quiz.css:280, .68rem): ← Back. A button.
- `.rd-back` (styles/pages/reading.css:115, .74rem (font shorthand)): ← Back / ← Leave the quiz. A text button (above .7rem).
- `.topic-chip` (styles/pages/reads.css:44, .68rem): All / Gratitude / Prayer. Filter chips (buttons).
- `.topic-chip` (styles/pages/reads.css:53, .72rem): Gratitude. The same filter chips on a phone (.72).
- `.amap-chip` (styles/pages/reference.css:154, .7rem): 1 Peter / 2 Abigail. The chip links under the map (chip-link): buttons keep their size.
- `.crumb` (styles/pages/saints.css:68, .6rem): Saints and early Christians. The back-link pill on the band (the mock-up's .crumb at .6rem, approved). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.fbadge, .fpill-n` (styles/pages/saints.css:165, .68rem): 2. The count badge inside the Filters button and the filter pills: part of a control. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.fopt-n` (styles/pages/saints.css:201, .72rem): 12. The count inside a filter option chip (and above .7rem). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.st summary` (styles/pages/saints.css:581, .6rem): Show his line. A <summary> pill toggle. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.st-link` (styles/pages/saints.css:589, .62rem): Everyone on this. A link beside the topic label ("Everyone on this"), nowrap: a control, as the mock-up has it. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.pill` (styles/site.css:1090, .74rem): Romans 9 / Romans 8:28–30. Passage pills (a <summary> each): buttons.
- `.runner-nav .btn` (styles/site.css:1220, .74rem): ← Back. A button (above .7rem).

## DRAWING (18): text inside an instrument or drawing

- `.print-box` (pages/q/spiritual-gifts/print.astro:137, .7rem): 0 1 2 3 4. A digit printed inside a drawn answer box on the printable sheet: part of the form drawing, not text a reader reads.
- `.mock-btns span` (styles/kit.css:756, .54rem): Not in the Bible / In the Bible. The two answer buttons inside the drawing of a game screen on the game cards: text inside a drawing, allowed under .6rem.
- `.mock-names span` (styles/pages/home.css:282, .6rem): Festus / James / Jesus / Paul. The four name buttons inside the drawing of the Who Said It game: text inside a drawing.
- `.mroom-eg .wheel-label b` (styles/pages/me.css:133, .54rem): Grace. Axis names around the small example wheel on a /me/ card: text inside an instrument drawing (label box fixed at 4.2rem).
- `.mroom-eg .wheel-label b` (styles/pages/me.css:140, .6rem): Grace. The same wheel labels at the next container size (.6rem).
- `.mgame-names span` (styles/pages/me.css:350, .6rem): Festus / James / Jesus / Paul. Name buttons inside the drawing of the Who Said It game on /me/.
- `.pq-ax` (styles/pages/personality.css:453, .66rem (font shorthand)): Catches quickly / Catches slowly (also Words come easily / Words come hard). Column labels of the 2x2 grid (role="img"): the axis ticks of an instrument. At .66rem they are above the floor, so nothing is needed. (By the letter of the rule they are also "the two ends of a scale", which would be a tag at .6; kept, because shrinking is not required.)
- `.pq-ay` (styles/pages/personality.css:454, .66rem (font shorthand)): Lets go quickly / Lets go slowly (also Thinks first / Speaks first). Row labels of the same 2x2 grid, written vertically: instrument ticks, above the floor.
- `.gcard-names span` (styles/pages/play.css:149, .6rem): Festus / James / Jesus / Paul. Name buttons inside the drawing of a game.
- `.nx-eg .wheel-label b` (styles/pages/prose.css:585, .6rem): Grace. Axis names around the mini wheel on a NextUp card: text inside an instrument drawing.
- `.nx-eg .wheel-label b` (styles/pages/prose.css:672, .54rem): Grace. Same mini-wheel labels in the stacked layout (.54rem).
- `.amap-dot` (styles/pages/reference.css:103, .62rem): 1 2 3. The number inside each dot on the map: text inside an instrument.
- `.amap-n` (styles/pages/reference.css:158, .64rem): 1 2 3. The number in a drawn 21px disc inside each chip, matching the map's dots.
- `.nbr-rank` (styles/pages/reference.css:483, .68rem): 1 2 3. The rank numeral (reference pages draw it in a 1.7rem disc via .ref .nbr-rank).
- `.ref .nbr-rank` (styles/pages/reference.css:907, .62rem): 1 2 3. The rank numeral inside a drawn 1.7rem disc.
- `.leaf-m` (styles/pages/saints.css:424, .5rem): NOV. His named exception: the month on a calendar leaf. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.wheel-label b` (styles/site.css:671, .66rem): Grace / Table / Gifts. Axis names placed around the compass wheel: text inside an instrument. The geometry is tight (the comment: about 81px beside the circle at 390). RESULT PAGE: CLAUDE.md froze the result page instruments ("do not redesign"); this is a size token only, but say so when showing him.
- `.wheel-label i` (styles/site.css:686, .7rem): Monergist / Synergist. Pole names inside the wheel (hidden on a phone): instrument text, already .7rem.

## KEEP (88), with reasons

- `.pidx-count` (components/PsalmIndex.astro:91, .7rem): A count pill beside a group title (a tag by role) but already .7rem: tags are only brought down from the .6-.69 range, never from .7.
- `.pidx-num` (components/PsalmIndex.astro:109, .74rem): Above .7rem (.74): out of scope.
- `.ds-table td small` (pages/data/theology-compass.astro:145, .72rem): Above .7rem (.72): out of scope.
- `.print-key thead th` (pages/q/spiritual-gifts/print.astro:141, .72rem): Above .7rem (.72): out of scope.
- `.feature-note` (styles/kit.css:637, .72rem): Above .7rem (.72): out of scope.
- `.scard-tag` (styles/kit.css:704, .54rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. (Card.astro is imported on /articles/ but never rendered.) If revived it is a TAG.
- `.scard-tab` (styles/kit.css:714, .54rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. (Card.astro is never rendered.) If revived it is a TAG.
- `.scard-go` (styles/kit.css:722, .62rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. (Card.astro is never rendered.) A go-link, so a BUTTON if revived.
- `.foot-bar p` (styles/kit.css:968, .62rem): Copyright small print, neither a label (not a field, box heading or source) nor a tag. The approved Saints mock-up keeps this same rule at .62rem. At .7rem the line (about 44 characters, uppercase, .14em) would likely wrap at 390 and leave "credit" alone, the orphan the comment in Base.astro warns about.
- `.saved-note` (styles/kit.css:992, .64rem): Dead: the result page uses class "saved-pill" with id "saved-note"; no element has class saved-note. The live rule is prose.css .saved-pill.
- `.ac-or` (styles/pages/account.css:262, .68rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. (only named in a comment in sign-in.astro).
- `.ac-go` (styles/pages/account.css:345, .68rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. ("ac-go" is only an id on .btn.ac-btn buttons). A button if revived.
- `.ac-quiet` (styles/pages/account.css:620, .68rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. A button if revived.
- `.ac-step-name` (styles/pages/account.css:662, .72rem): Above .7rem (.72): out of scope.
- `.cmpx-axis-poles` (styles/pages/compare.css:105, .72rem): Above .7rem (.72): out of scope.
- `.cmpx-side h4` (styles/pages/compare.css:118, .72rem): Above .7rem (.72): out of scope. (A heading he may want bigger.)
- `.cmpx-band` (styles/pages/compare.css:124, .7rem): Already .7rem/600, the label values; a sentence-case descriptor under the side heading, not a label or tag. Could be written as the token with no visible change.
- `.cmpc-ghost span:first-child` (styles/pages/compare.css:312, .42em): Not small: .42em of a ghost numeral sized 46cqi, so it computes to roughly 50-60px. Decorative, aria-hidden.
- `.ecp-meta` (styles/pages/early-christian.css:60, .66rem): The dates-and-place line under the name on the person band. The approved mock-up has the same line (.band-meta, "About 316 to 397 · Gaul") and keeps it at .66rem. Also: these pages move to /saints/ in the port, which brings the mock-up's own band.
- `.ecp-band .band-credit` (styles/pages/early-christian.css:74, .7rem): A picture credit, already .7rem (from 46rem); the mock-up's band credit is .74rem. Not a label or tag.
- `.ecp-meta` (styles/pages/early-christian.css:75, .72rem): Above .7rem (.72, from 46rem): out of scope.
- `.ecl-src` (styles/pages/early-christian.css:123, .72rem): Above .7rem (.72): out of scope.
- `.room-kicker` (styles/pages/home.css:98, .6rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. A LABEL if revived.
- `.kr-strip span` (styles/pages/kindred.css:226, .72rem): Above .7rem (.72): out of scope.
- `.mroom-past li.mroom-past-rest` (styles/pages/me.css:252, .62rem): A footnote sentence at the end of a list, neither a label nor a tag; above the floor (.62).
- `.pqr-ty-in span` (styles/pages/personality-run.css:139, .68rem (font shorthand)): The type's two words under its name on a picture card: sentence case, over a photograph, not clearly a tag (the rule only brings .6-.69 text down when it clearly is one).
- `.pqr-count` (styles/pages/personality-run.css:280, .7rem (font shorthand)): Already .7rem/600, the label values: a progress count. Could be written as the token with no visible change.
- `.pt .pq-kin em` (styles/pages/personality-type.css:111, .72rem): Above .7rem (.72): out of scope.
- `.pt-pair li span span` (styles/pages/personality-type.css:152, .74rem (font shorthand)): Above .7rem (.74): out of scope.
- `.pt-rh` (styles/pages/personality-type.css:206, .72rem): Above .7rem (.72, .78 from 46rem): the temper names that head each row; he may want them bigger. Out of scope.
- `.pq-quote cite` (styles/pages/personality.css:96, .74rem): Above .7rem (.74): out of scope.
- `.pq-lean-chips span` (styles/pages/personality.css:144, .7rem): Chips at .7rem in sentence case: tags are only brought down from .6-.69, never from .7.
- `.pq-pg-menu a span` (styles/pages/personality.css:213, .72rem (font shorthand)): Above .7rem (.72): the page number in a menu item's circle.
- `.pq-kin em` (styles/pages/personality.css:285, .72rem (font shorthand)): Above .7rem (.72): out of scope.
- `.pq-opp p.pq-opp-ours-type` (styles/pages/personality.css:345, .74rem (font shorthand)): Above .7rem (.74): out of scope.
- `.pq-ty-in span` (styles/pages/personality.css:367, .68rem (font shorthand)): The type's words under its name on a picture card: sentence case over a photograph, not clearly a tag.
- `.pq-chip` (styles/pages/personality.css:390, .74rem (font shorthand)): Above .7rem (.74): out of scope.
- `.pq-rail-name` (styles/pages/personality.css:400, .74rem (font shorthand)): Above .7rem (.74): out of scope.
- `.pq-note small` (styles/pages/personality.css:476, .72rem): Above .7rem (.72): out of scope.
- `.pq-step-n` (styles/pages/personality.css:519, .72rem (font shorthand)): Above .7rem (.72): a numeral in a drawn circle.
- `.pq-line p.pq-line-who` (styles/pages/personality.css:568, .68rem (font shorthand)): A picture caption in sentence case ("Pictured: …"), like a band credit, which the mock-up keeps at its own size. Not a label (not a source of words) and not a tag; above the floor.
- `.doc h3` (styles/pages/prose.css:227, .74rem): Above .7rem (.74): an article sub-heading; "he kept some headings bigger on purpose".
- `.doc ol > li::before` (styles/pages/prose.css:262, .7rem): The ordinal "01" of a numbered list: a list marker at .7rem, not a label or tag.
- `.method .cl-key` (styles/pages/prose.css:406, .64rem): A monospace code key under the change name: not a label or tag in the pattern; above the floor. Shrinking mono type to .6 would hurt it.
- `.sheets li` (styles/pages/prose.css:476, .6rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. A TAG if revived.
- `.side-when` (styles/pages/prose.css:942, .74rem): Above .7rem (.74): out of scope.
- `.toc-num` (styles/pages/prose.css:980, .66rem): The ordinal numbers of the contents list: list markers, not labels or tags; above the floor.
- `.side-when` (styles/pages/prose.css:1046, .72rem): Above .7rem (.72): out of scope.
- `.toc-num` (styles/pages/prose.css:1089, .6rem): The same list ordinals on a wide screen, already .6rem (the floor).
- `.pr-greek` (styles/pages/psalm-reading.css:33, .64rem): A qualifying note under the verdict, uppercase from the shared rule. It rides on the heading like a tag, but it is a whole sentence, so it is not clearly one; above the floor.
- `.pr-vn` (styles/pages/psalm-reading.css:86, .66rem (font shorthand)): Verse numbers in a 1.7rem gutter: markers, not labels or tags; above the floor.
- `.ps-vn` (styles/pages/psalm.css:97, .66rem): Verse numbers in a 1.8rem gutter: markers; above the floor.
- `.scale-hint` (styles/pages/quiz.css:281, .64rem): A sentence of help text, not a label or tag; above the floor.
- `.scale-hint` (styles/pages/quiz.css:316, .72rem): Above .7rem (.72, from 34rem).
- `.scale-note` (styles/pages/quiz.css:403, .72rem): Above .7rem (.72): out of scope.
- `.amap-group-note` (styles/pages/reference.css:144, .7rem): Already .7rem/600 in sentence case: a note beside the group label. Could be written as the token with no visible change.
- `.quoted-from` (styles/pages/reference.css:557, .72rem): Above .7rem (.72): out of scope.
- `.moment-band` (styles/pages/reference.css:611, .72rem): Above .7rem (.72): out of scope.
- `.moment-ref` (styles/pages/reference.css:643, .64rem): The row that holds the reference chip; its own size now only reaches the "toward …" words after the chip (the chip sets .58 itself). A qualifier riding on the chip, but not clearly a tag, and above the floor.
- `.moment-quote-from` (styles/pages/reference.css:825, .72rem): Above .7rem (.72): out of scope.
- `.tally-read` (styles/pages/reference.css:1141, .68rem): The value beside the field name, in sentence case: not a label or tag in the pattern; above the floor.
- `.sband-meta` (styles/pages/saints.css:61, .66rem): The approved mock-up's .band-meta, unchanged by him: the dates-and-place line under the name on the band. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.sband-credit` (styles/pages/saints.css:63, .74rem): Above .7rem (.74). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.people-count` (styles/pages/saints.css:172, .72rem): Above .7rem (.72). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.pcard-s` (styles/pages/saints.css:261, .74rem): Above .7rem (.74). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.stat-lines li` (styles/pages/saints.css:371, .72rem): Above .7rem (.72). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.tbc` (styles/pages/saints.css:414, .66rem): Carried over from the mock-up's CSS; no markup uses it in the mock-up or the port yet. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.portrait figcaption` (styles/pages/saints.css:437, .74rem): Above .7rem (.74). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.temper-k` (styles/pages/saints.css:445, .56rem): His ruling: leave as is. It shows at .83rem because .temper-b p (more specific) sets the size; the .56 never renders. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.traits-tab` (styles/pages/saints.css:457, .7rem): The approved mock-up's value (.7rem/800), a decorative aria-hidden tab heading the traits box; already at label size. (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.churches li > small` (styles/pages/saints.css:610, .74rem): Above .7rem (.74). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.sources h3` (styles/pages/saints.css:631, .6rem): His ruling: leave as is (.6rem). (saints.css is new and uncommitted: it appeared in the working tree while this audit ran, with the Saints port.)
- `.eyebrow` (styles/site.css:195, .7rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up.
- `.card .meta` (styles/site.css:542, .68rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up. (no element has class "card").
- `.rail-read` (styles/site.css:733, .74rem): Above .7rem (.74). Result page instrument.
- `.rail-poles` (styles/site.css:801, .74rem): Above .7rem (.74). The ends of a scale, but tags are never brought down from .7+. Result page instrument.
- `.rail-poles` (styles/site.css:806, .7rem): Already .7rem (from 48rem, uppercase). Never shrunk. Result page instrument.
- `.depth-poles` (styles/site.css:918, .72rem): Above .7rem (.72).
- `.outcome-meta` (styles/site.css:1019, .7rem): Already .7rem: the score line riding on an outcome name (a tag by role, never brought down from .7). Result page instrument.
- `.tl-span, .pg-note` (styles/site.css:1045, .72rem): Above .7rem (.72).
- `.tl-when` (styles/site.css:1072, .7rem): Already .7rem: a date riding on an entry (tag by role), never brought down from .7.
- `.pg-verses b` (styles/site.css:1121, .66rem): Verse numbers in a 1.6rem column: markers, not labels or tags; above the floor.
- `.tier-rank` (styles/site.css:1139, .7rem): Already .7rem: a rank numeral.
- `.tier-strength` (styles/site.css:1150, .74rem): Above .7rem (.74).
- `.poles` (styles/site.css:1190, .7rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up.
- `.count` (styles/site.css:1201, .7rem): Overridden on its only page: quiz.css sets .count in the display face at clamp(1.05rem, 4.6vw, 1.4rem).
- `.cl-count` (styles/site.css:1356, .68rem): No markup renders this class (checked every .astro/.ts/.md under site/src): a dead rule. Nothing to change; delete it in a tidy-up.
- `.cl-body .cl-meta` (styles/site.css:1397, .7rem): Already .7rem/600, the label values: a status line. Could be written as the token with no visible change.

## Out of scope, noted

- **Games (standalone, generated; edit `demos/*/game.src.html` and rebuild, never the site copies):**
  - sounds-like-scripture.html: 18 rules under .75rem, 6 under .6rem
    - line 254: .band-chip .58rem
    - line 490: .spec dt .58rem
    - line 524: .result-band .big-label .58rem
    - line 540: .versus span .54rem
    - line 565: .miss-tag .52rem
    - line 608: .tile span .55rem
  - who-said-it.html: 15 rules under .75rem, 6 under .6rem
    - line 249: .band-chip .58rem
    - line 445: .spec dt .58rem
    - line 507: .result-band .big-label .58rem
    - line 523: .versus span .54rem
    - line 548: .miss-tag .52rem
    - line 591: .tile span .55rem
- **Share cards** (`ShareBlock.astro`, `PersonalityResult.astro`): drawn on a canvas at 1080px and more; the 21-34px sizes there
  are drawing sizes, not page text.
- **Account emails** (`lib/account/emails.ts`): `font-size:1px` on the hidden preheader and `font-size:0` on the colour stripe
  are email-client tricks, not readable text; the smallest readable line is 13px.
- **Relative sizes inside controls**: `.chip-link small` (1em of .62), `.jump a i` (.9em of .68, about .61rem), `.kr-chip small`
  (1em): part of chips, which keep their own size.
- **Print sheet** `@media print` sizes are in pt (10-11pt), above the floor.
