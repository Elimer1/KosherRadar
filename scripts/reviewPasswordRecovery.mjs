// Local browser verification against the production build and intercepted fixtures. No live API/email.
// Run from the repository root after `cd frontend; npm run build`: node scripts/reviewPasswordRecovery.mjs
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const out = 'design-screenshots/email-password';
const origin = 'http://127.0.0.1:5226';
const TOKEN = 'a'.repeat(64); // Synthetic fixture only. Never use a real token here.
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, origin).pathname;
    const asset = path.startsWith('/assets/') || path === '/favicon.svg';
    const file = await readFile(asset ? `frontend/dist${path}` : 'frontend/dist/index.html');
    res.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css'
      : path.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
    res.end(file);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((resolve) => server.listen(5226, '127.0.0.1', resolve));
await mkdir(out, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9356',
  `--user-data-dir=${process.cwd()}/${out}/chrome-profile`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let ws;
let mode = 'normal';
const renders = [];
const checks = [];
const exceptions = [];
const requests = [];
try {
  let targets;
  for (let index = 0; index < 60; index += 1) {
    try { targets = await (await fetch('http://127.0.0.1:9356/json')).json(); break; } catch { await pause(200); }
  }
  if (!targets) throw new Error('Chrome did not expose its debugging endpoint');
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
    requestId, responseCode: status,
    responseHeaders: [{ name: 'Content-Type', value: 'application/json' },
      { name: 'Access-Control-Allow-Origin', value: origin }, { name: 'Access-Control-Allow-Headers', value: '*' }],
    body: Buffer.from(JSON.stringify(data)).toString('base64'),
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
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      try {
        const referrer = Object.keys(request.headers).some((key) => key.toLowerCase() === 'referer');
        requests.push({ path: url.pathname, referrer, tokenInUrl: url.search.includes(TOKEN) });
        if (request.method === 'OPTIONS') { await fulfill(requestId, {}); return; }
        if (url.pathname.includes('/api/')) {
          if (url.pathname.endsWith('/forgot-password') || url.pathname.endsWith('/reset-password')) {
            if (mode === 'offline') { await call('Fetch.failRequest', { requestId, errorReason: 'InternetDisconnected' }); return; }
            if (mode === 'loading') await pause(700);
            if (mode === 'rate') await fulfill(requestId, { message: 'Too many attempts' }, 429);
            else if (mode === 'expired') await fulfill(requestId, { code: 'INVALID_RESET_TOKEN', message: 'Expired English API text' }, 400);
            else if (mode === 'failure') await fulfill(requestId, { message: 'Database unavailable' }, 503);
            else await fulfill(requestId, { message: 'Neutral English API message' });
          } else if (url.pathname.endsWith('/auth/me')) {
            await fulfill(requestId, { user: { id: 'fixture-user', email: 'fixture@example.com', role: 'USER' } });
          } else await fulfill(requestId, {});
        } else if (url.origin === origin) await call('Fetch.continueRequest', { requestId });
        else await call('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      } catch (error) { exceptions.push(`Fixture interception: ${error.message}`); }
    }
  });
  await call('Page.enable'); await call('Runtime.enable'); await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  const waitFor = async (expression) => {
    for (let index = 0; index < 100; index += 1) {
      if (await evaluate(expression)) return;
      await pause(80);
    }
    throw new Error(`Browser state timed out: ${expression}`);
  };
  const nav = async (path, ready) => {
    await call('Page.navigate', { url: origin + path });
    await waitFor(ready);
  };
  const setInput = (selector, value) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  const submit = () => evaluate(`document.querySelector('form').requestSubmit()`);
  const fill = async (confirm = 'new-password-123') => {
    await setInput('#reset-password', 'new-password-123');
    await setInput('#reset-confirm-password', confirm);
  };
  const shot = async (name) => {
    const geometry = await evaluate(`({ width:innerWidth, height:innerHeight, scrollWidth:document.documentElement.scrollWidth,
      dir:document.documentElement.dir, tokenInAddress:location.href.includes('${TOKEN}') })`);
    if (geometry.scrollWidth > geometry.width) throw new Error(`Horizontal overflow: ${name}`);
    if (geometry.tokenInAddress) throw new Error(`Token still visible: ${name}`);
    // Explicit viewport clipping avoids Chrome's full-page RTL capture offset.
    const image = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: geometry.width, height: geometry.height, scale: 1 } });
    await writeFile(`${out}/${name}.png`, Buffer.from(image.data, 'base64'));
    renders.push({ name, ...geometry });
  };
  await nav('/forgot-password', `!!document.querySelector('#forgot-email')`);
  for (const language of ['en', 'he']) {
    await evaluate(`localStorage.setItem('kosherradar-language', '${language}')`);
    for (const width of [375, 768, 1024, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 850, deviceScaleFactor: 1, mobile: width === 375 });
      const prefix = `${language}-${width}`;
      mode = 'normal';
      await nav('/forgot-password', `!!document.querySelector('#forgot-email')`);
      await shot(`${prefix}-forgot`);
      await setInput('#forgot-email', 'fixture@example.com');
      mode = 'loading'; await submit();
      await waitFor(`document.querySelector('form')?.getAttribute('aria-busy')==='true'`);
      await shot(`${prefix}-loading`);
      await waitFor(`!!document.querySelector('[role="status"]')`);
      await shot(`${prefix}-confirmation`);
      if (await evaluate(`document.body.textContent.includes('Neutral English API message')`)) throw new Error('Raw API confirmation shown');
      await evaluate(`document.querySelector('main button').click()`);
      await waitFor(`!!document.querySelector('#forgot-email')`);
      mode = 'rate'; await submit(); await waitFor(`!!document.querySelector('[role="alert"]')`); await shot(`${prefix}-rate`);
      mode = 'offline'; await submit(); await pause(150); await shot(`${prefix}-offline`);
      mode = 'normal';
      await nav(`/reset-password#token=${TOKEN}`, `!!document.querySelector('#reset-password') && !location.hash`);
      await shot(`${prefix}-reset`);
      await fill('mismatched-password'); await submit();
      await waitFor(`!!document.querySelector('[role="alert"]')`); await shot(`${prefix}-mismatch`);
      await fill();
      await evaluate(`document.querySelector('#reset-password').parentElement.querySelector('button').click()`);
      if (!await evaluate(`document.querySelector('#reset-password').type==='text'`)) throw new Error('Show password failed');
      mode = 'expired'; await submit();
      await waitFor(`!document.querySelector('form') && !!document.querySelector('[role="alert"]')`); await shot(`${prefix}-expired`);
      if (!await evaluate(`!!document.querySelector('main a[href="/forgot-password"]')`)) throw new Error('Missing expired-link recovery');
      mode = 'normal';
      await nav(`/reset-password?token=${TOKEN}`, `!!document.querySelector('#reset-password') && !location.search`);
      await fill(); await submit();
      await waitFor(`!!document.querySelector('[role="status"]')`); await shot(`${prefix}-success`);
      if (!await evaluate(`!!document.querySelector('main a[href="/login"]')`)) throw new Error('Missing login destination');
      await evaluate(`document.querySelector('main a[href="/login"]').click()`);
      await waitFor(`!!document.querySelector('#email')`);
      await shot(`${prefix}-login`);
      await nav('/reset-password?token=short', `!!document.querySelector('[role="alert"]') && !location.search`);
      await shot(`${prefix}-invalid`);
      checks.push(`${prefix}: loading, neutral confirmation, retry, limit, offline, fragment/legacy cleanup, password reveal/mismatch, expired, reset success, login navigation, invalid link`);
    }
  }
  if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join('; ')}`);
  if (requests.some((request) => request.referrer)) throw new Error('Referrer header sent');
  await writeFile(`${out}/results.json`, JSON.stringify({ renders, checks, exceptions, requests }, null, 2));
  console.log(JSON.stringify({ renders: renders.length, scenarios: checks.length, exceptions: exceptions.length, referrerHeaders: 0 }));
} catch (error) {
  await writeFile(`${out}/partial-results.json`, JSON.stringify({ renders, checks, exceptions, error: error.message }, null, 2));
  console.error(error.message); process.exitCode = 1;
} finally {
  ws?.close(); chrome.kill(); await new Promise((resolve) => server.close(resolve));
}
