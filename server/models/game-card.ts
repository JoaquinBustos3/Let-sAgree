import { z } from 'zod';

export const gameCardSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  playerCount: z.string().nullable(),
  averagePlaytime: z.string().nullable(),
  type: z.enum(['Board Game', 'Video Game', 'Card Game']),
  platform: z.string().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).nullable(),
  vibe: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type GameCard = z.infer<typeof gameCardSchema>;

// JSON Shape of the Model
/**
export interface GameCard {
  title: string;
  description: string;
  playerCount: string; // i.e. "2–4 Players", "1 Player"
  averagePlaytime: string; // i.e. "8 Hrs", "30 Min"
  type: "Board Game" | "Video Game" | "Card Game";
  platform?: string; // i.e. "PS5, Xbox, PC" (if video game)
  difficulty: "Easy" | "Medium" | "Hard";
  vibe: string;
  imagePrompt: string;
  imageUrl?: string;
}
 */
