import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Missing email or password' });
        return;
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const accessTokenSecret = process.env.JWT_SECRET || 'secret';
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';

        const accessToken = jwt.sign(
            { userId: user._id },
            accessTokenSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            refreshTokenSecret,
            { expiresIn: '7d' }
        );

        // Save refresh token to user model
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({
            accessToken,
            refreshToken,
            userId: user._id
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Missing refresh token' });
        return;
    }

    try {
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';
        const payload: any = jwt.verify(refreshToken, refreshTokenSecret);
        const user = await userModel.findById(payload.userId);

        if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err: any) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export default {
    register,
    login,
    logout
};
