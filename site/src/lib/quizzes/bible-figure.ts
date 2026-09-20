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
 * STATUS: DRAFT, and registered. The statements have been through two adversarial critics,
 * an editor, a calibration pass and five audit reviews (cessationist, Pentecostal, Catholic
 * and Orthodox, psychometric, evidence), closed in audit/new-quizzes/AUDIT-LOG.md. The owner
 * has not yet played it. Draft means noindex, out of the sitemap, and off the hub's live list.
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
 *               One cell says more than the stock sentence: Jesus on Reasons, where the
 *               Gospels say he knew what was coming (John 18:4), so neither pole describes
 *               him and the cell says why instead of only saying "not shown".
 * Neither is a place the person stood, so neither is counted when a reader is matched. That
 * is the evidence mask: see maskFor() below, and AxisMask in engine/types.ts.
 */
import data from '../../data/bible-figures.json';
import { bipolar, namesNoPosition } from '../strategies/bipolar';
import type { AxisMask, Outcome, Quiz, QuizGroup, QuizItem } from '../engine/types';

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
  /** Derived from the evidence below, never stored: see maskFor(). */
  mask: AxisMask[];
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
 * Which Bibles hold a figure's book, said once and the same way every time. The wording is
 * the game's, which the owner approved: it states where the book is printed and takes no
 * side about whether it belongs there.
 */
const canonNote = (book: string) =>
  `The book of ${book} is in Catholic and Orthodox Bibles. ` +
  'Protestant Bibles leave it out or print it as Apocrypha.';

/**
 * A figure's own sentence, by slug, travelling with the outcome wherever it appears: the
 * result card, the figure page, and any other surface that reads `outcome.note`. A map, not
 * a chain of tests in the loop below, so adding a figure who needs one is adding a line here.
 */
const OUTCOME_NOTES: Record<string, string> = {
  jesus: JESUS_NOTE,
  judith: canonNote('Judith'),
  tobit: canonNote('Tobit')
};

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
      'gets moving, and now and then it is the wrong work. Neither is the better way to be. ' +
      'This axis is about how someone handles instructions, reports and plans: asking first, ' +
      'or going on. It is not a measure of faith in God.'
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
 * Two statements are in a borrowed voice ("People have told me..."), at most one per axis
 * and never the only statement on a pole. There were five, and every one reported a fault:
 * a reader with nobody around to comment on them, or one who denies criticism, disagreed
 * with all five and was moved to one profile (the psychometric audit's finding F2).
 */
const RAW: Array<[string, string, 1 | -1]> = [
  // round one
  ['pace', 'When I am offered something, I say yes or no there and then.', -1],
  ['voice', 'I often sit through a whole conversation without joining in.', 1],
  ['lead', 'I would rather run the meeting than sit in it.', -1],
  ['conflict', 'When two people I know have argued, I end up passing messages between them.', 1],
  ['doubt', 'People have told me I ask one question too many.', -1],
  ['plan', 'I work out the details when I get there, not before.', 1],
  // round two
  ['pace', 'I take a night to decide things that other people decide on the spot.', 1],
  ['voice', 'People can always tell what I am thinking, because I have already said it.', -1],
  ['lead', 'I start handing out jobs in a group before anyone has asked me to.', -1],
  ['conflict', 'I would rather have the argument now than keep things calm for another week.', -1],
  ['doubt', 'I follow instructions as given and leave the reasons for later.', 1],
  ['plan', 'I carry things I will probably not need, in case the day goes wrong.', -1],
  // round three
  ['pace', 'People have told me I jumped in before I had the whole picture.', -1],
  ['voice', 'I often leave a conversation with an opinion I never said out loud.', 1],
  ['lead', 'In a group I wait to see who is leading before I offer anything.', 1],
  ['conflict', 'I step in to calm arguments that are not mine.', 1],
  ['doubt', 'I ask why a rule exists before I follow it.', -1],
  ['plan', 'I drop my plans when something new comes up.', 1]
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

/**
 * THE EVIDENCE MASK, derived from the data and never typed by hand.
 *
 * A figure is matched to a reader only on the axes where the text puts them somewhere.
 * Which those are is read off two things the data already carries — the `toward` fields of
 * the cited acts, and the coordinate the editor drew from them:
 *
 *   none   no cited act on this axis. The cell is the single "the text does not show this"
 *          item, and the 50 beside it is the middle of a SCALE, not a place this person
 *          stood. Counting it told every moderate reader they were most like whichever
 *          figure had the fewest records, which is a false claim about that person.
 *   both   cited acts point to both poles AND they do not resolve into a position — the
 *          coordinate lands in the band where this instrument names no pole for anybody
 *          (41-59, from BAND_EDGES). True of Jesus on three axes: he heals on the spot and
 *          he prays all night before choosing; he overturns the tables and he restores
 *          Peter. That is a real finding about the record and a real refusal to place him,
 *          and it is not the same as a reader who is mildly in the middle.
 *   shown  everything else: the acts place this figure, and the coordinate says where.
 *          Acts pointing both ways still count as SHOWN when the weight of them carried
 *          the coordinate out of the no-pole band — that is the editor reading the record,
 *          which is exactly what a coordinate is for.
 *
 * So the rule in one line: an axis counts when the figure's own coordinate names a pole.
 * Nothing here can drift from the evidence, because nothing here is stored.
 */
function maskFor(
  name: string,
  position: number[],
  evidence: Record<string, FigureEvidence[]>
): AxisMask[] {
  return keys.map((key, i) => {
    const cited = (evidence[key] ?? []).filter(e => e.ref);
    if (!cited.length) return 'none';
    const inBand = namesNoPosition(position[i] ?? 50);
    const bothWays =
      cited.some(e => e.toward === 'left') && cited.some(e => e.toward === 'right');
    if (!inBand) return 'shown';
    if (bothWays) return 'both';
    // Acts that all point one way, and a coordinate that refuses to name the pole they
    // point at. There is no honest sentence for that cell: it is not "the text does not
    // show this" and it is not "the text shows both ends". The editor has to either place
    // the figure where the acts point or say what the other end of the record is.
    throw new Error(
      `bible-figure: ${name}/${key} cites acts toward one pole only but sits at ` +
      `${position[i]}, inside the band where no pole is named`
    );
  });
}

const outcomes: FigureOutcome[] = data.figures.map(f => ({
  name: f.name,
  slug: f.slug,
  position: f.position,
  mask: maskFor(f.name, f.position, f.evidence as Record<string, FigureEvidence[]>),
  who: f.who,
  ...(OUTCOME_NOTES[f.slug] ? { note: OUTCOME_NOTES[f.slug] } : {}),
  evidence: f.evidence as Record<string, FigureEvidence[]>
}));

/**
 * Scoring config. CALIBRATED, not copied: every number below was measured over 20,000
 * simulated answer sheets with scripts/sim-figures.mjs, which is kept in the repo so the
 * next person can re-run it. Run it after ANY change to a coordinate or a statement.
 *
 * radix        items per axis x 4 + 1: three items run -6..+6 raw, so 13 reachable scores.
 * maxDistance  the largest distance between any two listed figures under the same
 *              evidence-masked rule the engine matches with. It sets BAR LENGTH only on
 *              this quiz; hideOutcomeScore means it never prints as a number.
 * tieUnits     1, not the Compass's 10. Twenty-five figures crowd a space where the two
 *              closest are about fifteen units apart, and a reader is measured only on the
 *              axes they and the figure both name — so at 10 units more than half of all
 *              readers had a second figure inside the window and "jointly" became the
 *              normal result rather than the exception. At 1 it is 15% of readers, and it
 *              means what it says: the two are level. (Measured: 0 -> 11%, 1 -> 15%,
 *              2 -> 22%, 3 -> 29%, 10 -> 58%.)
 * hedgeUnits   45, the Compass's, and it keeps its meaning because the rescale puts every
 *              distance back on the six-axis scale it was set on. It is doing real work
 *              here: a reader who names a position on only one or two axes is multiplied
 *              back up by the rescale, so a thin match hedges itself. 7% of readers.
 * centerUnits  10. At radix 13 the reachable scores inside it are exactly 42, 50 and 58 —
 *              the same three the 41-59 no-position band holds — so "central" means
 *              precisely "named no position on any axis", which is also the case where no
 *              figure can be measured at all. If the radix ever changes, check this again.
 * minShownAxes 3 of 6. See validateOutcomeMasks in engine/registry.ts. It was 4 until the
 *              audit was applied. Three reviewers (cessationist, Catholic and Orthodox,
 *              evidence) found that Jesus cannot honestly be placed on Reasons, because the
 *              Gospels say he knew what was coming; that leaves him placed on three axes, and
 *              the same reading of the text leaves his mother and Deborah on three. A floor
 *              of four would take all three off the results, which the owner's decision about
 *              Jesus and the blueprint's nine women both rule out. Measured at 3: no figure
 *              closest for more than 9%, ties 8%. THE OWNER'S CALL: see AUDIT-LOG.md, top.
 *
 * MEASURED AGAIN on 2026-09-22, after Judith and Tobit were added by the owner's decision
 * (25 figures, 10,000 realistic sheets): worst 7.7% (Ruth), ties 8.2%, central 1.3%, all
 * inside their targets. The simulator's fourth target, that every figure comes out closest
 * for at least 1.5% of sheets, now fails: Judith 1.1%, Jesus 1.3%, Martha 1.5%. Nothing here
 * and no coordinate was changed to move those numbers. Two more figures divide the same
 * hundred per cent, so an even share falls from 4.3% to 4.0%, and Judith sits in the most
 * crowded corner of the roster, near David and Deborah. Whether the floor is still the right
 * target on a roster this size is the owner's call, not a thing to fix in the config.
 */
const perAxis = groups.map((_, g) => items.filter(it => it.group === g).length);
if (new Set(perAxis).size !== 1) {
  throw new Error('bible-figure: axes have differing statement counts: ' + perAxis.join(','));
}
const radix = perAxis[0]! * 4 + 1;

/*
 * Measured the way the engine measures: an axis counts only where BOTH figures name a
 * position, root-mean-square rescaled to the six-axis range. A figure read as a reader
 * names a position on exactly its own shown axes, so the pair's axes are the intersection
 * of the two masks — and the relation is symmetric, though the loop walks both ways rather
 * than relying on that.
 */
let maxPair = 0;
for (const a of outcomes) {
  for (const b of outcomes) {
    if (a === b) continue;
    let sum = 0;
    let counted = 0;
    for (let k = 0; k < groups.length; k++) {
      if (a.mask[k] !== 'shown' || b.mask[k] !== 'shown') continue;
      const d = a.position[k]! - b.position[k]!;
      sum += d * d;
      counted++;
    }
    if (counted) maxPair = Math.max(maxPair, Math.sqrt((sum * groups.length) / counted));
  }
}

export const bibleFigure: FigureQuiz = {
  slug: 'bible-figure',
  title: 'Who in the Bible are you most like?',
  tagline: 'Eighteen plain statements, then the figure whose recorded acts sit nearest.',
  description:
    'Eighteen statements about how you act, speak, lead, argue, question and plan. None ' +
    'mentions the Bible. The result names the figure whose recorded acts sit nearest, and ' +
    'shows the cited moments that place them there. It asks about temperament, not virtue.',
  icon: 'scroll',
  minutes: 3,
  status: 'draft',
  draftNote:
    'This one is a draft. Its statements and placements have had five adversarial reviews, ' +
    'not the full fairness audit the Theology Compass went through, and nobody has played it ' +
    'yet. Every figure is placed by cited, recorded acts, and each reference has been checked ' +
    'against the text: the references, not the placements, because where a figure sits is ' +
    'still an editor’s judgement. Two of the figures, Judith and Tobit, come from books that ' +
    'Catholic and Orthodox Bibles contain and Protestant Bibles leave out or print as ' +
    'Apocrypha; their cards and their pages say so. ' +
    'You are compared to each person only on the axes where the text places them and ' +
    'your own answers name a position: where the text shows nothing, or shows both ends, that ' +
    'axis is left out rather than counted as a match in the middle. No percentage is ever ' +
    'shown against a person. Neither end of any axis is the better one. ' +
    'Treat the result as a conversation starter, not a verdict.',
  items,
  groups,
  outcomes,
  strategy: bipolar,
  config: {
    radix,
    maxDistance: Math.round(maxPair * 10) / 10,
    tieUnits: 1,
    hedgeUnits: 45,
    centerUnits: 10,
    minShownAxes: 3,
    minMatchAxes: 2
  },
  // Not "I am most like": pasted into a chat beside the name of Jesus, that sentence is a
  // boast the note on his card cannot travel with (both audits' F8).
  shareTitle: 'Who in the Bible my answers sat nearest',
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
    `Scored against the ${outcomes.length - 1} people listed here, and Jesus, on the axes of ` +
    'temperament where the text places them and your own answers name a position. Each place ' +
    'is an editor’s reading of a few recorded acts, not a measurement, and with three ' +
    'statements to an axis one changed answer can change the name: read the rails, not the ' +
    'name. Nearness is not likeness of character, and no number is ever shown against a person.',
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
