import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
}
