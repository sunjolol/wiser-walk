/**
 * Download the Berean Standard Bible text that engine-test.mjs checks quotations against.
 *
 * Every Scripture reference named in the figure roster, the quiz modules and the articles is
 * looked up, and the WHOLE chapter it sits in is saved, verse by verse, to
 * demos/sounds-like-scripture/work/bsb-verses.json. That file is a cache: it is gitignored,
 * absent on the deploy host, and the test says "skip" rather than "fine" when it is missing,
 * exactly as it does for the World English Bible files beside it. Nothing here edits the site.
 *
 * Text via the Free Use Bible API (bible.helloao.org), the same source as fetch-passages.mjs.
 * The BSB has been in the public domain since 30 April 2023 (berean.bible/licensing.htm).
 *
 * Run: node site/scripts/fetch-bsb-verses.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const OUT = resolve(REPO, 'demos/sounds-like-scripture/work/bsb-verses.json');
const API = 'https://bible.helloao.org/api/BSB';

/** Where references are read from. A file that is not on disk is passed over. */
const SOURCES = [
  resolve(REPO, 'audit/new-quizzes/figures.verified.json'),
  ...['bible-figure.ts', 'seven-deadly-sins.ts', 'spiritual-gifts.ts']
    .map(f => resolve(HERE, '../src/lib/quizzes', f)),
  ...readdirSync(resolve(HERE, '../src/content/articles'))
    .filter(f => f.endsWith('.md'))
    .map(f => resolve(HERE, '../src/content/articles', f))
].filter(p => existsSync(p));

const books = (await (await fetch(`${API}/books.json`)).json()).books;
/** The name a reference uses -> the API's book id. "Psalm 23" is how one psalm is cited. */
const ID = Object.fromEntries(books.map(b => [b.commonName, b.id]));
ID.Psalm = 'PSA';
ID['Song of Songs'] = 'SNG';
const NAME = Object.fromEntries(books.map(b => [b.id, b.commonName === 'Psalms' ? 'Psalm' : b.commonName]));

const names = Object.keys(ID).sort((a, b) => b.length - a.length).map(n => n.replace(/ /g, '\\s'));
const REF = new RegExp(`\\b(${names.join('|')})\\s(\\d+):\\d+`, 'g');

const chapters = new Set();
for (const file of SOURCES) {
  for (const m of readFileSync(file, 'utf8').matchAll(REF)) {
    chapters.add(`${ID[m[1].replace(/\s/g, ' ')]}/${m[2]}`);
  }
}

/**
 * A verse arrives as an array of strings and objects: {text} for poetry lines, {noteId} for
 * footnotes, {lineBreak}. The words are joined with a space, and a space the join put before
 * a closing mark (or after an opening one or a dash) is taken out again, so a footnote that
 * fell between "praise!" and "Amen." cannot glue the two together, and one that fell before
 * a comma cannot leave a space in front of it.
 */
const plain = content =>
  content
    .map(p => (typeof p === 'string' ? p : p && typeof p.text === 'string' ? p.text : ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:!?’”)\]—])/g, '$1')
    .replace(/([‘“(\[—]) /g, '$1')
    .trim();

const verses = {};
const failed = [];
for (const key of [...chapters].sort()) {
  const [id, n] = key.split('/');
  try {
    const res = await fetch(`${API}/${id}/${n}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    for (const v of json.chapter.content) {
      if (v.type === 'verse') verses[`${NAME[id]} ${n}:${v.number}`] = plain(v.content);
    }
    process.stdout.write('.');
  } catch (err) {
    failed.push(`${key} (${err.message})`);
    process.stdout.write('x');
  }
}
console.log();
if (failed.length) console.log(`could not fetch ${failed.length}: ${failed.join(', ')}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  translation: 'Berean Standard Bible',
  licence: 'Public domain since 30 April 2023 (berean.bible/licensing.htm).',
  via: 'https://bible.helloao.org/',
  verses
}, null, 1));
console.log(`bsb-verses.json: ${chapters.size - failed.length} chapters, ${Object.keys(verses).length} verses`);
