import express from 'express';
const router = express.Router();
import postController from '../controllers/postController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.post('/', authMiddleware, postController.addPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', authMiddleware, postController.updatePost);

export default router;
