/**
 * Draw social preview cards with headless Chrome from design/og/card.html.
 *
 *   node design/og/render.mjs drafts           the home-page drafts, into design/og/out/
 *   node design/og/render.mjs site             every page's card, into site/public/og/
 *   node design/og/render.mjs site r-          only the cards whose name holds "r-" (any text)
 *
 * Output is 1200 x 630 JPEG (quality 86). The cards are generated but committed, like the
 * site's other generated files: Vercel's root is site/ and has no Chrome.
 *
 * Four Chromes run at once: there are about two hundred cards since every result outcome got
 * one of its own (2026-09-23), and one at a time took the best part of ten minutes.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CARD = pathToFileURL(join(here, 'card.html')).href;
const AT_ONCE = 4;

export async function draw(out, params) {
  const url = CARD + '?' + new URLSearchParams(params).toString();
  const png = out.replace(/\.jpg$/, '.png');
  const profile = mkdtempSync(join(tmpdir(), 'og-'));
  await run(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files',
    `--user-data-dir=${profile}`, '--window-size=1200,630', '--virtual-time-budget=9000', `--screenshot=${png}`, url]);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  await run('python', ['-c', `from PIL import Image; im=Image.open(r'${png}').convert('RGB').crop((0,0,1200,630)); im.save(r'${out}','JPEG',quality=86,optimize=True,progressive=True)`]);
  rmSync(png, { force: true });
  console.log('drew', out.replace(ROOT, '').replace(/\\/g, '/'));
}

/** A card's picture: under site/public when it starts with a slash, else beside card.html. */
const picture = p => (p.startsWith('/') ? join(ROOT, 'site/public', p) : resolve(here, p));

const mode = process.argv[2] || 'drafts';

if (mode === 'drafts') {
  const OUT = join(here, 'out');
  mkdirSync(OUT, { recursive: true });
  await draw(join(OUT, 'A-sky.jpg'), { v: 'center', tone: 'photo', img: '/img/sky-rays.jpg', pos: '40% 55%',
    h: 'Know yourself|a little *better.*', s: 'Free Christian quizzes and Bible games.' });
  await draw(join(OUT, 'B-engravings.jpg'), { v: 'trip', tone: 'engraving',
    imgs: '/img/dore-moses.jpg,/img/figures/david.jpg,/img/figures/daniel.jpg', poss: '50% 12%,50% 25%,50% 30%',
    h: 'Which Bible character|are you most *like?*', s: 'And three more quizzes, two Bible games. All free.' });
  await draw(join(OUT, 'C-walker.jpg'), { v: 'right', tone: 'dawn', img: '/img/hero-dawn.jpg', pos: '20% 45%',
    h: 'See where|you *actually* stand.', s: 'Free Christian quizzes and Bible games.' });
  await draw(join(OUT, 'D-shelf.jpg'), { v: 'shelf', tone: 'photo', img: '/img/sky-rays.jpg', pos: '30% 60%',
    h: 'Know yourself|a little *better.*', s: 'Find your tradition, your gifts, and the Bible figure you are most like.' });
}

if (mode === 'site') {
  const { CARDS, writeManifest } = await import('./cards.mjs');
  const OUT = join(ROOT, 'site/public/og');
  mkdirSync(OUT, { recursive: true });
  const only = process.argv[3];
  const todo = [];
  for (const [name, params] of Object.entries(CARDS)) {
    if (only && !name.includes(only)) continue;
    if (params.img && !existsSync(picture(params.img))) { console.log('SKIP (no picture)', name); continue; }
    todo.push([name, params]);
  }
  const failed = [];
  await Promise.all(Array.from({ length: AT_ONCE }, async () => {
    for (let job; (job = todo.shift()); ) {
      const [name, params] = job;
      try { await draw(join(OUT, name + '.jpg'), params); }
      catch (e) { failed.push(name); console.log('FAILED', name, e.message); }
    }
  }));
  if (failed.length) { console.log(`${failed.length} failed: ${failed.join(', ')}`); process.exitCode = 1; }
  console.log('manifest', writeManifest().replace(ROOT, ''));
}
