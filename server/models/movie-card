import { z } from 'zod';

export const movieCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  genre: z.string().nullable(),
  rating: z.string().nullable(),
  runtime: z.string().nullable(),
  releaseYear: z.number().nullable(),
  platform: z.string().nullable(),
  vibe: z.string().nullable(),
  imageUrl: z.string().nullable(),
  imagePrompt: z.string().nullable(),
});

export type MovieCard = z.infer<typeof movieCardSchema>;

// JSON Shape of the Model
/**
export interface MovieCard {
  title: string;
  description: string;
  genre: string;
  rating: string;
  runtime: string;
  releaseYear: number;
  platform: string; // i.e. Netflix
  vibe: string;
  imageUrl?: string;
  imagePrompt: string;
}
 */
