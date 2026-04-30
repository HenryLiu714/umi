import type { Scrobble, TrackMetadata, SpotifyAuth } from "@prisma/client";

export type { Scrobble, TrackMetadata, SpotifyAuth };

export type CreateScrobble = {
    userId: string;
    trackId: string;
    playedAt: Date;
}

export type CreateTrackMetadata = {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl?: string;
};

export type UpsertTrackMetadata = CreateTrackMetadata;

export type SaveSpotifyAuth = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
};

export type ScrobbleFilter = {
  trackId?: string;
  startDate?: Date;
  endDate?: Date;
};