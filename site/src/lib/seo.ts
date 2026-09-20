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
  '/': {
    title: 'Wiser Walk: Christian quizzes and Bible games, made fair',
    description:
      'Find where your beliefs sit among 18 Christian traditions, test whether a line is really in the Bible, and read on gratitude and joy. Every claim cited.'
  },
  '/q/theology-compass/': {
    title: 'Theology Compass: which Christian denomination are your beliefs closest to?',
    description:
      '18 statements, 3 minutes. See where you sit on six questions that divide Christians and which of 18 traditions land nearest. Audited for fairness.'
  },
  /*
   * The two quizzes released on 2026-09-20. Neither has been through the Compass's audit, so
   * neither description says a word about fairness, reviewers or an audit: each states only
   * what the page holds and how long it takes.
   */
  '/q/bible-figure/': {
    title: 'Which Bible character are you most like? 18 statements, 3 minutes',
    description:
      '18 statements about how you act, speak, lead and argue. The result names which of 25 figures, Jesus among them, sits nearest, with the acts cited.'
  },
  '/q/spiritual-gifts/': {
    title: 'Spiritual gifts test: all 19 gifts the New Testament names',
    description:
      '57 plain statements about what you do and what has happened, ranked across 19 gifts, healing, prophecy and tongues among them. About 8 minutes.'
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
