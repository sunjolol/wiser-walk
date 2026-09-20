/**
 * Bipolar axes scored to 0..100, matched to named positions by Euclidean distance.
 * This is the Theology Compass's strategy. Every threshold here came out of the
 * fairness audit — see audit/fairness-report.md before changing any of them.
 */
import { makeCodec } from '../engine/codec';
import { notesFor, outcomeNoun } from '../engine/types';
import type {
  AxisMask, BipolarRow, BipolarView, HeadlinePart, Quiz, ScoringStrategy, Sheet
} from '../engine/types';

/** Items per group fixes the raw range, so a group with more items still maps to 0..100. */
function spanOf(quiz: Quiz, group: number): number {
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n++;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length, quiz.codePrefix ?? '');
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

/**
 * The headline's clauses, strongest lean first, each carrying the side it leans to.
 * Same ordering rule as headline(); that function is now a join of these.
 */
export function headlineParts(
  quiz: Quiz,
  values: number[],
  sheet: Sheet | null = null
): HeadlinePart[] {
  const out = values
    .map((s, i) => ({ i, d: Math.abs(s - 50), b: band(s) }))
    .filter(x => x.b !== MIDDLE_BAND);
  if (!out.length) return [{ text: 'Near the center on every axis', side: 'centre' }];
  out.sort(
    (a, b) =>
      b.d - a.d ||
      strongCount(quiz, sheet, b.i) - strongCount(quiz, sheet, a.i) ||
      a.i - b.i
  );
  return out.slice(0, 3).map((x, n) => {
    const raw = quiz.groups[x.i]!.bands?.[x.b] ?? quiz.groups[x.i]!.name;
    return {
      text: n === 0 ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw,
      side: (values[x.i] ?? 50) < 50 ? 'left' : 'right'
    };
  });
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
  /** How many axes this outcome was actually measured on, and out of how many. */
  axes: number;
  ofAxes: number;
}

/**
 * How many axes an outcome is PLACED on, whoever is reading. An outcome with no mask is
 * placed on all of them — the Compass, where a tradition has a position on every axis by
 * construction. Not the same number as a Match's `axes`, which is what one reader and this
 * outcome had in common.
 */
export function shownAxes(quiz: Quiz, o: { mask?: AxisMask[] }): number {
  if (!o.mask) return quiz.groups.length;
  let n = 0;
  for (let i = 0; i < quiz.groups.length; i++) if (o.mask[i] === 'shown') n++;
  return n;
}

/**
 * Is this quiz matched on evidence rather than on every axis? True as soon as one outcome
 * declares a mask. The Compass declares none, so it is false there and the whole of the
 * policy below is inert — its arithmetic is what it has always been.
 */
export const isEvidenceMasked = (quiz: Quiz) => quiz.outcomes.some(o => o.mask);

/**
 * Distance from a reader to each outcome, nearest first.
 *
 * EVIDENCE-MASKED MATCHING: AN AXIS COUNTS ONLY WHERE BOTH SIDES NAME A POSITION.
 *
 * On the outcome's side that is the mask (see AxisMask): an axis the source does not place
 * them on is skipped, rather than being read as a coordinate of 50. Treating "the text does
 * not show this" as "sits exactly in the middle" is a false claim about that person, and it
 * hands every moderate reader to whichever outcome is least evidenced.
 *
 * On the READER's side it is the same rule, and for the same reason. This instrument
 * already says that a score of 41-59 names no position: the rails draw it as a hatched
 * zone, the headline drops those axes, and the result page prints "names no position" in
 * so many words. Using such a score as a coordinate anyway — and calling a reader who
 * named nothing "a close match for the one person who happens to sit at 50" — is the same
 * error pointing the other way. Measured over ten thousand sheets it is also the larger
 * half of the problem: masking only the outcome's side moved the commonest result from 21%
 * of readers to 22%, and masking both sides moved it to 10%.
 *
 * The sum is a root mean square over the axes that counted, rescaled by the number of
 * groups, so an outcome measured on three axes and one measured on six are on the same
 * scale and the tie, hedge and max-distance thresholds keep meaning what they meant. When
 * nothing is masked, `counted` is every group and the expression is exactly sqrt(sum) —
 * the Compass's arithmetic, bit for bit, which is why the branch below is explicit.
 *
 * A reader who names no position anywhere can be measured against nobody, and every
 * distance is Infinity. That is the `central` state, which names nobody in any case.
 */
export function nearest(quiz: Quiz, values: number[]): Match[] {
  const maxDistance = quiz.config.maxDistance;
  const n = quiz.groups.length;
  const symmetric = isEvidenceMasked(quiz);
  const claimed = values.map(v => !namesNoPosition(v ?? 50));
  return quiz.outcomes
    .filter(o => Array.isArray(o.position))
    .map(o => {
      const position = o.position!;
      const mask = o.mask;
      let sum = 0;
      let counted = 0;
      for (let i = 0; i < n; i++) {
        if (mask && mask[i] !== 'shown') continue;
        if (symmetric && !claimed[i]) continue;
        const d = (position[i] ?? 50) - (values[i] ?? 50);
        sum += d * d;
        counted++;
      }
      // An outcome that claims nothing anywhere cannot be anybody's nearest. The registry
      // rejects one at build time; this keeps the arithmetic honest if one ever got through.
      const distance =
        counted === 0 ? Infinity : Math.sqrt(counted === n ? sum : (sum * n) / counted);
      return {
        name: o.name,
        slug: o.slug,
        position,
        distance,
        match: Math.max(0, Math.round(100 - (distance / maxDistance) * 100)),
        axes: counted,
        ofAxes: n
      };
    })
    /*
     * Distance decides, but an outcome there was almost nothing to compare on does not get
     * to win on it. Being four units away on ONE axis out of six is a coincidence, not a
     * likeness, and because a smaller comparison is a noisier one those outcomes would win
     * more often than their share — the same failure as the unmasked 50s, one level down.
     * So anything under the floor sinks below everything above it, and if nothing clears
     * the floor the state hedges (see nearestState). `minMatchAxes` defaults to 0, which
     * every outcome clears, so this comparator falls straight through to distance on the
     * Compass and on any quiz that has not set it.
     */
    .sort((a, b) => {
      const floor = quiz.config.minMatchAxes ?? 0;
      return (b.axes >= floor ? 1 : 0) - (a.axes >= floor ? 1 : 0) || a.distance - b.distance;
    });
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
  /*
   * Too little in common to compare. Under evidence-masked matching a reader is measured
   * against an outcome only where both of them name a position, and that can come down to
   * one axis — a reader who lands in the no-position band five times over, against a figure
   * the text places on four. Being four units away on one axis out of six is not "nearest
   * on the map", so it hedges instead. Quizzes that set nothing here are unaffected, and on
   * the Compass every match is measured on every axis in any case.
   */
  if (near[0].axes < (quiz.config.minMatchAxes ?? 0)) return { kind: 'loose', names };
  if (near[1] && Math.abs(near[1].distance - near[0].distance) <= quiz.config.tieUnits) {
    return { kind: 'tie', names };
  }
  return { kind: 'near', names };
}

/**
 * Which outcomes this result PRINTS BY NAME, in order, by slug.
 *
 * Nobody where every axis sits in the no-claim band; otherwise the names nearestLine()
 * prints, which is two in every other state ("Nearest on the map: Abraham · Jesus"). The
 * second name in the near state is context for the first, not a second verdict, and the page
 * emphasises one card there. But an outcome's note goes wherever its NAME goes: the line is
 * what gets pasted into a chat, and "· Jesus" without his sentence beside it is the same
 * bare name whichever side of the dot it sits on.
 */
export function namedNearest(kind: NearestKind, near: Match[]): string[] {
  if (kind === 'central') return [];
  return near.slice(0, 2).map(m => m.slug);
}

/**
 * The one-line verdict. The noun comes from the quiz: the Compass's outcomes are traditions
 * and it says so, and a quiz whose outcomes are people says "figure" in the same sentences.
 * `outcomeNoun` defaults to "tradition", so the Compass's two lines are unchanged.
 */
export function nearestLine(quiz: Quiz, values: number[], near: Match[]): string {
  const st = nearestState(quiz, values, near);
  const noun = outcomeNoun(quiz);
  if (st.kind === 'central') return `Near the center on every axis, so no ${noun} is named`;
  if (st.kind === 'loose') return `No listed ${noun} is a close fit. Nearest, loosely: ${st.names.join(', ')}`;
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
    const kind = nearestState(quiz, values, near).kind;
    const steps = Math.max(1, quiz.config.radix - 1);
    const rows: BipolarRow[] = quiz.groups.map((g, i) => {
      const value = values[i] ?? 50;
      return {
        step: Math.round((value * steps) / 100),
        steps,
        key: g.key,
        slug: g.slug,
        name: g.name,
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
      state: kind,
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      named: namedNearest(kind, near),
      headline: headline(quiz, values),
      headlineParts: headlineParts(quiz, values),
      summary: nearestLine(quiz, values, near),
      rows,
      noClaimRange: noClaimRange(),
      noClaimSpan: noClaimSpan(quiz),
      /*
       * `axes` travels with the ranking so a page can say what the match was made on. It is
       * added only where an outcome is masked: on the Compass every outcome is measured on
       * every axis, the sentence would be noise, and the object has to stay what it was.
       */
      ranked: near.map(m =>
        m.axes === m.ofAxes
          ? { name: m.name, slug: m.slug, score: m.match }
          : { name: m.name, slug: m.slug, score: m.match, axes: m.axes, ofAxes: m.ofAxes }
      )
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
      lines.push(`${bar} ${g.name}: ${g.left} → ${g.right}`);
    });
    const near = nearest(quiz, values);
    const st = nearestState(quiz, values, near);
    lines.push(
      nearestLine(quiz, values, near) +
        (st.kind === 'near' || st.kind === 'tie' ? ' (approximate)' : '')
    );
    /*
     * An outcome's own sentence goes with its name, here as on the page and on the card.
     * Pasted into a chat, "nearest: Jesus" without the sentence beside it is the boast the
     * sentence exists to prevent. A quiz whose outcomes carry no notes — the Compass — adds
     * no lines at all, so its share text is byte for byte what it was.
     */
    for (const note of notesFor(quiz, namedNearest(st.kind, near))) lines.push(note);
    lines.push(`${origin}/r/${quiz.slug}/${this.encode(quiz, values)}`);
    return lines.join('\n');
  }
};
