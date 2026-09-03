import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Everything is static except result pages, which are rendered on demand from the code
// in the URL — so any valid code has a permanent page without pre-building millions.
export default defineConfig({
  site: 'https://wiserwalk.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // Result pages are per-person and carry noindex; keep them out of the sitemap too.
      filter: page => !new URL(page).pathname.startsWith('/r/')
    })
  ],
  build: { format: 'directory' }
});
