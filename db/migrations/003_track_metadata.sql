CREATE TABLE IF NOT EXISTS track_metadata (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id   TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  artist       TEXT NOT NULL,
  album        TEXT NOT NULL,
  duration_ms  INTEGER NOT NULL,
  artwork_url  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);