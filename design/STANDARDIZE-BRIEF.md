# Standardize pass (2026-09-22): the brief every builder follows

The owner reviewed the home/header pass and asked for the same treatment EVERYWHERE: "literally everywhere it
appears it should be standardized". He is exacting about visual polish (orphaned words, misalignment, uneven
spacing, clipped text, anything that looks unintentional) and dislikes clutter, "inside baseball" copy, and
anything that reads as random or AI-written.

## The standards (apply to every page you own)

1. **No icon tiles.** No little square or round icon box over or beside a card's or panel's title, anywhere.
   Inline icons inside chips ("clock 3 min") and on buttons (the arrow) stay. The small note markers on
   `.caveat` and `.correction` notes and the quiz's back-arrow `step-mark` stay (they are not card titles).
2. **Buttons, not small-caps text.** Every way in ("Start", "Play", "Read", "All quizzes", "All games",
   "All articles", "All comparisons") is a real pill at every width. Use the shared class `go-pill` (kit.css):
   give the element `class="go-pill"` and set its `color` to the card's ink; it draws the tint, the outline,
   the 44px height and the hover. Its arrow icon should be `size={16}`.
3. **Quiz cards look the same everywhere.** The Theology Compass is always the shared card
   `components/CompassCard.astro` (night starry ground, a real Eastern Orthodox wheel, words, facts, Start),
   props `kicker`, `say`, `level` (2 or 3). The other quizzes are the home page's engraving rooms: the Doré plate
   from `lib/art.ts` (`artFor(slug)`), printed soft sepia under a warm dark gradient, white Philosopher title with
   `text-shadow: var(--title-lift)`, one sentence, fact chips, a Start pill in the quiz's ink. Look at the home
   page (`src/pages/index.astro`, `src/styles/pages/home.css`, `.room`) and /quizzes/ for the reference.
4. **Game cards look the same everywhere.** Dark card, a giant faint glyph in the top left corner
   (`<span class="corner-ghost corner-ghost--ask">?</span>` for Sounds Like Scripture,
   `corner-ghost--quote` with `“` for Who Said It?; see kit.css and `components/GameCard.astro`), title, tagline,
   facts, a Play pill in the game's ink (orange-soft for Sounds Like Scripture, blue-soft for Who Said It?).
   **No "N real lines" chip anywhere** (the owner: they may stay on the game's own page only).
5. **No pointless text labels** (chips and kickers that only restate what the reader can see). No ghost words
   that read as random ("where", "spoke?", "eastern"): a ghost accent must mean something.
6. **Dark theme:** starry panels keep their texture and are DARKER than in the light theme (the tile swaps
   itself in site.css). Never add a dark-theme rule that replaces the starry texture with a flat, lighter colour.
7. **Words:** plain, short, warm. Capitalise God, Jesus, the Holy Spirit and every pronoun for Them in the site's
   own words (never alter quotations). Never invent a fact; check any claim against the code or data.
8. **Phone first.** Judge at 390 and 1360, light and dark, and check 768.

## How to work

- The dev server is ALREADY running at http://localhost:4322 (demo account keys; `?as=in` / `?as=out` switch the
  logged-in state in dev, `?theme=dark` forces dark). Do not start or stop servers.
- See pages ONLY with `sh "C:/Users/Light/Desktop/claude/theology compass/design/tools/shot.sh" <url> <abs.png> <w> <h>`
  (w >= 500) or `... -m <url> <abs.png> <h> [w=390]` for phones, then crop with python/PIL and READ the images.
  The phone mode loads the page in an iframe: lazy pictures far down may not load; capture a shorter page region or
  use your own throwaway headless Chrome over CDP for exact measurements. Never use the in-app browser tools.
- Edit ONLY the files you own (listed in your task). If you need a change in a file you do not own (kit.css,
  site.css, touch.css, Base.astro, index.astro, home.css, quizzes.astro, quiz.css, reads.css, CompassCard.astro,
  Card.astro, Icon.astro), do not make it: say exactly what and why in your report.
- Keep LF line endings (use the Edit tool; if you script with Python, open files with `newline=''`).
- Remove CSS that no longer matches anything in the files you own, and update any code comment your change makes
  untrue (this codebase keeps careful comments).
- Do not run `npm run build`, `npm test` or git commands that change state; do not commit.
- Report: files changed, what you verified at which widths/themes (with capture paths), anything left undone,
  and any change needed in a file you do not own.
