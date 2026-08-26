CREATE TABLE IF NOT EXISTS "zoho_pending_profile_details" (
  "email" text PRIMARY KEY NOT NULL,
  "zoho_contact_id" text NOT NULL,
  "emails" text DEFAULT '[]' NOT NULL,
  "phone_numbers" text DEFAULT '[]' NOT NULL,
  "account_id" text,
  "account_name" text,
  "job_title" text,
  "company_website" text,
  "company_what_we_do" text,
  "synced_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "zoho_pending_profile_details_contact_id_idx"
  ON "zoho_pending_profile_details" ("zoho_contact_id");
