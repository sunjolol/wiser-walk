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
import { readCapitals, applyCapitals } from './capitals.mjs';

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

/* Pronouns for God capitalised for display (capitals.mjs says why). Each named line gets
   its display text as item.d; item.t stays verbatim. A fixture has no real ids. */
let capitalised = 0;
if (!pool.fixture) {
  try {
    capitalised = applyCapitals(pool, readCapitals(join(root, 'capitals.json')));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

/* Compact, and with "<" escaped so no line can close the script element. */
const json = JSON.stringify(pool).replace(/</g, '\\u003c');

const out = join(root, '..', 'sounds-like-scripture.html');
const html = src.replace(PLACEHOLDER, () => json);
writeFileSync(out, html, 'utf8');

/* The live site builds from its own copy (Vercel's root directory is site/, so it cannot see
   demos/). Generated but committed, like site/src/data/compass.json. Never hand-edit it.
   A fixture pool is never written to the site. */
/*
 * One line for the card the site draws on /games/.
 *
 * The drawing used to be three grey bars, which reads as a skeleton that never loaded.
 * It shows a real line instead — and only the line. No reference, no verdict, no tier, so
 * a card still cannot tell anyone whether a line is in the Bible. The choice is
 * deterministic (hardest tier, nearest 78 characters, ties broken by id), so the card
 * only changes when the pool does, and the text goes through the same display rule the
 * game itself uses: typography and the capitals for God (item.d), no word altered.
 */
function coverLine(items) {
  const display = t => String(t)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\b(LORD|GOD)('S)?\b/g, (m, w, s) => w.charAt(0) + w.slice(1).toLowerCase() + (s ? "'s" : ''));
  const top = Math.max(...items.map(i => i.tier || 0));
  const pick = items
    .filter(i => (i.tier || 0) === top)
    .map(i => ({ id: i.id, text: display(i.d || i.t) }))
    .sort((a, b) =>
      Math.abs(a.text.length - 78) - Math.abs(b.text.length - 78) || (a.id < b.id ? -1 : 1))[0];
  return pick ? pick.text : null;
}

const siteDir = join(root, '..', '..', 'site', 'src', 'games');
if (existsSync(siteDir) && !pool.fixture) {
  writeFileSync(join(siteDir, 'sounds-like-scripture.html'), html, 'utf8');
  writeFileSync(join(siteDir, 'sounds-like-scripture.meta.json'), JSON.stringify({
    items: pool.items.length, sources: pool.sources.length, built: pool.built || null,
    cover: coverLine(pool.items)
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
console.log('capitals ' + capitalised + ' lines show pronouns for God capitalised');
console.log('wrote   ' + resolve(out) + '  (' + Math.round(html.length / 1024) + ' kB)');
