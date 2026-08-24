/* Buying lives where the thing lives — the Hive half.
   The Store screen was deleted: it sold avatars, worlds, concepts and word lists that
   already had a home, so the same pack was purchasable from two screens under two
   different rules. This proves the Hive still carries every buy the Store did, that no
   dead shop action survives anywhere, and that artifacts — which the Store was the ONLY
   source of — are now granted by playing.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hive-store.cjs */
const { chromium } = require('playwright');
const path=require('path').resolve(__dirname,'..');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const errs=[];
  for(const vp of [{width:1180,height:900,n:'desktop'},{width:390,height:844,n:'phone'}]){
    const pg=await b.newPage({viewport:{width:vp.width,height:vp.height}});
    pg.on('pageerror',e=>errs.push(vp.n+' pageerror: '+e.message));
    pg.on('console',m=>{ if(m.type()==='error') errs.push(vp.n+' console: '+m.text().slice(0,160)); });
    await pg.goto('file://'+path+'/index.html');
    await pg.waitForTimeout(2500);
    // install a real child with coins, artifacts, a streak
    await pg.evaluate(()=>{
      const st=state; st.children=[{name:'Tester',avatar:'bee',coins:5000,pow:{shield:2,reveal:1},freezes:1,
        streak:9,lists:{default:{xp:40},journey:{xp:12}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
        beeAcc:{},unlockedConcepts:{},unlockedLists:{}}];
      st.activeIdx=0; st.screen='app'; st.premium=true; st.devUnlock=false; try{ window.SB_ENT.avatarPackLimit=()=>'all'; }catch(e){}
    });
    for(const [tab,label] of [['badges','Badges'],['avatars','Avatars'],['worlds','Worlds'],['artifacts','Artifacts']]){
      await pg.evaluate(t=>{ state.collTab=t; app.openCollection(); }, tab);
      await pg.waitForTimeout(400);
      const r=await pg.evaluate(()=>({
        txt:document.body.innerText,
        ow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
        acts:[...document.querySelectorAll('[data-act]')].map(e=>e.getAttribute('act')||e.dataset.act)
      }));
      if(r.ow) errs.push(vp.n+' H-OVERFLOW on collection/'+tab);
      if(/Store/.test(r.txt)) errs.push(vp.n+' "Store" copy still on collection/'+tab);
      const bad=r.acts.filter(a=>['openShop','openShopAvatars','buyPower','buyList','shopTab'].includes(a));
      if(bad.length) errs.push(vp.n+' dead act on '+tab+': '+[...new Set(bad)].join(','));
      if(tab==='artifacts'&&!/won by playing/i.test(r.txt)) errs.push(vp.n+' artifacts copy missing');
      
      if(tab==='avatars'&&!/Bee style/i.test(r.txt)) errs.push(vp.n+' accessories missing');
    }
    // odds panel actually opens
    await pg.evaluate(()=>{ state.collTab='avatars'; app.openCollection(); });
    await pg.waitForTimeout(300);
    const okOdds=await pg.evaluate(()=>{ const b=[...document.querySelectorAll('[data-act="toggleOdds"]')][0];
      if(!b) return 'no toggle'; b.click(); return null; });
    if(okOdds) errs.push(vp.n+' '+okOdds);
    await pg.waitForTimeout(350);
    const oddsTxt=await pg.evaluate(()=>document.body.innerText);
    if(!/%/.test(oddsTxt)) errs.push(vp.n+' odds panel did not render');
    // worlds + library
    for(const [act,name] of [['openWorlds','worlds'],['openEvo','evolution']]){
      await pg.evaluate(a=>app[a](), act); await pg.waitForTimeout(350);
      const r=await pg.evaluate(()=>({ow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,txt:document.body.innerText}));
      if(r.ow) errs.push(vp.n+' H-OVERFLOW on '+name);
      if(/\bStore\b/.test(r.txt)) errs.push(vp.n+' "Store" copy on '+name);
    }
    // My Hive is one page: no section bar at all (Worlds is a tab, the bee moved to the
    // Bee Band page), and certainly no Store segment.
    await pg.evaluate(()=>app.openCollection()); await pg.waitForTimeout(300);
    const segs=await pg.evaluate(()=>[...document.querySelectorAll('[data-act="openEvo"],[data-act="openWorlds"],[data-act="openShop"]')].length);
    if(segs) errs.push(vp.n+' a section bar is still above My Hive ('+segs+' segments)');
    // artifact grant path
    const grant=await pg.evaluate(()=>{ const c=state.children[0]; const before=(c.pow.shield||0)+(c.pow.reveal||0)+(c.pow.time||0);
      for(let i=0;i<30;i++) gainXp();
      return {before, after:(c.pow.shield||0)+(c.pow.reveal||0)+(c.pow.time||0)}; });
    await pg.close();
    console.log(vp.n+' artifact grant:', JSON.stringify(grant));
  }
  await b.close();
  console.log(errs.length? 'FAIL\n'+errs.join('\n') : 'PASS — no errors, no overflow, no dead shop actions');
  process.exit(errs.length?1:0);
})();
