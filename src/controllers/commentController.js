const commentModel = require('../models/commentModel');

const addComment = async (req, res) => {
    const { message, sender, postId } = req.body;
    try {
        const newComment = new commentModel({
            message,
            sender,
            postId
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllComments = async (req, res) => {
    const filter = req.query;
    try {
        if (filter.postId) {
            const comments = await commentModel.find({ postId: filter.postId });
            res.status(200).json(comments);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getCommentById = async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await commentModel.findById(id);
        if (comment) {
            res.status(200).json(comment);
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateComment = async (req, res) => {
    const { id } = req.params;
    const { message, sender, postId } = req.body;
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
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedComment = await commentModel.findByIdAndDelete(id);
        if (deletedComment) {
            res.status(200).json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    addComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment
};
