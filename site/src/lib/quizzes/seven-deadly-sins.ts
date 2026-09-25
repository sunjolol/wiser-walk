/**
 * Which of the 7 deadly sins are you weakest to? — the engine's second quiz.
 *
 * The seven are the list the Middle Ages settled from Gregory the Great's Moralia in Job
 * (c. 590), carried into Aquinas and Dante: pride, envy, wrath, sloth, greed, gluttony, lust.
 * That list is historical, and every fact printed about it here is one the writer was
 * certain of; anything less certain was left out rather than guessed.
 *
 * The statements had a LEAN audit on 2026-09-21 (one critic-and-drafter pass and one
 * editor, both in the main session because the model API refused every agent that day),
 * against the site's rules: plain words anyone can answer, one claim each, under 22 words,
 * one +1 and one -1 keyed item a vice, nothing written backwards from a definition. It is
 * not the Compass's twenty-reviewer audit, and no page may say it was.
 *
 * Every verse below is verbatim from the World English Bible British Edition held on disk
 * at demos/sounds-like-scripture/work/verses-all.json (src "webbe"), inserted by a script
 * and checked as a substring of that file by scripts/engine-test.mjs. Never retype one.
 */
import { category } from '../strategies/category';
import type { Quiz, QuizGroup, QuizItem } from '../engine/types';

const WEBBE = 'World English Bible British Edition';

const groups: QuizGroup[] = [
  { key: 'pride', slug: 'pride', name: 'pride',
    summary: "Gregory placed pride first, as the root the other six grow from: the refusal to be under anything.",
    question: "What is pride, as one of the seven deadly sins?",
    shortAnswer: "Pride is the refusal to be under anything: not confidence, and not enjoying work well done, but the settled need to be right, to be first, and to owe nobody. The old writers put it at the root of the other six, because each of them is a way of serving yourself.",
    whyItMatters: "Pride is the hardest of the seven to see in yourself, because it is the one doing the looking. It shows up as the argument you cannot drop, the apology you cannot make, the credit you quietly keep. The two statements on it ask about exactly those moments, when being right matters more than being fair.",
    didYouKnow: [{ text: "Gregory the Great did not count pride among his seven at all. In the Moralia he set it outside the list as the root every other vice grows from, and named vainglory as the first of the seven. The Middle Ages folded the two together, and pride took the top of the list it had been planted under.", source: "Gregory the Great, Moralia in Job, Book XXXI" }],
    quoted: [{ ref: "Proverbs 16:18", text: "Pride goes before destruction, and an arrogant spirit before a fall." }, { ref: "Proverbs 11:2", text: "When pride comes, then comes shame, but with humility comes wisdom." }],
    quotedFrom: WEBBE },
  { key: 'envy', slug: 'envy', name: 'envy',
    summary: "Sorrow at another's good: the one vice that gives its owner nothing to enjoy.",
    question: "What is envy, as one of the seven deadly sins?",
    shortAnswer: "Envy is sorrow at another person's good: the sinking feeling when a friend gets the job, the house, the praise. It is not wanting what they have, which is ordinary, but minding that they have it. Of the seven it is the only one with no pleasure in it at all.",
    whyItMatters: "Envy is quiet and it is common, and it spoils the good things in your life by measuring them against someone else's. The two statements on it ask the plain question: when someone you know does well, do you get smaller or glad? Most people know the honest answer before they finish reading.",
    didYouKnow: [{ text: "The word comes from the Latin invidia, looking upon someone with ill will, and Dante took the picture literally: in the Purgatorio the envious sit in grey cloaks with their eyelids sewn shut with wire, because the eye is where envy begins.", source: "Dante, Purgatorio, canto XIII" }],
    quoted: [{ ref: "Proverbs 14:30", text: "The life of the body is a heart at peace, but envy rots the bones." }, { ref: "James 3:16", text: "For where jealousy and selfish ambition are, there is confusion and every evil deed." }],
    quotedFrom: WEBBE },
  { key: 'wrath', slug: 'wrath', name: 'wrath',
    summary: "Anger held past its usefulness, until it hardens into the desire to see someone pay.",
    question: "What is wrath, as one of the seven deadly sins?",
    shortAnswer: "Wrath is anger kept past its use: not the flash of feeling when something is wrong, which Scripture allows, but the grudge nursed, the argument replayed, the wish to see someone pay. It is the one vice that can feel like justice while it is doing its damage.",
    whyItMatters: "Anger is not on the list; wrath is. The Bible tells people to be angry and not sin, and to be slow to it, which is a different instruction from never feeling it. The two statements ask where yours goes afterwards: whether a slight is let go, or kept and sharpened for later.",
    didYouKnow: [{ text: "Anger is the only vice on the list that the Gospels also record in Jesus. Mark writes that He looked round at the men waiting to accuse Him with anger, grieved at the hardness of their hearts, and then healed the man in front of them. The feeling is not the sin; what it hardens into is.", source: "Mark 3:5" }],
    quoted: [{ ref: "James 1:19", text: "So, then, my beloved brothers, let every man be swift to hear, slow to speak, and slow to anger;" }, { ref: "Ephesians 4:26", text: "“Be angry, and don’t sin.” Don’t let the sun go down on your wrath," }],
    quotedFrom: WEBBE },
  { key: 'sloth', slug: 'sloth', name: 'sloth',
    summary: "Acedia: not idleness so much as the listlessness that will not do the good it knows.",
    question: "What is sloth, as one of the seven deadly sins?",
    shortAnswer: "Sloth is not laziness in the ordinary sense. The old word is acedia, a listlessness that will not do the good it knows about: the thing that matters put off again, the good start abandoned when the first enthusiasm goes. A busy person can have it; being busy is one of the ways to avoid the thing that matters.",
    whyItMatters: "Sloth is the vice people are most likely to laugh off, and it costs the most over a life, because it works by subtraction: the friendship not kept up, the gift not used, the apology never got round to. The two statements ask whether you finish what you start and whether pressure is the only thing that moves you.",
    didYouKnow: [{ text: "Acedia comes from a Greek word meaning lack of care. The desert monks who first described it called it the noonday demon, after the line in Psalm 91 about the destruction that wastes at noonday, because it struck in the middle of the day, when the work was half done and the end was nowhere in sight.", source: "Evagrius Ponticus, Praktikos, 12; Psalm 91:6" }],
    quoted: [{ ref: "Proverbs 13:4", text: "The soul of the sluggard desires, and has nothing, but the desire of the diligent shall be fully satisfied." }, { ref: "Ecclesiastes 10:18", text: "By slothfulness the roof sinks in; and through idleness of the hands the house leaks." }],
    quotedFrom: WEBBE },
  { key: 'greed', slug: 'greed', name: 'greed',
    summary: "Avarice: wanting more than you need, and measuring yourself by what you have gathered.",
    question: "What is greed, as one of the seven deadly sins?",
    shortAnswer: "Greed is wanting more than you need and measuring yourself by what you have gathered. It is not earning, saving or owning things, which the Bible takes for granted, but the grip: money and possessions as the score of your life, and the difficulty of letting any of it go.",
    whyItMatters: "Greed hides well in a culture that admires it. The two statements do not ask how much you have; they ask whether you keep score by it, and whether giving something away comes easily or has to be asked for twice. Jesus warned about it more often than about almost anything else.",
    didYouKnow: [{ text: "Paul calls covetousness idolatry, which is the old writers' point in one word: greed treats a possession as if it could do what only God does. Dante put the hoarders and the spendthrifts in the same circle of hell, rolling great weights against each other for ever, because both had made money the measure of a life.", source: "Colossians 3:5; Dante, Inferno, canto VII" }],
    quoted: [{ ref: "Luke 12:15", text: "He said to them, “Beware! Keep yourselves from covetousness, for a man’s life doesn’t consist of the abundance of the things which he possesses.”" }, { ref: "1 Timothy 6:10", text: "For the love of money is a root of all kinds of evil. Some have been led astray from the faith in their greed, and have pierced themselves through with many sorrows." }],
    quotedFrom: WEBBE },
  { key: 'gluttony', slug: 'gluttony', name: 'gluttony',
    summary: "Taking comfort in consumption: reaching for the thing that dulls rather than the thing that feeds.",
    question: "What is gluttony, as one of the seven deadly sins?",
    shortAnswer: "Gluttony is taking comfort in consumption: reaching for food, drink, or these days a screen, to dull a hard day rather than to meet a need. It is not enjoying a good meal, which Scripture treats as a gift, but the habit of using what you take in to avoid what you feel.",
    whyItMatters: "Gluttony is the vice with the most modern disguises, because the thing reached for need not be food. The two statements ask whether you reach for something to take the edge off, and whether you can stop at enough. Both are about the reaching, not about the size of the plate.",
    didYouKnow: [{ text: "Gregory the Great counted five ways to be a glutton, and only one of them is eating too much: too soon, too finely, too much, too eagerly, and too fussily. Thomas Aquinas repeated the list six centuries later. The old word is the Latin gula, the throat.", source: "Gregory the Great, Moralia in Job, Book XXX; Thomas Aquinas, Summa Theologiae II-II, q. 148, a. 4" }],
    quoted: [{ ref: "Proverbs 23:21", text: "for the drunkard and the glutton shall become poor; and drowsiness clothes them in rags." }, { ref: "Philippians 3:19", text: "whose end is destruction, whose god is the belly, and whose glory is in their shame, who think about earthly things." }],
    quotedFrom: WEBBE },
  { key: 'lust', slug: 'lust', name: 'lust',
    summary: "Desire detached from love, treating a person as something to be used.",
    question: "What is lust, as one of the seven deadly sins?",
    shortAnswer: "Lust is desire detached from love: wanting a person as something to be used rather than someone to be known. It is not attraction, and it is not marriage, both of which the Bible blesses. It is the look that lingers where it should not, and what the mind does with it afterwards.",
    whyItMatters: "Jesus moved this one from the act to the look, which is why the two statements ask about attention rather than behaviour: where you let your eyes rest, and whether you guard them when nobody would know either way. Nobody else can answer those two for you, which is what makes them worth answering honestly.",
    didYouKnow: [{ text: "Of the seven, Dante judged lust the least grave: it is the first circle of his hell after limbo, where the lustful are blown about by a storm that never rests, and Paolo and Francesca tell their story. The old word is the Latin luxuria, which meant excess of every kind before it narrowed to this one.", source: "Dante, Inferno, canto V" }],
    quoted: [{ ref: "Matthew 5:28", text: "but I tell you that everyone who gazes at a woman to lust after her has committed adultery with her already in his heart." }, { ref: "1 Thessalonians 4:3", text: "For this is the will of God: your sanctification, that you abstain from sexual immorality," }],
    quotedFrom: WEBBE }
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
  ['sloth', 'I keep going with something worthwhile after the first enthusiasm wears off.', -1],
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
  title: 'Which of the 7 deadly sins are you weakest to?',
  tagline: 'Fourteen plain statements against the oldest list of what goes wrong in people.',
  menu: 'The oldest list of what goes wrong in people.',
  description:
    'The seven deadly sins as the Middle Ages settled them from Gregory the Great\u2019s list: ' +
    'pride, envy, wrath, sloth, greed, gluttony, lust. Fourteen plain statements, two minutes, ' +
    'and an honest look at which one pulls on you hardest.',
  icon: 'apple',
  minutes: 2,
  status: 'live',
  items,
  groups,
  outcomes: [],
  strategy: category,
  notes: {
    introShort:
      'Nobody is free of all seven, and most people already know which one pulls hardest; this asks you to say so honestly.',
    scale:
      'Agree means the sentence is true of you as you usually are, not on your best day or your worst. ' +
      'Some sentences describe the opposite of a vice, so read each one to the end.',
    result:
      'This is where your answers pointed: the vices you agreed with most, ranked. It is a mirror, not a ' +
      'verdict. The old writers listed the seven so that people could name what pulled at them, and the ' +
      'naming was meant as the first step out, not the last word.',
    low:
      'A vice near the bottom is one your answers leaned away from. That is a description of two sentences, ' +
      'not a certificate.'
  },
  config: {
    // Two items per group: raw runs -4..+4, so 9 reachable scores per group.
    radix: 9,
    // Points a category must clear above no-net-agreement before it is named at all.
    namingFloor: 10,
    // Reachable steps within which two categories count as level. Zero, so only an exact
    // equality is called a tie: at two items per group one step is a whole answer's worth
    // of difference, and calling that "level" would throw away something real.
    tieSteps: 0
  },
  shareTitle: 'Which of the 7 deadly sins I am weakest to',
  codePrefix: 'S'
};
