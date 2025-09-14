import { z } from 'zod';

//This schema has an extra field (+1 field, location) compared to all the other models

export const deliveryCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  rating: z.string().nullable(),
  deliveryTime: z.string().nullable(),
  deliveryPlatform: z.string().nullable(),
  cuisine: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  location: z.string().nullable()
});

export type DeliveryCard = z.infer<typeof deliveryCardSchema>;

// JSON Shape of the Model
/**
export interface DeliveryCard {
  name: string; // strictly the name
  description: string; // short and concise 1-2 sentence description
  priceRange: "$" | "$$" | "$$$";
  rating: string; // i.e. "4.5 Rating"
  deliveryTime: string; // i.e. "30–40 Min"
  deliveryPlatform: string; // i.e. "Uber Eats"
  cuisine: string; // i.e. "Italian", "Chinese"
  vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
  images: string[];
  location: string; // street address
}
 */
