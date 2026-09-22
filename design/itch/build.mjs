/**
 * The itch.io copy of Sounds Like Scripture, its cover and its screenshots.
 *
 *   node design/itch/build.mjs            the game file and the cover, into design/itch/upload/
 *   node design/itch/build.mjs shots      the same, plus screenshots of the game as itch will frame it
 *
 * The game file is demos/sounds-like-scripture.html (built by demos/sounds-like-scripture/scripts/
 * build-page.mjs) with three swaps, because on itch the game runs in a frame on itch's own file host:
 *   1. challenge links point at the game's page on wiserwalk.com, not at the frame's address;
 *   2. the chip on the start screen links to wiserwalk.com;
 *   3. the result screen offers the other game and the quizzes.
 * Every swap must match exactly once or the build stops. Re-run and re-upload whenever the pool is
 * rebuilt: a challenge link replays the same ten lines only while both copies hold the same pool.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const OUT = join(here, 'upload');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SITE = 'https://wiserwalk.com';
mkdirSync(OUT, { recursive: true });

function swap(text, from, to) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`expected exactly one match, found ${n}: ${from.slice(0, 60)}`);
  return text.replace(from, () => to);
}

let html = readFileSync(join(ROOT, 'demos/sounds-like-scripture.html'), 'utf8');
html = swap(html,
  'function linkBase() { return location.origin + location.pathname; }',
  `function linkBase() { return '${SITE}/play/sounds-like-scripture/'; }`);
html = swap(html,
  '<p class="band-chip">A wiserwalk game</p>',
  `<p class="band-chip"><a href="${SITE}/" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">A wiserwalk.com game</a></p>`);
html = swap(html,
  '<p class="small foot" id="footResult"></p>',
  `<p class="small" style="margin:1.4rem 0 0;text-align:center"><a href="${SITE}/play/who-said-it/" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600;text-decoration:none">Play Who Said It?</a><span aria-hidden="true"> · </span><a href="${SITE}/" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600;text-decoration:none">Free quizzes at wiserwalk.com</a></p>\n    <p class="small foot" id="footResult"></p>`);
const gameFile = join(OUT, 'sounds-like-scripture.html');
writeFileSync(gameFile, html);
console.log('wrote', 'design/itch/upload/sounds-like-scripture.html', Math.round(html.length / 1024) + ' KB');

function chrome(url, png, w, h, budget, scale = 1) {
  const profile = mkdtempSync(join(tmpdir(), 'itch-'));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files',
    `--user-data-dir=${profile}`, `--window-size=${w},${h}`, `--force-device-scale-factor=${scale}`,
    `--virtual-time-budget=${budget}`, `--screenshot=${png}`, url], { stdio: 'ignore' });
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

/* The cover: drawn at twice the size and brought down, so the type is clean at 630 x 500. */
const cover = join(OUT, 'cover.png');
chrome(pathToFileURL(join(here, 'cover.html')).href, cover, 630, 500, 9000, 2);
execFileSync('python', ['-c', `from PIL import Image; im=Image.open(r'${cover}').convert('RGB').crop((0,0,1260,1000)).resize((630,500), Image.LANCZOS); im.save(r'${cover}', optimize=True)`]);
console.log('drew ', 'design/itch/upload/cover.png');

/* Screenshots: a throwaway copy of the game that plays itself to the screen asked for. */
if (process.argv[2] === 'shots') {
  const W = 960, H = 720;
  const driver = `<script>(function () {
    var want = (/shot=(\\w+)/.exec(location.search) || [])[1]; if (!want) return;
    function shown(id) { var e = document.getElementById(id); return e && !e.disabled && e.getClientRects().length ? e : null; }
    var answered = 0, chose = false;
    var t = setInterval(function () {
      var b;
      if (want === 'start') { clearInterval(t); return; }
      if (!chose) { chose = true; document.getElementById('canon-protestant').click(); return; }
      if ((b = shown('btnPlay'))) { b.click(); return; }
      if (want === 'play') { clearInterval(t); return; }
      if ((b = shown('btnNext'))) { if (want === 'reveal' && answered >= 3) { clearInterval(t); return; } b.click(); return; }
      if ((b = shown(answered % 3 === 1 ? 'btnNo' : 'btnYes'))) { answered++; b.click(); return; }
    }, 350);
  })();</script>`;
  const tmp = join(OUT, '_shots.html');
  writeFileSync(tmp, html + driver);
  const base = pathToFileURL(tmp).href;
  for (const [name, budget] of [['start', 3000], ['play', 2600], ['reveal', 8000], ['result', 30000]]) {
    const png = join(OUT, `screenshot-${name}.png`);
    chrome(`${base}?shot=${name}`, png, W, H, budget);
    execFileSync('python', ['-c', `from PIL import Image; im=Image.open(r'${png}').convert('RGB').crop((0,0,${W},${H})); im.save(r'${png}', optimize=True)`]);
    console.log('shot ', `design/itch/upload/screenshot-${name}.png`);
  }
  rmSync(tmp, { force: true });
}
