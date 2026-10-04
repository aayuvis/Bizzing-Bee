/* js-scan — just enough of a JavaScript reader for the source-text guards (games spec T5, T7).

   A grep cannot tell which FUNCTION a line belongs to, and these guards are about functions: "no game
   reads the corpus except through nextWords" (T7) and "no Math.random() in a reward, grade, power-up
   or encounter path" (T5). This walks the source once, skipping comments, strings, template literals
   (with their ${…} holes) and regex literals, matches every bracket, and names each function body
   it can: `function name(…){`, `name = function(…){`, `name: (…) => {`, `const name = x => {`, and
   method shorthand `name(…){`. Anonymous callbacks are reported as '(anon)' and inherit nothing —
   callers climb to the nearest named parent when they want one.
     scan(src) → { fns: [{name, open, close}], inComment(i) }   (offsets into src)
     enclosing(scanResult, i, named) → the innermost function around offset i (named: skip anon)
   No dependencies: CI has no parser installed, and this file is the whole of it.                 */
'use strict';
const KW = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'return', 'typeof', 'do', 'else', 'try', 'finally', 'new', 'in', 'of', 'case', 'void', 'delete', 'throw', 'await', 'yield']);
function scan(src) {
  const n = src.length, comments = [], parenOpen = new Map(), fns = [];
  const stack = [];                       // brackets: {ch, at, fn}
  let i = 0, lastSig = '', lastWord = '';
  const regexOK = () => !lastSig || /[(,=:[!&|?{};+\-*%<>~^]/.test(lastSig) || (lastSig === 'w' && KW.has(lastWord));
  const tmpl = [];                        // template literal nesting: the stack depth at each ${
  function readString(q) { i++; while (i < n && src[i] !== q) { if (src[i] === '\\') i++; i++; } i++; }
  function readTemplate() {   // i at ` or at the } closing a ${…} hole; returns at the closing ` or after a ${
    i++;
    while (i < n) { const ch = src[i];
      if (ch === '\\') { i += 2; continue; }
      if (ch === '`') { i++; return false; }
      if (ch === '$' && src[i + 1] === '{') { i += 2; return true; }
      i++; }
    return false; }
  function nameBefore(end) {
    const pre = src.slice(Math.max(0, end - 160), end);
    let m = pre.match(/function\s*\*?\s*([\w$]+)\s*$/); if (m) return m[1];
    if (/function\s*\*?\s*$/.test(pre)) { const p2 = pre.replace(/(?:async\s+)?function\s*\*?\s*$/, ''); m = p2.match(/([\w$.]+)\s*[:=]\s*$/); return m ? m[1].split('.').pop() : '(anon)'; }
    return null; }
  function fnName(openAt) {   // the text before a `{`: is this `{` a function body, and whose?
    let j = openAt - 1; while (j >= 0 && /\s/.test(src[j])) j--;
    if (src[j] === '>' && src[j - 1] === '=') {          // arrow
      let k = j - 2; while (k >= 0 && /\s/.test(src[k])) k--;
      let start;
      if (src[k] === ')') { start = parenOpen.get(k); if (start == null) return '(anon)'; }
      else { start = k; while (start > 0 && /[\w$]/.test(src[start - 1])) start--; }
      const pre = src.slice(Math.max(0, start - 120), start).replace(/async\s*$/, '');
      const m = pre.match(/([\w$.]+)\s*[:=]\s*$/); return m ? m[1].split('.').pop() : '(anon)'; }
    if (src[j] === ')') { const o = parenOpen.get(j); if (o == null) return null;
      const viaFn = nameBefore(o); if (viaFn) return viaFn;
      const pre = src.slice(Math.max(0, o - 80), o); const m = pre.match(/([\w$]+)\s*$/);
      if (m && !KW.has(m[1]) && !/[.\w$]\s*$/.test(pre.slice(0, pre.length - m[0].length).slice(-1) === '.' ? '.' : '')) {
        /* method shorthand `name(…){` — but not a call followed by a block, which JS does not allow anyway */
        const before = pre.slice(0, pre.length - m[0].length).trimEnd();
        if (!/[\w$)\]]$/.test(before) || /[,{;}]$/.test(before)) return m[1]; }
      return null; }
    return null; }
  while (i < n) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); comments.push([i, e < 0 ? n : e]); i = e < 0 ? n : e; continue; }
    if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); comments.push([i, e < 0 ? n : e + 2]); i = e < 0 ? n : e + 2; continue; }
    if (ch === "'" || ch === '"') { readString(ch); lastSig = 'v'; continue; }
    if (ch === '`') { if (readTemplate()) { tmpl.push(stack.length); stack.push({ ch: '${', at: i }); } lastSig = 'v'; continue; }
    if (ch === '/' && regexOK()) { i++; let cls = false; while (i < n && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; else if (src[i] === '\n') break; i++; } i++; while (/[a-z]/i.test(src[i] || '')) i++; lastSig = 'v'; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (/[\w$]/.test(ch)) { let e = i; while (e < n && /[\w$]/.test(src[e])) e++; lastWord = src.slice(i, e); lastSig = 'w'; i = e; continue; }
    if (ch === '(' || ch === '[') { stack.push({ ch, at: i }); lastSig = ch; i++; continue; }
    if (ch === '{') { const name = fnName(i); stack.push({ ch, at: i, fn: name }); lastSig = ch; i++; continue; }
    if (ch === ')' || ch === ']') { const top = stack.pop(); if (top && ch === ')') parenOpen.set(i, top.at); lastSig = ch === ')' ? ')' : ']'; i++; continue; }
    if (ch === '}') { const top = stack.pop();
      if (top && top.ch === '${') { i = i; tmpl.pop(); if (readTemplate()) { tmpl.push(stack.length); stack.push({ ch: '${', at: i }); } lastSig = 'v'; continue; }
      if (top && top.fn) fns.push({ name: top.fn, open: top.at, close: i });
      lastSig = '}'; i++; continue; }
    lastSig = ch; i++;
  }
  fns.sort((a, b) => a.open - b.open);
  const inComment = (k) => comments.some(([a, b]) => k >= a && k < b);
  return { fns, comments, inComment };
}
function enclosing(S, idx, named) {
  let best = null;
  for (const f of S.fns) { if (f.open > idx) break; if (idx < f.close && (!named || f.name !== '(anon)')) { if (!best || f.open >= best.open) best = f; } }
  return best;
}
/* every enclosing function, innermost first */
function chain(S, idx) { return S.fns.filter(f => f.open < idx && idx < f.close).sort((a, b) => b.open - a.open); }
module.exports = { scan, enclosing, chain };
