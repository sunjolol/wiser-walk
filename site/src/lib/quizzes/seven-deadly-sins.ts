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
    title: "Pride, one of the seven deadly sins",
    band: { src: "/img/sins/pride.jpg", alt: "Pieter Bruegel the Elder’s painting of the Tower of Babel, a vast half-built spiral of arches rising above a harbour town", posM: "42% 20%", posD: "50% 10%",
      credit: "Picture: The Tower of Babel, Pieter Bruegel the Elder, 1563. Kunsthistorisches Museum, Vienna." },
    glance: [{ n: "Superbia", label: "In Latin" }, { n: "Humility", label: "Its opposite" }, { n: "Terrace 1", label: "Dante’s Purgatory" }],
    summary: "Gregory placed pride first, as the root the other six grow from: the refusal to be under anything.",
    question: "What is pride, as one of the seven deadly sins?",
    shortAnswer: "Pride is the refusal to be under anything: not confidence, and not enjoying work well done, but the settled need to be right, to be first, and to owe nobody. The old writers put it at the root of the other six, because each of them is a way of serving yourself.",
    whyItMatters: "Pride is the hardest of the seven to see in yourself, because it is the one doing the looking. It shows up as the argument you cannot drop, the apology you cannot make, the credit you quietly keep. The two statements on it ask about exactly those moments, when being right matters more than being fair.",
    didYouKnow: [{ text: "Gregory the Great did not count pride among his seven at all. In the Moralia he set it outside the list as the root every other vice grows from, and named vainglory as the first of the seven. The Middle Ages folded the two together, and pride took the top of the list it had been planted under.", source: "Gregory the Great, Moralia in Job, Book XXXI" }, { text: "In Dante’s Purgatory the proud climb the first terrace bent double under great stones, so low they cannot look up. Those who held their heads highest in life now carry the heaviest load.", source: "Dante, Purgatorio, cantos X to XII" }, { text: "Augustine put pride before the first sin itself. Adam and Eve would never have eaten, he argued, if they had not already begun to please themselves, and he called pride the craving for undue exaltation.", source: "Augustine, City of God, Book XIV" }],
    quoted: [{ ref: "Proverbs 16:18", text: "Pride goes before destruction, and an arrogant spirit before a fall." }, { ref: "Proverbs 11:2", text: "When pride comes, then comes shame, but with humility comes wisdom." }],
    quotedFrom: WEBBE },
  { key: 'envy', slug: 'envy', name: 'envy',
    title: "Envy, one of the seven deadly sins",
    band: { src: "/img/sins/envy.jpg", alt: "Diego Velázquez’s painting of Joseph’s brothers showing their father Jacob the bloodied coat", posM: "74% 30%", posD: "50% 16%",
      credit: "Picture: Joseph’s Coat Brought to Jacob, Diego Velázquez, 1630. El Escorial, Madrid." },
    glance: [{ n: "Invidia", label: "In Latin" }, { n: "Kindness", label: "Its opposite" }, { n: "Terrace 2", label: "Dante’s Purgatory" }],
    summary: "Sorrow at another's good: the one vice that gives its owner nothing to enjoy.",
    question: "What is envy, as one of the seven deadly sins?",
    shortAnswer: "Envy is sorrow at another person's good: the sinking feeling when a friend gets the job, the house, the praise. It is not wanting what they have, which is ordinary, but minding that they have it. Of the seven it is the only one with no pleasure in it at all.",
    whyItMatters: "Envy is quiet and it is common, and it spoils the good things in your life by measuring them against someone else's. The two statements on it ask the plain question: when someone you know does well, do you get smaller or glad? Most people know the honest answer before they finish reading.",
    didYouKnow: [{ text: "The word comes from the Latin invidia, looking upon someone with ill will, and Dante took the picture literally: in the Purgatorio the envious sit in grey cloaks with their eyelids sewn shut with wire, because the eye is where envy begins.", source: "Dante, Purgatorio, canto XIII" }, { text: "The Gospels give envy as the reason Jesus was handed over. Matthew and Mark both say Pilate knew the chief priests had delivered Him up out of envy.", source: "Matthew 27:18; Mark 15:10" }, { text: "Gregory the Great listed what each vice gives birth to. From envy, he wrote, come hatred, whispering, running people down, gladness at a neighbour’s misfortune and grief at his success.", source: "Gregory the Great, Moralia in Job, Book XXXI" }],
    quoted: [{ ref: "Proverbs 14:30", text: "The life of the body is a heart at peace, but envy rots the bones." }, { ref: "James 3:16", text: "For where jealousy and selfish ambition are, there is confusion and every evil deed." }],
    quotedFrom: WEBBE },
  { key: 'wrath', slug: 'wrath', name: 'wrath',
    title: "Wrath, one of the seven deadly sins",
    band: { src: "/img/sins/wrath.jpg", alt: "Rembrandt’s painting of Balaam raising his stick over his fallen donkey while an angel with a sword appears above them", posM: "50% 40%", posD: "50% 42%",
      credit: "Picture: Balaam and the Ass, Rembrandt, 1626. Musée Cognacq-Jay, Paris." },
    glance: [{ n: "Ira", label: "In Latin" }, { n: "Patience", label: "Its opposite" }, { n: "Terrace 3", label: "Dante’s Purgatory" }],
    summary: "Anger held past its usefulness, until it hardens into the desire to see someone pay.",
    question: "What is wrath, as one of the seven deadly sins?",
    shortAnswer: "Wrath is anger kept past its use: not the flash of feeling when something is wrong, which Scripture allows, but the grudge nursed, the argument replayed, the wish to see someone pay. It is the one vice that can feel like justice while it is doing its damage.",
    whyItMatters: "Anger is not on the list; wrath is. The Bible tells people to be angry and not sin, and to be slow to it, which is a different instruction from never feeling it. The two statements ask where yours goes afterwards: whether a slight is let go, or kept and sharpened for later.",
    didYouKnow: [{ text: "Anger is the only vice on the list that the Gospels also record in Jesus. Mark writes that He looked round at the men waiting to accuse Him with anger, grieved at the hardness of their hearts, and then healed the man in front of them. The feeling is not the sin; what it hardens into is.", source: "Mark 3:5" }, { text: "Balaam struck his donkey three times in anger before he saw the angel standing in the road with a drawn sword. The donkey had seen it all along.", source: "Numbers 22:21-33" }, { text: "John Cassian warned monks who fled to the desert to get away from people who angered them that the anger would come too. Alone, he wrote, they would rage at a pen that wrote too thick, a blunt knife, or a flint slow to spark.", source: "John Cassian, Institutes, Book VIII" }],
    quoted: [{ ref: "James 1:19", text: "So, then, my beloved brothers, let every man be swift to hear, slow to speak, and slow to anger;" }, { ref: "Ephesians 4:26", text: "“Be angry, and don’t sin.” Don’t let the sun go down on your wrath," }],
    quotedFrom: WEBBE },
  { key: 'sloth', slug: 'sloth', name: 'sloth',
    title: "Sloth, one of the seven deadly sins",
    band: { src: "/img/sins/sloth.jpg", alt: "Nicolaes Maes’s painting of a maid asleep in a kitchen, dishes strewn at her feet, while another woman smiles at the viewer and a cat steals the dinner", posM: "78% 50%", posD: "50% 52%",
      credit: "Picture: The Idle Servant, Nicolaes Maes, 1655. National Gallery, London." },
    glance: [{ n: "Acedia", label: "In Latin" }, { n: "Diligence", label: "Its opposite" }, { n: "Terrace 4", label: "Dante’s Purgatory" }],
    summary: "Acedia: not idleness so much as the listlessness that will not do the good it knows.",
    question: "What is sloth, as one of the seven deadly sins?",
    shortAnswer: "Sloth is not laziness in the ordinary sense. The old word is acedia, a listlessness that will not do the good it knows about: the thing that matters put off again, the good start abandoned when the first enthusiasm goes. A busy person can have it; being busy is one of the ways to avoid the thing that matters.",
    whyItMatters: "Sloth is the vice people are most likely to laugh off, and it costs the most over a life, because it works by subtraction: the friendship not kept up, the gift not used, the apology never got round to. The two statements ask whether you finish what you start and whether pressure is the only thing that moves you.",
    didYouKnow: [{ text: "Acedia comes from a Greek word meaning lack of care. The desert monks who first described it called it the noonday demon, after the line in Psalm 91 about the destruction that wastes at noonday, because it struck in the middle of the day, when the work was half done and the end was nowhere in sight.", source: "Evagrius Ponticus, Praktikos, 12; Psalm 91:6" }, { text: "Evagrius described the monk in its grip. He keeps looking out of the window to see how far the sun has moved, and the day seems fifty hours long.", source: "Evagrius Ponticus, Praktikos, 12" }, { text: "Gregory the Great’s own seven had no sloth in them. He had sadness in that place, and the later Middle Ages brought back the desert monks’ acedia to stand where sloth stands now.", source: "Gregory the Great, Moralia in Job, Book XXXI" }],
    quoted: [{ ref: "Proverbs 13:4", text: "The soul of the sluggard desires, and has nothing, but the desire of the diligent shall be fully satisfied." }, { ref: "Ecclesiastes 10:18", text: "By slothfulness the roof sinks in; and through idleness of the hands the house leaks." }],
    quotedFrom: WEBBE },
  { key: 'greed', slug: 'greed', name: 'greed',
    title: "Greed, one of the seven deadly sins",
    band: { src: "/img/sins/greed.jpg", alt: "Quentin Matsys’s painting of a moneylender weighing coins while his wife, a prayer book open in her hands, watches the money", posM: "50% 40%", posD: "50% 40%",
      credit: "Picture: The Moneylender and His Wife, Quentin Matsys, 1514. Louvre, Paris." },
    glance: [{ n: "Avaritia", label: "In Latin" }, { n: "Generosity", label: "Its opposite" }, { n: "Terrace 5", label: "Dante’s Purgatory" }],
    summary: "Avarice: wanting more than you need, and measuring yourself by what you have gathered.",
    question: "What is greed, as one of the seven deadly sins?",
    shortAnswer: "Greed is wanting more than you need and measuring yourself by what you have gathered. It is not earning, saving or owning things, which the Bible takes for granted, but the grip: money and possessions as the score of your life, and the difficulty of letting any of it go.",
    whyItMatters: "Greed hides well in a culture that admires it. The two statements do not ask how much you have; they ask whether you keep score by it, and whether giving something away comes easily or has to be asked for twice. Jesus warned about it more often than about almost anything else.",
    didYouKnow: [{ text: "Paul calls covetousness idolatry, which is the old writers' point in one word: greed treats a possession as if it could do what only God does. Dante put the hoarders and the spendthrifts in the same circle of hell, rolling great weights against each other for ever, because both had made money the measure of a life.", source: "Colossians 3:5; Dante, Inferno, canto VII" }, { text: "Basil the Great preached on the rich fool who pulled down his barns to build bigger ones. The bread you keep, he told his hearers, belongs to the hungry, and the shoes rotting in your cupboard to the barefoot.", source: "Basil the Great, homily on Luke 12:18, I Will Pull Down My Barns" }, { text: "In the painting at the top of this page the moneylender’s wife has her prayer book open, but her eyes have left the page for the coins on the table.", source: "Quentin Matsys, The Moneylender and His Wife, 1514" }],
    quoted: [{ ref: "Luke 12:15", text: "He said to them, “Beware! Keep yourselves from covetousness, for a man’s life doesn’t consist of the abundance of the things which he possesses.”" }, { ref: "1 Timothy 6:10", text: "For the love of money is a root of all kinds of evil. Some have been led astray from the faith in their greed, and have pierced themselves through with many sorrows." }],
    quotedFrom: WEBBE },
  { key: 'gluttony', slug: 'gluttony', name: 'gluttony',
    title: "Gluttony, one of the seven deadly sins",
    band: { src: "/img/sins/gluttony.jpg", alt: "Pieter Bruegel the Elder’s painting of a soldier, a farmer and a scholar lying asleep and overfed beneath a tree hung with a table of food", posM: "50% 70%", posD: "50% 68%",
      credit: "Picture: The Land of Cockaigne, Pieter Bruegel the Elder, 1567. Alte Pinakothek, Munich." },
    glance: [{ n: "Gula", label: "In Latin" }, { n: "Temperance", label: "Its opposite" }, { n: "Terrace 6", label: "Dante’s Purgatory" }],
    summary: "Taking comfort in consumption: reaching for the thing that dulls rather than the thing that feeds.",
    question: "What is gluttony, as one of the seven deadly sins?",
    shortAnswer: "Gluttony is taking comfort in consumption: reaching for food, drink, or these days a screen, to dull a hard day rather than to meet a need. It is not enjoying a good meal, which Scripture treats as a gift, but the habit of using what you take in to avoid what you feel.",
    whyItMatters: "Gluttony is the vice with the most modern disguises, because the thing reached for need not be food. The two statements ask whether you reach for something to take the edge off, and whether you can stop at enough. Both are about the reaching, not about the size of the plate.",
    didYouKnow: [{ text: "Gregory the Great counted five ways to be a glutton, and only one of them is eating too much: too soon, too finely, too much, too eagerly, and too fussily. Thomas Aquinas repeated the list six centuries later. The old word is the Latin gula, the throat.", source: "Gregory the Great, Moralia in Job, Book XXX; Thomas Aquinas, Summa Theologiae II-II, q. 148, a. 4" }, { text: "The Bible’s plainest picture of it is Esau, who came in hungry from the field and traded his birthright for a bowl of lentil stew. The letter to the Hebrews still remembers him for it.", source: "Genesis 25:29-34; Hebrews 12:16" }, { text: "Ezekiel counts too much food among the sins of Sodom: pride, fullness of bread and prosperous ease, while the poor and needy went without help.", source: "Ezekiel 16:49" }],
    quoted: [{ ref: "Proverbs 23:21", text: "for the drunkard and the glutton shall become poor; and drowsiness clothes them in rags." }, { ref: "Philippians 3:19", text: "whose end is destruction, whose god is the belly, and whose glory is in their shame, who think about earthly things." }],
    quotedFrom: WEBBE },
  { key: 'lust', slug: 'lust', name: 'lust',
    title: "Lust, one of the seven deadly sins",
    band: { src: "/img/sins/lust.jpg", alt: "Rembrandt’s painting of Potiphar’s wife on her bed, holding out Joseph’s cloak to her husband as Joseph stands to one side", posM: "52% 40%", posD: "50% 38%",
      credit: "Picture: Joseph Accused by Potiphar’s Wife, Rembrandt, 1655. Gemäldegalerie, Berlin." },
    glance: [{ n: "Luxuria", label: "In Latin" }, { n: "Chastity", label: "Its opposite" }, { n: "Terrace 7", label: "Dante’s Purgatory" }],
    summary: "Desire detached from love, treating a person as something to be used.",
    question: "What is lust, as one of the seven deadly sins?",
    shortAnswer: "Lust is desire detached from love: wanting a person as something to be used rather than someone to be known. It is not attraction, and it is not marriage, both of which the Bible blesses. It is the look that lingers where it should not, and what the mind does with it afterwards.",
    whyItMatters: "Jesus moved this one from the act to the look, which is why the two statements ask about attention rather than behaviour: where you let your eyes rest, and whether you guard them when nobody would know either way. Nobody else can answer those two for you, which is what makes them worth answering honestly.",
    didYouKnow: [{ text: "Of the seven, Dante judged lust the least grave: it is the first circle of his hell after limbo, where the lustful are blown about by a storm that never rests, and Paolo and Francesca tell their story. The old word is the Latin luxuria, which meant excess of every kind before it narrowed to this one.", source: "Dante, Inferno, canto V" }, { text: "As a young man Augustine prayed: give me chastity and self-control, but not yet. He was afraid, he wrote, that God would answer him too soon.", source: "Augustine, Confessions, Book VIII" }, { text: "Joseph’s answer to Potiphar’s wife is the Bible’s shortest guard against it. When she caught hold of his cloak, he left it in her hand and ran.", source: "Genesis 39:7-12" }],
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
  ['gluttony', 'I find it easy to stop eating, drinking or scrolling once I have had enough.', -1],
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
  quietGroupPages: true,
  rankRowsOpen: true,
  notes: {
    introShort:
      'Nobody is free of all seven, and most people already know which one pulls hardest; this asks you to say so honestly.',
    scale:
      'Agree means the sentence is true of you as you usually are, not on your best day or your worst.',
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
