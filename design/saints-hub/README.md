# The Saints hub: build brief

Read this whole file before touching the hub. Then read `research/SEARCH-BRIEF.md` and
`research/PEOPLE-AUDIT.md`. Everything here was settled with the owner on 2026-09-24.

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
