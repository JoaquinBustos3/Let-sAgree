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
 * @returns Object indicating success/failure and 8 generated Cards with all critical fields populated
 */
export async function cardGeneration(category: string, promptInput: any) {

    const compactPromptInput = {
      ...promptInput,
      userInput: null,
      category: ""
    };

    const promptForAI = `
    Use the following as search filters: ${JSON.stringify(compactPromptInput)}
    and use them to generate 8 JSON objects that conform to this TypeScript interface: ${await determineTsInterface(category)}
    Restrictions:
    - If location (zip code) is provided (is non 0) and the category requires a location, search online using web_search for real results centered around that zip code
    - Ideally, the 8 results should be varied and cover different aspects of the category
    - Each object should have ALL of the fields populated (except "images" field)
    - If a field is less applicable, apply your best judgment to fill it with a reasonable value
    - Do not include any sources anywhere
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
            input: [
                { role: "system", content: "You are a JSON generator. Respond ONLY with valid JSON objects. Do not include extra text." },
                { role: "user", content: promptForAI }
            ],
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

        console.log("Applying fallbacks");
        const filteredCards = applyFallbacks(category, dataToFill);

        console.log("Done")
        return { ok: true, data: filteredCards };
        
    } catch (err: any) {
        return { ok: false, error: `Error generating card: ${err.message}` };
    }
}

async function determineTsInterface(category: string): Promise<string> {

    const interfaces: Record<string, string> = {

        "Restaurants": 
            `export interface RestaurantCard {
            name: string;
            description: string; // 1-2 sentence description
            priceRange: "$" | "$$" | "$$$";
            rating: number; // i.e. "4.5"
            distance: string; // i.e. "2 mi"
            location: string; // (short address of general area)
            cuisine: string; // i.e. "Italian", "Mexican"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Takeout-Delivery": 
            `export interface DeliveryCard {
            name: string;
            description: string; // 1-2 sentence description
            priceRange: "$" | "$$" | "$$$";
            rating: number; // i.e. "4.5"
            distance: string; // i.e. "2 mi"
            deliveryPlatform: string; // i.e. "Uber Eats"
            cuisine: string; // i.e. "Italian", "Chinese"
            deliveryTime: string; // i.e. "30–40 Min"
            images: string[];
            }`,
        "Shows": 
            `export interface ShowCard {
            title: string;
            description: string; // 1-2 sentence description
            seasons: number; // i.e. "2 Seasons"
            rating: string; // i.e. "8.3 IMDB" (imdb rating)
            releaseYear: number; // i.e. "2023"
            platform: string; // i.e. "Netflix, Hulu, Max"
            genre: string; // i.e. "Drama", "Comedy"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Movies": 
            `export interface MovieCard {
            title: string;
            description: string; // 1-2 sentence description
            rating: string; // i.e. "7.5 IMDB" (imdb rating)
            runtime: string; // i.e. "2h 30m"
            releaseYear: number; // i.e. "2023"
            platform: string; // i.e. "Netflix, Hulu, Max"
            genre: string; // i.e. "Action", "Comedy"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Indoor Date Activities": 
            `export interface IndoorDateCard {
            title: string;
            description: string; // 1-2 sentence description
            cost: string; // i.e. "$50-100"
            duration: string; // i.e. "1-2 Hrs"
            idealTime: string; // i.e. "Evening", "Late Night"
            supplies: string; // i.e. "Chocolate, Strawberries, Candles" (limit to 5 items)
            messLevel: "Clean" | "Some Cleanup" | "Very Messy";
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Outdoor Date Activities": 
            `export interface OutdoorDateCard {
            title: string;
            description: string; // 1-2 sentence description
            cost: string; // i.e. "$50-100"
            duration: string; // i.e. "1-2 Hrs"
            distance: string; // i.e. "5.2 mi"
            location: string; // (short address or general area)
            idealTime: string; // i.e. "Evening", "Late Night"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Things To Do Nearby": 
            `export interface LocalActivityCard {
            name: string;
            description: string; // 1-2 sentence description
            price: string; // i.e. "$50-100"
            rating: number; // i.e. "4.5"
            distance: string; // i.e. "2 mi"
            location: string; // (short address or general area)
            hours: string; // i.e. "10am–8pm"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Weekend Trip Ideas": 
            `export interface WeekendTripCard {
            destination: string;
            description: string; // 1-2 sentence description
            cost: string; // i.e. "$500-1000"
            distance: string; // i.e. "100 mi"
            lodging: string; // i.e. "Hotel", "Airbnb"
            mainAttractions: string; // i.e. "Roller Coasters, Water Rides"
            season: string; // i.e. "Summer", "Winter"
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`,
        "Games": 
            `export interface GameCard {
            title: string;
            description: string; // 1-2 sentence description
            playerCount: string; // i.e. "2–4 Players", "1 Player"
            averagePlaytime: string; // i.e. "8 Hrs", "30 Min"
            type: "Board Game" | "Video Game" | "Card Game";
            platform?: string; // i.e. "PS5, Xbox, PC" (if video game)
            difficulty: "Easy" | "Medium" | "Hard";
            vibe: string; // 1-3 comma separated adjectives
            images: string[];
            }`

    };

    const foundInterface = interfaces[category] || "";
    if (!foundInterface) {
        throw new Error(`No TypeScript interface found for category: ${category}`);
    }

    return foundInterface
}
