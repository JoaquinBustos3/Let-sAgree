import { z } from 'zod';

export const showCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  seasons: z.number().nullable(),
  rating: z.string().nullable(),
  releaseYear: z.number().nullable(),
  platform: z.string().nullable(),
  genre: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type ShowCard = z.infer<typeof showCardSchema>;

// JSON Shape of the Model
/**
export interface ShowCard {
  title: string;
  description: string; // 1-2 sentence description
  seasons: number; // i.e. "2 Seasons"
  rating: string; // i.e. "8.3 IMDB" (imdb rating)
  releaseYear: number; // i.e. "2023"
  platform: string; // i.e. "Netflix, Hulu, Max"
  genre: string; // i.e. "Drama", "Comedy"
  vibe: string; // 1-3 comma separated adjectives
  images: string[];
}
 */