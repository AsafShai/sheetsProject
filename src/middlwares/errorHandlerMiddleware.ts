import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/CustomError";

export function errorHandlerMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }  
    if (err instanceof Error) {
        console.error(err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    } else {
        next(err); 
    }
}