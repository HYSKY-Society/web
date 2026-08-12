ALTER TABLE press_posts
  ADD COLUMN IF NOT EXISTS image_alt_text text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE press_posts ALTER COLUMN author SET DEFAULT 'HySky News';
