# Accounts on wiserwalk.com — Lens A design

**"No library, tokens never touch JavaScript."** Every Supabase call is made by our own on‑demand route with plain `fetch`, exactly the way `site/src/lib/email/provider.ts` calls Brevo. The browser ships **zero new JavaScript dependencies** and never holds a session token. The site's three‑dependency discipline is unbroken.

Two consequences shape everything below, and I state them up front because they are the honest price of the lens:

- **Good:** no `PUBLIC_SUPABASE_*` variable exists, so nothing Supabase‑related is inlined into a client bundle; an attacker cannot hit the project directly with our key; a stolen XSS payload finds no token to exfiltrate; and one shared TypeScript module holds the dedupe rule used by both the device and the server.
- **Bad:** Supabase sees our Vercel function's IP, not the visitor's, so Supabase's per‑IP rate limits become **site‑wide** limits. This is the single largest structural cost of Lens A. It is designed around in §7 and confessed in §10, where I also describe the hybrid I would steal.

---

## 1. THE FLOW

Throughout: every API route is `prerender = false`, answers `cache-control: no-store`, checks `Origin`, exports `ALL` → 405, and refuses anything that is not `content-type: application/json` (the honeypot form path is the one exception, below). Cookie names are `ww_at` (access), `ww_rt` (refresh), `ww_in` (a non‑secret hint). See §3.

### 1.1 First sign‑up

**URL:** `https://wiserwalk.com/account/sign-up/` (static, `noindex`, not in the sitemap).

**What they see:** a full‑bleed dawn photograph with a glass chip reading *Your account*, the headline *Keep your results **for good.*** with `for good` in `#FFD2B0`, a two‑line lede, and — inside the band, above the fold at 390px — one email field and one 52px button reading **Send me a link**. Under the field, unticked:

> ☐ Email me now and then when there is a new quiz, game or article. Every one has an unsubscribe link.

Under the button, in `.78rem` mute ink:

> We keep your email address, the results you finish and your best scores, so they follow you to any device. We will email you a link to set your password.

Below the band, three rooms in the `/support/` `.sp-room` shape (24px radius, a 2.6rem mark each in its own ink, rising `-3.4rem` into the band's foot): *results in one place* / *a profile that fills in as you go* / *hearing when something new is made*. At the foot, a 44px ghost pill: **I already have an account**.

**On submit → `POST /api/auth/link`**

```json
{ "email": "a@b.com", "mode": "new", "marketing": true, "website": "" }
```

The route, in order: origin check → honeypot (`website` non‑empty ⇒ return 200, make no call) → `looksLikeEmail` (reusing `provider.ts`'s existing validator) → per‑IP limiter (§7) → per‑address 60s cooldown → then

```
POST {SUPABASE_URL}/auth/v1/otp
apikey: {SUPABASE_PUBLISHABLE_KEY}
content-type: application/json
{ "email": "a@b.com", "create_user": true }
```

No `emailRedirectTo` is sent. The template hard‑codes the path off `{{ .SiteURL }}` (§6), so there is nothing to fall out of an allow‑list. The marketing tick is **not** acted on here — the address is not on a list until the password is set and the address is therefore proven (§6.4).

Supabase's own behaviour: a brand‑new address gets the **Confirm sign up** template, an existing confirmed address gets the **Magic link** template. The person sees the same words either way, so no address is ever confirmed or denied. Response to the browser: `200 {"ok":true}`.

**Then:** the page writes the address to `sessionStorage['ww:signup.email']` and navigates to `/account/check-email/`.

### 1.2 Check your email

**URL:** `https://wiserwalk.com/account/check-email/` (static).

**What they see:** the same photograph, chip *Sent*, headline *Check your **email.*** Their address printed back in DM Serif at ~1.15rem (read from `sessionStorage`; absent, the line is simply omitted rather than faked), and beside it a 44px ghost pill **Not that address?** returning to the form. Then one `.dark` panel: who the email is from (`Wiser Walk`, `account@wiserwalk.com`), the subject (*Set your password*), that it can take a minute and to look in spam, and a button that reads **Send it again in 47s**, counting down in tabular numerals, and then **Send it again** — never a greyed‑out ghost, per `support.css:197`.

Resend posts the same `/api/auth/link` call. Why the address is in `sessionStorage` and not the query: a PII value in a URL is forbidden and would be recorded by analytics.

### 1.3 Clicking the emailed link

The link in the email is

```
{{ .SiteURL }}/account/password/#token_hash={{ .TokenHash }}&type=email
```

Brevo rewrites it through its redirector — this cannot be turned off on any plan we will have. That is survivable **because the landing page does nothing on load.**

**URL:** `https://wiserwalk.com/account/password/` (static, `noindex`).

**On load the page makes no network call of any kind.** It reads a token from, in order:

1. `location.hash` → `token_hash` + `type` (the designed path);
2. `location.hash` → `access_token` + `refresh_token` (what arrives if the owner missed a template and `{{ .ConfirmationURL }}` was left in place — this still works);
3. `location.search` → `token_hash` (what arrives if Brevo's redirector strips fragments — see the flagged unknown at the end of §6).

It keeps whichever it found in a JavaScript variable, then immediately calls `history.replaceState(null, '', '/account/password/')` so the token leaves the address bar, leaves the back stack, and cannot reach any later `Referer`. Then it renders the form.

**A mail scanner that pre‑opens the link** performs a GET on a static HTML file. Nothing is redeemed, nothing is spent, the token survives. This is the entire reason the page defers.

**A different device or browser** works identically. Nothing from the requesting device is needed: the token is in the link, not in a cookie. They set a password there, are signed in *there*, and sign in on their usual browser with email and password — which is precisely why the password step exists rather than link‑only sign‑in.

**No token found at all** (someone typed the URL, or Brevo mangled it beyond all three readers): the page renders the *expired link* state described in 1.7.

### 1.4 Choosing a password

**What they see:** chip *One step* with the `path` mark (never "Almost there" — the "almost / not yet" framing is banned), headline *Choose a **password.***, lede *This is how you sign in from now on.* One field in the band, 46px, `autocomplete="new-password"`, `type="password"`, with a 44px **Show** / **Hide** control inside its right end carrying `aria-pressed`. There is **no confirm field** — it is the commonest place a non‑expert fails, and show/hide does the same job. Under the field, printed *before* they type: *At least 8 characters.* One 52px button: **Save it and sign in.**

No strength meter. A row of five differently‑sized, differently‑coloured bars is exactly the mark treatment the owner rejected this week.

**On submit**, the browser validates length locally **first** — this matters, because if the password is rejected *after* the token is spent, the token is gone. Only then:

**`POST /api/auth/set-password`** with `{ token_hash, type, password }` (or `{ access_token, refresh_token, password }` for reader 2).

The route:

1. Origin check; server‑side length check again (never trust the client's);
2. `POST /auth/v1/verify` with `apikey` and `{ "type": "email", "token_hash": "…" }` → `{ access_token, refresh_token, expires_in }`. (`type=email` searches `confirmation_token` **then** `recovery_token`, so one value covers all three templates.) Skipped when tokens arrived directly.
3. `PUT /auth/v1/user` with `apikey` and `Authorization: Bearer <access_token>`, body `{ "password": "…" }`.
4. **If step 3 fails, never re‑verify.** The session from step 2 exists. The route sets the cookies anyway, returns `422 { ok:false, signedIn:true, error:"<mapped message>" }`, and the page says *Your account is made. That password was not accepted — try another.* with the field still there, now posting to `/api/auth/set-password` with only `{ password }` and the cookies.
5. `POST /rest/v1/rpc/mark_password_set` with the user's token (a `security definer` function, §4).
6. If `marketing` was ticked at sign‑up (carried through `sessionStorage`), `POST /rest/v1/rpc/set_marketing_opt_in {"wants":true}` and then the **existing** `getProvider(env).subscribe({ email, source: 'account' })`. A Brevo failure here never fails the sign‑up; it is logged and retried on the next sign‑in.
7. Sets `ww_at`, `ww_rt`, `ww_in`; returns `200 { ok:true, email }`.

**Then:** the page runs the first merge (§5) and navigates to `/me/`, where the reader's results are now attached to an account and the page says so.

### 1.5 Signing in later

**URL:** `https://wiserwalk.com/account/sign-in/`

Chip *Welcome back*, headline *Sign **in.*** Email + password + a 52px **Sign in**, all in the band. A 44px ghost pill **Forgotten your password?** below. Under the fold, *No account yet?* and a pill to `/account/sign-up/`. Above the email field sits a commented, empty slot for the later Google button — a 52px control with an `or` hairline of `var(--grad-r)` at .5 opacity beneath it — built now so adding Google is not a relayout.

**`POST /api/auth/sign-in`** `{ email, password }` →

```
POST {SUPABASE_URL}/auth/v1/token?grant_type=password
apikey: {SUPABASE_PUBLISHABLE_KEY}
{ "email": "…", "password": "…" }
```

On 200 the route sets all three cookies and returns `{ ok:true, email }`. On `400 invalid_credentials` it returns **one** generic message for both fields: *That email and password do not match.* with the action *Forgotten your password, or never set one? Send me a link.* — which covers, without enumerating, both a wrong password and an account that has a row but has never set one.

### 1.6 Forgot password

**URL:** `https://wiserwalk.com/account/forgot/` — the same one‑field layout as sign‑up with a different chip and headline (*Send me a **new link.***). No fourth layout is built.

**`POST /api/auth/link`** with `mode: "reset"` →

```
POST {SUPABASE_URL}/auth/v1/recover
apikey: {SUPABASE_PUBLISHABLE_KEY}
{ "email": "…" }
```

This uses the **Reset password** template, which points at the same `/account/password/` page with the same `type=email`. The same code, the same page, nothing new built. On submit it becomes `/account/check-email/`.

It is deliberately **not** built on `signInWithOtp({shouldCreateUser:false})`, which answers "Signups not allowed for otp" for unknown addresses and leaks account existence (open bug supabase/auth #1955).

### 1.7 A wrong or expired link

`POST /auth/v1/verify` answers `403` with code `otp_expired`. The page does **not** show a toast. It renders a real state at the same height: same band, chip *Link expired*, headline *That link has **expired.*** One line: *Links work for one hour, and once only.* One 52px button **Send me a new one**, with the email field pre‑filled from `sessionStorage` if it is known, otherwise shown empty. Pressing it is the ordinary `/api/auth/link` call, with the same 60‑second countdown.

The same state serves the "no token found" case, worded identically — a reader cannot tell the difference and does not need to.

### 1.8 Signing out

The **Sign out** control lives in its own room on `/account/`, never in the header.

**`POST /api/auth/sign-out`** → `POST {SUPABASE_URL}/auth/v1/logout?scope=local` with `apikey` and the bearer token. `scope=local` is passed **explicitly**: the default is `global` and would sign the person out of every device they own, which is not what a "Sign out" link means.

The route deletes `ww_at`, `ww_rt` and `ww_in` **unconditionally**, whether or not Supabase answered — the session is gone from this browser either way — using the same `path` each cookie was set with, or the delete silently does nothing.

### 1.9 An already‑registered address in the sign‑up box

Nothing special happens and nothing is revealed. `POST /auth/v1/otp` sends the **Magic link** template instead of **Confirm sign up**; both point at `/account/password/`; the site says *Check your email* either way. The person lands on the password page and chooses a new password, which is a correct outcome for someone who has forgotten theirs and used the wrong door.

We never expose any endpoint that answers "does this address have an account".

### 1.10 An unconfigured site (no keys yet)

**Nothing may look broken.** Three layers:

1. **Build time.** `isAuthConfigured(readEnv())` is false, so no account affordance is rendered anywhere: `/me/`'s panel keeps today's honest *Accounts are on the way* copy, the footer and header are unchanged, and no link to `/account/` exists on any page. This mirrors `EmailCapture.astro`, which returns `null` when email is unconfigured.
2. **The pages still exist** (they are always built, so the build never depends on env) and are `noindex` and out of the sitemap. Reached directly, each renders its band and, in place of the form, one line: *Accounts are not switched on yet.* No error styling, no stack, no process talk.
3. **Runtime.** Every `/api/auth/*` and `/api/results/*` route answers `503 { ok:false, error:"Accounts are not switched on yet." }` **before making any outbound call**, exactly as `api/subscribe.ts:18` does today. A test asserts that zero `fetch` calls happen in this state.

`AUTH_PREVIEW=1` in `site/.env` selects a fake GoTrue that never touches the network and prints the would‑be link to the server log — the auth counterpart of `EMAIL_PREVIEW=1`, so a local run can never send real mail against the real project.

### 1.11 Google, later

Nothing is done now and nothing blocks it. Automatic identity linking already covers our case: every account here reaches a password *through an email link*, so the email is confirmed by construction, which is the precondition for `LinkAccount` rather than a second, forked account. The one rule to keep: **never create users with unconfirmed emails through any admin path** — this design has no admin path at all.

When the time comes: a Web OAuth client in Google Cloud (origin `https://wiserwalk.com`, redirect URI `https://<ref>.supabase.co/auth/v1/callback`), the client id and secret into Supabase's Google provider, `https://wiserwalk.com/**` added to the redirect allow list, and a new route `/api/auth/google/start` that 302s the browser to `GET /auth/v1/authorize?provider=google&redirect_to=https://wiserwalk.com/account/adopt/`, with `/account/adopt/` reading the returned tokens from the fragment and POSTing them to a small `/api/auth/adopt` route that sets the cookies. The layout slot is already built.

---

## 2. ROUTES AND FILES

### New pages (all static, `noindex={true}`, excluded from the sitemap)

| file | one line |
|---|---|
| `site/src/pages/account/index.astro` | `/account/` — signed in: settings rooms (email, when made, results held, change password, sign out, delete). Signed out: the two doors. |
| `site/src/pages/account/sign-up.astro` | The email‑only box, the marketing tick, the three reason rooms. |
| `site/src/pages/account/check-email.astro` | "Check your email", the address printed back, the 60s resend. |
| `site/src/pages/account/password.astro` | The emailed link lands here. Three token readers, the one password field, the expired state. |
| `site/src/pages/account/sign-in.astro` | Email + password, forgot pill, the empty Google slot. |
| `site/src/pages/account/forgot.astro` | One field, reusing the sign‑up layout component. |

### New API routes (all `prerender = false`)

| file | one line |
|---|---|
| `site/src/pages/api/auth/link.ts` | POST `{email, mode:'new'\|'reset', marketing, website}` → `/auth/v1/otp` or `/auth/v1/recover`. |
| `site/src/pages/api/auth/set-password.ts` | POST → `/auth/v1/verify` then `PUT /auth/v1/user`, sets cookies, stamps the profile, subscribes to Brevo. |
| `site/src/pages/api/auth/sign-in.ts` | POST `{email,password}` → `/auth/v1/token?grant_type=password`, sets cookies. |
| `site/src/pages/api/auth/sign-out.ts` | POST → `/auth/v1/logout?scope=local`, clears cookies unconditionally. |
| `site/src/pages/api/auth/refresh.ts` | POST → `/auth/v1/token?grant_type=refresh_token`, rotates cookies; on failure clears them and answers 401. |
| `site/src/pages/api/auth/me.ts` | GET → `{signedIn, email?, since?, passwordSet?}`. `no-store`. |
| `site/src/pages/api/auth/delete.ts` | POST → `rpc/delete_me`, then clears cookies. Confirmed twice in the UI. |
| `site/src/pages/api/results/list.ts` | GET → the account's `{quiz,code,at}` rows, newest first. |
| `site/src/pages/api/results/add.ts` | POST `{entries:[…]}` → validate, dedupe by `SAME_RUN_MS`, upsert; answers `{stored, skipped, rejected}`. |
| `site/src/pages/api/results/remove.ts` | POST `{quiz,code,at?}` or `{all:true}` → delete. Server first, always. |
| `site/src/pages/api/games/stat.ts` | GET → the account's game values. POST `{key,value}` → merge by that key's rule. |
| `site/src/pages/api/cron/ping.ts` | GET → one anonymous read of `heartbeat`, so a Free project is not paused. Returns 204 always. |

### New lib modules

| file | one line |
|---|---|
| `site/src/lib/auth/config.ts` | `readEnv`‑based `supabaseUrl()`, `publishableKey()`, `isAuthConfigured(env)` — the `provider.ts` `isConfigured` pattern. |
| `site/src/lib/auth/gotrue.ts` | Every `/auth/v1/*` call as plain `fetch` with an 8s `AbortController` deadline, copied from `provider.ts`'s `postJson`. Never throws. |
| `site/src/lib/auth/rest.ts` | Every `/rest/v1/*` and `/rest/v1/rpc/*` call with the user's bearer token, same deadline. |
| `site/src/lib/auth/session.ts` | Cookie names, `setSession()`, `clearSession()`, and `withSession(ctx)` — the access‑then‑refresh‑then‑retry‑once helper. |
| `site/src/lib/auth/guard.ts` | `json()`, `sameOrigin()`, `honeypot()`, `limit()` (in‑memory per‑IP), `method405()`. Every route opens with these. |
| `site/src/lib/auth/messages.ts` | One map from Supabase error code to a plain sentence in the site's voice. The only place error copy lives. |
| `site/src/lib/sync/merge.ts` | **Pure.** Shelf union with the `SAME_RUN_MS` rule, and the per‑key game merge rules. Imported by both the browser and the routes. |
| `site/src/lib/sync/client.ts` | Browser side: `pushShelf()`, `pullShelf()`, `mergeOnSignIn()`, the offline queue, `isSignedInHint()`. |
| `site/src/lib/auth/README.md` | The owner's numbered steps, in the house style of `src/lib/email/README.md`. |
| `site/src/styles/pages/account.css` | The account pages' stylesheet, in the pattern of `pages/me.css`. |

### New tests and config

| file | one line |
|---|---|
| `site/scripts/auth-test.mjs` | Stubbed‑fetch harness in the exact style of `email-test.mjs`. Wired into **both** `prebuild` and `test`. |
| `site/vercel.json` | `$schema` + one daily cron at `/api/cron/ping`. Must live at `site/vercel.json`, the Vercel root, not the repo root. |

### Existing files changed

| file | change |
|---|---|
| `site/src/layouts/Base.astro` | (a) a pre‑paint `is:inline` line beside the theme script setting `data-signedin` from the `ww_in` cookie; (b) a 6‑line fragment catcher that forwards any page carrying `#access_token=` or `#token_hash=` to `/account/password/`; (c) the analytics `beforeSend` hook blanks `hash` on **every** event and `search` on `/account/`; (d) the footer newsletter button's label changes from `Sign up` to `Email me`, ending the word collision; (e) the `.nav-me` `aria-label` becomes "My results, signed in" when signed in. |
| `site/src/pages/me.astro` | Every line of device‑only copy listed in the brief; the `.me-keep` panel's three states at one height; the clear‑confirm wording; the sync call; pushing/pulling the game keys. |
| `site/src/pages/q/[quiz].astro` | One line after `addResult(quiz.slug, code)`: a fire‑and‑forget `syncAdd(quiz.slug, code)`. Finishing a quiz never waits on a network call. |
| `site/src/pages/method.astro` | The "Your answers" section rewritten (§6.5). Mandatory, in the same commit. |
| `site/src/pages/about.astro` | The build comment at `:168-172` resolved; the mailing‑list line updated. |
| `site/src/lib/shelf.ts` | Docstring only: the `nothing is sent` line gains "…this file still sends nothing; `lib/sync/client.ts` is where an account copy is made." No behaviour changes. |
| `site/src/lib/email/provider.ts` | `Subscription` gains `source?: string`; `attributesFor` emits `SOURCE`. Nothing else. |
| `site/src/lib/email/README.md` | Gains the missing sender + domain‑authentication steps and the corrected API‑key path; links to the new auth README. |
| `site/src/lib/icons.ts` + `site/src/components/Icon.astro` | One new mark, `key`, drawn on the 24 grid at `stroke-width="1.6"`. |
| `site/src/styles/touch.css` | `.acc-go` added to the hard‑coded list of classes that become 44px pills below 46rem, or it renders as bare text on a phone. |
| `site/astro.config.mjs` | The sitemap filter also excludes `/account/`. |
| `site/package.json` | `auth-test.mjs` appended to **`prebuild` and `test`**. In `test` alone it would never gate a Vercel deploy. |
| `site/public/img/CREDITS.md` | The one new photograph used across the four account pages. |

**One new picture.** `hero-dawn.jpg` is in the footer of every page and may never be a band's picture; `sky-rays.jpg` belongs to `/me/`; `support-hand.jpg` is the asking picture and re‑using it dilutes `/support/`. The account flow gets a single new dawn landscape (Unsplash, ≤1600px, ~q78, under 250KB, credited) shared by sign‑up, check‑email, password and sign‑in, so the four read as one movement. `/account/` settings uses `Hero kind="night"` instead — it is back‑of‑house, not a doorway.

---

## 3. SESSION MODEL

### Where tokens live

Three cookies, all set only by our routes, all with every attribute written explicitly — `AstroCookies.set()` in 5.18.2 adds **no defaults whatsoever**, so a cookie set without `path` is scoped to `/api/auth/` and never reaches anything else.

| cookie | contents | httpOnly | path | maxAge | why |
|---|---|---|---|---|---|
| `ww_at` | Supabase access token (opaque to us) | **yes** | `/api/` | `expires_in - 60` ≈ 3540s | Only `/api/*` ever needs it, so static HTML and `_astro/*` asset requests carry no auth header at all. |
| `ww_rt` | Supabase refresh token | **yes** | `/api/` | 30 days | Our chosen session length. Supabase Free has no session time‑box, so this cookie *is* the session length, changeable in one constant. |
| `ww_in` | the literal `1` | **no** | `/` | 30 days | The header hint. Carries nothing about the person — not the address, not an id. |

All three: `secure: import.meta.env.PROD`, `sameSite: 'lax'`.

`sameSite: 'strict'` is wrong here — it would break the top‑level return from the emailed link. `'lax'` keeps the cookie on that return and sends nothing on a cross‑site POST, which is half the CSRF story by itself.

**The access token's own expiry is never parsed.** Its cookie simply outlives it by −60 seconds, so "the cookie is gone" *is* "refresh needed". Our server never decodes, verifies or inspects a JWT; it forwards an opaque string and lets Supabase decide. That is one fewer thing in the codebase that can be subtly wrong.

### Refresh

`withSession(ctx)` in `lib/auth/session.ts`:

1. `ww_at` present → make the call with it.
2. `ww_at` absent, or Supabase answered 401 → read `ww_rt`, `POST /auth/v1/token?grant_type=refresh_token`, write the new `ww_at`/`ww_rt`/`ww_in`, **retry the original call once**.
3. Refresh failed → `clearSession()`, answer `401 { signedIn: false }`.

Two tabs racing a refresh is safe in practice: Supabase's `refresh_token_reuse_interval` is 10 seconds and returns the *same* new session for a reuse inside it. Beyond 10 seconds a genuine double‑refresh is read as token theft and the session dies — the person sees a sign‑in page, which is the correct and recoverable outcome. No single‑flight lock is attempted across function instances; pretending to have one would be worse than not having one.

### Sign‑out

`clearSession()` deletes all three with **the same paths** they were set with. Called unconditionally by `/api/auth/sign-out`, and also by any route that discovers the session is dead — which is what keeps the `ww_in` hint from going stale for long.

### CSRF

Three layers, because Astro's own protection does not cover us:

1. **`security.checkOrigin` stays at its default `true`.** Verified behaviour in 5.18.2: it 403s a cross‑origin form‑like POST and a POST with no content‑type, and **lets `application/json` through regardless of Origin**. It therefore protects only the no‑JS form path.
2. **Our own check, in `guard.ts`, on every state‑changing route:** `request.headers.get('origin') === url.origin`, with a missing `Origin` treated as a failure. Browsers always send `Origin` on POST.
3. **`sameSite: 'lax'`** means a cross‑site POST carries no cookie at all, so even a bypass of (2) is unauthenticated.

And a rule that makes the remaining Lax gap harmless: **no route changes state on GET.** `/api/auth/me`, `/api/results/list` and `/api/games/stat` (GET) are reads; everything else is POST. A cross‑site top‑level GET can therefore do nothing but read, and CORS stops the attacker's page reading the body.

### XSS posture — stated honestly

httpOnly means an injected script cannot read the token and cannot walk a 30‑day refresh token out of the building. It does **not** make XSS harmless: a script on our origin can still call `/api/results/remove` with the cookies attached. The real defence is that this site ships no third‑party JavaScript at all — the head preconnects to Google Fonts for a stylesheet, and Vercel Analytics is the only script from elsewhere — and that adding a dependency is a deliberate act.

A Content‑Security‑Policy header in `site/vercel.json` is the obvious next step and is **not** proposed for day one: the site is built on `is:inline` scripts and a CSP would need per‑script hashes maintained by hand. Recommended as a follow‑up with `'unsafe-inline'` removed properly, not bolted on now.

### How the static header learns

One line added to the existing pre‑first‑paint `is:inline` block in `Base.astro`, beside the theme line:

```js
try { if (/(?:^|;\s*)ww_in=1(?:;|$)/.test(document.cookie))
        document.documentElement.dataset.signedin = '1'; } catch (e) {}
```

Zero network. No flash. Works on a page served straight from the CDN. Nothing about the static pages changes — no page becomes on‑demand, no `Vary: Cookie` is introduced, and the filesystem handler still runs before any function.

**The header mark obeys the state‑mark rule.** The existing `.nav-me-dot` is one shape, one size, one gap, one ink, and it now carries **one** fact at a time: signed in, it means *your account*; signed out, it means *something is saved on this device*. It is never two facts encoded by an inset ring against an outset ring. No nav item is added — `kit.css:86-94` records that the current items only just fit between 30rem and 34rem, and a seventh would push the row to a sideways scroll.

`/me/` invalidates the hint the same way it already invalidates `has-saved` at `me.astro:270`.

---

## 4. DATA MODEL

One block, pasted once into the SQL Editor. **No service‑role key is used anywhere in this design**, so everything a privileged operation needs is a `security definer` function granted narrowly to `authenticated`.

```sql
-- ─────────────────────────────────────────────── 1. profiles
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),
  password_set_at     timestamptz,
  marketing_opt_in    boolean not null default false,
  marketing_synced_at timestamptz
);
alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
-- No insert/update/delete policy at all. The row is made by the trigger below and
-- changed only by the two functions below, so nobody can stamp their own flags.

create function public.on_auth_user_created() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.on_auth_user_created();

create function public.mark_password_set() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set password_set_at = now() where id = (select auth.uid());
$$;
revoke all on function public.mark_password_set() from public, anon;
grant execute on function public.mark_password_set() to authenticated;

create function public.set_marketing_opt_in(wants boolean) returns void
language sql security definer set search_path = '' as $$
  update public.profiles
     set marketing_opt_in    = wants,
         marketing_synced_at = case when wants then now() else marketing_synced_at end
   where id = (select auth.uid());
$$;
revoke all on function public.set_marketing_opt_in(boolean) from public, anon;
grant execute on function public.set_marketing_opt_in(boolean) to authenticated;

-- ─────────────────────────────────────────────── 2. results
-- The same three fields the device already keeps: {quiz, code, at}. Nothing else
-- is needed, because the result code carries the scores.
create table public.results (
  user_id uuid        not null references auth.users(id) on delete cascade,
  quiz    text        not null check (char_length(quiz) between 1 and 64),
  code    text        not null check (char_length(code) between 1 and 64),
  at      timestamptz not null,
  primary key (user_id, quiz, code, at)
);
create index results_user_at_idx on public.results (user_id, at desc);
alter table public.results enable row level security;

create policy "results: read own"   on public.results
  for select to authenticated using      ((select auth.uid()) = user_id);
create policy "results: insert own" on public.results
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "results: delete own" on public.results
  for delete to authenticated using      ((select auth.uid()) = user_id);
-- No update policy: a finished result is a fact with a date on it. It is added
-- or removed, never edited.

-- ─────────────────────────────────────────────── 3. game stats
create table public.game_stats (
  user_id uuid        not null references auth.users(id) on delete cascade,
  key     text        not null check (key ~ '^[a-z]{2,8}\.[a-z]{3,10}$'),
  value   jsonb       not null,
  at      timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.game_stats enable row level security;

create policy "game stats: read own"   on public.game_stats
  for select to authenticated using      ((select auth.uid()) = user_id);
create policy "game stats: insert own" on public.game_stats
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "game stats: update own" on public.game_stats
  for update to authenticated using      ((select auth.uid()) = user_id)
                               with check ((select auth.uid()) = user_id);
create policy "game stats: delete own" on public.game_stats
  for delete to authenticated using      ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────── 4. heartbeat
-- One row with nothing in it, so the daily ping has something harmless to read
-- and a Free project is not paused for inactivity.
create table public.heartbeat (id int primary key, at timestamptz not null default now());
insert into public.heartbeat (id) values (1) on conflict do nothing;
alter table public.heartbeat enable row level security;
create policy "heartbeat: anyone may read" on public.heartbeat
  for select to anon, authenticated using (true);

-- ─────────────────────────────────────────────── 5. deleting an account
-- Without a service-role key this is the only way to honour "delete my account".
-- The cascade above clears profiles, results and game_stats with it.
create function public.delete_me() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
```

**Notes that matter.**

- Every policy names `to authenticated` and wraps the call as `(select auth.uid())`. Omitting the `to` clause makes the policy run for anonymous visitors too; a bare `auth.uid()` runs once per row.
- Only `auth.users`' **primary key** is ever foreign‑keyed. Other auth‑schema objects may change at any time.
- `results` has a four‑part key rather than `(user_id, quiz, code)` deliberately: the same answer sheet taken twice, weeks apart, is two facts, and collapsing them would silently lose history the owner believes he is keeping. The 60‑second same‑run rule is applied in our route instead, from the *same constant* the device uses (`SAME_RUN_MS` in `shelf.ts`).
- `code` is validated against the registry on write (it must decode for a registered quiz) and **never filtered on read**. If a quiz's item count ever changes and old codes stop decoding, the rows are still there to migrate; `/me/` simply stops displaying them, exactly as it does today via `isReadable()`.
- `delete_me()` writes to the auth schema, which Supabase discourages. It is the price of having no secret key. It must be tested against a real project before it is trusted; the alternative is `SUPABASE_SECRET_KEY` in Vercel and `auth.admin.deleteUser`, and I would rather the owner hold one fewer credential.

**Nothing here blocks a cross‑quiz profile.** The profile is a *query* over `results` joined to the registry — `count(distinct quiz)`, the newest per quiz, first and last activity. It needs no schema change, and `results_user_at_idx` already serves it.

---

## 5. SYNC

### The governing property

**The account is a mirror, never the source of truth for rendering.** `/me/` paints from `localStorage` first — instantly, exactly as it does today — and only then merges what the account returns. Every failure mode (Supabase paused, Supabase down, keys unset, offline, script blocked) collapses to *the page the site already ships*. Nothing spins, nothing is empty, nothing apologises.

### First sign‑in merge

Fired once on the success of `/api/auth/set-password` or `/api/auth/sign-in`, by `mergeOnSignIn()`:

1. Read the device shelf with `listResults()`.
2. `POST /api/results/add { entries }`. The route validates each entry (shape, quiz in the registry, code decodes), reads the account's existing rows for the affected `(quiz, code)` pairs, and **drops any incoming entry whose `at` is within `SAME_RUN_MS` of an existing row** — the device's own rule, applied server‑side, from the same module. Then one upsert:
   ```
   POST /rest/v1/results?on_conflict=user_id,quiz,code,at
   apikey: <publishable>          Authorization: Bearer <access token>
   Prefer: resolution=ignore-duplicates,return=minimal
   ```
   `ignore-duplicates` becomes `ON CONFLICT DO NOTHING`, which is an insert and needs no update policy. It answers `{stored, skipped, rejected}`.
3. `GET /api/results/list` → the account's rows.
4. `mergeShelf(device, account)` in `lib/sync/merge.ts` — pure, tested headlessly — unions both lists by `(quiz, code, at)` with the 60‑second tolerance, sorts newest first, and writes the device copy back through `saveShelf()`, capped at `SHELF_CAP` (200). **The server keeps everything; the device keeps the newest 200.** That is exactly the point of the account.
5. Games: `/me/` reads `sls.best`, `sls.fooled`, `sls.canon`, `wsi.best`, `wsi.mix` from `localStorage`, POSTs each to `/api/games/stat`, and writes the merged values back.

**`sls.seen` and `wsi.seen` are deliberately not synced.** They are a per‑device novelty budget, not an achievement, and both games *empty* them once under 30% of the pool is unseen. Unioning them across devices would make the site feel more repetitive, which is the opposite of what the owner wants. Stated as a decision, not an omission.

Merge rules, one table, in `lib/sync/merge.ts`:

| key | rule |
|---|---|
| `sls.best`, `wsi.best` | `max(device, account)` |
| `sls.fooled`, `wsi.mix` | per inner key, `max` — not sum, because a re‑sync would inflate a sum |
| `sls.canon` | last write wins, by the row's `at` |
| `sls.seen`, `wsi.seen` | not synced |

### Afterwards, both directions

- **Finishing a quiz while signed in.** `q/[quiz].astro` calls `addResult()` exactly as today — the save is instant and local — then one fire‑and‑forget `syncAdd()`. Finishing never waits on a network call, and the reader reaches the result page at the same speed whether they have an account or not.
- **Opening `/me/`.** Paint from the device. If `ww_in` is present, `GET /api/results/list` in the background and repaint on arrival. A 401 quietly clears `ww_in` and the page stays as it is. A 503, a 540 or a dead network changes nothing except, when the hint says signed in, one quiet line: *Could not reach your account just now. These are the results saved on this device.*
- **Rejections.** If `/api/results/add` reports `rejected > 0`, `/me/` prints one line and no more: *N older results could not be saved to your account.* Silence would be worse; a paragraph about why would be inside baseball.

### Removing one result, and clearing the lot

`removeResult()` is exported, tested, and has **no caller on the site today** — this design gives it its first one, so it must be exercised in a browser before it ships.

**When signed in, the server goes first.** Always.

- Remove one: `POST /api/results/remove {quiz, code, at}`. On success, `removeResult()` locally. **On failure, nothing is removed anywhere** and the page says *Could not reach your account. Nothing was removed.* The alternative — remove locally, fail on the server — means the next pull silently resurrects it, which is worse than not removing it.
- Clear the lot: the confirm wording changes to *Clear every result saved to your account and on this device? The links themselves still work if you have them.* Then `POST /api/results/remove {all:true}`, then `clearShelf()`, then the header mark is updated.
- Signed out, both behave exactly as today.

### Conflicts, duplicates, offline

- **The only conflict rule is time.** Two entries are the same finish if the quiz, the code and the `at` agree to within `SAME_RUN_MS`. There is no "last writer wins" anywhere, because results are append‑only facts; only a *deletion* is a change of mind, and deletions go through the server first.
- **Duplicates across devices.** The phone and the laptop producing the same result minutes apart are genuinely two finishes and both are kept. The same result re‑uploaded by a second sync is one finish and is skipped.
- **Offline.** Only `add` operations queue, in `localStorage['ww.sync.q.v1']`, capped at 50 and flushed on the next successful API call and on the `online` event. `remove` and `clear` **never queue** — they require the server to confirm, and a queued deletion is a promise the site might not keep.
- **Storage blocked entirely.** Everything degrades to today's behaviour: `browserStore()` returns `null`, every shelf call is a no‑op that never throws, and an account still works — the account simply becomes the only copy, fetched on each `/me/` load.

---

## 6. EMAILS

### 6.1 Who sends

**Supabase sends, through Brevo's SMTP relay.** Not our server, and not Brevo's API.

The alternative is real and I considered it: `POST /auth/v1/admin/generate_link` would let our route build the link and hand it to `api.brevo.com/v3/smtp/email`, putting the copy in git where the stubbed‑fetch harness could test it and removing three dashboard steps from the owner's list. I rejected it because it requires `SUPABASE_SECRET_KEY` in a Vercel function — and Lens A's whole claim is that no privileged credential sits anywhere it need not. Trading that for nicer email copy is a bad trade for an owner who cannot debug auth. Two supporting reasons: `generate_link` with `type: 'magiclink'` has a reported failure to create missing users (supabase/supabase #22521), and whether it honours the per‑address cooldown is unverified.

The **built‑in Supabase email sender cannot be used at all** — it delivers only to addresses of people on the Supabase organisation and caps at 2 per hour. Brevo SMTP is therefore step one of the owner's list, not an optimisation.

### 6.2 The exact link

One line, pasted **identically** into three templates — **Confirm sign up**, **Magic link**, and **Reset password**:

```html
<a href="{{ .SiteURL }}/account/password/#token_hash={{ .TokenHash }}&type=email">Set your password</a>
```

- `{{ .SiteURL }}` rather than `{{ .RedirectTo }}`, so the path is hard‑coded in the template and cannot silently fall back to the home page because a redirect allow‑list entry was missed. The Site URL must be entered **without a trailing slash**.
- The **fragment**, not the query string. Fragments never reach a server, so the token stays out of Vercel access logs, out of the `Referer` header and out of analytics. Supabase's own troubleshooting page names this as the anti‑prefetch mitigation.
- `type=email` for all three, because `/verify` with that type searches `confirmation_token` and then `recovery_token`.
- Paste in the template editor's **source/code view**, not the visual one, so the `&` is not re‑escaped.

### 6.3 The wording

Same body in all three templates. Subject: **Set your password** — true for a new account, for an existing one asking again, and for a reset.

> Hello,
>
> Here is your link to set a password for Wiser Walk.
>
> **[ Set your password ]**
>
> It works for one hour, and once only. If you asked more than once, use the newest email.
>
> If the button does not work, go to wiserwalk.com/account/ and ask for a new link.
>
> If you did not ask for this, you can ignore it. Nobody can get into your account without this link.
>
> Wiser Walk

No church vocabulary, no "faith", no "magic link", no em dashes, no emoji, no process talk. The fallback line is a **bare, token‑free address** so it is safe to type and always works — which matters, because the button's real URL will be a Brevo redirector that looks nothing like our site.

### 6.4 Link tracking

**It cannot be switched off.** Brevo rewrites every link in every transactional email through its own redirector on every plan we will have; disabling it is Enterprise‑only and on request, and the feature request has run since 2023 with no fix. What this design does about it:

1. **The token survives a prefetch by construction.** The link lands on a static page that makes no call on load. A scanner GET costs nothing.
2. **Reduce what Brevo learns:** *Settings → Automations → Transactional emails → Tracking → Anonymous email tracking = **Yes***. This unlinks opens and clicks from the contact. It does not stop the rewrite; nothing does.
3. **A dedicated sender.** All account mail goes from `account@wiserwalk.com`, and marketing from a different address. Brevo forces a `List-Unsubscribe` header onto transactional mail, so Gmail will show an Unsubscribe button beside a password email — but transactional blocklisting is **per sender**, so an unsubscribe from the newsletter can never kill sign‑in emails, and vice versa.
4. **Copy that survives a phishing‑shaped URL** — the fallback line above.

**The flagged unknown, and the plan for it.** I could not verify whether Brevo's redirector preserves a URL **fragment**. If it strips it, the designed link is dead on arrival. This is the design's single biggest unverified dependency and it is discovered by the owner's very first real test (step 21). Three readers are built into `/account/password/` so the failure is contained:

- fragment `token_hash` — the designed path;
- fragment `access_token` + `refresh_token` — what arrives if a template was missed and `{{ .ConfirmationURL }}` survived;
- **query** `token_hash` — the fallback. If the fragment is eaten, change one character in the template (`#` → `?`) and nothing in the code changes. The token then does reach Vercel's logs, mitigated by `history.replaceState` on load, the analytics hook blanking `search` on `/account/`, and a one‑hour single‑use token.

If both fail, the escape hatch is `{{ .Token }}` — a six‑digit code typed into the page, scanner‑proof and tracker‑proof by construction, at the cost of one typing step. That is a template change plus one input field, not a redesign.

### 6.5 Getting onto the marketing list, honestly

**The tick is on the sign‑up form, unticked, and reads exactly:**

> ☐ Email me now and then when there is a new quiz, game or article. Every one has an unsubscribe link.

**The always‑true line beneath the button reads exactly:**

> We keep your email address, the results you finish and your best scores, so they follow you to any device. We will email you a link to set your password.

The address goes onto the list **only after the password is set**, so only proven addresses land there — using the code that already exists, `getProvider(env).subscribe({ email, source: 'account' })`, with one new Text attribute `SOURCE` (values `quiz-result`, `account`, `footer`). **An attribute, not a second list**: one field, works with `updateEnabled: true`, segmentable, and it does not fragment the list the owner wants to market to.

Double opt‑in is **not** used for account sign‑up. The person has just proved they own the address by clicking a link in it; a second confirmation email is friction the owner hates, and it would spend another of the 300 daily sends. The footer's marketing form keeps whatever DOI setting it has.

**Where I would expect the owner to push back:** an unticked box will cost him sign‑ups, and "ticked by default" is one line away. I do not recommend it. UK and EU marketing consent requires a positive act, a list built without one is the sort of thing that gets a Brevo account suspended (recovery is a support ticket), and he still gets a *confirmed* address for every account either way — product news about a new quiz is arguably not marketing at all. That is the argument to put to him in plain words; the decision is his.

### 6.6 `/method/` must change in the same commit

Today the page says *"Answers are never sent to a server, there is no account, and nothing about your result is stored on our side"* and *"if you fill in neither form, nothing leaves your browser at all."* Both become false the moment the first account route ships. The replacement, in the same voice:

> Every quiz is still scored in your browser, and your answers are never sent anywhere. What can now be saved is the **result** — the same short code that is already in the result link — and only if you make an account. Without one, a finished result is kept on your own device and nowhere else.

Plus a short new block naming what an account holds (address, a password we never see in plain text, result codes, best scores, dates) and the one button that deletes all of it.

---

## 7. ABUSE AND FAILURE

### The structural problem, named first

Supabase's per‑IP limits — 30 sign‑up/sign‑in calls per 5 minutes, 30 verifies per 5 minutes, 150 token calls per 5 minutes — count **our Vercel function's egress IP**, not the visitor's. Under Lens A they are therefore **site‑wide budgets**. One script hammering `/api/auth/sign-in` could exhaust the site's whole token budget and lock out every real person for five minutes. This does not happen under a browser‑talks‑to‑Supabase design, and it is the price of the lens.

So our routes must do the limiting that Supabase can no longer do for us:

### Our own limits

In `lib/auth/guard.ts`, a module‑level `Map<ip, {n, until}>` keyed on `ctx.clientAddress`, checked **before any outbound call**:

| route | budget |
|---|---|
| `/api/auth/link` | 3 per IP per 10 minutes; 1 per address per 60 seconds |
| `/api/auth/sign-in` | 8 per IP per 10 minutes |
| `/api/auth/set-password` | 6 per IP per 10 minutes |
| `/api/results/*`, `/api/games/stat` | 60 per IP per minute |
| `/api/cron/ping` | 4 per hour, total |

**Honest limits of this.** The map lives in one function instance. With the site's traffic there is usually one warm instance, so it works in practice; it resets on a cold start and fails open under scale‑out; and it does nothing against a distributed attacker. It raises the cost of casual abuse and no more. The documented upgrade, when it is needed, is a `security definer` RPC `hit_limit(bucket text, max int, window_seconds int) returns boolean` granted to `anon`, which survives cold starts at the cost of one Supabase round trip — but that round trip goes to the thing being protected, so it is a trade, not a win.

### Enumeration

- Sign‑up: `/otp` with `create_user: true` emails **every** address, new or existing. No leak.
- Reset: `/recover` is designed not to reveal existence (a residual leak is reported in supabase/auth #2702 and is outside our control).
- **`signInWithOtp({shouldCreateUser:false})` is never used** — it answers "Signups not allowed for otp" for unknown addresses and is an outright leak.
- Sign‑in failure is one generic sentence for both fields.
- No endpoint on this site answers "does this address have an account", and `/api/auth/me` returns nothing but the *current* caller's own state.

### Bots

The honeypot field `website` is already in use by `/api/subscribe` and is reused verbatim: filled ⇒ the same cheerful 200 a person gets, and **no outbound call at all**, so a bot learns nothing and burns none of the shared budget. **Never a CAPTCHA** — it is a standing site rule, and solving one is forbidden to me anyway. Supabase's hCaptcha/Turnstile support is available on Free and is held in reserve as an emergency lever, not shipped: it is one more thing to break.

Brevo suspends the transactional platform if an unprotected form on the account is hit by bot sign‑ups, and recovery is a support ticket. The honeypot plus the per‑IP limiter is the protection.

### A paused free project

The worst failure mode on this site. Free projects pause after ~7 days of low activity and a paused project answers **HTTP 540 to everything** — sign‑in, sign‑up and reset all die at once, including for people who already have accounts, and only the owner can resume it from the dashboard.

- `site/vercel.json` carries one daily cron (Hobby allows no more, ±59 minutes, UTC) at `/api/cron/ping`, which does one anonymous `GET /rest/v1/heartbeat?select=id&limit=1` and returns 204. **No `CRON_SECRET` is required**, because the endpoint reads nothing, returns nothing and is rate‑limited to 4 an hour — one fewer thing for the owner to paste.
- **Honest caveat:** Supabase's docs describe what counts as activity but never say whether automating it is allowed. It is not forbidden, and the Acceptable Use Policy reserves restriction for abuse; one tiny read a day is not plausibly abuse. Treat it as an undocumented common practice, not a guarantee, and tell him that Pro at $25/month is the only actual guarantee.
- **Degradation if it pauses anyway:** every account surface answers "could not reach your account", `/me/` is the page it is today, the quizzes and the games are completely unaffected, and the only broken thing is signing in — which the owner fixes with two clicks once he knows. The routes should map 540 to a distinct log line so the cause is obvious.

### Supabase down or slow

Every outbound call carries the same 8‑second `AbortController` deadline `provider.ts` already uses, and never throws — the caller gets a Response or `null`. A `null` becomes *That did not go through. Try again in a moment.* Because the deadline is ours and short, a hung Supabase never holds a request until Vercel kills it, which is the failure that tells the reader nothing at all.

### The 300/day Brevo cap

One pool shared by the marketing list, any campaign, and every account email. Past it, transactional mail enters a retry queue capped at 1,000 and anything beyond is simply not delivered — a person waiting for a link gets silence and the app has no signal.

- The 60‑second per‑address cooldown is enforced in our UI (a countdown with words, never a greyed ghost) *and* in our route *and* by Supabase, so three things have to fail before a duplicate send.
- Supabase imposes a fresh **30 emails/hour** cap once custom SMTP is on, in a *different* dashboard screen. Raising it is step 14 and must be done in the same sitting, or launch day throttles silently.
- `429 over_email_send_rate_limit` → *We just sent one. Check your inbox, or try again in a minute.* `429 over_request_rate_limit` → *Too many attempts. Try again in a few minutes.*
- There is a ceiling we cannot see from inside the app. The owner should watch Brevo's transactional log for the first week. 300/day is about 12/hour sustained.

### Error codes the UI must handle

`lib/auth/messages.ts`, the only place this copy lives:

| code | what the person reads |
|---|---|
| `otp_expired` (403) | *That link has expired.* + Send me a new one |
| `over_email_send_rate_limit` (429) | *We just sent one. Check your inbox, or try again in a minute.* |
| `over_request_rate_limit` (429) | *Too many attempts. Try again in a few minutes.* |
| `weak_password` (422) | *That password is too short. Use at least 8 characters.* |
| `same_password` (422) | *Pick a different password.* |
| `invalid_credentials` (400) | *That email and password do not match.* |
| `email_not_confirmed` (400) | *Check your email for the link we sent.* |
| `signup_disabled`, `otp_disabled`, `reauthentication_needed`, HTTP 540, anything unmapped | *That did not go through. Try again in a moment.* + logged with the raw code |

Never a raw Supabase message on screen. Never blame the reader for our misconfiguration.

---

## 8. THE OWNER'S SETUP STEPS

**Twenty‑one steps. Sixteen of them are in two dashboards.** They are ordered by wait time: step 1 sits in a human queue and step 6 can take up to 48 hours, so both are started before anything else. This list becomes `site/src/lib/auth/README.md`, in the house style of the email README.

**Brevo, so that email works at all**

1. In Brevo, **raise a support ticket from inside the account asking to activate transactional email sending.** Do this first — a brand‑new account can store contacts and still fail to send a single email, and this is the only step with a person on the other end.
2. **Settings → Senders, Domains, IPs → Domains → Add a domain** → `wiserwalk.com` → choose **"Authenticate the domain yourself"** (manual). *Never* the automatic option: it offers to replace the DMARC record we already have. Copy the Brevo code TXT value and the DKIM record(s) it shows.
3. **SiteGround DNS → ADD** the Brevo code TXT at the root (`@`). Its value contains a `:`; if the editor refuses it, say so rather than improvising.
4. **SiteGround DNS → ADD** Brevo's DKIM record — one TXT at `mail._domainkey`, or two CNAMEs at `brevo1._domainkey` / `brevo2._domainkey`, whichever the dashboard showed. It does not collide with SiteGround's existing `default._domainkey`; DKIM is selector‑scoped.
5. **SiteGround DNS → EDIT** the one existing `_dmarc` TXT record to add a `rua` tag, keeping `p=none`: `v=DMARC1; p=none; rua=mailto:dmarc@wiserwalk.com; aspf=r; adkim=r;`. **Do not add a second `_dmarc` record** — two of them break DMARC entirely. **Do not touch SPF or MX.** Brevo does not need SPF unless a dedicated IP is bought.
6. **Brevo → Domains → Authenticate this email domain.** Up to 48 hours to propagate.
7. **Settings → Senders, Domains, IPs → Senders → Add a sender:** name `Wiser Walk`, email `account@wiserwalk.com`. Account mail uses this address and nothing else uses it.
8. **Settings → SMTP & API → SMTP tab → Generate a new SMTP key.** Choose **Standard (64 characters)** and **no expiration** (inactive keys expire after 90 days). Copy the key *and* the **SMTP login** shown on that page — it is probably not your account email. **This is an SMTP key, not the API key**; the API key here fails with `535 Authentication failed`.
9. *Optional.* **Settings → Automations → Transactional emails → Tracking → Anonymous email tracking = Yes.**
10. *Optional.* **Contacts → Settings → Contact attributes → Add attribute** named exactly `SOURCE`, type **Text**. Without it Brevo silently ignores the field and the list still works.

**Supabase**

11. Create a Supabase account and a **new project**. Pick the London region. Save the database password somewhere safe. (Free allows 2 active projects across all organisations — check you are not already at the ceiling.)
12. **Settings → API Keys → "Publishable and secret API keys"** → copy the **Project URL** and the **publishable** key. **Do not copy the secret key**; this build never uses one.
13. **Authentication → Emails → SMTP Settings**: host `smtp-relay.brevo.com`, port `587`, username = the **SMTP login** from step 8, password = the **SMTP key** from step 8, sender email `account@wiserwalk.com`, sender name `Wiser Walk`. Save. *(Confirm the host in Brevo's own SMTP page; I could not verify it from an official page.)*
14. **Authentication → Rate Limits** → raise **Emails sent** from 30/hour to **100**/hour. Turning on custom SMTP imposes a fresh 30/hour cap in this separate screen, and missing it throttles a launch silently.
15. **Authentication → URL Configuration** → **Site URL** = `https://wiserwalk.com`, **with no trailing slash**. Save.
16. **Authentication → Sign In / Providers → Email** → set **minimum password length to 8** (the default is 6) and check **Confirm email** is **ON**.
17. **Authentication → Emails → Templates** → open **Confirm sign up**, **Magic link**, and **Reset password**, and in each one, in the **source/code view**, make the link exactly:
    ```html
    <a href="{{ .SiteURL }}/account/password/#token_hash={{ .TokenHash }}&type=email">Set your password</a>
    ```
    All **three** must be identical. One sign‑up box uses two of these templates depending on whether the address is new, and the third is the reset.
18. **SQL Editor → New query** → paste the whole block from §4 → **Run**. It should say "Success. No rows returned."

**Vercel**

19. **Project → Settings → Environment Variables** → add for **Production *and* Preview**: `SUPABASE_URL` (the Project URL) and `SUPABASE_PUBLISHABLE_KEY` (the publishable key). Set for Production only and every preview of the branch looks broken.
20. **Deployments → the latest → Redeploy.** Environment variables only apply to new deployments. Nothing changes until this happens — if you paste the keys and see no difference, this is why.
21. **Check it worked, in this order:** sign up at `wiserwalk.com/account/sign-up/` with a real address you can open; confirm the email arrives from `Wiser Walk <account@wiserwalk.com>`; click the link and confirm you land on *Choose a password* (not the home page); set a password; sign out; sign in with email and password. **Then do it again with a second, different address that already has an account**, which exercises the other template. If the link lands on the home page, step 17 was missed on that template. If the link lands on *That link has expired* straight away, tell me — that is the fragment question in §6.4 and the fix is one character in the template.

**The three most likely to go wrong,** in order: **step 17** (three templates, identical, in source view), **step 5** (editing rather than adding the DMARC record), and **step 13** (the SMTP key, not the API key, and the SMTP login, not the account email).

**An offer worth making him:** steps 13–17 can be collapsed into a single `PATCH /v1/projects/{ref}/config/auth` if he creates a Supabase personal access token and I run it — five dashboard steps become one paste. I have not made it the default because it means a credential passing through a chat window.

---

## 9. TEST PLAN

### Headless, with a stubbed `fetch` — `site/scripts/auth-test.mjs`

Built exactly like `email-test.mjs`: esbuild the TypeScript to `node_modules/.auth-test.mjs`, import it, drive it against a `stub(handler)` that records `{url, init, body}`, restore `realFetch`, `rmSync` the bundle, `process.exit(failures ? 1 : 0)`. **Nothing touches the network and no test uses a real key.** Wired into **both** `prebuild` and `test` — `email-test.mjs` is in `test` only and therefore never gates a Vercel deploy.

Sections:

1. **Request shapes.** For `/otp`, `/recover`, `/verify`, `/token?grant_type=password`, `/token?grant_type=refresh_token`, `/logout?scope=local` and `PUT /user`: the exact URL, method, the `apikey` header, the `Authorization` header where one belongs, and the body field by field. Plus the negative: **the key never appears in a URL or a body**, and `scope=local` is present on every logout.
2. **Cookies.** Every `Set-Cookie` parsed and asserted: `path`, `httpOnly`, `secure`, `sameSite=Lax`, `maxAge`. Specifically that `ww_at`'s maxAge is `expires_in - 60`, that `ww_in` is **not** httpOnly and holds only `1`, and that sign‑out deletes all three **with the same paths**.
3. **Unconfigured.** With no `SUPABASE_URL`, every route answers 503 and **zero fetch calls are recorded**. The strongest single test in the file.
4. **Origin.** A POST with a foreign `Origin`, and one with none, each answer 403 with **zero fetch calls**.
5. **Honeypot.** `website` filled answers 200 with **zero fetch calls**.
6. **Error mapping.** Feed each documented code — `otp_expired`, `over_email_send_rate_limit`, `over_request_rate_limit`, `weak_password`, `same_password`, `invalid_credentials`, HTTP 540, and an unmapped code — and assert the exact sentence, and that no raw Supabase message reaches the response.
7. **The dangerous sequence.** `verify` succeeds, `PUT /user` fails: assert the route does **not** call `verify` again, **does** set the cookies, and returns `signedIn: true` with a 422.
8. **Refresh.** `ww_at` absent → refresh is called once, the original call is retried once, new cookies are written. Refresh 401 → all three cookies cleared, answer 401, original call **not** retried a second time.
9. **Merge rules** (`lib/sync/merge.ts`, bundled separately in its own section, the way `engine-test.mjs:1442` bundles `shelf.ts`): device‑only, server‑only, both, the `SAME_RUN_MS` boundary at 59,999 and 60,001 ms, `SHELF_CAP` truncation on the device but not on the server, and the four game rules.
10. **Validation.** A junk quiz slug, a code that does not decode, an oversized field, a `game_stats` key outside the allow‑list — each rejected before any outbound call, each counted in `rejected`.
11. **A store that throws on every method** is a no‑op and never an error, matching `engine-test.mjs:1542`.
12. **Timeouts.** A handler that never resolves aborts at the deadline and returns the retryable message rather than hanging.

Plus the existing suites: `engine-test.mjs` and `audit/selftest.js` must both still pass, unchanged.

### Only against a real project

- **That an email arrives at all**, from the right sender, past the spam folder — the whole of steps 1–13 is unverifiable from here.
- **Whether Brevo's redirector preserves the URL fragment.** The design's biggest unknown, answered by one real click in step 21.
- **That all three templates were pasted correctly** — two live sign‑ups, one brand‑new address and one existing, to exercise both paths.
- SMTP credentials, the real 60‑second cooldown, and the real code on a 429.
- **Whether `PUT /user {password}` revokes the person's other sessions** while keeping the current one. The sessions docs list password change as a termination trigger without saying whether the initiating session survives. Untested, this could sign someone out of the browser they are standing in. Test it before launch.
- **Whether the daily ping actually prevents a pause.** Only a week of silence proves it.
- **`delete_me()`** against a real `auth.users` cascade.
- Google linking, when it is added.

Locally, `AUTH_PREVIEW=1` in `site/.env` runs a fake GoTrue that prints the link to the server log and never reaches the network — so the first local run cannot send real mail against the real project.

---

## 10. WEAKNESSES, CANDIDLY

**1. The IP‑collapse problem is the real cost, and it is not small.** Proxying every call through one Vercel function turns Supabase's per‑IP rate limits into one shared, site‑wide bucket. A single script can exhaust the sign‑in budget for everyone. My in‑memory limiter raises the cost of casual abuse and is honestly weak: it lives in one function instance, resets on a cold start, and does nothing against a distributed attacker. No amount of care inside Lens A fixes this; only letting the browser talk to Supabase does.

**2. We own the session, and the owner cannot debug it.** Refresh rotation, the 10‑second reuse window, clock skew, cookie paths, cross‑tab races — `supabase-js` has solved all of these against real traffic and I have written them fresh. If one is subtly wrong the symptom is "it randomly signs me out", which is the hardest class of bug for a non‑expert to report and the easiest for me to dismiss.

**3. Twelve API routes, each of which must remember the origin check, the limiter, `no-store` and the 405.** A forgotten check on one route is a real bug class. `guard.ts` mitigates it; discipline is not a mechanism.

**4. No cross‑tab propagation.** Signing out in one tab leaves the other tab's header saying "signed in" until its next API call. `supabase-js`'s `onAuthStateChange` would handle this for free. A `storage` event on a non‑secret key is the cheap fix and I have not specced it.

**5. The lens's headline claim is not quite absolute.** *Session* tokens never touch JavaScript. The **one‑time link token does** — it arrives in a fragment, which is browser‑only by definition, and the page holds it in a variable long enough to POST it. It is single‑use, one‑hour, stripped from the URL on load, and never in a log; but the claim should be stated precisely rather than sold as more than it is.

**6. Extra latency and invocations.** Every authed action is browser → our function → Supabase → back. Two hops instead of one, and a Vercel invocation for each. Far inside Hobby's million, but it is real and it is slower on a phone on mobile data.

**7. The games sync only when `/me/` is opened.** A player who never visits `/me/` never gets their best score onto their account. I chose this deliberately to avoid touching the generated‑but‑committed `site/src/games/*.html` in the first commit, and it is a real gap that needs a second phase editing `demos/<game>/game.src.html` and rebuilding.

**8. We are exposed to GoTrue's wire format.** A response shape change that `supabase-js` would absorb in a version bump breaks us directly. Low probability, unbounded blast radius, no test can catch it from here.

**9. No Realtime, ever, without adding the library anyway.** If the cross‑quiz profile later wants live anything, the dependency arrives and this argument gets re‑fought.

**10. Twenty‑one manual steps is a lot for a man who "cannot debug auth himself."** I have cut what I honestly could — no `emailRedirectTo` to allow‑list, no secret key, no `CRON_SECRET`, no redirect‑URL step until Google — but the three‑template paste and the DNS edit remain, and either one, done wrong, produces a site that looks broken in a way he cannot diagnose.

### What I would steal from the other two lenses

**The single change I would make to my own design:** let the browser call Supabase **directly** for the three *unauthenticated* endpoints only — `/otp`, `/recover`, `/token?grant_type=password` — using the publishable key, and then POST the returned tokens once to a tiny `/api/auth/adopt` route that writes the httpOnly cookies and tells the browser to forget them. That restores per‑visitor IP rate limiting (weakness 1, the big one) while keeping every session token in an httpOnly cookie, keeping the secret‑key‑free stance, and keeping all sync through our routes. It costs one `PUBLIC_SUPABASE_*` pair and about 40 lines of hand‑written `fetch` in the browser — still no library. **If the judge takes one thing from this document, take that hybrid over pure Lens A.**

**From a `@supabase/ssr` or middleware lens:** a single `src/middleware.ts` doing `withSession` once, so a route physically cannot forget it. It costs nothing on static pages — `{"handle":"filesystem"}` runs first, so static HTML never invokes the function — and it turns weakness 3 from discipline into structure.

**From any lens with a real store:** the `security definer` `hit_limit()` RPC, so the rate limiter survives a cold start. One Supabase round trip, and it is the only version of the limiter I would actually trust.

**From a `supabase-js`-in-the-browser lens, for the set‑password page only:** its PKCE flow and its tested handling of the fragment, loaded with a dynamic `import()` inside the submit handler so the 56KB never reaches the 95% of visitors who will never sign in. That page is the highest‑risk surface in the flow and the one place a battle‑tested implementation is worth a dependency.