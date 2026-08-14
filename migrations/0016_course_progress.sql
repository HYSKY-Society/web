-- Persist sequential lesson completion for paid courses.
CREATE TABLE IF NOT EXISTS course_lesson_progress (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug  TEXT NOT NULL,
  lesson_id    TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_slug, lesson_id)
);

CREATE INDEX IF NOT EXISTS course_lesson_progress_lookup_idx
  ON course_lesson_progress (user_id, course_slug, completed_at);
