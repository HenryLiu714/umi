CREATE TABLE IF NOT EXISTS scrobbles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES track_metadata(id),
  played_at   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON scrobbles (user_id);
CREATE INDEX ON scrobbles (track_id);