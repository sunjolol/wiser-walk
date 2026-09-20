# Landscape: Bible games, the daily-game playbook, and corpus-derived concepts

Researched 2026-09-19 for wiserwalk.com. Lens: games only (quizzes and articles are other reports).

Rules I held myself to: every number below was read on the page linked beside it. Where I say
"claims", the site said it about itself. Where I say "could not verify", I looked and did not find
it. Section 5 lists everything I am relying on from memory or could not open.

---

## 0. The short version

1. **The Bible-game field is wide but shallow.** It splits into (a) ad-stuffed trivia apps built on
   hand-written question banks, (b) Wordle clones, (c) memorisation tools, (d) children's
   subscription platforms. Almost nobody is building **corpus-derived** games (where the text or an
   open dataset is the answer key), almost nobody has a **share object**, and almost nobody throws
   off **indexable pages**. Sounds Like Scripture is already unusual on the first count.
2. **The secular playbook is consistent.** One instantly understood mechanic; a spoiler-free share
   object; one shared daily puzzle for the social layer plus unlimited play for the enthusiasts;
   difficulty measured from play, never guessed; and the games that lasted either own their content
   or sit on open data. The ones that died rented their content (Heardle) or were sold to an owner
   that did not need them.
3. **The open-data cupboard is fuller than expected.** A public-domain modern Bible (BSB), 340,000
   cross-references (CC BY), a people/places/events graph (Theographic, CC BY-SA), geocoded places
   (OpenBible, CC BY), word-level speaker data (Clear Bible, CC BY), Greek/Hebrew tagging and
   lexicons (STEPBible, CC BY), and four major museums' art under CC0. Twelve concepts built on them
   are in section 4; the three I would test first are **More or Less**, **Pin the Place** and
   **Crossing Paths**.

---

## 1. Part one: the Bible games that exist, judged honestly

The best single directory I found is faith.tools' games list (about 40 entries, each with platform
and pricing): https://faith.tools/games. I used it as the map and opened the notable ones.

### 1a. Daily word-game clones

| Game | What it is | Observed | Verdict |
|---|---|---|---|
| **Versle** (Toast Apps) | Daily "guess the verse reference in 5 tries", plus five other modes: Scripture Blitz trivia, Blind Bookmark, Crossword, Speed Script, Mosaic | App Store page shows 4.9 stars from 3,800+ ratings; free with Premium at $4.99/month or $28.99/year; updated the day before I looked. https://apps.apple.com/us/app/versle-daily-bible-games/id1668499811 . A search snippet from Google Play said 50k+ downloads; I did not open the Play page. | The most polished of the clones and clearly alive. But note the lesson in its reviews: a recent update cut Scripture Blitz from unlimited plays to one per 12 hours and reviewers are angry about it. **Throttling the fun mode to push a subscription is the visible failure mode of this category.** |
| **Lordle** (Basil Tech, a Christian nonprofit; creator Sang Tian) | Daily: narrow a verse down by testament, book, chapter. Uses the NET Bible. | faith.tools says 950+ daily puzzles, free, no ads: https://faith.tools/app/345-lordle . The site itself (https://lordle.com) is a bare page with an "All Lordles" archive link; I could not see a share feature. | Honest and clean, but it is exactly the "verse-reference Wordle clone" the owner already killed. It rewards knowing chapter numbers, which is back-knowledge, not fun. |
| **Christian Wordle / Bible Wordle** (several) | Five-letter word that happens to be in the Bible | e.g. https://www.biblechallenger.com/word/ shows a verse using the word after you solve. | Slop-adjacent: the Bible is decoration. The game is Wordle with a smaller dictionary. |
| **Biblegram / Versogram** | Daily cryptogram that decodes to a verse | Listed on faith.tools (Biblegram iOS free/subscription; Versogram web, free). Not played. | A real corpus-derived idea (the verse is the answer key) but the cryptogram is a solitary, slow pleasure with no share object I could find. |

### 1b. Trivia apps and sites

- **App-store Bible trivia** is the crowded, low end. Search results for the big ones surfaced the
  same complaints repeatedly: an ad every few questions, unskippable ads, ambiguous questions, and
  wrong answers with no way to report them. One, "Bible Trivia - True or False?", was reported at
  400 thousand downloads (AppBrain snippet, not opened). I did not install these; the pattern is
  from store review snippets via search, so treat it as indicative, not measured.
- **BibleChallenger.com**: one person, running since 2006, 23 games (Millionaire, Jeopardy, Wheel
  of Fortune, Hangman, Asteroids, Wordle, crosswords), claims "over 1,200 unique Bible questions",
  no ads, no account, no payment. https://www.biblechallenger.com/ . Admirable and sincere; the
  games are borrowed TV formats wrapped round a written question bank, and I saw no share feature.
  1,200 questions is the ceiling that a written bank hits; Sounds Like Scripture's pool is already
  wider and cannot be memorised the same way.
- **NeedGod.net Bible Trivia**: chapter-by-chapter, Genesis to Revelation, with difficulty levels
  (faith.tools listing). Structured by the corpus, which is smart, but still written questions.
- **BibleGamesOnline.net, BiblePuzzles.com**: printable-era word searches and crosswords aimed at
  Sunday-school teachers. They rank because teachers search "free Bible word search"; they do not
  spread person to person.

### 1c. Memorisation tools with game skins

Memory Verses ("Scriptle", daily crossword, seven games, free), Versify, VerseLocker, Remember Me
(open source, spaced repetition), Wrinkly Bible Memory, Within (subscription), Bible Pinpoint. All
listed at https://faith.tools/games. These are **tools with a duty loop** (come back because you
ought to), not games with a fun loop. They also sit close to the owner's killed line: they count
something that shades into devotion. Not the lane.

### 1d. Skill games

- **Sacred Type** (https://www.sacredtype.com/): a monkeytype-style Bible typing test by a former
  speedrunner, beta April 2025, ad-free, global and per-passage leaderboards with points handed out
  every 30 minutes, head-to-head challenge against another player's record
  (https://faith.tools/app/11945-sacred-type). This is the only Bible game I found that thinks like
  a competitive game designer. It is also proof the typing niche is taken: BibleType, Bible Typer,
  bibletyping.com and others all exist.
- **Bible Times Bible Game**: a chronological card game with 150 illustrated event cards (iOS and
  Android, free, per faith.tools). This is the Timeline / Wikitrivia mechanic already applied to
  the Bible, with a hand-made deck.

### 1e. Children's platforms

Superbook Kids (CBN, free), Bible App for Kids (YouVersion, free, ad-free, 41 stories), TruPlay
(subscription, ages 4 to 12), Lightgliders (subscription virtual world), Minecraft and Roblox
projects. Well funded, content-heavy, parent-purchased. Nothing here is a lane for a solo builder
and none of it is relevant to a "understand yourself" adult audience. I could not verify subscriber
numbers for any of them.

### 1f. What the field tells you

- **What is fun:** Versle's fast Blitz mode (users played it "multiple times throughout the day"
  until it was throttled); Sacred Type's head-to-head; the tap-to-narrow of Lordle. Speed,
  competition and tapping. That matches what the owner already found.
- **What is slop:** any game where the Bible is a skin on someone else's mechanic (Wordle with Bible
  words, Bible Hangman, Bible Asteroids), and any written question bank with ads between questions.
- **What is missing everywhere:** a share object with a challenge link; permanent pages per answer;
  difficulty measured from play; canon awareness (nobody else lets a Catholic or Orthodox player
  pick their canon); and honest sourcing. Those five are wiserwalk's existing habits. The gap is
  real.

---

## 2. Part two: the secular games that spread by themselves

### Wordle
- **Loop:** six guesses, one word, about three minutes. One puzzle a day for everyone.
- **Share object:** the emoji grid. Crucially, **Wardle did not invent it**: a group of players in
  New Zealand made emoji grids by hand, he saw it and built it in. Growth then went from 90 players
  on 1 November 2021 to over 300,000 by 2 January 2022 and past 2 million soon after.
  https://en.wikipedia.org/wiki/Wordle
- **Retention hook:** scarcity. Wardle said one a day leaves people wanting more.
- **Cold start:** built for one person (his partner), then a family chat, then public. No marketing.
- **Over time:** sold to the NYT in January 2022 for a "low seven figure" sum. In 2024 Wordle was
  played 5.3 billion times, Connections 3.3 billion, Strands 1.3 billion, 11.1 billion puzzle plays
  in all; NYT Games reports over 10 million daily players.
  https://en.wikipedia.org/wiki/The_New_York_Times_Games
- **Lesson:** watch what players do by hand to show off, then build that. And the grid works because
  it shows *the shape of the struggle* without spoiling the answer.

### NYT Connections, Strands, Mini
- **Loop:** under five minutes, one a day, the same puzzle for everyone.
- **Lesson for wiserwalk:** the NYT's moat is now the **bundle**. People open one game and play
  three. A site with four small games and one daily entry point is worth more than four separate
  links. (See concept 12.) Also note Connections is hand-edited every day by a named editor; the
  owner's Golden Chain tried to automate that and it read as "a game for AI". The mechanic was not
  the problem; machine-made categories were.

### GeoGuessr
- **Loop:** dropped somewhere in Street View, guess where on a map, scored by distance.
- **Share object:** a challenge link: same five locations, beat my score. Later, streamers.
- **Cold start:** built in about two weeks by one Swedish consultant, posted to Reddit and Chrome
  Experiments in May 2013, viral at once. https://en.wikipedia.org/wiki/GeoGuessr
- **Retention:** infinite content for free from someone else's corpus (Street View); custom maps;
  daily challenge; later ranked duels and a World Championship (first held October 2023).
- **Over time:** second peak in March 2021 during the pandemic, driven by streamers; 40 million
  accounts by July 2022 (Wikipedia). It moved to a hard freemium wall (free play is rationed), which
  is widely understood to follow from the cost of the Google Maps API; I did not open a source for
  the API-cost claim. Its 2025 Steam release was reviewed "overwhelmingly negative" at launch because
  of the paywall, later recovering to "mostly positive".
- **Lesson:** the owner's instinct (take a corpus that exists, make it a game) is exactly this. The
  difference that favours wiserwalk: **the Bible corpus is free forever.** GeoGuessr pays rent on
  its corpus and had to wall the game. A static site on public-domain text never has to.

### Sporcle
- **Loop:** a clock, a blank list, type everything you can name.
- **Share object:** weak: a score and a link. Its real engine is search and volume.
- **Cold start:** founder Matt Ramme made quizzes himself from April 2007; user-made quizzes came
  later and did the scaling.
- **Numbers:** 500 million plays by April 2011, 1 billion by April 2013, 6 billion by February 2025;
  over 1.6 million quizzes; 1,500+ badges collected over 80 million times; an optional paid tier
  (Orange, October 2016) removes ads. https://en.wikipedia.org/wiki/Sporcle
- **Lesson:** "name all the X" is corpus-derived by nature (the list is the answer key), each quiz is
  a page that ranks for "can you name the ...", and badges count **knowledge**, which is inside the
  owner's rule.

### JetPunk
- Same mechanic as Sporcle, started in 2008 by two brothers as a travel site that added a
  name-the-countries quiz that September and became a quiz site; user-made quizzes from 2011. Search
  snippets put it at over a billion plays by August 2024 (https://en.wikipedia.org/wiki/JetPunk; I
  could not open jetpunk.com/about, it returned 403).
- **Lesson:** one good type-to-fill quiz was enough to pivot a whole site. Clean, fast, no login.

### Worldle (teuteuf)
- **Loop:** a country silhouette, six guesses, each wrong guess returns distance and direction.
- **Share object:** Wordle-style grid with arrows and a percentage.
- **Cold start:** rode the Wordle wave in January 2022; the Washington Post headline in February 2022
  said it was nearing one million users (headline only; the article returned 403).
- **Over time:** the creator turned it into a small studio with a family of daily games and an
  archive mode (https://teuteuf.fr/, https://worldle.teuteuf.fr/archive).
- **Lesson:** the **graded hint** (not right/wrong, but "you are 800 km off, go north-east") is what
  makes a guessing game feel fair and teach something. It transfers directly to a Bible map.

### TimeGuessr
- **Loop:** a photograph; guess where and what year. Five rounds. Made by Gus Owen in Leeds.
- Has a daily challenge, random play, community-made games, Discord/Reddit/Instagram communities
  (https://timeguessr.com). I could not verify its photo sources or player numbers.
- **Lesson:** two-axis guessing (place and time) is richer than one. A solo builder shipped it.

### Framed (framed.wtf)
- One film frame, up to six, guess the film. Daily. https://framed.wtf/ . Could not verify numbers
  or licensing of the stills. **Lesson:** progressive reveal (a harder clue first, easier ones as
  you fail) gives everyone a finish and makes the share grid meaningful. Its weakness is the one to
  avoid: it rents copyrighted content.

### Heardle (the cautionary tale)
- Launched 26 February 2022, bought by Spotify in July 2022, shut down in April 2023.
  https://en.wikipedia.org/wiki/Heardle . **Lesson:** a game on rented content with an owner who does
  not need it dies. Own the corpus.

### Wikitrivia
- **Loop:** a card ("Bosporan Kingdom, created"); place it on a timeline; three lives.
- **Corpus:** Wikidata, entirely automatic. Open source.
- Went viral in January 2022 with coverage in The Verge, VICE, Rock Paper Shotgun.
  https://en.wikipedia.org/wiki/Wikitrivia
- **Lesson, and warning:** the mechanic is superb and fully corpus-derived. Its known weakness was
  **dirty data**: wrong dates made players lose unfairly, and the creator asked players to report bad
  cards. For wiserwalk, a wrong card is a screenshot. Any Bible timeline must use only orderings
  nobody disputes (see concept 1).

### Lichess puzzles (the most important precedent for wiserwalk)
- 6.1 million puzzles, all CC0, **mined automatically from 600 million real games**, more than 100
  years of CPU time. Nobody wrote a single puzzle. https://database.lichess.org/
- **Difficulty is measured, not guessed:** every attempt is treated as a rated game between the
  player and the puzzle (Glicko-2). The puzzle gains rating when players fail it and loses rating
  when they solve it. Players vote on quality.
- **Lesson:** this is precisely the fix for the problem recorded in CLAUDE.md ("blind Opus curators
  guessed 1,796 of 1,800 lines correctly, so a model's guess cannot rank difficulty"). Give every
  line a rating that moves with each answer. It needs only an anonymous counter per item, not
  accounts. It would also give Sounds Like Scripture a true "hard mode" and a player rating that is
  a number worth sharing.

### Monkeytype
- Launched May 2020 by one developer after an abandoned first attempt; posted to Reddit and improved
  in public; open source. **Lesson:** a tiny loop (15 to 60 seconds), instant restart, one number
  (WPM) that is about *you* and that you want to beat. The restart speed matters as much as the
  game.

### The playbook in one table

| Ingredient | Who proves it | Does Sounds Like Scripture have it? |
|---|---|---|
| Understood in five seconds | all of them | Yes |
| Content from a corpus, not written | GeoGuessr, Lichess, Wikitrivia, Sporcle | Yes |
| Spoiler-free share object | Wordle, Worldle | Partly (challenge hash); no grid that shows the *shape* of a run |
| One shared daily set + unlimited free play | NYT, GeoGuessr, TimeGuessr | Unlimited only; **no daily** |
| Graded feedback, not just right/wrong | Worldle, GeoGuessr | No (binary by nature) |
| Difficulty measured from play | Lichess | Not yet (already on the to-do list) |
| A number about me that I want to beat | Monkeytype, Lichess, GeoGuessr | Score yes; a persistent rating no |
| A permanent page per answer | Sporcle/JetPunk (per quiz), Lichess (per puzzle) | Not yet (already on the to-do list) |
| A bundle with one front door | NYT | Two games; no daily front door |
| Owns or freely licenses its corpus | Lichess, Wikitrivia (vs Heardle, Framed) | Yes |

The three "not yet" rows that are cheapest and matter most: a **daily shared set** (same ten lines
for everyone today, built from a date seed, no server), a **share grid** for it, and **reveal
pages**. None needs accounts.

---

## 3. Part three (a): open datasets that can be an answer key

Licence shorthand: PD = public domain; CC0 = no conditions; CC BY = credit required; CC BY-SA =
credit required and anything derived from the data must carry the same licence (this applies to a
derived *dataset*, and is comfortably met by publishing the derived JSON under CC BY-SA with credit;
it does not force the site's code or prose open, but read the licence before shipping).

### Bible texts
| Dataset | Licence | Read at | Notes |
|---|---|---|---|
| **Berean Standard Bible (BSB)** | **Public domain since 30 April 2023**; "Licensing is not required for any use" | https://berean.bible/licensing.htm | Already bundled on the site. The best modern-English answer key available. |
| World English Bible (incl. British edition, deuterocanon) | PD | listed in https://github.com/biblenerd/awesome-bible-developer-resources | Already used in Sounds Like Scripture. |
| KJV, ASV | PD (KJV: Crown rights persist in the UK only; from memory) | same list | Already used. |
| Open English Bible | CC0 | same list | NT complete, OT partial (from memory). |
| SBL Greek NT | CC BY 4.0 | same list | For original-language games. |
| Open Scriptures Hebrew Bible | CC BY 4.0 | same list | |
| scrollmapper/bible_databases | collection of PD translations plus cross-references in SQL/JSON/CSV | https://github.com/scrollmapper/bible_databases | Convenience packaging; check each text's own licence. |

### Cross-references
| **OpenBible.info cross-references** | CC BY | https://www.openbible.info/labs/cross-references/ | About 340,000 links with user votes, derived mainly from the Treasury of Scripture Knowledge. Already known to the project. |

### People, places, events
| Dataset | Licence | Read at | Notes |
|---|---|---|---|
| **Theographic Bible Metadata** | CC BY-SA 4.0 | https://github.com/robertrouse/theographic-bible-metadata | A graph of people, places, periods, events and the verses each appears in. JSON, CSV, Neo4j. Family relations, event participants, place coordinates. Table sizes not stated on the page I read. |
| **STEPBible TIPNR** (Tyndale proper names) | CC BY 4.0 | https://github.com/STEPBible/STEPBible-Data | Every proper name, disambiguated (which Zechariah), with genealogical links and geolocation, from Tyndale House Cambridge scholarship. More permissive than Theographic and better for disambiguation. |
| **OpenBible.info Bible Geocoding** | CC BY (some data from OpenStreetMap under its own licence) | https://www.openbible.info/geo/ | Every identifiable place with **confidence levels**, KML and tab-delimited, about 1,000 place photos mostly from Wikimedia Commons (each photo has its own licence). The maker says plainly there are "almost certainly errors". |

### Speakers
| **Clear Bible speaker-quotations** (MACULA Quotation and Speaker Data) | CC BY 4.0 | https://github.com/Clear-Bible/speaker-quotations and its LICENSE.md | Word-level: which original-language words are inside quotation marks, and who is speaking, using speaker data from Faith Comes By Hearing. Caveats stated by the maintainers: "initial effort"; does not disambiguate same-named speakers; derived from where eight English Bibles put quotation marks. The repo's licence is CC BY 4.0; I could not verify separate terms for the underlying FCBH data. **Relevant to Who Said It? right now.** |

### Words and lexicons
| Dataset | Licence | Read at |
|---|---|---|
| STEPBible tagged texts (TAHOT Hebrew OT, TAGNT Greek NT) and brief lexicons (TBESH, TBESG) | CC BY 4.0 | https://github.com/STEPBible/STEPBible-Data |
| MACULA Hebrew and Greek linguistic datasets | CC BY 4.0 | awesome-bible-developer-resources list |
| Strong's dictionaries, Abbott-Smith, Dodson | PD | same list |
| Open Scriptures Hebrew Lexicon | CC BY 4.0 | same list |
| **Avoid:** ETCBC BHSA (CC BY-NC), Rahlfs LXX (CC BY-NC-SA) | non-commercial | same list. If the site ever carries an ad or an affiliate link these become a problem. |

### Hymns
| Open Hymnal Project | PD or freely distributable hymns, complete scores and texts | http://openhymnal.org/ | Small (hundreds). Could not verify a machine-readable text dump; the 2014 edition is a PDF plus ABC files. |
| Hymnary.org | Full texts of PD hymns are displayed; **no open bulk licence found** | https://hymnary.org/faq | Treat as a reference to check against, not a dataset to ingest. |

### Art (all four verified as CC0 programmes via their own pages in search results)
| Collection | Licence | Read at |
|---|---|---|
| The Met Open Access | CC0 data on all works; 406,000 CC0 images; free JSON API, CSV on GitHub | https://www.metmuseum.org/hubs/open-access , https://github.com/metmuseum/openaccess |
| Art Institute of Chicago | 50,000+ CC0 images; data mostly CC0 (descriptions CC BY); no API key | https://www.artic.edu/open-access/public-api |
| Rijksmuseum | 800,000 object records, CC0 or PD, API | https://data.rijksmuseum.nl/ |
| National Gallery of Art (Washington) | 130,000+ records CC0 on GitHub; about 60,000 CC0 images | https://github.com/NationalGalleryOfArt/opendata |

### Other texts already in the project's hands
The Sounds Like Scripture pipeline already holds verified public-domain files for the Apocrypha,
1 Enoch, the Apostolic Fathers, Augustine, a Kempis, Julian, Josephus. The historic catechisms and
confessions (Westminster Shorter, Heidelberg, Luther's Small, Baltimore, Philaret's Longer) are
public domain by age in their old English translations; I did not locate or verify specific source
files in this session.

---

## 4. Part three (b): twelve corpus-derived concepts

Ground rules applied to all twelve: no written questions; no line composed by a model; nothing on
the killed list (no verse-reference Wordle, no Golden Chain rerun, nothing counting devotion, no
accounts, no percentages between people); instantly understood without church vocabulary; a clock
or a tap; hard enough that players do not learn to always win.

Ranked roughly by my confidence. Per the owner's own lesson from the two rejected builds: **for any
of these, put ten real items in front of him before building a pipeline.** Each concept below can
be hand-pulled to ten items in under an hour.

### 1. More or Less
- **Loop:** two cards: "lion" vs "sheep". Tap the one that appears more often in the Bible. Right:
  the loser slides off, a new challenger arrives, streak +1. Wrong: game over, both counts shown.
  Variants from the same engine: which person is named more, which book is longer, which chapter
  has more verses. The "Higher Lower Game" loop, which is proven and needs no explanation.
- **Answer key:** plain counts over the BSB (PD). For honesty, count by Strong's number using the
  STEPBible tagging (CC BY) so "love" is not muddied by translation choice, and print the basis.
- **Share object:** "Streak 14. I thought 'gold' beat 'silver'. It doesn't." plus a challenge link
  with the same sequence.
- **Pages thrown off:** `/count/[word]`: "How many times is X mentioned in the Bible?" This is one
  of the most-typed Bible questions there is, the existing answers online are inconsistent and
  unsourced, and wiserwalk could answer each with the count per translation, per testament, the
  original-language words behind it, and every verse. Thousands of pages from one script.
- **Biggest risk:** counts differ by translation and by how you treat word forms (love, loved,
  loveth). Must state the rule on every page or a pedant screenshots it. Turn the pedantry into the
  feature: show all the counts.

### 2. Pin the Place
- **Loop:** a verse that names a place is shown ("...and he went down to Joppa"). Drop a pin on a
  blank relief map of the Bible lands. Score by kilometres off; an arrow and distance come back
  (the Worldle graded hint). Five rounds. GeoGuessr's loop on a map people half-know.
- **Answer key:** OpenBible geocoding (CC BY), **using only its high-confidence identifications**;
  verses from BSB.
- **Share object:** five coloured squares by distance band plus total kilometres off; challenge link.
- **Pages:** `/place/[name]`: where it is, every verse that names it, how confident the
  identification is and why, nearby places. "Where is X in the Bible / today" is steady search
  demand. Julian-style fairness carries over as "disputed site" labelling.
- **Biggest risk:** many sites are genuinely disputed (Emmaus, Sinai, Cana). Scoring someone wrong
  against a disputed pin is the unfairness the brand cannot afford. Exclude anything below top
  confidence from the game; keep them on the pages with the dispute stated. Second risk: a map
  library and tiles on phones. A single static image with coordinate maths avoids it.

### 3. Crossing Paths
- **Loop:** two names appear: "Elijah" and "Ahab". Clock running. **Did they ever appear in the same
  scene?** Yes / No. Same fast binary call as Sounds Like Scripture, same clock, new question.
  Hard pairs are easy to generate: people from the same era who never meet (Isaiah and Micah?),
  people centuries apart who do share a scene (Moses and Peter, at the Transfiguration).
- **Answer key:** Theographic's person-to-verse and person-to-event links (CC BY-SA), or TIPNR
  (CC BY). "Same scene" must be defined mechanically (named in the same verse or the same
  Theographic event) and printed.
- **Share object:** score plus the one that fooled you: "Moses and Peter DID meet."
- **Pages:** `/person/[name]` (every person, where they appear, who they appear with, family). "Who
  was X in the Bible" is a huge family of searches. The reveal after each answer links to the verse.
- **Biggest risk:** name collisions (thirty Zechariahs). TIPNR exists to solve this; use its
  disambiguated IDs and show "Zechariah, father of John". Also the CC BY-SA condition on derived
  data if Theographic is the source.

### 4. Before or After
- **Loop:** Wikitrivia's. A card ("The walls of Jericho fall"); slot it into a growing timeline.
  Three lives.
- **Answer key:** Theographic events in narrative order, **restricted to orderings inside a single
  continuous narrative or across books whose sequence no tradition disputes**. No absolute dates
  anywhere in the game.
- **Share object:** longest chain, and the card that broke it.
- **Pages:** `/event/[slug]` with passage, people, place.
- **Biggest risk:** chronology is contested (date of the Exodus, order of Ezra and Nehemiah, Gospel
  harmonies, Job). Wikitrivia's dirty-data problem, with theology attached. Also a hand-made app
  ("Bible Times") already does it. Medium confidence.

### 5. Family Lines
- **Loop:** "Who is Ruth to David?" Tap one of four: mother / grandmother / great-grandmother /
  no relation. Or build-the-tree: drag four names into father, mother, child slots. Tactile.
- **Answer key:** TIPNR or Theographic family relations, each traceable to a verse.
- **Share object:** score; "I had Ruth as David's mother."
- **Pages:** `/person/[name]` family trees (shared with concept 3). "Who was X's father/wife/son" is
  heavily searched.
- **Biggest risk:** the genealogies themselves differ (Matthew vs Luke; Chronicles vs Kings
  spellings). Only ask what one explicit verse states, and cite it in the reveal.

### 6. Same Word?
- **Loop:** two English verses, the same English word highlighted in both ("love", "hell", "world",
  "servant"). **Is it the same word in the original?** Yes / No, on the clock. Genuinely hard,
  genuinely surprising, zero jargon needed to play.
- **Answer key:** STEPBible tagged texts (CC BY): compare the Strong's numbers behind the two
  highlighted words. Entirely mechanical.
- **Share object:** score; "John 21: 'do you love me' is two different words."
- **Pages:** `/word/[strongs]`: the word, its short PD gloss (Strong's / Dodson / Abbott-Smith),
  every verse, how the BSB renders it. Serves "Greek word for love in the Bible" searches.
- **Biggest risk:** it can teach the fallacy that different words always mean different things.
  The reveal must state only the fact (same word / different word) and never say what the
  difference "means". Needs the BSB-to-Strong's alignment; STEPBible tags the ESV (not PD), so
  check whether the BSB's own published tagging tables are usable (could not verify this session).

### 7. Who Was There?
- **Loop:** an event title from the text ("The Transfiguration"). Sixteen name cards. Tap up to
  four who were present. This reuses the one interaction the owner liked from Golden Chain (tap
  four) with a category that is a plain fact instead of a machine-made link.
- **Answer key:** Theographic event participants; every answer checkable against the passage.
- **Share object:** 4 squares, green/grey, per event; five events a day.
- **Pages:** `/event/[slug]` (shared with concept 4).
- **Biggest risk:** "present" is fuzzy (crowds, unnamed people, God). Restrict to named humans the
  passage itself places there. Data completeness in Theographic events was not verified.

### 8. What's in a Name
- **Loop:** a name and four meanings; or a meaning ("laughter") and four names. Fast, on the clock.
- **Answer key:** TIPNR name glosses (CC BY) and Hitchcock's Bible Names Dictionary (1869, PD; from
  memory, not opened this session).
- **Share object:** score and one delightful fact.
- **Pages:** `/name/[name]`: "What does the name X mean in the Bible". Very large, evergreen search
  demand, fed heavily by expectant parents, and the pages that currently rank are thin baby-name
  sites with no sources. **Probably the strongest pure-SEO play on this list**, and it fits "a hub
  for understanding yourself" (your own name).
- **Biggest risk:** Hitchcock's etymologies are Victorian and some are wrong by modern scholarship.
  Cite the source on the page and prefer TIPNR where they differ; do not present one meaning as
  settled when it is not.

### 9. Painted Scene
- **Loop:** a painting fills the screen (Rembrandt, Caravaggio). Which moment is it? Four passage
  options, or progressive reveal from a detail crop outward (Framed's loop).
- **Answer key:** the museums' own titles and subject tags (CC0): Met, Rijksmuseum, NGA, Chicago.
  The Rijksmuseum catalogues subjects with Iconclass codes, which include Bible scenes (from
  memory; verify before building).
- **Share object:** reveal squares; the painting itself is CC0 so the share card can show it.
- **Pages:** `/art/[passage]`: "paintings of the prodigal son" with every CC0 work, museum, date.
- **Biggest risk:** the owner rejected the church-interior guesser, so visual guessing may simply
  not be his game; ask before building. Also Western art skews Catholic/Baroque and the site's
  Orthodox rule forbids icon styling: keep it framed as museum art, not devotion.

### 10. Hymn or Psalm?
- **Loop:** Sounds Like Scripture's exact engine with a new pool: a line appears; is it from the
  Bible or from a hymn? Watts, Wesley and Newton wrote in the Bible's register on purpose, so this
  is hard in the right way.
- **Answer key:** PD hymn texts (Open Hymnal; PD hymnals on Project Gutenberg) vs KJV/BSB, run
  through the existing five-word shingle test to drop hymns that quote Scripture.
- **Share object:** as Sounds Like Scripture.
- **Pages:** `/hymn/[title]`: the text, author, year, and the verses it echoes (via the shingle
  matches). "Is Amazing Grace in the Bible" style searches are real.
- **Biggest risk:** metre and rhyme are a tell. Only unrhymed single lines survive, which may shrink
  the pool badly. Cheapest of all to test: it is a new data file for an engine that exists.

### 11. Which Catechism?
- **Loop:** a verbatim answer from a historic catechism; tap which tradition's it is (Westminster,
  Heidelberg, Luther's Small, Baltimore, Philaret). The Compass audience's game.
- **Answer key:** the PD catechism texts, verbatim, substring-verified like the existing pipeline.
- **Share object:** score by tradition: "I know the Heidelberg best", a result about me, counted in
  knowledge.
- **Pages:** `/catechism/[name]/[question]`, already on the later list in CLAUDE.md, and they would
  finally give tradition pages **real citable sources**, which the project currently lacks.
- **Biggest risk:** fails the owner's "no church vocabulary" test for fun. It is a game for the
  Compass's niche, not the general visitor. Build only if the catechism pages are being built
  anyway.

### 12. The Daily Five (a front door, not a new game)
- **Loop:** one page, new each day, the same for everyone: one item from each live game (a line
  from Sounds Like Scripture, a Who Said It?, a More or Less pair, a pin, a crossing). Ninety
  seconds. Date-seeded, so it needs no server.
- **Share object:** five squares and a time. **This is the missing Wordle layer**: the thing two
  friends can compare because they faced the same five.
- **Pages:** `/daily/[date]` archive with every answer revealed the next day and linked to its
  permanent page.
- **Biggest risk:** needs at least three live games to be worth it, and a daily object was the thing
  that failed twice. The difference is that this one is assembled from games he has already played
  and approved, not a new mechanic.

### What I would do first, and why
- **Now, inside the games that exist:** a daily seeded set plus a share grid for Sounds Like
  Scripture, and Lichess-style measured difficulty (a per-line rating that moves with every answer).
  Both are already implied by the to-do list; the research just confirms they are the two
  highest-leverage pieces of the secular playbook.
- **Next concept to put ten items in front of the owner for:** More or Less (fastest to fake by
  hand, strongest search pages), then Crossing Paths (reuses the engine and the clock he likes),
  then Pin the Place (the closest thing to the GeoGuessr he cited).
- **Shared infrastructure worth noticing:** concepts 3, 4, 5, 7 and 8 all throw off the same
  `/person/`, `/event/`, `/name/` pages. One people-and-places reference layer (TIPNR plus
  Theographic) feeds five games and several thousand indexable pages. That is the "real pages that
  answer questions people type" test met at scale.

---

## 5. What I could not verify or am holding from memory

- Washington Post article on Worldle (403): only its headline ("nears 1 million users", Feb 2022).
- jetpunk.com/about (403): JetPunk figures come from search snippets and Wikipedia.
- Player or download numbers for Versle beyond the App Store rating count; the "50k+ downloads"
  figure is a search snippet of Google Play, not a page I opened.
- App-store trivia complaints are from review snippets in search results; I installed nothing.
- That GeoGuessr's paywall was caused by Google Maps API pricing: widely said, not sourced here.
- TimeGuessr's and Framed's player numbers and image licensing.
- Subscriber numbers for TruPlay, Superbook, Lightgliders.
- Table sizes in Theographic; completeness of its event-participant data.
- Licence of the Faith Comes By Hearing speaker data beneath the CC BY Clear Bible repository.
- Whether the BSB publishes usable Strong's tagging tables (needed for concept 6 and for
  original-language counts in concept 1).
- From memory, not opened: Hitchcock's Bible Names (1869, PD); Rijksmuseum's use of Iconclass codes
  for Bible scenes; KJV Crown rights applying only in the UK; OEB's OT being incomplete.
- Machine-readable availability of Open Hymnal texts and of the historic catechisms.
- I did not play any game interactively; judgments of loop and polish come from the games' own
  pages, store listings, the faith.tools directory and user reviews.

## Sources opened
- https://faith.tools/games , https://faith.tools/app/345-lordle , https://faith.tools/app/11945-sacred-type (via search)
- https://apps.apple.com/us/app/versle-daily-bible-games/id1668499811
- https://www.biblechallenger.com/ , https://lordle.com , https://timeguessr.com
- https://en.wikipedia.org/wiki/Wordle , /The_New_York_Times_Games , /GeoGuessr , /Sporcle , /Worldle , /Wikitrivia , /Heardle
- https://database.lichess.org/
- https://github.com/robertrouse/theographic-bible-metadata
- https://github.com/STEPBible/STEPBible-Data
- https://github.com/Clear-Bible/speaker-quotations (and LICENSE.md)
- https://github.com/biblenerd/awesome-bible-developer-resources , https://github.com/jcuenod/awesome-bible-data
- https://www.openbible.info/labs/cross-references/ , https://www.openbible.info/geo/
- https://berean.bible/licensing.htm
- Museum open-access pages (via search results): metmuseum.org/hubs/open-access, artic.edu/open-access/public-api, data.rijksmuseum.nl, github.com/NationalGalleryOfArt/opendata
