#!/usr/bin/env node
// Who Said It? — sampling and blind curation batches.
//
// Implements SPEC "Sampling and blind curation" exactly: seeded (mulberry32, 20260921),
// 1,500 candidates, half KJV and half WEBBE with no verse used twice, no speaker above
// 90 lines, every answerable speaker represented where it has lines, and five blind
// batches of 300 lines in the form "n<TAB>display text".
//
// Nothing here writes, trims or tidies any line: it only chooses among the lines that
// extract.mjs already proved verbatim, and the batch files carry no speaker and no
// reference, so the curators are blind.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url
// (the repo path contains a space).
//   node demos/who-said-it/scripts/assemble.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const WORK = join(ROOT, 'work');

const SEED = 20260921;
const TOTAL = 1500;
const PER_SRC = TOTAL / 2;        // 750 KJV, 750 WEBBE
const SPEAKER_CAP = 90;
const PER_BATCH = 300;
const SOURCES = ['kjv', 'webbe'];

/* ------------------------------------------------------------------ PRNG */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(SEED);

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
  }
  return list;
}

/* ------------------------------------------------------------------ input */

const cands = JSON.parse(readFileSync(join(WORK, 'candidates.json'), 'utf8')).candidates;
const speakerFile = JSON.parse(readFileSync(join(ROOT, 'speakers.json'), 'utf8'));
const answerable = new Map(speakerFile.speakers.map((s) => [s.id, s]));

// Only answerable speakers can ever be the right answer on a card, so only their lines
// are worth a curator's time.
const pool = cands.filter((c) => answerable.has(c.speaker));

const bySrc = new Map(SOURCES.map((s) => [s, shuffle(pool.filter((c) => c.src === s))]));
const cursor = new Map(SOURCES.map((s) => [s, 0]));

/* --------------------------------------------------------------- selection */

const takenRefs = new Set();                    // SPEC: no verse used twice
const perSpeaker = new Map();                   // id -> count (cap 90)
const perSrc = new Map(SOURCES.map((s) => [s, 0]));
const selected = [];
const chosenCids = new Set();

function speakerCount(id) { return perSpeaker.get(id) || 0; }

function accept(c) {
  if (chosenCids.has(c.cid)) return false;
  if (takenRefs.has(c.ref)) return false;
  if (speakerCount(c.speaker) >= SPEAKER_CAP) return false;
  if (perSrc.get(c.src) >= PER_SRC) return false;
  takenRefs.add(c.ref);
  chosenCids.add(c.cid);
  perSpeaker.set(c.speaker, speakerCount(c.speaker) + 1);
  perSrc.set(c.src, perSrc.get(c.src) + 1);
  selected.push(c);
  return true;
}

// Pass 1 — representation. Every answerable speaker that has any line gets one, rarest
// first so that a speaker with six lines is never crowded out by God or Jesus. Each
// speaker's own lines are shuffled, and the source with the most room left is tried
// first so the halves stay even.
const linesBySpeaker = new Map();
for (const c of pool) {
  if (!linesBySpeaker.has(c.speaker)) linesBySpeaker.set(c.speaker, []);
  linesBySpeaker.get(c.speaker).push(c);
}
const rarestFirst = [...linesBySpeaker.entries()].sort((a, b) => a[1].length - b[1].length);
const unrepresented = [];
for (const [id, lines] of rarestFirst) {
  const order = shuffle(lines.slice()).sort((a, b) => perSrc.get(a.src) - perSrc.get(b.src));
  let got = false;
  for (const c of order) if (accept(c)) { got = true; break; }
  if (!got) unrepresented.push(id);
}

// Pass 2 — fill each half to its quota from that source's shuffled queue. The two queues
// are drawn from in turn: a speaker at the 90-line cap then spends that cap across both
// translations instead of exhausting it in whichever half was filled first.
function step(src, target) {
  const queue = bySrc.get(src);
  let i = cursor.get(src);
  let took = false;
  while (i < queue.length) {
    if (perSrc.get(src) >= target) break;
    if (accept(queue[i++])) { took = true; break; }
  }
  cursor.set(src, i);
  return took;
}

function fill(target) {
  let moved = true;
  while (moved) {
    moved = false;
    for (const src of SOURCES) if (perSrc.get(src) < target) moved = step(src, target) || moved;
  }
}

fill(PER_SRC);

// Shortfall in one half is offered to the other, and reported either way.
const shortfalls = [];
for (const src of SOURCES) {
  const miss = PER_SRC - perSrc.get(src);
  if (miss > 0) shortfalls.push(`${src}: ${miss} short of ${PER_SRC}`);
}
if (selected.length < TOTAL) {
  fill(PER_SRC + (TOTAL - selected.length));
  if (selected.length < TOTAL) {
    shortfalls.push(`total: ${TOTAL - selected.length} short of ${TOTAL} after redistribution`);
  }
}

/* ------------------------------------------------- number, write, batch out */

shuffle(selected);

const records = selected.map((c, i) => ({ n: String(i + 1).padStart(4, '0'), ...c }));

mkdirSync(WORK, { recursive: true });
writeFileSync(join(WORK, 'selected.json'), JSON.stringify(records, null, 1));
writeFileSync(
  join(WORK, 'key.json'),
  JSON.stringify(Object.fromEntries(records.map((r) => [r.n, r.cid])), null, 1),
);

const batches = Math.ceil(records.length / PER_BATCH);
for (let b = 0; b < batches; b++) {
  const slice = records.slice(b * PER_BATCH, (b + 1) * PER_BATCH);
  // "n<TAB>display text", nothing else: no speaker, no reference, no translation.
  const lines = slice.map((r) => `${r.n}\t${r.display}`);
  writeFileSync(join(WORK, `batch-${String(b + 1).padStart(2, '0')}.txt`), lines.join('\n') + '\n');
}

/* ------------------------------------------------------------------ report */

const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

console.log(`candidates read: ${cands.length}; with an answerable speaker: ${pool.length}`);
console.log(`answerable speakers: ${answerable.size}; with at least one line here: ${linesBySpeaker.size}`);
console.log(`selected: ${records.length}; batches ${batches} x ${PER_BATCH}`);
console.log(`distinct verses: ${takenRefs.size} (no verse used twice: ${takenRefs.size === records.length})`);
console.log(`speaker cap ${SPEAKER_CAP}; speakers at the cap: ${[...perSpeaker.values()].filter((n) => n === SPEAKER_CAP).length}`);

console.log('\nby source:');
for (const s of SOURCES) console.log(`  ${pad(s, 8)}${padl(perSrc.get(s), 6)}`);

const byTest = new Map();
for (const r of records) byTest.set(r.testament, (byTest.get(r.testament) || 0) + 1);
console.log('by testament:');
for (const [t, n] of [...byTest].sort()) console.log(`  ${pad(t, 8)}${padl(n, 6)}`);

console.log('\nselected lines per speaker (top 40 of ' + perSpeaker.size + '):');
console.log(`  ${pad('speaker (Glyssen id)', 38)}${pad('display name', 30)}${padl('sel', 5)}${padl('kjv', 5)}${padl('web', 5)}${padl('avail', 7)}`);
const kjvBySpeaker = new Map(), webBySpeaker = new Map();
for (const r of records) {
  const m = r.src === 'kjv' ? kjvBySpeaker : webBySpeaker;
  m.set(r.speaker, (m.get(r.speaker) || 0) + 1);
}
const table = [...perSpeaker.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
for (const [id, n] of table.slice(0, 40)) {
  console.log(`  ${pad(id, 38)}${pad(answerable.get(id).name, 30)}${padl(n, 5)}` +
    `${padl(kjvBySpeaker.get(id) || 0, 5)}${padl(webBySpeaker.get(id) || 0, 5)}` +
    `${padl(linesBySpeaker.get(id).length, 7)}`);
}
if (table.length > 40) console.log(`  ... and ${table.length - 40} more speakers`);

console.log(`\nspeakers with no line selected: ${unrepresented.length}`);
if (unrepresented.length) console.log('  ' + unrepresented.join(', '));
console.log(`shortfalls: ${shortfalls.length ? '\n  ' + shortfalls.join('\n  ') : 'none'}`);
