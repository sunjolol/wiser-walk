# design-language

web_access_worked: undefined

# Binding design rules for the account pages (sign up, check email, set password, sign in, forgot, account settings, signed-in `/me/` and header)

Sources are cited as `file:line` or by document. Everything below is either a token already in the
repo, a rule the owner stated, or a pattern already shipped and accepted. Nothing here is invented
taste.

---

## 0. The one thing that decides whether this is accepted

**An account page is a page of this site, not an auth screen.** Every accepted page on wiserwalk.com
opens on a full-bleed picture band with white display type, a glass chip and the page's action, and
then rooms with a coloured mark each. There is no centred white card anywhere on this site, no
`max-width: 420px; margin: 0 auto` panel floating on grey, no logo-over-form layout.

If a builder produces a centred card with "Sign in" in a serif, an email field, a password field and
a button, it will be rejected on sight for exactly the reason the owner gave today:
*"like it was an afterthought rather than an integral feature"*.

The sign-up flow is the moment the site asks for something. The site already has a page whose whole
job is asking — `/support/` — and it is the closest exemplar. Study it first.

---

## 1. Tokens. Literals are forbidden outside a picture's own scrim

All in `site/src/styles/site.css` (`:root`) and `site/src/styles/kit.css`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--blue` / `--orange` | `#7EBAEE` / `#F0A06F` | same | the spectrum. **Blue = left pole, orange = right pole; neither is "good".** On an account page no axis exists, so neither colour may imply success or failure |
| `--grad` / `--grad-r` | `to bottom right` / `to right` blue→orange | same | buttons, the 58×7 rule under a section title, the 2px hairline |
| `--page` / `--shell` / `--panel` | `#E3E3E3` / `#E8E8E8` / `#EEEEEE` | `#131319` / `#1B1B21` / `#24242B` | the three-step ladder. Never put a panel straight on the page with no shadow |
| `--ink` / `--ink-soft` / `--ink-mute` | `#444444` / `#5A6066` / `#7C8288` | `#EAE8E4` / `#B4B0AA` / `#8E8A84` | |
| `--accent` / `--accent-soft` | `#3E86C4` / `#E2EDF7` | `#7EBAEE` / `#1E2A38` | links and small caps on a light ground |
| `--on-grad` | `#3B3B3B` | `#3B3B3B` | text that sits ON the gradient (button labels). Never white |
| `--on-dark` / `--on-dark-soft` / `--on-dark-mute` | `#ECEAE6` / `#B9B5AF` / `#8F8B86` | same | text on a dark panel, both themes |
| `--blue-soft` / `--orange-soft` | `#A9D0F3` / `#F4B991` | same | ink on dark/photographic grounds |
| `--dark-fill` + `--dark-fill-img` | `#1C1C23` + `/tex/starry.png` | `#343441` + none | any dark panel. `.dark` re-points every token inside it (`kit.css:425`) |
| `--lift` | `3px 3px 5px rgba(68,68,68,.065)` | `0 2px 6px rgba(0,0,0,.3)` | the whisper shadow on panels |

**Radii:** `--r-sm: 12px`, `--r: 18px`, `--r-lg: 22px`, `--r-pill: 999px`. Bands are `0 0 30px 30px`
(`38px` at ≥40rem). Rooms and the `/support/` reason cards are **24px** (`support.css:96`,
`me.css:58`). A mark tile is **14px**. The footer sign-up's success panel is **16px**. Do not invent
a fourth radius.

**Type:** `--display` = DM Serif Display (400 only, italic available), `--ui` = Poppins (600/700 only),
`--text` = Inter (400–700). Body is 15px / 1.65.
- Headline on a picture band: `--display` 400, `clamp(2.45rem, 11vw, 4.3rem)`, `line-height: 1.02`,
  `letter-spacing: -.02em`, `#fff`, `text-shadow: 0 2px 22px rgba(22,14,6,.45)`, one word in
  `<em>` italic `#FFD2B0` (`support.css:53-59`, `me.css:38-43`).
- Section head: `--display` italic 400, lowercase, `clamp(2rem, 8vw, 2.7rem)`, with the 58×7px
  gradient rule under it (`kit.css:407`, `me.css:195`). `SectionHead.astro` exists.
- Small caps anywhere (chips, kickers, facts, buttons): `--ui` 700, `letter-spacing: .10–.16em`,
  `text-transform: uppercase`, **never below 0.6rem, and never below 11px on a phone** — the round-one
  critic measured 8.64px labels and it was a finding (`design/CRITIQUE-ROUND-1.md`, the tiles entry).

**Shadows:** `var(--lift)` for panels; `0 10px 30px rgba(20,24,40,.16)` for a picture room;
`inset 0 0 0 1.5px <ink>` for anything outlined. Borders are not used on this site — outlines are
inset box-shadows.

---

## 2. Every account page opens on a picture band

Never a heading on the bare page. Three ways to build one, in order of preference here:

1. **`Hero.astro`** with `kind="photo"`, `image`, `eyebrow`, `icon`, `title`, `orange`/`blue`
   (one coloured phrase), optional `tiles` (real numbers only), and the **`actions` slot for the
   primary button** — which is how the action gets above the fold. See
   `site/src/components/Hero.astro`. This is the cheapest correct answer and it already handles the
   glass chip, the two inks on white type, the scrim, and `loading`/`fetchpriority`.
2. **A hand-built band in the page's own stylesheet**, the way `/support/` and `/me/` do it
   (`.sp-band`, `.me-band`), when the picture needs its own crop and scrim. This is allowed and is
   what the two best pages actually do.
3. `kind="night"` (the dark starry ground) with no picture, for a page that genuinely has no picture
   of its own. Acceptable for `/account/` settings; **not** acceptable for the sign-up page.

Band anatomy, in order, top to bottom:
- glass chip: `rgba(255,255,255,.16)`, `inset 0 0 0 1px rgba(255,255,255,.34)`,
  `backdrop-filter: blur(8px)`, `.62rem` Poppins 700 `.12em` uppercase, a 13–14px `Icon` inside.
- `h1` with exactly one `<em>` in `#FFD2B0`.
- lede, `1.04rem`, `rgba(255,255,255,.94)`, `text-shadow: 0 1px 12px …`, `max-width: 31rem`.
- the action (button and/or the email field).

**Band geometry:** `margin: calc(-1 * var(--top)) calc(-1 * var(--gut)) 0` so it bleeds full width
(`--gut` 1.25rem phone / 1.75rem tablet; `--top` 1.75rem phone / 2.5rem tablet, set on `.wrap`/`.page`
in `kit.css:54-59`).

**"so much blank space above…"** — the owner made `/support/` lose ~100px of sky so the button came
on screen sooner (`support.css:251`). A band is as tall as its content needs. No empty run above the
chip.

---

## 3. Forms: the exact spec, already shipped twice

Two accepted precedents. Copy their geometry exactly; do not write a third field style.

**On a dark or photographic ground** (`kit.css:664-689`, footer; `prose.css:787-791`, result page):
```
input  min-height: 46px; font-size: 1rem  /* 16px or iOS zooms on focus */
       padding: .7rem .95rem  (.7rem .95rem .7rem 2.7rem when an icon sits in the field)
       border-radius: var(--r-pill); border: 0
       background: rgba(255,255,255,.08)   /* .5 of a dark ink over a photo */
       box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.4)
       color: #fff;  ::placeholder rgba(255,255,255,.7)
       :focus-visible { outline: 2px solid var(--blue-soft); outline-offset: 2px }
row    flex-direction: column; gap: .5rem  →  row at min-width: 26rem
icon   absolutely positioned left: 1rem, pointer-events: none, a 17px Icon
```
**On a light panel** (`site.css:998-1006`): `background: var(--shell)`,
`box-shadow: inset 0 1px 2px rgba(68,68,68,.09)`, `color: var(--ink)`.

**Every field carries:**
- a real `<label class="sr-only">` (`.sr-only` is in `site.css:1015`) — placeholders are not labels;
- `autocomplete` (`email`, `new-password`, `current-password`), `inputmode="email"`, `required`;
- the honeypot `<p class="hp" aria-hidden="true"><label>Leave this empty<input name="website"
  tabindex="-1" autocomplete="off"></label></p>` — the subscribe endpoint already relies on this
  field name (`site/src/pages/api/subscribe.ts`). Never a CAPTCHA (site rule, and the top-level
  safety rules forbid solving them anyway).

**Password fields specifically:**
- one password field, not two. The owner's word is *"simple and fool-proof"*; a confirm field is the
  commonest place a non-expert user fails. Use a **show/hide control** instead: a 44px button inside
  the field's right end, labelled by text (`Show` / `Hide` in `--ui` .62rem caps), `aria-pressed`.
  There is no eye icon in `Icon.astro`; do not import one from anywhere.
- the rule ("at least 8 characters") prints **once, under the field, before the reader types**, as
  `.62rem` mute caps or `.78rem` soft ink — never only as an error after they fail.

**Buttons.** `.btn` (`site.css:290`): Poppins 700, `.82rem`, `.1em` caps, `padding: .8rem 1.5rem`,
`min-height: 44px`, pill, `--on-grad` on `var(--grad)`, `var(--lift)`. The primary action of an
account page uses the `/support/` size-up (`support.css:190`): `padding: .95rem 1.9rem`,
`min-height: 52px`, `font-size: .86rem`, `box-shadow: 0 8px 24px rgba(10,10,16,.38)`.
A disabled primary must be **legible and labelled**, not a 45%-opacity ghost — `/support/` sets
`opacity: 1; background-image: none; background: rgba(255,255,255,.1); color: var(--on-dark-soft);
inset 0 0 0 1.5px rgba(255,255,255,.2)` and changes its **words** (`support.css:197`). The greyed
disabled PLAY button was logged as `[broken]` in critique round one.

**Secondary action** ("I already have an account", "Send the link again"): `.btn.ghost`
(`inset 0 0 0 1.5px var(--accent)`) or the glass pill `.hm-btn-glass` on a photograph
(`home.css:50`). **Never a bare underlined text link as the second action on a phone** — see §5.

---

## 4. Status messages, and the rule today's rejection creates

The two shipped forms both use one `<p role="status" aria-live="polite">` whose class switches
between `is-busy` / `is-ok` / `is-bad`, sitting **outside** the element that gets hidden on success.
The footer's success state is the model worth copying (`kit.css:682-689`): the field row is hidden,
and the message becomes a real panel — 16px radius, `.85rem 1.1rem` padding, `0.98rem` / 600,
`background: rgba(16,26,20,.62)`, `inset 0 0 0 1.5px rgba(160,230,180,.55)`, blurred. On a light
ground use `--accent` for ok and `--warn-ink` for bad (`site.css:1008-1010`).

Reserve the message's height (`min-height: 1.2em` or a fixed slot) so nothing below it jumps when the
message arrives. Nothing on an account page may reflow on a network reply.

**THE STATE-MARK RULE (new, from the owner's verdict of 2026-09-21).** He rejected the daily set's
hit/miss marks as *"super scuffed"* and *"glitchy"* with *"weird outlines and spacing… different
sizing/colors"*. The failure is reproducible in the shelved CSS (`git show f0c84bd -- site/src/styles/pages/home.css`,
`.today-sq i`): a 6×14px bar carrying **three** states through **three different shadow mechanisms** —
`inset 1px rgba(255,255,255,.3)` for the empty state, a filled background for the hit, a different
`inset 1px #fff` for "fast", and an **outset** `0 0 0 1px` ring for hit-and-fast — with a 2.5px gap
and a size change to 7×16px at the tablet breakpoint.

So, binding, for any row of small marks anywhere (step indicator in the sign-up flow, password
strength, a list of what is synced, verified/unverified badges):

1. **One shape, one size, one gap, at every breakpoint.** If it must grow, grow it once and change
   both the size and the gap proportionally in the same rule.
2. **At most two states.** State is carried by **fill only**: on = solid `currentColor`, off =
   `color-mix(in srgb, currentColor 22%, transparent)`. Never switch between an inset ring and an
   outset ring to mean something.
3. **Never mix outline and fill to encode two different facts in one mark.**
4. Never more than two inks in one row of marks, and both must come from the same `--room-ink` the
   block already declares.
5. A mark that can be misread as a rendering fault is a defect, not a style choice. Judge it in a
   390px capture before it ships.
6. If a state needs a third value, use **words**, not a third mark treatment.

---

## 5. Phone first, at 390px, measured

- **Design at 390, then 768, then 1360.** No horizontal scroll at 390. Judge light and dark.
- **The main action is never below the fold.** Owner: *"making the user scroll to get to the [main]
  button is bad design"*. Budget: the header is ~75px (and ~120px below 30rem, where the nav wraps to
  its own row), so on a 390×660 viewport you have **about 540px** before the fold. A band with chip
  (46px incl. margin) + two-line h1 (~92px) + two-line lede (~50px) + field (46px) + button (52px) +
  their gaps fits in ~330px of content. It fits. There is no excuse for a hidden button.
- **44px minimum tap target**, 48px for the header's two icon controls (`touch.css:61-66`).
- **Buttons, not tiny text links.** Below 46rem `touch.css` already converts the site's small-caps
  `-go` links into 44px tinted pills with an inset outline in `currentColor`. Any new `*-go` class on
  an account page must be added to that selector list, or written as a pill from the start.
- **No one-word last lines.** Owner: *"stop letting lines wrap on a single word, that looks super
  sloppy"*. `site.css:173-174` sets `text-wrap: pretty` on running text and `balance` on headings and
  ledes. **Add `text-wrap: balance` explicitly to every new short block** (button rows, field hints,
  status copy, small print) the way `support.css:233-234` does, and check a 390 capture for a
  stranded word.
- **Do not add a sixth item to the header nav.** At 390 the nav is a horizontal scroller already
  holding Quizzes, Games, Articles, Donate and the My-results mark plus two carets, and the widths
  are measured, not guessed (`kit.css:77-123`, and the comment explaining why "My results" hides its
  word below 46rem). A "Sign in" nav link will break that row. Signed-in state belongs on the
  existing `.nav-me` mark — see §8.
- Nothing may depend on hover. `prefers-reduced-motion` is respected everywhere.

---

## 6. Pictures

Rules from `design/DAWN-PASS-BRIEF.md` and the owner's rejections:
- **Photographs only for sky and landscape.** Doré engravings only for quizzes (and he does not want
  the engraving style over-used). Public-domain **paintings in colour** for articles and `/support/`.
- **Never the same picture twice on one page.** The footer's walker (`/img/hero-dawn.jpg`) is on
  **every** page, so it may never be a page band's picture. This rejection has already happened once.
- A picture that "fades into blank space", clashes in contrast, or feels random is rejected. White
  type must sit on the dark part of the picture and be readable at 390.
- Every new picture: public domain or Unsplash, ≤1600px wide, JPEG ~q78, under ~250KB, and **recorded
  in `site/public/img/CREDITS.md`** with its source. `/support/` deliberately uses a photograph rather
  than a painting because the owner did not want a credit line on that page — the same reasoning
  applies to the account pages.

**What exists and where it is already used** (`site/public/img/`, `CREDITS.md`):

| file | already on | free for an account page? |
|---|---|---|
| `hero-dawn.jpg` | the footer of **every page** | **No. Never.** |
| `sky-rays.jpg` | home hero and the `/me/` band | Only if you accept the account pages looking like `/me/` — and never on `/me/` itself |
| `support-hand.jpg` | `/support/` band | Technically free, but it is the "asking" picture and re-using it dilutes `/support/` |
| `game-manuscript.jpg` | home games band, `/games/` | No — wrong theme for an account page |
| `reads-harvest.jpg` | `/articles/` band | Wrong theme |
| `dore-*.jpg`, `figures/*.jpg` | quizzes and figure pages | No — engravings mean "a quiz" on this site |
| `articles/*.jpg` | one article each + its card | Possible as a cousin, but each is bound to an article's topic |

**Recommendation:** the account flow should get **one new dawn/landscape photograph of its own**
(Unsplash, credited), used across sign-up / check-email / set-password / sign-in so the four pages
read as one movement, with `/account/` settings on the `night` ground instead. That is one picture,
one credit line, and it makes the flow feel built rather than borrowed.

---

## 7. Marks and instruments

- `Icon.astro` holds: `compass, flame, scroll, book, arrow, users, sparkle, mail, pencil, clock,
  quote, play, path, apple`. **There is no lock, key, eye, check or shield.** Draw any new one in the
  same language — 24 grid, `stroke-width="1.6"`, round caps and joins, `fill="none"`,
  `stroke="currentColor"` — and never a decorative blob with no meaning.
- Prefer `mail` for everything in this flow that is about the emailed link; `users` for the account
  itself (it is already the My-results mark); `path` for "keep going"; `sparkle` for support.
- **A mark wherever a box would otherwise have to be read to be understood.** The accepted pattern is
  the 2.6rem tile: `display: grid; place-items: center; width/height: 2.6rem; border-radius: 14px;
  color: #17181d; background: var(--room-ink)` (`support.css:124`, `me.css:91`, `home.css:97`). On a
  dark panel the quieter variant is `2.4rem`, `13px`, `rgba(255,255,255,.09)` ground with
  `--orange-soft` ink (`.cap-mark`, `prose.css:771`).
- Give every card/room its own `--room-ink` so a column of boxes is never three grey boxes
  (`support.css:109-122` — and note the comment there about why the middle of the blue→orange ramp is
  grey and must not be used as a glow).
- No dotted rules as decoration — the owner said the dotted lines were over-used. Use space, or one
  2px hairline of `var(--grad-r)` (`kit.css:744`).

---

## 8. Signed-in state, and what may not slow the static pages

- Pages are static and cached. **Signed-in chrome is painted client-side**, following the precedent
  already in `Base.astro:459-466`: a tiny inline script that reads storage and adds a class
  (`.nav-me.has-saved` draws a 7px gradient dot with a `2px var(--panel)` ring, `kit.css:114-118`).
  Do the same for signed-in: add a class to the existing `.nav-me` mark, do not add a nav item, do
  not block first paint, and make the page correct with the script blocked.
- **No layout shift.** Whatever the signed-out and signed-in versions of a block are, they occupy the
  same height before and after the script runs — `/me/` does this by rendering the invitation on the
  server and having the script fill the rooms in (`me.astro:1-19` explains the order). Copy that
  order exactly for anything account-shaped.
- `/me/` signed-in: it is already a band + rooms + a dark "what is coming" panel
  (`.me-keep`, `me.css:221`) whose copy says results are device-only and accounts are on the way.
  **That panel is the seam**: when accounts ship it becomes the signed-in/synced statement, and the
  honest copy must change with it (see §9).
- Account pages take `noindex={true}` on `Base` (`/me/` already does).

---

## 9. Copy

British spelling, plain and short, **no em dashes**, no emoji, no flattery.
- **Banned:** the word "faith" in site chrome; `-ward` coinages; "almost / not yet / barely" framings;
  theology-jargon compounds.
- **No process talk** on a page whose job is to get someone through a door. No "we use industry
  standard encryption", no reviewer counts, no method links.
- **Never promise what the site may not keep.** The "nothing is stored / no account" pledges are void
  and were removed on 2026-09-20; equally, do not now promise "we will never email you anything else"
  when the whole point is a marketing list. Say what is actually true: an address, a password, and the
  results that follow you between devices.
- `/method/` still describes how things work **today** and must be updated when accounts ship.
- Still standing site-wide: count knowledge, never devotion; never a percentage against a person or
  between two people; real data only on every tile and number.
- Error copy follows the existing voice: *"That does not look like an email address."*, *"That did not
  go through. Try again in a moment."*, *"You are already on the list."* Plain, no blame, an action.
- **Name the pages for what they do, in words that explain themselves at a glance.** The owner
  rejected "Today's Ten" this week purely because *"it doesn't explain at a glance what that even
  is"*. "Sign up" / "Sign in" / "Choose a password" / "Check your email" pass that test; "Get
  started", "Authenticate", "Magic link", "Verify your identity" do not. Never use the words "magic
  link" — he finds email-link-only sign-in *"SUPER annoying"* and the flow's whole point is that the
  link is a one-time step on the way to a password.

---

## 10. Page by page, at 390px

Routes should follow house style: short, lowercase, trailing slash (`/me/`, `/support/`, `/about/`).

### Sign up — the email-only box
Not a new page if it can be avoided: the footer sign-up already exists on every page and the
`/me/` "what is coming" panel already asks. But the flow needs a landing page for the link in an
email and for `/join/`-style sharing.
- Band, `kind="photo"`, the flow's own dawn picture. Chip `<Icon name="users"/> Your account`.
  h1 two lines max, e.g. `Keep your results <em>for good.</em>` (`em` in `#FFD2B0`).
- Lede, two lines, saying the true benefit: results follow you to any device, and you will hear when
  something new is made.
- **The email field and the 52px button are inside the band**, stacked at 390 (`flex-direction:
  column; gap: .5rem`), side by side from 26rem. This is what puts the action above the fold.
- Under the band, three rooms in the `/support/` `.sp-room` shape (24px radius, `var(--panel)`,
  a 2.6rem mark each in its own ink, a soft radial of that ink in the top-right corner at `.42`
  opacity), rising `-3.4rem` into the band's foot so the ask and the reasons read as one movement.
  Three short reasons, one claim each: results in one place / a profile that fills in as you go /
  hearing when something new is made.
- One small-print line at the foot, `.78rem`, `--ink-mute`: what is stored and the unsubscribe fact.
- Below 46rem, the secondary "I already have an account" is a **pill**, not a text link.

### Check your email
This is a page someone lands on having just acted, and then leaves. It must still be a page.
- Same band picture, chip `<Icon name="mail"/> Sent`, h1 `Check your <em>email.</em>`.
- **Print the address back to them** in `--display` at ~1.15rem — the commonest failure is a typo,
  and showing it is the fix. Beside it a 44px pill: "Not that address?" returning to the form.
- One dark panel (`class="dark"` + a `.dark-ghost` word) holding: what the email looks like (who it
  is from, the subject), what to do if it is not there in a minute (look in spam), and a
  **"Send it again" button that is disabled with words for 60 seconds** — `Send it again in 47s`,
  never a greyed ghost. One tabular-nums countdown, no spinner.
- No step-dots, no progress bar. If a step indicator is genuinely wanted, it obeys §4 rule 1–6.

### Choose a password (the emailed link lands here)
The single highest-risk page in the flow: the reader arrived from their mail app, possibly on a
different device, and has one job.
- Band, chip `Almost there` is **banned** ("almost/not yet" framing). Use `<Icon name="path"/> One
  step` or `<Icon name="users"/> Your account`.
- h1 `Choose a <em>password.</em>` Lede one line: `This is how you sign in from now on.`
- **The field is in the band**, 46px, `autocomplete="new-password"`, with the Show/Hide control and
  the rule printed under it before they type. One 52px `Save it and sign in` button.
- Below: one dark panel saying, in one sentence, that their saved results are now attached to this
  account. No sidebar, no tips list, no strength meter with five coloured bars (that is exactly the
  mixed-size, mixed-colour mark row he rejected). If strength is shown at all it is **one line of
  words**, not a bar.
- Expired or already-used link: not an error toast. The page renders a real state — same band, h1
  `That link has <em>expired.</em>`, one 52px button that sends a new one, and the email field
  pre-filled if it is known.

### Sign in
- Same band family, chip `<Icon name="users"/> Welcome back`, h1 `Sign <em>in.</em>`
- Email + password + 52px button, all in the band. `autocomplete="current-password"`.
- "Forgotten your password?" is a **44px pill** below 46rem, `.btn.ghost` or a glass pill on the
  photograph — never a 12px underlined link.
- One line under the fold: "No account yet?" with a pill to the sign-up page.
- Leave a labelled, commented slot for the later Google button (a 52px `.btn.ghost`-shaped control
  above the email field, with an `or` hairline of `var(--grad-r)` at `.5` opacity between them).
  Build the slot now so adding Google is not a relayout.

### Forgot password
Identical shape to sign-up (one email field, one button) with a different chip and headline; on
submit it becomes the check-your-email page. Do not build a fourth layout for it.

### Account settings
- No photograph. `Hero` with `kind="night"` (the dark starry ground), or `.dark`, so it is plainly a
  back-of-house page and not a doorway.
- One `.spec`-style list is allowed here (`kit.css:486`, label in `--ui` `.62rem` `--accent` caps,
  value right-aligned `.92rem` `--ink-soft`) — email address, when the account was made, how many
  results are saved (real counts only, from the shelf/registry).
- Each action is its own room with its own mark: change password, sign out, delete the account.
  Destructive actions are `.me-clear-btn`-shaped (`me.css:238`): a pill, outlined in `--rule`, mute
  ink, never red-filled, with a `window.confirm` that says plainly what is lost — `/me/`'s clear
  button is the precedent and its wording is the model.
- No "Danger zone" box, no red panel: this palette has no red, and `--warn-ink` means the right pole
  of an axis, not danger.

### `/me/` signed in
- Do **not** redesign `/me/`. Its band, rooms and `order: -1` lift are accepted work.
- The change is `.me-keep` (`me.astro:124-132`, `me.css:221`): the dark panel currently says results
  are on this device and accounts are coming. Signed in, it becomes the quiet statement that results
  are saved to the account, with a link to `/account/`. Signed out **but with a shelf**, it becomes
  the offer to save them. Both versions are the same panel at the same height.
- The band's `.me-count` line already changes client-side; keep that one-line mechanism rather than
  adding a second status strip. A second strip above the rooms is precisely the shape of the thing
  rejected today.

---

## 11. What will get the work rejected

Each of these has already been said by the owner, or logged as a finding.

- A centred card login page. A modal. A split-screen "image left, form right" SaaS layout.
- The main button below the fold at 390.
- A small-caps text link as the phone action.
- Status marks with mixed sizes, mixed inks, or inset-vs-outset outlines (today's rejection).
- The footer's walker photograph in a page band, or any picture twice on one page.
- Panels with 200–1900px of empty ground below their content (three separate critique findings).
- A dark panel in dark theme that does not clear the page — the three-step ladder page < panel <
  dark-fill must hold in **both** themes (`kit.css:754-762` fixes this; do not undo it).
- Uppercase labels under 11px on a phone.
- Colour literals outside a picture's own scrim; blue or orange used to mean good/bad.
- Process talk, inside baseball, or any promise the site may not keep.
- A "Sign in" item added to the header nav.
- Shipping without looking: capture `/`, `/support/`, `/me/` and every new page at 390 and 1360, light
  and dark, with `sh design/tools/shot.sh <url> <ABSOLUTE-out.png> <w> <h>` (`-m` for true phone width)
  and `python design/tools/crop.py <png> 1500`. The in-app browser pane cannot screenshot while hidden.


## owner_rulings
- 2026-09-21, on the daily set's display (the request that started this work): "the icons showing which questions you hit/missed are super scuffed and look glitchy to me with the weird outlines and spacing they have and the different sizing/colors, just looks very odd" — the source of the state-mark rule in section 4.
- 2026-09-21, same message: "the placement of all of the new 'Today's Ten' info such as your score, rank, button for it etc. feels super clumsy, especially on mobile, like it was an afterthought rather than an integral feature. Just needs a total re-imagine to be acceptable to me... I don't even think it's salvage-able as is, it needs a totally new approach."
- 2026-09-21, same message, on naming: "I'm not sure 'Today's Ten' is even the best terminology, because it doesn't explain at a glance what that even is. 'Today's Challenge' would be better." — page and control names must explain themselves at a glance.
- 2026-09-20/21, on accounts (recorded in CLAUDE.md and HANDOFF.md): he finds email-link-only sign-in "SUPER annoying"; the sign-up box asks for an email only, the emailed link lands on a page where they SET A PASSWORD, after that they sign in with email and password, "forgot password" sends the same kind of link, Google sign-in later. "Keep it simple and fool-proof."
- 2026-09-21 (DAWN-PASS-BRIEF, HANDOFF 'His standing rulings'): "stop letting lines wrap on a single word, that looks super sloppy" — he called orphans "super sloppy"; text-wrap rules are in site.css and every new short block needs text-wrap: balance.
- 2026-09-21: "making the user scroll to get to the [main] button is bad design" — the primary action is in the band, above the fold, on a phone.
- 2026-09-21: buttons, not tiny text links, on a phone; chips that look tappable must do something; bigger header icons so a thumb finds them (built into touch.css).
- 2026-09-21: "so much blank space above..." — bands are as tall as their content needs; no empty run above the chip. On /support/ he asked for about 100px less sky so the give button was on screen sooner.
- 2026-09-21: no picture that fades into blank space, repeats on one page, or needs a credit line on /support/. (The footer's walker is on every page, so it may never be a page band's picture — that rejection already happened once.)
- 2026-09-20: "everything is templated... a soup of dullness" — do not stamp one card down a page; each thing gets its own picture, its own ink and its own mark.
- 2026-09-20: "WE NEED GRAPHICS AND PHOTOS" and "why is there literally ZERO icon/graphic usage" — a mark wherever a box would otherwise have to be read to be understood; never a decorative blob with no meaning.
- 2026-09-20: "you over-used the dotted lines" — no dotted rules as decoration; use space, or one hairline of the brand gradient.
- 2026-09-20: "SO much over-explanation of just about everything, SO much inside baseball" — no process talk on a page whose job is to get someone through a door. Say a thing once, where it is needed.
- 2026-09-19, on the first site-wide design pass: "INSANELY lazy", "SO boring", "BARELY different from the original boring bland non-designed layout" — the bar is the result page and the reference skins, not 'tidy'. He can tell when work is rushed.
- 2026-09-20: light is the default theme; the site no longer follows the system setting. Dark happens only through the bulb or ?theme=dark, and must also look finished.
- Standing, from CLAUDE.md: mobile is priority one, from the ground up — design and build phone-first, then tablet, then desktop, never desktop scaled down; his previous project became a painful retrofit because mobile was left to the end.
- Standing, from CLAUDE.md: no mobile app, no PWA, no service worker, no manifest — responsive web only.
- Standing, from CLAUDE.md (2026-09-20): the "no accounts, nothing stored, nothing leaves your browser" stance and every pledge of it are VOID; never write copy that promises nothing is stored or no account exists. /method/ still describes today and must be updated when accounts ship.
- Standing, from CLAUDE.md: count knowledge, never devotion; never a percentage against a person or between two people; real data only on every tile and number; the word "faith" is banned in site chrome, as are -ward coinages and "almost / not yet / barely" framings.
- 2026-09-21, on plain questions (memory: 'Plain questions only'): he could not follow two decisions asked in jargon — ask in plain words with the real item shown, and make routine calls yourself. Applies to how a mock-up of these pages is put to him.

## exemplars
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/support.astro — the closest sibling: the page whose whole job is asking for something. A photographic band with the action inside it, three reason rooms rising out of the band's foot, one dark panel with one button, one line of small print. Copy its structure for the sign-up page almost beat for beat.
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/pages/support.css — the accepted geometry for a band that must put its button above the fold (note the 2026-09-21 owner-note blocks at the end, which override the rules above them), the 24px room with a single-ink radial glow, the 52px primary button, and the legible disabled state.
- C:/Users/Light/Desktop/claude/theology compass/site/src/pages/me.astro — the model for server-renders-the-invitation, browser-fills-in-the-state. Read the header comment: it explains why the page must be a set of doorways with the script blocked. Every account page that shows signed-in state copies this order.
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/pages/me.css — the sky band, the rooms, the mark tile, the 'is-taken' demotion of a heading to a kicker, and .me-keep, the dark panel that becomes the signed-in statement when accounts ship.
- C:/Users/Light/Desktop/claude/theology compass/site/src/layouts/Base.astro — the footer sign-up (the email-only form the account flow inherits), the no-JS form-POST fallback, the three status states, and the inline script that paints the My-results dot without blocking first paint: the exact precedent for painting signed-in chrome.
- C:/Users/Light/Desktop/claude/theology compass/site/src/components/EmailCapture.astro — the honest-offer voice and the full form contract: sr-only label, honeypot, status element outside the hidden element, fetch with a graceful failure message.
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/kit.css — the kit itself: bands (lines 196-397), section heads, dark panels and how .dark re-points every token, the footer sign-up field and its success panel (664-689), and the measured header-nav widths that forbid a sixth nav item (77-123).
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/site.css — the token block (1-127), .btn (288-312), the light-ground field (996-1011), .sr-only and .hp (1013-1018), and the text-wrap rules that kill one-word last lines (169-174).
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/touch.css — what a phone gets that a pointer does not: small-caps links become 44px pills below 46rem, and the header's icon controls are 48px. Any new *-go class must be added here or written as a pill from the start.
- C:/Users/Light/Desktop/claude/theology compass/site/src/components/Hero.astro — the band component and its four picture treatments (photo / engraving / painting / night), the actions slot that keeps the primary button above the fold, and the two-ink title mechanism.
- C:/Users/Light/Desktop/claude/theology compass/site/src/styles/pages/home.css — the accepted picture-room language (lines 87-208): --room-ink per room, the 2.6rem mark, the glass CTA pill, and the scroll rail used instead of squeezing cards into a row.
- C:/Users/Light/Desktop/claude/theology compass/site/src/components/Icon.astro — the only icon vocabulary allowed, and the 24-grid / 1.6-stroke rules for drawing a new one (there is no lock, key, eye or check).
- C:/Users/Light/Desktop/claude/theology compass/site/public/img/CREDITS.md — what every picture is, where it came from, and therefore which are already spoken for; plus the size and licensing rules any new photograph must meet.
- C:/Users/Light/Desktop/claude/theology compass/design/DAWN-PASS-BRIEF.md — the picture grammar (photographs for sky, engravings for quizzes, paintings for articles) and a list of the owner's complaints, each of which is a rule not to repeat.
- C:/Users/Light/Desktop/claude/theology compass/design/CRITIQUE-ROUND-1.md — the adversarial screenshot critique. Skim it as a catalogue of the exact failure modes that got caught: empty dark slabs, unreadable 8.6px labels, disabled primary buttons, contradicting legends, phone rows that reflow per item.