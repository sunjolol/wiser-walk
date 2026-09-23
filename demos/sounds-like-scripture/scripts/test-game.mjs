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
import { checkCapitals, readCapitals, applyCapitals } from './capitals.mjs';

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
  'displayText', 'shownText', 'isInBible', 'workKey', 'fuseFor', 'scoreFor', 'drawRun', 'timeBucket',
  'encodeChallenge', 'decodeChallenge'
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

/* ------------------------------------------------------- capitals for God */

test('a line with a capitalised display text shows it, through the same display rule', () => {
  assert.equal(L.shownText({ t: 'Placeholder: the LORD and his word.', d: 'Placeholder: the LORD and His word.' }),
    'Placeholder: the Lord and His word.');
  assert.equal(L.shownText({ t: 'Placeholder: the LORD and his word.' }), 'Placeholder: the Lord and his word.');
});

test('the capitals guard allows nothing but raising a pronoun for God', () => {
  assert.equal(checkCapitals('Placeholder: he and thee.', 'Placeholder: He and Thee.'), null);
  /* this game only: first person too, for a divine speaker */
  assert.equal(checkCapitals('Placeholder: my word to me.', 'Placeholder: My word to Me.'), null);
  assert.ok(checkCapitals('Placeholder: he said.', 'Placeholder: he said.'), 'an entry that changes nothing');
  assert.ok(checkCapitals('Placeholder: the king.', 'Placeholder: the King.'), 'a word outside the pronoun list');
  assert.ok(checkCapitals('Placeholder: he said.', 'Placeholder: He says.'), 'a changed word');
  assert.ok(checkCapitals('Placeholder: he said.', 'Placeholder: HE said.'), 'more than the first letter');
  assert.ok(checkCapitals('Placeholder: He said.', 'Placeholder: he said.'), 'a capital lowered');
  assert.ok(checkCapitals('Placeholder: he said.', 'Placeholder: He said!'), 'changed punctuation');
  assert.ok(checkCapitals('Placeholder: he said.', 'Placeholder:  He said.'), 'changed spacing');
});

test('every capitalised line differs from its verbatim text only in pronouns for God', () => {
  const real = JSON.parse(readFileSync(join(root, 'pool.json'), 'utf8'));
  const caps = readCapitals(join(root, 'capitals.json'));
  const ids = Object.keys(caps.lines);
  assert.ok(ids.length > 0, 'capitals.json is missing or empty');
  assert.equal(applyCapitals(real, caps), ids.length);   /* throws on any bad entry */
  for (const it of real.items) {
    if (!it.d) continue;
    /* and still only those capitals once the page's own display rules have run */
    const why = checkCapitals(L.displayText(it.t), L.shownText(it));
    assert.equal(why, null, it.id + ': ' + why);
  }
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
