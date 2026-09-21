/**
 * Reverent capitals, swept over the BUILT site.
 *
 *   node design/tools/reverent-check.mjs [site/.vercel/output/static]
 *
 * Every built page's visible text is cut into sentences, and a sentence is printed when a
 * lower-case he / his / him / himself / they / their / them follows one of God, Lord, Jesus,
 * Christ, Spirit, Father or Son. Two passes: the name in the same sentence, and the name in
 * the sentence immediately before it.
 *
 * It is a NET, NOT A VERDICT. Most hits are correct and must stay as they are: a pronoun for
 * a person standing near a divine name (Paul, Luther, Peter, a reader), a pronoun for a thing
 * (the gifts, the elements, the councils), or a word inside a quotation, which is printed
 * exactly as its translation prints it and is never edited. Read every hit and judge the
 * referent from the passage the sentence cites. Fix misses in the SOURCE, then rebuild.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../site/.vercel/output/static');

function walk(dir, out = []) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else if (d.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Visible text only: no script, no style, no svg. A block end is a sentence end. */
function visible(html) {
  const m = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  return (m ? m[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<\/(p|li|h1|h2|h3|h4|blockquote|div|section|article|td|th|figcaption|aside)>/gi, '. ')
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'").replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

const NAME = /\b(God|Lord|LORD|Jesus|Christ|Spirit|Father|Son)\b/;
const PRON = /\b(he|his|him|himself|they|their|them|theirs)\b/;

const near = new Map();   // name in the same sentence
const next = new Map();   // name in the sentence before
const files = walk(ROOT);

for (const f of files) {
  const rel = f.replace(/\\/g, '/').split('/static')[1] ?? f;
  const sentences = visible(fs.readFileSync(f, 'utf8'))
    .split(/(?<=[.!?"”])\s+/).map(s => s.trim()).filter(Boolean);
  sentences.forEach((s, i) => {
    if (s.length > 420) return;
    const at = s.search(NAME);
    if (at >= 0) {
      if (!PRON.test(s.slice(at))) return;
      if (!near.has(s)) near.set(s, new Set());
      near.get(s).add(rel);
      return;
    }
    const prev = i > 0 ? sentences[i - 1] : '';
    if (!NAME.test(prev) || !PRON.test(s)) return;
    if (!next.has(s)) next.set(s, new Set());
    next.get(s).add(rel);
  });
}

const print = (title, map) => {
  console.log('\n== ' + title + ': ' + map.size + ' sentences ==');
  let i = 0;
  for (const [s, where] of [...map].sort((a, b) => b[1].size - a[1].size)) {
    console.log('[' + ++i + '] ' + [...where].slice(0, 2).join(', ') + (where.size > 2 ? ' (+' + (where.size - 2) + ' more)' : ''));
    console.log('    ' + s);
  }
};

console.log('pages swept: ' + files.length);
print('a divine name in the same sentence', near);
print('a divine name in the sentence before', next);
