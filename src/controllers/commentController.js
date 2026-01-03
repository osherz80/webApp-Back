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


module.exports = {
    addComment,
};
