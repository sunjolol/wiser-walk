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
      'Which Christian tradition are you closest to? Which Bible figure are you most like? What are your spiritual gifts? Free quizzes and Bible games that take minutes.'
  },
  '/quizzes/': {
    title: 'Free Christian quizzes: denomination, spiritual gifts, Bible character',
    description:
      'Find the Christian tradition nearest your beliefs, the Bible figure you are most like and your spiritual gifts. Free quizzes, most done in three minutes.'
  },
  '/games/': {
    title: 'Free Bible games: Sounds Like Scripture and Who Said It?',
    description:
      'Is that line really in the Bible, or does it only sound like it? And who said it? Two fast, free Bible games built from over 2,000 real lines. Two minutes a run.'
  },
  '/articles/': {
    title: 'Christian articles on gratitude, patience, forgiveness and worry',
    description:
      'Short, practical reads on becoming more grateful, patient, humble and content, on forgiving someone who hurt you, and on what the Bible says about worry.'
  },
  '/about/': {
    title: 'About Wiser Walk',
    description:
      'Wiser Walk makes free quizzes, Bible games and articles that help Christians understand themselves, with every tradition described in words its own people would use.'
  },
  '/support/': {
    title: 'Support Wiser Walk: keep the quizzes and games free',
    description:
      'Every quiz, game and article on Wiser Walk is free. If one has been worth something to you, you can help keep it that way, once or monthly.'
  },
  '/q/theology-compass/': {
    title: 'Theology Compass: which Christian denomination fits your beliefs?',
    description:
      'Answer 18 statements in 3 minutes and see which of 18 Christian traditions sits nearest your beliefs, from Catholic and Orthodox to Baptist and Pentecostal. Free.'
  },
  '/q/bible-figure/': {
    title: 'Which Bible character are you most like? Free 3-minute quiz',
    description:
      '18 plain statements about how you act, speak and lead. See which of 25 Bible figures you are most like, from Moses and Esther to Peter and Paul, with the verses.'
  },
  '/q/spiritual-gifts/': {
    title: 'Spiritual gifts test: free, all 19 gifts, about 8 minutes',
    description:
      'A free spiritual gifts test covering all 19 gifts the New Testament names, from teaching and mercy to healing, prophecy and tongues. 57 statements, about 8 minutes.'
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
  '/axis/theology-compass/grace/': {
    title: 'Monergism vs synergism: which denominations hold which view',
    description:
      'Does God alone bring a person to faith, or does the person cooperate? Both cases in their holders\u2019 own words, and where 18 traditions sit. No winner picked.'
  },
  '/axis/theology-compass/table/': {
    title: 'Real presence vs memorial: what each denomination believes about communion',
    description:
      'Is Christ truly present in the Supper, or is it a remembrance? The sacramental and memorial views in their own words, and where 18 traditions sit.'
  },
  '/axis/theology-compass/gifts/': {
    title: 'Cessationist vs continuationist: which denominations are which',
    description:
      'Have tongues, prophecy and healing ceased? Both cases fairly put, the passages each side reads, and where 18 traditions sit.'
  },
  '/axis/theology-compass/kingdom/': {
    title: 'Dispensationalism or one people of God: where each denomination stands',
    description:
      'Is there one people of God across both Testaments, or do Israel and the church remain distinct? Both views in their own words, and where 18 traditions sit.'
  },
  '/axis/theology-compass/authority/': {
    title: 'Scripture alone vs Scripture and tradition: where each church stands',
    description:
      'Is the Bible read within the church\u2019s tradition, or is Scripture alone the final authority? Both cases fairly put, and where 18 traditions sit.'
  },
  '/axis/theology-compass/worship/': {
    title: 'Liturgical vs free worship: which churches worship how',
    description:
      'A set order and the church calendar, or freedom of form? Both cases in their holders\u2019 own words, and where 18 traditions sit.'
  }
};

/**
 * The social preview card for a path (og:image). Cards are drawn by design/og/render.mjs into
 * public/og/ and listed in data/og-cards.json, so this only ever names a card that exists.
 * A result or a comparison wears its quiz's card: that link is the one people actually share.
 */
const HAVE = new Set<string>(ogCards.cards);
const card = (name: string, fallback = 'home') => `/og/${HAVE.has(name) ? name : fallback}.jpg`;

export function ogImageFor(path: string): string {
  const exact: Record<string, string> = {
    '/': 'home', '/quizzes/': 'quizzes', '/games/': 'games', '/articles/': 'articles', '/support/': 'support'
  };
  if (exact[path]) return card(exact[path]);
  let m: RegExpExecArray | null;
  if ((m = /^\/(?:q|r|c|axis)\/([^/]+)\//.exec(path))) return card(`quiz-${m[1]}`);
  if (path.startsWith('/tradition/')) return card('quiz-theology-compass');
  if ((m = /^\/figure\/([^/]+)\//.exec(path))) return card(`figure-${m[1]}`, 'quiz-bible-figure');
  if ((m = /^\/articles\/([^/]+)\//.exec(path))) return card(`article-${m[1]}`, 'articles');
  if ((m = /^\/play\/([^/]+)\//.exec(path))) return card(`game-${m[1]}`, 'games');
  return card('home');
}
