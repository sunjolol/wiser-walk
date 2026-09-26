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
  /**
   * ---- What a person who arrived from a search came for -----------------------------
   *
   * All four are optional, all four are generic (an axis or a gift), and all four are
   * rendered as VISIBLE text on the group's page in one place, pages/axis/[quiz]/[axis].
   * A group that sets none of them produces the page it produced before these existed.
   *
   * They exist because the pages used to open on the site's own filing vocabulary and
   * bury the answer under it. Someone typing "have the gifts ceased" wants the answer in
   * the first screen, in words they used themselves; a search engine wants the same thing
   * in plain HTML under a heading, which is why none of this hides behind a pop-out.
   */
  /** The question a searcher types, used as the H2 over the answer block. Plain words. */
  question?: string;
  /** 40 to 50 words answering it, with both views named where there are two. */
  shortAnswer?: string;
  /** Two or three sentences: what actually changes depending on the answer. */
  whyItMatters?: string;
  /**
   * Up to three true, specific, interesting details. `source` is what it was checked
   * against — a confession, a council, a date, a named work — and is printed small beside
   * the text, because a surprising claim with nothing behind it is the one thing these
   * pages cannot afford.
   */
  didYouKnow?: Array<{ text: string; source: string }>;
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
  /**
   * What to call that list, where "What it has looked like" and "N recorded acts, each
   * cited" would be FALSE.
   *
   * The gifts draft has two: the New Testament calls no act a word of knowledge, and Acts
   * never shows anyone interpreting tongues, so both summaries say the passages below are
   * not acts — and a heading counting them as acts would contradict the paragraph directly
   * above it. A group that says nothing keeps the page's own words exactly.
   */
  actsHeading?: string;
  actsKicker?: string;
  /**
   * ---- A group's own page, drawn like a person's (the sins, 2026-09-25) ---------------
   *
   * The owner found the sins' pages "super incomplete" beside the saint pages: one plate for
   * all seven and a lower-case word for a heading. So a group may carry its own picture,
   * drawn across the whole band in colour (`posM` for a phone, `posD` for a wide screen), a
   * few facts at a glance printed as the band's tiles (words, not counts), and a title for
   * search where the name alone says too little ("pride" was the whole <title>). The same
   * picture is the band of a result that ranks this group first.
   */
  title?: string;
  band?: { src: string; alt: string; posM: string; posD: string; credit: string };
  glance?: Array<{ n: string; label: string }>;
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
  /**
   * The slugs this result prints BY NAME, in the order it prints them — none where nothing
   * is named; on a ranked quiz one where one leads and several where several came out level;
   * on a matched quiz the names its one-line verdict prints, because an outcome's note goes
   * wherever its name goes.
   *
   * It exists so that the surfaces which print a name (the share text, the share card, the
   * ranking) do not each decide for themselves how many names a state is worth. On a matched
   * quiz these are outcome slugs; on a ranked one they are category slugs, and a ranked quiz
   * that also lists outcomes must key them by the same slug or `resultNotes` will miss them.
   */
  named: string[];
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

/**
 * THE THIRD SHAPE: a reading.
 *
 * "Which Psalm are you living right now?" does not measure anything along axes or rank
 * categories. It asks a few even-handed questions and matches the answers to ONE situation
 * St Athanasius named in his Letter to Marcellinus, whose advice is a psalm. The person
 * confirms the match themselves before they see it ("Does this sound like you?"), so the
 * result is a single situation, never a score. Its rows and ranking are empty on purpose:
 * every surface that draws rows or a ranking draws nothing for it.
 *
 * `situation` is the stable key (P3, P42S) that the result code carries; `psalm` is the
 * English-numbered psalm it leads with, or the first of a set.
 */
export interface ReadingView extends ViewBase {
  shape: 'reading';
  state: 'clear';
  situation: string;
  psalm: number;
  rows: [];
}

/**
 * THE FOURTH SHAPE: kindred spirits.
 *
 * "Which early Christian thinks like you?" does not place a reader on axes or rank categories.
 * Twenty-three plain statements are compared, one by one, with what twenty-two early Christians
 * are on record as holding, and the result names two PEOPLE: the one whose positions sit nearest
 * (the kindred spirit) and the one who would argue (the sparring partner), each proved by their
 * own words. Nearest by position, never by a percentage: no number is ever printed against a
 * person (`hideOutcomeScore`), so `score` below is for ordering only.
 *
 * The matching is a port of the design's score.js (see strategies/kindred.ts). A statement
 * counts between the reader and a person only where BOTH take a side: "Not sure" is never
 * compared, and neither is a question the person is not on record on.
 */

/** One statement as it stands between the reader and one early Christian. */
export interface KindredCell {
  /** The statement's id ('laugh', 'war'), as the quiz's data and its groups' keys spell it. */
  id: string;
  /** The reader's answer, -2 (strongly disagree) .. 2. Never 0: "Not sure" is never compared. */
  a: Answer;
  /** Their recorded position, -2 .. 2. Never 0: a middle view is not stored. */
  v: Answer;
}

/**
 * One early Christian as this reader's answers meet them. Extends Ranked, so the view's `ranked`
 * is these, likest first, and every generic surface that reads `ranked` still can.
 */
export interface KindredPerson extends Ranked {
  /** The key in the quiz's data (src/data/which-early-christian.json): 'augustine'. */
  key: string;
  /** The URL identity: /early-christian/<slug>/. `slug` and `name` come from Ranked. */
  short: string;
  /** For "he" or "she" in the copy. */
  she: boolean;
  /** How many statements the reader and this person both take a side on. */
  shared: number;
  /** Where the two lean the same way, the ones that made the match first (score.js's order). */
  agree: KindredCell[];
  /** Where the two lean opposite ways, the sharpest clash first (score.js's order). */
  clash: KindredCell[];
}

/**
 * What the result shows, chosen exactly as the owner's approved preview chooses it
 * (design/quiz-ideas/fathers/preview/app.js, draft 4). Every entry is a statement id whose line
 * is SHOWN for that person (a hidden line counts in the matching but is never printed).
 */
export interface KindredShow {
  /** "Where you think alike": up to three of the kindred spirit's agreements, not the face-off. */
  alike: string[];
  /** "Where he would push back": the kindred spirit's sharpest real clash, if there is one. */
  pushBack: string | null;
  /**
   * "Face to face on <topic>": the first statement, in play order, that the reader answered
   * STRONGLY and on which the kindred spirit and the sparring partner stand on opposite sides,
   * both with a line shown. Null when there is no sparring partner or no such statement.
   */
  face: string | null;
  /** "Where he would argue with you": up to three of the sparring partner's clashes, not the face-off. */
  argue: string[];
  /** "Where you would agree": the sparring partner's first agreement with a line, if any. */
  agree: string | null;
  /** "Also close": the next two people with any agreement, each with the topic of their top shown line. */
  also: Array<{ key: string; slug: string; on: string | null }>;
  /** The line on the share card: the first of the kindred spirit's top four shown agreements
   *  that is 170 characters or less, else the shortest of the four. */
  card: string | null;
  /** The card's "We agree on" chips: the kindred spirit's top three shown agreements. */
  cardTopics: string[];
  /** The card's "on ..." under the sparring partner: their top three shown clashes. */
  sparringTopics: string[];
}

export interface KindredView extends ViewBase {
  shape: 'kindred';
  /**
   *   matched — a kindred spirit is named (a sparring partner may or may not be)
   *   thin    — nobody shares enough answered statements to be named: the honest
   *             "Not enough to go on", which names nobody
   */
  state: 'matched' | 'thin';
  /** Every statement id, -2 .. 2, with 0 for "Not sure". In play order. */
  answers: Record<string, Answer>;
  kindred: KindredPerson | null;
  sparring: KindredPerson | null;
  /** Everyone, likest first, however little the reader shares with them (score.js's ranked). */
  ranked: KindredPerson[];
  /** Null exactly when the state is 'thin'. */
  show: KindredShow | null;
  rows: [];
}

/**
 * THE FIFTH SHAPE: a personality portrait.
 *
 * The Christian Personality Test does not place a reader on axes to match a tradition, rank
 * categories, read a situation or find a kindred spirit. Seventy-two quick choices are scored
 * by the design's own score.mjs (see strategies/personality.ts) into ONE of eight types (St
 * Gregory the Great's four dispositions, each with a quiet or a restless mind), and a
 * ten-page report around it. Nothing on it is a percentage against a person.
 *
 * Twelve of the questions are private. Their answers never enter a code, a URL, the account
 * database or the server: a result link carries the public answers and only the six facts
 * `derive()` works out from the private ones on the device (PersonalityFacts). The private
 * page itself is drawn only in the browser that took the test.
 */

/** The public answers: every two-sided item -3..3 (b3 included), and the two picks as lists of lines. */
export type PersonalityAnswers = Record<string, number | string[]>;

/** The six facts score.mjs's derive() reduces the twelve private answers to. All a link carries of them. */
export interface PersonalityFacts {
  lowCheer: boolean;
  lowSer: boolean;
  lowConf: boolean;
  /** Gregory's four kinds of anger (Moralia V.80): kindled reeds, slow and brief, quick and lasting, hard wood. */
  angerCell: 'reeds' | 'brief' | 'worst' | 'wood';
  angerMiddle: boolean;
  hardToCorrect: boolean;
}

/** The private page's scores (Cassian's eight thoughts). Only ever computed on the device that took the test. */
export interface PersonalityThoughts {
  scores: Record<string, number>;
  order: string[];
  lead: string;
  least: string;
  none: boolean;
  several: string[] | null;
  close: string | null;
  bars: Record<string, number>;
}

/** What score.mjs's score() returns, field for field. With the facts in place of the private answers, `thoughts` is null. */
export interface PersonalityReport {
  /** Every scale from -1 (its left pole) to +1 (its right pole). */
  scales: Record<string, number>;
  type: string;
  disposition: string;
  secondDisposition: string;
  makeup: 'quiet' | 'restless';
  closeCalls: Array<{ kind: 'balanced' } | { kind: 'disposition'; type: string; second: string } | { kind: 'makeup'; type: string }>;
  trap: string;
  trapSwapped: boolean;
  trapQuiet: boolean;
  leanings: Array<{ key: string; value: number; side: 'left' | 'right' | 'middle'; pole: string | null }>;
  strongest: Array<{ key: string; pole: string; value: number }>;
  balanced: Array<{ key: string; label: string }>;
  links: Array<{ id: string; strength: number }>;
  anger: { cell: PersonalityFacts['angerCell']; middle: boolean };
  speaker: { ease: number; weight: number; cell: 'full' | 'fluent' | 'deep' | 'spare'; middle: boolean };
  help: Array<{ key: string; side: 'left' | 'right'; text: string; note: string }>;
  thoughts: PersonalityThoughts | null;
  virtue: string | null;
  partner: 'counsel' | 'fortitude' | null;
  line: { scores: Record<string, number>; lead: string; second: string; why: string[]; behind: number };
}

export interface PersonalityView extends ViewBase {
  shape: 'personality';
  /** The type's key ('hearth', 'stillwater'): also its outcome slug, and what `named` holds. */
  type: string;
  /** The public answers the code carries, rebuilt from it. Never a private answer. */
  answers: PersonalityAnswers;
  /** The six facts the code carries in place of the private answers. */
  pub: PersonalityFacts;
  /** score(answers, pub): the whole public report. Its `thoughts` is always null here. */
  report: PersonalityReport;
  ranked: [];
  rows: [];
}

export type ResultView = BipolarView | UnipolarView | ReadingView | KindredView | PersonalityView;

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
  /**
   * One sentence of `intro`, printed with a start button near the TOP of the intro page.
   *
   * Without it the only start button sits under everything the quiz says about itself, which
   * is right for a quiz that says little. The gifts draft says a great deal (its frame, the
   * disagreement it describes, what it does not score), and on a phone that put the button
   * six screens down. With this set, a reader meets the one sentence that matters and a way
   * in; the full notes stay where they were, below, for the reader who wants them first,
   * and the result page repeats them. A quiz that sets nothing is laid out as it always was.
   */
  introShort?: string;
  /**
   * One line above the answer scale, in the runner, on every statement.
   *
   * For how to READ the statements, never for how to feel about them. The gifts draft's says
   * that disagreeing with a thing that never happened is an honest answer, because without it
   * a reader reaches for "Unsure / neither" on every event statement — and that answer, with
   * "disagree" on the reverse items, scores the same on all six of its disputed rows.
   */
  scale?: string;
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
  /**
   * A disagreement the quiz DESCRIBES and does not settle, printed once with the intro and
   * once with the result, above `omitted` in both places.
   *
   * Separate from `omitted` because they are two different admissions: "these statements have
   * nothing to say about that" is a fact about the instrument, and "Christians reading the
   * same passages disagree" is a fact about Christians. Running them together would read as
   * the second being the reason for the first, which on the gifts draft is now false — all
   * the gifts are in, and the disagreement is described rather than avoided.
   */
  disputed?: { text: string; linkText?: string; href?: string };
  /** Something the quiz leaves out on purpose, and where the disagreement is set out. */
  omitted?: { text: string; linkText?: string; href?: string };
}

/**
 * A sentence that travels with certain GROUP names, by the same rule an Outcome.note travels
 * with an outcome's: wherever one of those names is printed, the sentence is printed once —
 * not once per name, and not at all when none of them is named.
 *
 * It exists because a qualification that appears beside a name on the result page and not on
 * the picture someone posts is the fairness problem, not a formatting detail. The gifts draft
 * is the case it was written for: six of its nineteen gifts are ones Christians disagree
 * about, the quiz takes no side, and the six must therefore carry no badge, chip, grouping or
 * separate section anywhere — nothing is attached to a row. One sentence in one place is the
 * whole of it.
 *
 * A quiz that sets nothing here is byte-for-byte what it was before this existed.
 */
export interface GroupNote {
  /** Group KEYS. Slugs are resolved from the quiz, so a rename cannot silently unhook this. */
  groups: string[];
  /** Under the headline on the result page, and on the share card. */
  result: string;
  /** One line of its own, immediately above the link, in the share text. */
  share: string;
}

export interface Quiz {
  slug: string;
  title: string;
  /** One line under the title on the hub. */
  tagline: string;
  /**
   * One plain line under the title in the header's Quizzes menu (the owner, 2026-09-24: every
   * header menu carries a name and one line). Short enough for one line at 22rem: about 50
   * characters. Required, so a new quiz cannot join the menu without one.
   */
  menu: string;
  /** Written for a search result: it is the page's meta description and its JSON-LD. */
  description: string;
  /**
   * The words in the band on the quiz's own page, where `description` is not what a reader
   * standing in front of the quiz needs. The Compass's search line ends on how the
   * instrument was made, and the gifts quiz's ends on the same sentence its own note
   * repeats directly underneath. Falls back to `description`.
   */
  intro?: string;
  /** A line mark from components/Icon.astro. Never an emoji — see that file. */
  icon: 'compass' | 'flame' | 'scroll' | 'book' | 'apple' | 'users' | 'sparkle';
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
  /**
   * Hand out a six-character link instead of the long code.
   *
   * For a quiz whose code is too long to send comfortably: the gifts quiz's is sixteen
   * characters. The long code is still the result; the short one is a row in Supabase that
   * points at it, made when the reader finishes (see engine/links.ts). Every long link keeps
   * working, and with no table the long one is simply used.
   */
  shortLinks?: boolean;

  /**
   * What to do with a sheet where every answer is the same one.
   *
   * 'centre' means: score it at the middle of every group, so the result names nobody.
   *
   * Opt in only where the arithmetic would otherwise name somebody on no information. The
   * figure quiz is the case it was written for: two of the three statements on each axis are
   * keyed one way and one the other, so a reader who strongly agrees eighteen times lands on
   * 33 or 67 on every axis and is handed a name — and that name is a fact about how the
   * statements were keyed, not about the reader. The Compass sets nothing here and is
   * untouched. See isUniformSheet, and the finish step of pages/q/[quiz].astro, which asks
   * the reader before it does anything.
   */
  uniformSheet?: 'centre';

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
  /**
   * THE RESULT LEADS WITH WHO, NOT WITH THE AXES (a bipolar quiz whose outcomes are people).
   *
   * The owner, 2026-09-25, on the figure quiz: "Alongside, takes time to decide, quick to
   * speak up" in the big letters "doesn't tell you your result". Where this is set the result
   * page's headline is the nearest outcome ("Closest to Peter") with the axis clauses in the
   * smaller line under it; the outcome list stands above the rails; the wheel and its caption
   * are not drawn; the two section kickers go; and the share card draws the people, not the
   * wheel. The Compass sets nothing, so its result page is what it was.
   */
  resultLeadsWithOutcome?: boolean;
  /**
   * The owner's notes on the seven deadly sins (2026-09-25). `quietGroupPages`: the group
   * pages carry no small accent line over any section title, and the summary is the band's
   * lede rather than a section of one sentence. `rankRowsOpen`: on the result, each ranked
   * row opens to its short answer with a pill to its full page (in a new tab), and the key
   * explaining the bars goes, because the rows now say what each one is. Only the sins set
   * them, so every other quiz's pages are what they were.
   */
  quietGroupPages?: boolean;
  rankRowsOpen?: boolean;

  /*
   * ---- What this quiz calls its own GROUPS -------------------------------------------
   *
   * A bipolar quiz's groups are axes and every page already says so. A unipolar quiz's are
   * "categories" by default — the word the seven-deadly-sins draft is counted in — and a
   * quiz whose categories have a real name of their own says it here, so the hub can print
   * "19 gifts" rather than "19 categories". Nothing else changes, and a quiz that sets
   * neither is counted in exactly the words it was counted in before.
   */
  /** Singular, lower case, mid-sentence: "category", "gift". */
  groupNoun?: string;
  /** Plural, lower case: "categories", "gifts". Headings capitalise it themselves. */
  groupNounPlural?: string;

  /** Copy this quiz supplies for its own pages; see QuizNotes. */
  notes?: QuizNotes;
  /** A sentence that travels with certain group names; see GroupNote. */
  groupNote?: GroupNote;
  /** Unipolar copy that replaces the vice-shaped defaults; see UnipolarCopy. */
  unipolarCopy?: UnipolarCopy;

  /**
   * False where two people's results make no sense side by side, so the compare page 404s
   * and no surface offers "See where you land next to them". The Psalm quiz is the case: its
   * result is what someone is going through right now, and setting two of those next to
   * each other would expose it without telling anyone anything. Omitted means comparable.
   */
  comparable?: boolean;
}

export const isComparable = (q: Quiz) => q.comparable !== false;

export const isLive = (q: Quiz) => q.status === 'live';

/**
 * Did the reader give the same answer to every statement?
 *
 * Pure, and about the SHEET alone, so it can be checked headlessly. Three answers are not
 * this: an unfinished sheet (a null anywhere), a sheet with any variation at all, and a
 * sheet of nothing but "Unsure / neither" — which already scores the middle of every group
 * and so already names nobody. What is left is the one pattern that carries no information
 * about the reader and still produces a confident-looking result.
 */
export function isUniformSheet(sheet: Sheet): boolean {
  if (!sheet.length) return false;
  const first = sheet[0];
  if (first === null || first === undefined || first === 0) return false;
  return sheet.every(a => a === first);
}

/** Does this quiz ask for such a sheet to be centred? See Quiz.uniformSheet. */
export const centresUniformSheets = (q: Quiz) => q.uniformSheet === 'centre';

/**
 * The sentences that must travel with a result, in the order it names them.
 *
 * An Outcome.note is data, printed verbatim wherever that outcome is named. The rule is the
 * name: a result that names nobody carries no note, and a result that names two carries one
 * for each of them that has one. Both share surfaces read it from here rather than each
 * deciding for itself, because a sentence that travels with a name on the page and not on
 * the card someone posts is the fairness problem, not a formatting detail.
 */
export function notesFor(quiz: Quiz, slugs: string[]): string[] {
  const byslug = new Map(quiz.outcomes.map(o => [o.slug, o.note]));
  return slugs
    .map(slug => byslug.get(slug))
    .filter((note): note is string => Boolean(note));
}

/** The same, for a caller that already has the finished view. */
export const resultNotes = (quiz: Quiz, view: ResultView): string[] =>
  notesFor(quiz, view.named);

/** The person (or two) a result leads with, and the words said before their names. */
export interface Lead {
  /** "Closest to", "Jointly closest to", or "No close fit. Nearest, loosely:". */
  pre: string;
  names: Ranked[];
  /** The whole line, as the result page's headline and the /me/ card print it. */
  line: string;
  /** The same, shorter, for a page title: "Closest to Daniel and Hannah". */
  short: string;
}

/**
 * WHO a result leads with, where the quiz leads with who (Quiz.resultLeadsWithOutcome: the
 * figure quiz). One rule for every surface that says it: the result page's headline and its
 * <title>, the share sheet's text and the result's card on /me/. The nearest one; both where
 * two are level; both where nothing is close, said so. Null where the quiz does not lead with
 * who, and where nobody is named (every axis in the no-position band): those keep the engine's
 * own headline.
 */
export function leadFor(quiz: Quiz | null | undefined, view: ResultView | null | undefined): Lead | null {
  if (!quiz?.resultLeadsWithOutcome || view?.shape !== 'bipolar' || view.state === 'central') return null;
  const names = view.ranked.slice(0, view.state === 'near' ? 1 : 2);
  if (!names.length) return null;
  const who = names.map(r => r.name).join(' and ');
  const pre =
    view.state === 'loose' ? 'No close fit. Nearest, loosely:'
      : view.state === 'tie' ? 'Jointly closest to'
      : 'Closest to';
  return {
    pre,
    names,
    line: `${pre} ${who}`,
    short: view.state === 'loose' ? `Nearest, loosely: ${who}` : `Closest to ${who}`
  };
}

/**
 * The sentence that travels with a set of group names, if any of them was printed.
 *
 * Returns a list so that every caller can concatenate it onto the outcome notes and keep one
 * rule for both: a note is a whole line of its own, and it sits immediately above the link.
 * It is one sentence however many of the named groups appear, because it is a sentence about
 * the disagreement, not a label on a gift — and a label on a gift is the thing this quiz is
 * forbidden to print.
 *
 * `slugs` is whatever that surface actually printed by name: the view's `named` on the page
 * and the card, the rows the share text chose on the share text.
 */
export function groupNoteFor(
  quiz: Quiz,
  slugs: string[],
  which: 'result' | 'share'
): string[] {
  const note = quiz.groupNote;
  if (!note || !slugs.length) return [];
  const travels = new Set(
    quiz.groups.filter(g => note.groups.includes(g.key)).map(g => g.slug)
  );
  return slugs.some(s => travels.has(s)) ? [note[which]] : [];
}

/** The Compass's and the sins draft's word, and the default for every quiz. */
export const groupNoun = (q: Quiz) => q.groupNoun ?? 'category';
export const groupNounPlural = (q: Quiz) => q.groupNounPlural ?? 'categories';

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
