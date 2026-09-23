// Generate the site's data file from the audited source. The audit stays upstream:
// never hand-edit site/src/data/compass.json — change the audit file and rerun this.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// The Psalm quiz's data comes from design/, not audit/, and has its own fallback; see that script.
await import('./build-psalm-data.mjs');
const SOURCE = resolve(here, '../../audit/compass-data.revised.json');
const OUT = resolve(here, '../src/data/compass.json');
const ASIDE = resolve(here, '../src/data/compass-audit.json');
const FIGURES_SOURCE = resolve(here, '../../audit/new-quizzes/figures.verified.json');
const FIGURES_OUT = resolve(here, '../src/data/bible-figures.json');

// The audited source lives outside site/, which a host may not check out when the
// project root is set to site/. The generated files are committed for exactly that
// case: if the source is missing but the outputs are present, use them and carry on.
// If neither exists, fail loudly rather than building a site with no quiz in it.
if (!existsSync(SOURCE)) {
  if (existsSync(OUT) && existsSync(ASIDE) && existsSync(FIGURES_OUT)) {
    console.log(
      'build-data: audit source not present (building outside the repo root?) — ' +
      'using the committed src/data/*.json unchanged.'
    );
    process.exit(0);
  }
  throw new Error(
    `build-data: cannot find ${SOURCE}, and no committed data to fall back on. ` +
    'Check out the whole repository, or restore site/src/data/compass.json.'
  );
}

const src = JSON.parse(readFileSync(SOURCE, 'utf8'));

/*
 * The pole split is computed HERE and committed into compass.json, for the same reason the
 * quiz data is: design/tools/split-summaries.mjs lives outside site/, which is the Vercel
 * root directory and may be all that a build machine checks out. The tool stays the single
 * source of truth for how a summary is split, and it verifies its own work — it refuses
 * rather than guessing, because attributing one pole's words to the other is exactly the
 * unfairness the whole instrument exists to avoid.
 */
const { splitSummary } = await import('../../design/tools/split-summaries.mjs');

const slug = s => String(s)
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const axes = src.axes.map((a, i) => {
  const split = splitSummary(a.key, a.fair_summary);
  if (!split.ok) {
    // Rendering the summary whole is a correct fallback; silently mis-attributing half of
    // it to the wrong pole is not. Fail the build and let a person look at the anchor.
    throw new Error(`build-data: cannot split the ${a.name} summary safely (${split.reason})`);
  }
  return {
    index: i,
    key: a.key,
    name: a.name,
    slug: slug(a.name),
    left: a.left_pole,
    right: a.right_pole,
    bands: a.bands,
    /*
     * The four reader-facing fields, snake_case upstream and camelCase in the engine.
     * Each is omitted when the audit source has not written it, so an axis that carries
     * none of them produces exactly the object it produced before they existed — and the
     * page renders exactly what it rendered before.
     */
    ...(a.question ? { question: a.question } : {}),
    ...(a.short_answer ? { shortAnswer: a.short_answer } : {}),
    ...(a.why_it_matters ? { whyItMatters: a.why_it_matters } : {}),
    ...(Array.isArray(a.did_you_know) && a.did_you_know.length
      ? { didYouKnow: a.did_you_know.map(k => ({ text: k.text, source: k.source })) }
      : {}),
    summary: a.fair_summary,
    // Verified: every sentence of the audited summary is used exactly once.
    summaryParts: {
      left: split.left,
      right: split.right,
      between: split.note || '',
      caution: split.caution || ''
    },
    history: a.history,
    passages: a.key_passages,
    readMore: a.read_more
  };
});

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
  }
};

// The answer sheets, the changelog and the disputed log are build-time only. They are
// large and are never needed in the browser, so they live in a separate file that the quiz
// runner's bundle does not import. The changelog is carried here so the method page can
// publish every change the audit made, with its reason, rather than summarising it.
const aside = {
  generatedFrom: 'audit/compass-data.revised.json',
  simulations: src.simulations ?? [],
  changelog: src.changelog ?? [],
  disputed: src.disputed ?? []
};

/*
 * The figure quiz's roster, flattened the same way and for the same reason: every
 * coordinate is argued from cited acts in audit/new-quizzes/figures.verified.json, which
 * lives outside site/ and so outside the Vercel root directory. The axis order is written
 * into the file rather than assumed, and src/lib/quizzes/bible-figure.ts throws if it ever
 * stops matching the groups — a silently reordered position array would move every figure.
 *
 * Nothing is computed here. The evidence mask that decides which axes a figure is matched
 * on is derived in bible-figure.ts from these very fields, so there is nowhere for it to
 * drift out of step with the evidence.
 */
const FIGURE_AXES = ['pace', 'voice', 'lead', 'conflict', 'doubt', 'plan'];
let figureCount = 0;
if (existsSync(FIGURES_SOURCE)) {
  const src = JSON.parse(readFileSync(FIGURES_SOURCE, 'utf8'));
  const figures = src.map(f => {
    FIGURE_AXES.forEach(k => {
      if (typeof f.position?.[k] !== 'number') {
        throw new Error(`build-data: figure "${f.slug}" has no ${k} coordinate`);
      }
      if (!Array.isArray(f.evidence?.[k]) || !f.evidence[k].length) {
        throw new Error(`build-data: figure "${f.slug}" has no evidence on ${k}`);
      }
    });
    return {
      name: f.name,
      slug: f.slug,
      who: f.who,
      position: FIGURE_AXES.map(k => f.position[k]),
      evidence: Object.fromEntries(FIGURE_AXES.map(k => [k, f.evidence[k]]))
    };
  });
  figureCount = figures.length;
  writeFileSync(
    FIGURES_OUT,
    JSON.stringify(
      { generatedFrom: 'audit/new-quizzes/figures.verified.json', axisOrder: FIGURE_AXES, figures },
      null,
      1
    )
  );
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 1));
writeFileSync(ASIDE, JSON.stringify(aside, null, 1));

const splitWords = t => (t ? t.trim().split(/\s+/).length : 0);
console.log(
  'summary splits: ' +
    axes
      .map(a => `${a.name} ${splitWords(a.summaryParts.left)}/${splitWords(a.summaryParts.right)}w`)
      .join(', ')
);
console.log(
  `compass.json: ${axes.length} axes, ${statements.length} statements (${itemsPerAxis}/axis, radix ${radix}), ` +
  `${traditions.length} traditions, max distance ${out.scoring.maxDistance}\n` +
  `compass-audit.json: ${aside.simulations.length} answer sheets, ${aside.changelog.length} changelog entries, ` +
  `${aside.disputed.length} disputed findings` +
  (figureCount ? `\nbible-figures.json: ${figureCount} figures on ${FIGURE_AXES.length} axes` : '')
);
