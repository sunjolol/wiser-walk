# Brief: one Bible figure's page, to Peter's standard

For one writer, who researches and writes one figure's page in a single pass. Read this whole file, then
`README.md` in this folder (top section "BIBLE FIGURE PAGES DRAWN LIKE A SAINT'S", "THE PERSON SHAPES THE PAGE"
and the owner's three rounds of notes), then the exemplar `site/src/data/figures/peter.json` and its shape
`site/src/lib/saints/types.ts`. Peter's page is live at /figure/peter/ and the owner said of it: "Peter's page looks
fantastic". Match its depth and voice, sized to your person's record.

## What you make, and the only files you touch

For your figure `<slug>` (the Bible figure quiz's slug, `site/src/data/bible-figures.json`):

| file | what |
|---|---|
| `site/src/data/figures/<slug>.json` | the page (SaintPage shape). Its existence switches /figure/<slug>/ to the new page |
| `design/saints-hub/research/people/<slug>-facts.json` | the evidence behind every claim: `{ subject, slug, page, checked_on, note, life: [{text, source, url}], ..., pictures, could_not_verify }` like `peter-facts.json` |
| `design/saints-hub/research/people/<slug>.quotes.json` | one entry per quotation the page prints (format in `tools/verify-quotes.mjs`) |
| `design/saints-hub/sources/people/<slug>/` | every text you fetch (gitignored: never commit it) |
| `site/public/img/figures/<slug>-band.jpg`, `<slug>-2.jpg` | the band picture and the second picture |
| `site/public/img/figures/<slug>-card.jpg` | the hub card, only where the person has no personality face (see Pictures) |

**Never touch anything else.** Other writers are working beside you. In particular: never overwrite
`site/public/img/figures/<slug>.jpg` (Doré's plate, used by the quiz and its share card); never edit
`site/public/img/CREDITS.md`, `design/og/cards.mjs`, any test, template, component, `lib/` file or another person's
files. Put your CREDITS.md rows in your final report instead (the table format of the "Bible figure pages" section
of CREDITS.md). Do not commit, do not push.

## The sources

- **Texts already on disk, use them first** (no need to fetch): `design/saints-hub/sources/shared/`
  - `bsb-berean-standard-bible.txt`: the whole Berean Standard Bible (66 books, no deuterocanon), one verse a line
    (`1 Kings 19:4<TAB>while he himself...`). **The page's own Bible lines quote the BSB.** Point evidence at this
    file (`"file": "shared/bsb-berean-standard-bible.txt"`) with the biblehub chapter as `url`
    (`https://biblehub.com/bsb/1_kings/19.htm`) and the reference as `ref`.
  - The Fathers: `anf01` (Clement of Rome, Ignatius, Polycarp, Justin, Irenaeus), `anf03` (Tertullian), `npnf106`
    (Augustine: the Sermon on the Mount, the Gospels, his sermons on the New Testament), `npnf109` to `npnf114`
    (Chrysostom), `npnf201` (Eusebius), `npnf203` (Theodoret, Jerome, Rufinus),
    `npnf205` (Gregory of Nyssa), `npnf207` (Cyril of Jerusalem, Gregory Nazianzen), `npnf208` (Basil), `npnf210`
    (Ambrose), `npnf211` (Sulpicius, Cassian), `npnf212` (Leo, Gregory the Great). Jerome's letters and commentaries are `npnf206`: fetch it from CCEL when needed.
  - Calendars: `martyrology-1916.txt` (the Roman Martyrology, 1916 English), `calendarium-romanum-1969-ocr.txt`,
    `usccb-2026cal.txt`, `cofe-calendar.txt`, `lff2022.txt` (Episcopal), `lsb-calendar.txt` (Lutheran, Missouri
    Synod), `elca-churchyear.txt`, `wikipedia-coptic-calendar.txt`.
- **How to fetch.** `curl -sL -A "Mozilla/5.0 (wiserwalk research)"` the page, then strip it to plain text with
  Python, and save it. WebFetch summarises through a model, so it can find leads but can never be the evidence for a
  quotation. For a Commons picture, the API gives the licence, the size and the original's address in one call:
  `https://commons.wikimedia.org/w/api.php?action=query&titles=File:NAME&prop=imageinfo&iiprop=url|size|extmetadata&format=json`
  (send a User-Agent: Wikimedia refuses requests without one).
- **Fetch what else the record needs** into `sources/people/<slug>/` as plain text: OCA or azbyka lives and
  synaxaria for the Orthodox day, the Coptic Synaxarium, Josephus (Whiston) where he tells the story, Philo, the
  Catholic Encyclopedia (1911), Britannica, the *Sayings of the Desert Fathers* in a public-domain translation,
  the apocryphal Acts (M. R. James 1924) for later legends, Wikipedia only as a lead, never as the source of a claim.
- **Translations must be public domain.** A modern copyrighted translation may be read for leads but never quoted.
- The deuterocanon (Sirach, Judith, Tobit, Maccabees) is not in the BSB: quote it from the World English Bible (the
  quiz's own translation) and say which Bibles hold the book.

## The page

- **Same sections as Peter, sized to the person.** Who was X? (40 to 60 words), At a glance (roles, numbers, tidbits,
  facts, the second picture, the type box, feasts), What others said, Life in N moments, Miracles (where the record
  has them: told as the source tells it, quoted, never hedged in our voice), Words (their own recorded words; a dark
  feature line), Often misquoted, Friends family and rivals (`circle`, where the record gives them), How he died (or
  how the record leaves him), Is he a saint?, What to read first (free copies, usually biblehub BSB chapters), People
  like him (`kin`), Sources. **No "What was he like?" (`traits`)**: the type box and the quiz's record ("Where the
  quiz places him", drawn by the template, nothing for you to write) already show temperament.
- **Thin records get short pages.** Never pad; never cap. A section with nothing checked is left out.
- **Where the record tells no death**, `death.title` renames the section (Elijah: "How he was taken up"); where it
  tells nothing at all about the end of a life, leave `death` out (a later legend goes in myths or a `later` note,
  named as later).
- **A section of the person's own** (`extras`) only for something truly central that no section holds (Peter has
  "The rock", each side in its own words). One at most, usually.
- **The type box**, only for a figure the Christian Personality Test names (`site/src/data/personality.json`, TYPES
  kindred and OPPOSITES people, by `img` key): set `type` and write `typeNote`, one to three plain sentences on why the
  test names them, built from the test's own words about them (Peter's is the model). Keep the pictures column short:
  no `gallery` for a typed figure.
- **Disputed things in each side's own words** (who wrote a letter, where someone is buried, what a passage means).
  Never pick a winner in our voice. Later legends are told as later and named as such, with their source and date.
- **Old Testament people:** "honoured as a saint in the Orthodox and Catholic calendars" (where the calendars show
  it), never "St Moses" or "Saint Elijah" as a name, anywhere on the page, the seo title included.
- **New Testament saints** may be called Saint in the seo title where searchers use it ("Saint Paul the Apostle").

## The rules the owner has made (all binding)

- **Real data only.** Every claim not common knowledge carries a `cite`; every quotation is word for word from a
  public-domain text you fetched, and has an entry in `<slug>.quotes.json`.
- **Capitals for God everywhere**, inside quotations too: God, Jesus, the Spirit, and every pronoun for Them (He, Him,
  His, You, Your, Me, My, Who, Whose). The BSB already does this; keep LORD as the BSB prints it.
- **Plain short sentences.** Comma stacks read as AI to him. No section numbers or § marks shown to readers: name the
  source and the chapter ("Antiquities, book 18", "1 Kings 19:4" is fine: that is a Bible reference).
- **Engaging, easy to read, not over-hedged.** Tell the story well. Numbers and tidbits a reader would repeat.
- **Book titles in italics** with `*...*` (Bible books, letters and chapters are not italic).
  `tools/italicize.mjs <folder>` lists the site's known titles; never run it with `--write` while other writers work
  in the same folder (it rewrites every file there): apply its suggestions to your own file by hand.
- **Status pill 50 characters at most** (usually no status at all for a Bible figure). seo title 65 characters or
  fewer; description 50 to 160, ending in a full stop. `published` and `modified`: today's date.
- **Number tiles make sense on their own** (the chip says what is counted, the lines finish the thought). No number
  forced in; a fact that is not a number is a tidbit.
- **No placeholder pictures**, and no picture the page already shows elsewhere.

## Pictures

- Two pictures: the band (`<slug>-band.jpg`, a painting or icon with the face clear, about 1800 px on the long side,
  about 300 KB) and a second picture (`<slug>-2.jpg`, often an icon or painting from the other half of the Church,
  about 1500 px, the page's `portrait`, with a plain caption). **Public domain or CC0 only**; read the licence tag
  on the Commons file page itself and record it. Colour paintings (he loves old art in colour). Nothing violent or
  gory in the band (for a martyr, a portrait, not the execution). Neither may be Doré's plate (`<slug>.jpg`) or the
  personality test's face (`/img/personality/faces/<slug>.jpg`).
- Resize with Python PIL (JPEG quality about 85). `width` and `height` in the data must be the file's own.
- `band.posM` and `band.posD`: the object-position that keeps the face in frame on a 390 x 335 phone crop and on a
  wide band. Look at the picture (a downscaled view is enough) and reason from where the face is.
- `card`: `{ line, img, focus }`. `img` is `/img/personality/faces/<slug>.jpg` where that file exists; otherwise cut
  a card of your own, `site/public/img/figures/<slug>-card.jpg`: a 4:5 crop (400 x 500) around the face from your
  band or second picture, about 40 KB, with `focus` "50% 30%" or wherever the face sits. The card is what the Saints
  hub shows for the person (every figure with a page joins the hub, except Jesus). `filters`: groups
  `["bible"]` (plus `"women"` for a woman), lived `"bible"`, side `[]`, and an alias string of other names and
  spellings.

## Before you finish (all must pass)

1. `node design/saints-hub/tools/verify-quotes.mjs <slug> site/src/data/figures/<slug>.json` exits 0. `--discover`
   fills entries for lines it finds in fetched texts (fill their empty `url` yourself).
2. `cd site && node scripts/saints-test.mjs` passes (listing lengths, the 40 to 60 word answer, feast order, marks,
   pictures on disk).
3. The dev server runs on port 4321. In Git Bash:
   `MSYS_NO_PATHCONV=1 node design/saints-hub/tools/measure-sheet.mjs /figure/<slug>/ 4321`.
   Numbers and pictures columns must not exceed the facts (`sheetTallerThanFacts` 0 to 8); fill the numbers column
   to within about one item of the facts with tidbits where the record has good ones; `phoneGallery` all "none".
   Do not take screenshots; the main session looks at the pages.

Report: what the page holds (moments, miracles, quotations, words), anything left out and why, any picture or
licence doubt, the CREDITS.md rows, and anything the owner should decide.
