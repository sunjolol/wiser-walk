# Audit: Pentecostal / charismatic lens

Reviewer lens: Assemblies of God, Church of God in Christ, non-denominational charismatic.
Files read: QUIZ-BLUEPRINTS.md, gifts-final.md, figure-final.md, spiritual-gifts.ts, bible-figure.ts,
bible-figures.json. Every verse below was read in the World English Bible British Edition on disk
(`verses-all.json`, src `webbe`). Nothing was edited.

## Short answer to the lens question

Yes. However kindly it is worded, the draft reads as the familiar cessationist-shaped inventory,
for a structural reason and not a tonal one: it keeps three items of Paul's one sentence in
1 Corinthians 12:8-10 (word of wisdom, faith, discerning of spirits), redefines each as an everyday
trait, and drops the other six, while saying the dropped ones "could not be measured fairly" by
self-report. The same objection applies equally to the three it kept, and the draft admits so in
their summaries. On top of that, the cited acts repeatedly stop one verse short of the sign, the
prophecy or the Spirit's speech that the passage itself records. A Pentecostal reader will notice
the pattern before reading the disclaimer.

## Spiritual gifts

### G1. BLOCKER: the rule that sorts gifts in and out is applied to one side only
Target: `giftsFrame.notIncluded` ("a set of statements about yourself could not measure them fairly
either way") against the summaries of wisdom, discernment and faith.
Problem: 1 Corinthians 12:8-10 is one list. The draft scores "the word of wisdom", "faith" and
"discerning of spirits" by an "everyday pattern" it admits is not what the passage names, yet
refuses prophecy, healings, miracles and languages on the ground that self-report cannot measure
them. Either reason excludes all nine or none. As built, a reader whose church recognises her in
prophecy is handed "administration" under the title "What are your spiritual gifts?".
Fix: pick one and apply it evenly. Either (a) drop wisdom, discernment and faith too, call the
quiz what it then is (the Romans 12 / 1 Peter 4 service gifts) and retitle; or (b) bring the rest
in by the reader's choice (see "How I would want them included" below). Until then this must not
leave `draft`.

### G2. MAJOR: "word of knowledge", apostles and prophets are left out and never named
Target: `giftsFrame.notIncluded`, the draft note, and the description "Thirteen gifts the New
Testament lists".
Problem: the page names five omissions. 1 Corinthians 12:8 on disk also has "the word of
knowledge", sitting between two gifts the draft kept; Ephesians 4:11 has "apostles; and some,
prophets" in the same verse the draft quotes for evangelists and shepherds; 1 Corinthians 12:28
has "first apostles, second prophets ... then miracle workers". A site that promises to say what it
left out has silently left these out.
Fix: name every omission: "Prophecy and prophets, the word of knowledge, gifts of healings,
workings of miracles, different kinds of languages and their interpretation, and apostles are not
in this draft." Change the description to "Thirteen of the gifts the New Testament lists".

### G3. MAJOR: Acts 8:5-8 is summarised with verses 6 and 7 removed
Target: evangelism, recorded act "Acts 8:5-8. Philip went down to the city of Samaria and
proclaimed the Christ to them, and there was great joy in that city."
Problem: the cited range says the crowds listened "when they heard and saw the signs which he did.
For unclean spirits came out of many ... Many who had been paralysed and lame were healed." The
summary jumps from verse 5 to verse 8, so the joy is detached from what Luke attaches it to.
Fix: "Philip proclaimed the Christ in Samaria; the crowds listened when they heard and saw the
signs he did, unclean spirits came out, many paralysed and lame were healed, and there was great
joy in that city."

### G4. MAJOR: the same trimming in three more cited acts
- Encouraging, Acts 15:30-32: the text says "Judas and Silas, also being prophets themselves,
  encouraged the brothers". The summary drops "being prophets themselves". Fix: "Judas and Silas,
  whom Luke calls prophets themselves, encouraged the brothers with many words and strengthened
  them."
- Evangelism, Acts 8:26-35: "Philip ran to the Ethiopian official's chariot" omits verse 29, "The
  Spirit said to Philip, 'Go near, and join yourself to this chariot.'" Fix: "Told by the Spirit
  to go near the chariot, Philip ran to it, asked ..."
- Discernment, Acts 5:1-4: "Peter asked him why he had lied and kept part back" softens verse 3,
  "why has Satan filled your heart to lie to the Holy Spirit", and hides that Peter knew a thing
  nobody had told him, which is the only reason the act belongs under this gift. Fix: "Peter, not
  having been told, asked Ananias why Satan had filled his heart to lie to the Holy Spirit and keep
  back part of the price."
Problem in all three: each is accurate as far as it goes; together they make the early church read
as a committee. The blueprint's promise is "cited acts only", not cited acts minus the Spirit.

### G5. MAJOR: statement 15 marks Paul down on the quiz's own proof text for faith
Target: statement 15, faith, -1: "When the odds look bad, I am the one naming what could go wrong."
Problem: the faith page cites Acts 27:21-25. In Acts 27:10 the same Paul says "I perceive that the
voyage will be with injury and much loss", and in 27:21 "you should have listened to me". The
person the page holds up for faith is the one naming what could go wrong. In a charismatic church
that naming is often the prophetic or discerning voice, not the absence of faith.
Fix (16 words): "I need to see a way through before I tell other people it will work out."
Direction -1. Both ends cost something: one reassures too early, one withholds heart.

### G6. MAJOR: the intro states one model of gifts as though Scripture said it
Target: `giftsFrame.intro`, "gifts are recognised in service, by other people, over time", and
`introShort`, "other people usually name yours before you do."
Problem: no verse is cited, and the texts on disk also say other things: "distributing to each one
separately as he desires" (1 Corinthians 12:11); "earnestly desire spiritual gifts" (14:1); "let
him who speaks in another language pray that he may interpret" (14:13); "the gift that is in you,
which was given to you by prophecy with the laying on of the hands of the elders" (1 Timothy
4:14). Pentecostals read 12:7's "manifestation of the Spirit" as something given in a gathering as
needed, not only a standing trait discovered over a decade. The sentence takes a side.
Fix: "Many churches find that gifts are recognised in service, by other people, over time; the same
chapters also tell readers to 'earnestly desire spiritual gifts' (1 Corinthians 14:1), and say the
Spirit gives 'to each one separately as he desires' (12:11). So a low row here is not a ceiling."

### G7. MINOR: "It gives no test for them" is looser than the text
Target: `giftsFrame.intro`, `introShort`, `description`.
Problem: Scripture gives no test for finding which gift is yours, but it does give tests for gifts
in use: "Let two or three of the prophets speak, and let the others discern" (1 Corinthians 14:29);
"Don't despise prophecies. Test all things" (1 Thessalonians 5:20-21).
Fix: "It gives no test for finding which are yours."

### G8. MINOR: the faith page cites Acts 6:5 and skips Acts 6:8
Target: faith, recorded act "Acts 6:5 ... Stephen as a man full of faith and of the Holy Spirit."
Problem: 6:5 is a description, not an act. Three verses on, the text joins the word to an act:
"Stephen, full of faith and power, performed great wonders and signs amongst the people." 1
Corinthians 13:2 on disk also defines the gift's reach: "all faith, so as to remove mountains".
Fix: cite Acts 6:5-8 and say what 6:8 says; add 1 Corinthians 13:2 to the summary so "a habit of
going ahead before the outcome is secured" is not the only picture of it on the page.

### G9. MINOR: discernment lost its clearest act and nothing replaced it
Target: discernment acts (editor's note: Acts 16:16-18 cut because Paul was "greatly annoyed").
Problem: the cut is fair, but Acts 13:9-10 does what that passage did not: "Saul ... filled with
the Holy Spirit, fastened his eyes on him and said, 'You son of the devil, full of all deceit'".
Fix: add Acts 13:8-10 with a neutral sentence.

### Do the statements assume a quiet, programme-driven church?
Mostly no: almost none mention church, which is a strength. Two points only.
- Statements 7, 34 and 38 (plans "sent round", "a form needs filling in", "people send me the
  details") picture an office-literate congregation. Minor; they are administration and serving
  items, and statement 34 was written for a good reason. No rewrite asked.
- Nothing in thirty-nine statements happens in a gathering or in prayer with another person. For
  a storefront church where the gifts are seen mainly in the service and at the altar, the
  instrument looks at the wrong days of the week. This is the same finding as G1, not a new one.

## How I would want the five included, if the owner decides to

1. **By the reader's choice, with no default**, exactly as Sounds Like Scripture handles canon:
   one screen before statement 1. "Christians disagree about whether prophecy, healings, miracles
   and languages are given today. Include them?" Yes adds a round; No leaves the thirteen. The site
   takes no side and neither reader is told their list is the odd one.
2. **Score only what behaviour and other people's reports can see.** Prophecy and healings can be
   asked about by the blueprint's six rules. Drafts, all under 22 words, none counting how much
   anyone prays:
   - Prophecy +1 (20): "People have told me that something I felt I had to say to them came at exactly the right time."
   - Prophecy +1 (18): "When I pray with somebody, I say what comes to me for them, even if it seems odd."
   - Prophecy -1 (15): "If a thought about somebody comes to me while praying, I keep it to myself."
   - Healings +1 (16): "When somebody tells me they are ill, I offer to pray with them there and then."
   - Healings +1 (12): "People who are ill ask me, in particular, to pray for them."
   - Healings -1 (18): "When somebody is ill, I say I will pray for them and do it later, on my own."
   Define prophecy on its page by 1 Corinthians 14:3 on disk: "he who prophesies speaks to men for
   their edification, exhortation, and consolation", which is how Pentecostals themselves define it.
3. **Do not score languages, interpretation or miracles.** Whether someone prays in a language they
   never learnt is a fact, not a pattern; three agree/disagree items on it would be silly, and
   nobody should self-score "workings of miracles". Give them, and the word of knowledge, gift
   pages like the others (passage verbatim, recorded acts: Acts 2:4; 10:44-46; 19:6; 11:27-28;
   13:1-2; 21:9-11; 3:6-8; 9:40; 28:8-9; and for interpretation say plainly that Acts records no
   instance and quote 1 Corinthians 14:27-28), and a result panel headed "Gifts these statements
   cannot see" that prints whichever way the reader chose.
4. Never word them as "sign gifts", "charismatic gifts" or "the supernatural gifts": the first two
   are other people's labels, and the third implies teaching and mercy are natural.

## Who in the Bible are you most like?

### F1. MAJOR: Peter, plan, Acts 3:6 quotes half of Peter's sentence and stops before the healing
Target: Peter, plan, right: "He told the man at the gate he had no silver or gold."
Problem: the verse is "I have no silver or gold, but what I have, that I give you. In the name of
Jesus Christ of Nazareth, get up and walk!" Using a healing as evidence that a man came out without
money, and ending the sentence before the healing, reads as editing the miracle out. It is the
figure-quiz cousin of G3.
Fix: "He told the lame man he had no silver or gold, gave what he had, and told him in Jesus's
name to get up and walk." Or drop it: Matthew 17:24-27 and John 21:3 already carry the coordinate.

### F2. MAJOR: Elijah, pace, 1 Kings 17:1 does not show pace, and the text contradicts the reading
Target: Elijah, pace, left: "He told Ahab there would be no dew or rain these years except by his word."
Problem: the verse shows a man speaking, which is the voice axis; nothing in it shows whether he
weighed it first. The axis is defined as "moves on instinct", and Elijah's own account in 1 Kings
18:36 is "I have done all these things at your word". Filing a prophet's delivered word under
instinct is an inference from outside the text, and to a Pentecostal it is a belittling one.
Fix: remove 17:1 from pace; leave 19:3 (he "arose and ran for his life"), and let the value move
toward the middle if one act cannot hold 20.

### F3. MINOR: Deborah, pace (Judges 4:6) and doubt (Judges 4:14) treat prophecy as temperament
Target: "She sent and called Barak and told him what he was commanded to do" (acts first); "She
named the day as the day of victory before the battle was fought" (takes it on trust).
Problem: 4:6 on disk is "Hasn't the LORD, the God of Israel, commanded ...": she is relaying a
command, which shows neither haste nor deliberation. 4:14 is a prophetess declaring what "the LORD
has delivered"; the text presents knowledge, not going ahead without a reason.
Fix: mark pace "The text does not show this" (value 50; she is at 40 already). Keep 4:14 but say
what the verse says: "She told Barak the LORD had delivered Sisera into his hand that day, before
the battle was fought."

### F4. MINOR: Paul, doubt, 2 Corinthians 12:8 is a petition, not a question
Target: Paul, doubt, left (asks why): "He begged the Lord three times that the thing might depart from him."
Problem: the verse on disk is "I begged the Lord three times that it might depart from me". He asks
for removal, not for a reason. It does not show the "asks why" pole.
Fix: replace with an act of asking or testing, or drop it and let Acts 21:12-14 stand alone.

### F5. MINOR: Daniel's one-line description credits him with what he disclaims
Target: Daniel, `who`: "reader of the king's dreams".
Problem: Daniel 2:30 on disk: "this secret is not revealed to me for any wisdom that I have". "Reader"
makes a skill of what the text calls a revelation.
Fix: "exile of Judah, trained for the Babylonian court, to whom the king's dreams were made known".

Nothing else in the figure quiz drew a finding from this lens. Jesus's evidence keeps "gave them
authority over unclean spirits" (Mark 6:7) and the leper's healing intact, which is right; Mary
Magdalene's line uses Luke 8:2's own identification.
