# Two new quizzes: blueprint

Both ship as **drafts** (status `draft`, noindex, labelled unaudited) until the owner has played
them and they have had a fairness audit of their own. Both are data for the existing engine, not
new apps.

## What went wrong last time, and the rule that follows from it

The first "Who are you most like?" attempt (the figures deck, shelved) was rejected as "loaded
questions/answers": each option was written backwards from a Bible citation, so it read as
contrived, and a reader could see which answer led to which figure. **The rule now: the statements
know nothing about the Bible.** They are plain things a person can say about themselves, with no
church or Bible vocabulary, no situation borrowed from a story, and no answer that flatters. The
Bible enters only on the OTHER side of the measurement: where each figure sits, which is argued
from cited, recorded acts. A reader answers about themselves; the engine finds the nearest figure;
the result page shows the recorded moments that put that figure there.

Statement rules (both quizzes), checked adversarially before anything is wired:

1. Under 22 words, one claim, first person, present tense, about what the reader DOES or what
   others have SAID of them. Never what they believe about themselves in the abstract.
2. No church or Bible vocabulary in the figure quiz at all. In the gifts quiz, none beyond ordinary
   words a newcomer knows (church, pray, Bible, serve); never "anointing", "burden", "calling",
   "ministry" as jargon.
3. No statement may be answerable only one way by a decent person. If agreeing sounds admirable
   and disagreeing sounds shameful, it is loaded; rewrite it as a real trade-off, where both ends
   cost something and both ends are somebody's strength.
4. Every group needs items keyed in both directions.
5. No statement may point at its own result. A reader must not be able to tell which figure or
   which gift a statement feeds by reading it.
6. Nothing about devotion: not how much someone prays, reads, gives or attends. Count patterns of
   behaviour, never piety.

---

## Quiz one: Who in the Bible are you most like?

- **slug** `bible-figure`, **strategy** the existing bipolar nearest-neighbour strategy the Compass
  uses. Six axes, three statements each, eighteen statements, about three minutes. The axes are
  temperament, not virtue: neither pole is the good one, and the result page says so.
- **The six axes** (fixed by this blueprint; pole names may be polished, meanings may not move):

  | key | left pole | right pole | what it measures |
  |---|---|---|---|
  | pace | Acts first | Weighs first | moves on instinct, or waits until it has been thought through |
  | voice | Says it | Holds it | speaks the thought aloud, or keeps counsel and turns it over |
  | lead | Out in front | Alongside | takes charge of the room, or makes someone else stronger |
  | conflict | Confronts | Reconciles | walks toward the argument, or works to bring the two sides together |
  | doubt | Asks why | Takes it on trust | needs the reason before going on, or goes on and lets the reason come |
  | plan | Plans ahead | Meets the day | prepares and provisions, or responds to what arrives |

  Each axis needs five band adjectives in the engine's format, none flattering, none belittling.

- **The figures** (the quiz's `outcomes`): twenty-two people, at least nine of them women, spread
  across both Testaments and across the space (no axis may have every figure on one side), **and
  Jesus, who is on the list by the owner's decision (2026-09-21): "I want to include our
  Savior."** God the Father, the Holy Spirit, angels and Satan are not figures.
- **How Jesus is included.** By exactly the same rule as everyone else: coordinates argued from
  recorded acts in the Gospels, nothing from outside the text, no virtue words. The Gospels often
  record him at BOTH ends of an axis (he overturns the tables, and he restores Peter; he acts at
  once to heal, and he prays all night before choosing the Twelve), so evidence items carry a
  `toward` field (left or right) for every figure, and a coordinate near the middle may be there
  because the text shows both, which the page must say, as distinct from "the text does not show
  this". His page and his result card carry one plain, reverent sentence, the same every time:
  landing nearest Jesus here is about temperament as the Gospels record it, not a measure of
  holiness, and every Christian is called to be like him in character whatever their temperament.
- **No percentages against a person.** The site's standing rule kills any person-to-saint or
  person-to-person percentage, and "84% like Jesus" is the clearest case of why. For this quiz the
  outcome cards rank the nearest figures ("Closest", then the next four in order) with bar length
  only and NO printed percentage, on the result page, the figure pages and the share card. The
  Compass keeps its percentages against traditions exactly as they are.
- **Every coordinate is an argument from the text.** For each figure and each axis: a value from 0
  to 100 and one to three cited, recorded acts that justify it, each as a reference plus one
  neutral sentence describing what the person DID (not a quotation, unless it is verbatim from the
  World English Bible British Edition on disk and marked as such). Where the text shows nothing on
  an axis, the value is 50 and the evidence says "the text does not show this", which is an honest
  answer and keeps the figure off that axis's rails.
- A figure's coordinate may never rest on a virtue judgement ("brave", "faithful") or on tradition
  outside the text. It rests on acts: stepped out of the boat, inspected the walls by night, kept
  these things in her heart, brought his brother.
- **Figure pages** at `/figure/<slug>/` (a new route; the engine gains a per-quiz outcome path so
  `/tradition/` stays the Compass's): the band, the figure's compass and rails, the cited moments
  grouped by axis, the nearest other figures, and the way into the quiz. These are the indexable
  by-product ("What was Peter like?").
- The result page must stop assuming traditions: its outcome heading, its scope note and the
  compare page's wording are parameterised by the quiz (an `outcomeNoun`, a scope note, an
  outcome path), with the Compass's existing words kept exactly as they are.

## Quiz two: What are your spiritual gifts?

- **slug** `spiritual-gifts`, **strategy** the existing highest-category strategy the seven deadly
  sins draft uses. Three statements per gift, one of them reverse-keyed.
- **The honest frame, printed on the intro and the result:** Scripture gives lists of gifts and no
  test for them. Gifts are given "for the common good" and are recognised in service and by other
  people over time. This is a conversation starter to take to people who know you, not a verdict.
- **The gifts in this draft** are the ones that show up as patterns of ordinary service and speech,
  each named and defined in the words of the passage that lists it (quoted verbatim from the World
  English Bible British Edition on disk, with the reference):
  serving, teaching, encouraging, giving, leading, showing mercy (Romans 12:6-8); helping and
  administration (1 Corinthians 12:28); wisdom, discernment and faith (1 Corinthians 12:8-10);
  evangelism and shepherding (Ephesians 4:11); hospitality (1 Peter 4:9-10). Where two lists name
  what is plainly one thing (serving and helping), they are one category citing both.
- **Deliberately not in this draft, and said so on the page:** prophecy, healing, miracles, tongues
  and their interpretation. Christians disagree about whether and how these continue (the
  Compass's own Gifts axis), a self-report cannot fairly measure them, and the owner has not yet
  decided how to include them without taking a side. The page must not imply they are lesser or
  that they have ceased. This is an open decision for the owner, flagged in the draft note.
- Each gift's page reuses the existing `/axis/<quiz>/<group>/` route: the passage, what it has
  looked like in the recorded life of the early church (cited acts only, from Acts and the letters),
  and nothing invented.

## How these get built

Two independent drafts of the statements per quiz, from different angles. Two adversarial critics
per quiz: one hunting loaded, flattering, leading and result-revealing items; one hunting jargon,
double claims, unclear wording and anything over 22 words, reading as a newcomer. The figure
roster is researched separately and every citation is checked against the Bible text on disk by
an adversarial verifier ("does this verse really show that act?"). An editor then writes the final
data files from the drafts and critiques, and an engineer wires routes and tests. Both quizzes stay
`draft` until the owner has played them.
