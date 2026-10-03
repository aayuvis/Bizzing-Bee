/* A RIVAL NEVER WEARS THE CHILD'S FACE (FIX2 #3, 3 Oct 2026) — @check

   The Mock Spelling Bee's ten rivals wear avatars, and one of them, Suki, wears the panda — so a
   child who had picked the panda met a rival drawn as themselves, in the lobby, on the field and
   at the microphone. Each rival now carries an `alt` face (mockbee.js BOTS), worn only when their
   own is the child's: deterministic, and never a face anyone else in the hall wears.

   For a child wearing EACH rival's avatar in turn (and five other avatars, two of them rivals'
   stand-ins): no rival's face is the child's, the ten faces are ten different avatars that all
   draw, and the rendered lobby and stage show the child's avatar only where the child is.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/mockbee-faces.cjs                  */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const RIVALS = ['pixel', 'koi', 'beaker', 'panda', 'comet', 'astro', 'scopey', 'melody', 'samurai', 'goldlegend'];
const OTHERS = ['bizzy', 'neko', 'ninja', 'crystal', 'queenhive'];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 900 } });
  await ctx.addInitScript(() => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
    children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' }] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {} }; }; try { speechSynthesis.speak = () => {}; } catch (e) {} });

  const bad = [];
  for (const me of RIVALS.concat(OTHERS)) {
    const r = await pg.evaluate(async me => {
      const W = ms => new Promise(res => setTimeout(res, ms));
      active().avatar = me; app.mbOpen(); await W(120);
      const idOf = el => { const i = el && el.querySelector('img'); const m = i && /avatars\/(?:s\/)?([^./?]+)\./.exec(i.getAttribute('src') || ''); return m ? m[1] : null; };
      const faces = MOCKBEE.faces().map(f => f.face);
      const draws = faces.every(f => window.SB_AVATARS.byId[f] && SB_AVATAR(f, 54));
      const lobbyRivals = [...document.querySelectorAll('.mb-card-face')].map(idOf);
      app.mbStart(); await W(250);
      const field = (state.mb.field || []).filter(s => s.kind === 'bot');
      const stage = [...document.querySelectorAll('.sb-content img')].map(i => { const m = /avatars\/(?:s\/)?([^./?]+)\./.exec(i.getAttribute('src') || ''); return m ? m[1] : null; }).filter(Boolean);
      const mine = stage.filter(x => x === me).length;
      app.mbQuit();
      return { faces, draws, lobbyRivals, distinct: new Set(faces).size, fieldN: field.length, mine, stageRivals: stage.filter(x => x !== me).length };
    }, me);
    const clash = r.faces.filter(f => f === me).length + r.lobbyRivals.filter(f => f === me).length;
    if (clash || r.distinct !== 10 || !r.draws || r.mine > 1) bad.push(`${me}: ${JSON.stringify(r)}`);
    if (RIVALS.includes(me)) console.log(`       wearing ${me}: that rival wears ${r.faces[RIVALS.indexOf(me)]}`);
  }
  ok(!bad.length, `for ${RIVALS.length + OTHERS.length} child avatars (all ten rivals' among them): no rival wears the child's face, ten different faces that all draw, and the child's avatar shows only once on the stage` + (bad.length ? ' — ' + bad.slice(0, 3).join(' | ') : ''));
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
