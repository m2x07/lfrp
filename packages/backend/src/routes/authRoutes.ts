import { Router } from 'express';
import {
    login,
    register,
    status,
    verify,
} from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/verify', verify);
authRouter.get('/status', status);

export default authRouter;
