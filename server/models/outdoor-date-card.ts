import { z } from 'zod';

export const outdoorDateCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  cost: z.string().nullable(),
  duration: z.string().nullable(),
  distance: z.string().nullable(),
  location: z.string().nullable(),
  idealTime: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type OutdoorDateCard = z.infer<typeof outdoorDateCardSchema>;

// JSON Shape of the Model
/**
export interface OutdoorDateCard {
  title: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  cost: string; // i.e. "$50-100"
  duration: string; // i.e. "1-2 Hrs"
  distance: string; // i.e. "5.2 mi"
  location: string; // street address
  idealTime: string; // i.e. "Evening", "Late Night"
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
}
 */
