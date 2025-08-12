import { promptInputSchema } from "../models/prompt-input";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function preprocessPromptInput(input: string, category: string) {

 const simpleSchema = z.object({
  answer: z.string(),
});

const promptJson = `export interface PromptInput {
    category: "Restaurants" | "Takeout/Delivery" | "Shows" | "Movies" | "Indoor Date Activites" |
        "Outdoor Date Activities, Things To Do Nearby" | "Weekend Trip Ideas" | "Games";
    filters: {
        priceRange?: string;
        vibe?: string;
        location?: string;
        [key: string]: string | undefined;
    };
}`;

const prompt = `
Transform the following user input into a structured JSON object that conforms to this TypeScript interface:
${promptJson}

User input: "${input}"
Category: "${category}"

Respond ONLY with the JSON object, no extra text.
`;

    try {
        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key in environment variables.");
        }

        const client = new OpenAI({ apiKey: OPENAI_API_KEY });

        const completion = await client.chat.completions.parse({
            model: "gpt-4o-mini", // Use a model that supports structured output and refusals
            messages: [
                { role: "system", content: "You are a helpful assistant that only returns valid JSON." },
                { role: "user", content: prompt }
            ],
            // response_format: zodResponseFormat(promptInputSchema, "prompt_input")
            response_format: zodResponseFormat(simpleSchema, "simple_response"),
            //TODO 
        });
        

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
        return { ok: true, data: validated.data };
    } catch (err: any) {
        return { ok: false, error: err.message };
    }
}
