# Tobit: adversarial verification of the proposed figure entry

Verifies `figure-tobit-research.md`. All fourteen chapters of Tobit were read from the World English
Bible British Edition on disk with `node audit/tools/webbe.mjs` before anything was judged, and every
reference below was opened again when its item was judged. Nothing here was checked from memory.
Nothing was committed or pushed.

## Headline

| check | result |
|---|---|
| evidence items proposed | 15 |
| refs that resolve | 15 of 15 |
| quotations verbatim (`webbe.mjs --check`) | 12 of 12, before and after correction |
| **supported** (some with a word tightened) | 9 |
| **overstated** (reworded, or the ref widened) | 5 |
| **wrong pole / no pole** (removed) | 1 |
| **not in the text** | 0 |
| acts pointing the other way that the researcher missed, now cited | 2 |
| items after correction | 16 |
| coordinates changed | 6 of 6, every one toward the middle |
| axes honestly placed after correction | **5** (pace, voice, lead, reasons, plans). Conflict shows both ends and does not place him. |

The citation work is honest. No verse is invented, no quotation is touched up, and nothing done by
Tobias, Raphael, Anna or Sarah is counted as Tobit's. The faults are the two this roster keeps being
caught on:

1. **Reach in the sentences.** Five `did` sentences carry a word or a detail from a verse that was
   not cited: "again" twice (the first asking is in the verse before), "first", "himself", and a
   table that is laid in 2:1 while the ref is 2:2.
2. **Values more extreme than the acts can carry, with the contrary acts left off the page.** The
   researcher made himself a rule that no verse may be cited on two axes. The roster has no such rule
   (Esther 4:16 is pace and plans; 1 Samuel 25:18 is pace and plans; Exodus 18:25-26 is lead and
   plans). The effect of his rule was that an act pointing the other way was acknowledged in the
   notes, used to shade a number, and never shown to the reader. Where an opposing act is real it is
   now cited; where it is not, the value is set by the roster's convention and not by an uncited act.

## Whose act is it? Attribution checks

- WEBBE keeps "Tobit" (father) and "Tobias" (son) apart in every verse that names either. All twenty
  verses naming Tobit were listed with `--grep` and read.
- The items that rest on a bare "he" were each traced to the father: 5:3 (the speaker answers
  Tobias's question at 5:2), 5:8 ("said to his father ... But he said"), 5:13 (the speaker knew
  Ananias and says "as to my son" at 5:14), 14:3 (subject carried from 14:1-2), 4:2-3 (4:1 names him).
- **Tobit 12:5 must not be used for Tobit, and the researcher's rejection note 12 leans on it.** "And
  he called the angel, and said to him, Take half of all that you have brought" follows "The old man
  said" in 12:4, but the pronoun is not resolved by the verse and other English Bibles give the line
  to Tobias. It is not in the evidence, so nothing falls; it should stay out.
- Tobit 12:6-20 is the angel speaking. Tobit 12:13 ("when you didn't delay to rise up, and leave your
  dinner") is the angel's report of 2:4 and was rightly left out, as was the neighbours' talk at 2:8.

## Every evidence item

Verdicts: **supported** (this person, this act, in the cited verses, pointing where it is said to
point); **overstated** (the sentence says more than the cited verses; reworded or the ref widened);
**wrong pole** (the act points the other way, or to neither pole); **not in the text**.

| axis | ref | toward | verdict | what was done |
|---|---|---|---|---|
| pace | Tobit 2:3-4 | left | supported | "took the body into a chamber" tightened to the verse: "took him up into a chamber until sunset". The strongest act in the entry. |
| pace | Tobit 1:19 | left | supported, weak | The verse has the knowing, the withdrawing and the fear. It has no timing: "the moment he knew" in the argument is the researcher's, not the text's. Kept only because the audited roster keeps Elijah's pace on the same kind of act (1 Kings 19:3, alone, at 35). It carries little. |
| voice | Tobit 3:1-6 | left | supported | Rests on the act of putting his sorrow into words, as Moses (Exodus 32:11) and Hannah (1 Samuel 2:1) do in the roster. The sentence says what he asked for, not that the prayer was good. No piety is doing the work. |
| voice | Tobit 14:3 | left | supported | He called them and said it. |
| voice | Tobit 1:18 | right | supported, modest | Sentence tightened to the verse. It is concealment of a deed under threat, the same family as Esther 2:10 and Nehemiah 2:16, and weaker than either: it says nothing about keeping a thought to himself. |
| lead | Tobit 2:2 | left | overstated | "Seeing the meat set out" and "bring in": the verse has "I saw abundance of meat" and "Go and bring"; the dinner being prepared is 2:1. Reworded to 2:2. A father giving his son an errand is a small act on this axis. |
| lead | Tobit 5:3 | left | overstated | "pay the wages himself": the verse has "I will give him wages, while I still live". Intensifier dropped. Note the same verse also hands his son the bond and the choice of companion, which a hostile reader can call the other pole. |
| conflict | Tobit 2:13 | left | supported | Sentence now follows the verse ("it began to cry") and includes "Is it stolen?", which is the confrontation. |
| conflict | Tobit 5:13 | right | supported, weak | The verse has the welcome and "Don't be angry with me". The man is not recorded as angry, so this is a courtesy that heads off a friction, not the settling of a quarrel. |
| reasons (`doubt`) | Tobit 5:8 | left | overstated | "call the man in first": "first" is not in the verse. Reworded. |
| reasons (`doubt`) | Tobit 5:11 | left | overstated | "met his question with a question" and "said again" both need 5:10, where the first question is. Ref widened to **Tobit 5:10-11**. Same conversation as 5:8: two items, one episode. |
| reasons (`doubt`) | Tobit 2:14 | left | overstated | "asked her again": the first asking is 2:13, which is not cited here. "again" dropped. The rest is the verse. |
| plans (`plan`) | Tobit 1:14 | left | supported | The verse gives the deposit and no reason for it. "It was still there years later" (the researcher's argument) is 9:5, an act of Raphael and Gabael. |
| plans (`plan`) | Tobit 4:1-2 | left | supported | "first" tightened to the verse's "before I die". The firmest plans item. |
| plans (`plan`) | Tobit 10:1 | left | **wrong pole: removed** | Counting the days of an absence is waiting, not preparing or provisioning; 10:3 ("He was very grieved") and 9:4 ("My father counts the days; and if I wait long, he will be very grieved") frame it as a father's worry. The sentence also reached: "knew when the days of the journey had expired" is not in 10:1. |

### Added: two acts that point the other way

| axis | ref | toward | why it belongs |
|---|---|---|---|
| conflict | Tobit 5:17-22 | right | Anna weeps and reproaches him for sending the boy ("Don't be greedy to add money to money"). He does not argue the charge; he tells her not to worry and that the boy will come back safe, "So she stopped weeping." The same shape as Gideon answering Ephraim (Judges 8:1-3), which the audited roster keys right. The sentence does not lean on "a good angel will go with him"; that line is trust in God and is not evidence on any axis here. |
| plans (`plan`) | Tobit 2:1-4 | right | He has sat down to a feast-day dinner, news arrives, and he leaves it untasted to deal with what has come. The quiz's own statement for this pole is "I drop my plans when something new comes up", and the audited roster keys Jesus stopping on the way to Jairus (Mark 5:30-34) the same way. The researcher saw this act only as pace. |

## The coordinates

The roster's convention, read off the audited file: one cited act sits at 30-40 (or 60-70); two acts
one way sit around 25-35; acts both ways sit where the balance leaves them, and inside 41-59 the
figure is not placed on that axis; only a record like Peter's or Nehemiah's goes to 5-15.

| axis | proposed | now | why |
|---|---|---|---|
| pace | 25 | **30** | One vivid act and one weak one. The researcher justified 25 by an uncited contrary act (5:8); that act is about needing to know who the man is, which is the reasons axis, so it is no longer used to shade this number either way. |
| voice | 30 | **35** | Two left and one right, all three of modest weight. The roster's two-left-one-right cells centre on 35 (Moses conflict 35, Peter reasons 35, Jesus voice 40). |
| lead | 25 | **35** | Two instructions from a father to his son. That is the weight of Martha receiving a guest (35) or Abigail sending her young men ahead (30), not of Moses or Paul (25). The thinnest placed axis in the entry. |
| conflict | 40 | **45, both ends** | One sharp quarrel that he starts and presses, against an apology to a stranger and a calming answer to his wife's reproach. The researcher flagged this himself; 40 sat one point outside the no-position band on one act each way, which is placing a man by a rounding choice. At 45 with acts both ways the engine derives "both ends" and does not match on this axis. |
| reasons (`doubt`) | 15 | **25** | Three items but two episodes. Insistent in both (he asks the guide twice and will not be deflected; he flatly refuses his wife's account). Gideon's 10 rests on a sign and two fleeces; this is not that. |
| plans (`plan`) | 10 | **30** | 10 is Nehemiah's letters, timber and armed shifts. Tobit has a deposit whose reason the text does not give and a decision to explain his affairs before he dies, against one clear act of dropping everything for what arrived. Jesus sits at 40 on two left and one right; Tobit has more left acts in reserve (below), so 30. |

## Checked and deliberately not added

- **No right-hand item on reasons, and that is correct.** The candidates are all statements of trust
  in God or reassurance to a frightened wife: "May his angel go with you" (5:16), "a good angel will
  go with him" (5:21), "He is in good health" (10:6), "I surely believe all the things which Jonah
  the prophet spoke" (14:4). The closed audit removed every right-pole item that was faith in God
  (AUDIT-LOG, cessationist F4), and 10:1-3 shows him anything but untroubled. Not added.
- **Tobit 2:13-14 as a second pace-left item.** He orders the kid returned in the same utterance in
  which he asks whether it is stolen, before Anna has answered, and 2:12 shows he did not have the
  whole picture. It is a better pace act than 1:19. Not added because the one episode would then
  carry three axes. On the record as the replacement if 1:19 is ever struck.
- **Tobit 5:9-15 as a lead-left item.** His son found the man; it is Tobit who has him called in,
  questions him and fixes the wages. Firmer than 2:2. Same episode as the reasons axis, so not added.
- **Tobit 5:14-15 as a third plans-left item** (a drachma a day and his necessities, more if they
  both return safe). Supported, and the researcher had it in reserve. Left out only for the
  three-item cap once the right-hand act had to be shown.
- **Tobit 10:2 and 11:17 as voice-left reserves** (he says his worry out loud; he gives thanks in
  front of the people at the gate). Supported; not needed.
- **Tobit 10:6, "Hold your peace. Don't worry."** A rebuff and a comfort in one line. Points neither way.
- **Tobit 1:6-8, the yearly tithes, for plans.** Rightly left out by the researcher, but his note that
  "Daniel 6:10 is kept in this roster on exactly that ground" is out of date: the audit removed
  Daniel 6:10 from both of Daniel's cells. A devotional routine is not evidence on this axis.
- **Tobit 1:16-17, burying whoever he saw.** A standing practice, not improvisation. Agreed.
- The researcher's "four-axis floor" is also out of date. The floor is three.

## Virtue words and piety

No `did` sentence uses a virtue word. "For fear" (1:19) and "trustworthy" (5:8) are the text's own
words, the second inside Tobit's own speech. No coordinate rests on the content of a prayer or an
instruction: 3:1-6 and 14:3 are cited for the act of saying it, chapter 4's counsel and chapter 13's
prayer are not cited at all, and the almsgiving, the tithes and the refusal of Gentile bread are on
no axis.

## Recount

Placed on **five** axes: pace 30, voice 35, lead 35, reasons 25, plans 30. Conflict is both ends.
He clears the three-axis floor. If an editor later strikes the two thinnest (lead, voice), pace,
reasons and plans still stand on cited acts, so he remains a possible result.

## One structural thing the editor must know before merging

Measured the way the engine measures (only axes both figures are placed on, rescaled to six), the
corrected Tobit sits **15.0 units from Abraham on four shared axes**, 17.3 from Jesus on three and
19.4 from Moses on four. The closest pair already on the roster is Mary Magdalene and Ruth at 15.8,
so Tobit and Abraham become the closest pair. That is what conservative placement from modest acts
produces, and it is not a reason to move a coordinate. What tells the two apart for a reader is
conflict (Abraham 70, Tobit not placed) and plans (Abraham not placed, Tobit 30). Run
`node site/scripts/sim-figures.mjs` after he is added and look at how often the two tie. The
researcher's figure of 33.2 units from Moses was plain distance over all six numbers, which is not
how the engine matches.

He still adds nothing to the scarce right-hand poles. That is the text.

## One plain sentence for the owner

Tobit can go on the list: the book shows him as a man who jumps up and acts, says what he thinks,
checks people before he trusts them and puts his affairs in order, and his page should say first
that his book is in Catholic and Orthodox Bibles and not in Protestant ones.

## The corrected entry

```json
{
  "slug": "tobit",
  "name": "Tobit",
  "who": "Israelite of the tribe of Naphtali carried captive to Nineveh, father of Tobias, blind for eight years",
  "position": {
    "pace": 30,
    "voice": 35,
    "lead": 35,
    "conflict": 45,
    "doubt": 25,
    "plan": 30
  },
  "evidence": {
    "pace": [
      {
        "ref": "Tobit 2:3-4",
        "toward": "left",
        "did": "Told that one of his people had been strangled and cast out in the marketplace, he sprang up before he had tasted anything and took him up into a chamber until sunset.",
        "quote": "Before I had tasted anything, I sprang up"
      },
      {
        "ref": "Tobit 1:19",
        "toward": "left",
        "did": "When he knew that he was being sought to be put to death, he withdrew himself for fear."
      }
    ],
    "voice": [
      {
        "ref": "Tobit 3:1-6",
        "toward": "left",
        "did": "He wept and prayed in his sorrow, and asked that his spirit be taken from him.",
        "quote": "Command my spirit to be taken from me, that I may be released"
      },
      {
        "ref": "Tobit 14:3",
        "toward": "left",
        "did": "Grown very old, he called his son with his son's six sons and told him he was ready to depart out of this life."
      },
      {
        "ref": "Tobit 1:18",
        "toward": "right",
        "did": "He buried privately those whom King Sennacherib killed; the king sought for the bodies and they were not found.",
        "quote": "I buried them privately"
      }
    ],
    "lead": [
      {
        "ref": "Tobit 2:2",
        "toward": "left",
        "did": "Seeing an abundance of meat, he told his son to go and bring whatever poor man of their kindred he could find, and said he would wait for him.",
        "quote": "Behold, I wait for you."
      },
      {
        "ref": "Tobit 5:3",
        "toward": "left",
        "did": "He gave his son the handwriting, told him to seek a man to go with him and said he would give the man wages.",
        "quote": "Seek a man who will go with you, and I will give him wages"
      }
    ],
    "conflict": [
      {
        "ref": "Tobit 2:13",
        "toward": "left",
        "did": "When the kid began to cry in his house, he asked his wife where it had come from and whether it was stolen, and told her to give it back to the owners.",
        "quote": "Where did this kid come from? Is it stolen? Give it back to the owners"
      },
      {
        "ref": "Tobit 5:13",
        "toward": "right",
        "did": "He welcomed the man as a brother and asked him not to be angry that he had sought to know his tribe and family.",
        "quote": "because I sought to know your tribe and family"
      },
      {
        "ref": "Tobit 5:17-22",
        "toward": "right",
        "did": "When his wife wept and asked why he had sent their child away, he told her not to worry and that the boy would return safe and sound, and she stopped weeping.",
        "quote": "So she stopped weeping."
      }
    ],
    "doubt": [
      {
        "ref": "Tobit 5:8",
        "toward": "left",
        "did": "Told that his son had found someone to go with him, he said to call the man to him so that he might know his tribe and whether he was trustworthy.",
        "quote": "Call him to me, that I may know of what tribe he is, and whether he be a trustworthy man to go with you."
      },
      {
        "ref": "Tobit 5:10-11",
        "toward": "left",
        "did": "He asked the man his tribe and family, and when the man answered with a question of his own he said that he wanted to know his kindred and his name.",
        "quote": "I want to know, brother, your kindred and your name."
      },
      {
        "ref": "Tobit 2:14",
        "toward": "left",
        "did": "When his wife said the kid had been given to her as a gift on top of her wages, he did not believe her and asked her to return it to the owners.",
        "quote": "I didn’t believe her, and I asked her to return it to the owners"
      }
    ],
    "plan": [
      {
        "ref": "Tobit 1:14",
        "toward": "left",
        "did": "On a journey into Media he left ten talents of silver in trust with Gabael at Rages."
      },
      {
        "ref": "Tobit 4:1-2",
        "toward": "left",
        "did": "Having asked for death, he remembered the money left in trust and said to himself that he should call his son and explain about it before he died.",
        "quote": "why do I not call my son Tobias, that I may explain to him about the money before I die?"
      },
      {
        "ref": "Tobit 2:1-4",
        "toward": "right",
        "did": "He had sat down to a good dinner at the feast of Pentecost; when news came that one of his people lay strangled in the marketplace he left it untasted and took the man up into a chamber."
      }
    ]
  }
}
```

## Checks run on the corrected entry

    node audit/tools/webbe.mjs --check <entry>     12 of 12 quotations verbatim
    all 16 refs resolve in the WEBBE text on disk (Tobit 2:1-4, 5:10-11 and 5:17-22 opened again)
    1-3 evidence items per axis, every did one sentence, every value a multiple of 5
    the mask bible-figure.ts would derive: shown, shown, shown, both, shown, shown
