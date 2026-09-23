/**
 * Headless check of the quiz engine. Bundles the TypeScript with esbuild and runs the
 * audit's own published answer sheets through it, so a refactor cannot quietly change
 * anyone's result. Run with `npm run test`.
 *
 * This is the site's counterpart to audit/selftest.js, which checks the demo page's
 * copy of the same rules. Both must pass.
 */
import { build } from 'esbuild';
import { existsSync, readFileSync, rmSync } from 'node:fs';
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
  outcomeHref, parseCodes, compare, compareHref, inviteHref
} = engine;

/*
 * The contracts themselves, bundled separately.
 *
 * The registry is what every page imports, and it deliberately re-exports URLs and the
 * comparison rather than the whole of engine/types. The rules that live beside the fields
 * they switch on — a sheet with no variation in it, and the sentence a named outcome
 * carries — are imported from where they are written instead of being widened into the
 * registry's surface for the sake of a test.
 */
const OUT_TYPES = resolve(ROOT, 'node_modules/.engine-test-types.mjs');
await build({
  entryPoints: [resolve(ROOT, 'src/lib/engine/types.ts')],
  outfile: OUT_TYPES,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  logLevel: 'silent'
});
const { isUniformSheet, centresUniformSheets, groupNoteFor, resultNotes } =
  await import(pathToFileURL(OUT_TYPES).href);

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

// ------------------------------------------- 1b. what is published and what is not
/*
 * Publication status is not a cosmetic field. A live quiz is indexable, sits in the
 * sitemap and takes the flagship's block on the hub; a draft is noindex and its prefixes
 * are cut from the sitemap by astro.config.mjs, which derives them from this same list.
 * The figure and gifts quizzes were released by the owner on 2026-09-20; the seven deadly
 * sins followed on 2026-09-21 after its lean audit (TASKS.md item 11). Nothing is a draft
 * now, and a status flipped by accident is a page published or unpublished by accident.
 */
console.log('1b. publication status');
{
  const want = {
    'theology-compass': 'live',
    'bible-figure': 'live',
    'spiritual-gifts': 'live',
    'seven-deadly-sins': 'live',
    'which-psalm': 'live'
  };
  for (const [slug, status] of Object.entries(want)) {
    const q = getQuiz(slug);
    if (!q) fail(`${slug} is not in the registry`);
    else if (q.status !== status) fail(`${slug} is '${q.status}', expected '${status}'`);
    else ok(`${slug} is ${status}`);
  }
  // The prefixes astro.config.mjs cuts out of the sitemap, computed the same way it does.
  const draftPrefixes = QUIZZES.filter(q => q.status === 'draft').map(q => `/q/${q.slug}/`);
  if (draftPrefixes.length) {
    fail('a released quiz is still being cut from the sitemap: ' + draftPrefixes.join(', '));
  } else {
    ok('every quiz is live, so the sitemap cuts no quiz prefix');
  }
}

// ------------------------------------------------------- 2. codec round-trips
console.log('2. codec round-trips');
for (const q of QUIZZES) {
  // A reading's code carries one situation, not a value per group; section 18 checks it.
  if (q.strategy.shape === 'reading') continue;
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
    if (q.strategy.shape === 'reading') continue; // section 18
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

// ------------------------------------------------- 10. every group is keyed both ways
console.log('10. every group in every quiz is keyed in both directions');
{
  // The registry throws on this at module load, so reaching here means it held. Printing
  // the counts is what makes a silent data edit visible in the test log rather than only
  // in a thrown build error.
  for (const q of QUIZZES) {
    const bad = q.groups.filter((_, i) => {
      const dirs = q.items.filter(it => it.group === i).map(it => it.direction);
      return !dirs.includes(1) || !dirs.includes(-1);
    });
    if (bad.length) fail(`${q.slug}: groups keyed one way only: ${bad.map(g => g.key).join(',')}`);
    else {
      const fwd = q.items.filter(it => it.direction === 1).length;
      ok(`${q.slug}: all ${q.groups.length} groups keyed both ways (${fwd} of ${q.items.length} forward)`);
    }
  }
}

// ---------------------------------- 11. the figure quiz: people, not percentages
console.log('11. who in the Bible are you most like?');
{
  const bf = getQuiz('bible-figure');
  if (!bf) fail('bible-figure not registered');
  else {
    // The audit's answer sheets prove the Compass; a figure has no answer sheet, so the
    // equivalent proof is that its OWN coordinates return it. If a figure's position does
    // not land on that figure, the page for it would open by naming somebody else.
    let landed = 0;
    for (const f of bf.outcomes) {
      const top = resultFor(bf, f.position).ranked[0];
      if (top.slug === f.slug) landed++;
      else fail(`${f.name}'s own coordinates land on ${top.name}`);
    }
    if (landed === bf.outcomes.length) {
      ok(`all ${landed} figures' own coordinates return that figure first`);
    }

    // Two figures at the same point are indistinguishable for ever: whichever sorts first
    // wins every reader, and the other is unreachable. Checked as an exact tie, which is
    // the only version of the problem the data can be wrong about.
    const seen = new Map();
    let dupes = 0;
    for (const f of bf.outcomes) {
      const key = f.position.join(',');
      if (seen.has(key)) { dupes++; fail(`${f.name} and ${seen.get(key)} share the position ${key}`); }
      seen.set(key, f.name);
    }
    if (!dupes) ok(`all ${bf.outcomes.length} figures sit at distinct positions`);

    // The closest pair, printed rather than asserted: it is a fact about the roster the
    // owner should see move. Measured the way the engine measures — an axis counts only
    // where BOTH figures name a position — so it is comparable to the tie rule.
    let closest = { d: Infinity, a: '', b: '' };
    for (let i = 0; i < bf.outcomes.length; i++) {
      for (let j = i + 1; j < bf.outcomes.length; j++) {
        const A = bf.outcomes[i], B = bf.outcomes[j];
        let sum = 0, k = 0;
        for (let g = 0; g < bf.groups.length; g++) {
          if (A.mask[g] !== 'shown' || B.mask[g] !== 'shown') continue;
          sum += (A.position[g] - B.position[g]) ** 2;
          k++;
        }
        if (!k) continue;
        const d = Math.sqrt((sum * bf.groups.length) / k);
        if (d < closest.d) closest = { d, a: A.name, b: B.name };
      }
    }
    ok(`closest pair: ${closest.a} and ${closest.b}, ${closest.d.toFixed(1)} units apart ` +
       `(tie rule ${bf.config.tieUnits})`);

    // Every figure needs a cell on every axis, and a cell must be one of the two honest
    // kinds: cited acts, or a single "the text does not show this" with a null reference.
    // A figure with neither would have a coordinate resting on nothing at all.
    let cells = 0, cited = 0, silent = 0;
    for (const f of bf.outcomes) {
      for (const g of bf.groups) {
        const items = f.evidence?.[g.key];
        cells++;
        if (!Array.isArray(items) || !items.length) {
          fail(`${f.name} has no evidence on ${g.key}`);
        } else if (items.every(e => e.ref)) {
          cited++;
          const wrong = items.filter(e => e.toward !== 'left' && e.toward !== 'right');
          if (wrong.length) fail(`${f.name}/${g.key}: a cited act points at no pole`);
        } else if (items.length === 1 && !items[0].ref && !items[0].toward) {
          silent++;
        } else {
          fail(`${f.name}/${g.key}: mixes cited acts with a "not shown" item`);
        }
      }
    }
    ok(`${cells} evidence cells: ${cited} cited, ${silent} "the text does not show this"`);

    // Evidence is keyed by group KEY and URLs are built from group SLUG. On this quiz they
    // differ on the fifth axis (keyed `doubt`, published `reasons`), which is the same trap
    // the Compass sprang with `spirit`/`gifts`.
    const keys = bf.groups.map(g => g.key).join(',');
    const slugs = bf.groups.map(g => g.slug).join(',');
    if (keys === slugs) fail('bible-figure keys and slugs are identical — the doubt/reasons rename is gone');
    else if (!slugs.includes('reasons') || !keys.includes('doubt')) {
      fail(`bible-figure axis identities are wrong: keys ${keys}, slugs ${slugs}`);
    } else ok('the fifth axis is keyed "doubt" and published as "reasons"');

    // No number against a person, at the source: the quiz declares it, and its outcome
    // pages live under their own path so /tradition/ stays the Compass's.
    if (!bf.hideOutcomeScore) fail('bible-figure does not set hideOutcomeScore');
    else ok('bible-figure sets hideOutcomeScore: no percentage against a person');
    const compass = getQuiz('theology-compass');
    const fh = outcomeHref(bf, bf.outcomes[0]);
    const th = outcomeHref(compass, compass.outcomes[0]);
    if (fh !== `/figure/${bf.outcomes[0].slug}/`) fail('figure outcome href: ' + fh);
    else if (th !== `/tradition/${compass.outcomes[0].slug}/`) fail('tradition outcome href moved: ' + th);
    else ok(`outcome pages: ${fh} and ${th}`);

    // The share text is a surface like any other, and it must not carry a score either.
    const share = shareTextFor(bf, [42, 50, 58, 67, 50, 33], 'https://wiserwalk.com');
    if (/\d+%/.test(share)) fail('the figure share text prints a percentage:\n' + share);
    else ok('the figure share text prints no percentage');

    // Jesus is on the roster by the owner's decision, and carries one sentence that must
    // travel with him wherever he is named.
    const jesus = bf.outcomes.find(o => o.slug === 'jesus');
    if (!jesus) fail('Jesus is not on the roster');
    else if (!jesus.note || !/temperament/.test(jesus.note)) fail('Jesus carries no note');
    else ok('Jesus is on the roster and carries his note: "' + jesus.note.slice(0, 48) + '..."');

    // Judith and Tobit are on the roster by the owner's decision, from books Protestant
    // Bibles do not carry. Each says so in one sentence that travels with the outcome, so a
    // reader never meets the name without being told where the book is printed.
    let canon = 0;
    for (const slug of ['judith', 'tobit']) {
      const f = bf.outcomes.find(o => o.slug === slug);
      if (!f) { fail(`${slug} is not on the roster`); continue; }
      const want = `The book of ${f.name} is in Catholic and Orthodox Bibles. ` +
        'Protestant Bibles leave it out or print it as Apocrypha.';
      if (f.note !== want) fail(`${f.name} does not carry the canon note: ${f.note ?? '(none)'}`);
      else canon++;
    }
    if (canon === 2) ok('Judith and Tobit each carry the sentence saying which Bibles hold their book');

    // The roster's own promises: both Testaments, at least nine women, and Jesus. Checked
    // by name because there is no field for either, and a calibration pass that quietly
    // dropped a woman to fix a distribution would be the worst way to hit a number.
    const women = [
      'Deborah', 'Esther', 'Ruth', 'Hannah', 'Abigail', 'Rahab',
      'Mary the mother of Jesus', 'Martha', 'Mary Magdalene', 'Priscilla', 'Sarah', 'Miriam',
      'Judith'
    ].filter(n => bf.outcomes.some(o => o.name === n));
    if (women.length < 9) fail(`only ${women.length} women on the roster: ${women.join(', ')}`);
    else ok(`${women.length} women on the roster of ${bf.outcomes.length}`);
  }
}

// ------------------------ 11b. the evidence mask: what a figure is and is not measured on
console.log('11b. evidence-masked matching');
{
  const bf = getQuiz('bible-figure');
  const compass = getQuiz('theology-compass');
  const n = bf.groups.length;

  // Every figure declares a mask of the right width, made only of the three honest values,
  // and agreeing with its own evidence. The mask is DERIVED in bible-figure.ts; this is the
  // independent check that the derivation says what the data says.
  let wrong = 0;
  for (const f of bf.outcomes) {
    if (!Array.isArray(f.mask) || f.mask.length !== n) { wrong++; fail(`${f.name}: mask width`); continue; }
    bf.groups.forEach((g, i) => {
      const cited = (f.evidence[g.key] ?? []).filter(e => e.ref);
      const bothWays = cited.some(e => e.toward === 'left') && cited.some(e => e.toward === 'right');
      const inBand = f.position[i] >= 41 && f.position[i] <= 59;
      const want = !cited.length ? 'none' : !inBand ? 'shown' : bothWays ? 'both' : 'BROKEN';
      if (f.mask[i] !== want) {
        wrong++;
        fail(`${f.name}/${g.key}: mask "${f.mask[i]}" but the evidence says "${want}" (at ${f.position[i]})`);
      }
    });
  }
  if (!wrong) ok(`all ${bf.outcomes.length} masks agree with the evidence they were derived from`);

  // The eligibility floor. A figure placed on three axes would be named as somebody's
  // closest on three verses; the registry throws on it, so reaching here means it held.
  const floor = bf.config.minShownAxes;
  const counts = bf.outcomes.map(f => f.mask.filter(m => m === 'shown').length);
  const thin = bf.outcomes.filter((_, i) => counts[i] < floor);
  if (thin.length) fail('figures below the floor: ' + thin.map(f => f.name).join(', '));
  else ok(`every figure is placed on at least ${floor} of ${n} axes ` +
          `(${Math.min(...counts)}-${Math.max(...counts)}, ${(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1)} on average)`);

  // A masked axis must be IGNORED, not counted. Move every coordinate a figure is NOT
  // placed on to the far end of its axis, against a fixed reader: the whole ranking, every
  // figure and every bar, must come out identical. This is the property the fix exists for
  // — a coordinate nobody argued for cannot be allowed to touch anybody's result.
  const readers = [[25, 75, 25, 75, 25, 75], [8, 8, 92, 33, 67, 50], [100, 0, 100, 0, 100, 0]];
  let moved = 0;
  for (const f of bf.outcomes) {
    const shifted = f.position.map((v, i) => (f.mask[i] === 'shown' ? v : v < 50 ? 100 : 0));
    if (shifted.join(',') === f.position.join(',')) continue;
    const swapped = {
      ...bf,
      outcomes: bf.outcomes.map(o => (o.slug === f.slug ? { ...o, position: shifted } : o))
    };
    for (const reader of readers) {
      const a = JSON.stringify(resultFor(bf, reader).ranked);
      const b = JSON.stringify(bf.strategy.result(swapped, reader).ranked);
      if (a !== b) { moved++; fail(`${f.name}: moving its masked axes changed a ranking`); break; }
    }
  }
  if (!moved) ok('masked axes are ignored: moving every one of them to a pole changes no ranking');

  // (That a figure's own coordinates return that figure is checked in 11 above. Under
  // evidence-masked matching it is no longer arithmetic for free: a figure read as a reader
  // names a position on exactly its own shown axes, so it is a real check that the mask
  // derived from the evidence and the no-claim band agree.)

  // The ranking says what it was measured on, and only where that is not everything.
  const view = resultFor(bf, [25, 75, 25, 75, 25, 75]);
  if (view.ranked.every(r => r.axes === undefined)) fail('the figure ranking carries no axis count');
  else if (view.ranked.some(r => r.axes > r.ofAxes)) fail('an outcome was measured on more axes than exist');
  else ok(`a figure result reports its axes: ${view.ranked.slice(0, 3).map(r => `${r.name} ${r.axes}/${r.ofAxes}`).join(', ')}`);

  // ...and the Compass carries none of it, because every tradition has a position on every
  // axis. This is the field-level half of "the Compass is unchanged".
  const cv = resultFor(compass, [33, 42, 33, 58, 50, 67]);
  if (compass.outcomes.some(o => o.mask)) fail('a Compass tradition declared an evidence mask');
  else if (cv.ranked.some(r => 'axes' in r || 'ofAxes' in r)) {
    fail('the Compass ranking gained an axis count');
  } else ok('the Compass declares no mask and its ranking is unchanged in shape');

  // The reader's side of the same rule: an axis the READER names no position on is left out
  // too, because 41-59 is where this instrument says a score claims nothing. Proof: move
  // one axis from one end of the no-claim band to the other. The figure ranking must be
  // identical; the Compass, which counts every axis, must notice.
  const lo = [42, 25, 75, 25, 75, 25];
  const hi = [58, 25, 75, 25, 75, 25];
  const same = q => JSON.stringify(resultFor(q, lo).ranked) === JSON.stringify(resultFor(q, hi).ranked);
  if (!same(bf)) fail('the figure quiz counted an axis the reader named no position on');
  else ok('an axis the reader names no position on is left out of the figure match');
  if (same(compass)) fail('moving a Compass axis across the no-claim band changed nothing — ' +
                          'the Compass must still count every axis');
  else ok('the Compass still counts every axis, no-claim band included');
}

// -------------------------------------------- 12. the gifts quiz: words, not verdicts
console.log('12. what are your spiritual gifts?');
{
  const sg = getQuiz('spiritual-gifts');
  const sins = getQuiz('seven-deadly-sins');
  if (!sg) fail('spiritual-gifts not registered');
  else {
    const sheet = sg.items.map(it =>
      sg.groups[it.group].key === 'hospitality' ? (it.direction === 1 ? 2 : -2) : 0
    );
    const res = resultFor(sg, scoreQuiz(sg, sheet));
    if (res.ranked[0].slug !== 'hospitality') fail('hospitality sheet ranked ' + res.ranked[0].slug);
    else ok(`hospitality sheet -> "${res.headline}"`);

    // The vice words must not reach a gift. "Leaned away" beside "Be hospitable to one
    // another" is the failure this quiz's own strength words exist to prevent.
    const words = res.rows.map(r => r.strength);
    if (words.some(w => /leaned away|pull/.test(w))) {
      fail('the vice strength words reached the gifts quiz: ' + [...new Set(words)].join(' / '));
    } else ok('gift rows read in this quiz\'s own words: ' + [...new Set(words)].join(' / '));
    // ...and the sins quiz keeps the defaults it was written with.
    const sinWords = resultFor(sins, scoreQuiz(sins, sins.items.map(it => (it.direction === 1 ? 1 : -1))))
      .rows.map(r => r.strength);
    if (!sinWords.some(w => /pull/.test(w))) fail('the sins quiz lost its own words: ' + sinWords.join(','));
    else ok('the seven-deadly-sins quiz keeps the strategy defaults');

    // Every gift needs its listing passage and its recorded acts, or the group page would
    // publish a name with nothing behind it.
    const thin = sg.groups.filter(g => !g.quoted?.length || !g.acts?.length);
    if (thin.length) fail('gifts with no passage or no acts: ' + thin.map(g => g.key).join(','));
    else ok(`all ${sg.groups.length} gifts carry a quoted passage and at least one recorded act`);

    // The share card shows the top three. The bottom of a gifts ranking is the part a
    // reader would least want pasted anywhere, and the page's caveat cannot travel with it.
    // A hospitality sheet prints hospitality, serving and teaching, none of which carries the
    // travelling sentence, so the count is the title, three bars and the link.
    const lines = shareTextFor(sg, scoreQuiz(sg, sheet), 'https://wiserwalk.com').split('\n');
    if (lines.length !== 1 + (sg.unipolarCopy?.shareTop ?? sg.groups.length) + 1) {
      fail(`gifts share text has ${lines.length} lines:\n` + lines.join('\n'));
    } else ok(`gifts share text prints ${sg.unipolarCopy.shareTop} rows, not all ${sg.groups.length}`);
  }
}

// --------------------------------- 12b. nineteen gifts: the instrument's own shape
console.log('12b. nineteen gifts, fifty-seven statements');
{
  const sg = getQuiz('spiritual-gifts');
  const keyOf = i => sg.groups[sg.items[i].group].key;

  if (sg.groups.length !== 19) fail(`expected 19 gifts, got ${sg.groups.length}`);
  else if (sg.items.length !== 57) fail(`expected 57 statements, got ${sg.items.length}`);
  else ok('19 gifts, 57 statements');

  // Three each, one of them reverse-keyed. Two reverse items on one gift would score the
  // reader's caution; none would score their agreeableness.
  const wrong = sg.groups.filter((_, i) => {
    const mine = sg.items.filter(it => it.group === i);
    return mine.length !== 3 || mine.filter(it => it.direction === -1).length !== 1;
  });
  if (wrong.length) fail('gifts without exactly three statements and one reverse item: ' +
                         wrong.map(g => g.key).join(','));
  else ok('every gift has exactly three statements and exactly one keyed -1');

  // Rule 1 of the blueprint, at the length the closing editor measured: 21 words, on
  // discernment's "others" statement. Anything longer is a second claim wearing a comma.
  const long = sg.items.filter(it => it.text.trim().split(/\s+/).length > 21);
  if (long.length) fail('statements over 21 words: ' + long.map(it => `#${it.n}`).join(','));
  else {
    const most = Math.max(...sg.items.map(it => it.text.trim().split(/\s+/).length));
    ok(`no statement is over 21 words (longest ${most})`);
  }

  /*
   * The running order. A reader meets one statement at a time, and two in a row about the
   * same thing announce what is being measured — which is the whole reason the gift is
   * never named beside the statement. Three rounds of nineteen with different strides keep
   * every gift apart from itself, and the pairs below apart from each other, because a
   * reader who meets prophecy and then discernment reads one question asked twice.
   */
  const NEVER_ADJACENT = [
    ['prophecy', 'knowledge'], ['prophecy', 'wisdom'], ['prophecy', 'discernment'],
    ['prophecy', 'encouraging'],
    ['knowledge', 'wisdom'], ['knowledge', 'discernment'], ['knowledge', 'teaching'],
    ['healing', 'miracles'], ['healing', 'faith'], ['healing', 'mercy'],
    ['miracles', 'faith'], ['miracles', 'mercy'],
    ['tongues', 'interpretation']
  ];
  const banned = new Set(NEVER_ADJACENT.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));
  let sameGift = 0, nearPair = [];
  for (let i = 1; i < sg.items.length; i++) {
    const a = keyOf(i - 1), b = keyOf(i);
    if (a === b) { sameGift++; fail(`statements ${i} and ${i + 1} are both ${a}`); }
    if (banned.has(`${a}|${b}`)) nearPair.push(`${i}/${i + 1} ${a}+${b}`);
  }
  if (!sameGift) ok('no two statements from one gift are adjacent in the running order');
  if (nearPair.length) fail('neighbouring gifts sit side by side: ' + nearPair.join(', '));
  else ok(`none of the ${NEVER_ADJACENT.length} near-pairs is ever adjacent`);

  // The reader's last impression is not the contested ground.
  const SIX = sg.groupNote.groups;
  const last = keyOf(sg.items.length - 1);
  if (SIX.includes(last)) fail(`the last statement is ${last}, one of the six`);
  else ok(`the last statement is ${last}, not one of the six`);

  /*
   * NOTHING marks the six out. No badge, no chip, no grouping, no second-class placement —
   * and the way that fails quietly is a field on the data that a renderer later hangs a
   * label off. The only per-group difference in the file is the acts heading on the two
   * gifts the New Testament records no act of, and it is about the LIST, not the gift.
   */
  const ABOUT_THE_LIST = ['actsHeading', 'actsKicker'];
  const shape = g => Object.keys(g).filter(k => !ABOUT_THE_LIST.includes(k)).sort().join(',');
  const plain = shape(sg.groups.find(g => g.key === 'serving'));
  const marked = sg.groups.filter(g => shape(g) !== plain);
  if (marked.length) fail('gifts carrying a field the other rows do not: ' +
                          marked.map(g => `${g.key} (${shape(g)})`).join('; '));
  else ok(`all 19 gifts carry the same fields: ${plain}`);

  const headed = sg.groups.filter(g => g.actsHeading).map(g => g.key).sort();
  if (headed.join(',') !== 'interpretation,knowledge') {
    fail('the acts heading is set on: ' + headed.join(',') + ' (expected knowledge and interpretation)');
  } else {
    const k = sg.groups.find(g => g.key === 'knowledge');
    if (k.actsHeading !== 'What Paul writes about it' || k.actsKicker !== '3 passages, each cited') {
      fail(`knowledge heads its list "${k.actsHeading}" / "${k.actsKicker}"`);
    } else ok(`knowledge and interpreting tongues head their list "${k.actsHeading}" (${k.actsKicker})`);
  }
}

// ------------------------- 12c. nineteen gifts at radix 13: the wide codec
console.log('12c. the wide codec carries nineteen gifts');
{
  const sg = getQuiz('spiritual-gifts');
  const steps = sg.config.radix - 1;
  const reach = Array.from({ length: sg.config.radix }, (_, s) => Math.round((s * 100) / steps));

  // 13^19 is about 1.5e21 and a double holds integers exactly only to about 9.0e15. The
  // narrow codec's arithmetic would silently drop the low digits — which here means the
  // last few gifts of somebody's result — so this quiz must be on the BigInt codec.
  if (Number.isSafeInteger(Math.pow(sg.config.radix, sg.groups.length))) {
    fail('13^19 is a safe integer? then this test proves nothing');
  } else ok('13^19 is past the safe-integer limit, so this quiz needs the wide codec');

  // Every reachable value in every slot, walked so that no two slots hold the same value.
  let bad = 0, n = 0;
  for (let off = 0; off < sg.config.radix; off++) {
    const values = sg.groups.map((_, i) => reach[(i + off) % sg.config.radix]);
    const back = decodeFor(sg, encodeFor(sg, values));
    n++;
    if (!back || back.some((v, i) => v !== values[i])) {
      bad++;
      fail(`offset ${off} did not round-trip: ${back ? back.join(',') : 'null'} != ${values.join(',')}`);
    }
  }

  /*
   * The low digits, on their own. Two sheets identical but for the LAST gift must produce
   * two different codes, both of which decode back exactly — that is the precise thing
   * double arithmetic loses at this width, and it would lose it silently.
   */
  const base = sg.groups.map(() => 50);
  const tail = base.map((v, i) => (i === sg.groups.length - 1 ? 100 : v));
  const cb = encodeFor(sg, base), ct = encodeFor(sg, tail);
  if (cb === ct) fail('two sheets differing only on the last gift encode to the same code');
  else if (decodeFor(sg, ct).join(',') !== tail.join(',')) fail('the last gift did not survive the round trip');
  else ok(`the last gift survives: ${cb} != ${ct}`);
  if (!bad) ok(`${n} nineteen-gift codes round-trip exactly (length ${cb.length}, prefix ${sg.codePrefix})`);

  // Junk of exactly the right length must 404, not invent nineteen scores. A wrong URL that
  // decodes is worse than a wrong URL that fails, because the reader cannot tell.
  const len = cb.length;
  const body = len - sg.codePrefix.length;
  const junk = [
    'SG' + 'Z'.repeat(body),                       // in range of base 36, past 13^19
    'XX' + cb.slice(sg.codePrefix.length),          // the right body, the wrong quiz
    'SG' + '-'.repeat(body),
    'SG' + '!'.repeat(body),
    cb.slice(0, len - 1) + '.',
    'S'.repeat(len)
  ];
  let leaked = 0;
  for (const c of junk) {
    if (c.length !== len) { fail(`junk code "${c}" is not ${len} characters`); continue; }
    if (decodeFor(sg, c) !== null) { leaked++; fail(`decoded junk of the right length: ${c}`); }
  }
  if (!leaked) ok(`${junk.length} malformed ${len}-character codes all rejected`);

  // ...and no other quiz's code opens this one, or a reader would meet a fabricated result.
  for (const q of QUIZZES) {
    if (q.slug === sg.slug) continue;
    const foreign = encodeFor(q, q.strategy.shape === 'reading' ? [0] : q.groups.map(() => 50));
    if (decodeFor(sg, foreign) !== null) fail(`a ${q.slug} code decoded under spiritual-gifts`);
  }
  ok('no other quiz\'s code decodes under spiritual-gifts');
}

// ------------- 12d. the naming floor, and the sentence that travels with six of the names
console.log('12d. what is named, and what travels with the name');
{
  const sg = getQuiz('spiritual-gifts');
  const SIX = sg.groupNote.groups;
  const idx = key => sg.groups.findIndex(g => g.key === key);
  /** A sheet that maxes these gifts and leaves the rest at no-net-agreement. */
  const max = keys => sg.items.map(it =>
    keys.includes(sg.groups[it.group].key) ? (it.direction === 1 ? 2 : -2) : 0);
  const share = values => shareTextFor(sg, values, 'https://wiserwalk.com');
  const noteResult = sg.groupNote.result;
  const noteShare = sg.groupNote.share;
  const countIn = (text, line) => text.split('\n').filter(l => l === line).length;

  /*
   * A row must clear the naming floor ITSELF, not merely sit within a rung of one that does.
   *
   * 67 is what agreeing with every statement scores, on every row, for everybody — so a 67
   * named beside a 75 is the keying being named, not the reader. This is the one the owner
   * was told about tongues: private use alone is +2, +2, -2, which is 67.
   */
  const near = sg.groups.map((_, i) => (i === idx('serving') ? 75 : i === idx('tongues') ? 67 : 50));
  const nearView = resultFor(sg, near);
  if (nearView.named.join(',') !== 'serving') {
    fail('a 67 was named beside a 75: ' + nearView.named.join(','));
  } else ok('a row at 67 is not named jointly with a leader at 75: "' + nearView.headline + '"');

  // ...and the reader who agreed with all fifty-seven is told nothing stood out, which is
  // true: every row of that sheet is the same 67.
  const agreed = resultFor(sg, scoreQuiz(sg, sg.items.map(() => 2)));
  if (agreed.state !== 'flat') fail('agreeing with everything gave state ' + agreed.state);
  else if (agreed.named.length) fail('agreeing with everything named ' + agreed.named.join(','));
  else ok('a reader who agrees with all 57 is flat: "' + agreed.headline + '"');

  // ---- the sentence travels once when one of the six leads
  const tv = scoreQuiz(sg, max(['tongues']));
  const tongues = resultFor(sg, tv);
  if (tongues.named.join(',') !== 'tongues') fail('a tongues sheet named ' + tongues.named.join(','));
  else if (resultNotes(sg, tongues).length) fail('a gifts result carried an outcome note');
  else if (groupNoteFor(sg, tongues.named, 'result').join('') !== noteResult) {
    fail('tongues leading did not carry the sentence');
  } else if (countIn(share(tv), noteShare) !== 1) {
    fail('the share text did not carry the sentence once:\n' + share(tv));
  } else ok('tongues leading: the sentence travels once, on the page and in the share text');

  // ---- once, not twice, when two of the six come out level
  const pv = scoreQuiz(sg, max(['tongues', 'healing']));
  const pair = resultFor(sg, pv);
  if (pair.state !== 'tie' || pair.named.length !== 2) {
    fail(`two of the six gave ${pair.state}, ${pair.named.length} named`);
  } else if (groupNoteFor(sg, pair.named, 'result').length !== 1) {
    fail('two named gifts carried ' + groupNoteFor(sg, pair.named, 'result').length + ' sentences');
  } else if (countIn(share(pv), noteShare) !== 1) {
    fail('two named gifts put the sentence in the share text twice:\n' + share(pv));
  } else ok(`two of the six level ("${pair.headline}"): one sentence, not two`);

  // ---- not at all when none of the six is named or printed
  const sv = scoreQuiz(sg, max(['serving']));
  const serving = resultFor(sg, sv);
  const printed = share(sv).split('\n').slice(1, 1 + sg.unipolarCopy.shareTop);
  if (serving.named.join(',') !== 'serving') fail('a serving sheet named ' + serving.named.join(','));
  else if (SIX.some(k => printed.some(l => l.endsWith(' ' + sg.groups[idx(k)].name)))) {
    fail('one of the six reached the top three of a serving sheet:\n' + printed.join('\n'));
  } else if (groupNoteFor(sg, serving.named, 'result').length) {
    fail('serving leading carried the sentence');
  } else if (share(sv).includes(noteShare)) {
    fail('serving leading put the sentence in the share text:\n' + share(sv));
  } else ok('serving leading, none of the six in the top three: no sentence anywhere');

  /*
   * ---- and in the SHARE TEXT when one of the six is second but not named.
   *
   * The share text prints the top three, so a gift the page never named by name is still
   * pasted into a group chat by name — and it is the name travelling that the sentence has
   * to travel with. Healing at 83 against a leader at 100 is outside the tie margin, so the
   * page names serving alone and says nothing; the card someone posts says healing.
   */
  const second = sg.items.map(it => {
    const k = sg.groups[it.group].key;
    if (k === 'serving') return it.direction === 1 ? 2 : -2;
    if (k === 'healing') return it.direction === 1 ? 2 : 0;
    return 0;
  });
  const secondV = scoreQuiz(sg, second);
  const secondView = resultFor(sg, secondV);
  const lines = share(secondV).split('\n');
  if (secondView.named.join(',') !== 'serving') {
    fail('the second-place sheet named ' + secondView.named.join(','));
  } else if (groupNoteFor(sg, secondView.named, 'result').length) {
    fail('the page carried the sentence for a gift it did not name');
  } else if (!lines[2].endsWith(' healing')) {
    fail('healing is not the second row of the share text:\n' + lines.join('\n'));
  } else if (countIn(share(secondV), noteShare) !== 1) {
    fail('the share text did not carry the sentence once:\n' + lines.join('\n'));
  } else if (lines[lines.length - 2] !== noteShare) {
    fail('the sentence is not the line immediately above the link:\n' + lines.join('\n'));
  } else ok('healing second in the share text: the sentence travels there and not on the page');
}

// ------------------------- 13. the gift quotations are verbatim, checked against the text
console.log('13. every quoted passage is a substring of the translation on disk');
{
  // Both files are ones demos/sounds-like-scripture downloads, and both are gitignored, so
  // both are absent on the deploy host. Missing means "not checked here", never "checked and
  // fine". They hold different books, and a reference can only be checked against the file
  // that has its book: verses-all.json carries the sixty-six, and the verse-per-line file
  // carries the deuterocanon, which is where Judith and Tobit come from. The parsing of the
  // second is audit/tools/webbe.mjs's, which is how those two entries were verified by hand.
  const versePath = resolve(ROOT, '../demos/sounds-like-scripture/work/verses-all.json');
  const vplPath = resolve(ROOT, '../demos/sounds-like-scripture/raw/eng-webbe_vpl.txt');
  /** Books read from the verse-per-line file, by the name a reference uses. */
  const VPL_BOOKS = { Tobit: 'TOB', Judith: 'JDT' };

  const haveVerses = existsSync(versePath);
  const haveVpl = existsSync(vplPath);
  const byRef = new Map();
  if (haveVerses) {
    for (const v of JSON.parse(readFileSync(versePath, 'utf8'))) {
      if (v.src === 'webbe') byRef.set(v.ref, v.text);
    }
  } else {
    console.log('  skip  verses-all.json is not on disk (it is gitignored) — the sixty-six books are unchecked');
  }
  if (haveVpl) {
    const names = Object.fromEntries(Object.entries(VPL_BOOKS).map(([name, code]) => [code, name]));
    for (const line of readFileSync(vplPath, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z0-9]{3}) (\d+):(\d+) (.*)$/.exec(line);
      if (m && names[m[1]]) byRef.set(`${names[m[1]]} ${m[2]}:${m[3]}`, m[4].trim());
    }
  } else {
    console.log('  skip  eng-webbe_vpl.txt is not on disk (it is gitignored) — Judith and Tobit are unchecked');
  }

  /** True when this reference's book lives only in a file that is not on disk. */
  const unloaded = ref => {
    const book = /^(.+?)\s\d+:/.exec(ref)?.[1];
    if (!book) return false;
    return VPL_BOOKS[book] ? !haveVpl : !haveVerses;
  };

  if (!byRef.size) {
    console.log('  skip  no translation file is on disk — quotations unchecked');
  } else {
    /** "1 Peter 4:9-10" -> the text of 4:9 and 4:10, joined. */
    const textOf = ref => {
      const m = /^(.+?)\s(\d+):(\d+)(?:-(\d+))?$/.exec(ref);
      if (!m) return null;
      const [, book, ch, from, to] = m;
      const out = [];
      for (let v = Number(from); v <= Number(to ?? from); v++) {
        const t = byRef.get(`${book} ${ch}:${v}`);
        if (t) out.push(t);
      }
      return out.length ? out.join(' ') : null;
    };
    const norm = s => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
    let checked = 0, missing = 0, skipped = 0;
    for (const q of QUIZZES) {
      for (const g of q.groups) {
        for (const src of g.quoted ?? []) {
          if (unloaded(src.ref)) { skipped++; continue; }
          const text = textOf(src.ref);
          if (!text) { missing++; fail(`${q.slug}/${g.key}: ${src.ref} is not in the WEBBE file`); continue; }
          if (!norm(text).includes(norm(src.text))) {
            fail(`${q.slug}/${g.key}: the quotation is not in ${src.ref}:\n    ${src.text}\n    ${text}`);
          } else checked++;
        }
      }
    }
    if (checked && !missing) {
      ok(`${checked} quotations are verbatim substrings of their cited verses` +
         (skipped ? ` (${skipped} skipped: their book's file is not on disk)` : ''));
    }

    // The figure roster, held to the same standard the verifier held it to by hand: every
    // reference must resolve in the translation on disk, and every quotation must be a
    // verbatim substring of the verses it cites. A calibration pass that added evidence is
    // exactly when this stops being theoretical.
    const bf = getQuiz('bible-figure');
    let refs = 0, quotes = 0, badRef = 0, badQuote = 0, unchecked = 0;
    for (const f of bf.outcomes) {
      for (const g of bf.groups) {
        for (const e of f.evidence[g.key] ?? []) {
          if (!e.ref) continue;
          if (unloaded(e.ref)) { unchecked++; continue; }
          const text = textOf(e.ref);
          refs++;
          if (!text) { badRef++; fail(`${f.name}/${g.key}: ${e.ref} is not in the WEBBE file`); continue; }
          if (!e.quote) continue;
          quotes++;
          if (!norm(text).includes(norm(e.quote))) {
            badQuote++;
            fail(`${f.name}/${g.key}: the quotation is not in ${e.ref}:\n    ${e.quote}\n    ${text}`);
          }
        }
      }
    }
    if (!badRef && !badQuote) {
      ok(`${refs} figure references all resolve, and all ${quotes} of their quotations are verbatim` +
         (unchecked ? ` (${unchecked} skipped: their book's file is not on disk)` : ''));
    }
  }
}

// ------------------------- 14. an outcome's own sentence travels with its name
console.log('14. the note travels with the name it belongs to');
{
  const compass = getQuiz('theology-compass');
  const bf = getQuiz('bible-figure');

  /*
   * The Compass first, byte for byte.
   *
   * Its traditions carry no notes, so nothing may be added to its share text — not a line,
   * not a space. The expected value below was captured by running the share text BEFORE
   * the note was wired in, from the audit's own Catholic answer sheet.
   */
  const sim = JSON.parse(readFileSync(resolve(ROOT, 'src/data/compass-audit.json'), 'utf8'))
    .simulations.find(s => s.tradition === 'Catholic (Roman and Eastern)');
  const was =
    'My Theology Compass\n' +
    '○○○○○○○○●○○ Grace: Monergist → Synergist\n' +
    '●○○○○○○○○○○ Table: Sacramental → Memorial\n' +
    '○●○○○○○○○○○ Gifts: Continuationist → Cessationist\n' +
    '●○○○○○○○○○○ Kingdom: One people → Dispensational\n' +
    '●○○○○○○○○○○ Authority: Bible & tradition → Scripture alone\n' +
    '●○○○○○○○○○○ Worship: Liturgical → Free\n' +
    'Nearest on the map (jointly): Catholic (Roman and Eastern) · Eastern Orthodox (approximate)\n' +
    'https://wiserwalk.com/r/theology-compass/01ZO4A';
  const now = shareTextFor(compass, scoreQuiz(compass, sim.answers), 'https://wiserwalk.com');
  if (now !== was) fail('the Compass share text changed:\n' + now + '\n--- expected ---\n' + was);
  else ok('the Compass share text is unchanged, character for character');

  const jesus = bf.outcomes.find(o => o.slug === 'jesus');

  // A result that names nobody carries no note. His own coordinates are the case: they sit
  // inside the no-position band on every axis he is placed on, so the result is central.
  const own = resultFor(bf, jesus.position);
  if (own.named.length) fail(`a ${own.state} result named ${own.named.join(', ')}`);
  else if (resultNotes(bf, own).length) fail('a result that names nobody carried a note');
  else ok(`Jesus's own coordinates are a ${own.state} result: nobody named, no note`);

  /*
   * ...and a result that names him carries his sentence. Several reader sheets are tried
   * rather than one, because where a figure is nearest depends on the roster: if the
   * coordinates move, the first of these that still names him is used, and if none does
   * that is itself worth failing on.
   */
  const CANDIDATES = [
    [33, 33, 25, 67, 75, 50],
    [83, 25, 33, 67, 75, 33],
    [67, 25, 33, 33, 75, 33],
    [58, 33, 33, 67, 67, 58]
  ];
  const reader = CANDIDATES.find(v => resultFor(bf, v).named[0] === 'jesus');
  if (!reader) fail('no sheet in the list names Jesus any more — check the roster');
  else {
    const view = resultFor(bf, reader);
    const lines = shareTextFor(bf, reader, 'https://wiserwalk.com').split('\n');
    if (lines[lines.length - 2] !== jesus.note) {
      fail('the note is not the line before the URL:\n' + lines.join('\n'));
    } else if (!/temperament as the Gospels record it/.test(lines[lines.length - 2])) {
      fail('the line before the URL is not his sentence: ' + lines[lines.length - 2]);
    } else ok(`a ${view.state} result naming Jesus carries his sentence above the link`);
  }

  /*
   * Two named jointly, two sentences. No pair on the roster ties often enough to rely on,
   * so the second named figure is given a note here — the same trick 11b uses to prove a
   * rule rather than a coincidence.
   */
  const tie = [[0, 33, 17, 0, 75, 33], [92, 33, 33, 67, 25, 17], [50, 25, 33, 33, 67, 58]]
    .find(v => resultFor(bf, v).state === 'tie' && resultFor(bf, v).named[0] === 'jesus');
  if (!tie) fail('no sheet in the list names Jesus jointly any more — check the roster');
  else {
    const second = resultFor(bf, tie).named[1];
    const marked = {
      ...bf,
      outcomes: bf.outcomes.map(o => (o.slug === second ? { ...o, note: 'A second sentence.' } : o))
    };
    const lines = marked.strategy.shareText(marked, tie, 'https://wiserwalk.com').split('\n');
    const last3 = lines.slice(-3, -1);
    if (last3[0] !== jesus.note || last3[1] !== 'A second sentence.') {
      fail('a joint result did not carry both notes:\n' + lines.join('\n'));
    } else ok(`both named figures' sentences travel (Jesus and ${second}), in that order`);
  }

  /*
   * Every quiz: a note line is a whole line of its own, never glued to the link.
   *
   * Two kinds of sentence travel now. An outcome's goes with the names the RESULT chose; a
   * group's goes with the names this TEXT printed, which on a quiz that shares only its top
   * rows is a different list. Both end up in the same place, and this is the rule that says
   * so, for every quiz at once.
   */
  for (const q of QUIZZES) {
    if (q.strategy.shape === 'reading') continue; // names nothing that carries a note; section 18
    const values = q.groups.map((_, i) => (i % 2 ? 75 : 25));
    const lines = shareTextFor(q, values, 'https://wiserwalk.com');
    const view = resultFor(q, values);
    const printed = lines.split('\n').slice(1, -1);
    const shown = q.groups.filter(g => printed.some(l => l.endsWith(' ' + g.name))).map(g => g.slug);
    const notes = [...resultNotes(q, view), ...groupNoteFor(q, shown, 'share')];
    const want = notes.length ? notes.join('\n') + '\n' : '';
    if (!lines.endsWith(`${want}https://wiserwalk.com/r/${q.slug}/${view.code}`)) {
      fail(`${q.slug}: the notes do not sit immediately above the link:\n` + lines);
    }
  }
  ok('on every quiz the notes, if any, are the lines immediately above the link');
}

// ---------------------- 15. the same answer to every statement names nobody
console.log('15. a sheet with no variation in it');
{
  const compass = getQuiz('theology-compass');
  const bf = getQuiz('bible-figure');
  const n = bf.items.length;

  // The predicate, on its own: what counts and what does not.
  const cases = [
    ['every answer strongly agree', new Array(n).fill(2), true],
    ['every answer strongly disagree', new Array(n).fill(-2), true],
    ['every answer agree', new Array(n).fill(1), true],
    ['one answer different', new Array(n).fill(2).map((v, i) => (i === 7 ? 1 : v)), false],
    ['every answer unsure', new Array(n).fill(0), false],
    ['nothing answered', new Array(n).fill(null), false],
    ['one left unanswered', new Array(n).fill(2).map((v, i) => (i === 3 ? null : v)), false]
  ];
  let wrong = 0;
  for (const [what, sheet, want] of cases) {
    if (isUniformSheet(sheet) !== want) { wrong++; fail(`isUniformSheet, ${what}: expected ${want}`); }
  }
  if (!wrong) ok(`isUniformSheet is right on all ${cases.length} cases`);

  // Opt-in, and opted into by one quiz. The Compass must never centre anything.
  if (!centresUniformSheets(bf)) fail('bible-figure does not ask for uniform sheets to be centred');
  else if (centresUniformSheets(compass)) fail('the Compass asks for uniform sheets to be centred');
  else ok('bible-figure opts in; the Compass does not, and its scoring is untouched');

  /*
   * Why it exists, in one line: the arithmetic names somebody on a sheet that says nothing
   * about the reader, because two statements on each axis are keyed one way and one the
   * other. The runner never scores such a sheet; this is what it would have said.
   */
  const agreed = resultFor(bf, scoreQuiz(bf, new Array(n).fill(2)));
  const denied = resultFor(bf, scoreQuiz(bf, new Array(n).fill(-2)));
  ok(`unchecked, all-agree would say "${agreed.summary}"`);
  ok(`unchecked, all-disagree would say "${denied.summary}"`);

  // What the reader gets instead if they ask for it anyway: the middle of every group.
  const centred = bf.groups.map(() => 50);
  const view = resultFor(bf, centred);
  if (view.state !== 'central') fail('a centred sheet gave state ' + view.state);
  else if (view.named.length) fail('a centred sheet named ' + view.named.join(', '));
  else ok(`a centred sheet names nobody: "${view.summary}"`);

  // And it is a real result link, so the invitation and the two-person page work from it.
  const code = encodeFor(bf, centred);
  const back = decodeFor(bf, code);
  if (!back || back.join(',') !== centred.join(',')) fail('the centred code does not round-trip: ' + code);
  else if (!parseCodes(bf, `${code}.${code}`)) fail('two centred codes are not a valid pair');
  else ok(`the centred code ${code} round-trips and pairs for /c/`);
}

// --------------------------------- 16. level categories: name them all, up to four
console.log('16. a unipolar tie names every category inside the margin');
{
  const sins = getQuiz('seven-deadly-sins');
  const sg = getQuiz('spiritual-gifts');

  /** A sheet that maxes exactly these groups and leaves the rest at no-net-agreement. */
  const max = (quiz, keys) => quiz.items.map(it =>
    keys.includes(quiz.groups[it.group].key) ? (it.direction === 1 ? 2 : -2) : 0);
  const nameOf = (quiz, keys) =>
    keys.map(k => quiz.groups.find(g => g.key === k).name).sort((a, b) => a.localeCompare(b));

  // Two, word for word as it read before: the wording of the commonest tie must not move.
  const two = resultFor(sins, scoreQuiz(sins, max(sins, ['pride', 'envy'])));
  if (two.state !== 'tie') fail('two level categories gave state ' + two.state);
  else if (two.headline !== 'Envy and pride') fail('two-way headline: ' + two.headline);
  else if (two.summary !== 'Two came out level: envy and pride.') fail('two-way summary: ' + two.summary);
  else ok(`two level: "${two.headline}" / "${two.summary}"`);

  // Three. The old rule cut this to two and let localeCompare decide which two.
  const three = ['serving', 'teaching', 'mercy'];
  const v3 = resultFor(sg, scoreQuiz(sg, max(sg, three)));
  const n3 = nameOf(sg, three);
  const want3 = `Three came out level: ${n3[0]}, ${n3[1]} and ${n3[2]}.`;
  if (v3.state !== 'tie') fail('three level categories gave state ' + v3.state);
  else if (v3.named.length !== 3) fail('three level named ' + v3.named.length + ': ' + v3.named.join(','));
  else if (v3.summary !== want3) fail(`three-way summary: "${v3.summary}" not "${want3}"`);
  else if (!n3.every(name => v3.headline.includes(name))) fail('three-way headline: ' + v3.headline);
  else ok(`three level: "${v3.headline}" / "${v3.summary}"`);

  // Four, the last size that still reads as a finding.
  const four = ['serving', 'teaching', 'mercy', 'giving'];
  const v4 = resultFor(sg, scoreQuiz(sg, max(sg, four)));
  const n4 = nameOf(sg, four);
  const want4 = `Four came out level: ${n4[0]}, ${n4[1]}, ${n4[2]} and ${n4[3]}.`;
  if (v4.state !== 'tie' || v4.named.length !== 4) fail(`four level gave ${v4.state}, ${v4.named.length} named`);
  else if (v4.summary !== want4) fail(`four-way summary: "${v4.summary}" not "${want4}"`);
  else ok(`four level: "${v4.summary}"`);

  // Five is not a verdict. It is the flat state, in the flat state's own words.
  const five = ['serving', 'teaching', 'mercy', 'giving', 'leading'];
  const v5 = resultFor(sg, scoreQuiz(sg, max(sg, five)));
  if (v5.state !== 'flat') fail('five level categories gave state ' + v5.state);
  else if (v5.named.length) fail('a flat result named ' + v5.named.join(', '));
  else if (v5.headline !== 'No single one stands out') fail('five-way headline: ' + v5.headline);
  else if (v5.summary !== sg.unipolarCopy.flat) fail('five-way summary is not the quiz\'s flat copy');
  else ok('five level is the flat state: nothing stands out, nothing named');

  // A clear leader is still a clear leader, and still one name.
  const clear = resultFor(sg, scoreQuiz(sg, max(sg, ['hospitality'])));
  const hosp = sg.groups.find(g => g.key === 'hospitality').name;
  if (clear.state !== 'clear') fail('one clear leader gave state ' + clear.state);
  else if (clear.named.join(',') !== 'hospitality') fail('a clear result named ' + clear.named.join(','));
  else if (clear.headline !== `${sg.unipolarCopy.headlineLead} ${hosp}`) fail('clear headline: ' + clear.headline);
  else ok(`one clear leader: "${clear.headline}"`);

  // The stack emphasises exactly the rows the headline names, however many that is.
  const counts = [[two, 2], [v3, 3], [v4, 4], [v5, 0], [clear, 1]];
  const off = counts.filter(([v, want]) => v.named.length !== want);
  if (off.length) fail('named counts: ' + counts.map(([v, w]) => `${v.named.length}/${w}`).join(' '));
  else ok('the view names 2, 3, 4, 0 and 1 rows to match its own headline');
}

// ------------------------------------------ 17. the shelf: results kept on the device
console.log('17. the shelf keeps, dedupes, caps and refuses junk');
{
  /*
   * Bundled on its own, the way the contracts are: /me/ and the quiz runner both import it
   * as a module, and its whole point is that it can be exercised without a browser. The
   * fake store below is the only storage it ever sees here.
   */
  const OUT_SHELF = resolve(ROOT, 'node_modules/.engine-test-shelf.mjs');
  await build({
    entryPoints: [resolve(ROOT, 'src/lib/shelf.ts')],
    outfile: OUT_SHELF,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    logLevel: 'silent'
  });
  const shelf = await import(pathToFileURL(OUT_SHELF).href);
  const {
    SHELF_KEY, SHELF_CAP, addResult, listResults, latestPerQuiz, historyFor,
    removeResult, clearShelf, readableResults, parseShelf
  } = shelf;

  /** Storage, faked: three methods and a way to look at what was written. */
  const fake = (initial = null) => {
    let data = initial;
    return {
      getItem: k => (k === SHELF_KEY ? data : null),
      setItem: (k, v) => { if (k === SHELF_KEY) data = v; },
      removeItem: k => { if (k === SHELF_KEY) data = null; },
      raw: () => data
    };
  };
  const at = (iso) => new Date(iso);

  // add, list, latest, history --------------------------------------------------------
  {
    const store = fake();
    addResult('theology-compass', 'AAA', at('2026-09-18T10:00:00Z'), store);
    addResult('bible-figure', 'BBB', at('2026-09-19T10:00:00Z'), store);
    addResult('theology-compass', 'CCC', at('2026-09-20T10:00:00Z'), store);

    const all = listResults(store);
    if (all.length !== 3) fail('three saves gave ' + all.length + ' entries');
    else if (all.map(e => e.code).join(',') !== 'CCC,BBB,AAA') fail('not newest first: ' + all.map(e => e.code).join(','));
    else ok('three results list newest first');

    const latest = latestPerQuiz(store);
    if (latest.get('theology-compass')?.code !== 'CCC') fail('latest compass: ' + latest.get('theology-compass')?.code);
    else if (latest.get('bible-figure')?.code !== 'BBB') fail('latest figure: ' + latest.get('bible-figure')?.code);
    else if (latest.size !== 2) fail('latest per quiz returned ' + latest.size + ' quizzes');
    else ok('the latest result for each quiz is the newest one');

    const history = historyFor('theology-compass', store);
    if (history.map(e => e.code).join(',') !== 'CCC,AAA') fail('compass history: ' + history.map(e => e.code).join(','));
    else ok('one quiz\'s history is its own runs, newest first');
  }

  // the same finish twice ---------------------------------------------------------------
  {
    const store = fake();
    addResult('theology-compass', 'AAA', at('2026-09-20T10:00:00Z'), store);
    addResult('theology-compass', 'AAA', at('2026-09-20T10:00:20Z'), store);
    if (listResults(store).length !== 1) fail('the same result twice inside a minute kept ' + listResults(store).length);
    else ok('the same result saved twice inside a minute is one entry');

    addResult('theology-compass', 'AAA', at('2026-09-20T11:30:00Z'), store);
    if (listResults(store).length !== 2) fail('the same result an hour later kept ' + listResults(store).length);
    else ok('the same result an hour later is a second finish');
  }

  // the cap -----------------------------------------------------------------------------
  {
    const store = fake();
    for (let i = 0; i < SHELF_CAP + 25; i++) {
      addResult('theology-compass', 'C' + i, new Date(Date.UTC(2026, 0, 1) + i * 3600000), store);
    }
    const all = listResults(store);
    if (all.length !== SHELF_CAP) fail(`the cap held ${all.length}, not ${SHELF_CAP}`);
    else if (all[0].code !== 'C' + (SHELF_CAP + 24)) fail('the cap dropped the newest, not the oldest: ' + all[0].code);
    else ok(`the shelf caps at ${SHELF_CAP} and drops the oldest`);
  }

  // remove and clear --------------------------------------------------------------------
  {
    const store = fake();
    addResult('theology-compass', 'AAA', at('2026-09-18T10:00:00Z'), store);
    addResult('bible-figure', 'BBB', at('2026-09-19T10:00:00Z'), store);
    removeResult('theology-compass', 'AAA', null, store);
    const left = listResults(store);
    if (left.length !== 1 || left[0].code !== 'BBB') fail('remove left ' + left.map(e => e.code).join(','));
    else ok('one result comes off the shelf and the others stay');

    clearShelf(store);
    if (listResults(store).length) fail('clear left ' + listResults(store).length + ' entries');
    else if (store.raw() !== null) fail('clear left the key behind');
    else ok('clear takes the lot');
  }

  // nothing throws ----------------------------------------------------------------------
  {
    if (parseShelf('{not json').length) fail('malformed JSON did not start empty');
    else if (parseShelf('{"quiz":"x"}').length) fail('an object that is not a list did not start empty');
    else if (parseShelf('[1,2,3]').length) fail('a list of numbers did not start empty');
    else if (parseShelf('[{"quiz":"a","code":"B","at":"not a date"}]').length) fail('an unparseable date was kept');
    else ok('malformed storage starts empty rather than throwing');

    const broken = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('blocked'); },
      removeItem() { throw new Error('blocked'); }
    };
    try {
      listResults(broken);
      addResult('theology-compass', 'AAA', at('2026-09-20T10:00:00Z'), broken);
      clearShelf(broken);
      ok('blocked storage is a no-op, never an error');
    } catch (e) {
      fail('blocked storage threw: ' + e.message);
    }
  }

  // junk cannot render a result ---------------------------------------------------------
  {
    const compass = getQuiz('theology-compass');
    const real = encodeFor(compass, compass.groups.map((_, i) => (i % 2 ? 67 : 33)));
    const store = fake();
    addResult('theology-compass', real, at('2026-09-20T10:00:00Z'), store);
    addResult('theology-compass', 'ZZZZZZZZ', at('2026-09-19T10:00:00Z'), store);
    addResult('not-a-quiz', real, at('2026-09-18T10:00:00Z'), store);

    if (listResults(store).length !== 3) fail('the shelf did not keep what it was given');
    const shown = readableResults(store);
    if (shown.length !== 1) fail('readable results returned ' + shown.length + ': ' + shown.map(e => e.code).join(','));
    else if (shown[0].code !== real) fail('the readable result is not the real one: ' + shown[0].code);
    else ok('a junk code and an unknown quiz are dropped before anything is drawn');

    // and the one that survived still decodes to the scores it was saved with
    const back = decodeFor(compass, shown[0].code);
    if (!back || back.join(',') !== compass.groups.map((_, i) => (i % 2 ? 67 : 33)).join(',')) {
      fail('the kept code does not decode back: ' + shown[0].code);
    } else ok('the kept code decodes back to the result it was saved from');
  }

  rmSync(OUT_SHELF, { force: true });
}

// ------------------------------- the sins quiz's words, rung by rung (fixed 2026-09-22)
console.log('the seven deadly sins: strength words, ties and "Next"');
{
  const sins = getQuiz('seven-deadly-sins');
  // A sheet that puts each vice on the rung asked for: raw -4..+4 across its two items.
  const sheetFor = raws => {
    const used = {};
    return sins.items.map(it => {
      const key = sins.groups[it.group].key;
      const want = raws[key] ?? 0;
      const first = !(key in used);
      used[key] = true;
      const part = first ? Math.max(-2, Math.min(2, want)) : want - Math.max(-2, Math.min(2, want));
      return part * it.direction;
    });
  };
  const view = raws => resultFor(sins, scoreQuiz(sins, sheetFor(raws)));
  const word = (res, key) => res.rows.find(r => r.slug === sins.groups.find(g => g.key === key).slug)?.strength;

  // Every rung above the middle has its own word; two of them could never print before.
  const rungs = { 1: 'a slight pull', 2: 'a clear pull', 3: 'a strong pull', 4: 'the strongest here' };
  for (const [raw, expected] of Object.entries(rungs)) {
    const got = word(view({ pride: Number(raw) }), 'pride');
    if (got !== expected) fail(`one vice ${raw} rung(s) above the middle reads "${got}", not "${expected}"`);
    else ok(`${raw} rung(s) above the middle reads "${got}"`);
  }

  // tieSteps: 0 means an exact tie only. A rung apart is a leader and a runner-up.
  const apart = view({ pride: 4, wrath: 3 });
  if (apart.state !== 'clear') fail(`pride a rung ahead of wrath came out "${apart.state}": ${apart.summary}`);
  else ok(`a rung apart is not level: "${apart.summary}"`);
  const level = view({ pride: 4, wrath: 4 });
  if (level.state !== 'tie') fail('an exact tie did not print as level: ' + level.summary);
  else ok(`an exact tie is level: "${level.summary}"`);

  // "Next" names only what clears the naming floor, and every row on that score.
  const alone = view({ pride: 4, envy: -2, wrath: -2, sloth: -2, greed: -2, gluttony: -2, lust: -2 });
  if (/Next/.test(alone.summary)) fail('a runner-up the reader leaned away from was named: ' + alone.summary);
  else ok(`nothing else cleared the floor, so no "Next": "${alone.summary}"`);
  const pair = view({ pride: 4, wrath: 2, sloth: 2 });
  if (!/Next: /.test(pair.summary) || !/wrath/.test(pair.summary) || !/sloth/.test(pair.summary) || /envy/.test(pair.summary)) {
    fail('two runners-up on one score were not both named: ' + pair.summary);
  } else ok(`two runners-up on one score are both named: "${pair.summary}"`);
}

// ------------------------------- 18. which psalm: a reading, not a measurement
/*
 * The third shape. Its rules are data (src/data/which-psalm.json), so what can go wrong is a
 * rule that names a question or an answer that does not exist (a result nobody can reach), a
 * code that changes meaning, a verse reference that is not in the text, a follow-up asked out
 * of order, or a share text that says how someone answered. Each of those is checked here.
 */
console.log('18. which psalm are you living right now?');
{
  const OUT_READING = resolve(ROOT, 'node_modules/.engine-test-reading.mjs');
  await build({
    entryPoints: [resolve(ROOT, 'src/lib/strategies/reading.ts')],
    outfile: OUT_READING, bundle: true, format: 'esm', platform: 'node', target: 'node18', logLevel: 'silent'
  });
  const R = await import(pathToFileURL(OUT_READING).href);
  rmSync(OUT_READING, { force: true });
  const q = getQuiz('which-psalm');
  const { READING, SITUATIONS } = R;
  const questions = [...READING.core, ...READING.follow];
  const qById = new Map(questions.map(x => [x.id, x]));

  // Every rule names real questions and real answers, or a result silently becomes unreachable.
  let badRef = 0;
  const checkCond = (where, cond) => {
    for (const [k, vals] of Object.entries(cond)) {
      const qq = qById.get(k);
      if (!qq) { badRef++; fail(`${where}: no question "${k}"`); continue; }
      for (const v of vals) if (!qq.options.some(o => o[0] === v)) { badRef++; fail(`${where}: "${k}" has no answer "${v}"`); }
    }
  };
  for (const id of SITUATIONS) {
    const o = READING.outcomes[id];
    if (!o.need.length) { badRef++; fail(`${id}: no condition at all`); }
    o.need.forEach((n, i) => checkCond(`${id} need ${i}`, n));
    checkCond(`${id} like`, o.like);
    if (o.lineNote?.when) checkCond(`${id} lineNote`, o.lineNote.when);
  }
  READING.follow.forEach(f => (f.when ?? []).forEach((w, i) => checkCond(`follow-up ${f.id} when ${i}`, w)));
  if (!badRef) ok(`${SITUATIONS.length} situations and ${READING.follow.length} follow-ups name only real questions and answers`);

  // Codes: one per situation, round-tripping, bound to this quiz, and junk refused.
  let codeBad = 0;
  SITUATIONS.forEach((id, i) => {
    const code = encodeFor(q, [i]);
    if (code !== 'PS' + id.slice(1)) { codeBad++; fail(`${id} encodes as ${code}`); }
    const back = decodeFor(q, code);
    if (!back || back[0] !== i) { codeBad++; fail(`${code} does not decode back to ${id}`); }
    if (!/^[0-9A-Z.]{1,96}$/.test(code)) { codeBad++; fail(`${code} would be refused by the shelf and the account table`); }
  });
  if (!codeBad) ok(`all ${SITUATIONS.length} result codes round-trip (e.g. ${encodeFor(q, [0])})`);
  const junk = ['', 'PS', 'PS0', 'PS999', 'PSX3', 'P3', '3', 'ps3x', 'PS3.', 'ZZZZZZ'];
  const leaked = junk.filter(c => decodeFor(q, c) !== null);
  if (leaked.length) fail('junk decoded under which-psalm: ' + leaked.join(', '));
  else ok(`${junk.length} malformed codes refused`);
  for (const other of QUIZZES) {
    if (other.slug === q.slug) continue;
    const foreign = encodeFor(other, other.groups.map(() => 50));
    if (decodeFor(q, foreign) !== null) fail(`a ${other.slug} code decoded under which-psalm`);
    if (decodeFor(other, encodeFor(q, [0])) !== null) fail(`a which-psalm code decoded under ${other.slug}`);
  }
  ok('no other quiz\'s code opens a psalm, and no psalm code opens another quiz');

  // The two-person page does not exist for it, and the view names one psalm and ranks nothing.
  if (parseCodes(q, encodeFor(q, [0]) + '.' + encodeFor(q, [1])) !== null) fail('which-psalm has a compare page');
  else ok('no compare page: two people\'s situations are never set side by side');
  const v = resultFor(q, [SITUATIONS.indexOf('P3')]);
  if (v.shape !== 'reading' || v.headline !== 'Psalm 3' || v.rows.length || v.ranked.length) fail('P3 view is wrong: ' + JSON.stringify(v));
  else ok(`P3 reads "${v.headline}": "${v.summary}"`);

  // The share text: the title, the psalm, the link, and nothing about the answers.
  const text = shareTextFor(q, [SITUATIONS.indexOf('P3')], 'https://wiserwalk.com');
  const lines = text.split('\n');
  if (lines[0] !== q.shareTitle || lines[1] !== 'Psalm 3' || lines[2] !== 'https://wiserwalk.com/r/which-psalm/PS3' || lines.length !== 3) {
    fail('share text is not title, psalm, link:\n' + text);
  } else ok('share text is the title, the psalm and the link, nothing more');

  // Every verse a result points at is in the text the site ships.
  const psalms = JSON.parse(readFileSync(resolve(ROOT, 'src/data/psalms.json'), 'utf8')).psalms;
  let missing = 0;
  const has = ref => { const [c, vv] = ref.split(':').map(Number); return psalms[c]?.verses.some(x => x[0] === vv); };
  for (const id of SITUATIONS) {
    const o = READING.outcomes[id];
    for (const n of [o.psalm, ...(o.set ?? []), ...o.also.map(x => parseInt(String(x), 10))]) if (!psalms[n]) { missing++; fail(`${id}: Psalm ${n} is not in psalms.json`); }
    for (const f of ['names', 'turn', 'hard']) if (o[f] && !has(o[f])) { missing++; fail(`${id}: ${f} ${o[f]} is not in the text`); }
    if (o.lineNote && !has(o.lineNote.ref)) { missing++; fail(`${id}: line note ${o.lineNote.ref} is not in the text`); }
  }
  if (!missing) ok(`every psalm and verse the ${SITUATIONS.length} results print is in psalms.json (${Object.keys(psalms).length} psalms)`);

  // Athanasius's numbering, as the result page prints it for Orthodox and older Catholic readers.
  const greek = { 3: '3', 13: '12', 51: '50', 116: '114 and 115', 147: '146 and 147', 150: '150', 9: '9', 10: '9', 114: '113' };
  const wrongGreek = Object.entries(greek).filter(([n, g]) => R.greekNumber(+n) !== g);
  if (wrongGreek.length) fail('Greek numbering wrong for ' + wrongGreek.map(([n]) => n).join(', '));
  else ok('Greek numbering: 51 is his 50, 13 his 12, 116 his 114 and 115');

  // A follow-up comes straight after the answer that calls for it.
  {
    const a = { season: 'hard', trend: 'worse', feel: ['hurt'], focus: 'people', people: ['against'] };
    const next = R.nextQuestion(a);
    if (next?.id !== 'who') fail(`after "Against me" the next question is ${next?.id}, not "Who are they, mostly?"`);
    else ok('"Who are they, mostly?" follows the people question directly');
  }

  // Walk thousands of random answer sets: every walk ends, and every situation can be offered.
  let longest = 0, empty = 0;
  const offered = new Set();
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const a = {};
    let qq, steps = 0;
    while ((qq = R.nextQuestion(a)) && steps < 40) {
      const pick = () => qq.options[(i * 7 + steps * 13 + Math.floor(Math.random() * 97)) % qq.options.length][0];
      a[qq.id] = qq.max ? [pick()] : pick();
      steps++;
    }
    if (steps >= 40) { fail('a walk did not end'); break; }
    longest = Math.max(longest, steps);
    const r = R.rank(a);
    if (!r.length) empty++;
    r.slice(0, 3).forEach(x => offered.add(x.id));
  }
  const never = SITUATIONS.filter(id => !offered.has(id));
  if (never.length) fail('never offered in 20,000 walks: ' + never.join(', '));
  else ok(`20,000 random walks: at most ${longest} questions, every situation offered, ${(100 * empty / N).toFixed(1)}% meet the honest "the letter doesn't name it" page`);
}

rmSync(OUT, { force: true });
rmSync(OUT_TYPES, { force: true });

console.log('');
if (failures) {
  console.log(`${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('All engine checks passed.');
