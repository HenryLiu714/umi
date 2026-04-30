import type { Result } from "../../lib/result.js";
import type { CreateScrobble, CreateTrackMetadata, Scrobble, ScrobbleFilter, ScrobbleWithTrack, TrackMetadata } from "../../types/scrobbles/types.js";

export interface ScrobbleRepository {
    // Adding scrobbbles
    add(scrobble: CreateScrobble): Promise<Result<Scrobble, Error>>;
    addMany(scrobbles: CreateScrobble[]): Promise<Result<Scrobble[], Error>>;
    getByUserId(userId: string, filter?: ScrobbleFilter): Promise<Result<ScrobbleWithTrack[], Error>>;
    getById(id: string): Promise<Result<ScrobbleWithTrack | null, Error>>;
}