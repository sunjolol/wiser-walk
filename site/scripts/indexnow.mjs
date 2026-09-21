/**
 * Telling the non-Google engines what changed, once a production build is done.
 *
 * IndexNow is a single POST that Bing, Yandex, Seznam, Naver, Yep and the Internet Archive all
 * read. Google does not take part, so this is honestly a Bing-family channel — which is not
 * nothing, because Bing's index is what DuckDuckGo, Yahoo and Ecosia serve. It only helps an
 * engine that already knows the domain exists, so the Bing Webmaster Tools import has to be
 * done first or this pings into empty air.
 *
 * What it does, in order:
 *
 *   1. Reads every built page out of .vercel/output/static and reduces each to its VISIBLE
 *      text, so a hash changes when the words change and not when a stylesheet gets a new
 *      content hash or an inline script is re-minified.
 *   2. Fetches the manifest the PREVIOUS production build left at
 *      https://wiserwalk.com/indexnow-manifest.json.
 *   3. Submits only the pages that are new or whose text has changed. The protocol's own
 *      guidance is not to resubmit the same URL many times a day, and pushing all ninety-seven
 *      on every deploy is how a site earns a 429.
 *   4. Writes this build's manifest into the static output, so the next build has something to
 *      compare against.
 *
 * With no manifest to fetch — the first run, or a request that fails — it falls back to the
 * sitemap's URLs, which is the honest "everything indexable" list.
 *
 * It runs ONLY when VERCEL_ENV is production, so a preview deploy and a local build ping
 * nothing, and it NEVER fails the build: every path out of here is caught and logged in one
 * line, because a search ping is not worth a red deploy.
 *
 * One race worth knowing about: this runs at the end of the build, and Vercel promotes the
 * deployment a moment later. An engine that fetched instantly would see the old page. They do
 * not fetch instantly, and the alternative (a post-deploy hook) is a piece of Vercel
 * configuration the owner would have to keep alive, so this is the deliberate trade.
 *
 * The exported halves are pure so scripts/seo-plumbing-test.mjs can drive them with a fake
 * manifest and a fake fetch, and nothing here touches the network when it is imported.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

export const HOST = 'wiserwalk.com';
export const ORIGIN = `https://${HOST}`;
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
/** The key, and the file under public/ that proves we own the host. Both must agree. */
export const KEY = '647669cddc8c149f889e007419fbd3fa';
export const KEY_FILE = `${KEY}.txt`;
export const MANIFEST_FILE = 'indexnow-manifest.json';
/** The protocol's own ceiling for one POST. The site is nowhere near it; the guard is cheap. */
export const MAX_URLS = 10000;

/**
 * A page reduced to the words a reader sees. Script, style, template and the whole head go,
 * then tags, then comments, then runs of whitespace. Deliberately crude: it only has to be
 * stable, not correct, because its one job is to answer "did this page's words change".
 */
export function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True unless the page asks not to be indexed. */
export function isIndexable(html) {
  const meta = /<meta[^>]+name=["']robots["'][^>]*>/gi;
  let m;
  while ((m = meta.exec(html))) {
    if (/noindex/i.test(m[0])) return false;
  }
  return true;
}

/** Short enough to keep the manifest small, long enough that a collision is not a worry. */
export function digest(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Sorted by code point rather than by locale. `localeCompare` would put the list in a
 * different order on a machine with different ICU data, and a manifest that reshuffles itself
 * is a manifest whose diff cannot be trusted.
 */
export function stableSort(urls) {
  return [...urls].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * What this build would submit. Pure: hand it the pages, the previous manifest and the
 * sitemap's URLs, and it answers with the manifest to write and the list to POST.
 *
 * A page that has been REMOVED is not submitted. IndexNow can carry a delete, but a URL
 * missing from one build is far more often a route that failed to render than a page somebody
 * meant to retire, and telling five engines to drop a page by accident is not recoverable in
 * an afternoon.
 */
export function plan({ pages, previous, sitemapUrls = [] }) {
  const manifest = {};
  for (const page of pages) {
    if (!isIndexable(page.html)) continue;
    manifest[page.url] = digest(visibleText(page.html));
  }

  const known = previous && typeof previous === 'object' ? previous : null;
  const urls = known
    ? Object.keys(manifest).filter(url => manifest[url] !== known[url])
    // Nothing to compare against: the sitemap is the site's own list of what it wants found.
    : stableSort(sitemapUrls).filter(url => url in manifest);

  return { manifest, urls: stableSort(urls).slice(0, MAX_URLS) };
}

/** The body IndexNow expects. Separated out so a test can read it without a network stub. */
export function submission(urls, key = KEY) {
  return {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: urls
  };
}

/** Every built page under a static output directory, as { url, html }. */
export function collectPages(staticDir) {
  const pages = [];
  const walk = (dir, prefix) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, `${prefix}${entry}/`);
      else if (entry === 'index.html') pages.push({ url: `${ORIGIN}${prefix}`, html: readFileSync(full, 'utf8') });
    }
  };
  walk(staticDir, '/');
  return pages;
}

/** The <loc> values of the built sitemap, if one was written. */
export function sitemapUrlsFrom(staticDir) {
  const urls = [];
  let files;
  try {
    files = readdirSync(staticDir).filter(f => /^sitemap-\d+\.xml$/.test(f));
  } catch {
    return urls;
  }
  for (const file of files) {
    const xml = readFileSync(join(staticDir, file), 'utf8');
    const loc = /<loc>([^<]+)<\/loc>/g;
    let m;
    while ((m = loc.exec(xml))) urls.push(m[1].trim());
  }
  return urls;
}

/**
 * The whole job, with every piece injectable so the test can run it without a build, without
 * the network and without a key file on disk.
 */
export async function run({
  staticDir = resolve(ROOT, '.vercel/output/static'),
  env = process.env,
  fetchImpl = globalThis.fetch,
  log = console.log,
  now = () => new Date().toISOString()
} = {}) {
  if (env.VERCEL_ENV !== 'production') {
    log(`indexnow: skipped (VERCEL_ENV is ${env.VERCEL_ENV ? `"${env.VERCEL_ENV}"` : 'unset'}, not production)`);
    return { skipped: true, submitted: 0 };
  }

  try {
    // The key must be reachable at the address we are about to name, or every engine 403s.
    const onDisk = readFileSync(resolve(ROOT, 'public', KEY_FILE), 'utf8').trim();
    if (onDisk !== KEY) {
      log(`indexnow: skipped (public/${KEY_FILE} does not hold the key this script submits)`);
      return { skipped: true, submitted: 0 };
    }

    const pages = collectPages(staticDir);
    if (pages.length === 0) {
      log(`indexnow: skipped (no built pages under ${staticDir})`);
      return { skipped: true, submitted: 0 };
    }

    let previous = null;
    try {
      const res = await fetchImpl(`${ORIGIN}/${MANIFEST_FILE}`, { headers: { accept: 'application/json' } });
      if (res.ok) {
        const body = await res.json();
        previous = body && typeof body.pages === 'object' ? body.pages : null;
      }
    } catch {
      // A manifest we cannot read is the same as a manifest that is not there yet.
    }

    const { manifest, urls } = plan({
      pages,
      previous,
      sitemapUrls: sitemapUrlsFrom(staticDir)
    });

    // Written whatever happens next, so one failed POST does not make the next build resubmit
    // the whole site.
    writeFileSync(
      join(staticDir, MANIFEST_FILE),
      JSON.stringify({ built: now(), pages: manifest }, null, 0)
    );

    if (urls.length === 0) {
      log(`indexnow: nothing changed across ${Object.keys(manifest).length} indexable pages`);
      return { skipped: false, submitted: 0 };
    }

    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(submission(urls))
    });
    log(
      `indexnow: ${urls.length} url${urls.length === 1 ? '' : 's'} ` +
      `${previous ? 'changed' : 'on the first run'}, endpoint answered ${res.status}`
    );
    return { skipped: false, submitted: urls.length, status: res.status };
  } catch (err) {
    // A search ping is never worth a failed deploy.
    log(`indexnow: gave up (${err && err.message ? err.message : String(err)})`);
    return { skipped: true, submitted: 0 };
  }
}

// Only when run as a script, never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  await run();
}
