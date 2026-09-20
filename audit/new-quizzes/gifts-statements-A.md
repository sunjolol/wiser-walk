# Draft A — "What are your spiritual gifts?" statements

**Angle: what the reader actually does with their week.** Every candidate below describes an
ordinary week — the jobs that get done, the conversations that happen, where the money goes, whose
house people end up in. Nothing asks what the reader believes about themselves, nothing asks how
much they pray, read, give to church or attend, and nothing borrows a scene from Scripture.
(QUIZ-BLUEPRINTS.md, statement rules 1–6.)

Thirteen gift categories, five candidates each (**at least two keyed `-1`**), so the editor can cut
to the blueprint's three-per-gift with both directions present. **65 candidates.**

## Before the list: four things the editor needs from me

**1. The sign convention.** Checked in `site/src/lib/strategies/category.ts` and
`site/src/lib/quizzes/seven-deadly-sins.ts`: the category strategy accumulates `direction * answer`
per group and maps the total onto 0..100, so **agreement with a `+1` item raises that gift's score
and agreement with a `-1` item lowers it**. `pull()` reports `leaned away` below 50 — which is why
the reverse items matter: they are the only way a reader who genuinely does not work this way can
land below the line instead of merely failing to rise.

**2. Rule 5 cannot be fully satisfied by thirteen unipolar categories, and pretending otherwise
would be worse than saying so.** With bipolar axes a reader cannot tell which pole an item feeds;
with thirteen named gifts, an item about stacking chairs is visibly about serving. What I can do,
and have done, is (a) never use the category's own name or its passage's vocabulary in the
statement, (b) write every item as a behaviour that two or three categories could plausibly claim,
and (c) flag the items below that are still transparent. **The transparent ones are marked
`⚠ reads as its own gift`** — the critics should decide whether they survive.

**3. The `giving` category rubs against rule 6.** Rule 6 forbids counting devotion, and "how much
do you give" is the classic devotion metric. Every `giving` candidate below is therefore about a
*pattern of money and possessions between people* — who moves first when someone is short, whether
spare capacity is already committed — and none asks about tithing, church giving or amount. If the
critics still read piety in them, cut the category rather than soften the rule.

**4. Overlap is real and the editor must plan for it.** `encouraging` / `shepherding` / `mercy` all
touch "you stay with people"; `serving` / `hospitality` both touch "you do the practical thing";
`wisdom` / `discernment` both touch "you see what is going on". Where I could separate them I did:
mercy is *presence with no fix*, encouragement is *a push toward action*, shepherding is *the same
people over years*. Items that still straddle two categories are marked **`⚠ straddles <key>`**.

*(Note for the workflow: the owner's instruction about including Jesus governs the figure quiz's
roster in QUIZ-BLUEPRINTS.md. It does not bear on this file, which has no outcome roster — a gifts
result names a gift, never a person.)*

---

## 1. Serving — key `serving`

Serving (Romans 12:7) and helps (1 Corinthians 12:28) are one category, as the blueprint directs.

**The passages (World English Bible British Edition, on disk):**

> Romans 12:7 — “or service, let’s give ourselves to service; or he who teaches, to his teaching;”

> 1 Corinthians 12:28 — "God has set some in the assembly: first apostles, second prophets, third
> teachers, then miracle workers, then gifts of healings, helps, governments, and various kinds of
> languages."

**Cited acts:**

- **Acts 6:1–6** — When the Hellenists' widows were being missed in the daily distribution, seven
  men were chosen and appointed over that business while the twelve kept to prayer and the word.
- **Romans 16:1–2** — Paul commends Phoebe, a servant of the assembly at Cenchreae, and asks the
  Romans to assist her because she has been a helper of many, himself included.

**Candidates:**

- **G-SRV-1** `serving` `+1` — 13 words
  "When something practical needs doing, I have usually started before anyone assigns it."
  *Either way:* starting unasked clears the job, but people who wait are often leaving room for
  whoever the work actually belongs to.
- **G-SRV-2** `serving` `+1` — 15 words ⚠ reads as its own gift
  "I would rather stack chairs for an hour than sit through the meeting about them."
  *Either way:* someone has to move the chairs and someone has to decide where they go; preferring
  the second is not laziness.
- **G-SRV-3** `serving` `+1` — 17 words
  "My week usually has two or three small jobs in it that I do for other people."
  *Either way:* a week with slack in it for other people is one kind of life; a week fully spent on
  your own responsibilities is another, and both are defensible.
- **G-SRV-4** `serving` `-1` — 15 words
  "I tend to leave the practical jobs to whoever is better at them than me."
  *Either way:* deferring to competence is sensible and respectful; doing it anyway is how people
  learn and how gaps get covered.
- **G-SRV-5** `serving` `-1` — 14 words
  "If a task is not mine, I finish my own work and go home."
  *Either way:* clean boundaries keep a person sustainable for years; porous ones get more done this
  month.

---

## 2. Teaching — key `teaching`

**The passages (WEBBE, on disk):**

> Romans 12:7 — “or service, let’s give ourselves to service; or he who teaches, to his teaching;”

> Ephesians 4:11 — "He gave some to be apostles; and some, prophets; and some, evangelists; and
> some, shepherds and teachers;"

**Cited acts:**

- **Acts 18:24–26** — Apollos was already teaching accurately about Jesus but knew only John's
  baptism; Priscilla and Aquila took him aside and explained the way of God to him more accurately.
- **Acts 11:25–26** — Barnabas went to Tarsus for Saul and brought him to Antioch, where the two
  met with the assembly for a whole year and taught many people.

**Candidates:**

- **G-TCH-1** `teaching` `+1` — 16 words
  "People come back to me to have something explained again, after someone else has already tried."
  *Either way:* being the second explainer takes patience; not being asked usually means your
  colleagues got it right the first time.
- **G-TCH-2** `teaching` `+1` — 18 words
  "When I learn something useful, I spend part of the week working out how to pass it on."
  *Either way:* passing it on multiplies it, but time spent repackaging is time not spent going
  deeper yourself.
- **G-TCH-3** `teaching` `+1` — 13 words ⚠ reads as its own gift
  "I break a subject into steps almost automatically, even in a casual conversation."
  *Either way:* steps make a thing learnable; they also flatten a conversation that was meant to be
  a conversation.
- **G-TCH-4** `teaching` `-1` — 15 words
  "I would rather send someone a link than sit down and walk them through it."
  *Either way:* the link is often better than you are, and respects their time; sitting down catches
  what the link cannot.
- **G-TCH-5** `teaching` `-1` — 15 words
  "I assume most people would rather work something out themselves than have me explain it."
  *Either way:* that assumption protects people's autonomy; it also leaves some of them stuck and
  too embarrassed to ask.

---

## 3. Encouraging — key `encouraging`

**The passage (WEBBE, on disk):**

> Romans 12:8 — "or he who exhorts, to his exhorting; he who gives, let him do it with generosity;
> he who rules, with diligence; he who shows mercy, with cheerfulness."

**Cited acts:**

- **Acts 4:36–37** — The apostles gave Joses of Cyprus the name Barnabas, which Luke translates
  "Son of Encouragement"; he sold a field and laid the money at their feet.
- **Acts 15:30–32** — Sent to Antioch with the letter from Jerusalem, Judas and Silas encouraged the
  brothers with many words and strengthened them.

**Candidates:**

- **G-ENC-1** `encouraging` `+1` — 16 words
  "I notice when someone is about to give up, and I say something before they do."
  *Either way:* speaking up can be the thing that keeps a person going; it can also override a
  decision to stop that was correct.
- **G-ENC-2** `encouraging` `+1` — 13 words
  "People tell me a conversation with me left them willing to try again."
  *Either way:* this is a real effect some people have; others are valued precisely because they
  never pump anyone up.
- **G-ENC-3** `encouraging` `+1` — 15 words ⚠ straddles `shepherding`
  "I will push a friend to do the hard thing, not just sympathise with them."
  *Either way:* a push is what some people need; sympathy without a push is what others need, and
  guessing wrong costs either way.
- **G-ENC-4** `encouraging` `-1` — 15 words
  "I assume people know where they stand with me without my having to say it."
  *Either way:* steady presence speaks for itself; unsaid regard is also regard nobody heard.
- **G-ENC-5** `encouraging` `-1` — 14 words
  "I would rather leave someone alone with a decision than weigh in on it."
  *Either way:* restraint keeps the decision theirs; weighing in is what friends are for.

---

## 4. Giving — key `giving`

**The passage (WEBBE, on disk):**

> Romans 12:8 — "or he who exhorts, to his exhorting; he who gives, let him do it with generosity;
> he who rules, with diligence; he who shows mercy, with cheerfulness."

**Cited acts:**

- **Acts 4:34–35** — Owners of lands and houses sold them and laid the proceeds at the apostles'
  feet, and distribution was made to each according to need, so that nobody among them lacked.
- **2 Corinthians 8:1–5** — Paul reports that the Macedonian assemblies, in deep poverty, gave of
  their own accord beyond their power and begged to share in the collection for the saints.

**Candidates:**

- **G-GIV-1** `giving` `+1` — 16 words
  "When I hear someone is short this month, I move money before I think it through."
  *Either way:* moving first meets the need while it is a need; thinking first is how you stay able
  to help the next person.
- **G-GIV-2** `giving` `+1` — 14 words
  "A chunk of what I earn is already spoken for by other people's needs."
  *Either way:* committed capacity is a genuine pattern; so is keeping your own house stable before
  anyone depends on you.
- **G-GIV-3** `giving` `+1` — 14 words
  "I would rather spend on somebody else's need than upgrade something of my own."
  *Either way:* both are ordinary uses of money, and a person who maintains their own things well is
  not thereby selfish.
- **G-GIV-4** `giving` `-1` — 14 words
  "I plan my own finances first and treat anything left over as the limit."
  *Either way:* planning to a limit is prudence and keeps promises keepable; refusing a limit is how
  some needs get met at all.
- **G-GIV-5** `giving` `-1` — 14 words
  "I am cautious with money, and I would rather help with time than cash."
  *Either way:* time is the scarcer gift for many people; cash is the one that actually pays a bill.

---

## 5. Leading — key `leading`

**The passage (WEBBE, on disk):**

> Romans 12:8 — "or he who exhorts, to his exhorting; he who gives, let him do it with generosity;
> he who rules, with diligence; he who shows mercy, with cheerfulness."

**Cited acts:**

- **Acts 15:13–21** — At Jerusalem, after the others had spoken, James stated his judgement on what
  should be required of the Gentiles, and the assembly sent that decision out in a letter.
- **Acts 6:2–4** — Faced with the neglected widows, the twelve set out how the work should be
  divided rather than taking it all on themselves.

**Candidates:**

- **G-LED-1** `leading` `+1` — 17 words
  "When a group has stalled, I am usually the one who says what we are doing next."
  *Either way:* someone naming the next step unsticks a room; it also ends a discussion that had not
  finished.
- **G-LED-2** `leading` `+1` — 16 words
  "People end up following my plan for the day even when it was not my meeting."
  *Either way:* this happens to some people without their seeking it; not having it happen often
  means you are good at deferring.
- **G-LED-3** `leading` `+1` — 16 words
  "I take responsibility for how a thing turns out, including the parts I did not do."
  *Either way:* carrying the whole outcome is what running something means; carrying only your own
  part is honest about what you controlled.
- **G-LED-4** `leading` `-1` — 10 words
  "I would rather be given the plan than make it."
  *Either way:* a person who executes well is worth more than a person who plans badly.
- **G-LED-5** `leading` `-1` — 14 words
  "When a group is deciding, I wait to hear where most people are heading."
  *Either way:* waiting surfaces what the room actually wants; going first saves the room an hour.

---

## 6. Showing mercy — key `mercy`

**The passage (WEBBE, on disk):**

> Romans 12:8 — "or he who exhorts, to his exhorting; he who gives, let him do it with generosity;
> he who rules, with diligence; he who shows mercy, with cheerfulness."

**Cited acts:**

- **Acts 9:36–39** — Tabitha of Joppa, whom Luke describes as full of good works and acts of mercy,
  had made tunics and other garments for the widows, who showed them to Peter after she died.
- **2 Timothy 1:16–18** — Paul writes that Onesiphorus often refreshed him, was not ashamed of his
  chain, and searched Rome diligently until he found him.

**Candidates:**

- **G-MCY-1** `mercy` `+1` — 14 words
  "I stay with people in the worst part, when there is nothing to fix."
  *Either way:* staying is what some people need most; leaving them room, or going to find help, is
  also a real answer.
- **G-MCY-2** `mercy` `+1` — 15 words
  "I find it easy to be around illness, grief, or a mess someone made themselves."
  *Either way:* ease here is uncommon and useful; finding it hard is the ordinary human response,
  not a defect.
- **G-MCY-3** `mercy` `+1` — 13 words ⚠ straddles `shepherding`
  "I keep in touch with the person everyone else has quietly stopped calling."
  *Either way:* someone should; it can also be attention the person did not ask for and does not
  want.
- **G-MCY-4** `mercy` `-1` — 13 words
  "I am better at solving someone's problem than sitting with them in it."
  *Either way:* solving is help, and the person may want the problem gone more than the company.
- **G-MCY-5** `mercy` `-1` — 15 words
  "When someone is upset I tend to give them space rather than go to them."
  *Either way:* space is a kindness to people who need it; going to them is a kindness to people who
  will not ask.

---

## 7. Administration — key `administration`

**The passage (WEBBE, on disk):**

> 1 Corinthians 12:28 — "God has set some in the assembly: first apostles, second prophets, third
> teachers, then miracle workers, then gifts of healings, helps, governments, and various kinds of
> languages."

**Cited acts:**

- **Titus 1:5** — Paul left Titus in Crete to set in order the things that were lacking and to
  appoint elders in every city, as Paul had directed.
- **2 Corinthians 8:18–21** — A brother appointed by the assemblies travelled with the collection so
  that no one could blame Paul's company over the money, and the handling would be seen as
  honourable by people as well as by God.

**Candidates:**

- **G-ADM-1** `administration` `+1` — 15 words ⚠ reads as its own gift
  "I am the one who makes the list, the dates, and who is doing what."
  *Either way:* structure is how a group of volunteers survives; it can also be structure nobody
  asked for on a thing that would have worked anyway.
- **G-ADM-2** `administration` `+1` — 14 words
  "A plan with no owner for each step bothers me until I fix it."
  *Either way:* unowned steps are where things fail; insisting on owners too early can freeze
  something that was still forming.
- **G-ADM-3** `administration` `+1` — 14 words
  "People send me the details because they know I will keep track of them."
  *Either way:* being the reliable memory of a group is a service; not being it means nobody has
  made you the bottleneck.
- **G-ADM-4** `administration` `-1` — 14 words
  "I keep most of my week in my head and it usually works out."
  *Either way:* a light system fits a life that fits in a head; a written one fits a life that does
  not.
- **G-ADM-5** `administration` `-1` — 11 words
  "Spreadsheets, rotas and schedules drain me faster than the work itself."
  *Either way:* plenty of capable people are drained by admin; plenty of others are steadied by it.

---

## 8. Wisdom — key `wisdom`

**The passage (WEBBE, on disk):**

> 1 Corinthians 12:8 — "For to one is given through the Spirit the word of wisdom, and to another
> the word of knowledge according to the same Spirit,"

**Cited acts:**

- **Acts 6:9–10** — Men from several synagogues disputed with Stephen and were not able to withstand
  the wisdom and the Spirit by which he spoke.
- **Acts 27:9–11** — Before the voyage from Fair Havens, Paul told the ship's company he perceived
  it would end in loss; the centurion followed the master and the owner instead.

**Candidates:**

- **G-WIS-1** `wisdom` `+1` — 13 words
  "People bring me a tangled situation and ask what they should actually do."
  *Either way:* being asked is a pattern worth reporting; not being asked often means people bring
  you other things instead.
- **G-WIS-2** `wisdom` `+1` — 14 words
  "I can usually name the real question when everyone is arguing about something else."
  *Either way:* naming it can end an argument early; it can also cut off an argument people needed
  to have.
- **G-WIS-3** `wisdom` `+1` — 14 words
  "I hold back an opinion until I can say the one thing that helps."
  *Either way:* restraint makes what you say count; saying more, sooner, gives people something to
  work with now.
- **G-WIS-4** `wisdom` `-1` — 13 words
  "My first advice is usually the obvious one, and I say it quickly."
  *Either way:* the obvious answer is often correct and arrives when it is useful.
- **G-WIS-5** `wisdom` `-1` — 13 words
  "I send people to someone else when they want advice about their life."
  *Either way:* knowing your limits protects people; handling it yourself is what being available
  means.

---

## 9. Discernment — key `discernment`

**The passage (WEBBE, on disk):**

> 1 Corinthians 12:10 — "and to another workings of miracles, and to another prophecy, and to
> another discerning of spirits, to another different kinds of languages, and to another the
> interpretation of languages."

**Cited acts:**

- **Acts 16:16–18** — A slave girl with a spirit of divination followed Paul's party for days
  calling them servants of the Most High God; Paul turned and commanded the spirit out of her.
- **Acts 8:20–23** — When Simon offered money for the gift of God, Peter told him his heart was not
  right and said what he saw in him.

**Candidates:**

- **G-DSC-1** `discernment` `+1` — 16 words
  "I can tell early when something is off about a person, before I can say why."
  *Either way:* early warnings are sometimes right; they are also how good people get written off on
  no evidence.
- **G-DSC-2** `discernment` `+1` — 14 words
  "I notice the difference between what someone is saying and what they actually want."
  *Either way:* hearing the real request helps; assuming there is always a second layer is its own
  kind of error.
- **G-DSC-3** `discernment` `+1` — 15 words
  "I am the one who asks what is really behind a decision everyone else accepted."
  *Either way:* the question can save a group from a bad call, or make it impossible to settle
  anything.
- **G-DSC-4** `discernment` `-1` — 15 words
  "I take people at their word and am sometimes the last to see a problem."
  *Either way:* trust at face value is how people are treated as adults; suspicion catches things
  earlier and costs something every time.
- **G-DSC-5** `discernment` `-1` — 13 words
  "I would rather assume the best than test what is going on underneath."
  *Either way:* assuming the best is a settled way to live; testing is how harm gets stopped sooner.

---

## 10. Faith — key `faith`

**The passage (WEBBE, on disk):**

> 1 Corinthians 12:9 — "to another faith by the same Spirit, and to another gifts of healings by the
> same Spirit,"

**Cited acts:**

- **Acts 27:21–25** — In the storm, with the crew long without food, Paul stood up and told them to
  take heart, saying he believed God that it would be as he had been told.
- **Acts 14:8–10** — At Lystra, Paul fastened his eyes on a man crippled from birth, saw that he had
  faith to be made whole, and told him to stand upright.

**Candidates:**

- **G-FTH-1** `faith` `+1` — 13 words
  "I commit to things before the money or the people are in place."
  *Either way:* some things only start that way; other people keep their promises precisely because
  they do not.
- **G-FTH-2** `faith` `+1` — 15 words
  "I am usually the calm one when a plan looks like it is falling apart."
  *Either way:* calm steadies a group; alarm is what gets a failing plan changed in time.
- **G-FTH-3** `faith` `+1` — 14 words
  "I keep going after a setback long after other people have written it off."
  *Either way:* persistence finishes things nobody thought possible, and also sinks years into
  things that were finished.
- **G-FTH-4** `faith` `-1` — 11 words
  "I want the arrangements settled before I say yes to anything."
  *Either way:* settling arrangements is how a yes becomes reliable; waiting for them means missing
  some things entirely.
- **G-FTH-5** `faith` `-1` — 14 words
  "When the odds look bad, I am the one naming what could go wrong."
  *Either way:* someone has to say it, and someone has to keep the room from talking itself out of
  trying.

---

## 11. Evangelism — key `evangelism`

**The passage (WEBBE, on disk):**

> Ephesians 4:11 — "He gave some to be apostles; and some, prophets; and some, evangelists; and
> some, shepherds and teachers;"

**Cited acts:**

- **Acts 8:5–8** — Philip went down to the city of Samaria and proclaimed the Christ to them, and
  there was great joy in that city.
- **Acts 8:26–35** — Sent toward Gaza, Philip ran to the Ethiopian official's chariot, asked whether
  he understood what he was reading, and beginning from that Scripture told him about Jesus. Luke
  later calls him Philip the evangelist (**Acts 21:8**).

**Candidates:**

- **G-EVG-1** `evangelism` `+1` — 12 words ⚠ reads as its own gift
  "I bring up what I believe with people who did not ask."
  *Either way:* saying it is the only way some people ever hear it; not saying it respects a
  conversation nobody opened.
- **G-EVG-2** `evangelism` `+1` — 10 words
  "Strangers end up in real conversations with me within minutes."
  *Either way:* fast openness reaches people; slower people earn a different kind of trust.
- **G-EVG-3** `evangelism` `+1` — 15 words
  "I keep in contact with people outside my usual circle, not only my own crowd."
  *Either way:* a wide circle meets more people; a narrow one knows them better.
- **G-EVG-4** `evangelism` `-1` — 12 words
  "I keep my beliefs to myself unless somebody raises the subject first."
  *Either way:* waiting to be asked keeps the relationship honest; speaking first is how some
  subjects ever come up.
- **G-EVG-5** `evangelism` `-1` — 14 words
  "I would rather people see how I live than hear me talk about it."
  *Either way:* a life is the stronger argument, and a life alone never explains itself.

---

## 12. Shepherding — key `shepherding`

**The passage (WEBBE, on disk):**

> Ephesians 4:11 — "He gave some to be apostles; and some, prophets; and some, evangelists; and
> some, shepherds and teachers;"

**Cited acts:**

- **Acts 20:28–31** — Paul told the Ephesian elders to take heed to themselves and to the flock, and
  reminded them that for three years he had not ceased to admonish everyone night and day.
- **1 Peter 5:1–3** — Peter tells the elders among his readers to shepherd the flock willingly
  rather than under compulsion, not lording it over them but as examples.

**Candidates:**

- **G-SHP-1** `shepherding` `+1` — 14 words
  "I stay responsible for the same few people over years, not just this season."
  *Either way:* long responsibility is rare and costly; letting people go when a season ends is
  healthy too.
- **G-SHP-2** `shepherding` `+1` — 14 words ⚠ straddles `mercy`
  "I notice when someone has drifted out of a group, and I follow up."
  *Either way:* the follow-up brings people back; it can also chase someone who left on purpose.
- **G-SHP-3** `shepherding` `+1` — 14 words
  "I would rather see one person through a hard year than start something new."
  *Either way:* depth with one person and breadth across many are both real ways to spend a year.
- **G-SHP-4** `shepherding` `-1` — 14 words
  "I am better with a crowd than with the same few people every week."
  *Either way:* a crowd needs someone who is good with crowds, and the few need someone who stays.
- **G-SHP-5** `shepherding` `-1` — 13 words
  "I let people find their own way rather than keep checking on them."
  *Either way:* not checking treats people as adults; checking catches the ones who were sinking
  quietly.

---

## 13. Hospitality — key `hospitality`

**The passage (WEBBE, on disk):**

> 1 Peter 4:9–10 — "Be hospitable to one another without grumbling. As each has received a gift,
> employ it in serving one another, as good managers of the grace of God in its various forms."

**Cited acts:**

- **Acts 16:14–15** — After Lydia and her household were baptised at Philippi, she urged Paul's
  party to come and stay at her house, and persuaded them.
- **Romans 16:23** — Paul sends greetings from Gaius, whom he calls his host and host of the whole
  assembly. (Compare **Acts 18:2–3**, where Paul lived and worked with Aquila and Priscilla, who
  shared his trade.)

**Candidates:**

- **G-HSP-1** `hospitality` `+1` — 9 words ⚠ reads as its own gift
  "My home gets used by other people most weeks."
  *Either way:* an open house is a real pattern; a home kept for the household is not a failure of
  one.
- **G-HSP-2** `hospitality` `+1` — 14 words
  "I will offer someone a bed or a meal before I have tidied up."
  *Either way:* the offer matters more than the state of the kitchen to some people, and not to
  others.
- **G-HSP-3** `hospitality` `+1` — 15 words
  "When plans are being made, I am the one who says come to my place."
  *Either way:* volunteering the venue saves everyone a decision; keeping it neutral saves you the
  week.
- **G-HSP-4** `hospitality` `-1` — 14 words
  "My home is where I recover, and I guard it from being a venue."
  *Either way:* a home that restores you keeps you usable to people; a home that opens gives them
  somewhere to be.
- **G-HSP-5** `hospitality` `-1` — 10 words
  "I would rather meet people out than have them in."
  *Either way:* meeting out is easier on everyone's week; meeting in is the closer welcome.

---

## Counts and what I could not resolve

- **65 candidates: five per gift, thirteen gifts.** Every gift has three `+1` and two `-1`, so the
  blueprint's three-per-gift cut can always keep at least one of each direction.
- **Longest statement: 18 words** (G-TCH-2); shortest: 9 (G-HSP-1). Every candidate is under 22 and
  makes one claim. Word counts above are machine-checked against the text on the line beneath each
  label, counting hyphenated compounds as one word.
- **Eight items are flagged.** Five read as their own gift (G-SRV-2, G-TCH-3, G-ADM-1, G-EVG-1,
  G-HSP-1); three straddle a neighbouring category (G-ENC-3, G-MCY-3, G-SHP-2). Rule 5 is the one
  rule this draft cannot fully meet; see note 2 at the top.
- **Every passage quoted above was checked character-for-character** against `src: "webbe"` in
  `demos/sounds-like-scripture/work/verses-all.json`, and every cited act was read on disk before
  its sentence was written. Nothing here is quoted from memory.
- **Not in this draft, by the blueprint's instruction:** prophecy, healing, miracles, tongues and
  their interpretation. Nothing above implies they are lesser or have ceased, and the intro copy
  must say so in the owner's own decision's words.
- **Open for the editor:** whether `giving` survives rule 6 at all (note 3), and whether `wisdom`
  and `discernment` are distinct enough in the statements to be separate categories — they are
  clearly distinct in the passages, less so in an ordinary week.
