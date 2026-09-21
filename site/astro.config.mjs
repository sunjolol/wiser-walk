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
      // it carries noindex, and there is nothing on it for anybody else to find.
      filter: page => {
        const path = new URL(page).pathname;
        if (path.startsWith('/r/') || path.startsWith('/c/') || path === '/me/') return false;
        return !draftPrefixes.some(prefix => path.startsWith(prefix));
      }
    })
  ],
  build: { format: 'directory' }
});
