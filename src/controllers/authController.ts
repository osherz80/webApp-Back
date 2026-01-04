import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';

const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ message: 'Missing username, email, or password' });
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Username or email already exists' });
        } else {
            res.status(400).json({ message: err.message });
        }
    }
};

export default {
    register
};
