#!/usr/bin/env node
/* ============================================================================
   Bizzing Bee — the automated audit (TESTING-PROTOCOL.md §10).

   WHY THIS FILE LIVES IN THE REPO
     The protocol used to point at `scratchpad/deeptest*.cjs`. Session scratchpads
     are deleted, so by the time anyone needed the harness it was gone and the
     whole thing had to be rebuilt from the protocol prose. It lives here now.

   RUN
     python3 -m http.server 8991            # from spellbound-app/
     NODE_PATH=/opt/node22/lib/node_modules /opt/node22/bin/node qa/audit.cjs
     BASE=http://localhost:8991/index.html  # override if you serve elsewhere

   FOUR ASSERTIONS THAT LOOK RIGHT AND ARE NOT — every one of these produced a
   confident false positive on the first run of this harness. Do not reintroduce
   them:

     1. "a purchase must call confirm()".  buyTheme() legitimately refuses before
        it ever asks, when the world is not in the child's plan — it opens the
        upsell and returns. The safety property is NO STATE CHANGE WITHOUT A YES,
        which is what this file asserts.
     2. "a game canvas must have painted after ~1s".  Gated engines run their
        frame loop but deliberately skip draw() until `started`, which the how-to
        card sets. keepFlying read as a dead black canvas until the card was
        clicked; it paints ~3,000 colours the moment it is. Dismiss the how-to.
     3. "the widest element sticking out is the culprit".  Background decoration
        (the .w4o-* bees) is absolutely positioned far off-screen inside a clipped
        .w4-bg, so it has a huge rect and cannot affect the page at all. Skip
        ancestors with ANY non-visible overflow-x, not just auto|scroll.
     4. "read the look off getComputedStyle(body)".  Dusk's dark comes from the
        fixed .w4-bg layer painted over body's background, so body reads white in
        dusk and the contrast maths is meaningless. Measure real pixels. Likewise
        text size is #root `zoom` (data-size), not font-size, and the a11y flags
        land on <html>, not on #root.
   ========================================================================== */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8991/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const NAVS = ['home','concepts','levelup','train','coach','quest','explore','themes','figurative',
  'vocab','quotes','trivtrain','ipatrain','trail','typing','builder','leveltest','traps','revisions',
  'evolution','worlds','collection','finder','games','mockbee','trivia','adv','shop','progress',
  'parent','journeys','settings','voicetest','evofeedback','sq','debug'];
const ENGINES = ['honeycombRun','keepFlying','wordHive','beeGrandPrix','whackAMoth','spellShield',
  'spotlightSimon','unscrambleStars','wordSnake','combCatcher','stageRhythm','constellationConnect',
  'typeBlaster','spellScene'];
const FAMS = ['Baloo 2','Bangers','Bungee','Comfortaa','Fraunces','Fredoka','Hanken Grotesk',
  'Quicksand','Righteous','Sono','Verdana','Geneva'];

/* Six profiles spanning every axis that changes behaviour: age band, progress,
   tier, the advanced add-on, the testing unlock, and a parent PIN. */
const PROFILES = [
  { id: 'fresh8',    theme: 'spellbound', child: { name:'Ana', age:8,  theme:'spellbound', avatar:'bizzy', goal:10, coins:0,    level:1,  tier:'free',     questPath:'coach', lists:{}, missed:[] } },
  { id: 'mid10',     theme: 'ocean',      child: { name:'Kai', age:10, theme:'ocean',      avatar:'bizzy', goal:15, coins:320,  level:4,  tier:'free',     questPath:'coach', lists:{}, missed:['receive','necessary'], xp:1200 } },
  { id: 'strong12',  theme: 'space',      child: { name:'Riya',age:12, theme:'space',      avatar:'bizzy', goal:25, coins:1500, level:7,  tier:'beginner', questPath:'coach', lists:{}, missed:['liaison'], xp:6400 } },
  { id: 'teen15adv', theme: 'forest',     child: { name:'Sam', age:15, theme:'forest',     avatar:'bizzy', goal:30, coins:4000, level:10, tier:'regional', addons:{advanced:1}, questPath:'coach', lists:{}, missed:[], xp:19000 } },
  { id: 'devunlock', theme: 'candy',   devUnlock:true, child: { name:'Dev', age:11, theme:'candy', avatar:'bizzy', goal:20, coins:99, level:5, tier:'free', questPath:'coach', lists:{}, missed:[] } },
  { id: 'pinlocked', theme: 'spellbound', pin:'1234', child: { name:'Pia', age:9, theme:'spellbound', avatar:'bizzy', goal:10, coins:50, level:3, tier:'free', questPath:'coach', lists:{}, missed:[] } },
];
const WIDTHS = [[390, 780, 'phone'], [820, 1100, 'tablet'], [1366, 900, 'laptop']];

const F = [];
const add = (sev, kind, where, detail) => F.push({ sev, kind, where, detail });

/* Returns the page's horizontal overflow and the element genuinely responsible:
   anything inside a clipped or scrolling ancestor cannot grow the document. */
const OVER_PROBE = `() => {
  const W = window.innerWidth, de = document.documentElement;
  const over = de.scrollWidth - W;
  if (over <= 2) return { over: 0 };
  let worst = null;
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right <= W + 1 || r.width < 6) return;
    for (let a = el.parentElement; a; a = a.parentElement)
      if (getComputedStyle(a).overflowX !== 'visible') return;
    if (!worst || r.right > worst.right) worst = {
      right: Math.round(r.right), w: Math.round(r.width),
      s: el.tagName + '.' + (String(el.className).slice(0, 32) || '(none)') };
  });
  return { over, worst };
}`;

const seed = (page, P) => page.evaluate(P => {
  state.children = [P.child]; state.activeIdx = 0;
  if (typeof ensureLists === 'function') ensureLists(state.children[0]);
  state.devUnlock = !!P.devUnlock;
  if (P.pin) state.parentPin = P.pin;
  state.screen = 'app'; state.theme = P.theme; render();
}, P);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  /* ---- 1. boot + nav sweep, every profile, every width ---- */
  console.log('--- nav sweep: %d profiles x %d screens x %d widths', PROFILES.length, NAVS.length, WIDTHS.length);
  for (const P of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
    const page = await ctx.newPage();
    let where = P.id + '/boot';
    const seen = new Set();
    const once = (sev, kind, detail) => {
      const k = kind + '|' + where + '|' + detail.slice(0, 90);
      if (!seen.has(k)) { seen.add(k); add(sev, kind, where, detail); } };
    page.on('pageerror', e => once('BLOCKER', 'pageerror', e.message.slice(0, 190)));
    page.on('console', m => { if (m.type() === 'error' && !/favicon/i.test(m.text()))
      once('MAJOR', 'console.error', m.text().slice(0, 190)); });
    page.on('response', r => { if (r.status() >= 400 && !/voice\/(w|d|ann)\//.test(r.url()))
      once('MAJOR', 'http-' + r.status(), r.url().replace(/^https?:\/\/[^/]+/, '')); });

    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(5000);          // let boot-lazy land the deferred shards
    await seed(page, P);

    for (const nav of NAVS) for (const [w, h, label] of WIDTHS) {
      where = `${P.id}/${nav}@${label}`;
      await page.setViewportSize({ width: w, height: h });
      const r = await page.evaluate(async ({ nav, pr }) => {
        try { state.nav = nav; state.conceptSel = null; state.themeSel = null; state.vocCheck = null; render(); }
        catch (e) { return { threw: String(e) }; }
        await new Promise(r => setTimeout(r, 60));
        const txt = ((document.getElementById('root') || document.body).innerText || '').trim();
        return Object.assign({ len: txt.length, head: txt.slice(0, 60).replace(/\s+/g, ' ') },
          eval('(' + pr + ')')());
      }, { nav, pr: OVER_PROBE });
      if (r.threw) { add('BLOCKER', 'render-threw', where, r.threw); continue; }
      if (r.len < 40) add('MAJOR', 'dead-screen', where, `${r.len} chars: "${r.head}"`);
      if (r.over > 2) add('MAJOR', 'h-overflow', where,
        `${r.over}px${r.worst ? ' via ' + r.worst.s + ' right=' + r.worst.right : ''}`);
    }
    await ctx.close();
  }

  /* ---- 2. content safety, money, PIN, the vocab firewall ---- */
  console.log('--- masking / purchase / PIN / vocab firewall');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => add('BLOCKER', 'pageerror', 'deep', e.message.slice(0, 190)));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  await seed(page, { child: { name:'Q', age:11, theme:'spellbound', avatar:'bizzy', goal:15,
    coins:5000, level:6, tier:'free', questPath:'coach', lists:{}, missed:[] }, theme:'spellbound' });

  // masking: a meaning must never contain its own headword, or the base of an inflection
  const mask = await page.evaluate(() => {
    const flat = [];
    const walk = v => { if (!v) return;
      if (Array.isArray(v)) { v.forEach(x => (x && x.w && x.d) ? flat.push(x) : walk(x)); return; }
      if (typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); };
    try { walk(SB_DATA); } catch (e) { return { err: String(e) }; }
    const step = Math.max(1, Math.floor(flat.length / 3000));
    const leaks = []; let n = 0;
    for (let i = 0; i < flat.length; i += step) {
      const w = flat[i]; if (!w || !w.w || !w.d) continue; n++;
      let txt; try { txt = String(blankHTML(w.d, w.w)).replace(/<[^>]*>/g, ' '); }
      catch (e) { leaks.push(w.w + ': blankHTML threw'); continue; }
      const hit = t => t && new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(txt);
      if (hit(w.w)) { leaks.push(w.w + ': headword survives masking'); continue; }
      const m = /\b(?:plural|past tense|present tense|comparative|superlative|past participle)\s+of\s+([a-z][a-z'-]+)/i.exec(String(w.d));
      if (m && hit(m[1])) leaks.push(w.w + ': base form "' + m[1] + '" leaks');
    }
    return { n, pool: flat.length, leaks: leaks.slice(0, 12), total: leaks.length };
  });
  if (mask.err) add('BLOCKER', 'masking', 'blankHTML', mask.err);
  else { console.log(`    masking: ${mask.n} of ${mask.pool} words sampled, ${mask.total} leaks`);
    mask.leaks.forEach(l => add('MAJOR', 'masking-leak', 'blankHTML', l)); }

  // money: the property is NO STATE CHANGE WITHOUT A YES (see the header note)
  const buy = await page.evaluate(() => {
    const real = window.confirm, out = [];
    for (const [fn, arg] of [['buyTheme','aurora'], ['buyPower','freeze'], ['buyList','nsf_finals'], ['buyConcept','3']]) {
      if (typeof app[fn] !== 'function') { out.push({ fn, missing: true }); continue; }
      const c = active();
      const snap = () => JSON.stringify({ coins: c.coins, th: c.unlockedThemes || [], po: c.pow || {},
        fz: c.freezes || 0, li: c.unlockedLists || {}, co: c.unlockedConcepts || {} });
      const before = snap(); let asked = 0;
      window.confirm = () => { asked++; return false; };          // the child says no
      try { app[fn](arg); } catch (e) { out.push({ fn, threw: String(e) }); continue; }
      out.push({ fn, asked, spentOnNo: before !== snap() });
    }
    window.confirm = real; return out;
  });
  buy.forEach(b => {
    if (b.missing) add('MINOR', 'purchase', b.fn, 'action not present');
    else if (b.threw) add('MAJOR', 'purchase', b.fn, b.threw);
    else if (b.spentOnNo) add('BLOCKER', 'purchase-on-deny', b.fn, 'state changed after confirm() returned false');
  });

  // PIN gates the parent surfaces
  const pin = await page.evaluate(() => {
    const r = {}; state.parentPin = '1234';
    for (const nav of ['settings', 'parent']) {
      state.pinDlg = null; state.pinOk = false;
      try { app.setNav ? app.setNav(nav) : (state.nav = nav); } catch (e) {}
      r[nav] = { dlg: !!state.pinDlg, landed: state.nav };
    }
    state.parentPin = ''; state.pinDlg = null; return r;
  });
  for (const k of Object.keys(pin)) if (!pin[k].dlg)
    add('BLOCKER', 'pin-not-gated', k, `landed on ${pin[k].landed} with no PIN dialog`);

  // a vocabulary session must not move spelling progress
  const voc = await page.evaluate(() => {
    const c = active();
    const snap = () => JSON.stringify({ lists: c.lists, xp: c.xp, level: c.level,
      luMastered: c.luMastered, missed: c.missed, band: c.band });
    const before = snap(); let ran = 0;
    try { for (let i = 0; i < 12; i++) { if (typeof vocBuildCheck !== 'function') break;
      if (!vocBuildCheck()) break; ran++; } } catch (e) { return { err: String(e) }; }
    return { ran, same: before === snap() };
  });
  if (voc.err) add('MAJOR', 'vocab', 'vocBuildCheck', voc.err);
  else if (voc.ran && !voc.same) add('BLOCKER', 'vocab-touches-spelling', 'vocab',
    'a meaning session mutated spelling progress');

  /* ---- 3. the 14 engines, driven through the how-to gate ---- */
  console.log('--- engines');
  for (const name of ENGINES) {
    const r = await page.evaluate(async name => {
      const host = document.createElement('div');
      host.style.cssText = 'width:1000px;height:640px;position:fixed;left:0;top:0;z-index:99999';
      document.body.appendChild(host);
      try { SB_SAGA_ENGINES[name](host, { diff:'easy', world:'meadow', onUnlock(){} }, () => {}); }
      catch (e) { host.remove(); return { threw: String(e) }; }
      const shot = () => { const cv = host.querySelector('canvas'); if (!cv) return null;
        const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        const s = new Set();
        for (let i = 0; i < d.length; i += 4 * 197) s.add(d[i] + ',' + d[i+1] + ',' + d[i+2]);
        return s.size; };
      await new Promise(r => setTimeout(r, 700));
      const go = host.querySelector('#sg-howgo, .sg-howto-go');
      if (go) go.click();                                     // "understand" -> "play"
      await new Promise(r => setTimeout(r, 200));
      host.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await new Promise(r => setTimeout(r, 1400));
      const after = shot(), dom = host.children.length > 0, ctl = !!host.querySelector('input,button');
      host.remove();
      return { after, dom, ctl, gated: !!go };
    }, name);
    if (r.threw) { add('BLOCKER', 'engine-threw', name, r.threw); continue; }
    if (!r.dom) add('BLOCKER', 'engine-empty', name, 'host got no DOM');
    else if (r.after !== null && r.after <= 3)
      add('BLOCKER', 'engine-blank', name, `canvas still ${r.after} colour(s) after the how-to`);
    if (!r.ctl && r.after === null) add('MAJOR', 'engine-no-controls', name, 'no canvas and no controls');
  }

  /* ---- 4. fonts: nothing may resolve to a generic family ---- */
  console.log('--- fonts');
  const themes = await page.evaluate(() => { try { return THEMES.map(t => t.id).slice(0, 4); }
    catch (e) { return ['spellbound','ocean','space']; } });
  for (const th of themes) for (const mode of ['light', 'dusk']) {
    const bad = await page.evaluate(async ({ th, mode, FAMS }) => {
      try { app.pickTheme ? app.pickTheme(th) : (state.theme = th); } catch (e) {}
      state.mode = mode; state.nav = 'home'; render();
      await document.fonts.ready; await new Promise(r => setTimeout(r, 220));
      const bad = [];
      document.querySelectorAll('#root *').forEach(el => {
        let hasText = false;
        el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) hasText = true; });
        if (!hasText) return;
        const fam = getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        if (!FAMS.includes(fam) && bad.length < 5) bad.push(fam + ' on ' + el.tagName);
      });
      return bad;
    }, { th, mode, FAMS });
    bad.forEach(x => add('MAJOR', 'generic-font', `${th}/${mode}`, x));
  }

  /* ---- 5. the three looks, measured from painted pixels ---- */
  console.log('--- looks');
  for (const [mode, wantDark] of [['light', false], ['white', false], ['dusk', true]]) {
    await page.evaluate(async m => { state.mode = m; state.nav = 'home'; render();
      await new Promise(r => setTimeout(r, 400)); }, mode);
    const png = (await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 700 } })).toString('base64');
    const mean = await page.evaluate(async b64 => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let s = 0, n = 0;
      for (let i = 0; i < d.length; i += 4 * 53) { s += (0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]) / 255; n++; }
      return +(s / n).toFixed(3);
    }, png);
    console.log(`    ${mode}: mean luminance ${mean}`);
    if (wantDark && mean > 0.45) add('MAJOR', 'look', mode, `dusk paints light (mean luminance ${mean})`);
    if (!wantDark && mean < 0.55) add('MAJOR', 'look', mode, `${mode} paints dark (mean luminance ${mean})`);
  }

  /* ---- 6. accessibility: state -> <html> attribute, and is there a control? ---- */
  console.log('--- accessibility');
  const a11y = await page.evaluate(async () => {
    const R = document.documentElement, out = [];
    app.setTextSize('large'); render(); await new Promise(r => setTimeout(r, 200));
    out.push({ k: 'text size', attr: R.getAttribute('data-size'),
      zoom: getComputedStyle(document.getElementById('root')).zoom, ctl: true });
    app.setTextSize('normal'); render();
    for (const [k, key, attr, val] of [
      ['dyslexia font', 'a11yFont', 'data-font', 'easy'],
      ['high contrast', 'a11yContrast', 'data-contrast', 'high'],
      ['reduced motion', 'a11yMotion', 'data-motion', 'off']]) {
      state[key] = key === 'a11yFont' ? 'easy' : true;
      render(); await new Promise(r => setTimeout(r, 150));
      out.push({ k, applied: R.getAttribute(attr) === val,
        ctl: !!document.querySelector(`[data-act="set${key.charAt(0).toUpperCase()}${key.slice(1)}"]`) });
      state[key] = key === 'a11yFont' ? 'std' : false;
    }
    render(); return out;
  });
  a11y.forEach(a => {
    if (a.zoom) { console.log(`    ${a.k}: data-size=${a.attr} zoom=${a.zoom}`);
      if (a.zoom === '1' || a.attr !== 'large') add('MAJOR', 'a11y-inert', a.k, 'no effect'); return; }
    console.log(`    ${a.k}: applies=${a.applied} control=${a.ctl}`);
    if (!a.applied) add('MAJOR', 'a11y-inert', a.k, 'state set but the attribute never lands');
    else if (!a.ctl) add('MINOR', 'a11y-no-control', a.k,
      'works, but nothing in the UI can turn it on (protocol §7 logs this as a gap)');
  });

  /* ---- 7. onboarding, cold, on a phone ---- */
  console.log('--- onboarding');
  const octx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const op = await octx.newPage();
  op.on('pageerror', e => add('BLOCKER', 'onboarding-error', 'phone', e.message.slice(0, 190)));
  await op.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await op.goto(BASE, { waitUntil: 'load' });
  await op.waitForTimeout(5000);
  const onb = await op.evaluate(async pr => {
    const probe = eval('(' + pr + ')');
    const steps = [];
    const click = re => { const b = [...document.querySelectorAll('button')]
      .find(x => re.test(x.innerText || '')); if (b) { b.click(); return true; } return false; };
    steps.push({ at: 'landing', ...probe(), screen: state.screen,
      len: (document.body.innerText || '').trim().length });
    click(/start free/i); await new Promise(r => setTimeout(r, 500));
    steps.push({ at: 'auth', ...probe(), screen: state.screen });
    click(/create account/i); await new Promise(r => setTimeout(r, 600));
    steps.push({ at: 'onboarding', ...probe(), screen: state.screen });
    return steps;
  }, OVER_PROBE);
  onb.forEach(s => {
    console.log(`    ${s.at}: screen=${s.screen} overflow=${s.over}px`);
    if (s.len !== undefined && s.len < 40) add('BLOCKER', 'onboarding-blank', s.at, `${s.len} chars`);
    if (s.over > 2) add('MAJOR', 'onboarding-overflow', s.at,
      `${s.over}px${s.worst ? ' via ' + s.worst.s : ''}`);
  });

  await browser.close();

  /* ---- report ---- */
  const ord = { BLOCKER: 0, MAJOR: 1, MINOR: 2 };
  F.sort((a, b) => ord[a.sev] - ord[b.sev]);
  const by = {}; F.forEach(f => by[f.sev] = (by[f.sev] || 0) + 1);
  console.log('\n=========== AUDIT RESULT ===========');
  console.log(by.BLOCKER || 0, 'blocker,', by.MAJOR || 0, 'major,', by.MINOR || 0, 'minor');
  // collapse a repeated finding to one line with a count: one bug on 34 screens is one bug
  const groups = new Map();
  for (const f of F) {
    const k = f.sev + '|' + f.kind + '|' + f.detail.replace(/\d+/g, '#').slice(0, 70);
    if (!groups.has(k)) groups.set(k, { f, n: 0, where: [] });
    const g = groups.get(k); g.n++; if (g.where.length < 4) g.where.push(f.where);
  }
  for (const { f, n, where } of groups.values())
    console.log(`  [${f.sev}] ${f.kind}${n > 1 ? ` x${n}` : ''} :: ${f.detail}`
      + `\n        ${where.join(', ')}${n > where.length ? ` +${n - where.length} more` : ''}`);
  if (!F.length) console.log('  clean');
  process.exit(by.BLOCKER ? 1 : 0);
})();
