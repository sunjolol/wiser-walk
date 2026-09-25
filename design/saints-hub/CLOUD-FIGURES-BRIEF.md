# Cloud brief: the other 16 Bible figure pages

Written 2026-09-25 for a Claude Code cloud session (claude.ai/code) on `sunjolol/wiser-walk`, to run once the first
batch (Elijah, Moses, Gideon, John the Baptist, Martha, Barnabas, Paul) is live on `main`. It writes 16 pages. **Jesus
is not in it**: His page waits for a plan the owner approves first.

## For the owner: how to start it (about five minutes, once)

1. Check your balance at https://claude.ai/settings/usage first, so you know what the session will draw on.
2. Open https://claude.ai/code, choose the repository `sunjolol/wiser-walk`, branch `main`.
3. In the session's environment settings, set **network access to "Full"**. The default list blocks every site
   this job reads (biblehub.com, bereanbible.com, ccel.org, archive.org, oca.org, commons.wikimedia.org,
   upload.wikimedia.org, newadvent.org and others). "Custom" with those domains works too, but "Full" is simpler.
4. Pick the Opus model and paste this prompt:

   > Read `design/saints-hub/CLOUD-FIGURES-BRIEF.md` and do everything in its "For the cloud session" part, all
   > four groups, in order. Push only to the branch `claude/figures-wave-2`. Stop when the report is pushed.

5. When it says it is done, tell the desktop session. It merges the branch, measures each page, renders the share
   cards, looks at the pages and pushes them live.

If it stops part way (usage, or an error), start a new cloud session with the same prompt plus "Continue from the
report: skip every figure it marks done." Each group is committed as it finishes, so nothing is lost.

## For the cloud session

### What you are doing

Each of the 16 people below gets a page at /figure/<slug>/ drawn like the saint pages, to the standard of
`site/src/data/figures/peter.json` (live, and the owner loved it) and the seven pages of the first batch
(`site/src/data/figures/*.json`). **`design/saints-hub/FIGURE-BRIEF.md` is the brief for each page: read it whole,
and everything it tells you to read.** Everything in it holds here, with the differences below.

### Differences from the desktop brief (the cloud has none of the desktop's downloaded texts)

1. **Set up first.** `cd site && npm ci`. Then rebuild the shared texts the brief expects in
   `design/saints-hub/sources/shared/` (that folder is gitignored and is not in your copy; never commit it):
   - `bsb-berean-standard-bible.txt` from https://bereanbible.com/bsb.txt (the whole BSB, one verse a line).
   - The Fathers, as you need them, from CCEL's plain text: `https://www.ccel.org/ccel/s/schaff/<vol>/cache/<vol>.txt`
     for `anf01` to `anf10` and `npnf101` to `npnf214` (the brief lists what is in each).
   - The Roman Martyrology, 1916 English: https://archive.org/stream/romanmartyrology00cathuoft/romanmartyrology00cathuoft_djvu.txt
     saved as `martyrology-1916.txt`.
   - Other calendars only as a page needs them: the Church of England's calendar
     (https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/calendar),
     the Episcopal *Lesser Feasts and Fasts 2022*, the Orthodox day from oca.org and azbyka.ru, the Coptic day from
     copticchurch.net.
   - The deuterocanon (for Judith, Tobit, and the Greek parts of Esther and Daniel) from the World English Bible, the
     quiz's own translation: https://ebible.org/Scriptures/eng-web_vpl.zip (one verse a line; check that the
     deuterocanonical books are in it, and if not use `eng-webbe_vpl.zip`, the British edition, which has them).
2. **The dev server and measuring.** Start the site yourself (`cd site && npx astro dev --port 4321 &`). If a Chrome
   or Chromium is installed, measure each sheet:
   `CHROME=$(command -v google-chrome chromium chromium-browser | head -1) node design/saints-hub/tools/measure-sheet.mjs /figure/<slug>/ 4321`.
   If none is, skip it: the desktop session measures after the merge. Do not render share cards (the desktop does).
3. **The hub card.** None of the 16 has a personality type, so none gets a type box or `typeNote`. Every figure,
   Abraham too, needs its own card picture, `site/public/img/figures/<slug>-card.jpg` (FIGURE-BRIEF.md, Pictures). A figure page joins the Saints
   hub by itself, in the Bible's order (`BIBLE_ORDER` in `site/src/lib/saints/data.ts`); do not edit that file.
4. **CREDITS.md.** Writers still never touch it. After each group, add the group's rows to the "Public domain: Bible
   figure pages" section of `site/public/img/CREDITS.md` yourself, in one edit.
5. **Git.** Work on the branch `claude/figures-wave-2` (create it from `main`). After each group: `cd site && npm run
   test` must pass, then commit that group (message: "Bible figure pages: <names>") and push. Never push to `main`.
   Commit only the files FIGURE-BRIEF.md lists, plus CREDITS.md and the report. Never commit `sources/`.
6. **The report.** Keep `design/saints-hub/research/CLOUD-WAVE-2-REPORT.md` up to date: for each figure, done or not,
   what the page holds, anything left out, any picture or licence doubt, and anything the owner should decide.

### How to work

If you can run subagents, give each figure its own writer (Opus), four at a time, one group at a time; the writer
reads FIGURE-BRIEF.md, researches and writes in one pass, and runs verify-quotes and the saints test until both pass.
Then ONE light checker (Opus) for the group finds and fixes, as FIGURE-BRIEF.md's checks describe: numbers, dates,
feasts and who keeps them, attributions, myths, disputed things in each side's own words, the capitals rule, never
"St" for an Old Testament person, plain short sentences, picture licences. It records what it changed in a
`checker_2026_09_25` block (use the real date) in each facts file. If you cannot run subagents, do the same one
figure at a time. The owner is watching his usage: one writer and one light check per page, no screenshot fleets,
no second audit.

### The four groups, in order

**Group 1: abraham, joseph, david, jonathan**
- **abraham**: rich record (Genesis 11:26 to 25:10; Romans 4; Galatians 3; Hebrews 11:8-19; James 2:21-23). The
  binding of Isaac told plainly. Honoured as a saint in the Orthodox and Catholic calendars (check the Roman
  Martyrology for 9 October and the Orthodox Sundays of the Forefathers). If the page says Jews, Christians and Muslims
  all look to him, cite a reliable source for it.
- **joseph**: the son of Jacob (Genesis 37 to 50), never Joseph of Nazareth; say so in the alias and the answer. Rich
  record. Check the Orthodox day (Joseph "the All-Comely") and the Roman Martyrology.
- **david**: very rich (1 Samuel 16 to 1 Kings 2; the Psalms headed "of David"; Matthew 1; Acts 13:22). Goliath,
  Saul, Jonathan, Bathsheba and Nathan, Absalom, all told as the text tells them, never lurid. Which psalms are "of
  David" is a heading in the text, not a settled question of authorship: each view in its own words. The site has
  psalm pages and a Psalm quiz: a line in `reads` may point to a psalm on biblehub. Check the Roman Martyrology (29
  December) and the Orthodox Sunday after Nativity.
- **jonathan**: 1 Samuel 13 to 31 and 2 Samuel 1 (David's lament). A medium record; the friendship with David is the
  heart of it. If no church keeps a day for him, "Is he a saint?" says so plainly.

**Group 2: daniel, nehemiah, esther, deborah**
- **daniel**: the book of Daniel; the lions, the writing on the wall, the three friends in the furnace (their own
  story, briefly). The Greek additions (Susanna, Bel and the Dragon, the Prayer of Azariah) are in Catholic and
  Orthodox Bibles: quote them from the WEB and say so. When the book was written is argued over: each side in its own
  words. Check the Orthodox day (17 December) and the Roman Martyrology (21 July).
- **nehemiah**: his own memoir (Nehemiah 1 to 13): the cupbearer, the wall in 52 days, the prayer before the king.
  A medium page. Check the calendars; be honest where there is no day.
- **esther** (she): the book of Esther; Purim; God is never named in the Hebrew book (a tidbit); the Greek additions,
  with the prayers of Mordecai and Esther, are in Catholic and Orthodox Bibles (WEB). Check the calendars.
- **deborah** (she): Judges 4 and 5 (her song); Jael; Barak. Medium to thin. Check the calendars.

**Group 3: ruth, hannah, abigail, rahab** (thin records: short pages, never padded)
- **ruth** (she): the book of Ruth; Matthew 1:5. "Where you go, I will go" is her great line.
- **hannah** (she): 1 Samuel 1 and 2; her song and how Luke 1 echoes it (say so only as the Fathers or a reliable
  source do). Not Anna, the mother of Mary.
- **abigail** (she): 1 Samuel 25 and 2 Samuel 3:3. One chapter of story: a short page.
- **rahab** (she): Joshua 2 and 6; Matthew 1:5; Hebrews 11:31; James 2:25; *1 Clement* 12 (ANF 1), which reads the
  scarlet cord as a sign of the Lord's blood: a strong "What others said".

**Group 4: mary-of-nazareth, mary-magdalene, judith, tobit** (the care points)
- **mary-of-nazareth** (she): the owner's rule is the Catholic, Orthodox and Protestant views of her **in their own
  words**, never ours. Scripture first (Luke 1 and 2, the wedding at Cana, the cross, Acts 1:14). Shared by nearly
  all: Theotokos, the Council of Ephesus (431). Where the churches differ (the Immaculate Conception, her perpetual
  virginity and "the brothers of Jesus", the Assumption and the Dormition, asking her prayers): each side from its
  own public-domain text. Schaff's *Creeds of Christendom* (1905) holds *Ineffabilis Deus* (1854) in English and the
  Protestant confessions; for the Assumption (1950) quote the Latin and give our own translation (`"kind": "own"` in
  the evidence, and the page says it is ours). This is the page most likely to be screenshotted: the checker reads
  every sentence on those questions.
- **mary-magdalene** (she): the Gospels (Luke 8:2, the cross, the tomb, John 20). The myth to correct: that she was a
  prostitute (Gregory the Great's homily of 591 joined her to the woman of Luke 7; the 1969 Roman calendar and the
  Orthodox, who never joined them, each in their own words). "Apostle to the apostles" and the 2016 feast; the
  Myrrhbearers; 22 July. Modern claims (a wife of Jesus, the *Gospel of Mary*) only as myths, from reliable sources.
- **judith** (she) and **tobit**: say which Bibles hold the book (Catholic and Orthodox Old Testaments; Protestant
  Bibles leave it out or print it among the Apocrypha; the Thirty-Nine Articles' "for example of life", quoted from
  the Book of Common Prayer). Quote the book from the WEB. Whether the story is history is argued over: each side in
  its own words. Judith's beheading of Holofernes: tell it plainly; the band is her face, not the deed. Tobit: Tobias,
  Sarah, the angel Raphael. Check the calendars for both and be honest where there is no day.

### When you finish

`cd site && npm run test` passes, the report is complete, the branch is pushed, and your last message says which
figures are done and lists the report's owner calls.
