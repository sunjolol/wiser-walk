// Generate the Psalm quiz's two data files from the design source. Never hand-edit either output:
// change design/quiz-ideas/psalm/model.mjs (the questions and the rules) or its tree.json (the result texts,
// each read against Athanasius's Greek), run `node design/quiz-ideas/psalm/model.mjs`, then this.
//
//   src/data/which-psalm.json  the questions, every result's situation and Athanasius's advice, and the rules
//                              that match one to the other. Small (about 45 KB) and needed by the runner, so it
//                              travels to the browser with the quiz.
//   src/data/psalms.json       the full Berean Standard Bible text (public domain since 30 April 2023) of every
//                              psalm a result can print. Server only: read by the result page and /psalm/ pages,
//                              never imported by the quiz or its runner.
//
// The source lives in design/, outside site/, which is Vercel's root directory, so both outputs are committed and a
// build without the source keeps them unchanged (as build-data.mjs does for the Compass).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const QUIZ_SRC = resolve(here, '../../design/quiz-ideas/psalm/quiz.json');
const BSB_SRC = resolve(here, '../../design/quiz-ideas/psalm/preview/psalms-bsb.json');
const QUIZ_OUT = resolve(here, '../src/data/which-psalm.json');
const PSALMS_OUT = resolve(here, '../src/data/psalms.json');

if (!existsSync(QUIZ_SRC) || !existsSync(BSB_SRC)) {
  if (existsSync(QUIZ_OUT) && existsSync(PSALMS_OUT)) {
    console.log('build-psalm-data: design source not present; using the committed which-psalm.json and psalms.json.');
  } else {
    throw new Error('build-psalm-data: no design source and no committed which-psalm.json / psalms.json to fall back on.');
  }
} else {
  const quiz = JSON.parse(readFileSync(QUIZ_SRC, 'utf8'));
  const bsb = JSON.parse(readFileSync(BSB_SRC, 'utf8'));

  // Every psalm a result names, leads with, prints as part of a set, or lists as "also".
  const numbers = new Set();
  for (const o of Object.values(quiz.outcomes)) {
    numbers.add(o.psalm);
    (o.set || []).forEach(n => numbers.add(n));
    (o.also || []).forEach(n => numbers.add(parseInt(String(n), 10)));
  }
  const psalms = {};
  for (const n of [...numbers].sort((a, b) => a - b)) {
    const p = bsb[n];
    if (!p) throw new Error(`build-psalm-data: no BSB text for Psalm ${n}`);
    psalms[n] = {
      superscription: p.headings.filter(h => h.startsWith('[superscription]')).map(h => h.replace('[superscription] ', '')).join(' '),
      verses: p.verses.map(v => [v.v, v.text])
    };
  }
  const verse = ref => {
    const [c, v] = ref.split(':').map(Number);
    const hit = psalms[c]?.verses.find(x => x[0] === v);
    if (!hit) throw new Error(`build-psalm-data: ${ref} is not in the BSB text`);
    return hit[1];
  };
  for (const [id, o] of Object.entries(quiz.outcomes)) {
    for (const f of ['names', 'turn', 'hard']) if (o[f]) verse(o[f]);
    if (o.lineNote) verse(o.lineNote.ref);
    if (!/^P\d+[A-Z]?$/.test(id)) throw new Error(`build-psalm-data: situation id ${id} cannot make a result code`);
  }
  for (const f of Object.values(quiz.full || {})) if (f.night) verse(f.night);

  const { draft, unused, ...keep } = quiz;
  writeFileSync(QUIZ_OUT, JSON.stringify({ generatedFrom: 'design/quiz-ideas/psalm/quiz.json', draft, ...keep }, null, 1));
  writeFileSync(PSALMS_OUT, JSON.stringify({
    translation: 'Berean Standard Bible',
    licence: 'Public domain since 30 April 2023 (berean.bible/licensing.htm).',
    via: 'https://bible.helloao.org/',
    psalms
  }));
  console.log(`which-psalm.json: draft ${draft}, ${Object.keys(quiz.outcomes).length} situations; psalms.json: ${Object.keys(psalms).length} psalms`);
}
