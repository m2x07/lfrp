import { Router } from 'express';
import {
    createNewPost,
    deletePost,
    getAllPost,
    updatePost,
} from '../controllers/postController.js';

const postRouter = Router();

postRouter.get('/', getAllPost);
postRouter.post('/', createNewPost);
postRouter.put('/:id', updatePost);
postRouter.delete('/:id', deletePost);

export default postRouter;
