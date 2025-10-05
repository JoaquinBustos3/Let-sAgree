import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import loggerInit from "./logger/index";
import crypto from "crypto";
import NodeCache from "node-cache";

dotenv.config({ path: __dirname + "/.env" });
const logger = loggerInit("index.ts");

import express from "express";
import type { Request, Response, NextFunction } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";
import { incrementMetric } from "./utils/db";  

const TIER_1 = process.env.RATE_LIM_TIER_1_ACCESS_CODE;
const TIER_2 = process.env.RATE_LIM_TIER_2_ACCESS_CODE;
const DEV_CORS_URL = process.env.DEV_CORS_URL;
const PROD_CORS_URL = process.env.PROD_CORS_URL;
const isProduction = process.env.NODE_ENV === 'Production';

const app = express();

// global in-memory cache (10min TTL)
export const resultCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

app.use(cookieParser());
app.use(express.json());
// Trust Render's proxy so rate limiter sees real client IP
app.set("trust proxy", 1);
app.use(cors({
  credentials: true,
  origin: isProduction ? PROD_CORS_URL : DEV_CORS_URL
}));

// used to spin up possibly inactive Render free tier instance
app.get("/wake-up", (req: Request, res: Response) => {
    logger.info("Waking up server...");
    res.send("Hello world!");
});

/**
 * Simple cache middleware for /prompt-input:
 * - Only applies to POST requests
 * - Hashes the `input` field (JSON.stringify(input)) with sha256
 * - If cached result exists -> return it immediately
 * - Otherwise wrap res.json so that successful responses (200) will be cached
 * - Does not trigger rate limiter for cache hits
 */
app.use("/prompt-input", (req: Request, res: Response, next: NextFunction) => {
  // Only care about POST requests that include an `input` field in the body
  if (req.method !== "POST") return next();

  try {
    const body = req.body;
    if (!body || typeof body.input === "undefined" || body.input === null) {
      return next();
    }

    // Create a cache key based on the `input` field ONLY (per your ask)
    const inputToHash = typeof body.input === "string" ? body.input : JSON.stringify(body.input);
    const cacheKey = crypto.createHash("sha256").update(inputToHash).digest("hex");

    // Attach the key to the request for downstream use if desired
    (req as any).cacheKey = cacheKey;

    // If the result already exists, return it immediately (short-circuit)
    const cached = resultCache.get(cacheKey);
    if (cached) {
      logger.info(`Cache HIT for key ${cacheKey}`);
      return res.json(cached);
    }

    logger.info(`Cache MISS for key ${cacheKey}`);

    // Wrap res.json so that when the real handler responds, we save the body to cache
    const originalJson = res.json.bind(res);
    // Use any to avoid TypeScript signature mismatch
    (res as any).json = (bodyToSend: any) => {
      try {
        // Only cache successful responses and when body is present
        if (res.statusCode === 200 && bodyToSend) {
          resultCache.set(cacheKey, bodyToSend);
        }
      } catch (err) {
        logger.error(`Error caching response for key ${cacheKey}: ${(err as Error).message}`);
      }
      return originalJson(bodyToSend);
    };

    return next();
  } catch (err) {
    // On any error, don't block the route — just continue
    logger.error(`Cache middleware error: ${(err as Error).message}`);
    return next();
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});