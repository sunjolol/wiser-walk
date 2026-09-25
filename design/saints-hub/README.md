# The Saints hub: build brief

Read this whole file before touching the hub. Then read `research/SEARCH-BRIEF.md` and
`research/PEOPLE-AUDIT.md`. Everything here was settled with the owner on 2026-09-24.

## ALL 22 ARE LIVE (2026-09-25, with his go): edit `main` from now on

`saints/the-21` was merged into `main` (fast-forward to `82030a4`) and pushed. Checked live: all 22 `/saints/<slug>/`
answer 200 and are linked from the hub; every `/early-christian/<slug>` (with or without the slash) and
`/early-christian/` answer 308 to the new address; no built page links an old address. The second checkout
`../wiser-walk-saints` and its `site-saints` launch config are gone (its junctions into `sources/` were unlinked first;
the fetched sources are intact here). Every saint note from now on is an edit to `site/src/data/saints/<slug>.json` on
`main`, pushed after `npm run test` (the branch and the preview link are history). Run `measure-sheet.mjs` against the
`site` dev server (port 4321).

## POLYCARP'S PAGE IS WRITTEN (night of 2026-09-25), LIVE since 2026-09-26 with his go

**His one note (2026-09-26):** the section holding the blessing from his letter (Letter to the Philippians, chapter
12) is titled "A letter he wrote", not "A prayer he wrote": "it's not a prayer". `prayer.title` in the data renames
that section on any page where the passage is not a prayer as such.

He asked for it before bed ("While I sleep, work on Polycarp's full page"). It is the first full page for someone
outside the early-Christian quiz, so the branch also teaches the site to take such pages:
- `lib/saints/data.ts`: a full page whose slug is not one of the quiz's 22 joins the hub by its data file alone,
  placed by the first year of its dates (Polycarp, about 69, before Justin). The hub now counts 31.
- `tools/promote.mjs` also copies the gallery pictures and a card crop of its own (`card.img` under /img/saints/).
- Irenaeus's "Friends, family and rivals" card for Polycarp now links to him.
- No redirects (he never had an /early-christian/ page), no "Where he stood", no personality type, no "People like him".

How it was made: workflow `wf_ad24188c-304` (four Opus researchers: life, words and myths, calendars, pictures; a
writer; three adversarial checkers; a fixer), then the main session applied the third checker's findings (the fixer's
brief was cut off before them), measured the sheet and read the page at 390 and 1360, light and dark. Evidence:
`research/people/polycarp-of-smyrna-facts.{life,words,calendar,pictures}.json` (the `checker_2026_09_26` block in
`.life.json` lists every fix) and `polycarp-of-smyrna.quotes.json` (147 quotations, all word for word; the 1916
Martyrology line is read by eye in a scan).

The page: 12 life moments, 4 stadium wonders plus the pillow and two later legends (marked later), the doubts in the
sources' own words, 8 myths, and three sections of his own: "The letter from his church" (the *Martyrdom* as a
document), "Where the story is argued over" (the Jews in the crowd, 155 or 166, was the letter added to: both sides in
their own words) and "His prayer at the stake" (moved out of "How he died", which it had left 1,100 px lopsided, as
Macrina's last prayer was). About 6,300 words, the longest page on the hub.

Left for him (taste, or his call): the band fresco is 735 x 1182 (under the 1200 px aim; the best face found, CC0,
"probably" Staro Nagoričane as its Commons categories say); the Ravenna mosaic (500s, his name above him) was dropped
because it made the pictures column 400 px too tall and is dark and small; a Wellcome engraving was dropped for its
CC BY licence; the last row of "Friends, family and rivals" (11 cards) and of the two three-panel sections holds a lone
card, as on several live pages; there is no "Apostolic Fathers" filter on the hub yet (he would be its only member).
Merged into `main` with his go ("Polycarp looks good to port live") and checked live: the page, the hub (first of
31), Irenaeus's link, the pictures, the share card and the sitemap.

## THE PERSON SHAPES THE PAGE, NOT THE TEMPLATE (the owner, 2026-09-25): binding, and it overrides any count anywhere

In his words: "Let's make sure we're not adhering rigidly to a template or memifying the entire concept by trying to
force each saint's lives into the same structure, let the knowledge and details of their lives shine through and let
the template be a tool to guide us on how to present the info, rather than the info being funneled into a strict
structure just for the sake of uniformity ... if a saint has more miracles than Martin, or say we have much more
knowledge about their lives ... we shouldn't try to cram that into only 6 life moments if there's genuinely more that
would be presentable, and the same goes for if we know less, not trying to force 6 if we genuinely only have 4 ...
the content within them should adapt to the actual person, not the other way around."

So:
- **The sections stay the same** for everyone (Who was X?, At a glance, What was he like?, What others said of him,
  His life in N moments, His miracles, His words, Often misquoted, Where he stood, Friends family and rivals, How he
  died, Is he a saint?, What to read first, the quizzes, People like him, Sources), each left out when there is
  nothing checked to fill it.
- **What is inside each section is sized to the person's record.** Every number in any brief or prompt ("5 to 7
  moments", "4 traits", "2 or 3 quotations", "3 to 6 numbers") is a rough guide for an average record and NEVER a
  quota or a cap. Augustine's Confessions, Gregory's Dialogues on Benedict, Athanasius's Life of Antony and Gregory
  of Nyssa's Life of Macrina hold far more than Sulpicius's Life of Martin: tell as many moments, miracles, traits and
  lines as the record genuinely makes worth reading (10 or 12 moments is fine where they are good). Where the record
  is thin (Isaac the Syrian, Lactantius), 3 or 4 is right: never pad to match Martin.
- **A person may have a section of their own** where their life calls for it (`extras` in `site/src/lib/saints/types.ts`):
  e.g. Benedict's Rule, Jerome's Bible translation, Augustine's conversion in the garden, Chrysostom's two exiles,
  Boethius's prison book. Use it only for something genuinely central to that person, not to fill space.
- **If the facts file gathered less than the record holds, go back to the sources**: research the rest to the same
  standard (primary text fetched, quotation word for word, source and chapter), add it to the facts file marked
  verified, and then write it. The 1,000 to 1,800 word guide bends too: a rich life can run longer if every part
  earns its place.
- Uniformity where it helps the reader (the same section names, the same look, the same order); never where it
  flattens a life.

## HIS NOTES OF 2026-09-25 (on the live hub and on Clement's preview page): binding for every page

Applied the same evening (the template on `main`, carried to `saints/the-21`):
- **The hub:** no collection cards (the Group filter does their job in less room, and they pushed the list down a
  phone), no line explaining the type chips, no "Or see what the early Church said" line. The Group filter's options
  are `GROUPS` in `lib/saints/data.ts`. The reader's kindred spirit and sparring partner from "Which early Christian
  thinks like you?" are tagged on their hub cards (EarlyMine, moved from the old list).
- **`/early-christian/` is gone:** 308 to `/saints/` (vercel.json, guarded by saints-test.mjs). Its 21 person pages
  stay until the branch merges; their breadcrumbs lead to `/saints/`.
- **The pager is sticky at every width.** Above 68rem the framed sheet's `overflow: hidden` had made it inert; saints.css
  sets `.sheet:has(.sp) { overflow: clip }`. The numbers and pictures beside the facts are NOT sticky (a sticky grid
  item slid over the feast days).
- **"His roles, in order" is balanced on every page**, not only Martin's: where lines wrap, a script in the template
  shrinks the gaps first, then draws each column in to its wrapped words, so the space either side is equal.
- **Friends, family and rivals: cards with a portrait come first**, the data's order otherwise.
- **The status pill stays short: 50 characters at most** (saints-test.mjs). Clement's is "Church Father, not a saint in
  most traditions"; "Is he a saint?" carries the detail.
- **"Is he a saint?": a wrapped status ("Not on the calendar") sits at 1.3rem line height**, with nothing else moving.
- **No odd or ominous asides in plain text** ("Beware 23 and 24 November..." came off Clement's feast note).

## HIS NOTES OF 2026-09-25, THIRD ROUND (Origen to Macrina): binding for every page

- **Book titles are italic** in running text, short forms too ("the *Life*", "the *Rule*", *Britannica*); letters,
  chapters and books of the Bible are not. Mark them `*like this*` in the data; the template reads the marks
  everywhere a title can appear, citations included. `design/saints-hub/tools/italicize.mjs <data dir> [--write]`
  applies the site's list of titles (dry run without `--write`); quotations are never touched.
- **A click opens a picture whole**, on a wide screen only (phones and tablets already show it full width).
- **The path is centred:** evenly spaced dots, each step centred under its dot.
- **How he died:** the later story goes on the right, under the last words.
- **"Doubted from the start" fills the empty cell** beside an odd last wonder.
- **The miracles' opening quotation stands 15px clear** of the dark panel under it.
- **Plain words for the facts too**: "kept what he heard read" was unclear; say what the source says.
- **A person with a personality type keeps the pictures column short** (Antony: the type box must not be pushed
  far down); extra art there only if it truly fits.
- Cyprian's tile reads "100k", not "100,000".

## HIS NOTES OF 2026-09-25, SECOND ROUND (Justin, Irenaeus): binding for every page

- **"His path, in order"**, never "roles" ("calling 'Martyr' a role is odd"). The data key stays `roles`.
- **Every number tile makes sense on its own.** The chip says exactly what is counted ("Gospels he defended", not
  "Gospels"); the lines finish the thought. No number about someone else (Pothinus's age on Irenaeus's page), no award
  ordinal ("37th Doctor"), no year dressed up as a statistic ("1904"), no padding. Two or three strong tiles are fine.
- **The numbers column is filled with "Did you know?"** (`tidbits`), not forced numbers: short, surprising, sourced
  facts that the page does not already tell, under the numbers in the same dark column, down to the facts' height.
- **More art on wide screens** (`gallery`): where the pictures column ends above the facts, more pictures of the person,
  as many as fit without making the sheet taller; phones show the portrait alone. Public domain or CC0, never a
  picture the page already shows.
- **Traits: the taller of each desktop row on the left**, above all in the row over a lone last trait.
- Measure with the session tool `measure-sheet.mjs` (`design/saints-hub/tools/measure-sheet.mjs <slug> [port]`): the numbers and
  pictures columns end within about one item of the facts, never below them.
- **Polycarp goes in the next batch of full pages** (the owner: "a MASSIVELY important figure and VERY interesting",
  prompted by Irenaeus's page). He is already named in the plan's list of most-searched missing saints; he now leads it.

## What the owner asked for (his words, 2026-09-24)

> "would it be best to add them to this page, which is tied to a quiz ... Or would it be better to make a new
> page and give each saint a more well-rounded info page that covers more than just the categories the quiz
> covers? That's my leaning and I could see it working as a new menu tab where we change the 'Articles' menu
> item to 'Learn' ... with the goal of basically making this a hub for all of the saints so users can learn and
> expand their knowledge ... an easy way to explore their different personalities (almost like stat sheets in a
> game, which I'd find fun, but obviously in a respectful way), their statements and viewpoints, and other
> strong/engaging/interesting tidbits that enhance the user experience and give a delightful learning
> experience, making the learning interesting and fun rather than a slog through dozens of books ... presented
> beautifully, with a great user experience and interface design that makes browsing their pages fun and
> engaging, while ALSO focusing HARD on SEO ... become THE place for learning and growing in wisdom in a fun way"

He said: "I really want to make sure we nail this right from the start and do it right."

## Decisions (all four "yes", 2026-09-24)

1. **Menu:** "Articles" becomes **"Learn"**: Articles, Saints and early Christians, What the early Church said
   (the existing `/early-church-on/`), Compare traditions.
2. **One page per person at `/saints/<slug>/`.** The 22 `/early-christian/<slug>/` pages move into the hub now,
   with permanent (301/308) redirects through the Vercel adapter, their quiz content folded in as the
   "Where he stood" section. `/early-christian/` itself redirects to `/saints/`. Link internally straight to the new
   URLs, never through a redirect. `/figure/<slug>/` STAYS the home of Bible people; the hub links to it.
   `/personality-type/` stays. `/early-church-on/<topic>/` stays for now (see the search brief, section 4).
3. **First wave:** the 22, plus everyone the personality test names who has no page (Abba Arsenius, St Monica,
   St Cuthbert, St Guthlac, St Philip Neri). Isaiah, Jeremiah and Mary of Bethany become `/figure/` pages.
   Then the most searched missing saints: Athanasius, Ignatius of Antioch, Polycarp, Moses the Black (a film
   came out in 2026), Perpetua, Ephrem. Later: Nicholas, Patrick, group pages.
4. **A printable saint card**, like a trading card: he loves it. Do it alongside the per-saint share image the
   pages need anyway ("if it's more efficient to do it with the other tasks, we can go ahead"), not as a
   separate pass. Real facts only, no stats.

Also settled that day: young Augustine STAYS a Spark saint (though he is also in the Spark's opposite pair).

## The plan he approved

`PLAN.html` (published: https://claude.ai/artifact/7fShwzxWddzEQBn5zyqM3i). In short:

- **Each saint page:** a picture band; H1 the plain name; a 40 to 60 word "Who was X?" answer near the top; THE
  SHEET (quick facts in the spirit of the character-sheet skins the site's look came from: born and died,
  where, roles, other names, feast days East and West side by side with the Old Calendar note, saint in which
  churches, patron of (sourced), how to know them in art, temperament in Gregory's words, their type in our
  test labelled as our reading); then "What was he like?", "His life in N moments", "In his own words",
  "Often misquoted", "Where he stood", "Friends, family and rivals", "How he died", "Is he a saint?", "What to
  read first", "Keep going" (quizzes, people like him), sources.
- **The hub `/saints/`:** H1 "Saints and early Christians", search, filters (group, century, East or West,
  personality type), person cards, "Start here" group cards.
- **Group pages** `/saints/<group>/`: church-fathers, desert-fathers, cappadocian-fathers, great-teachers,
  apostolic-fathers, martyrs, women, east-and-west, quiet (and later struggles pages linked to the sins quiz).
  A build check: no group slug may equal a person slug.

## The mock-up (DONE 2026-09-24; awaiting his look)

Published: **https://claude.ai/artifact/2XipDT23JpGHU1kYKi7VX9** (source in `mockup/`, images in `mockup/img/`).
Three tabs: the Learn menu, the hub (real people and portraits, working filters), and St Martin of Tours's page
built only from `research/martin-facts.json` (every item sourced; quotations checked word for word against
Roberts's unrevised 1894 translation on CCEL). The "stat sheet" uses sourced numbers only (15, the age he
enlisted; 26, years a bishop; 80 disciples; 81, his age by Gregory of Tours; 3, days to burial), never ratings.

**Draft 1 was reviewed on 2026-09-24; draft 2 is published (see the next section).** Ask what he thinks of draft 2
and of the miracles proposal. Build nothing until he says go. Open items from the fact sheet (`could_not_verify`): GOARCH blocked the checker (the Greek 12 November
is confirmed from synaxarion.gr and saint.gr instead); the ELCA listing; patronages beyond France, soldiers and
tailors; the goose as an art attribute. The Eastern icon in the mock-up (Petit Palais PPP4870, CC0) is not yet in
`site/public/img/CREDITS.md`.

Martin's Orthodox feast, settled: churches differ. Greek synaxaria keep 12 November; the Russian Church keeps
12 October on the old calendar (25 October civil); the OCA keeps 11 November and also lists 12 October, calling
the October date an error. So "East" is never one date: print each church's own.

## PORTED 2026-09-25: what is live, and how a saint moves

**His answer to the one open question (2026-09-24, late):** the other 21 early Christians stay at
`/early-christian/<slug>/` until each has a new page to Martin's standard; each moves only then.

Live now (the port checklist below, items 1 to 4 and 6 to 8):
- **Kit:** `--fs-label`, `--fw-label`, `--fs-tag` in `site/src/styles/kit.css`; about 107 small-text rules across the site
  moved onto them by the two-size rule (the audit and every call: the session's scratchpad `small-text/`), the games too;
  `site/scripts/small-text-test.mjs` fails the build on anything under .6rem outside a short allow-list of drawings.
- **Menus:** "Articles" is "Learn"; every item in every header menu is a name plus one plain line (quizzes and games
  carry theirs in a `menu` field). The footer's third column is Learn.
- **The hub** `/saints/` and **Martin** `/saints/martin-of-tours/`, drawn by a template from data:
  `site/src/pages/saints/[slug].astro` + `site/src/data/saints/<slug>.json` (shape: `site/src/lib/saints/types.ts`).
  Martin's reader's-own-answers marks on "Where he stood" carry over from the old page. Share cards `saints` and
  `saint-<slug>` (design/og/cards.mjs reads the data files).
- **Links:** `lib/person-links.ts` now links every person the personality test names who has a page (a full saint page,
  an early-Christian page until he moves, or a Bible figure page). Quiz results, person and question pages go straight
  to `/saints/` for anyone who has moved.

**How a saint moves (the whole procedure):** his checked data file goes into `site/src/data/saints/<slug>.json` (after
`node design/saints-hub/tools/verify-quotes.mjs <slug>` exits 0 on the machine holding the fetched texts), his pictures
into `site/public/img/saints/` and `CREDITS.md`, his slug into `MOVED` in `site/src/lib/saints/moved.ts`, and two 301s
into `site/vercel.json` (with and without the closing slash). `npm run test` (saints-test.mjs) refuses any one of these
without the others. Then `node design/og/render.mjs site saint-<slug>` for his share card. `/early-christian/`
itself already redirects to `/saints/` (his note of 2026-09-25).

**The 21 are being researched** to this standard: `design/saints-hub/research/people/<slug>-facts.json` (evidence),
`design/saints-hub/pages/<slug>.json` (the draft page), `design/saints-hub/pages/img/` (pictures), fetched texts under
`sources/people/<slug>/` (gitignored). Each draft is written, then adversarially checked, before it is promoted.

**THE 21 ARE WRITTEN AND ON A PREVIEW (2026-09-25).** All 21 were researched, written and adversarially checked
(workflow `wf_2f636304-590`: 63 agents, about 400 corrections; every quotation passes verify-quotes.mjs). They are
promoted on the branch `saints/the-21` (NOT main), previewed at https://wiser-walk-git-saints-the-21-sunjo.vercel.app/saints/
(behind his Vercel login). The per-page verdicts and open items are in the session scratchpad (verdicts.json) and in each
`research/people/<slug>-facts.json` ("checker_2026_09_25" blocks). A second small pass (`wf_a47f9760-59a`) adds the
critics' own words where a hard topic had only the holder's (Justin, Antony, Jerome, Augustine, Isaac, Chrysostom).
**Waiting on him:** length (pages run 2,800 to 6,400 words), Benedict's band (a small figure in a landscape),
Macrina's band (a statue photographed against the sky), whether /early-christian/ itself now redirects to /saints/.
Merge the branch to main only with his go.

**IF THE SESSION WAS CUT OFF (usage cap, 2026-09-25):** the port is committed locally as `39e1467` and NOT pushed
(the visual check of the small-text sweep had not reported yet: re-run it, then push). The research on the 21 ran as
workflow `wf_2f636304-590` (research, write, adversarial check per person). To continue it without redoing finished
agents: `Workflow({ scriptPath: "C:/Users/Light/.claude/projects/C--Users-Light-Desktop-claude-theology-compass-site/11721607-af0d-45f4-b7cb-e943d638c835/workflows/scripts/saints-deep-pages-wf_2f636304-590.js", resumeFromRunId: "wf_2f636304-590" })`
(same session only; in a new session, re-launch the same script with the same 21 people as args: finished work is
on disk as `research/people/<slug>-facts.json`, `pages/<slug>.json` and `pages/img/`, and a researcher told to
start from an existing facts file saves most of the cost).

## APPROVED 2026-09-24: PORT IT LIVE (the next session does this)

After his final pass he said "Looks great". The mock-up (`mockup/src/`, published link above) is the spec. The port:

1. **Kit first.** Put `--fs-label` (.7rem), `--fw-label` (600) and `--fs-tag` (.6rem) in the site's tokens; move the
   site's existing small labels onto them by the two-size rule below; add a build check (like
   `scripts/quiz-page-test.mjs`) that fails on readable small text under .6rem.
2. **Header:** "Articles" becomes **"Learn"** (Articles, Saints and early Christians, What the early Church said,
   Compare traditions). **Every** header menu gets the two-line items (a name plus one plain line), Quizzes and
   Games too.
3. **`/saints/`:** band with the portrait wall and search, collections, the filter bar (phone sheet, desktop pills,
   picks written into the address like the articles page's `#topic=`), the people grid, the quiz card.
   CollectionPage + ItemList.
4. **`/saints/martin-of-tours/`:** the whole mock-up page (pager, sheet, numbers, feasts, miracles, words, often
   misquoted, where he stood, death, is he a saint, read, quizzes, people like him, sources). Article with `about`
   Person and `sameAs`, BreadcrumbList, its own share card. Pictures into `site/public/img/saints/` and
   `CREDITS.md` (the Petit Palais icon is not credited yet). Data: `research/martin-facts.json` and
   `research/martin-miracles.json`.
5. **The other 21:** 301 `/early-christian/<slug>/` to `/saints/<slug>/` and `/early-christian/` to `/saints/`
   (Vercel adapter redirects), in the same template, filled only with what is checked today. A section with no
   checked data is left out, never faked. Each then gets Martin's depth, researched and checked the same way.
   **Ask him which way first** (see CLAUDE.md "NEXT SESSION STARTS HERE").
6. **Switch the links:** `lib/person-links.ts`, `lib/mine.ts`, `EarlyLine`/`EarlyMine`, `strategies/kindred.ts`,
   the early-Christian quiz's `outcomePathBase` ('saints'), `lib/seo.ts` cards, the sitemap, then an IndexNow ping.
7. **Checks:** `npm run test`, the quiz-page and SEO tests (extend the 30 to 70 word "In short" check to
   `/saints/*`; add "no group slug equals a person slug"); every new page at 390 and 1360, light and dark.
8. **Not ported:** the mock bar and tabs, the "not live" toasts, the `?theme=` test hook, the SERP preview.
9. Small-text cases he never ruled on (hub card dates, the "Confident" chips, the sources under the numbers): he
   approved the page as it stands, so they stay as they are.

## Draft 2 of the mock-up: his 14 notes, now rules for EVERY saint page (2026-09-24)

He read the whole Martin page ("so engaging I read the whole thing ... I constantly found myself saying 'wow' out
loud") and gave 14 notes. All are applied in draft 2 (same link, version 2; source now lives in `mockup/src/`,
rebuild with `node mockup/src/build.mjs`). They bind every person page:

1. **The band picture shows the face at every width.** One crop point per painting (`--pos-m` phone, `--pos-d`
   wide), checked at 320 to 390. Draft 1 cut Martin's head off on phones.
2. **Page navigation is the sticky pager** from the personality result (previous, the section you are in, tap it
   for every section, next), WITHOUT the progress bar: this is not an article or a result. Never a sideways chip row.
3. **"His roles, in order" is a path**: down the page on phones, across it on wide screens, one short line under
   each role. It must never wrap into a jumble and must not look missable.
4. **Quick facts put the label above the text**, full width, at every size (he was unsure about desktop; stacked
   looked right there too).
5. **Boxes run nearly edge to edge on phones** (6px from the screen edge), so the text inside gets the width.
6. **Labels in plain words**: "Pronounced", never "Say it".
7. **Feast days in calendar order** within West and within East.
8. **"In numbers": the label chip on top, then the number in #F4B991 (`--orange-soft`), then "+" lines.** Only numbers
   people care about: "3 days to burial" was padding and is gone (now "Raised the dead 3" and "At his funeral 2,000").
   His sentence about #F4B991 was cut off ("looks decent, but feels"): ask him how it ends.
9. **"His personality type"**, never "The test's reading", with "Our reading, from the Christian Personality Test".
10. **Plain words in our own voice**: "Sulpicius says he heard this from Martin himself", not "had this from Martin's
    own lips".
11. **No width caps on short lines** (ledes, captions): they wrapped on desktop. Same rule as the quiz pages.
12. **The "Who was X?" box has one blue edge**, no orange half.
13. **No small label (kicker) above any section title.** Labels inside a section ("Before a battle near Worms",
    "East and West, side by side") stay.
14. **Miracles get their own section when the sources record them** (his idea: "that's the super interesting stuff
    everyone wants to hear about"). Built into draft 2 as a PROPOSAL for him to judge: Sulpicius's promise, "3 raised
    from the dead" on a dark panel (each with where, who saw it and the line), four more wonders, and "Doubted from
    the start" (in the sources' own words). Told as the source tells it, quoted and cited, never hedged in our voice.
    Data: `research/martin-miracles.json` (adversarially checked: six fixes, all 14 quotations word for word).
    Rule 8 of the quiz pages also applies: "Tap" only on touch screens, "Click" with a mouse.

Also resolved in draft 2: the ELCA keeps 11 November; "MAR-tin of TOOR" (Merriam-Webster); the 1916 Martyrology's
own footnote defines "birthday" as the day a saint enters heaven. Sources in `research/martin-miracles.json`
(`checked.open_items_resolved`). No "[checked before launch]" marks remain.

## Draft 3 (same link, version 3), his second round (2026-09-24)

- **The Learn menu's two-line items (a name plus one plain line) go to EVERY header menu when the hub goes live**
  (Quizzes and Games too). He liked it.
- "Christian Personality Test" in The Oak card is a link, same window (a page on our own site; new tabs are only for
  links that leave the site, and for the result-page popups' labelled pills).
- The sources under the numbers are a little brighter (#A9A59F) on the lighter tiles.
- On wide screens "His roles, in order" sits in the middle of its box, equal space either side (columns sized to
  their words, `justify-content: center`), and still left-aligned inside.
- Small text follows the two sizes below. He will take one final visual pass, then it ports live.

## The hub's filters, redesigned (his note, 2026-09-24)

He found the four rows of chips "unusable on mobile": they ran off the screen and took far too much space. Now,
in the pattern the best listing sites use:

- **One bar** that stays in reach (sticky) while the list scrolls, with the count on its right ("8 of 38").
- **Phones:** a "Filters" button (a badge counts what is picked) opens a sheet from the bottom: each kind under its
  label (label size), the options as chips, "Clear all", and "Show N people", which closes the sheet on the results.
- **Wide screens:** one pill per kind (Group, Lived, East or West, Personality type) opens a small panel with the
  same chips, "Clear" and "Done".
- **Several picks in one kind widen the list; picks in different kinds narrow it.** Every option shows how many
  people it would leave, and an option that would leave none is greyed out, so no one lands on an empty page.
- What is picked (and a search) shows as chips under the bar, each with a cross, plus "Clear all".
- A collection card starts the list afresh on its group.
- At go-live: put the picks in the address (`/saints/#group=martyrs`, as the articles page already does with
  `#topic=`), so the group pages and other pages can link straight to a filtered list.
- The old row labels (Group, Lived...) became the sheet's group titles, at the label size he agreed to.

## SMALL TEXT: TWO SIZES (his soft rule, 2026-09-24, for the whole site)

He set these by hand ("this is the exact type of issue that becomes a massive pain to fix if you regress") and asked
for a pattern so he adjusts less. The pattern in his own choices:

- **Label, `--fs-label` (.7rem) at weight 600 (`--fw-label`):** text a reader reads on its own. A field name
  (Born, Died), the label that heads a box or card ("Who was Martin?", "His roles, in order", "Often said", "What
  the sources say", "West", "Quiz"), an author or source line, a citation.
- **Tag, `--fs-tag` (.6rem), weight unchanged:** text that rides on something bigger beside it. A chip or pill (on
  a number, a card, a menu item: "New"), a date or "As a monk" beside a heading, the two ends of a scale, a sub-label
  sitting over a row of chips.
- **The floor:** nothing meant to be read goes below .6rem. Only text inside a drawing (the month on a calendar
  leaf) may. Buttons keep their own sizes (pills .72rem, filter chips .62rem).
- **Always the tokens, never a raw size**, so one line changes them everywhere. At go-live the tokens move into
  `kit.css` and a build check (like `scripts/quiz-page-test.mjs`) fails on any small uppercase text under .6rem
  outside the drawing list.
- His list, applied exactly: labels `.facts dt, .read .by, .cite, .qcard-k, .churches b, .lastwords .k,
  .myth-t b, .myth-k, .feast-col h4, .feasts-h p, .path-k, .answer h2, .portrait figcaption b`; tags `.scale-ends,
  .rz-when, .mo-when, .stat-chip, .gchips-k, .tchip, .navmenu-tag`. The number chips got letter-spacing .09em so
  "Raised the dead" stays on one line at 375.
- **His rulings on the cases the pattern raised (2026-09-24):** labels too, as he had meant: `.st-topic` ("On
  laughter"), `.later b` ("A later story", "Doubted from the start"), `.qf-k` ("Before a battle near Worms").
  **Leave as they are:** `.temper-k` ("His personality type", which shows at .83rem because `.temper-b p` sets it)
  and `.sources h3`. So the pattern is a strong default, not a law: he may keep a heading bigger or a list heading
  smaller. **Still open** (shown to him with a picture): `.frow-l` (the hub's filter names, Group / Lived / East or
  West / Personality type), `.pcard-d` (dates on the hub's cards), `.gchips li` ("Confident"), `.stat-src`.

## Rules that bind every page (from CLAUDE.md, memory and the research)

- Real data only. Every fact has a source. Every quotation word for word from a public-domain translation,
  checked by script against the fetched text (case-insensitive, because of the capitals rule), with work,
  section and translation. `research/PEOPLE-AUDIT.md` marks what is verified (V), researcher-checked only (R),
  or Wikidata (W, unverified and sometimes wrong). Nothing R or W is published without a checking pass.
- Both calendars on every page (Catholic, Orthodox, and Anglican/Lutheran where they keep one), checked against
  the churches' own calendars.
- Honest status lines: "Church Father. Not counted a saint." for Origen, Tertullian and Lactantius; never "St"
  for them; Bible people are "honoured as a saint in the Orthodox and Catholic calendars", never simply "St Moses".
- Hard topics stated plainly in both the holders' and the critics' words (Chrysostom's Against the Jews,
  Nyssa's universalism, Jerome on women, Tertullian's Montanism). Hiding them fails a discernment audience.
- No invented ratings, no scores against a person, no tier lists, no prayers to saints or novenas (count
  knowledge, never devotion). A prayer the saint actually wrote is fine.
- Plain short sentences; no section numbers or § marks shown to readers; capitals for every pronoun for God.
- Pictures: public domain or CC0 (check each Commons tag; modern icons are usually still in copyright). Scans at
  least 1200 px wide where possible (today's portraits are about 500 px). Credit in `site/public/img/CREDITS.md`.
- Titles use the searched form of the name ("Augustine of Hippo", never "St Augustine" alone: that is the
  Florida city; "Jerome" alone is Jerome Powell). Vary the hook per person. No FAQPage markup (Google dropped
  FAQ rich results on 7 May 2026); use Article with `about: Person` and `sameAs` to Wikipedia and Wikidata
  (QIDs in `research/wikidata-qids.json`), BreadcrumbList, CollectionPage and ItemList on hubs.
- 1,000 to 1,800 words unique to each person. Fewer, deeper pages beat many thin ones.
- The site's design language (kit.css, the Riche pass, phone-first, 390 and 1360, light and dark) and every
  rule in CLAUDE.md's "Rules for every quiz page" that applies.
- Build scripts must survive a fresh clone without gitignored inputs (the failed-deploy lesson): `sources/` is
  gitignored here, so no build script may read it.

## Links waiting for the hub

`site/src/lib/person-links.ts` returns null for everyone on purpose (the owner: don't link to /early-christian/
or /figure/ now, "we'll just need to re-do that again later"). Every saint card, opposite pair and name in the
personality test is already built to take a link. When `/saints/` exists, return `/saints/<key>/` there (keys
are the picture keys, which match the slugs) and `/figure/<slug>/` for Bible people, and every card follows.
Also update: `lib/mine.ts`, `EarlyLine`/`EarlyMine`, `strategies/kindred.ts`, the early-Christian quiz's
`outcomePathBase`, `lib/seo.ts` (og cards), the sitemap, and send an IndexNow ping.

## What is in this folder

- `PLAN.html`: the plan he approved.
- `research/SEARCH-BRIEF.md`: what people search, who ranks, what a winning page needs, URLs, naming, guardrails.
- `research/PEOPLE-AUDIT.md` + `people-audit.json` (80 people, every dataset that mentions them) + Wikidata
  dumps (`wd-*.json`, `title-qid.json`, `wikidata-qids.json`) + `wikipedia-views.json`.
- `research/kindred-research-*.json`: the verified candidate research behind the Oak, Hearth and Spark saints,
  including strong runners-up worth a page (Willibrord, Thomas More, Columba, Francis of Assisi, Dominic, Pambo,
  Paphnutius), each with checked quotations and sources.
- `sources/` (gitignored, local only): the fetched texts behind the personality test's saints and today's
  research, for re-checking quotations. Some are copyrighted translations: never commit them.
