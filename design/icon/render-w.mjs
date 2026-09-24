/**
 * The site icon from the owner's brush W (2026-09-24: "change our favicon to our new logo").
 *
 *   node design/icon/render-w.mjs preview <out-dir>   every option at every size, for the mock-up
 *   node design/icon/render-w.mjs ship                the owner's picks into site/public/ (SHIP below)
 *
 * The W is design/icon/w.svg, traced from his PNG by trace-w.py, so every size is cut from a vector
 * rather than blown up from 159 px. Three options, each a treatment of the same W:
 *
 *   night   the W in its own colours on the site's night ground, as it glows on the dark panels
 *   bare    the W alone on a clear ground, as it sits in the header
 *   dawn    the W in white on the site's blue-to-orange, where the old serif W icon was
 *
 * Two kinds of file, because they are shown two ways:
 *   favicons (16, 32, 48, 96, favicon.svg, favicon.ico)  a rounded tile with clear corners, since a
 *     browser tab or a search result shows the file exactly as drawn
 *   home-screen and logo pictures (180, 192, 512)  full-bleed and opaque: iOS rounds its own corners
 *     and paints anything clear black, and Google shows the 512 as the site's logo on white
 *
 * Small sizes are not just scaled down. At 16 px the W's thinnest stroke would be under a pixel and
 * the pale middle of its gradient would vanish on a white tab, so the small cuts thicken the stroke
 * (a stroke in the W's own gradient around its outline) and let the W fill more of the tile.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const sharp = createRequire(join(root, 'site', 'package.json'))('sharp');

const W = readFileSync(join(here, 'w.svg'), 'utf8');
const D = /<path fill="url\(#w\)" d="([^"]+)"/.exec(W)[1];
const VB = /viewBox="([^"]+)"/.exec(W)[1].split(/\s+/).map(Number);   // [x, y, w, h]
const GRAD = /<linearGradient[^>]*>[\s\S]*?<\/linearGradient>/.exec(W)[0];

/** How much of the tile's width the W takes, and how much its stroke is thickened (in W units), by size. */
const FIT = (size, bleed) => bleed ? { fill: 0.74, grow: 0 }
  : size <= 16 ? { fill: 0.9, grow: 9 } : size <= 32 ? { fill: 0.88, grow: 5 } : size <= 48 ? { fill: 0.86, grow: 3 } : { fill: 0.82, grow: 1 };

const OPTIONS = {
  night: { ground: 'night', ink: 'url(#w)' },
  bare: { ground: 'none', ink: 'url(#w)' },
  dawn: { ground: 'dawn', ink: '#FFFDF9' }
};

/*
 * The owner's picks from the mock-up (2026-09-24, https://claude.ai/artifact/PjnWXjj8NRYp9ztfxsXRbH):
 * "on its own" everywhere, except the phone's home screen, which wears the night tile. There the W
 * sat high to his eye ("maybe 3-5 pixels" at the 60 px an iPhone shows it), so it comes down by
 * NUDGE of the tile: first 6.5% (about 4 px at 60), which he found "slightly too far down", so half
 * of that. The home-screen files are the only ones Base.astro offers as apple-touch-icon.
 */
const NUDGE = 0.0325;
const SHIP = [
  // [file, option, size, bleed, nudge]
  ['icon-48.png', 'bare', 48, false, 0],
  ['icon-96.png', 'bare', 96, false, 0],
  ['icon-512.png', 'bare', 512, true, 0],          // the logo in the home page's structured data, on white
  ['apple-touch-icon.png', 'night', 180, true, NUDGE],
  ['icon-192.png', 'night', 192, true, NUDGE]      // Android takes the largest home-screen icon it is offered
];
const ICO = { option: 'bare', sizes: [48, 32, 16] };

/** One icon as SVG text. `bleed` true for the home-screen and logo pictures (square, opaque). */
function svg(option, size, bleed, nudge = 0) {
  const o = OPTIONS[option];
  const { fill, grow } = FIT(size, bleed);
  const S = 512;                       // drawn on a 512 canvas, then scaled
  const r = bleed ? 0 : S * 0.22;      // a tab's rounded tile; iOS and Android round the others themselves
  const ground = option === 'bare' && bleed ? 'paper' : o.ground;
  const scale = (S * fill) / (VB[2] + grow);
  const tx = (S - VB[2] * scale) / 2 - VB[0] * scale;
  const ty = (S - VB[3] * scale) / 2 - VB[1] * scale + S * nudge;
  const back = ground === 'night'
    ? `<rect width="${S}" height="${S}" rx="${r}" fill="#1B1C23"/>` +
      (size >= 48 ? `<rect width="${S}" height="${S}" rx="${r}" fill="url(#glow-b)"/><rect width="${S}" height="${S}" rx="${r}" fill="url(#glow-o)"/>` : '')
    : ground === 'dawn'
      ? `<rect width="${S}" height="${S}" rx="${r}" fill="url(#dawn)"/>`
      : ground === 'paper'
        ? `<rect width="${S}" height="${S}" rx="${r}" fill="#FFFFFF"/>`
        : '';
  const stroke = grow ? ` stroke="${o.ink}" stroke-width="${grow}" stroke-linejoin="round"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs>${GRAD}
<linearGradient id="dawn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7EBAEE"/><stop offset="1" stop-color="#F0A06F"/></linearGradient>
<radialGradient id="glow-b" cx=".9" cy=".05" r=".8"><stop offset="0" stop-color="#7EBAEE" stop-opacity=".3"/><stop offset="1" stop-color="#7EBAEE" stop-opacity="0"/></radialGradient>
<radialGradient id="glow-o" cx=".05" cy="1" r=".8"><stop offset="0" stop-color="#F0A06F" stop-opacity=".13"/><stop offset="1" stop-color="#F0A06F" stop-opacity="0"/></radialGradient>
</defs>
${back}
<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})"><path fill="${o.ink}"${stroke} d="${D}"/></g>
</svg>`;
}

const png = (option, size, bleed, nudge = 0) =>
  sharp(Buffer.from(svg(option, size, bleed, nudge)), { density: 72 * Math.max(1, (size * 4) / 512) })
    .resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();

/** An .ico is a small directory in front of ordinary PNGs. 48 first: it is the one Google reads. */
function ico(images, sizes) {
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
  return Buffer.concat([head, ...entries, ...images]);
}

const [mode, arg] = process.argv.slice(2);
if (mode === 'preview') {
  const out = resolve(arg);
  mkdirSync(out, { recursive: true });
  for (const option of Object.keys(OPTIONS)) {
    for (const size of [16, 32, 48, 96]) writeFileSync(join(out, `${option}-${size}.png`), await png(option, size, false));
    for (const size of [180, 192, 512]) writeFileSync(join(out, `${option}-${size}.png`), await png(option, size, true));
    // the tab's own sizes drawn big, to judge the shape the small cut really has
    writeFileSync(join(out, `${option}-16-big.png`), await sharp(await png(option, 16, false)).resize(128, 128, { kernel: 'nearest' }).png().toBuffer());
    writeFileSync(join(out, `${option}-32-big.png`), await sharp(await png(option, 32, false)).resize(128, 128, { kernel: 'nearest' }).png().toBuffer());
  }
  // the home-screen pick as it ships, nudge and all
  for (const size of [180, 192]) writeFileSync(join(out, `night-${size}-nudged.png`), await png('night', size, true, NUDGE));
  console.log('preview icons in', out);
} else if (mode === 'ship') {
  const pub = join(root, 'site', 'public');
  for (const [name, option, size, bleed, nudge] of SHIP) {
    writeFileSync(join(pub, name), await png(option, size, bleed, nudge));
    console.log(name, option, size);
  }
  // No SVG favicon on purpose: a browser offered one draws it at every size, and the 16 and 32 px
  // cuts, with their thicker stroke, would never be used.
  writeFileSync(join(pub, 'favicon.ico'), ico(await Promise.all(ICO.sizes.map(s => png(ICO.option, s, false))), ICO.sizes));
  console.log('favicon.ico', ICO.option, ICO.sizes.join('/'));
} else {
  console.log('usage: node design/icon/render-w.mjs preview <out-dir> | ship');
}
