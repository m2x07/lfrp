import { Router } from 'express';
import {
    login,
    register,
    verify,
} from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/verify', verify);

export default authRouter;
