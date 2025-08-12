import { z } from "zod";

export const promptInputSchema = z.object({
  category: z.enum([
    "Restaurants",
    "Takeout/Delivery",
    "Shows",
    "Movies",
    "Indoor Date Activites",
    "Outdoor Date Activities, Things To Do Nearby",
    "Weekend Trip Ideas",
    "Games"
  ]),
  filters: z.intersection(
    z.object({
      priceRange: z.string().optional(),
      vibe: z.string().optional(),
      location: z.string().optional(),
    }),
    z.record(z.string(), z.string().optional()) // allows any other string keys with optional string values
  ),
});

// Optional: infer the validated TS type
export type PromptInput = z.infer<typeof promptInputSchema>;

// JSON Shape of the Model
/**
export interface PromptInput {
    category: "Restaurants" | "Takeout/Delivery" | "Shows" | "Movies" | "Indoor Date Activites" |
        "Outdoor Date Activities, Things To Do Nearby" | "Weekend Trip Ideas" | "Games";
    filters: {
        priceRange?: string;
        vibe?: string;
        location?: string;
        [key: string]: string | undefined;
    };
}
 */
