import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
dotenv.config({ path: __dirname + "/.env" });

import express from "express";
import type { Request, Response } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";

const RATE_LIM_ACCESS_CODE = process.env.RATE_LIM_ACCESS_CODE;
const app = express();
const limiterStrict = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 5, 
    message: "You have exceeded the 5 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req) => req.cookies.friendKey === RATE_LIM_ACCESS_CODE // Skip rate limiting if the correct cookie is present
});
const limiterGeneral = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 25, 
    message: "You have exceeded the 25 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use(express.json());
app.use(cors());

app.use("/categories", categoriesRouter);
app.use("/prompt-input", limiterStrict, promptInputRouter);
app.use(limiterGeneral);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
