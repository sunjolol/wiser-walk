# codebase-map

web_access_worked: undefined

# Accounts: what the codebase already has, and where it touches

All paths are absolute under `C:/Users/Light/Desktop/claude/theology compass/`.

---

## 1. The header

### Markup
`site/src/layouts/Base.astro`

| what | where |
|---|---|
| `NAV` array (the whole nav, data-driven) | `Base.astro:79-120` |
| `{ href: '/me/', label: 'My results', icon: 'users' }` — the only icon item | `Base.astro:119` |
| header element `<header class="site-head"><div class="wrap">` | `Base.astro:198-199` |
| brand `<a class="brand" href="/">` | `Base.astro:200` |
| `<nav>` with the three render branches | `Base.astro:208-240` |
| branch A — `<details class="navmenu" name="sitenav">` + `.navmenu-panel` (Quizzes, Games) | `Base.astro:209-229` |
| branch B — `<a class="nav-me">` with `aria-label`, `<Icon>`, `.nav-me-word`, `.nav-me-dot` | `Base.astro:230-236` |
| branch C — plain `<a>` (Articles, Donate) | `Base.astro:237-239` |
| `<button class="theme-toggle" id="theme-toggle">` (the bulb) | `Base.astro:241-251` |
| `<main class="wrap page"><slot /></main>` | `Base.astro:255` |

`isCurrent()` at `Base.astro:64` drives `aria-current="page"`.

### How the "My results" mark is painted
An inline IIFE at `Base.astro:459-466`:

```js
var item = document.querySelector('.site-head .nav-me');
var saved = JSON.parse(localStorage.getItem('ww.shelf.v1'));
if (Array.isArray(saved) && saved.length) item.classList.add('has-saved');
```

It reads the raw key, never imports `lib/shelf`, runs once on load, and never writes. The only other place that touches the class is `site/src/pages/me.astro:270`, which removes `has-saved` after "clear my results" so the header does not contradict the page.

### Where a signed-in state could be painted
- **The pre-paint slot:** `Base.astro:137-145` — an `is:inline` script in `<head>` that sets `document.documentElement.dataset.theme` before first paint. This is the established pattern for "must be right before the page is visible". A `data-signed-in` on `<html>` set the same way would let CSS swap the header with no flash.
- **The post-paint slot:** the script block at `Base.astro:351-494` (four IIFEs: nav menus, footer sign-up, the shelf dot, the bulb). A fifth IIFE here is the least invasive place to paint a signed-in chip.
- Nothing in the header is server-rendered per-reader, and nothing can be: every page but `/api/subscribe`, `/r/…` and `/c/…` is static (see §8 risk 2).

### Analytics hook that any new route must respect
`Base.astro:172-194` — a `va('beforeSend')` that rewrites `/r/<quiz>/<code>/` → `/r/<quiz>/` and `/c/…` likewise. It strips nothing else. Any account route carrying a token in the query or hash would be recorded verbatim.

### The phone header
`site/src/styles/touch.css:59-75`
- `≤45.99rem`: `.theme-toggle` and `a.nav-me` become 48×48 targets, icons 24px (`touch.css:62-65`).
- `≤29.99rem`: `.site-head nav` is widened to `calc(100% + 1rem)` and `a.nav-me` is pushed right with `margin-left:auto; margin-right:.5rem` so its active circle sits under the bulb without being clipped (`touch.css:67-75`).

Supporting CSS:
- `site/src/styles/site.css:191-221` — base flex layout; below 30rem the nav **wraps to its own third row** (`site.css:212-217`).
- `site/src/styles/kit.css:69-94` — nav items as pills, 44px min-height; below 30rem the nav is a **horizontal scroller** with hidden scrollbar; a measured note at `kit.css:86-94` says the six items "only just fit" between 30rem and 34rem.
- `site/src/styles/kit.css:96-124` — `.nav-me`; `.nav-me-word` is sr-only clipped below 46rem and only becomes visible text at `≥46rem` (`kit.css:119-123`). `.nav-me-dot` is the gradient dot (`kit.css:113-118`).
- `site/src/styles/kit.css:125-195` — `.navmenu`; the panel is `position:absolute` against `.site-head` below 30rem (to escape the scroller's clip) and against the item from 30rem.

---

## 2. Every browser-storage key

### localStorage — the site
| key | shape | written by | read by |
|---|---|---|---|
| `ww-theme` | `'light' \| 'dark'` (plain string) | `Base.astro:140` (from `?theme=`), `Base.astro:488` (bulb); `play/sounds-like-scripture.astro:78`, `play/who-said-it.astro:78` | `Base.astro:141`; `play/*.astro:79` |
| `ww.shelf.v1` | JSON `Array<{quiz:string, code:string, at:ISOstring}>`, newest first, capped at 200 | `site/src/lib/shelf.ts:122` (`saveShelf`) — the single write point | `shelf.ts:109`; `Base.astro:463` (raw); `me.astro:176` via `readableResults()` |

`ww.shelf.v1` constants: `SHELF_KEY` `shelf.ts:25`, `SHELF_CAP = 200` `shelf.ts:28`, `SAME_RUN_MS = 60_000` `shelf.ts:36`, `ShelfEntry` interface `shelf.ts:38-45`.

### sessionStorage — the site
| key | shape | written | read | removed |
|---|---|---|---|---|
| `ww:took:<quizSlug>` | result code string | `q/[quiz].astro:445` | `r/[quiz]/[code].astro:211`, `components/ShareBlock.astro:147`, `c/[quiz]/[codes].astro:282` | — |
| `ww:with:<quizSlug>` | an inviter's result code | `q/[quiz].astro:402` | `q/[quiz].astro:456` | `q/[quiz].astro:458` |

### localStorage — Sounds Like Scripture
Key map at `site/src/games/sounds-like-scripture.html:1038`:
`var K = { canon: 'sls.canon', seen: 'sls.seen', best: 'sls.best', fooled: 'sls.fooled' };`

| key | shape | written | read |
|---|---|---|---|
| `sls.canon` | `"p"｜"c"｜"o"` | `:1139` | `:1575` |
| `sls.seen` | `string[]` of line ids; **emptied** when fewer than 30% of the pool is unseen (`:1162-1164`) | `:1164` | `:1154` |
| `sls.best` | `number` | `:1363` | `:1361`, and `me.astro:278` | |
| `sls.fooled` | `{ [sourceLabel: string]: number }` | `:1351` | `:1348`, `:1408` |

Helpers `read()`/`write()` at `:1039-1047`, both JSON and both try/catch.

### localStorage — Who Said It?
Key map at `site/src/games/who-said-it.html:1182`:
`var K = { seen: 'wsi.seen', best: 'wsi.best', mix: 'wsi.mix' };`

| key | shape | written | read |
|---|---|---|---|
| `wsi.seen` | `string[]`, same 30% reset (`:1270`) | `:1270` | `:1260` |
| `wsi.best` | `number` | `:1445` | `:1443`, `me.astro:278` |
| `wsi.mix` | `{ [confusionKey]: number }`, built by `addConfusion()` `:1104-1112` | `:1386` | `:1386`, `:1494` |

**Both game HTML files are generated but committed.** Never hand-edit `site/src/games/*.html`; edit `demos/<game>/game.src.html` and run `demos/<game>/scripts/build-page.mjs`, which writes the standalone demo *and* the site copy. Stated at `play/sounds-like-scripture.astro:10-15`.

/me/ reads the two `*.best` keys through a map at `me.astro:37-40` and the loop at `me.astro:274-283`.

---

## 3. Where results are saved and removed

**There is exactly one writer of finished results on the whole site.**

- `site/src/pages/q/[quiz].astro:370` — `import { addResult } from '../../lib/shelf';`
- `site/src/pages/q/[quiz].astro:450` — `addResult(quiz.slug, code);` inside `goToResult(values)` (`:441-463`). It is called **before** the branch that decides between `/r/…` and `/c/…` (`:452-462`), so a reader who finishes into a comparison still gets their own result shelved.

Everything else:
- `clearShelf()` — one caller, `me.astro:265` (behind a `window.confirm` at `:261-263`).
- `removeResult()` — exported at `shelf.ts:186-198`, **no caller anywhere in the site**. It exists and is tested; nothing uses it.
- `latestPerQuiz()` `shelf.ts:162`, `historyFor()` `shelf.ts:173` — exported, no site caller (tested only).

**The right seam for a sync layer** is `shelf.ts`, not the runner: every mutation funnels through `saveShelf()` at `shelf.ts:116-127`, and every function already takes its store as its last argument (`ShelfStore` interface `shelf.ts:48-52`, `browserStore()` `shelf.ts:55-62`). Swapping in a store that also writes to a server needs no change in `q/[quiz].astro` or `me.astro`.

Useful property: **quizzes are scored entirely in the browser and the result code carries the scores** (`r/[quiz]/[code].astro:23-34`). A server table only ever needs `{quiz, code, at}` — the same three fields as `ShelfEntry`.

---

## 4. How /me/ renders, and the copy that must change

`site/src/pages/me.astro` — server shell at `:43-136`, client script at `:138-285`.

**Server** renders an invitation per quiz from `QUIZZES` (`:59-102`): each `<article class="mroom" data-quiz data-href>` holds a hidden `[data-role="has"]` block (`:76-88`) and a visible `[data-role="none"]` block (`:91-98`). Games row at `:105-122`. The order matters and is documented at `me.astro:10-14`: with JS or storage blocked the page is still a set of doorways.

**Client** `paint()` at `:175-256`: reads `readableResults()`, groups by quiz, decodes each latest code through `decodeFor`/`resultFor` (`:200-201`), fills headline/summary/when/href (`:204-207`), builds the earlier-results `<details>` capped at 8 with the remainder counted out loud (`:209-238`), sets `room.style.order = '-1'` on taken rooms (`:245`), and writes the count line (`:248-253`).

Page is `noindex` (`me.astro:46`) and cut from the sitemap (`astro.config.mjs:42`).

### Copy on /me/ that accounts make false
| line | text |
|---|---|
| `me.astro:45` | `description="Every quiz you have finished **on this device**, and the games you have played."` |
| `me.astro:52` | chip: `On this device` |
| `me.astro:54` | `Everything you finish here waits for you on this page.` |
| `me.astro:126` | `<h2>Kept on this device.</h2>` |
| `me.astro:128-130` | `These are saved on this device only. **Accounts are on the way**, so you can keep them for good and see them anywhere. Leave your email and we will tell you when.` |
| `me.astro:131` | `<a class="me-keep-go" href="#foot-signup">Leave your email` — points at the **marketing** footer form, not a sign-up |
| `me.astro:135` | `Clear my results **from this device**` |
| `me.astro:252` | `Nothing saved yet. Take one, and it will be here when you come back.` |
| `me.astro:262` | confirm: `Clear every result saved on this device? The links themselves still work if you have them.` |
| `me.astro:6-8` | file docstring: "Accounts come later; this needs none." |
| `r/[quiz]/[code].astro:190` | the saved pill: `Saved to <a href="/me/">My results</a>` |

CSS: `site/src/styles/pages/me.css` — `.me-band` `:13`, `.me-chip` `:30`, `.me-count` `:44`, `.me-rooms` `:55`, `.mroom*` `:57-192`, `.me-head` `:195`, `.mgame*` `:201-217`, **`.me-keep` `:221-236`** (the dark panel that carries the accounts promise), `.me-keep-go` `:227`, `.me-clear` `:237`, `.me-clear-btn` `:238`.

---

## 5. Test conventions, and wiring a new test

**No test framework. No devDependencies.** Two plain Node ESM scripts in `site/scripts/`.

The pattern (both files):
1. `import { build } from 'esbuild'` and bundle the TypeScript entry to `node_modules/.<name>.mjs` — `engine-test.mjs:9-26`, `email-test.mjs:9-25`. Options: `bundle:true, format:'esm', platform:'node', target:'node18', logLevel:'silent'`.
2. `await import(pathToFileURL(OUT).href)` and destructure the exports — `engine-test.mjs:28-32`, `email-test.mjs:27`.
3. A `let failures = 0` counter with `fail()`/`ok()` one-liners — `engine-test.mjs:56-58`, `email-test.mjs:29-35` (email adds `is(actual, expected, what)` on JSON equality).
4. Numbered sections printed with `console.log('7. provider choice')` and a rule comment.
5. `rmSync(OUT, { force: true })` at the end — `engine-test.mjs:1579, 1582-1583`.
6. `process.exit(failures ? 1 : 0)` — `engine-test.mjs:1585-1590`, `email-test.mjs:248-249`.

Two extra conventions worth copying for auth:
- **A second bundle for a second module**: `engine-test.mjs:43-54` (types) and `:1442-1456` (shelf) each get their own esbuild call inside the section that needs them.
- **A fake store**, three methods plus a peek: `engine-test.mjs:1458-1467`. A store that throws on every method is tested separately at `:1542-1554` ("blocked storage is a no-op, never an error").
- **A stubbed `fetch`** that records what it was asked to send, with `realFetch` saved at `email-test.mjs:61` and restored at `:207` and `:237`: `stub(handler)` `:38-45`, `reply(status, body)` `:46-52`. `email-test.mjs:5-8` states the rule: *nothing touches the network and no test uses a real key*.

### Wiring
`site/package.json`
- `:9` `"prebuild": "node scripts/build-data.mjs && node scripts/engine-test.mjs"`
- `:13` `"test": "node scripts/build-data.mjs && node scripts/engine-test.mjs && node scripts/email-test.mjs"`

A new `scripts/auth-test.mjs` must be appended to **both** if it is to gate a Vercel deploy — `email-test.mjs` is in `test` only, so it never runs on Vercel.

---

## 6. Every piece of copy about storage, privacy and accounts

**`site/src/pages/method.astro`**
- `:159` the jump-bar entry `{ id: 'your-answers', label: 'Your answers' }` (section list at `:156-161`)
- `:401` `<SectionHead id="your-answers" title="Your answers" kicker="What leaves your browser, and when" />`
- `:406-407` `Scored on your device` / `Nothing is sent.`
- `:411-413` **"Every quiz is scored in your browser. Answers are never sent to a server, there is no account, and nothing about your result is stored on our side. A result link carries only your scores, encoded — which is also why a broken link cannot be recovered."**
- `:416-419` "A result you finish is now saved in your own browser, so you can find it again on My results. It stays on that device and is not sent anywhere, and clearing the lot is one button on that page."
- `:425-426` `The two exceptions` / `Only if you ask for it.`
- `:430-437` the two forms; ends **"if you fill in neither form, nothing leaves your browser at all."**
- `:440-443` "This page used to say there was no email list. There is one now…"
- `:450` `Counted, cookieless, never joined up.`
- `:456-457` "no **account**, address or identity is attached to a view"
- `:472-473` `On your device, nowhere else` / `Four things in local storage.`
- `:477-484` the four SLS keys named in prose
- `:520-522` "the game keeps three things in your browser's own storage and nowhere else" (WSI)

**`site/src/pages/about.astro`**
- `:168-172` build comment: *"No promises about storage or accounts here. Sign-in with saved results is something the owner intends to build, and a page that has spent years saying 'no accounts' cannot then ship one."*
- `:177` "**Not a mailing list you get put on.** There is one, and it is entirely opt-in…"

**`site/src/components/EmailCapture.astro`**
- `:36-43` the offer sentence (`Three or four emails on where your answers actually came from…`)
- `:93-99` the small print: **"Your answers stay in your browser, as always. Subscribing sends two things and nothing else: the address you type, and the code from this page's link… The first email may ask you to confirm the address, and every email has an unsubscribe link."** + `<a href="/method/#your-answers">The full detail</a>`
- `:130-134` / `:149-151` the three status strings

**`site/src/layouts/Base.astro` (footer)**
- `:276-278` `By email, now and then` / `Keep walking.` / `New quizzes and games as they are made.`
- `:291` button label `Sign up` — **already the word "Sign up", for the newsletter**
- `:424-429` / `:445-447` status strings ("Thank you. Look out for an email from us; the first one may ask you to confirm." / "You are already on the list.")

**Code comments that are also a published promise**
- `site/src/lib/shelf.ts:17` `nothing is sent    it is the reader's device and nowhere else.`
- `site/src/lib/email/provider.ts:12-13` "quiz answers still never leave the browser"
- `site/src/lib/email/README.md:8-10` "the same account can later send the **sign-in and account emails**. Nothing has to move when accounts arrive."

---

## 7. CSS and kit building blocks

### Buttons — `site/src/styles/site.css`
`.btn` `:290-301` (inline-flex, gap .5rem, 44px min-height, pill, gradient) · `.btn:hover` `:302` · `.btn.dark` `:303-306` · `.btn.ghost` `:307-310` (outline only) · `.btn:disabled` `:311` (opacity .45) · `.btn-row` `:312`.

### Form fields — two existing sets, use one, do not invent a third
**On a light panel** (`site.css:990-1011`): `.capture` `:990-993`, `.capture-offer` `:995`, `.capture-row` `:996-997` (column on phone, row from 30rem), `.capture-row input` `:998-1005` — **`font-size: 1rem` with the comment "16px, or iOS zooms the page on focus"**, 46px min-height, pill, inset shadow, `background: var(--shell)`. `.capture-row .btn` `:1006`.

**On a photograph** (`kit.css:664-689`): `.foot-signup` `:664`, `.foot-signup-row` `:665-666`, `.foot-signup-icon` `:667` (absolutely positioned mail mark inside the field), `.foot-signup-row input` `:668-677` (white-on-dark, focus outline `var(--blue-soft)`).

### Status messages
`.capture-status` + `.is-ok` / `.is-bad` / `.is-busy` — `site.css:1007-1010`. Dark/photo variants `.foot-signup-status.is-ok|is-bad|is-busy` — `kit.css:679-689`. Both use `role="status" aria-live="polite"` in markup (`EmailCapture.astro:85`, `Base.astro:293`) and a `say(text, kind)` helper (`EmailCapture.astro:107-110`, `Base.astro:392-395`).

### Hidden things
`.sr-only` `site.css:1015-1018` · `.hp` (honeypot) `site.css:1014`, used at `EmailCapture.astro:64-66` and `Base.astro:283-285`.

### Dark panels
`.dark` `kit.css:423-437` — **re-points the CSS tokens** (`--panel`, `--ink`, `--accent`, `--rule`…) so any instrument dropped inside recolours itself. `.dark a:not(.btn):not(.chip-link):not(.rankgrid-cell)` `:443`. `.dark-ghost` `:445-450`. Dark-theme override `:438`.

### Panels, heads, lists
`.pnl` / `.pnl-head` / `.pnl-kicker` / `.pnl-title` / `.doc` / `.stack stack--2` — the method page's two-column panel grid, in use at `method.astro:403-465`. `SectionHead.astro` (lowercase italic display head with an `id`). `.note` / `.note.draft` `site.css:316-324`. `.spec` dotted definition list `kit.css:484-497`. `.chips` / `.chip-link` `kit.css:498-512`. `.scards` / `.scard` `kit.css:513+`. `.feature` `kit.css:451-482`. `.band` `kit.css:196+` via `Hero.astro`. `.tiles`, `.tile`.

### Phone
`site/src/styles/touch.css:17-57` — **a hard-coded list of "go" link classes** (`.room-go, .read-go, .gcard-go, .qroom-go, .mroom-go, .nx-go, .scard-go` at `:18-24`) that become 44px pills below 46rem. A new call-to-action class must be added to that list or it will render as a bare text link on a phone.

### Icons
`site/src/lib/icons.ts:8-10` — the `IconName` union: `compass, flame, scroll, book, arrow, users, sparkle, mail, pencil, clock, quote, play, path, apple`. **No user/lock/key mark exists.** A new mark must be drawn in `site/src/components/Icon.astro` *and* named in `icons.ts` (`icons.ts:5-6`).

---

## 8. Risks — things that break or contradict themselves once accounts exist

1. **The site's central privacy sentence becomes false.** `method.astro:411-413`: *"Answers are never sent to a server, there is no account, and nothing about your result is stored on our side."* And `method.astro:436-437`: *"if you fill in neither form, nothing leaves your browser at all."* `about.astro:169-171` already names this hazard in a build comment. These must ship in the same commit as the first account route, not after it.

2. **Cached static pages cannot carry signed-in state.** Everything is `output: 'static'` (`astro.config.mjs:22`) except three routes (`api/subscribe.ts:7`, `r/[quiz]/[code].astro:25`, `c/[quiz]/[codes].astro:35`), and the result page explicitly sets `cache-control: public, max-age=600` (`r/[quiz]/[code].astro:31`). Anything reader-specific rendered server-side on those pages would be served to the next person. Signed-in state must be painted client-side, in `Base.astro`.

3. **The header dot goes stale.** `Base.astro:459-466` paints once, on load, from the raw `ww.shelf.v1` key. If an account's results live on a server, a signed-in reader on a new device sees no dot; a signed-out reader on an old device sees one. The only invalidation that exists today is `me.astro:270`.

4. **Merging a device shelf into an account will duplicate history.** `addResult` dedupes only on `(quiz, code)` within 60 seconds (`shelf.ts:36, 147-155`). The same result taken on a phone and a laptop is two entries with different `at` values, and a naive server merge keeps both. `SHELF_CAP = 200` (`shelf.ts:28`) silently drops the oldest, so a merge can also lose history without saying so.

5. **Stored codes can stop decoding.** `isReadable()` (`shelf.ts:217-225`) drops an entry whose code no longer decodes for its quiz, and `readableResults()` (`:228-230`) is what /me/ renders. The permalink radix is derived from the item count by `scripts/build-data.mjs`, so changing a quiz's statement count invalidates every old code for it. On a device that is a quiet disappearance; on a server it is data the owner believes he is keeping. Needs a decision before results are stored server-side.

6. **A token in a URL will be logged.** The password-set link lands from an email. The analytics `beforeSend` hook (`Base.astro:181-193`) strips **only** `/r/…` and `/c/…` paths — it does not clear `search` or `hash` for any other route. The game pages do clear both (`play/sounds-like-scripture.astro:105-113`), which is the pattern to copy. Not doing so directly contradicts `method.astro:456-461` ("no account, address or identity is attached to a view").

7. **New routes are crawlable by default.** The sitemap filter (`astro.config.mjs:40-44`) excludes `/r/`, `/c/`, `/me/` and draft-quiz prefixes only; `robots.txt` is `Allow: /` (`site/public/robots.txt:1-2`). A `/set-password/` or `/account/` route needs both a sitemap exclusion and `noindex={true}` (the Base prop at `Base.astro:17-18, 130`).

8. **Dependency discipline.** `package.json:15-19` declares exactly three dependencies and no devDependencies. `esbuild` — which both test scripts import — is not declared and resolves transitively through Astro/Vite; a Supabase SDK would be the first new dependency in nine months and the first third-party JS ever shipped to the browser (the head preconnects only to Google Fonts, `Base.astro:147-152`).

9. **No middleware, no session seam.** There is no `src/middleware.ts`. Session handling has nowhere to live today except inside individual `prerender = false` routes, each of which becomes another Vercel function on the Hobby plan.

10. **Secret handling.** `readEnv()` (`src/lib/email/env.ts:16-21`) merges `import.meta.env`, `process.env` and `locals.runtime.env` — and `import.meta.env` values are **inlined at build time**. A Supabase anon key is fine there; a service-role key must be read only from `process.env` inside a `prerender = false` route and must never be given a `PUBLIC_` name.

11. **`email-test.mjs` does not gate deploys.** It is in `test` (`package.json:13`) but not `prebuild` (`package.json:9`). An auth test added only to `test` would never run on Vercel.

12. **The nav has no room for a word.** `kit.css:86-94` carries a measured comment that between 30rem and 34rem the existing items "only just fit" and that the roomier padding once pushed the row to 521px at 480px wide and made the page scroll sideways. `.nav-me-word` is deliberately hidden below 46rem (`kit.css:112, 119-123`). A seventh item reading "Sign in" has to be a mark, not a word, below 46rem — or replace the `/me/` item rather than sit beside it.

13. **The games are outside the header and outside the build.** `play/sounds-like-scripture.astro` and `play/who-said-it.astro` render their own `<html>` with **no site header and no Base layout** (`play/sounds-like-scripture.astro:4-8`), so they have no sign-in affordance and no session code today. Their state lives in generated-but-committed HTML (`site/src/games/*.html`) that must never be hand-edited; syncing a best score to an account means editing `demos/<game>/game.src.html` and rebuilding.

14. **Brevo's 300/day is one budget for two jobs.** The marketing list and Supabase Auth's transactional mail (sign-up links, password resets) would share it. A burst of sign-ups could starve the newsletter, or vice versa, and a reader who never receives a set-password link has no recovery path.

15. **"Leave your email and we will tell you when" becomes a trap.** `me.astro:128-131` points at `#foot-signup` — the marketing form. Once accounts ship, a reader who follows that link to "keep my results" lands on a newsletter box that creates no account. Same word collision in the footer: the newsletter button already reads `Sign up` (`Base.astro:291`).

16. **Local dev has no auth escape hatch.** `site/.env` contains `EMAIL_PREVIEW=1`, which forces the console provider (`provider.ts:252`) so a local run can never write to the live list. Auth needs the equivalent, or the first local test will send real mail against the real project.

## integration_points
- site/src/lib/shelf.ts:116-127 — saveShelf() is the single write point for every shelf mutation (addResult, removeResult, clearShelf all funnel through it). Every function already takes a `ShelfStore` as its last argument (interface at shelf.ts:48-52, browserStore() at :55-62), so a server-backed store can be substituted without touching q/[quiz].astro or me.astro. This is the sync seam.
- site/src/pages/q/[quiz].astro:450 — the ONLY addResult call site on the site, inside goToResult() (:441-463), called before the /r/ vs /c/ branch. Import at :370.
- site/src/layouts/Base.astro:459-466 — the inline IIFE that paints the header's has-saved dot from raw localStorage['ww.shelf.v1']. The natural place to also paint signed-in state; today it runs once on load and is only invalidated by me.astro:270.
- site/src/layouts/Base.astro:137-145 — the pre-first-paint is:inline script that sets data-theme on <html>. The established pattern for state that must be correct before the page is visible; a data-signed-in attribute set the same way avoids a flash of the signed-out header.
- site/src/layouts/Base.astro:79-120 — the NAV array. Adding or swapping a header item is a data change here; branch B at :230-236 renders an icon-only item (.nav-me) and is the template for a sign-in mark.
- site/src/pages/me.astro:175-256 — paint(), which reads readableResults() and fills each room. Where an account's server-side results would replace or merge with the device shelf.
- site/src/pages/api/subscribe.ts — the only existing non-static route (prerender=false at :7) and the model for any new server route: readEnv(locals) at :16, a 503 when unconfigured at :18-21, JSON and plain-form callers handled together at :26-46, honeypot at :50-52, a 405 ALL handler at :88-89.
- site/src/lib/email/env.ts:16-21 — readEnv() merges import.meta.env, process.env and locals.runtime.env in that order. Any Supabase key must be read through this, and a service-role key must come only from process.env inside a prerender=false route.
- site/src/lib/email/provider.ts:249-266 getProvider() and :273-276 isConfigured() — the pattern for a feature that stays hidden until the owner sets keys in Vercel. r/[quiz]/[code].astro:36 uses isConfigured() to decide whether the form renders at all (EmailCapture.astro:26 returns null when disabled).
- site/src/lib/email/README.md — the house style for owner-facing numbered setup steps (make the account, make the key, put it in Vercel, redeploy, verify with a curl). A Supabase README should match it, including the 'redeploy or nothing changes' warning at :47-48.
- site/package.json:9 and :13 — a new scripts/auth-test.mjs must be appended to BOTH prebuild and test; email-test.mjs is in test only and so never gates a Vercel deploy.
- site/scripts/email-test.mjs:38-52 — the stubbed-fetch harness (stub(handler) records url/init/body, reply(status, body) fakes a Response, realFetch saved at :61 and restored at :207). Reuse verbatim for any auth-provider test.
- site/scripts/engine-test.mjs:1442-1467 — the second-bundle-plus-fake-store pattern used for shelf.ts, including the always-throws store at :1542-1554.
- site/astro.config.mjs:40-44 — the sitemap filter. Any account route must be added here and given noindex={true} via the Base prop (Base.astro:17-18, 130).
- site/src/layouts/Base.astro:181-193 — the analytics beforeSend hook, which currently strips codes only from /r/ and /c/. Any route that can carry a token in the query or hash must be added; play/sounds-like-scripture.astro:105-113 shows the clear-everything variant.
- site/src/components/EmailCapture.astro:102-153 and site/src/layouts/Base.astro:387-449 — two working examples of a form that posts JSON via fetch, falls back to a plain POST with the outcome in ?sub=, and reports three states through a say(text, kind) helper. Copy this shape for sign-in and set-password rather than writing a fourth.
- site/src/styles/site.css:990-1011 (.capture form on a light panel) and site/src/styles/kit.css:664-689 (.foot-signup on a photograph) — the two existing field styles, both 16px to stop iOS zoom. Reuse one; do not add a third.
- site/src/lib/icons.ts:8-10 — the IconName union. There is no user/lock/key mark; a new one must be drawn in components/Icon.astro and named here.
- site/src/styles/touch.css:18-24 — the hard-coded list of call-to-action classes that become 44px pills below 46rem. A new one must be added or it renders as bare text on a phone.
- demos/sounds-like-scripture/game.src.html and demos/who-said-it/game.src.html plus their scripts/build-page.mjs — the only editable source of the games' localStorage code (keys at site/src/games/sounds-like-scripture.html:1038 and who-said-it.html:1182). Syncing game bests to an account starts here, never in the generated site/src/games/*.html.

## risks
- The site's central privacy claim becomes false on day one: method.astro:411-413 says 'Answers are never sent to a server, there is no account, and nothing about your result is stored on our side', and method.astro:436-437 says 'if you fill in neither form, nothing leaves your browser at all'. about.astro:169-171 already flags this in a build comment. The copy must change in the same commit as the first account route.
- Every page but three is static and cached (astro.config.mjs:22; prerender=false only at api/subscribe.ts:7, r/[quiz]/[code].astro:25, c/[quiz]/[codes].astro:35), and the result page sets cache-control public max-age=600 at r/[quiz]/[code].astro:31. Any reader-specific markup rendered server-side would be cached and served to the wrong person. Signed-in state has to be painted client-side.
- The header's has-saved dot (Base.astro:459-466) reads the raw localStorage key once on load and is invalidated in exactly one place (me.astro:270). With server-stored results it goes stale immediately: no dot on a new device, a phantom dot on an old one.
- Merging a device shelf into an account duplicates history. addResult dedupes only on (quiz, code) within 60 seconds (shelf.ts:36, 147-155), so the same result taken on two devices is two rows. SHELF_CAP=200 (shelf.ts:28) also drops the oldest silently, so a merge can lose entries without telling anyone.
- Stored result codes can stop decoding. isReadable() (shelf.ts:217-225) drops any entry whose code no longer decodes, and the permalink radix is derived from a quiz's item count by scripts/build-data.mjs. Changing a quiz's statement count invalidates every old code for it — tolerable on a device, but on a server it is data the owner believes he is keeping.
- A set-password link carries a token in the URL. The analytics beforeSend hook (Base.astro:181-193) strips codes from /r/ and /c/ only and does not clear search or hash for any other route, so a token would be recorded — in direct contradiction of method.astro:456-461 ('no account, address or identity is attached to a view').
- New routes are crawlable and sitemapped by default: astro.config.mjs:40-44 excludes only /r/, /c/, /me/ and draft-quiz prefixes, and public/robots.txt is 'Allow: /'. A /set-password/ or /account/ page needs both the exclusion and noindex={true}.
- package.json:15-19 declares three dependencies and no devDependencies; esbuild, which both test scripts import, is not declared and resolves transitively through Astro/Vite. A Supabase SDK would be the first new dependency and the first third-party JavaScript ever shipped to the browser (the head preconnects only to Google Fonts, Base.astro:147-152).
- There is no src/middleware.ts and no session seam. Session handling can only live inside individual prerender=false routes today, each one another Vercel function on the Hobby plan.
- readEnv() (src/lib/email/env.ts:16-21) merges import.meta.env, whose values are inlined at build time. A Supabase service-role key read through it, or given a PUBLIC_ name, would be baked into the client bundle.
- email-test.mjs is in package.json:13 ('test') but not package.json:9 ('prebuild'), so it never runs on Vercel. An auth test added only to 'test' would not gate a deploy.
- The nav has no room for another word. kit.css:86-94 records that the existing items 'only just fit' between 30rem and 34rem and that roomier padding once made the page scroll sideways at 480px; .nav-me-word is hidden below 46rem (kit.css:112, 119-123). A 'Sign in' item must be a mark below 46rem, or replace /me/ rather than sit beside it.
- The two games render their own documents with no site header and no Base layout (play/sounds-like-scripture.astro:4-8), so they carry no sign-in affordance and no session code. Their storage lives in generated-but-committed HTML (site/src/games/*.html, keys at :1038 and :1182) that must never be hand-edited; syncing a best score means editing demos/<game>/game.src.html and rebuilding.
- Brevo's free 300 emails/day is one budget shared by the marketing list and Supabase Auth's transactional mail. A burst of sign-ups could starve either, and a reader who never receives a set-password link has no recovery path.
- Word and link collisions: the footer newsletter button already reads 'Sign up' (Base.astro:291), and me.astro:128-131 tells a reader to 'Leave your email' at #foot-signup to keep their results — which creates no account. Both become actively misleading the moment real sign-up exists.
- Local development has no auth escape hatch. site/.env sets EMAIL_PREVIEW=1, which forces the console provider (provider.ts:252) so a local run can never touch the live list. Without an equivalent for auth, the first local test sends real mail against the real Supabase project.
- removeResult() (shelf.ts:186-198) is exported and tested but has no caller anywhere in the site. If a sync layer relies on it for 'delete this result everywhere', that path has never been exercised in a browser.