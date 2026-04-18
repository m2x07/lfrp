import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AppError } from '../types.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import crypto from 'crypto';
import { sendLoginOtp } from '../services/mail.js';

const TOKEN_EXPIRY_MINUTES = 10;

function expiryDate(): Date {
    return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
}

export async function login(req: Request, res: Response, next: NextFunction) {
    // TODO: add email verification here
    if (!req.body) {
        return next(new AppError(400, 'no email provided'));
    }
    const email = req.body.email;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return next(new AppError(404, 'No such user found'));
        }
        const buffer = new Uint32Array(1);
        crypto.randomFillSync(buffer);
        const otp = (buffer[0] % 900000) + 100000;

        const pendingAuthRequest = await prisma.authRequest.upsert({
            where: { email: email },
            update: { otp: otp, expiresAt: expiryDate() },
            create: {
                email: email,
                otp: otp,
                expiresAt: expiryDate()
            }
        })
        await sendLoginOtp(email, otp)

        res.json({ message: 'Check your email for OTP' })
    } catch (error) {
        // FIX: correct error checking here
        // if (error.code === 'ERR_DLOPEN_FAILED') {
        //     next(new AppError(400, 'user non-existent'));
        // }
        // console.log(error)
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
            return next(new AppError(409, 'User already exists'));
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
        // const token = crypto.randomBytes(32).toString('hex');

        res.json({ message: 'Account registered. Please login with your email' });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;
    const userOtp = req.body.otp as number;

    const authRequest = await prisma.authRequest.findUnique({
        where: {
            email: email,
        },
    });

    if (!authRequest) {
        return next(
            new AppError(400, 'Invalid or expired session. Login again')
        );
    }

    if (authRequest.expiresAt <= new Date()) {
        return next(new AppError(400, 'OTP expired'));
    }

    if (userOtp !== authRequest.otp) {
        return next(new AppError(400, 'OTP invalid'));
    }

    const [, verifiedUser] = await prisma.$transaction([
        prisma.authRequest.delete({
            where: { email: email },
        }),
        prisma.user.update({
            where: { email: authRequest.email },
            data: { verified: true },
        }),
    ]);

    const token = jwt.sign(
        { email: verifiedUser.email, role: verifiedUser.role },
        config.jwtSecret
    );

    res.json({ authToken: token });
}
