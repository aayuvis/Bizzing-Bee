/* Split trivia-data.js into a tiny synchronous core + five lazy level shards.
   Run from spellbound-app/ AFTER merge.js:  node <scratch>/tt/shard.js
   Produces: trivia-data.js (core, ~few KB) and trivia-q1.js … trivia-q5.js */
const fs = require('fs');
const T = JSON.parse(fs.readFileSync(process.cwd() + '/trivia-all.json', 'utf8'));
const all = T.questions;
if (!all || !all.length) { console.error('trivia-all.json has no questions'); process.exit(1); }

const byLevel = {};
for (let lv = 1; lv <= 5; lv++) byLevel[lv] = all.filter(q => (q.lv || 3) === lv);

/* The core: themes + counts + the lazy loader. Everything the hub needs to draw
   chapter cards and level chips before a single question has been fetched. */
const core = `/* Bizzing Bee trivia — core index. Questions live in trivia-q1..q5.js and are
   fetched only for the level a speller is actually playing: a whole bank would be
   ${(all.length * 258 / 1048576).toFixed(1)}MB of
   JavaScript at boot, and nobody plays five levels at once. */
window.SB_TRIVIA={
  themes:${JSON.stringify(T.themes)},
  questions:[],
  version:${(T.version || 1)},
  count:${all.length},
  byLevel:${JSON.stringify(Object.fromEntries(Object.entries(byLevel).map(([k, v]) => [k, v.length])))},
  _L:{}, _wait:{},
  loaded:function(lv){ return !!this._L[lv]; },
  /* Push a shard in and tell the app its caches are stale. */
  _add:function(lv,qs){ this._L[lv]=true;
    for(var i=0;i<qs.length;i++) this.questions.push(qs[i]);
    try{ if(window.SB_TRIVIA_ONLOAD) window.SB_TRIVIA_ONLOAD(lv); }catch(e){}
    var w=this._wait[lv]||[]; this._wait[lv]=[];
    for(var j=0;j<w.length;j++){ try{ w[j](true); }catch(e){} } },
  /* The word chapters (roots, breakdowns, meanings, stories) are generated from the
     spelling corpus and live in one 2.2MB file. They only ever appear inside trivia, so
     they load as a prerequisite of the first level fetch rather than at boot. */
  _wq:null,
  _needWords:function(cb){ var self=this;
    if(this._wq==='done'){ cb(true); return; }
    if(this._wq){ this._wq.push(cb); return; }
    this._wq=[cb];
    var s=document.createElement('script'); s.src='trivia-words.js'+(window.SB_ASSET_V||'');
    var fire=function(ok){ var w=self._wq||[]; self._wq=ok?'done':null;
      try{ if(ok&&window.SB_TRIVIA_ONLOAD) window.SB_TRIVIA_ONLOAD('words'); }catch(e){}
      for(var i=0;i<w.length;i++){ try{ w[i](ok); }catch(e){} } };
    s.onload=function(){ fire(true); };
    s.onerror=function(){ fire(false); };   // word chapters missing is survivable
    document.head.appendChild(s); },
  /* need(lv, cb) — cb(ok) once level lv (and the word bank) is in memory. Idempotent. */
  need:function(lv,cb){ lv=Math.max(1,Math.min(5,+lv||3)); var self=this;
    this._needWords(function(){ self._shard(lv,cb); }); },
  _shard:function(lv,cb){
    if(this._L[lv]){ if(cb) cb(true); return; }
    if(this._wait[lv]){ if(cb) this._wait[lv].push(cb); return; }
    this._wait[lv]=cb?[cb]:[];
    var self=this, s=document.createElement('script');
    s.src='trivia-q'+lv+'.js'+(window.SB_ASSET_V||'');
    s.onerror=function(){ var w=self._wait[lv]||[]; self._wait[lv]=null;
      for(var i=0;i<w.length;i++){ try{ w[i](false); }catch(e){} } };
    document.head.appendChild(s); }
};
`;
fs.writeFileSync(process.cwd() + '/trivia-data.js', core);
let report = [];
for (let lv = 1; lv <= 5; lv++) {
  const f = 'trivia-q' + lv + '.js';
  fs.writeFileSync(process.cwd() + '/' + f, 'SB_TRIVIA._add(' + lv + ',' + JSON.stringify(byLevel[lv]) + ');\n');
  report.push([f, byLevel[lv].length, (fs.statSync(process.cwd() + '/' + f).size / 1048576).toFixed(2) + 'MB']);
}
console.log('core trivia-data.js:', (fs.statSync(process.cwd() + '/trivia-data.js').size / 1024).toFixed(1) + 'KB');
report.forEach(r => console.log('  ' + r[0].padEnd(15), String(r[1]).padStart(6), r[2].padStart(8)));
console.log('boot payload cut from', (all.length * 258 / 1048576).toFixed(1) + 'MB to a few KB; one shard loads on demand');
