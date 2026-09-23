// Spread test: who comes out nearest and farthest over many answer sheets.
import { createRequire } from 'node:module';
import { build, POOL, STATEMENTS } from './table.mjs';
const { result } = createRequire(import.meta.url)('./score.js');
const { cells } = build();
const table = { ids: STATEMENTS.map(s => s[0]), people: {} };
for (const k of Object.keys(POOL)) { table.people[k] = {}; for (const [id] of STATEMENTS) if (cells[id]?.[k]) table.people[k][id] = cells[id][k].v; }
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
function tally(sheets, label) {
  const near = {}, far = {}; let none = 0;
  for (const a of sheets) { const r = result(table, a); if (!r.kindred) { none++; continue; } near[r.kindred.key] = (near[r.kindred.key] || 0) + 1; if (r.sparring) far[r.sparring.key] = (far[r.sparring.key] || 0) + 1; }
  const fmt = o => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${(100 * n / sheets.length).toFixed(0)}%`).join(', ');
  console.log(`\n${label} (${sheets.length} sheets, ${none} unnamed)\n  NEAREST: ${fmt(near)}\n  FARTHEST: ${fmt(far)}`);
}
// 1. uniform random answers
const ids = table.ids;
tally(Array.from({ length: 20000 }, () => Object.fromEntries(ids.map(id => [id, Math.floor(rnd() * 5) - 2]))), 'uniform random');
// 2. "modern" sheets: each statement drawn around an assumed modern lean (+ = most people agree), with a personal tilt
const LEAN = { learning: 1.2, surplus: 0, rich: 1, alone: 0, lie: 1.2, anger: 1, tears: 1.6, laugh: 1.7, mystery: 0, deeper: 0.2, tell: 0.3, all: -0.2, unheard: 0.8, effort: 0.3, war: 0.8, rulers: -0.2, places: 0.2, nature: 0.5, body: 1.3, pure: -0.8, dreams: 0.4, calling: 0.4, quiet: 0.4, office: 0.9, calm: 0.4 };
tally(Array.from({ length: 20000 }, () => Object.fromEntries(ids.map(id => { const x = (LEAN[id] ?? 0) + (rnd() + rnd() + rnd() - 1.5) * 2.2; return [id, Math.max(-2, Math.min(2, Math.round(x)))]; }))), 'modern-leaning');
export { table };
