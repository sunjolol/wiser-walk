# Audit: Roman Catholic, then Eastern Orthodox lens

Reviewer scope: `bible-figure` and `spiritual-gifts` drafts. Verses checked against
`demos/sounds-like-scripture/work/verses-all.json` (src `webbe`; the deuterocanon is on disk as
src `webbe-dc`). No file was edited. Only things that can be pointed at are listed.

Summary: the 57 statements themselves carry no Protestant assumption and need no rewrite from this
lens. Every finding is in the figure data (names, `who` lines, evidence, two of Jesus's
coordinates) or in the copy around the gifts quiz.

## Figure quiz

### F1. Jesus, Reasons axis (key `doubt`), value 70 "slow to question / takes it on trust" — MAJOR
Evidence: Luke 2:46 (left), Matthew 26:42 and John 18:11 (right). The right pole is defined in
`bible-figure.ts` as "go on and let the reason come later". The same Gospel says the opposite of
him seven verses before the cited act: John 18:4, "Jesus therefore, knowing all the things that
were happening to him, went out"; also John 13:1-3 and John 6:6. Gethsemane records obedience of
will, not acting before the reason is known. Catholic teaching (Aquinas, ST III q.7 a.3) is that
Christ did not walk by faith; Orthodox read Gethsemane through the Sixth Council as the human will
freely following the divine, not as ignorance. Luke 2:46 is likewise followed by 2:47 ("amazed at
his understanding and his answers"), so it is not "needs the reason before going on". His figure
page would print the band "slow to question" against him.
Fix: keep him off this rail. Value 50, evidence text: "The Gospels record him asking questions
(Luke 2:46) and yielding to the Father's will (Matthew 26:42), and they also say he knew what was
coming (John 18:4). Neither end of this axis, which is about going on before or after the reason
is known, describes that, so he is not placed on it." Print no band adjective for him here.

### F2. Jesus, Plans axis, Mark 6:38-41 cited as "Meets the day" — MAJOR
John's account of the same act says: "He said this to test him, for he himself knew what he would
do" (John 6:6). The text itself denies that the feeding was improvised.
Fix: drop Mark 6:38-41 as right-pole evidence. If a right-pole act is wanted, Mark 5:30-34 (on the
way to Jairus's house he stopped for the woman who touched him) is a recorded response to what
arrived and is not contradicted elsewhere. Re-argue the 40 from what remains.

### F3. Mary: name and `who` line — MAJOR
`name: "Mary of Nazareth"`, `who: "mother of Jesus"`. "Mary of Nazareth" is not a phrase the text
uses; Acts 1:14 on disk says "Mary the mother of Jesus". Her `who` is three words, the barest of
all 23 (Rahab gets nineteen, Mary Magdalene gets her seven demons). Both traditions will read that
as the site not knowing what to say about her.
Fix: name "Mary, the mother of Jesus" (slug may stay). who: "of Nazareth, betrothed to Joseph,
mother of Jesus; at the wedding in Cana, at the cross, and with the disciples in Jerusalem
(Acts 1:14)". All text, no title from outside it.

### F4. Mary: evidence is selected toward silence — MAJOR
Voice 70 rests on Luke 2:19 and 2:51 only. Her recorded speech is left out: the Magnificat
(Luke 1:46-55, the longest speech by a woman in the New Testament) and Luke 2:48, "Son, why have
you treated us this way?", said to his face in the temple. Conflict says "The text does not show
this", which Luke 2:48 makes untrue; it is also an "asks why" act for the Reasons axis. Two of her
six values are 50-by-absence, which is part of why she is the most-named result (17%).
Fix: add Luke 1:46-55 (voice, left) and Luke 2:48 (voice left, conflict left, Reasons left), then
re-argue voice (nearer 55-60) and give conflict a real value. Add John 19:25 (she stood by the
cross) where the editor judges it bears; at minimum it belongs in the `who` line (F3).

### F5. Deuterocanonical figures absent with no sentence — MAJOR
The title is "Who in the Bible…", the roster is drawn only from the 66 books, and neither the draft
note, the scope note nor the description says so. Judith and Tobit are as act-rich as Esther and
Ruth, the text is already on disk (`webbe-dc`), and the site's game makes canon a player's choice,
so silence here reads as deciding the question.
Fix (one sentence in `draftNote` and on the figure index): "Every figure in this draft comes from
the books all Christians share. Judith, Tobit, the Maccabees and others from the books Catholic
and Orthodox Bibles also contain are not in it yet; that is a limit of the draft, not a judgement
about those books." Better before launch: add Judith and Tobit by the same cited-acts rule.

### F6. Peter: `who` line and evidence selection — MAJOR
`who: "fisherman of Galilee, one of the Twelve"` while Paul is "apostle to the nations". The word
apostle is withheld from the one the text lists "first" (Matthew 10:2). Matthew 16:22 (rebuking
Jesus) is cited twice; Matthew 16:16, six verses earlier ("You are the Christ, the Son of the
living God"), is a plainer "says it" act and is absent. Acts 3:6 ("I have no silver or gold") is
cited as "Meets the day": having no money is not failing to plan, and the verse is the opening of a
healing.
Fix: who: "Simon Peter, fisherman of Galilee, apostle, named first among the Twelve
(Matthew 10:2)". Add Matthew 16:16 to voice (left). Remove Acts 3:6 from plan; keep John 21:3 and
re-argue the 80.

### F7. Scope note counts Jesus among "23 people" — MINOR
`outcomeScopeNote`: "Scored against the ${outcomes.length} people listed here". The blueprint
itself says "twenty-two people … and Jesus". Both traditions confess him as one divine Person made
man; folding him into a head-count is the careless phrasing the lens asks about.
Fix: "Scored against the twenty-two people listed here, and Jesus, on six axes of temperament
only. …" (compute 22 as `outcomes.length - 1`).

### F8. Share card when the nearest figure is Jesus — MINOR
`shareTitle: "Who in the Bible I am most like"` plus the name yields an image reading "most like:
Jesus". The blueprint requires `JESUS_NOTE` on his page and result card; nothing in the data makes
it travel onto the share image, the one object that leaves the site.
Fix: the share card must print `note` whenever the outcome has one; add a test.

### F9. Thomas: John 20:28 absent — MINOR
Reasons value 5 cites 20:25 and 14:5 and stops. "My Lord and my God!" (John 20:28) is a recorded
spoken act and is how the Orthodox remember him (Thomas Sunday). Add it to voice (left) so his page
does not end at the demand.

## Spiritual gifts quiz

### G1. "Spiritual gifts" means something else to a Catholic, and the page never says so — MAJOR
Title "What are your spiritual gifts?"; description "Thirteen gifts the New Testament lists". In
Catholic usage "the gifts of the Holy Spirit" are the seven of Isaiah 11:2 (on disk: "wisdom and
understanding … counsel and might … knowledge and of the fear of the LORD"), received in baptism
and confirmation; what Romans 12 and 1 Corinthians 12 list are called charisms (CCC 799-801, 2003).
The quiz even has a category named "wisdom", which collides directly.
Fix, one sentence in the intro frame: "Catholic readers usually call the gifts in these lists
charisms, and keep 'the gifts of the Holy Spirit' for the seven in Isaiah 11:2; this page is about
the first, not the second."

### G2. Who recognises a gift: "two or three people who have watched you serve" — MAJOR
Intro and result frames send the reader only to peers, and state uncited that "gifts are recognised
in service, by other people, over time". For Catholics the discernment of charisms belongs to the
Church's pastors (CCC 801, citing 1 Thessalonians 5:12, 19-21); for Orthodox it belongs with one's
priest or spiritual father. The site's own rule (CLAUDE.md, Orthodox positioning) is "bring this
to your priest" as the primary action on anything practice-shaped.
Fix, result frame last sentence: "It is to take it to your priest or pastor, and to somebody who
has served alongside you, and ask whether it matches what they have seen." Same change in the
intro ("to your priest or pastor and one or two people who have watched you serve").

### G3. Shepherding (and the Ephesians 4:11 list) presented as an everyone-gift — MAJOR
Summary: "Many translations say pastors: watching over the same people for a long time." Both
cited acts (Acts 20:28-31, 1 Peter 5:1-3) are addressed to elders, which Catholic and Orthodox
readers understand as the ordained presbyterate; Ephesians 4:11 says "He gave some to be…", people
given to the church, not abilities handed round. A result "your answers pointed most to:
shepherding" reads as "you are a pastor".
Fix, add to the summary: "Both passages below are addressed to elders. In Catholic, Orthodox and
many Protestant churches pastor is an office a person is ordained to; a result here names a
pattern of care, not that office." No statement needs rewriting.

### G4. Serving, Acts 6:1-6: the laying on of hands is trimmed out — MAJOR
`giftActs`: "the disciples chose seven men and the apostles appointed them over that business."
Acts 6:6 on disk: "whom they set before the apostles. When they had prayed, they laid their hands
on them." Catholic and Orthodox Christians read this as the first ordination of deacons; the
summary keeps the election and drops the ordination, which is one side's reading of the passage.
Fix: "…the disciples chose seven men and set them before the apostles, who prayed and laid their
hands on them."

### G5. What is left out without being named: celibacy, apostles, the word of knowledge — MAJOR
"What is not in this draft" names only the five sign gifts. Silently absent: 1 Corinthians 7:7
("each man has his own gift from God, one of this kind, and another of that kind"), the one place
Paul calls a state of life a gift and the root of consecrated and monastic life; "apostles"
(Ephesians 4:11, 1 Corinthians 12:28, "first apostles"); "the word of knowledge" (1 Corinthians
12:8, the same verse the wisdom category quotes half of); and 1 Timothy 4:14 / 2 Timothy 1:6, where
a gift is given "with the laying on of … hands".
Fix, add to that block: "Also not here: apostles (Ephesians 4:11), the word of knowledge
(1 Corinthians 12:8), the gift Paul names when he writes of remaining unmarried (1 Corinthians
7:7), and the gift given with the laying on of hands (1 Timothy 4:14). A set of statements about
everyday habits has nothing to say about any of them."

### G6. Leading, Acts 15:13-29: "once the others had fallen silent, James gave his judgement" — MINOR
Drops Peter's speech (Acts 15:7-11), after which "all the multitude kept silence", and the
letter's own account of whose decision it was (15:28, "it seemed good to the Holy Spirit, and to
us"). A council is offered as one man's gift.
Fix: "At Jerusalem, after Peter, Barnabas and Paul had spoken, James gave his judgement, and the
apostles and elders with the whole assembly sent it out in a letter that says 'it seemed good to
the Holy Spirit, and to us'." Cite Acts 15:6-29.

### G7. "assembly" used in the site's own voice — MINOR
"a servant of the assembly at Cenchreae", "met with the assembly", "host of the whole assembly"
are paraphrases, not quotations, yet they carry the World English Bible's unusual rendering of
ekklesia. Outside quotation marks the site should write "church", the word the blueprint's own
rule 2 lists as ordinary; keep "assembly" only inside verbatim quotes.
