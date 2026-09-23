import { readFileSync, readdirSync } from 'node:fs';
const quiz = JSON.parse(readFileSync('quiz.json', 'utf8'));
const sheets = []; for (const f of readdirSync('people-test-1').filter(f => f.startsWith('players-'))) sheets.push(...JSON.parse(readFileSync('people-test-1/' + f, 'utf8')).people.map(p => p.answers));
const ids = quiz.statements.map(s => s.id);
const mu = Object.fromEntries(ids.map(id => [id, sheets.reduce((s, a) => s + (a[id] || 0), 0) / sheets.length]));
const nu = Object.fromEntries(ids.map(id => { const vs = Object.values(quiz.people).map(p => p.cells[id]?.v).filter(v => v); return [id, vs.reduce((s, v) => s + v, 0) / vs.length]; }));
console.log('player means:', ids.map(id => `${id} ${mu[id].toFixed(1)}`).join(', '));
function run(label, sim, shrink = 0.6) {
  const near = {}, far = {};
  for (const a of sheets) {
    const rows = Object.entries(quiz.people).map(([k, p]) => { const P = ids.filter(id => a[id] && p.cells[id]).map(id => [a[id], p.cells[id].v, id]); return { k, n: P.length, s: sim(P, shrink) }; }).filter(r => r.n >= 5).sort((x, y) => y.s - x.s);
    near[rows[0].k] = (near[rows[0].k] || 0) + 1; far[rows.at(-1).k] = (far[rows.at(-1).k] || 0) + 1;
  }
  const fmt = o => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`${label}: NEAR ${fmt(near)}\n      FAR ${fmt(far)}`);
}
for (const s of [0.5, 0.75, 1]) {
  run(`centre players x${s}`, (P) => P.reduce((t, [a, v, id]) => t + (a - s * mu[id]) * v, 0) / (P.length + 3));
  run(`centre both x${s}`, (P) => P.reduce((t, [a, v, id]) => t + (a - s * mu[id]) * (v - s * nu[id]), 0) / (P.length + 3));
}
