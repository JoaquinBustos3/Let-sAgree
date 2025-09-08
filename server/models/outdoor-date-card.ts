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
  title: string;
  description: string; // 1-2 sentence description
  cost: string; // i.e. "$50-100"
  duration: string; // i.e. "1-2 Hrs"
  distance: string; // i.e. "5.2 mi"
  location: string; // (short address or general area)
  idealTime: string; // i.e. "Evening", "Late Night"
  vibe: string; // 1-3 comma separated adjectives
  images: string[];
}
 */
