import { z } from 'zod';

export const indoorDateCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  vibe: z.string().nullable(),
  cost: z.string().nullable(),
  duration: z.string().nullable(),
  supplies: z.array(z.string()).nullable(),
  idealTime: z.string().nullable(),
  messLevel: z.enum(['clean', 'some cleanup', 'very messy']).nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type IndoorDateCard = z.infer<typeof indoorDateCardSchema>;

// JSON Shape of the Model
/**
export interface IndoorDateCard {
  title: string;
  description: string;
  vibe: string;
  cost: string; // e.g. "$", "Low"
  duration: string;
  supplies: string[];
  idealTime: string; // "evening", "late night"
  messLevel: "clean" | "some cleanup" | "very messy";
  imagePrompt: string;
  imageUrl?: string;
}
 */
