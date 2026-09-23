// Scores the simulated people in people-test-N/players-*.json and writes people-test-N/results.json: each person with
// the reveal they would see (kindred spirit and sparring partner, three lines each), for the judges.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { result } = createRequire(import.meta.url)('./score.js');
const dir = process.argv[2] || 'people-test-1';
const quiz = JSON.parse(readFileSync(new URL('./quiz.json', import.meta.url), 'utf8'));
const text = Object.fromEntries(quiz.statements.map(s => [s.id, s.text]));
const SCALE = { '-2': 'Strongly disagree', '-1': 'Disagree', 0: 'Not sure', 1: 'Agree', 2: 'Strongly agree' };
const line = (p, x) => `"${text[x.id]}" You: ${SCALE[x.a]}. ${p.name}: "${p.cells[x.id].quote}" (${p.cells[x.id].work})`;
const out = []; const near = {}, far = {};
for (const f of readdirSync(new URL(`./${dir}/`, import.meta.url)).filter(f => f.startsWith('players-'))) {
  for (const person of JSON.parse(readFileSync(new URL(`./${dir}/${f}`, import.meta.url), 'utf8')).people) {
    const r = result(quiz, person.answers);
    const K = r.kindred && quiz.people[r.kindred.key], S = r.sparring && quiz.people[r.sparring.key];
    if (r.kindred) near[r.kindred.key] = (near[r.kindred.key] || 0) + 1;
    if (r.sparring) far[r.sparring.key] = (far[r.sparring.key] || 0) + 1;
    out.push({
      id: person.id, seed: person.seed, desc: person.desc, notes: person.notes, overall: person.overall,
      kindred: K && { name: K.name, dates: K.dates, hook: K.hook, lines: r.kindred.agree.slice(0, 3).map(x => line(K, x)) },
      sparring: S && { name: S.name, dates: S.dates, hook: S.hook, lines: r.sparring.clash.slice(0, 3).map(x => line(S, x)) },
      alsoClose: r.ranked.slice(1, 3).map(x => quiz.people[x.key].name),
      order: r.ranked.map(x => x.key),
    });
  }
}
writeFileSync(new URL(`./${dir}/results.json`, import.meta.url), JSON.stringify({ near, far, people: out }, null, 1));
const fmt = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
console.log(`${out.length} people\nkindred: ${fmt(near)}\nsparring: ${fmt(far)}`);
