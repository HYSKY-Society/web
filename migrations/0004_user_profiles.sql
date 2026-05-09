-- User profile data (separate from Clerk auth record)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  TEXT,
  headline      TEXT,
  bio           TEXT,
  location      TEXT,
  company       TEXT,
  job_title     TEXT,
  website       TEXT,
  linkedin_url  TEXT,
  twitter_url   TEXT,
  avatar_url    TEXT,
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
