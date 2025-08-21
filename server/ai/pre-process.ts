import dotenv from "dotenv";
import { OpenAI } from "openai";
import { cardGeneration } from "./categories-card-generation";
import { validateAiOutput } from "../utils/validation-ai-output";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Preprocesses user input with AI to structure it according to the prompt schema
 * 
 * This function takes raw user input and uses OpenAI to transform it into a structured
 * format that conforms to our PromptInput schema. 
 * 
 * @param input - The raw text input from the user describing their preferences
 * @param category - The selected category (e.g., "Restaurants", "Movies") to contextualize the input
 * @param location - An optional location object containing latitude and longitude
 * @returns A promise resolving to an object containing either generated cards (ok: true)
 *          or an error message (ok: false) if processing failed
 */
export async function preprocessPromptInput(input: string, category: string, location: number) {

// Hard coded JSON object for the prompt input
const promptJsonModel = 
`export interface PromptInput {
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
  location: number;
  groupSize: number; 
  vibe: string; 

  userInput: string; 
  }`;

const promptForAI = `
Map the following user input into a structured JSON object that conforms to this TypeScript interface:
${promptJsonModel}
Instructions: 
- Respond ONLY with the JSON object, no extra text.
- For fields with restricted values (enums), use only the allowed values.
- If there is no corresponding value for a field, use null as the value.
- Populate the condensedInput field with a concise sentence extracting key info from the user input.
- Take the longitude and latitude values from the location object (if non 0), and use them to fill the location's fields.
User input: "${input}"
Category: "${category}"
Location: "${location}"
`;

    try {

        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key in environment variables.");
        }

        const client = new OpenAI({ apiKey: OPENAI_API_KEY });

        const completion = await client.responses.parse({
            model: "gpt-5-mini", 
            input: promptForAI
        });
        
        // Validate the AI's output against the PromptInput schema using Zod (avoids hallucinations)
        const validated = validateAiOutput(completion, "Prompt Input");
        if (!validated.ok) {
            throw new Error(validated.error.message);
        }

        // push results downstream to generate the Category's Cards
        const result = await cardGeneration(category, validated.data);
        if (!result.ok) {
            throw new Error(result.error);
        }
        
        // Return only the data portion
        return { ok: true, data: result.data };

    } catch (err: any) {
        return { ok: false, error: err.message };
    }
}
