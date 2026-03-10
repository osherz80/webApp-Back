import { Response } from 'express';
import userModel from '../models/userModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { UpdateUserReq } from '../types/user';
import { UserDto } from '../dtos/user.dto';

const getUserById = async (req: AuthRequest, res: Response) => {
    const userId = req?.user?.id;
    try {
        const user = await userModel.findById(userId).select('_id username email profilePicture');

        if (user) {
            const returnUser = new UserDto(user);
            return res.status(200).json({ returnUser, isAuth: true });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err: any) {
        return res.status(400).json({ message: err.message });
    }
};

const updateUser = async (req: UpdateUserReq, res: Response) => {
    const userId = req?.user?.id;
    const { username, profilePicture, bio } = req.body;

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.profilePicture = profilePicture;
        user.bio = bio;

        await user.save();

        return res.status(200).json({ message: 'User updated successfully' });

    } catch (err: any) {
        return res.status(400).json({ message: err.message });
    }
}

export default {
    getUserById,
    updateUser
};