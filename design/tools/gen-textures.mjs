/**
 * Procedural raster texture generator — writes real PNG files, no dependencies.
 *
 * Produces the kind of graphics the reference skins hotlink from image hosts:
 * fluid paint-pour marble, grunge paper, halftone and speckle. Generated rather than
 * borrowed, so they are ours outright and nothing depends on an external host.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'textures');
mkdirSync(OUT, { recursive: true });

/* ----------------------------------------------------------- PNG encoding */
const CRC = (() => {
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
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
/** rgba: Uint8Array of w*h*4 */
function writePNG(path, w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  writeFileSync(path, png);
  return png.length;
}

/* ------------------------------------------------------------------ noise */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Value noise on a hashed lattice with smoothstep interpolation. */
function makeNoise(seed) {
  const P = new Float32Array(256 * 256);
  const r = mulberry(seed);
  for (let i = 0; i < P.length; i++) P[i] = r();
  const at = (x, y) => P[((y & 255) << 8) | (x & 255)];
  const fade = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = fade(xf), v = fade(yf);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };
}
function fbm(noise, x, y, oct = 5, lac = 2.03, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let i = 0; i < oct; i++) {
    sum += amp * noise(x * f, y * f);
    norm += amp;
    amp *= gain;
    f *= lac;
  }
  return sum / norm;
}

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/** Sample a colour ramp of [stop, "#hex"] pairs. */
function ramp(stops, t) {
  t = clamp(t);
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i], [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const k = (t - p0) / (p1 - p0 || 1);
      const a = hex(c0), b = hex(c1);
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
  }
  return hex(stops[stops.length - 1][1]);
}

/* ------------------------------------------------- 1. fluid paint-pour marble */
/**
 * Domain-warped FBM run through a painterly ramp, with a second high-frequency pass
 * carved in as the fine veining that makes a pour read as liquid rather than as fog.
 */
function marble(name, w, h, stops, seed, opts = {}) {
  // FBM clusters hard around 0.5, so raw output samples only the middle of the ramp and
  // reads as flat wash. `contrast` spreads it, `gamma` (>1) weights it toward the dark end
  // so the pour is mostly ink with bright ribbons through it, not uniform mid-tone.
  const {
    scale = 3.2, warp = 2.6, veinStrength = 0.55, grain = 10,
    contrast = 3.1, gamma = 2.1, veinWidth = 9
  } = opts;
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 977), n3 = makeNoise(seed + 5501);
  const px = new Uint8Array(w * h * 4);
  const g = mulberry(seed + 31);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w) * scale, v = (y / h) * scale;
      // two-stage domain warp — the thing that turns noise into flow
      const qx = fbm(n1, u, v, 5), qy = fbm(n2, u + 3.4, v + 1.7, 5);
      const rx = fbm(n1, u + warp * qx + 1.2, v + warp * qy + 4.6, 5);
      const ry = fbm(n2, u + warp * qx + 7.3, v + warp * qy + 2.1, 5);
      let t = fbm(n3, u + warp * rx, v + warp * ry, 6);
      // spread the clustered midrange, then bias dark
      t = clamp((t - 0.5) * contrast + 0.5);
      t = Math.pow(t, gamma);
      // veining: ridged noise carved along the flow, kept narrow so it reads as a ribbon
      const ridge = 1 - Math.abs(fbm(n1, u * 4 + rx * 6, v * 4 + ry * 6, 4) * 2 - 1);
      t = clamp(t + Math.pow(ridge, veinWidth) * veinStrength);
      let [r, gg, b] = ramp(stops, t);
      const n = (g() - 0.5) * grain;
      const i = (y * w + x) * 4;
      px[i] = clamp(r + n, 0, 255);
      px[i + 1] = clamp(gg + n, 0, 255);
      px[i + 2] = clamp(b + n, 0, 255);
      px[i + 3] = 255;
    }
  }
  const bytes = writePNG(resolve(OUT, name), w, h, px);
  console.log(`  ${name.padEnd(26)} ${w}x${h}  ${(bytes / 1024).toFixed(0)} KB`);
}

/* ------------------------------------------------------- 2. grunge paper tile */
function paper(name, size, base, seed, opts = {}) {
  const { fibre = 0.55, blotch = 0.35, speck = 0.02 } = opts;
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 404);
  const px = new Uint8Array(size * size * 4);
  const g = mulberry(seed + 7);
  const [br, bg, bb] = hex(base);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      // long fibres: heavily anisotropic noise
      const f = fbm(n1, u * 3, v * 90, 3) - 0.5;
      const b = fbm(n2, u * 5, v * 5, 5) - 0.5;
      let d = f * fibre * 46 + b * blotch * 54 + (g() - 0.5) * 16;
      if (g() < speck) d -= 40 * g();
      const i = (y * size + x) * 4;
      px[i] = clamp(br + d, 0, 255);
      px[i + 1] = clamp(bg + d, 0, 255);
      px[i + 2] = clamp(bb + d, 0, 255);
      px[i + 3] = 255;
    }
  }
  const bytes = writePNG(resolve(OUT, name), size, size, px);
  console.log(`  ${name.padEnd(26)} ${size}x${size}  ${(bytes / 1024).toFixed(0)} KB`);
}

/* -------------------------------------------------------- 3. halftone (alpha) */
function halftone(name, size, dot, spacing, colour, seed) {
  const px = new Uint8Array(size * size * 4);
  const [r, g, b] = hex(colour);
  const rnd = mulberry(seed);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 45-degree screen, the way a real halftone is angled
      const ax = (x + y) / Math.SQRT2, ay = (y - x) / Math.SQRT2;
      const cx = Math.round(ax / spacing) * spacing, cy = Math.round(ay / spacing) * spacing;
      const d = Math.hypot(ax - cx, ay - cy);
      const jitter = 1 + (rnd() - 0.5) * 0.18;
      const a = clamp((dot * jitter - d) / 0.9) * 255;
      const i = (y * size + x) * 4;
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
    }
  }
  const bytes = writePNG(resolve(OUT, name), size, size, px);
  console.log(`  ${name.padEnd(26)} ${size}x${size}  ${(bytes / 1024).toFixed(0)} KB`);
}

/* ------------------------------------------------------------ 4. speckle/dust */
function dust(name, size, colour, density, seed) {
  const px = new Uint8Array(size * size * 4);
  const [r, g, b] = hex(colour);
  const rnd = mulberry(seed);
  const n = makeNoise(seed + 88);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cluster = fbm(n, (x / size) * 6, (y / size) * 6, 4);
      const p = density * (0.25 + cluster * 1.6);
      const on = rnd() < p;
      const i = (y * size + x) * 4;
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
      px[i + 3] = on ? 90 + rnd() * 165 : 0;
    }
  }
  const bytes = writePNG(resolve(OUT, name), size, size, px);
  console.log(`  ${name.padEnd(26)} ${size}x${size}  ${(bytes / 1024).toFixed(0)} KB`);
}

/* =========================================================== generate =========== */
console.log('marble / paint pour:');
// Astoria's palette: deep plum, magenta, ink navy, bone
marble('marble-vigil.png', 1000, 620, [
  [0.00, '#0B0A12'], [0.16, '#1B1430'], [0.34, '#4A1E52'],
  [0.50, '#8E2F63'], [0.63, '#C74A78'], [0.74, '#E79AB2'],
  [0.86, '#EFE4E8'], [1.00, '#FBF7F8']
], 20260903, { scale: 3.0, warp: 2.8, veinStrength: 0.40, contrast: 2.7, gamma: 2.9 });

// Rose Water's palette: coral, rose, cream — his favourite
marble('marble-rose.png', 1000, 620, [
  [0.00, '#6E1230'], [0.18, '#A81F45'], [0.36, '#D93A5E'],
  [0.54, '#F2685F'], [0.70, '#F79C8E'], [0.84, '#F7D2C4'],
  [1.00, '#FDF1E9']
], 77123, { scale: 2.6, warp: 3.0, veinStrength: 0.38, contrast: 2.6, gamma: 2.6 });

// A calmer sage/ochre pour, for article headers where a hot pour would shout
marble('marble-sage.png', 1000, 620, [
  [0.00, '#1C2118'], [0.20, '#33402A'], [0.40, '#5C7040'],
  [0.58, '#8FA061'], [0.74, '#C2B57A'], [0.88, '#E6DCC0'], [1.00, '#F7F2E4']
], 4242, { scale: 2.8, warp: 2.4, veinStrength: 0.34, contrast: 2.5, gamma: 2.7 });

console.log('paper / grunge tiles:');
paper('paper-warm.png', 512, '#EDE6D6', 991, { fibre: 0.5, blotch: 0.4 });
paper('paper-dark.png', 512, '#1E1B21', 313, { fibre: 0.7, blotch: 0.5, speck: 0.006 });

console.log('overlays:');
halftone('halftone-rose.png', 256, 1.9, 7, '#C2385F', 5150);
dust('dust-bone.png', 400, '#F4EDE4', 0.02, 8080);

console.log(`\nwritten to ${OUT}`);
