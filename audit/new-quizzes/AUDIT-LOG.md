# Audit log: the two draft quizzes (closed 2026-09-20)

Five reviews, 106 findings. Every blocker and major finding was checked by opening the verse in the
World English Bible British Edition on disk and rereading the statement, through three lenses: is it
accurate, is it a real fairness problem, is the change necessary. The reviews were written before
the figure quiz was calibrated, so each finding was checked against the CURRENT files.

**Both quizzes stay `draft`.** `npm run build` (which runs the engine tests) completes,
`node audit/selftest.js` passes, and the calibration holds (numbers at the end).

## Decisions only the owner can make

**1. The spiritual gifts quiz: prophecy, healing, miracles, tongues and interpretation, and the
three gifts kept from the same sentence.** The cessationist and the Pentecostal reviewer, from
opposite ends, raised the same objection (one as a blocker): 1 Corinthians 12:8-10 is one list of
nine. The draft keeps three of them (word of wisdom, faith, discerning of spirits) as everyday
traits and leaves the rest out "because a self-report cannot measure them", a reason that applies
just as well to the three it kept. So the line between in and out is itself a side.
- (a) *Both reviewers' first option.* Leave wisdom, discernment and faith out too. Ten gifts remain
  (Romans 12; "helps" and "governments"; Ephesians 4:11; 1 Peter 4), and the title changes to say
  what it then is.
- (b) *The Pentecostal reviewer.* Bring the rest in by the reader's choice, with no default, the way
  Sounds Like Scripture handles canon: one screen before statement 1. Prophecy and healings scored
  (he drafted six statements); tongues, interpretation, miracles and the word of knowledge never
  scored, each given a page and a result panel headed "Gifts these statements cannot see". Never
  call them "sign gifts", "charismatic gifts" or "the supernatural gifts".
- (c) *The cessationist's fallback, and the psychometrician's G4.* Keep the three, but rename them
  on every surface to what is measured ("being asked for advice", "weighing people and ideas",
  "staying sure") and take the 1 Corinthians verses out of the headline position.
- **Recommendation: (a) for launch; (b) later as its own piece with its own audit.** (a) is the only
  option both ends proposed. (b) is the more generous answer, but his draft statements are about
  praying with people, which needs your ruling against blueprint rule 6 first.
- Until you decide, the draft note tells every reader that this is open, in both halves.

**2. The figure quiz: how many axes a figure must be placed on. Now three; the calibration set
four.** Three reviewers from three traditions (two as a blocker) found that Jesus cannot honestly
be placed on the Reasons axis: he was at 70, "slow to question", matched to readers who agree with
"I go along with things without checking them first", and the Gospels say he knew what was coming
(John 18:4; 13:1-3; Matthew 26:54). Taking him off it leaves him placed on three axes. The same
reading of the text leaves Mary the mother of Jesus and Deborah on three.
- (a) *Applied.* The floor is three. Measured: no figure is closest for more than 7.9% of sheets,
  ties are 8.1%, Jesus is 1.6%.
- (b) Put the floor back to four and keep Jesus at 70 on Reasons, against all three reviewers.
- (c) Put the floor back to four and lose Jesus, Mary and Deborah as possible results, which your
  own decision about Jesus and the blueprint's nine women both rule out.
- **Recommendation: keep (a).** One line to revert: `minShownAxes` in `bible-figure.ts`.

**3. Mary the mother of Jesus on Lead.** The evidence reviewer wanted "both ends" (she gives the
servants an order at Cana). Kept placed, at 60 rather than 65: what she orders them to do is obey
somebody else, which is the pole's own definition. If you prefer the reviewer's reading she is
placed on two axes and cannot be a result under any floor. **Recommendation: keep.**

**4. Discernment, statement 35** ("I decide something is off about a person before I could say what
it is"). The cessationist and the psychometrician want it replaced with a checking statement (it
rewards a hunch, and a prejudiced reader agrees strongly). But a hunch nobody told you is what the
Pentecostal reviewer means by this gift, and he objected to the quiz turning it into an everyday
skill. One statement cannot serve both models. Left as it was. **Recommendation: settle it with
decision 1; under (a) it disappears.**

**5. Judith, Tobit and the books Catholic and Orthodox Bibles also contain.** The draft note now
says the roster comes only from the books all Christians share and that this is a limit, not a
judgement. The Catholic and Orthodox reviewer would rather Judith and Tobit were added before
launch; the text is on disk. **Recommendation: after you have played it, as a small roster pass.**

**6. Eight gifts have a "people come to me" statement and five have none** (psychometric G7). A
newcomer or a housebound reader is capped on eight gifts and steered to the other five. Fixing it
means five new statements that no critic has read. **Recommendation: one statement pass after you
have played it, not before.**

### For the engineer (found valid, not applied: outside the data files)

- The share text and the share card must carry the outcome's `note` when there is one, so Jesus's
  sentence travels with his name (cessationist F8, Catholic F8). Add a test.
- Name nobody when all eighteen answers are identical (psychometric F1b, F13). Today a sheet of all
  "strongly agree" names Rahab, and all "strongly disagree" names Daniel and Mary jointly.
- Gifts: ties of three or more are cut to two by `localeCompare`, so spelling decides (psychometric
  G2). Name every gift inside the margin up to four; at five or more use the flat-state copy.
- Figure quiz: consider naming a band only from 25 down and 75 up, and showing the nearest five
  unordered when they fall inside the tie margin (psychometric F9). The honest sentence it asked
  for is applied in the scope note; the thresholds are the engine's and the Compass shares them.

## Counts

| | applied (whole or part) | moot after calibration | rejected | left for the owner or engineer | minor, left |
|---|---|---|---|---|---|
| Cessationist (21) | 17 | 1 | 1 | 1 | 1 |
| Pentecostal (14) | 13 | 0 | 0 | 1 | 0 |
| Catholic and Orthodox (16) | 14 | 1 | 0 | 0 | 1 |
| Psychometric (27) | 17 | 2 | 1 | 2 | 5 |
| Evidence (28) | 20 | 3 | 1 | 0 | 4 |
| **Total (106)** | **81** | **7** | **3** | **4** | **11** |

All 8 blockers are closed: 4 applied (cessationist F2, F3, F4; evidence B1), 3 moot after calibration
(cessationist F1, psychometric F1, evidence B2), 1 the owner's (Pentecostal G1, decision 1).

## The two questions the brief asked

**Jesus's Lead coordinate, 50 to 40: is the axis "shown" or "both"? Shown.** The pole on the right
is working beside the person who is leading and making them stronger. John 13 does not show that.
In the scene itself he says of "Teacher" and "Lord", "You say so correctly, for so I am" (13:13),
and calls the washing "an example, that you should also do as I have done" (13:15). It is the one
in front serving, and telling his followers to copy him. The Gospels record him calling men to come
after him (Mark 1:17), appointing twelve (3:13-14) and walking in front (10:32); they record no
occasion of him working under another leader's direction except coming to John to be baptised
(Matthew 3:13-15), one act. Sending the Twelve out with authority (Mark 6:7) does point right, and
stays. Forty is the mildest placed value, it is the figure the evidence reviewer himself proposed
(M12), and by the roster's own convention it is conservative: Moses has one act each way and sits
at 25. The foot-washing was NOT removed, as that reviewer asked; hiding the act every reader will
think of would be worse than showing it. Its reference is now John 13:4-15 and its sentence carries
the scene's own frame.

**Martha, closest for 1.1%: does the text support anything further? One act, no more.** John 11:28:
she "called Mary, her sister, secretly". It is now on her Voice axis, pointing toward Holds it, and
Voice moved from 10 to 15. Nothing was invented. She is at 1.6% now, mostly because the evidence
reviewer's M10 was right: Luke 10:40 was carrying five of her six axes, and "distracted with much
serving" shows neither haste nor planning. With it taken off Pace, Lead and Plans her coordinates
are milder and better founded. Unused and staying unused: her statements of belief (John 11:22,
24, 27) and "Martha served" (John 12:2).

## Statements reworded (every sign re-derived; none changed)

**Figure quiz**

| # | before | after | dir | why |
|---|---|---|---|---|
| 1 | I buy things while I still feel like it. | When I am offered something, I say yes or no there and then. | -1 | psychometric F6 |
| 2 | I am teased for sitting through a whole conversation without joining in. | I often sit through a whole conversation without joining in. | +1 | psychometric F2 |
| 9 | I have been told I take over a group without being asked to. | I start handing out jobs in a group before anyone has asked me to. | -1 | psychometric F2 |
| 11 | I go along with things without checking them first. | I follow instructions as given and leave the reasons for later. | +1 | psychometric F7, cessationist F4, evidence B1 |
| 16 | I step in to calm an argument before both sides have finished. | I step in to calm arguments that are not mine. | +1 | psychometric F5; editor's wording |
| 18 | I have been told I leave everything until the last possible minute. | I drop my plans when something new comes up. | +1 | psychometric F8 |

**Gifts quiz** (running-order numbers)

| # | gift | before | after | dir | why |
|---|---|---|---|---|---|
| 5 | leading | People look at me when a decision has to be made and nobody wants to make it. | When nobody will decide, I make the decision for the group. | +1 | psychometric G8 |
| 6 | mercy | When somebody is in pain I want to fix the cause rather than sit with it. | I keep my distance from people in distress until I know how to help. | -1 | psychometric G6 |
| 9 | discernment | I would rather assume the best of somebody than test whether they are being straight. | I take a new idea as it sounds rather than look into where it came from. | -1 | cessationist G5, psychometric G5 |
| 10 | faith | I commit to things before I can see how they will be paid for or finished. | I keep telling people a thing will come right after they have stopped expecting it. | +1 | cessationist G4, psychometric G4; editor's wording |
| 15 | faith | When the odds look bad, I am the one naming what could go wrong. | When the odds look bad, I am among the first to say we should stop. | -1 | cessationist G4, Pentecostal G5, psychometric G3 |
| 17 | administration | I keep most of my week in my head rather than written down. | When a group makes plans, I leave it to someone else to keep the list. | -1 | psychometric G9 |
| 19 | giving | Even when I have the money, I find it easier to give my time. | Even when I can afford it, I look for a way to help other than money. | -1 | psychometric G9 |
| 20 | discernment | Friends check a person or an offer with me before they commit to it. | Friends ask me whether someone can be trusted before they rely on them. | +1 | psychometric G8 |
| 21 | serving | I tend to leave the practical jobs to whoever is better at them than me. | When there is clearing up to do, I am usually still talking to someone. | -1 | psychometric G9 |
| 30 | wisdom | I would rather say what I would do than work out what suits them. | When a friend asks my advice, I tell them what I would do myself. | -1 | psychometric G9 |

## Every finding, by review

### Cessationist (`audit-cessationist.md`)

| id | severity | verdict | what was done, or why not |
|---|---|---|---|
| G1 | major | **owner** | Decision 1. Verified: 1 Corinthians 12:8-10 is one sentence. |
| G2 | major | applied | "That is not because they are lesser or have stopped" replaced with the reviewer's sentence, which a Pentecostal reader can also accept. The draft note was reworded to match. |
| G3 | major | applied | Prophets, the word of knowledge and apostles named, with 1 Corinthians 12:28 and Ephesians 4:11. Same finding as Pentecostal G2 and Catholic G5. |
| G4 | major | applied | Verified Luke 14:28 and Acts 27:10, 23-25. Statements 10 and 15 reworded, the summary rewritten, and the Acts 27 sentence now says an angel had told him. |
| G5 | major | applied in part | (b) statement 9 reworded, his wording. (a) statement 35: **owner**, decision 4. (c) dropping Acts 5:1-4 rejected: it is as much a connection the site made as every act under every gift; the sentence now says exactly what Peter said, and Acts 17:11 was added as he asked. |
| G6 | major | applied | One sentence on shepherding, merged with Catholic G3. Verified Acts 20:17 and 1 Peter 5:1: both addressed to elders. |
| G7 | minor | applied | The uncited sentence is gone; the phone line is his. |
| G8 | minor | applied | 1 Corinthians 12:11, verbatim, in the intro. |
| G9 | minor | applied | "No one is summed up by one row of this page." |
| G10 | minor | left | Statement 31. A rewrite, not a one-word fix. |
| F1 | blocker | moot | The calibration did what this asked by a different route. Checked: Jesus 1.6% against a median of 4.4%; no one-answer sheet names anybody. |
| F2 | blocker | applied | Verified John 6:6. Mark 6:38-41 removed from Jesus's Plans. |
| F3 | blocker | applied | Verified John 18:4, 12:27, Matthew 26:54, Luke 2:47. Jesus is not placed on Reasons and his cell says why. |
| F4 | blocker | applied | Right-pole items that were faith in God removed: Genesis 15:6, John 11:27, Joshua 2:9-11, Daniel 6:10, Judges 4:14, and 1 Samuel 14:6 (the evidence reviewer's addition). Luke 1:38 is kept, in a both-ends cell that no longer places Mary (see Catholic F4). The two sentences are on the axis. Thomas: moot. Left-pole questions put to God (Abraham, Moses, Gideon, David) stay: they are how those people handled an instruction, and no reviewer asked for them to go. |
| F5 | major | applied | Verified Luke 6:12. The prayer is back. |
| F6 | major | applied | John 11:6 removed (John 11:4 gives his reason); "moved with compassion" restored. The band-adjective part was already moot: a both-ends axis prints no adjective. |
| F7 | major | applied | Luke 22:50-51 replaces Luke 23:34. |
| F8 | major | applied in part | Share title is now "Who in the Bible my answers sat nearest". Making the note travel is the engineer's. |
| F9 | minor | rejected | The blueprint fixes that sentence word for word. |
| F10 | minor | applied in part | The line is on every figure page. Exodus 4:13 stays: the cell is already both-ends and unmatched, and removing it leaves one act pointing one way. |
| F11 | minor | applied | All four: 2 Samuel 6:14 out, Daniel 6:10 out of Plans, John the Baptist's Plans not shown, 2 Corinthians 12:8 out. Each was also raised by a second reviewer. |

### Pentecostal (`audit-pentecostal.md`)

| id | severity | verdict | what was done, or why not |
|---|---|---|---|
| G1 | blocker | **owner** | Decision 1. His way of including the five is option (b). |
| G2 | major | applied | With cessationist G3. Description now says "Thirteen of the gifts". |
| G3 | major | applied | Verified Acts 8:6-7. His sentence. |
| G4 | major | applied | Acts 15:32 ("being prophets themselves") and Acts 8:29 (the Spirit said) restored. Acts 5:3 now says what Peter said; "not having been told" was NOT added, because the text does not say nobody told him. |
| G5 | major | applied | Statement 15 (the psychometrician's wording, which he and the cessationist can also accept). |
| G6 | major | applied | By removing the sentence he objected to and quoting 1 Corinthians 12:11. 1 Corinthians 14:1 not added: a cessationist reads it as addressed to Corinth, and with the one-sided sentence gone the counterweight is not needed. |
| G7 | minor | applied | "no test for finding which are yours". |
| G8 | minor | applied | Acts 6:5-8; 1 Corinthians 13:2 quoted in the summary. Same fault as G3, so not left. |
| G9 | minor | applied | Acts 13:8-10, read and added. |
| F1 | major | applied | Acts 3:6 removed (three reviewers). |
| F2 | major | applied | 1 Kings 17:1 removed; Pace rests on 19:3 and moved 20 to 35. |
| F3 | minor | applied | Deborah's Pace not shown. Judges 4:14 removed from Reasons rather than reworded: he says himself the verse presents knowledge. |
| F4 | minor | applied | With cessationist F11. |
| F5 | minor | applied | "to whom the king's dreams were made known" (Daniel 2:30). |

### Catholic and Orthodox (`audit-catholic-orthodox.md`)

| id | severity | verdict | what was done, or why not |
|---|---|---|---|
| F1 | major | applied | With cessationist F3. His sentence, nearly word for word. |
| F2 | major | applied | Mark 5:30-34 read and added as he proposed. |
| F3 | major | applied | "Mary the mother of Jesus" (Acts 1:14, verbatim; no comma, because result sentences join names with commas). Fuller `who` line from John 2, John 19:25, Acts 1:14. Slug unchanged. |
| F4 | major | applied, part moot | The calibration had added Luke 1:46-47 and Luke 2:48. Now: Voice 70 to 60; Luke 2:48 also under Reasons; Reasons is both ends (she asked how, she asked why, she consented) and no longer places her. |
| F5 | major | applied | His sentence in the draft note. Adding Judith and Tobit: decision 5. |
| F6 | major | applied | `who` now says apostle and named first in the list (Matthew 10:2); Matthew 16:16 added to Voice; Acts 3:6 removed. The double use of 16:22 was already fixed. |
| F7 | minor | applied | "the 22 people listed here, and Jesus". |
| F8 | minor | applied in part | As cessationist F8. |
| F9 | minor | moot | Thomas was replaced by Gideon. |
| G1 | major | applied | One sentence in the intro. "The seven that Catholic teaching draws from Isaiah 11:2", because the translation on disk lists six there. |
| G2 | major | applied | "your pastor or priest" in the intro and the result. |
| G3 | major | applied | With cessationist G6. |
| G4 | major | applied | Verified Acts 6:6. The laying on of hands is back. |
| G5 | major | applied | 1 Corinthians 7:7 and 1 Timothy 4:14 named. |
| G6 | minor | left | Acts 15 as one man's gift. A rewrite. |
| G7 | minor | applied | "church" in the site's own voice in seven places, Barnabas's line included. |

### Psychometric (`audit-psychometric.md`)

| id | severity | verdict | what was done, or why not |
|---|---|---|---|
| F1 | blocker | moot | (a) and (c) are what the calibration did. Probed after the audit: none of his four cases names Jesus. (b) is the engineer's. |
| F2 | major | applied | 2 and 9 reworded; 18 replaced under F8. Two borrowed-voice statements remain. Rewording 7 as a criticism rejected: it is a clean behaviour statement. |
| F3 | major | moot | The calibration, exactly. |
| F4 | major | rejected | True that 10 is my quarrel and 4 and 16 are other people's, but the blueprint defines the poles that way and the figures are placed that way. His 4 drops the cost the first critic put there ("I end up passing messages"), which makes agreeing the admirable answer. Recorded as a known limit. |
| F5 | major | applied | Different wording, which both he and the first critic can accept. |
| F6 | major | applied | "there and then", so it does not echo 7's "on the spot". |
| F7 | major | applied | Also what two other reviewers' blockers needed from this pole. |
| F8 | major | applied | Without "I have been told". |
| F9 | major | applied in part | The sentence is in the scope note. Band edges and the unordered five: the engineer's. |
| F10 | major | applied | Both changes. |
| F11-F13 | minor | left | 15, 3 and 10 are rewrites; F13 is F1(b). |
| G1 | major | applied | Verified in `category.ts`: the top word prints at 92 and at 100. |
| G2 | major | **engineer** | Valid. An engine change. |
| G3 | major | applied | With two other reviewers. |
| G4 | major | applied in part | Statement 10 reworded, not with his wording, which still ran against Luke 14:28. Printing the pattern with the gift in brackets is option (c) of decision 1. |
| G5 | major | applied in part | 9 reworded. 35: decision 4. |
| G6 | major | applied | Verified Acts 9:36, 39 and 2 Timothy 1:16-18. Summary and statement 6. |
| G7 | major | **owner** | Decision 6. |
| G8 | major | applied | 20 as written; 5 without its second claim. |
| G9 | major | applied | All four. |
| G10 | major | applied | The sentence is in the result frame. |
| G11 | major | applied | With three other reviewers. |
| G12, G13 | minor | left | Rewrites. |
| G14 | minor | applied otherwise | "Thirteen of the gifts" (Pentecostal G2). |

### Evidence (`audit-evidence.md`)

| id | severity | verdict | what was done, or why not |
|---|---|---|---|
| B1 | blocker | applied | With cessationist F3 and F4. He offered "both ends" or "not shown" for Jesus; the second is what all three reviewers can accept. |
| B2 | blocker | moot | Priscilla was replaced by Barnabas. |
| M1 | major | applied in part | Decision 3. Lead 65 to 60; both sentences say what the verses say. |
| M2 | major | applied | Voice 60. |
| M3 | major | moot | The calibration cited Luke 2:48. |
| M4 | major | moot | Thomas was replaced. |
| M5 | major | applied | Verified Judges 4:4-9, 14. Pace, Reasons and Plans not shown (the sentence crediting her with the LORD's plan is gone); Conflict now rests on 4:9, at 35; Lead on 4:4-5 and 4:14. She is placed on three axes. |
| M6 | major | applied | Abigail, Rahab, Mary Magdalene and Deborah not shown on Reasons; Hannah 80 to 65. The right of Reasons now holds Ruth and Hannah only. |
| M7 | major | applied in part | Ruth 3:9 added; Lead 75 to 65, not 55: "where you go, I will go" and 2:18 still outweigh it two to one. Plans not shown: he is right that 2:3 is the narrator on providence and 2:7 is stamina. |
| M8 | major | applied | Verified Esther 2:10, 2:20. The sentences give Mordecai's command; 7:3-4 added; Voice 80 to 60. |
| M9 | major | applied | Hannah's Conflict not shown. |
| M10 | major | applied | Luke 10:40 kept for Voice and Conflict only. Pace 35 on John 11:20; Lead 35 on Luke 10:38; Plans not shown; Reasons 40 on John 11:39 alone. |
| M11 | major | applied in part | Luke 23:34 replaced. John 21:15-17 kept: the blueprint names it as the example of this axis, and the cessationist asked for it to stay. Matthew 17:27 read, not added: the cell has three. |
| M12 | major | rejected in part | See "the two questions" above. His value is what stands; his removal of John 13 is not. |
| M13 | major | applied | "He stood between" is Psalm 106:23, not Exodus 32:11. |
| M14 | major | applied in part | Plans 80 to 65 on John 21:3. Galatians 2:12 not added: drawing back is neither confronting nor reconciling. |
| M15 | major | applied | One fact in two Gospels, and a diet is not a planning style. |
| M16 | major | applied | 19:4-6 removed; both sentences now say he had been sent; Plans 85 to 65. |
| M17 | major | applied | Not shown. His replacement verses were not added. |
| minor | | applied | Daniel 6:10 (both cells), David's dancing, Elijah's Pace, Jesus's Pace, and "the references, not the placements" in the draft note. |
| minor | | left | Abraham's Conflict, Moses's Pace, Esther's Reasons, Hannah's Voice. Judgements about weight, none one-word. |

### The closing editor's own, beyond the reviews

- Jesus, Plans: Luke 22:8 is the same event as Mark 14:13-16, the fault M15 found in John the
  Baptist. Replaced with Mark 11:1-6 (the colt arranged ahead), read first.
- Mary Magdalene, Lead: was "not shown". Luke 8:1-3 and Mark 15:40-41 name her among the women who
  followed him and served him from their possessions. Read, added, 75, and both sentences say she
  is one of a group. It keeps her on four axes after M6 took Reasons away.
- The figure page says "not placed" and "Not placed on this axis" for Jesus's Reasons cell. It said
  "No record" above a sentence citing three passages.
- The roster test's list of women needed Mary's new name.

## The simulator, before and after (`node site/scripts/sim-figures.mjs`, realistic generator)

| | before | after |
|---|---|---|
| top five | Mary of Nazareth 8.6, Ruth 8.4, Abraham 8.4, Daniel 8.3, Rahab 7.2 | Abraham 7.9, Ruth 7.8, Rahab 7.7, Jonathan 7.7, Daniel 7.7 |
| thinnest | Martha 1.1 | Jesus 1.6, Martha 1.6 |
| ties | 7.2% | 8.1% |
| no close fit / central | 16.4% / 1.3% | 17.8% / 1.3% |
| targets | 3 of 4 | 4 of 4 |

No coordinate was moved to reach a number. One thing to know: with the first set of edits Ruth
stood at 9.3%. That was with her Plans still placed at 65, where the reviewer had asked for 55.
Fifty-five with acts pointing one way is a value the engine refuses, so the honest choices were
"placed" or "not shown", and his reasons (2:3 is providence, 2:7 is stamina) are reasons for "not
shown". It was decided on those reasons and she came to 7.8%. At Lead 70 instead of 65 she is 8.0%,
so the result does not hang on that choice either.

## Not resolved

- Decisions 1 to 6 above.
- Three of 23 figures are placed on three axes. If the floor goes back to four, this audit and the
  roster cannot both stand.
- The right pole of Reasons rests on two figures and four verses. It is honest and it is thin.
- The statements the audit reworded (six and ten) have been read against the six rules by one
  editor, not by the two critics the originals had.

## 2026-09-20, the engineer: the four items under "For the engineer"

Three applied, one decided against. Nothing the Theology Compass produces has changed: its share
text is now asserted character for character against the value it had before this work, and all 18
audited answer sheets still land on their own tradition. `npm run test` and `npm run build` pass in
`site/`, `node audit/selftest.js` passes at the root, and `node site/scripts/sim-figures.mjs` is
unmoved (worst Ruth 7.7%, ties 8.2%, thinnest Judith 1.1%).

**1. The note travels with the name (cessationist F8, Catholic F8). Applied.** An outcome's `note`
now goes wherever that outcome is named, not only on the result card and the figure page: it is a
line of its own immediately above the link in the share text, and it is drawn in small wrapped type
between the wheel and the link on the share card. The card measures the sentence first and gives
the wheel what is left, so nothing overlaps at any length of verdict. The rule is the name: a
result that names nobody carries no note, and a joint result carries one for each named figure that
has one. The Compass's traditions carry no notes, so it adds nothing there.

One thing the next person should know rather than discover: in the "near" and "loose" states the
summary line prints the second-nearest name as well ("Nearest on the map: Abraham · Jesus"), and
only the first-named figure's note travels, which is what the result page itself does, since it
emphasises one card in the near state. If the sentence should travel with every name that is
printed, it is one line in `namedNearest()` in `strategies/bipolar.ts`.

**2. Name nobody when all eighteen answers are identical (psychometric F1b, F13). Applied.** A quiz
may now set `uniformSheet: 'centre'`; the figure quiz does and no other quiz does. When every
answer is the same and it is not "Unsure", the runner stops before it scores anything and says so:
"You gave the same answer to every statement. Half of these statements pull one way and half the
other, so the same answer to all of them cancels out and there is nothing to place." Two ways on:
"Go back through them" returns to statement 1 with every answer kept, and "See the result anyway"
scores the sheet at the middle of every axis, where the existing central state names nobody. An
all-Unsure sheet already scores the middle and is left alone. The two-person `?with=` flow was
checked from the interstitial and still lands on `/c/bible-figure/<theirs>.<yours>/`. The detection
is `isUniformSheet()` in `engine/types.ts`, pure and tested headlessly.

**3. Gifts: ties of three or more (psychometric G2). Applied.** The tie set is now every category
within the tie margin of the top score, not the top two. Two, three or four are all named, in one
list joined with commas and a final "and"; the two-name wording is word for word what it was. Five
or more is not a verdict, so it takes the flat state and the flat state's own words. The ranking
emphasises exactly as many rows as the headline names, counted from the view rather than from the
state. Which categories were named is no longer decided by `localeCompare`, which is what the
finding was about.

**4. Narrower band words for the figure quiz (psychometric F9): not applied**, because the band
thresholds live in bipolar.ts and are shared with the audited Compass, the lean words are already
the mild tier, and the sentence "Change one answer and the name can change; read the rails, not the
name" is already on the page. (It is in `outcomeScopeNote` in `bible-figure.ts`, printed above the
figure cards on every result: "with three statements to an axis one changed answer can change the
name: read the rails, not the name".)

Files touched: `site/src/lib/engine/types.ts`, `site/src/lib/strategies/bipolar.ts` (share text and
the list of named outcomes only: no scoring, no bands, no matching), `site/src/lib/strategies/
category.ts`, `site/src/components/ShareBlock.astro`, `site/src/components/CategoryStack.astro`
(one line: it assumed a tie was two names), `site/src/pages/q/[quiz].astro`,
`site/src/styles/pages/quiz.css` (appended), `site/src/lib/quizzes/bible-figure.ts` (the one flag),
`site/scripts/engine-test.mjs` (sections 14, 15 and 16).
