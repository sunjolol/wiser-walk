// Split audit/review-results.json into one file per target (audit/findings/*.json) and build index.json.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'audit', 'findings');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const reviews = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit', 'review-results.json'), 'utf8'));
const byTarget = {};
reviews.forEach(r => r.findings.forEach((f, i) => {
  const id = r.key + '-' + (i + 1);
  (byTarget[f.target] = byTarget[f.target] || []).push({ id, lens: r.lens, category: f.category, severity: f.severity, claim: f.claim, evidence: f.evidence, fix: f.fix });
}));
const safe = t => t.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const index = { targets: [], simulations: reviews.filter(r => r.simulation).map(r => Object.assign({ lens: r.lens, key: r.key }, r.simulation)) };
Object.keys(byTarget).sort().forEach(t => {
  const file = path.join(OUT, safe(t) + '.json');
  fs.writeFileSync(file, JSON.stringify({ target: t, findings: byTarget[t] }, null, 1));
  index.targets.push({ target: t, file, ids: byTarget[t].map(f => f.id), severities: byTarget[t].map(f => f.severity) });
});
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
console.log('targets', index.targets.length, '| index bytes', fs.statSync(path.join(OUT, 'index.json')).size, '| simulations', index.simulations.length);
console.log(index.targets.slice(0, 3).map(t => t.file + '  (' + t.ids.length + ')').join('\n'));
