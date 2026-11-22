import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { execFileSync } from 'node:child_process';
import { attachProductionSite, createApp, resolveOwnerToken, type AppOptions } from './server.ts';
import { createInitialCmsState } from './src/lib/cms.ts';

const TOKEN = 'correct-horse-battery-staple';
// 1x1 transparent PNG
const PNG_1PX =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

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

test('Link injection: saves with links in dish text or phishing order links are refused', async () => {
  await withServer({ ownerToken: TOKEN }, async (base) => {
    const state = createInitialCmsState();

    const injected = JSON.parse(JSON.stringify(state));
    injected.menuCategories[0].items[0].description = 'Order cheaper at www.phish.example';
    const res = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(injected, TOKEN) });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Links and web addresses are not allowed/);

    const phishing = JSON.parse(JSON.stringify(state));
    phishing.menuCategories[0].items[0].orderUrl = 'https://ubereats.com.evil.example/x';
    assert.equal((await fetch(`${base}/api/cms`, { method: 'PUT', ...json(phishing, TOKEN) })).status, 400);

    const html = JSON.parse(JSON.stringify(state));
    html.menuCategories[1].title = '<b>Wraps</b>';
    assert.equal((await fetch(`${base}/api/cms`, { method: 'PUT', ...json(html, TOKEN) })).status, 400);

    // Nothing was saved.
    const after = await (await fetch(`${base}/api/cms`)).json();
    assert.equal(after.menuCategories[0].items[0].description, state.menuCategories[0].items[0].description);

    // A legitimate edit (new dish + new price) is saved.
    const edited = JSON.parse(JSON.stringify(state));
    edited.menuCategories[0].items[0].verifiedPrice = '£12.20';
    edited.menuCategories[0].items.push({
      id: 'item-agadir',
      name: 'Agadir',
      description: 'Grilled chicken and harissa mayo.',
      breadOrVessel: 'Oversized Moroccan Baguette',
      image: '',
      imageAlt: '',
      orderUrl: state.location.uberEatsUrl,
      halal: true,
    });
    const ok = await fetch(`${base}/api/cms`, { method: 'PUT', ...json(edited, TOKEN) });
    assert.equal(ok.status, 200);
    const saved = await (await fetch(`${base}/api/cms`)).json();
    assert.equal(saved.menuCategories[0].items[0].verifiedPrice, '£12.20');
    assert.equal(saved.menuCategories[0].items.at(-1).name, 'Agadir');
  });
});

test('Photo uploads: owner-only, real images only, served safely', async () => {
  const uploads = fs.mkdtempSync(path.join(os.tmpdir(), 'casa-uploads-'));
  try {
    await withServer({ ownerToken: TOKEN, uploadsDir: uploads }, async (base) => {
      const png = `data:image/png;base64,${PNG_1PX}`;
      assert.equal((await fetch(`${base}/api/owner/images`, { method: 'POST', ...json({ dataUrl: png }) })).status, 401);

      // HTML disguised as a JPEG is rejected by its file signature.
      const fakeJpeg = `data:image/jpeg;base64,${Buffer.from('<html><script>alert(1)</script></html>').toString('base64')}`;
      const fake = await fetch(`${base}/api/owner/images`, { method: 'POST', ...json({ dataUrl: fakeJpeg }, TOKEN) });
      assert.equal(fake.status, 400);
      const svg = `data:image/svg+xml;base64,${Buffer.from('<svg/>').toString('base64')}`;
      assert.equal((await fetch(`${base}/api/owner/images`, { method: 'POST', ...json({ dataUrl: svg }, TOKEN) })).status, 400);

      const ok = await fetch(`${base}/api/owner/images`, { method: 'POST', ...json({ dataUrl: png }, TOKEN) });
      assert.equal(ok.status, 200);
      const { url } = await ok.json();
      assert.match(url, /^\/uploads\/[a-f0-9]{24}\.png$/);

      const served = await fetch(`${base}${url}`);
      assert.equal(served.status, 200);
      assert.equal(served.headers.get('content-type'), 'image/png');
      assert.equal(served.headers.get('x-content-type-options'), 'nosniff');
      assert.match(served.headers.get('cache-control') ?? '', /immutable/);

      assert.equal((await fetch(`${base}/uploads/missing.png`)).status, 404);
      const traversal = await fetch(`${base}/uploads/..%2f..%2fpackage.json`);
      assert.ok([403, 404].includes(traversal.status));
      assert.doesNotMatch(await traversal.text(), /casa-street/);
    });
    await withServer({ ownerToken: TOKEN, uploadsDir: null }, async (base) => {
      const res = await fetch(`${base}/api/owner/images`, {
        method: 'POST',
        ...json({ dataUrl: `data:image/png;base64,${PNG_1PX}` }, TOKEN),
      });
      assert.equal(res.status, 503);
    });
  } finally {
    fs.rmSync(uploads, { recursive: true, force: true });
  }
});

test('Production start path: plain Node can load server.ts (no tsx)', () => {
  // `npm start` runs `node server.ts` with type stripping, which needs explicit
  // .ts extensions on every server-side import. This guards against regressions.
  const out = execFileSync(
    process.execPath,
    ['--no-warnings', '-e', "import('./server.ts').then(() => process.stdout.write('loaded'))"],
    { cwd: path.dirname(new URL(import.meta.url).pathname), encoding: 'utf-8', env: { ...process.env, NODE_OPTIONS: '' } }
  );
  assert.equal(out, 'loaded');
});

test('Owner passcode: required in production, auto-generated only for previews', () => {
  assert.deepEqual(resolveOwnerToken(undefined, true), { token: '', generated: false });
  assert.deepEqual(resolveOwnerToken('my-own-passcode-123', true), { token: 'my-own-passcode-123', generated: false });
  const a = resolveOwnerToken(undefined, false);
  const b = resolveOwnerToken(undefined, false);
  assert.equal(a.generated, true);
  assert.ok(a.token.length >= 12);
  assert.notEqual(a.token, b.token);
});
