import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError, MyTokenPayload } from '../types.js';
import { User } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export async function login(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
        next(new AppError(400, 'no email provided'));
    }
    const e = req.body.email;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: e,
            },
        });
        const encoded = jwt.sign({ "email": user.email, "role": user.role }, config.jwtSecret)
        res.json({ "auth_token": encoded });
    } catch (error) {
        if (error.code === 'ERR_DLOPEN_FAILED') {
            next(new AppError(400, 'user non-existent'));
        }
        next(error);
    }
}

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.body) {
        next(new AppError(400, 'no email provided'));
    }
    console.log(req.body.email);
    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.name,
                contactNumber: req.body.contactNumber,
                role: 'USER',
            },
        });
        const payload: MyTokenPayload = {
            email: user.email,
            role: user.role,
        };
        const encoded = jwt.sign(payload, config.jwtSecret);
        res.json({
            auth_token: encoded,
            new_user: user,
        });
    } catch (error) {
        if (error.code === 'P2002') {
            next(new AppError(400, 'user already exists'));
        }
        next(error);
    }
}

// export async function verify(req: Request, res: Response, next: NextFunction) {
//
// }
