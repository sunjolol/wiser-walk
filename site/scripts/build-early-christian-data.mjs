// Generate quiz #4's data ("Which early Christian thinks like you?") from the design source. Never hand-edit an output:
// change design/quiz-ideas/fathers/ (table.mjs and excerpts.json for positions and lines, people.json for who each person
// is), run `node design/quiz-ideas/fathers/model.mjs`, then this.
//
//   src/data/which-early-christian.json          EVERYTHING the pages print: the 23 statements, and for each of the 22
//                                                people who they were, their portrait and its credit, the real links
//                                                between pairs, and on every statement their position with the line
//                                                that proves it. About 110 KB. SERVER ONLY: the result page, the person
//                                                and question pages read it in their front matter. Never import it from
//                                                anything the registry imports, or it ships to the browser on every page.
//   src/data/which-early-christian-scoring.json  What the matching needs and nothing else: the statements, the usual
//                                                answer and position on each, and every person's positions (whether a
//                                                line is shown, and its length, so the share card's line can be chosen
//                                                without the text). About 20 KB. It travels with the quiz: the registry
//                                                imports it through strategies/kindred.ts, and the registry is bundled
//                                                into the browser for the quiz runner and /me/.
//   public/img/early-christians/<slug>.jpg      Each person's portrait from preview/img/, at most 600 px wide (never
//                                                enlarged), progressive JPEG. Credited in public/img/CREDITS.md.
//
// The source lives in design/, outside site/, which is Vercel's root directory, so every output is committed and a build
// without the source keeps them unchanged (as build-psalm-data.mjs does for the Psalm quiz).
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../design/quiz-ideas/fathers');
const QUIZ_SRC = resolve(SRC, 'quiz.json');
const PEOPLE_SRC = resolve(SRC, 'people.json');
const CREDITS_SRC = resolve(SRC, 'preview/img/credits.json');
const FULL_OUT = resolve(here, '../src/data/which-early-christian.json');
const SCORING_OUT = resolve(here, '../src/data/which-early-christian-scoring.json');
const IMG_OUT = resolve(here, '../public/img/early-christians');
const CREDITS_MD = resolve(here, '../public/img/CREDITS.md');

/** How wide a portrait is kept. The largest place one is drawn is a result's hero, about 12rem. */
const PORTRAIT_WIDTH = 600;
/** The chips' and strips' copy: three times the largest chip. */
const THUMB_WIDTH = 160;

/**
 * Photographers a CC BY licence obliges us to name, where credits.json does not. Empty since 2026-09-23: every
 * portrait is public domain or CC0 (Clement, Cyprian and Martin were swapped so share cards owe no credit).
 */
const PHOTO = {};

if (!existsSync(QUIZ_SRC) || !existsSync(PEOPLE_SRC) || !existsSync(CREDITS_SRC)) {
  if (existsSync(FULL_OUT) && existsSync(SCORING_OUT)) {
    console.log('build-early-christian-data: design source not present; using the committed which-early-christian*.json.');
  } else {
    throw new Error('build-early-christian-data: no design source and no committed which-early-christian*.json to fall back on.');
  }
} else {
  const quiz = JSON.parse(readFileSync(QUIZ_SRC, 'utf8'));
  const meta = JSON.parse(readFileSync(PEOPLE_SRC, 'utf8'));
  const credits = JSON.parse(readFileSync(CREDITS_SRC, 'utf8'));
  const fail = m => { throw new Error('build-early-christian-data: ' + m); };

  // The statements, in play order, each with the words a page uses for its topic mid-sentence ("On laughter") and the
  // slug of its question page (/early-church-on/<slug>/).
  const statements = quiz.statements.map(s => {
    const topic = meta.topics[s.id], slug = meta.topicSlugs[s.id];
    if (!topic || !slug) fail(`statement "${s.id}" has no topic or no topic slug in people.json`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`topic slug "${slug}" is not URL-safe`);
    return { id: s.id, text: s.text, topic, slug };
  });
  if (new Set(statements.map(s => s.slug)).size !== statements.length) fail('two statements share a topic slug');
  const ids = new Set(statements.map(s => s.id));
  for (const id of Object.keys(quiz.centre)) if (!ids.has(id)) fail(`centre names an unknown statement "${id}"`);

  /*
   * A credit a reader can read: what the picture is, who made it (never "unknown"), when, who took the photograph where
   * a licence asks for that name, and the licence. The research notes that ride along in credits.json ("the Commons
   * page wrongly says 4th century", "per caption", a library shelfmark) are for us, not for the page, so nothing in
   * brackets or after a semicolon is printed, except that a portrait painted from imagination says so.
   */
  const creditLine = (k, c) => {
    const clean = s => String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/;.*$/, '').trim();
    const [maker, ...rest] = String(c.artist || '').split(';').map(s => s.replace(/\s*\([^)]*\)/g, '').trim());
    const artist = /^unknown\b/i.test(maker) ? '' : maker;
    const photo = PHOTO[k] || rest.map(s => s.replace(/^photo by\s*/i, '')).filter(Boolean)[0] || '';
    const date = /^unknown\b/i.test(c.date || '') ? '' : clean(c.date);
    const title = clean(c.title) || c.file.replace(/^File:/, '').replace(/\.\w+$/, '').replace(/_/g, ' ');
    const imagined = /imagin/i.test(`${c.title} ${c.kind}`) ? 'an imagined likeness' : '';
    return [title, imagined, artist, date].filter(Boolean).join(', ') + '.' +
      (photo ? ` Photo by ${photo}.` : '') +
      ` Wikimedia Commons, ${c.license.replace(/^Public domain$/i, 'public domain')}.`;
  };

  // Oldest first, as /early-christian/ lists them: by the first year in the dates ("c. 347 to 407" is 347), and a
  // person dated only by a century after everyone dated by year.
  const year = d => (/century/.test(d) ? 650 : parseInt(String(d).replace(/^\D+/, ''), 10));

  const keys = Object.keys(quiz.people);
  const full = {}, scoring = {};
  const slugs = new Set();
  for (const k of keys) {
    const p = quiz.people[k], m = meta.people[k], c = credits[k];
    if (!m) fail(`no entry in people.json for "${k}"`);
    if (!c) fail(`no portrait credit for "${k}"`);
    for (const f of ['name', 'short', 'dates', 'where', 'who', 'hook', 'slug']) if (!m[f]) fail(`${k} has no ${f}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug) || slugs.has(m.slug)) fail(`${k} has an unusable or repeated slug "${m.slug}"`);
    slugs.add(m.slug);
    const cells = {}, scoreCells = {};
    for (const s of statements) {
      const cell = p.cells[s.id];
      if (!cell) continue;
      if (![-2, -1, 1, 2].includes(cell.v)) fail(`${k}.${s.id} has position ${cell.v}`);
      if (!cell.work) fail(`${k}.${s.id} names no work`);
      if (!cell.hide && !String(cell.line || '').trim()) fail(`${k}.${s.id} is shown but has no line`);
      cells[s.id] = cell.hide
        ? { v: cell.v, work: cell.work, by: cell.by || null, hide: true }
        : { v: cell.v, work: cell.work, by: cell.by || null, own: !!cell.own, line: cell.line, note: cell.note || null };
      scoreCells[s.id] = cell.hide ? { v: cell.v, hide: true } : { v: cell.v, len: cell.line.length };
    }
    for (const id of Object.keys(p.cells)) if (!ids.has(id)) fail(`${k} has a position on an unknown statement "${id}"`);
    // The floor the result's naming rule assumes: a person on record on fewer than seven questions cannot be matched
    // fairly (model.mjs drops them), and the engine test checks the same thing on the committed file.
    if (Object.keys(cells).length < 7) fail(`${k} is on record on only ${Object.keys(cells).length} statements (floor 7)`);

    // The real links between two people, from both sides, so a page can ask either one.
    const pairs = {};
    for (const [pair, line] of Object.entries(meta.pairs)) {
      const [a, b] = pair.split('|');
      if (!quiz.people[a] || !quiz.people[b]) fail(`pair "${pair}" names someone who is not a result`);
      if (a === k) pairs[b] = line;
      if (b === k) pairs[a] = line;
    }

    full[k] = {
      slug: m.slug, name: m.name, short: m.short, she: !!m.she,
      dates: m.dates, where: m.where, who: m.who, hook: m.hook, status: m.status || null,
      portrait: { src: `/img/early-christians/${m.slug}.jpg`, thumb: `/img/early-christians/thumb/${m.slug}.jpg`, width: 0, height: 0, credit: creditLine(k, c), page: c.page, license: c.license },
      pairs, cells
    };
    scoring[k] = { slug: m.slug, name: m.name, short: m.short, she: !!m.she, dates: m.dates, who: m.who, cells: scoreCells };
  }
  for (const k of Object.keys(meta.people)) if (!quiz.people[k]) console.log(`build-early-christian-data: note: ${k} is in people.json but not a result`);

  // The portraits: downscaled only, progressive, and written only when the source is newer than the copy.
  const sharp = (await import('sharp').catch(() => fail('sharp is not installed; run npm install in site/'))).default;
  mkdirSync(IMG_OUT, { recursive: true });
  let made = 0;
  for (const k of keys) {
    const from = resolve(SRC, 'preview/img', `${k}.jpg`);
    const to = resolve(IMG_OUT, `${full[k].slug}.jpg`);
    if (!existsSync(from)) fail(`no portrait at design/quiz-ideas/fathers/preview/img/${k}.jpg`);
    if (!existsSync(to) || statSync(to).mtimeMs < statSync(from).mtimeMs) {
      await sharp(from)
        .flatten({ background: '#ffffff' }) // one of them is a transparent PNG under a .jpg name
        .resize({ width: PORTRAIT_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(to);
      made++;
    }
    const { width, height } = await sharp(to).metadata();
    full[k].portrait.width = width;
    full[k].portrait.height = height;
    // A small copy for the places a face is a chip or a strip (40-60px on screen): a result page shows all 22.
    const thumb = resolve(IMG_OUT, 'thumb', `${full[k].slug}.jpg`);
    if (!existsSync(thumb) || statSync(thumb).mtimeMs < statSync(to).mtimeMs) {
      mkdirSync(resolve(IMG_OUT, 'thumb'), { recursive: true });
      await sharp(to).resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 76, progressive: true, mozjpeg: true }).toFile(thumb);
    }
  }

  // Every portrait is credited where the site keeps its credits, or the build stops.
  const creditsMd = readFileSync(CREDITS_MD, 'utf8');
  const uncredited = keys.filter(k => !creditsMd.includes(`${full[k].slug}.jpg`));
  if (uncredited.length) fail(`public/img/CREDITS.md does not credit: ${uncredited.map(k => full[k].slug + '.jpg').join(', ')}`);

  const oldestFirst = [...keys].sort((a, b) => year(full[a].dates) - year(full[b].dates));
  const from = 'design/quiz-ideas/fathers/ (quiz.json from model.mjs, people.json, preview/img/credits.json)';
  writeFileSync(FULL_OUT, JSON.stringify({ generatedFrom: from, statements, oldestFirst, people: full }, null, 1));
  writeFileSync(SCORING_OUT, JSON.stringify({ generatedFrom: from, statements, centre: quiz.centre, people: scoring }));
  const shown = keys.reduce((n, k) => n + Object.values(full[k].cells).filter(c => !c.hide).length, 0);
  console.log(
    `which-early-christian.json: ${keys.length} people, ${statements.length} statements, ${shown} lines shown; ` +
    `scoring file ${Math.round(readFileSync(SCORING_OUT).length / 1024)} KB; portraits: ${made} made, ${keys.length - made} up to date`
  );
}
