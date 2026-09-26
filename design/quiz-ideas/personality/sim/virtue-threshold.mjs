// How often does "Your best quality" name nothing, and how far short do those people fall?
// Runs the real scorer over the simulated answer sheets and over random honest-looking sheets.
// node design/quiz-ideas/personality/sim/virtue-threshold.mjs
import { readFileSync } from 'node:fs';
import { score, derive } from '../score.mjs';
import { ITEMS } from '../items.mjs';
import { VIRTUES } from '../results.mjs';

const here = new URL('.', import.meta.url);
const sheets = [];
for (const f of ['answers-2.json', 'answers-3.json']) {
  try {
    const d = JSON.parse(readFileSync(new URL(f, here), 'utf8'));
    for (const r of d.results ?? []) sheets.push({ id: `${f}:${r.id}`, answers: r.answers });
  } catch {}
}
// Random sheets: each answer drawn from -3..3, with a per-person tilt so people differ.
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const template = sheets[0].answers;
for (let n = 0; n < 2000; n++) {
  const a = {};
  for (const [id, v] of Object.entries(template)) a[id] = Array.isArray(v) ? [] : Math.max(-3, Math.min(3, Math.round((rnd() * 6 - 3) * 0.9)));
  sheets.push({ id: `random:${n}`, answers: a, random: true });
}

const report = (label, list) => {
  const rows = list.map(s => {
    const r = score(s.answers);
    const S = r.scales ?? r.S ?? derive(s.answers).S ?? derive(s.answers);
    // best eligible lean: the strongest scale whose leaning side has a named quality
    let best = 0, bestKey = null;
    for (const [k, v] of Object.entries(S)) {
      if (typeof v !== 'number') continue;
      const key = k + ':' + (v < 0 ? 'left' : 'right');
      if (VIRTUES[key] && Math.abs(v) > best) { best = Math.abs(v); bestKey = key; }
    }
    return { none: !r.virtue, best, bestKey, anger: r.anger?.cell };
  });
  const none = rows.filter(r => r.none);
  const pct = x => (100 * x / rows.length).toFixed(1) + '%';
  const near = t => none.filter(r => r.best >= t).length;
  console.log(`${label}: ${rows.length} sheets; no quality named for ${none.length} (${pct(none.length)})`);
  console.log(`  of those, strongest named-quality lean >= .30: ${near(0.30)}, >= .25: ${near(0.25)}, >= .20: ${near(0.20)}`);
  const brief = rows.filter(r => r.anger === 'brief');
  console.log(`  "Slow and brief" anger: ${brief.length}, with no quality named: ${brief.filter(r => r.none).length}`);
  return rows;
};
report('simulated people', sheets.filter(s => !s.random));
report('random sheets', sheets.filter(s => s.random));
