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

/**
 * Validates the output from an OpenAI completion against a schema based on the category
 * 
 * This function handles extracting the content from an OpenAI API response,
 * checking for refusals, parsing JSON, and validating the parsed data against 
 * the appropriate schema for the specified category. It automatically detects
 * whether the input is a single object or an array of objects.
 * 
 * @param completion - The OpenAI completion response object
 * @param category - The category name to determine which schema to use for validation
 * @returns An object with the validation result:
 *   - If validation succeeds: `{ ok: true, data: validatedData }`
 *   - If validation fails: `{ ok: false, error: errorMessage }`
 * 
 */
export function validateAiOutput(completion: any, category: string) {
    try {
        
        // Extract and check for the AI's text response
        const aiResponse = completion.output_text;
        if (!aiResponse) {
            throw new Error("No response from OpenAI.");
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
        if (!selectSchema) {
            throw new Error(`No schema found for category: ${category}`);
        }
        // Check if we're expecting an array of objects (Category Cards) or a single object (Prompt Input)
        const isArrayInput = Array.isArray(parsed);
        // Create array schema if needed
        const schemaToUse = isArrayInput ? z.array(selectSchema) : selectSchema;
        // Validate against appropriate schema
        const validated = schemaToUse.safeParse(parsed);
        
        if (!validated.success) {

            // LOGGING - Loop through objects to see issues in each
            if (isArrayInput && Array.isArray(parsed)) {
                console.error(`Validation failed for category: ${category}`);
                console.error(`Total items: ${parsed.length}`);
                
                // Count of valid/invalid items
                let validCount = 0;
                let invalidCount = 0;
                
                // Validate each item individually
                parsed.forEach((item, index) => {
                    const itemValidation = selectSchema.safeParse(item);
                    
                    if (itemValidation.success) {
                        validCount++;
                    } else {
                        invalidCount++;
                        console.error(`------- Item #${index} failed validation -------`);
                        console.error(`Item content:`, JSON.stringify(item, null, 2));
                        console.error(`Validation errors:`, JSON.stringify(itemValidation.error.issues, null, 2));
                    }
                });
                
                console.error(`Summary: ${validCount} valid items, ${invalidCount} invalid items`);
                
            } else {
                // Single object validation failure
                console.error(`Single object validation failed for category: ${category}`);
                console.error(`Object content:`, JSON.stringify(parsed, null, 2));
            }

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
        "Indoor Date Activities": indoorDateCardSchema,
        "Outdoor Date Activities": outdoorDateCardSchema,
        "Things To Do Nearby": localActivityCardSchema,
        "Weekend Trip Ideas": weekendTripCardSchema
    };

    return interfaces[category] || "";
}