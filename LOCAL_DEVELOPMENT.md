# Local development

This worktree is configured to use a local PGlite database. It does
not need a Neon `DATABASE_URL` for local previews.

## Start the site

In PowerShell, from this directory, run:

```powershell
npm.cmd ci
npm.cmd run db:local:push
npm.cmd run db:local:seed-test-accounts
npm.cmd run dev
```

Open <http://localhost:3000>. The local database is stored in `.local-data/`,
which is ignored by Git. It starts empty; it does not contain member or
production data.

The local test accounts are `d@hy-sky.net` (VIP and admin) and
`daniellemclean1@gmail.com` (Free). The seed script looks up their Clerk
development identities and changes only the local PGlite database. The app's
admin allowlist remains in `lib/admin.ts`. Sign out and sign in with the other
email to see that account's experience. Profile photos and other member
data from the live site are not copied here; the seed script uses each Clerk
development account's current image.

Run `db:local:push` and `db:local:seed-test-accounts` only while the site is
stopped, so another process does not open the same PGlite data directory.
Stop `npm run dev` with Ctrl+C in its terminal before rerunning them.

## OpenCode models

The project OpenCode config uses the tested free cloud model
`opencode/mimo-v2.6-flash-free` for Build and Plan. Its small model is the local
`ollama/qwen2.5-coder:7b`. The installed `ollama/gemma4:26b` is also available
in the model picker. Keep Ollama running for local model use. Restart OpenCode
after changing its config; an existing session may keep its previous model.

OpenAI models are visible, but the current OpenAI API account reported
`credit_balance_exhausted` on 2026-09-28. Anthropic has no connected credential.

Production still uses Neon when `LOCAL_DATABASE` is not set. Do not add the
production `DATABASE_URL` to this worktree's `.env.local`.
