const postModel = require('../models/postModel');

const addPost = async (req, res) => {
    const { message, sender, title } = req.body;
    try {
        const newPost = new postModel({
            message,
            sender,
            title
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllPosts = async (req, res) => {
    const filter = req.query;
    try {
        if (filter.sender) {
            const posts = await postModel.find({ sender: filter.sender });
            res.status(200).json(posts);
        } else {
            const posts = await postModel.find();
            res.status(200).json(posts);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await postModel.findById(id);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { message, sender, title } = req.body;
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
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    addPost,
    getAllPosts,
    getPostById,
    updatePost
};
