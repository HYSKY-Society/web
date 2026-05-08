-- Run this in Neon SQL Editor after the 0000_init.sql migration.

-- Rename legacy 'paid' tier to 'member_full'
UPDATE users SET tier = 'member_full' WHERE tier = 'paid';

-- Individual course access
CREATE TABLE IF NOT EXISTS course_purchases (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug  TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_slug)
);

-- Individual event registrations
CREATE TABLE IF NOT EXISTS event_purchases (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_slug   TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_slug)
);
