/* Validate every out-<theme>.json and fold it into trivia-all.json.
   Run from spellbound-app/:  node <scratch>/tt/pipeline/sb-merge.js [--dry]
   Lives in pipeline/ with an sb- prefix because authoring agents write their own
   helper scripts into the scratchpad and a plain "merge.js" got clobbered once. */
const fs = require('fs'), path = require('path');
const S = path.join(path.dirname(__filename), '..');          // the tt/ dir holding out-*.json
const CANON = process.cwd() + '/trivia-all.json';
const T = JSON.parse(fs.readFileSync(CANON, 'utf8'));
const THEMES = T.themes.map(t => t.id);
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const seen = new Set(T.questions.map(q => norm(q.q)));
const banned = /which language (gave|did .* come|does .* come|is .* from)/i;
let nextId = Math.max(...T.questions.map(q => parseInt(String(q.id).slice(1)) || 0)) + 1;

const added = [], drops = { bad: 0, dup: 0, banned: 0, dupChoice: 0, noAnswer: 0 };
const dropLog = [], missing = [], parseFail = [];

for (const th of THEMES) {
  const f = S + '/out-' + th + '.json';
  if (!fs.existsSync(f)) { missing.push(th); continue; }
  let arr;
  try { arr = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { parseFail.push(th + ' (' + e.message.slice(0, 40) + ')'); continue; }
  if (!Array.isArray(arr)) { parseFail.push(th + ' (not an array)'); continue; }
  for (const q of arr) {
    const shapeOk = q && q.th === th && q.lv >= 1 && q.lv <= 5
      && (q.ty === 'mc' || q.ty === 'tf')
      && typeof q.q === 'string' && q.q.length > 4 && q.q.length <= 220
      && Array.isArray(q.c) && q.c.every(x => typeof x === 'string' && x.trim().length > 0)
      && (q.ty === 'mc' ? q.c.length === 4 : q.c.length === 2)
      && typeof q.f === 'string';
    if (!shapeOk) { drops.bad++; dropLog.push(['bad', th, (q && q.q) || '(malformed)']); continue; }
    if (banned.test(q.q)) { drops.banned++; dropLog.push(['banned', th, q.q]); continue; }
    // two identical options makes the question unanswerable
    if (new Set(q.c.map(x => norm(x))).size !== q.c.length) {
      drops.dupChoice++; dropLog.push(['dupChoice', th, q.q]); continue; }
    // true/false must keep the correct verdict first
    if (q.ty === 'tf' && !/^(true|false)$/i.test(q.c[0])) {
      drops.noAnswer++; dropLog.push(['tfOrder', th, q.q]); continue; }
    const n = norm(q.q);
    if (seen.has(n)) { drops.dup++; continue; }
    seen.add(n);
    // rebuilt field-by-field, so any stray keys an author added are dropped here
    added.push({ th: q.th, lv: q.lv, ty: q.ty, q: q.q, c: q.c, f: q.f, id: 't' + (nextId++) });
  }
}

if (missing.length) console.log('NOT YET WRITTEN (' + missing.length + '):', missing.join(' '));
if (parseFail.length) console.log('PARSE FAIL:', parseFail.join('; '));
console.log('added', added.length, 'drops', JSON.stringify(drops));

const all = T.questions.concat(added);
const matrix = {};
for (const q of all) { const k = q.th + ':' + (q.lv || 3); matrix[k] = (matrix[k] || 0) + 1; }
let lvTot = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
THEMES.forEach(t => {
  const row = [1, 2, 3, 4, 5].map(l => { const n = matrix[t + ':' + l] || 0; lvTot[l] += n; return String(n).padStart(5); });
  console.log(t.padEnd(9), row.join(''), '  =' + String([1, 2, 3, 4, 5].reduce((a, l) => a + (matrix[t + ':' + l] || 0), 0)).padStart(6));
});
console.log('TOTALS'.padEnd(9), [1, 2, 3, 4, 5].map(l => String(lvTot[l]).padStart(5)).join(''), '  =' + String(all.length).padStart(6));
if (dropLog.length) {
  fs.writeFileSync(S + '/drops.log', dropLog.map(d => d.join(' | ')).join('\n'));
  console.log('drop details -> tt/drops.log (' + dropLog.length + ')');
}
if (process.argv.includes('--dry')) { console.log('dry run — nothing written'); process.exit(0); }
const out = { themes: T.themes, questions: all, version: (T.version || 1) + 1 };
fs.writeFileSync(CANON, JSON.stringify(out));
console.log('WROTE trivia-all.json —', all.length, 'questions, version', out.version);
console.log('next: node <scratch>/tt/pipeline/sb-shard.js   (rebuilds trivia-data.js + trivia-q1..5.js)');
