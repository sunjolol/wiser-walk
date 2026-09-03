/**
 * Which of the seven are you weakest to? — the engine's second quiz.
 *
 * Its purpose right now is to prove the seams are real: a different scoring strategy
 * (highest-category-wins), a different group count, a different radix, running through
 * the same routes, codec, result page and share card with no engine changes.
 *
 * The seven are Gregory the Great's list (Moralia in Job, c. 590), carried into Aquinas
 * and Dante: pride, envy, wrath, sloth, greed, gluttony, lust. That list is historical.
 * The STATEMENTS BELOW ARE NOT AUDITED — they have not been through the adversarial
 * process the Compass went through, which is why this quiz ships as a draft.
 */
import { category } from '../strategies/category';
import type { Quiz, QuizGroup, QuizItem } from '../engine/types';

const groups: QuizGroup[] = [
  { key: 'pride', slug: 'pride', name: 'pride', emoji: '👑',
    summary: 'Gregory placed pride first, as the root the other six grow from: the refusal to be under anything.' },
  { key: 'envy', slug: 'envy', name: 'envy', emoji: '🫥',
    summary: 'Sorrow at another’s good — the one sin, Aquinas noted, that offers its owner no pleasure at all.' },
  { key: 'wrath', slug: 'wrath', name: 'wrath', emoji: '🔥',
    summary: 'Anger held past its usefulness, until it hardens into the desire to see someone pay.' },
  { key: 'sloth', slug: 'sloth', name: 'sloth', emoji: '🥱',
    summary: 'Acedia: not idleness so much as the listlessness that will not do the good it knows.' },
  { key: 'greed', slug: 'greed', name: 'greed', emoji: '💰',
    summary: 'Avarice: wanting more than you need, and measuring yourself by what you have gathered.' },
  { key: 'gluttony', slug: 'gluttony', name: 'gluttony', emoji: '🍰',
    summary: 'Taking comfort in consumption — reaching for the thing that dulls rather than the thing that feeds.' },
  { key: 'lust', slug: 'lust', name: 'lust', emoji: '💔',
    summary: 'Desire detached from love, treating a person as something to be used.' }
];

/** Two items per sin, one reverse-keyed, to guard against agreeing with everything. */
const RAW: Array<[string, string, 1 | -1]> = [
  ['pride', 'I find it hard to admit I was wrong, even when I know that I was.', 1],
  ['pride', 'I am quick to give other people credit for work I helped with.', -1],
  ['envy', "Another person's success can leave me feeling smaller rather than glad.", 1],
  ['envy', 'When a friend gets what I wanted, I can be genuinely happy for them.', -1],
  ['wrath', 'I replay arguments in my head, sharpening what I should have said.', 1],
  ['wrath', 'I let small slights go without needing to settle the score.', -1],
  ['sloth', 'I put off things that matter to me until the pressure forces my hand.', 1],
  ['sloth', 'I keep at a good work even after the first enthusiasm wears off.', -1],
  ['greed', 'I catch myself measuring how I am doing by what I have accumulated.', 1],
  ['greed', 'I give money or possessions away without needing to be asked twice.', -1],
  ['gluttony', 'I reach for food, drink, or a screen to take the edge off a hard day.', 1],
  ['gluttony', 'I can stop at enough without much of a struggle.', -1],
  ['lust', 'I let my attention linger where I know that it should not.', 1],
  ['lust', 'I guard what I look at, even when nobody would know either way.', -1]
];

const keys = groups.map(g => g.key);

const items: QuizItem[] = RAW.map(([key, text, direction], i) => ({
  n: i + 1,
  text,
  group: keys.indexOf(key),
  direction
}));

export const sevenDeadlySins: Quiz = {
  slug: 'seven-deadly-sins',
  title: 'Which of the seven are you weakest to?',
  tagline: 'Fourteen statements against Gregory the Great’s old list.',
  description:
    'The seven capital vices as Gregory the Great fixed them around 590 — pride, envy, ' +
    'wrath, sloth, greed, gluttony, lust. Fourteen statements, and an honest look at which ' +
    'one has the most pull on you.',
  emoji: '🕯️',
  minutes: 2,
  status: 'draft',
  draftNote:
    'This one is an unaudited draft. The seven vices and their definitions are historical, ' +
    'but these statements have not been through the adversarial fairness audit the Theology ' +
    'Compass went through. Treat the result as a conversation starter, not a verdict.',
  items,
  groups,
  outcomes: [],
  strategy: category,
  config: {
    // Two items per group: raw runs -4..+4, so 9 reachable scores per group.
    radix: 9,
    centerUnits: 10,
    tieUnits: 8
  },
  shareTitle: 'Which of the seven I am weakest to'
};
