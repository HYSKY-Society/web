ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "contact_name" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "account_industry" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "account_city" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "account_state" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "account_country" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "contact_city" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "contact_state" text;
ALTER TABLE "zoho_profile_details" ADD COLUMN IF NOT EXISTS "contact_country" text;

ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "contact_name" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "account_industry" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "account_city" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "account_state" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "account_country" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "contact_city" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "contact_state" text;
ALTER TABLE "zoho_pending_profile_details" ADD COLUMN IF NOT EXISTS "contact_country" text;
