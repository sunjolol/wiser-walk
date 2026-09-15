/**
 * Two results on one set of rails.
 *
 * The overlay exists because the interesting thing about a second person's answers is
 * WHERE THE TWO SIT, not how close they are. So nothing here computes a similarity: there
 * is no percentage, no score and no "match" between two people anywhere in this file or in
 * anything it feeds. What it counts is how many axes put the two readers in the same
 * audited band, which is a statement about the instrument's own categories rather than
 * about the people.
 *
 * `sameBand` compares the BAND STRING, not the value. Two readers three points apart can
 * straddle a band edge and two readers twenty points apart can share one; the band is the
 * thing the quiz is willing to name, so it is the thing the page reports.
 *
 * This is written to take N results even though the routes only offer two. A group route
 * is the obvious next ask, and the shape of the answer should not have to change when it
 * arrives — but until a page exists that can draw more than two markers on one rail,
 * `parseCodes` refuses anything else rather than half-rendering it.
 */
import type {
  BipolarRow, BipolarView, Quiz, UnipolarRow, UnipolarView
} from './types';
import { decodeFor, resultFor } from './registry';

/** How many results one comparison route will accept today. */
export const MAX_CODES = 2;

/**
 * Codes are joined by a dot, not a hyphen or a comma: base-36 codes never contain one, a
 * dot survives every mail client and chat app unescaped, and it cannot be mistaken for
 * part of a code. Nothing about either person is in the URL but their own scores — no
 * name, no initial, no label, in either direction.
 */
export const CODE_SEPARATOR = '.';

export interface BipolarPairRow {
  slug: string;
  name: string;
  /** Both poles, from the shared quiz data, so neither reader's row can supply only one. */
  left: string;
  right: string;
  a: BipolarRow;
  b: BipolarRow;
  /** Equality of the two audited band adjectives. Never a distance threshold. */
  sameBand: boolean;
  /** How far apart the two positions are, in score units. Shown as a shaded run, never a number. */
  gap: number;
}

export interface BipolarComparison {
  shape: 'bipolar';
  a: BipolarView;
  b: BipolarView;
  rows: BipolarPairRow[];
  sameCount: number;
  total: number;
  /** The largest gap, quiz order breaking ties. Null when the two land identically. */
  widest: BipolarPairRow | null;
}

export interface UnipolarPairRow {
  slug: string;
  name: string;
  a: UnipolarRow;
  b: UnipolarRow;
}

export interface UnipolarComparison {
  shape: 'unipolar';
  a: UnipolarView;
  b: UnipolarView;
  /** Paired by slug, in A's rank order. Never re-ranked into some combined order. */
  rows: UnipolarPairRow[];
  sharedTop: boolean;
}

export type Comparison = BipolarComparison | UnipolarComparison;

/**
 * Decode however many codes the parameter carries. Any failure fails the whole thing:
 * half a comparison drawn from one good code and one typo would show a reader a rail with
 * one marker on it and no way to tell that is not the answer.
 */
function decodeAll(quiz: Quiz, param: string): number[][] | null {
  const parts = String(param ?? '').split(CODE_SEPARATOR).map(p => p.trim().toUpperCase());
  const out: number[][] = [];
  for (const part of parts) {
    if (!part) return null;
    const values = decodeFor(quiz, part);
    if (!values) return null;
    out.push(values);
  }
  return out;
}

/**
 * The route's guard. Returns one value array per code, or null — and null must 404 rather
 * than render an empty state, exactly as a bad result code does.
 */
export function parseCodes(
  quiz: Quiz,
  param: string,
  count: number = MAX_CODES
): number[][] | null {
  const all = decodeAll(quiz, param);
  if (!all || all.length !== count) return null;
  return all;
}

export function compare(quiz: Quiz, a: number[], b: number[]): Comparison {
  const va = resultFor(quiz, a);
  const vb = resultFor(quiz, b);

  if (va.shape === 'bipolar') {
    // Same quiz, so the same strategy and the same shape. The cast is the type system
    // catching up with a fact the registry already enforces.
    const right = vb as BipolarView;
    const rows: BipolarPairRow[] = va.rows.map(ra => {
      const rb = right.rows.find(r => r.slug === ra.slug)!;
      return {
        slug: ra.slug,
        name: ra.name,
        left: ra.left,
        right: ra.right,
        a: ra,
        b: rb,
        sameBand: ra.band === rb.band,
        gap: Math.abs(ra.value - rb.value)
      };
    });

    // Strictly greater, so the first row in QUIZ ORDER wins a tie and the same pair of
    // codes always highlights the same axis.
    let widest: BipolarPairRow | null = null;
    for (const row of rows) {
      if (row.gap > 0 && (!widest || row.gap > widest.gap)) widest = row;
    }

    return {
      shape: 'bipolar',
      a: va,
      b: right,
      rows,
      sameCount: rows.filter(r => r.sameBand).length,
      total: rows.length,
      widest
    };
  }

  const left = va as UnipolarView;
  const right = vb as UnipolarView;
  const rows: UnipolarPairRow[] = [...left.rows]
    .sort((x, y) => x.rank - y.rank)
    .map(ra => {
      const rb = right.rows.find(r => r.slug === ra.slug)!;
      return { slug: ra.slug, name: ra.name, a: ra, b: rb };
    });

  const topA = left.rows.find(r => r.rank === 1);
  const topB = right.rows.find(r => r.rank === 1);

  return {
    shape: 'unipolar',
    a: left,
    b: right,
    rows,
    sharedTop: Boolean(topA && topB && topA.slug === topB.slug)
  };
}

/** Built here and nowhere else, for the same reason every other URL in the site is. */
export const compareHref = (quiz: Quiz, codeA: string, codeB: string) =>
  `/c/${quiz.slug}/${codeA}${CODE_SEPARATOR}${codeB}/`;

/**
 * The invite: a link to the QUIZ carrying the inviter's code, not a link to a comparison
 * that does not exist yet. The person invited answers for themselves first and only then
 * sees the two side by side, so nothing about the invitation can lean on their answers.
 */
export const inviteHref = (quiz: Quiz, code: string) =>
  `/q/${quiz.slug}/?with=${encodeURIComponent(code)}`;
