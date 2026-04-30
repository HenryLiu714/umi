
import type { Result } from "../../lib/result.js";
import type { CreateTrackMetadata, TrackMetadata, UpsertTrackMetadata } from "../../types/scrobbles/types.js";

export interface TrackMetadataRepository {
    upsertBySpotifyId(metadata: UpsertTrackMetadata): Promise<Result<TrackMetadata, Error>>;
    getBySpotifyId(spotifyId: string): Promise<Result<TrackMetadata | null, Error>>;
    getById(id: string): Promise<Result<TrackMetadata | null, Error>>;

    // Should return a list of track metadata in the same order as the input IDs. If a track is not found, it should be null in the corresponding position.
    getByIds(ids: string[]): Promise<Result<(TrackMetadata | null)[], Error>>;
}