// Builds the Psalm quiz tap-through preview from the draft tree and the BSB text.
// node design/quiz-ideas/psalm/preview/build.mjs [out.html]  (default: psalm-quiz.html beside this file; gitignored)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)) + '/';
const out = process.argv[2] || here + 'psalm-quiz.html';
const tree = JSON.parse(readFileSync(resolve(here, '../tree.json'), 'utf8'));
const bsb = JSON.parse(readFileSync(here + 'psalms-bsb.json', 'utf8'));
const tpl = readFileSync(here + 'template.html', 'utf8');

// Only the psalms a result can print, each with its own superscription (Scripture) and verses.
const need = new Set();
for (const o of Object.values(tree.outcomes)) {
  need.add(o.psalm);
  (o.set || []).forEach(n => need.add(n));
}
const psalms = {};
for (const n of [...need].sort((a, b) => a - b)) {
  const p = bsb[n];
  if (!p) throw new Error(`no BSB text for Psalm ${n}`);
  const sup = p.headings.filter(h => h.startsWith('[superscription]')).map(h => h.replace('[superscription] ', '')).join(' ');
  psalms[n] = { sup, v: p.verses.map(x => [x.v, x.text]) };
}
const verse = ref => {
  const [c, v] = ref.split(':').map(Number);
  const hit = psalms[c]?.v.find(x => x[0] === v);
  if (!hit) throw new Error(`missing verse ${ref}`);
  return hit[1];
};
for (const [id, o] of Object.entries(tree.outcomes)) {
  for (const f of ['names', 'turn']) if (o[f]) verse(o[f]);
}

// The one finished result (Psalm 3): every quoted line is checked against the BSB here too.
const sam = {
  '2 Samuel 15:12': 'While Absalom was offering the sacrifices, he sent for Ahithophel the Gilonite, David’s counselor, to come from his hometown of Giloh. So the conspiracy gained strength, and Absalom’s following kept increasing.',
  '2 Samuel 15:30': 'But David continued up the Mount of Olives, weeping as he went up. His head was covered, and he was walking barefoot. And all the people with him covered their heads and went up, weeping as they went.'
};
const full = {
  P3: {
    story: [
      { t: 'The heading puts it in David\'s worst days. His son Absalom had spent years winning the people over, until ' },
      { q: 'the conspiracy gained strength, and Absalom’s following kept increasing', ref: '2 Samuel 15:12' },
      { t: '. David left Jerusalem on foot, ' },
      { q: 'weeping as he went up. His head was covered, and he was walking barefoot', ref: '2 Samuel 15:30' },
      { t: '. The psalm opens on that same word: how my foes have increased.' }
    ],
    own: 'Athanasius adds that people sing this psalm with their own troubles in view, and find its words are their own (§12).',
    night: '3:5'
  }
};
for (const part of full.P3.story) if (part.q && !sam[part.ref].includes(part.q)) throw new Error(`not verbatim: ${part.ref}`);
verse(full.P3.night);
for (const o of Object.values(tree.outcomes)) if (o.hard) verse(o.hard);

const data = { start: tree.start, nodes: tree.nodes, outcomes: tree.outcomes, psalms, full };
const html = tpl.replace('/*DATA*/null', JSON.stringify(data));
writeFileSync(out, html);
console.log('built', (html.length / 1024).toFixed(1) + ' KB,', Object.keys(psalms).length, 'psalms,', Object.keys(tree.outcomes).length, 'results');
