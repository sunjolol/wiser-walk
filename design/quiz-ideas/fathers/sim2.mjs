import { build, POOL, STATEMENTS } from './table.mjs';
const { cells } = build();
const ids = STATEMENTS.map(s => s[0]);
const people = {}; for (const k of Object.keys(POOL)) { people[k] = {}; for (const id of ids) if (cells[id]?.[k] && cells[id][k].v !== 0) people[k][id] = cells[id][k].v; }
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const METRICS = {
  dot: (pairs, K) => pairs.reduce((s, [a, v]) => s + a * v, 0) / (pairs.length + K),
  cos: (pairs, K) => { const d = pairs.reduce((s, [a, v]) => s + a * v, 0), A = Math.sqrt(pairs.reduce((s, [a]) => s + a * a, 0)), V = Math.sqrt(pairs.reduce((s, [, v]) => s + v * v, 0)); return A && V ? (d / (A * V)) * pairs.length / (pairs.length + K) : 0; },
  sign: (pairs, K) => pairs.reduce((s, [a, v]) => s + Math.sign(a * v) * (Math.abs(a) === 2 && Math.abs(v) === 2 ? 1.5 : 1), 0) / (pairs.length + K),
};
function run(metric, K, sheets) {
  const near = {}, far = {};
  for (const a of sheets) {
    const rows = Object.entries(people).map(([k, row]) => { const pairs = ids.filter(id => a[id] && row[id]).map(id => [a[id], row[id]]); return { k, n: pairs.length, s: METRICS[metric](pairs, K) }; }).filter(r => r.n >= 5).sort((x, y) => y.s - x.s);
    near[rows[0].k] = (near[rows[0].k] || 0) + 1; const f = rows[rows.length - 1]; far[f.k] = (far[f.k] || 0) + 1;
  }
  const fmt = o => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${(100 * n / sheets.length).toFixed(0)}`).join(' ');
  return `  near: ${fmt(near)}\n  far:  ${fmt(far)}`;
}
const LEAN = { learning: 1.2, surplus: 0, rich: 1, alone: 0, lie: 1.2, anger: 1, tears: 1.6, laugh: 1.7, mystery: 0, deeper: 0.2, tell: 0.3, all: -0.2, unheard: 0.8, effort: 0.3, war: 0.8, rulers: -0.2, places: 0.2, nature: 0.5, body: 1.3, pure: -0.8, dreams: 0.4, calling: 0.4, quiet: 0.4, office: 0.9, calm: 0.4 };
const modern = Array.from({ length: 8000 }, () => Object.fromEntries(ids.map(id => { const x = (LEAN[id] ?? 0) + (rnd() + rnd() + rnd() - 1.5) * 2.2; return [id, Math.max(-2, Math.min(2, Math.round(x)))]; })));
const uni = Array.from({ length: 8000 }, () => Object.fromEntries(ids.map(id => [id, Math.floor(rnd() * 5) - 2])));
for (const m of Object.keys(METRICS)) for (const K of [2, 4]) console.log(`\n== ${m} K=${K}\n uniform\n${run(m, K, uni)}\n modern\n${run(m, K, modern)}`);
