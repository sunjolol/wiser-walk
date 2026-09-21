# Discoverability, round 1: what gets built now (rulings by the main session, 2026-09-21)

The audit is in this folder: seven lenses (`crawl-and-index.md`, `speed-and-vitals.md`, `structured-data.md`,
`keywords-and-intent.md`, `content-and-linking.md`, `beyond-google.md`, `seo-plumbing.md`), a completeness
critic (`completeness.md`) and a skeptic who re-checked every high-impact claim (`skeptic.md`). **Where a lens
and the skeptic disagree, the skeptic's ruling stands.** Each finding carries its evidence, file and line:
read the ones named in your section before changing anything.

The owner: the project "HINGES on it being discoverable through normal searches"; he has no social
following and will not market. The domain is three weeks old with no inbound links, so the winnable
ground is the uncontested long tail, and the site's own internal link graph is its only authority.

## Hard limits for this round (every builder)

- **Audited wording is not touched.** No statement, pole name, band adjective, axis summary, history,
  passage, tradition position, figure placement or gift description changes. You may MOVE, LINK and
  RE-HEAD audited content; you may not rewrite it. Titles, meta descriptions, H1s and link lists are
  yours, and must be TRUE of the page and fair to every tradition: a title names both poles or neither,
  never picks a winner, never calls a position by a rival's word.
- **Nothing is invented.** No statistic, quotation, citation, search volume, author name or date. A
  `dateModified` comes from a real date or is omitted. The author is the Organization "Wiser Walk"
  (the owner stays faceless; do not add a person's name anywhere).
- **The design is settled.** No new components with a new look, no new colours, radii or shadows. A
  longer H1 must still set well: `Hero.astro` sizes its ghost word to the heading and takes a `long`
  prop, so check every changed heading at 390 px and 1360 px, light and dark, from captures. No
  one-word last lines. Buttons, not tiny links, on a phone.
- **No process talk** on pages whose job is to get someone into a quiz, a game or an article (no
  reviewer counts, no "how this was made"). Plain, warm, British spelling, no em dashes in NEW copy,
  never "faith" as a noun for the site.
- **Dropped by ruling, do not build:** FAQPage / HowTo / SoftwareApplication / sitelinks-searchbox
  markup (retired or misleading); the 153 `/compare/` pages; `/which-denominations/` or
  "am I Calvinist or Arminian" pages (they would compete with the axis pages); Quiz/education-Q&A
  markup for the games; image licence metadata; AVIF/srcset pipeline (later, when there is traffic);
  Pinterest; noindexing the tradition pages; a Person author.
- Builders work at the same time in one tree: touch ONLY the files your section lists; anything else
  goes under "needs". Do NOT commit, push, stash or checkout. No `npm install` (no new dependencies:
  the feed is written by hand). Never weaken a test. Never put backticks inside a double-quoted bash
  string.

## HEADS builder owns: site/src/lib/seo.ts, site/src/layouts/Base.astro, site/src/pages/axis/[quiz]/[axis].astro, site/src/pages/tradition/[slug].astro, site/src/pages/figure/[slug].astro

1. **The brand suffix** (crawl#4, plumbing#3/#4): `Base.astro` appends " — Wiser Walk" unconditionally.
   Make it conditional: append only when the result stays within 60 characters; use " | Wiser Walk"?
   No: keep the dash the site uses, just drop the suffix when it would push the title past 60.
2. **H1s that say what the page is** (keywords#2, plumbing#1, content#8; the skeptic's number one):
   the six Compass axis pages, the nineteen gift pages and the six figure-quiz axis pages ship one-word
   or lower-case H1s ("Table", "prophecy") under titles that already say the real thing. Use the
   searcher-facing string the template already computes (axis template about line 108) as the H1, in
   the site's two-ink headline manner, and keep the short name as the chip/kicker so nothing is lost.
   Gift pages: "The gift of prophecy" form, capitalised properly. Read keywords#2 and plumbing#1 for
   the exact strings proposed and the skeptic's caution; both poles named on any bipolar axis heading.
3. **Titles and descriptions for all 79 pages `seo.ts` does not cover**, from real page data:
   - tradition pages (plumbing#3, crawl#6): strip the parenthetical from the searchable name in the
     title (the long National Baptist title is 118 characters); build each DESCRIPTION from that
     tradition's own pole words already on the page (crawl#1 gives the pattern: "Eastern Orthodox on the
     Compass: firmly synergist on grace, sacramental at the table, ..."), so all eighteen differ. It is a
     sketch of typical adherents, not official teaching: keep that honest in the wording without
     spending forty characters on it.
   - gift pages (plumbing#4): drop the shared 47-character tail; lead with the gift and the passage.
   - figure pages (keywords#12): aim at the phrasings people use ("Bible characters like ...", "who was
     ... in the Bible") only where the page truly answers them.
   - the eleven articles (keywords#3): add `seo.ts` entries aimed at the Christian long tail ("what does
     the Bible say about ...", "how to ... as a Christian"), each TRUE of the article; per the skeptic,
     no flourish the article does not deliver ("all four lists" only if it has all four).
   - the six figure-quiz axis pages (content#11).
4. **Descriptions are never cut mid-word** (plumbing#5, beyond#2): replace the raw `slice(0,155)` (axis
   template about lines 115 and 123, and anywhere else you find one) with a helper that ends on a whole
   sentence or a whole word with no dangling punctuation, at most 158 characters. Same helper for the
   JSON-LD description.
5. JSON-LD on reference pages (structured#6, content#17): axis, tradition and figure pages are typed
   `Article` with none of Article's properties. Type them `WebPage` (with `about`, `isPartOf` the
   WebSite `@id`, `primaryImageOfPage` where a real image exists) and keep BreadcrumbList.
6. In `Base.astro` also: `<link rel="alternate" type="application/rss+xml" title="Wiser Walk articles"
   href="/articles/feed.xml">` on every page, and `og:locale` `en_GB`? No: the site is read worldwide and
   written in British-leaning English; use `en` semantics: set `og:locale` to `en_GB`. `og:image:alt`
   from the page's social card alt where one exists.
Capture every changed template at 390 (-m) and 1360, light and dark (dev server port 4381,
`sh design/tools/shot.sh`, into `design/seo/captures/`), LOOK at them, fix what is wrong.

## PLUMBING builder owns: site/astro.config.mjs, site/vercel.json, site/src/pages/404.astro (new), site/src/pages/articles/feed.xml.ts (new), site/src/pages/articles/[slug].astro, site/src/pages/articles/index.astro, site/src/components/ReadCard.astro, site/src/pages/index.astro (JSON-LD only), site/src/pages/q/[quiz].astro (JSON-LD only), site/src/pages/games.astro (JSON-LD and alt only), site/src/pages/play/*.astro (head only), site/scripts/indexnow.mjs (new), site/public/<key>.txt (new), site/package.json (scripts only), site/src/content.config.* (schema only)

1. Sitemap `lastmod` ONLY where a verifiable date exists (skeptic's ruling): the eleven articles, from
   front matter (`updated` if present, else `published`). Nothing else gets a lastmod. Add an optional
   `updated` date to the articles' schema; do not set it on any article.
2. `vercel.json` headers (speed#3): `/_astro/(.*)` -> `public, max-age=31536000, immutable`; `/img/(.*)`,
   `/og/(.*)`, icons -> `public, max-age=604800, stale-while-revalidate=86400`. Keep the cron. Add a
   redirect `/sitemap.xml` -> `/sitemap-index.xml` (crawl#16). No `trailingSlash` key.
3. A real 404 (crawl#3, plumbing#8; the skeptic notes result links already have their own): Base
   layout, noindex, one honest line, and button-shaped ways on: the quizzes, the games, the articles,
   My results. In the site's band language, small. Astro emits `404.html`; Vercel serves it.
4. A hand-written RSS 2.0 feed at `/articles/feed.xml` (plumbing#9, beyond#3): every published article,
   newest first, title, link, guid, pubDate, description, and the painting as an enclosure or
   media:content where the front matter has one. Valid XML, escaped, absolute URLs, `atom:link self`.
5. Article JSON-LD (structured#2, plumbing#11): `BlogPosting` with headline, description, image (the
   article's own picture, absolute URL, with width and height if known), datePublished, dateModified
   ONLY if `updated` exists, `author` and `publisher` = the Organization (`@id`
   `https://wiserwalk.com/#organization`, with the 512 logo), `mainEntityOfPage`, `isPartOf` the WebSite.
6. Stable article order (plumbing#7): sort by date, then by slug, everywhere articles are listed
   (index, related, home, feed), so Windows and Vercel agree.
7. Images (plumbing#13, content#10, content#14): width and height on every article and card image;
   `alt` present on the four hub band images (empty alt is right for decoration, but the attribute must
   exist); below-the-fold images `loading="lazy" decoding="async"`; the article hero keeps
   `fetchpriority="high"`.
8. `numberOfQuestions` is not a schema.org property (structured#7): delete it from the Quiz block.
   Organization `sameAs` on the home page (structured#4): the public GitHub repository and the Ko-fi
   page (`site/src/lib/support.ts` holds the URL). `/games/` gets an `ItemList` of the two games.
9. Game page heads (plumbing#17, structured#8, speed#7): same Google Fonts URL as the layout, add
   `og:image:alt` and `og:locale`, and the breadcrumb gains the Games step. Head only: never touch
   `site/src/games/*.html` (generated).
10. IndexNow (beyond#4, crawl#10; participants today: Bing, Yandex, Seznam, Naver, Yep): a random
    32-hex key in `site/public/<key>.txt`; `site/scripts/indexnow.mjs`, run as `postbuild` ONLY when
    `VERCEL_ENV=production`, that (a) hashes the visible text of every built, indexable page, (b) fetches
    the previous manifest from `https://wiserwalk.com/indexnow-manifest.json` (written into the static
    output by this same script each build), (c) POSTs only the NEW or CHANGED URLs to
    `https://api.indexnow.org/indexnow` (host, key, keyLocation, urlList), and (d) NEVER fails the build:
    every error is caught and logged in one line. First run with no manifest: submit the sitemap's URLs.
    Test it headlessly with a fake fetch.

## LINKS builder owns: site/src/pages/q/[quiz].astro (body only; the PLUMBING builder owns its JSON-LD: coordinate by not touching the frontmatter's jsonLd object), site/src/components/OutcomeIndex.astro, site/src/pages/games.astro (body only), site/src/content/articles/*.md, site/src/pages/quizzes.astro, site/src/styles/pages/*.css as needed for what you add (no new look)

1. The 25 figure pages are orphaned from their own quiz (content#7, crawl#12): `/q/theology-compass/`
   lists its 17 traditions at its foot through `OutcomeIndex.astro`; `/q/bible-figure/` lists nothing.
   Give the figure quiz the same index of its figures, and the gifts quiz an index of its nineteen gift
   pages, through the same component (it must stay generic: a quiz is data).
2. Links run one way (content#5, crawl#7): each quiz intro gains a short "Read next" row of the
   articles that truly relate (gifts quiz <-> "What are spiritual gifts?"; figure quiz <-> "What does it
   mean to be Christ-like?"; others only where the relation is real), using the existing `ReadCard` /
   `KeepGoing` patterns.
3. The eleven articles contain no links inside their prose (content#6): add contextual links where the
   words ALREADY in the sentence name something the site has a page for (a quiz, an axis, a gift, a
   figure, another article). Anchor text is the existing words. No sentence is rewritten to make room
   for a link, and nothing is added to quoted Scripture. Three to six per article is plenty.
4. `/games/` is 175 words (crawl#5, content#3; skeptic: put the prose here first): add a short,
   player-facing block under the two cards: what each game asks, how long a run takes, that every line
   is a real line from a real text, the three canons, that it is free and needs no sign-up. For
   players, not about how it was built. No invented example lines: if you quote a line, it must come from
   the verified pool in the game's data and be attributed exactly as the game attributes it.
Capture what you change at 390 (-m) and 1360 (dev server port 4382) into `design/seo/captures/`, LOOK,
fix.

## After the builders: the integrator adds site/scripts/seo-test.mjs (the guard, plumbing#12)

Run on the BUILT output as `postbuild` (before `indexnow.mjs`), failing the build on: an indexable page
with no title, a title over 65 characters, a missing or duplicate meta description, a description under
50 or over 160 characters or ending mid-word, zero or several H1s, a missing canonical or `og:image`, a
sitemap URL that is noindex or missing from the build, an `<img>` with no `alt` attribute, invalid JSON
in any JSON-LD block. House style of `site/scripts/email-test.mjs`.
