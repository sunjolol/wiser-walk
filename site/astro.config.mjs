import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { QUIZZES } from './src/lib/engine/registry.ts';
import { outcomePathBase } from './src/lib/engine/types.ts';

/**
 * Every URL prefix owned by a quiz that is still a draft: its intro, its group pages and
 * the pages of its outcomes. A live quiz contributes nothing, so /tradition/ stays in the
 * sitemap exactly as it is.
 */
const draftPrefixes = QUIZZES.filter(q => q.status === 'draft').flatMap(q => [
  `/q/${q.slug}/`,
  `/axis/${q.slug}/`,
  ...(q.outcomes.length ? [`/${outcomePathBase(q)}/`] : [])
]);

/**
 * The one date on this site a crawler can check for itself.
 *
 * Google uses `lastmod` only where it is "consistently and verifiably accurate", so stamping
 * all ninety-seven pages with the build date would teach it to discount the field for the
 * whole domain. The articles are the only pages carrying a real date of their own, written in
 * their front matter by hand, so they are the only ones that get one: `updated` where a piece
 * has genuinely been rewritten, `published` otherwise. Everything else goes out with no
 * lastmod at all, which is the honest answer rather than a guess.
 *
 * The front matter is read here with a regex rather than through the content collection,
 * because a config file runs before `astro:content` exists. It reads exactly the two date
 * fields and nothing else, and a file it cannot make sense of is simply left out.
 *
 * Exported so scripts/seo-plumbing-test.mjs can drive it against fixture front matter.
 */
export function articleLastmod(dir) {
  const dates = new Map();
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return dates;
  }
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const matter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(new URL(file, dir), 'utf8'));
    if (!matter) continue;
    const block = matter[1];
    // A draft has no page, so it can have no sitemap entry either.
    if (/^draft:[ \t]*true[ \t]*$/m.test(block)) continue;
    const field = name => {
      const m = new RegExp(`^${name}:[ \\t]*(.+?)[ \\t]*$`, 'm').exec(block);
      return m ? m[1].replace(/^['"]|['"]$/g, '') : '';
    };
    const date = field('updated') || field('published');
    // A date we cannot read is a date we do not publish.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    dates.set(`/articles/${file.slice(0, -3)}/`, date);
  }
  return dates;
}

const lastmod = articleLastmod(new URL('./src/content/articles/', import.meta.url));

// Everything is static except result pages, which are rendered on demand from the code
// in the URL — so any valid code has a permanent page without pre-building millions.
export default defineConfig({
  site: 'https://wiserwalk.com',
  output: 'static',
  // Cookieless page-view counting. It sets nothing on the reader's device and follows
  // nobody between sites; what it records is which path was opened. Result codes are
  // stripped from result-page paths before the view is sent (see the beforeSend hook in
  // src/layouts/Base.astro). Described on /method/ under "Your answers".
  adapter: vercel({ webAnalytics: { enabled: true } }),
  // The hosts an on-demand route may believe it is being served from. Astro 5 ignores the
  // Host and X-Forwarded-Host headers unless the host is listed here, and falls back to
  // "localhost", so until 2026-09-22 every route on Vercel saw its own address as
  // https://localhost. What that broke: Astro's own origin check refused the site's no-script
  // newsletter form as a cross-site post, /api/auth/list and /api/auth/delete answered "Bad
  // origin." to the site's own pages, and the link in every account email would have opened
  // localhost. `*.vercel.app` is here for preview deployments; Vercel routes a request to this
  // project only by one of this project's own hosts, so no other project's host can arrive
  // here. The email links do not rely on this list at all: see api/auth/email.ts.
  security: {
    allowedDomains: [
      { protocol: 'https', hostname: 'wiserwalk.com' },
      { protocol: 'https', hostname: 'www.wiserwalk.com' },
      { protocol: 'https', hostname: '*.vercel.app' }
    ]
  },
  // Nothing on the site uses Astro's image resizer, and with the real host above it would
  // have become a free image-enlarging service for anybody. See src/lib/no-image-endpoint.ts.
  image: { endpoint: { route: '/_image', entrypoint: './src/lib/no-image-endpoint.ts' } },
  // Which Vercel environment this build is for, carried into the bundle as a plain value.
  // Vercel sets VERCEL_ENV for the build machine, not for the browser, and src/lib/account/
  // config.ts needs it to show the account's public entry points on a PREVIEW deployment and
  // nowhere else: the owner can open a preview, nobody else can. Anywhere without the
  // variable — a local build, a test bundled by esbuild — this is the empty string.
  vite: {
    define: {
      __WW_VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV ?? '')
    }
  },
  integrations: [
    sitemap({
      // Result and comparison pages are per-person and carry noindex; keep them out of the
      // sitemap too. So does every page belonging to a DRAFT quiz: its intro, its group
      // pages and its outcome pages all render `noindex`, and a sitemap entry for a page
      // that asks not to be indexed is a contradiction we were publishing — the
      // seven-deadly-sins draft was listed in all nine of its URLs.
      //
      // The prefixes are derived from the registry rather than typed here, so a quiz that
      // goes live, or a new draft, needs no edit in this file.
      // /me/ is the same contradiction in a different shape: it is one reader's own shelf,
      // it carries noindex, and there is nothing on it for anybody else to find. So is every
      // /account/ page: they are one person's own door, they carry noindex, and one of them
      // is opened from an email with a one-time token in its address.
      // The articles' feed is a feed, not a page: a reader subscribes to it, nobody lands on
      // it from a search result, and it is announced in the head of every page instead.
      filter: page => {
        const path = new URL(page).pathname;
        if (path.startsWith('/r/') || path.startsWith('/c/') || path === '/me/') return false;
        if (path.startsWith('/account/')) return false;
        if (path === '/articles/feed.xml') return false;
        return !draftPrefixes.some(prefix => path.startsWith(prefix));
      },
      serialize: item => {
        const date = lastmod.get(new URL(item.url).pathname);
        if (date) item.lastmod = date;
        return item;
      }
    })
  ],
  build: { format: 'directory' }
});
