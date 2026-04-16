import express, { Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import config from './config/config.js';
import { authHandler } from './middlewares/authHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { prisma } from './prisma.js';
import postRouter from './routes/postRoutes.js';
import { AppRequest } from './types.js';
import authRouter from './routes/authRoutes.js';

const app = express();
app.use(express.json());

if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
}

app.use('/uploads/images', express.static(config.uploadDir));

app.get('/ping', authHandler, (req: AppRequest, res: Response) => {
    res.send(`PING! @ ${new Date().toLocaleString()}`);
});
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);

const frontendDist = path.join(process.cwd(), '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

async function main() {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });

    setInterval(async () => {
        const deleted = await prisma.authRequest.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        if (deleted.count > 0) {
            console.log(`Cleaned up ${deleted.count} expired auth request(s)`);
        }
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
