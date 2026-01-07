import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
    message: string;
    sender: Types.ObjectId;
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
        type: Schema.Types.ObjectId,
        ref: 'User',
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
