-- Run after 0002_content_tables.sql
-- Holds pre-migrated member data from Mighty Networks.

CREATE TABLE IF NOT EXISTS pending_tiers (
  email         TEXT PRIMARY KEY,
  tier          TEXT NOT NULL DEFAULT 'free',
  name          TEXT,
  mn_member_id  TEXT,
  course_slugs  TEXT NOT NULL DEFAULT '[]',
  event_slugs   TEXT NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
