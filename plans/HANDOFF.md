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

> *"I believe we should write tests for everything before we start making too
> many other changes."*

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
