/*
 * capitals.mjs — pronouns for God, Jesus and the Holy Spirit, capitalised for display.
 *
 * The owner's rule (2026-09-23): every pronoun for God, Jesus or the Holy Spirit is
 * capitalised, inside quotations too. The pool keeps every line verbatim, because
 * verify.mjs proves each one against its source file, so the capitals are a display
 * layer like LORD -> Lord: ../capitals.json maps a line id to its display text. Each
 * entry was judged line by line. A pronoun for a king, a prophet, an angel, a reader or
 * a wicked man stays as printed; where a Bible line's referent is disputed, the Berean
 * Standard Bible's choice was followed.
 *
 * Sounds Like Scripture needs this to remove a tell (its other sources print "Thee" for
 * God and KJV never does); this game follows the same rule so the two read alike. KJV
 * and WEBBE lines are treated the same way, so a capital says nothing about the edition.
 *
 * checkCapitals() is the guard: a display text may differ from its line only by raising
 * the first letter of one of these pronouns. build-page.mjs refuses to build and
 * test-game.mjs fails on anything else, so the map can never alter a word.
 *
 * Zero dependencies. The same code as demos/sounds-like-scripture/scripts/capitals.mjs,
 * except that the sibling also raises me, my, mine and myself for a divine speaker. This
 * game must not: a capital Me would name the speaker, which is the answer.
 */
import { readFileSync, existsSync } from 'node:fs';

export const PRONOUNS = [
  'he', 'his', 'him', 'himself', 'who', 'whom', 'whose',
  'you', 'your', 'yours', 'yourself', 'thou', 'thee', 'thy', 'thine', 'thyself'
];
const SET = new Set(PRONOUNS);

const tokens = s => String(s).match(/[A-Za-z]+|[^A-Za-z]+/g) || [];

/* null when `display` is `line` with at least one of the pronouns above raised from a
   lower-case first letter to a capital, and nothing else changed; otherwise the reason. */
export function checkCapitals(line, display) {
  const a = tokens(line);
  const b = tokens(display);
  if (a.length !== b.length) return 'the words differ';
  let raised = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    const w = a[i];
    if (!/^[a-z]/.test(w) || !SET.has(w.toLowerCase())) return '"' + w + '" changed to "' + b[i] + '"';
    if (b[i] !== w.charAt(0).toUpperCase() + w.slice(1)) return '"' + w + '" changed to "' + b[i] + '"';
    raised++;
  }
  return raised ? null : 'nothing is capitalised';
}

export function readCapitals(file) {
  if (!existsSync(file)) return { lines: {} };
  const caps = JSON.parse(readFileSync(file, 'utf8'));
  if (!caps || typeof caps.lines !== 'object') throw new Error(file + ' has no lines object');
  return caps;
}

/* Sets item.d (the display text) on every pool item the map names. Throws on an id the
   pool lacks or on a display text the guard refuses; returns how many were set. */
export function applyCapitals(pool, caps) {
  const byId = new Map(pool.items.map(i => [i.id, i]));
  let n = 0;
  for (const [id, d] of Object.entries(caps.lines || {})) {
    const item = byId.get(id);
    if (!item) throw new Error('capitals.json names ' + id + ', which is not in the pool');
    const why = checkCapitals(item.t, d);
    if (why) throw new Error('capitals.json, ' + id + ': ' + why);
    item.d = d;
    n++;
  }
  return n;
}
