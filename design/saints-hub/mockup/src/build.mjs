// Assembles the mock-up page from the site's real data. Run: node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'C:/Users/Light/Desktop/claude/theology compass/site/src/data';
const WEC = JSON.parse(fs.readFileSync(path.join(REPO, 'which-early-christian.json'), 'utf8'));
const PT = JSON.parse(fs.readFileSync(path.join(REPO, 'personality.json'), 'utf8'));
const out = path.join(here, '..', 'index.html');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TYPES = PT.TYPES;
const tname = k => TYPES[k].name;
const tink = k => TYPES[k].ink;

/* ---------- the 22, from which-early-christian.json */
const FOCUS = {
  justin: '50% 14%', irenaeus: '50% 30%', clement: '50% 22%', tertullian: '45% 22%', origen: '50% 25%',
  cyprian: '50% 12%', lactantius: '50% 35%', antony: '50% 12%', martin: '50% 9%', macrina: '50% 10%',
  nazianzen: '50% 8%', basil: '50% 10%', nyssa: '50% 25%', ambrose: '50% 30%', chrysostom: '50% 25%',
  jerome: '70% 40%', augustine: '50% 30%', cassian: '50% 35%', boethius: '50% 45%', benedict: '40% 25%',
  gregory: '55% 20%', isaac: '50% 22%'
};
const GROUPS = {
  justin: 'fathers martyrs', irenaeus: 'fathers', clement: 'fathers', tertullian: 'fathers', origen: 'fathers',
  cyprian: 'fathers martyrs', lactantius: 'fathers', antony: 'desert monks', martin: 'monks', macrina: 'cappadocians women monks',
  nazianzen: 'fathers cappadocians teachers', basil: 'fathers cappadocians teachers', nyssa: 'fathers cappadocians',
  ambrose: 'fathers teachers', chrysostom: 'fathers teachers', jerome: 'fathers teachers', augustine: 'fathers teachers',
  cassian: 'fathers desert monks', boethius: '', benedict: 'monks', gregory: 'fathers teachers', isaac: 'fathers monks'
};
const CENT = {
  justin: 'pre300', irenaeus: 'pre300', clement: 'pre300', tertullian: 'pre300', origen: 'pre300', cyprian: 'pre300',
  lactantius: '300s', antony: '300s', martin: '300s', macrina: '300s', nazianzen: '300s', basil: '300s', nyssa: '300s', ambrose: '300s',
  chrysostom: '400s', jerome: '400s', augustine: '400s', cassian: '400s',
  boethius: '500on', benedict: '500on', gregory: '500on', isaac: '500on'
};
const SIDE = {
  justin: 'east', irenaeus: 'east west', clement: 'east', tertullian: 'west', origen: 'east', cyprian: 'west', lactantius: 'west',
  antony: 'east', martin: 'west', macrina: 'east', nazianzen: 'east', basil: 'east', nyssa: 'east', ambrose: 'west',
  chrysostom: 'east', jerome: 'west', augustine: 'west', cassian: 'east west', boethius: 'west', benedict: 'west', gregory: 'west', isaac: 'east'
};
// the Christian Personality Test's placements (TYPES.kindred and OPPOSITES in personality.json)
const TYPEOF = {
  antony: ['hearth'], augustine: ['spark', true], gregory: ['deepwell'], chrysostom: ['forge'], jerome: ['forge'],
  nazianzen: ['stillwater'], martin: ['oak'], benedict: ['oak'], basil: ['herald', true]
};
const ALIAS = {
  antony: 'anthony', nazianzen: 'gregory the theologian nazianzen nazianzus', nyssa: 'nyssen', chrysostom: 'john golden mouth',
  augustine: 'hippo', cassian: 'john', isaac: 'isaac of nineveh', gregory: 'pope gregory i dialogus', macrina: 'macrina'
};

/* ---------- the test's other people, where a face exists. Lines are drawn from the test's own text. */
const EXTRA = [
  { key: 'arsenius', name: 'Arsenius the Great', img: 'arsenius', dates: '4th to 5th century', who: 'A desert monk who fled the world to pray.', groups: 'desert monks', cent: '400s', side: 'east', type: 'stillwater', after: 'jerome' },
  { key: 'monica', name: 'Monica', img: 'monica', dates: '4th century', who: 'Augustine’s mother. She wept and prayed for him for years.', groups: 'women', cent: '300s', side: 'west', type: 'deepwell', after: 'macrina' },
  { key: 'cuthbert', name: 'Cuthbert of Lindisfarne', img: 'cuthbert-of-lindisfarne', dates: '7th century', who: 'Made a bishop, he went back after two years to live alone on the island of Farne.', groups: 'monks', cent: '500on', side: 'west', type: 'hearth', after: 'isaac' },
  { key: 'guthlac', name: 'Guthlac of Crowland', img: 'guthlac-of-crowland', dates: '7th to 8th century', who: 'He led a war band for nine years, then lived as a hermit in the fens.', groups: 'monks', cent: '500on', side: 'west', type: 'hearth', after: 'cuthbert' },
  { key: 'philip', name: 'Philip Neri', img: 'philip-neri', dates: '16th century', who: 'His door was always open. His room was called “the Shelter of Christian Mirth”.', groups: '', cent: '500on', side: 'west', type: 'spark', after: 'guthlac' }
];
const BIBLE = [
  { key: 'moses', name: 'Moses', img: 'moses', dates: 'Old Testament', who: 'He begged God to send someone else. Then he led a whole people through the desert for forty years.', type: 'lookout', page: true },
  { key: 'gideon', name: 'Gideon', img: 'gideon', dates: 'Old Testament', who: 'He obeyed God, but he did it at night, because he was afraid.', type: 'lookout', page: true },
  { key: 'elijah', name: 'Elijah', img: 'elijah', dates: 'Old Testament', who: 'After his great victory on Carmel he ran into the wilderness and sat under a tree.', type: 'deepwell', page: true },
  { key: 'isaiah', name: 'Isaiah', img: 'isaiah', dates: 'Old Testament', who: 'When God asked, “Whom shall I send?”, he answered, “Here am I. Send me!”', type: 'herald' },
  { key: 'jeremiah', name: 'Jeremiah', img: 'jeremiah', dates: 'Old Testament', who: 'When God called him, he pleaded that he was too young to speak.', type: 'stillwater' },
  { key: 'john-baptist', name: 'John the Baptist', img: 'john-the-baptist', dates: 'New Testament', who: 'He lived in the wilderness until the day he began to preach.', type: 'oak', page: true },
  { key: 'mary-bethany', name: 'Mary of Bethany', img: 'mary-bethany', dates: 'New Testament', who: 'She sat at the Lord’s feet and listened, while her sister Martha served.', type: 'oak', groups: 'women' },
  { key: 'martha', name: 'Martha', img: 'martha', dates: 'New Testament', who: 'Busy with all the preparations. When her brother died, she went out to meet Jesus.', type: 'lookout', groups: 'women', page: true },
  { key: 'peter', name: 'Peter', img: 'peter', dates: 'New Testament', who: 'He denied Christ three times. Then he wept, came back, and led the Church.', type: 'herald', page: true },
  { key: 'barnabas', name: 'Barnabas', img: 'barnabas', dates: 'New Testament', who: 'The “Son of Encouragement”, who wanted to give young Mark a second chance.', type: 'hearth', page: true },
  { key: 'paul', name: 'Paul', img: 'paul', dates: 'New Testament', who: 'He would not give Mark a second chance. Years later he asked for him.', type: 'forge', page: true }
];

function card(o) {
  const t = o.type ? `<span class="pcard-foot"><span class="tchip" style="--t:${tink(o.type)}" title="The Christian Personality Test's reading">${esc(tname(o.type))}${o.young ? ', young' : ''}</span></span>` : '';
  const status = o.status ? `<span class="pcard-s">${esc(o.status)}</span>` : '';
  const href = o.key === 'martin' ? '#martin' : '#';
  const dead = o.key === 'martin' ? '' : ' data-dead';
  return `<a class="pcard" href="${href}"${dead} data-groups="${o.groups || ''}" data-cent="${o.cent}" data-side="${o.side || ''}" data-type="${o.type || ''}" data-search="${esc((o.name + ' ' + (o.alias || '')).toLowerCase())}">`
    + `<span class="pcard-pic"><img src="${o.src}" alt="${esc(o.alt)}" loading="lazy" style="object-position:${o.focus}"></span>`
    + `<span class="pcard-b"><span class="pcard-n">${esc(o.name)}</span><span class="pcard-d">${esc(o.dates)}</span>`
    + `<span class="pcard-w">${esc(o.who)}</span>${status}${t}</span></a>`;
}

const cards = [];
for (const k of WEC.oldestFirst) {
  const p = WEC.people[k];
  let who = p.who;
  if (k === 'martin') who = 'Soldier turned monk and bishop, and one of the best loved saints of Gaul.';
  const src = k === 'ambrose' ? 'img/f/ambrose-of-milan.jpg' : `img/p/${p.slug}.jpg`;
  const alt = (p.portrait.credit || '').split('. Wikimedia')[0].replace(/\.$/, '');
  const [type, young] = TYPEOF[k] || [];
  cards.push({ key: k, card: card({
    key: k, name: p.name, dates: p.dates, who, status: p.status ? 'Not counted a saint.' : '',
    src, alt, focus: k === 'ambrose' ? '50% 40%' : FOCUS[k], groups: GROUPS[k], cent: CENT[k], side: SIDE[k],
    type, young, alias: ALIAS[k]
  }) });
}
for (const e of EXTRA) {
  const i = cards.findIndex(c => c.key === e.after);
  cards.splice(i + 1, 0, { key: e.key, card: card({ ...e, src: `img/f/${e.img}.jpg`, alt: `Portrait of ${e.name}`, focus: '50% 40%' }) });
}
for (const b of BIBLE) {
  cards.push({ key: b.key, card: card({ ...b, groups: ('bible ' + (b.groups || '')).trim(), cent: 'bible', side: '', src: `img/f/${b.img}.jpg`, alt: `Portrait of ${b.name}`, focus: '50% 40%' }) });
}
const PEOPLE = cards.map(c => c.card).join('\n');

/* ---------- the wall of portraits in the hub's band */
const WALL = ['justin-martyr', 'antony-the-great', 'basil-the-great', 'john-chrysostom', 'martin-of-tours', 'macrina-the-younger',
  'irenaeus-of-lyons', 'augustine-of-hippo', 'gregory-of-nazianzus', 'cyprian-of-carthage', 'benedict-of-nursia', 'isaac-the-syrian']
  .map(s => `<img src="img/p/${s}.jpg" alt="" style="object-position:${FOCUS[Object.keys(WEC.people).find(k => WEC.people[k].slug === s)] || '50% 20%'}">`).join('');

/* ---------- collections */
const COLL = [
  ['fathers', 'Church Fathers', ['p/justin-martyr', 'p/irenaeus-of-lyons', 'p/origen', 'p/augustine-of-hippo']],
  ['desert', 'Desert fathers and mothers', ['p/antony-the-great']],
  ['cappadocians', 'The Cappadocian fathers', ['p/basil-the-great', 'p/gregory-of-nazianzus', 'p/gregory-of-nyssa']],
  ['teachers', 'Great teachers of East and West', ['p/john-chrysostom', 'f/ambrose-of-milan', 'p/gregory-the-great']],
  ['martyrs', 'Martyrs', ['p/cyprian-of-carthage']],
  ['women', 'Women of the early Church', ['p/macrina-the-younger']],
  ['bible', 'People of the Bible', ['f/moses', 'f/isaiah', 'f/peter']]
];
const COLLS = COLL.map(([g, t, imgs]) => `<button class="coll" type="button" data-group="${g}">`
  + `<span class="coll-art">${imgs.map(i => `<img src="img/${i}.jpg" alt="" loading="lazy" style="object-position:50% 18%">`).join('')}</span>`
  + `<span class="coll-t">${esc(t)}</span></button>`).join('\n');

/* ---------- filters: one pill per kind on wide screens, a "Filters" sheet on phones.
   Several picks in one kind widen the list (Martyrs or Women); picks in different kinds narrow it. */
const FGROUPS = [
  { key: 'group', label: 'Group', opts: COLL.map(([g, t]) => [g, t]).concat([['monks', 'Monks and hermits']]) },
  { key: 'cent', label: 'Lived', opts: [['pre300', 'Before 300'], ['300s', 'The 300s'], ['400s', 'The 400s'], ['500on', '500 and later'], ['bible', 'In the Bible']] },
  { key: 'side', label: 'East or West', opts: [['east', 'East'], ['west', 'West']] },
  { key: 'type', label: 'Personality type', note: 'Where the Christian Personality Test places them. Our reading, not a church’s.',
    opts: Object.keys(TYPES).map(k => [k, tname(k), tink(k)]) }
];
const SLIDERS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';
const CROSS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const optList = g => '<div class="fopts">' + g.opts.map(([v, l, ink]) =>
  `<button class="fopt" type="button" data-key="${g.key}" data-val="${v}" aria-pressed="false">`
  + (ink ? `<i style="--t:${ink}"></i>` : '') + `<span>${esc(l)}</span><b class="fopt-n"></b></button>`).join('') + '</div>';
const fnote = g => g.note ? `<p class="fnote">${esc(g.note)}</p>` : '';
const FILTERS = `<div class="ftool-bar">
    <button class="fbtn" type="button" id="f-open" aria-haspopup="dialog" aria-controls="f-sheet">${SLIDERS}<span>Filters</span><span class="fbadge" id="f-badge" hidden></span></button>
    <div class="fpills">${FGROUPS.map(g => `
      <div class="fpill-w"><button class="fpill" type="button" data-pop="${g.key}" aria-expanded="false" aria-controls="pop-${g.key}"><span>${esc(g.label)}</span><span class="fpill-n" hidden></span><span class="fcaret" aria-hidden="true"></span></button>
        <div class="fpop" id="pop-${g.key}" role="group" aria-label="${esc(g.label)}" hidden>${fnote(g)}${optList(g)}
          <div class="fpop-f"><button class="fclear" type="button" data-clear="${g.key}">Clear</button><button class="fdone" type="button">Done</button></div>
        </div></div>`).join('')}
    </div>
    <p class="people-count" id="people-count" aria-live="polite">38 people</p>
  </div>
  <div class="factive" id="f-active" hidden></div>`;
const SHEET = `<dialog class="fsheet" id="f-sheet" aria-labelledby="f-sheet-t">
  <div class="fsheet-h"><span class="fsheet-grab" aria-hidden="true"></span><h2 id="f-sheet-t">Filters</h2>
    <button class="fsheet-x" type="button" aria-label="Close">${CROSS}</button></div>
  <div class="fsheet-b">${FGROUPS.map(g => `
    <section class="fgroup"><h3 class="fgroup-t">${esc(g.label)}</h3>${fnote(g)}${optList(g)}</section>`).join('')}
  </div>
  <div class="fsheet-f"><button class="fclear" type="button" data-clear-all>Clear all</button><button class="btn fshow" type="button" id="f-show">Show 38 people</button></div>
</dialog>`;

/* ---------- Where he stood, from Martin's cells */
const PLACE = { laugh: 'chapter 27', alone: 'Dialogue II, chapter 4', calm: 'chapter 27', body: 'Letter 3', war: 'chapter 4' };
const URL = {
  laugh: 'https://ccel.org/ccel/schaff/npnf211/npnf211.ii.ii.xxviii.html', calm: 'https://ccel.org/ccel/schaff/npnf211/npnf211.ii.ii.xxviii.html',
  alone: 'https://ccel.org/ccel/schaff/npnf211/npnf211.ii.iv.ii.iv.html', body: 'https://ccel.org/ccel/schaff/npnf211/npnf211.ii.iii.iii.html',
  war: 'https://ccel.org/ccel/schaff/npnf211/npnf211.ii.ii.v.html'
};
const VERB = { '-2': 'Martin strongly disagrees', '-1': 'Martin disagrees', '1': 'Martin agrees', '2': 'Martin strongly agrees' };
const m = WEC.people.martin;
const STANCES = WEC.statements.filter(s => m.cells[s.id]).map(s => {
  const c = m.cells[s.id];
  const idx = c.v + 2;
  const scale = [0, 1, 2, 3, 4].map(i => `<i${i === idx ? ' class="on"' : ''}></i>`).join('');
  const work = c.work === 'Letter to Bassula' ? 'Letter 3, to Bassula' : c.work;
  const cite = c.hide ? '' : `${work}${PLACE[s.id] && c.work !== 'Letter to Bassula' ? ', ' + PLACE[s.id] : ''}`;
  const body = c.hide
    ? `<p class="st-off">On record in ${c.work === 'Dialogues' ? 'the Dialogues' : c.work}. Not quoted here.</p>`
    : `<details><summary>Show his line</summary><blockquote>${esc(c.line)}</blockquote><span class="cite"><a href="${URL[s.id]}" target="_blank" rel="noopener">${esc(cite)}</a>, as Sulpicius Severus recorded it</span></details>`;
  return `<div class="panel st"><div class="st-top"><span class="st-topic">On ${esc(s.topic)}</span><a class="st-link" href="#" data-dead>Everyone on this</a></div>`
    + `<p class="st-q">“${esc(s.text)}”</p><div class="scale" aria-hidden="true">${scale}</div>`
    + `<div class="scale-ends" aria-hidden="true"><span>Disagree</span><span>Agree</span></div>`
    + `<p class="st-v">${VERB[c.v]}.</p>${body}</div>`;
}).join('\n');

/* ---------- structured data, as the page would carry it */
const JSONLD = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'St Martin of Tours: the cloak, his miracles and his feast days',
  about: { '@type': 'Person', name: 'Martin of Tours', alternateName: ['Martin the Merciful', 'St Martin of Tours'],
    birthPlace: 'Savaria, Pannonia (Szombathely, Hungary)', deathPlace: 'Candes, Gaul',
    sameAs: ['https://en.wikipedia.org/wiki/Martin_of_Tours', 'https://www.wikidata.org/wiki/Q133704'] },
  image: { '@type': 'ImageObject', contentUrl: 'https://wiserwalk.com/img/saints/martin-of-tours.jpg', license: 'https://creativecommons.org/publicdomain/zero/1.0/', creator: { '@type': 'Person', name: 'El Greco' }, creditText: 'National Gallery of Art, Washington' },
  publisher: { '@type': 'Organization', name: 'Wiser Walk', url: 'https://wiserwalk.com/' }
})}</script>`;

/* ---------- his miracles, from the checked draft in research/martin-miracles.json */
const MIR = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'research', 'martin-miracles.json'), 'utf8'));
const link = (url, text) => url ? `<a href="${url}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text);
// Quotation marks inside a retelling are the page's own; the quote itself gets curly marks here.
const q = s => `“${esc(s)}”`;
const MIRACLES = `<div class="mir">
  <p class="sect-lede">${esc(MIR.intro.text)}</p>
  <figure class="pledge"><blockquote>${esc(MIR.intro.quote)}</blockquote>
    <figcaption class="cite">${link(MIR.intro.url, MIR.intro.cite)}</figcaption></figure>
  <section class="dark raised" aria-labelledby="raised-h">
    <div class="raised-h"><b class="raised-n" aria-hidden="true">3</b><h3 id="raised-h">raised from the dead</h3></div>
    <ol class="raised-list">${MIR.raised.map(r => `
      <li class="rz">
        <div class="rz-h"><p class="rz-place">${esc(r.place)}</p><span class="rz-when">${esc(r.when)}</span></div>
        <h4>${esc(r.title)}</h4>
        <p>${esc(r.text)}</p>
        <blockquote>${q(r.quote)}</blockquote>
        <p class="rz-who">${esc(r.witness)}</p>
        <span class="cite">${link(r.url, r.cite)}</span>
      </li>`).join('')}
    </ol>
    <p class="raised-note">${esc(MIR.raised_note.text)} <span class="cite">${link(MIR.raised_note.url, MIR.raised_note.cite)}</span></p>
  </section>
  <div class="wonders">${MIR.more.map(w => `
    <div class="panel wonder">
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.text)}</p>
      <blockquote>${q(w.quote)}</blockquote>
      <span class="cite">${link(w.url, w.cite)}</span>
    </div>`).join('')}
  </div>
  <div class="later doubt">
    <b>Doubted from the start</b>
    ${esc(MIR.doubters.text)}
    <span class="cite">${link(MIR.doubters.url_1, MIR.doubters.cite_1)}; ${link(MIR.doubters.url_2, MIR.doubters.cite_2)}</span>
  </div>
</div>`;

const CARET = '<svg class="navmenu-caret" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>';
const ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

let bodyHtml = fs.readFileSync(path.join(here, 'body.html'), 'utf8');
bodyHtml = bodyHtml
  .replace('{{WALL}}', WALL).replace('{{COLLS}}', COLLS).replace('{{FILTERS}}', FILTERS).replace('{{SHEET}}', SHEET)
  .replace('{{PEOPLE}}', PEOPLE).replace('{{STANCES}}', STANCES).replace('{{JSONLD}}', JSONLD).replace('{{MIRACLES}}', MIRACLES)
  .replaceAll('{{CARET}}', CARET).replaceAll('{{ARROW}}', ARROW);
const svg = fs.readFileSync('C:/Users/Light/Desktop/claude/theology compass/site/public/img/wordmark.svg');
const css = fs.readFileSync(path.join(here, 'style.css'), 'utf8')
  .replaceAll('url("img/wordmark.svg")', `url("data:image/svg+xml;base64,${svg.toString('base64')}")`);
const js = fs.readFileSync(path.join(here, 'app.js'), 'utf8');

const html = `<title>Saints Hub Mock-up</title>
<meta name="description" content="A tap-through mock-up of the Saints hub for wiserwalk.com: the Learn menu, the hub, and St Martin of Tours.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@500;600;700;800&display=swap">
<style>
${css}
</style>
${bodyHtml}
<script>
${js}
</script>
`;
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + ' KB', cards.length + ' people');
