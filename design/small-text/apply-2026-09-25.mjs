// Apply the small-text sweep: LABEL -> var(--fs-label)/var(--fw-label), TAG -> var(--fs-tag).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = 'C:/Users/Light/Desktop/claude/theology compass';
const inv = JSON.parse(readFileSync(new URL('./small-text.json', import.meta.url), 'utf8'));

// My calls on the open questions, and the exceptions.
const AS_TAG = new Set(['.pcard-d', '.gocard-text > span', '.gchips li', '.jump-label', '.ref .act-ref, .ref .moment-cite', '#scale button::after', '.pq-hero-label']);
const SKIP = new Set(['.navmenu-tag', '.pt-th, .pt-rh']); // done already / split by hand
const DRY = process.argv.includes('--dry');

const todo = inv.filter(x => (x.class === 'LABEL' || x.class === 'TAG' || AS_TAG.has(x.selector)) && !SKIP.has(x.selector))
  .map(x => ({ ...x, kind: AS_TAG.has(x.selector) ? 'TAG' : x.class }));

const files = new Map();
const text = f => { if (!files.has(f)) files.set(f, readFileSync(join(REPO, f), 'utf8')); return files.get(f); };

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let done = 0, failed = [];
for (const x of todo) {
  let s = text(x.file);
  // find the rule: the selector text, then "{", starting near the recorded line
  const lines = s.split('\n');
  const at = n => lines.slice(0, Math.max(0, n)).join('\n').length;
  const sel = esc(x.selector).replace(/\s+/g, '\\s+');
  const re = new RegExp('(^|[\\s,}])' + sel + '\\s*(,[^{]*)?\\{', 'g');
  /* The first rule for this selector, from a little above its recorded line, whose block sets a
     size that is not a token yet. */
  const blockAt = mm => s.slice(mm.index + mm[0].length, s.indexOf('}', mm.index + mm[0].length));
  const wants = b => /(font-size\s*:\s*(?!var)|\bfont\s*:\s*[^;]*\d(rem|px|em))/.test(b);
  let m = null;
  for (const from of [x.line - 8, 0]) {
    re.lastIndex = at(from);
    let k;
    while ((k = re.exec(s))) { if (wants(blockAt(k))) { m = k; break; } }
    if (m) break;
  }
  if (!m) { failed.push(x.file + ' ' + x.selector + ' (rule not found)'); continue; }
  const open = m.index + m[0].length;
  const close = s.indexOf('}', open);
  let block = s.slice(open, close);
  const before = block;
  const size = x.kind === 'LABEL' ? 'var(--fs-label)' : 'var(--fs-tag)';
  if (/font-size\s*:/.test(block)) {
    block = block.replace(/font-size\s*:\s*[^;]+/, 'font-size: ' + size);
  } else if (/\bfont\s*:/.test(block)) {
    block = block.replace(/(\bfont\s*:\s*)([^;]+)/, (all, head, val) => {
      let v = val.replace(/(\d*\.?\d+(?:rem|px|em))(?=\s*(\/|\s|$))/, size);
      if (x.kind === 'LABEL') v = v.replace(/\b([1-9]00)\b/, 'var(--fw-label)');
      return head + v;
    });
  } else {
    failed.push(x.file + ' ' + x.selector + ' (no font-size in block)');
    continue;
  }
  if (x.kind === 'LABEL' && !/\bfont\s*:/.test(block)) {
    if (/font-weight\s*:/.test(block)) block = block.replace(/font-weight\s*:\s*[^;]+/, 'font-weight: var(--fw-label)');
    else block = block.replace(/font-size: var\(--fs-label\)/, 'font-size: var(--fs-label); font-weight: var(--fw-label)');
  }
  if (block === before) { failed.push(x.file + ' ' + x.selector + ' (unchanged)'); continue; }
  s = s.slice(0, open) + block + s.slice(close);
  files.set(x.file, s);
  done++;
  console.log(`${x.kind.padEnd(5)} ${x.file.replace('site/src/', '')}  ${x.selector}  ${x.size} -> ${size}`);
}
if (!DRY) for (const [f, s] of files) writeFileSync(join(REPO, f), s);
console.log(`\n${done} applied${DRY ? ' (dry run)' : ''}, ${failed.length} failed`);
for (const f of failed) console.log('  FAILED ' + f);
