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
  history?: Array<{ when: string; what: string }>;
  passages?: string[];
  readMore?: string[];
}

/** A named result: a tradition, a spiritual gift, a besetting sin, a biblical figure. */
export interface Outcome {
  name: string;
  slug: string;
  /** Bipolar strategies place outcomes in group-space; category strategies do not. */
  position?: number[];
  description?: string;
}

/** One row of the result display: a filled slot between two poles, or a bare score. */
export interface Bar {
  label: string;
  value: number;
  emoji?: string;
  left?: string;
  right?: string;
  /** Prose for this row, e.g. "62% toward Synergist". */
  lean: string;
}

export interface QuizResult {
  quizSlug: string;
  code: string;
  headline: string;
  /** The one-line verdict: nearest tradition, dominant category, or a hedge. */
  summary: string;
  bars: Bar[];
  ranked: Array<{ name: string; slug: string; score: number }>;
}

/**
 * A scoring strategy turns a sheet into per-group values, and values into a result.
 * Values are always 0..100 per group so the codec and the display stay generic.
 */
export interface ScoringStrategy {
  readonly id: string;
  /** Sheet -> one 0..100 value per group. */
  score(quiz: Quiz, sheet: Sheet): number[];
  /** Values -> everything a result page needs. */
  result(quiz: Quiz, values: number[]): QuizResult;
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
