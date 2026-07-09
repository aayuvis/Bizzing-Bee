import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const s=await (await b.newContext({viewport:{width:1180,height:900}})).newPage();
await s.goto('file:///home/claude/repo/spellbound-app/index.html'); await s.waitForTimeout(600);
await s.evaluate(()=>{ const L=SB_AVATARS.list, P=SB_AVATARS.packs;
  document.body.innerHTML='<div style="background:#fff;padding:16px;font-family:system-ui">'+P.map(p=>
    '<div id="pk-'+p.id+'" style="background:#fff;padding:6px 0"><div style="font-weight:800;font-size:13px;margin:4px 0 6px;color:'+p.c1+'">'+p.label+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:10px">'+
    L.filter(a=>a.pack===p.id).map(a=>'<div style="text-align:center"><div style="width:96px;height:96px">'+SB_AVATAR(a.id,96)+'</div><div style="font-size:10px;font-weight:700">'+a.name+'</div><div style="font-size:9px;color:#888">'+a.rarity+'</div></div>').join('')+
    '</div></div>').join('')+'</div>';
  document.documentElement.style.background='#fff'; });
for(const id of ['lab','arcade','origami','elements']){
  const el=await s.$('#pk-'+id); await el.scrollIntoViewIfNeeded(); await s.waitForTimeout(120);
  await el.screenshot({path:'s7-pk-'+id+'.png'});
}
await b.close();
