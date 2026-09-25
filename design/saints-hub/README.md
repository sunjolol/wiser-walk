# The Saints hub: build brief

Read this whole file before touching the hub. Then read `research/SEARCH-BRIEF.md` and
`research/PEOPLE-AUDIT.md`. Everything here was settled with the owner on 2026-09-24.

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
without the others. Then `node design/og/render.mjs site saint-<slug>` for his share card. When all 22 have moved,
`/early-christian/` itself redirects to `/saints/`.

**The 21 are being researched** to this standard: `design/saints-hub/research/people/<slug>-facts.json` (evidence),
`design/saints-hub/pages/<slug>.json` (the draft page), `design/saints-hub/pages/img/` (pictures), fetched texts under
`sources/people/<slug>/` (gitignored). Each draft is written, then adversarially checked, before it is promoted.

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
