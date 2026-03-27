import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import postModel from '../models/postModel';
import userModel from '../models/userModel';
import { generateBookRecommendations } from '../utils/recommendations';

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
            .populate('sender', 'username profilePicture')
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
        const post = await postModel.findById(id).populate('sender', 'username profilePicture');
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

const deletePost = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const senderId = req.user?.id;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.sender.toString() !== senderId?.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await postModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getPostsByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        const posts = await postModel.find({ sender: userId })
            .populate('sender', 'username profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await postModel.countDocuments({ sender: userId });

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

const getAiRecommendation = async (req: AuthRequest, res: Response) => {
    // setTimeout(() => {
    //     return res.status(200).json([]);
    // }, 3000);
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // 1. Get user's physical reading history (composite key: title_author)
        const allUserPosts = await postModel.find({ sender: userId }).select('bookTitle bookAuthor');
        const readBooksFilter = allUserPosts.map(p => `${p.bookTitle}_${p.bookAuthor}`);

        // 2. Get previous AI suggestions from User document
        const user = await userModel.findById(userId);
        const previousSuggestions = user?.suggestedBooks || [];

        // 3. Combine into a unique blacklist (composite keys)
        const blacklist = Array.from(new Set([...readBooksFilter, ...previousSuggestions]));

        // 4. Get last 10 posts for active context
        const lastPosts = await postModel.find({ sender: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('bookTitle bookAuthor recommendation');

        const bookContext = lastPosts.map(p => `- "${p.bookTitle}" by ${p.bookAuthor} (Recommendation: ${p.recommendation})`).join('\n');

        // 5. Generate new recommendations excluding blacklist
        const recommendations = await generateBookRecommendations(bookContext, blacklist);

        // 6. Update User document with new suggestions using composite key format
        const newCompositeKeys = recommendations.map(item =>
            `${item.volumeInfo.title}_${(item.volumeInfo.authors || []).join(', ')}`
        );

        if (user) {
            user.suggestedBooks = Array.from(new Set([...user.suggestedBooks, ...newCompositeKeys]));
            await user.save();
        }

        res.status(200).json(recommendations);

    } catch (err: any) {
        console.error('Gemini Recommendation Error:', err);
        res.status(500).json({ message: err.message });
    }
};

export default {
    addPost,
    getAllPosts,
    getPostById,
    getPostsByUserId,
    updatePost,
    deletePost,
    getAiRecommendation
};
