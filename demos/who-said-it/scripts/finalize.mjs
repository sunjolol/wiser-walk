#!/usr/bin/env node
// Who Said It? — turn the blind curation verdicts into pool.json.
//
// Implements SPEC "Sampling and blind curation" -> Finalize: drop q=0; drop e=1 when the
// blind guess was right; tier 3 when the guess was wrong, tier 2 otherwise; a missing or
// malformed verdict drops the line and is reported, never guessed.
//
// No text is written or altered here. Every line kept is the verbatim line extract.mjs
// pulled from the verse, and every speaker label is the one Glyssen names.
//
// Verdict file format, one line per item:
//     n q e<TAB>free-text guess at the speaker
// The SPEC's older four-number form "n q s e" is also accepted; s is recorded and unused.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url.
//   node demos/who-said-it/scripts/finalize.mjs --built 2026-09-21
//   node demos/who-said-it/scripts/finalize.mjs --built 2026-09-21 --verdicts <dir> --out <file>

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const WORK = join(ROOT, 'work');

/* ------------------------------------------------------------------ flags */

function flag(name, dflt) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

const BUILT = flag('built', null);
if (!BUILT || !/^\d{4}-\d{2}-\d{2}$/.test(BUILT)) {
  console.error('finalize.mjs: --built YYYY-MM-DD is required');
  process.exit(2);
}
const VERDICT_DIR = resolve(ROOT, flag('verdicts', WORK));
const OUT = resolve(ROOT, flag('out', join(ROOT, 'pool.json')));

/* ----------------------------------------------------------------- inputs */

const selected = JSON.parse(readFileSync(join(WORK, 'selected.json'), 'utf8'));
const speakerFile = JSON.parse(readFileSync(join(ROOT, 'speakers.json'), 'utf8'));
const speakerById = new Map(speakerFile.speakers.map((s) => [s.id, s]));
const byN = new Map(selected.map((r) => [r.n, r]));

/* ---------------------------------------------------------------- verdicts */

const files = readdirSync(VERDICT_DIR).filter((f) => /^verdict-.*\.txt$/.test(f)).sort();
if (!files.length) {
  console.error('finalize.mjs: no verdict-*.txt files in ' + VERDICT_DIR);
  process.exit(2);
}

const verdicts = new Map();
const malformed = [];
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const f of files) {
  const lines = readFileSync(join(VERDICT_DIR, f), 'utf8').replace(/\r/g, '').split('\n');
  lines.forEach((raw, i) => {
    if (!raw.trim() || raw.trim().startsWith('#')) return;
    const at = f + ':' + (i + 1);
    const tab = raw.indexOf('\t');
    const head = (tab > -1 ? raw.slice(0, tab) : raw).trim();
    const guess = tab > -1 ? raw.slice(tab + 1).trim() : '';
    const parts = head.split(/\s+/).filter(Boolean);
    const bad = (why) => malformed.push({ n: parts[0] || '(none)', file: at, why });

    if (tab < 0) return bad('no TAB before the guess');
    if (parts.length !== 3 && parts.length !== 4) {
      return bad('expected "n q e" before the TAB, got ' + parts.length + ' fields');
    }
    const n = parts[0];
    const q = parts[1];
    const s = parts.length === 4 ? parts[2] : null;
    const e = parts[parts.length - 1];
    if (!/^\d{4}$/.test(n) || !byN.has(n)) return bad('unknown or malformed n');
    if (verdicts.has(n)) return bad('duplicate verdict');
    if (!/^[01]$/.test(q)) return bad('q=' + q);
    if (s !== null && !/^[1-5]$/.test(s)) return bad('s=' + s);
    if (!/^[01]$/.test(e)) return bad('e=' + e);
    if (!guess) return bad('no guess after the TAB');
    verdicts.set(n, { q: +q, s: s === null ? null : +s, e: +e, guess });
  });
}

const missing = selected.filter((r) => !verdicts.has(r.n)).map((r) => r.n);

/* ------------------------------------------------------------- was it right */

// A blind guess counts as right when, case-insensitively, it equals or contains the
// speaker's display name or Glyssen id, or the display name contains it. Nothing is
// inferred beyond those string tests: a guess that names someone else is simply wrong.
function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function guessedRight(guess, speaker) {
  const g = norm(guess);
  if (!g) return false;
  for (const label of [speaker.name, speaker.id]) {
    const l = norm(label);
    if (!l) continue;
    if (g === l) return true;
    if (g.includes(l)) return true;
    if (l.includes(g)) return true;
  }
  return false;
}

/* ---------------------------------------------------------------- finalize */

const items = [];
const dropReasons = new Map();
const unknownSpeaker = [];

for (const rec of selected) {
  const v = verdicts.get(rec.n);
  if (!v) { bump(dropReasons, 'no verdict'); continue; }
  if (v.q === 0) { bump(dropReasons, 'q=0 (does not stand alone, or gives the speaker away)'); continue; }

  const speaker = speakerById.get(rec.speaker);
  if (!speaker) { unknownSpeaker.push(rec.n + ' ' + rec.speaker); bump(dropReasons, 'speaker is not answerable'); continue; }

  const right = guessedRight(v.guess, speaker);
  // e=1 and the guess was right: a regular reader names the speaker in two seconds, and
  // the owner asked for hard. e=1 with a wrong guess is the best line in the game: it
  // only LOOKS obvious, and it is already tier 3 by the rule below.
  const obvious = v.e === 1 && right;   // kept, as the easy tier: see the note above tierOf
  if ((rec.text.match(/\u201C/g) || []).length !== (rec.text.match(/\u201D/g) || []).length) {
    bump(dropReasons, 'unpaired quotation mark (a register tell)'); continue;
  }

  items.push({
    id: rec.cid,
    t: rec.text,
    sp: rec.speaker,
    ref: rec.ref,
    tr: rec.src,
    tier: obvious ? 1 : (right ? 2 : 3),
    book: rec.book,
  });
}

/* -------------------------------------------------- speakers and conflicts */

// The shipped tables carry only the speakers that still have lines: a name that can never
// be the answer must never appear as a distractor either.
const live = new Set(items.map((it) => it.sp));
const speakers = speakerFile.speakers
  .filter((s) => live.has(s.id))
  .map((s) => ({ id: s.id, name: s.name, testament: s.testament, books: s.books }));

const conflicts = {};
for (const [id, list] of Object.entries(speakerFile.conflicts || {})) {
  if (!live.has(id)) continue;
  const kept = list.filter((other) => live.has(other) && other !== id);
  if (kept.length) conflicts[id] = kept;
}

const pool = { version: 1, built: BUILT, speakers, conflicts, items };
writeFileSync(OUT, JSON.stringify(pool, null, 1));

/* ------------------------------------------------------------------ report */

const byTier = new Map(), bySrc = new Map(), byTest = new Map(), bySpeaker = new Map();
// Testament comes from the line's own record, not the speaker (a speaker can be "both").
const testByCid = new Map(selected.map((r) => [r.cid, r.testament]));
for (const it of items) {
  bump(byTier, it.tier);
  bump(bySrc, it.tr);
  bump(byTest, testByCid.get(it.id) || '?');
  bump(bySpeaker, it.sp);
}

const line = (m) => [...m].sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  .map(([k, v]) => k + '=' + v).join('  ');
const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

console.log('verdict files: ' + files.length + ' (' + files.join(', ') + ')');
console.log('verdicts read: ' + verdicts.size + ' of ' + selected.length);
console.log('pool: ' + items.length + ' items -> ' + OUT);
console.log('speakers kept: ' + speakers.length + ' of ' + speakerFile.speakers.length +
  '; conflict entries kept: ' + Object.keys(conflicts).length);

console.log('\nby tier      ' + line(byTier));
console.log('by source    ' + line(bySrc));
console.log('by testament ' + line(byTest));

console.log('\nlines per speaker (' + bySpeaker.size + ' speakers):');
console.log('  ' + pad('speaker (Glyssen id)', 38) + pad('display name', 30) + padl('lines', 6));
for (const [id, n] of [...bySpeaker].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  console.log('  ' + pad(id, 38) + pad(speakerById.get(id).name, 30) + padl(n, 6));
}
const thin = [...bySpeaker].filter(([, n]) => n < 3).length;
if (thin) console.log('  (' + thin + ' speakers keep fewer than 3 lines)');
if (speakers.length < 4) console.log('  WARNING: fewer than four speakers; the game needs four names.');

console.log('\ndropped: ' + (selected.length - items.length));
for (const [why, n] of [...dropReasons].sort((a, b) => b[1] - a[1])) console.log('  ' + why + ': ' + n);
if (unknownSpeaker.length) console.log('  speakers not in speakers.json: ' + unknownSpeaker.join(', '));

console.log('\nmalformed verdict lines: ' + malformed.length);
for (const m of malformed.slice(0, 50)) console.log('  n=' + m.n + ' ' + m.file + ' ' + m.why);
if (malformed.length > 50) console.log('  ... (+' + (malformed.length - 50) + ' more)');

console.log('\nno verdict at all: ' + missing.length);
if (missing.length) {
  console.log('  ' + missing.slice(0, 50).join(' ') + (missing.length > 50 ? ' ... (+' + (missing.length - 50) + ' more)' : ''));
}
