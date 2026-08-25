/* Spelling-bee-length words must not break a card.
   Reported: "psychoneuroendocrinological" and
   "pneumonoultramicroscopicsilicovolcanoconiosis" overflowing cards and chips.
   The Learn card was `height:min(72vh,470px)` with `justify-content:center` and
   `overflow:auto` — a centred flex column overflows BOTH ends and a browser cannot scroll
   above the start of its content, so the top of the card became unreachable and the
   headword and the syllable line drew on top of each other.
   This checks COLLISION between siblings, not merely box overflow: the first probe of this
   bug reported "clean" everywhere because nothing spilled its parent — the elements were
   simply painted over one another inside it.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/long-words.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
const LONG = 'pneumonoultramicroscopicsilicovolcanoconiosis';   // 45
const MID  = 'psychoneuroendocrinological';                     // 27
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:1000,n:'desktop'},{width:390,height:844,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(3200);
    await pg.evaluate(([L, M]) => {
      const mk = w => ({ w, d: 'Relating to the field that studies the interactions among psychological processes, the nervous system, and the endocrine system and its hormones.',
        s: 'The ' + w + ' study examined how chronic stress alters hormone levels and brain function simultaneously.',
        h: 'Break it: PSYCHO + NEURO + ENDOCRINE + LOGICAL — mind, nerves, hormones, and logic.',
        sy: w.replace(/(.{4})/g, '$1.'), p: 'sy-koh-noor-oh-en-doh-krin-uh-LOJ-ih-kul', o: 'Greek', y: 5 });
      state.children = [{ name:'T', avatar:'bizzy', coins:900, pow:{}, age:9,
        lists:{default:{xp:30}}, activeList:'default', missed:[{w:L,n:2,ts:Date.now()}],
        unlockedThemes:['spellbound'], unlockedConcepts:{}, unlockedLists:{}, questPath:'journey',
        trail:{lap:1,done:{},chk:{},seen:{},elap:1,edone:{},echk:{}} }];
      state.activeIdx = 0; state.screen = 'app';
      state.sessionWords = [mk(L), mk(M), mk('cat')]; state.sessionListKey = 'default';
      state.cardIdx = 0; state.cardDone = false;
    }, [LONG, MID]);

    for (const idx of [0, 1]) {
      await pg.evaluate(i => { app.openCoach(); state.coachMode = null; state.luTab = 'learn';
        state.coachCardView = true; state.cardIdx = i; state.cardDone = false; render(); }, idx);
      await pg.waitForTimeout(800);
      const r = await pg.evaluate(() => {
        const card = document.querySelector('.coach-card');
        if (!card) return { none: true };
        const cr = card.getBoundingClientRect();
        const kids = [...card.querySelectorAll('div,span')].filter(e => !e.children.length && (e.textContent || '').trim());
        // 1. nothing may be painted above the card's own top edge (the unreachable overflow)
        const above = kids.filter(e => e.getBoundingClientRect().top < cr.top - 1)
                          .map(e => (e.textContent || '').trim().slice(0, 24));
        // 2. no two text siblings may overlap each other by more than a hair
        const boxes = kids.map(e => ({ t: (e.textContent||'').trim().slice(0,20), r: e.getBoundingClientRect() }))
                          .filter(x => x.r.width > 4 && x.r.height > 4);
        const hits = [];
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, c2 = boxes[j].r;
          const ov = Math.min(a.bottom, c2.bottom) - Math.max(a.top, c2.top);
          const oh = Math.min(a.right, c2.right) - Math.max(a.left, c2.left);
          if (ov > 3 && oh > 3) hits.push(boxes[i].t + ' ~ ' + boxes[j].t);
        }
        const head = kids.find(e => /pneumono|psychoneuro/i.test(e.textContent) && e.textContent.trim().indexOf('.') < 0);
        return { above, hits, cardH: Math.round(cr.height),
          headVisible: head ? (head.getBoundingClientRect().top >= cr.top - 1) : null,
          docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      const tag = vp.n + ' card' + (idx + 1);
      if (r.none) { errs.push(tag + ': no learn card rendered'); continue; }
      if (r.above.length) errs.push(tag + ': ' + r.above.length + ' element(s) painted above the card top (unreachable): ' + r.above.join(' | '));
      if (r.hits.length) errs.push(tag + ': overlapping text — ' + r.hits.slice(0, 3).join(' ; '));
      if (r.headVisible === false) errs.push(tag + ': the headword is clipped off the top');
      if (r.docOver > 2) errs.push(tag + ': H-OVERFLOW ' + r.docOver + 'px');
      console.log('  ' + tag.padEnd(16) + ' card ' + r.cardH + 'px, no overlap, headword visible');
    }
    // the word chips in Live progress must wrap, not spill
    const chips = await pg.evaluate(() => {
      const bad = [];
      document.querySelectorAll('*').forEach(el => { if (el.children.length) return;
        const t = (el.textContent || ''); if (!/pneumonoultra|psychoneuro/i.test(t)) return;
        const p = el.parentElement; if (!p) return;
        const er = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
        if (er.right - pr.right > 2 || pr.left - er.left > 2) bad.push(t.trim().slice(0, 22)); });
      return bad;
    });
    if (chips.length) errs.push(vp.n + ': ' + chips.length + ' long word(s) spill their chip: ' + chips.slice(0,3).join(' | '));
    // and the tray must not be ragged: a 45-letter chip should not dwarf a 3-letter one
    const tray = await pg.evaluate(() => {
      const cs = [...document.querySelectorAll('[data-act="wordCard"]')];
      if (cs.length < 3) return null;
      const ws = cs.map(e => e.getBoundingClientRect().width).sort((a, b) => a - b);
      const fs = cs.map(e => parseFloat(getComputedStyle(e).fontSize));
      return { n: cs.length, min: Math.round(ws[0]), max: Math.round(ws[ws.length - 1]),
               fmin: Math.min(...fs), fmax: Math.max(...fs) };
    });
    if (tray) {
      if (tray.max / tray.min > 6) errs.push(vp.n + ': chip widths run ' + tray.min + '-' + tray.max + 'px — the tray reads ragged');
      if (tray.fmin === tray.fmax) errs.push(vp.n + ': every chip is ' + tray.fmin + 'px — long words are not stepped down');
      console.log('  ' + vp.n.padEnd(8) + ' tray: ' + tray.n + ' chips, ' + tray.min + '-' + tray.max + 'px wide, type ' + tray.fmin + '-' + tray.fmax + 'px');
    }
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — a 45-letter word grows the card instead of breaking it, nothing overlaps, nothing is clipped off the top');
  process.exit(errs.length ? 1 : 0);
})();
