CREATE TABLE IF NOT EXISTS press_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'HYSKY Society',
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  read_time_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flying_hy_speakers (
  id TEXT PRIMARY KEY,
  event_year INTEGER NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  bio TEXT,
  avatar_url TEXT,
  session_title TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flying_hy_agenda (
  id TEXT PRIMARY KEY,
  event_year INTEGER NOT NULL,
  time_slot TEXT,
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  session_type TEXT NOT NULL DEFAULT 'session',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
