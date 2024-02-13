import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'agent' | 'admin';
    isAdmin: boolean;
    agentId?: mongoose.Types.ObjectId;
    favoriteList?: mongoose.Types.ObjectId;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'agent', 'admin'], required: true, default: 'user' },
    isAdmin: { type: Boolean, default: false },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    favoriteList: { type: mongoose.Types.ObjectId, ref: 'FavoriteList' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
})

export default mongoose.model<UserDocument>('User', userSchema);
