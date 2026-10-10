# Manual Add member

The Admin overview opens Add member in a dialog with one click, without leaving
the dashboard. The form is also available in Directory Management. Only the
verified primary Clerk email `d@hy-sky.net` can submit the server action.
The form takes an optional name, email, and membership level (Free by default).

On explicit submission, it first checks Connect for an existing active or
pending record. Existing records open for editing without changing their tier
or contacting Clerk. Otherwise it looks up the exact email in Clerk, creates a
passwordless account when absent, and saves the Clerk ID and selected tier in
Connect. Clerk must allow a passwordless sign-in method such as email codes;
required Clerk fields still apply. No invitation or other email is sent by this
feature. Share `https://connect.hysky.org/sign-in` yourself when ready.

Membership permissions remain in Connect/Neon. The new code does not add
background polling, scheduled sync, database migrations, or changes to Zeffy.
The intentionally removed invoice automation and hidden news automation remain
as checked out from commit 53a0e8bf197d4f4504fe1ffe81ea7b420d01fbc7.

## Local interactive preview

For the full Connect site, run `npm run dev:full-preview` and open
http://127.0.0.1:3001/admin. This copies the real site pages and local assets into
the ignored `.local-site` folder, substitutes mock Clerk, disables realtime,
and initializes an isolated PGlite database with example members. The Admin
dashboard, sidebar, directory, and Add member server action are the actual
website code. New test members persist in that local database and mock Clerk
file. Production credentials and environment files are not copied. The local
preview uses an offline font fallback and automatically signs in as Danielle.
Its authentication bypass exists only in the generated copy, never in the
production application. Re-running the script refreshes its copy of the code.
The launcher also adds the missing feed tables from the current schema to the
local database, since their initial creation is absent from the historical
migrations. This preview-only setup never runs against Neon. Wix credentials
are stripped along with the other cloud credentials.

Run `npm run dev:member-preview`, then open http://127.0.0.1:3000.
The preview is a separate Next app under `scripts/local-member-preview`, not a
route in the production website. It renders the actual AddMemberForm and uses
the actual validation/provisioning orchestration with mock Clerk and an
in-memory member list. It requires no credentials and never imports the live
database or Clerk clients. Its records reset when the process restarts.

Try creating a Free member, creating a VIP member, and submitting the same VIP
email with Free selected. That last submission must leave the VIP record and
account counts unchanged. Invalid input must show an error without a record.

Run `npm run test:manual-members` for owner authorization, input validation,
duplicates, pending records, secondary-email rejection, and retry behavior.

The local preview verifies UI → server action → mock data → rendered response.
It does not verify production Clerk instance settings, live Neon writes, or
deployed access restrictions. No real accounts have been created during this
implementation. An actual authenticated integration test remains necessary
before treating the live Clerk/Neon path as verified.
