import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import postModel from '../models/postModel';

const addPost = async (req: AuthRequest, res: Response) => {
    const { bookTitle, bookAuthor, bookDescription, bookImage, userImage, recommendation, rating } = req.body;
    const sender = req.user?.id;
    try {
        const newPost = new postModel({
            bookTitle,
            bookAuthor,
            bookDescription,
            bookImage,
            userImage,
            recommendation,
            rating,
            sender,
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getAllPosts = async (req: Request, res: Response) => {
    const { sender, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        const query: any = {};
        if (sender) {
            query.sender = sender;
        }

        const posts = await postModel.find(query)
            .populate('sender', 'username picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await postModel.countDocuments(query);

        res.status(200).json({
            posts,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalPosts: total
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getPostById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const post = await postModel.findById(id).populate('sender', 'username picture');
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
    const { bookTitle, bookAuthor, bookDescription, bookImage, userImage, recommendation, rating } = req.body;
    const senderId = req.user?.id;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.sender.toString() !== senderId?.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this post' });
        }

        const updatedPost = await postModel.findByIdAndUpdate(
            id,
            { bookTitle, bookAuthor, bookDescription, bookImage, userImage, recommendation, rating },
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};



export default {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
};
