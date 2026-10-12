"use strict";
/* app3-me.js — Me: the Collection (My Hive), the Shop, Evolution, the wallet sheet and Help.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrMe`, its group carries app3-shared.js — Me reads no word) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

/* The Streak Freeze is retired with the streak: it was the one artifact that protected a
   thing that should not exist. c.freezes stays in old saves and is read by nothing. */
const artCount = (c,k) => (((c.pow||{})[k])||0);
function listProgress(c,key){ return levelFromXp(getList(c,key).xp||0); }
/* HELP — one page, plain words, the family glossary (standard §21). */
function viewHelp(){ const q=(h,b)=>`<details class="sb-card bz-help"><summary>${h}</summary><p>${b}</p></details>`;
  return `<div style="max-width:720px;margin:0 auto">${pageHead('Help','','',null,'goHome','Home',null,iconSVG('help',20,2.2))}
    ${q('What is Continue?','The big button on Home. It always takes you to the next stop on your journey across the Word Atlas — the exact place you left off.')}
    ${q('How do I earn Bizzing coins?','A right answer pays 1, a finished round 5, a contest 10, and a Stage you have mastered 20 — up to 100 a day in Bizzing Bee. Coins never come from time, logins or luck. The same wallet works in every Bizzing app.')}
    ${q('What can coins buy?','Avatars, worlds and frames in the Shop, each at a fixed price that is printed on it. Coins never buy lessons, stops or games, and they are never real money.')}
    ${q('What are worlds?','A world repaints the whole app and brings its own music and avatar packs. Bizzing Bee and Galaxy are open to everyone; the other six open for 240 coins each, or with the family plan.')}
    ${q('What do Common, Rare, Epic and Legendary mean?','Commons are free for everyone. Rares cost 120 coins and Epics 250 once their world is open. A Legendary costs 500 and first asks you to reach a learning milestone, which its card names.')}
    ${q('When is a word mastered?','When you spell it right on two different days. A word comes back for a check later, and if it slips it is simply practised again.')}
    ${q('How do I look up a word?','Type it into the search bar at the top: find any of '+countTxt('library')+' words, hear it and read its card. While a word is being tested, search waits — it could give the spelling away.')}
    ${q('What are Medals?','Medals record what you did — stops finished, traps beaten, words mastered. Each one says exactly what earned it.')}
    ${q('Who are the Grown-ups?','The lock at the top opens the grown-ups area behind a 4-digit PIN: the report card, the plan, backup and erase. The PIN keeps little hands out; it is not a bank lock.')}
  </div>`; }
/* The plan decides WHICH avatar packs exist for you; coins decide when you open them.
   Packs beyond your plan's allowance are not for sale at any price — they come with the
   upgrade. (Free-rarity avatars stay free everywhere; they are the starter bees.) */
function avPackUnlocked(pk){ if(state.devUnlock) return true;
  try{ const p=SB_AVATARS.packs.find(x=>x.id===pk); if(!p) return false; return BZ_AVATARS.worldOpen(p.world, avCtx()); }catch(e){ return true; } }
const SHOP_APP_LABEL={ bee:'Bee', maths:'Maths', geography:'Geography', india:'India', finance:'Finance' };
/* One ledger line, in words: "+5 · finished The Meadow, stop 3 · Bee". */
function ledgerWords(x,c){ c=c||active(); const why=String(x.why||'');
  let what;
  if(why==='answer') what='a right answer';
  else if(why==='stop') what='finished a round';
  else if(why==='contest') what='finished a contest';
  else if(why==='mastery') what='mastered on two different days';
  else if(why==='migrated') what='Bee coins moved into the family wallet';
  else if(/^avatar:/.test(why)){ const a=(window.SB_AVATARS&&SB_AVATARS.byId[why.slice(7)])||null; what='bought '+(a?a.name:'an avatar'); }
  else if(/^world:/.test(why)){ const w=THEMES[(+why.slice(6))-1]; what='opened the world '+(w?w.label:why.slice(6)); }
  else if(/^frame:/.test(why)){ const f=FRAME_BY[why.slice(6)]; what='bought the '+(f?f.name:'frame')+' frame'; }
  else if(/^refund:/.test(why)) what='money back for something withdrawn';
  else what=why.replace(/[:_-]/g,' ');
  /* name the round it came from, when Bee's own log has it (the session closes just after it pays) */
  const act=ledgerSession(x,c); if(act&&act.label) what+=' · '+act.label;
  return what; }
/* The Bee session a coin came from: Bee logs a session when it ENDS (logActivity → c.activity, newest
   first), so a coin belongs to the first session that closed at or after it, within 15 minutes. */
function ledgerSession(x,c){ if(!x||x.a!=='bee'||!/^(stop|contest|answer|mastery)$/.test(String(x.why||''))) return null;
  return (c.activity||[]).filter(e=>e.ts>=x.t-1000 && e.ts-x.t<15*60000).pop()||null; }
function walletLines(c,n){ c=c||active(); try{ if(window.SB_DEMO) return []; const W=window.BZ_WALLET; if(!W) return [];
    return W.ledger(walletWho(c)).slice().sort((x,y)=>y.t-x.t).slice(0,n||30); }catch(e){ return []; } }
/* K9: ONE LINE PER SESSION, NOT PER COIN. Twenty right answers wrote twenty "+1 · a right answer"
   lines and pushed everything else off the sheet. CONSECUTIVE earnings of the same kind, from the same
   app, in the same session — Bee's own session log (ledgerSession) when it has one, and never across a
   gap of over 20 minutes — fold into one line, named by that session: "+13 from 13 right answers ·
   Spelling Gym · Word Doctor" (road to 4.5, P0.31). Two sessions are two lines even back to back, and a
   different line between two runs (a finished round, a purchase, a sibling app's coin) keeps them apart.
   Spending, refunds and the one-off move into the family wallet always stay lines of their own. The
   ledger is the family drop-in's (BZ_WALLET.ledger) and is only read here. Guard: wallet-coins §8–9. */
const LEDGER_SITTING=20*60000;
const LEDGER_MANY={ answer:k=>'from '+k+' right answers', stop:k=>'from '+k+' finished rounds', contest:k=>'from '+k+' contests', mastery:k=>'from '+k+' words mastered on two different days' };
function walletGroups(c,n){ c=c||active(); const L=walletLines(c,2000); const out=[]; let prev=null, prevT=null;
  for(const x of L){   /* newest first */
    const why=String(x.why||''), can=!!(x.n>0 && LEDGER_MANY[why]), ses=can?ledgerSession(x,c):null;
    const near=prevT!=null && prevT-x.t<=LEDGER_SITTING; prevT=x.t;
    if(can && prev && prev.can && near && prev.a===x.a && prev.why===why && prev.ses===ses){ prev.n+=x.n; prev.k++; prev.old=x; continue; }
    prev={ a:x.a, t:x.t, n:x.n, why, k:1, top:x, old:x, can, ses }; out.push(prev); }
  return out.slice(0,n||30); }
function walletRowWords(g,c){ if(g.k<2) return ledgerWords(g.top,c);
  return LEDGER_MANY[g.why](g.k)+(g.ses&&g.ses.label?' · '+g.ses.label:''); }
function walletRowsHTML(c,n){ const L=walletGroups(c,n);
  if(!L.length) return `<p class="bz-empty"><span class="bz-empty-m">${mascotSVG('think')}</span>No coins yet. Every right answer pays one — they land here.</p>`;
  return `<ol class="bz-ledger">${L.map(x=>{ const plus=x.n>0; const app=SHOP_APP_LABEL[x.a]||x.a;
    return `<li${x.k>1?` data-k="${x.k}"`:''}><b class="${plus?'in':'out'}">${plus?'+':'−'}${Math.abs(x.n)}</b><span class="bz-ledger-w">${esc(walletRowWords(x,c))}</span><span class="bz-ledger-a${x.a==='bee'?'':' sib'}" title="${escA(app)}">${x.a==='bee'?iconSVG('hive',12,2.4):iconSVG('globe',12,2.4)} ${esc(app)}</span><span class="bz-ledger-t">${esc(fmtAgo(x.t))}</span></li>`; }).join('')}</ol>`; }
const WALLET_FOR='Bizzing coins come from learning — right answers, finished rounds, contests and mastery — in every Bizzing app. They buy avatars, worlds and frames at fixed prices. Never lessons, and never real money.';
function viewWalletSheet(){ if(!state.walletOpen) return ''; const c=active();
  return `<div class="bz-sheet-ov" data-act="closeWallet"><div class="bz-sheet" data-act="noop" data-trap="wallet" role="dialog" aria-modal="true" aria-label="Your Bizzing coins">
    <div class="bz-sheet-h"><h2>${iconSVG('coin',20,2.2)} Your Bizzing coins</h2><button data-act="closeWallet" class="bz-x" aria-label="Close">${iconSVG('close',18,2.4)}</button></div>
    <div class="bz-bal"><span class="bz-bal-n">${fmtN(c.coins||0)}</span><span class="bz-bal-l">coins in your wallet</span></div>
    <p class="bz-for">${WALLET_FOR}</p>
    <h3 class="bz-sub">Where your coins came from</h3>
    ${walletRowsHTML(c,30)}
    <button data-act="openShop" data-arg="avatars" class="bz-btn bz-btn-wide">${iconSVG('shop',16,2.2)} Open the Shop</button>
  </div></div>`; }
/* One avatar card in the family look. */
function avCardHTML(a,c){ c=c||active(); const s=avState(a,c); const own=avOwned(c,a.id); const on=c.avatar===a.id;
  const tier=SB_AVATARS.tierOf(a); const st=own?'owned':s.state;
  let act='';
  if(on) act=`<span class="bz-av-on">${iconSVG('check',12,2.6)} Wearing</span>`;
  else if(own) act=`<button data-act="wearAv" data-arg="${a.id}" class="bz-av-btn">Wear</button>`;
  else if(s.state==='buy') act=`<button data-act="buyAvatar" data-arg="${a.id}" class="bz-av-btn buy"${s.short?' aria-disabled="true"':''}>${coinIc(12)} ${s.price}</button>`;
  return `<figure class="bz-av" data-tier="${tier}" data-state="${st}" data-av="${a.id}">
    <button data-act="showAvCard" data-arg="${a.id}" class="bz-av-art" aria-label="${escA(a.name+' — '+TIERS_LABEL[tier]+'. '+(own?'Yours':s.say))}">${avatarSVG(a.id,96)}</button>
    <figcaption>${esc(a.name)} <b>${TIERS_LABEL[tier]}</b></figcaption>
    <span class="bz-av-say av-rule">${esc(own?(tier==='common'?'Free for everyone':'Yours'):s.say)}</span>
    ${act}</figure>`; }
const TIERS_LABEL={ common:'Common', rare:'Rare', epic:'Epic', legendary:'Legendary' };
function avPacksHTML(c){ c=c||active();
  return SB_AVATARS.packs.map(p=>{ const avs=SB_AVATARS.list.filter(a=>a.pack===p.id); const ownedN=avs.filter(a=>avOwned(c,a.id)).length;
    const wid=worldIdOf(p.world); const wl=(THEMES.find(t=>t.id===wid)||{}).label||''; const open=avPackUnlocked(p.id);
    return `<section class="sb-card bz-pack" data-pack="${p.id}">
      <div class="bz-pack-h"><span class="bz-pack-sw" style="background:linear-gradient(135deg,${p.c1},${p.c2})"></span><h3>${esc(p.label)}</h3>
        <span class="bz-pack-n">${ownedN}/${avs.length}</span><span class="bz-pack-w">${iconSVG(open?'globe':'lock',12,2.4)} ${esc(wl)}${open?'':' — '+esc(worldLockText(wid,true))}</span></div>
      <div class="bz-av-row">${avs.map(a=>avCardHTML(a,c)).join('')}</div></section>`; }).join(''); }
function worldsShopHTML(c){ c=c||active();
  return `<div class="wh-grid">${THEMES.map((t,i)=>{ const un=isThemeUnlocked(t.id); const n=i+1;
    const packs=SB_AVATARS.packs.filter(p=>p.world===n).map(p=>p.label.replace(/ Pack$/,'')).join(' · ');
    const H=(typeof WORLD_HERO!=='undefined'&&WORLD_HERO[t.id])||{};
    return `<div class="bz-wcard${un?'':' locked'}" data-world="${t.id}">
      <div class="bz-wcard-art" style="${H.bg||''}">${un?'':`<span class="bz-wcard-lock">${iconSVG('lock',14,2.4)}<span class="sb-sr">${esc(worldLockText(t.id))}</span></span>`}<b style="font-family:${H.face||'inherit'};color:${H.ink||'#fff'}">${esc(t.label)}</b></div>
      <div class="bz-wcard-b"><span class="bz-row-s">${esc(WORLD_ABOUT[t.id]||'')}</span>${packs?`<span class="bz-row-s"><b>Avatars:</b> ${esc(packs)}</span>`:''}
        ${un?(t.id===state.theme?`<span class="bz-av-on">${iconSVG('check',12,2.6)} Your world now</span>`:`<button data-act="pickTheme" data-arg="${t.id}" class="bz-btn">Use this world</button>`)
          :(n<=2?'':`<button data-act="buyWorld" data-arg="${t.id}" class="bz-btn buy">${coinIc(13)} ${WORLD_PRICE_COINS} coins</button><span class="bz-row-s">or with the family plan</span>`)}</div></div>`; }).join('')}</div>`; }
function extrasShopHTML(c){ c=c||active(); const prev=avatarSVG(c.avatar||'bizzy',64);
  return `<p class="bz-row-s" style="margin:0 0 12px">A frame is a ring worn around your avatar — at the top of the screen, on Home and on your card. Buy it once, wear it in every world.</p>
    <div class="bz-frames">${FRAMES.map(f=>{ const own=frameOwned(c,f.id); const on=own&&c.frame===f.id;
      return `<div class="bz-fcard" data-frame="${f.id}"><span class="bz-frame bz-frame-${f.id}" style="--fs:64px">${prev}</span><b>${esc(f.name)}</b><span class="bz-row-s">${esc(f.about)}</span>
        ${on?`<button data-act="wearFrame" data-arg="" class="bz-btn">${iconSVG('check',12,2.6)} Wearing — take off</button>`:own?`<button data-act="wearFrame" data-arg="${f.id}" class="bz-btn">Wear</button>`
          :`<button data-act="buyFrame" data-arg="${f.id}" class="bz-btn buy">${coinIc(13)} ${f.price} coins</button>`}</div>`; }).join('')}</div>`; }
function viewShop(){ const c=active(); const tab=state.shopTab||'avatars';
  const T=(k,ic,l)=>`<button role="tab" aria-selected="${tab===k?'true':'false'}" data-act="shopTab" data-arg="${k}" class="bz-tab${tab===k?' on':''}">${iconSVG(ic,16,2.2)} ${l}</button>`;
  const body=tab==='worlds'?worldsShopHTML(c):tab==='extras'?extrasShopHTML(c):avPacksHTML(c);
  return `<div class="bz-shop">
    ${pageHead('Shop','','',`<button data-act="openWallet" class="bz-coin" aria-label="${escA(fmtN(c.coins||0)+' Bizzing coins — where they came from')}">${coinIc(16)} ${fmtN(c.coins||0)}</button>`,'goHome','Home',null,iconSVG('shop',20,2.2))}
    <p class="bz-for" style="margin:0 0 12px">${WALLET_FOR}</p>
    <div class="bz-tabs" role="tablist" aria-label="Shop">${T('avatars','user','Avatars')}${T('worlds','globe','Worlds')}${T('extras','frame','Extras')}</div>
    <div role="tabpanel">${body}</div>
    <section class="sb-card bz-hist"><h3>${iconSVG('history',17,2.2)} Where your coins came from</h3>${walletRowsHTML(c,30)}</section>
  </div>`; }
/* My Hive is one page with tabs — there is no section bar above it any more.
   "Your bee" moved to the Bee Band page (tap the pill in the header), because the bee
   and the band are the two ladders and they belong side by side, not one tab apart.
   Worlds merged into the Collection's own Worlds tab, which now shows the painted hero
   cards the standalone picker used to have. There is no Store either: a thing is bought
   where it lives — a pack on the pack, a world on the world, a chapter in the Library. */
function viewCollection(){ const S=state; const c=active(); let tab=S.collTab||'badges';
  if(tab==='artifacts') tab='badges';   // retired tab key — artifacts merged into Badges
  const tabBtn=(k,ic,l)=>`<button data-act="collTab" data-arg="${k}" style="flex:1;min-width:96px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${tab===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  let body='';
  if(tab==='avatars'){
    /* All 96 by pack, owned and locked, each with the engine's words for its path (FIX-BEE v2 J5/J7).
       A Legendary whose milestone was just reached is recorded after this paint, once, with a line. */
    setTimeout(()=>{ try{ if(state.nav==='collection') grantAvatarMilestones(); }catch(e){} },0);
    body=`<p class="sb-cn" style="margin:0 0 14px;line-height:1.5">Commons are free for everyone. Rares are 120 Bizzing coins and Epics 250 once their world is open; a Legendary is 500 after its learning milestone. Every price is fixed, and nothing here is left to chance. <button data-act="openShop" data-arg="avatars" class="bz-linkbtn">Open the Shop</button></p>`+avPacksHTML(c);
  } else if(tab==='worlds'){
    /* The painted hero cards, moved here from the standalone picker. A locked world is
       greyed and carries its coin price under the tile — a price belongs with the thing,
       not floating over its artwork. */
    const cards=THEMES.map(t=>{ const un=isThemeUnlocked(t.id);
      return worldHeroCard(t, t.id===S.theme, !un, un?'pickTheme':'buyTheme'); }).join('');
    const unc=THEMES.filter(t=>isThemeUnlocked(t.id)).length; const lockedN=THEMES.length-unc;
    body=`<div class="sb-card">
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:4px"><span class="sb-ct" style="font-size:15px">Worlds</span><span class="sb-cn">${unc}/${THEMES.length} unlocked — switch any time</span></div>
      <p class="sb-cn" style="margin:0 0 13px;line-height:1.5">Each world repaints the app — its colours, its type and its motif — and brings its own cast. Your bee keeps its ten forms and their names in every one of them.</p>
      <div class="wh-grid">${cards}</div>
      ${lockedN?`<div class="sb-cn" style="padding-top:12px">🔒 ${lockedN} more ${lockedN===1?'world is':'worlds are'} waiting — tap one to unlock it.</div>`:''}</div>`;
  } else {
    /* Artifacts live here now, not in a tab of their own. Both are proof of play — a badge
       records something you did, an artifact is something you won for doing it — and
       splitting them made the Hive look like it held two collections when it holds one. */
    /* Artifacts are won, never bought — so each card states its earn route rather than a
       price, and a zero card reads as "not yet" instead of "not paid for". */
    // Stage-ups are per LIST (gainXp), so the countdown reads the list being trained —
    // and goes quiet at the free-plan level cap, where no stage-up can fire.
    const _lk=activeListKey(); const _lp=listProgress(c,_lk);
    const _capped=!state.premium && _lp.level>=levelCap();
    const _left=Math.max(1,(_lp.need||1)-(_lp.into||0));
    const inv=ART_DEFS.map(it=>{ const own=artCount(c,it.k);
      return `<div style="display:flex;align-items:center;gap:12px;background:var(--paper,var(--bg2));border:1.5px solid ${own?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:12px 14px;margin-bottom:9px;${own?'':'opacity:.72'}">
        <div style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--chip);color:var(--accent);flex-shrink:0;${own?'':'filter:grayscale(.6)'}">${iconSVG(it.ic,20)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${it.name}</div><div style="font-size:12px;color:var(--muted)">${it.desc}</div>
          <div style="font-size:11.5px;font-weight:800;color:var(--accent);margin-top:3px">${it.how}</div></div>
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:900;font-size:14px;color:${own?'var(--good)':'var(--muted)'};white-space:nowrap">× ${own}</span></div>`; }).join('');
    const artCard=`<div class="sb-card" style="margin-bottom:14px"><div style="display:flex;align-items:baseline;gap:9px;margin-bottom:4px"><span class="sb-ct" style="font-size:15px">Artifacts</span><span class="sb-cn">won by playing, never bought</span></div>
      <p class="sb-cn" style="margin:0 0 12px;line-height:1.5">An edge in a game is something you earn in one. Stage up any list and you win a game artifact${_capped?' — you\'re at the free level cap, so Premium reopens these.':` — <b style="color:var(--text)">${_left} more right ${_left===1?'word':'words'}</b> in ${esc(listLabel(_lk))} wins the next one.`}</p>
      ${inv}</div>`;
    const B=badgeDefs(); const won=B.filter(b=>b.done).length;
    const groups=[...new Set(B.map(b=>b.g))];
    body=groups.map(g=>{ const list=B.filter(b=>b.g===g); const w=list.filter(b=>b.done).length;
      return `<div class="sb-card" style="margin-bottom:14px"><div style="display:flex;align-items:baseline;gap:9px;margin-bottom:12px"><span class="sb-ct" style="font-size:15px">${g}</span><span class="sb-cn">${w}/${list.length} won</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px">${list.map(b=>`<div style="background:var(--paper,var(--bg2));border:1.5px solid ${b.done?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:13px 10px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;${b.done?'':'opacity:.55;filter:grayscale(.6)'}">
        <span style="width:62px;height:66px;display:grid;place-items:center">${badgeArtSVG(b.ic,58,b.done)}</span>
        <span style="font-weight:800;font-size:12.5px;line-height:1.15">${b.name}</span>
        <span class="sb-cn" style="font-size:11px">${b.desc}</span>
        <span style="font-weight:800;font-size:10.5px;color:${b.done?'var(--good)':'var(--muted)'}">${b.done?'WON ✓':'LOCKED'}</span></div>`).join('')}</div></div>`; }).join('')
      + `<div class="sb-cn" style="margin:4px 2px 14px">${won}/${B.length} medals won — each one names what earned it, and none is ever bought or taken back.</div>`
      + artCard;
  }
  const bAll=badgeDefs();
  return `<div style="max-width:920px;margin:0 auto">
    ${/* Printing is an avatars-only action, so it rides the header beside the purse when
          that tab is open rather than standing as a banner over the packs. */''}
    ${pageHead('Collection', '', '',
      (tab==='avatars'?`<button data-act="printAvCards" title="Print your ${avOwnedCount(c)} collected avatars as cut-out trading cards" style="display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${SB_ICON('printer',{size:15})} Print my cards</button>`:'')
      + `<span class="sb-coinchip" title="Bizzing coins — one wallet for every Bizzing app" style="display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px">${coinAmt(c.coins||0,14)}</span>`)}
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">${tabBtn('badges','crown','Medals · '+bAll.filter(b=>b.done).length+'/'+bAll.length)}${tabBtn('avatars','spark','Avatars · '+avOwnedCount(c)+'/'+SB_AVATARS.list.length)}${tabBtn('worlds','palette','Worlds · '+THEMES.filter(t=>isThemeUnlocked(t.id)).length+'/'+THEMES.length)}</div>
    ${body}
  </div>`; }
/* ---- Evolution ladder as its own screen (Home shows only the compact card) ---- */
function viewEvolution(){ const S=state; const c=active(); ensureLists(c); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound;
  const aKey=activeListKey(); const _r=rankOf(c); const fIdx=_r.form; const totalXp=_r.xp;
  // Right words needed to REACH each rung (stage i needs level 2i+1 → sum of the first 2i level costs)
  const stageXp=(i)=>{ let t=0; for(let l=1;l<=i*2;l++) t+=xpToNext(l); return t; };
  const rungMarks=Array.from({length:10},(_,i)=>i===0?'start':fmtN(stageXp(i))+' words');
  const xpToForm=Math.max(0, stageXp(Math.min(9,fIdx+1))-totalXp);
  return `<div style="max-width:900px;margin:0 auto">
    ${pageHead('Your bee','ten forms, earned by practising','','','setNav','Your level','beeband')}
    <p style="margin:0 0 16px;font-size:14px;color:var(--muted);line-height:1.5">Your bee is <b style="color:var(--text)">your level</b>, drawn. Every word you spell right moves your level one step, and as the levels climb your bee grows through ten forms that keep their names in every world. It only ever climbs.</p>
    <div class="sb-card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-bottom:10px">
        <span style="width:56px;height:60px;flex-shrink:0;display:grid;place-items:center;border-radius:14px;background:var(--surface2)">${rankArt(fIdx)}</span>
        <span style="min-width:0;flex:1">
          <span class="sb-cs">Your bee</span>
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:20px;line-height:1.12">Level ${_r.level} · ${esc(rankName(fIdx))}</span>
          <span style="display:block;font-size:13px;color:var(--muted);font-weight:650;margin-top:3px">
            <b style="color:var(--text)">${fmtN(totalXp)} words spelled right</b>${fIdx>=9?' — top form reached 🎉':(' · '+fmtN(xpToForm)+' more to '+esc(rankName(fIdx+1)))}</span>
          <span style="display:block;height:7px;border-radius:var(--r-pill,999px);background:var(--tint-deep,var(--surface2));overflow:hidden;margin-top:8px"><span style="display:block;height:100%;width:${Math.max(0,Math.min(100,Math.round((1-(xpToForm/Math.max(1,(stageXp(Math.min(9,fIdx+1))-stageXp(fIdx))||1)))*100)))}%;background:var(--action,var(--accent))"></span></span>
        </span>
      </div>
      <div style="overflow-x:auto;padding:4px 0 2px"><div style="min-width:760px">${evoLadderHTML('spellbound',fIdx,rungMarks)}</div></div>
      <div class="sb-cn" style="margin-top:6px">Each form shows how many words spelled right reach it — anywhere in the app, and the count never goes down.</div>
    </div>
    <div class="sb-card" style="margin-bottom:14px">
      <div class="sb-ct" style="font-size:15px;margin-bottom:6px">How your bee evolves</div>
      <div class="sb-cs" style="line-height:1.6">Every word you spell right — in the Word Gym, the Arcade, Concepts, anywhere — moves your bee one step along. The count only grows; nothing takes it away.<br>Bizzing coins 🪙 are different: they come from learning too, and you <i>spend</i> them on looks like a Rare avatar. They never buy a level, and spending them never costs you a step.</div>
    </div>
    ${(theme==='spellbound')?`<div class="sb-card" style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="font-size:26px;flex-shrink:0">👑</span><span class="sb-cs"><b style="color:var(--text)">Why a Queen at the top?</b> Every hive is ruled by its Queen — the strongest, most protected bee alive. Reaching her means you outgrew every other bee in the hive.</span></div>`:''}
    ${beeEmpty('happy','Ten forms, one bee. Practise anywhere — the Word Gym, the Arcade, Concepts — and every right word feeds the same evolution.')}
  </div>`;
}
// Printable avatar collectible cards (Collection) — the trump-card front only, 4 per page,
// then cut out. Backs were dropped: they doubled the paper for decoration, and the duplex
// mirroring came out misaligned on any printer that feeds differently.
function printAvCardsDoc(){ const c=active(); const owned=SB_AVATARS.list.filter(a=>avOwned(c,a.id));
  if(!owned.length) return '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;padding:40px;color:#333">No avatars collected yet — find one in the Shop first.</body></html>';
  const bar=(lab,val,col)=>`<div class="abar"><span class="al">${lab}</span><span class="at"><i style="width:${Math.max(6,val)}%;background:${col}"></i></span><b class="av">${val}</b></div>`;
  const front=(a)=>{ const d=(typeof SB_AV_CARD==='function')?SB_AV_CARD(a.id):null; if(!d) return '<div class="card afront"></div>';
    const art=avatarSVG(a.id,124); const vil=d.villain;
    return `<div class="card afront${vil?' avil':''}" style="--c1:${d.c1};--c2:${d.c2};--rc:${d.rc}">
      <div class="atop"><span class="aov" style="font-weight:800;font-size:12px;letter-spacing:.06em;text-transform:uppercase">${esc(d.rarityLabel)}</span><span class="abadges"><span class="akind ${vil?'kv':'kh'}">${vil?'Villain':'Hero'}</span><span class="arar" style="background:${d.rc}">${esc(d.rarityLabel)}</span></span></div>
      <div class="aart">${art}</div>
      <div class="aname">${esc(d.name)}</div>
      <div class="atitle">${esc(d.title)}</div>
      <div class="astats">${(()=>{ const e=(c.avEv||{})[a.id]; const r=(l,v)=>`<div class="abar" style="grid-template-columns:1fr auto"><span class="al">${l}</span><b class="av">${v}</b></div>`;
        return (e&&(e.r||e.s||e.m))?r('Words spelled right together',e.r)+r('Atlas stops finished',e.s)+r('Stages mastered',e.m):`<div class="al" style="padding:4px 0">Wear ${esc(d.name)} and your words will show here.</div>`; })()}</div>
      ${d.power?`<div class="afact" style="margin-bottom:6px"><b>${iconSVG('bolt',14,2.4)} Superpower</b> ${esc(d.power)}</div>`:''}
      <div class="afact"><b>Inspired by</b> ${esc(d.fact)}</div>
      <div class="apack">🐝 ${esc(d.packLabel)}</div>
    </div>`; };
  let pages=''; for(let i=0;i<owned.length;i+=4){
    pages+='<div class="page">'+owned.slice(i,i+4).map(front).join('')+'</div>'; }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>My avatar cards — Bizzing Bee</title><style>
    @page{size:letter portrait;margin:8mm} *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Trebuchet MS','Segoe UI',Verdana,sans-serif;color:#241E33}
    .page{display:flex;flex-wrap:wrap;gap:9mm 8mm;justify-content:center;align-content:flex-start;page-break-after:always}
    .card{width:90mm;height:125mm;border:2.5px solid var(--rc,var(--c1));border-radius:18px;overflow:hidden;position:relative;display:flex;flex-direction:column;background:linear-gradient(165deg,color-mix(in srgb,var(--c1) 22%,#fff),#fff 46%);-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .afront{padding:12px 14px 10px}
    .avil{background:linear-gradient(165deg,color-mix(in srgb,var(--c1) 42%,#1A1526),#17131F 55%)!important;color:#fff;border-color:var(--rc)}
    .atop{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
    .aov{display:grid;justify-items:center;line-height:1;background:var(--rc);color:#fff;border-radius:11px;padding:5px 10px}
    .aov b{font-size:22px;font-weight:800} .aov i{font-size:8px;font-style:normal;letter-spacing:.12em;opacity:.9}
    .abadges{display:grid;gap:5px;justify-items:end}
    .akind{font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px} .kh{background:rgba(45,163,92,.16);color:#1f8a4c;border:1px solid rgba(45,163,92,.4)} .kv{background:rgba(196,61,90,.2);color:#ff9db0;border:1px solid rgba(196,61,90,.5)}
    .arar{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff;padding:3px 10px;border-radius:99px}
    .aart{width:130px;height:130px;margin:4px auto 2px;display:grid;place-items:center;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--c2) 55%,transparent),transparent 68%)}
    .aart svg{width:124px;height:124px}
    .aname{text-align:center;font-size:24px;font-weight:800;line-height:1;margin-top:2px} .avil .aname{color:#fff}
    .atitle{text-align:center;font-size:12px;font-style:italic;color:color-mix(in srgb,var(--c1) 70%,#333);margin:2px 6px 8px} .avil .atitle{color:#c9bce8}
    .astats{display:grid;gap:5px;margin:0 2px 8px}
    .abar{display:grid;grid-template-columns:74px 1fr 24px;align-items:center;gap:7px;font-size:11px;font-weight:700}
    .abar .at{height:8px;border-radius:99px;background:rgba(120,110,150,.25);overflow:hidden} .abar .at i{display:block;height:100%;border-radius:99px} .abar .av{font-size:11px;font-weight:800;text-align:right}
    .avil .abar .at{background:rgba(255,255,255,.18)}
    .afact{font-size:11.5px;line-height:1.4;background:color-mix(in srgb,var(--c2) 20%,#fff);border:1px solid color-mix(in srgb,var(--c1) 28%,#ddd);border-radius:11px;padding:8px 10px;margin:auto 0 8px} .afact b{display:block;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--c1);margin-bottom:2px}
    .avil .afact{background:rgba(0,0,0,.35);border-color:color-mix(in srgb,var(--c1) 40%,#333);color:#e6def5} .avil .afact b{color:#ffb0c4}
    .apack{text-align:center;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--c1) 60%,#999)} .avil .apack{color:#b9aed0}
    /* shared fun back */
  </style></head><body>${pages}</body></html>`; }

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrMe) */
Object.assign(app, {
  printAvCards:()=>{ try{ const w=window.open('','_blank'); if(!w){ flash('Pop-up blocked — allow pop-ups to print'); return; }
    w.document.write(printAvCardsDoc()); w.document.close(); setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} },420); }catch(e){ flash('Could not open the print view'); } },
  shopTab:(t)=>set({shopTab:({avatars:1,worlds:1,extras:1})[t]?t:'avatars'}),
  buyFrame:(id)=>{ const c=active(); const f=FRAME_BY[id]; if(!f||frameOwned(c,id)) return;
    const bal=c.coins|0; if(bal<f.price){ flash(f.name+' is '+f.price+' Bizzing coins — '+(f.price-bal)+' more to go.'); return; }
    if(!window.confirm('Buy the '+f.name+' frame for '+f.price+' Bizzing coins? The price is fixed.')) return;
    if(!spendCoins(f.price,'frame:'+id)){ flash('That did not go through — nothing was spent.'); return; }
    c.frames=c.frames||{}; c.frames[id]=Date.now(); c.frame=id; save(); sfx('win'); flash('The '+f.name+' frame is yours — you are wearing it now.'); render(); },
  wearFrame:(id)=>{ const c=active(); if(id&&!frameOwned(c,id)) return; c.frame=id||null; save(); sfx('correct'); render(); },
  collTab:(t)=>set({collTab:t}),
  /* A world for 240 Bizzing coins (BZ_AVATARS.buyWorld). It opens the world AND its packs. */
  buyWorld:(id)=>{ const c=active(); const n=worldNum(id); if(!n){ return; } if(isThemeUnlocked(id)){ app.pickTheme(id); return; }
    const t=THEMES.find(x=>x.id===id)||{label:id}; const bal=(c.coins|0);
    if(bal<WORLD_PRICE_COINS){ flash(t.label+' is '+WORLD_PRICE_COINS+' Bizzing coins — '+(WORLD_PRICE_COINS-bal)+' more to go.'); return; }
    if(!window.confirm('Open '+t.label+' for '+WORLD_PRICE_COINS+' Bizzing coins? The price is fixed. It opens the world and its avatar packs.')) return;
    let ok=false;
    if(window.SB_DEMO){ ok=spendCoins(WORLD_PRICE_COINS,'world:'+n); }
    else { walletSync(c); ok=BZ_AVATARS.buyWorld(BEE_APP, walletWho(c), n, avCtx(c)); try{ c.coins=BZ_WALLET.balance(walletWho(c)); }catch(e){} }
    if(!ok){ flash('That did not go through — nothing was spent.'); return; }
    c.unlockedThemes=(c.unlockedThemes||[]).concat([id]); save(); sfx('win'); burstConfetti(140); flash(t.label+' is open — and so are its avatar packs!'); app.pickTheme(id); }
});
