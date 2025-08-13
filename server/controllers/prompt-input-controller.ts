import type { Request, Response } from "express";
import { preprocessPromptInput } from "../ai/pre-process"; // Make sure this is a named import

const receivePromptInput = async (req: Request, res: Response) => {
    const { category } = req.params;
    const { input } = req.body;

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

    const result = await preprocessPromptInput(input, category);

    if (!result.ok) {
        // 422 for validation, 500 for other errors
        const status =
            result.error.includes("schema") || result.error.includes("JSON")
                ? 422
                : 500;
        return res.status(status).json({ error: result.error });
    }

    res.json(result.data);
};

export default { receivePromptInput };
