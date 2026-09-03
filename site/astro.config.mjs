import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Result pages are rendered on demand from the code in the URL, everything else is static.
export default defineConfig({
  site: 'https://wiserwalk.com',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  build: { format: 'directory' }
});
