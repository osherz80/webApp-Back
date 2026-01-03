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
        } else {
            const comments = await commentModel.find();
            res.status(200).json(comments);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


module.exports = {
    addComment,
    getAllComments,
};
