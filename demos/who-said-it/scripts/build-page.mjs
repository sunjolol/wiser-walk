/*
 * build-page.mjs — game.src.html + a pool -> ../who-said-it.html
 *
 *   node scripts/build-page.mjs [--pool <path>]
 *
 * The default pool is pool.json when it exists, otherwise the development fixture
 * in work/. Paths resolve from import.meta.url because the repo path contains a
 * space. Mirrors demos/sounds-like-scripture/scripts/build-page.mjs.
 *
 * The cover functions are exported so scripts/test-game.mjs can check the card the
 * site draws without writing any files; the build only runs when this file is the
 * program being run.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';
import { readCapitals, applyCapitals } from './capitals.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PLACEHOLDER = '/*__POOL__*/';
const SLUG = 'who-said-it';
const OPTION_COUNT = 4;
/* The card is about one line wide at three lines of display type. */
const IDEAL_LENGTH = 78;

/* ------------------------------------------------------------------ the card */

/*
 * What the site's card shows: one real line, and the four real names a player would
 * meet under it. Not which of them is right.
 *
 * The earlier card showed grey bars over four invented names with one of them lit up
 * as though it were the answer. This shows the first screen of the game and nothing
 * more: the line, four names, none marked, in alphabetical order so position says
 * nothing. That hands out no more than tapping Play does.
 *
 * Everything here is deterministic — the choice changes only when the pool does —
 * and the text goes through the same display rule the game itself uses: typography
 * and the capitals for God (item.d, from capitals.json), no word altered.
 */

/* The game's own displayText, byte for byte. */
function display(text) {
  let s = String(text)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\b(LORD|GOD)('S)?\b/g, (m, w, sfx) => w.charAt(0) + w.slice(1).toLowerCase() + (sfx ? "'s" : ''));
  if (s.length > 1 && s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  return s.trim();
}

/*
 * A name that reads as a person on a pill: one proper name, "Xerxes", "Ben-Hadad".
 * It is the true speaker this is asked of, not the distractors — the distractors are
 * whoever the game's rule offers, group names included, because that is what a player
 * sees. But a card headed by "The immoral woman" or "The ten explorers" states the
 * question as a description rather than as a name, and the pool has a hundred lines
 * that do not, so it takes one of those instead.
 */
function isNamedIndividual(name) {
  return /^[A-Z][A-Za-z'-]*$/.test(String(name || ''));
}

/* A dangling quote mark left by a speech that ran past its verse looks like a typo on
   a card. Other lines are available, so one is chosen instead. */
function isCleanlyEnded(text) {
  return !/^["']/.test(text) && !/["']$/.test(text);
}

const speakerMap = pool => {
  const by = {};
  for (const s of pool.speakers || []) by[s.id] = s;
  return by;
};

const inConflict = (pool, a, b) => {
  if (a === b) return true;
  const c = pool.conflicts || {};
  return (c[a] || []).indexOf(b) !== -1 || (c[b] || []).indexOf(a) !== -1;
};

const isDivine = (pool, id) => id === 'God' || inConflict(pool, 'God', id);
const hasBook = (s, book) => !!(s && s.books && book && s.books.indexOf(book) !== -1);

/* Kept in step with game.src.html's own RELAY_BOOKS: where a human voice carries God's
   words, a divine name is never a wrong option beside a human answer. */
const RELAY_BOOKS = {
  EXO: 1, LEV: 1, NUM: 1, DEU: 1, PSA: 1, ISA: 1, JER: 1, LAM: 1, EZK: 1, DAN: 1, HOS: 1,
  JOL: 1, AMO: 1, OBA: 1, JON: 1, MIC: 1, NAM: 1, HAB: 1, ZEP: 1, HAG: 1, ZEC: 1, MAL: 1, REV: 1
};

/*
 * The four names for one line, by the game's rule (SPEC "Speakers"): three other
 * speakers, distinct display names, none in conflict with the true one, same book
 * first, then the same Testament, then anyone left.
 *
 * The game shuffles within each of those three ranks against the run's seed. A card
 * has no run and must not move, so the ranks are walked in order of speaker id: a
 * stable key, and the only difference from the game.
 *
 * Returns the four display names sorted alphabetically, or null when three
 * distractors cannot be found — position then reveals nothing, and neither does this
 * file, which never records which of the four is the speaker.
 */
export function coverNames(pool, item) {
  const byId = speakerMap(pool);
  const answer = byId[item.sp];
  if (!answer) return null;

  const sameBook = [], sameTestament = [], rest = [];
  for (const s of pool.speakers || []) {
    if (s.id === answer.id) continue;
    if (inConflict(pool, answer.id, s.id)) continue;
    if (s.name === answer.name) continue;
    if (RELAY_BOOKS[item.book]) {
      if (!isDivine(pool, answer.id) && isDivine(pool, s.id)) continue;
      if (isDivine(pool, answer.id) && hasBook(s, item.book)) continue;
    }
    if (hasBook(s, item.book)) sameBook.push(s);
    else if (s.testament && s.testament === answer.testament) sameTestament.push(s);
    else rest.push(s);
  }

  const byIdKey = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  sameBook.sort(byIdKey); sameTestament.sort(byIdKey); rest.sort(byIdKey);

  const used = { [answer.name]: true };
  const picks = [];
  for (const s of sameBook.concat(sameTestament, rest)) {
    if (picks.length >= OPTION_COUNT - 1) break;
    if (used[s.name]) continue;
    used[s.name] = true;
    picks.push(s.name);
  }
  if (picks.length < OPTION_COUNT - 1) return null;

  return [answer.name, ...picks].sort((a, b) => a.localeCompare(b, 'en'));
}

/*
 * The line on the card: the hardest tier first, a named individual speaking, a full
 * set of four names, and the length nearest a card's width, ties broken by id. If a
 * whole tier offers nothing that fits, the next tier down is tried rather than the
 * card falling back to grey bars.
 */
export function coverFor(pool) {
  const items = (pool && pool.items) || [];
  const tiers = [...new Set(items.map(i => i.tier || 0))].sort((a, b) => b - a);

  for (const tier of tiers) {
    const fits = [];
    for (const item of items) {
      if ((item.tier || 0) !== tier) continue;
      const speaker = speakerMap(pool)[item.sp];
      if (!speaker || !isNamedIndividual(speaker.name)) continue;
      const text = display(item.d || item.t);
      if (!isCleanlyEnded(text)) continue;
      const names = coverNames(pool, item);
      if (!names) continue;
      fits.push({ id: item.id, text, names });
    }
    fits.sort((a, b) =>
      Math.abs(a.text.length - IDEAL_LENGTH) - Math.abs(b.text.length - IDEAL_LENGTH) ||
      (a.id < b.id ? -1 : 1));
    if (fits[0]) return fits[0];
  }
  return null;
}

/* ----------------------------------------------------------------- the build */

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function main() {
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

  const out = join(root, '..', SLUG + '.html');
  const html = src.replace(PLACEHOLDER, () => json);
  writeFileSync(out, html, 'utf8');

  /*
   * The live site builds from its own copy (Vercel's root directory is site/, so it cannot
   * see demos/). Generated but committed, like site/src/data/compass.json. Never hand-edit
   * it; change game.src.html and rebuild.
   *
   * The copy is written whatever the pool, because site/src/pages/play/who-said-it.astro
   * imports it and the site would not build without it. The METADATA is what tells the
   * truth about a fixture: items 0, no cover line, no names, fixture true — so no page on
   * the site can print a placeholder count or a placeholder line as though it were real.
   * Rebuild from the real pool before this game ships.
   */
  const cover = pool.fixture ? null : coverFor(pool);
  const siteDir = join(root, '..', '..', 'site', 'src', 'games');
  if (existsSync(siteDir)) {
    writeFileSync(join(siteDir, SLUG + '.html'), html, 'utf8');
    writeFileSync(join(siteDir, SLUG + '.meta.json'), JSON.stringify({
      items: pool.fixture ? 0 : pool.items.length,
      speakers: pool.fixture ? 0 : pool.speakers.length,
      built: pool.fixture ? null : (pool.built || null),
      cover: cover ? cover.text : null,
      coverNames: cover ? cover.names : null,
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
  console.log('capitals ' + capitalised + ' lines show pronouns for God capitalised');
  if (cover) {
    console.log('cover    ' + cover.text);
    console.log('names    ' + cover.names.join(' · '));
  }
  console.log('wrote    ' + resolve(out) + '  (' + Math.round(html.length / 1024) + ' kB)');
}

/* Run only when this file is the program, so a test can import the cover functions. */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
