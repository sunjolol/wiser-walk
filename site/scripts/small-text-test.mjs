/**
 * The small-text guard: nothing meant to be read goes below --fs-tag (.6rem).
 *
 * The owner set two sizes for small text on 2026-09-24 (kit.css, "SMALL TEXT COMES IN TWO
 * SIZES": labels --fs-label .7rem at --fw-label, tags --fs-tag .6rem), and said of it: "this is
 * the exact type of issue that becomes a massive pain to fix if you regress". This file fails the
 * build on a font size under .6rem anywhere in the site's own stylesheets and components, so a new
 * rule cannot quietly slip back under the floor. Runs with `npm run test` and before every build.
 *
 * It reads the SOURCE: every .css file under src/styles and every <style> block in src/**\/*.astro.
 * A size is read from `font-size:` and from the `font:` shorthand, in rem or px (16px to the rem);
 * a clamp() is judged by its smallest value, which is what a phone gets. Sizes in em are relative
 * to a control or a chip that has its own size, and are not judged here.
 *
 * The only rules allowed under the floor are text inside a drawing and two rules no page renders,
 * listed below with their reasons. The standalone games (src/games/*.html) are generated from
 * demos/<game>/game.src.html and carry their own copy of the same tokens.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const FLOOR = 0.6;

/** Allowed under the floor, by selector, each with its reason. */
const ALLOW = {
  '.leaf-m': 'the month on a calendar leaf, inside a drawing (his named exception)',
  '.mock-btns span': 'the answer buttons inside the drawing of a game screen on the game cards',
  '.mroom-eg .wheel-label b': 'axis names around the small example wheel on a /me/ card (an instrument drawing)',
  '.nx-eg .wheel-label b': 'the same mini-wheel labels in the stacked layout',
  '.temper-k': 'never renders at this size: .temper-b p, more specific, sets it (his ruling: leave it)',
  '.scard-tag': 'a dead rule: no markup renders it',
  '.scard-tab': 'a dead rule: no markup renders it'
};

const files = [];
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.css') || name.endsWith('.astro')) files.push(full);
  }
};
walk(join(ROOT, 'src'));

const toRem = v => {
  const m = /^(-?\d*\.?\d+)(rem|px)$/.exec(v.trim());
  return m ? (m[2] === 'px' ? Number(m[1]) / 16 : Number(m[1])) : null;
};
/** The smallest size a value can take: a plain length, or the smallest of a clamp()/min(). */
const smallest = value => {
  const lengths = [...value.matchAll(/-?\d*\.?\d+(?:rem|px)\b/g)].map(m => toRem(m[0])).filter(n => n !== null);
  if (!lengths.length) return null;
  if (/^\s*(clamp|min|max)\(/.test(value)) return /^\s*max\(/.test(value) ? Math.max(...lengths) : Math.min(...lengths);
  return lengths[0];
};

let failures = 0;
let checked = 0;
for (const file of files) {
  let css = readFileSync(file, 'utf8');
  if (file.endsWith('.astro')) {
    css = [...css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    if (!css) continue;
  }
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Rules, innermost: a selector and a block with no nested braces.
  for (const m of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const block = m[2];
    let size = null;
    const fs = /font-size\s*:\s*([^;]+)/.exec(block);
    if (fs) size = smallest(fs[1]);
    else {
      const f = /(?:^|;)\s*font\s*:\s*([^;]+)/.exec(block);
      if (f) {
        const sz = /(?:^|\s)((?:clamp|min|max)\([^)]*\)|-?\d*\.?\d+(?:rem|px))(?=\s*\/|\s)/.exec(f[1]);
        if (sz) size = smallest(sz[1]);
      }
    }
    if (size === null) continue;
    checked++;
    if (size >= FLOOR - 1e-9) continue;
    if (/^(from|to|\d+%)$/.test(selector)) continue; // keyframes
    if (Object.keys(ALLOW).some(a => selector === a || selector.endsWith(' ' + a) || selector.split(',').map(s => s.trim()).includes(a))) continue;
    failures++;
    console.log(`  FAIL ${relative(ROOT, file).split(sep).join('/')}: "${selector}" is ${size}rem, under the ${FLOOR}rem floor. ` +
      'Use var(--fs-tag) or var(--fs-label) (kit.css), or add it to ALLOW with a reason if it is text inside a drawing.');
  }
}
console.log(failures
  ? `\nsmall text: ${failures} rule(s) under the floor`
  : `small text: ${checked} sized rules checked, none under ${FLOOR}rem outside ${Object.keys(ALLOW).length} allowed drawings and dead rules`);
process.exit(failures ? 1 : 0);
