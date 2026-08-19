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

/* ---------------- assertions (brief Rule 5) ---------------- */
function check() {
  const errs = [];
  const imgs = new Set(fs.readdirSync(path.join(DIR, '..', 'images')));
  shots.forEach(s => {
    const tag = `shot ${s.idx} §${s.sec}`;
    if (s.dur < 2.0) errs.push(`${tag}: ${s.dur}s — under the 2.0s floor, will strobe`);
    if (s.src && !imgs.has(s.src)) errs.push(`${tag}: missing asset ${s.src}`);
    if (s.type === 'spell' && !/^[A-Z]+$/.test(s.word)) errs.push(`${tag}: word not A–Z: ${s.word}`);
    if (s.type === 'spell' && s.wrong && (s.wrong.i < 0 || s.wrong.i >= s.word.length))
      errs.push(`${tag}: wrong-letter index ${s.wrong.i} outside "${s.word}"`);
  });
  const d = drift();
  if (Math.abs(d) > 0.05) errs.push(`picture is ${d}s short of the voiceover — inter-section gaps unclaimed`);
  // every section is covered edge to edge, with no gap and no overlap
  const { SECTIONS } = require('./scenes.js');
  SECTIONS.forEach(sec => {
    const mine = shots.filter(s => s.sec === sec.n);
    if (!mine.length) { errs.push(`§${sec.n} ${sec.label}: no shots`); return; }
    const covered = mine.reduce((a, s) => a + s.dur, 0);
    const nx = SECTIONS.find(x => x.n === sec.n + 1);
    const want = nx ? +(nx.in - sec.in).toFixed(3) : sec.len;   // includes the trailing gap
    if (Math.abs(covered - want) > 0.05)
      errs.push(`§${sec.n}: shots cover ${covered.toFixed(2)}s, need ${want}s`);
  });
  return errs;
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

/* ---------------- main ---------------- */
(async () => {
  const a = process.argv;
  const errs = check();
  console.log(errs.length ? '--- ASSERTIONS FAILED ---' : `assertions pass: ${shots.length} shots`);
  errs.forEach(e => console.log('  ' + e));
  if (errs.length) process.exit(1);
  if (a.includes('--check')) return;

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
