/**
 * The quiz engine's contracts.
 *
 * A quiz is DATA — items, groups, outcomes, copy — handed to a pluggable scoring
 * strategy. Nothing in this file knows about axes, traditions, or theology; adding
 * "Which deadly sin?" must mean adding a data file, not writing a new app.
 */

/** Answers run -2 (strongly disagree) .. +2 (strongly agree); null is unanswered. */
export type Answer = -2 | -1 | 0 | 1 | 2;
export type Sheet = Array<Answer | null>;

export interface QuizItem {
  /** 1-based position in the instrument. */
  n: number;
  text: string;
  /** Index into quiz.groups — the axis or category this item loads onto. */
  group: number;
  /** Does agreement push toward the group's positive pole? Every group needs both. */
  direction: 1 | -1;
}

/**
 * A group is an axis (bipolar, with two poles) or a category (unipolar, one name).
 * Bipolar-only fields are optional so both strategies can share the shape.
 */
export interface QuizGroup {
  key: string;
  slug: string;
  name: string;
  emoji?: string;
  /** Bipolar axes: the two poles, and the band adjectives across the scale. */
  left?: string;
  right?: string;
  bands?: string[];
  /** Long-form content for the group's own page. */
  summary?: string;
  /**
   * `summary`, split by pole and verified sentence-by-sentence at build time. Present only
   * for bipolar groups, and only when the split could be made safely; a group without it
   * renders its summary whole rather than guessing which half belongs to whom.
   */
  summaryParts?: SummaryParts;
  history?: Array<{ when: string; what: string }>;
  passages?: string[];
  readMore?: ReadMore;
}

/**
 * Further reading. A bipolar group's list is split by pole because its SOURCES are —
 * Bondage of the Will argues one side and Arminius the other, and pretending otherwise
 * would misattribute a real book to a position its author opposed. A unipolar group has
 * no pole to split by, so its list is flat. Both shapes are read through the helpers
 * below; nothing should test `.length` on this type directly.
 */
export type ReadMore = string[] | { left: string[]; right: string[] };

export interface SummaryParts {
  /** The left pole's case, in its own holders' words. */
  left: string;
  /** The right pole's case, likewise. */
  right: string;
  /** Genuine middle ground, where the audited prose describes one. Belongs to neither pole. */
  between: string;
  /** A note about how the instrument is built. Methodology, never one pole's argument. */
  caution: string;
}

export const isSplitReadMore = (r: ReadMore | undefined): r is { left: string[]; right: string[] } =>
  Boolean(r) && !Array.isArray(r);

/** Every entry, in reading order, whatever shape the data came in. */
export function readMoreAll(r: ReadMore | undefined): string[] {
  if (!r) return [];
  return Array.isArray(r) ? r : [...r.left, ...r.right];
}

/** A named result: a tradition, a spiritual gift, a besetting sin, a biblical figure. */
export interface Outcome {
  name: string;
  slug: string;
  /** Bipolar strategies place outcomes in group-space; category strategies do not. */
  position?: number[];
  description?: string;
}

/**
 * What the renderer receives. The SHAPE IS DECLARED, not inferred.
 *
 * The Compass is BIPOLAR: each axis runs between two named poles, and a middle band means
 * the instrument names no position. Every other planned quiz — spiritual gifts, the seven
 * deadly sins, who-you-are-like-in-the-Bible — is UNIPOLAR: categories ranked by strength,
 * with no poles, no centre and no no-claim band. Almost every bipolar design decision is
 * meaningless for those.
 *
 * The previous shape had `left?`/`right?` as optional fields and the page branched on
 * whether `left` happened to be truthy. A presence check standing in for a shape
 * declaration is how unipolar data ends up wearing a bipolar chassis, so the union below
 * is discriminated on `shape` and a bipolar row's poles are REQUIRED.
 *
 * A third shape (similarity-to-a-figure, or right/wrong Bible knowledge) is added by
 * adding a member here and a case in the renderer; no existing case changes.
 */
export interface ResultRowBase {
  key: string;
  /** The URL identity. Never `key` — on the Compass they differ on two of six axes. */
  slug: string;
  name: string;
  emoji?: string;
  /** 0..100. For bipolar this is a POSITION; for unipolar a MAGNITUDE. */
  value: number;
}

export interface BipolarRow extends ResultRowBase {
  /** Both poles, always. A pole encoded by omission is the failure this type prevents. */
  left: string;
  right: string;
  /** The audited band adjective for this score. */
  band: string;
  /** Distance from the midpoint as a share of the half-axis, e.g. "34% toward Monergist". */
  lean: string;
  /** Inside the band where the instrument names no position. */
  noClaim: boolean;
}

export interface UnipolarRow extends ResultRowBase {
  /** 1-based position in the ranking. */
  rank: number;
  /** e.g. "62% pull" — a share of the half-scale, never a probability or a percentile. */
  strength: string;
}

export interface Ranked {
  name: string;
  slug: string;
  score: number;
}

interface ViewBase {
  quizSlug: string;
  code: string;
  headline: string;
  /** The one-line verdict: nearest outcome, dominant category, or an honest hedge. */
  summary: string;
  ranked: Ranked[];
}

/**
 * `state` is what the renderer switches on for every edge case, so a new state cannot be
 * introduced without the renderer failing to compile on the missing branch.
 *
 *   near    — one outcome is clearly nearest
 *   tie     — two are level within the audited tie threshold
 *   loose   — nothing is a close fit; nearest is named as a loose neighbour only
 *   central — every axis sits in the no-claim band, so nothing is named at all
 */
export type BipolarState = 'near' | 'tie' | 'loose' | 'central';

/**
 *   clear — one category is ahead
 *   tie   — the top two are level
 *   flat  — nothing stands out. NOT a "centre": there is no centre in a ranking.
 */
export type UnipolarState = 'clear' | 'tie' | 'flat';

export interface BipolarView extends ViewBase {
  shape: 'bipolar';
  state: BipolarState;
  rows: BipolarRow[];
  /** The inclusive score range in which no position is named, e.g. [41, 59]. */
  noClaimRange: [number, number];
}

export interface UnipolarView extends ViewBase {
  shape: 'unipolar';
  state: UnipolarState;
  /** In quiz order, so the rows do not jump between two results. `rank` carries the order. */
  rows: UnipolarRow[];
}

export type ResultView = BipolarView | UnipolarView;

/**
 * A scoring strategy turns a sheet into per-group values, and values into a result.
 * Values are always 0..100 per group so the codec and the display stay generic.
 */
export interface ScoringStrategy {
  readonly id: string;
  /** Declared here so the registry can reject a quiz that supplies the other shape's data. */
  readonly shape: ResultView['shape'];
  /** Sheet -> one 0..100 value per group. */
  score(quiz: Quiz, sheet: Sheet): number[];
  /** Values -> everything a result page needs, with its shape declared. */
  result(quiz: Quiz, values: number[]): ResultView;
  encode(quiz: Quiz, values: number[]): string;
  decode(quiz: Quiz, code: string): number[] | null;
  shareText(quiz: Quiz, values: number[], origin: string): string;
}

export interface Quiz {
  slug: string;
  title: string;
  /** One line under the title on the hub. */
  tagline: string;
  description: string;
  emoji: string;
  minutes: number;
  /** 'live' appears on the hub and is indexable; 'draft' is reachable but noindex. */
  status: 'live' | 'draft';
  /** Shown at the top of a draft quiz, so nothing unvetted reads as finished. */
  draftNote?: string;
  items: QuizItem[];
  groups: QuizGroup[];
  outcomes: Outcome[];
  strategy: ScoringStrategy;
  /** Strategy-specific numbers: radix, maxDistance, tie/hedge/center thresholds. */
  config: Record<string, number>;
  /** First line of the share text, e.g. "My Theology Compass". */
  shareTitle: string;
}

export const isLive = (q: Quiz) => q.status === 'live';
