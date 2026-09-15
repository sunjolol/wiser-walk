import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

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
      // Result pages are per-person and carry noindex; keep them out of the sitemap too.
      filter: page => !new URL(page).pathname.startsWith('/r/')
    })
  ],
  build: { format: 'directory' }
});
