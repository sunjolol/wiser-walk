# Discoverability: what waits for the owner's say (written 2026-09-21)

Round 1 (`ROUND-1-BRIEF.md`) built everything that touched no audited wording and needed no decision
of his. These are the findings that DO, ranked by the skeptic's and the main session's judgement.
Put them to him in plain words with the real item in front of him; never as a list of jargon.

1. **The 18 tradition pages are about half identical to each other** (about 48% on five-word
   shingles, 68% between neighbours such as Orthodox and Catholic; 330 to 350 words each, roughly 200
   of them the same explainer). They are the flagship quiz's whole search surface. The ruled fix keeps
   all 18 indexable: shrink the repeated explainer (say each honest caveat once, shorter), and print the
   audit's own `sources` string for each tradition (it EXISTS: `site/src/data/compass-audit.json`
   `simulations[].sources`, e.g. "Catechism 1996-2001, 1257, 1374-1376; Trent Sess. VI ..."), framed
   honestly as "the documents read to place this sketch". CLAUDE.md's rule "tradition pages get NO
   sources block until real citations exist in the data" was written believing there were none. HIS
   CALL: whether to print them and how they are framed. Round 1 already gave each page its own meta
   description built from its own pole words.
2. **Lay vocabulary on the axis pages.** `/axis/theology-compass/gifts/` says "Cessationist" eight times
   and "speaking in tongues" zero times; `/grace/` says "free will" once in 1,576 words. People search
   the lay phrase. Adding the everyday words beside the holders' own terms is fair and is the cheapest
   real ranking gain left, but it edits AUDITED prose, so it needs the same fairness care as the audit.
3. **Nine gift pages are under 240 words** (teaching 192, mercy 197), and they are the gifts people
   actually search; the long ones are the contested gifts. The material to deepen them is New Testament
   text already bundled. Needs writing under the audit's rules.
4. **A printable spiritual gifts test** (no sign-up, print stylesheet or worksheet). Seven of ten
   autocomplete suggestions for "spiritual gifts test" are printable/PDF variants, and what ranks is
   gated, paid or scanned. Do not call it a PDF unless one is generated. Also gives churches and small
   groups a reason to carry the site offline and link back.
5. **Say what people may do with the site** (the completeness critic's strongest point). The only
   rights line is "© 2026 Wiser Walk", which by default forbids a small-group leader from printing a
   chart or a blogger from reproducing the rails. Proposed: "Use it. Print anything here for a class, a
   small group or a church, or quote it, as long as you say where it came from and link back", with CC
   BY 4.0 on the words and the data (NOT the Bible text or the paintings). Unlocks the next item.
6. **Publish the 18-tradition position table as a citable dataset** (CSV + `Dataset` markup; Google
   Dataset Search is unclaimed here). It is the site's one original, honestly described data asset,
   and the thing bloggers cite. Needs the licence in 5.
7. **Reformation Day is 31 October** and the site is uniquely equipped for it (the six axes ARE what
   the Reformation argued about). One seasonal page, fair to both sides, built from audited axis
   content. Then Advent and Lent. Zero seasonal content exists today.
8. **Eight to twelve hand-built comparison pages** ("Lutheran vs Reformed", "Orthodox vs Catholic",
   "Calvinist vs Arminian"), each with real written substance. NOT the 153 generated pairs in the old
   growth plan: that is the clearest scaled-content risk the site could take.
9. **A direct answer under a question heading** (40 to 50 words) at the top of each axis page and
   article: what search engines quote and what AI assistants extract. Edits audited pages: same care.
10. **A contact address on /about/** (e.g. hello@wiserwalk.com at SiteGround, already paid for). Useful
    to a reader who spots an unfair description; costs no identity. His name stays off the site unless
    he volunteers it (Google says bylines are encouraged, not a ranking factor).
11. **The "Draft" seven-deadly-sins quiz is linked from the nav and footer of every page** and points
    at a noindex page. Either audit it and publish it, or take it out of the menus until it is ready.
12. **/method/ is 13,000 words of before-and-after audit detail** and gets a footer link from 82
    pages. He already finds the site over-explained. A short, readable trust page with the long log
    behind a link would serve readers and crawlers better.
13. **Self-host the two fonts** (removes two third-party origins from every page's critical path and
    the only measured layout shift). Medium effort with real regression risk on a settled design:
    do it with before/after captures, not in a hurry.
14. **More articles, on a slow steady cadence.** Eleven is a body of work, not an engine. For a site
    that will never be marketed, two honest articles a month aimed at "what does the Bible say about
    ..." questions is the minimum that compounds. Bing's free Keyword Research (owner action 6) should
    choose the topics.
15. **Later, only when there is traffic:** AVIF/srcset image pipeline; splitting the 141 KB shared
    stylesheet per page; an embeddable result badge; Vercel Speed Insights.
