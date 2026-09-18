// finalize.mjs — turn the blind curation verdicts into pool.json.
//
// Implements SPEC "Curation verdicts" and "Finalize rules" exactly. It only keeps, drops and
// tiers lines that already exist in work/selected.json; no text is written or altered here.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url.
//   node scripts/finalize.mjs --built 2026-09-18
//   node scripts/finalize.mjs --built 2026-09-18 --verdicts <dir> --out <file>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WORK = path.join(ROOT, 'work');

/* ---- flags --------------------------------------------------------------- */

function flag(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

const BUILT = flag('built', null);
if (!BUILT || !/^\d{4}-\d{2}-\d{2}$/.test(BUILT)) {
  console.error('finalize.mjs: --built YYYY-MM-DD is required');
  process.exit(2);
}
const VERDICT_DIR = path.resolve(ROOT, flag('verdicts', WORK));
const OUT = path.resolve(ROOT, flag('out', path.join(ROOT, 'pool.json')));

/* ---- inputs -------------------------------------------------------------- */

const selected = JSON.parse(fs.readFileSync(path.join(WORK, 'selected.json'), 'utf8'));
const srcBible = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources-bible.json'), 'utf8'));
const srcProse = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources-prose.json'), 'utf8'));

const SOURCE_FIELDS = ['id', 'title', 'author', 'date', 'translator', 'edition', 'url', 'url2', 'note', 'kind', 'register'];

const registry = [...srcBible, ...srcProse];
const sources = registry.map((s) => {
  const o = {};
  for (const f of SOURCE_FIELDS) if (s[f] !== undefined) o[f] = s[f] === undefined ? null : s[f];
  return o;
});
const sourceIndex = new Map(sources.map((s, i) => [s.id, i]));
const worksBySource = new Map(registry.filter((s) => s.works).map((s) => [s.id, new Map(s.works.map((w) => [w.work, w]))]));

const byN = new Map(selected.map((r) => [r.n, r]));

/* ---- verdicts (SPEC "Curation verdicts") --------------------------------- */

const files = fs.readdirSync(VERDICT_DIR).filter((f) => /^verdict-.*\.txt$/.test(f)).sort();
if (!files.length) {
  console.error(`finalize.mjs: no verdict-*.txt files in ${VERDICT_DIR}`);
  process.exit(2);
}

const verdicts = new Map();
const malformed = [];    // { n, file, line, why }

for (const f of files) {
  const lines = fs.readFileSync(path.join(VERDICT_DIR, f), 'utf8').replace(/\r/g, '').split('\n');
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const parts = line.split(/\s+/);
    const at = `${f}:${i + 1}`;
    const bad = (why) => malformed.push({ n: parts[0] || '(none)', file: at, why });
    if (parts.length !== 6) return bad(`expected 6 fields, got ${parts.length}`);
    const [n, q, s, g, r, e] = parts;
    if (!/^\d{4}$/.test(n) || !byN.has(n)) return bad('unknown or malformed n');
    if (verdicts.has(n)) return bad('duplicate verdict');
    if (!/^[01]$/.test(q)) return bad(`q=${q}`);
    if (!/^[1-5]$/.test(s)) return bad(`s=${s}`);
    if (!/^[BN]$/.test(g)) return bad(`g=${g}`);
    if (!/^[012]$/.test(r)) return bad(`r=${r}`);
    if (!/^[01]$/.test(e)) return bad(`e=${e}`);
    verdicts.set(n, { q: +q, s: +s, g, r: +r, e: +e });
  });
}

const missing = selected.filter((rec) => !verdicts.has(rec.n)).map((rec) => rec.n);

/* ---- finalize rules (SPEC "Finalize rules") ------------------------------ */

function tierOf(kind, v) {
  if (kind === 'bible') return v.r === 0 ? 3 : 2;
  return v.s >= 4 ? 3 : 2;
}

const KIND_CODE = { bible: 'b', deutero: 'd', other: 'o' };
const items = [];
const dropReasons = new Map();
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const rec of selected) {
  const v = verdicts.get(rec.n);
  if (!v) { bump(dropReasons, 'no verdict'); continue; }
  if (v.q === 0) { bump(dropReasons, 'q=0'); continue; }
  if (v.s === 1) { bump(dropReasons, 's=1'); continue; }
  if (rec.kind !== 'bible' && v.s === 2) { bump(dropReasons, 'not Bible and s=2 (too easy)'); continue; }
  if (rec.kind !== 'bible' && v.r >= 1) { bump(dropReasons, 'other/deutero r>=1'); continue; }
  if (rec.kind === 'bible' && v.r === 2) { bump(dropReasons, 'bible r=2'); continue; }
  // e=1: the blind curator thought the answer obvious. If the blind guess was also right, the
  // line is easy and the owner asked for hard: drop it. If the guess was wrong, the line only
  // LOOKS obvious, which is the best kind: keep it (it is already tier 3 by the guess rule).
  if (v.e === 1 && ((rec.kind === 'bible') === (v.g === 'B'))) { bump(dropReasons, 'obvious (e=1, guessed right)'); continue; }

  const si = sourceIndex.get(rec.src);
  if (si === undefined) throw new Error(`no registry entry for source ${rec.src} (n=${rec.n})`);

  const item = { id: rec.cid, t: rec.text, s: si, ref: rec.ref, k: KIND_CODE[rec.kind], tier: tierOf(rec.kind, v) };
  if (rec.kind === 'deutero') {
    if (!rec.canons || !rec.canons.length) throw new Error(`deutero item without canons: ${rec.cid}`);
    item.c = rec.canons;
  }
  if (rec.work) {
    const w = worksBySource.get(rec.src)?.get(rec.work);
    if (!w) throw new Error(`source ${rec.src} has no registry entry for work "${rec.work}" (${rec.cid})`);
    item.w = { work: w.work, author: w.author, date: w.date };
  }
  items.push(item);
}

const pool = { version: 1, built: BUILT, sources, items };
fs.writeFileSync(OUT, JSON.stringify(pool, null, 1));

/* ---- report -------------------------------------------------------------- */

const byKind = new Map(), byTier = new Map(), byReg = new Map(), bySrc = new Map();
for (const it of items) {
  bump(byKind, it.k);
  bump(byTier, it.tier);
  bump(byReg, sources[it.s].register);
  bump(bySrc, sources[it.s].id);
}
const line = (m) => [...m].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(([k, v]) => `${k}=${v}`).join('  ');

console.log(`verdict files: ${files.length} (${files.join(', ')})`);
console.log(`verdicts read: ${verdicts.size} of ${selected.length}`);
console.log(`pool: ${items.length} items -> ${OUT}`);
console.log(`\nby kind    ${line(byKind)}`);
console.log(`by tier    ${line(byTier)}`);
console.log(`by register${'  '}${line(byReg)}`);
console.log(`by source  ${line(bySrc)}`);

const n = items.length || 1;
const inBible = {
  protestant: items.filter((i) => i.k === 'b').length,
  catholic: items.filter((i) => i.k === 'b' || (i.k === 'd' && i.c.includes('catholic'))).length,
  orthodox: items.filter((i) => i.k === 'b' || (i.k === 'd' && i.c.includes('orthodox'))).length,
};
console.log('\nBible share of the pool:');
for (const [canon, c] of Object.entries(inBible)) {
  console.log(`  ${canon.padEnd(11)}${c} of ${items.length} (${(100 * c / n).toFixed(1)}%)`);
}

console.log(`\ndropped: ${selected.length - items.length}`);
for (const [why, c] of [...dropReasons].sort((a, b) => b[1] - a[1])) console.log(`  ${why}: ${c}`);

console.log(`\nmalformed verdict lines: ${malformed.length}`);
for (const m of malformed) console.log(`  n=${m.n} ${m.file} ${m.why}`);

console.log(`\nno verdict at all: ${missing.length}`);
if (missing.length) console.log('  ' + missing.slice(0, 50).join(' ') + (missing.length > 50 ? ` ... (+${missing.length - 50} more)` : ''));
