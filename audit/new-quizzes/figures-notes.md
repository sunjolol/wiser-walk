# The figure roster: how it was chosen and placed

**The roster now holds twenty-five: twenty-four people and Jesus, ten of them women.** What is
below is the record of the first pass, which placed twenty-three; it has been left as written so
the reasoning can still be read. Two later passes changed the list, and both are recorded at the
end of this file under "Changes since the first pass". For what is actually live, read
`figures.verified.json`, which is the file the site is built from.

Companion to `figures.json`. Every reference in that file was read from
`demos/sounds-like-scripture/work/verses-all.json` (`src: "webbe"`, the World English Bible
British Edition) during this pass. Nothing was written from memory, and every `quote` field is
a verbatim substring of the verse or verse range named in its `ref`. A checker was run over the
finished file: 23 figures, every ref resolves, every quote verbatim, 1–3 evidence items per
axis, every `did` one sentence, and the spread requirement met on all six axes at the strict
threshold (≤35 / ≥65), not just at ≤40 / ≥60.

## Scale

0 = fully the left pole, 100 = fully the right pole, per the blueprint's axis table:

| key | 0 (left) | 100 (right) |
|---|---|---|
| pace | Acts first | Weighs first |
| voice | Says it | Holds it |
| lead | Out in front | Alongside |
| conflict | Confronts | Reconciles |
| doubt | Asks why | Takes it on trust |
| plan | Plans ahead | Meets the day |

## Two kinds of 50, and how to tell them apart in the data

The blueprint requires the result page to distinguish "the text shows both ends" from "the text
shows nothing". The data carries the distinction structurally, so no renderer has to guess:

- **Both ends.** Two or three evidence items with real refs and opposing `toward` values, and a
  coordinate that sits where the balance leaves it (Thomas pace 50, Martha doubt 50, David plan
  50, Jonathan plan 50, Jesus lead 50 and conflict 50).
- **Not shown.** Exactly one evidence item, `ref: null`, `toward: null`, `did: "The text does not
  show this."`, and the coordinate is always 50. There are 14 of these cells. The checker enforces
  all four conditions together, so a not-shown cell can never carry a non-50 value and a shown
  cell can never carry a null ref.

## The roster

Twenty-two people plus Jesus. Ten women, twelve men, fourteen figures from the Old Testament and
nine from the New.

**Women (10):** Deborah, Esther, Ruth, Hannah, Abigail, Rahab, Mary of Nazareth, Martha,
Mary Magdalene, Priscilla.
**Men (12):** Abraham, Moses, Joseph, David, Jonathan, Elijah, Nehemiah, Daniel,
John the Baptist, Peter, Paul, Thomas.
**And Jesus**, by the owner's explicit decision.

### Considered and cut, with the reason

- **Gideon** (pace 85, doubt 10, plan 25 in the working draft). The fleece is the best single
  image on the doubt axis and it hurt to lose him. Cut because he duplicated Joseph, Nehemiah,
  Daniel, Esther and Hannah on pace-right and Thomas, Moses and John the Baptist on doubt-left,
  while the roster needed the slots for figures who could carry plan-right honestly. **Worth
  reinstating if the roster ever grows past 22.**
- **Barnabas** (lead 85, conflict 60). Cut for the same reason: Jonathan, Ruth, Priscilla,
  John the Baptist, Daniel and Mary of Nazareth already hold lead-right, and his record gave
  nothing firm on plan or pace. Also a strong candidate to reinstate.
- **Jonah.** Cut early. Vivid on pace, voice and conflict, but the text gives no usable act on
  lead or plan, which would have meant a figure carrying three 50s.
- **Miriam.** Cut when the count had to come down; Deborah, Martha and Abigail already carry
  voice-left and conflict-left among the women.

## The hard calls

### Jesus

Placed by exactly the same rule as everyone else: recorded acts from the four Gospels, read from
the file, no virtue words, nothing from outside the text. Three of his six coordinates sit near
the middle because the Gospels genuinely record him at both ends, not because the record is
thin — and the evidence arrays say so.

- **pace 55.** Mark 1:41–42 is a decision taken and executed in one motion. Against it stand
  Luke 6:12–13 (a night on the mountain before choosing the Twelve) and John 11:6 (told Lazarus
  is ill, he stays two days where he is). The recorded *healings* are almost always immediate;
  the recorded *decisions* follow withdrawal. 55 is the honest weighting of those two patterns,
  and it is the coordinate I am least certain of. Also on the record and not cited for space:
  Mark 1:35–38, where he goes out before daylight to pray and then sets the next move.
- **voice 40.** John 18:20 is his own account of his practice under questioning — "I spoke openly
  to the world" — and Mark 8:32 says he spoke openly about Jerusalem. The silences are specific
  and striking (Mark 15:5 before Pilate; Luke 23:9 before Herod; Mark 8:30, where he orders the
  disciples to tell no one). Two strong left acts and one strong right act put it just left of
  centre. A second right item, Mark 8:30, was left out only because of the three-item cap.
- **lead 50, both ends.** Mark 10:32 has him physically ahead of the Twelve on the road. John
  13:4–5 and Mark 6:7 have him washing their feet and sending them out in pairs with his own
  authority. Luke 10:1 (seventy more sent ahead of him) says the same and was cut for space.
  Neither end dominates; 50 with three cited acts is the honest answer.
- **conflict 50, both ends.** John 2:15 is the most forceful single confrontation in the Gospels.
  Luke 23:34 and John 21:15–17 are at the other end. Matthew 23 would have been a second left
  item; it was cut for space, and a reviewer may reasonably argue it should push this coordinate
  below 50. Flagging that as an open call rather than settling it quietly.
- **doubt 70.** The most delicate axis. I deliberately did **not** use Mark 15:34 — the cry from
  the cross quoting Psalm 22 — as evidence on a temperament axis; citing it here would be
  accurate and still wrong in tone, and a discernment-minded reader would be right to object.
  What is cited instead: Luke 2:46 (the boy in the temple, listening and putting questions —
  toward left) and Matthew 26:42 with John 18:11 (in the garden he asks, does not get what he
  asked for, and goes on anyway — toward right). That is what the axis measures, and it lands at
  70.
- **plan 40.** Mark 14:13–16 and Luke 22:8 are arrangements made in advance and found exactly as
  described; Mark 11:2–6 (the colt) is a third and was cut for space. Against them, Mark 6:35–41:
  the day is gone, there is no food, and he asks what is there and uses it. Three left acts and
  one right act put it at 40.

The blueprint's required sentence — that landing nearest Jesus is about temperament as the
Gospels record it, not a measure of holiness — belongs on his figure page and his result card,
and is not this file's job.

### Rahab's plan coordinate was flipped, and it is the more honest reading

My first pass had her at 20 (plans ahead), on the flax laid in order on the roof and the scarlet
cord in the window. Reading Joshua 2 again: the flax was already on the roof for her trade, not
laid there for spies; and the scarlet cord was **the spies' condition, given to her as they left**
(Joshua 2:17–18 — "The men said to her... tie this line of scarlet thread in the window"). What
the chapter actually records of her is a night of improvisation: two strangers arrive, a search
party arrives, she hides them, tells the pursuers they have gone, and lowers them out of her own
window. That is plan 70, not 20.

### Priscilla carries three not-shown cells

More than anyone else on the roster. Her recorded acts are concentrated in Acts 18:26 and Romans
16:3–4, which speak to lead, conflict and voice and say nothing about pace, doubt or planning.
She is kept because she is the only woman in the New Testament recorded teaching a named teacher,
and because lead-right would be thin without her. The alternative — inventing a reading of Acts
18:2–3 (tentmaking) or 18:18–19 (being left at Ephesus) — is exactly what the blueprint forbids.

### David's plan coordinate sits at 50 on two opposed facts

1 Chronicles 22:5 says flatly that he prepared abundantly before his death. 1 Samuel 21:3 and
21:8 have him arriving at Nob with no bread and no sword, because "the king's business required
haste". Both are recorded acts; neither cancels the other; the coordinate is 50 with both cited.

### Abraham's plan coordinate

Genesis 22:3 (split the wood, saddled the donkey) and Genesis 22:7–8 (went up the mountain with
fire and wood and no animal) are two acts in the same episode pointing opposite ways. 45.

### Abigail's conflict 90 rests partly on David's words

The evidence at 1 Samuel 25:33 is David's statement that she kept him that day from blood
guiltiness. That is a report of what she did, spoken by the other party in the text, and I have
labelled it as such in the `did` rather than putting the assessment in my own voice. Her own acts
at 25:18–25 carry the coordinate; 25:33 confirms it.

### Rahab's identifier

`who` says "a prostitute whose house stood on the city wall". Joshua 2:1 and 6:22 both use the
word. Leaving it out would be sanding the text down; the identifier is factual, not a judgement,
and the quiz's axes are temperament, not virtue.

### Joseph's voice was raised from 60 to 70

Genesis 42–44 is three chapters of deliberate concealment from his own brothers. The dream he
told at 37:5–7 is one youthful episode against that. 70.

## The spread on each axis

Counting only figures who sit **clearly** on a side — at or beyond 35 / 65, a stricter line than
the 40 / 60 the task asked for. Every axis clears five on both sides at this threshold.

| axis | left (≤35) | right (≥65) | exactly 50 |
|---|---|---|---|
| pace | 10 | 5 | 3 |
| voice | 13 | 6 | 0 |
| lead | 13 | 6 | 3 |
| conflict | 9 | 5 | 6 |
| doubt | 7 | 7 | 3 |
| plan | 11 | 5 | 5 |

**pace** — left: Peter 5, Abigail 10, Rahab 15, Jonathan 20, Elijah 20, Martha 20, Abraham 25,
Mary Magdalene 25, Ruth 30, David 35. right: Hannah 65, Joseph 75, Nehemiah 75, Daniel 75,
Esther 85.

**voice** — left: Peter 5, Elijah 10, John the Baptist 10, Paul 10, Martha 10, Thomas 15,
Deborah 15, David 20, Moses 25, Abraham 30, Ruth 35, Abigail 35, Mary Magdalene 35.
right: Jonathan 65, Hannah 65, Rahab 65, Joseph 70, Esther 80, Mary of Nazareth 85.

**lead** — left: David 15, Nehemiah 15, Deborah 15, Joseph 20, Peter 20, Moses 25, Paul 25,
Elijah 30, Abigail 30, Rahab 30, Martha 30, Abraham 35, Esther 35. right: Daniel 65,
Mary of Nazareth 65, John the Baptist 80, Jonathan 85, Ruth 85, Priscilla 90.

**conflict** — left: Elijah 10, Nehemiah 10, John the Baptist 15, Paul 15, Deborah 20, Martha 25,
Peter 30, Moses 35, Esther 35. right: Abraham 70, Joseph 75, Jonathan 80, Priscilla 80,
Abigail 90.

**doubt** — left: Thomas 5, Moses 20, John the Baptist 25, Abraham 35, Nehemiah 35, Peter 35,
Esther 35. right: Mary of Nazareth 60, Abigail 65, Jesus 70, Jonathan 75, Deborah 75, Rahab 75,
Hannah 80, Ruth 85. (Paul 60 also sits right of centre.)

**plan** — left: Joseph 5, Nehemiah 10, Esther 15, Abigail 15, Hannah 20, Mary Magdalene 25,
Paul 25, Daniel 30, Deborah 30, Martha 30, Moses 35. right: Ruth 70, Rahab 70, John the Baptist
80, Peter 80, Elijah 85.

### The plan axis is the weakest, and the auditor should look there first

It is the only axis where the right pole was hard to populate from recorded acts, and it is the
reason two good figures (Gideon, Barnabas) were cut. Scripture narrates provisioning — Joseph's
granaries, Abigail's donkey train, Nehemiah's letters, Esther's banquets, Hannah's yearly robe —
far more often than it narrates improvisation, so a first-pass roster drifts hard to the left.
The five on the right (Elijah fed at the brook and under the juniper tree; John the Baptist on
locusts and wild honey; Peter with no silver or gold; Ruth gleaning from morning to evening;
Rahab's night of improvisation) are each firm, but there is no sixth in reserve. If a later pass
loses one of them, the axis needs a new figure, not a stretched reading of an existing one.

A second, smaller worry: **pace-right** and **conflict-right** also stand at exactly five at the
strict threshold. Both have near-misses immediately behind them (Jesus 55 and Mary of Nazareth 55
on pace; Hannah 60 and Daniel 55 on conflict), so neither is fragile, but neither has room to
lose a figure either.

## What this file does not do

- It does not write statements. Per the blueprint the eighteen statements must know nothing about
  the Bible; nothing in this roster may leak into them, and no statement may be written backwards
  from a figure here. That was the failure that sank the shelved figures deck.
- It does not set band adjectives, outcome copy, or the `Outcome.position` array order. The engine
  wants `position: number[]` in group order; the object form here is for human review, and the
  engineer should flatten it in the declared axis order pace, voice, lead, conflict, doubt, plan.
- It does not rank or score. No percentage against a figure ever prints, on any surface.

---

## Changes since the first pass

### 2026-09-20, the verification and calibration pass

`figures-verification.md` opened all 255 references again, reworded 76 `did` sentences that said
slightly more than the verse they cited, and removed 9 that the text does not show. **Thomas and
Priscilla came off the roster and Gideon and Barnabas went on** — the two the first pass had cut
and marked "worth reinstating". So the roster above is not quite the one that shipped; the list
that shipped is in `figures.verified.json`, and the table of every coordinate is in
`figure-final.md`.

### 2026-09-22, Judith and Tobit added

**Who:** Judith, widow of Manasses of Bethulia, and Tobit, an Israelite of the tribe of Naphtali
carried captive to Nineveh.

**On whose decision:** the owner's, on 2026-09-22. His words were "Include them both". It is
decision 5 in `HANDOFF.md`, and it was his call alone, not a finding of any audit.

**From which text:** the World English Bible British Edition deuterocanon held on disk at
`demos/sounds-like-scripture/raw/eng-webbe_vpl.txt`, book codes `JDT` and `TOB`, opened with
`node audit/tools/webbe.mjs "Judith 8"`. Judith is 16 chapters and Tobit 14, and both books were
read whole before anything was placed. Nothing was written from memory. The research is in
`figure-judith-research.md` and `figure-tobit-research.md`; an adversarial verifier then checked
every reference and every quotation against the same file and corrected the entries, in
`figure-judith-verified.md` and `figure-tobit-verified.md`. Those corrected entries are what was
appended, unchanged.

**Where they landed**, on the same scale as everyone else (0 the left pole, 100 the right):

| axis | Judith | Tobit |
|---|---|---|
| pace | 40 | 30 |
| voice | 40 | 35 |
| lead | 15 | 35 |
| conflict | 25 | both ends (45) |
| reasons | not shown | 25 |
| plans | 10 | 30 |

Each is placed on five of the six axes, well clear of the floor of three. Judith's Reasons cell is
the stock not-shown cell: the book records nothing either way. Tobit's Conflict cell is the other
kind of middle — one quarrel he starts and presses (2:13) against an apology to a stranger (5:13)
and a calming answer to his wife (5:17-22) — so the engine derives "both ends" and does not match
anyone on it.

**Which Bibles hold their books.** Each of the two carries one sentence that travels with the
outcome wherever it appears, through the same `outcome.note` mechanism that carries Jesus's: "The
book of Judith is in Catholic and Orthodox Bibles. Protestant Bibles leave it out or print it as
Apocrypha." It is the wording the Sounds Like Scripture game uses, which the owner approved. The
notes live in one map by slug, `OUTCOME_NOTES` in `site/src/lib/quizzes/bible-figure.ts`, and
`engine-test.mjs` asserts both sentences word for word so neither can go missing quietly.

**What they did to the spread.** Nothing on the two scarce right-hand poles: both sit left of
centre almost everywhere, which is what the text shows and is the same drift the first pass already
recorded on the plans axis. Judith joins the crowded corner near David and Deborah; Tobit sits
15 units from Abraham on their four shared axes, which makes them the closest pair on the roster by
that measure, though the engine's own closest-pair check still reports David and Deborah at 8.7.

**One calibration target now fails, and no coordinate was moved to make it pass.** Over 10,000
realistic sheets: worst share 7.7% (Ruth, target under 9%, pass), ties 8.2% (target under 15%,
pass), central 1.3% (target under 6%, pass), thinnest share 1.1% (Judith, target at least 1.5%,
**fail** — Jesus is at 1.3% and Martha at 1.5%). Twenty-five figures divide the same hundred per
cent, so an even share falls from 4.3% to 4.0% and a fixed 1.5% floor bites harder every time the
roster grows. Whether the target should move is the owner's call. Moving a coordinate to clear it
would mean inventing a reading of Judith to hit a number, which is the one thing this file exists
to prevent.
