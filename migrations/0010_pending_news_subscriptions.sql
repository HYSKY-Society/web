CREATE TABLE IF NOT EXISTS "pending_news_subscriptions" (
  "email" text PRIMARY KEY NOT NULL,
  "tier" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
