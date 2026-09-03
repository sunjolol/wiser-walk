// Recover the Review-phase results of workflow run wf_2bfa24ac-bd3 from the agent transcripts.
const fs = require('fs'), path = require('path');
const dir = 'C:/Users/Light/.claude/projects/C--Users-Light-Desktop-claude-theology-compass/27177af2-db47-47c6-9643-526ee4ecfe27/subagents/workflows/wf_2bfa24ac-bd3';
const NAME_TO_KEY = {
  'Roman Catholic': 'catholic', 'Eastern Orthodox': 'orthodox',
  'confessional Lutheran (LCMS / WELS / Book of Concord)': 'lutheran',
  'Anglican (broad, Thirty-Nine Articles / Book of Common Prayer)': 'anglican',
  'Presbyterian / Reformed (Westminster Standards, Three Forms of Unity)': 'presbyterian',
  'Reformed Baptist (1689 London Baptist Confession)': 'reformedbaptist',
  'Southern Baptist (Baptist Faith & Message 2000)': 'sbc',
  'Dispensationalist (Dallas / classic and progressive dispensationalism)': 'dispensational',
  "Wesleyan / Methodist (Wesley's sermons, Articles of Religion, Global Methodist / UMC evangelical wing)": 'wesleyan',
  'Pentecostal (Assemblies of God Statement of Fundamental Truths)': 'pentecostal',
  'charismatic non-denominational (Vineyard, Bethel, Hillsong, Third Wave)': 'charismatic',
  'Anabaptist / Mennonite (Schleitheim Confession, Confession of Faith in a Mennonite Perspective 1995)': 'anabaptist',
  'Church of Christ / Restoration Movement (Stone-Campbell)': 'churchofchrist',
  'progressive mainline Protestant (PCUSA, ELCA, Episcopal, UMC progressive wing)': 'progressive',
  'Reformed charismatic (John Piper, Wayne Grudem, Sam Storms, Sovereign Grace Churches, Acts 29 continuationists)': 'reformedcharismatic',
  'church historian': 'historian', 'biblical scholar': 'scholar', 'survey methodologist': 'survey', 'mockery critic': 'mockery', 'copy editor': 'copy'
};
const HINTS = [['Catholic','catholic'],['Orthodox','orthodox'],['Lutheran','lutheran'],['Anglican','anglican'],['Presbyterian','presbyterian'],['Reformed Baptist','reformedbaptist'],['Southern Baptist','sbc'],['Dispensation','dispensational'],['Wesley','wesleyan'],['Pentecostal','pentecostal'],['harismatic non','charismatic'],['Anabaptist','anabaptist'],['Church of Christ','churchofchrist'],['progressive','progressive'],['Reformed charismatic','reformedcharismatic'],['historian','historian'],['biblical scholar','scholar'],['survey','survey'],['mockery','mockery'],['copy editor','copy']];
function keyFor(lens) {
  if (NAME_TO_KEY[lens]) return NAME_TO_KEY[lens];
  const l = String(lens);
  for (const [h, k] of HINTS) if (l.toLowerCase().includes(h.toLowerCase())) return k;
  return l.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
}
const out = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.jsonl') || !f.startsWith('agent-')) continue;
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  if (!text.includes('StructuredOutput')) continue;
  let result = null;
  for (const line of text.split('\n')) {
    if (!line.includes('StructuredOutput')) continue;
    let j; try { j = JSON.parse(line); } catch (e) { continue; }
    const content = j.message && Array.isArray(j.message.content) ? j.message.content : [];
    for (const c of content) if (c.type === 'tool_use' && c.name === 'StructuredOutput' && c.input && Array.isArray(c.input.findings)) result = c.input;
  }
  if (!result) continue;
  out.push({ key: keyFor(result.lens), lens: result.lens, simulation: result.simulation || null, findings: result.findings, transcript: f });
}
const seen = {}; out.forEach(r => { if (seen[r.key]) console.log('DUPLICATE key', r.key); seen[r.key] = 1; });
out.sort((a, b) => a.key.localeCompare(b.key));
fs.writeFileSync('audit/review-results.json', JSON.stringify(out, null, 1));
const total = out.reduce((n, r) => n + r.findings.length, 0);
console.log('recovered', out.length, 'reviews,', total, 'findings, bytes', fs.statSync('audit/review-results.json').size);
for (const r of out) console.log(' ', r.key.padEnd(20), String(r.findings.length).padStart(3), 'findings', r.simulation ? ('| lands=' + r.simulation.lands_correctly + ' nearest=' + (r.simulation.nearest_two || []).join(' / ')) : '');
const sev = {}; out.forEach(r => r.findings.forEach(f => { sev[f.severity] = (sev[f.severity] || 0) + 1; }));
console.log('severity', JSON.stringify(sev));
const targets = new Set(); out.forEach(r => r.findings.forEach(f => targets.add(f.target)));
console.log('distinct targets', targets.size);
