import { Request, Response } from 'express';
import userModel from '../models/userModel';
import { AuthRequest } from '../middleware/authMiddleware';

const getUserById = async (req: AuthRequest, res: Response) => {
    const userId = req?.user?._id;
    try {
        // get user without sensitive data
        const user = await userModel.findById(userId).select('-password -refreshTokens');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    getUserById,
};