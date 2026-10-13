/* ROAD TO 4.5, P3 — THE ART ON THE SCREENS (P3.3/P3.4 My Feed by kind and the Shop's worlds, P3.5 the Journey covers,
   P3.9 a medal per group, P3.22 Home's tip and quote), in Chromium over http, on a 390 phone in light and dusk.

   feed       every card on today's feed wears a painted band that LOADS (naturalWidth), lazily, at 3:1, with no alt
              text to read out; the kinds wear different paintings; a card's band is the one its kind names (artFor)
   worlds     the Shop's Worlds tab and the Collection's world cards: eight painted plates that load, one per world, the
              world's own (app-art/wt/<id>.webp); no dot layer over a painting; a locked world is still its painting
   covers     Word Journeys: every cover a painting that loads, never grayscale, ten chapters in ten paintings
   medals     the Collection's medal shelf: every medal drawn by its OWN group (data-medal = the shelf it sits on),
              twelve different medals for the twelve live groups, metals bronze → platinum within a group
   home       the tip and quote cards carry their painted vignettes; on a phone's first screen neither picture is
              fetched at all, and scrolled to, both arrive
   Proved by breaking (13 Oct 2026, six breaks, each in a scratch root of symlinks with ONE file replaced; the tree was
   never touched; every count below is light + dusk): the feed's band override taken out of bee-feed.css (2: "3:1",
   1.50 measured); KIND_ART's usage plate misnamed (2: "loads"); the Shop tile's worldPlateImg removed (4: 0/8, and
   the locked worlds); a locked cover back to grayscale(.75) (2: 100 grey); the Collection drawing badgeArtSVG again
   (4: no group medal, no metal); the vignettes drawn with a plain lazy src (2: Chrome's own lazy threshold fetched
   both on the first screen).
   Run: node tests/p3-art-screens.cjs                                                                               */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const { booted, until, lazy } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const kid = () => ({ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 60, lists: { journey: { xp: 40 } }, activeList: 'journey',
  missed: [], unlockedThemes: ['spellbound'], fr: '2026-01-01',
  badgesSeen: { stop1: 1, stop10: 1, trap1: 1, mast10: 1, placed: 1, band3: 1, hatched: 1, quest5: 1, coll10: 1, mb1: 1, concepts5: 1, worlds4: 1, ty1: 1, tr1: 1, voc1: 1 },
  trail: { lap: 1, done: Object.fromEntries([...Array(6)].map((_, i) => ['u' + (i + 1), { 1: 90 }])), chk: {}, seen: {}, st: {} } });

(async () => {
  const srv = await serve(SRC, {});
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });
  const errs = [];
  const open = async (mode, hash) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.addInitScript((s) => { try { if (!localStorage.getItem('t_p3s')) { localStorage.clear(); localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_p3s', '1'); } } catch (e) {} },
      { theme: 'spellbound', mode, pin: '2468', activeIdx: 0, children: [kid()] });
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    const asked = []; pg.on('request', (q) => asked.push(q.url().replace(/^https?:\/\/[^/]+\//, '').replace(/\?.*$/, '')));
    await pg.goto(srv.url + 'index.html' + (hash || '')); await booted(pg);
    return { ctx, pg, asked };
  };
  /* bring each match into view in turn and wait for THAT picture to load (re-read each time: a lazy file landing redraws
     the whole app, and a picture scrolled past in the old DOM is a new, unloaded one in the next); the per-element
     result is kept in window.__loaded[sel] — [{src, w}] in document order */
  const loadAll = (pg, sel) => pg.evaluate(async (sel) => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); const out = [];
    const n = document.querySelectorAll(sel).length;
    for (let i = 0; i < n; i++) { let el = document.querySelectorAll(sel)[i]; if (!el) break; el.scrollIntoView({ block: 'center' });
      for (const t0 = Date.now(); Date.now() - t0 < 6000; await W(50)) { el = document.querySelectorAll(sel)[i]; if (!el) break; if (el.getBoundingClientRect().bottom < 0 || el.getBoundingClientRect().top > innerHeight) el.scrollIntoView({ block: 'center' }); if (el.complete && el.naturalWidth > 0) break; }
      out.push({ src: el && el.getAttribute('src'), w: el ? el.naturalWidth : 0 }); }
    (window.__loaded = window.__loaded || {})[sel] = out; scrollTo(0, 0); return out; }, sel);

  for (const mode of ['light', 'dusk']) {
    /* ---- feed ---- */
    {
      const { ctx, pg } = await open(mode, '#/feed');
      await until(pg, () => document.querySelectorAll('.bzf-card[data-id]').length >= 10, null, 40000);
      const L = await loadAll(pg, '.bzf-card .bzf-art');
      const f = await pg.evaluate(() => { const cards = [...document.querySelectorAll('.bzf-card[data-id]')];
        return cards.map((c) => { const i = c.querySelector('.bzf-art'); const r = i && i.getBoundingClientRect();
          return { kind: c.getAttribute('data-kind'), src: i && i.getAttribute('src'), w: i ? i.naturalWidth : 0, lazy: i && i.getAttribute('loading'), alt: i && i.getAttribute('alt'), ratio: r ? r.width / r.height : 0 }; }); });
      const kinds = await pg.evaluate(() => [...document.querySelectorAll('.bzf-card[data-id]')].map((c) => { try { const id = c.getAttribute('data-id'); const row = SB_FEED.pool(99, 0).find((x) => x.id === id); return row ? SB_FEED.artFor(Object.assign({}, row, (window.SB_FEED_BODY || {})[id] || {})) : null; } catch (e) { return null; } }));
      f.forEach((x, i) => { x.w = (L[i] || {}).w || 0; });
      const missing = f.filter((x) => !x.src || x.w <= 0).map((x) => x.kind + ':' + x.src);
      ok(f.length >= 10 && !missing.length, `${mode}: every one of the feed's ${f.length} cards wears a painted band that loads` + (missing.length ? ' — ' + missing.slice(0, 4).join(', ') : ''));
      ok(f.every((x) => x.lazy === 'lazy' && x.alt === '' && Math.abs(x.ratio - 3) < 0.08), `${mode}: each band is lazy, silent to a screen reader (alt="") and a 3:1 band (${f.map((x) => x.ratio.toFixed(2)).slice(0, 3).join(', ')}…)`);
      const distinct = new Set(f.map((x) => x.src)).size, kindsN = new Set(f.map((x) => x.kind)).size;
      ok(distinct >= Math.min(4, kindsN), `${mode}: the kinds wear different paintings (${kindsN} kinds, ${distinct} paintings)`);
      const off = f.filter((x, i) => kinds[i] && kinds[i] !== x.src).map((x) => x.kind);
      ok(!off.length, `${mode}: each card wears the art its kind names (artFor)` + (off.length ? ' — ' + off.join(', ') : ''));
      await ctx.close();
    }
    /* ---- worlds: the Shop and the Collection ---- */
    {
      const { ctx, pg } = await open(mode, '#/shop/worlds');
      await until(pg, () => document.querySelectorAll('.bz-wcard').length >= 8, null, 30000);
      const LS = await loadAll(pg, '.bz-wcard img.wh-plate');
      const s = await pg.evaluate(() => [...document.querySelectorAll('.bz-wcard')].map((c) => { const i = c.querySelector('img.wh-plate'); return { id: c.getAttribute('data-world'), src: i && i.getAttribute('src'), w: 0, locked: c.classList.contains('locked') }; }));
      s.forEach((x, i) => { x.w = (LS[i] || {}).w || 0; });
      ok(s.length === 8 && s.every((x) => x.src === 'app-art/wt/' + x.id + '.webp' && x.w === 480), `${mode}: the Shop's eight worlds are their own paintings, loaded (${s.filter((x) => x.w).length}/8)`);
      ok(s.some((x) => x.locked) && s.filter((x) => x.locked).every((x) => x.w > 0), `${mode}: a locked world is still its painting (${s.filter((x) => x.locked).length} locked)`);
      await pg.evaluate(() => { state.collTab = 'worlds'; app.setNav('collection'); });
      await until(pg, () => document.querySelectorAll('.wh-band').length >= 8, null, 20000);
      const LC = await loadAll(pg, '.wh-band img.wh-plate');
      const c = await pg.evaluate(() => ({ fx: document.querySelectorAll('.wh-painted .wh-fx').length }));
      c.n = LC.filter((x) => x.w > 0 && /^app-art\/wt\/[a-z]+\.webp$/.test(x.src)).length;
      ok(c.n === 8 && !c.fx, `${mode}: the Collection's eight world cards are painted (${c.n}), with no dot layer over a painting (${c.fx})`);
      await ctx.close();
    }
    /* ---- covers ---- */
    {
      const { ctx, pg } = await open(mode);
      await lazy(pg, 'scrLib'); await lazy(pg, 'lessons');
      await pg.evaluate(() => app.openJourneys());
      await until(pg, () => document.querySelectorAll('.sb-jcover').length >= 50, null, 30000);
      const LJ = await loadAll(pg, '.sb-jcover img');
      const j = await pg.evaluate(() => { const cv = [...document.querySelectorAll('.sb-jcover')];
        return { n: cv.length,
          grey: cv.filter((c) => /grayscale/.test(getComputedStyle(c).filter + ' ' + (c.querySelector('img') ? getComputedStyle(c.querySelector('img')).filter : ''))).length,
          arts: [...new Set(cv.map((c) => c.getAttribute('data-unit-art')))].length }; });
      j.loaded = LJ.filter((x) => x.w > 0).length;
      ok(j.n >= 50 && j.loaded === j.n && !j.grey && j.arts === 10, `${mode}: ${j.n} Journey covers, every one a painting that loads (${j.loaded}), none grey (${j.grey}), ten chapters in ${j.arts} paintings`);
      await ctx.close();
    }
    /* ---- medals ---- */
    {
      const { ctx, pg } = await open(mode);
      await pg.evaluate(() => { state.collTab = 'badges'; app.setNav('collection'); });
      await until(pg, () => document.querySelectorAll('[data-medal]').length >= 60, null, 20000);
      const m = await pg.evaluate(() => { const out = { wrong: [], groups: new Set(), metals: {} };
        for (const sec of document.querySelectorAll('.sb-card')) { const t = sec.querySelector('.sb-ct'); if (!t) continue; const g = t.textContent.trim();
          for (const s of sec.querySelectorAll('[data-medal]')) { out.groups.add(s.getAttribute('data-medal')); if (s.getAttribute('data-medal') !== g) out.wrong.push(g + '≠' + s.getAttribute('data-medal'));
            (out.metals[g] = out.metals[g] || []).push(s.getAttribute('data-metal')); } }
        return { wrong: out.wrong, groups: [...out.groups], metals: out.metals }; });
      ok(m.groups.length === 12 && !m.wrong.length, `${mode}: every medal is drawn by its own group's medal — ${m.groups.length} different medals` + (m.wrong.length ? ' — ' + m.wrong.slice(0, 3).join(', ') : ''));
      const at = m.metals.Atlas || [];
      ok(at.join() === 'bronze,silver,gold,platinum', `${mode}: within a group the metal climbs (Atlas: ${at.join(' → ')})`);
      await ctx.close();
    }
    /* ---- home ---- */
    {
      const { ctx, pg, asked } = await open(mode);
      await until(pg, () => document.querySelectorAll('img[data-lsrc^="app-art/home/"]').length === 2, null, 20000);
      await pg.waitForTimeout(1500);
      const early = asked.filter((u) => /^app-art\/home\//.test(u));
      ok(!early.length, `${mode}: on a phone's first screen neither vignette is fetched (${early.join(', ') || 'none'})`);
      const v = await loadAll(pg, '.sb-vign img');
      ok(v.length === 2 && v.every((x) => /^app-art\/home\/(tip|quote)\.webp$/.test(x.src) && x.w === 128), `${mode}: scrolled to, the tip and the quote show their paintings (${v.map((x) => x.src).join(', ')})`);
      await ctx.close();
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nthe feed, the worlds, the covers, the medals and Home wear their art');
  process.exit(fails ? 1 : 0);
})();
