# Phase A: the result page's share and save blocks (the fixes the owner will verify on the Compass)

Owner, 2026-09-23, after testing a shared Compass link: the share area is confusing, the email box does nothing, and
the fine print is gibberish. These fixes live in shared components, so every quiz gets them at once. Phase B (short
codes, per-result link previews, quiz #4) waits for his verification. Read CLAUDE.md's rules on copy: plain short
sentences, one idea each, no comma stacks, no section marks, capitals for every pronoun for God.

Two builders, strict file ownership. Do not commit or push. Run `npm run test` in `site/` at the end and report.

---

## Builder S: `ShareBlock.astro` (and only the share rules in CSS)

Owns: `site/src/components/ShareBlock.astro`; the share rules in `site/src/styles/site.css` (the `.share-*`,
`.card-*`, `.compare-row` rules, around lines 1215-1310, nothing else in that file); the invite block of
`site/src/pages/c/[quiz]/[codes].astro` (its "Send this to someone else." block only).

### 1. Two links, each in its own labelled box (owner view)
Today the owner sees a result link, then "Send this to someone else and, when they finish, you both see your answers
on the same rails.", then the invite link, then "Keep this link to come back to your result." Each caption sits next
to the wrong link. Replace with two separate boxes, one per link. Each box: a small label above (the site's uppercase
kicker style), the field with its Copy link button, and its caption UNDER the field, inside the box. Clear space or a
visible edge between the boxes so no one can read a caption as belonging to the other link.

- Box 1, label **Your result link**. Caption: "Opens this result for anyone. Keep it to come back to your result."
- Box 2 (comparable quizzes only), label **Compare with a friend**. Caption: "Send this to a friend. When they finish
  the quiz, you both see your answers side by side."

Visitor view (someone opened the link): one box, label **This result's link**, no caption. The line "Someone sent you
this. {effort}" goes entirely (and the `effort` strings with it).

### 2. No early wrapping on desktop
Captions in the share area wrap at 34rem (`.share-note { max-width: var(--measure) }`) while the column is much wider.
Inside the boxes, captions run the full width of the box. Check every caption in the block at 1360px.

### 3. Share button only where it works
Show it only when `navigator.canShare({ files: [...] })` is true AND
`matchMedia('(hover: none) and (pointer: coarse)').matches` (phones and tablets). Desktop browsers claim they can
share files and then do nothing. Keep Save the card everywhere.

### 4. The logo and the wordmark on every card shape
The owner wants his logo IMAGE on every share card, not only the words: he is proud of what it stands for. At the top
of every card (bipolar, unipolar, reading), a brand row: the brush W (`/img/logo-w-large.png`) and the "Wiser Walk" wordmark
(`/img/wordmark.svg`, which uses `fill="currentColor"`: fetch it as text, set the fill to the card's ink #444444, and
draw it from a data URL), about 44-50px tall together, left-aligned with the card's text. Then the quiz title kicker
as now. Keep the URL at the foot. Rebalance each shape so nothing collides or is cut, and wait for both images to load
before drawing (as the fonts are awaited). Draw the W from `/img/logo-w-large.png` (159x114, the owner's larger export,
added 2026-09-23), always scaled DOWN, never up, with high-quality smoothing; `/img/logo-w.png` stays for the header.

### 5. The unipolar card is empty in the middle
Sins and gifts cards pass their rows but never draw them. Draw the top rows (as many as fit, at least five) as named
horizontal bars from the rows' values, in the style of `CategoryStack` (accent ink, rounded, the name on each), so
the card shows the result, not a blank panel.

### 6. The /c/ invite block
Give its invite link the same labelled box as box 2 (label **Compare with a friend**, the same caption).

Acceptance: at 390 and 1360, light and dark, owner and visitor: no caption can be read as belonging to the other
link; no caption wraps early; no Share button on desktop; every card shape shows the logo, the wordmark, the title and
its content with nothing cut; sins and gifts cards show bars.

---

## Builder E: the save block, every email box, and one account bug

Owns: new `site/src/components/SaveResult.astro` (with its own `<style>`); `site/src/pages/r/[quiz]/[code].astro`
(swap EmailCapture for SaveResult; nothing else there); `site/src/layouts/Base.astro` (the footer form and its
script only); `site/src/lib/account/client.ts` (the `settle()` fix only); deleting
`site/src/components/EmailCapture.astro`; the copy lines in `site/src/pages/about.astro` and
`site/src/pages/method.astro` that describe the old email series or say that typing an address only joins a list.

### 1. SaveResult replaces "Where this came from" on EVERY result page, for every shape (the Psalm quiz too)
Three states. The server renders the visitor state; the page upgrades to the taker state when
`sessionStorage['ww:took:<slug>'] === <code>` (the same test ShareBlock uses), and the block disappears when
`html[data-account="in"]` (signed in). Render nothing at all unless `ACCOUNTS_VISIBLE`.

- **Taker, signed out.** Heading: "Save your result". Line: "It's free and takes 30 seconds. Every quiz you take adds
  to your profile, and the more you take, the more it shows you about yourself." Form: email field, button "Save my
  result". Under it, small: "We'll email you a link to choose a password." and "Already have an account? Log in"
  (to `/account/sign-in/?next=<this result's path>`).
- **Visitor, signed out** (opened someone's link). Heading: "Try it for yourself". Line: "Wiser Walk is a free home for
  quizzes, games and articles that help you understand yourself and grow in your walk with God. Take this quiz in
  about {quiz.minutes} minutes and save every result to your own profile." A primary button "Take the quiz" (for a
  comparable quiz, the invite link `/q/<slug>/?with=<code>` so they land beside this result; otherwise `/q/<slug>/`).
  Then the same email form with the label "Or start your free profile now" and button "Sign up", and the same small
  line.
- **Signed in:** nothing.
- No other fine print. No link that leaves the page except Log in (which returns via `next`) and Take the quiz.

The form starts a real account sign-up, exactly like `/me/` does (me.astro around 665-693): dynamic
`import('../lib/account/client')`, `requestLink(email)`, on success set `sessionStorage['ww.acct.to']` and go to
`/account/check-email/`; show `requestLink`'s errors in plain words beside the field. Without JavaScript the form GETs
`/account/sign-up/?email=`. The result is already on the device shelf, and `settle()` uploads the shelf when the
password is set, so the result is saved to the new account.

Design it as a first-class block in the site's kit (the dark starry panel the old block used is fine), phone first,
balanced at 1360. Both states must look finished, not like a form bolted on.

### 2. The footer box ("Keep walking.") becomes a sign-up
It posts to `/api/subscribe`, which adds a Brevo contact and sends nothing. Make it start the same account sign-up as
above. Copy: heading stays "Keep walking."; line: "Make a free profile. Save every result and see what they add up
to."; button "Sign up"; small line "We'll email you a link to choose a password." It stays hidden when signed in.

### 3. Every other email box
The games have none. `/me/` and `/account/sign-up/` already start a sign-up. After this change nothing on the site
may post to `/api/subscribe`; leave the endpoint in place (tests may use it) but report anything still calling it.

### 4. `settle()` re-subscribes people who switched emails off
`client.ts` `settle()` calls `tellTheList(token, true)` on every password set, including a reset, so someone who
turned "Emails about new quizzes and games" Off is put back on the list. Pass the saved preference instead (read
`profiles.notes_off` for the user, default on for a brand-new account).

### 5. Copy elsewhere
Remove or correct any line that still promises the "three or four emails" series or says an address typed on a result
page only joins a list (`about.astro`, `method.astro`). One short plain sentence where a line is needed.

Acceptance: at 390 and 1360, light and dark: the taker, visitor and signed-in states on a Compass result and on a
Psalm result; the footer signed out and signed in. Typing an address and pressing the button reaches
`/account/check-email/` (with the fake Supabase keys of the `site-acct` launch config the request itself will fail:
check that the error is shown in plain words, and read the code path to confirm the success path).
