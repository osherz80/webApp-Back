import express from 'express';
const router = express.Router();
import postController from '../controllers/postController.js';

router.post('/', postController.addPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);

export default router;
