# Accounts: the build brief (binding for every builder)

Written 2026-09-21 by the main session after judging three designs (`design-*.md` in this folder) against
six research sheets (`research-*.md`, web-verified that day). Where this brief and a design disagree,
this brief wins. Where this brief is silent, follow `design-fewest-owner-steps.md` (called "C" below).

## What the owner asked for, in his words

Sign-up box asks for an EMAIL ONLY. The emailed link lands on a page where they SET A PASSWORD. After
that they sign in with email + password. "Forgot password" sends the same kind of link. Google later.
"Keep it simple and fool-proof." He wants the addresses for marketing. He rejects anything that feels
"like an afterthought rather than an integral feature", or clumsy on a phone.

## Decisions (settled; do not reopen)

1. **Session: `@supabase/supabase-js` 2.116 in the browser** (already installed), loaded ONLY by dynamic
   `import()` from `lib/account/client.ts`. Never imported statically by any page or by `Base.astro`.
   `createClient(url, key, { auth: { storageKey: 'ww.auth', persistSession: true, autoRefreshToken: true,
   detectSessionInUrl: false, flowType: 'implicit' } })`. No cookies, no middleware, no `@supabase/ssr`.
2. **We send the emails.** Supabase's Send Email hook POSTs to `/api/auth/email`; we verify the Standard
   Webhooks signature with `node:crypto` (no package), render the email from `lib/account/emails.ts`, and
   send it through `lib/email/send.ts`. No SMTP settings, no dashboard templates, no redirect allow list.
   The fallback (Supabase SMTP + one pasted template line producing the IDENTICAL link) is documented in
   the README, not built.
3. **Sender is pluggable.** `send.ts` exports `sendTransactional(env, msg)`. Provider by env, first match:
   `EMAIL_PREVIEW=1` -> console (logs, sends nothing, reports ok); `RESEND_API_KEY` -> Resend
   (`POST https://api.resend.com/emails`, `Authorization: Bearer <key>`, body `{from, to:[..], subject,
   html, text, reply_to?, tags:[{name,value}]}`, header `Idempotency-Key: <webhook-id>`, success = 200
   `{id}`); `BREVO_API_KEY` -> Brevo (`POST https://api.brevo.com/v3/smtp/email`, header `api-key`, body
   `{sender:{email,name}, to:[{email}], subject, htmlContent, textContent, tags:[..]}`, success = 201).
   From address: env `ACCOUNT_EMAIL_FROM`, default `Wiser Walk <account@wiserwalk.com>` (parse name and
   address for Brevo's shape). Deadline 3500 ms (the hook's whole budget is 5 s). Never throws. A key never
   appears in a URL, a body, a log line or an error message.
4. **The link**, one constant in `emails.ts`:
   `<origin>/account/password/?t=<token_hash>&k=<signup|magiclink|recovery>`. Query string on purpose (Brevo
   rewrites links and a fragment's survival is unverified). `<origin>` is the origin of the request that
   reached the hook IF its host is `wiserwalk.com`, ends in `.vercel.app`, or is `localhost`/`127.0.0.1`;
   otherwise `https://wiserwalk.com`. Every email also prints the six-digit `email_data.token` as `483 205`
   with the line telling them where to type it.
5. **`/account/password/` makes NO network call on load.** It reads `t`/`k` (query first, then fragment:
   `token_hash`/`t`, `type`/`k`), calls `history.replaceState` to clean the URL, shows the form. On submit:
   validate locally (>= 8 chars) -> `verifyOtp({token_hash, type: k==='recovery' ? 'recovery' : 'email'})`
   (on `otp_expired` with a guessed type, retry once with the other) -> `updateUser({password})` -> rpc
   `mark_password_set` -> first sync -> POST `/api/auth/list` (fire and forget) -> go to `/me/`. If
   `updateUser` fails after a good verify, NEVER re-verify: keep the session and retry `updateUser`.
   With no token it offers email + six-digit code (`verifyOtp({email, token, type:'email'})`) and "send me a
   new link". `<meta name="referrer" content="no-referrer">` on this page.
6. **Sign-up = `signInWithOtp({email})`** (creates the user; a known address gets the `magiclink` email,
   which our code words as "you already have an account"). **Forgot = `resetPasswordForEmail(email)`**,
   never `signInWithOtp({shouldCreateUser:false})` (leaks existence). No `emailRedirectTo`/`redirectTo` is
   sent anywhere. The site says the same neutral thing whether or not the address exists. Sign-out is
   `signOut({scope:'local'})`. One error sentence for both sign-in fields.
7. **Secret key on the server** (`SUPABASE_SECRET_KEY`, sent on the `apikey` header, NEVER as Bearer): used
   by the hook's log, the health checks and account deletion only.
8. **Env names (final):** `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_KEY` (the publishable key; referenced
   LITERALLY as `import.meta.env.PUBLIC_...` in `config.ts` so Vite inlines them), `SUPABASE_SECRET_KEY`,
   `SUPABASE_EMAIL_HOOK_SECRET` (stored in full, `v1,whsec_...`; strip the prefix before base64-decoding),
   `ACCOUNT_EMAIL_FROM` (optional), `RESEND_API_KEY` (optional), existing `BREVO_API_KEY`, `BREVO_LIST_ID`,
   `EMAIL_PREVIEW`. Server code reads env through the existing `readEnv(locals)`.
9. **Two switches.** `ACCOUNTS_READY` (both PUBLIC values present): false -> every `/account/*` page renders
   one calm "not switched on yet" band, the site is otherwise exactly as today, `/api/auth/email|list|delete`
   answer 503 `{ok:false,error:'Accounts are not switched on yet.'}`, `/api/auth/health` still works.
   `ACCOUNT_LINKS_LIVE` (a committed constant in `config.ts`, **false** for now): while false, NOTHING on the
   site links to `/account/*` and `/me/`, the header, the result page and the footer are exactly as today,
   even when `ACCOUNTS_READY` is true. It exists so the owner can test on the live domain at unlinked URLs
   before the public sees anything (Vercel previews are behind a login wall, so Supabase's hook can only
   reach production). Entry points = `ACCOUNTS_READY && ACCOUNT_LINKS_LIVE`, exported as `ACCOUNTS_VISIBLE`.
   For local screenshots a builder may temporarily run with
   `PUBLIC_SUPABASE_URL=https://example.supabase.co PUBLIC_SUPABASE_KEY=sb_publishable_demo` and may read a
   dev-only override `PUBLIC_ACCOUNT_LINKS=1` (honoured ONLY when `import.meta.env.DEV`).
10. **Data model:** C's `schema.sql` with these changes: `results` = `(user_id, quiz, code, taken_at,
    deleted_at null, created_at default now())`, PK `(user_id, quiz, code, taken_at)`; CHECKs
    `quiz ~ '^[a-z0-9-]{1,64}$'`, `code ~ '^[0-9A-Z.]{1,96}$'`; grants `select, insert` plus
    `update (deleted_at)`; a BEFORE INSERT trigger on `public.results` refusing past 2,000 live rows per user.
    `game_stats` keys allowed: all seven, but v1 writes only `sls.best`, `wsi.best`, `sls.canon`.
    `profiles(id, created_at, password_set_at, notes_off boolean default false, list_synced_at)`; no trigger
    on `auth.users`; `mark_password_set()` as in C. `auth_email_log` as in C (no address, ever). Idempotent.
11. **Sync:** `shelf.ts` stays the device's source of truth and `/me/` paints from it first, always. New pure
    export `mergeShelves(local, remote, tombstones)`; rule = union, drop anything matching a tombstone
    (same quiz+code, `at` within `SAME_RUN_MS` of the tombstone's `taken_at`), collapse same quiz+code within
    `SAME_RUN_MS` keeping the EARLIER, newest first, cap `SHELF_CAP`. Push what the server lacks with
    `resolution=ignore-duplicates`. Finishing a quiz: `addResult()` unchanged, then `queueResult()` pushes to
    `ww.acct.queue` (cap 50); a tiny IIFE in `Base.astro` flushes it ONLY when the hint key exists and the
    queue is non-empty (it dynamically imports `lib/account/sync.ts`; signed-out visitors pay nothing).
    "Clear my results" signed in: server FIRST (`deleted_at = now()` on all live rows), and only on success
    clear the device; the confirm and the button label say "everywhere". Games: on `/me/` load, `best` =
    max(local, remote) written both ways; `sls.canon` = later `updated_at` wins. Sync failures are silent.
12. **Header:** no new nav item on a phone (the row is measured and full). The existing `.nav-me` mark is
    the account's door. Pre-paint `is:inline` script reads `ww.acct.v1` (`{e, x}`) and sets
    `html[data-account="in"]`. ONE mark, ONE size, ONE fill: never a ring in one state and a fill in another
    (that is exactly what he rejected today as "weird outlines... different sizing/colors"). From 34rem up,
    and only when `ACCOUNTS_VISIBLE`, the mark may carry a text label: "Sign in" signed out, "My results" in.
13. **Marketing:** the line read BEFORE typing, on the sign-up form: "We will email you a link to set a
    password. We will also send you a note now and then when there is a new quiz, game or article. You can
    stop those at any time and keep your account." The contact is created only after the password is set,
    by `/api/auth/list` (verifies the bearer token with `GET /auth/v1/user`, takes the address FROM THE
    TOKEN, never from the body; existing `subscribe()` with attribute `SOURCE=account`; never double opt-in).
    `/account/` has an on/off control "Notes about new quizzes and games" (`profiles.notes_off` + list
    removal). Deleting the account (`/api/auth/delete`: verify token -> `DELETE /auth/v1/admin/users/<id>` ->
    remove the Brevo contact) really deletes everything, and the page says so in one line.
14. **Keep-alive:** `site/vercel.json` = `$schema` + one daily cron `GET /api/auth/health?ping=1` (a real
    PostgREST read plus trimming `auth_email_log` past 60 days). No `trailingSlash` key in that file.
15. **Honesty pages:** `/method/` "Your answers" currently says there is no account and nothing is stored on
    our side. It is rewritten in the same commit: quizzes are still scored in the browser and answers never
    leave it; what an account keeps is the result code, best scores, the address, dates; one button deletes
    it all. No process talk anywhere else. `/account/*` pages are `noindex`, out of the sitemap, and the
    analytics `beforeSend` hook blanks `search` and `hash` for any path starting `/account/`.

## The client contract (so page builders and the lib builder can work at the same time)

`site/src/lib/account/config.ts`
```ts
export const SUPABASE_URL: string; export const SUPABASE_KEY: string;
export const ACCOUNTS_READY: boolean; export const ACCOUNT_LINKS_LIVE: boolean; export const ACCOUNTS_VISIBLE: boolean;
```
`site/src/lib/account/session.ts` (pure, storage injectable like shelf.ts, never throws)
```ts
export const HINT_KEY = 'ww.acct.v1'; export const AUTH_KEY = 'ww.auth'; export const QUEUE_KEY = 'ww.acct.queue';
export function readHint(store?): { email: string } | null;
export function markSignedIn(email: string, store?): void; export function clearSignedIn(store?): void;
export function storedSession(store?): { accessToken: string; userId: string; email: string; expiresAt: number } | null;
```
`site/src/lib/account/client.ts` (browser; every function resolves, never rejects)
```ts
export type Done<T = {}> = ({ ok: true } & T) | { ok: false; code: string; say: string };
export function requestLink(email: string): Promise<Done>;          // sign-up box
export function requestReset(email: string): Promise<Done>;         // forgot password
export function finishWithToken(a: { tokenHash: string; kind: string; password: string }): Promise<Done>;
export function finishWithCode(a: { email: string; code: string; password: string }): Promise<Done>;
export function signIn(email: string, password: string): Promise<Done>;
export function signOut(): Promise<Done>;
export function whoAmI(): Promise<{ email: string; passwordSet: boolean; notesOff: boolean } | null>;
export function changePassword(current: string, next: string): Promise<Done>;
export function setNotes(on: boolean): Promise<Done>;
export function deleteAccount(): Promise<Done>;
export function sayFor(code: string): string;                        // error code -> house-voice sentence
```
`say` is always a finished plain sentence a page can print as is. Codes pages may branch on:
`expired`, `cooldown`, `busy`, `weak`, `same`, `wrong`, `unconfirmed`, `offline`, `off`, `paused`, `unknown`.
`site/src/lib/account/sync.ts`
```ts
export function syncNow(): Promise<{ ok: boolean; changed: boolean; serverTotal?: number }>;
export function queueResult(e: { quiz: string; code: string; at: string }): void;   // sync, storage only
export function flushQueue(): Promise<void>;
export function clearEverywhere(): Promise<Done>;
export function removeEverywhere(e: { quiz: string; code: string; at: string }): Promise<Done>;
```

## House rules every builder follows

- Opus builders; do NOT commit, push, or run `git` commands that change anything. Stay inside the files you
  own; if you need a change in someone else's file, write it under "NEEDS" in your final report.
- Match the codebase's idiom: comment density and voice (see `shelf.ts`, `provider.ts`, `subscribe.ts`),
  plain `fetch`, no new dependencies, no test framework (tests follow `site/scripts/email-test.mjs`).
- Copy is plain, warm, British spelling, no em dashes, no emoji, no "faith" as a noun for the site, never the
  phrase "magic link", no process talk. No one-word last lines. Buttons, not tiny links, on a phone; the
  main action above the fold at 390 px.
- `textContent`/`createElement` only in account pages; never `innerHTML`/`set:html` with anything dynamic.
- Never put backticks inside a double-quoted bash string.
