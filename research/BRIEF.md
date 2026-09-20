# The brief: what to build next, and why

Written 2026-09-19 from the five research files, VERIFICATION.md's corrections applied. Tags:
**[V]** checked by the verifier on the page; **[W]** a "nobody does this" gap resting on two or three
searches only; **[U]** unverified. No search volume exists anywhere in this research: autocomplete
proves a phrasing is common, not how common. I re-checked the live titles and sitemap by curl today.

## 1. Five findings that should change what you build

**1. The flagship is invisible to the people looking for it.** Google suggests "what denomination am I
quiz", "am I calvinist or arminian quiz", "should I be orthodox or catholic quiz" [V]. The Compass
title is still "Theology Compass — Wiser Walk" and the page never uses the word "denomination" [V].
The bare phrase "theology compass" is contested by three things: TheoCompass (https://theocompass.com/),
a Redeemed Zoomer video, and a family2000 test [V]. Keep the name; change the title.

**2. You already own the answer to a badly served query family.** "Which denominations believe in
predestination / tongues / transubstantiation", "what denominations are cessationist" are all
suggested [V]; what ranks is forums, Quora and a content farm [V]. Each axis page's "Where the
traditions sit" section is the answer, under an H1 that reads "Gifts". Four of the ten suggestions
(rapture, purgatory and so on) are outside the six axes: do not improvise them.

**3. "Who is speaking in [chapter]" is real demand with no structured rival, and the data is on
disk.** Autocomplete returns Psalms 91, 22, 119, 2, 82, 95 and more [V]; results are commentaries [W].
Glyssen's CharacterVerse.txt (20,984 rows, MIT licence, settled [V]) answers verse by verse with a
confidence flag. No model writes a word. It needs the MIT notice and a visible credit.

**4. The games lack the three cheapest parts of the playbook that made Wordle spread.** A shared
daily set, a spoiler-free grid, and a permanent page per answer. Wordle went from 90 players to
300,000 in two months once the grid existed, and players invented the grid
(https://en.wikipedia.org/wiki/Wordle [V]). Show HN "A Daily Bible Game" got 49 points and commenters asked for the deuterocanon and
unlimited play [V] (https://news.ycombinator.com/item?id=46541885). You have both.

**5. Your edge is citation and audit, not openness, and the articles currently break it.** TheoCompass
publishes its method and data on GitHub; it has no confession citations and no audit that anyone
found [V]. Say exactly that, never "no sources". Meanwhile the live gratitude article says thanks is
"in" not "for" all circumstances and never mentions Ephesians 5:20, which in your own bundled BSB
reads "for everything" [V]. All three live articles quote an unnamed non-BSB translation (probably
ESV [U]) and link to the unaudited sins draft [V]. Fix before writing anything new.

## 2. The ranked backlog (twelve)

Scores 1 to 5, higher is better. Cheap = low build cost. Safe = little authored content that could
read as loaded. For anything new, play ten real items before any pipeline.

| # | Item | Spreads | Search | Cheap | Safe | Fit | Total |
|---|---|---|---|---|---|---|---|
| 1 | Axis pages answer "which denominations are X" | 2 | 5 | 5 | 5 | 5 | 22 |
| 2 | Sounds Like Scripture: daily set, grid, reveal pages | 5 | 3 | 4 | 5 | 5 | 22 |
| 3 | "Who is speaking in [chapter]" pages | 2 | 5 | 4 | 5 | 5 | 21 |
| 4 | Canon pages: "Is [book] in the Bible?" | 3 | 4 | 4 | 4 | 5 | 20 |
| 5 | Could You Sign It? | 4 | 4 | 3 | 5 | 4 | 20 |
| 6 | More or Less | 4 | 4 | 3 | 5 | 3 | 19 |
| 7 | Tradition hub plus twenty typed pair pages | 2 | 4 | 4 | 4 | 5 | 19 |
| 8 | "What does this verse mean" articles | 2 | 4 | 3 | 2 | 4 | 15 |
| 9 | Spiritual gifts: list as the player's choice | 4 | 3 | 2 | 1 | 5 | 15 |
| 10 | Citation pass, then tradition pages | 1 | 4 | 1 | 4 | 5 | 15 |
| 11 | Hymn or Psalm? | 3 | 2 | 4 | 5 | 4 | 18* |
| 12 | End-Times Map | 4 | 4 | 1 | 1 | 4 | 14 |

*Ranked below its total because the pool may not survive (see below).

**1. Axis pages that answer the question.** On each of six pages: the question as H1, one generated
sentence listing which traditions sit on each side and in the middle band, hand-written
description. Data: compass.json, audited. Pages: six now, twelve pole pages later. Share object: none. Risk: tempting to extend to purgatory or the rapture without data. Don't.

**2. The daily layer for Sounds Like Scripture.** Same ten lines for everyone, seeded by date, no
server; a grid showing the shape of the run without the lines; a permanent page per line and per
source ("Lines from a Kempis that sound like Scripture"). Later, a per-line anonymous counter gives measured difficulty, as Lichess does [V]. Data: the 900 verified lines. Risk: two daily objects failed on play, but those
were new mechanics; this is one you approved. Play a week of seeded sets yourself first.

**3. Who is speaking.** About forty chapters autocomplete names, text coloured by speaker, Glyssen's
"Potential" flag printed, a note where readers differ (Isaiah 61, Psalm 22, Proverbs 8), a button into
Who Said It?. Data: Glyssen (MIT) plus KJV/WEB. Share object: the game. Risk: Glyssen is an audio
dramatisation aid, not commentary; the page reports it and never rules. Expand past forty only if
Search Console shows impressions.

**4. Canon pages.** Tobit, Judith, Wisdom, Sirach, Baruch, 1 and 2 Maccabees, 1 Enoch, plus "How many
books are in the Bible? Protestant, Catholic, Orthodox", each linking to the game with that canon
set, plus the article "Why do some Bibles have more books?". Every ranking page seen answers from one
tradition [V for Enoch]. Risk: the Trent, Thirty-Nine Articles and Westminster citations are from
memory [U] and must be opened first; Enoch is crowded.

**5. Could You Sign It?** One verbatim sentence from a public-domain confession; tap sign, not sign,
unsure; result shows which documents you could sign and the lines where you part. Substring-verified
like the game. Pages: one per document and article, which also gives tradition pages real citations.
Share: "I could sign more of Trent than I expected"; works with the pair overlay. Gap [W]. Risk:
archaic wording, and excerpt selection is editorial. Modern documents (CCC, BFM 2000) are in
copyright: link only.

**6. More or Less.** Two words; tap the one the Bible uses more; streak. Data: plain BSB counts only.
Original-language counts are blocked: STEPBible's English tagging sits on the ESV [V]. Pages:
/count/[word], since "how many times is X mentioned in the Bible" is suggested [V]; whether existing
answers are poor is [U]. Share: streak plus the pair that fooled you. Risk: word forms; print the
counting rule on every page.

**7. Tradition hub and pairs.** /tradition/ is a 404 today [V]. Build the 18-by-6 table, then only the
roughly twenty pairs people type (Lutheran vs Presbyterian, Orthodox vs Catholic). Rival pair pages
carry 41 topics and 57 footnotes [V], so yours are thin until item 10. Share: the /c/ overlay. Risk:
153 near-identical pages. Twenty.

**8. Verse-meaning articles.** First repair the three live ones. Then Jeremiah 29:11 (second on
YouVersion 2025 [V]), Philippians 4:13, worry and peace, Romans 8:28; 1,200 to 1,600 words, BSB
verbatim, one pre-1900 voice, a "Where Christians differ" note. Risk: fully authored, and
BibleProject leads the format.

**9. Spiritual gifts.** Keep building, with the frame chosen first (Romans 12 only; Paul's lists
without sign gifts; all), items about what has happened not what you feel, under forty items, a
printable result, and a "Use this with a group" page. Churches link tests whose result a member can
hand to a pastor [V] (https://soumc.org/spiritual-gifts-series/). Risk: the most item-writing of
anything here; needs a small adversarial audit before any launch.

**10. Citation pass.** 108 cells (18 traditions by 6 axes), one opened document each. Unlocks "do
Lutherans believe in the real presence" pages and thickens items 1 and 7. This is the best use of
spare judgment-grade model time, with every citation opened. Risk: slow, and a wrong citation is
worse than none.

**11. Hymn or Psalm?** A new data file for the existing engine. Risk: rhyme and metre are tells, so
the pool may collapse. Cheap to test by hand: pull twenty unrhymed lines from Watts and Wesley.

**12. End-Times Map.** Real gap [W], proven demand (an old Quizfarm quiz circulated [V, seen not
opened]), but it is a full audited instrument with multi-position axes. Last, after the gifts audit
teaches you the smaller version of that process.

## 3. Search fixes to ship this week (no new data)

| Page | Title | Description |
|---|---|---|
| / | Wiser Walk: Christian quizzes and Bible games, made fair | Find where your beliefs sit among 18 Christian traditions, test whether a line is really in the Bible, and read on gratitude and joy. Every claim cited. |
| /q/theology-compass/ | Theology Compass: which Christian denomination are your beliefs closest to? | 18 statements, 3 minutes. See where you sit on six questions that divide Christians and which of 18 traditions land nearest. Audited for fairness. |
| /axis/.../grace/ | Monergism vs synergism: which denominations hold which view | Does God alone bring a person to faith, or does the person cooperate? Both cases in their holders' own words, and where 18 traditions sit. No winner picked. |
| /axis/.../gifts/ | Cessationist vs continuationist: which denominations are which | Have tongues, prophecy and healing ceased? Both cases fairly put, the passages each side reads, and where 18 traditions sit. |
| /axis/.../table/ | Real presence vs memorial: what each denomination believes about communion | Is Christ present in the bread and wine, or is the Supper a remembrance? Both views in their own words. |
| kingdom, authority, worship | Covenant theology vs dispensationalism: which denominations hold which · Scripture alone vs Scripture and tradition: where each church stands · Liturgical vs free worship: which churches worship how | Same recipe. |
| /play/sounds-like-scripture/ | Sounds Like Scripture: is this line really in the Bible? A timed game | Keep. |

Also: make each axis H1 the question with the one word as an eyebrow; hand-write the six axis
descriptions (today they cut off mid-sentence [V]); cut the Compass description under 155
characters; remove the eight seven-deadly-sins URLs from the sitemap (43 URLs, 8 of them noindex
drafts [V, re-checked today]); add one sentence to the Compass: "Most people would call these
denominations; we say traditions because several reject that word for themselves." Verify the domain
in Google Search Console: within weeks it replaces every inference here with real queries.

## 4. Where to post first

Order: **faith.tools form** (https://go.faith.tools/submit; websites qualify [V]), then **Show HN**,
then **one theology subreddit** after two to three weeks of ordinary commenting, then **one note to
one YouTuber**. Redeemed Zoomer streamed a denominations quiz (title seen; view count and which quiz
[U]). No subreddit or Facebook rules were readable by anyone: read them yourself first [U]. Freedom
Homeschooling lists curriculum, not games; save it for Finish the Verse [V]. Before posting: a "who made this" line on /about and a fair TheoCompass paragraph on /method. Full post text is in DISTRIBUTION.md section 5; the three, in short:

1. **Show HN (Sounds Like Scripture).** "A timed 'is this line in the Bible?' game where no line was
   written by a model." Lead with the substring verifier, canon as a player choice, and the 1,796 of
   1,800 finding. Ask which lines feel unfair.
2. **Reddit (the Compass).** "I built a six-axis theology quiz and had it attacked for unfairness
   before publishing. Tell me where it's still unfair." Say it is yours, free, no accounts. Name
   TheoCompass kindly: it matches denominations, this plots six disagreements, take both. Promise to
   log fixes on /method.
3. **Reply in a youth-leader group when someone asks for a game.** Disclose it is yours; ten minutes
   on a projector, no logins, the room calls it; ask which lines caused arguments.

One place at a time, five days apart, never a second account.

## 5. What I would not do

- **"What's in a Name" pages or a people-and-places reference layer.** Abarim Publications and Bible
  Maximum (1,342 place pages from the same OpenBible data) already hold them [V].
- **Pin the Place, for now.** ScriptureGuessr owns the "GeoGuessr for the Bible" framing [V]; disputed
  sites make distance scoring unfair. Never use that phrase.
- **Painted Scene.** Museum image rights are per object, not per museum [V], and you already rejected
  visual guessing.
- **Famous-misquote articles, "what does the Bible say about X", book trivia.** Owned by large
  publishers; you called the misquotes low-IQ yourself.
- **Women pastors, sexuality, purgatory, rapture pages.** No audited data. Prove the fair format on
  "Can a Christian lose their salvation?" first.
- **Enneagram, saint matching, maturity or fruit self-scores, memorisation streaks.** Someone else's
  framework, invented mappings, or counting devotion.
- **Bible Knowledge, Benchmarked, yet.** Pew allows excerpts with a fixed citation and disclaimer [V],
  but the four headline figures were not confirmed on the report [U].
- **Launching "Who in the Bible are you most like?" or the sins draft anywhere** until you enjoy
  playing them and they are audited.
