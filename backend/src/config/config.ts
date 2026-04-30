import { z } from 'zod';

const ConfigSchema = z.object({
    DATABASE_URL: z.string().url(),
});

const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid configuration:', parsed.error.format());
    process.exit(1);
}

export const config = parsed.data;
