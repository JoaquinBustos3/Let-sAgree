import { z } from 'zod';

export const indoorDateCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  cost: z.string().nullable(),
  duration: z.string().nullable(),
  idealTime: z.string().nullable(),
  supplies: z.string().nullable(),
  messLevel: z.enum(['Clean', 'Some Cleanup', 'Very Messy']).nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type IndoorDateCard = z.infer<typeof indoorDateCardSchema>;

// JSON Shape of the Model
/**
export interface IndoorDateCard {
  title: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  cost: string; // i.e. "$50-100"
  duration: string; // i.e. "1-2 Hrs"
  idealTime: string; // i.e. "Evening", "Late Night"
  supplies: string; // i.e. "Chocolate, Strawberries, Candles" (limit to 5 items)
  messLevel: "Clean" | "Some Cleanup" | "Very Messy";
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
}
 */
