// Measure a saint page's "At a glance" sheet on a dev server (the saints worktree runs on port 4344).
//   node measure-sheet.mjs <slug> [port]
// Prints, at 1360 wide with every picture decoded: the heights of the facts column (main), the
// numbers column (stats) and the pictures column (side), the gaps, and each desktop traits row's
// left and right content heights. Then, at 390, whether any gallery picture shows (it must not).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [slug, port = '4344'] = process.argv.slice(2);
const url = `http://localhost:${port}/saints/${slug}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(width, height, mobile) {
  const p = 9300 + Math.floor(Math.random() * 600);
  const prof = mkdtempSync(join(tmpdir(), 'measure-'));
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${prof}`, `--remote-debugging-port=${p}`, `--window-size=${Math.max(width, 500)},${height}`, 'about:blank'
  ], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${p}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result.exceptionDetails ? 'ERR ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300) : r.result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: !!mobile });
  await send('Page.navigate', { url });
  for (let i = 0; i < 150 && (await evaluate('document.readyState')) !== 'complete'; i++) await sleep(200);
  await evaluate('document.fonts.ready');
  return { evaluate, close: () => { ws.close(); chrome.kill(); } };
}

const wide = await open(1360, 1300);
const r = await wide.evaluate(`(async () => {
  await Promise.all([...document.querySelectorAll('.cs img')].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
  await new Promise(r => setTimeout(r, 400));
  const h = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : 0; };
  // the facts column's own content height, whatever the row stretched it to
  const main = document.querySelector('.cs-main');
  const dl = main && main.querySelector('.sfacts');
  let mainContent = 0;
  if (main) {
    const a = main.style.alignSelf, j = dl ? dl.style.justifyContent : '', f = dl ? dl.style.flex : '';
    main.style.alignSelf = 'start'; if (dl) { dl.style.justifyContent = 'flex-start'; dl.style.flex = 'none'; }
    mainContent = Math.round(main.getBoundingClientRect().height);
    main.style.alignSelf = a; if (dl) { dl.style.justifyContent = j; dl.style.flex = f; }
  }
  const rows = [];
  const traits = [...document.querySelectorAll('.trait')];
  const contentH = t => { const c = t.querySelector('.cite') || t.lastElementChild; return Math.round(c.getBoundingClientRect().bottom - t.getBoundingClientRect().top); };
  for (let i = 0; i < traits.length; i += 2) rows.push([traits[i].querySelector('h3').textContent.replace(/^\\+/, ''), contentH(traits[i]), traits[i + 1] ? traits[i + 1].querySelector('h3').textContent.replace(/^\\+/, '') : null, traits[i + 1] ? contentH(traits[i + 1]) : null]);
  return {
    factsContent: mainContent, row: h('.cs-main'), numbersColumn: h('.cs-stats'), picturesColumn: h('.cs-side'),
    leftGap: mainContent - h('.cs-stats'), rightGap: mainContent - h('.cs-side'),
    sheetTallerThanFacts: h('.cs-main') - mainContent,
    gallery: document.querySelectorAll('.portrait--more').length,
    traitRows: rows
  };
})()`);
wide.close();
const phone = await open(390, 844, true);
const g = await phone.evaluate(`[...document.querySelectorAll('.portrait--more')].map(f => getComputedStyle(f).display)`);
phone.close();
console.log(JSON.stringify({ slug, ...r, phoneGallery: g }, null, 1));
console.log('Rules: numbersColumn and picturesColumn must not exceed factsContent (sheetTallerThanFacts should be 0 to 8);');
console.log('fill each column to within about one item of factsContent; each trait row: the taller on the left; phoneGallery all "none".');
