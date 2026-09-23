// Lists every scored cell with its full research quote, for hand-picking display lines (excerpts.json).
import { build, POOL } from './table.mjs';
import { readFileSync } from 'node:fs';
const quiz = JSON.parse(readFileSync(new URL('./quiz.json', import.meta.url), 'utf8'));
const { cells } = build();
const only = process.argv[2] ? process.argv[2].split(',') : null;
let ok = 0, need = 0;
for (const key of Object.keys(quiz.people)) {
  if (only && !only.includes(key)) continue;
  for (const st of quiz.statements) {
    const c = cells[st.id]?.[key]; if (!c || c.v === 0 || !c.s) continue;
    const q = c.s.quote.replace(/\s+/g, ' ').trim(); const w = q.split(' ').length;
    const clean = w <= 32 && /^[A-Z"'‘“(]/.test(q) && /[.?!]["'’”)]?$/.test(q);
    if (process.argv[3] === 'count') { clean ? ok++ : need++; continue; }
    console.log(`${key}.${st.id} [${c.v > 0 ? '+' : ''}${c.v}${c.s.own_rendering ? ' own' : ''}] ${c.s.work} ${c.s.location}${clean ? ' OK' : ''}\n  ${q}`);
  }
}
if (process.argv[3] === 'count') console.log('clean', ok, 'need picking', need);
