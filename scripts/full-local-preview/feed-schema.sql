-- Preview-only tables from lib/schema.ts. The historical migrations do not
-- include the feed's initial schema. Keep all data in the isolated PGlite DB.
CREATE TABLE IF NOT EXISTS feed_posts (
  id text PRIMARY KEY,
  author_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_urls text NOT NULL DEFAULT '[]',
  repost_of_id text,
  like_count integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  repost_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feed_post_likes (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id text NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS feed_post_replies (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
