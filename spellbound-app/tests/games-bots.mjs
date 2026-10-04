/* THE BOT HARNESS — random, perfect and at-level players in every game (games spec §8) — T1, T2, T6

   One harness for every game and hub mode, so a game cannot pay a child for luck without a test
   saying so. Each game REGISTERS A DRIVER; the harness owns the bots and the checks:
     T1  the random bot earns 0 coins                                   (every driver)
     T2  the random bot scores under 25% of the perfect bot             (drivers that report a score)
     T6  the finish card's coins are the ledger's change (lib/coins.cjs) (drivers that name a card)
   Bots (seeded — the same run twice is the same run):
     random    types random letters (a word's length) or taps a random option
     perfect   answers with the driver's ORACLE — the target from the game's own state or the say()
               hook, never read off the screen (the screen must not show the answer)
     atLevel   perfect 70% of the time, random otherwise
   THE HOOK SHAPE. A game adds a file tests/bots/<key>.mjs (loaded automatically) whose default export is
     {
       key:    'gym/sprint',             // the SB_PLAY_CARDS key, or '<hub>/<mode>'
       kind:   'type' | 'choice',        // a typed word, or an index into options
       level:  'medium',                 // optional; set through SB_LEVEL before the round
       secs:   20,                       // optional; how long a bot plays if the round does not end itself
       async start(pg, {level}),         // open ONE round through the real opener; return when it is up
       async read(pg),                   // → {target?: string, options?: string[], answer?: number,
                                         //    done?: boolean} — target/answer are the oracle
       async answer(pg, value, read),    // type the string / tap the index (keyboard or touch, either)
       async result(pg),                 // → {right, asked, card?: '<selector of the finish card>'} or null
       async stop(pg)                    // optional: leave the round
     }
   The built-in drivers mount the three arcade cards (Grand Prix, Type Blaster, Honeycomb Run) through
   app.arcadePlay, and use the say() hook as the oracle — the engines speak each word they ask. Mock
   Bee, the hubs, Daily Bee and Word Forge register theirs as they land.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/games-bots.mjs [key…] [--bots random,perfect]
   (tests/lib/run.cjs discovers .mjs tests too.)                                                      */
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { booted, until } = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = process.env.SB_ROOT || path.resolve(HERE, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('--'));
const BOTS = ((args.find(a => a.startsWith('--bots=')) || '--bots=random,perfect').split('=')[1]).split(',');

/* ---- the registry ---- */
const DRIVERS = [];
export function register(d) { if (d && d.key && !DRIVERS.some(x => x.key === d.key)) DRIVERS.push(d); }
/* the arcade cards: mount the engine, dismiss its how-to, read the word it SAYS */
function arcadeDriver(k) {
  return { key: k, kind: 'type', secs: 14, level: 'easy',
    async start(pg, { level }) {
      await pg.evaluate(([k, level]) => { window.__bot = { said: [] };
        if (!window.__botSay) { window.__botSay = window.say; window.say = function (w) { try { window.__bot.said.push(String(w)); } catch (e) {} return window.__botSay && window.__botSay.apply(this, arguments); }; }
        SB_LEVEL.set(k, level); app.arcadePlay(k, { opts: {}, fromMenu: true }); }, [k, level]);
      await until(pg, () => !!document.querySelector('.arc-play #arc-host'), null, 15000);
      await pg.evaluate(() => { const go = document.querySelector('.arc-play #sg-howgo'); if (go) go.click(); });
    },
    async read(pg) { return pg.evaluate(() => ({ target: (window.__bot.said.slice(-1)[0] || ''), done: !document.querySelector('.arc-play #arc-host') || !!document.querySelector('.arc-play .sgr, .arc-play .arc-res, .arc-result') })); },
    async answer(pg, text) {
      const typed = await pg.evaluate((t) => { const inp = [...document.querySelectorAll('.arc-play input')].find(i => i.offsetParent);
        if (inp) { inp.focus(); inp.value = t; inp.dispatchEvent(new Event('input', { bubbles: true })); return true; } return false; }, text);
      if (typed) await pg.keyboard.press('Enter');
      else for (const ch of text) await pg.keyboard.press(ch);
    },
    async result() { return null; },
    async stop(pg) { await pg.evaluate(() => { try { arcadeClose(); } catch (e) {} }); } };
}
['beeGrandPrix', 'typeBlaster', 'honeycombRun'].forEach(k => register(arcadeDriver(k)));
const botDir = path.join(HERE, 'bots');
if (fs.existsSync(botDir)) for (const f of fs.readdirSync(botDir).filter(f => /\.mjs$/.test(f)).sort()) register((await import(pathToFileURL(path.join(botDir, f)).href)).default);

/* ---- the bots (seeded) ---- */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const LET = 'abcdefghijklmnopqrstuvwxyz';
function bot(name, seed) { const r = rng(seed);
  const rand = (rd, kind) => kind === 'choice' ? Math.floor(r() * Math.max(1, (rd.options || []).length)) : Array.from({ length: Math.max(3, (rd.target || 'xxxxx').length) }, () => LET[Math.floor(r() * 26)]).join('');
  const perf = (rd, kind) => kind === 'choice' ? rd.answer : rd.target;
  return { name, pick(rd, kind) { if (name === 'random') return rand(rd, kind); if (name === 'perfect') return perf(rd, kind); return r() < 0.7 ? perf(rd, kind) : rand(rd, kind); } }; }

/* ---- one round ---- */
async function play(pg, d, b) {
  const m = await coins.mark(pg); const t0 = Date.now(); let steps = 0, last = '';
  await d.start(pg, { level: d.level || 'medium' });
  while (Date.now() - t0 < (d.secs || 20) * 1000 && steps < (d.maxSteps || 80)) {
    const rd = await d.read(pg); if (rd.done) break;
    const has = d.kind === 'choice' ? Array.isArray(rd.options) && rd.options.length : !!rd.target;
    if (has && (d.kind === 'choice' || rd.target !== last || b.name !== 'perfect')) { await d.answer(pg, b.pick(rd, d.kind), rd); steps++; last = rd.target; }
    await pg.waitForTimeout(350);   // a player's pace, not a wait for state: the bot is the one acting
  }
  const res = d.result ? await d.result(pg) : null; const r = await coins.since(pg, m);
  if (res && res.card) r.card = await coins.cardCoins(pg, res.card);
  if (d.stop) await d.stop(pg);
  return { res, r, steps };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [{ name: 'Botty', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, band: 4, lists: { journey: { xp: 12 } }, activeList: 'journey' }] };
  const ctx = await b.newContext({ viewport: { width: 1180, height: 860 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_bots')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_bots', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html'); ok(await booted(pg), 'the app booted');
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('words2', r)));
  const drivers = DRIVERS.filter(d => !only.length || only.some(q => d.key.includes(q)));
  ok(drivers.length > 0, `${drivers.length} drivers registered: ${drivers.map(d => d.key).join(', ')}`);
  for (const d of drivers) {
    const out = {};
    for (const name of BOTS) { out[name] = await play(pg, d, bot(name, 7 + name.length)); }
    const R = out.random, P = out.perfect;
    if (R) ok(R.r.earned === 0 && R.r.balance === 0, `T1 ${d.key}: the random bot earns 0 coins (${R.r.earned}${R.r.events.length ? ': ' + R.r.events.join(', ') : ''}; ${R.steps} answers)`);
    if (R && P && R.res && P.res && P.res.asked) ok((R.res.right / Math.max(1, R.res.asked)) < 0.25 * (P.res.right / P.res.asked), `T2 ${d.key}: the random bot scores under 25% of the perfect bot (${R.res.right}/${R.res.asked} vs ${P.res.right}/${P.res.asked})`);
    for (const name of Object.keys(out)) { const o = out[name]; if (o.r.card != null) coins.check(ok, `T6 ${d.key} (${name})`, o.r.card, o.r);
      if (name !== 'random') console.log(`       ${d.key} · ${name}: ${o.steps} answers, ${o.r.earned} coins (${o.r.events.join(', ') || 'none'})`); }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
