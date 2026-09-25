/**
 * The Saints hub's guard. Runs before every build (prebuild) and with `npm run test`, on the
 * source: the data files in src/data/saints/, the move list in src/lib/saints/moved.ts and the
 * redirects in vercel.json. Fails the build on anything that would publish a broken or unfair
 * page, or two pages for one person.
 *
 *   one person, one page    every early Christian with a full /saints/ page is on the move list,
 *                           everyone on the list has a file, and his old /early-christian/
 *                           address is a permanent redirect to the new one (with and without the
 *                           closing slash); /early-christian/ itself redirects to /saints/, which
 *                           replaced it, and no page is built there (the owner, 2026-09-25)
 *   no clashing addresses   no group slug the hub uses or plans (/saints/<group>/) equals a
 *                           person's slug
 *   the search listing      a title of 65 characters or fewer, a description of 50 to 160
 *                           ending with a full stop, a "Who was X?" answer of 40 to 60 words
 *                           (the owner's target; seo-test.mjs holds the built page to 30 to 70)
 *   the owner's rules       no § mark or "section" number shown; never "St" for anyone no church
 *                           counts a saint; a status short enough for its pill (50 characters:
 *                           Clement's first ran to 88, "WAY too long for a pill"); feast days in
 *                           calendar order in each column; the rich-text marks balanced; every
 *                           picture the page names is on disk, and none shown twice; every
 *                           "Did you know?" line has a source
 *
 * Quotations are checked word for word before a file is added, on the machine that fetched their
 * texts (design/saints-hub/tools/verify-quotes.mjs): those texts are gitignored, so that check
 * cannot run here.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const DATA = join(ROOT, 'src/data/saints');
const PUB = join(ROOT, 'public');

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);

const moved = [...readFileSync(join(ROOT, 'src/lib/saints/moved.ts'), 'utf8')
  .matchAll(/MOVED: readonly string\[\] = \[([^\]]*)\]/g)][0]?.[1]
  .split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) ?? [];
const wec = JSON.parse(readFileSync(join(ROOT, 'src/data/which-early-christian.json'), 'utf8'));
const wecSlugs = new Set(Object.values(wec.people).map(p => p.slug));
const files = existsSync(DATA) ? readdirSync(DATA).filter(f => f.endsWith('.json')) : [];
const pages = files.map(f => ({ f, p: JSON.parse(readFileSync(join(DATA, f), 'utf8')) }));

console.log('saints: one person, one page');
{
  let bad = 0;
  for (const { f, p } of pages) {
    if (f !== p.slug + '.json') { fail(`${f}: its slug is ${p.slug}`); bad++; }
    if (wecSlugs.has(p.slug) && !moved.includes(p.slug)) {
      fail(`${p.slug} has a full page but is not in lib/saints/moved.ts, so /early-christian/${p.slug}/ would still be built beside it`);
      bad++;
    }
  }
  for (const slug of moved) {
    if (!pages.some(({ p }) => p.slug === slug)) { fail(`${slug} is on the move list with no data file`); bad++; }
  }
  const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  for (const slug of moved) {
    for (const source of [`/early-christian/${slug}/`, `/early-christian/${slug}`]) {
      const r = (vercel.redirects ?? []).find(x => x.source === source);
      if (!r || r.destination !== `/saints/${slug}/` || r.permanent !== true) {
        fail(`vercel.json: no permanent redirect from ${source} to /saints/${slug}/`);
        bad++;
      }
    }
  }
  for (const source of ['/early-christian/', '/early-christian']) {
    const r = (vercel.redirects ?? []).find(x => x.source === source);
    if (!r || r.destination !== '/saints/' || r.permanent !== true) {
      fail(`vercel.json: no permanent redirect from ${source} to /saints/ (the hub replaced that list)`);
      bad++;
    }
  }
  if (existsSync(join(ROOT, 'src/pages/early-christian/index.astro'))) {
    fail('src/pages/early-christian/index.astro is back, but /early-christian/ redirects to /saints/');
    bad++;
  }
  if (!bad) ok(`${pages.length} full page(s), ${moved.length} moved from /early-christian/ with a 301 each; the old list sends on to /saints/`);
}

console.log('saints: no group address equals a person');
{
  /* The collections the hub has now, and the group pages the plan names (design/saints-hub/README.md). */
  const groups = ['fathers', 'desert', 'cappadocians', 'teachers', 'martyrs', 'women', 'bible', 'monks',
    'church-fathers', 'desert-fathers', 'cappadocian-fathers', 'great-teachers', 'apostolic-fathers', 'east-and-west', 'quiet', 'timeline'];
  const people = new Set([...wecSlugs, ...pages.map(({ p }) => p.slug)]);
  const clash = groups.filter(g => people.has(g));
  if (clash.length) fail('group slug(s) equal to a person: ' + clash.join(', '));
  else ok(`${groups.length} group slugs, none a person's`);
}

console.log('saints: each page');
{
  const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
  const plainText = s => String(s).replace(/\{(?:la|el)\|([^}]*)\}/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
  const strings = (node, out = []) => {
    if (typeof node === 'string') out.push(node);
    else if (Array.isArray(node)) node.forEach(n => strings(n, out));
    else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => { if (!['url', 'src', 'page', 'img'].includes(k)) strings(v, out); });
    return out;
  };
  for (const { p } of pages) {
    const at = p.slug;
    let bad = 0;
    const no = m => { fail(`${at}: ${m}`); bad++; };
    for (const k of ['slug', 'name', 'short', 'seo', 'person', 'band', 'card', 'filters', 'who', 'facts', 'saint', 'sources', 'published', 'modified']) {
      if (p[k] === undefined) no(`missing ${k}`);
    }
    if (bad) continue;
    if (p.seo.title.length > 65) no(`title is ${p.seo.title.length} characters (65 at most)`);
    const d = p.seo.description;
    if (d.length < 50 || d.length > 160 || !d.endsWith('.')) no(`description is ${d.length} characters or does not end with a full stop`);
    const n = words(p.who);
    if (n < 40 || n > 60) no(`"Who was ${p.short}?" is ${n} words (40 to 60)`);
    if (!p.person.sameAs?.some(u => u.startsWith('https://en.wikipedia.org/wiki/')) || !p.person.sameAs?.some(u => /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(u))) {
      no('sameAs needs his Wikipedia and Wikidata addresses');
    }
    const all = strings(p);
    if (all.some(s => /§/.test(s))) no('a § mark is shown to readers');
    for (const s of all) {
      const opens = (s.match(/\*\*/g) || []).length;
      if (opens % 2) no(`unbalanced ** in "${s.slice(0, 50)}…"`);
      if ((s.match(/\{(la|el)\|/g) || []).length !== (s.match(/\}/g) || []).length) no(`unbalanced {la|…} in "${s.slice(0, 50)}…"`);
    }
    if (p.status && p.status.length > 50) no(`the status "${p.status}" is ${p.status.length} characters: too long for its pill (50 at most)`);
    if (p.status) {
      /* "St" is never used for a Church Father no church counts a saint: not in his name, his
         title, his description, his band or his card. Other people's titles may say it. */
      const his = [p.name, p.short, p.seo.title, p.seo.description, p.band.lede, p.card.line, p.who].map(plainText);
      if (his.some(s => /\bSt\.? /.test(s) || /\bSaint /.test(s))) no('"St" used for a person not counted a saint');
    }
    for (const side of ['west', 'east']) {
      const list = p.feasts?.[side] ?? [];
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1], b = list[i];
        if (a.month * 100 + a.day > b.month * 100 + b.day) no(`${side} feast days are not in calendar order`);
      }
    }
    const pics = [p.band.picture.src, p.card.img, p.portrait?.src, ...(p.gallery ?? []).map(g => g.src)].filter(Boolean);
    for (const src of pics) if (!existsSync(join(PUB, src))) no(`picture not on disk: ${src}`);
    /* One picture once: the page never shows the same file twice (the band, the portrait and the
       wide-screen pictures under it). */
    const shown = [p.band.picture.src, p.portrait?.src, ...(p.gallery ?? []).map(g => g.src)].filter(Boolean);
    if (new Set(shown).size !== shown.length) no('the same picture is shown twice');
    for (const g of p.gallery ?? []) if (!g.caption || !g.alt || !g.license) no(`a gallery picture needs a caption, alt text and a licence: ${g.src}`);
    for (const t of p.tidbits ?? []) if (!t.cite?.text) no(`a "Did you know?" line has no source: "${String(t.text).slice(0, 50)}…"`);
    /* A number tile finishes its thought: a chip that says what is counted, and its lines. */
    for (const n of p.numbers ?? []) if (!n.chip || !n.n || !n.src || !(n.lines?.length >= 1)) no(`a number tile is missing its chip, number, lines or source: ${n.chip} ${n.n}`);
    if (!bad) ok(`${at}: listing, answer (${n} words), feast order, marks and pictures`);
  }
}

console.log(failures ? `\nsaints guard: ${failures} problem(s)` : '\nsaints guard: all checks passed');
process.exit(failures ? 1 : 0);
