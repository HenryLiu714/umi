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