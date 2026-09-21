# The dawn pass: carrying the home page's language to every other page

Written 2026-09-21. The home page, the footer, `/support/` and `/me/` are the exemplars and are LIVE.
The owner called the direction "definitely the right direction", then "almost there", then let it go
live. Everything else on the site still wears the older look (a pale wash band with a ghost word, stripe
cards stamped down the page, dotted spec lists). This pass brings those pages into the same family.

## Look before you touch anything

Capture these and LOOK at them (`sh design/tools/shot.sh <url> <ABSOLUTE-out.png> <w> <h>`, `-m` for a
true phone width, `python design/tools/crop.py <png> 1500` to slice): `/`, `/support/`, `/me/`,
`/articles/`. Then read `site/src/pages/index.astro`, `site/src/styles/pages/home.css`,
`site/src/styles/pages/reads.css`, `site/src/styles/pages/support.css`, the footer block in
`site/src/styles/kit.css`, `site/src/lib/art.ts`, `site/public/img/CREDITS.md`.

## The idea

The brand's blue-to-orange is a sky at first light, and the site is a walk. Pictures carry the pages:

- **Photographs** only for sky and landscape (the dawn sky, the walker at dawn).
- **Doré's engravings** (1866, public domain) for the quizzes, printed soft: `filter: sepia(.34)
  contrast(.9) brightness(1.06)`, under a warm dark gradient, white display type on top.
- **Public-domain paintings in colour** for the articles and for `/support/` (Millet, Van Gogh, Rembrandt,
  Bruegel...). The owner: he "really loves that type of art", does not want the engraving style over-used,
  and wants colour. Cousins, not twins.
- The Compass is an instrument on a dark starry ground with its real wheel. Games sit on a dark band over
  an old manuscript page with nearly solid cards.

## What the owner has said (every line here was a real complaint; do not repeat one)

- "SO much over-explanation of just about everything, SO much inside baseball". No process talk (audits,
  reviewers, how it was made, what draft means) on pages whose job is to get someone into a quiz, a game
  or an article. Say a thing once, where it is needed.
- "everything is templated... a soup of dullness". Do not stamp one card down a page. Each product has its
  own picture, its own ink and its own mark.
- "WE NEED GRAPHICS AND PHOTOS". "why is there literally ZERO icon/graphic usage". A mark wherever a box
  would otherwise have to be read to be understood. `Icon.astro` has: compass, flame, scroll, book, arrow,
  users, sparkle, mail, pencil, clock, quote, play, path, apple. Draw a new one in the same 24-grid,
  1.6-stroke language if a box needs one that is not there. Never a decorative blob with no meaning.
- "you over-used the dotted lines". No dotted rules as decoration. Use space, or one hairline of the
  brand gradient.
- Pictures that are "way too much contrast... a hard clash with the softer tones", or that "don't get
  across the theme", or feel "random", are rejected. So is a picture that "fades into blank space", and
  using "the exact same background" twice on one page (the footer's walker is on every page: never use
  `hero-dawn.jpg` in a page's own band).
- "stop letting lines wrap on a single word, that looks super sloppy". `site.css` now sets `text-wrap:
  pretty` on running text and `balance` on headings and short copy. Give every new short block
  `text-wrap: balance`, and check your captures for a stranded last word.
- "making the user scroll to get to the [main] button is bad design". The primary action is in the band,
  above the fold, on a phone.
- "so much blank space above..." Bands are as tall as their content needs. No empty run above the chip.
  White text on a photograph must sit on the dark part of it and be readable on a phone.
- Cards that are squeezed to fit a row are rejected: use a scroll rail (see `.hm-rail` in home.css: swipe,
  drag, arrows, a fade only on a side that has more).
- Light theme is the default; dark must also work (`?theme=dark`, return with `?theme=light`).
- Phone first. Design at 390px, then widen. Judge at 390 and 1360, light and dark.

## Binding rules that predate this pass

- Real data only on every tile and chart. Every number computed from the registry, never typed.
- Both pole names wherever an axis is drawn. The answering scale is never coloured blue-to-orange.
- **Do not edit the result page instruments** (rails, wheel, outcome cards, category stack, share card
  drawing) or any audited copy (statements, axis summaries, bands, tradition data, gift and figure data,
  notes). You may change what stands AROUND them: bands, section heads, panels, spacing, marks.
- Never a percentage against a person. No tradition page gets a sources block.
- The Theology Compass is audited: its pages may be re-dressed, never re-worded in their audited parts.
- The games' generated HTML (`site/src/games/*.html`) is never hand-edited.
- House style for any new words: British spelling, plain and short, no em dashes, never the word "faith"
  in site chrome, nothing flattering, no promise the site may not keep (accounts and perhaps ads are
  coming; never say "nothing is stored" or "no account").
- Every picture added is recorded in `site/public/img/CREDITS.md` with its source. Public domain or
  Unsplash only. Resize to at most 1600 px wide, JPEG quality about 78, under roughly 250 KB.
- Do NOT commit and do NOT push.
