"use strict";
/* app3-library.js — the Library: Explore, the List Builder, Vocabulary, Word Journeys, Theme Journeys, Concepts, Figurative, the IPA trainer, Typing, Quotes, Trivia Training, the Word Finder; the word-card, quote-word, deck, full-list and trivia-list pop-ups.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrLib`, its group carries app3-shared.js and the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

// light markdown: escape, then **bold** / *italic*
function mdInline(t){ return esc(t||'').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>'); }
// map a lesson's 5 words to full word objects (enriched from the 130k DB; etymology kept as the hook)
function lessonWordObjs(L){ const db=wordDB(); return (L.words||[]).map(w=>{ const hit=db.get(nkey(w.w));
  const etyArr=(w.ety||[]); const ety=etyArr.join(' ');
  return { w:w.w, d:(hit&&hit.d)||'', s:(hit&&hit.s)||'', p:(hit&&hit.p)||w.pron||'', o:(hit&&hit.o)||'', r:ety, etyArr, y:(hit&&hit.y)||3, sy:(hit&&hit.sy)||w.syll||'', h:ety, bp:(hit&&hit.bp) }; }); }
function themeStat(id){ const ws=themeWords(id); const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length; return {total:ws.length, m, pct:ws.length?Math.round(m/ws.length*100):0}; }
/* is a lookup for q still on its way? (the Finder says "looking" rather than "no matches") */
function fullLooking(q){ if(Array.isArray(window.SB_FULL)) return false; q=nkey(q||''); if(q.length<2) return false;
  if(!window.SB_LIB) return !!(window.SB_LAZY&&SB_LAZY.state('library')==='loading');
  return SB_LIB.looking(q); }
function viewWordCardPop(){ const w=state.wordCard; if(!w) return '';
  const pr=pronFor(w.w)||{p:w.p||'',sy:w.sy||'',ps:w.ps||'',o:w.o||''};
  const OLAB={Latin:'Latin',Greek:'Greek',French:'French',Spanish:'Spanish',Italian:'Italian',German:'German',Arabic:'Arabic',Japanese:'Japanese','Old English':'Old English',Norse:'Old Norse',Hindi:'Hindi/Sanskrit'};
  const tag=(t)=>`<span style="font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);background:var(--chip);padding:3px 9px;border-radius:999px">${esc(t)}</span>`;
  const respell=pr&&pr.p?`<div style="font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:800;margin-bottom:2px">/ ${esc(pr.p)} /</div>`:'';
  const syl=pr&&pr.sy&&pr.sy!==nkey(w.w)?`<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:6px;overflow-wrap:anywhere;word-break:break-word">${esc(pr.sy)}</div>`:'';
  const chips=(pr&&(pr.ps||pr.o))?`<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0 12px">${pr.ps?tag(pr.ps):''}${pr.o?tag((OLAB[pr.o]||pr.o)+' origin'):''}</div>`:'<div style="height:6px"></div>';
  const sent=w.s?`<div style="margin-top:12px;text-align:left;background:var(--surface2);border-radius:12px;padding:11px 13px;font-size:13.5px;line-height:1.55;color:var(--text)"><span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:3px">In a sentence</span>${esc(w.s)}</div>`:'';
  return `<div style="position:fixed;inset:0;z-index:130;display:grid;place-items:center;padding:22px;background:rgba(20,12,4,.5)" data-act="wordCardClose">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;max-width:380px;width:100%;padding:24px 22px;text-align:center;box-shadow:0 20px 60px rgba(20,10,30,.5);animation:sb-pop .35s cubic-bezier(.2,1.5,.4,1) both;max-height:88vh;overflow:auto">
      <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:8px">${iconSVG('history',14,2.4)} Word of the hour</div>
      <div style="font-family:var(--display);font-weight:800;${hwStyle(w.w,30)};margin-bottom:${respell?'3px':'6px'}">${esc(w.w)}</div>
      ${respell}${syl}
      <button data-act="wordCardSay" data-arg="${escA(w.w)}" style="margin-top:4px;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--muted)">${iconSVG('volume',14)} Say it</button>
      ${chips}
      <div style="font-size:15px;color:var(--text);line-height:1.5;font-weight:500;text-align:left">${esc(w.d||'')}</div>
      ${sent}
      <div style="display:flex;gap:8px;margin-top:18px">
        <button data-act="wohPractise" data-arg="${escA(w.w)}" style="flex:1;padding:12px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Practise this word →</button>
        <button data-act="wordCardClose" style="padding:12px 16px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:14px">Close</button>
      </div>
    </div></div>`; }
/* ---- THE SET DECK -----------------------------------------------------------
   "The Word Atlas Practice should have a view-all-cards button on top that shows
   all cards in the set as toggled pop-up cards."

   Practice hands one card at a time, which is the right way to DRILL and the
   wrong way to get your bearings: a child part-way through set 3 had no way to
   see what set 3 actually holds without walking every card. This is the whole
   set at once — one row per word, tap a row and it opens into the full card the
   deck would have shown (respelling, both speaker buttons, meaning, sentence,
   the memory hook, IPA and part-of-speech chips). Several may stand open, so two
   words can be read against each other.

   It is a READING surface, deliberately. Nothing in here marks a word mastered
   or missed — "Go to this card" hands the child back to the drill at that word,
   and the drill does the scoring, exactly as it did before. */
/* iconSVG falls back to the GRID glyph for a name it does not carry, silently —
   so a chevron asked for by a name from the other icon set draws a little grid on
   every row and nothing reports it. This one is drawn here, in app2's stroke
   grammar, so it cannot go missing. */
function chevSVG(sz,up){ sz=sz||17; return `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block;transition:transform .2s;transform:rotate(${up?180:0}deg)"><path d="M6 9.5l6 6 6-6"/></svg>`; }
function setDeckCard(w,i,open){
  const pr=pronFor(w.w)||{}; const p=w.p||pr.p||'', sy=w.sy||pr.sy||'', ps=w.ps||pr.ps||'', o=w.o||pr.o||'';
  const ipa=(()=>{ try{ return (typeof ipaOf==='function')?(ipaOf(w.w,p)||''):''; }catch(e){ return ''; } })();
  const mast=state.luMastered&&state.luMastered[nkey(w.w)];
  const chip=(t,acc)=>`<span style="font-size:10.5px;font-weight:800;letter-spacing:.04em;padding:3px 9px;border-radius:999px;background:var(--chip);color:${acc?'var(--accent)':'var(--muted)'};white-space:nowrap">${t}</span>`;
  return `<div style="border:1px solid ${open?'var(--accent)':'var(--line)'};border-radius:16px;background:var(--bg2);overflow:hidden;${open?'box-shadow:var(--glow)':''}">
    <button data-act="deckTog" data-arg="${i}" aria-expanded="${open?'true':'false'}" style="width:100%;display:flex;align-items:center;gap:10px;padding:12px 13px;text-align:left;background:transparent;border:0">
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11px;font-weight:800;color:var(--muted);min-width:20px">${i+1}</span>
      <span style="flex:1;min-width:0;font-family:var(--display);font-weight:800;font-size:16px;color:var(--text);overflow-wrap:anywhere;word-break:break-word;line-height:1.25">${esc(w.w)}</span>
      ${mast?`<span style="color:var(--good);flex-shrink:0" title="Mastered">${iconSVG('check',15)}</span>`:''}
      <span style="flex-shrink:0;color:var(--accent);display:inline-flex">${chevSVG(17,open)}</span>
    </button>
    ${open?`<div style="padding:0 15px 15px;border-top:1px solid var(--line)">
      ${sy&&sy.toLowerCase()!==(w.w||'').toLowerCase()?`<div style="font-family:var(--display);font-size:12px;color:var(--accent);font-weight:700;letter-spacing:.04em;margin-top:11px;overflow-wrap:anywhere;word-break:break-word">${esc(sy)}</div>`:''}
      <div style="display:flex;gap:9px;margin:11px 0 2px">
        <button data-act="deckSay" data-arg="${escA(w.w)}" aria-label="Hear the word" title="Hear the word" style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',19)}</button>
        <button data-act="deckSaySlow" data-arg="${escA(w.w)}" aria-label="Hear it slowly" title="Hear it slowly" style="width:40px;height:40px;border-radius:50%;background:var(--surface2);color:var(--accent);border:1px solid var(--line);display:grid;place-items:center">${tortoiseSVG(21)}</button>
      </div>
      ${w.d?`<div style="font-size:14px;color:var(--text);line-height:1.5;margin-top:11px">${esc(w.d)}</div>`:''}
      ${w.s?`<div style="font-size:12.5px;color:var(--muted);line-height:1.55;margin-top:9px"><b style="color:var(--text)">Sentence.</b> ${esc(w.s)}</div>`:''}
      ${(w.r||w.h)?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:12.5px;color:var(--text);line-height:1.5;margin-top:10px;background:var(--chip);border-radius:10px;padding:8px 11px"><span style="color:var(--accent);margin-top:1px;flex-shrink:0">${iconSVG('bulb',14)}</span><span>${esc(w.r||w.h)}</span></div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:11px">${p?chip('/ '+esc(p)+' /',1):''}${ipa?chip(esc(ipa),1):''}${ps?chip(esc(ps)):''}${o?chip(esc(o)+' origin'):''}</div>
      <button data-act="deckGo" data-arg="${i}" style="margin-top:13px;width:100%;padding:10px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:7px">${iconSVG('arrow',15)} Go to this card</button>
    </div>`:''}
  </div>`; }
function viewSetDeck(){
  const ws=learnWords(); if(!state.deckOpen) return '';
  const op=state.deckCards||{}; const allOpen=ws.length&&ws.every((x,i)=>op[i]);
  const label=state.sessionLabel||'This set';
  return `<div style="position:fixed;inset:0;z-index:132;display:flex;flex-direction:column;background:rgba(20,12,4,.55)" data-act="deckClose">
    <div data-act="noop" style="background:var(--bg);margin:auto;width:min(560px,100%);max-height:92vh;border-radius:20px 20px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -20px 60px rgba(20,10,30,.4);animation:sb-pop .3s cubic-bezier(.2,1.4,.4,1) both">
      <div style="display:flex;align-items:center;gap:10px;padding:15px 16px 12px;border-bottom:1px solid var(--line);flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--display);font-weight:800;font-size:17px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</div>
          <div style="font-size:12px;color:var(--muted);font-weight:600;margin-top:2px">${ws.length} card${ws.length===1?'':'s'} · tap one to open it</div>
        </div>
        <button data-act="deckAll" style="flex-shrink:0;padding:8px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">${allOpen?'Close all':'Open all'}</button>
        <button data-act="deckClose" aria-label="Close" title="Close" style="flex-shrink:0;width:36px;height:36px;border-radius:50%;background:var(--surface2);border:1px solid var(--line);color:var(--text);display:grid;place-items:center">${iconSVG('close',17)}</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:13px 16px 20px;display:flex;flex-direction:column;gap:9px">
        ${ws.length?ws.map((w,i)=>setDeckCard(w,i,!!op[i])).join(''):'<div style="padding:26px;text-align:center;color:var(--muted);font-weight:600">No cards in this set yet.</div>'}
      </div>
    </div></div>`; }
/* ===== The Sound Alphabet — IPA trainer (Supercharge → Train) =====
   Bee study lists give pronunciations in phonetic notation; this teaches a speller to
   READ it. A Learn grid explains each IPA symbol with real bee words, then three drills:
   read a transcription and pick the word, pick the right transcription for a word, and
   find the word that carries a given sound. SB_IPA (sounds-data.js) holds 800+ bee words
   converted from CMUdict; audio is the library's Google-TTS clips via say(). */
const IPA_SOUNDS=[
  {s:'ə', n:'schwa — the lazy “uh” in a quiet syllable', eg:'the a in about'},
  {s:'æ', n:'flat a', eg:'cat, apple'}, {s:'ɑ', n:'open ah', eg:'father, calm'},
  {s:'ɛ', n:'short e', eg:'bed, said'}, {s:'ɪ', n:'short i', eg:'bit, gym'},
  {s:'i', n:'long ee', eg:'see, ski'}, {s:'ʊ', n:'short oo', eg:'book, put'},
  {s:'u', n:'long oo', eg:'moon, flute'}, {s:'ʌ', n:'stressed short u', eg:'cup, love'},
  {s:'ɔ', n:'aw', eg:'law, thought'}, {s:'ər', n:'er', eg:'her, doctor'},
  {s:'eɪ', n:'ay', eg:'day, eight'}, {s:'aɪ', n:'eye', eg:'my, night'},
  {s:'oʊ', n:'oh', eg:'go, boat'}, {s:'aʊ', n:'ow', eg:'now, loud'}, {s:'ɔɪ', n:'oy', eg:'boy, coin'},
  {s:'θ', n:'soft th (no buzz)', eg:'think, path'}, {s:'ð', n:'buzzy th', eg:'this, mother'},
  {s:'ʃ', n:'sh', eg:'ship, nation'}, {s:'ʒ', n:'zh', eg:'vision, measure'},
  {s:'tʃ', n:'ch', eg:'chip, catch'}, {s:'dʒ', n:'j', eg:'jump, giant'},
  {s:'ŋ', n:'ng', eg:'ring, think'}, {s:'j', n:'y', eg:'yes, music'},
  {s:'ˈ', n:'stress mark — the NEXT syllable is the loud one', eg:'ˈnɛməsɪs = NEM-uh-sis'} ];
let _ipaPool=null;
function ipaPool(){ if(_ipaPool) return _ipaPool; const IPA=window.SB_IPA||{}; const pool=[];
  const recs={}; for(const r of (SB_DATA&&SB_DATA.nsf)||[]) recs[nkey(r.w)]=r;
  for(const w in IPA){ if(!_hasOwn(IPA,w)) continue; const r=recs[w]; if(r) pool.push({ w:r.w, t:IPA[w], d:r.d||'' }); }
  return (_ipaPool=pool); }
const itShuffle=(a)=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; };
const IPA_CONFUSE=[['ɪ','i'],['ə','ʌ'],['ɛ','æ'],['ɑ','ɔ'],['ʊ','u'],['θ','ð'],['s','z'],['ʃ','tʃ'],['ʒ','dʒ'],['eɪ','ɛ'],['oʊ','ɔ'],['aɪ','eɪ'],['ˈ','ˌ']];
function ipaDecoys(t,n){ const out=new Set();
  for(const [a,b] of IPA_CONFUSE){ let i=t.indexOf(a); if(i>=0) out.add(t.slice(0,i)+b+t.slice(i+a.length));
    i=t.indexOf(b); if(i>=0) out.add(t.slice(0,i)+a+t.slice(i+b.length)); }
  return itShuffle([...out].filter(x=>x!==t)).slice(0,n); }
function itBuild(mode){ const pool=ipaPool(); if(pool.length<8) return null;
  const sh=itShuffle(pool.slice());
  let qs;
  if(mode==='sound'){
    const syms=itShuffle(IPA_SOUNDS.filter(x=>x.s!=='ˈ'&&pool.some(e=>e.t.indexOf(x.s)>=0)&&pool.filter(e=>e.t.indexOf(x.s)<0).length>=3)).slice(0,10);
    qs=syms.map(sym=>{ const yes=itShuffle(pool.filter(e=>e.t.indexOf(sym.s)>=0))[0];
      const no=itShuffle(pool.filter(e=>e.t.indexOf(sym.s)<0)).slice(0,3);
      const opts=itShuffle([yes].concat(no));
      return { sym, e:yes, opts:opts.map(x=>x.w), full:opts, ans:opts.indexOf(yes) }; });
  } else {
    qs=sh.slice(0,10).map(e=>{ let opts,correct;
      if(mode==='readipa'){ correct=e.w;
        const near=itShuffle(pool.filter(x=>x.w!==e.w&&(x.w[0]===e.w[0]||Math.abs(x.w.length-e.w.length)<=1))).slice(0,3);
        const fill=itShuffle(pool.filter(x=>x.w!==e.w&&near.indexOf(x)<0)).slice(0,3-near.length);
        opts=itShuffle([e.w].concat(near.concat(fill).map(x=>x.w))); }
      else { correct=e.t; let dec=ipaDecoys(e.t,3);
        if(dec.length<3) dec=dec.concat(itShuffle(pool.filter(x=>x.t!==e.t)).slice(0,3-dec.length).map(x=>x.t));
        opts=itShuffle([e.t].concat(dec)); }
      return { e, opts, ans:opts.indexOf(correct) }; });
  }
  return { mode, qs, i:0, score:0, picked:null, done:false }; }
// Explore — the hub behind the 5-item nav: Arcade, Concepts, Word Journeys, Theme Journeys.
/* ===== Idioms & Sayings — browse the figurative phrases (SB_COUNT.idioms) with honest origin stories ===== */
/* the Idioms page's count line — SB_COUNT's, and nothing while the library is on its way */
function fTxtOr(){ const t=countTxt('idioms'); return t?t+' phrases':''; }
const FIG_OC={documented:['📜 True story','#0F5C3E','#EAF7F0'], disputed:['🤔 Best guess','#8A5B00','#FFF3D6'], folk:['🧚 Folk tale — busted!','#6E1F30','#FBEAE8']};
function vocRevise(deck,c){ const v=vocProg(c); return (v&&v.revise[deck])||[]; }
/* The next set is locked while anything is waiting to be revised. */
function vocLocked(deck,c){ return vocRevise(deck,c).length>0; }
function figTabsBar(on){ const b=(k,l)=>`<button data-act="figTab" data-arg="${k}" style="flex:1;min-width:120px;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${on===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${l}</button>`;
  return `<div style="display:flex;gap:8px;margin-bottom:14px">${b('learn',iconSVG('book',15,2.2)+' Learn — deck by deck')}${b('browse',iconSVG('search',15,2.2)+' Browse all')}</div>`; }
function figLearnView(){ const S=state; const c=active();
  if(S.figDeck){ const items=figDeckItems(S.figDeck); const deck=figDecks().find(d=>d.id===S.figDeck)||{label:'Deck'};
    const i=Math.min(S.figIdx||0, items.length-1); const x=items[i]; if(!x) return figTabsBar('learn')+'<p style="color:var(--muted)">Empty deck.</p>';
    const oc=FIG_OC[x.oc]||FIG_OC.documented; const flip=!!S.figFlip;
    const back=`<div style="display:flex;flex-direction:column;gap:9px;text-align:left;animation:sb-pop .3s ease both">
        <div style="font-size:16px;font-weight:800">${esc(x.m)}</div>
        ${x.lit?`<div style="font-size:13px;color:var(--muted)"><b>Literally:</b> ${esc(x.lit)}</div>`:''}
        <div style="font-size:13px;color:var(--muted);line-height:1.55"><span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:99px;color:${oc[1]};background:${oc[2]}">${oc[0]}</span> ${esc(x.os)}</div>
        <div style="font-size:13px;font-style:italic;opacity:.85">“${esc(x.ex)}”</div>
        ${(x.eq&&x.eq.length)?`<div style="font-size:12px;color:var(--muted)"><b>Same idea elsewhere:</b> ${x.eq.map(e=>esc(e.lang)+': “'+esc(e.p)+'”').join(' · ')}</div>`:''}</div>`;
    return `<div style="max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">${backPill('figBackToDecks','All decks',null)}<span style="font-family:var(--display);font-weight:800;font-size:18px">${esc(deck.label)}</span><span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">${i+1} / ${items.length}</span></div>
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;background:var(--accent);width:${Math.round((i+1)/items.length*100)}%"></div></div>
      <button data-act="figFlip" style="display:block;width:100%;text-align:center;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--sh-rest);min-height:290px">
        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px"><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:var(--surface2);color:var(--muted)">${x.t}</span>${x.region&&x.region!=='global'?`<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;background:var(--chip);color:var(--accent)">🌍 ${esc(x.region)}</span>`:''}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(20px,4.6vw,28px);line-height:1.25;margin-bottom:12px">“${esc(x.p)}”</div>
        ${flip?back:`<div style="color:var(--muted);font-weight:700;font-size:13px;margin-top:26px">Tap the card to reveal the meaning &amp; story ▾</div>`}
      </button>
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:14px">
        <button data-act="figNav" data-arg="-1" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;${i===0?'opacity:.4':''}">← Back</button>
        <button data-act="figSay" data-arg="${escA(x.p+'. '+(flip?x.m:''))}" style="height:44px;padding:0 14px;border-radius:12px;background:var(--chip);color:var(--accent);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',17)} Hear it</button>
        <button data-act="figNav" data-arg="1" style="padding:12px 24px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);${i>=items.length-1?'opacity:.4':''}">Next →</button>
      </div></div>`;
  }
  const decks=figDecks().map(d=>{ const items=figDeckItems(d.id); const seen=Math.min(((c.figSeen||{})[d.id]||0)+1, items.length); const done=!!((c.figDone||{})[d.id]);
    return `<button data-act="figDeck" data-arg="${d.id}" style="text-align:left;background:var(--paper,var(--bg2));border:1.5px solid ${done?'var(--treasure,#F0B429)':'var(--line)'};border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:8px">
      <span style="font-family:var(--display);font-weight:800;font-size:15.5px">${d.label} ${done?'✓':''}</span>
      <span style="font-size:12px;color:var(--muted);font-weight:650">${items.length} cards${seen>1&&!done?' · resume at '+seen:''}</span>
      <span style="height:5px;border-radius:99px;background:var(--surface2);overflow:hidden"><span style="display:block;height:100%;background:${done?'var(--treasure,#F0B429)':'var(--accent)'};width:${done?100:Math.round(seen/Math.max(1,items.length)*100)}%"></span></span></button>`; }).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">${decks}</div>`;
}
function viewFigurative(){ const S=state;
  if((S.figTab||'learn')==='learn'){
    return `<div style="max-width:980px;margin:0 auto">
      ${pageHead('Idioms & Sayings', fTxtOr(), 'Learn deck by deck like Concepts — tap a card to reveal the meaning and its true origin story. Finish a deck for +5 🪙.')}
      ${figTabsBar('learn')}${figLearnView()}</div>`;
  }
  const q=(S.figQ||'').trim().toLowerCase(); const ty=S.figType||'all'; const th=S.figTheme||'all'; const world=!!S.figWorld;
  let list=figPool();
  if(ty!=='all') list=list.filter(x=>x.t===ty);
  if(th!=='all') list=list.filter(x=>(x.th||[]).indexOf(th)>=0);
  if(world) list=list.filter(x=>x.lit);
  if(q) list=list.filter(x=>x.p.toLowerCase().includes(q)||x.m.toLowerCase().includes(q));
  const PER=24; const pages=Math.max(1,Math.ceil(list.length/PER)); const pg=Math.min(S.figPage||0,pages-1);
  const themes=[...new Set(figPool().flatMap(x=>x.th||[]))].sort();
  const seg=(k,l)=>`<button data-act="figType" data-arg="${k}" style="padding:8px 14px;border-radius:999px;font-weight:800;font-size:12.5px;${(S.figType||'all')===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${l}</button>`;
  const cards=list.slice(pg*PER,pg*PER+PER).map(x=>{ const oc=FIG_OC[x.oc]||FIG_OC.documented;
    return `<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;align-items:flex-start;gap:8px"><span style="font-family:var(--display);font-weight:800;font-size:16.5px;line-height:1.2;flex:1">${esc(x.p)}</span>
        <button data-act="figSay" data-arg="${escA(x.p+'. '+x.m)}" title="Hear it" style="width:30px;height:30px;border-radius:9px;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG('volume',15)}</button></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:var(--surface2);color:var(--muted)">${x.t}</span>
        <span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;color:${oc[1]};background:${oc[2]}">${oc[0]}</span>
        ${x.region&&x.region!=='global'?`<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;background:var(--chip);color:var(--accent)">🌍 ${esc(x.region)}</span>`:''}</div>
      <div style="font-size:13.5px;font-weight:700">${esc(x.m)}</div>
      ${x.lit?`<div style="font-size:12px;color:var(--muted)"><b>Literally:</b> ${esc(x.lit)}</div>`:''}
      <div style="font-size:12px;color:var(--muted);line-height:1.5">${esc(x.os)}</div>
      <div style="font-size:12px;font-style:italic;color:var(--text);opacity:.85">“${esc(x.ex)}”</div>
      ${(x.eq&&x.eq.length)?`<div style="font-size:11.5px;color:var(--muted)"><b>Same idea elsewhere:</b> ${x.eq.map(e=>esc(e.lang)+': “'+esc(e.p)+'”'+(e.lit?' ('+esc(e.lit)+')':'')).join(' · ')}</div>`:''}
    </div>`; }).join('');
  return `<div style="max-width:980px;margin:0 auto">
    ${pageHead('Idioms & Sayings', (countTxt('idioms')?(fmtN(list.length)+' of '+countTxt('idioms')+' phrases'):''), 'Real meanings, true origin stories — and an honest flag when the famous story is a myth. Play the Idiom round in Word Quiz to test yourself.')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <input data-inp="figQ" data-fkey="figQ" value="${escA(S.figQ||'')}" placeholder="Search phrases or meanings…" style="flex:1;min-width:200px;padding:11px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px;outline:none">
      ${seg('all','All')}${seg('idiom','Idioms')}${seg('proverb','Proverbs')}${seg('simile','Similes')}
      <button data-act="figWorld" style="padding:8px 14px;border-radius:999px;font-weight:800;font-size:12.5px;${world?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">🌍 World</button>
      <select data-chg="figTheme" style="padding:9px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px">
        <option value="all">All themes</option>${themes.map(t=>`<option value="${t}" ${th===t?'selected':''}>${t}</option>`).join('')}</select>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px">${cards||'<p style="color:var(--muted)">No matches — try a different search.</p>'}</div>
    ${pages>1?`<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:16px">
      <button data-act="figPage" data-arg="${Math.max(0,pg-1)}" style="padding:9px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13px;${pg===0?'opacity:.4':''}">← Prev</button>
      <span style="font-size:13px;font-weight:700;color:var(--muted)">Page ${pg+1} / ${pages}</span>
      <button data-act="figPage" data-arg="${Math.min(pages-1,pg+1)}" style="padding:9px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13px;${pg>=pages-1?'opacity:.4':''}">Next →</button></div>`:''}
  </div>`;
}
const TY_FINGER={q:'p',a:'p',z:'p',w:'r',s:'r',x:'r',e:'m',d:'m',c:'m',r:'i',f:'i',v:'i',t:'i',g:'i',b:'i',y:'I',h:'I',n:'I',u:'I',j:'I',m:'I',i:'M',k:'M',',':'M',o:'R',l:'R','.':'R',p:'P',';':'P'};
const TY_FCOLOR={p:'#E8458C',r:'#F0A82A',m:'#13A892',i:'#3D7DF0',I:'#7B52E0',M:'#13A892',R:'#F0A82A',P:'#E8458C'};
function tyClean(t){ return String(t||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'').replace(/[^a-zA-Z ,.;']/g,' ').replace(/\s+/g,' ').trim(); }
function tySeqFor(l){ if(!l.dyn) return l.seq;
  if(l.dyn==='sent'){ const ws=gameWordsD({needSent:true}).filter(w=>w.s&&w.s.length>=25&&w.s.length<=130);
    const picked=sample(ws,2).map(w=>tyClean(w.s)).filter(x=>x.length>=20);
    if(picked.length) return picked.join(' ');
  }
  if(l.dyn==='mean'){ const ws=gameWordsD({needDef:true}).filter(w=>w.d&&w.d.length>=20&&w.d.length<=110);
    const picked=sample(ws,2).map(w=>{ try{ setTimeout(()=>say(w.w),150); }catch(e){} return tyClean(w.w+', '+w.d); }).filter(x=>x.length>=20);
    if(picked.length) return picked.join('. ')+'.';
  }
  const ws=gameWordsD().filter(w=>/^[a-z]+$/.test(w.w)&&w.w.length<=9); return sample(ws,8).map(w=>w.w).join(' ')||'bee hive honey spell word queen'; }
function tyStats(c){ const t=c.typing||(c.typing={bestWpm:0,bestAcc:0,tests:0,lessons:{}}); if(!t.lessons) t.lessons={}; return t; }
function tyProcess(ch){ const t=state.ty; if(!t||t.done) return;
  if(!t.startT){ t.startT=Date.now();
    if(t.mode==='test'){ t.timer=setInterval(()=>{ const tt=state.ty; if(!tt||tt.done){ return; }
      const left=60-Math.floor((Date.now()-tt.startT)/1000);
      const el=document.getElementById('ty-time'); if(el) el.textContent=Math.max(0,left)+'s';
      if(left<=0) tyFinish(); },250); } }
  const want=t.seq[t.pos];
  if(ch==='Backspace'){ if(t.pos>0){ t.pos--; const sp=document.getElementById('ty-c'+t.pos); if(sp){ sp.style.color='var(--muted)'; sp.style.background='none'; sp.style.borderBottom='2px solid transparent'; } tyCursor(); } return; }
  if(ch.length!==1) return;
  const ok=ch===want; if(!ok) t.errors++;
  const sp=document.getElementById('ty-c'+t.pos);
  if(sp){ sp.style.color=ok?'var(--good,#1f9d57)':'#fff'; sp.style.background=ok?'none':'#E0483C'; sp.style.borderRadius='3px'; }
  t.pos++; t.typed++;
  if(t.pos>=t.seq.length){ tyFinish(); return; }
  tyCursor();
  const pr=document.getElementById('ty-prog'); if(pr) pr.style.width=Math.round(t.pos/t.seq.length*100)+'%';
}
function tyCursor(){ const t=state.ty; for(let i=Math.max(0,t.pos-2);i<=Math.min(t.seq.length-1,t.pos+2);i++){ const sp=document.getElementById('ty-c'+i); if(sp) sp.style.borderBottom=(i===t.pos)?'2px solid var(--accent)':'2px solid transparent'; }
  document.querySelectorAll('[id^=ty-k-]').forEach(k=>{ k.style.outline='none'; k.style.transform='none'; });
  const want=(t.seq[t.pos]||'').toLowerCase(); const key=document.getElementById('ty-k-'+(want===' '?'space':want));
  if(key){ key.style.outline='3px solid var(--accent)'; key.style.transform='translateY(-2px)'; } }
function tyFinish(){ const t=state.ty; if(!t||t.done) return; t.done=true; tyStop();
  const mins=Math.max(0.05,(Date.now()-(t.startT||Date.now()))/60000);
  const correct=t.typed-t.errors;
  t.wpm=Math.max(0,Math.round((correct/5)/mins)); t.acc=t.typed?Math.round(correct/t.typed*100):0;
  const c=active(); const st=tyStats(c);
  if(t.mode==='test'){ st.tests=(st.tests||0)+1; const nb=t.wpm>(st.bestWpm||0);
    if(nb) st.bestWpm=t.wpm; if(t.acc>(st.bestAcc||0)) st.bestAcc=t.acc;
    t.coins=addCoins('stop');   /* a finished typing test is a finished lesson — speed is not a bigger wage */
    sfx(nb?'win':'level'); if(nb) burstConfetti(90);
  } else { st.lessons[t.lesson]=Math.max(st.lessons[t.lesson]||0, t.acc);
    st.sessions=(st.sessions||0)+1;
    if(t.lesson==='sent'||t.lesson==='mean') st.bank=(st.bank||0)+1;
    if(t.acc>=100) st.perfect=(st.perfect||0)+1;
    t.coins=addCoins('stop'); sfx('correct'); }
  save(); render(); }
function tyKeyboardHTML(){ const rows=['qwertyuiop','asdfghjkl;','zxcvbnm,.'];
  const key=(ch)=>{ const f=TY_FINGER[ch]; const col=f?TY_FCOLOR[f]:'#9A93AB';
    return `<button data-act="tyTap" data-arg="${escA(ch)}" id="ty-k-${esc(ch)}" style="width:clamp(26px,3.4vw,40px);height:clamp(34px,4vw,46px);border-radius:8px;background:var(--surface2);border:1px solid var(--line);border-bottom:3px solid ${col};font-weight:800;font-size:14px;color:var(--text);transition:.1s">${ch===';'?';':ch.toUpperCase()}</button>`; };
  return `<div style="display:flex;flex-direction:column;gap:5px;align-items:center;user-select:none">
    ${rows.map(r=>`<div style="display:flex;gap:5px">${r.split('').map(key).join('')}</div>`).join('')}
    <div style="display:flex;gap:5px"><button data-act="tyTap" data-arg=" " id="ty-k-space" style="width:min(46vw,300px);height:clamp(34px,4vw,44px);border-radius:8px;background:var(--surface2);border:1px solid var(--line);border-bottom:3px solid #9A93AB;font-weight:700;font-size:11px;color:var(--muted)">SPACE — thumbs</button></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px;font-size:10.5px;font-weight:700;color:var(--muted)">
      ${[['#E8458C','pinky'],['#F0A82A','ring'],['#13A892','middle'],['#3D7DF0','left index'],['#7B52E0','right index']].map(x=>`<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:${x[0]}"></span>${x[1]}</span>`).join('')}
    </div></div>`; }
function viewTyping(){ const S=state; const c=active(); const st=tyStats(c);
  if(S.ty && !S.ty.done){ const t=S.ty;
    const chars=t.seq.split('').map((ch,i)=>`<span id="ty-c${i}" style="color:${i<t.pos?'var(--good,#1f9d57)':'var(--muted)'};border-bottom:2px solid ${i===t.pos?'var(--accent)':'transparent'}">${ch===' '?'&nbsp;':esc(ch)}</span>`).join('');
    return `<div style="max-width:760px;margin:0 auto;text-align:center">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">${backPill('tyExit','Typing',null)}<span style="font-family:var(--display);font-weight:800;font-size:18px">${esc(t.title)}</span><span style="margin-left:auto;font-family:var(--mono);font-size:13px;color:var(--muted)">${t.mode==='test'?`<span id="ty-time">60s</span>`:''}</span></div>
      ${t.tip?`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">💡 ${esc(t.tip)}</p>`:''}
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:16px"><div id="ty-prog" style="height:100%;background:var(--accent);width:${Math.round(t.pos/t.seq.length*100)}%"></div></div>
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:20px 22px;font-family:var(--mono);font-size:clamp(18px,3.4vw,26px);letter-spacing:.06em;line-height:2;word-break:break-word;text-align:left;margin-bottom:16px;box-shadow:var(--sh-rest)">${chars}</div>
      ${tyKeyboardHTML()}
      <p style="font-size:12px;color:var(--muted);margin-top:12px">Type on your keyboard${'ontouchstart' in window?' or tap the keys above':''} — ${t.mode==='test'?'the 60-second clock starts on your first key!':'accuracy first, speed follows.'}</p>
    </div>`; }
  if(S.ty && S.ty.done){ const t=S.ty;
    return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .35s ease both">
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow)">
        <div style="font-size:44px">${t.mode==='test'?(t.wpm>=(st.bestWpm||0)?'🏆':'⌨️'):'✅'}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:26px;margin:6px 0 14px">${t.mode==='test'?(t.wpm>=st.bestWpm?'New best!':'Test complete!'):'Exercise complete!'}</h2>
        <div style="display:flex;gap:14px;justify-content:center;margin-bottom:14px">
          <div style="background:var(--surface2);border-radius:14px;padding:14px 22px"><div style="font-family:var(--display);font-weight:800;font-size:30px;color:var(--accent)">${t.wpm}</div><div style="font-size:11px;color:var(--muted);font-weight:800">WPM</div></div>
          <div style="background:var(--surface2);border-radius:14px;padding:14px 22px"><div style="font-family:var(--display);font-weight:800;font-size:30px;color:${t.acc>=90?'var(--good)':'var(--text)'}">${t.acc}%</div><div style="font-size:11px;color:var(--muted);font-weight:800">ACCURACY</div></div>
        </div>
        <div style="font-size:13px;font-weight:800;color:var(--treasure-deep,#8A5B00)">+${t.coins} 🪙</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
          <button data-act="${t.mode==='test'?'tyTest':'tyStart'}" ${t.mode==='test'?'':`data-arg="${t.lesson}"`} style="padding:13px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">${t.mode==='test'?'Test again →':'Once more →'}</button>
          <button data-act="tyExit" style="padding:13px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">All lessons</button>
        </div></div></div>`; }
  const lessons=TY_LESSONS.map((l,i)=>{ const acc=st.lessons[l.id];
    return `<button data-act="tyStart" data-arg="${l.id}" style="text-align:left;background:var(--paper,var(--bg2));border:1.5px solid ${acc>=90?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:13px 15px;display:flex;align-items:center;gap:12px">
      <span style="width:34px;height:34px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center;font-weight:800;font-size:13px;flex-shrink:0">${i+1}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:14px">${esc(l.name)}${l.dyn?' <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);background:var(--treasure-tint,#FFF3D6);padding:2px 6px;border-radius:99px;vertical-align:middle">word bank</span>':''}</span>
      <span style="display:block;font-size:11.5px;color:var(--muted);font-weight:650">${acc!=null?('best accuracy '+acc+'%'+(acc>=90?' ✓':'')):'not tried yet'}</span></span></button>`; }).join('');
  return `<div style="max-width:920px;margin:0 auto">
    ${pageHead('Typing Trainer','⌨️ '+ (st.bestWpm?('best '+st.bestWpm+' WPM · '+st.bestAcc+'% acc'):'online bees are typed!'),'Learn to touch-type finger by finger — then race the 60-second Typing Test. NSF online rounds are typed, so speed is real bee prep.',
      `<button data-act="tyTest" style="padding:10px 18px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('timer',14,2.4)} 60-second Typing Test →</button>`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px">${lessons}</div>
  </div>`;
}
/* ===== Vocabulary — study decks + card player (NSF vocabulary-bee style) ===== */
/* The check screen. Multiple choice on meaning, one question per word in the set, with the
   word spoken aloud — the same shape as a real vocabulary round. Keyboard 1-4 and Enter
   work alongside tapping, because every screen in this app needs both. */
/* ---- Vocabulary shell: the Practice layout, driven by the vocabulary ladder --------
   Same List Dock (one big "now studying" tile with a progress ring, small tiles to switch,
   "+ Add a list" opening the SAME chooser), same tab bar, same all-words panel. The only
   differences are the ones that must differ: the ring shows the vocabulary set rather than
   the spelling level, and picking a list here writes c.vocabList, never c.activeList — so
   choosing what to study for meaning cannot move what is being trained for spelling. */
function vocListKey(){ const c=active(); const want=c.vocabList||c.activeList||'journey';
  const cats=vocListCats(); if(!cats.length) return want;
  return cats.some(x=>x.key===want) ? want : cats[0].key; }
function vocDeckOfList(){ return 'list:'+vocListKey(); }
/* Lists worth offering: anything in the catalogue with enough defined words to build a
   fair 4-option quiz. Falls back to the level decks when a list has none. */
function vocDockKeys(){ const c=active(); const key=vocListKey();
  const usable=new Set(vocListCats().map(x=>x.key));
  const CORE={journey:1,review:1,missed:1};
  const pinned=c.pinnedLists||{};
  let extras=Object.keys(pinned).filter(k=>!CORE[k]&&pinned[k]&&usable.has(k));
  if(!CORE[key]&&extras.indexOf(key)<0) extras.push(key);
  return ['journey',...extras,'review','missed']
    .filter((k,i,a)=>a.indexOf(k)===i)
    .filter(k=>usable.has(k)||k===key); }
function vocDockColor(k){ if(k==='journey') return '#7C5CFF'; if(k==='review') return '#E0922E'; if(k==='missed') return '#DC5B7E';
  if(String(k).indexOf('built_')===0) return '#13A892';
  let h=0; for(const ch of String(k)) h=(h*31+ch.charCodeAt(0))>>>0;
  return ['#7C5CFF','#E0922E','#DC5B7E','#13A892','#3D7DF0','#B14FC4','#4F9E6A','#F0703C'][h%8]; }
function vocHeatmap(){ const deck=state.vocDeck; const words=state.vocWords||[];
  if(!deck||!words.length) return '';
  const v=vocProg(active());
  const known=new Set((v.known&&v.known[deck])||[]);
  const missSet=new Set(((v.miss&&v.miss[deck])||[]).concat(vocRevise(deck)));
  const reveal=!!state.vocHeatReveal;
  const curIdx=(state.vocTab||'cards')==='cards'&&!state.vocCheck?Math.min(state.vocIdx||0,words.length-1):-1;
  const N=words.length;
  const m=words.filter(w=>known.has(nkey(w.w))).length;
  const missN=words.filter(w=>!known.has(nkey(w.w))&&missSet.has(nkey(w.w))).length;
  const pct=Math.round(m/N*100);
  const cells=words.map((w,i)=>{ const k=nkey(w.w); const ok=known.has(k); const miss=!ok&&missSet.has(k);
    const isCur=i===curIdx;
    const bg=ok?'var(--good)':(miss?'var(--bad)':'var(--surface2)'); const fg=(ok||miss)?'#fff':'var(--muted)';
    if(!reveal) return `<span title="${ok?'meaning known':(miss?'to revise':'not asked yet')}" style="width:22px;height:22px;border-radius:6px;background:${bg};display:inline-block;${isCur?'box-shadow:0 0 0 2px var(--accent)':''}"></span>`;
    return `<button data-act="vocJump" data-arg="${i}" title="open this card" style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;max-width:100%;min-width:0;text-align:left;overflow-wrap:anywhere;word-break:break-word;line-height:1.25;color:${fg};background:${bg};${isCur?'box-shadow:0 0 0 2px var(--accent)':''}">${esc(w.w)}</button>`;
  }).join('');
  const legend=[['var(--good)','Known'],['var(--bad)','To revise'],['var(--surface2)','New']].map(([c2,l])=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="width:11px;height:11px;border-radius:6px;background:${c2};display:inline-block"></span>${l}</span>`).join('');
  const toggle=`<button data-act="vocToggleHeat" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px">${iconSVG(reveal?'eyeoff':'eye',15)} ${reveal?'Hide words':'Tap to reveal'}</button>`;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:14px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:11px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px">Live progress · meanings</div>
      <div style="flex:1;min-width:90px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--good);width:${pct}%"></div></div>
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:800;color:var(--muted)">${m}/${N} known${missN?(' · '+missN+' to revise'):''}</span>
      ${toggle}</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:10px">${cells}</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap">${legend}</div>
  </div>`; }
function vocShell(inner){ const c=active(); const key=vocListKey(); const deck=vocDeckOfList();
  const cat=vocListCat(key);
  const topBar=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
    ${backPill('goHome','Home',null)}
    <span style="font-family:var(--display);font-weight:800;font-size:15px">Vocabulary</span>
    <span style="font-size:12px;color:var(--muted);font-weight:650">word → meaning</span>
    <span style="margin-left:auto;font-size:11.5px;color:var(--muted);font-weight:700">Vocabulary levels are separate from spelling</span></div>`;
  const words=(state.vocWords||[]);
  const wordsPanel = state.vocWordsOpen ? `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px;animation:sb-rise .3s ease both">
      <div style="font-family:var(--display);font-weight:800;font-size:14px;margin-bottom:9px">This set · ${words.length} words</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px">${words.map(w=>
        `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:10px 12px">
          <div style="font-family:var(--display);font-weight:800;font-size:13.5px;overflow-wrap:anywhere">${esc(w.w)}</div>
          <div style="font-size:11.5px;color:var(--muted);font-weight:650;line-height:1.4;margin-top:2px">${esc(trunc(w.d||'',90))}</div></div>`).join('')}</div></div>` : '';
  /* Order: the activity first, list management last. The tabs and whatever they render sit
     right at the top so a speller lands on the cards/quiz; the List Dock (and its all-words
     panel, whose toggle lives in the dock) sits underneath the Cards/Practise/Check area. */
  return `<div style="max-width:980px;margin:0 auto">${topBar}${vocTabs()}${inner}${vocDock()}${wordsPanel}${vocHeatmap()}</div>`; }
function vocDock(){ const c=active(); const key=vocListKey(); const deck=vocDeckOfList();
  const cat=vocListCat(key); const total=cat?cat.n:0;
  const lv=vocLevel(deck), rv=vocRevise(deck).length;
  const set=(state.vocWords||[]).length;
  const donePct=total?Math.min(100,Math.round((lv*VOC_SET)/total*100)):0;
  const bigC=vocDockColor(key);
  const label=(k)=> k==='journey'?journeyName().replace(/^The /,''):listLabel(k).split(' · ')[0];
  const bigTile=`<div style="flex:1.5;min-width:220px;display:flex;align-items:center;gap:13px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,${bigC},color-mix(in srgb,${bigC} 62%,#1c1030 38%));color:#fff">
      <div style="width:54px;height:54px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:conic-gradient(#fff ${donePct}%,rgba(255,255,255,.25) 0)">
        <span style="width:42px;height:42px;border-radius:50%;background:${bigC};display:grid;place-items:center;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:900;font-size:15px">${lv+1}</span></div>
      <div style="min-width:0"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.11em;text-transform:uppercase;opacity:.85">Studying meanings</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.12;text-shadow:0 1px 4px rgba(0,0,0,.16);overflow-wrap:anywhere">${esc(label(key))}</div>
        <div style="font-size:12px;font-weight:700;opacity:.92">Set ${lv+1} · ${set} words${total?(' of '+fmtN(total)):''}${rv?(' · '+rv+' to revise'):''}</div></div></div>`;
  const smallTiles=vocDockKeys().filter(k=>k!==key).map(k=>{ const cc=vocDockColor(k); const kd='list:'+k;
    return `<button data-act="vocSelectList" data-arg="${escA(k)}" title="Study this list's meanings" style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
      <span style="width:27px;height:27px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,${cc},color-mix(in srgb,${cc} 70%,#1c1030 30%))"></span>
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:12px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(label(k))}</span>
        <span style="display:block;font-size:11px;color:var(--muted);font-weight:700">Set ${vocLevel(kd)+1}${vocRevise(kd).length?(' · '+vocRevise(kd).length+' to revise'):''}</span></span></button>`; }).join('');
  const addBtn=`<button data-act="vocSetupOpen" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px dashed var(--line);background:transparent;color:var(--muted)">＋ Add a list</button>`;
  const wordsBtn=`<button data-act="vocToggleWords" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid var(--line);background:var(--surface2);color:var(--text)">${state.vocWordsOpen?'Hide':'All'} words in this set</button>`;
  const newBtn=`<button data-act="vocNewSet" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid var(--line);background:var(--surface2);color:${vocLocked(deck)?'var(--fix,#C4453C)':'var(--text)'}">${vocLocked(deck)?('Revise '+rv+' first'):('Next '+VOC_SET+' new words')}</button>`;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px">
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:stretch">${bigTile}<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:7px;justify-content:center">${smallTiles||'<span style="font-size:12px;color:var(--muted);font-weight:650">Add a list to switch between them</span>'}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${addBtn}${wordsBtn}${newBtn}</div>
  </div>`; }
/* Same three-tab bar shape as the Practice. */
function vocTabs(){ const t=state.vocTab||'cards';
  const tab=(k,l)=>`<button data-act="vocSetTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:10px;font-weight:800;font-size:13px;${t===k?'background:var(--bg2);color:var(--text);box-shadow:var(--sh-rest)':'color:var(--muted)'}">${l}</button>`;
  return `<div style="display:flex;gap:6px;background:var(--surface2);border-radius:12px;padding:5px;margin-bottom:14px">${tab('cards',iconSVG('cards',15,2.2)+' Cards')}${tab('practice',iconSVG('target',15,2.2)+' Practise')}${tab('check','✓ Check')}</div>`; }
function viewVocCheck(){ const g=state.vocCheck; if(!g) return '';
  const total=g.qs.length;
  if(g.done){
    const pct=Math.round((g.pct||0)*100);
    if(g.mode==='practice'){
      return `<div style="max-width:560px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
        <div style="width:120px;height:120px;margin:0 auto 4px">${myAvatar(120)}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:6px 0">${g.right} of ${total} · ${pct}%</h2>
        <div style="height:10px;border-radius:99px;background:var(--surface2);overflow:hidden;margin:12px auto 8px;max-width:320px"><div style="height:100%;width:${pct}%;background:var(--accent)"></div></div>
        <p style="color:var(--muted);font-size:14px;line-height:1.55">Practice run — nothing counted, nothing unlocked. Play it as many times as you like, then take the check when you are ready.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <button data-act="vocCheck" data-arg="practice" style="padding:13px 20px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800">↺ Practise again</button>
          <button data-act="vocCheck" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800">Take the check →</button>
          <button data-act="vocCheckClose" style="padding:13px 20px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Back to the cards</button>
        </div></div>`; }
    if(g.mode==='revise'){
      const left=g.remaining||0;
      return `<div style="max-width:560px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
        <div style="font-size:44px">${left?'💪':'🎉'}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:8px 0">${left?'Getting there':'Revision cleared!'}</h2>
        <p style="color:var(--muted);font-size:14px;line-height:1.55">You cleared <b>${g.cleared||0}</b> of ${total}.
          ${left?`<b>${left}</b> still to go — clear them and your next set of new words unlocks.`:'Your next set of new words is unlocked.'}</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          ${left?`<button data-act="vocCheck" data-arg="revise" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800">Revise the last ${left} →</button>`
                :`<button data-act="vocNewSet" style="padding:13px 20px;border-radius:13px;background:var(--good,#1f9d57);color:#fff;font-weight:800">Next ${VOC_SET} new words →</button>`}
          <button data-act="vocCheckClose" style="padding:13px 20px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Back to the cards</button>
        </div></div>`;
    }
    const passed=!!g.passed; const missed=g.missed.length;
    return `<div style="max-width:560px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
      <div style="font-size:44px">${passed?'🏆':'📚'}</div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:8px 0">${g.right} of ${total} · ${pct}%</h2>
      <div style="height:10px;border-radius:99px;background:var(--surface2);overflow:hidden;margin:14px 0 6px"><div style="height:100%;width:${pct}%;background:${passed?'var(--good,#1f9d57)':'var(--bad,#C4453C)'}"></div></div>
      <div style="font-size:11.5px;color:var(--muted);font-weight:700;margin-bottom:12px">80% unlocks the next set</div>
      <p style="color:var(--muted);font-size:14px;line-height:1.55">${passed
        ? (missed?`Passed — next set unlocked. The ${missed} you missed will come back in it, so you meet them again.`
                 :'A clean sweep. Next set unlocked.')
        : `Not quite 80% yet. Revise the <b>${missed}</b> you missed and the next set unlocks — no new words until then.`}</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
        ${passed?`<button data-act="vocNewSet" style="padding:13px 20px;border-radius:13px;background:var(--good,#1f9d57);color:#fff;font-weight:800">Next ${VOC_SET} new words →</button>`
                :`<button data-act="vocCheck" data-arg="revise" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800">Revise the ${missed} →</button>`}
        <button data-act="vocCheckClose" style="padding:13px 20px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Back to the cards</button>
      </div></div>`;
  }
  const q=g.qs[g.i]; if(!q) return '';
  const picked=g.picked;
  const choice=(d,idx)=>{ const isPicked=picked===idx; const isAns=d===q.answer;
    const bg=picked==null?'var(--surface2)':(isAns?'var(--mastered-tint,#E1F4E8)':(isPicked?'var(--fix-tint,#FBE9E7)':'var(--surface2)'));
    const bd=picked==null?'var(--line)':(isAns?'var(--good,#1f9d57)':(isPicked?'var(--fix,#C4453C)':'var(--line)'));
    return `<button data-act="vocPick" data-arg="${idx}" ${picked!=null?'disabled':''} style="display:block;width:100%;text-align:left;padding:13px 15px;border-radius:13px;background:${bg};border:1.5px solid ${bd};font-weight:650;font-size:14px;line-height:1.45;margin-bottom:9px;color:var(--text)">
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;color:var(--muted);margin-right:9px">${idx+1}</span>${esc(maskTxt(d,q.w.w))}</button>`; };
  return `<div style="max-width:600px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px">
      ${backPill('vocCheckClose','Cards',null)}
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:800;color:var(--accent)">${g.mode==='revise'?'REVISION':g.mode==='practice'?'PRACTICE':'CHECK'} ${g.i+1}/${total}</span>
      <span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:800;color:var(--good,#1f9d57)">✓ ${g.right}</span></div>
    <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:8px"><div style="height:100%;background:var(--accent);width:${Math.round((g.i+1)/total*100)}%"></div></div>
    <div style="font-size:11.5px;color:var(--muted);font-weight:650;text-align:center;margin-bottom:12px">${g.mode==='practice'?'Practice — this run does not count towards anything':g.mode==='revise'?'Clear these and your next set of new words unlocks':'80% unlocks your next set of new words'}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:var(--glow);text-align:center;margin-bottom:14px">
      <div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">What does it mean?</div>
      <div style="font-family:var(--display);font-weight:800;${hwStyle(q.w.w,32)}">${esc(q.w.w)}</div>
      <button data-act="vocSayQ" style="margin-top:11px;padding:8px 15px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('volume',15)} Hear it</button>
    </div>
    <div>${q.choices.map(choice).join('')}</div>
    ${picked!=null?`<button data-act="vocNext" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-top:4px">${g.i>=total-1?'See your score →':'Next word →'}</button>`
      :`<p style="text-align:center;font-size:11.5px;color:var(--muted);margin-top:8px">Tap a meaning, or press 1–4</p>`}
  </div>`; }
function viewVocab(){ const S=state; const c=active();
  /* Land straight on the current list, exactly as the Practice lands on the list being
     trained. There is no separate "pick a deck" screen any more — the List Dock does the
     switching and "+ Add a list" opens the same chooser the coach uses. */
  /* Derive the opening deck inline. Calling app.vocDeck() here would re-enter render()
     from inside a view and leave this pass reading stale state. */
  if(!S.vocDeck){ const k=vocDeckOfList();
    if(vocListCat(vocListKey())){ S.vocDeck=k; S.vocWords=vocCurrentSet(k); S.vocIdx=0; S.vocFlip=false; } }
  if(S.vocCheck) return vocShell(viewVocCheck());
  if(S.vocDeck){ const ws=S.vocWords||[]; const i=Math.min(S.vocIdx||0,ws.length-1); const w=ws[i]; if(!w) return '<p style="color:var(--muted)">No words.</p>';
    const flip=!!S.vocFlip;
    const back=`<div style="display:flex;flex-direction:column;gap:10px;text-align:left;animation:sb-pop .3s ease both">
        <div style="font-size:16.5px;font-weight:800">${esc(w.d||'—')}</div>
        ${w.s?`<div style="font-size:13.5px;font-style:italic;color:var(--muted);line-height:1.5">“${blankHTML(w.s,w.w)}”</div>`:''}
        ${w.o?`<div style="font-size:12px;color:var(--muted)"><b>Origin:</b> ${esc(w.o)}${w.r?' · '+esc(w.r):''}</div>`:''}</div>`;
    return vocShell(`<div style="max-width:640px;margin:0 auto">
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;background:var(--accent);width:${Math.round((i+1)/ws.length*100)}%"></div></div>
      <button data-act="vocFlip" style="display:block;width:100%;text-align:center;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--sh-rest);min-height:270px">
        <div style="font-family:var(--display);font-weight:800;letter-spacing:.02em;${hwStyle(w.w,34)};margin-bottom:6px">${esc(w.w)}</div>
        ${w.p?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted);margin-bottom:4px">${esc(w.p)}</div>`:''}
        ${w.sy?`<div style="font-size:12px;color:var(--muted);margin-bottom:10px">${esc(w.sy)}</div>`:''}
        ${flip?back:`<div style="color:var(--muted);font-weight:700;font-size:13px;margin-top:22px">Tap to reveal the meaning ▾</div>`}
      </button>
      <div class="voc-nav" style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:14px">
        <button data-act="vocNav" data-arg="-1" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;${i===0?'opacity:.4':''}">← Back</button>
        <button data-act="vocSayWord" style="height:44px;padding:0 14px;border-radius:12px;background:var(--chip);color:var(--accent);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',17)} Hear it</button>
        <button data-act="vocSayCard" title="Hear the word and its meaning" style="height:44px;padding:0 14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',15)} + meaning</button>
        <button data-act="vocNav" data-arg="1" style="padding:12px 24px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);${i>=ws.length-1?'opacity:.4':''}">Next →</button>
      </div>

      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button data-act="wqStart" data-arg="vocab" style="padding:10px 16px;border-radius:10px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12.5px">${iconSVG('target',14,2.4)} Play the Vocabulary round →</button>
      </div></div>`);
  }
  const deckBtn=(k,label,sub)=>`<button data-act="vocDeck" data-arg="${k}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:6px">
      <span style="font-family:var(--display);font-weight:800;font-size:15.5px">${label}</span><span style="font-size:12px;color:var(--muted);font-weight:650">${sub}</span>
      ${(()=>{ /* each deck keeps its own vocabulary level and revision queue */
        const _lv=vocLevel(k), _rv=vocRevise(k).length;
        if(!_lv&&!_rv) return '';
        return `<span style="display:inline-flex;align-items:center;gap:7px;margin-top:7px">
          <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--chip);color:var(--accent)">Set ${_lv+1}</span>
          ${_rv?`<span style="font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:999px;background:var(--fix-tint,#FBE9E7);color:var(--fix,#C4453C)">${_rv} to revise</span>`:''}</span>`; })()}
      </button>`;
  const themeDecks=myThemes().slice(0,6).map(t=>deckBtn('th:'+t.id,'🗂️ '+esc(t.label),VOC_SET+' words from this theme')).join('');
  return `<div style="max-width:980px;margin:0 auto">
    ${pageHead('Vocabulary','word → meaning','Study a set of '+VOC_SET+' the vocabulary-bee way — hear the word, guess the meaning, flip the card. Then check yourself: score 80% and the next set of new words unlocks, or revise the ones you missed first. Vocabulary levels up on its own — your spelling levels are separate.',
      `<button data-act="wqStart" data-arg="vocab" style="padding:9px 16px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('target',14,2.4)} Vocabulary round →</button>`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
      ${deckBtn('mix','✨ My level mix','20 fresh words from your list, at your level')}
      ${deckBtn('easy','🌱 Easy','genuinely easy words — a friendly warm-up')}
      ${deckBtn('medium','🌿 Medium','right around your Bee Band')}
      ${deckBtn('hard','🔥 Hard','a band above you — the stretch zone')}
      ${deckBtn('champ','👑 Champ','real championship-tier words')}
      ${themeDecks}
    </div>
    ${(()=>{ /* every list the speller has — curated, NSF, origin, built, pasted or AI —
                is also a vocabulary deck, each with its own vocabulary level */
      const cats=vocListCats(); if(!cats.length) return '';
      return `<div style="margin-top:26px">
        <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:4px">
          <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:0">Your word lists</h3>
          <span style="font-size:12px;color:var(--muted);font-weight:650">${cats.length} list${cats.length===1?'':'s'} with meanings — study any of them as vocabulary</span>
        </div>
        <p style="font-size:12px;color:var(--muted);font-weight:650;margin:0 0 12px;line-height:1.5">Each list keeps its own vocabulary level, and none of them touch your spelling levels.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
          ${cats.map(cat=>deckBtn('list:'+cat.key,'📋 '+esc(cat.label), fmtN(cat.n)+' words with meanings')).join('')}
        </div></div>`; })()}</div>`;
}
/* ---- Quotes: kid-friendly quotations from famous people (SB_QUOTES) ---- */
/* Labels are words; each carries an icon from the family SVG set (never an emoji — standard §9). */
const QUOTE_CAT_LABEL={ courage:'Courage', kindness:'Kindness', perseverance:'Never give up',
  learning:'Learning', dreams:'Dreams', friendship:'Friendship', honesty:'Honesty',
  curiosity:'Curiosity', teamwork:'Teamwork', imagination:'Imagination', gratitude:'Gratitude',
  leadership:'Leadership', happiness:'Happiness', hardwork:'Hard work', believe:'Believe in yourself',
  creativity:'Creativity', nature:'Nature', change:'Making a difference', wisdom:'Wisdom',
  humor:'Fun & humor', science:'Science', sports:'Sports', reading:'Reading & words',
  poetry:'Poems & plays' };
const QUOTE_CAT_IC={ courage:'shield', kindness:'heart', perseverance:'steps', learning:'book', dreams:'star', friendship:'users',
  honesty:'check', curiosity:'search', teamwork:'hive', imagination:'palette', gratitude:'heart', leadership:'crown', happiness:'sun',
  hardwork:'pencil', believe:'star', creativity:'bulb', nature:'sprout', change:'retry', wisdom:'bulb', humor:'spark', science:'bolt',
  sports:'trophy', reading:'book', poetry:'quote' };
function quoteCatLabel(k){ return QUOTE_CAT_LABEL[k]||(String(k||'').charAt(0).toUpperCase()+String(k||'').slice(1)); }
function quoteCatChip(k){ return (QUOTE_CAT_IC[k]?iconSVG(QUOTE_CAT_IC[k],14,2.3)+' ':'')+esc(quoteCatLabel(k)); }
function quoteCats(){ const all=(window.SB_QUOTES||[]); const seen={}; const ord=Object.keys(QUOTE_CAT_LABEL);
  all.forEach(x=>{ if(x.c) seen[x.c]=1; }); const inData=ord.filter(k=>seen[k]); Object.keys(seen).forEach(k=>{ if(inData.indexOf(k)<0) inData.push(k); }); return inData; }
// render a quote's text, highlighting its "hard" words as tappable chips that open a word card.
function renderQuoteHTML(x){ let html=esc(x.q).replace(/\n/g,'<br>');
  const hard=x.hard||[]; const map={}; state._qHard=map;
  hard.forEach(h=>{ const w=(typeof h==='string')?h:h.w; const d=(typeof h==='string')?'':(h.d||''); if(!w) return; const key=w.toLowerCase(); map[key]={w:w,d:d};
    // wrap the first whole-word match (case-insensitive) that isn't already inside a chip
    const re=new RegExp('(^|[^A-Za-z<])('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![A-Za-z])','i');
    html=html.replace(re,(m,pre,word)=>pre+'<button data-act="qWord" data-arg="'+escA(key)+'" class="q-hard">'+esc(word)+'</button>'); });
  return html; }
function viewQuotesWordPop(){ const wp=state.qWord; if(!wp) return '';
  const pr=pronFor(wp.w); const OLAB={Latin:'Latin',Greek:'Greek',French:'French',Spanish:'Spanish',Italian:'Italian',German:'German',Arabic:'Arabic',Japanese:'Japanese','Old English':'Old English',Norse:'Old Norse',Hindi:'Hindi/Sanskrit'};
  const respell=pr&&pr.p?`<div style="font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:800;letter-spacing:.02em;margin-bottom:2px">/ ${esc(pr.p)} /</div>`:'';
  const syl=pr&&pr.sy&&pr.sy!==wp.w?`<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:8px">${esc(pr.sy)}</div>`:(respell?'<div style="margin-bottom:8px"></div>':'');
  const tag=(t)=>`<span style="font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);background:var(--chip);padding:3px 9px;border-radius:999px">${esc(t)}</span>`;
  const chips=pr?`<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">${pr.ps?tag(pr.ps):''}${pr.o?tag((OLAB[pr.o]||pr.o)+' origin'):''}</div>`:'';
  return `<div style="position:fixed;inset:0;z-index:130;display:grid;place-items:center;padding:22px;background:rgba(20,12,4,.5)" data-act="qWordClose">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;max-width:360px;width:100%;padding:24px 22px;text-align:center;box-shadow:0 20px 60px rgba(20,10,30,.5);animation:sb-pop .35s cubic-bezier(.2,1.5,.4,1) both">
      <div style="display:inline-flex;width:52px;height:52px;border-radius:14px;background:var(--chip);color:var(--accent);align-items:center;justify-content:center;margin-bottom:8px">${iconSVG('book',26)}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:26px;margin-bottom:${respell?'2px':'6px'}">${esc(wp.w)}</div>
      ${respell}${syl}
      <button data-act="qWordSay" data-arg="${escA(wp.w)}" style="margin-bottom:12px;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--muted)">${iconSVG('volume',14)} Say it</button>
      ${chips}
      <div style="font-size:15px;color:var(--text);line-height:1.5;font-weight:500">${esc(wp.d||'A tricky word — say it aloud and try to spell it!')}</div>
      <button data-act="qWordClose" style="margin-top:18px;width:100%;padding:12px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Got it ✓</button>
    </div></div>`; }
function viewQuotes(){ const c=active(); const S=state; const all=(window.SB_QUOTES||[]);
  /* the boot file holds 135 of them: draw nothing until the library is in, or the page counts
     135 and then 5,189 a second later (audit v4 H2) */
  if(SB_COUNT.quotes()==null){ lazyNeed('quotes'); return `<div style="max-width:640px;margin:0 auto">${pageHead('Quotes','famous people')}${beeEmpty('sleepy','The quote library is still loading — check back in a moment!')}</div>`; }
  if(!all.length) return `<div style="max-width:640px;margin:0 auto">${pageHead('Quotes','famous people')}${beeEmpty('sleepy','The quote library is still loading — check back in a moment!')}</div>`;
  const L=quoteList(); const total=L.length; let i=Math.min(Math.max(S.qi||0,0),Math.max(0,total-1));
  const x=L[i]||all[0]; const favs=(c.quoteFavs)||{}; const isFav=!!favs[(x.q||'').slice(0,60)];
  const catList=quoteCats(); const favN=all.filter(q=>favs[(q.q||'').slice(0,60)]).length;
  const chip=(key,label,on)=>`<button data-act="qSetCat" data-arg="${escA(key)}" style="display:inline-flex;align-items:center;gap:6px;min-height:40px;white-space:nowrap;padding:7px 13px;border-radius:999px;font-weight:800;font-size:12.5px;border:1px solid ${on?'transparent':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${label}</button>`;
  const chips=`<div style="display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;-webkit-overflow-scrolling:touch">
    ${chip('all','All',!S.qCat)}${favN?chip('__fav',iconSVG('heart',14,2.3)+' Favorites · '+favN,S.qCat==='__fav'):''}${catList.map(k=>chip(k,quoteCatChip(k),S.qCat===k)).join('')}</div>`;
  const qlen=(x.q||'').length; const isLong=/\n/.test(x.q||'')||qlen>240;
  const qsize=isLong?(qlen>600?'15px':'17px'):(qlen>170?'22px':qlen>110?'26px':qlen>60?'31px':'36px');
  const qHTML=renderQuoteHTML(x); const meaning=x.m||x.meaning||'';
  const body = total? `
    <div data-swipe="quotes" class="q-parchment" style="position:relative;max-width:640px;margin:0 auto;overflow:hidden;padding:clamp(26px,5vw,40px) clamp(22px,5vw,38px);${isLong?'':'text-align:center;min-height:min(52vh,400px);display:flex;flex-direction:column;justify-content:center'}">
      <div style="position:absolute;top:12px;left:16px;font-family:var(--display);font-size:64px;line-height:1;color:rgba(200,150,30,.26);pointer-events:none">“</div>
      <div style="position:absolute;top:13px;right:16px;display:flex;gap:8px;z-index:2">
        <button data-act="qSpeak" title="Read aloud" aria-label="Read aloud" style="width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',18)}</button>
        ${meaning?`<button data-act="qMeaning" title="What does it mean?" aria-label="Meaning" style="width:38px;height:38px;border-radius:50%;background:${S.qMeaningOpen?'#F0B429':'#fff'};color:${S.qMeaningOpen?'#5a3d00':'#B67B00'};border:1px solid ${S.qMeaningOpen?'transparent':'#EBD79A'};display:grid;place-items:center;font-size:18px;box-shadow:var(--edge)">💡</button>`:''}
        <button data-act="qFav" title="Save to favorites" aria-label="Favorite" style="width:38px;height:38px;border-radius:50%;background:${isFav?'#FF4D8D':'#fff'};color:${isFav?'#fff':'#C4453C'};border:1px solid ${isFav?'transparent':'#EBD79A'};display:grid;place-items:center;font-size:18px;box-shadow:var(--edge)">${iconSVG('heart',18,2.4)}</button>
      </div>
      <div style="position:relative;z-index:1;margin-top:10px;${isLong?'max-height:min(52vh,440px);overflow:auto;text-align:left':''}">
        <div style="font-family:${isLong?'var(--ui)':'var(--display)'};font-weight:${isLong?'500':'800'};font-size:${qsize};line-height:${isLong?'1.7':'1.28'};color:#2A2410;overflow-wrap:anywhere;white-space:pre-line">${qHTML}</div>
        <div style="margin-top:18px;font-family:var(--ui);font-weight:800;font-size:16px;color:#8A5B00">— ${esc(x.a)}</div>
        ${x.who?`<div style="margin-top:3px;font-size:12.5px;color:#8a7a4a;font-weight:600">${esc(x.who)}</div>`:''}
        ${x.c?`<div style="margin-top:12px"><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(200,150,30,.16);color:#8A5B00;font-weight:800;font-size:11.5px">${quoteCatLabel(x.c)}</span></div>`:''}
        ${(meaning&&S.qMeaningOpen)?`<div style="margin-top:16px;text-align:left;background:rgba(255,255,255,.6);border:1px solid #EBD79A;border-radius:14px;padding:13px 15px;animation:sb-rise .25s ease both">
          <div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8A5B00;margin-bottom:5px">💡 What it means</div>
          <div style="font-size:14px;line-height:1.55;color:#3A3320;font-weight:500">${esc(meaning)}</div></div>`
          :meaning?`<div style="margin-top:14px;font-size:12px;color:#8a7a4a;font-weight:700">💡 Tap the lightbulb for what it means</div>`:''}
        ${(x.hard&&x.hard.length)?`<div style="margin-top:10px;font-size:11.5px;color:#8a7a4a;font-weight:700">👆 Tap a <span class="q-hard" style="pointer-events:none">highlighted</span> word to see its card</div>`:''}
      </div>
    </div>
    <div style="max-width:600px;margin:14px auto 0;display:flex;align-items:center;gap:10px">
      <button data-act="qNav" data-arg="-1" style="padding:12px 18px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">←</button>
      <button data-act="qShuffle" style="flex:1;padding:12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:7px">${iconSVG('retry',16,2.3)} Surprise me</button>
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--muted);white-space:nowrap;min-width:74px;text-align:center">${fmtN(i+1)} / ${fmtN(total)}</span>
      <button data-act="qNav" data-arg="1" style="padding:12px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">→</button>
    </div>
    <div style="text-align:center;font-size:11.5px;color:var(--muted);margin-top:9px">Swipe or use ← → keys · tap ❤ to keep your favorites</div>`
   : beeEmpty('sleepy','No quotes here yet — try another category or your favorites.');
  return `<div style="animation:sb-rise .35s ease both;max-width:760px;margin:0 auto">
    ${pageHead('Quotes',countTxt('quotes')+' from famous people')}
    ${chips}
    ${body}
  </div>`; }
function viewIpaTrain(){ const S=state; const it=S.it; const pool=ipaPool();
  const tab=(m,label)=>`<button data-act="itMode" data-arg="${m}" style="padding:9px 15px;border-radius:999px;font-weight:800;font-size:13px;${(it?it.mode:'learn')===m?'background:var(--accent);color:#fff;box-shadow:var(--edge)':'background:var(--surface2);color:var(--text);border:1px solid var(--line)'}">${label}</button>`;
  const head=pageHead('The Sound Alphabet','read IPA like a champion','Study lists write pronunciations in phonetic symbols. Learn what each one says, then drill with real bee words — every one spoken by the real voice.');
  const tabs=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${backPill('setNav','Library','explore')}${tab('learn','Learn the symbols')}${tab('readipa','Read it')}${tab('writeipa','Transcribe it')}${tab('sound','Find the sound')}</div>`;
  if(!it||it.mode==='learn'){
    const eg=(sym)=>pool.filter(e=>e.t.indexOf(sym)>=0).slice(0,2);
    const card=(M)=>{ const samples=M.s==='ˈ'?[]:eg(M.s);
      return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:14px 15px;box-shadow:var(--sh-rest)">
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:6px"><span style="width:46px;height:46px;border-radius:12px;background:var(--chip);display:grid;place-items:center;font-weight:800;font-size:22px;color:var(--accent)">${M.s}</span>
          <span style="min-width:0"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14px;line-height:1.25">${esc(M.n)}</span>
          <span style="display:block;font-size:12px;color:var(--muted);font-weight:600">${esc(M.eg)}</span></span></div>
        ${samples.length?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${samples.map(e=>`<button data-act="itSayWord" data-arg="${escA(e.w)}" title="Hear it" style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12.5px">${iconSVG('volume',12)} ${esc(e.w)} <span style="color:var(--muted)">/${esc(e.t)}/</span></button>`).join('')}</div>`:''}
      </div>`; };
    const vowels=IPA_SOUNDS.filter(x=>'əæɑɛɪiʊuʌɔ'.indexOf(x.s)>=0||x.s==='ər');
    const glides=IPA_SOUNDS.filter(x=>['eɪ','aɪ','oʊ','aʊ','ɔɪ'].indexOf(x.s)>=0);
    const cons=IPA_SOUNDS.filter(x=>['θ','ð','ʃ','ʒ','tʃ','dʒ','ŋ','j'].indexOf(x.s)>=0);
    const stress=IPA_SOUNDS.filter(x=>x.s==='ˈ');
    const sect=(t,arr)=>`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:16px 0 9px">${t}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:11px">${arr.map(card).join('')}</div>`;
    return `<div style="animation:sb-rise .35s ease both">${head}${tabs}
      ${sect('Vowels',vowels)}${sect('Gliding vowels',glides)}${sect('Consonants worth learning',cons)}${sect('The stress mark',stress)}
      <div style="text-align:center;margin-top:20px"><button data-act="itMode" data-arg="readipa" style="padding:15px 30px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Start the drills →</button></div></div>`; }
  if(it.done){ const pct=it.qs.length?Math.round(it.score/it.qs.length*100):0;
    return `<div style="animation:sb-rise .35s ease both">${head}${tabs}
      <div style="max-width:430px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow)">
        <div style="width:64px;height:70px;margin:0 auto 10px">${mascotSVG(pct>=80?'excited':'happy')}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:26px">${it.score} / ${it.qs.length}</div>
        <div style="font-size:14px;color:var(--muted);font-weight:600;margin:6px 0 18px">${pct>=80?'You read the sound alphabet like a pro!':'Each symbol you learn unlocks a thousand pronunciations.'}</div>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button data-act="itMode" data-arg="${it.mode}" style="padding:12px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px">Train again</button>
          <button data-act="itMode" data-arg="${it.mode==='readipa'?'writeipa':it.mode==='writeipa'?'sound':'readipa'}" style="padding:12px 22px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">Next drill</button>
        </div></div></div>`; }
  const q=it.qs[it.i]; const picked=it.picked;
  const qTitle=it.mode==='readipa'?'Which word is this?':it.mode==='writeipa'?'Pick the true transcription':'Which word carries this sound?';
  const prompt = it.mode==='readipa'
    ? `<div style="font-weight:800;font-size:clamp(28px,5.5vw,40px);letter-spacing:.02em">/ ${esc(q.e.t)} /</div>`
    : it.mode==='writeipa'
    ? `<div style="font-family:var(--display);font-weight:800;font-size:clamp(28px,5.5vw,40px)">${esc(q.e.w)}</div>
       <button data-act="itSay" style="display:inline-flex;align-items:center;gap:7px;margin-top:8px;padding:9px 17px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">${iconSVG('volume',15)} Hear the word</button>`
    : `<div style="display:inline-grid;place-items:center;width:72px;height:72px;border-radius:18px;background:var(--chip);color:var(--accent);font-weight:800;font-size:32px">${esc(q.sym.s)}</div>
       <div style="font-size:14px;color:var(--text);font-weight:700;margin-top:8px">${esc(q.sym.n)} <span style="color:var(--muted);font-weight:600">· ${esc(q.sym.eg)}</span></div>`;
  const opts=q.opts.map((o,i)=>{ const isAns=i===q.ans; const st=picked==null?'background:var(--surface2);border:1px solid var(--line)':
      isAns?'background:color-mix(in srgb,var(--good) 18%,transparent);border:1.5px solid var(--good)':
      (i===picked?'background:color-mix(in srgb,var(--bad) 14%,transparent);border:1.5px solid var(--bad);opacity:.9':'background:var(--surface2);border:1px solid var(--line);opacity:.55');
    const shown=it.mode==='writeipa'?('/ '+o+' /'):o;
    return `<button data-act="itPick" data-arg="${i}" ${picked!=null?'disabled':''} style="display:flex;align-items:center;gap:10px;text-align:left;padding:13px 15px;border-radius:12px;font-weight:800;font-size:${it.mode==='writeipa'?'16px':'15px'};${st}">
      <span style="width:24px;height:24px;border-radius:7px;background:var(--chip);color:var(--accent);display:grid;place-items:center;font-size:12px;flex-shrink:0">${i+1}</span>
      <span style="min-width:0;overflow-wrap:anywhere">${esc(shown)}</span>${picked!=null&&isAns?'<span style="margin-left:auto;color:var(--good);flex-shrink:0">✓</span>':''}</button>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">${head}${tabs}
    <div style="max-width:560px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Question ${it.i+1} of ${it.qs.length}</span>
        <div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--accent);width:${Math.round(it.i/it.qs.length*100)}%"></div></div>
        <span style="font-size:12px;color:var(--treasure-deep,#8A5B00);font-weight:800;white-space:nowrap">🪙 ${it.score}</span></div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(18px,4vw,26px);box-shadow:var(--glow);text-align:center">
        <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:10px">${qTitle}</div>
        ${prompt}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:9px;margin-top:16px">${opts}</div>
        ${picked!=null?`<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px;flex-wrap:wrap">
          ${picked===q.ans?'<span style="color:var(--good);font-weight:800;font-size:14px">Right! +1 🪙</span>':`<span style="color:var(--bad);font-weight:800;font-size:14px">It’s ${esc(it.mode==='writeipa'?('/ '+q.opts[q.ans]+' /'):String(q.opts[q.ans]))}</span>`}
          <button data-act="itSay" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12.5px">${iconSVG('volume',13)} Hear it</button>
          <button data-act="itNext" style="padding:10px 22px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">${it.i+1>=it.qs.length?'Finish':'Next →'}</button></div>`:''}
      </div>
      <div style="text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-top:10px">Keys: 1–4 answer · R hear it · Enter next</div>
    </div></div>`; }
function viewExplore(){ const c=active(); ensureLists(c); const S=state;
  /* Seven destinations, each with its own painted header (app-art/lib-*.webp, made by
     voice/pipeline/atlas-art.py). The Library had gradients and line icons before,
     which read as a settings screen; a library should look like the thing it holds. */
  const cAll=(S.conceptData||[]); const cDone=cAll.filter(ch=>conceptStat(ch).done).length;
  /* every number on a tile comes from SB_COUNT or the live data — none is typed (audit v4 H2);
     a collection still on its way shows no number rather than a guess */
  const tTxt=countTxt('trivia'); const themeN=themeDefs().length; const mine=myThemes().length;
  const qTxt=countTxt('quotes'), fTxt=countTxt('idioms');
  const tile=(o)=>`<button data-act="${o.act}" ${o.arg?`data-arg="${escA(o.arg)}"`:''} class="lib-tile${o.lock?' lib-locked':''}"${o.lock?' aria-label="Locked — included with the Regional Speller plan"':''}>
      <span class="lib-art"><img src="app-art/${o.img}.webp" alt="" loading="lazy" decoding="async">
        <span class="lib-kick">${esc(o.kick)}</span><span class="lib-h">${esc(o.title)}</span></span>
      <span class="lib-body"><p>${esc(o.blurb)}</p>
        <span class="lib-foot"><span class="lib-go" style="background:${o.c}">${iconSVG(o.ic||'book',14)} ${esc(o.cta||'Open')}</span>
        ${o.stat?`<span class="lib-stat">${esc(o.stat)}</span>`:''}</span></span></button>`;
  const tiles=[
    tile({act:'setNav',arg:'concepts',img:'lib-concepts',kick:'Explain',title:'Concepts',
      blurb:'Patterns, roots, origins and bee-day craft.',
      c:'#5A37D6',stat:cAll.length?(cDone+'/'+cAll.length+' mastered'):''}),
    tile({act:'setNav',arg:'themes',img:'lib-themes',kick:'Families',title:'Theme Journeys',
      blurb:'Words grouped by subject, or by the language they came from.',
      c:'#C8451B',stat:mine?(mine+' picked'):(themeN?themeN+' families':'')}),
    tile({act:'openVocab',img:'lib-vocab',kick:'Meaning',title:'Vocabulary',
      blurb:'Word to meaning, vocabulary-bee style.',
      c:'#0A6B5D',cta:'Study'}),
    tile({act:'setNav',arg:'figurative',img:'lib-figurative',kick:'Sayings',title:'Idioms & Similes',
      blurb:(fTxt?fTxt+' phrases':'Phrases')+' and the story behind each one.',c:'#7A2F8C'}),
    tile({act:'openTrivTrain',img:'lib-trivia',kick:'Cards',title:'Bizzing Trivia',
      blurb:'Etymology cards by chapter, then the Arcade round.',
      c:'#A35C0C',ic:'bulb',cta:'Learn',stat:tTxt?tTxt+' questions':''}),   /* #C8791B was 3.38:1 under white (P0.19) */
    tile({act:'openIpaTrain',img:'lib-ipa',kick:'Notation',title:'The Sound Alphabet',
      blurb:'Read IPA, the notation real study lists use.',
      c:'#1C4A96',ic:'volume',cta:'Train'}),
    tile({act:'openTyping',img:'lib-typing',kick:'Speed',title:'Typing Trainer',
      blurb:'Touch-type, then race the sixty-second test.',c:'#2A63D6',ic:'pencil',cta:'Practise'}),
    tile({act:'openQuotes',img:'lib-quotes',kick:'Voices',title:'Quotes & Poems',
      blurb:(qTxt?qTxt+' lines':'Lines')+' worth knowing by heart.',
      c:'#8A5B00',ic:'quote',cta:'Read'}),
  ].join('');
  return `<div style="animation:sb-rise .35s ease both;max-width:1020px;margin:0 auto">
    ${pageHead('The Library','everything the Atlas teaches')}
    ${libShelf()}
    ${/* the Link Finder reads the analogy items: behind the analogy gate (anlOpen) until they are released */
      anlOpen()?`<button class="lib-anlband" data-act="openAnlTool" aria-label="Open the Link Finder">
      <span class="lib-anlic">${navIcon('analogy',26,true)}</span>
      <span class="lib-anltx"><b>Link Finder</b><span>Type any word and see how it links to others: twins, opposites, parts, word families. Then build an analogy from it.</span></span>
      <span class="lib-anlgo">Open ${iconSVG('arrow',16,2.4)}</span></button>`:''}
    <div class="lib-grid">${tiles}</div>
  </div>`; }
/* ---- The shelf. The books used to be one painted tile among eight, which said
   "here is a feature" when the truth is "here are twenty-three books". A row of
   spines says the second thing without a word of copy, and it is the only thing on
   this page a child recognises from a real room.

   TWO LEVELS OF CLICK, and they fall out of the dispatcher rather than being wired:
   the shelf carries data-act="openBooks" and each spine carries its own
   data-act="openBook". app3's click handler resolves e.target.closest('[data-act]'),
   so a spine wins on its own hit area and the shelf catches everything else —
   the wood, the gaps between books, the end of the row.

   Heights vary per position, not at random: a shelf where every book is the same
   height reads as a chart. It is deterministic so the shelf does not reshuffle on
   every render, which is the same rule Home follows for its hourly cards. */
function libShelf(){
  let ok=true; try{ ok=!window.SB_ENT||SB_ENT.has('books'); }catch(e){}

  /* THE LAYOUT IS AUTHORED, NOT RANDOMISED. A real shelf is uneven — books lean, and
     somebody has left a few lying flat on top of each other — and that unevenness is
     most of why it reads as a shelf rather than a bar chart. But it must be the SAME
     unevenness every render: a shelf that reshuffles each time the Library repaints is
     a bug the eye catches immediately, and Home already learned this lesson with its
     hourly cards. So the poses are a fixed table, keyed by position.

     LAY runs are indices that lie flat, stacked on each other. They are chosen to sit
     entirely inside one mobile half (0-11, 12-22), because a stack split across two
     shelves would be three books on one row and one on the next. */
  /* A leaning book needs elbow room, or it lies down across the title of the book
     next to it — which is exactly what happened to The Rulebook, The Grand Trunk Road
     and Say It Like a Champion on the first pass. The angles are gentle and each
     leaning spine carries its own side margin (below), so it tilts into air. */
  const LEAN = { 2:-4, 7:3.5, 10:-3.5, 13:4, 21:-3.5 };   // degrees, by position
  /* Five to a stack, not three. Against a 180px row a 3-high stack (~70px) left a
     conspicuous rectangle of empty shelf above it; five fills the space the way a real
     pile does. Both runs stay inside one mobile half (0-11, 12-22) so a stack is never
     split across the phone's two shelves. */
  const LAY  = [[4,5,6,7,8],[16,17,18,19,20]];            // flat stacks
  /* Heights are a PERCENTAGE OF THE ROW and must never exceed 100: the row is
     align-items:flex-end with no clipping, so a 110% book grows upward out of the box
     and silently pushes the shelf into the heading above it. That is what made the
     shelf measure 278px when its row was 170. Vary downward only. */
  const H    = [100,92,97,88,99,94,90,100,95,87,96,91,100,93,89,98,86,100,94];

  /* TYPE IS SIZED FROM THE SPINE ITSELF, in BOTH directions.
       across the spine — a vertical line of type cannot be thicker than the book it is
         printed on. Sizing on title length alone ignored this, so on the thinnest books
         (17px wide against a 46px one) the letters painted out over both edges onto the
         shelf behind. `SB_SPINE_R` holds each spine's MEASURED width/height, written by
         voice/pipeline/spine-art.py, so this is the real width and not an assumption.
       along the spine — a long title still has to fit end to end, which is the length
         term that already caught "Say It Like a Champion".
     The smaller of the two wins. */
  const ROW = 150;                                    // the shortest row any layout uses (the phone)
  const R = window.SB_SPINE_R || {};
  const fs = (t,slug) => {
    /* Two independent limits, both real, and the smaller wins:
         ACROSS — a vertical line of letters cannot be thicker than the book it is
           printed on. R[slug] is the spine's MEASURED width/height.
         ALONG  — the title must also fit end to end. This used to be a hand-written
           table of sizes by character count, calibrated when the spines were thin; it
           had "Letters Behaving Badly" at 8px when the book could carry 12. Deriving it
           from the actual length available means it stays right when the art changes.
       Both are computed against the SHORTEST row any layout uses, so a size that fits
       on a phone is simply generous on a desktop, never the reverse. */
    const w      = (R[slug] || 0.2) * ROW;
    const across = w * 0.44;
    const along  = (ROW - 18) / Math.max(1, t.length * 0.62);
    return Math.round(Math.max(7, Math.min(15, across, along)) * 10) / 10;
  };
  /* ...and the book grows if its title still needs the room. 0.62em per character is
     measured for this face at these sizes; the +18 is the spine's own top/bottom
     padding. Capped at 100 for the reason in the H comment above.
     THE DIVISOR IS THE SHORTEST ROW ANY LAYOUT USES (128px, the phone's two shelves),
     not the desktop row. Sizing against the taller row is what clipped four titles on
     a phone while measuring clean on a desktop — a percentage of a row it never had. */
  const bh = (t,i,slug) => Math.min(100, Math.max(H[i%H.length],
                       Math.ceil((t.length*fs(t,slug)*0.62+18)/ROW*100)));

  const inLay = new Map();
  LAY.forEach((run,ri)=>run.forEach(i=>inLay.set(i,ri)));

  /* INK FOLLOWS THE SPINE, AND IT IS CHOSEN BY CONTRAST RATHER THAN BY A THRESHOLD.
     White type on Lift-Off!'s yellow and Subject Sprints' orange was barely legible. A
     single luminance cut-off fixed those two and left a cluster of mid-tone golds
     (Root Camp: Latin, The Long Quiz, The Champion's Method) sitting right on the line
     with white type at about 1.8:1 — technically "dark enough", actually unreadable.
     So compute the WCAG contrast ratio for BOTH inks and keep the better one. No
     threshold to tune, and it stays correct if a volume is ever recoloured.
     The book pipeline does the same job for covers in cover-ink.py. */
  const ink = hex => {
    const n = parseInt(hex.slice(1), 16);
    const ch = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const L = 0.2126*ch((n>>16)&255) + 0.7152*ch((n>>8)&255) + 0.0722*ch(n&255);
    const ratio = other => (Math.max(L,other)+0.05) / (Math.min(L,other)+0.05);
    return ratio(1) >= ratio(0.006)                       // white vs a near-black ink
      ? {c:'#fff',    sh:'0 1px 2px rgba(0,0,0,.55)'}
      : {c:'#241703', sh:'0 1px 1px rgba(255,255,255,.5)'};
  };
  const title=(b,i)=>{ const k=ink(b.a);
    return `<span class="bk-t" style="--fs:${fs(b.t,b.s)}px;color:${k.c};text-shadow:${k.sh}">${esc(b.t)}</span>`; };
  /* NOT lazy: the browser deprioritizes lazy images and trickles them in one at a
     time, which is exactly how the shelf read — books popping in one by one. The
     whole row is ~400KB; load it eagerly (and warmSpines() below fetches it during
     idle time on Home, so the Library usually opens with every book already drawn). */
  const img=(b)=>`<img src="app-art/spines/${b.s}.png" alt="" loading="eager" fetchpriority="high" decoding="async">`;
  const attrs=(b)=>`data-act="openBook" data-arg="${escA(b.s)}" title="${escA(b.t)}"`;

  const upright=(b,i)=>`<button class="bk-sp" ${attrs(b)}
      style="--a:${b.a};--bh:${bh(b.t,i,b.s)}%;${LEAN[i]?`--lean:${LEAN[i]}deg;margin:0 9px`:''}">${img(b)}${title(b,i)}</button>`;
  /* A book lying down is the same drawing turned a quarter turn. Rotating the IMAGE
     rather than shipping a second set of art keeps one file per volume, and the title
     simply stops being vertical. */
  const laid=(b,i)=>`<button class="bk-lay" ${attrs(b)}>${img(b)}<span class="bk-lt" style="--fs:${fs(b.t,b.s)}px;color:${ink(b.a).c};text-shadow:${ink(b.a).sh}">${esc(b.t)}</span></button>`;

  const piece=(b,i)=>{
    const run=inLay.get(i);
    if(run===undefined) return upright(b,i);
    if(LAY[run][0]!==i) return '';                        // the stack is emitted once
    return `<span class="bk-stack">${LAY[run].map(j=>laid(SB_SHELF[j],j)).join('')}</span>`;
  };

  /* Two shelves on a phone. 23 spines across 390px is 14px each — a barcode, not a
     bookshelf. The row is split here and the two halves are re-joined into ONE row on
     wider screens with display:contents, so there is a single source of markup and no
     duplicated list to drift. */
  const half=12;
  const row=(from,to)=>`<span class="bk-row">${SB_SHELF.slice(from,to).map((b,k)=>piece(b,from+k)).join('')}</span>`;
  return `<div class="bk-shelf${ok?'':' bk-locked'}" data-act="openBooks">
    <div class="bk-head">
      <div>
        <div class="bk-kick">Read</div>
        <div class="bk-title">The Book Series</div>
      </div>
      ${/* NO PAYWALL ON A CHILD'S SCREEN (FIX-BEE v2 T3; owner, 10 Oct 2026 — the road to 4.5, P0.30: "Remove the 👑
           Regional Speller chip from the child Library"). Locked, the shelf says one quiet line and names no plan; the
           plan is sold behind the grown-up PIN (a tap still goes through openBooks, whose plan sheet asks for it). */
        ok?`<button class="bk-all" data-act="openBooks">${iconSVG('book',13)} Open the shelf</button>`
          :`<span class="bk-lockline">${iconSVG('lock',13)} Comes with the family plan</span>`}
    </div>
    <div class="bk-books">${row(0,half)}${row(half,SB_SHELF.length)}</div>
    <div class="bk-wood"></div>
    <div class="bk-foot">${SB_SHELF.length} books · 19 volumes and 4 companions${ok?' · opens in a new tab':''}</div>
  </div>`; }
/* ---- generated concept covers: theme-independent family palette + texture (design handoff) ---- */
const CONCEPT_FAM = {
  Basics:{c:'#F0A81C',c2:'#D68A08',tex:'dots'},
  Prefixes:{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes'},
  Suffixes:{c:'#FF5FA2',c2:'#E8458C',tex:'dots'},
  Roots:{c:'#13A892',c2:'#0E8A78',tex:'rings'},
  Loanwords:{c:'#E0922E',c2:'#C8791B',tex:'diag'},
  Rules:{c:'#3D7DF0',c2:'#2A63D6',tex:'grid'},
  Subjects:{c:'#4F9E6A',c2:'#3C8455',tex:'dots'},
  Themes:{c:'#F0703C',c2:'#D85A29',tex:'rings'},
  Advanced:{c:'#7B52E0',c2:'#5E39C4',tex:'cross'},
  'Bee day':{c:'#D6353F',c2:'#8E1D26',tex:'grid'},
  'Deep spelling':{c:'#7E8AA0',c2:'#4C566B',tex:'rings'},
  'Far origins':{c:'#0E8A78',c2:'#075C50',tex:'cross'},
  'Word building':{c:'#5B6BA8',c2:'#364475',tex:'stripes'},
  'Word journeys':{c:'#C08A3E',c2:'#8A5B00',tex:'diag'},
  'Champion tips':{c:'#E8458C',c2:'#A82563',tex:'dots'} };
function conceptFam(ch){ return CONCEPT_FAM[catGroup(ch.category)]||CONCEPT_FAM.Advanced; }
function conceptCoverBG(ch){ const f=conceptFam(ch); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
function conceptCardHTML(ch, allChs){
  const ci=allChs.indexOf(ch); const st=conceptStat(ch); const locked=!isConceptUnlocked(ci);
  const fam=catGroup(ch.category); const f=conceptFam(ch); const dc=(diffMap[ch.difficulty]||diffMap.medium)[1];
  const {hero,kind}=conceptHero(ch); const main=hero[0]||conceptShort(ch.title); const rest=hero.slice(1);
  const nWords=conceptWordsOf(ch).length;
  const titleClean=conceptShort(ch.title).replace(/\s*\([^)]*\)\s*$/,'').trim();
  const paren=(String(ch.title).match(/\(([^)]*)\)/)||[])[1];
  const meaning=(paren||conceptRoots(ch.title)||'').trim();
  const mainStyle=`font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-size:${heroFont(main)}px;font-weight:${kind==='word'?700:800};${kind==='word'?'font-style:italic;':''}`;
  const cover=`<div style="position:relative;height:116px;display:flex;align-items:center;justify-content:center;padding:14px;${conceptCoverBG(ch)}">
    <span style="position:absolute;top:11px;left:12px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(fam)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${st.done?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div class="sb-theme-art" style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16);animation-delay:${(ci%9)*0.22}s${locked?';opacity:.92':''}">
      ${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',42,2)}</div>`:`<div style="${mainStyle}">${esc(main)}</div>`}
      ${(!locked&&rest.length)?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:13px;color:rgba(255,255,255,.85);margin-top:6px;letter-spacing:.04em">${rest.map(esc).join('&nbsp;&nbsp;&nbsp;')}</div>`:''}
    </div>
  </div>`;
  const footL = locked
    ? (()=>{ const L=conceptLock(ci); return lockChip(L.kind,L.text,{fs:11}); })()
    : `<span style="padding:3px 9px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${(diffMap[ch.difficulty]||diffMap.medium)[0]}</span>`;
  const footR=`<span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${locked?'How to open':(nWords+' words')} →</span>`;
  const prog=(!locked && !st.done && st.m>0)?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:${f.c};font-weight:700;margin-top:7px">${st.m}/${st.total} mastered</div>`:'';
  return `<button class="sb-cover-card" data-act="${locked?'buyConcept':'openConcept'}" data-arg="${ci}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column;${locked?'opacity:.97':''}">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.15;color:var(--text)">${esc(titleClean)}</div>
      ${meaning?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c};margin-top:3px">${esc(trunc(meaning,42))}</div>`:''}
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(ch.concept,96)}</div>
      ${prog}
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">${footL}${footR}</div>
    </div>
  </button>`;
}
function famCoverBG(fam){ const f=CONCEPT_FAM[fam]||CONCEPT_FAM.Advanced; const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* The Library used to list Word Journeys and the champion tip deck as their own
   rows. They are explanations, so they belong on the same shelf as everything
   else — these two covers sit at the end of the concept grid and open the
   existing viewers, which keeps their content and content-shape intact. */
function sideShelves(){
  const out=[];
  const lessons=lessonsAll().length;
  if(lessons) out.push(shelfCover('Word journeys', lessons+' journeys',
    'The history and geography of one word at a time — story, pattern, then five words to keep.',
    'openJourneys', null, !state.premium && !state.devUnlock ? 'With the family plan' : ''));
  const tips=((window.SB_ADV_TIPS)||[]).length;
  if(tips) out.push(shelfCover('Champion tips', tips+' techniques',
    'Memory, speed, roots and bee-day tactics from spellers who have stood at the microphone.',
    'openAdvTips', null, advModeOn() ? '' : '◆ Advanced Pack'));
  return out.join('');
}
function shelfCover(name, meta, blurb, act, arg, badge){
  const f=CONCEPT_FAM[name]||CONCEPT_FAM.Advanced;
  const locked=!!badge;
  return `<button class="sb-cover-card" data-act="${locked&&!/plan/.test(badge)?'openAdvanced':act}" ${arg?`data-arg="${escA(arg)}"`:''} style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:94px;display:flex;align-items:center;justify-content:center;padding:12px 14px;overflow:hidden;${famCoverBG(name)}">${act==='openJourneys'?unitCoverArt(5):''}
      <span style="position:absolute;top:9px;left:11px;font-family:var(--display);font-weight:700;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.28);color:#fff">Also here</span>
      <span style="position:relative;font-family:var(--display);font-weight:800;font-size:23px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.45);text-align:center;line-height:1.05">${esc(name)}</span>
      ${badge?`<span style="position:absolute;bottom:9px;right:10px;display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:rgba(10,6,26,.5);color:#fff;font-weight:800;font-size:11px">${iconSVG('lock',12,2.2)} ${esc(badge)}</span>`:''}
    </div>
    <div style="padding:13px 15px 14px;display:flex;flex-direction:column;flex:1">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px"><span class="sb-ct" style="font-size:15px">${esc(name)}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c}">${esc(meta)}</span></div>
      <p style="margin:7px 0 0;font-size:12.5px;color:var(--muted);line-height:1.45">${esc(blurb)}</p>
    </div>
  </button>`;
}
function conceptChapterStat(chap){ const done=chap.items.filter(c=>conceptStat(c).done).length; return { done, total:chap.items.length, complete:done>=chap.items.length }; }
function chapterCoverCard(chap){ const f=CONCEPT_FAM[chap.name]||CONCEPT_FAM.Advanced; const st=conceptChapterStat(chap); const pct=st.total?Math.round(st.done/st.total*100):0;
  const gated=chap.adv&&!advModeOn();
  const price=(window.ADV&&ADV.price)?ADV.price():299;
  return `<button class="sb-cover-card" data-act="${gated?'openAdvanced':'openConceptChapter'}" data-arg="${chap.n-1}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${chap.adv?`color-mix(in srgb,${f.c} 40%,var(--line))`:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:94px;display:flex;align-items:center;justify-content:center;padding:12px 14px;${famCoverBG(chap.name)}">
      <span style="position:absolute;top:9px;left:11px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.28);color:#fff">${chap.adv?'◆ Advanced':'Shelf '+chap.n}</span>
      <span style="font-family:var(--display);font-weight:800;font-size:23px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.3);text-align:center;line-height:1.05">${esc(chap.name)}</span>
      ${gated?`<span style="position:absolute;bottom:9px;right:10px;display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:rgba(10,6,26,.5);color:#fff;font-weight:800;font-size:11px">${iconSVG('lock',12,2.2)} Advanced Pack</span>`
        :st.complete?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    </div>
    <div style="padding:13px 15px 14px;display:flex;flex-direction:column;flex:1">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px"><span class="sb-ct" style="font-size:15px">${gated?'Advanced Pack':esc(chap.name)}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c}">${st.total} chapters</span></div>
      <div style="margin-top:auto;padding-top:13px;display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${st.complete?'var(--good)':f.c};width:${pct}%;transition:width .4s"></div></div><span style="font-size:12px;color:var(--muted);font-weight:800;white-space:nowrap">${st.done}/${st.total}</span></div>
    </div>
  </button>`; }
function viewConceptList(){
  const S=state; const allChs=S.conceptData||[]; const loading=S.conceptLoading&&!S.conceptData;
  const chapters=allChs.length?conceptChapters():[]; const chaptersDone=chapters.filter(c=>conceptChapterStat(c).complete).length;
  const masteredCount=allChs.filter(c=>conceptStat(c).done).length; const pct=allChs.length?Math.round(masteredCount/allChs.length*100):0;
  const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
  const q=(S.conceptQuery||'').trim().toLowerCase();
  const search=`<input data-inp="onConceptSearch" data-fkey="conceptSearch" value="${escA(S.conceptQuery)}" placeholder="Search any pattern, root or word…" style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:11px 15px;font-size:13px;color:var(--text);margin-bottom:14px">`;
  let mainContent='', headDesc='', backRow='';
  if(!loading){
    if(q){ const list=allChs.filter(ch=>(ch.title+' '+ch.category+' '+(ch.concept||'')).toLowerCase().includes(q));
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      mainContent=`<div style="font-size:12px;color:var(--muted);font-weight:700;margin:0 2px 12px">${list.length} match${list.length===1?'':'es'} for “${esc(S.conceptQuery.trim())}”</div>`+(list.length?`<div style="${gridStyle}">${list.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`:'<div style="padding:44px 0;text-align:center;color:var(--muted);font-weight:700">No matches.</div>');
    } else if(S.conceptChapter!=null && chapters[S.conceptChapter]){ const chap=chapters[S.conceptChapter]; const st=conceptChapterStat(chap);
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      backRow=`${backPill('conceptChaptersBack','All chapters',null)}`;
      mainContent=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#fff;font-family:var(--display);font-weight:800;font-size:20px;${famCoverBG(chap.name)}">${chap.n}</span><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.1">Chapter ${chap.n} · ${esc(chap.name)}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${st.done}/${st.total} concepts done</div></div></div><div style="${gridStyle}">${chap.items.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`;
    } else { headDesc='Every explanation in the app, on one shelf. Free shelves teach the patterns; the Advanced Pack shelves go to national-bee depth. A chapter is yours once you nail 70% of its words.';
      mainContent=`<div style="${gridStyle}">${chapters.map(chapterCoverCard).join('')}${sideShelves()}</div>`; }
  }
  return `<div style="animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">${backPill('goHome','Home',null)}</div>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0">Concepts</h2><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">${allChs.length||121} chapters on ${conceptChapters().length||9} shelves</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13px;max-width:52em">${headDesc}</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('grid',15)} ${chaptersDone}/${conceptChapters().length||9} shelves</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .4s"></div></div>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${pct}%</span>
    </div>
    ${backRow}${search}
    ${loading?hiveLoader('loading chapters…'):''}
    ${mainContent}
  </div>`;
}
function b2Idx(){
  const src = (window.SB_DATA && SB_DATA.nsf) || [];
  const key = src.length + '|' + (window.SB_HOM?1:0) + (window.SB_WVOICE?1:0) + (window.SB_SCRIPPS?1:0);
  if (_b2Idx && _b2Idx.key === key) return _b2Idx;
  const W=[], Y=[], L=[], O=[], P=[], C=[], NT=[], TG=[], REC=[], SY=[], FL=[], F=[], DF=[], BP=[];
  /* the sound tables and the voice manifest arrive on the lazy queue, so the index
     is keyed on whether they are HERE — not just on the corpus length, or a builder
     opened before sounds-data.js landed would show "homophone 0" for the session */
  /* SB_HOM is an ARRAY OF GROUPS, not a word-keyed map — indexing it by a word
     silently yields undefined, so the homophone flag was set for nobody. The app
     already has the accessors that get this right; use them rather than the raw
     tables. altPron/diacritic are prototype-safe for the same reason homIndex is:
     "constructor" is a real library word. */
  const HOM=(window.SB_HOM? homIndex() : null);
  const ALT=(window.SB_ALT_PRON||null), DIA=(window.SB_DIACRITICS||null);
  let VOICE=null; try{ if(window.SB_WVOICE) VOICE=new Set(String(SB_WVOICE).split('|')); }catch(e){}
  let CHAMP=null; try{ if(window.SB_SCRIPPS) CHAMP=new Set(SB_SCRIPPS.map(x=>String(x&&x.w||x).toLowerCase())); }catch(e){}
  const oL=[], pL=[], cL=[], nL=[], tL=[];
  const oI=Object.create(null), pI=Object.create(null), cI=Object.create(null),
        nI=Object.create(null), tI=Object.create(null);
  const put=(tab,idx,v)=>{ const k=String(v==null?'':v).trim(); if(!k) return -1;
    if(idx[k]===undefined){ idx[k]=tab.length; tab.push(k); } return idx[k]; };
  for(const w of src){
    if(!w || !w.w) continue;
    const s=String(w.w);
    if(!/^[a-z][a-z]*$/.test(s) || s.length<3) continue;   // no proper nouns, no fragments
    W.push(s); Y.push(w.y||3); L.push(s.length); REC.push(w);
    FL.push(s.charCodeAt(0)-97);
    /* the two real bands. spellDiff memoises its trickAnal on the record (w._tk),
       so this costs one pass here and nothing on every later re-count. */
    DF.push(b2Band(B2_DIFF, spellDiff(w)));
    BP.push(b2Band(B2_ODDS, +w.bp||0));
    /* syllables: the sy field is dot-separated ("aar.on"); the respelling's hyphens
       are the fallback, and a word with neither counts as one */
    const sy=String(w.sy||''); const pr=String(w.p||'');
    SY.push(Math.min(9, sy?sy.split('.').length : (pr?pr.split('-').length:1)));
    let f=0;
    if(w.d) f|=1; if(w.s) f|=2; if(w.m && String(w.m).toLowerCase()!==s) f|=4;
    if(VOICE && VOICE.has(s)) f|=8;
    if(HOM && HOM[s]) f|=16;
    if(ALT && altPron(s)) f|=32;
    if(DIA && diacritic(s)) f|=64;
    if(CHAMP && CHAMP.has(s)) f|=128;
    F.push(f);
    O.push(put(oL,oI,w.o)); P.push(put(pL,pI,w.ps));
    let cls='plain'; try{ cls=(window.SB_TRICK?SB_TRICK.anal(w).cls:'plain')||'plain'; }catch(e){}
    C.push(put(cL,cI,cls));
    /* a word can sit in several bee tiers at once — "Open | North South Finals" —
       so each carries a LIST of tiers, never one code */
    NT.push(String(w.nt||'').split('|').map(x=>x.trim()).filter(Boolean).map(x=>put(nL,nI,x)));
    TG.push((Array.isArray(w.t)?w.t:[]).map(x=>put(tL,tI,x)).filter(x=>x>=0));
  }
  /* Which group each tag and each origin belongs to, resolved ONCE per index
     rather than per chip per render. tG: -2 = not a subject at all (an origin
     family, an eponym cluster or a bare language name, all of which have their
     own facet), -1 = a subject with no group yet, which is "Everything else". */
  const tG=tL.map(t=>{ if(B2_NOTSUBJ.has(t)) return -2;
    for(let g=0;g<B2_TAGGRP.length;g++) if(B2_TAGGRP[g][3].indexOf(t)>=0) return g;
    return -1; });
  const oG=oL.map(b2OrigFam);
  return (_b2Idx={ key, n:src.length, N:W.length, W,Y,L,O,P,C,NT,TG,REC,SY,FL,F,DF,BP,
                   oL,pL,cL,nL,tL,tG,oG });
}
const B2_CLS = { plain:'Spelled as it sounds', hom:'Sounds like another word',
  silent:'Silent letters', epon:'Named after someone', dbl:'Double letters',
  end:'Tricky ending', fr:'French pattern', gk:'Greek pattern', vow:'Vowel trap' };
const B2_SIZES = [10,15,20,25,30,50,100,250];
/* ---------------------------------------------------------------------------
   SPELLING BANDS — what replaced the Egg→Legend ladder, and why.

   The builder used to offer a "Spelling level" facet labelled with the app's own
   rank names. It filtered on `y`, which is RARITY, not spelling difficulty —
   this file's own header says so ("rarity `y` and length are minor terms") and
   `corpusSlice` by `y` is what "puts dictionary tail on a championship stage".
   So the facet promised a spelling level and delivered a frequency band under a
   game name. Two honest facets replace it, both from data the app already trusts:

     diff  spellDiff(w) — trickiness-dominant, the key this file tells every new
           difficulty ramp to use. Edges are the measured quintiles of the served
           corpus (32.5 / 42 / 50 / 60.5 over a 6.5–128 range), so each band is
           about a fifth of the library rather than a guess.
     odds  `bp`, the bee-probability score already shown on every word card as
           beeOdds() dots — but never filterable until now. Its edges are NOT
           quintiles: the distribution piles 88% of the corpus into 20–40, and the
           whole point of the facet is to isolate the words that actually turn up
           at a bee. Cross-checked against the competition tiers, which is what
           makes it trustworthy: mean bp runs Open 30.8 → Primary 39.4 →
           Junior 48.1 → Advanced 54.2 → Senior 65.1 → North South Finals 71.1.
--------------------------------------------------------------------------- */
const B2_DIFF = [
  { lab:'Gentle',      hi:32.5 },
  { lab:'Steady',      hi:42   },
  { lab:'Testing',     hi:50   },
  { lab:'Hard',        hi:60.5 },
  { lab:'Brutal',      hi:1e9  }];
const B2_ODDS = [
  { lab:'Long shot',   hi:40  },
  { lab:'Sometimes',   hi:55  },
  { lab:'Often',       hi:70  },
  { lab:'Very likely', hi:85  },
  { lab:'Bee staple',  hi:1e9 }];
const b2Band=(tab,v)=>{ for(let i=0;i<tab.length;i++) if(v<tab[i].hi) return i; return tab.length-1; };
/* ---------------------------------------------------------------------------
   TAG STRUCTURE — 768 tags in one flat list is not a filter, it is a haystack.

   The `t` array mixes at least four different KINDS of tag, which is why the old
   "Subject" facet felt arbitrary: it showed the top 24 by count, and the top four
   were olatin, ooldeng, ofrench and ogreek — origin families, not subjects, and
   already covered by the Language-of-origin facet next to it.

   So the subject facet now shows subjects only, grouped. The origin-family and
   eponym tags are lifted out (they belong to the facets that already exist), and
   bare language names are too — "irish" as a subject means the word came from
   Irish, which is an origin, not a topic.

   THE TRAP: these lists are explicit and must stay that way. A prefix rule on
   /^o/ looks tempting and is wrong — ocean, oceans, oceanography, optics, orbits,
   ornament and occupations are all real subjects that start with o.
--------------------------------------------------------------------------- */
const B2_NOTSUBJ = new Set([
  /* origin families — the Language of origin facet covers these */
  'olatin','ooldeng','ofrench','ogreek','onordic','oiberian','osemitic','odutch',
  'osouth','oeastasia','oslavic','opacific','oceltic','oturkic','oworld',
  /* eponym clusters — "Why it's tricky → Named after someone" covers these */
  'eponyms','eponym','epfrench','eplatin','epgreek','epeng','epnordic','epiber',
  /* bare language names: an origin wearing a subject's clothes */
  'irish','yiddish','hebrew','latin','french','italian','russian','german','greek',
  'welsh','scottish','polish','danish','swedish','turkish','gaelic','celtic',
  'nahuatl','tupi','mapuche','algonquian','iroquoian','brazilian','american',
  'french origin','old']);
/* Ordered groups. A tag may appear in exactly one; anything unlisted falls into
   "Everything else", which the search box still reaches. Medicine & the body is
   first because it is the group the flat list hid worst: `body` and `disease`
   ranked high while `medicine`, `anatomy` and `pharmacy` sat far below the cut. */
/* WHAT IS DELIBERATELY NOT A SUBJECT.

   The `t` array also carries ORIGIN information: the o-prefixed families
   (olatin, ofrench, ooldeng, ogreek and eleven more, 122,449 words between
   them), the ep-prefixed eponym clusters, and a tail of lowercase duplicates
   — greek, latin, french, german, yiddish, nahuatl, scottish, gaelic — plus
   bare place names: scotland, india, africa, japan, korea, ireland, russia,
   asia, america.

   NONE of them is grouped here, and that is the same decision the subject
   facet was rebuilt on: the old one showed the top 24 tags by count, and the
   top four were olatin, ooldeng, ofrench and ogreek. Origin is its own facet
   (B2_ORIGRP). A word's origin appearing in BOTH would make "Subject → Greek"
   mean something different from "Origin → Greek" on the same screen, and a
   filter whose two halves disagree is worse than a filter with one half.

   So a tag in no group here is not always an oversight. Run
   tools/review/bands-and-tags.cjs and read §4: a SUBJECT with no home is a bug
   (its words cannot be selected at all), an origin with no home is this rule.
--------------------------------------------------------------------------- */
const B2_TAGGRP = [
 ['med','Medicine & the body','heart',['body','anatomy','disease','pharmacy','medicine','health','biology','muscles','bones','teeth','skin','eyes','ears','brain','heart','lungs','nerves','glands','skeleton','physiology','digestion','healing','therapy','remedy','epidemiology','neurology','psychiatry','pathology','dermatology','veterinary','embryology','pharmacology','microbes','microbiology','genetics','cells','proteins','hormones','vitamins','metabolism','diet','reproduction','chest','parasitology','ophthalmology','toxicology','histology','virology','immunology','eyesight','lab techniques']],
 ['life','Living world','leaf',['animals','birds','insects','marine','botany','flowers','ecology','plants','trees','fungi','mycology','zoology','herpetology','entomology','ornithology','ichthyology','mammals','reptiles','amphibians','fish','dogs','horses','spiders','worms','algae','lichens','seeds','fruit','crops','nature','creatures','arachnids','crustaceans','arthropods','invertebrates','primates','penguins','elephants','owls','seabirds','waterbirds','poultry','livestock','pets','taxonomy','evolution','extinct','dinosaurs','fossils','paleontology','palaeontology','migration','lifecycle','herbivores','shellfish','feathers','horns','tusks','beak','nests','pests','bugs','marine biology','marine life','herbs','floral','growth','life','arachnology','malacology','shells','scorpions','wings']],
 ['earth','Earth & sky','globe',['landforms','waterways','weather','astronomy','minerals','maps','geology','geography','meteorology','mineralogy','ocean','oceans','oceanography','lakes','rocks','soil','mountains','volcanoes','magma','climate','climatology','hydrology','limnology','tides','rain','storms','clouds','wind','atmosphere','sky','stars','planets','moon','sun','galaxies','cosmos','universe','space','astrophysics','planetary science','petrology','crystallography','crystals','gemology','gemmology','gems','stratigraphy','sediment','deposits','basins','continents','stone','stones','iceage','surveying','cartography','navigation','harbor','depths','zones','earth','water','water cycle','salinity','environment','environments','mapping','space rocks','stargazing','telescopes','meteorites','winter','layers','soil science','glaciology','atmospheric physics','seismology','speleology','volcanology','cosmology','space dust','deserts','snow','sea','gravity']],
 ['sci','Science, number & logic','flask',['chemistry','physics','numbers','logic','science','math','mathematics','geometry','algebra','calculus','arithmetic','statistics','probability','measurement','biochemistry','metallurgy','materials','optics','orbits','light','sound','acoustics','heat','energy','electricity','magnetic','radiation','molecules','atoms','elements','particles','reactions','fluids','solids','dynamics','mechanics','topology','symmetry','polygons','triangles','curves','shapes','scale','sizes','speed','temperature','pressure','data','algorithms','computing','programming','technology','engineering','laboratory','lab','microscopes','research','theory','theories','discovery','microfossils','substances','processes','processing','classification','morphology','systems','networks','notation','structure','structures','techniques','testing','diagram','probability','electronics','telecommunications','lenses','projection','cryptography','kinematics','graphs','apparatus','hydraulics','valves','machining','assaying','components','identification','phenomena']],
 ['arts','Arts, words & stage','music',['music','poetry','painting','stage','wordwords','instruments','art','arts','literature','rhetoric','linguistics','language','philology','phonetics','phonology','grammar','syntax','semantics','prosody','meter','typography','printing','printmaking','publishing','books','book','manuscripts','bookbinding','writing','storytelling','theatre','theater','acting','dance','ballet','singing','vocals','orchestra','organology','campanology','poetics','sculpture','drawing','engraving','photography','graphics','design','visualarts','aesthetics','literary','comedy','puppetry','performance','performer','stagecraft','tempo','symbolism','symbol','symbols','imagery','slang','vocabulary','etymology','punctuation','names','reading','classical','folklore','hymn','bibliography','style','patterns','charts','ornament','decoration','decor','metaphysics','calligraphy','opera','palaeography','philately','library science','genealogy','mosaic','fresco','television','radio','communication','description']],
 ['food','Food, home & dress','cup',['culinary','dishes','spices','household','food','fabrics','cooking','baking','bakery','pastry','dessert','candy','cheese','pasta','salad','stew','seafood','meat','drinks','beverages','drink','dining','restaurant','gastronomy','cuisine','kitchen','appetizer','ingredients','preparation','produce','viticulture','textiles','clothing','costume','fashion','apparel','tailoring','millinery','jewelry','jewels','cosmetics','skincare','perfumery','beauty','hair','accessories','furniture','home','homes','flooring','windows','domes','glass','ceramics','pottery','crafts','craft','woodworking','dip','starch','fabric','cleaning','packaging','objects','vessels','plates','gear','supplies','jewellery','brewing','distilling','embroidery','needlework','tableware','cheesemaking','bread','confectionery','malting','houses','fragrance','leatherwork','lacquerwork','vestment']],
 ['people','People & society','users',['kinship','jobs','politics','law','economy','war','royalty','nations','character','emotions','religion','festivals','culture','society','people','family','occupations','professions','profession','careers','government','courts','jurisprudence','contracts','crime','forensics','military','infantry','cavalry','artillery','weapons','weaponry','armor','warriors','battles','strategy','tactics','defense','fortification','chivalry','feudalism','nobility','heraldry','flags','diplomacy','policy','political theory','leadership','management','organization','community','education','teaching','learning','academia','academic','academics','business','finance','banking','trade','commerce','markets','market','currency','numismatics','prices','wealth','assets','property','ownership','investment','insurance','taxes','debt','lending','leasing','trusts','estates','inheritance','industry','manufacturing','labor','logistics','travel','leisure','games','entertainment','sacrament','theology','liturgy','devotion','prayer','spirituality','mysticism','monasticism','saints','sect','doctrine','christology','eschatology','ethics','philosophy','psychology','sociology','archaeology','manners','conduct','habits','habit','tradition','traditional','ceremony','celebration','holidays','calendar','festival','places','country','location','roles','duty','security','welfare','sustainability','exchange','commodities','monopoly','corruption','collaboration','court','specialties','values','freedom','free will','economics','titles','customs','anthropology','epistemology','valuation','accounting','rights','work','sport','exploration','sacred','armour']],
 ['hist','History & myth','scroll',['ancient','history','myth','mythology','legends','fairies','monsters','magic','trickery','shapeshifting','antiques','archaic','artifacts','castles','castle','heritage','chivalry','antiquity','origins']],
 ['made','Made things & travel','tools',['tools','buildings','vehicles','seafaring','architecture','construction','hardware','equipment','instrument','boats','ships','sailing','nautical','maritime','aviation','flight','spaceflight','satellites','transportation','equestrian','coachbuilding','metalwork','metalworking','brass','glassmaking','inlay','clockmaking','horology','mining','farming','agriculture','husbandry','gardening','forestry','angling','fishing','camping','climbing','outdoors','skiing','chess','toys','puzzles','falconry','tack','trades','tool','machines','engineering','surfaces','finishes','wood','paper','landscaping','pursuits','hobbies','club','tracks','trend','old trades','masonry','shipbuilding','carpentry','building','joinery','glassblowing','metals','country pursuits','harness','rigging','farriery','shipping','gunmaking','blacksmithing','milling','cooperage','knots','ballooning','woodwork','sundials','tanning','fastenings','sailmaking','joints','harbours','timbers','seamanship','airships','engines','instrument making','gardens','farm','making']],
 ['self','Mind, feeling & time','sparkle',['time','colors','color','sports','emotion','mind','memory','cognition','thinking','reasoning','perception','awareness','attention','sleep','dreams','stress','anxiety','fears','phobia','phobias','obsessions','delusions','mood','happiness','comfort','affection','loyalty','virtue','destiny','truth','knowledge','ideas','concepts','imagination','creativity','personality','traits','behavior','movement','walking','jump','exercise','reflexes','gesture','expression','speech','voice','hearing','vision','appearance','laziness','solitude','solitary','talkative','nonsense','insults','uproar','mystery','survival','wellness','care','yoga','meditation','martial arts','skills','training','study','sleep','feeling','preferences','comparison','decision-making','continuity','change','timing','meaning','paradox','reference','evidence','errors','crisis','danger','secrecy','magic','cheeky','worry','perfection','creation','shadows','technique','process','action','form','size','quality','texture','articulation','functions','attributes','development']],
 ['bee','Bee lists','target',['championship']]];
/* ---------------------------------------------------------------------------
   ORIGIN FAMILIES — 214 origin strings, grouped by KEYWORD rather than by name.

   Matching on substrings rather than an enumerated list is deliberate: the field
   is not clean and never will be. It carries case variants (french, english,
   greek), an abbreviation (nah), and 20-odd compounds — "Latin and Greek",
   "Greek/Latin", "Latin + Greek", "Old English/French", "Spanish from Nahuatl".
   A name list would silently drop every one of those into Other; a keyword match
   lands them somewhere sensible. First match wins, so a compound goes to the
   earliest family it names, and the order below is the order of that decision.
--------------------------------------------------------------------------- */
const B2_ORIGRP = [
 ['rom','Romance',       ['latin','french','italian','spanish','portuguese','catalan','romanian','norman','mirandese','ladino','creole','galician','provencal']],
 ['ger','Germanic',      ['english','german','dutch','norse','swedish','danish','norwegian','icelandic','afrikaans','yiddish','scots','frisian','faroese','scandinavian','gothic','austrian','british','flemish']],
 ['gk','Greek',          ['greek']],
 ['celt','Celtic',       ['irish','gaelic','welsh','scottish','breton','cornish','manx']],
 ['sem','Middle East & Semitic',['arabic','hebrew','persian','turkish','aramaic','akkadian','phoenician','amharic','avestan','egyptian','pushto','georgian','armenian','somali','ottoman']],
 ['sa','South Asian',    ['hindi','sanskrit','urdu','tamil','telugu','malayalam','marathi','gujarati','panjabi','punjabi','bengali','sinhala','pali','balti','romany','angloromani','konkomba']],
 ['ea','East & SE Asian',['japanese','chinese','mandarin','cantonese','hakka','yue','korean','malay','indonesian','javanese','tagalog','vietnamese','thai','burmese','tibetan','khmer','lao','mongolian','palauan','chinook','pidgin']],
 ['sl','Slavic & Baltic',['russian','polish','czech','slovak','ukrainian','serbo','bulgarian','slavic','latvian','lithuanian','hungarian','finnish','estonian','albanian']],
 ['afr','African',       ['swahili','zulu','xhosa','bantu','tswana','wolof','shona','kongo','kimbundu','ganda','ovambo','duala','lingala','efik','akan','kanuri','bambara','khoekhoe','african','engenni','eman','fon']],
 ['am','Indigenous American',['nahuatl','nah','quechua','taino','algonqui','cree','ojibwa','iroquoian','mapuche','mapudungun','tupi','guarequena','inuit','inuktitut','inuinnaqtun','aleut','navajo','hopi','cherokee','mohawk','seneca','powhatan','narragansett','alabama','abnaki','lushootseed','wintu','kalaallisut','yupik','gwich','wiradhuri']],
 ['pac','Pacific & Australian',['hawaiian','maori','samoan','tonga','polynesian','fijian','gamilaraay','guguyimidjir','yagara','kaurna','adnyamathanha','austral']]];
const b2OrigFam=(name)=>{ const s=String(name||'').toLowerCase();
  for(let g=0;g<B2_ORIGRP.length;g++){ const keys=B2_ORIGRP[g][2];
    for(let i=0;i<keys.length;i++) if(s.indexOf(keys[i])>=0) return g; }
  return -1; };
const b2Has=(k,v)=>b2State()[k].indexOf(v)>=0;
/* does word i survive the filters, with `skip` lifted out? */
function b2Pass(X,i,skip){
  const S=b2State();
  if(skip!=='diff' && S.diff.length && S.diff.indexOf(X.DF[i])<0) return false;
  if(skip!=='odds' && S.odds.length && S.odds.indexOf(X.BP[i])<0) return false;
  if(skip!=='cls'  && S.cls.length  && S.cls.indexOf(X.C[i])<0) return false;
  if(skip!=='orig' && S.orig.length && S.orig.indexOf(X.O[i])<0) return false;
  if(skip!=='pos'  && S.pos.length  && S.pos.indexOf(X.P[i])<0) return false;
  if(skip!=='wl'   && (X.L[i]<S.wlmin || X.L[i]>S.wlmax)) return false;
  if(skip!=='bee'  && S.bee.length){ const b=X.NT[i]; let h=false;
    for(let j=0;j<b.length;j++) if(S.bee.indexOf(b[j])>=0){h=true;break;} if(!h) return false; }
  if(skip!=='tag'  && S.tag.length){ const t=X.TG[i]; let h=false;
    for(let j=0;j<t.length;j++) if(S.tag.indexOf(t[j])>=0){h=true;break;} if(!h) return false; }
  if(skip!=='syl'  && S.syl.length  && S.syl.indexOf(X.SY[i])<0) return false;
  if(skip!=='fl'   && S.fl.length   && S.fl.indexOf(X.FL[i])<0) return false;
  /* the flag chips are ANDed, not ORed: "has a sentence" plus "has a recorded voice"
     means both, because each one is a promise about the card a child will see */
  if(skip!=='flag' && S.flag.length){ for(let j=0;j<S.flag.length;j++) if(!(X.F[i]&S.flag[j])) return false; }
  if(skip!=='pool' && S.pool){
    const w=X.W[i];
    if(S.pool==='champ'   && !(X.F[i]&128)) return false;
    if(S.pool==='missed'  && !b2Mine().miss[w]) return false;
    if(S.pool==='mastered'&& !b2Mine().mast[w]) return false;
    if(S.pool==='todo'    &&  b2Mine().mast[w]) return false;
  }
  if(S.starts && X.W[i].indexOf(S.starts)!==0) return false;
  if(S.has    && X.W[i].indexOf(S.has)<0) return false;
  if(S.ends   && X.W[i].slice(-S.ends.length)!==S.ends) return false;
  return true;
}
/* the child's own history, rebuilt per render — c.missed caps at 200 and luMastered
   is a plain map, so this is cheap and always current */
let _b2Mine=null, _b2MineAt=0;
function b2Mine(){
  const now=Date.now(); if(_b2Mine && now-_b2MineAt<400) return _b2Mine;
  const c=active()||{}, miss=Object.create(null), mast=Object.create(null);
  for(const m of (c.missed||[])) if(m&&m.w) miss[String(m.w).toLowerCase()]=1;
  for(const k in (state.luMastered||{})) if(state.luMastered[k]) mast[String(k).toLowerCase()]=1;
  _b2MineAt=now; return (_b2Mine={miss,mast});
}
function b2Hits(){ const X=b2Idx(), out=[];
  for(let i=0;i<X.N;i++) if(b2Pass(X,i,null)) out.push(i); return out; }
/* counts for one facet, with that facet lifted — so "Latin (412)" means
   "412 if you add Latin to what you have already chosen" */
function b2Counts(kind,len){
  const X=b2Idx(), c=new Int32Array(len);
  for(let i=0;i<X.N;i++){ if(!b2Pass(X,i,kind)) continue;
    if(kind==='tag'){ const t=X.TG[i]; for(let j=0;j<t.length;j++) c[t[j]]++; }
    else if(kind==='bee'){ const b=X.NT[i]; for(let j=0;j<b.length;j++) c[b[j]]++; }
    else if(kind==='diff'){ c[X.DF[i]]++; }
    else if(kind==='odds'){ c[X.BP[i]]++; }
    else if(kind==='cls'){ c[X.C[i]]++; }
    else if(kind==='orig'){ if(X.O[i]>=0) c[X.O[i]]++; }
    else if(kind==='pos'){ if(X.P[i]>=0) c[X.P[i]]++; }
    else if(kind==='syl'){ if(X.SY[i]<len) c[X.SY[i]]++; }
    else if(kind==='fl'){ if(X.FL[i]>=0 && X.FL[i]<len) c[X.FL[i]]++; }
    else if(kind==='flag'){ for(let j=0;j<len;j++) if(X.F[i]&(1<<j)) c[j]++; }
    else if(kind==='pool'){ const w=X.W[i], M=b2Mine();
      c[0]++; if(X.F[i]&128) c[1]++; if(M.miss[w]) c[2]++; if(M.mast[w]) c[3]++; else c[4]++; }
  }
  return c;
}
/* the chosen words: a deterministic shuffle of the hits, cut to size, then set
   back into the easy->hard order the practice ramp wants */
function b2Pick(){
  const X=b2Idx(), S=b2State(), hits=b2Hits();
  let seed=S.seed||1; const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const a=hits.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; }
  const cut=(S.size==='all')?a:a.slice(0,S.size);
  return cut.map(i=>X.REC[i]).sort((p,q)=>((p.y||3)-(q.y||3))||(String(p.w).length-String(q.w).length)||String(p.w).localeCompare(String(q.w)));
}
/* how many Levels a list of n words becomes on the way to mastery */
function bldLevels(n){ return n<=WORK_MAX?1:Math.max(2,Math.min(24,Math.round(n/50))); }
/* the save path (bldCreate) still asks for bldPick(), so it keeps working */
function bldPick(){ return b2Pick(); }
function bldSuggest(){
  const X=b2Idx(), S=b2State(), bits=[];
  if(S.diff.length===1) bits.push((B2_DIFF[S.diff[0]]||{}).lab||'');
  if(S.odds.length===1) bits.push((B2_ODDS[S.odds[0]]||{}).lab||'');
  if(S.cls.length===1) bits.push(B2_CLS[X.cL[S.cls[0]]]||'');
  if(S.orig.length===1) bits.push(X.oL[S.orig[0]]);
  if(S.tag.length===1) bits.push(X.tL[S.tag[0]]);
  if(S.bee.length===1) bits.push(X.nL[S.bee[0]]);
  if(S.pos.length===1) bits.push(X.pL[S.pos[0]]);
  if(S.starts) bits.push('starts ' + S.starts);
  if(S.has) bits.push('has ' + S.has);
  return (bits.filter(Boolean).slice(0,3).join(' · ') || 'My word list'); }
function viewBuilder(){
  const S=state, B=b2State(), X=b2Idx();
  const hits=b2Hits(), picked=b2Pick(), n=picked.length;
  const lv=bldLevels(n), per=n?Math.ceil(n/lv):0;
  const K=v=>v>=1000?(v/1000).toFixed(v>=10000?0:1)+'k':''+v;

  /* one chip: label, live count, and dead when it would leave nothing */
  const chip=(group,val,label,count,on)=>`<button data-act="b2Tog" data-arg="${escA(group+':'+val)}"${(!count&&!on)?' disabled':''}
    style="display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:7px 11px;border-radius:10px;font-weight:750;font-size:12.5px;line-height:1.2;
    border:1px solid ${on?'var(--action,var(--accent))':'var(--line)'};
    background:${on?'color-mix(in srgb,var(--action,var(--accent)) 13%,var(--paper,#fff))':'var(--surface2)'};
    color:${on?'var(--action,var(--accent))':(count?'var(--text)':'var(--muted)')};${(!count&&!on)?'opacity:.45;cursor:default':'cursor:pointer'}">
    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${esc(label)}</span>
    <span style="font-variant-numeric:tabular-nums;font-weight:700;font-size:11px;opacity:.72;flex:0 0 auto">${K(count)}</span></button>`;

  /* SECTIONS COLLAPSE, and that is not decoration — it is what makes the rail
     usable at all. Fifteen groups open at once is 3,851px of rail against an 804px
     window: even once it scrolls (it did not, see the rail div below), finding
     "First letter" means five screens of a nested scroll region with no map. Closed,
     every group is on screen at once and the summary beside each title says what it
     is set to, so the rail reads as a list of questions rather than a wall of chips.
     A group with something chosen forces itself open — a filter you cannot see is
     how you end up wondering why the count is what it is. */
  const secOpen=(k)=>B.open[k]===1;
  const sec=(key,title,state2,body,forceOpen)=>{ const on=secOpen(key)||!!forceOpen;
    return `<div style="border-bottom:1px solid var(--line)">
    <button data-act="b2Sec" data-arg="${escA(key)}" style="width:100%;display:flex;align-items:center;gap:8px;padding:12px 14px;background:none;border:0;text-align:left;cursor:pointer">
      <h3 style="font-size:13px;font-weight:800;margin:0;flex:0 0 auto">${esc(title)}</h3>
      <span style="font-size:11.5px;font-weight:700;color:${state2==='any'||state2==='anything'?'var(--muted)':'var(--action,var(--accent))'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1 1 auto">${esc(state2)}</span>
      <span style="flex:0 0 auto;line-height:0;color:var(--muted);transform:rotate(${on?0:-90}deg);transition:transform .15s">${iconSVG('chevronDown',14)}</span>
    </button>
    ${on?`<div style="display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 13px">${body}</div>`:''}</div>`; };

  /* 1 · the two spelling bands (see B2_DIFF / B2_ODDS for why these and not `y`) */
  const cDiff=b2Counts('diff',B2_DIFF.length);
  const diffChips=B2_DIFF.map((b,i)=>({b,i,c:cDiff[i]})).filter(x=>x.c||b2Has('diff',x.i))
    .map(x=>chip('diff',x.i,x.b.lab,x.c,b2Has('diff',x.i))).join('');
  const cOdds=b2Counts('odds',B2_ODDS.length);
  const oddsChips=B2_ODDS.map((b,i)=>({b,i,c:cOdds[i]})).filter(x=>x.c||b2Has('odds',x.i))
    .map(x=>chip('odds',x.i,x.b.lab,x.c,b2Has('odds',x.i))).join('');
  /* 2 · how many */
  const sizeChips=B2_SIZES.map(v=>`<button data-act="b2Size" data-arg="${v}" style="padding:7px 11px;border-radius:10px;font-weight:750;font-size:12.5px;border:1px solid ${B.size===v?'var(--action,var(--accent))':'var(--line)'};background:${B.size===v?'color-mix(in srgb,var(--action,var(--accent)) 13%,var(--paper,#fff))':'var(--surface2)'};color:${B.size===v?'var(--action,var(--accent))':'var(--text)'}">${v}</button>`).join('')
    + `<button data-act="b2Size" data-arg="all" style="padding:7px 11px;border-radius:10px;font-weight:750;font-size:12.5px;border:1px solid ${B.size==='all'?'var(--action,var(--accent))':'var(--line)'};background:${B.size==='all'?'color-mix(in srgb,var(--action,var(--accent)) 13%,var(--paper,#fff))':'var(--surface2)'};color:${B.size==='all'?'var(--action,var(--accent))':'var(--text)'}">All ${K(hits.length)}</button>`;
  /* 3 · word length */
  const lenBody=`<div style="width:100%">
    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--muted)"><span>Shortest</span><b style="color:var(--text);font-variant-numeric:tabular-nums">${B.wlmin}</b></div>
    <input type="range" data-inp="b2WlMin" min="3" max="24" value="${B.wlmin}" data-fkey="b2wlmin" style="width:100%;accent-color:var(--action,var(--accent))">
    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--muted);margin-top:4px"><span>Longest</span><b style="color:var(--text);font-variant-numeric:tabular-nums">${B.wlmax>=24?'24+':B.wlmax}</b></div>
    <input type="range" data-inp="b2WlMax" min="3" max="24" value="${B.wlmax}" data-fkey="b2wlmax" style="width:100%;accent-color:var(--action,var(--accent))">
  </div>`;
  /* 4 · bee tier */
  const cBee=b2Counts('bee',X.nL.length);
  const beeChips=X.nL.map((lab,i)=>({lab,i,c:cBee[i]})).filter(x=>x.c||b2Has('bee',x.i))
    .sort((a,b)=>b.c-a.c).slice(0,10).map(x=>chip('bee',x.i,x.lab,x.c,b2Has('bee',x.i))).join('') || `<span style="font-size:12px;color:var(--muted)">no tiers in this selection</span>`;
  /* 5 · why it's tricky */
  const cCls=b2Counts('cls',X.cL.length);
  const clsChips=X.cL.map((k,i)=>({k,i,c:cCls[i]})).filter(x=>x.c||b2Has('cls',x.i))
    .sort((a,b)=>b.c-a.c).map(x=>chip('cls',x.i,B2_CLS[x.k]||x.k,x.c,b2Has('cls',x.i))).join('');
  /* a group tab: narrows which chips are offered below it, never the words */
  const gtab=(act,val,label,count,on)=>`<button data-act="${act}" data-arg="${escA(val)}"
    style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;font-weight:800;font-size:11.5px;line-height:1.2;
    border:1px solid ${on?'var(--action,var(--accent))':'transparent'};
    background:${on?'color-mix(in srgb,var(--action,var(--accent)) 13%,var(--paper,#fff))':'var(--chip,var(--surface2))'};
    color:${on?'var(--action,var(--accent))':'var(--muted)'};cursor:pointer">
    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${esc(label)}</span>
    ${count!=null?`<span style="font-variant-numeric:tabular-nums;font-weight:700;font-size:10.5px;opacity:.7">${K(count)}</span>`:''}</button>`;

  /* 6 · subject, grouped. Chips are limited to the chosen group; with no group
     chosen it is the whole subject vocabulary by count, as before — but with the
     origin-family and eponym tags lifted out, so the top of the list is finally
     subjects rather than olatin / ooldeng / ofrench / ogreek. */
  const cTag=b2Counts('tag',X.tL.length);
  const qt=(B.qtag||'').toLowerCase();
  const tgSel=B.tgrp===''?null:(B.tgrp==='_'?-1:B2_TAGGRP.findIndex(g=>g[0]===B.tgrp));
  const tagPool=X.tL.map((lab,i)=>({lab,i,c:cTag[i],g:X.tG[i]})).filter(x=>x.g!==-2);
  /* a group's tab count is what that group would contribute, so an empty group is
     visibly empty rather than a tab that leads to "nothing matches that" */
  const tgCount=g=>tagPool.reduce((s,x)=>s+(x.g===g?x.c:0),0);
  const tagTabs=B2_TAGGRP.map((g,i)=>({g,i,n:tgCount(i)})).filter(x=>x.n||tgSel===x.i)
    .map(x=>gtab('b2TGrp',x.g[0],x.g[1],x.n,tgSel===x.i)).join('')
    + (tagPool.some(x=>x.g===-1) ? gtab('b2TGrp','_','Everything else',tgCount(-1),tgSel===-1) : '');
  const tagChips=tagPool
    .filter(x=>(x.c||b2Has('tag',x.i)) && (tgSel==null||x.g===tgSel)
               && (!qt || x.lab.toLowerCase().indexOf(qt)>=0))
    .sort((a,b)=>b.c-a.c).slice(0,tgSel==null?28:60)
    .map(x=>chip('tag',x.i,x.lab,x.c,b2Has('tag',x.i))).join('')
    || `<span style="font-size:12px;color:var(--muted)">nothing matches that</span>`;
  /* 7 · origin, grouped into language families the same way */
  const cOr=b2Counts('orig',X.oL.length);
  const qo=(B.qorig||'').toLowerCase();
  const ogSel=B.ogrp===''?null:(B.ogrp==='_'?-1:B2_ORIGRP.findIndex(g=>g[0]===B.ogrp));
  const origPool=X.oL.map((lab,i)=>({lab,i,c:cOr[i],g:X.oG[i]}));
  const ogCount=g=>origPool.reduce((s,x)=>s+(x.g===g?x.c:0),0);
  const origTabs=B2_ORIGRP.map((g,i)=>({g,i,n:ogCount(i)})).filter(x=>x.n||ogSel===x.i)
    .map(x=>gtab('b2OGrp',x.g[0],x.g[1],x.n,ogSel===x.i)).join('')
    + (origPool.some(x=>x.g===-1) ? gtab('b2OGrp','_','Other',ogCount(-1),ogSel===-1) : '');
  const origChips=origPool
    .filter(x=>(x.c||b2Has('orig',x.i)) && (ogSel==null||x.g===ogSel)
               && (!qo || x.lab.toLowerCase().indexOf(qo)>=0))
    .sort((a,b)=>b.c-a.c).slice(0,ogSel==null?28:60)
    .map(x=>chip('orig',x.i,x.lab,x.c,b2Has('orig',x.i))).join('')
    || `<span style="font-size:12px;color:var(--muted)">nothing matches that</span>`;
  /* 8 · part of speech */
  const cPos=b2Counts('pos',X.pL.length);
  const posChips=X.pL.map((lab,i)=>({lab,i,c:cPos[i]})).filter(x=>x.c||b2Has('pos',x.i))
    .sort((a,b)=>b.c-a.c).slice(0,12).map(x=>chip('pos',x.i,x.lab,x.c,b2Has('pos',x.i))).join('');

  /* an input reports through data-inp, which hands the handler ONE value — so each
     field gets its own action rather than a shared one with a key argument */
  const fld=(act,key,ph,val)=>`<input type="text" data-inp="${act}${key.charAt(0).toUpperCase()+key.slice(1)}" data-fkey="b2${key}" value="${escA(val||'')}" placeholder="${escA(ph)}" maxlength="12"
    style="flex:1 1 120px;min-width:0;padding:8px 11px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font:inherit;font-size:13px;font-weight:700">`;

  /* 9 · which words to draw from at all */
  const POOLS=[['','Every word'],['champ','Championship words'],['missed','Words I got wrong'],
               ['mastered','Words I’ve mastered'],['todo','Not mastered yet']];
  const cPool=b2Counts('pool',5);
  const poolChips=POOLS.map(([v,lab],i)=>{ const on=(B.pool||'')===v; const cnt=cPool[i];
    return `<button data-act="b2Pool" data-arg="${escA(v)}"${(!cnt&&!on)?' disabled':''}
      style="display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:7px 11px;border-radius:10px;font-weight:750;font-size:12.5px;line-height:1.2;
      border:1px solid ${on?'var(--action,var(--accent))':'var(--line)'};
      background:${on?'color-mix(in srgb,var(--action,var(--accent)) 13%,var(--paper,#fff))':'var(--surface2)'};
      color:${on?'var(--action,var(--accent))':(cnt?'var(--text)':'var(--muted)')};${(!cnt&&!on)?'opacity:.45;cursor:default':'cursor:pointer'}">
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${esc(lab)}</span>
      <span style="font-variant-numeric:tabular-nums;font-weight:700;font-size:11px;opacity:.72;flex:0 0 auto">${K(cnt)}</span></button>`; }).join('');
  /* 10 · syllables */
  const cSyl=b2Counts('syl',10);
  const sylChips=[1,2,3,4,5,6,7,8,9].filter(i=>cSyl[i]||b2Has('syl',i))
    .map(i=>chip('syl',i,(i>=6?'6+':String(i)),cSyl[i],b2Has('syl',i))).join('');
  /* 11 · first letter */
  const cFl=b2Counts('fl',26);
  const flChips=Array.from({length:26},(_,i)=>i).filter(i=>cFl[i]||b2Has('fl',i))
    .map(i=>chip('fl',i,String.fromCharCode(65+i),cFl[i],b2Has('fl',i))).join('');
  /* 12 · what the word card will actually carry, and 13 · how it sounds */
  const FLAGS=[[1,'A meaning'],[2,'An example sentence'],[4,'A known misspelling'],[8,'A recorded voice']];
  const SOUND=[[16,'Sounds like another word'],[32,'Two ways to say it'],[64,'Wears an accent mark']];
  const cFlag=b2Counts('flag',8);
  const bit=b=>Math.round(Math.log2(b));
  const flagChips=FLAGS.map(([b,lab])=>chip('flag',b,lab,cFlag[bit(b)],b2Has('flag',b))).join('');
  const soundChips=SOUND.map(([b,lab])=>chip('flag',b,lab,cFlag[bit(b)],b2Has('flag',b))).join('')
    || `<span style="font-size:12px;color:var(--muted)">sound tables still loading…</span>`;

  const nSel=B.diff.length+B.odds.length+B.bee.length+B.cls.length+B.orig.length+B.tag.length+B.pos.length
    +B.syl.length+B.fl.length+B.flag.length+(B.pool?1:0)
    +(B.starts?1:0)+(B.has?1:0)+(B.ends?1:0)+((B.wlmin>3||B.wlmax<24)?1:0);

  /* NO `overflow` IN THIS INLINE STYLE. The stylesheet gives this element
     overflow-y:auto under a max-height so the rail scrolls beside the results —
     but an inline declaration beats every rule in the sheet, so `overflow:hidden`
     here won the cascade and turned that max-height into a guillotine: 2,798px of
     filters below the cut, no scrollbar, and nothing on screen to say they were
     there. It looked like a short rail rather than a broken one, which is why it
     survived the faceted rebuild. The rounded corners still clip — the sheet sets
     overflow-x:hidden alongside the auto. */
  const rail=`<div style="background:var(--surface);border:1px solid var(--line);border-radius:16px;align-self:start">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface2)">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        <span style="display:inline-flex;line-height:0;color:var(--action,var(--accent))">${iconSVG('sliders',16)}</span>
        <h2 style="font-size:11.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin:0;font-weight:800">Build from</h2></div>
      ${nSel?`<button data-act="b2Clear" style="display:inline-flex;align-items:center;gap:5px;background:none;border:0;color:var(--action,var(--accent));font-weight:800;font-size:12px;padding:0">${iconSVG('x',13)} Clear ${nSel}</button>`:''}
    </div>
    ${sec('diff','How hard to spell', B.diff.length?B.diff.length+' chosen':'any', diffChips, B.diff.length)}
    ${sec('odds','How likely at a bee', B.odds.length?B.odds.length+' chosen':'any', oddsChips, B.odds.length)}
    ${sec('size','How many words', B.size==='all'?'every match':B.size+' words', sizeChips)}
    ${sec('wl','Word length', (B.wlmin>3||B.wlmax<24)?(B.wlmin+'–'+(B.wlmax>=24?'24+':B.wlmax)+' letters'):'any', lenBody, (B.wlmin>3||B.wlmax<24))}
    ${sec('bee','Seen in a spelling bee', B.bee.length?B.bee.length+' chosen':'any', beeChips, B.bee.length)}
    ${sec('cls','Why it’s tricky', B.cls.length?B.cls.length+' chosen':'any', clsChips, B.cls.length)}
    ${sec('tag','Subject', B.tag.length?B.tag.length+' chosen':'any',
      `<div style="width:100%;display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">${tagTabs}</div>
       <div style="width:100%;margin-bottom:8px">${fld('b2Q','qtag','Search every subject…',B.qtag)}</div>${tagChips}`)}
    ${sec('orig','Language of origin', B.orig.length?B.orig.length+' chosen':'any',
      `<div style="width:100%;display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">${origTabs}</div>
       <div style="width:100%;margin-bottom:8px">${fld('b2Q','qorig','Search every language…',B.qorig)}</div>${origChips}`)}
    ${sec('pos','Part of speech', B.pos.length?B.pos.length+' chosen':'any', posChips, B.pos.length)}
    ${sec('pool','Draw from', (POOLS.find(p=>p[0]===(B.pool||''))||POOLS[0])[1], poolChips, B.pool)}
    ${sec('syl','Syllables', B.syl.length?B.syl.length+' chosen':'any', sylChips, B.syl.length)}
    ${sec('fl','First letter', B.fl.length?B.fl.map(i=>String.fromCharCode(65+i)).join(' '):'any', flChips, B.fl.length)}
    ${sec('flag','Must come with', B.flag.filter(f=>f<16).length?B.flag.filter(f=>f<16).length+' chosen':'anything', flagChips, B.flag.filter(f=>f<16).length)}
    ${sec('snd','How it sounds', B.flag.filter(f=>f>=16).length?B.flag.filter(f=>f>=16).length+' chosen':'any', soundChips, B.flag.filter(f=>f>=16).length)}
    ${sec('ltr','Letters', [B.starts&&('starts '+B.starts),B.has&&('has '+B.has),B.ends&&('ends '+B.ends)].filter(Boolean).join(' · ')||'any',
      `<div style="display:flex;gap:7px;flex-wrap:wrap;width:100%">${fld('b2Txt','starts','Starts with…',B.starts)}${fld('b2Txt','has','Contains…',B.has)}${fld('b2Txt','ends','Ends with…',B.ends)}</div>`,
      B.starts||B.has||B.ends)}
  </div>`;

  /* the active choices, as removable pills */
  const pill=(group,val,label)=>`<button data-act="b2Tog" data-arg="${escA(group+':'+val)}" style="display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:750;border:1px solid color-mix(in srgb,var(--action,var(--accent)) 45%,var(--line));background:color-mix(in srgb,var(--action,var(--accent)) 11%,var(--paper,#fff));color:var(--action,var(--accent))">${esc(label)} ${iconSVG('x',11)}</button>`;
  const pills=[
    ...B.diff.map(v=>pill('diff',v,(B2_DIFF[v]||{}).lab||('Band '+v))),
    ...B.odds.map(v=>pill('odds',v,(B2_ODDS[v]||{}).lab||('Odds '+v))),
    ...B.bee.map(v=>pill('bee',v,X.nL[v])),
    ...B.cls.map(v=>pill('cls',v,B2_CLS[X.cL[v]]||X.cL[v])),
    ...B.tag.map(v=>pill('tag',v,X.tL[v])),
    ...B.orig.map(v=>pill('orig',v,X.oL[v])),
    ...B.pos.map(v=>pill('pos',v,X.pL[v])),
    ...B.syl.map(v=>pill('syl',v,(v>=6?'6+':v)+' syllable'+(v>1?'s':''))),
    ...B.fl.map(v=>pill('fl',v,'starts '+String.fromCharCode(65+v))),
    ...B.flag.map(v=>pill('flag',v,((FLAGS.concat(SOUND)).find(f=>f[0]===v)||[0,'flag'])[1])),
    B.pool?pill('pool',B.pool,(POOLS.find(p=>p[0]===B.pool)||[0,''])[1]):'',
    B.starts?pill('starts',B.starts,'starts “'+B.starts+'”'):'',
    B.has?pill('has',B.has,'contains “'+B.has+'”'):'',
    B.ends?pill('ends',B.ends,'ends “'+B.ends+'”'):'',
    (B.wlmin>3||B.wlmax<24)?pill('wl','reset',B.wlmin+'–'+(B.wlmax>=24?'24+':B.wlmax)+' letters'):''
  ].filter(Boolean).join('');

  const shown=(B.tab==='all')?b2Hits().slice(0,600).map(i=>X.REC[i]):picked;
  const wordChips=shown.map(w=>`<button data-act="openWordCard" data-arg="${escA(w.w)}" title="${escA(w.d||'')}"
      style="padding:6px 11px;border-radius:9px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:700;font-size:13px">${esc(w.w)}</button>`).join('')
    || `<div style="padding:26px 4px;text-align:center;color:var(--muted);font-size:13.5px;font-weight:700">Nothing matches all of those choices yet — clear one to widen the net.</div>`;

  const tab=(k,label,count)=>`<button data-act="b2Tab" data-arg="${k}" role="tab" aria-selected="${B.tab===k}"
    style="padding:9px 14px;border-radius:10px 10px 0 0;font-weight:800;font-size:13px;border:1px solid ${B.tab===k?'var(--line)':'transparent'};border-bottom:${B.tab===k?'1px solid var(--surface)':'1px solid var(--line)'};background:${B.tab===k?'var(--surface)':'transparent'};color:${B.tab===k?'var(--text)':'var(--muted)'}">${esc(label)} <span style="font-variant-numeric:tabular-nums;opacity:.7;font-weight:700">${K(count)}</span></button>`;

  const main=`<div style="background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;min-width:0">
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:15px 17px;border-bottom:1px solid var(--line)">
      <div style="min-width:0">
        <div style="font-family:var(--display);font-weight:800;font-size:30px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--action,var(--accent))">${K(n)}</div>
        <div style="font-size:12.5px;color:var(--muted);font-weight:700">${n?`in your list · ${lv} Level${lv>1?'s':''} to mastery · ~${per} a Level`:'nothing chosen yet'}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        <button data-act="b2Shuffle" style="display:inline-flex;align-items:center;gap:7px;padding:11px 15px;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:800;font-size:13.5px">${iconSVG('retry',15)} Shuffle</button>
        <button data-act="bldNameOpen"${n?'':' disabled'} style="display:inline-flex;align-items:center;gap:7px;padding:11px 17px;border-radius:12px;border:1px solid var(--action,var(--accent));background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:13.5px;box-shadow:var(--edge);${n?'':'opacity:.45'}">${iconSVG('check',15)} Save this list</button>
      </div>
    </div>
    ${pills?`<div style="display:flex;gap:6px;flex-wrap:wrap;padding:11px 17px;border-bottom:1px solid var(--line);background:var(--surface2)">${pills}</div>`:''}
    ${S.bldNaming?`<div style="padding:13px 17px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" data-fkey="bldName" value="${escA(S.bldNameVal||'')}" data-inp="bldName" placeholder="${escA(bldSuggest())}" maxlength="48"
          style="flex:1 1 220px;min-width:0;padding:11px 13px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font:inherit;font-weight:750">
        <button data-act="bldCreate" style="padding:11px 17px;border-radius:11px;border:1px solid var(--action,var(--accent));background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:13.5px">Create &amp; practise</button>
        <button data-act="bldNameCancel" style="padding:11px 15px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:800;font-size:13.5px">Cancel</button>
      </div>`:''}
    <div style="display:flex;gap:4px;padding:11px 17px 0;border-bottom:1px solid var(--line)">
      ${tab('list','Your list',n)}${tab('all','Everything that matches',hits.length)}
    </div>
    <div style="padding:15px 17px;display:flex;gap:7px;flex-wrap:wrap;max-height:52vh;overflow:auto">${wordChips}</div>
    ${(B.tab==='all'&&hits.length>600)?`<div style="padding:0 17px 15px;font-size:12px;color:var(--muted);font-weight:700">showing the first 600 of ${K(hits.length)} — narrow the filters or save the list to keep them all</div>`:''}
  </div>`;

  return `<div class="sb-page">
    ${pageHead('List Builder','Any mix of fourteen filters','Every choice shows how many words it would leave',
      '', 'setNav','Library','explore','sliders')}
    <div class="b2-wrap">${rail}${main}</div>
  </div>`;
}
/* The drill-down: every card in one state, grouped by chapter, each row jumping to that card. */
function viewTtList(){ const st=state.ttList; if(!st) return ''; const c=active();
  const LAB={mastered:['Mastered','#2FA35C','🏆'],tested:['Tested','#E0922E','✍️'],practised:['Practised','#7C5CFF','📖'],revise:['To revise','#C8791B','↓']}[st]||['Cards','#7C5CFF','🃏'];
  const rows=ttCardsInState(c,st);
  const body=rows.length?rows.slice(0,400).map(r=>`<button data-act="ttGoCard" data-arg="${escA(r.th+'|'+r.i)}" style="display:flex;gap:10px;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:10px 12px;margin-bottom:7px">
      <span style="flex-shrink:0">${r.e}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-size:13px;font-weight:650;line-height:1.35;color:var(--text)">${esc(trunc(r.q.q,110))}</span>
      <span style="display:block;font-size:11px;color:var(--muted);font-weight:700;margin-top:2px">${esc(r.label)}</span></span>
      <span style="flex-shrink:0;color:var(--accent);font-weight:800;font-size:12px;align-self:center">→</span></button>`).join('')
    : `<div style="font-size:13px;color:var(--muted);padding:14px 0">No cards in this state yet.</div>`;
  return `<div style="position:fixed;inset:0;z-index:132;display:grid;place-items:start center;padding:18px;background:rgba(20,12,4,.55);overflow:auto" data-act="ttListClose">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;max-width:640px;width:100%;padding:20px;box-shadow:0 20px 60px rgba(20,10,30,.5);animation:sb-pop .3s ease both;margin:12px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-family:var(--display);font-weight:800;font-size:19px;color:${LAB[1]}">${LAB[2]} ${LAB[0]}</span>
        <span style="font-size:12.5px;color:var(--muted);font-weight:700">${fmtN(rows.length)} card${rows.length===1?'':'s'}</span>
        <button data-act="ttListClose" style="margin-left:auto;width:34px;height:34px;border-radius:10px;background:var(--surface2);color:var(--muted);font-weight:800">✕</button></div>
      ${body}
      ${rows.length>400?`<div style="font-size:12px;color:var(--muted);font-weight:700;padding:6px 0">Showing the first 400 of ${fmtN(rows.length)}.</div>`:''}
    </div></div>`; }
function viewFinder(){ const S=state; const c=active(); const q=S.finderQ||'';
  const total=countTxt('library')||sbOver(((window.SB_DATA||{}).nsf||[]).length);   /* a lookup reaches the whole library, a letter's chunk at a time (P1.12) */
  const loadBtn=(!window.SB_FULL)?`<button data-act="finderLoadFull" style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">${S.fullLoading?'Loading the full library…':iconSVG('book',14,2.2)+' Load the whole library — '+countTxt('library')+' words'}</button>`:'';
  let body='';
  if(S.finderSel){ const w=S.finderSel;
    const lists=Object.entries(c.builtLists||{});
    const addChips=lists.map(([k,bl])=>`<button data-act="finderAddTo" data-arg="${escA(k)}" style="padding:8px 13px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">＋ ${esc(bl.label)}</button>`).join('');
    body=`${backPill('finderBack','Back to results',null)}
      <div class="sb-card" style="margin-bottom:12px">
        <div class="sb-ct" style="font-size:14px;margin-bottom:8px">Add “${esc(w.w)}” to a list</div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">${addChips}
          <span style="display:inline-flex;gap:6px;align-items:center"><input data-inp="finderName" data-fkey="finderName" value="${escA(S.finderName||'')}" maxlength="30" placeholder="New list name…" style="width:150px;padding:8px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:12.5px;font-weight:700;outline:none"><button data-act="finderCreateAdd" style="padding:8px 14px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">Create + add</button></span></div>
        <div class="sb-cn" style="margin-top:8px">Lists live in the Word Gym — practise them any time.</div>
      </div>
      ${wordFlash([w],0,'noop',{})}`;
  } else {
    const rs=finderResults(q);
    const cells=rs.map(r=>`<button data-act="finderPick" data-arg="${escA(r.w)}" style="display:flex;flex-direction:column;gap:3px;text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
        <span style="display:flex;align-items:center;gap:8px;width:100%"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(r.w)}</span>${state.luMastered[nkey(r.w)]?'<span style="color:var(--good);font-weight:800;font-size:11px">✓ mastered</span>':''}<span style="margin-left:auto;color:var(--accent)">${iconSVG('book',15)}</span></span>
        ${r.d?`<span style="font-size:12px;color:var(--muted);line-height:1.4">${esc(trunc(r.d,110))}</span>`:''}</button>`).join('');
    body = q.trim().length<2
      ? `<div class="sb-card" style="text-align:center;padding:34px 20px"><div style="font-size:34px;margin-bottom:8px">🔎</div><div class="sb-ct">Type at least two letters</div><div class="sb-cs" style="margin-top:4px">Search the whole library — every word opens its learn card with meaning, sentence and pronunciation.</div></div>`
      : (rs.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:9px">${cells}</div>`
        :(fullLooking(q)?`<div class="sb-card" style="text-align:center;padding:30px 20px" data-finder-looking><div class="sb-ct">Looking “${esc(q)}” up in the whole library…</div></div>`
        :`<div class="sb-card" style="text-align:center;padding:30px 20px"><div class="sb-ct">No matches for “${esc(q)}”</div><div class="sb-cs" style="margin-top:4px">${window.SB_FULL?'Try a different spelling.':'Try a different spelling — or load the whole library below to find it inside longer words.'}</div><div style="margin-top:12px">${loadBtn}</div></div>`));
  }
  return `<div style="max-width:860px;margin:0 auto">
    ${pageHead('Word Finder','search '+total+' words','',loadBtn)}
    <div style="position:relative;margin-bottom:14px"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted)">${iconSVG('book',18)}</span>
      <input data-inp="finderQ" data-fkey="finderQ" value="${escA(q)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type a word… e.g. iridescent" style="width:100%;padding:14px 16px 14px 44px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:17px;outline:none"></div>
    ${body}
  </div>`; }
const DIFF_DOT={easy:'#1f9d57',medium:'#c08a00',hard:'#d63a3a'};
/* Word Journeys: 10 era-themed unit bands, lesson covers (same generated-cover language as Concepts) */
const UNIT_PAL=[
  {c:'#6A47F5',c2:'#5A37D6',tex:'stripes'}, // 1 Birth of English
  {c:'#D6453A',c2:'#B8322A',tex:'diag'},    // 2 Latin Engine
  {c:'#13A892',c2:'#0E8A78',tex:'rings'},   // 3 Greek Laboratory
  {c:'#2A63D6',c2:'#1E4DB0',tex:'grid'},    // 4 Norman Invasion
  {c:'#E0922E',c2:'#C8791B',tex:'diag'},    // 5 Word Journeys
  {c:'#9B59D0',c2:'#7E3FB8',tex:'cross'},   // 6 Semantic Time Travel
  {c:'#4F9E6A',c2:'#3C8455',tex:'dots'},    // 7 Cognate Web
  {c:'#4A6B8A',c2:'#37506E',tex:'grid'},    // 8 Language Detectives
  {c:'#E8458C',c2:'#CC2E72',tex:'dots'},    // 9 World Vocabulary
  {c:'#C8901B',c2:'#A8760E',tex:'rings'} ];
const unitPal=(n)=>UNIT_PAL[((n||1)-1)%UNIT_PAL.length]||UNIT_PAL[0];
/* THE JOURNEY COVERS ARE PAINTED (road to 4.5, P3.5 — the audit's "Journeys cards grey blocks": a new child's shelf is
   nearly all locked tales, and a locked cover was the chapter's textured gradient at grayscale(.75)). Each of the ten
   chapters wears a painting of its era from the app's own world banners (app-art/w-<world>-r<2|3>.webp, the strips the
   Word Atlas and the printed books share, 880x244 — wider than any cover draws), the hero word set over it in type; a
   locked tale is the same painting, quieter, with its plan lock under it. Ten chapters, ten different paintings
   (tests/p3-art.cjs). Chapter → painting: the dawn meadow, the Forum, the elements, the war camp, the strait, the
   clockwork at night, the night stacks' thread, the gauges, the Grand Trunk Road, the stage. */
const UNIT_ART=['meadow-r2','forum-r2','elements-r2','warfield-r2','strait-r2','engine-r3','library-r3','engine-r2','grandtrunk-r2','stage-r2'];
const unitArt=(n)=>UNIT_ART[((n||1)-1)%UNIT_ART.length];
function unitCoverArt(n, lk){ return `<img src="app-art/w-${unitArt(n)}.webp" alt="" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${lk?'filter:saturate(.45) brightness(.86)':''}">
    <span aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,9,32,.30) 0%,rgba(14,9,32,.12) 45%,rgba(14,9,32,.46) 100%)"></span>`; }
function unitCoverBG(n){ const f=unitPal(n); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
const titleCase=(w)=> (w||'').charAt(0).toUpperCase()+(w||'').slice(1).toLowerCase();
function lessonHero(L){ if(L._hero) return L._hero; const ws=(L.words||[]).map(x=>x.w).filter(Boolean);
  let pick=ws[0]||L.id, best=1e9; for(const w of ws){ if(w.length<3) continue; const d=Math.abs(w.length-9)+((w.length>=6&&w.length<=12)?0:5); if(d<best){best=d;pick=w;} }
  const h=titleCase(pick); try{ L._hero=h; }catch(e){} return h; }
function lessonCoverCard(L){
  const dn=lessonComplete(L); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''}; const f=unitPal(L.unit);
  const dc=DIFF_DOT[L.diff]||DIFF_DOT.medium; const hero=lessonHero(L); const nW=(L.words||[]).filter(x=>x&&x.w).length;
  const lk=!journeyOpen(L.n);   /* a tale not earned yet and not on the plan: a quiet plan lock, never a price */
  const uname=capWords(u.title); const _dk=state.mode==='dusk'; const cover=`<div class="sb-jcover" data-unit-art="${unitArt(L.unit)}" style="position:relative;height:110px;display:flex;align-items:center;justify-content:center;padding:14px;overflow:hidden;background:${f.c2}">${unitCoverArt(L.unit,lk)}
    <span style="position:absolute;top:10px;left:12px;font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:6px;background:${_dk?'rgba(20,12,40,.72)':'rgba(255,255,255,.92)'};color:${_dk?'#fff':'#241E33'}">${esc(L.id)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${dn?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div class="sb-theme-art" style="position:relative;text-align:center;animation-delay:${(L.n%9)*0.22}s"><div style="font-family:var(--display);color:#FFFFFF;line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${heroFont(hero)}px;text-shadow:0 2px 10px rgba(10,6,24,.75),0 0 2px rgba(10,6,24,.6)">${esc(hero)}</div></div>
  </div>`;
  return `<button class="sb-cover-card" data-act="openLesson" data-arg="${L.n}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(L.title)}</div>
      <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c};margin-top:4px">Chapter ${L.unit} · ${esc(trunc(uname,26))}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(L.bigIdea||L.story||'',92)}</div>
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="padding:3px 9px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span>${lk?lockChip('plan','Comes with the family plan',{fs:11}):`<span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${nW} words →</span>`}</div>
    </div>
  </button>`;
}
function lessonBigCard(L){ const dn=lessonComplete(L); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''}; const f=unitPal(L.unit);
  const dc=DIFF_DOT[L.diff]||DIFF_DOT.medium; const hero=lessonHero(L); const nW=(L.words||[]).filter(x=>x&&x.w).length;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--glow)">
    <div class="sb-jcover" data-unit-art="${unitArt(L.unit)}" style="position:relative;height:150px;display:flex;align-items:center;justify-content:center;padding:18px;overflow:hidden;background:${f.c2}">${unitCoverArt(L.unit,!journeyOpen(L.n))}
      <span style="position:absolute;top:14px;left:15px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85)">${esc(L.id)} · Chapter ${L.unit}</span>
      <span style="position:absolute;top:15px;right:15px;width:11px;height:11px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
      ${dn?'<span style="position:absolute;bottom:13px;right:14px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
      <div style="position:relative;text-align:center;text-shadow:0 2px 10px rgba(10,6,24,.75),0 0 2px rgba(10,6,24,.6)"><div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${Math.min(48,heroFont(hero)+8)}px">${esc(hero)}</div></div>
    </div>
    <div style="padding:clamp(18px,4vw,24px)">
      <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c};margin-bottom:6px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:clamp(20px,4vw,25px);line-height:1.14;margin-bottom:8px">${esc(L.title)}</div>
      <p style="font-size:15px;line-height:1.6;color:var(--text);margin:0 0 18px">${mdInline(trunc(L.bigIdea||L.story||'',200))}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <span style="padding:4px 11px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span>
        ${journeyOpen(L.n)?`<button data-act="openLesson" data-arg="${L.n}" style="padding:12px 20px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Open &amp; study · ${nW} words →</button>`
          :`<button data-act="openLesson" data-arg="${L.n}" style="background:none;border:0;padding:6px 0;min-height:44px">${lockChip('plan','Comes with the family plan')}</button>`}
      </div>
    </div>
  </div>`; }
function viewJourneys(){ const S=state; if(S.lessonSel) return viewLesson();
  const all=lessonsAll(); const units=lessonUnits(); const done=lessonsDoneCount();
  const chaptersDone=units.filter(u=>{ const ls=all.filter(L=>L.unit===u.n); return ls.length && ls.every(L=>lessonComplete(L)); }).length;
  const chaptersTotal=units.length||10;
  if(!all.length) return `<div style="max-width:680px;margin:0 auto;padding:60px 0;text-align:center;color:var(--muted);font-weight:700">Lessons are loading…</div>`;
  /* No paywall card here any more (T3, FIX2 #5): every child sees the shelf; the tales they have
     earned open, the rest wear a quiet plan lock (lessonCoverCard / lessonBigCard). */
  const planAll=journeyOpen(Infinity);
  const earnedN=planAll?0:Math.min(loreCount(),all.length);
  const earnLine=planAll?'':`<p class="sb-cn" style="margin:0 0 8px;font-size:13px;color:var(--text);font-weight:700">Every Stage you clear opens the next tale — ${earnedN?earnedN+' open so far':'clear your first Stage to open one'}. The rest come with the family plan.</p>`;
  const guided=S.journeyView==='guided';
  let main, headDesc, wrapStyle;
  if(guided){
    const N=all.length; const i=Math.min(Math.max(S.journeyPage||0,0),Math.max(0,N-1)); const curL=all[i];
    headDesc='Your guided path — one lesson at a time, in order. Step through, study, and practise.';
    wrapStyle='max-width:680px;margin:0 auto';
    main=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Lesson ${i+1} of ${N}</span><div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round((i+1)/N*100)}%;transition:width .3s"></div></div></div>
      ${lessonBigCard(curL)}
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px"><button data-act="journeyPagePrev" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button><button data-act="journeyPageNext" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'End of the path ✓':'Next lesson →'}</button></div>`;
  } else {
    const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
    headDesc='The history &amp; geography of words, in 10 eras — read a lesson, then practise its five words.';
    wrapStyle='';
    main=units.map(u=>{ const ls=all.filter(L=>L.unit===u.n); if(!ls.length) return '';
      const f=unitPal(u.n); const dc=ls.filter(L=>lessonComplete(L)).length;
      const header=`<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
        <span style="width:10px;height:10px;border-radius:6px;background:${f.c};flex-shrink:0"></span>
        <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:0;color:var(--text)">Chapter ${u.n} · ${esc(capWords(u.title))}</h3>
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);white-space:nowrap">${dc}/${ls.length} done</span>
        <span style="flex:1;height:1px;background:var(--line)"></span>
      </div>`;
      return header+`<div style="${gridStyle}">${ls.map(lessonCoverCard).join('')}</div>`;
    }).join('');
  }
  const pathBtn=`<button data-act="journeySetView" data-arg="${guided?'all':'guided'}" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${guided?('← Browse all '+iconSVG('grid',15)):('Guided path '+iconSVG('arrow',15))}</button>`;
  return `<div style="${wrapStyle}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">${backPill('goHome','Home',null)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">Word Journeys</h2><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">${chaptersTotal} chapters</span></div>${pathBtn}</div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:13px;max-width:52em">${headDesc}</p>
    ${earnLine}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin:12px 0 4px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('book',15)} ${chaptersDone}/${chaptersTotal} chapters</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round(done)}%;transition:width .4s"></div></div>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${done}%</span>
    </div>
    ${main}</div>`; }
/* Motion per theme — the emblem moves like its subject: birds fly, fish swim, plants grow,
   lightning flashes, the clock ticks, the ship rocks, war shakes, the heart beats… */
const THEME_MOTION={
  body:'m-beat', emotions:'m-beat', kinship:'m-beat', disease:'m-shake', pharmacy:'m-grow',
  animals:'m-fly', birds:'m-fly', insects:'m-fly', marine:'m-swim',
  botany:'m-grow', flowers:'m-grow', farming:'m-grow', ecology:'m-grow',
  chemistry:'m-sparkle', minerals:'m-sparkle', colors:'m-sparkle', festivals:'m-sparkle',
  astronomy:'m-spin', physics:'m-spin', maps:'m-spin', time:'m-tick',
  weather:'m-flash', war:'m-shake',
  music:'m-swing', stage:'m-swing', poetry:'m-swing', law:'m-swing',
  seafaring:'m-rock', waterways:'m-swim', dishes:'m-rock',
  vehicles:'m-drive', sports:'m-drive',
};
function themeCard(t){ const c=active(); const cl=themeClusters().find(x=>x.id===t.cluster)||themeClusters()[0];
  const key=themeKey(t.id); const pinned=!!((c.pinnedLists||{})[key]); const st=themeStat(t.id);
  const lvl=listStageIdx(c,key)+1;
  const done=st.total>0 && st.m/st.total>=PATTERN_DONE_PCT;
  return `<div class="sb-cover-card" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${pinned?cl.c:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:104px;display:flex;align-items:center;justify-content:center;padding:12px;${themeCoverBG(cl)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(cl.label)}</span>
      ${done?'<span style="position:absolute;bottom:8px;right:9px;width:21px;height:21px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:12px">✓</span>':''}
      ${pinned?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:12px">MY THEME</span>':''}
      <div class="sb-theme-art ${THEME_MOTION[t.id]||''}" style="animation-delay:${((t.id.length*137)%1800)/1000}s">${themeArtSVG(t.id,58,false)}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(t.label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(t.sub)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
        <div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${done?'var(--good)':cl.c};width:${st.pct}%;transition:width .4s"></div></div>
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">${st.m}/${fmtN(st.total)}</span>
      </div>
      <div style="margin-top:auto;padding-top:11px;display:flex;gap:7px">
        <button data-act="openTheme" data-arg="${t.id}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:10px;background:${cl.c};color:#fff;font-weight:800;font-size:12px;box-shadow:var(--edge)">${iconSVG('bulb',13)} Open</button>
        <button data-act="addTheme" data-arg="${t.id}" title="${pinned?'In your lists — tap to open in the Word Gym':'Add to your lists (top bar in the Word Gym)'}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:10px;font-weight:800;font-size:12px;${pinned?`background:color-mix(in srgb,${cl.c} 13%,var(--bg2));border:1px solid ${cl.c};color:${cl.c}`:'background:var(--surface2);border:1px solid var(--line);color:var(--text)'}">${pinned?('✓ L'+lvl):'+ Add'}</button>
      </div>
    </div>
  </div>`; }
function viewThemes(){ const S=state; const c=active(); ensureLists(c);
  const defs=themeDefs(); const mine=myThemes();
  const mastered=defs.reduce((a,t)=>a+themeStat(t.id).m,0);
  const doneThemes=defs.filter(t=>{ const st=themeStat(t.id); return st.total>0 && st.m/st.total>=PATTERN_DONE_PCT; }).length;
  const myRow = mine.length
    ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px"><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">My themes</span>${mine.map(t=>{ const cl=themeClusters().find(x=>x.id===t.cluster)||{}; return `<button data-act="selectList" data-arg="${themeKey(t.id)}" oncontextmenu="return sbDelList(event,'${themeKey(t.id)}')" title="Train · right-click to remove" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid ${cl.c};background:color-mix(in srgb,${cl.c} 12%,var(--bg2));color:var(--text);font-weight:800;font-size:12px">${esc(t.label)} <span style="opacity:.7;font-size:12px">L${listStageIdx(c,themeKey(t.id))+1}</span></button>`; }).join('')}</div>`
    : `<div style="background:color-mix(in srgb,var(--accent) 9%,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;font-size:13px;color:var(--text)"><b>Pick 3–5 themes you love.</b> Words stick better when they live somewhere — a kitchen, a courtroom, the night sky. Each theme becomes its own level ladder, and it joins your top bar in the Word Gym.</div>`;
  const grid='display:grid;grid-template-columns:repeat(auto-fill,minmax(224px,1fr));gap:13px';
  const sections=themeClusters().map(cl=>{ const ts=defs.filter(t=>t.cluster===cl.id); if(!ts.length) return '';
    return `<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
      <span style="width:10px;height:10px;border-radius:6px;background:${cl.c};flex-shrink:0"></span>
      <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:0;color:var(--text)">${esc(cl.label)}</h3>
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);white-space:nowrap">${ts.length} themes</span>
      <span style="flex:1;height:1px;background:var(--line)"></span>
    </div><div style="${grid}">${ts.map(themeCard).join('')}</div>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Theme Journeys', defs.length+' themes', 'Words by the family they belong to — learn to spot one at the microphone, and the trap it sets.')}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('palette',15)} ${mine.length} picked · ${doneThemes} complete</span>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${fmtN(mastered)} themed words mastered</span>
    </div>
    ${myRow}
    ${sections}
  </div>`; }
/* ===== Theme Journey — the explanation, then the words =====
   The Library used to drop a tap straight into a themed word list. A theme is a
   family of words with a shared history, so it now opens like a concept chapter:
   what the family is, how to spot one at the microphone, the trap it sets, and a
   handful of real examples with their origins. The three study tabs hand over to
   the coach and the vocabulary engine unchanged — this adds a door, not a copy. */
const THEME_WORLD={science:'elements',earth:'strait',living:'meadow',arts:'stage',
  society:'forum',history:'warfield',play:'engine',mind:'library',origins:'grandtrunk',named:'junkyard'};
const THEME_MIN=12;
function viewThemeDetail(){
  const S=state; const c=active(); ensureLists(c);
  const id=S.themeSel; const t=themeOf(id);
  if(!t) return viewThemes();
  const cl=themeClusters().find(x=>x.id===t.cluster)||themeClusters()[0];
  const lore=themeLore(id);
  const ws=themeWords(id); const st=themeStat(id);
  const key=themeKey(id); const pinned=!!((c.pinnedLists||{})[key]);
  const thin=ws.length<THEME_MIN;
  /* Origin themes name their own world in `hero` (the Roman Forum for Latin, the
     Grand Trunk Road for South Asian, the Grey Sea for Nordic), so each language
     family gets its own scenery instead of the whole cluster sharing one. */
  const WORLDS={meadow:1,library:1,forum:1,elements:1,engine:1,strait:1,junkyard:1,vibe:1,stage:1,warfield:1,greysea:1,origami:1,grandtrunk:1};
  const world=(WORLDS[t.hero]?t.hero:null)||THEME_WORLD[t.cluster]||'meadow';
  const tab=S.themeTab||'learn';
  /* six real examples, easiest first, so the page shows the family rather than describing it */
  const samples=ws.slice().sort((a,b)=>(spellDiff(a)-spellDiff(b))||((b.bp||0)-(a.bp||0))).slice(0,6);
  const sampleHTML=samples.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">${samples.map(w=>`
    <div style="background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px">
      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
        <span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(w.w)}</span>
        ${w.p?`<span style="font-family:var(--mono);font-size:11.5px;color:${cl.c};font-weight:700">/ ${esc(w.p)} /</span>`:''}</div>
      ${w.o?`<div style="font-size:11.5px;color:var(--muted);font-weight:700;margin-top:2px">${esc(w.o)}</div>`:''}
      ${w.d?`<div style="font-size:12px;color:var(--text);line-height:1.45;margin-top:4px">${esc(clampTxt(w.d,86))}</div>`:''}
    </div>`).join('')}</div>`:'';
  const para=(kick,body)=>`<div style="margin-bottom:15px">
    <div style="font-family:var(--display);font-weight:800;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:${cl.c};margin-bottom:5px">${kick}</div>
    <p style="margin:0;font-size:15px;line-height:1.62;color:var(--text)">${esc(body)}</p></div>`;
  const learn=lore
    ? para('The idea',lore.i)+para('How to spot one',lore.s)+para('What trips people up',lore.w)
      +(sampleHTML?`<div style="font-family:var(--display);font-weight:800;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:20px 0 8px">Six from this family</div>${sampleHTML}`:'')
    : `<p style="font-size:15px;line-height:1.6;color:var(--muted)">${esc(t.sub)}</p>${sampleHTML}`;
  /* Two steps, not four peers: you read the family first, then you train it. Cards,
     Practise and Meaning are modes inside Train, and the last one is remembered. */
  const TABS=[['learn','Learn','bulb'],['train','Train','pencil']];
  const tabBar=`<div role="tablist" style="display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px">${TABS.map(([k,label,ic])=>{
    const on=k===tab; const dis=thin&&k!=='learn';
    return `<button role="tab" aria-selected="${on}" data-act="themeTab" data-arg="${k}" ${dis?'disabled aria-disabled="true"':''}
      style="display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;font-weight:800;font-size:13px;
      ${on?`background:${cl.c};color:#fff;box-shadow:var(--edge)`:`background:var(--surface2);border:1px solid var(--line);color:${dis?'var(--muted)':'var(--text)'}`}${dis?';opacity:.5':''}">${iconSVG(ic,14)} ${label}</button>`; }).join('')}</div>`;
  const price=(window.ADV&&ADV.price)?ADV.price():299;
  return `<div style="animation:sb-rise .35s ease both;max-width:760px;margin:0 auto">
    <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:16px;height:132px">
      ${themeBannerHTML(world)}
      ${backPill('themeBack','All themes',null)}
      <div style="position:absolute;left:16px;right:16px;bottom:12px;display:flex;align-items:flex-end;gap:12px">
        <div style="width:54px;height:54px;flex-shrink:0;filter:drop-shadow(0 3px 6px rgba(14,9,32,.5))">${themeArtSVG(id,54,false)}</div>
        <span style="min-width:0;flex:1">
          <span style="display:block;font-family:var(--display);font-weight:700;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 4px rgba(0,0,0,.6)">${esc(cl.label)}</span>
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:20px;line-height:1.12;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.55)">${esc(t.label)}</span></span>
        <span style="flex-shrink:0;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:12px;color:#fff;background:rgba(10,6,26,.44);border-radius:999px;padding:5px 12px">${st.m}/${fmtN(ws.length)} mastered</span>
      </div></div>
    ${tabBar}
    ${thin?`<div style="background:color-mix(in srgb,${cl.c} 10%,var(--bg2));border:1px solid color-mix(in srgb,${cl.c} 35%,var(--line));border-radius:14px;padding:13px 16px;margin-bottom:16px;font-size:13px;line-height:1.5">
      <b>Only ${ws.length} ${ws.length===1?'word':'words'} here so far.</b> This family is small in the core library and deepens
      to hundreds of words with the library of ${countTxt('library')} words in the Advanced Pack. Read the explanation now;
      the level ladder opens once there are ${THEME_MIN} words to climb.</div>`:''}
    ${tab==='train' && !thin ? (()=>{ const pref=state.trainPref||'cards';
      const MODES=[['cards','Cards','book','See the word, the meaning and the story, one card at a time.'],
        ['practice','Spell it','pencil','Hear it, type it, get it marked — the drill itself.'],
        ['vocab','Meaning','search','Four choices, one meaning. Vocabulary, not spelling.']];
      const card=(k,label,ic,desc)=>`<button data-act="themeTab" data-arg="${k}" style="display:flex;align-items:flex-start;gap:11px;text-align:left;width:100%;padding:14px 15px;border-radius:14px;margin-bottom:9px;${pref===k?`background:color-mix(in srgb,${cl.c} 12%,var(--bg2));border:1.5px solid ${cl.c}`:'background:var(--surface2);border:1px solid var(--line)'}">
          <span style="display:inline-flex;flex-shrink:0;color:${cl.c}">${iconSVG(ic,19)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15.5px">${label}${pref===k?' <span style="font-size:11px;font-weight:800;color:var(--muted)">· last time</span>':''}</span>
            <span style="display:block;font-size:12.5px;color:var(--muted);line-height:1.45;margin-top:2px">${desc}</span></span>
          <span class="sb-cl">Start →</span></button>`;
      return `<div style="font-family:var(--display);font-weight:800;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:0 0 9px">How do you want to train?</div>
        ${MODES.map(m=>card.apply(null,m)).join('')}
        <button data-act="themeTab" data-arg="learn" style="display:block;margin-top:6px;font-weight:800;font-size:13px;color:var(--muted)">← Read the explanation again</button>`; })()
    : learn}
    ${tab==='train'?'':`<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:22px">
      ${thin?'':`<button data-act="themeTab" data-arg="train" style="flex:1;min-width:150px;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">Train these words →</button>`}
      <button data-act="addTheme" data-arg="${esc(id)}" style="flex:1;min-width:150px;padding:13px;border-radius:14px;font-weight:800;font-size:14.5px;${pinned?`background:color-mix(in srgb,${cl.c} 13%,var(--bg2));border:1px solid ${cl.c};color:${cl.c}`:'background:var(--surface2);border:1px solid var(--line);color:var(--text)'}">${pinned?'✓ In my lists':'+ Add to my lists'}</button>
    </div>`}
  </div>`;
}
/* the painted world banner, shared with the Word Atlas */
function themeBannerHTML(world){
  return `<span style="position:absolute;inset:0;background:linear-gradient(160deg,#4a3f7a,#241e46)"></span>
    <img src="app-art/w-${world}-r2.webp" alt="" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,9,32,.4) 0%,rgba(14,9,32,.06) 38%,rgba(14,9,32,.55) 100%)"></span>`;
}
const clampTxt=(x,n)=>{ x=String(x||''); return x.length>n?x.slice(0,n-1).replace(/[,;:\s]+\S*$/,'')+'…':x; };
function viewLesson(){ const S=state; const L=S.lessonSel; const dn=lessonComplete(L); const ws=lessonWordObjs(L);
  const f=unitPal(L.unit); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''};
  // Each of the 5 words as a rich sub-card: word · pronunciation · syllables · meaning · full etymology (every bullet kept).
  const wordCards=ws.map(w=>{ const ety=(w.etyArr&&w.etyArr.length)?w.etyArr:(w.r?[w.r]:[]);
    return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:6px"><span style="font-family:var(--display);font-weight:800;font-size:17px;letter-spacing:.01em">${esc(w.w)}</span>${w.p?`<span style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:700">/ ${esc(w.p)} /</span>`:''}${w.sy&&w.sy.toLowerCase()!==w.w.toLowerCase()?`<span style="font-size:12px;color:var(--muted);font-weight:700">${esc(w.sy)}</span>`:''}${state.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:12px">✓ mastered</span>':''}<button data-act="say" data-arg="${escA(w.w)}" title="Hear it" style="margin-left:auto;color:var(--accent)">${iconSVG('volume',16)}</button></div>
      ${w.d?`<div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:${ety.length?'7':'0'}px">${esc(w.d)}</div>`:''}
      ${ety.length?`<div style="border-top:1px dashed var(--line);padding-top:8px"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:5px">Etymology</div>${ety.map(e=>`<div style="display:flex;gap:7px;font-size:12px;color:var(--muted);line-height:1.55;margin-bottom:4px"><span style="color:${f.c};flex-shrink:0">•</span><span>${mdInline(e)}</span></div>`).join('')}</div>`:''}
    </div>`; }).join('');
  const act=(label,txt)=>txt?`<div style="margin-bottom:10px"><span style="font-weight:800;font-size:13px;color:${f.c}">${label}.</span> <span style="font-size:13px;color:var(--text);line-height:1.55">${mdInline(txt)}</span></div>`:'';
  // Every lesson is a card flow (like Concepts): one section per card, no content dropped.
  const practiceHTML=(L.practice&&(L.practice.decode||L.practice.trace||L.practice.build))?`${act('Decode it',L.practice.decode)}${act('Trace it',L.practice.trace)}${act('Build it',L.practice.build)}`:'';
  const steps=[];
  if(L.bigIdea) steps.push({tag:'Big idea',ic:'bulb',body:`<p style="margin:0;font-size:15px;line-height:1.62;font-weight:600;color:var(--text)">${mdInline(L.bigIdea)}</p>`});
  if(L.story) steps.push({tag:'The story',ic:'book',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.story)}</p>`});
  if(L.pattern) steps.push({tag:'The pattern',ic:'search',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.pattern)}</p>`});
  steps.push({tag:'The five words',ic:'spark',body:`${wordCards}<button data-act="practiseLesson" style="width:100%;margin-top:6px;padding:13px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Practise these 5 words →</button>`});
  if(L.connection) steps.push({tag:'The connection',ic:'link',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.connection)}</p>`});
  if(practiceHTML) steps.push({tag:'Try with a grown-up',ic:'pencil',body:practiceHTML});
  const N=steps.length; const idx=Math.min(Math.max(S.lessonStep||0,0),N-1); const step=steps[idx];
  const dots=steps.map((s,i)=>`<button data-act="lessonStepGo" data-arg="${i}" style="height:7px;border-radius:999px;flex:1;background:${i<=idx?f.c:'var(--surface2)'}" title="${esc(s.tag)}"></button>`).join('');
  const last=idx>=N-1;
  const nextBtn=last
    ? (()=>{ const nextOpen = L.n<100 && journeyOpen(L.n+1);
        // never dead-end a journey: route to the next unlocked journey, or back to Practice
        return (nextOpen?`<button data-act="openLesson" data-arg="${L.n+1}" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next journey →</button>`:'')+
          `<button data-act="openCoach" style="flex:1;padding:14px;border-radius:14px;background:${nextOpen?'var(--surface2)':'var(--accent)'};color:${nextOpen?'var(--text)':'#fff'};font-weight:800;font-size:15px;${nextOpen?'border:1px solid var(--line)':'box-shadow:var(--edge)'}">Back to the Word Gym →</button>`; })()
    : `<button data-act="lessonStepNext" style="flex:1;padding:14px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next card →</button>`;
  return `<div style="max-width:660px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">${backPill('lessonBack','All lessons',null)}<span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="font-family:var(--display);font-variant-numeric:tabular-nums">${L.id}</span> · <span style="text-transform:capitalize">${L.diff}</span> <span style="width:9px;height:9px;border-radius:50%;background:${DIFF_DOT[L.diff]}"></span></span></div>
    <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:${f.c};margin-bottom:3px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.15;margin:0 0 14px">${esc(L.title)}${dn?' <span style="color:var(--good);font-size:17px">✓</span>':''}</h2>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${N}</span><div style="display:flex;gap:5px;flex:1">${dots}</div></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="lessonStepPrev" style="padding:12px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${idx<=0?'opacity:.4;pointer-events:none':''}">← Back</button>${nextBtn}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--glow);animation:sb-rise .3s ease both">
      <div style="height:6px;${unitCoverBG(L.unit)}"></div>
      <div style="padding:clamp(18px,4vw,24px)">
        <div style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:15px;color:${f.c};margin-bottom:12px">${iconSVG(step.ic,18)} ${step.tag}</div>
        ${step.body}
      </div>
    </div>
  </div>`; }
/* ===================== OVERLAYS ===================== */
function fullListOverlay(){ const S=state; if(!S.listView) return '';
  const key=S.listView; const label=(key==='journey'?journeyName():listLabel(key).split(' · ')[0]);
  let words=[]; try{ words=listFullWords(key)||[]; }catch(e){}
  // dedupe + resolve enrichment from the word index for lists that store only bare words
  const idx=(typeof wordIndex==='function')?wordIndex():{}; const seen=new Set(); const all=[];
  for(const w of words){ if(!w||!w.w) continue; const k=nkey(w.w); if(seen.has(k)) continue; seen.add(k);
    const full=(w.d&&w.d.length>3)?w:(idx[k]||w); all.push(full); }
  const total=all.length;
  const q=(S.lvQuery||''); const yf=(S.lvY||'');
  let list=all.filter(w=>(!yf||String(w.y||3)===yf) && (!q||((w.w||'')+' '+(w.d||'')+' '+(w.h||'')+' '+(w.o||'')).toLowerCase().includes(q)));
  // sort by difficulty then alpha for a stable, studyable order
  list=list.slice().sort((a,b)=>((a.y||3)-(b.y||3))||String(a.w).localeCompare(String(b.w)));
  const shown=Math.min(S.lvShown||80, list.length);
  const mastered=(w)=>!!state.luMastered[nkey(w.w)];
  const yPill=(v,l)=>`<button data-act="lvY" data-arg="${v}" style="padding:7px 12px;border-radius:999px;font-weight:800;font-size:12.5px;${yf===String(v)?'background:var(--accent);color:#fff;box-shadow:var(--edge)':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${l}</button>`;
  const ylevels=[...new Set(all.map(w=>w.y||3))].sort();
  const cards=list.slice(0,shown).map(w=>{ const done=mastered(w); const y=w.y||3;
    return `<div style="background:var(--paper,var(--bg2));border:1px solid ${done?'var(--good,#1f9d57)':'var(--line)'};border-radius:14px;padding:13px 15px">
      <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap">
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:18px;font-weight:800;letter-spacing:.01em">${esc(w.w)}</span>
        ${w.p?`<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--accent);font-weight:700">${esc(w.p)}</span>`:''}
        <button data-act="lvSay" data-arg="${escA(w.w)}" title="Hear it" style="width:28px;height:28px;border-radius:8px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG('volume',14)}</button>
        <span style="margin-left:auto;display:inline-flex;align-items:center;gap:7px">${done?`<span style="font-size:11px;font-weight:800;color:var(--good,#1f9d57)">✓ mastered</span>`:''}<span style="font-size:11px;font-weight:800;color:var(--muted);font-family:var(--display);font-variant-numeric:tabular-nums">L${y}</span></span>
      </div>
      ${w.d?`<div style="font-size:13.5px;color:var(--text);margin-top:6px;line-height:1.45">${esc(w.d)}</div>`:''}
      <div style="font-size:12px;color:var(--muted);margin-top:5px;display:flex;gap:13px;flex-wrap:wrap">${w.o?`<span>${esc(w.o)}${w.ps?' · '+esc(w.ps):''}</span>`:''}${w.bp?`<span>bee-prob ${w.bp}</span>`:''}</div>
      ${w.h?`<div style="margin-top:7px;font-size:12.5px;color:var(--muted);padding-left:11px;border-left:3px solid var(--treasure,#F0B429);line-height:1.45"><b style="color:var(--treasure-deep,#8A5B00)">Remember:</b> ${esc(w.h)}</div>`:(w.s?`<div style="margin-top:7px;font-size:12.5px;font-style:italic;color:var(--muted);line-height:1.45">“${esc(blankHTML?blankHTML(w.s,w.w):w.s)}”</div>`:'')}
    </div>`; }).join('');
  return `<div data-act="closeListView" style="position:fixed;inset:0;z-index:95;background:rgba(20,12,50,.5);backdrop-filter:blur(4px);display:flex;justify-content:center;padding:0">
    <div data-act="noop" style="width:100%;max-width:740px;background:var(--bg1,var(--bg2));display:flex;flex-direction:column;max-height:100dvh;box-shadow:var(--sh-overlay)">
      <div style="position:sticky;top:0;background:var(--bg1,var(--bg2));border-bottom:1px solid var(--line);padding:16px clamp(14px,4vw,26px) 12px;z-index:2">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-family:var(--display);font-weight:800;font-size:18px">${esc(label)}</span><span style="font-size:12px;color:var(--muted);font-weight:700">${fmtN(total)} words</span><button data-act="closeListView" style="margin-left:auto;width:32px;height:32px;border-radius:9px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:16px">✕</button></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input data-inp="lvSearch" data-fkey="lvSearch" value="${escA(q)}" placeholder="Search words, meanings, hints…" autocomplete="off" style="flex:1;min-width:160px;padding:9px 13px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;outline:none">
          ${ylevels.length>1?('<div style="display:flex;gap:6px;flex-wrap:wrap">'+yPill('','All')+ylevels.map(y=>yPill(y,'L'+y)).join('')+'</div>'):''}
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:14px clamp(14px,4vw,26px) 30px">
        <div style="font-size:12.5px;color:var(--muted);font-weight:600;margin-bottom:10px">${fmtN(list.length)} shown${(q||yf)?' · filtered':''} · sorted easiest → hardest</div>
        <div style="display:grid;gap:10px">${cards||'<p style="color:var(--muted);text-align:center;padding:30px">No words match.</p>'}</div>
        ${shown<list.length?`<button data-act="lvMore" style="display:block;margin:16px auto 0;background:var(--accent);color:#fff;border-radius:11px;padding:11px 26px;font-weight:800;font-size:14px;box-shadow:var(--edge)">Show more (${fmtN(list.length-shown)} left)</button>`:''}
      </div>
    </div></div>`;
}
function ttBandNote(c){ c=c||active(); return (+(c.ttLvSel||0)>=1)?'your pick':'matched to age & spelling level'; }
/* Chapter icon: a drawn sticker from SB_TT_ICON_ART, falling back to the theme's emoji
   only if the art file is missing. The SVG carries no colour of its own for the ink or
   the contact shadow — those come from --ico-ink / --ico-shadow, which dusk redefines,
   so one drawing serves both modes. */
function ttIcon(th,size){ size=size||30;
  const art=(window.SB_TT_ICON_ART||{})[th.id];
  if(!art) return th.e||'🐝';
  return `<span style="width:${size}px;height:${size}px;display:block" aria-hidden="true">${art.replace('<svg ','<svg width="100%" height="100%" ')}</span>`; }
/* Inline glyph for headings and chips. Nothing in this screen falls back to an emoji —
   emoji pick up the system font, which is exactly the "wrong font" the design forbids,
   and a few (🎚) have no glyph at all on Android and render as tofu. */
function ttGlyph(art,size){ size=size||16;
  const svg=(window.SB_ICON_ART&&SB_ICON_ART[art])?SB_ICON_ART(art,{size:size}):'';
  if(!svg) return '';
  return `<span style="display:inline-flex;line-height:0;width:${size}px;height:${size}px;vertical-align:-2px;flex-shrink:0" aria-hidden="true">${svg}</span>`; }
/* Same glyph, but on a pale plate when the chip behind it is filled with its own colour —
   the art is full-colour and would otherwise sit violet-on-violet. */
function ttPlate(art,size,on){ const g=ttGlyph(art,size); if(!g) return '';
  return on?`<span style="display:inline-flex;padding:3px;border-radius:7px;background:rgba(255,255,255,.9)">${g}</span>`:g; }
/* ---- Per-card study record ----------------------------------------------------------
   Keyed on the question's own id, not its position, so shuffling the deck never moves a
   speller's progress onto a different card. Shape: {s:'practised'|'tested'|'mastered', r:0|1}.
   Older saves stored a bare 1 (meaning "seen"); those read back as 'practised'. */
const TT_STATES=[['practised','Practised','#7C5CFF','book'],['tested','Tested','#E0922E','target'],['mastered','Mastered','#2FA35C','trophy']];
/* Every card currently in a given state, across all chapters — the drill-down list. */
function ttCardsInState(c,st){ const out=[];
  ttThemes().forEach(th=>{ ttDeck(th.id).forEach((q,i)=>{ const r=ttRec(c,ttKey(q));
    if(st==='revise'?r.r:(r.s===st)) out.push({q,th:th.id,label:th.label,e:th.e,i}); }); });
  return out; }
/* Some questions only make sense with the options in front of you — "Which of these words…"
   is unanswerable on a bare flashcard. Rather than reword them (which would only cover the
   phrasings we happened to think of), show the choices on the front of exactly those cards.
   Recall questions like "What does X mean?" stay option-free, because recognising an answer
   is a weaker test than retrieving one. */
const TT_NEEDS_OPTS=/\b(of these|of the following|of them|of the options|listed above|from the list|which one)\b/i;
function ttOptions(q,i,col){
  if(!q||!Array.isArray(q.c)||q.c.length<2||!TT_NEEDS_OPTS.test(q.q||'')) return '';
  // rotate by the card index so the correct answer isn't parked in the same slot every time
  const n=q.c.length; const r=i%n; const opts=q.c.slice(r).concat(q.c.slice(0,r));
  const LET=['A','B','C','D','E'];
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:7px;margin-top:14px;text-align:left">
    ${opts.map((o,k)=>`<span style="display:flex;align-items:flex-start;gap:7px;background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.35;color:var(--text);font-weight:650">
      <span style="flex-shrink:0;width:17px;height:17px;border-radius:5px;background:${col};color:#fff;font-size:10.5px;font-weight:800;display:grid;place-items:center;margin-top:1px">${LET[k]}</span>
      <span style="min-width:0">${esc(o)}</span></span>`).join('')}
  </div>`; }
const TT_COL={animals:'#4F9E6A',bugs:'#E0922E',ocean:'#3D7DF0',space:'#7B52E0',body:'#E8458C',plants:'#3C8455',food:'#F0703C',sports:'#2A63D6',music:'#B14FC4',myth:'#9B59D0',world:'#13A892',history:'#C8901B',science:'#0E8A78',numbers:'#6A47F5',weather:'#36A3D9',machines:'#4A6B8A',art:'#DC5B7E',fest:'#D6453A',story:'#7C5CFF',words:'#C8791B',india:'#E07A18',code:'#3B6FE0',langs:'#0E8A78',explore:'#B8860B',lit:'#8A5BD6',ent:'#E0567A',brands:'#2E8FB8',quotes:'#C8791B',wroots:'#4F9E6A',wbreak:'#2A8FA8',wmeaning:'#7C5CFF',wstories:'#C8791B',eponyms:'#A8763C'};
function viewTrivTrain(){ const S=state; const c=active(); const t=S.tt; const ths=ttThemes();
  if(!ths.length) return `<div style="max-width:760px;margin:0 auto">${pageHead('Trivia Training','','')}${hiveLoader('loading the question bank…')}</div>`;
  // this level's cards are still on the wire — say so rather than drawing empty chapters
  if(S.ttLoading||S.ttLoadErr){ const lv=ttBand(c); const LVN=['','Starter','Easy','Medium','Hard','Champion'];
    const n=((window.SB_TRIVIA||{}).byLevel||{})[lv]||0;
    return `<div style="max-width:760px;margin:0 auto">
      ${pageHead('Know the World of Words','trivia training','')}
      <div class="sb-card" style="text-align:center;padding:34px 20px">
        <div style="width:56px;height:64px;margin:0 auto 12px">${mascotSVG(S.ttLoadErr?'oops':'think')}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;margin-bottom:6px">${S.ttLoadErr?'Couldn’t load those cards':'Fetching your Level '+lv+' cards…'}</div>
        <div style="font-size:13px;color:var(--muted);font-weight:650;line-height:1.5">${S.ttLoadErr
          ?'Check that trivia-q'+lv+'.js sits beside index.html, then try again.'
          :(n?fmtN(n)+' questions at '+LVN[lv]+' level — ':'')+'this happens once per level.'}</div>
        ${S.ttLoadErr?`<button data-act="openTrivTrain" class="sb-lift" style="margin-top:14px;padding:10px 18px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Try again</button>`:''}
      </div></div>`; }
  // ---------- chapter grid ----------
  if(!t){
    const seen=c.ttSeen||{};
    const wordThemes=['wroots','wbreak','wmeaning','wstories','eponyms'];
    const card=(th)=>{ const deck=ttDeck(th.id); if(!deck.length) return '';
      const col=TT_COL[th.id]||'#7C5CFF'; const st=ttChapterStats(c,th.id);
      return `<button class="sb-lift" data-act="ttChapter" data-arg="${escA(th.id)}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:13px 14px;box-shadow:var(--sh-rest);display:flex;flex-direction:column;gap:7px">
        <span style="display:flex;align-items:center;gap:9px"><span style="width:38px;height:38px;flex-shrink:0;border-radius:11px;background:color-mix(in srgb,${col} 16%,transparent);display:grid;place-items:center;font-size:20px">${ttIcon(th,30)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14px;line-height:1.15">${esc(th.label)}</span>
          <span style="display:block;font-size:11.5px;color:var(--muted);font-weight:700">${fmtN(deck.length)} cards${st.touched?' · '+st.touched+' studied':''}</span></span></span>
        ${ttBar(st,5)}
        ${st.touched?`<span style="display:flex;gap:9px;font-size:10.5px;font-weight:800;align-items:center"><span style="color:#2FA35C;display:inline-flex;align-items:center;gap:3px">${ttGlyph('trophy',13)}${st.mastered}</span><span style="color:#E0922E;display:inline-flex;align-items:center;gap:3px">${ttGlyph('target',13)}${st.tested}</span><span style="color:#7C5CFF;display:inline-flex;align-items:center;gap:3px">${ttGlyph('book',13)}${st.practised}</span>${st.revise?`<span style="color:var(--treasure-deep,#8A5B00);margin-left:auto">↓ ${st.revise}</span>`:''}</span>`:''}</button>`; };
    const grid=(ids)=>`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(196px,1fr));gap:11px">${ids.map(id=>{const th=ths.find(x=>x.id===id); return th?card(th):'';}).join('')}</div>`;
    const wordIds=wordThemes.filter(id=>ths.some(x=>x.id===id));
    const otherIds=ths.map(x=>x.id).filter(id=>wordIds.indexOf(id)<0);
    const bandNow=ttBand(c); const LVN=['','Starter','Easy','Medium','Hard','Champion'];
    const total=ths.reduce((a,th)=>a+ttDeck(th.id).length,0);
    const studied=Object.values(seen).reduce((a,b)=>a+b,0);
    const bchip=(n,lab,on)=>`<button data-act="ttSetBand" data-arg="${n}" title="${n?'Study level '+n+' — '+LVN[n]:'Match my age & spelling level automatically'}" style="padding:7px 11px;border-radius:9px;font-weight:800;font-size:12px;border:1.5px solid ${on?'var(--accent)':'var(--line)'};background:${on?'var(--accent)':'var(--surface2)'};color:${on?'#fff':'var(--muted)'}">${lab}</button>`;
    const bandStrip=`<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:11px 13px;margin:2px 0 14px;box-shadow:var(--sh-rest)">
      <span style="font-weight:800;font-size:13.5px;display:inline-flex;align-items:center;gap:6px">${ttGlyph('sliders',16)}Level ${bandNow} · ${LVN[bandNow]}</span>
      <span style="font-size:11.5px;color:var(--muted);font-weight:700">${ttBandNote(c)}</span>
      <span style="margin-left:auto;display:inline-flex;gap:5px;flex-wrap:wrap">${bchip(0,'Auto',!(+(c.ttLvSel||0)))}${[1,2,3,4,5].map(n=>bchip(n,'L'+n,+(c.ttLvSel||0)===n)).join('')}</span></div>`;
    return `<div style="max-width:860px;margin:0 auto">
      ${pageHead('Know the World of Words','trivia training · '+fmtN(total)+' cards at your level','Your own pace — no timer, no score.',
        studied?`<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${ttGlyph('book',15)}${fmtN(studied)} cards studied</span>`:'')}
      ${bandStrip}
      ${wordIds.length?`<div style="font-family:var(--display);font-weight:800;font-size:15px;margin:2px 2px 9px;display:flex;align-items:center;gap:7px">${ttGlyph('bee',18)}Word chapters <span style="font-size:12px;color:var(--muted);font-weight:700">— built from the spelling library</span></div>${grid(wordIds)}`:''}
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin:18px 2px 9px;display:flex;align-items:center;gap:7px"><span style="width:18px;height:18px;flex-shrink:0">${ttIcon({id:'world'},18)}</span>World chapters</div>${grid(otherIds)}
      <button data-act="openTrivia" class="sb-lift" style="width:100%;text-align:left;margin-top:16px;border-radius:16px;padding:15px 17px;background:linear-gradient(135deg,#F0A93C,#DC7A18);color:#fff;display:flex;align-items:center;gap:13px;box-shadow:var(--sh-rest)">
        <span style="width:30px;height:30px;flex-shrink:0;display:inline-flex">${(window.SB_ICON_ART&&SB_ICON_ART.arcade)?SB_ICON_ART('arcade',{size:30}):''}</span><span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:16px">Ready to play?</span>
        <span style="display:block;font-size:12.5px;opacity:.92">Take what you've studied into ${esc(hubNameOf('hive')||'the quiz')}${hubNameOf('lore')?' or '+esc(hubNameOf('lore')):''} on the Play tab.</span></span><span style="font-weight:800">→</span></button>
    </div>`; }
  // ---------- flip-card deck ----------
  const th=ths.find(x=>x.id===t.th)||ths[0]; const deck=ttDeck(t.th); const col=TT_COL[t.th]||'#7C5CFF';
  if(!deck.length) return `<div style="max-width:640px;margin:0 auto">${backPill('ttBack','Chapters',null)}${beeEmpty('think','No cards in this chapter yet.')}</div>`;
  const i=Math.min(t.i||0, deck.length-1); const q=deck[i]; const LVL=['','Starter','Easy','Medium','Hard','Champion'];
  const face=t.flip
    ? `<div style="animation:sb-pop .28s ease both">
        <div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${col};margin-bottom:7px">Answer</div>
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(19px,4.4vw,25px);line-height:1.25;color:var(--text)">${esc(q.c[0])}</div>
        ${q.f?`<div style="margin-top:14px;text-align:left;background:var(--surface2);border-radius:13px;padding:12px 14px;font-size:13.5px;line-height:1.55;color:var(--text)"><span style="display:block;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;display:flex;align-items:center;gap:5px">${ttGlyph('bulb',13)}Did you know</span>${esc(q.f)}</div>`:''}</div>`
    : `<div style="font-family:var(--display);font-weight:800;font-size:clamp(18px,4.2vw,23px);line-height:1.35;color:var(--text)">${esc(q.q)}</div>
       ${ttOptions(q,i,col)}
       <div style="font-size:12.5px;color:var(--muted);font-weight:700;margin-top:14px">Tap the card to reveal the answer</div>`;
  const rec=ttRec(c, ttKey(q)); const cst=ttChapterStats(c, t.th);
  const stateChips=TT_STATES.map(([k,lab,scol,em])=>{ const on=rec.s===k;
    return `<button data-act="ttMark" data-arg="${k}" title="Mark this card as ${lab.toLowerCase()}" style="flex:1;min-width:88px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:11px;font-weight:800;font-size:12.5px;border:1.5px solid ${on?scol:'var(--line)'};background:${on?scol:'var(--surface2)'};color:${on?'#fff':'var(--muted)'}">${ttPlate(em,15,on)} ${lab}${on?' ✓':''}</button>`; }).join('')
    +`<button data-act="ttRevise" title="Add this card to your revision pile" style="flex:1;min-width:88px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:11px;font-weight:800;font-size:12.5px;border:1.5px solid ${rec.r?'var(--treasure,#F0B429)':'var(--line)'};background:${rec.r?'var(--treasure,#F0B429)':'var(--surface2)'};color:${rec.r?'#5a3d00':'var(--muted)'}">${ttPlate('list',15,rec.r)} Revise${rec.r?' ✓':''}</button>`;
  return `<div style="max-width:640px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      ${backPill('ttBack','Chapters',null)}
      <span style="font-family:var(--display);font-weight:800;font-size:17px;display:inline-flex;align-items:center;gap:7px"><span style="width:22px;height:22px;flex-shrink:0">${ttIcon(th,22)}</span>${esc(th.label)}</span>
      <span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:${col}22;color:${col};font-weight:800;font-size:11px">L${ttBand(c)} · ${LVL[ttBand(c)]}</span>
      <span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700">${i+1} / ${fmtN(deck.length)}</span></div>
    <!-- two progress bars: where you are in the deck, and how much of the set you have learned -->
    <div style="margin-bottom:12px">
      <div style="height:6px;border-radius:99px;background:var(--tint-deep,var(--surface2));overflow:hidden;margin-bottom:6px"><div style="height:100%;background:${col};width:${((i+1)/deck.length*100).toFixed(2)}%"></div></div>
      ${ttBar(cst,6)}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:11px;font-weight:800;color:var(--muted)">
        <span>Card ${i+1} of ${fmtN(deck.length)}</span>
        <span style="margin-left:auto;display:inline-flex;gap:9px">
          <span style="color:#2FA35C;display:inline-flex;align-items:center;gap:4px">${ttGlyph('trophy',14)}${cst.mastered}</span><span style="color:#E0922E;display:inline-flex;align-items:center;gap:4px">${ttGlyph('target',14)}${cst.tested}</span><span style="color:#7C5CFF;display:inline-flex;align-items:center;gap:4px">${ttGlyph('book',14)}${cst.practised}</span>${cst.revise?`<span style="color:var(--treasure-deep,#8A5B00)">↓ ${cst.revise}</span>`:''}
        </span></div>
    </div>
    <button data-act="ttFlip" style="width:100%;text-align:center;background:var(--paper,var(--bg2));border:2px solid ${t.flip?col:'var(--line)'};border-radius:20px;padding:26px 20px;min-height:230px;display:flex;flex-direction:column;justify-content:center;box-shadow:var(--sh-rest);cursor:pointer">
      <div style="display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:12px">
        <span style="font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:${col};padding:3px 10px;border-radius:99px">${LVL[q.lv||3]||'Medium'}</span></div>
      ${face}</button>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${stateChips}</div>
    <!-- a d-pad: back out of the card into the deck, up for the card before, down to revise,
         forward for the next one. The same four arrow keys drive it. -->
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button data-act="ttNav" data-arg="-1" title="Previous card (←)" style="padding:12px 16px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:15px">← Back</button>
      <button data-act="ttBack" title="Back into the deck of chapters (↑)" style="padding:12px 15px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">↑ Deck</button>
      <button data-act="ttFlip" title="Reveal the answer (↓ or space)" style="padding:12px 15px;border-radius:12px;font-weight:800;font-size:14px;border:1.5px solid ${t.flip?col:'var(--line)'};background:${t.flip?'color-mix(in srgb,'+col+' 14%,var(--surface2))':'var(--surface2)'};color:${t.flip?col:'var(--muted)'}">↓ ${t.flip?'Hide':'Reveal'}</button>
      <button data-act="ttSay" title="Read the question aloud" style="padding:12px 15px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800">${iconSVG('volume',17)}</button>
      <button data-act="ttShuffle" title="Jump to a random card" style="padding:12px 14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;display:inline-flex;align-items:center;justify-content:center">${ttGlyph('retry',17)}</button>
      <button data-act="ttNav" data-arg="1" title="Next card (→)" style="flex:1;min-width:96px;padding:12px 17px;border-radius:12px;background:${col};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next →</button></div>
    <button data-act="ttPlay" data-arg="${escA(t.th)}" class="sb-lift" style="width:100%;text-align:left;margin-top:13px;border-radius:14px;padding:13px 15px;background:linear-gradient(135deg,#F0A93C,#DC7A18);color:#fff;display:flex;align-items:center;gap:11px">
      <span style="width:24px;height:24px;flex-shrink:0;display:inline-flex">${(window.SB_ICON_ART&&SB_ICON_ART.arcade)?SB_ICON_ART('arcade',{size:24}):''}</span><span style="min-width:0;flex:1;font-weight:800;font-size:14px">Play this chapter in the Arcade →</span></button>
  </div>`; }

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrLib) */
Object.assign(app, {
  // ----- Idioms & Sayings browser -----
  figQ:(v)=>{ state.figQ=v||''; state.figPage=0; render(); },
  figType:(k)=>set({figType:k, figPage:0}),
  figTheme:(v)=>set({figTheme:v||'all', figPage:0}),
  figWorld:()=>set({figWorld:!state.figWorld, figPage:0}),
  figPage:(n)=>{ set({figPage:+n}); try{window.scrollTo(0,0);}catch(e){} },
  figSay:(t)=>say(t),
  figTab:(k)=>set({figTab:k}),
  qShuffle:()=>{ const L=quoteList(); if(!L.length) return; let i=state.qi||0; if(L.length>1){ while(i===(state.qi||0)) i=Math.floor(Math.random()*L.length); } set({qi:i}); markQuoteSeen(); if(state.readAloud) app.qSpeak(); },
  qSetCat:(cat)=>{ set({qCat:cat==='all'?null:cat, qi:0}); if(state.readAloud) setTimeout(app.qSpeak,150); },
  qFav:()=>{ const L=quoteList(); const x=L[state.qi||0]; if(!x) return; const c=active(); c.quoteFavs=c.quoteFavs||{}; const k=(x.q||'').slice(0,60); if(c.quoteFavs[k]) delete c.quoteFavs[k]; else { c.quoteFavs[k]=1; try{sfx('coin');}catch(e){} } save(); render(); },
  qWord:(key)=>{ const m=(state._qHard||{})[String(key).toLowerCase()]; if(m){ set({qWord:m}); try{ say(m.w); }catch(e){} } },
  qWordSay:(w)=>{ try{ say(w); }catch(e){} },
  qWordClose:()=>set({qWord:null}),
  wordCardSay:(w)=>{ try{ say(w); }catch(e){} },
  wordCardClose:()=>set({wordCard:null}),
  deckClose:()=>set({deckOpen:false}),
  deckTog:(i)=>{ const o=Object.assign({},state.deckCards||{}); const k=+i;
    if(o[k]) delete o[k]; else o[k]=1; set({deckCards:o}); },
  deckAll:()=>{ const ws=learnWords(); const o={};
    if(!(ws.length&&ws.every((x,i)=>(state.deckCards||{})[i]))) ws.forEach((x,i)=>{ o[i]=1; });
    set({deckCards:o}); },
  deckSay:(w)=>{ try{ say(w); }catch(e){} },
  deckSaySlow:(w)=>{ try{ deviceSpeak(w,0.55); }catch(e){} },
  /* hand the child back to the drill at the word they were reading. The deck
     shows the same list the flashcard walks, so the index is the same index. */
  deckGo:(i)=>set({deckOpen:false,cardIdx:Math.max(0,+i||0),cardDone:false,coachCardView:true}),
  wohPractise:(word)=>{ set({wordCard:null}); try{ app.reviseOne(word); }catch(e){ flash('Could not open practice'); } },
  qMeaning:()=>set({qMeaningOpen:!state.qMeaningOpen}),
  vocSayWord:()=>{ const w=(state.vocWords||[])[state.vocIdx||0]; if(w) say(w.w); },
  vocSayCard:()=>{ const w=(state.vocWords||[])[state.vocIdx||0]; if(w){ if(!state.vocFlip) state.vocFlip=true; say(w.w+'. '+(w.d||'')); render(); } },
  /* ---- the vocabulary check and its gate ---- */
  /* Three modes share one 4-option multiple-choice screen:
       practice — play the set as often as you like; scores nothing, unlocks nothing
       check    — the graded run that applies the 80% gate
       revise   — only the words the last check missed                                   */
  vocCheck:(mode)=>{ const deck=state.vocDeck; if(!deck) return;
    const words=(mode==='revise')?vocWordsByKeys(vocRevise(deck))
              :(mode==='practice')?sample(state.vocWords||[], (state.vocWords||[]).length)
              :(state.vocWords||[]);
    const qs=vocBuildCheck(words);
    if(qs.length<3){ flash('Not enough words with meanings here to check yet'); return; }
    set({vocCheck:{deck,mode,qs,i:0,picked:null,ok:null,right:0,missed:[],done:false}});
    setTimeout(()=>{ const g=state.vocCheck; if(g) say(g.qs[0].w.w); },260); },
  vocSayQ:()=>{ const g=state.vocCheck; if(g&&g.qs[g.i]) say(g.qs[g.i].w.w); },
  /* New words are refused while anything is waiting to be revised — that is the whole
     point of the gate. The button explains itself rather than silently doing nothing. */
  vocNewSet:()=>{ const deck=state.vocDeck; if(!deck) return;
    if(vocLocked(deck)){
      flash('Revise your missed words first — then the next set unlocks');
      app.vocCheck('revise'); return; }
    const ws=vocBuildSet(deck);
    set({vocWords:ws, vocIdx:0, vocFlip:false, vocCheck:null});
    setTimeout(()=>{ const w=(state.vocWords||[])[0]; if(w) say(w.w); },250); },
  vocSetupOpen:()=>{ set({vocPick:true, nav:'coach', screen:'app', coachMode:'setup', coachTab:'train'}); },
  vocSetTab:(t)=>{ state.vocTab=t; state.vocCheck=null;
    if(t==='practice') app.vocCheck('practice');
    else if(t==='check') app.vocCheck(vocLocked(state.vocDeck)?'revise':undefined);
    else render(); },
  vocToggleWords:()=>set({vocWordsOpen:!state.vocWordsOpen}),
  vocToggleHeat:()=>set({vocHeatReveal:!state.vocHeatReveal}),
  vocJump:(i)=>{ state.vocTab='cards'; state.vocCheck=null;
    set({vocIdx:Math.max(0,Math.min((state.vocWords||[]).length-1,+i)), vocFlip:false});
    const w=(state.vocWords||[])[state.vocIdx]; if(w) setTimeout(()=>say(w.w),150); },
  itMode:(m)=>{ if(m==='learn'){ set({it:{mode:'learn'}}); return; } const it=itBuild(m); if(!it){ flash('The sound data has not loaded yet'); return; } set({it}); },
  itSayWord:(w)=>say(w),
  // level picker on the training hub: 0 = automatic, 1–5 pin a band
  ttSetBand:(n)=>{ const c=active(); c.ttLvSel=(+n>=1&&+n<=5)?+n:0; save();
    const lv=ttBand(c); const ready=ttLevelReady(lv);
    set({tt:null, ttLoading:!ready, ttLoadErr:false});
    if(!ready) ttNeed(lv,(ok)=>{ state.ttLoading=false; state.ttLoadErr=!ok; render(); }); },
  ttShuffle:()=>{ const t=state.tt; if(!t) return; const deck=ttDeck(t.th); if(deck.length<2) return;
    let i=t.i; while(i===t.i) i=Math.floor(Math.random()*deck.length); t.i=i; t.flip=false; render(); },
  ttListClose:()=>set({ttList:null}),
  ttGoCard:(arg)=>{ const p=String(arg||'').split('|'); if(p.length<2) return;
    set({ttList:null, nav:'trivtrain', screen:'app', tt:{th:p[0], i:parseInt(p[1],10)||0, flip:false}}); },
  ttSay:()=>{ const t=state.tt; if(!t) return; const q=ttDeck(t.th)[t.i||0]; if(q){ try{ say(q.q,0.95); }catch(e){} } },
  // Mark where this card stands: practised → tested → mastered. Tapping the current state clears it.
  ttMark:(st)=>{ const t=state.tt; if(!t) return; const c=active(); const q=ttDeck(t.th)[t.i||0]; const k=ttKey(q); if(!k) return;
    const rec=ttRec(c,k); rec.s=(rec.s===st)?'':st; ttPut(c,k,rec);
    if(rec.s==='mastered'){ try{ sfx('win'); burstConfetti(40); }catch(e){} }
    save(); render(); },
  // The down key is "put this one in my revision pile".
  ttRevise:()=>{ const t=state.tt; if(!t) return; const c=active(); const q=ttDeck(t.th)[t.i||0]; const k=ttKey(q); if(!k) return;
    const rec=ttRec(c,k); rec.r=rec.r?0:1; ttPut(c,k,rec); save();
    flash(rec.r?'↓ Added to your revision pile':'Removed from revision'); render(); },
  // hand the speller straight to the Arcade, pre-tuned to this chapter's theme
  /* a studied chapter goes to play in its own hub: word chapters to Word Lore, the rest to Hive Mind's Classic on that theme */
  ttPlay:(th)=>{ const w={wroots:1,wbreak:1,wstories:1,eponyms:1,words:1,wmeaning:1}; if(w[th]){ app.openTrivia(th); return; }
    try{ const c=active(); (c.qzHive=c.qzHive||{}).ths=[th]; }catch(e){} app.openHive('classic'); },
  tyStart:(id)=>{ tyStop(); const l=TY_LESSONS.find(x=>x.id===id)||TY_LESSONS[0];
    state.ty={mode:'lesson', lesson:l.id, title:l.name, tip:l.tip, seq:tySeqFor(l), pos:0, typed:0, errors:0, startT:0, done:false};
    set({nav:'typing', screen:'app'}); app._tyArm(); },
  tyTest:()=>{ tyStop(); const ws=gameWordsD().filter(w=>/^[a-z]+$/.test(w.w)&&w.w.length<=10);
    const seq=sample(ws, Math.min(90,ws.length)).map(w=>w.w).join(' ')||'the quick brown fox jumps over the lazy dog';
    state.ty={mode:'test', title:'60-second Typing Test', tip:'', seq, pos:0, typed:0, errors:0, startT:0, done:false};
    set({nav:'typing', screen:'app'}); app._tyArm(); },
  _tyArm:()=>{ if(window._tyH) return; window._tyH=(e)=>{ const t=state.ty; if(!t||t.done||state.nav!=='typing') return;
      if(e.metaKey||e.ctrlKey||e.altKey) return;
      if(e.key==='Backspace'||e.key.length===1){ e.preventDefault(); tyProcess(e.key); } };
    window.addEventListener('keydown', window._tyH, true); },
  tyTap:(ch)=>{ tyProcess(ch); },
  tyExit:()=>{ tyStop(); set({ty:null, nav:'typing'}); },
  finderQ:(v)=>{ state.finderQ=v||''; state.finderSel=null; render(); },
  finderBack:()=>set({finderSel:null}),
  finderLoadFull:()=>loadFullLibrary(()=>{}),
  finderAddTo:(k)=>{ const c=active(); const w=state.finderSel; if(!w) return; c.builtLists=c.builtLists||{}; const bl=c.builtLists[k]; if(!bl) return;
    if((bl.ws||[]).some(x=>nkey(x)===nkey(w.w))){ flash('“'+w.w+'” is already in '+bl.label); return; }
    bl.ws=[...(bl.ws||[]),w.w]; bl.label=bl.label.replace(/\(\d+\)$/,'('+bl.ws.length+')'); save(); sfx('correct'); flash('Added “'+w.w+'” to '+bl.label+' ✓'); render(); },
  finderName:(v)=>{ state.finderName=v||''; },
  finderCreateAdd:()=>{ const c=active(); const w=state.finderSel; if(!w) return; const name=(state.finderName||'').trim()||'My words';
    c.builtLists=c.builtLists||{}; const key='built_'+Date.now().toString(36);
    c.builtLists[key]={ label:name, ws:[w.w] }; state.finderName=''; save(); sfx('win');
    flash('New list “'+name+'” created with “'+w.w+'” — find it in the Word Gym ✓'); render(); },
  openConceptChapter:(i)=>{ try{window.scrollTo(0,0);}catch(e){} set({conceptChapter:+i, conceptQuery:''}); },
  conceptChaptersBack:()=>set({conceptChapter:null}),
  onConceptSearch:(v)=>set({conceptQuery:v, conceptPage:0}),
  /* 'all' is a size like any other and must survive the round trip — coercing
     every size with +v turned it into NaN, which silently emptied the pool. */
  /* ---- List Builder: nine facets, any number at once ---- */
  b2Tog:(kv)=>{ const i=kv.indexOf(':'); const k=kv.slice(0,i); const raw=kv.slice(i+1);
    const B=b2State();
    if(k==='starts'||k==='has'||k==='ends'){ B[k]=''; }
    else if(k==='pool'){ B.pool=''; }
    else if(k==='wl'){ B.wlmin=3; B.wlmax=24; }
    else { const v=+raw; const a=B[k]||[]; const at=a.indexOf(v);
      if(at>=0) a.splice(at,1); else a.push(v); B[k]=a; }
    state.bldNaming=false; render(); },
  b2Size:(v)=>{ b2State().size = (v==='all')?'all':(+v||20); state.bldNaming=false; render(); },
  /* the two sliders are one range: dragging either past the other pushes it along
     rather than inverting the pair into a filter that can never match */
  /* the two sliders are one range: dragging either past the other pushes it along
     rather than inverting the pair into a filter that can never match */
  b2WlMin:(v)=>{ const B=b2State(); B.wlmin=Math.max(3,Math.min(24,+v||3)); if(B.wlmax<B.wlmin) B.wlmax=B.wlmin; render(); },
  b2WlMax:(v)=>{ const B=b2State(); B.wlmax=Math.max(3,Math.min(24,+v||24)); if(B.wlmin>B.wlmax) B.wlmin=B.wlmax; render(); },
  /* Draw-from is one choice, not a set — "my missed words" and "words I've mastered"
     are contradictory, so tapping one replaces the other rather than ANDing to zero */
  b2Pool:(v)=>{ const B=b2State(); B.pool = (B.pool===v)?'':String(v||''); state.bldNaming=false; render(); },
  /* A group is a way of LOOKING at the chips, not a filter on the words — tapping
     "Medicine & the body" narrows which subject chips are offered, it does not by
     itself narrow the list. Tapping it again shows every group. Nothing about the
     current selection changes, so a chosen tag stays chosen while you browse past it. */
  b2Sec:(k)=>{ const B=b2State(); B.open[k]=B.open[k]?0:1; render(); },
  b2TGrp:(v)=>{ const B=b2State(); B.tgrp=(B.tgrp===v)?'':String(v||''); B.qtag=''; render(); },
  b2OGrp:(v)=>{ const B=b2State(); B.ogrp=(B.ogrp===v)?'':String(v||''); B.qorig=''; render(); },
  b2Tab:(k)=>{ b2State().tab = (k==='all')?'all':'list'; render(); },
  b2Shuffle:()=>{ const B=b2State(); B.seed=(B.seed*7919+104729)&0x7fffffff || 1; sfx('tick'); render(); },
  b2Clear:()=>{ state.b2=null; b2State(); state.bldNaming=false; render(); },
  bldNameOpen:()=>{ if(!bldPick().length) return;
    set({bldNaming:true, bldNameVal:''});
    setTimeout(()=>{ try{ document.querySelector('[data-fkey="bldName"]')?.focus(); }catch(e){} },0); },
  bldName:(v)=>{ state.bldNameVal=String(v||'').slice(0,48); },
  bldNameCancel:()=>set({bldNaming:false, bldNameVal:''}),
  bldCreate:()=>{ const words=bldPick(); if(!words.length) return; const c=active(); ensureLists(c);
    if(!c.builtLists) c.builtLists={}; const key='built_'+Date.now().toString(36);
    // the child's own name wins; the suggestion is only a fallback for an empty box
    const label=(String(state.bldNameVal||'').trim() || bldSuggest()).slice(0,48);
    c.builtLists[key]={ label:label, ws:words.map(w=>w.w) };
    state.bldNaming=false; state.bldNameVal='';
    save(); sfx('win'); burstConfetti(60);
    app.selectList(key);                                  // lands on Practice with this list active
    flash('“'+label+'” is ready — '+words.length+' words · '+bldLevels(words.length)
      +' Level'+(bldLevels(words.length)>1?'s':'')+' to mastery 🛠️'); },
  closeListView:()=>set({listView:null}),
  lvSearch:(v)=>{ state.lvQuery=(v||'').trim().toLowerCase(); state.lvShown=80; render(); },
  lvY:(v)=>set({lvY:v||'', lvShown:80}),
  lvMore:()=>set({lvShown:(state.lvShown||80)+80}),
  lvSay:(w)=>{ try{ say(w); }catch(e){} },
  addTheme:(id)=>{ const c=active(); ensureLists(c); const key=themeKey(id); const t=themeOf(id); if(!t) return;
    if(!(c.pinnedLists||{})[key]){ if(!c.pinnedLists) c.pinnedLists={}; c.pinnedLists[key]=1; if(!c.lists[key]) c.lists[key]={xp:0}; save(); sfx('coin'); flash('“'+t.label+'” added to your lists ✓'); render(); }
    else app.selectList(key); },
  /* A theme now opens the way a concept chapter does: the explanation first, then
     the words. The Cards / Practice / Vocab tabs hand straight over to the coach
     and the vocabulary engine — same backend, same screens, one more door in. */
  openTheme:(id)=>{ const t=themeOf(id); if(!t) return; lazyNeed(['themes','card','lists']);
    try{ window.scrollTo(0,0); }catch(e){}
    set({nav:'themes', screen:'app', themeSel:id, themeTab:'learn', conceptSel:null}); },
  themeBack:()=>set({themeSel:null}),
  themeTab:(t)=>{ const id=state.themeSel; if(!id) return;
    if(t==='cards'||t==='practice'||t==='vocab') state.trainPref=t;
    if(t==='cards'){ app.selectList(themeKey(id)); return; }
    if(t==='practice'){ app.themePractice(id); return; }
    if(t==='vocab'){ if(!gateFeature('trainTools','Vocab practice')) return;
      set({nav:'vocab', screen:'app', vocDeck:null, conceptSel:null}); app.vocDeck('th:'+id); return; }
    set({themeTab:t}); },
  themePractice:(id)=>{ const c=active(); ensureLists(c); const key=themeKey(id); const t=themeOf(id); if(!t) return;
    if(!c.lists[key]) c.lists[key]={xp:0};             // give it a ladder, but don't pin it to the top bar
    const ws=workingSet(key); if(!ws.length){ flash('No words in this theme yet'); return; }
    state.sessionWords=ws; state.sessionListKey=key; state.sessionLabel=t.label;
    state.gi=0; state.coachSession=false; state.trainBack='themes'; app.startTrain(); },
  openAdvTips:()=>app.advJump('tips'),
  journeySetView:(v)=>set({journeyView:v, journeyPage:0}),
  journeyPagePrev:()=>set({journeyPage:Math.max(0,(state.journeyPage||0)-1)}),
  journeyPageNext:()=>set({journeyPage:(state.journeyPage||0)+1}),
  lessonBack:()=>set({lessonSel:null}),
  lessonStepGo:(i)=>{ set({lessonStep:+i}); try{window.scrollTo(0,0);}catch(e){} },
  lessonStepPrev:()=>{ set({lessonStep:Math.max(0,(state.lessonStep||0)-1)}); try{window.scrollTo(0,0);}catch(e){} },
  lessonStepNext:()=>{ set({lessonStep:(state.lessonStep||0)+1}); try{window.scrollTo(0,0);}catch(e){} },
  practiseLesson:()=>{ const L=state.lessonSel; if(!L) return; const ws=lessonWordObjs(L); if(!ws.length){ flash('No words in this lesson'); return; } state.sessionWords=ws; state.sessionListKey='__lesson__'; state.sessionLabel=L.id+' · '+L.title; state.gi=0; state.coachSession=false; app.startTrain(); },
  /* The books are published from their own repo and their own Pages site — the app
     site only keeps redirect stubs. ONE constant, so moving them to
     books.bizzingbee.com is a one-line change and not a hunt through the codebase.
     Offline is checked first: this app is built to work in a tunnel, and opening a
     blank tab there would look like the app broke rather than like the internet is
     missing. */
  openBooks:()=>{
    /* Regional Speller only. gateFeature reads SB_ENT.has('books'), which is declared
       on every tier in pricing.js — never a hardcoded tier comparison here, so the
       source of truth can move server-side without touching this call. It also opens
       the plans sheet on the right tier when the answer is no. */
    if(!gateFeature('books','The book series','regional')) return;
    if(typeof navigator!=='undefined' && navigator.onLine===false){
      flash('The books live on the web — reconnect to open the shelf'); return; }
    try{ const w=window.open(SB_BOOKS_URL,'_blank','noopener');
      if(!w) flash('Pop-up blocked — allow pop-ups to open the book shelf'); }
    catch(e){ flash('Could not open the shelf'); } },
  /* One volume off the shelf. Same gate, same offline check and the same pop-up
     handling as openBooks — a child tapping a spine and a child tapping the shelf
     must not be able to reach two different answers about whether they own this.
     The slug is checked against SB_SHELF rather than pasted into a URL, so a stray
     data-arg cannot navigate anywhere we did not publish. */
  /* A spine opens the IN-APP reader — living cards with word taps, audio,
     Try-it exercises and notes. The printed site edition survives as the
     "Print edition" pill inside the reader (that is the one people can buy). */
  openBook:(slug)=>{
    const v = SB_SHELF.find(b=>b.s===slug); if(!v) return;
    if(!gateFeature('books','The book series','regional')) return;
    SB_LAZY.need('reader', ()=>{
      if(window.SB_READER && SB_READER.vols && SB_READER.vols[slug]){ SB_READER.open(slug); return; }
      try{ const w=window.open(SB_BOOKS_URL+v.s+'.html','_blank','noopener');
        if(!w) flash('Pop-up blocked — allow pop-ups to open the book'); }
      catch(e){ flash('Could not open that book'); } }); }
});
