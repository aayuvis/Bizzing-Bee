# Persona audit brief — Bizzing Bee

You are auditing a kids' spelling-bee trainer web app AS A SPECIFIC PERSONA (given in your prompt). Actually drive the app headlessly and judge it through that persona's eyes.

## How to drive the app
Write a .mjs script (e.g. audit_<persona>.mjs) in this directory using this exact boilerplate:
```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();            // add {viewport:{width:390,height:800}} for phone persona
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');
await p.waitForTimeout(900);
await p.evaluate(()=>{ state.screen='app'; state.children=[{name:'NAME',age:AGE,avatar:'bizzy',theme:'spellbound',coins:C,activeList:'default',avOwned:{},lists:{default:{xp:XP}},week:[..7 numbers..],streak:N}]; state.activeIdx=0; state.premium=true; render(); });
```
Navigate with page.evaluate: app.setNav('home'|'coach'|'explore'|'games'|'shop'|'progress'|'collection'), app.openQuest(), app.openVocab(), app.openTyping(), app.setNav('figurative'), app.setNav('concepts'), app.openFinder(), app.setNav('settings'), state.drawerOpen=true+render(). Take screenshots (p.screenshot) into ./audit_shots/ and READ them with your Read tool to actually look at the screens. Also read body innerText to check copy. Click real buttons via [data-act] selectors where possible. Check your persona's core journeys end to end (e.g. play one full game via app.* calls). Clean up your .mjs when done.

## What to report (return as your final message, tight bullets)
AS YOUR PERSONA:
1. TOP ISSUES — concrete problems (confusing, broken, overwhelming, boring, untrustworthy), each with severity high/med/low and WHERE.
2. IMPROVEMENTS — specific, small changes that would most help you.
3. CUT — things you'd remove (dead weight, noise, duplicated).
4. MERGE — things that should be one thing.
5. ADD — the one or two things you genuinely miss.
Be honest and opinionated; cite screens you actually looked at. 8-15 findings total, quality over quantity.
