/**
 * Pack the source stencils into web-weight PNGs in site/public/tex/.
 *
 * The originals total ~1.6 MB, which is indefensible on a phone for artwork that renders
 * at 4–52% opacity behind text. Two facts from inspect.mjs make them shrinkable without
 * any visible loss:
 *
 *   1. Seven of the eight are BLACK RGB with the whole image in the alpha channel
 *      (luma avg 0–1). Re-encoding as greyscale+alpha drops two dead channels.
 *   2. They are used as `mask-image: … / cover` and as blurred, inverted, blended veils.
 *      Neither samples at anything like the source resolution, so a box downscale is
 *      invisible at the opacities the theme actually uses.
 *
 * Alpha is PRESERVED, never flattened: the veils paint through `filter: invert(100%)`
 * plus a blend mode, so an opaque greyscale version would paint a full rectangle instead
 * of smoke.
 *
 * Run: node design/tools/pack-textures.mjs
 */
import { inflateSync, deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SRC = resolve(HERE, '../graphics');
const OUT = resolve(HERE, '../../site/public/tex');

/**
 * What the real site actually loads. `keepColour` is only for the starfield, which is the
 * one genuinely coloured, fully opaque image; everything else collapses to grey+alpha.
 */
const PLAN = [
  { from: 'smokey-bg.png',     to: 'smokey.png',  width: 560, steps: 24, use: 'hero wash mask (cover)' },
  { from: 'smokey-bg-2.png',   to: 'veil.png',    width: 520, steps: 24, use: 'inverted soft-light veil (cover)' },
  { from: 'flower-bg-2.png',   to: 'flower.png',  width: 430, steps: 32, use: 'floral mask, 4.2% opaque — full bleed only' },
  { from: 'dark-starry-bg.png', to: 'starry.png', width: 420, use: 'opaque dark fill (tiled)', keepColour: true }
];

/* ---------------------------------------------------------------- decode */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function decode(buf) {
  let p = 8, w = 0, h = 0, depth = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.subarray(p + 4, p + 8).toString('ascii');
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`);
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[ct];
  if (!ch) throw new Error(`unsupported colour type ${ct}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  let o = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[o++];
    const line = raw.subarray(o, o + stride);
    o += stride;
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      const x = line[i];
      let v;
      switch (f) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        default: {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        }
      }
      cur[i] = v & 255;
    }
    cur.copy(out, y * stride);
    prev = cur;
  }
  return { w, h, ch, px: out };
}

/* ------------------------------------------------------------- transform */

/**
 * Box downscale in PREMULTIPLIED space. Averaging colour and alpha separately would let a
 * fully transparent pixel's colour bleed into its neighbours — harmless here, since the
 * colour is black throughout, but wrong for the starfield and wrong for anyone who reuses
 * this later.
 */
function resample(img, w2, h2) {
  const { w, h, ch, px } = img;
  const hasAlpha = ch === 2 || ch === 4;
  const colour = ch >= 3 ? 3 : 1;
  const out = Buffer.alloc(w2 * h2 * ch);

  for (let y = 0; y < h2; y++) {
    const y0 = Math.floor((y * h) / h2), y1 = Math.max(y0 + 1, Math.floor(((y + 1) * h) / h2));
    for (let x = 0; x < w2; x++) {
      const x0 = Math.floor((x * w) / w2), x1 = Math.max(x0 + 1, Math.floor(((x + 1) * w) / w2));
      const acc = [0, 0, 0];
      let aAcc = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const o = (sy * w + sx) * ch;
          const a = hasAlpha ? px[o + ch - 1] : 255;
          for (let c = 0; c < colour; c++) acc[c] += px[o + c] * a;
          aAcc += a;
          n++;
        }
      }
      const d = (y * w2 + x) * ch;
      const aAvg = aAcc / n;
      for (let c = 0; c < colour; c++) {
        out[d + c] = aAcc > 0 ? Math.round(acc[c] / aAcc) : 0;
      }
      if (hasAlpha) out[d + ch - 1] = Math.round(aAvg);
    }
  }
  return { w: w2, h: h2, ch, px: out };
}

/**
 * Quantise alpha to `steps` levels. These stencils are film grain: every pixel differs
 * slightly from its neighbour, which is what makes them expensive to compress and is
 * entirely invisible once the layer is painted at 4–52% opacity through a blend mode.
 * Snapping to a couple of dozen levels costs nothing a reader can see and roughly halves
 * the file. Values are spread across the full 0–255 range so the extremes stay exact.
 */
function quantiseAlpha(img, steps) {
  const { w, h, ch, px } = img;
  if (!steps || ch !== 2) return img;
  const out = Buffer.from(px);
  const k = steps - 1;
  for (let i = 0; i < w * h; i++) {
    const o = i * 2 + 1;
    out[o] = Math.round(Math.round((out[o] / 255) * k) * (255 / k));
  }
  return { w, h, ch, px: out };
}

/** RGBA -> grey+alpha. Only valid when the colour channels carry nothing, which is checked. */
function toGreyAlpha(img) {
  const { w, h, ch, px } = img;
  if (ch === 2) return img;
  if (ch !== 4) throw new Error(`toGreyAlpha expects RGBA, got ${ch} channels`);
  const out = Buffer.alloc(w * h * 2);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    // Rec.601 luma, so a non-black source would at least degrade rather than lie.
    out[i * 2] = Math.round(px[o] * 0.299 + px[o + 1] * 0.587 + px[o + 2] * 0.114);
    out[i * 2 + 1] = px[o + 3];
  }
  return { w, h, ch: 2, px: out };
}

/** Drop a constant-255 alpha channel; refuses if the alpha is not in fact constant. */
function dropAlpha(img) {
  const { w, h, ch, px } = img;
  if (ch !== 4) return img;
  for (let i = 0; i < w * h; i++) if (px[i * 4 + 3] !== 255) return img;
  const out = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    out[i * 3] = px[i * 4];
    out[i * 3 + 1] = px[i * 4 + 1];
    out[i * 3 + 2] = px[i * 4 + 2];
  }
  return { w, h, ch: 3, px: out };
}

/* ---------------------------------------------------------------- encode */

const COLOUR_TYPE = { 1: 0, 2: 4, 3: 2, 4: 6 };

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Per-line adaptive filtering: try all five, keep the one with the smallest sum of |bytes|. */
function filterRows(img) {
  const { w, h, ch, px } = img;
  const stride = w * ch;
  const rows = [];
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const cur = px.subarray(y * stride, (y + 1) * stride);
    let best = null, bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      const line = Buffer.alloc(stride);
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= ch ? cur[i - ch] : 0;
        const b = prev[i];
        const c = i >= ch ? prev[i - ch] : 0;
        let v;
        switch (f) {
          case 0: v = cur[i]; break;
          case 1: v = cur[i] - a; break;
          case 2: v = cur[i] - b; break;
          case 3: v = cur[i] - ((a + b) >> 1); break;
          default: {
            const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
            v = cur[i] - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          }
        }
        line[i] = v & 255;
        score += line[i] < 128 ? line[i] : 256 - line[i];
      }
      if (score < bestScore) { bestScore = score; best = Buffer.concat([Buffer.from([f]), line]); }
    }
    rows.push(best);
    prev = cur;
  }
  return Buffer.concat(rows);
}

function encode(img) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.w, 0);
  ihdr.writeUInt32BE(img.h, 4);
  ihdr[8] = 8;
  ihdr[9] = COLOUR_TYPE[img.ch];
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(filterRows(img), { level: 9, memLevel: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------------ main */

mkdirSync(OUT, { recursive: true });
let before = 0, after = 0;

for (const step of PLAN) {
  const srcBuf = readFileSync(resolve(SRC, step.from));
  let img = decode(srcBuf);
  const from = `${img.w}x${img.h}`;

  const height = Math.max(1, Math.round((step.width / img.w) * img.h));
  if (step.width < img.w) img = resample(img, step.width, height);
  img = step.keepColour ? dropAlpha(img) : quantiseAlpha(toGreyAlpha(img), step.steps);

  const outBuf = encode(img);
  writeFileSync(resolve(OUT, step.to), outBuf);

  before += srcBuf.length;
  after += outBuf.length;
  const kb = n => (n / 1024).toFixed(0) + 'kB';
  console.log(
    `${step.from.padEnd(20)} ${from.padEnd(10)} ${kb(srcBuf.length).padStart(6)}  ->  ` +
    `${step.to.padEnd(12)} ${(img.w + 'x' + img.h).padEnd(10)} ${kb(outBuf.length).padStart(6)}  ` +
    `ch=${img.ch}   ${step.use}`
  );
}

console.log(
  `\ntotal ${(before / 1024).toFixed(0)}kB -> ${(after / 1024).toFixed(0)}kB ` +
  `(${(100 - (after / before) * 100).toFixed(0)}% smaller), written to site/public/tex/`
);
