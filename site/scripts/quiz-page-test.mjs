/**
 * The quiz-page guard. Reads every quiz's BUILT page and fails the build if the page breaks one
 * of the rules the owner set for every quiz, present and future (2026-09-24):
 *
 *   the intro ends with how to answer, then the start box, then Read next, in that order, with
 *     nothing between them and nothing after them
 *   exactly one start box on the page, and no sentence under its heading
 *   Read next holds exactly three article cards, none of them twice
 *   no small "kicker" line over any section of the intro, except "When you are ready" in the
 *     start box and the one over Read next
 *   no "Answer honestly rather than correctly" anywhere on the page
 *
 * components/QuizFoot.astro draws the three blocks, so a runner that puts it last passes by
 * construction. This file is the check that the construction held: a new runner, or a block
 * added under the foot, fails here with the page and the rule named.
 *
 * It reads the output rather than the source for the reason seo-test.mjs does: the bytes a
 * reader is sent are the only thing the rules are about. Runs as `postbuild` after seo-test.mjs.
 * Pass a directory to check a different root (the default is .vercel/output/static):
 *
 *   node scripts/quiz-page-test.mjs [root]
 *
 * The quizzes come from the registry itself, bundled the way engine-test.mjs bundles it, so a
 * quiz whose page was never built fails rather than being skipped.
 */
import { build } from 'esbuild';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(process.argv[2] ?? resolve(ROOT, '.vercel/output/static'));
const BUNDLE = resolve(ROOT, 'node_modules/.quiz-page-test.mjs');

/** How many articles Read next holds on every quiz page (lib/read-next.ts READ_NEXT_COUNT). */
const READS = 3;

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);

/* ------------------------------------------------------------------ a small HTML reader */
/*
 * Enough of a parser for the site's own output, which Astro writes with every element closed:
 * elements with their attributes, their parent and children, and where they sit in the source,
 * so their text can be read back. No dependency, so the guard cannot break on an upgrade.
 */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const TAG = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parse(html) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null, start: 0, inner: 0, end: html.length };
  let cur = root;
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    if (m[1]) {
      // A closing tag closes the nearest open element of its name; a stray one is ignored.
      const name = m[1].toLowerCase();
      let el = cur;
      while (el && el.tag !== name) el = el.parent;
      if (!el || el === root) continue;
      for (let c = cur; c !== el.parent; c = c.parent) c.end = c.end ?? m.index;
      el.innerEnd = m.index;
      el.end = TAG.lastIndex;
      cur = el.parent;
    } else if (m[2]) {
      const name = m[2].toLowerCase();
      const attrs = {};
      ATTR.lastIndex = 0;
      let a;
      while ((a = ATTR.exec(m[3] ?? ''))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
      const el = { tag: name, attrs, children: [], parent: cur, start: m.index, inner: TAG.lastIndex };
      cur.children.push(el);
      if (RAW.has(name)) {
        const close = html.toLowerCase().indexOf('</' + name, TAG.lastIndex);
        const stop = close < 0 ? html.length : close;
        el.innerEnd = stop;
        el.end = html.indexOf('>', stop) + 1 || html.length;
        TAG.lastIndex = el.end;
      } else if (VOID.has(name) || m[4]) {
        el.innerEnd = el.inner;
        el.end = TAG.lastIndex;
      } else {
        cur = el;
      }
    }
  }
  return root;
}

const classes = el => (el.attrs.class ?? '').split(/\s+/).filter(Boolean);
const hasClass = (el, c) => classes(el).includes(c);
function* walk(el) {
  for (const c of el.children) { yield c; yield* walk(c); }
}
const find = (el, test) => { for (const d of walk(el)) if (test(d)) return d; return null; };
const findAll = (el, test) => [...walk(el)].filter(test);
const decode = s => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const textOf = (html, el) =>
  decode(html.slice(el.inner, el.innerEnd ?? el.end).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const describe = el => `<${el.tag}${el.attrs.id ? '#' + el.attrs.id : ''}${classes(el).map(c => '.' + c).join('')}>`;

/* ------------------------------------------------------------------ the quizzes */

await build({
  entryPoints: [resolve(ROOT, 'src/lib/engine/registry.ts')],
  outfile: BUNDLE,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  logLevel: 'silent'
});
const { QUIZZES } = await import(pathToFileURL(BUNDLE).href);
rmSync(BUNDLE, { force: true });

console.log('quiz page guard: ' + OUT);
if (!existsSync(OUT)) {
  console.log('  FAIL no built output at ' + OUT + ' (run astro build first)');
  process.exit(1);
}

/** The intro of each runner: the statement runner's, the reading's, the personality test's. */
const INTRO_IDS = ['intro', 'reading-intro', 'pqr-intro'];
/** The how-to-answer box's title. A reading asks no statements, so its is "How it works". */
const HOW_TITLES = ['How to answer', 'How it works'];

for (const quiz of QUIZZES) {
  const path = `/q/${quiz.slug}/`;
  const file = join(OUT, 'q', quiz.slug, 'index.html');
  if (!existsSync(file)) { fail(path + ': the page was not built'); continue; }
  const html = readFileSync(file, 'utf8');
  const doc = parse(html);
  const before = failures;
  const bad = rule => fail(path + ': ' + rule);

  // Nowhere a reader can see it, not only in the intro: the line is gone from every quiz.
  const visible = html
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  if (/answer honestly rather than correctly/i.test(visible)) {
    bad('still says "Answer honestly rather than correctly" (the owner took that line off every quiz)');
  }
  if (find(doc, e => hasClass(e, 'howto-line'))) bad('still draws a .howto-line');

  const intros = findAll(doc, e => INTRO_IDS.includes(e.attrs.id));
  if (intros.length !== 1) { bad(`expected one quiz intro (#${INTRO_IDS.join(', #')}), found ${intros.length}`); continue; }
  const intro = intros[0];

  /* exactly one start box, and nothing under its heading */
  const starts = findAll(doc, e => hasClass(e, 'wayin'));
  if (starts.length !== 1) { bad(`expected exactly one start box (.wayin), found ${starts.length}`); continue; }
  const start = starts[0];
  if (!find(intro, e => e === start)) bad('the start box is not inside the intro');
  const inner = find(start, e => hasClass(e, 'wayin-in'));
  const parts = inner ? inner.children : [];
  const shape = parts.map(e => (e.tag === 'h2' ? 'h2' : classes(e).find(c => ['wayin-kicker', 'btn-row'].includes(c)) ?? describe(e)));
  if (shape.join(' ') !== 'wayin-kicker h2 btn-row') {
    bad(`the start box must hold the kicker, the heading and the buttons and nothing else; it holds ${shape.join(', ') || 'nothing'}`);
  }
  const heading = parts.find(e => e.tag === 'h2');
  if (heading) {
    const said = textOf(html, heading);
    if (!/^\d+ (statements|questions), about \d+ minutes\.$/.test(said)) {
      bad(`the start box's heading should read "<count> statements|questions, about <minutes> minutes."; it reads "${said}"`);
    }
    if (find(heading, e => e.tag === 'br')) bad("the start box's heading has a forced line break");
  }
  const kick = parts.find(e => hasClass(e, 'wayin-kicker'));
  if (kick && textOf(html, kick) !== 'When you are ready') bad(`the start box's kicker reads "${textOf(html, kick)}", not "When you are ready"`);

  /* how to answer directly above it, Read next directly under it, and nothing after that */
  const siblings = start.parent.children;
  const at = siblings.indexOf(start);
  const how = siblings[at - 1];
  const next = siblings[at + 1];
  const reads = find(intro, e => hasClass(e, 'qreads'));
  const howTitle = how && find(how, e => hasClass(e, 'sect-title'));
  if (!how || !howTitle || !HOW_TITLES.includes(textOf(html, howTitle)) || !find(how, e => hasClass(e, 'steps'))) {
    bad(`the block directly above the start box must be How to answer (its title and its steps); it is ${how ? describe(how) : 'nothing'}`);
  }
  if (!reads) bad('there is no Read next in the intro');
  else if (next !== reads) bad(`the block directly under the start box must be Read next; it is ${next ? describe(next) : 'nothing'}`);
  if (reads) {
    for (let e = reads; e !== intro; e = e.parent) {
      if (!e.parent) { bad('Read next is not inside the intro'); break; }
      const kids = e.parent.children;
      if (kids[kids.length - 1] !== e) {
        bad(`Read next must be the last thing in the intro; ${describe(kids[kids.length - 1])} comes after it`);
        break;
      }
    }
    const cards = findAll(reads, e => e.tag === 'a' && hasClass(e, 'read'));
    const hrefs = cards.map(c => c.attrs.href);
    if (cards.length !== READS) bad(`Read next holds ${cards.length} article card(s), not ${READS}`);
    if (new Set(hrefs).size !== hrefs.length) bad(`Read next shows an article twice: ${hrefs.join(', ')}`);
    for (const h of hrefs) if (!/^\/articles\/[^/]+\/$/.test(h ?? '')) bad(`a Read next card goes to ${h}, not to an article`);
  }

  /* no kicker over any section, but the start box's and Read next's */
  for (const k of findAll(intro, e => classes(e).some(c => /kicker/.test(c)))) {
    const inStart = find(start, e => e === k);
    const inReads = reads && find(reads, e => e === k);
    const allowed = (inStart && hasClass(k, 'wayin-kicker')) ||
      (inReads && hasClass(k, 'sect-kicker') && /^Alongside this /.test(textOf(html, k)));
    if (!allowed) bad(`a section kicker is still printed: ${describe(k)} "${textOf(html, k)}"`);
  }

  if (failures === before) ok(`${path} ends on how to answer, the start box and three to read`);
}

console.log(failures ? '\nquiz page guard: ' + failures + ' problem(s)' : '\nquiz page guard: all checks passed');
process.exit(failures ? 1 : 0);
