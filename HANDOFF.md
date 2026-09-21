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

## 2026-09-21: the whole redesign is LIVE (every merge had the owner's yes)

`main` carries: the photographic home page and footer; the quiz rail with Doré engravings; a painting for
every article and ELEVEN articles (cards load 560px `-card.jpg` copies); "My results" (`/me/`); `/support/`
giving to his Ko-fi page, with "Donate" in the header; Brevo sign-up SWITCHED ON (he set the keys; the
thank-you now stays on screen); and the DAWN PASS: a picture band on every page (`Hero.astro` kinds photo /
engraving / painting / night), hubs rebuilt as rooms, quiz intros and reference pages re-dressed around
their instruments, a what-next rail on results, 18 per-figure Doré plates (`site/public/img/figures/`), a
tally in place of the wheel on sparse figure pages (Jesus, Mary), and a real question on the Who Said It?
card. Design brief and the owner's complaints in one place: `design/DAWN-PASS-BRIEF.md`. Working captures
are gitignored (`design/shots/dawn/`, `design/shots/qa/`): never commit hundreds of MB of screenshots.
His small standing rulings: the home page's example wheel is the Eastern Orthodox sheet; the games band
uses the manuscript picture with slightly see-through cards; one footer quiz title is cut short BY HAND as a
stopgap (`FOOT_SHORT` in `Base.astro`) until he renames that quiz; no one-word last lines; the main action
is never below the fold; no picture that fades into blank space or repeats on one page; no credit lines he
has to look at on `/support/`.
**Next, in the order he approved:** the daily game set (he wants the site to feel like "a self-perpetuating
game": each day's set, a knowledge streak, a shareable grid), then accounts (email first, then set a
password; Supabase proposed, he must create the project), then the profile. Ask before building accounts.

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
