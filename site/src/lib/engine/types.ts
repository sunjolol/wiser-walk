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
  /**
   * The passage(s) this group is named FROM, quoted verbatim, with the reference and the
   * translation the quotation was taken from.
   *
   * Deliberately not `passages`: that list is headed "Passages both sides argue from",
   * carries no text of its own and is assigned to neither pole. A gift's listing verse is
   * the opposite — it is the definition, it is quoted, and it belongs to this group alone.
   */
  quoted?: Array<{ ref: string; text: string }>;
  /** The translation `quoted` was taken from, named on the page beside it. */
  quotedFrom?: string;
  /**
   * Recorded acts that show what this group has looked like, each a reference and one
   * neutral sentence. Never a quotation unless `quoted` carries it, and never a timeline:
   * `history` is headed "How the argument unfolded", which is false for these.
   */
  acts?: Array<{ ref: string; what: string }>;
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

/**
 * What an outcome's coordinate on one axis is actually claiming.
 *
 *   shown  the source places this outcome somewhere on this axis, and the coordinate says
 *          where. Only these axes count when a reader is matched.
 *   none   the source shows nothing here. The coordinate is 50 because 50 is the middle of
 *          the scale, NOT because the outcome sits in the middle.
 *   both   the source shows this outcome at BOTH ends, and the two do not resolve into a
 *          position. Also honestly at the centre, and also not a measurement of anything.
 *
 * `none` and `both` are the two reasons a coordinate can be a non-claim, and they must be
 * told apart on the page — "the text does not show this" and "the text shows both ends"
 * are different sentences about a person. They behave identically in the arithmetic: a
 * distance is never computed against an axis where the outcome claims nothing, because
 * treating "not shown" as "sits exactly in the middle" is a false claim about that person
 * and hands every moderate reader to whichever outcome is least evidenced.
 */
export type AxisMask = 'shown' | 'none' | 'both';

/** A named result: a tradition, a spiritual gift, a besetting sin, a biblical figure. */
export interface Outcome {
  name: string;
  slug: string;
  /** Bipolar strategies place outcomes in group-space; category strategies do not. */
  position?: number[];
  /**
   * One entry per group, saying which coordinates are claims. OMIT IT ENTIRELY and every
   * axis counts, which is what the Theology Compass does and must keep doing: a tradition's
   * position comes from a survey of the whole instrument, so there is no such thing as an
   * axis a tradition has no position on.
   */
  mask?: AxisMask[];
  description?: string;
  /** One line identifying who or what this is, under the name. Never a virtue word. */
  who?: string;
  /**
   * A sentence that travels with this outcome wherever it is named: under its card when it
   * is the closest, and under the band on its own page. It is data, printed verbatim.
   */
  note?: string;
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
  /** 0..100. For bipolar this is a POSITION; for unipolar a MAGNITUDE. */
  value: number;
}

export interface BipolarRow extends ResultRowBase {
  /**
   * Which of the instrument's reachable positions this is (0..steps). Geometry is drawn
   * from this, not from `value`: `value` is a rounded percentage, so a knob placed at 42%
   * sits a pixel or so off a zone edge computed from the same step. Positioning both from
   * the integer makes them provably coincide.
   */
  step: number;
  steps: number;
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
  /**
   * The reader disagreed with this category's statements on balance. Not "the low end of
   * an axis" — there is no axis — but a distinct answer from "neither pulled you".
   */
  below: boolean;
  /** In words, never a number: see pull() in strategies/category.ts for why. */
  strength: string;
}

export interface Ranked {
  name: string;
  slug: string;
  score: number;
  /**
   * How many axes this outcome was measured on, where that is fewer than all of them —
   * see AxisMask. Absent when every axis counted, which is every outcome on the Compass.
   */
  axes?: number;
  ofAxes?: number;
}

/** One clause of the headline, with the side it leans to, so it can be coloured. */
export interface HeadlinePart {
  text: string;
  side: 'left' | 'right' | 'centre';
}

interface ViewBase {
  quizSlug: string;
  code: string;
  headline: string;
  /**
   * The headline broken into its clauses. The first thing a reader sees should say where
   * they lean in the same two colours the compass and the rails use, so the three agree
   * without anyone having to be told they do.
   */
  headlineParts: HeadlinePart[];
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
  /** The inclusive SCORE range in which no position is named, e.g. [41, 59]. For prose. */
  noClaimRange: [number, number];
  /**
   * The same band as a share of the track (0..100), snapped outward to half a step past the
   * outermost reachable positions inside it. For GEOMETRY.
   *
   * At radix 13 the band contains steps 5, 6 and 7 (scores 42, 50, 58), so the zone runs
   * 37.5%-62.5% rather than 41%-59%. Drawn at 41% the knob for a score of 42 would sit a
   * pixel inside the edge of the zone it belongs to, which reads as "just outside".
   */
  noClaimSpan: [number, number];
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

/**
 * Copy a unipolar quiz supplies for itself, because the strategy's defaults were written
 * for VICES. "Leaned away" printed beside "Be hospitable to one another" reads as a verdict
 * on the reader, and a bare one-word headline ("Hospitality") reads as one too. A quiz that
 * sets nothing here keeps the strategy's own words exactly.
 */
export interface UnipolarCopy {
  /** Replaces pull()'s words: below no-net-agreement, level with it, then four rising. */
  strength?: { below: string; level: string; above: [string, string, string, string] };
  /** Put in front of the leader's name, so the largest type is not a bare verdict. */
  headlineLead?: string;
  /** Replaces the strategy's flat-state summary. */
  flat?: string;
  /** How many rows the share text prints, highest first. Omit for all of them. */
  shareTop?: number;
}

/**
 * Prose a quiz supplies for pages that would otherwise have to know which quiz they are
 * rendering. Every field is optional and every page falls back to what it printed before.
 */
export interface QuizNotes {
  /** On the quiz's intro, before the preview: what this instrument can and cannot see. */
  intro?: string;
  /** On the result page, under the ranking, in the same place for every reader. */
  result?: string;
  /** What a group coming out low means. Printed only where a low group is shown. */
  low?: string;
  /**
   * The heading and the line above the per-axis panels on the result page. The Compass's
   * are about a disagreement between Christians, which is true of the Compass's axes and
   * false of a quiz whose axes are temperament; a quiz that says nothing keeps them.
   */
  depthTitle?: string;
  depthNote?: string;
  /** Something the quiz leaves out on purpose, and where the disagreement is set out. */
  omitted?: { text: string; linkText?: string; href?: string };
}

export interface Quiz {
  slug: string;
  title: string;
  /** One line under the title on the hub. */
  tagline: string;
  description: string;
  /** A line mark from components/Icon.astro. Never an emoji — see that file. */
  icon: 'compass' | 'flame' | 'scroll' | 'book';
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
  /**
   * 1-3 uppercase letters prefixed to every result code, binding the code to this quiz.
   * Omit ONLY for a quiz whose links are already live — see makeCodec. The registry allows
   * at most one such quiz across the whole site.
   */
  codePrefix?: string;

  /*
   * ---- What this quiz measures a reader AGAINST -------------------------------------
   *
   * The Compass measures distance to traditions, and for a year the pages said so in
   * words: "no tradition is named", "Scored against the listed traditions only", "Where
   * the traditions sit". A quiz whose outcomes are people needed none of those sentences
   * to be rewritten — it needed them to stop being typed into the pages at all.
   *
   * Every field below defaults to the Compass's existing word, so the Compass's output is
   * byte-for-byte what it was before these existed.
   */
  /** Singular, lower case, as it appears mid-sentence: "tradition", "figure". */
  outcomeNoun?: string;
  /** Plural, lower case: "traditions", "figures". Headings capitalise it themselves. */
  outcomeNounPlural?: string;
  /** The sentence under the outcome list saying what the comparison is and is not. */
  outcomeScopeNote?: string;
  /** First URL segment of an outcome's own page: /tradition/<slug>/, /figure/<slug>/. */
  outcomePathBase?: string;
  /**
   * NEVER PRINT A NUMBER BESIDE AN OUTCOME.
   *
   * The site's standing rule kills any person-to-person or person-to-saint percentage, and
   * "84% like Jesus" is the clearest case of why. Where this is set, every surface — the
   * outcome cards, the result page, the outcome's own page, the compare page, the share
   * text and the share card — ranks in words and keeps the bar length, and shows no score.
   */
  hideOutcomeScore?: boolean;

  /** Copy this quiz supplies for its own pages; see QuizNotes. */
  notes?: QuizNotes;
  /** Unipolar copy that replaces the vice-shaped defaults; see UnipolarCopy. */
  unipolarCopy?: UnipolarCopy;
}

export const isLive = (q: Quiz) => q.status === 'live';

/** The Compass's words, and the default for every quiz that does not say otherwise. */
export const outcomeNoun = (q: Quiz) => q.outcomeNoun ?? 'tradition';
export const outcomeNounPlural = (q: Quiz) => q.outcomeNounPlural ?? 'traditions';
export const outcomePathBase = (q: Quiz) => q.outcomePathBase ?? 'tradition';
/** For a heading or a tile label: "Traditions", "Figures". */
export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Where a score is not printable, the position is still worth saying — in words, because a
 * rank is not a measurement of a person. "Closest" is the only one that claims anything.
 */
const RANK_WORDS = ['Closest', 'Next', 'Third', 'Fourth', 'Fifth', 'Sixth'];
export const rankWord = (i: number) => RANK_WORDS[i] ?? 'Further off';
