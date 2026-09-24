// Generate the Christian Personality Test's data from the design source. Never hand-edit an output: change
// design/quiz-ideas/personality/ (items.mjs for the questions, results.mjs for every line of the report, score.mjs for
// the scoring; `python preview/faces.py` for the pictures), then run `npm run data` in site/.
//
//   src/data/personality-scoring.json      What the runner and the scoring need, and nothing the report prints but
//                                          the type names and taglines: the scales, all 72 items with their words,
//                                          the thoughts, the lines, the private note, the types (name, tagline,
//                                          disposition, make-up, opposite, ink, painting), the help card's lines
//                                          (score() returns them), the KEYS of the leanings and the virtues, the
//                                          links' rules, and EXAMPLE_CODE. Minified. It travels to the browser:
//                                          the registry imports it through strategies/personality.ts.
//   src/data/personality.json              EVERY export of results.mjs (a quotation is a plain { q, cite }), plus
//                                          CREDITS, one reader-facing credit per source picture:
//                                            [{ key, line: 'The Wedding Dance, Pieter Bruegel the Elder, c. 1566.
//                                               Wikimedia Commons, public domain.', page: <Commons URL>,
//                                               files: ['art/spark.jpg', 'mosaic.jpg'] }]  (files under /img/personality/)
//                                          and PICTURES, every picture's size for <img width height>:
//                                            { '/img/personality/art/spark.jpg': { width: 1100, height: 832 } }
//                                          SERVER ONLY: the start page and the result page read it in their front
//                                          matter. Never import it from anything the registry imports.
//   src/lib/strategies/personality-score.mjs
//                                          score.mjs VERBATIM, except that its two imports become one import of
//                                          personality-scoring.json. Then this script proves the copy scores
//                                          exactly as the original: every simulated person in sim/answers-3.json
//                                          and 500 random answer sets, compared as JSON. Any difference stops it.
//   public/img/personality/                The eight type paintings (art/<type>.jpg, at most 1100 px long), the
//                                          round faces (faces/<key>.jpg), the page-10 role pictures
//                                          (lines/l-<key>.jpg), and mosaic.jpg (the eight paintings, 2 across and
//                                          4 down, for the home rail and the quiz's band). Credited in
//                                          public/img/CREDITS.md, which this checks.
//   public/img/logo-w-large-white.png      The owner's white brush W, for the share cards drawn over a painting.
//
// The design folder is committed, but its pictures are not (preview/.gitignore): they rebuild from the Commons
// originals. So on Vercel, and in any fresh clone, the text is regenerated and checked while every picture comes from
// the committed copies in public/, and sharp is never loaded (the lesson of d53370a). With no design folder at all,
// every output is used as committed. Either way the build stops if a picture the report or the start page names is
// missing.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const SRC = resolve(here, '../../design/quiz-ideas/personality');
const ITEMS_SRC = resolve(SRC, 'items.mjs');
const RESULTS_SRC = resolve(SRC, 'results.mjs');
const SCORE_SRC = resolve(SRC, 'score.mjs');
const SIM_SRC = resolve(SRC, 'sim/answers-3.json');
const CREDITS_SRC = resolve(SRC, 'preview/img/credits.json');
const PREVIEW = resolve(SRC, 'preview');
const LOGO_SRC = resolve(here, '../../design/graphics/logo-larger-white.png');

const SCORING_OUT = resolve(ROOT, 'src/data/personality-scoring.json');
const FULL_OUT = resolve(ROOT, 'src/data/personality.json');
const SCORE_OUT = resolve(ROOT, 'src/lib/strategies/personality-score.mjs');
const STRATEGY = resolve(ROOT, 'src/lib/strategies/personality.ts');
const EARLY = resolve(ROOT, 'src/data/which-early-christian.json');
const IMG_OUT = resolve(ROOT, 'public/img/personality');
const LOGO_OUT = resolve(ROOT, 'public/img/logo-w-large-white.png');
const CREDITS_MD = resolve(ROOT, 'public/img/CREDITS.md');

/** The example result (no page links it since 2026-09-24): one simulated person, the rideshare driver who sends money home. */
const EXAMPLE_ID = 'p12';

/** The faces of the start page's "The saints behind it" (SAINTS in PersonalityRunner.astro); the report never names John Cassian. */
const START_FACES = ['gregory-the-great', 'gregory-of-nazianzus', 'john-cassian', 'arsenius'];

/** Picture sizes: how they are kept on the site. */
const ART_MAX = 1100;       // a type painting's long side
const FACE_SIDE = 240;      // a round face (the design's crops are 220, and nothing is enlarged)
const LINE_BOX = [760, 1100]; // a page-10 role picture, as faces.py sizes it
const MOSAIC = { cols: 2, rows: 4, width: 640, height: 1024, gap: 4, ground: '#2a2723' };

const fail = m => { throw new Error('build-personality-data: ' + m); };
const log = m => console.log('build-personality-data: ' + m);

/** sharp, loaded only when a picture has to be made (never on Vercel, where the picture sources are absent). */
let sharpLib = null;
const sharp = async () => sharpLib ??= (await import('sharp').catch(() => fail('sharp is not installed; run npm install in site/'))).default;
const newer = (from, to) => !existsSync(to) || statSync(to).mtimeMs < statSync(from).mtimeMs;

const haveText = existsSync(ITEMS_SRC) && existsSync(RESULTS_SRC) && existsSync(SCORE_SRC);

if (!haveText) {
  if (![SCORING_OUT, FULL_OUT, SCORE_OUT].every(existsSync)) {
    fail('no design source and no committed personality-scoring.json, personality.json and personality-score.mjs to fall back on.');
  }
  log('design source not present; using the committed personality*.json and personality-score.mjs.');
  const full = JSON.parse(readFileSync(FULL_OUT, 'utf8'));
  checkReferences(full);
  checkLogo();
} else {
  const items = await import(pathToFileURL(ITEMS_SRC).href);
  const results = await import(pathToFileURL(RESULTS_SRC).href);
  const design = await import(pathToFileURL(SCORE_SRC).href);
  const from = 'design/quiz-ideas/personality/ (items.mjs, results.mjs, score.mjs, sim/answers-3.json, preview/img/credits.json)';

  // ---------------------------------------------------------------- the scoring file (browser)
  const TYPES = Object.fromEntries(Object.entries(results.TYPES).map(([k, t]) => {
    for (const f of ['name', 'tagline', 'disposition', 'makeup', 'opposite', 'ink', 'art']) if (!t[f]) fail(`type ${k} has no ${f}`);
    return [k, { name: t.name, tagline: t.tagline, disposition: t.disposition, makeup: t.makeup, opposite: t.opposite, ink: t.ink, art: t.art }];
  }));
  if (Object.keys(TYPES).length !== 8) fail(`expected 8 types, got ${Object.keys(TYPES).length}`);
  for (const [k, t] of Object.entries(TYPES)) if (!TYPES[t.opposite] || TYPES[t.opposite].opposite !== k) fail(`type ${k}'s opposite ${t.opposite} does not point back`);
  const keysOf = o => Object.fromEntries(Object.keys(o).map(k => [k, 1]));
  const scoring = {
    generatedFrom: from,
    SCALES: items.SCALES,
    ITEMS: items.ITEMS,
    THOUGHTS: items.THOUGHTS,
    LINES: items.LINES,
    PRIVATE_NOTE: items.PRIVATE_NOTE,
    FREQ: items.FREQ,
    TYPES,
    // score() reads only these parts of results.mjs: which leanings and virtues exist (their keys), the links'
    // rules, and the help card's lines, which it returns.
    LEANINGS: keysOf(results.LEANINGS),
    LINKS: results.LINKS.map(l => ({ id: l.id, when: l.when, ...(l.strongOnly ? { strongOnly: true } : {}) })),
    HELP: results.HELP,
    VIRTUES: keysOf(results.VIRTUES)
  };
  if (items.ITEMS.length !== 72) fail(`expected 72 items, got ${items.ITEMS.length}`);
  const twos = items.ITEMS.filter(it => it.kind === 'two').length;
  const privates = items.ITEMS.filter(it => it.block === 'private').map(it => it.id);
  const picks = items.ITEMS.filter(it => it.kind === 'pick').map(it => it.id);
  if (twos !== 58) fail(`the code is laid out for 58 two-sided items, and there are ${twos}: bump CODE_VERSION in strategies/personality.ts`);
  if (picks.join() !== 'b1,b2') fail(`the code is laid out for the picks b1 and b2, and there are: ${picks.join(', ')}`);
  if (items.LINES.length !== 7) fail(`the code's pick digits are laid out for 7 lines, and there are ${items.LINES.length}`);
  if (privates.length !== 12 || privates.some(id => !/^y\d+$/.test(id))) fail('the private block is not y1..y12');
  for (const it of items.ITEMS) {
    if (it.block === 'private' && it.kind !== 'freq') fail(`private item ${it.id} is not a "how often" statement`);
    if (it.kind === 'pick' && (it.max !== 2 || it.options.some(o => !items.LINES.includes(o.line)))) fail(`pick ${it.id} is not "up to two" of the lines`);
  }
  writeFileSync(SCORING_OUT, JSON.stringify(scoring));

  // ---------------------------------------------------------------- the scoring code: score.mjs verbatim
  // Line endings made LF, so the copy is the same bytes whether score.mjs was last saved on Windows or checked out on Linux.
  const scoreSrc = readFileSync(SCORE_SRC, 'utf8').replace(/\r\n/g, '\n');
  const importRe = /^import\s*\{([^}]*)\}\s*from\s*'\.\/(items|results)\.mjs';\r?\n/gm;
  const names = [];
  let found = 0;
  const PLACE = '\u0000IMPORTS\u0000\n';
  const body = scoreSrc.replace(importRe, (_, list) => {
    names.push(...list.split(',').map(s => s.trim()).filter(Boolean));
    return found++ ? '' : PLACE;
  });
  if (found !== 2) fail(`score.mjs should import from items.mjs and results.mjs in exactly two lines; found ${found}`);
  if (/^\s*import\s/m.test(body)) fail('score.mjs imports something besides items.mjs and results.mjs; teach this script about it');
  for (const n of names) if (!(n in scoring)) fail(`score.mjs imports ${n}, which the scoring file does not carry`);
  const generated =
    '// GENERATED by site/scripts/build-personality-data.mjs from design/quiz-ideas/personality/score.mjs. NEVER EDIT THIS\n' +
    '// FILE: change score.mjs and run `npm run data` in site/. It is score.mjs verbatim except its two imports, which here\n' +
    '// read the parts of items.mjs and results.mjs that the scoring uses from src/data/personality-scoring.json.\n' +
    body.replace(PLACE,
      "import PQ_DATA from '../../data/personality-scoring.json';\n" +
      `const { ${names.join(', ')} } = PQ_DATA;\n`);
  writeFileSync(SCORE_OUT, generated);

  // ---------------------------------------------------------------- prove the copy scores as the original
  const sim = JSON.parse(readFileSync(SIM_SRC, 'utf8')).results;
  if (!Array.isArray(sim) || !sim.length) fail('sim/answers-3.json has no simulated people');
  const S = await bundleStrategy();
  let seed = 2026;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const randomAnswers = () => {
    const a = {};
    for (const it of items.ITEMS) {
      if (it.kind === 'pick') {
        const n = Math.floor(rand() * 3), pool = [...items.LINES], out = [];
        while (out.length < n) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
        a[it.id] = out;
      } else a[it.id] = Math.floor(rand() * 7) - 3;
    }
    return a;
  };
  const sets = [...sim.map(p => [p.id, p.answers]), ...Array.from({ length: 500 }, (_, i) => [`random ${i + 1}`, randomAnswers()])];
  let differ = 0;
  for (const [id, answers] of sets) {
    const want = JSON.stringify(design.score(answers));
    const got = JSON.stringify(S.score(answers));
    if (want !== got) { differ++; if (differ < 4) console.log(`  ${id}: the generated scoring differs from score.mjs`); }
    if (JSON.stringify(design.derive(answers)) !== JSON.stringify(S.derive(answers))) { differ++; if (differ < 4) console.log(`  ${id}: derive() differs`); }
  }
  if (differ) fail(`the generated personality-score.mjs does not score as score.mjs on ${differ} answer sets`);

  // ---------------------------------------------------------------- the example's code
  const example = sim.find(p => p.id === EXAMPLE_ID);
  if (!example) fail(`no simulated person ${EXAMPLE_ID} for the example`);
  const EXAMPLE_CODE = S.encodeAnswers(example.answers);
  const back = S.decodeAnswers(EXAMPLE_CODE);
  if (!back || JSON.stringify(S.score(back.answers, back.pub)) !== JSON.stringify({ ...design.score(example.answers), thoughts: null })) {
    fail(`the example's code ${EXAMPLE_CODE} does not give back its report`);
  }
  scoring.EXAMPLE_CODE = EXAMPLE_CODE;
  writeFileSync(SCORING_OUT, JSON.stringify(scoring));

  // ---------------------------------------------------------------- the report's texts (server only)
  const text = {};
  for (const [k, v] of Object.entries(results)) if (typeof v !== 'function') text[k] = v;
  for (const k of ['TYPES', 'DISPOSITIONS', 'MAKEUPS', 'OPPOSITES', 'LEANINGS', 'LINKS', 'ANGER', 'SPEAKER', 'HELP', 'THOUGHT_TEXT', 'FIGHT', 'VIRTUES', 'PARTNERS', 'LINE_TEXT', 'LINE_SIGNALS', 'BODY', 'CHRIST', 'BOATS', 'TRAP_LEAD', 'TRAP_QUIET', 'TRAP_SWAP']) {
    if (!(k in text)) fail(`results.mjs no longer exports ${k}`);
  }
  for (const L of results.LINKS) if (!L.you || !L.text) fail(`link ${L.id} has no words`);
  for (const k of items.LINES) if (!results.LINE_TEXT[k]) fail(`line ${k} has no text`);
  for (const k of items.THOUGHTS) if (!results.THOUGHT_TEXT[k]) fail(`thought ${k} has no text`);

  // ---------------------------------------------------------------- the pictures
  await copyPictures(results);
  const credits = creditsFor(results, JSON.parse(readFileSync(CREDITS_SRC, 'utf8')));
  const pictures = sizesOf();
  const full = { generatedFrom: from, ...text, CREDITS: credits, PICTURES: pictures };
  writeFileSync(FULL_OUT, JSON.stringify(full, null, 1));
  checkReferences(full);
  checkLogo();
  checkCreditsMd();

  log(
    `${items.ITEMS.length} items (${twos} two-sided, ${privates.length} private, ${picks.length} picks), 8 types; ` +
    `scoring file ${Math.round(readFileSync(SCORING_OUT).length / 1024)} KB, report text ${Math.round(readFileSync(FULL_OUT).length / 1024)} KB; ` +
    `the generated scoring matches score.mjs on ${sets.length} answer sets; example ${EXAMPLE_CODE}; ${Object.keys(pictures).length} pictures`
  );
}

// ==================================================================================================== helpers

/** strategies/personality.ts, bundled with the files just written, so the check runs the site's own code. */
async function bundleStrategy() {
  const { build } = await import('esbuild');
  const out = resolve(ROOT, 'node_modules/.build-personality-strategy.mjs');
  await build({ entryPoints: [STRATEGY], outfile: out, bundle: true, format: 'esm', platform: 'node', target: 'node18', logLevel: 'silent' });
  try {
    return await import(pathToFileURL(out).href + '?t=' + Date.now());
  } finally {
    rmSync(out, { force: true });
  }
}

/**
 * Copies the design's pictures into public/img/personality/, only where the source is here and newer than the copy,
 * and remakes the mosaic when a painting changed. With no source a committed copy stands (checked afterwards).
 */
async function copyPictures(results) {
  let made = 0;
  const jobs = [];
  for (const t of Object.values(results.TYPES)) jobs.push(['arts', `${t.art}.jpg`, 'art', `${t.art}.jpg`, 'art']);
  if (existsSync(resolve(PREVIEW, 'faces'))) for (const f of readdirSync(resolve(PREVIEW, 'faces')).filter(f => f.endsWith('.jpg'))) jobs.push(['faces', f, 'faces', f, 'face']);
  if (existsSync(resolve(PREVIEW, 'lines'))) for (const f of readdirSync(resolve(PREVIEW, 'lines')).filter(f => /^l-.*\.jpg$/.test(f))) jobs.push(['lines', f, 'lines', f, 'line']);
  for (const [dir, file, outDir, outFile, kind] of jobs) {
    const from = resolve(PREVIEW, dir, file), to = resolve(IMG_OUT, outDir, outFile);
    if (!existsSync(from) || !newer(from, to)) continue;
    mkdirSync(dirname(to), { recursive: true });
    const img = (await sharp())(from).flatten({ background: '#ffffff' });
    if (kind === 'art') img.resize({ width: ART_MAX, height: ART_MAX, fit: 'inside', withoutEnlargement: true });
    if (kind === 'face') img.resize({ width: FACE_SIDE, height: FACE_SIDE, fit: 'cover', withoutEnlargement: true });
    if (kind === 'line') img.resize({ width: LINE_BOX[0], height: LINE_BOX[1], fit: 'inside', withoutEnlargement: true });
    await img.jpeg({ quality: kind === 'face' ? 80 : kind === 'line' ? 76 : 78, progressive: true, mozjpeg: true }).toFile(to);
    made++;
  }

  // The mosaic: the eight paintings in the design's order, two across and four down, each cropped to its centre.
  const arts = Object.values(results.TYPES).map(t => resolve(PREVIEW, 'arts', `${t.art}.jpg`));
  const mosaic = resolve(IMG_OUT, 'mosaic.jpg');
  if (arts.every(existsSync) && arts.some(a => newer(a, mosaic))) {
    const { cols, rows, width, height, gap, ground } = MOSAIC;
    const w = (width - gap * (cols - 1)) / cols, h = (height - gap * (rows - 1)) / rows;
    if (!Number.isInteger(w) || !Number.isInteger(h)) fail('the mosaic cells do not divide evenly');
    const tiles = await Promise.all(arts.map(async (a, i) => ({
      input: await (await sharp())(a).resize({ width: w, height: h, fit: 'cover', position: 'centre' }).toBuffer(),
      left: (i % cols) * (w + gap), top: Math.floor(i / cols) * (h + gap)
    })));
    mkdirSync(IMG_OUT, { recursive: true });
    await (await sharp())({ create: { width, height, channels: 3, background: ground } })
      .composite(tiles).jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(mosaic);
    made++;
  }
  if (made) log(`${made} pictures made in public/img/personality/`);
}

/** Every picture file under public/img/personality/, relative to it, with its width and height. */
function sizesOf() {
  const out = {};
  const walk = dir => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = resolve(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.jpg')) {
        const { width, height } = jpegSize(readFileSync(p), p);
        out['/img/personality/' + relative(IMG_OUT, p).replace(/\\/g, '/')] = { width, height };
      }
    }
  };
  if (existsSync(IMG_OUT)) walk(IMG_OUT);
  return out;
}

/** The pictures the report and the start page name, and where each lives on the site. */
function referenced(full) {
  const refs = new Set(['/img/personality/mosaic.jpg', ...START_FACES.map(k => `/img/personality/faces/${k}.jpg`)]);
  for (const t of Object.values(full.TYPES)) {
    refs.add(`/img/personality/art/${t.art}.jpg`);
    for (const k of t.kindred || []) refs.add(`/img/personality/faces/${k.img}.jpg`);
  }
  for (const o of Object.values(full.OPPOSITES)) for (const p of Object.values(o.people)) refs.add(`/img/personality/faces/${p.img}.jpg`);
  for (const l of Object.values(full.LINE_TEXT)) {
    refs.add(`/img/personality/lines/l-${l.img}.jpg`);
    refs.add(`/img/personality/faces/${l.img}.jpg`); // the partner line's face on page 10
  }
  return [...refs];
}

function checkReferences(full) {
  const missing = referenced(full).filter(r => !existsSync(resolve(ROOT, 'public' + r)));
  if (missing.length) fail(`pictures the report names are missing from public/: ${missing.join(', ')}`);
}

function checkLogo() {
  if (existsSync(LOGO_SRC) && newer(LOGO_SRC, LOGO_OUT)) copyFileSync(LOGO_SRC, LOGO_OUT);
  if (!existsSync(LOGO_OUT)) fail('no white W at public/img/logo-w-large-white.png, and no design/graphics/logo-larger-white.png to copy');
}

/** Every file in public/img/personality/ is named in CREDITS.md, or the build stops. */
function checkCreditsMd() {
  const md = readFileSync(CREDITS_MD, 'utf8');
  const files = Object.keys(sizesOf()).map(p => p.replace('/img/personality/', ''));
  const uncredited = files.filter(f => !md.includes('`' + f + '`') && !md.includes('| ' + f + ' |'));
  if (uncredited.length) fail(`public/img/CREDITS.md does not credit: ${uncredited.join(', ')}`);
}

/**
 * The reader-facing credits, one per source picture, with the site files made from it: the paintings, then every
 * face and role picture. A face whose original is in preview/img/credits.json is credited from there; one cropped from
 * an early Christian's portrait (as faces.py does for them) carries that portrait's credit from quiz #4's data.
 */
function creditsFor(results, credits) {
  const early = existsSync(EARLY) ? JSON.parse(readFileSync(EARLY, 'utf8')).people : {};
  const earlyBySlug = Object.fromEntries(Object.values(early).map(p => [p.slug, p]));
  const ALIAS = { 'ambrose-of-milan': 'ambrose' }; // faces.py's own swap: the Palermo mosaic for the Milan one
  const out = new Map();
  const add = (file, key) => {
    const ck = credits[ALIAS[key] ?? key] ? ALIAS[key] ?? key : credits[key] ? key : null;
    let entry;
    if (ck) {
      const c = credits[ck];
      entry = out.get('c:' + ck) ?? { key: ck, line: creditLine(c), page: c.page, files: [] };
      out.set('c:' + ck, entry);
    } else if (earlyBySlug[key]) {
      const p = earlyBySlug[key];
      entry = out.get('e:' + key) ?? { key, line: p.portrait.credit, page: p.portrait.page, files: [] };
      out.set('e:' + key, entry);
    } else fail(`no credit for ${file}: add it to preview/img/credits.json`);
    if (!entry.files.includes(file)) entry.files.push(file);
  };
  for (const t of Object.values(results.TYPES)) { add(`art/${t.art}.jpg`, t.art); add('mosaic.jpg', t.art); }
  const sized = Object.keys(sizesOf()).map(p => p.replace('/img/personality/', ''));
  const faceKey = f => f.replace(/^faces\//, '').replace(/^lines\/l-/, '').replace(/\.jpg$/, '');
  // Faces and role pictures in the order the report first shows them, then the start page's saints, then any others.
  const order = [];
  for (const t of Object.values(results.TYPES)) for (const k of t.kindred) order.push(k.img);
  for (const o of Object.values(results.OPPOSITES)) for (const p of Object.values(o.people)) order.push(p.img);
  for (const l of Object.values(results.LINE_TEXT)) order.push(l.img);
  order.push(...START_FACES);
  const files = sized.filter(f => /^(faces|lines)\//.test(f))
    .sort((a, b) => ((order.indexOf(faceKey(a)) + 1 || 999) - (order.indexOf(faceKey(b)) + 1 || 999)) || a.localeCompare(b));
  for (const f of files) add(f, faceKey(f));
  return [...out.values()];
}

/**
 * A credit a reader can read, as quiz #4's build writes one: what the picture is, who made it (never "unknown"), when,
 * and the licence in plain words. The research notes in credits.json (brackets, anything after a semicolon, a
 * Commons page's own dating) are for us, not for the page.
 */
function creditLine(c) {
  const clean = s => {
    let t = String(s || '');
    for (let i = 0; i < 4; i++) t = t.replace(/\s*\([^()]*\)/g, '');
    return t.replace(/;.*$/, '').replace(/\s+,/g, ',').trim();
  };
  const maker = clean(String(c.artist || '').split(';')[0]);
  const artist = /^unknown\b/i.test(maker) ? '' : maker;
  const date = /^unknown\b/i.test(c.date || '') ? '' : clean(c.date);
  const title = clean(c.title) || String(c.file || '').replace(/^File:/, '').replace(/\.\w+$/, '').replace(/_/g, ' ');
  const licence = /^public domain/i.test(c.license) ? 'public domain' : /cc0/i.test(c.license) ? 'CC0' : clean(c.license);
  return [title, artist, date].filter(Boolean).join(', ') + `. Wikimedia Commons, ${licence}.`;
}

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(buf, name) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  fail('cannot read the size of ' + name);
}
