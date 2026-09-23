# Which early Christian thinks like you? (quiz #4, draft 4, awaiting the owner's tap-through)

"And which would argue with you?" prints under the title on the quiz's card and start page (his ruling, 2026-09-23).
The player agrees or disagrees with 23 plain statements. The result names the early Christian whose recorded positions
sit nearest (the kindred spirit) and the one farthest (the sparring partner), each proved by their own words.

- Preview: https://claude.ai/artifact/CByzoDrwBGtVDsxagX4Sj1 (`#example` opens the example result, `#all` the browse
  layer). Rebuild with `node model.mjs && node preview/build.mjs`, then republish that artifact by its URL.
- `research/`: 29 topic files (who held which side of each question, quoted from public-domain translations or the
  original, each quote machine-checked by its researcher against the fetched page), 11 portrait files (34 people:
  stories, temper, real lines, clashes, Wikimedia portraits) and `discovery.json` (disagreements beyond the list).
  The planned independent checker stage was cut at the owner's request (90% weekly usage): verify only what survives
  his review, and then with one agent.
- `table.mjs`: statements -> researched claims, and every person's position on each (+2..-2), with OVERRIDE for changes
  of mind and recodings. `excerpts.json`: the hand-picked display line for every cell (verbatim stretch of the research
  quote; unclear ones hidden but still scored). `people.json`: short dates, who, hook, status notes, real links between
  pairs, topic labels. `model.mjs` writes `quiz.json` from all three.
- `score.js`: likeness = sum over shared statements of (answer - 0.5 x usual answer) x (position - 0.5 x usual
  position), / (count + 3). Centring stops the consensus statements (a good laugh, tears) handing one person to
  everybody: raw agreement gave Augustine 12 of 30 test people; centred, no one has more than 6. Kindred spirit: likest
  among people you share 7+ statements with, never someone at the opposite end on two statements you both hold
  strongly. Sparring partner: least like you among those you clash with more than agree with, 2+ head-on clashes.
- `people-test-1/`: 30 simulated people (players 1-6) and 3 judges. On draft 1 the judges averaged about 4 of 5 for
  fit and fun and 25 of 30 would share. Drafts 2 and 3 applied their fixes: hand-picked whole lines, lines chosen by
  what made the match, a push-back line, the kindred guard, links between pairs, recodings (Basil, Tertullian, Jerome,
  Lactantius), rewording of seven statements, a miracles statement. Draft 3 has NOT been re-tested on new people.

Open for the owner: the statements themselves; old translations (thee/thou) left verbatim; Tertullian and Origen
as results with a status note; share card; SEO pages to propose (a page per early Christian with all their positions;
a page per question: "What the early Church said about war/wealth/lying").

## Draft 4 (2026-09-23, after his first look: "This is great")

- His rulings: old translations stay word for word (plain translations would clutter); Tertullian and Origen stay as
  results because their status is labelled.
- Person pages opened from a result (or after taking the quiz) show the reader's answers against the person's, grouped
  as agree / differ / not sure; browsing without a result shows the pages as before.
- Everyone is ranked on the result (draft 3's seven-answer gate hid about 4 people a sheet; Benedict and Irenaeus
  vanished for 21 of 30 testers). Only NAMING the kindred spirit and sparring partner needs 6 shared answers. Tested
  alternatives he raised: "fewest shared answers" picks whoever wrote least; "most disagreements" counted raw picks
  Jerome or Chrysostom (the most prolific) for almost everyone. Balance of agreement, weighted by strength, is kept.
- Sharing follows the site standard (ShareBlock.astro): a 1080x1350 card in the light palette, the result link
  /r/which-early-christian/<code>/ (the code is the 23 answers in base 5, written in base 36, 11 characters),
  Save the card / Share (only where the phone can send a file) / Copy link, and "Take it yourself" for visitors.
  New, to standardise across every quiz when this is built: the wordmark on the card, and a link preview (1200x630)
  per outcome (22 here: one per kindred spirit), made at build time and picked by the result page, so a pasted link
  shows who you got. Today every result link previews a generic picture.
