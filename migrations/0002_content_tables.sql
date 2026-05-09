-- Run this in Neon SQL Editor after 0001_individual_purchases.sql

-- Company directory (VIP/sponsor members)
CREATE TABLE IF NOT EXISTS sponsors (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  website     TEXT,
  description TEXT,
  tier        TEXT NOT NULL DEFAULT 'vip_free',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HYSKY Monthly webinar sessions
CREATE TABLE IF NOT EXISTS hysky_sessions (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  description  TEXT,
  session_date TIMESTAMPTZ NOT NULL,
  youtube_url  TEXT,
  zoom_url     TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HYSKY Pod podcast episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title          TEXT NOT NULL,
  episode_number INTEGER,
  description    TEXT,
  youtube_url    TEXT NOT NULL,
  published_at   TIMESTAMPTZ NOT NULL,
  is_published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
