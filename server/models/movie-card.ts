import { z } from 'zod';

export const movieCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  rating: z.string().nullable(),
  runtime: z.string().nullable(),
  releaseYear: z.number().nullable(),
  platform: z.string().nullable(),
  genre: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type MovieCard = z.infer<typeof movieCardSchema>;

// JSON Shape of the Model
/**
export interface MovieCard {
  title: string;
  description: string; // 1-2 sentence description
  rating: string; // i.e. "7.5 IMDB" (imdb rating)
  runtime: string; // i.e. "2h 30m"
  releaseYear: number; // i.e. "2023"
  platform: string; // i.e. "Netflix, Hulu, Max"
  genre: string; // i.e. "Action", "Comedy"
  vibe: string; // 1-3 comma separated key adjectives (tangible and intangible)
  images: string[];
}
 */
