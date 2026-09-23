// Builds the draft 3 tap-through preview: quiz.json + score.js + the public-domain BSB psalms, one page.
// node design/quiz-ideas/psalm/preview/build3.mjs [out.html]   (default: psalm-quiz.html beside this file; gitignored)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || resolve(here, 'psalm-quiz.html');
const quiz = JSON.parse(readFileSync(resolve(here, '../quiz.json'), 'utf8'));
const bsb = JSON.parse(readFileSync(resolve(here, 'psalms-bsb.json'), 'utf8'));
const scorer = readFileSync(resolve(here, '../score.js'), 'utf8').replace(/if \(typeof module[^\n]*\n?/, '');
const style = readFileSync(resolve(here, 'style.part'), 'utf8').replace('</style>', `.opts.words { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.opts.words .opt { text-align: center; padding: .9rem .4rem; font-weight: 600; }
.opts.short { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.opts.short .opt { padding: .85rem .8rem; font-weight: 600; }
.opt[aria-pressed="true"] { background: var(--accent-soft); box-shadow: inset 0 0 0 2px var(--accent), var(--lift); }
#next[disabled] { opacity: .4; cursor: default; }
.row.quiet { align-items: center; }
.chips.because { margin: .8rem 0 .9rem; }
</style>`);
const script = readFileSync(resolve(here, 'script3.part'), 'utf8');

const psalms = {};
for (const o of Object.values(quiz.outcomes)) for (const n of [o.psalm, ...(o.set || [])]) {
  const p = bsb[n];
  if (!p) throw new Error(`no BSB text for Psalm ${n}`);
  psalms[n] = { sup: p.headings.filter(h => h.startsWith('[superscription]')).map(h => h.replace('[superscription] ', '')).join(' '), v: p.verses.map(x => [x.v, x.text]) };
}
const verse = ref => {
  const [c, v] = ref.split(':').map(Number);
  const hit = psalms[c]?.v.find(x => x[0] === v);
  if (!hit) throw new Error(`missing verse ${ref}`);
  return hit[1];
};
for (const o of Object.values(quiz.outcomes)) for (const f of ['names', 'turn', 'hard']) if (o[f]) verse(o[f]);

// The one finished result, Psalm 3. Every quoted line is checked against the BSB text as fetched on 2026-09-23.
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

const head = `<meta charset="utf-8">
<title>Which Psalm Are You Living</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Philosopher:ital,wght@0,700;1,700&family=Poppins:wght@500;600;700&display=swap">
`;
const html = head + style + '\n' + script.replace('/*DATA*/null', JSON.stringify({ quiz, psalms, full })).replace('/*SCORER*/', scorer);
writeFileSync(out, html);
console.log('built', (html.length / 1024).toFixed(1) + ' KB,', Object.keys(psalms).length, 'psalms,', Object.keys(quiz.outcomes).length, 'results');
