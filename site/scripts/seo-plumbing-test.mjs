/**
 * Headless check of the search plumbing: the things a reader never sees and that therefore
 * nobody notices when they break.
 *
 * Three subjects, none of which needs a build, a server or the network:
 *
 *   the feed      src/pages/articles/feed.xml.ts, bundled with esbuild against a stubbed
 *                 content collection, so the XML it writes can be read character by character
 *   IndexNow      scripts/indexnow.mjs, driven with a fake previous manifest and a fake fetch,
 *                 so what it WOULD submit is asserted without a byte leaving the machine
 *   the dates     the sitemap's lastmod reader out of astro.config.mjs, against fixture front
 *                 matter and then against the eleven real articles
 *
 * Plus the two plain-file facts that have no other home: vercel.json's caching rules, and the
 * tie-break on every place articles are sorted. That last one is a source-text assertion on
 * purpose — the bug it guards against is one call site being changed and the others not, and
 * only reading all of them can catch that.
 *
 * Nothing here has a real IndexNow key in it except the site's own, which is public by
 * design: the protocol works by serving it at a known address.
 *
 * Run with `npm run test` in site/.
 */
import { build } from 'esbuild';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);
const is = (actual, expected, what) =>
  JSON.stringify(actual) === JSON.stringify(expected)
    ? ok(`${what}: ${JSON.stringify(actual)}`)
    : fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
const has = (haystack, needle, what) =>
  haystack.includes(needle) ? ok(what) : fail(`${what} — not found: ${needle}`);
const hasnt = (haystack, needle, what) =>
  haystack.includes(needle) ? fail(`${what} — found: ${needle}`) : ok(what);

/** esbuild plugin: replace a bare module specifier with a one-line stand-in. */
const stubs = mapping => ({
  name: 'stubs',
  setup(b) {
    const names = Object.keys(mapping);
    b.onResolve({ filter: /.*/ }, args =>
      names.includes(args.path) ? { path: args.path, namespace: 'stub' } : null
    );
    b.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({
      contents: mapping[args.path],
      loader: 'js'
    }));
  }
});

const bundle = async (entry, outfile, mapping) => {
  await build({
    entryPoints: [resolve(ROOT, entry)],
    outfile: resolve(ROOT, outfile),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    logLevel: 'silent',
    plugins: [stubs(mapping)]
  });
  return import(pathToFileURL(resolve(ROOT, outfile)).href);
};

const scratch = mkdtempSync(join(tmpdir(), 'ww-seo-'));

// ============================================================ 1. the feed, as pure XML
console.log('1. the feed: escaping and shape');
const feed = await bundle(
  'src/pages/articles/feed.xml.ts',
  'node_modules/.seo-plumbing-feed.mjs',
  { 'astro:content': 'export const getCollection = async () => globalThis.__ARTICLES__ ?? [];' }
);
{
  is(feed.escapeXml('Tom & Jerry'), 'Tom &amp; Jerry', 'ampersand');
  is(feed.escapeXml('<b>'), '&lt;b&gt;', 'angle brackets');
  is(feed.escapeXml('say "so"'), 'say &quot;so&quot;', 'double quote');
  is(feed.escapeXml("Job's friends"), 'Job&apos;s friends', 'apostrophe');
  // The ampersand has to be replaced FIRST or the entities it writes get escaped again.
  is(feed.escapeXml('&lt;'), '&amp;lt;', 'an entity in the source is escaped once, not twice');

  // 3 September 2026 was a Thursday.
  is(feed.rfc822(new Date('2026-09-03T00:00:00Z')), 'Thu, 03 Sep 2026 00:00:00 GMT', 'RFC 822 date');
  is(feed.rfc822(new Date('2026-12-25T13:07:09Z')), 'Fri, 25 Dec 2026 13:07:09 GMT', 'and a later one');
}

console.log('2. the feed: a whole document');
{
  const xml = feed.rssDocument({
    title: 'Wiser Walk articles',
    description: 'Short & practical reads',
    self: 'https://wiserwalk.com/articles/feed.xml',
    link: 'https://wiserwalk.com/articles/',
    items: [
      {
        title: 'Tongues & prophecy <today>',
        link: 'https://wiserwalk.com/articles/a/',
        description: 'One "quoted" thing',
        pubDate: new Date('2026-09-20T00:00:00Z'),
        enclosure: { url: 'https://wiserwalk.com/img/articles/a.jpg', length: 148258, type: 'image/jpeg' }
      },
      {
        title: 'Second',
        link: 'https://wiserwalk.com/articles/b/',
        description: 'Plain',
        pubDate: new Date('2026-09-03T00:00:00Z')
      }
    ]
  });

  has(xml, '<?xml version="1.0" encoding="UTF-8"?>', 'the XML declaration is first');
  has(xml, 'xmlns:atom="http://www.w3.org/2005/Atom"', 'the atom namespace is declared');
  has(
    xml,
    '<atom:link href="https://wiserwalk.com/articles/feed.xml" rel="self" type="application/rss+xml" />',
    'atom:link self points at the feed itself'
  );
  has(xml, '<title>Tongues &amp; prophecy &lt;today&gt;</title>', 'an item title is escaped');
  has(xml, '<description>One &quot;quoted&quot; thing</description>', 'a description is escaped');
  has(xml, '<guid isPermaLink="true">https://wiserwalk.com/articles/a/</guid>', 'the link is the guid');
  has(xml, '<pubDate>Sun, 20 Sep 2026 00:00:00 GMT</pubDate>', 'pubDate is RFC 822');
  has(
    xml,
    '<enclosure url="https://wiserwalk.com/img/articles/a.jpg" length="148258" type="image/jpeg" />',
    'the painting rides as an enclosure with a real byte length'
  );
  // lastBuildDate is the newest item's own date, never the hour of the build: a feed that
  // rewrote its header on every deploy would be reporting a change that never happened.
  has(xml, '<lastBuildDate>Sun, 20 Sep 2026 00:00:00 GMT</lastBuildDate>', 'lastBuildDate is the newest item');
  is((xml.match(/<item>/g) || []).length, 2, 'two items');
  is((xml.match(/<enclosure /g) || []).length, 1, 'and only the one with a picture carries an enclosure');

  // Every tag we open is closed, and nothing in the body is an unescaped ampersand.
  const bare = xml.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g);
  is(bare, null, 'no unescaped ampersand anywhere in the document');
  for (const tag of ['rss', 'channel', 'title', 'link', 'description', 'item', 'guid', 'pubDate']) {
    const open = (xml.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length;
    const close = (xml.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open === close) ok(`<${tag}> opens and closes ${open} time${open === 1 ? '' : 's'}`);
    else fail(`<${tag}>: ${open} opened, ${close} closed`);
  }
}

console.log('3. the feed: what the collection actually produces');
{
  const article = (id, title, published, extra = {}) => ({
    id,
    data: { title, description: `About ${title}`, published: new Date(published), tags: [], quizzes: [], draft: false, minutes: 4, ...extra }
  });
  // Deliberately handed over in an order no sort would produce, with three sharing a date.
  globalThis.__ARTICLES__ = [
    article('tame', 'How to tame your tongue', '2026-09-20T00:00:00Z'),
    article('worry', 'What the Bible says about worry', '2026-09-14T00:00:00Z'),
    article('humble', 'How to become more humble', '2026-09-20T00:00:00Z'),
    article('secret', 'A draft nobody published', '2026-09-21T00:00:00Z', { draft: true }),
    article('content', 'How to be content', '2026-09-20T00:00:00Z')
  ];

  const res = await feed.GET({ site: new URL('https://wiserwalk.com/') });
  is(res.headers.get('content-type'), 'application/rss+xml; charset=utf-8', 'served as a feed');
  const xml = await res.text();

  hasnt(xml, 'A draft nobody published', 'a draft is not in the feed');
  // The enclosure's length is the file's real size on disk. It is asserted here rather than
  // only on the pure builder because the path it reads is the one thing about this feed that
  // was silently wrong once: resolved against the module it lives in, it points inside
  // dist/server after a build, and every enclosure disappears from the built file.
  is(feed.bytesOf('/img/articles/how-to-become-more-grateful.jpg'), 148258, 'a painting is measured off disk');
  is(feed.bytesOf('/img/articles/no-such-painting.jpg'), null, 'and a picture that is not there measures nothing');
  // The channel's own <link> is /articles/ with nothing after it, so the slug has to be
  // matched all the way to the closing tag or the empty one counts as an item.
  const order = [...xml.matchAll(/<link>https:\/\/wiserwalk\.com\/articles\/([^/<]+)\/<\/link>/g)].map(m => m[1]);
  // Newest first; the three that share 20 September fall into title order, which is the same
  // on Windows and on Vercel's Linux builder. Without the tie-break this is the file system's
  // order, and the two disagree.
  is(order, ['content', 'humble', 'tame', 'worry'], 'newest first, then by title');
  has(xml, '<link>https://wiserwalk.com/articles/worry/</link>', 'links are absolute');

  globalThis.__ARTICLES__ = undefined;
}

console.log('4. the same tie-break at every call site');
{
  const TIE = '|| a.data.title.localeCompare(b.data.title)';
  for (const file of [
    'src/pages/index.astro',
    'src/pages/articles/index.astro',
    'src/pages/articles/[slug].astro',
    'src/pages/articles/feed.xml.ts'
  ]) {
    has(readFileSync(resolve(ROOT, file), 'utf8'), TIE, `${file} breaks the tie by title`);
  }
}

// ==================================================== 5. what IndexNow would submit
console.log('5. IndexNow: the plan');
const indexnow = await import(pathToFileURL(resolve(ROOT, 'scripts/indexnow.mjs')).href);
{
  const page = (path, words, extra = '') =>
    ({ url: `https://wiserwalk.com${path}`, html: `<html><head><title>x</title>${extra}</head><body><p>${words}</p><script>var a=1</script></body></html>` });

  is(indexnow.visibleText(page('/a/', 'hello  there').html), 'hello there', 'visible text is the words and nothing else');
  is(indexnow.isIndexable(page('/a/', 'x').html), true, 'an ordinary page is indexable');
  is(
    indexnow.isIndexable(page('/a/', 'x', '<meta name="robots" content="noindex, follow">').html),
    false,
    'a noindex page is not'
  );
  is(
    indexnow.isIndexable(page('/a/', 'x', '<meta name="robots" content="max-image-preview:large">').html),
    true,
    'and max-image-preview is not mistaken for one'
  );

  const pages = [
    page('/b/', 'second'),
    page('/a/', 'first'),
    page('/private/', 'hidden', '<meta name="robots" content="noindex, follow">')
  ];

  // First run: no manifest at all, so the sitemap's own list is what goes.
  const first = indexnow.plan({
    pages,
    previous: null,
    sitemapUrls: ['https://wiserwalk.com/b/', 'https://wiserwalk.com/a/', 'https://wiserwalk.com/private/']
  });
  is(first.urls, ['https://wiserwalk.com/a/', 'https://wiserwalk.com/b/'], 'the first run submits the sitemap, sorted, minus the noindex page');
  is(Object.keys(first.manifest).sort(), ['https://wiserwalk.com/a/', 'https://wiserwalk.com/b/'], 'and the manifest holds only indexable pages');

  // Nothing changed.
  is(indexnow.plan({ pages, previous: first.manifest }).urls, [], 'an unchanged build submits nothing');

  // One page's words changed, one page is new, one page only changed its markup.
  const next = [
    page('/b/', 'second'),
    { ...page('/a/', 'first'), html: page('/a/', 'first').html.replace('<script>var a=1</script>', '<script>var a=2</script>') },
    page('/c/', 'brand new')
  ];
  const changed = indexnow.plan({ pages: next, previous: first.manifest });
  is(changed.urls, ['https://wiserwalk.com/c/'], 'only the new page goes: a rewritten script is not a changed page');

  const reworded = indexnow.plan({
    pages: [page('/a/', 'first'), page('/b/', 'second but different')],
    previous: first.manifest
  });
  is(reworded.urls, ['https://wiserwalk.com/b/'], 'a page whose WORDS changed does go');

  // A page that has vanished is never submitted: far more often a route that failed to render
  // than a page somebody meant to retire.
  is(indexnow.plan({ pages: [page('/a/', 'first')], previous: first.manifest }).urls, [], 'a page that disappeared is not announced');

  is(
    indexnow.stableSort(['https://wiserwalk.com/z/', 'https://wiserwalk.com/a/', 'https://wiserwalk.com/M/']),
    ['https://wiserwalk.com/M/', 'https://wiserwalk.com/a/', 'https://wiserwalk.com/z/'],
    'the sort is by code point, so it does not move with the machine’s locale'
  );
}

console.log('6. IndexNow: the request, against a fake fetch');
{
  const body = indexnow.submission(['https://wiserwalk.com/a/']);
  is(body.host, 'wiserwalk.com', 'host');
  is(body.key, indexnow.KEY, 'key');
  is(body.keyLocation, `https://wiserwalk.com/${indexnow.KEY}.txt`, 'keyLocation is where the key really is');
  is(body.urlList, ['https://wiserwalk.com/a/'], 'urlList');
  is(/^[0-9a-f]{32}$/.test(indexnow.KEY), true, 'the key is 32 hex characters');
  is(
    readFileSync(resolve(ROOT, 'public', indexnow.KEY_FILE), 'utf8').trim(),
    indexnow.KEY,
    'and public/<key>.txt holds exactly that key'
  );

  const staticDir = join(scratch, 'static');
  mkdirSync(join(staticDir, 'a'), { recursive: true });
  mkdirSync(join(staticDir, 'hidden'), { recursive: true });
  writeFileSync(join(staticDir, 'index.html'), '<html><body><p>home</p></body></html>');
  writeFileSync(join(staticDir, 'a', 'index.html'), '<html><body><p>page a</p></body></html>');
  writeFileSync(
    join(staticDir, 'hidden', 'index.html'),
    '<html><head><meta name="robots" content="noindex, follow"></head><body><p>hidden</p></body></html>'
  );
  writeFileSync(
    join(staticDir, 'sitemap-0.xml'),
    '<urlset><url><loc>https://wiserwalk.com/</loc></url><url><loc>https://wiserwalk.com/a/</loc></url></urlset>'
  );

  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined });
    if (url.endsWith(indexnow.MANIFEST_FILE)) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const lines = [];

  // Not production: it must do nothing at all, not even look for the manifest.
  const skipped = await indexnow.run({ staticDir, env: {}, fetchImpl, log: l => lines.push(l) });
  is(skipped, { skipped: true, submitted: 0 }, 'a local build submits nothing');
  is(calls.length, 0, 'and makes no request');
  is(lines.length, 1, 'and says so in one line');

  const out = await indexnow.run({
    staticDir,
    env: { VERCEL_ENV: 'production' },
    fetchImpl,
    log: l => lines.push(l),
    now: () => '2026-09-21T00:00:00.000Z'
  });
  is(out.submitted, 2, 'the first production run submits the two indexable pages');
  is(calls[0].url, `https://wiserwalk.com/${indexnow.MANIFEST_FILE}`, 'it looks for the previous manifest first');
  is(calls[1].url, indexnow.ENDPOINT, 'then posts to the shared endpoint');
  is(calls[1].init.method, 'POST', 'method');
  is(calls[1].body.urlList, ['https://wiserwalk.com/', 'https://wiserwalk.com/a/'], 'the noindex page is not submitted');

  const manifest = JSON.parse(readFileSync(join(staticDir, indexnow.MANIFEST_FILE), 'utf8'));
  is(Object.keys(manifest.pages).sort(), ['https://wiserwalk.com/', 'https://wiserwalk.com/a/'], 'and the manifest is written into the build for next time');
  is(manifest.built, '2026-09-21T00:00:00.000Z', 'stamped with when it was built');

  // Second run, now served that manifest: nothing has changed, so nothing goes.
  calls.length = 0;
  const quiet = await indexnow.run({
    staticDir,
    env: { VERCEL_ENV: 'production' },
    fetchImpl: async (url, init) => {
      calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined });
      if (url.endsWith(indexnow.MANIFEST_FILE)) return { ok: true, status: 200, json: async () => manifest };
      return { ok: true, status: 200, json: async () => ({}) };
    },
    log: l => lines.push(l)
  });
  is(quiet.submitted, 0, 'an unchanged deploy pings nobody');
  is(calls.length, 1, 'so only the manifest was fetched');
}

console.log('7. IndexNow: it can never fail a build');
{
  const staticDir = join(scratch, 'static');
  const lines = [];
  const angry = async () => { throw new TypeError('fetch failed'); };
  const out = await indexnow.run({ staticDir, env: { VERCEL_ENV: 'production' }, fetchImpl: angry, log: l => lines.push(l) });
  is(out.skipped, true, 'a dead network is survived');

  const missing = await indexnow.run({
    staticDir: join(scratch, 'nothing-here'),
    env: { VERCEL_ENV: 'production' },
    fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({}) }),
    log: l => lines.push(l)
  });
  is(missing, { skipped: true, submitted: 0 }, 'an empty build directory is survived');

  const exploding = await indexnow.run({
    staticDir,
    env: { VERCEL_ENV: 'production' },
    fetchImpl: () => { throw new Error('boom'); },
    log: l => lines.push(l)
  });
  is(exploding.skipped, true, 'a thrown fetch is survived');
  if (lines.every(l => l.startsWith('indexnow: '))) ok('every line it prints names itself');
  else fail('a log line does not say which script it came from');
}

// ================================================== 8. the sitemap's lastmod dates
console.log('8. lastmod: only where a real date exists');
const config = await bundle('astro.config.mjs', 'node_modules/.seo-plumbing-config.mjs', {
  'astro/config': 'export const defineConfig = c => c;',
  '@astrojs/sitemap': 'export default () => ({ name: "sitemap" });',
  '@astrojs/vercel': 'export default () => ({ name: "vercel" });'
});
{
  const dir = join(scratch, 'articles');
  mkdirSync(dir, { recursive: true });
  const write = (name, matter) => writeFileSync(join(dir, name), `---\n${matter}\n---\n\nBody.\n`);
  write('plain.md', 'title: Plain\npublished: 2026-09-03');
  write('rewritten.md', 'title: Rewritten\npublished: 2026-09-03\nupdated: 2026-09-19');
  write('hidden.md', 'title: Hidden\npublished: 2026-09-03\ndraft: true');
  write('undated.md', 'title: Undated\nminutes: 4');
  write('quoted.md', 'title: Quoted\npublished: "2026-09-11"');
  writeFileSync(join(dir, 'crlf.md'), '---\r\ntitle: Windows\r\npublished: 2026-09-05\r\n---\r\n\r\nBody.\r\n');
  writeFileSync(join(dir, 'notes.txt'), 'published: 2026-01-01');

  const dates = config.articleLastmod(pathToFileURL(dir + '/'));
  is(dates.get('/articles/plain/'), '2026-09-03', 'published is used when there is no updated');
  is(dates.get('/articles/rewritten/'), '2026-09-19', 'updated wins over published');
  is(dates.get('/articles/quoted/'), '2026-09-11', 'a quoted date is read');
  is(dates.get('/articles/crlf/'), '2026-09-05', 'CRLF front matter is read');
  is(dates.has('/articles/hidden/'), false, 'a draft gets no entry');
  is(dates.has('/articles/undated/'), false, 'and neither does a file with no date');
  is(dates.has('/articles/notes/'), false, 'only .md files are read');

  // And against the articles that actually ship.
  const real = config.articleLastmod(pathToFileURL(join(ROOT, 'src/content/articles') + '/'));
  is(real.size, 12, 'all twelve published articles have a date');
  const bad = [...real.entries()].filter(([, d]) => !/^\d{4}-\d{2}-\d{2}$/.test(d));
  is(bad, [], 'every one of them is a plain calendar date');
  is(config.articleLastmod(pathToFileURL(join(scratch, 'no-such-dir') + '/')).size, 0, 'a missing directory is not a crash');
}

// ================================== 8b. the address an on-demand route believes it has
console.log('8b. the host an on-demand route believes it is served from');
{
  // Astro's own request builder, the one the Vercel adapter calls, fed the headers Vercel
  // sends. With no allowed hosts it ignores them all and answers https://localhost, which is
  // what the live site did until 2026-09-22: its no-script newsletter form was refused as a
  // cross-site post, and the account email links would have opened localhost.
  const { NodeApp } = await import('astro/app/node');
  const allowedDomains = config.default?.security?.allowedDomains ?? [];
  const seen = headers =>
    new URL(NodeApp.createRequest({ method: 'GET', url: '/api/auth/health', headers, socket: {} }, { allowedDomains }).url).origin;
  const vercel = host => ({ host, 'x-forwarded-host': host, 'x-forwarded-proto': 'https' });

  is(seen(vercel('wiserwalk.com')), 'https://wiserwalk.com', 'the live site knows its own name, not localhost');
  is(seen(vercel('www.wiserwalk.com')), 'https://www.wiserwalk.com', 'and the www form');
  is(
    seen(vercel('wiser-walk-git-main-sunjo.vercel.app')),
    'https://wiser-walk-git-main-sunjo.vercel.app',
    'a preview deployment knows its own name'
  );
  is(
    seen({ host: 'wiserwalk.com', 'x-forwarded-host': 'evil.example.com', 'x-forwarded-proto': 'https' }),
    'https://wiserwalk.com',
    'a forwarded host that is not ours is not believed'
  );
}

// ============================================================== 9. vercel.json
console.log('9. vercel.json');
{
  const raw = readFileSync(resolve(ROOT, 'vercel.json'), 'utf8');
  let json;
  try { json = JSON.parse(raw); ok('parses as JSON'); } catch (e) { fail('does not parse: ' + e.message); json = {}; }

  is(json.crons?.[0]?.path, '/api/auth/health?ping=1', 'the account health cron survived');
  const value = source => json.headers?.find(h => h.source === source)?.headers?.[0]?.value;
  // The adapter already asks for this and it has never fired: its own immutable rule sits
  // after the filesystem phase marker in the build output, so a file that EXISTS never
  // reaches it. Hence a headers block here, where Vercel reads it before that phase.
  is(value('/_astro/(.*)'), 'public, max-age=31536000, immutable', 'content-hashed assets are immutable');
  is(
    value('/(img|og|tex|fonts)/(.*)'),
    'public, max-age=604800, stale-while-revalidate=86400',
    'pictures and cards get a week, and a replaced one still lands inside a day'
  );
  is(
    value('/(favicon.ico|apple-touch-icon.png|icon-48.png|icon-96.png|icon-192.png|icon-512.png)'),
    'public, max-age=604800, stale-while-revalidate=86400',
    'the icon set, same reasoning'
  );
  // HTML must keep revalidating or a deploy is invisible.
  const html = json.headers?.find(h => /^\/\(\.\*\)|^\/$/.test(h.source));
  is(html, undefined, 'nothing here caches HTML');

  const redirect = json.redirects?.find(r => r.source === '/sitemap.xml');
  is(redirect?.destination, '/sitemap-index.xml', 'the conventional /sitemap.xml probe lands on the index');
  is(redirect?.permanent, true, 'permanently');
  // Left out deliberately: the canonical on every page already points at the slashed form,
  // and turning this on would change how the two on-demand routes (/r/ and /c/) are matched.
  is('trailingSlash' in json, false, 'no trailingSlash key');
}

// ============================================================== 10. the 404 page
console.log('10. the 404 page');
{
  const src = readFileSync(resolve(ROOT, 'src/pages/404.astro'), 'utf8');
  has(src, 'noindex={true}', 'it asks not to be indexed');
  for (const href of ['/quizzes/', '/games/', '/articles/', '/me/']) {
    has(src, `href: '${href}'`, `it offers a way to ${href}`);
  }
  // Buttons, not a row of small links: this is read on a phone more than anywhere else.
  has(src, 'class="btn"', 'the ways out are buttons');
}

rmSync(scratch, { recursive: true, force: true });

console.log(failures === 0 ? '\nseo plumbing: all checks passed' : `\nseo plumbing: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
