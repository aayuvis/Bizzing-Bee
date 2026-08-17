#!/usr/bin/env bash
# deploy-staging.sh — publish a build to staging.bizzing.app
#
#   ./deploy-staging.sh --from-gh-pages     # deploy exactly what production serves
#   ./deploy-staging.sh --src DIR           # deploy a build tree (your gh-pages worktree)
#   ./deploy-staging.sh --dry-run           # do everything except the push
#
# WHY A SECOND REPO AND NOT A FOLDER
#   GitHub Pages serves ONE site per repository, so a staging site needs its own
#   repo. It is deliberately the same platform as production: this project has
#   already been bitten by a Pages-specific silent failure (at 555MB the deploy
#   job hit the ten-minute timeout, push and build both reported success, and the
#   site quietly served the old commit for hours). A staging site on a different
#   host would never reproduce that.
#
# WHAT "THE BUILD" IS — READ THIS BEFORE CHANGING $SRC
#   It is NOT spellbound-app/ on main. main stopped moving on 2026-07-23; every
#   change since has landed straight on the gh-pages branch, which is now 1592
#   files to spellbound-app's 47 and carries boot-lazy.js, supabase-*.js,
#   sb-config.js, books/ and avatars/ — none of which exist on main. main's
#   index.html has no SB_ASSET_V at all (it hardcodes ?v=20260723k), so a deploy
#   sourced from there cannot even read a stamp, and if it could it would publish
#   a three-week-old tree that is not this app. The build is the gh-pages tree.
#
# THE ONE THING THAT MUST NEVER BREAK
#   Staging writes CNAME=staging.bizzing.app. Production writes
#   CNAME=www.bizzingbee.com. Both deploys REPLACE the whole branch, so a staging
#   push carrying production's CNAME would silently steal the live domain. Two
#   guards below cover this and both can cause real damage if removed: CNAME is
#   excluded from the copy and rewritten from scratch, and the push refuses to
#   run unless origin is literally the staging repo.
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
STG="${STG_DIR:-/home/user/bizzing-bee-staging}"
REMOTE="https://github.com/aayuvis/bizzing-bee-staging.git"
DOMAIN="staging.bizzing.app"
PROD_DOMAIN="www.bizzingbee.com"
WORKTREE="$REPO/.staging-build"
SRC="${SRC_DIR:-}"
DRY=0

say(){ printf '\n\033[1m%s\033[0m\n' "$*"; }
warn(){ printf '\033[33m   WARN: %s\033[0m\n' "$*"; }
die(){ printf '\n\033[31mABORT: %s\033[0m\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --from-gh-pages) SRC="$WORKTREE"; FROM_GHP=1 ;;
    --src)           SRC="${2:-}"; shift ;;
    --dry-run)       DRY=1 ;;
    -h|--help)       sed -n '2,8p' "$0"; exit 0 ;;
    *)               die "unknown argument: $1" ;;
  esac
  shift
done

# ---------- 0. resolve the source tree ----------
say "0. Source"
if [ "${FROM_GHP:-0}" = 1 ]; then
  # A throwaway worktree pinned to origin/gh-pages: the highest-fidelity source
  # there is, because it is byte-for-byte what production is serving right now.
  git -C "$REPO" fetch origin gh-pages
  if [ -d "$WORKTREE" ]; then
    git -C "$WORKTREE" reset --hard origin/gh-pages >/dev/null
    git -C "$WORKTREE" clean -qfd
  else
    git -C "$REPO" worktree add -f --detach "$WORKTREE" origin/gh-pages >/dev/null
  fi
fi
[ -n "$SRC" ] || SRC="$(pwd)"
SRC="$(cd "$SRC" 2>/dev/null && pwd)" || die "source directory does not exist"

# The stamp is the cheapest positive proof that this is a real Pages build and
# not, say, spellbound-app/ on main — which would otherwise copy cleanly and
# publish a tree that is three weeks stale and missing half the app.
[ -f "$SRC/index.html" ] || die "no index.html in $SRC"
if ! grep -q 'SB_ASSET_V' "$SRC/index.html"; then
  die "$SRC/index.html has no SB_ASSET_V — this is not a Pages build of Bizzing Bee.
       main's spellbound-app/ is three weeks stale and is NOT the build; the build
       is the gh-pages tree. Use:  $0 --from-gh-pages
       or point --src at your own gh-pages worktree."
fi
echo "   src: $SRC"

# ---------- 1. the build must be syntactically sound ----------
say "1. Syntax check"
for f in app3.js saga2.js supabase-sync.js supabase-auth.js boot-lazy.js voice-cdn.js sb-config.js; do
  [ -f "$SRC/$f" ] || continue
  node -c "$SRC/$f" >/dev/null || die "$f does not parse"
  echo "   ok  $f"
done

# ---------- 2. the stamp must have moved ----------
# Every asset URL in index.html carries a ?v= stamp and is cached hard on it.
# Ship without bumping the stamp and devices keep running the old JS.
say "2. Asset stamp"
read_stamp(){ grep -o 'SB_ASSET_V="?v=[0-9a-z]*"' "$1" | head -1 | sed 's/.*?v=//;s/"//'; }
STAMP="$(read_stamp "$SRC/index.html")"
[ -n "$STAMP" ] || die "could not read SB_ASSET_V from index.html"
echo "   stamp: $STAMP"
if [ -f "$STG/index.html" ]; then
  OLD="$(read_stamp "$STG/index.html" || true)"
  [ "$STAMP" != "$OLD" ] || echo "   NOTE: stamp unchanged from the last staging deploy ($OLD)"
fi

# ---------- 3. sync the working tree ----------
say "3. Sync $STG"
[ -d "$STG/.git" ] || die "no clone at $STG — run: git clone $REMOTE $STG"
[ "$STG" != "$REPO" ] && [ "$STG" != "$SRC" ] || die "STG_DIR must not be the source repo ($STG)"
cd "$STG"
# Read origin BEFORE normalising it. This step replaces the working tree and
# force-pushes, so an STG_DIR aimed at the production clone would rewrite that
# clone's remote and wipe it. Checking first turns that into an abort instead of
# a silent conversion — and it is what makes the pre-push check in step 8 real
# rather than a test of a value this script just assigned.
CUR="$(git remote get-url origin 2>/dev/null || true)"
case "$CUR" in
  ''|*bizzing-bee-staging*) ;;
  *) die "$STG has origin '$CUR', which is not the staging clone —
       refusing to rewrite its remote and replace its working tree" ;;
esac
git remote set-url origin "$REMOTE"
git checkout -q -B gh-pages
if git fetch origin gh-pages 2>/dev/null; then
  git reset -q --hard FETCH_HEAD
else
  echo "   (no gh-pages on the remote — first deploy)"
fi

# ---------- 4. copy the build ----------
# Everything production ships, with two deliberate omissions and no others: .git
# (obviously) and CNAME (rewritten below — copying production's would hand this
# push the live domain).
#
# voice/ IS COPIED, and that matters. It is tempting to drop it as "the 1.4GB
# corpus", but the corpus is not here: gh-pages carries only 909 clips / 51MB —
# the concept and advanced-concept narration (voice/c*.mp3, voice/a*.mp3) and the
# mock-bee announcer (voice/ann/) — and voice-cdn.js has an explicit LOCAL regex
# that refuses to rewrite exactly those to raw.githubusercontent, because they
# are meant to be served same-origin. Exclude voice/ and they do not stream from
# anywhere; they 404, and the most-played audio in the app goes silent on staging
# only. The word clips are already remote for every hosted build: voice-cdn.js
# keys off SB_VOICE_BUNDLED and the protocol, not the hostname, so it installs
# the Audio wrapper on staging.bizzing.app exactly as it does on production.
say "4. Copy build"
find "$STG" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
tar -C "$SRC" -cf - \
    --exclude='./.git' --exclude='./CNAME' --exclude='./node_modules' \
    --exclude='./.staging-build' . | tar -C "$STG" -xf -
FILES="$(find "$STG" -type f -not -path '*/.git/*' | wc -l)"
BYTES="$(du -sm --exclude=.git "$STG" | cut -f1)"
echo "   files: $FILES   size: ${BYTES}MB"
[ -f "$STG/.nojekyll" ] || warn ".nojekyll is missing — Pages will run Jekyll over this tree"
[ "$BYTES" -lt 400 ] || warn "${BYTES}MB is approaching the size that timed out the Pages build before"

# ---------- 5. the CNAME guard ----------
say "5. CNAME"
echo "$DOMAIN" > "$STG/CNAME"
GOT="$(cat "$STG/CNAME")"
[ "$GOT" = "$DOMAIN" ]       || die "CNAME is '$GOT', expected '$DOMAIN'"
[ "$GOT" != "$PROD_DOMAIN" ] || die "CNAME is PRODUCTION — this push would steal the live domain"
echo "   $GOT  (production is $PROD_DOMAIN — correctly different)"

# ---------- 6. keep staging out of the index ----------
# Production ships robots "index,follow". Copied verbatim onto a public staging
# site that is otherwise a byte-identical clone, that invites Google to crawl a
# duplicate of the live site and to surface unreleased features. This is the only
# content edit the deploy makes, and step 7 enforces that.
say "6. De-index"
sed -i 's|<meta name="robots" content="[^"]*">|<meta name="robots" content="noindex,nofollow">|' "$STG/index.html"
printf 'User-agent: *\nDisallow: /\n' > "$STG/robots.txt"
grep -q 'noindex,nofollow' "$STG/index.html" || die "failed to rewrite the robots meta"
echo "   robots: noindex,nofollow + robots.txt disallow"

# ---------- 7. drift guard ----------
# The copied index.html must differ from the source by the robots line and
# nothing else. Bumping a stamp only on the deploy side leaves the branch behind
# and the next deploy reverts it; this catches that class of drift, and it also
# catches step 6 growing a second edit nobody reviewed.
say "7. Drift check"
NEW="$(read_stamp "$STG/index.html")"
[ "$NEW" = "$STAMP" ] || die "stamp drifted in the copy: source $STAMP, staging $NEW"
UNEXPECTED="$(diff "$SRC/index.html" "$STG/index.html" | grep -c '^[<>]' || true)"
[ "$UNEXPECTED" -le 2 ] || die "index.html differs from source by more than the robots line"
echo "   STAMP-MATCH OK ($STAMP), $UNEXPECTED expected line change(s)"

# ---------- 8. ship ----------
say "8. Push"
cd "$STG"
# The check that actually prevents domain theft: not what CNAME says, but which
# repo this force-push lands in. gh-pages here is replaced wholesale.
ORIGIN="$(git remote get-url origin)"
case "$ORIGIN" in
  *bizzing-bee-staging*) ;;
  *) die "origin is '$ORIGIN', not the staging repo — refusing to force-push" ;;
esac
git add -A
if git diff --cached --quiet; then echo "   nothing to deploy"; exit 0; fi
if [ "$DRY" = 1 ]; then
  say "Dry run — staged $(git diff --cached --numstat | wc -l) file(s), not pushing"
  exit 0
fi
git -c user.email=noreply@anthropic.com -c user.name=Claude \
    commit -q -m "Staging deploy ($STAMP)

Built from $(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo 'unknown') \
on $(git -C "$SRC" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'detached')."
PUSHED=0
for i in 1 2 3 4; do
  if git push -f origin HEAD:gh-pages; then PUSHED=1; break; fi
  [ "$i" = 4 ] && break
  echo "   push failed, retrying in $((2**i))s"; sleep $((2**i))
done
[ "$PUSHED" = 1 ] || die "push failed after 4 attempts — nothing was published"

say "Done → https://$DOMAIN"
echo "If this is the first deploy, finish in the staging repo:"
echo "  Settings -> Pages: source gh-pages / root, custom domain $DOMAIN"
echo "  DNS at bizzing.app: CNAME  staging  ->  aayuvis.github.io"
echo "  (Pages on a PRIVATE repo needs a paid plan — make it public if on Free.)"
