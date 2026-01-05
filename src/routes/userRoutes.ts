import express from 'express';
const router = express.Router();
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

router.get('/', userController.getAllUsers);

router.get('/:id', authMiddleware, userController.getUserById);

export default router;