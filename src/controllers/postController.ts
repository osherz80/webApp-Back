import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import postModel from '../models/postModel';

const addPost = async (req: AuthRequest, res: Response) => {
    const { message, title } = req.body;
    const sender = req.user?._id;
    try {
        const newPost = new postModel({
            message,
            sender,
            title
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getAllPosts = async (req: Request, res: Response) => {
    const filter = req.query;
    try {
        if (filter['sender']) {
            const sender = filter['sender'] as string
            const posts = await postModel.find({ sender });
            res.status(200).json(posts);
        } else {
            const posts = await postModel.find();
            res.status(200).json(posts);
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getPostById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const post = await postModel.findById(id);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const updatePost = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, title } = req.body;
    const sender = req.user?._id;
    try {
        const updatedPost = await postModel.findByIdAndUpdate(
            id,
            { message, sender, title },
            { new: true, runValidators: true }
        );
        if (updatedPost) {
            res.status(200).json(updatedPost);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    addPost,
    getAllPosts,
    getPostById,
    updatePost
};
