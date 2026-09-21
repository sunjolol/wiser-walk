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

## 2026-09-21: the redesign is LIVE (merged with the owner's yes)

`design/home-dawn` was fast-forwarded into `main` and checked in production: the photographic home
page and footer, the quiz rail with Doré engravings, a painting for every article, ELEVEN articles,
"My results" (`/me/`, device-only, noindex, out of the sitemap), `/support/` giving to the owner's
Ko-fi page (https://ko-fi.com/sunjolol), a Brevo email provider, and a site-wide rule against
one-word last lines (`text-wrap: pretty` / `balance`; he called orphans "super sloppy").
**Sign-up still answers "not switched on" in production** until he adds `BREVO_API_KEY` and
`BREVO_LIST_ID` in Vercel (he has the Brevo account and key; he asked where to put it and was told:
project, Settings, Environment Variables, Production and Preview, then redeploy).
Next, in the order put to him: carry the look to `/quizzes/`, `/games/`, quiz intros and results; the
daily game set; accounts (email first, then set a password; Supabase proposed); the profile. His
answers are in `CLAUDE.md` under "THE OWNER'S DIRECTION CHANGED". Ask before building accounts.

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
