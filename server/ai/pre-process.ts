import { promptInputSchema } from "../models/prompt-input";
import fetch from "node-fetch"; // If using Node.js <18; for Node.js 18+, you can remove this line and use global fetch

export async function preprocessPromptInput(input: string, category: string) {
    // Compose the prompt for Mistral AI
    //TODO: Narrow the AI prompt to perform exactly what we want
    const prompt = `
Transform the following user input into a structured JSON object that conforms to this TypeScript Zod schema:

${promptInputSchema.toString()}

User input: "${input}"
Category: "${category}"

Respond ONLY with the JSON object, no extra text.
`;

    let aiResponse: string;
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt,
                max_tokens: 300,
                temperature: 0.3,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
        }

        // Explicitly type the response as any to avoid TS error
        const data: any = await response.json();
        aiResponse = data.response;

        // Try to parse the AI's response as JSON
        let parsed: unknown;
        try {
            parsed = JSON.parse(aiResponse);
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
