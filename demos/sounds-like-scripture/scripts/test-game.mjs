/*
 * test-game.mjs — node tests for the pure game logic.
 *
 * The logic lives in one marked block of game.src.html. This extracts that block
 * verbatim and runs it under Node, so the tests exercise exactly the code the
 * page ships, and any DOM reference smuggled into the block fails here first.
 *
 *   node scripts/test-game.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

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
  'RUN_LENGTH', 'TIER_WEIGHT', 'mulberry32', 'dailySeed', 'seedFromRandom', 'wordCount',
  'displayText', 'isInBible', 'workKey', 'fuseFor', 'scoreFor', 'drawRun', 'timeBucket',
  'encodeChallenge', 'decodeChallenge',
  'DAILY_KEY', 'DAILY_KEEP', 'DAY_MS', 'dayIndex', 'dayKey', 'dayNumber', 'keyIndex',
  'msToNextDay', 'countdownText', 'padMarks', 'emptyDaily', 'readDaily', 'recordDaily',
  'streak', 'dailyMarks', 'squaresFromMarks', 'countRight', 'groupNumber', 'streakLine',
  'dailyShareText', 'isTodayHash'
];
const L = new Function('"use strict";' + source + '\nreturn {' + EXPORTS.join(',') + '};')();

const pool = JSON.parse(readFileSync(join(root, 'work', 'fixture-pool.json'), 'utf8'));
const CANONS = ['protestant', 'catholic', 'orthodox'];

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
  const r = L.mulberry32(20260918);
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
  const a1 = [r1(), r1(), r1()], a2 = [r2(), r2(), r2()];
  assert.notDeepEqual(a1, a2);
});

test('dailySeed is the UTC date as yyyymmdd', () => {
  assert.equal(L.dailySeed(new Date(Date.UTC(2026, 8, 18, 23, 59))), 20260918);
  assert.equal(L.dailySeed(new Date(Date.UTC(2027, 0, 1, 0, 0))), 20270101);
});

test('seedFromRandom yields a non-negative 36-base-safe integer', () => {
  for (const x of [0, 0.5, 0.999999]) {
    const s = L.seedFromRandom(x);
    assert.ok(Number.isInteger(s) && s >= 0, 'bad seed ' + s);
    assert.ok(s.toString(36).length <= 8);
  }
});

/* ------------------------------------------------------------------- draw */

test('a draw is ten lines under every canon', () => {
  for (const canon of CANONS) {
    for (let seed = 1; seed <= 60; seed++) {
      const run = L.drawRun(pool, { seed, canon });
      assert.equal(run.length, 10, 'canon ' + canon + ' seed ' + seed);
    }
  }
});

test('the Bible count sits between 3 and 7 under every canon', () => {
  for (const canon of CANONS) {
    const seen = new Set();
    for (let seed = 1; seed <= 200; seed++) {
      const run = L.drawRun(pool, { seed, canon });
      const n = run.filter((it) => L.isInBible(it, canon)).length;
      assert.ok(n >= 3 && n <= 7, 'canon ' + canon + ' seed ' + seed + ' had ' + n);
      seen.add(n);
    }
    assert.ok(seen.size >= 4, 'the count should vary, canon ' + canon + ' saw ' + [...seen].join(','));
  }
});

test('no run repeats a source work, and Scripture only differs by book', () => {
  for (const canon of CANONS) {
    for (let seed = 1; seed <= 200; seed++) {
      const run = L.drawRun(pool, { seed, canon });
      const works = run.map(L.workKey);
      assert.equal(new Set(works).size, works.length, 'repeat in canon ' + canon + ' seed ' + seed);
      const ids = run.map((it) => it.id);
      assert.equal(new Set(ids).size, ids.length, 'repeated id, seed ' + seed);
    }
  }
});

test('workKey strips chapter, verse and section from a citation', () => {
  assert.equal(L.workKey({ ref: 'Proverbs 16:18' }), 'proverbs');
  assert.equal(L.workKey({ ref: '1 Corinthians 13:11' }), '1 corinthians');
  assert.equal(L.workKey({ ref: '1 Enoch 94:1' }), '1 enoch');
  assert.equal(L.workKey({ ref: '1 Clement 7' }), '1 clement');
  assert.equal(L.workKey({ ref: 'Confessions, Book X, ch. 27' }), 'confessions');
  assert.equal(L.workKey({ ref: "The Pilgrim's Progress" }), "the pilgrim's progress");
});

test('the daily draw and a challenge draw are identical for one seed and canon', () => {
  for (const canon of CANONS) {
    const seed = L.dailySeed(new Date(Date.UTC(2026, 8, 18)));
    const daily = L.drawRun(pool, { seed, canon });
    const challenge = L.drawRun(pool, { seed, canon, exclude: [] });
    assert.deepEqual(daily.map((i) => i.id), challenge.map((i) => i.id));
  }
});

test('a seen list changes a free draw but never the daily one', () => {
  const canon = 'protestant';
  const seed = 20260918;
  const plain = L.drawRun(pool, { seed, canon });
  const exclude = plain.slice(0, 4).map((i) => i.id);
  const avoided = L.drawRun(pool, { seed, canon, exclude });
  for (const id of exclude) {
    assert.ok(!avoided.some((i) => i.id === id), 'seen line came back: ' + id);
  }
  assert.deepEqual(L.drawRun(pool, { seed, canon }).map((i) => i.id), plain.map((i) => i.id));
});

test('a seen list covering nearly the pool still yields ten lines', () => {
  const exclude = pool.items.slice(0, pool.items.length - 4).map((i) => i.id);
  const run = L.drawRun(pool, { seed: 7, canon: 'catholic', exclude });
  assert.equal(run.length, 10);
});

test('tier weighting is respected over many draws', () => {
  const count = { 1: 0, 2: 0, 3: 0 };
  for (let seed = 1; seed <= 600; seed++) {
    for (const it of L.drawRun(pool, { seed, canon: 'protestant' })) count[it.tier]++;
  }
  const inPool = { 1: 0, 2: 0, 3: 0 };
  for (const it of pool.items) inPool[it.tier]++;
  const rate = (t) => count[t] / inPool[t];
  assert.ok(rate(3) > rate(2), 'tier 3 should be drawn more often than tier 2');
  assert.ok(rate(2) > rate(1), 'tier 2 should be drawn more often than tier 1');
});

/* ------------------------------------------------------------------ truth */

test('a 66-book line is in the Bible under every canon', () => {
  const item = pool.items.find((i) => i.k === 'b');
  for (const canon of CANONS) assert.equal(L.isInBible(item, canon), true);
});

test('a prose line is in no canon', () => {
  const item = pool.items.find((i) => i.k === 'o');
  for (const canon of CANONS) assert.equal(L.isInBible(item, canon), false);
});

test('a deuterocanonical line follows the canon the player chose', () => {
  const both = pool.items.find((i) => i.k === 'd' && (i.c || []).includes('catholic'));
  assert.equal(L.isInBible(both, 'protestant'), false);
  assert.equal(L.isInBible(both, 'catholic'), true);
  assert.equal(L.isInBible(both, 'orthodox'), true);

  const orthodoxOnly = pool.items.find((i) => i.k === 'd' && !(i.c || []).includes('catholic'));
  assert.equal(L.isInBible(orthodoxOnly, 'protestant'), false);
  assert.equal(L.isInBible(orthodoxOnly, 'catholic'), false);
  assert.equal(L.isInBible(orthodoxOnly, 'orthodox'), true);
});

test('a malformed item is never called Scripture', () => {
  assert.equal(L.isInBible(null, 'protestant'), false);
  assert.equal(L.isInBible({ k: 'd' }, 'orthodox'), false);
});

/* ------------------------------------------------------- fuse and scoring */

test('the fuse is 5 + 0.35 per word, clamped to 8 and 16 seconds', () => {
  assert.equal(L.fuseFor(20), 12);
  assert.ok(Math.abs(L.fuseFor(9) - 8.15) < 1e-9);
  assert.equal(L.fuseFor(1), 8);
  assert.equal(L.fuseFor(0), 8);
  assert.equal(L.fuseFor(34), 16);
  assert.equal(L.fuseFor(120), 16);
  for (let w = 0; w < 200; w++) {
    const f = L.fuseFor(w);
    assert.ok(f >= 8 && f <= 16, 'fuse out of range at ' + w);
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

/* ------------------------------------------------------------ challenge --- */

const BASE = 'https://wiserwalk.com/demos/sounds-like-scripture.html';

function answersOf(spec) {
  return spec.map((s) => (s === null ? { ok: false, secs: null } : { ok: true, secs: s }));
}

test('a challenge link round-trips canon, seed, score and marks', () => {
  const answers = answersOf([1.2, null, 3.5, 0.4, null, 8, 2.5, 17.4, null, 5]);
  for (const canon of CANONS) {
    const link = L.encodeChallenge(BASE, canon, 20260918, 1420, answers);
    assert.ok(link.startsWith(BASE + '#d='), link);
    const back = L.decodeChallenge(link.slice(link.indexOf('#')));
    assert.equal(back.canon, canon);
    assert.equal(back.seed, 20260918);
    assert.equal(back.score, 1420);
    assert.equal(back.marks.length, 10);
    back.marks.forEach((m, i) => {
      assert.equal(m.ok, answers[i].ok, 'mark ' + i);
      if (m.ok) {
        assert.ok(Math.abs(m.secs - answers[i].secs) <= 0.5, 'time bucket drifted at ' + i);
      }
    });
  }
});

test('the ten marks are ten characters, zero for wrong', () => {
  const answers = answersOf([null, null, null, null, null, null, null, null, null, null]);
  const link = L.encodeChallenge('', 'protestant', 1, 0, answers);
  assert.equal(link, '#d=p1.0.0000000000');
});

test('answer times bucket into half seconds, 1 to z', () => {
  assert.equal(L.timeBucket(0.1), 1);
  assert.equal(L.timeBucket(0.5), 1);
  assert.equal(L.timeBucket(0.6), 2);
  assert.equal(L.timeBucket(16), 32);
  assert.equal(L.timeBucket(99), 35);
  assert.equal(L.timeBucket(35).toString(36), 'z');
});

test('a hash without the marker or with junk is ignored', () => {
  const bad = [
    '', '#', '#d=', 'nonsense', '#d=x1.1.0000000000', '#d=p.1.0000000000',
    '#d=p1.1.000000000', '#d=p1.1.00000000000', '#d=p1.1.00000!00000',
    '#d=p1.1', '#d=p1.1.0000000000.extra', '#e=p1.1.0000000000',
    '#d=P1.1.0000000000', '#d=p-1.1.0000000000'
  ];
  for (const h of bad) assert.equal(L.decodeChallenge(h), null, 'accepted ' + JSON.stringify(h));
  assert.equal(L.decodeChallenge(null), null);
  assert.equal(L.decodeChallenge(undefined), null);
  assert.equal(L.decodeChallenge(42), null);
});

test('a decoded challenge replays the same ten lines', () => {
  const answers = answersOf([2, 2, null, 4, 5, 1, null, 3, 3, 6]);
  const link = L.encodeChallenge(BASE, 'orthodox', 987654, 1180, answers);
  const back = L.decodeChallenge(link.slice(link.indexOf('#')));
  const theirs = L.drawRun(pool, { seed: 987654, canon: 'orthodox' });
  const mine = L.drawRun(pool, { seed: back.seed, canon: back.canon });
  assert.deepEqual(mine.map((i) => i.id), theirs.map((i) => i.id));
});

/* ---------------------------------------------------------------- the daily */

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
  const when = new Date(Date.UTC(2026, 8, 21, 9, 0));
  const first = L.recordDaily(store, when, {
    score: 1420, marks: '1111111011', fast: '1010000000', canon: 'protestant'
  });
  assert.equal(first.recorded, true);
  assert.deepEqual(first.record, {
    n: 1, score: 1420, marks: '1111111011', fast: '1010000000', canon: 'p'
  });

  const again = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21, 21, 0)), {
    score: 1900, marks: '1111111111', fast: '1111111111', canon: 'protestant'
  });
  assert.equal(again.recorded, false);
  assert.equal(again.record.score, 1420, 'practice must not overwrite the record');
  assert.equal(JSON.parse(store.written()).days['20260921'].score, 1420);

  const next = L.recordDaily(store, new Date(Date.UTC(2026, 8, 22, 1, 0)), {
    score: 900, marks: '1100000000', fast: '0000000000', canon: 'catholic'
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
  assert.equal(rec.canon, undefined, 'no canon given, none stored');
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

  /* junk keys and junk rows are dropped; the real ones beside them survive */
  const mixed = L.readDaily(fakeStore(JSON.stringify({
    v: 1, days: { 20260921: row(), notaday: row(), 20261301: row(), 20260922: 7 }
  })));
  assert.deepEqual(Object.keys(mixed.days), ['20260921']);
});

test('a store that throws leaves the game working', () => {
  const store = blockedStore();
  assert.deepEqual(L.readDaily(store), { v: 1, days: {} });
  const out = L.recordDaily(store, new Date(Date.UTC(2026, 8, 21)), {
    score: 500, marks: '1111100000', fast: '0000000000', canon: 'orthodox'
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
  /* a streak across a month end, and the whole stored object in place of the map */
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
    { ok: false, timedOut: false, secs: 2 }, { ok: false, timedOut: true, secs: 16 },
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
  const head = 'Sounds Like Scripture #12\n1,420 · 8/10\n⚡✅❌✅⚡✅✅❌✅✅';
  const tail = 'https://wiserwalk.com/play/sounds-like-scripture/#today';

  assert.equal(L.dailyShareText({ ...base, streak: 0 }), head + '\n' + tail);
  assert.equal(L.dailyShareText({ ...base, streak: 1 }), head + '\n' + tail,
    'one day is not a streak, so the line is left out');
  assert.equal(L.dailyShareText({ ...base, streak: 3 }), head + '\nStreak: 3 days\n' + tail);
  assert.equal(L.dailyShareText({ ...base, streak: 3 }).split('\n').length, 5);
  /* no line of the game's text ever travels with a result */
  for (const item of pool.items.slice(0, 40)) {
    assert.ok(!L.dailyShareText({ ...base, streak: 3 }).includes(item.t));
  }
});

test('today\'s ten is the same ten for two players, however they got there', () => {
  const early = new Date(Date.UTC(2026, 8, 21, 0, 5));
  const late = new Date(Date.UTC(2026, 8, 21, 23, 50));
  assert.equal(L.dailySeed(early), L.dailySeed(late));
  assert.equal(L.dayNumber(early), L.dayNumber(late));
  for (const canon of CANONS) {
    const mine = L.drawRun(pool, { seed: L.dailySeed(early), canon, exclude: [] });
    const theirs = L.drawRun(pool, { seed: L.dailySeed(late), canon, exclude: [] });
    assert.deepEqual(mine.map((i) => i.id), theirs.map((i) => i.id));
  }
  /* and the next day is a different ten */
  const tomorrow = L.dailySeed(new Date(Date.UTC(2026, 8, 22, 12)));
  assert.notDeepEqual(
    L.drawRun(pool, { seed: L.dailySeed(early), canon: 'protestant' }).map((i) => i.id),
    L.drawRun(pool, { seed: tomorrow, canon: 'protestant' }).map((i) => i.id));
});

test('the deep link into today never collides with a challenge link', () => {
  for (const h of ['#today', 'today', '#TODAY', ' #today ']) {
    assert.equal(L.isTodayHash(h), true, 'rejected ' + h);
    assert.equal(L.decodeChallenge(h), null);
  }
  for (const h of ['', '#', '#todays', '#d=p1.0.0000000000', null, 42]) {
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

test('the page keeps the pool placeholder and exposes window.__sls', () => {
  assert.ok(page.includes('<script type="application/json" id="pool">/*__POOL__*/</script>'));
  assert.ok(page.includes('window.__sls'));
});

if (process.exitCode) {
  console.error('\n' + passed + ' passed, some failed.');
} else {
  console.log(passed + ' tests passed.');
}
