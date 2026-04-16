import { Router } from 'express';
import {
    createNewPost,
    deletePost,
    getAllPost,
    updatePost,
} from '../controllers/postController.js';
import { authHandler } from '../middlewares/authHandler.js';
import upload from '../config/multer.js';

const postRouter = Router();

postRouter.get('/', authHandler, getAllPost);
postRouter.post('/', authHandler, upload.array('images', 2), createNewPost);
postRouter.put('/:id', authHandler, upload.array('images', 2), updatePost);
postRouter.delete('/:id', authHandler, deletePost);

export default postRouter;
