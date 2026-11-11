// Records the film scenes from the engine's own page as WebM takes with a marks file per scene.
// usage: EXNULLA_FILM_PAGE=<page url> EXNULLA_PLAYWRIGHT_MODULE=<playwright/index.mjs> node scripts/films/record.mjs <outdir> <scenes.json>
// Playwright and Chromium are authoring tools only, not dependencies of the public site.
import { pathToFileURL } from 'node:url';
const modulePath = process.env.EXNULLA_PLAYWRIGHT_MODULE;
if (!modulePath)
  throw new Error('Set EXNULLA_PLAYWRIGHT_MODULE to an installed Playwright module.');
const PAGE = process.env.EXNULLA_FILM_PAGE;
if (!PAGE) throw new Error('Set EXNULLA_FILM_PAGE to the engine page to record.');
const { chromium } = await import(pathToFileURL(modulePath));
import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';

const [outdir, scenesFile] = process.argv.slice(2);
const scenes = JSON.parse(await readFile(scenesFile, 'utf8'));
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
`;
const HIDE_ROWS = `
  const hide = () => { for (const tr of document.querySelectorAll('#out tr')) { const t = (tr.firstElementChild?.textContent || '').trim();
    if (/^#\\d+/.test(t)) tr.classList.add('film-hide');
    const v = tr.children[1]; if (!v) continue;
    if (/^shape\\b/.test(t) && v.textContent.includes('a formula used before') && !v.dataset.cut) { v.dataset.cut = 1; const a = v.querySelector('a'); v.textContent = ''; if (a) v.appendChild(a); v.appendChild(document.createTextNode(' a formula found before, used again')); }
    if (/^def\\b/.test(t) && v.textContent.length > 120 && !v.dataset.cut) { v.dataset.cut = 1; v.textContent = v.textContent.slice(0, 118).replace(/\\s+\\S*$/, '') + ' …'; }
  } };
  new MutationObserver(hide).observe(document.getElementById('out'), { childList: true, subtree: true }); hide();
`;

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const log = [];
for (const scene of scenes) {
  const T0 = Date.now();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: outdir, size: { width: 1280, height: 800 } },
  });
  const page = await ctx.newPage();
  const marks = [];
  const mark = (name) => {
    marks.push([name, (Date.now() - T0) / 1000]);
    console.log(`${scene.id} ${name} ${((Date.now() - T0) / 1000).toFixed(2)}`);
  };
  await page.goto(PAGE, { waitUntil: 'networkidle', timeout: 90000 });
  await page.addStyleTag({ content: CSS });
  await page.evaluate(HIDE_ROWS);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(scene.settle ?? 2500);
  mark('loaded');
  const busyText = () => page.locator('#busy').innerText();
  for (const step of scene.steps) {
    const [op, arg, arg2] = step;
    try {
      if (op === 'wait') {
        await page.waitForTimeout(arg * 1000);
        mark(`wait ${arg}`);
      } else if (op === 'tab') {
        await page.click(`aside.right button[data-panel="panel-${arg}"]`);
        mark(`tab ${arg}`);
      } else if (op === 'type') {
        await page.click('#line');
        await page.fill('#line', '');
        {
          const chunk = 4,
            delay = arg2 ?? 45;
          for (let i = 0; i < arg.length; i += chunk) {
            await page.keyboard.insertText(arg.slice(i, i + chunk));
            await page.waitForTimeout(delay);
          }
        }
        mark('typed');
        await page.waitForTimeout(500);
        const before = await busyText();
        await page.click('#run');
        mark('run');
        let t = '';
        for (let i = 0; i < 400; i++) {
          await page.waitForTimeout(150);
          t = await busyText();
          if (t !== before && /ran in|repeat|again|tick|error|refused/i.test(t)) break;
        }
        mark('ran');
        console.log(`   busy: ${t}`);
        log.push({ scene: scene.id, line: arg, busy: t });
      } else if (op === 'out') {
        let o = '';
        for (let i = 0; i < Math.round((arg ?? 40) / 0.25); i++) {
          await page.waitForTimeout(250);
          o = await page.locator('#out').innerText();
          if (o.trim()) break;
        }
        mark('out');
        console.log(`   out: ${o.replace(/\n/g, ' | ').slice(0, 300)}`);
      } else if (op === 'click') {
        await page.click(arg, { timeout: 30000 });
        mark(`click ${arg}`);
      } else if (op === 'select') {
        await page.selectOption(arg, arg2);
        mark(`select ${arg}`);
      } else if (op === 'shot') {
        await page.screenshot({ path: `${outdir}/${scene.id}-${arg}.png` });
        mark(`shot ${arg}`);
      } else if (op === 'text') {
        const t = await page.locator(arg).innerText();
        console.log(`   ${arg}: ${t.replace(/\n/g, ' | ').slice(0, 400)}`);
        log.push({ scene: scene.id, sel: arg, text: t });
        mark('text');
      }
    } catch (e) {
      console.log(`   STEP FAILED ${JSON.stringify(step)}: ${String(e.message).split('\n')[0]}`);
      mark(`failed ${op}`);
    }
  }
  mark('end');
  const video = page.video();
  await ctx.close();
  const path = await video.path();
  await rename(path, `${outdir}/${scene.id}.webm`);
  await writeFile(`${outdir}/${scene.id}.marks.json`, JSON.stringify(marks));
  await writeFile(`${outdir}/log.json`, JSON.stringify(log, null, 2));
}
await browser.close();
