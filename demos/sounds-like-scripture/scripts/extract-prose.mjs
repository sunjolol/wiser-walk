// extract-prose.mjs — build work/cand-prose.json from the eleven prose works in
// sources-prose.json. Scripts extract; nothing is written, paraphrased or tidied.
//
// Allowed normalisation only (SPEC "Integrity rules" 2): join hard-wrapped lines,
// collapse whitespace, strip Gutenberg italics underscores, strip footnote markers
// such as [12] or [A]. Candidates are produced ONLY by slicing a normalised
// paragraph, so every candidate is a contiguous substring of the normalised raw file.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url.
//   node scripts/extract-prose.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const rawDir = join(root, 'raw');
const workDir = join(root, 'work');
mkdirSync(workDir, { recursive: true });

const sources = JSON.parse(readFileSync(join(root, 'sources-prose.json'), 'utf8'));

/* ------------------------------------------------------------------ */
/* normalisation (identical for candidates and for the verify pass)    */
/* ------------------------------------------------------------------ */

function normalize(s) {
  return s
    .replace(/_/g, '')
    .replace(/\[(?:\d+|[A-Za-z])\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ */
/* raw file handling                                                   */
/* ------------------------------------------------------------------ */

function rawName(url) {
  const m = url.match(/pg(\d+)\.txt$/);
  return m ? `pg${m[1]}.txt` : url.split('/').pop();
}

function bodyLines(file) {
  const text = readFileSync(join(rawDir, file), 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  let a = 0, b = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^\*\*\* START OF/.test(lines[i])) { a = i + 1; break; }
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\*\*\* END OF/.test(lines[i])) { b = i; break; }
  }
  return lines.slice(a, b);
}

/* ------------------------------------------------------------------ */
/* sentence splitting                                                  */
/* ------------------------------------------------------------------ */

const ABBR = new Set([
  'st', 'mr', 'mrs', 'ms', 'dr', 'rev', 'prof', 'messrs', 'sir',
  'viz', 'etc', 'cf', 'vol', 'vols', 'chap', 'chaps', 'ch', 'pp', 'no', 'nos',
  'vs', 'fig', 'jr', 'sr', 'ibid', 'al', 'lat', 'gr', 'hist', 'eccl', 'comp',
  'sc', 'ver', 'cap', 'lib', 'ep', 'cod', 'ms', 'mss', 'ed', 'trans', 'pt',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'
]);

const CLOSERS = /["'”’»)\]]/;

// Returns the sentences of a normalised paragraph, as slices of it.
function splitSentences(p) {
  const out = [];
  let start = 0;
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c !== '.' && c !== '?' && c !== '!') continue;
    // swallow closing quotes / brackets
    let j = i + 1;
    while (j < p.length && CLOSERS.test(p[j])) j++;
    if (j < p.length) {
      if (p[j] !== ' ') continue;                 // "3.5" or "e.g.something"
      let k = j;
      while (k < p.length && p[k] === ' ') k++;
      if (k < p.length && !/[A-Z“"‘'(]/.test(p[k])) continue;  // next must open a sentence
    }
    if (c === '.') {
      const m = p.slice(Math.max(0, i - 20), i).match(/([A-Za-z.]+)$/);
      const wordRaw = m ? m[1] : '';
      const word = wordRaw.toLowerCase();
      if (!word) continue;
      if (word.includes('.')) continue;                    // i.e. / A.D. / U.S.
      if (wordRaw.length === 1) continue;                  // an initial
      if (ABBR.has(word)) continue;
      if (/^[IVXLCDM]+$/.test(wordRaw)) continue;          // Roman numeral
      if (wordRaw.length <= 4 && wordRaw === wordRaw.toUpperCase()) continue; // CHR. HOPE.
    }
    const piece = p.slice(start, j);
    out.push(piece);
    start = j;
    while (start < p.length && p[start] === ' ') start++;
    i = j - 1;
  }
  if (start < p.length) out.push(p.slice(start));           // tail (usually dropped)
  return out;
}

/* ------------------------------------------------------------------ */
/* eligibility (SPEC "Eligibility")                                    */
/* ------------------------------------------------------------------ */

const DIVINE = new Set([
  'God', 'Lord', 'Christ', 'Jesus', 'He', 'His', 'Him', 'Himself', 'Thee', 'Thou',
  'Thy', 'Thine', 'Thyself', 'I', 'O', 'Father', 'Son', 'Spirit', 'Holy', 'Word',
  'Heaven', 'Amen', 'Divine', 'Saviour', 'Almighty', 'Creator', 'Maker', 'Wisdom',
  'Love', 'Truth', 'Who', 'Whom', 'Whose', 'Ye', 'Me', 'My', 'Mine', 'Self', 'Nay',
  'Being', 'Good', 'Goodness'
]);

const BAD_CHARS = /[Ͱ-Ͽἀ-῿֐-׿⺀-�]/;

// The Ante-Nicene Library leaves indelicate passages of Clement untranslated, and
// Latin tags appear elsewhere. An English sentence of nine words or more always
// carries several of these; a Latin one carries almost none.
const ENGLISH = new Set([
  'the', 'and', 'of', 'to', 'that', 'is', 'was', 'for', 'with', 'which', 'not', 'but',
  'in', 'he', 'we', 'you', 'they', 'it', 'his', 'thou', 'ye', 'unto', 'their', 'have',
  'are', 'be', 'as', 'by', 'from', 'this', 'all', 'who', 'them', 'shall', 'our', 'on',
  'at', 'has', 'had', 'were', 'been', 'will', 'would', 'may', 'when', 'what', 'there',
  'she', 'her', 'him', 'my', 'me', 'us', 'thy', 'thee', 'if', 'so', 'no', 'do', 'does'
]);

function countQuotes(text, a, b) {
  const x = (text.match(new RegExp(a, 'g')) || []).length;
  const y = (text.match(new RegExp(b, 'g')) || []).length;
  return x === y;
}

function eligible(text) {
  if (!/^[A-Z“"‘']/.test(text)) return false;
  if (!/[.?!]["”’']?$/.test(text)) return false;
  if (/\d/.test(text)) return false;
  if (/[[\]{}<>]/.test(text)) return false;
  if (/\.\.\.|…/.test(text)) return false;
  if (/https?:|www\./.test(text)) return false;
  if (/[Ͱ-Ͽἀ-῿֐-׿]/.test(text)) return false;
  if (BAD_CHARS.test(text)) return false;
  if (/\bSelah\b/.test(text)) return false;
  if (/[=〚〛⌜⌝‹›|*†‡§¶]/.test(text)) return false;
  if (/^[A-Z][A-Z'-]+[.:]\s/.test(text)) return false;      // "CHR." / "GOOD-WILL." labels
  if ((text.match(/\b[A-Z]{3,}\b/g) || []).length >= 2) return false;   // sidenotes
  if ((text.match(/"/g) || []).length % 2 !== 0) return false;
  if (!countQuotes(text, '“', '”')) return false;  // an unclosed quotation
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 9 || words.length > 34) return false;
  let english = 0;
  for (const w of words) {
    const k = w.replace(/[^A-Za-z']/g, '').toLowerCase();
    if (ENGLISH.has(k)) english++;
  }
  if (english < 3) return false;
  let caps = 0;
  for (let i = 1; i < words.length; i++) {
    const w = words[i].replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
    if (!w) continue;
    if (/^[A-Z][a-z]+$/.test(w) && !DIVINE.has(w)) {
      // a capital right after a full stop inside the unit cannot happen (one sentence)
      caps++;
    }
  }
  if (caps > 3) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
function roman(s) {
  s = s.toUpperCase();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]], nx = ROMAN[s[i + 1]] || 0;
    n += v < nx ? -v : v;
  }
  return n;
}

const ORD = {
  FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5, SIXTH: 6, SEVENTH: 7,
  EIGHTH: 8, NINTH: 9, TENTH: 10, ELEVENTH: 11, TWELFTH: 12, THIRTEENTH: 13,
  FOURTEENTH: 14, FIFTEENTH: 15, SIXTEENTH: 16, SEVENTEENTH: 17, EIGHTEENTH: 18,
  NINETEENTH: 19, TWENTIETH: 20, 'TWENTY-FIRST': 21, 'TWENTY-SECOND': 22
};

function toRoman(n) {
  const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
}

const SMALL = new Set(['of', 'the', 'and', 'in', 'on', 'to', 'a', 'an', 'for', 'or', 'with', 'their', 'its']);
function titleCase(s) {
  return s.toLowerCase().split(/\s+/).map((w, i) =>
    i > 0 && SMALL.has(w) ? w : w.replace(/^([a-z])/, (m) => m.toUpperCase())
  ).join(' ');
}

/* ------------------------------------------------------------------ */
/* the paragraph collector                                             */
/* ------------------------------------------------------------------ */
// Each profile is a generator over raw lines that yields
// { ref, work?, para } where para is the joined (not yet normalised) paragraph.

function collect(lines, step) {
  // step(line, state) -> 'text' | 'break' | ref-setting side effects
  const out = [];
  let buf = [];
  let ref = null, work = null;
  const flush = () => {
    if (buf.length && ref) out.push({ ref, work, para: buf.join(' ') });
    buf = [];
  };
  const api = {
    setRef(r) { flush(); ref = r; },
    setWork(w) { work = w; },
    text(l) { buf.push(l); },
    brk() { flush(); }
  };
  for (const line of lines) step(line, api);
  flush();
  return out;
}

/* ------------------------------------------------------------------ */
/* profiles                                                            */
/* ------------------------------------------------------------------ */

const profiles = {};

/* --- The Writings of the Apostolic Fathers (pg77576) ---------------- *
 * ANF layout: body paragraphs at column 0, every heading indented 4+,
 * footnotes gathered as "Footnote N:" + two-space-indented lines.
 * Included works only; the introductory notices, the Syriac recension,
 * the Martyrdom of Ignatius, the fragments of Papias and the appendix of
 * spurious Ignatian letters are all excluded. Within the Ignatian letters
 * only the SHORTER recension is taken (the file labels both).            */
profiles.apf = (files) => {
  const lines = bodyLines(files[0]);
  const WORKS = [
    [/^THE FIRST EPISTLE OF CLEMENT/, '1 Clement', '1 Clement'],
    [/^THE SECOND EPISTLE OF CLEMENT/, '2 Clement', '2 Clement'],
    [/^THE EPISTLE OF POLYCARP/, 'Polycarp to the Philippians', 'Polycarp to the Philippians'],
    [/^THE MARTYRDOM OF POLYCARP|^THE ENCYCLICAL EPISTLE OF THE CHURCH AT SMYRNA/, 'The Martyrdom of Polycarp', 'The Martyrdom of Polycarp'],
    [/^THE EPISTLE OF BARNABAS/, 'The Epistle of Barnabas', 'The Epistle of Barnabas'],
    [/^THE EPISTLE OF IGNATIUS TO THE ([A-ZÆ]+)\.$/, null, 'The Epistles of Ignatius'],
    [/^THE EPISTLE OF IGNATIUS TO POLYCARP\.$/, 'Ignatius to Polycarp', 'The Epistles of Ignatius'],
    [/^THE EPISTLE TO DIOGNETUS/, 'The Epistle to Diognetus', 'The Epistle to Diognetus'],
    [/^THE PASTOR OF HERMAS/, 'The Shepherd of Hermas', 'The Shepherd of Hermas']
  ];
  // soft stop: skip this section but keep reading (a later work follows)
  const SKIP = /^THE EPISTLES OF IGNATIUS AFTER THE SYRIAC VERSION|^THE MARTYRDOM OF IGNATIUS/;
  // hard stop: nothing after these belongs in the pool
  const STOP = /^FRAGMENTS OF PAPIAS|^THE SPURIOUS EPISTLES OF IGNATIUS|^INDEX OF/;

  let cite = null, workName = null, chap = null, division = null;
  let recension = 'shorter', notice = false, dead = false, resume = false;

  const setRefFor = (api) => {
    if (!cite) { api.setRef(null); return; }
    if (cite === 'The Shepherd of Hermas') {
      api.setRef(
        division && chap ? `${cite}, ${division}, ch. ${chap}`
          : division ? `${cite}, ${division}`
            : cite
      );
    } else if (/^Ignatius to /.test(cite)) {
      api.setRef(chap ? `${cite} ${chap}` : cite);
    } else {
      api.setRef(chap ? `${cite} ${chap}` : cite);
    }
    api.setWork(workName);
  };

  return collect(lines, (line, api) => {
    if (dead) return;
    const ind = /^\s/.test(line);
    const t = line.trim();
    if (!t) { api.brk(); return; }

    if (ind) {                                   // a heading of some kind
      if (STOP.test(t)) { dead = true; api.setRef(null); return; }
      if (SKIP.test(t)) {
        cite = null; workName = null; chap = null; division = null;
        notice = false; api.setRef(null); return;
      }
      if (/^INTRODUCTORY NOTICE/.test(t)) { notice = true; api.setRef(null); return; }
      let hit = false;
      for (const [re, name, wk] of WORKS) {
        const m = t.match(re);
        if (!m) continue;
        cite = name || `Ignatius to the ${titleCase(m[1])}`;
        workName = wk; chap = null; division = null; recension = 'shorter';
        notice = false; hit = true;
        setRefFor(api);
        break;
      }
      if (hit) return;
      let m;
      if ((m = t.match(/^CHAP\. ([IVXLC]+)\./))) {
        notice = false; chap = roman(m[1]);
        if (/—\s*LONGER\.?$/.test(t)) recension = 'longer';
        else if (/—\s*SHORTER\.?$/.test(t)) recension = 'shorter';
        setRefFor(api);
        return;
      }
      if ((m = t.match(/^(VISION|COMMANDMENT|SIMILITUDE) ([A-Z-]+)\.$/))) {
        notice = false;
        const n = ORD[m[2]];
        division = n ? `${titleCase(m[1])} ${n}` : null;
        chap = null;
        setRefFor(api);
        return;
      }
      notice = false;        // any other heading closes an introductory notice
      api.brk();
      return;
    }

    // column-0 line
    if (/^Footnote \d+:/.test(t)) { api.brk(); return; }
    if (/^(SHORTER|LONGER)\.$/.test(t)) {
      recension = t.startsWith('SHORTER') ? 'shorter' : 'longer';
      api.brk(); return;
    }
    if (/^(SHORTER|LONGER)\. /.test(t)) { api.brk(); return; }  // inline label: skip para
    if (notice || dead) { api.brk(); return; }
    if (workName === 'The Epistles of Ignatius' && recension !== 'shorter') { api.brk(); return; }
    api.text(t);
    void resume;
  });
};

/* --- 1 Enoch (pg77935) --------------------------------------------- *
 * Body starts at "THE BOOK OF ENOCH" / "I-XXXVI." after the editors'
 * preface and R. H. Charles' introduction. Prose is at column 0; verse
 * is indented; section summaries are indented italic lines; footnotes are
 * "Footnote N:" blocks. Chapters are Roman numerals at a paragraph start,
 * verses are "N." markers inside the paragraph.                         */
profiles.enoch = (files) => {
  const lines = bodyLines(files[0]);
  let started = false, seenTitle = 0, chap = null;
  const paras = [];
  let buf = [];
  const flush = () => { if (buf.length) { paras.push(buf.join(' ')); buf = []; } };

  for (const line of lines) {
    const t = line.trim();
    if (!started) {
      // the body is the SECOND bare "THE BOOK OF ENOCH" heading, the one
      // immediately followed by the range "I-XXXVI."
      if (/^THE BOOK OF ENOCH$/.test(t)) { seenTitle++; continue; }
      if (seenTitle >= 3 && /^I-XXXVI\.$/.test(t)) { started = true; flush(); }
      continue;
    }
    if (!t) { flush(); continue; }
    if (/^\s/.test(line)) { flush(); continue; }      // verse, headings, summaries
    if (/^Footnote \d+:/.test(t)) { flush(); continue; }
    buf.push(t);
  }
  flush();

  const out = [];
  for (const raw of paras) {
    let p = normalize(raw);
    const cm = p.match(/^([IVXLC]+)\.\s+/);
    if (cm) { chap = roman(cm[1]); p = p.slice(cm[0].length); }
    if (!chap) continue;
    // verse markers
    const marks = [];
    const re = /(?:^|\s)(\d+)\.\s/g;
    let m;
    if (/^\d+\.\s/.test(p)) { /* handled by the loop below */ }
    while ((m = re.exec(p))) {
      marks.push({ n: Number(m[1]), from: m.index + m[0].length });
      re.lastIndex = m.index + m[0].length;
    }
    const first = cm ? { n: 1, from: 0 } : null;
    const all = first && (!marks.length || marks[0].n !== 1) ? [first, ...marks] : marks;
    for (let i = 0; i < all.length - 1; i++) {
      if (all[i + 1].n !== all[i].n + 1) continue;    // only provably complete verses
      const startI = all[i].from;
      const endI = p.lastIndexOf(` ${all[i + 1].n}. `, all[i + 1].from);
      const text = p.slice(startI, endI < 0 ? all[i + 1].from : endI).trim();
      if (!text) continue;
      out.push({ ref: `1 Enoch ${chap}:${all[i].n}`, work: null, text });
    }
  }
  return { preSplit: out };
};

/* --- Confessions, Pusey (pg3296) ------------------------------------ *
 * Thirteen books, "BOOK I".."BOOK XIII" at column 0, no chapter marks in
 * this edition, no footnotes. Ends at the colophon.                     */
profiles.conf = (files) => {
  const lines = bodyLines(files[0]);
  let started = false, dead = false;
  return collect(lines, (line, api) => {
    if (dead) return;
    const t = line.trim();
    if (/^GRATIAS TIBI DOMINE$/.test(t)) { dead = true; api.setRef(null); return; }
    const m = t.match(/^BOOK ([IVXL]+)$/);
    if (m) { started = true; api.setRef(`Confessions, Book ${m[1]}`); return; }
    if (!started) return;
    if (!t) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }
    api.text(t);
  });
};

/* --- The City of God, Dods (pg45304, pg45305) ----------------------- *
 * Body paragraphs at column 0. Book headings "BOOK FIRST." (sometimes
 * with a footnote marker), ARGUMENT summaries indented, chapter headings
 * " N. _title._" with a single leading space, footnotes in "FOOTNOTES:"
 * blocks whose entries start "[n]" at column 0.                         */
profiles.civ = (files) => {
  const out = [];
  for (const f of files) {
    const lines = bodyLines(f);
    let book = null, chap = null, fn = false;
    out.push(...collect(lines, (line, api) => {
      const t = line.trim();
      let m;
      if ((m = t.match(/^BOOK ([A-Z-]+)\.(?:\[\d+\])?$/))) {
        const n = ORD[m[1]];
        if (n) { book = toRoman(n); chap = null; fn = false; api.setRef(null); }
        return;
      }
      if (/^FOOTNOTES:$/.test(t)) { fn = true; api.setRef(null); return; }
      if ((m = line.match(/^ {1,8}(\d+)\. _/))) {
        chap = Number(m[1]); fn = false;
        api.setRef(book ? `The City of God, Book ${book}, ch. ${chap}` : null);
        return;
      }
      if (!t) { api.brk(); return; }
      if (fn || !book || !chap) { api.brk(); return; }
      if (/^\s/.test(line)) { api.brk(); return; }
      if (/^\[\d+\]/.test(t)) { api.brk(); return; }
      api.text(t);
    }));
  }
  return out;
};

/* --- The Imitation of Christ, Benham (pg1653) ----------------------- *
 * "THE FIRST BOOK".."THE FOURTH BOOK", "CHAPTER <roman>" followed by a
 * title line, numbered paragraphs. No footnotes.                        */
profiles.imit = (files) => {
  const lines = bodyLines(files[0]);
  let book = null, chap = null, skipNext = false;
  return collect(lines, (line, api) => {
    const t = line.trim();
    let m;
    if ((m = t.match(/^THE (FIRST|SECOND|THIRD|FOURTH) BOOK$/))) {
      book = toRoman(ORD[m[1]]); chap = null; api.setRef(null); return;
    }
    if ((m = t.match(/^CHAPTER ([IVXL]+)$/))) {
      chap = roman(m[1]); skipNext = true;
      api.setRef(book ? `The Imitation of Christ, Book ${book}, ch. ${chap}` : null);
      return;
    }
    if (!t) { api.brk(); return; }
    if (skipNext) { skipNext = false; api.brk(); return; }   // the chapter title line
    if (!book || !chap) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }
    api.text(t.replace(/^\d+\.\s+/, ''));
  });
};

/* --- The Pilgrim's Progress (pg131) --------------------------------- *
 * Part One only. Prose at column 0, verse indented, arbitrary section
 * markers {n} (the file itself calls them arbitrary, so they are not
 * cited), Bible references in square brackets inside the prose.          */
profiles.pilg = (files) => {
  const lines = bodyLines(files[0]);
  let started = false;
  return collect(lines, (line, api) => {
    const t = line.trim();
    if (!started) {
      if (/^In the Similitude of a Dream$/.test(t)) {
        started = true; api.setRef("The Pilgrim's Progress");
      }
      return;
    }
    if (!t) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }      // verse
    api.text(t.replace(/^\{\d+\}\s*/, ''));
  });
};

/* --- Revelations of Divine Love, Warrack (pg52958) ------------------ *
 * Body runs from the title heading before CHAPTER I to the scribe's
 * postscript. Chapter headings and their quoted titles are indented;
 * footnotes are "[n] ..." lines at column 0.                            */
profiles.julian = (files) => {
  const lines = bodyLines(files[0]);
  let armed = false, started = false, chap = null, dead = false, fn = false;
  return collect(lines, (line, api) => {
    if (dead) return;
    const t = line.trim();
    if (/^POSTSCRIPT BY A SCRIBE$/.test(t)) { dead = true; api.setRef(null); return; }
    if (/^REVELATIONS OF DIVINE LOVE$/.test(t)) { armed = true; return; }
    const m = t.match(/^CHAPTER ([IVXLC]+)$/);
    if (m && armed) {
      started = true; chap = roman(m[1]); fn = false;
      api.setRef(`Revelations of Divine Love, ch. ${chap}`);
      return;
    }
    if (!started) return;
    if (!t) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }
    // a note block runs to the end of the chapter: everything after it is editorial
    if (/^\[\d+\]/.test(t)) { fn = true; api.brk(); return; }
    if (fn) { api.brk(); return; }
    api.text(t);
  });
};

/* --- Antiquities of the Jews, Whiston (pg2848) ---------------------- *
 * A table of contents repeats the BOOK/CHAPTER headings, so the body is
 * gated on the second "BOOK I." heading. Footnote blocks are headed
 * FOOTNOTES; footnote markers in the text are bare numerals, so any
 * sentence carrying one is dropped by the no-digits rule.               */
profiles.jos = (files) => {
  const lines = bodyLines(files[0]);
  let seenBookI = 0, started = false, book = null, chap = null, fn = false, skipToBlank = false;
  return collect(lines, (line, api) => {
    const t = line.trim();
    let m;
    if ((m = t.match(/^BOOK ([IVXL]+)\./))) {
      if (m[1] === 'I') seenBookI++;
      if (seenBookI >= 2) started = true;
      book = m[1]; chap = null; fn = false; skipToBlank = true; api.setRef(null);
      return;
    }
    if (/^FOOTNOTES$/.test(t)) { fn = true; api.setRef(null); return; }
    if ((m = t.match(/^CHAPTER (\d+)\./))) {
      chap = Number(m[1]); fn = false; skipToBlank = true;
      api.setRef(started && book ? `Antiquities of the Jews, Book ${book}, ch. ${chap}` : null);
      return;
    }
    if (!t) { skipToBlank = false; api.brk(); return; }
    if (skipToBlank) { api.brk(); return; }             // wrapped heading line
    if (!started || fn || !book || !chap) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }
    api.text(t.replace(/^\d+\.\s+/, ''));
  });
};

/* --- The Thoughts of Blaise Pascal (pg46921) ------------------------ *
 * Front matter is indented two spaces; the body sits at column 0 with
 * italic section headings _LIKE THIS._ The notes and index follow.      */
profiles.pascal = (files) => {
  const lines = bodyLines(files[0]);
  let started = false, dead = false, section = null;
  return collect(lines, (line, api) => {
    if (dead) return;
    const t = line.trim();
    const m = t.match(/^_([A-Z][A-Z' ,.’-]*)\._$/);
    if (m) {
      const name = m[1].replace(/\.$/, '');
      if (/^NOTES$|^INDEX$/.test(name)) { dead = true; api.setRef(null); return; }
      if (/^PREFACE TO THE FIRST PART$/.test(name)) started = true;
      if (!started) { api.setRef(null); return; }
      section = titleCase(name);
      api.setRef(`The Thoughts of Blaise Pascal, ${section}`);
      return;
    }
    if (!started) return;
    if (!t) { api.brk(); return; }
    if (/^\s/.test(line)) { api.brk(); return; }
    api.text(t);
  });
};

/* --- The Consolation of Philosophy, James (pg14328) ----------------- *
 * Alternating prose chapters (bare Roman numerals at column 0) and verse
 * SONGs (skipped whole). Book summaries are indented; footnote blocks are
 * headed FOOTNOTES:.                                                    */
profiles.boeth = (files) => {
  const lines = bodyLines(files[0]);
  let book = null, chap = null, mode = 'skip';
  return collect(lines, (line, api) => {
    const t = line.trim();
    let m;
    if (/^\s/.test(line)) { api.brk(); return; }          // verse and summaries
    if ((m = t.match(/^BOOK ([IVX]+)\.$/))) {
      book = m[1]; chap = null; mode = 'skip'; api.setRef(null); return;
    }
    if (/^SONG [IVX]+\.$/.test(t) || /^FOOTNOTES:$/.test(t)) {
      mode = 'skip'; api.setRef(null); return;
    }
    if ((m = t.match(/^([IVX]+)\.$/))) {
      chap = roman(m[1]); mode = 'text';
      api.setRef(book ? `The Consolation of Philosophy, Book ${book}, ch. ${chap}` : null);
      return;
    }
    if (!t) { api.brk(); return; }
    if (mode !== 'text' || !book || !chap) { api.brk(); return; }
    api.text(t);
  });
};

/* --- Clement of Alexandria, Wilson (pg71937, pg73020) --------------- *
 * Same ANF layout as the Apostolic Fathers: body at column 0, headings
 * indented, one FOOTNOTES: block at the end of each volume. The table of
 * contents is indented, so emission is gated on the first real CHAPTER
 * heading (which also skips the introductory notice).                   */
profiles.clemalex = (files) => {
  const out = [];
  for (const f of files) {
    const lines = bodyLines(f);
    let work = null, book = null, chap = null, started = false, dead = false;
    const setRef = (api) => {
      if (!started || !work || !chap) { api.setRef(null); return; }
      api.setRef(book ? `${work}, Book ${book}, ch. ${chap}` : `${work}, ch. ${chap}`);
    };
    out.push(...collect(lines, (line, api) => {
      if (dead) return;
      const t = line.trim();
      if (/^FOOTNOTES:$/.test(t)) { dead = true; api.setRef(null); return; }
      if (/^\s/.test(line)) {
        let m;
        if (/^EXHORTATION TO THE HEATHEN\.$/.test(t)) {
          work = 'The Exhortation to the Heathen'; book = null; chap = null; setRef(api); return;
        }
        if (/^THE INSTRUCTOR\.$/.test(t)) {
          work = 'The Instructor'; book = null; chap = null; setRef(api); return;
        }
        if (/^THE MISCELLANIES(; OR, STROMATA)?\.$/.test(t)) {
          work = 'The Stromata'; book = null; chap = null; setRef(api); return;
        }
        if ((m = t.match(/^BOOK ([IVX]+)\.(?:\[\d+\])?$/))) {
          book = m[1]; chap = null; setRef(api); return;
        }
        if ((m = t.match(/^CHAPTER ([IVXLC]+)\.(?:\[\d+\])?$/))) {
          started = true; chap = roman(m[1]); setRef(api); return;
        }
        api.brk();
        return;
      }
      if (!t) { api.brk(); return; }
      api.text(t);
    }));
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* run                                                                 */
/* ------------------------------------------------------------------ */

const candidates = [];
const counts = {};
const samples = {};
const rng = mulberry32(20260918);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

for (const s of sources) {
  const files = [s.url, s.url2].filter(Boolean).map(rawName);
  for (const f of files) {
    if (!existsSync(join(rawDir, f))) throw new Error(`missing raw file ${f} — run scripts/fetch-prose.mjs`);
  }
  const prof = profiles[s.id];
  if (!prof) throw new Error(`no parser profile for ${s.id}`);
  const res = prof(files);

  const units = [];
  if (Array.isArray(res)) {
    for (const { ref, work, para } of res) {
      if (!ref) continue;
      const p = normalize(para);
      for (const sent of splitSentences(p)) units.push({ ref, work, text: sent.trim() });
    }
  } else {
    for (const u of res.preSplit) units.push(u);
  }

  const seen = new Set();
  let kept = 0;
  const mine = [];
  for (const u of units) {
    const text = u.text;
    if (!eligible(text)) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    const cid = `${s.id}:${createHash('sha1').update(text).digest('hex').slice(0, 10)}`;
    const rec = { cid, src: s.id, kind: 'other', ref: u.ref, text, words: text.split(/\s+/).length };
    if (u.work) rec.work = u.work;
    candidates.push(rec);
    mine.push(rec);
    kept++;
  }
  counts[s.id] = kept;
  if (s.id === 'apf') {
    counts.apf_by_work = {};
    for (const r of mine) counts.apf_by_work[r.work] = (counts.apf_by_work[r.work] || 0) + 1;
  }
  // ten reproducible random samples
  const pick = [];
  const pool = mine.slice();
  for (let i = 0; i < 10 && pool.length; i++) {
    pick.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  samples[s.id] = pick.map((r) => `${r.ref} — ${r.text}`);
}

/* --- verification: every candidate is a substring of its normalised raw --- */
const normCache = new Map();
function normFile(f) {
  if (!normCache.has(f)) {
    normCache.set(f, normalize(readFileSync(join(rawDir, f), 'utf8').replace(/\r\n/g, '\n')));
  }
  return normCache.get(f);
}
const filesBySrc = {};
for (const s of sources) filesBySrc[s.id] = [s.url, s.url2].filter(Boolean).map(rawName);

let failures = 0;
for (const c of candidates) {
  const ok = filesBySrc[c.src].some((f) => normFile(f).includes(c.text));
  if (!ok) {
    failures++;
    if (failures <= 5) console.error('NOT A SUBSTRING', c.cid, c.ref, JSON.stringify(c.text.slice(0, 90)));
  }
}

writeFileSync(join(workDir, 'cand-prose.json'), JSON.stringify(candidates, null, 1) + '\n', 'utf8');

console.log(JSON.stringify({ total: candidates.length, counts, failures }, null, 2));
console.log('\n--- samples ---');
for (const k of Object.keys(samples)) {
  console.log(`\n[${k}]`);
  for (const line of samples[k]) console.log('  ' + line);
}
if (failures) process.exitCode = 1;
