// Iconography QC — enforces the design system's "zero emoji in chrome" rule.
// Flags emoji used as ICONS: inside sized icon-holder spans (place-items:center or
// an explicit font-size on the glyph) — i.e. where SB_ICON()/iconSVG() should be used.
// Content emoji in copy/toasts and big celebration flourishes are NOT flagged.
import { readFileSync } from 'fs';
const FILES = ['app3.js', 'app2.js', 'quest.js', 'trivia.js', 'advanced.js'];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/u;
// an emoji is "chrome" (an icon substitute) when it sits in an icon holder:
//   ...place-items:center...>EMOJI<   OR   font-size:NNpx">EMOJI<   (NN 14-40, icon-sized)
const CHROME_PATTERNS = [
  /place-items:\s*center[^>]*>\s*(\$\{[^}]*\}\s*)?([\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}])/u,
  /font-size:\s*(1[4-9]|2[0-9]|3[0-9]|40)px[^>]*>\s*([\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}])/u,
];
// lines that are clearly data/copy, not chrome — skip
// content/feedback glyphs (not chrome icons): inline check/cross marks, animated celebration,
// toast/label copy, and big decorative celebration sizes.
const SKIP = /flash\(|state\.toast|\.replace\(|const themed=|label:'|title:'|scheduleToast|caption|animation:sb-|[✓✗✔✖✅❌🎉🎊🎈🥳⭐️]|font-size:(3[6-9]|4[0-9]|5[0-9])px/;

const findings = [];
for (const f of FILES) {
  let src; try { src = readFileSync(f, 'utf8'); } catch (e) { continue; }
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (!EMOJI.test(line)) return;
    if (SKIP.test(line)) return;
    for (const pat of CHROME_PATTERNS) {
      const m = line.match(pat);
      if (m) { const emoji = m[2] || m[1];
        findings.push({ file: f, line: i + 1, emoji, ctx: line.trim().slice(0, 110) });
        break; }
    }
  });
}
console.log('=== ICONOGRAPHY QC — emoji used as chrome icons ===');
if (!findings.length) console.log('✓ PASS — no emoji in icon-holder chrome (design-system compliant)');
else { console.log('✗ ' + findings.length + ' emoji-as-icon violation(s):');
  findings.forEach(f => console.log(`  ${f.file}:${f.line}  "${f.emoji}"  ${f.ctx}`)); }
process.exit(findings.length ? 1 : 0);
