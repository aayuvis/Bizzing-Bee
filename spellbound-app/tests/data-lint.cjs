/* DATA LINT — the facts the app prints must not contradict themselves (FIX-BEE D7, Oct 2026).

   Node only, no browser: it reads the shipped data files the way the app does.
   1. A word's "often misspelled" form is never the word. 97 boot-shard words (4,845 across the
      library) printed 'Often misspelled "army"' under "army". app3's realMiss() also refuses it.
   2. No quotation is credited to a whole people — "Native American proverb", "African proverb",
      a tribe's "proverb" — or to Chief Seattle, unless it carries a `src`. Those are the classic
      misattribution genres: "the rain falls on the just and the unjust" is Matthew 5:45, and the
      Seattle lines are generally traced to a 1971 screenplay, not to Seattle. 124 were removed.
   3. Quotes need a source. None of the library's ~5,000 had one, and sourcing them honestly is
      research, not a find-and-replace — so this is a RATCHET: the count of unsourced quotes may
      only fall. Add a `src` or remove a quote and lower UNSOURCED_MAX in the same commit.
   4. No trivia question asks about a saying credited to a whole people.
   Run: node tests/data-lint.cjs                                                              */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
const run = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const norm = s => String(s).trim().toLowerCase();

/* ---- 1. m ≠ w ---- */
['words-data.js', 'words-data-2.js', 'words-hard.js', 'words-full.js'].forEach(run);
const parse = v => typeof v === 'string' ? JSON.parse(v) : v || [];
const pools = { 'served corpus (words-data + -2)': ctx.SB_DATA.nsf, 'library (words-full)': parse(ctx.SB_FULL), 'championship shard (words-hard)': parse(ctx.SB_HARD) };
for (const [name, arr] of Object.entries(pools)) {
  const self = arr.filter(w => w && w.m != null && norm(w.m) === norm(w.w));
  ok(arr.length > 1000 && self.length === 0, `${name}: no word is "often misspelled" as itself — ${self.length} of ${arr.length}` + (self.length ? ' e.g. ' + self.slice(0, 5).map(w => w.w).join(', ') : '')); }
const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const shows = (app3.match(/Often misspelled “/g) || []).length, guarded = (app3.match(/\$\{realMiss\(w\)\?[^]*?Often misspelled “/g) || []).length;
ok(shows >= 2 && shows === guarded, `every "Often misspelled" line on screen goes through realMiss() (${guarded} of ${shows})`);

/* ---- 2 & 3. quotations ---- */
run('quotes.js'); run('quotes-lib.js');
const Q = ctx.SB_QUOTES;
const GROUP = /\b(native american|indigenous|first nations|cherokee|hopi|arapaho|sioux|lakota|dakota|cheyenne|apache|tuscarora|shenandoah|kiowa|pueblo|inuit|navajo|ojibwe|cree|blackfoot|mohawk|iroquois|aboriginal)\b|^(african|latin american|middle eastern|bantu) (proverb|saying)/i;
const groupBad = q => !q.src && (GROUP.test(q.a || '') || (GROUP.test(q.who || '') && /proverb|saying|wisdom/i.test((q.a || '') + ' ' + (q.who || ''))) || /^chief seattle$/i.test(q.a || ''));
const gb = Q.filter(groupBad);
ok(Q.length > 4000 && gb.length === 0, `no quotation is credited to a whole people or to "Chief Seattle" without a source — ${gb.length}` + (gb.length ? ': ' + gb.slice(0, 4).map(q => `${q.a} — "${q.q.slice(0, 40)}…"`).join('; ') : ''));
const srcBad = Q.filter(q => q.src != null && !(typeof q.src === 'string' && q.src.trim().length > 8));
ok(srcBad.length === 0, `every src that is given is a real citation, not a placeholder (${srcBad.length} bad)`);
const UNSOURCED_MAX = 5189;   // the ratchet: lower it, never raise it
const unsourced = Q.filter(q => !q.src).length;
ok(unsourced <= UNSOURCED_MAX, `unsourced quotations may only fall — ${unsourced} (ceiling ${UNSOURCED_MAX})`);
if (unsourced < UNSOURCED_MAX - 25) console.log(`  NOTE unsourced is ${unsourced}: lower UNSOURCED_MAX to lock in the gain`);

/* ---- 4. trivia ---- */
const items = []; ctx.SB_TRIVIA = { _add: (lv, a) => a.forEach(x => items.push(x)) };
for (let i = 1; i <= 5; i++) run('trivia-q' + i + '.js');
const CITE = /\b(native american|chief seattle|cherokee|hopi|lakota|sioux|apache|dakota|cheyenne|arapaho|indigenous|aboriginal)\b|\b(african|latin american|middle eastern) proverb/i;
const tb = items.filter(x => x.th === 'quotes' && CITE.test(x.q + ' ' + x.c.join(' ') + ' ' + x.f));
ok(items.length > 30000 && tb.length === 0, `no trivia question asks about a saying credited to a whole people — ${tb.length}` + (tb.length ? ': ' + tb.map(x => x.id).join(' ') : ''));
/* the index the app reads must agree with the shards it describes */
run('trivia-data.js');
const by = {}; items.forEach(x => { by[x.lv] = (by[x.lv] || 0) + 1; });
const idx = ctx.SB_TRIVIA.byLevel || {};
ok([1, 2, 3, 4, 5].every(l => idx[l] === by[l]), `trivia-data.js byLevel matches the shards — ${JSON.stringify(idx)} vs ${JSON.stringify(by)}`);

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
