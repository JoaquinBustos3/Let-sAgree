import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

dotenv.config({ path: __dirname + "/.env" });

import express from "express";
import type { Request, Response } from "express";
import categoriesRouter from "./routes/categories";
import promptInputRouter from "./routes/prompt-input";

const RATE_LIM_ACCESS_CODE = process.env.RATE_LIM_ACCESS_CODE;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173' // or whatever your frontend origin is
}));

const limiterStrict = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 5, 
    message: "You have exceeded the 5 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req) => {
        console.log('Cookies:', req.cookies);
        console.log('friendKey:', req.cookies?.friendKey);
        console.log('Expected code:', RATE_LIM_ACCESS_CODE);
        console.log('Match?', req.cookies?.friendKey === RATE_LIM_ACCESS_CODE);
        return req.cookies?.friendKey === RATE_LIM_ACCESS_CODE
    } // Skip rate limiting if the correct cookie is present
});
const limiterGeneral = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    limit: 25, 
    message: "You have exceeded the 25 requests in 24 hrs limit!", 
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use("/categories", categoriesRouter);
app.use("/prompt-input", limiterStrict, promptInputRouter);

app.use(limiterGeneral);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});
