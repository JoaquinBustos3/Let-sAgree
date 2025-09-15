import { z } from 'zod';

export const showCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  seasons: z.string().nullable(),
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
  title: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  seasons: number; // i.e. "2 Seasons"
  rating: string; // i.e. "8.3 IMDB" (imdb rating)
  releaseYear: number; // i.e. "2023"
  platform: string; // i.e. "Netflix, Hulu, Max"
  genre: string; // i.e. "Drama", "Comedy"
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
}
 */