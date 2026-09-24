/**
 * A personality portrait: the fifth result shape, for the Christian Personality Test.
 *
 * Seventy-two quick choices, then a ten-page report built on St Gregory the Great (the Pastoral
 * Rule and the Moralia), St Gregory the Theologian, St John Cassian and the desert fathers. The
 * reader lands on one of eight types (Gregory's four dispositions x a quiet or a restless mind).
 *
 * THE SCORING IS THE DESIGN'S OWN CODE. strategies/personality-score.mjs is a generated copy of
 * design/quiz-ideas/personality/score.mjs with only its imports rewritten to read the small
 * src/data/personality-scoring.json; scripts/build-personality-data.mjs writes both and proves the
 * copy scores exactly as the original on every simulated person and 500 random answer sets. Never
 * hand-port or edit either file. The texts the report prints are in src/data/personality.json,
 * which is SERVER ONLY: pages read it in their front matter. Never import it from here or from
 * the quiz file, or it ships to the browser on every quiz page and /me/.
 *
 * PRIVACY BY CONSTRUCTION. Twelve statements (y1..y12, `block: 'private'`) are only for the person
 * taking the test. Their answers never enter a result code, a URL, the account database, the
 * analytics or the server. score.mjs's derive() reduces them, on the device, to six facts
 * (PersonalityFacts), and score(publicAnswers, facts) gives the same public report as scoring the
 * full answers (the engine test proves it on 2,000 random answer sets). The private page (page 8)
 * is drawn only in the browser that took the test, from the private answers kept there.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THE RUNNER AND THE RESULT PAGE USE (everything below is exported from this module)
 *
 *   The questions, from the browser-safe scoring file:
 *     ITEMS          all 72 items in play order, every field (stem, A, B, text, options, block...)
 *     SCALES, THOUGHTS, LINES, PRIVATE_NOTE, FREQ
 *     TYPES          { [key]: { name, tagline, disposition, makeup, opposite, ink, art } }, 8 of them
 *     TYPE_KEYS      the eight keys in the design's order (hearth, spark, deepwell, forge,
 *                    stillwater, lookout, oak, herald)
 *     TWO_IDS        the 58 two-sided items (kind 'two', b3 included), in ITEMS order
 *     PRIVATE_IDS    y1..y12, the private statements, in ITEMS order
 *     PICK_IDS       ['b1', 'b2'], each "pick up to two" of LINES
 *
 *   Answers, as score() takes them ("full" = with the private ones; "public" = without):
 *     { k1: -3..3, ..., y1: -3..3, ..., b1: ['host', 'watcher'], b2: ['giver'], b3: -3..3 }
 *     -3 is "very much A" on a two-sided item and "never" on a private one. A pick is a list of
 *     at most two lines; [] or a missing pick is "none of these". Order inside a pick is ignored.
 *
 *   encodeAnswers(full) -> code        The canonical result code. Derives the six facts itself,
 *                                      so the private answers go in and never come out. Throws
 *                                      on an unanswered or malformed two-sided item or pick.
 *   decodeAnswers(code) -> { answers, pub } | null
 *                                      The public answers (picks in LINES order) and the facts.
 *   unanswered(answers) -> string[]    Item ids in ITEMS order not yet validly answered: a
 *                                      two-sided or private item without an integer -3..3, a
 *                                      pick without an array (store [] when Next is pressed with
 *                                      nothing picked). The runner's "first unanswered one".
 *   publicAnswers(full), privateAnswers(full)
 *                                      Split full answers: everything the code carries, and the
 *                                      twelve y answers (for ww.private.personality).
 *   score(answers, pub?)               score.mjs's score(). With `pub`, the private page is not
 *                                      scored (thoughts null): what a result page does. Without,
 *                                      the full report, private page included: only ever in the
 *                                      browser that has the private answers.
 *   derive(full) -> PersonalityFacts, leanOf(itemId, v), BAND, LEAN   (score.mjs's own)
 *   EXAMPLE_CODE                       The example result (simulated person p12 of
 *                                      design/quiz-ideas/personality/sim/answers-3.json), computed
 *                                      by the data build. /api/tally leaves it out of the counts.
 *   typeOfCode(code) -> type key | null   What /api/tally counts.
 *
 *   The view (resultFor through the registry; engine/types.ts PersonalityView):
 *     { shape: 'personality', quizSlug, code, type, named: [type key], headline: type name,
 *       headlineParts: [{ text: type name, side: 'centre' }], summary: tagline, ranked: [], rows: [],
 *       answers (public), pub (the facts), report (score(answers, pub)) }
 *     `named` holds the type's KEY, which is its outcome slug (ViewBase's contract); the name the
 *     page prints is `headline`.
 *
 * THE CODE. 'PQ' + '1' + body. '1' is the format version: bump it (and keep reading the old one)
 * if the questions ever change. The body is one mixed-radix number in base 36, upper case,
 * left-padded to the width of the largest value, from these digits, most significant first:
 *   every two-sided item in ITEMS order (58, b3 included), each as answer + 3     radix 7
 *   b1, then b2, each as a pick index: 0 none, 1..7 one line (its index in LINES
 *   plus one), 8..28 the 21 pairs i<j in lexicographic order                     radix 29
 *   the facts: lowCheer + 2 lowSer + 4 lowConf + 8 x anger cell (reeds 0, brief
 *   1, worst 2, wood 3) + 32 angerMiddle + 64 hardToCorrect                       radix 128
 * Thirty-eight characters in all, inside the 96 that resolveCodeSync, /api/short and the
 * Supabase checks allow. The quiz hands out a six-character short link (`shortLinks`).
 *
 * Decoding is strict: the prefix, the version, the exact length, the characters, the number
 * inside the range; and the facts must be ones some private answers could give alongside these
 * public answers (the pace of anger is read from public answers alone, and how long it lasts
 * from one private answer that also sets lowSer), so an edited link cannot invent a result
 * nobody could get. Anything else is null.
 *
 * THE VALUES. The engine passes `values` between decode, result and encode. Here they are the
 * code's 61 digits in the order above, not 0..100 per group: this quiz has no groups (as the
 * Psalm quiz's values are one situation index). The strategy's score(quiz, sheet) throws: the test
 * has its own runner (components/PersonalityRunner.astro), as the Psalm quiz does, and finishes with
 * encodeAnswers().
 */
import data from '../../data/personality-scoring.json';
import * as generated from './personality-score.mjs';
import type {
  PersonalityAnswers, PersonalityFacts, PersonalityReport, PersonalityView, Quiz, ScoringStrategy
} from '../engine/types';

export type { PersonalityAnswers, PersonalityFacts, PersonalityReport, PersonalityView };

/*
 * score.mjs's own functions, re-exported with their types (the generated file is plain JavaScript,
 * so TypeScript would otherwise guess them from its defaults).
 */
/** The report. With `pub` (a shared link's facts) the private page is not scored and `thoughts` is null. */
export const score = generated.score as unknown as (answers: Record<string, unknown>, pub?: PersonalityFacts | null) => PersonalityReport;
/** The six facts, from full answers. Only ever run where the private answers are: the device that took the test. */
export const derive = generated.derive as unknown as (answers: Record<string, unknown>) => PersonalityFacts;
/** The pole one answer leans to (at least "A", |v| >= LEAN), or null in the middle. */
export const leanOf = generated.leanOf as unknown as (itemId: string, v: number | null | undefined) => string | null;
/** |value| below this names no leaning (the striped middle of a rail). */
export const BAND: number = generated.BAND;
/** How strong an answer must be to count for a link. */
export const LEAN: number = generated.LEAN;

// ---------------------------------------------------------------- the scoring file

/** One of the 72 items, as items.mjs writes it. `src` is for the maintainers, never shown. */
export interface PersonalityItem {
  id: string;
  kind: 'two' | 'freq' | 'pick';
  scale: string;
  /** Two-sided: the pole side A belongs to (A is not always the left pole). */
  a?: string;
  stem?: string;
  A?: string;
  B?: string;
  /** A private statement, said in the first person. */
  text?: string;
  /** Private statements: the thought it asks about. */
  thought?: string;
  block?: 'private';
  /** Picks: at most this many. */
  max?: number;
  options?: Array<{ line: string; text: string }>;
  src?: string;
}

export interface PersonalityScale {
  left: string;
  right: string;
  group: string;
  label?: string;
  src?: string;
}

export interface PersonalityType {
  name: string;
  tagline: string;
  disposition: 'cheerful' | 'serious' | 'careful' | 'confident';
  makeup: 'quiet' | 'restless';
  /** The key of the opposite type. */
  opposite: string;
  /** The type's own colour. */
  ink: string;
  /** Its painting: /img/personality/art/<art>.jpg */
  art: string;
}

interface ScoringData {
  SCALES: Record<string, PersonalityScale>;
  ITEMS: PersonalityItem[];
  THOUGHTS: string[];
  LINES: string[];
  PRIVATE_NOTE: string;
  FREQ: { low: string; mid: string; high: string };
  TYPES: Record<string, PersonalityType>;
  EXAMPLE_CODE?: string;
}

const PQ = data as unknown as ScoringData;

export const SCALES = PQ.SCALES;
export const ITEMS = PQ.ITEMS;
export const THOUGHTS = PQ.THOUGHTS;
export const LINES = PQ.LINES;
export const PRIVATE_NOTE = PQ.PRIVATE_NOTE;
export const FREQ = PQ.FREQ;
export const TYPES = PQ.TYPES;
export const TYPE_KEYS = Object.keys(TYPES);
/** The example result, for checking the report (no page links it since 2026-09-24). Empty only for a moment inside the data build, before it is computed. */
export const EXAMPLE_CODE: string = PQ.EXAMPLE_CODE ?? '';

export const TWO_IDS = ITEMS.filter(it => it.kind === 'two').map(it => it.id);
export const PRIVATE_IDS = ITEMS.filter(it => it.block === 'private').map(it => it.id);
export const PICK_IDS = ITEMS.filter(it => it.kind === 'pick').map(it => it.id);

// ---------------------------------------------------------------- answers

const isPoint = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= -3 && v <= 3;

/** A pick as its lines in LINES order, or null when it is not a list of at most two different known lines. */
function cleanPick(v: unknown): string[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > 2) return null;
  const idx = v.map(l => LINES.indexOf(String(l)));
  if (idx.some(i => i < 0) || new Set(idx).size !== idx.length) return null;
  return idx.sort((a, b) => a - b).map(i => LINES[i]!);
}

/** Item ids in ITEMS order that do not yet hold a valid answer. See the header. */
export function unanswered(answers: Record<string, unknown>): string[] {
  const a = answers ?? {};
  return ITEMS.filter(it => {
    const v = a[it.id];
    if (it.kind === 'pick') return !Array.isArray(v) || cleanPick(v) === null;
    return !isPoint(v);
  }).map(it => it.id);
}

/** Everything a code carries: the two-sided answers and the picks, in ITEMS order. */
export function publicAnswers(full: Record<string, unknown>): PersonalityAnswers {
  const out: PersonalityAnswers = {};
  for (const it of ITEMS) {
    if (it.kind === 'two') {
      const v = full?.[it.id];
      if (!isPoint(v)) throw new Error(`personality: item ${it.id} has no answer from -3 to 3 (${JSON.stringify(v)})`);
      out[it.id] = v;
    } else if (it.kind === 'pick') {
      const p = cleanPick(full?.[it.id]);
      if (!p) throw new Error(`personality: pick ${it.id} is not at most two different lines (${JSON.stringify(full?.[it.id])})`);
      out[it.id] = p;
    }
  }
  return out;
}

/** The twelve private answers alone (those given), for the device's own store. */
export function privateAnswers(full: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of PRIVATE_IDS) {
    const v = full?.[id];
    if (isPoint(v)) out[id] = v;
  }
  return out;
}

// ---------------------------------------------------------------- the code

export const CODE_PREFIX = 'PQ';
export const CODE_VERSION = '1';
const HEAD = CODE_PREFIX + CODE_VERSION;

const CELLS: PersonalityFacts['angerCell'][] = ['reeds', 'brief', 'worst', 'wood'];

/** The 21 pairs of lines, i < j, in lexicographic order: pick indices 8..28. */
const PAIRS: Array<[number, number]> = [];
for (let i = 0; i < LINES.length; i++) for (let j = i + 1; j < LINES.length; j++) PAIRS.push([i, j]);
const PICK_RADIX = 1 + LINES.length + PAIRS.length;

/** One radix per digit, most significant first. */
const RADICES: number[] = [...TWO_IDS.map(() => 7), ...PICK_IDS.map(() => PICK_RADIX), 128];
const BIG = RADICES.map(r => BigInt(r));
const ZERO = BigInt(0);
const B36 = BigInt(36);
let MAX = BigInt(1);
for (const r of BIG) MAX *= r;
/** Characters in the body: the width of the largest value. */
const WIDTH = (MAX - BigInt(1)).toString(36).length;
/** The whole code's length, prefix and version included. */
export const CODE_LENGTH = HEAD.length + WIDTH;

function pickIndex(lines: string[]): number {
  const idx = lines.map(l => LINES.indexOf(l)).sort((a, b) => a - b);
  if (idx.length === 0) return 0;
  if (idx.length === 1) return 1 + idx[0]!;
  return 1 + LINES.length + PAIRS.findIndex(([i, j]) => i === idx[0] && j === idx[1]);
}

function pickOf(index: number): string[] {
  if (index === 0) return [];
  if (index <= LINES.length) return [LINES[index - 1]!];
  return PAIRS[index - 1 - LINES.length]!.map(i => LINES[i]!);
}

function factsDigit(f: PersonalityFacts): number {
  return (f.lowCheer ? 1 : 0) + (f.lowSer ? 2 : 0) + (f.lowConf ? 4 : 0) +
    8 * CELLS.indexOf(f.angerCell) + (f.angerMiddle ? 32 : 0) + (f.hardToCorrect ? 64 : 0);
}

function factsOf(d: number): PersonalityFacts {
  return {
    lowCheer: Boolean(d & 1),
    lowSer: Boolean(d & 2),
    lowConf: Boolean(d & 4),
    angerCell: CELLS[(d >> 3) & 3]!,
    angerMiddle: Boolean(d & 32),
    hardToCorrect: Boolean(d & 64)
  };
}

/** The digits as a code. Throws on a digit out of its range: nothing else can be a result. */
function codeOfDigits(digits: number[]): string {
  if (!Array.isArray(digits) || digits.length !== RADICES.length) {
    throw new Error(`personality: a code needs ${RADICES.length} digits, not ${digits?.length}`);
  }
  let n = ZERO;
  digits.forEach((d, i) => {
    if (!Number.isInteger(d) || d < 0 || d >= RADICES[i]!) throw new Error(`personality: digit ${i} is ${d}, outside 0..${RADICES[i]! - 1}`);
    n = n * BIG[i]! + BigInt(d);
  });
  return HEAD + n.toString(36).toUpperCase().padStart(WIDTH, '0');
}

/** A code's digits, or null. Structure only: see feasible() for the rest of the check. */
function digitsOfCode(code: string): number[] | null {
  if (typeof code !== 'string') return null;
  const c = code.toUpperCase();
  if (c.length !== CODE_LENGTH || !c.startsWith(HEAD)) return null;
  const body = c.slice(HEAD.length);
  if (!/^[0-9A-Z]+$/.test(body)) return null;
  let n = ZERO;
  for (const ch of body) n = n * B36 + BigInt(parseInt(ch, 36));
  if (n >= MAX) return null;
  const out = new Array<number>(RADICES.length);
  for (let i = RADICES.length - 1; i >= 0; i--) {
    out[i] = Number(n % BIG[i]!);
    n = n / BIG[i]!;
  }
  return n === ZERO ? out : null;
}

function answersOfDigits(digits: number[]): PersonalityAnswers {
  const out: PersonalityAnswers = {};
  let t = 0, p = 0;
  for (const it of ITEMS) {
    if (it.kind === 'two') out[it.id] = digits[t++]! - 3;
    else if (it.kind === 'pick') out[it.id] = pickOf(digits[TWO_IDS.length + p++]!);
  }
  return out;
}

function digitsOfAnswers(pub: PersonalityAnswers, facts: PersonalityFacts): number[] {
  return [
    ...TWO_IDS.map(id => (pub[id] as number) + 3),
    ...PICK_IDS.map(id => pickIndex(pub[id] as string[])),
    factsDigit(facts)
  ];
}

/**
 * Could some private answers give these facts alongside these public answers?
 *
 * The anger facts are the only ones the public answers constrain: how fast anger catches is read
 * from public answers alone, and how long it stays from the public answers and one private
 * statement (y4), whose sign is also lowSer. So every value y4 could take with this lowSer is
 * tried through score.mjs's own derive(), and one of them must give exactly this anger reading.
 * The other facts each come from private statements alone, and any combination can happen.
 */
function feasible(pub: PersonalityAnswers, facts: PersonalityFacts): boolean {
  // lowSer is y4 below the middle (derive's "level < 0.5"), so only the values on that side are tried.
  const probe: Record<string, unknown> = { ...pub };
  const [from, to] = facts.lowSer ? [-3, -1] : [0, 3];
  for (let y4 = from; y4 <= to; y4++) {
    probe.y4 = y4;
    const d = derive(probe);
    if (d.lowSer === facts.lowSer && d.angerCell === facts.angerCell && d.angerMiddle === facts.angerMiddle) return true;
  }
  return false;
}

/** The canonical code for a finished test. See the header. */
export function encodeAnswers(full: Record<string, unknown>): string {
  const pub = publicAnswers(full);
  for (const id of PRIVATE_IDS) {
    const v = full?.[id];
    if (v !== undefined && v !== null && !isPoint(v)) throw new Error(`personality: private item ${id} is ${JSON.stringify(v)}, not -3 to 3`);
  }
  const facts = derive(full);
  return codeOfDigits(digitsOfAnswers(pub, facts));
}

/** The digits of a valid code, or null. What the strategy's decode() returns. */
function valuesOfCode(code: string): number[] | null {
  const digits = digitsOfCode(code);
  if (!digits) return null;
  const pub = answersOfDigits(digits);
  return feasible(pub, factsOf(digits[digits.length - 1]!)) ? digits : null;
}

/** The public answers and the facts a code carries, or null. */
export function decodeAnswers(code: string): { answers: PersonalityAnswers; pub: PersonalityFacts } | null {
  const digits = valuesOfCode(code);
  return digits ? { answers: answersOfDigits(digits), pub: factsOf(digits[digits.length - 1]!) } : null;
}

// ---------------------------------------------------------------- the view

function view(quiz: Quiz, values: number[]): PersonalityView {
  const code = codeOfDigits(values);
  const answers = answersOfDigits(values);
  const pub = factsOf(values[values.length - 1]!);
  const report = score(answers, pub);
  const t = TYPES[report.type];
  if (!t) throw new Error(`personality: score gave an unknown type ${report.type}`);
  return {
    shape: 'personality',
    quizSlug: quiz.slug,
    code,
    type: report.type,
    named: [report.type],
    headline: t.name,
    headlineParts: [{ text: t.name, side: 'centre' }],
    summary: t.tagline,
    ranked: [],
    rows: [],
    answers,
    pub,
    report
  };
}

/** The type a code stands for, or null for anything that is not a valid code. What /api/tally counts. */
export function typeOfCode(code: string): string | null {
  const digits = valuesOfCode(code);
  if (!digits) return null;
  return score(answersOfDigits(digits), factsOf(digits[digits.length - 1]!)).type;
}

export const personality: ScoringStrategy = {
  id: 'personality',
  shape: 'personality',
  score() {
    throw new Error('personality: this test is scored by its own runner (encodeAnswers), not from a sheet');
  },
  result: view,
  encode(_quiz, values) {
    return codeOfDigits(values);
  },
  decode(_quiz, code) {
    return valuesOfCode(String(code ?? ''));
  },
  /*
   * The title, the type, its tagline, the link. Nothing about how the person answered, and never
   * anything from the private page.
   */
  shareText(quiz, values, origin) {
    const v = view(quiz, values);
    return [quiz.shareTitle, `My type: ${v.headline}`, v.summary, `${origin}/r/${quiz.slug}/${v.code}`].join('\n');
  }
};
