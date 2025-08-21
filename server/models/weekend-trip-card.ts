import { z } from 'zod';

export const weekendTripCardSchema = z.object({
  destination: z.string().nullable(),
  description: z.string().nullable(),
  travelTime: z.string().nullable(),
  vibe: z.string().nullable(),
  cost: z.string().nullable(),
  mainAttractions: z.array(z.string()).nullable(),
  season: z.string().nullable(),
  lodging: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type WeekendTripCard = z.infer<typeof weekendTripCardSchema>;

// JSON Shape of the Model
/**
export interface WeekendTripCard {
  destination: string;
  description: string;
  travelTime: string; // e.g. "2 hours"
  vibe: string;
  cost: string; // "$$", "$$$"
  mainAttractions: string[];
  season: string;
  lodging: string; // "hotel", "Airbnb"
  imagePrompt: string;
  imageUrl?: string;
}
 */
