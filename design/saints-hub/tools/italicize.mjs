// Italicize book titles in a saint page's running text (the owner, 2026-09-25: short titles
// such as "The Life is full of healings" read like grammar mistakes). Titles go in *italics*,
// the rich-text mark the pages already use. Quotations, citations, headings and existing marks
// are never touched.
//   node italicize.mjs <data dir> [--write]
import fs from 'node:fs';

const [dir, write] = [process.argv[2], process.argv.includes('--write')];

/* Whole titles, as they appear in the pages' running text. */
const TITLES = [
  'Church History', 'Ecclesiastical History', 'History of the Franks', 'History of the Lombards', 'History of the Wars',
  'Lausiac History', 'Sacred History', 'Decline and Fall of the Roman Empire', 'Decline and Fall',
  'Against Heresies', 'Demonstration of the Apostolic Preaching', 'Ascetical Homilies', 'Divine Institutes',
  'First Apology', 'Second Apology', 'Dialogue with Trypho', 'Lives of Illustrious Men', 'Illustrious Men',
  'Rule of St Benedict', 'Rule of Saint Benedict', 'City of God', 'Consolation of Philosophy', 'On the Deaths of the Persecutors',
  'Sayings of the Desert Fathers', 'On the Incarnation of the Lord', 'On the Incarnation', 'Apology against Rufinus',
  'Apology against Jerome', 'Acts of Cyprian', 'Martyrdom of Justin', 'On the Duties of the Clergy', 'Moralia on Job',
  'On First Principles', 'Who Is the Rich Man That Shall Be Saved?', 'On Baptism', 'On the Unity of the Church',
  'Against the Valentinians', 'On the Priesthood', 'On the Workmanship of God', 'On Naboth', 'On the Trinity',
  'Exhortation to the Greeks', 'To Donatus', 'On the Lapsed', 'Pastoral Rule', 'On the Soul and the Resurrection',
  'On the Making of Man', 'On the Anger of God', 'Against Celsus', 'Against Marcion', 'To His Wife',
  'Concerning Repentance', 'Against Eutyches and Nestorius', "On the Lord's Prayer", 'Great Catechism',
  'Life of Paul the First Hermit', 'Dialogue on the Life of St John Chrysostom', 'Against the Jews',
  'Address to the Greeks', 'On Christian Doctrine', 'Commentary on Matthew', 'Of Patience', 'On Modesty',
  'To the Martyrs', 'Against Praxeas', 'On the Soul', 'To Scapula', 'Prescription against Heretics',
  'Concerning Virgins', 'Tractates on the Gospel of John', 'On the Gift of Perseverance', 'Against Jovinianus',
  'On the Holy Spirit', 'On Virginity', 'Nuremberg Chronicle', 'Sacred and Legendary Art',
  'Les vrais pourtraits et vies des hommes illustres', 'Les Images de tous les saints',
  'Catholic Encyclopedia', 'New Catholic Encyclopedia', 'Orthodox Encyclopedia', 'Dictionary of Christian Biography',
  'Roman Martyrology', 'Nicene and Post-Nicene Fathers', 'Ante-Nicene Fathers', 'Britannica', 'Philokalia',
  'Golden Legend', 'Stromata', 'Hexaemeron', 'Variae', 'Retractations', 'Soliloquies', 'Commonitory', 'Bibliotheca',
  'Moralia', 'Meditations', 'Miscellanies', 'Instructor', 'Confessions', 'Conferences', 'Institutes', 'Consolation',
  'Dialogues', 'Protrepticus', 'Paedagogus', 'Apologeticus', 'Octavius', 'Epitome'
];
/* "Life of Antony", "Life of St Martin", "Life of Macrina": any Life of a named person. */
const LIFE_OF = String.raw`Li(?:fe|ves) of (?:St |Saint |the Blessed )?[A-Z][a-z]+(?: (?:the )?[A-Z][a-z]+)*`;
/* Short forms that are also ordinary words: italic only mid-sentence (never first word of a sentence). */
const SHORT = ['Life', 'Lives', 'Rule', 'Dialogue', 'Apology', 'Apologies', 'Demonstration', 'Exhortation', 'Chronicle'];

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const whole = [...TITLES].sort((a, b) => b.length - a.length).map(esc);
const WHOLE = new RegExp(String.raw`(?<![A-Za-z*])(?:${LIFE_OF}|${whole.join('|')}|Dialogues? [IVX]+)(?![A-Za-z*])`, 'g');
const SHORTRE = new RegExp(String.raw`(?<![A-Za-z*])(?:${SHORT.join('|')})(?![A-Za-z*])`, 'g');

/* Protected spans: quotations, existing marks. */
const PROTECT = /“[^”]*”|"[^"]*"|\*\*[^*]+\*\*|\*[^*]+\*|\{(?:la|el)\|[^}]*\}/g;

function mark(s) {
  let out = '', last = 0;
  const free = t => t
    .replace(WHOLE, m => `*${m}*`)
    .replace(/[^*]+|\*[^*]*\*/g, chunk => chunk.startsWith('*') ? chunk : chunk.replace(SHORTRE, (m, off, str) => {
      const before = str.slice(0, off);
      if (/(^\s*|[.!?:]\s+)$/.test(before)) return m;   // first word of a sentence: an ordinary word
      if (m === 'Rule' && /rule of faith/i.test(str.slice(off, off + 14))) return m;
      return `*${m}*`;
    }));
  for (const p of s.matchAll(PROTECT)) {
    out += free(s.slice(last, p.index)) + p[0];
    last = p.index + p[0].length;
  }
  return out + free(s.slice(last));
}

/* Which strings are running text. Headings, quotations, citations and the listing are not. */
const TEXT_KEYS = new Set(['lede', 'who', 'line', 'lines', 'text', 'caption', 'typeNote', 'note', 'big', 'paras', 'ctx', 'witness', 'claim', 'truth', 'intro', 'title']);
const SKIP_UNDER = new Set(['cite', 'cites', 'sources', 'seo', 'person', 'card', 'q', 'quote', 'filters', 'numbers-src']);

const changes = [];
function walk(v, path, slug) {
  if (Array.isArray(v)) return v.map((x, i) => walk(x, [...path, i], slug));
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = SKIP_UNDER.has(k) ? x : walk(x, [...path, k], slug);
    return o;
  }
  if (typeof v !== 'string') return v;
  const keys = path.filter(k => typeof k === 'string');
  const key = keys[keys.length - 1];
  if (!TEXT_KEYS.has(key)) return v;
  if (key === 'title' && keys[0] !== 'moments') return v;          // only a moment's title is text
  if (key === 'line' && keys[0] !== 'roles') return v;
  if (key === 'who' && keys.length > 1 && keys[keys.length - 2] === 'card') return v;
  const n = mark(v);
  if (n !== v) changes.push({ slug, path: path.join('.'), before: v, after: n });
  return n;
}

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const raw = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const d = JSON.parse(raw);
  const out = walk(d, [], d.slug);
  if (write) fs.writeFileSync(`${dir}/${f}`, JSON.stringify(out, null, 2) + '\n');
}
for (const c of changes) {
  const diff = [];
  for (const m of c.after.matchAll(/\*[^*]+\*/g)) if (!c.before.includes(m[0])) diff.push(m[0]);
  console.log(c.slug.padEnd(22), c.path.padEnd(26), [...new Set(diff)].join(' '));
}
console.error(changes.length, 'strings changed');
