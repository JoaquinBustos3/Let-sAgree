import { z } from 'zod';

export const restaurantCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  rating: z.string().nullable(),
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
  rating: string; // i.e. "4.5 Rating"
  distance: string; // i.e. "2 mi"
  location: string; // street address
  cuisine: string; // i.e. "Italian", "Mexican"
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
}
 */
