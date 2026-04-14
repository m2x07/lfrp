import { Router } from 'express';
import { createUser, updateUser } from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/', createUser);
userRouter.put('/', updateUser);

export default userRouter;
