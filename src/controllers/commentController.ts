import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import commentModel from '../models/commentModel';

const addComment = async (req: AuthRequest, res: Response) => {
    const { message, postId } = req.body;
    const sender = req.user?._id;
    try {
        const newComment = new commentModel({
            message,
            sender,
            postId
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getAllComments = async (req: Request, res: Response) => {
    const filter = req.query;
    try {
        if (filter['postId']) {
            const postId = filter['postId'] as string
            const comments = await commentModel.find({ postId });
            res.status(200).json(comments);
        } else {
            const comments = await commentModel.find();
            res.status(200).json(comments);
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const getCommentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const comment = await commentModel.findById(id);
        if (comment) {
            res.status(200).json(comment);
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const updateComment = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, postId } = req.body;
    const sender = req.user?._id;
    try {
        const updatedComment = await commentModel.findByIdAndUpdate(
            id,
            { message, sender, postId },
            { new: true, runValidators: true }
        );
        if (updatedComment) {
            res.status(200).json(updatedComment);
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const deleteComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedComment = await commentModel.findByIdAndDelete(id);
        if (deletedComment) {
            res.status(200).json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    addComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment
};
