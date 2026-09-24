People audit for the Saints hub

Verification levels used below:
- **V** means checked for the site. It covers the shown quiz #4 lines and the people.json text (VERIFY.md), the personality `Q()` quotes (check-quotes.mjs, plus a skeptic pass on the kindred text), the Bible-figure evidence (`audit/new-quizzes/figures.verified.json`) and the Psalm quiz pairings (read from the Greek).
- **R** means researcher-checked only. Each researcher substring-checked quotes against the fetched page, but the independent checker stage was cut. A pass by one checking agent is needed before anything R is published (his standing rule).
- **W** means Wikidata, fetched today. It is unverified and sometimes wrong.

Full per-person merge: `C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/9b93c859-e9a4-4e65-a8e5-992fee83be6c/scratchpad/hub/audit/people-audit.json` (80 records). Compact lines are in `compact.jsonl` next to it. Wikidata dumps: `title-qid.json`, `wd-summary.json`, `wd-feasts.json`, `wd-dates.json`, `wd-misc.json`, `wd-patron.json`. Another agent is writing into `hub/`, so all my files are in `hub/audit/`.

```
{
"datasets": {
 "WEC  site/src/data/which-early-christian.json (V)": "22 people. Fields: slug, name, short, she, dates (short), where, who, hook, status (only Tertullian, Origen, Lactantius), portrait {src, thumb, w, h, credit, page, license}, pairs (15 verified links), cells[23 statements] {v -2..+2, work, by, own, line|hide, note}. 197 lines shown in all. Pages: /early-christian/<slug>/ (22), /early-christian/, /early-church-on/<topic>/ (23), OG /og/r-which-early-christian-<slug>.jpg (22).",
 "FR  design/quiz-ideas/fathers/research/figures/group-01..11.json (R)": "36 people. Fields: also_known_as, dates (fuller, e.g. Augustine '13 November 354 to 28 August 430'), places (birth, career, death, in prose), role, status_note (sainthood per church, cautions, SOME feast days), hook, stories[3-10] {story, source, url}, temperament[3-7] {trait, evidence, source, url}, genuine_lines[3-20] {quote, work, location, translation, public_domain, own_rendering, url}, misattributed[1-9] {line, truth}, opinions[8-46] {topic, position, side_note, quote, work, location, translation, url, status, today}, sparring[1-9] {with, over, source, url}, portraits[0-5] {title, kind, date, artist, url, license}.",
 "FT  fathers/research/topics/*.json (29 files) + discovery.json (R)": "stances {person, side, strength, summary, quote, translation, work, location, url, context} for about 120 named people. discovery.json has 42 more disputed questions and 10 misattributions.",
 "PR  design/quiz-ideas/personality/results.mjs (V, working copy with uncommitted Oak kindred)": "TYPES.kindred, OPPOSITES, BOATS, LINE_TEXT, CHRIST, HELP. About 100 Q() quotes: Pastoral Rule 37, Moralia 36 + 7 'own speech', Cassian 10, the rest single. Built into site/src/data/personality.json. Public on /personality-type/<key>/ (8 pages).",
 "PX  personality/research.json reports[6] figures-saints and [5] figures-bible (R)": "25 saints and 40 Bible figures. traits {axis (Gregory Book III chapter), pole, evidence, strength explicit|inferred, source {work, locus, url, translation, quote}}, orthodox_standing, portrait. 123 saint quotes and 251 Bible lines were machine-checked. coverage_gaps and risks are included.",
 "BF  site/src/data/bible-figures.json (V)": "25 figures: name, slug, who, position[6 axes], evidence {ref, toward, did, quote?} (8-17 acts, 0-12 BSB quotes). Pages /figure/<slug>/. Doré plates for 20 of them (none for deborah, hannah, abigail, rahab, barnabas; Barnabas does have a face in personality/faces). OG: r-bible-figure-* (25) and figure-* (20).",
 "PSALM  which-psalm.json + design/quiz-ideas/psalm (V)": "Athanasius only. 53 results and 78 /psalm/<n>/ pages, each with a 'When to pray it' section from the Letter to Marcellinus (TLG Greek). Article how-to-pray-the-psalms.",
 "SLS  demos/sounds-like-scripture/pool.json (V, verbatim-substring checked)": "Augustine, Confessions 13; Hermas 21; Clement of Rome 9; Ignatius 9; Epistle of Barnabas 8; Diognetus 2; Polycarp 1; 2 Clement 1; Clement of Alexandria 1; a Kempis 62; Julian of Norwich 15; Josephus 9; Bunyan 1. Full texts are on disk but have 0 lines pooled: City of God, Boethius's Consolation, Pascal.",
 "WSI  demos/who-said-it/pool.json (V, Glyssen labels)": "Bible speakers only: David 82, Jesus 82, Moses 80, Peter 31, Paul 25, Joseph 17, Jeremiah 17, Isaiah 13, Daniel 12, Abraham 11, John the Baptist 8, Elijah 7, Hannah 5, Gideon 4, Jonathan 3, Mary 3, Martha 3, Nehemiah 2.",
 "ARTICLES (V)": "Chrysostom (Homily 19 on Ephesians) in how-to-become-more-grateful. Athanasius in how-to-pray-the-psalms. Reformation article: Luther 13, Zwingli, Calvin, Cranmer, Augustine 1. Front matter has `quizzes:` but no `people:` field.",
 "OTHER QUIZZES": "Sins: Gregory the Great 6 mentions, Dante 7, Aquinas 3, Evagrius 1. Gifts: only Bible people as gift examples (Timothy, Philip, Barnabas, Titus, Tabitha, Stephen, Priscilla, Aquila, Phoebe, Onesiphorus, Lydia, Gaius, Apollos, Agabus). Tradition and compare data mention Luther 97, Wesley 76, Calvin 67, Campbell 13, Wimber 11, Zwingli 9, Menno 9, Chrysostom 8 (his liturgy), Basil 7, Cranmer 7, Whitefield 6, Augustine 5, John of Damascus 5. These are mentions in prose, with no structured person fields."
},

"people_with_pages_22 (all: WEC V + FR R + W qid)": [
 {"k":"justin","qid":"Q185117","page":"/early-christian/justin-martyr/","V":"c.100-c.165; Samaria, Ephesus, Rome; 9/23 positions, 5 lines shown, 4 hidden; pair irenaeus; PD icon","R":"8 stories, 7 temperament, 8 genuine lines, 4 misattributed, 28 opinions; feast 1 June (Cath)","W":"1 Jun"},
 {"k":"irenaeus","qid":"Q182123","V":"c.130-c.202; 8/23, 6+2; pair justin; PD 1901 window","R":"8/7/8/5/29; feast 28 Jun (Cath), 23 Aug (Orth)","W":"28 Jun only"},
 {"k":"clement-alex","qid":"Q188883","V":"14/23, 12+2; pair origen; PD Ingres","R":"5/5/8/3/26; Episcopal 5 Dec, dropped from the Roman Martyrology","W":"4 Dec","other":"SLS 1 line"},
 {"k":"tertullian","qid":"Q174929","V":"16/23, 10+6; status note; pair cyprian; imagined likeness 1584","R":"9/7/20/6/46; not a saint","PR":"none","PX":"impatient"},
 {"k":"origen","qid":"Q170472","V":"11/23, 8+3 (2 recorded by others); status note; pairs jerome, augustine, clement; imagined likeness","R":"7/5/6/4/22; not a saint"},
 {"k":"cyprian","qid":"Q190240","V":"11/23, 8+3; pair tertullian","R":"9/6/8/5/28; 16 Sep (Cath), 31 Aug (Orth)","W":"16 Sep"},
 {"k":"lactantius","qid":"Q209102","V":"11/23, 10+1; status note; no pairs; 'possibly' portrait","R":"7/5/6/3/25; not a saint"},
 {"k":"antony","qid":"Q170547","V":"12/23, 9+3 (12 of his 12 cells recorded by others); no pairs","R":"10/7/10/4/30; 17 Jan","PR":"Hearth kindred (Athanasius, Life); Cassian names him in the Watcher line","PX":"joyful, even, humble, peacemaker, kindly, simple, giver","W":"17 Jan"},
 {"k":"martin","qid":"Q133704","V":"10/23, 5+5 (all via Sulpicius); no pairs; CC0 El Greco","R":"8/6/7/3/24; 11 Nov","PR":"Oak kindred (new, uncommitted); Giver line picture","PX":"meek and even, soft-hearted, giver, peacemaker, one grave fall","W":"11 Nov (no Orthodox date)"},
 {"k":"macrina","qid":"Q239081","V":"8/23, 6+2 (all via Nyssa); pairs basil, nyssa; only woman in WEC","R":"7/6/4/2/12; 19 Jul","PR":"named in Basil's Herald kindred text"},
 {"k":"nazianzen","qid":"Q44011","V":"10/23, 8+2 (1 our translation); pairs basil, jerome","R":"6/6/8/1/20; feast not in note","PR":"Still Water kindred; herald-stillwater opposite; 10 HELP-card notes from Oration 2","PX":"timid, gentle, withdrawn, 'listless as Basil charged'","W":"2 Jan (Cath), 25 Jan (Orth)"},
 {"k":"basil","qid":"Q44258","V":"14/23, 12+2 (2 ours); pairs nazianzen, nyssa, macrina","R":"7/7/8/2/25; feast not in note","PR":"Herald kindred (as a young man); herald-stillwater opposite","W":"2 Jan, 14 Jun (old Roman); no 1 Jan (Orth)"},
 {"k":"nyssa","qid":"Q191734","V":"8/23, 5+3; pairs basil, macrina","R":"7/5/6/2/15; 9 or 10 Jan (E), 9 Mar (W)","PR":"cited as the source of Basil's kindred text","W":"10 Jan only"},
 {"k":"ambrose","qid":"Q43689","V":"17/23, 15+2; pair augustine","R":"8/6/10/5/31; 7 Dec","PR":"Advocate line picture; Theodosius tidbit","W":"7 Dec, plus a stray 20 Dec"},
 {"k":"chrysostom","qid":"Q43706","V":"18/23, 14+4 (1 ours); pair cassian","R":"9/5/8/4/23; feast not in note; caution: Against the Jews","PR":"Forge kindred; quoted in forge-hearth opposite, BOATS and On the Priesthood","other":"gratitude article; Compass Orthodox liturgy mention","W":"13 Sep (W), 27 Jan (relics); no 13 Nov"},
 {"k":"jerome","qid":"Q44248","V":"17/23, 14+3 (1 ours); pairs augustine, origen, nazianzen","R":"7/6/10/5/34; 30 Sep (W), 15 Jun (E)","PR":"Forge kindred (Letter 48)","PX":"hostile-witness warning (Palladius)","W":"same as R"},
 {"k":"augustine","qid":"Q8018","V":"21/23, 18+3 (1 ours); pairs ambrose, jerome, origen, cassian","R":"10/7/10/6/35, 41 topic stances; 28 Aug; Orthodox 'Blessed'","PR":"Spark kindred (as a young man); deepwell-spark opposite with Monica","other":"SLS 13 Confessions lines; Reformation article","W":"28 Aug, 15 Jun (Orth)"},
 {"k":"cassian","qid":"Q313795","V":"11/23, only 4 shown + 7 hidden; pairs augustine, chrysostom","R":"8/5/6/4/17; 29 Feb (Orth), 23 Jul Marseille","PR":"the whole private 'where the fight is' page (10 quotes), Cassian's lines of service (Conference 14), face on the start page","W":"23 Jul only"},
 {"k":"boethius","qid":"Q102851","V":"7/23, 5+2; no pairs","R":"7/6/8/4/18; 23 Oct Pavia","other":"Consolation full text on disk, 0 SLS lines","W":"23 Oct, 'blessed'"},
 {"k":"benedict","qid":"Q44265","V":"7/23, 4+3 (1 ours); pair gregory","R":"10/6/6/3/21; feast not in note","PR":"Oak kindred (new); Shepherd line picture","W":"11 Jul (W), 14 Mar (E), 21 Mar (old)"},
 {"k":"gregory","qid":"Q42827","V":"12/23, 9+3 (1 ours); pair benedict","R":"6/6/6/4/22; feast not in note","PR":"Deep Well kindred; Teacher line; the test's own source (about 80 quotes)","other":"sins quiz","W":"3 Sep (W), 12 Mar (E)"},
 {"k":"isaac","qid":"Q462966","V":"11/23, 10+1; no pairs","R":"3/4/6/3/16; 28 Jan (Orth)","PX":"no temperament recorded in any early public-domain source","W":"28 Jan"}
],

"researched_no_page_14 (R only, unless marked)": [
 {"k":"athanasius","qid":"Q44024","R":"8/6/7/4/22; 2 May (Cath), 18 Jan + 2 May (Orth); 5 portrait candidates (1 CC0)","V":"Psalm quiz (53 results, 78 pages), psalms article, source for Antony's kindred text, Compass Orthodox profile line"},
 {"k":"ignatius","qid":"Q44170","R":"7/7/9/9/25; 17 Oct (W), 20 Dec (E); 5 PD portraits","V":"SLS 9 lines","W_error":"gives 17 Feb for the West"},
 {"k":"perpetua","qid":"Q771956","R":"9/5/8/4/9; 7 Mar; 4 PD mosaics (one dating unclear)"},
 {"k":"hippolytus","qid":"Q207113","R":"7/5/6/6/21; 13 Aug with Pontian; 1 portrait candidate is CC BY 4.0","W_error":"gives 5 Oct"},
 {"k":"novatian","qid":"Q222890","R":"8/5/7/5/16; not a saint; NO portrait exists"},
 {"k":"syncletica","qid":"Q3394405","R":"3/4/6/1/14; 5 Jan; 17 of her lines are own renderings"},
 {"k":"moses-black","qid":"Q200977","R":"8/5/6/2/16; 28 Aug; racially charged sayings must not be quoted","V":"BOATS in the personality test"},
 {"k":"arsenius","qid":"Q530065","R":"4/3/3/1/8; 8 May (E), 19 Jul (W)","V":"Still Water kindred + BOATS; face on file (PD Ohrid fresco)"},
 {"k":"poemen","qid":"Q1255493","R":"5/4/3/1/11; 27 Aug"},
 {"k":"ephrem","qid":"Q200608","R":"6/5/5/4/16; feast not in note","V":"Caregiver line picture + famine tidbit; face on file (PD Nea Moni)","W":"28 Jan (E), 9 Jun (W), plus strays"},
 {"k":"pelagius","qid":"Q162593","R":"5/4/6/5/14; condemned"},
 {"k":"paulinus","qid":"Q132473","R":"10/6/6/2/17; 22 Jun; 16 own renderings"},
 {"k":"climacus","qid":"Q317072","R":"6/4/5/2/17; 22 own renderings (no public-domain English); 4th Sunday of Lent","V":"one paraphrase in the personality test's 'Who you are in Christ'"},
 {"k":"hilary","qid":"Q44344","R":"8/5/5/2/14; January feast (Hilary term)","W":"13 Jan (W), 14 Jan"}
],

"personality_only_or_named_only": {
 "monica (Q234689)": "V: deepwell-spark opposite story (Confessions quotes checked); face = Ary Scheffer 1855, PD. Nothing else anywhere. W: 27 Aug.",
 "PX temperament only (R)": "Macarius the Great Q43920; Pambo Q3650657; Paul the Simple Q3773019; John the Dwarf Q4202472; Agathon (no QID found, no PD portrait); Theodosius I Q46696 (ordered a massacre; his Orthodox commemoration is unverified). Each has 1-4 readings and a named Commons portrait.",
 "named in test text, no data": "Abba Nastir (Watcher tidbit); Macarius the hospitaller of Alexandria (Host); Abbot John near Thmuis (Shepherd); Elisha; Lot; Sulpicius Severus, Possidius, Palladius (biographers, cited as sources).",
 "game or source authors": "Clement of Rome Q42887, Polycarp Q192371, Hermas Q3134197, a Kempis Q220976, Julian of Norwich Q236699 (verbatim game lines only); Evagrius, Maximus, Dorotheus, John of Damascus, Mark the Ascetic (key passages in the personality research only).",
 "about 90 more names with 1-7 stances in FT": "Eusebius 7, Theophilus of Antioch 5, Cyril of Jerusalem 4, Isidore of Seville 4, Leo the Great 3, Minucius Felix 3, Athenagoras 3, Tatian 3, Methodius 3, Optatus 3, Jovinian 3, Melania, Paula, Egeria, Columba, Simeon Stylites and others. Too thin for a page today."
},

"bible_figures_25 (BF V, pages exist)": "abraham, moses, joseph, david, jonathan, elijah, nehemiah, daniel, john-the-baptist, peter, paul, gideon, deborah, esther, ruth, hannah, abigail, rahab, mary-of-nazareth, martha, mary-magdalene, barnabas, jesus, judith, tobit. PX temperament readings exist for peter, moses, elijah, martha, barnabas, paul, david, abigail, jonathan, john-the-baptist, gideon, daniel. Personality (V) uses Elijah (Deep Well + Watcher), Moses and Gideon (Lookout), John the Baptist (Oak), Peter (Herald), Martha (lookout-oak), Barnabas and Paul (forge-hearth), Abraham (Host). Personality figures WITHOUT any page: Isaiah, Jeremiah, Mary of Bethany (Q239058). Isaiah and Jeremiah have Who Said It lines and faces. Wikidata feasts exist for most; judges and prophets are thin.",

"what_a_hub_page_can_show_from_V_alone": {
 "the 22": "name, dates, where, one-line who, hook story, status note, portrait + credit, 'Where he stood' on 7-21 of 23 questions with 4-18 of their own lines and the work each is from, crossed paths (15 pairs; none for Lactantius, Antony, Martin, Boethius, Isaac), personality-test appearance (11 of 22), the quiz card, the reader's own answers (mine.ts), and an OG card.",
 "athanasius": "his Psalm advice + links to 78 psalm pages + the article (no portrait on the site yet).",
 "ephrem, arsenius, moses-black, monica, climacus": "only their personality-test paragraph and face (no face for Moses the Black or Climacus).",
 "missing everywhere at V level": "feast days, other names, life timeline, full works list, famous quotes beyond the 23 topics, misattributed lines, patronages, iconography."
},

"hearth_spark_candidates_already_in_research (R, check before use)": {
 "hearth (light-hearted, quiet)": "Macrina: 'in every way she tried to be cheerful, both taking the lead herself in friendly talk' (Nyssa, Life of Macrina), while dying at her home community. Paulinus of Nola: warm and serene; 35 years at the quiet shrine at Nola; gentle with simple people (Augustine Letters 25, 27, 30; City of God I.10; Carmen 27). Weaker: Cyprian, 'grave and joyous' (Pontius, Life 6).",
 "spark (light-hearted, restless)": "Justin: 'I took it rather impatiently... I was not able to endure longer procrastination' and '(In jest.)' (Dialogue with Trypho 1, 2, 142). Gregory of Nyssa: playful and self-mocking (Letter 8), but also 'simple', tender and tearful. Weaker: Ephrem (playful hymns, but 'naturally prone to passion', Sozomen 3.16), Perpetua (joyful and bold)."
},

"gaps": [
 "feast days East and West, as structured fields: about 21 of 36 FR status notes carry some dates; Wikidata is partial, often names no church, and is sometimes wrong (see flags)",
 "patronages (Wikidata's inverse 'patron saint' lists places and churches, e.g. Martin 678 items, not causes like soldiers)",
 "titles and ranks as fields (Doctor of the Church, Three Holy Hierarchs, Cappadocian, Desert Father or Mother, 'Blessed' in Orthodox usage); only in status-note prose",
 "a short life / timeline (birth, conversion, ordination, exile, death), century and region tags for browsing, manner of death / martyrdom",
 "key works with a one-line gist and free-to-read links (WEC names only the cited works; Wikidata's works list is partial)",
 "places with coordinates for a map (the Wikidata P19/P20 query timed out; FR 'places' is prose)",
 "iconography: how to recognise them in art (Jerome's lion and red hat, Antony's pig and bell, Martin's cloak, Gregory's dove; FR misattributed notes flag several as legend)",
 "portraits: 14 people need one picked from FR candidates; none exist for Novatian, Agathon or Hermas; no Doré plate for Deborah, Hannah, Abigail, Rahab or Barnabas",
 "a verify pass over the R layer before publishing: stories, temperament, genuine lines, misattributed lines, opinions and hooks for the 14",
 "relationship types (teacher, family, friend, opponent): the 15 V pairs are prose; FR sparring is names only",
 "pronunciation (Nazianzus, Climacus, Syncletica): no data",
 "FAQ-style facts for search (Is Origen a saint? Who baptised Augustine?): derivable from status notes and pairs, not stored as fields",
 "no `people:` cross-link field on articles, and no mapping from people to personality types, lines or psalms except lib/person-links.ts (picture key to page)"
],

"public_domain_sources_to_fill_them": {
 "lives and timelines": "Dictionary of Christian Biography (Wace & Piercy 1911, on CCEL); Catholic Encyclopedia 1907-14 (New Advent); ANF/NPNF introductions and prolegomena (Schaff, CCEL scans); Jerome's Lives of Illustrious Men (NPNF2 v3: short entries for Justin, Irenaeus, Clement, Tertullian, Origen, Cyprian, Lactantius, Hilary, Ephrem, Basil, both Gregorys, Ambrose, Chrysostom) and Gennadius's continuation; Eusebius, Socrates, Sozomen, Theodoret (NPNF2 v1-3); Gregory of Tours.",
 "first-hand lives": "Athanasius, Life of Antony; Possidius, Augustine; Paulinus, Ambrose (Kaniecka 1928, US PD); Sulpicius, Martin (Life, Dialogues); Nyssa, Life of Macrina; Nazianzen, Oration 43 (Basil); Palladius, Dialogue on Chrysostom and Lausiac History (Lowther Clarke 1918); Gregory's Dialogues II (Benedict); Pontius, Cyprian; Passion of Perpetua; Budge's Paradise of the Holy Fathers (desert fathers and mothers).",
 "feasts and patronages": "General Roman Calendar 1969 (dates are facts); Roman Martyrology, English 1916 edition (archive.org, PD; gives pre-1969 and local dates); Butler's Lives (1866 edition) and Baring-Gould's Lives of the Saints (1872-77), both arranged by day and giving patronages; Catholic Encyclopedia; Menologion of Basil II (c. 985; PD miniatures ordered by the Byzantine calendar, September to February); OCA / GOARCH calendars as a cross-check of dates only (their text is copyrighted); Coptic Synaxarium (Basset/Forget editions, PD) for Coptic dates.",
 "iconography": "Anna Jameson, Sacred and Legendary Art (1848, PD); Catholic Encyclopedia.",
 "ids and cross-checks": "Wikidata (CC0): QIDs for all but Agathon are in hub/audit/title-qid.json; dates with precision; P800 works; P18 image; P411 canonisation status. Use it to cross-check, never as the only source for a feast."
},

"data_quality_flags": [
 "Wikidata feast errors against the research: Ignatius West '17 Feb' (research: 17 Oct); Hippolytus '5 Oct' (research: 13 Aug). Wikidata also lacks, from memory so verify: Chrysostom 13 Nov (E), Basil 1 Jan (E), Irenaeus 23 Aug (E), Martin 12 Oct (E), Monica 4 May (E), John the Baptist 29 Aug.",
 "New Advent pages say they were revised by their editor and carry a copyright notice; the underlying ANF/NPNF translations are PD. For strictly PD wording, cross-check against the CCEL Schaff scans.",
 "The PD source texts saved by the personality research live in ANOTHER session's scratchpad, which is temporary: C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/8320fd9e-53fe-4117-91cb-ee92de243e5b/scratchpad/gregory/sources/ (figures-saints: Life of Antony, Confessions, Sulpicius on Martin, Life of Macrina, Dialogues I-II, Lausiac History, Budge's Paradise vol. 2, Socrates, Sozomen, Nazianzen orations and letters, Jerome letters, Basil letters, Life of Ambrose, Baring-Gould January, and more; also figures-bible, opposites and others). Copy them somewhere lasting if the hub will use them.",
 "demos/sounds-like-scripture/raw/ is gitignored (Confessions, City of God, Consolation, Clement of Alexandria, Apostolic Fathers, Josephus, Pascal). Per the failed-deploy lesson, no build script may read it.",
 "fathers/research/verified/ is an empty folder. VERIFY.md covers only what quiz #4 shows.",
 "gregory-the-great.jpg: the Commons file name says Saraceni and the credit says Ribera. The research notes the reattribution, so it is consistent, not an error.",
 "Uncommitted working-tree state: results.mjs Oak kindred (Martin, Benedict, John the Baptist), a new faces/john-the-baptist.jpg, and lib/person-links.ts, which maps a picture key to /early-christian/ or /figure/ and returns null for Jeremiah, Isaiah, Arsenius, Monica and Mary of Bethany."
]
}
```