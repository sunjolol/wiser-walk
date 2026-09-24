// Draft 1 of quiz #4: builds the who-stands-where table from research/topics/*.json.
// Each statement points at one researched claim; `flip` means agreeing with the statement = disagreeing with the claim.
// Cells: +2/+1 agree, 0 a deliberate middle view, -1/-2 disagree, absent = not on record. OVERRIDE settles people with
// two stances (a change of mind) and codes middle views that lean one way on this wording.
import { readFileSync, writeFileSync } from 'node:fs';
const T = k => JSON.parse(readFileSync(new URL(`./research/topics/${k}.json`, import.meta.url), 'utf8'));

export const POOL = {
  augustine: 'Augustine of Hippo', chrysostom: 'John Chrysostom', tertullian: 'Tertullian', jerome: 'Jerome',
  clement: 'Clement of Alexandria', ambrose: 'Ambrose of Milan', gregory: 'Gregory the Great', basil: 'Basil the Great',
  nazianzen: 'Gregory of Nazianzus', nyssa: 'Gregory of Nyssa', lactantius: 'Lactantius', origen: 'Origen',
  cyprian: 'Cyprian of Carthage', antony: 'Antony the Great', cassian: 'John Cassian', isaac: 'Isaac the Syrian',
  macrina: 'Macrina the Younger', justin: 'Justin Martyr', irenaeus: 'Irenaeus of Lyons', martin: 'Martin of Tours',
  benedict: 'Benedict of Nursia', athanasius: 'Athanasius', boethius: 'Boethius', poemen: 'Poemen',
  climacus: 'John Climacus', ephrem: 'Ephrem the Syrian', hilary: 'Hilary of Poitiers',
};

export const STATEMENTS = [
  ['learning', 'learning:a', 0, 'Wisdom is worth learning from anyone, even people who don\'t share your faith.'],
  ['surplus', 'wealth:a', 0, 'If you have more than you need while others go without, the extra really belongs to them.'],
  ['rich', 'wealth:b', 0, 'There\'s nothing wrong with being rich, as long as you use it well.'],
  ['alone', 'solitude:a', 0, 'You grow closer to God alone and in quiet than among other people.'],
  ['lie', 'lying:a', 0, 'Lying can be the right thing to do if it protects someone.'],
  ['anger', 'anger:a', 0, 'Anger at real wrongdoing can be a good thing.'],
  ['tears', 'grief:a', 0, 'Even if you believe you\'ll see them again, it\'s right to weep openly for someone you\'ve lost.'],
  ['laugh', 'enjoyment:a', 0, 'A good hearty laugh is good for the soul.'],
  ['mystery', 'questioning:a', 1, 'Some questions about God are better left alone.'],
  ['deeper', 'scripture-sense:a', 0, 'Many Bible stories matter more for their deeper meaning than for what literally happened.'],
  ['tell', 'correction:a', 0, 'If someone you know is doing wrong, it\'s your job to tell them.'],
  ['all', 'universal-salvation:a', 0, 'In the end, God will save everyone.'],
  ['unheard', 'unevangelized:a', 0, 'Good people who never heard of Jesus can still be saved.'],
  ['effort', 'grace-effort:a', 0, 'Becoming a good person is mostly up to you.'],
  ['war', 'war:a', 0, 'A Christian can fight in a just war with a clear conscience.'],
  ['rulers', 'state-religion:b', 0, 'Governments should use their power to support the Christian faith.'],
  ['places', 'pilgrimage:a', 1, 'God is no closer in a holy place than in your own home.'],
  ['nature', 'creation:a', 0, 'You can learn as much about God from nature as from books.'],
  ['body', 'asceticism:a', 0, 'Your body is a friend to look after, not an enemy to fight.'],
  ['pure', 'pure-church:a', 0, 'A church should put out members who won\'t live by its standards.'],
  ['dreams', 'signs:b', 0, 'God still speaks to people through dreams.'],
  ['calling', 'family-calling:a', 0, 'If you believe God is calling you, follow, even if your family begs you not to.'],
  ['quiet', 'silence:a', 0, 'Most of the time, it\'s better to say less.'],
  ['office', 'office:a', 0, 'Christians should seek positions of power in government.'],
  ['miracles', 'signs:a', 0, 'Miracles still happen today, just as they did in the Bible.'],
  ['calm', 'emotions:a', 0, 'The goal is a calm heart that strong feelings can\'t shake.'],
];

// [statementId, poolKey] -> value on the STATEMENT's own scale (after any flip), or null to leave off the record.
export const OVERRIDE = {
  'alone basil': -2, 'alone jerome': 1, 'alone cassian': 1,
  'learning jerome': 2,
  'mystery irenaeus': 2, 'mystery nazianzen': 1, 'mystery isaac': 1,
  'tears ambrose': 1, 'tears augustine': 1, 'tears nyssa': 1, 'tears basil': 1, 'tears nazianzen': 1, 'tears gregory': 1,
  'tears cassian': null,
  'anger ambrose': 1, 'anger jerome': 1,
  // people-test-1 judges: Basil held God's essence beyond us (lean agree); Tertullian's +1 on laughter was mockery of
  // heretics; Jerome wept in the very letter that rebukes Paula; Lactantius's signature view is that faith cannot be forced.
  'mystery basil': null, 'mystery hilary': null, 'mystery nyssa': null, 'laugh tertullian': null, 'tears jerome': -1, 'rulers lactantius': null, 'calm cyprian': null,
  // 'nature' now names the Bible outright (draft 3): only Antony and Isaac put creation level with Scripture.
  'nature chrysostom': 1, 'nature augustine': 1, 'nature cassian': null, 'nature boethius': null,
  'deeper augustine': 0, 'deeper jerome': 0, 'all jerome': -2, 'effort augustine': -2, 'places jerome': -1, 'dreams jerome': null,
  // Verification pass (VERIFY.md). 'pure' now says "keep out people who openly live in serious wrongdoing", and the
  // Fathers who fought the pure-church sects still barred open, unrepentant sinners: Augustine and Jerome lean against,
  // Ambrose kept Theodosius from the Eucharist, Gregory of Nazianzus took the middle line, and Antony's saying is about
  // taking back a brother who repented. If 'pure' is ever reworded back to the research claim (a church only for those
  // who live up to its standards), drop this line: the research codes fit that wording.
  'pure augustine': -1, 'pure jerome': -1, 'pure ambrose': 1, 'pure nazianzen': 0, 'pure antony': null,
};

const side = s => (s.side === 'agree' ? 1 : s.side === 'disagree' ? -1 : 0) * (s.side === 'mixed' ? 0 : s.strength);
export function build() {
  const cells = {}; const flags = [];
  for (const [id, ref, flip] of STATEMENTS) {
    const [key, cid] = ref.split(':'); const t = T(key);
    for (const [pk, name] of Object.entries(POOL)) {
      const ss = t.stances.filter(s => s.claim === cid && s.person === name);
      const o = OVERRIDE[`${id} ${pk}`];
      if (o !== undefined) { if (o !== null) (cells[id] ??= {})[pk] = { v: o, s: ss[ss.length - 1] || null }; continue; }
      if (!ss.length) continue;
      if (ss.length > 1) flags.push(`${id} ${pk}: ${ss.length} stances (${ss.map(s => s.side + s.strength).join(', ')})`);
      const s = ss[ss.length - 1];
      (cells[id] ??= {})[pk] = { v: side(s) * (flip ? -1 : 1), s };
    }
  }
  return { cells, flags };
}

if (process.argv[1] && process.argv[1].endsWith('table.mjs')) {
  const { cells, flags } = build();
  console.log('FLAGS (two stances, need an override):\n  ' + flags.join('\n  '));
  const pk = Object.keys(POOL);
  console.log('\n' + 'stmt'.padEnd(9) + pk.map(k => k.slice(0, 4).padStart(5)).join('') + '   +/-');
  for (const [id] of STATEMENTS) {
    const row = cells[id] || {};
    const vals = pk.map(k => (row[k] ? String(row[k].v) : '.').padStart(5)).join('');
    const pos = Object.values(row).filter(c => c.v > 0).length, neg = Object.values(row).filter(c => c.v < 0).length;
    console.log(id.padEnd(9) + vals + `   ${pos}/${neg}`);
  }
  console.log('\ncoverage (non-zero / any):');
  console.log(pk.map(k => `${k} ${STATEMENTS.filter(([id]) => cells[id]?.[k] && cells[id][k].v !== 0).length}/${STATEMENTS.filter(([id]) => cells[id]?.[k]).length}`).join(', '));
}
