import { OpenAI } from "openai";
import dotenv from "dotenv";
import { validateAiOutput } from "../utils/validation-ai-output";
import { applyFallbacks } from "../utils/fallbacks-ai-output";
import { retrieveImages } from "../utils/img-retrieval"; 
import loggerInit from "../logger/index";
import { incrementMetric } from "../utils/db";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const logger = loggerInit("ai/categories-card-generation.ts");

/**
 * Takes the validated PromptInput and generates 8 Cards based on the selected Category and the PromptInput criteria
 * 
 * @param promptInput - The validated input data
 * @returns Object indicating success/failure and 8 generated Cards with all critical fields populated
 */
export async function cardGeneration(category: string, promptInput: any) {

    const compactPromptInput = {
      ...promptInput,
      userInput: null
    };

    const promptForAI = `
    Use the following as search filters: ${JSON.stringify(compactPromptInput)}
    and use them to generate 8 JSON objects that conform to this TypeScript interface: ${await determineTsInterface(category)}
    Restrictions:
    - If location (zip code) is provided (is non 0) and the category requires a location, search online using web_search for real results centered around that zip code
    - Ideally, the 8 results should be varied and cover different aspects of the category
    - Each object should have ALL of the fields populated (except "images" field)
    - If a field is less applicable, apply your best judgment to fill it with a reasonable value
    - The "vibe" field should describe the item plainly (i.e. "restaurant"), then characteristically (i.e. "chinese"), then intangibly (i.e. "low light, romantic")
    - DO NOT include any sources ANYWHERE in the results
    `

    try {

        logger.info(`Prompt generating the cards: ${JSON.stringify(compactPromptInput, null, 2)}`);

        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key in environment variables.");
        }
        
        const client = new OpenAI({ apiKey: OPENAI_API_KEY });

        // Start timing the OpenAI call used for card generation
        const openAiLabel = `OpenAI Card Generation API Call for category=${category}`;
        const openAiStart = Date.now();

        const completion = await client.responses.parse({
            model: "gpt-5-mini",
            input: [
                { role: "system", content: "You are a JSON generator. Respond ONLY with valid JSON arrays. Every field must be a plain string, number, or array — DO NOT include markdown, links, parentheses, or references to sources. All text must be self-contained." },
                { role: "user", content: promptForAI }
            ],
            tools: [{ type: "web_search_preview" }]
        });

        // Log how long the API call took ( in seconds)
        const openAiDurationSec = ((Date.now() - openAiStart) / 1000).toFixed(2);
        logger.info(`${openAiLabel} took ${openAiDurationSec}s`);

        // Validate the AI's output against the category's card schema
        logger.debug("1) Entering validation for card generation with category: ", category);
        const validated = validateAiOutput(completion, category);
        if (!validated.ok) {
            throw new Error(validated.error.message);
        }

        // Ensure we're working with an array 
        const dataToFill = Array.isArray(validated.data) ? validated.data : [validated.data];
        // Filter out cards that have missing values for critical fields
        logger.debug("2) Applying fallbacks");
        const filteredCards = applyFallbacks(category, dataToFill);
        logger.info("Applying fallbacks successful.");

        logger.debug("3) Sanitizing fields");
        //Sanitize fields to remove any lingering sources or unwanted info usually formatted as "( ... )"
        const sanitizedCards = filteredCards.map(item => {
            const entries = Object.entries(item);
            
            const sanitizedEntries = entries.map(([key, value], index) => {
                if (index < 7) {
                    return [key, sanitizeValue(value)];
                }
                return [key, value]; // leave remaining fields unchanged like images
            });

            return Object.fromEntries(sanitizedEntries);
        });
        logger.info("Sanitizing fields successful.");

        logger.debug("4) Retrieving images for the results");
        //Retrieve images for the results
        const cardsWithImages = await retrieveImages(category, sanitizedCards, promptInput.location || 0);
        logger.info("Image retrieval successful.");

        logger.debug("5) Exiting card generation");
        logger.info(`Card Generation successful with ${cardsWithImages.length} cards.`);
        await incrementMetric("card_gen_requests");
        return { ok: true, data: cardsWithImages };

    } catch (err: any) {
        logger.error("Error generating cards: ", err);
        return { ok: false, error: `Error generating card: ${err.message}` };
    }
}

const sanitizeValue = (val: unknown): unknown => {
  if (val && typeof val === "string") {
    return val.split("(")[0]?.trim(); // val is guaranteed to be string here
  }
  return val;
};

async function determineTsInterface(category: string): Promise<string> {

    const interfaces: Record<string, string> = {

        "Restaurants": 
            `export interface RestaurantCard {
            name: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            priceRange: "$" | "$$" | "$$$";
            rating: string; // i.e. "4.5 Rating"
            distance: string; // i.e. "2 mi"
            location: string; // street address
            cuisine: string; // i.e. "Italian", "Mexican"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Delivery": 
            `export interface DeliveryCard {
            name: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            priceRange: "$" | "$$" | "$$$";
            rating: string; // i.e. "4.5 Rating"
            deliveryTime: string; // i.e. "30–40 Min"
            deliveryPlatform: string; // i.e. "Uber Eats"
            cuisine: string; // i.e. "Italian", "Chinese"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            location: string; // street address
            }`,
        "Shows": 
            `export interface ShowCard {
            title: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            seasons: string; // i.e. "2 Seasons"
            rating: string; // i.e. "8.3 IMDB" (imdb rating)
            releaseYear: number; // i.e. "2023"
            platform: string; // i.e. "Netflix, Hulu, Max"
            genre: string; // i.e. "Drama", "Comedy"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Movies": 
            `export interface MovieCard {
            title: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            rating: string; // i.e. "7.5 IMDB" (imdb rating)
            runtime: string; // i.e. "2h 30m"
            releaseYear: number; // i.e. "2023"
            platform: string; // i.e. "Netflix, Hulu, Max"
            genre: string; // i.e. "Action", "Comedy"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Indoor Date Activities": 
            `export interface IndoorDateCard {
            title: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            cost: string; // i.e. "$50-100"
            duration: string; // i.e. "1-2 Hrs"
            idealTime: string; // i.e. "Evening", "Late Night"
            supplies: string; // i.e. "Chocolate, Strawberries, Candles" (limit to 5 items)
            messLevel: "Clean" | "Some Cleanup" | "Very Messy";
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Outdoor Date Activities": 
            `export interface OutdoorDateCard {
            title: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            cost: string; // i.e. "$50-100"
            duration: string; // i.e. "1-2 Hrs"
            distance: string; // i.e. "5.2 mi"
            location: string; // street address
            idealTime: string; // i.e. "Evening", "Late Night"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Things To Do Nearby": 
            `export interface LocalActivityCard {
            name: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            price: string; // i.e. "$50-100"
            rating: string; // i.e. "4.5 Rating"
            distance: string; // i.e. "2 mi"
            location: string; // street address
            hours: string; // i.e. "10am–8pm"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Weekend Trip Ideas": 
            `export interface WeekendTripCard {
            destination: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            cost: string; // i.e. "$500-1000"
            distance: string; // i.e. "100 mi"
            lodging: string; // i.e. "Hotel", "Airbnb"
            mainAttractions: string; // i.e. "Roller Coasters, Water Rides"
            season: string; // i.e. "Summer", "Winter"
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`,
        "Games": 
            `export interface GameCard {
            title: string; // strictly the name
            description: string; // short and concise 1-2 sentence description
            playerCount: string; // i.e. "2–4 Players", "1 Player"
            averagePlaytime: string; // i.e. "8 Hrs", "30 Min"
            type: "Board Game" | "Video Game" | "Card Game";
            platform: string; // i.e. "PS5, Xbox, PC" (if video game)
            difficulty: "Easy" | "Medium" | "Hard";
            vibe: string; // 2 nouns and 2 key adjectives (2 tangible and 2 intangible) derived from description and title, comma separated
            images: string[];
            }`

    };

    const foundInterface = interfaces[category] || "";
    if (!foundInterface) {
        throw new Error(`No TypeScript interface found for category: ${category}`);
    }

    return foundInterface
}
