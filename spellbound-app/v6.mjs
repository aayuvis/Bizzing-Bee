import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:13,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[1,2,3,4,5,6,7],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2},{w:'necessary',n:1},{w:'receive',n:1}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const R={};
R.nav=await pg.evaluate(()=>{ const t=[...document.querySelectorAll('[data-act="setNav"]')].map(x=>x.getAttribute('data-arg')); return { arcade:t.includes('games'), traps:t.includes('traps') }; });
R.homeNoTraps=await pg.evaluate(()=>{ app.setAgeMode('focused'); render(); return !/Your Traps/.test(document.body.textContent); });
// coach pill
await pg.evaluate(()=>{ app.openCoach(); }); await pg.waitForTimeout(400);
R.pill=await pg.evaluate(()=>{ const b=document.querySelector('[data-act="openTraps"]'); return b?b.textContent.trim():null; });
// traps flow
await pg.evaluate(()=>{ app.openTraps(); }); await pg.waitForTimeout(400);
R.radar=await pg.evaluate(()=>({ rows:[...document.querySelectorAll('[data-act="trapPick"]')].length, cover:!!document.querySelector('svg[viewBox="0 0 320 110"]') }));
await pg.screenshot({path:'t-radar.png'});
await pg.evaluate(()=>{ document.querySelector('[data-act="trapPick"]')?.click(); }); await pg.waitForTimeout(400);
R.detail=await pg.evaluate(()=>{ const t=document.body.textContent; return { trick:/The trick/.test(t), learn:/Learn it properly/.test(t)&&!!document.querySelector('[data-act="openConcept"]'), words:/Your battlefield/.test(t), cta:/Free yourself/.test(t) }; });
await pg.screenshot({path:'t-detail.png'});
await pg.evaluate(()=>{ [...document.querySelectorAll('button')].find(x=>/Free yourself/.test(x.textContent))?.click(); }); await pg.waitForTimeout(500);
R.drill=await pg.evaluate(()=>/Learn|Practice|Card 1/i.test(document.body.textContent));
// game reveal + tips (buzz quick run)
await pg.evaluate(()=>{ app.openGames(); app.playGame('buzz'); }); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ const g=state.game; for(let i=0;i<g.list.length;i++){ state.typed=(i%3===0)?'wrongxx':g.list[g.i].w; app.gSubmit(); } }); await pg.waitForTimeout(500);
R.reveal=await pg.evaluate(()=>{ const t=document.body.textContent; return { right:/Got right/.test(t), fix:/To fix/.test(t), tips:/Coach tips/.test(t) }; });
await pg.screenshot({path:'t-reveal.png'});
// level-banded pool: stage 2 → words from current+prev stages
R.pool=await pg.evaluate(()=>{ const ws=gameWords(); const stages=listStages('journey'); const set=new Set(stages[2].words.concat(stages[1].words).map(w=>nkey(w.w)));
  const inBand=ws.filter(w=>set.has(nkey(w.w))).length; return { total:ws.length, inBand, pct:Math.round(inBand/ws.length*100) }; });
// placement test flow
R.lt=await pg.evaluate(async()=>{ app.startLevelTest(); await new Promise(r=>setTimeout(r,300));
  // pass level 1 with 3 correct
  for(let k=0;k<3;k++){ state.lt.typed=state.lt.words[state.lt.i].w; app.ltEnter(); }
  const climbed=state.lt.lvl===2;
  // fail 3 at level 2 → placed at 1
  for(let k=0;k<3;k++){ state.lt.typed='zz'; app.ltEnter(); }
  return { climbed, done:state.lt.done, placed:state.lt.placed, stage:state.children[0].lists.journey.stage };
});
console.log('ERRORS:',errs.length?errs:'none'); console.log(JSON.stringify(R,null,1));
await b.close();
