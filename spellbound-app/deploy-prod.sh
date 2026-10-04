#!/usr/bin/env bash
# deploy-prod.sh — publish the current build to PRODUCTION
#
#   Run from spellbound-app/ :   ./deploy-prod.sh
#
#   →  https://www.bizzingbee.com/
#
# This is the live site children use. Read deploy-internal.sh first: everything
# there applies here, and the only differences are the target and the CNAME rule,
# which is INVERTED between the two and is the one thing that must never break.
#
#   internal   github.io project page  →  must carry NO CNAME at all
#   production www.bizzingbee.com      →  must carry EXACTLY that CNAME
#
# Both deploys write the whole tree, so getting this backwards is not a cosmetic
# error: a production deploy that loses its CNAME silently unsets the custom domain
# and the site falls back to github.io with nothing anywhere reporting it. That has
# happened. The guard below refuses to push unless the file says the production
# domain, and it refuses just as hard if the file is missing.
#
# WHY THE CNAME IS NOT COPIED FROM SOURCE
#   It is excluded from the copy and inherited from the branch, because the branch
#   is the authority: GitHub itself writes that file when the custom domain is set
#   in Settings. Copying a source copy over it would let a stale checkout quietly
#   change the live domain.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$SRC/.." && pwd)"
WT="${PRD_DIR:-/tmp/claude-0/-home-user/bf547e18-a309-543c-9718-24ecd59c6810/scratchpad/prod-deploy}"
DOMAIN="www.bizzingbee.com"

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

# ---------- 0b. THE DATA GATE (owner, 4 Oct 2026: "fast data-only gate") ----------
# On 3 Oct the owner removed the full test gate ("all changes will only pass through this chat");
# on 4 Oct, asked again after the v4 audit, chose a fast DATA gate instead. Every node test runs —
# the word data, the slur / Nazi / struck-word lists, trivia and library counts, the feed corpus,
# the data lints — about 30 seconds, and a failure ends the deploy here. The browser tests stay
# with the session that makes a change. A new node test joins this gate automatically.
say "0b. Data gate (node tests)"
cd "$SRC"
node tests/lib/run.cjs --node-only || die "the DATA GATE failed — read tests/build/logs/. Nothing was copied or pushed."
# the minifier (3b) needs esbuild
if [ ! -d node_modules/esbuild ]; then
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund >/dev/null || die "npm ci failed — the minifier cannot run, so nothing is deployed"
fi

# ---------- 1. the stamp ----------
say "1. Asset stamp"
STAMP="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$SRC/index.html" | head -1 | sed 's/.*?v=//;s/"//')"
[ -n "$STAMP" ] || die "could not read SB_ASSET_V from index.html"
echo "   stamp: $STAMP"
DISTINCT="$(grep -oE '\?v=[0-9a-z]+' "$SRC/index.html" | sort -u | wc -l)"
[ "$DISTINCT" -eq 1 ] || die "index.html carries $DISTINCT different ?v= stamps; expected 1"

# ---------- 2. a worktree on the live branch ----------
# Production lives in THIS repo, so a worktree beats a second clone: no 193MB copy
# and no chance of pushing from a stale one. Reset to what origin actually has —
# GitHub writes CNAME onto this branch from the Settings page, so the remote can be
# ahead of anything local in exactly the file that matters most.
say "2. Worktree on gh-pages"
cd "$REPO"
git fetch origin gh-pages
# Resolve the SHA HERE and carry it. FETCH_HEAD does not resolve inside a linked
# worktree — it lives in the main repo — so a `reset --hard FETCH_HEAD` run in the
# worktree dies with "ambiguous argument". Pinning the sha also means every step
# below is provably against the same commit even if something else fetches midway.
LIVE="$(git rev-parse FETCH_HEAD)"
git worktree add -f "$WT" "$LIVE" >/dev/null 2>&1 || true
[ -d "$WT/.git" ] || [ -f "$WT/.git" ] || die "could not make a worktree at $WT"
cd "$WT"
git reset --hard -q "$LIVE"
git clean -qfd
git switch -q -C prod-deploy
PREV="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' index.html 2>/dev/null | head -1 | sed 's/.*?v=//;s/"//' || true)"
echo "   live now: $(git rev-parse --short "$LIVE")  stamp ${PREV:-none}"
[ "$STAMP" != "$PREV" ] || echo "   NOTE: stamp unchanged from what is live ($PREV)"

# ---------- 3. copy the build ----------
# Identical exclusions to deploy-internal.sh — see the reasoning there. books/ is
# excluded and NOT deleted: the live branch keeps 24 redirect stubs there for the
# volumes that moved to their own repo, and source holds the full ~7MB originals.
say "3. Copy build"
tar -C "$SRC" \
    --exclude=./.git --exclude=./CNAME \
    --exclude=./voice/w --exclude=./voice/pipeline \
    --exclude=./books --exclude=./backend.html --exclude=./forge-review \
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
    -cf - . | tar -C "$WT" -xf -

rm -rf "$WT"/CLAUDE.md "$WT"/AUDIT_BRIEF.md "$WT"/TESTING-PROTOCOL.md \
       "$WT"/TESTING-FINDINGS-*.md "$WT"/READ-ME-FIRST.md \
       "$WT"/DESIGN-SYSTEM-HANDOVER.md "$WT"/UX-FEEDBACK-LOG.md \
       "$WT"/TRAIL-CURRICULUM.md "$WT"/_cut.txt "$WT"/supabase-schema.sql \
       "$WT"/pipeline "$WT"/eponyms "$WT"/trivia-all.json \
       "$WT"/champions-pack.py "$WT"/drops.log \
       "$WT"/voice/rebuild-queue.json
rm -f "$WT"/voice/tq*.mp3
echo "   files: $(find "$WT" -type f -not -path '*/.git/*' | wc -l)"

# ---------- 3b. minify the COPY (never the source) ----------
# FIX-BEE N2. The app stays no-build: the source is what a developer edits and opens from
# file://. Only this copy is minified (esbuild, whitespace + syntax + local names; top-level
# names survive because these are classic scripts). app3.js alone goes 382KB -> ~282KB on
# the wire — the difference between meeting the family's 400KB JavaScript budget and not.
say "3b. Minify the copy"
node "$SRC/tools/minify.cjs" "$WT" || die "minifying the deploy copy failed"

# ---------- 3c. tests/ never ships ----------
rm -rf "$WT/tests"
[ ! -e "$WT/tests" ] || die "tests/ is still in the deploy tree"

# ---------- 4. THE CNAME GUARD ----------
say "4. CNAME"
[ -e "$WT/CNAME" ] || die "CNAME is MISSING — pushing this would unset the custom domain and drop the site to github.io with no error anywhere"
GOT="$(head -1 "$WT/CNAME")"
[ "$GOT" = "$DOMAIN" ] || die "CNAME says '$GOT', expected '$DOMAIN'"
echo "   $GOT"
[ -f "$WT/.nojekyll" ] || die ".nojekyll missing — Pages would skip every underscore path"
echo "   .nojekyll present"

# ---------- 5. stamp match ----------
say "5. Stamp match"
diff -q "$SRC/index.html" "$WT/index.html" >/dev/null \
  && echo "   STAMP-MATCH OK" || die "index.html differs between source and deploy tree"

# ---------- 6. every asset the document asks for must exist ----------
say "6. Asset references"
MISS=0
while read -r r; do
  [ -z "$r" ] && continue
  case "$r" in http*|//*|data:*|\#*) continue;; esac
  [ -e "$WT/$r" ] || { echo "   MISSING: $r"; MISS=$((MISS+1)); }
done < <(cat "$WT/index.html" "$WT/boot-lazy.js" 2>/dev/null \
         | grep -oE "['\"][A-Za-z0-9._/-]+\.(js|css|json|html|woff2?|png|jpg|svg|mp3)" \
         | tr -d "'\"" | sort -u)
[ "$MISS" -eq 0 ] || die "$MISS referenced asset(s) missing from the deploy tree"
echo "   all referenced assets present"
# the books redirect stubs must survive — they are the only copy, and old links land there
STUBS="$(ls "$WT"/books/*.html 2>/dev/null | wc -l)"
[ "$STUBS" -ge 20 ] || die "only $STUBS book redirect stubs on the branch, expected 24 — the copy has eaten them"
echo "   $STUBS book redirect stubs intact"
# ART TREES SHIP WHOLE. The check above greps index.html and boot-lazy.js for literal
# paths, and `app-art/spines/<slug>.png` is BUILT in app3.js from a table, so it saw
# nothing when a stray `--exclude=./app-art/spines` dropped all 23 book spines out of
# the copy. They went on being referenced with loading="eager" and no onerror, so the
# Library's shelf shipped 23 broken images and nothing anywhere reported it. Count the
# trees instead of grepping for the names.
for d in app-art avatars; do
  [ -d "$SRC/$d" ] || continue
  A="$(find "$SRC/$d" -type f | wc -l)"; B="$(find "$WT/$d" -type f 2>/dev/null | wc -l)"
  [ "$B" -ge "$A" ] || die "$d: $B files in the deploy tree, $A in the source — the copy dropped $((A-B))"
  echo "   $d ships whole ($B files)"
done

# ---------- 7. size budget ----------
say "7. Size"
MB="$(du -sm --exclude=.git "$WT" | cut -f1)"
echo "   ${MB}MB"
[ "$MB" -lt 250 ] || die "site is ${MB}MB — over the ~250MB budget where Pages deploys start timing out silently"

# ---------- 8. ship ----------
say "8. Push"
cd "$WT"
git add -A
if git diff --cached --quiet; then echo "   nothing to deploy"; exit 0; fi
git -c user.email=noreply@anthropic.com -c user.name=Claude \
    commit -q -m "Deploy ($STAMP)

Built from Bizzing-Bee $(cd "$SRC" && git rev-parse --short HEAD) on $(cd "$SRC" && git rev-parse --abbrev-ref HEAD)."
for i in 1 2 3 4; do
  git push origin HEAD:gh-pages && break
  echo "   push failed, retrying in $((2**i))s"; sleep $((2**i))
done

say "Done → https://$DOMAIN/"
echo "CHECK THE PAGES RUN'S CONCLUSION before believing it shipped — a deploy that"
echo "times out reports success everywhere and goes on serving the old commit."
