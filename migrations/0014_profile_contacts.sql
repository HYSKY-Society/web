CREATE TABLE IF NOT EXISTS "profile_contacts" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_website" text,
  "phone_number" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
