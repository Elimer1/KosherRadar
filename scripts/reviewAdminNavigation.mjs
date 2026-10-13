// NEW (UIAUD-001): Chrome verification with synthetic admin data and all remote traffic blocked.
// חדש (UIAUD-001): אימות בכרום עם נתונים מדומים וחסימת כל תעבורה חיצונית.
// From root after frontend build: node scripts/reviewAdminNavigation.mjs [--expect-vulnerable]
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const vulnerable = process.argv.includes('--expect-vulnerable');
const origin = 'http://127.0.0.1:5237';
const out = 'design-screenshots/admin-navigation';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const options = {
  hechsherOptions: [{ value: 'LOCAL_RABBANUT', labelEn: 'Local', labelHe: 'מקומי' }],
  hechsherOtherValue: 'OTHER', kashrutLevels: ['RABBANUT'], foodTypes: ['DAIRY'], categories: ['CAFE'], maxImageBytes: 5000000,
};
function sample(id) {
  return { restaurant: {
    id, name: `Cafe ${id}`, nameHe: null, nameEn: `English ${id}`, address: `Street ${id}`,
    city: 'City', latitude: 32, longitude: 35, phone: null, website: null, foodType: 'DAIRY',
    categories: ['CAFE'], foodKeywords: ['coffee'], status: 'APPROVED', submittedBy: null,
    adminNote: `Note ${id}`, possibleDuplicates: id === 'A' ? [{
      restaurant: { id: 'B', name: 'Cafe B', address: 'Street B' }, reasons: [],
    }] : [], createdAt: '2026-10-13',
  }, teudot: [], publicKashrutPreview: null };
}
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, origin).pathname;
    const asset = path.startsWith('/assets/') || path === '/favicon.svg';
    const file = await readFile(asset ? `frontend/dist${path}` : 'frontend/dist/index.html');
    res.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : path.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
    res.end(file);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((resolve) => server.listen(5237, '127.0.0.1', resolve));
await mkdir(out, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9367',
  `--user-data-dir=${process.cwd()}/${out}/chrome-profile`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let ws;
const writes = [];
const exceptions = [];
let mode = 'delay';
let heldB;
let heldSave;
const checks = [];
try {
  let targets;
  for (let index = 0; index < 60; index++) {
    try { targets = await (await fetch('http://127.0.0.1:9367/json')).json(); break; }
    catch { await pause(200); }
  }
  if (!targets) throw new Error('Chrome debugging endpoint unavailable');
  ws = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 15000);
    pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value); }, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const fulfill = (requestId, data, status = 200) => call('Fetch.fulfillRequest', {
    requestId, responseCode: status, responseHeaders: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Access-Control-Allow-Origin', value: origin },
      { name: 'Access-Control-Allow-Headers', value: '*' },
      { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
    ], body: Buffer.from(JSON.stringify(data)).toString('base64'),
  });
  ws.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      if (!item) return;
      pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') { await fulfill(requestId, {}); return; }
      if (url.pathname.includes('/api/')) {
        if (request.method !== 'GET') {
          writes.push({ path: url.pathname, method: request.method, payload: JSON.parse(request.postData || '{}') });
          if (mode === 'save' && url.pathname.endsWith('/A')) { heldSave = requestId; return; }
          await fulfill(requestId, { restaurant: sample(url.pathname.split('/').at(-1)).restaurant });
        } else if (url.pathname.endsWith('/B') && mode === 'delay') heldB = requestId;
        else if (url.pathname.endsWith('/B') && mode === 'failure') await fulfill(requestId, { message: 'Fixture B load failure' }, 503);
        else if (url.pathname.includes('/admin/restaurants/')) await fulfill(requestId, sample(url.pathname.split('/').at(-1)));
        else if (url.pathname.includes('options')) await fulfill(requestId, options);
        else await fulfill(requestId, {});
      } else if (url.origin === origin) await call('Fetch.continueRequest', { requestId });
      else await call('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
    } catch (error) { exceptions.push(`Interception: ${error.message}`); }
  });
  await call('Page.enable'); await call('Runtime.enable');
  await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('kosherradar-language', 'en');
    localStorage.setItem('kosherradar-auth', JSON.stringify({state:{token:'fixture-admin-only',user:{id:'fixture',email:'fixture@example.invalid',role:'ADMIN'}},version:0}));
  ` });
  const waitFor = async (expression) => {
    for (let index = 0; index < 100; index++) { if (await evaluate(expression)) return; await pause(80); }
    throw new Error(`Browser state timed out: ${expression}`);
  };
  const waitHeld = async (which) => {
    for (let index = 0; index < 100; index++) { if (which()) return; await pause(80); }
    throw new Error('Intercepted request not observed');
  };
  const navA = async () => {
    await call('Page.navigate', { url: `${origin}/admin/restaurants/A` });
    await waitFor(`document.querySelector('#restaurant-name')?.value==='Cafe A'`);
  };
  const toB = () => evaluate(`document.querySelector('main a[href="/admin/restaurants/B"]').click()`);
  const submit = () => evaluate(`document.querySelector('main form')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
  await navA();
  await toB();
  await waitHeld(() => heldB);
  await submit(); await pause(250);
  if (vulnerable) {
    assert(writes.some((write) => write.path.endsWith('/B') && write.payload.restaurant.name === 'Cafe A'));
    checks.push('Original bug reproduced: PUT B carries Cafe A; intercepted only');
  } else {
    assert.equal(await evaluate(`!!document.querySelector('main form')`), false);
    assert.equal(writes.length, 0);
    checks.push('Delayed B: no stale form or outgoing mutation');
    await fulfill(heldB, sample('B')); heldB = null;
    await waitFor(`document.querySelector('#restaurant-name')?.value==='Cafe B'`);
    await submit(); await waitHeld(() => writes.length === 1);
    assert.equal(writes[0].path, '/api/admin/restaurants/B');
    assert.equal(writes[0].payload.restaurant.name, 'Cafe B');
    assert.equal(writes[0].payload.extras.adminNote, 'Note B');
    checks.push('Normal B save: correct endpoint, restaurant fields and extras');
    mode = 'failure'; await navA(); await toB();
    await waitFor(`!!document.querySelector('main [role="alert"]')`);
    assert.equal(await evaluate(`!!document.querySelector('main form')`), false);
    assert.equal(writes.length, 1);
    checks.push('Failed B load: A form remains unavailable');
    mode = 'save'; await navA(); await submit(); await waitHeld(() => heldSave);
    await toB(); await waitFor(`document.querySelector('#restaurant-name')?.value==='Cafe B'`);
    await evaluate(`(() => {const field=document.querySelector('#restaurant-name');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(field,'Draft B');field.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await fulfill(heldSave, { restaurant: sample('A').restaurant }); heldSave = null;
    await pause(250);
    assert.equal(await evaluate(`document.querySelector('#restaurant-name').value`), 'Draft B');
    assert.equal(writes[1].path, '/api/admin/restaurants/A');
    assert.equal(writes[1].payload.restaurant.name, 'Cafe A');
    checks.push('Navigation during Save: A target retained, B draft untouched');
    assert.deepEqual(exceptions, []);
  }
  await writeFile(`${out}/${vulnerable ? 'baseline' : 'fixed'}-browser.json`, JSON.stringify({ checks, writes, exceptions }, null, 2));
  console.log(JSON.stringify({ mode: vulnerable ? 'baseline' : 'fixed', checks, exceptions }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { ws?.close(); chrome.kill(); await new Promise((resolve) => server.close(resolve)); }
