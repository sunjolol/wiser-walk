# Theology Compass — and the site it belongs to

## The vision (read this first — it changes the architecture)

**This is not a standalone theology quiz.** The Theology Compass is the *first module* of a much larger site: a Christian hub for **understanding yourself better**. Everything must be built as part of that platform, never as a bespoke one-off.

The owner's stated vision, in his own terms:

- A hub of **many quizzes and self-assessments**, because he finds them genuinely fun and believes others will too. Confirmed ideas beyond the Compass:
  - **Who are you most like from the Bible?**
  - **Which of the seven deadly sins are you weakest to?**
  - **What are your spiritual gifts?** (from Paul's lists)
  - The **Theology Compass** (six axes) — the flagship, already built and audited
- **Helpful articles** alongside the quizzes: "How to become more grateful", "How to become more joyful", "What does it mean to be Christ-like?", and similar formation topics.
- **Bible study tools**, possibly, later on.

So: *not all quizzes will be theology-based.* Some are character, some are gifts, some are Bible-knowledge, some are playful. The platform must not assume theology.

### What that means for the build

1. **Build a quiz engine, not a quiz.** A quiz is *data* — statements, axes or categories, scoring rules, result copy — consumed by generic machinery. Adding "Which deadly sin?" must mean adding a data file, not writing a new app.
2. The Compass's scoring is one *scoring strategy* (bipolar axes with Euclidean nearest-neighbour matching). Others will need different ones: highest-category-wins (spiritual gifts, deadly sins), similarity-to-a-figure (who in the Bible), simple right/wrong (Bible knowledge). Design the engine so a strategy is pluggable.
3. **Result pages, share cards, and OG images must be generic**, parameterised by quiz. Do not hard-code six axes anywhere outside the Compass's own data and renderer.
4. **The article system is a first-class part of the site**, not an afterthought bolted on. Articles and quizzes should cross-link (a gratitude article links to relevant quizzes and vice versa).
5. Routes should be namespaced per quiz from the start, e.g. `/q/theology-compass`, `/q/deadly-sins`, `/r/theology-compass/<code>`. The current Stage 0 scaffold uses single-quiz routes (`/quiz`, `/r/[code]`) and **must be refactored** in Stage 2.

The fairness promise carries across the whole platform: every position described in words its holders would accept, nothing invented, everything citable. A discernment-minded audience will screenshot anything unfair, so rigor is the moat.

## Name and domain — SETTLED, do not reopen

**The name is `wiserwalk.com`. The owner chose it himself on 2026-09-03. The naming search is over — do not reopen it, and do not question the choice.**

Note he had earlier rejected the word "wiser" as "weird to say"; he has since overridden his own objection and picked `wiserwalk` anyway. That earlier rejection is void. Every other rejection below still stands for copy and sub-brand naming.

- **Repo:** https://github.com/sunjolol/wiser-walk (public), pushed 2026-09-03, branch `main`.
- **Still-standing rejections** for taglines, quiz names and sub-brands: the word "faith" (feels like a church); every `-ward` name; "almost / not yet / barely" framings (negative marketing); theology-jargon compounds (`creedmap`, `theoaxis`) because not all quizzes are theology; and templated riffs on `understandmyself.com` / `clearerthinking.org`, the two names he admires as models.
- **The search that produced the shortlist** (~19,900 `.com` checked via RDAP, 233 verified-available names) is archived at https://claude.ai/code/artifact/48f38a40-737f-48b5-ae88-0e63c5f1ac1f. Do not re-run it.
- Useful fact if a domain question ever recurs: Verisign runs **no premium tier on `.com`**, so any unregistered `.com` costs the standard ~$11/yr. Check with `curl -s -o /dev/null -w "%{http_code}" https://rdap.verisign.com/com/v1/domain/NAME.com` — 404 = available, 200 = taken. Always run a control string.

**Rename still pending:** the local folder is still `theology compass` and the package/project names still say `theology-compass`. The GitHub repo is already `wiser-walk`. Renaming the rest is unfinished business, not a decision to revisit.

State: local git repo initialised, **one commit** `c8fd322`, 137 files tracked, `node_modules` excluded. Authored as `Light <serenitybackto@gmail.com>` — he was offered a GitHub noreply address to keep his email out of public history and **chose to keep his real email**. Do not change it.

## RULES FOR EVERY QUIZ PAGE (the owner, 2026-09-24): binding for every quiz now and later

He called the old ordering "the chaotic mess these quizzes are now in" and asked that what he standardized "turn into
rules so they don't happen again". `site/scripts/quiz-page-test.mjs` (postbuild) fails the build on rules 1 to 5.

1. **No accent text (kicker) above any section title on a quiz page.** Only two stay: "When you are ready" on the
   bottom start box, and "Alongside this quiz" ("this test" on the personality test) over Read next.
2. **One bottom start box for every quiz**, drawn by `site/src/components/QuizFoot.astro`: "<N> statements|questions,
   about <M> minutes.", no sentence under it, compact (no min-height).
3. **The foot is always, and always last: How to answer (the Psalm quiz: How it works), the start box, Read next.**
   QuizFoot renders the three in that order; each runner (the statement runner in `q/[quiz].astro`, `ReadingRunner`,
   `PersonalityRunner`) puts it last in its intro. Everything else goes above it.
4. **Never "Answer honestly rather than correctly. There is no score to win."**
5. **Read next always shows exactly three articles:** the quiz's own first, then a stable seeded fill
   (`site/src/lib/read-next.ts`).
6. **Don't give the results away on a quiz page** ("let it be a surprise": the traps and anger grid came off the
   personality page).
7. **Outcomes get real pages, not popups.** A result page may keep popups, each with a pill clearly labelled as opening
   the outcome's page in a new tab.
8. **Touch-only hints ("Tap a type…") only under `(hover: none) and (pointer: coarse)`**, never on desktop. Where the
   sentence after it depends on the hint, desktop gets the "Click" wording instead (he approved "Click any line to open
   it." on the personality result, 2026-09-24).
9. **A special card among cards looks like its siblings**, marked only by an icon and a small tag.
10. **No placeholder pictures** (a monogram where a face should be is "not acceptable").

## NEXT SESSION STARTS HERE (after 2026-09-26): THE OTHER 24 BIBLE FIGURES, AND PAGE 10'S SHARE CARD

**Peter's enriched page is LIVE** (main, /figure/peter/). He loved it: "Peter's page looks fantastic, if we can complete
the rest of the Biblical figures to this degree that would be amazing." Two jobs, in his order, and his standing steer:
"be as efficient as possible where it makes sense (obviously we want to maximize quality so don't over-do it, but
don't over-do verification checks either that eat up usage)". He wants weekly usage left for the 12 saints after.

**1. Page 10 of the Christian Personality Test: the role card.** He opened a FRIEND's result link and saw no shareable
card on page 10, on desktop or phone, though the test says it has one. What the code shows (checked 2026-09-26, not yet
tested in a browser): `components/PersonalityResult.astro` page 10 has a "Save this card" button (`data-pq-card="line"`,
drawn by `drawCard('line')` on a 1080x1350 canvas) but it carries `pq-mine`, which `styles/pages/personality.css` hides
unless `<html data-pq-who="taker">`: only the device that took the test sees it. So a visitor never sees any card. To do:
(a) take the test (or use a taker device) and check the role card at 390 and 1360: it must print the reader's own "how we
got there" reasons, the logo (brush W + wordmark, as on the type card) and the link; (b) decide what a visitor sees:
recommend showing the card to visitors too, with "Take the test for your own card" beside it, since his point is that
the cards market the site. His original note, verbatim: "Page 10 is great, The Giver card is the exact 'personalized
card' feel I love from personality tests. I'd go so far as to say there should be a share/save image button for it, I
could see people wanting to share it or keep it. And the 'how we got there' bubbles should be included in the
shareable card/image because that would be even more powerful because two people could have The Watcher but different
reasons why, also add our logo same as the first card on page 1 and a link to the quiz somewhere in the card so it
becomes a proper share-able card just like the initial result card. The idea is having TWO different cards that are
both visual, personalized, and market our site for us is HUGE, and I mean MASSIVE because it allows us to
self-perpetuate as people take and share the quiz - maximum SEO friendliness, maximum marketability, maximum user
experience/fun."

**2. The other 24 Bible figure pages to Peter's standard.** How it works and the rules: `design/saints-hub/README.md`
"BIBLE FIGURE PAGES DRAWN LIKE A SAINT'S"; the exemplar is `site/src/data/figures/peter.json` (SaintPage shape).
Efficient method: one Opus writer per figure (research and write together, verify-quotes until it exits 0, pictures
in `site/public/img/figures/<slug>-band.jpg` and `<slug>-2.jpg`: NEVER overwrite `<slug>.jpg`, Doré's plate), and ONE
light checking pass per few figures, not three checkers each. The person shapes the page: thin records (Abigail,
Rahab, Hannah, Jonathan) get short pages. Type boxes only for the 7 still to do with a type (Moses, Gideon, Elijah, John
the Baptist, Martha, Barnabas, Paul). Care points: Jesus (reverent capitals everywhere; no "Is He a saint?"; His page
needs its own plan, ask him), Mary of Nazareth (Catholic, Orthodox and Protestant views in their own words), Judith and
Tobit (which Bibles hold their books), Old Testament people ("honoured as a saint in the Orthodox and Catholic
calendars", never "St Moses"). Then measure each sheet (`MSYS_NO_PATHCONV=1 node design/saints-hub/tools/measure-sheet.mjs
/figure/<slug>/ 4321`), render its card (`node design/og/render.mjs site figure-<slug>`), test, push.

**3. Then the 12 saints** (`design/saints-hub/research/NEXT-12.md`, with his ruling at its top).

## (earlier, 2026-09-26) BIBLE FIGURE PAGES FIRST, THEN THE NEXT 12 SAINTS

His notes on the saint pages are all done and live (main `b02b30a`): Chrysostom, Jerome and Cassian tiles that explain
themselves; Boethius's band is Thevet's 1584 engraving and his page has "Who is Lady Philosophy?" (he had taken her for
a real woman: she is Philosophy personified); Gregory's three new tidbits, "10k", "Love itself is knowledge."; Isaac's
band and card are the modern icon he chose from Flickr (CC BY-SA 2.0, credited to the photographer, Ted: the licence
requires the name; his call that it is fine to use). Every other saint page is approved with no notes.

His order from here (his words: "enhance the Biblical figures pages first ... before diving into" the saints):
1. **Bible figure pages** (`/figure/<slug>/`, 25 of them): they should become "a lightened version of the saints
   pages, but more complete than ... now". The trigger: the hub's thumbnails show a personality type for 8 of them
   (Moses, Gideon, Elijah, John the Baptist, Martha, Peter, Barnabas, Paul) that their pages never mention or explain.
   **Peter is built (his go: "Go ahead with Peter first") on the branch `figures/peter`, NOT merged**, previewed at
   https://wiser-walk-git-figures-peter-sunjo.vercel.app/figure/peter/ (behind his Vercel login). Ask how it reads;
   with his go, merge and then do the other 24 the same way (README "BIBLE FIGURE PAGES DRAWN LIKE A SAINT'S").
2. **The next 12 saints** (researched, not built): `design/saints-hub/research/NEXT-12.md`. He wants to reach 40 (23
   live + the 5 personality-test people + 12) and then return to quizzes. His ruling (2026-09-26): saints before about 1400, ideally before
   700, and no modern saints for now (memory saints-scope-before-1400): Teresa of Ávila and Thérèse leave the list,
   Perpetua and Felicity and Catherine of Siena are proposed instead, Joan of Arc (died 1431) is his call. His "40" was
   a miscount, he says: the job is simply the 12. He asked for efficiency: he wants weekly usage
   left to finish the 12 before the reset.

## (earlier) POLYCARP IS LIVE (23 SAINT PAGES); HE BRINGS NOTES ON THE OTHER PAGES

Polycarp's full page, written overnight on 2026-09-25, is LIVE at /saints/polycarp-of-smyrna/ (main `600fd6c`) with
his go ("looks good to port live"). His one change: the section holding the blessing from Polycarp's letter is titled
"A letter he wrote", not "A prayer he wrote" ("it's not a prayer"); `prayer.title` lets any page rename that section
(the other nine pages' passages are real prayers and keep the default). He said he will give his thoughts on the
other saint pages next: each note is an edit on `main`, as below. What Polycarp's page holds and the taste calls
still open on it: `design/saints-hub/README.md` "POLYCARP'S PAGE IS WRITTEN".

## (earlier) ALL 22 SAINT PAGES ARE LIVE (2026-09-25); HIS NOTES NOW EDIT THE LIVE SITE

Done with his go: `saints/the-21` merged into `main` (`82030a4`) and pushed; every test and guard passed; checked
live: all 22 `/saints/<slug>/` answer 200 and sit on the hub, every old `/early-christian/<slug>` and
`/early-christian/` answer 308 to the new address, no page links an old one; four pages looked at on the live site
(the hub and Macrina at 1360, Augustine at 390, Tertullian at 390 in dark). The second checkout and its `site-saints`
launch config are removed. README: `design/saints-hub/README.md` "ALL 22 ARE LIVE".

**Ask how the live pages look to him.** He will keep reading them top down (next after Macrina in the hub's order);
each note is an edit to `site/src/data/saints/<slug>.json` on `main` (template notes: `[slug].astro`,
`SaintExtra.astro`, `saints.css`), pushed after `cd site && npm run test` (memory: push-small-changes). Quotation
changes still pass `verify-quotes.mjs`. The rules his notes made are in the README ("HIS NOTES OF 2026-09-25" rounds
one to three). Polycarp leads the next batch of full pages (`design/saints-hub/tools/promote.mjs <slug>`).

Wherever the older notes below say "the branch", "the preview" or `../wiser-walk-saints`, read `main` and the live site.

## LATEST (2026-09-25, later): HIS THIRD ROUND (ORIGEN TO MACRINA) IS DONE

He is still reading the saint pages top down (next after Macrina in the hub's order). Round three is live in the
template (`main`) and on the preview (branch `93dedea`): a picture viewer on wide screens only, italic book titles
everywhere (`design/saints-hub/tools/italicize.mjs`), the path centred under evenly spaced dots, the later story
under the last words, the doubt box filling an empty wonder cell, 15px under the miracles quote; Antony, Cyprian and
Macrina's own fixes. Macrina's band is an icon HE supplied (no credit, his call; CREDITS.md records it). Rules:
`design/saints-hub/README.md` "THIRD ROUND".

## LATEST (2026-09-25, small hours): HIS SECOND ROUND (JUSTIN, IRENAEUS) IS DONE ON EVERY PAGE

He is reading the saint pages top down on the preview and sending notes page by page. Round two is applied to all 21
(branch `0883b0e`, preview updated): "His path, in order"; number tiles that make sense on their own; "Did you know?"
(`tidbits`) filling the numbers column; more public-domain art on wide screens only (`gallery`); the taller trait
of each desktop row on the left. Rules: `design/saints-hub/README.md` "HIS NOTES OF 2026-09-25, SECOND ROUND".
Measure any sheet with `node design/saints-hub/tools/measure-sheet.mjs <slug> 4344`. On `main` (`91115e6`, live): the
template, Martin's traits, and van Dalen's engraving on the /early-church-on/ quiz plate (he disliked the Jordaens).
**Polycarp leads the next batch of full pages** (his ask). Taste items he may raise: several pages now share Jan
Luyken's 1698 prints of the Fathers (a consistent series, but repeated across the hub); Macrina's new picture is a
19th-century devotional print; Lactantius's and Cassian's are Nuremberg Chronicle stock woodcuts (captioned as such).

## (earlier) HIS FIRST ROUND OF NOTES IS DONE; HE IS STILL READING THE SAINT PAGES

He sent notes on the live site and on Clement's preview page, and said he would keep reviewing the other saint pages
and send more. Everything he listed is done: `main` commit `31f4a16` (live, checked), branch `saints/the-21`
`b6c88f2` (Clement's data `ec3c731`, then `main` merged in; preview updated). The rules it produced are in
`design/saints-hub/README.md` "HIS NOTES OF 2026-09-25": the hub has no collections, `/early-christian/` 308s to
`/saints/` (his answer to call 3 below), the pager is sticky at every width (`.sheet:has(.sp) { overflow: clip }`),
the roles path is balanced on every page, portraits first among friends, status pills 50 characters at most. Also
live: the Quizzes menu is names only, the footer lists his five quizzes, `/compare/` wears El Greco's Peter and Paul,
`/early-church-on/` and its 23 question pages end on the quiz plate (Jordaens), the early-Christian quiz page says
"Meet all 30" (the hub's count, linked) and has a "where they stood" card. The quiz plate `.squiz` is in kit.css.

**A second checkout of the branch exists at `../wiser-walk-saints`** (git worktree, its own node_modules, the fetched
sources linked in under `design/saints-hub/sources/people`), served by the launch config `site-saints` on port 4344.
Edit saint data there, run verify-quotes and `npm run test` there, push the branch. Template fixes go to `main` first,
then `git merge main` in the worktree (the template files conflict harmlessly: take main's, they were identical).

Open for him (taste, not done): the `/compare/` band is 653px tall on desktop because the painting is kept whole
(a laptop's first screen is all band); crop the file to about 1200x1200 if he wants it shorter.

## NEXT SESSION STARTS HERE (2026-09-25, late): HE OPENS WITH HIS NOTES

**He said: "I have many notes on the live site ... I will open by giving my notes while I review each saint's page
and also make notes on those too."** So the session opens with his notes, in two kinds:

1. **Notes on the live site** (wiserwalk.com, `main`): what shipped today is the Saints hub `/saints/`, Martin's page,
   the Learn menu, two-line items in every header menu, the two small-text sizes site-wide (about 107 rules, the games
   too; audit and every call in `design/small-text/`), person links switched on in the personality test, and four
   early-Christian quiz data fixes. Small changes he asks for go straight to `main` after the tests (memory:
   push-small-changes).
2. **Notes on each saint's page**, which he reads on the PREVIEW of the branch `saints/the-21` (NOT merged):
   https://wiser-walk-git-saints-the-21-sunjo.vercel.app/saints/ (behind his Vercel login). Work on that branch:
   `git checkout saints/the-21`. Pushing it updates the same preview link.

**How to act on a saint note:**
- The page is `site/src/data/saints/<slug>.json` on the branch; it is now the only copy that counts. The drafts in
  `design/saints-hub/pages/` are stale working copies (untracked): do not edit them.
- A note that applies to every page is a change to the template (`site/src/pages/saints/[slug].astro`,
  `site/src/components/SaintExtra.astro`) or `site/src/styles/pages/saints.css`, made once. Martin's page is on `main`
  and uses the same template: a template fix goes to `main` too (cherry-pick), as the fixes of 2026-09-25 did.
- Any new or changed quotation: fetch its text into `design/saints-hub/sources/people/<slug>/` (gitignored, this
  machine only), add its evidence to `design/saints-hub/research/people/<slug>.quotes.json`, and run
  `node design/saints-hub/tools/verify-quotes.mjs <slug> site/src/data/saints/<slug>.json` until it exits 0.
- Then `cd site && npm run test` (saints-test.mjs checks listing lengths, the 40-60 word answer, feast order, no "St"
  for Origen/Tertullian/Lactantius, pictures on disk, and that moves and redirects agree), and look at the page at 390
  and 1360 (`sh design/tools/shot.sh`; the dev server config with the account header is `site-acct`, port 4322).
- What each checker left open, per page: `design/saints-hub/research/review-2026-09-25/checker-verdicts.json` and the
  `checker_2026_09_25` blocks in each `research/people/<slug>-facts.json`.

**Three calls I asked him (he may answer them in his notes):** (1) length: the pages run 2,800 to 6,400 words
(Martin about 3,200), keep or trim the thin records (Isaac, Lactantius)? (2) Benedict's band is a small figure in a
landscape and Macrina's a statue photographed against the sky: keep or find others? (3) once all 22 move, does
`/early-christian/` itself redirect to `/saints/` (the plan says yes; that page alone marks the reader's two quiz
matches)? Taste items the visual check left (his call, not fixed): uneven blank space at the foot of life-moment cards,
a lone card on the last row of some grids, a taller band on Clement and Origen because of their status pill.

**When he says go:** `git checkout main && git merge saints/the-21`, `cd site && npm run test && npm run build` (all
guards), push, then check live that each `/early-christian/<slug>/` answers 308 to `/saints/<slug>/`.
`design/saints-hub/tools/promote.mjs <slug>` does the whole move for any future saint (the five personality-test
people with no page yet: Arsenius, Monica, Cuthbert, Guthlac, Philip Neri; then Athanasius, Ignatius, Polycarp, Moses
the Black, Perpetua, Ephrem). Not started: the printable saint card (show him a mock-up first) and the group pages.

## (earlier the same day) THE SAINTS HUB IS PORTED; THE 21 ARE BEING WRITTEN

Read `design/saints-hub/README.md` "PORTED 2026-09-25" first. Live (with his go on the port): the two small-text
sizes site-wide (tokens in kit.css, `scripts/small-text-test.mjs`), the Learn menu and two-line items in every header
menu, `/saints/` and `/saints/martin-of-tours/` (template `site/src/pages/saints/[slug].astro`, data
`site/src/data/saints/<slug>.json`, shape `site/src/lib/saints/types.ts`), person links switched on. **His answer on
the 21 (2026-09-24): they stay at `/early-christian/` until each has a page to Martin's standard, then move one by
one** (the move procedure is in the README). **His steer (2026-09-25): the person shapes the page, not the template**:
same sections, but as many moments, miracles, traits and lines as each record genuinely holds (README, top section).
**The 21 are written, checked and on the branch `saints/the-21`**, previewed for him at
https://wiser-walk-git-saints-the-21-sunjo.vercel.app/saints/ . Merge only with his go (README "THE 21 ARE WRITTEN").

## (earlier) PORT THE SAINTS HUB LIVE (2026-09-24, late)

**He approved the final mock-up ("Looks great") and wants it live.** The port checklist is
`design/saints-hub/README.md` "APPROVED 2026-09-24: PORT IT LIVE"; read that README whole first. The one question to ask
before building, in plain words: only Martin has a full page's worth of checked facts. Should the other 21 early
Christians move to `/saints/` now, in the new design, with what is already checked (then deepened one by one), or
stay at `/early-christian/` until each has a full page? The brief's lean: move now, because the move costs more every
week they sit at the old address, and their content is no thinner than today. Ship in reviewable chunks (kit and
menu, then the hub and Martin, then the move), tests first, every page at 390 and 1360 in light and dark.

## (earlier the same evening) BUILD THE SAINTS HUB

**Read `design/saints-hub/README.md` first, whole.** The owner approved a Saints and early Christians hub
(`/saints/`, one rich page per person, a "Learn" menu) and said yes to all four decisions in its plan. He wants
it done right from the start ("I really want to make sure we nail this right from the start and do it right").
Step one: the tap-through mock-up is published (https://claude.ai/artifact/2XipDT23JpGHU1kYKi7VX9: the Learn menu,
the hub, St Martin of Tours with checked facts). He reviewed draft 1 the same evening (14 notes, "we are definitely
on the right track"); **draft 2 is at the same link** with every note applied and a proposed miracles section. His
notes are now binding rules for every saint page: README "Draft 2 of the mock-up". A second round made **draft 3**
(same link); he will take one final visual pass and then it ports live. Two site-wide rules came out of it
(README "Draft 3" and "SMALL TEXT: TWO SIZES"): the Learn menu's two-line items go to every header menu at go-live,
and small text uses two sizes, labels .7rem at weight 600 and tags .6rem, as tokens, never below .6rem.

Also live that day (commits 0026af9, fd69270): the Oak has saints (Martin, Benedict, John the Baptist), the Hearth
adds Cuthbert and Guthlac, the Spark adds Philip Neri; the opposite panel leads with the opposite's person; saint
cards are built to link but `lib/person-links.ts` returns null until the hub exists; the gifts "Not scored here"
paragraph is gone from its result page too; the site icon is his brush W.

## (earlier the same day) HIS QUIZ-PAGE NOTES ARE DONE AND THE EIGHT TYPE PAGES ARE LIVE

Shipped with his list of 2026-09-24 (the commit after `e7fca25`): the rules above on all seven quiz pages; the eight
type pages at `/personality-type/<key>/` plus the index `/personality-type/` (`site/src/pages/personality-type/`,
words from `personality.json` only, the reader's own type marked by `PersonalityMine.astro`); the result page's type
popups keep a new-tab "Explore" pill; one crop point per painting in `site/src/lib/personality-art.ts` (the Deep Well's
faces at the well); St John Cassian's face (the 9th-century Sacra Parallela medallion); the Hearth's painting is now
P. S. Krøyer's "A Luncheon" (1893), picked from eight researched candidates
(`design/quiz-ideas/personality/hearth-candidates.json`, ranked; runner-up Larsson's "Breakfast under the Big Birch"); the Compass's band wears its Orthodox example wheel on the right (no
visible caption: he had the Compass card's caption removed); the gifts page's "Not scored here: apostles…" paragraph is
off the quiz page (still on the gifts RESULT page: ask if he wants it gone there too).

**NEXT SESSION:** ask how the changes look to him, then how the test is playing for real people.
Later, only if needed: store the type on the short link when the tally passes ~100,000 results. Known and pre-existing, not from
this build: `sim-figures.mjs` misses one target (Judith closest for 1.1%, under the 1.5% floor), same on the old code.
Read `design/quiz-ideas/personality/README.md` ("Shipped") first. He approved the full-report design
(https://claude.ai/artifact/TuppmFsRVEY1r5LWWRsj6D, "extremely good"): eight types (Gregory's four dispositions x quiet /
restless mind), 72 questions on 7 answer points, the private "where the fight is" page (Cassian's eight thoughts; the
sins and gifts quizzes are suggested as cards opening in a new tab, and their results may ADD context beside this
result but never change it: his ruling of 2026-09-23), "how common your type is"
built now and switched on automatically at 50 real results (leaning percentiles at about 200), fear / reward / love left
out (a possible separate quiz later). His notes: page 10 must name ONE clear role (now Cassian's seven "lines",
Conference 14.4) with how you got there, what the saints say and good tidbits; no confusing buttons; the demo's flat,
grey, text-heavy look gets a FULL design pass (colour, images, every portrait filled) once the framework is complete.
**The tap-through preview with that design pass is published (2026-09-24): https://claude.ai/artifact/WQ8CjTEjwAfk52yLutWsBG**
(built from `design/quiz-ideas/personality/preview/`, README "The tap-through preview"). His notes on draft 2
(2026-09-24) were all applied in draft 3 at the same link: TWO share cards (type and role) with his logo image and the
link printed on them (memory: share-cards-never-regress, logo-always-with-name), a sticky pager, page 2 back to the
avatar layout with Gregory's full trap sentence and real saint pairs as opposites, starry dark panels, a text audit (63
fixes, 153 quotations re-checked). He took it, called it ready and asked to push it live (2026-09-24) with mid-quiz
progress saving; it is named **"Christian Personality Test"** (URL stays /q/personality/), and the quiz page gets
deep dives. Build: `design/quiz-ideas/personality/BUILD-BRIEF.md` (four Opus builders; private answers never leave
the device: `score(answers, pub)` + `derive()`).

## (previous) QUIZ #4 AND THE QUIZ STANDARD ARE LIVE (2026-09-23, night)

Everything below shipped on 2026-09-23 with the owner's go, in order: Phase A `72f1dc2` (he verified it: "Everything
looks great"), wave 1 `4238c9f`, quiz #4 `0f6ea8a` plus the deploy fix `d53370a`. Ask how quiz #4 and the new
sharing look to him before starting anything new. Next in his build order: #1 the Personality Quiz (Gregory the
Great, Pastoral Rule Book III), with the Psalm and #4 method (design/quiz-ideas/fathers/README.md).

- **The quiz standard** (memory: quiz-standard-bar; briefs in `design/share-standard/`): every result has a public
  link of 6 characters or fewer (`lib/engine/links.ts`; gifts and #4 keep a key in Supabase's `short_links`, which
  he created: /account/setup/ is all green), a personal link preview (141 `r-<quiz>-<slug>.jpg` cards, picked by
  `resultCardFor`), his brush W and the wordmark on every card, two labelled link boxes, Share only on touch
  devices, `SaveResult` ("Save your result" / "Try it for yourself" / nothing signed in), every email box starting
  an account, and the reader's own answers marked on tradition, figure, axis, psalm and early-Christian pages
  (`lib/mine.ts`).
- **Quiz #4 "Which early Christian thinks like you?"** at /q/which-early-christian/: result shape `kindred`
  (`strategies/kindred.ts`, parity-tested against design/quiz-ideas/fathers/score.js), 22 person pages at
  /early-christian/, 23 question pages at /early-church-on/. Source of truth: design/quiz-ideas/fathers/
  (table.mjs, excerpts.json, people.json -> model.mjs -> quiz.json -> site/scripts/build-early-christian-data.mjs).
  All 22 portraits are public domain or CC0. Lines checked against 154 source pages (VERIFY.md).
- **Lesson from the failed first deploy:** Vercel's clone has files outside `site/` but not gitignored ones. Before
  pushing a build script, run it with its gitignored inputs moved away.

## (previous) BUILD QUIZ #4, "WHICH EARLY CHRISTIAN THINKS LIKE YOU?"

**He said "Let's move on to the next quiz, which if I recall was #4" (2026-09-23).** Start on it. Build order he set:
#2 Psalm (DONE, live), **#4 now**, then #1 ("Personality Quiz", Gregory's Pastoral Rule Book III), then the rest he
liked. The idea as he approved it ("Love this! ... change nothing else because it's a brilliant idea") is #4 in
`design/quiz-ideas/NEXT-TEN.md`: agree or disagree with REAL positions of early Christians in plain words, no names
until the end; the result is the Father nearest you and the one farthest, each with the real line that shows why
(Tertullian vs Clement on philosophy, Cyprian vs Novatian on second chances, Chrysostom on the poor, Basil's "whose
feet will you wash?"; Jerome really did write furious letters). Nearest by position, never a percentage. **Title,
RULED:** "Which early Christian thinks like you?" everywhere space is tight (menu, search, share card); "And which
would argue with you?" printed directly under it on the quiz's card and start page.

**How the Psalm quiz was made, which he loved ("phenomenal and very powerful"); repeat it:** research the primary texts
first (agents fetch and verify; the main session reads the originals itself and writes the questions); questions
even-handed and generic, specificity saved for the reveal; test on simulated people (persona answers, deterministic
scoring in the script, a separate judge) before showing him; show him a tap-through preview artifact BEFORE building
into the site; build with Opus builders under strict file ownership, then check every page at 390 and 1360, light
and dark; ship with a way to BROWSE the results from the quiz page (he asked why Psalm lacked one) and propose extra
pages to him before building them; adversarially verify any article or claim against the source before publishing.
Rules learned today: plain short sentences (comma stacks read as AI to him); NO section numbers or § marks shown to
readers, name the source only; capitals for every pronoun for God INSIDE quotations too (prefer the BSB); images may
be downloaded without asking. Ultracode is on: use workflows, `model: 'opus'`.

**The Psalm quiz, for reference:** live at `/q/which-psalm/` with the `/psalm/` guide, 78 psalm pages with "Close to
this", and the article `how-to-pray-the-psalms`. How it is built: `design/quiz-ideas/psalm/README.md` "Shipped". The
letter pairs about a hundred psalms with needs; the quiz's 53 are a selection, never "every situation he named". In
Who Said It? a first-person Me/My for God stays lower case so the speaker is not given away (his rule otherwise holds
everywhere: `demos/*/capitals.json`). The section below on the scrapped list explains what went wrong last time; it
still applies.

Everything from 2026-09-22 is live on `main` (last commit before these notes: `b778859`). He reviews on the live site;
small changes he asked for are pushed without waiting (memory: push-small-changes).

## LIVE since late 2026-09-22: the standardize pass (see HANDOFF.md "LATEST")

One card look, one Compass card, pill buttons, no icon tiles or text-only chips, centred header, darker textured
dark theme; the daily round is called **Today's Challenge**. He is checking the game start screens himself. Design
tweaks are done SOLO (no reviewer fan-outs: he found 3M+ tokens for cosmetic changes excessive).

## Earlier on 2026-09-22: the first quiz-idea list was scrapped (why, so it is not repeated)

Live today: accounts public, the account design pass, his logo (brush W + Amatry wordmark as outlines), and
headlines in Philosopher Bold (Poppins and Inter kept for everything small; he rejected PT Sans as ugly).

**His verdict on the twelve researched quiz ideas: "Total scrap."** In his words: "None of the quiz proposals are
good, besides maybe the 1,400 year old personality test - but only the premise, the questions themselves and the
answers that go with them are very low quality and shallow, and feel like nonsensical AI wrote them rather than
them being coherent and intelligent and cohesive." What he asked for in the first place: research what Christians
and people in general want to know about themselves, and quizzes whose questions are DISGUISED (everyday questions
that do not visibly point to Scripture) while their results are honestly derived from Scripture and the early
Church Fathers, "a very subtle, nuanced, and difficult balance... it will require the most care". The one premise
he kept: a personality test drawn from Gregory the Great's Pastoral Rule (c. 590).

What went wrong, so it is not repeated: ideas and items were mass-produced by parallel agents (12 ideas, 4 writers,
critics, revisers), so every quiz came out in the same shape: a "scenario" stem with four equally pleasant options
keyed one-to-one to a category. The options were balanced against loading, and in doing so became interchangeable
and shallow; nothing tied the questions to each other or to a real model of a person. Breadth was optimised before a
single quiz was proven. Next time: fewer ideas, thought through by the main session itself from the primary text
up (read Gregory's Book III whole), with a coherent logic that runs from what the source actually says about kinds
of people, to what an honest question can reveal, to a result that explains the person back to themselves; show him
ONE quiz complete and deep before any list. Ask him what "coherent and intelligent" looks like to him if unsure (in
plain words, with a real example in front of him). The earlier memory notes on loaded surveys and "fun means
personal" still apply.

## ACCOUNTS ARE PUBLIC (2026-09-22, his go: "yes go public now")

`ACCOUNT_LINKS_LIVE` is true. He set up Supabase + Resend (sending domain `mail.wiserwalk.com`,
`ACCOUNT_EMAIL_FROM` set), signed up for real, and the account flow got a full design pass
(`design/accounts/PASS-BRIEF.md`; exemplar `site/src/pages/account/sign-in.astro` +
`site/src/lib/account/form.ts`). Header: guests "Log in | Sign up", logged in "My profile".
Words are "Log in / Log out / Sign up" everywhere (routes unchanged). NEXT: the personal
profile ("You, so far": https://claude.ai/artifact/AziUmP2qvxYgYBSnCaQkYo; weakness part behind
a "Show it" tap; "How do you love?" approved) and a researched list of 10+ quiz ideas with
disguised, scripture-grounded items for him to pick from. Build no new quiz until he picks.
Paragraphs below that say accounts are hidden are history.

## WHERE THINGS STAND (end of 2026-09-21, second session): READ HANDOFF.md FIRST

**LIVE on `main` since 2026-09-22 (his go, unseen: "if anything is wrong I'll just revert/change it"): the
itch.io kit and six task-list items: the twelve `/compare/` pages, the printable gifts test, the dataset, the
short `/method/`, self-hosted fonts and the seven deadly sins quiz gone live.** Item 14 (articles)
needs his Bing Keyword Research numbers first. Details and lessons: `HANDOFF.md` "START HERE (second session)".

The redesign is LIVE on `main` (picture bands site-wide, 11 articles with a topic filter, `/me/`,
`/support/` to his Ko-fi, Donate in the header, Brevo sign-up on, 42 social cards and new search copy).
**The DAILY SET's display was REJECTED on 2026-09-21 and the feature is SHELVED** on branch
`shelved/daily-set` (= `main` + one commit; the same commit is still on origin as `design/home-dawn`).
The concept and the back-end are fine (`site/src/lib/daily.ts`, the `sls.daily` / `wsi.daily` storage
contract, the games' recording logic: keep them). The presentation is, in his words, not salvageable and
needs "a totally new approach": he dislikes the placement; the score, rank and button feel "super clumsy,
especially on mobile, like it was an afterthought rather than an integral feature"; the hit/miss marks look
"super scuffed" and "glitchy" (weird outlines, spacing, mixed sizes and colours); and "Today's Ten" does
not say what it is: call it **"Today's Challenge"**. When it resumes, throw away every piece of its display,
design it as a first-class feature phone first, and show him a mock-up of the marks and the placement
BEFORE building. Do not raise it until he does, or until accounts are done.
**Accounts are BUILT and LIVE BUT HIDDEN on `main` (pushed 2026-09-21, commit `08e64af`, with his go on the condition that nothing about the site changes; checked: the visible text of every existing page matched production). He will make the Resend account and follow the README "later": it is there "in case the site gains popularity". Do not nag him about it.** Read
`design/accounts/BUILD-BRIEF.md` (the binding spec) and `site/src/lib/account/README.md` (his numbered
setup steps) before touching any of it. What is settled: Supabase Auth + Postgres on the free plan;
`@supabase/supabase-js` in the browser by dynamic import only (`site/src/lib/account/client.ts`); WE send
the account emails (Supabase's Send Email hook calls `/api/auth/email`, which sends through
`site/src/lib/email/send.ts`: Resend if `RESEND_API_KEY` is set, else Brevo; Resend is the recommendation
because Brevo's free plan rewrites every link, records the links people click, and stamps its name on the
email); the emailed link lands on `/account/password/`, which calls nothing until the person submits;
`/me/` is the account's home and still paints from the device shelf first. TWO SWITCHES keep it hidden:
`ACCOUNTS_READY` (the two `PUBLIC_SUPABASE_*` values) and the committed constant `ACCOUNT_LINKS_LIVE`
(false). A signed-in browser sees the account either way, so he can test on the live domain; a Vercel
PREVIEW build shows signed-out visitors' entry points (`IS_PREVIEW`); production shows none until the
constant is flipped WITH HIS GO, and `npm run test:switches` must pass before that flip. Vercel previews
sit behind a login wall, so Supabase's hook can only reach production, which is why the hidden code is on
`main`. `/method/` and `/about/` print today's wording until the two PUBLIC values are set (`ACCOUNTS_READY`). Nothing has run against a real Supabase project yet. My calls he has not ruled
on: marketing is a plain notice with an off switch on `/account/` (no tick box); deleting an account also
removes the mailing contact. Seven deadly sins is still an unaudited draft. **`HANDOFF.md` has the state, the next steps and how to ship a small
fix without releasing the branch.**

## THE OWNER'S DIRECTION CHANGED ON 2026-09-20. This overrides older sections below

In his words: he wants **login and profiles with stored data**, so users see all their scores, stats
and results, and the site cross-references quizzes and games into one overall profile that gets more
powerful the more someone does. Finding old results is impossible today and "feels really bad". He
wants **sign-up to capture emails so he can market to users**, has wanted to **make money** from this
"from day 1", and wants every part of the app judged under two lenses: (1) as engaging, fun, enticing
AND useful as possible; (2) as SEO-friendly and marketable as possible, so traffic is organic and he
never pays for ads or has to build a social following.

- **Void:** the "no accounts, nothing stored, nothing leaves your browser" stance and every pledge of
  it (removed from the site on 2026-09-20; `/method/` still describes how things work TODAY and must
  be updated when accounts ship). The growth plan's "nothing needing accounts, a database" and the
  kill-list line "anything social with accounts" are overridden.
- **Still standing:** count knowledge, never devotion; no match percentage between two people or between a
  person and a saint (from the 14 Sep growth plan's kill list; the owner says he never made a wider rule, so
  population stats such as "about 1 in 8 people are this type" ARE allowed, from real data, ruled 2026-09-23);
  real data only; both poles named; the fairness rules; no AI chat over theology.
- **He finds the site over-explained and full of "inside baseball"** (method, audit changelog, reviewer
  counts, draft explainers). Say a thing once, where it is needed. No process talk on pages whose job
  is to get someone into a quiz, a game or an article. Method is out of the nav and footer; `/about/`
  links to it.
- **Email capture is NOT switched on in production:** `/api/subscribe` answers 503 "Sign-up is not
  switched on yet" because `MAILERLITE_API_KEY` is not set in Vercel (see `site/src/lib/email/README.md`).
  Only the owner can set it. Until then the footer form and the result-page form collect nothing.
- **His answers to the plan (2026-09-20, late), binding:**
  - **Email provider: NOT MailerLite** (that account is his other business's). Must be free to start.
    Built: a Brevo provider (`site/src/lib/email/`, chosen when `BREVO_API_KEY` is set; free plan 300
    emails a day). He must make the Brevo account and set `BREVO_API_KEY` + `BREVO_LIST_ID` in Vercel
    himself (steps in `site/src/lib/email/README.md`). Until then sign-up answers "not switched on".
  - **Step 1, "My results" on the device: approved and BUILT** (`/me/`, `site/src/lib/shelf.ts`).
  - **Step 2, accounts: he finds email-link-only sign-in "SUPER annoying".** Wanted: the sign-up box
    asks for an email only; the emailed link lands on a page where they SET A PASSWORD; after that
    they sign in with email and password; "forgot password" sends the same kind of link; Google
    sign-in later. Keep it simple and fool-proof. Proposed stack: Supabase Auth (free tier) with
    Brevo SMTP for its emails. He must create the Supabase project and set its keys; ask before
    building.
  - **Step 3, the profile: approved.** Engagement: he especially wants the **daily game set** and
    wants the whole site to feel like "a self-perpetuating game" people return to for novelty. Lean
    into that wherever possible (still: count knowledge, never devotion).
  - **Articles: he wants them published so he can review them.** The eight checked drafts are
    published on `design/home-dawn`. More should follow.
  - **Money: donations first**, ads only if donations fail, a paid plan maybe later. Built: `/support/`
    and a footer "Support Wiser Walk" button; the giving link is `PUBLIC_SUPPORT_URL` (button disabled
    until set). Recommended to him: Ko-fi (no platform cut; card fees of about 3% exist everywhere;
    Venmo personal accounts are not meant for this). He must open the account and give the link.
- **Design language, accepted and LIVE since 2026-09-21** (merged from `design/home-dawn` with his
  yes). No one-word last lines anywhere: he called orphans "super sloppy" (`text-wrap` rules in
  `site.css`). Sky hero; the Compass as a full-width
  room; other quizzes on a scroll rail, each with a Doré engraving printed soft sepia; games on a dark
  band over a chess board and clock; ARTICLES WEAR PUBLIC-DOMAIN PAINTINGS IN COLOUR (front matter
  `image`, `imageAlt`, `imageCredit`, `imagePosition`; he loves the old-art look but does not want
  the engraving style over-used, and wants colour); the footer opens on a walker at dawn with the
  sign-up. Credits: `site/public/img/CREDITS.md`. Giving goes to his Ko-fi page (`site/src/lib/support.ts`).

**Models: Opus is the default for every agent; in a Workflow an `agent()` with no `model` inherits
Fable, so set `model: 'opus'` explicitly.** Fable only where its judgement is the point. The owner
said this twice.

## THE RICHE PASS (shipped 2026-09-20): how every page is designed now. Read before touching any page

On 2026-09-19 the owner rejected a first site-wide design pass (a panel behind each heading) as
"INSANELY lazy", "SO boring" and "BARELY different from the original boring bland non-designed
layout". He ordered: nothing but design until it is right, every page as refined as the result page,
his original inspiration skins used as the reference, and **light theme by default**. The second
pass he accepted with "Ship it" on 2026-09-20. It is live.

- **Light is the default.** The site no longer follows the system setting. Dark happens only through
  the bulb or a link ending in `?theme=dark` (which also persists). The game follows the same rule.
- **The design language** comes from the skins in `C:/Users/Light/Desktop/claude/design and theme
  examples` (Riche 5e character sheet, Epitaph, Rose Water, All Hope Abandon) and the locked demo.
  Captures of them are in `design/refs/`. LOOK at them before designing anything.
- **The kit** is `site/src/styles/kit.css` (tokens stay in `site.css`): the framed sheet on a striped
  ground, the band (`Hero.astro`: full-bleed wash, a giant ghost italic word sized to its length, a dark
  chip, two-ink headline, stat tiles), `SectionHead.astro` (lowercase italic display), the stripe card
  (`Card.astro`), dark starry panels (`.dark`, which re-point the tokens so instruments recolour
  themselves), `.feature`, `.spec` dotted lists, `.chips`, `.tiles`, the dark footer. Page groups have
  their own stylesheets in `site/src/styles/pages/` (quiz, reference, prose, play).
- **New instruments:** `CompassFeature.astro` (the flagship card, drawing a REAL audited answer sheet),
  the tradition map on axis pages (all 18 traditions on one rail, numbered dots in computed lanes),
  real compass and rails on tradition pages, `QuizPreview.astro`, a grouped and humanised changelog
  on `/method/`, `/games/` index, and a Games nav item.
- **Rules that held and must keep holding:** real data only on every tile and chart; both pole names
  wherever an axis is drawn; the answering scale is never coloured blue to orange (agreement is not a
  pole); no sources block on tradition pages; the result page instruments were not edited.
- **How to see pages:** the in-app browser pane cannot screenshot while hidden. Use
  `sh design/tools/shot.sh <url> <abs-out.png> <w> <h>` (headless Chrome), `-m` for a true phone
  width through an iframe, and `python design/tools/crop.py` to slice tall captures. Judge every
  page at 390 and 1360, light and dark, before calling it done.
- **How it was made (worked; repeat it):** study the references as images, build ONE exemplar page
  yourself, write a brief (`design/RICHE-PASS-BRIEF.md`), hand page groups to Opus builders with strict
  file ownership, run adversarial screenshot critics (`design/CRITIQUE-ROUND-1.md`), verify their
  findings, fix. About 2.5M Opus subagent tokens.
- Known leftovers the critics raised and the owner has not ruled on: a colour seam inside the outcome
  bars and the hatched 41-59 band drawn over a rail fill on tradition pages. Both live inside the
  result page instruments; do not change them without asking.

**The next-game brainstorm is parked** (pick was "Finish the Verse": first half of a verse, tap the
real second half among four real ones from the same book; per-book landing pages for search).

## RESUMED 2026-09-17: the owner picked a direction. Read this before the paused section below

The owner ended the pause wanting something fun-first and competitive in the spirit of GeoGuessr
(take a corpus that already exists and make it a game). Of the concepts put to him he rejected the
church-interior guesser outright and chose one: **a timed game where a line appears and the player
calls whether it is in the Bible.** His words: "SUPER fun and virtually unlimited". His two demands:
it must be **hard** (he called famous misquotes such as "God helps those who help themselves" low-IQ;
players must not learn to always get it right) and it must have **massive variety** that feels like
never seeing the same line twice. He likes the clock.

A first playable demo was built on 2026-09-18 (https://claude.ai/artifact/WngUq9McGs3tVGLRjGKUoe). The owner
played it, said "Looks good", and asked for it to go live with a card under a new "Games" category on the
home page. **It is LIVE at https://wiserwalk.com/play/sounds-like-scripture/ (shipped 2026-09-18).**

- Working title "Sounds Like Scripture". **"Bible or Not" is a registered mark of an existing app; never use it.**
- The pipeline lives in `demos/sounds-like-scripture/` (read its `SPEC.md` first). `scripts/build-page.mjs`
  writes the standalone demo `demos/sounds-like-scripture.html` AND the site's copy,
  `site/src/games/sounds-like-scripture.html` plus `.meta.json`. Those two site files are **generated but
  committed** (Vercel's root is `site/`), like `compass.json`: never hand-edit them; edit `game.src.html`
  and rebuild.
- On the site the game is its own full-screen document, `site/src/pages/play/sounds-like-scripture.astro`
  (no Base layout, same head: canonical, OG, breadcrumbs, stored theme, analytics with the challenge hash
  stripped). Games are listed in `site/src/lib/games.ts`; the home page renders that list under "Games".
  Routes for games are `/play/<slug>/`. `/method#the-game` discloses what the game keeps in localStorage.
- **No line is ever written by a model.** Scripts extract verbatim lines from downloaded public-domain
  files (KJV, KJV Apocrypha, World English Bible British Edition with deuterocanon, 1 Enoch, the
  Apostolic Fathers, Augustine, a Kempis, Julian, Josephus and others); blind curators rate lines by
  number only; `scripts/verify.mjs` proves every pooled line is a substring of its source file. Run it
  and `scripts/test-game.mjs` after any change.
- Tells were removed on purpose: both registers exist on both sides (archaic and modern), small-capital
  LORD and quote styles are normalised for display only, contractions and dangling quotes are dropped,
  lines quoting Scripture inside other works are dropped by a five-word shingle test.
- Canon is a player choice (Protestant, Catholic, Orthodox) and truth is computed per canon; a
  deuterocanonical line is never called fake. 2 Esdras, 4 Maccabees and Greek Esther are left out.
- Lesson from the build: blind Opus curators guessed 1,796 of 1,800 lines correctly, so a model's
  guess cannot rank difficulty for people. Real difficulty has to be measured from play.
- Not built yet: a `/games/` index and nav entry, permanent reveal pages per line or source, an OG image,
  a second curation pass (about 24,000 prose candidates exist; only 760 were rated), measured difficulty.

**When work resumes: ask how the demo played before proposing anything.**

## PICK UP HERE (as of 2026-09-15) — PAUSED by the owner

**Read this before the plan below.** Layers 1 and 2 shipped and are live (the reference
floor, cookieless analytics with result codes stripped, the `/c/` two-person overlay). Layer 3
did not survive contact with the owner. Two attempts at the daily object were built as
playable previews and both were rejected on play:

1. **Golden Chain** (sort sixteen verse fragments into four groups sharing a hidden
   cross-referenced verse): "a game for AI, not for humans"; the cards were fragments needing
   back-knowledge; only the tap-four interaction was fun.
2. **Same Move / Who are you most like in the Bible?** (a situation, sixteen things you'd
   actually do, each a cited recorded act of a Bible figure; a quiz that names the figure
   whose moves you chose most): "loaded questions/answers", options written backwards from
   the citation so they read as contrived; "surveys are not your strong point".

Both are preserved on the local branch `shelved/golden-chain-and-figures` (generator,
checker, deck, verifier, `FIGURES-BLUEPRINT.md`). Local `main` equals `origin/main`. Do not
resume either unprompted.

The owner has paused to decide what he actually wants to build and said the concept itself
may be flawed and a fresh brainstorm may be needed. **When work resumes: ask what he decided
first.** What he has said fun means for him: personal, instantly understood with no church or
Bible vocabulary, tactile (tapping cards, choosing up to four), and a result about himself
worth showing someone. What failed twice: optimising rigor (open data, citations, verifiers)
before testing appeal. Next time, put a handful of real items in front of him before building
any deck or machinery, and never present coverage tables or checkers as evidence of quality.

The plan below is kept as the record of what was decided on 2026-09-14; its layer 3 is void.

### The growth plan as decided on 2026-09-14 (layers 1 and 2 done; layer 3 void)

On 2026-09-14 a 13-agent brainstorm (9 lenses, 3 critics, 47 concepts, every precedent verified)
answered "how does this site spread on its own". The owner accepted the recommendation. The full
brief, with the evidence, the killed ideas and the 90-day plan, is at
https://claude.ai/artifact/E4WPUV8x9EBusL19AGwrhU — read it before proposing any new feature.

Three layers, in this order, nothing needing accounts, a database, an app, a new name or a new palette:

1. **The fair reference floor** (week 1, then weeks 9–10): sources on axis pages, the 89-entry audit
   changelog and the 11 disputes published on `/method#changelog`, BreadcrumbList JSON-LD everywhere,
   a correction intake (GitHub issues), cookieless Vercel Web Analytics disclosed on `/method`. Later:
   153 `/compare/[a]-vs-[b]` pair pages, six axis-topic pages, contested-passage pages (Romans 9,
   1 Tim 2:3–4) in each tradition's own quoted words. **Tradition pages get NO sources block until real
   citations exist in the data — the tradition entries hold only a name and a position vector, and
   inventing confession references is forbidden.**
2. **Compare with someone** (week 2): `/c/[quiz]/[a].[b]` decodes dot-joined result codes through the
   existing codec and draws both people on one set of rails with the gap shaded. The invite is empty
   until the second person finishes. Never a compatibility percentage; say "land in the same band",
   never "agree"; no names or initials in URLs; a group map (`/g/`) shows nothing but a spread band
   below five members and never labels a group's tradition.
3. **Golden Chain** (weeks 3–6, launch Monday 2026-10-26): a daily NYT-Connections-shaped puzzle. Sixteen
   short BSB verses sort into four groups that the OpenBible cross-reference index (CC BY, ~340k links
   with vote counts) links to the same hidden hub verse. The category IS the hub verse verbatim, so the
   site interprets nothing. Share = a 4×4 emoji grid in solve order, no verse text. Reveal = a permanent
   `/verse/[ref]` page. Ninety boards precomputed and validated offline (each leaf links to exactly one
   chosen hub). Streak private in localStorage, knowledge only; no reminders, no leaderboard. The
   TSK/OpenBible provenance and the 66-book canon gap print in the game footer and on every verse page.
   Then: one honest launch post per community (the owner agreed to make them), after reading each
   community's rules live.

Later, only if the numbers say so: a Computus module and dual-calendar Lent 2027 pages (week 8; Ash
Wednesday 2027-02-10, Clean Monday 2027-03-15, Pascha 2027-05-02 — verified), the axis email series
(week 11), "Said Who" (daily primary-source puzzle, needs 60 verified quotations before launch), the
Catena Aurea verse layer (Newman 1841, one Gospel first), catechism pages, group rooms.

**Killed, with reasons — do not re-propose:** self-portrait / collectible deck / season Wrapped /
year recap (assume an installed base; "the soul as a stat sheet"); anything that counts devotion
(prayer streaks, fasting trackers — Matthew 6, Hopko's maxims, the Exodus 90 critique); rule-of-life
builder (Practicing the Way owns it); fasting calendar or saint-of-the-day (feastorfast.com,
orthodoxiq.com); verse-reference Wordle clones (Versle, Lordle); anything social with accounts; a
person-to-saint or person-to-person percentage; AI chat over theology or fasting. **Count knowledge,
never devotion.**

**Orthodox positioning, settled by evidence:** the capital-O convert wave is real, online-born and
small (OSI 20-parish study; Pew ~1% of US adults; clergy publicly hostile to online tools above the
priest). Serve it as a layer — Julian calendar toggle wherever a date appears, pre-1054 Fathers
claimed for nobody, Orthodox positions cited to Orthodox documents, "bring this to your priest" as
the primary action on anything practice-shaped — never as the site's identity. No icons, Byzantine
styling, "ancient faith" copy, "orthobro" or masculinity framing anywhere.

**Working rhythm the owner set on 2026-09-14:** be token-efficient. Use Opus (one agent, precise
spec, no commit, no push) for anything Opus does as well; use Fable only for judgment. Ship one
reviewable chunk at a time (about one week of the plan), run the tests, show the diff, and stop for
his direction before pushing. No multi-hour builds. Every push to `main` deploys to production.

**Mobile is priority one, from the ground up.** Most users arrive on phones, the owner wants a clean
path to a mobile app later, and his previous project became a painful retrofit because mobile was
left until the end. Design and build phone-first, then tablet, then desktop — never desktop scaled
down. This applies at every stage, not as a final pass.

### The visual theme is SETTLED — do not redesign it

Locked reference: https://claude.ai/code/artifact/95ff2a65-2e28-4d5c-b5bf-1fa3b434f00a
Result-page attempt (rejected, see below): https://claude.ai/code/artifact/0ef3fc2e-0b50-4372-ac9e-2c5287297ba7

Riche palette `#7EBAEE`→`#F0A06F` on `#444444`, panels `#EEEEEE` on `#E8E8E8` shell on `#E3E3E3`
page, `border-radius:15–22px`, whisper shadows `3px 3px 5px rgba(68,68,68,.065)`, DM Serif Display
+ Poppins + Inter, bulb theme toggle, light default. Sources and tools in `design/`.

### The result page is BUILT — these decisions remain binding

Built and reviewed between 2026-09-03 and 2026-09-14 (commits `bdc522a` through `01e8fd9`): one
result system, two shapes (bipolar rails, unipolar ranking), the theme applied site-wide as a token
layer, share card drawn on the page, BSB text bundled for all fifty cited passages. The design
critiques live in `design/DESIGN-SPECS.md` and `RESULT-BLUEPRINT.md`. Do not redesign the result page
or the theme; every hour on visuals is an hour not on the growth plan.

Decisions that remain binding:

- **No separate compass wheel.** The hero visual and the axis rows are ONE component: six
  full-width diverging rails on a shared centre spine. A circle cannot fit twelve pole labels, so
  something always gets dropped — which is exactly how the last version shipped a named pole facing
  an anonymous blank sector. Stacked rails make that failure structurally impossible.
- **Both pole names print on every rail, unconditionally.** Never encode a pole by omission.
- **Draw the audited 41–59 "names no position" band as a visible zone**, so a centrist sees why
  nothing was named instead of getting an empty state.
- **Layered opacity, never flat fill:** ~30% tint under a 100% solid knob with a card-coloured
  ring. This already ships in `theology-compass.html` (`.fill` opacity .35 + solid `.marker`) and is
  what the owner likes; the flat saturated version was rejected.
- **Deep content as two mirrored pole panels** so the disagreement reads as a disagreement, fed by
  `design/tools/split-summaries.mjs` (splits by an explicit anchor, then verifies every sentence is
  used exactly once; refuses rather than guessing).
- **Do NOT assign scripture passages to a pole.** Romans 9 and 1 Tim 2:3–4 are claimed by both
  camps; splitting them would be invented editorial content and an audit violation. `readMore` IS
  pole-split, because the data says so.
- **Truncate axis prose on the result page; full text lives on the indexable `/axis/` pages.** Fixes
  the wall-of-text and the SEO funnel in one move.

### Formerly open bugs — FIXED (verified against the repo 2026-09-14)

1. **Axis key ≠ slug.** Internal keys are `spirit` and `tradition`; built slugs are `gifts` and
   `authority`. All URLs now go through `groupHref()` in `registry.ts`, and `engine-test.mjs` asserts
   rows carry slugs. Still the rule: always use `slug`, never `key`, for anything URL-shaped.
2. **`(see candidate_statements)`** no longer appears anywhere in the audit source or the bundle.
   Week 1 adds a regression test so it cannot come back.

Also fixed earlier: `Disallow: /r/` removed from robots.txt (it blocked the crawl that
`noindex, follow` depends on, severing link flow to the axis/tradition pages).

Checked and **rejected** as a false alarm: the claim that `band()` and `nearestState()` can
contradict each other. At both 3 and 6 items per axis the reachable scores skip 40 and 60, so it
cannot occur. Do not "fix" it.

### Owner decisions taken 2026-09-03 — treat as settled

- **Email offer: the result link plus a short follow-up series** (3–4 emails unpacking the reader's
  strongest axes using the history and passages already written). This is the honest reason to hold
  an address — the bare result link is already free and in their URL bar, so "we'll email you your
  result" converts badly on its own. The "no email list" promises on `/about` and `/method` have
  been rewritten honestly (`/method` says the list exists and what is sent). MailerLite is wired to
  `src/pages/api/subscribe.ts`; the 3–4 axis emails themselves are not yet written (plan week 11).
- **Blueprint the whole platform before building further.** Spec result shapes and scoring
  strategies for the Compass, seven deadly sins, spiritual gifts and who-in-the-Bible, plus the
  article system and Bible study tools. **Critically: the Compass is bipolar and the others are
  not.** A unipolar quiz has categories ranked by strength — no poles, no centre, no "names no
  position" band. Applying a bipolar chassis to unipolar data is the same class of error as
  labelling one pole of two, so the result page must be specced for both shapes together.
- **No mobile app.** Responsive web only — no PWA, no service worker, no manifest, no native
  wrapper. Phone-first responsive design done properly is the whole requirement.

### Still unbuilt

The growth plan above, in order. Deliberately deferred until usage justifies it: a server-side OG
image route (the share card is drawn on a browser canvas in `ShareBlock.astro`; nothing server-side
exists), group rooms or any KV store, the seven-deadly-sins audit (it stays `draft` and out of every
shared object until it has passed the same adversarial audit as the Compass), and new quizzes (each
new quiz should arrive with a two-person mode once the pair route exists).

## Where the build stands

### Done

- **`theology-compass.html`** — the working demo with the full fairness audit applied, published at https://claude.ai/code/artifact/66ae7e10-200a-45a6-a1d0-acca94886428 (republish the same file path to keep the link).
- **The fairness audit is complete.** 20 adversarial reviewers raised 522 findings; three-lens verification (accuracy / fairness / necessity) kept 424, including all 42 blockers. Six tradition families added (18 total). All 18 published answer sheets land on their own tradition at 87–95%. **Do not re-run it.**
- **All nine scoring/copy fixes** the audit specified are implemented: base-13 permalink, 198-unit match denominator, 10-unit tie rule, 45-unit poor-fit hedge, all-central suppression, middle-band exclusion in `headline()`, `lean()` as a share of the half-axis, eleven-slot share bar, "Unsure / neither" plus scale hint, closest-traditions scope note, footer.
- **Back button fixed** — it did nothing on statement 1 (a disabled control) and was dead for ~390ms after each answer. Now cancels pending timers, and on statement 1 reads "← Leave the quiz" and exits to the intro.
- **Stage 0 scaffold** — Astro + Vercel in `site/`. Superseded by Stage 2.
- **Stage 2 platform core** — DONE. The quiz engine is real: `site/src/lib/engine/` (types, generic base-N codec, registry with build-time validation), `site/src/lib/strategies/` (`bipolar-nearest`, `category-highest`), `site/src/lib/quizzes/` (quizzes as data). Routes namespaced: `/q/[quiz]`, `/r/[quiz]/[code]` (on-demand), `/axis/[quiz]/[axis]`, `/tradition/[slug]`, `/articles/[slug]`, `/quizzes`, `/method`, `/about`. 41 static pages, sitemap excludes `/r/`, `noindex` removed from content pages and kept on results and drafts. A second quiz (`seven-deadly-sins`, unaudited draft) proves the strategy seam.
- **LIVE at https://wiserwalk.com** (deployed 2026-09-03). Vercel is connected to the GitHub repo, so **every push to `main` deploys automatically** — there is no manual deploy step, and a bad push goes straight to production.

### Deployment facts that are easy to break

- **Vercel Root Directory is `site/`**, not the repo root.
- `site/src/data/compass.json` and `compass-audit.json` are **generated but committed**, because `build-data.mjs` reads `../../audit/`, which is outside the Vercel root directory. The script falls back to the committed files when the audit source is absent and regenerates whenever it is present. Do not re-add them to either `.gitignore` (there are **two**: the repo root and `site/.gitignore`).
- DNS is hosted at **SiteGround**; the domain was bought there. Apex `A → 216.198.79.1` (Vercel), `www` `CNAME → *.vercel-dns-017.com`. **The MX, SPF, DKIM and DMARC records are SiteGround email — never delete them.** SiteGround hosting itself is unused but still runs the mail.
- The apex is the primary domain; `www` 308-redirects to it. This matches `site:` in `astro.config.mjs`, so canonicals, OG URLs and all 41 sitemap entries resolve to a clean 200 with no redirect. **If you ever change one, change the other.**

### Files that matter

- `V1-BLUEPRINT.md` — the staged build plan. **Stage 2 has been rewritten for the platform vision.** Also published at https://claude.ai/code/artifact/f37302b7-cdd8-4be9-8529-0e9713caf579
- `audit/fairness-report.md` — the editor's report; read section 1 first.
- `audit/compass-data.revised.json` — the audited data now live. Also holds `candidate_statements` (18 drafted for v1), `simulations` (18 answer sheets), `changelog` (89 entries), `disputed` (11 kept but not applied), `scoring_v1_proposed`.
- `audit/apply.js` — regenerates the demo page's data block: `node audit/apply.js audit/compass-data.revised.json`.
- `audit/selftest.js` — **run `node audit/selftest.js` after any data or scoring change, and before any publish or deploy.**
- `audit/review-results.json`, `audit/findings/*.json` — raw reviews by target.
- `audit/theology-compass.pre-audit.html` — the page before the audit.
- `site/scripts/build-data.mjs` — regenerates `site/src/data/compass.json` (quiz data, bundled to the browser) **and** `site/src/data/compass-audit.json` (answer sheets and the disputed log, build-time only — kept out of the client bundle on purpose). Derives the permalink radix from the item count (13 at 3 statements per axis, 25 at 6). Never hand-edit either generated file.
- `site/scripts/engine-test.mjs` — **run `npm run test` in `site/` after any engine, data or scoring change.** Bundles the TypeScript with esbuild and re-scores all 18 audited answer sheets through the engine; also checks codec round-trips, junk-code rejection, the audited edge-case rules, and the second quiz. Wired into `prebuild`, so a regression fails the build. This is the site's counterpart to `audit/selftest.js`, which checks the demo page's independent copy of the same rules. **Both must pass.**
- `site/src/lib/engine/` and `site/src/lib/strategies/` — the quiz engine. A quiz is data; a scoring strategy is pluggable. `site/src/lib/compass.ts` was replaced by this.
- `demos/` — the two runner-up demos: Scripture Web (https://claude.ai/code/artifact/a291298f-9530-405d-a9a5-af721aa2404b) and Structure Cards (https://claude.ai/code/artifact/ff361b6e-5023-4a26-a3f1-d76ac8119dd8), plus the pre-audit Compass.

## Rules that must not be broken

- Real data only. Never invent a quotation, date, position, or connection; cite the confession, council, or standard work.
- Both poles of every axis described fairly, in the holders' own vocabulary. No band adjective may name a rival tradition, flatter, or belittle.
- Statements under 22 words, one claim each; every axis needs both `+1` and `-1` keyed items; re-derive direction signs whenever a statement is rewritten.
- The demo page assumes 6 axes and 18 statements; `apply.js` warns if the counts differ.
- Run `node audit/selftest.js` before republishing.
- **Pace usage deliberately.** The audit consumed ~60% of a weekly allowance in one session, and the naming spiral burned much of another. Stages 0, 2 and 4 need no agents. Prefer writing code directly over spawning reviewers. Note: two attempts to run naming workflows failed entirely with API 529 overloads, wasting time — check for that failure mode before relying on fan-out.

## Local testing

`sh _test/wrap.sh` wraps the pages in the artifact host skeleton into `_test/` (the root page as `theology-compass.html`, demo copies prefixed `demo-` so they cannot clobber it). The `compass` launch config in `.claude/launch.json` serves `_test/` on port 8766.

Two environment gotchas, both hit in this session:

- The embedded browser pane never fires `requestAnimationFrame` and sometimes reports a zero-size viewport, so animations and geometry must be checked by reading state, not by screenshotting.
- **Never put backticks inside a double-quoted bash string** — they execute as command substitution. Use the Write tool or single-quoted heredocs for prose containing backticks. This mangled `CLAUDE.md` once and accidentally invoked `npx vercel`.
