import { z } from 'zod';

export const weekendTripCardSchema = z.object({
  destination: z.string().nullable(),
  description: z.string().nullable(),
  cost: z.string().nullable(),
  distance: z.string().nullable(),
  lodging: z.string().nullable(),
  mainAttractions: z.string().nullable(),
  season: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type WeekendTripCard = z.infer<typeof weekendTripCardSchema>;

// JSON Shape of the Model
/**
export interface WeekendTripCard {
  destination: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  cost: string; // i.e. "$500-1000"
  distance: string; // i.e. "100 mi"
  lodging: string; // i.e. "Hotel", "Airbnb"
  mainAttractions: string; // i.e. "Roller Coasters, Water Rides"
  season: string; // i.e. "Summer", "Winter"
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
}
 */
