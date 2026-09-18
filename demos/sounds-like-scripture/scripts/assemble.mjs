// assemble.mjs — filter the candidate pools, sample 1,800 lines for blind curation,
// and write the blind batch files.
//
// Implements SPEC "Tells to remove" and "Sampling for curation" exactly. Scripts only
// select among extracted lines; nothing here writes, paraphrases or tidies any text.
//
// Node 24, ESM, zero npm dependencies. Paths resolve from import.meta.url
// (the repo path contains a space).
//   node scripts/assemble.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WORK = path.join(ROOT, 'work');

const SEED = 20260918;

/* ------------------------------------------------------------------ */
/* seeded PRNG (mulberry32)                                            */
/* ------------------------------------------------------------------ */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(SEED);

/* ------------------------------------------------------------------ */
/* display text (SPEC "Tells to remove": small capitals)               */
/* ------------------------------------------------------------------ */

// The pool keeps the verbatim text; batches and the game show LORD as Lord and GOD as God
// so small capitals cannot leak the answer. Possessives keep their shape (LORD'S -> Lord's).
function display(t) {
  t = t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  return t.replace(/\b(LORD|GOD)((?:['’])?S)?\b/g, (m, w, s) =>
    w[0] + w.slice(1).toLowerCase() + (s ? s.toLowerCase() : ''));
}

/* ------------------------------------------------------------------ */
/* five-word shingles                                                  */
/* ------------------------------------------------------------------ */

function words(t) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(t) {
  const w = words(t);
  const out = [];
  for (let i = 0; i + 5 <= w.length; i++) out.push(w.slice(i, i + 5).join(' '));
  return out;
}

/* ------------------------------------------------------------------ */
/* blocklist (SPEC "Giveaway words in prose")                          */
/* ------------------------------------------------------------------ */

const BLOCK_WORD = /\b(scriptures?|testament|bible|apostles?|bishops?|presbyters?|deacons?|christians?|heretics?|heresy|philosoph\w*|manich\w*|catholic|trinity|sacraments?|monks?|reader|hopeful|faithful|pilgrims?|chapter|treatise|romans?|greeks?)\b/i;
const BLOCK_NAME = /\b(Paul|Peter|Plato|Socrates|Cicero|Virgil|Rome|Carthage|Christian)\b/;
const BLOCK_ABBR = /\bMr\.|\bMrs\.|\bMessrs\./;
const BLOCK_ASIDE = /\bas (?:we|I) (?:have said|said (?:above|before)|have (?:already )?(?:said|shown|remarked|observed))\b/i;

// Tells that only one side carries (added after eyeballing the first batches):
// modern contractions occur only in WEBBE, and a dangling quotation mark only in verses
// cut from the middle of a speech. Drop such lines on every side. Drop-only, never an edit.
const CONTRACTION = /\w[\u2019'](?:t|ll|re|ve|d|m)\b/i;
function tell(t) {
  if (CONTRACTION.test(t)) return true;
  const open = (t.match(/[“]/g) || []).length, close = (t.match(/[”]/g) || []).length;
  if (open !== close) return true;
  if (((t.match(/"/g) || []).length % 2) === 1) return true;
  const so = (t.match(/(^|[\s(“"])[‘]/g) || []).length;
  const sc = (t.match(/[’](?=$|[\s.,;:!?)”"])/g) || []).length;
  if (so !== sc && so > 0) return true;
  return false;
}

function blocked(t) {
  return BLOCK_WORD.test(t) || BLOCK_NAME.test(t) || BLOCK_ABBR.test(t) || BLOCK_ASIDE.test(t);
}

/* ------------------------------------------------------------------ */
/* weighting (SPEC "Sampling for curation")                            */
/* ------------------------------------------------------------------ */

const W3 = new Set([
  'JOB', 'PSA', 'PRO', 'ECC', 'ISA', 'JER', 'LAM', 'EZE',
  'HOS', 'JOE', 'AMO', 'OBA', 'JON', 'MIC', 'NAH', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHI', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT',
  'PHM', 'HEB', 'JAM', '1PE', '2PE', '1JO', '2JO', '3JO', 'JUD',
  'REV',
]);
const W2 = new Set(['DEU', 'MAT', 'MAR', 'LUK', 'JOH', 'ACT']);

const DEVOTIONAL = new Set([
  'god', 'lord', 'soul', 'heart', 'righteous', 'wicked', 'mercy', 'wisdom', 'sin', 'heaven',
  'spirit', 'truth', 'holy', 'glory', 'peace', 'judgment', 'love', 'fear', 'evil', 'light',
  'darkness', 'faith', 'grace', 'life', 'death',
]);

function bookCode(cid) {
  const rest = cid.slice(cid.indexOf(':') + 1);
  return rest.split('.')[0];
}

function scriptureWeight(cid) {
  const code = bookCode(cid);
  if (W3.has(code)) return 3;
  if (W2.has(code)) return 2;
  return 1;
}

function devotionalWeight(text) {
  const seen = new Set();
  for (const w of words(text)) {
    if (DEVOTIONAL.has(w)) seen.add(w);
    else if (w.endsWith('s') && DEVOTIONAL.has(w.slice(0, -1))) seen.add(w.slice(0, -1));
  }
  return seen.size >= 2 ? 3 : 1;
}

/* ------------------------------------------------------------------ */
/* weighted sampling without replacement                               */
/* ------------------------------------------------------------------ */

// Exponential race: key = -ln(u)/w, smallest keys first. Deterministic under the seeded PRNG
// and gives each item a probability proportional to its weight.
function weightedOrder(items) {
  const keyed = items.map((it) => ({ it, key: -Math.log(rnd() || Number.MIN_VALUE) / it.weight }));
  keyed.sort((a, b) => a.key - b.key);
  return keyed.map((k) => k.it);
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

const candBible = JSON.parse(fs.readFileSync(path.join(WORK, 'cand-bible.json'), 'utf8'));
const candProse = JSON.parse(fs.readFileSync(path.join(WORK, 'cand-prose.json'), 'utf8'));
const versesAll = JSON.parse(fs.readFileSync(path.join(WORK, 'verses-all.json'), 'utf8'));

// One store: shingle -> true when it occurs in a 66-book (bible) verse, false otherwise.
// `other` candidates are dropped on any hit; `deutero` candidates only on a bible hit.
const shingleMap = new Map();
for (const v of versesAll) {
  const isBible = v.src === 'kjv' || v.src === 'webbe';
  for (const s of shingles(v.text)) {
    if (isBible) shingleMap.set(s, true);
    else if (!shingleMap.has(s)) shingleMap.set(s, false);
  }
}

function hitsAny(text) {
  for (const s of shingles(text)) if (shingleMap.has(s)) return true;
  return false;
}
function hitsBible(text) {
  for (const s of shingles(text)) if (shingleMap.get(s) === true) return true;
  return false;
}

// ---- filter ---------------------------------------------------------------

const stats = new Map();   // src -> { in, shingle, block, selected }
function stat(src) {
  if (!stats.has(src)) stats.set(src, { in: 0, shingle: 0, block: 0, selected: 0 });
  return stats.get(src);
}

const kept = { bible: [], deutero: [], other: [] };

for (const c of candBible) {
  const st = stat(c.src);
  st.in++;
  if (tell(c.text)) { st.block++; continue; }
  if (c.kind === 'deutero') {
    if (hitsBible(c.text)) { st.shingle++; continue; }
    kept.deutero.push({ ...c, weight: devotionalWeight(c.text) });
  } else {
    kept.bible.push({ ...c, weight: scriptureWeight(c.cid) });
  }
}

for (const c of candProse) {
  const st = stat(c.src);
  st.in++;
  if (hitsAny(c.text)) { st.shingle++; continue; }
  if (blocked(c.text) || tell(c.text)) { st.block++; continue; }
  kept.other.push({ ...c, weight: devotionalWeight(c.text) });
}

// ---- quotas ---------------------------------------------------------------

const QUOTAS = {
  bible: { kjv: 380, webbe: 380 },
  deutero: { kjva: 140, 'webbe-dc': 140 },
  other: {
    apf: 110, enoch: 90, conf: 90, imit: 90, jos: 80, civ: 60,
    pilg: 60, julian: 50, clemalex: 50, pascal: 40, boeth: 40,
  },
};

const shortfalls = [];

// Sample one group. `sharedRef` enforces "no verse reference used in both" inside a group.
function sampleGroup(group, quotas, sharedRef) {
  const bySrc = new Map();
  for (const src of Object.keys(quotas)) bySrc.set(src, weightedOrder(kept[group].filter((c) => c.src === src)));
  const cursor = new Map(Object.keys(quotas).map((s) => [s, 0]));
  const taken = new Map(Object.keys(quotas).map((s) => [s, []]));
  const usedRefs = new Set();

  // Take up to `want` more from one source, honouring the shared-reference rule.
  function take(src, want) {
    const order = bySrc.get(src);
    const out = taken.get(src);
    let i = cursor.get(src);
    let n = 0;
    while (n < want && i < order.length) {
      const c = order[i++];
      if (sharedRef) {
        if (usedRefs.has(c.ref)) continue;
        usedRefs.add(c.ref);
      }
      out.push(c);
      n++;
    }
    cursor.set(src, i);
    return n;
  }

  const srcs = Object.keys(quotas);
  const want = new Map(srcs.map((s) => [s, quotas[s]]));

  for (let round = 0; round < 8; round++) {
    let short = 0;
    const shortBySrc = new Map();
    for (const src of srcs) {
      const got = take(src, want.get(src));
      const miss = want.get(src) - got;
      if (miss > 0) { short += miss; shortBySrc.set(src, miss); if (round === 0) shortfalls.push(`${src}: ${miss} short of ${quotas[src]}`); }
      want.set(src, 0);
    }
    if (!short) break;
    // redistribute the shortfall to sources in the same group that still have candidates
    const open = srcs.filter((s) => cursor.get(s) < bySrc.get(s).length);
    if (!open.length) { shortfalls.push(`${group}: ${short} could not be redistributed`); break; }
    for (let k = 0; k < short; k++) {
      const s = open[k % open.length];
      want.set(s, want.get(s) + 1);
    }
  }

  const all = [];
  for (const src of srcs) { stat(src).selected += taken.get(src).length; all.push(...taken.get(src)); }
  return all;
}

const selected = [
  ...sampleGroup('bible', QUOTAS.bible, true),
  ...sampleGroup('deutero', QUOTAS.deutero, true),
  ...sampleGroup('other', QUOTAS.other, false),
];

// ---- shuffle and number ---------------------------------------------------

for (let i = selected.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1));
  [selected[i], selected[j]] = [selected[j], selected[i]];
}

const records = selected.map((c, i) => {
  const { weight, ...rest } = c;
  return { n: String(i + 1).padStart(4, '0'), ...rest, display: display(c.text) };
});

fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, 'selected.json'), JSON.stringify(records, null, 1));
fs.writeFileSync(
  path.join(WORK, 'key.json'),
  JSON.stringify(Object.fromEntries(records.map((r) => [r.n, r.cid])), null, 1),
);

const PER_BATCH = 300;
const batches = Math.ceil(records.length / PER_BATCH);
for (let b = 0; b < batches; b++) {
  const slice = records.slice(b * PER_BATCH, (b + 1) * PER_BATCH);
  const lines = slice.map((r) => `${r.n}\t${r.display}`);
  fs.writeFileSync(path.join(WORK, `batch-${String(b + 1).padStart(2, '0')}.txt`), lines.join('\n') + '\n');
}

// ---- report ---------------------------------------------------------------

const ORDER = ['kjv', 'webbe', 'kjva', 'webbe-dc', 'apf', 'enoch', 'conf', 'imit', 'jos', 'civ', 'pilg', 'julian', 'clemalex', 'pascal', 'boeth'];
const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

console.log(`${pad('source', 10)}${padl('in', 8)}${padl('shingle', 9)}${padl('blocklist', 11)}${padl('selected', 10)}`);
let tot = { in: 0, shingle: 0, block: 0, selected: 0 };
for (const src of ORDER) {
  const s = stats.get(src);
  if (!s) continue;
  console.log(`${pad(src, 10)}${padl(s.in, 8)}${padl(s.shingle, 9)}${padl(s.block, 11)}${padl(s.selected, 10)}`);
  for (const k of Object.keys(tot)) tot[k] += s[k];
}
console.log(`${pad('TOTAL', 10)}${padl(tot.in, 8)}${padl(tot.shingle, 9)}${padl(tot.block, 11)}${padl(tot.selected, 10)}`);
console.log(`\nselected ${records.length}; batches ${batches} x ${PER_BATCH}`);
if (shortfalls.length) console.log('shortfalls:\n  ' + shortfalls.join('\n  '));
else console.log('shortfalls: none');
