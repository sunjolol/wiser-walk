import { readFileSync, readdirSync } from 'node:fs';
const quiz = JSON.parse(readFileSync('quiz.json', 'utf8'));
const sheets = []; for (const f of readdirSync('people-test-1').filter(f => f.startsWith('players-'))) sheets.push(...JSON.parse(readFileSync('people-test-1/' + f, 'utf8')).people.map(p => p.answers));
const ids = quiz.statements.map(s => s.id);
const M = {
  dot3: (P, K = 3) => P.reduce((s, [a, v]) => s + a * v, 0) / (P.length + K),
  cos3: (P, K = 3) => { const d = P.reduce((s, [a, v]) => s + a * v, 0), A = Math.hypot(...P.map(p => p[0])), V = Math.hypot(...P.map(p => p[1])); return A && V ? d / (A * V) * P.length / (P.length + K) : 0; },
  cos6: (P) => M.cos3(P, 6),
  msd: (P, K = 3) => -(P.reduce((s, [a, v]) => s + (a - v) ** 2, 0) + K * 6) / (P.length + K),
  sgn: (P, K = 3) => P.reduce((s, [a, v]) => s + Math.sign(a * v), 0) / (P.length + K),
  vnorm: (P, K = 3) => { const d = P.reduce((s, [a, v]) => s + a * Math.sign(v), 0); return d / (P.length + K); },
};
for (const [m, f] of Object.entries(M)) {
  const near = {}, far = {};
  for (const a of sheets) {
    const rows = Object.entries(quiz.people).map(([k, p]) => { const P = ids.filter(id => a[id] && p.cells[id]).map(id => [a[id], p.cells[id].v]); return { k, n: P.length, s: f(P) }; }).filter(r => r.n >= 5).sort((x, y) => y.s - x.s);
    near[rows[0].k] = (near[rows[0].k] || 0) + 1; far[rows.at(-1).k] = (far[rows.at(-1).k] || 0) + 1;
  }
  const fmt = o => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`${m}: NEAR ${fmt(near)}\n      FAR ${fmt(far)}`);
}
