import { z } from 'zod';

export const localActivityCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  price: z.string().nullable(),
  rating: z.number().nullable(),
  distance: z.string().nullable(),
  location: z.string().nullable(),
  hours: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type LocalActivityCard = z.infer<typeof localActivityCardSchema>;

// JSON Shape of the Model
/**
export interface LocalActivityCard {
  name: string;
  description: string; // 1-2 sentence description
  price: string; // i.e. "$50-100"
  rating: number; // i.e. "4.5"
  distance: string; // i.e. "2 mi"
  location: string; // (short address or general area)
  hours: string; // i.e. "10am–8pm"
  vibe: string; // 1-3 comma separated key adjectives (tangible and intangible)
  images: string[];
}
 */
