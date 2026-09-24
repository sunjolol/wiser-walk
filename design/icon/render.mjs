/**
 * RETIRED 2026-09-24. The site icon is now the owner's brush W, drawn by render-w.mjs. Running this
 * file would put the old serif W back over it in site/public/. Kept as the record of the first icon.
 *
 * The site icon, drawn once and cut to every size a browser or a search engine asks for.
 *
 *   node design/icon/render.mjs            (from the repo root; needs Chrome and site/node_modules)
 *
 * The mark is set in DM Serif Display, which is a web font, so it cannot be written as SVG
 * text: an SVG favicon may not load a font, and the letter would fall back to whatever serif
 * the machine has. Chrome draws `tile.html?k=B` at 512 px with the real font, and sharp cuts
 * that master down. The files land in site/public/ and are committed, like the social cards.
 *
 * Why these sizes: Google only shows a favicon whose side is a multiple of 48 px, so 48, 96
 * and 192 are all there and the .ico leads with 48. 180 is what iOS asks for. 512 is the logo
 * the home page's structured data points at.
 *
 * The owner picked from four candidates on 2026-09-21; `candidates.png` is that sheet, and
 * tile.html still draws all four (?k=A..D) in case the choice is ever revisited.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const out = join(root, 'site', 'public');
const sharp = createRequire(join(root, 'site', 'package.json'))('sharp');

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PICK = 'B';

const work = mkdtempSync(join(tmpdir(), 'ww-icon-'));
const master = join(work, 'master.png');
try {
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${join(work, 'profile')}`,
    '--window-size=512,512',
    // Long enough for the font to arrive; a capture taken before it does is a Times W.
    '--virtual-time-budget=15000',
    `--screenshot=${master}`,
    `${pathToFileURL(join(here, 'tile.html')).href}?k=${PICK}`
  ], { stdio: 'ignore' });

  const png = size => sharp(master).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();

  for (const [name, size] of [['icon-48.png', 48], ['icon-96.png', 96], ['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    writeFileSync(join(out, name), await png(size));
    console.log(name, size);
  }

  // An .ico is a small directory in front of ordinary PNGs. 48 first: it is the one Google reads.
  const sizes = [48, 32, 16];
  const images = await Promise.all(sizes.map(png));
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const entries = sizes.map((size, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size, 0); e.writeUInt8(size, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(images[i].length, 8); e.writeUInt32LE(offset, 12);
    offset += images[i].length;
    return e;
  });
  writeFileSync(join(out, 'favicon.ico'), Buffer.concat([head, ...entries, ...images]));
  console.log('favicon.ico', sizes.join('/'));
} finally {
  rmSync(work, { recursive: true, force: true });
}
