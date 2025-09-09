import { z } from 'zod';

export const deliveryCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  rating: z.number().nullable(),
  deliveryTime: z.string().nullable(),
  deliveryPlatform: z.string().nullable(),
  cuisine: z.string().nullable(),
  vibe: z.string().nullable(),
  images: z.array(z.string()).nullable()
});

export type DeliveryCard = z.infer<typeof deliveryCardSchema>;

// JSON Shape of the Model
/**
export interface DeliveryCard {
  name: string;
  description: string; // 1-2 sentence description
  priceRange: "$" | "$$" | "$$$";
  rating: number; // i.e. "4.5"
  deliveryTime: string; // i.e. "30–40 Min"
  deliveryPlatform: string; // i.e. "Uber Eats"
  cuisine: string; // i.e. "Italian", "Chinese"
  vibe: string; // 1-3 comma separated key adjectives (tangible and intangible)
  images: string[];
}
 */
