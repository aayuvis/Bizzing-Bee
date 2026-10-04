/* HONEYCOMB RUN'S BOT DRIVER (games spec §8 T1/T2, tests/games-bots.mjs).
   The built-in arcade driver only answers a word the game has SAID, and in Honeycomb Run a word is
   only asked when the bee stands on a flower — a bot that never walks never meets one, so T1 passed
   on zero answers. This driver walks: an autopilot (the arrow-key intent, `_maze.want`, the same
   buffer a key or a swipe writes) steers the bee along the maze to the flower beside the next shut
   gate — and, once all four are open, into the hive. The oracle is the word the open card SAYS
   (`_maze.word()`), never read off the screen. Moths are taken off the board (`_maze.noMoths()`):
   the bots measure what a word pays, not how well a bot dodges. A miss card is dismissed with its
   own Continue, and the gate asks again with a new word, as it does for a child. */
export default {
  key: 'honeycombRun', kind: 'type', level: 'easy', secs: 40, maxSteps: 40,
  async start(pg, { level }) {
    await pg.evaluate((level) => { window.SB_DEBUG = true; window.__bot = { said: [] };
      SB_LEVEL.set('honeycombRun', level); app.arcadePlay('honeycombRun', { opts: {}, fromMenu: true }); }, level);
    await pg.waitForFunction(() => window._maze && _maze.state().started, null, { timeout: 15000 }).catch(() => {});
    await pg.evaluate(() => { _maze.noMoths(); clearInterval(window.__hcPilot);
      window.__hcPilot = setInterval(() => { try {
        const s = _maze.state(); if (!s.started || s.over || s.card || document.querySelector('.arc-play .sg-misswrap')) return;
        const bc = Math.round(s.px), br = Math.round(s.py), g = s.gates.find(x => !x.open);
        const goal = g ? [g.fc, g.fr] : [s.hive.c, s.hive.r];
        if (bc === goal[0] && br === goal[1]) { if (g) _maze.rearm(); return; }       // on the flower: it asks (again)
        const K = (c, r) => c + ',' + r, prev = new Map([[K(bc, br), null]]), q = [[bc, br]];
        while (q.length) { const [c, r] = q.shift(); if (c === goal[0] && r === goal[1]) break;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy, k = K(nc, nr);
            if (!prev.has(k) && _maze.openAt(nc, nr)) { prev.set(k, [c, r]); q.push([nc, nr]); } } }
        let cur = goal, p = prev.get(K(cur[0], cur[1])); if (p === undefined) return;
        while (p && !(p[0] === bc && p[1] === br)) { cur = p; p = prev.get(K(cur[0], cur[1])); }
        _maze.want([cur[0] - bc, cur[1] - br]);
      } catch (e) {} }, 50); });
  },
  async read(pg) {
    return pg.evaluate(() => {
      const end = !!document.querySelector('.arc-play .sg-endcard') || !document.querySelector('.arc-play #arc-host');
      const miss = document.querySelector('.arc-play .sg-misswrap .sg-miss-go');
      if (miss) { if (!window.__missAt) window.__missAt = performance.now(); else if (performance.now() - window.__missAt > 300) { window.__missAt = 0; miss.click(); } return { target: '', done: end }; }
      const s = window._maze ? _maze.state() : null;
      return { target: s && s.card ? _maze.word() : '', done: end }; });
  },
  async answer(pg, text) {
    await pg.evaluate((t) => { const inp = document.querySelector('.arc-play #sg-ci'); if (!inp) return;
      inp.value = t; const go = document.querySelector('.arc-play #sg-cgo'); if (go) go.click(); }, text);
  },
  async result(pg) { return pg.evaluate(() => { const s = window._maze && _maze.state(); return s ? { right: s.right, asked: s.met } : null; }); },
  async stop(pg) { await pg.evaluate(() => { clearInterval(window.__hcPilot); try { arcadeClose(); } catch (e) {} }); },
};
