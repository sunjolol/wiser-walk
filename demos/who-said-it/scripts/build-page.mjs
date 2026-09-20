/*
 * build-page.mjs — game.src.html + a pool -> ../who-said-it.html
 *
 *   node scripts/build-page.mjs [--pool <path>]
 *
 * The default pool is pool.json when it exists, otherwise the development fixture
 * in work/. Paths resolve from import.meta.url because the repo path contains a
 * space. Mirrors demos/sounds-like-scripture/scripts/build-page.mjs.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PLACEHOLDER = '/*__POOL__*/';
const SLUG = 'who-said-it';

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
if (!Array.isArray(pool.items) || !Array.isArray(pool.speakers)) {
  console.error('The pool needs both a speakers array and an items array.');
  process.exit(1);
}

/* Compact, and with "<" escaped so no line can close the script element. */
const json = JSON.stringify(pool).replace(/</g, '\\u003c');

const out = join(root, '..', SLUG + '.html');
const html = src.replace(PLACEHOLDER, () => json);
writeFileSync(out, html, 'utf8');

/*
 * One line for the card the site draws on /games/.
 *
 * Only the line: no reference, no speaker, no tier, so a card cannot hand anyone an
 * answer. The choice is deterministic (hardest tier, nearest 78 characters, ties
 * broken by id), so the card changes only when the pool does, and the text goes
 * through the same display rule the game itself uses: typography only, no word
 * altered. A fixture pool never supplies one — its text is placeholder.
 */
function coverLine(items) {
  const display = t => {
    let s = String(t)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/\b(LORD|GOD)('S)?\b/g, (m, w, sfx) => w.charAt(0) + w.slice(1).toLowerCase() + (sfx ? "'s" : ''));
    if (s.length > 1 && s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    return s.trim();
  };
  const top = Math.max(...items.map(i => i.tier || 0));
  const pick = items
    .filter(i => (i.tier || 0) === top)
    .map(i => ({ id: i.id, text: display(i.t) }))
    .sort((a, b) =>
      Math.abs(a.text.length - 78) - Math.abs(b.text.length - 78) || (a.id < b.id ? -1 : 1))[0];
  return pick ? pick.text : null;
}

/*
 * The live site builds from its own copy (Vercel's root directory is site/, so it cannot
 * see demos/). Generated but committed, like site/src/data/compass.json. Never hand-edit
 * it; change game.src.html and rebuild.
 *
 * The copy is written whatever the pool, because site/src/pages/play/who-said-it.astro
 * imports it and the site would not build without it. The METADATA is what tells the
 * truth about a fixture: items 0, no cover line, fixture true — so no page on the site
 * can print a placeholder count or a placeholder line as though it were real. Rebuild
 * from the real pool before this game ships.
 */
const siteDir = join(root, '..', '..', 'site', 'src', 'games');
if (existsSync(siteDir)) {
  writeFileSync(join(siteDir, SLUG + '.html'), html, 'utf8');
  writeFileSync(join(siteDir, SLUG + '.meta.json'), JSON.stringify({
    items: pool.fixture ? 0 : pool.items.length,
    speakers: pool.fixture ? 0 : pool.speakers.length,
    built: pool.fixture ? null : (pool.built || null),
    cover: pool.fixture ? null : coverLine(pool.items),
    fixture: !!pool.fixture
  }, null, 2) + '\n', 'utf8');
  console.log('site    ' + resolve(siteDir));
  if (pool.fixture) {
    console.log('WARNING the site copy now holds PLACEHOLDER lines. Rebuild with --pool pool.json');
    console.log('        before shipping. Its meta reports 0 lines so nothing prints a fake count.');
  }
}

const tiers = pool.items.reduce((acc, it) => (acc[it.tier] = (acc[it.tier] || 0) + 1, acc), {});
const perSpeaker = pool.items.reduce((acc, it) => (acc[it.sp] = (acc[it.sp] || 0) + 1, acc), {});
const thin = Object.keys(perSpeaker).filter(k => perSpeaker[k] < 6);

console.log('pool     ' + relative(root, poolPath).replace(/\\/g, '/') +
            (pool.fixture ? '  (fixture: placeholder text)' : ''));
console.log('items    ' + pool.items.length);
console.log('speakers ' + pool.speakers.length +
            (thin.length ? '  (' + thin.length + ' with fewer than six lines)' : ''));
console.log('tiers    1:' + (tiers[1] || 0) + '  2:' + (tiers[2] || 0) + '  3:' + (tiers[3] || 0));
console.log('wrote    ' + resolve(out) + '  (' + Math.round(html.length / 1024) + ' kB)');
