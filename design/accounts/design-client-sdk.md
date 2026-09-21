# Accounts on wiserwalk.com — Lens B: the well-trodden path

**Design document, feature/accounts, 2026-09-21. Read-only study; nothing in the repo was changed.**

The bet this lens makes: *the least custom auth code is the safest auth code for a solo owner who cannot debug auth.* So `@supabase/supabase-js` runs in the browser exactly the way Supabase's own guides run it, Row Level Security is the security boundary, and the site keeps only two server routes — one because a Brevo key is a secret, one because a cron has to exist. There is no session cookie, no middleware, no token exchange of our own, and nothing for the owner to paste beyond two public keys.

---

## 1. THE FLOW

Shared facts used throughout:

- `S` = `createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY)`, imported **lazily** (`await import('@supabase/supabase-js')`) inside the first submit handler on a page. No static page ships it.
- Every Supabase REST call carries `apikey: <publishable key>` and, when signed in, `Authorization: Bearer <access_token>`.
- Account pages are `noindex`, excluded from the sitemap, and their `search` and `hash` are stripped from the URL bar on load and from analytics (see §2, `Base.astro` change).

### 1.1 First sign-up

**URL `/account/sign-up/`.** A picture band (the flow's own dawn photograph), chip `Your account`, headline *"Keep your results **for good.**"*, one email field and one 52px button **inside the band**, above the fold at 390px. Below the band, three rooms in the `/support/` `.sp-room` shape: results in one place / a profile that fills in as you go / hearing when something new is made.

Under the button, one line, `.78rem`, `--ink-mute`:

> We will email you a link to set a password. Tick the box and we will also send you a note when a new quiz or game is made — one tap to stop, any time.

and a single **unticked** checkbox labelled *"Send me a note when something new is made."* (Consent reasoning in §6.4.)

The person types an address and taps **Send me the link**.

```js
const { error } = await S.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: 'https://wiserwalk.com/account/password/' }
});
```

REST: `POST https://<ref>.supabase.co/auth/v1/otp` — `{ "email": "...", "create_user": true }`, header `apikey`.

`shouldCreateUser` stays at its default `true`. The marketing tick is **not** sent anywhere yet; it is held in `sessionStorage` under `ww.acct.optin` and applied after the password is set (§6.4), so only an address that has been proved lands on the owner's list.

On success the page **swaps in place** to the check-your-email state — same page, same band, a sibling block of the same height revealed, the form block hidden. No navigation, because navigating would either lose the typed address or put an email address into a URL, and §6 of the design rules forbids the second.

**What they see:** chip changes to `Sent`, headline *"Check your **email.**"*, their address printed back in DM Serif at 1.15rem with a 44px pill *"Not that address?"* that restores the form, then one dark panel: who the email is from (`Wiser Walk, account@wiserwalk.com`), what the subject line is (*"Set your password"*), what to do if it is not there in a minute (look in spam), and a **Send it again** button disabled with words — `Send it again in 47s` — counting down in tabular numerals from 60. No spinner, no step-dots.

### 1.2 Clicking the emailed link

**URL `/account/password/#token_hash=<hash>&type=email`.**

The page is **static and does nothing on load**. It renders the "choose a password" form immediately. That is the entire defence against mail scanners: a scanner that GETs the link fetches a cached HTML file and makes no network call, so the token is not spent.

Three ways the token can arrive, all handled by one reader:

```js
const p = new URLSearchParams((location.hash || location.search).replace(/^[#?]/, ''));
const token_hash = p.get('token_hash');
history.replaceState(null, '', location.pathname);   // out of the URL bar at once
```

The fragment is preferred because a fragment never reaches a server. The query string is accepted as a fallback **because Brevo rewrites every link in every email through its own redirector and we cannot prove the fragment survives that hop** (§10, weakness 4). Whichever form arrives, it is read once, cleared from the URL bar, and never sent to analytics.

**Different device or browser:** works, and needs nothing. The token is in the link, not in a cookie or a PKCE verifier held by the asking browser. `signInWithOtp` with an `emailRedirectTo` uses the implicit/token-hash path, so there is no code verifier to match. This is the main reason this lens does not use `@supabase/ssr` — its PKCE flow is exactly what breaks a link opened in a different browser.

**Mail scanner has pre-opened the link:** no effect. The token is redeemed only on submit.

### 1.3 Choosing a password

Same URL. One field, `autocomplete="new-password"`, 46px, with a text `Show` / `Hide` control (`aria-pressed`) at its right end — no second "confirm" field, because that is the commonest place a non-expert fails. The rule prints under the field **before** they type: *"At least 8 characters."*

On submit, in this order — the order matters:

```js
// 1. validate locally. If this fails, the token is untouched and they can try again.
if (password.length < 8) { say('At least 8 characters.', 'bad'); return; }

// 2. only now spend the token
const { error: vErr } = await S.auth.verifyOtp({ token_hash, type: 'email' });
// POST /auth/v1/verify  { "type": "email", "token_hash": "..." }
//   -> { access_token, refresh_token, expires_in: 3600 }

// 3. set the password on the session that now exists
const { error: uErr } = await S.auth.updateUser({ password });
// PUT /auth/v1/user  Authorization: Bearer <access_token>  { "password": "..." }

// 4. local bookkeeping, then the merge
markSignedIn(user);            // writes ww.acct.v1 (§3)
await syncNow();               // §5
await postContact(session);    // §6.4, only if the box was ticked
```

`type: 'email'` covers all three cases because the auth server searches `confirmation_token` **and** `recovery_token` for that type. One page, one branch, for sign-up, re-entry and reset alike.

If step 3 fails (weak password slipped past, network): **never re-verify.** The session from step 2 is alive; retry `updateUser` on it. The page says *"Nearly. That password was not accepted — try another."*

On success the page becomes a short signed-in state: *"You are signed in. Your results are saved to your account."* with a 52px button to `/me/`, and, when the merge moved anything, one real sentence with a real number — *"Seven results from this device are now on your account."*

### 1.4 Signing in later

**URL `/account/sign-in/`.** Band, chip `Welcome back`, headline *"Sign **in.**"*, email + password + 52px button in the band. A commented, laid-out slot sits **above** the email field for the later Google button, with an `or` hairline of `var(--grad-r)` at .5 opacity between them, so adding Google is not a relayout.

```js
await S.auth.signInWithPassword({ email, password });
// POST /auth/v1/token?grant_type=password
```

`invalid_credentials` → one generic line for both fields: *"That email and password do not match."* `email_not_confirmed` → *"Check your email for the link we sent."*

"Forgotten your password?" is a 44px ghost pill below 46rem, never a 12px underlined link.

### 1.5 Forgot password

**URL `/account/forgot/`.** Identical shape to sign-up — one email field, one button, the same in-place check-your-email state. Different chip and headline.

```js
await S.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://wiserwalk.com/account/password/'
});
// POST /auth/v1/recover  { "email": "..." }
```

Not `signInWithOtp({ shouldCreateUser: false })`: that path answers `422 "Signups not allowed for otp"` for an unknown address and so tells a stranger whether an account exists (supabase/auth #1955).

The Reset-password template points at the same `/account/password/#…&type=email`, so the reset landing page **is** the set-password page. Nothing new to build, nothing new to test.

### 1.6 Signing out

On `/account/`, a room of its own with a `path` mark.

```js
await S.auth.signOut({ scope: 'local' });   // POST /auth/v1/logout?scope=local
clearSignedIn();                             // removes ww.acct.v1
```

`scope: 'local'` is passed explicitly. The default is `global` and would sign the person out of every device they own, which is not what "Sign out" means to anybody.

The local shelf is **left alone**. Signing out on a shared laptop should arguably clear it; the design decision is that it does not, and the sign-out confirmation says so in one line: *"Your results stay on this device too. Clear them from My results if this is not your computer."*

### 1.7 An already-registered address in the sign-up box

Nothing visible changes. `signInWithOtp` sends the **Magic Link** template instead of **Confirm signup**; both templates carry identical wording and the same link, so the two cases are indistinguishable from outside — which is the whole point. The person lands on `/account/password/` and sets a password, which for someone who already had one is a reset. That is honest: whoever can read that inbox can already reset the password by the front door.

The sign-up page's small print therefore reads *"Already have an account? The same link will let you set a new password."* rather than pretending the case cannot happen.

### 1.8 A wrong or expired link

`verifyOtp` answers `403` with code `otp_expired`. The page renders a **real state**, not a toast: same band, chip `That link`, headline *"That link has **expired.**"*, one line (*"Links last an hour and work once."*), the email field pre-filled if we know the address, and one 52px **Send me a new one** button that calls `signInWithOtp` again and shows the same 60-second countdown. `over_email_send_rate_limit` (429) on that button → *"We just sent one. Look in your inbox, or try again in a minute."*

A link with no token at all (someone typed the URL) shows the same state without the "expired" claim: *"This page needs the link from your email."*

### 1.9 An unconfigured site — nothing may look broken

`PUBLIC_SUPABASE_URL` is inlined at build time, so `const ACCOUNTS_ON = Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY)` is a build-time constant and Vite removes the dead branches.

- With it false, **no entry point is rendered at all**: `/me/`'s `.me-keep` panel keeps today's "on this device" copy, no account link appears anywhere, and the header is untouched. Exactly the pattern `isConfigured()` + `EmailCapture.astro` already uses for the mailing list.
- The four `/account/` pages still build (so the URLs are never 404s for someone with an old link) and render one honest page: band, *"Accounts are not open **yet.**"*, one line, one pill back to `/quizzes/`. No form, no error, no spinner.
- Locally, `site/.env` gets `ACCOUNTS_PREVIEW=1`… **no** — a `PUBLIC_` var cannot be faked by a server helper. The local escape hatch is simply: leave `PUBLIC_SUPABASE_URL` out of `site/.env` and the whole feature is invisible, the way `EMAIL_PREVIEW=1` keeps the mailing list safe today. For local work against a real project the owner (or a builder) sets the two vars in `site/.env` and points them at a second, throwaway Supabase project.

### 1.10 Google, later

Nothing is done now beyond the reserved slot. When the time comes: a Web OAuth client in Google Cloud, JS origin `https://wiserwalk.com`, redirect URI `https://<ref>.supabase.co/auth/v1/callback`, client id and secret into Supabase's Google provider, then

```js
await S.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://wiserwalk.com/me/' } });
```

Automatic identity linking joins it to the existing account because our users' emails are confirmed by construction (they arrived through an email link). The one rule that must keep holding: **never create a user with an unconfirmed email through the Admin API**, or a later Google sign-in forks into a second account. This lens never uses the Admin API at all, so that rule is free.

---

## 2. ROUTES AND FILES

### New pages (`site/src/pages/account/`)

| File | URL | One line |
|---|---|---|
| `sign-up.astro` | `/account/sign-up/` | Email-only box in the band; swaps in place to the check-your-email state; `noindex`. |
| `password.astro` | `/account/password/` | The emailed link lands here; renders the form on load, verifies only on submit; also carries the expired state. |
| `sign-in.astro` | `/account/sign-in/` | Email + password; reserved Google slot above the fields. |
| `forgot.astro` | `/account/forgot/` | Same shape as sign-up, different words; `resetPasswordForEmail`. |
| `index.astro` | `/account/` | Signed-in settings on the `night` ground: a `.spec` list (address, member since, results kept), then rooms for change password, sign out, delete account. Signed out it is a doorway to `/account/sign-in/`. |

All five: `noindex={true}`, added to the sitemap filter, and static (`prerender` untouched). **Not one of them adds a Vercel function.**

### New API routes

| File | One line |
|---|---|
| `site/src/pages/api/account/contact.ts` | `prerender = false`. Takes the caller's access token, asks Supabase `GET /auth/v1/user` who it belongs to, and adds *that* verified address to Brevo with `SOURCE=account-signup` through the existing provider. Exists only because `BREVO_API_KEY` is a secret. |
| `site/src/pages/api/cron/keepalive.ts` | `prerender = false`. A daily GET that selects one row from `public.heartbeat` with the publishable key, so a Free-tier project is never paused into silence. |

### New lib modules (`site/src/lib/account/`)

| File | One line |
|---|---|
| `config.ts` | `ACCOUNTS_ON`, the two `import.meta.env.PUBLIC_*` reads written literally so Vite inlines them, and `SUPABASE_URL`/`ANON_KEY` re-exports. |
| `client.ts` | `getClient()` — a lazy `await import('@supabase/supabase-js')` memoised to one instance per page. |
| `flag.ts` | The header flag: `readFlag()`, `markSignedIn(user)`, `clearSignedIn()`, working on `ww.acct.v1`. No SDK import; safe on any page. |
| `merge.ts` | **Pure functions**, no I/O: `mergeShelf(local, server)`, `mergeGameStat(key, local, server)`, `sameRun(a, b)`. This is where the whole sync correctness story lives, and it is the part that can be tested headlessly. |
| `sync.ts` | `syncNow()`, `pushOne(entry)`, `pushGames()`, `deleteResult()`, `clearAccountResults()`. Talks to PostgREST through the SDK; every call wrapped, every failure silent-but-recorded. |
| `device.ts` | `deviceId()` — a random id in `ww.device.v1`, used to partition counter-shaped game stats. |

### New styles / assets

- `site/src/styles/pages/account.css` — the flow's own page stylesheet, in the existing `pages/` group.
- One new photograph, `site/public/img/account-dawn.jpg` (Unsplash, ≤1600px, ~q78, <250KB), credited in `site/public/img/CREDITS.md`, used across all four flow pages so they read as one movement. Never the footer walker.
- `site/src/components/Icon.astro` + `site/src/lib/icons.ts` — one new mark, `key`, drawn on the 24 grid, `stroke-width="1.6"`, round caps, `fill="none"`.

### New tests

- `site/scripts/auth-test.mjs` — esbuild-bundles `merge.ts`, `flag.ts` and `sync.ts`, drives them against a fake store and a stubbed `fetch`, in the house style of `email-test.mjs`. **Added to both `prebuild` and `test` in `package.json`**, because `email-test.mjs` is in `test` only and therefore never gates a Vercel deploy.

### New config

- `site/vercel.json` — `$schema` + one `crons` entry, `{"path": "/api/cron/keepalive", "schedule": "0 4 * * *"}`. At `site/`, the configured Root Directory, never the repo root. No `trailingSlash` key (the adapter errors on a conflict).

### Existing files that change

| File | Change |
|---|---|
| `site/src/layouts/Base.astro` | (a) the pre-paint `is:inline` script also reads `ww.acct.v1` and sets `document.documentElement.dataset.account`; (b) the `has-saved` IIFE gains `|| signed-in` so the mark means "there is something behind this" in both cases; (c) the analytics `beforeSend` hook clears `search` **and** `hash` for any `/account/` path; (d) the footer newsletter button is relabelled from `Sign up` to `Keep me posted`, because "Sign up" now means something else on this site. |
| `site/src/pages/me.astro` | The `.me-keep` panel becomes three states at one height: signed in (*"Saved to your account"* + link to `/account/`), signed out with a shelf (the offer, linking to `/account/sign-up/` — **not** `#foot-signup`), signed out with nothing (unchanged). The chip, the description, the `h2` and the clear-button wording lose "on this device". `paint()` gains a second call after `syncNow()` resolves. The clear button, when signed in, clears the account too and says so in the confirm. |
| `site/src/pages/q/[quiz].astro` | After the existing `addResult(quiz.slug, code)` at line 450, one added line: `if (readFlag()) import('../../lib/account/sync').then(m => m.pushOne(...))`. Lazy, fire-and-forget, never blocking the redirect to the result page. |
| `site/src/pages/method.astro` | The "Your answers" section is rewritten. Today it says *"Answers are never sent to a server, there is no account, and nothing about your result is stored on our side"* and *"if you fill in neither form, nothing leaves your browser at all"*. Both become false the hour this ships. **Same commit, not later.** |
| `site/src/pages/about.astro` | The build comment at 168–172 is resolved; the mailing-list line gains one clause about accounts. |
| `site/src/lib/shelf.ts` | No logic change. The file docstring's *"nothing is sent — it is the reader's device and nowhere else"* becomes *"nothing is sent from here"* with one line pointing at `lib/account/sync.ts`. |
| `site/src/lib/email/provider.ts` | `Subscription` gains an optional `source`; `attributesFor()` sends `SOURCE` when present. Two lines. |
| `site/src/lib/email/README.md` | Rewritten per the research brief: the transactional-activation ticket as step 1, sender and domain authentication (missing entirely today), the corrected API-key path, the 90-day inactive-key expiry. |
| `site/astro.config.mjs` | Sitemap filter excludes `/account/`. |
| `site/package.json` | `@supabase/supabase-js` added to `dependencies`; `auth-test.mjs` added to `prebuild` and `test`. |
| `site/src/styles/touch.css` | The new call-to-action class added to the hard-coded `-go` selector list at 18–24, or the account buttons written as pills from the start. |
| `site/public/img/CREDITS.md` | The new photograph. |

**Files deliberately not touched:** `site/src/games/*.html` and `demos/*/game.src.html`. The games keep no session code and gain no SDK; `/me/` syncs their stored values on their behalf (§5.5). That avoids a game rebuild and keeps 56KB out of a full-screen game document.

---

## 3. SESSION MODEL

**Where tokens live:** `localStorage`, written and refreshed by `supabase-js` under `sb-<project-ref>-auth-token`. We never read, parse or copy it. There is **no cookie**, no `@supabase/ssr`, no middleware and no server session.

**Lifetimes:** access token 3600s (`auth.jwt_expiry` default). Refresh token rotating, single-use, 10s reuse interval, no expiry we configure. The SDK refreshes in the background on any page where it is loaded; on a page where it is not loaded, nothing expires that matters, because nothing on that page reads the session.

**Refresh:** `POST /auth/v1/token?grant_type=refresh_token`, handled entirely by the SDK. `autoRefreshToken: true` and `persistSession: true` are the defaults and stay.

**Sign-out:** `signOut({ scope: 'local' })` plus `clearSignedIn()`.

**CSRF: structurally impossible.** The browser sends the token in an `Authorization` header that only our JavaScript can set. A cross-site form post to `<ref>.supabase.co` carries no credential. This is the single largest engineering saving in this lens: the research brief shows `security.checkOrigin` does **not** protect JSON POSTs in Astro 5.18.2, so a cookie design has to hand-write an Origin check on every route. We have one route that takes a token (`/api/account/contact`) and it checks Origin anyway, belt and braces, plus it verifies the bearer token with Supabase before trusting a byte of it.

**XSS: this is the real exposure, and it is worse than a cookie design.** A token in `localStorage` is readable by any script that runs on the page; an `httpOnly` cookie is not. Honest mitigations, all of which the site already half-does:

- The only third-party script on the site is Vercel Web Analytics. The Supabase SDK is bundled from npm by Vite, not pulled from a CDN, so there is no third-party script tag and no SRI question.
- No `innerHTML` anywhere with remote data. `/me/`'s paint uses `textContent` and `createElement` today; the account pages must do the same. This belongs in the builder's brief as a hard rule.
- Tokens never enter a URL: the set-password hash is read once and `replaceState`d away, and `/account/` is added to the analytics strip list.
- A strict CSP is **not** proposed. The site depends on `is:inline` scripts on static CDN-cached HTML, so nonces are impossible and hashes would have to be regenerated on every build; a CSP with `'unsafe-inline'` buys almost nothing against this threat. Saying so plainly is better than shipping a CSP that looks like protection.

**How the static header learns, without slowing any page.** One extra `localStorage` read inside the `is:inline` script that already runs before first paint for the theme:

```js
try {
  var a = JSON.parse(localStorage.getItem('ww.acct.v1'));
  if (a && a.exp > Date.now()) document.documentElement.dataset.account = 'in';
} catch (e) {}
```

`ww.acct.v1` is `{ email, exp }` — a display hint with a 30-day `exp`, written by `markSignedIn()` and removed by `clearSignedIn()`. It is **not** a credential: it grants nothing, and a page that trusts it for anything but paint is a bug. Zero network, zero SDK, no flash, and the page is correct with the script blocked.

**What the header does with it: nothing new.** No sixth nav item (the row is measured and full below 34rem), and no second treatment on the 7px `.nav-me` dot — a dot that is sometimes a ring and sometimes a fill is precisely the "weird outlines… different sizing/colors" the owner rejected this week. The dot keeps one shape, one size, one fill, and now means *"there is something behind this"*, true when signed in **or** when the shelf is non-empty. Identity is shown on `/me/` and `/account/`, where there is room for words.

**Staleness:** `onAuthStateChange` runs on every page where the SDK loads (`/me/` and the five account pages); a `SIGNED_OUT` or a failed refresh clears the flag. On other pages the flag can be up to 30 days stale, and the worst consequence is a dot that should not be there.

---

## 4. DATA MODEL

One block for the SQL Editor. Every table has RLS on, every policy names `to authenticated` and wraps the call as `(select auth.uid())`, and the only foreign key into the auth schema is to `auth.users`' primary key.

```sql
-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  email               text,
  display_name        text,
  password_set_at     timestamptz,
  marketing_opt_in    boolean not null default false,
  marketing_synced_at timestamptz,
  created_at          timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profile: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profile: write own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- RLS cannot restrict columns; grants can. password_set_at and
-- marketing_synced_at are ours, and the user may never write them.
revoke update on public.profiles from authenticated;
grant  update (display_name, marketing_opt_in) on public.profiles to authenticated;

-- ---------------------------------------------------------------- results
create table public.results (
  user_id    uuid        not null references auth.users on delete cascade,
  quiz       text        not null check (char_length(quiz) between 1 and 64),
  code       text        not null check (char_length(code) between 1 and 64),
  taken_at   timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, quiz, code, taken_at)
);
alter table public.results enable row level security;

create index results_live on public.results (user_id, taken_at desc)
  where deleted_at is null;

create policy "results: read own"   on public.results
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "results: insert own" on public.results
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "results: update own" on public.results
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "results: delete own" on public.results
  for delete to authenticated using ((select auth.uid()) = user_id);

-- The browser writes these rows directly, so a cap belongs in the database.
create or replace function public.cap_results()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.results where user_id = new.user_id) >= 2000 then
    raise exception 'result limit reached';
  end if;
  return new;
end $$;
create trigger results_cap before insert on public.results
  for each row execute function public.cap_results();

-- ---------------------------------------------------------------- game stats
create table public.game_stats (
  user_id    uuid        not null references auth.users on delete cascade,
  game       text        not null check (char_length(game) between 1 and 64),
  stat       text        not null check (stat in ('best','canon','fooled','mix','seen')),
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game, stat)
);
alter table public.game_stats enable row level security;

create policy "games: read own"  on public.game_stats
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "games: write own" on public.game_stats
  for all    to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- heartbeat
create table public.heartbeat (
  id      smallint primary key default 1,
  beat_at timestamptz not null default now()
);
insert into public.heartbeat (id) values (1) on conflict do nothing;
alter table public.heartbeat enable row level security;
create policy "heartbeat: readable" on public.heartbeat
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------- triggers on auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- "Has this person set a password yet?" has no built-in field, and identities /
-- app_metadata are demonstrably unreliable for it. Keep the answer here, where
-- the user cannot write it.
create or replace function public.handle_password_set()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.encrypted_password is not null
     and (old.encrypted_password is null or new.encrypted_password <> old.encrypted_password)
  then
    update public.profiles
       set password_set_at = now(), email = new.email
     where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_password after update of encrypted_password on auth.users
  for each row execute function public.handle_password_set();

-- ---------------------------------------------------------------- delete my account
-- Lets the browser delete the account with no service_role key anywhere.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
```

**Shape notes.**

- `{quiz, code, at}` maps one-to-one onto `(quiz, code, taken_at)`. The result code carries the scores, so the server never needs the answers and never gets them — that sentence survives into the rewritten `/method/`.
- **The primary key is the dedupe rule for exact repeats only.** The 60-second same-run rule is applied in `merge.ts`, not in an index, because a `date_trunc` expression index on `timestamptz` is not immutable and a generated column for it is a trap. Code, tested headlessly, is the honest place for a rule that is already defined in code (`SAME_RUN_MS`).
- `deleted_at` is a tombstone, so a delete on one device is not resurrected by the next device's push. No second table.
- `game_stats` is the generic (user, thing, key, jsonb) shelf. It carries `best`, `canon`, `fooled`, `mix` and `seen` by schema; §5.5 says which are actually synced in v1.
- **Nothing here blocks a cross-quiz profile.** The profile row is already the hub; a future `profile_traits` table, or a view over `results` decoding nothing, hangs off the same `id`. Results are stored by quiz slug and code, which is exactly what a cross-quiz scorer needs.

**Row cap and junk data.** Because the browser writes directly, a signed-in person can insert rows with any `quiz` and `code` they like. The `CHECK` constraints bound the size, the trigger bounds the count, and the reader for `/me/` runs every row through `isReadable()` before it is drawn, which is what already happens for the device shelf. Nothing else protects against it, and that is a real cost of this lens (§10).

---

## 5. SYNC

### 5.1 The shape

`shelf.ts` stays exactly as it is and remains the device's source of truth. The account is a **mirror**, not a replacement. `/me/` renders the local shelf synchronously on load — the code path that exists today, unchanged, instant — and then, if signed in, `syncNow()` runs in `requestIdleCallback` and calls `paint()` a second time. Nothing moves in the document between the two paints except content inside rooms that already have their height.

### 5.2 First sign-in: the merge

```
1. pull   select quiz, code, taken_at, deleted_at from results     (RLS filters to me)
2. local  listResults()                                            (shelf.ts, untouched)
3. tomb   drop any local entry matching a server row with deleted_at set,
          by (quiz, code) within SAME_RUN_MS of the tombstone's taken_at
4. union  merge live server rows with what is left of local:
            key = quiz + '|' + code + '|' + floor(Date.parse(at) / SAME_RUN_MS)
            on collision keep the EARLIER taken_at   (the first finish is the true one)
5. write  saveShelf(union.slice(0, SHELF_CAP))     newest 200, as today
6. push   upsert every union entry not already on the server:
            .upsert(rows, { onConflict: 'user_id,quiz,code,taken_at',
                            ignoreDuplicates: true })
```

Step 4's minute-bucket key is the same 60-second rule the shelf already applies locally, which is why the phone-and-laptop duplicate the codebase map warns about collapses to one row: the same quiz and the same code seconds apart is one finish.

Two results with the same code taken **weeks** apart are two rows and stay two rows. That is deliberate: identical answers on two occasions is history, and `/me/` lists earlier runs by date.

`SHELF_CAP = 200` still caps the device cache. The account holds up to 2,000. When the server has more than the cache shows, `/me/` says so in real words below the rooms — *"and 34 older results, kept on your account"* — rather than losing them silently.

### 5.3 Afterwards, both directions

- **Finishing a quiz while signed in:** `addResult()` writes locally as today; `pushOne()` inserts the single row. If it fails, `ww.sync.v1` gets `{ pendingPush: true }` and the next `syncNow()` (next `/me/` visit, or next sign-in) does a full push. The redirect to the result page never waits on the network.
- **On every `/me/` load while signed in:** a full pull-merge-push. It is one round trip over a table with tens of rows.
- **On another device:** signing in there runs the same first-sign-in merge, so its local shelf gains the account's history and the account gains anything that device had.

### 5.4 Removing things

- **One result.** `removeResult()` exists in `shelf.ts`, is tested, and has never had a caller. If a per-result remove is wanted it gets one: local `removeResult(quiz, code, at)` plus `update results set deleted_at = now()` on that key. The tombstone is what stops the other device putting it back.
- **"Clear my results."** Signed out, today's behaviour and today's confirm. Signed in, the confirm changes to say what is actually true: *"Clear every result on your account and on this device? The links themselves still work if you have them."* Then `clearShelf()` locally and `update results set deleted_at = now() where deleted_at is null` for the account. Rows are kept as tombstones for a year so other devices learn about it; `/account/` offers Delete my account for someone who wants the rows gone.
- **Delete my account.** `rpc('delete_my_account')`, then `signOut({ scope: 'local' })` — deleting a user does **not** invalidate a live JWT, so the sign-out is not optional — then `clearShelf()`, then a plain page saying it is done. The cascades take `profiles`, `results` and `game_stats` with the user. Brevo is **not** touched: the person unsubscribes from the list through the unsubscribe link, which is how they consented, and quietly deleting a marketing contact from a button labelled "delete my account" would be a different promise. `/account/` says that in one line, with the unsubscribe route named.

### 5.5 The games

`/me/` already reads `sls.best` and `wsi.best` from localStorage. It does the games' syncing for them, because the game documents have no site layout, no header and no SDK, and their HTML is generated-but-committed.

| Key | Synced in v1 | Merge rule |
|---|---|---|
| `sls.best`, `wsi.best` | **yes** | `max(local, server)`, written back to localStorage so the game sees it. Idempotent. |
| `sls.canon` | **yes** | last write wins, by `updated_at`. It is a preference, not a score. |
| `sls.fooled`, `wsi.mix` | no, in v1 | They are counters, and summing them on every merge double-counts. The schema carries them; when the cross-quiz profile wants them, `value` becomes `{ "<device_id>": {…} }` keyed by `ww.device.v1` and summed on read, which is exact and idempotent. `device.ts` exists for this. |
| `sls.seen`, `wsi.seen` | no | A novelty ledger that resets itself at 30% of the pool and can run to thousands of ids. Device-local is right, and syncing it would trade egress for nothing. |

`/method/`'s game-storage paragraphs need one added sentence naming which of these now reach an account.

### 5.6 Offline, and failure

Every server call is wrapped and every failure is a no-op with a flag. Offline, the site behaves exactly as it does today: quizzes score in the browser, results shelve locally, `/me/` renders. Nothing shows a spinner over content, and no error is put in front of someone who did not ask for a network. The only visible sign is on `/account/`, which prints *"Last saved to your account: yesterday"* from `ww.sync.v1` — one honest fact, and the place where a long silence becomes visible.

---

## 6. EMAILS

### 6.1 Who sends them

**Supabase sends them, over Brevo's SMTP relay.** Not the Send Email hook (a 5-second budget for the whole invocation including retries, against a cold Vercel function plus a Brevo API call), and not `admin/generate_link` with our own Brevo API send (it needs the secret key in a function — a third key for the owner to paste and a new way to leak — and `type: 'magiclink'` has a reported failure to create missing users).

Custom SMTP is not an optimisation to do later: Supabase's built-in sender delivers **only to the project team's own addresses** and caps at 2/hour, so sign-up does not work for a single real visitor until Brevo SMTP is entered. It is the first Supabase step.

### 6.2 The link

The same one line in **all three** templates — Confirm signup, Magic Link, Reset password. One sign-up box produces two of them depending on whether the address already exists, and a third for reset; if only one is edited, some people land somewhere dead.

```html
<a href="{{ .SiteURL }}/account/password/#token_hash={{ .TokenHash }}&type=email">Set your password</a>
```

Never `{{ .ConfirmationURL }}` — that goes through Supabase's own verify endpoint, which spends the token on a GET, which is exactly what a mail scanner does.

### 6.3 The wording

Subject, all three: **Set your password**

> Hello,
>
> Here is the link to set a password for your Wiser Walk account. It works once, and it lasts an hour.
>
> **[ Set your password ]**
>
> After that you sign in with your email address and that password, on any device, and the quizzes and games you finish are kept for you.
>
> If the button does not work, go to wiserwalk.com/account/sign-in/ and ask for a new link.
>
> If you did not ask for this, you can ignore it. Nothing happens until someone uses the link.
>
> Wiser Walk

No church vocabulary, no "faith" as a noun for the site, no "magic link", no em dashes, and the same words whether the address is new or known. One button, one fallback sentence — the fallback matters because Brevo rewrites the href through its own redirector and there are reported certificate outages on those hosts.

### 6.4 Tracking, and the marketing list

**Link tracking cannot be turned off on Brevo.** Disabling it is Enterprise-only and on request; the request thread has run for over two years. What can be done, and is in the owner's steps: **Settings → Automations → Transactional emails → Tracking → Anonymous email tracking = Yes**, which unlinks opens and clicks from the contact. The link is still rewritten. The design answers that three ways: the token is not spent on a GET, the page accepts the token from the query as well as the fragment, and the email carries a plain fallback sentence.

Brevo also forces a `List-Unsubscribe` header onto transactional mail, so Gmail will show "Unsubscribe" beside "Set your password". Transactional blocklisting is **per sender**, which is why account mail goes from `account@wiserwalk.com` and marketing from a different address: an unsubscribe from the newsletter can never kill sign-in emails, and vice versa.

**Getting the address onto the list, honestly.** At sign-up the person reads, under the button:

> We will email you a link to set a password. Tick the box and we will also send you a note when a new quiz or game is made — one tap to stop, any time.

and a single checkbox, **unticked**, labelled:

> Send me a note when something new is made.

Unticked, not pre-ticked. Two reasons, both practical rather than moral: Brevo suspends accounts over unconsented contacts and recovery is a support ticket, and a list full of people who never agreed is a list with a bad complaint rate. The owner still gets every account holder's address in his own Supabase table, which he owns outright and can export; what the tick governs is only whether Brevo may send them a campaign.

The tick is carried in `sessionStorage` and applied **after** the password is set, so only proved addresses reach the list:

```
POST /api/account/contact
  Authorization: Bearer <access_token>
  { }                                  ← no email in the body; the route asks Supabase whose token this is
→ route: GET https://<ref>.supabase.co/auth/v1/user   (apikey + the caller's bearer)
→ route: provider.subscribe({ email, source: 'account-signup' })
       POST https://api.brevo.com/v3/contacts
       { email, updateEnabled: true, listIds: [BREVO_LIST_ID],
         attributes: { SOURCE: 'account-signup' } }
```

The route never trusts an address from the body — that is how a subscribe endpoint becomes a spam cannon. `SOURCE` is a new text attribute rather than a second list, so the owner keeps one list to market to and can still segment. Plain `/v3/contacts`, never the double-opt-in endpoint: they have just proved the address by clicking a link, and a second confirmation email is friction the owner hates and a send off the 300/day pool.

On success, `profiles.marketing_opt_in = true` and `marketing_synced_at = now()`, so a later retry does not double-post and `/account/` can show the truth about what the site is doing with the address.

---

## 7. ABUSE AND FAILURE

**Rate limits in play.** Per-address 60s cooldown on `/otp` and `/recover` (`over_email_send_rate_limit`, 429). Per-IP 30 per 5 min on sign-up/sign-in and on `/verify`; 150 per 5 min on `/token`. Emails per hour: 30 after custom SMTP, raised to **40** in the owner's steps — high enough for a launch, low enough that a sustained attack takes most of a day to eat Brevo's 300.

**Our own controls.** The resend button is disabled for 60 seconds with a counting label, so the common case never sees a 429. Both forms carry the existing `hp` honeypot field (`name="website"`), which the site already uses on two forms. No CAPTCHA: the site has never had one, Brevo has treated reCAPTCHA v3 traffic as a bot attack in at least one reported case, and the top-level rules forbid solving them anyway. Turnstile is available on Supabase Free and is the lever to pull if abuse actually appears — it is one dashboard setting plus one `options.captchaToken`, held in reserve rather than shipped on day one.

**Enumeration.** Sign-up answers identically for known and unknown addresses, and both emails carry identical wording. Sign-in gives one message for both fields. No endpoint anywhere answers "does this address have an account". The residual `/recover` leak (supabase/auth #2702, `400 email_address_invalid` for an existing user) is upstream, unpatched, and accepted; it is a smaller leak than the one we would create by building reset on `signInWithOtp`.

**A paused free project.** This is the largest operational risk and it is not hypothetical on a low-traffic site: seven days of low activity and every request answers **HTTP 540**, so sign-in, sign-up and reset die at once for everyone, silently, and only a human clicking "Resume project" brings them back. Two defences:

1. `site/vercel.json` runs `/api/cron/keepalive` daily at 04:00 UTC (Hobby allows daily, ±59 minutes; anything more frequent fails the deployment). The route does one `select id from heartbeat limit 1` with the publishable key. It is unguarded by a secret on purpose — it reads one public row and saves the owner a third env var to paste — and it returns early unless the request looks like a cron or a manual check.
2. Every account page catches a 540 or a network failure and prints one honest state: *"Sign-in is not answering just now. Your results are safe on this device. Try again in a few minutes."* No stack trace, no spinner that never ends, and the rest of the site — every quiz, game and article — carries on working, because none of it depends on Supabase.

Supabase's docs neither bless nor forbid a keep-alive ping; one tiny request a day is not plausibly abuse, but it is an unwritten rule, and the owner should know that Pro at $25/mo is the guaranteed answer if the site ever matters enough.

**Brevo's 300/day** is one pool shared by account mail and campaigns. Past it, transactional mail goes to a retry queue capped at 1,000 and anything beyond is simply not delivered, with no signal in the app. The 40/hour Supabase cap bounds the sign-up side; the honest remaining gap is that a person waiting for a link during an exhausted day gets silence. The check-your-email panel therefore names the fallback out loud (*"If it has not arrived in ten minutes, ask for another one later"*) rather than insisting it was sent.

**Transactional sending must be activated by Brevo support** before any of this works at all. A brand-new account can add contacts through `/v3/contacts` — which is all the current code does — and still fail to send a single email, with `450 Your SMTP account is not yet activated` on the relay. It is the only step with a human queue, so it is step 1.

---

## 8. THE OWNER'S SETUP STEPS

**Twenty steps.** Steps 1 to 6 involve waiting (a support ticket, then DNS propagation), so they go first. Everything after step 11 is one dashboard.

**Brevo, first — it has the only human wait**

1. In Brevo, open a support ticket from inside the account asking to **activate transactional email sending**. Do this before anything else.
2. Settings → **Senders, Domains, IPs → Domains → Add a domain** → `wiserwalk.com` → choose **"Authenticate the domain yourself"** (manual). Never the automatic option: it offers to replace the DMARC record, and ours must survive. Copy the Brevo code and the DKIM values it shows.
3. SiteGround DNS: **ADD** the Brevo code TXT record at the root (`@`). If the editor refuses the value because it contains a colon, say so and stop.
4. SiteGround DNS: **ADD** Brevo's DKIM record exactly as shown (one TXT at `mail._domainkey`, or two CNAMEs at `brevo1._domainkey` / `brevo2._domainkey` — whichever the page gives).
5. SiteGround DNS: **EDIT** the one existing `_dmarc` TXT record to add a `rua` tag, so it reads `v=DMARC1; p=none; rua=mailto:dmarc@wiserwalk.com; aspf=r; adkim=r;`. **Do not add a second `_dmarc` record** — two of them break DMARC entirely. **Do not touch SPF or MX**: Brevo does not need them, and those are the mailboxes.
6. Back in Brevo → Domains → **Authenticate this email domain**. It can take up to 48 hours.
7. Brevo → Settings → Senders, Domains, IPs → **Senders → Add a sender**: name `Wiser Walk`, address `account@wiserwalk.com`. This address sends account mail and nothing else.
8. Brevo → Settings → **SMTP & API → SMTP tab → Generate a new SMTP key**. Choose **Standard** and **no expiration**. Copy the key, and copy the **SMTP login** shown on that page (it is usually not the account email).
9. Brevo → Contacts → Settings → **Contact attributes** → add a **Text** attribute named exactly `SOURCE`.
10. Brevo → Settings → Automations → Transactional emails → Tracking → set **Anonymous email tracking = Yes**.

**Supabase**

11. Create a Supabase account and a project. Pick a region near readers, save the database password somewhere safe. Note: the free plan allows **two active projects** in total. Copy the **Project URL** and the **publishable (anon) key** from Settings → API Keys.
12. Authentication → Emails → **SMTP Settings**: sender email `account@wiserwalk.com`, sender name `Wiser Walk`, host `smtp-relay.brevo.com`, port `587`, username = the SMTP login from step 8, password = the SMTP key from step 8. Save.
13. Authentication → **Rate Limits**: raise "emails sent per hour" from 30 to **40**.
14. Authentication → **URL Configuration**: Site URL `https://wiserwalk.com`. Redirect URLs: add `https://wiserwalk.com/**` and `http://localhost:4321/**`.
15. Authentication → Sign In / Providers → **Email**: check **Confirm email is ON**, set **minimum password length to 8**, and leave "Secure password change" **off**.
16. Authentication → Emails → **Templates**: paste the one subject and one body we supply into **all three** of Confirm signup, Magic link, and Reset password. They must be identical.
17. **SQL Editor** → paste the single SQL block we supply → Run. It should say success with no rows returned.

**Vercel**

18. Project Settings → Environment Variables → add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, with **both Production and Preview ticked**. (Preview too, or every preview of the branch has dead sign-in.)
19. Deployments → **Redeploy**. Environment variables only reach a *new* build; without this step nothing changes and it looks broken.

**Check**

20. Open `https://wiserwalk.com/account/sign-up/`, use a real address, confirm the email arrives from `account@wiserwalk.com` within a minute, set a password, sign out, sign in with the password. If the email does not arrive, look at Brevo → Transactional → Logs first.

Steps 5, 16 and 18 are the three most likely to go wrong, so each gets the exact string to paste and a picture-level description of where it goes in the README we write.

---

## 9. TEST PLAN

### Headless, in `site/scripts/auth-test.mjs`

Built the same way as `email-test.mjs`: esbuild-bundle the TypeScript, `import()` it, a `stub(handler)` that replaces `globalThis.fetch` and records url/init/body, `reply(status, body)`, numbered sections, `failures` counter, `rmSync` of the bundle, `process.exit(failures ? 1 : 0)`. Nothing touches the network and no test uses a real key.

1. **Merge, the whole of it** (`merge.ts` is pure, so this is the valuable half of the suite). Empty local + populated server. Populated local + empty server. The same quiz+code 12 seconds apart on two devices → one entry, the earlier `at` kept. The same quiz+code three weeks apart → two entries. A tombstone removes a local entry and the push does not re-add it. The order is newest-first after merging. 250 merged entries cap at `SHELF_CAP` and the count of what was dropped is reported, not silent.
2. **Game stat merge.** `best` takes the max in both directions and is idempotent when run twice. `canon` takes the later `updated_at`. `fooled` / `mix` / `seen` are refused by the v1 sync, deliberately, with a test that asserts they are refused — so nobody adds double-counting later by accident.
3. **The flag.** `markSignedIn` / `readFlag` / `clearSignedIn` against a fake store. An expired `exp` reads as signed out. Malformed JSON reads as signed out. A store that throws on every method is a no-op, never an error (copying `engine-test.mjs`'s always-throws store).
4. **Token reading.** `#token_hash=…&type=email`, `?token_hash=…`, both present, neither present, junk. Assert the token is never written into any outbound body we build and that the reader reports "no token" rather than throwing.
5. **The contact route's request.** Stubbed fetch: assert it calls `GET /auth/v1/user` with the caller's bearer **before** anything else, that the Brevo call uses `POST /v3/contacts` with the `api-key` header and the address from Supabase's answer (not from the request body — feed it a body with a different address and assert that address never appears), that `SOURCE: 'account-signup'` is present, and that no key appears in a URL. Assert 403 on a bad Origin and 401 when Supabase does not recognise the token.
6. **Unconfigured.** With the two `PUBLIC_` values empty, `ACCOUNTS_ON` is false, `getClient()` refuses rather than constructing a client against `undefined`, and `syncNow()` is a no-op.
7. **Error code to copy.** A table test over `otp_expired`, `over_email_send_rate_limit`, `over_request_rate_limit`, `weak_password`, `same_password`, `invalid_credentials`, `email_not_confirmed`, `signup_disabled`, plus an unknown code, asserting every one maps to a sentence and that the fallback is the site's existing *"That did not go through. Try again in a moment."* — so no raw provider text ever reaches a reader.

Wired into **both** `prebuild` and `test`, so a regression fails the Vercel build.

### Only against a real project

- That the three email templates actually point where we think, and that a brand-new address and a known address receive identical wording.
- That the mail arrives at all: transactional activation, domain authentication, DKIM alignment, and whether the "Sent with Brevo" sticker and the forced Unsubscribe header look acceptable on a password email.
- **Whether Brevo's link rewriter preserves the URL fragment.** One real send answers it. If it does not, the query-string fallback carries the flow and the fragment attempt is dropped. Nothing else in the design changes.
- That RLS actually isolates: sign in as user A, attempt to read and to write user B's rows through PostgREST, expect empty and denied. This is a ten-minute manual check in the SQL editor plus two browser calls, and it must be done before the first real sign-up, because RLS is the only boundary this lens has.
- That the two `auth.users` triggers fire and do not break sign-up if they error.
- That `delete_my_account()` works (the `SECURITY DEFINER` delete from `auth.users` is a widely-used community pattern, not a documented Supabase API) — and that after it, a still-valid JWT can no longer read anything.
- Whether `updateUser({ password })` terminates the initiating session; the docs list password changes as a termination trigger without saying whether the current session survives.
- Scanner behaviour, end to end, by mailing a link to a corporate address with a filter in front of it.
- The whole flow at 390px and 1360px, light and dark, captured with `sh design/tools/shot.sh` — the in-app browser pane cannot screenshot while hidden.

---

## 10. WEAKNESSES, HONESTLY

**1. Tokens in localStorage.** This is the clearest cost. An `httpOnly` cookie survives an XSS; a localStorage token does not. The site has almost no attack surface today — one third-party script, no user-generated content, no comments — but "almost none" is not "none", and the day someone embeds something, the whole account system is one injected script away. A cookie design (presumably Lens A's) is genuinely safer here.

**2. RLS is the only boundary, and the browser is a trusted writer.** A single mistyped policy — a missing `to authenticated`, a `using (true)` left in from a test — leaks every reader's history to every other reader, and there is no server layer that would catch it. Related: a signed-in person can write any `quiz` and `code` string they like into their own rows, because no server validates that a code decodes. The `CHECK` constraints and the 2,000-row trigger bound the damage to nonsense in their own account, but a thin server route that validated codes through `decodeFor()` before storing would be strictly better data hygiene. I would steal that.

**3. 56KB of SDK, and the first browser dependency in the project's life.** `package.json` has declared exactly three dependencies for nine months and has never shipped third-party JavaScript to a browser. Lazy-loading keeps it off the 95% of pages that never need it, but it is still 56KB gzipped on the account pages and on `/me/`, on a phone-first site whose whole aesthetic is that pages arrive instantly. Driving `/auth/v1` and `/rest/v1` by plain `fetch` would cost maybe 200 lines and zero dependencies — and would throw away automatic refresh, automatic session persistence, `onAuthStateChange`, and the one-line Google addition. This lens takes the dependency on purpose and admits the page weight.

**4. The fragment may not survive Brevo.** Brevo rewrites every link and cannot be told not to. I have designed for the failure (query-string fallback, immediate `replaceState`, `/account/` added to the analytics strip hook) but the clean version — a token that never touches a server log — is unproven until a real send is tested. If the fragment dies, tokens land in Vercel access logs, which is a real if modest regression against what `/method/` says about not joining views to identities.

**5. `delete_my_account()` is the one unblessed piece.** A `SECURITY DEFINER` function deleting from `auth.users` is common practice, not documented API, and Supabase's own guidance is not to depend on auth-schema internals. It buys something real — the owner pastes **two** keys instead of three, and no secret key exists anywhere in the deployment to leak — but if it misbehaves, the fallback is a server route with `SUPABASE_SECRET_KEY` (remembering that secret keys go on the `apikey` header, never `Authorization: Bearer`, and return 401 to anything with a browser user-agent).

**6. Free-tier pausing.** A daily cron on an undocumented-but-tolerated keep-alive is the whole defence against sign-in dying site-wide for everyone at once, with no alert and a manual click to recover. On a site with a handful of visitors a week, this is the failure most likely to actually happen, and it is the one the owner is least equipped to diagnose. Pro at $25/mo is the honest answer, and he should hear the number.

**7. The header flag can lie.** Up to 30 days stale on pages where the SDK never loads. The consequence is cosmetic — a dot — but a design that wanted the header to say "signed in as Alex" could not use it.

**8. Twenty setup steps, ten of them in Brevo.** Fewer than the alternatives, but still twenty chances to mistype, and three of them (the DMARC edit, the three identical templates, the Preview-as-well-as-Production tick) fail silently and look like the site being broken.

**What I would steal from the other lenses.** A server-verified session cookie for the header, if it can be had without un-staticking the site — that closes weakness 1 and 7 together. A thin validating write path for results — that closes weakness 2's second half without giving up RLS as the read boundary. And if either of them has found a way to cut the Brevo domain-authentication steps, take it; that is where most of the owner's twenty steps and all of his waiting live.