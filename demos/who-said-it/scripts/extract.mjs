#!/usr/bin/env node
// Who Said It? — candidate extractor.
//
// Joins Glyssen's CharacterVerse.txt (SIL / Faith Comes By Hearing, MIT) to the verse text
// already parsed for the sibling game (demos/sounds-like-scripture/work/verses-all.json).
//
// Nothing here writes, trims or tidies a line: every candidate's `text` is asserted to be a
// verbatim substring of the verse it came from, and every speaker label comes from the Glyssen
// file. Node 24, ESM, zero dependencies, paths resolved from import.meta.url.
//
//   node demos/who-said-it/scripts/extract.mjs
//
// Writes  work/candidates.json  and  speakers.json  and prints the sanity report.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');                 // demos/who-said-it
const RAW = join(ROOT, 'raw');
const WORK = join(ROOT, 'work');
const VERSES = join(ROOT, '..', 'sounds-like-scripture', 'work', 'verses-all.json');

/* ------------------------------------------------------------------ USFM map */

// USFM code -> book name as it appears in verses-all.json refs. All 66; asserted below.
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
const BOOK_NAME = new Map(BOOKS);
const NT_FROM = BOOKS.findIndex(([c]) => c === 'MAT');
const BOOK_ORDER = new Map(BOOKS.map(([c], i) => [c, i]));
const testamentOf = (code) => (BOOK_ORDER.get(code) >= NT_FROM ? 'NT' : 'OT');

/* ------------------------------------------------------- Glyssen: speaker data */

const ELIGIBLE_TYPES = new Set(['Normal', 'Dialogue', 'Implicit']);
// Rows that signal the attribution itself is uncertain. A verse carrying one of these for a
// character other than the candidate speaker is dropped rather than guessed at.
const AMBIGUOUS_TYPES = new Set(['Alternate']);
const PSEUDO = /^(narrator-|scripture$|Needs Review$)/;

function isUsableCharacter(id) {
  if (!id) return false;
  if (PSEUDO.test(id)) return false;
  if (id.includes('/')) return false;        // Glyssen's "X/Y" = could be either, or a duet
  return true;
}

function parseCharacterVerse(text) {
  const out = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || line.startsWith('Control File')) continue;
    const f = line.split('\t');
    if (f.length < 10) { skipped++; continue; }
    const [book, c, v, id, delivery, alias, type, dflt, parallel, position] = f;
    if (!BOOK_NAME.has(book)) { skipped++; continue; }
    out.push({
      book, ch: Number(c), vs: Number(v), id: id.trim(), delivery, alias: alias.trim(),
      type: type.trim(), dflt, parallel, position: position.trim(),
    });
  }
  return { rows: out, skipped };
}

function parseCharacterDetail(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const f = line.split('\t');
    if (f.length < 4) continue;
    const [id, max, gender, age, status, comment, reference, fcbh] = f;
    map.set(id.trim(), {
      maxSpeakers: Number(max), gender, age: (age || '').trim(),
      status, comment: comment || '', reference: reference || '', fcbh: fcbh || '',
    });
  }
  return map;
}

/* --------------------------------------------------------------- verse text */

const OPEN = '“', CLOSE = '”';       // WEBBE top-level speech marks
const SQ_OPEN = '‘', SQ_CLOSE = '’'; // nested speech (and apostrophe) — part of the speech

function loadVerses() {
  if (!existsSync(VERSES)) {
    throw new Error('missing ' + VERSES + ' — rebuild it with ' +
      'node demos/sounds-like-scripture/scripts/extract-bible.mjs');
  }
  const all = JSON.parse(readFileSync(VERSES, 'utf8'));
  const byName = new Map();                       // src|Book -> Map(ch -> Map(vs -> text))
  for (const r of all) {
    if (r.src !== 'kjv' && r.src !== 'webbe') continue;   // deuterocanon is not this game's canon
    const m = /^(.+) (\d+):(\d+)$/.exec(r.ref);
    if (!m) continue;
    const key = r.src + '|' + m[1];
    let chapters = byName.get(key);
    if (!chapters) byName.set(key, chapters = new Map());
    const ch = Number(m[2]);
    let verses = chapters.get(ch);
    if (!verses) chapters.set(ch, verses = new Map());
    verses.set(Number(m[3]), r.text);
  }
  return byName;
}

/* ------------------------------------------------ WEBBE speech-mark analysis */

// Walk a chapter once, carrying the "inside a speech" state across verses. WEBBE re-opens a
// continuing speech with a new opening mark at each paragraph and closes it only at the end, so
// an opening mark while already inside a speech is a re-open, not a nesting level.
function chapterStates(verses) {
  const nums = [...verses.keys()].sort((a, b) => a - b);
  const before = new Map(), after = new Map();
  let s = false;
  for (const n of nums) {
    before.set(n, s);
    for (const chr of verses.get(n)) {
      if (chr === OPEN) s = true;
      else if (chr === CLOSE) s = false;
    }
    after.set(n, s);
  }
  return { nums, before, after };
}

// Maximal speech regions inside one verse, given the state inherited from the previous verse.
// Returns [{start, end, openedHere, closedHere}] with start/end excluding the marks themselves.
function regionsIn(text, inherited) {
  const regions = [];
  let s = inherited, start = inherited ? 0 : -1, openedHere = false;
  for (let i = 0; i < text.length; i++) {
    const chr = text[i];
    if (chr === OPEN && !s) { s = true; start = i + 1; openedHere = true; }
    else if (chr === CLOSE && s) {
      regions.push({ start, end: i, openedHere, closedHere: true });
      s = false; start = -1; openedHere = false;
    }
  }
  if (s) regions.push({ start, end: text.length, openedHere, closedHere: false });
  return regions;
}

function positionFromMarks(text, region) {
  const atStart = text.slice(0, region.start).replace(/[“\s]/g, '') === '';
  const atEnd = text.slice(region.end).replace(/[”\s]/g, '') === '';
  if (atStart && atEnd) return 'EntireVerse';
  if (atStart) return 'StartOfVerse';
  if (atEnd) return 'EndOfVerse';
  return 'ContainedWithinVerse';
}

/* --------------------------------------------------------- display + filters */

// Display only. The verbatim `text` is never touched; verify.mjs checks `text`, not this.
function toDisplay(text) {
  let d = text
    .replace(/“|”/g, '"')
    .replace(/‘|’/g, "'")
    .replace(/\bLORD\b/g, 'Lord')
    .replace(/\bGOD\b/g, 'God')
    .replace(/\s+/g, ' ')
    .trim();
  // Any enclosing or dangling speech mark left at either end is dropped (the card is the speech).
  while (d.length && (d[0] === '"' || d[0] === "'")) d = d.slice(1).trim();
  while (d.length && (d[d.length - 1] === '"' || d[d.length - 1] === "'")) d = d.slice(0, -1).trim();
  return d;
}

const wordsOf = (d) => d.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;

const MIN_WORDS = 8, MAX_WORDS = 34;

function eligibleDisplay(d) {
  if (!d) return 'empty';
  if (/\d/.test(d)) return 'digits';
  if (!/^[A-Z]/.test(d)) return 'not-sentence-start';
  if (!/[.?!]$/.test(d)) return 'no-terminal-punctuation';
  const w = wordsOf(d);
  if (w < MIN_WORDS) return 'too-short';
  if (w > MAX_WORDS) return 'too-long';
  return null;
}

/* ------------------------------------------ speaker names and name blocklist */

const NAME_STOPWORDS = new Set([
  'The', 'Of', 'And', 'Son', 'Sons', 'Daughter', 'Daughters', 'King', 'Kings', 'Queen',
  'Priest', 'Priests', 'High', 'Father', 'Mother', 'Brother', 'Brothers', 'Sister', 'Wife',
  'Man', 'Men', 'Woman', 'Women', 'Old', 'Young', 'Child', 'Children', 'One', 'Two', 'Three',
  'Ten', 'First', 'Second', 'Third', 'Other', 'Another', 'Some', 'From', 'With', 'Who', 'Whom',
  'Israel', 'Israelite', 'Judah', 'Jerusalem', 'Babylon', 'Egypt', 'Persia', 'Angel', 'Lord',
  'God', 'Holy', 'Mighty', 'Word', 'Voice', 'Governor', 'Prophet', 'Lawyer', 'Servant',
]);

// Proper-noun-looking tokens in a Glyssen character id. Parenthesised second names in an id
// ("Peter (Simon)", "Gideon (Jerubbaal)", "Satan (Devil)") are real aliases and count. The file's
// Alias COLUMN is not used: it holds casting glosses ("God (Holy One of Israel)", "one with dyed
// garments") whose ordinary words would block hundreds of innocent lines.
function nameTokens(id) {
  const out = new Set();
  for (const raw of String(id).split(/[^A-Za-z']+/)) {
    const t = raw.replace(/'s$/, '');
    if (t.length < 3) continue;
    if (!/^[A-Z][a-z]/.test(t)) continue;
    if (NAME_STOPWORDS.has(t)) continue;
    out.add(t);
  }
  return out;
}

// Extra words that name the speaker without being in the Glyssen id or alias. Kept tiny,
// printed in the report, trivially removable.
const EXTRA_NAME_BLOCK = {
  'God': ['God', 'Yahweh', 'LORD', 'Lord', 'Almighty'],
  'Jesus': ['Jesus', 'Christ', 'Messiah'],
  'Jesus (child)': ['Jesus', 'Christ', 'Messiah'],
  'Holy Spirit, the': ['Spirit', 'Holy'],
};

function namePatterns(id) {
  const own = nameTokens(id);
  const toks = [...own, ...(EXTRA_NAME_BLOCK[id] || [])];
  const uniq = [...new Set(toks)];
  return uniq.map((t) => ({
    token: t,
    extra: !own.has(t),
    re: new RegExp('(^|[^A-Za-z])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^A-Za-z])', 'i'),
  }));
}

/* ---------------------------------------------------------- display names */

// Deterministic cleaning rule: drop parentheticals, then everything from the first comma.
function cleanName(id) {
  let n = id.replace(/\s*\([^)]*\)/g, '').trim();
  const comma = n.indexOf(',');
  if (comma > 0) n = n.slice(0, comma).trim();
  return n.replace(/\s+/g, ' ');
}

// Reviewed overrides: every one of these is a case the rule above gets wrong, and every one is
// printed in the report. Nothing here invents a name; they are Glyssen ids, tidied.
const NAME_OVERRIDES = {
  // the rule leaves a bare disambiguating number, or drops the part that identifies the person
  'Abimelech 1, king of the Philistines (in Gerar)': 'Abimelech, king of the Philistines',
  'Abimelech 2, king of the Philistines (in Gerar)': 'Abimelech of Gerar',
  'Pharaoh (2nd)': "Pharaoh in Joseph's day",
  'Pharaoh (3rd)': 'Pharaoh of the exodus',
  'woman, Samaritan': 'The Samaritan woman',
  'cured man, blind from birth': 'The man born blind',
  'explorers, ten': 'The ten explorers',
  'Pharisees, some': 'Some of the Pharisees',
  'Levite husband of concubine': 'The Levite',
  'father of demon-possessed boy': 'The father of the possessed boy',
  'crowd preparing for Passover Feast': 'The Passover crowd',
  // two ids would otherwise print the same name, or read as no one in particular
  'angel': 'An angel',
  'angel (one of the seven)': 'One of the seven angels',
  'David (old)': 'David in old age',
  'Joshua (old)': 'Joshua in old age',
  'Isaac (old)': 'Isaac in old age',
  'Jacob (Israel) (old)': 'Jacob in old age',
  'Jesus (child)': 'Jesus as a boy',
  // titles a player can act on
  'Holy Spirit, the': 'The Holy Spirit',
  'Yahweh’s angel': 'The angel of the Lord',
  "Yahweh's angel": 'The angel of the Lord',
  'man in linen above river': 'The man clothed in linen',
  'Wisdom': 'Wisdom personified',
  'Rabshakeh': 'The Rabshakeh (Assyrian envoy)',
};

const GROUP_ARTICLE_SKIP = /^(the |a |an |\d)/i;

function displayNameFor(id, detail) {
  if (Object.prototype.hasOwnProperty.call(NAME_OVERRIDES, id)) {
    return { name: NAME_OVERRIDES[id], rule: 'override' };
  }
  let n = cleanName(id);
  const isGroup = detail && Number.isFinite(detail.maxSpeakers) && detail.maxSpeakers !== 1;
  if (isGroup && !GROUP_ARTICLE_SKIP.test(n) && !/'s\b|’s\b/.test(n)) {
    n = 'The ' + n;
    return { name: n, rule: 'group-article' };
  }
  if (!isGroup && /^[a-z]/.test(n)) {
    n = 'The ' + n;
    return { name: n, rule: 'lowercase-article' };
  }
  return { name: n, rule: 'clean' };
}

/* ------------------------------------------------------------------ extract */

function main() {
  const say = (...a) => console.log(a.join(' '));

  const versesByBook = loadVerses();

  // Assert every one of the 66 USFM codes resolves in both translations.
  const unresolved = [];
  for (const [code, name] of BOOKS) {
    for (const src of ['kjv', 'webbe']) {
      if (!versesByBook.has(src + '|' + name)) unresolved.push(src + ' ' + code + ' -> ' + name);
    }
  }
  if (unresolved.length) throw new Error('USFM codes did not resolve: ' + unresolved.join(', '));
  say('USFM map: all 66 codes resolve in kjv and webbe.');

  const { rows, skipped } = parseCharacterVerse(readFileSync(join(RAW, 'CharacterVerse.txt'), 'utf8'));
  const detail = parseCharacterDetail(readFileSync(join(RAW, 'CharacterDetail.txt'), 'utf8'));
  say('CharacterVerse rows:', rows.length, '(skipped non-data lines:', skipped + ')');
  say('CharacterDetail characters:', detail.size);

  // Group rows by verse.
  const byVerse = new Map();
  for (const r of rows) {
    const k = r.book + '|' + r.ch + '|' + r.vs;
    let list = byVerse.get(k);
    if (!list) byVerse.set(k, list = []);
    list.push(r);
  }
  say('verses named in CharacterVerse:', byVerse.size);

  // Resolve each verse to at most one speaker.
  const speakerOf = new Map();        // "BOOK|ch|vs" -> {id, positions:Set, aliases:Set}
  const drop = {
    'no eligible row': 0, 'pseudo or ambiguous id': 0, 'two eligible characters': 0,
    'alternate attribution': 0,
  };
  for (const [k, list] of byVerse) {
    const eligible = list.filter((r) => ELIGIBLE_TYPES.has(r.type));
    if (!eligible.length) { drop['no eligible row']++; continue; }
    if (eligible.some((r) => !isUsableCharacter(r.id))) { drop['pseudo or ambiguous id']++; continue; }
    const ids = new Set(eligible.map((r) => r.id));
    if (ids.size !== 1) { drop['two eligible characters']++; continue; }
    const id = [...ids][0];
    if (list.some((r) => AMBIGUOUS_TYPES.has(r.type) && r.id !== id)) {
      drop['alternate attribution']++; continue;
    }
    speakerOf.set(k, {
      id,
      positions: new Set(eligible.map((r) => r.position).filter(Boolean)),
    });
  }
  say('verses with exactly one eligible speaker:', speakerOf.size);
  for (const [why, n] of Object.entries(drop)) say('   dropped,', why + ':', n);

  // Name patterns, memoised per character.
  const patternCache = new Map();
  const patternsFor = (id) => {
    let p = patternCache.get(id);
    if (!p) patternCache.set(id, p = namePatterns(id));
    return p;
  };

  const candidates = [];
  const rej = {};
  const bump = (why) => { rej[why] = (rej[why] || 0) + 1; };
  let nameBlocked = 0;
  const nameBlockedBy = new Map();
  let extraBlocked = 0;

  for (const [code, name] of BOOKS) {
    const testament = testamentOf(code);
    for (const src of ['kjv', 'webbe']) {
      const chapters = versesByBook.get(src + '|' + name);
      for (const [ch, verses] of chapters) {
        const st = src === 'webbe' ? chapterStates(verses) : null;
        for (const vs of [...verses.keys()].sort((a, b) => a - b)) {
          const k = code + '|' + ch + '|' + vs;
          const sp = speakerOf.get(k);
          if (!sp) continue;
          const verse = verses.get(vs);
          const positions = sp.positions;
          let text = null;

          if (src === 'kjv') {
            // No quotation marks to read: trust the speaker file only when it says EntireVerse
            // and says nothing else.
            if (!positions.has('EntireVerse')) { bump('kjv: not EntireVerse'); continue; }
            const others = [...positions].filter((p) => p !== 'EntireVerse' && p !== 'Unspecified');
            if (others.length) { bump('kjv: conflicting positions'); continue; }
            text = verse.trim();
          } else {
            const regions = regionsIn(verse, st.before.get(vs));
            if (regions.length !== 1) {
              bump(regions.length === 0 ? 'webbe: no speech region' : 'webbe: several speech regions');
              continue;
            }
            const region = regions[0];
            const selfContained = region.openedHere && region.closedHere;
            if (selfContained) {
              const shown = positionFromMarks(verse, region);
              const stated = [...positions].filter((p) => p && p !== 'Unspecified');
              if (stated.length && !stated.includes(shown)) {
                bump('webbe: marks disagree with Quote Position'); continue;
              }
              text = verse.slice(region.start, region.end).trim();
            } else {
              // A multi-verse speech: this verse carries no closing (or no opening) mark of its
              // own. Only usable when the whole verse is inside the speech AND either the speaker
              // file marks the verse EntireVerse or every verse of the speech names this one
              // character.
              if (positionFromMarks(verse, region) !== 'EntireVerse') {
                bump('webbe: partial verse in a multi-verse speech'); continue;
              }
              let ok = positions.has('EntireVerse');
              if (!ok) ok = wholeSpeechIsOneCharacter(code, ch, vs, sp.id, st, speakerOf);
              if (!ok) { bump('webbe: multi-verse speech not confirmed'); continue; }
              text = verse.slice(region.start, region.end).trim();
            }
          }

          if (!verse.includes(text)) throw new Error('not a substring: ' + src + ' ' + k);

          const display = toDisplay(text);
          const why = eligibleDisplay(display);
          if (why) { bump(src + ': ' + why); continue; }

          let blocked = null, viaExtra = false;
          for (const p of patternsFor(sp.id)) {
            if (p.re.test(display)) { blocked = p.token; viaExtra = p.extra; break; }
          }
          if (blocked) {
            nameBlocked++;
            if (viaExtra) extraBlocked++;
            const key = sp.id + ' :: ' + blocked;
            nameBlockedBy.set(key, (nameBlockedBy.get(key) || 0) + 1);
            bump('speaker name in the line');
            continue;
          }

          candidates.push({
            cid: src + ':' + code + '.' + ch + '.' + vs,
            src, ref: name + ' ' + ch + ':' + vs, book: code, testament,
            text, display, speaker: sp.id, words: wordsOf(display),
          });
        }
      }
    }
  }

  say('');
  say('candidates:', candidates.length);
  say('rejections:');
  for (const [why, n] of Object.entries(rej).sort((a, b) => b[1] - a[1])) say('   ' + why + ':', n);
  say('lines dropped because they name their own speaker:', nameBlocked,
    '(' + extraBlocked + ' of them by the extra block table)');
  say('top name blocks:');
  for (const [k, n] of [...nameBlockedBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    say('   ' + k + ': ' + n);
  }

  // ---------------------------------------------------------------- speakers
  const byChar = new Map();
  for (const c of candidates) {
    let e = byChar.get(c.speaker);
    if (!e) byChar.set(c.speaker, e = { id: c.speaker, lines: 0, books: new Set(), t: new Set() });
    e.lines++; e.books.add(c.book); e.t.add(c.testament);
  }
  const answerable = [...byChar.values()].filter((e) => e.lines >= 6)
    .sort((a, b) => b.lines - a.lines);
  const answerableIds = new Set(answerable.map((e) => e.id));

  const nameRules = [];
  const speakers = answerable.map((e) => {
    const d = detail.get(e.id) || null;
    const { name, rule } = displayNameFor(e.id, d);
    nameRules.push({ id: e.id, name, rule, group: !!(d && d.maxSpeakers !== 1), lines: e.lines });
    return {
      id: e.id, name,
      testament: e.t.size === 2 ? 'both' : [...e.t][0],
      books: [...e.books].sort((a, b) => BOOK_ORDER.get(a) - BOOK_ORDER.get(b)),
      lines: e.lines,
      group: !!(d && d.maxSpeakers !== 1),
    };
  });

  const conflicts = buildConflicts(speakers, detail);

  mkdirSync(WORK, { recursive: true });
  writeFileSync(join(WORK, 'candidates.json'),
    JSON.stringify({ version: 1, built: new Date().toISOString().slice(0, 10), candidates }, null, 0));
  writeFileSync(join(ROOT, 'speakers.json'),
    JSON.stringify({
      version: 1, built: new Date().toISOString().slice(0, 10),
      source: 'Glyssen CharacterVerse.txt / CharacterDetail.txt, © SIL and Faith Comes By Hearing, MIT licence',
      minLines: 6, speakers, conflicts,
    }, null, 2));

  report(say, candidates, speakers, nameRules, conflicts, byChar);
}

// Every verse of the speech this verse belongs to names the same single character.
function wholeSpeechIsOneCharacter(code, ch, vs, id, st, speakerOf) {
  const nums = st.nums;
  const i = nums.indexOf(vs);
  if (i < 0) return false;
  let a = i;
  while (a >= 0 && st.before.get(nums[a])) a--;           // back to the verse that opened it
  if (a < 0) return false;                                 // speech began in an earlier chapter
  let b = i;
  while (b < nums.length && st.after.get(nums[b])) b++;    // forward to the verse that closed it
  if (b >= nums.length) return false;                      // speech runs past this chapter
  for (let j = a; j <= b; j++) {
    const s = speakerOf.get(code + '|' + ch + '|' + nums[j]);
    if (!s || s.id !== id) return false;
  }
  return true;
}

/* ---------------------------------------------------------------- conflicts */

// The divine family, by Glyssen id. Explicit, not pattern-matched, so the lead can check it.
const DIVINE = [
  'God', 'Jesus', 'Jesus (child)', 'Holy Spirit, the',
  'Yahweh’s angel', "Yahweh's angel",
  'voice (God?)', 'voice from heaven (God?)', 'voice from heaven (angel?)',
  'voice from heaven', 'angel of the LORD', 'commander of Yahweh’s army',
  "commander of Yahweh's army",
];

// A group and the people inside it. Ids on the right are only used if they are answerable.
const GROUP_MEMBERS = [
  ['disciples', ['Peter (Simon)', 'John, son of Zebedee', 'James, son of Zebedee', 'Thomas',
    'Philip the apostle', 'Andrew', 'Judas Iscariot', 'Nathanael', 'Matthew (Levi)',
    'James, son of Alphaeus', 'Philip']],
  ['apostles', ['Peter (Simon)', 'John, son of Zebedee', 'James, son of Zebedee', 'Thomas',
    'Philip the apostle', 'Andrew', 'Judas Iscariot', 'Paul', 'Matthias', 'Nathanael']],
  ['disciples (Jesus’)', ['Peter (Simon)', 'John, son of Zebedee', 'Thomas', 'Andrew', 'Philip the apostle']],
  ["Job's friends", ['Eliphaz the Temanite', 'Bildad the Shuhite', 'Zophar the Naamathite']],
  ['Job’s friends', ['Eliphaz the Temanite', 'Bildad the Shuhite', 'Zophar the Naamathite']],
  ['Pharisees', ['Nicodemus', 'Gamaliel', 'Saul (Paul)']],
  ['Pharisees, some', ['Nicodemus', 'Gamaliel', 'Saul (Paul)']],
  // Moses is deliberately NOT a member here: Glyssen's "Israelites" is always the people
  // answering Moses, never a group he speaks inside. Joshua and Caleb are among the people.
  ['Israelites', ['Aaron', 'Joshua', 'Caleb', 'explorers, ten']],
  ['explorers, ten', ['Joshua', 'Caleb']],
  ['Jews, the', []],
];

// Pairs that are not in the SPEC's list but would still make a wrong answer arguably right.
// Each carries its reason; each only removes a possible distractor, never a line.
const EXTRA_CONFLICTS = [
  ['Wisdom', 'God', 'Proverbs 8 personifies Wisdom; many readers hear God or Christ there.'],
  ['Wisdom', 'Jesus', 'Proverbs 8 personifies Wisdom; many readers hear God or Christ there.'],
  ['angel', 'Gabriel', 'an unnamed angel may be Gabriel.'],
  ['angel', 'angel (one of the seven)', 'both print as an unnamed angel.'],
  ['angel', 'angel who talked with Zechariah', 'both print as an unnamed angel.'],
  ['angel', 'angels in white, two', 'both print as unnamed angels.'],
  ['angel', 'Yahweh’s angel', 'the angel of the Lord is also an angel.'],
  ['angel', "Yahweh's angel", 'the angel of the Lord is also an angel.'],
  ['angel (one of the seven)', 'angel who talked with Zechariah', 'both print as an unnamed angel.'],
  ['angel (one of the seven)', 'angels in white, two', 'both print as unnamed angels.'],
  ['angel who talked with Zechariah', 'Gabriel', 'an unnamed interpreting angel may be Gabriel.'],
  ['angels in white, two', 'Gabriel', 'an unnamed angel may be Gabriel.'],
  ['Pharisees', 'Pharisees, some', 'the same group twice.'],
  ['Pharisees', 'Pharisees, other', 'the same group twice.'],
  ['Pharisees, some', 'Pharisees, other', 'the same group twice.'],
  ['Pharisees', 'Sadducees',
    'Glyssen records joint Pharisee-and-Sadducee speech (MAT 16:1), so the two stand together in scene.'],
  ['Pharisees, some', 'Sadducees',
    'Glyssen records joint Pharisee-and-Sadducee speech (MAT 16:1), so the two stand together in scene.'],
];

function baseIdentity(id) {
  // "Joshua (old)" and "Joshua" are one man at two ages; so are "Jesus (child)" and "Jesus".
  return id.replace(/\s*\((old|child|young|as a boy|the younger|the elder)\)\s*$/i, '').trim();
}

function buildConflicts(speakers, detail) {
  const ids = new Set(speakers.map((s) => s.id));
  const map = new Map();
  const add = (a, b) => {
    if (a === b || !ids.has(a) || !ids.has(b)) return;
    if (!map.has(a)) map.set(a, new Set());
    if (!map.has(b)) map.set(b, new Set());
    map.get(a).add(b); map.get(b).add(a);
  };

  const divine = DIVINE.filter((d) => ids.has(d));
  for (const a of divine) for (const b of divine) add(a, b);

  for (const [group, members] of GROUP_MEMBERS) for (const m of members) add(group, m);
  for (const [a, b] of EXTRA_CONFLICTS) add(a, b);

  // Same person, different ages, and identical display names.
  const byBase = new Map();
  for (const s of speakers) {
    const b = baseIdentity(s.id);
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(s.id);
  }
  for (const list of byBase.values()) for (const a of list) for (const b of list) add(a, b);
  const byName = new Map();
  for (const s of speakers) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name).push(s.id);
  }
  for (const list of byName.values()) for (const a of list) for (const b of list) add(a, b);

  const out = {};
  for (const [k, v] of [...map.entries()].sort()) out[k] = [...v].sort();
  return out;
}

/* ------------------------------------------------------------------ report */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function report(say, candidates, speakers, nameRules, conflicts, byChar) {
  say('');
  say('=== totals ===');
  const bySrc = {}, byT = {}, bySrcT = {};
  for (const c of candidates) {
    bySrc[c.src] = (bySrc[c.src] || 0) + 1;
    byT[c.testament] = (byT[c.testament] || 0) + 1;
    const k = c.src + ' ' + c.testament;
    bySrcT[k] = (bySrcT[k] || 0) + 1;
  }
  say('by src:', JSON.stringify(bySrc));
  say('by testament:', JSON.stringify(byT));
  say('by src and testament:', JSON.stringify(bySrcT));
  say('distinct characters with >=1 line:', byChar.size, '| answerable (>=6):', speakers.length);

  say('');
  say('=== eligible lines per speaker, top 40 ===');
  for (const s of speakers.slice(0, 40)) {
    say(String(s.lines).padStart(5) + '  ' + s.id + '   ->   ' + s.name +
      '   [' + s.testament + (s.group ? ', group' : '') + ']');
  }

  say('');
  say('=== display name table (every answerable speaker) ===');
  const byId = new Map(speakers.map((s) => [s.id, s]));
  for (const r of nameRules) {
    const s = byId.get(r.id);
    say('  ' + r.id + '\t->\t' + r.name + '\t(' + r.rule + (r.group ? ', group' : '') +
      ', ' + r.lines + ' lines, ' + s.books.slice(0, 6).join(' ') + (s.books.length > 6 ? '...' : '') + ')');
  }

  say('');
  say('=== divine family (every id placed in it, and whether it is answerable) ===');
  for (const d of DIVINE) say('  ' + d + (byId.has(d) ? '  [answerable, ' + byId.get(d).lines + ' lines]' : '  [not answerable]'));
  say('');
  say('=== group / member pairs declared ===');
  for (const [g, members] of GROUP_MEMBERS) {
    const live = members.filter((m) => byId.has(m));
    say('  ' + g + (byId.has(g) ? ' [answerable]' : ' [not answerable]') + '  ->  ' +
      (live.length ? live.join(' | ') : '(no answerable members)'));
  }
  say('');
  say('=== extra conflict pairs (my judgement, not in the SPEC list) ===');
  for (const [a, b, why] of EXTRA_CONFLICTS) {
    const live = byId.has(a) && byId.has(b);
    say('  ' + (live ? 'IN POOL ' : 'inactive') + '  ' + a + '  ><  ' + b + '   — ' + why);
  }

  say('');
  say('=== conflicts as written to speakers.json ===');
  for (const [k, v] of Object.entries(conflicts)) say('  ' + k + '  ><  ' + v.join(' | '));

  say('');
  say('=== ten random candidates for the speakers the lead asked to eyeball ===');
  const wanted = ['God', 'Jesus', 'Eliphaz the Temanite', 'Satan', 'Pilate', 'Pharisees'];
  const rnd = mulberry32(20260921);
  for (const id of wanted) {
    let use = candidates.filter((c) => c.speaker === id), label = id;
    if (!use.length) {
      const near = [...byChar.keys()].filter((k) => k.toLowerCase().includes(id.toLowerCase()))
        .sort((a, b) => byChar.get(b).lines - byChar.get(a).lines);
      if (near.length) {
        use = candidates.filter((c) => c.speaker === near[0]);
        label = near[0] + ' (nearest id to "' + id + '"; others: ' + (near.slice(1).join(' | ') || 'none') + ')';
      } else {
        label = id + ' (no such id, and nothing near it)';
      }
    }
    say('');
    say('--- ' + label + ' — ' + use.length + ' eligible lines ---');
    const picks = [];
    const seen = new Set();
    for (let i = 0; i < 400 && picks.length < 10 && use.length; i++) {
      const j = Math.floor(rnd() * use.length);
      if (seen.has(j)) continue;
      seen.add(j); picks.push(use[j]);
    }
    for (const p of picks) say('  [' + p.src + '] ' + p.ref + ' (' + p.words + 'w): ' + p.display);
  }
}

main();
