# Verification of the five research files

Checked 2026-09-19 by an adversarial verifier. Files checked: LANDSCAPE-quizzes.md, LANDSCAPE-games.md,
SEARCH-DEMAND.md, LANDSCAPE-articles.md, DISTRIBUTION.md.

**Method.** I picked the claims the owner is most likely to act on (products, numbers, licences, community
facts, and "nobody does this" gaps) and opened the source myself, or ran the search myself. For gaps I
searched for a competitor before accepting there is none. "Confirmed" means I read it on the page today.
"Confirmed (weak)" on a gap means two or three searches found no rival, which is not proof of absence.
Pages were read through a fetch tool that summarises page text, so quoted numbers are as that tool
returned them; where it mattered I used raw curl instead and say so.

**Overall verdict.** The research is unusually honest: most numbers check out and the researchers
flagged their own unverified items. The problems are (a) three real factual errors, (b) two
contradictions between files, and (c) several gap claims in the games file that miss existing
competitors. None of them kills a recommendation, but four of them change how a recommendation should
be worded or ranked.

---

## 1. The table (46 claims)

Verdicts: **confirmed** / **wrong** / **overstated** / **could not verify**.

### A. Rivals and products

| # | File | Claim | Verdict | What I found, and where |
|---|---|---|---|---|
| 1 | Quizzes, Search, Distribution | TheoCompass: open beta, 30 questions, 13 dimensions, "230+" denominations, by "Oroq", subreddit and Ko-fi, no usage numbers | confirmed | https://theocompass.com/ says all of this. 60 and 120-question modes are on its roadmap. |
| 2 | Quizzes, Search | TheoCompass "shows no sources"; "an enormous unaudited editorial surface" | **overstated** | True of the landing page only. The project has a public GitHub repo (https://github.com/TheoCompass/theocompass) whose README describes master CSV data files, a "Methodology Guide", a 13-dimension Euclidean-distance score, and master Google Sheets. DISTRIBUTION.md says this; the other two files do not. So the rival is open about method and data. What I did not find is any citation of confessions or any audit. The honest contrast is "open data but uncited and unaudited", not "no sources". Note the repo's own title still reads "30 questions and 30 denominations" (a pre-demo), so "230+" is the site's claim, not something I could see in the repo. |
| 3 | Distribution | The blogger found TheoCompass "through Reddit", took a long version, called it "extremely intriguing" and "made just for fun" | confirmed | https://forestandfaith.org/2026/02/02/which-theology-theocompass-v1-0/ : found "somewhere on Reddit", 63 questions, both phrases present. |
| 4 | Search | "theology compass quiz/test" are suggested queries and lead to TheoCompass | confirmed, **and understated** | Raw Google autocomplete today for "theology compass" also returns "theological compass redeemed zoomer", "theological compass test family 2000", "christian theology compass test". Redeemed Zoomer published a "Reformed Theology Compass" video (Oct 2024, seen in search results: https://www.youtube.com/watch?v=546i3dTpyAs). So the phrase is contested by at least three things, not one. |
| 5 | Quizzes | GiftsTest.com: "no operator named anywhere I could see" | **wrong** | https://giftstest.com/faq states it is "provided by the Rock Church in San Diego". DISTRIBUTION.md has this right; LANDSCAPE-quizzes.md contradicts it and then guesses the Rock Church page is "what appears to be the same" test. It is the same operator. |
| 6 | Quizzes | GiftsTest: 66 items, 5-point scale, first name, last name and email asked before the test | confirmed | https://giftstest.com/test |
| 7 | Quizzes | ChurchGrowth survey: 108 statements, nine task gifts, printable results, group results | confirmed | https://gifts.churchgrowth.org/spiritual-gifts-survey/ . The "Millions of people" line is not on this page; the researcher cites the site's home page, which I did not open. Could not verify that phrase. |
| 8 | Quizzes | Denison test: 85 items, 17 gifts, explicitly excludes sign gifts, emailed results | confirmed | https://www.whataremyspiritualgifts.org/ |
| 9 | Quizzes | MinTools: 35 statements, seven Romans 12 gifts, no email, says it cannot show a full gift mix | confirmed | https://mintools.com/spiritual-gifts-test.htm |
| 10 | Quizzes | North Point: 125 questions, 0 to 4 scale, 20 to 45 minutes, "answer from actual past experience" | confirmed | https://northpointministries.org/dream-job-gifts-assessment |
| 11 | Quizzes, Search | denominationdifferences.com quiz: 50+ questions, no author, ads, percentage match | confirmed | https://denominationdifferences.com/quiz |
| 12 | Search | Its pair pages have "around 50 topics and 57+ footnotes", no author, no link to its own quiz, "Varies widely" cells | mostly confirmed | The page I opened (presbyterian-vs-lutheran) has 41 topics, 57 footnotes, no author, no quiz link, "Varies widely" 8 times. "Around 50" should read "about 40". Note: 57 footnotes is more citation than wiserwalk's tradition pages carry today. |
| 13 | Quizzes | Saint Discovery Quiz: 21 questions, six traits, 480+ saints, no account | confirmed | https://www.saintdiscoveryquiz.com/ |
| 14 | Quizzes | 5 Love Languages: "150+ million people", "150M+ quizzes taken on this site", $39 premium, a quiz about someone else | confirmed | https://5lovelanguages.com/ (the $39 is shown as a discount from $55). |
| 15 | Quizzes | EHD assessment: 40 questions, 15 minutes, email required, four stages | partly confirmed | https://www.emotionallyhealthy.org/your-personal-assessment/ confirms 15 minutes, name and email, the four stages. The number 40 was not on the page as I read it: could not verify. |
| 16 | Quizzes | Pew quiz: 15 of 32 questions, 10,971 adults, compares you with the sample | confirmed | https://www.pewresearch.org/religion/quiz/u-s-religious-knowledge-quiz/ |
| 17 | Quizzes | Pew report: average 14.2 of 32; evangelicals 15.5; 51% Sermon on the Mount; 20% faith alone | could not verify the four specifics | The report page as returned to me says "approximately 14 of 32", Jews highest (18.7), then atheists and agnostics. The 14.2, 15.5, 51% and 20% figures did not come back in my read. They are plausible; open the PDF before printing any of them. |
| 18 | Quizzes | Pew reuse terms "not verified" | now verified, **and it matters** | https://www.pewresearch.org/about/terms-and-conditions/ : reuse (including commercial) is allowed with a set citation format; data may be reproduced only in excerpts, not "in full or substantially in full"; a disclaimer line is required; and content must not be used in a way that implies Pew's endorsement of "a ... religion or viewpoint". Concept 3 (Bible Knowledge, Benchmarked) is feasible but must use a subset of questions, cite each, carry the disclaimer, and look nothing like a Pew product. |
| 19 | Games | Versle: 4.9 stars, 3.8K ratings, $4.99/month or $28.99/year, reviewers angry about Blitz throttling | confirmed | https://apps.apple.com/us/app/versle-daily-bible-games/id1668499811 |
| 20 | Games | Lordle: Basil Tech, Sang Tian, 950+ puzzles, free, NET Bible | confirmed | https://faith.tools/app/345-lordle |
| 21 | Games | BibleChallenger: since 2006, 23 games, "over 1,200" questions, no ads or accounts | confirmed | https://www.biblechallenger.com/ |
| 22 | Distribution | Show HN "A Daily Bible Game" (bibdle.com): 49 points, 64 comments; commenters asked for deuterocanon, give-up, unlimited practice | confirmed | Points and comments from the HN API (hn.algolia.com, story 46541885): 49 and 64. Requests confirmed on https://news.ycombinator.com/item?id=46541885 . Note Bibdle is "guess the book from three verses", and its maker said he built it with coding agents; the HN crowd did not mind. |

### B. Licences and datasets (checked hardest)

| # | File | Claim | Verdict | What I found |
|---|---|---|---|---|
| 23 | Games | BSB public domain since 30 April 2023, no licence needed | confirmed, one courtesy to note | https://berean.bible/licensing.htm and https://berean.bible/terms.htm . The terms ask (not require) that the Berean name not be used on a text that differs from the official one. Sounds Like Scripture normalises display (LORD, quote marks): keep the stored text verbatim and the request is met. |
| 24 | Games | OpenBible cross-references: CC BY, about 340,000 | confirmed | https://www.openbible.info/labs/cross-references/ |
| 25 | Games | Theographic: CC BY-SA 4.0 | confirmed | https://github.com/robertrouse/theographic-bible-metadata . Share-alike is real: any derived dataset published by the site must carry CC BY-SA. The researcher's reading (data yes, site code and prose no) is the common one but is the researcher's opinion, not something the repo states. |
| 26 | Games | STEPBible data incl. TIPNR: CC BY 4.0; tags aligned to the ESV | confirmed | https://github.com/STEPBible/STEPBible-Data . Required credit: "STEP Bible" linked to www.STEPBible.org, and changes must be recorded. The ESV alignment is a real obstacle for concept 6 (Same Word?) and for Strong's-based counts in concept 1: the tagged English text is not public domain. The Hebrew and Greek tagged texts are usable; mapping them to BSB words is unverified. |
| 27 | Games | OpenBible geocoding: CC BY, confidence levels, about 1,000 photos with their own licences, maker admits errors | confirmed | https://www.openbible.info/geo/ |
| 28 | Games | Clear Bible speaker-quotations: CC BY 4.0; "could not verify separate terms for the underlying FCBH data" | confirmed, and the open question is now closed | The repo's LICENSE.md is CC BY 4.0 with a fixed attribution line, and it states the Glyssen-sourced part is "Copyright (c) 2014-2020 SIL LSDev and Faith Comes By Hearing ... licensed under The MIT License". |
| 29 | Search | Glyssen CharacterVerse.txt: MIT licence, 20,984 rows, has Psalm 91:2 narrator and 91:14-16 God marked "Potential" | confirmed | https://raw.githubusercontent.com/sillsdev/Glyssen/master/LICENSE is MIT, holders SIL LSDev and FCBH. Local file has 20,984 lines and the Psalm 91 rows exactly as described. MIT requires the copyright notice and permission text to travel with copies: the repo already holds raw/GLYSSEN-LICENSE; any published chapter pages need a visible credit too. |
| 30 | Games | Lichess puzzles: 6.1 million, CC0, from 600 million games, 100+ CPU-years, Glicko-2 per attempt | confirmed | https://database.lichess.org/ (6,100,952). |
| 31 | Games | Met: CC0 data, 406,000 CC0 images, API | could not open; partly supported | metmuseum.org returned 429 to me. The Met's GitHub repo confirms CC0 data on 470,000+ works and says **images are not part of the dataset**. "406,000" appears in a search summary of the Met FAQ; another summary says 492,000. Use "hundreds of thousands" until someone opens the page. |
| 32 | Games | Art Institute of Chicago: 50,000+ CC0 images | confirmed | Read by curl on artic.edu: "50,000 images ... under the Creative Commons Zero (CC0) designation". |
| 33 | Games | NGA: 130,000+ CC0 records; "about 60,000 CC0 images" | records confirmed; image count not opened | https://github.com/NationalGalleryOfArt/opendata confirms CC0 and 130,000+, and says image files are **not** in the dataset. nga.gov returned 403; search summaries give "more than 51,000" and "close to 60,000". |
| 34 | Games | Rijksmuseum: 800,000 records, "CC0 or PD" | **overstated** | https://data.rijksmuseum.nl/ confirms 800,000 objects and an API. Its data policy (read in search summary of data.rijksmuseum.nl/policy; the direct URL I tried was a 404) says CC0 or Public Domain Mark "wherever possible", and CC BY 4.0 where the museum chooses to keep its copyright. So licence is per object: check the rights field on each image used. Iconclass coding: not mentioned on the pages I read; still unverified. |
| 35 | Games | "All four [museums] verified as CC0 programmes" | overstated | Only Chicago and the NGA dataset were read directly by anyone. Two of the four museum sites blocked both the researcher and me. |

### C. Claimed gaps ("nobody does this")

| # | File | Claim | Verdict | What I found |
|---|---|---|---|---|
| 36 | Quizzes | No real "which end-times view am I" quiz exists | confirmed (weak), with a precedent | Two searches found explainers only. But a Quizfarm quiz "What's Your Eschatology?" once circulated on forums (https://theos.org/forum/viewtopic.php?t=1801 , seen in results, not opened) with percentage results across amillennial, preterist, postmillennial, premillennial, dispensational. It appears defunct. So: demand is proven by an old quiz people shared; the current field is empty as far as I can see. |
| 37 | Quizzes | No Bible-translation chooser includes Catholic and Orthodox Bibles | confirmed (weak) | Two searches returned only articles and buying guides (Eden, Catholic Company, Guide Catholic). No interactive chooser found. |
| 38 | Quizzes | No quiz puts real confession sentences in front of people ("Could You Sign It?") | confirmed (weak) | One search; nothing found but comparison charts and forum threads. |
| 39 | Search | "Who is speaking in [chapter]" has no structured rival | confirmed (weak); demand confirmed directly | Raw autocomplete today returns psalm 91, 22, 119, 2, 82, 95, 139, 23, 89. Three searches found commentaries and a "Who said it" quiz page, no verse-by-verse speaker pages. |
| 40 | Search | "Which denominations believe X" is suggested and badly served | confirmed | Raw autocomplete returns rapture, predestination, transubstantiation, trinity, tongues, purgatory, dispensationalism, soul sleep, original sin, infant baptism; and "what denominations are cessationist". My search for a list returned Logos, a forum, a personal blog, Wikipedia: no clean list page. Note four of the ten suggestions (rapture, trinity, purgatory, soul sleep, original sin) are outside the six axes. |
| 41 | Games | Pin the Place: presented with no existing rival | **overstated** | Rivals and near-rivals exist: **ScriptureGuessr** (https://scriptureguessr.com/ , "GeoGuessr for the Bible", web and iOS, practice, challenge, multiplayer and daily modes; it is verse-guessing, not map-pinning, but it owns the GeoGuessr framing and name); Bible Mapper's map quiz (https://biblemapper.com/quiz.html , label-the-map, by David P. Barrett); Sporcle Bible map quizzes; a Teachers Pay Teachers pin-the-town game scored by closeness. I found no pin-drop game scored by distance on the open web, so the mechanic is open, but the file should name these. |
| 42 | Games | One people-and-places reference layer would throw off "several thousand indexable pages" that nobody has | **overstated** | **Bible Maximum** (https://biblemaximum.com/bible-places) already publishes 1,342 place pages built on the same OpenBible geocoding data (it credits "OpenBible.info (CC BY 4.0)"), with confidence scores, coordinates and 5,616 verse references, plus Bible Names pages, Bible People pages, quizzes, timelines and lexicons. No operator is named. The layer is still buildable, but it is a contested field with a programmatic incumbent, not a gap. |
| 43 | Games | "What's in a Name": pages that rank are "thin baby-name sites with no sources"; "probably the strongest pure-SEO play" | **overstated, and contradicted by another file** | Abarim Publications (https://www.abarim-publications.com/Meaning/index.html) is a large, sourced encyclopedia of biblical names with Hebrew and Greek roots; Bible Maximum also has name pages. SEARCH-DEMAND.md lists name meanings under "Do not enter. No edge." The synthesiser must not carry the "strongest SEO play" line forward. Demand itself is real (autocomplete: "what does the name james/john/elizabeth mean"). |
| 44 | Games | More or Less: "how many times is X mentioned" is heavily typed; existing answers are "inconsistent and unsourced" | demand confirmed; quality claim not checked | Raw autocomplete: jesus, hell, love, "fear not", satan, heaven, rainbow "mentioned in the bible". Existing answer pages come from CARM, christianbiblereference.org and content farms (seen in results, not opened), so "inconsistent and unsourced" is unverified. I found no higher-or-lower Bible game in two searches. |

### D. Distribution and the live site

| # | File | Claim | Verdict | What I found |
|---|---|---|---|---|
| 45 | Distribution | faith.tools: run by Cameron Pak, 11 criteria, games category, submission form, no reply guaranteed | confirmed | https://faith.tools/ . The form is at https://go.faith.tools/submit . It lists digital services as well as apps, so a website qualifies. |
| 46 | Distribution | Freedom Homeschooling has a "Submit Free Resource" route and suits the games | route confirmed; fit **overstated** | https://freedomhomeschooling.com/bible/ invites submissions of free **curriculum**. The page lists no games. A timed game may simply not fit what they list; Finish the Verse (memory work) is the better candidate. |
| 47 | Distribution | Sherman Oaks UMC links MinTools, ChurchGrowth and GiftsTest and asks members to send results to the pastor | confirmed | https://soumc.org/spiritual-gifts-series/ |
| 48 | Distribution | Redeemed Zoomer: "over 720,000 subscribers"; streamed "Zoomer takes Christian denominations quiz" using denominationdifferences.com | subscriber figure confirmed on Wikipedia; video title seen in search results only | https://en.wikipedia.org/wiki/Redeemed_Zoomer (about 720,000). The YouTube page would not render for me either: view count, and which quiz he used, remain unverified. He has also streamed the Political Compass test, so "takes tests on camera" is a habit, which slightly strengthens the bet. |
| 49 | Distribution | gummysearch: r/Christianity 721k members | confirmed as displayed | https://gummysearch.com/r/Christianity/ shows 721k, "last updated September 19, 2026". Third-party figure. |
| 50 | Distribution | WBQA lists fifteen organisations | confirmed (15 or 16 depending on whether the two Assemblies of God entries count once) | https://www.wbqa.org/organizations |
| 51 | Distribution | CatholicApps lists Versle, has "Submit Your App", apps only | confirmed | https://catholicapps.com/versle-daily-bible-game/ |
| 52 | Distribution | Challies' "30 Christian Substacks" lists Aaron Renn with a links digest | confirmed | https://www.challies.com/articles/30-christian-substacks-i-read-and-recommend-in-2026/ |
| 53 | Search | Live-site audit: Compass title is "Theology Compass — Wiser Walk" and the page never says "denomination"; axis H1 is one word; axis description is cut mid-sentence; draft deadly-sins pages are in the sitemap while noindex; /tradition/ returns nothing | confirmed by curl | 0 occurrences of "denomination" on /q/theology-compass/; H1 "Gifts"; description ends "...until Christ returns and"; eight seven-deadly-sins URLs in sitemap-0.xml while /q/seven-deadly-sins/ carries noindex; /tradition/ is a 404. One small slip: the sitemap holds 43 URLs today, not 41. |
| 54 | Search | GotQuestions: "currently averaging 16,000,000 pageviews per month" | confirmed (self-claim) | https://www.gotquestions.org/about.html |

### E. Articles

| # | File | Claim | Verdict | What I found |
|---|---|---|---|---|
| 55 | Articles | Live gratitude article says "In all circumstances" is not "for all circumstances", never mentions Ephesians 5:20, names no translation, links to the seven-deadly-sins draft | confirmed | https://wiserwalk.com/articles/how-to-become-more-grateful/ . It links to "Which of the seven are you weakest to?" and the Compass. |
| 56 | Articles | BSB Ephesians 5:20 reads "always giving thanks to God the Father for everything" | confirmed | https://biblehub.com/bsb/ephesians/5.htm |
| 57 | Articles | Fr Stephen Freeman argues thanks FOR all things from Eph 5:20 and Chrysostom, ends on an admission | confirmed | http://www.glory2godforallthings.com/2011/02/09/the-difficult-path-of-giving-thanks/ |
| 58 | Articles | The live articles quote the ESV | plausible, still unverified | "give thanks in all circumstances" is shared by more than one modern translation; the Philippians 4:6 wording the page uses ("by prayer and supplication with thanksgiving let your requests be made known") is ESV-shaped. I did not open an ESV page either. The safe statement: it is not the BSB and no translation is named. |
| 59 | Articles | YouVersion 2025: top searches love, anxiety, peace; top verses Isaiah 41:10, Jeremiah 29:11, Romans 12:2 | confirmed | https://www.youversion.com/news/youversion-announces-2025-verse-of-the-year |
| 60 | Articles (section 6) | Jeremiah 29:11 is the "third most engaged verse on YouVersion 2025" | **wrong** | It is second. The same file lists the order correctly in section 1. |
| 61 | Articles | Bible Gateway 2025: Psalm 23:4 top; Psalm 23 and 91 dominate; Jeremiah 29:11 seventh | confirmed | https://religionunplugged.com/news/2025/12/9/here-are-the-most-read-bible-verses-of-2025 |
| 62 | Articles | BibleProject features Psalm 23, Jeremiah 29:11 and "faith without works" pieces; deuterocanon piece is 23 minutes; fruit of the Spirit is in "most popular" | confirmed | https://bibleproject.com/articles/ |
| 63 | Articles | GotQuestions July 2026 top ten (women pastors first; "lose salvation" tenth) | confirmed, order exact | https://www.gotquestions.org/top20-monthly.html |
| 64 | Articles | TGC confessional statement quotes ("foreknew them and chose them", "complement each other", "headship") | confirmed | https://www.thegospelcoalition.org/about/foundation-documents/ |

### F. Secular precedents (spot checks)

| # | Claim | Verdict | Source |
|---|---|---|---|
| 65 | Wordle: 90 players on 1 Nov 2021, over 300,000 by 2 Jan 2022; emoji grid came from players in New Zealand; "low seven figures" | confirmed | https://en.wikipedia.org/wiki/Wordle |
| 66 | NYT Games 2024: 11.1bn plays; Wordle 5.3bn, Connections 3.3bn, Strands 1.3bn; 10m+ daily players | confirmed | https://en.wikipedia.org/wiki/The_New_York_Times_Games |
| 67 | Sporcle: 500m (2011), 1bn (2013), 6bn (Feb 2025); 1.6m quizzes; badges 80m times; Orange Oct 2016 | confirmed | https://en.wikipedia.org/wiki/Sporcle |

---

## 2. Corrections the synthesiser must apply

1. **GiftsTest.com is run by the Rock Church, San Diego.** Delete "no operator named" and "anonymous operator" from the quizzes landscape. The criticism that survives: mandatory name and email, and no statement of which gift list it follows.
2. **Do not say TheoCompass has "no sources".** Say: open method and open data (GitHub, Google Sheets), no confession citations and no audit that I could find, and the landing page links to none of it. Wiserwalk's edge is citation and adversarial audit, not openness. Never run the rival down; this wording is also the fair one.
3. **"Theology compass" as a search phrase is contested by at least three things:** TheoCompass, Redeemed Zoomer's "Reformed Theology Compass" video, and a family2000 "theological compass test". This strengthens the search file's advice (put "denomination" in the title) and weakens any hope of owning the bare phrase.
4. **Jeremiah 29:11 was second, not third, on YouVersion in 2025.** Fix in the articles file's "ten to write first".
5. **Strike "probably the strongest pure-SEO play" from What's in a Name.** Abarim Publications and Bible Maximum already serve sourced name pages, and the search-demand file says "do not enter". The two files disagree; the search-demand file is the better supported.
6. **Pin the Place and the people-and-places page layer are not empty fields.** Name ScriptureGuessr (owns "GeoGuessr for the Bible"), Bible Mapper's quiz, and above all Bible Maximum (1,342 place pages from the same OpenBible data, plus people and names). The pin-drop-scored-by-distance mechanic still looks open. Never call wiserwalk's version "GeoGuessr for the Bible". Rank the reference-page layer lower than the games file does; the "who is speaking" chapter pages (claim 39) are the better-evidenced page family because no structured rival turned up.
7. **Museum licences are per object, not per museum.** Rijksmuseum uses CC0 or the Public Domain Mark "wherever possible" and CC BY 4.0 otherwise. The Met and NGA datasets are CC0 but do not include images; image rights are flagged per work. Only Chicago's 50,000 figure was read directly. Replace "all four verified as CC0 programmes" with this. Painted Scene must filter on each record's rights field.
8. **Speaker data licence is settled: MIT** (SIL LSDev and Faith Comes By Hearing, 2014-2020), and Clear Bible's layer is CC BY 4.0 with a fixed attribution line. Remove it from the "could not verify" lists. Any "who is speaking" page needs the MIT notice and a visible credit.
9. **STEPBible's English tagging is on the ESV**, which is copyrighted. Anything that needs English words tied to Strong's numbers (Same Word?, original-language counts in More or Less) has an unsolved data step. Plain BSB word counts do not. Say so where those concepts are ranked.
10. **Pew reuse is now known:** allowed with a fixed citation and disclaimer, excerpts only, and nothing that implies Pew endorses a religion or viewpoint. Bible Knowledge, Benchmarked is feasible with a subset of questions and careful framing. The four specific Pew figures (14.2, 15.5, 51%, 20%) must be read off the report PDF before they appear anywhere.
11. **Freedom Homeschooling lists curriculum, not games.** Keep it in the plan only for Finish the Verse or a memory-work framing; do not count it as a likely link for Sounds Like Scripture.
12. **The eschatology gap has a precedent.** An old Quizfarm "What's Your Eschatology?" quiz was shared on forums with percentage results. It reads as evidence of demand, and as a warning about the percentage framing, rather than as a live rival.
13. Small number fixes: denominationdifferences pair page has 41 topics (not "around 50") and 57 footnotes; wiserwalk's sitemap has 43 URLs (not 41); WBQA lists 15 or 16 entries.
14. **BSB courtesy:** the publisher asks that the Berean name not be attached to a modified text. Display normalisation is fine if the stored and cited text stays verbatim; worth one line in SPEC.md if it is not there.

## 3. Still unverified after this pass

- Every subreddit's and Facebook group's rules (blocked to me as well). The distribution file's instruction that the owner reads them himself stands.
- The Redeemed Zoomer stream's view count and which quiz he used (YouTube would not render).
- Met image count (429), NGA image count (403), Rijksmuseum Iconclass coding.
- SpiritualGiftsTest.com's self-claims (403), ChurchGrowth's "Millions" line, EHD's "40 questions".
- Whether existing "how many times is X mentioned" pages are really inconsistent; nobody opened them.
- Whether any BSB-to-Strong's alignment is published and usable.
- All gap verdicts marked "weak": two or three searches through a US-only search tool are not Google. Before building any gap concept, the owner should spend five minutes searching it himself.
- I did not re-check: JetPunk, TimeGuessr, Framed, Heardle, Wikitrivia, GeoGuessr, Sacred Type, Christianity Today, Crosswalk, C.S. Lewis Institute, Renovare, Practicing the Way, Christian Forums. None carries a number the owner is likely to act on.
