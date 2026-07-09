import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const s=await (await b.newContext({viewport:{width:520,height:260}})).newPage();
const errs=[]; s.on('pageerror',e=>errs.push(e.message));
await s.goto('file:///home/claude/repo/spellbound-app/index.html'); await s.waitForTimeout(600);
await s.evaluate(()=>{ document.body.innerHTML='<div style="background:#fff;padding:20px;display:flex;gap:24px">'+
  ['volt','fanfold','zappy'].map(id=>'<div style="width:140px;height:140px">'+SB_AVATAR(id,140)+'</div>').join('')+'</div>';
  document.documentElement.style.background='#fff'; });
await s.screenshot({path:'s7-fix.png'});
console.log('errs:',errs.length?errs:'none');
await b.close();
