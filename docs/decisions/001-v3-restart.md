# Decision 001 Restart the foundation for v3

Accepted November 11, 2026. The user explicitly requested starting over and completing Milestones 0 and 1 of the supplied v3 document. The earlier teaching-only instruction and September phases no longer define this implementation.

Replace the old application routes/domain and migration baseline; preserve the tracked prior implementation at commit 055557b. Use a fresh local Supabase project club-compass-v3 with API 55321, database 55322, Studio 55323 and mail viewer 55324. The legacy club-compass project and volumes are not reset or removed. Update local env only through the explicit db:configure command. Existing hosted URLs are never silently overwritten.

M0 delivers the architecture package, repository structure, design tokens and runnable shell. M1 adds verified authentication, STUDENT/STAFF/ADMIN, school-scoped layouts and database permission tests. The minimal activity/profile/year/type/assignment tables are needed now to test assigned versus unassigned staff; questionnaire, creation/edit UI, calendars and admin operations remain deferred.

Directory access requires an active school membership by default, consistent with v3's school-instance student login journey. Anonymous users see only the generic welcome/login. No fallback public demo data bypasses authentication.

Provision memberships through trusted setup for M1. Disable public self-sign-up. A login never infers roles from email addresses. Production onboarding and invitations belong to M7. Every school query must verify school activity and active membership, even when a protected layout already exists.

Retain compatible tools unless validation identifies a concrete reason to update. Decision 004 records the security-driven update to Next.js 16.4.6.
