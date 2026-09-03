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

## Naming and domain — DO NOT REDO THIS

**The owner is handling the name and domain himself. Do not start another naming search unless he explicitly asks.**

About 1,100 `.com` domains were checked via RDAP across ~27 sweeps in one session, with no usable result. Recording the constraints and rejections so this is never repeated:

- **Hard constraints:** `.com` only (`.org` explicitly refused). Two words maximum, one preferred — ideally a combination word or an invented word "that has a ring to it".
- **Names he admires as models:** `understandmyself.com` and `clearerthinking.org` — plain, descriptive, general, memorable, destination-feeling. Note `understandmyself` is **two** words (I once mis-parsed it as three; that error wasted a whole pass).
- **Explicitly rejected:** the word "faith" (feels like a church); "wiser" (weird to say); every `-ward` name ("absolutely garbage"); "almost / not yet / barely" framings (negative, bad marketing); theology-jargon compounds (`creedmap`, `theoaxis`, `doctrinescale` — "absurd, a major logic/extrapolation fail" because not all quizzes are theology); anything three words or longer; and above all **templated variations on his own examples** — he asked for variety repeatedly and did not get it.
- **`wisewalk.com`** is the name he liked best. It is parked with GoDaddy (held since 2000, renewed to 2027) at roughly **$7,500**, which he has refused as too expensive for a side project.
- `wiserwalk.com` is free but rejected over "wiser". `wisewalk.org` is free but `.org` is refused.
- Finding: `.com` is picked clean. Every evocative single word and pleasant short compound is squatted, including obscure ones (`bochim`, `aholiab`, `jabbok`, `crucible`, `whetstone`, `touchstone`, `noetica`, `binah`). Verified accurate — a control string returns 404 while these return 200.

**Working name for now:** the repo and project stay `theology-compass` until he chooses. GitHub renames cleanly with redirects, so this costs nothing.

## Immediate next step: the GitHub repo

He wants a **public** GitHub repo. There is **no `gh` CLI installed**, so the flow agreed with him is:

1. He creates an **empty public repo** on github.com (no README, no `.gitignore`, no licence) and pastes the URL.
2. Claude runs `git remote add origin <url>` and pushes.

State: local git repo initialised, **one commit** `c8fd322`, 137 files tracked, `node_modules` excluded. Authored as `Light <serenitybackto@gmail.com>` — he was offered a GitHub noreply address to keep his email out of public history and **chose to keep his real email**. Do not change it.

## Where the build stands

### Done

- **`theology-compass.html`** — the working demo with the full fairness audit applied, published at https://claude.ai/code/artifact/66ae7e10-200a-45a6-a1d0-acca94886428 (republish the same file path to keep the link).
- **The fairness audit is complete.** 20 adversarial reviewers raised 522 findings; three-lens verification (accuracy / fairness / necessity) kept 424, including all 42 blockers. Six tradition families added (18 total). All 18 published answer sheets land on their own tradition at 87–95%. **Do not re-run it.**
- **All nine scoring/copy fixes** the audit specified are implemented: base-13 permalink, 198-unit match denominator, 10-unit tie rule, 45-unit poor-fit hedge, all-central suppression, middle-band exclusion in `headline()`, `lean()` as a share of the half-axis, eleven-slot share bar, "Unsure / neither" plus scale hint, closest-traditions scope note, footer.
- **Back button fixed** — it did nothing on statement 1 (a disabled control) and was dead for ~390ms after each answer. Now cancels pending timers, and on statement 1 reads "← Leave the quiz" and exits to the intro.
- **Stage 0 scaffold** — Astro + Vercel in `site/`, builds clean (46 pages, sitemap, Vercel output). Not deployed; that needs his Vercel account (`npx vercel` from `site/`).

### Files that matter

- `V1-BLUEPRINT.md` — the staged build plan. **Stage 2 has been rewritten for the platform vision.** Also published at https://claude.ai/code/artifact/f37302b7-cdd8-4be9-8529-0e9713caf579
- `audit/fairness-report.md` — the editor's report; read section 1 first.
- `audit/compass-data.revised.json` — the audited data now live. Also holds `candidate_statements` (18 drafted for v1), `simulations` (18 answer sheets), `changelog` (89 entries), `disputed` (11 kept but not applied), `scoring_v1_proposed`.
- `audit/apply.js` — regenerates the demo page's data block: `node audit/apply.js audit/compass-data.revised.json`.
- `audit/selftest.js` — **run `node audit/selftest.js` after any data or scoring change, and before any publish or deploy.**
- `audit/review-results.json`, `audit/findings/*.json` — raw reviews by target.
- `audit/theology-compass.pre-audit.html` — the page before the audit.
- `site/scripts/build-data.mjs` — regenerates `site/src/data/compass.json` from the audit file and derives the permalink radix from the item count (13 at 3 statements per axis, 25 at 6). Never hand-edit the generated file.
- `site/src/lib/compass.ts` — the shared scoring core ported from the audited page.
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
