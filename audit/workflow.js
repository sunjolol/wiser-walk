export const meta = {
  name: 'compass-fairness-audit',
  description: 'Adversarial fairness and accuracy audit of the Theology Compass quiz from every tradition, verified, synthesized into a revised data set, then re-simulated',
  phases: [
    { title: 'Review', detail: '15 tradition adversaries + historian, scholar, survey methodologist, mockery critic, copy editor' },
    { title: 'Verify', detail: 'every target adjudicated by accuracy, fairness, and necessity verifiers' },
    { title: 'Synthesize', detail: 'merge surviving findings into a revised data set and a report' },
    { title: 'Critique', detail: 'completeness critic, then a repair pass if needed' },
    { title: 'Re-simulate', detail: 'each tradition answers the revised quiz; does it land as its own nearest tradition?' },
  ],
}

const DIR = 'C:\\Users\\Light\\Desktop\\claude\\theology compass'
const DATA = DIR + '\\audit\\compass-data.json'
const HTML = DIR + '\\theology-compass.html'
const REPORT = DIR + '\\audit\\fairness-report.md'
const REVISED = DIR + '\\audit\\compass-data.revised.json'

const CONTEXT = `Context: "Theology Compass" is a tradition-neutral quiz for Christians. Eighteen statements (three per axis, answered Strongly disagree..Strongly agree) place a person on six axes (Grace, Table, Spirit, Kingdom, Tradition, Worship), each running from a LEFT pole (score 0) to a RIGHT pole (score 100). The result shows a headline label built from band adjectives, the two nearest traditions by Euclidean distance over hand-set tradition coordinates, and per-axis "where your view came from" sections (a fair two-pole summary, a dated history, key passages, read-more books). The product promise is fairness: every position described in words its holders would accept. Its audience includes discernment-minded readers who will screenshot anything unfair. The full data, including the exact scoring formulas, is in the JSON file at: ${DATA} . Read the entire file first. The demo page itself (UI wording, labels, share text) is at: ${HTML} ; read it only for wording that is not in the JSON.`

const TARGET_GUIDE = `Target ids (use EXACTLY these forms, one target per finding):
- statement:N  (N = 1..18, the "index" field)
- axis:<key>:poles | axis:<key>:summary | axis:<key>:bands | axis:<key>:history:<i> (i = 0-based position in the history array) | axis:<key>:passages | axis:<key>:readmore   where <key> is grace|table|spirit|kingdom|tradition|worship
- tradition:<exact name string from the data>   (for coordinate problems)
- scoring   (formula, thresholds, nearest-tradition math)
- labels    (headline label wording, band adjectives as a system)
- share     (share text, result copy in the HTML)
- general   (anything else: a missing axis, a missing tradition, structural fairness problems)
Severity: blocker = would be screenshotted as unfair, or makes a real adherent land on the wrong tradition, or is factually false; major = a knowledgeable reader would object; minor = polish. Do not pad. Only real problems. Quote the exact text you object to, give evidence (confession, catechism, council, standard reference work, or the arithmetic), and write the replacement text or number you would accept.`

const FINDINGS = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    simulation: {
      type: 'object',
      properties: {
        answers: { type: 'array', items: { type: 'integer' }, description: '18 integers in -2..2, in statement order' },
        scores: { type: 'array', items: { type: 'integer' }, description: 'six axis scores 0..100 in axis order' },
        headline: { type: 'string' },
        nearest_two: { type: 'array', items: { type: 'string' } },
        lands_correctly: { type: 'boolean' },
        comment: { type: 'string', description: 'show the arithmetic and say what went wrong if it did not land' }
      },
      required: ['answers', 'scores', 'headline', 'nearest_two', 'lands_correctly', 'comment']
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          target: { type: 'string' },
          category: { type: 'string', enum: ['inaccuracy', 'unfairness', 'ambiguity', 'scoring', 'missing', 'tone', 'citation', 'typo'] },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          claim: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' }
        },
        required: ['target', 'category', 'severity', 'claim', 'evidence', 'fix']
      }
    }
  },
  required: ['lens', 'findings']
}

const TRADITION_LENSES = [
  { key: 'catholic', name: 'Roman Catholic', inData: 'Roman Catholic', probe: 'Thomist vs Molinist range on grace; Scripture and Tradition as one deposit guarded by the magisterium (Dei Verbum), not "tradition over Scripture"; the Charismatic Renewal being officially welcomed; amillennial reading of Revelation 20; the Mass as sacrifice and real presence; whether "Synergist" is a word Catholics would accept for their view.' },
  { key: 'orthodox', name: 'Eastern Orthodox', inData: 'Eastern Orthodox', probe: 'synergy as the Orthodox term, but rejection of the whole Augustinian framing of the Grace axis; theosis; Tradition as the life of the Spirit in the Church, Scripture inside Tradition; no defined position on a "rapture"; whether the Western vocabulary of the poles (monergist, memorial, cessationist, dispensational) even applies; whether an Orthodox believer can answer the Kingdom and Spirit statements honestly.' },
  { key: 'lutheran', name: 'confessional Lutheran (LCMS / WELS / Book of Concord)', inData: 'Lutheran (confessional)', probe: 'monergism WITH resistible grace and no double predestination and no limited atonement (Formula of Concord XI), so a Lutheran may agree with "God chose" and also agree that grace can be resisted; baptismal regeneration and real presence without transubstantiation; sola Scriptura together with real authority of the ecumenical creeds and the Book of Concord (norma normata); amillennialism; whether the Grace statements force Lutherans into a Calvinist or Arminian box.' },
  { key: 'anglican', name: 'Anglican (broad, Thirty-Nine Articles / Book of Common Prayer)', inData: 'Anglican (broad)', probe: 'comprehensiveness across evangelical, Anglo-Catholic, and charismatic wings; Article XVII on predestination read both ways; Article VI sufficiency of Scripture together with creeds and councils; whether one coordinate for "Anglican (broad)" is defensible or whether the spread is so wide that the label misleads.' },
  { key: 'presbyterian', name: 'Presbyterian / Reformed (Westminster Standards, Three Forms of Unity)', inData: 'Presbyterian / Reformed', probe: 'covenant theology, paedobaptism with a spiritual-presence view of the Supper (so "sacramental" but not "real presence beyond a symbol" in the Catholic sense; check whether the Table statements can be answered honestly), the regulative principle (which is not the same as "liturgical" or "free"), cessationism ranging from strict to open-but-cautious, amillennial and postmillennial both common; whether the Grace band adjective "Reformed-leaning" is fair to use as a label at all when other traditions also affirm election.' },
  { key: 'reformedbaptist', name: 'Reformed Baptist (1689 London Baptist Confession)', inData: 'Reformed Baptist', probe: 'monergism with credobaptism; the Supper as spiritual presence, not bare memorial; covenant theology in a Baptist form; mostly cessationist; whether the Table axis conflates baptism and the Supper in a way that mis-scores Reformed Baptists (sacramental Supper + believer\'s baptism); whether they land nearest "Reformed Baptist" rather than "Presbyterian / Reformed" or "Southern Baptist".' },
  { key: 'sbc', name: 'Southern Baptist (Baptist Faith & Message 2000)', inData: 'Southern Baptist (typical)', probe: 'the Calvinist vs Traditionalist split inside the SBC (so a single Grace coordinate hides two populations); memorial Supper and believer\'s baptism; broad premillennialism, dispensational and historic; cessationist-leaning but with continuationist churches; sola Scriptura; whether "Southern Baptist (typical)" is a fair label and whether "typical" reads as condescending.' },
  { key: 'dispensational', name: 'Dispensationalist (Dallas / classic and progressive dispensationalism)', inData: 'Dispensational Bible church', probe: 'Israel-church distinction, pretribulational rapture, premillennialism; whether the Kingdom statements capture the difference between dispensational premillennialism and historic premillennialism (Ladd) and whether a historic premillennialist gets mis-scored as dispensational; whether "Dispensational Bible church" is a real tradition name people would recognize; whether the axis name "Kingdom" and the poles "Covenantal / Dispensational" are neutral.' },
  { key: 'wesleyan', name: 'Wesleyan / Methodist (Wesley\'s sermons, Articles of Religion, Global Methodist / UMC evangelical wing)', inData: 'Wesleyan / Methodist', probe: 'prevenient grace (Wesley is Arminian but insists grace comes first, so "the person freely cooperates" needs care); Wesley was sacramental and favored weekly communion and infant baptism, so Methodists are not memorialists; entire sanctification; the Grace summary\'s description of synergism; whether "Arminian-leaning" is a term Methodists accept.' },
  { key: 'pentecostal', name: 'Pentecostal (Assemblies of God Statement of Fundamental Truths)', inData: 'Pentecostal / Assemblies of God', probe: 'initial physical evidence, baptism in the Spirit as subsequent to conversion; Arminian soteriology; ordinances (believer\'s baptism, memorial Supper); pretribulational premillennialism in the AoG statement; whether "free worship" describes Pentecostal worship fairly; whether the Spirit statements are written in cessationist vocabulary ("sign gifts") that Pentecostals would not use.' },
  { key: 'charismatic', name: 'charismatic non-denominational (Vineyard, Bethel, Hillsong, Third Wave)', inData: 'Charismatic non-denominational', probe: 'continuationism without initial-evidence doctrine; wide soteriological spread; whether Third Wave churches are pre-trib; whether "Charismatic non-denominational" and "Pentecostal / Assemblies of God" are distinguishable at all with these six axes (if not, say so and propose what would separate them).' },
  { key: 'anabaptist', name: 'Anabaptist / Mennonite (Schleitheim Confession, Confession of Faith in a Mennonite Perspective 1995)', inData: 'Anabaptist / Mennonite', probe: 'believer\'s church, discipleship and nonresistance (which no axis measures), believer\'s baptism and memorial Supper, community hermeneutic (the congregation interprets Scripture together, which sits oddly on the Tradition axis), non-liturgical but not "Spirit-led spontaneous" either; whether the Worship poles force a false choice for Anabaptists.' },
  { key: 'churchofchrist', name: 'Church of Christ / Restoration Movement (Stone-Campbell)', inData: null, probe: 'not in the tradition list at all: baptism for the remission of sins (so "sacramental" on baptism) with a weekly memorial Supper; "no creed but Christ" (which the Tradition axis cannot represent); a cappella worship; whether a Church of Christ member would land on a nonsense nearest tradition and whether the tradition should be added with proposed coordinates.' },
  { key: 'progressive', name: 'progressive mainline Protestant (PCUSA, ELCA, Episcopal, UMC progressive wing)', inData: null, probe: 'not represented: whether the quiz silently assumes evangelical framing (inerrancy, rapture, the very existence of the Kingdom axis), whether a progressive Christian can answer honestly, and whether adding a tradition or an axis is warranted or out of scope for a quiz aimed at this audience; be candid either way.' },
  { key: 'reformedcharismatic', name: 'Reformed charismatic (John Piper, Wayne Grudem, Sam Storms, Sovereign Grace Churches, Acts 29 continuationists)', inData: null, probe: 'monergist AND continuationist: check whether the tradition list forces such a person to land on Pentecostal or Presbyterian, neither of which fits; whether the Spirit axis and the Grace axis are treated as correlated in the coordinates when they are independent; propose coordinates if a tradition entry should be added.' },
]

const CROSS_LENSES = [
  { key: 'historian', name: 'church historian', prompt: `You are a church historian (think a careful Reformation and early-church specialist) reviewing every dated line in the six "history" arrays and every date, name, and characterization in the fair summaries and read-more lists. Verify each date and attribution against standard references (Pelikan, Gonzalez, McGrath, Schaff, the primary sources). Flag: wrong dates; misattributed positions (e.g. what Chrysostom actually said about gifts, what Orange 529 actually condemned, whether Ignatius' phrasing is quoted accurately, what Marburg's fourteen articles were, whether Darby "taught a pretribulational rapture" in the 1830s is precise, whether "Wesley and Whitefield divide the revival in the 1740s" is the right decade); anachronism; and slant, where an axis history reads as one pole's victory narrative (count how many lines favor each pole). Also check the "read more" entries: do all these books exist with that author and that title, and is each one representative of its pole? Propose exact replacement lines.` },
  { key: 'scholar', name: 'biblical scholar', prompt: `You are a biblical scholar reviewing the "key_passages" for each axis and every Scripture reference in the statements and summaries. For each axis: are these the passages each pole actually reaches for (the loci classici), or are they a list that favors one side? Are chapter and verse ranges correct and conventional? Is any passage doing work it cannot bear? What is the single strongest passage for each pole that is missing? Also check the Table axis passages cover both baptism and the Supper, the Spirit axis includes 1 Corinthians 13:8-12 read both ways, the Kingdom axis includes Romans 11 and Galatians 3, and the Tradition axis includes 2 Thessalonians 2:15 and 2 Timothy 3:16-17. Give exact reference strings for any additions or corrections.` },
  { key: 'survey', name: 'survey methodologist', prompt: `You are a psychometrician and survey methodologist reviewing the eighteen statements and the scoring. For EACH statement check: double-barreled wording (two claims in one), loaded or partisan vocabulary that only one side uses (e.g. "sign gifts", "ordinance", "true Israel"), ambiguity that lets two opposite believers both agree, and whether the direction sign is correct given the pole definitions (work through each one explicitly: which pole does agreement push toward?). Per axis check: keying balance (how many +1 vs -1 items; agreement bias), whether three items give enough range (one ambiguous item swings 33 points), floor and ceiling effects, and whether "Unsure" mapping to 0 (center) is a problem. Check the scoring: the band thresholds (<=20, 21-40, 41-59, 60-79, >=80) and whether 41-59 "centered" is too wide or too narrow given only 13 possible raw scores; the headline algorithm (three largest deviations) and its failure modes (ties, a 60 reading as a strong lean); the nearest-tradition Euclidean distance across axes that are not equally weighted or equally reliable; the match percentage formula. Propose concrete rewrites (keep statements under 22 words), sign fixes, and a recommended item count per axis for v1 with two or three candidate additional statements per axis that are balanced in keying.` },
  { key: 'mockery', name: 'mockery critic', prompt: `You are the screenshot test. Read the data and the page copy as four different snarky, sharp, well-informed Christians on X would: a Reformed discernment blogger, a Catholic apologist, a Pentecostal pastor, and an Orthodox convert. Each is looking for the one line to screenshot with the caption "lol, this quiz was written by a ___". Find those lines: statements that reveal the author's side, band adjectives that flatter or belittle ("firmly", "cautious about the gifts", "informal in worship", "Scripture-first"), the label "A theological centrist", the axis names and pole names, the share text with emoji, the tradition names ("Southern Baptist (typical)", "Dispensational Bible church"), the fair summaries, and the read-more picks (does one side get Sproul and Calvin while the other gets a popularizer?). For each, say who screenshots it, what the caption would be, and the rewrite that survives. Be ruthless and specific; also say what is already well done so it is not "fixed" into blandness.` },
  { key: 'copy', name: 'copy editor', prompt: `You are a meticulous copy editor. Check every string in the data and the user-facing copy in the HTML for: typos; inconsistent naming (the Tradition axis poles are "With tradition" and "Scripture alone" in one place and other phrasings elsewhere; check every occurrence); capitalization of theological terms; curly vs straight quotes and apostrophes; en dashes in date ranges; statement length (max 22 words; count each); grammatical fit of band adjectives when joined as "A, B, C" in a headline (e.g. "Covenantal, firmly monergist, sacramental" reads fine, but check every combination of first-position adjectives for capitalization and readability); the share text alignment of the circle bars; the caption under the share text; the footer; the intro copy. Report each with the exact current string and the corrected string.` },
]

function traditionPrompt(l) {
  const coordNote = l.inData
    ? `Your tradition appears in the tradition list as "${l.inData}"; audit its six coordinates.`
    : `Your tradition is NOT in the tradition list. Decide whether it should be added (with proposed six coordinates and a name) or whether the quiz's scope makes that unnecessary, and report what a member of your tradition lands on today and whether that is embarrassing.`
  return `${CONTEXT}

You are a well-read, confessionally committed ${l.name} theologian, the kind of seminary professor who would be asked to vet this quiz before it goes public. Your job is adversarial: find every way the quiz misrepresents, caricatures, mis-scores, or slights your tradition, and every place a knowledgeable member of your tradition would say "that is not what we believe", "that is another tradition's vocabulary", or "that is unfair to the other side too". Things to probe for your tradition specifically: ${l.probe}

Work through, in order:
1. Each of the 18 statements: can a typical, informed member of your tradition answer it honestly? Is it double-barreled, loaded, or written in another tradition's vocabulary? Given how your tradition would answer, does the direction sign push the score the right way?
2. The six axes' poles: do the two poles capture your tradition's real position, or does your tradition fall off the axis?
3. Each axis "fair_summary": is your side described in words you would accept? Is the other side described fairly too (you lose credibility if you only complain about your own side)?
4. Every history line and read-more entry that concerns your tradition.
5. The key passages: are these the ones your tradition actually reaches for?
6. SIMULATION (required, put it in the "simulation" field): answer all 18 statements as a typical, informed member of your tradition would, using integers -2..2. Compute the six axis scores with the exact formula in the JSON (raw = sum of direction * answer over the axis's three statements; score = round((raw + 6) / 12 * 100)). Compute the headline using the bands. Compute the Euclidean distance to EVERY tradition in the list and report the two nearest. ${coordNote} If your tradition (or the closest thing to it) is not the nearest, that is a blocker: propose a coordinate change or a statement change that would fix it, and show the arithmetic in the comment.
7. The band adjectives for each axis: accurate and non-pejorative for your tradition?
8. Anything essential that is missing to place a member of your tradition (a statement, an axis, a tradition entry).

${TARGET_GUIDE}

Return: lens = "${l.name}", the simulation, and the findings.`
}

function crossPrompt(l) {
  return `${CONTEXT}

${l.prompt}

${TARGET_GUIDE}

Return: lens = "${l.name}" and the findings (no simulation needed).`
}

/* ---------- Phase 1: Review (barrier: verification groups findings across all lenses) ---------- */
phase('Review')
const lenses = [
  ...TRADITION_LENSES.map(l => ({ key: l.key, label: 'review:' + l.key, prompt: traditionPrompt(l), tradition: l.inData || l.name })),
  ...CROSS_LENSES.map(l => ({ key: l.key, label: 'review:' + l.key, prompt: crossPrompt(l), tradition: null })),
]
const reviews = await parallel(lenses.map(l => () =>
  agent(l.prompt, { label: l.label, phase: 'Review', schema: FINDINGS }).then(r => r && ({ ...r, key: l.key }))
))
const okReviews = reviews.filter(Boolean)
log(`Review: ${okReviews.length}/${lenses.length} lenses returned`)

const findings = []
okReviews.forEach(r => r.findings.forEach((f, i) => findings.push({ id: r.key + '-' + (i + 1), lens: r.lens, ...f })))
const sims = okReviews.filter(r => r.simulation).map(r => ({ lens: r.lens, ...r.simulation }))
const failedSims = sims.filter(s => !s.lands_correctly)
log(`${findings.length} findings raised; ${sims.length} simulations, ${failedSims.length} landed on the wrong tradition: ${failedSims.map(s => s.lens).join('; ') || 'none'}`)

/* group by target */
const byTarget = {}
findings.forEach(f => { (byTarget[f.target] = byTarget[f.target] || []).push(f) })
const targets = Object.keys(byTarget)
log(`${targets.length} distinct targets to verify`)

/* ---------- Phase 2: Verify (pipeline per target, three lenses each) ---------- */
const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          keep: { type: 'boolean' },
          reason: { type: 'string' },
          revised_fix: { type: 'string', description: 'only when the finding is right but its proposed fix is wrong or incomplete' }
        },
        required: ['id', 'keep', 'reason']
      }
    }
  },
  required: ['verdicts']
}
const VERIFY_LENSES = {
  accuracy: 'ACCURACY: is the finding\'s claim factually correct? Check the evidence against the confessions, catechisms, councils, and standard reference works. If the reviewer\'s evidence is wrong, or the current text is defensible as written, drop it.',
  fairness: 'FAIRNESS: would a fair-minded, informed adherent of the OTHER pole(s) and of the other traditions accept the proposed fix as neutral? Drop any finding whose fix trades one bias for another, or that only pleads one tradition\'s special case at everyone else\'s expense. Keep findings where the current text really does favor a side.',
  necessity: 'NECESSITY: does this need to change for the quiz to be credible with a discerning Christian audience, or is it pedantry, style preference, scope creep, or a request to turn a 3-minute quiz into a seminary exam? Drop pedantry and scope creep. Keep anything that would embarrass the author if screenshotted, anything that mis-scores a real adherent, and anything factually false.',
}
function verifyPrompt(lensKey, target, items) {
  return `${CONTEXT}

You are the ${lensKey.toUpperCase()} verifier for the target "${target}" of the quiz. Read the JSON file and locate the exact current content for this target (statement text and direction, axis field, tradition coordinates, or the scoring rules). Then adjudicate each finding below. Your lens: ${VERIFY_LENSES[lensKey]} Default to drop when uncertain. When a finding is right but its fix is wrong or incomplete, keep it and supply a revised_fix (exact replacement text or numbers).

Findings for this target (JSON):
${JSON.stringify(items.map(f => ({ id: f.id, lens: f.lens, category: f.category, severity: f.severity, claim: f.claim, evidence: f.evidence, fix: f.fix })), null, 1)}

Return one verdict per finding id.`
}

phase('Verify')
const verified = await pipeline(
  targets,
  target => parallel(Object.keys(VERIFY_LENSES).map(lk => () =>
    agent(verifyPrompt(lk, target, byTarget[target]), { label: 'verify:' + lk + ':' + target, phase: 'Verify', schema: VERDICTS })
      .then(v => v && ({ lens: lk, verdicts: v.verdicts }))
  )),
  (votes, target) => {
    const vs = votes.filter(Boolean)
    return byTarget[target].map(f => {
      const mine = vs.map(v => (v.verdicts.find(x => x.id === f.id))).filter(Boolean)
      const keeps = mine.filter(x => x.keep)
      const kept = keeps.length >= 2 || (vs.length < 3 && keeps.length >= Math.ceil(vs.length / 2) && vs.length > 0)
      return { ...f, kept, votes: mine.map(x => ({ lens: vs[mine.indexOf(x)] ? vs[mine.indexOf(x)].lens : '?', keep: x.keep, reason: x.reason, revised_fix: x.revised_fix || null })), revised_fixes: keeps.map(x => x.revised_fix).filter(Boolean) }
    })
  }
)
const adjudicated = verified.filter(Boolean).flat()
const kept = adjudicated.filter(f => f.kept)
const dropped = adjudicated.filter(f => !f.kept)
const bySev = s => kept.filter(f => f.severity === s).length
log(`Verify: ${kept.length} findings survive (${bySev('blocker')} blockers, ${bySev('major')} major, ${bySev('minor')} minor); ${dropped.length} dropped`)

/* ---------- Phase 3: Synthesize ---------- */
phase('Synthesize')
const SYNTH = {
  type: 'object',
  properties: {
    report_path: { type: 'string' },
    revised_path: { type: 'string' },
    summary: { type: 'string' },
    counts: { type: 'object', properties: { blockers: { type: 'integer' }, majors: { type: 'integer' }, minors: { type: 'integer' }, disputed: { type: 'integer' } }, required: ['blockers', 'majors', 'minors', 'disputed'] },
    statements_changed: { type: 'integer' },
    traditions_changed: { type: 'integer' },
    traditions_added: { type: 'array', items: { type: 'string' } }
  },
  required: ['report_path', 'revised_path', 'summary', 'counts', 'statements_changed', 'traditions_changed', 'traditions_added']
}
const synthPrompt = `${CONTEXT}

You are the editor who owns the final data set. Below are the findings that survived a three-lens adversarial verification (accuracy, fairness, necessity), with the votes and any revised fixes, plus the findings that were dropped (for context only; do not apply them unless a kept finding depends on one). Also below are the simulation results from each tradition adversary (their answers, scores, and whether they landed on their own tradition).

Produce two files with the Write tool:

1. ${REVISED} : a JSON file with EXACTLY the same shape as the original data file (note, scoring, axes, statements, traditions), with every kept finding applied. Rules: keep six axes; keep exactly three statements per axis in "statements" (the demo needs 18) but ADD a top-level "candidate_statements" array with 2-3 extra balanced statements per axis for v1, each with axis, direction, and text; keep every statement under 22 words; make sure each statement's direction sign is correct for its poles and that each axis has at least one +1 and one -1 keyed item; you may rename poles, band adjectives, axis names, and tradition names; you may add traditions (with six coordinates) when a kept finding calls for it, and you must adjust coordinates for any tradition whose adversary failed to land on itself. Add a top-level "changelog" array: one entry per change with {target, finding_ids, before, after, why}. Add a top-level "disputed" array for kept findings you chose NOT to apply, with the reason.

2. ${REPORT} : a Markdown report for the author, written plainly: an executive summary (is the quiz publishable after these changes?), the blockers with before/after, the major changes grouped by axis, tradition coordinate changes as a table (old six numbers, new six numbers, why), the simulation table (each tradition: landed correctly before? expected after?), the disputed items with your reasoning, the dropped-findings count with the three most instructive drops, and a short "for v1" section (recommended items per axis, traditions to add, axes that may need renaming). No hedging filler; every claim in the report must trace to a finding id.

After writing both files, return the two paths, a two-sentence summary, the counts, how many statements changed, how many tradition coordinates changed, and the names of any traditions added.

KEPT FINDINGS:
${JSON.stringify(kept.map(f => ({ id: f.id, target: f.target, severity: f.severity, category: f.category, lens: f.lens, claim: f.claim, evidence: f.evidence, fix: f.fix, revised_fixes: f.revised_fixes, votes: f.votes.map(v => v.lens + ':' + (v.keep ? 'keep' : 'drop') + ' - ' + v.reason) })), null, 1)}

DROPPED FINDINGS (context only):
${JSON.stringify(dropped.map(f => ({ id: f.id, target: f.target, severity: f.severity, claim: f.claim, why_dropped: f.votes.filter(v => !v.keep).map(v => v.reason) })), null, 1)}

SIMULATIONS:
${JSON.stringify(sims, null, 1)}`
const synth = await agent(synthPrompt, { label: 'synthesize', phase: 'Synthesize', schema: SYNTH, effort: 'xhigh' })
if (!synth) throw new Error('synthesis agent returned nothing')
log(`Synthesize: ${synth.summary}`)

/* ---------- Phase 4: Critique + repair ---------- */
phase('Critique')
const CRIT = {
  type: 'object',
  properties: {
    publishable: { type: 'boolean' },
    problems: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'where', 'problem', 'fix'] } }
  },
  required: ['publishable', 'problems']
}
const critPrompt = `${CONTEXT}

You are the completeness critic. Read the original data (${DATA}), the revised data (${REVISED}), and the report (${REPORT}). Your question is "what is missing or broken?": a kept finding listed in the report but not actually applied in the revised JSON; a statement whose text changed but whose direction sign was not re-checked (re-derive every sign from the poles yourself); an axis left without both a +1 and a -1 item; any statement over 22 words; a tradition coordinate changed without rationale, or a simulation failure in the report left unaddressed; the revised JSON no longer matching the original shape (fields renamed or dropped) so the demo page could not be regenerated from it; band adjectives that no longer read as a headline when joined; renamed poles used inconsistently across summary, bands, share text; a report claim with no finding id; anything the report calls publishable that clearly is not. Also verify by hand the arithmetic of two simulations of your choice using the REVISED statements and coordinates. List each problem with an exact fix. Say whether the revised set is publishable as the demo's data.`
const crit = await agent(critPrompt, { label: 'critic', phase: 'Critique', schema: CRIT, effort: 'high' })
const critProblems = crit ? crit.problems : []
const serious = critProblems.filter(p => p.severity !== 'minor')
log(`Critique: ${critProblems.length} problems (${serious.length} serious); publishable=${crit ? crit.publishable : 'unknown'}`)
let repair = null
if (critProblems.length) {
  repair = await agent(`${CONTEXT}

You are the repair editor. Apply every problem below to the files in place using Read and Edit (or Write): ${REVISED} and ${REPORT}. Keep the JSON shape identical to the original data file's shape (plus candidate_statements, changelog, disputed). Append a "## Repair pass" section to the report listing what you changed. Return a short plain-text list of what you changed.

PROBLEMS:
${JSON.stringify(critProblems, null, 1)}`, { label: 'repair', phase: 'Critique', effort: 'high' })
  log('Repair pass done')
}

/* ---------- Phase 5: Re-simulate every tradition against the revised quiz ---------- */
phase('Re-simulate')
const RESIM = {
  type: 'object',
  properties: {
    tradition: { type: 'string' },
    matched_name_in_revised: { type: 'string' },
    answers: { type: 'array', items: { type: 'integer' } },
    scores: { type: 'array', items: { type: 'integer' } },
    headline: { type: 'string' },
    nearest_two: { type: 'array', items: { type: 'string' } },
    lands_correctly: { type: 'boolean' },
    comment: { type: 'string' }
  },
  required: ['tradition', 'matched_name_in_revised', 'answers', 'scores', 'headline', 'nearest_two', 'lands_correctly', 'comment']
}
const resimList = TRADITION_LENSES.filter(l => l.inData || l.key === 'churchofchrist' || l.key === 'reformedcharismatic')
const resims = await parallel(resimList.map(l => () =>
  agent(`${CONTEXT}

Use ONLY the REVISED data at ${REVISED} (statements, directions, bands, tradition coordinates). You are a typical, informed member of the ${l.name} tradition. Answer every statement honestly as that person (-2..2), compute the six scores with the formula, compute the headline from the bands, compute Euclidean distance to every tradition in the revised list, and report the two nearest. Your tradition's entry in the revised list is the closest-named one (report which name you matched; if there is none, say so and treat lands_correctly as false only if the nearest result would embarrass a member of your tradition). Show the arithmetic in the comment.`, { label: 'resim:' + l.key, phase: 'Re-simulate', schema: RESIM, effort: 'medium' })
))
const resimOk = resims.filter(Boolean)
const resimFail = resimOk.filter(r => !r.lands_correctly)
log(`Re-simulate: ${resimOk.length - resimFail.length}/${resimOk.length} traditions land on themselves; failures: ${resimFail.map(r => r.tradition + ' -> ' + r.nearest_two.join(' / ')).join('; ') || 'none'}`)

return {
  report: synth.report_path,
  revised: synth.revised_path,
  synthesis: synth,
  review: { lenses: okReviews.length, findings: findings.length, simulations_failed_before: failedSims.map(s => ({ lens: s.lens, nearest: s.nearest_two })) },
  verify: { kept: kept.length, dropped: dropped.length, blockers: bySev('blocker'), majors: bySev('major'), minors: bySev('minor') },
  critique: { publishable: crit ? crit.publishable : null, problems: critProblems, repaired: !!repair },
  resimulation: resimOk.map(r => ({ tradition: r.tradition, matched: r.matched_name_in_revised, lands_correctly: r.lands_correctly, nearest_two: r.nearest_two, scores: r.scores, headline: r.headline })),
}