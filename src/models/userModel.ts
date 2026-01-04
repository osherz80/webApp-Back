import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    refreshTokens: string[];
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshTokens: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;
