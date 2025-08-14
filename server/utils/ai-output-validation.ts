import { z } from "zod";
import { promptInputSchema } from "../models/prompt-input";
import { restaurantCardSchema } from "../models/restaurant-card";
import { deliveryCardSchema } from "../models/delivery-card"
import { showCardSchema } from "../models/show-card"
import { movieCardSchema } from "../models/movie-card";
import { indoorDateCardSchema } from "../models/indoor-date-card";
import { outdoorDateCardSchema } from "../models/outdoor-date-card";
import { localActivityCardSchema } from "../models/todo-nearby-card";
import { weekendTripCardSchema } from "../models/weekend-trip-card";

export function validateAiOutput(completion: any, category: string) {
    try {
        
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
        let selectSchema = determineTsInterface(category);
        // Check if we're expecting an array of objects (Category Cards) or a single object (Prompt Input)
        const isArrayInput = Array.isArray(parsed);
        // Create array schema if needed
        const schemaToUse = isArrayInput ? z.array(selectSchema) : selectSchema;
        // Validate against appropriate schema
        const validated = schemaToUse.safeParse(parsed);
        
        if (!validated.success) {
            throw new Error(
                `AI output did not conform to the ${category} schema: ` +
                JSON.stringify(validated.error.issues)
            );
        }

        // Return the validated data
        return { ok: true, data: validated.data };

    } catch (error: any) {
        console.error("AI output validation failed:", error);
        return { ok: false, error: error.message };
    }
}

function determineTsInterface(category: string): z.ZodType {
    const interfaces: Record<string, any> = {
        "Prompt Input": promptInputSchema,
        "Restaurants": restaurantCardSchema,
        "Takeout/Delivery": deliveryCardSchema,
        "Shows": showCardSchema,
        "Movies": movieCardSchema,
        "Indoor Dates": indoorDateCardSchema,
        "Outdoor Dates": outdoorDateCardSchema,
        "Local Activities": localActivityCardSchema,
        "Weekend Trips": weekendTripCardSchema
    };

    return interfaces[category] || "";
}