/* A word whose recording is missing must be spoken ONCE.
   A clip that fails to load fires both `error` on the <audio> element AND a rejection
   from play(). The fallback was wired to both, so on every hosted build — where each
   clip is streamed from raw.githubusercontent and a word listed in SB_WVOICE whose file
   isn't there 404s — the device voice said the word twice.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/tts-once.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1180, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + root + '/index.html');
  await pg.waitForTimeout(3000);

  const r = await pg.evaluate(async () => {
    const S = window.speechSynthesis, rs = S.speak.bind(S);
    window.__spoke = [];
    S.speak = u => { window.__spoke.push(u.text); };          // count only; never audible
    // force the clip branch onto a path that cannot load, which is exactly what a
    // missing recording looks like on a streamed build
    const realWordClip = window.wordClip;
    window.wordClip = () => 'voice/w/__definitely-missing__.mp3';
    const out = {};
    window.__spoke = [];
    deviceSpeak('ghostword', 0.9);
    await new Promise(r => setTimeout(r, 2500));
    out.missingClip = window.__spoke.slice();
    // a second word tapped while the first is still failing must not be talked over
    window.__spoke = [];
    deviceSpeak('firstword', 0.9); deviceSpeak('secondword', 0.9);
    await new Promise(r => setTimeout(r, 2500));
    out.twoTaps = window.__spoke.slice();
    window.wordClip = realWordClip;
    return out;
  });

  const said = r.missingClip.filter(t => t === 'ghostword');
  if (said.length !== 1) errs.push('missing clip spoke ' + said.length + '× (want 1): ' + JSON.stringify(r.missingClip));
  const second = r.twoTaps.filter(t => t === 'secondword');
  const first = r.twoTaps.filter(t => t === 'firstword');
  if (second.length !== 1) errs.push('second tap spoke ' + second.length + '× (want 1): ' + JSON.stringify(r.twoTaps));
  if (first.length !== 0) errs.push('a superseded tap still spoke: ' + JSON.stringify(r.twoTaps));

  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — a missing recording is spoken exactly once, and a superseded tap stays quiet');
  process.exit(errs.length ? 1 : 0);
})();
