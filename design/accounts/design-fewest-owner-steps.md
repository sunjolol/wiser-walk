# Accounts on wiserwalk.com — design under Lens C, "the owner cannot get it wrong"

**The thesis of this lens in one line:** every setting the owner types into a dashboard is a place the site can break silently, so the design moves email copy, email templates, link format, SMTP configuration and the redirect allow list *out of dashboards and into the repository*, and adds a page that tells him in plain words which numbered step is still wrong.

**The two decisions that follow from it:**

1. **We send the emails.** Supabase's **Send Email auth hook** posts to `/api/auth/email`; our function renders the email and sends it through Brevo's transactional API. This deletes the SMTP screen (six fields), the three dashboard email templates that must be kept identical, and the redirect allow list — four of the five steps most likely to be done wrong — and replaces them with one URL and one secret. The email copy, the link format and the branch between "new address" and "you already have an account" become TypeScript under test.
2. **No cookies anywhere.** The session lives in `localStorage`, managed by `@supabase/supabase-js`, loaded lazily only on pages that need it. Static pages stay static and uncached-by-nothing; there is no CSRF surface because there are no credentials a cross-site request could carry; `/me/` still paints instantly from the device shelf before any network call.

Both are argued, with their costs, in §3 and §6, and attacked in §10.

---

## 1. THE FLOW

Throughout: `URL` is the page, `calls` is the network request the browser makes. The Supabase project ref is `<ref>`; `PUBLIC_SUPABASE_ANON_KEY` is the publishable key, safe in the browser.

### 1.1 First sign-up

**URL `/account/sign-up/`** (reached from `/me/`'s dark panel, from the result page's saved pill, and from the header mark when signed out).

The band picture, a chip reading `Your account`, the headline `Keep your results **for good.**`, two lines of lede, then **one email field and one 52px button inside the band**, above the fold at 390px. Under the band, three reasons in the `/support/` room shape. One small-print line, `.78rem`, `--ink-mute`:

> We will email you a link to set a password. After that you sign in with your email and that password. We will also send you a note now and then when a new quiz, game or article is made, and you can stop those at any time without losing your sign-in.

That line is the marketing disclosure, read *before* they type (§6.4).

On submit the page lazily imports the SDK and calls:

```js
const { error } = await supabase.auth.signInWithOtp({ email })   // shouldCreateUser defaults true
```
→ `POST https://<ref>.supabase.co/auth/v1/otp`, header `apikey: <publishable>`, body `{ "email": "...", "create_user": true }`.

**No `emailRedirectTo` is sent.** We never use `{{ .ConfirmationURL }}` or `{{ .SiteURL }}`; the hook hands us `token_hash` and we build the link ourselves. That is why the redirect allow list never needs configuring, and why a mis-typed allow-list entry cannot silently drop people on the home page.

Supabase then calls our hook (§6). The browser is redirected to:

**URL `/account/check-email/?to=<email>`** — the address is echoed back in DM Serif at ~1.15rem, because the commonest failure is a typo and showing it is the fix. Beside it a 44px pill, "Not that address?", back to the form. One dark panel says who the email is from (`Wiser Walk <account@wiserwalk.com>`), what the subject line is, to look in spam after a minute, and carries a **"Send it again" button disabled with words for 60 seconds** — `Send it again in 47s`, tabular-nums, never a greyed ghost. 60s because Supabase's per-address `max_frequency` is 60s and a resend inside it returns `429 over_email_send_rate_limit`.

The page says the same thing whether or not the address already has an account:

> If that address is new, a link is on its way. If you already have an account, we have sent you a way back in.

No enumeration on the site. The distinction is made inside the person's own inbox, which is where it belongs.

Honesty note: `?to=` puts an address in a URL. It is the person's own address, typed one second earlier, on a `noindex` page, and it never reaches a third party — but it *is* in Vercel's access log. The analytics hook (§2) strips the whole query from `/account/*`. If the judge prefers, this can move to `sessionStorage`; I chose the query so the page survives a refresh.

### 1.2 Clicking the emailed link

The email's button points at:

```
https://wiserwalk.com/account/password/?t=<token_hash>&k=signup
```

`k` is `signup`, `magiclink` or `recovery` and decides only the headline and which `type` we verify with.

**Query string, not fragment, deliberately.** The fragment is the textbook anti-prefetch trick, but **Brevo rewrites every link in every transactional email through its own redirector and this cannot be switched off on any plan below Enterprise**. Whether Brevo's 302 replays a fragment is unverified and untestable without a real send. A query string survives any redirector by construction. The prefetch problem is solved a different way, below, which is strictly stronger.

**URL `/account/password/?t=…&k=signup`.** The page is static. On load it does **three** things and no network call at all:

1. reads `t` and `k`;
2. `history.replaceState(null, '', '/account/password/')` — the token is out of the address bar before the person has focused the field;
3. renders the form.

`<meta name="referrer" content="no-referrer">` is on this page, so the token cannot leak through `Referer` to the Google Fonts request.

**Verification is deferred to submit.** A mail scanner, a corporate link-checker or Brevo's own redirector that GETs this URL fetches a static HTML file that calls nothing, so the one-time token is not burned. This is the whole reason the page exists.

The band reads `Choose a **password.**` (or `Choose a new **password.**` when `k=recovery`), lede `This is how you sign in from now on.`, one field (`autocomplete="new-password"`, `minlength=8`, a 44px text `Show`/`Hide` control with `aria-pressed`, no confirm field), and the rule printed **under the field before they type**: `At least 8 characters.` One 52px button, `Save it and sign in`.

On submit, in this order:

```js
// 1. validate locally FIRST. If the password is rejected AFTER verify, the token is spent
//    and the person needs a whole new email.
if (pw.length < 8) { say('At least 8 characters.'); return }

// 2. burn the token
let { error } = await supabase.auth.verifyOtp({ token_hash: t, type: k === 'recovery' ? 'recovery' : 'email' })
// if that fails with otp_expired and we guessed the type (k was missing or stripped), try the other once
```
→ `POST /auth/v1/verify` `{ "type": "email", "token_hash": "…" }` → `{ access_token, refresh_token, expires_in: 3600 }`. supabase-js stores the session.

```js
// 3. set the password on the session we now hold
await supabase.auth.updateUser({ password })
```
→ `PUT /auth/v1/user`, `Authorization: Bearer <access_token>`, `{ "password": "…" }`.

**If step 3 fails, never re-verify.** The session from step 2 still exists; retry `updateUser` on it. Re-verifying a spent token produces `otp_expired` and a person who is actually signed in being told their link expired.

```js
// 4. record it, server-side, where the user cannot write it
await supabase.rpc('mark_password_set')
// 5. merge the device shelf into the account (§5), then
// 6. add the address to the marketing list (§6.4)
await fetch('/api/auth/list', …)   // fire and forget, failure never blocks
```

Then straight to **`/me/`**, with the `.me-keep` panel now reading the signed-in statement. Not to a "success" page: the owner's rule is that a page's job is to get someone through a door.

**Two verify calls, never one.** `POST /verify` has no `password` field, so there is an unavoidable window where the token is spent and the password is not set. Local validation first makes that window uninteresting: if the browser closes between 2 and 3, the person has a confirmed account with no password, and the next time they ask for a link they get the `magiclink` email (§1.6), which lands on this same page.

**A different device or browser from the one that asked.** Nothing about this flow cares. The token is in the URL, the verify creates a session in *that* browser, and the merge in §5 is a union in both directions, so a link opened on a phone after a quiz was taken on a laptop loses nothing — the laptop's shelf arrives the first time the laptop signs in.

**A scanner has pre-opened the link.** The page performed no network call, so the token is intact. Brevo will record a click that no human made; that is cosmetic.

### 1.3 Signing in later

**URL `/account/sign-in/`.** Chip `Welcome back`, headline `Sign **in.**`, email + password + one 52px button, all inside the band. `autocomplete="current-password"`. Above the email field, a commented, laid-out but empty slot for the later Google button with an `or` hairline of `var(--grad-r)` at .5 opacity, so adding Google is not a relayout.

```js
await supabase.auth.signInWithPassword({ email, password })
```
→ `POST /auth/v1/token?grant_type=password` `{ "email": "…", "password": "…" }`.

Errors, all in the house voice, one message for both fields so nothing is enumerated:

| code | what the page says |
|---|---|
| `invalid_credentials` | `That did not work. If you have not set a password yet, ask for a link below.` |
| `email_not_confirmed` | `Check your email for the link we sent, and set a password there.` |
| `over_request_rate_limit` | `Too many tries. Give it a few minutes.` |
| anything else | `That did not go through. Try again in a moment.` |

Below the fold: `Forgotten your password?` as a 44px `.btn.ghost` pill (never a 12px underlined link), and `No account yet?` with a pill to `/account/sign-up/`.

### 1.4 Forgot password

**URL `/account/forgot/`.** The sign-up layout with a different chip and headline. One field, one button.

```js
await supabase.auth.resetPasswordForEmail(email)   // no redirectTo; we build the link
```
→ `POST /auth/v1/recover` `{ "email": "…" }`.

Deliberately **not** `signInWithOtp({ shouldCreateUser: false })`: that path answers `422 "Signups not allowed for otp"` for an unknown address and leaks whether an account exists (supabase/auth #1955).

On success → `/account/check-email/?to=…&k=recovery`, same page, one word different in the dark panel. The email lands on `/account/password/?t=…&k=recovery`. **Same page, same code, nothing new built.**

### 1.5 Signing out

From `/account/`, a room of its own with a `path` mark and a pill.

```js
await supabase.auth.signOut({ scope: 'local' })
```
→ `POST /auth/v1/logout?scope=local`, `Authorization: Bearer …`.

**`scope: 'local'` is passed explicitly.** The default is `global` and would sign the person out on every device they own, which is not what a "Sign out" link means to anyone.

Then: remove `ww.acct.v1` (the header hint, §3), leave `ww.shelf.v1` and the game keys **untouched** — signing out is not deleting anything, and the device shelf was theirs before the account existed. `/me/` goes back to its signed-out shape and still shows every result. Say so on the button: `Sign out of this browser`, and under it `Your results stay on this device.`

### 1.6 An already-registered address in the sign-up box

`signInWithOtp` on an address that exists and is confirmed does **not** go down the signup path; it sends the **Magic Link** action instead (`isNewUser = !user.IsConfirmed()`). Under the SMTP design that means a second dashboard template that must be worded identically to the first, and if it is not, half of all returning users read copy that contradicts the page they just left.

Under this design it is a `switch` in `site/src/lib/account/emails.ts`:

- `email_action_type: 'signup'` → the "set your password" email.
- `email_action_type: 'magiclink'` → the "you already have an account" email, which *names that fact*, points at `/account/sign-in/` first, and offers the link as the way to choose a new password.

Both are under test (§9). The site's own page says the neutral thing either way.

### 1.7 A wrong or expired link

`verifyOtp` answers `403` with code `otp_expired`, message "Email link is invalid or has expired". Also reached when a token has already been used.

`/account/password/` renders a **real state**, not a toast: same band, headline `That link has **expired.**`, one line (`Links work for an hour, and only once.`), one 52px button `Send me a new one`, and the email field pre-filled if we know the address. The button calls `resetPasswordForEmail` and goes to `/account/check-email/`.

If `t` is absent entirely (someone typed the URL, or a redirector stripped the query), the page renders the same state with an empty field and the line `Paste the six-digit code from your email, or ask for a new link.` — because the email also carries a six-digit code (§6.2) and the page accepts it in place of `t`.

### 1.8 An unconfigured site

`site/src/lib/account/config.ts`:

```ts
export const SUPABASE_URL = (import.meta.env.PUBLIC_SUPABASE_URL ?? '').trim();
export const SUPABASE_KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
export const ACCOUNTS_ON  = (import.meta.env.PUBLIC_ACCOUNTS_ON ?? '1').trim() !== '0';
export const ACCOUNTS_READY = ACCOUNTS_ON && Boolean(SUPABASE_URL && SUPABASE_KEY);
```

Modelled exactly on `site/src/lib/support.ts` and `isConfigured()` in `provider.ts`: a feature that stays invisible until the owner sets keys, rather than one that half-works.

When `ACCOUNTS_READY` is false:

- the header mark is exactly what it is today — `/me/`, no account state, no new nav item;
- `/me/`'s `.me-keep` panel keeps today's copy ("Accounts are on the way…"), unchanged;
- the result page's saved pill is unchanged;
- the seven `/account/*` pages **still build** (so previews and screenshots work) and render one band: `Accounts are not switched on **yet.**` with a pill back to `/me/`. Nothing links to them, they are `noindex` and out of the sitemap;
- `/api/auth/email` answers `503 {"ok":false,"error":"Accounts are not switched on yet."}` — the same shape `/api/subscribe` already uses;
- `/api/auth/health` **still works**, because its whole job is to say what is missing.

`PUBLIC_ACCOUNTS_ON=0` is the panic button: it hides the whole feature without removing keys or losing a single stored result.

**The half-configured state is the dangerous one** — Supabase keys set, Brevo not yet sending, so people sign up into silence. The defence is procedural and is step 17 of §8: the Supabase and Brevo work is all done, `/account/setup/` is read until it is green, and *only then* is the site redeployed. `PUBLIC_*` values are inlined at build, so until that redeploy the feature is invisible however many keys are in Vercel. The redeploy is the switch.

### 1.9 Google, later

Nothing here blocks it and nothing needs doing now. Automatic identity linking covers it: a Google identity carrying a **verified** email that matches an existing user is linked, not forked. Every one of our users reached their account by clicking an emailed link, so their email is confirmed by construction.

When it ships: a Web OAuth client in Google Cloud (origin `https://wiserwalk.com`, redirect URI `https://<ref>.supabase.co/auth/v1/callback`), client id and secret pasted into Supabase's Google provider page, `https://wiserwalk.com/account/**` added to the redirect allow list — the **one** time that list matters — and `signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://wiserwalk.com/account/' } })` wired to the slot already laid out on `/account/sign-in/`.

One caveat to write down now: a person who asks for a link and never clicks it stays **unconfirmed**, and a later Google sign-in with that address would fork into a second account. A monthly sweep of unconfirmed users older than 30 days fixes it; it is out of scope for step one and named in §10.

---

## 2. ROUTES AND FILES

### New pages

| file | one line |
|---|---|
| `site/src/pages/account/sign-up.astro` | email-only box in the band, three reasons below, the marketing line |
| `site/src/pages/account/check-email.astro` | prints the address back, "not that address?", 60s resend with a worded countdown |
| `site/src/pages/account/password.astro` | the emailed link lands here; three states (choose / expired / working), verifies only on submit |
| `site/src/pages/account/sign-in.astro` | email + password in the band, forgot pill, empty Google slot |
| `site/src/pages/account/forgot.astro` | one field, one button, posts to `resetPasswordForEmail` |
| `site/src/pages/account/index.astro` | `/account/`: a `night` band, a `.spec` list of real facts, one room each for change password, sign out, delete |
| `site/src/pages/account/setup.astro` | the owner's self-check, rendered from `/api/auth/health` in plain words. `noindex`, unlinked |

### New API routes (both `export const prerender = false`)

| file | one line |
|---|---|
| `site/src/pages/api/auth/email.ts` | the Supabase Send Email hook receiver: verify signature, render, send via Brevo, log, 200/503 |
| `site/src/pages/api/auth/health.ts` | GET: every setup check as plain words; `?ping=1` is the daily keep-alive and log trim |
| `site/src/pages/api/auth/list.ts` | POST: adds a confirmed address to the Brevo marketing list with `SOURCE=account`; honeypot, same-origin, no-store |

Extensionless, so `^/api/auth/email/?$` accepts both slash forms. All three land in the one existing `_render` function; `{"handle":"filesystem"}` still serves every static page from the CDN with no invocation.

### New lib modules

| file | one line |
|---|---|
| `site/src/lib/account/config.ts` | the build-time `PUBLIC_` constants and `ACCOUNTS_READY` |
| `site/src/lib/account/session.ts` | pure: read `sb-<ref>-auth-token` and `ww.acct.v1` from a store, parse, `isFresh(exp)`, never throws |
| `site/src/lib/account/client.ts` | browser: lazy `import('@supabase/supabase-js')`, the six calls, the error-code → house-voice map |
| `site/src/lib/account/hook.ts` | pure: Standard Webhooks HMAC verification with `node:crypto` (no dependency), payload parsing and validation |
| `site/src/lib/account/emails.ts` | pure: one function per `email_action_type` returning `{subject, html, text}`; the only place the link format lives |
| `site/src/lib/account/merge.ts` | pure: game-stat merge rules per key; re-exports `mergeShelves` |
| `site/src/lib/account/sync.ts` | browser: PostgREST reads/writes for `results` and `game_stats`, the pending-write queue |
| `site/src/lib/account/checks.ts` | pure-ish: every health check as `(fetch, env) => {step, name, state, say}` |
| `site/src/lib/account/schema.sql` | the whole database, version-controlled, the one block he pastes |
| `site/src/lib/account/README.md` | the numbered steps of §8, in the house style of `email/README.md` |
| `site/src/lib/email/send.ts` | `sendTransactional()` against `POST /v3/smtp/email`, sharing `postJson` and the `api-key` header |

### New assets, styles, tests

| file | one line |
|---|---|
| `site/src/components/AccountBand.astro` | the one band the five flow pages share, so they read as one movement |
| `site/src/styles/pages/account.css` | the flow's own stylesheet, tokens only, no new radius |
| `site/public/img/account-dawn.jpg` | one new dawn landscape, ≤1600px, ~q78, under 250KB, used by all five flow pages |
| `site/scripts/auth-test.mjs` | the headless suite of §9 |
| `site/vercel.json` | `$schema` + one daily cron at `/api/auth/health?ping=1`. Nothing else, and **no `trailingSlash`** |

### Existing files that change

| file | what changes |
|---|---|
| `site/src/layouts/Base.astro` | pre-paint script also reads `ww.acct.v1` → `data-account="in"`; `.nav-me` gains `.is-in`; the analytics `beforeSend` hook gains a branch clearing `search` and `hash` for any `/account/` path; the post-paint block gains one IIFE that flushes the pending-write queue when signed in |
| `site/src/pages/me.astro` | `.me-keep` panel gets three states (signed in / signed out with a shelf / accounts off); `paint()` gains a post-sync repaint; the clear-results confirm wording and order change (server first, §5); `noindex` unchanged |
| `site/src/pages/method.astro` | the whole "Your answers" section rewritten — it currently says "there is no account, and nothing about your result is stored on our side". **This must ship in the same commit as the first account route** |
| `site/src/pages/about.astro` | the build comment at `:168-172` and the mailing-list line updated |
| `site/src/lib/shelf.ts` | one new pure export, `mergeShelves(a, b)`, reusing `SAME_RUN_MS`, `SHELF_CAP` and `byNewest`. No change to any existing function |
| `site/src/lib/email/provider.ts` | export `postJson`; accept a `source` field so `SOURCE` rides along with `QUIZ`/`RESULT_CODE` |
| `site/src/lib/email/README.md` | add the sender and domain-authentication steps (absent today), correct the API-key path, add the 90-day inactive-key warning, add transactional activation as step 1 |
| `site/astro.config.mjs` | sitemap filter also excludes `/account/` |
| `site/package.json` | `auth-test.mjs` appended to **both** `prebuild` and `test` — `email-test.mjs` is in `test` only and so has never gated a deploy |
| `site/src/styles/touch.css` | `.acct-go` added to the hard-coded 44px-pill selector list at `:18-24` |
| `site/src/lib/icons.ts` + `site/src/components/Icon.astro` | one new mark, `key`, drawn on the 24 grid at `stroke-width="1.6"` |
| `site/public/img/CREDITS.md` | the new photograph's source |
| `site/.env` | unchanged. No Supabase keys locally, so `ACCOUNTS_READY` is false and a local run can never touch the live project — the same guarantee `EMAIL_PREVIEW=1` already gives the mailing list |

**One new dependency**, `@supabase/supabase-js`, the first in nine months and the first third-party JavaScript ever shipped to a browser on this site. It is loaded by dynamic `import()` inside submit handlers only, so it is absent from every page a reader who never signs in will open. The hook handler and the health route use plain `fetch`; `@supabase/ssr` is **not** installed.

---

## 3. SESSION MODEL

### Where tokens live

`localStorage`, key `sb-<ref>-auth-token`, written and refreshed by `@supabase/supabase-js`. **No cookies are set anywhere on this site.**

### Why not cookies

The honest case for cookies is XSS: an `httpOnly` refresh token cannot be read by injected script. The case against, on *this* site:

- Every page but three is `output: 'static'` and CDN-cached; `/r/` sets `cache-control: public, max-age=600`. A cookie session buys server-rendered signed-in state that these pages can never use.
- With `httpOnly` cookies, every read of account data is a Vercel invocation. `/me/` is the page readers return to; making it a function makes the site's most personal page its slowest.
- `Astro.cookies.set()` in the installed 5.18.2 adds **no defaults at all** — no `Path`, no `Secure`, no `SameSite`. A cookie set from `/api/auth/signin` without `path: '/'` is scoped by the browser to `/api/auth/` and never reaches `/me/`; a `cookies.delete()` without the matching path is a sign-out that silently does nothing. That is precisely the class of bug this owner cannot debug.
- Cookies would also mean owning token refresh and rotation on the server, including the 10s `refresh_token_reuse_interval` race, which shows up as users being randomly signed out.

The counter-cost is real and I state it in §10: `localStorage` means an XSS anywhere on the site steals a refresh token. The mitigations available are that this site renders no user-generated HTML anywhere, ships no third-party script, and can adopt a CSP as a follow-up.

### Lifetimes and refresh

- Access token (JWT): **3600s**, Supabase default (`auth.jwt_expiry`).
- Refresh token: rotation on, single use, `refresh_token_reuse_interval` 10s, reuse detected as theft. Left at defaults.
- Session time-box, inactivity timeout and single-session-per-user are **Pro-only** and not available. The practical lifetime is therefore "until they sign out or clear the browser". Said plainly on `/account/`.
- Refresh is performed **only by the SDK**, and the SDK is loaded only when a page actually needs an authenticated request and the stored `expires_at` is within 60s. In practice that is at most once an hour, on `/me/` or an account page.

### CSRF

There are no cookies, so no cross-site request can carry credentials to any origin. That is the whole CSRF story, and it is stronger than any token scheme.

Defence in depth on the two POST routes we own:

- `/api/auth/email` is authenticated by the Standard Webhooks HMAC signature and nothing else. It ignores `Origin` entirely, because Supabase is not a browser.
- `/api/auth/list` does its own `Origin === url.origin` check. **Astro's `security.checkOrigin` does not protect JSON POSTs** — the installed implementation lets `application/json` through from any origin — so this must be written, not assumed.
- Every auth JSON response carries `cache-control: no-store`, as `/api/subscribe` already does.

### XSS posture

Tokens are script-readable. Accepted, with these constraints written into the review checklist for any future change: no `set:html` with anything that is not a build-time literal on any page; no third-party script beyond the Vercel analytics already present; no `innerHTML` in the account pages (`textContent` only, as `me.astro` already does). A CSP with per-script hashes is the right follow-up and is not in this change, because the site has four `is:inline` blocks and getting a CSP wrong takes a working site down.

### How the static header learns

A 60-byte mirror key, written by us whenever the session is touched:

```
ww.acct.v1 = {"e":"reader@example.com","x":1793059200}
```

The **pre-paint** `is:inline` script in `<head>` — the same one that already sets `data-theme` before first paint — gains four lines:

```js
try {
  var a = JSON.parse(localStorage.getItem('ww.acct.v1'));
  if (a && a.e) document.documentElement.dataset.account = 'in';
} catch (e) {}
```

One `localStorage` read and a 60-byte parse: sub-millisecond, no network, no flash, no layout shift, and correct on a CDN-cached page. CSS keys off `html[data-account="in"] .nav-me` to swap the mark's state.

**No nav item is added.** The header row at 390px is a measured horizontal scroller already holding Quizzes, Games, Articles, Donate, two carets and the `/me/` mark; `kit.css:86-94` records that these "only just fit" and that roomier padding once made the page scroll sideways at 480px. Signed-in state is carried on the existing `.nav-me` mark, exactly as `.has-saved` is today.

The existing `has-saved` dot script keeps working unchanged. It goes stale in one new way — a signed-in reader on a fresh device sees no dot until the first sync completes — which the sync in §5 fixes on the same page load.

---

## 4. DATA MODEL

The full contents of `site/src/lib/account/schema.sql`. It is idempotent, so pasting it twice is safe — which matters, because the owner will paste it twice.

```sql
-- Wiser Walk accounts. Paste the whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run more than once.

-- 1 ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id                uuid primary key references auth.users on delete cascade,
  created_at        timestamptz not null default now(),
  password_set_at   timestamptz,
  marketing_opt_out boolean     not null default false,
  brevo_synced_at   timestamptz
);
alter table public.profiles enable row level security;

drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read own"   on public.profiles for select to authenticated
  using       ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated
  with check  ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated
  using       ((select auth.uid()) = id)
  with check  ((select auth.uid()) = id);

-- Column privileges, not policy gymnastics: password_set_at and brevo_synced_at are OURS.
revoke all on public.profiles from anon, authenticated;
grant select                       on public.profiles to authenticated;
grant insert (id)                  on public.profiles to authenticated;
grant update (marketing_opt_out)   on public.profiles to authenticated;

-- There is no trigger on auth.users. A trigger that throws breaks sign-up itself, silently,
-- and this owner cannot debug that. The row is created by this function instead, called
-- once, right after the password is set.
create or replace function public.mark_password_set()
returns void language sql security definer set search_path = '' as $$
  insert into public.profiles (id, password_set_at)
  values (auth.uid(), now())
  on conflict (id) do update set password_set_at = now();
$$;
revoke all on function public.mark_password_set() from public, anon;
grant execute on function public.mark_password_set() to authenticated;

-- 2 ------------------------------------------------------------------- results
-- Exactly today's shelf entry: {quiz, code, at}. The code carries the scores, so nothing
-- about anyone's answers is stored here beyond what is already in their own URL.
create table if not exists public.results (
  user_id uuid        not null references auth.users on delete cascade,
  quiz    text        not null check (char_length(quiz) between 1 and 64),
  code    text        not null check (char_length(code) between 1 and 64),
  at      timestamptz not null,
  primary key (user_id, quiz, code, at)
);
create index if not exists results_user_at on public.results (user_id, at desc);
alter table public.results enable row level security;

drop policy if exists "results read own"   on public.results;
drop policy if exists "results insert own" on public.results;
drop policy if exists "results delete own" on public.results;
create policy "results read own"   on public.results for select to authenticated
  using      ((select auth.uid()) = user_id);
create policy "results insert own" on public.results for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "results delete own" on public.results for delete to authenticated
  using      ((select auth.uid()) = user_id);

-- No update policy and no update grant: a finished result is immutable.
revoke all on public.results from anon, authenticated;
grant select, insert, delete on public.results to authenticated;

-- 3 --------------------------------------------------------------- game_stats
-- One row per stored value, keyed exactly as the games key their own localStorage.
create table if not exists public.game_stats (
  user_id    uuid        not null references auth.users on delete cascade,
  key        text        not null check (key in (
               'sls.best','sls.seen','sls.fooled','sls.canon',
               'wsi.best','wsi.seen','wsi.mix')),
  value      jsonb       not null check (pg_column_size(value) < 64000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.game_stats enable row level security;

drop policy if exists "game read own"   on public.game_stats;
drop policy if exists "game write own"  on public.game_stats;
drop policy if exists "game update own" on public.game_stats;
drop policy if exists "game delete own" on public.game_stats;
create policy "game read own"   on public.game_stats for select to authenticated
  using      ((select auth.uid()) = user_id);
create policy "game write own"  on public.game_stats for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "game update own" on public.game_stats for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "game delete own" on public.game_stats for delete to authenticated
  using      ((select auth.uid()) = user_id);

revoke all on public.game_stats from anon, authenticated;
grant select, insert, update, delete on public.game_stats to authenticated;

-- 4 ----------------------------------------------------------- auth_email_log
-- What the site sent on Supabase's behalf, so /account/setup/ can say whether the hook is
-- actually firing. It holds NO email address: the action type, the outcome, the time.
-- A log of who signed up and when is exactly the thing this site must not build by accident.
create table if not exists public.auth_email_log (
  webhook_id text        primary key,
  at         timestamptz not null default now(),
  action     text        not null,
  ok         boolean     not null,
  detail     text
);
create index if not exists auth_email_log_at on public.auth_email_log (at desc);
alter table public.auth_email_log enable row level security;
revoke all on public.auth_email_log from anon, authenticated;
-- No policies at all. Only the secret key, server-side, ever touches this table.
```

**Notes on the choices.**

- **`results` primary key includes `at`.** The shelf's own rule is that the same `(quiz, code)` within 60 seconds is one finish, and outside it two. Enforcing that server-side would mean a second implementation of a rule that already exists and is already tested in `shelf.ts`. Instead the table is a dumb append-only store with `on conflict do nothing`, and **all merging happens in one pure TypeScript function** (§5). Re-uploading the same shelf is a no-op; the round trip is instant-exact because Postgres compares instants, not strings.
- **No `security definer` trigger on `auth.users`.** The standard `handle_new_user()` pattern is one of the most common ways a Supabase sign-up breaks, and it breaks *inside* the auth server where nothing on our side can report it.
- **Column-level grants** carry the "the user cannot write their own `password_set_at`" rule, rather than a `with check` expression that is hard to read and easy to get subtly wrong.
- **Nothing blocks a cross-quiz profile.** `results` is `(user, quiz, code, at)` and every score is recoverable by decoding `code` through the engine, so a profile view is a read over one indexed table. `game_stats` is a typed key/value bag with room for every future key. A future `profiles.display_name` or a `streaks` table is additive.

---

## 5. SYNC

### The one rule

**A sync never deletes anything.** Merging is a union in both directions; the only deletions are ones the person explicitly asks for.

### The merge function

One new pure export in `site/src/lib/shelf.ts`, reusing the constants that are already there:

```ts
export function mergeShelves(a: ShelfEntry[], b: ShelfEntry[]): ShelfEntry[]
```

Union `a` and `b`; tidy every entry through the existing `tidyEntry`; sort `byNewest`; then walk the list dropping any entry whose `(quiz, code)` matches one already kept **within `SAME_RUN_MS`** — the identical rule `addResult` applies today; then `slice(0, SHELF_CAP)`.

Properties, all asserted in §9: commutative on the set, **idempotent** (`merge(merge(a,b), b) === merge(a,b)`), and never drops an entry that is present on one side and absent on the other unless it is a 60-second duplicate or falls past the 200 cap.

### First sign-in

The moment a session first appears (after `verifyOtp` or `signInWithPassword`), `sync.ts` runs:

1. `L = listResults()` from the device.
2. `R =` `GET /rest/v1/results?select=quiz,code,at&order=at.desc&limit=400`, `apikey: <publishable>`, `Authorization: Bearer <access_token>`, `Prefer: count=exact`. RLS restricts it to their own rows; the `count` from the `Content-Range` header is the true total.
3. `M = mergeShelves(L, R)`.
4. `saveShelf(M)` — the device now has everything.
5. Upload `M \ R`: `POST /rest/v1/results?on_conflict=user_id,quiz,code,at`, `Prefer: resolution=ignore-duplicates,return=minimal`, body `[{user_id, quiz, code, at}, …]` in one request.
6. Write `ww.acct.v1` and `ww.acct.synced = <ISO>`.

`SHELF_CAP` trims the **device** list only; the account keeps everything. So when the total exceeds 200, `/me/` says so out loud rather than quietly losing history: `200 shown, 431 saved to your account.` That is the same honesty as the existing "39 older ones are not listed" line.

### Afterwards, in both directions

- **Device → account.** `addResult()` at `q/[quiz].astro:450` is unchanged and still writes locally first, so the result page is instant and works offline. The new line beside it pushes the entry onto a small queue, `ww.acct.queue` (an array of `{quiz, code, at}`, capped at 50). The runner navigates away immediately, so a fetch started there would be cancelled — the queue is the actual mechanism.

  The queue is flushed by one new IIFE in `Base.astro`'s post-paint script, which fires **only** when `ww.acct.v1` exists and the queue is non-empty: one batched upsert, clear on success, leave it alone on failure. Everyone who is not signed in pays nothing, not even a branch worth measuring.

- **Account → device.** On every `/me/` load when signed in: steps 1–4 above, then repaint. That is what fixes the "signed in on a new device and the header dot is missing" staleness.

### Removing one result

`removeResult()` is exported, tested and has **no caller anywhere in the site** today. It gains one, on `/me/`, alongside a `DELETE /rest/v1/results?quiz=eq.<q>&code=eq.<c>&at=eq.<iso>` when signed in. Because this path has never run in a browser, it is on the §9 list to be exercised deliberately.

### "Clear my results"

Order matters and is the reverse of the obvious one. **Server first, then local.**

```
confirm → DELETE /rest/v1/results?user_id=eq.<id>  (RLS makes the filter belt-and-braces)
        → if it fails: say so, clear nothing, offer to try again
        → if it succeeds: clearShelf(); paint(); drop .has-saved from the header mark
```

Clearing locally first and failing server-side would restore everything on the next sync, and the reader would conclude the button does not work.

The confirm wording changes with state, because the existing one becomes a lie:

- signed out: `Clear every result saved on this device? The links themselves still work if you have them.` (unchanged)
- signed in: `Clear every result, on this device and in your account? This cannot be undone. The links themselves still work if you have them.`

And the button's own label follows: `Clear my results from this device` / `Clear my results everywhere`.

### Game keys

**Step one syncs the two `*.best` values and nothing else.** `sls.seen`, `sls.fooled`, `sls.canon`, `wsi.seen` and `wsi.mix` stay on the device, though the table already holds them.

The reason is discipline, not laziness: the games render their own documents with **no Base layout and no session code**, and their storage lives in `site/src/games/*.html`, which is generated and committed and must never be hand-edited — syncing from inside a game means editing `demos/<game>/game.src.html` and rebuilding two artefacts. Step one touches neither.

`/me/` already reads `sls.best` and `wsi.best` through the `GAME_BEST` map at `me.astro:37-40`. Signed in, it also:

```
GET  /rest/v1/game_stats?select=key,value,updated_at&key=in.(sls.best,wsi.best)
best = Math.max(local, remote)
if (best > remote) POST  …on_conflict=user_id,key  Prefer: resolution=merge-duplicates
if (best > local)  localStorage.setItem(key, String(best))
```

Two reads and at most two writes on one page. Merge rules for the rest, written now in `merge.ts` and tested now so the later change is a wiring job:

| key | merge |
|---|---|
| `sls.best`, `wsi.best` | larger number wins |
| `sls.seen`, `wsi.seen` | union of ids, newest-first, capped at the game's own reset threshold |
| `sls.fooled`, `wsi.mix` | per-key sum (independent plays on two devices genuinely are two counts) |
| `sls.canon` | later `updated_at` wins |

### Offline, and never blocking

- `/me/` renders from the server shell, then paints from the local shelf, **then** syncs. The first two steps involve no network at all, so the page is exactly as fast as it is today for everybody.
- A sync failure is silent. A reader who is offline sees their results, not an error, because their results are genuinely there. At most one quiet line under the count: `Not synced yet.`
- Writes queue and retry; nothing is lost by being offline when a quiz finishes.
- Conflicts do not exist for results: entries are immutable and additive, so the merge is a set union and there is nothing to resolve.

---

## 6. EMAILS

### 6.1 Who sends them, and why it is us

**Supabase's Send Email hook → `https://wiserwalk.com/api/auth/email` → Brevo's transactional API.** SMTP is never configured, and the dashboard's email templates are never touched. ("Auth Hook handles email sending (SMTP not used).")

What this buys, in the terms of this lens:

- **Four dashboard steps deleted**: the SMTP screen (six fields, where using the API key instead of an SMTP key gives `535` and using the account email instead of the SMTP login gives another), the three email templates that must be pasted identically, the email-template HTML itself, and the redirect allow list (because we build the link, so `emailRedirectTo` is never sent and never validated).
- **The new-vs-existing branch becomes code.** `signInWithOtp` sends the *Confirm signup* action to a new address and the *Magic Link* action to an existing one. Under SMTP that is two templates a human must keep in step. Under the hook it is a `switch` in one file with a test per branch.
- **The link format is a single string constant in the repository**, so it cannot drift from the page that has to parse it.
- **The six-digit code can be printed beside the button** (§6.2), which is only possible because we render the email.

What it costs, honestly: a **5-second timeout for the whole webhook invocation including retries**, a 20KB payload cap, retries only on `429`/`503` with 2s backoff, and an undocumented user-visible outcome when the hook ultimately fails. Design response:

- the handler imports **nothing** — Standard Webhooks verification is ~20 lines of `node:crypto`, not the `standardwebhooks` package — so the cold start is a small function, not a bundle;
- the Brevo call gets a **3.5s `AbortController` deadline**, reusing `postJson`, leaving headroom inside the 5s;
- a Brevo failure returns **503**, which is one of the two statuses Supabase retries;
- every delivery is upserted into `auth_email_log` keyed on `webhook-id`, so a retry after a lost response **does not send twice**, and `/account/setup/` can say "Supabase last asked us to send an email 4 minutes ago, and it went out";
- the `/account/check-email/` page never claims more than it knows, and its resend button is the recovery path.

**The escape hatch is designed in.** If the hook proves flaky in production, the fallback is not a rewrite: the link format is chosen so a dashboard template produces the *identical* URL. The owner turns the hook off, configures Brevo SMTP, and pastes this one line into all three templates:

```html
<a href="{{ .SiteURL }}/account/password/?t={{ .TokenHash }}&k=signup">Choose a password</a>
```

(`&k=recovery` in the Reset password template, `&k=magiclink` in Magic Link.) Not one line of site code changes. Those instructions ship in `account/README.md` under "If the emails stop arriving", written before they are needed.

### 6.2 The link, exactly

```
https://wiserwalk.com/account/password/?t=<token_hash>&k=<signup|magiclink|recovery>
```

`token_hash` comes from `email_data.token_hash`; `k` from `email_data.email_action_type`. `k` selects the verify `type` (`recovery` → `'recovery'`, otherwise `'email'`); if `k` is missing the page defaults to `'email'` and, on `otp_expired`, retries once with `'recovery'`.

Beside the button, in every email, the six-digit `email_data.token`, formatted `483 205`, with one line: `If the button does not work, go to wiserwalk.com/account/password/ and type this code.` The page accepts it in place of `t`.

That fallback is not decoration. It is the only thing standing between the owner and a dead flow if Brevo's redirector mangles the query string, if Brevo has one of its reported SSL outages on its tracking hosts, or if a corporate filter blocks the redirector entirely.

### 6.3 The wording

British, plain, warm, no em dashes, no emoji, no process talk, the word "faith" nowhere, the phrase "magic link" nowhere. Every one carries a plain-text part as well as HTML, which helps deliverability and helps anyone reading in a terminal.

**New address (`signup`)** — subject: `Set your password for Wiser Walk`

> Hello.
>
> Someone asked to make a Wiser Walk account with this address. If that was you, the button below takes you to a page where you choose a password. From then on you sign in with your email and that password.
>
> **[ Choose a password ]**
>
> The button works for one hour, and only once. If it does not work, go to wiserwalk.com/account/password/ and type this code: **483 205**
>
> If it was not you, you can ignore this. Nothing has been made.
>
> Wiser Walk

**Address that already has an account (`magiclink`)** — subject: `Your way back in to Wiser Walk`

> Hello.
>
> You already have a Wiser Walk account with this address.
>
> If you know your password, sign in at wiserwalk.com/account/sign-in/. If you do not, the button below lets you choose a new one.
>
> **[ Choose a new password ]**
>
> The button works for one hour, and only once. If it does not work, go to wiserwalk.com/account/password/ and type this code: **483 205**
>
> If you did not ask for this, you can ignore it. Your password has not changed.
>
> Wiser Walk

**Forgotten password (`recovery`)** — subject: `Choose a new password for Wiser Walk`

> Hello.
>
> You asked to choose a new password for your Wiser Walk account. The button below takes you to a page where you set one.
>
> **[ Choose a new password ]**
>
> The button works for one hour, and only once. If it does not work, go to wiserwalk.com/account/password/ and type this code: **483 205**
>
> If you did not ask for this, you can ignore it. Your password has not changed until you choose a new one.
>
> Wiser Walk

**Any other action type** (`invite`, `email_change`, `reauthentication`, or something new): the handler logs it to `auth_email_log` with `ok = false` and `detail = 'unhandled action'`, returns **200** so the auth request itself is never blocked, and `/account/setup/` reports it in plain words. Silently sending nothing while reporting success is the one thing that must not happen.

### 6.4 Link tracking, and how it is kept as far off as it goes

**It cannot be turned off.** Brevo rewrites every link in every transactional email through its own redirector on every plan below Enterprise; the request for a switch has run from late 2023 to early 2026 with no fix. Four responses, in order of how much they help:

1. **The page performs no network call on load**, so a prefetch by the redirector, a scanner or a corporate filter cannot burn the token. This is the real defence and it is total.
2. **The query string, not a fragment.** A fragment never reaches Brevo's server and its survival across the redirector is unverified; a query string survives by construction.
3. **The six-digit code**, so the flow has a path that involves no link at all.
4. **Brevo: Settings → Automations → Transactional emails → Tracking → Anonymous email tracking = Yes** (one toggle, step 6 of §8). It does not stop the rewrite; it stops the open and the click being tied to a named contact, which is the part that matters for a site that says it does not join views up to people.

If the branded-subdomain feature turns out to be available on the account, it turns the tracking host into `r.mail.wiserwalk.com` and is the single biggest cosmetic win available. It is a "check for it" note in the README, not a step, because its plan availability is unverified.

Two further consequences, both handled:

- **Brevo forces a `List-Unsubscribe` header onto transactional email**, so Gmail will render an Unsubscribe button beside "Set your password", and a click blocklists that **sender**. Containment: account mail goes from `account@wiserwalk.com` and marketing from a different sender, so an unsubscribe from the newsletter can never kill sign-in emails and vice versa. The health page reports a blocked recipient rather than the site claiming "we sent you a link".
- **The free plan stamps "Sent with Brevo" on every email, transactional included.** On a message asking somebody to set a password that is a real cost, and there is nothing to be done about it below Starter plus an add-on. Named in §10.

### 6.5 The marketing list

The owner wants to market to users. The honest version:

- **The line the person reads, on `/account/sign-up/`, before they type** (quoted in full in §1.1): *"We will email you a link to set a password. After that you sign in with your email and that password. We will also send you a note now and then when a new quiz, game or article is made, and you can stop those at any time without losing your sign-in."*
- **The contact is created only after the password is set** — not when the address is typed. So the list contains confirmed, real addresses, which is better for deliverability and means an abandoned sign-up leaves no contact behind.
- `POST /api/auth/list` (our route, same-origin, honeypot, `no-store`) calls the **existing** `subscribe()` with `updateEnabled: true`, `listIds: [BREVO_LIST_ID]`, and the one new attribute `SOURCE: 'account'` beside the existing `QUIZ` / `RESULT_CODE` / `RESULT_HEADLINE`. One list, one attribute, not a second list: a second list id is a second thing to keep in sync and it fragments the audience he wants to mail.
- **Never the double-opt-in endpoint for account sign-up.** The person has just proved they own the address by clicking a link; a second confirmation email is friction the owner explicitly dislikes, it spends one of 300 daily sends, and the DOI endpoint documents `includeListIds`, `redirectionUrl` and `templateId` as required — the current code sends `includeListIds: []` when no list is set, which will probably 400. The footer form keeps DOI if he ever switches it on.
- `/account/` carries one line with a real toggle: `Notes about new quizzes and games` → on/off. Off writes `profiles.marketing_opt_out = true` (the one column `authenticated` may update) and calls the route, which sets the Brevo contact's `SOURCE` and removes it from the list.
- `profiles.brevo_synced_at` records when the contact was last written, so a failure is visible on `/account/setup/` rather than being a person who never hears from the site.

**The honest weakness:** this is notice-plus-opt-out, not an unticked consent box. It is defensible for a UK audience and it is what the owner asked for, but a lens optimising for compliance would add a checkbox. Named again in §10.

---

## 7. ABUSE AND FAILURE

### Rate limits

| surface | who enforces it | value |
|---|---|---|
| sign-up / forgot email per address | **Supabase**, `auth.email.max_frequency` | 60s cooldown → `429 over_email_send_rate_limit` |
| `/auth/v1/otp`, `/signup`, `/recover` per IP | Supabase | 30 per 5 min → `over_request_rate_limit` |
| `/auth/v1/verify` per IP | Supabase | 30 per 5 min |
| `/auth/v1/token` (password sign-in) per IP | Supabase | 150 per 5 min |
| project email cap | Supabase, `Authentication → Rate Limits` | raised to 100/hr in step 12 |
| Brevo transactional API | Brevo | 1,000 req/s (never the bottleneck) |
| Brevo contacts API | Brevo | **10 req/s** — the bottleneck if sign-up ever both mails and contacts |
| `/api/auth/list` | us | honeypot + same-origin; a 429 there must never block the auth email |

A genuinely pleasant property of the hook design: **the browser talks to Supabase directly**, so Supabase's own per-address and per-IP limits guard the sign-up and reset endpoints. We did not have to build them and the owner does not have to trust that we did. We own only the send, which is downstream of those limits.

The resend button is disabled with words for 60 seconds to match `max_frequency` exactly, so the commonest 429 never happens.

### Enumeration

- `signInWithOtp({ shouldCreateUser: true })` emails **every** address, new or not, so the site's response is identical either way.
- `resetPasswordForEmail` is documented not to reveal existence (a residual leak is reported as supabase/auth #2702).
- `signInWithOtp({ shouldCreateUser: false })` is **never used** — it answers `422 "Signups not allowed for otp"` for unknown addresses (#1955).
- No endpoint on this site answers "does this address have an account".
- Sign-in failures use one message for both fields.

### Bots

No CAPTCHA, and the site rule forbids one. Defences: the honeypot field on our own route (the `website` field name `/api/subscribe` already relies on), Supabase's per-IP limits on the endpoints that actually send mail, and `PUBLIC_ACCOUNTS_ON=0` as a kill switch that takes one Vercel variable and one redeploy.

The concrete risk is that **Brevo automatically suspends transactional sending for an account whose forms are hit by bot sign-ups**, and recovery is a support ticket — the worst possible failure mode here, because it takes down sign-in for existing users too. hCaptcha or Turnstile is available on the Supabase free plan at Settings → Authentication → Bot and Abuse Protection and can be switched on later with `options.captchaToken` on three calls, without a redesign. It is held in reserve, and `/account/setup/` reports Brevo's account state daily so a suspension is noticed in hours, not weeks.

### A paused free-tier project

The single largest operational risk. A Free project with low activity over 7 days is paused, and a paused project answers **every** request with HTTP **540** — sign-up, sign-in, password reset and the profile all die at once, including for people who already have accounts. Recovery is manual, from the dashboard.

Defences:

1. `site/vercel.json` carries one daily cron at `/api/auth/health?ping=1` (Hobby allows daily only, ±59 minutes, UTC). It performs a real PostgREST read and a small `auth_email_log` trim, which is genuine database activity. **Zero owner steps** — the file is in the repo, and the endpoint needs no secret because the worst anyone can do by calling it is make us do a `select` and delete our own 60-day-old log lines.
2. **The site degrades honestly.** `/me/` renders from the device shelf first and syncs second, so a 540 is invisible to anyone reading their results. The account pages map 540 to one sentence with no jargon: *"Sign-in is down for a few minutes. Your results are safe on this device."*
3. `/account/setup/` names it exactly: *"Your Supabase project is paused. Open supabase.com, choose the project, and press Resume project."*

Honest gap: the docs say "a few user requests to the database each day over the previous week" is enough, and one request a day may be at the bottom of that range. Named in §10. A GitHub Actions cron can run hourly and is free, but it is another thing for the owner to create, which is why it is a documented fallback rather than the plan.

### Supabase down or unreachable

Every account call has a deadline and a house-voice message. The static site, every quiz, every game, every article and `/me/`'s own rendering are entirely unaffected, because none of them depends on Supabase for anything. That is a direct consequence of keeping the site static and the session client-side.

### The 300/day Brevo cap

One pool shared by the marketing list and every auth email. Past it, transactional mail goes to a retry queue capped at 1,000 and anything beyond that is simply not delivered, with no signal.

- **Auth mail always wins.** `/api/auth/list` is the thing that yields: it only ever creates a contact (which costs no send) and never triggers a DOI confirmation while the day's auth volume is high.
- `/account/setup/` reports whatever `GET /v3/account` gives for the day's remaining sends, so the owner sees the ceiling approaching rather than discovering it.
- 300/day is roughly 12/hour sustained. At this site's traffic it is not close; at a traffic spike it is the first thing to break, and the honest answer is Brevo's paid tier.
- The transactional platform must be **activated by Brevo support** before a single email sends, which is why it is step 1 of §8 — it is the only step with a human queue behind it.

---

## 8. THE OWNER'S SETUP STEPS

**Seventeen steps. Fourteen required, three optional.** For comparison, the Supabase-SMTP route is about twenty-one, and the four it adds are the six-field SMTP screen, three separate email-template pastes and the redirect allow list — the four most likely to be done wrong and the four our self-check could not verify.

Ordered by wait time, so nothing is blocked on something not yet started. Every step names the exact screen. The full text, with the values to paste, lives in `site/src/lib/account/README.md` in the same house style as the existing `email/README.md`.

**Brevo — do these first, step 1 has a human behind it**

1. **Brevo → Help → contact support:** open a ticket asking them to **switch on transactional email sending** for the account. Say the site is `wiserwalk.com` and it is for account sign-in emails. Nothing else works until they answer, and they answer in hours or days.
2. **Brevo → Settings → Senders, Domains, IPs → Domains → Add a domain →** `wiserwalk.com` **→ choose "Authenticate the domain yourself"** (the manual option). **Do not use the automatic option:** it logs into the DNS and offers to *replace* the existing DMARC record. Copy the values it shows.
3. **SiteGround DNS.** **Add** the Brevo code TXT at the root. **Add** Brevo's DKIM record or records exactly as shown. **Edit** the existing `_dmarc` TXT to append `rua=mailto:dmarc@wiserwalk.com`, keeping `p=none` — never add a second `_dmarc` record. **Touch nothing else. Do not change the SPF record, the MX records or the existing `default._domainkey`; Brevo does not need SPF or MX.**
4. **Brevo → Domains → Authenticate this email domain.** May take up to 48 hours.
5. **Brevo → Senders → Add a sender:** name `Wiser Walk`, address `account@wiserwalk.com`. Keep it separate from whatever sends the newsletter.
6. *(optional)* **Brevo → Settings → Automations → Transactional emails → Tracking → Anonymous email tracking = Yes.**
7. *(optional)* **Brevo → Contacts → Settings → Contact attributes → Add:** name `SOURCE`, type **Text**.

**Supabase**

8. **supabase.com → New project.** Name `wiser-walk`, region London, and **write the database password down somewhere safe** — it is shown once. Free plan.
9. **Settings → API Keys → "Publishable and secret API keys" tab.** Copy the **Project URL**, the **publishable key** and the **secret key** into a note. Keep the secret one to yourself.
10. **SQL Editor → New query.** Paste the whole of `site/src/lib/account/schema.sql` and press **Run**. It is safe to run twice.
11. **Authentication → Sign In / Providers → Email.** Set **Minimum password length** to **8** (the default is 6) and check that **Confirm email** is **on**.
12. **Authentication → Rate Limits.** Set **Emails sent per hour** to **100**.
13. **Authentication → Hooks → Send Email hook → Enable.** URL: `https://wiserwalk.com/api/auth/email`. Press **Generate secret** and copy it — it starts `v1,whsec_`.
14. **Authentication → URL Configuration.** Site URL: `https://wiserwalk.com`. Leave the Redirect URLs list alone; this site does not use it.

**Vercel**

15. **Project → Settings → Environment Variables.** Add these four for **both Production and Preview** (Preview too, or every preview build of the branch has dead sign-in):

    | name | value |
    |---|---|
    | `PUBLIC_SUPABASE_URL` | the Project URL from step 9 |
    | `PUBLIC_SUPABASE_ANON_KEY` | the **publishable** key from step 9 |
    | `SUPABASE_SECRET_KEY` | the **secret** key from step 9 |
    | `SUPABASE_EMAIL_HOOK_SECRET` | the secret from step 13, in full, including `v1,whsec_` |

    `BREVO_API_KEY` and `BREVO_LIST_ID` are already set and are reused as they are.

16. **Open `https://wiserwalk.com/account/setup/` and read it.** It lists every step above and says, in plain words, which ones are done and which are not. **Do not go on until every line is green.** Nothing is live yet, so nothing is broken while you fix things.
17. **Vercel → Deployments → the latest one → Redeploy.** This is the switch: the keys are read into the pages at build time, so until this redeploy accounts stay invisible however many keys are set. When it finishes, open `/account/sign-up/` and make an account with a real address you can open.

**If anything goes wrong afterwards:** open `/account/setup/` first. It will usually name the step. `account/README.md` also carries a section headed "If the emails stop arriving", with the fifteen-minute fallback to Supabase SMTP and the exact template line to paste.

---

## 9. TEST PLAN

`site/scripts/auth-test.mjs`, in the exact shape of `email-test.mjs`: esbuild the TypeScript to `node_modules/.auth-test.mjs`, `import()` it, `let failures = 0` with `fail`/`ok`/`is`, numbered sections, `rmSync` at the end, `process.exit(failures ? 1 : 0)`. Added to **both** `prebuild` and `test` in `package.json`, so it gates a Vercel deploy — `email-test.mjs` is in `test` only and never has.

The rule at the top of the file, as in `email-test.mjs`: *nothing here touches the network, no test uses a real key, and the one thing this file must never do is create a real account.*

### Testable headlessly

**1. Webhook signature (`hook.ts`).** Fixed HMAC vectors: a valid `webhook-id`/`webhook-timestamp`/`webhook-signature` triple passes; a wrong secret fails; a timestamp more than five minutes old fails; a malformed or absent header fails; the `v1,whsec_` prefix is stripped before the base64 is decoded; a body byte changed after signing fails. Comparison is constant-time.

**2. Email rendering (`emails.ts`).** For each of `signup`, `magiclink`, `recovery`: the subject is exactly the string above; the HTML contains exactly `https://wiserwalk.com/account/password/?t=<hash>&k=<kind>` and no other link to `/account/password/`; the six-digit code appears formatted; a `textContent` part exists and carries both; no `{{` survives; and a banned-words assertion — no "faith", no "magic link", no em dash, no emoji. An unknown action type returns `null` rather than a half-built email.

**3. Brevo send (`email/send.ts`).** Stubbed fetch: the URL is `https://api.brevo.com/v3/smtp/email`, the method POST, the header `api-key` carries the key, the body has `sender.email = account@wiserwalk.com`, one `to`, `subject`, `htmlContent`, `textContent` and `tags: ['auth', <kind>]`; **the key appears in no URL and in no body**; a 3.5s deadline aborts and returns a retryable failure rather than throwing.

**4. The hook route (`api/auth/email.ts`).** `GET` → 405 with `allow: POST`. Bad signature → 401 and **zero** Brevo calls. Unconfigured → 503. Good payload → 200 and exactly one Brevo call. Brevo 5xx → **503** (so Supabase retries). Brevo 400 → 200 plus a log row with `ok: false` (retrying a permanent failure is pointless). The same `webhook-id` twice → one Brevo call, not two. `EMAIL_PREVIEW=1` → the email is logged, nothing is sent, 200.

**5. `mergeShelves` (`shelf.ts`).** Local-only; remote-only; both; an exact duplicate; a pair 30s apart for the same `(quiz, code)` collapses; a pair 61s apart does not; order is newest-first; the 200 cap trims the oldest; an entry with a code that no longer decodes is dropped by `readableResults` and not by the merge; `merge(a, []) === a`; `merge(merge(a,b), b) === merge(a,b)`; and the invariant that every entry present on exactly one side survives unless it is a 60-second duplicate or past the cap.

**6. Game-stat merge (`merge.ts`).** `best` takes the larger; `canon` takes the later `updated_at`; `seen` unions without duplicates and respects the cap; `fooled`/`mix` sum per key; an unrecognised key is ignored rather than written.

**7. Sync request shapes (`sync.ts`).** Stubbed fetch: the read carries `apikey` **and** `Authorization: Bearer <access>`; the upsert URL carries `on_conflict=user_id,quiz,code,at` and `Prefer: resolution=ignore-duplicates,return=minimal`; the "clear everything" path issues the DELETE **before** touching local storage and, on a failed DELETE, leaves the local shelf intact; the queue flush batches into one request and is left alone on failure. A store that throws on every method is a no-op, never an error — the always-throws fake at `engine-test.mjs:1542-1554` copied verbatim.

**8. Health checks (`checks.ts`).** Each check against a stubbed fetch: missing key, 401, 200, and the 540 pause, each producing the right `state` and a `say` string that names the numbered step. The build-versus-runtime mismatch (runtime `process.env` has the keys, the build-time constant is empty) produces the "redeploy" line. The output contains no key, no email address and no user count.

**9. `session.ts`.** Parses a real-shaped `sb-<ref>-auth-token` blob; returns null for junk, for an empty store and for a store that throws; `isFresh` is correct either side of `expires_at`; `ww.acct.v1` round-trips.

**10. `config.ts`.** `ACCOUNTS_READY` is false when either `PUBLIC_` value is blank or whitespace, and false when `PUBLIC_ACCOUNTS_ON=0`.

### Only against a real project

- **Does the hook fire at all, and inside 5s from a cold start?** Measure the real round trip. This is the single most important live check and the one that decides whether the design survives.
- **Does the project email cap (30/hr) still apply when a Send Email hook is in use?** Unverified either way. Step 12 raises it regardless.
- **Does Brevo's redirector preserve the query string?** Send one real email and click it. If the answer is no, the button is dead and only the six-digit code works, which is a fifteen-minute change to make the code primary.
- **Does a bare text URL escape the rewrite?** One test send with the link as plain text and no `<a>`. If it does, that is a clean sign-in URL for nothing.
- **Does `verifyOtp({ type: 'email' })` really accept a recovery token?** The source says it checks both columns; confirm it once.
- **Does `updateUser({ password })` revoke the person's other sessions?** The docs list password changes as a termination trigger but do not say whether the initiating session survives. If it does not, step 3 of §1.2 needs a re-sign-in.
- **Deliverability**: DKIM passing, Gmail and Outlook inbox placement, and what the "Sent with Brevo" stamp actually looks like on the set-password email.
- **The pause**: leave the project idle for eight days with only the daily cron and see whether it survives.
- **`removeResult()`** has never run in a browser. Exercise it deliberately on a real `/me/`.
- **The design**: every one of the seven new pages captured at 390 and 1360, light and dark, with `sh design/tools/shot.sh`, before any of it is called done.

---

## 10. WEAKNESSES, CANDIDLY

**The hook's failure mode is undocumented, and it is on the critical path.** The 5-second budget covers a Vercel cold start plus a Brevo API call. In the normal case that is about a second; in the bad case it is not, and what Supabase shows the user when the hook ultimately fails is not written down anywhere I could verify. The mitigations are all *after the fact* — the resend button, the log table, the health page — not prevention. This is the biggest thing a judge should weigh, and it is the specific reason I designed the SMTP fallback to need zero code changes.

**`/api/auth/email` is a new public attack surface the SMTP route does not have.** If the signature verification has a bug, anyone on the internet can make the site send email, spend the 300/day pool, and get the Brevo account suspended — which takes down sign-in for existing users. Twenty lines of `node:crypto` under test is a smaller surface than a dependency, but it is a surface that did not exist.

**`localStorage` sessions mean an XSS anywhere on the site steals a refresh token.** Cookies with `httpOnly` would not. I chose against them for good reasons (§3), but I am trading a real security property for speed and simplicity, and the site has no CSP today to compensate. If the judge takes one thing from another lens, this is the candidate.

**One new secret and one new secret *class*.** `SUPABASE_SECRET_KEY` bypasses RLS entirely. It is used by exactly two routes and never by a browser, but this is a site whose only secret until now was a mailing-list key whose worst case was a spammed list.

**The marketing disclosure is notice-plus-opt-out, not a ticked box.** Defensible, and it is what the owner asked for, but a compliance-minded reviewer would want an explicit consent control at sign-up. I left it out because a checkbox in the band is exactly the kind of clutter that got the daily set rejected.

**One cron a day may not keep a Free project awake.** "A few user requests to the database each day over the previous week" is the documented threshold and one request is at the bottom of it. If the project pauses, sign-in is down site-wide and only the owner can resume it.

**I deliberately did not sync the games' `seen`, `fooled`, `mix` or `canon`.** A player who moves devices will see lines they have already seen. I think that is the right call for step one — touching the generated game HTML is a whole separate change — but it is a promise half-kept the moment the site says results follow you.

**`results` uses `at` in its primary key**, so a device with a badly wrong clock writes a row that looks like a separate sitting, and two devices that genuinely disagree about the time can produce a near-duplicate outside the 60-second window. The alternative — collapsing on `(user, quiz, code)` — loses the fact that somebody took a quiz twice. I picked the honest one and accepted the noise.

**The "Sent with Brevo" stamp is on the set-password email** and cannot be removed below Brevo Starter plus an add-on. On a message whose whole job is to look trustworthy, that is a real cost with no engineering answer.

**The whole flow depends on Brevo's redirector preserving a query string**, which I could not verify. If it does not, the button is dead on arrival and only the six-digit code works. That is exactly why the code is in every email, but the owner would still hear "the button doesn't work", which is the sentence this lens exists to prevent.

**Unverified facts this design leans on**, listed so a judge can discount them: whether the project email cap applies with a hook in use; whether the hook bypasses the 60s per-address cooldown; whether `verifyOtp({type:'email'})` accepts a recovery token in the current build; whether `updateUser({password})` kills the initiating session; the exact Brevo SMTP host and free-plan transactional cap (only needed for the fallback); and whether new projects still ship legacy `anon`/`service_role` keys alongside the new `sb_publishable_`/`sb_secret_` pair, which changes what the owner sees on the API Keys screen in step 9.

### What I would steal from the other two lenses

- **Cookie sessions, but only on `/account/*`.** If another lens shows that `@supabase/ssr` with `prerender = false` on the seven account pages keeps `/me/` and every static page untouched, that is a strictly better XSS posture for the pages where the token is actually handled, and I would take it. I would not take it site-wide, and I would not take it on `/me/`.
- **Their argument for Supabase SMTP as the *launch* configuration, with the hook as a second step.** If a lens argues the 5-second budget is unacceptable for a non-expert owner, the right graft is: ship on SMTP with our three templates pasted, keep the link format identical, and move to the hook once traffic keeps the function warm. My design already supports that switch in both directions; they may simply be right about which way round to do it first.
- **Any stronger answer on the Free-tier pause** — a GitHub Actions cron, a second Vercel project, or a straight recommendation of the $25 Pro plan. My daily cron is the cheapest thing that might work, and "might" is not a word this lens should be comfortable with.
- **A CAPTCHA plan.** I held Turnstile in reserve; a lens that argues Brevo's automatic suspension over bot sign-ups is severe enough to ship it on day one has a case I would find hard to rebut.
- **Anything they have on `/method/`'s rewrite.** The site currently publishes the sentence "there is no account, and nothing about your result is stored on our side". Whoever writes the truest replacement paragraph wins that section outright, and it has to ship in the same commit as the first account route.