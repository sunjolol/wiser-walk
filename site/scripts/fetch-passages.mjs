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

/**
 * Verse content arrives as an array that can hold formatting objects as well as strings:
 * {text} for each line of poetry, {noteId} for a footnote, {lineBreak}. Joined with nothing,
 * the lines of a poem ran together ("I will makewith the house of Israel") and a footnote
 * between two sentences glued them ("praise!Amen."). So the parts are joined with a space,
 * and a space that lands before a closing mark (or after an opening one or a dash) is taken
 * out again. The words themselves are untouched.
 */
const plain = content =>
  content
    .map(part => (typeof part === 'string' ? part : part && typeof part.text === 'string' ? part.text : ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:!?’”)\]—])/g, '$1')
    .replace(/([‘“(\[—]) /g, '$1')
    .trim();

/**
 * CAPITALS FOR GOD. The owner's rule (2026-09-23): every pronoun for God, Jesus or the Holy
 * Spirit is capitalised, inside quotations too. The BSB already capitalises He, His, Him and
 * You for Them, but prints the relative pronoun in lower case ("the will of Him who sent Me").
 * The BSB is in the public domain and asks nothing about altered text, so those are raised
 * here, verse by verse, from a map read and judged by hand: each entry is a phrase exactly as
 * the BSB prints it and the same phrase with the pronoun raised. A "who" for the people in a
 * verse ("those who love Him") stays as printed.
 *
 * capitalOnly() is the guard, the same rule as the games' capitals.mjs: the new phrase may
 * differ from the old only by raising the first letter of a pronoun for God. A phrase that is
 * missing from its verse, or found in it twice, stops the script rather than being skipped.
 */
const GOD_PRONOUNS = new Set(['he', 'his', 'him', 'himself', 'who', 'whom', 'whose', 'you', 'your']);
const CAPITALS = {
  'Romans 9:5': [['Christ, who is God', 'Christ, Who is God']],
  'Ephesians 1:3': [['Lord Jesus Christ, who has blessed', 'Lord Jesus Christ, Who has blessed']],
  'Ephesians 2:14': [['He Himself is our peace, who has made', 'He Himself is our peace, Who has made']],
  // the verse opens mid-sentence: "God our Savior, / who wants everyone to be saved"
  '1 Timothy 2:4': [['who wants everyone to be saved', 'Who wants everyone to be saved']],
  'John 6:38': [['the will of Him who sent Me', 'the will of Him Who sent Me']],
  'John 6:39': [['the will of Him who sent Me', 'the will of Him Who sent Me']],
  'Philippians 2:13': [['it is God who works in you', 'it is God Who works in you']],
  'Colossians 2:12': [['the power of God, who raised Him', 'the power of God, Who raised Him']],
  'Acts 15:8': [['And God, who knows the heart', 'And God, Who knows the heart']]
};

const tokens = s => s.match(/[A-Za-z]+|[^A-Za-z]+/g) ?? [];
function capitalOnly(from, to) {
  const a = tokens(from), b = tokens(to);
  if (a.length !== b.length) return 'the words differ';
  let raised = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    const w = a[i];
    if (!GOD_PRONOUNS.has(w) || b[i] !== w[0].toUpperCase() + w.slice(1)) return `"${w}" became "${b[i]}"`;
    raised++;
  }
  return raised ? null : 'nothing is raised';
}

const capitalised = new Set();
function capitalise(where, text) {
  let out = text;
  for (const [from, to] of CAPITALS[where] ?? []) {
    const why = capitalOnly(from, to);
    if (why) throw new Error(`CAPITALS ${where}: ${why}`);
    const count = out.split(from).length - 1;
    if (count !== 1) throw new Error(`CAPITALS ${where}: "${from}" is in the verse ${count} times, not once`);
    out = out.replace(from, to);
    capitalised.add(where);
  }
  return out;
}

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
      verses: shown.map(v => ({
        n: v.number,
        text: capitalise(`${p.book} ${p.chapter}:${v.number}`, plain(v.content))
      })),
      inRange: inRange.length,
      chapterVerses: json.numberOfVerses ?? all.length,
      truncated: inRange.length > shown.length,
      // A chapter range names more chapters than are shown; say so rather than imply one.
      spansChapters: p.through ? `${p.chapter}–${p.through}` : null
    };
    process.stdout.write('.');
  } catch (err) {
    // A capitals entry that does not fit its verse is an error in the map, not a network
    // failure: stop, rather than leave the passage out and carry on.
    if (err.message.startsWith("CAPITALS")) throw err;
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

const unused = Object.keys(CAPITALS).filter(k => !capitalised.has(k));
if (unused.length) throw new Error(`CAPITALS names verses no passage shows: ${unused.join(", ")}`);

writeFileSync(OUT, JSON.stringify({
  ...LICENCE,
  // Where a pronoun for God was raised to a capital; see CAPITALS above.
  capitalised: [...capitalised].sort(),
  maxVerses: MAX_VERSES,
  passages: out
}, null, 1));

const words = Object.values(out).reduce((n, p) => n + p.verses.reduce((m, v) => m + v.text.split(/\s+/).length, 0), 0);
console.log(
  `\npassages.json: ${Object.keys(out).length}/${refs.length} references, ` +
  `${words} words of ${LICENCE.abbreviation}, ${(readFileSync(OUT).length / 1024).toFixed(0)}kB`
);
