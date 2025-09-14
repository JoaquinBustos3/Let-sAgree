import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import loggerInit from "./logger/index";

dotenv.config({ path: __dirname + "/.env" });
const logger = loggerInit("auth-service");

import express from "express";
import type { Request, Response } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";

const TIER_1 = process.env.RATE_LIM_TIER_1_ACCESS_CODE;
const TIER_2 = process.env.RATE_LIM_TIER_2_ACCESS_CODE;
const DEV_CORS_URL = process.env.DEV_CORS_URL;

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: DEV_CORS_URL
}));

const limiterTierFree = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 5, 
    message: "You have exceeded the 5 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req) => {
        const encodedCookie = req.cookies?.friendKey;
        if (!encodedCookie) return false;
        
        const decodedCookie = decodeURIComponent(encodedCookie);
        return decodedCookie === TIER_1 || decodedCookie === TIER_2;
    } // Skip rate limiting if the correct cookie is present
});
const limiterTier1 = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 15, 
    message: "You have exceeded the 15 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req) => {
        const encodedCookie = req.cookies?.friendKey;
        if (!encodedCookie) return false;
        
        const decodedCookie = decodeURIComponent(encodedCookie);
        return decodedCookie === TIER_2;
    } // Skip rate limiting if the correct cookie is present
});
const limiterTier2 = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 31, 
    message: "You have exceeded the 31 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use(limiterTierFree);
app.use(limiterTier1);
app.use(limiterTier2);

app.use("/categories", categoriesRouter);
app.use("/prompt-input", promptInputRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  logger.info("Server started on port 3000 - App is live!");
  const err = new Error("Test error logging on startup");
  logger.error("Testing error looks: ", err);
});