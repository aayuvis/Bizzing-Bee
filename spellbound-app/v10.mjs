import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[1,2,3,4,5,6,7],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const R={};
// 1. Band engine: cold start → calibrating; feed 40 attempts at band 4 (90% right) → promotes to 4; then one terrible game at band 4 → no demote
R.engine=await pg.evaluate(()=>{ const c=active(); const out={};
  out.cold=beeBand(c).calibrating===true && /calibrating/i.test(document.body.textContent||'');
  const w4={w:'testword',y:4}, w2={w:'easy',y:2};
  for(let i=0;i<12;i++) logBand(w2,true);
  for(let i=0;i<40;i++) logBand(w4, i%10!==0); // 90% right at band 4
  const afterGood=beeBand(c).band;
  for(let i=0;i<8;i++) logBand(w4,false);      // one awful streak, still within window with wins
  const afterBad1=beeBand(c).band;
  for(let i=0;i<25;i++) logBand(w4,false);     // sustained slide
  const afterSlide=beeBand(c).band;
  return {...out, afterGood, afterBad1, afterSlide}; });
// reset profile attempts for UI checks
await pg.evaluate(()=>{ const c=active(); c.attempts=[]; c.band=4; c.bandSeed=4; render(); }); await pg.waitForTimeout(300);
// 2. Home: 3 cards + band chip + evolution card carries both metrics + no "Lv" chips
R.home=await pg.evaluate(()=>{ const t=document.body.textContent;
  return { bandInMiddleCard:/Band 4 · School-Bee Ready/.test(t), bandOnce:(t.match(/Band 4 · School-Bee Ready/g)||[]).length===1,
    evoCard:/Effort — grows with practice/.test(t)&&/Skill — what you.re ready to spell/.test(t),
    noXpNumeral:!/XP to /.test(t), ladderGone:!/Your evolution/.test(t), noLvChips:!/· Lv \d/.test(t) }; });
await pg.screenshot({path:'b-home.png', clip:{x:0,y:0,width:1360,height:760}});
// 3. Evolution screen via card
await pg.evaluate(()=>{ app.openEvo(); }); await pg.waitForTimeout(300);
R.evoScreen=await pg.evaluate(()=>{ const t=document.body.textContent; return { open:/Your evolution/.test(t)&&/effort/i.test(t), youMarker:/YOU/.test(t), noLv:!/Lv \d/.test(t) }; });
await pg.screenshot({path:'b-evo.png', clip:{x:0,y:0,width:1360,height:700}});
// 4. Progress: mastered count real + Band stat + tier ladder card
await pg.evaluate(()=>{ state.luMastered={apple:true,banana:true,cherry:true}; app.setNav('progress'); }); await pg.waitForTimeout(300);
R.progress=await pg.evaluate(()=>{ const t=document.body.textContent;
  return { mastered3:/3/.test(t)&&/Words mastered/.test(t), bandStat:/Band 4/.test(t)&&/Bee Band/.test(t),
    tierCard:/Your Bee Band/.test(t)&&/Regional Ready/.test(t)&&/Championship/.test(t), noCurLevel:!/Current level/.test(t),
    noAccTile:!/>Accuracy</.test(document.body.innerHTML) }; });
await pg.screenshot({path:'b-progress.png', clip:{x:0,y:0,width:1360,height:900}});
// 5. Parent: BEE BAND tile
await pg.evaluate(()=>{ app.setNav('parent'); }); await pg.waitForTimeout(300);
R.parent=await pg.evaluate(()=>/BEE BAND/.test(document.body.textContent));
// 6. gameWords capped at band+1
R.games=await pg.evaluate(()=>{ const ws=gameWords(); const over=ws.filter(w=>(w.y||3)>5).length; return { n:ws.length, overCap:over }; });
// 7. Placement test: band ladder + sync
R.lt=await pg.evaluate(async()=>{ app.startLevelTest(); await new Promise(r=>setTimeout(r,300));
  const startBand=state.lt.band;
  for(let k=0;k<3;k++){ state.lt.typed=state.lt.words[state.lt.i].w; app.ltEnter(); } // pass band 2
  const climbed=state.lt.band===3;
  for(let k=0;k<3;k++){ state.lt.typed=state.lt.words[state.lt.i].w; app.ltEnter(); } // pass band 3
  for(let k=0;k<3;k++){ state.lt.typed='zz'; app.ltEnter(); }                          // fail band 4
  const c=active();
  return { startBand, climbed, placed:state.lt.placed, band:c.band, seed:c.bandSeed, stage:c.lists.journey.stage,
    doneCopy:/Band 3/.test(document.body.textContent)&&/evolution measures/.test(document.body.textContent) }; });
await pg.screenshot({path:'b-lt.png', clip:{x:0,y:0,width:1360,height:800}});
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();
