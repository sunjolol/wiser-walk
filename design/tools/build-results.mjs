/** Builds the results page: inlines the graphics and the real audited axis content. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const G = resolve(here, '../graphics');
const DATA = resolve(here, '../../site/src/data/compass.json');

const tex = n => 'data:image/png;base64,' + readFileSync(resolve(G, n)).toString('base64');

// Real audited content — summaries, dated history and key passages per axis.
const compass = JSON.parse(readFileSync(DATA, 'utf8'));
const COLOURS = {
  grace: '#2F4FCB', table: '#9E2A3B', spirit: '#E2582B',
  kingdom: '#2E7D4F', tradition: '#C98A12', worship: '#6A4BC0'
};
const axes = compass.axes.map(a => ({
  key: a.key, name: a.name, slug: a.slug, left: a.left, right: a.right,
  colour: COLOURS[a.key] || '#2F4FCB',
  bands: a.bands,
  summary: a.summary,
  history: a.history || [],
  passages: a.passages || [],
  readMore: a.readMore || []
}));
const traditions = compass.traditions.map(t => ({ name: t.name, slug: t.slug, position: t.position }));

let html = readFileSync(resolve(here, '../demos/results-template.html'), 'utf8');
const map = {
  '{{SMOKEY}}': 'smokey-bg.png',
  '{{SMOKEY2}}': 'smokey-bg-2.png',
  '{{SMOKEY3}}': 'smokey-bg-3.png',
  '{{FLOWER2}}': 'flower-bg-2.png',
  '{{STARRY}}': 'dark-starry-bg.png'
};
for (const [token, file] of Object.entries(map)) html = html.split(token).join(tex(file));
html = html.replace('/*{{AXES}}*/', JSON.stringify(axes));
html = html.replace('/*{{TRADITIONS}}*/', JSON.stringify(traditions));
html = html.replace('/*{{SCORING}}*/', JSON.stringify(compass.scoring));

const out = resolve(here, '../demos/wiser-walk-results.html');
writeFileSync(out, html);
console.log(`${out}  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
console.log(`axes: ${axes.length}, traditions: ${traditions.length}, history entries: ${axes.reduce((n, a) => n + a.history.length, 0)}`);
