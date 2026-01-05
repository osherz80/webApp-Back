import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.get('/:id', authMiddleware, userController.getUserById);

export default router;
