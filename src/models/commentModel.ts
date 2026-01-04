import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
    message: string;
    sender: string;
    postId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

const commentModel = mongoose.model<IComment>('Comment', commentSchema);

export default commentModel;
