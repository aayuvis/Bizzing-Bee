import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:13,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[1,2,3,4,5,6,7],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:0}},coins:120,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2},{w:'necessary',n:1},{w:'receive',n:1}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const R={};
await pg.evaluate(()=>{ app.setAgeMode('focused'); render(); }); await pg.waitForTimeout(300);
R.home=await pg.evaluate(()=>{ const t=document.body.textContent;
  const rings=document.querySelectorAll('svg[viewBox="0 0 88 88"] circle').length; // 3 rings × 2 circles = 6
  const tip=document.querySelector('div[style*="border-left"]');
  return { rings, tipLabel:/Tip of the day/i.test(t), noBars:!/Readiness\b/.test(t.replace(/Readiness \d+%/g,'')), tipText:tip?tip.textContent.replace(/^["“]*\s*Tip of the day/i,'').trim().slice(0,90):null }; });
// level-banded tip: at level 1 tip must come from basics concepts or young/memory/motivation/review tips
R.band=await pg.evaluate(()=>{ const pool=[];
  (SB_CONCEPTS.chapters.filter(c=>c.category==='Spelling Bee Basics')).forEach(ch=>{ const f=String(ch.concept||'').split(/(?<=[.!?])\s/)[0]; if(f&&f.length>30) pool.push(f); });
  ['young','memory','motivation','review'].forEach(k=>(SB_TIPS[k]||[]).forEach(t=>pool.push(t)));
  const t1=trunc(pool[dayNum()%pool.length],150);
  const shown=document.querySelector('div[style*="border-left"]').textContent;
  const lvl1ok=shown.includes(t1.slice(0,60));
  // now jump to level 12 → tip should draw from the wide pool (usually different)
  const c=active(); c.lists.journey.stage=11; render();
  const shown2=document.querySelector('div[style*="border-left"]').textContent;
  return { lvl1ok, changed:shown2!==shown, l1:shown.slice(12,90), l12:shown2.slice(12,90) }; });
await pg.evaluate(()=>{ active().lists.journey.stage=0; render(); }); await pg.waitForTimeout(200);
await pg.screenshot({path:'t-home-rings.png', clip:{x:0,y:0,width:1360,height:760}});
// playful mode should NOT show rings (playful greeting keeps it simple)
R.playful=await pg.evaluate(()=>{ app.setAgeMode('playful'); render(); const n=document.querySelectorAll('svg[viewBox="0 0 88 88"]').length; app.setAgeMode('focused'); render(); return { ringsInPlayful:n }; });
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();
