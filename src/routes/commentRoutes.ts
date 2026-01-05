import express from 'express';
const router = express.Router();
import commentController from '../controllers/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.post('/', authMiddleware, commentController.addComment);
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

export default router;
