# Accounts: fix round 1 (rulings by the main session, 2026-09-21)

Three adversarial reviews are in `design/accounts/reviews/review-*.md` (S = security, F = flow-correctness,
C = copy-and-honesty; numbers are the finding numbers in those files). Every finding was read and ruled on
below. "AS WRITTEN" means apply the reviewer's fix. The brief (`BUILD-BRIEF.md`) still binds, except where
this file changes it.

## Changes to the brief (contract changes every fixer must know)

K1. `whoAmI()` now resolves to `{ email, passwordSet, notesOff } | null | 'unreachable'`. `null` means the
    server says nobody is signed in (clear the hint). `'unreachable'` means the request never arrived or the
    project answered 5xx/540 (keep the hint; pages stay in the signed-in state with one quiet line).
K2. New in client.ts: `finishWithSession(password): Promise<Done>` = the tail of finish (updateUser -> rpc
    mark_password_set -> markSignedIn -> syncNow -> tell the list) on the session already stored.
K3. New in config.ts: `IS_PREVIEW: boolean`, true only in a Vercel PREVIEW build. It comes from a Vite
    `define` in `site/astro.config.mjs`: `vite: { define: { __WW_VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV ?? '') } }`
    and config.ts reads `typeof __WW_VERCEL_ENV__ !== 'undefined' && __WW_VERCEL_ENV__ === 'preview'` (declare
    the global for TypeScript; tests must still run where it is undefined).
    `ACCOUNTS_VISIBLE = ACCOUNTS_READY && (ACCOUNT_LINKS_LIVE || IS_PREVIEW || (DEV && PUBLIC_ACCOUNT_LINKS==='1'))`.
    Why: the owner can log in to Vercel and review the public entry points on a preview, while production
    shows none until the constant is flipped.
K4. A SIGNED-IN browser sees the account regardless of `ACCOUNT_LINKS_LIVE`: whatever is shown only to
    signed-in people (the signed-in panel and sync on /me/, the queue flush in Base.astro) is gated on
    `ACCOUNTS_READY` + `html[data-account="in"]`, NOT on `ACCOUNTS_VISIBLE`. What is shown to signed-OUT
    people (the header label, the /me/ invitation, the result-page button) stays gated on `ACCOUNTS_VISIBLE`.
    Why: the owner must be able to test the whole signed-in experience on the live domain before launch.
K5. The email link origin rule drops `.vercel.app` entirely (S7): exact `wiserwalk.com`, `www.wiserwalk.com`,
    `localhost`, `127.0.0.1`; anything else -> `https://wiserwalk.com`. Add the test that `evil.vercel.app`
    falls back. (Previews are behind Vercel's login wall, so the hook can never be called there anyway.)

## LIB fixer owns: site/src/lib/account/{client,sync,session,merge,config}.ts, schema.sql, site/scripts/account-test.mjs, site/astro.config.mjs (ONLY the vite.define of K3)

- K1, K2, K3 as above, with tests.
- S2 AS WRITTEN and further: trigger `before insert or update`, counts ALL of the user's rows (no deleted_at
  filter); `grant insert (user_id, quiz, code, taken_at) on public.results`; keep `grant update (deleted_at)`.
  Add `grant insert (id, notes_off) on public.profiles` for F9.
- F3/C5: `deleteAccount()` also removes all seven game keys (GAME_KEYS), `ww.acct.games`, `ww.acct.synced`.
- F9: `setNotes` becomes an upsert (`POST profiles?on_conflict=id`, `Prefer: resolution=merge-duplicates,return=minimal`, body `{id, notes_off}`).
- F11: codeFor treats messages matching /importing|dynamically imported|loading chunk/i as `offline`.
- F12: a message containing "paused", or status 540, is `paused`.
- F13: `serverTotal` is the server's own count and nothing added to it.
- F14: flushQueue drops the queue on a 4xx other than 401/403/408/429. syncNow exposes `full: true` when the
  server refused for the row cap so /me/ can say so once.
- C7: deleteAccount returns the route's own `error` sentence as `say` when the route sent one.
- C8: when the route answers `{ ok:true, listRemoved:false }`, deleteAccount resolves
  `{ ok:true, listRemoved:false }` so the page can say the true thing.
- C9: the `cooldown` sentence: "Give it a minute before asking again. If an email was sent, it is in your inbox by now."
- C10: keep `type:'email'` for the six-digit code, retry once with `'recovery'` on failure exactly as the token
  path does, and correct the comment (the research says `email` resolves both columns).
- C11: syncNow clears the signed-in hint (clearSignedIn) when the server answers 401 to the user's token AFTER
  a refresh attempt; never on a network failure or 5xx.
- C12: export `countResults(): Promise<number | null>` (the server's live-row count) for /account/.

## SERVER fixer owns: site/src/lib/account/{hook,emails,checks}.ts, site/src/lib/email/{send,provider}.ts, site/src/pages/api/auth/*.ts, site/scripts/auth-test.mjs, site/scripts/email-test.mjs

- K5 with its test.
- S5/F1 ruling: the report stays public (the owner needs it BEFORE anything works) but: (a) the report
  response carries `cache-control: public, s-maxage=120, max-age=0` so a loop cannot fan out to Supabase and
  the sender; (b) no timing finer than "today / in the last week / not yet" and never the log's `detail`;
  (c) `?ping=1` stays `no-store`, does its one read, trims `auth_email_log` past 60 days AND deletes
  `results` tombstones older than 90 days, and is throttled in memory to one real run per 10 minutes per
  instance (answer 200 `{ok:true, skipped:true}` otherwise). If env `CRON_SECRET` is set, the ping requires
  `Authorization: Bearer <CRON_SECRET>` (Vercel sends it on cron calls) and answers 404 without it.
- S6 AS WRITTEN: checkProject never sends the secret key.
- F4 AS WRITTEN: alreadySent deadline 250 ms; after the send resolves, record() is given at most 150 ms
  (Promise.race) and the response is written regardless.
- C8: delete.ts keeps answering `{ ok:true, listRemoved }`; make sure `listRemoved` is false when no list
  provider is configured or the removal failed, true only when it really went.
- Emails: nothing in any email states a subject the site repeats elsewhere (see C4 below), and the magiclink
  email's button text stays "Choose a new password".
- S1 ruling: no code change; the README carries it (docs fixer).
- S3 ruling: no CAPTCHA at launch (another account for the owner to make); the README keeps the hourly email
  ceiling low instead, and names Turnstile as the switch to reach for if sign-up is ever abused.

## PAGES fixer owns: site/src/pages/account/*.astro, site/src/components/AccountBand.astro, site/src/styles/pages/account.css

- F6: password.astro stores the token and kind in sessionStorage (`ww.acct.link`) BEFORE `replaceState`, reads
  it back when the URL has none, and removes it on success and when the server says the link is spent.
- F7 + K2: on load with NO token anywhere: if `storedSession()` is present and fresh, call `whoAmI()`; when it
  answers `passwordSet === false`, show the choose-a-password form wired to `finishWithSession`; when
  `passwordSet === true` go to `/account/`; otherwise the six-digit-code state as now. (A link with a token
  still makes no network call on load.)
- F5 + K1: /account/ stays in the signed-in state on `'unreachable'` with one quiet line:
  "We could not reach your account just now. What you see here may be out of date."
- F8/C4 AS WRITTEN by C4: check-email shows one row, `From` `Wiser Walk`, no address and no subject; the
  paragraph: "If it is not there in a minute, look in your spam folder. The subject line is about your
  password. The email has a six-digit code in it too, for anybody whose button will not open."
- C20: check-email's lede: "If that address is right, a link should reach it within a minute. It works for an
  hour, and only once." The same sentence wherever sign-up or forgot print it.
- C13: `k=magiclink` gets its own head: "Choose a *new password.*" with the lede "You already have an account.
  This replaces the password you had."
- C14: expired lede: "Links work for an hour, and only once. Ask for a new one below."
- C6: /account/ fine print: "Games keep your best score, and which Bible you chose in Sounds Like Scripture."
- C12: "Results saved" on /account/ comes from `countResults()`; until it answers the row shows nothing
  (not a dash: C22), and on null it shows the device's count labelled "on this device".
- C22: no em dash placeholder; the password row is empty until whoAmI answers.
- C8: after deleting, when `listRemoved === false`, show before leaving: "Your account is gone. We could not
  take your address off our email list just now. The unsubscribe link in any email from us will do it."
- C5: the delete room and its confirm now tell the truth because the lib fixer clears the game keys; keep the
  wording "from our side and from this device" and make the confirm match the room word for word.
- DESIGN (main session, from the captures): setup.astro's badges print README step numbers, so the list
  reads 15, 15, 13, 8, 10, 13: that looks broken. Replace the badge with ONE consistent state mark per line
  (same size, same stroke, same position; done / to do / needs a look distinguished by the mark and one
  calm colour each, never by mixing outlines and fills), order the lines in the order he does them, put the
  state word on its own line under the name so it never wraps mid-phrase, and name the step in words inside
  the sentence ("step 12 of the instructions"). Env names go in `<code>` that may break anywhere
  (`overflow-wrap:anywhere`) so they do not force ragged short lines. Also tighten the reserved status space
  under the toggle and the buttons on /account/ (keep the space reserved, but no more than one line high).
- Retake every capture you change at 390 (-m) and 1360, light and dark, LOOK at them, fix what is wrong.
  Dev server on port 4391 with the demo env, stopped afterwards. Do not delete anybody else's captures.

## INTEGRATION fixer owns: site/src/layouts/Base.astro, site/src/pages/me.astro, site/src/styles/pages/me.css, site/src/pages/r/[quiz]/[code].astro, site/src/pages/method.astro, site/src/pages/about.astro, site/src/components/EmailCapture.astro (C24 only), site/src/pages/q/[quiz].astro

- K4: restructure the gates as described. With NO account env the built /me/, header and result page must
  stay byte-for-byte what they are today (prove it: build and diff against `git stash`-free means, e.g. build
  the current tree with no env and compare `dist/me/index.html` and `dist/index.html` to a build of
  `git worktree add --detach <tmp> origin/main`; remove the worktree afterwards).
- S4/F2/C3 AS WRITTEN: /me/ stores `ww.acct.to` in sessionStorage and goes to `/account/check-email/` with no
  query. The no-script GET fallback may stay (it has a consumer) but post to `/account/sign-up/` only.
- C17: the signed-out panel's heading: "Keep your results for good." when the shelf is empty,
  "Keep them for good." only when there is something on it.
- C18: signed-in line: "Saved to your account just now." / "Saved to your account today at 14:32." (both with
  a full stop). Never the word "synced" in front of a reader.
- C19: the /me/ button reads "Email me a link", the same as /account/sign-up/.
- C21: the result-page button reads "Keep it on every device".
- C15: /method/: say the true thing once: clearing removes them from My results on every device you use; a
  cleared result leaves only a marker (which quiz, which code, when) so your other devices drop it too, and the
  marker is erased after ninety days or when you delete your account, whichever comes first.
- C24: EmailCapture.astro's three reader-facing em dashes become full stops or commas. Nothing else there.
- F14: /me/ says once, quietly, when `syncNow()` reports `full`: "Your account is full. New results are kept
  on this device only."
- The 23 captures of /me/ (three states), the header and the result page were deleted by accident: retake
  them into `design/accounts/captures/integration/` at 390 (-m) and 1360, light and dark, with the demo env +
  `PUBLIC_ACCOUNT_LINKS=1`, plus the NO-env captures, and LOOK at them. Dev server on port 4392, stopped
  afterwards. Do not delete anybody else's captures.

## DOCS fixer owns: site/src/lib/account/README.md, site/src/lib/email/README.md

- C1 BLOCKER AS WRITTEN: redeploy BEFORE reading the setup page; say which one line cannot pass until his
  first real sign-up. Re-count the steps and fix the count at the top.
- C2: the rate-limit step as the reviewer rewrote it, but the number is **30**, not 100 (S3), and the text says
  plainly that it is unknown whether this limit applies while the Send Email hook is on, so the first real
  test includes: sign up with three different addresses inside one hour; if the third gets no email, this
  limit is the reason.
- S1: the sender choice now says why Resend is recommended in one more plain sentence: Brevo's free plan
  passes every link through its own tracking address AND keeps a record of the links people clicked, and the
  link in these emails is what lets someone set a password, so with Brevo the Brevo key must be guarded like
  a password. If he still chooses Brevo: make a Brevo key used for nothing else.
- K3/K4: explain the rollout in plain words: (1) the code goes live hidden; (2) he tests at the unlinked
  pages on wiserwalk.com; once he is signed in, /me/ shows him the signed-in experience although nobody else
  can see any of it; (3) he can look at what signed-out visitors WILL see on the Vercel preview of the
  branch; (4) he says go and the links are switched on.
- C16: describe the setup page truthfully: it runs eight checks on what a page can see, and cannot see the
  DNS records, Resend's domain verification, the Site URL, the minimum password length, the rate limit, or
  whether the hook is enabled; those are confirmed by the first real sign-up.
- C23: quote the site's real labels ("Forgotten your password?").
- Add `CRON_SECRET` as an OPTIONAL step with one sentence on what it protects.
- The Resend figures were verified live by the main session on 2026-09-21 (resend.com/pricing: 3,000 emails a
  month, 100 a day, 3 domains on the free plan; API `POST https://api.resend.com/emails`, Bearer key;
  subdomain recommended; open and click tracking are optional settings he should leave off). Say so.
