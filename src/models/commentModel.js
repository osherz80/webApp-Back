const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;
