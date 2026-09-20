# Who in the Bible are you most like? — statement draft B

**Angle: what other people notice.** Every statement here is sourced from the outside — what
the reader is told, teased for, asked to do, or seen doing when a day goes wrong. People
describe their own temperament most honestly through its costs, and a borrowed voice ("people
have told me…") is much harder to answer aspirationally than "I am the kind of person who…".

Draft only. Thirty-six candidates for eighteen slots, six per axis, three keyed each way.
Nothing here is wired to anything; the critics and the editor choose.

## The sign convention, confirmed from the Compass data

From `site/src/lib/strategies/bipolar.ts`, `score()`:

```
raw[item.group] += item.direction * (sheet[i] ?? 0);   //  answers run -2 .. +2
value            = round(((raw + span) / (span * 2)) * 100);   //  0 = LEFT pole, 100 = RIGHT pole
```

So a **`direction` of `-1` means agreement moves the reader toward the group’s LEFT pole**
(score down), and **`+1` moves them toward the RIGHT pole** (score up). Checked against the
audited data: statement 1 of the Compass is `grace`, `direction: -1`, and reads "God’s choice
of who will be saved is not based on anything he foresaw they would do" — monergism, and
`Monergist` is the `left` pole of `grace`. Confirmed.

`bands` follows the same order: `bands[0]` describes the left pole, `bands[4]` the right,
`bands[2]` the middle band where the instrument names no position.

Axis keys and pole names below are the blueprint’s, unchanged.

## `pace` — Acts first (left, `-1`) ↔ Weighs first (right, `+1`)

*Measures: moves on instinct, or waits until it has been thought through.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B1 | `pace` | `-1` | left — Acts first | I am teased for booking things the same day I first hear about them. | 14 | Agreeing admits impulsiveness; disagreeing admits nothing worse than caution. The tease frame keeps it affectionate rather than an accusation, and the same habit is what gets a trip to actually happen. |
| B2 | `pace` | `-1` | left — Acts first | People have told me I jumped in before I had the whole picture. | 13 | A real complaint others make, but "the whole picture" is rarely available; readers who act early and readers who were simply wrong once both recognise it. Disagreeing is not a boast. |
| B3 | `pace` | `-1` | left — Acts first | In a crisis I am already moving, and people around me have to catch up. | 15 | Paired word for word in cost with its opposite below: both poles inconvenience somebody under pressure. Moving early is named without calling the others slow. |
| B4 | `pace` | `+1` | right — Weighs first | Friends tease me for researching a small purchase for weeks before I make it. | 14 | "Small" is doing the work: it marks the habit as disproportionate, so agreeing is not a claim to be thorough. Disagreeing is not a claim to be decisive either. |
| B5 | `pace` | `+1` | right — Weighs first | People have told me I take too long to decide, even about small things. | 14 | The mirror of the jumping-in item, with the same borrowed-voice framing, so neither pole gets the flattering grammar. |
| B6 | `pace` | `+1` | right — Weighs first | Under pressure I slow down, and people waiting on me find that hard. | 13 | Explicitly carries a cost to others, exactly as its opposite does. Slowing under pressure is a genuine strength in some rooms and a genuine liability in others. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['acts first', 'quick to move', 'between acting and weighing', 'takes time to decide', 'weighs first']
```

Neither end is the competent one: "quick to move" costs accuracy, "takes time to decide" costs the moment. The middle says both are visible, not that nothing is.

## `voice` — Says it (left, `-1`) ↔ Holds it (right, `+1`)

*Measures: speaks the thought aloud, or keeps counsel and turns it over.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B7 | `voice` | `-1` | left — Says it | People can always tell what I am thinking, because I have already said it. | 14 | Readable as either transparency or no filter, depending on who is reading. Nothing in the wording chooses. |
| B8 | `voice` | `-1` | left — Says it | I am teased for working a problem out loud instead of in my head. | 14 | A workplace fact, not a fault. Agreeing costs a little dignity; disagreeing costs nothing and claims nothing. |
| B9 | `voice` | `-1` | left — Says it | What goes wrong for me is saying something in the moment that I later regret. | 15 | Unflattering, and deliberately matched by an equally unflattering item on the other pole, so the axis stays symmetrical in cost. Almost everyone can agree a little, which is what keeps it from splitting the room morally. |
| B10 | `voice` | `+1` | right — Holds it | People say they cannot tell what I am thinking until long afterwards. | 12 | The mirror of the transparency item. Reads as composure to some and as a wall to others; the statement does not decide which. |
| B11 | `voice` | `+1` | right — Holds it | I am teased for sitting through a whole conversation without joining in. | 12 | Same tease construction as its opposite. Being quiet in a group is not framed as depth, and talking is not framed as noise. |
| B12 | `voice` | `+1` | right — Holds it | What goes wrong for me is holding a concern until it is too late to raise it. | 17 | The exact counterweight to the regret item: one pole pays for speaking, the other for not speaking, at the same volume. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['says it', 'quick to speak up', 'between speaking and holding back', 'slow to speak up', 'holds it']
```

"Quick" and "slow to speak up" are the same construction with the sign flipped, so neither reads as the virtue. No band uses "outspoken", "reserved" or "guarded", which all carry a verdict.

## `lead` — Out in front (left, `-1`) ↔ Alongside (right, `+1`)

*Measures: takes charge of the room, or makes someone else stronger.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B13 | `lead` | `-1` | left — Out in front | I have been told I take over a group without being asked to. | 13 | A named complaint, but one that only lands on people who do in fact fill a vacuum. Disagreeing is ordinary, not meek. |
| B14 | `lead` | `-1` | left — Out in front | I am teased for reorganising other people’s plans within minutes of hearing them. | 13 | The comic version of the same instinct. Agreeing is not a claim to be better organised, because "other people’s" marks it as intrusion. |
| B15 | `lead` | `-1` | left — Out in front | When something stalls, I step forward and start giving directions. | 10 | Flatly descriptive of an action under pressure. "Giving directions" is neither praised nor mocked, and its opposite below is equally plain. |
| B16 | `lead` | `+1` | right — Alongside | I have been told I hang back when the room needs somebody to decide. | 14 | The strongest cost item on this pole, put there on purpose: without it "alongside" would be the nice answer. This is the sentence that makes the axis a real trade-off. |
| B17 | `lead` | `+1` | right — Alongside | I am teased for asking everyone’s view when the decision is already mine. | 13 | Consultation as a cost, not a virtue. Prevents the right pole from being read as humility. |
| B18 | `lead` | `+1` | right — Alongside | In a crisis I end up beside one person rather than in front of the room. | 16 | Mirrors the step-forward item in structure and in length. Both are choices about where you physically go, and the room pays a price either way. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['out in front', 'quick to take charge', 'between leading and coming alongside', 'more alongside than in front', 'alongside']
```

The blueprint’s own gloss for the right pole ("makes someone else stronger") is warmer than the left’s, so the bands deliberately do not repeat it. "Alongside" is positional, not moral.

## `conflict` — Confronts (left, `-1`) ↔ Reconciles (right, `+1`)

*Measures: walks toward the argument, or works to bring the two sides together.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B19 | `conflict` | `-1` | left — Confronts | I have been told I raise things other people would have let go. | 13 | Heard as courage by some and as trouble by others, with no cue which is meant. Both readings are in the room when anyone says this sentence out loud. |
| B20 | `conflict` | `-1` | left — Confronts | I am teased for turning a small disagreement into a conversation nobody wanted. | 13 | "Nobody wanted" is the cost, stated plainly, so agreeing cannot be mistaken for claiming integrity. |
| B21 | `conflict` | `-1` | left — Confronts | What goes wrong for me is pressing a point until the other person shuts down. | 15 | The clearest cost on the left pole. It is answered in kind by the resentment item opposite, so neither pole is the safe answer. |
| B22 | `conflict` | `+1` | right — Reconciles | People bring me their side of an argument and expect me to take it to the other person. | 18 | What others do to you, not what you claim about yourself. Being used as a channel is as much a burden as a compliment. |
| B23 | `conflict` | `+1` | right — Reconciles | I am teased for calming an argument before anyone has finished making their point. | 14 | Names the actual failure mode of early peacemaking — cutting people off — so the right pole is not the admirable one. |
| B24 | `conflict` | `+1` | right — Reconciles | What goes wrong for me is agreeing to keep the peace and resenting it later. | 15 | Deliberately as unflattering as the pressing-a-point item. This pairing is what stops the axis becoming virtue versus vice. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['confronts', 'quick to raise it', 'between raising it and settling it', 'slow to raise it', 'reconciles']
```

"Reconciles" is the most flattering pole word in the whole quiz, so its bands stay behavioural ("slow to raise it") and never reach for "peacemaker", which would tip the axis.

## `doubt` — Asks why (left, `-1`) ↔ Takes it on trust (right, `+1`)

*Measures: needs the reason before going on, or goes on and lets the reason come.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B25 | `doubt` | `-1` | left — Asks why | People have called me hard to convince, even when they turned out to be right. | 15 | The concession clause ("turned out to be right") is the cost, and it is what stops the item reading as a compliment to rigour. |
| B26 | `doubt` | `-1` | left — Asks why | I am teased for wanting the reasoning behind an instruction before I follow it. | 14 | Everyday and workplace-shaped, with no church or Bible frame. Agreeing is not principled and disagreeing is not compliant; both are just how people are at work. |
| B27 | `doubt` | `-1` | left — Asks why | What goes wrong for me is stalling a plan until I am satisfied it makes sense. | 16 | Names a real delivery cost. Balanced by the equally unflattering "asked questions" item opposite. |
| B28 | `doubt` | `+1` | right — Takes it on trust | People have told me I go along with things without checking them first. | 13 | Blunt about the cost, so the right pole cannot be heard as the faithful answer — which is exactly the failure this axis is most at risk of. |
| B29 | `doubt` | `+1` | right — Takes it on trust | I am teased for starting a job before I understand why it is being done. | 15 | Mirror of the instruction item. Starting early is a strength on a deadline and a liability on the wrong job; neither is signalled. |
| B30 | `doubt` | `+1` | right — Takes it on trust | What goes wrong for me is finding out late that I should have asked questions. | 15 | The counterweight to stalling. One pole pays in delay, the other in rework, and the statements charge them the same. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['asks why', 'quick to question', 'between questioning and accepting', 'slow to question', 'takes it on trust']
```

No band uses "sceptical", "credulous", "trusting" or anything from the religious register. The whole axis is kept in the vocabulary of instructions, plans and jobs.

## `plan` — Plans ahead (left, `-1`) ↔ Meets the day (right, `+1`)

*Measures: prepares and provisions, or responds to what arrives.*

| # | key | dir | toward | text | words | the trade-off that keeps it honest |
|---|---|---|---|---|---|---|
| B31 | `plan` | `-1` | left — Plans ahead | People tease me for the lists I keep and the spares I carry around. | 14 | Affectionate mockery, which is how this trait is actually talked about. Agreeing costs a little; disagreeing costs nothing. |
| B32 | `plan` | `-1` | left — Plans ahead | I have been told I book too far ahead and leave no room for anything else. | 16 | The genuine cost of planning — crowding other people out — stated as their complaint, not as self-criticism. |
| B33 | `plan` | `-1` | left — Plans ahead | When something goes wrong, I am usually the one who brought what is needed. | 14 | The strength of this pole, matched one for one by the strength of the other pole below, so the axis does not end up with all the costs on one side. |
| B34 | `plan` | `+1` | right — Meets the day | People tease me for turning up without having checked the time or the address. | 14 | Same tease construction as the lists item. A recognisable, forgivable failure rather than a character charge. |
| B35 | `plan` | `+1` | right — Meets the day | I have been told I leave everything until the last possible minute. | 12 | Left bare, with no "and somehow it works" rescue clause, because that clause would have made the item a boast. |
| B36 | `plan` | `+1` | right — Meets the day | When a day goes sideways, people say I am the one least bothered. | 13 | The mirror strength of bringing what is needed. Both poles get exactly one item that others would call an asset. |

**Band adjectives** (left → right, five, for `QuizGroup.bands`):

```ts
bands: ['plans ahead', 'likes a plan', 'between planning and improvising', 'light on planning', 'meets the day']
```

"Light on planning" rather than "disorganised", and "likes a plan" rather than "prepared". Both ends describe a habit, and neither implies competence.

## Self-check against the six statement rules

| rule | how this draft stands |
|---|---|
| 1. Under 22 words, one claim, first person, present tense, about what I DO or what others have SAID | Longest is 18 words (0 at or over 22). Every item is first person with a present-tense main verb ("I am teased", "people have told me", "what goes wrong for me is"); past tense appears only inside a reported clause. Six items carry a consequence clause ("and people around me have to catch up", "until the other person shuts down") — that clause is the cost of the same single behaviour, not a second claim, but it is the thing a critic should push on first, and they are listed below. |
| 2. No church or Bible vocabulary at all | Zero hits on a religious-register word list (church, pray, Bible, Scripture, faith, calling, ministry, burden, anointing, and the rest). The whole instrument lives in the vocabulary of jobs, plans, groups, arguments and trips. Note the `doubt` axis was the danger: "takes it on trust" could have pulled the word *faith* in. It never appears — the items talk about instructions, jobs and checking. |
| 3. No statement answerable only one way by a decent person | Each pole of each axis carries the same kind of cost as the other: one pole pays for speaking, the other for not speaking; one for pressing a point, the other for resenting a truce; one for delay, the other for rework. `lead` and `conflict` were the two axes where the right pole ("alongside", "reconciles") would have been the obviously nice answer, so each of those poles gets blunt cost items (B16, B17, B23, B24) written specifically to remove that. The `doubt` right pole had the same problem for a different reason, and B28 is the answer to it. |
| 4. Every group keyed in both directions | `pace` 3/3, `voice` 3/3, `lead` 3/3, `conflict` 3/3, `doubt` 3/3, `plan` 3/3 (−1/+1). |
| 5. No statement points at its own result | No item names, paraphrases or borrows a situation from any story, and none contains a detail distinctive enough to map to one figure. The Bible enters only on the other side of the measurement, where the figures’ coordinates are argued from cited acts. A reader cannot work out which figure any item feeds, because the items do not know. |
| 6. Nothing about devotion | No item mentions praying, reading, giving, attending or any practice. All thirty-six count patterns of behaviour. |

## Where I would push if I were the critic

- **The consequence clauses.** B3, B6, B20, B21, B24 and B32 each end with what the behaviour
  does to other people. I think that is one claim plus its cost, and it is the whole point of
  the angle, but it is the closest this draft comes to a double claim.
- **The "what goes wrong for me is…" stem** carries six items — B9, B12, B21, B24, B27, B30.
  It is the most honest stem in the draft and also the most repetitive; if the editor takes
  three of them into the final eighteen, the quiz will start to sound like a complaint. Two is
  probably the ceiling.
- **B16 ("I have been told I hang back when the room needs somebody to decide")** is the
  harshest item here. It is deliberate — without it `lead` is virtue versus vice — but if a
  reader finds any item shaming, it is this one. The alternate is "I have been told I wait for
  someone else to start" (11 words), softer and weaker.
- **B14 ("reorganising other people’s plans")** and **B32 ("book too far ahead and leave no
  room for anything else")** both describe imposing on other people’s arrangements. If `lead`
  and `plan` each keep their item, the two axes may correlate more than they should.
- **`plan` almost shipped lopsided.** An earlier B33 was "When a plan changes late, people can
  see it throws me", which gave the left pole three costs against the right pole’s two. It was
  replaced with the brought-what-is-needed item so each pole carries exactly one thing others
  would call an asset. Worth re-checking after the editor cuts to three.
- **Held back as alternates**, all under 22 words and all on-angle:
  "People tease me for the lists I keep and the spare everything I carry" (`plan`, −1);
  "I have been told I leave everything until the last minute and somehow it works" (`plan`,
  +1 — rejected: the rescue clause makes it a boast); "In a crisis I am the one already moving
  while others are still talking" (`pace`, −1 — rejected: "still talking" belittles the other
  pole); "I am teased for doing the quiet jobs nobody notices" (`lead`, +1 — rejected: reads as
  humility, which is flattery).

## One note for the editor, not for the statements

Jesus is on the figure roster by the owner’s decision. Nothing in this draft needs to change
for that — and that is the point: these thirty-six statements describe a reader’s temperament
with no Bible content in them at all, so no item can flatter, prompt or steer a reader toward
or away from him. Everything that makes his inclusion careful — coordinates argued only from
recorded acts, the `toward` field on evidence where the Gospels show both ends, the middle
value that means "the text shows both" rather than "the text is silent", the standing ban on
printing a percentage against a person, and the one plain reverent sentence on his card — lives
on the roster and result side of the measurement, which is where the blueprint puts it.
