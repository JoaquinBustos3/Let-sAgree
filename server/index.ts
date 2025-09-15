import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import loggerInit from "./logger/index";

dotenv.config({ path: __dirname + "/.env" });
const logger = loggerInit("index.ts");

import express from "express";
import type { Request, Response } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";
import { incrementMetric } from "./utils/db";  

const TIER_1 = process.env.RATE_LIM_TIER_1_ACCESS_CODE;
const TIER_2 = process.env.RATE_LIM_TIER_2_ACCESS_CODE;
const DEV_CORS_URL = process.env.DEV_CORS_URL;
const PROD_CORS_URL = process.env.PROD_CORS_URL;
const isProduction = process.env.NODE_ENV === 'Production';

const app = express();

app.use(cookieParser());
app.use(express.json());
// Trust Render's proxy so rate limiter sees real client IP
app.set("trust proxy", 1);
app.use(cors({
  credentials: true,
  origin: isProduction ? PROD_CORS_URL : DEV_CORS_URL
}));

const limiterTierFree = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 6,
    message: "You have exceeded the 5 requests in 24 hrs limit!",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting if the correct cookie is present
        const encodedCookie = req.cookies?.friendKey;
        if (!encodedCookie) return false;
        
        const decodedCookie = decodeURIComponent(encodedCookie);
        return decodedCookie === TIER_1 || decodedCookie === TIER_2;
    },
    handler: async (req, res) => {
        await incrementMetric("rate_limit_exceeded");

        res.status(429).json({
        message: "You have exceeded the 5 requests in 24 hrs limit!"
        });
    }
});
const limiterTier1 = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 16, 
    message: "You have exceeded the 15 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req) => {
        // Skip rate limiting if the correct cookie is present
        const encodedCookie = req.cookies?.friendKey;
        if (!encodedCookie) return false;
        
        const decodedCookie = decodeURIComponent(encodedCookie);
        return decodedCookie === TIER_2;
    },
    handler: async (req, res) => {
        await incrementMetric("rate_limit_exceeded");

        res.status(429).json({
        message: "You have exceeded the 15 requests in 24 hrs limit!"
        });
    }
});
const limiterTier2 = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 31, 
    message: "You have exceeded the 30 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: async (req, res) => {
        await incrementMetric("rate_limit_exceeded");

        res.status(429).json({
        message: "You have exceeded the 30 requests in 24 hrs limit!"
        });
    }
});

app.use((req: Request, res: Response, next) => {
    logger.info(`Received request - ${req.method} ${req.url}`);
    next();
});

app.use(limiterTierFree);
app.use(limiterTier1);
app.use(limiterTier2);

app.use("/categories", categoriesRouter);
app.use("/prompt-input", promptInputRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});