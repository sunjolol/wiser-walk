// Pull the quiz data out of the demo HTML into a compact JSON the audit agents can read.
const fs = require('fs');
const html = fs.readFileSync('theology-compass.html', 'utf8');
const start = html.indexOf('var AXES = [');
const end = html.indexOf('var TOTAL = STATEMENTS.length;');
if (start < 0 || end < 0) throw new Error('markers not found');
const block = html.slice(start, end);
const data = new Function(block + '; return {AXES, STATEMENTS, TRADITIONS};')();
const out = {
  note: 'Extracted from theology-compass.html (demo). Scores run 0..100 per axis: 0 = left pole, 100 = right pole.',
  scoring: {
    response_scale: { 'Strongly disagree': -2, 'Disagree': -1, 'Unsure': 0, 'Agree': 1, 'Strongly agree': 2 },
    statement_direction: '+1 means agreeing pushes toward the RIGHT pole of the axis, -1 toward the LEFT pole',
    axis_raw: 'sum over the three statements of (direction * response), range -6..+6',
    axis_score: 'round((raw + 6) / 12 * 100), so 0 = fully left pole, 50 = center, 100 = fully right pole',
    bands: 'score <= 20 -> bands[0], 21-40 -> bands[1], 41-59 -> bands[2], 60-79 -> bands[3], >= 80 -> bands[4]',
    headline: 'take the three axes with the largest |score - 50|, join their band adjectives; if all six are within 10 of 50, label is "A theological centrist"',
    nearest_tradition: 'Euclidean distance in the six-dimensional 0..100 space to each tradition position; the two smallest are shown as "Closest traditions"; match % = round(100 - distance / sqrt(6 * 100^2) * 100)'
  },
  axes: data.AXES.map((a, i) => ({ index: i, key: a.key, name: a.name, left_pole: a.left, right_pole: a.right, bands: a.bands, fair_summary: a.fair, history: a.history.map(h => ({ when: h[0], what: h[1] })), key_passages: a.passages, read_more: a.more })),
  statements: data.STATEMENTS.map((s, i) => ({ index: i + 1, axis: data.AXES[s.a].key, direction: s.d, text: s.t })),
  traditions: data.TRADITIONS.map(t => ({ name: t.name, position: { grace: t.pos[0], table: t.pos[1], spirit: t.pos[2], kingdom: t.pos[3], tradition: t.pos[4], worship: t.pos[5] } }))
};
fs.writeFileSync('audit/compass-data.json', JSON.stringify(out, null, 2));
console.log('axes', out.axes.length, 'statements', out.statements.length, 'traditions', out.traditions.length);
