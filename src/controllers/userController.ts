import { Request, Response } from 'express';
import userModel from '../models/userModel';

const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // get user without sensitive data
        const user = await userModel.findById(id).select('-password -refreshTokens');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.find().select('-password -refreshTokens');
        res.status(200).json(users);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    getUserById,
    getAllUsers
};