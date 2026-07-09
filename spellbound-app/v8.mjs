import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:13,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[1,2,3,4,5,6,7],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:0}},coins:120,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const R={};
await pg.evaluate(()=>{ app.setAgeMode('focused'); render(); }); await pg.waitForTimeout(300);
R.home=await pg.evaluate(()=>({ rings:document.querySelectorAll('svg[viewBox="0 0 88 88"]').length,
  tip:/Tip of the day/i.test(document.body.textContent),
  trapsNav:[...document.querySelectorAll('[data-act="setNav"]')].map(x=>x.getAttribute('data-arg')).includes('traps'),
  arcadeNav:[...document.querySelectorAll('[data-act="setNav"]')].map(x=>x.getAttribute('data-arg')).includes('games') }));
// white mode: page background must be pure white with no accent wash
await pg.evaluate(()=>{ app.setMode('white'); render(); }); await pg.waitForTimeout(600);
R.white=await pg.evaluate(()=>{ const cs=getComputedStyle(document.body);
  const after=getComputedStyle(document.documentElement,'::after');
  return { bodyBg:cs.backgroundColor, washDisplay:after.display }; });
await pg.screenshot({path:'t-white.png', clip:{x:0,y:0,width:1360,height:700}});
await pg.evaluate(()=>{ app.setMode('light'); render(); });
// traps still reachable via coach pill + drawer
await pg.evaluate(()=>{ app.openCoach(); }); await pg.waitForTimeout(300);
R.pill=await pg.evaluate(()=>{ const btn=document.querySelector('[data-act="openTraps"]'); if(!btn) return null; btn.click(); return true; });
await pg.waitForTimeout(400);
R.radar=await pg.evaluate(()=>[...document.querySelectorAll('[data-act="trapPick"]')].length);
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();
