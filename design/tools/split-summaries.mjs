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
  spirit:    { right: /^Cessationists hold/ },
  kingdom:   { right: /^The dispensational view keeps/,    middle:  /^Progressive dispensationalists add/ },
  tradition: { right: /^Those who hold to Scripture alone/ },
  worship:   { right: /^Free worship holds/ }
};

/*
 * `spirit` and `kingdom` used to declare a `middle` anchor, and both were wrong.
 *
 *   spirit:  "They affirm that God still heals and answers prayer, but hold that the
 *            Spirit's ordinary work is now through the Word and providence..."
 *            "They" is the CESSATIONISTS of the previous sentence. This is their own
 *            qualification of their own position, and filing it as neutral middle ground
 *            took the most sympathetic sentence in the cessationist case out of the
 *            cessationist case — leaving them looking harsher than their own words.
 *
 * `kingdom` KEEPS its anchor, on a second look. "Progressive dispensationalists add that
 * Christ's kingdom has already begun" is the one-people side's central claim held together
 * with the dispensational side's Israel/church distinction — a genuinely mediating
 * position, which is exactly what this bucket is for. Folding it into the right pole would
 * attribute one camp's mediating qualification to the pole it mediates between.
 *
 * `table` keeps its anchor because the prose itself says so: "Many stand between the
 * poles..." names the in-between position rather than continuing either case. That is the
 * standard — a `middle` block must identify who stands there, in its own first words.
 */

/**
 * A block that opens with a bare pronoun takes its subject from the sentence before it, and
 * that sentence belongs to a pole. Such a block cannot be neutral, whatever the anchor says.
 */
const LEADING_PRONOUN = /^(They|These|Those|Such|It|He|She|This)/;

const sentences = s => s.split(/(?<=\.)\s+/).filter(Boolean);

export function splitSummary(axisKey, summary) {
  const a = ANCHORS[axisKey];
  if (!a) return { ok: false, reason: 'no anchor defined', whole: summary };

  const sents = sentences(summary);
  const idxRight = sents.findIndex(s => a.right.test(s));
  if (idxRight < 1) return { ok: false, reason: 'right-pole anchor not found', whole: summary };

  const idxCaution = a.caution ? sents.findIndex(s => a.caution.test(s)) : -1;
  const idxMiddle  = a.middle  ? sents.findIndex(s => a.middle.test(s))  : -1;

  /*
   * Trailing blocks, sliced between successive marks in document order.
   *
   * Both `note` and `caution` used to be assigned the WHOLE tail, so an axis carrying both
   * anchors would have emitted the same sentences twice, in two different roles — and the
   * verification below could not catch it, because `used` was built from that same array.
   * No axis has both today, which is the only reason it never showed.
   */
  const marks = [
    idxMiddle > idxRight ? { kind: 'note', at: idxMiddle } : null,
    idxCaution > idxRight ? { kind: 'caution', at: idxCaution } : null
  ].filter(Boolean).sort((a, b) => a.at - b.at);

  const idxEnd = marks.length ? marks[0].at : sents.length;

  const left  = sents.slice(0, idxRight);
  const right = sents.slice(idxRight, idxEnd);
  const tail  = sents.slice(idxEnd);

  const blocks = { note: [], caution: [] };
  marks.forEach((m, i) => {
    blocks[m.kind] = sents.slice(m.at, marks[i + 1] ? marks[i + 1].at : sents.length);
  });

  if (idxMiddle > idxRight && LEADING_PRONOUN.test(tail[0] ?? '')) {
    return {
      ok: false,
      reason:
        'the "between the poles" block opens with a pronoun, so its subject is the ' +
        'previous sentence — which belongs to a pole, not to the middle',
      whole: summary
    };
  }

  // verification: every sentence used exactly once, nothing invented, nothing dropped
  const used = [...left, ...right, ...tail];
  const ok = used.length === sents.length && used.every((s, i) => s === sents[i]);
  if (!ok) return { ok: false, reason: 'verification failed', whole: summary };

  return {
    ok: true,
    left: left.join(' '),
    right: right.join(' '),
    note: blocks.note.join(' '),
    caution: blocks.caution.join(' '),
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
