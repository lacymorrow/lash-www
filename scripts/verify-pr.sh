#!/usr/bin/env bash
# Publish a local verification run as a real check on the PR.
#
# Why this exists
#   Actions billing is a permanent WONTFIX on this account (LAC-2960, closed
#   `done` 2026-10-15: no paid GitHub billing, ever). On a private repo that
#   means every Actions job refuses to start in ~3s with steps=0, so every PR
#   is red regardless of the code. LAC-4925 picked the free route: run the
#   checks here, then publish the result to the PR head SHA through the GitHub
#   commit Statuses API, which costs no Actions minutes and needs no runner.
#
# What a green `local-verify` means, exactly
#   The checks named in the PR comment passed on someone's machine, against
#   this exact commit, with a clean tree. That is all.
#
#   It is self-reported. Anyone with push access can post one by hand, and
#   fork PRs cannot post one at all (no token), which is the correct outcome
#   rather than a hole. This repo also has no branch protection: on a free
#   plan both /branches/main/protection and /rulesets return 403 "Upgrade to
#   GitHub Pro", so no check here can be *required* under any route. This is
#   an honest signal, not an enforcement gate. Do not read it as one.
#
# Usage
#   bun run verify:pr                     # full run (build + route smoke)
#   bun run verify:pr --no-build          # faster; the status says so
#   bun run verify:pr --allow-dirty       # annotates the status as unclean
#   ...plus any other scripts/verify.sh flag (--routes, --port, --no-smoke)
set -u

CONTEXT="local-verify"
MARKER="<!-- local-verify -->"
# Harness-local config that is present in every agent checkout and cannot
# affect a build. Anything else dirty is a refusal.
DIRT_ALLOW='^\.claude/'

ALLOW_DIRTY=0
VERIFY_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --allow-dirty) ALLOW_DIRTY=1 ;;
    *) VERIFY_ARGS+=("$arg") ;;
  esac
done

die() {
  echo "verify-pr: $1" >&2
  exit 2
}

command -v gh > /dev/null 2>&1 || die "gh is required (brew install gh)"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2> /dev/null)" || die "not a GitHub repo"
SHA="$(git rev-parse HEAD)"

# Guard 1: the tree being tested must match the commit the status names.
# Without this the status certifies code that was never committed.
DIRTY="$(git diff HEAD --name-only | grep -Ev "$DIRT_ALLOW" || true)"
DIRTY_NOTE=""
if [ -n "$DIRTY" ]; then
  if [ "$ALLOW_DIRTY" = 0 ]; then
    echo "verify-pr: working tree differs from HEAD, so a status on $(git rev-parse --short HEAD) would not describe what ran:" >&2
    printf '%s\n' "$DIRTY" | while IFS= read -r f; do echo "  $f" >&2; done
    die "commit or stash these, or pass --allow-dirty to publish anyway (the status will say it was unclean)"
  fi
  DIRTY_NOTE=" [dirty tree]"
fi

# Guard 2: the status must land on the PR's head, not a local-only commit.
PR_JSON="$(gh pr view --json number,headRefOid,url 2> /dev/null)" || die "no open PR for this branch; push and open one first"
PR_NUM="$(printf '%s' "$PR_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["number"])')"
PR_HEAD="$(printf '%s' "$PR_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["headRefOid"])')"
[ "$PR_HEAD" = "$SHA" ] || die "local HEAD ($(git rev-parse --short HEAD)) is not PR #$PR_NUM head (${PR_HEAD:0:7}); push first"

post_status() {
  local state="$1" desc="$2" url="${3:-}"
  # Statuses API caps description at 140 chars.
  desc="$(printf '%s' "$desc" | cut -c1-138)"
  gh api -X POST "repos/$REPO/statuses/$SHA" \
    -f state="$state" -f context="$CONTEXT" -f description="$desc" \
    ${url:+-f target_url="$url"} > /dev/null 2>&1 \
    || echo "verify-pr: warning, could not post '$state' status" >&2
}

echo "verify-pr: $REPO PR #$PR_NUM @ $(git rev-parse --short HEAD)"

# A `pending` status that never resolves is worse than a red one: it reads as
# "still running" forever and no amount of waiting fixes it. This run can die
# between the pending post and the final post for reasons that have nothing to
# do with the code (session teardown, Ctrl-C, OOM on a long build), and that
# happened on the first real use of this script. So always land a terminal
# state on the way out.
FINALIZED=0
on_exit() {
  if [ "$FINALIZED" = 0 ]; then
    post_status error "Interrupted before finishing. Re-run \`bun run verify:pr\`; this is not a verdict on the code."
  fi
  rm -f "${LOG:-}" 2> /dev/null || true
}
trap on_exit EXIT INT TERM

post_status pending "Local verification running..."

# Not `mktemp -t`, which lands in $TMPDIR. Under an agent harness that is a
# per-run scratch dir cleaned when the run ends, and this log has to survive a
# build that outlives its parent run; losing it mid-flight would blank the
# summary posted to the PR. Same reasoning as VERIFY_LOG_BASE in verify.sh.
LOG="$(mktemp "${VERIFY_LOG_BASE:-/tmp}/verify-pr-XXXXXX")"
# `set -e` is deliberately never enabled here: a failing verify.sh is an
# expected outcome that still has to publish a red status and a comment.
bash "$(dirname "$0")/verify.sh" ${VERIFY_ARGS+"${VERIFY_ARGS[@]}"} 2>&1 | tee "$LOG"
# tee is last in the pipe, so read verify.sh's own code, not tee's.
CODE=${PIPESTATUS[0]}

# The summary table starts at verify.sh's "## Local verification" heading;
# everything before it is raw command output and does not belong in the PR.
SUMMARY="$(sed -n '/^## Local verification/,$p' "$LOG")"
[ -n "$SUMMARY" ] || SUMMARY="$(tail -40 "$LOG")"

if [ "$CODE" = 0 ]; then
  VERDICT="passed"
else
  VERDICT="FAILED"
fi

BODY="$(
  cat << EOF
$MARKER
### Local verification: $VERDICT$DIRTY_NOTE

Posted by \`bun run verify:pr\` on \`$SHA\`, published as the \`$CONTEXT\` commit status.

$SUMMARY

<sub>Self-reported from a developer machine, not an independent runner. Every GitHub Actions job on
this repo is gated off because Actions billing is a permanent WONTFIX (LAC-4925), and this repo has
no branch protection on a free plan, so this check is advisory under any route. Re-run after every
push: a status is bound to one commit.</sub>
EOF
)"

# Upsert, so a re-run replaces its own comment instead of stacking.
#
# `--paginate` applies `-q` to each page separately rather than to the
# concatenated result, so an aggregating filter like `[...] | .[0]` emits one
# line *per page* and $EXISTING becomes multi-line once a PR passes 30
# comments, which then corrupts the PATCH URL. Emit bare matching ids and take
# the first with `head -1` instead of aggregating in jq.
EXISTING="$(gh api "repos/$REPO/issues/$PR_NUM/comments" --paginate \
  -q ".[] | select(.body | contains(\"$MARKER\")) | .id" 2> /dev/null | head -1 || true)"
if [ -n "${EXISTING:-}" ] && [ "$EXISTING" != "null" ]; then
  COMMENT_URL="$(gh api -X PATCH "repos/$REPO/issues/comments/$EXISTING" -f body="$BODY" -q .html_url)"
else
  COMMENT_URL="$(gh api -X POST "repos/$REPO/issues/$PR_NUM/comments" -f body="$BODY" -q .html_url)"
fi

# Name what ran in the status itself, so the check is readable without opening
# the comment. A bare "passed" invites reading it as more than it is, and a
# green check that quietly skipped the build is the main way that happens, so
# the skips ride along in the description too.
RAN="$(printf '%s' "$SUMMARY" | sed -n 's/^| \([a-z].*\) | pass |.*/\1/p' | paste -sd, - | cut -c1-70)"
SKIPNOTE="$(printf '%s' "$SUMMARY" | sed -n '/^Skipped on this run:/,/^$/p' \
  | sed -n 's/^- //p' | sed 's/ (.*//' | paste -sd, - | cut -c1-40)"
[ -n "$SKIPNOTE" ] && SKIPNOTE=" | skipped: $SKIPNOTE"

if [ "$CODE" = 0 ]; then
  post_status success "Passed locally$DIRTY_NOTE: ${RAN:-see comment}$SKIPNOTE" "$COMMENT_URL"
  echo "verify-pr: green '$CONTEXT' on PR #$PR_NUM"
elif [ "$CODE" = 3 ]; then
  # verify.sh reserves exit 3 for "one or more steps never ran". That is
  # infrastructure trouble, not a verdict, so it must not look like a red
  # review: a `failure` here is indistinguishable from a real one and sends the
  # next reader hunting for a defect that was never demonstrated.
  post_status error "Incomplete: some checks never ran, see the PR comment. Not a verdict on the code; re-run." "$COMMENT_URL"
  echo "verify-pr: '$CONTEXT' = error (incomplete, steps never ran) on PR #$PR_NUM"
elif [ "$CODE" -gt 128 ]; then
  # A signal killed verify.sh (143=SIGTERM, 130=SIGINT). Reporting that as
  # `failure` sends the next reader hunting for a code defect that is not
  # there, so call it what it is.
  post_status error "Interrupted by signal $((CODE - 128)) before finishing. Re-run; this is not a verdict on the code." "$COMMENT_URL"
  echo "verify-pr: '$CONTEXT' = error (killed by signal $((CODE - 128))) on PR #$PR_NUM"
else
  post_status failure "Failed locally$DIRTY_NOTE, see the PR comment" "$COMMENT_URL"
  echo "verify-pr: red '$CONTEXT' on PR #$PR_NUM"
fi
# A real verdict is published, so the EXIT trap must not overwrite it.
FINALIZED=1

exit "$CODE"
