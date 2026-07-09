import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const R={};
// ---- veteran profile with coins ----
const v=await (await b.newContext({viewport:{width:1360,height:1100}})).newPage();
v.on('pageerror',e=>errs.push('V:'+e.message));
await v.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bizzy',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:900,band:4,bandSeed:4,missed:[]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await v.goto('file:///home/claude/repo/spellbound-app/index.html'); await v.waitForTimeout(800);
// 1. data shape
R.data=await v.evaluate(()=>{ const L=SB_AVATARS.list, P=SB_AVATARS.packs;
  const perPack=P.map(p=>L.filter(a=>a.pack===p.id).length);
  const rc=r=>L.filter(a=>a.rarity===r).length;
  const allSvg=L.every(a=>{ const s=SB_AVATAR(a.id,120); return s&&s.includes('<svg'); });
  const uniq=new Set(L.map(a=>a.id)).size;
  return { total:L.length, packs:P.length, perPack, free:rc('free'), rare:rc('rare'), epic:rc('epic'), legendary:rc('legendary'), allSvg, uniq }; });
// 2. collection screen counts + economy
R.coll=await v.evaluate(async()=>{ app.openCollection(); await new Promise(r=>setTimeout(r,300)); const t=document.body.textContent;
  return { head:/10\/80 avatars/.test(t), tab:/Avatars · 10\/80/.test(t), badgesTab:/Badges · /.test(t) }; });
await v.screenshot({path:'s7-coll-top.png', clip:{x:330,y:60,width:720,height:1000}});
R.econ=await v.evaluate(async()=>{ const c=active(); const before=c.coins;
  app.buyAvatar('waggle'); // rare 120
  const bought=avOwned(c,'waggle') && c.coins===before-120;
  app.wearAv('waggle'); const worn=c.avatar==='waggle';
  const blockedSell=(()=>{ app.sellAvatar('waggle'); return avOwned(c,'waggle'); })(); // blocked while wearing
  app.wearAv('bizzy'); app.sellAvatar('waggle');
  const sold=!avOwned(c,'waggle') && c.coins===before-120+60;
  return { bought, worn, blockedSell, sold }; });
// 3. wear a new-pack avatar → welcome card shows it
R.wear=await v.evaluate(async()=>{ const c=active(); app.buyAvatar('goldencrane'); app.wearAv('goldencrane');
  app.setNav('home'); await new Promise(r=>setTimeout(r,300));
  const h=document.body.innerHTML; return { legendaryBuy:avOwned(c,'goldencrane'), onCard:c.avatar==='goldencrane' }; });
// 4. drawer count
R.drawer=await v.evaluate(async()=>{ state.drawerOpen=true; render(); await new Promise(r=>setTimeout(r,200));
  const ok=/\/80 avatars · badges/.test(document.body.textContent); state.drawerOpen=false; render(); return ok; });
// 5. onboarding picker has 8 packs
const f=await (await b.newContext({viewport:{width:1360,height:1100}})).newPage();
f.on('pageerror',e=>errs.push('F:'+e.message));
await f.goto('file:///home/claude/repo/spellbound-app/index.html'); await f.waitForTimeout(600);
R.onb=await f.evaluate(async()=>{ state.screen='onboarding'; state.onbStep=0; state.draft={name:'Arjun',age:8,avatar:'bizzy',goal:10}; render();
  await new Promise(r=>setTimeout(r,200)); const t=document.body.textContent;
  const btns=[...document.querySelectorAll('[data-act="pickAvatar"]')].map(b=>b.dataset.arg);
  const freeTiles=btns.filter(id=>SB_AVATARS.byId[id].rarity==='free').length;
  const legendTiles=btns.filter(id=>SB_AVATARS.byId[id].rarity==='legendary').length;
  const teaser=/more to collect/.test(t);
  app.pickAvatar('queenhive'); const lockedGuard=state.draft.avatar==='bizzy';
  app.pickAvatar('pebble'); const freePick=state.draft.avatar==='pebble';
  return { freeTiles, legendTiles, teaser, lockedGuard, freePick }; });
await f.screenshot({path:'s7-onb.png', fullPage:false, clip:{x:330,y:60,width:720,height:1000}});
// 6. contact sheet of all 80
const s=await (await b.newContext({viewport:{width:1180,height:1120}})).newPage();
s.on('pageerror',e=>errs.push('S:'+e.message));
await s.goto('file:///home/claude/repo/spellbound-app/index.html'); await s.waitForTimeout(600);
await s.evaluate(()=>{ const L=SB_AVATARS.list, P=SB_AVATARS.packs;
  document.body.innerHTML='<div style="background:#fff;padding:16px;font-family:system-ui">'+P.map(p=>
    '<div style="font-weight:800;font-size:13px;margin:10px 0 6px;color:'+p.color+'">'+p.name+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:10px">'+
    L.filter(a=>a.pack===p.id).map(a=>'<div style="text-align:center"><div style="width:96px;height:96px">'+SB_AVATAR(a.id,96)+'</div><div style="font-size:10px;font-weight:700">'+a.name+'</div><div style="font-size:9px;color:#888">'+a.rarity+'</div></div>').join('')+
    '</div>').join('')+'</div>';
  document.documentElement.style.background='#fff'; });
await s.screenshot({path:'s7-sheet-1.png', clip:{x:0,y:0,width:1180,height:620}});
await s.evaluate(()=>window.scrollTo(0,620)); await s.waitForTimeout(150);
await s.screenshot({path:'s7-sheet-2.png', clip:{x:0,y:0,width:1180,height:620}});
await s.evaluate(()=>window.scrollTo(0,1240)); await s.waitForTimeout(150);
await s.screenshot({path:'s7-sheet-3.png', clip:{x:0,y:0,width:1180,height:620}});
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();
