/**
 * Highest-category-wins: unipolar categories, each scored 0..100, ranked.
 * This is the strategy the spiritual-gifts and seven-deadly-sins quizzes need.
 *
 * It deliberately reuses the same 0..100-per-group value shape as the bipolar
 * strategy, so the permalink codec, the result page and the share card stay generic.
 */
import { makeCodec } from '../engine/codec';
import type { Quiz, ScoringStrategy, Sheet, UnipolarRow, UnipolarView } from '../engine/types';

function spanOf(quiz: Quiz, group: number): number {
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n++;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length, quiz.codePrefix ?? '');
}

/**
 * How strongly a category came out, in words.
 *
 * No percentage and no 0..100 number appears anywhere in a unipolar result, including the
 * aria-labels. At two items per group only nine values are reachable and they sit 12.5
 * points apart, so "63%" claims a precision the instrument cannot express — and it invites
 * "I am 63% Wrath", which is not a claim the data makes. The words are cut on reachable
 * STEPS above the point where agreement and disagreement cancelled out, so they track what
 * was actually measured however long the instrument is.
 *
 * The previous version returned "not a strong pull" for every value at or below 50 — five
 * of the nine reachable values — so a reader who disagreed with every statement about a
 * vice read identically to one who was perfectly balanced on it. That distinction is real
 * and worth keeping.
 */
const ABOVE = ['', 'a slight pull', 'a clear pull', 'a strong pull', 'the strongest here'];

export function pull(quiz: Quiz, score: number): string {
  if (score < 50) return 'leaned away';
  if (score === 50) return 'no pull either way';
  const half = Math.max(1, (quiz.config.radix - 1) / 2);
  const above = ((score - 50) / 50) * half;
  return ABOVE[Math.min(4, Math.max(1, Math.ceil((above / half) * 4)))]!;
}

/**
 * How close two categories must be to count as level.
 *
 * Expressed in REACHABLE STEPS, not points, because a point is not a constant: at two items
 * per group the scale has 9 rungs 12.5 points apart, and at six it has 25 rungs 4.2 apart.
 * A fixed 8-point threshold means "exact tie only" on the first and "two rungs apart is a
 * tie" on the second. `tieSteps` says what was actually meant, at any length of instrument.
 */
function tieMargin(quiz: Quiz): number {
  const steps = Math.max(1, quiz.config.tieSteps ?? 1);
  const rung = 100 / Math.max(1, quiz.config.radix - 1);
  return steps * rung + 0.5; // the half-point absorbs score()'s rounding
}

/**
 * Whether anything rose far enough above no-net-agreement to be worth naming.
 *
 * This deliberately does NOT ask how far each score sits from 50 in either direction. That
 * is the bipolar question, and asking it here produced a real and ugly failure: a reader who
 * answered "that is not me" to every statement scored 0 on all seven vices, and was told
 * they were "Envy and gluttony" — the alphabetically first two of seven tied at the bottom.
 * The most emphatic denial the instrument accepts came back as an accusation.
 */
function nothingNamed(quiz: Quiz, values: number[]): boolean {
  const floor = quiz.config.namingFloor ?? 10;
  return values.every(v => v - 50 <= floor);
}

export const category: ScoringStrategy = {
  id: 'category-highest',
  shape: 'unipolar',

  score(quiz: Quiz, sheet: Sheet): number[] {
    const raw = new Array(quiz.groups.length).fill(0);
    quiz.items.forEach((item, i) => {
      raw[item.group] += item.direction * (sheet[i] ?? 0);
    });
    return raw.map((r, g) => {
      const span = spanOf(quiz, g);
      return span === 0 ? 50 : Math.round(((r + span) / (span * 2)) * 100);
    });
  },

  result(quiz: Quiz, values: number[]): UnipolarView {
    const ranked = quiz.groups
      .map((g, i) => ({ name: g.name, slug: g.slug, score: values[i] ?? 50 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    // Rank by slug, so rows can stay in quiz order and still know where they placed.
    const place = new Map(ranked.map((r, i) => [r.slug, i + 1]));
    const rows: UnipolarRow[] = quiz.groups.map((g, i) => ({
      key: g.key,
      slug: g.slug,
      name: g.name,
      value: values[i] ?? 50,
      rank: place.get(g.slug) ?? i + 1,
      below: (values[i] ?? 50) < 50,
      strength: pull(quiz, values[i] ?? 50)
    }));

    const flat = nothingNamed(quiz, values);
    const tied =
      ranked[1] !== undefined &&
      Math.abs(ranked[0]!.score - ranked[1]!.score) <= tieMargin(quiz);

    let headline: string;
    let summary: string;
    let state: UnipolarView['state'];
    if (flat) {
      // "Flat", never "central": a ranking has no centre to sit in the middle of.
      state = 'flat';
      headline = 'No single one stands out';
      // True whether the reader answered neutrally throughout or denied every statement
      // outright. The old copy ("your answers sit near the middle") was false for the second.
      summary = 'Nothing here rose far enough above the rest to name one, so none is named.';
    } else if (tied) {
      state = 'tie';
      headline = `${ranked[0]!.name} and ${ranked[1]!.name}`;
      headline = headline.charAt(0).toUpperCase() + headline.slice(1);
      summary = `Two came out level: ${ranked[0]!.name} and ${ranked[1]!.name}.`;
    } else {
      state = 'clear';
      headline = ranked[0]!.name.charAt(0).toUpperCase() + ranked[0]!.name.slice(1);
      summary = `Strongest pull: ${ranked[0]!.name}. Next: ${ranked[1]?.name ?? '—'}.`;
    }

    return {
      shape: 'unipolar',
      state,
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      headline,
      // A ranking has no side to colour by; the clause is the whole headline.
      headlineParts: [{ text: headline, side: 'centre' as const }],
      summary,
      rows,
      ranked
    };
  },

  encode: (quiz, values) => codecFor(quiz).encode(values),
  decode: (quiz, code) => codecFor(quiz).decode(code),

  shareText(quiz: Quiz, values: number[], origin: string): string {
    const lines = [quiz.shareTitle];
    const ranked = quiz.groups
      .map((g, i) => ({ g, v: values[i] ?? 50 }))
      .sort((a, b) => b.v - a.v);
    /*
     * Filled from the PULL, not from the raw score.
     *
     * The eleven-slot bar is an audited Compass artifact, and on that bar the middle slot
     * is the centre of a two-ended axis. Reused here with `round(v / 10)`, a perfectly
     * neutral 50 filled six of eleven cells — telling a reader they were somewhat envious
     * for having answered neither way. The bipolar card marks a POSITION and this one
     * shows a MAGNITUDE; that difference is the whole reason there are two of them, and
     * nobody should later "unify" them.
     */
    const CELLS = 11;
    ranked.forEach(({ g, v }) => {
      const filled = Math.max(0, Math.min(CELLS, Math.round(((v - 50) / 50) * CELLS)));
      let bar = '';
      for (let k = 0; k < CELLS; k++) bar += k < filled ? '█' : '░';
      lines.push(`${bar} ${g.name}`);
    });
    lines.push(`${origin}/r/${quiz.slug}/${this.encode(quiz, values)}`);
    return lines.join('\n');
  }
};
