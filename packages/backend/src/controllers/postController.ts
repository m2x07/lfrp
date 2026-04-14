import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';

export async function getAllPost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
            },
        });
        res.json(posts);
    } catch (error) {
        // res.status(501).json({ message: "server error" });
        next(error);
    }
}

export async function createNewPost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { title, content, location, category, authorEmail } = req.body;
    try {
        const post = await prisma.post.create({
            data: {
                title: title,
                content: content,
                location: location,
                authorEmail: authorEmail,
                category: category,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });
        res.json(post);
    } catch (error) {
        next(error);
    }
}

export async function updatePost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { title, content, location, category } = req.body;

    const rawId = req.params.id;
    if (!rawId || Array.isArray(rawId)) {
        res.status(400).json({ message: 'Missing post id' });
        return;
    }
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid post id' });
        return;
    }

    try {
        const post = await prisma.post.update({
            where: {
                id: id,
            },
            data: {
                title: title,
                content: content,
                location: location,
                category: category,
                updatedAt: new Date().toISOString(),
            },
        });
        res.json(post);
    } catch (error: any) {
        // res.status(501).json({ message: "server error" });
        if (error.code == 'P2025') {
            error.message = 'post does not exist';
        }
        next(error);
    }
}

export async function deletePost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const rawId = req.params.id;
    if (!rawId || Array.isArray(rawId)) {
        res.status(400).json({ message: 'Missing post id' });
        return;
    }
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid post id' });
        return;
    }

    try {
        const post = await prisma.post.update({
            where: {
                id: id,
                published: true,
            },
            data: {
                published: false,
            },
        });
        res.json({ message: 'post deleted' });
    } catch (error: any) {
        // res.status(501).json({ message: "server error" });
        if (error.code == 'P2025') {
            error.message = 'post does not exist';
        }
        next(error);
    }
}
