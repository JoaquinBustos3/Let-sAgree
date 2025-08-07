import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const categoriesFile = path.join(__dirname, "../data/categories.json");

function readCategories(): string[] {
    const data = fs.readFileSync(categoriesFile, "utf8");
    return JSON.parse(data);
}

function getCategories(req: Request, res: Response) {
    const categories = readCategories();
    res.json(categories);
}

export default { getCategories };
