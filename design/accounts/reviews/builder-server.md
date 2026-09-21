# server

## files
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/account/hook.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/account/emails.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/account/checks.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/email/send.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/email/provider.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/api/auth/email.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/api/auth/health.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/api/auth/list.ts
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/api/auth/delete.ts
- C:/Users/Light/Desktop/claude/theology compass/site/vercel.json
- C:/Users/Light/Desktop/claude/theology compass/site/scripts/auth-test.mjs
- C:/Users/Light/Desktop/claude/theology compass/site/scripts/email-test.mjs

## needs
- site/package.json — add `node scripts/auth-test.mjs` to BOTH `prebuild` and `test`. Design C asks for this and I do not own the file; `email-test.mjs` is in `test` only and so has never gated a deploy. (Another builder has also added scripts/account-test.mjs, so both need wiring.) Why: without it a regression in the hook signature or the email copy ships to production unnoticed.
- site/src/lib/account/schema.sql — `auth_email_log` must be exactly `(webhook_id text primary key, at timestamptz not null default now(), action text not null, ok boolean not null, detail text)`, with NO policies (secret key only). My hook upserts with `?on_conflict=webhook_id` and `Prefer: resolution=merge-duplicates,return=minimal`, and health.ts trims with `DELETE ...?at=lt.<iso>`. Why: the dedupe that stops a Supabase retry sending a second email depends on that primary key.
- site/src/lib/account/schema.sql — `profiles` must carry `list_synced_at timestamptz` and `notes_off boolean not null default false`, and `profiles.id` must be the auth user id (my /api/auth/list PATCHes `?id=eq.<user id>`). Why: the notes toggle stamps list_synced_at with the secret key and the setup story assumes it exists.
- site/src/lib/account/client.ts — `setNotes(on)` should POST `/api/auth/list` with `Authorization: Bearer <access token>`, `content-type: application/json` and body `{"on": true|false}`; `deleteAccount()` should POST `/api/auth/delete` with the same Authorization header and no body. Both are same-origin checked, so they must be called from a page on the site, not from a worker or a different origin. Neither route reads an address from the body; it comes from the token. Why: if the client sends the address in the body it will be ignored, silently.
- site/src/lib/account/client.ts — the client (not my route) must write `profiles.notes_off` itself, as the authenticated user, using the column grant. /api/auth/list deliberately writes only `list_synced_at`, which the user may not write. Why: splitting it the other way would need the secret key to trust a body value.
- site/src/pages/account/setup.astro — render `GET /api/auth/health`, which returns `{ ok, at, checks: [{ step, name, state: 'ok'|'todo'|'bad', say }] }`. `say` is a finished sentence to print as is; do not rewrite it or add process talk around it. The step numbers refer to design C section 8 (5 sending, 8 project, 10 tables, 13 hook, 15 keys, 17 redeploy). Why: if account/README.md renumbers the steps, the numbers my checks print will point at the wrong instruction.
- site/src/lib/account/README.md — the owner must add a Text contact attribute named `SOURCE` in Brevo (Contacts, Settings, Contact attributes) or Brevo silently drops it, and must have transactional sending activated by Brevo support before any sign-in email can go out. The From address defaults to `Wiser Walk <account@wiserwalk.com>` and is overridable with `ACCOUNT_EMAIL_FROM`; my sender check looks for exactly that address among Brevo's verified senders.
- site/astro.config.mjs — confirm the sitemap filter and any robots rule exclude `/api/auth/`; I did not touch that file.

## tests
- cd "C:/Users/Light/Desktop/claude/theology compass/site" && node scripts/auth-test.mjs  ->  'auth: all checks passed' (295 assertions, 9 sections)
- cd "C:/Users/Light/Desktop/claude/theology compass/site" && node scripts/email-test.mjs  ->  'email: all checks passed' (existing 9 sections plus 4 new ones I added)
- cd "C:/Users/Light/Desktop/claude/theology compass/site" && node scripts/engine-test.mjs  ->  'All engine checks passed' (run only to confirm I had not broken it; it is not my area)
- cd "C:/Users/Light/Desktop/claude/theology compass/site" && ./node_modules/.bin/tsc --noEmit --strict --skipLibCheck --module esnext --target es2022 --moduleResolution bundler --types node,astro/client <my 8 .ts files> + src/pages/api/subscribe.ts  ->  no output, clean
- sh design/tools/shot.sh -m <rendered signup email> ... 660 390  and  sh design/tools/shot.sh ... 720 620  ->  looked at both captures; the email renders correctly at a true phone width and at desktop

## notes
WHAT IS BUILT

hook.ts — Standard Webhooks verification on node:crypto, no package. Strips `v1,` then `whsec_`, base64-decodes, HMAC-SHA256 over `<id>.<timestamp>.<body>`, timingSafeEqual, 5-minute tolerance either side, several space-separated signatures accepted (so a rotated secret works), non-v1 entries ignored. Plus `readPayload`, which refuses a shape it does not recognise rather than guessing. The test verifies against the PUBLISHED Standard Webhooks vector (secret whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw, id msg_p5jXN8AQM9LWM0D4loKWxJek, ts 1614265330), which I recomputed independently before committing to it — so the code is checked against the spec, not against itself.

emails.ts — one renderer per action, `null` for anything else. Link constant is `<origin>/account/password/?t=<token_hash>&k=<kind>`, query string, `&` written as `&amp;` in the href (valid HTML; the plain-text part carries the bare URL). Origin rule as the brief states: wiserwalk.com / www / *.vercel.app / localhost / 127.0.0.1, https required except locally, everything else falls back to https://wiserwalk.com. Code printed as `483 205` on its own line in serif. HTML is table-free, inline styles only, 520px, gradient rule #7EBAEE→#F0A06F with a solid #7ebaee fallback, solid #444444 bulletproof button (white on a blue-to-orange gradient would be unreadable where the gradient DOES render, so the gradient is the rule and the button is ink). Asserted: no "{{", no "faith", no "magic link", no em dash, no emoji, and EXACTLY ONE href in the whole message.

One copy adjustment I made on my own judgement: design C's sentences say "the button below", which is wrong in the plain-text part where there is no button. Each line can now carry a text variant, and the three affected lines say "the link below" in text. Everything else is C section 6.3 verbatim.

checks.ts — eight checks, each `(fetch, env) => {step, name, state, say}`: website keys, secret key (catches the publishable key pasted into the secret slot), hook secret, project liveness (540 → "paused ... press Resume project"), tables (404/PGRST → "SQL Editor, paste, Run"), whether the hook has ever fired and whether the last one went, sending (Brevo /v3/senders, detects "no verified sender for the address we send from" without ever printing the address), and the build-versus-runtime gap that means "press Redeploy". Asserted: with every key and address set, the whole JSON output contains none of them.

checks.ts also holds three things that are not checks: `accountsReady`, `sameOrigin` and `whoIs`/`bearerFrom`. I put them there rather than duplicating them across list.ts and delete.ts — a security check written twice is a security check that drifts. Flagging it because the brief described checks.ts as health checks only; move them if you would rather they lived elsewhere.

send.ts — `sendTransactional(env, msg)`, console / Resend / Brevo in that order, 3500ms deadline, never throws. Resend carries `Idempotency-Key: <webhook-id>`. A failure detail is a status plus the PROVIDER'S OWN ERROR WORD only (`account_under_validation`, `not_enough_credits`), never the provider's message, because that message routinely quotes the recipient address and the log it lands in must hold no addresses.

provider.ts — `postJson` exported (send.ts reuses it, so there is one deadline, not two); `Subscription.source` → attribute `SOURCE`; `removeFromList` (POST /v3/contacts/lists/<id>/contacts/remove) and `deleteContact` (DELETE /v3/contacts/<escaped address>) added to the EmailProvider interface. Brevo implements both; the console provider logs; MailerLite returns an honest "cannot remove contacts" rather than a fake success, since deleting there is untested and this site does not run on it.

Routes — all four `prerender = false`, the same json() helper, `cache-control: no-store`, `ALL` → 405 with an `allow` header. email.ts is authenticated by signature alone (no origin check); list.ts and delete.ts both do their own same-origin check, because Astro 5.18.2's checkOrigin lets a JSON POST through from anywhere. Both take the address AND the user id from `GET /auth/v1/user`, never from the body — asserted with a test that sends a different address in the body and checks the token's address is the one used. The secret key always rides on `apikey`, never as a bearer — also asserted.

email.ts budget: 503 if unconfigured or no hook secret; 401 on a bad or missing signature with ZERO sends; dedupe read 500ms fail-open; send 3500ms; log write 500ms. Worst case about 4.5s inside Supabase's 5s. Provider 5xx or timeout → 503 (Supabase retries 429/503); permanent refusal → 200 plus a log row ok=false; unhandled action → 200 plus a log row naming the action. Same webhook-id twice sends once (tested).

vercel.json is $schema plus the one daily cron at `/api/auth/health?ping=1`, 05:00 UTC. No trailingSlash key.

UNVERIFIED, PLEASE WEIGH

1. `DELETE /auth/v1/admin/users/<id>` is sent with `apikey: <secret>` and NO Authorization header, per the brief and the platform research. I could not test that against a real project. If GoTrue's admin routes still want the role in Authorization, account deletion will 401 and my route will correctly report "This is our fault, not yours. Nothing was deleted." It is a one-line fix if it turns out to need both headers.
2. Vercel cron paths with a query string: I believe `"/api/auth/health?ping=1"` is accepted, but Vercel's published schema only says the path must start with "/". If a deployment ever fails on it, move the ping to its own path.
3. Whether Astro's build inlines `import.meta.env.PUBLIC_SUPABASE_URL` in the SERVER bundle. health.ts reads those two literally to detect the redeploy gap. If Vite does not substitute them there, both read as empty and the check says "press Redeploy" forever rather than going green. The test substitutes them with esbuild's `define`, which is the same mechanism but not the same build. Worth one look at a real deployed `/api/auth/health`.
4. Brevo rewrites every link, so whether the query string survives its redirector is still the open question the design names. The six-digit code is in every email precisely because of it.
5. I did NOT run `astro build`. Four other builders are writing pages in this tree right now and a failure would have told me nothing about my files. Instead: every module bundles cleanly through esbuild in the test, and all eight files typecheck under strict mode with astro/client types.
6. `/account/setup/` and `/api/auth/health` are public URLs. They reveal configuration state (paused, keys missing, sender unverified) but never a key, an address or a count. That is the design's intent; saying so plainly in case it should be gated later.