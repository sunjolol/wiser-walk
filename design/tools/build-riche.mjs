/** Inlines the supplied graphics into the demo as data URIs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const G = resolve(here, '../graphics');
const tex = n => 'data:image/png;base64,' + readFileSync(resolve(G, n)).toString('base64');

let html = readFileSync(resolve(here, '../demos/riche-template.html'), 'utf8');
const map = {
  '{{SMOKEY}}': 'smokey-bg.png',
  '{{SMOKEY2}}': 'smokey-bg-2.png',
  '{{SMOKEY3}}': 'smokey-bg-3.png',
  '{{ABSTRACT}}': 'abstract-bg.png',
  '{{ABSTRACT2}}': 'abstract-bg-2.png',
  '{{FLOWER}}': 'flower-bg-1.png',
  '{{FLOWER2}}': 'flower-bg-2.png',
  '{{STARRY}}': 'dark-starry-bg.png'
};
for (const [token, file] of Object.entries(map)) html = html.split(token).join(tex(file));

const out = resolve(here, '../demos/wiser-walk-riche.html');
writeFileSync(out, html);
console.log(`${out}  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
