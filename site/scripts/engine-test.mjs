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
const {
  QUIZZES, getQuiz, scoreQuiz, resultFor, encodeFor, decodeFor, shareTextFor, groupHref,
  parseCodes, compare, compareHref, inviteHref
} = engine;

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
  if (!/at the .* pole/.test(left.rows[0].lean)) fail('left pole lean: ' + left.rows[0].lean);
  else ok('pole positions describe themselves: "' + left.rows[0].lean + '"');
}

// ------------------------------------- 5b. the result view declares its shape honestly
console.log('5b. the result view keeps the two shapes apart');
{
  const compass = getQuiz('theology-compass');
  const view = resultFor(compass, [33, 42, 33, 58, 50, 67]);

  if (view.shape !== 'bipolar') fail('compass view shape: ' + view.shape);
  else ok('compass declares shape "bipolar"');

  // Both poles on every row, unconditionally. This is the one that must never regress.
  const missing = view.rows.filter(r => !r.left || !r.right);
  if (missing.length) fail('rows missing a pole name: ' + missing.map(r => r.key).join(','));
  else ok('every row prints both pole names');

  // The visible no-claim zone must be the same range the scoring actually uses.
  const [lo, hi] = view.noClaimRange;
  if (lo !== 41 || hi !== 59) fail('no-claim range: ' + lo + '-' + hi);
  const wrong = view.rows.filter(r => r.noClaim !== (r.value >= lo && r.value <= hi));
  if (wrong.length) fail('noClaim disagrees with the range on: ' + wrong.map(r => r.key).join(','));
  else ok(`no-claim zone ${lo}-${hi} matches every row's own flag`);

  // Slug, not key: two of the six differ, and a URL built from key would 404.
  const bySlug = view.rows.map(r => r.slug);
  if (!bySlug.includes('gifts') || !bySlug.includes('authority')) {
    fail('rows do not carry the published slugs: ' + bySlug.join(','));
  } else ok('rows carry slugs (gifts, authority), not keys (spirit, tradition)');

  // The same rule at the other end: the URL builder itself must use the slug. The axes
  // keyed "spirit" and "tradition" publish at /gifts/ and /authority/, so a href built
  // from key would 404 on two of the six.
  const hrefs = compass.groups.map(g => groupHref(compass, g));
  const wrongHref = compass.groups
    .map((g, i) => [g, hrefs[i]])
    .filter(([g, h]) => h !== `/axis/theology-compass/${g.slug}/`);
  if (wrongHref.length) {
    fail('groupHref did not build /axis/theology-compass/<slug>/: ' + wrongHref.map(([, h]) => h).join(','));
  } else if (!hrefs.includes('/axis/theology-compass/gifts/') ||
             !hrefs.includes('/axis/theology-compass/authority/')) {
    fail('groupHref did not publish the gifts and authority axes: ' + hrefs.join(' '));
  } else ok(`groupHref builds all ${hrefs.length} axis URLs from slugs, gifts and authority included`);

  // Every reachable score must land in exactly one band with a real adjective.
  const reach = [0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100];
  const bad = reach.filter(v => !resultFor(compass, [v, 50, 50, 50, 50, 50]).rows[0].band);
  if (bad.length) fail('scores with no band adjective: ' + bad.join(','));
  else ok('all 13 reachable scores name a band');

  const sins = getQuiz('seven-deadly-sins');
  const uni = resultFor(sins, sins.groups.map(() => 50));
  if (uni.shape !== 'unipolar') fail('sins view shape: ' + uni.shape);
  else ok('seven-deadly-sins declares shape "unipolar"');

  // The bipolar chassis must not reach the unipolar view at all.
  const leaked = uni.rows.filter(r => 'left' in r || 'right' in r || 'band' in r || 'noClaim' in r);
  if (leaked.length) fail('bipolar fields leaked into unipolar rows: ' + leaked.map(r => r.key).join(','));
  else ok('unipolar rows carry no pole, band or no-claim field');
  if ('noClaimRange' in uni) fail('unipolar view carries a no-claim range');
  else ok('unipolar view has no no-claim range — a ranking has no centre');

  const ranks = uni.rows.map(r => r.rank).sort((a, b) => a - b);
  if (ranks.join(',') !== uni.rows.map((_, i) => i + 1).join(',')) {
    fail('unipolar ranks are not 1..n: ' + ranks.join(','));
  } else ok('unipolar rows rank 1..' + uni.rows.length + ' with no gaps or ties in the numbering');
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
    if (res.rows.length !== 7) fail('expected 7 rows, got ' + res.rows.length);

    const flat = sins.items.map(() => 0);
    const flatRes = resultFor(sins, scoreQuiz(sins, flat));
    // Assert the state, not the sentence: the copy is allowed to improve, the rule is not.
    if (flatRes.state !== 'flat') fail('flat sheet gave state ' + flatRes.state);
    else if (!/none is named|no category is named/.test(flatRes.summary)) {
      fail('flat sheet not hedged: ' + flatRes.summary);
    } else ok('flat sheet names nothing');
  }
}

// ------------------------------- 6b. the unipolar naming rule does not accuse anybody
console.log('6b. unipolar naming floor and tie margin');
{
  const sins = getQuiz('seven-deadly-sins');
  const run = sheet => resultFor(sins, scoreQuiz(sins, sheet));
  const byKey = (fn) => sins.items.map(it => fn(sins.groups[it.group].key, it.direction));

  // The one that used to fail: answering "that is not me" to every statement scores 0 on
  // all seven, and the old midpoint-distance test called that "standing out". It named the
  // alphabetically first two — the most emphatic denial came back as an accusation.
  const denied = run(byKey((_, d) => (d === 1 ? -2 : 2)));
  if (denied.state !== 'flat') fail('denying everything gave state ' + denied.state);
  else if (/envy|gluttony|pride/i.test(denied.headline)) {
    fail('denying everything still names a vice: ' + denied.headline);
  } else ok('denying every statement names nothing: "' + denied.headline + '"');

  const unsure = run(sins.items.map(() => 0));
  if (unsure.state !== 'flat') fail('all-unsure gave state ' + unsure.state);
  else ok('all-unsure names nothing');

  const pride = run(byKey(k => (k === 'pride' ? 2 : 0)).map((v, i) =>
    sins.groups[sins.items[i].group].key === 'pride' ? (sins.items[i].direction === 1 ? 2 : -2) : 0
  ));
  if (pride.state !== 'clear' || pride.headline !== 'Pride') {
    fail('a clear pride sheet gave ' + pride.state + ' / ' + pride.headline);
  } else ok('a clear leader is named');

  // Two steps apart at radix 9 is 25 points — a real, measurable difference, not a tie.
  const twoApart = run(sins.items.map(it => {
    const k = sins.groups[it.group].key;
    if (k === 'pride') return it.direction === 1 ? 2 : -2;
    if (k === 'envy') return it.direction === 1 ? 2 : 0;
    return 0;
  }));
  if (twoApart.state !== 'clear') fail('100 vs 75 was called ' + twoApart.state + ', not clear');
  else ok('two reachable steps apart is not a tie');

  const level = run(sins.items.map(it =>
    ['pride', 'envy'].includes(sins.groups[it.group].key) ? (it.direction === 1 ? 2 : -2) : 0
  ));
  if (level.state !== 'tie') fail('two equal leaders gave ' + level.state);
  else ok('two equal leaders are both named: "' + level.headline + '"');
}

// -------------------------- 6c. the pole split never moves a pole's words to the middle
console.log('6c. the pole split keeps every sentence with its own side');
{
  const compass = getQuiz('theology-compass');
  let checked = 0;
  for (const g of compass.groups) {
    const parts = g.summaryParts;
    if (!parts) { fail(`${g.name} has no summaryParts`); continue; }
    if (!parts.left || !parts.right) { fail(`${g.name} lost a pole's case`); continue; }

    // A "between the poles" block that opens with a pronoun takes its subject from the
    // sentence before it, and that sentence belongs to a pole. Gifts and Kingdom used to
    // fail exactly here: "They affirm that God still heals..." is the CESSATIONISTS'
    // own qualification, and filing it as neutral took it out of their case.
    if (parts.between && /^(They|These|Those|Such|It|This)/.test(parts.between)) {
      fail(`${g.name}: the between-note starts with a pronoun, so it belongs to a pole`);
    }

    // Every sentence of the audited summary must survive somewhere, exactly once.
    const rebuilt = [parts.left, parts.right, parts.between, parts.caution]
      .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    if (rebuilt !== g.summary.replace(/\s+/g, ' ').trim()) {
      fail(`${g.name}: the split does not reassemble into the audited summary`);
    } else checked++;
  }
  if (checked === compass.groups.length) {
    ok(`all ${checked} axis summaries split into poles and reassemble exactly`);
  }
}

// ------------------------- 6c2. a code from one quiz must not decode under another
console.log('6c2. result codes are bound to their quiz');
{
  const compass = getQuiz('theology-compass');
  const sins = getQuiz('seven-deadly-sins');

  // 13^6 = 4,826,809 and 9^7 = 4,782,969: both six base-36 characters, overlapping ranges.
  // Before the code prefix, a Compass code pasted under the sins slug decoded to a
  // complete, plausible and entirely fabricated result.
  const cCode = encodeFor(compass, [33, 42, 33, 58, 50, 67]);
  const sCode = encodeFor(sins, sins.groups.map((_, i) => (i === 0 ? 100 : 50)));

  if (decodeFor(sins, cCode) !== null) fail('a Compass code decoded under seven-deadly-sins');
  else ok('a Compass code is rejected by the sins quiz');
  if (decodeFor(compass, sCode) !== null) fail('a sins code decoded under the Compass');
  else ok('a sins code is rejected by the Compass');

  // The Compass keeps its bare six-character codes: its permalinks are already live, and a
  // result link is the only copy of a result that exists.
  if (cCode.length !== 6 || /^[A-Z]{1,3}0/.test(cCode) === false) {
    // a bare code starts with the padded body, not a letter prefix
  }
  if (compass.codePrefix) fail('the Compass gained a code prefix; live links would break');
  else ok('Compass codes are unprefixed and unchanged: ' + cCode);

  if (decodeFor(sins, sCode) === null) fail('the sins code does not round-trip');
  else ok('prefixed codes still round-trip: ' + sCode);
}

// ------------------------- 6d. the two share bars mean two different things, on purpose
console.log('6d. the share bars keep position and magnitude apart');
{
  const sins = getQuiz('seven-deadly-sins');
  const neutral = shareTextFor(sins, scoreQuiz(sins, sins.items.map(() => 0)), 'https://x');
  // A perfectly neutral sheet used to fill six of eleven cells on every row, because the
  // eleven-slot bar is a Compass artifact whose middle slot is the CENTRE of an axis.
  if (/█/.test(neutral)) fail('a neutral unipolar sheet fills cells: \n' + neutral);
  else ok('a neutral unipolar sheet leaves every bar empty');

  const compass = getQuiz('theology-compass');
  const centre = shareTextFor(compass, compass.groups.map(() => 50), 'https://x');
  // The bipolar bar marks a POSITION, so a centred axis must still show its marker.
  const marked = centre.split('\n').filter(l => l.includes('●')).length;
  if (marked !== compass.groups.length) {
    fail(`bipolar centre lost its position marker on ${compass.groups.length - marked} rows`);
  } else ok('a centred bipolar sheet still marks a position on every row');
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

// ------------------------------------------- 8. the generated data files themselves
console.log('8. generated data files');
{
  // An internal JSON key once reached the published Grace summary. The client bundle is
  // read by anyone who opens the page source, so the leak is checked on the text itself
  // rather than on any one field.
  const raw = readFileSync(resolve(ROOT, 'src/data/compass.json'), 'utf8');
  if (raw.includes('candidate_statements')) {
    fail('compass.json contains the internal key "candidate_statements"');
  } else ok('compass.json leaks no internal audit key');

  // The method page publishes the whole changelog and the whole disputed log. If either
  // ever shipped short, the page would quietly claim completeness it did not have.
  const aside = JSON.parse(readFileSync(resolve(ROOT, 'src/data/compass-audit.json'), 'utf8'));
  const changes = aside.changelog ?? [];
  const disputed = aside.disputed ?? [];
  if (changes.length !== 89) fail(`compass-audit.json carries ${changes.length} changelog entries, expected 89`);
  else ok('compass-audit.json carries all 89 changelog entries');
  if (disputed.length !== 11) fail(`compass-audit.json carries ${disputed.length} disputed entries, expected 11`);
  else ok('compass-audit.json carries all 11 disputed entries');

  const incomplete = changes.filter(c => !c.target || !c.why);
  if (incomplete.length) fail(`${incomplete.length} changelog entries have no target or no reason`);
  else ok('every changelog entry names a target and a reason');
}

// --------------------------------------------- 9. two results on one set of rails
console.log('9. the two-person overlay');
{
  const compass = getQuiz('theology-compass');
  const sins = getQuiz('seven-deadly-sins');
  const data = JSON.parse(readFileSync(resolve(ROOT, 'src/data/compass-audit.json'), 'utf8'));
  const sheetOf = name => (data.simulations ?? []).find(s => s.tradition === name)?.answers;

  // ---- parseCodes: two codes, or nothing at all
  const a = encodeFor(compass, scoreQuiz(compass, sheetOf('Presbyterian / Reformed (confessional)')));
  const b = encodeFor(compass, scoreQuiz(compass, sheetOf('Eastern Orthodox')));
  const sCode = encodeFor(sins, sins.groups.map((_, i) => (i === 0 ? 100 : 50)));

  const pair = parseCodes(compass, `${a}.${b}`);
  if (!pair || pair.length !== 2) fail('parseCodes did not return two sheets for two good codes');
  else if (pair[0].length !== compass.groups.length || pair[1].length !== compass.groups.length) {
    fail('parseCodes returned sheets of the wrong width');
  } else if (pair[0].join(',') !== decodeFor(compass, a).join(',')) {
    fail('parseCodes decoded the first code differently from decodeFor');
  } else ok(`parseCodes: ${a}.${b} -> two ${pair[0].length}-value sheets`);

  // Lower case in the URL must still work: nothing uppercases the parameter before this.
  if (!parseCodes(compass, `${a}.${b}`.toLowerCase())) fail('parseCodes rejected lowercase codes');
  else ok('parseCodes accepts a lowercased link');

  const rejects = [
    ['one code', a],
    ['three codes', `${a}.${b}.${a}`],
    ['a junk part', `${a}.ZZZZZZ`],
    ['an empty part', `${a}.`],
    ['nothing at all', ''],
    ['a sins code under the compass slug', `${a}.${sCode}`],
    ['two sins codes under the compass slug', `${sCode}.${sCode}`]
  ];
  let leaked = 0;
  for (const [what, param] of rejects) {
    if (parseCodes(compass, param) !== null) { leaked++; fail(`parseCodes accepted ${what}: ${param}`); }
  }
  if (!leaked) ok(`parseCodes rejects all ${rejects.length} malformed parameters`);

  // ---- compare: two audited sheets
  const cmp = compare(compass, decodeFor(compass, a), decodeFor(compass, b));
  if (cmp.shape !== 'bipolar') fail('compare on the Compass gave shape ' + cmp.shape);
  if (cmp.total !== compass.groups.length) fail('compare total: ' + cmp.total);
  if (!(cmp.sameCount >= 0 && cmp.sameCount <= cmp.total)) fail('sameCount out of range: ' + cmp.sameCount);

  // sameBand is band-string equality and nothing else. No distance, no threshold, no score.
  const wrongBand = cmp.rows.filter(r => r.sameBand !== (r.a.band === r.b.band));
  if (wrongBand.length) fail('sameBand disagrees with the band strings on: ' + wrongBand.map(r => r.slug).join(','));
  else ok(`sameBand is band-string equality on all ${cmp.total} axes (same on ${cmp.sameCount})`);

  const wrongGap = cmp.rows.filter(r => r.gap !== Math.abs(r.a.value - r.b.value));
  if (wrongGap.length) fail('gap is not |a - b| on: ' + wrongGap.map(r => r.slug).join(','));

  const maxGap = Math.max(...cmp.rows.map(r => r.gap));
  if (!cmp.widest) fail('two different sheets produced no widest gap');
  else if (cmp.widest.gap !== maxGap) fail(`widest gap ${cmp.widest.gap} != max row gap ${maxGap}`);
  else ok(`widest gap is ${cmp.widest.name} at ${maxGap} units, largest of ${cmp.rows.map(r => r.gap).join('/')}`);

  // Both pole names survive the pairing. This is the rule that must never regress.
  const poleless = cmp.rows.filter(r => !r.left || !r.right);
  if (poleless.length) fail('paired rows missing a pole name: ' + poleless.map(r => r.slug).join(','));
  else ok('every paired row still carries both pole names');

  // ---- a sheet against itself
  const self = compare(compass, decodeFor(compass, a), decodeFor(compass, a));
  if (self.sameCount !== self.total) fail(`a sheet against itself: ${self.sameCount}/${self.total}`);
  else if (self.widest !== null) fail('a sheet against itself named a widest gap');
  else ok('a sheet against itself: same band on every axis, no widest gap');

  // Ties go to quiz order, so the same pair of codes always highlights the same axis.
  const base = compass.groups.map(() => 50);
  const bump = compass.groups.map((_, i) => (i === 1 || i === 4 ? 100 : 50));
  const tied = compare(compass, base, bump);
  if (tied.widest?.slug !== compass.groups[1].slug) {
    fail('a tied widest gap did not go to the earlier axis: ' + tied.widest?.slug);
  } else ok('equal gaps break to quiz order: ' + tied.widest.name);

  // ---- unipolar
  const prideSheet = sins.items.map(it =>
    sins.groups[it.group].key === 'pride' ? (it.direction === 1 ? 2 : -2) : 0
  );
  const envySheet = sins.items.map(it =>
    sins.groups[it.group].key === 'envy' ? (it.direction === 1 ? 2 : -2) : 0
  );
  const pv = scoreQuiz(sins, prideSheet);
  const ev = scoreQuiz(sins, envySheet);

  const uni = compare(sins, pv, ev);
  if (uni.shape !== 'unipolar') fail('compare on the sins quiz gave shape ' + uni.shape);
  if (uni.rows.length !== sins.groups.length) fail('unipolar pairing lost rows: ' + uni.rows.length);
  const mispaired = uni.rows.filter(r => r.a.slug !== r.slug || r.b.slug !== r.slug);
  if (mispaired.length) fail('unipolar rows paired across different slugs');
  else ok('unipolar rows pair by slug, ' + uni.rows.length + ' of them');
  const order = uni.rows.map(r => r.a.rank);
  if (order.join(',') !== [...order].sort((x, y) => x - y).join(',')) {
    fail("unipolar rows are not in A's rank order: " + order.join(','));
  } else ok("unipolar rows run in A's rank order");
  if (uni.sharedTop) fail('a pride sheet and an envy sheet were called a shared top');
  else ok('different leaders: sharedTop false');
  const same = compare(sins, pv, pv);
  if (!same.sharedTop) fail('the same sheet twice did not report a shared top');
  else ok('the same leader twice: sharedTop true');

  // ---- the two URLs, exactly
  const ch = compareHref(compass, a, b);
  if (ch !== `/c/theology-compass/${a}.${b}/`) fail('compareHref: ' + ch);
  else ok('compareHref: ' + ch);
  const ih = inviteHref(compass, a);
  if (ih !== `/q/theology-compass/?with=${a}`) fail('inviteHref: ' + ih);
  else ok('inviteHref: ' + ih);
  const ihs = inviteHref(sins, sCode);
  if (ihs !== `/q/seven-deadly-sins/?with=${sCode}`) fail('inviteHref (sins): ' + ihs);
  else ok('inviteHref (sins): ' + ihs);

  // A comparison URL carries the quiz slug and two codes, and nothing else: no name, no
  // initial, no label, in either direction.
  const codesPart = ch.slice(`/c/${compass.slug}/`.length).replace(/\/$/, '');
  if (codesPart !== `${a}.${b}`) fail('compareHref path carries more than two codes: ' + ch);
  else if (/[^A-Z0-9.]/.test(codesPart)) {
    fail('compareHref carries something other than codes: ' + codesPart);
  } else ok('a comparison URL is two codes and nothing else');
}

rmSync(OUT, { force: true });

console.log('');
if (failures) {
  console.log(`${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('All engine checks passed.');
