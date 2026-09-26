// Screenshot /me/ with saved results, in real headless Chrome (the in-app pane does not paint
// the room pictures). Dev server on 4343. Usage: node design/tools/me-shot.mjs <abs-out.png> [width=1360] [m]
// The shelf below is three sample results (a Compass tie, the sins, a gifts tie); edit to taste.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [out, width = '1360', mobile = ''] = process.argv.slice(2);
const W = Number(width);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const p = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'me-'))}`, `--remote-debugging-port=${p}`, `--window-size=${Math.max(W, 500)},1200`, 'about:blank'], { stdio: 'ignore' });
let t; for (let i = 0; i < 60; i++) { try { t = await (await fetch(`http://127.0.0.1:${p}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl); await new Promise(r => (ws.onopen = r));
let id = 0; const pend = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: 1200, deviceScaleFactor: 1, mobile: Boolean(mobile) });
await send('Page.navigate', { url: 'http://localhost:4343/me/' }); await sleep(3000);
const shelf = JSON.stringify([{ quiz: 'theology-compass', code: '021M6D', at: '2026-09-26T05:16:14.258Z' }, { quiz: 'seven-deadly-sins', code: 'S02RHLK', at: '2026-09-26T01:29:58.566Z' }, { quiz: 'spiritual-gifts', code: 'SG31KDRUAVT3QUUOEZS8DZ', at: '2026-09-26T04:00:00.000Z' }]);
await ev(`localStorage.setItem('ww.shelf.v1', ${JSON.stringify(shelf)})`);
await send('Page.reload'); await sleep(4000);
const box = await ev(`(async () => { const r = document.querySelector('#me-rooms').getBoundingClientRect(); await Promise.all([...document.querySelectorAll('.mroom-lead-img')].map(i => i.decode().catch(() => {}))); return { x: 0, y: r.top + scrollY, w: innerWidth, h: Math.min(r.height, 1300) }; })()`);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 1 } });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
ws.close(); chrome.kill(); console.log('ok', box);
