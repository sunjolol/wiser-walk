// Builds the tap-through preview of the Personality Quiz as one self-contained page.
// python preview/faces.py (pictures), then: node design/quiz-ideas/personality/preview/build.mjs
// -> personality.html beside this file. The quiz modules are bundled with the site's esbuild.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..', '..');
const require = createRequire(resolve(root, 'site', 'package.json'));
const esbuild = require('esbuild');

// 1. Bundle items + results + score into one global, PQ.
const entry = `import * as items from '../items.mjs'; import * as results from '../results.mjs'; import { score } from '../score.mjs';
window.PQ = { items, results, score };`;
const bundle = await esbuild.build({ stdin: { contents: entry, resolveDir: here, loader: 'js' }, bundle: true, format: 'iife', write: false, minify: true, target: 'es2019' });
const pq = bundle.outputFiles[0].text;

// 2. Pictures as data URIs.
const IMG = {};
for (const dir of ['faces', 'arts', 'lines']) {
  const d = resolve(here, dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (f.endsWith('.jpg')) IMG[f.replace(/\.jpg$/, '')] = 'data:image/jpeg;base64,' + readFileSync(resolve(d, f)).toString('base64');
}

// The owner's logo: the brush W (colour, and his white version for use over pictures) and the wordmark, whose ink is
// currentColor so it is used as a mask (as the site's header does) and tinted on a canvas by rewriting the colour.
const site = (p) => resolve(root, 'site', 'public', p);
const b64 = (p, type) => `data:${type};base64,` + readFileSync(p).toString('base64');
const LOGO = {
  w: b64(site('img/logo-w-large.png'), 'image/png'),
  wWhite: b64(resolve(root, 'design', 'graphics', 'logo-larger-white.png'), 'image/png'),
  word: readFileSync(site('img/wordmark.svg'), 'utf8'),
};
const TEX = { light: b64(site('tex/starry.png'), 'image/png'), dark: b64(site('tex/starry-dark.png'), 'image/png') };

// 3. Credits: the paintings and new portraits from img/credits.json, the rest from the site's own credits.
let credits = 'Pictures: public-domain works via Wikimedia Commons.';
const cj = resolve(here, 'img', 'credits.json');
if (existsSync(cj)) {
  const c = JSON.parse(readFileSync(cj, 'utf8'));
  const list = Object.entries(c).filter(([, v]) => v && typeof v === 'object' && v.title)
    .map(([, v]) => `${v.title}${v.artist ? ', ' + v.artist : ''}${v.date ? ' (' + v.date + ')' : ''}`);
  credits = 'Paintings and portraits: ' + list.join('; ') + '; and the site’s early-Christian portraits and Doré engravings. All public domain, via Wikimedia Commons.';
}

// 4. The example: one of the simulated people (the rideshare driver who sends money home, p12).
const sim = JSON.parse(readFileSync(resolve(here, '..', 'sim', 'answers-3.json'), 'utf8'));
const EXAMPLE = sim.results.find((r) => r.id === 'p12').answers;

const html = `<meta charset="utf-8">
<title>Personality Quiz Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@500;600;700&display=swap">
<style>:root { --starry: url("${TEX.light}"); --wordmark: url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO.word)}"); }
:root[data-theme="dark"] { --starry: url("${TEX.dark}"); }</style>
<style>${readFileSync(resolve(here, 'style.css'), 'utf8')}</style>
<p class="preview-note">Preview of the Personality Quiz for review, not the live site. Draft 3. <button id="themebtn" class="theme-btn" type="button">Dark theme</button></p>
<main class="app" id="app" aria-live="polite"></main>
<script>${pq}</script>
<script>var IMG = ${JSON.stringify(IMG)}; var LOGO = ${JSON.stringify(LOGO)}; var EXAMPLE = ${JSON.stringify(EXAMPLE)}; var CREDITS = ${JSON.stringify(credits)};</script>
<script>${readFileSync(resolve(here, 'app.js'), 'utf8')}</script>`;
const out = resolve(here, 'personality.html');
writeFileSync(out, html);
console.log(out, Math.round(html.length / 1024) + ' KB', Object.keys(IMG).length + ' pictures');
