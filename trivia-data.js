/* Bizzing Bee trivia — core index. Questions live in trivia-q1..q5.js and are
   fetched only for the level a speller is actually playing: a whole bank would be
   1.2MB of
   JavaScript at boot, and nobody plays five levels at once. */
window.SB_TRIVIA={
  themes:[{"id":"animals","label":"Amazing Animals","e":"🦁"},{"id":"bugs","label":"Birds & Bugs","e":"🦋"},{"id":"ocean","label":"Ocean Life","e":"🌊"},{"id":"space","label":"Space & Stars","e":"🚀"},{"id":"body","label":"The Human Body","e":"🫀"},{"id":"plants","label":"Plants & Trees","e":"🌿"},{"id":"food","label":"Food & Cooking","e":"🍕"},{"id":"sports","label":"Sports & Games","e":"⚽"},{"id":"music","label":"Music & Dance","e":"🎵"},{"id":"myth","label":"Myths & Legends","e":"🐉"},{"id":"world","label":"Our World","e":"🗺️"},{"id":"history","label":"Long Ago","e":"🏛️"},{"id":"science","label":"Science Lab","e":"🧪"},{"id":"numbers","label":"Numbers & Logic","e":"🔢"},{"id":"weather","label":"Weather & Sky","e":"🌈"},{"id":"machines","label":"Machines & Movers","e":"🚂"},{"id":"art","label":"Art & Color","e":"🎨"},{"id":"fest","label":"Festivals & Family","e":"🎉"},{"id":"story","label":"Storybooks & Poems","e":"📚"},{"id":"words","label":"Word Wizardry","e":"🪄"},{"id":"lit","label":"Classic Literature","e":"📚"},{"id":"ent","label":"Stage & Screen","e":"🎬"},{"id":"brands","label":"Brands & Inventions","e":"🏷️"},{"id":"quotes","label":"Famous Quotes","e":"💬"},{"id":"india","label":"Incredible India","e":"🇮🇳"},{"id":"code","label":"Computers & Code","e":"💻"},{"id":"langs","label":"Languages of the World","e":"🗣️"},{"id":"explore","label":"Explorers & Records","e":"🧭"}],
  questions:[],
  version:1,
  count:5000,
  byLevel:{"1":1067,"2":1333,"3":1260,"4":721,"5":619},
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
