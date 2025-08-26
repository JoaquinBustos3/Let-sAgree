import { z } from 'zod';

export const showCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  genre: z.string().nullable(),
  seasons: z.number().nullable(),
  rating: z.string().nullable(),
  platform: z.string().nullable(),
  vibe: z.string().nullable(),
  releaseYear: z.number().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type ShowCard = z.infer<typeof showCardSchema>;

// JSON Shape of the Model
/**
export interface ShowCard {
  title: string;
  description: string;
  genre: string;
  seasons: number;
  rating: string; // e.g. "4.5"
  platform: string;
  vibe: string;
  releaseYear: number;
  imagePrompt: string;
  imageUrl?: string;
}
 */