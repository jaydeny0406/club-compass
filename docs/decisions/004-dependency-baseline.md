# Decision 004: maintained dependency baseline

The M1 dependency check identified critical/high advisories in the inherited package versions. Upgraded Next.js and its ESLint config together from 16.3.4 to 16.4.6, read the new installed auth/proxy guidance, and applied compatible npm security fixes. Production dependencies are checked separately from development-only lint tooling.

Upstream release: https://github.com/vercel/next.js/releases/tag/v16.4.6
Relevant Server Action advisory: https://github.com/advisories/GHSA-p3m5-59mp-jv5r

Do not force an incompatible major override solely to make npm audit green. Record any remaining development-only advisory in the milestone report and retest when the upstream tooling supports a fix. Keep the lockfile committed for reproducible installs.
