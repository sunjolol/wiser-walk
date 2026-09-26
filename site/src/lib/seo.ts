import ogCards from '../data/og-cards.json';
import type { Quiz, ResultView } from './engine/types';
/**
 * What a page says to a search engine, where that should differ from what it says to a reader.
 *
 * The pages are named for readers ("Theology Compass", "Gifts"). People searching do not know
 * those names: they type "what denomination am I" or "which denominations are cessationist".
 * The research brief (research/BRIEF.md, section 3) found the flagship never used the word
 * "denomination" and the six axis pages sat under one-word titles while holding the audited
 * answer to a whole family of questions. This table changes only the <title> and the meta
 * description for those paths. The visible page, its headings and its audited wording are
 * untouched. Every description states only what the page really contains, in the axis's own
 * pole vocabulary, and picks no winner.
 */
export const SEO: Record<string, { title: string; description: string }> = {
  /*
   * Rewritten 2026-09-21 on the owner's instruction: the old home description ("...Every claim
   * cited.") described how the site was made instead of inviting anyone in. Each entry now
   * leads with the question a searcher actually types, says what they get and what it costs
   * (minutes, and that it is free), and stops. No process talk, no promise the site may not
   * keep (nothing about sign-up or storage), titles near 60 characters, descriptions under 160.
   */
  '/': {
    title: 'Wiser Walk: free Christian quizzes and Bible games',
    description:
      'Which Christian tradition are you closest to? Which Bible figure are you most like? What are your spiritual gifts? Free quizzes and Bible games, minutes each.'
  },
  '/quizzes/': {
    title: 'Free Christian quizzes: denomination, gifts, Bible character',
    description:
      'Find the Christian tradition nearest your beliefs, the Bible figure you are most like and your spiritual gifts. Free quizzes, most done in three minutes.'
  },
  '/games/': {
    title: 'Free Bible games: Sounds Like Scripture and Who Said It?',
    description:
      'Is that line really in the Bible, or does it only sound like it? And who said it? Two fast, free Bible games from over 2,000 real lines. Two minutes a run.'
  },
  '/articles/': {
    title: 'Christian articles: gratitude, patience, forgiveness, worry',
    description:
      'Short, practical reads on becoming more grateful, patient, humble and content, on forgiving someone who hurt you, and on what the Bible says about worry.'
  },
  /*
   * The comparison hub (2026-09-21). The individual pages carry their own `searchTitle` and
   * description in their data files, because each one is aimed at a query of its own
   * ("lutheran vs reformed"); only the hub is a fixed path, so only the hub belongs here.
   * It leads with the two words people type at the hub level and then names the pair most
   * of them arrive looking for.
   */
  '/compare/': {
    title: 'Compare Christian traditions, two at a time',
    description:
      'Lutheran vs Reformed, Calvinism vs Arminianism, Catholic vs Orthodox: what actually separates them, with both traditions drawn on the same six axes.'
  },
  /*
   * The Psalm guide (2026-09-23): the hub the 78 psalm pages hang from. People search "a psalm
   * for" what they are in, and "which psalm to read when"; the title answers both, and names
   * the Father the whole guide is his.
   */
  '/psalm/': {
    title: 'A psalm for every situation: St Athanasius’s guide',
    description:
      'Betrayed, afraid, worn down, grateful? In the 300s St Athanasius matched the Psalms to what people go through. Find yours among 53, with the whole psalm.'
  },
  '/about/': {
    title: 'About Wiser Walk',
    description:
      'Wiser Walk makes free quizzes, Bible games and articles that help Christians understand themselves, with every tradition described in its own people’s words.'
  },
  '/support/': {
    title: 'Support Wiser Walk: keep the quizzes and games free',
    description:
      'Every quiz, game and article on Wiser Walk is free. If one has been worth something to you, you can help keep it that way, once or monthly.'
  },
  '/q/theology-compass/': {
    title: 'Theology Compass: which denomination fits your beliefs?',
    description:
      '18 statements, 3 minutes. See which of 18 Christian traditions sits nearest your beliefs, from Catholic and Orthodox to Baptist and Pentecostal. Free.'
  },
  '/q/bible-figure/': {
    title: 'Which Bible character are you most like? Free 3-minute quiz',
    description:
      '18 statements about how you act, speak and lead. See which of 25 Bible figures you are most like, from Moses and Esther to Peter and Paul, with the verses.'
  },
  '/q/spiritual-gifts/': {
    title: 'Spiritual gifts test: free, 17 gifts, about 10 minutes',
    description:
      'A free spiritual gifts test on 17 gifts the New Testament names, from teaching and mercy to healing, prophecy and miracles. 51 statements, about 10 minutes.'
  },
  '/data/theology-compass/': {
    title: '18 Christian traditions on six axes: the table, free CSV',
    description:
      'Where 18 Christian traditions stand on grace, the Lord’s Supper, the gifts, Israel and the church, authority and worship, as one table you can read or download.'
  },
  '/q/spiritual-gifts/print/': {
    title: 'Printable spiritual gifts test: 17 gifts, with scoring key',
    description:
      'The 51-statement spiritual gifts test on paper, free, with a scoring key for 17 gifts. Print it for a class, a small group or a church.'
  },
  /* Added with the quiz (2026-09-23). People do not search for the quiz's name; they search
     "what psalm should I read" and "a psalm for" whatever they are in. The title keeps the
     quiz's own question, which already says both, and the description says what the page
     really does: a few taps, then one psalm, in full, with the reason a Father gave for it. */
  '/q/which-psalm/': {
    title: 'Which Psalm are you living right now? Free 3-minute quiz',
    description:
      'Answer a few honest questions about your life right now. Then read the psalm St Athanasius gave for exactly that in the 300s. Free, about 3 minutes.'
  },
  /* Added with the quiz (2026-09-23). The title keeps the quiz's own question, which is what
     makes it worth a tap, and says what it costs; the description says what happens: you agree
     or disagree, then meet two real people. */
  '/q/which-early-christian/': {
    title: 'Which early Christian thinks like you? Free 4-minute quiz',
    description:
      'Agree or disagree with 23 opinions real early Christians held. Then meet the one who thinks most like you, and the one who would argue. Free, about 4 minutes.'
  },
  /* Added with the test (2026-09-24). People search the words "Christian personality test", so
     the title leads with them (the test's own name, the owner's ruling) and asks the question the
     test answers. The description says what it costs and what comes back, and names the Father
     the types are drawn from. */
  '/q/personality/': {
    title: 'Christian Personality Test: which of 8 types are you? Free',
    description:
      'A free Christian personality test built on St Gregory the Great. 72 quick choices, about 15 minutes. Then a ten-page portrait of who you are and where you fit.'
  },
  /*
   * Its question hub (2026-09-23): it leads with the question as people ask it, and says what
   * each page holds, both sides. Its people hub, /early-christian/, is gone: the Saints hub
   * (/saints/) replaced it on 2026-09-25 and the old address redirects there (vercel.json).
   */
  '/early-church-on/': {
    title: 'What did the early Christians believe? 23 questions, both sides',
    description:
      'What did 22 early Christians say about war, lying, wealth and grief? See both sides of 23 questions, with a source for every line.'
  },
  '/q/seven-deadly-sins/': {
    title: 'Which of the 7 deadly sins are you weakest to? Free quiz',
    description:
      '14 statements, 2 minutes. See which of the seven deadly sins your answers lean towards, ranked from strongest to weakest.'
  },
  '/play/sounds-like-scripture/': {
    title: 'Sounds Like Scripture: is it in the Bible or not? Free game',
    description:
      'A line appears. Is it really in the Bible, or does it only sound like it? Ten lines, a few seconds each, over 900 real lines. Free, and harder than you think.'
  },
  '/play/who-said-it/': {
    title: 'Who Said It? A free Bible quotes game',
    description:
      'One line of speech from the Bible and four names under it. Job or his friends? Peter or Paul? Ten lines a run, over 1,200 real lines, free to play.'
  },
  /*
   * The six Compass axis pages, re-aimed 2026-09-21 at the words people actually type.
   *
   * The previous set led with the vocabulary of the argument \u2014 "monergism vs synergism",
   * "cessationist vs continuationist" \u2014 which is what the holders call it and not what a
   * searcher calls it. Almost nobody types monergism; a great many people type
   * "predestination vs free will", "have the gifts of the spirit ceased", "is communion
   * the real body of christ", "what is the rapture", "sola scriptura". So the everyday
   * phrase leads and the term of art follows it, on the page as well as here: each page
   * now opens on the same question and answers it in forty to fifty words.
   *
   * Every description still says only what the page really holds \u2014 both cases in their own
   * words, and all 18 traditions placed on that axis \u2014 and still picks no winner.
   */
  '/axis/theology-compass/grace/': {
    title: 'Predestination vs free will: what each church believes',
    description:
      'Does God alone bring someone to faith (monergism), or does each person freely cooperate (synergism)? Both cases in their own words, and 18 traditions placed.'
  },
  '/axis/theology-compass/table/': {
    title: 'Real presence vs symbol: what churches believe on communion',
    description:
      'Is Christ truly present in the bread and the cup, or is the Supper a remembrance? The sacramental and memorial views, and where 18 traditions sit.'
  },
  '/axis/theology-compass/gifts/': {
    title: 'Have the gifts ceased? Speaking in tongues and prophecy',
    description:
      'Cessationists say the sign gifts ended with the apostles; continuationists say tongues, prophecy and healing continue. Both cases, and 18 traditions placed.'
  },
  '/axis/theology-compass/kingdom/': {
    title: 'Israel, the church and the rapture: one people or two?',
    description:
      'Dispensationalists expect a rapture and a literal kingdom for Israel; others say the church inherits the promises to Abraham. Both views, and 18 traditions.'
  },
  '/axis/theology-compass/authority/': {
    title: 'Bible alone vs Bible and tradition: who has the last word?',
    description:
      'Is Scripture the only infallible authority, or is it read within the creeds, councils and teaching of the church? Both cases, and 18 traditions placed.'
  },
  '/axis/theology-compass/worship/': {
    title: 'Liturgy or free worship: why church services differ',
    description:
      'A set order, the church calendar and communion every Sunday, or a service each congregation shapes for itself? Both cases, and where 18 traditions sit.'
  },

  /*
   * The six figure-quiz axis pages, added 2026-09-21.
   *
   * These had no entry, so they fell through to the template and shipped titles in the
   * quiz's private vocabulary ("Voice: Says it or Holds it") over descriptions sliced at
   * 155 characters in the middle of a word ("Others keep a thought and tu"). The template
   * no longer cuts mid-word, but a fallback is not a headline: each of these is the only
   * indexable page that links to all 25 figure pages, so each gets the question a person
   * would actually ask.
   *
   * Two rules held in every one. The opening clause of each description is the axis
   * summary's OWN first words, so nothing is paraphrased into something the audited prose
   * does not say; and every one carries "Neither is the better way to be", which is the
   * axis's own last sentence and the whole point of a temperament axis. Nothing here
   * promises verses: the verses are on the 25 figure pages, not on these.
   */
  '/axis/bible-figure/pace/': {
    title: 'Do you act first or weigh it first? 25 Bible figures',
    description:
      'Some people move as soon as they see what is needed. Others wait until they have thought it through. Neither is the better way to be. Where 25 figures sit.'
  },
  '/axis/bible-figure/voice/': {
    title: 'Do you say it or hold it? Where 25 Bible figures sit',
    description:
      'Some people think out loud. Others keep a thought and turn it over before it is heard, if it ever is. Neither is the better way to be. Where 25 figures sit.'
  },
  '/axis/bible-figure/lead/': {
    title: 'Out in front or alongside? 25 Bible figures on leading',
    description:
      'Some people step to the front when a group needs direction. Others add their weight to someone else\u2019s effort. Neither is the better way to be, in 25 figures.'
  },
  '/axis/bible-figure/conflict/': {
    title: 'Do you confront it or smooth it over? 25 Bible figures',
    description:
      'Some people walk toward a disagreement and have it out. Others work to bring the two sides back together. Neither is the better way to be. Where 25 sit.'
  },
  '/axis/bible-figure/reasons/': {
    title: 'Do you need the reason first? 25 Bible figures compared',
    description:
      'Some people need the reason before they go on. Others go on and let the reason come. This is about instructions and plans, not faith in God. Where 25 sit.'
  },
  '/axis/bible-figure/plans/': {
    title: 'Do you plan ahead or meet the day? 25 Bible figures',
    description:
      'Some people prepare and provision in advance. Others respond to what arrives. Neither is the better way to be. Where 25 Bible figures sit on the same rail.'
  },

  /*
   * The twelve articles, added 2026-09-21.
   *
   * Every one of them fell through to the Base default, so what shipped was the reader's
   * title plus the brand ("How to become more patient \u2014 Wiser Walk"). The bare phrases the
   * articles are named with are secular queries; the tail Christians actually type adds
   * "according to the Bible", "what the Bible says", "bible verse". Only the <title> and
   * the description change here. The visible heading and every word of the prose stay as
   * written.
   *
   * Each title says only what its article really delivers: "All four lists" is on the
   * gifts article because it names Romans 12, 1 Corinthians 12, Ephesians 4 and 1 Peter 4;
   * "Philippians 4" is on the contentment one because that is the chapter it works
   * through. No title promises a thing the page does not do.
   */
  '/articles/how-to-forgive-someone-who-hurt-you/': {
    title: 'How to forgive someone who hurt you, according to the Bible',
    description:
      'Forgiveness in Scripture is a debt cancelled, not a feeling summoned, and it is a separate thing from trusting the person again. A six-minute read.'
  },
  '/articles/what-the-bible-says-about-worry/': {
    title: 'What the Bible says about worry and anxiety',
    description:
      '\u201cDo not worry\u201d comes with reasons attached, and with something to do instead. A careful reading of Matthew 6, Philippians 4, 1 Peter 5 and Psalm 94.'
  },
  '/articles/how-to-tame-your-tongue/': {
    title: 'How to tame your tongue: what the Bible actually says',
    description:
      'James says no one can tame the tongue, and then expects you to bridle it anyway. Both halves matter for what you do next. A seven-minute read.'
  },
  '/articles/how-to-love-difficult-people/': {
    title: 'How to love difficult people, according to the Bible',
    description:
      'Scripture commands love for difficult people in verbs, not feelings, which means it can be done before it is felt. Luke 6 and 1 Corinthians 13, read closely.'
  },
  '/articles/how-to-be-content/': {
    title: 'How to be content with what you have (Philippians 4)',
    description:
      'Paul says he learned contentment, which means it can be learned. Scripture is specific about what it rests on and what it costs. A six-minute read.'
  },
  '/articles/how-to-become-more-grateful/': {
    title: 'How to become more grateful: what the Bible says',
    description:
      'Gratitude in Scripture is a practice before it is a feeling, which is good news, because practices can be learned. A six-minute read.'
  },
  '/articles/how-to-become-more-humble/': {
    title: 'How to become more humble, according to Scripture',
    description:
      'Scripture rarely tells anyone to feel humble. It tells them to take a seat, pick up a towel and keep quiet about a gift. A six-minute read.'
  },
  '/articles/how-to-become-more-joyful/': {
    title: 'How to become more joyful: joy is not cheerfulness',
    description:
      'Biblical joy is not cheerfulness, and it is not the opposite of sorrow. Knowing the difference is most of the work. A six-minute read.'
  },
  '/articles/how-to-become-more-patient/': {
    title: 'How to become more patient: what the Bible means by it',
    description:
      'Scripture means two things by patience: being slow to anger with people, and being steady while you wait. It gives practice for both.'
  },
  '/articles/what-are-spiritual-gifts/': {
    title: 'What are spiritual gifts in the Bible? All four lists',
    description:
      'The New Testament gives four lists of gifts, one stated purpose, and no method for finding yours. That tells you more than it seems to.'
  },
  /* Added with the article itself (2026-09-21). "Reformation Day" is a seasonal query that
     peaks in the last week of October, so the page has to be indexed weeks before it. */
  '/articles/what-was-the-reformation-about/': {
    title: 'What was the Reformation about? The five real arguments',
    description:
      'Indulgences lit the fire in 1517. Underneath were five questions about grace, communion, authority and worship, and churches still answer them differently.'
  },
  '/articles/what-does-it-mean-to-be-christlike/': {
    title: 'What does it mean to be Christ-like? Not a personality',
    description:
      'Not a personality, not a mood and not a set of manners. Scripture is unusually concrete about what the likeness consists of, starting at Romans 8:29.'
  }
};

/**
 * A description cut to length without cutting a word in half.
 *
 * What was here before was `slice(0, 155)`, and it shipped "Others keep a thought and tu"
 * to Google, to Bing and to every link preview on all six figure-quiz axis pages. This
 * ends on a whole sentence where one ends late enough to still say something, and on a
 * whole word otherwise, with nothing left hanging off the end of it.
 *
 * 158 is the default rather than 160 because the number Google renders is a pixel width,
 * not a character count, and two characters of headroom cost nothing. The same helper does
 * the JSON-LD description, which had the identical defect at a different limit.
 */
export function clip(text: string, max = 158): string {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;

  const cut = s.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  // Late enough to be a description rather than an opening clause.
  if (stop >= max * 0.55) return cut.slice(0, stop + 1);

  // One character of the budget belongs to the ellipsis that says it was cut.
  const space = s.slice(0, max).lastIndexOf(' ');
  if (space <= 0) return cut;
  return s.slice(0, space).replace(/[\s,;:(\[\u2013\u2014-]+$/, '') + '\u2026';
}

/**
 * THE PSALM PAGES (2026-09-23): what each /psalm/<n>/ page says to a search engine.
 *
 * Someone arriving at one of these typed "psalm 13", or "a psalm for when" something is
 * happening to them. So the title is the psalm's number and then the situation in the words
 * a person would use for it: "Psalm 13: when it feels like God has forgotten you".
 *
 * The situation is always Athanasius's, never ours. Each phrase below is a short plain
 * rendering of one situation's own `seen` line in src/data/which-psalm.json (that line is
 * too long for a title, which is the only reason these exist), and it claims nothing the
 * situation does not. They are keyed by SITUATION, because a psalm Athanasius named beside
 * another for the same thing (56 beside 54) is for the same thing, and says so.
 *
 * Every phrase begins "when" and is at most 54 characters, so "Psalm 143: " plus the phrase
 * stays inside the 65 a result shows. Reverent capitals throughout, as on every page.
 */
export const PSALM_TOPICS: Record<string, string> = {
  P3: 'when your own people turn against you',
  P55: 'when friends spread lies about you',
  P31: 'when friends and family turn on you for the truth',
  P42: 'when you long for God and people ask where He is',
  P52: 'when someone lies about you to a person in power',
  P54: 'when you are hunted and people want you handed over',
  P7: 'when you find out people are plotting against you',
  P11: 'when someone is set on rattling you',
  P64: 'when people keep trying to frighten you',
  P57: 'when the one hunting you comes into your hiding place',
  P27: 'when they gang up on you and look down on you',
  P63: 'when you’ve been driven out and you’re on your own',
  P13: 'when it feels like God has forgotten you',
  P26: 'when you want God to judge who is in the right',
  P28: 'when people scheming against you fill your thoughts',
  P40: 'when you’re holding on and wonder what it’s for',
  P62: 'when people are out to destroy you',
  P51: 'when you’ve done wrong and want to come back to God',
  P6: 'when you sense a warning from God and it shakes you',
  P137: 'when you catch wrong thoughts carrying you off',
  P39: 'when you guard yourself and the pull grows stronger',
  P73S: 'when you have nearly lost your footing',
  P102: 'when life has worn you down and you feel empty',
  P42S: 'when something in you is downcast and won’t settle',
  P118: 'when you’re afraid and need something to hold on to',
  P91: 'when you’re tired of living afraid',
  P84: 'when you long for God’s house and your home with Him',
  P103D: 'when God has slipped into the background',
  P143W: 'when there’s something you can’t work out alone',
  P73: 'when the ungodly prosper and good people suffer',
  P37: 'when wrongdoers ride high and you’re tempted to envy',
  P12: 'when pride is everywhere and nothing good seems left',
  P14: 'when people mock the idea that God cares for the world',
  P79: 'when Christians are killed and churches destroyed',
  P20: 'when someone you love is in trouble',
  P5: 'when you need words to plead with God',
  P41: 'when people around you are going without',
  P4: 'when the Lord has heard you and you want to thank Him',
  P18: 'when you’ve been rescued from the people hunting you',
  P34: 'when you’ve escaped people who meant you harm',
  P46: 'when God has brought you through',
  P139: 'when a hard test is over and you want to thank God',
  P85: 'when a time under God’s anger has passed',
  P101: 'when you learn that God’s judgment comes with mercy',
  P23: 'when you can see the Lord shepherding you',
  P19: 'when you marvel at creation and at God’s commands',
  P103: 'when you want to thank God in everything',
  P145: 'when you keep seeing God’s kindness',
  P120: 'when you can feel yourself climbing higher',
  P30: 'when you dedicate your home, and yourself, to God',
  P32: 'when you see someone baptised and made new',
  P93: 'when you just want to sing to God',
  P15: 'when you want to be someone who belongs with God'
};

/**
 * Three psalms lead two situations each. One phrase has to speak for both, and one of the two
 * has to head the page; `lead` names it. Psalm 73's is the one it is best known for (the
 * ungodly doing well), which is also the one whose turn, "until I entered God’s sanctuary", is
 * the psalm's own hinge.
 */
export const PSALM_OWN_TOPIC: Record<number, { topic: string; lead: string }> = {
  42: { topic: 'when you long for God and your soul is downcast', lead: 'P42' },
  73: { topic: 'when the ungodly prosper and good people suffer', lead: 'P73' },
  103: { topic: 'when you want to wake your soul up and thank God', lead: 'P103D' }
};

/** How a psalm stands in the situation that heads its page. */
export type PsalmRole = 'lead' | 'also' | 'set';

/**
 * The title, the description and the band's one line for one psalm page.
 *
 * `seen` is the heading situation's own line, and it opens the description as a question put
 * to the reader ("Your own people have turned on you...?"), because that is the sentence a
 * person in that situation recognises. Where it leaves no room for the rest, the plain phrase
 * stands in for it; nothing is ever cut mid-sentence.
 *
 * The fifteen Songs of Ascents are one situation between them ("to say at every step
 * forward", in Athanasius's own reason), so each is titled as what it is, a Song of Ascents,
 * with that phrase after it.
 */
export function psalmListing(
  n: number,
  role: PsalmRole,
  situation: { id: string; seen: string },
  /** For an also-psalm, the psalm that comes first in the same situation. */
  first?: number
): { title: string; description: string; lede: string; topic: string } {
  const topic = PSALM_OWN_TOPIC[n]?.topic ?? PSALM_TOPICS[situation.id];
  // A situation added to the quiz data without a phrase here fails the build, rather than
  // shipping a page titled with words nobody chose for it.
  if (!topic) throw new Error(`seo: no search phrase for situation ${situation.id} (PSALM_TOPICS)`);
  /* Psalm 121 leads the Songs of Ascents in the data, but the advice is all fifteen of them,
     so its page speaks of the fifteen exactly as the other fourteen do. */
  const ascent = role === 'set' || situation.id === 'P120';
  const title = ascent ? `Psalm ${n}: a Song of Ascents for every step forward` : `Psalm ${n}: ${topic}`;

  const lede = ascent
    ? `One of the fifteen Songs of Ascents, which St Athanasius said to pray ${topic}.`
    : role === 'lead'
      ? `What St Athanasius said to pray ${topic}, in a letter from the 300s.`
      : `One of the psalms St Athanasius said to pray ${topic}, in a letter from the 300s.`;

  /* The reader's own sentence, turned into the question it is. A line that already ends on a
     question (Psalm 42's "Where is your God?") keeps its own mark. */
  const seen = situation.seen.trim();
  const asked = /[?]["”]?$/.test(seen) ? seen : seen.replace(/[.!]$/, '') + '?';
  const gave = ascent
    ? `St Athanasius gave the Songs of Ascents for that, Psalm ${n} among them.`
    : role === 'lead'
      ? `St Athanasius gave Psalm ${n} for that.`
      : `St Athanasius gave Psalm ${n} for that, with Psalm ${first}.`;
  const tail = ' Read his advice and the whole psalm.';
  const opener = `${asked} ${gave}`;
  const plain = `Psalm ${n} is for ${topic}, as St Athanasius wrote in the 300s. His advice, and the whole psalm.`;
  const description =
    (opener + tail).length <= 158 ? opener + tail : opener.length <= 158 ? opener : clip(plain);

  return { title, description, lede, topic };
}

/**
 * The social preview card for a path (og:image). Cards are drawn by design/og/render.mjs into
 * public/og/ and listed in data/og-cards.json, so this only ever names a card that exists.
 * A result or a comparison wears its quiz's card: that link is the one people actually share.
 */
const HAVE = new Set<string>(ogCards.cards);
const card = (name: string, fallback = 'home') => `/og/${HAVE.has(name) ? name : fallback}.jpg`;

export function ogImageFor(path: string): string {
  const exact: Record<string, string> = {
    '/': 'home', '/quizzes/': 'quizzes', '/games/': 'games', '/articles/': 'articles',
    '/support/': 'support', '/compare/': 'compare'
  };
  if (exact[path]) return card(exact[path]);
  let m: RegExpExecArray | null;
  /* A pair has its own card naming the two traditions; a pair whose card has not been
     drawn falls back to the hub's rather than to the home page's. */
  if ((m = /^\/compare\/([^/]+)\//.exec(path))) return card(`compare-${m[1]}`, 'compare');
  /* A quiz whose card has not been drawn yet (the Psalm quiz, on the day it went live) wears
     the quizzes card, which is at least about quizzes, rather than the home page's. */
  if ((m = /^\/(?:q|r|c|axis)\/([^/]+)\//.exec(path))) return card(`quiz-${m[1]}`, 'quizzes');
  /* A psalm page is the Psalm quiz's reference floor, as a figure page is the figure quiz's,
     and it is shared as that quiz. No psalm has a card of its own. */
  if (path.startsWith('/psalm/')) return card('quiz-which-psalm', 'quizzes');
  /* The early Christians' person and question pages are that quiz's reference floor, and are
     shared as that quiz. A person's own result card says "my kindred spirit", which a person's
     page is not, so none of them wears it. */
  if (path.startsWith('/early-christian/') || path.startsWith('/early-church-on/')) {
    return card('quiz-which-early-christian', 'quizzes');
  }
  /* The eight personality type pages and their index are the test's reference floor, shared as
     the test. Each type's own card (r-personality-<type>) says "my type", which a type's page
     is not, so none of them wears it. */
  if (path.startsWith('/personality-type/')) return card('quiz-personality', 'quizzes');
  /* The Saints hub has a card of its own, and each saint with a full page has one naming him
     (design/og/cards.mjs, from src/data/saints/). A saint whose card is not drawn yet wears the hub's. */
  if (path === '/saints/') return card('saints', 'home');
  if ((m = /^\/saints\/([^/]+)\//.exec(path))) return card(`saint-${m[1]}`, 'saints');
  if (path.startsWith('/tradition/')) return card('quiz-theology-compass');
  if ((m = /^\/figure\/([^/]+)\//.exec(path))) return card(`figure-${m[1]}`, 'quiz-bible-figure');
  if ((m = /^\/articles\/([^/]+)\//.exec(path))) return card(`article-${m[1]}`, 'articles');
  if ((m = /^\/play\/([^/]+)\//.exec(path))) return card(`game-${m[1]}`, 'games');
  return card('home');
}

/**
 * A result's own card (2026-09-23): the link preview says what this person got, not only
 * which quiz they took. design/og/cards.mjs draws one per outcome a result can lead with,
 * named `r-<quiz>-<outcome slug>`; the /r/ page passes this to Base as `ogImage`.
 *
 * Only where the result names ONE thing plainly, because the card prints that one name:
 *   - a matched quiz (the Compass, the figures) when one outcome is nearest or two are level,
 *     never a loose neighbour and never a centrist, who is named nothing
 *   - a ranking (sins, gifts) only when one category is clearly ahead
 *   - the Psalm quiz by the psalm the reading leads with (the situation never travels)
 *   - Which early Christian thinks like you? by the kindred spirit, whose slug is named[0]
 *   - the Christian Personality Test by the type (every result has exactly one), never by
 *     anything the reader answered
 * Anything else, or a card that was never drawn, is null, and the page keeps its quiz's card.
 */
export function resultCardFor(quiz: Pick<Quiz, 'slug'>, view: ResultView): string | null {
  let key: string | undefined;
  if (quiz.slug === 'which-early-christian') key = view.named[0];
  else if (view.shape === 'personality') key = view.type;
  else if (view.shape === 'reading') key = String(view.psalm);
  else if (view.shape === 'bipolar') key = view.state === 'near' || view.state === 'tie' ? view.named[0] : undefined;
  else if (view.shape === 'unipolar') key = view.state === 'clear' ? view.named[0] : undefined;
  const name = key ? `r-${quiz.slug}-${key}` : '';
  return name && HAVE.has(name) ? `/og/${name}.jpg` : null;
}
