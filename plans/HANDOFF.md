# Handoff: shipkit improvement work as of 2026-06-23

This handoff captures where the audit-driven improvement work stands and what
the next executor should pick up. Read it once, then drive from
[`plans/README.md`](./README.md).

## Where we are

- `main` is at `66c0efb6` (merge of `fix/upgrade-actions-to-v6`). That merge
  brought in the GitHub Actions v4→v6 sweep, four workflow security fixes
  surfaced by code-review (shell injection in `auto-fix-issues.yml` and
  `run-codex.yml`, multi-line `$GITHUB_OUTPUT` corruption, and the rollback
  branch collision in `deploy-to-production.yml`), and the `doctor:react`
  script alias.
- The `/improve` audit on 2026-06-11 produced 18 executor-grade plans now
  committed under `plans/` and mirrored as GitHub issues #222-#239.
- The `origin/security` branch (2026-06-03 audit, 7 critical + 9 high findings
  already fixed) is **still unmerged**. Several plans (notably 001) depend on
  primitives it introduces.
- No tests have been added since the audit. The test suite as it exists today
  is the safety net we have.

## Owner-stated direction (2026-06-23)

> _"I believe we should write tests for everything before we start making too
> many other changes."_

That reorders the queue. Test plans **008** (`payment-service`) and **009**
(`auth-service`) move to the front. Their purpose is **characterization**:
lock in current behavior — bugs and all — so the P1 security/correctness fixes
(plans 001-005) can land with a regression net under them.

Do not start behavioral changes until 008 and 009 are merged and green in CI.

## Recommended execution order

1. **Land `origin/security` to `main`.** Several plans assume its primitives
   (`requireSessionOrResponse`, the `teamService.getTeamMembers` pattern). Do
   this before plan 001 or any auth-touching plan.
2. **Plan 008** — characterization tests for `payment-service.ts`. Pins the
   N+1 behavior and webhook handlers before plans 004 and 007 change them.
3. **Plan 009** — characterization tests for `auth-service.ts`. Pins session,
   role, and provider behavior before plans 003 and 011 change them.
4. **Plan 002** — LemonSqueezy `custom_data.user_id` fix. Smallest P1, highest
   bang-for-buck once tests are in place. (`origin/security` did **not** touch
   this; verify before assuming it's been fixed.)
5. **Plans 001, 003, 004, 005** — the rest of the P1 set, in any order. Plan
   004 (webhook idempotency) is the riskiest of the four; do it last in this
   batch so the surrounding tests have time to bed in.
6. **P2 work** (006, 007, 010, 016) and then **P3** as appetite allows.

The status table in `plans/README.md` is the canonical tracker; update it as
plans land.

## Open code-review threads from the merge

Three findings from the workflow-backed `/code-review` of `fix/upgrade-actions-to-v6`
were intentionally **not** fixed in that PR. They each deserve a follow-up
issue (none filed yet — flagged here so the next executor doesn't miss them):

- **CR-#5** — verify CodeQL v4 schema compatibility with our `codeql.yml`
  config keys before relying on it in CI.
- **CR-#8** — `e2e.yml` doesn't pin `playwright` to a version compatible with
  the chromium build step on Ubuntu 24.
- **CR-#9** — `lighthouse.yml` still uses `setup-bun@v1` and a hard-pinned
  `bun-version: 1.1.34`; either bump or document why.

File them as issues before starting plan execution so they don't fall off.

## Things that are NOT on the table without explicit re-confirmation

- Bulk dependency upgrades. The audit flagged a few stale deps (DEPS-02 etc.)
  but multi-auth and the framer-motion footprint are intentional for a
  template repo; do not "clean these up" as part of another plan's PR.
- Removing `.env.example` or any environment scaffolding. Plan 015 removes
  **only** `.env.old` and `.env.local.disabled` — nothing else.
- Deleting the `cli/` scaffolder. Plan 018 is about publishing it, not
  shrinking it.

## Memory carry-overs (relevant to whoever picks this up)

- `feedback_preserve_working_tree.md` — never silently discard uncommitted
  working-tree changes; save or ask first. This came out of dropping
  `doctor:react` mid-review and is now permanent.
- `feedback_verify_live.md` — always verify deployed fixes on the live site
  before closing issues.

## First commands for the next session

```bash
cd ~/repo/shipkit
git fetch origin
git log --oneline -5
git checkout -b tests/payment-service-characterization
# open plans/008-payment-service-tests.md and follow it
```

## 2026-06-24 update — Phases 1 & 2 complete, on main

| Check                   | State on main (`97cbd8a7`)         |
| ----------------------- | ---------------------------------- |
| `bun run typecheck`     | 0 errors                           |
| `bun run test`          | 198 passed / 23 skipped / 0 failed |
| `bunx biome lint .`     | 0 errors, 495 warnings             |
| `bun run lint:eslint`   | 0 errors, 2099 warnings            |
| `bun run lint:prettier` | clean                              |

**Phase 2 numbers:** ESLint 1182→0, Biome 222→0, Prettier 381 unformatted→0.
~19 commits landed via `phase-2/lint-cleanup`. See the merge commit for
the full breakdown.

**Plans drafted for the next phases:**

- `plans/PHASE-3-TESTCONTAINERS.md` — test-DB infrastructure (✅ landed)
- `plans/PHASE-5-E2E-COVERAGE.md` — critical-flow Playwright coverage
- `plans/draft-ci-workflow.yml` — Phase 6 CI workflow (move to
  `.github/workflows/ci.yml` once Phase 5 is green)

**Preserved work:**

- `wip/vercel-cost-optimization` — previously-stashed cache header +
  guide work (committed for safety, not yet reviewed).
- `advisor/008-payment-service-tests` (local only) — abandoned plan-008
  attempt with vite bump; reference only.

## 2026-06-24 second update — Phase 3 complete

| Check                      | State                                                         |
| -------------------------- | ------------------------------------------------------------- |
| `bun run test`             | 198 passed / 16 skipped / 0 failed (24 files; 2 file-skipped) |
| `bun run test:integration` | 7 passed / 19 skipped / 0 failed (4 files; 2 file-skipped)    |
| `bun run typecheck`        | 0 errors                                                      |
| `bun run lint`             | 0 errors, 2099 warnings                                       |

**Phase 3 wiring:**

- `tests/helpers/test-db.ts` — boots Postgres via Testcontainers,
  pushes the live schema via `drizzle-kit push --force` (matches the
  `bun run db:push` production deploy path — repo has no migration
  files).
- `tests/helpers/global-setup-integration.ts` — vitest globalSetup
  that starts the container and propagates `DATABASE_URL` to workers.
  Auto-detects the Docker Desktop socket on macOS / Linux / Colima.
- `tests/setup-integration.ts` — does NOT mock `@/server/db`;
  truncates user tables after each test.
- `vitest.config.integration.ts` — separate project, serial fork pool,
  120s hook timeout for container startup.
- `tests/integration/smoke.test.ts` — proves the rig works end-to-end.
- `package.json` — `test:integration` and `test:all` scripts.

**The 4 previously-DB-skipped tests:**

- `github-service` — passing (5 tests; covers the "service-disabled"
  branch which is the only path testable without GitHub env vars).
- `feedback-service` — re-skipped with reason "asserts outdated API
  where createFeedback() threw and returned the row; current service
  returns FeedbackResult". Phase 4 task #18.
- `team-service` — re-skipped with reason "predates workspace-id
  rework; method shapes don't match". Phase 4 task #19.
- `deployment-actions` (kept under `tests/unit/`) — its mock-based
  setup can't compose with real Drizzle helpers; needs a real-DB
  rewrite. Phase 4 task #20.

**Hard prereq for running locally / in CI:** Docker (or compatible
runtime) must be running. Testcontainers exits with "Could not find a
working container runtime strategy" if it isn't. The Phase 6 CI
workflow draft handles this with a Postgres service container instead
(cheaper than spinning a container per CI job).

**Next:** Phase 4 — real characterization of payment-service,
auth-service, and webhook surfaces, plus the three test rewrites
queued as tasks #18–#20.

## 2026-06-24 third update — Phase 4 complete

| Check                      | State                                       |
| -------------------------- | ------------------------------------------- |
| `bun run test`             | 198 passed / 9 skipped / 0 failed           |
| `bun run test:integration` | 86 passed / 0 skipped / 0 failed (10 files) |
| `bun run typecheck`        | 0 errors                                    |
| `bun run lint`             | 0 errors, 2099 warnings                     |

**What landed:**

- Tasks #18–20: rewrote feedback-service, team-service, and
  deployment-actions tests against the live Testcontainers DB. The
  previous versions were red filler (outdated APIs / broken chainable
  mocks).
- Task #21 (Phase 4.1): payment-service characterization — 28 tests
  covering createPayment idempotency-by-orderId, status updates,
  metadata fallback chain, hasUserPurchased{Variant,Product} DB
  branches, getPaymentsWithUsers (with the N+1 documented as the spec
  for plan 007), and getUsersWithPayments.
- Task #22 (Phase 4.2): auth-service characterization — 10 tests for
  user-service (ensureUserExists case-folding, personal-team side
  effect, no-op on undefined name, etc.) and 9 tests for
  admin-service.isAdmin (4 layered checks: typeof / static config /
  DB role / RBAC).
- Task #23 (Phase 4.3): failing-as-spec tests for plans 004 (orderId
  uniqueness) and 005 (one-time temporary links). Each uses
  `it.fails`; remove the `.fails` modifier in the SAME PR as the fix.

**Deferred to Phase 5:**

- Plan 002 (LemonSqueezy custom_data.user_id IDOR) — the vulnerable
  resolver is module-private to the route handler. Testing cleanly
  needs either an export-for-tests refactor or webhook-signed e2e
  POST. Filed for Phase 5.

**Next:** Phase 5 — e2e Playwright coverage of critical user flows.
See `plans/PHASE-5-E2E-COVERAGE.md`.

## 2026-06-25 update — Phase 5 complete

| Check                      | State                                       |
| -------------------------- | ------------------------------------------- |
| `bun run test`             | 198 passed / 9 skipped / 0 failed           |
| `bun run test:integration` | 86 passed / 0 skipped / 0 failed (10 files) |
| `bun run test:e2e`         | 16 passed / 5 skipped / 0 failed            |
| `bun run typecheck`        | 0 errors                                    |
| `bun run lint`             | 0 errors, 2099 warnings                     |
| `bun run build`            | succeeds (was broken; see below)            |

**Real bug fix during Phase 5:**
`src/app/(app)/install/shared-utils.ts` imported `node:path` and was
reachable through the client bundle. Build failed with
`UnhandledSchemeError`. Phase 1's gate (`typecheck && test`) didn't
catch it. Fixed by replacing `path.join("packages",...)` with a string
literal. Phase 6 CI MUST include `bun run build` so this can't recur.

**Phase 5 wiring:**

- `tests/e2e/global-setup.ts` — boots Postgres testcontainer + pushes
  schema, sets `DATABASE_URL` in env so the webServer (`bun dev`)
  inherits it. Honors `E2E_SKIP_DB_SETUP=1` for external-DB runs.
- `tests/e2e/global-teardown.ts` — stops the container.
- `playwright.config.ts` — wires the global setup/teardown; sets
  `retries: process.env.CI ? 2 : 0` (was always 2 → ate 3× the local
  dev loop on failures); extends webServer timeout to 180s.
- `tests/e2e/smoke.spec.ts` — new Phase-5 smoke suite (8 tests, 7
  passing, 1 skipped pending task #24).
- Pre-existing e2e fixes: `login.spec.ts` heading wording, `/docs`
  removed from `MARKETING_ROUTES`, `/features` and `/examples`
  softened to "not 5xx" since they're downstream-only routes,
  `admin-payment-import` skipped pending task #25 (needs Payload).

**Phase 5 follow-ups filed:**

- #24 — fix `(app)/not-found.tsx` client-side crash
- #25 — deep auth/checkout/admin flows (needs Payload + sandbox keys)
- #26 — LemonSqueezy IDOR e2e (plan 002 — webhook-signed POST)

**Next:** Phase 6 — CI gating (`.github/workflows/ci.yml`). The draft
at `plans/draft-ci-workflow.yml` needs updating to add the
`test:integration` step and require Docker-in-CI for Postgres
(simpler to use GH Actions' postgres service container; see
plan-section comments). Build must be a required check.
