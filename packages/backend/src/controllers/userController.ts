import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';

export async function createUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, name, contactNumber } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                contactNumber: contactNumber,
                role: 'USER',
            },
        });
        res.json(user);
    } catch (error) {
        // res.status(501).json({ message: "server error" });
        next(error);
    }
}

export async function updateUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, name, contactNumber } = req.body;
    try {
        const user = await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                name: name,
                contactNumber: contactNumber,
            },
        });
        res.json(user);
    } catch (error) {
        // res.status(501).json({ message: "server error" });
        next(error);
    }
}
