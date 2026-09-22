# The account design pass (2026-09-22)

The owner, after signing up for real on the live site: "I can't stress enough that I want this
login/account feature implemented flawlessly/seamlessly, I want it to actually make sense,
actually integrate with the rest of the site in ways that's helpful, engaging, and enticing for
those who haven't signed up yet." He asked for the whole register / log in / forgot / profile flow
to be done "using the best modern standards", the way the article pass copied the best news sites.

This brief covers the account pages and the header. The personal profile (what `/me/` becomes)
is a separate piece of work with its own concept, still to be approved; do not redesign `/me/`
beyond what is listed here.

## Read first

1. `site/src/pages/account/sign-in.astro`: THE EXEMPLAR. Every page follows it.
2. `site/src/lib/account/form.ts`: the shared form behaviour (show/hide, safe `next`, field
   flags, carrying the typed address between pages). Use it; do not re-implement it per page.
3. The new rules at the top of the forms section of `site/src/styles/pages/account.css`:
   `.ac-group`, `.ac-label`, `.ac-field[aria-invalid]`, `.ac-row > .ac-status`, `.ac-under`,
   `.ac-alt`, `.ac-alt--foot`.
4. `C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/08a5364a-b433-49dd-931b-5f478fbdc9a2/scratchpad/research/research-auth-ux.md`:
   the researched spec (MUST / SHOULD / AVOID, with sources). Follow its MUSTs unless this brief
   says otherwise.
5. `.../scratchpad/research/map-account-ui.md`: where everything is today, and what the tests
   assert (section 6). Line numbers there are from before the edits already made.

## What the owner has said, and it is binding

- **Words:** "Log in", "Log out", "Sign up" everywhere a person reads them. Never "Sign in" /
  "Sign out" in visible copy (routes stay `/account/sign-in/`; do not rename routes). The
  signed-in header link is "My profile" (sentence case, like the rest of the nav).
- **No over-explanation.** He cut, word for word: the "your answers are never sent anywhere"
  paragraph, a "Password: Set" row ("so random"), and "The link lands on a page where you choose
  a new password, and works for an hour. Until you choose one, your old password still works"
  ("bizarre over-explanation"). Say a thing once, where it is needed. No ledes that repeat the
  heading. No prose paragraphs about how accounts work.
- **Links where every form keeps them:** "Forgot your password?" straight under the log-in
  button. "Already have an account? Log in" right under the sign-up ask, never at a band's foot
  where the rooms below rise into it. Secondary links are plain underlined text lines
  (`.ac-under`, `.ac-alt`), not glass pills.
- **No empty painting above the chip** on the account pages (fixed in `account.css`; keep it).
  Articles and other pages keep their picture space: do not touch them.
- **Header** (builder C): guests see "Log in | Sign up" instead of "My results". On a phone it
  takes the bulb's place at the top right, and the bulb moves to where the profile icon is now
  (the right end of the nav row). Signed in, it becomes "My profile".
- Light theme is the default; check dark too (`?theme=dark`). Phone first: judge at 390, then
  1360. Mobile is priority one.
- The design language is the site's own (Riche kit, `site/src/styles/kit.css`, tokens in
  `site.css`): the painted band with the form inside it, glass fields, the 52px gradient button,
  display type with one italic accent phrase. Keep it; make it cleaner, not different.

## Standards every form meets (from the research)

- A visible `<label class="ac-label">` above every field, grouped with it in `.ac-group`.
  No placeholder standing in for a label.
- `autocomplete`: log in `username` + `current-password`; sign up and forgot `email`;
  choose-a-password a hidden `<input type="email" autocomplete="username">` holding the address
  plus `new-password`; change-password `current-password` + `new-password` (+ hidden username);
  the code field `one-time-code`.
- Email fields: `type="email" inputmode="email" spellcheck="false" autocapitalize="none"`.
  Password fields: `spellcheck="false" autocapitalize="none" autocorrect="off"`, never `maxlength`,
  never block paste.
- Show/Hide through `wirePasswordToggles()`.
- Every `<form>` has `method="post"` (never a GET that could put a password in the URL) and
  `novalidate`; the script handles submit.
- Errors: the status line sits in the form's column between the last field and the button;
  mark the offending field with `flagFields()`; say what to do ("Enter your email address.");
  drop "Please", "Sorry", "Oops". One message for a failed log in, whatever was wrong.
- One primary button per page. No greyed-out submit buttons before typing.
- After logging in, `safeNext()` of `?next=`.

## File ownership (strict: touch nothing outside your list)

**Builder A, the flow pages:** `site/src/pages/account/sign-up.astro`, `forgot.astro`,
`check-email.astro`, `password.astro`; `site/src/styles/pages/account.css` (you own it; B does
not edit it); `site/src/lib/account/client.ts`, `emails.ts`, `sync.ts`; `site/src/pages/api/auth/delete.ts`,
`list.ts`; and the test files `site/scripts/auth-test.mjs`, `account-test.mjs` ONLY where an
assertion checks wording you changed.

**Builder B, the account page:** `site/src/pages/account/index.astro` and a NEW stylesheet
`site/src/styles/pages/account-settings.css` imported by that page only. You may read
`client.ts` and call what it exports; you may not edit it (ask for anything missing in your
report and work around it).

**Builder C, the header and entry points:** `site/src/layouts/Base.astro` (header and footer
only), the header rules in `site/src/styles/site.css`, `kit.css`, `touch.css`, the quiz-mode
rules in `site/src/styles/pages/quiz.css` that hide the nav, `site/src/pages/me.astro` and
`site/src/styles/pages/me.css` (wording and the heading only), `site/src/pages/404.astro`,
and `site/scripts/switch-test.mjs`.

**Nobody touches:** `AccountBand.astro` (the SEO guard counts its `<h1>`s by the exact markup
`<div class="ac-head( ac-head--fallback)?" data-state="…">`), `sign-in.astro`, `form.ts`,
`config.ts`, anything under `site/src/lib/quizzes/`, `site/src/pages/r/`, articles.

## How to work

- A dev server is already running with accounts switched on and the doors open:
  `http://127.0.0.1:4400`. Pages reload as you save. Each account page has dev-only
  `?state=` switches (read the page's script for its names).
- Screenshots: `sh design/tools/shot.sh -m "<url>" "<abs-out.png>" <height> 390` for a phone,
  `sh design/tools/shot.sh "<url>" "<abs-out.png>" 1360 <height>` for desktop. Save them under
  `C:/Users/Light/AppData/Local/Temp/claude/C--Users-Light-Desktop-claude-theology-compass/08a5364a-b433-49dd-931b-5f478fbdc9a2/scratchpad/shots/<your letter>/`.
  LOOK at every one you take (Read the PNG) and fix what you see before reporting.
- Do NOT run `npm run build`, `npm run test`, `npm run test:switches` or `astro build`: three
  builders share one working tree and one output folder. The lead runs every suite afterwards.
- Do NOT commit, push, or change git state.
- Keep the blank-output rule: with no Supabase keys set, every page must build to what it is
  today (keep the account-only markup behind the existing `ACCOUNTS_READY` /
  `ACCOUNTS_VISIBLE` gates, exactly as the pages already do).
- Keep these strings unless you also update the test that looks for them:
  "Keep it on every device" (result page), "Email me a link" and `href="/account/sign-in/"` on
  `/me/` in a preview build (switch-test sections 2 and 3).
- Comments: match the house style (why, not what; plain English; dated where history matters).

## Report

Files changed; what you did per page in a line each; the screenshot paths you looked at;
anything in the research's MUST list you did not do and why; anything you needed from another
builder's files.
