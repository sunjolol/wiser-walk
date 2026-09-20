/**
 * Look up the World English Bible British Edition held on disk. Nothing is ever quoted from
 * memory on this site; this is how a reference gets opened.
 *
 *   node audit/tools/webbe.mjs "1 Corinthians 12:8-10"      print a verse, a range or a chapter
 *   node audit/tools/webbe.mjs "Acts 8:5-8" "Tobit 1:16-18"  several at once
 *   node audit/tools/webbe.mjs --grep "heal" --book Acts     search (case-insensitive regex)
 *   node audit/tools/webbe.mjs --check file.json             every {ref, text|quote} pair in the
 *                                                            file must be a verbatim substring
 *
 * Sources, both gitignored and both on the owner's disk:
 *   demos/sounds-like-scripture/work/verses-all.json  (src "webbe": the sixty-six books)
 *   demos/sounds-like-scripture/raw/eng-webbe_vpl.txt (the deuterocanon: TOB, JDT and the rest)
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const VERSES = resolve(ROOT, 'demos/sounds-like-scripture/work/verses-all.json');
const VPL = resolve(ROOT, 'demos/sounds-like-scripture/raw/eng-webbe_vpl.txt');

/** Deuterocanonical books read from the VPL file, by the name a reference uses. */
const VPL_BOOKS = { Tobit: 'TOB', Judith: 'JDT' };

let cache;
export function loadWebbe() {
  if (cache) return cache;
  const map = new Map(); // "Book C:V" -> text
  if (existsSync(VERSES)) {
    for (const v of JSON.parse(readFileSync(VERSES, 'utf8'))) if (v.src === 'webbe') map.set(v.ref, v.text);
  }
  if (existsSync(VPL)) {
    const codes = Object.fromEntries(Object.entries(VPL_BOOKS).map(([name, code]) => [code, name]));
    for (const line of readFileSync(VPL, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z0-9]{3}) (\d+):(\d+) (.*)$/.exec(line);
      if (m && codes[m[1]]) map.set(`${codes[m[1]]} ${m[2]}:${m[3]}`, m[4].trim());
    }
  }
  cache = map;
  return map;
}

/** "Acts 8:5-8", "Acts 8:5", "Acts 8", "Acts 8:39-9:2" -> [{ref, text}] in order, or null. */
export function resolveRef(ref) {
  const map = loadWebbe();
  const m = /^(.+?) (\d+)(?::(\d+)(?:\s*[-–]\s*(?:(\d+):)?(\d+))?)?$/.exec(ref.trim());
  if (!m) return null;
  const [, book, c1, v1, c2, v2] = m;
  const out = [];
  const startC = Number(c1);
  const endC = c2 ? Number(c2) : startC;
  for (let c = startC; c <= endC; c++) {
    const from = c === startC && v1 ? Number(v1) : 1;
    const to = v1 === undefined ? 400 : c === endC ? Number(v2 ?? v1) : 400;
    for (let v = from; v <= to; v++) {
      const key = `${book} ${c}:${v}`;
      if (map.has(key)) out.push({ ref: key, text: map.get(key) });
      else if (to !== 400) return null; // a named verse that does not exist
      else break;
    }
  }
  return out.length ? out : null;
}

const norm = s => s.replace(/\s+/g, ' ').trim();

/** True when `text` is a verbatim substring of the verses `ref` names, joined by single spaces. */
export function isVerbatim(ref, text) {
  const verses = resolveRef(ref);
  return Boolean(verses) && norm(verses.map(v => v.text).join(' ')).includes(norm(text));
}

function collectPairs(node, out) {
  if (Array.isArray(node)) node.forEach(n => collectPairs(n, out));
  else if (node && typeof node === 'object') {
    const q = node.quote ?? node.text;
    if (typeof node.ref === 'string' && typeof q === 'string') out.push({ ref: node.ref, text: q });
    Object.values(node).forEach(n => collectPairs(n, out));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('usage: webbe.mjs "<ref>" ... | --grep <regex> [--book <name>] | --check <file.json>');
    process.exit(1);
  }
  if (args[0] === '--grep') {
    const re = new RegExp(args[1], 'i');
    const book = args[2] === '--book' ? args[3] : null;
    let n = 0;
    for (const [ref, text] of loadWebbe()) {
      if (book && !ref.startsWith(book + ' ')) continue;
      if (re.test(text)) { console.log(`${ref} :: ${text}`); n++; }
    }
    console.log(`(${n} verses)`);
  } else if (args[0] === '--check') {
    const pairs = [];
    collectPairs(JSON.parse(readFileSync(resolve(args[1]), 'utf8')), pairs);
    let bad = 0;
    for (const p of pairs) if (!isVerbatim(p.ref, p.text)) { bad++; console.log(`NOT VERBATIM  ${p.ref} :: ${p.text}`); }
    console.log(`${pairs.length - bad} of ${pairs.length} quotations are verbatim`);
    process.exit(bad ? 1 : 0);
  } else {
    for (const ref of args) {
      const verses = resolveRef(ref);
      if (!verses) { console.log(`${ref} :: NOT FOUND`); continue; }
      for (const v of verses) console.log(`${v.ref} :: ${v.text}`);
    }
  }
}
