/**
 * Headless check of the quiz engine. Bundles the TypeScript with esbuild and runs the
 * audit's own published answer sheets through it, so a refactor cannot quietly change
 * anyone's result. Run with `npm run test`.
 *
 * This is the site's counterpart to audit/selftest.js, which checks the demo page's
 * copy of the same rules. Both must pass.
 */
import { build } from 'esbuild';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(ROOT, 'node_modules/.engine-test.mjs');

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
const { QUIZZES, getQuiz, scoreQuiz, resultFor, encodeFor, decodeFor, shareTextFor } = engine;

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);

// ---------------------------------------------------------------- 1. registry
console.log('1. registry');
if (QUIZZES.length < 2) fail('expected at least two quizzes, got ' + QUIZZES.length);
for (const q of QUIZZES) {
  const perGroup = q.groups.map((_, i) => q.items.filter(it => it.group === i).length);
  ok(`${q.slug}: ${q.items.length} items, ${q.groups.length} groups (${perGroup.join('/')}), ` +
     `radix ${q.config.radix}, strategy ${q.strategy.id}`);
}

// ------------------------------------------------------- 2. codec round-trips
console.log('2. codec round-trips');
for (const q of QUIZZES) {
  const steps = q.config.radix - 1;
  let bad = 0, n = 0;
  // Every reachable value on every group, plus the corners.
  for (let step = 0; step <= steps; step++) {
    const v = Math.round((step * 100) / steps);
    const values = new Array(q.groups.length).fill(v);
    const back = decodeFor(q, encodeFor(q, values));
    n++;
    if (!back || back.some((x, i) => x !== values[i])) bad++;
  }
  // A mixed sheet, so it is not just testing uniform values.
  const mixed = q.groups.map((_, i) => Math.round(((i % (steps + 1)) * 100) / steps));
  const backMixed = decodeFor(q, encodeFor(q, mixed));
  n++;
  if (!backMixed || backMixed.some((x, i) => x !== mixed[i])) bad++;
  if (bad) fail(`${q.slug}: ${bad}/${n} codes did not round-trip`);
  else ok(`${q.slug}: ${n} codes round-trip exactly (length ${encodeFor(q, mixed).length})`);
}

// Garbage must be rejected rather than decoded to a plausible result.
console.log('3. codec rejects bad input');
{
  const q = getQuiz('theology-compass');
  const len = encodeFor(q, q.groups.map(() => 50)).length;
  const bad = ['', 'ZZZ', 'zzzzzzzzzzzz', '!!!!!!', 'A'.repeat(len + 1), '-'.repeat(len)];
  let wrong = 0;
  for (const c of bad) if (decodeFor(q, c) !== null) { wrong++; fail(`decoded junk: ${JSON.stringify(c)}`); }
  if (!wrong) ok(`${bad.length} malformed codes all rejected`);
}

// -------------------------------------- 4. the audit's answer sheets, re-scored
console.log('4. published answer sheets land on their own tradition');
{
  const compass = getQuiz('theology-compass');
  const data = JSON.parse(readFileSync(resolve(ROOT, 'src/data/compass-audit.json'), 'utf8'));
  const sims = data.simulations ?? [];
  if (!sims.length) fail('no simulations in compass.json');

  let landed = 0;
  for (const sim of sims) {
    if (!Array.isArray(sim.answers) || !sim.answers.length) continue;
    const values = scoreQuiz(compass, sim.answers);

    // Scores must match what the audit recorded.
    if (Array.isArray(sim.scores) && sim.scores.some((s, i) => s !== values[i])) {
      fail(`${sim.tradition}: scores ${values.join(',')} != audit ${sim.scores.join(',')}`);
    }

    const res = resultFor(compass, values);
    const top = res.ranked[0];
    const own = compass.outcomes.find(o => o.name === sim.tradition);
    if (!own) { fail(`no outcome named "${sim.tradition}"`); continue; }
    if (top.slug === own.slug) {
      landed++;
      ok(`${String(sim.tradition).slice(0, 44).padEnd(44)} -> ${top.match ?? top.score}%`);
    } else {
      fail(`${sim.tradition} landed on ${top.name} (${top.score}%)`);
    }
  }
  console.log(`   landed: ${landed}/${sims.filter(s => Array.isArray(s.answers) && s.answers.length).length}`);
  if (landed !== 18) fail(`expected all 18 sheets to land on their own tradition, got ${landed}`);
}

// ------------------------------------------------- 5. the audited edge-case rules
console.log('5. audited scoring rules still hold');
{
  const compass = getQuiz('theology-compass');
  const allUnsure = compass.items.map(() => 0);
  const values = scoreQuiz(compass, allUnsure);
  if (values.some(v => v !== 50)) fail('all-Unsure did not score 50 on every axis: ' + values.join(','));
  const res = resultFor(compass, values);
  if (res.headline !== 'Near the center on every axis') fail('all-central headline: ' + res.headline);
  if (!/no tradition is named/.test(res.summary)) fail('all-central suppression missing: ' + res.summary);
  else ok('all-Unsure suppresses the tradition match');

  // Middle-band axes must not appear in the headline.
  const mid = [67, 50, 33, 50, 50, 67];
  const h = resultFor(compass, mid).headline;
  if (/Table|Kingdom|Authority/.test(h)) fail('middle-band axis leaked into headline: ' + h);
  else ok('middle band excluded from headline: "' + h + '"');

  // Left pole and right pole must be reachable and describe themselves.
  const left = resultFor(compass, compass.groups.map(() => 0));
  if (!/at the .* pole/.test(left.bars[0].lean)) fail('left pole lean: ' + left.bars[0].lean);
  else ok('pole positions describe themselves: "' + left.bars[0].lean + '"');
}

// ----------------------------------------------- 6. the second quiz on the seams
console.log('6. second quiz runs on the same engine');
{
  const sins = getQuiz('seven-deadly-sins');
  if (!sins) fail('seven-deadly-sins not registered');
  else {
    // Agree strongly with every positively-keyed pride item, disagree with the rest.
    const sheet = sins.items.map(it =>
      sins.groups[it.group].key === 'pride' ? (it.direction === 1 ? 2 : -2) : 0
    );
    const values = scoreQuiz(sins, sheet);
    const res = resultFor(sins, values);
    if (res.ranked[0].slug !== 'pride') fail('pride sheet ranked ' + res.ranked[0].slug + ' first');
    else ok(`pride sheet -> "${res.headline}" (${res.ranked[0].score})`);
    if (res.bars.length !== 7) fail('expected 7 bars, got ' + res.bars.length);

    const flat = sins.items.map(() => 0);
    const flatRes = resultFor(sins, scoreQuiz(sins, flat));
    if (!/no category is named/.test(flatRes.summary)) fail('flat sheet not hedged: ' + flatRes.summary);
    else ok('flat sheet names nothing');
  }
}

// ------------------------------------------------------------- 7. share surfaces
console.log('7. share text');
{
  for (const q of QUIZZES) {
    const values = q.groups.map((_, i) => (i % 2 ? 70 : 30));
    const text = shareTextFor(q, values, 'https://wiserwalk.com');
    const lines = text.split('\n');
    if (lines[0] !== q.shareTitle) fail(`${q.slug}: share title is "${lines[0]}"`);
    if (!text.includes(`https://wiserwalk.com/r/${q.slug}/`)) fail(`${q.slug}: share link missing quiz slug`);
    else ok(`${q.slug}: ${lines.length} lines, links to /r/${q.slug}/`);
  }
}

rmSync(OUT, { force: true });

console.log('');
if (failures) {
  console.log(`${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('All engine checks passed.');
