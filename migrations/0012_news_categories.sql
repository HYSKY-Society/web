ALTER TABLE press_posts
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'News Analysis';

UPDATE press_posts
SET category = 'Standards Watch'
WHERE slug = 'the-companies-quietly-writing-hydrogen-aviations-rulebook';
