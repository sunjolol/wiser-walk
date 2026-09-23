// Full-page capture that waits for every picture: scrolls the page to wake lazy images, waits
// until each one has decoded and the fonts are ready, then shoots the whole page in one image.
// shot.sh can fire before a lazy or slow picture arrives (a phone capture of the home page once
// came back with a blank sky and black engraving cards); this cannot.
//   node design/tools/fullshot.mjs <url> <abs-out.png> <width> [mobile]
// "mobile" emulates a phone (touch, mobile viewport); widths under 500 need it.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, W, mobile] = process.argv.slice(2);
const width = +W;
const port = 9300 + Math.floor(Math.random() * 600);
const prof = mkdtempSync(join(tmpdir(), 'fullshot-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`, `--window-size=${Math.max(width, 500)},900`, 'about:blank'
], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let targets;
for (let i = 0; i < 60; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: !!mobile });
await send('Page.navigate', { url });
for (let i = 0; i < 100 && (await evaluate('document.readyState')) !== 'complete'; i++) await sleep(200);

// wake every lazy picture by scrolling through the page, then wait for all of them to decode
const total = await evaluate('document.documentElement.scrollHeight');
for (let y = 0; y < total; y += 600) { await evaluate(`window.scrollTo(0, ${y})`); await sleep(120); }
await evaluate(`Promise.all([document.fonts.ready, ...[...document.images].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })])`);
for (let i = 0; i < 50; i++) {
  const waiting = await evaluate('[...document.images].filter(i => !(i.complete && i.naturalWidth > 0) && i.getBoundingClientRect().width > 0).length');
  if (!waiting) break;
  await sleep(200);
}
await evaluate('window.scrollTo(0, 0)');
await sleep(400);

const height = await evaluate('document.documentElement.scrollHeight');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: !!mobile });
await sleep(600);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(out, width + 'x' + height);
ws.close();
chrome.kill();
