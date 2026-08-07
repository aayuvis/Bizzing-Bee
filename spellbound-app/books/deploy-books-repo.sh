#!/usr/bin/env bash
# Build and publish the standalone books site to aayuvis/bizzing-bee-books.
#
# WHY A SECOND REPO
#   The app's Pages deploy has a practical ceiling around 250MB — past it the
#   "pages build and deployment" job hits its ten-minute timeout and ABORTS
#   SILENTLY, leaving the last good commit serving. That has already cost three
#   invisible builds. The books are 57MB of that budget and the app never links
#   to them (grep app*.js index.html trail.js for books/*.html — zero hits), so
#   they are the obvious thing to move.
#
# WHY THE GENERATOR STAYS PUT
#   mkbooks.js reads ten app data files (concepts-data, adv-concepts-data,
#   trail-data, avatars, sounds-data, quotes-lib, figurative-data, ...) plus the
#   word libraries and the trivia shards. Volumes 1-16 are GENERATED FROM app
#   data. Move the generator out and you need a submodule or a stale copy of
#   half the app. So: the source stays here, only the OUTPUT is published.
#
# WHY THE LAYOUT MIRRORS spellbound-app/
#   The generated HTML refers to ../fonts/*.woff2 and ../avatars/*.png. Keeping
#   books/ as a subdirectory with fonts/ and avatars/ as siblings means those
#   paths keep resolving and mkbooks.js needs no path rewriting — a rebuild
#   drops straight in. The cost is the URL depth, which the root redirect hides.
#
# USAGE   run from spellbound-app/:   bash books/deploy-books-repo.sh
# NOTE    the session must have aayuvis/bizzing-bee-books in its sources, or the
#         git proxy refuses to inject a credential (403, "not in this session's
#         authorized repository set"). Start the session with BOTH repos.
set -euo pipefail

SRC="$(pwd)"
R="${BKREPO_DIR:-/tmp/bkrepo}"
REMOTE="https://github.com/aayuvis/bizzing-bee-books.git"

[ -f "$SRC/books/mkbooks.js" ] || { echo "run this from spellbound-app/"; exit 1; }

SRC_BRANCH=$(git -C "$SRC" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
SRC_SHA=$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo '?')
echo "==> source: ${SRC_BRANCH}@${SRC_SHA}"

# The generator is the thing that carries the book's design. If the checkout
# predates a feature, the script still runs perfectly and publishes the OLD
# library — which is exactly what happened three times from a stale main. Assert
# on the generator itself rather than trusting the branch name.
MISSING=''
for f in sectionDivider indexPages; do
  grep -q "function $f" books/mkbooks.js || MISSING="$MISSING $f"
done
if [ -n "$MISSING" ]; then
  echo "!!  this checkout's mkbooks.js is missing:$MISSING" >&2
  echo "!!  you are about to publish an OLD build of the library." >&2
  echo "!!  fetch the branch that has them, or set BKSTALE=1 to publish anyway." >&2
  [ "${BKSTALE:-}" = "1" ] || exit 1
fi

echo "==> regenerating the books"
node books/mkbooks.js >/dev/null

echo "==> assembling $R"
rm -rf "$R"; mkdir -p "$R/books" "$R/fonts" "$R/avatars"
cp "$SRC"/books/*.html      "$R/books/"
cp -r "$SRC"/books/art      "$R/books/art"
cp "$SRC"/fonts/*.woff2     "$R/fonts/"

# only the avatars the books actually reference — all of them is 33MB, the
# books use about 19MB of it
grep -ohE "\.\./avatars/[A-Za-z0-9._-]+" "$R"/books/*.html \
  | sed 's|\.\./avatars/||' | sort -u > "$R/.used-avatars"
while read -r f; do
  [ -f "$SRC/avatars/$f" ] && cp "$SRC/avatars/$f" "$R/avatars/"
done < "$R/.used-avatars"
rm -f "$R/.used-avatars"

# Jekyll would chew through 368 art files for nothing and mangles _-prefixed paths
touch "$R/.nojekyll"

# the shelf lives at books/index.html; give the site root a clean way in
cat > "$R/index.html" <<'HTML'
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>The Bizzing Bee Library</title>
<meta http-equiv="refresh" content="0; url=books/">
<link rel="canonical" href="books/"></head>
<body><p>Opening the library — <a href="books/">the shelf is here</a>.</p></body></html>
HTML

echo "==> html $(ls "$R"/books/*.html | wc -l) · art $(ls "$R/books/art" | wc -l) · avatars $(ls "$R/avatars" | wc -l) · fonts $(ls "$R/fonts" | wc -l) · $(du -sh "$R" | cut -f1)"

# WHY THIS COMMITS ON TOP INSTEAD OF `git init` + `push -f`
#   The first version built a fresh repo every run and force-pushed unrelated
#   history over gh-pages. It worked, but it was the wrong shape for two reasons.
#
#   It cannot be rehearsed. `git push --dry-run` connects, authenticates and
#   computes the update CLIENT-side, then stops without sending a ref update —
#   so server-side rulesets and pre-receive hooks never fire. A dry run proves
#   the proxy injected a credential and the token has write scope. It cannot
#   tell you whether the server will accept a non-fast-forward, and if a ruleset
#   blocks force-pushes on gh-pages you find out only on the real push, after
#   the build.
#
#   And it threw the site's history away every deploy. The books site is the
#   deliverable; "what changed between two versions of the poems companion" is
#   worth being able to ask.
#
#   So: clone the branch shallow, replace the worktree wholesale, commit on top.
#   The push is then an ordinary fast-forward — nothing to force, nothing that
#   needs a rehearsal, and a rejection is real news rather than something -f
#   papers over. The snapshot semantics are unchanged: the worktree is emptied
#   before the new build is dropped in, so a deleted book really disappears.
#
#   BKFORCE=1 restores the old behaviour, for the one case that needs it —
#   deliberately resetting the branch's history.
echo "==> publishing"
P="$R.pub"
rm -rf "$P"
if [ "${BKFORCE:-}" != "1" ] && git clone --depth 1 -b gh-pages "$REMOTE" "$P" 2>/dev/null; then
  echo "    committing on top of $(cd "$P" && git rev-parse --short HEAD)"
  find "$P" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  cp -a "$R"/. "$P"/
  cd "$P"
  PUSH_ARGS="-u origin gh-pages"
else
  # first publish, or BKFORCE=1
  echo "    fresh branch (no gh-pages yet, or BKFORCE=1)"
  cd "$R"
  git init -q
  git branch -M gh-pages
  git remote add origin "$REMOTE"
  PUSH_ARGS="-f -u origin gh-pages"
fi

git add -A
if git diff --cached --quiet 2>/dev/null; then
  echo "==> nothing changed since the last publish; not pushing"
  exit 0
fi
NH=$(ls books/*.html | wc -l | tr -d ' ')
NA=$(ls books/art | wc -l | tr -d ' ')
# Stamp WHICH SOURCE COMMIT built this. The books site was published three times
# from a checkout of main that had none of the work — the script ran perfectly
# every time and republished the old library, and nothing in the result said so.
# With the source branch and sha in the message, `git log` on gh-pages shows at a
# glance whether a publish came from the tree you think it did.
git -c user.email="aayush.vishnoi@gmail.com" -c user.name="Bizzing Bee" \
    commit -q -m "The Bizzing Bee library — ${NH} volumes, ${NA} plates

Built from ${SRC_BRANCH}@${SRC_SHA} of aayuvis/Bizzing-Bee."
# shellcheck disable=SC2086
git push $PUSH_ARGS

cat <<'DONE'

Pushed. Now, once only, at
  https://github.com/aayuvis/bizzing-bee-books/settings/pages
set Source = "Deploy from a branch", Branch = gh-pages, folder = / (root).

The site is then https://aayuvis.github.io/bizzing-bee-books/
DONE
