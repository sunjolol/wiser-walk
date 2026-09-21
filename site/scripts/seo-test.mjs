/**
 * The discoverability guard. Reads the BUILT site — .vercel/output/static, the bytes Vercel
 * actually serves — and fails the build on the defects that cost a page its listing. Runs as
 * `postbuild`, ahead of indexnow.mjs, so nothing is ever announced to a search engine that
 * this file would refuse.
 *
 * It checks the built output rather than the source on purpose. Every fault it looks for was
 * found in the round-1 audit by reading shipped HTML: a title cut off by a brand suffix, a
 * description sliced at 155 characters in the middle of a word, an <img> whose alt attribute
 * never reached the markup. A source-level check would have passed all three.
 *
 * What fails a build, from design/seo/ROUND-1-BRIEF.md:
 *
 *   an indexable page with no <title>            a title over 65 characters
 *   a missing or duplicate meta description      a description under 50 or over 160
 *   a description that ends mid-word             zero or several <h1>
 *   a missing canonical or og:image              an <img> with no alt attribute
 *   invalid JSON in a JSON-LD block              a sitemap URL that is noindex or unbuilt
 *
 * Two rules about what is measured. Lengths are measured on the DECODED text, because
 * "&amp;" is five characters in the file and one character in a search result. And the search
 * copy checks (title, description, canonical, og:image) apply only to indexable pages: a
 * noindex page has no listing to lose, so holding it to a description length would be
 * ceremony. Structure checks (one h1, alt on every image, valid JSON-LD) apply everywhere,
 * because those are faults wherever they sit.
 *
 * Duplicate titles fail as well as duplicate descriptions. The brief names the description,
 * but the two defects are the same defect, both were fixed in the same round, and a template
 * that regrows a shared title tail is exactly what this file exists to catch.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(ROOT, '.vercel/output/static');

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);

/* ------------------------------------------------------------------ reading the output */

/** Every built .html file, deepest last, as { file, path, html }. */
function pages(dir, found = []) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) pages(full, found);
    else if (name.endsWith('.html')) found.push(full);
  }
  return found;
}

/** The URL path a built file is served at: index.html -> /, a/index.html -> /a/. */
function urlPath(file) {
  const rel = relative(OUT, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

/**
 * HTML entities back to the characters a reader and a search engine see. Only what this
 * site's own escaping produces, plus numeric references, which Astro emits for the curly
 * quotes and the ellipsis the copy is full of.
 */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s =>
  String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : m));

const head = html => html.slice(0, (html.indexOf('</head>') + 1 || html.length + 1) - 1);

const titleOf = html => {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head(html));
  return m ? decode(m[1]).trim() : null;
};
/** An attribute's value, whichever order the attributes were written in. */
const metaOf = (html, key, kind = 'name') => {
  const re = new RegExp(
    `<meta[^>]*\\b${kind}=["']${key}["'][^>]*>|<meta[^>]*\\bcontent=["'][^"']*["'][^>]*\\b${kind}=["']${key}["'][^>]*>`,
    'i'
  );
  const tag = re.exec(head(html));
  if (!tag) return null;
  const c = /\bcontent=["']([^"']*)["']/i.exec(tag[0]);
  return c ? decode(c[1]).trim() : null;
};

const isNoindex = html => /<meta[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(head(html));
const hasCanonical = html => /<link[^>]*\brel=["']canonical["']/i.test(head(html));

/**
 * A description that stops in the middle of a word. There is no way to know a truncated
 * word from a short one by looking at it, so what is checked is the thing truncation always
 * leaves behind: no end. A finished sentence ends on a full stop, a question mark, an
 * exclamation mark or the ellipsis the clip() helper writes when it had to cut, optionally
 * inside a closing quote or bracket. "Others keep a thought and tu" ends on none of them.
 */
const ENDS_WELL = /[.?!…][)\]"'”’]?$/;

/* ------------------------------------------------------------------ the run */

console.log('seo guard: ' + relative(ROOT, OUT).split(sep).join('/'));

let files;
try {
  files = pages(OUT);
} catch {
  console.log('  FAIL no built output at ' + OUT + ' (run astro build first)');
  process.exit(1);
}
if (!files.length) {
  console.log('  FAIL no .html in the built output');
  process.exit(1);
}

const built = new Map();
for (const file of files) built.set(urlPath(file), readFileSync(file, 'utf8'));

const titles = new Map();
const descriptions = new Map();
let indexable = 0;
const problems = [];
const note = (path, what) => problems.push(path + ': ' + what);

for (const [path, html] of built) {
  const noindex = isNoindex(html);

  // ---- structure, on every page, indexable or not
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) note(path, h1s + ' <h1> (want exactly 1)');

  /* The attribute must be PRESENT; it may be empty, which is the right answer for a picture
     that carries no information a reader would miss. Astro compresses alt="" to a bare `alt`,
     so the check looks for the attribute name followed by = or by whatever ends it, rather
     than for `alt=`, which would fail every correctly-marked decorative band on the site. */
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\salt(?=[=\s>/])/i.test(tag)) note(path, 'an <img> with no alt attribute: ' + tag.slice(0, 90));
  }

  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      note(path, 'invalid JSON-LD: ' + e.message);
    }
  }

  if (noindex) continue;
  indexable++;

  // ---- the search listing, on indexable pages only
  const title = titleOf(html);
  if (!title) note(path, 'no <title>');
  else {
    if (title.length > 65) note(path, 'title ' + title.length + ' characters (max 65): ' + title);
    if (titles.has(title)) note(path, 'title duplicates ' + titles.get(title) + ': ' + title);
    else titles.set(title, path);
  }

  const description = metaOf(html, 'description');
  if (!description) note(path, 'no meta description');
  else {
    if (description.length < 50) note(path, 'description ' + description.length + ' characters (min 50): ' + description);
    if (description.length > 160) note(path, 'description ' + description.length + ' characters (max 160): ' + description);
    if (!ENDS_WELL.test(description)) note(path, 'description ends mid-word: ...' + description.slice(-40));
    if (descriptions.has(description)) note(path, 'description duplicates ' + descriptions.get(description));
    else descriptions.set(description, path);
  }

  if (!hasCanonical(html)) note(path, 'no canonical link');
  if (!metaOf(html, 'og:image', 'property')) note(path, 'no og:image');
}

console.log('1. pages');
if (problems.length) for (const p of problems) fail(p);
else ok(built.size + ' built, ' + indexable + ' indexable, all with one h1, a listing and valid JSON-LD');

// ---- the sitemap promises only pages that exist and want to be found
console.log('2. sitemap');
{
  /* sitemap-index.xml points at sitemap-0.xml, sitemap-1.xml and so on; the URLs are in
     those, so they are what is read. */
  const locs = [];
  for (const f of readdirSync(OUT)) {
    if (!/^sitemap-\d+\.xml$/.test(f)) continue;
    const xml = readFileSync(join(OUT, f), 'utf8');
    locs.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decode(m[1])));
  }

  if (!locs.length) fail('no sitemap URLs found in the built output');
  else {
    let bad = 0;
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const html = built.get(path);
      if (html === undefined) { fail('sitemap lists ' + path + ', which is not in the build'); bad++; }
      else if (isNoindex(html)) { fail('sitemap lists ' + path + ', which is noindex'); bad++; }
    }
    if (!bad) ok(locs.length + ' sitemap URLs, every one built and indexable');
  }
}

// ---- every published article answers its own title, where both readers can see it
console.log('3. articles');
{
  /*
   * The "In short" block. An article's title asks a question and the block answers it in
   * forty to fifty words of the article's own content: the reader gets the point before
   * deciding to read on, and a search engine has a short self-contained passage it can lift
   * whole. It is front matter (`answer`), so it is the one part of the reading page that can
   * silently go missing when somebody adds an article, and nothing else on the page would
   * look wrong without it.
   *
   * The band is 30 to 70 rather than 40 to 50: the target is the house rule for writing one,
   * and this is the point at which a passage has stopped being a snippet.
   */
  const articles = [...built].filter(([path]) => /^\/articles\/[^/]+\/$/.test(path));
  let bad = 0;
  if (!articles.length) { fail('no article pages in the build'); bad++; }
  for (const [path, html] of articles) {
    const block = /<aside[^>]*\bclass=["'][^"']*\binshort\b[^"']*["'][^>]*>[\s\S]*?<\/aside>/i.exec(html);
    if (!block) {
      fail(path + ': no "In short" answer — add `answer:` to its front matter');
      bad++;
      continue;
    }
    const ps = [...block[0].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    const answer = ps.length
      ? decode(ps[ps.length - 1][1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
      : '';
    const words = answer ? answer.split(' ').length : 0;
    if (words < 30 || words > 70) {
      fail(path + ': the "In short" answer is ' + words + ' words (40 to 50 is the target)');
      bad++;
    }
  }
  if (!bad) ok(articles.length + ' articles, every one answering its own title in a quotable passage');
}

console.log(failures ? '\nseo guard: ' + failures + ' problem(s)' : '\nseo guard: all checks passed');
process.exit(failures ? 1 : 0);
