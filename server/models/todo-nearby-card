import { z } from 'zod';

export const localActivityCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  price: z.string().nullable(),
  distance: z.string().nullable(),
  rating: z.number().nullable(),
  hours: z.string().nullable(),
  vibe: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export type LocalActivityCard = z.infer<typeof localActivityCardSchema>;

// JSON Shape of the Model
/**
export interface LocalActivityCard {
  name: string;
  description: string;
  category: string; // "museum", "arcade", etc.
  price: string;
  distance: string;
  rating: number;
  hours: string; // e.g. "10am–8pm"
  vibe: string;
  imagePrompt: string;
  imageUrl?: string;
}
 */
