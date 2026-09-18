// extract-bible.mjs — downloads and parses KJV, KJV Apocrypha and WEBBE into candidate lines.
// Scripts extract; nothing here writes, paraphrases or tidies a single word of text.
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url (the repo path has a space).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const RAW = path.join(ROOT, 'raw');
const WORK = path.join(ROOT, 'work');
const SOURCES = path.join(ROOT, 'sources-bible.json');

const DOWNLOADS = [
  { url: 'https://www.gutenberg.org/cache/epub/10/pg10.txt', file: 'pg10.txt' },
  { url: 'https://www.gutenberg.org/cache/epub/124/pg124.txt', file: 'pg124.txt' },
  { url: 'https://ebible.org/Scriptures/eng-webbe_vpl.zip', file: 'eng-webbe_vpl.zip', unzip: 'eng-webbe_vpl.txt' },
];

// ---------------------------------------------------------------- canon tables

const KJV_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];
const KJV_CODES = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH',
  '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SOL', 'ISA', 'JER', 'LAM', 'EZE',
  'DAN', 'HOS', 'JOE', 'AMO', 'OBA', 'JON', 'MIC', 'NAH', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MAR', 'LUK', 'JOH', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHI', 'COL', '1TH',
  '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAM', '1PE', '2PE', '1JO', '2JO', '3JO', 'JUD',
  'REV',
];

const CATH_ORTH = ['catholic', 'orthodox'];
const ORTH = ['orthodox'];

// The Apocrypha file's own body headings, in the order they appear.
// `emit:false` means the book is parsed (for verses-all.json / shingle matching) but never
// becomes a candidate: SPEC "Canon" leaves 2 Esdras and Greek Esther out of the pool.
const KJVA_BOOKS = [
  { heading: 'The First Book of Esdras', code: '1ES', name: '1 Esdras', canons: ORTH, emit: true },
  { heading: 'The Second Book of Esdras', code: '4ES', name: '2 Esdras', emit: false },
  { heading: 'The Book of Tobit', code: 'TOB', name: 'Tobit', canons: CATH_ORTH, emit: true },
  { heading: 'The Book of Judith', code: 'JDT', name: 'Judith', canons: CATH_ORTH, emit: true },
  { heading: 'The Greek Additions to Esther', code: 'ESG', name: 'Greek Esther', emit: false },
  { heading: 'The Book of Wisdom', code: 'WIS', name: 'Wisdom of Solomon', canons: CATH_ORTH, emit: true },
  { heading: 'The Book of Sirach (or Ecclesiasticus)', code: 'SIR', name: 'Sirach', canons: CATH_ORTH, emit: true },
  { heading: 'The Book of Baruch', code: 'BAR', name: 'Baruch', canons: CATH_ORTH, emit: true },
  { heading: 'The Song of the Three Holy Children', code: 'S3C', name: 'Song of the Three Holy Children', canons: CATH_ORTH, emit: true, mode: 'v' },
  { heading: 'The Book of Susanna [in Daniel]', code: 'SUS', name: 'Susanna', canons: CATH_ORTH, emit: true },
  { heading: 'The History of the Destruction of', code: 'BEL', name: 'Bel and the Dragon', canons: CATH_ORTH, emit: true },
  { heading: 'The Prayer of Manasses', code: 'PRM', name: 'Prayer of Manasses', canons: ORTH, emit: true },
  { heading: 'The First Book of the Maccabees', code: '1MA', name: '1 Maccabees', canons: CATH_ORTH, emit: true },
  { heading: 'The Second Book of the Maccabees', code: '2MA', name: '2 Maccabees', canons: CATH_ORTH, emit: true },
];

// WEBBE deuterocanonical book codes -> name + canons. Codes absent here and not in KJV_CODES
// are parsed but never emitted (ESG, 4ES = 2 Esdras/4 Ezra, 4MA).
const WEBBE_DC = {
  TOB: { name: 'Tobit', canons: CATH_ORTH },
  JDT: { name: 'Judith', canons: CATH_ORTH },
  WIS: { name: 'Wisdom of Solomon', canons: CATH_ORTH },
  SIR: { name: 'Sirach', canons: CATH_ORTH },
  BAR: { name: 'Baruch', canons: CATH_ORTH },
  '1MA': { name: '1 Maccabees', canons: CATH_ORTH },
  '2MA': { name: '2 Maccabees', canons: CATH_ORTH },
  DNG: { name: 'Daniel', canons: CATH_ORTH },
  '1ES': { name: '1 Esdras', canons: ORTH },
  PRM: { name: 'Prayer of Manasseh', canons: ORTH },
  PSX: { name: 'Psalm 151', canons: ORTH },
  '3MA': { name: '3 Maccabees', canons: ORTH },
};
const WEBBE_SKIP = new Set(['ESG', '4ES', '4MA']);

// ---------------------------------------------------------------- download

async function ensureDownloads() {
  fs.mkdirSync(RAW, { recursive: true });
  for (const d of DOWNLOADS) {
    const dest = path.join(RAW, d.file);
    if (!fs.existsSync(dest)) {
      process.stdout.write(`downloading ${d.file} ... `);
      const r = await fetch(d.url);
      if (!r.ok) throw new Error(`${d.url} -> HTTP ${r.status}`);
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      console.log('done');
    }
    if (d.unzip && !fs.existsSync(path.join(RAW, d.unzip))) {
      const py = spawnSync('python', ['-m', 'zipfile', '-e', dest, RAW], { encoding: 'utf8' });
      if (py.status !== 0) throw new Error(`unzip failed: ${py.stderr || py.stdout}`);
    }
  }
}

// ---------------------------------------------------------------- normalisation

// SPEC "Integrity rules" 2: join hard-wrapped lines, collapse whitespace, strip Gutenberg
// italics underscores, strip footnote markers. Nothing else.
function normalise(s) {
  return s
    .replace(/\r/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\[[A-Za-z]\]/g, '')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------- Gutenberg parsing

function gutenbergBody(text) {
  const start = text.indexOf('*** START OF THE PROJECT GUTENBERG');
  const end = text.indexOf('*** END OF THE PROJECT GUTENBERG');
  if (start < 0 || end < 0) throw new Error('Gutenberg START/END markers not found');
  return text.slice(text.indexOf('\n', start) + 1, end);
}

function paragraphs(body) {
  return body.replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.replace(/\s+$/, '')).filter((p) => p.trim());
}

const CV = /(?:^|(?<=\s))(\d+):(\d+)\s/g;
const VONLY = /^(\d+)\s/;

function markers(par) {
  CV.lastIndex = 0;
  const marks = [];
  let m;
  while ((m = CV.exec(par))) marks.push({ i: m.index, len: m[0].length, c: Number(m[1]), v: Number(m[2]) });
  return marks;
}

// Split one paragraph into verses. Several verses may share a line, and a verse may span lines
// or even a blank line, so any text before the first marker is `lead`: it belongs to the verse
// the previous paragraph ended with.
function splitVerses(par, mode) {
  if (mode === 'v') {
    const m = par.match(VONLY);
    if (!m) return { lead: '', verses: [] };
    return { lead: '', verses: [{ c: 1, v: Number(m[1]), text: par.slice(m[0].length) }] };
  }
  const marks = markers(par);
  if (!marks.length) return { lead: par, verses: [] };
  const verses = [];
  for (let k = 0; k < marks.length; k++) {
    const stop = k + 1 < marks.length ? marks[k + 1].i : par.length;
    verses.push({ c: marks[k].c, v: marks[k].v, text: par.slice(marks[k].i + marks[k].len, stop) });
  }
  return { lead: par.slice(0, marks[0].i), verses };
}

// Append a paragraph's verses to a book, giving any leading continuation text back to the
// verse it belongs to rather than dropping it.
function addParagraph(book, par, mode) {
  const { lead, verses } = splitVerses(par, mode);
  if (lead.trim() && book.verses.length) book.verses[book.verses.length - 1].text += ' ' + lead;
  for (const vs of verses) book.verses.push(vs);
}

// KJV: the table of contents gives the 66 titles in order; the body repeats each one as a
// single-line paragraph. Walk paragraphs with a pointer into that list so order is enforced.
function parseKjv(raw) {
  const pars = paragraphs(gutenbergBody(raw));
  const titles = [];
  for (const p of pars) {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 5 && markers(p).length === 0) {
      for (const l of lines) if (!/^The (Old|New) Testament of the King James/.test(l)) titles.push(l);
    }
    if (titles.length >= 66) break;
  }
  if (titles.length !== 66) throw new Error(`KJV table of contents gave ${titles.length} titles, expected 66`);

  const books = [];
  let ptr = 0;
  let cur = null;
  let seenToc = false;
  for (const p of pars) {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 5 && markers(p).length === 0) { seenToc = true; continue; }
    if (!seenToc) continue;
    if (lines.length === 1 && ptr < 66 && lines[0] === titles[ptr]) {
      cur = { code: KJV_CODES[ptr], name: KJV_NAMES[ptr], title: titles[ptr], verses: [] };
      books.push(cur);
      ptr++;
      continue;
    }
    if (!cur) continue;
    addParagraph(cur, p, 'cv');
  }
  return books;
}

function parseKjva(raw) {
  const pars = paragraphs(gutenbergBody(raw));
  const books = [];
  let ptr = 0;
  let cur = null;
  for (const p of pars) {
    const first = p.split('\n')[0].trim();
    if (ptr < KJVA_BOOKS.length && first === KJVA_BOOKS[ptr].heading) {
      cur = { ...KJVA_BOOKS[ptr], verses: [] };
      books.push(cur);
      ptr++;
      continue;
    }
    if (!cur) continue;
    addParagraph(cur, p, cur.mode || 'cv');
  }
  if (ptr !== KJVA_BOOKS.length) {
    throw new Error(`Apocrypha: matched ${ptr} of ${KJVA_BOOKS.length} book headings`);
  }
  return books;
}

// ---------------------------------------------------------------- WEBBE parsing

function parseWebbe(raw) {
  const byBook = new Map();
  let n = 0;
  for (const line of raw.replace(/\r/g, '').split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^([0-9A-Z]{3})\s+(\d+):(\d+)\s(.*)$/);
    if (!m) throw new Error(`unparsed vpl line: ${line.slice(0, 60)}`);
    if (!byBook.has(m[1])) byBook.set(m[1], []);
    byBook.get(m[1]).push({ c: Number(m[2]), v: Number(m[3]), text: m[4] });
    n++;
  }
  return { byBook, n };
}

// ---------------------------------------------------------------- eligibility

const PSALM_TITLE = /\b(Psalm by|A Psalm|Chief Musician|A Song|Song of Ascents|Maschil|Contemplation|Michtam|A Prayer|Shiggaion|Selah|For the Chief|the sons of Korah|A Poem|set to)\b/;
const NAME_STOP = new Set(['God', 'Lord', 'LORD', 'GOD', 'O', 'I']);

function wordCount(t) { return t.split(/\s+/).filter(Boolean).length; }

function nameLikeCount(t) {
  const toks = t.split(/\s+/).slice(1);
  let c = 0;
  for (const raw of toks) {
    const w = raw.replace(/^[^A-Za-z]+/, '').replace(/[^A-Za-z]+$/, '');
    if (!w) continue;
    if (!/^[A-Z][a-z]+$/.test(w)) continue;
    if (NAME_STOP.has(w)) continue;
    c++;
  }
  return c;
}

function eligible(text, code) {
  const n = wordCount(text);
  if (n < 9 || n > 34) return false;
  if (!/^[A-Z“"'‘(]/.test(text)) return false;
  if (!/[.?!][”"'’]?$/.test(text)) return false;
  if (/\d/.test(text)) return false;
  if (/https?:|www\./i.test(text)) return false;
  if (/[Ͱ-Ͽἀ-῿֐-׿]/.test(text)) return false;
  if (/[[\]{}]/.test(text)) return false;
  if (/\bSelah\b/i.test(text)) return false;
  if ((code === 'PSA' || code === 'PSX') && PSALM_TITLE.test(text)) return false;
  if (nameLikeCount(text) > 3) return false;
  return true;
}

// ---------------------------------------------------------------- refs

function kjvaRef(book, c, v) {
  if (book.code === 'S3C') return `Song of the Three Holy Children ${v}`;
  if (book.code === 'BAR' && c === 6) return `Baruch 6:${v} (Letter of Jeremiah)`;
  return `${book.name} ${c}:${v}`;
}

function webbeDcRef(code, c, v) {
  if (code === 'DNG') {
    if (c === 3) return `Daniel 3:${v} (Song of the Three)`;
    if (c === 13) return `Daniel 13:${v} (Susanna)`;
    if (c === 14) return `Daniel 14:${v} (Bel and the Dragon)`;
    return null;
  }
  if (code === 'PSX') return `Psalm 151:${v}`;
  if (code === 'BAR' && c === 6) return `Baruch 6:${v} (Letter of Jeremiah)`;
  return `${WEBBE_DC[code].name} ${c}:${v}`;
}

// SPEC "Canon": in Greek Daniel keep only the three additions.
function dngKeep(c, v) {
  if (c === 3) return v >= 24 && v <= 90;
  return c === 13 || c === 14;
}

// ---------------------------------------------------------------- main

function bump(map, k) { map.set(k, (map.get(k) || 0) + 1); }

async function main() {
  await ensureDownloads();
  fs.mkdirSync(WORK, { recursive: true });

  const report = [];
  const all = [];       // every parsed verse, eligible or not
  const cands = [];     // eligible candidates

  // ---- KJV -----------------------------------------------------------------
  const kjvBooks = parseKjv(fs.readFileSync(path.join(RAW, 'pg10.txt'), 'utf8'));
  let kjvVerses = 0;
  let kjvCands = 0;
  for (const b of kjvBooks) {
    for (const vs of b.verses) {
      const text = normalise(vs.text);
      if (!text) continue;
      kjvVerses++;
      const ref = `${b.name} ${vs.c}:${vs.v}`;
      all.push({ src: 'kjv', ref, text });
      if (eligible(text, b.code)) {
        cands.push({ cid: `kjv:${b.code}.${vs.c}.${vs.v}`, src: 'kjv', kind: 'bible', ref, text, words: wordCount(text) });
        kjvCands++;
      }
    }
  }
  report.push(`KJV: ${kjvBooks.length} books, ${kjvVerses} verses parsed, ${kjvCands} eligible`);
  if (kjvBooks.length !== 66 || kjvVerses !== 31102) {
    throw new Error(`KJV sanity check failed: ${kjvBooks.length} books / ${kjvVerses} verses (want 66 / 31102)`);
  }

  // ---- KJV Apocrypha -------------------------------------------------------
  const kjvaBooks = parseKjva(fs.readFileSync(path.join(RAW, 'pg124.txt'), 'utf8'));
  const kjvaPerBook = [];
  let kjvaCands = 0;
  let kjvaVerses = 0;
  for (const b of kjvaBooks) {
    let n = 0;
    let e = 0;
    for (const vs of b.verses) {
      const text = normalise(vs.text);
      if (!text) continue;
      n++;
      kjvaVerses++;
      const ref = b.emit ? kjvaRef(b, vs.c, vs.v) : `${b.name} ${vs.c}:${vs.v}`;
      all.push({ src: 'kjva', ref, text });
      if (!b.emit) continue;
      if (eligible(text, b.code)) {
        cands.push({
          cid: `kjva:${b.code}.${vs.c}.${vs.v}`, src: 'kjva', kind: 'deutero',
          canons: b.canons, ref, text, words: wordCount(text),
        });
        e++;
        kjvaCands++;
      }
    }
    kjvaPerBook.push(`${b.name}${b.emit ? '' : ' [left out]'}: ${n} verses, ${e} eligible, chapters 1-${Math.max(0, ...b.verses.map((x) => x.c))}`);
  }
  report.push(`KJV Apocrypha: ${kjvaBooks.length} books, ${kjvaVerses} verses parsed, ${kjvaCands} eligible`);
  for (const l of kjvaPerBook) report.push(`  ${l}`);

  // ---- WEBBE ---------------------------------------------------------------
  const { byBook, n: webbeVerses } = parseWebbe(fs.readFileSync(path.join(RAW, 'eng-webbe_vpl.txt'), 'utf8'));
  const kjvCodeSet = new Set(KJV_CODES);
  let wbCands = 0;
  let wdCands = 0;
  let wbVerses = 0;
  const dcPerBook = [];
  for (const [code, verses] of byBook) {
    const isBible = kjvCodeSet.has(code);
    const dc = WEBBE_DC[code];
    if (!isBible && !dc && !WEBBE_SKIP.has(code)) throw new Error(`unknown WEBBE book code ${code}`);
    const name = isBible ? KJV_NAMES[KJV_CODES.indexOf(code)] : (dc ? dc.name : code);
    let e = 0;
    for (const vs of verses) {
      const text = normalise(vs.text);
      if (!text) continue;
      const src = isBible ? 'webbe' : 'webbe-dc';
      const plainRef = isBible ? `${name} ${vs.c}:${vs.v}` : `${name} ${vs.c}:${vs.v}`;
      all.push({ src, ref: plainRef, text });
      if (isBible) {
        wbVerses++;
        if (eligible(text, code)) {
          cands.push({ cid: `webbe:${code}.${vs.c}.${vs.v}`, src: 'webbe', kind: 'bible', ref: plainRef, text, words: wordCount(text) });
          wbCands++;
        }
        continue;
      }
      if (!dc) continue;                       // ESG, 4ES, 4MA: parsed, never emitted
      if (code === 'DNG' && !dngKeep(vs.c, vs.v)) continue;
      const ref = webbeDcRef(code, vs.c, vs.v);
      if (!ref) continue;
      if (eligible(text, code)) {
        cands.push({
          cid: `webbe-dc:${code}.${vs.c}.${vs.v}`, src: 'webbe-dc', kind: 'deutero',
          canons: dc.canons, ref, text, words: wordCount(text),
        });
        e++;
        wdCands++;
      }
    }
    if (!isBible) dcPerBook.push(`${code} (${name})${WEBBE_SKIP.has(code) ? ' [left out]' : ''}: ${verses.length} verses, ${e} eligible`);
  }
  report.push(`WEBBE: ${webbeVerses} verses parsed in ${byBook.size} books; 66-book canon ${wbVerses} verses, ${wbCands} eligible`);
  report.push(`WEBBE deuterocanon: ${wdCands} eligible`);
  for (const l of dcPerBook) report.push(`  ${l}`);

  // ---- write ---------------------------------------------------------------
  const ids = new Set();
  for (const c of cands) {
    if (ids.has(c.cid)) throw new Error(`duplicate cid ${c.cid}`);
    ids.add(c.cid);
  }
  fs.writeFileSync(path.join(WORK, 'cand-bible.json'), JSON.stringify(cands, null, 1));
  fs.writeFileSync(path.join(WORK, 'verses-all.json'), JSON.stringify(all));

  const byKind = new Map();
  const bySrc = new Map();
  for (const c of cands) { bump(byKind, c.kind); bump(bySrc, c.src); }

  console.log(report.join('\n'));
  console.log('\ncand-bible.json:', cands.length, 'candidates; verses-all.json:', all.length, 'verses');
  console.log('by kind:', [...byKind].map(([k, v]) => `${k}=${v}`).join(' '));
  console.log('by src :', [...bySrc].map(([k, v]) => `${k}=${v}`).join(' '));

  // ten random candidates per source, seeded so reruns are identical
  let seed = 20260918;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (const src of ['kjv', 'kjva', 'webbe', 'webbe-dc']) {
    const pool = cands.filter((c) => c.src === src);
    console.log(`\n--- ${src} (${pool.length}) ---`);
    for (let i = 0; i < 10 && pool.length; i++) {
      const c = pool[Math.floor(rnd() * pool.length)];
      console.log(`${c.ref} | ${c.text}`);
    }
  }

  // ---- verify source registry against the downloaded file headers -----------
  const pg10 = fs.readFileSync(path.join(RAW, 'pg10.txt'), 'utf8').slice(0, 1200);
  const pg124 = fs.readFileSync(path.join(RAW, 'pg124.txt'), 'utf8').slice(0, 1200);
  const about = fs.readFileSync(path.join(RAW, 'eng-webbe_about.htm'), 'utf8');
  const srcs = JSON.parse(fs.readFileSync(SOURCES, 'utf8'));
  const notes = [];
  for (const s of srcs) {
    if (s.id === 'kjv') {
      s.verified = /Title: The King James Version of the Bible/.test(pg10) && /\[eBook #10\]/.test(pg10);
    } else if (s.id === 'kjva') {
      const ok = /Title: Deuterocanonical Books of the Bible/.test(pg124) && /\[eBook #124\]/.test(pg124);
      if (ok) {
        s.title = 'Deuterocanonical Books of the Bible (King James Version Apocrypha)';
        s.edition = 'Project Gutenberg eBook #124, credits Robert Kraft';
        notes.push('kjva: header title is "Deuterocanonical Books of the Bible", not "King James Version, Apocrypha"; title and edition corrected, Robert Kraft credited as the file header states.');
      }
      s.verified = ok;
    } else if (s.id === 'webbe' || s.id === 'webbe-dc') {
      const ok = /World English Bible British Edition/.test(about);
      if (ok && s.date !== '2020 stable text edition') {
        s.date = '2020 stable text edition';
        notes.push(`${s.id}: file header states "2020 stable text edition"; date field set to that.`);
      }
      s.verified = ok;
    }
  }
  fs.writeFileSync(SOURCES, JSON.stringify(srcs, null, 2) + '\n');
  console.log('\nsources-bible.json verified:', srcs.map((s) => `${s.id}=${s.verified}`).join(' '));
  for (const n of notes) console.log('note:', n);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
