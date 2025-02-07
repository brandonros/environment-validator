import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', error.stack);
    res.status(500).json({
        error: error.toString(),
        message: error.message,
        stack: error.stack
    });
};
