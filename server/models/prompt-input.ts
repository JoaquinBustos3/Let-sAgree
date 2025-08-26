import { z } from "zod";

export const promptInputSchema = z.object({
  category: z.enum([
    "Restaurants",
    "Takeout-Delivery",
    "Shows",
    "Movies",
    "Indoor Date Activities",
    "Outdoor Date Activities",
    "Things To Do Nearby",
    "Weekend Trip Ideas",
    "Games",
  ]),

  // Summarized user input
  condensedInput: z.string().min(1).trim(),

  // Common filters across all categories
  priceRange: z.enum(["$", "$$", "$$$"]).nullable().transform((val) => val ?? undefined).default("$"), 
  // If null is passed, turn it into undefined so defaults can be applied
  vibe: z.string().nullable().transform((val) => val ?? undefined).default("casual"),
  location: z.number().nullable().transform((val) => val ?? undefined).default(0),
  groupSize: z.number().nullable().transform((val) => val ?? undefined).default(2),

  // Raw user input before transformation
  userInput: z.string().min(1).trim(),
});

export type PromptInput = z.infer<typeof promptInputSchema>;

// JSON Shape of the Model
/**
  export interface PromptInput {
  category:
    | "Restaurants"
    | "Takeout/Delivery"
    | "Shows"
    | "Movies"
    | "Indoor Date Activities"
    | "Outdoor Date Activities"
    | "Things To Do Nearby"
    | "Weekend Trip Ideas"
    | "Games"; 

  condensedInput: string; 
  priceRange: "$" | "$$" | "$$$"; 
  vibe: string; 
  location: number;
  groupSize: number; 
  userInput: string; 
  }
*/
