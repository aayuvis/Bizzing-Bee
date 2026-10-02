#!/usr/bin/env bash
# deploy-internal.sh — publish the current build to the INTERNAL site
#
#   Run from spellbound-app/ :   ./deploy-internal.sh
#
#   →  https://aayuvis.github.io/bizzing-bee-staging/
#
# THIS IS THE REVIEW TARGET. Production is live again.
#   www.bizzingbee.com was taken offline on 6 Sep 2026 at the owner's request and
#   RESTORED on 10 Sep; the gh-pages branch carries `CNAME=www.bizzingbee.com`
#   again, and the take-down build is still preserved on
#   `gh-pages-holdback-20260906`. So this script is no longer the only way out —
#   it is where work goes to be LOOKED at before the owner says to publish it.
#   Shipping to production is `./deploy-prod.sh`, and it is the owner's call:
#   never infer it from "the change is finished".
#
# WHY A SECOND REPO AND NOT A FOLDER
#   GitHub Pages serves ONE site per repository, so this needs its own repo. It is
#   deliberately the same platform as production: this project has already been
#   bitten by a Pages-specific silent failure (at 555MB the deploy job hit the
#   ten-minute timeout, push and build both reported success, and the site quietly
#   served the old commit for hours). Another host would never reproduce that.
#
# THE ONE THING THAT MUST NEVER BREAK — AND IT IS NOW INVERTED
#   This site is served from github.io, so it must carry NO CNAME AT ALL.
#   Two failure modes, and the guard below refuses both:
#     • a CNAME of www.bizzingbee.com here would silently STEAL the live domain
#       the moment production is restored (both deploys replace the branch);
#     • a CNAME of anything else — staging.bizzing.app, say — points this site at
#       a hostname with no DNS, and the github.io URL stops resolving to it.
#   The previous version of this script wrote staging.bizzing.app and would have
#   broken the internal link on its first run. No CNAME is the correct answer.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
STG="${STG_DIR:-/home/user/bizzing-bee-staging}"
REMOTE="https://github.com/aayuvis/bizzing-bee-staging.git"
URL="https://aayuvis.github.io/bizzing-bee-staging/"
PROD_DOMAIN="www.bizzingbee.com"

say(){ printf '\n\033[1m%s\033[0m\n' "$*"; }
die(){ printf '\n\033[31mABORT: %s\033[0m\n' "$*" >&2; exit 1; }

# ---------- 0. the build must be syntactically sound ----------
say "0. Syntax check"
for f in app3.js saga2.js voice-review.js voice-words.js voice-cdn.js \
         supabase-sync.js supabase-auth.js boot-lazy.js; do
  [ -f "$SRC/$f" ] || continue
  node -c "$SRC/$f" >/dev/null || die "$f does not parse"
  echo "   ok  $f"
done

# ---------- 0b. THE TEST GATE: npm run check ----------
# FIX-BEE N3. The guards that hold a promise to a parent — no default login, the grown-up
# PIN, no third-party requests, the first-load budget, offline after one visit, the a11y
# pass, the data lints — run BEFORE anything is copied, and a failure ends the deploy here.
# It is the same subset CI runs on every push (tests/lib/run.cjs, CHECK), so a red build
# never reaches a child just because nobody looked at CI. There is deliberately no switch
# to skip it.
say "0b. Tests (npm run check)"
cd "$SRC"
if [ ! -d node_modules/playwright ] || [ ! -d node_modules/esbuild ] || [ ! -d node_modules/axe-core ]; then
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund >/dev/null || die "npm ci failed — the test gate cannot run, so nothing is deployed"
fi
npm run -s check || die "npm run check FAILED — read tests/build/logs/. Nothing was copied or pushed."

# ---------- 1. the stamp must have moved ----------
# index.html is served no-store while every asset it points at caches forever on
# its ?v= stamp. Ship without bumping it and devices keep running the old JS.
say "1. Asset stamp"
STAMP="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$SRC/index.html" | head -1 | sed 's/.*?v=//;s/"//')"
[ -n "$STAMP" ] || die "could not read SB_ASSET_V from index.html"
echo "   stamp: $STAMP"
if [ -f "$STG/index.html" ]; then
  OLD="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$STG/index.html" | head -1 | sed 's/.*?v=//;s/"//' || true)"
  [ "$STAMP" != "$OLD" ] || echo "   NOTE: stamp unchanged from the last deploy ($OLD)"
fi
# Every ?v= in the document must agree — a partial sed leaves assets on two
# stamps and half the app keeps serving the build it already had.
DISTINCT="$(grep -oE '\?v=[0-9a-z]+' "$SRC/index.html" | sort -u | wc -l)"
[ "$DISTINCT" -eq 1 ] || die "index.html carries $DISTINCT different ?v= stamps; expected 1"

# ---------- 2. sync the working tree ----------
say "2. Sync $STG"
[ -d "$STG/.git" ] || die "no clone at $STG — run: git clone $REMOTE $STG"
cd "$STG"
git remote set-url origin "$REMOTE"
# Reset to FETCH_HEAD, not origin/gh-pages: a clone taken while the repo was
# still empty has no remote-tracking ref, so `origin/gh-pages` raises "unknown
# revision" and the || branch swallows it as "first deploy" — the tree is then
# NOT reset, and a deploy silently builds on whatever was lying around locally.
# FETCH_HEAD is always written by a successful fetch.
if git fetch origin gh-pages 2>/dev/null; then
  git reset --hard -q FETCH_HEAD
  echo "   reset to $(git rev-parse --short FETCH_HEAD)"
else
  echo "   (empty remote — first deploy)"
fi
git checkout -q -B gh-pages

# ---------- 3. copy the build ----------
# EXCLUDED, and each for a reason that has already cost something:
#   voice/w      128k word clips / 1.4GB — streamed from raw.githubusercontent by
#                voice-cdn.js. NOTE: voice/c*, voice/a* and voice/ann ARE bundled
#                and served same-origin; excluding all of voice/ (as the old
#                script did) silently kills 903 narration clips.
#   books        the site keeps 24 redirect stubs here; source holds the full
#                ~7MB volumes, which is the weight that moved them to their own
#                repo. Never copy them back.
#   backend.html the operator console. NEVER DEPLOYED, anywhere.
#   *.sh, tests, qa, voice/pipeline, *.md   tooling and internal notes.
say "3. Copy build"
tar -C "$SRC" \
    --exclude=./.git --exclude=./CNAME \
    --exclude=./voice/w --exclude=./voice/pipeline \
    --exclude=./books --exclude=./backend.html \
    --exclude='./*.sh' --exclude='./*.py' --exclude='./*.log' \
    --exclude=./tests --exclude=./qa --exclude=./pipeline \
    --exclude=./node_modules --exclude=./design-pack \
    --exclude=./package.json --exclude=./package-lock.json --exclude=./fixbee-notes \
    --exclude=./eponyms --exclude=./trivia-all.json \
    --exclude='./voice/tq*.mp3' --exclude=./voice/rebuild-queue.json \
    --exclude=./CLAUDE.md --exclude=./AUDIT_BRIEF.md \
    --exclude=./TESTING-PROTOCOL.md --exclude='./TESTING-FINDINGS-*.md' \
    --exclude=./READ-ME-FIRST.md --exclude=./DESIGN-SYSTEM-HANDOVER.md \
    --exclude=./UX-FEEDBACK-LOG.md --exclude=./TRAIL-CURRICULUM.md \
    --exclude=./_cut.txt \
    -cf - . | tar -C "$STG" -xf -

# Excluding a file from the copy does not remove one the branch already has, and
# every one of these was readable on the live site until this script existed —
# CLAUDE.md alone is 116KB of internal playbook on a public URL. Enforce it each
# deploy rather than trusting a one-off cleanup. ADVANCED-CONCEPTS.md and
# LICENSES-THIRD-PARTY.md stay: the app and privacy.html actually reference them.
rm -rf "$STG"/CLAUDE.md "$STG"/AUDIT_BRIEF.md "$STG"/TESTING-PROTOCOL.md \
       "$STG"/TESTING-FINDINGS-*.md "$STG"/READ-ME-FIRST.md \
       "$STG"/DESIGN-SYSTEM-HANDOVER.md "$STG"/UX-FEEDBACK-LOG.md \
       "$STG"/TRAIL-CURRICULUM.md "$STG"/_cut.txt "$STG"/supabase-schema.sql \
       "$STG"/pipeline "$STG"/eponyms "$STG"/trivia-all.json \
       "$STG"/champions-pack.py "$STG"/drops.log \
       "$STG"/voice/rebuild-queue.json
# voice/tq*.mp3: trivia narration. NOT in voice-cdn.js's LOCAL set, so on any
# hosted build every one of them is rewritten to the raw CDN and the bundled
# copy is never requested. Production never shipped them; 135 files of dead
# weight that a source-copy deploy pulls in unless told not to.
rm -f "$STG"/voice/tq*.mp3

echo "   files: $(find "$STG" -type f -not -path '*/.git/*' | wc -l)"

# ---------- 3b. minify the COPY (never the source) ----------
# FIX-BEE N2. The app stays no-build: the source is what a developer edits and opens from
# file://. Only this copy is minified (esbuild, whitespace + syntax + local names; top-level
# names survive because these are classic scripts). app3.js alone goes 382KB -> ~282KB on
# the wire — the difference between meeting the family's 400KB JavaScript budget and not.
say "3b. Minify the copy"
node "$SRC/tools/minify.cjs" "$STG" || die "minifying the deploy copy failed"

# ---------- 3c. test the tree you are about to push ----------
# The check above ran against the SOURCE. This runs its browser half again against THIS
# tree — minified, copied by exclusion — because the source always has every file and is
# never minified. The tests are put beside the tree for the run and removed after it.
say "3c. Browser check against the deploy tree"
rm -rf "$STG/tests"
if ! node "$SRC/tests/lib/run.cjs" --check --browser-only --root "$STG"; then
  rm -rf "$STG/tests"; die "the DEPLOY TREE fails the check (the source passed) — suspect the copy or the minifier. Nothing was pushed."
fi
rm -rf "$STG/tests"
[ ! -e "$STG/tests" ] || die "tests/ is still in the deploy tree"

# ---------- 4. the CNAME guard (inverted for this target) ----------
say "4. CNAME"
if [ -e "$STG/CNAME" ]; then
  GOT="$(cat "$STG/CNAME")"
  [ "$GOT" != "$PROD_DOMAIN" ] || die "CNAME is PRODUCTION — this push would steal the live domain"
  die "a CNAME appeared ('$GOT') — this site is served from github.io and must have none"
fi
echo "   none — correct; $URL is a github.io project page"

# ---------- 5. stamp match ----------
# The copied index.html must differ from the source by nothing at all. Bumping a
# stamp only on the deploy side leaves the branch behind and the next deploy
# reverts it; this catches that class of drift.
say "5. Stamp match"
diff -q "$SRC/index.html" "$STG/index.html" >/dev/null \
  && echo "   STAMP-MATCH OK" || die "index.html differs between source and deploy tree"

# ---------- 6. every asset the document asks for must exist ----------
# This is the check that would have caught the Sep 2026 partial deploy, where
# index.html declared a new stamp over three files nobody had copied. Cheap, and
# it fails loudly instead of degrading quietly.
say "6. Asset references"
MISS=0
while read -r r; do
  [ -z "$r" ] && continue
  case "$r" in http*|//*|data:*|\#*) continue;; esac
  [ -e "$STG/$r" ] || { echo "   MISSING: $r"; MISS=$((MISS+1)); }
done < <(cat "$STG/index.html" "$STG/boot-lazy.js" 2>/dev/null \
         | grep -oE "['\"][A-Za-z0-9._/-]+\.(js|css|json|html|woff2?|png|jpg|svg|mp3)" \
         | tr -d "'\"" | sort -u)
[ "$MISS" -eq 0 ] || die "$MISS referenced asset(s) missing from the deploy tree"
echo "   all referenced assets present"
# ART TREES SHIP WHOLE. The check above greps index.html and boot-lazy.js for literal
# paths, and `app-art/spines/<slug>.png` is BUILT in app3.js from a table, so it saw
# nothing when a stray `--exclude=./app-art/spines` dropped all 23 book spines out of
# the copy. They went on being referenced with loading="eager" and no onerror, so the
# Library's shelf shipped 23 broken images and nothing anywhere reported it. Count the
# trees instead of grepping for the names.
for d in app-art avatars; do
  [ -d "$SRC/$d" ] || continue
  A="$(find "$SRC/$d" -type f | wc -l)"; B="$(find "$STG/$d" -type f 2>/dev/null | wc -l)"
  [ "$B" -ge "$A" ] || die "$d: $B files in the deploy tree, $A in the source — the copy dropped $((A-B))"
  echo "   $d ships whole ($B files)"
done

# ---------- 7. size budget ----------
# GitHub's Pages job aborts at a ten-minute deploy timeout and the site then keeps
# serving the last good commit, with success reported everywhere. It happened at
# 555MB. Stay well under.
say "7. Size"
MB="$(du -sm --exclude=.git "$STG" | cut -f1)"
echo "   ${MB}MB"
[ "$MB" -lt 250 ] || die "site is ${MB}MB — over the ~250MB budget where Pages deploys start timing out silently"

# ---------- 8. ship ----------
say "8. Push"
cd "$STG"
git add -A
if git diff --cached --quiet; then echo "   nothing to deploy"; exit 0; fi
git -c user.email=noreply@anthropic.com -c user.name=Claude \
    commit -q -m "Deploy ($STAMP)

Built from Bizzing-Bee $(cd "$SRC" && git rev-parse --short HEAD) on $(cd "$SRC" && git rev-parse --abbrev-ref HEAD)."
for i in 1 2 3 4; do
  git push origin HEAD:gh-pages && break
  echo "   push failed, retrying in $((2**i))s"; sleep $((2**i))
done

say "Done → $URL"
echo "Check the Pages run's CONCLUSION before believing it shipped —"
echo "a timed-out deploy reports success everywhere and serves the old commit."
