# Adversarial critique — LOADEDNESS AND FAIRNESS — "What are your spiritual gifts?"

Targets: `gifts-statements-A.md` (65 candidates), `gifts-statements-B.md` (65 candidates), plus
Draft B's honest-frame copy. Every candidate gets **keep / fix / kill**. Rewrites are under 22 words
and word-counted.

Checked against: `QUIZ-BLUEPRINTS.md` (binding, rules 1–6), `site/src/lib/engine/types.ts`,
`site/src/lib/strategies/category.ts`, `site/src/lib/quizzes/seven-deadly-sins.ts`,
`site/src/data/compass.json` (house voice), and every quotation and cited act against
`demos/sounds-like-scripture/work/verses-all.json` with `src: "webbe"`.

*(On the owner's instruction of 2026-09-21, "Don't leave Jesus off the list. I want to include our
Savior": that governs the figure quiz's roster, where `QUIZ-BLUEPRINTS.md` already places him.
A gifts result names a gift, never a person, so nothing in this critique touches that roster, and
nothing below should be read as narrowing it.)*

---

## 1. Verdict

**Draft B is the better instrument and should be the base; Draft A should be mined, not merged.**
The difference is structural, not a matter of taste. Draft A puts the cost of each answer in an
*"Either way"* note beside the statement — a note the reader never sees. Draft B more often puts the
cost **inside the sentence the reader actually answers** ("even when they only wanted the short
answer", "and I usually say yes", "rather than keep to the numbers I planned for"). Rule 3 is a rule
about the statement, not about the commentary, so A satisfies it in the document and fails it on the
page. Thirty-one of my thirty-nine picks come from B for that reason alone.

Counted: **A — 44 keep, 18 fix, 3 kill. B — 55 keep, 10 fix, 0 kill.**

Nothing in either draft is a rule 6 violation. Neither draft counts prayer, reading, attendance or
church giving, and the `giving` category survives — Draft A's note 3 was right to worry and right to
resolve it the way it did. The real fairness danger in this quiz is **not in the statements at all**;
it is in the frame and the share card (§3.1, §3.2, §5).

---

## 2. Source verification

**Every quotation in Draft A is verbatim WEBBE, character for character.** Verified: Romans 12:7,
Romans 12:8, 1 Corinthians 12:8, 12:9, 12:10, 12:28, Ephesians 4:11, 1 Peter 4:9–10. Draft B quotes
nothing (deliberate, its §4.6), so **the editor must take the quote block from Draft A, not from
memory** — A's is clean and ready.

**Every cited act in Draft A is in the text it is cited to.** Acts 6:1–6, Romans 16:1–2, Acts
18:24–26, Acts 11:25–26, Acts 4:34–35, 4:36–37, 15:30–32, 2 Corinthians 8:1–5, Acts 15:13–21, Acts
9:36–39, 2 Timothy 1:16–18, Titus 1:5, 2 Corinthians 8:18–21, Acts 6:9–10, 27:9–11, 16:16–18,
8:20–23, 27:21–25, 14:8–10, 8:5–8, 8:26–35, 21:8, 20:28–31, 1 Peter 5:1–3, Acts 16:14–15, Romans
16:23, Acts 18:2–3. Four corrections, all small:

1. **Leading, Acts 15:13–21.** The sentence says the assembly "sent that decision out in a letter",
   but the letter is 15:22–29, outside the cited range. Extend to **Acts 15:13–29** or drop the clause.
2. **Discernment, Acts 16:16–18.** "A slave girl" — WEBBE says "a certain girl having a spirit of
   divination" who "brought her masters much gain". Slavery is implied by "masters"; the word is not
   on the page. Write it as the text does: *a girl with a spirit of divination, whose masters made
   money from her fortune telling*. Separately, this is a **weak proof text for discernment**: WEBBE
   records Paul as "becoming greatly annoyed", not as perceiving anything the others missed. **Acts
   8:20–23** (Peter naming what he saw in Simon) carries the category on its own; cut Acts 16.
3. **Wisdom, Acts 27:9–11.** "Told the ship's company" — the text has Paul admonishing "them",
   i.e. those aboard. Harmless, but "said to those on board" is what the page can defend.
4. **Shepherding, Acts 20:28–31.** The three years of admonishing were "night and day **with
   tears**". Including it costs nothing and is the text.

**Vocabulary check against the file.** WEBBE 1 Corinthians 12:10 reads "different kinds of
**languages**" and "the interpretation of **languages**", and 12:9 reads "gifts of **healings**".
Draft B's omitted-gifts sentence says "tongues and their interpretation" and "healing". On a site
that quotes this file verbatim beside it, that is a mismatch a reader can catch. Use the file's words
in the sentence, or name both: *tongues (WEBBE: "different kinds of languages")*.

---

## 3. Seven structural findings, in order of how much damage they do

### 3.1 The result page will tell a reader they "leaned away" from mercy, and hand them a share button

This is the most serious fairness problem in the build and no statement rewrite touches it.

`category.ts` sets `below: value < 50` and `pull()` returns **`'leaned away'`** for any score under
50. `shareText()` then prints **all thirteen categories** as eleven-cell bars in rank order, so the
last line of a shared card is the reader publicly naming their weakest gift. With category names
like *mercy*, *giving*, *hospitality* and *faith*, the artifact the site generates reads:
"░░░░░░░░░░░ mercy".

Worse, the blueprint requires each gift to be defined in its passage's own verbatim words, and the
hospitality passage on disk is a **command to everybody**: *"Be hospitable to one another without
grumbling"* (1 Peter 4:9, WEBBE). Printing "you leaned away from hospitality" next to that is a
self-inflicted wound, and it is exactly the sort of thing a discernment-minded audience screenshots.

Required, before this quiz is playable:

- **The share card for this quiz shows the top three only**, never the full ranking and never the
  bottom. (Engineering ask; the Compass's card is unchanged.)
- **`below`/"leaned away" must not print for a gift** in this quiz, or must print with a fixed
  sentence that says what it means: the statements did not find this pattern **in you**, and the
  lists command several of these of every Christian whether or not they are anyone's gift.
- The blueprint already licenses this shape of sentence — it is the same move as the reverent
  standing line for Jesus in the figure quiz. Use it here.

### 3.2 The `flat` state currently reads "you have no gifts"

With thirteen categories, `nothingNamed()` will rarely fire — but when it does, `category.ts`
prints **"No single one stands out"** and **"Nothing here rose far enough above the rest to name
one, so none is named."** That is correct and harmless for the seven vices. For gifts it lands as a
verdict of spiritual emptiness.

The fix needs no invention, because the passage the blueprint already requires says the opposite:
*"As each has received a gift, employ it in serving one another"* (1 Peter 4:10, WEBBE, verified on
disk). The flat-state copy for this quiz should carry that clause and then say plainly that
thirty-nine statements found no pattern, which is a fact about the statements.

### 3.3 Two categories do not measure what their passage names

- **`discernment`.** WEBBE 1 Corinthians 12:10 says **"discerning of spirits"**. Every candidate in
  both drafts measures ordinary shrewdness about people and offers — being hard to sell to, spotting
  a bad room, vetting a person. That is a different thing, and shortening the passage's phrase to
  "discernment" is what hides the gap. Either rename the category to what the statements measure, or
  keep the passage's full phrase and say on the gift page, in one line, what the passage names and
  what these statements can and cannot see. **Do not quietly let one stand for the other.**
- **`faith`.** 1 Corinthians 12:9 lists faith between wisdom/knowledge and healings; it is plainly
  not saving faith. Both drafts measure risk tolerance — committing before the money is there,
  starting without a back-up plan. Draft B flagged the misread (its §4.4) and is right that the gift
  page needs a first line saying this is not about whether you believe. That line is **not enough on
  its own**, because `shareText()` prints the bare word `faith` with a bar and no gloss. Either the
  share card carries a one-line footer for this quiz, or `faith` comes out of the draft.

### 3.4 Cross-quiz collision with the figure quiz

Three gift categories measure the same reader behaviour the figure quiz measures as *temperament*:

| gifts item | figure-quiz axis it re-measures |
|---|---|
| `faith` +1 "commit before I can see how they will be paid for" | `plan` — Plans ahead / Meets the day |
| `discernment` −1 "I take people at their word" | `doubt` — Asks why / Takes it on trust |
| `leading` +1 "when a group stalls, I say what we do next" | `pace` / `lead` |

The blueprint says the figure axes "are temperament, not virtue: neither pole is the good one". If
the same sentence is temperament in one quiz and a gift of the Spirit in the other, a reader who
takes both will notice. This does not block the draft, but the editor should not let the two quizzes
ship with near-identical sentences. Where possible, keep the gifts items on *service* (what others
bring you, what you end up doing for people) and leave *disposition* to the figure quiz.

### 3.5 Six statements measure circumstance, not gift

- **Housing.** A-HSP-1 ("My home gets used by other people most weeks"), A-HSP-2 ("offer someone a
  bed"), B-HSP-2 ("People end up staying at my place when they have nowhere else to go") require a
  home the reader controls and a spare room. A student, a lodger, someone living with parents or in
  care scores low on hospitality for reasons that are not about them.
- **Income.** A-GIV-1 ("I move money before I think it through") and A-GIV-2 ("A chunk of what I
  earn") measure disposable income. B-GIV-1's guard — *"and I have it"* — is the right pattern and
  should be applied to every money item. Note the cited act cuts the other way: the Macedonians gave
  "in a severe ordeal of affliction ... deep poverty" (2 Corinthians 8:2, WEBBE), so an instrument
  that scores generosity by capacity contradicts its own proof text.
- **Health and capacity.** About a third of B's reverse items are *drain* reports — "wears me out",
  "leaves me drained", "needing the next day to myself", "more than I can manage". Any one is fine;
  as a house style it means a chronically ill or exhausted reader agrees with every reverse item in
  the quiz and lands flat across the board. **Cap it at one drain item per gift, and never as a
  gift's only reverse-keyed statement.** My best-three list in §6 enforces this.

### 3.6 Rule 5 is unachievable here, and three categories make it dangerous rather than merely leaky

Both drafters conceded rule 5 (no statement points at its own result) cannot hold for thirteen named
gifts. They are right, and the concession is honest. But the severity is not uniform: **reveal is
only a problem where the category is desirable.** Nobody games their way into *administration*.
Readers will game their way into **wisdom, discernment and leading**, which are the three transparent
*and* flattering blocks.

So the mitigation is not "make them opaque" — it is "make them cost something". A-WIS-2 ("I can
usually name the real question"), A-WIS-3 ("the one thing that helps") and A-DSC-1 ("I can tell early
when something is off") are transparent **and** self-praising, which is the combination that turns a
measurement into a vote. All three are fixed below.

A general rule that fell out of this pass and is worth keeping: **"I can tell" asserts being right.**
Replace it with "I decide" or "I judge" — the statement then reports the behaviour without granting
the reader a hit rate.

### 3.7 The mercy / shepherding boundary is not carried by the words

Draft A assigns *"I keep in touch with the person everyone else has quietly stopped calling"* to
**mercy** (A-MCY-3). Draft B assigns the near-identical *"I notice when somebody has stopped turning
up, and I get in touch"* to **shepherding** (B-SHP-2). Two independent drafters, working from
definitions, put the same behaviour in different categories. That is proof the boundary lives in the
definition documents, not in the sentence — and the reader never sees the definition documents.

Resolution: the behaviour is **shepherding** (staying with the same people over time). A-MCY-3 is
killed. Mercy is then carried by *presence in acute distress* (B-MCY-2, B-MCY-3), which is the
passage's "he who shows mercy" and is genuinely distinct.

Other overlaps, all survivable, listed so the editor can watch them: `serving` −1 vs `mercy`
(sitting and talking); `administration` −1 vs `serving` (starting the work); `administration` +3
(numbers) vs `discernment` (people) — distinct enough; `wisdom` +2 vs `discernment` +2, the closest
surviving pair in my final 39, both "people ask me" but one about choices and one about vetting.

Where this becomes a scoring bug rather than a smell is **contrastive phrasing**. A-ENC-3 ("I will
push a friend to do the hard thing, **not just sympathise** with them") makes agreement raise
`encouraging` while the sentence simultaneously disparages `mercy` — and "just sympathise" belittles
a rival category, which the site's own band-adjective rule forbids. Fixed below.

---

## 4. Every candidate

### Draft A

#### serving

| id | dir | verdict | why |
|---|---|---|---|
| G-SRV-1 | +1 | **keep** | Behaviour, no virtue word; "before anyone assigns it" reads as jumping in as easily as as diligence. |
| G-SRV-2 | +1 | **fix** | Two problems. "Stack chairs … the meeting about them" assumes a hall with movable chairs (low-church, chairs-in-rows); a parish with fixed pews has none. And meeting-bashing is agreed with by nearly everyone, so it measures nothing. → *"I would rather do the practical job myself than spend the time deciding how it should be done."* (18) |
| G-SRV-3 | +1 | **keep** | Concrete, countable, no adjective. |
| G-SRV-4 | −1 | **keep** | Best reverse in either draft's serving block: deference to competence is a behaviour, not a feeling. |
| G-SRV-5 | −1 | **keep** | Clean. "Go home" mildly assumes paid employment; tolerable. |

#### teaching

| id | dir | verdict | why |
|---|---|---|---|
| G-TCH-1 | +1 | **keep** | Reported by others; cost implicit (you are the remedial explainer). |
| G-TCH-2 | +1 | **keep** | 18 words, one claim, concrete. |
| G-TCH-3 | +1 | **keep** | Cost is in the sentence — "even in a casual conversation" admits you lecture your friends. Model item. |
| G-TCH-4 | −1 | **keep** | Duplicate of B-TCH-5; keep one copy. |
| G-TCH-5 | −1 | **fix** | Rule 1: this reports a *belief about other people*, not a behaviour. → *"I leave people to work things out themselves rather than offer to explain."* (13) |

#### encouraging

| id | dir | verdict | why |
|---|---|---|---|
| G-ENC-1 | +1 | **keep** | One behaviour, two clauses. Fine. |
| G-ENC-2 | +1 | **keep** | A report of an effect, not a self-assessment. Mildly warm but answerable either way. |
| G-ENC-3 | +1 | **fix** | Contrastive double-load (§3.7), and "just sympathise" belittles `mercy`. → *"When a friend is stuck, I push them to move even if they are not ready."* (16) |
| G-ENC-4 | −1 | **fix** | Rule 1 again: an assumption, not an act. → *"I rarely say out loud what I think of someone's work or their chances."* (14) |
| G-ENC-5 | −1 | **keep** | Genuine trade-off, both ends defensible. |

#### giving

| id | dir | verdict | why |
|---|---|---|---|
| G-GIV-1 | +1 | **fix** | No capacity guard — measures disposable income (§3.5). → *"When someone is short and I have it, I move the money before thinking it through."* (16) |
| G-GIV-2 | +1 | **fix** | "What I earn" excludes students, carers, the retired and the unwaged. → *"Some of what I have is already promised to other people's needs before I spend it."* (16) |
| G-GIV-3 | +1 | **keep** | "Upgrade something of my own" is concrete and the trade-off is real. |
| G-GIV-4 | −1 | **keep** | Prudence stated without apology; disagreeing is not shameful. |
| G-GIV-5 | −1 | **fix** | Rule 1: two claims (cautious with money; prefer time). → *"I would rather help someone with my time than with my money."* (11) Duplicates B-GIV-4; keep one. |

#### leading

| id | dir | verdict | why |
|---|---|---|---|
| G-LED-1 | +1 | **keep** | Duplicate of B-LED-1; keep one. |
| G-LED-2 | +1 | **keep** | Reported, and the cost (you took over someone else's meeting) is in the sentence. |
| G-LED-3 | +1 | **fix** | "I take responsibility" is a virtue phrase — nobody answers "I dodge responsibility". → *"I end up answering for results that other people produced."* (9) |
| G-LED-4 | −1 | **keep** | Ten words, clean forced choice. |
| G-LED-5 | −1 | **keep** | Behavioural reverse, not a feeling. Preferred over B-LED-5. |

#### mercy

| id | dir | verdict | why |
|---|---|---|---|
| G-MCY-1 | +1 | **fix** | Flattery: agreeing is admirable, disagreeing is "I leave people in their worst moment". Cost lives only in the note. → *"I stay with people in the worst part, even when I have nothing useful to offer."* (16) B-MCY-2 does this job better; prefer it. |
| G-MCY-2 | +1 | **fix** | A three-item list, and "a mess someone made themselves" passes judgement on the other person inside the reader's own sentence. → *"Illness and grief in a room do not make me want to be elsewhere."* (14) |
| G-MCY-3 | +1 | **kill** | The head-on collision with B-SHP-2 (§3.7). This behaviour is shepherding. Also flattering — agreeing makes you the last loyal friend. |
| G-MCY-4 | −1 | **keep** | Cost in the sentence; both ends are somebody's strength. Duplicate of B-MCY-4. |
| G-MCY-5 | −1 | **keep** | Behaviour, not a drain report. |

#### administration

| id | dir | verdict | why |
|---|---|---|---|
| G-ADM-1 | +1 | **fix** | A stacked three-part list. Transparency is tolerable here (§3.6 — nobody games their way into admin) but the sentence should be one thing. → *"I am the one who ends up writing down who is doing what, and when."* (14) |
| G-ADM-2 | +1 | **keep** | "Bothers me **until I fix it**" — the behaviour rescues the feeling. |
| G-ADM-3 | +1 | **keep** | Reported; the cost (being the bottleneck) is real and visible. |
| G-ADM-4 | −1 | **keep** | Measures something independent rather than negating +1. Best admin reverse in either draft. |
| G-ADM-5 | −1 | **fix** | "Rotas" is a church-volunteer word and assumes a rota culture. → *"Lists, schedules and forms drain me faster than the actual work does."* (12) |

#### wisdom

| id | dir | verdict | why |
|---|---|---|---|
| G-WIS-1 | +1 | **keep** | Being asked is a fact. But it is the most transparent item in the block — prefer B-WIS-2. Duplicate of B-WIS-1. |
| G-WIS-2 | +1 | **fix** | "Name the real question" is self-praise in a desirable, transparent category (§3.6). → *"In an argument I end up saying what I think the disagreement is actually about."* (15) |
| G-WIS-3 | +1 | **fix** | "The one thing that helps" grants the reader a hit rate. → *"I hold back my view in a discussion until I have heard the whole of it."* (16) — then prefer B-WIS-3, which carries the cost better. |
| G-WIS-4 | −1 | **keep** | Self-deprecating without being shameful. Good. |
| G-WIS-5 | −1 | **keep** | Clean behaviour. |

#### discernment

| id | dir | verdict | why |
|---|---|---|---|
| G-DSC-1 | +1 | **fix** | "I can tell" asserts accuracy (§3.6). → *"I decide something is off about a person before I could say what it is."* (15) |
| G-DSC-2 | +1 | **fix** | "I notice the difference" likewise claims to be right. → *"I listen for what someone actually wants rather than taking what they said."* (13) |
| G-DSC-3 | +1 | **keep** | The cost is in the sentence — you are the one holding the room up. Best A item in the block. |
| G-DSC-4 | −1 | **keep** | Duplicate of B-DSC-4; keep one. |
| G-DSC-5 | −1 | **keep** | Genuine two-sided trade-off. |

#### faith

| id | dir | verdict | why |
|---|---|---|---|
| G-FTH-1 | +1 | **keep** | Fine; B-FTH-1 says it slightly better. |
| G-FTH-2 | +1 | **fix** | Flattery — nobody answers "I panic". Also pure temperament (§3.4). → *"When a plan is falling apart I keep going as if it will still come off."* (16) |
| G-FTH-3 | +1 | **keep** | "Long after" carries the cost honestly. |
| G-FTH-4 | −1 | **keep** | Clean. |
| G-FTH-5 | −1 | **keep** | The best reverse in either faith block: it is a real reverse *and* obviously somebody's strength. Preferred over B-FTH-4, which drifts into `administration`'s territory (money, dates, confirmations). |

#### evangelism

| id | dir | verdict | why |
|---|---|---|---|
| G-EVG-1 | +1 | **fix** | The sharpest rule-3 failure in the draft. Inside a Christian audience, "I bring up what I believe with people who did not ask" makes agreement the obedient answer and disagreement sound like shame. → *"I bring up what I believe with people who did not ask, and risk the awkwardness."* (16) B-EVG-1's "without much trouble" frame is better still — it claims a facility, not a duty. Prefer B. |
| G-EVG-2 | +1 | **keep** | No duty framing; a straight report about how conversations go. |
| G-EVG-3 | +1 | **kill** | Measures the breadth of a social circle, not a pattern of speech. It would feed hospitality or mercy equally well; as an evangelism item it is noise. |
| G-EVG-4 | −1 | **keep** | Duplicate of B-EVG-4; keep one. |
| G-EVG-5 | −1 | **kill** | The most socially approved sentence in either draft ("let them see how I live"). Almost every reader agrees, so it discriminates nothing and drags `evangelism` down uniformly. |

#### shepherding

| id | dir | verdict | why |
|---|---|---|---|
| G-SHP-1 | +1 | **keep** | On-definition, cost ("over years") in the sentence. |
| G-SHP-2 | +1 | **keep** | Correct home for this behaviour (§3.7). Near-duplicate of B-SHP-2; keep one. |
| G-SHP-3 | +1 | **keep** | Clean forced choice between two real ways to spend a year. |
| G-SHP-4 | −1 | **fix** | "The same few people **every week**" assumes a weekly meeting, and the block as a whole assumes a group small enough to notice absence — a bias against readers in large congregations (§3.5). → *"I am better with a room full of people than with the same few over time."* (16) |
| G-SHP-5 | −1 | **keep** | Behaviour, and both ends are defensible. |

#### hospitality

| id | dir | verdict | why |
|---|---|---|---|
| G-HSP-1 | +1 | **fix** | Measures housing (§3.5). → *"I make room for other people in whatever space I have, most weeks."* (13) |
| G-HSP-2 | +1 | **keep** | "A bed **or a meal**" — the meal makes it answerable without a spare room. |
| G-HSP-3 | +1 | **keep** | "My place" can be one room; survivable. |
| G-HSP-4 | −1 | **keep** | Two clauses, one claim; the cost is honestly owned. |
| G-HSP-5 | −1 | **keep** | Duplicate of B-HSP-4; keep one. |

### Draft B

Numbered top to bottom within each table, as B's own §5 numbers them.

#### serving

| id | dir | verdict | why |
|---|---|---|---|
| B-SRV-1 | +1 | **fix** | "At a gathering … clearing plates" cross-loads into `hospitality`, and the chairs carry A-SRV-2's church-style assumption. → *"I end up doing the practical jobs at an event without anybody asking me to."* (15) |
| B-SRV-2 | +1 | **keep** | Reported, concrete, and "I usually say yes" names the queue that never empties. |
| B-SRV-3 | +1 | **keep** | A real trade-off between two kinds of person. Reads down on `wisdom`/`leading` in the reader's head but only credits `serving`, so the harm is one-directional. |
| B-SRV-4 | −1 | **keep** | Both ends genuinely good. |
| B-SRV-5 | −1 | **keep** | Honest cost. One drain item per gift is the budget (§3.5) and this is serving's. |

#### teaching

| id | dir | verdict | why |
|---|---|---|---|
| B-TCH-1 | +1 | **keep** | Names its own cost in the same breath. Model item for the whole quiz. |
| B-TCH-2 | +1 | **keep** | 19 words, one claim. |
| B-TCH-3 | +1 | **keep** | Behavioural and quietly costly (checking can feel like being tested). |
| B-TCH-4 | −1 | **keep** | Honest preference, not a failing. |
| B-TCH-5 | −1 | **keep** | Duplicate of A-TCH-4. |

#### encouraging

| id | dir | verdict | why |
|---|---|---|---|
| B-ENC-1 | +1 | **keep** | Reported; being the push is wanted by some and resented by others, and the sentence lets that show. |
| B-ENC-2 | +1 | **fix** | "Something **good**" inserts the site's judgement into the reader's sentence and makes agreement the virtuous answer. → *"When somebody is about to give up, I am usually the one who talks them round."* (15) |
| B-ENC-3 | +1 | **keep** | "Even when they have not asked" is the cost, in the sentence. Strong. |
| B-ENC-4 | −1 | **keep** | A behaviour, not a drain report. Preferred reverse for this gift. |
| B-ENC-5 | −1 | **keep** | Self-knowledge without shame. |

#### giving

| id | dir | verdict | why |
|---|---|---|---|
| B-GIV-1 | +1 | **keep** | The capacity guard *"and I have it"* is the pattern every money item should copy. Best giving item in either draft. |
| B-GIV-2 | +1 | **keep** | Possessions rather than cash — reaches readers with no disposable income. |
| B-GIV-3 | +1 | **keep** | Slight residue of measuring who is *known* to have money; acceptable. |
| B-GIV-4 | −1 | **keep** | Duplicate of fixed G-GIV-5; keep one. |
| B-GIV-5 | −1 | **keep** | The closest either draft comes to a pledge question, and it stays inside rule 6 because it never names church, tithe or amount. 19 words. |

#### leading

| id | dir | verdict | why |
|---|---|---|---|
| B-LED-1 | +1 | **keep** | Duplicate of G-LED-1. |
| B-LED-2 | +1 | **keep** | The cost — you take the choice away from everyone else — is in the sentence. |
| B-LED-3 | +1 | **keep** | Best leading item in either draft: a plain trade-off, no virtue word. |
| B-LED-4 | −1 | **keep** | Fine, but it is a drain report; A-LED-5 is the better reverse. |
| B-LED-5 | −1 | **keep** | Good, though close to a direct negation of +1. |

#### mercy

| id | dir | verdict | why |
|---|---|---|---|
| B-MCY-1 | +1 | **keep** | Better than A-MCY-1 — "nothing to be done" carries a cost — but it is still the block's most flattering item. Third choice. |
| B-MCY-2 | +1 | **keep** | Excellent. A *reaction*, not a virtue; both answers are ordinary and neither is shameful. Best mercy item in either draft. |
| B-MCY-3 | +1 | **keep** | Mild accuracy claim in "notice … before I notice anything else"; survives because the trade-off (you miss the rest of the room) is real. |
| B-MCY-4 | −1 | **keep** | Duplicate of G-MCY-4. Genuinely two-sided. |
| B-MCY-5 | −1 | **keep** | Mercy's one drain item. |

#### administration

| id | dir | verdict | why |
|---|---|---|---|
| B-ADM-1 | +1 | **keep** | "Chasing people" carries the cost. |
| B-ADM-2 | +1 | **keep** | Names the cost of pinning people to a plan they were still thinking about. |
| B-ADM-3 | +1 | **keep** | Brushes `discernment` but stays on numbers rather than people. |
| B-ADM-4 | −1 | **keep** | Near-tautological negation of +1, and a drain report. Prefer A-ADM-4. |
| B-ADM-5 | −1 | **keep** | Watch item: it reads as `serving`-positive while reverse-keying `administration`. Defensible, because the two genuinely trade off. |

#### wisdom

| id | dir | verdict | why |
|---|---|---|---|
| B-WIS-1 | +1 | **keep** | Duplicate of G-WIS-1, and the most vote-prone item in a desirable category. Third choice. |
| B-WIS-2 | +1 | **keep** | "Owning an outcome that was not yours to live" is a real cost and the sentence implies it. |
| B-WIS-3 | +1 | **keep** | 19 words; "even when people want an answer now" puts the cost on the page. |
| B-WIS-4 | −1 | **keep** | A behaviour, not a feeling. Preferred reverse. |
| B-WIS-5 | −1 | **keep** | Clean trade-off. |

#### discernment

| id | dir | verdict | why |
|---|---|---|---|
| B-DSC-1 | +1 | **fix** | The colon joins two claims, and the second asserts a hit rate (§3.6). → *"People say I am hard to sell anything to."* (9) |
| B-DSC-2 | +1 | **keep** | Reported, and the cost — you are the one who has to say the unwelcome thing — is real. Best discernment item in either draft. |
| B-DSC-3 | +1 | **fix** | "I can tell" again. → *"I decide a room has gone wrong before anything has been said about it."* (14) |
| B-DSC-4 | −1 | **keep** | Duplicate of G-DSC-4. |
| B-DSC-5 | −1 | **keep** | Duplicate of G-DSC-5. |

#### faith

| id | dir | verdict | why |
|---|---|---|---|
| B-FTH-1 | +1 | **keep** | Better phrased than G-FTH-1. |
| B-FTH-2 | +1 | **keep** | B self-flagged this as possible flattery; I disagree. "Still expecting it after others have written it off" reads as stubbornness as easily as hope, which is exactly the two-sidedness rule 3 asks for. |
| B-FTH-3 | +1 | **keep** | The cost — no back-up plan — is the sentence. |
| B-FTH-4 | −1 | **keep** | Works, but "the money, the dates and the people confirmed" is `administration`'s vocabulary. Prefer A-FTH-5. |
| B-FTH-5 | −1 | **keep** | Slightly convoluted ("is where I want to stop") and a drain report; content is sound. |

#### evangelism

| id | dir | verdict | why |
|---|---|---|---|
| B-EVG-1 | +1 | **keep** | "Without much trouble" claims a facility, not a duty — which is what makes this block answerable honestly by a Christian reader. |
| B-EVG-2 | +1 | **keep** | "I end up" strips the duty framing. |
| B-EVG-3 | +1 | **fix** | "About **it**" has no antecedent once the items are shuffled; and the item as written is answerable only by readers whose friends are not religious. → *"People who do not share my beliefs tell me I am easy to ask about them."* (16) "Not religious" itself is fine — ordinary, not a slight. |
| B-EVG-4 | −1 | **keep** | Duplicate of G-EVG-4. Preferred reverse for this gift: a behaviour, not a drain. |
| B-EVG-5 | −1 | **fix** | "**That** conversation" refers back to the block header, which the reader never sees. → *"Starting a conversation about God with a stranger is what I would most gladly hand over."* (16) |

#### shepherding

| id | dir | verdict | why |
|---|---|---|---|
| B-SHP-1 | +1 | **keep** | On-definition; "long after everybody else has moved on" is the cost. |
| B-SHP-2 | +1 | **keep** | Near-duplicate of G-SHP-2; keep one. This is the behaviour A wrongly filed under mercy (§3.7). |
| B-SHP-3 | +1 | **keep** | Reported, and the cost is a claim on your week that never expires. Strong, and it measures people rather than a group, so it works for a reader in a large church (§3.5). |
| B-SHP-4 | −1 | **keep** | Clean behavioural reverse. Preferred. |
| B-SHP-5 | −1 | **keep** | Shepherding's one drain item. |

#### hospitality

| id | dir | verdict | why |
|---|---|---|---|
| B-HSP-1 | +1 | **keep** | "Invite" is doable from a rented room; the low-bar/high-bar trade-off is in the sentence. |
| B-HSP-2 | +1 | **fix** | Requires a spare room, and makes disagreement sound callous ("nowhere else to go"). → *"People end up staying longer at my place than they planned to."* (12) |
| B-HSP-3 | +1 | **keep** | Best hospitality item in either draft: the cost — you changed the evening the first guests were invited to — is right there. |
| B-HSP-4 | −1 | **keep** | Duplicate of G-HSP-5. Preferred reverse (behaviour, not drain). |
| B-HSP-5 | −1 | **keep** | Hospitality's one drain item. |

---

## 5. The honest-frame copy

### 5.1 The intro (B, 86 words) — **keep, with one addition**

It does the blueprint's job: Scripture gives lists and no test; gifts are recognised in service and
by other people; take it to people who know you. "A few dozen statements cannot see your last ten
years" is the best line in either draft.

**What is missing:** nothing prepares the reader for a *low* result, and the engine will hand them
thirteen of them (§3.1). Add one sentence, and anchor it in the passage the quiz already quotes
verbatim: *"As each has received a gift, employ it in serving one another"* (1 Peter 4:10, WEBBE) —
so the lists assume everybody has received something, and a category you come out low on is a
pattern these statements did not find, not a verdict on you.

### 5.2 The result (B, 82 words) — **keep, with two conditions**

"It is not a measurement of what God has given you" and "send it to somebody who has served
alongside you" are exactly right.

1. **The copy must not be contradicted by the page around it.** `category.ts` sets
   `headline = ranked[0].name` capitalised, so the largest type on the page will read a flat
   **"Mercy"** — which *is* verdict-shaped, whatever the paragraph beneath says. This quiz needs a
   headline frame ("Your answers pointed most to: mercy"), not the bare word.
2. **It must say what a low row means**, in the same voice, for the reason in §3.1.

Both drafts are right that no number may appear. `pull()` and `shareText()` already enforce that;
the frame copy must not smuggle one back in.

### 5.3 The sentence about the gifts left out (B, 48 words) — **fix. As written it takes a side.**

> "…not because they are lesser or have stopped, but because Christians reading the same passages
> disagree about **how they are given today**…"

The blueprint requires the page to imply neither that these gifts have ceased nor that they continue.
"Disagree about how they are given today" presupposes that they **are** given today, which is the
continuationist position. A cessationist reader — whose position the Compass's own Gifts axis states
in its holders' words — is told at the door that the site has already settled the question against
them. The blueprint's own wording is the fix, and it is one word: **"whether and how"**.

Rewritten, 51 words:

> Prophecy, healing, miracles, tongues and their interpretation are not in this draft. That is not
> because they are lesser or have stopped. Christians reading the same passages disagree about
> whether and how they are given today, and a set of statements about yourself could not measure
> them fairly either way.

Also fix the vocabulary against the file (§2): WEBBE says "different kinds of languages" and "gifts
of healings". And B's three deliberate silences — no "another era", no "another kind of Christian",
no promise to add them later — are correct; keep all three.

B's proposed cross-link (to the Compass's Gifts axis, "where that disagreement is set out in both
sides' own words") is good and platform-consistent. Two notes for whoever writes the href: the
Compass axis's **slug is `gifts`** while its internal key is `spirit`, and `groupHref()` in
`registry.ts` is the only correct way to build the URL. And flag for the owner that
`/axis/theology-compass/gifts/` and a quiz called "spiritual gifts" will read as the same thing to a
reader and to a search engine; one of the two may want renaming before either is indexed.

---

## 6. Best three per gift

Two forward-keyed, **one reverse-keyed**, per gift. 39 statements. Chosen for: cost visible in the
sentence, behaviour over feeling, no more than one drain item per gift and never as the only
reverse, and the least transparent item preferred where a category is both visible and desirable.

| gift | +1 | +1 | −1 |
|---|---|---|---|
| **serving** | B-SRV-2 "People text me when something needs carrying, fixing or collecting, and I usually say yes." | B-SRV-3 "I would rather be handed a job to do than be asked what I think should happen." | A-SRV-4 "I tend to leave the practical jobs to whoever is better at them than me." |
| **teaching** | B-TCH-1 "People come to me to have something explained, even when they only wanted the short answer." | B-TCH-3 "I check whether the other person actually followed me before I move on." | A-TCH-4 "I would rather send someone a link than sit down and walk them through it." |
| **encouraging** | B-ENC-1 "People come to me when they need a push to do the thing they are avoiding." | B-ENC-3 "I tell people what I think they are capable of, even when they have not asked." | B-ENC-4 "When a friend is hesitating, I leave them to decide in their own time rather than press them." |
| **giving** | B-GIV-1 "When somebody needs money and I have it, I decide quickly and rarely think about it again." | B-GIV-2 "I give away things I am still using when somebody needs them more than I do." | B-GIV-5 "I decide in advance what I can give, and I hold to that when I am asked for more." |
| **leading** | B-LED-2 "People look at me when a decision has to be made and nobody wants to make it." | B-LED-3 "I would rather be answerable for how the whole thing turns out than do one part well." | A-LED-5 "When a group is deciding, I wait to hear where most people are heading." |
| **mercy** | B-MCY-2 "Somebody crying in front of me does not make me want to leave the room." | B-MCY-3 "I notice the person who is not coping before I notice anything else in the room." | B-MCY-4 "When somebody is in pain I want to fix the cause rather than sit with it." |
| **administration** | B-ADM-1 "I am usually the one keeping the list and chasing people for the missing details." | B-ADM-2 "When plans are loose, I write them down and send them round without being asked." | A-ADM-4 "I keep most of my week in my head and it usually works out." |
| **wisdom** | B-WIS-2 "When two good options are on the table, people ask me which one to take." | B-WIS-3 "I hold back my view until I have heard the whole story, even when people want an answer now." | B-WIS-4 "When friends ask what they should do, I tell them I am the wrong person to ask." |
| **discernment** | B-DSC-2 "Friends check a person or an offer with me before they commit to it." | A-DSC-3 "I am the one who asks what is really behind a decision everyone else accepted." | B-DSC-4 "I take people at their word, and I am sometimes the last to see a problem coming." |
| **faith** | B-FTH-1 "I commit to things before I can see how they will be paid for or finished." | B-FTH-3 "I start things without a back-up plan more often than most people I know." | A-FTH-5 "When the odds look bad, I am the one naming what could go wrong." |
| **evangelism** | B-EVG-1 "I bring up what I believe with people who do not share it, without much trouble." | B-EVG-2 "I end up talking about God with people I have only just met." | B-EVG-4 "I keep what I believe to myself unless somebody asks me directly." |
| **shepherding** | B-SHP-1 "I keep following up with the same few people long after everybody else has moved on." | B-SHP-3 "People I helped years ago still come back to me when something goes wrong." | B-SHP-4 "I give people what they need at the time and let it end there." |
| **hospitality** | B-HSP-1 "I invite people to my home without waiting until it is tidy or the food is planned." | B-HSP-3 "I add a seat for whoever turns up rather than keep to the numbers I planned for." | B-HSP-4 "I would rather meet people somewhere out than have them in my home." |

**Properties of this set.** All 39 are under 22 words (longest: B-WIS-3 and B-GIV-5 at 19). Every
gift has both directions, as rule 4 requires. No item needed a rewrite to be on this list — the
fixes in §4 apply to the spares, which matters because the editor may swap. Thirty-one are B's,
which is §1's argument in practice. Drain items: six in total, one each for serving, mercy and
shepherding at most, and never a gift's only reverse.

**Deliberately left off:** the three flattery anchors (A-MCY-1 / B-MCY-1 "I stay with people in the
worst part", A-FTH-2 "I am usually the calm one", B-DSC-1 "hard to sell to") and the two most
vote-prone items in desirable categories (A-WIS-1 / B-WIS-1 "people bring me tangled situations",
A-DSC-1 "I can tell early when something is off"). `mercy` still measures presence in distress
without its virtue item; `wisdom` still measures being asked without its most transparent one.

**Closest surviving pair to watch:** B-WIS-2 and B-DSC-2, both "people ask me". One is choosing
between options, the other is vetting a person or an offer. Distinct, but if the editor sees them
load together in testing, B-DSC-2 should give way to A-DSC-3's partner rather than B-WIS-2.

---

## 7. What I could not settle, for the editor

1. **`discernment` and `faith` do not measure their passages** (§3.3). This is a naming decision, not
   a statement decision, and I cannot make it from here. It is the one open item that should reach
   the owner before wiring, alongside the omitted-gifts decision the blueprint already flags.
2. **Thirteen categories is a lot to rank in public.** Even with the share card cut to three (§3.1),
   the result page ranks all thirteen. The alternative — show the top three and put the rest behind a
   "see the whole ranking" control — is a design call, not a fairness call, but it would remove most
   of the harm in §3.1 at a stroke.
3. **`giving` survives rule 6, in my judgement** — Draft A asked the question in its note 3 and
   answered it correctly. None of the surviving giving items mentions tithe, church, amount or
   frequency, and all three of my picks concern money moving between people. If the owner still
   reads piety in it, the category should be cut rather than the rule softened; that was A's own
   instinct and it is the right one.
4. **Rule 5 should be conceded on the page, not papered over.** Both drafters reached this
   independently and I agree. One honest line in the intro — that a reader who knows the traditional
   lists will sometimes see which gift a statement is about, which is one more reason to check the
   result with people who know you — costs nothing and is the sort of thing this site is for.
