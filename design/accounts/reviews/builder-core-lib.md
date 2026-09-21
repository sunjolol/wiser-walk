# core-lib

## files
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\config.ts
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\session.ts
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\client.ts
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\sync.ts
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\merge.ts
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\account\schema.sql
- C:\Users\Light\Desktop\claude\theology compass\site\src\lib\shelf.ts
- C:\Users\Light\Desktop\claude\theology compass\site\scripts\account-test.mjs

## needs
- site/package.json — add `node scripts/account-test.mjs` to the `test` script, and to `prebuild` if it should gate the Vercel deploy (email-test.mjs is in `test` only, so it never runs on Vercel). The file is already modified by another builder, so I left it alone.
- site/src/pages/api/auth/list.ts — client.ts POSTs `{ "notes": true|false }` with `Authorization: Bearer <access token>` and `content-type: application/json`, from two places: once after a password is set (notes true) and again whenever `/account/` toggles the control. The route needs to add the contact when notes is true and remove it when false, still taking the address FROM THE TOKEN and never from the body. It is also the natural place to write `profiles.list_synced_at` with the secret key (the user has no grant on that column).
- site/src/pages/api/auth/delete.ts — client.ts POSTs an empty `{}` body with `Authorization: Bearer <access token>`. It treats any non-2xx as a failure and only then clears the device, so the route must answer 2xx only when the user is really gone.
- site/src/pages/method.astro — the localStorage disclosure needs one more key: `ww.acct.games`, a small record of what this device last agreed with the account about each game figure (see the note below on why it exists). `ww.acct.v1` and `ww.acct.queue` also belong in that list.
- site/src/pages/me.astro — `removeEverywhere({ quiz, code, at })` is built and tested but has no caller. If /me/ ever grows a per-result delete, that is the function; it marks the row server-side first and only then takes it off the device.

## tests
- cd site && node scripts/account-test.mjs — PASSED (exit 0), 10 sections, 0 failures
- cd site && node scripts/build-data.mjs && node scripts/engine-test.mjs — PASSED (exit 0), all engine checks including section 17 (the shelf)
- cd site && node scripts/email-test.mjs — PASSED (unchanged, run to confirm my shelf.ts edit broke nothing next door)
- cd site && node node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck --target es2022 --lib es2022,dom --module esnext --moduleResolution bundler .astro/types.d.ts src/lib/account/{client,sync,session,merge,config}.ts src/lib/shelf.ts — clean, no errors
- cd site && esbuild bundle of src/lib/account/client.ts for platform=browser with the SDK NOT external — builds, 373 KB minified with the SDK inlined (esbuild has no code splitting with a single outfile; Rollup/Vite will split the dynamic import into its own chunk, which is the point of it being dynamic)

## notes
CONTRACT: implemented exactly as the brief names it. config.ts (SUPABASE_URL, SUPABASE_KEY, ACCOUNTS_READY, ACCOUNT_LINKS_LIVE, ACCOUNTS_VISIBLE), session.ts (HINT_KEY/AUTH_KEY/QUEUE_KEY, readHint, markSignedIn, clearSignedIn, storedSession), client.ts (Done, requestLink, requestReset, finishWithToken, finishWithCode, signIn, signOut, whoAmI, changePassword, setNotes, deleteAccount, sayFor), sync.ts (syncNow, queueResult, flushQueue, clearEverywhere, removeEverywhere). I checked every call site other builders have already written (Base.astro, me.astro, q/[quiz].astro, r/[quiz]/[code].astro, account/sign-up.astro) and all of them match.

EXTRA EXPORTS, beyond the contract, all documented in the files: config.MIN_PASSWORD (8, so a page's own local check uses the same number); client.codeFor (pure, exported so the error mapping can be tested on its own); client.currentToken (for sync.ts's refresh path only); merge.ts's whole surface (GAME_KEYS, SYNCED_GAME_KEYS, SEEN_CAP, mergeGame, sameJson).

TWO EXTRA ERROR CODES: `nosession` (nobody signed in on this device) and `address` (that is not an email address). Neither is in the brief's branchable list, because neither comes from Supabase. Both carry a finished `say`, so a page that only prints `say` is correct without knowing them.

DECISIONS I TOOK, each because the brief left the choice open:
- mergeShelves collapses a same-run duplicate to the EARLIER save, per the brief. Design C's text described a newest-first walk, which would keep the later one; the brief wins and the test asserts the earlier.
- The tombstone window uses the same strict `< SAME_RUN_MS` as the collapse rule, so two entries that would collapse into one are also both killed by a tombstone for either. Making the two windows agree is the only way the rules cannot contradict each other.
- syncNow reads live rows and tombstones as two parallel GETs, so `Prefer: count=exact` can count live rows only. Tombstones are capped at the 200 most recent — after a "clear everywhere" the asking device is cleared too, so the long tail has nothing left to resurrect.
- `serverTotal` = the Content-Range count plus the rows just pushed, so /me/ does not understate the account by whatever it uploaded a moment ago.
- The header hint is `{ e, x }` with x = epoch SECONDS at which it goes stale, sixty days out, rewritten forward by every successful sync. storedSession returns `expiresAt` in epoch MILLISECONDS, so it compares straight against Date.now().
- NEW LOCALSTORAGE KEY `ww.acct.games`: the games write a bare number with no timestamp, so "later updated_at wins" for sls.canon is unanswerable on the device side. This key records the value and time this device last settled on per key; if what is in storage differs from it, the reader changed it here and it is as new as it gets. Without it the choice is "local always wins" (another device's choice never propagates) or "remote always wins" (the reader's fresh choice gets stomped). Needs adding to /method/.
- whoAmI and setNotes distinguish "the server said no" from "the request never arrived": a dead network does not clear the header hint, or the mark flickers every time someone goes through a tunnel.
- setNotes uses UPDATE, not upsert, because only `insert (id)` is granted on profiles. The row is created by mark_password_set() when the password is set, so it exists in practice; if it somehow does not, the update affects zero rows and reports no error.
- deleteAccount clears the device too (shelf, hint, queue), because the page says it deletes everything.
- sync's injectable deps are an optional TRAILING argument, matching shelf.ts's store-as-last-argument idiom. Production callers pass nothing.

UNVERIFIED, and I want this said plainly:
- NOTHING here has been run against a real Supabase project. Every test drives a fake fetch and a fake storage object. verifyOtp, updateUser, the mark_password_set rpc, RLS, the upserts and the PATCH tombstones are all unexercised against a live server. The request SHAPES are asserted (URL, on_conflict target, Prefer, both headers, bodies); whether Supabase likes them is not.
- schema.sql has never been run against Postgres. I re-read it against the checklist: every policy is `to authenticated` and wraps `(select auth.uid())`; `password_set_at` and `list_synced_at` are unwritable because only `select`, `insert (id)` and `update (notes_off)` are granted; the row-cap trigger is BEFORE INSERT on public.results, security definer, `set search_path = ''`, and touches nothing sign-up does. It is still unrun SQL.
- I did not run `astro build`. Four other builders are mid-write in the same tree and a failure would have been theirs as often as mine. I type-checked my six modules with tsc under --strict instead (clean) and bundled client.ts for the browser to prove every import resolves.
- The 540 "paused project" mapping is from the research sheet, not observed.
- shelf.ts gained mergeShelves and nothing else: +53 lines, 0 deletions, no existing function touched. Every engine check still passes.