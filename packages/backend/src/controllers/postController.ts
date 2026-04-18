import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../prisma.js';
import { AppError, AppRequest } from '../types.js';
import { Type, Category } from '../generated/prisma/enums.js';
import { hashFile } from '../utils/hash.js';
import config from '../config/config.js';

function processFiles(
    files: Express.Multer.File[] | undefined
): string[] | null {
    if (!files || files.length === 0) return null;
    const filenames: string[] = [];
    for (const file of files) {
        const filename = hashFile(file.buffer, file.mimetype);
        const filePath = path.join(config.uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        filenames.push(filename);
    }
    return filenames;
}

async function deleteFiles(attachmentsJson: string | null) {
    if (!attachmentsJson) return;

    try {
        const filenames: string[] = JSON.parse(attachmentsJson);

        // Use Promise.all to delete files in parallel for better speed
        await Promise.all(
            filenames.map(async (name) => {
                const filePath = path.join(config.uploadDir, name);
                try {
                    await unlink(filePath);
                } catch (err: any) {
                    // Ignore "File not found" errors, but log others
                    if (err.code !== 'ENOENT') {
                        console.error(`Failed to delete ${name}:`, err);
                    }
                }
            })
        );
    } catch (parseError) {
        console.error("Invalid JSON provided to deleteFiles", parseError);
    }
}

export async function getAllPost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const type = req.query.type as Type;
    const category = req.query.category as Category | undefined;
    const search = req.query.search as string | undefined;

    if (!type) {
        return next(new AppError(400, "'type' field is required"));
    }

    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
                type: type,
                ...(category ? { category } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search } },
                            { content: { contains: search } },
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                title: true,
                content: true,
                type: true,
                location: true,
                category: true,
                authorEmail: true,
                createdAt: true,
                attachments: true,
                author: {
                    select: { name: true, contactNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const parsed = posts.map((p) => ({
            ...p,
            attachments: p.attachments ? JSON.parse(p.attachments) : [],
        }));
        res.json(parsed);
    } catch (error) {
        next(error);
    }
}

export async function createNewPost(
    req: AppRequest,
    res: Response,
    next: NextFunction
) {
    const { title, content, location, category, type } = req.body;
    try {
        const filenames = processFiles(
            req.files as Express.Multer.File[] | undefined
        );
        const post = await prisma.post.create({
            data: {
                title: title,
                content: content,
                location: location,
                authorEmail: req.user.email,
                category: category,
                type: type,
                attachments: filenames ? JSON.stringify(filenames) : null,
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
    req: AppRequest,
    res: Response,
    next: NextFunction
) {
    const { title, content, location, category } = req.body;

    const rawId = req.params.id;
    if (!rawId || Array.isArray(rawId)) {
        return next(new AppError(400, 'Missing post id'));
    }
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
        return next(new AppError(400, 'Invalid post id'));
    }
    try {
        const toEdit = await prisma.post.findFirst({
            where: {
                id: id,
            },
        });

        if (toEdit.authorEmail !== req.user.email) {
            return next(new AppError(403, 'Forbidden'));
        }
    } catch (error) {
        return next(error);
    }

    try {
        const files = req.files as Express.Multer.File[] | undefined;
        const filenames = processFiles(files);
        const data: Record<string, any> = {
            title: title,
            content: content,
            location: location,
            category: category,
            updatedAt: new Date().toISOString(),
        };
        if (filenames) {
            const existing = await prisma.post.findUnique({ where: { id } });
            await deleteFiles(existing?.attachments ?? null);
            data.attachments = JSON.stringify(filenames);
        }

        const post = await prisma.post.update({
            where: {
                id: id,
                authorEmail: req.user.email,
            },
            data,
        });
        res.json(post);
    } catch (error: any) {
        if (error.code == 'P2025') {
            return next(new AppError(404, 'post does not exist'));
        }
        next(error);
    }
}

export async function deletePost(
    req: AppRequest,
    res: Response,
    next: NextFunction
) {
    const rawId = req.params.id;
    if (!rawId || Array.isArray(rawId)) {
        return next(new AppError(400, 'Missing post id'));
    }
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
        return next(new AppError(400, 'Invalid post id'));
    }

    try {
        const toEdit = await prisma.post.findFirst({
            where: {
                id: id,
            },
        });

        if (toEdit.authorEmail !== req.user.email) {
            return next(new AppError(403, 'Forbidden'));
        }
    } catch (error) {
        return next(error);
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
        if (error.code == 'P2025') {
            return next(new AppError(404, 'post does not exist'));
        }
        next(error);
    }
}
