// Downloads each result's portrait (first public-domain choice in research/figures) as a 480px thumbnail from
// Wikimedia Commons into preview/img/<key>.jpg, and records the credit in preview/img/credits.json.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const quiz = JSON.parse(readFileSync(new URL('../quiz.json', import.meta.url), 'utf8'));
const figs = []; for (const f of readdirSync(new URL('../research/figures/', import.meta.url))) figs.push(...JSON.parse(readFileSync(new URL(`../research/figures/${f}`, import.meta.url), 'utf8')).figures);
const UA = { 'User-Agent': 'WiserWalkQuizPreview/1.0 (serenitybackto@gmail.com)' };
const PICK = JSON.parse(process.argv[2] || '{}'); // { key: index into portraits } to override the first choice
const credits = {};
for (const [key, p] of Object.entries(quiz.people)) {
  const fig = figs.find(f => f.name.startsWith(p.name.split(' ')[0]) && f.name.includes(p.name.split(' ').slice(-1)[0])) || figs.find(f => f.name.startsWith(p.name.split(' ')[0]));
  const pt = fig?.portraits?.[PICK[key] ?? 0]; if (!pt) { console.log('NO PORTRAIT', key); continue; }
  const title = decodeURIComponent(pt.url.split('/wiki/')[1]);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480&titles=${encodeURIComponent(title)}`;
  const j = await (await fetch(api, { headers: UA })).json();
  const info = Object.values(j.query.pages)[0].imageinfo?.[0];
  if (!info) { console.log('MISSING', key, title); continue; }
  const img = Buffer.from(await (await fetch(info.thumburl, { headers: UA })).arrayBuffer());
  writeFileSync(new URL(`./img/${key}.jpg`, import.meta.url), img);
  const lic = info.extmetadata?.LicenseShortName?.value || '';
  credits[key] = { title: pt.title, kind: pt.kind, date: pt.date, artist: pt.artist, file: title, page: pt.url, license: lic };
  console.log(key.padEnd(11), lic.padEnd(14), img.length, title.slice(0, 60));
}
writeFileSync(new URL('./img/credits.json', import.meta.url), JSON.stringify(credits, null, 1));
