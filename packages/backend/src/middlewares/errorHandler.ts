import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { MulterError } from 'multer';

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof MulterError) {
        const status =
            err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT'
                ? 413
                : 400;
        res.status(status).json({ message: err.message });
        return;
    }
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
}
