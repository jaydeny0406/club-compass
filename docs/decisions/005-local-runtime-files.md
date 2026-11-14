# Decision 005: keep generated runtime files out of Git

The previous prototype committed Supabase's generated local runtime credential file under supabase/.temp/start-secrets in commit 055557b. It includes local administrative keys. The first scanner missed this file because its filename ends in .env rather than beginning with .env. That historical check was incomplete; this decision corrects the record.

Removed the two generated .temp files and the generated .branches marker from Git tracking and ignored the complete .temp and .branches directories. The running v3 database's generated files remain on disk, ignored. The v3 application uses only the public publishable key and authenticated sessions. Its local administrative bootstrap reads the CLI key in memory.

The scanner now examines tracked .env-suffixed files, rejects tracked runtime folders, and checks historical text. It reports the exact pre-existing commit/file as a known legacy exposure rather than claiming clean history. Any other exposure fails the check. No credential values are logged.

Old Git history and old database volumes have not been rewritten or deleted. Review/rotate the old local project's keys before sharing or reusing that project. These local keys must never be used in a hosted project; production setup requires a separate Supabase project and credentials.
