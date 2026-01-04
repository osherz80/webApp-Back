import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    message: string;
    sender: string;
    title?: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
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

const postModel = mongoose.model<IPost>('Post', postSchema);

export default postModel;
