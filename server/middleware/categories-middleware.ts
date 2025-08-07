import type { Request, Response, NextFunction } from "express";

const categoriesMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // No-op (PLACEHOLDER) for now; add validation/auth here if needed
    next();
};

export default categoriesMiddleware;
