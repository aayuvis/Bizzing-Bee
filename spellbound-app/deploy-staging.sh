#!/usr/bin/env bash
# deploy-staging.sh — REPLACED. Do not use. See deploy-internal.sh.
#
# This script deployed to staging.bizzing.app. That domain has no DNS, and the
# internal site is now served from github.io, so running this would have done
# two damaging things on its first run:
#
#   • written CNAME=staging.bizzing.app, pointing the site at a hostname that
#     does not resolve — the internal URL would simply stop working;
#   • rsync'd with --delete while excluding ALL of voice/, wiping the 903
#     bundled narration clips (voice/c*, voice/a*, voice/ann) that voice-cdn.js
#     deliberately serves same-origin. Only voice/w is streamed.
#
# The replacement targets https://aayuvis.github.io/bizzing-bee-staging/ ,
# carries NO CNAME by design, and asserts both facts before it pushes.
echo "deploy-staging.sh is retired — use ./deploy-internal.sh" >&2
exit 1
