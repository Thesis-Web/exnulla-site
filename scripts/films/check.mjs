// Browser QA against a built static preview or the deployed site.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.EXNULLA_PLAYWRIGHT_MODULE;
if (!modulePath)
  throw new Error('Set EXNULLA_PLAYWRIGHT_MODULE to an installed Playwright module.');
const { chromium } = await import(pathToFileURL(modulePath));
const base = process.argv[2] || 'http://127.0.0.1:4322';
const output = process.env.EXNULLA_QA_OUTPUT || '/tmp/exnulla-film-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const failed = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });

  for (const route of ['/', '/lab/', '/lab/cortex/', '/lab/neuron/', '/cv/', '/projects/']) {
    const mediaRequests = [];
    const observe = (request) => {
      if (/\.mp4(?:$|\?)/.test(request.url())) mediaRequests.push(request.url());
    };
    page.on('request', observe);
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, route);
    assert.equal(
      await page.evaluate(() => document.querySelectorAll('h1').length),
      1,
      `One H1: ${route}`,
    );
    assert.ok(
      await page.locator('meta[name="description"]').getAttribute('content'),
      `Description: ${route}`,
    );
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute('href'),
      `https://www.exnulla.com${route}`,
    );
    assert.equal(mediaRequests.length, 0, `No video request before play: ${route}`);
    page.off('request', observe);

    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1080 : 844 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `No overflow: ${route} at ${width}`,
      );
      if (route === '/')
        await page.screenshot({ path: `${output}/landing-${width}.png`, fullPage: false });
    }

    if (route.startsWith('/lab/') && route !== '/lab/') {
      const id = route.split('/')[2];
      const schemas = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent)));
      const videoLd = schemas
        .flatMap((schema) => schema['@graph'] || [schema])
        .find((schema) => schema['@type'] === 'VideoObject');
      assert.equal(videoLd.duration, 'PT18S');
      assert.ok(videoLd.transcript.includes('00:12'));
      assert.equal(await page.locator('#transcript li').count(), 3);
      await page.screenshot({ path: `${output}/${id}-desktop.png`, fullPage: true });
    }

    if (await page.locator('video').count()) {
      const video = page.locator('video');
      assert.equal(await video.getAttribute('preload'), 'none');
      assert.equal(await video.getAttribute('autoplay'), null);
      await page.getByRole('button', { name: /^Play the/ }).click();
      await video.evaluate((element) => {
        element.textTracks[0].mode = 'hidden';
      });
      await page.waitForFunction(() => document.querySelector('track')?.readyState === 2);
      assert.equal(
        await video.evaluate((element) => element.textTracks[0].cues.length),
        route === '/' ? 4 : 3,
        `Captions: ${route}`,
      );
      await page.waitForFunction(() => document.querySelector('video').currentTime > 0.2, {
        timeout: 12000,
      });
      const state = await video.evaluate((element) => {
        element.pause();
        const result = {
          duration: element.duration,
          width: element.videoWidth,
          height: element.videoHeight,
          error: element.error?.code || null,
        };
        element.currentTime = 7;
        return result;
      });
      assert.ok(Math.abs(state.duration - (route === '/' ? 24 : 18)) < 0.1, `Duration: ${route}`);
      assert.equal(state.width, 1280);
      assert.equal(state.height, 800);
      assert.equal(state.error, null);
      await page.waitForFunction(() => !document.querySelector('video').seeking);
      results.push({ route, playback: 'passed', ...state });
    } else results.push({ route, structure: 'passed' });
  }

  for (const route of ['/video-sitemap.xml', '/sitemap-0.xml', '/llms.txt', '/robots.txt']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    const body = await response.text();
    assert.ok(body.includes(route === '/robots.txt' ? 'video-sitemap.xml' : 'cortex'), route);
  }
  assert.deepEqual(errors, [], 'No browser errors');
  assert.deepEqual(failed, [], 'No failed HTTP responses');
  await writeFile(
    `${output}/checks.json`,
    `${JSON.stringify({ base, results, errors, failed }, null, 2)}\n`,
  );
  console.log(JSON.stringify({ results, errors, failed }, null, 2));
} finally {
  await browser.close();
}
