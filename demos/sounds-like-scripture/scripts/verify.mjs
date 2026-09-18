// verify.mjs — prove every pooled line is a verbatim, contiguous excerpt of a downloaded file.
//
// SPEC "Integrity rules" 2: the same allowed normalisation is applied to the raw file and every
// pooled line must be a substring of it. Nothing here edits anything; it only asserts.
// Exits non-zero on any failure.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url.
//   node scripts/verify.mjs [--pool <file>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const RAW = path.join(ROOT, 'raw');
const WORK = path.join(ROOT, 'work');

function flag(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const POOL = path.resolve(ROOT, flag('pool', path.join(ROOT, 'pool.json')));

/* ---- the two allowed normalisations, copied from the extractors ---------- */

// extract-bible.mjs
function normaliseBible(s) {
  return s
    .replace(/\r/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\[[A-Za-z]\]/g, '')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// extract-prose.mjs
function normaliseProse(s) {
  return s
    .replace(/_/g, '')
    .replace(/\[(?:\d+|[A-Za-z])\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---- raw files ----------------------------------------------------------- */

const rawCache = new Map();
function rawNormalised(file, how) {
  const key = `${file}|${how}`;
  if (!rawCache.has(key)) {
    let text = fs.readFileSync(path.join(RAW, file), 'utf8').replace(/\r\n/g, '\n');
    const a = text.indexOf('*** START OF');
    if (a > -1) text = text.slice(text.indexOf('\n', a) + 1);
    const b = text.lastIndexOf('*** END OF');
    if (b > -1) text = text.slice(0, b);
    rawCache.set(key, how === 'prose' ? normaliseProse(text) : normaliseBible(text));
  }
  return rawCache.get(key);
}

function rawFileFor(url) {
  const m = url.match(/pg(\d+)\.txt$/);
  if (m) return `pg${m[1]}.txt`;
  return url.split('/').pop();
}

/* ---- Scripture references ------------------------------------------------ */

const versesAll = JSON.parse(fs.readFileSync(path.join(WORK, 'verses-all.json'), 'utf8'));
const verseByRef = new Map();
for (const v of versesAll) verseByRef.set(`${v.src}|${v.ref}`, v.text);

// Every verse line of the WEBBE verse-per-line file, normalised the same way.
let vplSet = null;
function vplTexts() {
  if (!vplSet) {
    vplSet = new Set();
    const raw = fs.readFileSync(path.join(RAW, 'eng-webbe_vpl.txt'), 'utf8').replace(/\r/g, '');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([0-9A-Z]{3})\s+(\d+):(\d+)\s(.*)$/);
      if (m) vplSet.add(normaliseBible(m[4]));
    }
  }
  return vplSet;
}

const KJV_NAMES = new Set([
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
]);

// SPEC "Canon": the only deuterocanonical books the pool may contain.
const DEUTERO_OK = [
  /^Tobit \d+:\d+$/, /^Judith \d+:\d+$/, /^Wisdom of Solomon \d+:\d+$/, /^Sirach \d+:\d+$/,
  /^Baruch \d+:\d+( \(Letter of Jeremiah\))?$/, /^1 Maccabees \d+:\d+$/, /^2 Maccabees \d+:\d+$/,
  /^3 Maccabees \d+:\d+$/, /^1 Esdras \d+:\d+$/, /^Prayer of Manass(es|eh) \d+:\d+$/,
  /^Psalm 151(:\d+| \d+:\d+)$/, /^Susanna \d+:\d+$/, /^Bel and the Dragon \d+:\d+$/,
  /^Song of the Three Holy Children \d+(:\d+)?$/,
  /^Daniel 3:\d+ \(Song of the Three\)$/, /^Daniel 13:\d+ \(Susanna\)$/,
  /^Daniel 14:\d+ \(Bel and the Dragon\)$/,
];
// SPEC "Canon": left out of the pool entirely.
const LEFT_OUT = /^(2 Esdras|4 Ezra|4 Maccabees|Greek Esther|ESG|4ES|4MA)\b/;

/* ---- run ----------------------------------------------------------------- */

const pool = JSON.parse(fs.readFileSync(POOL, 'utf8'));
const failures = [];
const fail = (id, why) => failures.push(`${id}: ${why}`);

if (!Array.isArray(pool.sources) || !Array.isArray(pool.items)) {
  console.error('verify: pool.json must have sources[] and items[]');
  process.exit(1);
}

const seen = new Set();
let checkedRaw = 0;

for (const it of pool.items) {
  const id = it.id || '(no id)';
  if (seen.has(id)) fail(id, 'duplicate id');
  seen.add(id);

  if (typeof it.s !== 'number' || !pool.sources[it.s]) { fail(id, `source index ${it.s} out of range`); continue; }
  const src = pool.sources[it.s];
  const t = it.t;
  if (typeof t !== 'string' || !t.trim()) { fail(id, 'empty text'); continue; }
  if (/\d/.test(t)) fail(id, 'text contains a digit');
  if (!['b', 'd', 'o'].includes(it.k)) fail(id, `bad kind ${it.k}`);
  if (it.k === 'd') {
    if (!Array.isArray(it.c) || !it.c.length) fail(id, 'deutero item without canons');
    else if (it.c.some((c) => c !== 'catholic' && c !== 'orthodox')) fail(id, `bad canons ${it.c.join(',')}`);
  } else if (it.c) fail(id, 'canons on a non-deutero item');

  // reference sanity and the left-out books
  if (LEFT_OUT.test(it.ref || '')) fail(id, `left-out book in ref "${it.ref}"`);
  if (it.k === 'b') {
    const book = String(it.ref || '').replace(/\s+\d+:\d+$/, '');
    if (!KJV_NAMES.has(book)) fail(id, `ref "${it.ref}" is not a 66-book reference`);
  }
  if (it.k === 'd' && !DEUTERO_OK.some((re) => re.test(it.ref || ''))) {
    fail(id, `ref "${it.ref}" is not an allowed deuterocanonical reference`);
  }

  // verbatim check
  if (src.id === 'kjv' || src.id === 'kjva') {
    const verse = verseByRef.get(`${src.id}|${it.ref}`) ?? verseByRef.get(`${src.id}|${String(it.ref).replace(/\s*\([^)]*\)$/, '')}`);
    if (verse === undefined) { fail(id, `no parsed verse for ${src.id} ${it.ref}`); continue; }
    if (!verse.includes(t)) fail(id, 'text is not a substring of the parsed verse');
    const file = rawFileFor(src.url);
    if (!rawNormalised(file, 'bible').includes(t)) fail(id, `text not found verbatim in raw/${file}`);
    checkedRaw++;
  } else if (src.id === 'webbe' || src.id === 'webbe-dc') {
    const verse = verseByRef.get(`${src.id}|${it.ref}`) ?? verseByRef.get(`${src.id}|${String(it.ref).replace(/\s*\([^)]*\)$/, '')}`);
    if (verse === undefined) { fail(id, `no parsed verse for ${src.id} ${it.ref}`); continue; }
    if (!verse.includes(t)) fail(id, 'text is not a substring of the parsed verse');
    if (!vplTexts().has(verse)) fail(id, 'the verse is not a line of raw/eng-webbe_vpl.txt');
    checkedRaw++;
  } else {
    const urls = [src.url, src.url2].filter(Boolean);
    if (!urls.length) { fail(id, `source ${src.id} has no url`); continue; }
    const hit = urls.some((u) => rawNormalised(rawFileFor(u), 'prose').includes(t));
    if (!hit) fail(id, `text not found verbatim in ${urls.map((u) => 'raw/' + rawFileFor(u)).join(' or ')}`);
    checkedRaw++;
  }
}

console.log(`pool: ${POOL}`);
console.log(`items: ${pool.items.length}; ids unique: ${seen.size === pool.items.length}; verbatim-checked against raw: ${checkedRaw}`);
const bySrc = new Map();
for (const it of pool.items) bySrc.set(pool.sources[it.s]?.id ?? '?', (bySrc.get(pool.sources[it.s]?.id ?? '?') || 0) + 1);
console.log('by source: ' + [...bySrc].map(([k, v]) => `${k}=${v}`).join('  '));

if (failures.length) {
  console.error(`\nFAILED: ${failures.length}`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log('\nOK: every line is a verbatim excerpt of its source file.');
