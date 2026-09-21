# integration

## files
- C:/Users/Light/Desktop/claude/theology compass/site/src/layouts/Base.astro
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/me.astro
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/pages/me.css
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/q/[quiz].astro
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/r/[quiz]/[code].astro
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/method.astro
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/about.astro
- C:/Users/Light/Desktop/claude/theology compass/site/astro.config.mjs

## needs
- site/src/lib/account/session.ts — it imports `browserStore` (a runtime value) from '../shelf', and shelf.ts imports the engine registry, so ANY chunk that touches session.ts drags the 141 KB quiz-engine chunk in behind it. My first version of the layout's flush script imported HINT_KEY/QUEUE_KEY from it and put 141 KB on every page on the site; I caught it in the build and worked around it by writing the two key strings out literally in Base.astro. Fix: copy the five-line `browserStore()` into session.ts and change the shelf import to `import type { ShelfStore }`. Then session.ts is genuinely pure and the literals in Base.astro can go back to being imports.
- site/src/pages/account/sign-up.astro — please read `?email=` from the query and prefill the field. The sign-up box I put in /me/'s dark panel is a real <form method="get" action="/account/sign-up/">, so with JavaScript blocked it lands there carrying `?email=<what they typed>`. Nothing breaks without this; they just retype.
- site/src/lib/account/sync.ts — optional: if you want to own 'when this device last agreed with the account', write `ww.acct.synced` (an ISO string) on a successful syncNow and I will drop my write. Today /me/ writes and reads that key itself, because nothing else does.
- Whoever owns site/src/styles/kit.css — nothing needed for this change, but note I did NOT move `.nav-me-word` down to 34rem (see notes); if the main session wants the word earlier when accounts are visible, that rule is in kit.css:119-123 and the measurement that argues against it is in kit.css:86-94.

## tests
- npx astro build (in site/, no account env) — PASSED. Used to prove the accounts-off state: /about/ has no module <script> at all, /q/theology-compass/ loads only the runner chunk, no page references any account chunk, no /account/ URL in sitemap-0.xml (the seven account pages do build).
- PUBLIC_SUPABASE_URL=https://example.supabase.co PUBLIC_SUPABASE_KEY=sb_publishable_demo PUBLIC_ACCOUNT_LINKS=1 npx astro build — PASSED (note: PUBLIC_ACCOUNT_LINKS is only honoured in DEV, so a production build still resolves ACCOUNTS_VISIBLE=false; the visible state was exercised on the dev server instead).
- node scripts/engine-test.mjs — PASSED, 'All engine checks passed.'
- npx astro dev --port 4392 with the demo env, and --port 4393 with none. Both served every touched page 200: /, /me/, /q/theology-compass/, /r/theology-compass/01IBS6/, /method/, /about/, /games/. Both stopped afterwards.
- Browser pane against :4392 — /me/?as=in painted the room, switched the clear label to 'Clear my results everywhere', filled the address and 'Synced today at 12:28', and lit the header dot; no console errors.
- Browser pane — submitted the /me/ sign-up box: it lazily loaded client.ts, called requestLink, and printed the house-voice failure 'We could not reach your account. Check your connection and try again.' in .capture-status.is-bad with the button re-enabled.
- Browser pane — 'Clear my results' signed in: clearEverywhere refused, the message printed, and ww.shelf.v1 was NOT cleared (server-first rule holds). Signed out: the shelf cleared, the count line reset, the header dot dropped, exactly as today.
- Browser pane — dispatched ww:finished on /q/theology-compass/?as=in and confirmed ww.acct.queue received {quiz, code, at}; on /articles/ signed out, performance entries show no lib/account/* module was fetched at all.
- Browser pane — analytics beforeSend: /account/check-email/?to=someone%40example.com was recorded as http://localhost:4392/account/check-email/ (query stripped).
- npx astro check — NOT RUN. @astrojs/check is not installed and installing is forbidden; the tool refused.

## notes
WHAT IS DONE

Base.astro: pre-paint is:inline now also reads ww.acct.v1 and sets html[data-account="in"] (own try/catch, unconditional, no visual effect on its own). The analytics beforeSend hook blanks search and hash for any path starting /account/ (verified live). The .nav-me dot IIFE takes accountsVisible via define:vars and adds the SAME has-saved dot when signed in. One processed <script>, gated on ACCOUNTS_VISIBLE, does the queue work (below).

me.astro + me.css: three states. Accounts off renders exactly today's markup (verified by grepping the rendered HTML: one .me-chip, one .me-keep, no form, no status span). Visible+signed-out renders the invitation panel (email-only box calling requestLink, then /account/check-email/?to=..., plus a "Sign in" pill) and visible+signed-in renders the address in display type, the sentence, the synced line and a "Your account" ghost button. Both variants are in the document and CSS keyed on html[data-account="in"] chooses before first paint, so nothing flashes or jumps; the address and synced lines hold their line from the start (min-height). The page still paints from readableResults() first, always; syncNow() runs after and repaints. serverTotal is printed honestly ("N shown here, M saved to your account.") only when the account holds more than the device shows. Clear: label and confirm wording switch with state, server first, device only on success.

q/[quiz].astro: addResult now takes an explicit `at` so the device's copy and the account's carry the same instant, and the runner dispatches a ww:finished CustomEvent instead of importing anything.

r/[quiz]/[code].astro: one .btn "Keep it for good" -> /account/sign-up/ in the band, shown by the same sessionStorage test as the saved pill and hidden when html[data-account="in"]. The result instruments were not touched.

method.astro: "Your answers" is now four panels (answers stay in the browser / what an account keeps / the email list / page views), true whether or not the reader has an account, and it names the three game values that reach one. I also removed "and nowhere else" from the two game panels, which an account makes false. about.astro: the stale build comment is replaced and the mailing-list line now covers the account's notes.

astro.config.mjs: sitemap filter excludes /account/.

DEVIATIONS AND THINGS TO LOOK AT

1. HEADER LABEL — I did not take brief item 12's optional text label. The mark stays href="/me/", aria-label and word "My results" in every state, and signed-in is expressed by the existing 7px gradient dot (same mark, same size, same fill, zero CSS change, no new nav item). Three reasons: kit.css:86-94 records a measurement that "My results" at 560px wrapped the nav row and shoved the bulb out, so moving the word down to 34rem reintroduces a known bug; .nav-me-word's 46rem threshold is in kit.css which I do not own; and a link reading "Sign in" that opens /me/ is untrue, while pointing it at /account/sign-in/ would leave a signed-out reader no header route to their own device results. /me/ is now the door to both. design-language §11 also lists a header "Sign in" as a rejection trigger. Overrule me if the main session disagrees; it is a two-line change plus a kit.css rule.

2. AN ASTRO BUG I HIT, AND A LANDMINE I LEFT — Astro will not inline a hoisted script that has any static or dynamic import (node_modules/astro/dist/core/build/plugins/plugin-scripts.js:20 requires imports.length === 0 && dynamicImports.length === 0), so the flush script is always an external module file. To keep signed-out visitors paying nothing I gated the whole <script> on ACCOUNTS_VISIBLE in the template. That works, but ONLY because it is the single processed script in Base.astro: when I tried the same trick in q/[quiz].astro, which has two, the markers crossed and the built quiz page loaded the ACCOUNT LISTENER chunk in place of the runner — the quiz would have shipped dead. I restructured to avoid it and left a loud comment in Base.astro. If anyone adds a second processed <script> to that file, check what each page actually loads before shipping.

3. RESIDUAL COST — with accounts off, every page is unchanged (no module script on /about/, runner only on /q/, and the signed-out header at 1360 is byte-identical to the accounts-off header: md5 59575bd38215c44d1c212c4827dfa541 for both). When ACCOUNT_LINKS_LIVE flips to true, every page gains two cached requests: the guard chunk (474 B) and Vite's preload-helper (1110 B). That is the one place I could not reach "no extra request" — the alternative is moving the flush to /r/ only, which costs a page's delay in the rare "finished, closed the tab" case. /me/ also gains ~2.5 KB always (session.js 1.4 KB + preload-helper) because its script imports readHint and dynamically imports sync; /me/ already loads a 141 KB engine chunk.

4. I WROTE AND THEN DELETED A SECOND GAME SYNC — sync.ts's own syncNow() already handles sls.best, wsi.best and sls.canon (SYNCED_GAME_KEYS, mergeGame, and a ww.acct.games stamp that solves the "device value has no timestamp" problem properly). /me/ now just calls syncNow() and repaints the best lines. Do not re-add one.

5. DEV-ONLY SWITCHES, compiled out of anything served (both behind import.meta.env.DEV): ?as=in / ?as=out in Base.astro writes or removes ww.acct.v1 and ww.acct.synced and sets the attribute; ?took=1 on the result page sets ww:took:<slug> so the saved pill and the new button can be seen without playing a quiz through. They are how every capture below was made.

6. NOT VERIFIED — nothing here has touched a real Supabase project. syncNow, flushQueue and clearEverywhere were only exercised against example.supabase.co, where they failed cleanly and silently, which is the designed behaviour but is not the same as knowing they work. The "N shown here, M saved to your account." line has never been seen with real data. And I could not produce a true git-HEAD render to diff the accounts-off pages pixel-for-pixel, because I must not run git commands that change state; what I did instead is the markup comparison and the byte-identical header capture above.

7. ONE ODDITY worth knowing: while ACCOUNT_LINKS_LIVE is false but the owner is signed in at an unlinked URL, /me/ shows today's "Accounts are on the way" panel even though he has an account. That follows the brief (links off means the site is exactly as today) but will look wrong to him if he tests in that order.

CAPTURES — all in C:/Users/Light/Desktop/claude/theology compass/design/accounts/captures/integration/
me-accounts-off-390-light.png, me-accounts-off-1360-light.png (no demo env: today's page)
me-signed-out-390-light.png, me-signed-out-390-light-panel.png, me-signed-out-390-dark.png, me-signed-out-390-dark-panel.png, me-signed-out-1360-light.png, me-signed-out-1360-dark.png
me-signed-in-390-light.png, me-signed-in-390-dark.png, me-signed-in-390-dark-panel.png, me-signed-in-1360-light.png, me-signed-in-1360-dark.png
header-accounts-off-390-light.png, header-accounts-off-1360-light.png, header-signed-out-1360-light.png, header-signed-in-390-light.png, header-signed-in-1360-light.png
result-accounts-off-390-light.png, result-signed-out-390-light.png, result-signed-out-390-dark.png, result-signed-out-1360-light.png, result-signed-in-390-light.png
method-your-answers-390-light.png, method-1360-light.png
I looked at all of the states in this list and fixed two things I saw: "take more." was landing alone on a line in the signed-out panel (reworded, plus text-wrap: balance on the two new panels only), and an em dash had survived into the rewritten /method/ sentence.