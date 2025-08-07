import express from "express";
import type { Request, Response } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";

const app = express();
app.use(express.json());

app.use("/categories", categoriesRouter);
app.use("/prompt-input", promptInputRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
