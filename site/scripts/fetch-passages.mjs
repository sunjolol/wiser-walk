/**
 * Fetch the Berean Standard Bible text for every passage the Compass cites.
 *
 * WHY THIS EXISTS. The result page lets a reader open a passage and read it, so they can
 * see that the positions on the map rest on texts rather than on assertion. That only helps
 * if the text is real. Nothing here is typed from memory: every word comes from the BSB via
 * the Free Use Bible API, and the reference, the verse numbers and the total verse count in
 * the chapter all travel with it so the page can say exactly what it is showing.
 *
 * LICENCE. berean.bible/licensing.htm states: "The Berean Bible and Majority Bible texts
 * are officially placed into the public domain as of April 30, 2023." That sentence was read
 * from the publisher's own page before this script was written, and it is recorded in the
 * output so the attribution ships with the data.
 *
 * WHICH VERSES. Mechanically the first `MAX_VERSES` of whatever range the audited data
 * names, never a selection. Four of the references are whole chapters or chapter ranges, and
 * choosing "the key verses" of Romans 9 is itself taking a side — a monergist and a synergist
 * would choose differently, and both would be right that the other had loaded the excerpt.
 * The panel says which verses it is showing and links to the rest.
 *
 * Run: node site/scripts/fetch-passages.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, '../src/data/compass.json');
const OUT = resolve(HERE, '../src/data/passages.json');

const API = 'https://bible.helloao.org/api/BSB';
const MAX_VERSES = 5;

const LICENCE = {
  translation: 'Berean Standard Bible',
  abbreviation: 'BSB',
  source: 'https://berean.bible/',
  licence: 'Public domain since 30 April 2023 (berean.bible/licensing.htm).',
  via: 'https://bible.helloao.org/'
};

/** Book names as the audited data writes them, mapped to the API's ids. */
const BOOKS = {
  Genesis: 'GEN', Psalm: 'PSA', Psalms: 'PSA', Daniel: 'DAN',
  Matthew: 'MAT', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL',
  Ephesians: 'EPH', Philippians: 'PHP', Colossians: 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', Hebrews: 'HEB',
  '1 Peter': '1PE', '2 Peter': '2PE', Revelation: 'REV'
};

/**
 * Parse a reference as the audited data writes it. Ranges use an en dash, and three shapes
 * occur: "Acts 7:51", "Romans 8:28–30", "Romans 9" (whole chapter) and "Revelation 4–5"
 * (chapter range). Anything else is reported rather than guessed at.
 */
function parseRef(ref) {
  const m = ref.match(/^((?:[123]\s)?[A-Za-z]+)\s+(\d+)(?:\s*[–-]\s*(\d+))?(?::(\d+)(?:\s*[–-]\s*(\d+))?)?$/);
  if (!m) return null;
  const [, book, a, b, v1, v2] = m;
  const id = BOOKS[book];
  if (!id) return null;

  if (v1) {
    // "Romans 8:28–30" — chapter a, verses v1..v2
    return { book, id, chapter: +a, from: +v1, to: v2 ? +v2 : +v1, whole: false };
  }
  // "Romans 9" or "Revelation 4–5" — a whole chapter; b, if present, is a further chapter.
  return { book, id, chapter: +a, from: 1, to: Infinity, whole: true, through: b ? +b : undefined };
}

const cache = new Map();
async function chapter(id, n) {
  const key = `${id}/${n}`;
  if (cache.has(key)) return cache.get(key);
  const res = await fetch(`${API}/${id}/${n}.json`);
  if (!res.ok) throw new Error(`${key}: HTTP ${res.status}`);
  const json = await res.json();
  cache.set(key, json);
  return json;
}

/** Verse content arrives as an array that can hold formatting objects as well as strings. */
const plain = content =>
  content
    .map(part => (typeof part === 'string' ? part : part && typeof part.text === 'string' ? part.text : ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const refs = [...new Set(data.axes.flatMap(a => a.passages))];

const out = {};
const failed = [];

for (const ref of refs) {
  const p = parseRef(ref);
  if (!p) { failed.push(`${ref} (could not parse)`); continue; }

  try {
    const json = await chapter(p.id, p.chapter);
    const all = json.chapter.content.filter(x => x.type === 'verse');
    const inRange = all.filter(v => v.number >= p.from && v.number <= p.to);
    const shown = inRange.slice(0, MAX_VERSES);

    out[ref] = {
      book: p.book,
      chapter: p.chapter,
      // What the reader is actually looking at, so the panel never overstates itself.
      verses: shown.map(v => ({ n: v.number, text: plain(v.content) })),
      inRange: inRange.length,
      chapterVerses: json.numberOfVerses ?? all.length,
      truncated: inRange.length > shown.length,
      // A chapter range names more chapters than are shown; say so rather than imply one.
      spansChapters: p.through ? `${p.chapter}–${p.through}` : null
    };
    process.stdout.write('.');
  } catch (err) {
    failed.push(`${ref} (${err.message})`);
    process.stdout.write('x');
  }
}

console.log();
if (failed.length) {
  // Better no passage than a wrong one: a reference that could not be fetched is left out,
  // and the pill simply does not open rather than showing something approximate.
  console.log(`\ncould not fetch ${failed.length}:`);
  failed.forEach(f => console.log('  ' + f));
}

writeFileSync(OUT, JSON.stringify({ ...LICENCE, maxVerses: MAX_VERSES, passages: out }, null, 1));

const words = Object.values(out).reduce((n, p) => n + p.verses.reduce((m, v) => m + v.text.split(/\s+/).length, 0), 0);
console.log(
  `\npassages.json: ${Object.keys(out).length}/${refs.length} references, ` +
  `${words} words of ${LICENCE.abbreviation}, ${(readFileSync(OUT).length / 1024).toFixed(0)}kB`
);
