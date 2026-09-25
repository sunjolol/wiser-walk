/**
 * Move checked saint pages into the site: the whole procedure in design/saints-hub/README.md
 * ("How a saint moves"), done the same way every time.
 *
 *   node design/saints-hub/tools/promote.mjs <slug> [<slug> ...]
 *
 * For each slug, it refuses unless the page's quotations pass verify-quotes.mjs, then:
 *   1. copies design/saints-hub/pages/<slug>.json to site/src/data/saints/<slug>.json
 *   2. copies the pictures the page names (band, portrait, gallery, and a card crop under
 *      /img/saints/) from design/saints-hub/pages/img/ to site/public/img/saints/
 *   3. adds the slug to MOVED in site/src/lib/saints/moved.ts (if he is one of the 22)
 *   4. adds the two permanent redirects from /early-christian/<slug> to site/vercel.json
 *   5. adds his pictures' credits to site/public/img/CREDITS.md
 * It commits nothing and renders no share card: run `node design/og/render.mjs site saint-`
 * and `npm run test` in site/ afterwards.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const HUB = resolve(here, '..');
const SITE = resolve(HUB, '..', '..', 'site');
const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('usage: promote.mjs <slug> [<slug> ...]'); process.exit(2); }

const wec = JSON.parse(readFileSync(join(SITE, 'src/data/which-early-christian.json'), 'utf8'));
const wecSlugs = new Set(Object.values(wec.people).map(p => p.slug));

let moved = readFileSync(join(SITE, 'src/lib/saints/moved.ts'), 'utf8');
const vercel = JSON.parse(readFileSync(join(SITE, 'vercel.json'), 'utf8'));
let credits = readFileSync(join(SITE, 'public/img/CREDITS.md'), 'utf8');
const commonsFile = url => {
  try { return decodeURIComponent(new URL(url).pathname.split('/File:')[1] ?? '').replace(/_/g, ' '); } catch { return ''; }
};

let done = 0;
for (const slug of slugs) {
  const src = join(HUB, 'pages', slug + '.json');
  if (!existsSync(src)) { console.log(`SKIP ${slug}: no page`); continue; }
  try {
    execFileSync('node', [join(here, 'verify-quotes.mjs'), slug, src], { stdio: 'pipe' });
  } catch (e) {
    console.log(`SKIP ${slug}: quotations do not pass\n${String(e.stdout).trim()}`);
    continue;
  }
  const page = JSON.parse(readFileSync(src, 'utf8'));
  // pictures: the band, the portrait, the wide-screen gallery, and a card crop of its own where
  // the page has one (a person outside the quiz has no quiz portrait to borrow)
  const card = page.card?.img?.startsWith('/img/saints/')
    ? { ...(page.band?.picture ?? {}), src: page.card.img, credit: `${page.band?.picture?.credit ?? ''} Cropped for the hub's card.`.trim() }
    : null;
  const pics = [page.band?.picture, page.portrait, ...(page.gallery ?? []), card].filter(Boolean);
  let missing = false;
  for (const pic of pics) {
    const name = basename(pic.src);
    const from = join(HUB, 'pages/img', name);
    const to = join(SITE, 'public', pic.src);
    if (existsSync(from)) copyFileSync(from, to);
    else if (!existsSync(to)) { console.log(`SKIP ${slug}: picture ${pic.src} is not in pages/img/`); missing = true; }
  }
  if (missing) continue;
  copyFileSync(src, join(SITE, 'src/data/saints', slug + '.json'));
  // the move list and the redirects, for one of the 22
  if (wecSlugs.has(slug)) {
    const m = /export const MOVED: readonly string\[\] = \[([^\]]*)\];/.exec(moved);
    const list = m[1].split(',').map(s => s.trim()).filter(Boolean);
    if (!list.includes(`'${slug}'`)) {
      list.push(`'${slug}'`);
      moved = moved.replace(m[0], `export const MOVED: readonly string[] = [${list.join(', ')}];`);
    }
    for (const source of [`/early-christian/${slug}/`, `/early-christian/${slug}`]) {
      if (!vercel.redirects.some(r => r.source === source)) {
        vercel.redirects.push({ source, destination: `/saints/${slug}/`, permanent: true });
      }
    }
  }
  // credits
  for (const pic of pics) {
    const file = basename(pic.src);
    // A band often shares its file name with the quiz's portrait in early-christians/, which has
    // its own row elsewhere in the file: name the folder, as Macrina's row does, so the check and
    // the row are about this picture and no other.
    const label = `${file} (in \`saints/\`)`;
    if (credits.includes(`| ${label} |`) || credits.includes(`| ${file} (in \`saints/\`,`)) continue;
    const row = `| ${label} | ${pic.credit.replace(/\|/g, '/')} | \`${commonsFile(pic.page ?? '') || pic.page || ''}\` | ${pic.license} |`;
    credits = credits.replace(/(## Public domain and CC0: the Saints hub[\s\S]*?\n\| file \| picture \| Commons file \| licence \|\n\|---\|---\|---\|---\|\n(?:\|[^\n]*\n)*)/, `$1${row}\n`);
  }
  console.log(`moved ${slug}`);
  done++;
}

writeFileSync(join(SITE, 'src/lib/saints/moved.ts'), moved);
// Keep vercel.json compact: one line per redirect, as it was written by hand.
const json = JSON.stringify(vercel, null, 2)
  .replace(/\{\n\s+"source": ("[^"]*"),\n\s+"destination": ("[^"]*"),\n\s+"permanent": true\n\s+\}/g, '{ "source": $1, "destination": $2, "permanent": true }');
writeFileSync(join(SITE, 'vercel.json'), json + '\n');
writeFileSync(join(SITE, 'public/img/CREDITS.md'), credits);
console.log(`\n${done} of ${slugs.length} promoted. Next: node design/og/render.mjs site saint- ; cd site && npm run test`);
