# Psychometric audit: bible-figure and spiritual-gifts drafts

Lens: a psychometrician who is also a sceptical, non-religious reader. Findings only; nothing
fine is listed. No file was edited. Simulations were run on the final keying and the coordinates
in `site/src/data/bible-figures.json` with the thresholds in `bible-figure.ts` (tie 10, hedge 45,
centre 10) and in `spiritual-gifts.ts` (floor 17, tie 1 step).

## Who in the Bible are you most like?

### F1. BLOCKER. Low-effort, defensive and nay-saying sheets are told they are nearest Jesus
Measured:
- Strongly disagree with all eighteen: scores 67,33,67,33,67,33, result "Jesus · Daniel (jointly)".
- Strongly disagree with only the five "I have been told / I am teased" items (2, 5, 9, 13, 18),
  neutral on the rest (the reader nobody comments on, or the reader who denies criticism):
  "Daniel · Jesus".
- Answer ONE statement and leave seventeen neutral: 36 of the 72 such sheets are central, and
  of the 36 that name anyone, 24 name Jesus first or second; the rest name Mary of Nazareth,
  Priscilla or Mary Magdalene.
- 200,000 uniform random sheets: Jesus is named (near or tie) on 16.7%.
The single most desirable and most shareable result is the default output for disengagement
and for denial of criticism. The draft note admits the crowding; admitting it does not fix it,
and the draft note disappears at publication.
Fix: (a) replace the per-axis central rule with a whole-sheet one: name nobody when the
Euclidean distance of the six scores from 50,50,50,50,50,50 is 42 or less (catches every case
above; an all-33/67 sheet is 41.6 out); (b) name nobody when all eighteen answers are identical;
(c) fix F2 and F3, which are the mechanisms.

### F2. MAJOR. All five borrowed-voice items are criticisms, and denying them is one profile
Items 2, 5, 9, 13, 18 each report a fault other people have found ("one question too many",
"take over without being asked", "jumped in before I had the whole picture", "leave everything
until the last possible minute", "teased"). Each is also double-barrelled: I do it AND someone
has said so. A defensive reader, or one with nobody commenting, disagrees with all five and is
moved to Weighs first, Says it, Alongside, Takes it on trust, Plans ahead, which lands on
Daniel and Jesus (F1).
Fix: keep at most three, and make the rest plain behaviours.
- 9: "I start handing out jobs in a group before anyone has asked me to." (13)
- 2: "I often sit through a whole conversation without joining in." (10)
- 13: keep, but balance the axis with a criticism on the other pole, 7: "I have been told I
  take too long to make up my mind." (12)

### F3. MAJOR. A "not shown" cell is scored as 50, so missing evidence acts as a central score
Priscilla (4 of 6 cells not shown), Mary of Nazareth (2), Mary Magdalene (2), Thomas (2). Imputing
50 for missing data pulls these figures to the centre and makes them attractors for every
moderate sheet; three of them are in the top four most-named. That is a scoring artefact, not
a reading of the text.
Fix: compute distance over the shown axes only, scaled by sqrt(6 / shown); make a figure
nameable only with four or more shown axes (Priscilla stays on her page and off the result
until more of her record is verified).

### F4. MAJOR. Conflict axis: the reverse item is not the opposite of the forward items
10 ("have the argument now") is about MY disputes. 4 and 16 are about OTHER people's disputes.
A person can confront in their own quarrels and mediate in other people's; the two do not
trade off, so the axis is two scales summed. 4 also measures being used as a go-between
("I end up"), which depends on other people's behaviour and can be avoidance, not
reconciling.
Fix, all three about other people's disputes (the blueprint's definition of Reconciles):
- 10: "When two friends fall out, I tell the one in the wrong that they are." (15)
- 4: "When two people I know have argued, I try to get them talking again." (14)

### F5. MAJOR. Item 16 is double-barrelled and carries its own fault
"I step in to calm an argument before both sides have finished." Stepping in, and stepping
in too early, are two claims; a reader who steps in after both have spoken cannot answer.
Fix: "When an argument starts near me, I step in to calm it." (11)

### F6. MAJOR. Item 1 is ambiguous, domain-bound and loaded
"I buy things while I still feel like it." The clause can be read as "before the urge goes"
or "only when in the mood". It measures spending, which depends on income, and on a Christian
site impulse buying is the shameful answer (rule 3). It is also a long way from the acts that
place figures on this pole (stepping out of a boat).
Fix: "I say yes or no to an offer on the spot." (11) It is the true opposite of 7.

### F7. MAJOR. Item 11 is the only statement on its pole and reads as gullibility
"I go along with things without checking them first." "Things" is vague, the behaviour is
the undesirable answer for a discernment-minded audience, and it overlaps Pace (acting without
checking). The right pole of Reasons is therefore reached mainly by denying 5 and 17, not by
affirming anything.
Fix: "I follow the instructions as given and leave the reasons for later." (12) A true opposite
of 17, and both ends cost something.

### F8. MAJOR. Plans axis: the reader side measures procrastination, the figure side does not
18 ("leave everything until the last possible minute") and 6 measure low conscientiousness,
which is not value-neutral, so "neither end is the better one" is strained on this axis. The
figures on that pole (Peter, Elijah, John the Baptist at 80 to 85) are placed by responding to
what arrives, not by putting things off. Reader and figure are on different constructs with the
same label. 12 measures cautious carrying, a third thing.
Fix for 18: "I have been told I drop the plan too quickly when something new comes up." (15)

### F9. MAJOR. Three items per axis cannot support the band words or a ranked list of five
Scores move in steps of 8.3. A net of two raw points out of twelve (one "agree" and one
"strongly agree" is more than enough; two plain agrees do it) gives 33 or 67, outside the 41 to
59 band, and prints "quick to move" or "slow to question" as a headline. Simulated: changing
one answer by one step changes the first-named figure on 23% of random sheets; 52% of sheets
are ties and 26% are "no close fit". "Closest, then the next four in order" claims an ordering
the instrument does not have.
Fix: for this quiz name a band only from 25 or below and 75 or above (treat 33 to 67 as
"between"); show the five nearest as an unordered set whenever they fall inside the tie margin;
add one sentence under the cards: "Change one answer and the name can change; read the rails,
not the name."

### F10. MAJOR. "It measures temperament" and "sit nearest" claim a common scale that does not exist
Description: "The result names the figure whose recorded acts sit nearest... It measures
temperament, not virtue." A figure's coordinate is an editor's 0 to 100 judgement from one to
three anecdotes; a reader's is a sum of three Likert answers. Euclidean distance between them
assumes both are on one metric, which nobody has shown. The admission ("where a figure sits is
still a judgement") lives only in the draft note, which goes when the draft status goes.
Fix: description: "It asks about temperament, not virtue." Add to `outcomeScopeNote`, which is
permanent: "Each figure's place is an editor's reading of a few recorded acts, not a
measurement."

### F11. MINOR. Item 15 measures reticence, not support
"In a group I wait to see who is leading before I offer anything." This is Holds it and
Weighs first, so Lead will correlate with Voice and Pace. The blueprint's Alongside is
"makes someone else stronger".
Fix: "In a group I find the person in charge and ask what they need." (14)

### F12. MINOR. Items 3 and 10 are preferences, not behaviour (rule 1)
"I would rather run the meeting than sit in it" also belittles the other end ("sit in it").
Fix for 3: "When a meeting has nobody running it, I start running it." (11)

### F13. MINOR. A strongly-agree-to-everything sheet names Rahab and Abraham jointly
2/1 keying shifts every axis 17 points under full acquiescence (33,67,33,67,33,67). Covered by
fix (b) in F1.

## What are your spiritual gifts?

### G1. MAJOR. "the most here" can print on several rows, and on a row that is not first
`pull()` returns `above[3]` for any score of 92 or 100. Two gifts at 92 and 100 both read "the
most here"; in a rough simulation about one sheet in ten has two or more such rows. The label
states a rank; the function computes a level.
Fix: `above: ['a little', 'some of this', 'a lot of this', 'nearly all of this']`.

### G2. MAJOR. Three-way and wider ties are cut to two by the alphabet, and ties are the usual result
Naming starts at 75 (net three raw points of six) and the tie margin is one rung. In a rough
simulation with mildly acquiescent answers 53% of sheets end in the tie state and 57% of those
ties are three-way or wider; `ranked` breaks equal scores with `localeCompare`, so "wisdom" is
dropped for "administration" by spelling. The editor noted ties "will happen", not the rate.
Fix: name every gift inside the margin up to four ("Your answers pointed most to: A, B and C");
at five or more use the flat-state copy with "several came out level".

### G3. MAJOR. Faith's reverse item would be agreed with by the quiz's own exemplar of faith
15: "When the odds look bad, I am the one naming what could go wrong." The gift page cites
Paul in Acts 27:21-25. Fifteen verses earlier (Acts 27:10, WEBBE) the same Paul says "I
perceive that the voyage will be with injury and much loss". Naming risk is not the opposite of
faith; the item equates the gift with optimism and docks prudent readers.
Fix: "When the odds look bad, I am among the first to say we should stop." (14)

### G4. MAJOR. The faith scale is three constructs, and can tell a reckless reader they have a gift
10 is financial risk-taking, 27 is persistence, 15 is pessimism. Three items that do not measure
one thing cannot be summed into one score. 10 ("before I can see how they will be paid for")
also rewards behaviour that harms people, under the largest type on the page.
Fix for 10: "I agree to take something on before I can see how it will be finished." (15), and
in the headline and rows print the pattern with the gift in brackets for faith, discernment
and wisdom, whose summaries already say the statements see only an everyday pattern: "going
ahead before it is secure (listed beside: the gift of faith)".

### G5. MAJOR. Discernment 35 rewards snap suspicion; 9 punishes the charitable answer
35: "I decide something is off about a person before I could say what it is." A prejudiced
reader agrees strongly and is told their answers point to discernment. 9 makes "assume the best
of somebody" lower the gift, on a site whose readers hold that as a duty, so desirability
pulls the scale down for the wrong reason.
Fix for 35: "I check a person's story against what I can find out before I rely on it." (15)
Fix for 9: "I take an offer as it is put to me and do not look behind it." (15)

### G6. MAJOR. Mercy is defined against its own cited acts
Summary: "Going towards people in distress and staying, with nothing to fix." The cited acts:
Tabitha "full of good works and acts of mercy which she did" made tunics (Acts 9:36-39);
Onesiphorus sought Paul out and refreshed him. Both are practical relief. "Sitting with it" is
modern pastoral idiom, and reverse item 6 ("I want to fix the cause rather than sit with it")
marks down the nurse and the person who makes the tunics. 6 also reports a want, not an act.
Fix summary: "Going towards people in distress and doing what eases it."
Fix 6: "I keep my distance from people in distress until I know how to help." (14)

### G7. MAJOR. Eight "people come to me" items fall on eight gifts and none on the other five
2, 5, 8, 20, 24, 34, 37, 38 need a reputation and a circle (teaching, leading, wisdom,
discernment, encouraging, serving, shepherding, administration). Mercy, giving, faith,
evangelism and hospitality have none. A newcomer, a housebound or an isolated reader is capped
on eight gifts and steered to the other five: differential item functioning by circumstance,
not by gift. These items are also the most flattering to agree with.
Fix: exactly one others-report item for every gift, or none. For example mercy 33: "People
ring me when they are upset, even when I can do nothing about it." (14)

### G8. MAJOR. Wisdom 8, discernment 20 and leading 5 are one act: being consulted before a decision
8 "people ask me which one to take"; 20 "Friends check a person or an offer with me before they
commit"; 5 "People look at me when a decision has to be made". "An offer" and "two good
options" are the same thing. These will rise together and feed G2's ties.
Fix 20: "Friends ask me whether someone can be trusted before they rely on them." (13)
Fix 5: "When nobody will decide, I make the decision and the group goes with it." (14)

### G9. MAJOR. Reverse items that are not opposites, or cannot be answered
- 19 "Even when I have the money, I find it easier to give my time." A feeling, not an act; a
  reader who gives both freely cannot answer; agreeing describes a generous person.
  Fix: "Even when I can afford it, I look for a way to help other than money." (15)
- 21 "I tend to leave the practical jobs to whoever is better at them than me." Measures
  competence and sensible delegation; the most capable person in the room must disagree.
  Fix: "When there is clearing up to do, I am usually still talking to someone." (14)
- 30 "I would rather say what I would do than work out what suits them." "Them" has no
  referent, against the editor's own rule that no pronoun may point outside its sentence.
  Fix: "When a friend asks my advice, I tell them what I would do myself." (14)
- 17 "I keep most of my week in my head rather than written down." A private memory habit, not
  the order of a shared work. Fix: "When a group makes plans, I leave it to someone else to keep
  the list." (15)

### G10. MAJOR. The same behaviour is temperament in one quiz and a gift in the other
The editor's own rule ("The same behaviour cannot be temperament in one quiz and a gift in the
other") was applied to wisdom only. Still colliding: leading 28 and 5 with figure 15, 3 and 9;
evangelism 32 with figure 14; discernment 9 with figure 11; faith 10 with figure 6. Leading
cannot be written without it, so say it.
Fix: add to the result frame: "Some of these patterns are temperament as much as gift, and
these statements cannot tell the two apart."

### G11. MAJOR. Two uncited empirical claims inside the honest frame
Phone line: "other people usually name yours before you do." Intro: "gifts are recognised in
service, by other people, over time." Neither is quoted from Scripture or from any source, on
a site that promises everything is citable, inside the very copy that says Scripture gives no
test.
Fix phone line: "Scripture lists gifts and gives no test for them; ask people who have watched
you serve." Intro: "...(1 Corinthians 12:7), and the people who have watched you serve can see
what thirty-nine statements cannot."

### G12. MINOR. Double-barrelled forward items
- 34 (19 words): asked AND say yes. Fix: "When somebody needs an errand run or a form filled
  in, I say yes." (14)
- 36: decide quickly AND rarely think of it again. Fix: "When somebody needs money and I have
  it, I hand it over without deliberating." (14)
- 2: sought out AND over-explain; the concise explainer cannot answer. Fix: "People come to me
  when they need something explained." (9)

### G13. MINOR. Transparency differs by scale, so the ranking is biased toward the obvious ones
Evangelism (11, 23, 32), hospitality (26, 29) and giving (19, 36) announce their gift; wisdom
and discernment do not. A reader shaping a result can raise the first group at will. The intro
concedes this in general.
Fix: add to the result frame: "Some gifts here are easier to spot in the statements than
others, which is one way this page can be steered."

### G14. MINOR. "Thirteen gifts the New Testament lists" overstates two of them
Ephesians 4:11 lists people (evangelists, shepherds), and 1 Peter 4:9 commands hospitality
beside a verse about gifts; the hospitality summary says so honestly, the description does not.
Fix: "Thirteen patterns of service, each from a New Testament passage about gifts and quoted
in its own words."
