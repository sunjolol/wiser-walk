// Generate the site's data file from the audited source. The audit stays upstream:
// never hand-edit site/src/data/compass.json — change the audit file and rerun this.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, '../../audit/compass-data.revised.json');
const OUT = resolve(here, '../src/data/compass.json');

const src = JSON.parse(readFileSync(SOURCE, 'utf8'));

const slug = s => String(s)
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const axes = src.axes.map((a, i) => ({
  index: i,
  key: a.key,
  name: a.name,
  slug: slug(a.name),
  left: a.left_pole,
  right: a.right_pole,
  bands: a.bands,
  summary: a.fair_summary,
  history: a.history,
  passages: a.key_passages,
  readMore: a.read_more
}));

const axisKeys = axes.map(a => a.key);

const statements = src.statements.map((s, i) => ({
  n: i + 1,
  axis: s.axis,
  axisIndex: axisKeys.indexOf(s.axis),
  direction: s.direction,
  text: s.text
}));

const traditions = src.traditions.map(t => ({
  name: t.name,
  slug: slug(t.name),
  position: axisKeys.map(k => t.position[k])
}));

// Largest distance between any two listed traditions: the honest denominator for a match %.
let maxPair = 0;
for (let i = 0; i < traditions.length; i++) {
  for (let j = i + 1; j < traditions.length; j++) {
    let sum = 0;
    for (let k = 0; k < 6; k++) {
      const d = traditions[i].position[k] - traditions[j].position[k];
      sum += d * d;
    }
    maxPair = Math.max(maxPair, Math.sqrt(sum));
  }
}

// Statements per axis fixes how many scores an axis can take, which fixes the permalink base.
const perAxis = axes.map(a => statements.filter(s => s.axis === a.key).length);
if (new Set(perAxis).size !== 1) {
  throw new Error('axes have differing statement counts: ' + perAxis.join(','));
}
const itemsPerAxis = perAxis[0];
const radix = itemsPerAxis * 4 + 1; // raw runs -2n..+2n, so 4n+1 reachable scores

const out = {
  generatedFrom: 'audit/compass-data.revised.json',
  axes,
  statements,
  traditions,
  scoring: {
    itemsPerAxis,
    radix,
    maxDistance: Math.round(maxPair * 10) / 10,
    tieUnits: 10,
    hedgeUnits: 45,
    centerUnits: 10
  },
  simulations: src.simulations ?? [],
  disputed: src.disputed ?? []
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 1));

console.log(
  `compass.json: ${axes.length} axes, ${statements.length} statements (${itemsPerAxis}/axis, radix ${radix}), ` +
  `${traditions.length} traditions, max distance ${out.scoring.maxDistance}`
);
