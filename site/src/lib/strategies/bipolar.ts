/**
 * Bipolar axes scored to 0..100, matched to named positions by Euclidean distance.
 * This is the Theology Compass's strategy. Every threshold here came out of the
 * fairness audit — see audit/fairness-report.md before changing any of them.
 */
import { makeCodec } from '../engine/codec';
import type { BipolarRow, BipolarView, Quiz, ScoringStrategy, Sheet } from '../engine/types';

/** Items per group fixes the raw range, so a group with more items still maps to 0..100. */
function spanOf(quiz: Quiz, group: number): number {
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n++;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length);
}

/**
 * Five bands across the scale. A score at or below BAND_EDGES[i] is band i; band 2 is the
 * middle, and a midpoint is not a conviction.
 *
 * These edges are the single source of truth for the no-claim band. The result page draws
 * that band as a visible zone, and it reads the range from here rather than hard-coding
 * 41-59 in CSS — otherwise a quiz that moved its edges would ship a visual that lies.
 */
export const BAND_EDGES = [20, 40, 59, 79, 100] as const;
const MIDDLE_BAND = 2;

export function band(score: number): number {
  for (let i = 0; i < BAND_EDGES.length; i++) if (score <= BAND_EDGES[i]!) return i;
  return BAND_EDGES.length - 1;
}

/** The inclusive score range in which the instrument names no position: [41, 59]. */
export const noClaimRange = (): [number, number] => [
  BAND_EDGES[MIDDLE_BAND - 1]! + 1,
  BAND_EDGES[MIDDLE_BAND]!
];

export const namesNoPosition = (score: number) => band(score) === MIDDLE_BAND;

/** Every score the instrument can actually produce, in order. */
export function reachable(quiz: Quiz): number[] {
  const steps = Math.max(1, quiz.config.radix - 1);
  return Array.from({ length: steps + 1 }, (_, k) => Math.round((k * 100) / steps));
}

/**
 * The no-claim band as a share of the track, snapped to half a step outside the outermost
 * reachable positions it contains. Derived, never typed: at radix 25 the band holds a
 * different set of steps, and a hard-coded percentage would quietly stop matching band().
 */
export function noClaimSpan(quiz: Quiz): [number, number] {
  const steps = Math.max(1, quiz.config.radix - 1);
  const inside = reachable(quiz)
    .map((v, k) => (namesNoPosition(v) ? k : -1))
    .filter(k => k >= 0);
  if (!inside.length) return [50, 50];
  const lo = (inside[0]! - 0.5) / steps;
  const hi = (inside[inside.length - 1]! + 0.5) / steps;
  return [Math.max(0, lo * 100), Math.min(100, hi * 100)];
}

/** Distance from the midpoint as a share of the half-axis, so one net Agree is not "58%". */
export function lean(group: { left?: string; right?: string }, score: number): string {
  if (score === 50) return 'at the center';
  if (score === 0) return `at the ${group.left} pole`;
  if (score === 100) return `at the ${group.right} pole`;
  const pct = Math.round((Math.abs(score - 50) / 50) * 100);
  return `${pct}% toward ${score < 50 ? group.left : group.right}`;
}

function strongCount(quiz: Quiz, sheet: Sheet | null, group: number): number {
  if (!sheet) return 0;
  let n = 0;
  quiz.items.forEach((item, i) => {
    if (item.group === group && Math.abs(sheet[i] ?? 0) === 2) n++;
  });
  return n;
}

/** Only axes outside the middle band name a position. */
export function headline(quiz: Quiz, values: number[], sheet: Sheet | null = null): string {
  const out = values
    .map((s, i) => ({ i, d: Math.abs(s - 50), b: band(s) }))
    .filter(x => x.b !== 2);
  if (!out.length) return 'Near the center on every axis';
  out.sort(
    (a, b) =>
      b.d - a.d ||
      strongCount(quiz, sheet, b.i) - strongCount(quiz, sheet, a.i) ||
      a.i - b.i
  );
  const str = out
    .slice(0, 3)
    .map(x => quiz.groups[x.i]!.bands?.[x.b] ?? quiz.groups[x.i]!.name)
    .join(', ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export interface Match {
  name: string;
  slug: string;
  position: number[];
  distance: number;
  match: number;
}

export function nearest(quiz: Quiz, values: number[]): Match[] {
  const maxDistance = quiz.config.maxDistance;
  return quiz.outcomes
    .filter(o => Array.isArray(o.position))
    .map(o => {
      const position = o.position!;
      let sum = 0;
      for (let i = 0; i < quiz.groups.length; i++) {
        const d = (position[i] ?? 50) - (values[i] ?? 50);
        sum += d * d;
      }
      const distance = Math.sqrt(sum);
      return {
        name: o.name,
        slug: o.slug,
        position,
        distance,
        match: Math.max(0, Math.round(100 - (distance / maxDistance) * 100))
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

export type NearestKind = 'central' | 'loose' | 'tie' | 'near';

export function nearestState(
  quiz: Quiz,
  values: number[],
  near: Match[]
): { kind: NearestKind; names: string[] } {
  const names = [near[0]?.name, near[1]?.name].filter(Boolean) as string[];
  if (values.every(s => Math.abs(s - 50) <= quiz.config.centerUnits)) {
    return { kind: 'central', names: [] };
  }
  if (!near[0]) return { kind: 'loose', names };
  if (near[0].distance > quiz.config.hedgeUnits) return { kind: 'loose', names };
  if (near[1] && Math.abs(near[1].distance - near[0].distance) <= quiz.config.tieUnits) {
    return { kind: 'tie', names };
  }
  return { kind: 'near', names };
}

export function nearestLine(quiz: Quiz, values: number[], near: Match[]): string {
  const st = nearestState(quiz, values, near);
  if (st.kind === 'central') return 'Near the center on every axis, so no tradition is named';
  if (st.kind === 'loose') return `No listed tradition is a close fit. Nearest, loosely: ${st.names.join(', ')}`;
  return `Nearest on the map${st.kind === 'tie' ? ' (jointly)' : ''}: ${st.names.join(' · ')}`;
}

export const bipolar: ScoringStrategy = {
  id: 'bipolar-nearest',
  shape: 'bipolar',

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

  result(quiz: Quiz, values: number[]): BipolarView {
    const near = nearest(quiz, values);
    const steps = Math.max(1, quiz.config.radix - 1);
    const rows: BipolarRow[] = quiz.groups.map((g, i) => {
      const value = values[i] ?? 50;
      return {
        step: Math.round((value * steps) / 100),
        steps,
        key: g.key,
        slug: g.slug,
        name: g.name,
        emoji: g.emoji,
        value,
        // A bipolar group without both poles is a data error, not a rendering variant.
        // The registry rejects it at build time; this keeps the type honest meanwhile.
        left: g.left ?? '',
        right: g.right ?? '',
        band: g.bands?.[band(value)] ?? '',
        lean: lean(g, value),
        noClaim: namesNoPosition(value)
      };
    });
    return {
      shape: 'bipolar',
      state: nearestState(quiz, values, near).kind,
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      headline: headline(quiz, values),
      summary: nearestLine(quiz, values, near),
      rows,
      noClaimRange: noClaimRange(),
      noClaimSpan: noClaimSpan(quiz),
      ranked: near.map(m => ({ name: m.name, slug: m.slug, score: m.match }))
    };
  },

  encode: (quiz, values) => codecFor(quiz).encode(values),
  decode: (quiz, code) => codecFor(quiz).decode(code),

  /** Bar first so the lines align; one filled slot marks the position between the poles. */
  shareText(quiz: Quiz, values: number[], origin: string): string {
    const lines = [quiz.shareTitle];
    quiz.groups.forEach((g, i) => {
      const at = Math.max(0, Math.min(10, Math.round((values[i] ?? 50) / 10)));
      let bar = '';
      for (let k = 0; k < 11; k++) bar += k === at ? '●' : '○';
      lines.push(`${g.emoji ?? '·'} ${bar} ${g.name}: ${g.left} → ${g.right}`);
    });
    const near = nearest(quiz, values);
    const st = nearestState(quiz, values, near);
    lines.push(
      nearestLine(quiz, values, near) +
        (st.kind === 'near' || st.kind === 'tie' ? ' (approximate)' : '')
    );
    lines.push(`${origin}/r/${quiz.slug}/${this.encode(quiz, values)}`);
    return lines.join('\n');
  }
};
