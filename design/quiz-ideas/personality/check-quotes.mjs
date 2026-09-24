// Checks every quotation in results.mjs (and quoted phrases inside its running text) against saved source texts.
// Usage: node check-quotes.mjs <corpus-dir> [more dirs or .txt files...]
// The corpus is not committed (some saved texts are copyrighted translations kept only for checking).
import fs from 'node:fs';
import path from 'node:path';
import * as R from './results.mjs';

const roots = process.argv.slice(2);
if (!roots.length) { console.error('usage: node check-quotes.mjs <corpus-dir> ...'); process.exit(2); }
const files = [];
const walk = (p) => {
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const f of fs.readdirSync(p)) if (f !== 'raw') walk(path.join(p, f)); }
  else if (p.endsWith('.txt')) files.push(p);
};
roots.forEach(walk);
const norm = (s) => s
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
  .replace(/\s+([,.;:?!])/g, '$1').replace(/\s+/g, ' ').toLowerCase().trim();
const corpus = files.map((f) => norm(fs.readFileSync(f, 'utf8'))).join('\n');

// Phrases in running text that are ours (speech, labels), not source quotations.
const OURS = new Set(['next time, try this', 'you did this wrong', 'just in case']);

const found = [];
const seen = new Set();
const visit = (v, where) => {
  if (!v) return;
  if (Array.isArray(v)) return v.forEach((x, i) => visit(x, where + '[' + i + ']'));
  if (typeof v === 'object') {
    if (typeof v.q === 'string') found.push({ where, text: v.q, kind: 'Q' });
    for (const [k, x] of Object.entries(v)) if (k !== 'q') visit(x, where + '.' + k);
    return;
  }
  if (typeof v === 'string') {
    for (const m of v.matchAll(/["“]([^"”]{8,}?)["”]/g)) {
      const t = m[1].replace(/[.,]$/, '');
      if (!OURS.has(t.toLowerCase())) found.push({ where, text: t, kind: 'inline' });
    }
  }
};
for (const [name, val] of Object.entries(R)) if (name !== 'Q') visit(val, name);

let bad = 0;
for (const f of found) {
  const key = f.kind + '|' + f.text;
  if (seen.has(key)) continue;
  seen.add(key);
  const ok = corpus.includes(norm(f.text));
  if (!ok) { bad++; console.log('MISSING [' + f.kind + '] ' + f.where + ': ' + f.text); }
}
console.log(`${seen.size} distinct quotations checked against ${files.length} texts; ${bad} not found.`);
process.exit(bad ? 1 : 0);
