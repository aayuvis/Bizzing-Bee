/* trail-road.js — THE ROAD, COUNTED ONCE (the 4.5 brief, P0.14/P0.15, 10 Oct 2026).

   A region of the Word Atlas is not its list of units. On any lap a child walks only the units whose
   `laps` include it, and after every `rules.checkpointEvery`-th of them in an act there is a checkpoint —
   a stop of its own on the board ("Stop 3 of 13"). The board (trail.js seq()), Home's "You are here"
   (SB_TRAIL_NEXT().stops) and My Feed's place cards each counted it their own way: the audit saw the
   Meadow board say 13 where the feed said 11, the Big Stage 2 where the feed said 15. Now this is the one
   function all of them read — trail.js builds its road from nodes(), tools/build-feed.cjs cuts the place
   cards from place() (tools/feed-corpus.cjs loads this file exactly as the page does), and bee-feed.js
   re-cuts a place card from the same place() for a child on a later lap.

     nodes(T, crs, lap) → the road, in act order: {kind:'unit', u, act} | {kind:'chk', id:'<act>:<n>', act}
                           (crs 'honey' filters by lap; the Advanced Rounds have no laps)
     count(T, actId, lap, crs) → how many of those are in one act — the board's N
     place(T, actId, lap) → { stops, first, last, body } — a place card's words, every number from count()

   Pure: it reads only the trail data it is handed (window.SB_TRAIL on the page). No DOM, no child. */
(function () {
  'use strict';
  function nodes(T, crs, lap) {
    const C = T && (crs === 'exp' ? T.expedition : T.honey); if (!C) return [];
    const acts = (crs === 'exp' ? C.expeds : C.acts) || [], every = (T.rules && T.rules.checkpointEvery) || 4;
    const byId = {}; (C.units || []).forEach((u) => { byId[u.id] = u; });
    const out = [];
    for (const act of acts) {
      let n = 0;
      for (const id of act.units || []) {
        const u = byId[id]; if (!u) continue;
        if (crs !== 'exp' && !(u.laps || [u.lap || 1]).includes(lap)) continue;
        out.push({ kind: 'unit', u, act: act.id }); n++;
        if (n % every === 0) out.push({ kind: 'chk', id: act.id + ':' + n, act: act.id });
      }
    }
    return out;
  }
  function count(T, actId, lap, crs) { return nodes(T, crs || 'honey', lap || 1).filter((x) => x.act === actId).length; }
  function place(T, actId, lap) {
    const ns = nodes(T, 'honey', lap || 1).filter((x) => x.act === actId), us = ns.filter((x) => x.kind === 'unit');
    if (!us.length) return null;
    const first = us[0].u.title, last = us[us.length - 1].u.title;
    return { stops: ns.length, first, last, body: ns.length + ' stops on this road, from “' + first + '” to “' + last + '”.' };
  }
  window.SB_TRAIL_ROAD = { nodes, count, place };
})();
