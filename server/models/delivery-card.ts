import { z } from 'zod';

export const deliveryCardSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  priceRange: z.enum(['$', '$$', '$$$']).nullable(),
  rating: z.number().nullable(),
  distance: z.string().nullable(),
  deliveryPlatform: z.string().nullable(),
  cuisine: z.string().nullable(),
  deliveryTime: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type DeliveryCard = z.infer<typeof deliveryCardSchema>;

// JSON Shape of the Model
/**
export interface DeliveryCard {
  name: string;
  description: string; 
  priceRange: "$" | "$$" | "$$$";
  rating: number; // i.e. "4.5"
  distance: string; // i.e. "2 mi"
  deliveryPlatform: string; // i.e. "Uber Eats"
  cuisine: string; // i.e. "Italian", "Chinese"
  deliveryTime: string; // i.e. "30–40 Min"
  imagePrompt: string;
  imageUrl?: string;
}
 */
