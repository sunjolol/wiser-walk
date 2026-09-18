/*
 * build-page.mjs — game.src.html + a pool -> ../sounds-like-scripture.html
 *
 *   node scripts/build-page.mjs [--pool <path>]
 *
 * The default pool is pool.json when it exists, otherwise the development
 * fixture in work/. Paths resolve from import.meta.url because the repo path
 * contains a space.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PLACEHOLDER = '/*__POOL__*/';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const real = join(root, 'pool.json');
const fixture = join(root, 'work', 'fixture-pool.json');
const poolPath = resolve(arg('--pool') || (existsSync(real) ? real : fixture));

if (!existsSync(poolPath)) {
  console.error('No pool found at ' + poolPath);
  process.exit(1);
}

const src = readFileSync(join(root, 'game.src.html'), 'utf8');
if (!src.includes(PLACEHOLDER)) {
  console.error('game.src.html no longer contains the pool placeholder ' + PLACEHOLDER);
  process.exit(1);
}

const pool = JSON.parse(readFileSync(poolPath, 'utf8'));
if (!Array.isArray(pool.items) || !Array.isArray(pool.sources)) {
  console.error('The pool needs both a sources array and an items array.');
  process.exit(1);
}

/* Compact, and with "<" escaped so no line can close the script element. */
const json = JSON.stringify(pool).replace(/</g, '\\u003c');

const out = join(root, '..', 'sounds-like-scripture.html');
const html = src.replace(PLACEHOLDER, () => json);
writeFileSync(out, html, 'utf8');

/* The live site builds from its own copy (Vercel's root directory is site/, so it cannot see
   demos/). Generated but committed, like site/src/data/compass.json. Never hand-edit it.
   A fixture pool is never written to the site. */
const siteDir = join(root, '..', '..', 'site', 'src', 'games');
if (existsSync(siteDir) && !pool.fixture) {
  writeFileSync(join(siteDir, 'sounds-like-scripture.html'), html, 'utf8');
  writeFileSync(join(siteDir, 'sounds-like-scripture.meta.json'), JSON.stringify({
    items: pool.items.length, sources: pool.sources.length, built: pool.built || null
  }, null, 2) + '\n', 'utf8');
  console.log('site    ' + resolve(siteDir));
}

const kinds = pool.items.reduce((acc, it) => (acc[it.k] = (acc[it.k] || 0) + 1, acc), {});
const tiers = pool.items.reduce((acc, it) => (acc[it.tier] = (acc[it.tier] || 0) + 1, acc), {});

console.log('pool    ' + relative(root, poolPath).replace(/\\/g, '/') +
            (pool.fixture ? '  (fixture: placeholder text)' : ''));
console.log('items   ' + pool.items.length +
            '  (bible ' + (kinds.b || 0) + ', deutero ' + (kinds.d || 0) + ', other ' + (kinds.o || 0) + ')');
console.log('tiers   1:' + (tiers[1] || 0) + '  2:' + (tiers[2] || 0) + '  3:' + (tiers[3] || 0));
console.log('sources ' + pool.sources.length);
console.log('wrote   ' + resolve(out) + '  (' + Math.round(html.length / 1024) + ' kB)');
