/**
 * Bipolar axes scored to 0..100, matched to named positions by Euclidean distance.
 * This is the Theology Compass's strategy. Every threshold here came out of the
 * fairness audit — see audit/fairness-report.md before changing any of them.
 */
import { makeCodec } from '../engine/codec';
import type { Bar, Quiz, QuizResult, ScoringStrategy, Sheet } from '../engine/types';

/** Items per group fixes the raw range, so a group with more items still maps to 0..100. */
function spanOf(quiz: Quiz, group: number): number {
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n++;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length);
}

/** Five bands across the scale; band 2 is the middle, and a midpoint is not a conviction. */
export function band(score: number): number {
  return score <= 20 ? 0 : score <= 40 ? 1 : score <= 59 ? 2 : score <= 79 ? 3 : 4;
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

  result(quiz: Quiz, values: number[]): QuizResult {
    const near = nearest(quiz, values);
    const bars: Bar[] = quiz.groups.map((g, i) => ({
      label: g.name,
      value: values[i] ?? 50,
      emoji: g.emoji,
      left: g.left,
      right: g.right,
      lean: lean(g, values[i] ?? 50)
    }));
    return {
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      headline: headline(quiz, values),
      summary: nearestLine(quiz, values, near),
      bars,
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
