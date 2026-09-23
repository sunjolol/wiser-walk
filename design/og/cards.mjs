/**
 * Every social preview card the site publishes, as data. Drawn by render.mjs into
 * site/public/og/<name>.jpg; the list of names is written to site/src/data/og-cards.json so
 * the site only points at cards that exist.
 *
 * A card answers one question in a feed: "what happens if I tap this?" So each headline is
 * the question the page answers, in the fewest words, and the small line is the cost (minutes)
 * or the promise. Articles and figures are read from the site's own data, never typed here.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const PUB = join(ROOT, 'site/public');

export const CARDS = {
  /* THE HOME CARD is the owner's pick among the drafts (node design/og/render.mjs drafts). */
  home: { v: 'shelf', tone: 'photo', img: '/img/sky-rays.jpg', pos: '30% 60%',
    h: 'Know yourself|a little *better.*', s: 'Find your tradition, your gifts, and the Bible figure you are most like.' },

  quizzes: { v: 'trip', tone: 'engraving', imgs: '/img/dore-moses.jpg,/img/dore-paul.jpg,/img/dore-eden.jpg', poss: '50% 12%,45% 25%,50% 12%',
    h: 'See where you|*actually* stand.', s: 'Free Christian quizzes. Most take three minutes.' },
  games: { v: 'left', tone: 'night', img: '/img/game-manuscript.jpg', pos: '50% 20%', k: 'Bible games',
    h: 'Is that line really|in the *Bible?*', s: 'Two fast, free games. Ten lines a run.' },
  articles: { v: 'left', tone: 'painting', img: '/img/reads-sower.jpg', pos: '62% 12%', k: 'Articles',
    h: 'The slow work|of *becoming.*', s: 'Short reads on gratitude, patience, forgiveness and more.' },
  support: { v: 'right', tone: 'dawn', img: '/img/support-hand.jpg', pos: '40% 45%',
    h: 'Keep Wiser|Walk *free.*', s: 'Every quiz, game and article is free. You can help keep it that way.' },

  'quiz-theology-compass': { v: 'center', tone: 'photo', img: '/img/sky-rays.jpg', pos: '70% 35%', k: 'Theology Compass',
    h: 'Which Christian tradition|are you *closest* to?', s: '18 statements. 3 minutes. 18 traditions.' },
  'quiz-bible-figure': { v: 'left', tone: 'engraving', img: '/img/dore-moses.jpg', pos: '50% 14%', k: 'Free quiz',
    h: 'Which Bible|character are|you most *like?*', s: '18 statements. 3 minutes. 25 figures.' },
  'quiz-spiritual-gifts': { v: 'left', tone: 'engraving', img: '/img/dore-paul.jpg', pos: '45% 25%', k: 'Free test',
    h: 'What are your|spiritual *gifts?*', s: 'All 19 gifts the New Testament names. About 8 minutes.' },
  /* David mourning Absalom: the story behind Psalm 3, the quiz's finished example, and the
     plate the quiz wears on the site (lib/art.ts). */
  'quiz-which-psalm': { v: 'left', tone: 'engraving', img: '/img/figures/david.jpg', pos: '48% 30%', k: 'Free quiz',
    h: 'Which Psalm are|you living|right *now?*', s: '3 minutes. The psalm a Church Father gave for exactly that.' },
  'quiz-seven-deadly-sins': { v: 'left', tone: 'engraving', img: '/img/dore-eden.jpg', pos: '50% 14%', k: 'Free quiz',
    h: 'Which of the 7|deadly sins are you|*weakest* to?', s: '14 statements. 2 minutes.' },

  'game-sounds-like-scripture': { v: 'left', tone: 'night', img: '/img/game-manuscript.jpg', pos: '50% 20%', k: 'Bible game',
    h: 'In the Bible, or does|it only *sound* like it?', s: 'Ten lines, a few seconds each. Harder than you think.' },
  'game-who-said-it': { v: 'left', tone: 'night', img: '/img/game-manuscript.jpg', pos: '50% 80%', k: 'Bible game',
    h: 'Who *said* it?', s: 'One line from the Bible. Four names. Two minutes a run.' },
};

/*
 * Comparisons: one card per pair, plus the hub.
 *
 * Read from the site's own data files rather than typed here, so a thirteenth pair brings
 * its card with it. The headline is the two labels, the second in the warm ink, which is
 * the one thing that differs between twelve cards in a feed. The plates are Doré, printed
 * soft sepia like every other engraving card: chosen for showing PEOPLE TOGETHER — two
 * figures, a household, a gathered church — because that is what a comparison page is, and
 * cycled by position so no two pairs in a row wear the same one.
 */
const CMP_DIR = join(ROOT, 'site/src/data/comparisons');
const CMP_PLATES = [
  ['/img/figures/jonathan.jpg', '50% 52%'],
  ['/img/dore-paul.jpg', '38% 44%'],
  ['/img/figures/peter.jpg', '50% 42%'],
  ['/img/figures/john-the-baptist.jpg', '52% 36%'],
  ['/img/figures/martha.jpg', '54% 44%'],
  ['/img/figures/tobit.jpg', '54% 48%']
];
let comparisons = [];
if (existsSync(CMP_DIR)) {
  comparisons = readdirSync(CMP_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
    .map(f => JSON.parse(readFileSync(join(CMP_DIR, f), 'utf8')));
}
comparisons.forEach((c, i) => {
  const [img, pos] = CMP_PLATES[i % CMP_PLATES.length];
  CARDS[`compare-${c.slug}`] = {
    v: 'left', tone: 'engraving', img, pos, k: 'Compare',
    h: `${c.labelA} vs|*${c.labelB}*`,
    s: 'What actually separates them, on the same six axes.'
  };
});
CARDS.compare = {
  v: 'left', tone: 'engraving', img: '/img/figures/jonathan.jpg', pos: '50% 52%', k: 'Compare traditions',
  h: 'What is the|*difference?*',
  /* No count in the line. A card is drawn once and committed, and a thirteenth pair would
     leave a card in every feed saying there are twelve. */
  s: 'Lutheran or Reformed? Catholic or Orthodox? Each pair, side by side.'
};

/* Articles: the article's own painting and title. */
const ART_DIR = join(ROOT, 'site/src/content/articles');
for (const f of readdirSync(ART_DIR).filter(f => f.endsWith('.md'))) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(ART_DIR, f), 'utf8'))?.[1] ?? '';
  const get = k => (new RegExp(`^${k}:\\s*(.*)$`, 'm').exec(fm)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
  if (/^draft:\s*true/m.test(fm) || !get('image')) continue;
  CARDS[`article-${f.replace(/\.md$/, '')}`] = {
    v: 'left', tone: 'painting', img: get('image'), pos: get('imagePosition') || '50% 50%', k: 'Article',
    h: get('title'), s: `${get('minutes')} minute read`
  };
}

/* Figures: only those with a plate of their own; the rest share the quiz's card. */
const figures = JSON.parse(readFileSync(join(ROOT, 'site/src/data/bible-figures.json'), 'utf8')).figures;
const OWN = { moses: '/img/dore-moses.jpg', paul: '/img/dore-paul.jpg' };
for (const f of figures) {
  const img = OWN[f.slug] ?? `/img/figures/${f.slug}.jpg`;
  if (!existsSync(join(PUB, img))) continue;
  CARDS[`figure-${f.slug}`] = {
    v: 'left', tone: 'engraving', img, pos: '50% 22%', k: 'In the Bible',
    h: `What was|*${f.name}* like?`, s: 'The recorded acts, with their verses.'
  };
}

/* The manifest the site reads. Written whenever this module is imported by render.mjs. */
export function writeManifest() {
  const out = join(ROOT, 'site/src/data/og-cards.json');
  writeFileSync(out, JSON.stringify({ generatedBy: 'design/og/render.mjs', cards: Object.keys(CARDS).sort() }, null, 2) + '\n');
  return out;
}
