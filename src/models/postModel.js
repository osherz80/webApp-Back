const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
