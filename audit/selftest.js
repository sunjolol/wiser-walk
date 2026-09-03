// Headless check of the page's own scoring code against the audit's published answer sheets.
// Usage: node audit/selftest.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'theology-compass.html'), 'utf8');

const start = html.indexOf('var AXES = [');
const endMark = '/* ---------- Compass geometry and SVG';
const end = html.indexOf(endMark);
if (start < 0 || end < 0) throw new Error('could not locate the scoring block');
const block = html.slice(start, end);
const API = new Function(block + '; return {AXES,STATEMENTS,TRADITIONS,band,lean,headline,computeScores,encode,decode,nearest,shareText,isAllCentral,nearestState,nearestLine,MAXD,HEDGE_UNITS,TIE_UNITS};')();

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };

// 1. Keying balance and length
API.AXES.forEach((a, i) => {
  const dirs = API.STATEMENTS.filter(s => s.a === i).map(s => s.d);
  if (!dirs.includes(1) || !dirs.includes(-1)) fail('axis ' + a.key + ' lacks both keyings: ' + dirs.join(','));
});
API.STATEMENTS.forEach((s, i) => {
  const w = s.t.split(/\s+/).length;
  if (w > 22) fail('statement ' + (i + 1) + ' is ' + w + ' words');
});
console.log('1. keying + length: ' + (failures ? 'problems above' : 'ok'));

// 2. encode/decode round-trips every reachable score
const reach = []; for (let k = 0; k <= 12; k++) reach.push(Math.round(k / 12 * 100));
let rt = 0, rtBad = 0;
for (let i = 0; i < 5000; i++) {
  const v = [...Array(6)].map((_, j) => reach[(i * 7 + j * 3 + Math.floor(i / 13)) % 13]);
  const back = API.decode(API.encode(v));
  rt++;
  if (!back || back.join() !== v.join()) { rtBad++; if (rtBad < 4) fail('round-trip ' + v.join() + ' -> ' + (back && back.join())); }
}
for (const s of reach) { const v = [s, s, s, s, s, s]; const b = API.decode(API.encode(v)); if (!b || b.join() !== v.join()) fail('uniform round-trip ' + s); }
console.log('2. permalink round-trip: ' + rt + ' vectors, ' + rtBad + ' mismatches');

// 3. Every published answer sheet lands on its own tradition
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit', 'compass-data.revised.json'), 'utf8'));
const sims = data.simulations || [];
let miss = 0;
sims.forEach(s => {
  const ans = s.answers;
  if (!Array.isArray(ans) || ans.length !== 18) { fail('sheet without 18 answers: ' + (s.tradition || s.lens)); return; }
  const sc = API.computeScores(ans);
  const near = API.nearest(sc);
  const want = String(s.matched_name_in_revised || s.tradition || s.lens);
  const got = near[0].name;
  const norm = x => x.toLowerCase().split(' (')[0].trim();
  const ok = norm(got) === norm(want) || norm(got).startsWith(norm(want)) || norm(want).startsWith(norm(got));
  const line = '   ' + want.slice(0, 44).padEnd(46) + '-> ' + got.slice(0, 40).padEnd(42) + near[0].match + '%  d=' + near[0].d.toFixed(1);
  if (!ok) { miss++; console.log('  MISS' + line); } else console.log('  ok ' + line);
  const claimed = Array.isArray(s.scores) ? s.scores : (s.scores && typeof s.scores === 'object' ? API.AXES.map(a => s.scores[a.key]) : null);
  if (claimed && claimed.join() !== sc.join()) console.log('        (audit scores ' + claimed.join(',') + ' vs page ' + sc.join(',') + ')');
});
if (miss) fail(miss + ' of ' + sims.length + ' sheets land on another tradition');
console.log('3. tradition landing: ' + (sims.length - miss) + '/' + sims.length);

// 4. All-Unsure names no tradition; headline excludes middle bands
const allUnsure = new Array(18).fill(0);
const sc0 = API.computeScores(allUnsure);
const near0 = API.nearest(sc0);
if (!API.isAllCentral(sc0)) fail('all-Unsure is not detected as central: ' + sc0.join(','));
const state0 = API.nearestState(sc0, near0);
if (state0.kind !== 'central') fail('all-Unsure state is ' + state0.kind);
const head0 = API.headline(sc0, allUnsure);
if (head0 !== 'Near the center on every axis') fail('all-Unsure headline: ' + head0);
console.log('4. all-Unsure: scores ' + sc0.join(',') + ' | headline "' + head0 + '" | line "' + API.nearestLine(sc0, near0) + '"');

// 5. A mixed sheet: middle-band axes must not appear in the headline
const mixed = [-2, -2, -2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, -2, -2, -2];
const scM = API.computeScores(mixed);
const headM = API.headline(scM, mixed);
const middleWords = API.AXES.filter((a, i) => API.band(scM[i]) === 2).map(a => a.bands[2]);
middleWords.forEach(w => { if (headM.toLowerCase().includes(w.toLowerCase())) fail('headline contains middle band "' + w + '": ' + headM); });
console.log('5. middle-band exclusion: scores ' + scM.join(',') + ' | "' + headM + '"');

// 6. Share text shape
const shr = API.shareText(scM, API.encode(scM), API.nearest(scM));
const lines = shr.split('\n');
const bars = lines.filter(l => /[●○]/.test(l));
if (bars.length !== 6) fail('share text has ' + bars.length + ' bars');
bars.forEach(l => {
  const m = l.match(/[●○]+/)[0];
  if (m.length !== 11) fail('bar is ' + m.length + ' slots: ' + l);
  if ((m.match(/●/g) || []).length !== 1) fail('bar has ' + (m.match(/●/g) || []).length + ' markers: ' + l);
});
const cols = bars.map(l => l.indexOf('●') >= 0 ? l.search(/[●○]/) : -1);
if (new Set(cols).size !== 1) fail('bars start at different columns: ' + cols.join(','));
console.log('6. share text:\n' + shr.split('\n').map(l => '     ' + l).join('\n'));

// 7. Left-pole conviction must not read as an empty bar
const leftAll = API.computeScores(API.STATEMENTS.map(s => s.d === -1 ? 2 : -2));
const leftShare = API.shareText(leftAll, API.encode(leftAll), API.nearest(leftAll));
if (/○○○○○○○○○○○/.test(leftShare)) fail('a full left-pole sheet still prints an empty bar');
console.log('7. left-pole sheet: scores ' + leftAll.join(',') + ' | first bar "' + leftShare.split('\n')[1] + '"');

console.log(failures ? '\n' + failures + ' FAILURES' : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
