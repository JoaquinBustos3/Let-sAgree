import type { Request, Response } from "express";
import { preprocessPromptInput } from "../ai/pre-process"; // Make sure this is a named import
import loggerInit from "../logger/index";
import { incrementMetric } from "../utils/db";

const logger = loggerInit("prompt-input-controller.ts");

/**
 * Processes user input prompts to generate category-specific card recommendations
 * 
 * This controller function handles POST requests with the user preferences and handles no input scenarios. It sends to
 * and returns from the AI processing pipeline after the pipeline:
 * 
 * 1. Validates category and input parameters
 * 2. Increments user visit and category-specific metrics
 * 3. Pre-processes the input and sends it to the AI model
 * 4. Handles errors with appropriate status codes (422 for validation, 500 for server errors)
 * 5. Returns the generated card recommendations
 * 
 * @param req - Express request object containing category in params and input/zipCode in body
 * @param res - Express response object used to send back JSON results or error messages
 * @returns JSON response with generated cards or error message
 */
const receivePromptInput = async (req: Request, res: Response) => {
    const { category } = req.params;
    const { input, zipCode } = req.body;

    if (!category || typeof category !== "string") {
        return res
            .status(400)
            .json({ error: "Category is required as a path variable." });
    }
    if (!input || typeof input !== "string") {
        return res
            .status(400)
            .json({ error: "Input must be a non-empty string." });
    }

    logger.debug(`Received request - Category: ${category}, Input: ${input}, ZipCode: ${zipCode}`);

    await incrementMetric("user_visits");
    const replaced = category.replace(/ /g, "_");
    await incrementMetric(`${replaced}_requests`);

    const result = await preprocessPromptInput(input, category, zipCode);

    if (!result.ok) {
        // 422 for validation, 500 for other errors
        const status =
            result.error.includes("schema") || result.error.includes("JSON")
                ? 422
                : 500;
        return res.status(status).json({ error: result.error });
    }

    logger.debug(`PRINTING FINAL VALUE FROM CONTROLLER: ${JSON.stringify(result.data, null, 2)}`);
    res.json(result.data);
};

export default { receivePromptInput };
