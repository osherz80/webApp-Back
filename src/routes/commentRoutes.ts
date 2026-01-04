import express from 'express';
const router = express.Router();
import commentController from '../controllers/commentController.js';

router.post('/', commentController.addComment);
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

export default router;
