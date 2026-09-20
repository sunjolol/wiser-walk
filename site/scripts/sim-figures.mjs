/**
 * Calibration simulator for "Who in the Bible are you most like?".
 *
 * WHY THIS EXISTS. The figure quiz matches a reader to a person by distance, and the
 * thresholds it started with (tie 10, hedge 45, centre 10) were the Theology Compass's,
 * copied across untested onto a roster with different geometry. Measured over simulated
 * sheets, Mary of Nazareth came out closest for about a fifth of readers and Jesus for a
 * seventh, and half of all sheets landed in the "tie" state. A quiz cannot be calibrated
 * by reading it; it has to be run.
 *
 * WHAT IT MEASURES. Two generators, both deterministic:
 *   uniform     every answer equally likely. The shape of the space itself.
 *   realistic   skewed toward mild agreement (-2..2 at .12/.25/.18/.30/.15), which is how
 *               people actually answer agree-disagree instruments. THIS is the generator
 *               the targets are set on; the uniform one is the control.
 *
 * WHAT IT PRINTS. The share of sheets for which each figure comes out closest, the mix of
 * result states, the closest pair of figures on the roster, and how many axes each figure
 * is actually matched on. Then the targets, with a pass or fail against each.
 *
 * THE TARGETS (realistic generator):
 *   no figure closest for more than 9% of sheets   — no one result swallows the quiz
 *   every figure closest for at least 1.5%         — no figure is unreachable
 *   "tie" under 15%, "central" under 6%            — the hedges are for edge cases
 *
 * Only the state mix is a function of the config. WHO is closest is a function of the
 * ROSTER and the EVIDENCE MASK, and the only honest way to move it is to open the text.
 * Never move a coordinate to hit a number in this report.
 *
 *   node scripts/sim-figures.mjs [sheets-per-generator] [quiz-slug]
 */
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(ROOT, 'node_modules/.sim-figures.mjs');

const N = Math.max(1000, Number(process.argv[2]) || 10000);
const SLUG = process.argv[3] || 'bible-figure';

await build({
  entryPoints: [resolve(ROOT, 'src/lib/engine/registry.ts')],
  outfile: OUT,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  logLevel: 'silent'
});

const engine = await import(pathToFileURL(OUT).href);
const { getQuiz, scoreQuiz, resultFor } = engine;

const quiz = getQuiz(SLUG);
if (!quiz) {
  console.log(`no quiz "${SLUG}"`);
  process.exit(1);
}

/** Deterministic: the same numbers on every run, so a change in them is a change in the data. */
let seed = 20260921;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

const UNIFORM = [0.2, 0.2, 0.2, 0.2, 0.2];
/** How people answer agree-disagree items: mild agreement is the commonest response. */
const REALISTIC = [0.12, 0.25, 0.18, 0.3, 0.15];

function pick(weights) {
  let r = rnd();
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i - 2;
  }
  return 2;
}

const pct = (n, d) => ((n / d) * 100).toFixed(1).padStart(5) + '%';

function run(label, weights) {
  const closest = new Map(quiz.outcomes.map(o => [o.name, 0]));
  const states = new Map();
  let secondGap = 0;

  /*
   * Sheets on which a figure is actually put in front of the reader. A `central` sheet
   * names nobody — the reader sat in the no-position band on every axis, there is nothing
   * to measure anyone against, and the page says so — so counting its ranking would be
   * counting an order the reader is never shown as if it were a result.
   */
  let named = 0;
  for (let n = 0; n < N; n++) {
    const sheet = quiz.items.map(() => pick(weights));
    const view = resultFor(quiz, scoreQuiz(quiz, sheet));
    states.set(view.state, (states.get(view.state) ?? 0) + 1);
    if (view.state === 'central') continue;
    const top = view.ranked[0];
    if (top) { closest.set(top.name, (closest.get(top.name) ?? 0) + 1); named++; }
    if (view.ranked[1]) secondGap++;
  }

  const rows = [...closest.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n== ${label} (${N.toLocaleString()} sheets, ${named.toLocaleString()} naming a figure) ==`);
  console.log('   closest figure');
  rows.forEach(([name, n], i) => {
    const bar = '#'.repeat(Math.round((n / named) * 200));
    console.log(`   ${String(i + 1).padStart(2)}. ${name.padEnd(18)} ${pct(n, named)}  ${bar}`);
  });
  const order = ['near', 'tie', 'loose', 'central'];
  console.log('   states: ' +
    order.filter(s => states.has(s)).map(s => `${s} ${pct(states.get(s), N).trim()}`).join('   '));

  return {
    label,
    named,
    max: rows[0],
    min: rows[rows.length - 1],
    zero: rows.filter(r => r[1] === 0).map(r => r[0]),
    states: Object.fromEntries(order.map(s => [s, (states.get(s) ?? 0) / N]))
  };
}

// ---------------------------------------------------------------- the roster itself
console.log(`${quiz.title}`);
console.log(`${quiz.outcomes.length} outcomes, ${quiz.groups.length} axes, ` +
  `config tie ${quiz.config.tieUnits} / hedge ${quiz.config.hedgeUnits} / centre ${quiz.config.centerUnits}`);

const maskOf = o => o.mask ?? quiz.groups.map(() => 'shown');
const shownOf = o => maskOf(o).filter(m => m === 'shown').length;

console.log('\n   figure             axes matched   position');
for (const o of [...quiz.outcomes].sort((a, b) => shownOf(a) - shownOf(b))) {
  const m = maskOf(o);
  console.log(`   ${o.name.padEnd(18)} ${String(shownOf(o)).padStart(2)}/${quiz.groups.length}          ` +
    o.position.map((v, i) => (m[i] === 'shown' ? String(v).padStart(3) : m[i] === 'both' ? ' ~~' : ' ··')).join(' '));
}

/** The closest pair, measured the way the engine measures: each outcome on its own axes. */
let closestPair = { d: Infinity, a: '', b: '' };
for (const a of quiz.outcomes) {
  const rest = resultFor(quiz, a.position).ranked.filter(r => r.slug !== a.slug);
  const near = rest[0];
  if (!near) continue;
  // resultFor hides the distance; recover it from the roster geometry under a's mask.
  const b = quiz.outcomes.find(o => o.slug === near.slug);
  const m = maskOf(a);
  let sum = 0, k = 0;
  quiz.groups.forEach((_, i) => {
    if (m[i] !== 'shown') return;
    sum += (a.position[i] - b.position[i]) ** 2;
    k++;
  });
  const d = Math.sqrt((sum * quiz.groups.length) / Math.max(1, k));
  if (d < closestPair.d) closestPair = { d, a: a.name, b: b.name };
}
console.log(`\n   closest pair: ${closestPair.a} and ${closestPair.b}, ` +
  `${closestPair.d.toFixed(1)} units apart (tie rule ${quiz.config.tieUnits})`);

// ------------------------------------------------------------------- the two runs
const uniform = run('uniform answers', UNIFORM);
seed = 20260921;
const realistic = run('realistic answers (.12/.25/.18/.30/.15)', REALISTIC);

// ----------------------------------------------------------------------- targets
console.log('\n== targets, on the realistic generator ==');
let failed = 0;
const check = (ok, line) => {
  if (!ok) failed++;
  console.log(`   ${ok ? 'pass' : 'FAIL'}  ${line}`);
};
check(realistic.max[1] / realistic.named <= 0.09,
  `no figure closest for more than 9%: worst is ${realistic.max[0]} at ${pct(realistic.max[1], realistic.named).trim()}`);
check(realistic.min[1] / realistic.named >= 0.015,
  `every figure closest for at least 1.5%: thinnest is ${realistic.min[0]} at ${pct(realistic.min[1], realistic.named).trim()}`);
check(realistic.states.tie < 0.15, `"tie" under 15%: ${(realistic.states.tie * 100).toFixed(1)}%`);
check(realistic.states.central < 0.06, `"central" under 6%: ${(realistic.states.central * 100).toFixed(1)}%`);

console.log(failed ? `\n${failed} target(s) not met.` : '\nAll calibration targets met.');
rmSync(OUT, { force: true });
