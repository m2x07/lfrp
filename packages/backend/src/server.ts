import express, { Response } from 'express';
import config from './config/config.js';
import { authHandler } from './middlewares/authHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { prisma } from './prisma.js';
import postRouter from './routes/postRoutes.js';
import { AppRequest } from './types.js';
import authRouter from './routes/authRoutes.js';

const app = express();
app.use(express.json());

app.get('/ping', authHandler, (req: AppRequest, res: Response) => {
    res.send(`PING! @ ${new Date().toLocaleString()}`);
});
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use(errorHandler);

async function main() {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
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
