const { promptInputSchema } = require("../models/prompt-input.ts");
const fetch = require("node-fetch");

async function preprocessPromptInput(input, category) {
    // Compose the prompt for Mistral AI
    //TODO: Narrow the AI prompt to peform exactly what we want
    const prompt = `
Transform the following user input into a structured JSON object that conforms to this TypeScript Zod schema:

${promptInputSchema.toString()}

User input: "${input}"
Category: "${category}"

Respond ONLY with the JSON object, no extra text.
`;

    let aiResponse;
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

        const data = await response.json();
        aiResponse = data.response;

        // Try to parse the AI's response as JSON
        let parsed;
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

        return { ok: true, data: validated.data };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

module.exports = {
    preprocessPromptInput,
};
