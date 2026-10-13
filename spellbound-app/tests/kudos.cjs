/* SIBLING KUDOS — a kind word from someone at home, never free text (road to 4.5, P3.30; rubric L7 family/social).

   A sibling, or a grown-up behind the PIN, sends a child ONE of the fixed KUDOS lines (app3.js). This holds, on a phone
   with taps and on a desktop with the keyboard:
     · My page carries the kudos card: what this child was sent, and "Cheer on <sibling>" with the fixed lines as
       buttons — no text box, no editable field anywhere on the card or in the Parent Zone's sender;
     · a tap (or Tab + Enter) sends one line; the sibling's record gets {f: sender, m: line} — an index, never words — and
       a second kudos to the same sibling the same day is refused; nobody can send one to themselves;
     · the receiver's Home shows ONE quiet chip ("Ahana sent you kudos", an outline, never a filled button), which opens
       My page; once seen there, the chip is gone;
     · a grown-up sends from the Parent Zone, after the PIN — the same action from a child's screen does nothing; the
       receiver sees "A grown-up";
     · the kudos never leave the device: supabase-sync's PROGRESS_KEYS (the cloud's allow-list) does not carry them.
   Proved by breaking: a free-text box added to the card → the "no text box" check fails; the once-a-day rule taken out
   → "a second kudos the same day" fails; kudosGrown without its Parent Zone check → "from a child's screen" fails.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/kudos.cjs                                                */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = (n, av) => ({ name: n, age: 9, ageBand: '8-10', avatar: av, theme: 'spellbound', coins: 0, fr: '2026-10-01', lists: { default: { xp: 30 } }, activeList: 'default',
  missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey', trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } });

(async () => {
  /* the cloud's allow-list never carries kudos (they hold a sibling's first name) */
  const sync = fs.readFileSync(path.join(ROOT, 'supabase-sync.js'), 'utf8');
  const keys = (sync.match(/var PROGRESS_KEYS = \[([\s\S]*?)\];/) || [])[1] || '';
  ok(keys.length > 50 && !/kudos/.test(keys), 'the kudos never leave the device: the cloud allow-list (PROGRESS_KEYS) does not carry them');

  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });
  const errs = [];
  for (const vp of [{ n: 'phone', width: 390, height: 844, touch: true }, { n: 'desktop', width: 1180, height: 900 }]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch });
    await ctx.addInitScript(([a, r]) => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [a, r] }));
      localStorage.setItem('t_seed', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} }, [KID('Ahana', 'fox'), KID('Ravi', 'panda')]);
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(vp.n + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html');
    await pg.waitForFunction(() => typeof state !== 'undefined' && typeof app !== 'undefined' && state.screen, null, { timeout: 30000 });
    await pg.evaluate(() => { state.screen = 'app'; render(); });
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['words1', 'scrGrown'], r)));
    const open = async () => { await pg.evaluate(() => { state.progTab = 'me'; app.setNav('progress'); });
      await pg.waitForFunction(() => !!document.querySelector('[data-kudos]'), null, { timeout: 20000 }).catch(() => {}); };
    const tap = async (sel) => { if (vp.touch) await pg.tap(sel); else { await pg.focus(sel); await pg.keyboard.press('Enter'); } await pg.waitForTimeout(250); };

    /* My page: the card, the fixed lines, no text box */
    await open();
    const card = await pg.evaluate(() => { const k = document.querySelector('[data-kudos]'); if (!k) return null;
      const lines = [...k.querySelectorAll('[data-act="kudosSend"]')].map((b) => b.textContent.trim());
      return { lines, fixed: lines.every((t) => KUDOS.includes(t)) && lines.length === KUDOS.length, cheer: /Cheer on Ravi/.test(k.textContent),
        typed: k.querySelectorAll('input,textarea,[contenteditable]').length, small: [...k.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().height < 43).length }; });
    ok(!!card && card.cheer && card.fixed && card.typed === 0, `${vp.n}: My page's kudos card offers "Cheer on Ravi" with the ${card && card.lines.length} fixed lines and no text box (${card && card.typed} fields)`);
    ok(card && card.small === 0, `${vp.n}: every kudos button is a 44px target (${card && card.small} small)`);
    await tap('[data-kudos] [data-act="kudosSend"][data-arg="1|2"]');
    const sent = await pg.evaluate(() => { const r = state.children[1]; const k = document.querySelector('[data-kudos]');
      return { rec: JSON.stringify(r.kudos || []), n: (r.kudos || []).length, f: r.kudos && r.kudos[0].f, m: r.kudos && r.kudos[0].m, words: /You sent Ravi kudos today/.test(k ? k.textContent : ''), btns: k ? k.querySelectorAll('[data-act="kudosSend"]').length : -1 }; });
    ok(sent.n === 1 && sent.f === 'Ahana' && sent.m === 2 && !/Proud/.test(sent.rec), `${vp.n}: a ${vp.touch ? 'tap' : 'Tab + Enter'} sends one line — Ravi's record holds {f, m}, an index, not words (${sent.rec})`);
    ok(sent.words && sent.btns === 0, `${vp.n}: the card then says it was sent today and offers no more lines to Ravi`);
    const again = await pg.evaluate(() => { app.kudosSend('1|0'); app.kudosSend('0|1'); return { ravi: (state.children[1].kudos || []).length, me: (state.children[0].kudos || []).length }; });
    ok(again.ravi === 1 && again.me === 0, `${vp.n}: a second kudos to Ravi the same day is refused, and nobody sends one to themselves (${again.ravi}, ${again.me})`);
    /* a grown-up's action from a child's screen does nothing */
    const kid = await pg.evaluate(() => { app.setNav('home'); app.kudosGrown('0|0'); return (state.children[0].kudos || []).length; });
    ok(kid === 0, `${vp.n}: the grown-up's sender does nothing from a child's screen (${kid})`);

    /* Ravi's Home: one quiet chip, which opens My page; seen there, it goes */
    await pg.evaluate(() => { app.famSwitch ? app.famSwitch(1) : app.selectChild(1); app.setNav('home'); });
    await pg.waitForTimeout(400);
    const chip = await pg.evaluate(() => { const e = document.querySelector('.sb-content .sb-kudos-chip'); if (!e) return null; const s = getComputedStyle(e);
      return { t: e.textContent.trim(), bg: s.backgroundColor, filled: s.backgroundColor === getComputedStyle(document.querySelector('.sb-content .sb-continue') || e).backgroundColor }; });
    ok(!!chip && /Ahana sent you kudos/.test(chip.t) && !chip.filled, `${vp.n}: Ravi's Home shows one quiet chip — "${chip && chip.t}" — never a filled button`);
    await tap('.sb-content .sb-kudos-chip');
    await pg.waitForFunction(() => !!document.querySelector('[data-kudos] .sb-kudos-list'), null, { timeout: 20000 }).catch(() => {});
    const got = await pg.evaluate(() => ({ nav: state.nav, tab: state.progTab, line: ((document.querySelector('[data-kudos] .sb-kudos-list li') || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
    ok(got.nav === 'progress' && got.tab === 'me' && /Ahana/.test(got.line) && got.line.includes('Proud of you for not giving up.'), `${vp.n}: the chip opens My page, where the line reads "${got.line}"`);
    await pg.waitForTimeout(300); await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => !document.querySelector('.sb-content .sb-kudos-chip')), `${vp.n}: seen on My page, the chip on Home is gone`);

    /* a grown-up, behind the PIN, to Ravi's sister */
    await pg.evaluate(() => app.setNav('parent'));
    await pg.waitForFunction(() => !!state.pinDlg, null, { timeout: 10000 }).catch(() => {});
    await pg.keyboard.type('1234', { delay: 40 }); await pg.waitForTimeout(600);
    await pg.waitForFunction(() => !!document.querySelector('[data-kudos-parent]'), null, { timeout: 20000 }).catch(() => {});
    const par = await pg.evaluate(() => { const k = document.querySelector('[data-kudos-parent]'); if (!k) return null;
      const d = [...k.querySelectorAll('details')].find((x) => /To Ahana/.test(x.textContent)); if (d) d.open = true;
      return { typed: k.querySelectorAll('input,textarea,[contenteditable]').length, ok: !!d }; });
    ok(!!par && par.ok && par.typed === 0, `${vp.n}: the Parent Zone (after the PIN) sends a kind word — fixed lines, no text box`);
    if (par && par.ok) {
      await pg.evaluate(() => { const d = [...document.querySelectorAll('[data-kudos-parent] details')].find((x) => /To Ahana/.test(x.textContent)); d.querySelector('[data-arg="0|0"]').click(); });
      await pg.waitForTimeout(300);
      const g = await pg.evaluate(() => { const k = state.children[0].kudos || []; app.progTab('me'); app.famSwitch ? app.famSwitch(0) : app.selectChild(0); app.setNav('home'); return { n: k.length, f: k[0] && k[0].f, m: k[0] && k[0].m }; });
      await pg.waitForTimeout(400);
      const c2 = await pg.evaluate(() => ((document.querySelector('.sb-content .sb-kudos-chip') || {}).textContent || '').trim());
      ok(g.n === 1 && g.f === '' && g.m === 0 && /A grown-up sent you kudos/.test(c2), `${vp.n}: Ahana gets the grown-up's line, and her Home says "${c2}"`);
    }
    await ctx.close();
  }
  await b.close();
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
