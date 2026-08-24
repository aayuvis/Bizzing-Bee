/* The daily-goal rings are one chain: Home -> Coach -> the 30-day chart.
   Tapping the rings on Home opens the Coach (they used to jump straight to Progress,
   skipping the screen that explains them). The Coach carries them in its header band
   at 2:1 beside Bizzy'''s read, stacking below 760px. Coach rings still open Progress.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/coach-rings.cjs */
const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const errs=[];
  for(const vp of [{width:1180,height:900,n:'desktop'},{width:390,height:844,n:'phone'}]){
    const pg=await b.newPage({viewport:{width:vp.width,height:vp.height}});
    pg.on('pageerror',e=>errs.push(vp.n+' pageerror: '+e.message));
    await pg.goto('file://'+require('path').resolve(__dirname,'..')+'/index.html');
    await pg.waitForTimeout(2800);
    await pg.evaluate(()=>{ state.children=[{name:'Tester',avatar:'bee',coins:400,pow:{},lists:{default:{xp:30}},
      activeList:'default',missed:[{w:'necessary',n:3,ts:Date.now()},{w:'rhythm',n:2,ts:Date.now()}],
      unlockedThemes:['spellbound'],beeAcc:{},unlockedConcepts:{},unlockedLists:{},streak:4}];
      state.activeIdx=0; state.screen='app'; app.setNav('home'); });
    await pg.waitForTimeout(700);
    // Home rings tile now opens the Coach
    const hit=await pg.evaluate(()=>{ const el=document.querySelector('[data-act="openCoachDesk"]'); if(!el) return 'no rings tile'; el.click(); return null; });
    if(hit) errs.push(vp.n+' '+hit);
    await pg.waitForTimeout(1400);
    const r=await pg.evaluate(()=>({ nav:state.nav, txt:document.body.innerText,
      ow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      heroCols:(()=>{ const e=document.querySelector('.sb-coach-hero'); return e?getComputedStyle(e).gridTemplateColumns:null; })(),
      ringsInHero:!!document.querySelector('.sb-coach-hero [data-act="openMetrics"]') }));
    if(r.nav!=="coachdesk") errs.push(vp.n+' rings landed on nav='+r.nav);
    if(!r.ringsInHero) errs.push(vp.n+' rings missing from the coach hero');
    if(/Worked out from your own practice/.test(r.txt)) errs.push(vp.n+' the old coach explainer is still there');
    if(r.ow) errs.push(vp.n+' H-OVERFLOW on coach');
    const cols=(r.heroCols||'').split(/\s+/).filter(Boolean).map(parseFloat);
    if(vp.n==='desktop'){ if(cols.length!==2) errs.push('desktop hero is not 2 columns: '+r.heroCols);
      else { const ratio=cols[0]/cols[1]; if(ratio<1.8||ratio>2.2) errs.push('desktop hero ratio '+ratio.toFixed(2)+' (want ~2.0)'); } }
    else if(cols.length!==1) errs.push('phone hero did not stack: '+r.heroCols);
    // the coach rings still reach the 30-day chart
    await pg.evaluate(()=>{ const e=document.querySelector('.sb-coach-hero [data-act="openMetrics"]'); if(e) e.click(); });
    await pg.waitForTimeout(800);
    if(await pg.evaluate(()=>state.nav)!=='progress') errs.push(vp.n+' coach rings did not open Progress');
    await pg.close();
  }
  await b.close();
  console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS — Home rings open the Coach, the Coach carries them 2:1, and they still reach the 30-day chart');
  process.exit(errs.length?1:0);
})();
