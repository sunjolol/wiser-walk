#!/usr/bin/env node
// Who Said It? — prove the pool.
//
// SPEC integrity rules 1 and 2: no line is written by a model, and who spoke is never
// decided by a model either. This script re-derives both facts from the files on disk,
// independently of extract.mjs, and asserts for every pooled item that
//
//   1. its text is a verbatim, contiguous substring of that verse in verses-all.json;
//   2. Glyssen's CharacterVerse.txt names exactly one eligible speaking character for
//      that verse, and it is the speaker the item claims;
//   3. ids are unique, texts carry no digits, refs parse to the item's own book;
//   4. every id named in the conflicts map exists in the speakers table.
//
// It asserts only; it edits nothing. Exits non-zero on any failure.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url.
//   node demos/who-said-it/scripts/verify.mjs [--pool <file>]

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const RAW = join(ROOT, 'raw');
const VERSES = join(ROOT, '..', 'sounds-like-scripture', 'work', 'verses-all.json');

function flag(name, dflt) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const POOL = resolve(ROOT, flag('pool', join(ROOT, 'pool.json')));

/* ------------------------------------------------------------- book names */

// USFM code -> book name as verses-all.json spells it. Written out again here on purpose:
// verify must not borrow the extractor's tables to check the extractor's work.
const BOOKS = [
  ['GEN', 'Genesis'], ['EXO', 'Exodus'], ['LEV', 'Leviticus'], ['NUM', 'Numbers'],
  ['DEU', 'Deuteronomy'], ['JOS', 'Joshua'], ['JDG', 'Judges'], ['RUT', 'Ruth'],
  ['1SA', '1 Samuel'], ['2SA', '2 Samuel'], ['1KI', '1 Kings'], ['2KI', '2 Kings'],
  ['1CH', '1 Chronicles'], ['2CH', '2 Chronicles'], ['EZR', 'Ezra'], ['NEH', 'Nehemiah'],
  ['EST', 'Esther'], ['JOB', 'Job'], ['PSA', 'Psalms'], ['PRO', 'Proverbs'],
  ['ECC', 'Ecclesiastes'], ['SNG', 'Song of Solomon'], ['ISA', 'Isaiah'], ['JER', 'Jeremiah'],
  ['LAM', 'Lamentations'], ['EZK', 'Ezekiel'], ['DAN', 'Daniel'], ['HOS', 'Hosea'],
  ['JOL', 'Joel'], ['AMO', 'Amos'], ['OBA', 'Obadiah'], ['JON', 'Jonah'],
  ['MIC', 'Micah'], ['NAM', 'Nahum'], ['HAB', 'Habakkuk'], ['ZEP', 'Zephaniah'],
  ['HAG', 'Haggai'], ['ZEC', 'Zechariah'], ['MAL', 'Malachi'],
  ['MAT', 'Matthew'], ['MRK', 'Mark'], ['LUK', 'Luke'], ['JHN', 'John'], ['ACT', 'Acts'],
  ['ROM', 'Romans'], ['1CO', '1 Corinthians'], ['2CO', '2 Corinthians'], ['GAL', 'Galatians'],
  ['EPH', 'Ephesians'], ['PHP', 'Philippians'], ['COL', 'Colossians'],
  ['1TH', '1 Thessalonians'], ['2TH', '2 Thessalonians'], ['1TI', '1 Timothy'],
  ['2TI', '2 Timothy'], ['TIT', 'Titus'], ['PHM', 'Philemon'], ['HEB', 'Hebrews'],
  ['JAS', 'James'], ['1PE', '1 Peter'], ['2PE', '2 Peter'], ['1JN', '1 John'],
  ['2JN', '2 John'], ['3JN', '3 John'], ['JUD', 'Jude'], ['REV', 'Revelation'],
];
const CODE_FOR_NAME = new Map(BOOKS.map(([c, n]) => [n, c]));

/* ------------------------------------------------------------ verse texts */

if (!existsSync(VERSES)) {
  console.error('verify: missing ' + VERSES +
    ' — rebuild it with node demos/sounds-like-scripture/scripts/extract-bible.mjs');
  process.exit(1);
}
const verseByRef = new Map();       // "src|Book ch:vs" -> verbatim verse text
for (const v of JSON.parse(readFileSync(VERSES, 'utf8'))) {
  if (v.src !== 'kjv' && v.src !== 'webbe') continue;   // 66-book canon only
  verseByRef.set(v.src + '|' + v.ref, v.text);
}

/* -------------------------------------------------- Glyssen speaker labels */

// The eligibility rule the SPEC states, re-implemented here: quote types Normal, Dialogue
// and Implicit only; never a narrator pseudo-character, "scripture", "Needs Review" or an
// "X/Y" either-or id; and exactly one character for the verse.
const ELIGIBLE_TYPES = new Set(['Normal', 'Dialogue', 'Implicit']);
const PSEUDO = /^(narrator-|scripture$|Needs Review$)/;

function usableId(id) {
  return !!id && !PSEUDO.test(id) && !id.includes('/');
}

const eligibleByVerse = new Map();  // "BOOK|ch|vs" -> Set of eligible character ids
{
  const text = readFileSync(join(RAW, 'CharacterVerse.txt'), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || line.startsWith('Control File')) continue;
    const f = line.split('\t');
    if (f.length < 10) continue;
    const [book, ch, vs, id, , , type] = f;
    const key = book + '|' + Number(ch) + '|' + Number(vs);
    if (!eligibleByVerse.has(key)) eligibleByVerse.set(key, { ids: new Set(), unusable: false });
    if (!ELIGIBLE_TYPES.has(String(type).trim())) continue;
    const entry = eligibleByVerse.get(key);
    if (!usableId(id.trim())) { entry.unusable = true; continue; }
    entry.ids.add(id.trim());
  }
}

/* ----------------------------------------------------------------- checks */

const pool = JSON.parse(readFileSync(POOL, 'utf8'));
const failures = [];
const fail = (id, why) => failures.push(id + ': ' + why);

if (!Array.isArray(pool.speakers) || !Array.isArray(pool.items)) {
  console.error('verify: pool must have speakers[] and items[]');
  process.exit(1);
}

const speakerById = new Map(pool.speakers.map((s) => [s.id, s]));
const seen = new Set();
let checkedVerse = 0, checkedSpeaker = 0;

for (const it of pool.items) {
  const id = it.id || '(no id)';
  if (seen.has(id)) fail(id, 'duplicate id');
  seen.add(id);

  const t = it.t;
  if (typeof t !== 'string' || !t.trim()) { fail(id, 'empty text'); continue; }
  if (/\d/.test(t)) fail(id, 'text contains a digit');
  if (it.tr !== 'kjv' && it.tr !== 'webbe') { fail(id, 'bad translation "' + it.tr + '"'); continue; }
  if (!speakerById.has(it.sp)) fail(id, 'speaker "' + it.sp + '" is not in the speakers table');

  const m = /^(.+) (\d+):(\d+)$/.exec(String(it.ref || ''));
  if (!m) { fail(id, 'unparseable reference "' + it.ref + '"'); continue; }
  const code = CODE_FOR_NAME.get(m[1]);
  if (!code) { fail(id, 'reference "' + it.ref + '" is not a 66-book reference'); continue; }
  if (it.book !== code) fail(id, 'book "' + it.book + '" does not match reference "' + it.ref + '"');

  // 1. verbatim
  const verse = verseByRef.get(it.tr + '|' + it.ref);
  if (verse === undefined) { fail(id, 'no parsed verse for ' + it.tr + ' ' + it.ref); }
  else if (!verse.includes(t)) { fail(id, 'text is not a verbatim substring of ' + it.tr + ' ' + it.ref); }
  else checkedVerse++;

  // 2. the speaker file names exactly this one eligible character for this verse
  const entry = eligibleByVerse.get(code + '|' + Number(m[2]) + '|' + Number(m[3]));
  if (!entry) fail(id, 'CharacterVerse.txt names no character for ' + it.ref);
  else if (entry.unusable) fail(id, 'CharacterVerse.txt has an unusable eligible id for ' + it.ref);
  else if (entry.ids.size !== 1) fail(id, 'CharacterVerse.txt names ' + entry.ids.size + ' eligible characters for ' + it.ref);
  else if (![...entry.ids][0] || [...entry.ids][0] !== it.sp) {
    fail(id, 'CharacterVerse.txt names "' + [...entry.ids][0] + '" for ' + it.ref + ', not "' + it.sp + '"');
  } else checkedSpeaker++;
}

// 4. conflicts
for (const [id, list] of Object.entries(pool.conflicts || {})) {
  if (!speakerById.has(id)) fail('conflicts', 'key "' + id + '" is not a speaker in the pool');
  if (!Array.isArray(list)) { fail('conflicts', '"' + id + '" does not map to a list'); continue; }
  for (const other of list) {
    if (!speakerById.has(other)) fail('conflicts', '"' + id + '" names "' + other + '", who is not a speaker in the pool');
    if (other === id) fail('conflicts', '"' + id + '" conflicts with itself');
  }
}

// Speakers that never speak would be distractors that can never be right.
for (const s of pool.speakers) {
  if (!pool.items.some((it) => it.sp === s.id)) fail('speakers', '"' + s.id + '" has no line in the pool');
}

/* ----------------------------------------------------------------- report */

console.log('pool: ' + POOL);
console.log('items: ' + pool.items.length + '; ids unique: ' + (seen.size === pool.items.length));
console.log('verbatim-checked against verses-all.json: ' + checkedVerse);
console.log('speaker-checked against raw/CharacterVerse.txt: ' + checkedSpeaker);
console.log('speakers: ' + pool.speakers.length + '; conflict keys: ' + Object.keys(pool.conflicts || {}).length);

const bySrc = new Map();
for (const it of pool.items) bySrc.set(it.tr, (bySrc.get(it.tr) || 0) + 1);
console.log('by translation: ' + [...bySrc].map(([k, v]) => k + '=' + v).join('  '));

if (failures.length) {
  console.error('\nFAILED: ' + failures.length);
  for (const f of failures.slice(0, 100)) console.error('  ' + f);
  if (failures.length > 100) console.error('  ... (+' + (failures.length - 100) + ' more)');
  process.exit(1);
}
console.log('\nOK: every line is verbatim, and every speaker is the one Glyssen names.');
