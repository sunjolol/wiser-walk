import ogCards from '../data/og-cards.json';
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
    title: 'Christian articles on gratitude, patience, forgiveness and worry',
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
    title: 'Theology Compass: which Christian denomination fits your beliefs?',
    description:
      '18 statements, 3 minutes. See which of 18 Christian traditions sits nearest your beliefs, from Catholic and Orthodox to Baptist and Pentecostal. Free.'
  },
  '/q/bible-figure/': {
    title: 'Which Bible character are you most like? Free 3-minute quiz',
    description:
      '18 statements about how you act, speak and lead. See which of 25 Bible figures you are most like, from Moses and Esther to Peter and Paul, with the verses.'
  },
  '/q/spiritual-gifts/': {
    title: 'Spiritual gifts test: free, all 19 gifts, about 8 minutes',
    description:
      'A free spiritual gifts test on all 19 gifts the New Testament names, from teaching and mercy to healing, prophecy and tongues. 57 statements, about 8 minutes.'
  },
  '/data/theology-compass/': {
    title: '18 Christian traditions on six axes: the table, free CSV',
    description:
      'Where 18 Christian traditions stand on grace, the Lord’s Supper, the gifts, Israel and the church, authority and worship, as one table you can read or download.'
  },
  '/q/spiritual-gifts/print/': {
    title: 'Printable spiritual gifts test: all 19 gifts, with scoring key',
    description:
      'The 57-statement spiritual gifts test on paper, free, with a scoring key for all 19 gifts. Print it for a class, a small group or a church.'
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
  if ((m = /^\/(?:q|r|c|axis)\/([^/]+)\//.exec(path))) return card(`quiz-${m[1]}`);
  if (path.startsWith('/tradition/')) return card('quiz-theology-compass');
  if ((m = /^\/figure\/([^/]+)\//.exec(path))) return card(`figure-${m[1]}`, 'quiz-bible-figure');
  if ((m = /^\/articles\/([^/]+)\//.exec(path))) return card(`article-${m[1]}`, 'articles');
  if ((m = /^\/play\/([^/]+)\//.exec(path))) return card(`game-${m[1]}`, 'games');
  return card('home');
}
