/**
 * Who in the Bible are you most like? — the engine's third quiz, and its second bipolar one.
 *
 * THE STATEMENTS KNOW NOTHING ABOUT THE BIBLE. They are plain things a person can say about
 * themselves: no church vocabulary, no situation borrowed from a story, no answer that
 * flatters. The Bible enters only on the other side of the measurement: where each figure
 * sits, which is argued from cited, recorded acts. See QUIZ-BLUEPRINTS.md, and
 * audit/new-quizzes/figure-final.md for where every statement came from.
 *
 * The six axes are TEMPERAMENT, NOT VIRTUE. Neither pole of any axis is the good one.
 *
 * SIGN CONVENTION (the Compass's, read from strategies/bipolar.ts): a score of 0 is the LEFT
 * pole and 100 the RIGHT pole. `direction: -1` means agreeing moves the reader toward the
 * group's LEFT pole; `direction: 1` means agreeing moves them toward the RIGHT pole. Every
 * sign below was re-derived from the final wording, not carried over from a draft.
 *
 * The figures come from src/data/bible-figures.json, a flattened copy of
 * audit/new-quizzes/figures.verified.json (every reference read against the World English
 * Bible British Edition on disk by an adversarial verifier). Never hand-edit that JSON:
 * change the audit source and regenerate. It is copied under site/ for the same reason
 * compass.json is: Vercel's root directory is site/, and audit/ is outside it.
 *
 * STATUS: DRAFT, and registered. The statements have been through two adversarial critics
 * and an editor, not through the full fairness audit the Compass had, and the owner has not
 * yet played it. Draft means noindex, out of the sitemap, and off the hub's live list.
 *
 * FIELDS THE ENGINE NOW READS (wired 2026-09-19; the first three moved into engine/types.ts):
 *   quiz.hideOutcomeScore  never print a percentage against a figure, on any surface
 *   quiz.outcomeNoun/...   "figure", "figures", /figure/<slug>/, and this quiz's scope note
 *   outcome.who            the one-line identifier under a figure's name
 *   outcome.note           a sentence that accompanies the outcome wherever it appears
 * `evidence` stays local to this module, because it is this quiz's own shape: the figure
 * pages import it from here exactly as the tradition pages import the Compass.
 *
 * TWO KINDS OF 50 in a figure's position, told apart by the evidence, never by the number:
 *   both ends   two or three items with real refs and opposing `toward` values
 *   not shown   exactly one item, ref null, toward null, did "The text does not show this."
 */
import data from '../../data/bible-figures.json';
import { bipolar } from '../strategies/bipolar';
import type { Outcome, Quiz, QuizGroup, QuizItem } from '../engine/types';

export interface FigureEvidence {
  /** A Bible reference, or null when the text does not show this axis for this figure. */
  ref: string | null;
  /** Which pole the recorded act points to. Null only on a not-shown cell. */
  toward: 'left' | 'right' | null;
  /** One neutral sentence saying what the person DID. Never a virtue word. */
  did: string;
  /** Present only when verbatim from the World English Bible British Edition. */
  quote?: string;
}

export interface FigureOutcome extends Outcome {
  position: number[];
  who: string;
  /** Keyed by group KEY (pace, voice, lead, conflict, doubt, plan), not by slug. */
  evidence: Record<string, FigureEvidence[]>;
}

export interface FigureQuiz extends Quiz {
  outcomes: FigureOutcome[];
  /** Rank the nearest figures by bar length only. No percentage against a person, ever. */
  hideOutcomeScore: true;
}

/**
 * The one sentence that goes wherever Jesus appears as a result: his card, his figure page,
 * the share card. The same every time. Do not shorten it and do not decorate it.
 */
export const JESUS_NOTE =
  'Landing nearest Jesus here is about temperament as the Gospels record it, not a measure ' +
  'of holiness; every Christian is called to be like him in character, whatever their temperament.';

/**
 * Axis order is the engine's position order: pace, voice, lead, conflict, doubt, plan.
 *
 * The fifth axis keeps the blueprint's key `doubt` internally, but its reader-facing name
 * and slug are "Reasons" / `reasons`. The verifier's instruction: the word "doubt" must
 * never surface as a label on a figure's page or card, and above all not on Jesus's.
 * Always use `slug`, never `key`, for anything URL-shaped.
 */
const groups: QuizGroup[] = [
  {
    key: 'pace', slug: 'pace', name: 'Pace',
    left: 'Acts first', right: 'Weighs first',
    bands: ['acts first', 'quick to move', 'between acting and weighing', 'takes time to decide', 'weighs first'],
    summary:
      'Some people move as soon as they see what is needed, and find out the rest on the way; ' +
      'it gets things started and sometimes means starting again. Others wait until they have ' +
      'thought it through; it catches the mistake and sometimes misses the moment. Neither is ' +
      'the better way to be.'
  },
  {
    key: 'voice', slug: 'voice', name: 'Voice',
    left: 'Says it', right: 'Holds it',
    bands: ['says it', 'quick to speak up', 'between saying and holding', 'slow to speak up', 'holds it'],
    summary:
      'Some people think out loud, so everyone knows where they stand and nothing is left to ' +
      'guess; some of it comes out half-formed. Others keep a thought and turn it over before ' +
      'it is heard, if it ever is; it arrives considered, and sometimes too late. Neither is ' +
      'the better way to be.'
  },
  {
    key: 'lead', slug: 'lead', name: 'Lead',
    left: 'Out in front', right: 'Alongside',
    bands: [
      'out in front', 'more in front than alongside', 'between in front and alongside',
      'more alongside than in front', 'alongside'
    ],
    summary:
      'Some people step to the front when a group needs direction; the drift ends, and the ' +
      'choice is taken off everyone else. Others work beside the person who is leading and ' +
      'add their weight to someone else’s effort; that person goes further, and a gap can stay ' +
      'unfilled. Neither is the better way to be.'
  },
  {
    key: 'conflict', slug: 'conflict', name: 'Conflict',
    left: 'Confronts', right: 'Reconciles',
    bands: [
      'confronts', 'quick to confront', 'between confronting and reconciling',
      'quick to reconcile', 'reconciles'
    ],
    summary:
      'Some people walk toward a disagreement and have it out; the matter gets dealt with, and ' +
      'it can cost the evening or the friendship. Others work to bring the two sides back ' +
      'together; people stay in the room, and the real question can stay open. Neither is the ' +
      'better way to be.'
  },
  {
    key: 'doubt', slug: 'reasons', name: 'Reasons',
    left: 'Asks why', right: 'Takes it on trust',
    bands: ['asks why', 'quick to question', 'between asking and trusting', 'slow to question', 'takes it on trust'],
    summary:
      'Some people need the reason before they go on; they find the hole in the plan, and they ' +
      'hold things up while they ask. Others go on and let the reason come later; the work ' +
      'gets moving, and now and then it is the wrong work. Neither is the better way to be.'
  },
  {
    key: 'plan', slug: 'plans', name: 'Plans',
    left: 'Plans ahead', right: 'Meets the day',
    bands: [
      'plans ahead', 'leans to planning', 'between planning ahead and meeting the day',
      'leans to meeting the day', 'meets the day'
    ],
    summary:
      'Some people prepare and provision in advance; they are ready when the day goes wrong, ' +
      'and committed before they know how the day will look. Others respond to what arrives; ' +
      'they stay free to change course, and sometimes turn up without what was needed. ' +
      'Neither is the better way to be.'
  }
];

/**
 * Eighteen statements, three per axis, in the order a reader meets them: one from each axis
 * per round, so no two statements on the same axis sit side by side and a mirrored pair
 * cannot be spotted and answered for consistency.
 *
 * Keying alternates across axes so that a reader who agrees with everything is not pushed
 * into one corner of the space: pace 2 left / 1 right, voice 1/2, lead 2/1, conflict 1/2,
 * doubt 2/1, plan 1/2. Nine statements are keyed -1 and nine +1.
 *
 * At most one statement per axis is in a borrowed voice ("I have been told..."), and never
 * as the only statement on a pole: a reader with nobody around to comment on them would
 * otherwise disagree with both poles and be read as central.
 */
const RAW: Array<[string, string, 1 | -1]> = [
  // round one
  ['pace', 'I buy things while I still feel like it.', -1],
  ['voice', 'I am teased for sitting through a whole conversation without joining in.', 1],
  ['lead', 'I would rather run the meeting than sit in it.', -1],
  ['conflict', 'When two people I know have argued, I end up passing messages between them.', 1],
  ['doubt', 'People have told me I ask one question too many.', -1],
  ['plan', 'I work out the details when I get there, not before.', 1],
  // round two
  ['pace', 'I take a night to decide things that other people decide on the spot.', 1],
  ['voice', 'People can always tell what I am thinking, because I have already said it.', -1],
  ['lead', 'I have been told I take over a group without being asked to.', -1],
  ['conflict', 'I would rather have the argument now than keep things calm for another week.', -1],
  ['doubt', 'I go along with things without checking them first.', 1],
  ['plan', 'I carry things I will probably not need, in case the day goes wrong.', -1],
  // round three
  ['pace', 'People have told me I jumped in before I had the whole picture.', -1],
  ['voice', 'I often leave a conversation with an opinion I never said out loud.', 1],
  ['lead', 'In a group I wait to see who is leading before I offer anything.', 1],
  ['conflict', 'I step in to calm an argument before both sides have finished.', 1],
  ['doubt', 'I ask why a rule exists before I follow it.', -1],
  ['plan', 'I have been told I leave everything until the last possible minute.', 1]
];

const keys = groups.map(g => g.key);

const items: QuizItem[] = RAW.map(([key, text, direction], i) => ({
  n: i + 1,
  text,
  group: keys.indexOf(key),
  direction
}));

// The data file declares the order its position arrays were flattened in. If that ever
// stops matching the groups above, every figure would be silently misplaced.
if (data.axisOrder.join(',') !== keys.join(',')) {
  throw new Error(
    `bible-figure: figures are in axis order ${data.axisOrder.join(',')} but the groups are ${keys.join(',')}`
  );
}

const outcomes: FigureOutcome[] = data.figures.map(f => ({
  name: f.name,
  slug: f.slug,
  position: f.position,
  who: f.who,
  ...(f.slug === 'jesus' ? { note: JESUS_NOTE } : {}),
  evidence: f.evidence as Record<string, FigureEvidence[]>
}));

/**
 * Scoring config, derived the way scripts/build-data.mjs derives the Compass's.
 *
 * radix        items per axis x 4 + 1: three items run -6..+6 raw, so 13 reachable scores.
 * maxDistance  the largest distance between any two listed outcomes, to one decimal place
 *              (132.9 on the verified roster: Joseph to John the Baptist). It sets BAR
 *              LENGTH only on this quiz; hideOutcomeScore means it never prints as a number.
 * tieUnits, hedgeUnits, centerUnits
 *              the Compass's audited 10 / 45 / 10, carried over UNCHANGED AND UNTESTED for
 *              this roster. They need their own look before launch: see the draft note and
 *              audit/new-quizzes/figures-verification.md, "Two structural findings".
 */
const perAxis = groups.map((_, g) => items.filter(it => it.group === g).length);
if (new Set(perAxis).size !== 1) {
  throw new Error('bible-figure: axes have differing statement counts: ' + perAxis.join(','));
}
const radix = perAxis[0]! * 4 + 1;

let maxPair = 0;
for (let i = 0; i < outcomes.length; i++) {
  for (let j = i + 1; j < outcomes.length; j++) {
    let sum = 0;
    for (let k = 0; k < groups.length; k++) {
      const d = outcomes[i]!.position[k]! - outcomes[j]!.position[k]!;
      sum += d * d;
    }
    maxPair = Math.max(maxPair, Math.sqrt(sum));
  }
}

export const bibleFigure: FigureQuiz = {
  slug: 'bible-figure',
  title: 'Who in the Bible are you most like?',
  tagline: 'Eighteen plain statements, then the figure whose recorded acts sit nearest.',
  description:
    'Eighteen statements about how you act, speak, lead, argue, question and plan. None ' +
    'mentions the Bible. The result names the figure whose recorded acts sit nearest, and ' +
    'shows the cited moments that place them there. It measures temperament, not virtue.',
  icon: 'scroll',
  minutes: 3,
  status: 'draft',
  draftNote:
    'This one is an unaudited draft. Every figure is placed by cited, recorded acts, and each ' +
    'reference has been checked against the text, but where a figure sits is still a judgement, ' +
    'and the statements have not been through the adversarial fairness audit the Theology ' +
    'Compass went through. Figures near the middle of the map, Jesus among them, come up more ' +
    'often than the rest for a reader with moderate answers; that is how the map is built, not ' +
    'a finding about you. No percentage is ever shown against a person. Neither end of any ' +
    'axis is the better one. Treat the result as a conversation starter, not a verdict.',
  items,
  groups,
  outcomes,
  strategy: bipolar,
  config: {
    radix,
    maxDistance: Math.round(maxPair * 10) / 10,
    tieUnits: 10,
    hedgeUnits: 45,
    centerUnits: 10
  },
  shareTitle: 'Who in the Bible I am most like',
  codePrefix: 'BF',

  /*
   * What this quiz measures a reader against. The engine's default noun is "tradition",
   * which is the Compass's; here the outcomes are people, they publish at /figure/<slug>/,
   * and the scope note says in one sentence what the comparison is and is not.
   */
  outcomeNoun: 'figure',
  outcomeNounPlural: 'figures',
  outcomePathBase: 'figure',
  outcomeScopeNote:
    `Scored against the ${outcomes.length} people listed here, on six axes of temperament ` +
    'only. Nearness is not likeness of character, and no number is ever shown against a ' +
    'person.',
  hideOutcomeScore: true,

  /**
   * The result page's per-axis panels. The Compass's own heading says the axes are real
   * disagreements between Christians, which is true there and false here: these are ways
   * of being, and the page has to say that where the panels open.
   */
  notes: {
    depthTitle: 'What each axis is',
    depthNote:
      'Neither end of any of these is the better one. Each panel opens with what that axis ' +
      'measures; the whole description, and where the figures sit on it, is on the axis page.'
  }
};
