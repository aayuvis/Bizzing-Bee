import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push(e.message));
const shot=(n,h)=>pg.screenshot({path:`r-${n}.png`, clip:{x:0,y:0,width:1360,height:h||900}});
// seeded veteran profile (misses, streak, coins, stage 2)
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[1,2,3,4,5,6,7],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2},{w:'necessary',n:1},{w:'receive',n:1}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const R={};
// 1. playful home (age 9 default)
await shot('home-playful',1000);
R.playfulDoors=await pg.evaluate(()=>document.querySelectorAll('[data-act]').length);
// 2. focused home
await pg.evaluate(()=>{ app.setAgeMode('focused'); render(); }); await pg.waitForTimeout(400);
await shot('home-focused',1000);
// 3. coach screen
await pg.evaluate(()=>{ app.openCoach(); }); await pg.waitForTimeout(500); await shot('coach',1000);
// 4. traps radar + detail
await pg.evaluate(()=>{ app.openTraps(); }); await pg.waitForTimeout(400); await shot('traps');
await pg.evaluate(()=>{ document.querySelector('[data-act="trapPick"]')?.click(); }); await pg.waitForTimeout(400); await shot('trap-detail',1000);
// 5. arcade
await pg.evaluate(()=>{ app.openGames(); }); await pg.waitForTimeout(400); await shot('arcade',1000);
// 6. game + reveal (mixed run)
await pg.evaluate(()=>{ app.playGame('buzz'); }); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ const g=state.game; for(let i=0;i<g.list.length;i++){ state.typed=(i%3===0)?'wrongxx':g.list[g.i].w; app.gSubmit(); } }); await pg.waitForTimeout(400);
await shot('reveal',1000);
// 7. shop
await pg.evaluate(()=>{ app.openShop&&app.openShop(); state.nav='shop'; render(); }); await pg.waitForTimeout(400); await shot('shop',1000);
// 8. progress
await pg.evaluate(()=>{ app.setNav('progress'); }); await pg.waitForTimeout(400); await shot('progress',1000);
// 9. parent
await pg.evaluate(()=>{ app.setNav('parent'); }); await pg.waitForTimeout(400); await shot('parent',1000);
// 10. concepts/explore
await pg.evaluate(()=>{ app.setNav('explore'); }); await pg.waitForTimeout(400); await shot('explore',1000);
// 11. dusk home
await pg.evaluate(()=>{ app.setMode('dusk'); app.setNav('home'); }); await pg.waitForTimeout(700); await shot('home-dusk',1000);
await pg.evaluate(()=>{ app.setMode('light'); });
// -------- edge probes --------
// fresh profile: traps with no misses, tip of day, placement test entry
R.fresh=await pg.evaluate(async()=>{ const out={};
  const c=active(); c.missed=[]; render();
  app.openTraps(); await new Promise(r=>setTimeout(r,200));
  out.trapsEmpty=document.body.textContent.includes('trap')||document.body.textContent.length>500;
  out.trapsEmptyText=document.body.textContent.replace(/\s+/g,' ').slice(0,400);
  return out; });
await shot('traps-empty');
// perfect game run reveal
R.perfect=await pg.evaluate(async()=>{ app.playGame('buzz'); await new Promise(r=>setTimeout(r,300));
  const g=state.game; for(let i=0;i<g.list.length;i++){ state.typed=g.list[g.i].w; app.gSubmit(); }
  await new Promise(r=>setTimeout(r,200)); const t=document.body.textContent;
  return { fix:/To fix/.test(t), tips:/Coach tips/.test(t), right:/Got right/.test(t) }; });
// duel quick check
R.duel=await pg.evaluate(async()=>{ try{ app.playGame('duel'); await new Promise(r=>setTimeout(r,300)); const ok=!!state.game&&state.game.type==='duel'; app.openGames(); return ok; }catch(e){ return 'ERR '+e.message; } });
// word count sanity + tip pools per level
R.tipPool=await pg.evaluate(()=>{ const c=active(); const out={};
  c.lists.journey.stage=0; out.l1=document.body.textContent.length>0;
  return { basics:SB_CONCEPTS.chapters.filter(x=>x.category==='Spelling Bee Basics').length }; });
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();
