// Checks every quotation in tertullian-facts.json against the fetched texts.
import fs from 'fs';
const SRC = 'C:/Users/Light/Desktop/claude/theology compass/design/saints-hub/sources/people/tertullian';
const FACTS = 'C:/Users/Light/Desktop/claude/theology compass/design/saints-hub/research/people/tertullian-facts.json';
const facts = JSON.parse(fs.readFileSync(FACTS, 'utf8'));
const norm = (s) => s
  .replace(/\s*\[\d+\]/g, '')                 // CCEL txt footnote marks
  .replace(/(\D)(\d{3,5})\2/g, '$1')           // CCEL html footnote marks like 21912191
  .replace(/[\u2018\u2019\u201B`]/g, "'").replace(/[\u201C\u201D]/g, '"')
  .replace(/[\u2014\u2013]/g, '--').replace(/\u00C6/g, 'Ae').replace(/\u00E6/g, 'ae')
  .replace(/-\s+(?=[a-z])/g, '')                 // scan hyphenation "un- belted"
  .replace(/\s+/g, ' ').toLowerCase().trim();
const cache = {};
const text = (f) => cache[f] ??= norm(fs.readFileSync(`${SRC}/${f}.txt`, 'utf8'));
const volFile = (v) => (v === 'ancl11-scan' ? 'raw-ancl11-scan' : `raw-${v}`);
let pass = 0, fail = 0; const rows = [];
function check(path, q, files) {
  const nq = norm(q);
  for (const f of files) {
    if (!f) continue;
    const ok = text(f).includes(nq);
    ok ? pass++ : fail++;
    rows.push(`${ok ? 'OK  ' : 'FAIL'} ${path} in ${f}: ${q.slice(0, 60)}`);
  }
}
function walk(o, path) {
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`));
  if (!o || typeof o !== 'object') return;
  const vol = o.vol ? volFile(o.vol) : null;
  if (o.exact) check(path + '.exact', o.exact, [vol, o.page]);
  if (o.exact2) check(path + '.exact2', o.exact2, [vol, o.page2]);
  if (o.exact_more) check(path + '.exact_more', o.exact_more, [vol, o.page]);
  if (o.latin && o.latin_file) check(path + '.latin', o.latin, [o.latin_file]);
  for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object') walk(v, `${path}.${k}`);
}
walk(facts, 'facts');
// extra: the martyrology line and the unbe**d corruption check
check('martyrology.bologna', 'At  Bologna,  St.  Tertullian,  bishop'.replace(/\s+/g, ' '), ['../martin-of-tours/martyrology-1916']);
console.log(rows.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
