/**
 * Split each axis summary into: the left pole's case, the right pole's case, an optional
 * shared/middle-ground note, and an optional methodology caution.
 *
 * The prose is AUDITED. Attributing one pole's words to the other would be exactly the kind of
 * unfairness the whole instrument exists to avoid, so this never guesses: it splits on an explicit
 * per-axis anchor, then verifies that every sentence is accounted for exactly once. Any axis that
 * fails verification is reported and must be rendered whole rather than split.
 */
import { readFileSync } from 'node:fs';

import { fileURLToPath as _f } from 'node:url';
const DATA = new URL('../../site/src/data/compass.json', import.meta.url);

/** The sentence that begins the RIGHT pole's case, and anything that starts a trailing note. */
const ANCHORS = {
  grace:     { right: /^Synergists \(/,                    caution: /^One caution about how this axis is built/ },
  table:     { right: /^The memorial view holds/,          middle:  /^Many stand between the poles/ },
  spirit:    { right: /^Cessationists hold/,               middle:  /^They affirm that God still heals/ },
  kingdom:   { right: /^The dispensational view keeps/,    middle:  /^Progressive dispensationalists add/ },
  tradition: { right: /^Those who hold to Scripture alone/ },
  worship:   { right: /^Free worship holds/ }
};

const sentences = s => s.split(/(?<=\.)\s+/).filter(Boolean);

export function splitSummary(axisKey, summary) {
  const a = ANCHORS[axisKey];
  if (!a) return { ok: false, reason: 'no anchor defined', whole: summary };

  const sents = sentences(summary);
  const idxRight = sents.findIndex(s => a.right.test(s));
  if (idxRight < 1) return { ok: false, reason: 'right-pole anchor not found', whole: summary };

  const idxCaution = a.caution ? sents.findIndex(s => a.caution.test(s)) : -1;
  const idxMiddle  = a.middle  ? sents.findIndex(s => a.middle.test(s))  : -1;

  // the first trailing block that actually appears after the right-pole case
  const ends = [idxCaution, idxMiddle].filter(i => i > idxRight);
  const idxEnd = ends.length ? Math.min(...ends) : sents.length;

  const left  = sents.slice(0, idxRight);
  const right = sents.slice(idxRight, idxEnd);
  const tail  = sents.slice(idxEnd);

  // verification: every sentence used exactly once, nothing invented, nothing dropped
  const used = [...left, ...right, ...tail];
  const ok = used.length === sents.length && used.every((s, i) => s === sents[i]);
  if (!ok) return { ok: false, reason: 'verification failed', whole: summary };

  return {
    ok: true,
    left: left.join(' '),
    right: right.join(' '),
    note: idxMiddle > idxRight ? tail.join(' ') : '',
    caution: idxCaution > idxRight ? tail.join(' ') : '',
    counts: { left: left.length, right: right.length, tail: tail.length, total: sents.length }
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('split-summaries.mjs')) {
  const compass = JSON.parse(readFileSync(DATA, 'utf8'));
  let allOk = true;
  for (const ax of compass.axes) {
    const r = splitSummary(ax.key, ax.summary);
    if (!r.ok) { allOk = false; console.log(`FAIL ${ax.name}: ${r.reason}`); continue; }
    const words = t => t ? t.split(/\s+/).length : 0;
    console.log(
      `ok   ${ax.name.padEnd(10)} left ${String(words(r.left)).padStart(4)}w  ` +
      `right ${String(words(r.right)).padStart(4)}w  ` +
      `note ${String(words(r.note)).padStart(3)}w  caution ${String(words(r.caution)).padStart(3)}w`
    );
    // the split must never put the other pole's OPENING CLAIM in the wrong column.
    // Test the anchor itself, not a bare word: 'Scripture' legitimately appears on both
    // sides of the Authority axis, so a word match is a false positive.
    const anchor = ANCHORS[ax.key].right;
    if (sentences(r.left).some(s => anchor.test(s))) {
      console.log(`     WARNING: right-pole term appears at the head of the left column`);
      allOk = false;
    }
  }
  console.log(allOk ? '\nAll six split and verified.' : '\nSome axes could not be split safely.');
}
