import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
    bookTitle: string;
    bookAuthor: string;
    bookDescription?: string;
    bookImage?: string;
    userImage?: string;
    recommendation: string;
    rating: number;
    likes: Types.ObjectId[];
    sender: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    bookTitle: {
        type: String,
        required: true
    },
    bookAuthor: {
        type: String,
        required: true
    },
    bookDescription: {
        type: String,
        required: false
    },
    bookImage: {
        type: String,
        required: false
    },
    userImage: {
        type: String,
        required: false
    },
    recommendation: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const postModel = mongoose.model<IPost>('Post', postSchema);

export default postModel;
