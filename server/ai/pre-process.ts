import { promptInputSchema } from "../models/prompt-input";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { z } from "zod";
import { cardGeneration } from "./categories-card-generation";

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
 * @returns A promise resolving to an object containing either generated cards (ok: true)
 *          or an error message (ok: false) if processing failed
 */
export async function preprocessPromptInput(input: string, category: string) {

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
  location: string;
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
User input: "${input}"
Category: "${category}"
`;

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
        

        // Extract and check for the AI's text response
        const aiResponse = completion.choices?.[0]?.message?.content;
        if (!aiResponse) {
            throw new Error("No response from OpenAI.");
        }

        // Check for refusal in the message object
        const messageObj = completion.choices?.[0]?.message as any;
        if (messageObj && messageObj.refusal) {
            console.log("AI refusal:", messageObj.refusal);
            return { ok: false, error: messageObj.refusal };
        }

        // Try to parse the AI's response as JSON
        let parsed: unknown;
        try {
            parsed = typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;
        } catch (err) {
            throw new Error("AI response is not valid JSON.");
        }

        // Validate with Zod
        const validated = promptInputSchema.safeParse(parsed);
        if (!validated.success) {
            throw new Error(
                "AI output did not conform to the PromptInput schema: " +
                JSON.stringify(validated.error.issues)
            );
        }

        console.log("AI response:", validated.data);
        
        // push results downstream to generate the Category's Cards
        return cardGeneration(category, validated.data);
    } catch (err: any) {
        return { ok: false, error: err.message };
    }
}
