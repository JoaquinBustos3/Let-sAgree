import { PromptInput } from "../models/prompt-input";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { validateAiOutput } from "../utils/validation-ai-output";
import { applyFallbacks } from "../utils/fallbacks-ai-output";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Takes the validated PromptInput and generates 18 Cards based on the selected Category
 * 
 * @param promptInput - The validated input data
 * @returns Object indicating success/failure and 12 generated Cards with all critical fields populated
 */
export async function cardGeneration(category: string, promptInput: any) {

    const promptForAI = `
    Use the fields of this PromptInput object as search filters: "${JSON.stringify(promptInput)}", 
    and use them to generate 18 JSON objects that conform to this TypeScript interface: ${await determineTsInterface(category)}
    Restrictions:
    - Use PromptInput's fields as ordered in importance in finding results for the 18 objects you are populating
    - If location is provided, find results that are relevant to that location (and by any distance away if specified)
    - Ideally, the 18 results should be varied and cover different aspects of the category
    - Each object should be a valid JSON object with the ALL of the fields populated except imageUrl
    - Respond ONLY with the JSON object, no extra text.
    - If a field is less applicable, apply your best judgment to fill it with a reasonable value
    - The imagePrompt field should be a concise description of the result that can be used to generate an image
    - The description field should be a concise summary of the card's content
    `

    try {
        
        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key in environment variables.");
        }
        
        const client = new OpenAI({ apiKey: OPENAI_API_KEY });

        const completion = await client.chat.completions.parse({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that only returns valid JSON." },
                { role: "user", content: promptForAI }
            ]
        });
        
        // Validate the AI's output against the category's card schema
        console.log("Entering validation for card generation with category: ", category);
        const validated = validateAiOutput(completion, category);
        if (!validated.ok) {
            throw new Error(validated.error.message);
        }

        // Ensure we're working with an array 
        const dataToFill = Array.isArray(validated.data) ? validated.data : [validated.data];
        // Filter out cards that have missing values for critical fields
        const filteredCards = applyFallbacks(category, dataToFill);
        // Limit to the first 12 valid cards, out of the 18 possibly returned
        const filledCards = filteredCards.slice(0, 12);
        
        console.log(`Generated ${filledCards.length} cards for category: ${category}`, filledCards);

        return { ok: true, data: filledCards };
        
    } catch (err: any) {
        return { ok: false, error: `Error generating card: ${err.message}` };
    }
}

async function determineTsInterface(category: string): Promise<string> {

    const interfaces: Record<string, string> = {

        "Restaurants": 
            `export interface RestaurantCard {
            name: string;
            description: string;
            cuisine: string;
            priceRange: "$" | "$$" | "$$$";
            vibe: string;
            distance: string;
            location: string;
            rating: number;
            imageUrl?: string;    
            imagePrompt: string;   
            }`,
        "Takeout/Delivery": 
            `export interface DeliveryCard {
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
            }`,
        "Shows": 
            `export interface ShowCard {
            title: string;
            description: string;
            genre: string;
            seasons: number;
            episodeLength: string; // e.g. "30 mins"
            platform: string;
            vibe: string;
            releaseYear: number;
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Movies": 
            `export interface MovieCard {
            title: string;
            description: string;
            genre: string;
            rating: string;
            runtime: string;
            releaseYear: number;
            platform: string; // i.e. Netflix
            vibe: string;
            imageUrl?: string;
            imagePrompt: string;
            }`,
        "Indoor Date Activities": 
            `export interface IndoorDateCard {
            title: string;
            description: string;
            vibe: string;
            cost: string; // e.g. "$", "Low"
            duration: string;
            supplies: string[];
            idealTime: string; // "evening", "late night"
            messLevel: "clean" | "some cleanup" | "very messy";
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Outdoor Date Activities": 
            `export interface OutdoorDateCard {
            title: string;
            description: string;
            vibe: string;
            cost: string;
            distance: string;
            duration: string;
            bestTime: string; // "day", "sunset", etc.
            locationType: string; // "park", "beach", etc.
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Things To Do Nearby": 
            `export interface LocalActivityCard {
            name: string;
            description: string;
            category: string; // "museum", "arcade", etc.
            price: string;
            distance: string;
            rating: number;
            hours: string; // e.g. "10am–8pm"
            vibe: string;
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Weekend Trip Ideas": 
            `export interface WeekendTripCard {
            destination: string;
            description: string;
            travelTime: string; // e.g. "2 hours"
            vibe: string;
            cost: string; // "$$", "$$$"
            mainAttractions: string[];
            season: string;
            lodging: string; // "hotel", "Airbnb"
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Games": 
            `export interface GameCard {
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
            }`

    };

    const foundInterface = interfaces[category] || "";
    if (!foundInterface) {
        throw new Error(`No TypeScript interface found for category: ${category}`);
    }

    return foundInterface
}
