import { z } from 'zod';

export const outdoorDateCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  vibe: z.string().nullable(),
  cost: z.string().nullable(),
  distance: z.string().nullable(),
  duration: z.string().nullable(),
  bestTime: z.string().nullable(),
  locationType: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type OutdoorDateCard = z.infer<typeof outdoorDateCardSchema>;

// JSON Shape of the Model
/**
export interface OutdoorDateCard {
  title: string;
  description: string;
  vibe: string;
  cost: string;
  distance: string;
  duration: string;
  bestTime: string; // "day", "sunset", etc.
  locationType: string; // "park", "beach", etc.
  imagePrompt: string;
  imageUrl?: string;
}
 */
