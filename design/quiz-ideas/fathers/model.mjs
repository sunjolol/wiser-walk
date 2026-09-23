// Quiz #4 draft 1: writes quiz.json (statements in play order, people with their recorded positions and the line that
// proves each). Source of truth for the table: table.mjs over research/topics; portraits from research/figures.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { build, POOL, STATEMENTS } from './table.mjs';

const ORDER = 'laugh quiet learning anger alone rich tell tears lie surplus nature calm body dreams miracles mystery deeper calling pure war rulers effort all'.split(' ');
const DROP = ['athanasius', 'poemen', 'climacus', 'ephrem', 'hilary']; // hilary: 6 positions after draft-3 recoding // under seven positions on the 22 statements
const TEXT = Object.fromEntries(STATEMENTS.map(s => [s[0], s[3]]));
// Draft 2 wording, after people-test-1 (their notes: a false either/or, "books" read as the Bible, "support" read as
// protecting freedom, "put out" too harsh, "never stir" read as feeling nothing, "more than what literally happened"
// read as doubting the stories). Each still states the researched claim its cells were coded against.
Object.assign(TEXT, {
  alone: "If you had to choose, you'd grow closer to God alone in quiet than among other people.",
  surplus: "Giving to the poor isn't generosity. It's paying back what's already theirs.",
  rulers: 'Governments should use their laws to promote the Christian faith.',
  pure: 'A church should keep out people who openly live in serious wrongdoing.',
  calm: 'The best way to live is free of strong emotions, with only a steady peace inside.',
  deeper: 'In many Bible stories, the deeper meaning matters more than the history.',
  nature: 'Nature can teach you as much about God as the Bible can.',
  effort: 'Becoming a better person is mostly down to your own effort.',
});

const figs = {};
for (const f of readdirSync(new URL('./research/figures/', import.meta.url))) {
  for (const p of JSON.parse(readFileSync(new URL(`./research/figures/${f}`, import.meta.url), 'utf8')).figures) figs[p.name] = p;
}
const findFig = name => Object.values(figs).find(p => p.name.startsWith(name.split(' ')[0]) && p.name.includes(name.split(' ').slice(-1)[0])) || Object.values(figs).find(p => p.name.startsWith(name.split(' ')[0]));

function short(q) {
  const words = q.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= 45) return words.join(' ');
  const text = words.slice(0, 45).join(' '); const cut = Math.max(text.lastIndexOf('. '), text.lastIndexOf('? '), text.lastIndexOf('! '));
  return cut > 80 ? text.slice(0, cut + 1) : text + ' …';
}

// The line a result shows for a cell, from excerpts.json (see its _how). Every stretch must be found verbatim in the
// research quote; the only edits allowed are a capital first letter, a closing full stop, and capitals on pronouns
// for God. A hidden cell still counts in the matching; the reveal just never prints it.
const EX = JSON.parse(readFileSync(new URL('./excerpts.json', import.meta.url), 'utf8'));
const problems = [];
function display(ref, s) {
  const base = { work: s ? s.work.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+,/g, ',').trim() : null, own: !!s?.own_rendering };
  if (!s) return { hide: true };
  const q = s.quote.replace(/\s+/g, ' ').trim();
  let rule = EX[ref];
  if (rule === undefined) rule = q.split(' ').length <= 32 && /^[A-Z"'‘“(]/.test(q) && /[.?!]["'’”)]?$/.test(q) ? '=' : '-';
  if (rule === '-') return { ...base, hide: true };
  if (rule && rule.use) return { ...base, work: rule.use.work, line: rule.use.quote, by: rule.by || null, own: false };
  let line, opt = {};
  if (rule === '=') line = q;
  else {
    const [a, b, o] = rule; opt = o || {};
    const i = q.indexOf(a); if (i < 0) { problems.push(`${ref}: start not found: ${a}`); return { ...base, hide: true }; }
    const j = b ? q.indexOf(b, i) : q.length; if (j < 0) { problems.push(`${ref}: end not found: ${b}`); return { ...base, hide: true }; }
    line = q.slice(i, b ? j + b.length : q.length).trim();
  }
  for (const [x, y] of opt.fix || []) line = line.split(x).join(y);
  if (opt.cap) line = line[0].toUpperCase() + line.slice(1);
  if (opt.stop) line = line.replace(/[,;:\s—-]+$/, '') + '.';
  return { ...base, line, by: opt.by || null, note: opt.note || null };
}
const { cells } = build();
const people = {};
for (const [k, name] of Object.entries(POOL)) {
  if (DROP.includes(k)) continue;
  const f = findFig(name) || {};
  const row = {};
  for (const id of ORDER) {
    const c = cells[id]?.[k]; if (!c || c.v === 0) continue;
    row[id] = { v: c.v, ...display(`${k}.${id}`, c.s) };
  }
  people[k] = { name, dates: f.dates || '', hook: f.hook || '', cells: row };
}
// The usual answer to each statement, from the 30 simulated people of people-test-1 (recompute after each test).
const USUAL = { laugh: 1.7, quiet: 0.7, learning: 1.5, anger: 1.3, alone: -0.2, rich: 0.9, tell: 0.4, tears: 1.9, lie: 0.5, surplus: 0.3, nature: 0.4, calm: -0.9, body: 1.2, dreams: 0.4, miracles: 0.8, mystery: 0.5, deeper: 0.1, calling: 1.1, pure: -0.5, war: 0.4, rulers: -0.7, effort: -0.6, all: -0.4 };
const centre = {};
for (const id of ORDER) { const vs = Object.values(people).map(p => p.cells[id]?.v).filter(Boolean); centre[id] = [USUAL[id], +(vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2)]; }
const quiz = { statements: ORDER.map(id => ({ id, text: TEXT[id] })), centre, people };
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
writeFileSync(new URL('./quiz.json', import.meta.url), JSON.stringify(quiz, null, 1));
console.log(Object.keys(people).length, 'people;', ORDER.length, 'statements');
for (const [k, p] of Object.entries(people)) if (!p.hook) console.log('no hook:', k);
