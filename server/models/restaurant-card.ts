import { z } from 'zod';

export const restaurantCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  rating: z.number().nullable(),
  distance: z.string().nullable(),
  location: z.string().nullable(),
  cuisine: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type RestaurantCard = z.infer<typeof restaurantCardSchema>;

// JSON Shape of the Model
/**
export interface RestaurantCard {
  name: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  priceRange: "$" | "$$" | "$$$";
  rating: number; // i.e. "4.5"
  distance: string; // i.e. "2 mi"
  location: string; // street address
  cuisine: string; // i.e. "Italian", "Mexican"
  vibe: string; // 1 noun and 3 key adjectives (2 tangible and 1 intangible) derived from description and title, comma separated
  images: string[];
}
 */
