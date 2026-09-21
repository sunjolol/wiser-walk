# Handoff (updated 2026-09-21): start the next session here

**Everything on `build/three-new` was merged to `main` and is live on wiserwalk.com** (owner's yes,
2026-09-20): the two quizzes left draft, Who Said It? shipped, the footer and quizzes page were
redesigned after his review, and the privacy pledges and process talk came out. Production was checked
after the deploy: every key page 200, the new quizzes indexable and in the sitemap (88 entries), the
sins draft and all result pages still noindex. Only notes differ between the branch and `main`.

**The owner changed the site's direction on 2026-09-20** (accounts, stored results, a cross-quiz
profile, email capture, revenue): read the section of that name near the top of `CLAUDE.md`. A staged
plan was put to him; **ask what he decided before building any of it.**

**Blocking his email goal:** sign-up is not switched on in production. `/api/subscribe` answers 503
until `MAILERLITE_API_KEY` is set in Vercel (Settings, Environment Variables; Production and Preview),
and double opt-in must be ON in MailerLite. Steps: `site/src/lib/email/README.md`. Only he can do it.

## START HERE (written at the end of the 2026-09-21 session)

**Live on `main` (every merge had the owner's yes):** the whole redesign, site-wide picture bands, 11
articles with a topic FILTER on `/articles/`, "My results" (`/me/`), `/support/` giving to his Ko-fi with
"Donate" in the header, Brevo sign-up switched on, 42 social cards (`site/public/og/`, drawn by
`node design/og/render.mjs site`; home card = his pick "D") and rewritten search titles and descriptions
(`site/src/lib/seo.ts`), phone touch targets (`site/src/styles/touch.css`), the traditions list moved to
the foot of the Compass page (`OutcomeIndex.astro`).

**SHELVED on 2026-09-21: THE DAILY SET.** He reviewed the preview and rejected its DISPLAY outright; the
concept and back-end stay. It lives on local branch `shelved/daily-set` (= `main` + ONE commit, "The daily
set..."; the same commit is still on origin as `design/home-dawn`). His complaints: the placement; the
score, rank and button feel "super clumsy, especially on mobile, like it was an afterthought rather than
an integral feature"; the hit/miss marks look "super scuffed" and "glitchy" (weird outlines and spacing,
mixed sizes and colours); "Today's Ten" does not explain itself, so it becomes **"Today's Challenge"**.
"It needs a totally new approach." He will circle back after sign-up. When he does: keep `daily.ts`, the
storage contract and the games' recording logic; discard every display piece (home strip, `/games/` strip,
`/me/` block, the in-game marks); mock up the marks and the placement for him BEFORE building.
What it is: first completed run of today's ten is recorded, later runs are practice; days numbered from
#1 = 2026-09-21 UTC; streak = consecutive days (no guilt copy); `#today` deep link; share text with the
day number; a Today strip on the home games band, `/games/` and `/me/`. Storage contract `sls.daily` /
`wsi.daily` documented in `demos/sounds-like-scripture/SPEC.md` and mirrored in `site/src/lib/daily.ts`.

**Shipped to `main` on 2026-09-21 (commit `eeca88b`, his go): the site icon** (he picked candidate B: a white DM
Serif W on the blue-to-orange; source and the cutter are `design/icon/`, run `node design/icon/render.mjs`),
`max-image-preview:large` on indexable pages, WebSite + Organization (logo) structured data on the home page,
and the footer fix: boxes holding a ghost word use `overflow: clip`, because with `hidden` the overhanging word
made the footer scrollable and a jump to `#foot-signup` scrolled it inside itself (108 px). **`feature/accounts`
was cut before this, so rebase it onto `origin/main` before it is merged; expect a small conflict in the head of
`Base.astro`.** Google was still showing the OLD description because it had not recrawled. **He set up Search Console the
same day** (domain verified by a TXT record he added at SiteGround; checked from outside: the mail, A and www
records are untouched; sitemap submitted; home page indexing requested). Nothing more to do but wait: the
description refreshes in days, the icon on Google's schedule, and sitelinks cannot be forced.

**NOW, by his word on 2026-09-21 ("Let's move on to the sign up feature"): accounts, on branch
`feature/accounts`** (cut from live `main`; it has no upstream on purpose, so a bare `git push` cannot
deploy). Email-only sign-up box, the emailed link lands on a set-a-password
page, then email + password, "forgot password" sends the same kind of link, Google later. Proposed:
Supabase Auth (free tier) with Brevo SMTP. HE must create the Supabase project and set its keys in Vercel
(I cannot create accounts or enter keys): give him numbered steps like the Brevo ones. Then the profile
(cross-quiz page that fills in as people do more; sync `ww.shelf.v1`, `sls.daily`, `wsi.daily`, game bests).

**How to ship a small fix while the design branch holds unreleased work** (done twice this session):
commit the fix on the design branch, `git worktree add --detach <tmp> origin/main`, cherry-pick it there,
push `HEAD:main`, remove the worktree, then `git rebase origin/main` on the design branch (git drops the
duplicate) and `git push --force-with-lease origin HEAD:design/home-dawn`. To stage only your part of a
file someone else is editing: build the blob from `git show HEAD:<file>` plus your edit and
`git update-index --cacheinfo`.

**His standing rulings from this session** (also in `design/DAWN-PASS-BRIEF.md`): no one-word last lines;
main action never below the fold on a phone; no picture that fades into blank space, repeats on one page,
or needs a credit line on `/support/`; less empty sky above a band's words; buttons, not tiny text links,
on a phone; chips that look tappable must do something; the home example wheel is the Eastern Orthodox
sheet; games band = manuscript with slightly see-through cards; `FOOT_SHORT` in `Base.astro` is a
hand-made stopgap until he renames the sins quiz. Working captures are gitignored; never commit them.
Small leftovers: "2168 real lines" prints without a thousands separator; a hash change to `#today` on an
already-open game page does not start the daily; five figures (Deborah, Hannah, Abigail, Rahab, Barnabas)
have no Doré plate; two weak scans noted in `site/public/img/CREDITS.md`.

## Done on 2026-09-20 (his six decisions of 2026-09-22 in the older notes, all carried out)

1. **Spiritual gifts: all gifts in.** Nineteen gifts, fifty-seven statements, about eight minutes.
   Added: prophecy, healing, miracles, tongues, interpreting tongues, the word of knowledge (it sits
   in the same sentence of Paul's as the rest; the owner confirmed that call). Apostles, 1 Corinthians
   7:7 and 1 Timothy 4:14 are named and not scored (owner confirmed). The disagreement about whether
   six of them are given today is described once with the intro and once with the result, and no row
   is badged or set apart. Every gift has one reverse statement and one "what other people bring you"
   statement. The discernment statement he could not follow is replaced. Wisdom displays as "the word
   of wisdom". Record: `audit/new-quizzes/gifts-all-final.md` (+ `.json`); `AUDIT-LOG.md` has the
   closing section. Method: two drafts, two critics, an editor, four adversarial reviews, a closing
   editor; 55 findings, 48 applied, 6 part-applied, 1 rejected, the one blocker closed.
2. **Judith and Tobit are on the figure roster**, each placed on five axes from the World English
   Bible British Edition deuterocanon on disk, adversarially verified, each card carrying the sentence
   about which Bibles hold the book. Simulator: worst Ruth 7.7%, ties 8.2%, central 1.3%. **One target
   misses: Judith is closest for 1.1% of sheets against a 1.5% floor** (Jesus 1.3%). No coordinate was
   moved to fix it, and none may be: where a figure sits is argued from the text.
3. **Engine items:** a figure's sentence travels with every printed name (share text and share card);
   a figure-quiz sheet with the same answer throughout is explained and scored at the centre, so nobody
   is named; gifts ties name everyone level up to four, five or more is the flat state; narrower band
   words considered and NOT applied (reason in `AUDIT-LOG.md`).
4. **Findability:** `/quizzes/` opens with an index of every quiz, then one equal feature block per
   quiz; a quiz that goes live gets the Compass's prominence with no code change. The header's Quizzes
   and Games items are menus listing everything (no JavaScript needed; not clipped on a phone).
5. **Tools:** `audit/tools/webbe.mjs` opens any reference in the Bible text on disk and checks that
   quotations are verbatim (`--check file.json`). A wide (BigInt) permalink codec carries quizzes past
   fourteen groups; the narrow codec, and so every live Compass link, is untouched.

## Known leftovers, none blocking

- The share card for a ranked quiz (gifts, sins) is a mostly empty panel: `ShareBlock` draws a picture
  only for bipolar quizzes. It predates this work. It is the surface that travels furthest, so it
  deserves a small design pass (top three rows as bars) before the gifts quiz is promoted hard.
- Three statement wordings are the closing editor's own combinations that no reviewer read, and eight
  were read by their author only: listed in `gifts-all-final.md` section 7.
- `figures-notes.md`'s body describes a roster that never shipped; a pointer at its top says so.
- Seven deadly sins is still an unaudited draft and must stay one until it has had its own audit.

## Next, only with the owner's go

1. Whatever he chose from the accounts and revenue plan (step one proposed: a "My results" shelf kept
   on the device, so old results can be found at once, with "save these to your email" as the honest
   reason to sign up).
2. The citation pass (`audit/citations/`: 13 of 18 tradition files written, 2 verified). Costly; ask.
3. Parked, from `research/BRIEF.md`: daily set and share grid for Sounds Like Scripture, "who is
   speaking in [chapter]" pages, canon pages, the eight article drafts in `audit/article-drafts/`,
   Finish the Verse.

## Checks to run before any push

`npm run build` in `site/` (runs the engine tests), `node audit/selftest.js`,
`node site/scripts/sim-figures.mjs`, and for the games `scripts/test-game.mjs` and `scripts/verify.mjs`
in each of `demos/sounds-like-scripture/` and `demos/who-said-it/`.
Pages are judged from captures: `sh design/tools/shot.sh` (see CLAUDE.md, "THE RICHE PASS").

## Pace and models (the owner said this twice; the second time sharply)

**Opus is the default for every agent.** In a Workflow, an `agent()` call with no `model` inherits
Fable, so set `model: 'opus'` explicitly on drafters, critics, researchers, verifiers, reviewers and
engineers. Keep Fable for the few stages where its judgement is the point: a closing editor settling
contested fairness wording, and the main session's own reading of captures and final calls. One agent
at a time where one will do. Ask him only plain questions with the actual sentence in front of him.
