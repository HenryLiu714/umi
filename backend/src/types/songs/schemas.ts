import { z } from 'zod';

const ListenSchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    userId: z.string(),
    songId: z.string(),
    listenedAt: z.date(),
    artist: z.string(),
    album: z.string(),
})

export type Listen = z.infer<typeof ListenSchema>;

