import { z } from 'zod';

export const deliveryCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  cuisine: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  deliveryTime: z.string().nullable(),
  deliveryPlatform: z.string().nullable(),
  rating: z.number().nullable(),
  distance: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export type DeliveryCard = z.infer<typeof deliveryCardSchema>;

// JSON Shape of the Model
/**
export interface DeliveryCard {
  name: string;
  description: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  deliveryTime: string; // e.g. "30–40 mins"
  deliveryPlatform: string; // e.g. "Uber Eats"
  rating: number;
  distance: string;
  imagePrompt: string;
  imageUrl?: string;
}
 */
