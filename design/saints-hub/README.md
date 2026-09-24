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

## The mock-up (in progress when the session ended)

A tap-through mock-up (the Learn menu, the hub, and St Martin of Tours's page with verified facts) was being
built by workflow `wslprarc9` (run `wf_71c48e9c-b50`) in session `9b93c859`:

- the page: `C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/9b93c859-e9a4-4e65-a8e5-992fee83be6c/scratchpad/hub-mock/site/index.html` (+ `img/`)
- the Martin fact sheet: that workflow's journal, `C:/Users/Light/.claude/projects/C--Users-Light-Desktop-claude-theology-compass/9b93c859-e9a4-4e65-a8e5-992fee83be6c/subagents/workflows/wf_71c48e9c-b50/journal.jsonl` (the `facts:martin` result), and `.../scratchpad/hub-mock/facts/`

**First thing next session:** if those files exist, copy them into `design/saints-hub/mockup/` (the fact sheet
into `research/martin-facts.json`), look at the page once at 390 and 1360 in both themes, fix what is off,
publish it as an artifact (plain HTML page; images as `files`), and show the owner. If they are missing,
rebuild it from this brief. **Show him the mock-up and get his go before building the hub** (his standing
method: mock-up first).

A fact to settle before anything about Martin ships: our notes disagreed on his Orthodox feast day (12 November
in one, 12 October in another). Check the OCA and GOARCH calendars themselves.

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
