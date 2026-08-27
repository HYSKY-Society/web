CREATE TABLE IF NOT EXISTS pending_direct_messages (
  id text PRIMARY KEY,
  from_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_direct_messages_recipient_idx
  ON pending_direct_messages (to_email, created_at);
