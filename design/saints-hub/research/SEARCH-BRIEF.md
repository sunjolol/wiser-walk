# Research brief: the Saints and early Christians hub on wiserwalk.com

## Bottom line
1. **Search demand sits in the long tail, and the pages that rank today are weak there.** Short queries like "st augustine" belong to parishes, schools, a Florida city and Jerome Powell. What a page can win is the informational tail: quotes with a source, feast days in both calendars, "is X a saint in the Orthodox Church", "how did X die", character traits, lists of groups, and saints who struggled with a particular sin.
2. **Nobody covers what this site already has.** Rival pages list the Western feast date only or the Orthodox one only. Their quotations mostly carry no source. None of them has an honest personality angle.
3. **Give each person one page at `/saints/<slug>/`.** 301 the 22 `/early-christian/<slug>/` pages there now: they went live on 2026-09-23, so moving them costs almost nothing. Keep `/figure/` as the page for Bible people. Keep `/personality-type/` as it is.
4. **FAQ rich results are gone** (stopped showing on 7 May 2026). ProfilePage and carousel markup do not fit this kind of page. What still pays: Breadcrumb, Image metadata, Article with `about: Person` plus `sameAs` links to Wikipedia and Wikidata, and a short answer block near the top of each page.
5. **Name:** "Saints" in the menu. "Saints and early Christians" as the hub's heading. Every person who is not counted a saint gets a status line on their card and page.

## 1. What people search, grouped by intent
Sources: Google and Bing autocomplete for 381 seed queries, plus Wikipedia pageviews for the last 12 months (Sep 2025 to Aug 2026). Pageviews are a rough guide to demand, not search volumes.

| Intent | Evidence (autocomplete) | A page per saint answers it? |
|---|---|---|
| Who they were, facts, character | "st benedict character traits and virtues", "st augustine personality type", "st jerome bad temper", "what is st john chrysostom best known for", "who was st patrick really" | Yes. Headline section |
| Death | "how did polycarp die" (8 Bing variants), "ignatius of antioch cause of death", "how old was saint augustine when he died" | Yes. Quick facts plus a short section |
| Feast day, both calendars | "st augustine feast day orthodox", "john chrysostom feast day orthodox" and "…catholic", "st martin of tours orthodox feast day" | Yes. Quick facts |
| Status, East and West | "is augustine a saint in the orthodox church" (10 variants), "is origen a saint (catholic/orthodox/coptic)", "why is tertullian not a saint", "why was clement of alexandria removed as a saint", "is boethius a saint" | Yes. "Is he a saint?" section. This is the site's best edge |
| Quotes | "\<name\> quotes" for nearly every name, "augustine quotes on grace/predestination/free will", "restless heart augustine quote source/context" | Yes, with a source for every line |
| Writings | "\<name\> books/writings/pdf", "rule of st benedict summary", "best church fathers to read first" | Yes. "What to read first" with free links |
| Pronunciation | Augustine of Hippo, Chrysostom, Irenaeus, Athanasius, Boethius, Lactantius, Tertullian, Cyprian | Yes. One line in quick facts (cheap to win) |
| Nicknames and titles | "why was st john chrysostom called golden mouth", "athanasius contra mundum meaning" | Yes. Small facts |
| Relationships | "augustine and monica/ambrose/jerome", "basil and gregory friendship", "were basil the great and gregory of nyssa brothers" | Yes. The existing `pairs` data covers this |
| Controversies | "john chrysostom against the jews", "gregory of nyssa universalism", "st jerome quotes on women", "augustine of hippo ethnicity", "was anthony the great black" | Yes. Plainly, with sources |
| Images | "\<name\> icon" on most Eastern names | Yes. Portraits carrying Image metadata |
| Group lists | "early church fathers list in order/chronological", "list of desert fathers and mothers", "who were the three cappadocian fathers", "apostolic fathers names", "four great doctors of the latin/eastern church", "early christian martyrs list", "early christian women saints", "early church fathers timeline" | No. Group pages |
| Quizzes and personality | "which saint are you quiz" (+ catholic/female/orthodox), "which church father are you quiz", "saint personality test", "saint temperament quiz", "melancholic/choleric/sanguine/phlegmatic saints", "saints mbti" | Partly. Quiz, type and group pages |
| Struggles and temperament lists | "saints who struggled with anger/pride/lust/anxiety/depression", "saints who were introverts/quiet/shy", "saints known for patience/humility" | No. Group pages |
| Quotes by topic | "saint quotes about gratitude/patience/humility/joy/worry/forgiveness/anger/silence" | No. Topic pages cross-linked to the 11 articles |
| Fun formats | "saint trading cards (printable/template/project)", "catholic saint baseball cards", "church fathers tier list" | Yes, as a printable saint card. No tier lists |
| Not ours | "saint of the day", "feast day today", "saints born on \<date\>", "st X church/school", "st benedict medal", "novena", picking a confirmation saint | Skip. Saint-of-the-day is already on the kill list |

**Put the searched name in titles, not the short one.** Each short form below is taken by something else:
- "st augustine" means the Florida city.
- "jerome" means Jerome Powell.
- "st ambrose" means the university.
- "origen" means Orijen dog food.
- "basil the great" means the Disney film The Great Mouse Detective.
- "st cyprian" means Cyprian of Antioch and his "prayer against witchcraft".
- Google turns "antony the great" into "anthony the great". Use "Antony (Anthony) the Great".

**Timely hook:** a feature film, *Moses the Black*, came out on 30 January 2026 and on digital on 13 March ([Deadline](https://deadline.com/2026/02/moses-the-black-omar-epps-wiz-khalifa-quavo-release-dates-1236737100/)). Autocomplete shows "st moses the black story", "…quotes" and "…cause of death". His Wikipedia page drew 145,520 views in 12 months.

## 2. Who ranks today, and where they are weak
- **Life stories:** Wikipedia, Britannica, EWTN, [Catholic Online](https://www.catholic.org/saints/saint.php?saint_id=418), [Franciscan Media](https://www.franciscanmedia.org/saint-of-the-day/saint-augustine-of-hippo/), [Hallow](https://hallow.com/saints/augustine-of-hippo/), mycatholic.life, OrthodoxWiki, [OCA lives](https://www.oca.org/saints/lives/2026/11/13/103270-st-john-chrysostom-the-archbishop-of-constantinople).
  - Catholic Online's Augustine page runs about 380 words. Its two quotations have no source. It gives 28 August only and carries about 8 donation or shop prompts, including a modal popup.
  - Franciscan Media runs about 350 words, with no source for Augustine's own words and 28 August only.
  - Hallow is the strongest template: about 1,100 words, a quick-facts box and sourced quotes. It is Catholic only, has no Orthodox date and pushes its app twice.
  - OCA's Chrysostom page is about 2,100 words of narrative. It gives 13 November only, not the Catholic 13 September, and its quotations have no sources.
  - New Advent's Catholic Encyclopedia articles date from 1907 to 1914.
- **Quotes:** Goodreads, AZQuotes, BrainyQuote, QuoteFancy, and listicles from Aleteia, Catholic-Link and EpicPew. Goodreads' most-liked Augustine quote (8,514 likes), "The world is a book…", is misattributed. [Quote Investigator](https://quoteinvestigator.com/2025/09/25/world-book/) traces it to Richard Lassels in 1670. Of Goodreads' top 12 Augustine quotes, only 3 name a work. The list also includes lines usually credited to Oscar Wilde ("no saint without a past") and Bernard of Clairvaux ("the measure of love…"). A section called "Often misquoted", with the real source, is original value and easy to share.
- **"Which saint are you":** Loyola Press, BrainFall, CMMB, the Diocese of Westminster, quotev and quizony. [saintdiscoveryquiz.com](https://www.saintdiscoveryquiz.com/) is the closest model: 21 questions, 6 traits, 480+ saint pages. It is Catholic only.
- **"Which church father are you":** First Things and Mike Aquilina's blog (a quiz from 2007), plus Sporcle. Old and thin.
- **Temperament lists:** Catholic Company, CatholicMatch ("Famous Melancholics"), spiritualdirection.com and TAN. They assign modern temperament labels with no source.
- **Anger, introverts and similar:** Aleteia, EWTN GB/ChurchPOP, Catholic Exchange, Busted Halo and blogs. These are listicles with no sources, mostly about modern saints.
- **Group lists:** Wikipedia, Britannica, GotQuestions, catholic.com, CCEL, churchfathers.org, TheCollector, and [theeasternchurch.com](https://www.theeasternchurch.com/saints/desert-fathers-and-mothers) (a 6,500-word guide, Orthodox and Eastern Catholic only).
- **Orthodox status of Augustine:** GOARCH, OrthodoxWiki, OCA Q&A, a Georgetown page and a Substack. Each is a single-tradition voice.

**Gaps the site can fill:**
- Both calendars on one page.
- A work and chapter for every line, plus a list of misattributions.
- A short answer, then scannable blocks, on a phone-first layout with no ads.
- Personality in the saints' own words, tied to the quizzes.
- A sober answer to "is X a saint?"

## 3. What a winning page per saint needs
- **Title** (65 characters or fewer, the searched form of the name plus the most-searched hook). Examples:
  - "Augustine of Hippo: life, personality, quotes and feast days" (58)
  - "St Jerome: temper, translation, quotes and feast day"
  - "Origen of Alexandria: why he is not a saint, and what he taught"
  Vary the hook per person. Do not use one fixed template.
- **Description** (50 to 160 characters, ending with a full stop). Example: "Who Augustine was in plain words: his life, how he died, feast days East and West, his temperament, and quotes with the book and chapter."
- **H1:** the plain name.
- **Near the top:** a "Who was Augustine?" answer of 40 to 60 words. Extend the "In short" check in `seo-test.mjs` (30 to 70 words) to `/saints/*`.
- **Quick-facts card:** born; died and how; where; known for; also called (the Eastern and Western names, e.g. Gregory the Theologian = Gregory Nazianzen); feast days for Catholic, Orthodox and Anglican/Lutheran where they keep one; Old Calendar note (+13 days); status in each church; patron of (only with a source); how to say the name; place in the Personality Test (labelled as our reading); portrait credit.
- **H2s, in plain words:**
  1. What was he like? (character traits in his own words and his friends')
  2. His life in N moments
  3. In his own words (6 to 12 quotes: work, book and chapter, translation, link to a free text)
  4. Often misquoted
  5. Where he stood (the existing quiz cells)
  6. Friends, family and rivals (the existing `pairs`)
  7. How he died
  8. Is he a saint? Who honours him, and where churches disagree
  9. A prayer he wrote (only when the prayer is really his, e.g. the Prayer of St Ephrem)
  10. What to read first
  11. Take the quizzes / People like him
  12. Sources
- **Structured data:**
  - Article (author and publisher as the Organization; real `datePublished` and `dateModified`; `image` as an ImageObject with `license` = Public Domain Mark, `creator`, `creditText`).
  - `about` a Person with `name`, `alternateName`, birth and death places, `description`, and `sameAs: [Wikipedia URL, https://www.wikidata.org/wiki/Q…]`. QIDs for 45 people are in `qids.json` (Augustine Q8018, Chrysostom Q43706, and so on).
  - BreadcrumbList: Home > Saints > Name.
  - Hub pages: CollectionPage plus ItemList. This is descriptive only: Google's carousel covers only Course list, Movie, Recipe and Restaurant ([docs](https://developers.google.com/search/docs/appearance/structured-data/carousel)).
- **Markup to leave out:**
  - FAQPage: rich results ended on 7 May 2026 ([SEJ](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)), and FAQ is no longer in the [gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).
  - ProfilePage: Google scopes it to creators on the site itself ([docs](https://developers.google.com/search/docs/appearance/structured-data/profile-page)).
  - HowTo and Speakable.
  - Any numeric "stat" that has no source.
- **Images:** public domain or CC0 only. Pair an Eastern icon with a Western painting where both exist. Write alt text that describes the picture. Scans at least 1200 px wide for Google Discover; the current portraits are 500 px, e.g. Augustine at 500x736. Add image entries to the sitemap. Give each page its own share card.
- **Length:** 1,000 to 1,800 words of text unique to that person. Hallow runs about 1,100 and OCA about 2,100. Add fewer, deeper pages rather than many thin ones; Google's scaled-content abuse policy is the risk.
- **Links out from every page:** the hub, its groups, related people, the type page, the early-Christian quiz, the personality test, `/early-church-on/` (or its successor) wherever he appears, `/figure/` for Bible people, and articles or compare pages only where they are genuinely related.
- **Links in:** quiz result pages, type pages, articles that quote him. `site/src/lib/person-links.ts` already exists, so switching every card over is a one-line change.

## 4. Hub, group pages and URLs
**URL scheme:** `/saints/` for the hub. `/saints/<slug>/` for people. `/saints/<group>/` for groups, with a build check that no group slug matches a person's slug.

| Page | Query it captures | Roster fit |
|---|---|---|
| `/saints/` "Saints and early Christians" | early christian saints, list of early christian saints, famous early christians | Filters: century, East/West, group, type |
| `/saints/church-fathers/` | early church fathers list (in order/chronological/catholic/orthodox), who were the church fathers, where to start | Chronological list plus a reading-order guide (Wikipedia "Church Fathers" 194k views) |
| `/saints/desert-fathers/` (Desert Mothers inside, or its own page) | who were the desert fathers and mothers, list/names, desert fathers quotes on silence | Antony, Cassian, Isaac, Arsenius, then Moses the Black, Syncletica, Poemen (113k) |
| `/saints/cappadocian-fathers/` | who were the three Cappadocian fathers, basil and gregory friendship, were basil and gregory of nyssa brothers | All three plus Macrina, plus the "one soul in two bodies" story already in the data |
| `/saints/great-teachers/` | four great doctors of the Latin/Eastern church, three holy hierarchs, what is a doctor of the church | Covered almost entirely by the current roster (Ambrose, Jerome, Augustine, Gregory; Basil, Nazianzen, Chrysostom; Athanasius to add). Shows East and West side by side |
| `/saints/apostolic-fathers/` | apostolic fathers list/names, which church fathers knew the apostles | Needs Ignatius (293k) and Polycarp (236k) |
| `/saints/martyrs/` | early christian martyrs list, how they died, women | Justin, Cyprian, Perpetua and Felicity, Ignatius, Polycarp |
| `/saints/women/` | early christian women saints, desert mothers, early female martyrs | Macrina, Monica, Perpetua, Syncletica, Paula, Mary of Egypt |
| `/saints/east-and-west/` | saints recognized by both Catholic and Orthodox, pre-schism saints, do Lutherans have saints, Anglican saints calendar | Every early figure on the site is pre-1054. A table of each church's dates. Protestant calendars included |
| `/saints/timeline/` | early church fathers timeline | One visual timeline. No per-century pages yet (demand is thin) |
| Struggles: `/saints/anger/`, `/pride/`, `/lust/`, `/melancholy/` | saints who struggled with anger/pride/lust/depression | Links to the deadly-sins quiz and to "where the fight is" (Cassian's eight thoughts) |
| `/saints/quiet/` "Quiet saints, in their own words" | saints who were introverts/quiet/shy, patron saint of introverts | Nazianzen, Arsenius, Antony, Benedict. Links to the Still Water, Deep Well, Hearth and Oak types |
| Topic quote pages | saint quotes about gratitude/patience/humility/joy/worry/forgiveness/anger | One per existing article, linked both ways |

**Temperament queries** ("melancholic saints", "four temperaments saints"; the Wikipedia "Four temperaments" page drew 231k views). Gregory's own words are cheerful, morose, timid and confident. They are not the four humours. Mapping them onto the four temperaments would invent a claim. The honest version is one article in the saints' own words, built on sourced self-descriptions such as Gregory's "sad and melancholy disposition" from the Dialogues. Do not add "saints by type" pages that duplicate `/personality-type/`.

**Handling the existing pages (to avoid two pages about one person competing):**
- **`/early-christian/<slug>/` (22 pages): 301 to `/saints/<slug>/` and fold their content in as the "Where he stood" section.**
  - A canonical tag is the wrong tool. It is only a hint, meant for near-duplicate pages, and Google ignores it when the content differs.
  - Keeping both pages splits links and makes Google choose between them. The live title today, "Augustine of Hippo: what he believed, with quotes", is exactly the intent the new page will target.
  - They went live on 2026-09-23 and are almost certainly not indexed yet, so moving now is nearly free. It gets more expensive every week.
  - What to update:
    - Set `outcomePathBase` to `'saints'`.
    - Update the `person-links.ts`, `lib/mine.ts`, `EarlyLine`/`EarlyMine`, `kindred.ts` and `seo.ts` paths.
    - Update the OG card keys and the sitemap.
    - Send an IndexNow ping.
    - Link internally straight to the new URLs, never through the redirect.
    - Use the Vercel adapter's redirects so they are real 301/308s.
  - `/early-christian/` itself goes to `/saints/`. The quiz page shows the 22 people directly, so they can still be browsed from there.
- **`/early-church-on/<topic>/`:** same reasoning and same one-day age. Either move it to `/saints/on/<topic>/` and grow it with the virtue topics, or keep it and make it the single home for each topic. Either way, one page per topic. A large but contested family ("early church fathers on the eucharist/infant baptism/Mary/purgatory") exists; build it later, only with both sides quoted word for word.
- **`/figure/<slug>/` (25 pages): keep.** Its intent is different ("Rahab in the Bible: character traits…"; people call these "character studies"). The hub lists Bible people in a group that links to `/figure/`. Peter, Moses, Elijah and John the Baptist get no second page. Isaiah (316k views) and Jeremiah (260k) should become `/figure/` pages; that is the lead's call on the template.
- **`/personality-type/<slug>/`: keep.** Kindred cards link to the person pages. Each person page links back ("In our test: The Still Water").
- **Still needing pages** (from `person-links.ts`): Jeremiah, Isaiah, Abba Arsenius, St Monica, St Mary of Bethany.

## 5. Naming and menu
- **The facts:**
  - The site's own data says Tertullian, Lactantius and Origen are not counted saints.
  - Clement of Alexandria was dropped from the Roman Martyrology in 1586. Wikipedia says Coptic and Anglican churches still honour him (4 and 5 December). Check that against the churches' own calendars.
  - Boethius has a local cult in Pavia, approved in 1883, feast 23 October.
  - Some Orthodox usage calls Augustine "Blessed".
  - Moses and the prophets are in Orthodox and Catholic calendars; Protestants do not call them saints.
- **Recommendation:**
  - Menu item: "Saints". It fits the tight phone row.
  - Hub H1 "Saints and early Christians"; title "Saints and Church Fathers: lives, quotes, feast days", which covers both main search terms. Pick one visible hub name for the owner to approve.
  - Every card and page carries a status line, e.g. "Church Father. Not counted a saint."
  - URL `/saints/` for everyone. Readers see the labels, not the path, and one namespace for people beats splitting by a status that differs from church to church.
- **Menu:** rename "Articles" to "Learn" (5 letters instead of 8, which helps the tight row noted in kit.css at line 911). Items: Articles / Saints and early Christians / What the early Church said / Compare traditions. A menu link on every page is the strongest internal link the hub can get. Build a `/learn/` page only if it is a real directory; otherwise point the parent at `/articles/`.

## 6. Guardrails
- **Calendars:** always print both calendars, with the Old Calendar +13 days note. Check each date against the General Roman Calendar, OCA/GOARCH calendars, LSB/ELW (Lutheran) and Lesser Feasts and Fasts (Episcopal). Examples:
  - Martin: 11 November (West), 12 November (East).
  - Chrysostom: 13 September (Catholic); 13 November, 27 January and 30 January (Orthodox).
  - Basil and Gregory: 2 January (Catholic); 1 January, 25 January and 30 January (Orthodox).
  - Augustine: 28 August (West), 15 June (Orthodox).
- **Names and "St":** H1s and URLs use plain names. A "Called" line gives each church's title. Never write "St" for Tertullian, Origen or Lactantius. Bible people are "honoured as a saint in the Orthodox and Catholic calendars", never simply "St Moses".
- **Quotes:** a work, section and translation for every line. Verify them by script against the public-domain source, the same way `verify.mjs` and quiz #4's VERIFY.md do. Compare case-insensitively, because of the owner's capitals rule for God. Misattributions go in their own list, with evidence.
- **Hard topics:** state them, in both the holders' and the critics' words (Adversus Judaeos, universalism, Jerome on women, Tertullian's Montanism). Hiding them fails a discernment audience.
- **"Stat sheets":** only facts with a source (dates, places, number of surviving works with a source, titles) plus the site's quiz placements, labelled as ours. No invented ratings. No tier lists. The printable saint card is where the playfulness goes.
- **Prayers:** no intercession prayers or novenas. Count knowledge, never devotion. A prayer the saint actually wrote is fine.
- **Writing:** plain short sentences, no filler, no section marks, say a thing once.

## 7. Suggested order for new people (by Wikipedia pageviews)
1. The personality-test gaps first: Arsenius, Isaiah, Jeremiah, Monica.
2. Athanasius 234k, Ignatius 293k, Polycarp 236k, Moses the Black 146k (film).
3. Perpetua 109k, Mary of Egypt 88k, Ephrem 82k.
4. Nicholas 1.03M and Patrick 943k. Both lived before 1054 and are honoured East and West, with seasonal spikes.

## Could not verify
- Real search volumes (no keyword tool). Demand here rests on autocomplete and pageviews.
- Whether Google has indexed `/early-christian/` yet. The Search Console Pages report would say.
- The current Doctor of the Church count: autocomplete shows both "37" and "38". Check with the Vatican.
- Clement of Alexandria's Coptic and Anglican status, which comes from Wikipedia only.

All notes and scripts are in `C:\Users\Light\AppData\Local\Temp\claude\C--Users-Light-Desktop-claude-theology-compass\9b93c859-e9a4-4e65-a8e5-992fee83be6c\scratchpad\hub\`:
- NOTES-search-research.md
- ac-raw.json
- names.txt, generic.txt, round2.txt, round3.txt
- views.json
- qids.json
- ac.mjs, qids.mjs, views.mjs, views2.mjs