import { Ok } from "../lib/result.js";
import type { Err, Result } from "../lib/result.js";
import type { Listen } from "../types/songs/schemas.js";

export interface ISongRepository {
    getListensByUser(userId: string, startDate: Date, endDate: Date): Promise<Result<Listen[], Error>>;
    addListen(listen: Listen): Promise<Result<void, Error>>;
    addListens(listens: Listen[]): Promise<Result<void, Error>>;
}

export class InMemorySongRepository implements ISongRepository {
    private listens: Listen[] = [];

    async getListensByUser(userId: string, startDate: Date, endDate: Date): Promise<Result<Listen[], Error>> {
        const filtered = this.listens.filter(
            (l) => l.userId === userId && l.listenedAt >= startDate && l.listenedAt <= endDate
        );
        return Ok(filtered);
    }

    async addListen(listen: Listen): Promise<Result<void, Error>> {
        this.listens.push(listen);
        return Ok(undefined);
    }

    async addListens(listens: Listen[]): Promise<Result<void, Error>> {
        this.listens.push(...listens);
        return Ok(undefined);
    }
}