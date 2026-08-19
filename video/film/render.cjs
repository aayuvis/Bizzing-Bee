/* render.cjs — shots → frames → mp4.
 *
 *   node render.cjs --check          assertions only, renders nothing
 *   node render.cjs --shot 34        one shot (do this before rendering all of them)
 *   node render.cjs --all            every shot
 *   node render.cjs --sec 6          one section
 *
 * Frame-stepped, never recorded: every animation is paused and its currentTime set per
 * frame, so there are no dropped frames and no timing drift, and two runs are identical.
 */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { build, drift } = require('./scenes.js');

const FPS = 24, W = 1920, H = 1080;
const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const shots = build();

/* ---------------- assertions (brief Rule 5) ----------------
 * Cue resolution happens inside build(), which throws on a cue the narrator never says, so
 * by the time we get here every shot is known to sit on a real moment in the recording.
 * What is left to check is the things cueing cannot guarantee: that the film is continuous,
 * that no shot is too brief to read, that every asset exists, and — above all — that no word
 * is misspelled on screen.
 */
function check() {
  const errs = [], warns = [];
  const imgs = new Set(fs.readdirSync(path.join(DIR, '..', 'images')));
  const FLOOR = 1.2, COMFY = 1.5;

  shots.forEach(s => {
    const tag = `shot ${s.idx} §${s.sec} ${JSON.stringify(s.cue || 'tail')}`;
    if (s.dur < FLOOR) errs.push(`${tag}: ${s.dur}s — under the ${FLOOR}s floor, will strobe`);
    else if (s.dur < COMFY) warns.push(`${tag}: ${s.dur}s — short`);
    if (s.dur > 11) warns.push(`${tag}: ${s.dur}s — long, consider a cue inside it`);
    if (s.src && !imgs.has(s.src)) errs.push(`${tag}: missing asset ${s.src}`);
    if (s.type === 'spell') {
      if (!/^[A-Z]+$/.test(s.word)) errs.push(`${tag}: word not A–Z: ${s.word}`);
      if (s.wrong && (s.wrong.i < 0 || s.wrong.i >= s.word.length))
        errs.push(`${tag}: wrong-letter index ${s.wrong.i} outside "${s.word}"`);
      if (s.fix && (s.fix.i < 0 || s.fix.i >= s.word.length))
        errs.push(`${tag}: fix index ${s.fix.i} outside "${s.word}"`);
      if (s.sync && !s.letterAt)
        warns.push(`${tag}: sync requested but the spoken letters were not found — even stagger`);
      if (s.letterAt && s.letterAt.some(t => t < -0.01 || t > s.dur))
        errs.push(`${tag}: a synced letter falls outside its own shot`);
    }
    // the drawn shots reach for plates by name from inside shotrender; check those too
    if (s.type === 'fourwords') {
      ['plate-gladiolus-garden.png', 'plate-fashion-plate-cerise.png',
       'plate-prohibition.png', 'plate-egg-albumen.png']
        .forEach(f => { if (!imgs.has(f)) errs.push(`${tag}: fourwords needs missing ${f}`); });
    }
  });

  // continuous: no gap, no overlap, nothing out of order
  for (let i = 1; i < shots.length; i++) {
    const gap = +(shots[i].in - shots[i - 1].out).toFixed(3);
    if (Math.abs(gap) > 0.01)
      errs.push(`shots ${i - 1}→${i}: ${gap > 0 ? 'gap' : 'overlap'} of ${Math.abs(gap)}s`);
  }
  if (shots[0].in > 0.35) warns.push(`film opens ${shots[0].in}s in — black before the first word`);

  const d = drift();
  if (Math.abs(d) > 0.08) errs.push(`picture is ${d}s off the voiceover plus tail`);
  return { errs, warns };
}

/* ---------------- render ---------------- */
async function render(list) {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME });
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.join(DIR, 'shot.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  for (const s of list) {
    const frames = Math.round(s.dur * FPS);
    const dir = path.join(OUT, 'f' + String(s.idx).padStart(3, '0'));
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });

    await page.evaluate(sh => window.SHOT(sh), s);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    // THE assertion for this film, checked from the live DOM before any frame is written.
    if (s.type === 'spell') {
      const got = await page.evaluate(() => window.SPELLED());
      const want = s.wrong
        ? s.word.slice(0, s.wrong.i) + s.wrong.ch + s.word.slice(s.wrong.i + 1)
        : s.word;
      if (got !== want) throw new Error(`shot ${s.idx}: screen reads "${got}", expected "${want}"`);
    }

    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    for (let i = 0; i < frames; i++) {
      const ms = (i / FPS) * 1000;
      await page.evaluate(([ms, p]) => {
        document.getAnimations().forEach(a => { a.currentTime = ms; });
        window.SETPROGRESS(p);
      }, [ms, i / frames]);
      await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }

    execFileSync(FF, ['-y', '-loglevel', 'error', '-framerate', String(FPS),
      '-i', path.join(dir, '%04d.png'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      path.join(OUT, 'shot' + String(s.idx).padStart(3, '0') + '.mp4')]);
    fs.rmSync(dir, { recursive: true, force: true });   // frames are huge and reproducible
    console.log(`  shot ${String(s.idx).padStart(3)} §${s.sec} ${s.type.padEnd(6)} ${s.dur.toFixed(2)}s ${frames}f  ok`);
  }
  await b.close();
  if (errs.length) { console.error('PAGEERRORS:', errs.slice(0, 5)); process.exit(1); }
}

/* One PNG at a chosen moment inside a shot — the cheap way to look at a new animation
 * before committing four cores to a hundred and twenty of them. */
async function still(idx, frac) {
  const s = shots[idx];
  const b = await chromium.launch({ executablePath: CHROME });
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.join(DIR, 'shot.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(sh => window.SHOT(sh), s);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  await page.evaluate(([ms, p]) => {
    document.getAnimations().forEach(a => { a.currentTime = ms; });
    window.SETPROGRESS(p);
  }, [s.dur * frac * 1000, frac]);
  fs.mkdirSync(OUT, { recursive: true });
  const p = path.join(OUT, `still-${String(idx).padStart(3, '0')}-${Math.round(frac * 100)}.png`);
  await page.screenshot({ path: p });
  await b.close();
  console.log(`${p}   §${s.sec} ${s.type} ${s.dur}s  ${JSON.stringify(s.cue || 'tail')}`);
  if (errs.length) { console.error('PAGEERRORS:', errs.slice(0, 5)); process.exit(1); }
}

/* ---------------- main ---------------- */
(async () => {
  const a = process.argv;
  const { errs, warns } = check();
  console.log(errs.length ? '--- ASSERTIONS FAILED ---' : `assertions pass: ${shots.length} shots`);
  errs.forEach(e => console.log('  ERR  ' + e));
  warns.forEach(w => console.log('  warn ' + w));
  if (errs.length) process.exit(1);
  if (a.includes('--check')) return;

  if (a.includes('--still')) {
    const spec = a[a.indexOf('--still') + 1];             // "34" or "34@0.6" or "12,34,56"
    for (const one of spec.split(',')) {
      const [i, f] = one.split('@');
      await still(+i, f == null ? 0.6 : +f);
    }
    return;
  }

  let list = shots;
  /* --resume skips shots whose mp4 already exists. The renderer had no resume and a
     killed run meant starting over; with 57 shots at ~70s that is an hour thrown away
     for one interruption. */
  /* --slice K/N takes every Nth shot starting at K. Four cores, one Chromium each: the
     render is CPU-bound on screenshotting 2K composites, so it scales almost linearly
     across processes. Combined with --resume, a worker also skips anything a sibling has
     already finished, so the slices self-heal if one dies. */
  const sl = a.indexOf('--slice');
  if (sl > -1) {
    const [k, n] = a[sl + 1].split('/').map(Number);
    list = list.filter(s => s.idx % n === k);
    console.log(`slice ${k}/${n}: ${list.length} shots`);
  }
  if (a.includes('--resume')) {
    const have = new Set(fs.existsSync(OUT) ? fs.readdirSync(OUT).filter(f => f.endsWith('.mp4')) : []);
    list = list.filter(s => !have.has('shot' + String(s.idx).padStart(3, '0') + '.mp4'));
    console.log(`resume: ${have.size} already rendered, ${list.length} to go`);
  }
  else if (a.includes('--shot')) list = [shots[+a[a.indexOf('--shot') + 1]]];
  else if (a.includes('--sec')) list = shots.filter(s => s.sec === +a[a.indexOf('--sec') + 1]);
  else if (!a.includes('--all')) { console.log('nothing to do — pass --all, --sec N or --shot N'); return; }

  console.log(`rendering ${list.length} shot(s)…`);
  await render(list);
})();
