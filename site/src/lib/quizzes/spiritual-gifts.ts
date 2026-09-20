/**
 * What are your spiritual gifts? A DRAFT, and NOT REGISTERED.
 *
 * Thirteen gifts, three statements each (at least one reverse-keyed), scored by the same
 * highest-category strategy as the seven deadly sins draft. See QUIZ-BLUEPRINTS.md, quiz two,
 * and audit/new-quizzes/gifts-final.md for every statement with its provenance.
 *
 * What is real here and what is not:
 *   - The gifts, the passages and the cited acts are real. Every quotation below is verbatim
 *     from the World English Bible British Edition (WEBBE) held on disk at
 *     demos/sounds-like-scripture/work/verses-all.json (src "webbe"), and was checked as a
 *     substring of that file. Never retype one from memory.
 *   - The STATEMENTS ARE NOT AUDITED. They came from two independent drafts and two
 *     adversarial critiques, then one editor. They have not had the Compass's audit, and the
 *     owner has not played them. That is why status is 'draft'.
 *
 * Not in this draft: prophecy, healing, miracles, tongues and their interpretation. Whether
 * and how to include them is the OWNER'S OPEN DECISION (see draftNote and
 * giftsFrame.notIncluded). Nothing here may imply they are lesser or that they have ceased.
 *
 * For the engineer who wires this:
 *   - `giftSources`, `giftActs` and `giftsFrame` are exported beside the quiz on purpose and
 *     are NOT put in QuizGroup.history / QuizGroup.passages. HistoryTimeline is headed "How
 *     the argument unfolded" and PassagePills "Passages both sides argue from" with BSB text;
 *     both headings are false for a gift, and the quotations here are WEBBE, not BSB.
 *   - category.ts prints "leaned away", "a strong pull" and a bare one-word headline. Those
 *     words were written for vices. For a gift they read as a verdict ("leaned away" beside
 *     "Be hospitable to one another"), so this quiz needs its own strength words, a headline
 *     frame, the low-row sentence and flat-state copy in giftsFrame, and a share card that
 *     shows the top three only and never the bottom of the ranking.
 */
import { category } from '../strategies/category';
import { groupHref } from '../engine/urls';
import { theologyCompass } from './theology-compass';
import type { Quiz, QuizGroup, QuizItem } from '../engine/types';

/**
 * The Compass axis where the disagreement this quiz leaves out is set out in both sides'
 * own words. Resolved from the Compass's own group list through the URL builder, so it
 * cannot drift: that axis is keyed `spirit` and published at /gifts/, and a href written
 * from the key would 404. urls.ts rather than registry.ts, which would be a cycle.
 */
const giftsAxis = theologyCompass.groups.find(g => g.slug === 'gifts');
const giftsAxisHref = giftsAxis ? groupHref(theologyCompass, giftsAxis) : undefined;

/** The listing passage(s) for each gift. `text` is verbatim WEBBE, a substring of `ref`. */
export interface GiftSource {
  ref: string;
  text: string;
}

/** A recorded act from Acts or the letters. `what` describes what was done; it is not a quotation. */
export interface GiftAct {
  ref: string;
  what: string;
}

const WEBBE = 'World English Bible British Edition';

export const giftSources: Record<string, GiftSource[]> = {
  serving: [
    { ref: 'Romans 12:7', text: 'or service, let’s give ourselves to service' },
    { ref: '1 Corinthians 12:28', text: 'helps' }
  ],
  teaching: [{ ref: 'Romans 12:7', text: 'he who teaches, to his teaching' }],
  encouraging: [{ ref: 'Romans 12:8', text: 'he who exhorts, to his exhorting' }],
  giving: [{ ref: 'Romans 12:8', text: 'he who gives, let him do it with generosity' }],
  leading: [{ ref: 'Romans 12:8', text: 'he who rules, with diligence' }],
  mercy: [{ ref: 'Romans 12:8', text: 'he who shows mercy, with cheerfulness' }],
  administration: [{ ref: '1 Corinthians 12:28', text: 'governments' }],
  wisdom: [{ ref: '1 Corinthians 12:8', text: 'to one is given through the Spirit the word of wisdom' }],
  discernment: [{ ref: '1 Corinthians 12:10', text: 'to another discerning of spirits' }],
  faith: [{ ref: '1 Corinthians 12:9', text: 'to another faith by the same Spirit' }],
  evangelism: [{ ref: 'Ephesians 4:11', text: 'and some, evangelists' }],
  shepherding: [{ ref: 'Ephesians 4:11', text: 'and some, shepherds and teachers' }],
  hospitality: [
    {
      ref: '1 Peter 4:9-10',
      text:
        'Be hospitable to one another without grumbling. As each has received a gift, employ it ' +
        'in serving one another, as good managers of the grace of God in its various forms.'
    }
  ]
};

/** The plain sentence that follows the quotation in each summary. One sentence each. */
const PLAIN: Record<string, string> = {
  serving:
    'Romans says service and 1 Corinthians says helps, and this draft treats them as one: doing the practical work that other people’s work depends on.',
  teaching: 'Making a thing understood, and staying with a person until it is.',
  encouraging:
    'The translation quoted here says exhorting where many others say encouraging: speaking so that someone takes heart and keeps going.',
  giving:
    'Letting money and possessions go where they are needed; nothing here counts how much.',
  leading:
    'The translation quoted here says rules where many others say leads: taking on the direction of a shared work and answering for it.',
  mercy: 'Going towards people in distress and staying, with nothing to fix.',
  administration:
    'The translation quoted here says governments where many others say administration or guidance: keeping the order that a shared work runs on.',
  wisdom:
    'The passage names a word of wisdom, something said, and these statements can see only the everyday pattern of being brought hard choices and asked what to do.',
  discernment:
    'The passage names the discerning of spirits, which is more than being shrewd about people and offers, and these statements can see only that everyday pattern.',
  faith:
    'Listed as something given to some and not to others, so it is not about whether you believe; these statements look only for a habit of going ahead before the outcome is secured.',
  evangelism: 'Telling the good news to people who have not heard it or do not hold it.',
  shepherding:
    'Many translations say pastors: watching over the same people for a long time.',
  hospitality:
    'Peter asks hospitality of everyone and speaks of each person’s gift in the next sentence, so coming out low here releases nobody from the first.'
};

export const giftActs: Record<string, GiftAct[]> = {
  serving: [
    { ref: 'Acts 6:1-6', what: 'When the Hellenists complained that their widows were neglected in the daily service, the disciples chose seven men and the apostles appointed them over that business.' },
    { ref: 'Romans 16:1-2', what: 'Paul commends Phoebe, a servant of the assembly at Cenchreae, and asks the Romans to assist her because she has been a helper of many, himself included.' }
  ],
  teaching: [
    { ref: 'Acts 18:24-26', what: 'Apollos taught accurately about Jesus but knew only the baptism of John; Priscilla and Aquila took him aside and explained the way of God to him more accurately.' },
    { ref: 'Acts 11:25-26', what: 'Barnabas fetched Saul from Tarsus to Antioch, where for a whole year the two met with the assembly and taught many people.' }
  ],
  encouraging: [
    { ref: 'Acts 4:36', what: 'The apostles called Joses of Cyprus Barnabas, which Luke translates as Son of Encouragement.' },
    { ref: 'Acts 11:22-23', what: 'Sent to Antioch, Barnabas saw what had happened there, was glad, and exhorted them all to remain near to the Lord with purpose of heart.' },
    { ref: 'Acts 15:30-32', what: 'After the letter from Jerusalem was read at Antioch, Judas and Silas encouraged the brothers with many words and strengthened them.' }
  ],
  giving: [
    { ref: 'Acts 4:34-37', what: 'Owners of lands and houses sold them and laid the proceeds at the apostles’ feet, Barnabas among them with the price of a field, and distribution was made to each as anyone had need.' },
    { ref: '2 Corinthians 8:1-5', what: 'Paul reports that the assemblies of Macedonia, in deep poverty, gave of their own accord beyond their power and begged to share in the service to the saints.' }
  ],
  leading: [
    { ref: 'Acts 15:13-29', what: 'At Jerusalem, once the others had fallen silent, James gave his judgement on what to ask of the Gentiles, and the apostles, elders and whole assembly sent it out in a letter.' },
    { ref: 'Acts 6:2-4', what: 'Faced with the neglected widows, the twelve set out how the work should be divided: seven men over that business, and themselves kept to prayer and the word.' }
  ],
  mercy: [
    { ref: 'Acts 9:36-39', what: 'Tabitha of Joppa, whom Luke describes as full of good works and acts of mercy, had made tunics and other garments, which the widows showed Peter, weeping, after she died.' },
    { ref: '2 Timothy 1:16-18', what: 'Paul writes that Onesiphorus often refreshed him, was not ashamed of his chain, and in Rome sought him diligently and found him.' }
  ],
  administration: [
    { ref: 'Titus 1:5', what: 'Paul left Titus in Crete to set in order the things that were lacking and to appoint elders in every city, as he had directed.' },
    { ref: '2 Corinthians 8:18-21', what: 'A brother appointed by the assemblies travelled with the collection, so that nobody could blame Paul’s company over the money they were administering.' }
  ],
  wisdom: [
    { ref: 'Acts 6:9-10', what: 'Men from several synagogues disputed with Stephen and were not able to withstand the wisdom and the Spirit by which he spoke.' },
    { ref: 'Acts 6:3', what: 'The twelve asked the disciples to select seven men of good report, full of the Holy Spirit and of wisdom.' }
  ],
  discernment: [
    { ref: 'Acts 8:18-23', what: 'When Simon offered money for the power to give the Holy Spirit, Peter told him his heart was not right before God and said what he saw in him.' },
    { ref: 'Acts 5:1-4', what: 'Ananias kept back part of a sale price and laid the rest at the apostles’ feet; Peter asked him why he had lied and kept part back.' }
  ],
  faith: [
    { ref: 'Acts 27:21-25', what: 'In the storm, with those aboard long without food, Paul stood up and told them to cheer up, saying he believed God that it would be just as he had been told.' },
    { ref: 'Acts 6:5', what: 'Among the seven the disciples chose, Luke singles out Stephen as a man full of faith and of the Holy Spirit.' }
  ],
  evangelism: [
    { ref: 'Acts 8:5-8', what: 'Philip went down to the city of Samaria and proclaimed the Christ to them, and there was great joy in that city.' },
    { ref: 'Acts 8:26-35', what: 'Philip ran to the Ethiopian official’s chariot, asked whether he understood what he was reading, and beginning from that Scripture told him about Jesus.' },
    { ref: 'Acts 21:8', what: 'Luke later calls him Philip the evangelist, and Paul’s company stayed at his house in Caesarea.' }
  ],
  shepherding: [
    { ref: 'Acts 20:28-31', what: 'Paul told the Ephesian elders to take heed to themselves and to all the flock, reminding them that for three years he had not ceased to admonish everyone night and day with tears.' },
    { ref: '1 Peter 5:1-3', what: 'Peter tells the elders to shepherd the flock willingly and not under compulsion, not lording it over those entrusted to them but as examples.' }
  ],
  hospitality: [
    { ref: 'Acts 16:14-15', what: 'After Lydia and her household were baptised at Philippi, she begged Paul’s company to come into her house and stay, and persuaded them.' },
    { ref: 'Romans 16:23', what: 'Paul sends greetings from Gaius, whom he calls his host and host of the whole assembly.' }
  ]
};

/*
 * The summary used to open with the listing verse, because there was nowhere else for it
 * to go. There is now: the group's `quoted` field, which the group page prints in the
 * passage's own words, above this sentence. Keeping both printed the same verse twice on
 * one screen, so the summary is the plain description alone — the quotation is not lost,
 * it is one block higher up and correctly attributed to its translation.
 */
const summaryOf = (key: string) => PLAIN[key]!;

/** [key, slug, name]. Names are lower case, as in the sins quiz; the strategy capitalises. */
const GIFTS: Array<[string, string, string]> = [
  ['serving', 'serving', 'serving'],
  ['teaching', 'teaching', 'teaching'],
  ['encouraging', 'encouraging', 'encouraging'],
  ['giving', 'giving', 'giving'],
  ['leading', 'leading', 'leading'],
  ['mercy', 'mercy', 'showing mercy'],
  ['administration', 'administration', 'administration'],
  ['wisdom', 'wisdom', 'wisdom'],
  ['discernment', 'discernment', 'discernment'],
  // Not the bare word. A reader who comes out low on something called "faith" hears "you do
  // not believe", and the share text prints the name with no gloss beside it.
  ['faith', 'faith', 'the gift of faith'],
  ['evangelism', 'evangelism', 'evangelism'],
  ['shepherding', 'shepherding', 'shepherding'],
  ['hospitality', 'hospitality', 'hospitality']
];

/**
 * `quoted` and `acts` are the engine's own group fields, wired 2026-09-19. They are NOT
 * `passages` and NOT `history`: PassagePills is headed "Passages both sides argue from"
 * and prints BSB text, and HistoryTimeline is headed "How the argument unfolded" — both
 * headings are false for a gift, and these quotations are WEBBE. The group page prints
 * `quoted` under "The passage it is named from" and `acts` under "What it has looked like".
 */
const groups: QuizGroup[] = GIFTS.map(([key, slug, name]) => ({
  key,
  slug,
  name,
  summary: summaryOf(key),
  quoted: giftSources[key]!,
  quotedFrom: WEBBE,
  acts: giftActs[key]!
}));

/**
 * Three per gift, in the order [key, text, direction]. Direction was re-derived from the
 * final wording: +1 where agreeing describes the gift's pattern, -1 where agreeing describes
 * its absence. Provenance for every line is in audit/new-quizzes/gifts-final.md.
 *
 * The reverse-keyed item sits in a different slot from gift to gift so that the running
 * order below never produces a round that is all reverse items.
 */
const RAW: Array<[string, string, 1 | -1]> = [
  ['serving', 'When something practical needs doing, I have usually started before anyone asked me to.', 1],
  ['serving', 'I tend to leave the practical jobs to whoever is better at them than me.', -1],
  ['serving', 'People ask me when an errand needs running or a form needs filling in, and I usually say yes.', 1],

  ['teaching', 'People come to me to have something explained, even when they only wanted the short answer.', 1],
  ['teaching', 'I check whether the other person actually followed me before I move on.', 1],
  ['teaching', 'I would rather send somebody a good link than sit down and walk them through it.', -1],

  ['encouraging', 'When a friend is hesitating, I leave them to decide rather than press them.', -1],
  ['encouraging', 'People come to me when they need a push to do the thing they are avoiding.', 1],
  ['encouraging', 'I tell people what I think they are capable of, even when they have not asked.', 1],

  ['giving', 'I give away things I am still using when somebody needs them more than I do.', 1],
  ['giving', 'Even when I have the money, I find it easier to give my time.', -1],
  ['giving', 'When somebody needs money and I have it, I decide quickly and rarely think about it again.', 1],

  ['leading', 'People look at me when a decision has to be made and nobody wants to make it.', 1],
  ['leading', 'I end up answering for how the whole thing went, including parts other people did.', 1],
  ['leading', 'I would rather be told where we are going than be the one to decide it.', -1],

  ['mercy', 'When somebody is in pain I want to fix the cause rather than sit with it.', -1],
  ['mercy', 'When somebody starts crying, I move closer rather than give them room.', 1],
  ['mercy', 'I notice the person who is not coping before I notice anything else in the room.', 1],

  ['administration', 'When plans are loose, I write them down and send them round without being asked.', 1],
  ['administration', 'I keep most of my week in my head rather than written down.', -1],
  ['administration', 'People send me the details because they know I will keep track of them.', 1],

  ['wisdom', 'When two good options are on the table, people ask me which one to take.', 1],
  ['wisdom', 'In an argument I end up saying what I think the disagreement is actually about.', 1],
  ['wisdom', 'I would rather say what I would do than work out what suits them.', -1],

  ['discernment', 'I would rather assume the best of somebody than test whether they are being straight.', -1],
  ['discernment', 'Friends check a person or an offer with me before they commit to it.', 1],
  ['discernment', 'I decide something is off about a person before I could say what it is.', 1],

  ['faith', 'I commit to things before I can see how they will be paid for or finished.', 1],
  ['faith', 'When the odds look bad, I am the one naming what could go wrong.', -1],
  ['faith', 'I keep going with a project long after other people have written it off.', 1],

  ['evangelism', 'I end up talking about God with people I have only just met.', 1],
  ['evangelism', 'I bring up what I believe with people who do not share it, without much trouble.', 1],
  ['evangelism', 'I keep what I believe to myself unless somebody asks me directly.', -1],

  ['shepherding', 'I give people what they need at the time and let it end there.', -1],
  ['shepherding', 'I keep following up with the same few people long after everybody else has moved on.', 1],
  ['shepherding', 'People I helped years ago still come back to me when something goes wrong.', 1],

  ['hospitality', 'I add a seat for whoever turns up rather than keep to the numbers I planned for.', 1],
  ['hospitality', 'I would rather meet people somewhere out than have them in my home.', -1],
  ['hospitality', 'I invite people over without waiting until the place is tidy.', 1]
];

const keys = groups.map(g => g.key);
const PER = 3;

/**
 * The running order. A reader meets one statement at a time, and three in a row about the
 * same gift would announce the gift, so the instrument runs in three rounds of thirteen:
 * round r takes each gift's r-th statement, and each round walks the gifts from a different
 * start with a different stride (13 is prime, so every stride visits every gift once). No two
 * statements from one gift are ever adjacent, and neighbouring gifts (wisdom and discernment,
 * mercy and shepherding) do not follow one another in the same order twice.
 */
const ROUNDS: Array<[start: number, stride: number]> = [[0, 1], [4, 5], [9, 8]];

const ordered: Array<[string, string, 1 | -1]> = ROUNDS.flatMap(([start, stride], r) =>
  keys.map((_, k) => RAW[((start + k * stride) % keys.length) * PER + r]!)
);

const items: QuizItem[] = ordered.map(([key, text, direction], i) => ({
  n: i + 1,
  text,
  group: keys.indexOf(key),
  direction
}));

/**
 * The honest frame. The blueprint requires it on the intro and on the result. The Quiz type
 * has no slot for it yet, so it is exported for the engineer to place.
 *
 * The blueprint's own wording is "for the common good"; the translation on disk says "for the
 * profit of all" (1 Corinthians 12:7), and this site quotes the text on disk.
 */
export const giftsFrame = {
  translation: WEBBE,
  intro:
    'Scripture gives lists of gifts. It gives no test for them. The lists say each is given ' +
    '“for the profit of all” (1 Corinthians 12:7), and gifts are recognised in service, by ' +
    'other people, over time. So this is a conversation starter, not a verdict: thirty-nine ' +
    'statements cannot see your last ten years. If you know the lists you will sometimes see ' +
    'which gift a statement is about, which is one more reason to take the result to two or ' +
    'three people who have watched you serve and ask them whether it is true.',
  /** The one line for above the start button on a phone, if the full intro sits below it. */
  introShort:
    'Scripture lists gifts and gives no test for them; other people usually name yours before you do.',
  result:
    'This is where your answers pointed. It is not a measurement of what God has given you. ' +
    'Nobody is only one of these, the list here is not everything Scripture names, and a ' +
    'self-report can be wrong in both directions, about what you avoid as much as what you ' +
    'are good at. The useful step is not to believe this page. It is to send it to somebody ' +
    'who has served alongside you and ask whether it matches what they have seen.',
  /** What a low row means. Must print wherever a gift is shown below the line. */
  low:
    '“As each has received a gift, employ it in serving one another” (1 Peter 4:10). A gift ' +
    'low on this page is a pattern these statements did not find, not a verdict on you. And ' +
    'some of these are asked of everyone: “Be hospitable to one another without grumbling” ' +
    '(1 Peter 4:9) comes one verse earlier.',
  /** Replaces the strategy's flat-state summary for this quiz. */
  flat:
    '“As each has received a gift, employ it in serving one another” (1 Peter 4:10). ' +
    'Thirty-nine statements found no pattern standing out. That is a fact about the ' +
    'statements, not about you; ask the people who have watched you serve.',
  /** A headline frame, so the largest type on the page is not a bare one-word verdict. */
  headlineLead: 'Your answers pointed most to',
  notIncluded:
    'Prophecy, healing, miracles, tongues and their interpretation are not in this draft. ' +
    '(The translation quoted here says “prophecy”, “gifts of healings”, “workings of ' +
    'miracles”, “different kinds of languages” and “the interpretation of languages”: ' +
    '1 Corinthians 12:9-10.) That is not because they are lesser or have stopped. Christians ' +
    'reading the same passages disagree about whether and how they are given today, and a ' +
    'set of statements about yourself could not measure them fairly either way.',
  /** Link this to the Compass axis with groupHref(): its slug is `gifts`, its key is `spirit`. */
  notIncludedLink:
    'The Theology Compass sets that disagreement out in both sides’ own words.'
} as const;

export const spiritualGifts: Quiz = {
  slug: 'spiritual-gifts',
  title: 'What are your spiritual gifts?',
  tagline: 'Thirty-nine statements, thirteen gifts, and a conversation to have afterwards.',
  description:
    'Thirteen gifts the New Testament lists, each in its passage’s own words. Thirty-nine ' +
    'plain statements about what you do and what people bring you. Scripture gives no test ' +
    'for gifts, so check the result with people who know you.',
  icon: 'scroll',
  minutes: 5,
  status: 'draft',
  draftNote:
    'This one is an unaudited draft. The thirteen gifts and the passages that list them are ' +
    'quoted from the World English Bible British Edition, but these statements have not been ' +
    'through the adversarial fairness audit the Theology Compass went through, and nobody ' +
    'has played them yet. Still open, and the owner’s to decide: whether and how to include ' +
    'prophecy, healing, miracles, tongues and their interpretation. They are left out of this ' +
    'draft for now, which says nothing about whether they are lesser or have ceased. Treat ' +
    'the result as a conversation starter, not a verdict.',
  items,
  groups,
  // The highest-category strategy ranks the groups themselves; it reads no outcomes.
  outcomes: [],
  strategy: category,
  config: {
    // Three items per group: raw runs -6..+6, so 13 reachable scores per group. The registry
    // checks this (items * 4 + 1). 13^13 is about 3.0e14, inside the codec's safe-integer limit.
    radix: 13,
    // Points a gift must clear above no-net-agreement before it is named at all. Each gift has
    // two forward statements and one reverse, so a reader who agrees with everything scores 67
    // on all thirteen. At the sins quiz's floor of 10 that reader would be handed two gifts
    // chosen by the alphabet. At 17 they are told nothing stood out, which is true, and a gift
    // is named from 75 up: net agreement worth three of the six available points.
    namingFloor: 17,
    // One rung is the difference between "agree" and "strongly agree" on a single statement.
    // With thirteen categories that is too little to separate a first from a second, so two
    // gifts one rung apart are reported as level.
    tieSteps: 1
  },
  shareTitle: 'Where my answers pointed: spiritual gifts',
  codePrefix: 'SG',

  /**
   * The honest frame, in the engine's generic slots: the intro before a reader starts, the
   * result under the ranking, the low-row sentence wherever a gift comes out below, and the
   * deliberate omission with a link to the Compass axis that sets the disagreement out.
   */
  notes: {
    intro: giftsFrame.intro,
    result: giftsFrame.result,
    low: giftsFrame.low,
    omitted: {
      text: giftsFrame.notIncluded,
      linkText: giftsFrame.notIncludedLink,
      // Built from the axis's SLUG through the URL builder. The Compass's Gifts axis is
      // keyed `spirit` and published at /gifts/, so a href written from the key would 404.
      href: giftsAxisHref
    }
  },

  /**
   * The strategy's own words were written for VICES. "Leaned away" beside "Be hospitable to
   * one another" reads as a verdict on the reader, and a bare one-word headline reads as
   * one too, so this quiz supplies its own; the seven-deadly-sins draft keeps the defaults.
   */
  unipolarCopy: {
    strength: {
      // Short enough to sit on one line beside the name on a phone, and about the
      // INSTRUMENT rather than the reader: what these statements found, not what you are.
      below: 'not found here',
      level: 'nothing either way',
      above: ['a little', 'some of this', 'a lot of this', 'the most here']
    },
    headlineLead: giftsFrame.headlineLead,
    flat: giftsFrame.flat,
    // The top three only. The bottom of a gifts ranking is the part a reader would least
    // want pasted into a group chat, and the caveat that travels with a low row on the page
    // cannot travel with a bar in a text message.
    shareTop: 3
  }
};
