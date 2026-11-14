# Test strategy and execution

## Run the checks

Start Docker Desktop, then prepare the local services and accounts:

```powershell
.\club-compass.cmd db:start
.\club-compass.cmd db:configure
.\club-compass.cmd db:test-users
.\club-compass.cmd check
.\club-compass.cmd db:test
.\club-compass.cmd build
.\club-compass.cmd start
```

Leave the last terminal running. In another terminal, use installed Microsoft Edge for browser tests:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
.\club-compass.cmd test:e2e
```

Alternatively install Playwright's Chromium once with `.\club-compass.cmd test:browser-install`, leave PLAYWRIGHT_CHANNEL unset, and run test:e2e. The default website URL is http://localhost:3000; set E2E_BASE_URL only when testing another local port. Do not run these fixed demo-account tests against a hosted project.

With Node 24 installed on PATH, `npm run SCRIPT` is equivalent to the launcher. The project-local launcher avoids the earlier missing npx/Docker PATH problems on this machine. Start the database only after Docker Desktop's engine is ready.

## Coverage

M0 uses node:test for pure permission/routing rules, TypeScript, ESLint, secret scanning and the production build. A local HTTP boot verifies the runnable shell. There is no M0 database schema, so its database gate was not applicable.

M1 adds 51 database assertions. Supabase pgTAP tests use BEGIN/ROLLBACK, independent synthetic users/schools, actual database roles and JWT subjects. They test positive controls (assigned staff and own-school admin edits succeed) and denied unassigned/student/cross-school writes, drafts/history, invalid assignments, immutable school ownership, self-promotion, metadata role spoofing, inactive memberships and inactive schools. The test transaction leaves the demo records unchanged.

Playwright runs nine scenarios at each of two widths: Chromebook 1366×768 and phone 390×844. It uses real login forms and Supabase. It checks wrong passwords, show/hide password, all six role accounts, login redirects, forbidden portals, cross-school paths, reload/session persistence, Explore/detail navigation, sign-out, overflow, and public page/script resources for privileged-key exposure. Each test gets a fresh browser context. Passwords are the documented local fixtures, not real school passwords.

Screenshots and traces are written beneath ignored tmp/playwright-results. The first browser run exposed an ambiguous test locator that also matched Next.js's accessibility route announcer; scoping the error assertion to the login form corrected the test. The final run passed all 18 tests. Representative rendered student/staff screenshots were also visually inspected.

## Secrets and dependencies

check:secrets scans current source/tests, tracked environment files, generated runtime files, and historical text without printing matched credentials. It fails for new exposure. It separately reports the known pre-v3 local credential file in commit 055557b; see decision 005. No claim is made that the old history is secret-free.

Dependency auditing uses `npm audit` and `npm audit --omit=dev`. The production packages are clear at this delivery's check. The remaining moderate minimatch advisory comes through development-only TypeScript ESLint tooling; compatible npm fixes did not resolve that chain. This is documented rather than hidden with a forced incompatible override.

## Boundaries

No scheduling, invitation-expiry, questionnaire or private-plan tests are claimed until those modules exist. Those acceptance criteria remain on the later milestone checklist. React's interactive behavior is currently tested in a real browser. Add component-focused tests when Milestone 2 introduces complex form interactions.

After a schema change, apply a new forward migration, run db:types to regenerate src/types/database.ts, and rerun db:test/typecheck. Normal testing does not need db:reset. That command intentionally erases the v3 development database; recreate demo accounts afterward.
