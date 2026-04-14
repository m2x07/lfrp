import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { AppError } from '../types.js';
import { AppRequest, MyTokenPayload } from '../types.js';

export async function authHandler(
    req: AppRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.headers.authorization) {
        return next(new AppError(401, 'Auth token missing'));
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as MyTokenPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name == 'JsonWebTokenError') {
            return next(new AppError(401, 'Invalid auth token'));
        }
        if (error.name == 'TokenExpiredError') {
            return next(new AppError(401, 'Token expired'));
        }
        next(error);
    }
}
