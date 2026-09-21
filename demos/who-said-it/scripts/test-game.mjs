/*
 * test-game.mjs — node tests for the pure game logic.
 *
 * The logic lives in one marked block of game.src.html. This extracts that block
 * verbatim and runs it under Node, so the tests exercise exactly the code the
 * page ships, and any DOM reference smuggled into the block fails here first.
 *
 *   node scripts/test-game.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
/* The card the site draws is built here, so it is tested here. Importing this runs
   nothing: build-page.mjs only builds when it is the program. */
import { coverFor, coverNames } from './build-page.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const page = readFileSync(join(root, 'game.src.html'), 'utf8');
const START = '/*__LOGIC_START__*/';
const END = '/*__LOGIC_END__*/';
const a = page.indexOf(START);
const b = page.indexOf(END);
assert.ok(a !== -1 && b > a, 'game.src.html must contain the logic markers');
const source = page.slice(a + START.length, b);

const EXPORTS = [
  'RUN_LENGTH', 'OPTION_COUNT', 'TIER_WEIGHT', 'LONG_NAME', 'mulberry32', 'dailySeed',
  'seedFromRandom', 'seedForIndex', 'wordCount', 'displayText', 'fuseFor', 'scoreFor',
  'speakerMap', 'speakerName', 'inConflict', 'hasBook', 'shuffle', 'optionsFor',
  'needsOneColumn', 'speakerKey', 'drawRun', 'timeBucket', 'encodeChallenge',
  'decodeChallenge', 'confusionKey', 'addConfusion', 'topConfusions',
  'DAILY_KEY', 'DAILY_KEEP', 'DAY_MS', 'dayIndex', 'dayKey', 'dayNumber', 'keyIndex',
  'msToNextDay', 'countdownText', 'padMarks', 'emptyDaily', 'readDaily', 'recordDaily',
  'streak', 'dailyMarks', 'squaresFromMarks', 'countRight', 'groupNumber', 'streakLine',
  'dailyShareText', 'isTodayHash'
];
const L = new Function('"use strict";' + source + '\nreturn {' + EXPORTS.join(',') + '};')();

const pool = JSON.parse(readFileSync(join(root, 'work', 'fixture-pool.json'), 'utf8'));
const byId = {};
for (const s of pool.speakers) byId[s.id] = s;

/* The shipped pool and the metadata the site reads, for the card tests at the foot.
   Both are committed, so a missing one is a broken checkout and should fail loudly. */
const realPoolPath = join(root, 'pool.json');
const metaPath = join(root, '..', '..', 'site', 'src', 'games', 'who-said-it.meta.json');
assert.ok(existsSync(realPoolPath), 'pool.json is missing');
assert.ok(existsSync(metaPath), 'the site metadata is missing: run scripts/build-page.mjs');
const realPool = JSON.parse(readFileSync(realPoolPath, 'utf8'));
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));

/* One rng per line, exactly as the page builds it. */
const optionsAt = (item, seed, i) =>
  L.optionsFor(pool, item, L.mulberry32(L.seedForIndex(seed, i)));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error('FAIL  ' + name);
    console.error(err.message);
    process.exitCode = 1;
  }
}

/* ------------------------------------------------------------------- prng */

test('mulberry32 returns values in [0,1)', () => {
  const r = L.mulberry32(20260921);
  for (let i = 0; i < 500; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1, 'out of range: ' + v);
  }
});

test('mulberry32 is deterministic for a seed', () => {
  const x = [], y = [];
  const r1 = L.mulberry32(12345), r2 = L.mulberry32(12345);
  for (let i = 0; i < 50; i++) { x.push(r1()); y.push(r2()); }
  assert.deepEqual(x, y);
});

test('mulberry32 differs between seeds', () => {
  const r1 = L.mulberry32(1), r2 = L.mulberry32(2);
  assert.notDeepEqual([r1(), r1(), r1()], [r2(), r2(), r2()]);
});

test('dailySeed is the UTC date as yyyymmdd', () => {
  assert.equal(L.dailySeed(new Date(Date.UTC(2026, 8, 21, 23, 59))), 20260921);
  assert.equal(L.dailySeed(new Date(Date.UTC(2027, 0, 1, 0, 0))), 20270101);
});

test('seedFromRandom yields a non-negative 36-base-safe integer', () => {
  for (const x of [0, 0.5, 0.999999]) {
    const s = L.seedFromRandom(x);
    assert.ok(Number.isInteger(s) && s >= 0, 'bad seed ' + s);
    assert.ok(s.toString(36).length <= 8);
  }
});

test('seedForIndex is a stable unsigned stream per position', () => {
  for (let i = 0; i < 10; i++) {
    const s = L.seedForIndex(20260921, i);
    assert.equal(s, L.seedForIndex(20260921, i));
    assert.ok(Number.isInteger(s) && s >= 0);
  }
  const all = new Set();
  for (let i = 0; i < 10; i++) all.add(L.seedForIndex(20260921, i));
  assert.equal(all.size, 10, 'each position needs its own stream');
  assert.notEqual(L.seedForIndex(1, 0), L.seedForIndex(2, 0));
});

/* ------------------------------------------------------------------- draw */

test('a run is ten lines', () => {
  for (let seed = 1; seed <= 300; seed++) {
    assert.equal(L.drawRun(pool, { seed }).length, 10, 'seed ' + seed);
  }
});

test('a run never repeats a line or a speaker', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const run = L.drawRun(pool, { seed });
    const ids = run.map(i => i.id);
    const voices = run.map(L.speakerKey);
    assert.equal(new Set(ids).size, ids.length, 'repeated line, seed ' + seed);
    assert.equal(new Set(voices).size, voices.length, 'repeated speaker, seed ' + seed);
  }
});

test('a seen list changes a free draw but never the daily one', () => {
  const seed = 20260921;
  const plain = L.drawRun(pool, { seed });
  const exclude = plain.slice(0, 4).map(i => i.id);
  const avoided = L.drawRun(pool, { seed, exclude });
  for (const id of exclude) {
    assert.ok(!avoided.some(i => i.id === id), 'seen line came back: ' + id);
  }
  assert.deepEqual(L.drawRun(pool, { seed }).map(i => i.id), plain.map(i => i.id));
});

test('a seen list covering nearly the pool still yields ten lines', () => {
  const exclude = pool.items.slice(0, pool.items.length - 4).map(i => i.id);
  const run = L.drawRun(pool, { seed: 7, exclude });
  assert.equal(run.length, 10);
  assert.equal(new Set(run.map(i => i.id)).size, 10, 'a line is never repeated even then');
});

test('tier weighting is respected over many draws', () => {
  const count = { 1: 0, 2: 0, 3: 0 };
  for (let seed = 1; seed <= 600; seed++) {
    for (const it of L.drawRun(pool, { seed })) count[it.tier]++;
  }
  const inPool = { 1: 0, 2: 0, 3: 0 };
  for (const it of pool.items) inPool[it.tier]++;
  const rate = t => count[t] / inPool[t];
  assert.ok(rate(3) > rate(2), 'tier 3 should be drawn more often than tier 2');
  assert.ok(rate(2) > rate(1), 'tier 2 should be drawn more often than tier 1');
});

test('the daily draw and a challenge draw are identical for one seed', () => {
  const seed = L.dailySeed(new Date(Date.UTC(2026, 8, 21)));
  const daily = L.drawRun(pool, { seed });
  const challenge = L.drawRun(pool, { seed, exclude: [] });
  assert.deepEqual(daily.map(i => i.id), challenge.map(i => i.id));
  /* and the four names under every line match too, or the two runs are not the same run */
  daily.forEach((item, i) => {
    assert.deepEqual(optionsAt(item, seed, i).options, optionsAt(challenge[i], seed, i).options);
    assert.equal(optionsAt(item, seed, i).answerAt, optionsAt(challenge[i], seed, i).answerAt);
  });
});

/* ---------------------------------------------------------------- speakers */

test('the fixture pool is shaped the way the game reads it', () => {
  assert.ok(pool.speakers.length >= 4, 'four names need at least four speakers');
  for (const s of pool.speakers) {
    assert.ok(s.id && s.name, 'every speaker needs an id and a display name');
    assert.ok(Array.isArray(s.books), 'every speaker needs a books list');
  }
  for (const it of pool.items) {
    assert.ok(byId[it.sp], 'item ' + it.id + ' names a speaker not in the pool');
    assert.ok(it.ref && it.tr && it.book, 'item ' + it.id + ' is missing a citation field');
  }
});

test('conflicts read in both directions and never name a speaker against itself', () => {
  assert.equal(L.inConflict(pool, 'god', 'jesus'), true);
  assert.equal(L.inConflict(pool, 'jesus', 'god'), true);
  assert.equal(L.inConflict(pool, 'peter', 'disciples'), true);
  assert.equal(L.inConflict(pool, 'disciples', 'peter'), true);
  assert.equal(L.inConflict(pool, 'god', 'god'), true);
  /* Job's friends against each other, and against God and Job, are the point of the game */
  assert.equal(L.inConflict(pool, 'eliphaz', 'bildad'), false);
  assert.equal(L.inConflict(pool, 'eliphaz', 'god'), false);
  assert.equal(L.inConflict(pool, 'eliphaz', 'job'), false);
});

/* ----------------------------------------------------------------- options */

test('every line offers four options, one of them the right answer', () => {
  for (let seed = 1; seed <= 120; seed++) {
    L.drawRun(pool, { seed }).forEach((item, i) => {
      const { options, answerAt } = optionsAt(item, seed, i);
      assert.equal(options.length, 4, 'seed ' + seed + ' line ' + i);
      assert.ok(answerAt >= 0 && answerAt < 4, 'answer out of range');
      assert.equal(options[answerAt].id, item.sp, 'answerAt does not point at the speaker');
      assert.equal(options.filter(o => o.id === item.sp).length, 1, 'the answer appears once');
    });
  }
});

test('the four display names are always distinct', () => {
  for (let seed = 1; seed <= 200; seed++) {
    L.drawRun(pool, { seed }).forEach((item, i) => {
      const names = optionsAt(item, seed, i).options.map(o => o.name);
      assert.equal(new Set(names).size, 4, 'repeated name at seed ' + seed + ' line ' + i);
      for (const n of names) assert.ok(n && n.trim(), 'a blank name was offered');
    });
  }
});

test('no option ever conflicts with the answer', () => {
  for (const item of pool.items) {
    for (let seed = 1; seed <= 40; seed++) {
      for (const o of optionsAt(item, seed, seed % 10).options) {
        if (o.id === item.sp) continue;
        assert.equal(L.inConflict(pool, item.sp, o.id), false,
          o.id + ' was offered beside ' + item.sp);
      }
    }
  }
});

test('the right answer moves around instead of sitting in one slot', () => {
  const at = new Set();
  const run = L.drawRun(pool, { seed: 20260921 });
  for (let seed = 1; seed <= 60; seed++) {
    run.forEach((item, i) => at.add(optionsAt(item, seed, i).answerAt));
  }
  assert.deepEqual([...at].sort(), [0, 1, 2, 3]);
});

test('distractors come from the same book when enough same-book speakers exist', () => {
  /* Eliphaz speaks in Job; God, Job, Bildad and Zophar are all placed in Job and none
     of them conflicts with him, so all three wrong names must come from that book. */
  const item = pool.items.find(i => i.sp === 'eliphaz' && i.book === 'Job');
  assert.ok(item, 'the fixture must hold a line of Eliphaz in Job');
  const roomFor = pool.speakers.filter(s =>
    s.id !== 'eliphaz' && !L.inConflict(pool, 'eliphaz', s.id) && s.books.includes('Job'));
  assert.ok(roomFor.length >= 3, 'the fixture must offer at least three same-book speakers');
  for (let seed = 1; seed <= 200; seed++) {
    for (const o of optionsAt(item, seed, 0).options) {
      if (o.id === item.sp) continue;
      assert.ok(byId[o.id].books.includes('Job'),
        o.id + ' is not in Job but was offered at seed ' + seed);
    }
  }
});

test('when no same-book speaker exists the Testament is preferred', () => {
  /* Moses is the only voice placed in Exodus, so the three names must be Old Testament. */
  const item = pool.items.find(i => i.sp === 'moses');
  assert.ok(item, 'the fixture must hold a line of Moses');
  assert.equal(pool.speakers.filter(s => s.id !== 'moses' && s.books.includes(item.book)).length, 0);
  for (let seed = 1; seed <= 200; seed++) {
    for (const o of optionsAt(item, seed, 3).options) {
      if (o.id === item.sp) continue;
      assert.equal(byId[o.id].testament, 'OT', o.id + ' is not Old Testament, seed ' + seed);
    }
  }
});

test('options are deterministic for a seed and a position', () => {
  const item = pool.items[17];
  for (let i = 0; i < 10; i++) {
    assert.deepEqual(optionsAt(item, 555, i).options, optionsAt(item, 555, i).options);
  }
  assert.notDeepEqual(
    optionsAt(item, 555, 0).options.map(o => o.id).join(),
    optionsAt(item, 556, 0).options.map(o => o.id).join()
  );
});

test('a long name drops the grid to one column', () => {
  assert.equal(L.needsOneColumn([{ name: 'God' }, { name: 'Job' }, { name: 'Peter' }, { name: 'Moses' }]), false);
  assert.equal(L.needsOneColumn([{ name: 'God' }, { name: 'The chief priests and elders' }]), true);
  assert.equal(L.needsOneColumn([{ name: 'x'.repeat(L.LONG_NAME) }]), false);
  assert.equal(L.needsOneColumn([{ name: 'x'.repeat(L.LONG_NAME + 1) }]), true);
});

/* ------------------------------------------------------- fuse and scoring */

test('the fuse is 7 + 0.35 per word, clamped to 10 and 18 seconds', () => {
  assert.equal(L.fuseFor(20), 14);
  assert.equal(L.fuseFor(8), 10);
  assert.equal(L.fuseFor(0), 10);
  assert.ok(Math.abs(L.fuseFor(12) - 11.2) < 1e-9);
  assert.equal(L.fuseFor(34), 18);
  assert.equal(L.fuseFor(200), 18);
  for (let w = 0; w < 300; w++) {
    const f = L.fuseFor(w);
    assert.ok(f >= 10 && f <= 18, 'fuse out of range at ' + w);
  }
});

test('word counts drive the fuse from the real text', () => {
  assert.equal(L.wordCount('one two three'), 3);
  assert.equal(L.wordCount('  spaced   out  '), 2);
  assert.equal(L.wordCount(''), 0);
});

test('a wrong or timed-out line scores nothing', () => {
  assert.equal(L.scoreFor(false, 9, 12, 0), 0);
  assert.equal(L.scoreFor(false, 0, 12, 4), 0);
});

test('a correct line scores 100 plus the speed share plus the streak bonus', () => {
  assert.equal(L.scoreFor(true, 12, 12, 1), 200);
  assert.equal(L.scoreFor(true, 6, 12, 1), 150);
  assert.equal(L.scoreFor(true, 0, 12, 1), 100);
  assert.equal(L.scoreFor(true, 6, 12, 2), 160);
  assert.equal(L.scoreFor(true, 6, 12, 3), 170);
});

test('the streak bonus caps at 50', () => {
  assert.equal(L.scoreFor(true, 0, 10, 6), 150);
  assert.equal(L.scoreFor(true, 0, 10, 10), 150);
  assert.equal(L.scoreFor(true, 0, 10, 99), 150);
});

test('remaining time outside the fuse cannot inflate a score', () => {
  assert.equal(L.scoreFor(true, -3, 10, 1), 100);
  assert.equal(L.scoreFor(true, 40, 10, 1), 200);
});

/* --------------------------------------------------------------- display */

test('LORD and GOD are shown as Lord and God, and nothing else changes', () => {
  assert.equal(L.displayText('The LORD is my portion.'), 'The Lord is my portion.');
  assert.equal(L.displayText("The LORD's hand."), "The Lord's hand.");
  assert.equal(L.displayText('the Lord GOD said'), 'the Lord God said');
  assert.equal(L.displayText('GODLY and LORDSHIP stay.'), 'GODLY and LORDSHIP stay.');
  assert.equal(L.displayText('A plain line of text.'), 'A plain line of text.');
});

test('curly quotes are unified and an enclosing pair is dropped', () => {
  assert.equal(L.displayText('“Placeholder line.”'), 'Placeholder line.');
  assert.equal(L.displayText('"Placeholder line."'), 'Placeholder line.');
  assert.equal(L.displayText('He said "no" and left.'), 'He said "no" and left.');
  assert.equal(L.displayText('It’s here.'), "It's here.");
  /* the whole card is a quotation, so a line quoting inside itself keeps its inner marks */
  assert.equal(L.displayText('"He said "no"."'), 'He said "no".');
});

/* ------------------------------------------------------------ challenge --- */

const BASE = 'https://wiserwalk.com/play/who-said-it/';

function answersOf(spec) {
  return spec.map(s => (s === null ? { ok: false, secs: null } : { ok: true, secs: s }));
}

test('a challenge link round-trips the seed, the score and the marks', () => {
  const answers = answersOf([1.2, null, 3.5, 0.4, null, 8, 2.5, 17.4, null, 5]);
  const link = L.encodeChallenge(BASE, 20260921, 1420, answers);
  assert.ok(link.startsWith(BASE + '#w='), link);
  const back = L.decodeChallenge(link.slice(link.indexOf('#')));
  assert.equal(back.seed, 20260921);
  assert.equal(back.score, 1420);
  assert.equal(back.marks.length, 10);
  back.marks.forEach((m, i) => {
    assert.equal(m.ok, answers[i].ok, 'mark ' + i);
    if (m.ok) assert.ok(Math.abs(m.secs - answers[i].secs) <= 0.5, 'time bucket drifted at ' + i);
  });
});

test('the challenge prefix is this game and not the sibling', () => {
  const link = L.encodeChallenge('', 1, 0, answersOf(new Array(10).fill(null)));
  assert.equal(link, '#w=1.0.0000000000');
  assert.equal(L.decodeChallenge('#d=p1.0.0000000000'), null, 'a sibling link must not decode here');
});

test('answer times bucket into half seconds, 1 to z', () => {
  assert.equal(L.timeBucket(0.1), 1);
  assert.equal(L.timeBucket(0.5), 1);
  assert.equal(L.timeBucket(0.6), 2);
  assert.equal(L.timeBucket(18), 35);
  assert.equal(L.timeBucket(99), 35);
  assert.equal(L.timeBucket(35).toString(36), 'z');
});

test('a hash without the marker or with junk is ignored', () => {
  const bad = [
    '', '#', '#w=', 'nonsense', '#w=.1.0000000000', '#w=1.1.000000000',
    '#w=1.1.00000000000', '#w=1.1.00000!00000', '#w=1.1', '#w=1.1.0000000000.extra',
    '#x=1.1.0000000000', '#w=1.1.000000000A', '#w=-1.1.0000000000',
    '#w=123456789.1.0000000000'
  ];
  for (const h of bad) assert.equal(L.decodeChallenge(h), null, 'accepted ' + JSON.stringify(h));
  assert.equal(L.decodeChallenge(null), null);
  assert.equal(L.decodeChallenge(undefined), null);
  assert.equal(L.decodeChallenge(42), null);
});

test('a decoded challenge replays the same ten lines and the same four names', () => {
  const answers = answersOf([2, 2, null, 4, 5, 1, null, 3, 3, 6]);
  const link = L.encodeChallenge(BASE, 987654, 1180, answers);
  const back = L.decodeChallenge(link.slice(link.indexOf('#')));
  const theirs = L.drawRun(pool, { seed: 987654 });
  const mine = L.drawRun(pool, { seed: back.seed });
  assert.deepEqual(mine.map(i => i.id), theirs.map(i => i.id));
  mine.forEach((item, i) => {
    assert.deepEqual(optionsAt(item, back.seed, i).options, optionsAt(theirs[i], 987654, i).options);
  });
});

/* ------------------------------------------------------------ confusions -- */

test('a confusion pair is directed and counted', () => {
  let t = {};
  t = L.addConfusion(t, 'eliphaz', 'god');
  t = L.addConfusion(t, 'eliphaz', 'god');
  t = L.addConfusion(t, 'god', 'eliphaz');
  assert.equal(t[L.confusionKey('eliphaz', 'god')], 2);
  assert.equal(t[L.confusionKey('god', 'eliphaz')], 1);
});

test('the tally is never mutated in place and survives junk', () => {
  const before = { 'a>b': 1 };
  const after = L.addConfusion(before, 'a', 'b');
  assert.equal(before['a>b'], 1, 'the stored object must not be edited under the caller');
  assert.equal(after['a>b'], 2);
  assert.deepEqual(L.addConfusion(null, 'a', 'b'), { 'a>b': 1 });
  assert.deepEqual(L.addConfusion({ 'a>b': 'nonsense' }, 'a', 'b'), { 'a>b': 1 });
  /* a right answer, or a missing pick, is not a confusion */
  assert.deepEqual(L.addConfusion({}, 'a', 'a'), {});
  assert.deepEqual(L.addConfusion({}, 'a', null), {});
});

test('the mix list is ordered by count and then stably by pair', () => {
  const tally = { 'a>b': 3, 'c>d': 5, 'e>f': 3, 'g>h': 0, bad: 9, 'x>': 4 };
  const rows = L.topConfusions(tally, 8);
  assert.deepEqual(rows, [
    { truth: 'c', picked: 'd', n: 5 },
    { truth: 'a', picked: 'b', n: 3 },
    { truth: 'e', picked: 'f', n: 3 }
  ]);
  assert.equal(L.topConfusions(tally, 1).length, 1);
  assert.deepEqual(L.topConfusions(null, 8), []);
  assert.deepEqual(L.topConfusions('nonsense', 8), []);
});

test('a name outside the pool still prints as something', () => {
  assert.equal(L.speakerName(pool, 'eliphaz'), 'Eliphaz');
  assert.equal(L.speakerName(pool, 'gone'), 'gone');
});

/* ---------------------------------------------------------------- the daily
   The same contract as the sibling game, tested the same way, because the site
   reads both stores through one rule. */

const DAY = 86400000;
const keyAt = (base, offset) => L.dayKey(new Date(base + offset * DAY));

/* A store the tests own: the same two methods the browser's is used through. */
function fakeStore(seed) {
  let value = seed === undefined ? null : seed;
  return {
    getItem() { return value; },
    setItem(key, v) { value = v; },
    written() { return value; }
  };
}

/* Storage blocked, as in a private window: every call throws. */
function blockedStore() {
  return {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  };
}

const row = (extra) => Object.assign(
  { n: 1, score: 100, marks: '1111100000', fast: '0000000000' }, extra || {});

test('the daily is stored under this game\'s own key', () => {
  assert.equal(L.DAILY_KEY, 'wsi.daily');
});

test('day one is 2026-09-21 and the number turns at UTC midnight', () => {
  assert.equal(L.dayNumber(new Date(Date.UTC(2026, 8, 21))), 1);
  assert.equal(L.dayNumber(new Date(Date.UTC(2026, 8, 21, 23, 59, 59, 999))), 1);
  assert.equal(L.dayNumber(new Date(Date.UTC(2026, 8, 22))), 2);
  assert.equal(L.dayNumber(new Date(Date.UTC(2026, 8, 22, 0, 0, 0, 1))), 2);
  assert.equal(L.dayNumber(new Date(Date.UTC(2026, 9, 21))), 31);
  assert.equal(L.dayNumber(new Date(Date.UTC(2027, 8, 21))), 366);
});

test('the day key is the UTC date as yyyymmdd, and matches the run seed', () => {
  const d = new Date(Date.UTC(2026, 8, 21, 22, 30));
  assert.equal(L.dayKey(d), '20260921');
  assert.equal(L.dayKey(new Date(Date.UTC(2026, 11, 5))), '20261205');
  assert.equal(String(L.dailySeed(d)), L.dayKey(d));
  assert.equal(L.keyIndex('20260921'), L.dayIndex(d));
  for (const junk of ['', 'x', '2026092', '202609211', '20261301', '20260230', null]) {
    assert.equal(L.keyIndex(junk), null, 'accepted ' + junk);
  }
});

test('only the first completed run of a day is recorded', () => {
  const store = fakeStore();
  const first = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21, 9, 0)), {
    score: 1420, marks: '1111111011', fast: '1010000000'
  });
  assert.equal(first.recorded, true);
  assert.deepEqual(first.record, { n: 1, score: 1420, marks: '1111111011', fast: '1010000000' });

  const again = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21, 21, 0)), {
    score: 1900, marks: '1111111111', fast: '1111111111'
  });
  assert.equal(again.recorded, false);
  assert.equal(again.record.score, 1420, 'practice must not overwrite the record');
  assert.equal(JSON.parse(store.written()).days['20260921'].score, 1420);

  const next = L.recordDaily(store, new Date(Date.UTC(2026, 8, 22, 1, 0)), {
    score: 900, marks: '1100000000', fast: '0000000000'
  });
  assert.equal(next.recorded, true);
  assert.equal(next.record.n, 2);
  assert.equal(Object.keys(JSON.parse(store.written()).days).length, 2);
});

test('a malformed score or marks is fixed, never stored as given', () => {
  const store = fakeStore();
  const rec = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21)), {
    score: -5, marks: '11', fast: 'xxxxxxxxxxxxxx'
  }).record;
  assert.equal(rec.score, 0);
  assert.equal(rec.marks, '1100000000');
  assert.equal(rec.fast, '0000000000');
  assert.equal(rec.canon, undefined, 'this game has no canon to store');
  assert.equal(L.padMarks('1'.repeat(40)).length, 10);
});

test('the store keeps at most four hundred days', () => {
  const today = Date.UTC(2027, 5, 1);
  const days = {};
  for (let i = 400; i >= 1; i--) days[keyAt(today, -i)] = row();
  const store = fakeStore(JSON.stringify({ v: 1, days }));

  const out = L.recordDaily(store, new Date(today), { score: 10, marks: '1000000000', fast: '' });
  const keys = Object.keys(out.days.days);
  assert.equal(keys.length, L.DAILY_KEEP);
  assert.ok(!keys.includes(keyAt(today, -400)), 'the oldest day should have gone');
  assert.ok(keys.includes(keyAt(today, -399)), 'the next oldest should have stayed');
  assert.ok(keys.includes(L.dayKey(new Date(today))), 'today should be there');
  assert.equal(Object.keys(JSON.parse(store.written()).days).length, L.DAILY_KEEP);
});

test('a malformed store reads as empty and is never thrown over', () => {
  const empty = { v: 1, days: {} };
  assert.deepEqual(L.readDaily(fakeStore()), empty);
  assert.deepEqual(L.readDaily(fakeStore('')), empty);
  assert.deepEqual(L.readDaily(fakeStore('{oh no')), empty);
  assert.deepEqual(L.readDaily(fakeStore('null')), empty);
  assert.deepEqual(L.readDaily(fakeStore('[]')), empty);
  assert.deepEqual(L.readDaily(fakeStore('"a string"')), empty);
  assert.deepEqual(L.readDaily(fakeStore(JSON.stringify({ v: 2, days: { 20260921: row() } }))), empty,
    'a version this code does not know is not read');
  assert.deepEqual(L.readDaily(fakeStore(JSON.stringify({ v: 1 }))), empty);
  assert.deepEqual(L.readDaily(fakeStore(JSON.stringify({ v: 1, days: 'no' }))), empty);
  assert.deepEqual(L.readDaily(null), empty);

  const mixed = L.readDaily(fakeStore(JSON.stringify({
    v: 1, days: { 20260921: row(), notaday: row(), 20261301: row(), 20260922: 7 }
  })));
  assert.deepEqual(Object.keys(mixed.days), ['20260921']);
});

test('a store that throws leaves the game working', () => {
  const store = blockedStore();
  assert.deepEqual(L.readDaily(store), { v: 1, days: {} });
  const out = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21)), {
    score: 500, marks: '1111100000', fast: '0000000000'
  });
  assert.equal(out.recorded, true, 'the run still counts for this session');
  assert.equal(out.record.score, 500);
  assert.deepEqual(L.streak(out.days.days, new Date(Date.UTC(2026, 8, 21))), { current: 1, best: 1 });
});

test('a streak runs to today or yesterday, and a gap simply starts it again', () => {
  const today = Date.UTC(2026, 8, 30);
  const at = new Date(today);
  const days = (...offsets) => {
    const d = {};
    for (const o of offsets) d[keyAt(today, o)] = row();
    return d;
  };
  assert.deepEqual(L.streak(days(0), at), { current: 1, best: 1 });
  assert.deepEqual(L.streak(days(-1), at), { current: 1, best: 1 });
  assert.deepEqual(L.streak(days(-2), at), { current: 0, best: 1 });
  assert.deepEqual(L.streak(days(0, -1, -2), at), { current: 3, best: 3 });
  assert.deepEqual(L.streak(days(-1, -2, -3), at), { current: 3, best: 3 });
  assert.deepEqual(L.streak(days(0, -1, -3, -4, -5, -6), at), { current: 2, best: 4 });
  assert.deepEqual(L.streak(days(-4, -5, -6), at), { current: 0, best: 3 });
  assert.deepEqual(L.streak({}, at), { current: 0, best: 0 });
  assert.deepEqual(L.streak(null, at), { current: 0, best: 0 });
  const turn = Date.UTC(2026, 9, 1);
  assert.deepEqual(
    L.streak({ v: 1, days: { [keyAt(turn, 0)]: row(), [keyAt(turn, -1)]: row() } }, new Date(turn)),
    { current: 2, best: 2 });
});

test('the countdown runs to the next UTC midnight', () => {
  assert.equal(L.msToNextDay(new Date(Date.UTC(2026, 8, 21, 0, 0, 0))), DAY);
  assert.equal(L.msToNextDay(new Date(Date.UTC(2026, 8, 21, 23, 59, 59, 0))), 1000);
  assert.equal(L.msToNextDay(new Date(Date.UTC(2026, 8, 21, 16, 48, 0))), (7 * 60 + 12) * 60000);
  assert.equal(L.countdownText((7 * 60 + 12) * 60000), '7h 12m');
  assert.equal(L.countdownText(60 * 60000), '1h 0m');
  assert.equal(L.countdownText(12 * 60000 + 30000), '12m');
  assert.equal(L.countdownText(59000), 'under a minute');
  assert.equal(L.countdownText(0), 'under a minute');
  assert.equal(L.countdownText(-5000), 'under a minute');
});

test('the squares and the count come from the two stored strings', () => {
  assert.equal(L.squaresFromMarks('1101111011', '1000100000'), '⚡✅❌✅⚡✅✅❌✅✅');
  assert.equal(L.countRight('1101111011'), 8);
  assert.equal(L.countRight('0000000000'), 0);
  assert.equal(L.squaresFromMarks('', ''), '❌❌❌❌❌❌❌❌❌❌');
  const answers = [
    { ok: true, timedOut: false, secs: 1.2 }, { ok: true, timedOut: false, secs: 4 },
    { ok: false, timedOut: false, secs: 2 }, { ok: false, timedOut: true, secs: 18 },
    { ok: true, timedOut: false, secs: 2.9 }, { ok: true, timedOut: false, secs: 3 },
    { ok: true, timedOut: false, secs: 9 }, { ok: true, timedOut: false, secs: 5 },
    { ok: true, timedOut: false, secs: 6 }, { ok: true, timedOut: false, secs: 7 }
  ];
  /* "fast" is what the contract says: answered under three seconds, right or wrong.
     A wrong answer still prints as a cross, so line three carries no bolt. */
  assert.deepEqual(L.dailyMarks(answers), { marks: '1100111111', fast: '1010100000' });
  assert.equal(L.squaresFromMarks('1100111111', '1010100000').charAt(2), '❌');
  assert.deepEqual(L.dailyMarks([]), { marks: '0000000000', fast: '0000000000' });
});

test('thousands separators do not depend on where the copy happened', () => {
  assert.equal(L.groupNumber(0), '0');
  assert.equal(L.groupNumber(999), '999');
  assert.equal(L.groupNumber(1420), '1,420');
  assert.equal(L.groupNumber(1234567), '1,234,567');
  assert.equal(L.streakLine(1), 'Streak: 1 day');
  assert.equal(L.streakLine(3), 'Streak: 3 days');
});

test('the copied daily names the day, the score, the squares and the way back in', () => {
  const base = { n: 12, score: 1420, marks: '1101111011', fast: '1000100000' };
  const head = 'Who Said It? #12\n1,420 · 8/10\n⚡✅❌✅⚡✅✅❌✅✅';
  const tail = 'https://wiserwalk.com/play/who-said-it/#today';

  assert.equal(L.dailyShareText({ ...base, streak: 0 }), head + '\n' + tail);
  assert.equal(L.dailyShareText({ ...base, streak: 1 }), head + '\n' + tail,
    'one day is not a streak, so the line is left out');
  assert.equal(L.dailyShareText({ ...base, streak: 3 }), head + '\nStreak: 3 days\n' + tail);
  assert.equal(L.dailyShareText({ ...base, streak: 3 }).split('\n').length, 5);
  /* no line of the game's text, and no speaker's name, travels with a result */
  const text = L.dailyShareText({ ...base, streak: 3 });
  for (const item of pool.items.slice(0, 40)) assert.ok(!text.includes(item.t));
  for (const s of pool.speakers) assert.ok(!text.includes(s.name), 'a speaker is named: ' + s.name);
});

test('today\'s ten is the same ten for two players, however they got there', () => {
  const early = new Date(Date.UTC(2026, 8, 21, 0, 5));
  const late = new Date(Date.UTC(2026, 8, 21, 23, 50));
  assert.equal(L.dailySeed(early), L.dailySeed(late));
  assert.equal(L.dayNumber(early), L.dayNumber(late));

  const mine = L.drawRun(pool, { seed: L.dailySeed(early), exclude: [] });
  const theirs = L.drawRun(pool, { seed: L.dailySeed(late), exclude: [] });
  assert.deepEqual(mine.map((i) => i.id), theirs.map((i) => i.id));
  /* and the same four names under each line, in the same order */
  for (let i = 0; i < mine.length; i++) {
    assert.deepEqual(
      optionsAt(mine[i], L.dailySeed(early), i).options.map((o) => o.id),
      optionsAt(theirs[i], L.dailySeed(late), i).options.map((o) => o.id));
  }
  const tomorrow = L.dailySeed(new Date(Date.UTC(2026, 8, 22, 12)));
  assert.notDeepEqual(mine.map((i) => i.id), L.drawRun(pool, { seed: tomorrow }).map((i) => i.id));
});

test('the deep link into today never collides with a challenge link', () => {
  for (const h of ['#today', 'today', '#TODAY', ' #today ']) {
    assert.equal(L.isTodayHash(h), true, 'rejected ' + h);
    assert.equal(L.decodeChallenge(h), null);
  }
  for (const h of ['', '#', '#todays', '#w=1.0.0000000000', null, 42]) {
    assert.equal(L.isTodayHash(h), false, 'accepted ' + h);
  }
});

/* ------------------------------------------------------------ page shape -- */

test('the shipped page never calls requestAnimationFrame', () => {
  assert.ok(!/requestAnimationFrame/.test(page), 'requestAnimationFrame found in game.src.html');
});

test('the logic block touches no browser object', () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/\b(document|window|localStorage|sessionStorage|navigator|location|performance|setTimeout)\b/.test(code),
    'the logic block must stay pure');
});

test('the page keeps the pool placeholder and exposes window.__wsi', () => {
  assert.ok(page.includes('<script type="application/json" id="pool">/*__POOL__*/</script>'));
  assert.ok(page.includes('window.__wsi'));
  assert.ok(!page.includes('window.__sls'), 'the sibling game owns that name');
});

test('storage keys cannot collide with the sibling game', () => {
  const keys = page.match(/'(wsi|sls)\.[a-z]+'/g) || [];
  assert.ok(keys.length >= 3, 'the storage keys should be visible in the page');
  for (const k of keys) assert.ok(k.startsWith("'wsi."), 'foreign storage key ' + k);
});

test('the swap points the site route needs are present', () => {
  assert.ok(page.includes('<p class="band-chip">A wiserwalk game</p>'));
  assert.ok(page.includes('<p class="small foot" id="footResult"></p>'));
});

/* ----------------------------------------------------------- the site card -- */

/*
 * The card on /games/ and on the home page shows one real line and the four real
 * names under it. These tests are the guard on the one thing that could go wrong
 * there: the card saying, by order or by what it stores, which name is right.
 */

test('the four names are four, distinct, sorted, and include the speaker', () => {
  const byName = {};
  for (const s of realPool.speakers) byName[s.id] = s.name;

  /* every item that can make a card, not only the one the card uses */
  let checked = 0;
  for (const item of realPool.items) {
    const names = coverNames(realPool, item);
    if (!names) continue;
    checked++;
    assert.equal(names.length, 4, item.id + ' must offer four names');
    assert.equal(new Set(names).size, 4, item.id + ' repeats a name');
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'en')),
      item.id + ' is not in alphabetical order');
    assert.ok(names.includes(byName[item.sp]),
      item.id + ' leaves the real speaker out of its own question');
    if (checked > 200) break;
  }
  assert.ok(checked > 100, 'too few items could make a card to test anything');
});

test('the chosen cover is a real line, hardest tier, a named individual speaking', () => {
  const cover = coverFor(realPool);
  assert.ok(cover, 'the real pool must yield a cover');
  const item = realPool.items.find(i => i.id === cover.id);
  assert.ok(item, 'the cover must come from an item in the pool');
  assert.equal(item.tier, Math.max(...realPool.items.map(i => i.tier || 0)));
  assert.equal(cover.text, L.displayText(item.t),
    'the cover text must be the game’s own display of the verbatim line');
  const speaker = realPool.speakers.find(s => s.id === item.sp);
  assert.match(speaker.name, /^[A-Z][A-Za-z'-]*$/, 'the cover speaker must be a named individual');
  assert.deepEqual(cover.names, coverNames(realPool, item));
});

test('the cover choice does not move on its own', () => {
  assert.deepEqual(coverFor(realPool), coverFor(realPool));
});

test('the published metadata never says which name is right', () => {
  const cover = coverFor(realPool);
  assert.equal(meta.cover, cover.text, 'site meta is stale: rerun scripts/build-page.mjs');
  assert.deepEqual(meta.coverNames, cover.names, 'site meta is stale: rerun scripts/build-page.mjs');

  const speaker = realPool.speakers.find(
    s => s.id === realPool.items.find(i => i.id === cover.id).sp).name;
  /* the speaker's name may appear once, as one of the four; nothing else in the file
     may point at it, and no key may hint at an answer */
  const keys = Object.keys(meta);
  for (const k of keys) {
    assert.ok(!/answer|correct|truth|speaker(?!s$)|said/i.test(k),
      'metadata key "' + k + '" would tell the card the answer');
  }
  assert.equal(meta.coverNames.filter(n => n === speaker).length, 1);
  const rest = JSON.stringify({ ...meta, coverNames: undefined });
  assert.ok(!rest.includes(speaker), 'the speaker is named outside the four options');
  assert.equal(typeof meta.speakers, 'number', 'speakers is the count, not a name');
});

test('a fixture pool offers no cover and no names', () => {
  assert.equal(coverFor({ speakers: [], items: [] }), null);
  assert.equal(coverNames(pool, { sp: 'nobody', book: 'JOB' }), null);
});

if (process.exitCode) {
  console.error('\n' + passed + ' passed, some failed.');
} else {
  console.log(passed + ' tests passed.');
}
