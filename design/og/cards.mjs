/**
 * Every social preview card the site publishes, as data. Drawn by render.mjs into
 * site/public/og/<name>.jpg; the list of names is written to site/src/data/og-cards.json so
 * the site only points at cards that exist.
 *
 * A card answers one question in a feed: "what happens if I tap this?" So each headline is
 * the question the page answers, in the fewest words, and the small line is the cost (minutes)
 * or the promise. Articles and figures are read from the site's own data, never typed here.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
    h: 'What are your|spiritual *gifts?*', s: '51 statements. About 10 minutes.' },
  /* David mourning Absalom: the story behind Psalm 3, the quiz's finished example, and the
     plate the quiz wears on the site (lib/art.ts). */
  'quiz-which-psalm': { v: 'left', tone: 'engraving', img: '/img/figures/david.jpg', pos: '48% 30%', k: 'Free quiz',
    h: 'Which Psalm are|you living|right *now?*', s: '3 minutes. The psalm a Church Father gave for exactly that.' },
  /* Dürer's Jerome writing in his study, the plate the quiz wears on the site (lib/art.ts). The
     small line is the question printed under the title on its card and start page (his ruling). */
  'quiz-which-early-christian': { v: 'left', tone: 'engraving', img: '/img/durer-jerome.jpg', pos: '62% 56%', k: 'Free quiz',
    h: 'Which early|Christian thinks|like *you?*', s: 'And which would argue with you?' },
  'quiz-seven-deadly-sins': { v: 'left', tone: 'engraving', img: '/img/dore-eden.jpg', pos: '50% 14%', k: 'Free quiz',
    h: 'Which of the 7|deadly sins are you|*weakest* to?', s: '14 statements. 2 minutes.' },
  /* The test's own picture (lib/art.ts): its eight types' paintings, in colour, never sepia.
     The kicker is its name, the owner's ruling of 2026-09-24, as the Compass's card carries its
     own. The facts are the home page's: 72 questions, 12 minutes, 8 types. */
  'quiz-personality': { v: 'left', tone: 'painting', img: '/img/personality/mosaic.jpg', pos: '50% 0%', k: 'Christian Personality Test',
    h: 'Which of eight|types are *you?*', s: '72 questions. 15 minutes. A ten-page portrait.' },

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
  // Line endings normalised first: a file saved with Windows endings matched nothing here, and its
  // card silently dropped out of the manifest (five articles did, 2026-09-24).
  const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(ART_DIR, f), 'utf8').replace(/\r\n/g, '\n'))?.[1] ?? '';
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

/*
 * THE SAINTS HUB (2026-09-25): the hub's card, three of its people side by side, and one card per
 * saint with a full page, read from that page's own data file (site/src/data/saints/): his band
 * painting at the band's own wide-screen crop, and his name.
 */
CARDS.saints = {
  v: 'trip', tone: 'painting',
  imgs: '/img/early-christians/basil-the-great.jpg,/img/saints/martin-of-tours.jpg,/img/early-christians/augustine-of-hippo.jpg',
  poss: '50% 12%,50% 6%,50% 22%', k: 'Saints and early Christians',
  h: 'Their lives, in their|own *words.*', s: 'Feast days East and West. Every quotation with its book and chapter.'
};
const SAINTS_DIR = join(ROOT, 'site/src/data/saints');
if (existsSync(SAINTS_DIR)) {
  for (const f of readdirSync(SAINTS_DIR).filter(f => f.endsWith('.json'))) {
    const p = JSON.parse(readFileSync(join(SAINTS_DIR, f), 'utf8'));
    CARDS[`saint-${p.slug}`] = {
      v: 'left', tone: 'painting', img: p.band.picture.src, pos: p.band.posD, k: 'Saints and early Christians',
      h: `Who was|*${p.name}?*`, s: `${p.band.dates}. ${p.she ? 'Her' : 'His'} life, ${p.she ? 'her' : 'his'} words and ${p.she ? 'her' : 'his'} feast days.`
    };
  }
}

/* A Bible figure with a page of its own, drawn like a saint's (site/src/data/figures/, 2026-09-26),
   wears a card like a saint's in place of the figure quiz's: its band painting and its name. */
const FIGURES_DIR = join(ROOT, 'site/src/data/figures');
if (existsSync(FIGURES_DIR)) {
  for (const f of readdirSync(FIGURES_DIR).filter(f => f.endsWith('.json'))) {
    const p = JSON.parse(readFileSync(join(FIGURES_DIR, f), 'utf8'));
    CARDS[`figure-${p.slug}`] = {
      v: 'left', tone: 'painting', img: p.band.picture.src, pos: p.band.posD, k: 'People of the Bible',
      h: `Who was|*${p.name}?*`, s: `${p.she ? 'Her' : 'His'} life, ${p.she ? 'her' : 'his'} words and ${p.she ? 'her' : 'his'} feast days.`
    };
  }
}

/*
 * RESULTS (2026-09-23): one card per outcome a result can name, so a shared result link
 * shows who or what the person got instead of the quiz's own card. seo.ts resultCardFor()
 * picks it; a result that names nothing (a centrist, a flat ranking) keeps the quiz's card.
 *
 * Each says what the result page says, in the sharer's voice, and never more: no score, no
 * percentage, not one of their answers. The kicker is the quiz's question, so whoever sees
 * the card knows what was asked before they read what came out.
 *
 * The names, notes and plates are read from the site's own code (the registry and art.ts,
 * bundled with the site's esbuild as the engine test does), so a renamed outcome or a new
 * plate cannot leave a card saying something the page does not. Where the site's words and
 * a shorter phrasing would differ, the site's words win:
 *
 *   - Figures say "Who in the Bible my answers sat nearest", the quiz's own share title. "I'm
 *     most like", pasted beside the name of Jesus, is the boast both audits ruled out (F8).
 *   - Gifts say "My answers pointed most to", the result page's own headline in the first
 *     person. The quiz speaks about what the statements found, never about what a person is.
 *   - A sentence that travels with a name travels onto its card too, verbatim: the note on
 *     Jesus's card, where the books of Judith and Tobit are printed, and the disagreement
 *     over the six gifts some Christians hold have ceased (types.ts notesFor, groupNoteFor).
 */
const SITE_REQUIRE = createRequire(join(ROOT, 'site/package.json'));
async function bundled(entry) {
  const out = join(ROOT, 'site/node_modules', `.og-${entry.replace(/\W+/g, '-')}.mjs`);
  SITE_REQUIRE('esbuild').buildSync({
    entryPoints: [join(ROOT, 'site/src', entry)], outfile: out, bundle: true, format: 'esm',
    platform: 'node', target: 'node18', logLevel: 'silent'
  });
  try { return await import(pathToFileURL(out).href + '?t=' + Date.now()); }
  finally { rmSync(out, { force: true }); }
}
const { QUIZZES } = await bundled('lib/engine/registry.ts');
const { artFor, artForOutcome } = await bundled('lib/art.ts');
const quiz = slug => QUIZZES.find(q => q.slug === slug);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
/** "Lutheran (confessional)" -> the name large, and what is in the brackets under it. */
const split = name => {
  const i = name.indexOf(' (');
  return i < 0 ? [name, ''] : [name.slice(0, i), name.slice(i + 1)];
};
const result = (slug, key, params) => { CARDS[`r-${slug}-${key}`] = { k: quiz(slug)?.title, ...params }; };

/* The Compass has no plate (art.ts): it wears its own card's sky, centred, as its quiz card does. */
{
  const q = quiz('theology-compass');
  for (const o of q.outcomes) {
    const [name, under] = split(o.name);
    result(q.slug, o.slug, {
      v: 'center', tone: 'photo', img: '/img/sky-rays.jpg', pos: '70% 35%',
      k: 'Which Christian tradition are you closest to?', m: 'Nearest tradition on my map:',
      h: name, ...(under ? { u: under } : {}), ...(o.note ? { n: o.note } : {})
    });
  }
}

/* Figures: the figure's own plate where art.ts has one, the quiz's plate where it does not. */
{
  const q = quiz('bible-figure');
  for (const o of q.outcomes) {
    const art = artForOutcome(q.slug, o.slug);
    result(q.slug, o.slug, {
      v: 'left', tone: 'engraving', img: art.src, pos: art.objectPosition, ...(art.lift ? { lift: art.lift } : {}),
      m: `${q.shareTitle}:`, h: o.name, ...(o.note ? { n: o.note } : {})
    });
  }
}

/* The two rankings. A card is drawn for a category only when it LEADS (seo.ts: state clear). */
for (const [slug, mine] of [['seven-deadly-sins', 'The deadly sin I’m weakest to:'], ['spiritual-gifts', 'My answers pointed most to:']]) {
  const q = quiz(slug);
  const plate = CARDS[`quiz-${slug}`];
  const lift = artFor(slug)?.lift;
  const travels = new Set(q.groups.filter(g => q.groupNote?.groups.includes(g.key)).map(g => g.slug));
  for (const g of q.groups) {
    result(slug, g.slug, {
      v: 'left', tone: 'engraving', img: plate.img, pos: plate.pos, ...(lift ? { lift } : {}),
      m: mine, h: cap(g.name), ...(travels.has(g.slug) ? { n: q.groupNote.result } : {})
    });
  }
}

/*
 * The Psalm quiz: one card per psalm a result can lead with, by its English number, on the
 * quiz's own plate. The psalm and nothing else: a reading's situation does not travel (see
 * ShareBlock's reading card), so the card says which psalm and never why.
 */
{
  const q = quiz('which-psalm');
  const art = artFor(q.slug);
  const { outcomes } = JSON.parse(readFileSync(join(ROOT, 'site/src/data/which-psalm.json'), 'utf8'));
  for (const o of Object.values(outcomes)) {
    const set = o.set ? [Math.min(...o.set), Math.max(...o.set)] : null;
    result(q.slug, String(o.psalm), {
      v: 'left', tone: 'engraving', img: art.src, pos: art.objectPosition,
      ...(set
        ? { m: `The Psalms I’m living right now:`, h: 'The Songs of Ascents', u: `Psalms ${set[0]}–${set[1]}` }
        : { m: `${q.shareTitle}:`, h: `Psalm ${o.psalm}` })
    });
  }
}

/*
 * Which early Christian thinks like you? Drawn ahead of the quiz (wave 2 builds it), from its
 * design folder: the name and dates from people.json, the colour portrait from the preview.
 * The portraits are too small to fill a card, so each stands in a frame. The file is named
 * by the person's slug, which is what the result's named[0] will carry.
 */
const FATHERS = join(ROOT, 'design/quiz-ideas/fathers');
if (existsSync(join(FATHERS, 'people.json'))) {
  const { people } = JSON.parse(readFileSync(join(FATHERS, 'people.json'), 'utf8'));
  for (const [key, p] of Object.entries(people)) {
    const img = join(FATHERS, 'preview/img', `${key}.jpg`);
    if (!existsSync(img)) continue;
    CARDS[`r-which-early-christian-${p.slug}`] = {
      v: 'left', tone: 'painting', frame: '1', img: relative(here, img).replace(/\\/g, '/'), pos: '50% 0%',
      k: 'Which early Christian thinks like you?', m: 'My kindred spirit in the early Church:',
      h: p.name, s: p.dates
    };
  }
}

/*
 * The Christian Personality Test (2026-09-24): one card per type, on the type's own painting in
 * colour, as the test's own share card is, with the kicker the test's name (the result() default).
 * Then "My type:", the type's name, and its tagline under it in the warm italic, which are the
 * share card's two lines. Nothing else travels: no leaning, no page of the report and nothing the
 * reader answered, because a type is all the link carries out. Names and taglines are the
 * registry's outcomes; the pictures are the scoring file's TYPES[k].art, the very files the
 * result page's hero shows. The crop keeps each painting's subject clear of the words.
 */
const PQ_POS = {
  /* Homer's lookout is the one upright painting: its bell stays whole and the sailor's face
     comes up out of the foot of the card. */
  lookout: '50% 82%',
  /* Raphael's Paul stands at the left of his cartoon, under the words' shade; this moves him out. */
  herald: '0% 50%'
};
{
  const q = quiz('personality');
  const { TYPES } = JSON.parse(readFileSync(join(ROOT, 'site/src/data/personality-scoring.json'), 'utf8'));
  for (const o of q.outcomes) {
    result(q.slug, o.slug, {
      v: 'left', tone: 'painting', img: `/img/personality/art/${TYPES[o.slug].art}.jpg`, pos: PQ_POS[o.slug] ?? '50% 50%',
      m: 'My type:', h: o.name, u: o.who
    });
  }
}

/* The manifest the site reads, written by render.mjs after it draws. Only a card whose picture
   is on disk is listed, so the site can never point a preview at a file that was not drawn. */
export function writeManifest() {
  const out = join(ROOT, 'site/src/data/og-cards.json');
  const drawn = Object.keys(CARDS).filter(name => existsSync(join(PUB, 'og', name + '.jpg'))).sort();
  writeFileSync(out, JSON.stringify({ generatedBy: 'design/og/render.mjs', cards: drawn }, null, 2) + '\n');
  return out;
}
