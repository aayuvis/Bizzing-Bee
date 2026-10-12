/* trail-home.js — THE ATLAS'S ROAD, AND WHERE A CHILD STANDS ON IT (road to 4.5, P1.13 step 3 — first-load JS ≤ 400 KB).

   A boot script, a few KB. Home's "You are here" card (app3 homeHereCard), its Continue and strip, the drawer's next
   step and family-shell's nextStep() read the child's place on the Word Atlas through two functions:
     SB_TRAIL_NEXT()     the frontier: {kind, title, sub, act, world, done, total, lap, allDone, go, arg, crs, actId,
                         node, stop, stops, stopsDone} — "Stop n of N" is the board's own count (trail-road.js);
     SB_TRAIL_HERE(crs)  the overview painting's pins, the child's region and its rail of stops.
   They used to live in trail.js (~49 KB gz) and to wait for trail-data.js (~75 KB gz); both are lazy now (boot-lazy
   `atlas`). They read only the ROAD, so they run here on whichever curriculum is in hand: the whole one (SB_TRAIL)
   once it has landed, and until then SB_TRAIL_HOME — the road cut from it by tools/build-trail-home.cjs
   (trail-home-data.js, a boot script). The same answer either way; tests/trail-home.cjs holds them to it.

   THE ARITHMETIC IS ONE COPY. SB_TRAIL_FRONT(T) returns the road's helpers over a curriculum getter T — the lap, the
   walked maps, seq() (trail-road.js nodes), passedNode, the start line (startIdx), reachIn / reach / frontier — and
   trail.js builds its own from it (over the whole curriculum) instead of carrying a second copy. Change the frontier
   here, and only here. SB_ATLAS_PINS (the overview's hand-measured pins) lives here too; trail.js reads it.
   Uses app3 globals at call time: state, active. */
(function () {
  'use strict';
  window.SB_TRAIL_FRONT = function (T) {
    const tr = c => c.trail || (c.trail = { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} });
    /* Both courses live on ONE map; the active course follows the unit being worked (x-prefixed ids are the Advanced
       Rounds), set by trail.js's unit/checkpoint actions. */
    const course = () => state.trailCourse === 'exp' ? 'exp' : 'honey';
    const courseOfId = id => (String(id || '')[0] === 'x') ? 'exp' : 'honey';
    const unitsOf = tab => tab === 'exp' ? T().expedition.units : T().honey.units;
    const actsOf = tab => tab === 'exp' ? T().expedition.expeds : T().honey.acts;
    const lapOf = c => course() === 'exp' ? tr(c).elap : tr(c).lap;
    const doneMap = c => course() === 'exp' ? tr(c).edone : tr(c).done;
    const chkMap = c => course() === 'exp' ? tr(c).echk : tr(c).chk;
    const PGATE = 70;                       // practice % that opens the next stop
    /* ordered nodes for the current lap: units + checkpoint markers every 4th. The road is trail-road.js's
       (SB_TRAIL_ROAD.nodes) — the ONE count the board, Home's "Stop n of N" and My Feed's place cards all
       read (the 4.5 brief, P0.14), so no two of them can disagree about how long a region is. */
    function seq(c) { return window.SB_TRAIL_ROAD.nodes(T(), course(), lapOf(c)); }
    /* a UNIT opens the road behind it at Practice >= PGATE (or a legacy quiz pass);
       a CHECKPOINT is still its quiz — the every-4th-stop consolidation stays a quiz */
    const passedNode = (c, node) => node.kind === 'unit'
      ? (!!(doneMap(c)[node.u.id] || {})[lapOf(c)] || (((tr(c).st || {})[node.u.id + ':' + lapOf(c)] || {}).p || 0) >= PGATE)
      : !!chkMap(c)[lapOf(c) + ':' + node.id];
    /* THE START LINE (road to 4.5, P1.7 — owner, 10 Oct 2026: placement "only chooses where Continue starts").
       A child placed in onboarding carries `tr(c).start = {u, act, pick, rec, n, ok, at}`: the entry stop of
       the region they chose. It never changes the route, the stops, their order or the rule that opens them —
       a stop still opens when the one before it is walked — it moves only where the walk BEGINS, on Tier 1 of
       the Honey course. Nothing before the start line is marked walked (no evidence is invented); those stops
       stay open behind the child, and the lap still needs every stop walked (seq().every(passed) below).
         reach(c)    — the furthest open node: the first one not walked at or after the start line.
                       Every lock reads this. With no start line it IS the old frontier, so nothing changes
                       for a child who was never placed.
         frontier(c) — where Continue goes: reach, or — once the road from the start line is walked to its end
                       — the first stop still unwalked behind it.
       Guard: tests/placement-step.cjs (the route and the open rule unchanged, the earlier stops open and not
       walked, Continue at the chosen stop) and tests/placement.cjs. */
    function startIdx(c, s) {
      if (course() !== 'honey' || lapOf(c) !== 1) return 0;
      const st = tr(c).start; if (!st || !st.u) return 0;
      const i = s.findIndex(n => n.kind === 'unit' && n.u.id === st.u); return i > 0 ? i : 0;
    }
    function reachIn(c, s) { for (let i = startIdx(c, s); i < s.length; i++) if (!passedNode(c, s[i])) return i; return s.length; }
    function reach(c) { return reachIn(c, seq(c)); }
    function frontier(c) { const s = seq(c); const e = reachIn(c, s); if (e < s.length) return e;
      for (let i = 0; i < s.length; i++) if (!passedNode(c, s[i])) return i; return s.length; }
    return { tr, course, courseOfId, unitsOf, actsOf, lapOf, doneMap, chkMap, PGATE, seq, passedNode, startIdx, reachIn, reach, frontier };
  };

  /* WHERE THE REGIONS SIT ON THE OVERVIEW PAINTINGS. PIN coordinates are percentages measured against the painted
     art (app-art/atlas-map.webp and atlas-adv.webp, generated by voice/pipeline/atlas-art.py). They are hand-placed
     against what the painter actually drew — if the art is ever regenerated, these have to be re-measured. */
  window.SB_ATLAS_PINS = {
    honey: [
      ['meadow',   12.5, 70],   // the flower meadow, bottom-left
      ['library',  39,   70],   // the bookshelf canyon
      ['forum',    17,   34],   // the marble forum
      ['storm',    35,   19],   // the crystal storm
      ['roots',    53,   43],   // the engine room, centre
      ['strait',   70,   66],   // the lighthouse strait
      ['junkyard', 85,   53],   // the junkyard
      ['sprints',  62,   14],   // the paper mountains
      ['stage',    85,   13],   // the theatre in the cliff
    ],
    exp: [
      ['proving',  18, 72],     // the lantern-lit proving ground
      ['greysea',  27, 41],     // the fog sea and its red buoy
      ['liars',    54, 46],     // the junkyard, centre
      ['grandtrunk', 70, 37],   // ON the road east of the junkyard - it IS the road,
                                //  and it is the only spot whose chip clears all three
                                //  neighbours' chips (liars, farflung, factory)
      ['farflung', 64, 15],     // the far shore
      ['factory',  83, 18],     // the word factory
    ],
  };

  const ATLAS_PINS = window.SB_ATLAS_PINS;
  const T = () => window.SB_TRAIL || window.SB_TRAIL_HOME;
  const F = window.SB_TRAIL_FRONT(T);
  const { tr, course, actsOf, lapOf, PGATE, seq, passedNode, reachIn, frontier } = F;

  /* The Home screen shows the next stop on the Atlas, so the frontier has to be
     readable from outside this file. Everything is derived here rather than
     re-implemented in app3 — the lap filter in seq() is the only truth about
     which stop comes next. Null only with no child (or no road at all): the road is in hand from first paint. */
  window.SB_TRAIL_NEXT = function () {
    try {
      const c = active(); if (!c || !T()) return null;
      const s = seq(c); if (!s.length) return null;
      const i = frontier(c), atEnd = i >= s.length;
      const node = s[atEnd ? s.length - 1 : i];
      const act = (actsOf(course()) || []).find(a => a.id === node.act) || {};
      const raw = node.kind === 'unit' ? String(node.u.title || '') : 'Checkpoint';
      const cut = raw.indexOf(' — ');
      /* where the stop sits in its OWN region, counted the way the region's board counts it
         ("Stop 3 of 13": this tier's stops AND its checkpoints) — Home quotes these */
      const inAct = s.map((n, k) => k).filter(k => s[k].act === node.act);
      /* `done` counts the stops WALKED before this one: a placed child's start line skips stops it never
         marks walked, so the index alone would report them cleared (the report card prints this number) */
      let skipped = 0; for (let k = 0; k < Math.min(i, s.length); k++) if (!passedNode(c, s[k])) skipped++;
      return {
        kind: node.kind,
        title: cut > 0 ? raw.slice(0, cut) : raw,
        sub: node.kind === 'chk' ? 'mixed quiz — no new words' : (cut > 0 ? raw.slice(cut + 3) : ''),
        act: act.title || '', world: act.world || 'meadow',
        done: Math.min(i, s.length) - skipped, total: s.length, lap: lapOf(c), allDone: atEnd,
        go: node.kind === 'unit' ? 'trailUnit' : 'trailChk',
        arg: node.kind === 'unit' ? node.u.id : (course() + '|' + node.id),
        crs: course(), actId: node.act, node: atEnd ? null : i,
        stop: inAct.indexOf(atEnd ? s.length - 1 : i) + 1, stops: inAct.length,
        stopsDone: inAct.filter(k => passedNode(c, s[k])).length,
      };
    } catch (e) { return null; }
  };
  /* HOME'S "YOU ARE HERE" (owner, 4 Oct 2026: "HOME screen should take to world atlas and show
     kids where they are"). The World Atlas the overview draws — its painting, its region
     medallions, its road — and where this child stands on it, read from the same pins, frontier
     and stop records atlasBoard uses, so the card on Home is a window onto the Atlas and never a
     second map that could disagree with it. `stops` is the child's region as its own board counts
     it (this tier's stops and checkpoints): 2 passed, 1 the frontier, 0 ahead. Display only —
     where Continue GOES is SB_NEXT_STEP's (family-shell). It answers from the first paint: the road
     (trail-home-data.js) is a boot script. */
  window.SB_TRAIL_HERE = function (crs) {
    try {
      crs = crs === 'exp' ? 'exp' : 'honey';
      const P = ATLAS_PINS[crs] || [], img = crs === 'exp' ? 'atlas-adv.webp' : 'atlas-map.webp';
      const c = active();
      if (!c || !T()) return { img, crs, ready: false, here: 0, stops: [],
        pins: P.map(([id, x, y], i) => ({ id, x, y, st: i ? 'ahead' : 'here' })) };
      const prev = state.trailCourse; state.trailCourse = crs;
      try {
        const s = seq(c), fr = frontier(c), rc = reachIn(c, s);
        let here = -1, stops = [];
        const pins = P.map(([id, x, y], i) => {
          const ns = s.map((n, k) => ({ n, k })).filter(z => z.n.act === id);
          const dn = ns.filter(z => passedNode(c, z.n)).length, at = ns.some(z => z.k === fr);
          if (at) { here = i; stops = ns.map(z => passedNode(c, z.n) ? 2 : z.k === fr ? 1 : 0); }
          return { id, x, y, st: ns.length && dn >= ns.length ? 'done' : at ? 'here' : (dn || ns.some(z => z.k <= rc)) ? 'part' : 'ahead' };   /* behind a start line: reached */
        });
        /* every stop of the tier walked: the child stands at the end of the road */
        if (here < 0) { here = Math.max(0, pins.length - 1);
          const last = pins[here] && s.filter(n => n.act === pins[here].id); stops = (last || []).map(() => 2); }
        return { img, crs, ready: true, here, stops, pins };
      } finally { state.trailCourse = prev; }
    } catch (e) { return null; }
  };

  /* STOPS FINISHED, every course and lap, counted once per stop — the evidence behind the
     Atlas medals and some avatar milestones (FIX-BEE I3/I4). A stop is finished the way the
     map itself decides it: a quiz pass on any lap, or Practice at PGATE. */
  window.SB_TRAIL_STOPS = function (c) { try { c = c || active(); const t = tr(c); const ids = new Set();
      [t.done || {}, t.edone || {}].forEach(m => Object.keys(m).forEach(id => { if (Object.keys(m[id] || {}).length) ids.add(id); }));
      Object.keys(t.st || {}).forEach(k => { if (((t.st[k] || {}).p || 0) >= PGATE) ids.add(k.split(':')[0]); });
      return ids.size; } catch (e) { return 0; } };
})();
