# Handoff (updated 2026-09-22, end of the accounts / logo / type session): start here

## START HERE (2026-09-22, third session). Supersedes everything below where they differ

**Live on `main` and deployed today, each with the owner's go:**
- **Accounts are public** (`ACCOUNT_LINKS_LIVE = true`). Supabase Auth + Resend; the sending domain is
  `mail.wiserwalk.com` (`ACCOUNT_EMAIL_FROM`), the email rate limit is 100/hour, and every line on
  `/account/setup/` is green. He signed up, logged in and reset a password on the live site.
- **Account design pass** (brief `design/accounts/PASS-BRIEF.md`, exemplar `site/src/pages/account/sign-in.astro` +
  `site/src/lib/account/form.ts`): visible labels, "Forgot your password?" under the log-in button, a settings-list
  `/account/`, delete asks for the password. Words are Log in / Log out / Sign up; routes unchanged. Header: guests
  "Log in | Sign up" (on a phone in the bulb's old place; the bulb moved to the end of the nav row), logged in
  "My profile". Logged in, the footer band has no words at all, just the walker picture (no overlay; 70px lower on
  desktop).
- **Fixes found on the way:** the server believed it was https://localhost (Astro `security.allowedDomains`), email
  links now always go to the live site, service_role grants in `schema.sql`, the `/_image` endpoint switched off,
  the sins quiz's strength words / ties / "Next" line (`category.ts`).
- **The logo**: his brush-stroke W (`site/public/img/logo-w.png`, only 47x34: ask him for a 4x or SVG export) and
  "Wiser Walk" drawn from his licensed Amatry font as outlines (`site/public/img/wordmark.svg`, made by
  `design/tools/wordmark.py`). The Amatry files stay OUT of the public repo (`.gitignore`); he holds an Envato
  Elements commercial licence.
- **Headlines in Philosopher Bold** ('Wiser Display' in `site/public/fonts/fonts.css`). **Poppins and Inter stay for
  everything small: he tried PT Sans and called it ugly. Do not propose changing the small fonts again unprompted.**
  Philosopher's capital I looks like a lowercase l (a font trait, he knows). The 42 social cards
  (`design/og/`) still use the old fonts: regenerating them is an open follow-up.

**SCRAPPED: every quiz idea from today's research.** He read twelve researched ideas with sample questions
(https://claude.ai/artifact/DVcWJFcLXy99MjWEGQomVj) and said: "None of the quiz proposals are good, besides maybe the
1,400 year old personality test - but only the premise, the questions themselves and the answers that go with them
are very low quality and shallow, and feel like nonsensical AI wrote them rather than them being coherent and
intelligent and cohesive. Total scrap." The next session tries again. See the section in `CLAUDE.md` of the same date
for what he wants and what went wrong. The research itself (demand, sources, craft) was sound and can be reused:
it is summarised in the memory note `quiz-ideas-retry`.

**The personal profile** ("You, so far": https://claude.ai/artifact/AziUmP2qvxYgYBSnCaQkYo) is designed, not built. His
rulings: the weakness part sits behind a "Show it" tap; a "How do you love?" quiz from 1 Corinthians 13 is approved
in principle. Build nothing for it until the quiz direction is settled.

## Earlier (2026-09-21)

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

## START HERE (written at the end of the SECOND 2026-09-21 session; supersedes the section below where they differ)

**PAUSED by the owner on 2026-09-22** after seeing the deploy ("Looks great"): "I'll come back when I have the bing
numbers and have uploaded to itch.io. For now we can put this project on pause until we see real results." When he
returns: ask for the Bing Keyword Research numbers (item 14) and whether anything live needs changing; nothing new
unprompted.

**Everything below this line, plus the itch.io kit, was PUSHED TO `main` on 2026-09-22 with his go ("Just push it to
main... If anything is wrong I'll just revert/change it"): commits `65a147a` to `b49b2c5`, deployed by Vercel. He
had not looked at the pages himself; if he reports something wrong, fix it on `main` or revert that commit.** Every commit passed `npm run build` (prebuild tests + the SEO guard), `npm run test:switches` and
`node audit/selftest.js`. The API refused agents for most of the session (529 overloads on every Opus call, three
times), so items 4, 6, 11, 12 and 13 were done by hand in the main session.

Done on the branch, in the order he set:
1. **itch.io kit** (`65a147a`): `design/itch/README.md` (his steps, page text, tags), `design/itch/upload/` (the game with
   its challenge links pointed at wiserwalk.com, a 630x500 cover, four screenshots). HE uploads it.
2. **Item 8, twelve comparison pages** (`268d187`): `/compare/` and `/compare/<pair>/`, content as JSON in
   `site/src/data/comparisons/` (brief `design/seo/COMPARE-BRIEF.md`, audited positions in
   `design/seo/compare-pairs.generated.md`), loader `site/src/lib/comparisons.ts`, `CompareRoom` on the Compass page,
   `CompareBlock` on the tradition pages, the Articles dropdown, the footer link, SEO guard check 4, thirteen social
   cards. Four files were edited by an Opus editor before the API died; the other eight were fact-read by the main
   session and five uncertain claims cut. Content is 1,100 to 1,300 words a page.
3. **Item 4, the printable gifts test** (`be8d2e5`): `/q/spiritual-gifts/print/`, from the quiz's own data, print
   stylesheet, key on its own sheet, "Print it for a group" in the quiz band. Also the feed line on `/articles/`.
4. **Item 6, the dataset** (`1f7b879`): `/data/theology-compass/` + `/data/theology-compass-traditions.csv`, Dataset
   JSON-LD, linked from the tradition index on the Compass page.
5. **Item 12, /method/** (`3f7b2c7`): 12,881 words -> ~1,250; the log and refusals moved whole to `/method/changelog/`.
6. **Item 13, fonts** (`28309a0`): self-hosted in `site/public/fonts/`; `design/tools/fonts.md`.
7. **Item 11, seven deadly sins LIVE** (`b92a783`): lean audit by hand, seven sourced profiles with WEBBE verses
   inserted by script (`engine-test.mjs` checks them), status flipped, draft note gone, engine tests updated.
8. Small leftovers: two long titles trimmed, the /about/ buttons shortened, the Sower credited, the did-you-know
   kicker fixed for one item.

**Still open on `design/seo/TASKS.md`:** item 14 (article engine: two a month; ASK HIM for his Bing Keyword Research
numbers first), item 15 (later), the owner's judgement calls and the article-redesign leftovers at the foot of the
file, and his optional posting list (`WHERE-TO-POST.md`).

**Lessons:** `astro preview` does not work with the Vercel adapter (use the `site` launch config, port 4321); the
Bash tool turns `\\n` inside a heredoc into a real newline (build escapes with `chr(92)` or use the Write tool);
`didYouKnow` on a group is an array of `{text, source}`; the engine test pins every quiz's status.

## START HERE (written at the end of the first 2026-09-21 session)

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

**DISCOVERABILITY IS NOW THE WHOLE JOB (his words, 2026-09-21: the project "HINGES on it being discoverable
through normal searches"; he has no social following and will not market).** Everything is in `design/seo/`:
the audit (seven lenses, a skeptic, a completeness critic); **`TASKS.md` = HIS ANSWERS to all fifteen open
items, his steer, the order of work, and what is ticked: NOTHING on it may be dropped**; `OWNER-ACTIONS.md`
(his one-time tasks: HE HAS DONE THEM ALL on 2026-09-21: Bing import, request indexing, Brave, faith.tools,
GitHub and Ko-fi links); `WHERE-TO-POST.md` (the verified list of places he may post once, with drafts).

**START THE NEXT SESSION HERE, in this order (his instruction at the end of 2026-09-21):**
1. **Prepare the itch.io upload of Sounds Like Scripture** (he said yes, "but not in this session"): a cover
   image (itch wants 630x500), tags, a short description and the page text, from the game's REAL details, and
   the plain standalone build `demos/sounds-like-scripture.html` as the file. HE uploads it: it is his
   account. Read the itch.io entry in `WHERE-TO-POST.md` first.
2. **Then back to `design/seo/TASKS.md`, unticked items in order:** item 8 (eight to twelve hand-built
   comparison pages with a home under the Articles menu: a dropdown entry, linked from the Compass page and
   from each tradition page involved; NOT the 153 generated pairs), item 4 (a printable spiritual gifts
   test: do not call it a PDF), item 6 (the 18-tradition table as a CSV + Dataset markup + a small page),
   item 11 (seven deadly sins: a LEAN audit, then publish), item 12 (a short readable /method/), item 14
   (article engine: two a month, topics from Bing's free Keyword Research now that he has imported the
   site: ASK HIM for those numbers), item 13 (self-host the fonts), item 15 (later), and the small
   leftovers listed at the foot of that file.

**LIVE on `main` from 2026-09-21** (all verified after deploy): round 1 (`e16a341`: search titles, H1s and
descriptions for 79 pages, internal links, a real 404, the article feed, IndexNow pings, cache headers, the
`site/scripts/seo-test.mjs` build guard); round 2 (`9544fa7`: the six Compass axis pages in everyday words
with a direct answer, a profile on each of the 18 tradition pages (similarity 48% -> 22%, ~340 -> ~980 words),
all 19 gift pages over 700 words, a Reformation Day article, contact + reuse line on /about/, reverent
capitals everywhere with `design/tools/reverent-check.mjs`); the article reading redesign (`fe3c4cb`: unboxed
prose on a phone, a dotted-line contents list, `ReadingProgress.astro`, an "In short" `answer:` REQUIRED in
every article's front matter by the guard, the end-of-article sequence); the Articles band (full-width Sower,
no credit) and the article bands (painting whole on the right, starry ground on the left).

**HIS STEER, binding on all content:** engaging, fun, easy to read; jargon always explained; stop hedging every
line for fairness; **SEO and ranking first, substance VISIBLE on the page** (pop-outs and hovers only for
repeated boilerplate); **do NOT over-audit** (one writer + one editor per family at most); capitalise God,
Jesus, the Holy Spirit and Their pronouns in all the site's own words, never inside quotations; header
pictures span the full band and MAIN pages print no picture credits; he notices single-pixel flaws.
**He REFUSED to open-source the code** ("so someone with more followers can just copy paste it and steal
everything"): never add a licence file, skip the two curated GitHub lists, do not raise it again. (The repo
is public with no licence, which legally reserves all rights; making it private is possible on Vercel and is
his call if he ever asks.) He is watching his weekly token limit and wants the list finished "asap so I can
move on to another project": small agent counts, Opus, precise briefs, ship each item as it passes.
Work on branch `seo/discoverability` (= `main` at the end of the session), push to `main` when a piece passes
`npm run build` (prebuild tests + the SEO guard), `npm run test:switches` and `node audit/selftest.js`.
**NEVER let agents run `git stash/reset/checkout`**: one did mid-build on 2026-09-21 and silently destroyed
another agent's edits. For work that must not collide with a running job, use a separate `git worktree` with
a node_modules JUNCTION, and remove the junction with `[System.IO.Directory]::Delete(path, $false)` BEFORE
removing the worktree (never `rm -rf`, which follows it into the real packages).

**ACCOUNTS ARE BUILT AND LIVE BUT HIDDEN ON `main` (pushed 2026-09-21, `08e64af`, his go).** He said he will make
the Resend account and follow the README "later"; it is ready "in case the site gains popularity". Do not
chase him. `/method/` and `/about/` keep today's wording until the keys are set. Read
`design/accounts/BUILD-BRIEF.md` + `FIX-ROUND-1.md` (spec and rulings) and `site/src/lib/account/README.md` (his
numbered setup steps: fifteen with Resend, seventeen with Brevo). The flow is his: email-only box, the emailed
link lands on a set-a-password page, then email + password, "forgot" sends the same kind of link, Google later.
NEXT STEPS WHEN HE IS READY: (1) DONE: the hidden code is on `main`; (2) he makes the Resend account (his
choice, 2026-09-21) and works through the README; (3) he tests at the unlinked
`wiserwalk.com/account/sign-up/`; once signed in, his own `/me/` shows the signed-in version while the public
sees nothing; he can see signed-out visitors' entry points on a Vercel PREVIEW build; (4) with his go, flip
`ACCOUNT_LINKS_LIVE` in `site/src/lib/account/config.ts`, run `npm run test:switches` (it must pass), push.
NOTHING HAS RUN AGAINST A REAL SUPABASE PROJECT: expect small fixes after his first real sign-up (watch for:
the admin delete call's headers, whether the emails-per-hour limit applies with the hook on, schema.sql's first
run). My calls he has not ruled on: marketing is a plain notice read before typing, with an off switch on
`/account/` (no tick box); deleting an account also removes the mailing contact; a signed-out `/me/` asks for
an email in the band AND the footer still has its newsletter box. After accounts: the profile (cross-quiz page;
sync `sls.daily` / `wsi.daily` when Today's Challenge returns).

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
