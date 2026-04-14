import { Router } from 'express';
import {
    createNewPost,
    deletePost,
    getAllPost,
    updatePost,
} from '../controllers/postController.js';
import { authHandler } from '../middlewares/authHandler.js';

const postRouter = Router();

postRouter.get('/', authHandler, getAllPost);
postRouter.post('/', authHandler, createNewPost);
postRouter.put('/:id', authHandler, updatePost);
postRouter.delete('/:id', authHandler, deletePost);

export default postRouter;
