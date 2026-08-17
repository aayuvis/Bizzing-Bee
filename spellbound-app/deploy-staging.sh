#!/usr/bin/env bash
# deploy-staging.sh — publish the current build to staging.bizzing.app
#
#   Run from spellbound-app/ :   ./deploy-staging.sh
#
# WHY A SECOND REPO AND NOT A FOLDER
#   GitHub Pages serves ONE site per repository, so a staging site needs its own
#   repo. It is deliberately the same platform as production: this project has
#   already been bitten by a Pages-specific silent failure (at 555MB the deploy
#   job hit the ten-minute timeout, push and build both reported success, and the
#   site quietly served the old commit for hours). A staging site on a different
#   host would never reproduce that.
#
# THE ONE THING THAT MUST NEVER BREAK
#   Staging writes CNAME=staging.bizzing.app. Production writes
#   CNAME=www.bizzingbee.com. Both deploys REPLACE the whole branch, so a staging
#   push carrying production's CNAME would silently steal the live domain. The
#   guard below refuses to push if the CNAME is not the staging one — it is the
#   only check here that can cause real damage if it is removed.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
STG="${STG_DIR:-/home/user/bizzing-bee-staging}"
REMOTE="https://github.com/aayuvis/bizzing-bee-staging.git"
DOMAIN="staging.bizzing.app"
PROD_DOMAIN="www.bizzingbee.com"

say(){ printf '\n\033[1m%s\033[0m\n' "$*"; }
die(){ printf '\n\033[31mABORT: %s\033[0m\n' "$*" >&2; exit 1; }

# ---------- 0. the build must be syntactically sound ----------
say "0. Syntax check"
for f in app3.js saga2.js supabase-sync.js supabase-auth.js boot-lazy.js; do
  [ -f "$SRC/$f" ] || continue
  node -c "$SRC/$f" >/dev/null || die "$f does not parse"
  echo "   ok  $f"
done

# ---------- 1. the stamp must have moved ----------
# index.html is served no-store while every asset it points at caches forever on
# its ?v= stamp. Ship without bumping it and devices keep running the old JS.
say "1. Asset stamp"
STAMP="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$SRC/index.html" | head -1 | sed 's/.*?v=//;s/"//')"
[ -n "$STAMP" ] || die "could not read SB_ASSET_V from index.html"
echo "   stamp: $STAMP"
if [ -f "$STG/index.html" ]; then
  OLD="$(grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$STG/index.html" | head -1 | sed 's/.*?v=//;s/"//' || true)"
  [ "$STAMP" != "$OLD" ] || echo "   NOTE: stamp unchanged from the last staging deploy ($OLD)"
fi

# ---------- 2. sync the working tree ----------
say "2. Sync $STG"
[ -d "$STG/.git" ] || die "no clone at $STG — run: git clone $REMOTE $STG"
cd "$STG"
git remote set-url origin "$REMOTE"
git fetch origin gh-pages 2>/dev/null && git reset --hard origin/gh-pages || echo "   (empty remote — first deploy)"
git checkout -q -B gh-pages

# Everything production ships, minus voice/ (streamed from raw.githubusercontent
# by voice-cdn.js, which keys off SB_VOICE_BUNDLED rather than the hostname — so
# audio works on the staging domain with no change).
say "3. Copy build"
rsync -a --delete \
  --exclude '.git' --exclude 'voice/' --exclude 'books/art' \
  --exclude 'node_modules' --exclude '*.sh' --exclude 'CNAME' \
  "$SRC"/ "$STG"/
echo "   files: $(find "$STG" -type f -not -path '*/.git/*' | wc -l)"

# ---------- 4. the CNAME guard ----------
say "4. CNAME"
echo "$DOMAIN" > "$STG/CNAME"
GOT="$(cat "$STG/CNAME")"
[ "$GOT" = "$DOMAIN" ]      || die "CNAME is '$GOT', expected '$DOMAIN'"
[ "$GOT" != "$PROD_DOMAIN" ] || die "CNAME is PRODUCTION — this push would steal the live domain"
echo "   $GOT  (production is $PROD_DOMAIN — correctly different)"

# ---------- 5. stamp match ----------
# The copied index.html must differ from the source by nothing at all. Bumping a
# stamp only on the deploy side leaves the branch behind and the next deploy
# reverts it; this catches that class of drift.
say "5. Stamp match"
diff -q "$SRC/index.html" "$STG/index.html" >/dev/null \
  && echo "   STAMP-MATCH OK" || die "index.html differs between source and staging tree"

# ---------- 6. ship ----------
say "6. Push"
cd "$STG"
git add -A
if git diff --cached --quiet; then echo "   nothing to deploy"; exit 0; fi
git -c user.email=noreply@anthropic.com -c user.name=Claude \
    commit -q -m "Staging deploy ($STAMP)

Built from Bizzing-Bee $(cd "$SRC" && git rev-parse --short HEAD) on $(cd "$SRC" && git rev-parse --abbrev-ref HEAD)."
for i in 1 2 3 4; do
  git push -f origin HEAD:gh-pages && break
  echo "   push failed, retrying in $((2**i))s"; sleep $((2**i))
done

say "Done → https://$DOMAIN"
echo "If this is the first deploy, finish in the staging repo:"
echo "  Settings -> Pages: source gh-pages / root, custom domain $DOMAIN"
echo "  DNS at bizzing.app: CNAME  staging  ->  aayuvis.github.io"
echo "  (Pages on a PRIVATE repo needs a paid plan — make it public if on Free.)"
