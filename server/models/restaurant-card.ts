import { z } from 'zod';

export const restaurantCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  cuisine: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  vibe: z.string().nullable(),
  distance: z.string().nullable(),
  location: z.string().nullable(),
  rating: z.number().nullable(),
  imageUrl: z.string().optional().nullable(),
  imagePrompt: z.string().nullable()
});

export type RestaurantCard = z.infer<typeof restaurantCardSchema>;

// JSON Shape of the Model
/**
export interface RestaurantCard {
  name: string;
  description: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  vibe: string;
  distance: string;
  location: string;
  rating: number;
  imageUrl?: string;      // Result of AI generation
  imagePrompt: string;    // Prompt to generate image
}
 */
