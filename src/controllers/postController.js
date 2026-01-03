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

module.exports = {
    addPost,
    getAllPosts
};
