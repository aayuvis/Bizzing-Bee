/* Buying lives where the thing lives — the Library/Worlds half.
   A locked word list opens the plan sheet in the Library (lists are not sold for coins).
   A locked concept chapter offers its coin unlock in the Library. A locked world is
   bought on the world. And the Store's old entry points still land on the Hive.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/buy-where-it-lives.cjs */
const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const errs=[];
  const pg=await b.newPage({viewport:{width:1180,height:900}});
  pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'..')+'/index.html');
  await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{ state.children=[{name:'T',avatar:'bee',coins:5000,pow:{},freezes:0,streak:2,
    lists:{default:{xp:10}},activeList:'default',missed:[],unlockedThemes:['spellbound'],beeAcc:{},unlockedConcepts:{},unlockedLists:{}}];
    state.activeIdx=0; state.screen='app'; state.premium=false; });

  // --- Library: locked lists must open the plan sheet, never a coin price ---
  await pg.evaluate(()=>app.coachSetupOpen()); await pg.waitForTimeout(1200);
  let r=await pg.evaluate(()=>({
    acts:[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act))],
    txt:document.body.innerText, ow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2 }));
  if(r.acts.includes('buyList')) errs.push('buyList still on the Library');
  if(!r.acts.includes('lockedList')) errs.push('no locked list rendered — cannot verify the plan route');
  if(/coins from playing/.test(r.txt)) errs.push('old coin-price copy still on the Library');
  if(r.ow) errs.push('H-OVERFLOW on lists');
  // clicking a locked list opens the tiers sheet
  const clicked=await pg.evaluate(()=>{ const el=document.querySelector('[data-act="lockedList"]'); if(!el) return 'none'; el.click(); return null; });
  if(clicked) errs.push('locked list: '+clicked);
  await pg.waitForTimeout(500);
  if(!(await pg.evaluate(()=>!!state.showTiers))) errs.push('locked list did not open the plan sheet');
  await pg.evaluate(()=>{ state.showTiers=false; render(); });

  // --- Concepts: unlocking still lives in the Library ---
  await pg.evaluate(()=>{ try{ loadConcepts(); }catch(e){} app.setNav('concepts'); }); await pg.waitForTimeout(2500); await pg.evaluate(()=>render()); await pg.waitForTimeout(600);
  // the library opens on category cards; a locked chapter's unlock button is one level in
  await pg.evaluate(()=>{ const e=document.querySelector('[data-act="openConceptChapter"]'); if(e) e.click(); });
  await pg.waitForTimeout(900);
  r=await pg.evaluate(()=>({ ow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2 }));
  // a locked chapter tapped in the Library must offer the coin unlock right there
  const conc=await pg.evaluate(()=>{ let asked=null; const real=window.confirm;
    window.confirm=(m)=>{ asked=m; return false; };
    const ci=(state.conceptData||[]).findIndex((c,i)=>!isConceptUnlocked(i));
    if(ci<0) return 'no locked chapter';
    app.openConcept(ci); window.confirm=real;
    return /Unlock this concept for \d+ coins/.test(asked||'') ? null : ('unlock prompt was: '+asked); });
  if(conc) errs.push('concepts: '+conc);
  if(r.ow) errs.push('H-OVERFLOW on concepts');

  // --- Worlds: buying a world lives on the world ---
  await pg.evaluate(()=>app.openWorlds()); await pg.waitForTimeout(500);
  r=await pg.evaluate(()=>[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act))]);
  if(!r.includes('buyTheme')) errs.push('buyTheme missing from Worlds');

  // --- surviving entry points must land somewhere real ---
  for(const a of ['openShop','openShopAvatars']){
    await pg.evaluate(x=>app[x](), a); await pg.waitForTimeout(400);
    const nav=await pg.evaluate(()=>state.nav);
    if(nav!=='collection') errs.push(a+' landed on nav='+nav);
  }
  // --- the drawer must not offer a Store ---
  await pg.evaluate(()=>{ state.drawerOpen=true; render(); }); await pg.waitForTimeout(400);
  const dtxt=await pg.evaluate(()=>document.body.innerText);
  if(/\bStore\b/.test(dtxt)) errs.push('drawer still names a Store');

  await b.close();
  console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS — lists, concepts, worlds and entry points all land correctly');
  process.exit(errs.length?1:0);
})();
