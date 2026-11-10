// Run with: EXNULLA_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/films/render.mjs
// Playwright and Chromium are authoring tools only, not dependencies of the public site.
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const modulePath = process.env.EXNULLA_PLAYWRIGHT_MODULE;
if (!modulePath)
  throw new Error('Set EXNULLA_PLAYWRIGHT_MODULE to an installed Playwright module.');
const { chromium } = await import(pathToFileURL(modulePath));
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = `${root}site/public/assets/films`;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  await page.goto(pathToFileURL(`${root}scripts/films/scene.html`).href);
  const selected = process.argv.slice(2);
  const ids = selected.length ? selected : ['overview', 'cortex', 'neuron'];
  for (const id of ids) {
    if (!['overview', 'cortex', 'neuron'].includes(id)) throw new Error(`Unknown film: ${id}`);
    await page.evaluate((id) => window.render(id, 2, true), id);
    const png = await page.locator('canvas').screenshot({ type: 'png' });
    const input = `${out}/${id}-master.png`;
    await writeFile(input, png);
    for (const [ext, args] of [
      ['webp', ['-quality', '88']],
      ['jpg', ['-q:v', '2']],
    ]) {
      const result = spawnSync(
        'ffmpeg',
        ['-y', '-i', input, ...args, `${out}/${id}-poster.${ext}`],
        { encoding: 'utf8' },
      );
      if (result.status !== 0) throw new Error(result.stderr);
    }
    await unlink(input);
    console.log(`Rendering ${id}…`);
    const encoder = spawn('ffmpeg', [
      '-y',
      '-f',
      'image2pipe',
      '-framerate',
      '24',
      '-i',
      'pipe:0',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '22',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      `${out}/${id}.mp4`,
    ]);
    let errors = '';
    encoder.stderr.on('data', (data) => {
      errors += data;
    });
    const encoded = new Promise((resolve, reject) => {
      encoder.on('error', reject);
      encoder.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(errors))));
    });
    const frames = (id === 'overview' ? 24 : 18) * 24;
    for (let frame = 0; frame < frames; frame++) {
      await page.evaluate(({ id, t }) => window.render(id, t), { id, t: frame / 24 });
      const jpeg = await page.screenshot({ type: 'jpeg', quality: 92 });
      await new Promise((resolve, reject) =>
        encoder.stdin.write(jpeg, (error) => (error ? reject(error) : resolve())),
      );
      if (frame % 144 === 0) console.log(`${id}: ${frame}/${frames} frames`);
    }
    encoder.stdin.end();
    await encoded;
    console.log(`Finished ${id}.`);
  }
} finally {
  await browser.close();
}
