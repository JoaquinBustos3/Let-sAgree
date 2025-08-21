import { z } from 'zod';

export const gameCardSchema = z.object({
  title: z.string().nullable(),
  type: z.enum(['board', 'video', 'card']),
  description: z.string().nullable(),
  vibe: z.string().nullable(),
  playerCount: z.string().nullable(),
  averagePlaytime: z.string().nullable(),
  platform: z.string().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']).nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type GameCard = z.infer<typeof gameCardSchema>;

// JSON Shape of the Model
/**
export interface GameCard {
  title: string;
  type: "board" | "video" | "card";
  description: string;
  vibe: string;
  playerCount: string; // "2–4", "Multiplayer"
  averagePlaytime: string; // "30 mins"
  platform?: string; // if video game
  difficulty: "easy" | "medium" | "hard";
  imagePrompt: string;
  imageUrl?: string;
}
 */
