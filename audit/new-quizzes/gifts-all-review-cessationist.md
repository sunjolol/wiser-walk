# Review of the all-gifts proposal: the cessationist chair

Reviewer's position: confessional cessationist. The gifts named in 1 Corinthians 12:8-10 that carried
or confirmed new revelation were given for the founding of the church; Westminster Confession 1.1,
as the Compass's own Gifts axis quotes it, says God's former ways of revealing his will are "now
ceased". I accept the owner's decision that all nineteen gifts are in the quiz. I am not asking for
anything to be taken out.

What was read: `gifts-all-edit.md` in full, beside `site/src/lib/quizzes/spiritual-gifts.ts`,
`QUIZ-BLUEPRINTS.md` (the six rules and quiz two), the first cessationist audit
(`audit-cessationist.md`), `AUDIT-LOG.md` decision 1, the Compass's Gifts axis in
`site/src/data/compass.json`, and `site/src/lib/strategies/category.ts` and
`site/src/lib/engine/types.ts` for how a headline, a share text and a travelling note are built.
Every verse I quote or lean on below was opened with `node audit/tools/webbe.mjs` (World English
Bible British Edition). The quotations I propose were run through `--check` with a deliberately
wrong control beside them: 7 of 8 verbatim, the control refused, as it should be. Nothing under
`site/` was touched and nothing was committed. This is the only file written.

Scope: only what is new or changed (the six new gifts, the six replaced statements, discernment,
the rewritten copy), judged as part of the whole nineteen.

## Verdict in four lines

- **One blocker** (finding 1): one sentence in the tongues summary undoes the care taken in the
  tongues statements and tells a reader, in the site's voice, that what happened to them was the
  gift. Two sentences fix it.
- **Four majors** (findings 2 to 5): the six disputed names travel on the headline and the share
  text with no sentence beside them, although the engine already has the rule and the mechanism for
  exactly this; the prophecy summary quotes the two verses one side's account of prophecy rests on
  and stops one verse short of the word "revelation"; the low-row copy uses 1 Corinthians 12:30 in a
  way that answers the disputed question; one interpretation statement cannot be answered truthfully
  by a reader who once did this and no longer believes it was what it was said to be.
- **Six minors** (findings 6 to 11).
- **Most of the proposal passes**, and some of it is better than I would have asked for. The list is
  at the end. In particular: [S6] is my position in words I accept; the healing sentence taken from
  the Compass is right; the discernment rewrite is exactly what the passage supports; the recorded
  acts keep the apostles' hands, the fulfilment of Agabus's famine and "the signs of an apostle" in.

---

## Findings

### 1. BLOCKER. The tongues summary says the statements ask whether the gift has happened to you. They do not, on purpose.

**Words objected to** (1.5, summary): "speaking or praying in a language the speaker has never
learnt. [...] These statements ask only whether this has happened to you, on your own or in church."

**Why.** "This" can only point back to the definition: speaking or praying in a language the
speaker has never learnt. But the statements were carefully written NOT to ask that. Slot 2 says
"words nobody taught me, which belong to no language I know", and the editor's own note says why:
it "does not make the reader grant that it was a language". The summary then grants it for them. A
reader who agrees with slot 2 is told by the page that the thing the statements asked about, and
that they said yes to, is speaking in a language they never learnt, which is the gift as the page
has just defined it. That is the one identification my side denies (we hold that what Luke records
at Pentecost was real languages that the hearers knew, and that present-day speech of this kind is
not that), and it is made in the site's voice. The brief's own rule is that nothing in the site's
voice may say what an event was. Healing's summary has the guard ("They cannot tell this gift apart
from an answer to prayer"); miracles has one ("This page calls nothing a miracle itself"); tongues,
where the identification is the whole dispute, has none.

A smaller fault in the same summary (minor on its own): "At Pentecost 'everyone heard them speaking
in his own language' (Acts 2:6); to Corinth Paul writes of a speaker whom 'no one understands'
(1 Corinthians 14:2)." Both quotations are verbatim and I checked them. But set against each other
across a semicolon they read as two kinds of speech, understood and not understood, which is one
side's reading. My side reads 14:2 as the same gift in a room where nobody knows that language and
nobody interprets (14:5, 14:13, 14:28). The page need not decide; it should say the question is open.

**Replacement I would accept** (the first sentence is unchanged):

> The translation quoted here says different kinds of languages where many others say tongues: speaking or praying in a language the speaker has never learnt. At Pentecost “everyone heard them speaking in his own language” (Acts 2:6); to Corinth Paul writes of a speaker whom “no one understands” (1 Corinthians 14:2), and Christians disagree about whether the two are the same thing. These statements ask whether you have prayed or spoken in words from no language you know, on your own or in church. They cannot say what those words were. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.

A Pentecostal reader loses nothing: the result copy already says "this page does not say what any
event was", and this is that sentence on the page where it matters most.

### 2. MAJOR. The six disputed names are printed on the headline and in the share text with no sentence beside them, and the site already has a rule against that.

**Words objected to.** Not a sentence in the proposal, but two things it leaves as they are: section
4, "Unchanged: `headlineLead` [...] `shareTitle`", and section 7, where the share text is "passed to
somebody else" as something that "should be looked at". With those unchanged, a result prints
"Your answers pointed most to prophecy" as the largest type on the page, and the share text prints:

```
Where my answers pointed: spiritual gifts
███████████ prophecy
█████████░░ healing
████████░░░ miracles
```

and nothing else but a link.

**Why.** "Your answers pointed most to" is a fair frame and I accepted it for the thirteen. For
these six it is not enough by itself, because the question on the page is "What are your spiritual
gifts?" and the answer in the biggest type is a gift many Christians hold nobody has today. The
engine's own comment in `types.ts` states the rule better than I can: "a sentence that travels with
a name on the page and not on the card someone posts is the fairness problem, not a formatting
detail." That rule was written for Jesus's name in the figure quiz, and `notesFor()` /
`resultNotes()` already carry such a sentence to the result, the share text and the share card. The
six disputed gifts are the same case: a name that needs one sentence wherever it is printed. It is
also the case most likely to be screenshotted in a church like mine.

Two details the engineer will need. First, `named` holds only the leader (or the level leaders),
but the share text prints the top three, so "serving, prophecy, healing" with serving in front would
carry no note under the present logic. The sentence must travel whenever one of the six is PRINTED
by name on a share surface, not only when it leads. Second, it should print once, not once per gift.

The proposal's `disputed` note (section 4) is right for the intro. Its third sentence is wrong for
the result page of the reader who most needs it: someone looking at "healing: nearly all of this" is
told what a cessationist "will most likely see", which is not what they are seeing.

**Replacements I would accept.**

The travelling sentence, for the headline area of the result and for the share card, printed once
when any of the six is named or shown:

> Christians disagree about whether prophecy, healing, miracles, tongues, interpreting tongues and the word of knowledge are given today. A high row records answers about what has happened and what people have said. It does not say what any of it was.

The shorter form for the share text:

> Christians disagree about whether some of these gifts are given today. These rows record answers about what has happened and what people said, not what any of it was.

The `disputed` note, result-page version (sentences one and two unchanged; the intro keeps the
proposal's third sentence as it stands):

> [...] If one of those rows is high on your result, it records what you answered about what has happened and what people have said. It does not say that you have that gift, and it does not say that you have not.

The last clause is there for the Pentecostal reader, and I accept it: the page rules in neither direction.

### 3. MAJOR. The prophecy summary quotes 1 Corinthians 14:3 and 14:29 and stops one verse short of "revelation". It also lacks the guard healing has.

**Words objected to** (1.4, summary): "Paul says what it is for: [14:3 ...]. He also tells the church
to weigh it: 'let the others discern' (1 Corinthians 14:29). These statements ask whether you have
said what you believed God gave you to say, and what people said afterwards. Whether any of it was
from God is for your church to weigh, not this page."

**Why, in three parts.**

(a) "Paul says what it is for" is correctly worded: purpose, not definition. I pass that phrase. But
the two verses chosen are the two that the account of prophecy as fallible encouragement is built
on (it builds up; it is to be weighed). The next verse is the one my side's account is built on:
"But if a revelation is made to another sitting by, let the first keep silent" (1 Corinthians
14:30). Prophecy in that chapter is something said on the strength of a revelation. The Compass's
reading list names Gaffin's *Perspectives on Pentecost* for this side; I have not opened it for
this review and cite nothing from it, but no cessationist will read this summary without noticing
which verse is missing. Quoting 14:30 verbatim takes no side: Pentecostals hold that prophecy is
revelatory too. The recorded acts below the summary are all of that kind (Agabus foretelling a
famine "by the Spirit", which Luke says happened; "the Holy Spirit said"; "The Holy Spirit says"),
and they are fairly described. The summary should not be narrower than its own acts.

(b) The statements cannot tell this gift apart from preaching. Every minister in my tradition can
truthfully disagree with slot 1, agree with slot 2 (it is said to him at the church door most weeks)
and, depending how he takes "given me to say", agree with slot 3. He will be shown prophecy first,
over 1 Corinthians 12:10, while holding that the gift ceased. The editor's "unsolved" item 5 treats
only the preacher who thinks preaching IS prophecy and leaves it in on purpose. I do not ask for the
statements to change; I agree the page must not rule on that question. I ask for the same honest
sentence healing has, so that he understands why his row is high.

(c) "is for your church to weigh" is advice in the site's voice to apply 1 Corinthians 14:29 to the
reader's own words today. My church would not weigh whether a member's remark was a word from God;
it holds that none is given. "He also tells the church to weigh it" has a second, smaller problem:
the verse says "the others", and whether that is the other prophets or the whole congregation is
disputed. The quotation can carry itself.

**Replacement I would accept:**

> Paul says what it is for: “he who prophesies speaks to men for their edification, exhortation, and consolation” (1 Corinthians 14:3), that is, to build them up, urge them on and comfort them. He also writes, “let the others discern”, and, “if a revelation is made to another sitting by, let the first keep silent” (1 Corinthians 14:29-30). These statements ask whether you have said what you believed God gave you to say, and what people said afterwards. They cannot tell this gift apart from preaching, or from advice that came at the right time, and this page does not say whether any of it was from God. 1 Corinthians 12:28 and Ephesians 4:11 also name prophets among the people given to the church; a result here names a pattern and says nothing about whether anybody is a prophet. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.

Both new quotations are verbatim substrings of their verses (checked).

### 4. MAJOR. The low-row copy uses 1 Corinthians 12:30 to explain a low row, which answers the disputed question by arrangement.

**Words objected to** (section 4, `low`): "Some of these are asked of everyone: [...] And Paul asks,
'Do all have gifts of healings? Do all speak with various languages? Do all interpret?'
(1 Corinthians 12:30)." With the note: "Paul's three questions are quoted and left to speak; the
site adds no gloss."

**Why.** The placement is the gloss. This text prints wherever a gift is below the line, so it
prints on the result of every reader from my tradition, under six rows reading "not found here". Put
there, Paul's question says: your row is low because not everyone has these, and you are one of
those who do not. That is the continuationist reason for a low row. Mine is that Paul was writing
to a church in which these gifts were then at work, and that nobody has them now. The quotation is
Scripture and I do not want it removed. I want the second honest reason beside it, in the same
words the six summaries already use.

**Replacement I would accept** (only the last sentence changes):

> [...] (1 Peter 4:9) comes one verse earlier. Of others Paul asks, “Do all have gifts of healings? Do all speak with various languages? Do all interpret?” (1 Corinthians 12:30), and many Christians believe those were given only for the time of the apostles.

### 5. MAJOR. Interpretation, slot 2: "I have said what it meant" cannot be answered truthfully by a reader who once did this and no longer believes it.

**Words objected to** (1.6, slot 2): "When someone has spoken in a language nobody there knew, I
have said what it meant."

**Why.** Many people in churches like mine came out of charismatic churches. One who used to stand
up and interpret now faces a statement he can neither agree with (it concedes, in his own first
person, that the speech had a meaning and that he gave it) nor disagree with (the event happened).
The editor's note says the statement "does not claim the meaning was right"; in plain English "I
said what it meant" does. Prophecy slot 3 already solves the same problem with two words ("that I
believed God had given me to say"), so this is an inconsistency inside the proposal, not a new
demand. It also matters because the `disputed` note promises that a reader who believes these gifts
are not given today "can answer every statement truthfully". With this statement as written, that
promise is false for an identifiable group.

**Replacement I would accept** (20 words, +1, still silent on whether the meaning was right):

> When someone has spoken in a language nobody there knew, I have told the others what I believed it meant.

### 6. MINOR. Tongues, slot 3: "someone else has said what they meant".

**Words objected to** (1.5, slot 3): "In church I have spoken in words from no language I know, and
someone else has said what they meant."

**Why.** The same fault as finding 5, one remove milder, because the reader is reporting another
person's act and not his own. The first half is careful to grant nothing about the words; the second
half grants that they meant something. A former charismatic can probably live with it as a report of
what was said. I would still rather the two halves matched.

**Replacement I would accept** (21 words by script, which is the limit; the editor may prefer to
keep the original and I would not hold the quiz for it):

> In church I have spoken in words from no language I know, and someone else said what they believed it meant.

### 7. MINOR. Healing's reverse item scores a duty asked of every church as the presence of the gift. Fix it in the summary, not the statement.

**Words objected to** (1.2, slot 2): "When somebody is ill, I am more likely to bring them a meal
than to pray with them." (-1)

**Why.** Disagreeing raises healing by up to two points, and disagreeing is simply what James asks:
"Is any amongst you sick? Let him call for the elders of the assembly, and let them pray over him"
(James 5:14); "pray for one another, that you may be healed" (James 5:16). An elder in my tradition
who has visited the sick for thirty years disagrees with slot 2, agrees with slot 1 and agrees with
slot 3, all truthfully, and reaches the top of a row named from "gifts of healings" while holding
that the gift ceased. I have no better reverse item to offer (the loaded critic's alternative counts
private prayer, which is worse), and the editor was right to leave James 5:14-15 off the list of
recorded acts because it names no gift. But that is exactly why it belongs in the guard sentence: it
is the ordinary thing the statements cannot tell the gift apart from.

**Replacement I would accept** (the guard sentence of the healing summary; the rest unchanged):

> They cannot tell this gift apart from an answer to prayer, and James asks that prayer of everyone: “pray for one another, that you may be healed” (James 5:16). Nothing here counts how much anyone prays.

### 8. MINOR. Discernment summary: "Paul tells the church to weigh what prophets say".

**Words objected to** (section 3, summary): "Paul tells the church to weigh what prophets say, 'let
the others discern' (1 Corinthians 14:29)".

**Why.** The verse reads "Let two or three of the prophets speak, and let the others discern." Who
"the others" are (the other prophets, or everyone present) is a known disagreement, and "the church"
decides it in the site's voice. Small, and cheap to avoid.

**Replacement I would accept:**

> Of prophets speaking in church Paul writes, “let the others discern” (1 Corinthians 14:29), and John writes, “test the spirits, whether they are of God” (1 John 4:1).

### 9. MINOR. The interpretation summary has no sentence saying what the statements ask or what they cannot see.

**Words objected to** (1.6, summary): the absence. Five of the six new summaries say what the
statements ask; this one goes straight from Paul's instructions to [S6].

**Why.** For the same reason as findings 1 and 5: a high row should not read as the page saying a
true meaning was given.

**Replacement I would accept** (one sentence, placed before [S6]):

> These statements ask whether you have said what you believed such speech meant, and whether people at church look to you for it. They cannot say whether any meaning given was right.

### 10. MINOR. The `disputed` note and the draft note say the disagreement is about six gifts. For many on my side it is about nine, and the line now runs through the middle of one verse.

**Words objected to** (section 4, `disputed` and `draftNote`): "disagree about whether prophecy,
healing, miracles, tongues, their interpretation and the word of knowledge are given today."

**Why.** The first audit's finding G1 was that the line between in and out ran through the middle
of one sentence of Paul's. All nine are in now, which settles that. But "the word of wisdom" and
"the word of knowledge" are one clause of one verse (1 Corinthians 12:8), and the proposal gives
knowledge the sentence for the six ([S6]) and wisdom the softer one ([S3]), and lists knowledge in
the `disputed` note and wisdom not. The three summaries that carry [S3] already say the true thing;
the two notes that a reader sees first do not mention it, so they understate my side's position.
I accept [S3] as worded. I ask only that the notes not contradict the summaries by silence.

Caution, which the editor has already flagged and I repeat: the claim that cessationists differ
among themselves about these three rests on the first reviewer naming Gaffin and O. Palmer
Robertson. Nobody has opened either book, and I have not. It belongs on the citation pass before
this leaves draft.

**Replacement I would accept** (one sentence added after the first sentence of `disputed`, and the
same clause in the draft note):

> Some would add the word of wisdom, the gift of faith and the discerning of spirits, which Paul names in the same sentence.

### 11. MINOR. The word of knowledge: neither reading named in the summary is attributed, and neither is mine.

**Words objected to** (1.1, summary): "Some Christians take it as having what the Bible teaches
ready to say when it is needed, others as being given a fact that nobody had told you".

**Why.** Both are readings of the gift as something met with today. A third is that it was a gift of
revealed knowledge given for the founding of the church, whatever its exact content; [S6] at the end
of the summary covers that well enough, which is why this is minor. The real weakness is the one the
editor names: both readings are uncited. "Some Christians ... others" is acceptable for a draft and
not for a live page on a site whose promise is that everything is citable. No wording change asked
for now; it goes on the citation pass with [S3].

---

## What passes

Stated explicitly, because most of it does.

**The sentence for the six, [S6].** "Many Christians believe God still gives this gift today; many
believe he gave it only for the time of the apostles." These are words I would use. "Only" is
needed and is there. The editor was right to refuse "to be welcomed and tested" (a warm clause for
one side only) and "authenticated" (not plain). Identical on all six pages: right.

**Healing's extra sentence.** "Both believe that God still heals and answers prayer." This is the
Compass's audited wording for my position, given to both sides. Pass, gladly. It is the sentence
that keeps a reader from thinking a cessationist does not pray for the sick.

**[S3]**, as wording, for wisdom, discernment and faith. Pass, subject to the citation pass.

**The Compass link line.** Pass.

**Every new statement, read as a cessationist answering for himself, except findings 5 and 6.**
- Knowledge 1, 2, 3: pass. I can answer all three truthfully. Slot 2 puts the question in other
  people's mouths and is silent on how. I am glad the first reading has a statement of its own.
- Healing 1 and 3: pass. "After", not "because"; "recovered when nobody expected them to" is a fact
  I can report and thank God for without conceding a gift. Slot 2: pass as a statement (finding 7
  is about the summary).
- Miracles 1, 2, 3: pass. "Have used the word miracle for" is exactly right: the word is theirs.
- Prophecy 2 and 3: pass. "I believed" in slot 3 is what makes it answerable.
- Prophecy 1, the reverse item ("I leave it to others to say what they believe God is saying"): pass,
  with a remark and no finding. "Leave it to others" faintly suggests it is a job somebody ought to
  do, and I do not think it is. But my honest answer is plainly Agree, it lowers the row, and I am
  neither insulted nor cornered. Every alternative I tried was worse on the plain critic's grounds.
- Tongues 1 and 2: pass. "Which belong to no language I know" grants nothing; a former charismatic
  can agree truthfully and a lifelong cessationist can disagree truthfully.
- Interpretation 1 and 3: pass. I considered objecting that these call the speech "a language" when
  the tongues statements avoid it, and decided a fair-minded member of my tradition would not: the
  statements are conditional, my answers concede nothing, and "language" is the translation's word
  and my side's own definition of the gift.
- Of the eight wordings the editor says no critic had read, I have now read all eight: six pass
  outright, one is finding 5, one is finding 6.

**Discernment, all of it except finding 8.** The replacement statement ("I have warned people about
something they were being taught about God, and they later told me I was right") has the right
object, which is the first audit's finding G5(a) answered properly. Slot 2's new wording has the same
object. The summary defines nothing, says the statements "are not about first impressions of
people", and quotes 1 John 4:1. "Luke does not say how Peter knew" on Acts 5:1-4 is the first
audit's G5(c) answered in the best available way, and keeping that passage off the word of knowledge
page is right.

**The six "others" replacements** (giving, leading, mercy, faith, evangelism, hospitality). Nothing
to object to from this chair. Faith's new statement keeps the "staying sure" reading the first audit
asked for, and the editor's reason for refusing "before there was any reason" (in Acts 27:23-25
Paul had been told) is correct.

**The recorded acts for the six.** I read every one beside its verses looking for the apostles
being trimmed out, and found nothing trimmed: "By the hands of the apostles" (Acts 5:12), "God
worked special miracles by the hands of Paul" (Acts 19:11), "when Paul had laid his hands on them"
(Acts 19:6), "the signs of an apostle" (2 Corinthians 12:12), "indicated by the Spirit" and the
fulfilment under Claudius (Acts 11:28) are all there. Galatians 3:5 stands beside 2 Corinthians
12:12, which is even-handed. Leaving 1 Corinthians 13:8-12 and Hebrews 2:3-4 to the Compass, and
James 5:14-15 and 2 Timothy 4:20 off the healing acts, is right on both counts.

**The knowledge summary's factual sentences** ("nowhere explains it"; "The New Testament calls no
recorded act a word of knowledge"). Pass.

**The miracles summary.** "This page calls nothing a miracle itself." Pass. I considered asking for
a sentence parallel to healing's ("both believe God still works miracles") and did not, because it
would not be true of everyone on my side, and an untrue kindness is worse than none.

**The prophecy summary's sentence about prophets** ("says nothing about whether anybody is a
prophet"), and "Paul says what it is for" (purpose, not definition). Pass.

**The intro, the result copy, the flat copy, the tagline, the description.** Pass. "It is not a
measurement of what God has given you", "this page does not say what any event was" and "Some of
the everyday patterns here" are all right. Nothing in the site's voice in these says the six are
given today.

**`omitted`.** "Leaving them unscored says nothing about their rank, and nothing about whether they
are given today" is the first audit's G2 wording, kept. "Prophecy is scored here, and whether
anybody is a prophet is not": pass.

**`disputed`, first two sentences**, and the third sentence for the intro once finding 5 is applied
(until then its promise is not quite true). "Will most likely see", not "will simply see", is the
honest verb, and the editor's reason for it is correct.

**The tongues scoring** (private use alone reaches "some of this" and no headline; only the form
1 Corinthians 14:27-28 describes reaches the top). Pass, and the plain statement of it to the owner
is fair.

**The optional line above the answer scale** ("If something has never happened to you, disagree is
an honest answer"). Pass, and I would urge it: it is the sentence that makes fifteen of these
statements comfortable for a reader like me.

## One observation outside my chair, offered and not pressed

The draft note says "Every gift in the lists Paul and Peter give is here". 1 Peter 4:11 goes on, "If
anyone speaks, let it be as it were the very words of God. If anyone serves ...". Serving is scored;
"speaks" is not a row. The editor may judge it covered by teaching and prophecy, but "every" is a
word an evidence reviewer will test.
