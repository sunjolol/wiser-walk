/**
 * The two hiding switches, proved against real builds.
 *
 * Accounts ship switched off behind ACCOUNTS_READY (are there two PUBLIC values) and
 * ACCOUNT_LINKS_LIVE (may the public see any of this yet). Nothing else in the repository
 * checks that they actually hide anything, and both of them are one line away from being
 * wrong in a way no page visibly reports: a stray href, a form left outside its gate, the
 * Supabase SDK pulled onto every page by an import somebody tidied, or the conditional
 * hoisted script in Base.astro shipping in place of the quiz runner, which is a thing that
 * really happened on 2026-09-21 and is written up in that file.
 *
 * So this suite does not read the source. It BUILDS the site, four times, each time with a
 * different environment, and asks the built files what a visitor would actually get:
 *
 *   a. nothing set            the site exactly as it is today
 *   b. the demo values, production   a project behind it: the doors are public (since 2026-09-22)
 *   c. the demo values, preview      the doors open, because only the owner can open a preview
 *   d. nothing set again      so the working tree is left as it was found
 *
 * Build (c) is how the visible state is exercised. Nothing here edits config.ts, or any
 * other source file, at any point: a test that has to change the thing it is testing proves
 * only that it can change it back.
 *
 * It is NOT wired into `prebuild` or `npm run test`, on purpose. Four builds is half a
 * minute on a warm tree and several times that on a cold one, and the suites that run on
 * every build have to stay quick. Run it with `npm run test:switches` before flipping
 * ACCOUNT_LINKS_LIVE, and after anything that moves an account gate.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const ASTRO = resolve(ROOT, 'node_modules/astro/astro.js');
const OUTPUT = resolve(ROOT, '.vercel/output');
const STATIC = join(OUTPUT, 'static');
const CHUNKS = join(STATIC, '_astro');
const SERVER = join(OUTPUT, '_functions');

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);
/** True is the whole assertion; the message says what was true. */
const yes = (actual, what) => (actual ? ok(what) : fail(what));

// ------------------------------------------------------------------- the builds

/**
 * One build, with an environment built from scratch rather than inherited.
 *
 * The four names below are deleted case-insensitively: Windows treats environment names
 * that way, and a `public_supabase_url` left in a shell would otherwise make the "nothing
 * set" builds quietly not be that.
 */
const CLEARED = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_KEY', 'PUBLIC_ACCOUNT_LINKS', 'VERCEL_ENV'];

function envFor(extra) {
  const out = {};
  for (const [name, value] of Object.entries(process.env)) {
    if (CLEARED.some(drop => drop.toLowerCase() === name.toLowerCase())) continue;
    out[name] = value;
  }
  return { ...out, ...extra };
}

/**
 * `astro build` straight, not `npm run build`: the prebuild steps regenerate data and run
 * three other suites, all of which are already run on every build and none of which this
 * one is about. The output goes where it always goes, so the tree after build (d) is the
 * tree as it was found.
 */
function buildWith(label, extra) {
  const started = Date.now();
  const res = spawnSync(process.execPath, [ASTRO, 'build'], {
    cwd: ROOT,
    env: envFor(extra),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  const took = Math.round((Date.now() - started) / 1000);
  if (res.status !== 0) {
    const said = [res.stdout ?? '', res.stderr ?? ''].join('\n').trim().split('\n');
    console.log('  FAIL the build itself did not finish (' + label + ')');
    console.log(said.slice(-25).map(line => '       ' + line).join('\n'));
    console.log('\nswitches: the build failed, so nothing below was checked');
    process.exit(1);
  }
  console.log(`  ..   built in ${took}s`);
}

/**
 * The discoverability guard, run over the build just made.
 *
 * `npm run build` runs it as `postbuild`, and Vercel builds with `npm run build`; this file
 * builds with `astro build`, which skips it. So until 2026-09-22 the guard had only ever
 * read a build with accounts switched off, and the first real deploy with the two PUBLIC
 * values set failed on account pages that no earlier build had rendered. Running it after
 * each build here means a build with a project behind it is checked before Vercel does it.
 */
function guardPasses(label) {
  const res = spawnSync(process.execPath, [resolve(here, 'seo-test.mjs')], { cwd: ROOT, encoding: 'utf8' });
  const said = (res.stdout ?? '').split('\n').filter(line => line.includes('FAIL'));
  yes(res.status === 0, `the discoverability guard passes on the ${label} build` + (said.length ? `:\n${said.join('\n')}` : ''));
}

// -------------------------------------------------------- reading what was built

/** Every built page, as a site-shaped path: 'me/index.html', 'q/theology-compass/index.html'. */
function builtPages() {
  const found = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        found.push({ path: full.slice(STATIC.length + 1).split(sep).join('/'), file: full });
      }
    }
  };
  walk(STATIC);
  return found;
}

const pageText = path => readFileSync(join(STATIC, path.split('/').join(sep)), 'utf8');

/**
 * The site header of a built page and nothing else: the brand, the nav, the account pair and
 * the bulb. Found by the layout's own class, because the account pages open their band with a
 * <header> of their own.
 */
function headerOf(html) {
  const start = html.indexOf('<header class="site-head');
  if (start < 0) return '';
  const end = html.indexOf('</header>', start);
  return end < 0 ? html.slice(start) : html.slice(start, end);
}

/**
 * The module scripts a page loads, in order, each with the code that would run.
 *
 * Astro writes a small script inline and a larger one as a file, so both shapes count as a
 * script the page loads and neither is identified by its file name: what a chunk IS gets
 * decided by reading it.
 */
function moduleScripts(html) {
  const out = [];
  for (const tag of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/type="module"/.test(tag[1])) continue;
    const src = (tag[1].match(/src="([^"]+)"/) ?? [])[1] ?? null;
    out.push({
      src,
      file: src ? join(CHUNKS, basename(src)) : null,
      text: src ? readFileSync(join(CHUNKS, basename(src)), 'utf8') : tag[2]
    });
  }
  return out;
}

/** The quiz runner: it announces a finish, and it knows nothing about accounts. */
const isRunner = s => s.text.includes('ww:finished') && !s.text.includes('ww.acct.queue');
/** The account listener: the block in Base.astro that empties the queue. */
const isListener = s => s.text.includes('ww.acct.queue');

/**
 * Anything in a built chunk that names another chunk: a static import, a dynamic import,
 * and the `__vite__mapDeps` array a dynamic import's preloads are listed in. Deliberately
 * one blunt pattern over the whole file rather than a parser. The question being asked is
 * "could this page reach that code", so over-reaching is the safe direction to err in, and
 * a minifier that renames a helper cannot hide a file name that still has to be fetched.
 */
const CHUNK_REF = /(?:\.\/|\/?_astro\/)([A-Za-z0-9_.\-]+\.js)/g;

function refsIn(text, self) {
  const out = new Set();
  CHUNK_REF.lastIndex = 0;
  let found;
  while ((found = CHUNK_REF.exec(text))) if (found[1] !== self) out.add(found[1]);
  return out;
}

function chunkGraph() {
  const edges = new Map();
  if (!existsSync(CHUNKS)) return edges;
  for (const name of readdirSync(CHUNKS).filter(n => n.endsWith('.js'))) {
    edges.set(name, refsIn(readFileSync(join(CHUNKS, name), 'utf8'), name));
  }
  return edges;
}

/** Everything a page could end up running, following every edge to the end. */
function reachableFrom(html, edges) {
  const seen = new Set();
  const queue = [...refsIn(html, null)];
  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const next of edges.get(name) ?? []) queue.push(next);
  }
  return seen;
}

/** Every server chunk, which is where the on-demand pages live. */
function serverFiles() {
  const found = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.mjs')) found.push(full);
    }
  };
  walk(SERVER);
  return found;
}

/**
 * What a built server chunk's own condition evaluates to.
 *
 * The chunk imports the constant from another chunk, and both are plain ESM that Node can
 * load, so the answer comes from running the built file rather than from guessing at the
 * source. The import is given a fresh query each time: four builds write four versions of
 * the same path, and a module Node has already loaded is never read from disk again.
 */
async function importedValue(file, ident, stamp) {
  const text = readFileSync(file, 'utf8');
  for (const line of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
    for (const piece of line[1].split(',')) {
      const parts = piece.trim().split(/\s+as\s+/);
      const local = parts.length === 2 ? parts[1] : parts[0];
      if (local !== ident) continue;
      const from = resolve(dirname(file), line[2]);
      const mod = await import(pathToFileURL(from).href + '?switch-test=' + stamp);
      return { found: true, value: mod[parts[0]], from };
    }
  }
  return { found: false };
}

// ============================================================ a. nothing set at all

console.log('0. before anything is built');
{
  const dotEnv = resolve(ROOT, '.env');
  const holds = existsSync(dotEnv) ? readFileSync(dotEnv, 'utf8') : '';
  yes(
    !/^\s*PUBLIC_SUPABASE_/m.test(holds),
    'no local .env sets a PUBLIC_SUPABASE_ value, so a build with nothing set really has nothing set'
  );
  yes(existsSync(ASTRO), 'astro is installed and can be run directly');
}

console.log('\n1. a build with nothing set: the site exactly as it is today');
buildWith('nothing set', {});

/** Kept from this build, to be compared with the same chunk built for a preview. */
let runnerBytes = null;
let runnerName = '';

{
  const pages = builtPages();
  yes(pages.length > 50, `${pages.length} pages were built`);

  const doors = pages.filter(p => {
    const html = pageText(p.path);
    return html.includes('href="/account/') || html.includes('action="/account/');
  });
  const names = doors.map(d => d.path);
  yes(
    names.length === 1 && names[0] === 'account/setup/index.html',
    'nothing on the site points at /account/ except the setup page itself' +
      (names.length === 1 && names[0] === 'account/setup/index.html' ? '' : `, but ${names.join(', ')} does`)
  );

  yes(moduleScripts(pageText('about/index.html')).length === 0, 'an ordinary page loads no module script at all');

  const quiz = moduleScripts(pageText('q/theology-compass/index.html'));
  yes(quiz.length === 1, `the quiz page loads one module script (it loads ${quiz.length})`);
  if (quiz.length === 1) {
    yes(isRunner(quiz[0]), 'and that one script is the quiz runner, not the account listener');
    if (quiz[0].file) {
      runnerBytes = readFileSync(quiz[0].file);
      runnerName = basename(quiz[0].file);
    }
  }

  // The SDK is the heaviest thing accounts bring, and the one import that must never
  // wander. It is found by what is inside it rather than by its name, which rollup chooses.
  const sdk = readdirSync(CHUNKS)
    .filter(n => n.endsWith('.js'))
    .filter(n => readFileSync(join(CHUNKS, n), 'utf8').includes('GoTrueClient'));
  yes(sdk.length === 1, `exactly one chunk holds the Supabase SDK (found ${sdk.length})`);

  if (sdk.length === 1) {
    const edges = chunkGraph();
    const allowed = path => path.startsWith('account/') || path === 'me/index.html';
    const strays = pages
      .filter(p => !allowed(p.path))
      .filter(p => reachableFrom(pageText(p.path), edges).has(sdk[0]))
      .map(p => p.path);
    yes(
      strays.length === 0,
      strays.length === 0
        ? 'no page outside /account/ and /me/ can reach the Supabase SDK, by any import'
        : `these pages can reach the Supabase SDK: ${strays.slice(0, 6).join(', ')}`
    );
  }
}

// ======================================== b. a project behind it: the doors are public

console.log('\n2. a build with a project and VERCEL_ENV=production: the doors are public');
buildWith('production', {
  PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  PUBLIC_SUPABASE_KEY: 'sb_publishable_demo',
  VERCEL_ENV: 'production'
});
guardPasses('production');

{
  /*
   * Until 2026-09-22 this build proved the opposite: that production, with a project behind
   * it, still showed nobody a door. The owner switched ACCOUNT_LINKS_LIVE on that day ("yes
   * go public now"), so production now has to show exactly what a preview does, and build 1
   * above still proves that a build with no project shows none of it.
   */
  const me = pageText('me/index.html');
  const above = me.includes('<footer') ? me.slice(0, me.indexOf('<footer')) : me;

  yes(/<input\b[^>]*type="email"/.test(above), 'My profile offers an email field');
  yes(above.includes('Email me a link'), 'with the button that asks for a link');
  yes(above.includes('href="/account/sign-in/'), 'and a way in for somebody who already has an account');

  const head = headerOf(pageText('index.html'));
  yes(head.length > 0, 'the home page has the site header');
  yes(head.includes('href="/account/sign-in/'), 'the header offers "Log in"');
  yes(head.includes('href="/account/sign-up/'), 'and "Sign up"');
  yes(head.includes('My profile'), 'and "My profile" for a browser that is logged in');
  yes(!head.includes('My results'), 'and no longer says "My results"');

  const holders = serverFiles().filter(f => readFileSync(f, 'utf8').includes('Keep it on every device'));
  yes(holders.length === 1, `one server chunk holds the result page's account button (found ${holders.length})`);
  if (holders.length === 1) {
    const guard = readFileSync(holders[0], 'utf8')
      .match(/([A-Za-z_$][\w$]*)\s*&&\s*renderTemplate`[^`]*Keep it on every device/);
    yes(Boolean(guard), 'the button is still written behind the one condition');
    if (guard) {
      const answer = await importedValue(holders[0], guard[1], 'b');
      yes(answer.found && answer.value === true, `and in a production build it is now true (it is ${answer.value})`);
    }
  }
}

// ======================================= c. a preview, where the owner may look first

console.log('\n3. the same build with VERCEL_ENV=preview: the doors are open');
buildWith('preview', {
  PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  PUBLIC_SUPABASE_KEY: 'sb_publishable_demo',
  VERCEL_ENV: 'preview'
});
guardPasses('preview');

{
  const me = pageText('me/index.html');
  const above = me.includes('<footer') ? me.slice(0, me.indexOf('<footer')) : me;

  yes(/<input\b[^>]*type="email"/.test(above), 'My results now offers an email field');
  yes(above.includes('Email me a link'), 'with the button that asks for a link');
  yes(above.includes('href="/account/sign-in/'), 'and a way in for somebody who already has an account');

  // The header's pair, as it is printed. The script on the page adds ?next= to "Log in" in
  // the browser, so the built attribute is the plain address.
  const home = pageText('index.html');
  const head = headerOf(home);
  yes(
    head.includes('href="/account/sign-in/"') && head.includes('href="/account/sign-up/"'),
    'the home page header offers "Log in" and "Sign up"'
  );
  yes(!head.includes('My results'), 'in place of "My results", which the pair replaces');
  yes(
    home.includes('>Subscribe</button>') && !home.includes('>Sign up</button>'),
    'and the footer\'s newsletter button says "Subscribe", so "Sign up" means one thing on the page'
  );
  // The header's way to /me/ is now the account pair, so the results a guest's device holds
  // need a plain way back that does not read as "make an account".
  const foot = home.includes('<footer') ? home.slice(home.indexOf('<footer')) : '';
  yes(foot.includes('href="/me/"'), 'and the footer keeps a plain link to /me/ for results kept on the device');

  const quiz = moduleScripts(pageText('q/theology-compass/index.html'));
  const runners = quiz.filter(isRunner);
  const listeners = quiz.filter(isListener);
  yes(runners.length === 1, `the quiz page still loads exactly one runner (it loads ${runners.length})`);
  yes(listeners.length === 1, `and the account listener as a separate script (it loads ${listeners.length})`);
  yes(
    runners.length === 1 && listeners.length === 1 && runners[0].src !== listeners[0].src,
    'the two are two different files, so neither can have been served in place of the other'
  );

  if (runners.length === 1 && runnerBytes) {
    const now = runners[0].file ? readFileSync(runners[0].file) : Buffer.from(runners[0].text);
    yes(
      now.equals(runnerBytes),
      now.equals(runnerBytes)
        ? `the runner is byte for byte the file built with nothing set (${runnerName})`
        : `the runner changed: ${runnerBytes.length} bytes with nothing set, ${now.length} bytes here`
    );
  }

  // The other half of the production check. Without this, a condition that was false in
  // every build on earth would pass section 2 and prove nothing at all.
  const holders = serverFiles().filter(f => readFileSync(f, 'utf8').includes('Keep it on every device'));
  if (holders.length === 1) {
    const guard = readFileSync(holders[0], 'utf8')
      .match(/([A-Za-z_$][\w$]*)\s*&&\s*renderTemplate`[^`]*Keep it on every device/);
    if (guard) {
      const answer = await importedValue(holders[0], guard[1], 'c');
      yes(answer.found && answer.value === true, `and on a preview ${guard[1]} is true, so the same gate really is a gate`);
    }
  }
}

// ======================================== d. put the tree back the way it was found

console.log('\n4. building again with nothing set, so the tree is left as it was found');
buildWith('nothing set, again', {});

{
  const doors = builtPages()
    .filter(p => {
      const html = pageText(p.path);
      return html.includes('href="/account/') || html.includes('action="/account/');
    })
    .map(p => p.path);
  yes(
    doors.length === 1 && doors[0] === 'account/setup/index.html',
    'the built site is back to pointing at no account page but the setup page'
  );
  console.log('  ..   .vercel/output now holds a build with nothing set, which is the normal state');
}

console.log(failures === 0 ? '\nswitches: all checks passed' : `\nswitches: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
