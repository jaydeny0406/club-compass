# Club Compass v3

A responsive, school-agnostic activity website rebuilt from the November 2026 master build prompt. Milestones 0 and 1 are complete; later milestones remain unimplemented. Full architecture, required/optional entity fields, decisions and future milestones are in [docs/architecture.md](docs/architecture.md) and [docs/implementation-plan.md](docs/implementation-plan.md).

## Local setup on Windows

Use the bundled Node 24 launcher, or install Node 24 and run the equivalent npm scripts. Install dependencies with npm ci if node_modules is missing. Start Docker Desktop before local Supabase.

```powershell
.\club-compass.cmd db:start
.\club-compass.cmd db:configure
.\club-compass.cmd db:migrate
.\club-compass.cmd db:test-users
.\club-compass.cmd dev
```

Open http://localhost:3000/login. The v3 database is a fresh project: API http://127.0.0.1:55321, database port 55322, Studio http://127.0.0.1:55323. The old club-compass database remains separate. The old source snapshot is in ignored tmp/pre-v3-restart/current-source.zip and Git commit 055557b.

db:configure copies only the local API URL and publishable key into .env.local. It preserves unrelated settings and refuses to overwrite a hosted project URL. .env.example is a template, not working credentials. Restart next dev after changing settings; production bundles must be rebuilt. The homepage can boot without Supabase, but protected school data and login cannot.

## Milestone 1 demo accounts

All fixed test credentials are created only in the club-compass-v3 local database by db:test-users. They are not production accounts.

| School | Role | Email | Password |
| --- | --- | --- | --- |
| NNHS demo | STUDENT | student@club-compass.test | StudentDemo123! |
| NNHS demo | STAFF | teacher@club-compass.test | TeacherDemo123! |
| NNHS demo | ADMIN | admin@club-compass.test | AdminDemo123! |
| Harbor demo | STUDENT | student.harbor@club-compass.test | StudentDemo123! |
| Harbor demo | STAFF | teacher.harbor@club-compass.test | TeacherDemo123! |
| Harbor demo | ADMIN | admin.harbor@club-compass.test | AdminDemo123! |

The teacher is now STAFF, not the administrator role used in the old prototype. Login routes each role to its permitted school portal. Sign out before switching accounts. All seeded activities and school contacts are fictional fixtures; the NNHS name denotes the planned pilot, not verified live activity information.

## Test and build

```powershell
.\club-compass.cmd check
.\club-compass.cmd db:test
.\club-compass.cmd build
```

check runs unit tests, TypeScript, ESLint and secret checks. db:test runs PostgreSQL allow/deny tests in rolled-back transactions. For browser tests, keep the website running in another terminal, set $env:PLAYWRIGHT_CHANNEL = "msedge" to use installed Edge, and run .\club-compass.cmd test:e2e. Chromium setup and all prerequisites are in [docs/testing.md](docs/testing.md). build creates the production bundle. Run start after build to serve it.

db:types regenerates the TypeScript database model after a schema change. db:migrate applies pending local migrations without resetting records. db:reset intentionally erases and recreates only the v3 development database; run db:test-users again afterward. db:stop stops v3 services. Normal testing never needs db:reset.

## Production preparation

Use a separate hosted Supabase project. Apply migrations (never the local seed or fixed-account bootstrap) through the Supabase CLI/CI using a protected credential. Provision the initial school and ADMIN membership through a trusted administrative process. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SITE_URL before next build. Configure Supabase site and redirect URLs to the actual HTTPS origin. Deploy Next.js on a compatible Node host such as Vercel.

No service/secret key belongs in NEXT_PUBLIC variables or src. Use provider database backups and test restoration before pilot launch. Log operational error codes without passwords, session tokens or future private schedule content. Public self-signup is disabled for this foundation; controlled invitations and onboarding are later milestones. This delivery is not a production deployment.

## Current boundaries

M0: architecture, design tokens, environment setup, migration/test strategy and runnable shell.
M1: school identity, memberships, roles, verified sessions, protected layouts, assigned staff access and isolation tests.

The activity screens display minimal permission fixtures. Creating/editing complete activities, questionnaires and server autosave begin in Milestone 2. Search/filter/category UI, plans, comparison, calendars and operational admin tools are not implemented yet. No AI, social graph or messaging is included.

Verified: 6 unit tests, 51 database assertions, 18 browser checks, TypeScript, ESLint and production build. The production dependency audit is clear. Seven moderate development-tool findings and the old prototype’s historical local credentials are documented in the report; generated Supabase credential folders are now ignored.

See [docs/milestone-report.md](docs/milestone-report.md) for executed checks and limitations.
