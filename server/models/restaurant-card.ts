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
  name: string;
  description: string; // 1-2 sentence description
  priceRange: "$" | "$$" | "$$$";
  rating: number; // i.e. "4.5"
  distance: string; // i.e. "2 mi"
  location: string; // (short address of general area)
  cuisine: string; // i.e. "Italian", "Mexican"
  vibe: string; // 1-3 comma separated adjectives
  images: string[];
}
 */
