# design-sync notes — Bizzing Bee
- Repo is a vanilla-JS, no-build app (spellbound-app/): no package.json, no dist, no Storybook, no React.
- Off-script layout production per skill escape hatch: the bundle wraps the app's OWN shipped code
  (tokens.css, fonts/, icons.js SB_ICON, cover-art.js SB_COVER/SB_GAME/SB_CHAPTER, app.js mascotSVG/evEmb/evoLadderHTML)
  as thin React adapters (createElement + dangerouslySetInnerHTML of the real generators). No visual reimplementation.
- Gates kept: package-validate.mjs must exit clean; every preview graded from real screenshots on the absolute rubric.
- ds-src/ds.css = spellbound-app/tokens.css + extracted sb-* card classes/keyframes from index.html <style>. Regenerate on re-sync when either source changes (tokens are NOT wired via tokensGlob/tokensPkg — no npm tokens package exists).

## Re-sync risks
- ds-src/ is a hand-authored adapter package (no npm build). Vendored copies inside it go stale when the app changes:
  ds-src/src/vendor/icons.js + cover-art.js (verbatim copies of spellbound-app/*), mascot.js (lines 14-55 of app.js),
  ds-src/ds.css (tokens.css + index.html sb-* classes/keyframes). Re-copy all four before a re-sync when the app's design changed.
- Converter invocation: node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules .ds-sync/node_modules --entry ./ds-src/src/index.js --out ./ds-bundle
  (deps live in .ds-sync/node_modules: esbuild, ts-morph, @types/react, react, react-dom; playwright symlinked from /opt/node22 global, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers).
- WorldCover card keys are the app's composition keys: quest/concepts/journeys/arcade/themes/traps (NOT trophy/bricks/...).
- tokens ship inside cssEntry (ds.css) because copyTokens requires an npm tokens package.
- Known render warns: none.
