# Being found: what only you can do (written 2026-09-21)

Every item is one sitting, free, and never needs doing again. They are in order of how much they
matter. Nothing here asks you to post on social media, run ads or keep anything up.

## 1. Put the site into Bing (about 10 minutes). The most valuable thing on this list

Today the site is in Google's index and no other. Bing's index is also what DuckDuckGo, Yahoo and
Ecosia search, and what several AI assistants read. Because Google Search Console is already
verified, Bing takes that as proof and needs no DNS record.

1. Go to **bing.com/webmasters** and sign in with a Microsoft account (make a free one if needed).
2. On "Add a site" choose **Import from Google Search Console** (not "add manually").
3. Sign in with the same Google account that owns the Search Console property and allow access.
4. Tick **wiserwalk.com** and press **Import**. It arrives already verified.
5. Open it, go to **Sitemaps**, and submit `https://wiserwalk.com/sitemap-index.xml`.
6. Go to **URL Submission** and submit `https://wiserwalk.com/` and
   `https://wiserwalk.com/q/theology-compass/`.

Do not later remove Bing's access to your Google account: Bing re-checks ownership through it.
Numbers take about two days to appear.

## 2. Ask Google to read the pages that matter (about 15 minutes). Do this AFTER I tell you the new headings are live

You asked Google to index the home page. Do the same for the pages built to be found, once their new
titles are live, so the daily allowance is not spent on the old versions. In **Search Console**,
paste each address into the bar at the top, wait for it to check, and press **Request indexing**:

- `https://wiserwalk.com/q/theology-compass/`
- `https://wiserwalk.com/q/spiritual-gifts/`
- `https://wiserwalk.com/q/bible-figure/`
- `https://wiserwalk.com/quizzes/`
- `https://wiserwalk.com/games/`
- `https://wiserwalk.com/play/sounds-like-scripture/`
- `https://wiserwalk.com/articles/`
- `https://wiserwalk.com/axis/theology-compass/grace/`
- `https://wiserwalk.com/axis/theology-compass/gifts/`
- `https://wiserwalk.com/articles/what-are-spiritual-gifts/`

If it says the daily limit is reached, do the rest tomorrow.

## 3. Brave Search (2 minutes)

Brave keeps its own index, which the Bing import does not reach. Go to
**search.brave.com/submit-url**, paste `https://wiserwalk.com/`, submit. No account.

## 4. faith.tools (about 10 minutes)

The one directory of Christian apps and tools the audit could confirm is alive, curated, free and
open to anyone. Read its criteria first (faith.tools/posts/selection-criteria), then submit at
**go.faith.tools/submit** with one line in the site's own words, for example: "Free Christian
quizzes and Bible games. Find which tradition your beliefs are closest to, which spiritual gifts you
show, and which person in the Bible you are most like. Free, no sign-up, no ads. Bible text: Berean
Standard Bible and World English Bible British Edition." They do not reply and give no timeline.
Submit and forget it.

## 5. Point your two other pages at the site (about 10 minutes)

Neither passes much weight, but today the GitHub repository is the ONLY thing that comes up when
someone searches the name, so it should lead somewhere.

- **GitHub** (github.com/sunjolol/wiser-walk): press the gear beside "About", set **Website** to
  `https://wiserwalk.com`, add a one-line description, and add topics such as `christian`, `bible`,
  `quiz`, `theology`, `bible-game`.
- **Ko-fi**: add `https://wiserwalk.com` as your website on your Ko-fi page.

## 6. A five-minute check, once a month

Put a repeating reminder in your calendar. For the first two months the number that matters is NOT
clicks: it is how many of the pages Google has indexed.

1. **Search Console -> Indexing -> Pages**: note how many are indexed, and the two lines "Discovered,
   currently not indexed" and "Crawled, currently not indexed".
2. **Search Console -> Performance**, last 28 days, sort **Queries** by impressions, glance at the top ten.
3. **Vercel -> Web Analytics -> Referrers**: the only place a real inbound link will ever show up.
4. Once Bing is connected: **Bing Webmaster Tools -> Keyword Research** gives real search volumes for
   free. Look up "what denomination am I", "spiritual gifts test", "am I Calvinist or Arminian",
   "which Bible character are you". Send me the numbers and the next round stops being guesswork.

Then close the tabs. Checking weekly on a new domain tells you nothing.

## What to expect, honestly

- **Weeks 3 to 6 (now to mid-October):** indexed pages should climb. If most of the pages are still
  "Discovered" or "Crawled, not indexed" by mid-October, the fix is inbound links, not more on-page work.
- **Weeks 6 to 12:** impressions on long, specific searches should appear before any clicks do: the
  axis, gift and figure phrasings, not "what denomination am I".
- **The big head terms** ("what denomination am I", "spiritual gifts test") are held by large, old
  sites. They are not a twelve-week expectation. The specific pages are where a new site wins first.

## The one thing that would help most, and is your call

Every auditor said the same thing: a brand-new domain with no other site linking to it is capped, and
a handful of real links matters more than everything above. Tools like this DO get written about
unprompted (a blog reviewed TheoCompass in February; a podcast did an episode on theology compass
quizzes), but only once they can be found. If you are ever willing to make a few one-off posts in
places that welcome them, it is the biggest lever there is. It is also the one most likely to go
wrong (most Christian forums remove a new account's first link), so it needs care: read each place's
rules on the day, lead with the game or a quiz result rather than the address, expect some removals.
If you would rather not, the long tail still works without it, only more slowly.

**Not worth your time** (the audit checked and ruled these out): Pinterest (needs ongoing pinning),
Vercel Speed Insights (nothing to measure until there are visitors), Wikipedia or Wikidata (not
allowed without independent coverage), paid directories.
