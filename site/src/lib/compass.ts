/**
 * The scoring core, shared by the quiz island and the server-rendered result pages.
 * Every rule here came out of the fairness audit; see audit/fairness-report.md.
 */
import data from '../data/compass.json';

export type Axis = (typeof data.axes)[number];
export type Statement = (typeof data.statements)[number];
export type Tradition = (typeof data.traditions)[number];

export const AXES = data.axes as Axis[];
export const STATEMENTS = data.statements as Statement[];
export const TRADITIONS = data.traditions as Tradition[];
export const SCORING = data.scoring;
export const SIMULATIONS = data.simulations as Array<Record<string, unknown>>;

export const AXIS_COUNT = AXES.length;

/** Answers run -2..2; an unanswered item is null. */
export type Answer = -2 | -1 | 0 | 1 | 2;
export type Sheet = Array<Answer | null>;

/** Raw sum per axis maps onto 0..100, where 0 is the left pole and 100 the right. */
export function computeScores(sheet: Sheet): number[] {
  const span = SCORING.itemsPerAxis * 2;
  const raw = new Array(AXIS_COUNT).fill(0);
  STATEMENTS.forEach((s, i) => {
    raw[s.axisIndex] += s.direction * (sheet[i] ?? 0);
  });
  return raw.map(r => Math.round(((r + span) / (span * 2)) * 100));
}

export function band(score: number): number {
  return score <= 20 ? 0 : score <= 40 ? 1 : score <= 59 ? 2 : score <= 79 ? 3 : 4;
}

/** Distance from the midpoint as a share of the half-axis, so one net Agree is not "58%". */
export function lean(axis: Axis, score: number): string {
  if (score === 50) return 'at the center';
  if (score === 0) return `at the ${axis.left} pole`;
  if (score === 100) return `at the ${axis.right} pole`;
  const pct = Math.round((Math.abs(score - 50) / 50) * 100);
  return `${pct}% toward ${score < 50 ? axis.left : axis.right}`;
}

function strongCount(sheet: Sheet | null, axisIndex: number): number {
  if (!sheet) return 0;
  let n = 0;
  STATEMENTS.forEach((s, i) => {
    if (s.axisIndex === axisIndex && Math.abs(sheet[i] ?? 0) === 2) n++;
  });
  return n;
}

/** Only axes outside the middle band name a position; a midpoint is not a conviction. */
export function headline(scores: number[], sheet: Sheet | null = null): string {
  const out = scores
    .map((s, i) => ({ i, d: Math.abs(s - 50), b: band(s) }))
    .filter(x => x.b !== 2);
  if (!out.length) return 'Near the center on every axis';
  out.sort(
    (a, b) =>
      b.d - a.d ||
      strongCount(sheet, b.i) - strongCount(sheet, a.i) ||
      a.i - b.i
  );
  const str = out.slice(0, 3).map(x => AXES[x.i].bands[x.b]).join(', ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export interface Match {
  name: string;
  slug: string;
  position: number[];
  distance: number;
  match: number;
}

export function nearest(scores: number[]): Match[] {
  return TRADITIONS.map(t => {
    let sum = 0;
    for (let i = 0; i < AXIS_COUNT; i++) {
      const d = t.position[i] - scores[i];
      sum += d * d;
    }
    const distance = Math.sqrt(sum);
    return {
      name: t.name,
      slug: t.slug,
      position: t.position,
      distance,
      match: Math.max(0, Math.round(100 - (distance / SCORING.maxDistance) * 100))
    };
  }).sort((a, b) => a.distance - b.distance);
}

export type NearestKind = 'central' | 'loose' | 'tie' | 'near';

export function nearestState(scores: number[], near: Match[]): { kind: NearestKind; names: string[] } {
  const names = [near[0]?.name, near[1]?.name].filter(Boolean) as string[];
  if (scores.every(s => Math.abs(s - 50) <= SCORING.centerUnits)) return { kind: 'central', names: [] };
  if (near[0].distance > SCORING.hedgeUnits) return { kind: 'loose', names };
  if (near[1] && Math.abs(near[1].distance - near[0].distance) <= SCORING.tieUnits) return { kind: 'tie', names };
  return { kind: 'near', names };
}

export function nearestLine(scores: number[], near: Match[]): string {
  const st = nearestState(scores, near);
  if (st.kind === 'central') return 'Near the center on every axis, so no tradition is named';
  if (st.kind === 'loose') return `No listed tradition is a close fit. Nearest, loosely: ${st.names.join(', ')}`;
  return `Nearest on the map${st.kind === 'tie' ? ' (jointly)' : ''}: ${st.names.join(' · ')}`;
}

/**
 * Permalink codes. The radix is the number of scores an axis can actually take
 * (4 items per axis + 1), so every reachable result round-trips exactly.
 */
const RADIX = SCORING.radix;
const STEPS = RADIX - 1;
const MAX_N = Math.pow(RADIX, AXIS_COUNT);
const CODE_LENGTH = Math.max(6, MAX_N.toString(36).length);

export function encode(scores: number[]): string {
  let n = 0;
  for (let i = 0; i < AXIS_COUNT; i++) {
    const step = Math.max(0, Math.min(STEPS, Math.round((scores[i] * STEPS) / 100)));
    n = n * RADIX + step;
  }
  return n.toString(36).toUpperCase().padStart(CODE_LENGTH, '0');
}

export function decode(code: string): number[] | null {
  if (!/^[0-9A-Z]+$/i.test(code) || code.length !== CODE_LENGTH) return null;
  let n = parseInt(code, 36);
  if (!Number.isFinite(n) || n < 0 || n >= MAX_N) return null;
  const out: number[] = [];
  for (let i = 0; i < AXIS_COUNT; i++) {
    out.unshift(Math.round(((n % RADIX) * 100) / STEPS));
    n = Math.floor(n / RADIX);
  }
  return n === 0 ? out : null;
}

const EMOJI = ['⚖️', '🍞', '🔥', '👑', '📜', '🎵'];

/** Bar first so the lines align; one filled slot marks the position between the poles. */
export function shareText(scores: number[], code: string, near: Match[], origin: string): string {
  const lines = ['My Theology Compass'];
  AXES.forEach((a, i) => {
    const at = Math.max(0, Math.min(10, Math.round(scores[i] / 10)));
    let bar = '';
    for (let k = 0; k < 11; k++) bar += k === at ? '●' : '○';
    lines.push(`${EMOJI[i] ?? '·'} ${bar} ${a.name}: ${a.left} → ${a.right}`);
  });
  const st = nearestState(scores, near);
  lines.push(nearestLine(scores, near) + (st.kind === 'near' || st.kind === 'tie' ? ' (approximate)' : ''));
  lines.push(`${origin}/r/${code}`);
  return lines.join('\n');
}

export const axisBySlug = (slug: string) => AXES.find(a => a.slug === slug);
export const traditionBySlug = (slug: string) => TRADITIONS.find(t => t.slug === slug);
