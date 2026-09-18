// Download every url/url2 in sources-prose.json into raw/, skipping files already present.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const rawDir = join(root, 'raw');
mkdirSync(rawDir, { recursive: true });

const sources = JSON.parse(readFileSync(join(root, 'sources-prose.json'), 'utf8'));

export function rawName(url) {
  const m = url.match(/pg(\d+)\.txt$/);
  return m ? `pg${m[1]}.txt` : url.split('/').pop();
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('fetch-prose.mjs')) {
  for (const s of sources) {
    for (const url of [s.url, s.url2].filter(Boolean)) {
      const dest = join(rawDir, rawName(url));
      if (existsSync(dest)) { console.log('skip', rawName(url)); continue; }
      process.stdout.write(`get ${url} ... `);
      const res = await fetch(url);
      if (!res.ok) { console.log('FAILED', res.status); continue; }
      const text = await res.text();
      writeFileSync(dest, text, 'utf8');
      console.log(`${text.length} chars -> ${rawName(url)}`);
    }
  }
}
