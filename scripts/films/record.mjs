// Frame-exact recorder: drives the engine page under a stepped clock (one page draw per frame, raw CDP screenshots) so a 1920x1200 take is smooth whatever the render speed.
// usage: EXNULLA_FILM_PAGE=<page url> [EXNULLA_CDP=http://127.0.0.1:9222] [EXNULLA_SCALE=1.5] node record.mjs <outdir> <scenes.json> [scene id regex]
// Each scene becomes <outdir>/<id>.mp4 (24 fps, from JPEG frames) and <id>.marks.json (seconds of film time per action).
import { chromium } from '/home/exnulla/boxstead/node_modules/playwright/index.mjs';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const [outdir, scenesFile, only] = process.argv.slice(2); // only = a regex of scene ids to record (two recorders can share one outdir)
const PAGE = process.env.EXNULLA_FILM_PAGE || 'http://127.0.0.1:8059/';
const CDP = process.env.EXNULLA_CDP || '';
const FPS = 24,
  DT = 1000 / FPS;
const SCALE = Number(process.env.EXNULLA_SCALE || 1.5);
const scenes = JSON.parse(await readFile(scenesFile, 'utf8')).filter(
  (sc) => !only || new RegExp(only).test(sc.id),
);
await mkdir(outdir, { recursive: true });

const CSS = `
  header, #hud, p.note, .note, #atlasbtn { display: none !important; }
  aside.left { visibility: hidden !important; overflow: hidden !important; }
  .app { grid-template-columns: 0 minmax(0, 1fr) 430px !important; }
  #panel-type section:nth-of-type(n+3) { display: none !important; }
  #panel-step #readout, #panel-step #now, #panel-step #log, #panel-step #stream, #panel-step section:nth-of-type(3) { display: none !important; }
  #panel-run .tw, #panel-run #builds, #panel-run #gaps, #panel-run #memrow, #panel-run section:nth-of-type(2), #panel-run section:nth-of-type(3), #panel-run section:nth-of-type(4), #panel-run section:nth-of-type(6) { display: none !important; }
  #out tr.film-hide { display: none !important; }
  ::-webkit-scrollbar { display: none; }
  aside.right { overflow: hidden !important; }
  #line { caret-color: #1a6b4a; }
`;
const HIDE_ROWS = `
  const hide = () => { for (const tr of document.querySelectorAll('#out tr')) { const t = (tr.firstElementChild?.textContent || '').trim();
    if (/^#\\d+/.test(t) || /^known\\b/.test(t)) tr.classList.add('film-hide');   // the hit rows and the known row print the path itself
    const v = tr.children[1]; if (!v) continue;
    if (/^shape\\b/.test(t) && v.textContent.includes('a formula used before') && !v.dataset.cut) { v.dataset.cut = 1; const a = v.querySelector('a'); v.textContent = ''; if (a) v.appendChild(a); v.appendChild(document.createTextNode(' a formula found before, used again')); }
    if (/^def\\b/.test(t) && v.textContent.length > 120 && !v.dataset.cut) { v.dataset.cut = 1; v.textContent = v.textContent.slice(0, 118).replace(/\\s+\\S*$/, '') + ' …'; }
  } };
  new MutationObserver(hide).observe(document.getElementById('out'), { childList: true, subtree: true }); hide();
  // the page prints a refused count with the library's name; the film keeps the counts only
  const scrub = () => { for (const el of [document.getElementById('busy'), ...document.querySelectorAll('#out .sel, #out p, #out div')]) { if (!el) continue; for (const n of el.childNodes) { if (n.nodeType === 3 && /refused by \\w+/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/,?\\s*\\d+ refused by \\w+\\.?/g, '.').replace(/\\.\\./g, '.'); } } };
  new MutationObserver(scrub).observe(document.querySelector('aside.right'), { childList: true, subtree: true, characterData: true });
`;

const browser = CDP
  ? await chromium.connectOverCDP(CDP)
  : await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const scene of scenes) {
  const frames = `${outdir}/${scene.id}-frames`;
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: SCALE,
  });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-11-10T18:00:00-06:00') });
  await page.addInitScript(() => {
    window.__rafq = [];
    window.requestAnimationFrame = (f) => {
      window.__rafq.push(f);
      return window.__rafq.length;
    };
    window.cancelAnimationFrame = (id) => {
      if (id) window.__rafq[id - 1] = null;
    };
    window.__tick = () => {
      const q = window.__rafq;
      window.__rafq = [];
      const t = performance.now();
      for (const f of q) if (f) f(t);
    };
  });
  let n = 0;
  const marks = [];
  const log = [];
  const mark = (name) => {
    marks.push([name, n / FPS]);
    console.log(`${scene.id} ${name} ${(n / FPS).toFixed(2)}`);
  };
  const t0 = Date.now();
  const cdp = await ctx.newCDPSession(page);
  const tick = async () => {
    await page.clock.runFor(DT);
    await page.evaluate(() => window.__tick());
  };
  const frame = async () => {
    await tick();
    const r = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 94,
      fromSurface: true,
      clip: { x: 0, y: 0, width: 1280, height: 800, scale: SCALE },
    });
    await writeFile(`${frames}/f${String(n).padStart(5, '0')}.jpg`, Buffer.from(r.data, 'base64'));
    n++;
  };
  const frames_for = async (s) => {
    for (let i = 0; i < Math.round(s * FPS); i++) await frame();
  };
  await page.goto(PAGE, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({ content: CSS });
  await page.evaluate(HIDE_ROWS);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  if (scene.springs !== false)
    await page.evaluate(() => {
      const c = document.getElementById('brainxyz');
      if (c && c.checked) c.click();
    }); // the page's own springs move the points
  for (let i = 0; i < Math.round((scene.settle ?? 3000) / DT); i++) await tick(); // let the page settle without recording
  mark('loaded');
  const busyText = () => page.locator('#busy').innerText();
  for (const step of scene.steps) {
    const [op, arg, arg2] = step;
    try {
      if (op === 'wait') {
        await frames_for(arg);
        mark(`wait ${arg}`);
      } else if (op === 'tab') {
        await page.click(`aside.right button[data-panel="panel-${arg}"]`, { timeout: 30000 });
        await frames_for(0.25);
        mark(`tab ${arg}`);
      } else if (op === 'type') {
        if (!(await page.locator('#line').isVisible())) {
          await page.click('aside.right button[data-panel="panel-type"]', { timeout: 30000 });
          await frames_for(0.25);
          mark('tab type');
        }
        await page.click('#line', { timeout: 30000 });
        await page.fill('#line', '');
        const perChar = arg2 ?? 0.06; // seconds of film time per character
        let acc = 0;
        for (const ch of arg) {
          await page.keyboard.insertText(ch);
          acc += perChar;
          while (acc >= 1 / FPS) {
            await frame();
            acc -= 1 / FPS;
          }
        }
        mark('typed');
        await frames_for(0.5);
        const before = await busyText();
        await page.click('#run', { timeout: 30000 });
        mark('run');
        let t = '';
        for (let i = 0; i < 2400; i++) {
          await frame();
          t = await busyText();
          if (t !== before && /ran in|repeat|again|tick|error|refused/i.test(t)) break;
        }
        mark('ran');
        console.log(`   busy: ${t}`);
        log.push({ scene: scene.id, line: arg, busy: t });
      } else if (op === 'out') {
        let o = '';
        for (let i = 0; i < Math.round((arg ?? 40) * FPS); i++) {
          await frame();
          o = await page.locator('#out').innerText();
          if (o.trim()) break;
        }
        mark('out');
        console.log(`   out: ${o.replace(/\n/g, ' | ').slice(0, 200)}`);
      } else if (op === 'click') {
        await page.click(arg, { timeout: 30000 });
        await frames_for(0.25);
        mark(`click ${arg}`);
      } else if (op === 'select') {
        await page.selectOption(arg, arg2);
        mark(`select ${arg}`);
      } else if (op === 'text') {
        const t = await page.locator(arg).innerText();
        console.log(`   ${arg}: ${t.replace(/\n/g, ' | ').slice(0, 300)}`);
        log.push({ scene: scene.id, sel: arg, text: t });
        mark('text');
      } else if (op === 'shot') {
        await writeFile(
          `${outdir}/${scene.id}-${arg}.jpg`,
          Buffer.from(
            (
              await cdp.send('Page.captureScreenshot', {
                format: 'jpeg',
                quality: 94,
                fromSurface: true,
                clip: { x: 0, y: 0, width: 1280, height: 800, scale: SCALE },
              })
            ).data,
            'base64',
          ),
        );
        mark(`shot ${arg}`);
      } else if (op === 'eval') {
        await page.evaluate(arg);
        mark('eval');
      }
    } catch (e) {
      console.log(`   STEP FAILED ${JSON.stringify(step)}: ${String(e.message).split('\n')[0]}`);
      mark(`failed ${op}`);
    }
  }
  mark('end');
  await ctx.close();
  console.log(
    `   ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s real (${((Date.now() - t0) / 1000 / n).toFixed(2)} s/frame)`,
  );
  const enc = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-framerate',
      String(FPS),
      '-i',
      `${frames}/f%05d.jpg`,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '17',
      '-pix_fmt',
      'yuv420p',
      `${outdir}/${scene.id}.mp4`,
    ],
    { encoding: 'utf8' },
  );
  if (enc.status !== 0) console.log(`   ENCODE FAILED ${enc.stderr.slice(-400)}`);
  else await rm(frames, { recursive: true, force: true });
  await writeFile(`${outdir}/${scene.id}.marks.json`, JSON.stringify(marks));
  await writeFile(`${outdir}/${scene.id}.log.json`, JSON.stringify(log, null, 2));
}
await browser.close();
