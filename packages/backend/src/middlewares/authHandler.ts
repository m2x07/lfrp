import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/config.js';

export interface AppRequest extends Request {
    user: JwtPayload | string;
}

export function authHandler(
    req: AppRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.headers.authorization) {
        res.status(401).json({ message: 'no auth token attached' });
    }
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
}
