// src/auth/spotify/schemas.ts
import { z } from "zod";

export const SpotifyTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),       // seconds
  refresh_token: z.string(),
  scope: z.string(),
});

export type SpotifyTokenResponse = z.infer<typeof SpotifyTokenResponseSchema>;

export const SpotifyRefreshResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  scope: z.string(),
  refresh_token: z.string().optional(), // sometimes returned, sometimes not
});

export type SpotifyRefreshResponse = z.infer<typeof SpotifyRefreshResponseSchema>;

export const SpotifyMeSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  email: z.string().email().optional(),
});

export type SpotifyMe = z.infer<typeof SpotifyMeSchema>;