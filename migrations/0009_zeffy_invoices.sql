CREATE TABLE IF NOT EXISTS "zeffy_invoices" (
  "token"          text PRIMARY KEY,
  "email"          text NOT NULL,
  "name"           text NOT NULL,
  "org"            text,
  "amount"         text NOT NULL,
  "currency"       text NOT NULL DEFAULT 'USD',
  "event_name"     text NOT NULL,
  "paid_at"        timestamp with time zone NOT NULL,
  "zeffy_order_id" text,
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL
);
