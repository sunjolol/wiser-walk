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

// Every work gets ONE plain English name a reader would search for (VERIFY.md listed what went wrong): no chapter,
// book, letter or treatise numbers, no Latin tails, one name for one book, and a letter always names its reader.
// Keyed by the name the research files give (brackets already stripped), or by a cell ('gregory.learning') where one
// research name covers two different letters. A work not listed keeps its research name. A pair [name, by] also
// says who recorded the words, for every cell that cites it, hidden cells included (a hidden line prints "On record
// in <work>, <by>"); it replaces a cell's own `by`, so the recorder is named once and in one form.
const MARTIN = 'as Sulpicius Severus, who knew him, recorded it';
const ATHANASIUS = 'as Athanasius recorded his words';
const MACRINA = 'as her brother Gregory recorded her words';
const WORKS = {
  // Augustine
  'Expositions on the Psalms, Psalm 39': 'Expositions on the Psalms',
  'Exposition on Psalm 147': 'Expositions on the Psalms',
  'The City of God': 'City of God',
  'Sermon 61': 'Sermons',
  'Sermon 68, on Matthew 11:25': 'Sermons',
  'Sermon on Luke 9:57-62': 'Sermons',
  'Sermons on the New Testament': 'Sermons',
  'Letter 263, to Sapida': 'Letter to Sapida',
  'Letter 159, to Evodius': 'Letter to Evodius',
  'Letter 189, to Boniface': 'Letter to Boniface',
  'Letter 185, "The Correction of the Donatists"': 'The Correction of the Donatists, a letter to Boniface',
  'Augustine, Confessions': ['Confessions', 'as Augustine recorded it'], // Ambrose's preaching, in Augustine's book
  // John Chrysostom
  'Homilies on the Gospel of Matthew': 'Homilies on Matthew',
  'Homilies on 1 Thessalonians': 'Homilies on First Thessalonians',
  'Second Sermon on Lazarus and the Rich Man': 'Sermons on Lazarus and the Rich Man',
  // Jerome
  'Letter 130, to Demetrias': 'Letter to Demetrias',
  'Letter 52, to Nepotian': 'Letter to Nepotian',
  'Letter 70, to Magnus, an orator of Rome': 'Letter to Magnus',
  'Letter 109, to Riparius': 'Letter to Riparius',
  'Letter 125, to Rusticus': 'Letter to Rusticus',
  'Letter 120, to Hedibia': 'Letter to Hedibia',
  'Letter 147, to Sabinianus': 'Letter to Sabinianus',
  'Letter 39, to Paula, on the death of Blaesilla': 'Letter to Paula on the death of Blaesilla',
  'Letter 133, to Ctesiphon': 'Letter to Ctesiphon',
  'Letter 54, to Furia': 'Letter to Furia',
  'Letter 53, to Paulinus of Nola': 'Letter to Paulinus of Nola',
  'Letter 14, to Heliodorus': 'Letter to Heliodorus',
  'Letter 84, to Pammachius and Oceanus': 'Letter to Pammachius and Oceanus',
  // Clement of Alexandria
  'The Stromata': 'Stromata',
  // Ambrose
  'On the Christian Faith, to the emperor Gratian': 'On the Christian Faith',
  'Exposition of the Gospel according to Luke': 'Exposition of the Gospel of Luke',
  'Letter 51, to the Emperor Theodosius': 'Letter to the Emperor Theodosius',
  'Letter 63, to the Church at Vercelli': 'Letter to the Church at Vercelli',
  'Letter 22, to his sister Marcellina': 'Letter to his sister Marcellina',
  'Letter 17': 'Letter to the Emperor Valentinian II',
  'On Flight from the World, as quoted verbatim by Augustine in On the Gift of Perseverance': 'On Flight from the World',
  // Gregory the Great
  'Moralia in Job': 'Morals on the Book of Job',
  'gregory.learning': 'Letter to Desiderius, bishop of Vienne',
  'Forty Homilies on the Gospels': 'Homilies on the Gospels',
  'Register of Letters, to Gennadius, exarch of Africa': 'Letter to Gennadius, governor of Africa',
  // Basil the Great
  'Homily 10, Against the Angry': 'Homily against Anger',
  'Letter 269, to the wife of Arinthaeus the general': 'Letter to the wife of Arinthaeus the general',
  'Homily on the words "I will pull down my barns", Homilia in illud: Destruam horrea mea': 'Homily on "I will pull down my barns"',
  'On the Judgment of God, his preface to the Morals': 'On the Judgment of God',
  // Gregory of Nazianzus
  'Oration 43, Funeral Oration on Basil the Great': 'Funeral Oration on Basil the Great',
  'Oration 2, In Defence of His Flight to Pontus': 'In Defence of His Flight to Pontus',
  'Oration 2': 'In Defence of His Flight to Pontus',
  'Oration 7, funeral oration on his brother Caesarius': 'Funeral Oration on His Brother Caesarius',
  'Oration 14, On Love of the Poor': 'On Love of the Poor',
  'Oration 18, funeral oration on his father': 'Funeral Oration on His Father',
  'Oration 27': 'First Theological Oration',
  'Oration 37': 'Oration on Matthew 19',
  // Gregory of Nyssa (the letter to Peter opens Against Eunomius and is printed with it)
  'Against Eunomius, prefatory Letter 1 to his brother Peter': 'Against Eunomius',
  // Lactantius
  'A Treatise on the Anger of God': 'On the Anger of God',
  'The Divine Institutes': 'Divine Institutes',
  // Origen
  'Stromateis, book 6, quoted by Jerome in Apology against Rufinus': ['Stromateis', 'as Jerome quotes it'],
  'Letter to his father Leonides, quoted in Eusebius, Church History': ['Letter to his father Leonides', 'as Eusebius records it'],
  // Cyprian
  'On the Advantage of Patience, Treatise 9': 'On the Advantage of Patience',
  'Three Books of Testimonies against the Jews': 'Testimonies against the Jews',
  'cyprian.dreams': 'Letter to Florentius Puppianus',
  'Exhortation to Martyrdom, addressed to Fortunatus': 'Exhortation to Martyrdom, to Fortunatus',
  // Antony (he wrote none of these; the recorder is named where the cell does not say it already)
  'Sayings of the Desert Fathers, alphabetical collection': ['Sayings of the Desert Fathers', 'as the desert monks remembered it'],
  'Life of Antony, by Athanasius': ['Life of Antony', ATHANASIUS],
  'Athanasius, Life of Antony': 'Life of Antony',
  'Life of Antony, by Athanasius of Alexandria': 'Life of Antony',
  'Life of Antony': ['Life of Antony', ATHANASIUS],
  "Life of Antony, Antony's sermon to the monks": ['Life of Antony', ATHANASIUS],
  'Evagrius Ponticus, Praktikos, chapter 92, as quoted by Socrates Scholasticus, Church History': ['Praktikos', 'as Evagrius recorded it'],
  // Isaac the Syrian (Wensinck's 1923 English is titled Mystic Treatises; the usual name now is Ascetical Homilies)
  'Mystic Treatises': 'Ascetical Homilies',
  'Mystic Treatises, Six Treatises on the Behaviour of Excellence': 'Ascetical Homilies',
  'Mystic Treatises, Treatise 50, "Short sections containing various considerations in which is shown the injury caused by foolish zeal under the pretext of fear of God and the profit originating in quietness"': 'Ascetical Homilies',
  'Ascetical Homilies, "Six Treatises on the Behaviour of Excellence"': 'Ascetical Homilies',
  // Macrina (her brother wrote both books)
  'On the Soul and the Resurrection, by Gregory of Nyssa': ['On the Soul and the Resurrection', MACRINA],
  'Gregory of Nyssa, On the Soul and the Resurrection': 'On the Soul and the Resurrection',
  'On the Soul and the Resurrection, by her brother Gregory of Nyssa': 'On the Soul and the Resurrection',
  'Gregory of Nyssa, Life of Macrina': 'Life of Macrina',
  // Martin of Tours (Sulpicius Severus wrote all of these)
  'Life of St Martin, by Sulpicius Severus': ['Life of St Martin', MARTIN],
  'Life of St Martin': ['Life of St Martin', MARTIN],
  'Life of Martin': ['Life of St Martin', MARTIN],
  'Sulpicius Severus, Life of St. Martin': ['Life of St Martin', MARTIN],
  'Sulpicius Severus, Dialogues': ['Dialogues', MARTIN],
  'Dialogues of Sulpicius Severus': ['Dialogues', MARTIN],
  'Letter 3 of Sulpicius Severus, to Bassula': ['Letter to Bassula', MARTIN],
  'Sulpicius Severus, Sacred History': ['Sacred History', MARTIN],
  // Benedict
  'Rule of Benedict': 'Rule of St Benedict',
  'The Rule': 'Rule of St Benedict',
  'Dialogues, Book 2, by Gregory the Great': ['Dialogues', 'as Gregory the Great recorded it'],
  // Boethius
  'Theological Tractates: Whether Father, Son and Holy Spirit Are Substantially Predicated of the Divinity': 'Theological Tractates',
  'Theological Tractates: On the Trinity': 'Theological Tractates'
};
function workName(ref, work) {
  const w = WORKS[ref] ?? WORKS[work];
  return w === undefined ? { work } : typeof w === 'string' ? { work: w } : { work: w[0], by: w[1] };
}

// The line a result shows for a cell, from excerpts.json (see its _how). Every stretch must be found verbatim in the
// research quote; the only edits allowed are a capital first letter, a closing full stop, and capitals on pronouns
// for God. A hidden cell still counts in the matching; the reveal just never prints it.
const EX = JSON.parse(readFileSync(new URL('./excerpts.json', import.meta.url), 'utf8'));
const problems = [];
function display(ref, s) {
  if (!s) return { hide: true };
  const named = workName(ref, s.work.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+,/g, ',').trim());
  const base = { work: named.work, own: !!s.own_rendering };
  const q = s.quote.replace(/\s+/g, ' ').trim();
  let rule = EX[ref];
  if (rule === undefined) rule = q.split(' ').length <= 32 && /^[A-Z"'‘“(]/.test(q) && /[.?!]["'’”)]?$/.test(q) ? '=' : '-';
  if (rule === '-') return { ...base, hide: true, ...(named.by ? { by: named.by } : {}) };
  if (rule && rule.use) {
    const used = workName(ref, rule.use.work);
    return { ...base, work: used.work, line: rule.use.quote, by: used.by || rule.by || null, own: false };
  }
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
  return { ...base, line, by: named.by || opt.by || null, note: opt.note || null };
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
// The work names a reader sees: no numbered part of a work (Bible references are fine), and no recorder named twice.
for (const [k, p] of Object.entries(people)) for (const [id, c] of Object.entries(p.cells)) {
  if (/\b(book|chapter|letter|sermon|oration|homily|treatise|psalm)\s+\d/i.test(c.work || '')) problems.push(`${k}.${id}: a number in the work name "${c.work}" (add it to WORKS)`);
  if (c.by && c.work && c.by.split(/\W+/).some(w => /^[A-Z][a-z]{3,}$/.test(w) && c.work.includes(w))) problems.push(`${k}.${id}: "${c.work}" and "${c.by}" name the recorder twice`);
}
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
writeFileSync(new URL('./quiz.json', import.meta.url), JSON.stringify(quiz, null, 1));
console.log(Object.keys(people).length, 'people;', ORDER.length, 'statements');
for (const [k, p] of Object.entries(people)) if (!p.hook) console.log('no hook:', k);
