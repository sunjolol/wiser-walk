# Discoverability task list (the owner's answers of 2026-09-21; nothing here may be dropped)

He answered all fifteen items in `NEXT-NEEDS-HIS-SAY.md`. He wants ALL of it done "asap so I can move on
to another project", inside his weekly token limit. Tick items here as they ship.

## His steer, binding on every item

- **Discoverable, engaging, fun and easy to read "at all costs".** Interesting, informative, unique
  tidbits on every page. **No jargon without an explanation** (the educational angle is welcome). Content
  should read like the articles do, not like a technical reference.
- **Stop being "SUPER strict and overly-safe to not offend any one tradition".** Real data only and no
  invented facts still hold; timid, hedge-everything prose does not. Say interesting true things plainly.
- **Do not over-audit.** He called the 20-reviewer fairness audit "an enormous spend for very little
  gain". One careful writer and one editor per family is the ceiling; most effort goes to the items that
  pay the most. No multi-round adversarial reviews of content.
- **SEO and ranking come first, always.** (His correction, same day: "I don't want you over-doing this...
  if content genuinely fits outside of a popout, hover, etc. then that's not bloat, but optimal. Always
  optimize for SEO and ranking as highly as we can.") Substantive content goes ON the page as visible,
  crawlable text under clear headings: search engines give full weight to what is visible and little or
  none to what sits behind a pop-out or a hover. Pop-outs, hovers and separate pages are ONLY for true
  bloat: the same boilerplate repeated on every page, long legal or process detail, a definition already
  given once in the text. Never hide the content a searcher came for. Whatever is added must still be
  DESIGNED (the site's kit, never an undesigned box) and must not make the first screen worse.
- **Reverent capitals** in all the site's own words (memory: reverent-capitals).
- Every future article: aimed at what people actually search where little that ranks answers it well.

## Order of work (highest pay first)

- [x] **0. Round 1 live (shipped 2026-09-21, commit e16a341; he was told he can request indexing)** (titles, H1s, descriptions for 79 pages; links; 404; feed; IndexNow; guard). Tell
      him when it is live: he is waiting on it to request indexing (OWNER-ACTIONS step 2).
- [x] **0b. Reverent capitals pass (round 2; sweep of all built pages found no true misses; `design/tools/reverent-check.mjs`)** over all existing copy (sources, then rebuild; quotations untouched).
- [x] **2 + 9. Axis pages (round 2)** (six Compass axes first): everyday words beside the holders' terms ("speaking
      in tongues", "free will", "predestination", "infant baptism"), every term explained in a phrase, and
      a 40 to 50 word direct answer under a question heading at the top. Same for the articles' openings.
- [x] **1. The 18 tradition pages (round 2: similarity 48% -> 22%, ~340 -> ~980 words each)**: cut the repeated ~200-word explainer to a line or two (it is the same
      words on all 18, which is what makes them near-duplicates), and give each page its own short, lively profile: what marks this tradition out, where it
      sits and why, a genuinely interesting true detail, and the audit's own sources
      (`compass-audit.json` `simulations[].sources`) shown as what was read. Unique per page, and all of it VISIBLE on the page.
- [x] **3. The thin gift pages (round 2: all 19 now 700+ words)** (nine under 240 words: teaching, mercy, serving, giving, leading,
      encouraging, helps, administration, hospitality or whichever measure thin): expand to the standard
      of the long ones, article-like, from New Testament text already bundled.
- [x] **7. Reformation Day article (round 2; Advent and Lent still to come)**: must be live and indexed weeks ahead. Built from the axis
      content: what the Reformation actually argued about, both sides in plain words. Then Advent, then Lent.
- [ ] **8. Eight to twelve hand-built comparison pages** ("Lutheran vs Reformed", "Orthodox vs Catholic",
      "Calvinist vs Arminian", "Baptist vs Presbyterian" ...), with a HOME on the site that feels planned:
      a "Compare" area reached from the Articles menu (a dropdown entry, not a new top-level item), from
      the Compass page and from each tradition page involved.
- [ ] **4. Printable spiritual gifts test**: judged worth it (strongest demand signal in the audit; what
      ranks is gated, paid or scanned; low effort as a print stylesheet + a print page of the 57
      statements with a scoring key). Do not call it a PDF.
- [x] **5. Say what people may do with the site (round 2, on /about/ and in the footer)**: one line in the footer and a sentence on /about/
      ("Use it. Print anything here for a class, a small group or a church, or quote it, as long as you say
      where it came from and link back."), CC BY 4.0 for the words and data, not the Bible text or the
      paintings. One plain line in the footer; the detail lives on /about/.
- [ ] **6. The 18-tradition table as a dataset**: CSV download + `Dataset` markup + a small page.
- [x] **10. Contact on /about/ (round 2)**: info@wiserwalk.com (he made the mailbox).
- [ ] **11. Seven deadly sins: audit and publish.** A LEAN audit (one drafter-critic pass, one editor),
      then `status: 'live'`, indexable, its own search title and card. Rename pending (`FOOT_SHORT`).
- [ ] **12. /method/**: a short readable trust page; the 13,000-word log behind a link.
- [ ] **14. Article engine**: two a month, topics chosen from Bing's free Keyword Research once he has
      imported the site (OWNER-ACTIONS step 6); every article opens with the direct answer.
- [ ] **13. Self-host the two fonts** (after the content work; before/after captures).
- [ ] **15. Later, when there is traffic**: AVIF/srcset pipeline; per-page stylesheet split; embeddable
      result badge; Vercel Speed Insights; re-export the 511x768 humility image.

## Also open from round 1 (small)

- [x] H2 headings on axis and tradition pages still use the site's private vocabulary ("Where the
      traditions sit", "The two cases"): fold into items 2 and 1.
- [ ] A visible link to the article feed at the foot of /articles/.
- [ ] `AxisMap.astro` draws figures whose mask on an axis is none/both: check it is not an unintended
      placement claim (fold into item 3's neighbour, the figure-axis pages).
- [ ] Record `reads-sower.jpg` (Van Gogh, The Sower, June 1888, public domain, Wikimedia Commons file
      "The Sower.jpg") in `site/public/img/CREDITS.md` once round 2 has finished with that file. The
      Articles band was switched to it on 2026-09-21 (commit `ad6394c`, shipped from a clean worktree while
      round 2 was running): when round 2 is committed, rebase `seo/discoverability` onto `origin/main`.
- [x] **Article reading redesign (SHIPPED 2026-09-21, `fe3c4cb`; the worktree is removed):** unboxed prose on a phone, a
      dotted-line contents list instead of bubbles, a reading progress bar on phone and desktop, an "In
      short" answer at the top of each article, a better end-of-article sequence (quiz, keep reading,
      share, all articles). Being built in the isolated worktree `C:/Users/Light/AppData/Local/Temp/ww-articles`
      (branch `feat/article-reading`, brief in its `design/ARTICLE-READING-BRIEF.md`). `site/node_modules`
      there is a JUNCTION: remove it with `[System.IO.Directory]::Delete(path, $false)` BEFORE removing the
      worktree, never with rm -rf. Ship by pushing that branch to `main`, then rebase `seo/discoverability`.
- [ ] From round 2's integrator: the worship axis never says "worship band" or "contemporary worship" (the
      words a modern searcher types); three round-1 titles run 63 to 65 characters (/articles/,
      /axis/spiritual-gifts/interpretation/, /q/theology-compass/); the /about/ fairness panel's three
      buttons wrap two-and-one at 1360.
- [ ] Editor's judgement calls left for the owner: the Mainline profile says nothing about sexuality (the
      Compass has no axis for it); the National Baptist "kingdom" reading rests on preaching tradition, not
      a confession, and the profile says so.
- [ ] Article redesign leftovers (small): no article uses a Markdown blockquote, so the new quotation style
      shows nowhere yet (Scripture is quoted inline); the "Updated" date line has never rendered (no article
      has `updated:`); the desktop scroll-spy rule is segmented between rows; body images would need a rehype
      plugin for lazy loading and dimensions. The build guard now REQUIRES an `answer:` (30 to 70 words) in
      every article's front matter: every new article must have one.
- [ ] **Posting (owner, optional, his biggest lever):** the verified list with drafts is `WHERE-TO-POST.md`
      (2026-09-21). Waiting on him: a licence for the GitHub repo (needed for the two curated GitHub lists) and
      whether he wants help turning `demos/sounds-like-scripture.html` into an itch.io upload (cover image, tags).

