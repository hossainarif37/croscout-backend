import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'agent';
    agentId?: mongoose.Types.ObjectId; // Optional field for linking to an Agent document
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'agent'], required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' }, // Link to Agent document
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

export default mongoose.model<UserDocument>('User', userSchema);
