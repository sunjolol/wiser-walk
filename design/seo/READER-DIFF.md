# The reader's diff: what actually changed, round 1

Every one of the 113 built pages was fetched from the live **wiserwalk.com** and compared with the
build on this branch: the visible words of the page, the browser-tab `<title>`, the meta description
a search result prints, and the `<h1>`. The live site is the "before". Nothing here is a guess about
what a change does; it is the two versions of each page, word against word.

**The headline numbers**

| | pages |
|---|---|
| Built and compared against live | 113 |
| Visible page words **identical** to live | 70 |
| Visible page words changed | 43 |
| Search-result **title** changed | 83 |
| Search-result **description** changed | 84 |
| Page `<h1>` changed | 31 |

Plus two pages that do not exist on the live site at all: **`/404`** (a real designed page instead of
Vercel's plain text) and **`/articles/feed.xml`** (the new RSS feed).

Every changed page below was meant to change by the brief. Nothing changed that was not.

**The audited words are untouched.** No statement, pole name, band adjective, axis summary, history,
passage, tradition position, figure placement or gift description differs from live anywhere in this
diff. What changed is the words the site chooses about itself: titles, descriptions, headings, and
the new blocks that link one part of the site to another.

---

## 1. Traditions — 18 pages. Search listing only; the page itself did not move a word.

All 18 changed their title and description. The visible page is **byte-identical** to live.

The old title said the same thing on all eighteen pages, and the longest ran to 116 characters, so
Google cut it off. The old description was the same sentence with a name swapped in. The new
description is built from **that tradition's own audited band words**, printed verbatim, so all
eighteen now differ and each one says something real.

```
/tradition/eastern-orthodox/
  title   77  Eastern Orthodox beliefs on six questions that divide Christians — Wiser Walk
           60  Eastern Orthodox beliefs: grace, communion, gifts, authority

  desc   172  Where Eastern Orthodox typically sits on grace, communion, spiritual gifts,
               authority and worship, beside 17 other traditions. A sketch of adherents, not
               official teaching.
         154  Where Eastern Orthodox adherents typically land: firmly synergist on grace,
               sacramental at the table, continuationist on the gifts, liturgical in worship.

/tradition/national-baptist-nbc-usa-historically-black-baptist/
  title  116  National Baptist (NBC USA / historically Black Baptist) beliefs on six questions
               that divide Christians — Wiser Walk
          60  National Baptist beliefs: grace, communion, gifts, authority

  desc   211  Where National Baptist (NBC USA / historically Black Baptist) typically sits on
               grace, communion, spiritual gifts, authority and worship, beside 17 other
               traditions. A sketch of adherents, not official teaching.
         157  Where National Baptist adherents typically land: synergist-leaning on grace,
               memorialist at the table, continuationist-leaning on the gifts, Scripture alone.
```

Three fairness decisions are worth knowing, because a reader could check them:

- Only the tradition's **own** band adjectives appear. The joining phrases ("on grace", "at the
  table") are the only written words, and each is dropped where the band already carries its topic,
  so "Scripture alone" is never followed by "on authority".
- An axis in the audited **41–59 band names no position**, so it is left out entirely rather than
  called "balanced". Mainline Protestant's grace and authority readings are simply absent.
- "Beside 17 other traditions" was dropped: the page lists six neighbours, not seventeen.

The parenthetical is stripped from the title **except** where stripping it would make two pages
identical, so the two Southern Baptist pages keep "(Calvinist)" and "(non-Calvinist)".

**All 18:** anabaptist-mennonite-peace-church, anglican-broad,
bible-church-independent-dispensational, calvary-chapel, catholic-roman-and-eastern,
charismatic-non-denominational, churches-of-christ-christian-churches, eastern-orthodox,
lutheran-confessional, mainline-protestant-pcusa-elca-umc,
national-baptist-nbc-usa-historically-black-baptist,
pentecostal-assemblies-of-god-church-of-god-cogic, presbyterian-reformed-confessional,
reformed-baptist-1689, reformed-charismatic-sovereign-grace-newfrontiers,
southern-baptist-calvinist, southern-baptist-non-calvinist, wesleyan-methodist.

---

## 2. Bible figures — 25 pages. Search listing only; the page itself did not move a word.

All 25 changed title and description. The visible page is **byte-identical** to live.

```
/figure/rahab/
  title   62  What was Rahab like? 7 recorded acts, with verses — Wiser Walk
          48  Rahab in the Bible: 7 recorded acts, with verses

  desc   141  7 recorded acts of Rahab, each with its verse, show how Rahab acted, spoke and led.
               Take the free quiz: which Bible figure are you most like?
         121  7 recorded acts of Rahab, each with its verse, and what they show about temperament.
               Part of a free Bible character quiz.

/figure/mary-of-nazareth/
  title   84  What was Mary the mother of Jesus like? 11 recorded acts, with verses — Wiser Walk
          55  Mary the mother of Jesus in the Bible: 11 recorded acts
```

"Acted, spoke and led" was dropped because it was **false on some pages**: Hannah and Rahab are not
placed on the Lead axis at all. ", with verses" is appended only where the title still fits, which is
why a long name stops after the count.

**All 25:** abigail, abraham, barnabas, daniel, david, deborah, elijah, esther, gideon, hannah,
jesus, john-the-baptist, jonathan, joseph, judith, martha, mary-magdalene, mary-of-nazareth, moses,
nehemiah, paul, peter, rahab, ruth, tobit.

**One for your eye, not a bug:** `/figure/jesus/` now reads "16 recorded acts of Jesus, each with its
verse, and what they show about temperament." That is the site's own settled language — the note the
quiz already prints wherever Jesus appears says "Landing nearest Jesus here is about temperament as
the Gospels record it, not a measure ..." — so the description agrees with the page rather than
inventing a new frame. Say the word if you want it phrased differently.

---

## 3. Spiritual gift pages — 19 pages. Heading, title and description all changed.

**On the page:** the `<h1>` was the bare gift name in lower case. It is now a proper heading.

```
/axis/spiritual-gifts/prophecy/       h1  "prophecy"              ->  "The gift of prophecy"
/axis/spiritual-gifts/mercy/          h1  "showing mercy"         ->  "The gift of showing mercy"
/axis/spiritual-gifts/knowledge/      h1  "the word of knowledge" ->  "The word of knowledge"
```

That heading change is the whole of the visible difference on these nineteen pages. Every other word
on them is identical to live.

**In search:** all nineteen titles used to share a 47-character tail, so they were
indistinguishable in a result list and ran as long as 92 characters. Each now leads with the gift and
its passage, and all nineteen differ after the fourth word.

```
/axis/spiritual-gifts/prophecy/
  title   77  Prophecy as a spiritual gift: the passage and what it looks like — Wiser Walk
          51  The spiritual gift of prophecy: 1 Corinthians 12:10

  desc   155  What the New Testament says about prophecy: the passage that names it, quoted, and
               where Acts and the letters show it. Part of a free spiritual gifts test.
         133  Prophecy in 1 Corinthians 12:10, quoted in full, with 4 recorded acts, each cited.
               Part of a free spiritual gifts test, all 19 gifts.
```

The two gifts with no recorded act in the New Testament (the word of knowledge, interpreting tongues)
say "3 passages on it" rather than "recorded acts", matching the heading those pages already print.

The breadcrumb shown in a search result also gained a capital: "prophecy" -> "Prophecy".

**All 19:** administration, discernment, encouraging, evangelism, faith, giving, healing,
hospitality, interpretation, knowledge, leading, mercy, miracles, prophecy, serving, shepherding,
teaching, tongues, wisdom.

---

## 4. The six Compass axis pages — heading changed; three titles trimmed.

**On the page,** the one-word `<h1>` now names both poles, in the site's blue and orange, in the
data's own left-then-right order:

```
/axis/theology-compass/grace/      "Grace"      ->  "Grace: Monergist or Synergist"
/axis/theology-compass/table/      "Table"      ->  "Table: Sacramental or Memorial"
/axis/theology-compass/gifts/      "Gifts"      ->  "Gifts: Continuationist or Cessationist"
/axis/theology-compass/kingdom/    "Kingdom"    ->  "Kingdom: One people or Dispensational"
/axis/theology-compass/authority/  "Authority"  ->  "Authority: Bible & tradition or Scripture alone"
/axis/theology-compass/worship/    "Worship"    ->  "Worship: Liturgical or Free"
```

**And one line was removed.** The band used to print the two poles again just under the heading with
an arrow between them ("Bible & tradition ↔ Scripture alone"). After the heading change that was the
same eight words twice in a row, so it goes. Both poles are still printed unconditionally, in the same
two inks, in the heading itself. In the whole word-by-word diff of these six pages the only changes
are "Authority" -> "Authority:" and "↔" -> "or": nothing else on them moved.

**Three titles were over the 65-character guard and are trimmed.** No claim changed; the searcher's
phrase stays at the front.

```
/axis/theology-compass/table/
   74  Real presence vs memorial: what each denomination believes about communion
   64  Real presence vs memorial: what churches believe about communion
/axis/theology-compass/kingdom/
   70  Dispensationalism or one people of God: where each denomination stands
   60  Dispensationalism or one people of God: where churches stand
/axis/theology-compass/authority/
   68  Scripture alone vs Scripture and tradition: where each church stands
   63  Scripture alone vs Scripture and tradition: where churches stand
```

The other three titles and all six descriptions are exactly as they were.

---

## 5. The six figure-quiz axis pages — heading, title and description all changed.

Same heading treatment, and the same duplicate pole line removed:

```
/axis/bible-figure/pace/      "Pace"      ->  "Pace: Acts first or Weighs first"
/axis/bible-figure/voice/     "Voice"     ->  "Voice: Says it or Holds it"
/axis/bible-figure/lead/      "Lead"      ->  "Lead: Out in front or Alongside"
/axis/bible-figure/conflict/  "Conflict"  ->  "Conflict: Confronts or Reconciles"
/axis/bible-figure/reasons/   "Reasons"   ->  "Reasons: Asks why or Takes it on trust"
/axis/bible-figure/plans/     "Plans"     ->  "Plans: Plans ahead or Meets the day"
```

These six were shipping **descriptions cut off in the middle of a word** — the live `/voice/` page
tells Google "Others keep a thought and tu". That is fixed here and everywhere else the same raw
`slice()` was used.

```
/axis/bible-figure/voice/
  title   41  Voice: Says it or Holds it — Wiser Walk
          52  Do you say it or hold it? Where 25 Bible figures sit

  desc   155  ... some of it comes out half-formed. Others keep a thought and tu
         156  Some people think out loud. Others keep a thought and turn it over before it is
               heard, if it ever is. Neither is the better way to be. Where 25 figures sit.
```

Every one of the six descriptions opens on the axis summary's **own** first words and carries the
axis's own closing sentence, "Neither is the better way to be".

---

## 6. The eleven articles — search listing changed; the prose did not.

Every article had fallen through to the default title, which was the reader's heading plus the brand.
All eleven now carry a title aimed at what a Christian actually types, and ten carry a longer
description.

```
/articles/how-to-become-more-patient/
   39  How to become more patient — Wiser Walk
   54  How to become more patient: what the Bible means by it
/articles/what-are-spiritual-gifts/
   38  What are spiritual gifts? — Wiser Walk
   53  What are spiritual gifts in the Bible? All four lists
/articles/what-the-bible-says-about-worry/
  113  “Do not worry” comes with reasons attached, and with something to do instead. A careful
        reading of four passages.
  148  “Do not worry” comes with reasons attached, and with something to do instead. A careful
        reading of Matthew 6, Philippians 4, 1 Peter 5 and Psalm 94.
```

Every claim in a new title or description was checked against the article: "All four lists" is there
because the gifts article names Romans 12, 1 Corinthians 12, Ephesians 4 and 1 Peter 4; "anxiety"
because the worry article uses the word six times; "A six-minute read" and "A seven-minute read"
match the minute figure the site's own cards print for that article, article by article.

**The visible prose did not change on any of the eleven.** 38 contextual links were added inside
sentences, but the anchor text is words that were already in the sentence, so the word-by-word diff
of the rendered page comes back identical on all eleven once the tag boundaries are normalised.
Nothing was added inside quoted Scripture.

**One article gained something visible:** `/articles/what-does-it-mean-to-be-christlike/` now shows a
second card in its "Keep going" block — "Who in the Bible are you most like?" — because that article
was joined to the figure quiz in its front matter. The relation is real: the article's closing
section is about the likeness *not* being one temperament, which is the figure quiz's own standing
caution.

---

## 7. The four quiz intros — new blocks at the foot; nothing removed.

Nothing above the fold moved on any of the four. Everything here is **added** below the last "Start
the quiz" button.

- **`/q/bible-figure/`** gained the index its own 25 figure pages never had: a heading
  "25 figures, one page each", the line "One line on each, and where they stand on the six axes.",
  and all 25 names, each linking to its page with its one-line identifier under it. Before this the
  page linked to **none** of them, and the 25 pages were orphans of their own quiz.
- **All four** gained a short "Read next" row of the articles written alongside them, drawn with the
  card pattern the foot of an article already uses. The Compass gets 2 cards, gifts 1, figure 1, sins
  3. It sits below the last start button, so nothing to read stands between a reader and the quiz.
- `/q/theology-compass/`'s existing tradition index is **unchanged in every printed word**: still
  "18 traditions, each in its own words" over the same sentence and the same 18 names.

Three descriptions were trimmed to clear the 160-character guard, with no claim changed:

```
/q/theology-compass/  162 -> 152   "Answer 18 statements in 3 minutes and see which ..."
                                ->  "18 statements, 3 minutes. See which ..."
/q/bible-figure/      161 -> 155   "18 plain statements ..." -> "18 statements ..."
/q/spiritual-gifts/   164 -> 158   "... test covering all 19 gifts ..." -> "... test on all 19 gifts ..."
```

---

## 8. `/games/` — the page went from 175 words to about 700.

Under the two game cards there is now a block headed "How the games work", with one plain panel per
game: what the game asks, how long a run takes and the seconds a line gets, where the non-Scripture
lines come from, how the three canons decide the answer, that a deuterocanonical line is never called
a fake, why the four names are hard, and one quiet closing line saying both are free with nothing to
sign up for. It is written for players, not about how the games were built, and it quotes no line.

The description was trimmed by six characters to clear the guard ("built from over 2,000 real lines"
-> "from over 2,000 real lines"). The title and the two cards are unchanged.

---

## 9. The rest

- **`/` (home)** — description trimmed 162 -> 158 ("Free quizzes and Bible games that take minutes."
  -> "Free quizzes and Bible games, minutes each."). Nothing on the page changed.
- **`/quizzes/`** — title trimmed 70 -> 60 ("denomination, spiritual gifts, Bible character" ->
  "denomination, gifts, Bible character"; "spiritual gifts" is still in the description). Nothing on
  the page changed.
- **`/about/`** — description trimmed 165 -> 157 ("described in words its own people would use" ->
  "described in its own people's words"). Nothing on the page changed.
- **`/play/sounds-like-scripture/` and `/play/who-said-it/`** — not one visible word changed. Their
  heads gained the Games step in the breadcrumb, `og:image:alt`, `og:locale`, the feed link, and the
  same Google Fonts request the rest of the site makes.
- **`/method/`, `/support/`, `/me/`, the seven `/account/` pages and the seven seven-deadly-sins axis
  pages** — no change of any kind.
- **`/404`** — new. Instead of Vercel's plain "The page could not be found" with no link anywhere, a
  page on the site's night band: "There is nothing at this address.", one line, and four buttons —
  Quizzes, Games, Articles, My results.
- **`/articles/feed.xml`** — new. An RSS 2.0 feed of all eleven articles, announced in the head of
  every page including the two game pages.

**Site-wide, invisible to a reader:** the " — Wiser Walk" suffix is now dropped from any title it
would push past 60 characters (24 of 114 pages keep it, 90 drop it); the reference pages' JSON-LD is
typed `WebPage` instead of `Article`; articles are `BlogPosting` with the real pixel dimensions of
their painting; `/games/` publishes an `ItemList`; the sitemap carries `lastmod` on the eleven
articles and nothing else; static assets get cache headers; and `/sitemap.xml` redirects to
`/sitemap-index.xml`.

---

## What guards this from now on

`site/scripts/seo-test.mjs` runs on the **built** output as `postbuild`, before anything is announced
to a search engine, and fails the build on: an indexable page with no title, a title over 65
characters, a missing or duplicate meta description, a description under 50 or over 160 characters or
ending mid-word, zero or several `<h1>`, a missing canonical or `og:image`, an `<img>` with no `alt`
attribute, invalid JSON in a JSON-LD block, and a sitemap URL that is noindex or was never built.

It passes on this branch: **114 built, 97 indexable, 97 sitemap URLs, no problems.**
