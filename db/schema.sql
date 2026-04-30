CREATE TABLE IF NOT EXISTS users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email     TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spotify_auth (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  scope           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON spotify_auth (user_id);

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

CREATE TABLE IF NOT EXISTS scrobbles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES track_metadata(id),
  played_at   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON scrobbles (user_id);
CREATE INDEX ON scrobbles (track_id);