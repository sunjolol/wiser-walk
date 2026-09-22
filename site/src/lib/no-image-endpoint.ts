/**
 * Astro's image endpoint, switched off.
 *
 * Astro puts an image-resizing route at /_image on every site with a server, whether or not
 * the site uses it, and this site does not: no page imports astro:assets. It sat harmless
 * while the server believed it lived at https://localhost, because it fetches the picture
 * from its own address and that fetch failed. Once astro.config.mjs told the server its real
 * address (2026-09-22), anyone could have asked it to enlarge any picture on the site to any
 * size, on the free plan's function time that sign-in and the result pages depend on. So the
 * route stays, and answers nothing.
 */
export const prerender = false;

export const GET = () => new Response('Not Found', { status: 404, headers: { 'cache-control': 'public, max-age=86400' } });
