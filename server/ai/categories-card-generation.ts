import { OpenAI } from "openai";
import dotenv from "dotenv";
import { validateAiOutput } from "../utils/validation-ai-output";
import { applyFallbacks } from "../utils/fallbacks-ai-output";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Takes the validated PromptInput and generates 15 Cards based on the selected Category
 * 
 * @param promptInput - The validated input data
 * @returns Object indicating success/failure and 12 generated Cards with all critical fields populated
 */
export async function cardGeneration(category: string, promptInput: any) {

    const compactPromptInput = {
      ...promptInput,
      userInput: null
    };

    const promptForAI = `
    Use the following as search filters: ${JSON.stringify(compactPromptInput)}
    and use them to generate 15 JSON objects that conform to this TypeScript interface: ${await determineTsInterface(category)}
    Restrictions:
    - If location (zip code) is provided (non 0) and the category requires a location, search online using web_search for real results centered around that zip code
    - Ideally, the 15 results should be varied and cover different aspects of the category
    - Each object should be a valid JSON object with the ALL of the fields populated except imageUrl
    - If a field is less applicable, apply your best judgment to fill it with a reasonable value
    - Respond ONLY with the JSON object, no extra text.
    - The imagePrompt field should be a concise description of the result that can be used to generate an image
    - The description field should be a concise summary of the card's content
    `

    try {

        console.log("Prompt generating the cards: ", compactPromptInput);
        
        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key in environment variables.");
        }
        
        const client = new OpenAI({ apiKey: OPENAI_API_KEY });

        // Start timing the OpenAI call used for card generation
        const openAiLabel = `[cardGeneration] OpenAI call for category=${category}`;
        const openAiStart = Date.now();

        const completion = await client.responses.parse({
            model: "gpt-5-mini",
            input: promptForAI,
            tools: [{ type: "web_search_preview" }]
        });

        // Log how long the API call took ( in seconds)
        const openAiDurationSec = ((Date.now() - openAiStart) / 1000).toFixed(2);
        console.log(`${openAiLabel} took ${openAiDurationSec}s`);

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
        // Limit to the first 12 valid cards, out of the 15 possibly returned
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
            distance: string; //e.g. "2 mi"
            location: string;
            rating: number; //e.g. "4.5"
            imageUrl?: string;    
            imagePrompt: string;   
            }`,
        "Takeout-Delivery": 
            `export interface DeliveryCard {
            name: string;
            description: string;
            cuisine: string;
            priceRange: "$" | "$$" | "$$$";
            deliveryTime: string; // e.g. "30–40 mins"
            deliveryPlatform: string; // e.g. "Uber Eats, DoorDash"
            rating: number; //e.g. "4.5"
            distance: string; //e.g. "2 mi"
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Shows": 
            `export interface ShowCard {
            title: string;
            description: string;
            genre: string;
            seasons: number; // e.g. 3
            rating: string; // e.g. "4.5"
            platform: string; // e.g. Netflix, Hulu
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
            rating: string; //e.g. "4.5"
            runtime: string; // e.g. "120 mins"
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
            cost: string; // e.g. "$50-100"
            duration: string; // e.g. "2 hours"
            supplies: string[];
            idealTime: string; // "evening"
            messLevel: "clean" | "some cleanup" | "very messy";
            imagePrompt: string;
            imageUrl?: string;
            }`,
        "Outdoor Date Activities": 
            `export interface OutdoorDateCard {
            title: string;
            description: string;
            vibe: string;
            cost: string; // e.g. "$50-100"
            distance: string; //e.g. "2 mi"
            duration: string; // e.g. "2 hours"
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
            price: string; // e.g. "$50-100"
            distance: string; //e.g. "2 mi"
            rating: number; //e.g. "4.5"
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
            cost: string; // e.g. "$50-100"
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
            playerCount: string; // "2–4"
            averagePlaytime: string; // "30 mins"
            platform?: string; // Playstation, Xbox (if video game)
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
