# What are your spiritual gifts? All gifts in: method and evidence review

Reviewer: a psychometrician and an evidence checker in one chair. Reviewed: `gifts-all-edit.md` in full, beside `site/src/lib/quizzes/spiritual-gifts.ts` and `site/src/lib/strategies/category.ts`. Only what is new or changed was reviewed (the six added gifts, the six replaced statements, discernment, all rewritten copy), but judged as part of the whole nineteen. Nothing under `site/` was touched, nothing was committed, and this is the only file written.

**Verdict: no blocker. Nine major findings, ten minor.** Every sign is right, every quotation is verbatim, and all but one of the twenty-two new act sentences say what their verses say (the one sentence added to Acts 5:1-4 is also true). The faults are in what the scoring does with the new statements, in three things the proposal says about its own arithmetic that are not so, and in a few claims the page would make that nobody has opened a source for.

## How this was checked

- **Evidence.** Every reference in sections 1 to 4 was opened with `node audit/tools/webbe.mjs` and read beside its sentence. The 33 pairs in section 6 were re-extracted from the table by script and re-run through `--check`: 33 of 33 verbatim. A second sweep took every curly-quoted string in sections 1 to 4 (34 distinct) and searched the whole text for it: all 32 that are Scripture are verbatim in the verse named; the other two are the site's own phrases ("the gifts of the Holy Spirit", "not found here").
- **Method.** The arithmetic of `category.ts` (score, row words, tie margin of one rung, naming floor 17, flat state at five or more level) was copied into a scratch script with the proposed fifty-seven statements, and named reader profiles were scored. Counts confirmed by script: 19 gifts, 57 statements, 38 keyed +1, 19 keyed -1, exactly one reverse item per gift, longest statement 20 words, reverse items per round 7, 7 and 5.
- **Rough population runs** (200,000 sheets each) are labelled rough wherever they are quoted. Assumptions: the thirteen everyday gifts answered with mild acquiescence (forward statements 10/20/20/35/15 per cent from strongly disagree to strongly agree, reverse statements 15/30/20/25/10), the six added rows fixed at the value a named reader would get. They measure the engine's behaviour, not people.

---

## Major

### 1. Healing, slot 1, does not tell one reader from another

**Words:** "People have told me they got better after I prayed for them."

**Why.** Most illness gets better. Anyone who prays for ill people at all will, in time, be told this, and the more people they pray for the more often they will be told it. So the statement is true of nearly every praying Christian, in proportion to how many sick people they have prayed for, which is exposure, and close to the amount of praying that rule 6 forbids counting, by the back door. The brief offered this sentence as an example of the permitted form (an event, not devotion), and on that test it passes. The objection here is a different one: it does not discriminate. The reverse item then adds two points for anybody who prays with the ill at all. One truthful sheet, constructed, not a rate: a cessationist elder who visits the sick (slot 1 agree, slot 2 strongly disagree, slot 3 agree) scores 83, "a lot of this", and the headline reads "Your answers pointed most to healing and serving". That is the reader the brief said would "simply disagree".

**Replacement I would accept (slot 1, +1, the "others" statement, 17 words):**

> People have asked me to pray for them because someone they know got better after I prayed.

It reports what others did and the reason they gave, in the shape administration's accepted statement already has ("because they know I will keep track of them"). It asserts no healing ("after"), counts no praying, a cessationist can answer it truthfully either way, and it is how a Pentecostal church recognises the gift: people seek that person out. An elder asked by office, not because of what happened, disagrees. Slot 3 stays as the reader's own event (with finding 5's wording).

### 2. The "disputed" note promises a result the scoring does not deliver

**Words:** "A reader who believes these gifts are not given today can answer every statement truthfully and will most likely see “not found here” on those rows, which is a fact about the statements."

**Why.** True for tongues and interpretation (both 0 for that reader). Not true for the rest whenever that reader prays with the sick, preaches or knows the Bible well, which describes most of the cessationists likely to take this quiz. The constructed elder above sees healing 83, prophecy 67, the word of knowledge 67, miracles 58. The proposal half concedes this two paragraphs later ("a flat promise would be false for some readers on some rows") and then keeps "most likely", which is still a prediction nobody measured and the arithmetic points the other way.

**Replacement (last sentence of the note):**

> A reader who believes these gifts are not given today can answer every statement truthfully. If that reader prays with people who are ill, or preaches, some of these rows can still fill, because the statements ask what happened and what people said, not what it was. An empty row reads “not found here”, which is a fact about the statements.

**For the engineer:** when any of the six is named in the headline, print the disputed note directly under the headline, not only at the foot of the page.

### 3. What the owner is told about tongues is not what the engine does

**Words (plain-words section, point 3):** "Someone who prays in tongues only on their own will see “some of this” on that row and will not have it as their headline". And in 1.5: "prints as 67, “some of this”, and no headline (a gift is named from 75)."

**Why.** "A gift is named from 75" is true only of the leader. `category.ts` names every row within one rung of the leader, and 67 is within one rung of 75 (the margin is 8.8 points; the gap is 8). Scored: the private-only reader whose best everyday row is 75 gets "Your answers pointed most to serving and tongues". At 83 it is "serving" alone. In the rough run, tongues at 67 is named jointly on 8.8 per cent of sheets, and pushes the flat state from 19.1 to 25.2 per cent because it swells the count of level rows. The first audit found that a leader at exactly 75 is the commonest case. So the design's stated purpose fails in about one sheet in eleven, and the owner has been told otherwise.

The owner should also be told the other half of 1 Corinthians 14:27-28. Verse 28 tells the speaker with no interpreter present to keep silent in church and "speak to himself and to God". The reader who does exactly that is capped at 67 by slot 3. The cap is defensible (a fact asked three times would otherwise outrank every habit), but "which is what 1 Corinthians 14:27-28 asks of the church" reads as though the capped reader had fallen short of the passage, and verse 28 says they have not.

**Replacement for the engineer (one condition, needs `npm run test`):** a row joins the named set only if it also clears the naming floor (`score - 50 > namingFloor`). Rough run with that one change: private tongues named 0.0 per cent; flat results fall from 19.1 to 10.3 per cent for every reader, because rows at 67, which is what agreeing with everything scores, stop counting as level with a real leader. No yea-sayer or nay-sayer result changes.

**Replacement for the owner, if the engine is left alone:**

> Someone who prays in tongues only on their own will see "some of this" on that row. It is never named alone, but it is named jointly whenever their best other row is only one step higher, about one result in eleven in a rough run. That includes the person who keeps silent in church because nobody there interprets, which is what 1 Corinthians 14:28 tells them to do.

### 4. The word of knowledge is not an even split, and its reverse item is teaching's act turned round

**Words (1.1):** "Each reading can reach about two thirds of the row; only a reader with both reaches the top. That even split is what the summary promises".

**Why.** Slots 1 and 3 both belong to the first reading (Bible recall); only slot 2 belongs to the second. Scored:

| reader | slots 1, 2, 3 | row |
|---|---|---|
| first reading only (quotes the passage; nobody has asked how he knew) | +2, -2, disagree | 67, "some of this" |
| second reading only, new to the Bible (asked how she knew; asks rather than answers) | -2, +2, agree | 33, "not found here" |
| second reading only, neither way on both Bible statements | 0, +2, 0 | 67 |

The split is two to one, and it leans to the reading that a cessationist holds is not in dispute. A Pentecostal who is asked "how did you know that?" every month and is new to the Bible is told the word of knowledge was "not found here". Separately, disagreeing with slot 3 ("I am the one answering" Bible questions) is teaching's "others" statement from the reader's side, and the brief names teaching and knowledge as a pair that must not share an act. Three items cannot weigh two readings evenly unless the reverse item is neutral between them, and I could not write one that survived: "In most conversations I am the one finding things out" is loaded (rule 3: disagreeing sounds arrogant) and is temperament; "What I know about other people is what I have seen or been told" rewards the reader who prides themselves on a hunch about people, which is the fault job 3 exists to remove. So do not retry those two.

**Replacement I would accept:** keep the three statements, which are each fairly keyed, and make the page and the file honest about the weighting.

- In 1.1, replace the quoted sentence with: "Two statements ask about the first reading and one about the second. A reader with only the first reaches 67; a reader with only the second reaches 67 if they are middling on the Bible statements and 33 if they are new to the Bible. The well-read reader also rises on teaching."
- In the summary, replace "and these statements ask about both" with "and these statements ask about both, two about the first and one about the second".
- Tell the Pentecostal reviewer this first; of everything in the proposal it is the row most likely to draw that reviewer's blocker.

### 5. "Everyone there" and "nobody" include the person praying

**Words.** Miracles slot 1: "I have prayed for something everyone there thought impossible, and it happened." Healing slot 3: "More than once, someone I prayed with has recovered when nobody expected them to."

**Why.** Read as written, the reader who prayed is one of "everyone there" and one of the "nobody". The reader who prayed expecting it, which is how the people this row is for describe what they do, must disagree with both, and a careful, literal reader is exactly who this quiz wants answering. It miskeys the reader with most of the pattern.

**Replacements:**

> I have prayed for something the others there thought impossible, and it happened. (13 words)

> More than once, someone I prayed with has recovered when the people around them did not expect it. (18 words)

"The people around them" rather than "had stopped expecting", so the wording stays off faith's slot 1 ("after they have stopped expecting it").

### 6. Discernment now has two "others" statements, which recreates for one gift the fault job 2 removes from six

**Words.** Slot 2: "Friends send me a talk or a book and ask whether it can be trusted." Slot 3: "... and they later told me I was right."

**Why.** Scored: a reader who has every pattern in full and nobody around to ask, tell or confirm gets 67 on eighteen rows and **33 on discernment**, because two of its three statements need other people. That is the first audit's G7 (differential functioning by circumstance, not by gift), and section 7 decision 9 itself says job 2 "exists to make that even across all nineteen". The proposal records the cost and accepts it. The three-slot pattern (one reverse, one "others", one own act or event) holds for the other eighteen gifts and breaks only here.

**Replacement I would accept (slot 2, +1, the reader's own event, 18 words), keeping slot 3 as the "others" statement the brief asked for:**

> I have stopped listening to a speaker or writer I liked because of what they taught about God.

Its object is what was taught, it is silent on how the reader knew, and "I liked" turns the old fault round: the judgement went against the first impression of the person, so a prejudiced reader has nothing to agree with. It is not slot 1 turned round (that is about looking into where an idea came from). Both answers are somebody's honest position. If the editor would rather keep "Friends send me a talk or a book", then slot 3 must lose its second half, and the guard against the reader who warns against everything goes with it; I think that is the worse trade.

### 7. Rows about events fill on one occasion; rows about habits do not, and the page ranks them together

**Words (`result`):** the new sentence "Where a statement asks what has happened or what people said, this page does not say what any event was." It is fine as far as it goes. It does not say what the ranking does.

**Why.** Thirty-nine statements are habits in the present tense and draw middling answers. Most of the eighteen new ones are lifetime events ("I have ...") and draw the ends of the scale. A reader who once, years ago, spoke in church and was interpreted answers -2, +2, +2 and scores 100 for life. Rough run: that row is in the headline on 100 per cent of sheets and alone in it on 71 per cent, whatever the other sixteen rows say. The same holds for interpretation, and in part for prophecy slot 3 and miracles slot 1. Asking "how often" would cure it and is forbidden by rule 6, so the honest course is to say it.

**Replacement (add to `result`, after the sentence quoted above):**

> Some rows ask about habits and some ask whether a thing has ever happened. One occasion can fill a row of the second kind, so the order of the rows is not an order of strength.

For the reader with none of the six experiences the added rows change nothing: flat 19.1 against 18.8 per cent, ties and clear results the same. That part passes (see Passes).

### 8. The gift page would print "3 recorded acts" over passages the summary says are not acts

**Words (section 8):** "The knowledge and interpretation pages rely on their summaries to say that the list below them is not a list of acts, so no new field is needed for that."

**Why.** `site/src/pages/axis/[quiz]/[axis].astro` prints the heading "What it has looked like" and the kicker "N recorded acts, each cited" above `acts`. For the word of knowledge that kicker would sit over a thanksgiving, a question beginning "if I come to you" (1 Corinthians 14:6) and a compliment to Rome; for interpreting tongues, over three instructions. The summary above would be saying "Acts never shows anyone doing it" while the heading beneath says "3 recorded acts". The quiz file's own header warns against exactly this class of fault (headings that are "false for a gift"). A new field is needed.

**Replacement for the engineer:** an optional heading and kicker per group. For these two: heading "What Paul writes about it", kicker "3 passages, each cited".

### 9. Claims about what Christians hold, and about what the list below is, that nobody has opened a source for

Three places. The proposal flags the first two itself and defers them; the first audit's G11 treated uncited claims inside the honest frame as major, and they should not be wired in that state.

**(a) [S3], on wisdom, discernment and faith:** "Christians who believe some gifts were only for the time of the apostles disagree about whether this is one of them." The only source is a reviewer's recollection of Gaffin and Robertson; no book was opened. **Replacement, every part of which can be checked on this site (the sentence is one sentence in the translation on disk, and the disagreement is the Compass's audited axis):**

> Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.

**(b) The two readings of the word of knowledge:** "Some Christians take it as ... others as ...". Uncited, and it sits oddly beside [S6] on the same page: those who hold the first reading mostly do not hold that it ceased. Either open one standard work for each reading before this leaves draft, or use wording that attributes nothing:

> The passage names a word of knowledge, something said, and nowhere explains it, and Christians read it in more than one way. These statements ask about two things: having the part of the Bible people need ready to say, and knowing a fact about someone that nobody had told you. They cannot see how you came to know anything.

**(c) "so the passages below are the places where Paul writes of knowledge among a church’s gifts."** Two overclaims. "The places" is not so: 1 Corinthians 13:2, 13:8 and 2 Corinthians 8:7 are others (the first two left off on purpose, which is right, but then the page cannot say "the places"). And Romans 15:14 does not mention gifts: "full of goodness, filled with all knowledge, able also to admonish others". Calling it knowledge "among a church’s gifts" is a connection the site made. **Replacement:**

> The New Testament calls no recorded act a word of knowledge, so the passages below are not acts: they are three places where Paul writes of knowledge in a church.

---

## Minor

### 10. Miracles, reverse item: a bystander raises the row

**Words:** "Remarkable answers to prayer are things I hear about from others, not things I have been part of." Anyone who was in the room has "been part of" it and disagrees, which adds two points for being present; and it is two claims (a reader who never hears of any cannot answer the first). **Replacement (14 words), in the form of the tongues reverse item, which the proposal rightly calls the model:**

> Every remarkable answer to prayer I know of came when somebody else was praying.

The reader who knows of none agrees or answers neither; the bystander agrees; the reader whose own prayer it was disagrees. Sign unchanged, -1.

### 11. Tongues, slots 1 and 2: the distinguishing words come last, and a taught prayer slips through slot 1

Slot 2, "I have prayed in words nobody taught me, which belong to no language I know": a reader skimming on a phone stops at "words nobody taught me", which is every unscripted prayer in English, and agrees. Put the distinguishing clause first: **"I have prayed in words that belong to no language I know and that nobody taught me."** (17 words.) Slot 1, "Every word I have ever prayed has been in a language I know": the proposal guards slot 2 against a memorised Latin or Church Slavonic prayer and leaves slot 1 open to it. Optional: **"Every prayer I have ever prayed was in words I knew or had been taught."** (15 words.) The effect is small (that reader's row stays "not found here").

### 12. Tongues, slot 3, is two claims by design; say so where rule 1 is recorded

"In church I have spoken in words from no language I know, and someone else has said what they meant." A reader who has spoken aloud in church with no interpretation following, common in Pentecostal worship, can truthfully say neither yes nor no. I accept it as the only "others" statement available, and the proposal admits it is "the weakest kind". It should be listed under "What this edit leaves honest and unsolved" as the one deliberate exception to rule 1, beside finding 3.

### 13. Giving: a statement with two claims replaces one removed for having two claims

Section 2 says the old slot 3 goes because it is "the only statement in the quiz with two claims". It was not (serving's "People ask me ..., and I usually say yes" is two, and the first audit's G12 said so), and the replacement is two again: people tell me, and I give. A generous reader nobody tells, and a reader who is told and cannot give, both have to disagree. **Replacement in administration's one-claim shape (15 words): "People tell me when someone is going without, because they know I will give something."** If the editor's wording is kept, correct the stated reason: the old statement goes because its second claim is an inner state.

### 14. The optional line above the answer scale miskeys the reverse items it sits over

"If something has never happened to you, disagree is an honest answer." Applied as a rule of thumb to "When someone speaks in a language nobody there knows, I have no idea what it means" (it has never happened, so disagree) it raises the row. Scored: a never-been-there reader who disagrees with all eighteen new statements gets 33 on each of the six, not 0. Both print "not found here", so the harm is small, but the line can be right for free. The proposal's worry about "neither" is confirmed: "neither" on the events with "disagree" on the reverse items scores 67 on all six rows. **Replacement:**

> Agree means the sentence is true of you as it is written. Disagree means it is not. Some sentences say a thing has happened and some say it has not, so read each one to the end.

### 15. Acts 21:9-14 names Philip, who is in verse 8

The proposal's own rule (section 7): "no sentence names a place or a person from outside its range". Verse 9 says "this man". **Fix:** cite **Acts 21:8-14** and keep the sentence. Evangelism's Acts 21:8 sentence is about what Luke calls Philip; this one is about his daughters and Agabus. One verse shared is not one act shared.

### 16. The case for keeping Elymas under discernment rests on a verse the page does not cite

Section 3 keeps the act because Elymas "is called 'a false prophet'", which is 1 John 4:1's own case. That is Acts 13:6; the page cites 13:8-10 and its sentence never says it. **Replacement (Acts 13:6-10):** "At Paphos they found a sorcerer, a false prophet, whose name was Bar Jesus, with the proconsul, who had summoned Barnabas and Saul to hear the word of God; the sorcerer, whose name Luke also gives as Elymas, withstood them, seeking to turn the proconsul away from the faith, and Paul, filled with the Holy Spirit, fastened his eyes on him and called him full of all deceit."

### 17. "This page calls nothing a miracle itself", on a page that lists Acts 9:40-42 under miracles

The text of Acts 9:40-42 does not use the word; the page puts it under the heading for miracles, as every gift page puts acts under its gift. The intent is right and the sentence is too wide. **Replacement:** "These statements call nothing a miracle themselves." And in the disputed note: "and calls nothing that has happened to you a miracle, a healing or a word from God."

### 18. One Greek word, two glosses on two pages

The encouraging page says the translation "says exhorting where many others say encouraging". The prophecy summary glosses the same word in 1 Corinthians 14:3 as "urge them on". **Replacement:** "that is, to build them up, encourage them and comfort them". The overlap between prophecy and encouraging is in the text, and section 5 already says so.

### 19. The discernment summary says the statements are about what is "said or taught about God"; two of the three are not

Slot 1 is about "a new idea" and slot 2 about "a talk or a book", of any kind. **Replacement for that sentence:** "These statements ask whether you look into what you are told before you accept it, and what has happened when you weighed something taught about God."

### 20. "Every gift in the lists Paul and Peter give is here, nineteen in all"

Hospitality is not in a list; the quiz's own hospitality summary says Peter "asks hospitality of everyone and speaks of each person’s gift in the next sentence" (the first audit's G14). "Nineteen in all" counts it as from the lists. **Replacement:** "Every gift named in those lists is here, with hospitality, which Peter asks of everyone one verse before he writes of gifts: nineteen in all".

---

## Passes

**Keying.** All 26 new or changed signs re-derived from the final wording: the six "others" replacements +1; discernment -1, +1, +1; each new gift exactly one -1. None wrong.

**Acquiescence.** Agree with everything: 58 on all nineteen. Strongly agree with everything: 67 on all nineteen, flat, nothing named. Strongly disagree with everything: 33 on all nineteen, flat. The naming floor of 17 still does its job at nineteen rows.

**Reverse items and the reader who has never been there.** Tongues slot 1, interpretation slot 1 and prophecy slot 1 are model items: that reader's honest answer is agree, which lowers the row. Healing slot 2 passes (a reader who never prays with anyone finds the meal more likely, and agrees); it compares two acts and counts neither, so it is inside rule 6, and no other row scores the meal. Knowledge slot 3 passes on keying (see finding 4 for what it costs). Miracles slot 2: finding 10.

**Whole rows of "not found here".** For a reader with none of the six experiences the added rows sit at 0 and do nothing to the ranking or the headline: rough run, flat 19.1 per cent at thirteen gifts against 18.8 at nineteen, ties 50.1 against 50.2, no added gift ever named. The share text prints the top three only. The `low` note carries the rest.

**The three-slot pattern.** One reverse, one "others", one own act or event: holds for eighteen of nineteen. Discernment is finding 6.

**Job 2.** My own count agrees: seven of the thirteen had an "others" statement, six had none, and the audit log's "five" predates its own fix G8. All six removals are the right statements to remove, for the reasons given (with finding 13's correction to giving's). Leading, mercy, faith, evangelism and hospitality's replacements pass as written. The evangelism arithmetic is right: the reader who speaks only when asked nets nothing.

**Job 3.** The new slot 3 reports an act and what people later said, its object is what was taught, and it is silent on how the reader knew. Slot 1 unchanged is right. "Luke does not say how Peter knew" was checked against Acts 5:1-4 and is true. 1 Corinthians 12:8-10 is one sentence in the translation on disk.

**Statements that pass as written:** knowledge slots 1 and 2 (slot 2's "nobody had told me" does close the gossip loophole, and the person's own surprise is the guard a bare hunch lacked); miracles slot 3 (the word is other people's); all three prophecy statements (the preacher who agrees with all three is left in on purpose, which I accept once finding 2's copy stops promising otherwise); all three interpretation statements ("nobody there" does keep the translator of Polish out).

**No statement says in the site's voice that an event was a miracle, a healing or a word from God.** Eight statements mention praying; none counts it.

**Quotations.** 33 of 33 verbatim on re-extraction, and nothing curly-quoted in sections 1 to 4 is missing from the table. All fourteen listing passages are substrings of the verses named. "Let’s" carries the translation's own apostrophe.

**Act sentences, each read beside its verses.** Healing: Acts 3:1-12, 9:32-35, 28:7-9, 5:12-16, all four pass; nothing trimmed, nothing added. Miracles: Acts 9:40-42, 19:11-12, Galatians 3:5, 2 Corinthians 12:12, all pass, and one verse for each reading is fair. Prophecy: Acts 11:27-30, 13:1-3 and 1 Timothy 1:18 pass ("given to you" is the text); 21:9-14 is finding 15. Tongues: Acts 2:1-13 (wind, fire and the mockers all in), 10:44-46, 19:1-7, 1 Corinthians 14:18-19, all pass. Interpretation: 14:5 (the first clause restored), 14:13, 14:26-28, all pass as descriptions. Knowledge: 1 Corinthians 1:4-7, 14:6 and Romans 15:14 pass as descriptions of their verses; the sentence that frames them is finding 9(c). Two words are dropped that do not change a meaning ("always" in 1 Corinthians 1:4, "Truly" in 2 Corinthians 12:12).

**Checked claims about the text.** "The New Testament calls no recorded act a word of knowledge": the phrase occurs once, at 1 Corinthians 12:8. "Acts never shows anyone doing it": "interpret" occurs in Acts twice, both Luke translating a name (4:36, 13:8). "Both words in the plural": yes. "Praying" in the tongues summary is textual (1 Corinthians 14:14). No range is shared with another gift's act except as finding 15 proposes.

**Copy.** [S6] passes: one sentence, identical on six pages, the Compass's vocabulary, never "sign gifts" in the site's voice. Healing's extra sentence passes. The tagline, description, intro, `low`, `flat` and `omitted` texts pass. The change from "Some of these patterns" to "Some of the everyday patterns" is right and needed.

**For the engineer, confirmed:** 13 to the power 19 is about 1.5e21, past the safe-integer limit, so the wide codec is needed; 19 is prime, so a start and a stride per round visit every gift once.
