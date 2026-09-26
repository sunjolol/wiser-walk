# Brief: one saint's full page, to Martin's and Polycarp's standard

For one writer, who researches and writes one saint's page in a single pass (the owner's efficiency steer of
2026-09-26: one Opus writer per person, one light check per group; quality must match the 23 live saint pages).

Read, in order:
1. This file.
2. `FIGURE-BRIEF.md` in this folder: its sections **The sources**, **The rules the owner has made** and **Pictures**
   bind you too (texts on disk, how to fetch, public-domain translations only, capitals for God, plain short
   sentences, italics, number tiles, no placeholder or repeated pictures, faces large and clear). Where it speaks of
   figures, read "saint"; where this file differs, this file wins.
3. `README.md` here: "THE PERSON SHAPES THE PAGE", the owner's three rounds of notes, "POLYCARP'S PAGE IS WRITTEN",
   and "Rules that bind every page".
4. Your person's section in `research/NEXT-12.md` (the leads, the hooks, the myths, the pictures already checked).
5. The shape `site/src/lib/saints/types.ts` and the exemplars: `site/src/data/saints/martin-of-tours.json` (the owner:
   "so engaging I read the whole thing ... I constantly found myself saying 'wow' out loud") and
   `polycarp-of-smyrna.json` (the newest, a saint outside the early-Christian quiz, like yours). For a person the
   Christian Personality Test names, also `antony-the-great.json` (`type`, `typeNote`, `kin`).

## What you make, and the only files you touch

| file | what |
|---|---|
| `site/src/data/saints/<slug>.json` | the page (SaintPage shape). Its existence puts the person on the hub, placed by the first year of the dates |
| `design/saints-hub/research/people/<slug>-facts.json` | the evidence behind every claim (`{ subject, slug, checked_on, life: [{text, source, url, verified}], ..., feasts, pictures, could_not_verify }`, like `polycarp-of-smyrna-facts.life.json` but in one file) |
| `design/saints-hub/research/people/<slug>.quotes.json` | one entry per quotation the page prints (format in `tools/verify-quotes.mjs`) |
| `design/saints-hub/sources/people/<slug>/` | every text you fetch (gitignored: never commit it) |
| `site/public/img/saints/<slug>.jpg`, `<slug>-2.jpg`, `-3.jpg` ... | the band, the portrait (the second picture), gallery pictures |
| `site/public/img/saints/<slug>-card.jpg` | the hub card: a 4:5 crop, 480 x 600, face centred left to right, eyes about 38% from the top |

**Never touch anything else**: not CREDITS.md, not `design/og/cards.mjs`, not a test, template, component, `lib/`
file, nor another person's page (the main session adds the links from other pages to yours). Put your CREDITS.md
rows in your report (the table format of the saints section of CREDITS.md). Do not commit, do not push.

## The page

- **Every section of a saint page**, sized to the record, each left out when nothing checked fills it: Who was X?
  (`who`, 40 to 60 words), At a glance (`roles` as "His path, in order", `numbers`, `tidbits` filling the dark column
  to the facts' height, `facts`, `portrait`, `gallery` on wide screens, `feasts`), What was he like? (`traits`, each
  shown by what the person did or said, with the line and its source), What others said (`said`), Life in N moments
  (`moments`), Miracles (`miracles`: told as the source tells it, quoted, later legends named as later, `doubt` in
  the doubters' own words), Words (`words`: a dark feature line, with its Greek or Latin as the ghost word if sourced),
  Often misquoted (`myths`), Friends, family and rivals (`circle`), How he died (`death`), Is he a saint? (`saint`),
  a prayer or passage they wrote (`prayer`, with `prayer.title` renaming the section when it is not a prayer),
  What to read first (`reads`, free copies), Sources.
- **Not for your person**: `wec` and `stood` (only the early-Christian quiz's 22 have them), `status` unless the
  person's standing truly needs a pill (50 characters at most).
- **`extras`**: at most one or two sections of the person's own, only for something genuinely central (Polycarp's
  "The letter from his church"; for Athanasius perhaps the Nicene fight and his five exiles; for Nicholas perhaps how
  the bishop became Santa Claus). Never to fill space.
- **Length**: as long as every part earns its place. The rich live pages run 3,000 to 6,300 words; a thin record
  (Nicholas's facts are few, his legends many) gets a shorter page with the legends told honestly as legends.
- **Disputed things in each side's own words**; never a winner picked in our voice. Hard topics stated plainly in both
  the holders' and the critics' words (a discernment audience will screenshot anything hidden or slanted).
- **Calendars**: every feast checked in the calendar texts on disk (`sources/shared/`) or the church's own page; West
  and East columns in calendar order, **bold** church names, and a note on why they differ.
- **Titles and SEO**: the searched form of the name ("Nicholas of Myra", "Athanasius of Alexandria"); `seo.title` 65
  characters or fewer with a hook varied from the other pages' titles; `seo.description` 50 to 160 characters ending
  in a full stop; `published` and `modified` today's date; `person.sameAs` to Wikipedia and Wikidata
  (`research/wikidata-qids.json`).
- **Hub filters**: `groups` from `GROUPS` in `site/src/lib/saints/data.ts` (fathers, desert, cappadocians, teachers,
  martyrs, women, bible, monks), `lived` (the buckets the live pages use: pre300, 300s, and so on), `side` (east,
  west, or both), `alias` (other names and spellings people search).
- **`circle` keys** only for people with a page (file names in `site/src/data/saints/` and `site/src/data/figures/`),
  plus the other three of this batch, which will exist: `nicholas-of-myra`, `ignatius-of-antioch`,
  `athanasius-of-alexandria`, `monica`.

## Pictures (FIGURE-BRIEF's rules, and these)

- Band `<slug>.jpg` (about 1800 px on the long side, face large and clear, colour where possible, nothing violent:
  for a martyr, a portrait, not the death), portrait `<slug>-2.jpg` (often from the other half of the Church), and for
  a person without a personality type, gallery pictures `-3.jpg` and on, as many as fit the pictures column without
  making the sheet taller. Public domain or CC0, the licence read on the Commons file page itself. Jan Luyken's 1698
  prints are already on several pages: use one only if nothing better exists. Modern icons are usually in copyright.
- `band.posM` and `band.posD` keep the face in view (a 390 x 335 phone crop; a 46%-wide, 26rem-tall panel on a wide
  screen). Look at each picture, downscaled, before choosing it.
- **A person the personality test names** (Monica): `card.img` is the test's face `/img/personality/faces/<slug>.jpg`
  (as for the typed figures); band and portrait must be other pictures; keep the pictures column short (no gallery).

## Before you finish (all must pass)

1. `node design/saints-hub/tools/verify-quotes.mjs <slug> site/src/data/saints/<slug>.json` exits 0 (`--discover`
   helps fill entries; fill every empty `url`; fix the page's words, never the evidence).
2. `cd site && node scripts/saints-test.mjs` passes.
3. In Git Bash, against the dev server named in your prompt:
   `MSYS_NO_PATHCONV=1 node design/saints-hub/tools/measure-sheet.mjs /saints/<slug>/ <port>`: the numbers and
   pictures columns end within about one item of the facts, never below them; `phoneGallery` all "none".
   Take no screenshots; the main session looks at the pages.
4. `tools/italicize.mjs` in dry-run mode only (other writers share the folder): apply its suggestions by hand.

Report: what the page holds (moments, miracles, quotations, words, extras, word count), anything left out and why,
any picture or licence doubt, the CREDITS.md rows, and anything the owner should decide.
