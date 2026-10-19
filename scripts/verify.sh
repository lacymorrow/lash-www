#!/usr/bin/env bash
# Local CI gate. Runs the same checks GitHub Actions would, on this machine,
# and prints a Markdown summary to paste into the PR body.
#
# Why: Actions billing is a permanent WONTFIX on this account, so every job
# that fires on a PR, push or schedule is gated off and this script is the
# gate (LAC-4925). Use `bun run verify:pr` to publish the result to the PR as
# the `local-verify` commit status; running this script bare only prints.
# See docs/development/ci-local-verify.mdx.
#
# Usage: scripts/verify.sh [--no-build] [--no-smoke] [--port 3040] [--routes "/ /blog /nope-404=404"]
#   Routes are space separated; "=CODE" sets the expected status (default 200).
set -u

PORT=3040
DO_BUILD=1
DO_SMOKE=1
ROUTES=""
while [ $# -gt 0 ]; do
  case "$1" in
    --no-build) DO_BUILD=0 ;;
    --no-smoke) DO_SMOKE=0 ;;
    --port) PORT="$2"; shift ;;
    --routes) ROUTES="$2"; shift ;;
    -h|--help) sed -n 2,13p "$0"; exit 0 ;;
  esac
  shift
done

# Everything below is cwd-sensitive: `has_script` reads ./package.json and the
# lockfile probe below picks the package manager from the current directory. Run
# from a subdirectory and every `has_script` returned false, so every real check
# was silently skipped and the script still printed "Result: PASS" with one row.
# That is the exact failure this gate exists to prevent, so pin to the repo root.
ROOT="$(git rev-parse --show-toplevel 2> /dev/null || true)"
if [ -n "$ROOT" ]; then
  cd "$ROOT" || exit 1
elif [ ! -f package.json ]; then
  echo "verify: not in a git repo and no package.json here; run this from the project root." >&2
  exit 2
fi

if [ -f bun.lock ] || [ -f bun.lockb ]; then PM="bun run"; elif [ -f pnpm-lock.yaml ]; then PM="pnpm"; else PM="npm run"; fi
has_script() { node -e "process.exit(require('./package.json').scripts?.['$1'] ? 0 : 1)"; }

# Per-run log directory. These used to be fixed /tmp/verify-<step>.log paths,
# which several agents and several repos on this machine wrote to at once, so a
# stale log from a run killed 30 minutes ago read exactly like a fresh one.
#
# Deliberately NOT $TMPDIR. Under an agent harness, TMPDIR is a per-run scratch
# directory that gets cleaned when that run ends, and a long verify outlives its
# parent run: the directory was deleted mid-flight, every later redirection
# failed, and 7 steps reported FAIL in 0s having never executed. Use a base that
# is not tied to a run's lifetime. Override with VERIFY_LOG_BASE if needed.
VERIFY_LOG_BASE="${VERIFY_LOG_BASE:-/tmp}"
new_logdir() { mktemp -d "$VERIFY_LOG_BASE/verify-logs-XXXXXX" 2> /dev/null || mktemp -d "/tmp/verify-logs-XXXXXX" 2> /dev/null; }
LOGDIR="$(new_logdir)"
# An empty LOGDIR passes `set -u` silently and would turn every log path into
# "/<step>.log", so check the value rather than trusting mktemp succeeded.
if [ -z "$LOGDIR" ] || [ ! -d "$LOGDIR" ]; then
  echo "verify: could not create a log directory under '$VERIFY_LOG_BASE' or /tmp." >&2
  echo "verify: refusing to run, because no step could record output. Not a verdict on the code." >&2
  exit 3
fi

# Exit 3 is reserved for "this script could not do its job": it means one or
# more steps never executed, which is infrastructure trouble and not a verdict
# on the code. verify-pr.sh maps it to an `error` commit status rather than
# `failure`, so nobody goes hunting for a defect that was never demonstrated.
INFRA_FAIL=0

RESULTS=()
SKIPPED=()
FAILED=0
RAN_COUNT=0
step() {
  local name="$1"; shift
  # Recreate the log dir if it vanished under us, then prove we can write before
  # running anything. A redirection that fails means the step never executed, so
  # reporting it as FAIL is a false red: it sends the next reader hunting for a
  # defect that does not exist. Infrastructure trouble is not a verdict.
  [ -d "$LOGDIR" ] || LOGDIR="$(new_logdir)"
  local log="$LOGDIR/${name//[^a-zA-Z0-9]/_}.log"
  if ! : > "$log" 2> /dev/null; then
    RESULTS+=("| $name | **NOT RUN** | 0s | cannot write a log to \`$LOGDIR\`, so this step never executed and this is not a verdict on it |")
    INFRA_FAIL=1
    return
  fi
  local start=$(date +%s)
  RAN_COUNT=$((RAN_COUNT + 1))
  if "$@" > "$log" 2>&1; then
    RESULTS+=("| $name | pass | $(( $(date +%s) - start ))s |")
  else
    local code=$?
    # >128 means a signal killed it (143=SIGTERM, 130=SIGINT). That is not a
    # verdict on the code, and reporting it as FAIL invites a pointless hunt.
    if [ "$code" -gt 128 ]; then
      RESULTS+=("| $name | **KILLED** (signal $((code - 128))) | $(( $(date +%s) - start ))s | see $log |")
    else
      RESULTS+=("| $name | **FAIL** | $(( $(date +%s) - start ))s | see $log |")
    fi
    FAILED=1
  fi
}

has_script typecheck && step "typecheck" $PM typecheck
has_script lint && step "lint" $PM lint
has_script test && step "unit tests" $PM test
has_script test:node && step "node tests" $PM test:node

# Secret scan. .github/workflows/gitleaks.yml is gated off (LAC-4925), so this
# and .githooks/pre-commit are the only secret scans between a branch and main.
# Scans the branch delta, which is what the CI job did. Every path that cannot
# actually scan reports "nothing was scanned" rather than a pass.
if ! command -v gitleaks > /dev/null 2>&1; then
  SKIPPED+=("secret scan: gitleaks not on PATH (\`brew install gitleaks\`), NOTHING was scanned")
else
  # Resolve the branch point against the remote, not a possibly-stale local ref.
  git fetch -q origin main 2> /dev/null || true
  BASE=$(git merge-base origin/main HEAD 2> /dev/null || true)
  if [ -z "${BASE:-}" ]; then
    SKIPPED+=("secret scan: cannot resolve \`origin/main\`, so there is no delta to scan. NOTHING was scanned")
  elif [ "$BASE" = "$(git rev-parse HEAD)" ]; then
    # Previously this fell back to `gitleaks protect --staged`, which is always
    # empty here because verify-pr.sh requires a clean tree: a guaranteed-pass
    # row reporting zero bytes scanned. Say "nothing to scan" instead of "pass".
    SKIPPED+=("secret scan: no commits on this branch vs \`origin/main\`, nothing to scan")
  else
    step "secret scan" gitleaks detect --no-banner --redact --log-opts "$BASE..HEAD"
  fi
fi

# .github/workflows/registry.yml is gated off (LAC-4925); these are its 2 steps.
# Registry artifacts inline full file text, so they drift silently on main.
[ -f scripts/registry-check.sh ] && step "registry check" bash scripts/registry-check.sh
[ -f scripts/registry-closure.ts ] && step "registry closure" bun scripts/registry-closure.ts

if [ "$DO_BUILD" = 1 ] && has_script build; then step "build" $PM build; fi

SMOKE_ROWS=()
if [ "$DO_SMOKE" = 1 ] && [ "$DO_BUILD" = 1 ] && [ "$FAILED" = 0 ] && has_script start; then
  PORT=$PORT $PM start > "$LOGDIR/start.log" 2>&1 &
  SERVER=$!
  for _ in $(seq 1 40); do curl -s -o /dev/null -m 3 "http://localhost:$PORT/" && break; sleep 2; done
  if [ -z "$ROUTES" ]; then ROUTES="/ /nope-404=404"; fi
  for spec in $ROUTES; do
    path="${spec%%=*}"; want="${spec#*=}"; [ "$want" = "$spec" ] && want=200
    got=$(curl -s -o /dev/null -m 60 -w "%{http_code}" "http://localhost:$PORT$path")
    if [ "$got" = "$want" ]; then SMOKE_ROWS+=("| \`$path\` | $got | pass |"); else SMOKE_ROWS+=("| \`$path\` | $got (want $want) | **FAIL** |"); FAILED=1; fi
  done
  kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
fi

# Backstop for the cwd bug above and for any future way every probe can come
# back false: a run that executed no checks must never report a pass. Silence
# is not success.
if [ "$RAN_COUNT" = 0 ]; then
  echo
  echo "## Local verification FAILED: no checks ran"
  echo
  echo "Zero checks executed, so there is nothing to report and this is not a pass."
  echo "Usually means \`package.json\` has none of the expected scripts, or this is"
  echo "not the project root (cwd: $(pwd))."
  exit 1
fi

echo
echo "## Local verification ($(git rev-parse --short HEAD), $(date -u +%Y-%m-%dT%H:%MZ), $(node -v), ${PM%% *})"
echo
echo "| Check | Result | Time |"
echo "|---|---|---|"
printf '%s\n' "${RESULTS[@]}"
if [ ${#SMOKE_ROWS[@]} -gt 0 ]; then
  echo
  echo "| Route | Status | Result |"
  echo "|---|---|---|"
  printf '%s\n' "${SMOKE_ROWS[@]}"
fi
[ "$DO_BUILD" = 0 ] && SKIPPED+=("build (\`--no-build\`)")
[ "$DO_SMOKE" = 0 ] && SKIPPED+=("route smoke (\`--no-smoke\`)")
if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo
  echo "Skipped on this run:"
  printf -- '- %s\n' "${SKIPPED[@]}"
fi

# Say the quiet part out loud. Every GitHub Actions job that fires on a PR,
# push or schedule is gated off (LAC-4925), so this script is the gate. It does
# not cover everything the gated jobs did, and a reader of this table should
# not assume it does.
echo
echo "Not covered by this script (the gated CI jobs needed infra it does not stand up):"
echo "integration tests (Postgres service), Playwright e2e, docs link check (Holocron build),"
echo "deployed-URL smoke. A pass here is not evidence about any of those."
echo
# Infrastructure trouble outranks a pass and is reported separately from a
# failure, because "some steps never ran" is not "the code is broken".
if [ "$INFRA_FAIL" = 1 ]; then
  echo "Result: INCOMPLETE. One or more steps never ran (see NOT RUN above), so this is not a verdict on the code. Re-run."
  exit 3
elif [ "$FAILED" = 1 ]; then
  echo "Result: FAIL"
  exit 1
else
  echo "Result: PASS. Run \`bun run verify:pr\` to publish this to the PR as a check."
fi
