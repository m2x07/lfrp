import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError, MyTokenPayload } from '../types.js';
import { User } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import crypto from 'crypto';
import { sendMagicLink } from '../services/mail.js';

const TOKEN_EXPIRY_MINUTES = 10;

function expiryDate(): Date {
    return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
}

export async function login(req: Request, res: Response, next: NextFunction) {
    // TODO: add email verification here
    if (!req.body) {
        return next(new AppError(400, 'no email provided'));
    }
    const e = req.body.email;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: e,
            },
        });
        const encoded = jwt.sign(
            { email: user.email, role: user.role },
            config.jwtSecret
        );
        res.json({ auth_token: encoded });
    } catch (error) {
        // FIX: correct error checking here
        // if (error.code === 'ERR_DLOPEN_FAILED') {
        //     next(new AppError(400, 'user non-existent'));
        // }
        next(error);
    }
}

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, name, contactNumber } = req.body;
    if (!email) return next(new AppError(400, 'email is required'));
    if (!name) return next(new AppError(400, 'name is required'));
    if (typeof contactNumber !== 'number' || !Number.isInteger(contactNumber)) {
        return next(new AppError(400, 'contact number must be integer'));
    }
    try {
        const existing = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (existing?.verified) {
            return next(new AppError(400, 'user already exists'));
        }

        const user = existing
            ? existing
            : await prisma.user.create({
                  data: {
                      email: req.body.email,
                      name: req.body.name,
                      contactNumber: req.body.contactNumber,
                      role: 'USER',
                      verified: false,
                  },
              });
        const token = crypto.randomBytes(32).toString('hex');

        const pendingAuthRequest = await prisma.authRequest.upsert({
            where: { email: user.email },
            update: { token: token, expiresAt: expiryDate() },
            create: {
                email: user.email,
                token: token,
                expiresAt: expiryDate(),
            },
        });

        await sendMagicLink(user.email, token);

        res.json({ message: 'magic link sent to your email' });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function status(req: Request, res: Response, next: NextFunction) {
    const e = req.query.email as string;

    if (!e) {
        return next(new AppError(401, 'invalid status check request'));
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: e },
        });
        if (!user.verified) {
            return res.json({ verified: false });
        }
        const token = jwt.sign(
            { email: user.email, role: user.role },
            config.jwtSecret
        );
        res.json({ verified: true, authToken: token });
    } catch (error) {
        // FIX: correct error checking here
        // if (error.code === 'ERR_DLOPEN_FAILED') {
        //     next(new AppError(400, 'user non-existent'));
        // }
        next(error);
    }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
    const token = req.query.token as string;

    const authRequest = await prisma.authRequest.findUnique({
        where: {
            token: token,
        },
    });

    if (authRequest.expiresAt <= new Date()) {
        return next(new AppError(401, 'token expired'));
    }

    if (!authRequest) {
        return next(
            new AppError(401, 'invalid or expired auth verification token')
        );
    }

    const [deletedAuthToken, verifiedUser] = await prisma.$transaction([
        prisma.authRequest.delete({
            where: { token: token },
        }),
        prisma.user.update({
            where: { email: authRequest.email },
            data: { verified: true },
        }),
    ]);

    res.json({ message: 'user verified successfully' });
}
