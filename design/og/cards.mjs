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
  articles: { v: 'left', tone: 'painting', img: '/img/reads-harvest.jpg', pos: '50% 50%', k: 'Articles',
    h: 'The slow work|of *becoming.*', s: 'Short reads on gratitude, patience, forgiveness and more.' },
  support: { v: 'right', tone: 'dawn', img: '/img/support-hand.jpg', pos: '40% 45%',
    h: 'Keep Wiser|Walk *free.*', s: 'Every quiz, game and article is free. You can help keep it that way.' },

  'quiz-theology-compass': { v: 'center', tone: 'photo', img: '/img/sky-rays.jpg', pos: '70% 35%', k: 'Theology Compass',
    h: 'Which Christian tradition|are you *closest* to?', s: '18 statements. 3 minutes. 18 traditions.' },
  'quiz-bible-figure': { v: 'left', tone: 'engraving', img: '/img/dore-moses.jpg', pos: '50% 14%', k: 'Free quiz',
    h: 'Which Bible|character are|you most *like?*', s: '18 statements. 3 minutes. 25 figures.' },
  'quiz-spiritual-gifts': { v: 'left', tone: 'engraving', img: '/img/dore-paul.jpg', pos: '45% 25%', k: 'Free test',
    h: 'What are your|spiritual *gifts?*', s: 'All 19 gifts the New Testament names. About 8 minutes.' },
  'quiz-seven-deadly-sins': { v: 'left', tone: 'engraving', img: '/img/dore-eden.jpg', pos: '50% 14%', k: 'Free quiz',
    h: 'Which of the 7|deadly sins are you|*weakest* to?', s: '14 statements. 2 minutes.' },

  'game-sounds-like-scripture': { v: 'left', tone: 'night', img: '/img/game-manuscript.jpg', pos: '50% 20%', k: 'Bible game',
    h: 'In the Bible, or does|it only *sound* like it?', s: 'Ten lines, a few seconds each. Harder than you think.' },
  'game-who-said-it': { v: 'left', tone: 'night', img: '/img/game-manuscript.jpg', pos: '50% 80%', k: 'Bible game',
    h: 'Who *said* it?', s: 'One line from the Bible. Four names. Two minutes a run.' },
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
