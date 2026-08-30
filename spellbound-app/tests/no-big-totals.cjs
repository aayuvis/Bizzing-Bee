/* No screen tells a speller how long the road is.
   The Word Atlas said "0/102 stops" on Home, in the drawer and above the map. 102 is a
   mountain, not a map, and the bar beside it already carried the same information. This
   sweeps every child-facing screen for an "X / BIG" counter.
   COLLECTIONS ARE EXEMPT: "20/142 avatars", "3/80 badges" and "2/8 worlds" are the pleasure of a
   sticker album, not a workload — the count is the point, and hiding it would make the
   Hive worse. Only progress-through-work counters are barred.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/no-big-totals.cjs */
const { chromium } = require('playwright');
const root=require('path').resolve(__dirname,'..');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg=await b.newPage({viewport:{width:1180,height:2400}});
  pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto('file://'+root+'/index.html'); await pg.waitForTimeout(3200);
  await pg.evaluate(()=>{ state.children=[{name:'T',avatar:'bee',coins:900,pow:{},lists:{default:{xp:30},journey:{xp:20}},
    activeList:'default',missed:[{w:'rhythm',n:2,ts:Date.now()}],unlockedThemes:['spellbound'],
    unlockedConcepts:{},unlockedLists:{},questPath:'journey',trail:{done:{},lap:1}}];
    state.activeIdx=0; state.screen='app'; try{loadConcepts();}catch(e){} });
  await pg.waitForTimeout(2500);
  const screens=[['goHome','home'],['openTrail','atlas'],['openCoachDesk','coach'],
    ['openCollection','hive'],['coachSetupOpen','library'],['openCoach','practice'],
    ['openGames','arcade'],['openBuilder','builder']];
  const hits={};
  for(const [act,name] of screens){
    try{ await pg.evaluate(a=>app[a]&&app[a](), act); }catch(e){}
    await pg.waitForTimeout(900);
    const t=await pg.evaluate(()=>document.body.innerText);
    // X/Y or "X of Y" where Y is 40 or more
    const m=[...t.matchAll(/(\d[\d,]*)\s*(?:\/|of)\s*(\d[\d,]*)/g)]
      .filter(x=>parseInt(x[2].replace(/,/g,''),10)>=40).map(x=>x[0]);
    if(m.length) hits[name]=[...new Set(m)];
  }
  // concepts library separately
  await pg.evaluate(()=>app.setNav('concepts')); await pg.waitForTimeout(1500);
  const t=await pg.evaluate(()=>document.body.innerText);
  const m=[...t.matchAll(/(\d[\d,]*)\s*(?:\/|of)\s*(\d[\d,]*)/g)].filter(x=>parseInt(x[2].replace(/,/g,''),10)>=40).map(x=>x[0]);
  if(m.length) hits['concepts']=[...new Set(m)];
  // collections keep their counts; everything else must not show a big total
  const COLLECTION=/^(24|\d+)\s*\/\s*(142|80|8)$/;
  const bad={}; for(const k of Object.keys(hits)){
    const left=hits[k].filter(x=>!COLLECTION.test(x.replace(/\s+/g,''))); if(left.length) bad[k]=left; }
  await b.close();
  if(Object.keys(bad).length){ console.log('FAIL — a big total is shown to the speller:\n'+JSON.stringify(bad,null,1)); process.exit(1); }
  console.log('PASS — no screen shows a big work total (collection counts exempt)');
})();
