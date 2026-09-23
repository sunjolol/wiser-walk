// Builds the tap-through preview of quiz #4: quiz.json + people.json + score.js + app.js + the portraits, one page.
// node design/quiz-ideas/fathers/preview/build.mjs  -> early-christian.html beside this file (gitignored).
// The site's share standard is mirrored in app.js (a 1080x1350 card, a result link, Save / Share / Copy link).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(resolve(here, ...p), 'utf8');
const quiz = JSON.parse(read('../quiz.json'));
const meta = JSON.parse(read('../people.json'));
const credits = JSON.parse(read('img/credits.json'));
const scorer = read('../score.js').replace(/if \(typeof module[^\n]*\n?/, '');
const style = read('../../psalm/preview/style.part').replace('</style>', read('extra.css') + '</style>');

// The example result: the retired Methodist teacher from people-test-1 (P6), whom the judges scored 5 of 5.
const players = readdirSync(resolve(here, '../people-test-1')).filter(f => f.startsWith('players-'))
  .flatMap(f => JSON.parse(read('../people-test-1', f)).people);
const example = players.find(p => p.id === 'P6').answers;

const people = {};
for (const [k, p] of Object.entries(quiz.people)) {
  const m = meta.people[k];
  if (!m) throw new Error(`no meta for ${k}`);
  const c = credits[k];
  people[k] = { ...m, cells: p.cells, img: `data:image/jpeg;base64,${readFileSync(resolve(here, 'small', `${k}.jpg`)).toString('base64')}`,
    credit: `${c.title || c.file.replace(/^File:/, '')}${c.artist ? `, ${c.artist}` : ''}. Wikimedia Commons, ${c.license}.` };
}
const DATA = { statements: quiz.statements, centre: quiz.centre, people, pairs: meta.pairs, topics: meta.topics, example,
  wordmark: read('wordmark.b64').trim() };

const html = `<title>Which Early Christian Thinks Like You?</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Poppins:wght@500;600;700&display=swap">
${style}
<p class="preview-note">Preview of quiz #4 for review, not the live site. Draft 4.</p>
<main class="sheet" id="app" aria-live="polite"></main>
<script>
${scorer}
var D = ${JSON.stringify(DATA)};
${read('app.js')}
</script>`;

const out = resolve(here, 'early-christian.html');
writeFileSync(out, html);
console.log(out, Math.round(html.length / 1024) + ' KB');
