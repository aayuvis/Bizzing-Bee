/* THE FIVE SURPRISE STOPS — the case runner in the browser (The Bee Circuit, BEE-CIRCUIT.md §7, §13, §14 step 6;
   circuit-cases.js over circuit-cases-data.js).

   What it holds, case by case, with real keys, clicks and taps:
     1. THE CAREFUL BOT SOLVES EACH OF THE FIVE: every item answered first time (every rival asked first, except Ines,
        whose answer IS the answer), the escalation halfway, a WRONG accusation first — the script's "Not quite. Look
        again." on screen, the wrong choice struck, the right clue glowing, and that clue already shown earlier in the
        case (the scene's tap or the escalation) — then the right one, the staged reveal, every secret by its end, the
        last chill, Done: the case is solved with its team photo, dismissed, and the wallet moved by exactly one coin per
        item (the finish counts for nothing). Never the answer before it is answered or shown: before every answer the
        item's answer (and every later one) is in no text node and no attribute of the case or the live region, and
        no option or choice differs from its neighbours by anything but its number. No text input, ever. The suspect
        cards carry their tells; no secret shows before the reveal. Case 2's Mira gives the authored Greek (masked where
        it spells the word, never Latin, French or English); Case 3 offers no Ask Kwame and no excluded language.
     2. THE RANDOM BOT earns 0 coins in all five (it types letters, taps options, tokens and choices at random) and
        every case still resolves.
     3. THE BOT THAT IS ALWAYS WRONG still solves all five: on each item two holds that never show the answer and open
        the next rival's hint, then the app's own miss card WITH the answer; each miss HOLDS (1.2 s later the same item,
        nothing moved on); every item ends shown; two wrong accusations leave the right one glowing and alone; 0 coins.
     4. KEYBOARD ONLY (cases 5 and 3): digits, letters, Enter and Tab — a rival's hint reached by Tab and opened by Enter.
     5. TOUCH ONLY at 390×844 (cases 2 and 4): taps only, letters on the kit's keys; on every screen each control is a
        44px target inside the width, the page never scrolls sideways, and no control carries an emoji.
     6. THE PIN on the region board: shown only once the core holds the case's record (its trigger round's mail is in —
        a hall done before its mail puts up nothing, and a case with no record opens nothing even asked for by name),
        a 44px button BETWEEN two ordinary stops (the
        child's stop and the one before), stops untouched (it gates nothing); a click and Enter open the case at
        #/case/c1; Back and Esc take it away; solved and dismissed it is gone, solved but not dismissed it stays; under
        Reduce motion nothing on it moves.
     7. LATE AND SAFE: Case 3 opened late (the core's caseLate) says its lateLine first, then its safeLine, both before the
        impossible; on time — even with the next round's hall done before its mail — the safeLine is first. A six-year-old's Case 2 shows Dax's tell. Ask Ines tells (the item is then right but not
        first-time); Ask Suki adds 30 s to the clock; a hold stops the clock.
     8. NO SECOND PAY: three items answered and the fourth missed, the case left and reopened — it carries on at the fourth,
        which is right but not first-time when it comes back, and the whole case pays eleven: no item twice.

   THE CORE (window.SB_CIRCUIT, circuit.js) is used when it is on the page after SB_LAZY.need('circuit'); without it a
   STUB keeps the core's contract (circuit/BUILD-core.md): caseState null until the trigger round's mail is in,
   caseUpdate merging into c.circuit.cases[id] (a solved case stays solved), caseLate = the next round's story mail is
   in, boardExtras(act) → SB_CIRCUIT_CASES.pins(act). Each child is seeded as the core leaves a season after those
   rounds: the halls, each round's story mail (its cliff), and the 'unseen' record of every case those rounds trigger.
   The pin section injects pins() on every render of the board (as boardExtras will once trail.js draws it).
   Scope of the leak scan: the case overlay and the live region (#root under it is Home or the board, whose word of the
   hour and stop titles are not the case's and are covered).

   ONLY=<a,b> runs only the named sections (careful, random, wrong, keyboard, touch, pin, late, resume).
   Proved by breaking (15 Oct 2026; each a scratch root of symlinks with ONE file — circuit-cases.js — replaced,
   SB_ROOT=<scratch>, the tree never touched; every one watched to fail):
     · picks paid at once (no above-chance gate) → random: c3 and c4 earn 2 each (the bot's lucky first-time picks);
     · the answer in an attribute of the typed box, no glow on a wrong accusation, secrets on the suspect cards →
       careful: the leak (knife in div[data-w], …), "the right clue glows ()", the tells and "no secret before the
       reveal" fail in every case;
     · a miss that resolves and moves on → wrong: 0 holds, no item ends shown, in all five;
     · the third miss never showing the answer → wrong: "item 1 has held 5 times and never shown its answer", all five;
     · no lateLine, the safeLine after the impossible, a hold that does not stop the clock, Suki adding nothing → late:
       4 fail (both orders, 59.9 → 59.9, 59.76 → 58.38);
     · a 40px pin, a pin ON a stop instead of between two → pin: 2 fail;
     · no on-screen keys on a phone → touch: 2 fail ("item 1 has none");
     · the tried mark not kept across leaving → resume: the missed item comes back first-time (1) and pays 12, not 11;
     · open() not asking whether the case is available → pin: 2 fail (Case 2 opens by name and so writes a record, which
       then puts up its pin);
     · availability read from the trigger hall, not the core's record → pin: 1 fails (a pin before the mail);
     · lateness read from the next hall, not the core's caseLate → late: 1 fails (the lateLine on time).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-cases.cjs                                          */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const Wt = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
const CHROME = process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = n => !ONLY || ONLY.indexOf(n) >= 0;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return !!b; };

/* the case data, as the page gets it */
const D = (() => { const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, 'circuit-cases-data.js'), 'utf8'), ctx); return ctx.window.SB_CIRCUIT_CASES_DATA; })();
const K = id => D.cases.find(c => c.id === id);
const SCRIPT = JSON.parse(fs.readFileSync(path.join(ROOT, 'circuit', 'script.json'), 'utf8'));
const EXCLUDE = (SCRIPT.build.find(x => x.id === 'case-origins-authored') || {}).choicesExclude || {};
const ALL = ['meadow', 'library', 'forum', 'storm', 'roots', 'strait', 'junkyard', 'sprints', 'stage'];
const hallsOf = acts => Object.fromEntries(acts.map(a => [a, { done: 1, best: 1, last: 1 }]));
/* a season as the core leaves it after these rounds' halls: each round's story mail in (its cliff, read) and, for every
   case whose trigger round that is, the record the core makes then ({state:'unseen', hints:0}) */
const RIX = a => SCRIPT.rounds.findIndex(r => r.act === a);
const mailOf = acts => acts.map(a => ({ key: 'rounds[' + RIX(a) + '].pieces.cliff', at: 1, read: true }));
const casesOf = acts => Object.fromEntries(SCRIPT.cases.filter(c => acts.indexOf((SCRIPT.rounds[c.after - 1] || {}).act) >= 0).map(c => [c.id, { state: 'unseen', hints: 0 }]));
const kidWith = (acts, age) => ({ name: 'Ahana', age: age || 9, ageBand: age && age < 8 ? '5-7' : '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey',
  circuit: { v: 1, season: 1, halls: hallsOf(acts), cases: casesOf(acts), mail: mailOf(acts), board: { suspects: { vesper: [], pronouncer: [], ratchet: [], dax: [], vale: [] }, accused: null }, dax: { helped: null }, closing: null } });
const seed = k => { if (location.href.indexOf('storage-probe') >= 0) return; if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } };

async function page(b, kid, o) {
  o = o || {};
  const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 800 } }, o.ctx || {}));
  await ctx.addInitScript(seed, kid);
  const pg = await ctx.newPage(); pg._errs = []; pg.on('pageerror', e => pg._errs.push(e.message));
  await pg.goto(URL + (o.hash || ''));
  await Wt.booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['circuitCases', 'arcade', 'words1'], r)));
  pg._core = await pg.evaluate(() => new Promise(r => SB_LAZY.need('circuit', () => {
    try { state.sound = false; window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, addEventListener() {} }; }; speechSynthesis.speak = () => {}; } catch (e) {}
    try { if (window.SB_VOL && SB_VOL.setMusic) SB_VOL.setMusic(false); } catch (e) {}
    if (window.SB_CIRCUIT && SB_CIRCUIT.caseUpdate) return r('real core');
    /* the core's contract (circuit/BUILD-core.md): caseState is null until the case's trigger round's mail is in;
       caseUpdate merges (a solved case stays solved); caseLate is "the next round's story mail is in" */
    const D = () => SB_CIRCUIT_CASES_DATA, has = (o, k) => o.mail.some(m => m && m.key === k);
    window.SB_CIRCUIT = { _stub: 1,
      state(c) { return c.circuit || (c.circuit = { v: 1, season: 1, halls: {}, cases: {}, mail: [], board: { suspects: {}, accused: null }, dax: { helped: null }, closing: null }); },
      caseState(c, id) { return this.state(c).cases[id] || null; },
      caseUpdate(c, id, p) { if (!D().cases.some(k => k.id === id)) return null; const s = this.state(c).cases, cur = s[id] || (s[id] = { state: 'unseen', hints: 0 }), was = cur.state;
        Object.assign(cur, p); if (was === 'solved') cur.state = 'solved'; try { save(); } catch (e) {} return cur; },
      caseLate(c, id) { const k = D().cases.find(x => x.id === id); return !!k && has(this.state(c), 'rounds[' + k.after + '].pieces.cliff'); },
      open() {}, boardExtras(act) { return SB_CIRCUIT_CASES.pins(act); } };
    r('stub core'); })));
  return { ctx, pg };
}
const peek = pg => pg.evaluate(() => SB_CIRCUIT_CASES.peek());
const until = (pg, fn, arg, ms) => Wt.until(pg, fn, arg, ms || 15000);
async function openCase(pg, id) { await pg.evaluate(id => SB_CIRCUIT_CASES.open(id), id); return until(pg, id => { const p = SB_CIRCUIT_CASES.peek(); return !!p && p.id === id && !!document.querySelector('.cc-play .sb-stage'); }, id); }
const stepIs = (pg, s) => until(pg, s => { const p = SB_CIRCUIT_CASES.peek(); return !!p && p.step === s && !document.querySelector('.cc-hold'); }, s);
const caseRec = (pg, id) => pg.evaluate(id => JSON.parse(JSON.stringify(SB_CIRCUIT.caseState(active(), id))), id);

/* in the page: every whole-word hit of each word in the case's text nodes and attributes, and the live region */
function hitsOf(words) {
  const scope = [document.querySelector('.cc-play'), document.getElementById('sb-live')].filter(Boolean), out = [];
  for (const w of words) { const re = new RegExp('(^|[^a-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z])', 'i');
    for (const root of scope) { const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let n = tw.currentNode; n; n = tw.nextNode()) {
        if (n.nodeType === 3) { if (re.test(n.nodeValue)) out.push(w + ' in text "' + n.nodeValue.trim().slice(0, 50) + '"'); continue; }
        if (n.tagName === 'STYLE' || n.tagName === 'SCRIPT') continue;
        for (const a of n.attributes) if (re.test(a.value)) out.push(w + ' in ' + n.tagName.toLowerCase() + '[' + a.name + ']'); } } }
  return out;
}
/* in the page: options / choices that differ from each other by anything but their number and words */
function marked(sel) { const bs = [...document.querySelectorAll(sel)];
  const sig = b => [...b.attributes].filter(a => a.name !== 'data-arg').map(a => a.name + '=' + a.value).sort().join('|');
  return bs.length > 1 && bs.some(b => sig(b) !== sig(bs[0])) ? bs.map(sig) : null; }
const noInput = pg => pg.evaluate(() => document.querySelectorAll('.cc-play input,.cc-play textarea,.cc-play [contenteditable]').length);
const overlayText = pg => pg.evaluate(() => (document.querySelector('.cc-play') || {}).textContent || '');
function laterTyped(id, i, res) { const its = K(id).puzzle.items; const out = [];
  its.forEach((x, j) => { if (j < i || (res && res[j])) return; const typed = x.k === 'fix' || x.k === 'spell' || x.k === 'build' || (x.k === 'stmt' && !x.ok);
    if (typed && !x.both) out.push(...x.ans); }); return out; }
const secretsOf = id => K(id).suspects.map(s => s.secret);

/* one key / click helper per input style */
const click = (pg, sel) => pg.click(sel);
async function holdGo(pg, how) { await pg.waitForTimeout(300); if (how === 'key') await pg.keyboard.press('Enter'); else if (how === 'tap') await pg.locator('[data-cc="holdgo"]').tap(); else await click(pg, '[data-cc="holdgo"]');
  return until(pg, () => !document.querySelector('.cc-hold')); }
async function missGo(pg, how) { await pg.waitForTimeout(300); if (how === 'key') await pg.keyboard.press('Enter'); else if (how === 'tap') await pg.locator('.sg-miss-go').tap(); else await click(pg, '.sg-miss-go');
  return until(pg, () => !(window.SGUI && SGUI.held)); }

/* ============================================================== 1. the careful bot */
async function careful(pg, id, o) {
  o = o || {}; const k = K(id); const note = {};
  const m0 = await coins.mark(pg);
  if (!await openCase(pg, id)) return ok(false, id + ': the case opens');
  ok(await pg.evaluate(id => { const el = document.querySelector('.cc-play'); return el && el.getAttribute('data-route') === 'case/' + id && location.hash === '#/case/' + id; }, id), `${id}: the case has an address (#/case/${id}) while it is up`);
  const leakSecrets = async (where) => { const t = await overlayText(pg); return secretsOf(id).filter(s => t.indexOf(s) >= 0).map(s => where + ': "' + s.slice(0, 40) + '"'); };
  const early = [];
  early.push(...await leakSecrets('cold open'));
  await click(pg, '[data-cc="next"]'); await stepIs(pg, 'scene');
  for (let i = 0; i < 3; i++) await click(pg, `[data-cc="look"][data-arg="${i}"]`);
  const sceneText = await overlayText(pg);
  note.tapsShown = k.taps.every(t => sceneText.indexOf(t) >= 0);
  ok(note.tapsShown, `${id}: the scene shows all three taps in full once looked at (one of them the planted clue)`);
  const tells = k.suspects.filter(s => D.cast[s.who] && D.cast[s.who].tell);
  const tellOk = await pg.evaluate(ts => ts.every(([w, t]) => { const el = document.querySelector('.cc-play [data-who="' + w + '"]'); return el && el.textContent.indexOf(t) >= 0; }), tells.map(s => [s.who, D.cast[s.who].tell]));
  ok(tellOk, `${id}: every suspect card the cast gives a tell shows it (${tells.map(s => D.cast[s.who].name).join(', ')})`);
  early.push(...await leakSecrets('scene'));
  await click(pg, '[data-cc="next"]'); await stepIs(pg, 'brief');
  await click(pg, '[data-cc="next"]');
  const leaks = [], marks = [], inputs = [], mira = [], escSeen = [];
  let guard = 0, kwame = 0, excl = [];
  for (;;) {
    if (++guard > 80) { ok(false, id + ': the puzzle ends'); break; }
    await until(pg, () => { const p = SB_CIRCUIT_CASES.peek(); return p && (p.step === 'item' || p.step === 'esc' || p.step === 'accuse'); });
    let p = await peek(pg);
    if (p.step === 'accuse') break;
    if (p.step === 'esc') { const t = await overlayText(pg); escSeen.push(t.indexOf(k.escalation) >= 0); early.push(...await leakSecrets('escalation')); await click(pg, '[data-cc="next"]'); continue; }
    if (p.after) { await click(pg, '[data-cc="next"]'); continue; }
    /* every rival but Ines, before answering */
    for (let h = 0; h < 8; h++) {
      const rv = await pg.evaluate(() => { const b = [...document.querySelectorAll('.cc-play [data-cc="hint"]:not([disabled])')].find(x => x.dataset.arg !== 'melody' && !document.querySelector('.cc-play .cc-said-h[data-rival="' + x.dataset.arg + '"]')); return b ? b.dataset.arg : null; });
      if (!rv) break; await click(pg, `[data-cc="hint"][data-arg="${rv}"]`);
    }
    kwame += await pg.evaluate(() => [...document.querySelectorAll('.cc-play [data-cc="hint"]')].filter(b => b.dataset.arg === 'samurai').length);
    const x = k.puzzle.items[p.i];
    if (id === 'c2') { const t = await pg.evaluate(() => { const e = document.querySelector('.cc-play .cc-said-h[data-rival="astro"]'); return e ? e.textContent.replace(/^Mira\s*/, '').trim() : null; });
      /* a mask is the app's own (maskTxt's _____ or the Chair's ▁▁▁): compared as one mark */
      const M = v => String(v || '').replace(/_{3,}|▁+/g, '#'), exp = M(x.greek.replace(new RegExp(x.ans[0] + '[a-z]*', 'ig'), '#'));
      mira.push(M(t) === exp && !/\b(Latin|French|English)\b/.test(t) ? '' : `${x.ans[0]}: "${t}" (expected "${exp}")`); }
    if (id === 'c3') excl.push(...p.opts.filter(l => (EXCLUDE[x.shown] || []).indexOf(l) >= 0).map(l => x.shown + ':' + l));
    const words = laterTyped(id, p.i, p.res);
    leaks.push(...(await pg.evaluate(hitsOf, words)).map(s => `item ${p.i + 1}: ${s}`));
    const mk = await pg.evaluate(marked, '.cc-play [data-cc="pick"]'); if (mk) marks.push(`item ${p.i + 1}`);
    if (await noInput(pg)) inputs.push(p.i);
    /* answer, first time */
    if (p.opts) await click(pg, `[data-cc="pick"][data-arg="${p.opts.indexOf(p.ans[0])}"]`);
    else if (p.kind === 'stmt' && p.ok) await click(pg, '[data-cc="fine"]');
    else {
      if (p.kind === 'stmt') { await click(pg, `[data-cc="tok"][data-arg="${p.toks.map(t => t.toLowerCase()).indexOf(p.word.toLowerCase())}"]`); await until(pg, () => SB_CIRCUIT_CASES.peek().phase === 'type');
        leaks.push(...(await pg.evaluate(hitsOf, p.ans)).map(s => `item ${p.i + 1} (typing): ${s}`)); }
      await pg.keyboard.type(p.ans[0]); await pg.keyboard.press('Enter');
    }
    if (!await until(pg, i => { const q = SB_CIRCUIT_CASES.peek(); return q.after && q.i === i; }, p.i)) { ok(false, `${id}: item ${p.i + 1} took its right answer (${JSON.stringify(await peek(pg)).slice(0, 160)})`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return false; }
    p = await peek(pg); if (p.res[p.i] !== 1) leaks.push(`item ${p.i + 1} not right first time (${p.res[p.i]})`);
  }
  ok(!leaks.length, `${id}: never the answer before it is answered — no item's answer (nor a later one) in any text or attribute, with every rival asked${leaks.length ? ' — ' + leaks.slice(0, 4).join(' · ') : ''}`);
  if (k.puzzle.items.some(x => x.opts)) ok(!marks.length, `${id}: no option differs from its neighbours but by its number and words${marks.length ? ' — ' + marks.join(', ') : ''}`);
  ok(!inputs.length, `${id}: no text input on any item`);
  ok(escSeen.length === 1 && escSeen[0], `${id}: the escalation card comes once, halfway, with the script's line`);
  if (id === 'c2') ok(mira.length === 10 && mira.every(s => !s), `c2: Ask Mira gives each item's authored Greek (masked only where it spells the word) and never Latin, French or English${mira.filter(Boolean).length ? ' — ' + mira.filter(Boolean).join(' · ') : ''}`);
  if (id === 'c3') { ok(kwame === 0, 'c3: no Ask Kwame anywhere in the case (he is the one who is missing)'); ok(!excl.length, 'c3: no item offers a language the build rule excludes' + (excl.length ? ' — ' + excl.join(', ') : '')); }
  /* the accusation: a wrong pick first */
  const mkc = await pg.evaluate(marked, '.cc-play [data-cc="accuse"]');
  ok(!mkc, `${id}: the three accusations differ by nothing but their words`);
  early.push(...await leakSecrets('accusation'));
  const wrong = (k.accusation.right + 1) % 3;
  await click(pg, `[data-cc="accuse"][data-arg="${wrong}"]`);
  await until(pg, () => SB_CIRCUIT_CASES.peek().wrong.length === 1);
  const acc = await pg.evaluate(() => ({ head: (document.querySelector('.cc-acc-h') || {}).textContent || '', live: (document.getElementById('sb-live') || {}).textContent || '',
    glow: [...document.querySelectorAll('.cc-play .cc-glow')].map(e => e.getAttribute('data-clue') || ((e.querySelector('[data-clue]') || {}).getAttribute ? e.querySelector('[data-clue]').getAttribute('data-clue') : '')),
    struck: [...document.querySelectorAll('.cc-play [data-cc="accuse"][disabled]')].map(b => +b.dataset.arg) }));
  ok(acc.head === k.accusation.lookAgain && acc.live.indexOf(k.accusation.lookAgain) >= 0, `${id}: a wrong accusation says "${k.accusation.lookAgain}" (on screen and in the live region)`);
  ok(k.glow.every(g => acc.glow.indexOf(g) >= 0) && acc.struck.length === 1 && acc.struck[0] === wrong, `${id}: the right clue glows (${acc.glow.join(', ')}) and the wrong choice is struck`);
  const plantedEarlier = k.glow.filter(g => /^tap|^esc/.test(g)).every(g => g === 'esc' ? escSeen[0] : note.tapsShown);
  ok(plantedEarlier && (await peek(pg)).log.indexOf('scene') < (await peek(pg)).log.indexOf('accuse'), `${id}: the glowing clue was on screen earlier in the case than the accusation`);
  ok(!early.length, `${id}: no suspect's secret is on screen before the reveal${early.length ? ' — ' + early.join(' · ') : ''}`);
  await click(pg, `[data-cc="accuse"][data-arg="${k.accusation.right}"]`);
  await stepIs(pg, 'reveal');
  let rt = '';
  for (let g = 0; g < 20; g++) { const q = await peek(pg); if (q.step !== 'reveal') break; rt += await overlayText(pg); await click(pg, '[data-cc="next"]'); await pg.waitForTimeout(60); }
  ok(k.reveal.every(l => rt.indexOf(l) >= 0) && secretsOf(id).every(s => rt.indexOf(s) >= 0), `${id}: the staged reveal shows every line, then every suspect's secret`);
  await stepIs(pg, 'chill');
  ok((await overlayText(pg)).indexOf(k.lastChill) >= 0, `${id}: the last chill`);
  const mid = await caseRec(pg, id);
  ok(mid.state === 'solved' && mid.sticker === 'team' && !mid.dismissed, `${id}: solved on the right accusation, with the team photo for the Hive Post (state ${mid.state}, sticker ${mid.sticker})`);
  const hud = await pg.evaluate(() => +((document.querySelector('[data-cc-coins]') || {}).textContent || NaN));
  await click(pg, '[data-cc="done"]');
  await until(pg, () => !document.querySelector('.cc-play'));
  const r = await coins.since(pg, m0), rec = await caseRec(pg, id);
  ok(rec.dismissed === true, `${id}: Done dismisses it (the pin goes)`);
  const n = k.puzzle.items.length;
  ok(r.earned === n && r.balance === n && r.events.every(e => /answer/.test(e)) && hud === n, `${id}: one coin per first-time answer and nothing for finishing — ${r.earned} for ${n} items (ledger ${r.events.length} answer events, wallet +${r.balance}, the case's own count ${hud})`);
  return true;
}

/* ============================================================== 2/3. the random bot and the bot that is always wrong */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
async function bot(pg, id, mode, R) {
  const k = K(id); const m0 = await coins.mark(pg); const notes = { holds: 0, holdHints: 0, held: [], shownAns: [], leaks: [], steady: [] };
  if (!await openCase(pg, id)) return ok(false, id + ': the case opens');
  await click(pg, '[data-cc="next"]'); await stepIs(pg, 'scene');
  for (let i = 0; i < 3; i++) await click(pg, `[data-cc="look"][data-arg="${i}"]`);
  await click(pg, '[data-cc="next"]'); await stepIs(pg, 'brief'); await click(pg, '[data-cc="next"]');
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let guard = 0;
  for (;;) {
    if (++guard > 400) { ok(false, `${id} (${mode}): the puzzle ends`); break; }
    let p = await peek(pg);
    if (p.step === 'accuse') break;
    if (p.step === 'esc') { await click(pg, '[data-cc="next"]'); continue; }
    if (p.held) {   /* the app's own miss card: the answer, shown */
      if (mode === 'wrong') { const t = await pg.evaluate(() => { const c = [...document.querySelectorAll('.cc-play .sg-misscard')].find(x => !x.closest('.cc-hold')); return c ? c.textContent.replace(/\s+/g, '') : ''; });
        const a = p.kind === 'stmt' && p.ok ? 'Allspelledright' : p.ans[0].replace(/\s+/g, ''); if (t.toLowerCase().indexOf(a.toLowerCase()) < 0) notes.shownAns.push(`item ${p.i + 1}`);
        await pg.waitForTimeout(1000); const q = await peek(pg); if (!(q.held && q.i === p.i && q.step === 'item')) notes.held.push(`item ${p.i + 1} (answer card)`); }
      await missGo(pg); continue; }
    if (p.hold) {
      notes.holds++; notes.per = notes.per || {}; notes.per[p.i] = (notes.per[p.i] || 0) + 1;
      if (notes.per[p.i] > 4) { ok(false, `${id} (${mode}): item ${p.i + 1} has held ${notes.per[p.i]} times and never shown its answer — hints must escalate to the answer (L6)`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return false; }
      if (mode === 'wrong') {
        if (await pg.evaluate(() => !!document.querySelector('.cc-hold [data-rival]'))) notes.holdHints++;
        const typed = p.kind === 'fix' || p.kind === 'spell' || p.kind === 'build' || (p.kind === 'stmt' && !p.ok);
        if (typed && !(K(id).puzzle.items[p.i].both)) notes.leaks.push(...(await pg.evaluate(hitsOf, p.ans)).map(s => `item ${p.i + 1} on hold: ${s}`));
        await pg.waitForTimeout(1200); const q = await peek(pg); if (!(q.hold && q.i === p.i && q.step === 'item' && !q.after)) notes.held.push(`item ${p.i + 1}`);
      }
      await holdGo(pg); continue; }
    if (p.after) { if (mode === 'wrong' && p.res[p.i] !== 3) notes.steady.push(`item ${p.i + 1} ended ${p.res[p.i]}`); await click(pg, '[data-cc="next"]'); continue; }
    /* one answer */
    if (p.opts) { let j = Math.floor(R() * p.opts.length); if (mode === 'wrong') j = p.opts.findIndex(o => p.ans.indexOf(o) < 0); await click(pg, `[data-cc="pick"][data-arg="${j}"]`); }
    else if (p.kind === 'stmt' && p.phase !== 'type') {
      const n = p.toks.length; let j = Math.floor(R() * (n + 1));
      if (mode === 'wrong') j = p.ok ? 0 : n;   /* a token on a true line, "All spelled right" on an untrue one */
      if (j === n) await click(pg, '[data-cc="fine"]'); else await click(pg, `[data-cc="tok"][data-arg="${j}"]`);
    } else {
      let w = ''; const L = 4 + Math.floor(R() * 6); for (let q = 0; q < L; q++) w += letters[Math.floor(R() * 26)];
      if (mode === 'wrong') w = 'qzxqz';
      await pg.keyboard.type(w); await pg.keyboard.press('Enter');
    }
    await until(pg, i => { const q = SB_CIRCUIT_CASES.peek(); return q.step !== 'item' || q.i !== i || q.after || q.hold || q.held || q.phase === 'type'; }, p.i);
  }
  /* the accusation */
  for (let g = 0; g < 4; g++) {
    const p = await peek(pg); if (p.step !== 'accuse') break;
    const open = await pg.evaluate(() => [...document.querySelectorAll('.cc-play [data-cc="accuse"]:not([disabled])')].map(b => +b.dataset.arg));
    if (mode === 'wrong' && p.wrong.length === 2) {
      const glowRight = await pg.evaluate(r => !!document.querySelector('.cc-play [data-cc="accuse"][data-arg="' + r + '"].cc-glow'), p.right);
      ok(open.length === 1 && open[0] === p.right && glowRight, `${id}: after two wrong accusations the right one is the only one left, and it is shown glowing`);
    }
    let j = open[Math.floor(R() * open.length)]; if (mode === 'wrong') j = open.find(x => x !== p.right); if (j == null) j = p.right;
    await click(pg, `[data-cc="accuse"][data-arg="${j}"]`); await pg.waitForTimeout(80);
  }
  await stepIs(pg, 'reveal');
  for (let g = 0; g < 20; g++) { const q = await peek(pg); if (q.step !== 'reveal') break; await click(pg, '[data-cc="next"]'); await pg.waitForTimeout(40); }
  await stepIs(pg, 'chill'); const resAll = (await peek(pg)).res;
  await click(pg, '[data-cc="done"]'); await until(pg, () => !document.querySelector('.cc-play'));
  const r = await coins.since(pg, m0), rec = await caseRec(pg, id);
  ok(rec.state === 'solved', `${id} (${mode}): the case resolves`);
  ok(r.earned === 0 && r.balance === 0, `${id} (${mode}): earns 0 coins (${r.earned}; first-time rights by luck: ${Object.values(resAll).filter(v => v === 1).length})`);
  if (mode === 'wrong') {
    const n = k.puzzle.items.length;
    ok(Object.keys(resAll).length === n && Object.values(resAll).every(v => v === 3) && !notes.steady.length, `${id}: every item ends with its answer shown after three misses (${Object.values(resAll).filter(v => v === 3).length}/${n})`);
    ok(notes.holds === 2 * n && !notes.held.length, `${id}: every miss HOLDS — two holds an item before the answer (${notes.holds}), and 1 s later each is still the same item, nothing moved on${notes.held.length ? ' — ' + notes.held.slice(0, 3).join(', ') : ''}`);
    ok(!notes.shownAns.length, `${id}: the third miss shows the answer on the app's own miss card${notes.shownAns.length ? ' — missing on ' + notes.shownAns.join(', ') : ''}`);
    ok(!notes.leaks.length, `${id}: a hold never shows the answer${notes.leaks.length ? ' — ' + notes.leaks.slice(0, 3).join(' · ') : ''}`);
    ok(notes.holdHints === notes.holds, `${id}: the holds escalate — each of the ${notes.holds} opened the next rival's hint (${notes.holdHints})`);
  }
  return true;
}

/* ============================================================== 5. a phone, touch only: what each screen must hold */
async function fit(pg, where, bad) {
  const r = await pg.evaluate(() => {
    const out = []; const ov = document.querySelector('.cc-play'); if (!ov) return { out: ['no overlay'] };
    const o = ov.getBoundingClientRect(); if (Math.round(o.width) !== innerWidth || Math.round(o.height) !== innerHeight) out.push('overlay ' + o.width + '×' + o.height);
    if (document.documentElement.scrollWidth > innerWidth) out.push('page ' + document.documentElement.scrollWidth + 'px wide');
    const EMO = /\p{Extended_Pictographic}/u;
    for (const b of ov.querySelectorAll('button')) { const r = b.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(b).visibility === 'hidden') continue;
      const name = (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 24);
      if (r.width < 43.5 || r.height < 43.5) out.push(name + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
      if (r.left < -0.5 || r.right > innerWidth + 0.5) out.push(name + ' off the side');
      if (b.closest('.sg-st-ctl,.cc-top') && (r.top < -0.5 || r.bottom > innerHeight + 0.5)) out.push(name + ' below the screen');
      if (EMO.test(b.textContent.replace(/[©®™]/g, ''))) out.push(name + ' carries an emoji'); }
    for (const h of ov.querySelectorAll('.cc-ask,.cc-chip,.arc-play-name,.cc-lbl,.sg-miss-h')) if (EMO.test(h.textContent.replace(/[©®™]/g, ''))) out.push('heading emoji: ' + h.textContent.slice(0, 20));
    return { out };
  });
  if (r.out.length) bad.push(where + ': ' + r.out.join(', '));
}
async function touchRun(pg, id) {
  const k = K(id), bad = [], tap = sel => pg.locator(sel).first().tap();
  const m0 = await coins.mark(pg);
  await openCase(pg, id); await fit(pg, 'cold open', bad);
  await tap('[data-cc="next"]'); await stepIs(pg, 'scene');
  for (let i = 0; i < 3; i++) await tap(`[data-cc="look"][data-arg="${i}"]`);
  await fit(pg, 'scene', bad);
  await tap('[data-cc="next"]'); await stepIs(pg, 'brief'); await fit(pg, 'brief', bad); await tap('[data-cc="next"]');
  let guard = 0, keysSeen = 0;
  for (;;) {
    if (++guard > 80) { ok(false, id + ': ends'); break; }
    await until(pg, () => { const p = SB_CIRCUIT_CASES.peek(); return p && (p.step === 'item' || p.step === 'esc' || p.step === 'accuse'); });
    const p = await peek(pg);
    if (p.step === 'accuse') break;
    if (p.step === 'esc') { await fit(pg, 'escalation', bad); await tap('[data-cc="next"]'); continue; }
    if (p.after) { await tap('[data-cc="next"]'); continue; }
    await fit(pg, 'item ' + (p.i + 1), bad);
    if (p.opts) await tap(`[data-cc="pick"][data-arg="${p.opts.indexOf(p.ans[0])}"]`);
    else {
      const has = await pg.evaluate(() => document.querySelectorAll('.cc-play .sg-key').length);
      if (!has) { ok(false, `${id}: TOUCH ONLY — a typed item on a phone has the kit's on-screen keys (item ${p.i + 1} has none)`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return; }
      keysSeen++;
      for (const ch of p.ans[0]) await tap(`.cc-play .sg-key[data-k="${ch}"]`);
      await tap('.cc-play .sg-key[data-k="⏎"]');
    }
    if (!await until(pg, i => { const q = SB_CIRCUIT_CASES.peek(); return q.after && q.i === i; }, p.i)) { ok(false, `${id}: item ${p.i + 1} took its right answer (${JSON.stringify(await peek(pg)).slice(0, 160)})`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return false; }
  }
  await fit(pg, 'accusation', bad);
  await tap(`[data-cc="accuse"][data-arg="${k.accusation.right}"]`); await stepIs(pg, 'reveal');
  for (let g = 0; g < 20; g++) { const q = await peek(pg); if (q.step !== 'reveal') break; await fit(pg, 'reveal', bad); await tap('[data-cc="next"]'); await pg.waitForTimeout(40); }
  await stepIs(pg, 'chill'); await fit(pg, 'last chill', bad); await tap('[data-cc="done"]'); await until(pg, () => !document.querySelector('.cc-play'));
  const r = await coins.since(pg, m0), rec = await caseRec(pg, id);
  ok(rec.state === 'solved' && rec.dismissed && r.earned === k.puzzle.items.length, `${id}: TOUCH ONLY — solved by taps alone, the letters on the kit's own keys (${keysSeen} typed items had them), ${r.earned} coins`);
  ok(!bad.length, `${id}: at 390×844 every control on every screen is a 44px target inside the width, the page never scrolls sideways, the controls stay on screen, no emoji${bad.length ? ' — ' + bad.slice(0, 5).join(' · ') : ''}`);
}

/* ============================================================== 4. keyboard only */
async function keyRun(pg, id) {
  const k = K(id), key = s => pg.keyboard.press(s);
  const m0 = await coins.mark(pg);
  await openCase(pg, id);
  await key('Enter'); await stepIs(pg, 'scene');
  for (const d of ['1', '2', '3']) await key(d);
  await key('Enter'); if (!await stepIs(pg, 'brief')) { ok(false, `${id}: Enter leaves the scene once all three are looked at`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return; } await key('Enter');
  let guard = 0, tabbed = false;
  for (;;) {
    if (++guard > 80) { ok(false, id + ': ends'); break; }
    await until(pg, () => { const p = SB_CIRCUIT_CASES.peek(); return p && (p.step === 'item' || p.step === 'esc' || p.step === 'accuse'); });
    const p = await peek(pg);
    if (p.step === 'accuse') break;
    if (p.step === 'esc') { await key('Enter'); await until(pg, () => SB_CIRCUIT_CASES.peek().step !== 'esc'); continue; }
    if (p.after) { await key('Enter'); await until(pg, i => { const q = SB_CIRCUIT_CASES.peek(); return !(q.after && q.i === i); }, p.i); continue; }
    if (!tabbed) {   /* a rival reached by Tab and opened by Enter */
      let on = false; for (let t = 0; t < 40 && !on; t++) { await key('Tab'); on = await pg.evaluate(() => !!(document.activeElement && document.activeElement.matches('.cc-play [data-cc="hint"]:not([data-arg="melody"])'))); }
      const before = await pg.evaluate(() => document.querySelectorAll('.cc-play .cc-said-h').length);
      if (on) await key('Enter');
      const after = await pg.evaluate(() => document.querySelectorAll('.cc-play .cc-said-h').length);
      tabbed = ok(on && after === before + 1, `${id}: Tab reaches a rival's button inside the case, and Enter asks them (${before} → ${after})`) || true;
    }
    if (p.opts) await key(String(p.opts.indexOf(p.ans[0]) + 1));
    else if (p.kind === 'stmt' && p.ok) await key('0');
    else {
      if (p.kind === 'stmt') { await key(String(p.toks.map(t => t.toLowerCase()).indexOf(p.word.toLowerCase()) + 1)); await until(pg, () => SB_CIRCUIT_CASES.peek().phase === 'type'); }
      await pg.keyboard.type(p.ans[0]); await key('Enter');
    }
    if (!await until(pg, i => { const q = SB_CIRCUIT_CASES.peek(); return q.after && q.i === i; }, p.i)) { ok(false, `${id}: item ${p.i + 1} took its right answer (${JSON.stringify(await peek(pg)).slice(0, 160)})`); await pg.evaluate(() => SB_CIRCUIT_CASES.close()); return false; }
  }
  await key(String(k.accusation.right + 1)); await stepIs(pg, 'reveal');
  for (let g = 0; g < 20; g++) { const q = await peek(pg); if (q.step !== 'reveal') break; await key('Enter'); await until(pg, rv => { const z = SB_CIRCUIT_CASES.peek(); return z.step !== 'reveal' || z.rv !== rv; }, q.rv); }
  await stepIs(pg, 'chill'); await key('Enter'); await until(pg, () => !document.querySelector('.cc-play'));
  const r = await coins.since(pg, m0), rec = await caseRec(pg, id);
  ok(rec.state === 'solved' && rec.dismissed && r.earned === k.puzzle.items.length, `${id}: KEYBOARD ONLY — solved with digits, letters and Enter, never a pointer (${r.earned} coins)`);
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const errsAll = [];
  try {
    if (want('careful')) {
      console.log('\n1. The careful bot solves each of the five');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)));
      console.log('  (core: ' + pg._core + ')');
      for (const c of D.cases) await careful(pg, c.id);
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('random')) {
      console.log('\n2. The random bot earns nothing, and every case resolves');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)));
      const R = rng(20261015);
      for (const c of D.cases) await bot(pg, c.id, 'random', R);
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('wrong')) {
      console.log('\n3. Always wrong: hints escalate until the answer is shown, every miss holds, every case resolves');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)));
      const R = rng(7);
      for (const c of D.cases) await bot(pg, c.id, 'wrong', R);
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('keyboard')) {
      console.log('\n4. Keyboard only');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)));
      await keyRun(pg, 'c5'); await keyRun(pg, 'c3');
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('touch')) {
      console.log('\n5. Touch only, on a phone (390×844)');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)), { ctx: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } });
      await touchRun(pg, 'c2'); await touchRun(pg, 'c4');
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('pin')) {
      console.log('\n6. The pin on the region board');
      const { ctx, pg } = await page(b, kidWith(['meadow', 'library']), { hash: '#/atlas/honey/library' });
      ok(await until(pg, () => state.nav === 'trail' && !!document.querySelector('.act-board .atlas-stop'), null, 30000), 'the Great Library\'s board is drawn (#/atlas/honey/library)');
      const blank = await pg.evaluate(() => [SB_CIRCUIT_CASES.pins('storm'), SB_CIRCUIT_CASES.pins('meadow'), SB_CIRCUIT_CASES.pins('forum')]);
      ok(blank.every(h => h === ''), 'no pin before its trigger round\'s hall (the Storm\'s case with the Storm undone), and none on a board without a case');
      await pg.evaluate(() => SB_CIRCUIT_CASES.open('c2')); await pg.waitForTimeout(1200);
      ok(await pg.evaluate(() => !document.querySelector('.cc-play') && SB_CIRCUIT.caseState(active(), 'c2') == null), 'a case the core holds no record for yet (Case 2, the Storm undone) does not open, even asked for by name, and nothing is written for it');
      const preMail = await pg.evaluate(() => { const o = SB_CIRCUIT.state(active()); o.halls.storm = { done: 1, best: 1, last: 1 }; const h = SB_CIRCUIT_CASES.pins('storm'); delete o.halls.storm; return h; });
      ok(preMail === '', 'a hall done before its story mail is in (the core holds mail back to keep story order) puts no pin up: the core\'s record, not the hall, makes a case available');
      /* the core draws its board extras on EVERY render of the board; until trail.js does (the stub world), an observer does
         the same — the pins are drawn again whenever the board is, and placed by pins() itself */
      const inject = () => pg.evaluate(() => { const put = () => { const bd = document.querySelector('.act-board'); if (bd && !bd.querySelector('.cc-pin')) bd.insertAdjacentHTML('beforeend', SB_CIRCUIT_CASES.pins('library')); };
        if (!window.__ccMo) { window.__ccMo = new MutationObserver(put); __ccMo.observe(document.getElementById('root'), { childList: true, subtree: true }); }
        put(); return 'ok'; });
      await Wt.quietRender(pg, 400);
      const stops0 = await pg.evaluate(() => [...document.querySelectorAll('.act-board > .atlas-stop')].map(s => s.getAttribute('data-act') + ':' + s.getAttribute('data-arg') + ':' + !!s.disabled).join('|'));
      await inject();
      ok(await until(pg, () => !!document.querySelector('.act-board > .cc-pin:not(.cc-unplaced)')), 'the URGENT pin is on the board, placed');
      const g = await pg.evaluate(() => { const pin = document.querySelector('.act-board > .cc-pin'), r = pin.getBoundingClientRect();
        const st = [...document.querySelectorAll('.act-board > .atlas-stop')], pts = st.map(s => [parseFloat(s.style.left), parseFloat(s.style.top)]);
        const now = st.findIndex(s => s.classList.contains('now')); let j = now >= 0 ? now - 1 : Math.floor(st.length / 2) - 1; j = Math.max(0, Math.min(st.length - 2, j));
        return { w: r.width, h: r.height, x: parseFloat(pin.style.left), y: parseFloat(pin.style.top), mx: (pts[j][0] + pts[j + 1][0]) / 2, my: (pts[j][1] + pts[j + 1][1]) / 2, j, n: st.length, emo: /\p{Extended_Pictographic}/u.test(pin.textContent), stops: st.map(s => s.getAttribute('data-act') + ':' + s.getAttribute('data-arg') + ':' + !!s.disabled).join('|') }; });
      ok(g.w >= 44 && g.h >= 44 && !g.emo, `the pin is a 44px target (${g.w.toFixed(0)}×${g.h.toFixed(0)}), drawn, no emoji`);
      ok(Math.abs(g.x - g.mx) < 0.05 && Math.abs(g.y - g.my) < 0.05, `it stands between two ordinary stops — halfway from stop ${g.j + 1} to stop ${g.j + 2} of ${g.n} (${g.x.toFixed(1)}%,${g.y.toFixed(1)}% vs ${g.mx.toFixed(1)}%,${g.my.toFixed(1)}%)`);
      ok(g.stops === stops0, 'the stops are exactly as they were — the pin gates nothing (L2)');
      await pg.click('.act-board > .cc-pin');
      ok(await until(pg, () => !!document.querySelector('.cc-play[data-route="case/c1"]') && location.hash === '#/case/c1'), 'a click on the pin opens the Misprinted List at #/case/c1');
      await pg.goBack();
      ok(await until(pg, () => !document.querySelector('.cc-play') && /atlas/.test(location.hash)), 'the browser\'s Back takes the case away and lands on the board (' + await pg.evaluate(() => location.hash) + ')');
      await until(pg, () => !!document.querySelector('.act-board .atlas-stop'), null, 15000); await Wt.quietRender(pg, 400); await inject();
      await until(pg, () => !!document.querySelector('.act-board > .cc-pin:not(.cc-unplaced)'));
      await pg.evaluate(() => document.querySelector('.act-board > .cc-pin').focus()); await pg.keyboard.press('Enter');
      ok(await until(pg, () => !!document.querySelector('.cc-play[data-route="case/c1"]')), 'Enter on the focused pin opens it too');
      await pg.keyboard.press('Escape');
      ok(await until(pg, () => !document.querySelector('.cc-play')), 'Esc takes it away');
      await pg.emulateMedia({ reducedMotion: 'reduce' }); await Wt.quietRender(pg, 300); await inject(); await until(pg, () => !!document.querySelector('.act-board > .cc-pin'));
      const still = await pg.evaluate(() => getComputedStyle(document.querySelector('.act-board > .cc-pin .cc-seal')).animationName);
      await openCase(pg, 'c1');
      const still2 = await pg.evaluate(() => getComputedStyle(document.querySelector('.cc-play .cc-clock .cc-hand')).animationName);
      await pg.emulateMedia({ reducedMotion: 'no-preference' });
      const moving = await pg.evaluate(() => getComputedStyle(document.querySelector('.cc-play .cc-clock .cc-hand')).animationName);
      ok(still === 'none' && still2 === 'none' && moving !== 'none', `Reduce motion stills the pin's seal and the clock's hand (${still}, ${still2}; with motion: ${moving})`);
      await pg.evaluate(() => SB_CIRCUIT_CASES.close());
      /* last, because a solved case stays solved (the core's rule) */
      const vis = await pg.evaluate(() => { const c = active(), out = [];
        SB_CIRCUIT.caseUpdate(c, 'c1', { state: 'solved' }); out.push(SB_CIRCUIT_CASES.pins('library') !== '');
        SB_CIRCUIT.caseUpdate(c, 'c1', { dismissed: true }); out.push(SB_CIRCUIT_CASES.pins('library') === ''); return out; });
      ok(vis[0] && vis[1], 'solved but not yet dismissed the pin stays; solved and dismissed it is gone (cases never expire, and are optional)');
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('late')) {
      console.log('\n7. Late, safe, and the rivals who tell and give time');
      const order = pg => pg.evaluate(() => { const t = document.querySelector('.cc-play').textContent, k = SB_CIRCUIT_CASES_DATA.cases[2];
        return { late: t.indexOf(k.lateLine), safe: t.indexOf(k.safeLine), imp: t.indexOf(k.impossible) }; });
      let { ctx, pg } = await page(b, kidWith(['meadow', 'library', 'forum', 'storm', 'roots']));
      await pg.evaluate(() => { SB_CIRCUIT.state(active()).halls.strait = { done: 1, best: 1, last: 1 }; });
      await openCase(pg, 'c3'); let o = await order(pg);
      ok(o.late < 0 && o.safe >= 0 && o.safe < o.imp, `on time (the Far Shore's hall done, its story mail not yet in: the core's caseLate decides), Case 3 says its safeLine first, before the impossible (${o.safe} < ${o.imp}; no lateLine)`);
      await pg.evaluate(() => SB_CIRCUIT_CASES.close()); await ctx.close();
      ({ ctx, pg } = await page(b, kidWith(['meadow', 'library', 'forum', 'storm', 'roots', 'strait'], 6)));
      await openCase(pg, 'c3'); o = await order(pg);
      ok(o.late >= 0 && o.late < o.safe && o.safe < o.imp, `late (the Far Shore's hall done), it says its lateLine first, then the safeLine, then the impossible (${o.late} < ${o.safe} < ${o.imp})`);
      /* Ines tells; Suki gives time; a hold stops the clock */
      await click(pg, '[data-cc="next"]'); for (let i = 0; i < 3; i++) await click(pg, `[data-cc="look"][data-arg="${i}"]`);
      await click(pg, '[data-cc="next"]'); await stepIs(pg, 'brief'); await click(pg, '[data-cc="next"]'); await stepIs(pg, 'item');
      let p = await peek(pg);
      await click(pg, '[data-cc="hint"][data-arg="melody"]');
      const ines = await pg.evaluate(() => (document.querySelector('.cc-play .cc-said-h[data-rival="melody"]') || {}).textContent || '');
      await click(pg, `[data-cc="pick"][data-arg="${p.opts.indexOf(p.ans[0])}"]`); await until(pg, () => SB_CIRCUIT_CASES.peek().after);
      p = await peek(pg);
      ok(ines.indexOf(p.ans[0]) >= 0 && p.res[0] === 2, `Ask Ines gives the home language ("${ines.trim()}"), and the item is then right but not first-time (${p.res[0]})`);
      await click(pg, '[data-cc="next"]'); await stepIs(pg, 'item');
      const s0 = (await peek(pg)).secs; await click(pg, '[data-cc="hint"][data-arg="snowfox"]'); const s1 = (await peek(pg)).secs;
      ok(s1 - s0 > 28 && s1 - s0 < 31, `Ask Suki: "Breathe out." and 30 s more on the clock (${s0.toFixed(1)} → ${s1.toFixed(1)})`);
      p = await peek(pg); await click(pg, `[data-cc="pick"][data-arg="${p.opts.findIndex(x => p.ans.indexOf(x) < 0)}"]`);
      await until(pg, () => SB_CIRCUIT_CASES.peek().hold);
      const h0 = (await peek(pg)).secs; await pg.waitForTimeout(1500); const h1 = (await peek(pg)).secs;
      ok(Math.abs(h1 - h0) < 0.05, `a hold stops the clock (${h0.toFixed(2)} → ${h1.toFixed(2)} after 1.5 s)`);
      await pg.evaluate(() => SB_CIRCUIT_CASES.close());
      await openCase(pg, 'c2'); await click(pg, '[data-cc="next"]'); await stepIs(pg, 'scene');
      const dax = await pg.evaluate(() => { const e = document.querySelector('.cc-play [data-who="comet"]'); return e ? e.textContent : ''; });
      ok(/rocks on his heels/.test(dax), `a six-year-old's Case 2 shows Dax's card with his tell before the puzzle ("${dax.trim()}")`);
      await pg.evaluate(() => SB_CIRCUIT_CASES.close());
      errsAll.push(...pg._errs); await ctx.close();
    }
    if (want('resume')) {
      console.log('\n8. No second pay: left and reopened, a case carries on and pays each item once');
      const { ctx, pg } = await page(b, kidWith(ALL.slice(0, 8)));
      const m0 = await coins.mark(pg);
      await openCase(pg, 'c1'); await click(pg, '[data-cc="next"]'); for (let i = 0; i < 3; i++) await click(pg, `[data-cc="look"][data-arg="${i}"]`);
      await click(pg, '[data-cc="next"]'); await stepIs(pg, 'brief'); await click(pg, '[data-cc="next"]');
      for (let n = 0; n < 3; n++) { await stepIs(pg, 'item'); const p = await peek(pg); await pg.keyboard.type(p.ans[0]); await pg.keyboard.press('Enter'); await until(pg, () => SB_CIRCUIT_CASES.peek().after); await click(pg, '[data-cc="next"]'); }
      await stepIs(pg, 'item'); const p4 = await peek(pg);
      await pg.keyboard.type('qzxq'); await pg.keyboard.press('Enter'); await until(pg, () => SB_CIRCUIT_CASES.peek().hold);
      await click(pg, '[data-cc="holdgo"]'); await click(pg, '[data-cc="back"]'); await until(pg, () => !document.querySelector('.cc-play'));
      await openCase(pg, 'c1'); await click(pg, '[data-cc="next"]'); await stepIs(pg, 'scene');
      ok(await pg.evaluate(() => !document.querySelector('[data-cc="next"][disabled]')), 'reopened, the scene remembers all three looked at');
      await click(pg, '[data-cc="next"]'); await stepIs(pg, 'brief');
      ok(/Carry on/.test(await overlayText(pg)), 'the brief says Carry on');
      await click(pg, '[data-cc="next"]'); await stepIs(pg, 'item');
      let p = await peek(pg); ok(p.i === 3 && p4.i === 3, `it carries on at the fourth item (${p.i + 1})`);
      await pg.keyboard.type(p.ans[0]); await pg.keyboard.press('Enter'); await until(pg, () => SB_CIRCUIT_CASES.peek().after);
      p = await peek(pg); ok(p.res[3] === 2, `the item missed before leaving is right but not first-time when it comes back (${p.res[3]})`);
      await click(pg, '[data-cc="next"]');
      for (let g = 0; g < 40; g++) { const q = await peek(pg); if (q.step === 'accuse') break; if (q.step === 'esc' || q.after) { await click(pg, '[data-cc="next"]'); continue; }
        await stepIs(pg, 'item'); const z = await peek(pg); if (z.after) continue; await pg.keyboard.type(z.ans[0]); await pg.keyboard.press('Enter'); await until(pg, () => SB_CIRCUIT_CASES.peek().after); }
      await click(pg, `[data-cc="accuse"][data-arg="${K('c1').accusation.right}"]`); await stepIs(pg, 'reveal');
      for (let g = 0; g < 20; g++) { const q = await peek(pg); if (q.step !== 'reveal') break; await click(pg, '[data-cc="next"]'); await pg.waitForTimeout(40); }
      await click(pg, '[data-cc="done"]'); await until(pg, () => !document.querySelector('.cc-play'));
      const r = await coins.since(pg, m0);
      ok(r.earned === 11, `the whole case paid 11 — twelve items, one missed before leaving, none paid twice (${r.earned})`);
      errsAll.push(...pg._errs); await ctx.close();
    }
  } finally { await b.close(); }
  const errs = errsAll.filter(e => !/ResizeObserver|favicon/i.test(e));
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
