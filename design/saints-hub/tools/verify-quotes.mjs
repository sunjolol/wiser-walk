/**
 * Every quotation on a saint's page, checked word for word against the text it comes from.
 *
 *   node design/saints-hub/tools/verify-quotes.mjs <slug> [page.json]
 *
 * Reads the page (default: design/saints-hub/pages/<slug>.json, then site/src/data/saints/<slug>.json)
 * and its evidence file, design/saints-hub/research/people/<slug>.quotes.json:
 *
 *   [ { "display": "the words as the page prints them",
 *       "exact":   "the words exactly as the translation prints them (footnote numbers removed)",
 *       "file":    "people/<slug>/life.txt",   // under design/saints-hub/sources/ (gitignored)
 *       "url":     "https://…",                 // where the text was fetched from
 *       "kind":    "bible" }                     // optional: a Bible verse, checked by reference only
 *
 *   An English line that is OUR translation (the page says so beside it) has no English text to be
 *   found in: { "display": "Love itself is knowledge.", "kind": "own", "original": "Amor ipse notitia
 *   est.", "file": …, "url": … }. The original words are checked in the fetched text instead.
 *   ]
 *
 * Three checks, all case-insensitive (the capitals rule for God changes case, nothing else):
 *   1. every quotation the page prints (q, quote, pledge, feature, last words, and every “…” run
 *      inside a text field) has an evidence entry whose `display` matches it;
 *   2. that entry's `exact` and its `display` are the same words, apart from case and a leading or
 *      trailing ellipsis;
 *   3. `exact` is found in the fetched text `file` (whitespace, quotation marks and dashes
 *      normalised; nothing else).
 *
 * Not a build script: the fetched texts are gitignored (some translations are copyrighted and
 * must never be committed), so this runs on the machine that fetched them, before a page is
 * promoted into site/src/data/saints/. Exit code 1 on any failure.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const HUB = resolve(here, '..');
const REPO = resolve(HUB, '..', '..');
const slug = process.argv[2];
if (!slug) { console.error('usage: verify-quotes.mjs <slug> [page.json]'); process.exit(2); }

const pageArg = process.argv.slice(3).find(a => !a.startsWith('--'));
const pagePath = pageArg
  ? resolve(pageArg)
  : [join(HUB, 'pages', slug + '.json'), join(REPO, 'site/src/data/saints', slug + '.json')].find(existsSync);
if (!pagePath) { console.error('no page for ' + slug); process.exit(2); }
const page = JSON.parse(readFileSync(pagePath, 'utf8'));
const evPath = join(HUB, 'research', 'people', slug + '.quotes.json');
const DISCOVER = process.argv.includes('--discover');
if (!existsSync(evPath) && !DISCOVER) { console.error('no evidence file ' + evPath + ' (run with --discover to start one)'); process.exit(2); }
const evidence = existsSync(evPath) ? JSON.parse(readFileSync(evPath, 'utf8')) : [];

/** The same words, whatever the typography. Footnote marks ("clothed [9] me") are the edition's, not the author's. */
const norm = s => String(s)
  .normalize('NFKC')
  .replace(/\s*\[\d{1,4}\]/g, '')
  .toLowerCase()
  .replace(/[‘’ʼ`´]/g, "'")
  .replace(/[“”„«»]/g, '"')
  .replace(/[‐-―−]/g, '-')
  .replace(/ /g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
/* A quotation may start or stop mid-sentence (an ellipsis, or its own closing stop where the
   source goes on with a semicolon): the words are checked, not the mark that ends them. */
const bare = s => norm(s)
  .replace(/^["']|["']$/g, '').trim()
  .replace(/^(\.\.\.|…)\s*/, '').replace(/\s*(\.\.\.|…)$/, '')
  .replace(/[.,;:!?]+$/, '').trim();
/** Rich marks off: **bold**, *italic*, {la|…}. */
const plain = s => String(s).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\{[a-z]{2}\|([^}]*)\}/g, '$1');

/* ---- collect every quotation the page prints */
const printed = [];
const add = (text, where) => { if (text && String(text).trim()) printed.push({ text: plain(text), where }); };
const inline = (text, where) => {
  if (!text) return;
  for (const m of plain(text).matchAll(/“([^”]+)”/g)) add(m[1], where + ' (inline)');
};
const walk = (node, path) => {
  // Plain strings inside lists (death.paras, saint.paras, numbers[].lines) are page text too.
  if (Array.isArray(node)) { node.forEach((v, i) => typeof v === 'string' ? inline(v, `${path}[${i}]`) : walk(v, `${path}[${i}]`)); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    const p = path ? `${path}.${k}` : k;
    if (typeof v === 'string') {
      if (k === 'q' || k === 'quote') add(v, p);
      else if (!['url', 'src', 'page', 'img', 'slug', 'key', 'focus', 'posM', 'posD', 'license', 'creator'].includes(k)) inline(v, p);
    } else walk(v, p);
  }
};
// The page's own search copy and its sources list are not quotations.
const { seo, sources, person, ...body } = page;
walk(body, '');

/* ---- check */
let bad = 0;
const fail = m => { bad++; console.log('  FAIL ' + m); };
const texts = new Map();
const textOf = file => {
  if (!texts.has(file)) {
    const full = join(HUB, 'sources', file);
    texts.set(file, existsSync(full) ? norm(readFileSync(full, 'utf8')) : null);
  }
  return texts.get(file);
};

/*
 * `parts` in place of `exact`: where the page leaves out only a speaker's tag inside the line
 * ("See,' says he, 'she has fulfilled…" printed as "See, she has fulfilled…"). Each part must be
 * found in the text, in order and close together, and the parts joined must be the display.
 */
/** Words only: for joining parts, where the page's comma replaces the speaker's tag. */
const words = s => norm(s).replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
/** Letters only: for a scan, where line-break hyphens and stray marks sit inside words. */
const letters = s => norm(s).replace(/[^\p{L}]+/gu, '');

/** Every part found in order, each starting within 400 characters of the last one's end. */
const partsIn = (t, parts) => {
  const ps = parts.map(bare);
  let from = t.indexOf(ps[0]);
  while (from >= 0) {
    let end = from + ps[0].length, ok = true;
    for (const p of ps.slice(1)) {
      const i = t.indexOf(p, end);
      if (i < 0 || i - end > 400) { ok = false; break; }
      end = i + p.length;
    }
    if (ok) return true;
    from = t.indexOf(ps[0], from + 1);
  }
  return false;
};

for (const e of evidence) {
  if (e.kind === 'own') {
    const t = textOf(e.file);
    if (t === null) fail(`source file missing: ${e.file}`);
    else if (!e.original || !t.includes(bare(e.original))) fail(`own translation: the original is not in ${e.file}: "${String(e.original).slice(0, 60)}…"`);
    else console.log(`  note  our translation of "${e.original.slice(0, 50)}": "${e.display.slice(0, 50)}"`);
    continue;
  }
  const parts = e.parts ?? [e.exact];
  if (words(bare(e.display)) !== words(bare(parts.join(' ')))) fail(`display and exact differ: "${e.display.slice(0, 60)}…"`);
  if (e.kind === 'bible') continue;
  const t = textOf(e.file);
  if (t === null) { fail(`source file missing: ${e.file}`); continue; }
  /* A scanned book (OCR with line-break hyphens and stray marks): the researcher copies the
     passage as the scan shows it into `seen`, and its letters must be in the file in that order. */
  if (e.kind === 'scan') {
    if (!e.seen || !letters(t).includes(letters(e.seen))) fail(`scan passage not found as seen in ${e.file}`);
    else if (letters(e.seen) !== letters(e.exact)) fail(`scan: exact is not the words seen: "${e.exact.slice(0, 60)}…"`);
    else console.log(`  note  read by eye in a scan: "${e.display.slice(0, 60)}…"`);
    continue;
  }
  if (!partsIn(t, parts)) fail(`not in ${e.file}: "${parts.join(' … ').slice(0, 90)}…"`);
}
/*
 * --discover: for a printed quotation with no evidence yet, look through every fetched text under
 * sources/ and, where it is found word for word, write the entry (the url is left for the
 * researcher to fill in). What is not found stays a failure: fetch its text, or fix the words.
 */
let corpus = null;
const findIn = b => {
  if (!corpus) {
    corpus = [];
    const walkDir = d => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walkDir(p);
        else if (f.endsWith('.txt')) corpus.push([relative(join(HUB, 'sources'), p).split(sep).join('/'), norm(readFileSync(p, 'utf8'))]);
      }
    };
    if (existsSync(join(HUB, 'sources'))) walkDir(join(HUB, 'sources'));
  }
  // Prefer the saint's own folder, then anything else.
  const own = corpus.filter(([f]) => f.startsWith('people/' + slug + '/'));
  return [...own, ...corpus].find(([, t]) => t.includes(b))?.[0] ?? null;
};

const byDisplay = new Set(evidence.map(e => bare(e.display)));
let added = 0;
for (const p of printed) {
  const b = bare(p.text);
  if (b.split(' ').length < 3) continue; // a single word in quotation marks ("birthday") is a term, not a quotation
  if ([...byDisplay].some(d => d === b || d.includes(b))) continue;
  const file = DISCOVER ? findIn(b) : null;
  if (file) {
    evidence.push({ display: p.text, exact: p.text, file, url: '' });
    byDisplay.add(b);
    added++;
    continue;
  }
  fail(`${p.where}: no evidence for "${p.text.slice(0, 80)}"`);
}
if (DISCOVER && added) {
  writeFileSync(evPath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(`  wrote ${added} new evidence entr${added === 1 ? 'y' : 'ies'} to ${evPath}`);
}

console.log(`${slug}: ${printed.length} quotations printed, ${evidence.length} evidence entries, ${bad ? bad + ' problem(s)' : 'all word for word'}`);
process.exit(bad ? 1 : 0);
