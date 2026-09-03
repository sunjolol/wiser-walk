// Regenerate the AXES / STATEMENTS / TRADITIONS block of theology-compass.html from a data JSON.
// Usage: node audit/apply.js <data.json> [in.html] [out.html]
const fs = require('fs');
const [,, dataPath, inPath = 'theology-compass.html', outPath = inPath] = process.argv;
if (!dataPath) { console.error('usage: node audit/apply.js <data.json> [in.html] [out.html]'); process.exit(1); }
const html = fs.readFileSync(inPath, 'utf8');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const start = html.indexOf('var AXES = [');
const end = html.indexOf('var TOTAL = STATEMENTS.length;');
if (start < 0 || end < 0) throw new Error('markers not found in ' + inPath);
// keep emoji + token from the page's current AXES (they are UI plumbing, not audit data)
const current = new Function(html.slice(start, end) + '; return {AXES};')().AXES;
const J = v => JSON.stringify(v);
const axisKeys = data.axes.map(a => a.key);
const axesSrc = data.axes.map((a, i) => {
  const cur = current.find(c => c.key === a.key) || current[i] || {};
  return `    {\n      key: ${J(a.key)}, name: ${J(a.name)}, emoji: ${J(cur.emoji || '')}, left: ${J(a.left_pole)}, right: ${J(a.right_pole)}, token: ${J(cur.token || ('--' + a.key))},\n` +
    `      bands: ${J(a.bands)},\n      fair: ${J(a.fair_summary)},\n` +
    `      history: [\n${a.history.map(h => `        [${J(h.when)}, ${J(h.what)}]`).join(',\n')}\n      ],\n` +
    `      passages: ${J(a.key_passages)},\n      more: { left: ${J(a.read_more.left)}, right: ${J(a.read_more.right)} }\n    }`;
}).join(',\n');
const stmtSrc = data.statements.map(s => {
  const a = axisKeys.indexOf(s.axis);
  if (a < 0) throw new Error('statement refers to unknown axis ' + s.axis);
  if (s.direction !== 1 && s.direction !== -1) throw new Error('bad direction on statement ' + s.index);
  return `    { a: ${a}, d: ${s.direction}, t: ${J(s.text)} }`;
}).join(',\n');
const tradSrc = data.traditions.map(t => {
  const p = t.position; const pos = axisKeys.map(k => { if (typeof p[k] !== 'number') throw new Error('tradition ' + t.name + ' missing axis ' + k); return p[k]; });
  return `    { name: ${J(t.name)}, pos: ${J(pos)} }`;
}).join(',\n');
const block = `var AXES = [\n${axesSrc}\n  ];\n\n  /* a = axis index; d = +1 agreeing pushes toward the right pole, -1 toward the left pole */\n  var STATEMENTS = [\n${stmtSrc}\n  ];\n\n  var TRADITIONS = [\n${tradSrc}\n  ];\n\n  `;
const out = html.slice(0, start) + block + html.slice(end);
fs.writeFileSync(outPath, out);
// sanity: the page assumes 18 statements and 6 axes
const perAxis = axisKeys.map(k => data.statements.filter(s => s.axis === k).length);
console.log('wrote', outPath, '| axes', data.axes.length, '| statements', data.statements.length, 'per axis', perAxis.join('/'), '| traditions', data.traditions.length);
if (data.statements.length !== 18 || data.axes.length !== 6) console.warn('WARNING: page expects 6 axes x 3 statements = 18; got a different count');
