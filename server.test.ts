import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { attachProductionSite, createApp, type AppOptions } from './server.ts';
import { createInitialCmsState } from './src/lib/cms.ts';

const TOKEN = 'correct-horse-battery-staple';

async function withServer(
  options: AppOptions,
  run: (base: string) => Promise<void>,
  distDir?: string
) {
  const { app, siteUrl } = createApp({ dataFile: null, ...options });
  if (distDir) attachProductionSite(app, distDir, siteUrl);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const json = (body: unknown, token?: string) => ({
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
});

test('CMS writes are refused without a configured owner token', async () => {
  await withServer({}, async (base) => {
    const res = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(createInitialCmsState()) });
    assert.equal(res.status, 503);
    const reset = await fetch(`${base}/api/cms/reset`, { method: 'POST' });
    assert.equal(reset.status, 503);
  });
});

test('Short owner tokens are rejected (writes stay disabled)', async () => {
  await withServer({ ownerToken: 'short' }, async (base) => {
    const res = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(createInitialCmsState(), 'short') });
    assert.equal(res.status, 503);
  });
});

test('CMS writes require the correct bearer token and are sanitised', async () => {
  await withServer({ ownerToken: TOKEN }, async (base) => {
    const state = createInitialCmsState();
    const noAuth = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(state) });
    assert.equal(noAuth.status, 401);
    const wrong = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(state, 'wrong-token-value') });
    assert.equal(wrong.status, 401);

    const tampered = JSON.parse(JSON.stringify(state));
    tampered.location.uberEatsUrl = 'https://phishing.example';
    tampered.halal.ownerConfirmed = false;
    const ok = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(tampered, TOKEN) });
    assert.equal(ok.status, 200);
    const saved = await ok.json();
    assert.equal(saved.location.uberEatsUrl, state.location.uberEatsUrl);
    assert.equal(saved.halal.ownerConfirmed, false);

    const publicState = await (await fetch(`${base}/api/cms`)).json();
    assert.equal(publicState.halal.ownerConfirmed, false);

    const session = await fetch(`${base}/api/owner/session`, { method: 'POST', ...json({}, TOKEN) });
    assert.equal(session.status, 200);

    const bad = await fetch(`${base}/api/cms`, { method: 'PUT', ...json({ nope: true }, TOKEN) });
    assert.equal(bad.status, 400);
    const malformed = await fetch(`${base}/api/cms`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: '{not json',
    });
    assert.equal(malformed.status, 400);
    assert.match(malformed.headers.get('content-type') ?? '', /json/);
  });
});

test('Repeated wrong passcodes are throttled', async () => {
  await withServer({ ownerToken: TOKEN }, async (base) => {
    let last = 0;
    for (let i = 0; i < 11; i += 1) {
      last = (await fetch(`${base}/api/owner/session`, { method: 'POST', ...json({}, 'nope-nope-nope') })).status;
    }
    assert.equal(last, 429);
    // Even the right token is blocked during the lockout window.
    const right = await fetch(`${base}/api/owner/session`, { method: 'POST', ...json({}, TOKEN) });
    assert.equal(right.status, 429);
  });
});

test('Ask Kitchen chat endpoint is removed and photo analysis is owner-only', async () => {
  await withServer({ ownerToken: TOKEN, geminiApiKey: 'test-key' }, async (base) => {
    const chat = await fetch(`${base}/api/chat`, { method: 'POST', ...json({ messages: [] }) });
    assert.equal(chat.status, 404);
    const photo = await fetch(`${base}/api/analyze-photo`, {
      method: 'POST',
      ...json({ imageBase64: 'AAAA', mimeType: 'image/png' }),
    });
    assert.equal(photo.status, 401);
    const svg = await fetch(`${base}/api/analyze-photo`, {
      method: 'POST',
      ...json({ imageBase64: 'AAAA', mimeType: 'image/svg+xml' }, TOKEN),
    });
    assert.equal(svg.status, 400);
  });
});

test('Security headers, robots.txt and sitemap.xml', async () => {
  await withServer({ isProduction: true, siteUrl: 'https://casa.example' }, async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.headers.get('x-powered-by'), null);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.match(res.headers.get('content-security-policy') ?? '', /object-src 'none'/);

    const robots = await (await fetch(`${base}/robots.txt`)).text();
    assert.match(robots, /Sitemap: https:\/\/casa\.example\/sitemap\.xml/);
    assert.match(robots, /Disallow: \/api\//);
    const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
    assert.match(sitemap, /<loc>https:\/\/casa\.example\/<\/loc>/);
  });
});

test('Production static site: canonical injection, caching and real 404s', async () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'casa-dist-'));
  fs.mkdirSync(path.join(dist, 'assets'));
  fs.writeFileSync(
    path.join(dist, 'index.html'),
    '<html><head><!--casa:canonical--><meta property="og:image" content="/images/og.jpg" /></head><body>Casa</body></html>'
  );
  fs.writeFileSync(path.join(dist, 'assets', 'index-AbCdEf12.js'), 'console.log(1)');
  try {
    await withServer(
      { isProduction: true, siteUrl: 'https://casa.example' },
      async (base) => {
        const home = await fetch(`${base}/`);
        assert.equal(home.status, 200);
        const html = await home.text();
        assert.match(html, /rel="canonical" href="https:\/\/casa\.example\/"/);
        assert.match(html, /content="https:\/\/casa\.example\/images\/og\.jpg"/);

        const js = await fetch(`${base}/assets/index-AbCdEf12.js`);
        assert.match(js.headers.get('cache-control') ?? '', /immutable/);

        const missingAsset = await fetch(`${base}/assets/missing.png`);
        assert.equal(missingAsset.status, 404);
        assert.doesNotMatch(missingAsset.headers.get('content-type') ?? '', /html/);

        const unknownPage = await fetch(`${base}/some-page`, { headers: { Accept: 'text/html' } });
        assert.equal(unknownPage.status, 404);
        assert.match(await unknownPage.text(), /Casa/);
      },
      dist
    );
  } finally {
    fs.rmSync(dist, { recursive: true, force: true });
  }
});
