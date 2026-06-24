# Master test & quality plan

> **Status**: DRAFT — awaiting owner sign-off before execution.
> **Authored**: 2026-06-23 against `main @ 2d8d3605`.
> **Author**: senior-dev pass after plan 008 was reverted for premature "done".

This document supersedes the test-first ordering note in
[`plans/HANDOFF.md`](./HANDOFF.md). It is the single source of truth for how
shipkit gets to production-grade quality before any behavioral fix (plans
001-007) lands.

## The truthful baseline (2026-06-23)

| Check               | State                                                      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`      | **1 red**, 196 green, 24 skipped, 5 files entirely skipped | Failing file: `tests/unit/components/deployments/dashboard-vercel-deploy.test.tsx` — `Cannot read properties of null (reading 'useEffect')` thrown from `QueryClientProvider`. Skipped files all guard on `if (!db)` because there is no test database.                                                                                                                                                                                                 |
| `bun run typecheck` | **Red**                                                    | (a) `src/components/ui/user-menu.tsx` references `routes.app.root` and `routes.app.dashboard.settings` which don't exist on the routes type. (b) `src/lib/utils/route-utils.ts:34` "Type instantiation excessively deep." (c) `src/server/actions/deploy-private-repo.ts` imports a missing export `generateProjectNameSuggestions`. (d) All three `vitest.config*.ts` fail because `@vitejs/plugin-react@6` requires `vite@^8` and we have vite 7.3.1. |
| `bun run lint`      | **Red**                                                    | 222 errors, 795 warnings, 59 infos. Diagnostics overflow Biome's default cap.                                                                                                                                                                                                                                                                                                                                                                           |
| `bun run test:e2e`  | Unrun this session                                         | `tests/e2e/login.spec.ts` and `full-deploy-flow.spec.ts` skip when credentials auth and deploy env vars aren't set.                                                                                                                                                                                                                                                                                                                                     |
| `bun run build`     | Unrun this session                                         | Known historical OOM; `bun run build:vercel` uses 8GB heap.                                                                                                                                                                                                                                                                                                                                                                                             |

**What this means.** Shipkit cannot claim "tests pass" today. The unit suite
is misleadingly mostly-green because the most important code paths — service
methods that hit the DB — are skipped, not exercised. Type-checking and
linting are red. The CI workflows we just hardened do not run any of these
checks on PRs.

## Non-goals (explicit)

So we don't drift into scope:

- **Not** rewriting the codebase.
- **Not** fixing every lint warning. We'll ratchet, not boil-the-ocean.
- **Not** 100% code coverage. Critical paths only.
- **Not** building integration tests for paths we'll delete (e.g. anything
  the `origin/security` branch already rewrote).
- **Not** behavioral fixes (plans 001-007) until Phases 1-4 land.

## The seven phases

Each phase has an explicit definition of done, a rough effort estimate, and
the verification command that proves it shipped. Sequence is load-bearing —
do not start phase N before phase N-1 is green.

### Phase 1 — Get the existing suite truly green (~2-4h)

Fix what's already broken before adding anything.

- **1.1** Bump `vite` to a version `@vitejs/plugin-react@6` accepts, or pin
  `@vitejs/plugin-react` to its v7-compatible major. The known-good fix from
  the abandoned `advisor/008-payment-service-tests` branch was vite 7.3.1 →
  8.0.16. Re-evaluate; the senior call is to keep vite on a major in the
  Next 15 supported window. Verify `bun run typecheck` no longer complains
  about the vitest configs.
- **1.2** Fix the three source TS errors. Each is localized; none should
  require redesign.
- **1.3** Fix `tests/unit/components/deployments/dashboard-vercel-deploy.test.tsx`.
  The React hook null is almost certainly a missing `QueryClientProvider`
  wrapper or a duplicate-React-copy issue from pnpm hoisting (see the
  `react@19.2.4` in two paths in the error trace).
- **1.4** Audit the 24 individually-skipped tests. For each: enable, fix, or
  document why it must stay skipped (with a tracked follow-up). No silent
  skips.
- **Done when**: `bun run typecheck && bun run test` exits 0. Zero failing
  tests. Skipped count documented and justified.

### Phase 2 — Tame lint to green-or-ratcheted (~3-5h)

222 errors is too many to fix blind. Strategy:

- **2.1** Run `bun run lint:fix` and review the diff in chunks.
- **2.2** For remaining errors, categorize: (a) genuine bugs (fix), (b) style
  the team disagrees with (downgrade rule severity in `biome.json`), (c) too
  large to fix now (suppress with `// biome-ignore lint/rule: <reason + issue#>`
  and file the issue).
- **2.3** Lock the line: add an `eslint-disable` / `biome-ignore` budget to
  CI so the count can only go down.
- **Done when**: `bun run lint` exits 0. Outstanding warnings are tracked
  by issue.

### Phase 3 — Test infrastructure for the real DB path (~4-6h)

The single biggest reason 24 tests skip is "no test database." Fix that.

- **3.1** Add a `docker-compose.test.yml` (or use Testcontainers) that spins
  up Postgres on a random port. Set `TEST_DATABASE_URL` in vitest setup so
  service tests connect to it.
- **3.2** Add a global `beforeAll` that runs Drizzle migrations against the
  test DB and a global `afterEach` that truncates non-fixture tables.
- **3.3** Build a `tests/helpers/chainable-db.ts` mock for pure-unit service
  tests where spinning Postgres is overkill. Document when to use which.
- **3.4** Re-enable the 5 currently-skipped service test files. Verify they
  pass against the new test DB.
- **Done when**: zero `describe.skip(..."database not available"...)` lines
  remain. `bun run test` shows the previously-skipped tests now running and
  passing.

### Phase 4 — Real characterization of high-risk surfaces (~1-2 days)

Now — and only now — write the tests the behavioral plans need.

- **4.1** `payment-service.ts`: cover `getUsersWithPayments` /
  `getPaymentsWithUsers` with multi-user/multi-payment fixtures so plan 007's
  N+1 refactor has a safety net. Cover webhook handlers for all three
  providers (LemonSqueezy, Stripe, Polar). Cover free-vs-discounted price
  logic. Cover metadata-parsing fallback chain.
- **4.2** `auth-service.ts`: cover session resolution, role checks, provider
  resolution, the dangling RBAC path from plan 003, `isAdmin()` (plan 011).
- **4.3** Webhook surface — write tests that _fail today_ and would pass
  after plan 002, 004, 005 land. These tests become the spec for those
  plans. (LemonSqueezy `custom_data.user_id` IDOR, payment idempotency,
  temporary-link one-time use.)
- **4.4** Server actions that touch auth or money: at minimum smoke tests
  for happy + denied paths.
- **Done when**: every method in `payment-service.ts` and `auth-service.ts`
  has at least one test that exercises real DB behavior (not the
  `safeDbExecute` default-value short-circuit). Each behavioral fix planned
  in 001-007 has a corresponding **failing** test that will turn green when
  the fix lands.

### Phase 5 — E2E coverage of critical user flows (~1 day)

Playwright is already wired up. Make it actually verify the product.

- **5.1** Configure CI / local env so e2e tests don't skip. This means a
  test instance with credentials auth enabled and a test database seeded.
- **5.2** Sign-in (credentials, magic link if configured).
- **5.3** Subscribe / checkout (using provider sandbox modes where
  available).
- **5.4** Admin dashboard view.
- **5.5** Multi-zone navigation if zones are deployed.
- **Done when**: `bun run test:e2e` runs all specs (none skipped via env
  guards) and passes locally. Browser suite (`bun run test:browser`) also
  green.

### Phase 6 — CI gating (~1-2h)

Without CI, none of the above stays green.

- **6.1** Add `.github/workflows/ci.yml` that runs on every PR and push to
  main: `bun run typecheck`, `bun run lint`, `bun run test`,
  `bun run test:e2e`, `bun run build`. Provision Postgres as a CI service.
- **6.2** Make `main` branch-protected: PRs must pass CI to merge. No
  force-push, no admin bypass.
- **6.3** Update the v6-swept workflows (already on `main`) to ensure none
  duplicate CI work or have stale assumptions.
- **Done when**: A trivial PR with a deliberate type error gets blocked.

### Phase 7 — Behavioral fixes (plans 001-007) (~separate budget)

Now we can land the security and correctness fixes. Each plan should arrive
with the tests written in Phase 4 going from red to green.

## Recommended cuts if time is short

If the financial-emergency calendar doesn't allow the full plan, the
minimum-viable subset that gets the **highest risk surfaces** safe is:

- **Phase 1** (must — nothing works without it).
- **Phase 3** (must — without a test DB, characterization is theatre).
- **Phase 4.3** (must — webhook + IDOR + idempotency tests).
- **Phase 6** (must — without CI gating, the next regression lands).

Defer Phase 2 (lint), Phase 4.1/4.2 (broader characterization), Phase 5
(e2e). File those as follow-up issues. Land the fixes (Phase 7) gated by
the Phase-4.3 tests.

## Execution rules (for me and any future agent)

These are non-negotiable:

1. **Never call a phase done unless its verification command exits 0.** Paste
   the exit code in the commit message.
2. **No merge to `main` with red CI** (once Phase 6 is in place; before then,
   no merge with red `typecheck && test && lint`).
3. **Characterization that only exercises a default-value short-circuit is
   not characterization** — it is filler. Tests must drive real code paths.
4. **If a plan's stated coverage cases cannot be implemented (e.g. requires
   real DB and there isn't one), the plan is BLOCKED on infrastructure.
   Stop and surface — do not write degraded tests and claim victory.**
5. **The honest answer to "are all tests passing" is the output of the test
   command, not a summary of what I intended.**

## Decision needed from owner

Three questions before execution:

1. **Phase order**: execute Phases 1→6 in sequence (recommended), or accept
   the minimum-viable cut (Phase 1 → 3 → 4.3 → 6) and defer the rest?
2. **Infrastructure for test DB (Phase 3)**: docker-compose vs.
   Testcontainers (Bun support is solid; recommended), vs. accepting that
   service tests are unit-only with a chainable mock and DB-touching code is
   only covered in e2e?
3. **Lint scope (Phase 2)**: 222 errors — fix everything (multi-day), or
   ratchet with a budget file (recommended)?

Once those are answered, execution proceeds top-down with no further
check-ins until a phase completes or hits a STOP condition.
