# Audit: the figure roster's evidence (adversarial reader)

Lens: for each figure, does the cited verse really show that pole of that axis? Every cited verse
was opened in the World English Bible British Edition on disk (`verses-all.json`, src `webbe`).
All 23 figures were read; every `quote` field is verbatim and no reference is missing. The
problems are in what the acts are made to prove, not in the citations. Quiz: `bible-figure`
throughout. Files: `site/src/data/bible-figures.json` (flattened from
`audit/new-quizzes/figures.verified.json`), `site/src/lib/quizzes/bible-figure.ts`.

Roster arithmetic used below (Jesus excluded): ten women, twelve men. Mean coordinate, women / men:
voice 45 / 30, lead 46 / 38, conflict 49 / 40, reasons 59 / 40. "The text does not show this"
cells: women 11 of 60, men 4 of 72.

## Blockers

### B1. Reasons axis, right pole: faith in God is being scored as "goes along without checking" (Jesus 70 above all)
The reader reaches the right pole by agreeing with "I go along with things without checking them
first" (statement 11). Figures reach it by acts of trust in God: Jesus by Matthew 26:42 and John
18:11 (Gethsemane and the cup), Mary by Luke 1:38, Abraham by Genesis 15:6, Deborah by Judges 4:14,
Rahab by Joshua 2:9-11, Jonathan by 1 Samuel 14:6. Those are two different things. The map as built
tells a reader who never checks anything that this is what they share with Jesus in Gethsemane, and
it places Jesus at 70, "slow to question", on an axis whose right-pole statement is a confession of
credulity. It is also the blueprint's forbidden move: "faithful" is a virtue judgement, and Genesis
15:6 is the narrator's verdict on Abraham's faith, not an act.
Jesus's left-side record is also thinned: Mark 15:34 ("My God, my God, why have you forsaken me?")
is the one recorded "why" of his adult life addressed to the Father and it is not cited; nor is
Luke 2:49.
Fix: (a) Right-pole evidence on this axis must be an act of going on without asking, toward a
person or an instruction, not a statement of faith in God. Drop Genesis 15:6; use Genesis 12:4 or
22:3 (he went, no question recorded). (b) For Jesus, add Mark 15:34 as `toward: left`, set the value
to 50 and use the "the text shows both" wording the blueprint provides; or decide that Gethsemane is
not temperament evidence at all and say "the text does not show this". (c) Do not publish Jesus at
70 on this axis.

### B2. Priscilla: a result given to about one reader in ten rests on one verse about a married couple
Four of six cells are empty. The other two both come from Acts 18:26, used once as `voice: left`
(40) and once as `lead: right` (80). Every recorded act is "Priscilla and Aquila"; the text records
no act of Priscilla alone, so nothing on her page is about her temperament as distinct from his.
Lead 80 is the second most extreme "alongside" value on the roster, and its second support, Romans
16:3-4, does not show it: "fellow workers" is Paul's word for Timothy and Titus too, and risking
one's neck says nothing about in front versus alongside. Evidence pointing the other way is left
out: the assembly met in their house (Romans 16:5, 1 Corinthians 16:19), and in Acts 18:26 she
corrects a preacher.
Fix: take Priscilla out of the scored roster until there is more to go on (the editor's note
already names Barnabas or Gideon as candidates, to be researched and verified first). If she stays,
lead no higher than 60, Romans 16:3-4 removed from the lead evidence, Romans 16:5 added as
`toward: left`, and her page must say in words that every recorded act is shared with Aquila.

## Major

### M1. Mary of Nazareth, lead 65: both cited acts show initiative, and the value says "alongside"
John 2:3 (she raises the shortage, tagged left) and John 2:5 (she gives the servants an order at
someone else's wedding, tagged right). Instructing servants is taking charge of the room; the tag
reads the content of the instruction ("do what he says") as deference. The axis statement for this
pole is "I wait to see who is leading before I offer anything", which is the opposite of what she
does in John 2.
Fix: lead 50 with the "text shows both" wording, or 45; retag John 2:5 honestly in the sentence:
"She told the servants to do whatever he told them" and let the reader see both sides.

### M2. Mary of Nazareth, voice 70: one famous verse drives it, and her speech is left out
Luke 2:19 and 2:51 are cited. Not cited: Luke 1:46-55 (the longest speech by a woman in the New
Testament), Luke 2:48 ("Son, why have you treated us this way?") and John 2:3. The placement is the
"pondered in her heart" sermon, not the whole record.
Fix: add Luke 2:48 and Luke 1:46 as `toward: left`; voice about 55.

### M3. Mary of Nazareth, conflict: "The text does not show this" is not true
Luke 2:48 is a mother putting a direct complaint to her son in front of the teachers. Whether one
calls that confronting is a judgement, but the text is not silent.
Fix: cite Luke 2:48 as `toward: left` with a value of about 45, or keep 50 and replace the sentence
with one that names Luke 2:48 and says a single moment is too little to place her.

### M4. Thomas, reasons 5: the "doubting Thomas" sermon, with his own counter-evidence used elsewhere
John 11:16 ("Let's also go, that we may die with him") is cited on three other axes and ignored
here, where it is the clearest thing he does: he goes on with no reason given. John 20:28 is not
cited anywhere. Two verses do not justify the most extreme value on the roster. Also his pace
evidence misreports John 20:25: the sentence says he "would not act on the other disciples' report";
the verse says he would not believe it. No act is withheld.
Fix: reasons about 20, add John 11:16 as `toward: right`. Pace sentence: "He said he would not
believe the others' report until he had seen and touched for himself", and since that is the
reasons axis again, pace should rest on John 11:16 alone or read "the text does not show this".

### M5. Deborah: one speech carries four coordinates, and a sentence credits her with the LORD's plan
Judges 4:6-7 is cited for pace, voice, conflict and plan. In it she relays a command ("Hasn't the
LORD, the God of Israel, commanded..."). The plan sentence, "She set the ground, the river, the two
tribes and the number of men before the muster began", says she set them; the verse says the LORD
did. A careful reader would call that sentence invented. Pace 40 rests on "she sent and called
Barak", which shows nothing about instinct versus deliberation. Conflict 20 treats ordering a
campaign against Sisera as "walks toward the argument"; the only interpersonal confrontation is
4:9, where she tells Barak the honour will not be his, and it is filed under lead.
Fix: plan 50, "the text does not show this" (or rewrite: "She passed on the command with its
mountain, river, tribes and number of men", and do not count it as her planning). Pace 50, not
shown. Conflict: cite Judges 4:9, value about 35. Lead: add Judges 4:4-5 (Israel came up to her for
judgement), which is better evidence than 4:9.

### M6. Women on the reasons axis: six of ten sit at 60 or above, each on one verse that shows something else
- Abigail 65, 1 Samuel 25:41-42: she accepts a marriage proposal promptly. That is pace, not trust.
- Rahab 65, Joshua 2:9-11: she gives her reasons ("we have heard how...") and in 2:12 demands an
  oath and "a true sign". She is the roster's clearest case of wanting a guarantee before going on.
- Hannah 80, 1 Samuel 1:18 alone: she ate and was no longer sad. 1:11 shows her setting terms in a vow.
- Mary Magdalene 40, John 20:15-16: asking where a body is and answering to her name are not
  asking why or taking on trust.
- Deborah 65, Judges 4:14: a prophetic announcement.
Men's mean is 40, women's 59. The pattern a reader will see is "the women trust, the men question".
Fix: Abigail 50 not shown; Rahab 45 with Joshua 2:12 added as `toward: left`; Hannah no higher
than 65; Mary Magdalene 50 not shown; Deborah 50 not shown.

### M7. Ruth, lead 75: her initiative is omitted
Cited: giving Naomi her leftovers (2:18) and "where you go, I will go" (1:16), which in context is
Ruth overruling Naomi's instruction to go home. Omitted: she proposes the gleaning herself (2:2),
and at the threshing floor Naomi had said "he will tell you what to do" (3:4) but Ruth tells Boaz
what to do (3:9). Plan 70 also leans on the narrator's "she happened to come" (2:3), which is a
remark about providence, not her temperament, and on 2:7, which shows stamina.
Fix: add Ruth 3:9 and 2:2 as `toward: left`; lead about 55. Plan about 55, citing only 2:2-3.

### M8. Esther, voice 80: the verses give the reason for her silence and the sentences drop it
Esther 2:10 and 2:20 both say she kept silent because Mordecai had commanded it. That is obedience
to an instruction, not a habit of keeping counsel, and the `did` sentences leave the reason out.
Esther 7:3-6, where she says everything to the king's face, is cited only under conflict.
Fix: sentence: "She did not tell anyone who her people were, because Mordecai had told her not to."
Add Esther 7:3-4 as `toward: left`; voice about 60.

### M9. Hannah, conflict 60 "reconciles": politely rebutting a false accusation is not reconciling
In 1 Samuel 1:15-16 she contradicts the priest ("No, my lord") and defends herself. Nobody is being
brought together. A woman's courteous self-defence has been filed as peacemaking.
Fix: conflict 50, "the text does not show this".

### M10. Martha: Luke 10:40 drives five of six coordinates
Pace, voice, lead, conflict and plan all cite the one verse from the Mary-and-Martha sermon.
"Distracted with much serving" is tagged "acts first" (busyness is not impulsiveness) and "plans
ahead" (serving a guest who has arrived is not provisioning in advance; John 12:2 likewise).
Fix: keep Luke 10:40 for voice and conflict only. Pace on John 11:20 alone, about 35. Plan 50, not
shown. Add John 11:21 ("if you would have been here...") to voice.

### M11. Jesus, conflict right pole: John 21:15-17 is the "restoration of Peter" sermon, and Luke 23:34 is forgiveness, not mediation
The axis's right pole is "works to bring the two sides together" (statements 4 and 16 are about
mediating). Asking Peter three times whether he loves him, with Peter "grieved", is called a
reconciliation by preachers, not by John. Praying for his executioners is forgiveness, a virtue,
and not an act of bringing parties together. The Gospels do record him de-escalating, and those
acts are not cited.
Fix: replace both with Luke 22:51 (he stops the sword-fight and heals the servant's ear) and
Matthew 17:27 (pays the tax "lest we cause them to stumble"). Keep 50 and the "text shows both" note.

### M12. Jesus, lead 50: the foot-washing is service, not "alongside", and the same scene says so
In John 13:13 he says of "Teacher" and "Lord": "so I am". The axis's right pole is standing beside
whoever leads and making them stronger; John 13:4-5 is the leader serving while remaining the
leader. This is the "servant leadership" sermon placing him. Mark 6:7 (sending the Twelve with
authority) does fit the pole.
Fix: drop John 13:4-5 from this axis; keep Mark 10:32 and Mark 6:7; value about 40, or keep 50 with
Luke 10:1 added beside Mark 6:7.

### M13. Moses, conflict: "He stood between" is not in Exodus 32:11
The sentence reads "He stood between and begged the LORD". The verse says he begged the LORD and
asked why. "Stood between" is Psalm 106:23's image (and Aaron's act in Numbers 16:48).
Fix: "He begged the LORD to turn from his anger against the people."

### M14. Peter, plan 80: two of three supports show nothing about planning
Matthew 17:24-27 is Jesus's instruction to Peter; Peter's own act is answering "Yes". Acts 3:6
("I have no silver or gold") is poverty, not improvisation. Only John 21:3 fits. Separately,
Galatians 2:12 (he drew back from the Gentile table "fearing those who were of the circumcision")
is used against him on Paul's page and absent from his own conflict evidence.
Fix: plan about 65 on John 21:3, plus Matthew 14:28 if wanted. Add Galatians 2:12 to conflict as
`toward: right` with a neutral sentence ("When men came from James he drew back and ate apart"),
or note that withdrawal is neither pole.

### M15. John the Baptist, plan 80: a diet is not a planning style, and it is one fact cited twice
Matthew 3:4 and Mark 1:6 are the same sentence in two Gospels, listed as two items. Locusts, honey
and camel's hair show asceticism.
Fix: plan 50, "the text does not show this".

### M16. Elijah, plan 85: he is obeying an order, then despairing
1 Kings 17:6 follows 17:3-4, where he is told to go to the brook and that the ravens are commanded
to feed him. 19:4-6 is a man asking to die. Only 17:10-11 shows him arriving without provisions.
Fix: keep 17:10-11; plan about 65.

### M17. Paul, reasons 55: neither verse is about reasons
Acts 21:12-14 is a refusal to be dissuaded (resolve); 2 Corinthians 12:8 is a petition for relief.
Fix: cite Acts 9:5 ("Who are you, Lord?") and Acts 17:2-3 (he reasoned, explaining and
demonstrating) as `toward: left`, Acts 26:19 as `toward: right`; or 50, not shown.

## Minor

- **Abraham, conflict.** Genesis 18:23-25 is tagged `right` (reconciles) here and `left` under
  voice. Arguing a case with God is walking toward the argument. Keep Genesis 13:8 alone; about 65.
- **Moses, pace.** Exodus 4:13 ("please send someone else") is reluctance, not weighing; and in
  Exodus 2:12 he "looked this way and that" before striking, which is not plainly instinct. About 50.
- **Esther, reasons 35.** Esther 4:11 states a law; it asks for no reason. Esther 2:20 ("Esther
  obeyed Mordecai") points right and is uncited. About 50.
- **Daniel 6:10** is used for reasons (right) and plan (left). A prayer habit is neither trust
  without reasons nor provisioning. Plan can rest on Daniel 1:8; reasons on 7:16 and 2:16.
- **David, voice.** 2 Samuel 6:14 (dancing) is not speech. Remove; the other two carry it.
- **Elijah, pace.** 1 Kings 17:1 shows speech, not speed. Keep 19:3 and 18:40 or lower the claim.
- **Jesus, pace.** John 11:6: verse 4 gives his stated reason for staying. It is a deliberate delay,
  not time taken to decide. Luke 6:12-13 carries the pole by itself.
- **Hannah, voice.** 1 Samuel 1:13 is silent prayer; when asked, she tells Eli everything (1:15-16).
  About 55.
- **Draft note** (`bible-figure.ts`, `draftNote`): "each reference has been checked against the
  text" is true of the citations and will be read as covering the placements. Add "the references,
  not the placements".

## What was checked and found sound
Not listed, by instruction. For the record: no missing reference, no non-verbatim quote, and no
`who` line that goes beyond the text.
