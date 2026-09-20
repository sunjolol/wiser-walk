# What are your spiritual gifts? All gifts in: the closing edit

Status: **closed, nothing wired.** Nothing under `site/` was touched and nothing was committed. Two files were written: this record and `gifts-all-final.json` (the data an engineer wires). Read for it: the editor's proposal (`gifts-all-edit.md`), the four reviews (`gifts-all-review-pentecostal.md`, `-cessationist.md`, `-catholic-orthodox.md`, `-method-evidence.md`), `QUIZ-BLUEPRINTS.md` (the six rules), `spiritual-gifts.ts`, `gifts-final.md`, `AUDIT-LOG.md` decision 1, the Compass's Gifts axis in `site/src/data/compass.json`, and `site/src/lib/strategies/category.ts` for how a result is named. Every verse quoted or described below was opened with `node audit/tools/webbe.mjs` (World English Bible British Edition). Every word count and every check below was run by script.

**In numbers.** Four reviews raised 55 findings and one observation: 1 blocker, 25 majors, 29 minors. Each was judged three ways, as the Compass audit did: is it accurate (the verse was opened and the statement reread), is it a real fairness or method problem, is the change necessary. **48 applied, 6 part-applied, 1 rejected; the observation applied. The one blocker is closed.** The instrument is nineteen gifts and fifty-seven statements (38 keyed +1, 19 keyed -1); every gift has exactly one reverse item and exactly one "others" statement; the longest statement is 21 words. Of the editor's 26 new or changed statements, 11 changed again here; the six "others" replacements for the old gifts stand as the editor wrote them.

Direction: **+1** agreeing raises the gift, **-1** agreeing lowers it. **O** marks the "others" statement.

---

## For the owner, in plain words

1. **The discernment statement you could not follow last time is gone.** "I decide something is off about a person before I could say what it is" is replaced by **"I have raised a worry about something said to be from God, and the people I took it to later agreed."** The Bible passage is about weighing what is said in God's name, not about sizing people up. The new sentence says nothing about how you knew, so both a Pentecostal and someone who believes these gifts stopped after the apostles can answer it. A second discernment statement changed for the same reason and now reads **"I have stopped listening to a speaker or writer I liked because of what they taught about God."**
2. **Every gift is now measured the same way.** Each of the nineteen has one statement about what other people bring you or say of you, one about what you do or what has happened, and one turned the other way round. Before, six gifts had no "other people" statement, so a newcomer was steered towards those six.
3. **The first healing statement changed.** The editor had "People have told me they got better after I prayed for them." Most illness gets better, so that is true of nearly anyone who prays for sick friends, and a pastor who believes the gift stopped after the apostles would have been shown healing as his top gift. It is now **"People have asked me to pray for them because someone they know got better after I prayed."** That is true only when people seek you out for it.
4. **Tongues, corrected.** The editor told you that someone who prays in tongues only on their own "will not have it as their headline". That was not quite so: as the engine stands, that row can be named jointly whenever the reader's best other row is only one step higher (about one result in eleven in the method reviewer's rough run). The engineer has a one-line fix below, which also cuts the number of "nothing stood out" results for everybody. The tongues page now tells the reader, not only you, why the row fills part of the way: Paul asks for an interpretation when a church meets, and tells a speaker with nobody to interpret to keep silent in church and "speak to himself and to God", so a part-filled row is no mark against anyone.
5. **Fifty-seven statements, about eight minutes.** `HANDOFF.md` says "under about fifty". Nineteen gifts at three each is fifty-seven, and the scope for this pass fixed both numbers, so nothing was cut.
6. With healing, miracles, prophecy, tongues and interpreting tongues a reader can see which gift a statement is about. There is no honest way round it, and the intro says so.

**One question for you** is at the very end of this file. Everything else was decided.

---

# 1. The verdict on every finding

Severity is the reviewer's own. **A** applied, **P** part-applied, **R** rejected.

## 1.1 The Pentecostal review (8 majors, 5 minors)

| # | sev | finding | verdict | reason in one line |
|---|---|---|---|---|
| 1 | major | Tongues slot 3: "someone else" shuts out the speaker who interprets | **A** | 1 Corinthians 14:13 tells the speaker to pray that he may interpret; the statement now ends "and an interpretation was then given", whoever gave it. |
| 2 | major | Tongues summary quotes only "no one understands" from 14:2 | **A** | The clause the verse turns on is restored: "speaks not to men, but to God, for no one understands" (verbatim, checked). |
| 3 | major | The page does not tell the reader how the tongues row is built | **A** | The summary now says the row fills only when both are true and why, with 14:28 quoted so the part-filled reader is not marked down (method finding 3's other half). |
| 4 | major | No discernment statement has the object of 14:29 and 1 John 4:1 | **A** | Slot 3's object is now "something said to be from God"; the summary says "taught about God or said to be from him". |
| 5 | major | The word of knowledge is not an even split (67 against 33) | **P** | Arithmetic confirmed. The reviewer's own fallback is taken: the claim of an even split is gone and the page says two statements ask about the first thing and one about the second. His neutral reverse item is not taken: "as much in the dark as they are" measures being well-informed about anything, and disagreeing with it sounds boastful (rule 3); the method reviewer tried two others and said not to retry. |
| 6 | major | All four healing acts are apostles' | **A** | Acts 9:17-18 (Ananias, whom 9:10 calls "a certain disciple") replaces Acts 9:32-35; every name in the sentence is inside the range, and the sending by the Lord is kept in. |
| 7 | major | `low` quotes 12:30 and stops one verse short of 12:31; both or neither | **A** | Taken by its "neither" branch, because the cessationist reviewer objected to the same quotation from the other side (his finding 4): 12:30 leaves `low` and stays where it already is, as a listing passage on three gift pages. |
| 8 | major | The miracles summary lacks the limit the healing summary has | **A** | Added: "they cannot tell this gift apart from an answer to prayer". Both ends wanted it. |
| 9 | minor | "being given a fact" hides who gives | **P** | The clause is gone: the summary no longer describes either reading in the site's voice (method finding 9b), only what the statements ask, and the listing verse printed above it says "according to the same Spirit". "The Spirit making known" was not added to a sentence about statements that are silent on how on purpose. |
| 10 | minor | "Whether any of it was from God" has the ring of doubt | **A** | The sentence is replaced by the one all six pages now share, which has no "any of it". |
| 11 | minor | The `disputed` note guards in one direction | **A** | Now "does not say what any of it was, whether a miracle, a healing, a word from God or none of these". |
| 12 | minor | The six are named as "the" disputed gifts while three more pages carry a dispute sentence | **A** | Applied in a form that can be checked on this site: `disputed` and the draft note now say Paul names all six in one sentence with the word of wisdom, faith and the discerning of spirits, and that Christians disagree about which of the gifts in that sentence God still gives. |
| 13 | minor | No badge, grouping or second-class placement for the six | **A** | Written down as a rule for the engineer, with a test (section 6). |

## 1.2 The cessationist review (1 blocker, 4 majors, 6 minors, 1 observation)

| # | sev | finding | verdict | reason in one line |
|---|---|---|---|---|
| 1 | **blocker** | Tongues summary: "These statements ask only whether this has happened to you" points back at the definition and grants the identification the statements were written not to grant | **A, closed** | Accurate: "this" can only mean "a language the speaker has never learnt". The sentence now repeats the statements' own words ("words from no language you know"), and adds "The statements cannot say what those words were." His sentence "Christians disagree about whether the two are the same thing" is a claim about what Christians hold that nobody opened a source for, so the page says instead "This page does not say whether those are the same thing", which does the same work and attributes nothing. |
| 2 | major | The six names travel on the headline and the share text with no sentence beside them | **A** | The engine's own rule ("a sentence that travels with a name on the page and not on the card someone posts is the fairness problem"). The travelling sentence is written, long and short, in section 6, with his two conditions: it prints whenever one of the six is printed by name, not only when it leads, and it prints once. The `disputed` note's last two sentences now fit the result page as well as the intro. |
| 3 | major | Prophecy summary stops one verse short of "revelation", lacks a guard, and gives advice in the site's voice | **A** | 14:30 is quoted verbatim beside 14:29; "He also tells the church to weigh it" became "He also writes"; the guard is added in a form that does not rule on whether preaching is prophecy ("A preacher can agree with them, and so can a friend whose advice came at the right time"); "is for your church to weigh" became the shared sentence, which says "to say", not "to weigh". |
| 4 | major | `low` uses 12:30 in a way that answers the disputed question by arrangement | **A** | Met by removal (with Pentecostal finding 7). Adding his second reason beside it and 12:31 beside that would have turned the low-row note into the argument. |
| 5 | major | Interpretation slot 2 cannot be answered truthfully by a reader who once did this and no longer believes it | **A** | His wording, verbatim: "... I have told the others what I believed it meant." It matches prophecy slot 3's "I believed". |
| 6 | minor | Tongues slot 3: "said what they meant" grants a meaning | **A** | Closed a different way: "an interpretation was then given" grants nothing about whether it was right, and it also meets Pentecostal finding 1, which his own wording ("someone else said") did not. |
| 7 | minor | Healing's reverse item scores a duty asked of every church; fix it in the summary | **A** | The guard sentence now quotes James 5:16 ("pray for one another, that you may be healed"), verbatim. James 5:14-15 stays off the recorded acts. |
| 8 | minor | Discernment summary: "Paul tells the church to weigh" decides who "the others" are | **A** | Now "Of prophets speaking in church Paul writes, 'let the others discern'". |
| 9 | minor | The interpretation summary never says what the statements ask or cannot see | **A** | His two sentences, verbatim. |
| 10 | minor | The notes say the disagreement is about six; for many it is about nine | **A** | Same sentence as Pentecostal finding 12. |
| 11 | minor | The two readings of the word of knowledge are uncited | **A** | Went further than he asked: the attribution is gone. "Christians read it in more than one way" stays and is on the citation list (section 7). |
| obs | | "Every gift in the lists Paul and Peter give is here" will be tested | **A** | "Every" is gone from the draft note (with method finding 20). |

## 1.3 The Catholic and Orthodox review (4 majors, 7 minors)

| # | sev | finding | verdict | reason in one line |
|---|---|---|---|---|
| 1 | major | `disputed` draws two sides where the Compass draws three | **A** | The Compass's own audited sentence is added, word for word in substance: "Pentecostal and charismatic Christians seek them openly, while Catholic and Orthodox teaching receives them with gratitude and warns against seeking them rashly." Nothing new is claimed. |
| 2 | major | Only the prophecy page says anyone weighs anything | **A** | One sentence, identical on all six pages, prophecy included: "Whether what happened was this gift is for your church and those who lead it to say, not this page." "To say", not their "to weigh", because the cessationist reviewer (3c) will not have 14:29 applied to a member's words today; his church's leaders do have an answer to give, which is no. |
| 3 | major | The new discernment statement scores the self-appointed watchman highest | **A** | "Warned people" became "raised a worry ... the people I took it to later agreed": the same event, reported as something submitted to others. |
| 4 | major | The discernment summary leaves out what the name chiefly means in their two traditions | **P** | Their fallback that names no tradition is taken ("which many Christians also call the discernment of spirits and take to a confessor or spiritual father"), because the sources for the named version (Ignatius, Climacus, Cassian) were not opened by anybody. On the citation list. |
| 5 | minor | "In church" means during the service and shuts out the Catholic charismatic prayer meeting | **A** | "At church" in prophecy slot 3 and tongues slot 3. |
| 6 | minor | Tongues reverse item has the Latin hole the editor closed one slot down | **A** | Their wording, verbatim: "Every word I have ever prayed was one I knew or had been taught." |
| 7 | minor | Healing slot 3: "prayed with" builds the top of the row on the bedside | **A** | "Prayed for", which is James 5:16's own word. The reverse item keeps "pray with them", where the bedside is the point. |
| 8 | minor | The word of knowledge is measured as Bible recall only | **A** | Slot 3 now asks about "what Christians believe"; the summary says "what the Bible and Christian teaching say". Slot 1 stays about the Bible. |
| 9 | minor | Isaiah 11: "wisdom" and "knowledge" are now both names a Catholic was taught at confirmation | **P** | The sentence is added to the wisdom page, where the bare name collides. It is not added to the knowledge page: the name there is already "the word of knowledge", the intro carries the point, and that page is the second longest. Renaming "wisdom" to "the word of wisdom" is a name the owner has already seen and approved, so it is the one question put to him. |
| 10 | minor | `description` and `introShort` still send the reader to peers only | **A** | Both now say "your pastor or priest". |
| 11 | minor | The share line should be a condition of wiring | **P** | The travelling sentence is a condition of wiring (section 6). `shareTitle` stays: "Where my answers pointed" is the first audit's wording and fits all nineteen, and their replacement is a sentence, not a title. |

## 1.4 The method and evidence review (9 majors, 11 minors)

| # | sev | finding | verdict | reason in one line |
|---|---|---|---|---|
| 1 | major | Healing slot 1 does not tell one reader from another | **A** | Accurate (most illness gets better; a truthful elder who visits the sick scored 83 and was shown healing first). His wording, verbatim. It asserts no healing, counts no praying, and is how a church comes to recognise the gift. Three chairs had passed the old one; none of their reasons is lost ("after", not "because"). |
| 2 | major | The `disputed` note promises a result the scoring does not deliver | **A** | "Will most likely see not found here" is gone; the note now says a row can still fill for that reader and why. |
| 3 | major | What the owner was told about tongues is not what the engine does | **A** | Confirmed in `category.ts`: every row within one rung (8.8 points) of the leader is named, and 67 is within one rung of 75. The owner is told correctly above; the one-condition engine fix is a condition of wiring (section 6); the page quotes 14:28. |
| 4 | major | Knowledge is two statements to one, and its reverse item is teaching's act turned round | **A** | His remedy: keep the three statements and make the page honest about the weighting. The overlap with teaching is recorded in section 4. |
| 5 | major | "Everyone there" and "nobody" include the person praying | **A** | "The others there" and "the people around them". The reader who prayed expecting it is the reader the row is for. |
| 6 | major | Discernment has two "others" statements | **A** | His slot 2, verbatim; slot 3 stays the "others" statement. The pattern (one reverse, one others, one own act or event) now holds for all nineteen. |
| 7 | major | Rows about events fill on one occasion; rows about habits do not | **A** | His sentence is added to `result`. |
| 8 | major | The gift page would print "3 recorded acts" over passages the summary says are not acts | **A** | Confirmed in `axis/[quiz]/[axis].astro` (line 251). Passed to the engineer as a condition of wiring; the JSON shape has no field for it. |
| 9 | major | Three claims nobody opened a source for | **A** | (a) The sentence on wisdom, discernment and faith is replaced by his, every part of which can be checked on this site. (b) The two readings of knowledge are no longer attributed to anybody. (c) "The places where Paul writes of knowledge among a church's gifts" became "three places where Paul writes of knowledge in a church" (Romans 15:14 mentions no gifts; 2 Corinthians 8:7 is a fourth place). |
| 10 | minor | Miracles reverse item: a bystander raises the row, and it is two claims | **R** | Not necessary, and the replacement opened a new hole: a reader who prayed alongside others can truthfully agree that "somebody else was praying", which lowers the row of the reader it is for. The harm named is one rung on a row that still reads "not found here"; the contrast form is house practice (teaching, giving); three chairs passed it. Kept. |
| 11 | minor | Tongues slots 1 and 2: the distinguishing words come last; a taught prayer slips through slot 1 | **A** | Slot 2 in his order ("words that belong to no language I know and that nobody taught me"); slot 1 in the Catholic and Orthodox reviewers' wording, which closes the same hole. |
| 12 | minor | Tongues slot 3 is two claims by design; say so | **A** | Listed in section 7 as the one deliberate exception to rule 1. |
| 13 | minor | Giving's replacement is two claims, and the reason given for the removal is wrong | **P** | The reason is corrected (the old statement goes because its second half is an inner state; it was not the only two-claim statement). The wording stays: his one-claim form rests on a reputation for giving ("because they know I will give"), which sits worse beside Matthew 6:3-4 than the editor's, and it does not help either reader he names. |
| 14 | minor | The optional line above the scale miskeys the reverse items | **A** | His wording, merged with the sentence two reviewers urged (section 6). |
| 15 | minor | Acts 21:9-14 names Philip, who is in verse 8 | **A** | Now Acts 21:8-14, with Paul's answer in verse 13 added so the sentence says what the range says. |
| 16 | minor | The case for Elymas rests on a verse the page does not cite | **A** | Now Acts 13:6-10, with "a false prophet" in the sentence. |
| 17 | minor | "This page calls nothing a miracle itself", on a page that lists Acts 9:40-42 under miracles | **A** | "They call nothing a miracle themselves." |
| 18 | minor | One Greek word, two glosses on two pages | **A** | "Urge them on" became "encourage them", to match the encouraging page. |
| 19 | minor | The discernment summary says all three statements are about what is "said or taught about God" | **A** | His sentence, extended for slot 3's new object. |
| 20 | minor | "Every gift in the lists Paul and Peter give is here, nineteen in all" | **A** | The draft note now names the lists, puts hospitality beside them in Peter's own terms, and drops "every". |

## 1.5 Where two reviewers pulled opposite ways

| question | one way | the other way | what was done |
|---|---|---|---|
| 1 Corinthians 12:30 in `low` | Pentecostal 7: add 12:31 beside it, or take it out | Cessationist 4: add "many Christians believe those were given only for the time of the apostles" beside it | Taken out. Both accept that; either addition alone favours a side, and both together turn a comfort into an argument. |
| Who judges what happened | Catholic and Orthodox 2: "for your church and those who lead it to weigh" on all six pages | Cessationist 3c: "is for your church to weigh" applies 14:29 to today | "... is for your church and those who lead it to say, not this page." A church that holds none is given still has something to say. |
| Discernment slot 3 | Pentecostal 4 wants the object changed; Catholic and Orthodox 3 want the verb changed | Method 6 wants one "others" statement, not two | All three fit one statement and a new slot 2. |
| The line above the answer scale | Pentecostal and cessationist: ship "if something has never happened to you, disagree is an honest answer" | Method 14: that rule miskeys the reverse items | Both kept: "If a sentence says a thing has happened and it never has, disagree is an honest answer. Some sentences say a thing has not happened, so read each one to the end." |
| Knowledge's reverse item | Pentecostal 5: a neutral reverse item | Method 4: none survives; do not retry | The fallback both offered. |
| Tongues slot 3's ending | Pentecostal 1: not "someone else" | Cessationist 6: "someone else said what they believed it meant" | "And an interpretation was then given" meets both. |
| Acts 2:6 beside 1 Corinthians 14:2 | Cessationist 1: say Christians disagree whether they are the same thing | Method 9: no claim about what Christians hold without a source | "This page does not say whether those are the same thing." |
| Healing slot 1 | Pentecostal, cessationist, Catholic and Orthodox: pass | Method 1: replace | Replaced. The three passed it for what it avoids (no causal claim, no counting); the replacement avoids the same things and also tells readers apart. |
| Prophecy's guard | Cessationist 3b: "cannot tell this gift apart from preaching" | The editor's unsolved item 5: the page must not rule on whether preaching is prophecy | "A preacher can agree with them ...; the statements cannot see more than that." |

---

# 2. The final instrument: the six new gifts

The running-order numbers are under the gift order and rounds proposed in section 6. Two sentences are identical on all six pages so that no gift gets a warmer or cooler version:

> **[W]** Whether what happened was this gift is for your church and those who lead it to say, not this page.
>
> **[S6]** Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.

Each gift page then prints the existing link line once ("The Theology Compass sets that disagreement out in both sides’ own words.", through `groupHref()`; slug `gifts`, key `spirit`).

## 2.1 The word of knowledge  (`knowledge`)

**The passage it is named from:** 1 Corinthians 12:8: “and to another the word of knowledge according to the same Spirit”

**Summary as the gift page prints it:** The passage names a word of knowledge, something said, and nowhere explains it, and Christians read it in more than one way. These statements ask about two things: having what the Bible and Christian teaching say ready when people need it, and knowing a fact about someone that nobody had told you. Two of the three ask about the first, so a reader with only the second will see this row fill less. They cannot see how you came to know anything. The New Testament calls no recorded act a word of knowledge, so the passages below are not acts: they are three places where Paul writes of knowledge in a church. [W] [S6]

**What Paul writes about it** (not acts; the page heading must say so, section 6):

- **1 Corinthians 1:4-7.** Paul writes that he always thanks his God for the grace of God given to the Corinthians in Christ Jesus: that in everything they were enriched in him, in all speech and all knowledge, even as the testimony of Christ was confirmed in them, so that they come behind in no gift, waiting for the revelation of our Lord Jesus Christ.
- **1 Corinthians 14:6.** Paul asks what he would profit them if he came speaking with other languages, unless he spoke to them by way of revelation, or of knowledge, or of prophesying, or of teaching.
- **Romans 15:14.** Paul writes that he is persuaded the Christians at Rome are full of goodness, filled with all knowledge, and able also to admonish others.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 8 | +1 | 17 | | In a discussion I end up quoting the part of the Bible people were trying to remember. | The editor's plain rewrite of Drafter B's spare. Passed by all four reviews. Unchanged. |
| 38 | +1 | 15 | O | People have asked me how I knew something about them that nobody had told me. | Drafter A K2 with the editor's "nobody had told me". The Pentecostal reviewer called it the best sentence in the edit; all four passed it. Unchanged. |
| 50 | -1 | 17 | | When a question about what Christians believe comes up, I am the one asking rather than answering. | Drafter B K5, widened from "about the Bible" by Catholic and Orthodox finding 8 (their wording): a catechist who has the Church's answer ready and does not quote chapter and verse was being scored as a newcomer. |

How the row scores, said on the page: a reader with only the first thing reaches 67; a reader with only the second reaches 67 if middling on the other two and 33 if new to the faith.

## 2.2 Healing  (`healing`)

**The passages it is named from:** 1 Corinthians 12:9: “and to another gifts of healings by the same Spirit” · 1 Corinthians 12:28: “then gifts of healings” · 1 Corinthians 12:30: “Do all have gifts of healings?”

**Summary as the gift page prints it:** The translation quoted here says gifts of healings, with both words in the plural, and Paul asks, “Do all have gifts of healings?” (1 Corinthians 12:30). These statements ask what has happened when you prayed for people who were ill, and whether people come to you because of it. They cannot tell this gift apart from an answer to prayer, and James asks that prayer of everyone: “pray for one another, that you may be healed” (James 5:16). Nothing here counts how much anyone prays. [W] [S6] Both believe that God still heals and answers prayer.

**Recorded in the early church:**

- **Acts 3:1-12.** At the temple gate Peter told a man lame from birth that he had no silver or gold but would give what he had, and said, in the name of Jesus Christ of Nazareth, get up and walk; he took him by the right hand and raised him up, immediately his feet and ankle bones received strength, and he went into the temple walking, leaping and praising God; when the people ran together in wonder, Peter asked why they looked at him and John as though they had made the man walk by their own power or godliness.
- **Acts 5:12-16.** By the hands of the apostles many signs and wonders were done among the people, and more believers were added to the Lord; the sick were carried into the streets and laid on cots and mattresses so that Peter’s shadow might fall on some of them as he came by, and crowds from the cities around Jerusalem brought the sick and those tormented by unclean spirits, and they were all healed.
- **Acts 9:17-18.** Ananias entered the house and, laying his hands on Saul, told him that the Lord who had appeared to him on the road had sent Ananias so that he might receive his sight and be filled with the Holy Spirit; immediately something like scales fell from Saul’s eyes and he received his sight, and he arose and was baptised.
- **Acts 28:7-9.** The father of Publius, the chief man of the island, lay sick with fever and dysentery; Paul went in to him, prayed, and laying his hands on him healed him, and then the rest on the island who had diseases came and were cured.

Acts 9:17-18 is new (Pentecostal finding 6) and replaces Acts 9:32-35; the list is now in the order of the book. Still left off, for the editor's reasons, which three reviewers endorsed: James 5:14-15 and 2 Timothy 4:20.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 5 | +1 | 17 | O | People have asked me to pray for them because someone they know got better after I prayed. | CLOSING EDIT (method finding 1), the method reviewer's wording, verbatim. Replaces "People have told me they got better after I prayed for them", which was true of nearly every praying reader. "After", not "because of"; the "because" is the reason other people gave for asking. Read by one reviewer only. |
| 24 | -1 | 18 | | When somebody is ill, I am more likely to bring them a meal than to pray with them. | The editor's rewording of Drafter B H4. Passed by all four (the Pentecostal with a recorded reservation, the cessationist with the summary fix now applied). Unchanged. |
| 45 | +1 | 18 | | More than once, someone I prayed for has recovered when the people around them did not expect it. | Drafter B's spare, changed twice here: "nobody expected them to" included the reader who prayed expecting it (method 5), and "prayed with" capped the reader whose church prays for the sick at a distance (Catholic and Orthodox 7; James 5:16 says "for"). |

One truthful sheet, checked: an elder who believes the gift stopped and visits the sick (nobody seeks him out for that reason; strongly disagrees with the meal; agrees with slot 3) now scores 58, "a little". Under the editor's slot 1 he scored 83 and was shown healing first.

## 2.3 Miracles  (`miracles`)

**The passages it is named from:** 1 Corinthians 12:10: “and to another workings of miracles” · 1 Corinthians 12:28: “then miracle workers” · 1 Corinthians 12:29: “Are all miracle workers?”

**Summary as the gift page prints it:** The translation quoted here says workings of miracles, and later “miracle workers” (1 Corinthians 12:28). Luke writes that “God worked special miracles by the hands of Paul” (Acts 19:11). These statements ask what has happened when you prayed and what the people who were there called it. They call nothing a miracle themselves, and they cannot tell this gift apart from an answer to prayer. [W] [S6]

**Recorded in the early church** (the last two are one verse for each reading):

- **Acts 9:40-42.** At Joppa Peter sent them all out, knelt down and prayed, and turning to the body told Tabitha to get up; she opened her eyes and, seeing Peter, sat up; he gave her his hand, raised her up and presented her alive to the saints and widows, and it became known throughout all Joppa and many believed in the Lord.
- **Acts 19:11-12.** Luke writes that God worked special miracles by the hands of Paul, so that even handkerchiefs or aprons were carried away from his body to the sick, and the diseases departed from them and the evil spirits went out.
- **Galatians 3:5.** Paul asks the Galatians whether he who supplies the Spirit to them and does miracles amongst them does it by the works of the law or by hearing of faith.
- **2 Corinthians 12:12.** Paul writes to the Corinthians that truly the signs of an apostle were worked amongst them in all perseverance, in signs and wonders and mighty works.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 11 | +1 | 16 | O | People who were there have used the word miracle for something that happened when I prayed. | The editor's merge of Drafter A M1 with both critics' fixes. Passed by all four. Unchanged; moved to the first slot so that round three has fewer "People ..." statements in a row. |
| 33 | -1 | 18 | | Remarkable answers to prayer are things I hear about from others, not things I have been part of. | Drafter B M4, verbatim. Method finding 10 asked for a replacement and was refused (section 1.4). Unchanged. |
| 55 | +1 | 13 | | I have prayed for something the others there thought impossible, and it happened. | Drafter B M3. "Everyone there" included the reader who prayed (method 5); the method reviewer's wording. |

## 2.4 Prophecy  (`prophecy`)

**The passages it is named from:** 1 Corinthians 12:10: “and to another prophecy” · Romans 12:6: “if prophecy, let’s prophesy according to the proportion of our faith”

**Summary as the gift page prints it:** Paul says what it is for: “he who prophesies speaks to men for their edification, exhortation, and consolation” (1 Corinthians 14:3), that is, to build them up, encourage them and comfort them. He also writes, “let the others discern”, and, “if a revelation is made to another sitting by, let the first keep silent” (1 Corinthians 14:29-30). These statements ask whether you have said what you believed God gave you to say, and what people said afterwards. A preacher can agree with them, and so can a friend whose advice came at the right time; the statements cannot see more than that. 1 Corinthians 12:28 and Ephesians 4:11 also name prophets among the people given to the church; a result here names a pattern and says nothing about whether anybody is a prophet. [W] [S6]

**Recorded in the early church:**

- **Acts 11:27-30.** Prophets came down from Jerusalem to Antioch, and one of them, Agabus, stood up and indicated by the Spirit that there would be a great famine all over the world, which Luke says happened in the days of Claudius; the disciples, each as he had plenty, determined to send relief to the brothers in Judea, and sent it to the elders by Barnabas and Saul.
- **Acts 13:1-3.** In the church at Antioch there were prophets and teachers; as they served the Lord and fasted, the Holy Spirit said to separate Barnabas and Saul for the work to which he had called them, and when they had fasted and prayed and laid their hands on them, they sent them away.
- **Acts 21:8-14.** At Caesarea Paul’s company stayed in the house of Philip the evangelist, one of the seven, who had four virgin daughters who prophesied; a prophet named Agabus came down from Judea, bound his own feet and hands with Paul’s belt, and said that the Holy Spirit says the Jews at Jerusalem will bind the man who owns the belt in this way and deliver him into the hands of the Gentiles; the company and the people of that place begged Paul not to go up to Jerusalem, he answered that he was ready not only to be bound but to die there for the name of the Lord Jesus, and when he would not be persuaded they ceased, saying that the Lord’s will be done.
- **1 Timothy 1:18.** Paul commits his instruction to Timothy according to the prophecies which were given to him before, so that by them he may wage the good warfare.

Acts 21:8 is also evangelism's. One verse shared is not one act shared: that page says what Luke calls Philip, this one what his daughters and Agabus did.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 14 | -1 | 13 | | I leave it to others to say what they believe God is saying. | Drafter B P5 in the plain critic's trim. Passed by all four. Unchanged. |
| 28 | +1 | 17 | O | People have told me that something I said to them was what God wanted them to hear. | Drafter A P1, verbatim. Passed by all four. Unchanged. |
| 41 | +1 | 15 | | I have said something at church that I believed God had given me to say. | The editor's wording with one word changed: "in church" became "at church" (Catholic and Orthodox 5). |

## 2.5 Tongues  (`tongues`)

**The passages it is named from:** 1 Corinthians 12:10: “to another different kinds of languages” · 1 Corinthians 12:28: “and various kinds of languages” · 1 Corinthians 12:30: “Do all speak with various languages?”

**Summary as the gift page prints it:** The translation quoted here says different kinds of languages where many others say tongues: speaking or praying in a language the speaker has never learnt. At Pentecost “everyone heard them speaking in his own language” (Acts 2:6); to Corinth Paul writes that such a speaker “speaks not to men, but to God, for no one understands” (1 Corinthians 14:2). This page does not say whether those are the same thing. These statements ask whether you have prayed or spoken in words from no language you know, on your own, and at church with an interpretation then given. The row fills only when both are true, because the second is what Paul asks of a church; where nobody interprets he tells the speaker to “keep silent in the assembly, and let him speak to himself and to God” (1 Corinthians 14:27-28), so a row part of the way up is no mark against you. The statements cannot say what those words were. [W] [S6]

**Recorded in the early church:**

- **Acts 2:1-13.** When the day of Pentecost had come there was a sound from the sky like the rushing of a mighty wind, tongues like fire appeared and one sat on each of them, and they were all filled with the Holy Spirit and began to speak with other languages as the Spirit gave them the ability; Jews from every nation, dwelling in Jerusalem, came together bewildered because everyone heard them speaking in his own language the mighty works of God, and others, mocking, said they were filled with new wine.
- **Acts 10:44-46.** While Peter was still speaking, the Holy Spirit fell on all who heard the word, and the circumcised believers who had come with Peter were amazed that the gift of the Holy Spirit was poured out on the Gentiles also, for they heard them speaking in other languages and magnifying God.
- **Acts 19:1-7.** At Ephesus Paul found certain disciples who said they had not even heard that there is a Holy Spirit and had been baptised into John’s baptism; they were baptised in the name of the Lord Jesus, and when Paul had laid his hands on them the Holy Spirit came on them and they spoke with other languages and prophesied; they were about twelve men in all.
- **1 Corinthians 14:18-19.** Paul thanks God that he speaks with other languages more than all of them, and says that in the church he would rather speak five words with his understanding, to instruct others, than ten thousand words in another language.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 17 | -1 | 14 | | Every word I have ever prayed was one I knew or had been taught. | CLOSING EDIT (Catholic and Orthodox 6, method 11), the Catholic and Orthodox reviewers' wording, verbatim. Replaces "... has been in a language I know": a reader who prays the Salve Regina or in Church Slavonic without knowing the language had to disagree, which raised a row they have nothing on. |
| 23 | +1 | 17 | | I have prayed in words that belong to no language I know and that nobody taught me. | The editor's merge with its two clauses turned round (method 11): a reader skimming on a phone stopped at "words nobody taught me", which is every unscripted prayer. |
| 46 | +1 | 18 | O | At church I have spoken in words from no language I know, and an interpretation was then given. | CLOSING EDIT, the closing editor's combination of three findings: "someone else" shut out the speaker who interprets, as 14:13 tells him to (Pentecostal 1); "said what they meant" granted a meaning (cessationist 6); "in church" meant the service (Catholic and Orthodox 5). An interpretation being given grants nothing about whether it was right. No reviewer has read this exact wording. |

How the row scores: private use alone is +2, +2, -2, which prints 67, "some of this". With the engine condition in section 6 it is never named at 67. The "others" here is the weakest kind in the quiz (the church receiving an interpretation, whoever gave it); by 1 Corinthians 14:2 there is little else for other people to bring.

## 2.6 Interpreting tongues  (`interpretation`)

**The passages it is named from:** 1 Corinthians 12:10: “and to another the interpretation of languages” · 1 Corinthians 12:30: “Do all interpret?”

**Summary as the gift page prints it:** The translation quoted here says the interpretation of languages: giving a church the meaning of what was said in a language it does not know, so that, in Paul’s words, “the assembly may be built up” (1 Corinthians 14:5). Acts never shows anyone doing it; what the New Testament has is Paul’s instructions to Corinth, below. These statements ask whether you have said what you believed such speech meant, and whether people at church look to you for it. They cannot say whether any meaning given was right. [W] [S6]

**What Paul writes about it** (instruction, not acts; the page heading must say so, section 6):

- **1 Corinthians 14:5.** Paul writes that he desires them all to speak with other languages, but even more to prophesy, for he who prophesies is greater than he who speaks with other languages, unless he interprets, so that the church may be built up.
- **1 Corinthians 14:13.** Paul tells the one who speaks in another language to pray that he may interpret.
- **1 Corinthians 14:26-28.** Paul writes that when they come together each one has a psalm, a teaching, a revelation, another language or an interpretation, and that all things are to be done to build each other up; if anyone speaks in another language it is to be two or at the most three, in turn, with one interpreting, and if there is no interpreter the speaker is to keep silent in the church and speak to himself and to God.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 19 | -1 | 16 | | When someone speaks in a language nobody there knows, I have no idea what it means. | Drafter A I5 in the plain critic's tidy. Passed by all four. Unchanged. |
| 26 | +1 | 18 | O | People at church look to me for the meaning when someone speaks in a language nobody there knows. | Drafter A I2. Passed by all four. Unchanged; moved to the second slot to spread the "People ..." statements. |
| 43 | +1 | 20 | | When someone has spoken in a language nobody there knew, I have told the others what I believed it meant. | CLOSING EDIT (cessationist 5), his wording, verbatim. "I have said what it meant" could not be answered truthfully by a reader who once did this and no longer believes it; "I believed" is what prophecy's statement already had. |

---

# 3. Every changed statement in the thirteen existing gifts

## 3.1 The six "others" replacements (job 2)

Counted again from `spiritual-gifts.ts`: seven of the thirteen had an "others" statement (serving, teaching, encouraging, administration, wisdom, discernment, shepherding) and six had none. All four reviews agreed with the count, with all six removals and with all six new statements. They stand as the editor wrote them. Every sign was re-derived: all six are +1, and the six reverse items are untouched.

| gift | # | goes | comes in (+1, O) | words | where it came from |
|---|---|---|---|---|---|
| giving | 56 | When somebody needs money and I have it, I decide quickly and rarely think about it again. | People tell me when someone they know is going without, and I usually find something to give. | 17 | Drafter B G1 in the loaded critic's form, extended by the editor. The reason for the removal is corrected (method 13): its second half is an inner state. It was not the quiz's only two-claim statement; serving's accepted "others" statement has the same shape as this one. |
| leading | 6 | When nobody will decide, I make the decision for the group. | People have put me in charge of things I did not ask to run. | 14 | Drafter A La, verbatim. The removed statement was the reverse item turned round. |
| showing mercy | 42 | I notice the person who is not coping before I notice anything else in the room. | People turn to me when they are at their lowest, even people I do not know well. | 17 | Drafter B Me1 with both critics' one change. The removed statement reported a perception nobody can check. |
| the gift of faith | 52 | I keep going with a project long after other people have written it off. | When everyone else has given up on something, people ask me whether I still think it will happen. | 18 | Drafter B F2, verbatim. The Pentecostal reviewer called it a real improvement: the removed statement drew the gift as doggedness. |
| evangelism | 20 | I bring up what I believe with people who do not share it, without much trouble. | People who do not go to church ask me questions about God. | 12 | Drafter B E1, verbatim. The removed statement was the reverse item turned round and reported a feeling. |
| hospitality | 54 | I invite people over without waiting until the place is tidy. | When someone new turns up, they usually end up sitting with me. | 12 | Drafter A HOa in the plain critic's wording. Needs no front door. |

## 3.2 Discernment (job 3)

**The passage it is named from:** 1 Corinthians 12:10: “to another discerning of spirits”

**Settled against the passage, in three sentences.** In every place the idea appears (1 Corinthians 12:10 “discerning of spirits”; 14:29 “let the others discern”; 1 John 4:1 “test the spirits, whether they are of God”; 1 Thessalonians 5:20-21; Acts 17:11) the thing weighed is a message, a teaching or a claim to speak for God, never a first impression of someone's character, so the two reviewers who wanted the old statement gone were right about its object. The third reviewer was right that a perception nobody taught you may be how the gift works, and he keeps that, because the text records what was discerned and never how: the new statement reports an act and what people later said, so a Pentecostal can agree because God showed him and a cessationist because she opened her Bible. His successor in this round agreed, and asked only that the object be the one Paul and John name.

**Summary as the gift page prints it:** The passage names the discerning of spirits and does not explain it. Of prophets speaking in church Paul writes, “let the others discern” (1 Corinthians 14:29), and John writes, “test the spirits, whether they are of God” (1 John 4:1). These statements ask whether you look into what you are told before you accept it, and what has happened when you weighed something taught about God or said to be from him. They say nothing about how you knew, and they are not about first impressions of people. Nor do they ask about telling what is moving your own thoughts and desires, which many Christians also call the discernment of spirits and take to a confessor or spiritual father. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.

**Recorded in the early church:**

- **Acts 8:18-23.** Unchanged.
- **Acts 5:1-4.** Ananias kept back part of a sale price and laid the rest at the apostles’ feet; Peter asked him why Satan had filled his heart to lie to the Holy Spirit and to keep back part of the price. Luke does not say how Peter knew. *(The last sentence is new. It is true, and it stops either reading from claiming the verse. All four reviews passed it. Acts 5:1-4 appears under discernment only.)*
- **Acts 13:6-10** *(was 13:8-10)*. At Paphos they found a sorcerer, a false prophet, whose name was Bar Jesus, with the proconsul, who had summoned Barnabas and Saul to hear the word of God; the sorcerer, whose name Luke also gives as Elymas, withstood them, seeking to turn the proconsul away from the faith, and Paul, filled with the Holy Spirit, fastened his eyes on him and called him full of all deceit. *(Method 16: "a false prophet" is what makes this 1 John 4:1's own case, and it is in verse 6.)*
- **Acts 17:11.** Unchanged.

| # in running order | direction | words | | statement | where it came from |
|---|---|---|---|---|---|
| 12 | -1 | 16 | | I take a new idea as it sounds rather than look into where it came from. | The first audit's. Its object is an idea and its act is testing. Unchanged. |
| 25 | +1 | 18 | | I have stopped listening to a speaker or writer I liked because of what they taught about God. | CLOSING EDIT (method 6), the method reviewer's wording, verbatim. Replaces "Friends ask me whether someone can be trusted before they rely on them" (object: a person's character). The editor's first replacement, "Friends send me a talk or a book and ask whether it can be trusted", passed three reviews but would have given this gift two statements that need other people: a reader with nobody around them scored 33 here and 67 on every other row. "I liked" means the judgement went against the first impression of the person. Read by one reviewer only. |
| 44 | +1 | 21 | O | I have raised a worry about something said to be from God, and the people I took it to later agreed. | CLOSING EDIT. Replaces "I decide something is off about a person before I could say what it is". The editor's shape (an act, then what others later said, silent on how), with the Pentecostal reviewer's object ("something ... from God": finding 4) and the Catholic and Orthodox reviewers' verb and ending ("raised a worry ... the people I took it to later agreed": finding 3). "The people I took it to" can be a pastor, an elder, or the daughter who was being drawn into a cult. The combination is the closing editor's and no reviewer has read it; at 21 words it is the longest statement in the quiz. |

Signs re-derived: slot 1 agreeing is taking things untested, **-1**; slots 2 and 3 agreeing is weighing what is taught or claimed, **+1**. None changed.

## 3.3 Wisdom and the gift of faith (summaries only)

Their statements are still everyday patterns, so their summaries still say so. Each gains the sentence about the disagreement in the form every part of which can be checked on this site (method 9a): 1 Corinthians 12:8-10 is one sentence in the translation on disk, and the disagreement is the Compass's audited axis.

- **Wisdom:** The passage names a word of wisdom, something said, and does not explain it. These statements can see only the everyday pattern of being brought hard choices and asked what to do. This is not the wisdom Catholic teaching counts among the seven gifts of the Holy Spirit (Isaiah 11:2); this page is about Paul’s list. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.
- **The gift of faith:** Listed as something given to some and not to others, so it is not about whether you believe. These statements look only for a habit of staying sure, and saying so, after other people have stopped expecting a thing to come right, and for people coming to ask whether you still are. Paul elsewhere writes of “all faith, so as to remove mountains” (1 Corinthians 13:2). Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.

---

# 4. Neighbouring gifts, after the closing edit

The editor's pair-by-pair table (`gifts-all-edit.md`, section 5) stands except where a statement changed. The pairs touched:

| pair | what keeps them apart now | where they still touch |
|---|---|---|
| prophecy / discernment | The two halves of 1 Corinthians 14:29, more plainly than before: prophecy says what the reader believed God gave them to say; discernment raises a worry about something said to be from God. | None. One speaks, the other weighs what somebody else said. |
| knowledge / teaching | Knowledge: quoting the part of the Bible people were trying to remember, and asking or answering when a question about what Christians believe comes up. Teaching: making a thing understood and checking it landed. | Disagreeing with knowledge's reverse item is close to teaching's "People come to me to have something explained" (method 4). The well-read reader rises on both. Recorded, accepted. |
| knowledge / discernment | Knowledge supplies; discernment stops listening, or raises a worry. No discernment statement now begins with being asked. | The well-read reader rises on both. |
| healing / miracles | Every healing statement names illness, getting better or recovering; no miracles statement does. | One recovery can feed healing slot 3 and miracles slot 1. Acts 19:11-12 itself calls healings miracles: the overlap is in the text. Both summaries now carry the same limit. |
| healing / mercy | Healing's forward statements are about prayer and what followed; mercy's are about distress and going towards it. | Healing's reverse item has a meal at its far end: a trade-off between two strengths, as giving's already is. No statement scores +1 for both. |
| healing / faith, miracles / faith | Faith is sureness beforehand and being asked about it; nothing in it is an event after prayer. | None. |
| tongues / interpretation | Speaking, against telling the others what it was believed to mean. They never open with the same words. | Tongues slot 3 ends with an interpretation being given; the act scored there is still the speaking. A reader who does both rises on both, which is 14:13. |
| wisdom / discernment | Wisdom: which of two options to take. Discernment: what is taught about God or said to be from him. Further apart than before. | None. |
| the "people ask me" family | Teaching (explain), wisdom (choose), faith (still sure?), evangelism (outsiders' questions about God), healing (asked to pray): five different acts, and discernment has left the family. | A well-regarded reader rises on all five together. It is what evening out the "others" statements costs. |

---

# 5. All the copy that changes

**title** (stays): What are your spiritual gifts? · **minutes:** 8

**tagline:** Fifty-seven statements, nineteen gifts, and a conversation to have afterwards.

**description:**

> Nineteen gifts the New Testament names, prophecy, healing and tongues among them, each in its passage’s own words. Fifty-seven plain statements about what you do and what has happened. Scripture gives no test for gifts, so take the result to your pastor or priest and to people who know you.

**draftNote:**

> This one is a draft. Nineteen gifts are here, each quoted from the World English Bible British Edition: those named in the lists in Romans 12, 1 Corinthians 12 and Ephesians 4, and hospitality, which Peter asks of everyone one verse before he writes of gifts. Apostles, who are named in two of those lists, are not scored, and a note under the result says why. Christians disagree about whether some of these gifts are given today: prophecy, healing, miracles, tongues, their interpretation and the word of knowledge. Paul names those six in one sentence with the word of wisdom, faith and the discerning of spirits (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives. This page takes no side. It quotes the passages, asks what has happened and what people have said, and leaves the argument to the Theology Compass, which sets it out in both sides’ own words. The statements have had adversarial reviews, not the full fairness audit the Theology Compass went through. Treat the result as a conversation starter, not a verdict.

**intro** (the editor's, passed by all four, unchanged):

> Scripture gives lists of gifts. It gives no test for finding which are yours. It says the Spirit gives them, “distributing to each one separately as he desires” (1 Corinthians 12:11), and that each is given “for the profit of all” (1 Corinthians 12:7). So this is a conversation starter, not a verdict: fifty-seven statements cannot see your last ten years, and the people who have watched you serve can. If you know the lists you will sometimes see which gift a statement is about, and with a few, such as tongues and healing, there is no honest way to ask without showing it. That is one more reason to take the result to your pastor or priest and to one or two people who have served alongside you, and ask them whether it is true. Catholic readers usually call the gifts in these lists charisms, and keep “the gifts of the Holy Spirit” for the seven that Catholic teaching draws from Isaiah 11:2; this page is about the first.

**introShort:**

> Scripture lists gifts and gives no test for finding which are yours; ask your pastor or priest and the people who have watched you serve.

**result** (one sentence added, about habits and events):

> This is where your answers pointed. It is not a measurement of what God has given you. No one is summed up by one row of this page, the list here is not everything Scripture names, and a self-report can be wrong in both directions, about what you avoid as much as what you are good at. Some of the everyday patterns here are temperament as much as gift, and these statements cannot tell the two apart. Where a statement asks what has happened or what people said, this page does not say what any event was. Some rows ask about habits and some ask whether a thing has ever happened; one occasion can fill a row of the second kind, so the order of the rows is not an order of strength. The useful step is not to believe this page. It is to take it to your pastor or priest, and to somebody who has served alongside you, and ask whether it matches what they have seen.

**low** (1 Corinthians 12:30 is not added; "a pattern" became "something"):

> “As each has received a gift, employ it in serving one another” (1 Peter 4:10). A gift low on this page is something these statements did not find, not a verdict on you. And some of these are asked of everyone: “Be hospitable to one another without grumbling” (1 Peter 4:9) comes one verse earlier.

**flat:**

> “As each has received a gift, employ it in serving one another” (1 Peter 4:10). Fifty-seven statements found nothing standing out. That is a fact about the statements, not about you; ask the people who have watched you serve.

**omitted** (the editor's, passed by all four, unchanged; it carries no link now, so `omittedLinkText` is empty on purpose):

> Not scored here: apostles (“first apostles”, 1 Corinthians 12:28; also Ephesians 4:11), the gift Paul names when he writes of remaining unmarried (“each man has his own gift from God”, 1 Corinthians 7:7), and the gift Paul tells Timothy was “given to you by prophecy with the laying on of the hands of the elders” (1 Timothy 4:14). Statements about what you do, what has happened and what people bring you have nothing to say about any of the three. Leaving them unscored says nothing about their rank, and nothing about whether they are given today. The same two lists name prophets beside apostles: prophecy is scored here, and whether anybody is a prophet is not.

**disputed** (shown with the intro and with the result; it reads truly in both places):

> Christians reading the same passages disagree about whether prophecy, healing, miracles, tongues, their interpretation and the word of knowledge are given today. Paul names all six in one sentence with the word of wisdom, faith and the discerning of spirits (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives. Those who believe they are given differ on how eagerly to seek them: Pentecostal and charismatic Christians seek them openly, while Catholic and Orthodox teaching receives them with gratitude and warns against seeking them rashly. This page takes no side: it quotes each passage, asks what has happened and what people have said, and does not say what any of it was, whether a miracle, a healing, a word from God or none of these. A reader who believes these gifts are not given today can answer every statement truthfully, and a row can still fill for that reader, because the statements ask what happened and not what it was. A high row does not say that you have that gift, and a low row does not say that you have not.

**disputedLinkText** (to the Compass's Gifts axis, through `groupHref()`): The Theology Compass sets that disagreement out in both sides’ own words.

"Charismatic" in the third sentence names people, as the Compass does; it is not the forbidden label for the gifts. "Sign gifts", "charismatic gifts", "supernatural gifts" and "miraculous gifts" appear nowhere (checked by script).

**Unchanged:** `headlineLead`, the row words, `shareTitle`, `codePrefix`, `namingFloor` 17, `tieSteps`.

---

# 6. For the engineer

`gifts-all-final.json` has the shape asked for and nothing else. **Five things the wiring needs are not in it, because the shape has no field for them.** The first three are conditions of wiring, not options.

1. **A sentence that travels with the six names** (cessationist 2; endorsed by the Pentecostal and the Catholic and Orthodox reviews). Whenever prophecy, healing, miracles, tongues, interpreting tongues or the word of knowledge is printed by name in the headline, on the share card or in the share text (not only when it leads: the share text prints the top three), this prints once, not once per gift. `notesFor()` reads `quiz.outcomes`, and this quiz has none, so the mechanism needs a way in for groups.
   - Result page, under the headline, and the share card: *Christians disagree about whether prophecy, healing, miracles, tongues, interpreting tongues and the word of knowledge are given today. A high row records answers about what has happened and what people have said. It does not say what any of it was.*
   - Share text: *Christians disagree about whether some of these gifts are given today. These rows record answers about what has happened and what people said, not what any of it was.*
   - If the card has room for one more line: *Take it to your pastor or priest.*
2. **No badge, chip, grouping or separate section for the six** (Pentecostal 13). In the running order, the ranking, the gift index and the share card they look and sort like every other row. The `disputed` note prints once with the intro and once with the result; item 1 is one sentence in one place; nothing is attached to a row. Add a test beside the adjacency test.
3. **A row is named only if it clears the naming floor itself** (method 3). In `category.ts`, `level` takes every row within one rung of the leader, so a row at 67 (which is also what agreeing with everything scores) is named jointly with a leader at 75. Add the condition `r.score - 50 > namingFloor` to the filter. The method reviewer's rough run: private tongues named on 0 per cent of sheets instead of 8.8, and flat results fall from 19.1 to 10.3 per cent for every reader. It touches the shared strategy, so run `npm run test` and look at the seven-deadly-sins expectations.
4. **A heading and kicker per group** (method 8). `axis/[quiz]/[axis].astro` prints "What it has looked like" and "N recorded acts, each cited" above `acts`. For `knowledge` and `interpretation` that is false and the summary above it says so. For these two: heading "What Paul writes about it", kicker "3 passages, each cited".
5. **One line above the answer scale, for this quiz:** *Agree means the sentence is true of you as it is written; disagree means it is not. If a sentence says a thing has happened and it never has, disagree is an honest answer. Some sentences say a thing has not happened, so read each one to the end.* It must not send readers to "Unsure / neither": that answer on the events with "disagree" on the reverse items scores 67 on all six rows.

**The order of the gifts and the rounds.** `giftOrder` in the JSON interleaves the six among the thirteen, which keep their present order, and none of the six is in the first three. With `ROUNDS = [[0, 1], [14, 7], [8, 12]]` (nineteen is prime, so every stride visits every gift once) the full running order below has: no two statements from one gift adjacent; none of these pairs ever adjacent: prophecy with knowledge, wisdom, discernment or encouraging; knowledge with wisdom, discernment or teaching; healing with miracles, faith or mercy; miracles with faith or mercy; tongues with interpretation; and the first edit's nine pairs; two of the six adjacent only twice in fifty-seven; never more than two statements in a row that open with "People"; never more than three reverse items in a row; reverse items per round 7, 7 and 5; the last statement is not one of the six. A test should assert the pair rule and the same-gift rule.

**Slots.** Within each new gift the JSON's `statements` array is in slot order. A replacement takes the slot of the statement it removes, so no reverse item moves.

**Also:** `GIFTS` gains six rows (key, slug, name as in the JSON). Thirteen reachable scores over nineteen groups passes the safe-integer limit, so the wide codec from commit `6b3d503` is needed; add a round-trip test at nineteen groups. Preview links made at thirteen groups will stop decoding; the quiz is a draft, so that is acceptable. Counts to change wherever written: thirty-nine to fifty-seven, thirteen to nineteen, minutes 5 to 8, including the file's header comment and the `ROUNDS` comment. `QUIZ-BLUEPRINTS.md` still has "Deliberately not in this draft", and `gifts-final.md` still describes thirteen gifts; both need bringing into line when this is wired. Neither was edited here. Still open from the first audit: item 3 above makes wide ties rarer, and ties of five or more already fall to the flat state.

**If the owner says yes to the question at the end:** one line in `GIFTS`, `['wisdom', 'wisdom', 'the word of wisdom']`. Key and slug do not change. The sentence about Isaiah 11:2 on the wisdom page stays either way.

## The running order under that proposal

Three rounds of nineteen. **O** marks the "others" statements.

1. When something practical needs doing, I have usually started before anyone asked me to.  *(serving, +1)*
2. People come to me to have something explained, even when they only wanted the short answer.  *(teaching, +1, O)*
3. When a friend is hesitating, I leave them to decide rather than press them.  *(encouraging, -1)*
4. I give away things I am still using when somebody needs them more than I do.  *(giving, +1)*
5. People have asked me to pray for them because someone they know got better after I prayed.  *(healing, +1, O)*
6. People have put me in charge of things I did not ask to run.  *(leading, +1, O)*
7. I keep my distance from people in distress until I know how to help.  *(mercy, -1)*
8. In a discussion I end up quoting the part of the Bible people were trying to remember.  *(knowledge, +1)*
9. When plans are loose, I write them down and send them round without being asked.  *(administration, +1)*
10. When two good options are on the table, people ask me which one to take.  *(wisdom, +1, O)*
11. People who were there have used the word miracle for something that happened when I prayed.  *(miracles, +1, O)*
12. I take a new idea as it sounds rather than look into where it came from.  *(discernment, -1)*
13. I keep telling people a thing will come right after they have stopped expecting it.  *(faith, +1)*
14. I leave it to others to say what they believe God is saying.  *(prophecy, -1)*
15. I end up talking about God with people I have only just met.  *(evangelism, +1)*
16. I give people what they need at the time and let it end there.  *(shepherding, -1)*
17. Every word I have ever prayed was one I knew or had been taught.  *(tongues, -1)*
18. I add a seat for whoever turns up rather than keep to the numbers I planned for.  *(hospitality, +1)*
19. When someone speaks in a language nobody there knows, I have no idea what it means.  *(interpretation, -1)*
20. People who do not go to church ask me questions about God.  *(evangelism, +1, O)*
21. People come to me when they need a push to do the thing they are avoiding.  *(encouraging, +1, O)*
22. In an argument I end up saying what I think the disagreement is actually about.  *(wisdom, +1)*
23. I have prayed in words that belong to no language I know and that nobody taught me.  *(tongues, +1)*
24. When somebody is ill, I am more likely to bring them a meal than to pray with them.  *(healing, -1)*
25. I have stopped listening to a speaker or writer I liked because of what they taught about God.  *(discernment, +1)*
26. People at church look to me for the meaning when someone speaks in a language nobody there knows.  *(interpretation, +1, O)*
27. When somebody starts crying, I move closer rather than give them room.  *(mercy, +1)*
28. People have told me that something I said to them was what God wanted them to hear.  *(prophecy, +1, O)*
29. I check whether the other person actually followed me before I move on.  *(teaching, +1)*
30. When a group makes plans, I leave it to someone else to keep the list.  *(administration, -1)*
31. I keep following up with the same few people long after everybody else has moved on.  *(shepherding, +1)*
32. Even when I can afford it, I look for a way to help other than money.  *(giving, -1)*
33. Remarkable answers to prayer are things I hear about from others, not things I have been part of.  *(miracles, -1)*
34. I would rather meet people somewhere out than have them in my home.  *(hospitality, -1)*
35. I end up answering for how the whole thing went, including parts other people did.  *(leading, +1)*
36. When the odds look bad, I am among the first to say we should stop.  *(faith, -1)*
37. When there is clearing up to do, I am usually still talking to someone.  *(serving, -1)*
38. People have asked me how I knew something about them that nobody had told me.  *(knowledge, +1, O)*
39. People send me the details because they know I will keep track of them.  *(administration, +1, O)*
40. I would rather send somebody a good link than sit down and walk them through it.  *(teaching, -1)*
41. I have said something at church that I believed God had given me to say.  *(prophecy, +1)*
42. People turn to me when they are at their lowest, even people I do not know well.  *(mercy, +1, O)*
43. When someone has spoken in a language nobody there knew, I have told the others what I believed it meant.  *(interpretation, +1)*
44. I have raised a worry about something said to be from God, and the people I took it to later agreed.  *(discernment, +1, O)*
45. More than once, someone I prayed for has recovered when the people around them did not expect it.  *(healing, +1)*
46. At church I have spoken in words from no language I know, and an interpretation was then given.  *(tongues, +1, O)*
47. When a friend asks my advice, I tell them what I would do myself.  *(wisdom, -1)*
48. I tell people what I think they are capable of, even when they have not asked.  *(encouraging, +1)*
49. I keep what I believe to myself unless somebody asks me directly.  *(evangelism, -1)*
50. When a question about what Christians believe comes up, I am the one asking rather than answering.  *(knowledge, -1)*
51. People ask me when an errand needs running or a form needs filling in, and I usually say yes.  *(serving, +1, O)*
52. When everyone else has given up on something, people ask me whether I still think it will happen.  *(faith, +1, O)*
53. I would rather be told where we are going than be the one to decide it.  *(leading, -1)*
54. When someone new turns up, they usually end up sitting with me.  *(hospitality, +1, O)*
55. I have prayed for something the others there thought impossible, and it happened.  *(miracles, +1)*
56. People tell me when someone they know is going without, and I usually find something to give.  *(giving, +1, O)*
57. People I helped years ago still come back to me when something goes wrong.  *(shepherding, +1, O)*

---

# 7. What this leaves honest and unsolved

1. **Rule 5 is lost for fifteen statements** (all of healing, miracles, prophecy, tongues and interpretation) and half lost for one (knowledge's "others" statement). Disguising them turns prophecy into encouraging and healing into mercy. The intro says so.
2. **Rule 6 is kept in the letter and strained in the spirit.** Eight of the eighteen new statements mention praying (healing 3, miracles 3, tongues 2). None counts how much, how long or how hard anybody prays.
3. **Rule 1 has one deliberate exception:** tongues slot 3 is two claims (spoke at church; an interpretation was given). A reader who has spoken aloud at church with no interpretation following can say neither yes nor no cleanly. It is the only "others" statement the passage allows.
4. **The word of knowledge leans two to one** towards the first thing the statements ask about. The page says so. A reader new to the faith who is often asked "how did you know that?" sees 33.
5. **A preacher can truthfully agree with all three prophecy statements** and be shown prophecy first, whatever he believes about the gift. The page now tells him why, and does not rule on whether preaching is prophecy.
6. **One occasion fills an event row for life.** The result note says so; asking "how often" would cure it and rule 6 forbids it.
7. **Wordings no reviewer has read in this exact form:** tongues slot 3 and discernment slot 3 (the closing editor's combinations of two or three reviewers' fixes), healing slot 3 (two reviewers' one-word fixes together). **Read by their author only:** healing slot 1, discernment slot 2, miracles slot 1 and the order of tongues slot 2 (method); tongues slot 1, knowledge slot 3 and "at church" (Catholic and Orthodox); interpretation slot 2 (cessationist). In the copy: sentence [W], prophecy's sentence about a preacher, the middle of the tongues summary, the confessor sentence in discernment, and sentences two, five and six of `disputed`. The first audit's log made the same admission about its own rewordings.
8. **For the citation pass before this leaves draft.** Nothing below names a tradition or quotes anybody, and none of it was opened in a source: "Christians read it in more than one way" (the word of knowledge); "which many Christians also call the discernment of spirits and take to a confessor or spiritual father" (pointers the Catholic and Orthodox reviewers gave and did not open: Ignatius of Loyola, *Spiritual Exercises*, rules for the discernment of spirits; John Climacus, *Ladder*, Step 26; John Cassian, *Conferences* 2). The sentence about seeking the gifts in `disputed` is the Compass's audited sentence and needs nothing new. The sentence about Isaiah 11:2 on the wisdom page repeats the intro's, which the first audit passed.

---

# 8. The checks

```
$ node audit/tools/webbe.mjs --check audit/new-quizzes/gifts-all-final.json
14 of 14 quotations are verbatim
```

Those fourteen are the listing passages, the only `{ref, text}` pairs the JSON shape holds. Every quotation inside a summary or the copy (22 strings, pulled out of the JSON by script so none could be missed; the 23rd curly-quoted string is the site's own phrase “the gifts of the Holy Spirit”) was paired with its reference and checked the same way, after a control so that a pass means something:

```
$ node audit/tools/webbe.mjs --check <scratch>/control.json
NOT VERBATIM  1 Corinthians 14:2 :: speaks not to men, but to God, for nobody understands
1 of 2 quotations are verbatim
$ node audit/tools/webbe.mjs --check <scratch>/copy-pairs.json
22 of 22 quotations are verbatim
```

New quotations in this edit: James 5:16 “pray for one another, that you may be healed”; 1 Corinthians 14:30 “if a revelation is made to another sitting by, let the first keep silent”; 1 Corinthians 14:2 “speaks not to men, but to God, for no one understands”; 1 Corinthians 14:27-28 “keep silent in the assembly, and let him speak to himself and to God”. Removed: 1 Corinthians 12:30 from `low`.

By script, against `spiritual-gifts.ts` and the JSON: all eight `remove` strings match the current file character for character; nineteen gifts, fifty-seven statements, 38 keyed +1 and 19 keyed -1; every gift has exactly three statements, exactly one -1 and exactly one "others"; the longest statement is 21 words (discernment's "others" statement; the next longest is 20); no em dash or en dash anywhere in the JSON; none of the four forbidden labels for the six appears.

The recorded acts are descriptions, not quotations. Each new or changed sentence (Acts 9:17-18, Acts 21:8-14, Acts 13:6-10, 1 Corinthians 1:4-7 with "always" restored, 2 Corinthians 12:12 with "truly" restored) was written with its verses open; the rest are the editor's, which the method reviewer read beside their verses and passed.

---

# 9. The one question for the owner

**The quiz calls one gift "wisdom" and the gift beside it in the same Bible verse "the word of knowledge". Should "wisdom" be shown as "the word of wisdom" instead?**

The verse says: “to one is given through the Spirit the word of wisdom, and to another the word of knowledge” (1 Corinthians 12:8). So a result would read "Your answers pointed most to the word of wisdom" instead of "Your answers pointed most to wisdom", and a low row would not read as "you are not wise", which is the same reason the quiz already says "the gift of faith" and not just "faith". My recommendation is yes. It is one word in one file, and the quiz works either way; if you say nothing it stays "wisdom", which is what you saw in the preview.
