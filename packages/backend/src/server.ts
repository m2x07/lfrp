import express, { Request, Response, NextFunction } from 'express';
import config from './config/config.js';
import { prisma } from './prisma.js';
import postRouter from './routes/postRoutes.js';
import userRouter from './routes/userRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppRequest, authHandler } from './middlewares/authHandler.js';

const app = express();
app.use(express.json());

app.get('/ping', authHandler, (req: AppRequest, res: Response) => {
    if (req.user) {
        console.log('this is the decoded data');
        console.log(req.user);
        res.send('ok');
    } else {
        res.status(401).json({ message: 'no auth token found' });
    }
});
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);
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
