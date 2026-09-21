# The article reading experience (brief from the main session, 2026-09-21)

## What the owner said (his words; he reviewed /articles/how-to-become-more-joyful/ at 375 x 667, an iPhone SE)

"On mobile the article navigation is not good, the bubbles should span the full width and each bubble
should only have as much height as the text requires to save vertical space, in fact I think on mobile it
needs a re-design in general to not use bubbles but dotted lines separating them. It makes no sense to
me to put the articles inside a content box for mobile when mobile already has very limited width...
Use the highest and best modern mobile standards to redesign both the navigation and the article box
itself for mobile so the articles are easier to read on mobile and as engaging/hooking as possible...
articles in general are a MASSIVE industry and MASSIVELY studied... literally every pixel has been
perfected to make the flow as engaging and high-retention/high-converting as possible, use those same
standards... Another feature I wish we had for both mobile and desktop is a progress bar to show how
much of the article you've read... if there's anything else missing from our articles that the best
article/news sites use to improve their SEO *and* user-experience, implement those also."

Standing rulings that apply: SEO and ranking come first and substance stays VISIBLE on the page; the
visual language is settled (tokens in `site/src/styles/site.css`, kit in `kit.css`: reuse it, invent no
new colours, radii or shadows); phone first; buttons not tiny links on a phone (44 px targets);
no one-word last lines; nothing that looks undesigned, glitchy or like an afterthought; flat untextured
panels are disliked; light theme is the default and dark must work; capitalise God, Jesus, the Holy
Spirit and Their pronouns in any NEW copy; British spelling; no em dashes in new copy.

## Files you own (work ONLY in this worktree: C:/Users/Light/AppData/Local/Temp/ww-articles)

`site/src/pages/articles/[slug].astro`, `site/src/styles/pages/prose.css`, a new
`site/src/components/ReadingProgress.astro` (and other new components under `site/src/components/` if
needed), `site/src/content.config.*` (schema: add an optional `answer` string), the eleven
`site/src/content/articles/*.md` (FRONT MATTER ONLY: add `answer:`; do not touch the body), and
`site/scripts/seo-test.mjs` only if a new check is warranted. Do NOT touch `Base.astro`, `kit.css`,
`Hero.astro` or anything else. Do not commit, push, stash, reset or checkout. No `npm install`.
`site/node_modules` is a junction to the main checkout: never delete or modify it.

## What to build

### 1. The phone (up to about 46rem). This is the priority.

- **The article is not in a box.** On a phone the body text sits straight on the page with the page's
  own gutter (about 20 px), using the full width. No card, no inner padding eating the measure, no
  border radius around the prose. (The band/hero above stays as it is.) If a ground is wanted behind the
  text it is full-bleed, edge to edge.
- **Type for reading:** body 18 px (1.125rem), line-height about 1.7, paragraph spacing about 1.2em,
  `text-wrap: pretty`, ink at full contrast, links clearly underlined. The standfirst (the first
  paragraph with the gradient bar) a step larger. H2s big enough to land on when skimming, with generous
  space above and the site's short gradient rule. Scripture and other quotations styled as real
  blockquotes that are pleasant to read (the site's serif, a gradient bar, no box).
- **Contents, redesigned:** no bubbles. A single compact block directly under the band:
  one meta line ("Published 1 September 2026 · 6 min read"), then "In this article" as a list of
  full-width rows: number, title, each row only as tall as its text needs but never under 44 px of tap
  height, separated by DOTTED lines (the kit's dotted rule, as in `.spec`), a chevron or arrow at the
  right. It must not look like a form or a settings screen: it is a table of contents in the site's
  manner. Decide from captures whether it is open by default or a `<details>` that opens on tap showing
  "In this article · 5 sections": at 375 x 667 the reader should reach the first paragraph of the
  article within roughly one screen of scrolling past the band. Whichever you choose, the links stay in
  the HTML (search engines use them for "jump to" links).
- The dark side card ("ARTICLE / Published / IN THIS ARTICLE / ALL ARTICLES") is a desktop sidebar; on a
  phone it goes. "All articles" moves to the end of the article.
- **A slim sticky reading bar on the phone** (appears once the band has scrolled away): the progress
  line plus, in one row, the current section's title (truncated with an ellipsis) and "4 min left";
  tapping it opens the contents. Only ship it if it is genuinely clean at 375 px; if it is cramped, ship
  the progress line alone.

### 2. Reading progress, phone and desktop

A thin (3 px) bar fixed at the very top of the viewport, in the brand gradient (`--grad-r`), that fills
as the ARTICLE BODY is read (0 at the top of the article, 100 at its end, not the whole page with the
footer). Transform-based (`scaleX`), no layout shift, `prefers-reduced-motion` respected, hidden from
assistive tech (`aria-hidden`), works with the script blocked (just absent). Scroll handler must be
passive and cheap. Put it in `ReadingProgress.astro` and use it only on article pages.

### 3. Desktop (46rem and up)

Keep the two-column layout with the sticky sidebar, but: the sidebar's contents become the same clean
list (no bubbles), with **scroll-spy** (the section being read is marked, one consistent mark: same
size, same stroke, never an outline in one state and a fill in another) and the "min left" figure. The
prose keeps a readable measure (about 65 to 70 characters). The article panel may stay a panel on
desktop.

### 4. What the best article sites do that ours lack (implement these)

- **"In short" answer at the very top of the body**: a 40 to 50 word direct answer to the question the
  title asks, as visible text (search engines quote it as the snippet; readers get the point at once).
  Front matter `answer:`; write one for each of the eleven articles FROM THE ARTICLE'S OWN CONTENT (no
  new facts, no new claims; reverent capitals). Rendered as a designed block, not a bare box.
- **A visible breadcrumb** above or in the band area is NOT needed (the band carries the chip); but
  add `wordCount`, `timeRequired` (ISO 8601, e.g. PT6M) and `articleSection` to the BlogPosting JSON-LD
  that already exists in this template.
- **Heading anchors**: every H2 gets a stable id (already there for the contents) plus
  `scroll-margin-top` so a jump does not hide the heading under the sticky bar.
- **End of the article, in this order** (the point where a reader decides to stay or leave):
  (a) a short "Try it" call to the quiz the article relates to (front matter `quizzes`; the existing
  `NextUp` component may already do this: make it the FIRST thing after the last paragraph, and make it
  feel like the natural next step, not an advert); (b) "Keep reading": two or three related articles with
  their pictures (the existing `ReadCard`s: keep, make sure they work at 375 px as full-width cards);
  (c) a share row: on devices with the Web Share API a single "Share this article" button
  (`navigator.share` with the title and canonical URL), otherwise "Copy link" with a confirmed state;
  buttons, 44 px, in the kit's style; no third-party scripts, no social network icons or trackers;
  (d) the "All articles" button.
- **Dates**: show "Published" and, only when front matter has `updated`, "Updated" as well.
- Images in article bodies (if any): `loading="lazy" decoding="async"` with width and height.
- Do NOT add: comments, pop-ups, newsletter modals, a second email box (the footer has one), infinite
  scroll, autoplay anything, related-content widgets from third parties, "you may also like" carousels.

## How to work and how to judge

- Start a dev server IN THIS WORKTREE: from `C:/Users/Light/AppData/Local/Temp/ww-articles/site` run
  `npx astro dev --port 4350` in the background (it runs `predev`? no: call astro directly, the data files
  are committed). Stop it when you finish (kill only the process you started).
- Capture with `sh "C:/Users/Light/Desktop/claude/theology compass/design/tools/shot.sh"`:
  `-m <url> <abs-out.png> <height> <width>` for a true phone width. Judge at **375 x 667** (his device),
  390 x 844, 768 and 1360, light and dark (`?theme=dark`), for at least three articles including the
  longest and `/articles/how-to-become-more-joyful/`. Save into
  `C:/Users/Light/AppData/Local/Temp/ww-articles/design/article-captures/`. Tall pages: capture with a
  tall height (e.g. 3000) and crop with Python PIL to look at the top, the contents, the body, a
  blockquote, and the end-of-article sequence. LOOK at every capture with the Read tool and fix what is
  wrong before you finish: cramped or uneven spacing, a one-word last line, anything boxed that should
  not be, tap targets under 44 px, the progress bar overlapping the header, a sticky bar that covers a
  heading after a jump.
- The progress bar and scroll-spy cannot be seen in a static capture at the top of the page: verify
  them by scrolling in a capture (the shot tool's iframe mode accepts a URL with a `#section-id` hash,
  which scrolls) and by reading the DOM state with a small script if needed.
- Run from `site/`: `node scripts/seo-plumbing-test.mjs` and `node scripts/engine-test.mjs`. Do not run
  `npm run build` (the Vercel adapter's last step fails through the node_modules junction; that is
  expected). Instead run `node node_modules/astro/astro.js build` and accept a failure ONLY at the very
  end in the adapter's copy step; the pages in `site/dist/client` must all have been generated. Then run
  the SEO guard against that output if it supports a path argument; if it does not, say so.
- Report: what you built, every design decision you took and why (especially open-or-collapsed contents
  and whether the sticky reading bar shipped), the list of capture files with one line each on what you
  judged, the eleven `answer` texts, and anything you could not verify.
